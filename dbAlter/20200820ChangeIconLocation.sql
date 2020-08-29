-- siteTab-changes

ALTER TABLE mmmWiki_site CHANGE COLUMN urlIcon16 srcIcon16 varchar(64) NOT NULL;
UPDATE mmmWiki_site s SET srcIcon16=REGEXP_REPLACE(srcIcon16, "^lib/image/(.+)16(.+)", 'Site/\\116\\2');

UPDATE mmmWiki_site s SET urlIcon200='en';
ALTER TABLE mmmWiki_site CHANGE COLUMN urlIcon200 strLangSite varchar(11) NOT NULL;

-- pageTab changes: Add strLang column

ALTER TABLE mmm.mmmWiki_page ADD COLUMN strLang varchar(11) NOT NULL DEFAULT 'en' AFTER intPriority;


-- --------------------------------------------------------------------------------------------------
-- Set back

UPDATE mmmWiki_site s SET srcIcon16=REGEXP_REPLACE(srcIcon16, "^Site/(.+)16(.+)", 'lib/image/\\116\\2');
ALTER TABLE mmmWiki_site CHANGE COLUMN srcIcon16 urlIcon16 varchar(32) NOT NULL;

ALTER TABLE mmmWiki_site CHANGE COLUMN strLangSite urlIcon200 varchar(32) NOT NULL;
UPDATE mmmWiki_site s SET urlIcon200=REGEXP_REPLACE(urlIcon16, "^(.+)16(.+)", '\\1200\\2');



ALTER TABLE mmmWiki_page DROP COLUMN strLang;


