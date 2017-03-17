
AMinusB=function(A,B){var ANew=[]; for(var i=0;i<A.length;i++){var a=A[i]; if(B.indexOf(a)==-1) ANew.push(a);} return ANew;}  // Does not change A, returns ANew
AMinusBM=function(A,B){var Rem=[]; for(var i=A.length-1;i>=0;i--){var a=A[i]; if(B.indexOf(a)==-1) Rem.push(a); else A.splice(i,1);} return Rem.reverse();}  // Changes A, returns the remainder


testIfTalkOrTemplate=function(str){ return {boTalk:RegExp('^(template_)?talk:').test(str), boTemplate:RegExp('^template(_talk)?:').test(str)}; }
calcTalkName=function(strName){
  var oTmp=testIfTalkOrTemplate(strName), boTalk=oTmp.boTalk, boTemplate=oTmp.boTemplate;
  if(boTalk) return {boErrAlreadyTalk:1, strTalkName:""};
  if(boTemplate) var strTalkName='template_talk:'.concat(strName.substr(9)); else var strTalkName='talk:'+strName;
  return {boErrAlreadyTalk:0, strTalkName:strTalkName};
}
neo4jConvertInt=function(objNeoInt){var n=objNeoInt.low+Math.pow(2,32)*objNeoInt.high; var err=null; if(!Number.isSafeInteger(n)) {err='neo4j integer is out of range for javascript';} return [err,n]; }
neo4jConvertIntProp=function(obj,StrProp){ // "obj"=object, StrProp=Array of properties (given as strings). Run neo4jConvertInt() for each property given in StrProp 
  for(var i=0;i<StrProp.length;i++) {
    var strProp=StrProp[i], tmp=neo4jConvertInt(obj[strProp]);  
    if(tmp[0]) return tmp[0]; obj[strProp]=tmp[1];
  }  
  return null;
}



splitCql=function(text){
  var regCql=new RegExp('//-----\\s*([a-zA-Z0-9 ]+?)\\n','g')
  var arrCqlName=[], arrCqlStart=[], arrCqlEnd=[], objCql={};
  while (match = regCql.exec(text)) {  arrCqlName.push(match[1]);  arrCqlStart.push(match.index);  }
  for(var i=0;i<arrCqlStart.length-1;i++){ arrCqlEnd[i]=arrCqlStart[i+1];}   if(arrCqlStart.length) arrCqlEnd.push(text.length);
  for(var i=0;i<arrCqlStart.length;i++){ objCql[arrCqlName[i]]=text.substring(arrCqlStart[i],arrCqlEnd[i]);} 
  return objCql;
}


deletePageID=function*(){
  var tx = session.beginTransaction();
  
  var strCqlOrg=`
      //-- Get Site
    MATCH (s:Site { www:$www })-[:hasPage]->(p:Page { nameLC:$strNameLC })
    WITH s, p
      //-- Delete Revisions
    MATCH (p)-[h:hasRevision]->(r:Revision)
    DETACH DELETE r
    WITH p
      //-- Delete Child links
    MATCH (p)-[hc:hasChild]->(c:Page)
    DELETE hc
    WITH p
      //-- Remove Orphan Stubs
    MATCH (cOrphan:Page) WHERE (NOT (:Page)-[:hasChild]->(cOrphan)) AND (NOT (cOrphan)-[:hasRevision]->(:Revision))
    DETACH DELETE cOrphan`;

  var Val={www:www, strNameLC:strNameLC}; 
  var strNameLC=strName.toLowerCase(); 
  extend(Val, {www:www, strNameLC:strNameLC});
  tx.run(strCqlOrg, Val).then(function(record){
    flowStart.next();
  }).catch(function(error){debugger; console.log(error); var boDoExit=1;flowStart.next();})
  yield;
  if(typeof boDoExit !== "undefined" ) { tx.rollback(); return; }

  
  tx.commit().subscribe({
    onCompleted: function() { session.close();  },
    onError: function(error) {console.log(error);}
  });
}



childrenCreateNRemove=function*(Val, StrNewLink, tx, flow){

  var strCqlOrg=`
      //----- Get Old Links
    MATCH (s:Site {name:$strSiteName})-[:hasPage]->(:Page { nameLC:$strNameLC })-[h:hasChild]->(c:Page)
    RETURN c.nameLC
      //----- AddNewChildRelations
    MATCH (s:Site {name:$strSiteName})-[:hasPage]->(p:Page {nameLC:$strNameLC})
    WITH s, p
    MATCH (s)-[:hasPage]->(cNew:Page) WHERE cNew.nameLC IN $StrToCreate
    WITH s, p, cNew
    MERGE (p)-[:hasChild]->(cNew)
    RETURN p
      //----- SetStaleParents
    MATCH (s:Site {name:$strSiteName})-[:hasPage]->(p:Page {nameLC:$strNameLC})
    WITH s, p
    MATCH (par:Page)-[:hasChild]->(p) 
    SET par.boStale=true
      //----- RemoveOldChildRelations
    MATCH (s:Site {name:$strSiteName})-[:hasPage]->(p:Page {nameLC:$strNameLC})
    WITH s, p
    MATCH (p)-[rOld:hasChild]->(cOld:Page) WHERE cOld.nameLC IN $StrToRemove
    DETACH DELETE rOld
      //----- RemoveOrphanStubs
    MATCH (cOrphan:Page) WHERE (NOT (:Page)-[:hasChild]->(cOrphan)) AND (NOT (cOrphan)-[:hasRevision]->(:Revision))
    DETACH DELETE cOrphan`;
  var objCql=splitCql(strCqlOrg);

  var err=null;


  var StrOldLink=[];
  tx.run(objCql['Get Old Links'], Val).then(function(record){ 
    var arrTmp=record.records;  for(var i=0;i<arrTmp.length;i++) {StrOldLink[i]=arrTmp[i]._fields[0];}
    flow.next();
  }).catch(function(error){debugger; console.log(error); var boDoExit=1;flow.next();})
  yield;
  if(typeof boDoExit !== "undefined" ) { tx.rollback(); return; }
    
    
  var StrCql=[]; 
  var StrNewLinkLC=[]; for(var i=0;i<StrNewLink.length;i++) StrNewLinkLC[i]=StrNewLink[i].toLowerCase();  // arrSub = [['starta',0], ['startb',1]], 
  var StrToCreate=AMinusB(StrNewLinkLC,StrOldLink);
  var StrToRemove=AMinusB(StrOldLink,StrNewLinkLC);
  if(StrToCreate.length){
    var StrTmp=[]; for(var i=0;i<StrToCreate.length;i++){ StrTmp[i]="MERGE (s)-[:hasPage]->(:Page { nameLC:'"+StrToCreate[i]+"' })"; }
    StrTmp.unshift('MATCH (s:Site {name:$strSiteName}) WITH s');
    StrCql.push(StrTmp.join('\n'));
    var strCql=StrCql.join('\n'); 
    tx.run(strCql, Val).then(function(record){
      flow.next();
    }).catch(function(error){debugger; console.log(error); var boDoExit=1;flow.next();});
    yield;
    if(typeof boDoExit !== "undefined" ) { tx.rollback(); return; }
  }

  extend(Val, {StrToCreate:StrToCreate, StrToRemove:StrToRemove});


  tx.run(objCql['AddNewChildRelations'], Val).then(function(record){
    flow.next(); }).catch(function(error){debugger; console.log(error); err=error; var boDoExit=1;flow.next();});
  yield;
  if(typeof boDoExit !== "undefined" ) { return err; }

  tx.run(objCql['SetStaleParents'], Val).then(function(record){
    flow.next(); }).catch(function(error){debugger; console.log(error); err=error; var boDoExit=1;flow.next();});
  yield;
  if(typeof boDoExit !== "undefined" ) { return err; }

  tx.run(objCql['RemoveOldChildRelations'], Val).then(function(record){
    flow.next(); }).catch(function(error){debugger; console.log(error); err=error; var boDoExit=1;flow.next();});
  yield;
  if(typeof boDoExit !== "undefined" ) { return err; }

  tx.run(objCql['RemoveOrphanStubs'], Val).then(function(record){
    flow.next(); }).catch(function(error){debugger; console.log(error); err=error; var boDoExit=1;flow.next();});
  yield;
  if(typeof boDoExit !== "undefined" ) { return err; }
  return null;
}


saveWhenUploading=function*(){
  var tx = session.beginTransaction();
  
  var strCqlOrg=`
      //----- Create Site if necessary
    MERGE (s:Site { name:$strSiteName })   ON CREATE SET s += { www:$www, boTLS:FALSE, googleAnalyticsTrackingID:"", urlIcon16:"", urlIcon200:"", aPassword:"", vPassword:"" }
    RETURN s   
      //----- Remaining
      //-- Create Page if necessary
    MERGE (s)-[:hasPage]->(p:Page { nameLC:$strNameLC })
    ON CREATE SET p.created=timestamp(), p.nAccess=0
    WITH p
      //-- Set Page properties
    SET p.name=$strName, p.boTalk=FALSE, p.boTemplate=FALSE, p.boOR=FALSE, p.boOW=FALSE, p.boSiteMap=FALSE, p.nChild=9, p.nImage=10, p.lastRev=0 
    WITH p
      //-- Create revision 0 if necessary
    MERGE (p)-[h:hasRevision]->(r:Revision {revision:0})
    SET r.tMod=timestamp(), r.data=$data, r.size=$size, r.eTag=$eTag 
    WITH p
      //-- Delete revision gt 0
    MATCH (p)-[h:hasRevision]->(r:Revision) WHERE r.revision<>0
    DETACH DELETE r`;
  var objCql=splitCql(strCqlOrg);

  var boTLS=false, eTag='bbb';
  //if(typeof strSiteName=='undefined') var strSiteName=''; 
  var www=randomHash().substr(0,7), Val={strSiteName:strSiteName, www:www};
  tx.run(objCql['Create Site if necessary'], Val).then(function(record){ 
    var fields=record.records[0]._fields; 
    if(fields[0]) {site=fields[0].properties; www=site.www; strSiteName=site.name;  }
    flowStart.next();
  }).catch(function(error){debugger; console.log(error); var boDoExit=1;flowStart.next();})
  yield;
  if(typeof boDoExit !== "undefined" ) { tx.rollback(); return; }

  
  var strNameLC=strName.toLowerCase(); 
  Val={strSiteName:strSiteName, strNameLC:strNameLC, strName:strName, data:data, size:data.length, eTag:eTag};
  tx.run(objCql['Remaining'], Val).then(function(record){
    flowStart.next();
  }).catch(function(error){debugger; console.log(error); var boDoExit=1;flowStart.next();})
  yield;
  if(typeof boDoExit !== "undefined" ) { tx.rollback(); return; }

  
    // childrenCreateNRemove
  var Val={strSiteName:strSiteName, strNameLC:strNameLC};
  var err=yield *childrenCreateNRemove(Val,StrNewLink,tx,flowStart);
  if(err) { tx.rollback(); return; }

  
  tx.commit().subscribe({
    onCompleted: function() {
       session.close();  },
    onError: function(error) {
      console.log(error);}
  });
}



saveByReplace=function*(){
  var tx = session.beginTransaction();
  
  var strCqlOrg=`
      //----- Create Site if necessary
    MERGE (s:Site { www:$www })   ON CREATE SET s += { name:$strSiteName, boTLS:$boTLS, googleAnalyticsTrackingID:"", urlIcon16:"", urlIcon200:"", aPassword:"", vPassword:"" }
    RETURN s 
    
      //----- Create Page if necessary
    MATCH (s:Site { name:$strSiteName })
    WITH s
    MERGE (s)-[:hasPage]->(p:Page { nameLC:$strNameLC })
    ON CREATE SET p.created=timestamp(), p.nAccess=0, p.tMod=0
    RETURN p

      //----- Remaining
    MATCH (s:Site { name:$strSiteName })-[:hasPage]->(p:Page { nameLC:$strNameLC })
      //-- Set Page properties
    SET p.name=$strName, p.boTalk=FALSE, p.boTemplate=FALSE, p.boOR=FALSE, p.boOW=FALSE, p.boSiteMap=FALSE, p.nChild=9, p.nImage=10, p.lastRev=0, p.tMod=timestamp()
    WITH p
      //-- Create revision 0 if necessary 
    MERGE (p)-[h:hasRevision]->(r:Revision {revision:0})
    SET r.tMod=timestamp(), r.data=$data, r.size=$size, r.eTag=$eTag 
    WITH p
      //-- Delete revision >0 
    MATCH (p)-[h:hasRevision]->(r:Revision) WHERE r.revision<>0
    DETACH DELETE r`;
  var objCql=splitCql(strCqlOrg);
     
  var boTLS=false, eTag='bbb';
  var strSiteName=randomHash().substr(0,7);
  var Val={www:www, strSiteName:strSiteName, boTLS:boTLS}; 
  tx.run(objCql['Create Site if necessary'], Val).then(function(record){ 
    var fields=record.records[0]._fields; 
    if(fields[0]) {site=fields[0].properties; www=site.www; strSiteName=site.name;  }
    flowStart.next();
  }).catch(function(error){debugger; console.log(error); var boDoExit=1;flowStart.next();})
  yield;
  if(typeof boDoExit !== "undefined" ) { tx.rollback(); return; }

  
  var strNameLC=strName.toLowerCase(); 
  var Val={strSiteName:strSiteName, strNameLC:strNameLC, strName:strName, data:data, size:data.length, eTag:eTag}; 
  tx.run(objCql['Create Page if necessary'], Val).then(function(record){
    flowStart.next();
  }).catch(function(error){debugger; console.log(error); var boDoExit=1;flowStart.next();})
  yield;
  if(typeof boDoExit !== "undefined" ) { tx.rollback(); return; }
  

  var strNameLC=strName.toLowerCase(); 
  var Val={strSiteName:strSiteName, strNameLC:strNameLC, strName:strName, data:data, size:data.length, eTag:eTag};
  tx.run(objCql['Remaining'], Val).then(function(record){
    flowStart.next();
  }).catch(function(error){debugger; console.log(error); var boDoExit=1;flowStart.next();})
  yield;
  if(typeof boDoExit !== "undefined" ) { tx.rollback(); return; }


    // childrenCreateNRemove
  var Val={strSiteName:strSiteName, strNameLC:strNameLC};
  var err=yield *childrenCreateNRemove(Val,StrNewLink,tx,flowStart);
  if(err) { tx.rollback(); return; }

  
  tx.commit().subscribe({
    onCompleted: function() {
       session.close();  },
    onError: function(error) {
      console.log(error);}
  });
}


saveByAdd=function*(){
  var tx = session.beginTransaction();
  
  var strCqlOrg=`
      //-- Get Site
    OPTIONAL MATCH (s:Site { www:$www })
    WITH s

      //-- Count revision
    OPTIONAL MATCH (s)-[:hasPage]->(p:Page { nameLC:$strNameLC })-[h:hasRevision]->(r:Revision) 
    WITH COUNT(r) AS nr, p
      
      //-- Create Page if necessary
    MERGE (p)-[h:hasRevision]->(r:Revision {revision:nr})
    ON CREATE SET p.created=timestamp(), p.nAccess=0
    WITH p, nr
      //-- Set Page properties
    SET p.name=$strName, p.boTalk=FALSE, p.boTemplate=FALSE, p.boOR=FALSE, p.boOW=FALSE, p.boSiteMap=FALSE, p.nChild=9, p.nImage=10, p.lastRev=nr 
    WITH p, nr
      //-- Create revision 0 if necessary 
    MERGE (p)-[h:hasRevision]->(r:Revision {revision:nr})
    SET r.tMod=timestamp(), r.data=$data, r.size=$size, r.eTag=$eTag, r.summary=$summary, r.signature=$signature`;
 
  var boTLS=false, eTag='bbb', summary='me', signature='abc';
  if(typeof strSiteName=='undefined') var strSiteName='';if(typeof www=='undefined') var www='';if(typeof boTLS=='undefined') var boTLS=false; 
  var strNameLC=strName.toLowerCase(); 
  var Val={www:www, strNameLC:strNameLC, strName:strName, data:data, size:data.length, eTag:eTag, summary:summary, signature:signature };
  tx.run(strCqlOrg, Val).then(function(record){
    flowStart.next();
  }).catch(function(error){debugger; console.log(error); var boDoExit=1;flowStart.next();})
  yield;
  if(typeof boDoExit !== "undefined" ) { tx.rollback(); return; }


    // childrenCreateNRemove
  var Val={strSiteName:strSiteName, strNameLC:strNameLC};
  var err=yield *childrenCreateNRemove(Val,StrNewLink,tx,flowStart);
  if(err) { tx.rollback(); return; }  

  tx.commit().subscribe({
    onCompleted: function() { session.close();  },
    onError: function(error) {console.log(error);}
  });
}



setNewCache=function*(){
  var tx = session.beginTransaction();
  
  var strCqlOrg=`
      //----- Create Site if necessary
    MERGE (s:Site { www:$www })
    ON CREATE SET s += { name:$strSiteName, boTLS:$boTLS, googleAnalyticsTrackingID:"", urlIcon16:"", urlIcon200:"", aPassword:"", vPassword:"" }
    RETURN s

      //----- Remaining
      //-- Get site
    MATCH (s:Site { name:$strSiteName })
    WITH s
    MATCH (s)-[:hasPage]->(p:Page { nameLC:$strNameLC })-[h:hasRevision]->(r:Revision) WHERE r.revision=$revision
    WITH p,r
      //-- Set Page properties
    SET p.name=$strName, p.nChild=9, p.nImage=10, p.lastRev=0,   r.data=$data, r.size=$size, r.eTag=$eTag`;
  var objCql=splitCql(strCqlOrg);
  
  var boTLS=false, eTag='bbb';
  var revision=0;
  var strNameLC=strName.toLowerCase();

  var strSiteName=randomHash().substr(0,7);
  var Val={www:www, strSiteName:strSiteName, boTLS:boTLS};
  tx.run(objCql['Create Site if necessary'], Val).then(function(record){ 
    var fields=record.records[0]._fields; 
    if(fields[0]) {site=fields[0].properties; www=site.www; strSiteName=site.name;  }
    flowStart.next();
  }).catch(function(error){debugger; console.log(error); var boDoExit=1;flowStart.next();})
  yield;
  if(typeof boDoExit !== "undefined" ) { tx.rollback(); return; }

  var Val={strSiteName:strSiteName, strNameLC:strNameLC, revision:revision, strName:strName, data:data, size:data.length, eTag:eTag};  
  tx.run(objCql['Remaining'], Val).then(function(record){ 
    flowStart.next();
  }).catch(function(error){debugger; console.log(error); var boDoExit=1;flowStart.next();})
  yield;
  if(typeof boDoExit !== "undefined" ) { tx.rollback(); return; }
    

    // childrenCreateNRemove
  var Val={strSiteName:strSiteName, strNameLC:strNameLC};
  var err=yield *childrenCreateNRemove(Val,StrNewLink,tx,flowStart);
  if(err) { tx.rollback(); return; }
  
  tx.commit().subscribe({
    onCompleted: function() { session.close();  },
    onError: function(error) {console.log(error);}
  });
}




getInfoNData=function*(){
  var tx = session.beginTransaction();
  
  var strCqlOrg=`
      //----- Check if RedirDomain
    OPTIONAL MATCH (rd:RedirDomain { www:$www })  
    RETURN rd.url
    
      //----- Check if Redir
    OPTIONAL MATCH (s:Site { www:$www })
    WITH s
    OPTIONAL MATCH (s)-[:hasRedir]->(r:Redir { strNameLC:$strNameLC })
    RETURN s, r.url

    
      //----- Count sites resp default sites
    OPTIONAL MATCH (s:Site)
    WITH COUNT(s) AS ns
    OPTIONAL MATCH (sDefault:Site {boDefault:true})
    RETURN ns, COUNT(sDefault) AS nsDefault
    
        //-- Make sure there is a default site
      //----- MakeDefaultSite0X
      //-- If ns=0
    CREATE (sDefault:Site { name:$strRnd, www:$www, boTLS:$boTLS, googleAnalyticsTrackingID:"", urlIcon16:"", urlIcon200:"", aPassword:"", vPassword:"", boDefault:true })
    RETURN sDefault
      //----- MakeDefaultSite10
      //-- If ns>0 && nsDefault=0
    MATCH (sDefault:Site) 
    WITH sDefault LIMIT 1
    SET sDefault.boDefault=true;
    RETURN sDefault
      //----- MakeDefaultSite11
      //-- If ns>0 && nsDefault=1
    MATCH (sDefault:Site {boDefault:true}) 
    RETURN sDefault


        //----- checkPageNTalkExistance
      //-- Check if page exist
    OPTIONAL MATCH (s:Site { name:$strSiteName })-[:hasPage]->(p:Page { nameLC:$strNameLC })
    WITH p
      //-- Check if talkPage Exist
    OPTIONAL MATCH (s:Site { name:$strSiteName })-[:hasPage]->(t:Page { nameLC:$strTalkNameLC })  
    RETURN p, t
    
    
      //----- Get revision table
    OPTIONAL MATCH (s:Site { name:$strSiteName })-[:hasPage]->(p:Page { nameLC:$strNameLC })-[h:hasRevision]->(r:Revision)
    RETURN r`;
  var objCql=splitCql(strCqlOrg);
   
  var www='localhost:5000', boTLS=false;
  var strName='start'; 


  var Val={www:www};
  tx.run(objCql['Check if RedirDomain'], Val).then(function(record){
    var fields=record.records[0]._fields; 
    if(fields[0]) urlRedir=fields[0];
    flowStart.next();
  }).catch(function(error){debugger; console.log(error); var boDoExit=1;flowStart.next();})
  yield;
  if(typeof boDoExit !== "undefined" ) { tx.rollback(); return; }

  if(urlRedir) {console.log('Redir: '+urlRedir); return; }


  var strNameLC=strName.toLowerCase();
  var oTmp=calcTalkName(strName), strTalkName=oTmp.strTalkName, strTalkNameLC=strTalkName.toLowerCase();
  var Val={www:www, strNameLC:strNameLC}, site, urlRedir;
  tx.run(objCql['Check if Redir'], Val).then(function(record){
    var fields=record.records[0]._fields; 
    if(fields[0]) site=fields[0].properties;
    if(fields[1]) urlRedir=fields[1];
    flowStart.next();
  }).catch(function(error){debugger; console.log(error); var boDoExit=1;flowStart.next();})
  yield;
  if(typeof boDoExit !== "undefined" ) { tx.rollback(); return; }

  if(urlRedir) {console.log('Redir: '+urlRedir); return; }
  if(!site) {console.log('!site'); return; } var strSiteName=site.name;

  
  var ns, nsDefault;
  tx.run(objCql['Count sites resp default sites'], Val).then(function(record){
    var fields=record.records[0]._fields; 
    if(fields[0]) {var tmp=neo4jConvertInt(fields[0]); if(tmp[0]){console.log(tmp[0]); return;} else ns=tmp[1];  } 
    if(fields[1]) {var tmp=neo4jConvertInt(fields[1]); if(tmp[0]){console.log(tmp[0]); return;} else nsDefault=tmp[1];  } 
    flowStart.next();
  }).catch(function(error){debugger; console.log(error); var boDoExit=1;flowStart.next();})
  yield;
  if(typeof boDoExit !== "undefined" ) { tx.rollback(); return; }



    //-- Make sure there is a default site
  var StrCql=[],Val={}; 
  if(ns==0){       StrCql.push(objCql['MakeDefaultSite0X']);         var strRnd=randomHash().substr(0,7);        extend(Val, {strRnd:strRnd, www:www});    }
  else if(nsDefault==0){ StrCql.push(objCql['MakeDefaultSite10']);  }
  else if(nsDefault==1){ StrCql.push(objCql['MakeDefaultSite11']);  }
  else{ console.error("ns:"+ns+", nsDefault:"+nsDefault); debugger; return;   }
  var strCql=StrCql.join('\n');
  var siteDefault, wwwDefault, strSiteDefaultName;
  if(strCql){
    tx.run(strCql, Val).then(function(record){
      var fields=record.records[0]._fields; 
      if(fields[0]) {siteDefault=fields[0].properties; wwwDefault=siteDefault.www; strSiteDefaultName=siteDefault.name;  }
      flowStart.next();
    }).catch(function(error){debugger; console.log(error); var boDoExit=1;flowStart.next();})
    yield;
    if(typeof boDoExit !== "undefined" ) { tx.rollback(); return; }
  }



  var Val={strNameLC:strNameLC, strTalkNameLC:strTalkNameLC};
  var page, pageTalk;
  tx.run(objCql['checkPageNTalkExistance'], Val).then(function(record){
    var fields=record.records[0]._fields; 
    if(fields[0]) {page=fields[0].properties; 
      var err=neo4jConvertIntProp(page,['created','nAccess','nChild','lastRev']); if(err){console.log(err); return;}}
    if(fields[1]) {pageTalk=fields[1].properties; 
      var err=neo4jConvertIntProp(pageTalk,['created','nAccess','nChild','lastRev']); if(err){console.log(err); return;}}
    flowStart.next();
  }).catch(function(error){debugger; console.log(error); var boDoExit=1;flowStart.next();})
  yield;
  if(typeof boDoExit !== "undefined" ) { tx.rollback(); return; }



  //-- Redirect to correct case OR correct boTLS
  //-- Return appropriate header if Private



  var strRnd=randomHash().substr(0,7);
  var Val={www:www, boTLS:boTLS, strRnd:strRnd , strNameLC:strNameLC, strName:strName, data:data, size:data.length, eTag:eTag};
  var rev;
  tx.run(objCql['Get revision table'], Val).then(function(record){debugger
    var fields=record.records[0]._fields; 
    if(fields[0]) {rev=fields[0].properties; 
      var err=neo4jConvertIntProp(rev,[]); if(err){console.log(err); return;}
    }
    flowStart.next();
  }).catch(function(error){debugger; console.log(error); var boDoExit=1;flowStart.next();})
  yield;
  if(typeof boDoExit !== "undefined" ) { tx.rollback(); return; }

    //-- If Irev>=Vc   noSuchRev
  //-- If Irev=-1    Use last rev

  //-- Set some values from revision Irev
  //-- Calc VboValidServerCache
  //-- Calc VboValidReqCache
  //-- 304
  //-- Get strEditText
  
  //-- If !VboValidServerCache THEN recalculate cache else use cache
    

  tx.commit().subscribe({
    onCompleted: function() { session.close();  },
    onError: function(error) {console.log(error);}
  });
   
}




