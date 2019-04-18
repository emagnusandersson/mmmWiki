

ALTER TABLE mmm.mmmWiki_page 
  ADD COLUMN size int(4) NOT NULL DEFAULT 0 AFTER nParent,
  ADD COLUMN tModCache TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER nParent,
  ADD COLUMN tMod TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER nParent,
  ADD COLUMN boOther TINYINT(1) NOT NULL DEFAULT 0 AFTER nParent;

  
UPDATE mmmWiki_page p JOIN mmmWiki_version v ON p.idPage=v.idPage AND p.lastRev=v.rev SET p.boOther=v.boOther, p.tMod=v.tMod, p.tModCache=v.tModCache, p.size=v.size;

-- Set back

ALTER TABLE mmmWiki_page DROP COLUMN boOther;
ALTER TABLE mmmWiki_page DROP COLUMN tMod;
ALTER TABLE mmmWiki_page DROP COLUMN tModCache;
ALTER TABLE mmmWiki_page DROP COLUMN size;


