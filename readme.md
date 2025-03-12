# Virtuous Webhook

## Overview

This project maintains a local MySQL database by automatically updating it using webhooks from Virtuous. The database is populated with data related to contacts, gifts, campaigns, segments, communications, tags, and organization groups.

## Prerequisites
- Node.js
- Python
- MySQL Server
- Virtuous API Credentials

## Setup

### Environmental Variables
- `VIRTUOUS_TOKN`: Your Virtuous API token
- `LOCAL_DB_HOST_IP`: The IP addres of the MySQL server (most likely localhost)
- `LOCAL_DB_USER`: Username for user with full privileges on the database
- `LOCAL_DB_PSWD`: Password for the same user
- `TEAMS_WEBHOOK`: The webhook URL for Microsoft Teams Notifications

### Installing Dependencies
1) Open the terminal to `Virtuous-Webhook`
2) Enter this command: `npm install`
3) Enter this command: `pip install requests mysql-connector-python`

### Database setup
1) Go to `Virtuous -> Marketing -> Campaigns -> Segments -> Actions -> Download -> Select (ID, CODE, NAME) -> Download`
    - Make sure to click the fields in that order so they are in that order in the downloaded csv file
2) Go to `Virtuous -> Marketing -> Campaigns -> Actions -> Download -> Select (ID, SEGMENT NAME) -> Download`
    - Make sure to click the fields in that order so they are in that order in the downloaded csv file
3) Download this query: [All Gifts](https://app.virtuoussoftware.com/Generosity/Query/Editor/5507)
4) Download this query: [All Individuals](https://app.virtuoussoftware.com/Generosity/Query/Editor/5510)
5) Download this query: [All Contacts](https://app.virtuoussoftware.com/Generosity/Query/Editor/5509)
6) Move downloaded files to `src/database/virtuous_exports`
7) Open the terminal to `Virtuous-Webhook`
8) Enter this command: `python3 src/database/create_database.py`

## Notes
- [Datebase Schema](https://dbdiagram.io/d/Local-Virtuous-Database-67bde7df263d6cf9a06b7d20)
- Campaign ID == 0 means that it is an archived campaign
- When creating the database in the fix segment function if there is a segment that doesn't match to a gift in the last 5 years it is skipped and not added to the local database 
- It will take atleast an hour to run the create_database script
- After creating the database it is worth checking to make sure no webhooks were sent during that time
-The get communication function contains commented code
    - some of it is there for testing purposes as running the function take about 600 api calls
    - So if you need to test it uncomment the code that saves it to a json file 
    - run it and save it
    - then comment everything except for the code that reads the json file and returns it
    - It also contains code that can do all of this in one query however Virtuous API is broken so it won't work
        - if it works in the future it might be worth updating this

## Author
#### Michael Henke
