CREATE TABLE IF NOT EXISTS mmmWiki_sub ( 
  idPage int(4) NOT NULL, 
  idSite int(4) NOT NULL, 
  pageName varchar(128) NOT NULL, 
  boOnWhenCached TINYINT(1) NOT NULL, 
  PRIMARY KEY (idPage, pageName, idSite)
  ) ENGINE=INNODB COLLATE utf8_general_ci;
  
CREATE TABLE IF NOT EXISTS mmmWiki_nParent ( 
  idSite int(4) NOT NULL, 
  pageName varchar(128) NOT NULL, 
  nParent int(4) NOT NULL, 
  PRIMARY KEY (idSite,pageName) 
  ) ENGINE=INNODB COLLATE utf8_general_ci;
  
  
  TRUNCATE mmmWiki_sub;
-- INSERT INTO mmmWiki_sub VALUES (1, 2,'Lists',0),(1, 2,'Oak',0);
INSERT INTO mmmWiki_sub VALUES ('1', '1', 'Lists', '1'),
('1', '1', 'oak', '1'),
('6', '1', 'maple', '1'),
('6', '1', 'Oak', '1'),
('6', '1', 'Pine', '1'),
('6', '1', 'Spruce', '1'),
('7', '1', 'List_of_trees', '1');

TRUNCATE mmmWiki_nParent;
-- INSERT INTO mmmWiki_nParent VALUES (2,'Maple',1),(2,'Oak',1),(2,'Pine',1),(2,'Spruce',3);
-- INSERT INTO mmmWiki_nParent VALUES (2,'Lists',1),(2,'Oak',1);
INSERT INTO mmmWiki_nParent VALUES ('1', 'Lists', '1'),
('1', 'List_of_trees', '1'),
('1', 'Maple', '1'),
('1', 'oak', '2'),
('1', 'Pine', '1'),
('1', 'Spruce', '1');

CREATE TABLE IF NOT EXISTS tmpSubNew (pageName varchar(128) NOT NULL,  boOn TINYINT(1) NOT NULL);
TRUNCATE tmpSubNew;
INSERT INTO tmpSubNew VALUES ('maple', 1), ('Oak', 1), ('Pine', 1), ('Spruce', 1), ('Birch', 1);

DROP TABLE tmpSubNew;


      -- Add/subtract(delete) IidPage's children's nParent-value in nParentTab
  -- Subtract 1 from nParentTab.nParent for each row in (old) subTab
UPDATE `+nParentTab+` n JOIN `+subTab+` s ON n.pageName=s.pageName AND n.idSite=VidSite SET n.nParent=n.nParent-1 WHERE s.idPage=IidPage;
  -- Insert (or add) 1 to nParentTab for each row in tmpSubTab
INSERT INTO `+nParentTab+` SELECT VidSite, tsn.pageName, 1 FROM tmpSubNew tsn ON DUPLICATE KEY UPDATE nParent=nParent+1;
  -- Delete any rows with 0 (or less) in nParentTab
DELETE n FROM `+nParentTab+` n WHERE nParent<=0;

      -- Add/subtract(delete) IidPage's images's nParent-value in nParentITab
  -- Subtract 1 from nParentITab.nParent for each row in (old) subImageTab
UPDATE `+nParentITab+` n JOIN `+subImageTab+` s ON n.imageName=s.imageName SET n.nParent=n.nParent-1 WHERE s.idPage=IidPage;
  -- Insert (or add) 1 to nParentITab for each row in tmpSubTab
INSERT INTO `+nParentITab+` SELECT tsn.imageName, 1 FROM tmpSubNewImage tsn ON DUPLICATE KEY UPDATE nParent=nParent+1;
  -- Delete any rows with 0 (or less) in nParentITab
DELETE n FROM `+nParentITab+` n WHERE  nParent<=0;


      -- With real table-names and numbers
  -- Subtract 1 from nParentTab.nParent for each row in (old) subTab
UPDATE mmmWiki_nParent n JOIN mmmWiki_sub s ON n.pageName=s.pageName AND n.idSite=1 SET n.nParent=n.nParent-1 WHERE s.idPage=6;
  -- Insert (or add) 1 to nParentTab for each row in tmpSubTab
INSERT INTO mmmWiki_nParent SELECT 1, tsn.pageName, 1 FROM tmpSubNew tsn ON DUPLICATE KEY UPDATE nParent=nParent+1;
  -- Delete any rows with 0 (or less) in mmmWiki_nParent
DELETE n FROM mmmWiki_nParent n WHERE nParent<=0;




      -- Delete/subtract VidPage's children's nParent-value in nParentTab
  -- Delete any rows with 1 (or less) in nParentTab
DELETE n FROM `+nParentTab+` n JOIN `+subTab+` s ON n.pageName=s.pageName AND n.idSite=VidSite WHERE s.idPage=VidPage AND nParent<=1;
  -- Subtract 1 from nParentTab.nParent for each row in (old) subTab
UPDATE `+nParentTab+` n JOIN `+subTab+` s ON n.pageName=s.pageName AND n.idSite=VidSite SET n.nParent=n.nParent-1 WHERE s.idPage=VidPage;

      -- Delete/subtract VidPage's images's nParent-value in nParentITab
  -- Delete any rows with 1 (or less) in nParentITab
DELETE n FROM `+nParentITab+` n JOIN `+subImageTab+` s ON n.imageName=s.imageName WHERE s.idPage=VidPage AND nParent<=1;
  -- Subtract 1 from nParentITab.nParent for each row in (old) subImageTab
UPDATE `+nParentITab+` n JOIN `+subImageTab+` s ON n.imageName=s.imageName SET n.nParent=n.nParent-1 WHERE s.idPage=VidPage;

      -- With real table-names and numbers
  -- Delete any rows with 1 (or less) in nParentTab
DELETE n FROM mmmWiki_nParent n JOIN mmmWiki_sub s ON n.pageName=s.pageName AND n.idSite=1 WHERE s.idPage=6 AND nParent<=1;
  -- Subtract 1 from nParentTab.nParent for each row in (old) subTab
UPDATE mmmWiki_nParent n JOIN mmmWiki_sub s ON n.pageName=s.pageName AND n.idSite=1 SET n.nParent=n.nParent-1 WHERE s.idPage=6;




