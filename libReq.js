


"use strict"

/******************************************************************************
 * reqBU
 ******************************************************************************/

//  http://localhost:5000/backUpPage
//  http://localhost:5000/backUpPage?{%22boUsePrefixOnDefaultSitePages%22:0}
//  http://localhost:5000/backUpImage?{"arrName":["abc","def"]}
app.reqBU=function*(strArg) {
  var req=this.req, res=this.res;
  var sessionID=req.sessionID, flow=req.flow;
  
      // Conditionally push deadlines forward
  this.boVLoggedIn=yield* wrapRedisSendCommand.call(req, 'expire',[this.req.sessionID+'_viewTimer',maxViewUnactivityTime]);
  this.boALoggedIn=yield* wrapRedisSendCommand.call(req, 'expire',[this.req.sessionID+'_adminTimer',maxAdminUnactivityTime]);

  if(this.boALoggedIn!=1) {res.outCode(401,'not logged in'); return;}

  var Match=RegExp('(.*?)(Serv)?$').exec(strArg);
  if(!Match){ res.out500(new Error('Cant read backup argument'));   return; } 
  var type=Match[1].toLowerCase();
  var boServ=0; if(Match[2]) boServ=1;

  var jsonInput;
  if(req.method=='POST'){
    var semY=0, semCB=0;
    req.pipe(concat(function(buf){ jsonInput=buf.toString(); if(semY) { flow.next(); } semCB=1;}));
    if(!semCB) { semY=1; yield;}
  } else if(req.method=='GET'){
    var objUrl=url.parse(req.url), qs=objUrl.query||''; jsonInput=urldecode(qs);
  } 
  var inObj={}; if(jsonInput.length) inObj=JSON.parse(jsonInput);
  
  var strNameVar='name'; if(type=='page') strNameVar='p.name'; else if(type=='image') strNameVar='i.name';
  var arrName=[], strWhere='', strWhereWExt='WHERE ';   if('arrName' in inObj) {   arrName=inObj.arrName; strWhere='WHERE '+strNameVar+" IN ($arrName)"; strWhereWExt=strWhere+' AND ' } 
  var boUsePrefixOnDefaultSitePages=('boUsePrefixOnDefaultSitePages' in inObj)?inObj.boUsePrefixOnDefaultSitePages:true;

  var zipfile = new NodeZip();
  if(type=='page'){ 
    var strCql=`
      MATCH (s:Site)-[:hasPage]->(p:Page)-[h:hasRevision]->(r:Revision {iRev:0}) `+strWhere+`
      RETURN s.boDefault AS boDefault, s.name AS siteName, p.name AS strName, r.strEditText AS strEditText, r.tMod AS tMod, r.hash AS hash`;
    var Val={arrName:arrName};
    var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
    if(err){console.log('err'); res.out500(err);   return; } 
    var File=records;
    
    for(var i=0;i<File.length;i++) { 
      var file=File[i];
        // The "NodeZip"-library assumes you want the local time written in the zip-file, I want UTC time (too be able to compare times even thought timezone and daylight-savings-time has changed).
      var unixSkew= file.tMod +(new Date(file.tMod*1000)).getTimezoneOffset()*60;
      var objArg={date:new Date(unixSkew*1000), comment:file.hash, compression:'DEFLATE'};
      var strPrefix=(boUsePrefixOnDefaultSitePages || !file.boDefault)?file.siteName+':':'',   strNameTmp=strPrefix+file.strName+'.txt'
      zipfile.file(strNameTmp, file.strEditText, objArg);
    } 
  } else if(type=='image'){ 
    var strCql=`MATCH (i:Image) `+strWhereWExt+` i.boGotData RETURN i.idImage AS id, i.name AS strName, i.tMod AS tMod, i.hash AS hash`;
    var Val={arrName:arrName};
    var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
    if(err){console.log('err'); res.out500(err);   return; } 
    var File=records;
   
      // Get mongo data
    //db.documents.find({_id: {$in: [ObjectId("1c8e9bf14d3f073a2d535b30"), ObjectId("2364a38d8f000b7a6efaad35")]}});
    var arrID=Array(File.length);   for(var i=0;i<File.length;i++){      arrID[i]=new mongodb.ObjectID(File[i].id);    }
      
    var collection = dbMongo.collection('documents'), objDoc={_id:{ "$in": arrID}};
    var err, doc;   collection.find( objDoc ).toArray(function(errT, docT) { err=errT; doc=docT;  flow.next();  });   yield;
    //var semY=0, semCB=0; collection.find( objDoc ).toArray(function(errT, docT) { err=errT; doc=docT;  if(semY) flow.next(); semCB=1;  });   if(!semCB) { semY=1; yield;}
    if(err ) { res.out500(err); return; }
    var objDocIdToInd={}; for(var i=0;i<doc.length;i++){objDocIdToInd[doc[i]._id.id.toString('hex')]=i; }
    
    for(var i=0;i<File.length;i++) { 
      var file=File[i];
        // The "NodeZip"-library assumes you want the local time written in the zip-file, I want UTC time (too be able to compare times even thought timezone and daylight-savings-time has changed).
      var unixSkew= file.tMod +(new Date(file.tMod*1000)).getTimezoneOffset()*60;
      var objArg={date:new Date(unixSkew*1000), comment:file.hash}; 
      if(file.id in objDocIdToInd) ; else debugger; 
      var data=doc[objDocIdToInd[file.id]].data.buffer;
      zipfile.file(file.strName, data, objArg);
    } 
  } else if(type=='video'){ var strCql=``;
  } else { res.out500('Error backing up, no such type'); return; }
  
    // Get wwwCommon. Create filename.
  var strCql=`MATCH (s:Site {boDefault:true})  RETURN s.www AS wwwCommon`; 
  var Val={};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err){console.log('err'); res.out500(err);   return; } 
  var wwwCommon=records[0].wwwCommon;
  var outFileName=calcBUFileName(wwwCommon,type,'zip');
  
 
    // Output data
  var objArg={type:'string'}, outdata = zipfile.generate(objArg);
  
  if(boServ){
    var leafDataDir='mmmWikiData';
    var fsPage=path.join(__dirname, '..', leafDataDir, outFileName); 
    var err;  fs.writeFile(fsPage, outdata, 'binary', function(errT){ err=errT;  flow.next();  });   yield;
    if(err ) { console.log(err); res.out500(err); }
    res.out200('OK');
  }else{    
    var objHead={"Content-Type": 'application/zip', "Content-Length":outdata.length, 'Content-Disposition':'attachment; filename='+outFileName};
    res.writeHead(200,objHead);
    res.end(outdata,'binary');
  }
}


/******************************************************************************
 * reqBUMeta
 ******************************************************************************/
app.reqBUMeta=function*(strArg) {
  var req=this.req, res=this.res;
  var sessionID=req.sessionID, flow=req.flow;

        // Conditionally push deadlines forward
  this.boVLoggedIn=yield* wrapRedisSendCommand.call(req, 'expire',[this.req.sessionID+'_viewTimer',maxViewUnactivityTime]);
  this.boALoggedIn=yield* wrapRedisSendCommand.call(req, 'expire',[this.req.sessionID+'_adminTimer',maxAdminUnactivityTime]);
  if(this.boALoggedIn!=1) {res.outCode(401,'not logged in'); return;}
 
  var zipfile = new NodeZip();
  var myEscape=myNeo4j.escape; 
  var myEscapeB=function(str){ return '"'+myNeo4j.escape(str)+'"'; }


    // Site
  var strCql=`MATCH (s:Site) RETURN s`;
  var Val={};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err){console.log('err'); res.out500(err);   return; } 
  
  var StrFile=['"boDefault","boTLS","urlIcon16","urlIcon200","googleAnalyticsTrackingID","aPassword","vPassword","name","www"'];
  for(var k=0;k<records.length;k++){
    var r=records[k].s, StrRow=[r.boDefault, r.boTLS, myEscapeB(r.urlIcon16), myEscapeB(r.urlIcon200), myEscapeB(r.googleAnalyticsTrackingID), myEscapeB(r.aPassword), myEscapeB(r.vPassword), myEscapeB(r.name), myEscapeB(r.www)];
    StrFile.push(StrRow.join(','));
  }
  zipfile.file('site.csv', StrFile.join("\n"), {compression:'DEFLATE'});
  
  
    // Page
  var strCql=`
    MATCH (s:Site)-[:hasPage]->(p:Page)-[h:hasRevision]->(r:Revision {iRev:0})
    RETURN p.boOR AS boOR, p.boOW AS boOW, p.boSiteMap AS boSiteMap, p.tCreated AS tCreated, r.tMod AS tMod, p.tLastAccess AS tLastAccess, p.nAccess AS nAccess, s.name AS siteName, p.name AS strName`;
  var Val={};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err){console.log('err'); res.out500(err);   return; } 
  
  var StrFile=['"boOR","boOW","boSiteMap","tCreated","tMod","tLastAccess","nAccess","siteName","strName"'];
  for(var k=0;k<records.length;k++){
    var r=records[k], StrRow=[r.boOR, r.boOW, r.boSiteMap, r.tCreated, r.tMod, r.tLastAccess, r.nAccess, myEscapeB(r.siteName), myEscapeB(r.strName)];
    StrFile.push(StrRow.join(','));
  } 
  zipfile.file('page.csv', StrFile.join("\n"), {compression:'DEFLATE'});
  
  
    // Image
  var strCql=`
    MATCH (i:Image) WHERE i.boGotData
    RETURN i.boOther AS boOther, i.tCreated AS tCreated, i.tMod AS tMod, i.tLastAccess AS tLastAccess, i.nAccess AS nAccess, i.name AS imageName`;
  var Val={};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err){console.log('err'); res.out500(err);   return; } 

  var StrFile=['"boOther","tCreated","tMod","tLastAccess","nAccess","imageName"'];
  for(var k=0;k<records.length;k++){
    var r=records[k], StrRow=[r.boOther, r.tCreated, r.tMod, r.tLastAccess, r.nAccess, myEscapeB(r.imageName)];
    StrFile.push(StrRow.join(','));
  } 
  zipfile.file('image.csv', StrFile.join("\n"), {compression:'DEFLATE'});
  
  
    // Redirect
  var strCql=`
    MATCH (s:Site)-[:hasRedirect]->(r:Redirect)
    RETURN r.tCreated AS tCreated, r.tMod AS tMod, r.tLastAccess AS tLastAccess, r.nAccess AS nAccess, s.name AS siteName, r.nameLC AS nameLC, r.url AS url`;
  var Val={};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err){console.log('err'); res.out500(err);   return; }
  
  var StrFile=['"tCreated","tMod","tLastAccess","nAccess","name","nameLC","url"'];
  for(var k=0;k<records.length;k++){
    var r=records[k], StrRow=[r.tCreated, r.tMod, r.tLastAccess, r.nAccess, myEscapeB(r.siteName), myEscapeB(r.nameLC), myEscapeB(r.url)];
    StrFile.push(StrRow.join(','));
  }
  zipfile.file('redirect.csv', StrFile.join("\n"), {compression:'DEFLATE'});
    

    // Get wwwCommon. Create filename.
  var strCql=`MATCH (s:Site {boDefault:true})  RETURN s.www AS wwwCommon`; 
  var Val={};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err){console.log('err'); res.out500(err);   return; } 
  var wwwCommon=records[0].wwwCommon;
  var outFileName=calcBUFileName(wwwCommon,'meta','zip');
 
    // Output data
  var objArg={type:'string'}, outdata = zipfile.generate(objArg);
  
  if(strArg=='Serv'){
    var leafDataDir='mmmWikiData';
    var fsPage=path.join(__dirname, '..', leafDataDir, outFileName); 
    var err;  fs.writeFile(fsPage, outdata, 'binary', function(errT){ err=errT;  flow.next();  });   yield;
    if(err ) { console.log(err); res.out500(err); }
    res.out200('OK');
  }else{    
    var objHead={"Content-Type": 'application/zip', "Content-Length":outdata.length, 'Content-Disposition':'attachment; filename='+outFileName};
    res.writeHead(200,objHead);
    res.end(outdata,'binary');
  }
  
  //res.setHeader('Content-type','text/plain');
  //res.setHeader('Content-Disposition','attachment; filename='+outFileName);
  //var strOut=StrOut.join("\n");  res.end(strOut); 
}

app.reqBUMetaSQL=function*() {
  var req=this.req, res=this.res;
  var sessionID=req.sessionID, flow=req.flow;

        // Conditionally push deadlines forward
  this.boVLoggedIn=yield* wrapRedisSendCommand.call(req, 'expire',[this.req.sessionID+'_viewTimer',maxViewUnactivityTime]);
  this.boALoggedIn=yield* wrapRedisSendCommand.call(req, 'expire',[this.req.sessionID+'_adminTimer',maxAdminUnactivityTime]);
  if(this.boALoggedIn!=1) {res.outCode(401,'not logged in'); return;}
 
  var myEscape=function(str){
    var reg=new RegExp('([\\\\\\\'])','g'); 
    var reg=/([\\\'])/g; 
    var strNew=str.replace(reg,'\\$1');
    return strNew;
  }
  var myEscape=myNeo4j.escape; 
  var myEscapeB=function(str){ return '"'+myNeo4j.escape(str)+'"'; }

  var strDBPrefix='mmmWiki';
  var StrTableKey=["sub", "subImage", "version", "page", "thumb", "image", "video", "file", "setting", "redirect", "redirectDomain", "site", "nParent", "nParentI"]; //,"cache" , "siteDefault"
  //StrTableKey=["sub", "statNChild", "statParent", "subImage", "version", "page", "thumb", "image", "video", "file", "setting", "redirect", "redirectDomain", "site"];
  var StrViewsKey=["pageWWW", "pageLastSlim", "pageLast", "redirectWWW", "parentInfo", "parentImInfo", "childInfo", "childImInfo", "subWChildID", "subWExtra"]; 
  var TableName={};for(var i=0;i<StrTableKey.length;i++) {var name=StrTableKey[i]; TableName[StrTableKey[i]+"Tab"]=strDBPrefix+'_'+name;}
  var ViewName={};for(var i=0;i<StrViewsKey.length;i++) {var name=StrViewsKey[i]; ViewName[StrViewsKey[i]+"View"]=strDBPrefix+'_'+name;}

  extract(TableName);
  extract(ViewName);


    // Site
  var strCql=`MATCH (s:Site) RETURN s`;
  var Val={};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err){console.log('err'); res.out500(err);   return; } 
  
    // Page
  var strCql=`
    MATCH (s:Site)-[:hasPage]->(p:Page)-[h:hasRevision]->(r:Revision {iRev:0})
    RETURN p.boOR AS boOR, p.boOW AS boOW, p.boSiteMap AS boSiteMap, p.tCreated AS tCreated, r.tMod AS tMod, p.tLastAccess AS tLastAccess, p.nAccess AS nAccess, s.name AS siteName, p.name AS strName`;
  var Val={};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err){console.log('err'); res.out500(err);   return; } 
  
  var SqlB=[];
  
  for(var k=0;k<records.length;k++){
    var r=records[k]; r.pageName=r.strName;
    var pageName=myEscapeB(r.pageName), siteName=myEscapeB(r.siteName), tMod=(new Date(r.tMod*1000)).toISOString().substring(0, 19).replace('T', ' ');  
    SqlB.push("UPDATE "+pageWWWView+" p JOIN "+versionTab+" v ON p.idPage=v.idPage SET boOR="+r.boOR+", boOW="+r.boOW+", boSiteMap="+r.boSiteMap+", tMod='"+tMod+"' WHERE p.siteName="+siteName+" AND pageName="+pageName+";");  //
  }
  SqlB.push("");
  
    // Image
  var strCql=`
    MATCH (i:Image) WHERE i.boGotData
    RETURN i.boOther AS boOther, i.tCreated AS tCreated, i.tMod AS tMod, i.tLastAccess AS tLastAccess, i.nAccess AS nAccess, i.name AS imageName`;
  var Val={};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err){console.log('err'); res.out500(err);   return; } 
  
  for(var k=0;k<records.length;k++){
    var r=records[k], tMod=(new Date(r.tMod*1000)).toISOString().substring(0, 19).replace('T', ' ');
    var tCreated=tMod;
    var imageName=myEscapeB(r.imageName);
    SqlB.push("UPDATE "+imageTab+" SET boOther="+r.boOther+", created='"+tCreated+"' WHERE imageName="+imageName+";");
  }
  
    // Redirect
  var strCql=`
    MATCH (s:Site)-[:hasRedirect]->(r:Redirect)
    RETURN r.tCreated AS tCreated, r.tMod AS tMod, r.tLastAccess AS tLastAccess, r.nAccess AS nAccess, s.name AS siteName, r.nameLC AS nameLC, r.url AS url`;
  var Val={};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err){console.log('err'); res.out500(err);   return; }

  for(var k=0;k<records.length;k++){
    var r=records[k];
    r.pageName=r.nameLC;
    var siteName=myEscapeB(r.siteName),  pageName=myEscapeB(r.pageName),  url=myEscapeB(r.url);
    var tCreated=(new Date(r.tCreated*1000)).toISOString().substring(0, 19).replace('T', ' '),  tLastAccess=(new Date(r.tLastAccess*1000)).toISOString().substring(0, 19).replace('T', ' ');
    tCreated=myEscapeB(tCreated),  tLastAccess=myEscapeB(tLastAccess);
    SqlB.push("REPLACE INTO mmmWiki_redirect (idSite, pageName, url, created, nAccess, tLastAccess) (SELECT idSite, "+pageName+", "+url+", "+tCreated+", "+r.nAccess+", "+tLastAccess+" FROM mmmWiki_site WHERE siteName="+siteName+");");
  }
  var sql=SqlB.join("\n");
 
    // Get wwwCommon. Create filename.
  var strCql=`MATCH (s:Site {boDefault:true})  RETURN s.www AS wwwCommon`; 
  var Val={};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err){console.log('err'); res.out500(err);   return; } 
  var wwwCommon=records[0].wwwCommon;

  var outFileName=calcBUFileName(wwwCommon,'meta','sql');
  res.setHeader('Content-type','text/plain');
  res.setHeader('Content-Disposition','attachment; filename='+outFileName);
  res.end(sql); 
  
}


/******************************************************************************
 * reqIndex
 ******************************************************************************/
app.reqIndex=function*() {
  var req=this.req, res=this.res; 
  var sessionID=req.sessionID, flow=req.flow;
  var qs=req.objUrl.query||'', objQS=querystring.parse(qs);
  var pathName=decodeURIComponent(req.pathName);

  var Match=RegExp('^/([^\\/]+)$').exec(pathName);
  if(Match) var queredPage=Match[1]; 
  else{
    if(pathName!='/') { res.out301Loc(''); return;}
    if('page' in objQS) { res.out301Loc(objQS.page); return;}
    var queredPage='start';
  }

      // Conditionally push deadlines forward
  this.boVLoggedIn=yield* wrapRedisSendCommand.call(req, 'expire',[this.req.sessionID+'_viewTimer',maxViewUnactivityTime]);
  this.boALoggedIn=yield* wrapRedisSendCommand.call(req, 'expire',[this.req.sessionID+'_adminTimer',maxAdminUnactivityTime]);

  // Private:
  //                                                           index.html  first ajax (pageLoad)
  //Shall look the same (be cacheable (not include CSRFcode))     no           yes

  // Public:
  //                                                           index.html  first ajax (specSetup)
  //Shall look the same (be cacheable (not include CSRFcode))     yes          no

  var CSRFCode='';  // If public then No CSRFCode since the page is going to be cacheable (look the same each time)

  //if(req.boTLS) res.setHeader("Strict-Transport-Security", "max-age="+24*3600+"; includeSubDomains");
  var tmpS=req.boTLS?'s':'';
  //res.setHeader("Content-Security-Policy", "default-src http"+tmpS+": 'self'  *.google.com; img-src *");
  //res.setHeader("Content-Security-Policy", "default-src http");
  
    
  var iRev=-1;    if('version' in objQS) {  var iRev=objQS.version-1 }
  var eTagIn=getETag(req.headers), requesterCacheTime=getRequesterTime(req.headers);

  
       // getInfoNData
  var tx=sessionNeo4j.beginTransaction();
  var objArg={};   copySome(objArg, req, ['boTLS', 'www']);     extend(objArg, {strName:queredPage, iRev:iRev, eTag:eTagIn, requesterCacheTime:requesterCacheTime, boFront:1});
  var objT=yield* getInfoNDataNeo(flow, tx, objArg);
  if(objT.mess=='err') {
    yield* neo4jRollbackGenerator(flow, tx);
    res.out500('err');  return; //this.mesEO('err'); return {err:'exited'};
  }else{
    yield* neo4jCommitGenerator(flow, tx);
  }
  var objDBData=objT;
  var objRev;
  //res.setHeader("Set-Cookie", "myCookieUpdatedOn304Test="+randomHash());

  var site=objDBData.site;
  var siteDefault=objDBData.siteDefault;
  var GRet={arrVersionCompared:[null,1], matVersion:[], objTemplateE:{}, boTalkExist:0, strEditText:''};
  
  var mess=objDBData.mess; 
  if(mess=='redirectDomain') { var url=objDBData.urlRedirect+'/'+queredPage; res.out301(url); return;  }
  else if(mess=='redirect') { var url=objDBData.urlRedirect; res.out301(url); return;  }
  else if(mess=='wwwNotFound'){ res.out404('No wiki there');  return;  }
  else if(mess=='noDefaultSite'){ res.out500(mess);  return;  }
  else if(mess=='redirectTLS') { 
    var strS=Number(objDBData.boTLS)?'s':'';
    var url='http'+strS+'://'+objDBData.www+'/'+queredPage;
    res.out301(url);  return;
  }
  else if(mess=='noSuchPage'){
    //var eTag=md5(''); 
    res.statusCode=404;
    res.setHeader("Cache-Control", "must-revalidate");  res.setHeader('Last-Modified',(new Date(0)).toUTCString());  //res.setHeader('ETag',eTag); 
    objRev={strHtmlText:''};
  }
  else if(mess=='redirectCase') { 
    var strS=Number(objDBData.boTLS)?'s':'';
    var url='http'+strS+'://'+objDBData.www+'/'+objDBData.objPage.name;
    res.out301(url);  return;
  }
  else if(mess=='private') { 
    var objPage=objDBData.objPage;
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, post-check=0, pre-check=0"); // no-cache
    CSRFCode=randomHash(); 
    var redisVar=sessionID+'_'+queredPage+'_CSRF';
    var tmp=yield* wrapRedisSendCommand.call(req, 'set',[redisVar,CSRFCode]);
    var tmp=yield* wrapRedisSendCommand.call(req, 'expire',[redisVar,maxViewUnactivityTime]);
    objRev={strHtmlText:''};
  }
  else if(mess=='noSuchRev') {res.out500(mess);  return; }
  else if(mess=='serverCacheStale' || mess=='304' || mess=='serverCacheOK'){
    var iRev=objDBData.iRev, objRev=objDBData.arrRev[iRev];
    res.setHeader("Cache-Control", "must-revalidate");  res.setHeader('Last-Modified',(new Date(objRev.tModCache*1000)).toUTCString());
    if(mess=='304') { res.out304();  return; }
    else{
      var objPage=objDBData.objPage;
      
      GRet.strEditText=objRev.strEditText;
      GRet.matVersion=makeMatVersion(objDBData.arrRev);  // tMod, summary and signature
      GRet.arrVersionCompared=[null, iRev+1];


      if(mess=='serverCacheStale'){       
            // refreshRevNeo
        var tx=sessionNeo4j.beginTransaction();
        var objArg={};   copySome(objArg, req, ['boTLS', 'www']);     extend(objArg, {strName:queredPage, iRev:iRev});
        var objT=yield* refreshRevNeo(flow, tx, objArg);
        if(objT.mess=='err') {
          yield* neo4jRollbackGenerator(flow, tx);
          res.out500('err');  return; //this.mesEO('err'); return {err:'exited'};
        }else{
          yield* neo4jCommitGenerator(flow, tx);
        }
        var objDBData=objT;
        var objPage=objDBData.objPage;
        var objRev=objDBData.arrRev[iRev];
      } 
      copySome(GRet, objDBData, ['objTemplateE', 'boTalkExist']);
      //res.setHeader('ETag',objRev.hash);
    } 
  }
  else { res.out500('mess='+mess);  return; }
  
  var www=req.www;

  var Str=[];
  Str.push(`<!DOCTYPE html>
<html><head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta name="generator" content="mmmWiki">`);
  Str.push('<link rel="icon" type="image/png" href="'+site.urlIcon16+'" />');
  Str.push("<meta name='viewport' id='viewportMy' content='initial-scale=1'/>");

  var boTemplate=RegExp('^template:','i').test(queredPage);
  var boSiteMapTmp=true; if(typeof objPage!='undefined') boSiteMapTmp=objPage.boSiteMap;
  var strTmp=''; if(!boSiteMapTmp || objRev.strHtmlText=='' || boTemplate) strTmp='<meta name="robots" content="noindex">'; Str.push(strTmp); 

  var strTitle;
  if(queredPage=='start') { 
    if(typeof strStartPageTitle!='undefined' && strStartPageTitle) strTitle=strStartPageTitle; else strTitle=www;
  } else strTitle=queredPage.replace(RegExp('_','g'),' ');

  
  var strScheme='http'+(site.boTLS?'s':''),   strSchemeLong=strScheme+'://';
  var uTmp=strSchemeLong+www; if(queredPage!='start') uTmp=uTmp+"/"+queredPage;  Str.push('<link rel="canonical" href="'+uTmp+'"/>');




  var strSchemeCommon='http'+(siteDefault.boTLS?'s':''),   strSchemeCommonLong=strSchemeCommon+'://';
  var uCommon=strSchemeCommonLong+siteDefault.www;
  //var uJQuery='https://code.jquery.com/jquery-latest.min.js';    if(boDbg) uJQuery=uCommon+'/'+flFoundOnTheInternetFolder+"/jquery-latest.js";      Str.push("<script src='"+uJQuery+"'></script>");
  //var uJQuery='https://code.jquery.com/jquery-2.1.4.min.js';    if(boDbg) uJQuery=uCommon+'/'+flFoundOnTheInternetFolder+"/jquery-2.1.4.min.js";      Str.push("<script src='"+uJQuery+"'></script>");
  var uJQuery='https://code.jquery.com/jquery-3.2.1.min.js';    if(boDbg) uJQuery=uCommon+'/'+flFoundOnTheInternetFolder+"/jquery-3.2.1.min.js";
  Str.push('<script src="'+uJQuery+'" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>');

    // If boDbg then set vTmp=0 so that the url is the same, this way the debugger can reopen the file between changes

    // Include stylesheets
  var pathTmp='/stylesheets/style.css', vTmp=CacheUri[pathTmp].eTag; if(boDbg) vTmp=0;    Str.push('<link rel="stylesheet" href="'+uCommon+pathTmp+'?v='+vTmp+'" type="text/css">');

    // Include site specific JS-files
  //var uSite=req.strSchemeLong+www;
  //var keyCache=req.strSite+'/'+leafSiteSpecific, vTmp=CacheUri[keyCache].eTag; if(boDbg) vTmp=0;  Str.push('<script src="'+uSite+'/'+leafSiteSpecific+'?v='+vTmp+'"></script>');

    // Include JS-files
  var StrTmp=['filter.js', 'lib.js', 'libClient.js', 'client.js', leafCommon];
  //StrTmp=StrTmp.concat(StrPako[0]);
  for(var i=0;i<StrTmp.length;i++){
    var pathTmp='/'+StrTmp[i], vTmp=CacheUri[pathTmp].eTag; if(boDbg) vTmp=0;    Str.push('<script src="'+uCommon+pathTmp+'?v='+vTmp+'"></script>');
  }


  Str.push('<script src="'+uCommon+'/lib/foundOnTheInternet/zip.js"></script>');
  Str.push('<script src="'+uCommon+'/lib/foundOnTheInternet/sha1.js"></script>');


  var strTracker, tmpID=this.googleAnalyticsTrackingID||null;
  if(boDbg||!tmpID){strTracker="<script> ga=function(){};</script>";}else{ 
  strTracker="\n\
<script type=\"text/javascript\">\n\
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){\n\
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),\n\
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)\n\
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');\n\
  ga('create', '"+tmpID+"', 'auto');\n\
  ga('send', 'pageview');\n\
</script>\n";
  }
  Str.push(strTracker);


  Str.push("\
</head>\n\
<body style=\"margin:0\">\n\
<title>"+strTitle+"</title>\n\
<div id=pageText>"+objRev.strHtmlText+"</div>\n");  

  Str.push("<input type=hidden id='boLCacheObs'>");
  Str.push("<script language=\"JavaScript\">");
  Str.push("function indexAssign(){");

  var objSiteDefault=copySome({},siteDefault, ['www','boTLS']);
  Str.push("objSiteDefault="+JSON.stringify(objSiteDefault)+";");
  var objSite=copySome({},site, ['www','boTLS']);
  Str.push("objSite="+JSON.stringify(objSite)+";");

  if(typeof objPage!='undefined') {
    var objPageT=copySome({},objPage, ['boOR','boOW', 'boSiteMap', 'idPage']);
    Str.push("objPage="+JSON.stringify(objPageT)+";");
    if(objPage.boOR) var strTmp=''; else {
      var strTmp="CSRFCode="+JSON.stringify(CSRFCode)+";"
      +"boVLoggedIn="+JSON.stringify(this.boVLoggedIn)+";"
      +"boALoggedIn="+JSON.stringify(this.boALoggedIn)+";"
    }
    Str.push(strTmp);
  }
  Str.push("queredPage="+JSON.stringify(queredPage)+";");

  if(typeof objRev!='undefined'){
    var objRevT=copySome({},objRev, ['tMod', 'size']);
    Str.push("objRev="+JSON.stringify(objRevT)+";");
  }

  for(var key in GRet)  Str.push(key+"="+JSON.stringify(GRet[key])+";");

  Str.push("strBTC="+JSON.stringify(strBTC)+";");
  Str.push("ppStoredButt="+JSON.stringify(ppStoredButt)+";");
  Str.push("}");
  Str.push("</script>");

  //var strBottomAd="<span style=\"text-align:center;display:block\">\n\       <a href=http://taxiselector.com>   <img src=bottomAd.png style=\"\">     </a>         </span>\n";     Str.push(strBottomAd);
  Str.push("</body></html>");
  //var str=Str.join('\n');   res.writeHead(200, "OK", {'Content-Type': MimeType.html});
  var str=Str.join('\n');   
  //var eTag=md5(str),   objDBData=yield* mergeETagNeo(req.flow, {strName:queredPage, www:req.www, eTag:eTag});   res.setHeader('ETag', eTag);
  res.setHeader('Content-Type', MimeType.html); 
  res.end(str);    
}


/******************************************************************************
 * reqStatic
 ******************************************************************************/
app.reqStatic=function*() {
  var req=this.req, res=this.res; 
  var pathName=req.pathName;

  var eTagIn=getETag(req.headers);
  var keyCache=pathName; //if(pathName==='/'+leafSiteSpecific) keyCache=req.strSite+keyCache; 
  if(!(keyCache in CacheUri)){
    var filename=pathName.substr(1);    
    var err=yield* readFileToCache.call({flow:req.flow}, filename);
    if(err) {
      if(err.code=='ENOENT') {res.out404(); return;}
      if('Referer' in req.headers) console.log('Referer:'+req.headers.Referer);
      res.out500(err); return;
    }
  }
  var cacheUri=CacheUri[keyCache];
  if(cacheUri.eTag===eTagIn){ res.out304(); return; } 
  var buf=cacheUri.buf, type=cacheUri.type,  eTag=cacheUri.eTag, boZip=cacheUri.boZip, boUglify=cacheUri.boUglify;
  var mimeType=MimeType[type]; 
  if(typeof mimeType!='string') console.log('type: '+type+', mimeType: ', mimeType);
  if(typeof buf!='object' || !('length' in buf)) console.log('typeof buf: '+typeof buf);
  if(typeof eTag!='string') console.log('typeof eTag: '+eTag);
  var objHead={"Content-Type": mimeType, "Content-Length":buf.length, ETag: eTag, "Cache-Control":"public, max-age=31536000"};
  if(boZip) objHead["Content-Encoding"]='gzip';
  res.writeHead(200, objHead); // "Last-Modified": maxModTime.toUTCString(),
  res.write(buf); //, this.encWrite
  res.end();
}




/******************************************************************************
 * reqCaptcha
 ******************************************************************************/
app.reqCaptcha=function*(){
  var req=this.req, res=this.res;
  var sessionID=req.sessionID;
  var strCaptcha=parseInt(Math.random()*9000+1000);
  var redisVar=sessionID+'_captcha';
  var tmp=yield* wrapRedisSendCommand.call(req, 'set',[redisVar,strCaptcha]);
  var tmp=yield* wrapRedisSendCommand.call(req, 'expire',[redisVar,3600]);
  var p = new captchapng(80,30,strCaptcha); // width,height,numeric captcha
  p.color(0, 0, 0, 0);  // First color: background (red, green, blue, alpha)
  p.color(80, 80, 80, 255); // Second color: paint (red, green, blue, alpha)

  var img = p.getBase64();
  var imgbase64 = new Buffer(img,'base64');
  res.writeHead(200, {
      'Content-Type': 'image/png'
  });
  res.end(imgbase64);
}








/******************************************************************************
 * reqMediaImage
 ******************************************************************************/
app.reqMediaImage=function*(){
  var req=this.req, res=this.res;
  var sessionID=req.sessionID;
  var flow=req.flow;
  
  var Match=RegExp('^/(.*?)$').exec(req.pathName);
  if(!Match) {res.out404('Not Found'); return;}
  var nameAsReq=Match[1];
  if( !nameAsReq || nameAsReq == "" ){ res.out404('Not Found'); return;} // Exit because non-valid name


  this.eTagIn=getETag(req.headers);
  this.requesterCacheTime=getRequesterTime(req.headers);

  var strImageExt=StrImageExt.join('|');
  var RegThumb=RegExp('(\\d+)(.?)px-(.*)\\.('+strImageExt+')$','i'); 
  var RegImage=RegExp('(.*)\\.('+strImageExt+')$','i');  // Ex "100hpx-oak.jgp"
  var Match;
  if(Match=RegThumb.exec(nameAsReq)){ 
    var nameOrgAsReq=Match[3]+'.'+Match[4],  strSide=Match[2],  intReqSize=Number(Match[1]),  kind=Match[4].toLowerCase();
    extend(this, {nameOrgAsReq:nameOrgAsReq, strSide:strSide, intReqSize:intReqSize, kind:kind});
    yield* reqMediaImageThumb.call(this); return;
  } 
  
  var kind='';  if(Match=RegImage.exec(nameAsReq)){  kind=Match[2].toLowerCase();  }
    
 
    // Get image-meta 
  var strCql=` 
    MATCH (i:Image {nameLC:$strNameLC})
    SET i.nAccess=i.nAccess+1
    RETURN i`;
  var Val={strNameLC:nameAsReq.toLowerCase()};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err ) { res.out500(err); return; }
  if(records.length==0) {res.out404('Not Found');  return;}
  var objImg=records[0].i, idImage=objImg.idImage;
  if(!('boGotData' in objImg)) {res.out404('Not Found');  return;}
  var tMod=new Date(objImg.tMod*1000), eTagOrg=objImg.hash, nameCanonical=objImg.name;
  
  if(nameCanonical!=nameAsReq){    res.out301Loc(nameCanonical); return;    }

  var boValidRequesterCache=this.requesterCacheTime && this.requesterCacheTime>=tMod && (this.eTagIn === eTagOrg);
  if(boValidRequesterCache) {  res.out304(); return; }   // Exit because the requester has a valid version


  if(kind.length==0) {res.out500('kind.length==0');  return;}
  var strMime=MimeType[kind];
  res.setHeader("Content-type", strMime);
  
    // Get image-data 
  var err, doc, collection = dbMongo.collection('documents');
  collection.find( {_id:new mongodb.ObjectID(idImage)} ).toArray(function(errT, docT) { err=errT; doc=docT;  flow.next();  });
  yield;
  if(err ) { res.out500(err); return; }
  if(doc.length==0) {res.out500('Image data not found');  return;}
  var data=doc[0].data.buffer;
  var eTagOrg=md5(data);  res.setHeader('Last-Modified', tMod.toUTCString());    res.setHeader('ETag', eTagOrg); res.setHeader('Content-Length',data.length);
  res.end(data);
 
}

 
app.reqMediaImageThumb=function*(){
  var req=this.req, res=this.res;
  var flow=req.flow;

  var nameOrgAsReq=this.nameOrgAsReq, strSide=this.strSide, intReqSize=this.intReqSize, kind=this.kind;
  
  if( !nameOrgAsReq || nameOrgAsReq == "" ){ res.out404('Not Found'); return;} // Exit because non-valid name

 
    // Get image-meta 
  var strCql=` 
    MATCH (i:Image {nameLC:$strNameLC})
    SET i.nAccess=i.nAccess+1
    RETURN i`;
  var nameOrgAsReqLC=nameOrgAsReq.toLowerCase();
  var Val={strNameLC:nameOrgAsReqLC};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err ) { res.out500(err); return; }
  if(records.length==0) {res.out404('Not Found');  return;}
  var objImgOrg=records[0].i, idImageOrg=objImgOrg.idImage;
  if(!('boGotData' in objImgOrg)) {res.out404('Not Found');  return;}
  var nameCanonical=objImgOrg.name, tModOrg=new Date(objImgOrg.tMod*1000);
  
  var strSideOrg=strSide;
  if(strSide=='a') {if(objImgOrg.height>objImgOrg.width) strSide='h'; else strSide='w'; } 
  
    // Convert height request to width if necessary
  var widthCalc=intReqSize; if(strSide=='h') { widthCalc=objImgOrg.width/objImgOrg.height*intReqSize;  }
  
  //var IntPref=[50,100,200,300,400,500,600,800,1000], tmp=closest2Val(IntPref, widthCalc); var widthPref=tmp[0];
  var IntPref=[50,100,200,300,400,500,600,800,1000], iPref=preferedValue(widthCalc, IntPref); if(iPref==-1) iPref=IntPref.length-1; var widthPref=IntPref[iPref];
 
    // If widthPref is bigger than objImgOrg.widthSkipThumb then redirect to the original.
  if( widthPref>objImgOrg.widthSkipThumb) { res.out301Loc(nameCanonical); return;    }

    // If the camelcasing is wrong or the size isn't the prefered then make a redirect.
  if(nameCanonical!=nameOrgAsReq || strSideOrg!='w' || widthCalc!=widthPref) {  res.out301Loc(widthPref+'wpx-'+nameCanonical); return;    }
  

    // Get thumb-meta
  var strCql=` 
    MATCH (i:Image {nameLC:$strNameLC})-[h:hasThumb]->(t:ImageThumb {width:$width})
    RETURN t`;
  var Val={strNameLC:nameOrgAsReqLC, width:intReqSize};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err ) { res.out500(err); return; }
  var thumbTime=false, idThumb, hashThumb;   if(records.length) {var tmp=records[0].t; thumbTime=new Date(tmp.tMod*1000); idThumb=tmp.idThumb; hashThumb=tmp.hash;  }


  
  var boValidRequesterCache=this.requesterCacheTime && this.requesterCacheTime>=tModOrg && (this.eTagIn === hashThumb);
  if(boValidRequesterCache) {  res.out304(); return; }   // Exit because the requester has a valid version

  var strMime=MimeType[kind];  if(kind=='svg') strMime=MimeType['png'];  // using png for svg-thumbs

      // If there is a thumb and original image hasn't changed
  if(thumbTime!==false && thumbTime>=tModOrg) {

       // Get thumb-data 
    var err, doc, collection = dbMongo.collection('documents');
    collection.find( {_id:new mongodb.ObjectID(idThumb)}).toArray(function(errT, docT) { err=errT; doc=docT;  flow.next();  });
    yield;
    if(err ) { res.out500(err); return; }
    if(doc.length==0) {console.log(nameOrgAsReqLC+' w'+intReqSize+' Thumb data not found. mongoID:'+idThumb);  } //return;
    else {
      var data=doc[0].data.buffer;
      //if(data.length>blaahhh){  res.out301Loc(nameCanonical); return;    }  
      
      res.setHeader("Content-type",strMime); res.setHeader('Last-Modified', thumbTime.toUTCString());   res.setHeader('ETag',hashThumb);  res.setHeader('Content-Length',data.length);  res.end(data);  return; 
    }
  } 


    // Ok so the thumb must be calculated
  
    // Get original image-data 
  var err, doc, collection = dbMongo.collection('documents');
  collection.find( {_id:new mongodb.ObjectID(idImageOrg)} ).toArray(function(errT, docT) { err=errT; doc=docT;  flow.next();  });  yield;
  if(err ) { res.out500(err); return; }
  if(doc.length==0) {res.out500('Image data not found');  return;}
  var strDataOrg=doc[0].data.buffer


  var width=objImgOrg.width, height=objImgOrg.height;

  
  var wNew=widthPref, scale=wNew/width, hNew=Math.floor(scale*height);

  var strDataThumb=strDataOrg;
  if(scale>=1) { scale=1;  if(wNew>100){ res.outCode(400,'Bad Request, 100px is the max width for enlargements.'); return;} } // No enlargements
  if(scale <= 1){  
    if(kind=='svg'){

      var pathTmp, err;
      temporary.file(function(errT, pathT, fd) { err=errT; pathTmp=pathT; flow.next(); }); yield;
      if(err){res.out500(err);  return;}

      fs.writeFile(pathTmp, strDataOrg, function(errT) { err=errT; flow.next(); }); yield;
      if(err){res.out500(err); return;}
      
      var stdout;
      im.convert(['-resize', wNew+'x'+hNew, 'svg:'+pathTmp, 'png:-'],  function(errT, stdoutT){ err=errT; stdout=stdoutT; flow.next(); }); yield;
      if(err) {res.out500(err); return;}
      strDataThumb=new Buffer(stdout,'binary');
       
    }else{
      var myCollector=concat(function(buf){ strDataThumb=buf;  flow.next(); });
      var boDoExit=0;
      var streamImg=gm(strDataOrg).autoOrient().resize(wNew, hNew).stream(function streamOut(err, stdout, stderr) {
        if(err){res.out500(err);  boDoExit=1; return; } 
        stdout.pipe(myCollector); 
      });
      yield;  if(boDoExit==1) return; 
    }     
  }


    // If the strDataThumb is bigger than strDataOrg/2 then don't serve it, store the new widthSkipThumb (and do a 301 to the origin). 
  if(strDataThumb.length>strDataOrg.length/2) {
    var widthSkipThumbNew=Math.min(objImgOrg.widthSkipThumb, width); strDataThumb=''; 
    
    var strCql=` 
      MATCH (i:Image {idImage:$idImage})
      SET i.widthSkipThumb=$widthSkipThumbNew`;
    var Val={idImage:idImageOrg, widthSkipThumbNew:widthSkipThumbNew}
    var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
    if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
    res.out301Loc(nameCanonical); return; 
  }  

    // Store the thumb
  var strCql=` 
    MATCH (i:Image {idImage:$idImage})
    MERGE (i)-[h:hasThumb]->(t:ImageThumb {width:$width})
    ON CREATE SET t+={ idThumb:myMisc.myrandstringHexFunc(24), nAccess:0}
    SET t.size=$size, t.tMod=$tNow, t.hash=$hash, t.width=$width, t.height=$height
    RETURN t`;
  
  var tNow=unixNow(), thumbTime=new Date(tNow*1000), hashThumb=md5(strDataThumb);
  var Val={idImage:idImageOrg, width:wNew, height:hNew, tNow:tNow, size:strDataThumb.length, hash:hashThumb }
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  var objImgThumb=records[0].t;
  
  
  var collection = dbMongo.collection('documents');
  var result, objDoc={_id:new mongodb.ObjectID(objImgThumb.idThumb), data:strDataThumb};
  collection.save( objDoc, function(errT, resultT) { err=errT; result=resultT;  flow.next(); });   yield;
  if(err) { extend(Ou, {mess:'err', err:err}); return Ou; }
  

    // Echo to buffer
  res.setHeader("Content-type",strMime);  res.setHeader('Last-Modified', thumbTime.toUTCString());     res.setHeader('ETag',hashThumb);  res.setHeader('Content-Length',strDataThumb.length);
  //res.setHeader('X-Robots-Tag','noindex');
  res.end(strDataThumb);

}



/******************************************************************************
 * reqMediaVideo
 ******************************************************************************/
app.reqMediaVideo=function*(){
  var req=this.req, res=this.res;
  var sessionID=req.sessionID, flow=req.flow;
  
  var Match=RegExp('^/(.*?)$').exec(req.pathName);
  if(!Match) {res.out404('Not Found'); return;}
  var nameQ=Match[1];

  var eTagIn=getETag(req.headers);
  var requesterCacheTime=getRequesterTime(req.headers);

  var nameOrg=nameQ;
  if( !nameOrg || nameOrg == "" ){ res.out404('Not Found'); return;} // Exit because non-valid name


    // Get info from videoTab
  var sql="SELECT idVideo, UNIX_TIMESTAMP(tCreated) AS tCreated, idFile, eTag, size, name FROM "+videoTab+" WHERE name=?";
  var Val=[nameOrg];
  var objT=yield* myQueryGen(flow, sql, Val, mysqlPool), err=objT.err; if(err) {  res.out500(err); return; }    var results=objT.results;
  var c=results.length; if(c==0) {res.out404('Not Found'); return;}
  var tmp=results[0];
  var idVideo=tmp.idVideo, orgTime=new Date(tmp.tCreated*1000), idFileOrg=tmp.idFile, eTagOrg=tmp.eTag, total=tmp.size, nameCanonical=tmp.name;
      
       
  if(nameCanonical!=nameOrg){   res.out301Loc(nameCanonical); return;  }


  if(eTagOrg===eTagIn) { res.out304(); return }


  var range = req.headers.range||'0-';
  var positions = range.replace(/bytes=/, "").split("-");
  var start = parseInt(positions[0], 10);
  
  var end=positions[1] ? parseInt(positions[1], 10) : total-1;
  var chunksize=(end-start)+1;



  var type, Match=RegExp('\\.(mp4|ogg|webm)$').exec(nameOrg); if(Match && Match.length>1) type=Match[1]; else {type='txt'; }
  var mimeType=MimeType[type]||'txt'; 


  //var sql="SELECT data FROM "+fileTab+" WHERE idFile=?";
  var sql="SELECT substr(data, "+(start+1)+", "+chunksize+") AS data FROM "+fileTab+" WHERE idFile=?";
  var Val=[idFileOrg];
  var objT=yield* myQueryGen(flow, sql, Val, mysqlPool), err=objT.err; if(err) {  res.out500(err); return; }    var results=objT.results;
  var c=results.length; if(c==0) {res.out404('Not Found');  return;}
  var c=results.length; if(c!=1) {res.out500('c!=1'); return;}
  var tmp=results[0], buf=tmp.data;

  if(chunksize!=buf.length) {res.out500('chunksize!=buf.length, ('+chunksize+'!='+buf.length+')'); return;}

  res.writeHead(206, {
    "Content-Range": "bytes " + start + "-" + end + "/" + total,
    "Accept-Ranges": "bytes",
    "Content-Length": chunksize,
    "Content-Type": mimeType,
    "ETag": eTagOrg,
    "Cache-Control":"public, max-age=31536000",
    "Last-Modified":orgTime.toUTCString()
  });

  res.end(buf);
}






/******************************************************************************
 * reqSiteMap
 ******************************************************************************/
app.reqSiteMap=function*() {
  var req=this.req, res=this.res;
  var sessionID=req.sessionID, flow=req.flow;
  var www=req.www;

  //xmlns:image="http://www.google.com/schemas/sitemap-image/1.1

  var strCql=` 
    MATCH (s:Site {www:$www})-[:hasPage]->(p:Page)-[h:hasRevision]->(r:RevisionLast) WHERE NOT p.boTemplate AND p.boOR AND p.boSiteMap
    RETURN s.boTLS AS boTLS, p.name AS pageName, p.boOR AS boOR, p.boOW AS boOW, r.tMod AS tMod`;
  var Val={www:www};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err ) { res.out500(err); return; }

  var Str=[];
  Str.push('<?xml version="1.0" encoding="UTF-8"?>');
  Str.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  for(var i=0;i<records.length;i++){
    var file=records[i];
    var strScheme='http'+(file.boTLS?'s':''),     strSchemeLong=strScheme+'://',    uSite=strSchemeLong+req.www;
    var tmp=''; if(file.pageName!='start') tmp='/'+file.pageName;
    var url=uSite+tmp;
    var tMod=(new Date(file.tMod*1000)).toISOString().slice(0,10);
    Str.push("<url><loc>"+url+"</loc><lastmod>"+tMod+"</lastmod></url>");
  }
  Str.push('</urlset>');  
  var str=Str.join('\n');   res.writeHead(200, "OK", {'Content-Type': 'text/xml'});   res.end(str);
}


/******************************************************************************
 * reqRobots
 ******************************************************************************/
app.reqRobots=function*() {
  var req=this.req, res=this.res;
  var sessionID=req.sessionID, flow=req.flow;

  if(1) {
    var Str=[];
    Str.push("User-agent: *"); 
    Str.push("Disallow: ")
    var str=Str.join('\n');   res.out200(str);  return; 
  }
  //if(1) {res.out404('404 Not found'); return; }

  //var sql="SELECT pageName, boOR, boOW, UNIX_TIMESTAMP(v.tMod) AS tMod, lastRev, boOther FROM "+pageTab+" p JOIN "+versionTab+" v ON p.idPage=v.idPage AND p.lastRev=v.rev  WHERE !(pageName REGEXP '^template:.*') AND boOR=1 AND boSiteMap=1";
  //var sql="SELECT pageName, boOR, boOW, UNIX_TIMESTAMP(tMod) AS tMod, lastRev, boOther FROM "+pageLastView+" WHERE !(pageName REGEXP '^template:.*') AND boOR=1 AND boSiteMap=1";
  var sql="SELECT boTLS, pageName, boOR, boOW, UNIX_TIMESTAMP(tMod) AS tMod, lastRev, boOther FROM "+pageLastView+" WHERE www=? AND !(pageName REGEXP '^template:.*') AND boOR=1 AND boSiteMap=1"; 
  var Val=[req.www];
  var objT=yield* myQueryGen(flow, sql, Val, mysqlPool), err=objT.err; if(err) {  res.out500(err); return; }    var results=objT.results;
  var Str=[];
  Str.push("User-agent: Google"); 
  Str.push("Disallow: /");
  Str.push("Allow: /$")

  for(var i=0;i<results.length;i++){
    var file=results[i];
    var q=file.pageName;
    Str.push("Allow: /"+q);
  }
  var str=Str.join('\n');   //res.writeHead(200, "OK", {'Content-Type': 'text/plain'});   res.end(str);
  res.out200(str);
}


/******************************************************************************
 * reqMonitor
 ******************************************************************************/
app.reqMonitor=function*(){
  var req=this.req, res=this.res;
  var sessionID=req.sessionID, flow=req.flow;

  if(!objOthersActivity){  //  && boPageBUNeeded===null && boImageBUNeeded===null
    
    var strCql=` 
      MATCH (s:Site)-[:hasPage]->(p:Page)-[h:hasRevision]->(r:RevisionLast) WHERE p.boOther
      RETURN s.name AS siteName, p.name AS pageName`;
    var Val={};
    var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
    if(err ) { res.out500(err); return; }

    var nEdit=records.length, pageName=nEdit==1?records[0].siteName+':'+records[0].pageName:nEdit;

    var strCql=` 
      MATCH (i:Image) WHERE i.boGotData AND i.boOther RETURN i.name AS imageName`;
    var Val={};
    var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
    if(err ) { res.out500(err); return; }

    var nImage=records.length, imageName=nImage==1?records[0].imageName:nImage;
    
    objOthersActivity={nEdit:nEdit, pageName:pageName,  nImage:nImage, imageName:imageName};
  }

  var colPage='';   //if(boPageBUNeeded) colPage='orange';
  var n=objOthersActivity.nEdit,  strPage=n==1?objOthersActivity.pageName:n;   if(n) colPage='red';   

  var colImg='';  //if(boImageBUNeeded) colImg='orange';
  var n=objOthersActivity.nImage,  strImg=n==1?objOthersActivity.imageName:n;   if(n) colImg='red';   

  if(colPage) strPage="<span style=\"background-color:"+colPage+"\">"+strPage+"</span>";
  if(colImg) strImg="<span style=\"background-color:"+colImg+"\">"+strImg+"</span>";
  res.end("<body style=\"margin: 0px;padding: 0px\">"+strPage+" / "+strImg+"</body>");

}


/******************************************************************************
 * reqStat
 ******************************************************************************/
app.reqStat=function*(){
  var req=this.req, res=this.res;
  var sessionID=req.sessionID, flow=req.flow;

  var strCql=`MATCH (i:Image) WHERE i.boGotData RETURN i.name AS imageName, i.idImage AS idImage`;
  var Val={};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err ) { res.out500(err); return; };
  var nImage=records.length, arrImage=records;

  var strCql=`MATCH (i:Image)-[h:hasThumb]->(t:ImageThumb) RETURN i.name AS imageName, t.idThumb AS idThumb, t.width AS width, t.height AS height`;
  var Val={};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err ) { res.out500(err); return; }
  var nThumb=records.length, arrThumb=records;
  
    // Get mongo ids
  var collection = dbMongo.collection('documents'); //, objDoc={{},{"_id":1}};
  var err, doc;   collection.find( {}, {"_id":1} ).toArray(function(errT, docT) { err=errT; doc=docT;  flow.next();  });   yield;
  //var semY=0, semCB=0; collection.find( objDoc ).toArray(function(errT, docT) { err=errT; doc=docT;  if(semY) flow.next(); semCB=1;  });   if(!semCB) { semY=1; yield;}
  if(err ) { res.out500(err); return; }
  var objDocIdToInd={}; for(var i=0;i<doc.length;i++){objDocIdToInd[doc[i]._id.id.toString('hex')]=0; }
  var nFile=doc.length;

  var Str=[]; 
  Str.push('<!DOCTYPE html>\n\
  <html><head>\n\
  <meta name="robots" content="noindex">\n\
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" >\n\
  <meta name="viewport" id="viewportMy" content="initial-scale=1" />');


  //var uCommon=''; if(wwwCommon) uCommon=req.strSchemeLong+wwwCommon;
  var wwwCommon=req.www;
  var uCommon=req.strSchemeLong+wwwCommon;
  var uJQuery='https://code.jquery.com/jquery-latest.min.js';    if(boDbg) uJQuery=uCommon+'/'+flFoundOnTheInternetFolder+"/jquery-latest.js";      Str.push("<script src='"+uJQuery+"'></script>");

    // If boDbg then set vTmp=0 so that the url is the same, this way the debugger can reopen the file between changes

    // Include stylesheets
  var pathTmp='/stylesheets/style.css', vTmp=CacheUri[pathTmp].eTag; if(boDbg) vTmp=0;    Str.push('<link rel="stylesheet" href="'+uCommon+pathTmp+'?v='+vTmp+'" type="text/css">');

    // Include site specific JS-files
  //var uSite=req.strSchemeLong+req.www;
  //var keyCache=req.strSite+'/'+leafSiteSpecific, vTmp=CacheUri[keyCache].eTag; if(boDbg) vTmp=0;  Str.push('<script src="'+uSite+'/'+leafSiteSpecific+'?v='+vTmp+'"></script>');

    // Include JS-files
  var StrTmp=['lib.js', 'libClient.js'];
  for(var i=0;i<StrTmp.length;i++){
    var pathTmp='/'+StrTmp[i], vTmp=CacheUri[pathTmp].eTag; if(boDbg) vTmp=0;    Str.push('<script src="'+uCommon+pathTmp+'?v='+vTmp+'"></script>');
  }

  Str.push('<script src="'+uCommon+'/lib/foundOnTheInternet/sortable.js"></script>');

  Str.push("</head>");
  Str.push('<body style="margin:0">');

  Str.push('<h3>Comparing tables</h3>');


  Str.push("<p>nFile: <b>"+nFile+"</b>");
  Str.push("<br><br>");

  Str.push("<p>nImage:"+nImage);
  Str.push("<p>nThumb:"+nThumb);
  Str.push("<p>---------------");
  var sum=nImage+nThumb;  Str.push("<p>Sum: <b>"+sum+'</b>, ');
  var diff=nFile-sum;  if(diff>0) Str.push("("+diff+" files too many)"); else if(diff<0) Str.push("("+(-diff)+" files too few)");

  var arrImageWData=[], arrImageWOData=[];
  for(var i=0;i<arrImage.length;i++){
    var id=arrImage[i].idImage; if(id in objDocIdToInd) { arrImageWData.push(arrImage[i]); objDocIdToInd[id]=1; } else { arrImageWOData.push(arrImage[i]); }
    
  }
  var arrThumbWData=[], arrThumbWOData=[];
  for(var i=0;i<arrThumb.length;i++){
    var id=arrThumb[i].idThumb; if(id in objDocIdToInd) { arrThumbWData.push(arrThumb[i]); objDocIdToInd[id]=1; } else { arrThumbWOData.push(arrThumb[i]); }
  }

  Str.push('<h3>Images without data: '+arrImageWOData.length+'</h3>');
  var arrHead=['imageName', 'idImage'],   strHead='<tr style="font-weight:bold"><td>'+arrHead.join('</td><td>')+'</td></tr>';
  var arrR=[strHead]; 
  for(var i=0;i<arrImageWOData.length;i++){
    var r=arrImageWOData[i], strD='';    for(var name in r){strD+="<td>"+r[name]+"</td>";}    arrR.push("<tr>"+strD+"</tr>\n");
  }
  var strR=arrR.join('');   Str.push("<table style=\"  border: solid 1px;border-collapse:collapse\">\n"+strR+"</table>");

  Str.push('<h3>Thumbs without data: '+arrThumbWOData.length+'</h3>');
  var arrHead=['imageName', 'idThumb', 'width', 'height'],   strHead='<tr style="font-weight:bold"><td>'+arrHead.join('</td><td>')+'</td></tr>';
  var arrR=[strHead]; 
  for(var i=0;i<arrThumbWOData.length;i++){
    var r=arrThumbWOData[i], strD='';    for(var name in r){strD+="<td>"+r[name]+"</td>";}    arrR.push("<tr>"+strD+"</tr>\n");
  }
  var strR=arrR.join('');   Str.push("<table style=\"  border: solid 1px;border-collapse:collapse\">\n"+strR+"</table>");
  
  
  var arrHead=['_id'],   strHead='<tr style="font-weight:bold"><td>'+arrHead.join('</td><td>')+'</td></tr>';
  var arrR=[strHead];
  for(var k in objDocIdToInd){
    if(objDocIdToInd[k]==0){ var strD="<td>"+k+"</td>";  arrR.push("<tr>"+strD+"</tr>\n"); }
  }
  Str.push('<h3>Data without meta: '+(arrR.length-1)+'</h3>');
  var strR=arrR.join('');   Str.push("<table style=\"  border: solid 1px;border-collapse:collapse\">\n"+strR+"</table>");
  
  var str=Str.join('\n');  // res.writeHead(200, "OK", {'Content-Type': 'text/html'}); 
  res.end(str);  
}


