Database setup:

make sure you have virtuous api set as environmental variable named VIRTUOUS_TOKN
make sure you have the right connection to the mysql server

Go to Virtuous -> Marketing -> Campaigns -> Segments -> Actions -> Download -> Select (ID, CODE, NAME) -> Download
    Make sure to click the fields in that order so they are in that order in the downloaded csv file
Go to Virtuous -> Marketing -> Campaigns -> Actions -> Download -> Select (ID, SEGMENT NAME) -> Download
    Make sure to click the fields in that order so they are in that order in the downloaded csv file
Download this query: https://app.virtuoussoftware.com/Generosity/Query/Editor/5507

move downloaded files to src/database/virtuous_exports

Campaign ID == 0 means that it is an archived campaign

When creating the database in the fix segment function if there is a segment that doesn't match to a gift in the last 5 years it is skipped and not added to the local database 