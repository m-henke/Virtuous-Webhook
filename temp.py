import requests
import os, json


if __name__ == "__main__":
    # url = "https://api.virtuoussoftware.com/api/Gift/1"
    # response = requests.get(url, headers={'Authorization': f'Bearer {os.getenv("VIRTUOUS_TOKN")}'})
    # gift_keys = sorted(list(dict(response.json()).keys()))
    # for gift in gift_keys:
    #     print(gift)
    # gift_dict = dict(response.json())
    # print()
    # print(gift_dict['segment'])
    # print(gift_dict['segmentCode'])
    # print(gift_dict['segmentId'])
    # print(dict(response.json())['segmentUrl']) /api/Segment/3164

    # url = "https://api.virtuoussoftware.com/api/Segment/3164"
    # response = requests.get(url, headers={'Authorization': f'Bearer {os.getenv("VIRTUOUS_TOKN")}'})
    # segment_keys = sorted(list(dict(response.json()).keys()))
    # for segment in segment_keys:
    #     print(segment)
    # segment_dict = dict(response.json())
    # print(segment_dict['communicationId'])

    # url = "https://api.virtuoussoftware.com/api/Campaign/6"
    # response = requests.get(url, headers={'Authorization': f'Bearer {os.getenv("VIRTUOUS_TOKN")}'})
    # campaign_keys = sorted(list(dict(response.json()).keys()))
    # for campaign in campaign_keys:
    #     print(campaign)

    # url = "https://api.virtuoussoftware.com/api/Communication/3130"
    # response = requests.get(url, headers={'Authorization': f'Bearer {os.getenv("VIRTUOUS_TOKN")}'})
    # comm_keys = sorted(list(dict(response.json()).keys()))
    # for comm in comm_keys:
    #     print(comm)

    # url = "https://api.virtuoussoftware.com/api/Communication/ByCampaign/6"
    # response = requests.get(url, headers={'Authorization': f'Bearer {os.getenv("VIRTUOUS_TOKN")}'})
    # keys = sorted(dict(response.json())['list'])
    # for key in keys:
    #     print(key)

    # url = "https://api.virtuoussoftware.com/api/Contact/158450"
    # response = requests.get(url, headers={'Authorization': f'Bearer {os.getenv("VIRTUOUS_TOKN")}'})
    # data = response.json()
    # print()

    # url = "https://api.virtuoussoftware.com/api/Campaign/Query?skip=0&take=999"
    # data = {
    #     "groups": [
    #         {
    #             "conditions": [
    #                 {
    #                     "parameter": "Campaign Id",
    #                     "operator": "GreaterThanOrEqual",
    #                     "value": "1"
    #                 }
    #             ]
    #         }
    #     ]
    # }
    # response = requests.post(url, data=json.dumps(data), headers={'Authorization': f'Bearer {os.getenv("VIRTUOUS_TOKN")}'})
    # data = response.json()
    # print()

    # data = {
    #     "groups": [
    #         {
    #             "conditions": [
    #                 {
    #                     "parameter": "type",
    #                     "operator": "Is",
    #                     "value": "Call"
    #                 }
    #             ]
    #         }
    #     ]
    # }
    # url = "https://api.virtuoussoftware.com/api/Task/Query?skip=0&take=5"
    # response = requests.post(url, data=json.dumps(data), headers={'Authorization': f'Bearer {os.getenv("VIRTUOUS_TOKN")}'})
    # print()

    url = "https://api.virtuoussoftware.com/api/OrganizationGroup?take=1000"
    response = requests.get(url, headers={'Authorization': f'Bearer {os.getenv("VIRTUOUS_TOKN")}'}).json()
    print()

    # url = "https://api.virtuoussoftware.com/api/Campaign/QueryOptions"
    # response = requests.get(url, headers={'Authorization': f'Bearer {os.getenv("VIRTUOUS_TOKN")}'})
    # print(response.json())

# {'options': [{'parameter': 'Campaign Id', 'type': 'Int', 'operatorOptions': [{'operator': 'Is', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'LessThan', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'LessThanOrEqual', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'GreaterThan', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'GreaterThanOrEqual', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'Between', 'multipleValuesAllowed': False, 'valueRequired': True}], 'valueOptions': []}, {'parameter': 'Name', 'type': 'String', 'operatorOptions': [{'operator': 'Is', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'Contains', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'StartsWith', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'EndsWith', 'multipleValuesAllowed': False, 'valueRequired': True}], 'valueOptions': []}, {'parameter': 'Description', 'type': 'String', 'operatorOptions': [{'operator': 'Is', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'IsKnown', 'multipleValuesAllowed': False, 'valueRequired': False}, {'operator': 'IsNotKnown', 'multipleValuesAllowed': False, 'valueRequired': False}, {'operator': 'Contains', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'StartsWith', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'EndsWith', 'multipleValuesAllowed': False, 'valueRequired': True}], 'valueOptions': []}, {'parameter': 'Create Date', 'type': 'Date', 'operatorOptions': [{'operator': 'Is', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'LessThan', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'LessThanOrEqual', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'Before', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'OnOrBefore', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'GreaterThan', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'GreaterThanOrEqual', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'After', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'OnOrAfter', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'Between', 'multipleValuesAllowed': False, 'valueRequired': True}], 'valueOptions': ['Today', 'Yesterday', 'Last Sunday', 'Last Month', 'Last Fiscal Year', 'Start Of This Month', '7 Days Ago', '30 Days Ago', '60 Days Ago', '90 Days Ago', '180 Days Ago', '270 Days Ago', 'One Year Ago', 'This Calendar Year', 'Two Years Ago', 'Tomorrow', 'One week from now', '30 Days from now', '60 Days from now', '90 Days from now']}, {'parameter': 'Last Modified Date', 'type': 'Date', 'operatorOptions': [{'operator': 'Is', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'LessThan', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'LessThanOrEqual', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'Before', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'OnOrBefore', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'GreaterThan', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'GreaterThanOrEqual', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'After', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'OnOrAfter', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'Between', 'multipleValuesAllowed': False, 'valueRequired': True}], 'valueOptions': ['Today', 'Yesterday', 'Last Sunday', 'Last Month', 'Last Fiscal Year', 'Start Of This Month', '7 Days Ago', '30 Days Ago', '60 Days Ago', '90 Days Ago', '180 Days Ago', '270 Days Ago', 'One Year Ago', 'This Calendar Year', 'Two Years Ago', 'Tomorrow', 'One week from now', '30 Days from now', '60 Days from now', '90 Days from now']}, {'parameter': 'Start Date', 'type': 'Date', 'operatorOptions': [{'operator': 'Is', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'LessThan', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'LessThanOrEqual', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'Before', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'OnOrBefore', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'GreaterThan', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'GreaterThanOrEqual', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'After', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'OnOrAfter', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'Between', 'multipleValuesAllowed': False, 'valueRequired': True}], 'valueOptions': ['Today', 'Yesterday', 'Last Sunday', 'Last Month', 'Last Fiscal Year', 'Start Of This Month', '7 Days Ago', '30 Days Ago', '60 Days Ago', '90 Days Ago', '180 Days Ago', '270 Days Ago', 'One Year Ago', 'This Calendar Year', 'Two Years Ago', 'Tomorrow', 'One week from now', '30 Days from now', '60 Days from now', '90 Days from now']}, {'parameter': 'End Date', 'type': 'Date', 'operatorOptions': [{'operator': 'Is', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'LessThan', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'LessThanOrEqual', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'Before', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'OnOrBefore', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'GreaterThan', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'GreaterThanOrEqual', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'After', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'OnOrAfter', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'Between', 'multipleValuesAllowed': False, 'valueRequired': True}], 'valueOptions': ['Today', 'Yesterday', 'Last Sunday', 'Last Month', 'Last Fiscal Year', 'Start Of This Month', '7 Days Ago', '30 Days Ago', '60 Days Ago', '90 Days Ago', '180 Days Ago', '270 Days Ago', 'One Year Ago', 'This Calendar Year', 'Two Years Ago', 'Tomorrow', 'One week from now', '30 Days from now', '60 Days from now', '90 Days from now']}, {'parameter': 'Giving Goal', 'type': 'Decimal', 'operatorOptions': [{'operator': 'Is', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'LessThan', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'LessThanOrEqual', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'GreaterThan', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'GreaterThanOrEqual', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'Between', 'multipleValuesAllowed': False, 'valueRequired': True}], 'valueOptions': []}, {'parameter': 'New Giver Goal', 'type': 'Int', 'operatorOptions': [{'operator': 'Is', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'LessThan', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'LessThanOrEqual', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'GreaterThan', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'GreaterThanOrEqual', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'Between', 'multipleValuesAllowed': False, 'valueRequired': True}], 'valueOptions': []}, {'parameter': 'Total Gift Goal', 'type': 'Int', 'operatorOptions': [{'operator': 'Is', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'LessThan', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'LessThanOrEqual', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'GreaterThan', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'GreaterThanOrEqual', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'Between', 'multipleValuesAllowed': False, 'valueRequired': True}], 'valueOptions': []}, {'parameter': 'Communication Name', 'type': 'String', 'operatorOptions': [{'operator': 'Is', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'Contains', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'StartsWith', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'EndsWith', 'multipleValuesAllowed': False, 'valueRequired': True}], 'valueOptions': []}, {'parameter': 'Communication Channel', 'type': 'String', 'operatorOptions': [{'operator': 'Is', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'Contains', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'StartsWith', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'EndsWith', 'multipleValuesAllowed': False, 'valueRequired': True}], 'valueOptions': []}, {'parameter': 'Segment Name', 'type': 'Lookup', 'operatorOptions': [{'operator': 'Is', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'Contains', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'StartsWith', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'EndsWith', 'multipleValuesAllowed': False, 'valueRequired': True}], 'valueOptions': []}, {'parameter': 'Segment Code', 'type': 'Lookup', 'operatorOptions': [{'operator': 'Is', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'Contains', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'StartsWith', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'EndsWith', 'multipleValuesAllowed': False, 'valueRequired': True}], 'valueOptions': []}], 'operatorOptions': [{'operator': 'Is', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'IsNot', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'IsKnown', 'multipleValuesAllowed': False, 'valueRequired': False}, {'operator': 'IsNotKnown', 'multipleValuesAllowed': False, 'valueRequired': False}, {'operator': 'LessThan', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'LessThanOrEqual', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'GreaterThan', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'GreaterThanOrEqual', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'Contains', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'StartsWith', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'EndsWith', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'IsTrue', 'multipleValuesAllowed': False, 'valueRequired': False}, {'operator': 'IsFalse', 'multipleValuesAllowed': False, 'valueRequired': False}, {'operator': 'IsSet', 'multipleValuesAllowed': False, 'valueRequired': False}, {'operator': 'IsNotSet', 'multipleValuesAllowed': False, 'valueRequired': False}, {'operator': 'In', 'multipleValuesAllowed': True, 'valueRequired': True}, {'operator': 'NotIn', 'multipleValuesAllowed': True, 'valueRequired': True}, {'operator': 'Between', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'Before', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'After', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'IsAnyOf', 'multipleValuesAllowed': True, 'valueRequired': True}, {'operator': 'IsNoneOf', 'multipleValuesAllowed': True, 'valueRequired': True}, {'operator': 'Matches', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'OnOrBefore', 'multipleValuesAllowed': False, 'valueRequired': True}, {'operator': 'OnOrAfter', 'multipleValuesAllowed': False, 'valueRequired': True}]}