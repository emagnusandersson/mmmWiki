--
-- Merging tables
--
CREATE TEMPORARY TABLE IF NOT EXISTS table1 (pageName varchar(128) NOT NULL,  boOn TINYINT(1) NOT NULL, PRIMARY KEY (pageName) );
CREATE TEMPORARY TABLE IF NOT EXISTS table2 (pageName varchar(128) NOT NULL,  boOn TINYINT(1) NOT NULL, PRIMARY KEY (pageName) );
  
TRUNCATE table1;
TRUNCATE table2;
INSERT INTO table1 VALUES ('Lists', 1),
('oak', 1),
('maple', 1),
('Oak', 1),
('Pine', 1),
('Spruce', 1),
('List_of_trees', 1);
 INSERT INTO table2 VALUES ('Lists', 1),
('List_of_trees', 1),
('Maple', 1),
('oak', 1),
('Pine', 1),
('Spruce', 1); 
CREATE TABLE new_table
  SELECT * FROM table1
    UNION
  SELECT * FROM table2;
SELECT * FROM new_table;
