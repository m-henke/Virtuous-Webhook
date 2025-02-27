CREATE TABLE contacts (
  ContactID INT PRIMARY KEY NOT NULL,
  ContactName VARCHAR(255) NOT NULL,
  ContactType VARCHAR(25) NOT NULL,
  LastGiftAmount DECIMAL(10, 2),
  LastGiftDate DATE
);

CREATE TABLE individuals (
  IndividualID INT PRIMARY KEY NOT NULL,
  ContactID INT NOT NULL,
  FirstName VARCHAR(100) NOT NULL,
  LastName VARCHAR(100) NOT NULL,
  PhoneNumber VARCHAR(10),
  Email VARCHAR(255),
  FOREIGN KEY (ContactID) REFERENCES contacts (ContactID) ON DELETE CASCADE
);

CREATE TABLE campaigns (
  CampaignID INT PRIMARY KEY NOT NULL,
  CampaignName VARCHAR(100) NOT NULL
);

CREATE TABLE communications (
  CommunicationID INT PRIMARY KEY NOT NULL,
  CommunicationName VARCHAR(100) NOT NULL,
  ChannelType VARCHAR(100) NOT NULL,
  CampaignID INT NOT NULL,
  FOREIGN KEY (CampaignID) REFERENCES campaigns (CampaignID)
);

CREATE TABLE segments (
  SegmentID INT PRIMARY KEY NOT NULL,
  SegmentCode VARCHAR(50) NOT NULL,
  SegmentName VARCHAR(100) NOT NULL,
  CampaignID INT NOT NULL,
  FOREIGN KEY (CampaignID) REFERENCES campaigns (CampaignID)
);

CREATE INDEX idx_segment_code ON segments (SegmentCode);

CREATE TABLE gifts (
  GiftID INT PRIMARY KEY NOT NULL,
  Amount DECIMAL(10, 2) NOT NULL,
  GiftType VARCHAR(50) NOT NULL,
  GiftDate DATE NOT NULL,
  ContactID INT NOT NULL,
  IndividualID INT,
  SegmentCode VARCHAR(50) NOT NULL,
  FOREIGN KEY (ContactID) REFERENCES contacts (ContactID),
  FOREIGN KEY (IndividualID) REFERENCES individuals (IndividualID),
  FOREIGN KEY (SegmentCode) REFERENCES segments (SegmentCode)
);

CREATE TABLE tags (
  TagID INT PRIMARY KEY NOT NULL,
  TagName VARCHAR(50) NOT NULL
);

CREATE TABLE contact_tags (
  ContactID INT NOT NULL,
  TagID INT NOT NULL,
  PRIMARY KEY (ContactID, TagID),
  FOREIGN KEY (ContactID) REFERENCES contacts (ContactID),
  FOREIGN KEY (TagID) REFERENCES tags (TagID)
);

CREATE TABLE org_groups (
  OrgGroupID INT PRIMARY KEY NOT NULL,
  OrgGroupName VARCHAR(100) NOT NULL
);

CREATE TABLE contact_org_groups (
  ContactID INT NOT NULL,
  OrgGroupID INT NOT NULL,
  PRIMARY KEY (ContactID, OrgGroupID),
  FOREIGN KEY (ContactID) REFERENCES contacts (ContactID),
  FOREIGN KEY (OrgGroupID) REFERENCES org_groups (OrgGroupID)
);

CREATE TABLE org_group_history (
  ID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  ContactID INT NOT NULL,
  OrgGroupID INT NOT NULL,
  DateAdded DATE NOT NULL,
  DateRemoved DATE
);

CREATE TABLE tag_history (
  ID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  ContactID INT NOT NULL,
  TagID INT NOT NULL,
  DateAdded DATE NOT NULL,
  DateRemoved DATE
);