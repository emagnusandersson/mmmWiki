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
INSERT INTO mmmWiki_sub VALUES (1, 1, 'Lists', 1),
(1, 1, 'oak', 1),
(6, 1, 'maple', 1),
(6, 1, 'Oak', 1),
(6, 1, 'Pine', 1),
(6, 1, 'Spruce', 1),
(7, 1, 'List_of_trees', 1);

TRUNCATE mmmWiki_nParent;
INSERT INTO mmmWiki_nParent VALUES (1, 'Lists', 1),
(1, 'List_of_trees', 1),
(1, 'Maple', 1),
(1, 'oak', 2),
(1, 'Pine', 1),
(1, 'Spruce', 1);

CREATE TABLE IF NOT EXISTS tmpSubNew (pageName varchar(128) NOT NULL,  boOn TINYINT(1) NOT NULL);
TRUNCATE tmpSubNew;
INSERT INTO tmpSubNew VALUES ('maple', 1), ('Oak', 1), ('Pine', 1), ('Spruce', 1), ('Birch', 1);

DROP TABLE tmpSubNew;


--
-- Editing page
--

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



--
-- Deleting page/image
--

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



--
-- renamePage
--

DROP TABLE IF EXISTS mmmWiki_sub, mmmWiki_nParent, mmmWiki_page;
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
  
CREATE TABLE IF NOT EXISTS mmmWiki_page ( 
  idPage int(4) NOT NULL auto_increment,
  idSite int(4) NOT NULL, 
  pageName varchar(128) NOT NULL, 
  PRIMARY KEY (idPage)
  ) ENGINE=INNODB COLLATE utf8_general_ci;


TRUNCATE mmmWiki_sub;
INSERT INTO mmmWiki_sub VALUES (1, 1, 'Lists', 1),
(1, 1, 'oak', 1),
(6, 1, 'maple', 1),
(5, 1, 'Oak', 1),
(6, 1, 'Pine', 1),
(6, 1, 'Spruce', 1),
(7, 1, 'List_of_trees', 1);

TRUNCATE mmmWiki_nParent;
INSERT INTO mmmWiki_nParent SELECT idSite, pageName, COUNT(idPage IS NOT NULL) AS nParent FROM mmmWiki_sub GROUP BY idSite, pageName;

TRUNCATE mmmWiki_page;
INSERT INTO mmmWiki_page VALUES (1, 1, 'Lists'),
(2, 1, 'List_of_trees'),
(3, 1, 'Maple'),
(4, 1, 'Oak'),
(5, 1, 'Pine'),
(6, 1, 'Spruce');


SELECT * FROM mmmWiki_sub;
SELECT * FROM mmmWiki_nParent;
SELECT * FROM mmmWiki_page;



DROP PROCEDURE IF EXISTS `+strDBPrefix+`renamePage
CREATE PROCEDURE `+strDBPrefix+`renamePage(IidPage int(4), IpageNameStub varchar(128))
    proc_label:BEGIN
        SET @VidPage=IidPage, @VpageNameStub=IpageNameStub;
        SELECT COUNT(*) INTO @Vc FROM `+pageTab+` WHERE pageName=@VpageNameStub;
        IF @Vc THEN SELECT 'nameExist' AS err; LEAVE proc_label; END IF;
        
        SELECT idSite, pageName INTO @VidSite, @VpageNameCur FROM `+pageTab+` WHERE idPage=@VidPage;
        
        SELECT @VpageNameCur AS nameO;  -- output
        
        -- DROP TABLE IF EXISTS tmpParentCur;
        CREATE TEMPORARY TABLE IF NOT EXISTS tmpParentCur ( idPage int(4) NOT NULL, idFile int(4) NOT NULL) ENGINE=INNODB COLLATE utf8_general_ci;
        TRUNCATE tmpParentCur;
        -- INSERT INTO tmpParentCur SELECT idPage FROM `+subTab+` WHERE idSite=@VidSite AND pageName=@VpageNameCur;  -- page parents
        INSERT INTO tmpParentCur SELECT s.idPage, p.idFile FROM `+subTab+` s JOIN `+pageLastSlimView+` p ON s.idPage=p.idPage WHERE s.idSite=@VidSite AND s.pageName=@VpageNameCur;  -- page parents
        -- SELECT * FROM tmpParentCur;
        
        SELECT t.idPage, t.idFile, data FROM tmpParentCur t JOIN `+fileTab+` f ON f.idFile=t.idFile WHERE 1;  -- output

        -- DROP TABLE IF EXISTS tmpParentAll;
        CREATE TEMPORARY TABLE IF NOT EXISTS tmpParentAll ( idPage int(4) NOT NULL ) ENGINE=INNODB COLLATE utf8_general_ci;
        TRUNCATE tmpParentAll;
        INSERT INTO tmpParentAll
          SELECT idPage FROM `+subTab+` WHERE idSite=@VidSite AND pageName=@VpageNameStub  -- stub parents
            UNION
          SELECT idPage FROM tmpParentCur; -- page parents
        -- SELECT * FROM tmpParentAll;

        REPLACE INTO `+subTab+` SELECT idPage, @VidSite, @VpageNameStub, 1 FROM tmpParentAll;
          
        SELECT COUNT(*) INTO @VnParent FROM tmpParentAll WHERE 1;

        DELETE FROM `+subTab+` WHERE idSite=@VidSite AND pageName=@VpageNameCur;

          -- Set up nParentTab appropriately
        IF @VnParent THEN
          INSERT INTO `+nParentTab+` (idSite, pageName, nParent) VALUES (@VidSite, @VpageNameStub, @VnParent) ON DUPLICATE KEY UPDATE nParent=@VnParent;
        ELSE
          DELETE FROM `+nParentTab+` WHERE idSite=@VidSite AND pageName=@VpageNameStub;
        END IF;
        
        UPDATE `+pageTab+` SET pageName=@VpageNameStub WHERE idPage=@VidPage;
      END




            -- With real table-names and numbers
        SET @VidPage=5, @VpageNameStub='oak';
        SELECT idSite, pageName INTO @VidSite, @VpageNameCur FROM mmmWiki_page WHERE idPage=@VidPage;
        
        SELECT @VpageNameCur AS nameO;  -- output
        
        -- DROP TABLE IF EXISTS tmpParentCur;
        CREATE TEMPORARY TABLE IF NOT EXISTS tmpParentCur ( idPage int(4) NOT NULL, idFile int(4) NOT NULL) ENGINE=INNODB COLLATE utf8_general_ci;
        TRUNCATE tmpParentCur;
        -- INSERT INTO tmpParentCur SELECT idPage FROM mmmWiki_sub WHERE idSite=@VidSite AND pageName=@VpageNameCur;  -- page parents
        INSERT INTO tmpParentCur SELECT s.idPage, p.idFile FROM mmmWiki_sub s JOIN mmmWiki_pageLastSlim p ON s.idPage=p.idPage WHERE s.idSite=@VidSite AND s.pageName=@VpageNameCur;  -- page parents
        -- SELECT * FROM tmpParentCur;
        
        SELECT t.idPage, t.idFile, data FROM tmpParentCur t JOIN mmmWiki_file f ON f.idFile=t.idFile WHERE 1;

        -- DROP TABLE IF EXISTS tmpParentAll;
        CREATE TEMPORARY TABLE IF NOT EXISTS tmpParentAll ( idPage int(4) NOT NULL ) ENGINE=INNODB COLLATE utf8_general_ci;
        TRUNCATE tmpParentAll;
        INSERT INTO tmpParentAll
          SELECT idPage FROM mmmWiki_sub WHERE idSite=@VidSite AND pageName=@VpageNameStub  -- stub parents
            UNION
          SELECT idPage FROM tmpParentCur; -- page parents
        -- SELECT * FROM tmpParentAll;

        REPLACE INTO mmmWiki_sub SELECT idPage, @VidSite, @VpageNameStub, 1 FROM tmpParentAll;
          
        SELECT COUNT(*) INTO @VnParent FROM tmpParentAll WHERE 1;

        DELETE FROM mmmWiki_sub WHERE idSite=@VidSite AND pageName=@VpageNameCur;

          -- Set up nParentTab appropriately
        IF @VnParent THEN
          INSERT INTO mmmWiki_nParent (idSite, pageName, nParent) VALUES (@VidSite, @VpageNameStub, @VnParent) ON DUPLICATE KEY UPDATE nParent=@VnParent;
        ELSE
          DELETE FROM mmmWiki_nParent WHERE idSite=@VidSite AND pageName=@VpageNameStub;
        END IF;
        
        UPDATE mmmWiki_page SET pageName=@VpageNameStub WHERE idPage=@VidPage;


SET @VpageNameStub="oak", @VidSite=1, @VpageNameCur="pine";
CALL mmmWikirenamePage(5, "oak");




--
-- renameImage
--


DROP TABLE IF EXISTS mmmWiki_subImage, mmmWiki_nParentI, mmmWiki_image;
CREATE TABLE IF NOT EXISTS mmmWiki_subImage ( 
  idPage int(4) NOT NULL, 
  imageName varchar(128) NOT NULL, 
  PRIMARY KEY (idPage, imageName)
  ) ENGINE=INNODB COLLATE utf8_general_ci;
  
CREATE TABLE IF NOT EXISTS mmmWiki_nParentI ( 
  imageName varchar(128) NOT NULL, 
  nParent int(4) NOT NULL, 
  PRIMARY KEY (imageName) 
  ) ENGINE=INNODB COLLATE utf8_general_ci;
  
CREATE TABLE IF NOT EXISTS mmmWiki_image ( 
  idImage int(4) NOT NULL auto_increment,
  imageName varchar(128) NOT NULL, 
  PRIMARY KEY (idImage)
  ) ENGINE=INNODB COLLATE utf8_general_ci;


TRUNCATE mmmWiki_subImage;
INSERT INTO mmmWiki_subImage VALUES (1, 'Lists'),
(1, 'oak'),
(6, 'maple'),
(5, 'Oak'),
(6, 'Pine'),
(6, 'Spruce'),
(7, 'List_of_trees');

TRUNCATE mmmWiki_nParentI;
INSERT INTO mmmWiki_nParentI SELECT imageName, COUNT(idPage IS NOT NULL) AS nParent FROM mmmWiki_subImage GROUP BY imageName;

TRUNCATE mmmWiki_image;
INSERT INTO mmmWiki_image VALUES (1, 'Lists'),
(2, 'List_of_trees'),
(3, 'Maple'),
(4, 'Oak'),
(5, 'Pine'),
(6, 'Spruce');


SELECT * FROM mmmWiki_subImage;
SELECT * FROM mmmWiki_nParentI;
SELECT * FROM mmmWiki_image;




DROP PROCEDURE IF EXISTS `+strDBPrefix+`renameImage
CREATE PROCEDURE `+strDBPrefix+`renameImage(IidImage int(4), IimageNameStub varchar(128))
    proc_label:BEGIN
        SET @VidImage=IidImage, @VimageNameStub=IimageNameStub;
        SELECT COUNT(*) INTO @Vc FROM `+imageTab+` WHERE imageName=@VimageNameStub;
        IF @Vc THEN SELECT 'nameExist' AS err; LEAVE proc_label; END IF;
        
        SELECT imageName INTO @VimageNameCur FROM `+imageTab+` WHERE idImage=@VidImage;
        
        SELECT @VimageNameCur AS nameO;  -- output
        
        -- DROP TABLE IF EXISTS tmpParentCur;
        CREATE TEMPORARY TABLE IF NOT EXISTS tmpParentCur ( idPage int(4) NOT NULL, idFile int(4) NOT NULL) ENGINE=INNODB COLLATE utf8_general_ci;
        TRUNCATE tmpParentCur;
        -- INSERT INTO tmpParentCur SELECT idPage FROM `+subImageTab+` WHERE imageName=@VimageNameCur;  -- image parents
        INSERT INTO tmpParentCur SELECT s.idPage, p.idFile FROM `+subImageTab+` s JOIN `+pageLastSlimView+` p ON s.idPage=p.idPage WHERE s.imageName=@VimageNameCur;  -- image parents
        -- SELECT * FROM tmpParentCur;
        
        SELECT t.idPage, t.idFile, data FROM tmpParentCur t JOIN `+fileTab+` f ON f.idFile=t.idFile WHERE 1;  -- output

        -- DROP TABLE IF EXISTS tmpParentAll;
        CREATE TEMPORARY TABLE IF NOT EXISTS tmpParentAll ( idPage int(4) NOT NULL ) ENGINE=INNODB COLLATE utf8_general_ci;
        TRUNCATE tmpParentAll;
        INSERT INTO tmpParentAll
          SELECT idPage FROM `+subImageTab+` WHERE imageName=@VimageNameStub  -- stub parents
            UNION
          SELECT idPage FROM tmpParentCur; -- image parents
        -- SELECT * FROM tmpParentAll;

        REPLACE INTO `+subImageTab+` SELECT idPage, @VimageNameStub FROM tmpParentAll;
          
        SELECT COUNT(*) INTO @VnParent FROM tmpParentAll WHERE 1;

        DELETE FROM `+subImageTab+` WHERE imageName=@VimageNameCur;

          -- Set up nParentITab appropriately
        IF @VnParent THEN
          INSERT INTO `+nParentITab+` (imageName, nParent) VALUES (@VimageNameStub, @VnParent) ON DUPLICATE KEY UPDATE nParent=@VnParent;
        ELSE
          DELETE FROM `+nParentITab+` WHERE imageName=@VimageNameStub;
        END IF;
        
        UPDATE `+imageTab+` SET imageName=@VimageNameStub WHERE idImage=@VidImage;
      END



SET @VidImage=IidImage, @VimageNameStub=IimageNameStub;
        SET @VidImage=5, @VimageNameStub='oak';
        SELECT imageName INTO @VimageNameCur FROM mmmWiki_image WHERE idImage=@VidImage;
        
        SELECT @VimageNameCur AS nameO;  -- output
        
        -- DROP TABLE IF EXISTS tmpParentCur;
        CREATE TEMPORARY TABLE IF NOT EXISTS tmpParentCur ( idPage int(4) NOT NULL, idFile int(4) NOT NULL) ENGINE=INNODB COLLATE utf8_general_ci;
        TRUNCATE tmpParentCur;
        -- INSERT INTO tmpParentCur SELECT idPage FROM mmmWiki_subImage WHERE imageName=@VimageNameCur;  -- image parents
        INSERT INTO tmpParentCur SELECT s.idPage, p.idFile FROM mmmWiki_subImage s JOIN mmmWiki_pageLastSlim p ON s.idPage=p.idPage WHERE s.imageName=@VimageNameCur;  -- image parents
        -- SELECT * FROM tmpParentCur;
        
        SELECT t.idPage, t.idFile, data FROM tmpParentCur t JOIN mmmWiki_file f ON f.idFile=t.idFile WHERE 1;  -- output

        -- DROP TABLE IF EXISTS tmpParentAll;
        CREATE TEMPORARY TABLE IF NOT EXISTS tmpParentAll ( idPage int(4) NOT NULL ) ENGINE=INNODB COLLATE utf8_general_ci;
        TRUNCATE tmpParentAll;
        INSERT INTO tmpParentAll
          SELECT idPage FROM mmmWiki_subImage WHERE imageName=@VimageNameStub  -- stub parents
            UNION
          SELECT idPage FROM tmpParentCur; -- image parents
        -- SELECT * FROM tmpParentAll;

        REPLACE INTO mmmWiki_subImage SELECT idPage, @VimageNameStub FROM tmpParentAll;
          
        SELECT COUNT(*) INTO @VnParent FROM tmpParentAll WHERE 1;

        DELETE FROM mmmWiki_subImage WHERE imageName=@VimageNameCur;

          -- Set up nParentITab appropriately
        IF @VnParent THEN
          INSERT INTO mmmWiki_nParentI (imageName, nParent) VALUES (@VimageNameStub, @VnParent) ON DUPLICATE KEY UPDATE nParent=@VnParent;
        ELSE
          DELETE FROM mmmWiki_nParentI WHERE imageName=@VimageNameStub;
        END IF;
        
        UPDATE mmmWiki_image SET imageName=@VimageNameStub WHERE idImage=@VidImage;

