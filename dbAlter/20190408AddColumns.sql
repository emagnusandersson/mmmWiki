

ALTER TABLE mmm.mmmWiki_site
 ADD COLUMN boORDefault int(1) NOT NULL DEFAULT 0 AFTER tCreated,
 ADD COLUMN boOWDefault int(1) NOT NULL DEFAULT 0 AFTER tCreated,
 ADD COLUMN boSiteMapDefault int(1) NOT NULL DEFAULT 0 AFTER tCreated;
 
ALTER TABLE mmm.mmmWiki_page 
 ADD COLUMN intPriority int(4) NOT NULL DEFAULT 50 AFTER tCreated,
 ADD COLUMN nAccess int(4) NOT NULL DEFAULT 0 AFTER tCreated,
 ADD COLUMN tLastAccess TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER tCreated;
UPDATE mmm.mmmWiki_pageLast SET tLastAccess=tMod;

ALTER TABLE mmm.mmmWiki_image 
 ADD COLUMN hash varchar(32) NOT NULL DEFAULT '' AFTER size,
 ADD COLUMN tMod TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER size,
 ADD COLUMN nAccess int(4) NOT NULL DEFAULT 0 AFTER size,
 ADD COLUMN tLastAccess TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER size,
 ADD COLUMN extension varchar(10) NOT NULL DEFAULT '' AFTER size,
 ADD COLUMN height int(4) NOT NULL DEFAULT 0 AFTER size,
 ADD COLUMN width int(4) NOT NULL DEFAULT 0 AFTER size,
 ADD COLUMN widthSkipThumb int(4) NOT NULL DEFAULT 1000 AFTER size;
UPDATE mmm.mmmWiki_image SET tLastAccess=tMod;

ALTER TABLE mmm.mmmWiki_thumb 
 ADD COLUMN nAccess int(4) NOT NULL DEFAULT 0 AFTER eTag,
 ADD COLUMN tLastAccess TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER eTag,
 ADD COLUMN size int(4) NOT NULL DEFAULT 0 AFTER eTag;


CREATE TABLE `mmmWiki_binsIntPriority` (`id` int(11) NOT NULL,`minVal` int(11) DEFAULT NULL, `maxVal` int(11) DEFAULT NULL, PRIMARY KEY (`id`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE `mmmWiki_binsTLastAccess` (`id` int(11) NOT NULL,`minVal` int(11) DEFAULT NULL, `maxVal` int(11) DEFAULT NULL, PRIMARY KEY (`id`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE `mmmWiki_binsNAccess` (`id` int(11) NOT NULL,`minVal` int(11) DEFAULT NULL, `maxVal` int(11) DEFAULT NULL, PRIMARY KEY (`id`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE `mmmWiki_binsWidth` (`id` int(11) NOT NULL,`minVal` int(11) DEFAULT NULL, `maxVal` int(11) DEFAULT NULL, PRIMARY KEY (`id`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE `mmmWiki_binsHeight` (`id` int(11) NOT NULL,`minVal` int(11) DEFAULT NULL, `maxVal` int(11) DEFAULT NULL, PRIMARY KEY (`id`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE `mmmWiki_binsNChild` (`id` int(11) NOT NULL,`minVal` int(11) DEFAULT NULL, `maxVal` int(11) DEFAULT NULL, PRIMARY KEY (`id`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE TABLE `mmmWiki_binsNImage` (`id` int(11) NOT NULL,`minVal` int(11) DEFAULT NULL, `maxVal` int(11) DEFAULT NULL, PRIMARY KEY (`id`) ) ENGINE=InnoDB DEFAULT CHARSET=utf8;

mysqldump mmm -u root -p --no-create-info  mmmWiki_binsIntPriority mmmWiki_binsTLastAccess mmmWiki_binsNAccess mmmWiki_binsWidth mmmWiki_binsHeight mmmWiki_binsNChild mmmWiki_binsNImage  > script.sql

truncate mmmWiki_binsIntPriority;
INSERT INTO `mmmWiki_binsIntPriority` VALUES (0,0,9),(1,10,19),(2,20,29),(3,30,39),(4,40,49),(5,50,59),(6,60,69),(7,70,79),(8,80,89),(9,90,99);
INSERT INTO `mmmWiki_binsTLastAccess` VALUES (0,0,899),(1,900,3599),(2,3600,10799),(3,10800,28799),(4,28800,86399),(5,86400,259199),(6,259200,604799),(7,604800,1814399),(8,1814400,7883999),(9,7884000,31535999),(10,31536000,94607999),(11,94608000,2147483646);
INSERT INTO `mmmWiki_binsNAccess` VALUES (0,0,2),(1,3,9),(2,10,29),(3,30,99),(4,100,299),(5,300,999),(6,1000,2999),(7,3000,9999),(8,10000,29999),(9,30000,99999),(10,100000,299999),(11,300000,999999),(12,1000000,2999999),(13,3000000,2147483646);
INSERT INTO `mmmWiki_binsWidth` VALUES (0,0,2),(1,3,9),(2,10,29),(3,30,99),(4,100,299),(5,300,999),(6,1000,2999),(7,3000,2147483646);
INSERT INTO `mmmWiki_binsHeight` VALUES (0,0,2),(1,3,9),(2,10,29),(3,30,99),(4,100,299),(5,300,999),(6,1000,2999),(7,3000,2147483646);
INSERT INTO `mmmWiki_binsNChild` VALUES (0,0,0),(1,1,1),(2,2,3),(3,4,7),(4,8,15),(5,16,31),(6,32,63),(7,64,127),(8,128,2147483646);
INSERT INTO `mmmWiki_binsNImage` VALUES (0,0,0),(1,1,1),(2,2,3),(3,4,7),(4,8,15),(5,16,31),(6,32,63),(7,64,127),(8,128,2147483646);



-- Set back

ALTER TABLE mmm.mmmWiki_site 
 DROP COLUMN boORDefault,
 DROP COLUMN boOWDefault,
 DROP COLUMN boSiteMapDefault;
 
ALTER TABLE mmm.mmmWiki_page 
 DROP COLUMN intPriority,
 DROP COLUMN nAccess,
 DROP COLUMN tLastAccess;
 
ALTER TABLE mmm.mmmWiki_image 
 DROP COLUMN hash,
 DROP COLUMN tMod,
 DROP COLUMN nAccess,
 DROP COLUMN tLastAccess,
 DROP COLUMN extension,
 DROP COLUMN height,
 DROP COLUMN width,
 DROP COLUMN widthSkipThumb;

ALTER TABLE mmm.mmmWiki_thumb 
 DROP COLUMN size;


DROP TABLE `mmmWiki_binsIntPriority`, `mmmWiki_binsTLastAccess`, `mmmWiki_binsNAccess`, `mmmWiki_binsWidth`, `mmmWiki_binsHeight`, `mmmWiki_binsNChild`, `mmmWiki_binsNImage`;




