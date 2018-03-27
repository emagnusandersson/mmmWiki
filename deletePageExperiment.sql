
  CREATE PROCEDURE `+strDBPrefix+`deletePageIDMult()
      BEGIN
        START TRANSACTION;
        CALL `+strDBPrefix+`markStaleParentsOfPageMult(0);
        
        CREATE TEMPORARY TABLE IF NOT EXISTS tmp (idFile INT(4), idFileCache INT(4));
        TRUNCATE tmp; INSERT INTO tmp SELECT idFile, idFileCache FROM `+versionTab+` v JOIN arrPageID arr ON v.idPage=arr.idPage;
        DELETE v FROM `+versionTab+` v JOIN arrPageID arr ON v.idPage=arr.idPage WHERE 1;
        DELETE f FROM `+fileTab+` f JOIN tmp t ON t.idFile=f.idFile WHERE 1;
        DELETE f FROM `+fileTab+` f JOIN tmp t ON t.idFileCache=f.idFile WHERE 1;
       
              -- Delete/subtract arrPageID's children's nParent-value in nParentTab
          -- Delete any rows with 1 (or less) in nParentTab
        DELETE n FROM `+nParentTab+` n   JOIN `+subTab+` s ON n.pageName=s.pageName AND n.idSite=s.idSite   JOIN arrPageID arr ON s.idPage=arr.idPage   WHERE nParent<=1;
          -- Subtract 1 from nParentTab.nParent for each row in (old) subTab
        UPDATE `+nParentTab+` n   JOIN `+subTab+` s ON n.pageName=s.pageName AND n.idSite=s.idSite   JOIN arrPageID arr ON s.idPage=arr.idPage   SET n.nParent=n.nParent-1;

              -- Delete/subtract arrPageID's images's nParent-value in nParentITab
          -- Delete any rows with 1 (or less) in nParentITab
        DELETE n FROM `+nParentITab+` n JOIN `+subImageTab+` s ON n.imageName=s.imageName JOIN arrPageID arr ON s.idPage=arr.idPage WHERE nParent<=1;
          -- Subtract 1 from nParentITab.nParent for each row in (old) subImageTab
        UPDATE `+nParentITab+` n JOIN `+subImageTab+` s ON n.imageName=s.imageName JOIN arrPageID arr ON s.idPage=arr.idPage SET n.nParent=n.nParent-1;


        DELETE p FROM `+pageTab+` p JOIN arrPageID arr ON p.idPage=arr.idPage WHERE 1;
        COMMIT;
      END


CREATE PROCEDURE `+strDBPrefix+`markStaleParentsOfPageMult(IboOn TINYINT)
      BEGIN
        UPDATE `+versionTab+` v JOIN `+subTab+` s ON v.idPage=s.idPage JOIN `+pageTab+` p ON s.idSite=p.idSite AND s.pageName=p.pageName JOIN arrPageID arr ON p.idPage=arr.idPage
 SET v.tModCache=FROM_UNIXTIME(1) WHERE (s.boOnWhenCached!=IboOn OR isTemplate(p.pageName));
      END


CREATE TABLE IF NOT EXISTS arrPageID (idPage int(128) NOT NULL);
TRUNCATE arrPageID;
INSERT INTO arrPageID VALUES ('maple', 1), ('Oak', 1), ('Pine', 1), ('Spruce', 1), ('Birch', 1);
DROP TABLE arrPageID;

CALL mmmWikideletePageIDMulti();
