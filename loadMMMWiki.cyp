
  // 'boDefault','boTLS','urlIcon16','urlIcon200','googleAnalyticsTrackingID','aPassword','vPassword','name','www'

//----- site.csv
USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM 'file:///site.csv' AS line
MERGE (s:Site { name:line.name  })
SET s.boDefault=toBoolean(line.boDefault),
    s.boTLS= toBoolean(line.boTLS),
    s.urlIcon16= line.urlIcon16,
    s.urlIcon200= line.urlIcon200,
    s.googleAnalyticsTrackingID= line.googleAnalyticsTrackingID,
    s.aPassword= line.aPassword,
    s.vPassword= line.vPassword,
    s.www= line.www
//----- 


  // "boOR","boOW","boSiteMap","tCreated","tMod","tLastAccess","nAccess","siteName","strName"

//----- page.csv
USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM 'file:///page.csv' AS line
MERGE (s:Site { name:line.siteName })
MERGE (s)-[:hasPage]->(p:Page { nameLC:toLower(line.strName) })
WITH line,p
OPTIONAL MATCH (p)-[:hasRevision]->(r:RevisionLast)
SET p.boOR= toBoolean(line.boOR),
    p.boOW= toBoolean(line.boOW),
    p.boSiteMap= toBoolean(line.boSiteMap),
    p.tCreated= toInteger(line.tCreated),
    r.tMod= toInteger(line.tMod),
    p.tLastAccess= toInteger(line.tLastAccess),
    p.nAccess= toInteger(line.nAccess),
    p.name= line.strName
//----- 

  // "boOther","tMod","tLastAccess","nAccess","imageName"

//----- image.csv
USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM 'file:///image.csv' AS line
MERGE (i:Image { nameLC:toLower(line.imageName) })
SET i.boOther= toBoolean(line.boOther),
    i.tCreated= toInteger(line.tCreated),
    i.tMod= toInteger(line.tMod),
    i.tLastAccess= toInteger(line.tLastAccess),
    i.nAccess= toInteger(line.nAccess),
    i.name= line.imageName
//----- 

  // "tCreated","tLastAccess","nAccess","siteName","nameLC","url"
//----- redirect.csv
USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM 'file:///redirect.csv' AS line
MERGE (s:Site { name:line.siteName })
MERGE (s)-[:hasRedirect]->(r:Redirect { nameLC:toLower(line.nameLC) })
SET r.url= line.url,
    r.tCreated= toInteger(line.tCreated),
    r.tMod= toInteger(line.tMod),
    r.tLastAccess= coalesce(toInteger(line.tLastAccess), 0),
    r.nAccess= toInteger(line.nAccess)



