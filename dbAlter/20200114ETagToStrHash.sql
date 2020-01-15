ALTER TABLE mmm.mmmWiki_version CHANGE COLUMN eTag strHash varchar(32) NOT NULL;
ALTER TABLE mmm.mmmWiki_image CHANGE COLUMN eTag strHash varchar(32) NOT NULL;
ALTER TABLE mmm.mmmWiki_thumb CHANGE COLUMN eTag strHash varchar(32) NOT NULL;
ALTER TABLE mmm.mmmWiki_video CHANGE COLUMN eTag strHash varchar(32) NOT NULL;

-- Set back

ALTER TABLE mmm.mmmWiki_version CHANGE COLUMN strHash eTag varchar(32) NOT NULL;
ALTER TABLE mmm.mmmWiki_image CHANGE COLUMN strHash eTag varchar(32) NOT NULL;
ALTER TABLE mmm.mmmWiki_thumb CHANGE COLUMN strHash eTag varchar(32) NOT NULL;
ALTER TABLE mmm.mmmWiki_video CHANGE COLUMN strHash eTag varchar(32) NOT NULL;
