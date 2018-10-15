
ALTER TABLE mmm.mmmWiki_page CHANGE COLUMN nChild nChild int(4) NOT NULL DEFAULT 0;
ALTER TABLE mmm.mmmWiki_page CHANGE COLUMN nImage nImage int(4) NOT NULL DEFAULT 0;

-- Set back

ALTER TABLE mmm.mmmWiki_page CHANGE COLUMN nChild nChild int(4) NOT NULL;
ALTER TABLE mmm.mmmWiki_page CHANGE COLUMN nImage nImage int(4) NOT NULL;





