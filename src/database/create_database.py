import mysql.connector
import requests, os
from decimal import Decimal
from datetime import datetime
import json

TAG_ENDPOINT = "https://api.virtuoussoftware.com/api/Tag?skip=0&take=1000"
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
    cursor.execute("SELECT * FROM tags LIMIT 3;")
    print("Tags:", cursor.fetchall())

# Reads the Virtuous exports and returns the data
def read_virtuous_exports():
    # Import segment data
    try:
        with open("virtuous_exports/Segment Export.csv", 'r') as f:
            f.readline()
            segment_data = f.readlines()
    except FileNotFoundError:
        with open("src/database/virtuous_exports/Segment Export.csv", 'r') as f:
            f.readline()
            segment_data = f.readlines()
    segment_data = [line.strip().split(',') for line in segment_data]
    segment_data = [[col.strip('"') for col in row] for row in segment_data]
    segment_data = [[int(line[0])] + line[1:] for line in segment_data]

    # Import campaign data
    try:
        with open("virtuous_exports/Campaign Export.csv", 'r') as f:
            f.readline()
            campaign_data = f.readlines()
    except FileNotFoundError:
        with open("src/database/virtuous_exports/Campaign Export.csv", 'r') as f:
            f.readline()
            campaign_data = f.readlines()
    campaign_data = [line.strip().split(',') for line in campaign_data]
    campaign_data = [[col.strip('"') for col in row] for row in campaign_data]
    campaign_data = [[int(line[0])] + line[1:] for line in campaign_data]
    campaign_data.insert(0, [0, 'Archived Campaign'])

    # Import gift data
    try:
        with open("virtuous_exports/All Gifts.csv", 'r') as f:
            f.readline()
            gift_data = f.readlines()
    except FileNotFoundError:
        with open("src/database/virtuous_exports/All Gifts.csv", 'r') as f:
            f.readline()
            gift_data = f.readlines()
    gift_data = [line.strip().split(',') for line in gift_data]
    gift_data = [[col.strip('"') for col in row] for row in gift_data]
    gift_data = [
        [int(line[0])] + 
        [Decimal(line[1])] + 
        [line[2]] +
        [datetime.strptime(line[3], "%m/%d/%Y").strftime('%Y-%m-%d')] + 
        [int(line[4])] + 
        [None if line[5] == '' else int(line[5])] +
        line[6:] for line in gift_data
        ]
    return segment_data, campaign_data, gift_data

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

    return new_segment_data

# Gets the communications for each campaign (see comments for more info)
def get_communications(campaign_data):
    # Code 500. If virtuous fixes their api then use this code but for now it is broken
    # url = "https://api.virtuoussoftware.com/api/Communication/Query?skip=0&take=1000"
    # data = {"groups": []}
    # for campaign in campaign_data:
    #     data["groups"].append({"conditions": [{"parameter": "Campaign Id", "operator": "Is", "value": str(campaign[0])}]})
    # response = requests.post(url, data=json.dumps(data), headers=HEADERS).json()
    
    # Once used just load from the file to not run up the rate limit
    # first = True
    # for campaign in campaign_data:
    #     print(f"{campaign[0]}", end="\r")
    #     if first:
    #         first = False
    #         campaign.append([])
    #         continue
    #     url = f"https://api.virtuoussoftware.com/api/Communication/ByCampaign/{campaign[0]}?skip=0&take=100"
    #     response = requests.get(url, headers=HEADERS).json()
    #     total = response['total']
    #     campaign.append(response['list'])
    #     if total <= 100:
    #         continue
    #     cur_total = 100
    #     while cur_total < total:
    #         url = f"https://api.virtuoussoftware.com/api/Communication/ByCampaign/{campaign[0]}?skip={cur_total}&take=100"
    #         response = requests.get(url, headers=HEADERS).json()
    #         campaign[2] += response['list']
    #         cur_total += 100

    # with open("temp_communications2.json", 'w') as f:
    #     json.dump(campaign_data, f)

    # with open("temp_communications.json", 'w') as f:
    #     json.dump(campaign_data, f)

    with open("temp_communications2.json", "r") as file:
        loaded_data = json.load(file)
    return loaded_data
    

if __name__ == "__main__":
    # conn = mysql.connector.connect(
    #     host="localhost",  # "100.93.36.64",
    #     user="mike",
    #     password="Bigfoot22!",
    #     database="VirtuousDB"
    # )
    # cursor = conn.cursor()

    # create_tables()
    # insert_tags()
    
    segment_data, campaign_data, gift_data = read_virtuous_exports()
    segment_data = fix_segments(segment_data, campaign_data, gift_data)
    communication_data = get_communications(campaign_data)

    # conn.commit()
    # cursor.close()
    # conn.close()


    # segments export gives ("Segment Id","Segment Code","Segment Name")
    # gifts export gifts (Gift Id, Amount, Type, Date, ContactID, IndividualID, Segment Code)
    # extras from gifts (campaign comm name, campaign name)
