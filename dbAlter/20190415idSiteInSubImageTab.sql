

ALTER TABLE mmm.mmmWiki_subImage ADD COLUMN idSite int(4) NOT NULL DEFAULT 0 AFTER idPage;

UPDATE mmmWiki_subImage s JOIN mmmWiki_page p ON s.idPage=p.idPage SET s.idSite=p.idSite;

-- Set back

ALTER TABLE mmmWiki_subImage DROP COLUMN idSite;


