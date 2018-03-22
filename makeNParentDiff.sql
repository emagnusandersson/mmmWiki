DELIMITER $$
DROP PROCEDURE IF EXISTS mmmWikimakeNParentDiff$$
CREATE PROCEDURE mmmWikimakeNParentDiff(IidSite INT, IidPage INT)
    proc_label:BEGIN 
      -- DROP TEMPORARY TABLE IF EXISTS tmpSubDiffOld;
      -- CREATE TEMPORARY TABLE tmpSubDiffOld (pageName varchar(128) NOT NULL) AS SELECT pageName FROM mmmWiki_sub s WHERE s.idPage=IidPage;

      -- DROP TEMPORARY TABLE IF EXISTS tmpSubDiff;
      -- CREATE TEMPORARY TABLE IF NOT EXISTS tmpSubDiff (pageName varchar(128) NOT NULL, nDelta TINYINT NOT NULL) AS SELECT pageName, 1 AS nDelta FROM tmpSubNew;
        -- Create tmpSubDiff (pageNames, nDelta) by combining the data from mmmWiki_sub and from tmpSubNew
        -- Rows in tmpSubNew but not in mmmWiki_sub gets nDelta=1
        -- Rows in mmmWiki_sub but not in tmpSubNew gets nDelta=-1
      CREATE TEMPORARY TABLE IF NOT EXISTS tmpSubDiff (pageName varchar(128) NOT NULL, nDelta TINYINT NOT NULL);
      TRUNCATE tmpSubDiff; INSERT INTO tmpSubDiff SELECT pageName, 1 AS nDelta FROM tmpSubNew;

      -- SELECT * FROM tmpSubDiffOld;
      SELECT * FROM tmpSubDiff;
        -- Removing rows that are  both in mmmWiki_sub and tmpSubNew (since nothing needs to be changed (nDelta=0)).
        -- And insert (pageName,-1) when mmmWiki_sub.pageName is not in tmpSubNew.
      BEGIN 
        DECLARE VpageName varchar(128);
        DECLARE VnOld, VboInNew INT;
        DECLARE done INT DEFAULT FALSE;
        DECLARE cursor_i CURSOR FOR SELECT pageName FROM mmmWiki_sub s WHERE s.idPage=IidPage;
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
        OPEN cursor_i;
        read_loop: LOOP
          FETCH cursor_i INTO VpageName;
          -- SELECT VpageName, done;
          IF done THEN   LEAVE read_loop;  END IF;
          SELECT COUNT(*) INTO VboInNew FROM tmpSubNew WHERE pageName=VpageName;
          -- SELECT VboInNew, VpageName;
          IF VboInNew THEN
            DELETE FROM tmpSubDiff WHERE pageName=VpageName;  -- Delete since nothing needs to be changed.
          ELSE
            INSERT INTO tmpSubDiff (pageName, nDelta) VALUES (VpageName,-1);
          END IF;
        END LOOP;
        CLOSE cursor_i;
      END;
      -- SELECT * FROM tmpSubDiff;
        -- Change nParentTab based on tmpSubDiff
      BEGIN 
        DECLARE VpageName varchar(128);
        DECLARE VnParentOld, VnDelta, Vtrash INT;
        DECLARE done INT DEFAULT FALSE;
        DECLARE cursor_i CURSOR FOR SELECT pageName, nDelta FROM tmpSubDiff;
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
        OPEN cursor_i;
        read_loop: LOOP
          SET VnParentOld=NULL;
          FETCH cursor_i INTO VpageName, VnDelta;
          -- SELECT VpageName, VnDelta, done;
          IF done THEN   LEAVE read_loop;  END IF;
          BEGIN -- Extra Begin-End because of this: https://bugs.mysql.com/bug.php?id=61777
            DECLARE CONTINUE HANDLER FOR NOT FOUND SET Vtrash = 0;
            SELECT nParent INTO VnParentOld FROM mmmWiki_nParent WHERE idSite=IidSite AND pageName=VpageName;
          END;
          -- SELECT VpageName, VnDelta, VnParentOld;
          IF VnDelta=1 THEN
            IF VnParentOld IS NULL THEN
              INSERT INTO mmmWiki_nParent (idSite, pageName, nParent) VALUES (IidSite, VpageName,1);
            ELSEIF VnParentOld<0 THEN -- This should never happen really
              UPDATE mmmWiki_nParent SET nParent=VnDelta WHERE idSite=IidSite AND pageName=VpageName;
            ELSE
              UPDATE mmmWiki_nParent SET nParent=nParent+VnDelta WHERE idSite=IidSite AND pageName=VpageName;
            END IF;
          ELSE
            IF VnParentOld IS NULL THEN
              SET Vtrash=0;
            ELSEIF VnParentOld<2 THEN
              DELETE FROM mmmWiki_nParent WHERE idSite=IidSite AND pageName=VpageName;
            ELSE
              UPDATE mmmWiki_nParent SET nParent=nParent+VnDelta WHERE idSite=IidSite AND pageName=VpageName;
            END IF;
          END IF;
        END LOOP;
        CLOSE cursor_i;
      END;
    END$$
DELIMITER ;

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
DROP TEMPORARY TABLE IF EXISTS tmpSubNew;
CREATE TEMPORARY TABLE IF NOT EXISTS tmpSubNew (pageName varchar(128) NOT NULL,  boOn TINYINT(1) NOT NULL,  UNIQUE KEY (pageName));
-- INSERT INTO tmpSubNew VALUES ('Maple',0),('Oak',0),('Pine',0),('Spruce',0);
INSERT INTO tmpSubNew VALUES ('juniper',0),('Oak',0),('Pine',0),('Spruce',0);
CALL mmmWikimakeNParentDiff(1, 6);






DELIMITER $$
DROP PROCEDURE IF EXISTS mmmWikimakeNParentIDiff$$
CREATE PROCEDURE mmmWikimakeNParentIDiff(IidPage INT)
    proc_label:BEGIN 
      -- DROP TEMPORARY TABLE IF EXISTS tmpSubDiffOld;
      -- CREATE TEMPORARY TABLE tmpSubDiffOld (imageName varchar(128) NOT NULL) AS SELECT imageName FROM mmmWiki_subImage s WHERE s.idPage=IidPage;

      -- DROP TEMPORARY TABLE IF EXISTS tmpSubIDiff;
        -- Create tmpSubIDiff (imageName, nDelta) by combining the data from mmmWiki_subImage and from tmpSubNewImage
        -- Rows in tmpSubNewImage but not in mmmWiki_subImage gets nDelta=1
        -- Rows in mmmWiki_subImage but not in tmpSubNewImage gets nDelta=-1
      CREATE TEMPORARY TABLE IF NOT EXISTS tmpSubIDiff (imageName varchar(128) NOT NULL, nDelta TINYINT NOT NULL);
      TRUNCATE tmpSubIDiff; INSERT INTO tmpSubIDiff SELECT imageName, 1 AS nDelta FROM tmpSubNewImage  ;

      #SELECT * FROM tmpSubDiffOld;
      #SELECT * FROM tmpSubIDiff;
        -- Removing rows that are  both in mmmWiki_subImage and tmpSubNewImage (since nothing needs to be changed (nDelta=0)).
        -- And insert (imageName,-1) when mmmWiki_subImage.imageName is not in tmpSubNewImage.
      BEGIN 
        DECLARE VimageName varchar(128);
        DECLARE VnOld, VboInNew INT;
        DECLARE done INT DEFAULT FALSE;
        DECLARE cursor_i CURSOR FOR SELECT imageName FROM mmmWiki_subImage s WHERE s.idPage=IidPage;
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
        OPEN cursor_i;
        read_loop: LOOP
          FETCH cursor_i INTO VimageName;
          -- SELECT VimageName, done;
          IF done THEN   LEAVE read_loop;  END IF;
          SELECT COUNT(*) INTO VboInNew FROM tmpSubNewImage WHERE imageName=VimageName;
          -- SELECT VboInNew, VimageName;
          IF VboInNew THEN
            DELETE FROM tmpSubIDiff WHERE imageName=VimageName;  -- Delete since nothing needs to be changed.
          ELSE
            INSERT INTO tmpSubIDiff (imageName, nDelta) VALUES (VimageName,-1);
          END IF;
        END LOOP;
        CLOSE cursor_i;
      END;
      #SELECT * FROM tmpSubIDiff;
        -- Change nParentITab based on tmpSubIDiff
      BEGIN 
        DECLARE VimageName varchar(128);
        DECLARE VnParentOld, VnDelta, Vtrash INT;
        DECLARE done INT DEFAULT FALSE;
        DECLARE cursor_i CURSOR FOR SELECT imageName, nDelta FROM tmpSubIDiff;
        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
        OPEN cursor_i;
        read_loop: LOOP
          SET VnParentOld=NULL;
          FETCH cursor_i INTO VimageName, VnDelta;
          -- SELECT VimageName, VnDelta, done;
          IF done THEN   LEAVE read_loop;  END IF;
          BEGIN -- Extra Begin-End-wrapping because of this bug/issue: https://bugs.mysql.com/bug.php?id=61777
            DECLARE CONTINUE HANDLER FOR NOT FOUND SET Vtrash = 0;
            SELECT nParent INTO VnParentOld FROM mmmWiki_nParentI WHERE imageName=VimageName;
          END;
          #SELECT VimageName, VnDelta, VnParentOld;
          IF VnDelta=1 THEN
            IF VnParentOld IS NULL THEN
              INSERT INTO mmmWiki_nParentI (imageName, nParent) VALUES (VimageName,1);
            ELSEIF VnParentOld<0 THEN -- This should never happen really
              UPDATE mmmWiki_nParentI SET nParent=VnDelta WHERE imageName=VimageName;
            ELSE
              UPDATE mmmWiki_nParentI SET nParent=nParent+VnDelta WHERE imageName=VimageName;
            END IF;
          ELSE
            IF VnParentOld IS NULL THEN
              SET Vtrash=0;
            ELSEIF VnParentOld<2 THEN
              DELETE FROM mmmWiki_nParentI WHERE imageName=VimageName;
            ELSE
              UPDATE mmmWiki_nParentI SET nParent=nParent+VnDelta WHERE imageName=VimageName;
            END IF;
          END IF;
        END LOOP;
        CLOSE cursor_i;
      END;
    END$$
DELIMITER ;

TRUNCATE mmmWiki_subImage;
INSERT INTO mmmWiki_subImage VALUES 
('1', 'oak.jpg'),
('2', 'spruce.jpg'),
('3', 'oak.jpg'),
('4', 'pine.jpg'),
('5', 'maple.jpg'),
('6', 'maple.jpg'),
('6', 'oak.jpg'),
('6', 'pine.jpg'),
('6', 'spruce.jpg');

TRUNCATE mmmWiki_nParentI;
-- INSERT INTO mmmWiki_nParentI VALUES ('Maple',1),('Oak',1),('Pine',1),('Spruce',3);
-- INSERT INTO mmmWiki_nParentI VALUES ('Lists',1),('Oak',1);
INSERT INTO mmmWiki_nParentI VALUES
('maple.jpg', '2'),
('oak.jpg', '3'),
('pine.jpg', '2'),
('spruce.jpg', '2');



DROP TEMPORARY TABLE IF EXISTS tmpSubNewImage;
CREATE TEMPORARY TABLE IF NOT EXISTS tmpSubNewImage (imageName varchar(128) NOT NULL,  boOn TINYINT(1) NOT NULL,  UNIQUE KEY (imageName));
-- INSERT INTO tmpSubNew VALUES ('Maple',0),('Oak',0),('Pine',0),('Spruce',0);
INSERT INTO tmpSubNewImage VALUES ('juniper',0),('Oak',0),('Pine',0),('Spruce',0);
CALL mmmWikimakeNParentDiffI(6);

