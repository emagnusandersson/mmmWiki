////////////////////////////////////////////////////////////////////////////////////////////////////////
ReqBE.prototype.pageCompareExt=function*(inObj){ 
  var self=this, req=this.req, res=this.res;
  var GRet=this.GRet;
  var Ou={};
  var flow=req.flow;
  var versionO=arr_min(inObj.arrVersionCompared), version=arr_max(inObj.arrVersionCompared);     versionO=Math.max(1,versionO); version=Math.max(1,version);    var iRev=version-1, iRevO=versionO-1;
  if(version==versionO) {this.mesO('Same version'); return {err:'exited'};}


  var tx=dbNeo4j.beginTransaction(),   boDoExit=0, err;
  
      // pageCompare
  var objArg={};   copySome(objArg, req, ['boTLS', 'www']);     extend(objArg, {strName:this.queredPage, iRevO:iRevO, iRev:iRev, boVLoggedIn:this.boVLoggedIn});
  var objT=yield* pageCompareNeo(req.flow, tx, objArg);
  if(objT.mess=='err') {
    if(tx.state===tx.STATE_OPEN){ tx.rollback(function(err){ if(err)console.log(err); flow.next();}); }
    yield;
    this.mesEO('err'); return {err:'exited'};
  }else{   if(tx.state===tx.STATE_OPEN){ tx.commit(function(err){ if(err)console.log(err); flow.next();});  }
    yield;
  }
  
  var mess=objT.mess;
  if(mess=='noSuchPage'){this.mesO('Page does not exist'); return {err:'exited'};} 
  else if(mess=='noSuchRev') {this.mesO('Only '+objT.nRev+' versions, (trying to compare '+versionO+' and '+version+')'); return {err:'exited'};} 
  else if(mess=='boViewLoginRequired'){this.mesO('Not logged in'); return {err:'exited'};}
  else if(mess=='err') {this.mesEO('err'); return {err:'exited'};}
      
  GRet.strDiffText='';
  if(versionO!==null){
    GRet.strDiffText=myDiff(objT.strEditTextO,objT.strEditText);
    if(GRet.strDiffText.length==0) GRet.strDiffText='(equal)';
    this.mes("v "+versionO+" vs "+version);
  } else this.mes("v "+version);

  extend(GRet, {strEditText:objT.strEditText, strHtmlText:objT.strHtmlText, arrVersionCompared:[versionO,version]});
  //GRet.objPage=copySome({},objPage, ['boOR','boOW', 'boSiteMap', 'idPage']);
  //GRet.objRev=copySome({},objRev, ['tMod']);

  return {err:null, result:[0]};
}

////////////////////////////////////////////////////////////////////////////////////////////////////////

comparePageNeo=function*(flow, tx, objArg){
  var www=objArg.www, strName=objArg.strName, iRevO=objArg.iRevO, iRev=objArg.iRev;
  var boDoExit=0, Ou={};
  var funcNeo4jErr=function(err){   extend(Ou, {mess:'err', err:err}); }

  var err;
  
  var strCqlOrg=`
        //----- getNRev
    MATCH (s:Site { www:$www })-[:hasPage]->(p:Page { nameLC:$strNameLC })-[h:hasRevision]->(r:Revision)
    RETURN count(*) AS nRev
    
        //----- getPage and revs
    MATCH (s:Site { www:$www })-[:hasPage]->(p:Page { nameLC:$strNameLC })
    WITH p
    MATCH (p)-[h:hasRevision]->(rO:Revision {iRev:$iRevO})
    WITH p, rO
    MATCH (p)-[h:hasRevision]->(r:Revision {iRev:$iRev})
    RETURN p, rO, r`;
  var objCql=splitCql(strCqlOrg);
  
  var strNameLC=strName.toLowerCase();
  var Val={strNameLC:strNameLC, www:www};
  var nRev=0;
  tx.cypher({query:objCql['getNRev'], params:Val, lean: true}, function(errT, records){
    if(errT) {debugger; err=errT; boDoExit=1; } else { nRev=records[0].nRev;}
    flow.next();
  });
  yield;
  if(boDoExit) { funcNeo4jErr(err); return Ou; }
  if(nRev==0){ Ou.mess='noSuchPage'; return Ou;} 
  if(iRev>=nRev || iRevO>=nRev) { Ou.mess='noSuchRev'; Ou.nRev=nRev; return Ou; } 
   
  
  var Val={www:www, strNameLC:strNameLC, iRevO:iRevO, iRev:iRev}, objPage, objRevO, objRev;
  tx.cypher({query:objCql['getPage and revs'], params:Val, lean: true}, function(errT, records){
    if(errT) {debugger; err=errT; boDoExit=1;  } else {
      objPage=records[0].p;
      objRevO=records[0].rO;
      objRev=records[0].r;
    }
    flow.next();
  });
  yield;
  if(boDoExit) {  funcNeo4jErr(err); return Ou;}
  
  
  if(!objPage.boOR && !objArg.boVLoggedIn){Ou.mess='boViewLoginRequired'; return Ou;}


  Ou.strEditTextO=objRevO.strEditText;
  Ou.strEditText=objRev.strEditText;
  
      // parse (Reparsing to get right link coloring and the latest templates)
    // parse
  var objT=yield* parse(flow, tx, {www:www, strEditText:Ou.strEditText, boOW:objPage.boOW});    if(objT.mess=='err') return objT;
  Ou.strHtmlText=objT.strHtmlText;   Ou.objTemplateE=objT.objTemplateE;
  var arrSub=objT.arrSub, StrSubImage=objT.StrSubImage;
  
  Ou.mess='OK';  return Ou;
} 

////////////////////////////////////////////////////////////////////////////////////////////////////////
    var tx=dbNeo4j.beginTransaction();
    var strName=fileName, boDoExit=0;
    var strCqlOrg=` 
      MERGE (i:Image {nameLC:$strNameLC})
      ON CREATE SET i+={ name:$strName, idImage:myMisc.myrandstringFunc(16)}
      SET i.tMod=$tMod, i.size=$size, i.hash=$hash
      RETURN i`;
    
    var objImg={};
    var Val={strNameLC:strName.toLowerCase(), strName:strName, tMod:unixNow(), size:data.length, hash:md5(data)}
    tx.cypher({query:strCqlOrg, params:Val, lean: true}, function(errT, records){
      if(errT) {debugger;  err=errT; boDoExit=1;  } else {
        objImg=records[0].i;
      }
      flow.next();
    });
    yield;
    if(boDoExit ) { self.mesEO(err); return {err:'exited'}; }
    if(objT.mess=='err') {
      if(tx.state===tx.STATE_OPEN){ tx.rollback(function(err){ if(err)console.log(err); flow.next();}); }
      yield;
      this.mesEO('err'); return {err:'exited'};
    }else{   if(tx.state===tx.STATE_OPEN){ tx.commit(function(err){ if(err)console.log(err); flow.next();});  }
      yield;
    }
    
    var collection = dbMongo.collection('documents');
    var objDoc={};objDoc[objImg.idImage]='abc';
    collection.insertOne( objDoc, function(errT, resultT) {
      err=errT; result=resultT;
      assert.equal(1, result.result.n);
      assert.equal(1, result.ops.length);    
      flow.next();
    });
    yield;
    if(err) {console.log(err); return; }
////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////
