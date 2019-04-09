


CREATE TABLE `mmmWiki_binsLastRev` (`id` int(11) NOT NULL, `minVal` int(11) DEFAULT NULL, `maxVal` int(11) DEFAULT NULL, PRIMARY KEY (`id`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

mysqldump mmm -u root -p --no-create-info  mmmWiki_binsLastRev  > script.sql

INSERT INTO `mmmWiki_binsLastRev` VALUES (0,0,0),(1,1,1),(2,2,2),(3,3,3),(4,4,4),(5,5,5),(6,6,7),(7,8,9),(8,10,2147483646);

-- Set back

DROP TABLE `mmmWiki_binsLastRev`;




