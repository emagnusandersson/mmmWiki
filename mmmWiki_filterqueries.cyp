



  // The filters may look these ways (otherwise they are not allowed):
  // If it is a whitelist: [] OR [null] OR [nonNullA, nonNullB, ...]
  // If it is a blacklist: [] OR [null] OR [null, nonNullA, nonNullB, ...]
  
  
  
==Creating lists==
===page===
//----- List.page.column
s.boTLS AS boTLS, s.name AS siteName, s.www AS www, p.name AS pageName, p.boOR AS boOR, p.boOW AS boOW, p.boSiteMap AS boSiteMap, p.tCreated AS tCreated, r.tMod AS tMod, r.tModCache AS tModCache, r.iRev AS lastRev, p.boOther AS boOther, p.idPage AS idPage, r.size AS size, p.nChild AS nChild, p.nImage AS nImage, p.tLastAccess AS tLastAccess, p.nAccess AS nAccess
//-----
// Different query depending on parentfilter: null, nullRemoved, all
// Because of "relationship uniqueness" the "nullRemoved"-query needs a separate MATCH for "ppcount"
//----- List.page.null
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) RETURN $column, null AS nameParent, null AS idParent, 0 AS nParent
//----- List.page.nullRemoved
MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where
MATCH (ppcount:Page)-[:hasChild]->(p:Page) RETURN $column, MIN(ppcount.name) AS nameParent, MIN(ppcount.idPage) AS idParent, COUNT(ppcount) AS nParent
//----- List.page.all
MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where RETURN $column, MIN(pp.name) AS nameParent, MIN(pp.idPage) AS idParent, COUNT(pp) AS nParent
UNION
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) RETURN $column, null AS nameParent, null AS idParent, 0 AS nParent
//----- 

   // Alternative query for listing pages. Handles all parentfilters, doesn't need different templates for the query, but is probably slower.
 //MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where 
 //OPTIONAL MATCH (pp:Page)-[:hasChild]->(p)
 //WITH pp, r, s, p
 //$wherePP
 //RETURN $column, MIN(pp.name) AS nameParent, MIN(pp.idPage) AS idParent, COUNT(pp) AS nParent

===image===
//----- List.image.column
i.name AS imageName, i.boOther AS boOther, i.idImage AS idImage, i.size AS size, i.extension AS extension, i.tCreated AS tCreated, i.tMod AS tMod, i.tLastAccess AS tLastAccess, i.nAccess AS nAccess
//-----
 // Different query depending on parentFilter or siteFilter:
 // Only one parentFilter / siteFilter can be active (something other than "All") at a time:
//----- List.image.null
MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) RETURN $column, null AS nameParent, null AS idParent, 0 AS nParent
//----- List.image.nullRemoved
MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData 
MATCH (pcount:Page)-[:hasImage]->(i:Image) RETURN $column, MIN(pcount.name) AS nameParent, MIN(pcount.idPage) AS idParent, COUNT(pcount) AS nParent
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



==Creating histograms==


//
// Page
// 

===page===
====parentHistogram====
// UNION does not allow postprocessing so that query is not really sorted correctly
//----- Hist.page.parent
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p))  RETURN null AS bucket, COUNT(p) AS nBucket
UNION
MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where RETURN pp.idPage AS bucket, COUNT(p) AS nBucket ORDER BY nBucket DESC
//----- 
//----- Hist.page.parent.nInRelaxedCond
MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH collect([pp.idPage, p.idPage]) AS rows
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p))  WITH rows+collect([null, p.idPage]) AS allRows
UNWIND allRows AS row
WITH DISTINCT row AS rowDistinct
RETURN COUNT(rowDistinct) AS nInRelaxedCond
//----- 

====siteHistogram====
// Should maybe be renamed to site instead of siteName?!
// Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.siteName.null
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) RETURN s.name AS bucket, COUNT(p) AS nBucket ORDER BY nBucket DESC
//----- Hist.page.siteName.nullRemoved
MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT s.name AS name, p.idPage AS idPage RETURN name AS bucket, COUNT(idPage) AS nBucket ORDER BY nBucket DESC
//----- Hist.page.siteName.all
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where RETURN s.name AS bucket, COUNT(p) AS nBucket ORDER BY nBucket DESC
//----- 
//----- Hist.page.siteName.null.nInRelaxedCond
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) RETURN COUNT(p) AS nInRelaxedCond
//----- Hist.page.siteName.nullRemoved.nInRelaxedCond
MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p.idPage AS idPage RETURN COUNT(idPage) AS nInRelaxedCond
//----- Hist.page.siteName.all.nInRelaxedCond
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where RETURN COUNT(p) AS nInRelaxedCond
//----- 

====sizeHistogram====
// Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.size.return
RETURN myMisc.bucketed(r.size, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.size.null
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) $return
//----- Hist.page.size.nullRemoved
MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p, r $return
//----- Hist.page.size.all
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where $return
//----- 
====nChildHistogram====
// Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.nChild.return
RETURN myMisc.bucketed(p.nChild, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.nChild.null
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) $return
//----- Hist.page.nChild.nullRemoved
MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p, r $return
//----- Hist.page.nChild.all
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where $return
//----- 
====nImageHistogram====
// Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.nImage.return
RETURN myMisc.bucketed(p.nImage, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.nImage.null
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) $return
//----- Hist.page.nImage.nullRemoved
MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p, r $return
//----- Hist.page.nImage.all
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where $return
//----- 

====boORHistogram====
// Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.boOR.return
RETURN p.boOR AS bucket, COUNT(p) AS nBucket
//----- Hist.page.boOR.null
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) $return
//----- Hist.page.boOR.nullRemoved
MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p $return
//----- Hist.page.boOR.all
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where $return
//----- 
====boOWHistogram====
// Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.boOW.return
RETURN p.boOW AS bucket, COUNT(p) AS nBucket
//----- Hist.page.boOW.null
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) $return
//----- Hist.page.boOW.nullRemoved
MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p $return
//----- Hist.page.boOW.all
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where $return
//----- 
====boSiteMapHistogram====
// Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.boSiteMap.return
RETURN p.boSiteMap AS bucket, COUNT(p) AS nBucket
//----- Hist.page.boSiteMap.null
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) $return
//----- Hist.page.boSiteMap.nullRemoved
MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p $return
//----- Hist.page.boSiteMap.all
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where $return
//----- 
====boTalkHistogram====
// Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.boTalk.return
RETURN p.boTalk AS bucket, COUNT(p) AS nBucket
//----- Hist.page.boTalk.null
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) $return
//----- Hist.page.boTalk.nullRemoved
MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p $return
//----- Hist.page.boTalk.all
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where $return
//----- 
====boTemplateHistogram====
// Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.boTemplate.return
RETURN p.boTemplate AS bucket, COUNT(p) AS nBucket
//----- Hist.page.boTemplate.null
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) $return
//----- Hist.page.boTemplate.nullRemoved
MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p $return
//----- Hist.page.boTemplate.all
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where $return
//----- 
====boOtherHistogram====
// Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.boOther.return
RETURN r.boOther AS bucket, COUNT(p) AS nBucket
//----- Hist.page.boOther.null
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) $return
//----- Hist.page.boOther.nullRemoved
MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p, r $return
//----- Hist.page.boOther.all
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where $return
//----- 

====tCreatedHistogram====
// Different query depending on parentfilter: null, nullRemoved, all
// [0, 86400, 604800, 1209600, 2419200]
//----- Hist.page.tCreated.return
RETURN myMisc.bucketed(timestamp()/1000-p.tCreated, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.tCreated.null
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) $return
//----- Hist.page.tCreated.nullRemoved
MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p, r $return
//----- Hist.page.tCreated.all
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where $return
//----- 
====tModHistogram====
// Different query depending on parentfilter: null, nullRemoved, all
// [0, 86400, 604800, 1209600, 2419200]
//----- Hist.page.tMod.return
RETURN myMisc.bucketed(timestamp()/1000-r.tMod, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.tMod.null
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) $return
//----- Hist.page.tMod.nullRemoved
MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p, r $return
//----- Hist.page.tMod.all
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where $return
//----- 
====tModCacheHistogram====
// Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.tModCache.return
RETURN myMisc.bucketed(timestamp()/1000-r.tModCache, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.tModCache.null
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) $return
//----- Hist.page.tModCache.nullRemoved
MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p, r $return
//----- Hist.page.tModCache.all
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where $return
//----- 
====tLastAccessHistogram====
// Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.tLastAccess.return
RETURN myMisc.bucketed(timestamp()/1000-p.tLastAccess, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.tLastAccess.null
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) $return
//----- Hist.page.tLastAccess.nullRemoved
MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p, r $return
//----- Hist.page.tLastAccess.all
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where $return
//----- 
====nAccessHistogram====
// Different query depending on parentfilter: null, nullRemoved, all
//----- Hist.page.nAccess.return
RETURN myMisc.bucketed(p.nAccess, $bucket) AS bucket, COUNT(p) AS nBucket
//----- Hist.page.nAccess.null
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $whereWExt (NOT (:Page)-[:hasChild]->(p)) $return
//----- Hist.page.nAccess.nullRemoved
MATCH (pp:Page)-[:hasChild]->(p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where WITH DISTINCT p, r $return
//----- Hist.page.nAccess.all
MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) $where $return
//----- 

//
// Image
// 

===image===
====siteHistogram====
// Should maybe be renamed to site instead of parentSite?!
// Different query depending on parentfilter: null, nullRemoved, all
// UNION does not allow postprocessing so that query is not really sorted correctly
//----- Hist.image.parentSite.null
MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) RETURN null AS bucket, COUNT(i) AS nBucket ORDER BY nBucket DESC
//----- Hist.image.parentSite.nullRemoved
MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT s, i RETURN s.name AS bucket, COUNT(i) AS nBucket ORDER BY nBucket DESC
//----- Hist.image.parentSite.all
MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) RETURN null AS bucket, COUNT(i) AS nBucket
UNION
MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT s, i RETURN s.name AS bucket, COUNT(i) AS nBucket ORDER BY nBucket DESC
//----- 
//----- Hist.image.parentSite.null.nInRelaxedCond
MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) RETURN COUNT(i) AS nInRelaxedCond
//----- Hist.image.parentSite.nullRemoved.nInRelaxedCond
MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT s, i RETURN COUNT(*) AS nInRelaxedCond
//----- Hist.image.parentSite.all.nInRelaxedCond
MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT s, i WITH collect([s.name, i.nameLC]) AS rows
MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) WITH rows+collect([null, i.nameLC]) AS allRows
UNWIND allRows AS row
RETURN COUNT(row) AS nInRelaxedCond
//----- 
 // WITH DISTINCT row AS rowDistinct
 // RETURN COUNT(rowDistinct) AS nInRelaxedCond
 
====parentHistogram====
// Different query depending on siteFilter:
// UNION does not allow postprocessing so that query is not really sorted correctly
//----- Hist.image.parent.null
MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) RETURN null AS bucket, COUNT(i.nameLC) AS nBucket ORDER BY nBucket DESC
//----- Hist.image.parent.nullRemoved
MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT p, i RETURN p.idPage AS bucket, COUNT(i) AS nBucket ORDER BY nBucket DESC
//----- Hist.image.parent.all
MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) RETURN null AS bucket, COUNT(i) AS nBucket
UNION
MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT p, i RETURN p.idPage AS bucket, COUNT(i) AS nBucket ORDER BY nBucket DESC
//----- 
//----- Hist.image.parent.null.nInRelaxedCond
MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) RETURN COUNT(i) AS nInRelaxedCond
//----- Hist.image.parent.nullRemoved.nInRelaxedCond
MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT p, i RETURN COUNT(i) AS nInRelaxedCond
//----- Hist.image.parent.all.nInRelaxedCond
MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT p, i WITH collect([p.idPage, i.nameLC]) AS rows
MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) WITH rows+collect([null, i.nameLC]) AS allRows
UNWIND allRows AS row
RETURN COUNT(row) AS nInRelaxedCond
//----- 

====extensionHistogram====
 // Different query depending on parentFilter or siteFilter:
//----- Hist.image.extension.return
RETURN i.extension AS bucket, COUNT(i) AS nBucket
//----- Hist.image.extension.null
MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) $return
//----- Hist.image.extension.nullRemoved
MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT i $return  
//----- Hist.image.extension.all
MATCH (i:Image) $whereWExt i.boGotData $return 
//----- 


====sizeHistogram====
 // Different query depending on parentFilter or siteFilter:
//----- Hist.image.size.return
RETURN myMisc.bucketed(i.size, $bucket) AS bucket, COUNT(i) AS nBucket
//----- Hist.image.size.null
MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) $return
//----- Hist.image.size.nullRemoved
MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT i $return  
//----- Hist.image.size.all
MATCH (i:Image) $whereWExt i.boGotData $return 
//----- 

====boOtherHistogram====
 // Different query depending on parentFilter or siteFilter:
//----- Hist.image.boOther.return
RETURN i.boOther AS bucket, COUNT(i) AS nBucket
//----- Hist.image.boOther.null
MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) $return
//----- Hist.image.boOther.nullRemoved
MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT i $return
//----- Hist.image.boOther.all
MATCH (i:Image) $whereWExt i.boGotData $return
//----- 


====tCreatedHistogram====
 // Different query depending on parentFilter or siteFilter:
//----- Hist.image.tCreated.return
RETURN myMisc.bucketed(timestamp()/1000-i.tCreated, $bucket) AS bucket, COUNT(i) AS nBucket
//----- Hist.image.tCreated.null
MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) $return
//----- Hist.image.tCreated.nullRemoved
MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT i $return  
//----- Hist.image.tCreated.all
MATCH (i:Image) $whereWExt i.boGotData $return
//----- 
====tModHistogram====
 // Different query depending on parentFilter or siteFilter:
//----- Hist.image.tMod.return
RETURN myMisc.bucketed(timestamp()/1000-i.tMod, $bucket) AS bucket, COUNT(i) AS nBucket
//----- Hist.image.tMod.null
MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) $return
//----- Hist.image.tMod.nullRemoved
MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT i $return  
//----- Hist.image.tMod.all
MATCH (i:Image) $whereWExt i.boGotData $return
//----- 
====tLastAccessHistogram====
 // Different query depending on parentFilter or siteFilter:
//----- Hist.image.tLastAccess.return
RETURN myMisc.bucketed(timestamp()/1000-i.tLastAccess, $bucket) AS bucket, COUNT(i) AS nBucket
//----- Hist.image.tLastAccess.null
MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) $return
//----- Hist.image.tLastAccess.nullRemoved
MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT i $return  
//----- Hist.image.tLastAccess.all
MATCH (i:Image) $whereWExt i.boGotData $return
//----- 
====nAccessHistogram====
 // Different query depending on parentFilter or siteFilter:
//----- Hist.image.nAccess.return
RETURN myMisc.bucketed(i.nAccess, $bucket) AS bucket, COUNT(i) AS nBucket
//----- Hist.image.nAccess.null
MATCH (i:Image) $whereWExt i.boGotData AND (NOT (:Page)-[:hasImage]->(i)) $return
//----- Hist.image.nAccess.nullRemoved
MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasImage]->(i:Image) $whereWExt i.boGotData WITH DISTINCT i $return  
//----- Hist.image.nAccess.all
MATCH (i:Image) $whereWExt i.boGotData $return 
//----- 
 



