import mysql.connector
import requests, os
from decimal import Decimal
from datetime import datetime

TAG_ENDPOINT = "https://api.virtuoussoftware.com/api/Tag?skip=0&take=1000"
ORG_GROUP_ENDPOINT = "https://api.virtuoussoftware.com/api/OrganizationGroup?take=1000"
HEADERS = {
    'Authorization': f'Bearer {os.getenv("VIRTUOUS_TOKN")}'
}

# Create the database and tables
def create_tables():
    # delete and recreate database
    cursor.execute("DROP DATABASE IF EXISTS VirtuousDB;")
    cursor.execute("CREATE DATABASE IF NOT EXISTS VirtuousDB;")
    cursor.execute("USE VirtuousDB;")

    # read table creation commands
    try:
        with open("Virtuous Local DB.sql", 'r') as f:
            table_commands = [command.strip() for command in f.read().split(';')]
    except FileNotFoundError:
        with open("src/database/Virtuous Local DB.sql", 'r') as f:
            table_commands = [command.strip() for command in f.read().split(';')]
    table_commands = [command for command in table_commands if command != '']

    # create the tables
    for command in table_commands:
        cursor.execute(command)

    # print results
    cursor.execute("SELECT DATABASE();")
    print("Databases:", cursor.fetchall())

    cursor.execute("SHOW TABLES;")
    print("Tables:", cursor.fetchall())

# Download and insert tags from Virtuous API
def insert_tags():
    print("Pulling tags from Virtuous API")
    response = requests.get(TAG_ENDPOINT, headers=HEADERS).json()['list']
    tags = [[line['id'], line['tagName']] for line in response]
    query = """
        INSERT INTO tags(
            TagID,
            TagName
        )
        VALUES(%s, %s);
    """
    cursor.executemany(query, tags)
    print("Tags inserted")

# Download and insert org groups from Virtuous API
def insert_org_groups():
    print("Pulling org groups from Virtuous API")
    response = requests.get(ORG_GROUP_ENDPOINT, headers=HEADERS).json()['list']
    org_groups = [[line['id'], line['name']] for line in response]
    query = """
        INSERT INTO org_groups(
            OrgGroupID,
            OrgGroupName
        )
        VALUES(%s, %s);
    """
    cursor.executemany(query, org_groups)
    print("Org groups inserted")

# Reads and formats the Virtuous exports and returns the data
def read_virtuous_exports():
    # Helper function for read_virtuous_exports 
    def get_csv_file(filename):
        print("Reading:", filename)
        try:
            with open(f"virtuous_exports/{filename}", 'r', encoding='utf-8') as f:
                f.readline()
                return_data = f.readlines()
        except FileNotFoundError:
            with open(f"src/database/virtuous_exports/{filename}", 'r', encoding='utf-8') as f:
                f.readline()
                return_data = f.readlines()
        return_data = [line.strip().split('","') for line in return_data]
        return_data = [[col.strip('"') for col in row] for row in return_data]
        return return_data

    # Helper function for read_virtuous_exports
    def format_phone_number(individual):
        phone_number = individual[4]
        # Too short to be a full number
        if len(phone_number) < 10:
            return None
        # Remove country code
        if phone_number[:2] == "+1":
            phone_number = phone_number[2:]
        # Remove unnescary characters
        replace_list = ["(", ")", "-", " ", ".", "+", "\n"]
        for character in replace_list:
            phone_number = phone_number.replace(character, "")
        # Remove trailing extension
        if len(phone_number) > 10 and phone_number[10].lower() == "e":
            phone_number = phone_number[:10]
        # All formatting is done and it's not the rigth length
        if len(phone_number) != 10:
            return None
        # Contains non digit characters
        if not phone_number.isdigit():
            return None
        return phone_number
    
    # Helper function for read_virtuous_exports
    def format_date(date):
        return None if date == "" else datetime.strptime(date, "%m/%d/%Y").strftime("%Y-%m-%d")

    # Import segment data
    segment_data = get_csv_file("Segment Export.csv")
    segment_data = [[int(line[0])] + line[1:] for line in segment_data]
    print("Segment data imported")

    # Import campaign data
    campaign_data = get_csv_file("Campaign Export.csv")
    campaign_data = [[int(line[0])] + line[1:] for line in campaign_data]
    campaign_data.insert(0, [0, 'Archived Campaign'])
    print("Campaign data imported")

    # Import gift data
    gift_data = get_csv_file("All Gifts.csv")
    gift_data = [
        [int(line[0])] + 
        [Decimal(line[1])] + 
        [line[2]] +
        [format_date(line[3])] + 
        [int(line[4])] + 
        [None if line[5] == '' else int(line[5])] +
        line[6:] for line in gift_data]
    print("Gift data imported")
    
    # Import individual data
    individual_data = get_csv_file("All Individuals.csv")
    individual_data = [[int(line[0])] + [int(line[1])] + line[2:] for line in individual_data]
    for individual in individual_data:
        individual[4] = format_phone_number(individual)
        if individual[5] == "":
            individual[5] = None
    print("Individual data imported")

    # Import contact data
    contact_data = get_csv_file("All Contacts.csv")
    contact_data = [
        [int(line[0])] + 
        [line[1]] +
        [line[2]] +
        [Decimal(line[3])] +
        [format_date(line[4])] +
        [line[5].split(';')] +
        [line[6].split(';')] for line in contact_data]
    print("Contact data imported")
    
    return segment_data, campaign_data, gift_data, individual_data, contact_data

# Adds the campaign ID to each segment and removes ones not used since 01/01/2020
def fix_segments(segment_data, campaign_data, gift_data):
    # Add the campaign ID to each gift based on the campaign name
    campaign_dict = {line[1]: line[0] for line in campaign_data}
    for line in gift_data:
        # If it isn't in there it returns 0 which stands for archived campaign
        line.append(campaign_dict.get(line[8], 0))

    # Get unique segment codes from gifts and map them to their corresponding campaign id
    unique_gift_segments = []
    gift_segment_dict = {}
    for gift in gift_data:
        if gift_segment_dict.get(gift[6], False) == False:
            unique_gift_segments.append(gift)
            gift_segment_dict[gift[6]] = gift[9]
    
    # Add campaign ID to segment data
    # If a segment doesn't match a gift from the last 5 years it is skipped
    new_segment_data = []
    for segment in segment_data:
        campaign_id = gift_segment_dict.get(segment[1], None)
        if campaign_id == None:
            continue
        new_segment_data.append(segment + [campaign_id])

    # Undo changes to gift data
    for line in gift_data:
        for i in range(3):
            line.pop()

    return new_segment_data

# Gets the communications for each campaign (see comments for more info)
def get_communications(campaign_data):
    print("Pulling communications from Virtuous API")

    # Code 500. If virtuous fixes their api then use this code but for now it is broken
    # url = "https://api.virtuoussoftware.com/api/Communication/Query?skip=0&take=1000"
    # data = {"groups": []}
    # for campaign in campaign_data:
    #     data["groups"].append({"conditions": [{"parameter": "Campaign Id", "operator": "Is", "value": str(campaign[0])}]})
    # response = requests.post(url, data=json.dumps(data), headers=HEADERS).json()
    
    # Once used just load from the file to not run up the rate limit
    first = True
    communication_data = []
    for campaign in campaign_data:
        print(f"{campaign[0]}", end="\r")
        if first:
            first = False
            continue
        url = f"https://api.virtuoussoftware.com/api/Communication/ByCampaign/{campaign[0]}?skip=0&take=100"
        response = requests.get(url, headers=HEADERS).json()
        total = response['total']
        communication_data.append(response['list'])
        if total <= 100:
            continue
        cur_total = 100
        while cur_total < total:
            url = f"https://api.virtuoussoftware.com/api/Communication/ByCampaign/{campaign[0]}?skip={cur_total}&take=100"
            response = requests.get(url, headers=HEADERS).json()
            communication_data[len(communication_data) - 1] += response['list']
            cur_total += 100
    print("Communications imported")

    # Saves the communication data for testing
    # with open("temp_communications.json", 'w') as f:
    #     json.dump(communication_data, f)

    # Loads the communication data for testing
    # with open("temp_communications.json", "r") as file:
    #     communication_data = json.load(file)

    return communication_data

# Removes unnecessary columns from the data
def fix_communications(communication_data):
    new_communication_data = []
    for communication in communication_data:
        for comm in communication:
            new_communication_data.append([comm['communicationId'], comm['name'], comm['channelType'], comm['campaignId']])
    return new_communication_data

# Inserts the data into the database
def insert_data(segment_data, campaign_data, gift_data, individual_data, contact_data, communication_data):
    insert_contacts_query = """
    INSERT INTO contacts (ContactID, ContactName, ContactType, LastGiftAmount, LastGiftDate) 
    VALUES (%s, %s, %s, %s, %s);
    """
    insert_individuals_query = """
    INSERT INTO individuals (IndividualID, ContactID, FirstName, LastName, PhoneNumber, Email) 
    VALUES (%s, %s, %s, %s, %s, %s);
    """
    insert_campaigns_query = """
    INSERT INTO campaigns (CampaignID, CampaignName) 
    VALUES (%s, %s);
    """
    insert_communications_query = """
    INSERT INTO communications (CommunicationID, CommunicationName, ChannelType, CampaignID) 
    VALUES (%s, %s, %s, %s);
    """
    insert_segments_query = """
    INSERT INTO segments (SegmentID, SegmentCode, SegmentName, CampaignID) 
    VALUES (%s, %s, %s, %s);
    """
    insert_gifts_query = """
    INSERT IGNORE INTO gifts (GiftID, Amount, GiftType, GiftDate, ContactID, IndividualID, SegmentCode) 
    VALUES (%s, %s, %s, %s, %s, %s, %s);
    """
    insert_contact_tag_query = """
    INSERT IGNORE INTO contact_tags (ContactID, TagID)
    VALUES (%s, %s);"""
    insert_contact_org_group_query = """
    INSERT IGNORE INTO contact_org_groups (ContactID, OrgGroupID)
    VALUES (%s, %s);"""

    tags = [line[6] for line in contact_data]
    org_groups = [line[5] for line in contact_data]
    contact_data = [line[:5] for line in contact_data]
    cursor.execute("SELECT * FROM tags;")
    tag_dict = {line[1]: line[0] for line in cursor.fetchall()}
    cursor.execute("SELECT * FROM org_groups;")
    org_group_dict = {line[1]: line[0] for line in cursor.fetchall()}

    cursor.executemany(insert_contacts_query, contact_data)
    print("Contacts inserted")
    cursor.executemany(insert_individuals_query, individual_data)
    print("Individuals inserted")
    cursor.executemany(insert_campaigns_query, campaign_data)
    print("Campaigns inserted")
    cursor.executemany(insert_communications_query, communication_data)
    print("Communications inserted")
    cursor.executemany(insert_segments_query, segment_data)
    print("Segments inserted")
    cursor.executemany(insert_gifts_query, gift_data)
    print("Gifts inserted")

    for i, contact in enumerate(contact_data):
        print(f"Tags/OrgGroups Inserted: {i + 1}/{len(contact_data)}", end="\r")
        try:
            if tags[i][0] != "":
                tag_insert = [[contact[0], tag_dict[tag]] for tag in tags[i]]
                cursor.executemany(insert_contact_tag_query, tag_insert)
        except KeyError:
            pass
        try:
            if org_groups[i][0] != "":
                org_group_insert = [[contact[0], org_group_dict[org_group]] for org_group in org_groups[i]]
                cursor.executemany(insert_contact_org_group_query, org_group_insert)
        except KeyError:
            pass

    print("\nTags and org groups inserted")
    print("Database created")

# Creates the org group history
def insert_org_group_history():
    cursor.execute("SELECT * FROM contact_org_groups;")
    data = [list(line) + ["2025-01-01", None] for line in cursor.fetchall()]
    cursor.executemany("INSERT INTO org_group_history (ContactID, OrgGroupID, DateAdded, DateRemoved) VALUES (%s, %s, %s, %s);", data)
    print("Org group history inserted")

# Creates the tag history
def insert_tag_history():
    cursor.execute("SELECT * FROM contact_tags;")
    data = [list(line) + ["2025-01-01", None] for line in cursor.fetchall()]
    cursor.executemany("INSERT INTO tag_history (ContactID, TagID, DateAdded, DateRemoved) VALUES (%s, %s, %s, %s);", data)
    print("Tag history inserted")


if __name__ == "__main__":
    conn = mysql.connector.connect(
        host="100.93.36.64",
        user="mike",
        password="Bigfoot22!",
        database="VirtuousDB"
    )
    cursor = conn.cursor()

    create_tables()
    insert_tags()
    insert_org_groups()
    
    segment_data, campaign_data, gift_data, individual_data, contact_data = read_virtuous_exports()
    segment_data = fix_segments(segment_data, campaign_data, gift_data)
    communication_data = get_communications(campaign_data)
    communication_data = fix_communications(communication_data)
    insert_data(segment_data, campaign_data, gift_data, individual_data, contact_data, communication_data)
    insert_org_group_history()
    insert_tag_history()

    conn.commit()
    cursor.close()
    conn.close()
