

ALTER TABLE mmm.mmmWiki_page ADD COLUMN nParent int(4) NOT NULL DEFAULT 0 AFTER intPriority;
ALTER TABLE mmm.mmmWiki_image ADD COLUMN nParent int(4) NOT NULL DEFAULT 0 AFTER hash;

UPDATE mmmWiki_page p JOIN mmmWiki_nParent np ON p.pageName=np.pageName AND p.idSite=np.idSite SET p.nParent=np.nParent;
UPDATE mmmWiki_image i JOIN mmmWiki_nParentI np ON i.imageName=np.imageName SET i.nParent=np.nParent;
        

CREATE TABLE `mmmWiki_binsNParent` (`id` int(11) NOT NULL, `minVal` int(11) DEFAULT NULL, `maxVal` int(11) DEFAULT NULL, PRIMARY KEY (`id`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

mysqldump mmm -u root -p --no-create-info  mmmWiki_binsNParent  > script.sql

INSERT INTO `mmmWiki_binsNParent` VALUES (0,0,0),(1,1,1),(2,2,2),(3,3,3),(4,4,4),(5,5,5),(6,6,7),(7,8,9),(8,10,2147483646);

DROP TABLE mmmWiki_nParent, mmmWiki_nParentI;

-- Set back

CREATE TABLE mmmWiki_nParent (
idSite int(4) NOT NULL, 
pageName varchar(128) NOT NULL,
nParent int(4) NOT NULL,
PRIMARY KEY (idSite,pageName)
) ENGINE=INNODB COLLATE utf8_general_ci;
CREATE TABLE mmmWiki_nParentI (
imageName varchar(128) NOT NULL,
nParent int(4) NOT NULL,
PRIMARY KEY (imageName)
) ENGINE=INNODB COLLATE utf8_general_ci;
  
TRUNCATE mmmWiki_nParent;
INSERT INTO mmmWiki_nParent SELECT idSite, pageName, COUNT(idPage IS NOT NULL) AS nParent FROM mmmWiki_sub GROUP BY idSite, pageName;
        
TRUNCATE mmmWiki_nParentI;
INSERT INTO mmmWiki_nParentI SELECT imageName, COUNT(idPage IS NOT NULL) AS nParent FROM mmmWiki_subImage GROUP BY imageName;


ALTER TABLE mmm.mmmWiki_page DROP COLUMN nParent;
ALTER TABLE mmm.mmmWiki_image DROP COLUMN nParent;


DROP TABLE `mmmWiki_binsNParent`;
