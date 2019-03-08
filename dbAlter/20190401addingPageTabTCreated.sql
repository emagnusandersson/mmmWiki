
ALTER TABLE mmm.mmmWiki_page ADD COLUMN tCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER nImage;

UPDATE mmm.mmmWiki_pageLastSlim SET tCreated=tMod;

-- Set back

ALTER TABLE mmm.mmmWiki_page DROP COLUMN tCreated;





