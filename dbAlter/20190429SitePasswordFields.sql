ALTER TABLE mmm.mmmWiki_site CHANGE COLUMN vPassword aRPassword varchar(128) NOT NULL DEFAULT '';
ALTER TABLE mmm.mmmWiki_site CHANGE COLUMN aPassword aWPassword varchar(128) NOT NULL DEFAULT '';

-- Set back

ALTER TABLE mmm.mmmWiki_site CHANGE COLUMN aRPassword vPassword varchar(128) NOT NULL DEFAULT '';
ALTER TABLE mmm.mmmWiki_site CHANGE COLUMN aWPassword aPassword varchar(128) NOT NULL DEFAULT '';
