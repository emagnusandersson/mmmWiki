
AMinusB=function(A,B){var ANew=[]; for(var i=0;i<A.length;i++){var a=A[i]; if(B.indexOf(a)==-1) ANew.push(a);} return ANew;}  // Does not change A, returns ANew
AMinusBM=function(A,B){var Rem=[]; for(var i=A.length-1;i>=0;i--){var a=A[i]; if(B.indexOf(a)==-1) Rem.push(a); else A.splice(i,1);} return Rem.reverse();}  // Changes A, returns the remainder


testIfTalkOrTemplate=function(str){ return {boTalk:RegExp('^(template_)?talk:').test(str), boTemplate:RegExp('^template(_talk)?:').test(str)}; }
calcTalkName=function(strName){
  var oTmp=testIfTalkOrTemplate(strName), boTalk=oTmp.boTalk, boTemplate=oTmp.boTemplate;
  if(boTalk) return {boErrAlreadyTalk:1, strTalkName:""};
  if(boTemplate) var strTalkName='template_talk:'.concat(strName.substr(9)); else var strTalkName='talk:'+strName;
  return {boErrAlreadyTalk:0, strTalkName:strTalkName};
}


neo4jConvertInt=function(a){var n=a.toNumber(); if(!Number.isSafeInteger(n)) {n=a.toString(); console.trace('neo4j integer ('+n+') is out of range for javascript');} return n; }

neo4jCheckNConvertInt=function(objNeoInt){
  if(neo4j.isInt(objNeoInt)) var val=neo4jConvertInt(objNeoInt);  else var val=objNeoInt;   
  return val;
}

neo4jConvertIntProp=function(obj){ // "obj"=object with properties that might be neo4j-Integers
  Object.keys(obj).forEach(function(key,index) {
    if(neo4j.isInt(obj[key])) obj[key]=neo4jConvertInt(obj[key]);
  });
}
//Number.isSafeInteger    neo4j.integer.inSafeRange 
splitCql=function(text){
  //var regCql=new RegExp('//-----\\s*([a-zA-Z0-9, ]+?)\\n','g');
  var regCql=new RegExp('//\\s*-----\\s*?(.*?)$','mg');
  var arrCqlName=[], arrCqlStartFull=[], arrCqlStart=[], arrCqlEnd=[], objCql={};
  while (match = regCql.exec(text)) {  arrCqlName.push(match[1].trim());  arrCqlStartFull.push(match.index);  arrCqlStart.push(match.index+match[0].length); }
  var nCql=arrCqlStartFull.length;
  for(var i=0;i<nCql-1;i++){ arrCqlEnd[i]=arrCqlStartFull[i+1];}   if(nCql) arrCqlEnd.push(text.length);
  for(var i=0;i<nCql;i++){   if(arrCqlName[i]) objCql[arrCqlName[i]]=text.substring(arrCqlStart[i],arrCqlEnd[i]);   } 
  return objCql;
}


  //CREATE CONSTRAINT ON (p:Page) ASSERT p.idPage IS UNIQUE

setUpNeo=function*(flow, objArg){
  var www=objArg.www, boTLS=objArg.boTLS, strSiteName=objArg.strSiteName;
  boTLS=Boolean(boTLS);
  var Ou={};
  var err, records, Val={};
  var strCqlOrg=`CREATE CONSTRAINT ON (s:Site) ASSERT s.name IS UNIQUE`;
  dbNeo4j.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  
  var strCqlOrg=`CREATE CONSTRAINT ON (s:Site) ASSERT s.www IS UNIQUE`;
  dbNeo4j.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  
  var strCqlOrg=`
    MERGE (sd:Site {boDefault:true}) ON CREATE SET sd+={ name:coalesce($strSiteName, myMisc.myrandstringFunc(7)), www:$www, boTLS:$boTLS, googleAnalyticsTrackingID:"", urlIcon16:"", urlIcon200:"", aPassword:$aPassword, vPassword:"", boDefault:true }
    RETURN sd`;
  var err, records, Val={www:www, boTLS:boTLS, aPassword:"", vPassword:"", strSiteName:strSiteName?strSiteName:null};
  dbNeo4j.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }

  Ou.mess='OK';  return Ou;
}

    
deletePageNeo=function*(flow, tx, objArg){
  var www=objArg.www, strName=objArg.strName;
  var Ou={};
  
  var strNameLC=strName.toLowerCase(); 
  var err, records, Val={www:www, strNameLC:strNameLC};
  
      // Delete Revisions
  var strCqlOrg=`
    MATCH (s:Site { www:$www })-[:hasPage]->(p:Page { nameLC:$strNameLC })-[h:hasRevision]->(r:Revision)
    DETACH DELETE r`;
  tx.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }

      // Delete Child links
  var strCqlOrg=`
    MATCH (s:Site { www:$www })-[:hasPage]->(p:Page { nameLC:$strNameLC })-[hc:hasChild]->(c:Page)
    DELETE hc`;
  tx.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }

      // Delete orphan stubs
  var strCqlOrg=`
    MATCH (cOrphan:Page) WHERE (NOT (:Page)-[:hasChild]->(cOrphan)) AND (NOT (cOrphan)-[:hasRevision]->(:Revision))
    DETACH DELETE cOrphan`;
  tx.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }

      // Delete Image links
  var strCqlOrg=`
    MATCH (s:Site { www:$www })-[:hasPage]->(p:Page { nameLC:$strNameLC })-[hc:hasImage]->(i:Image)
    DELETE hc`;
  tx.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  
       // Delete empty orphan images
  var strCqlOrg=` 
    MATCH (iOrphan:Image) WHERE (NOT (:Page)-[:hasImage]->(iOrphan)) AND iOrphan.boGotData IS NULL
    DETACH DELETE iOrphan`;
  tx.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  
  Ou.mess='OK';  return Ou;
}



deletePageByMultIDNeo=function*(flow, tx, objArg){
  var Ou={}, err, records,  Val={IdPage:objArg.IdPage};
  
      // Delete Revisions
  var strCqlOrg=` 
    MATCH (p:Page)-[hasRevision]->(r:Revision) WHERE p.idPage IN $IdPage
    DETACH DELETE r`;
  tx.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }

      // Delete Child links
  var strCqlOrg=` 
    MATCH (p:Page)-[hc:hasChild]->(c:Page) WHERE p.idPage IN $IdPage
    DELETE hc`;
  tx.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }

      // Delete orphan stubs
  var strCqlOrg=`
    MATCH (cOrphan:Page) WHERE (NOT (:Page)-[:hasChild]->(cOrphan)) AND (NOT (cOrphan)-[:hasRevision]->(:Revision))
    DETACH DELETE cOrphan`;
  tx.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }


      // Delete Image links
  var strCqlOrg=`
    MATCH (p:Page)-[hc:hasImage]->(i:Image) WHERE p.idPage IN $IdPage
    DELETE hc`;
  tx.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
    
     // Delete empty orphan images
  var strCqlOrg=` 
    MATCH (iOrphan:Image) WHERE (NOT (:Page)-[:hasImage]->(iOrphan)) AND iOrphan.boGotData IS NULL
    DETACH DELETE iOrphan`;
  tx.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }

  Ou.mess='OK';  return Ou;
}



childrenCreateNRemove=function*(flow, tx, Val, StrNewLink){
  var err, records, Ou={};
  var strCqlOrg=`
      //----- Get Old Links
    MATCH (s:Site {name:$strSiteName})-[:hasPage]->(:Page { nameLC:$strNameLC })-[h:hasChild]->(c:Page)
    RETURN c.nameLC AS nameLC
      //----- Create relations to new children
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
    WITH par
    MATCH (par)-[:hasRevision]->(r:Revision) 
    SET r.tModCache=0
      //----- Remove relations to old children
    MATCH (s:Site {name:$strSiteName})-[:hasPage]->(p:Page {nameLC:$strNameLC})
    WITH s, p
    MATCH (p)-[rOld:hasChild]->(cOld:Page) WHERE cOld.nameLC IN $StrToRemove
    DETACH DELETE rOld
      //----- RemoveOrphanStubs
    MATCH (cOrphan:Page) WHERE cOrphan.nameLC IN $StrToRemove AND (NOT (:Page)-[:hasChild]->(cOrphan)) AND (NOT (cOrphan)-[:hasRevision]->(:Revision))
    DETACH DELETE cOrphan`;
  var objCql=splitCql(strCqlOrg);

  
  tx.cypher({query:objCql['Get Old Links'], params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  var StrOldLink=Array(records.length);  for(var i=0;i<records.length;i++){  StrOldLink[i]=records[i].nameLC;   }
  
    
    // Calculate StrToCreate and StrToRemove
  var StrCql=[]; 
  var StrNewLinkLC=Array(StrNewLink.length); for(var i=0;i<StrNewLink.length;i++) StrNewLinkLC[i]=StrNewLink[i].toLowerCase();  // arrSub = [['starta',0], ['startb',1]], 
  var StrToCreate=AMinusB(StrNewLinkLC,StrOldLink);
  var StrToRemove=AMinusB(StrOldLink,StrNewLinkLC);
    // Create the new children 
  if(StrToCreate.length){
    var StrToCreateObj={};
    var StrTmp=Array(StrToCreate.length); for(var i=0;i<StrToCreate.length;i++){ StrTmp[i]="MERGE (s)-[:hasPage]->(:Page { nameLC:$arg"+i+" })"; StrToCreateObj['arg'+i]=StrToCreate[i]; }
    //var StrTmp=Array(StrToCreate.length); for(var i=0;i<StrToCreate.length;i++){ StrTmp[i]="MERGE (s)-[:hasPage]->(:Page { nameLC:'"+StrToCreate[i]+"' })"; }
    StrTmp.unshift('MATCH (s:Site {name:$strSiteName}) WITH s');
    StrCql.push(StrTmp.join('\n'));
    var strCql=StrCql.join('\n'); Val=extend(Val,StrToCreateObj);
    tx.cypher({query:strCql, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
    if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  }

  extend(Val, {StrToCreate:StrToCreate, StrToRemove:StrToRemove});
  tx.cypher({query:objCql['Create relations to new children'], params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  
  tx.cypher({query:objCql['SetStaleParents'], params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  
  tx.cypher({query:objCql['Remove relations to old children'], params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  
  tx.cypher({query:objCql['RemoveOrphanStubs'], params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  Ou.mess='OK'; return Ou;
}



imageLinksCreateNRemove=function*(flow, tx, Val, StrSubImage){
  var err, records, Ou={};
  var strCqlOrg=`
      //----- Get Old Images
    MATCH (s:Site {name:$strSiteName})-[:hasPage]->(:Page { nameLC:$strNameLC })-[h:hasImage]->(i:Image)
    RETURN i.nameLC AS nameLC
      //----- Create relations to new images
    MATCH (s:Site {name:$strSiteName})-[:hasPage]->(p:Page {nameLC:$strNameLC})
    WITH s, p
    MATCH (iNew:Image) WHERE iNew.nameLC IN $StrToCreate
    WITH s, p, iNew
    MERGE (p)-[:hasImage]->(iNew)
    RETURN p
      //----- Remove relations to old images
    MATCH (s:Site {name:$strSiteName})-[:hasPage]->(p:Page {nameLC:$strNameLC})
    WITH s, p
    MATCH (p)-[rOld:hasImage]->(iOld:Image) WHERE iOld.nameLC IN $StrToRemove
    DETACH DELETE rOld
      //----- RemoveOrphanStubs
    MATCH (iOrphan:Image) WHERE iOrphan.nameLC IN $StrToRemove AND (NOT (:Page)-[:hasImage]->(iOrphan)) AND iOrphan.boGotData IS NULL
    DETACH DELETE iOrphan`;
  var objCql=splitCql(strCqlOrg);

  
  tx.cypher({query:objCql['Get Old Images'], params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  var StrOldLink=Array(records.length);  for(var i=0;i<records.length;i++){  StrOldLink[i]=records[i].nameLC;   }
  
    
    // Calculate StrToCreate and StrToRemove
  var StrCql=[]; 
  var StrSubImageLC=Array(StrSubImage.length); for(var i=0;i<StrSubImage.length;i++) StrSubImageLC[i]=StrSubImage[i].toLowerCase();   
  var StrToCreate=AMinusB(StrSubImageLC,StrOldLink);
  var StrToRemove=AMinusB(StrOldLink,StrSubImageLC);
    // Create the new Images 
  if(StrToCreate.length){
    var StrToCreateObj={};
    var StrTmp=Array(StrToCreate.length); for(var i=0;i<StrToCreate.length;i++){
      StrTmp[i]="MERGE (i"+i+":Image { nameLC:$arg"+i+" }) ON CREATE SET i"+i+".idImage=myMisc.myrandstringHexFunc(24)";   StrToCreateObj['arg'+i]=StrToCreate[i];
    }
    //var StrTmp=Array(StrToCreate.length); for(var i=0;i<StrToCreate.length;i++){ StrTmp[i]="MERGE (i"+i+":Image { nameLC:'"+StrToCreate[i]+"' }) ON CREATE SET i"+i+".idImage=myMisc.myrandstringHexFunc(24)"; }
    StrCql.push(StrTmp.join('\n'));
    var strCql=StrCql.join('\n');  Val=extend(Val,StrToCreateObj);
    tx.cypher({query:strCql, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
    if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  }

  extend(Val, {StrToCreate:StrToCreate, StrToRemove:StrToRemove});
  tx.cypher({query:objCql['Create relations to new images'], params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  
  tx.cypher({query:objCql['Remove relations to old images'], params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  
  tx.cypher({query:objCql['RemoveOrphanStubs'], params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  Ou.mess='OK'; return Ou;
}





saveWhenUploadingNeo=function*(flow, tx, objArg){
  var boTLS=Boolean(objArg.boTLS), www=objArg.www, fileName=objArg.fileName, strEditText=objArg.strEditText;
  
  fileName=fileName.replace(RegExp('.txt$','i'),'');
  var objMeta=parsePage(fileName);
  var siteName=objMeta.siteName, strName=objMeta.pageName;
  
  var err, records, Ou={};
  
  var strCqlOrg=`
      //----- Merge Site, siteName
    MERGE (s:Site { name:$siteName }) ON CREATE SET s += { www:myMisc.myrandstringFunc(7), boTLS:$boTLS, googleAnalyticsTrackingID:"", urlIcon16:"", urlIcon200:"", aPassword:"", vPassword:"" }
    RETURN s   
      //----- Match Site, default
    MATCH (s:Site {boDefault:true}) //ON CREATE SET s += { www:myMisc.myrandstringFunc(7), www:$www, boTLS:$boTLS, googleAnalyticsTrackingID:"", urlIcon16:"", urlIcon200:"", aPassword:"", vPassword:"" }
    RETURN s
    
      //-- (mergePageNeo)
    
      //----- Merge revision 0 and Delete others
    MATCH (s:Site { www:$www })-[:hasPage]->(p:Page { nameLC:$strNameLC })
    OPTIONAL MATCH (p)-[h:hasRevision]->(rOld:Revision)
    DETACH DELETE rOld
    WITH p, count(rOld) AS trash
    CREATE (p)-[h:hasRevision]->(r:Revision:RevisionLast {iRev:0})
    SET r.tMod=$tNow, r.tModCache=0, r.strEditText=$strEditText, r.size=$size, r.hash=$hash`;
  var objCql=splitCql(strCqlOrg);



  var www, Val={siteName:siteName, www:www, boTLS:boTLS};  //=randomHash().substr(0,7)    , www:www
  if(siteName.length){
    tx.cypher({query:objCql['Merge Site, siteName'], params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
    if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  }else{
    tx.cypher({query:objCql['Match Site, default'], params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
    if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  }
  var site=records[0].s, strSiteName=site.name, www=site.www;
  
  
  var objT=yield* getLastVersionMeta(flow, tx, {www:www, strName:strName}); if(objT.mess=='err') return objT;
  var boOR=objT.boOR, boOW=objT.boOW, boSiteMap=objT.boSiteMap, tMod=objT.tMod, nRev=objT.nRev, strSiteName=objT.strSiteName;
  boTLS=Boolean(boTLS);  boOR=Boolean(boOR);  boOW=Boolean(boOW);  boSiteMap=Boolean(boSiteMap);
  
    // parse
  var objT=yield* parse(flow, tx, {www:www, strEditText:strEditText, boOW:boOW}); if(objT.mess=='err') return objT;
  var strHtmlText=objT.strHtmlText;   Ou.objTemplateE=objT.objTemplateE;
  var arrSub=objT.arrSub, StrSubImage=objT.StrSubImage;
 
  var objT= yield* getBoTalkExistNeo(flow, tx, {www:www, strName:strName});    Ou.boTalkExist=objT.boTalkExist;      // getBoTalkExist
  
  var tNow=(new Date()).toUnix();
  var objT=yield* mergePageNeo(flow, tx, {www:www, strName:strName, nChild:arrSub.length, nImage:StrSubImage.length, tNow:tNow, boAccDefault:false});  if(objT.mess=='err') return objT; Ou.objPage=objT.objPage;

    
  var strNameLC=strName.toLowerCase();
  var size=strEditText.length;
  var Val={www:www, strNameLC:strNameLC, strName:strName, strEditText:strEditText, size:size, hash:md5(strEditText), tNow:tNow};
  tx.cypher({query:objCql['Merge revision 0 and Delete others'], params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }


    // childrenCreateNRemove
  var StrNewLink=[];  for(var i=0;i<arrSub.length;i++){ StrNewLink[i]=arrSub[i][0]; }
  var Val={strSiteName:strSiteName, strNameLC:strNameLC};
  var objT=yield *childrenCreateNRemove(flow,tx,Val,StrNewLink);   if(objT.mess=='err') return objT;
  
    // imageLinksCreateNRemove
  var Val={strSiteName:strSiteName, strNameLC:strNameLC};
  var objT=yield *imageLinksCreateNRemove(flow,tx,Val,StrSubImage);   if(objT.mess=='err') return objT;
  
      // getRevisionTable
  var objT=yield* getRevisionTableNeo(flow, tx, {www:www, strName:strName});   if(objT.mess=='err') return objT;
  var arrRev=Ou.arrRev=objT.arrRev;


  Ou.mess='OK';  return Ou;
}


    //MATCH (s:Site { name:'SqrhrW5' })-[:hasPage]->(p:Page { nameLC:'start' })
    //MATCH (p)-[h:hasRevision]->(rOld:Revision)
    //DETACH DELETE rOld
    //WITH p, count(rOld) AS trash
    //CREATE (p)-[h:hasRevision]->(r:Revision:RevisionLast {iRev:0})
    //SET r.tMod=$tNow, r.tModCache=$tNow, r.strEditText=$strEditText, r.strHtmlText=$strHtmlText, r.size=$size, r.hash=$hash
    
saveByReplaceNeo=function*(flow, tx, objArg){
  var boTLS=objArg.boTLS, www=objArg.www, strName=objArg.strName, strEditText=objArg.strEditText;
  var err, records, Ou={};
  
  var strCqlOrg=`
      //----- Merge revision 0 and Delete others
    MATCH (s:Site { name:$strSiteName })-[:hasPage]->(p:Page { nameLC:$strNameLC })
    OPTIONAL MATCH (p)-[h:hasRevision]->(rOld:Revision)
    DETACH DELETE rOld
    WITH p, count(rOld) AS trash
    CREATE (p)-[h:hasRevision]->(r:Revision:RevisionLast {iRev:0})
    SET r.tMod=$tNow, r.tModCache=$tNow, r.strEditText=$strEditText, r.strHtmlText=$strHtmlText, r.size=$size, r.hash=$hash`;
  var objCql=splitCql(strCqlOrg);

  var objT=yield* getLastVersionMeta(flow, tx, {www:www, strName:strName}); if(objT.mess=='err') return objT;
  var boOR=objT.boOR, boOW=objT.boOW, boSiteMap=objT.boSiteMap, tMod=objT.tMod, nRev=objT.nRev, strSiteName=objT.strSiteName;
  boTLS=Boolean(boTLS);  boOR=Boolean(boOR);  boOW=Boolean(boOW);  boSiteMap=Boolean(boSiteMap);
  
  if(!boOR && !objArg.boVLoggedIn) { Ou.mess='boViewLoginRequired'; return Ou;}
  if(objArg.tModBrowser<tMod) { Ou.mess="boTModBrowserObs"; Ou.tMod=tMod; return Ou; }
 
 
  if(strEditText.length==0){
    var objT=yield* deletePageNeo(flow, tx, objArg);  
    Ou.mess='boPageDeleted';  return Ou;
  }
     
    // parse
  var objT=yield* parse(flow, tx, {www:www, strEditText:strEditText, boOW:boOW}); if(objT.mess=='err') return objT;
  var strHtmlText=objT.strHtmlText;   Ou.objTemplateE=objT.objTemplateE;
  var arrSub=objT.arrSub, StrSubImage=objT.StrSubImage;
 
  var objT=yield* getBoTalkExistNeo(flow, tx, {www:www, strName:strName});    Ou.boTalkExist=objT.boTalkExist;      // getBoTalkExist
 
  var tNow=(new Date()).toUnix();
 
  var objT=yield* mergePageNeo(flow, tx, {www:www, strName:strName, nChild:arrSub.length, nImage:StrSubImage.length, tNow:tNow, boAccDefault:true});   if(objT.mess=='err') return objT;
  Ou.objPage=objT.objPage;


  var strNameLC=strName.toLowerCase();
  var size=strEditText.length;
  var Val={strSiteName:strSiteName, strNameLC:strNameLC, strName:strName, strEditText:strEditText, strHtmlText:strHtmlText, size:size, hash:md5(strEditText), tNow:tNow};
  tx.cypher({query:objCql['Merge revision 0 and Delete others'], params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }


    // childrenCreateNRemove
  var StrNewLink=[];  for(var i=0;i<arrSub.length;i++){ StrNewLink[i]=arrSub[i][0]; }
  var Val={strSiteName:strSiteName, strNameLC:strNameLC};
  var objT=yield *childrenCreateNRemove(flow,tx,Val,StrNewLink);   if(objT.mess=='err') return objT;
  
    // imageLinksCreateNRemove
  var Val={strSiteName:strSiteName, strNameLC:strNameLC};
  var objT=yield *imageLinksCreateNRemove(flow,tx,Val,StrSubImage);   if(objT.mess=='err') return objT;
  
      // getRevisionTable
  var objT=yield* getRevisionTableNeo(flow, tx, {www:www, strName:strName});   if(objT.mess=='err') return objT;
  var arrRev=Ou.arrRev=objT.arrRev;
  
  Ou.mess='OK';  return Ou;
}  

saveByAddNeo=function*(flow, tx, objArg){
  var boTLS=objArg.boTLS, www=objArg.www, strName=objArg.strName, strEditText=objArg.strEditText;
  var err, records, Ou={};
  
  var strCqlOrg=`
      //----- Remove RevisionLast
    MATCH (s:Site { name:$strSiteName })-[:hasPage]->(p:Page { nameLC:$strNameLC }) 
    WITH p
    MATCH (p)-[h:hasRevision]->(r:Revision)
    REMOVE r:RevisionLast
    
      //----- Create Revision
    MATCH (s:Site { name:$strSiteName })-[:hasPage]->(p:Page { nameLC:$strNameLC }) 
    CREATE (p)-[h:hasRevision]->(r:Revision:RevisionLast {iRev:$iRev})
    SET r.tMod=$tNow, r.tModCache=$tNow, r.strEditText=$strEditText, r.strHtmlText=$strHtmlText, r.size=$size, r.hash=$hash, r.summary=$summary, r.signature=$signature
    SET p.lastRev=$iRev`;
  var objCql=splitCql(strCqlOrg);

  var objT=yield* getLastVersionMeta(flow, tx, {www:www, strName:strName});   if(objT.mess=='err') return objT;
  //var boOR=objT.boOR, boOW=objT.boOW, boSiteMap=objT.boSiteMap, tMod=objT.tMod, nRev=objT.nRev, strSiteName=objT.strSiteName;
  var boOR=objT.boOR, boOW=objT.boOW, boSiteMap=objT.boSiteMap, tMod=objT.tMod, iRevOld=objT.iRev, strSiteName=objT.strSiteName;
  boTLS=Boolean(boTLS);  boOR=Boolean(boOR);  boOW=Boolean(boOW);  boSiteMap=Boolean(boSiteMap);
  
  if(iRevOld===null) Ou.iRev=0; else Ou.iRev=iRevOld+1;
  
  
  if(!boOW && !objArg.boALoggedIn) { Ou.mess='boViewALoginRequired'; return Ou;}
  if(!boOR && !objArg.boVLoggedIn) { Ou.mess='boViewLoginRequired'; return Ou;}
  if(objArg.tModBrowser<tMod) { Ou.mess="boTModBrowserObs"; Ou.tMod=tMod; return Ou; }
 
     
    // parse
  var objT=yield* parse(flow, tx, {www:www, strEditText:strEditText, boOW:boOW});     if(objT.mess=='err') return objT;
  var strHtmlText=objT.strHtmlText;   Ou.objTemplateE=objT.objTemplateE;
  var arrSub=objT.arrSub, StrSubImage=objT.StrSubImage;
 
  var objT=yield* getBoTalkExistNeo(flow, tx, {www:www, strName:strName});    if(objT.mess=='err') return objT;   Ou.boTalkExist=objT.boTalkExist;      // getBoTalkExist
 
  var tNow=(new Date()).toUnix();
   
  var objT=yield* mergePageNeo(flow, tx, {www:www, strName:strName, nChild:arrSub.length, nImage:StrSubImage.length, tNow:tNow, boAccDefault:true});    if(objT.mess=='err') return objT;
  Ou.objPage=objT.objPage;
  

  var strNameLC=strName.toLowerCase();
  var Val={strSiteName:strSiteName, strNameLC:strNameLC};
  tx.cypher({query:objCql['Remove RevisionLast'], params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  
  var Val={strSiteName:strSiteName, strNameLC:strNameLC, iRev:Ou.iRev, strHtmlText:strHtmlText, size:strEditText.length, hash:md5(strEditText), tNow:tNow};
  copySome(Val, objArg, ['strEditText', 'signature', 'summary']);
  tx.cypher({query:objCql['Create Revision'], params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }


    // childrenCreateNRemove
  var StrNewLink=[];  for(var i=0;i<arrSub.length;i++){ StrNewLink[i]=arrSub[i][0]; }
  var Val={strSiteName:strSiteName, strNameLC:strNameLC};
  var objT=yield *childrenCreateNRemove(flow,tx,Val,StrNewLink);   if(objT.mess=='err') return objT;

    // imageLinksCreateNRemove
  var Val={strSiteName:strSiteName, strNameLC:strNameLC};
  var objT=yield *imageLinksCreateNRemove(flow,tx,Val,StrSubImage);   if(objT.mess=='err') return objT;
  
    // getRevisionTable
  var objT=yield* getRevisionTableNeo(flow, tx, {www:www, strName:strName});   if(objT.mess=='err') return objT;
  var arrRev=Ou.arrRev=objT.arrRev;
  
  Ou.mess='OK';  return Ou;  

}


refreshRevNeo=function*(flow, tx, objArg){
  var boTLS=objArg.boTLS, www=objArg.www, strName=objArg.strName, iRev=objArg.iRev;
  boTLS=Boolean(boTLS);
  var err, records, Ou={objTemplateE:{}, boTalkExist:0};
  
  var strCqlOrg=`
      //----- Get Page meta and rev data
    MATCH (s:Site { www:$www })
    WITH s
    OPTIONAL MATCH (s)-[:hasPage]->(p:Page { nameLC:$strNameLC })
    WITH s, p
    OPTIONAL MATCH (p)-[h:hasRevision]->(r:Revision)
    WITH s, p, COUNT(r) AS nRev
    OPTIONAL MATCH (p)-[h:hasRevision]->(r:Revision {iRev:coalesce($iRev, nRev-1)})
    RETURN p.boOR AS boOR, p.boOW AS boOW, p.boSiteMap AS boSiteMap, MAX(r.tMod) AS tMod, nRev, r.strEditText AS strEditText, s.name AS strSiteName, r.iRev AS iRev
    
      //----- Set New Cache
    MATCH (s:Site { name:$strSiteName  })-[:hasPage]->(p:Page { nameLC:$strNameLC })
    MERGE (p)-[h:hasRevision]->(r:Revision {iRev:$iRev})
    SET r.tModCache=$tNow, r.strHtmlText=$strHtmlText, r.size=$size, r.hash=$hash
    SET p.nChild=$nChild, p.nImage=$nImage, p.idPage=coalesce(p.idPage, myMisc.myrandstringFunc(16))
    RETURN p`;
  var objCql=splitCql(strCqlOrg);
  
  if(iRev==-1) iRev=null;
 
  var strNameLC=strName.toLowerCase();
  var Val={strNameLC:strNameLC, www:objArg.www, iRev:iRev};
  tx.cypher({query:objCql['Get Page meta and rev data'], params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  extend(Ou, {boOR:true, boOW:true, boSiteMap:true, tMod:0});
  var rec=records[0];   for(var key in rec) {  if(rec[key]!==null) Ou[key]=rec[key]; }
  
  var strSiteName=Ou.strSiteName, iRev=Ou.iRev;
  
    // parse
  var objT=yield* parse(flow, tx, {www:www, strEditText:Ou.strEditText, boOW:Ou.boOW});    if(objT.mess=='err') return objT;
  var strHtmlText=objT.strHtmlText;   Ou.objTemplateE=objT.objTemplateE;
  var arrSub=objT.arrSub, StrSubImage=objT.StrSubImage;
 
  var objT=yield* getBoTalkExistNeo(flow, tx, {www:www, strName:strName});    if(objT.mess=='err') return objT;   Ou.boTalkExist=objT.boTalkExist;      // getBoTalkExist
 
  var tNow=(new Date()).toUnix();

  var size=Ou.strEditText.length, nChild=arrSub.length, nImage=StrSubImage.length;
  var tmp=testIfTalkOrTemplate(strName), boTalk=tmp.boTalk, boTemplate=tmp.boTemplate;
  var Val={strSiteName:strSiteName, strNameLC:strNameLC, strName:strName, iRev:iRev, tNow:tNow, nChild:nChild, nImage:nImage, strHtmlText:strHtmlText, size:size, hash:md5(Ou.strEditText)};
  tx.cypher({query:objCql['Set New Cache'], params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  Ou.objPage=records[0].p;

    
  var boLast=Ou.boLast=iRev==Ou.nRev-1;
  if(boLast){
      // childrenCreateNRemove
    var StrNewLink=[];  for(var i=0;i<arrSub.length;i++){ StrNewLink[i]=arrSub[i][0]; }
    var Val={strSiteName:strSiteName, strNameLC:strNameLC};
    var objT=yield *childrenCreateNRemove(flow,tx,Val,StrNewLink);    if(objT.mess=='err') return objT;
    
      // imageLinksCreateNRemove
    var Val={strSiteName:strSiteName, strNameLC:strNameLC};
    var objT=yield *imageLinksCreateNRemove(flow,tx,Val,StrSubImage);   if(objT.mess=='err') return objT;
  }
  
    // getRevisionTable
  var objT=yield* getRevisionTableNeo(flow, tx, {www:www, strName:strName});     if(objT.mess=='err') return objT;
  var arrRev=Ou.arrRev=objT.arrRev;
  
  Ou.mess='OK';  return Ou;
}



storeImageNeo=function*(flow, tx, objArg){
  var strName=objArg.strName, data=objArg.data, width=objArg.width, height=objArg.height, boOther=objArg.boOther;
  var err, Ou={};
  
  var Match=RegExp('\\.([a-zA-Z0-9]+)$','i').exec(strName);
  if(!Match){ extend(Ou, {mess:'err', err:new Error('image has no extension')}); return Ou; }
  var extension=Match[1];
  
  var strCqlOrg=` 
    MERGE (i:Image {nameLC:$strNameLC})
    SET i.idImage=coalesce(i.idImage, myMisc.myrandstringHexFunc(24)), i.tCreated=coalesce(i.tCreated, $tNow), i.tMod=$tNow, i.size=$size, i.hash=$hash, i.name=$strName, i.width=$width, i.height=$height, i.widthSkipThumb=$width, i.boGotData=TRUE, i.nAccess=coalesce(i.nAccess, 0), i.boOther=$boOther, i.extension=$extension
    RETURN i`;
  
  var Val=copySome({},objArg, ['strName', 'width', 'height', 'boOther']);
  var records,  Val=extend(Val, {strNameLC:strName.toLowerCase(), tNow:unixNow(), size:data.length, hash:md5(data), extension:extension});
  tx.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  var objImg=records[0].i;

  
  var collection = dbMongo.collection('documents');
  var result, objDoc={_id:new mongodb.ObjectID(objImg.idImage), data:data};
  collection.save( objDoc, function(errT, resultT) { err=errT; result=resultT;  flow.next(); });   yield;
  if(err) { extend(Ou, {mess:'err', err:err}); return Ou; }
  Ou.mess='OK';  return Ou;
} 



getInfoNeo=function*(flow, tx, objArg){
  var Ou={};
  
  var strCqlOrg=`
    OPTIONAL MATCH (s:Site { www:$www })-[:hasPage]->(p:Page { nameLC:$strNameLC })-[h:hasRevision]->(r:RevisionLast)
    RETURN p.boOR AS boOR, p.boOW AS boOW, r.tMod AS tMod`;
   
  var strNameLC=objArg.strName.toLowerCase();
  var err, records, Val={strNameLC:strNameLC, www:objArg.www};
  tx.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }

  if(records.length){
    var tmp=records[0];
    for(var key in tmp) {  if(tmp[key]!==null) Ou[key]=tmp[key]; }
    Ou.mess='OK'
  }else Ou.mess='noSuchPage'
  return Ou; 
}


    
getInfoNDataNeo=function*(flow, tx, objArg){
  var boTLS=objArg.boTLS, www=objArg.www, strName=objArg.strName, iRev=objArg.iRev, tReqCache=objArg.requesterCacheTime/1000, boFront=objArg.boFront;
  boTLS=Boolean(boTLS);
  var err, records, Ou={objTemplateE:{}, boTalkExist:0};
  
  var strCqlOrg=`
      //----- Check if RedirectDomain
    MATCH (rd:RedirectDomain { www:$www })  
    RETURN rd.url AS url
    
      //----- MATCH siteDefault, MERGE site and check Redirect
    MATCH (sd:Site {boDefault:true}) // ON CREATE SET sd+={ name:myMisc.myrandstringFunc(7), www:$www, boTLS:$boTLS, googleAnalyticsTrackingID:"", urlIcon16:"", urlIcon200:"", aPassword:"", vPassword:"", boDefault:true }
    WITH sd
    
      //-- MERGE site and check Redirect
    MERGE (s:Site { www:$www }) ON CREATE SET s+={ name:myMisc.myrandstringFunc(7), www:$www, boTLS:$boTLS, googleAnalyticsTrackingID:"", urlIcon16:"", urlIcon200:"", aPassword:"", vPassword:"", boDefault:false }
    WITH sd,s
    OPTIONAL MATCH (s)-[:hasRedirect]->(r:Redirect { nameLC:$strNameLC })
    SET r.nAccess=r.nAccess+1, r.tLastAccess=timestamp()/1000
    RETURN sd, s, r.url AS url


        //----- getPage and getNRev
    OPTIONAL MATCH (s:Site { name:$strSiteName })-[:hasPage]->(p:Page { nameLC:$strNameLC })
    SET p.nAccess=p.nAccess+1
    WITH p
    OPTIONAL MATCH (p)-[h:hasRevision]->(r:Revision)
    RETURN p, COUNT(r) AS nRev
    
    
      //----- Get templates
    MATCH (:Site { name:$strSiteName })-[:hasPage]->(:Page { nameLC:$strNameLC })-[:hasChild]->(t:Page)-[h:hasRevision]->(r:RevisionLast) WHERE t.nameLC=~ 'template:.*'
    RETURN t.name AS name`;
  var objCql=splitCql(strCqlOrg);
   
  var strNameLC=strName.toLowerCase();
  var Val={www:www};
  tx.cypher({query:objCql['Check if RedirectDomain'], params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  if(records[0]) {  extend(Ou, {mess:'redirectDomain', urlRedirect:records[0].url}); return Ou; }


  var oTmp=calcTalkName(strName), strTalkName=oTmp.strTalkName, strTalkNameLC=strTalkName.toLowerCase();
  var Val={www:www, strNameLC:strNameLC, boTLS:boTLS};
  tx.cypher({query:objCql['MATCH siteDefault, MERGE site and check Redirect'], params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  if(records.length==0) { extend(Ou, {mess:'noDefaultSite'}); return Ou; }
  var rec=records[0], site=rec.s,  urlRedirect=rec.url;  Ou.siteDefault=rec.sd;

  if(urlRedirect) { extend(Ou, {mess:'redirect', urlRedirect:urlRedirect}); return Ou; }
  if(!site) { extend(Ou, {mess:'wwwNotFound'}); return Ou; }
  if(boTLS!=site.boTLS)  { Ou.mess='redirectTLS'; return Ou; }  // Redirect to correct boTLS
  var strSiteName=site.name;    extend(Ou, {siteName:strSiteName});
  Ou.site=site;
  //copySome(Ou,site,['googleAnalyticsTrackingID', 'urlIcon16', 'urlIcon200', 'aPassword', 'vPassword']);

  var Val={strNameLC:strNameLC, strSiteName:strSiteName};
  tx.cypher({query:objCql['getPage and getNRev'], params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  var nRev=records[0].nRev, objPage=records[0].p;

  if(objPage===null || nRev==0) { Ou.mess='noSuchPage'; return Ou; }
  Ou.objPage=objPage;
  
  
      // getBoTalkExist
  var objT=yield* getBoTalkExistNeo(flow, tx, {www:www, strName:strName});  if(objT.mess=='err') return objT;
  Ou.boTalkExist=objT.boTalkExist;
  
  
  if(strName!=objPage.name)  { Ou.mess='redirectCase'; return Ou; }  // Redirect to correct case
  if(boFront && !objPage.boOR) { Ou.mess='private'; return Ou; }  // Return appropriate header if Private


      // getRevisionTable
  var objT=yield* getRevisionTableNeo(flow, tx, {www:www, strName:strName}); if(objT.mess=='err') return objT;
  var arrRev=Ou.arrRev=objT.arrRev;

  var nRev=arrRev.length;
  if(iRev>=nRev)  { Ou.mess='noSuchRev'; return Ou; }  // noSuchRev
  if(iRev==-1) iRev=nRev-1;  // Use last rev
  var objRev=arrRev[iRev];
  Ou.iRev=iRev;
      
  //var boValidServerCache=objRev.tMod<=objRev.tModCache && objRev.eTag.length  // Calc boValidServerCache
  //var boValidReqCache=boValidServerCache && eTag==objRev.eTag && objRev.tModCache<=tReqCache;    // Calc VboValidReqCache
  var boValidServerCache=objRev.tMod<=objRev.tModCache  // Calc boValidServerCache
  if(!boValidServerCache) { Ou.mess='serverCacheStale'; return Ou; }  // Exit if serverCache is stale
  if(boValidServerCache && objRev.tModCache<=tReqCache)  { Ou.mess='304'; return Ou; }  // 304 (Valid request cache)
  
  
  
  var Val={strNameLC:strNameLC, strSiteName:strSiteName};
  tx.cypher({query:objCql['Get templates'], params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  for(var i=0;i<records.length;i++){
    var tmp=records[i].name.substr(9); Ou.objTemplateE[tmp]=1;
  }


  Ou.mess='serverCacheOK'; return Ou; 
}


getBoTalkExistNeo=function*(flow, tx, objArg){
  var www=objArg.www, strName=objArg.strName;
  var Ou={};

  var strCqlOrg=`
    MATCH (s:Site { www:$www })-[:hasPage]->(t:Page { nameLC:$strTalkNameLC })-[h:hasRevision]->(r:RevisionLast)
    RETURN 1 AS boTalkExist`;

  var oTmp=calcTalkName(strName), strTalkName=oTmp.strTalkName, strTalkNameLC=strTalkName.toLowerCase();
  var err, records, Val={www:www, strTalkNameLC:strTalkNameLC};
  tx.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  Ou.boTalkExist=0;
  if(records.length) Ou.boTalkExist=1; 

  Ou.mess='OK'; return Ou; 
}

getRevisionTableNeo=function*(flow, tx, objArg){
  var Ou={};
  var strCqlOrg=`
    OPTIONAL MATCH (s:Site { www:$www })-[:hasPage]->(p:Page { nameLC:$strNameLC })-[h:hasRevision]->(r:Revision)
    RETURN r ORDER BY r.iRev`;


  var strNameLC=objArg.strName.toLowerCase();
  var err, records, Val={strNameLC:strNameLC, www:objArg.www};
  tx.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  var arrRev=[];
  for(var i=0;i<records.length;i++){
    var tmp=records[i].r;  if(tmp) {  arrRev[tmp.iRev]=tmp; } 
  }

  Ou.arrRev=arrRev;

  Ou.mess='OK'; return Ou; 
}


mergePageNeo=function*(flow, tx, objArg){
  var strName=objArg.strName;
  var Ou={};

    // , p.boOR=$boAccDefault, p.boOW=$boAccDefault, p.boSiteMap=$boAccDefault    //p.lastRev=0,
    // , p.tMod=0 ,  p.tMod=$tNow
  var strCqlOrg=`
      //----- setPageNCreateIfNecessary
    MATCH (s:Site { www:$www })
    WITH s
    MERGE (s)-[:hasPage]->(p:Page { nameLC:$strNameLC })
    SET p.name=$strName, p.nChild=$nChild, p.nImage=$nImage, p.idPage=coalesce(p.idPage, myMisc.myrandstringFunc(16)), p.tLastAccess=coalesce(p.tLastAccess, 0), p.nAccess=coalesce(p.nAccess, 0), p.boOR=coalesce(p.boOR, $boAccDefault), p.boOW=coalesce(p.boOW, $boAccDefault), p.boSiteMap=coalesce(p.boSiteMap, $boAccDefault), 
    p.tCreated=coalesce(p.tCreated, $tNow), p.boTalk=$boTalk, p.boTemplate=$boTemplate
    RETURN p`;

  var strNameLC=strName.toLowerCase();
  var tmp=testIfTalkOrTemplate(strName), boTalk=tmp.boTalk, boTemplate=tmp.boTemplate;
  var err, records, Val=copySome({}, objArg, ['www', 'strName', 'tNow', 'boAccDefault']);   Val.boAccDefault=Boolean(Val.boAccDefault);
  extend(Val, {strNameLC:strNameLC, boTalk:boTalk, boTemplate:boTemplate, nChild:objArg.nChild, nImage:objArg.nImage});
  tx.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  Ou.objPage=records[0].p;
  
  Ou.mess='OK'; return Ou; 
}

mergeETagNeo=function*(flow, tx, objArg){
  var strName=objArg.strName;
  var Ou={};

  var strCqlOrg=`
    MATCH (s:Site { www:$www })-[:hasPage]->(p:Page { nameLC:$strNameLC })
    WITH p, p.hash=$hash AS boSame
    SET p.hash=$hash
    RETURN boSame`;

  var strNameLC=strName.toLowerCase();
  var err, records, Val={strNameLC:strNameLC, www:objArg.www, hash:objArg.hash};
  extend(Val, {strNameLC:strNameLC, boTalk:boTalk, boTemplate:boTemplate, nChild:objArg.nChild, nImage:objArg.nImage});
  tx.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  Ou.boSame=records[0].boSame;

  
  Ou.mess='OK'; return Ou; 
}
mergeETagRevNeo=function*(flow, tx, objArg){
  var strName=objArg.strName;
  var Ou={};

  var strCqlOrg=`
    MATCH (s:Site { www:$www })-[:hasPage]->(p:Page { nameLC:$strNameLC })-[h:hasRevision]->(r:Revision {iRev:$iRev})
    WITH r, r.hashPageLoad=$hash AS boSame
    SET r.hash=$hash
    RETURN boSame`;

  var strNameLC=strName.toLowerCase();
  var err, records, Val={strNameLC:strNameLC, www:objArg.www, iRev:objArg.iRev, hash:objArg.hash};
  tx.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  Ou.boSame=records[0].boSame;

  
  Ou.mess='OK'; return Ou; 
}



getLastVersionMeta=function*(flow, tx, objArg){
  var strName=objArg.strName;
  var Ou={};

  var strCqlOrg=`
      //----- Get last version meta
    MATCH (s:Site { www:$www })
    WITH s
    OPTIONAL MATCH (s)-[:hasPage]->(p:Page { nameLC:$strNameLC })
    WITH s, p
    OPTIONAL MATCH (p)-[h:hasRevision]->(r:RevisionLast)
    RETURN p.boOR AS boOR, p.boOW AS boOW, p.boSiteMap AS boSiteMap, r.tMod AS tMod, r.iRev AS iRev, s.name AS strSiteName`;
 
  var strNameLC=strName.toLowerCase();
  var err, records, Val={strNameLC:strNameLC, www:objArg.www};
  tx.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  var rec=records[0];
  extend(Ou, {boOR:true, boOW:true, boSiteMap:true, tMod:0, iRev:null});
  for(var key in rec) {  if(rec[key]!==null) Ou[key]=rec[key]; }

  
  Ou.mess='OK'; return Ou; 
}

parse=function*(flow, tx, objArg) {
  var www=objArg.www, strEditText=objArg.strEditText, boOW=objArg.boOW;
  if(typeof boOW=="undefined") boOW=false;
  var mPa=new Parser(strEditText, boOW==0);
  mPa.text=strEditText;
  mPa.preParse();
  var StrTemplate=mPa.getStrTemplate(); // StrTemplate will look like this (sort of) ['XXX', 'YYY' ...]

  var Ou={err:null};
    // Call getTemplateDataNeo to get objTemplateText and Ou.objTemplateE
  var nTemplate=StrTemplate.length, objTemplateText={};     Ou.objTemplateE={};
  if(nTemplate) {
    var objT=yield* getTemplateDataNeo(flow, tx, {www:www, StrTemplate:StrTemplate});   if(objT.mess=='err') return objT;
    objTemplateText=objT.objTemplateText; Ou.objTemplateE=objT.objTemplateE;
  }
  
    // Continue parsing
  mPa.objTemplateText=objTemplateText;    mPa.parse();
  var StrSub=mPa.getStrSub(); Ou.StrSubImage=mPa.getStrSubImage();

    // get objExistingSub from DB
  var nSub=StrSub.length, objExistingSub={};
  if(nSub) {
    var objT=yield* getExistingSubNeo(flow, tx, {www:www, StrSub:StrSub});    if(objT.mess=='err') return objT;
    objExistingSub=objT.objExistingSub; 
  }

  mPa.createArrExistingSub(objExistingSub);  Ou.arrSub=mPa.getArrSub(StrSub);      mPa.endParse();
  Ou.strHtmlText=mPa.text;  
  return Ou;
}


//MATCH (s:Site { www:'localhost:5000' })-[:hasPage]->(p:Page)-[h:hasRevision]->(r:RevisionLast) WHERE p.nameLC IN ['template:tt', 'template:ttt', 'template:tttt']
//  RETURN p.nameLC AS nameLC, r.strEditText AS strEditText
getTemplateDataNeo=function*(flow, tx, objArg){
  var www=objArg.www, StrTemplate=objArg.StrTemplate;
  var Ou={};

  var strCqlOrg=`
    //----- Get strEditText
  MATCH (s:Site { www:$www })-[:hasPage]->(p:Page)-[h:hasRevision]->(r:RevisionLast) WHERE p.nameLC IN $StrTemplate
  RETURN p.name AS name, r.strEditText AS strEditText`;
  var objCql=splitCql(strCqlOrg);
  
  Ou.objTemplateE={}; // Ou.objTemplateE (E for existance) looks like {XXX:1, YYY:0 ...} // Although only enties with a "1" are included 
  for(var i=0;i<StrTemplate.length;i++){  var tmp=StrTemplate[i], tmpLC=tmp.toLowerCase();  StrTemplate[i]='template:'+tmpLC; }
  
  var err, records, Val={www:www, StrTemplate:StrTemplate};
  tx.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  Ou.objTemplateText={};
  for(var i=0;i<records.length;i++){
    var tmp=records[i].name.substr(9), tmpLC=tmp.toLowerCase(); Ou.objTemplateText[tmpLC]=records[i].strEditText; Ou.objTemplateE[tmp]=1;
  }

  
  Ou.mess='OK'; return Ou; 
}

getExistingSubNeo=function*(flow, tx, objArg){
  var www=objArg.www, StrSub=objArg.StrSub;
  var Ou={};

  var strCqlOrg=`
  MATCH (s:Site { www:$www })-[:hasPage]->(p:Page)-[h:hasRevision]->(r:RevisionLast) WHERE p.nameLC IN $StrSubLC
  RETURN p.name AS name`;

  var StrSubLC=Array(StrSub.length); for(var i=0;i<StrSub.length;i++){ StrSubLC[i]=StrSub[i].toLowerCase(); }

  var err, records, Val={www:www, StrSubLC:StrSubLC};
  tx.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, recordsT){ err=errT; records=recordsT; flow.next();  });   yield;
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  Ou.objExistingSub={};
  for(var i=0;i<records.length;i++){
    var tmp=records[i].name;  if(tmp) { Ou.objExistingSub[tmp]=1; }
  }

  Ou.mess='OK'; return Ou; 
}


readPageFile=function*(flow,leafDir,strIDPage){
  var leafDataDir='mmmWikiData';
  var fsPage=path.join(__dirname, '..', leafDataDir, leafDir, strIDPage+'.txt'); 
  var err=null, buf=[];
  fs.readFile(fsPage, function(errT, bufT) { err=errT; buf=bufT; flow.next();  });   yield;
  if(err ) { console.log(err); }
  var strData=buf.toString();
  
  return {err:err,strData:strData};
}
//ENOENT
writePageFile=function*(flow, leafDir, strIDPage, strData){
  var leafDataDir='mmmWikiData';
  var fsPage=path.join(__dirname, '..', leafDataDir, leafDir, strIDPage+'.txt'); 
  var err=null;
  fs.writeFile(fsPage, strData, function(errT){ err=errT;  flow.next();  });   yield;
  if(err ) { console.log(err); }
  
  return err;
}
