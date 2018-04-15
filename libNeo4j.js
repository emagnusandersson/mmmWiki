
AMinusB=function(A,B){var ANew=[]; for(var i=0;i<A.length;i++){var a=A[i]; if(B.indexOf(a)==-1) ANew.push(a);} return ANew;}  // Does not change A, returns ANew
AMinusBM=function(A,B){var Rem=[]; for(var i=A.length-1;i>=0;i--){var a=A[i]; if(B.indexOf(a)==-1) Rem.push(a); else A.splice(i,1);} return Rem.reverse();}  // Changes A, returns the remainder


testIfTalkOrTemplate=function(str){ return {boTalk:RegExp('^(template_)?talk:').test(str), boTemplate:RegExp('^template(_talk)?:').test(str)}; }
calcTalkName=function(strName){
  var {boTalk,boTemplate}=testIfTalkOrTemplate(strName);
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
  //var regCql=/\/\/\s*-----\s*?(.*?)$/mg;
  var arrCqlName=[], arrCqlStartFull=[], arrCqlStart=[], arrCqlEnd=[], objCql={};
  while (match = regCql.exec(text)) {  arrCqlName.push(match[1].trim());  arrCqlStartFull.push(match.index);  arrCqlStart.push(match.index+match[0].length); }
  var nCql=arrCqlStartFull.length;
  for(var i=0;i<nCql-1;i++){ arrCqlEnd[i]=arrCqlStartFull[i+1];}   if(nCql) arrCqlEnd.push(text.length);
  for(var i=0;i<nCql;i++){   if(arrCqlName[i]) objCql[arrCqlName[i]]=text.substring(arrCqlStart[i],arrCqlEnd[i]);   } 
  return objCql;
}

neo4jRollbackGenerator=function*(flow, tx){
  var err=null;
  if(tx.isOpen()){
    var semY=0, semCB=0; 
    tx.rollback().subscribe({
      onCompleted: function () {
        flow.next();
      },
      onError: function (error) {
        err=error; if(semY) flow.next(); semCB=1;
      }
    });
    if(!semCB) { semY=1; yield;}
  }
  return [err]
}
 
neo4jCommitGenerator=function*(flow, tx){
  var err=null;
  if(tx.isOpen()){
    var semY=0, semCB=0; 
    tx.commit().subscribe({
      onCompleted: function () {
        flow.next();
      },
      onError: function (error) {
        err=error; if(semY) flow.next(); semCB=1;
      }
    });
    if(!semCB) { semY=1; yield;}
  }
  return [err]
}

neo4jTxRun=function*(flow, tx, strCql, Val, boRaw=false){
  var err=null, records=[];
  tx.run(strCql, Val).subscribe({
    onNext: function (record) {
      if(!boRaw) {
        var recordA=record.toObject();
        for(var k in record._fieldLookup){
          if(recordA[k] instanceof neo4j.types.Node) {var tmpNode=recordA[k].properties; neo4jConvertIntProp(tmpNode);  recordA[k]=tmpNode;}
          else if(neo4j.isInt(recordA[k])) recordA[k]=neo4jConvertInt(recordA[k]);
        };
      } else var recordA=record;
      records.push(recordA);
    },
    onCompleted: function() { 
      //session.close(); 
      flow.next();
    },
    onError: function (error) {
      err=error; flow.next();
    }
  });
  yield;
  return [err, records];
}

neo4jRun=function*(flow, session, strCql, Val, boRaw=false){
  var err=null, records=[];
  session.run(strCql, Val).subscribe({
    onNext: function (record) {
      if(!boRaw) {
        var recordA=record.toObject();
        for(var k in record._fieldLookup){
          if(recordA[k] instanceof neo4j.types.Node) {var tmpNode=recordA[k].properties; neo4jConvertIntProp(tmpNode);  recordA[k]=tmpNode;}
          else if(neo4j.isInt(recordA[k])) recordA[k]=neo4jConvertInt(recordA[k]);
        };
      } else var recordA=record;
      records.push(recordA);
    },
    onCompleted: function() { 
      //session.close(); 
      flow.next();
    },
    onError: function (error) {
      err=error; flow.next();
    }
  });
  yield;
  return [err, records];
}

  //CREATE CONSTRAINT ON (p:Page) ASSERT p.idPage IS UNIQUE

setUpNeo=function*(flow, objArg){
  //var www=objArg.www, boTLS=objArg.boTLS, strSiteName=objArg.strSiteName;
  //boTLS=Boolean(boTLS);
  var Val={};
  var strCql=`CREATE CONSTRAINT ON (s:Site) ASSERT s.name IS UNIQUE`;
  var [err, records]= yield* neo4jRun(flow, sessionNeo4j, strCql, Val); if(err) return [err];
  
  var strCql=`CREATE CONSTRAINT ON (s:Site) ASSERT s.www IS UNIQUE`;
  var [err, records]= yield* neo4jRun(flow, sessionNeo4j, strCql, Val); if(err) return [err];
  
  //var strCql=`
    //MERGE (sd:Site {boDefault:true}) ON CREATE SET sd+={ name:coalesce($strSiteName, toLower(myMisc.myrandstringFunc(7))), www:$www, boTLS:$boTLS, googleAnalyticsTrackingID:"", urlIcon16:"", urlIcon200:"", aPassword:$aPassword, vPassword:"", boDefault:true }
    //RETURN sd`;
  //var Val={www:www, boTLS:boTLS, aPassword:"", vPassword:"", strSiteName:strSiteName?strSiteName:null};
  //var [err, records]= yield* neo4jRun(flow, sessionNeo4j, strCql, Val); if(err) return [err];

  return [null];
}

    
deletePageNeo=function*(flow, tx, objArg){
  var www=objArg.www, strName=objArg.strName;
  
  var strNameLC=strName.toLowerCase(); 
  var Val={www:www, strNameLC:strNameLC};
  
      // Delete Revisions
  var strCql=`
    MATCH (s:Site { www:$www })-[:hasPage]->(p:Page { nameLC:$strNameLC })-[h:hasRevision]->(r:Revision)
    DETACH DELETE r`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];

      // Delete Child links
  var strCql=`
    MATCH (s:Site { www:$www })-[:hasPage]->(p:Page { nameLC:$strNameLC })-[hc:hasChild]->(c:Page)
    DELETE hc`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];

      // Delete orphan stubs
  var strCql=`
    MATCH (cOrphan:Page) WHERE (NOT (:Page)-[:hasChild]->(cOrphan)) AND (NOT (cOrphan)-[:hasRevision]->(:Revision))
    DETACH DELETE cOrphan`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];

      // Delete Image links
  var strCql=`
    MATCH (s:Site { www:$www })-[:hasPage]->(p:Page { nameLC:$strNameLC })-[hc:hasImage]->(i:Image)
    DELETE hc`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  
       // Delete empty orphan images
  var strCql=` 
    MATCH (iOrphan:Image) WHERE (NOT (:Page)-[:hasImage]->(iOrphan)) AND iOrphan.boGotData IS NULL
    DETACH DELETE iOrphan`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  
  return [null];
}



deletePageByMultIDNeo=function*(flow, tx, objArg){
  var Val={IdPage:objArg.IdPage};
  
      // Delete Revisions
  var strCql=` 
    MATCH (p:Page)-[hasRevision]->(r:Revision) WHERE p.idPage IN $IdPage
    DETACH DELETE r`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val);
  if(err) return [err]; 

      // Delete Child links
  var strCql=` 
    MATCH (p:Page)-[hc:hasChild]->(c:Page) WHERE p.idPage IN $IdPage
    DELETE hc`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); 
  if(err) return [err]; 

      // Delete orphan stubs
  var strCql=`
    MATCH (cOrphan:Page) WHERE (NOT (:Page)-[:hasChild]->(cOrphan)) AND (NOT (cOrphan)-[:hasRevision]->(:Revision))
    DETACH DELETE cOrphan`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val);
  if(err) return [err]; 


      // Delete Image links
  var strCql=`
    MATCH (p:Page)-[hc:hasImage]->(i:Image) WHERE p.idPage IN $IdPage
    DELETE hc`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err]; 
    
     // Delete empty orphan images
  var strCql=` 
    MATCH (iOrphan:Image) WHERE (NOT (:Page)-[:hasImage]->(iOrphan)) AND iOrphan.boGotData IS NULL
    DETACH DELETE iOrphan`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err]; 

  return [null];
}

var strSetUpTestDB=`
MATCH (s:Site { www:'example.com' })-[:hasPage]->(p:Page)
OPTIONAL MATCH (p)-[h:hasRevision]->(r:Revision) DETACH DELETE s,p,r

      //----- Create parent abb
MERGE (s:Site { www:'example.com' })
MERGE (s)-[:hasPage]->(p:Page { nameLC:'abb', idPage:'iabb' })
MERGE (p)-[h:hasRevision]->(r:Revision:RevisionLast {iRev:0, strEditText:'[[abcd]] abcd [[bah]] [[abcd]] abcd'})
    RETURN s,p,r;
    
      //----- Create parent abc
MERGE (s:Site { www:'example.com' })
MERGE (s)-[:hasPage]->(p:Page { nameLC:'abc', idPage:'iabc' })
MERGE (p)-[h:hasRevision]->(r:Revision:RevisionLast {iRev:0, strEditText:'[[abcd]] abcd [[bah]] [[abcd]] abcd'})
    RETURN s,p,r;
    
      //----- Create child abcd
MATCH (s:Site { www:'example.com' }) 
MERGE (s)-[:hasPage]->(p:Page { nameLC:'abcd', name:'Abcd', idPage:'iabcd' })-[h:hasRevision]->(r:Revision:RevisionLast {iRev:0, strEditText:'abcd'})
WITH s,p
MATCH (s)-[:hasPage]->(pp:Page { nameLC:'abb' }), (s)-[:hasPage]->(pp2:Page { nameLC:'abc' })
    RETURN s,p,pp,pp2
    
    
      //----- Create child stub abce
MATCH (s:Site { www:'example.com' }) 
MERGE (s)-[:hasPage]->(p:Page { nameLC:'abce', name:'Abcd', idPage:'iabce' })
WITH s,p
MATCH (s)-[:hasPage]->(pp:Page { nameLC:'abb' }), (s)-[:hasPage]->(pp2:Page { nameLC:'abc' })
MERGE (pp)-[:hasChild]->(p)
MERGE (pp2)-[:hasChild]->(p)
    RETURN s,p,pp,pp2
    

    
      //----- View it all
MATCH (s:Site { www:'example.com' })-[:hasPage]->(p:Page)
OPTIONAL MATCH (p)-[h:hasRevision]->(r:Revision)
RETURN s,p,r



MATCH (s:Site { www:'example.com' })-[:hasPage]->(p:Page { nameLC:'abcd' })-[h:hasRevision]->(r:Revision)
    RETURN r.iRev

MATCH (s:Site { www:'example.com' })-[:hasPage]->(pp:Page)-[hc:hasChild]->(p:Page { idPage:'iabcd' }), (pp)-[h:hasRevision]->(r:RevisionLast)
    RETURN pp.idPage AS idPage, r.strEditText AS strEditText

   // Move parents->stub relations to the page in question
MATCH (s:Site { www:'example.com' })-[:hasPage]->(pp:Page)-[hc:hasChild]->(ps:Page { nameLC:'abce' }), (p:Page { idPage:'iabcd' })
    MERGE (pp)-[:hasChild]->(p)

   // DETACH and DELETE the stub
MATCH (s:Site { www:'example.com' })-[:hasPage]->(ps:Page { nameLC:'abce' })
    DETACH DELETE ps

   // Rename the page in question
MATCH (p:Page { idPage:'iabcd' })-[h:hasRevision]->(r:Revision)
    SET p+={nameLC:'abce', name:'Abce'}, r.tModCache=0`

renamePageNeo=function*(flow, tx, objArg){
  var www=objArg.www, strName=objArg.strName;
  
  var strNameLC=strName.toLowerCase(); 
  var Val={www:www, strNameLC:strNameLC, strName:strName, idPage:objArg.idPage};
  
      // The new name may refer to a stub or a real page. If it is a real page then bail out.
  var strCql=`
    MATCH (s:Site { www:$www })-[:hasPage]->(p:Page { nameLC:$strNameLC })-[h:hasRevision]->(r:Revision)
    RETURN r.iRev`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  if(records.length){ return [null, {mess:'pageExist'}]  }
  
      // Get the old name.
  var strCql=`
    MATCH (s:Site { www:$www })-[:hasPage]->(p:Page { idPage:$idPage })
    RETURN p.nameLC AS nameLC`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  var nameLCO=records[0].nameLC;
  
      // Get parent strEditText
  var strCql=`
    MATCH (s:Site { www:$www })-[:hasPage]->(pp:Page)-[hc:hasChild]->(p:Page { idPage:$idPage }), (pp)-[h:hasRevision]->(r:RevisionLast)
    RETURN pp.idPage AS idPage, r.strEditText AS strEditText`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  
  var data=Array(records.length);
  for(var i=0;i<records.length;i++){
    var mPa=new Parser();
    data[i]={idPage:records[i].idPage, strEditText:mPa.renameILinkOrImage(records[i].strEditText, nameLCO, strName)};
    //records[i].strEditText=mPa.renameILinkOrImage(records[i].strEditText, nameLCO, strName);
  }
  
  var ValT={data:data};
      // Write back to parents strEditText
  var strCql=`
    UNWIND {data} AS d
    MATCH (p:Page {idPage: d.idPage})-[h:hasRevision]->(r:RevisionLast)
    SET r.strEditText= d.strEditText, r.tModCache=0;`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, ValT); if(err) return [err];
  
      // Move parents->stub relations to the page in question
  var strCql=`
    MATCH (s:Site { www:$www })-[:hasPage]->(pp:Page)-[hc:hasChild]->(ps:Page { nameLC:$strNameLC }), (p:Page { idPage:$idPage })
    MERGE (pp)-[:hasChild]->(p)`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  
      // DETACH and DELETE the stub
  var strCql=`
    MATCH (s:Site { www:$www })-[:hasPage]->(ps:Page { nameLC:$strNameLC })
    DETACH DELETE ps`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  

      // Rename the page in question
  var strCql=`
    MATCH (p:Page { idPage:$idPage })-[h:hasRevision]->(r:Revision)
    SET p+={nameLC:$strNameLC, name:$strName}, r.tModCache=0`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  
  return [null];
}



var strSetUpTestDB=`
MATCH (s:Site { www:'example.com' })-[:hasPage]->(p:Page)
OPTIONAL MATCH (p)-[h:hasRevision]->(r:Revision)
OPTIONAL MATCH (p)-[:hasImage]->(i:Image)
DETACH DELETE s,p,r,i

      //----- Create parent abb
MERGE (s:Site { www:'example.com' })
MERGE (s)-[:hasPage]->(p:Page { nameLC:'abb', idPage:'iabb' })
MERGE (p)-[h:hasRevision]->(r:Revision:RevisionLast {iRev:0, strEditText:'[[image:abcd]] abcd [[image:bah]] [[image:abcd]] abcd'})
    RETURN s,p,r;
    
      //----- Create parent abc
MERGE (s:Site { www:'example.com' })
MERGE (s)-[:hasPage]->(p:Page { nameLC:'abc', idPage:'iabc' })
MERGE (p)-[h:hasRevision]->(r:Revision:RevisionLast {iRev:0, strEditText:'[[image:abcd]] abcd [[image:bah]] [[image:abcd]] abcd'})
    RETURN s,p,r;
    
      //----- Create image abcd
MERGE (i:Image { nameLC:'abcd', name:'Abcd', idImage:'iabcd', boGotData:TRUE })
    RETURN i
    
      //----- Create image stub abce
MERGE (i:Image { nameLC:'abce', name:'Abce', idImage:'iabce'})
WITH i
MATCH (s:Site { www:'example.com' })-[:hasPage]->(pp:Page { nameLC:'abb' }), (s)-[:hasPage]->(pp2:Page { nameLC:'abc' })
MERGE (pp)-[:hasImage]->(i)
MERGE (pp2)-[:hasImage]->(i)
    RETURN s,i,pp,pp2
    

      //----- View it all (except any orphan image)
MATCH (s:Site { www:'example.com' })-[:hasPage]->(p:Page)
OPTIONAL MATCH (p)-[h:hasRevision]->(r:Revision)
OPTIONAL MATCH (p)-[:hasImage]->(i:Image)
RETURN s,p,i,r




MATCH (i:Image { nameLC:'abcd' }) WHERE i.boGotData
    RETURN i

MATCH (i:Image { idImage:'iabcd' })
    RETURN i.nameLC AS nameLC
    
MATCH (pp:Page)-[hc:hasImage]->(i:Image { idImage:'iabcd' }), (pp)-[h:hasRevision]->(r:RevisionLast)
    RETURN pp.idPage AS idPage, r.strEditText AS strEditText
    

    // Move parents->stub-relations to the image in question
MATCH (pp:Page)-[hc:hasImage]->(is:Image { nameLC:'abce' }), (i:Image { idImage:'iabcd' })
    MERGE (pp)-[:hasImage]->(i)
    

   // DETACH and DELETE the stub
MATCH (is:Image { nameLC:'abce' })
    DETACH DELETE is
    
   // Rename the image in question
MATCH (i:Image { idImage:'iabcd'})
    SET i+={nameLC:'abce', name:'Abce', tMod:timestamp()/1000}`


renameImageNeo=function*(flow, tx, objArg){
  var www=objArg.www, strName=objArg.strName;
  
  var strNameLC=strName.toLowerCase(); 
  var Val={www:www, strNameLC:strNameLC, strName:strName, idImage:objArg.idImage};
  
      // The new name may refer to a stub or a real image. If it is a real image then bail out.
  var strCql=`
    MATCH (i:Image { nameLC:$strNameLC }) WHERE i.boGotData
    RETURN i`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  if(records.length){ return [null, {mess:'imageExist'}]  }
  
      // Get the old name.
  var strCql=`
    MATCH (i:Image { idImage:$idImage })
    RETURN i.nameLC AS nameLC`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  var nameLCO=records[0].nameLC;
  
      // Get parent strEditText
  var strCql=`
    MATCH (pp:Page)-[hc:hasImage]->(i:Image { idImage:$idImage }), (pp)-[h:hasRevision]->(r:RevisionLast)
    RETURN pp.idPage AS idPage, r.strEditText AS strEditText`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  
  var data=Array(records.length);
  for(var i=0;i<records.length;i++){
    var mPa=new Parser();
    data[i]={idPage:records[i].idPage, strEditText:mPa.renameILinkOrImage(records[i].strEditText, '','', nameLCO, strName)};
    //records[i].strEditText=mPa.renameILinkOrImage(records[i].strEditText, nameLCO, strName);
  }
  
  var ValT={data:data};
      // Write back to parents strEditText
  var strCql=`
    UNWIND {data} AS d
    MATCH (p:Page {idPage: d.idPage})-[h:hasRevision]->(r:RevisionLast)
    SET r.strEditText= d.strEditText, r.tModCache=0;`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, ValT); if(err) return [err];
  
      // Move parents->stub-relations to the image in question
  var strCql=`
    MATCH (pp:Page)-[hc:hasImage]->(is:Image { nameLC:$strNameLC }), (i:Image { idImage:$idImage })
    MERGE (pp)-[:hasImage]->(i)`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  
      // DETACH and DELETE the stub
  var strCql=`
    MATCH (is:Image { nameLC:$strNameLC })
    DETACH DELETE is`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  

      // Rename the image in question
  var strCql=`
    MATCH (i:Image { idImage:$idImage })
    SET i+={nameLC:$strNameLC, name:$strName, tMod:timestamp()/1000}`;
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  
  return [null];
}



childrenCreateNRemove=function*(flow, tx, Val, StrNewLink){
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

  
  var strCql=objCql['Get Old Links'], [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
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
    var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  }

  extend(Val, {StrToCreate:StrToCreate, StrToRemove:StrToRemove});
  var strCql=objCql['Create relations to new children'], [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  
  var strCql=objCql['SetStaleParents'], [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  
  var strCql=objCql['Remove relations to old children'], [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  
  var strCql=objCql['RemoveOrphanStubs'], [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  return [null];
}



imageLinksCreateNRemove=function*(flow, tx, Val, StrSubImage){
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

  
  var strCql=objCql['Get Old Images'], [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
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
    var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  }

  extend(Val, {StrToCreate:StrToCreate, StrToRemove:StrToRemove});
  var strCql=objCql['Create relations to new images'], [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  
  var strCql=objCql['Remove relations to old images'], [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  
  var strCql=objCql['RemoveOrphanStubs'], [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  return [null]; // var Ou={}; Ou.mess='OK'; return Ou;
}





saveWhenUploadingNeo=function*(flow, tx, objArg){
  var boTLS=Boolean(objArg.boTLS), www=objArg.www, fileName=objArg.fileName, strEditText=objArg.strEditText;
  
  fileName=fileName.replace(RegExp('.txt$','i'),'');
  var objMeta=parsePageNameHD(fileName);
  var siteName=objMeta.siteName, strName=objMeta.pageName;
  
  var Ou={};
  
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
    var strCql=objCql['Merge Site, siteName'], [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  }else{
    var strCql=objCql['Match Site, default'], [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  }
  var site=records[0].s, strSiteName=site.name, www=site.www;
  
  
  var [err,objT]=yield* getLastVersionMeta(flow, tx, {www:www, strName:strName}); if(err) return [err];
  var boOR=objT.boOR, boOW=objT.boOW, boSiteMap=objT.boSiteMap, tMod=objT.tMod, nRev=objT.nRev, strSiteName=objT.strSiteName;
  boTLS=Boolean(boTLS);  boOR=Boolean(boOR);  boOW=Boolean(boOW);  boSiteMap=Boolean(boSiteMap);
  
    // parse
  var [err,objT]=yield* parse(flow, tx, {www:www, strEditText:strEditText, boOW:boOW}); if(err) return [err];
  var strHtmlText=objT.strHtmlText;   Ou.objTemplateE=objT.objTemplateE;
  var arrSub=objT.arrSub, StrSubImage=objT.StrSubImage;
 
  var objT= yield* getBoTalkExistNeo(flow, tx, {www:www, strName:strName});    Ou.boTalkExist=objT.boTalkExist;      // getBoTalkExist
  
  var tNow=(new Date()).toUnix();
  var [err,objT]=yield* mergePageNeo(flow, tx, {www:www, strName:strName, nChild:arrSub.length, nImage:StrSubImage.length, tNow:tNow, boAccDefault:false});  if(err) return [err]; Ou.objPage=objT.objPage;

    
  var strNameLC=strName.toLowerCase();
  var size=strEditText.length;
  var Val={www:www, strNameLC:strNameLC, strName:strName, strEditText:strEditText, size:size, hash:md5(strEditText), tNow:tNow};
  var strCql=objCql['Merge revision 0 and Delete others'], [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];


    // childrenCreateNRemove
  var StrNewLink=[];  for(var i=0;i<arrSub.length;i++){ StrNewLink[i]=arrSub[i][0]; }
  var Val={strSiteName:strSiteName, strNameLC:strNameLC};
  var [err]=yield *childrenCreateNRemove(flow,tx,Val,StrNewLink); if(err) return [err];
  
    // imageLinksCreateNRemove
  var Val={strSiteName:strSiteName, strNameLC:strNameLC};
  var [err]=yield *imageLinksCreateNRemove(flow,tx,Val,StrSubImage);   if(err) return [err];
  
      // getRevisionTable
  var [err]=yield* getRevisionTableNeo(flow, tx, {www:www, strName:strName});   if(err) return [err];
  var arrRev=Ou.arrRev=objT.arrRev;


  return [null,Ou];
}


    //MATCH (s:Site { name:'sqrhrw5' })-[:hasPage]->(p:Page { nameLC:'start' })
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

  //var objT=yield* getLastVersionMeta(flow, tx, {www:www, strName:strName}); if(objT.mess=='err') return objT;
  var [err,objT]=yield* getLastVersionMeta(flow, tx, {www:www, strName:strName}); if(err) return [err];
  var boOR=objT.boOR, boOW=objT.boOW, boSiteMap=objT.boSiteMap, tMod=objT.tMod, nRev=objT.nRev, strSiteName=objT.strSiteName;
  boTLS=Boolean(boTLS);  boOR=Boolean(boOR);  boOW=Boolean(boOW);  boSiteMap=Boolean(boSiteMap);
  
  if(!boOR && !objArg.boVLoggedIn) { Ou.mess='boViewLoginRequired'; return [null,Ou];}
  if(objArg.tModBrowser<tMod) { Ou.mess="boTModBrowserObs"; Ou.tMod=tMod; return [null,Ou]; }
 
 
  if(strEditText.length==0){
    var [err]=yield* deletePageNeo(flow, tx, objArg); if(err) return [err];
    Ou.mess='boPageDeleted';  return [null,Ou];
  }
     
    // parse
  var [err,objT]=yield* parse(flow, tx, {www:www, strEditText:strEditText, boOW:boOW}); if(err) return [err];;
  var strHtmlText=objT.strHtmlText;   Ou.objTemplateE=objT.objTemplateE;
  var arrSub=objT.arrSub, StrSubImage=objT.StrSubImage;
 
  var objT=yield* getBoTalkExistNeo(flow, tx, {www:www, strName:strName});    Ou.boTalkExist=objT.boTalkExist;      // getBoTalkExist
 
  var tNow=(new Date()).toUnix();
 
  var [err,objT]=yield* mergePageNeo(flow, tx, {www:www, strName:strName, nChild:arrSub.length, nImage:StrSubImage.length, tNow:tNow, boAccDefault:true});   if(err) return [err];
  Ou.objPage=objT.objPage;


  var strNameLC=strName.toLowerCase();
  var size=strEditText.length;
  var Val={strSiteName:strSiteName, strNameLC:strNameLC, strName:strName, strEditText:strEditText, strHtmlText:strHtmlText, size:size, hash:md5(strEditText), tNow:tNow};
  var strCql=objCql['Merge revision 0 and Delete others'], [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];


    // childrenCreateNRemove
  var StrNewLink=[];  for(var i=0;i<arrSub.length;i++){ StrNewLink[i]=arrSub[i][0]; }
  var Val={strSiteName:strSiteName, strNameLC:strNameLC};
  var [err,objT]=yield *childrenCreateNRemove(flow,tx,Val,StrNewLink);  if(err) return [err];
  
    // imageLinksCreateNRemove
  var Val={strSiteName:strSiteName, strNameLC:strNameLC};
  var [err,objT]=yield *imageLinksCreateNRemove(flow,tx,Val,StrSubImage);  if(err) return [err];
  
      // getRevisionTable
  var [err,objT]=yield* getRevisionTableNeo(flow, tx, {www:www, strName:strName});  if(err) return [err];
  var arrRev=Ou.arrRev=objT.arrRev;
  
  Ou.mess='OK';  return [null,Ou];
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
    SET r.tMod=$tNow, r.tModCache=$tNow, r.strEditText=$strEditText, r.strHtmlText=$strHtmlText, r.size=$size, r.hash=$hash, r.summary=$summary, r.signature=$signature, r.boOther=TRUE
    SET p.lastRev=$iRev`;
  var objCql=splitCql(strCqlOrg);

  var [err,objT]=yield* getLastVersionMeta(flow, tx, {www:www, strName:strName});   if(err) return [err];
  //var boOR=objT.boOR, boOW=objT.boOW, boSiteMap=objT.boSiteMap, tMod=objT.tMod, nRev=objT.nRev, strSiteName=objT.strSiteName;
  var boOR=objT.boOR, boOW=objT.boOW, boSiteMap=objT.boSiteMap, tMod=objT.tMod, iRevOld=objT.iRev, strSiteName=objT.strSiteName;
  boTLS=Boolean(boTLS);  boOR=Boolean(boOR);  boOW=Boolean(boOW);  boSiteMap=Boolean(boSiteMap);
  
  if(iRevOld===null) Ou.iRev=0; else Ou.iRev=iRevOld+1;
  
  
  if(!boOW && !objArg.boALoggedIn) { Ou.mess='boViewALoginRequired'; return [null,Ou];}
  if(!boOR && !objArg.boVLoggedIn) { Ou.mess='boViewLoginRequired'; return [null,Ou];}
  if(objArg.tModBrowser<tMod) { Ou.mess="boTModBrowserObs"; Ou.tMod=tMod; return [null,Ou]; }
 
     
    // parse
  var [err,objT]=yield* parse(flow, tx, {www:www, strEditText:strEditText, boOW:boOW});     if(err) return [err];
  var strHtmlText=objT.strHtmlText;   Ou.objTemplateE=objT.objTemplateE;
  var arrSub=objT.arrSub, StrSubImage=objT.StrSubImage;
 
  var [err,objT]=yield* getBoTalkExistNeo(flow, tx, {www:www, strName:strName});    if(err) return [err];   Ou.boTalkExist=objT.boTalkExist;      // getBoTalkExist
 
  var tNow=(new Date()).toUnix();
   
  var [err,objT]=yield* mergePageNeo(flow, tx, {www:www, strName:strName, nChild:arrSub.length, nImage:StrSubImage.length, tNow:tNow, boAccDefault:true});    if(err) return [err];
  Ou.objPage=objT.objPage;
  

  var strNameLC=strName.toLowerCase();
  var Val={strSiteName:strSiteName, strNameLC:strNameLC};
  var strCql=objCql['Remove RevisionLast'], [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  
  var Val={strSiteName:strSiteName, strNameLC:strNameLC, iRev:Ou.iRev, strHtmlText:strHtmlText, size:strEditText.length, hash:md5(strEditText), tNow:tNow};
  copySome(Val, objArg, ['strEditText', 'signature', 'summary']);
  var strCql=objCql['Create Revision'], [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];


    // childrenCreateNRemove
  var StrNewLink=[];  for(var i=0;i<arrSub.length;i++){ StrNewLink[i]=arrSub[i][0]; }
  var Val={strSiteName:strSiteName, strNameLC:strNameLC};
  var [err,objT]=yield *childrenCreateNRemove(flow,tx,Val,StrNewLink);   if(err) return [err];

    // imageLinksCreateNRemove
  var Val={strSiteName:strSiteName, strNameLC:strNameLC};
  var [err,objT]=yield *imageLinksCreateNRemove(flow,tx,Val,StrSubImage);   if(err) return [err];
  
    // getRevisionTable
  var [err,objT]=yield* getRevisionTableNeo(flow, tx, {www:www, strName:strName});   if(err) return [err];
  var arrRev=Ou.arrRev=objT.arrRev;
  
  Ou.mess='OK';  return [null,Ou];  

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
  var strCql=objCql['Get Page meta and rev data'], [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  extend(Ou, {boOR:true, boOW:true, boSiteMap:true, tMod:0});
  var rec=records[0];   for(var key in rec) {  if(rec[key]!==null) Ou[key]=rec[key]; }
  
  var strSiteName=Ou.strSiteName, iRev=Ou.iRev;
  
    // parse
  var [err,objT]=yield* parse(flow, tx, {www:www, strEditText:Ou.strEditText, boOW:Ou.boOW});    if(err) return [err];
  var strHtmlText=objT.strHtmlText;   Ou.objTemplateE=objT.objTemplateE;
  var arrSub=objT.arrSub, StrSubImage=objT.StrSubImage;
 
  var [err,objT]=yield* getBoTalkExistNeo(flow, tx, {www:www, strName:strName});    if(err) return [err];   Ou.boTalkExist=objT.boTalkExist;      // getBoTalkExist
 
  var tNow=(new Date()).toUnix();

  var size=Ou.strEditText.length, nChild=arrSub.length, nImage=StrSubImage.length;
  var {boTalk,boTemplate}=testIfTalkOrTemplate(strName);
  var Val={strSiteName:strSiteName, strNameLC:strNameLC, strName:strName, iRev:iRev, tNow:tNow, nChild:nChild, nImage:nImage, strHtmlText:strHtmlText, size:size, hash:md5(Ou.strEditText)};
  var strCql=objCql['Set New Cache'], [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  Ou.objPage=records[0].p;

    
  var boLast=Ou.boLast=iRev==Ou.nRev-1;
  if(boLast){
      // childrenCreateNRemove
    var StrNewLink=[];  for(var i=0;i<arrSub.length;i++){ StrNewLink[i]=arrSub[i][0]; }
    var Val={strSiteName:strSiteName, strNameLC:strNameLC};
    var [err,objT]=yield *childrenCreateNRemove(flow,tx,Val,StrNewLink);    if(err) return [err];
    
      // imageLinksCreateNRemove
    var Val={strSiteName:strSiteName, strNameLC:strNameLC};
    var [err,objT]=yield *imageLinksCreateNRemove(flow,tx,Val,StrSubImage);   if(err) return [err];
  }
  
    // getRevisionTable
  var [err,objT]=yield* getRevisionTableNeo(flow, tx, {www:www, strName:strName});     if(err) return [err];
  var arrRev=Ou.arrRev=objT.arrRev;
  
  Ou.mess='OK';  return [null,Ou];
}



storeImageNeo=function*(flow, tx, objArg){
  var strName=objArg.strName, data=objArg.data, width=objArg.width, height=objArg.height, boOther=objArg.boOther;
  var Ou={};
  
  var Match=RegExp('\\.([a-zA-Z0-9]+)$','i').exec(strName);
  if(!Match){  return [new Error('image has no extension')]; }
  var extension=Match[1];
  
  var strCql=` 
    MERGE (i:Image {nameLC:$strNameLC})
    SET i.idImage=coalesce(i.idImage, myMisc.myrandstringHexFunc(24)), i.tCreated=coalesce(i.tCreated, $tNow), i.tMod=$tNow, i.size=$size, i.hash=$hash, i.name=$strName, i.width=$width, i.height=$height, i.widthSkipThumb=$width, i.boGotData=TRUE, i.nAccess=coalesce(i.nAccess, 0), i.boOther=$boOther, i.extension=$extension
    RETURN i`;
  
  var Val=copySome({},objArg, ['strName', 'width', 'height', 'boOther']);
  var Val=extend(Val, {strNameLC:strName.toLowerCase(), tNow:unixNow(), size:data.length, hash:md5(data), extension:extension});
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  var objImg=records[0].i;

  
  var collection = dbMongo.collection('documents');
  var result, objDoc={_id:new mongodb.ObjectID(objImg.idImage), data:data};
  collection.save( objDoc, function(errT, resultT) { err=errT; result=resultT;  flow.next(); });   yield; if(err) return [err];
  Ou.mess='OK';  return [null,Ou];
} 



getInfoNeo=function*(flow, tx, objArg){
  var Ou={};
  
  var strCql=`
    OPTIONAL MATCH (s:Site { www:$www })-[:hasPage]->(p:Page { nameLC:$strNameLC })-[h:hasRevision]->(r:RevisionLast)
    RETURN p.boOR AS boOR, p.boOW AS boOW, r.tMod AS tMod`;
   
  var strNameLC=objArg.strName.toLowerCase();
  var Val={strNameLC:strNameLC, www:objArg.www};
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];

  if(records.length){
    var tmp=records[0];
    for(var key in tmp) {  if(tmp[key]!==null) Ou[key]=tmp[key]; }
    Ou.mess='OK'
  }else Ou.mess='noSuchPage'
  return [null,Ou]; 
}


    
getInfoNDataNeo=function*(flow, tx, objArg){
  var boTLS=objArg.boTLS, www=objArg.www, strName=objArg.strName, iRev=objArg.iRev, tReqCache=objArg.requesterCacheTime/1000, boFront=objArg.boFront;
  boTLS=Boolean(boTLS);
  var Ou={objTemplateE:{}, boTalkExist:0};
  
  var strCqlOrg=`
      //----- Check if RedirectDomain
    MATCH (rd:RedirectDomain { www:$www })  
    RETURN rd.url AS url
    
      //----- MATCH siteDefault
    MATCH (sd:Site {boDefault:true}) // ON CREATE SET sd+={ name:toLower(myMisc.myrandstringFunc(7)), www:$www, boTLS:$boTLS, googleAnalyticsTrackingID:"", urlIcon16:"", urlIcon200:"", aPassword:"", vPassword:"", boDefault:true }
    RETURN sd
    
      //----- MATCH site and check Redirect
    MATCH (s:Site { www:$www }) // ON CREATE SET s+={ name:toLower(myMisc.myrandstringFunc(7)), www:$www, boTLS:$boTLS, googleAnalyticsTrackingID:"", urlIcon16:"", urlIcon200:"", aPassword:"", vPassword:"", boDefault:false }
    WITH s
    OPTIONAL MATCH (s)-[:hasRedirect]->(r:Redirect { nameLC:$strNameLC })
    SET r.nAccess=r.nAccess+1, r.tLastAccess=timestamp()/1000
    RETURN s, r.url AS url

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
  var strCql=objCql['Check if RedirectDomain'], [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  if(records[0]) {  extend(Ou, {mess:'redirectDomain', urlRedirect:records[0].url}); return [null,Ou]; }

  var Val={};
  var strCql=objCql['MATCH siteDefault'], [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  if(records.length==0) { extend(Ou, {mess:'noDefaultSite'}); return [null,Ou]; }
  Ou.siteDefault=records[0].sd;
  
  var {boErrAlreadyTalk, strTalkName}=calcTalkName(strName), strTalkNameLC=strTalkName.toLowerCase();
  var Val={www:www, strNameLC:strNameLC, boTLS:boTLS};
  var strCql=objCql['MATCH site and check Redirect'], [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  if(records.length==0) { extend(Ou, {mess:'wwwNotFound'}); return [null,Ou]; }
  var site=records[0].s,  urlRedirect=records[0].url;
  
  if(urlRedirect) { extend(Ou, {mess:'redirect', urlRedirect:urlRedirect}); return [null,Ou]; }
  //if(!site) { extend(Ou, {mess:'wwwNotFound'}); return [null,Ou]; }
  if(boTLS!=site.boTLS)  { extend(Ou, {mess:'redirectTLS', boTLS:site.boTLS});  return [null,Ou]; }  // Redirect to correct boTLS
  var strSiteName=site.name;    extend(Ou, {siteName:strSiteName});
  Ou.site=site;
  //copySome(Ou,site,['googleAnalyticsTrackingID', 'urlIcon16', 'urlIcon200', 'aPassword', 'vPassword']);

  var Val={strNameLC:strNameLC, strSiteName:strSiteName};
  var strCql=objCql['getPage and getNRev'], [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  var nRev=records[0].nRev, objPage=records[0].p;

  if(objPage===null || nRev==0) { Ou.mess='noSuchPage'; return [null,Ou]; }
  Ou.objPage=objPage;
  
  
      // getBoTalkExist
  var [err,objT]=yield* getBoTalkExistNeo(flow, tx, {www:www, strName:strName});  if(err) return [err];
  Ou.boTalkExist=objT.boTalkExist;
  
  
  if(strName!=objPage.name)  { Ou.mess='redirectCase'; return [null,Ou]; }  // Redirect to correct case
  if(boFront && !objPage.boOR) { Ou.mess='private'; return [null,Ou]; }  // Return appropriate header if Private


      // getRevisionTable
  var [err,objT]=yield* getRevisionTableNeo(flow, tx, {www:www, strName:strName}); if(err) return [err];
  var arrRev=Ou.arrRev=objT.arrRev;

  var nRev=arrRev.length;
  if(iRev>=nRev)  { Ou.mess='noSuchRev'; return [null,Ou]; }  // noSuchRev
  if(iRev==-1) iRev=nRev-1;  // Use last rev
  var objRev=arrRev[iRev];
  Ou.iRev=iRev;
      
  //var boValidServerCache=objRev.tMod<=objRev.tModCache && objRev.eTag.length  // Calc boValidServerCache
  //var boValidReqCache=boValidServerCache && eTag==objRev.eTag && objRev.tModCache<=tReqCache;    // Calc VboValidReqCache
  var boValidServerCache=objRev.tMod<=objRev.tModCache  // Calc boValidServerCache
  if(!boValidServerCache) { Ou.mess='serverCacheStale'; return [null,Ou]; }  // Exit if serverCache is stale
  if(boValidServerCache && objRev.tModCache<=tReqCache)  { Ou.mess='304'; return [null,Ou]; }  // 304 (Valid request cache)
  
  
  
  var Val={strNameLC:strNameLC, strSiteName:strSiteName};
  var strCql=objCql['Get templates'],[err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  for(var i=0;i<records.length;i++){
    var tmp=records[i].name.substr(9); Ou.objTemplateE[tmp]=1;
  }


  Ou.mess='serverCacheOK'; return [null,Ou]; 
}


getBoTalkExistNeo=function*(flow, tx, objArg){
  var www=objArg.www, strName=objArg.strName;
  var Ou={};

  var strCql=`
    MATCH (s:Site { www:$www })-[:hasPage]->(t:Page { nameLC:$strTalkNameLC })-[h:hasRevision]->(r:RevisionLast)
    RETURN 1 AS boTalkExist`;

  var {boErrAlreadyTalk, strTalkName}=calcTalkName(strName), strTalkName=strTalkName, strTalkNameLC=strTalkName.toLowerCase();
  var Val={www:www, strTalkNameLC:strTalkNameLC};
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  Ou.boTalkExist=0;
  if(records.length) Ou.boTalkExist=1; 

  Ou.mess='OK'; return [null,Ou]; 
}

getRevisionTableNeo=function*(flow, tx, objArg){
  var Ou={};
  var strCql=`
    OPTIONAL MATCH (s:Site { www:$www })-[:hasPage]->(p:Page { nameLC:$strNameLC })-[h:hasRevision]->(r:Revision)
    RETURN r ORDER BY r.iRev`;


  var strNameLC=objArg.strName.toLowerCase();
  var Val={strNameLC:strNameLC, www:objArg.www};
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  var arrRev=[];
  for(var i=0;i<records.length;i++){
    var tmp=records[i].r;  if(tmp) {  arrRev[tmp.iRev]=tmp; } 
  }

  Ou.arrRev=arrRev;

  Ou.mess='OK'; return [null,Ou]; 
}


mergePageNeo=function*(flow, tx, objArg){
  var strName=objArg.strName;
  var Ou={};

    // , p.boOR=$boAccDefault, p.boOW=$boAccDefault, p.boSiteMap=$boAccDefault    //p.lastRev=0,
    // , p.tMod=0 ,  p.tMod=$tNow
  var strCql=`
      //----- setPageNCreateIfNecessary
    MATCH (s:Site { www:$www })
    WITH s
    MERGE (s)-[:hasPage]->(p:Page { nameLC:$strNameLC })
    SET p.name=$strName, p.nChild=$nChild, p.nImage=$nImage, p.idPage=coalesce(p.idPage, myMisc.myrandstringFunc(16)), p.tLastAccess=coalesce(p.tLastAccess, 0), p.nAccess=coalesce(p.nAccess, 0), p.boOR=coalesce(p.boOR, $boAccDefault), p.boOW=coalesce(p.boOW, $boAccDefault), p.boSiteMap=coalesce(p.boSiteMap, $boAccDefault), 
    p.tCreated=coalesce(p.tCreated, $tNow), p.boTalk=$boTalk, p.boTemplate=$boTemplate
    RETURN p`;

  var strNameLC=strName.toLowerCase();
  var {boTalk,boTemplate}=testIfTalkOrTemplate(strName);
  var Val=copySome({}, objArg, ['www', 'strName', 'tNow', 'boAccDefault']);   Val.boAccDefault=Boolean(Val.boAccDefault);
  extend(Val, {strNameLC:strNameLC, boTalk:boTalk, boTemplate:boTemplate, nChild:objArg.nChild, nImage:objArg.nImage});
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  Ou.objPage=records[0].p;
  
  Ou.mess='OK'; return [null,Ou]; 
}

mergeETagNeo=function*(flow, tx, objArg){
  var strName=objArg.strName;
  var Ou={};

  var strCql=`
    MATCH (s:Site { www:$www })-[:hasPage]->(p:Page { nameLC:$strNameLC })
    WITH p, p.hash=$hash AS boSame
    SET p.hash=$hash
    RETURN boSame`;

  var strNameLC=strName.toLowerCase();
  var Val={strNameLC:strNameLC, www:objArg.www, hash:objArg.hash};
  extend(Val, {strNameLC:strNameLC, boTalk:boTalk, boTemplate:boTemplate, nChild:objArg.nChild, nImage:objArg.nImage});
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  Ou.boSame=records[0].boSame;

  
  Ou.mess='OK'; return [null,Ou]; 
}
mergeETagRevNeo=function*(flow, tx, objArg){
  var strName=objArg.strName;
  var Ou={};

  var strCql=`
    MATCH (s:Site { www:$www })-[:hasPage]->(p:Page { nameLC:$strNameLC })-[h:hasRevision]->(r:Revision {iRev:$iRev})
    WITH r, r.hashPageLoad=$hash AS boSame
    SET r.hash=$hash
    RETURN boSame`;

  var strNameLC=strName.toLowerCase();
  var Val={strNameLC:strNameLC, www:objArg.www, iRev:objArg.iRev, hash:objArg.hash};
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  Ou.boSame=records[0].boSame;

  
  Ou.mess='OK'; return [null,Ou]; 
}



getLastVersionMeta=function*(flow, tx, objArg){
  var strName=objArg.strName;
  var Ou={};

  var strCql=`
      //----- Get last version meta
    MATCH (s:Site { www:$www })
    WITH s
    OPTIONAL MATCH (s)-[:hasPage]->(p:Page { nameLC:$strNameLC })
    WITH s, p
    OPTIONAL MATCH (p)-[h:hasRevision]->(r:RevisionLast)
    RETURN p.boOR AS boOR, p.boOW AS boOW, p.boSiteMap AS boSiteMap, r.tMod AS tMod, r.iRev AS iRev, s.name AS strSiteName`;
 
  var strNameLC=strName.toLowerCase();
  var Val={strNameLC:strNameLC, www:objArg.www};
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  var rec=records[0];
  extend(Ou, {boOR:true, boOW:true, boSiteMap:true, tMod:0, iRev:null});
  for(var key in rec) {  if(rec[key]!==null) Ou[key]=rec[key]; }

  
  return [null,Ou]; 
}

parse=function*(flow, tx, objArg) {
  var www=objArg.www, strEditText=objArg.strEditText, boOW=objArg.boOW;
  if(typeof boOW=="undefined") boOW=false;
  var mPa=new Parser(strEditText, boOW==0);
  mPa.text=strEditText;
  mPa.preParse();
  var StrTemplate=mPa.getStrTemplate(); // StrTemplate will look like this (sort of) ['XXX', 'YYY' ...]

  var Ou=[err];
    // Call getTemplateDataNeo to get objTemplateText and Ou.objTemplateE
  var nTemplate=StrTemplate.length, objTemplateText={};     Ou.objTemplateE={};
  if(nTemplate) {
    var [err,objT]=yield* getTemplateDataNeo(flow, tx, {www:www, StrTemplate:StrTemplate});   if(err) return [err];
    objTemplateText=objT.objTemplateText; Ou.objTemplateE=objT.objTemplateE;
  }
  
    // Continue parsing
  mPa.objTemplateText=objTemplateText;    mPa.parse();
  var StrSub=mPa.getStrSub(); Ou.StrSubImage=mPa.getStrSubImage();

    // get objExistingSub from DB
  var nSub=StrSub.length, objExistingSub={};
  if(nSub) {
    var [err,objT]=yield* getExistingSubNeo(flow, tx, {www:www, StrSub:StrSub});    if(err) return [err];
    objExistingSub=objT.objExistingSub; 
  }

  mPa.createArrExistingSub(objExistingSub);  Ou.arrSub=mPa.getArrSub(StrSub);      mPa.endParse();
  Ou.strHtmlText=mPa.text;  
  return [null,Ou];
}


//MATCH (s:Site { www:'localhost:5000' })-[:hasPage]->(p:Page)-[h:hasRevision]->(r:RevisionLast) WHERE p.nameLC IN ['template:tt', 'template:ttt', 'template:tttt']
//  RETURN p.nameLC AS nameLC, r.strEditText AS strEditText
getTemplateDataNeo=function*(flow, tx, objArg){
  var www=objArg.www, StrTemplate=objArg.StrTemplate;
  var Ou={};

  var strCql=`
    //----- Get strEditText
  MATCH (s:Site { www:$www })-[:hasPage]->(p:Page)-[h:hasRevision]->(r:RevisionLast) WHERE p.nameLC IN $StrTemplate
  RETURN p.name AS name, r.strEditText AS strEditText`;
  
  Ou.objTemplateE={}; // Ou.objTemplateE (E for existance) looks like {XXX:1, YYY:0 ...} // Although only enties with a "1" are included 
  for(var i=0;i<StrTemplate.length;i++){  var tmp=StrTemplate[i], tmpLC=tmp.toLowerCase();  StrTemplate[i]='template:'+tmpLC; }
  
  var Val={www:www, StrTemplate:StrTemplate};
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  Ou.objTemplateText={};
  for(var i=0;i<records.length;i++){
    var tmp=records[i].name.substr(9), tmpLC=tmp.toLowerCase(); Ou.objTemplateText[tmpLC]=records[i].strEditText; Ou.objTemplateE[tmp]=1;
  }

  
  Ou.mess='OK'; return [null,Ou]; 
}

getExistingSubNeo=function*(flow, tx, objArg){
  var www=objArg.www, StrSub=objArg.StrSub;
  var Ou={};

  var strCql=`
  MATCH (s:Site { www:$www })-[:hasPage]->(p:Page)-[h:hasRevision]->(r:RevisionLast) WHERE p.nameLC IN $StrSubLC
  RETURN p.name AS name`;

  var StrSubLC=Array(StrSub.length); for(var i=0;i<StrSub.length;i++){ StrSubLC[i]=StrSub[i].toLowerCase(); }

  var Val={www:www, StrSubLC:StrSubLC};
  var [err, records]= yield* neo4jTxRun(flow, tx, strCql, Val); if(err) return [err];
  Ou.objExistingSub={};
  for(var i=0;i<records.length;i++){
    var tmp=records[i].name;  if(tmp) { Ou.objExistingSub[tmp]=1; }
  }

  Ou.mess='OK'; return [null,Ou]; 
}


readPageFile=function*(flow,leafDir,strIDPage){
  var fsPage=path.join(__dirname, '..', 'mmmWikiBU', leafDir, strIDPage+'.txt'); 
  var err, buf=[];
  fs.readFile(fsPage, function(errT, bufT) { err=errT; buf=bufT; flow.next();  });   yield;  if(err) return [err];
  var strData=buf.toString();
  
  return [null,strData];
}
//ENOENT
writePageFile=function*(flow, leafDir, strIDPage, strData){
  var fsPage=path.join(__dirname, '..', 'mmmWikiBU', leafDir, strIDPage+'.txt'); 
  var err;
  fs.writeFile(fsPage, strData, function(errT){ err=errT;  flow.next();  });   yield;  if(err) return [err];
  
  return [null];
}
