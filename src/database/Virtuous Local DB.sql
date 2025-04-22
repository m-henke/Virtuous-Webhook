CREATE TABLE IF NOT EXISTS contacts (
  ContactID INT PRIMARY KEY NOT NULL,
  ContactName VARCHAR(255) NOT NULL,
  ContactType VARCHAR(25) NOT NULL,
  LastGiftAmount DECIMAL(10, 2),
  LastGiftDate DATE
);

CREATE TABLE IF NOT EXISTS individuals (
  IndividualID INT PRIMARY KEY NOT NULL,
  ContactID INT NOT NULL,
  FirstName VARCHAR(100) NOT NULL,
  LastName VARCHAR(100) NOT NULL,
  PhoneNumber VARCHAR(10),
  Email VARCHAR(255),
  FOREIGN KEY (ContactID) REFERENCES contacts (ContactID) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS campaigns (
  CampaignID INT PRIMARY KEY NOT NULL,
  CampaignName VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS communications (
  CommunicationID INT PRIMARY KEY NOT NULL,
  CommunicationName VARCHAR(100) NOT NULL,
  ChannelType VARCHAR(100) NOT NULL,
  CampaignID INT NOT NULL,
  FOREIGN KEY (CampaignID) REFERENCES campaigns (CampaignID)
);

CREATE TABLE IF NOT EXISTS segments (
  SegmentID INT PRIMARY KEY NOT NULL,
  SegmentCode VARCHAR(50) NOT NULL,
  SegmentName VARCHAR(100) NOT NULL,
  CampaignID INT NOT NULL,
  FOREIGN KEY (CampaignID) REFERENCES campaigns (CampaignID)
);

CREATE INDEX idx_segment_code ON segments (SegmentCode);

CREATE TABLE IF NOT EXISTS gifts (
  GiftID INT PRIMARY KEY NOT NULL,
  Amount DECIMAL(10, 2) NOT NULL,
  GiftType VARCHAR(50) NOT NULL,
  GiftDate DATE NOT NULL,
  ContactID INT NOT NULL,
  IndividualID INT,
  SegmentCode VARCHAR(50),
  CommunicationName VARCHAR(100),
  ReceiptStatus VARCHAR(25),
  UTMCampaign TEXT,
  FOREIGN KEY (ContactID) REFERENCES contacts (ContactID),
  FOREIGN KEY (IndividualID) REFERENCES individuals (IndividualID),
  FOREIGN KEY (SegmentCode) REFERENCES segments (SegmentCode)
);

CREATE TABLE IF NOT EXISTS tags (
  TagID INT PRIMARY KEY NOT NULL,
  TagName VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_tags (
  ContactID INT NOT NULL,
  TagID INT NOT NULL,
  PRIMARY KEY (ContactID, TagID),
  FOREIGN KEY (ContactID) REFERENCES contacts (ContactID),
  FOREIGN KEY (TagID) REFERENCES tags (TagID)
);

CREATE TABLE IF NOT EXISTS org_groups (
  OrgGroupID INT PRIMARY KEY NOT NULL,
  OrgGroupName VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS contact_org_groups (
  ContactID INT NOT NULL,
  OrgGroupID INT NOT NULL,
  PRIMARY KEY (ContactID, OrgGroupID),
  FOREIGN KEY (ContactID) REFERENCES contacts (ContactID),
  FOREIGN KEY (OrgGroupID) REFERENCES org_groups (OrgGroupID)
);

CREATE TABLE IF NOT EXISTS org_group_history (
  ID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  ContactID INT NOT NULL,
  OrgGroupID INT NOT NULL,
  DateAdded DATE NOT NULL,
  DateRemoved DATE
);

CREATE TABLE IF NOT EXISTS tag_history (
  ID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  ContactID INT NOT NULL,
  TagID INT NOT NULL,
  DateAdded DATE NOT NULL,
  DateRemoved DATE
);

CREATE TABLE IF NOT EXISTS newsletter_costs (
  ID INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  NewsletterYear INT NOT NULL,
  Season VARCHAR(6),
  Cost DECIMAL(10, 2) NOT NULL,
  Goal DECIMAL(10, 2) NOT NULL,
  ContactsMailed INT NOT NULL
);