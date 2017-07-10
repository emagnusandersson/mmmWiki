




  // If it is a whitelist: [] OR [null] OR [nonNullA, nonNullB, ...]
  // If it is a blacklist: [] OR [null] OR [null, nonNullA, nonNullB, ...]
==Listing==
===page===
//----- List.page.column
 s.boTLS AS boTLS, s.name AS siteName, s.www AS www, p.name AS pageName, p.boOR AS boOR, p.boOW AS boOW, p.boSiteMap AS boSiteMap, p.tCreated AS tCreated, r.tMod AS tMod, r.tModCache AS tModCache, r.iRev AS lastRev, p.boOther AS boOther, p.idPage AS idPage, r.size AS size, p.nChild AS nChild, p.nImage AS nImage, p.tLastAccess AS tLastAccess, p.nAccess AS nAccess
//-----
//-- Different query depending on parentfilter: null, nullRemoved, all
//----- List.page.null
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) RETURN $column, null AS nameParent, null AS idParent, 0 AS nParent
//----- List.page.nullRemoved
 MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where RETURN $column, MIN(pp.name) AS nameParent, MIN(pp.idPage) AS idParent, COUNT(pp) AS nParent
//----- List.page.all
 MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where RETURN $column, MIN(pp.name) AS nameParent, MIN(pp.idPage) AS idParent, COUNT(pp) AS nParent
 UNION
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) RETURN $column, null AS nameParent, null AS idParent, 0 AS nParent
//----- 


===image===
//----- List.image.column
i.name AS imageName, i.boOther AS boOther, i.idImage AS idImage, i.size AS size, i.extension AS extension, i.tCreated AS tCreated, i.tMod AS tMod, i.tLastAccess AS tLastAccess, i.nAccess AS nAccess
//-----
 //-- Different query depending on parentFilter or siteFilter:
 //-- Only one parentFilter / siteFilter can be active (something other than "All") at a time:
//----- List.image.null
 MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) RETURN $column, null AS nameParent, null AS idParent, 0 AS nParent
//----- List.image.nullRemoved
 MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData RETURN $column, MIN(p.name) AS nameParent, MIN(p.idPage) AS idParent, COUNT(p) AS nParent
//----- List.image.all
 MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData RETURN $column, MIN(p.name) AS nameParent, MIN(p.idPage) AS idParent, COUNT(p) AS nParent
 UNION
 MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) RETURN $column, null AS nameParent, null AS idParent, 0 AS nParent

//----- 



// Only one parentFilter / siteFilter can be active (something other than "All") at a time:
  S\P                      All          null         nullRemoved
  
  All                      All          null         nullRemoved
  null                     null         notAllowed   notAllowed
  nullRemoved              nullRemoved  notAllowed   notAllowed
  
// A somewhat more advanced approch (allowing for more combinations) (not used)
  S\P                      All          null         nullRemoved
  
  All                      All          null         nullRemoved
  null                     null         null         None
  nullRemoved              nullRemoved  None         nullRemoved
  
// Explanations of entries in the tables above:
All: blackList: []
None: whiteList: []
null: whiteList: [null]
nullRemoved: whiteList: [nonNullA, nonNullB, ...],  blacklist: [null, nonNullA, nonNullB, ...]
notAllowed (mixed): whiteList: [null, nonNullA, nonNullB, ...],  blacklist: [nonNullA, nonNullB, ...]

==Histograming==


//
// Page
// 

===page===
====parentHistogram====
//----- Hist.page.parent
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p))  RETURN null AS bucket, COUNT(p) AS nBucket
 UNION
 MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where RETURN pp.idPage AS bucket, COUNT(p) AS nBucket
//----- 
//----- Hist.page.parent.nInRelaxedCond
 MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH collect([pp.idPage, p.idPage]) AS rows
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p))  WITH rows+collect([null, p.idPage]) AS allRows
 UNWIND allRows as row
 WITH DISTINCT row AS rowDistinct
 RETURN COUNT(rowDistinct) AS nInRelaxedCond
//----- 

====siteHistogram====
//-- Should maybe be renamed to site instead of siteName?!
//-- Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.siteName.null
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) RETURN s.name AS bucket, COUNT(p) AS nBucket
//----- Hist.page.siteName.nullRemoved
 MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT s.name AS name, p.idPage AS idPage RETURN name AS bucket, COUNT(idPage) AS nBucket
//----- Hist.page.siteName.all
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where RETURN s.name AS bucket, COUNT(p) AS nBucket
//----- 
//----- Hist.page.siteName.null.nInRelaxedCond
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) RETURN COUNT(p) AS nInRelaxedCond
//----- Hist.page.siteName.nullRemoved.nInRelaxedCond
 MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p.idPage AS idPage RETURN COUNT(idPage) AS nInRelaxedCond
//----- Hist.page.siteName.all.nInRelaxedCond
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where RETURN COUNT(p) AS nInRelaxedCond
//----- 

====sizeHistogram====
//-- Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.size.null
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) RETURN myMisc.bucketed(r.size, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.size.nullRemoved
 MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p, r RETURN myMisc.bucketed(r.size, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.size.all
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where RETURN myMisc.bucketed(r.size, $bucket) AS bucket, COUNT(p) AS nBucket
//----- 
====nChildHistogram====
//-- Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.nChild.null
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) RETURN myMisc.bucketed(p.nChild, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.nChild.nullRemoved
 MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p, r RETURN myMisc.bucketed(p.nChild, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.nChild.all
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where RETURN myMisc.bucketed(p.nChild, $bucket) AS bucket, COUNT(p) AS nBucket
//----- 
====nImageHistogram====
//-- Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.nImage.null
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) RETURN myMisc.bucketed(p.nImage, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.nImage.nullRemoved
 MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p, r RETURN myMisc.bucketed(p.nImage, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.nImage.all
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where RETURN myMisc.bucketed(p.nImage, $bucket) AS bucket, COUNT(p) AS nBucket
//----- 

====boORHistogram====
//-- Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.boOR.null
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) RETURN p.boOR AS bucket, COUNT(p) AS nBucket
//----- Hist.page.boOR.nullRemoved
 MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p RETURN p.boOR AS bucket, COUNT(p) AS nBucket
//----- Hist.page.boOR.all
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where RETURN p.boOR AS bucket, COUNT(p) AS nBucket
//----- 
====boOWHistogram====
//-- Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.boOW.null
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) RETURN p.boOW AS bucket, COUNT(p) AS nBucket
//----- Hist.page.boOW.nullRemoved
 MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p RETURN p.boOW AS bucket, COUNT(p) AS nBucket
//----- Hist.page.boOW.all
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where RETURN p.boOW AS bucket, COUNT(p) AS nBucket
//----- 
====boSiteMapHistogram====
//-- Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.boSiteMap.null
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) RETURN p.boSiteMap AS bucket, COUNT(p) AS nBucket
//----- Hist.page.boSiteMap.nullRemoved
 MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p RETURN p.boSiteMap AS bucket, COUNT(p) AS nBucket
//----- Hist.page.boSiteMap.all
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where RETURN p.boSiteMap AS bucket, COUNT(p) AS nBucket
//----- 
====boTalkHistogram====
//-- Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.boTalk.null
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) RETURN p.boTalk AS bucket, COUNT(p) AS nBucket
//----- Hist.page.boTalk.nullRemoved
 MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p RETURN p.boTalk AS bucket, COUNT(p) AS nBucket
//----- Hist.page.boTalk.all
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where RETURN p.boTalk AS bucket, COUNT(p) AS nBucket
//----- 
====boTemplateHistogram====
//-- Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.boTemplate.null
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) RETURN p.boTemplate AS bucket, COUNT(p) AS nBucket
//----- Hist.page.boTemplate.nullRemoved
 MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p RETURN p.boTemplate AS bucket, COUNT(p) AS nBucket
//----- Hist.page.boTemplate.all
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where RETURN p.boTemplate AS bucket, COUNT(p) AS nBucket
//----- 
====boOtherHistogram====
//-- Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.boOther.null
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) RETURN r.boOther AS bucket, COUNT(p) AS nBucket
//----- Hist.page.boOther.nullRemoved
 MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p, r RETURN r.boOther AS bucket, COUNT(p) AS nBucket
//----- Hist.page.boOther.all
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where RETURN r.boOther AS bucket, COUNT(p) AS nBucket
//----- 

====tCreatedHistogram====
//-- Different query depending on parentfilter: null, nullRemoved, all
//-- [0, 86400, 604800, 1209600, 2419200]
//----- Hist.page.tCreated.null
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) RETURN myMisc.bucketed(timestamp()/1000-p.tCreated, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.tCreated.nullRemoved
 MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p, r RETURN myMisc.bucketed(timestamp()/1000-p.tCreated, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.tCreated.all
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where RETURN myMisc.bucketed(timestamp()/1000-p.tCreated, $bucket) AS bucket, COUNT(p) AS nBucket
//----- 
====tModHistogram====
//-- Different query depending on parentfilter: null, nullRemoved, all
//-- [0, 86400, 604800, 1209600, 2419200]
//----- Hist.page.tMod.null
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) RETURN myMisc.bucketed(timestamp()/1000-r.tMod, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.tMod.nullRemoved
 MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p, r RETURN myMisc.bucketed(timestamp()/1000-r.tMod, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.tMod.all
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where RETURN myMisc.bucketed(timestamp()/1000-r.tMod, $bucket) AS bucket, COUNT(p) AS nBucket
//----- 
====tModCacheHistogram====
//-- Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.tModCache.null
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) RETURN myMisc.bucketed(timestamp()/1000-r.tModCache, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.tModCache.nullRemoved
 MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p, r RETURN myMisc.bucketed(timestamp()/1000-r.tModCache, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.tModCache.all
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where RETURN myMisc.bucketed(timestamp()/1000-r.tModCache, $bucket) AS bucket, COUNT(p) AS nBucket
//----- 
====tLastAccessHistogram====
//-- Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.tLastAccess.null
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) RETURN myMisc.bucketed(timestamp()/1000-p.tLastAccess, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.tLastAccess.nullRemoved
 MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p, r RETURN myMisc.bucketed(timestamp()/1000-p.tLastAccess, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.tLastAccess.all
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where RETURN myMisc.bucketed(timestamp()/1000-p.tLastAccess, $bucket) AS bucket, COUNT(p) AS nBucket
//----- 
====nAccessHistogram====
//-- Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.nAccess.null
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) RETURN myMisc.bucketed(p.nAccess, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.nAccess.nullRemoved
 MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p, r RETURN myMisc.bucketed(p.nAccess, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.nAccess.all
 MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where RETURN myMisc.bucketed(p.nAccess, $bucket) AS bucket, COUNT(p) AS nBucket
//----- 

//
// Image
// 

===image===
====siteHistogram====
//-- Should maybe be renamed to site instead of parentSite?!
//-- Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.image.parentSite.null
 MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) RETURN null AS bucket, COUNT(i) AS nBucket
//----- Hist.image.parentSite.nullRemoved
 MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT s, i RETURN s.name AS bucket, COUNT(i) AS nBucket 
//----- Hist.image.parentSite.all
 MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT s, i RETURN s.name AS bucket, COUNT(i) AS nBucket 
 UNION
 MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) RETURN null AS bucket, COUNT(i) AS nBucket
//----- 
//----- Hist.image.parentSite.null.nInRelaxedCond
 MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) RETURN COUNT(i) AS nInRelaxedCond
//----- Hist.image.parentSite.nullRemoved.nInRelaxedCond
 MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT s, i RETURN COUNT(*) AS nInRelaxedCond
//----- Hist.image.parentSite.all.nInRelaxedCond
 MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT s, i WITH collect([s.name, i.nameLC]) AS rows
 MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) WITH rows+collect([null, i.nameLC]) AS allRows
 UNWIND allRows as row
 RETURN COUNT(row) AS nInRelaxedCond
//----- 
 // WITH DISTINCT row AS rowDistinct
 // RETURN COUNT(rowDistinct) AS nInRelaxedCond
 
====parentHistogram====
 //-- Different query depending on siteFilter:
//----- Hist.image.parent.null
 MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) RETURN null AS bucket, COUNT(i.nameLC) AS nBucket
//----- Hist.image.parent.nullRemoved
 MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT p, i RETURN p.idPage AS bucket, COUNT(i) AS nBucket 
//----- Hist.image.parent.all
 MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT p, i RETURN p.idPage AS bucket, COUNT(i) AS nBucket 
 UNION
 MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) RETURN null AS bucket, COUNT(i) AS nBucket
//----- 
//----- Hist.image.parent.null.nInRelaxedCond
 MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) RETURN COUNT(i) AS nInRelaxedCond
//----- Hist.image.parent.nullRemoved.nInRelaxedCond
 MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT p, i RETURN COUNT(i) AS nInRelaxedCond
//----- Hist.image.parent.all.nInRelaxedCond
 MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT p, i WITH collect([p.idPage, i.nameLC]) AS rows
 MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) WITH rows+collect([null, i.nameLC]) AS allRows
 UNWIND allRows as row
 RETURN COUNT(row) AS nInRelaxedCond
//----- 

====extensionHistogram====
 //-- Different query depending on parentFilter or siteFilter:
//----- Hist.image.extension.null
 MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) RETURN i.extension AS bucket, COUNT(i) AS nBucket
//----- Hist.image.extension.nullRemoved
 MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT i RETURN  i.extension AS bucket, COUNT(i) AS nBucket  
//----- Hist.image.extension.all
 MATCH (i:Image) $whereWExt i.boGotData RETURN i.extension AS bucket, COUNT(i) AS nBucket 
//----- 


====sizeHistogram====
 //-- Different query depending on parentFilter or siteFilter:
//----- Hist.image.size.null
 MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) RETURN myMisc.bucketed(i.size, $bucket) AS bucket, COUNT(i) AS nBucket
//----- Hist.image.size.nullRemoved
 MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT i RETURN  myMisc.bucketed(i.size, $bucket) AS bucket, COUNT(i) AS nBucket  
//----- Hist.image.size.all
 MATCH (i:Image) $whereWExt i.boGotData RETURN myMisc.bucketed(i.size, $bucket) AS bucket, COUNT(i) AS nBucket 
//----- 

====boOtherHistogram====
 //-- Different query depending on parentFilter or siteFilter:
//----- Hist.image.boOther.null
 MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) RETURN i.boOther AS bucket, COUNT(i) AS nBucket
//----- Hist.image.boOther.nullRemoved
 MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT i RETURN i.boOther AS bucket, COUNT(i) AS nBucket
//----- Hist.image.boOther.all
 MATCH (i:Image) $whereWExt i.boGotData RETURN i.boOther AS bucket, COUNT(i) AS nBucket
//----- 


====tCreatedHistogram====
 //-- Different query depending on parentFilter or siteFilter:
//----- Hist.image.tCreated.null
 MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) RETURN myMisc.bucketed(timestamp()/1000-i.tCreated, $bucket) AS bucket, COUNT(i) AS nBucket
//----- Hist.image.tCreated.nullRemoved
 MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT i RETURN  myMisc.bucketed(timestamp()/1000-i.tCreated, $bucket) AS bucket, COUNT(i) AS nBucket  
//----- Hist.image.tCreated.all
 MATCH (i:Image) $whereWExt i.boGotData RETURN myMisc.bucketed(timestamp()/1000-i.tCreated, $bucket) AS bucket, COUNT(i) AS nBucket
//----- 
====tModHistogram====
 //-- Different query depending on parentFilter or siteFilter:
//----- Hist.image.tMod.null
 MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) RETURN myMisc.bucketed(timestamp()/1000-i.tMod, $bucket) AS bucket, COUNT(i) AS nBucket
//----- Hist.image.tMod.nullRemoved
 MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT i RETURN  myMisc.bucketed(timestamp()/1000-i.tMod, $bucket) AS bucket, COUNT(i) AS nBucket  
//----- Hist.image.tMod.all
 MATCH (i:Image) $whereWExt i.boGotData RETURN myMisc.bucketed(timestamp()/1000-i.tMod, $bucket) AS bucket, COUNT(i) AS nBucket
//----- 
====tLastAccessHistogram====
 //-- Different query depending on parentFilter or siteFilter:
//----- Hist.image.tLastAccess.null
 MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) RETURN myMisc.bucketed(timestamp()/1000-i.tLastAccess, $bucket) AS bucket, COUNT(i) AS nBucket
//----- Hist.image.tLastAccess.nullRemoved
 MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT i RETURN  myMisc.bucketed(timestamp()/1000-i.tLastAccess, $bucket) AS bucket, COUNT(i) AS nBucket  
//----- Hist.image.tLastAccess.all
 MATCH (i:Image) $whereWExt i.boGotData RETURN myMisc.bucketed(timestamp()/1000-i.tLastAccess, $bucket) AS bucket, COUNT(i) AS nBucket
//----- 
====nAccessHistogram====
 //-- Different query depending on parentFilter or siteFilter:
//----- Hist.image.nAccess.null
 MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) RETURN myMisc.bucketed(i.nAccess, $bucket) AS bucket, COUNT(i) AS nBucket
//----- Hist.image.nAccess.nullRemoved
 MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT i RETURN  myMisc.bucketed(i.nAccess, $bucket) AS bucket, COUNT(i) AS nBucket  
//----- Hist.image.nAccess.all
 MATCH (i:Image) $whereWExt i.boGotData RETURN myMisc.bucketed(i.nAccess, $bucket) AS bucket, COUNT(i) AS nBucket 
//----- 
 



