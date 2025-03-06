Database setup:

make sure you have virtuous api set as environmental variable named VIRTUOUS_TOKN
make sure you have the right connection to the mysql server

Go to Virtuous -> Marketing -> Campaigns -> Segments -> Actions -> Download -> Select (ID, CODE, NAME) -> Download
    Make sure to click the fields in that order so they are in that order in the downloaded csv file
Go to Virtuous -> Marketing -> Campaigns -> Actions -> Download -> Select (ID, SEGMENT NAME) -> Download
    Make sure to click the fields in that order so they are in that order in the downloaded csv file
Download this query: https://app.virtuoussoftware.com/Generosity/Query/Editor/5507
Download this query: https://app.virtuoussoftware.com/Generosity/Query/Editor/5510
Download this query: https://app.virtuoussoftware.com/Generosity/Query/Editor/5509

move downloaded files to src/database/virtuous_exports

Campaign ID == 0 means that it is an archived campaign

When creating the database in the fix segment function if there is a segment that doesn't match to a gift in the last 5 years it is skipped and not added to the local database 

It will take atleast an hour to run the create_database script
The get communication function contains commented code
    some of it is there for testing purposes as running the function take about 600 api calls
    So if you need to test it uncomment the code that saves it to a json file 
    run it and save it
    then comment everything except for the code that reads the json file and returns it
    It also contains code that can do all of this in one query however Virtuous API is broken so it won't work
        if it works in the future it might be worth updating this

Create LOCAL_DB_MIKE_PSWD, LOCAL_DB_HOST_IP environmental variables