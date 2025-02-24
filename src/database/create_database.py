import mysql.connector
import requests, os

TAG_ENDPOINT = "https://api.virtuoussoftware.com/api/Tag?skip=0&take=1000"
HEADERS = {
    'Authorization': f'Bearer {os.getenv("VIRTUOUS_TOKN")}'
}

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


if __name__ == "__main__":
    conn = mysql.connector.connect(
        host="localhost",  # "100.93.36.64",
        user="mike",
        password="Bigfoot22!",
        database="VirtuousDB"
    )
    cursor = conn.cursor()

    create_tables()
    insert_tags()

    conn.commit()
    cursor.close()
    conn.close()
