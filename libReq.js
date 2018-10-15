


"use strict"

/******************************************************************************
 * reqBU
 ******************************************************************************/
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
  
  var strNameVar='name'; if(type=='page') strNameVar='pageName'; else if(type=='image') strNameVar='imageName';

  var jsonInput;
  if(req.method=='POST'){
    var semY=0, semCB=0;
    req.pipe(concat(function(buf){ jsonInput=buf.toString(); if(semY) { flow.next(); } semCB=1;}));
    if(!semCB) { semY=1; yield;}
  } else if(req.method=='GET'){
    var objUrl=url.parse(req.url), qs=objUrl.query||''; jsonInput=urldecode(qs);
  } 
  var inObj={}; if(jsonInput.length) inObj=JSON.parse(jsonInput);
  var boLimited=0, arrName=[], nName, tmpQ; 
  if('arrName' in inObj) {
    boLimited=1; arrName=inObj.arrName;
    nName=arrName.length; if(nName>1) { tmpQ=array_fill(nName, "?").join(','); tmpQ=strNameVar+" IN ("+tmpQ+")";  } else if(nName==1) tmpQ=strNameVar+"=?"; else tmpQ="false";
  } 
  var boUsePrefixOnDefaultSitePages=('boUsePrefixOnDefaultSitePages' in inObj)?inObj.boUsePrefixOnDefaultSitePages:true;
  var strExt, sql, strLim='';
  var boCompress=0;
  var Sql=[];
  if(type=='page'){ 
    var boCompress=1;
    strExt='.txt'; 
    //sql="SELECT pageName, data FROM "+pageTab+" p JOIN "+versionTab+" v JOIN "+fileTab+" f WHERE p.idPage=v.idPage AND lastRev=rev AND f.idFile=v.idFile";
    //sql="SELECT pageName, data, UNIX_TIMESTAMP(tMod) AS date, eTag FROM "+pageTab+" p JOIN "+versionTab+" v JOIN "+fileTab+" f WHERE p.idPage=v.idPage AND rev=0 AND f.idFile=v.idFile";
    sql="SELECT boDefault, siteName, pageName, data, UNIX_TIMESTAMP(tMod) AS date, eTag FROM "+pageWWWView+" p JOIN "+versionTab+" v JOIN "+fileTab+" f WHERE p.idPage=v.idPage AND rev=0 AND f.idFile=v.idFile";

    if(boLimited){ strLim=" AND "+tmpQ;  }
  } else if(type=='image'){
    strExt='';
    sql="SELECT imageName, data, UNIX_TIMESTAMP(tCreated) AS date, eTag FROM "+imageTab+" i JOIN "+fileTab+" f ON f.idFile=i.idFile";
    if(boLimited){ strLim=" WHERE "+tmpQ; }
  } else if(type=='video'){
    //res.out500('Error, zipping video is to slow'); return;
    strExt='';
    sql="SELECT name, data, UNIX_TIMESTAMP(tCreated) AS date, eTag FROM "+videoTab+" i JOIN "+fileTab+" f ON f.idFile=i.idFile";
    if(boLimited){ strLim=" WHERE "+tmpQ;  }
  } else { res.out500('Error backing up, no such type'); return; }
  //sql+=strLim;
  Sql.push(sql+strLim+';');
  Sql.push("SELECT siteName, www AS wwwCommon FROM "+siteTab+" WHERE boDefault=1;");
  var sql=Sql.join('\n');
  

  //var dateTrash=new Date();
  var Val=arrName;
  var [err, results]=yield* this.myMySql.query(flow, sql, Val);  if(err) {  res.out500(err); return; }
  
  var File=results[0]; //console.log('len:'+ File.length);
  var zipfile = new NodeZip();
  for(var i=0;i<File.length;i++) { 
    var file=File[i];
    //zipfile.file(file.name+strExt, file.data);
    //zipfile.file(file.name+strExt, file.data, {date:file.date, comment:file.eTag});  //
    var unixSkew= file.date +(new Date(file.date*1000)).getTimezoneOffset()*60; // The "NodeZip"-library assumes you want the local time written in the zip-file, I want UTC time (too be able to compare times even thought timezone and daylight-savings-time has changed).
    var objArg={date:new Date(unixSkew*1000), comment:file.eTag}; if(boCompress) objArg.compression='DEFLATE';
    var strNameTmp=file[strNameVar]+strExt; if(type=='page' && (boUsePrefixOnDefaultSitePages || !file.boDefault)) strNameTmp=file.siteName+':'+strNameTmp;
    zipfile.file(strNameTmp, file.data, objArg);  //
  } 

  
    // Output data
  var objArg={type:'string'}, outdata = zipfile.generate(objArg);
  
  if(boServ){
    var outFileName=type+'.zip';
    var fsPage=path.join(__dirname, '..', 'mmmWikiBU', outFileName); 
    var err;  fs.writeFile(fsPage, outdata, 'binary', function(errT){ err=errT;  flow.next();  });   yield;
    if(err) { console.log(err); res.out500(err); }
    res.out200('OK');
  }else{
    //var outFileName=calcBUFileName(results[1][0].siteName, type, 'zip');
    var outFileName=results[1][0].siteName+'_'+swedDate(unixNow())+'_'+type+'.zip';
    var objHead={"Content-Type": 'application/zip', "Content-Length":outdata.length, 'Content-Disposition':'attachment; filename='+outFileName};
    res.writeHead(200,objHead);
    res.end(outdata,'binary');
  }
  var redisVar='mmmWiki_tLastBU', strTmp=yield* wrapRedisSendCommand.call(req, 'set',[redisVar,unixNow()]);
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
  

  var Sql=[];
  Sql.push("SELECT boDefault, boTLS, siteName, www, googleAnalyticsTrackingID, urlIcon16, urlIcon200, aPassword, vPassword, UNIX_TIMESTAMP(tCreated) AS tCreated FROM "+siteTab+";");
  Sql.push("SELECT boTLS, siteName, pageName, boTalk, boTemplate, boOR, boOW, boSiteMap, UNIX_TIMESTAMP(tMod) AS tMod FROM "+pageLastView+";");
  Sql.push("SELECT imageName, boOther, UNIX_TIMESTAMP(tCreated) AS tCreated FROM "+imageTab+";");
  Sql.push("SELECT name, UNIX_TIMESTAMP(tCreated) AS tCreated FROM "+videoTab+";");
  Sql.push("SELECT siteName, pageName, url, UNIX_TIMESTAMP(tCreated) AS tCreated, nAccess, UNIX_TIMESTAMP(tLastAccess) AS tLastAccess, UNIX_TIMESTAMP(tMod) AS tMod FROM "+redirectWWWView+";");
  Sql.push("SELECT siteName, www AS wwwCommon FROM "+siteTab+" WHERE boDefault=1;");
  var sql=Sql.join('\n');
  var Val=[];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val);  if(err) {  res.out500(err); return; }
  
  //var matPage=results[0], matImage=results[1], matVideo=results[2], matRedirect=results[3], matWWWCommon=results[4];
  var matSite=results[0], matPage=results[1], matImage=results[2], matVideo=results[3], matRedirect=results[4], matWWWCommon=results[5];

  var myEscape=function(str){
    var reg=new RegExp('([\\\\\\\'])','g'); 
    var reg=/([\\\'])/g; 
    var strNew=str.replace(reg,'\\$1');
    return strNew;
  }
  var zipfile = new NodeZip();
  var myEscape=myNeo4j.escape; 
  var myEscapeB=function(str){ return '"'+myEscape(str)+'"'; }
  var StrData=[], StrFileName=[];
  
    // Site
  var StrFile=['"boDefault","boTLS","urlIcon16","urlIcon200","googleAnalyticsTrackingID","aPassword","vPassword","name","www"'];
  for(var k=0;k<matSite.length;k++){
    var r=matSite[k], StrRow=[Boolean(r.boDefault), Boolean(r.boTLS), myEscapeB(r.urlIcon16), myEscapeB(r.urlIcon200), myEscapeB(r.googleAnalyticsTrackingID), myEscapeB(r.aPassword), myEscapeB(r.vPassword), myEscapeB(r.siteName), myEscapeB(r.www)];
    StrFile.push(StrRow.join(','));
  } 
  StrData.push(StrFile.join("\n")); StrFileName.push('site.csv');

    // Page
  var StrFile=['"boOR","boOW","boSiteMap","tCreated","tMod","tLastAccess","nAccess","siteName","strName"'];
  for(var k=0;k<matPage.length;k++){
    var r=matPage[k], StrRow=[Boolean(r.boOR), Boolean(r.boOW), Boolean(r.boSiteMap), r.tMod, r.tMod, r.tMod, 0, myEscapeB(r.siteName), myEscapeB(r.pageName)];
    StrFile.push(StrRow.join(','));
  } 
  StrData.push(StrFile.join("\n")); StrFileName.push('page.csv');
   
    // Image
  var StrFile=['"boOther","tCreated","tMod","tLastAccess","nAccess","imageName"'];
  for(var k=0;k<matImage.length;k++){
    var r=matImage[k], StrRow=[Boolean(r.boOther), r.tCreated, r.tCreated, r.tCreated, 0, myEscapeB(r.imageName)];
    StrFile.push(StrRow.join(','));
  } 
  StrData.push(StrFile.join("\n")); StrFileName.push('image.csv');

    // Redirect
  var StrFile=['"tCreated","tMod","tLastAccess","nAccess","siteName","nameLC","url"'];
  for(var k=0;k<matRedirect.length;k++){
    var r=matRedirect[k], StrRow=[r.tCreated, r.tCreated, Number(r.tLastAccess), r.nAccess, myEscapeB(r.siteName), myEscapeB(r.pageName), myEscapeB(r.url)];
    StrFile.push(StrRow.join(','));
  }
  StrData.push(StrFile.join("\n")); StrFileName.push('redirect.csv');

    // Output data 
  if(strArg=='Serv'){
    var fsBU=path.join(__dirname, '..', 'mmmWikiBU'); 
    for(var i=0;i<StrData.length;i++){ 
      var fsTmp=path.join(fsBU, StrFileName[i]), err;  fs.writeFile(fsTmp, StrData[i], function(errT){ err=errT;  flow.next();  });   yield;     if(err) { console.log(err); res.out500(err); }
    }  //, 'binary'
    res.out200('OK');
  }else{
    for(var i=0;i<StrData.length;i++){ zipfile.file(StrFileName[i], StrData[i], {compression:'DEFLATE'}); }
    var objArg={type:'string'}, outdata = zipfile.generate(objArg);
    //var outFileName=calcBUFileName(matWWWCommon[0].wwwCommon,'meta','zip');  
    var outFileName=matWWWCommon[0].siteName+'_'+swedDate(unixNow())+'_meta.zip';
    
    var objHead={"Content-Type": 'application/zip', "Content-Length":outdata.length, 'Content-Disposition':'attachment; filename='+outFileName};
    res.writeHead(200,objHead);
    res.end(outdata,'binary');
  } 
}

app.reqBUMetaSQL=function*() {
  var req=this.req, res=this.res;
  var sessionID=req.sessionID, flow=req.flow;

        // Conditionally push deadlines forward
  this.boVLoggedIn=yield* wrapRedisSendCommand.call(req, 'expire',[this.req.sessionID+'_viewTimer',maxViewUnactivityTime]);
  this.boALoggedIn=yield* wrapRedisSendCommand.call(req, 'expire',[this.req.sessionID+'_adminTimer',maxAdminUnactivityTime]);
  if(this.boALoggedIn!=1) {res.outCode(401,'not logged in'); return;}
  

  var Sql=[];
  Sql.push("SELECT boTLS, siteName, pageName, boTalk, boTemplate, boOR, boOW, boSiteMap, DATE_FORMAT(tMod,GET_FORMAT(TIMESTAMP,'ISO')) AS tMod FROM "+pageLastView+";");
  Sql.push("SELECT imageName, boOther, DATE_FORMAT(tCreated,GET_FORMAT(TIMESTAMP,'ISO')) AS tCreated FROM "+imageTab+";");
  Sql.push("SELECT name, DATE_FORMAT(tCreated,GET_FORMAT(TIMESTAMP,'ISO')) AS tCreated FROM "+videoTab+";");
  Sql.push("SELECT siteName, pageName, url, DATE_FORMAT(tCreated,GET_FORMAT(TIMESTAMP,'ISO')) AS tCreated, nAccess, DATE_FORMAT(tLastAccess,GET_FORMAT(TIMESTAMP,'ISO')) AS tLastAccess, DATE_FORMAT(tMod,GET_FORMAT(TIMESTAMP,'ISO')) AS tMod FROM "+redirectWWWView+";");
  Sql.push("SELECT siteName, www AS wwwCommon FROM "+siteTab+" WHERE boDefault=1;");
  var sql=Sql.join('\n');
  var Val=[];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {  res.out500(err); return; }

  var matPage=results[0], matImage=results[1], matVideo=results[2], matRedirect=results[3], matWWWCommon=results[4];

       // Page meta
  var SqlB=[];
  for(var k=0;k<matPage.length;k++){
    var r=matPage[k];
    var pageName=mysqlPool.escape(r.pageName), siteName=mysqlPool.escape(r.siteName);  
    //SqlB.push("UPDATE "+pageTab+" p JOIN "+siteTab+" st ON p.idSite=st.idSite JOIN "+versionTab+" v ON p.idPage=v.idPage SET boOR="+r.boOR+", boOW="+r.boOW+", boSiteMap="+r.boSiteMap+", tMod='"+r.tMod+"' WHERE st.siteName="+siteName+" AND pageName="+pageName+";");  //
    //SqlB.push("UPDATE "+pageLastView+"  SET boOR="+r.boOR+", boOW="+r.boOW+", boSiteMap="+r.boSiteMap+", tMod='"+r.tMod+"' WHERE siteName="+siteName+" AND pageName="+pageName+";");  //
    SqlB.push("UPDATE "+pageWWWView+" p JOIN "+versionTab+" v ON p.idPage=v.idPage SET boOR="+r.boOR+", boOW="+r.boOW+", boSiteMap="+r.boSiteMap+", tMod='"+r.tMod+"' WHERE p.siteName="+siteName+" AND pageName="+pageName+";");  //
  }
  SqlB.push("");

      // Image meta
  for(var k=0;k<matImage.length;k++){
    var r=matImage[k];
    var imageName=mysqlPool.escape(r.imageName);
    SqlB.push("UPDATE "+imageTab+" SET boOther="+r.boOther+", tCreated='"+r.tCreated+"' WHERE imageName="+imageName+";");
  }
      // Video meta
  for(var k=0;k<matVideo.length;k++){
    var r=matVideo[k];
    var name=mysqlPool.escape(r.name);
    SqlB.push("UPDATE "+videoTab+" SET tCreated='"+r.tCreated+"' WHERE name="+name+";");
  }

      // Redirect table
  for(var k=0;k<matRedirect.length;k++){
    var r=matRedirect[k];
    var siteName=mysqlPool.escape(r.siteName),  pageName=mysqlPool.escape(r.pageName),  url=mysqlPool.escape(r.url),  tCreated=mysqlPool.escape(r.tCreated),  tLastAccess=mysqlPool.escape(r.tLastAccess);
    SqlB.push("REPLACE INTO mmmWiki_redirect (idSite, pageName, url, tCreated, nAccess, tLastAccess) (SELECT idSite, "+pageName+", "+url+", "+tCreated+", "+r.nAccess+", "+tLastAccess+" FROM mmmWiki_site WHERE siteName="+siteName+");");
  }
  var sql=SqlB.join("\n");

  var sql=SqlB.join("\n");
  //var outFileName=calcBUFileName(matWWWCommon[0].wwwCommon,'meta','sql');
  var outFileName=matWWWCommon[0].siteName+'_'+swedDate(unixNow())+'_meta.sql';
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
  //var tmpS=req.boTLS?'s':'';
  //res.setHeader("Content-Security-Policy", "default-src http"+tmpS+": 'this'  *.google.com; img-src *");
  //res.setHeader("Content-Security-Policy", "default-src http");
  
  var version=NaN, rev=-1;
  //var version, rev; if('version' in objQS) {  version=objQS.version;  rev=version-1 } else {  version=NaN; rev=-1; }
  var eTagIn=getETag(req.headers), requesterCacheTime=getRequesterTime(req.headers);
 

    // getInfoNData
  //var arg={boFront:1, boTLS:req.boTLS, wwwSite:req.wwwSite, queredPage:queredPage, rev:rev, eTagIn:eTagIn, requesterCacheTime:requesterCacheTime, myMySql:this.myMySql}
  //var [err, Ou]=yield* getInfoNData(flow, arg); if(err) { res.out500(err); return;   }
  //var {mess, version, rev, eTag, idPage, boOR, boOW, boSiteMap, boTalkExist, tMod, tModCache, urlRedir, boTLS, boTLSCommon, wwwCommon, siteName, googleAnalyticsTrackingID, urlIcon16, urlIcon200, aPassword, vPassword, Version, objTemplateE, strEditText, strHtmlText}=Ou;
  
  var Sql=[];
  Sql.push("CALL "+strDBPrefix+"getInfoNData(?, ?, ?, ?, ?, ?);"); 
  var sql=Sql.join('\n');
  var Val=[req.boTLS, req.wwwSite, queredPage, rev, eTagIn, requesterCacheTime/1000];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val);  if(err) {res.out500(err);  return; }
  //if(results.length==1) { res.out500("Weird, getInfoNDataBE should have returned one at least one result plus the 'added' result that stored procedures allways add."); return;   } 
  //if(!(results[0] instanceof Array)) { res.out500('site not found');  return;  }
  if(results[0].length==0) { res.out500('site not found'); return;   }
  var objSite=results[0][0]; if(!objSite){ res.out500('site not found');  return;  }
  var tmp=results[1]; if(tmp.length) {res.out301(tmp[0].urlRedir); return;}
  var tmp=results[2]; if(tmp.length) { res.out301(tmp[0].urlRedirDomain+'/'+queredPage); return;}
  var objSiteDefault=results[3][0];  
  var objPage=results[4][0]; 
  if(!objPage){ res.statusCode=404; } // No such page 
  else {
    var {boRedirectCase, pageRedir}=results[5][0]; if(boRedirectCase) {res.out301(pageRedir);  return;};
    if(!objPage.boOR){   // Private
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, post-check=0, pre-check=0"); // no-cache    
      var CSRFCode=randomHash(); 
      var redisVar=sessionID+'_'+queredPage+'_CSRF';
      var tmp=yield* wrapRedisSendCommand.call(req, 'set',[redisVar,CSRFCode]);
      var tmp=yield* wrapRedisSendCommand.call(req, 'expire',[redisVar,maxViewUnactivityTime]);
    }else {   // Public
      var {boTalkExist}=results[6][0];
      if(results[7].length==0) { res.out500('no versions?!?'); return;   }
      if(rev==-1) rev=results[7].length-1;  version=rev+1;
      var matVersion=makeMatVersion(results[7]);
      var objRev=Object.assign({},results[7][rev]);
        objRev.tMod=new Date(objRev.tMod*1000);
        objRev.tModCache=new Date(objRev.tModCache*1000);
      var boValidServerCache=results[8][0].boValidServerCache;
      var boValidReqCache=results[9][0].boValidReqCache;
      if(boValidReqCache) { res.out304(); return; }
      else{
        var strEditText=results[10][0].strEditText.toString();
        let {boOR,boOW,boSiteMap}=objPage;
        let {tMod}=objRev;
        if(boValidServerCache) {
          var strHtmlText=results[11][0].strHtmlText.toString();
          var objTemplateE=createObjTemplateE(results[12]);
           
          var eTag=md5(strHtmlText +JSON.stringify(objTemplateE) +tMod +boOR +boOW +boSiteMap +boTalkExist +JSON.stringify(matVersion));

          var sql=`UPDATE `+versionTab+` SET tModCache=now(), eTag=? WHERE idPage=? AND rev=?;     SELECT UNIX_TIMESTAMP(now()) AS tModCache`;
          var Val=[eTag, objPage.idPage, rev];
          var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
          var rowA=results[1][0];
          var tModCache=new Date(rowA.tModCache*1000);
          res.setHeader("Cache-Control", "must-revalidate, public");  res.setHeader('Last-Modified',tModCache.toUTCString());  res.setHeader('ETag',eTag);        
        } else {
            // parse
          var arg={strEditText:strEditText, wwwSite:req.wwwSite, boOW:boOW, myMySql:this.myMySql};
          var [err, [objTemplateE, StrSubImage, strHtmlText, arrSub]]=yield* parse(flow, arg); if(err) { res.out500(err); return; }
          
          var eTag=md5(strHtmlText +JSON.stringify(objTemplateE) +tMod +boOR +boOW +boSiteMap +boTalkExist +JSON.stringify(matVersion));
          
            // setNewCacheSQL
          var {sql, Val, nEndingResults}=createSetNewCacheSQL(req.wwwSite, queredPage, rev, strHtmlText, eTag, arrSub, StrSubImage); 
          sql="START TRANSACTION; "+sql+" COMMIT;";
          var [err, results]=yield* this.myMySql.query(flow, sql, Val);  if(err) {  res.out500(err); return; }
          var iRowLast=results.length-nEndingResults-2;
          var rowA=results[iRowLast][0];
          var mess=rowA.mess;       if(mess!='done') {res.out500(mess);  return; }
          var tModCache=new Date(rowA.tModCache*1000);
           
          res.setHeader("Cache-Control", "must-revalidate, public");  res.setHeader('Last-Modified',tModCache.toUTCString());  res.setHeader('ETag',eTag);
        }
      }
      var arrVersionCompared=[null,rev+1];
    }
  }
  var wwwSite=req.wwwSite

  var ua=req.headers['user-agent']||''; ua=ua.toLowerCase();
  var boMSIE=RegExp('msie').test(ua), boAndroid=RegExp('android').test(ua), boFireFox=RegExp('firefox').test(ua), boIOS= RegExp('iPhone|iPad|iPod','i').test(ua);
  
  //
  // Head
  //
  
  var Str=[];
  var tmp='<!DOCTYPE html>\n\
<html><head>\n\
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>\n\
<meta name="generator" content="mmmWiki">';
  Str.push(tmp);

  Str.push('<link rel="icon" type="image/png" href="'+objSite.urlIcon16+'" />');
  Str.push("<meta name='viewport' id='viewportMy' content='initial-scale=1, minimal-ui'/>");

  var boTemplate=RegExp('^template:','i').test(queredPage);
  if(!objPage || !objPage.boSiteMap || typeof strHtmlText=='undefined' || boTemplate){ Str.push('<meta name="robots" content="noindex">\n'); }


  //
  // Including files
  //
        
  var strSchemeCommon='http'+(objSiteDefault.boTLS?'s':''),   strSchemeCommonLong=strSchemeCommon+'://';
  var uTmp=strSchemeCommonLong+objSite.www; if(queredPage!='start') uTmp=uTmp+"/"+queredPage;  Str.push('<link rel="canonical" href="'+uTmp+'"/>\n');

  var uCommon=strSchemeCommonLong+objSiteDefault.www;
  //var uJQuery='https://code.jquery.com/jquery-latest.min.js';    if(boDbg) uJQuery=uCommon+'/'+flFoundOnTheInternetFolder+"/jquery-latest.js";      Str.push("<script src='"+uJQuery+"'></script>");
  //var uJQuery='https://code.jquery.com/jquery-2.1.4.min.js';    if(boDbg) uJQuery=uCommon+'/'+flFoundOnTheInternetFolder+"/jquery-2.1.4.min.js";      Str.push("<script src='"+uJQuery+"'></script>");
  var uJQuery='https://code.jquery.com/jquery-3.2.1.min.js';    if(boDbg) uJQuery=uCommon+'/'+flFoundOnTheInternetFolder+"/jquery-3.2.1.min.js";
  Str.push('<script src="'+uJQuery+'" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>');

    // If boDbg then set vTmp=0 so that the url is the same, this way the debugger can reopen the file between changes
    
    // Use normal vTmp on iOS (since I don't have any method of disabling cache on iOS devices (nor any debugging interface))
  var boDbgT=boDbg; if(boIOS) boDbgT=0;
    // Include stylesheets
  var pathTmp='/stylesheets/style.css', vTmp=CacheUri[pathTmp].eTag; if(boDbgT) vTmp=0;    Str.push('<link rel="stylesheet" href="'+uCommon+pathTmp+'?v='+vTmp+'" type="text/css">');

    // Include site specific JS-files
  //var uSite=req.strSchemeLong+wwwSite;
  //var keyCache=req.strSite+'/'+leafSiteSpecific, vTmp=CacheUri[keyCache].eTag; if(boDbg) vTmp=0;  Str.push('<script src="'+uSite+'/'+leafSiteSpecific+'?v='+vTmp+'"></script>');

    // Include JS-files
  var StrTmp=['filter.js', 'lib.js', 'libClient.js', 'client.js', leafCommon];
  //StrTmp=StrTmp.concat(StrPako[0]);
  for(var i=0;i<StrTmp.length;i++){
    var pathTmp='/'+StrTmp[i], vTmp=CacheUri[pathTmp].eTag; if(boDbgT) vTmp=0;    Str.push('<script src="'+uCommon+pathTmp+'?v='+vTmp+'"></script>');
  }

  Str.push('<script src="'+uCommon+'/lib/foundOnTheInternet/zip.js"></script>');
  Str.push('<script src="'+uCommon+'/lib/foundOnTheInternet/sha1.js"></script>');


  var strTracker, tmpID=objSite.googleAnalyticsTrackingID||null;
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

  Str.push("<script src='https://www.google.com/recaptcha/api.js?render=explicit' async defer></script>");
  //Str.push("<script src='https://www.google.com/recaptcha/api.js?render=explicit' async defer></script>");
  //Str.push("<script src='https://www.google.com/recaptcha/api.js?render="+strReCaptchaSiteKey+"' async defer></script>"); // &onload=reCaptchaCB
  

  //
  // Body
  //
  
  var strTitle;
  if(queredPage=='start') { 
    if(typeof strStartPageTitle!='undefined' && strStartPageTitle) strTitle=strStartPageTitle; else strTitle=wwwSite;
  } else strTitle=queredPage.replace(RegExp('_','g'),' ');
      
  Str.push("\
</head>\n\
<body style=\"margin:0\">");

  //Str.push('<div class="g-recaptcha" data-sitekey="'+strReCaptchaSiteKey+'"></div>');
  Str.push("<title>"+strTitle+"</title>");
  if(typeof strHtmlText=='undefined') var strHtmlText='';   Str.push("<div id=pageText>"+strHtmlText+"</div>\n");  

  Str.push("<input id='boLCacheObs' style=\"display:none\">"); //type=hidden
  Str.push("<script language=\"JavaScript\">");
  Str.push("function indexAssign(){");

  var tmp=copySome({},objSiteDefault, ['www', 'boTLS', 'siteName']);   Str.push("objSiteDefault="+JSON.stringify(tmp)+";");
  var tmp=copySome({},objSite, ['www', 'boTLS', 'siteName']);    Str.push("objSite="+JSON.stringify(tmp)+";");

  if(typeof objPage!='undefined') {
    var tmp=copySome({},objPage, ['boOR','boOW', 'boSiteMap', 'idPage']);   Str.push("objPage="+JSON.stringify(tmp)+";");
    if(!objPage.boOR) {
      Str.push("CSRFCode="+JSON.stringify(CSRFCode)+";");
      Str.push("boVLoggedIn="+JSON.stringify(this.boVLoggedIn)+";");
      Str.push("boALoggedIn="+JSON.stringify(this.boALoggedIn)+";");
    }
  }
  Str.push("queredPage="+JSON.stringify(queredPage)+";");

  if(typeof objRev!='undefined'){
    var objRevT=copySome({},objRev, ['tMod', 'size']);
    Str.push("objRev="+JSON.stringify(objRevT)+";");
  }

  if(typeof boTalkExist!='undefined') Str.push("boTalkExist="+JSON.stringify(boTalkExist)+";");
  if(typeof strEditText!='undefined') Str.push("strEditText="+JSON.stringify(strEditText)+";");
  if(typeof objTemplateE!='undefined') Str.push("objTemplateE="+JSON.stringify(objTemplateE)+";");
  if(typeof arrVersionCompared!='undefined') Str.push("arrVersionCompared="+JSON.stringify(arrVersionCompared)+";");
  if(typeof matVersion!='undefined') Str.push("matVersion="+JSON.stringify(matVersion)+";");
  
  var strDBType=(typeof mysql!='undefined')?'mysql':'neo4j';
  Str.push("strDBType="+JSON.stringify(strDBType)+";");
  
  Str.push("strBTC="+JSON.stringify(strBTC)+";");
  Str.push("ppStoredButt="+JSON.stringify(ppStoredButt)+";");
  Str.push("strReCaptchaSiteKey="+JSON.stringify(strReCaptchaSiteKey)+";");
  Str.push("}");
  Str.push("</script>");

  //var strBottomAd="<span style=\"text-align:center;display:block\">\n\       <a href=http://taxiselector.com>   <img src=bottomAd.png style=\"\">     </a>         </span>\n";     Str.push(strBottomAd);
  Str.push("</body></html>");
  //var str=Str.join('\n');   res.writeHead(200, "OK", {'Content-Type': MimeType.html});
  var str=Str.join('\n');   res.setHeader('Content-Type', MimeType.html); 
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
    var [err]=yield* readFileToCache(req.flow, filename);
    if(err) {
      if(err.code=='ENOENT') {res.out404(); return;}
      if('Referer' in req.headers) console.log('Referer:'+req.headers.Referer);
      res.out500(err); return;
    }
  }
  var {buf, type, eTag, boZip, boUglify}=CacheUri[keyCache];
  if(eTag===eTagIn){ res.out304(); return; } 
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
 * reqMediaImage
 ******************************************************************************/
app.reqMediaImage=function*(){
  var req=this.req, res=this.res;
  var sessionID=req.sessionID;
  var flow=req.flow;
  
  var Match=RegExp('^/(.*?)$').exec(req.pathName);
  if(!Match) {res.out404('Not Found'); return;}
  var nameQ=Match[1];


  this.eTagIn=getETag(req.headers);
  this.requesterCacheTime=getRequesterTime(req.headers);

  var strImageExt=StrImageExt.join('|');
  var RegThumb=RegExp('(\\d+)(.?)px-(.*)\\.('+strImageExt+')$','i'); 
  var RegImage=RegExp('(.*)\\.('+strImageExt+')$','i');  // Ex "100hpx-oak.jgp"
  var Match, nameOrg, wMax, hMax, kind, boThumb;
  if(Match=RegThumb.exec(nameQ)){ 
    nameOrg=Match[3]+'.'+Match[4];
    if(Match[2]=='a'){  wMax=Match[1]; hMax=Match[1];  }
    else if(Match[2]=='h'){  wMax=0; hMax=Match[1];  }
    else{  wMax=Match[1]; hMax=0;  }
    wMax=Number(wMax); hMax=Number(hMax);
    kind=Match[4].toLowerCase();
    boThumb=1;
  } 
  else { 
    nameOrg=nameQ; boThumb=0;
    if(Match=RegImage.exec(nameQ)){ 
      kind=Match[2].toLowerCase();
    }
  }
  
  if( !nameOrg || nameOrg == "" ){ res.out404('Not Found'); return;} // Exit because non-valid name

    // Get info from imageTab
  var sql="SELECT idImage, UNIX_TIMESTAMP(tCreated) AS tCreated, idFile, eTag, imageName FROM "+imageTab+" WHERE imageName=?";
  var Val=[nameOrg];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {  res.out500(err); return; }
  var c=results.length;    if(c==0) {res.out404('Not Found'); return;}
  //var tmp=results[0];
  //var idImage=tmp.idImage, orgTime=new Date(tmp.tCreated*1000), idFileOrg=tmp.idFile, eTagOrg=tmp.eTag, nameCanonical=tmp.imageName;
  var {idImage, tCreated, idFile:idFileOrg, eTag:eTagOrg, imageName:nameCanonical}=results[0],   orgTime=new Date(tCreated*1000);
       

  if(nameCanonical!=nameOrg){    res.out301Loc(nameCanonical); return;    }

  //var maxModTime=new Date(Math.max(orgTime,bootTime));
  var maxModTime=orgTime;
  

  if(boThumb) {
    extend(this, {nameCanonical:nameCanonical, wMax:wMax, hMax:hMax, kind:kind, idImage:idImage, idFileOrg:idFileOrg, maxModTime:maxModTime});
    yield* reqMediaImageThumb.call(this); return;
  }

  var boValidRequesterCache=this.requesterCacheTime && this.requesterCacheTime>=maxModTime && (this.eTagIn === eTagOrg);
  if(boValidRequesterCache) {  res.out304(); return; }   // Exit because the requester has a valid version


    // Ok so the reponse will be an image
  var strMime=MimeType[kind];
  res.setHeader("Content-type", strMime);
  //res.setHeader("Content-type: image/jpeg");


  var sql="SELECT data FROM "+fileTab+" WHERE idFile=?";
  var Val=[idFileOrg];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {  res.out500(err); return; }
  var c=results.length;    if(c!=1) {res.out500('c!=1');return;}
  var {data}=results[0];
  var eTagOrg=md5(data);  res.setHeader('Last-Modified', maxModTime.toUTCString());    res.setHeader('ETag', eTagOrg); res.setHeader('Content-Length',data.length);
  res.end(data);
 
}

 
app.reqMediaImageThumb=function*(){
  var req=this.req, res=this.res;
  var flow=req.flow;

  var nameCanonical=this.nameCanonical, wMax=this.wMax, hMax=this.hMax, kind=this.kind, idImage=this.idImage, idFileOrg=this.idFileOrg, maxModTime=this.maxModTime;

    // Get info from thumbTab
  var strDim, arrDim;
  if(wMax==0) { strDim="height=?"; arrDim=[hMax]; }
  else if(hMax==0){ strDim="width=?"; arrDim=[wMax]; }
  else{ strDim="(width=? OR height=?)"; arrDim=[wMax,hMax]; }
  var sql="SELECT UNIX_TIMESTAMP(tCreated) AS tCreated, idFile,eTag FROM "+thumbTab+" WHERE idImage=? AND "+strDim;
  var Val=array_merge([idImage],arrDim);
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {  res.out500(err); return; }
  var c=results.length;
  var tmp=results[0];
  var thumbTime=false, idFileThumb, eTagThumb; if(c){ thumbTime=new Date(tmp.tCreated*1000); idFileThumb=tmp.idFile; eTagThumb=tmp.eTag;  }
  //var {tCreated, idFile:idFileThumb, eTag:eTagThumb}=results[0]; var thumbTime=(typeof tCreated!='undefined')?new Date(tCreated*1000):null;

  
  var boValidRequesterCache=this.requesterCacheTime && this.requesterCacheTime>=maxModTime && (this.eTagIn === eTagThumb);
  if(boValidRequesterCache) {  res.out304(); return; }   // Exit because the requester has a valid version


    // If there is an entry in thumbTab (a valid version on the server or boBigger==1)
  var boGotStored=0;
  if(thumbTime!==false && thumbTime>=maxModTime) {  
    var sql="SELECT data FROM "+fileTab+" WHERE idFile=?";
    var Val=[idFileThumb];
    var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {  res.out500(err); return; }
    var c=results.length;    if(c!=1) {res.out500('c!=1');return;}
    var {data}=results[0];
    
      // If this "thumb" has been requested before and its been calculated that the thumb is bigger than the original (indicated by data.length==0) 
    if(data.length==0){  res.out301Loc(nameCanonical); return;    }  
    boGotStored=1;
  } 

    // Ok so the reponse will be an image
  var strMime=MimeType[kind];  if(kind=='svg') strMime=MimeType['png'];  // using png for svg-thumbs
  res.setHeader("Content-type",strMime);

  if(boGotStored){    res.setHeader('Last-Modified', thumbTime.toUTCString());   res.setHeader('ETag',eTagThumb);  res.setHeader('Content-Length',data.length);  res.end(data);  return;   }

  //SELECT * FROM mmmWiki_file f left JOIN mmmWiki_thumb t ON f.idFile=t.idFile WHERE f.idFile IN (39,360)

  //
  // No valid (cached) thumb, so go ahead and do the work (create/calculate) it
  //

    // Fetch original data from db
  var sql="SELECT data FROM "+fileTab+" WHERE idFile=?";
  var Val=[idFileOrg];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {  res.out500(err); return; }
  var c=results.length;    if(c!=1) {res.out500('c!=1');return;}
  var {data:strDataOrg}=results[0];
       


  var width, height, boDoExit=0;
  gm(strDataOrg).size(function(err, value){
    if(err){res.out500(err);  boDoExit=1; return; } 
    width=value.width; height=value.height;
    flow.next(); 
  })
  yield;  if(boDoExit==1) return;

  var hNew, scale, wNew;
  if(wMax==0) {hNew=hMax; scale=hMax/height; wNew=Math.floor(scale*width);}
  else if(hMax==0) {wNew=wMax; scale=wMax/width; hNew=Math.floor(scale*height);} 
  else { // Watch out for rounding errors:   x!==Math.floor((x/xOrg)*xOrg)    (Which might lead to that another size is cached)
    var arrScale=[wMax/width, hMax/height]; scale=arr_min(arrScale); var k=arrScale[0]<arrScale[1]?0:1;
    if(k==0) {wNew=wMax; hNew=Math.floor(scale*height);   }
    else {wNew=Math.floor(scale*width); hNew=hMax;} 
  }

  var strDataThumb=strDataOrg;
  //if(scale>=1) { scale=1;  if(wNew>100){ res.outCode(400,'Bad Request, 100px is the max width for enlargements.'); return;} } // No enlargements
  //if(scale>=1) { scale=1;  if(wNew>100){ res.out301Loc(nameCanonical);  return;} } // 100px is the max width for enlargements
  if(scale>=1) {   res.out301Loc(nameCanonical);  return; } // If enlargement, then redirect to original
  else {
  //if(scale <= 1){  
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


  var bo301ToOrg=0; if(strDataThumb.length>strDataOrg.length/2) {   strDataThumb=''; bo301ToOrg=1;  }  // If the strDataThumb is bigger than strDataOrg/2 then do a 301 to the origin instead. 

  var eTagThumb=md5(strDataThumb);

    // Store in thumbTab
  var Sql=[];
  Sql.push("START TRANSACTION;");
  Sql.push("CALL "+strDBPrefix+"storeThumb(?,?,?,?,?);");
  var Val=[idImage,wNew,hNew,strDataThumb,eTagThumb];
  Sql.push("COMMIT;");
  var sql=Sql.join('\n');
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {  res.out500(err); return; }
  var thumbTime=new Date(results[1][0].tCreated*1000);
  if(bo301ToOrg) { res.out301Loc(nameCanonical); return; }

    // Echo to buffer
  res.setHeader('Last-Modified', thumbTime.toUTCString());     res.setHeader('ETag',eTagThumb);  res.setHeader('Content-Length',strDataThumb.length);
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
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {  res.out500(err); return; }
  var c=results.length; if(c==0) {res.out404('Not Found'); return;}
  //var tmp=results[0];
  //var idVideo=tmp.idVideo, orgTime=new Date(tmp.tCreated*1000), idFileOrg=tmp.idFile, eTagOrg=tmp.eTag, total=tmp.size, nameCanonical=tmp.name;
  var {idVideo, tCreated, idFile:idFileThumb, eTag:eTagThumb, size:total, name:nameCanonical}=results[0]; var orgTime=(typeof tCreated!='undefined')?new Date(tCreated*1000):null;
      
       
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
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {  res.out500(err); return; }
  var c=results.length; if(c==0) {res.out404('Not Found');  return;}
  var c=results.length; if(c!=1) {res.out500('c!=1'); return;}
  var {data:buf}=results[0];

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
  var wwwSite=req.wwwSite;

  //xmlns:image="http://www.google.com/schemas/sitemap-image/1.1

  //var sql="SELECT pageName, boOR, boOW, UNIX_TIMESTAMP(v.tMod) AS tMod, lastRev, boOther FROM "+pageTab+" p JOIN "+versionTab+" v ON p.idPage=v.idPage AND p.lastRev=v.rev WHERE !(pageName REGEXP '^template:.*') AND boOR=1 AND boSiteMap=1";
  //var sql="SELECT pageName, boOR, boOW, UNIX_TIMESTAMP(tMod) AS tMod, lastRev, boOther FROM "+pageLastView+" WHERE !(pageName REGEXP '^template:.*') AND boOR=1 AND boSiteMap=1";
  var sql="SELECT boTLS, pageName, boOR, boOW, UNIX_TIMESTAMP(tMod) AS tMod, lastRev, boOther FROM "+pageLastView+" WHERE www=? AND !(pageName REGEXP '^template:.*') AND boOR=1 AND boSiteMap=1";
  var Val=[wwwSite];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {  res.out500(err); return; }
  var Str=[];
  Str.push('<?xml version="1.0" encoding="UTF-8"?>');
  Str.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  for(var i=0;i<results.length;i++){
    var file=results[i];
    var strScheme='http'+(file.boTLS?'s':''),     strSchemeLong=strScheme+'://',    uSite=strSchemeLong+req.wwwSite;
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
  var Val=[req.wwwSite];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {  res.out500(err); return; }
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
    var Sql=[];
    Sql.push("SELECT SQL_CALC_FOUND_ROWS siteName, pageName, tMod FROM "+pageLastView+" WHERE boOther=1 LIMIT 1;");
    Sql.push("SELECT FOUND_ROWS() AS n;");
    Sql.push("SELECT SQL_CALC_FOUND_ROWS imageName, tCreated FROM "+imageTab+" WHERE boOther=1  LIMIT 1;");
    Sql.push("SELECT FOUND_ROWS() AS n;");
    //Sql.push("SELECT key, value FROM "+settingTab+" WHERE key='tPageBU' OR key 'tImageBU';");
    //Sql.push("SELECT max(tMod) AS tMax FROM "+versionTab+";");
    //Sql.push("SELECT max(tCreated) AS tMax FROM "+imageTab+";");


    var sql=Sql.join('\n'), Val=[];
    var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {  res.out500(err); return; }

    var resP=results[0], nEdit=results[1][0].n, pageName=nEdit==1?resP[0].siteName+':'+resP[0].pageName:nEdit;
    var resI=results[2], nImage=results[3][0].n, imageName=nImage==1?resI[0].imageName:nImage;
    objOthersActivity={nEdit:nEdit, pageName:pageName,  nImage:nImage, imageName:imageName};

    //var objT={}; for(var i=0;i<results[4].length;i++){      var r=results[4][i];      objT[r.key]=r.value;    }
    //if(results[5].length && 'tPageBU' in objT){  var tMaxP=results[5][0].tMax; boPageBUNeeded=tMaxP>objT.tPageBU;  }
    //if(results[6].length && 'tImageBU' in objT){  var tMaxI=results[6][0].tMax; boImageBUNeeded=tMaxI>objT.tImageBU;  }
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

  var Sql=[]; 
  Sql.push("SELECT count(*) AS n FROM "+versionTab+";"); 
  Sql.push("SELECT count(*) AS n FROM "+imageTab+";"); 
  Sql.push("SELECT count(*) AS n FROM "+thumbTab+";");
  Sql.push("SELECT count(*) AS n FROM "+videoTab+";"); 
  Sql.push("SELECT count(*) AS n FROM "+fileTab+";");
  Sql.push("SELECT f.idFile AS file, v.idPage AS page, vc.idPage AS cache, i.idImage AS image, t.idImage AS thumb, vid.idVideo AS video FROM "+fileTab+" f \n\
   LEFT JOIN "+versionTab+" v ON f.idFile=v.idFile \n\
   LEFT JOIN "+versionTab+" vc ON f.idFile=vc.idFileCache \n\
   LEFT JOIN "+imageTab+" i ON f.idFile=i.idFile \n\
   LEFT JOIN "+thumbTab+" t ON f.idFile=t.idFile \n\
   LEFT JOIN "+videoTab+" vid ON f.idFile=vid.idFile");

  var sql=Sql.join('\n'), Val=[];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {  res.out500(err); return; }
    
  var nVersion=results[0][0].n, nImage=results[1][0].n, nThumb=results[2][0].n, nVideo=results[3][0].n, nFile=results[4][0].n, resT=results[5];

  var Str=[]; 
  Str.push('<!DOCTYPE html>\n\
  <html><head>\n\
  <meta name="robots" content="noindex">\n\
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" >\n\
  <meta name="viewport" id="viewportMy" content="initial-scale=1" />');


  //var uCommon=''; if(wwwCommon) uCommon=req.strSchemeLong+wwwCommon;
  var wwwCommon=req.wwwSite;
  var uCommon=req.strSchemeLong+wwwCommon;
  var uJQuery='https://code.jquery.com/jquery-latest.min.js';    if(boDbg) uJQuery=uCommon+'/'+flFoundOnTheInternetFolder+"/jquery-latest.js";      Str.push("<script src='"+uJQuery+"'></script>");

    // If boDbg then set vTmp=0 so that the url is the same, this way the debugger can reopen the file between changes

    // Include stylesheets
  var pathTmp='/stylesheets/style.css', vTmp=CacheUri[pathTmp].eTag; if(boDbg) vTmp=0;    Str.push('<link rel="stylesheet" href="'+uCommon+pathTmp+'?v='+vTmp+'" type="text/css">');

    // Include site specific JS-files
  //var uSite=req.strSchemeLong+req.wwwSite;
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
  Str.push("<p>nVersion:"+nVersion+" (*2) (each creates 2 files)");
  Str.push("<p>nThumb:"+nThumb);
  Str.push("<p>nVideo:"+nVideo);
  Str.push("<p>---------------");
  var sum=2*nVersion+nImage+nThumb+nVideo;  Str.push("<p>Sum: <b>"+sum+'</b>, ');
  var diff=nFile-nVersion*2-nImage-nThumb-nVideo;  Str.push("(diff="+diff+")");

  var tmp="<br>";    if(diff<0) tmp=" (fileTab contains too few entries)<br>";    else if(diff>0) tmp=" (fileTab contains too many entries)<br>";
  Str.push(tmp);

  var arrHead=['idFile','Src [idPage]','Cache [idPage]','Image','Thumb [idImage]','Video','Diff'];
  var strHead='<tr style="font-weight:bold"><td>'+arrHead.join('</td><td>')+'</td></tr>';

  var arrSum=[nFile,nVersion,nVersion,nImage,nThumb,nVideo,diff];
  var strSum='<tr style="font-weight:bold"><td>'+arrSum.join('</td><td>')+'</td></tr>';


  var arrR=[strHead,strSum]; 
  for(var i=0;i<resT.length;i++){
    var r=resT[i];
             // 'file' will be on each row. Other than that, each row should have one other entry. (that is 2 entries per row), (rows with a single entry are marked red) 
    var strD='', col='red'; for(var name in r){var d=r[name]; if(d==null) d=''; strD+="<td>"+d+"</td>"; if(d && name!='file') col='';} 
    if(col.length) col="style=\"background-color:"+col+"\"";
    arrR.push("<tr "+col+">"+strD+"</tr>\n");
  }
  var strR=arrR.join('');
  Str.push("<table style=\"  border: solid 1px;border-collapse:collapse\">\n"+strR+"</table>");

  var str=Str.join('\n');  // res.writeHead(200, "OK", {'Content-Type': 'text/html'}); 
  res.end(str);  

  
}



/******************************************************************************
 * SetupSqlT
 ******************************************************************************/
app.SetupSqlT=function(){
}
app.SetupSqlT.prototype.createTable=function(boDropOnly){
  
  var SqlTabDrop=[], SqlTab=[];
  eval(extractLoc(TableName,'TableName'));
  //eval(extractLoc(ViewName,'ViewName'));

  var StrTabName=object_values(TableName);
  var tmp=StrTabName.join(', ');
  SqlTabDrop.push("DROP TABLE IF EXISTS "+tmp); 
  SqlTabDrop.push('DROP TABLE IF EXISTS '+pageTab+', '+imageTab+'');
  SqlTabDrop.push('DROP TABLE IF EXISTS '+fileTab+', '+siteTab+'');
  SqlTabDrop.push('DROP TABLE IF EXISTS '+siteTab+'');   
  var tmp=object_values(ViewName).join(', ');   if(tmp.length) SqlTabDrop.push("DROP VIEW IF EXISTS "+tmp+"");

  var collate=this.collate="utf8_general_ci";
  var engine=this.engine='INNODB';  //engine=this.engine='MyISAM';
  var auto_increment=1;

/*
  SqlTab.push("CREATE TABLE "+siteDefaultTab+" ( \n\
  idSite int(4) NOT NULL, \n\
  FOREIGN KEY (idSite) REFERENCES "+siteTab+"(idSite)  \n\
  ) ENGINE="+engine+" COLLATE "+collate+"");
*/
  SqlTab.push("CREATE TABLE "+siteTab+" ( \n\
  boDefault int(1) NOT NULL, \n\
  boTLS int(1) NOT NULL, \n\
  idSite int(4) NOT NULL auto_increment, \n\
  siteName varchar(128) NOT NULL, \n\
  www varchar(128) NOT NULL, \n\
  googleAnalyticsTrackingID varchar(16) NOT NULL DEFAULT '', \n\
  urlIcon16 varchar(128) NOT NULL DEFAULT '', \n\
  urlIcon200 varchar(128) NOT NULL DEFAULT '', \n\
  aPassword varchar(128) NOT NULL DEFAULT '', \n\
  vPassword varchar(128) NOT NULL DEFAULT '', \n\
  tCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \n\
  PRIMARY KEY (idSite), \n\
  UNIQUE KEY (siteName), \n\
  UNIQUE KEY (www) \n\
  ) ENGINE="+engine+" COLLATE "+collate+"");

  SqlTab.push("CREATE TABLE "+fileTab+" ( \n\
  idFile int(4) NOT NULL auto_increment, \n\
  data MEDIUMBLOB NOT NULL, \n\
  PRIMARY KEY (idFile) \n\
  ) ENGINE="+engine+" COLLATE "+collate+""); 

  SqlTab.push("CREATE TABLE "+pageTab+" ( \n\
  idPage int(4) NOT NULL auto_increment, \n\
  idSite int(4) NOT NULL, \n\
  pageName varchar(128) NOT NULL, \n\
  boTalk TINYINT(1) NOT NULL, \n\
  boTemplate TINYINT(1) NOT NULL, \n\
  boOR TINYINT(1) NOT NULL DEFAULT 0, \n\
  boOW TINYINT(1) NOT NULL DEFAULT 0, \n\
  boSiteMap TINYINT(1) NOT NULL DEFAULT 0, \n\
  lastRev int(4) NOT NULL DEFAULT 0,     # rev (and lastRev) is 0-indexed, version is 1-indexed\n\
  nChild int(4) NOT NULL DEFAULT 0, \n\
  nImage int(4) NOT NULL DEFAULT 0, \n\
  PRIMARY KEY (idPage), \n\
  UNIQUE KEY (idSite,pageName), \n\
  FOREIGN KEY (idSite) REFERENCES "+siteTab+"(idSite)  \n\
  ) ENGINE="+engine+" COLLATE "+collate+""); 
         // 

  //SqlTab.push("CREATE INDEX "+pageTab+"IdSitePageNameIndex ON "+pageTab+"(idSite,pageName)"); //CREATE INDEX mmmWiki_pageIdSitePageNameIndex ON mmmWiki_page(idSite,pageName);

  
  SqlTab.push("CREATE TABLE "+versionTab+" ( \n\
  idPage int(4) NOT NULL, \n\
  rev int(4) NOT NULL, \n\
  summary varchar(128) NOT NULL DEFAULT '', \n\
  signature varchar(128) NOT NULL DEFAULT '', \n\
  boOther TINYINT(1) NOT NULL DEFAULT 0, \n\
  idFile int(4) NOT NULL, \n\
  idFileCache int(4) NOT NULL, \n\
  tMod TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \n\
  tModCache TIMESTAMP, \n\
  eTag varchar(32) NOT NULL, \n\
  size int(4) NOT NULL, \n\
  PRIMARY KEY (idPage,rev), \n\
   \n\
  FOREIGN KEY (idPage) REFERENCES "+pageTab+"(idPage), \n\
  FOREIGN KEY (idFile) REFERENCES "+fileTab+"(idFile), \n\
  FOREIGN KEY (idFileCache) REFERENCES "+fileTab+"(idFile) \n\
  #UNIQUE KEY (idFile), \n\
  #UNIQUE KEY (idFileCache) \n\
  ) ENGINE="+engine+" COLLATE "+collate+""); 

  SqlTab.push("CREATE TABLE "+subTab+" ( \n\
  idPage int(4) NOT NULL, \n\
  idSite int(4) NOT NULL, \n\
  pageName varchar(128) NOT NULL, \n\
  boOnWhenCached TINYINT(1) NOT NULL, \n\
  PRIMARY KEY (idPage, pageName, idSite), \n\
  #FOREIGN KEY (idPage, idSite) REFERENCES "+pageTab+"(idPage, idSite) ON DELETE CASCADE \n\
  FOREIGN KEY (idPage) REFERENCES "+pageTab+"(idPage) ON DELETE CASCADE \n\
  ) ENGINE="+engine+" COLLATE "+collate+""); 


  // subTab used for: get info about parent, getting nSub of page, storing old data for nParentTab, get templateExistanceArray, get histograms for parents
  // Why is subTab (parent-child-links) needed: 
  //   so that when page (template) is changed, then those who depend on it can be marked stale. 
  //   so that one can make statistics (calculate nParents, nChildren etc) without reParsing the page
  //SqlTab.push("CREATE INDEX "+subTab+"IdPageRevIndex ON "+subTab+"(idPage)"); //CREATE INDEX mmmWiki_subIdPageRevIndex ON mmmWiki_sub(idPage, rev);
  //SqlTab.push("CREATE INDEX "+subTab+"IdSitePageNameIndex ON "+subTab+"(idSite,pageName)"); //CREATE INDEX mmmWiki_subIdSitePageNameIndex ON mmmWiki_sub(idSite, pageName);

  SqlTab.push("CREATE TABLE "+imageTab+" ( \n\
  idImage int(4) NOT NULL auto_increment, \n\
  imageName varchar(128) NOT NULL, \n\
  idFile int(4) NOT NULL, \n\
  boOther TINYINT(1) NOT NULL DEFAULT 0, \n\
  tCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \n\
  eTag varchar(32) NOT NULL, \n\
  size int(4) NOT NULL, \n\
  PRIMARY KEY (idImage), \n\
  UNIQUE KEY (imageName), \n\
  FOREIGN KEY (idFile) REFERENCES "+fileTab+"(idFile) \n\
  #UNIQUE KEY (idFile)  \n\
  ) ENGINE="+engine+" COLLATE "+collate+""); 

  SqlTab.push("CREATE TABLE "+thumbTab+" ( \n\
  idImage int(4) NOT NULL, \n\
  idFile int(4) NOT NULL, \n\
  width int(4) NOT NULL, \n\
  height int(4) NOT NULL, \n\
  tCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \n\
  eTag varchar(32) NOT NULL, \n\
  UNIQUE KEY (idImage,width,height), \n\
  FOREIGN KEY (idImage) REFERENCES "+imageTab+"(idImage), \n\
  FOREIGN KEY (idFile) REFERENCES "+fileTab+"(idFile) \n\
  #UNIQUE KEY (idFile) \n\
  ) ENGINE="+engine+" COLLATE "+collate+""); 

  SqlTab.push("CREATE TABLE "+subImageTab+" ( \n\
  idPage int(4) NOT NULL, \n\
  imageName varchar(128) NOT NULL, \n\
  PRIMARY KEY (idPage,imageName), \n\
  FOREIGN KEY (idPage) REFERENCES "+pageTab+"(idPage) ON DELETE CASCADE \n\
  ) ENGINE="+engine+" COLLATE "+collate+""); 


  SqlTab.push("CREATE TABLE "+videoTab+" ( \n\
  idVideo int(4) NOT NULL auto_increment, \n\
  name varchar(128) NOT NULL, \n\
  idFile int(4) NOT NULL, \n\
  tCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \n\
  size int(4) NOT NULL, \n\
  eTag varchar(32) NOT NULL, \n\
  PRIMARY KEY (idVideo), \n\
  UNIQUE KEY (name), \n\
  FOREIGN KEY (idFile) REFERENCES "+fileTab+"(idFile) ON DELETE CASCADE \n\
  ) ENGINE="+engine+" COLLATE "+collate+""); 

  SqlTab.push("CREATE TABLE "+settingTab+" ( \n\
  name varchar(65) CHARSET utf8 NOT NULL, \n\
  value TEXT CHARSET utf8 NOT NULL, \n\
  UNIQUE KEY (name) \n\
  ) ENGINE="+engine+" COLLATE "+collate+"");

  SqlTab.push("CREATE TABLE "+redirectTab+" ( \n\
  idSite int(4) NOT NULL, \n\
  pageName varchar(128) NOT NULL, \n\
  url varchar(128) NOT NULL, \n\
  tCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \n\
  nAccess int(4) NOT NULL DEFAULT 0, \n\
  tLastAccess TIMESTAMP NOT NULL, \n\
  tMod TIMESTAMP NOT NULL, \n\
  PRIMARY KEY (idSite,pageName) \n\
  ) ENGINE="+engine+" COLLATE "+collate+""); 

  SqlTab.push("CREATE TABLE "+redirectDomainTab+" ( \n\
  www varchar(128) NOT NULL, \n\
  url varchar(128) NOT NULL, \n\
  tCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP, \n\
  PRIMARY KEY (www) \n\
  ) ENGINE="+engine+" COLLATE "+collate+""); 
  SqlTab.push("CREATE TABLE "+nParentTab+" ( \n\
  idSite int(4) NOT NULL, \n\
  pageName varchar(128) NOT NULL, \n\
  nParent int(4) NOT NULL, \n\
  PRIMARY KEY (idSite,pageName) \n\
  ) ENGINE="+engine+" COLLATE "+collate+""); 
  
  SqlTab.push("CREATE TABLE "+nParentITab+" ( \n\
  imageName varchar(128) NOT NULL, \n\
  nParent int(4) NOT NULL, \n\
  PRIMARY KEY (imageName) \n\
  ) ENGINE="+engine+" COLLATE "+collate+""); 

  addBinTableSql(SqlTabDrop,SqlTab,strDBPrefix,PropPage,engine,collate);
  var SqlTabTmp=[];  // Temporary workaround (to add size image bin table)
  addBinTableSql(SqlTabDrop,SqlTabTmp,strDBPrefix,PropImage,engine,collate);
  for(var i=0;i<SqlTabTmp.length;i++){ if(!RegExp('size','i').test(SqlTabTmp[i])) SqlTab.push(SqlTabTmp[i]); }

  
  //SqlTabDrop.push("DROP VIEW IF EXISTS "+pageWWWView+"");  // pageTab with siteTab-fields: boDefault, boTLS, siteName and www
  //SqlTab.push("CREATE VIEW "+pageWWWView+" (boDefault, idPage, boTLS, idSite, siteName, www, pageName, boTalk, boTemplate, boOR, boOW, boSiteMap, lastRev) AS \n\
//SELECT boDefault, p.idPage, boTLS, st.idSite, st.siteName, st.www, p.pageName, boTalk, boTemplate, boOR, boOW, boSiteMap, lastRev FROM "+pageTab+" p JOIN "+siteTab+" st ON p.idSite=st.idSite");

  //SqlTabDrop.push("DROP VIEW IF EXISTS "+pageLastSlimView+"");  // pageTab with versionTab-fields: boOther, tMod, tModCache, eTag, size, idFile and idFileCache for the last version
  //SqlTab.push("CREATE VIEW "+pageLastSlimView+" (idPage, idSite, pageName, boTalk, boTemplate, boOR, boOW, boSiteMap, lastRev, boOther, tMod, tModCache, eTag, size, idFile, idFileCache, nChild, nImage) AS \n\
//SELECT p.idPage, p.idSite, pageName, boTalk, boTemplate, boOR, boOW, boSiteMap, lastRev, boOther, tMod, tModCache, eTag, size, idFile, idFileCache, nChild, nImage FROM "+pageTab+" p JOIN "+versionTab+" v ON p.idPage=v.idPage AND p.lastRev=v.rev");

  //SqlTabDrop.push("DROP VIEW IF EXISTS "+pageLastView+"");  // A combination of the above two views.
  //SqlTab.push("CREATE VIEW "+pageLastView+" (boDefault, idPage, boTLS, idSite, siteName, www, pageName, boTalk, boTemplate, boOR, boOW, boSiteMap, lastRev, boOther, tMod, tModCache, eTag, size, idFile, idFileCache, nChild, nImage) AS \n\
//SELECT boDefault, p.idPage, boTLS, st.idSite, st.siteName, st.www, p.pageName, boTalk, boTemplate, boOR, boOW, boSiteMap, lastRev, boOther, tMod, tModCache, eTag, size, idFile, idFileCache, nChild, nImage FROM "+pageTab+" p JOIN "+versionTab+" v ON p.idPage=v.idPage AND p.lastRev=v.rev JOIN "+siteTab+" st ON p.idSite=st.idSite");


  //SqlTabDrop.push("DROP VIEW IF EXISTS "+redirectWWWView+"");
  //SqlTab.push("CREATE VIEW "+redirectWWWView+" (idSite, siteName, www, pageName, url, tCreated, nAccess, tLastAccess, tMod) AS \n\
//SELECT r.idSite, st.siteName, st.www, r.pageName, url, r.tCreated, nAccess, tLastAccess, tMod FROM "+redirectTab+" r JOIN "+siteTab+" st ON r.idSite=st.idSite");


  

  if(boDropOnly) return SqlTabDrop;
  else return array_merge(SqlTabDrop, SqlTab);
}

app.SetupSqlT.prototype.createView=function(boDropOnly){
  var SqlViewDrop=[], SqlView=[];
  eval(extractLoc(TableName,'TableName'));
  eval(extractLoc(ViewName,'ViewName'));
  
  var tmp=object_values(ViewName).join(', ');   if(tmp.length) SqlViewDrop.push("DROP VIEW IF EXISTS "+tmp+"");

  
  SqlViewDrop.push("DROP VIEW IF EXISTS "+pageWWWView+"");  // pageTab with siteTab-fields: boDefault, boTLS, siteName and www
  SqlView.push("CREATE VIEW "+pageWWWView+" (boDefault, idPage, boTLS, idSite, siteName, www, pageName, boTalk, boTemplate, boOR, boOW, boSiteMap, lastRev) AS \n\
SELECT boDefault, p.idPage, boTLS, st.idSite, st.siteName, st.www, p.pageName, boTalk, boTemplate, boOR, boOW, boSiteMap, lastRev FROM "+pageTab+" p JOIN "+siteTab+" st ON p.idSite=st.idSite");

  SqlViewDrop.push("DROP VIEW IF EXISTS "+pageLastSlimView+"");  // pageTab with versionTab-fields: boOther, tMod, tModCache, eTag, size, idFile and idFileCache for the last version
  SqlView.push("CREATE VIEW "+pageLastSlimView+" (idPage, idSite, pageName, boTalk, boTemplate, boOR, boOW, boSiteMap, lastRev, boOther, tMod, tModCache, eTag, size, idFile, idFileCache, nChild, nImage) AS \n\
SELECT p.idPage, p.idSite, pageName, boTalk, boTemplate, boOR, boOW, boSiteMap, lastRev, boOther, tMod, tModCache, eTag, size, idFile, idFileCache, nChild, nImage FROM "+pageTab+" p JOIN "+versionTab+" v ON p.idPage=v.idPage AND p.lastRev=v.rev");

  SqlViewDrop.push("DROP VIEW IF EXISTS "+pageLastView+"");  // A combination of the above two views.
  SqlView.push("CREATE VIEW "+pageLastView+" (boDefault, idPage, boTLS, idSite, siteName, www, pageName, boTalk, boTemplate, boOR, boOW, boSiteMap, lastRev, boOther, tMod, tModCache, eTag, size, idFile, idFileCache, nChild, nImage) AS \n\
SELECT boDefault, p.idPage, boTLS, st.idSite, st.siteName, st.www, p.pageName, boTalk, boTemplate, boOR, boOW, boSiteMap, lastRev, boOther, tMod, tModCache, eTag, size, idFile, idFileCache, nChild, nImage FROM "+pageTab+" p JOIN "+versionTab+" v ON p.idPage=v.idPage AND p.lastRev=v.rev JOIN "+siteTab+" st ON p.idSite=st.idSite");


  SqlViewDrop.push("DROP VIEW IF EXISTS "+redirectWWWView+"");
  SqlView.push("CREATE VIEW "+redirectWWWView+" (idSite, siteName, www, pageName, url, tCreated, nAccess, tLastAccess, tMod) AS \n\
SELECT r.idSite, st.siteName, st.www, r.pageName, url, r.tCreated, nAccess, tLastAccess, tMod FROM "+redirectTab+" r JOIN "+siteTab+" st ON r.idSite=st.idSite");


  if(boDropOnly) return SqlViewDrop;
  else return array_merge(SqlViewDrop, SqlView);
}


app.SetupSqlT.prototype.createFunction=function(boDropOnly){
  
  var SqlFunctionDrop=[], SqlFunction=[];
  
  eval(extractLoc(TableName,'TableName'));
  eval(extractLoc(ViewName,'ViewName'));



    // Procedures to be deleted


    //
    // Stored procedures  
    //

  SqlFunctionDrop.push(`DROP FUNCTION IF EXISTS isTemplate`);
  SqlFunction.push(`CREATE FUNCTION isTemplate(Iname varchar(128)) RETURNS TINYINT DETERMINISTIC
      BEGIN
        RETURN Iname REGEXP '^template(_talk)?:';
      END`);

  SqlFunctionDrop.push(`DROP FUNCTION IF EXISTS isTalk`);
  SqlFunction.push(`CREATE FUNCTION isTalk(Iname varchar(128)) RETURNS TINYINT DETERMINISTIC
      BEGIN
        RETURN Iname REGEXP '^(template_)?talk:';
      END`);
       


  SqlFunctionDrop.push(`DROP PROCEDURE IF EXISTS calcTalkName`);
  SqlFunction.push(`CREATE PROCEDURE calcTalkName(Iname varchar(128), OUT OtalkName varchar(128), OUT VboErrAlreadyTalk INT)
    proc_label:BEGIN
        DECLARE VboTalk, VboTemplate INT;
        DECLARE Vname varchar(128);
        SET VboErrAlreadyTalk=0, OtalkName='';
        #CALL testIfTalkOrTemplate(Iname, VboTalk, VboTemplate);
        SET VboTalk=isTalk(Iname);   SET VboTemplate=isTemplate(Iname);
        IF VboTalk THEN SET VboErrAlreadyTalk=1; LEAVE proc_label; END IF;
        IF VboTemplate THEN SET OtalkName=CONCAT('template_talk:',SUBSTR(Iname,10));  ELSE SET OtalkName=CONCAT('talk:',Iname); END IF;
      END`);
      
      
  SqlFunctionDrop.push(`DROP PROCEDURE IF EXISTS `+strDBPrefix+`renamePage`);
  SqlFunction.push(`CREATE PROCEDURE `+strDBPrefix+`renamePage(IidPage int(4), IpageNameStub varchar(128))
    proc_label:BEGIN
        SET @VidPage=IidPage, @VpageNameStub=IpageNameStub;
        SELECT COUNT(*) INTO @Vc FROM `+pageTab+` WHERE pageName=@VpageNameStub;
        IF @Vc THEN COMMIT; SELECT 'nameExist' AS err; LEAVE proc_label; END IF;
        
        SELECT idSite, pageName INTO @VidSite, @VpageNameCur FROM `+pageTab+` WHERE idPage=@VidPage;
        
        SELECT @VpageNameCur AS nameO;  -- output
        
        DROP TABLE IF EXISTS tmpParentCur;
        CREATE TEMPORARY TABLE IF NOT EXISTS tmpParentCur ( idPage int(4) NOT NULL, idFile int(4) NOT NULL) ENGINE=INNODB COLLATE utf8_general_ci;
        #TRUNCATE tmpParentCur;
        -- INSERT INTO tmpParentCur SELECT idPage FROM `+subTab+` WHERE idSite=@VidSite AND pageName=@VpageNameCur;  -- page parents
        INSERT INTO tmpParentCur SELECT s.idPage, p.idFile FROM `+subTab+` s JOIN `+pageLastSlimView+` p ON s.idPage=p.idPage WHERE s.idSite=@VidSite AND s.pageName=@VpageNameCur;  -- page parents
        -- SELECT * FROM tmpParentCur;
        
        SELECT t.idPage, t.idFile, data FROM tmpParentCur t JOIN `+fileTab+` f ON f.idFile=t.idFile WHERE 1;  -- output

        DROP TABLE IF EXISTS tmpParentAll;
        CREATE TEMPORARY TABLE IF NOT EXISTS tmpParentAll ( idPage int(4) NOT NULL ) ENGINE=INNODB COLLATE utf8_general_ci;
        #TRUNCATE tmpParentAll;
        INSERT INTO tmpParentAll
          SELECT idPage FROM `+subTab+` WHERE idSite=@VidSite AND pageName=@VpageNameStub  -- stub parents
            UNION
          SELECT idPage FROM tmpParentCur; -- page parents
        -- SELECT * FROM tmpParentAll;

        REPLACE INTO `+subTab+` SELECT idPage, @VidSite, @VpageNameStub, 1 FROM tmpParentAll;
          
        SELECT COUNT(*) INTO @VnParent FROM tmpParentAll WHERE 1;

        DELETE FROM `+subTab+` WHERE idSite=@VidSite AND pageName=@VpageNameCur;

          -- Set up nParentTab appropriately
        IF @VnParent THEN
          INSERT INTO `+nParentTab+` (idSite, pageName, nParent) VALUES (@VidSite, @VpageNameStub, @VnParent) ON DUPLICATE KEY UPDATE nParent=@VnParent;
        ELSE
          DELETE FROM `+nParentTab+` WHERE idSite=@VidSite AND pageName=@VpageNameStub;
        END IF;
        
        UPDATE `+pageTab+` SET pageName=@VpageNameStub WHERE idPage=@VidPage;
      END`);
      
  SqlFunctionDrop.push(`DROP PROCEDURE IF EXISTS `+strDBPrefix+`renameImage`);
  SqlFunction.push(`CREATE PROCEDURE `+strDBPrefix+`renameImage(IidImage int(4), IimageNameStub varchar(128))
    proc_label:BEGIN
        SET @VidImage=IidImage, @VimageNameStub=IimageNameStub;
        SELECT COUNT(*) INTO @Vc FROM `+imageTab+` WHERE imageName=@VimageNameStub;
        IF @Vc THEN COMMIT; SELECT 'nameExist' AS err; LEAVE proc_label; END IF;
        
        SELECT imageName INTO @VimageNameCur FROM `+imageTab+` WHERE idImage=@VidImage;
        
        SELECT @VimageNameCur AS nameO;  -- output
        
        DROP TABLE IF EXISTS tmpParentCur;
        CREATE TEMPORARY TABLE IF NOT EXISTS tmpParentCur ( idPage int(4) NOT NULL, idFile int(4) NOT NULL) ENGINE=INNODB COLLATE utf8_general_ci;
        #TRUNCATE tmpParentCur;
        -- INSERT INTO tmpParentCur SELECT idPage FROM `+subImageTab+` WHERE imageName=@VimageNameCur;  -- image parents
        INSERT INTO tmpParentCur SELECT s.idPage, p.idFile FROM `+subImageTab+` s JOIN `+pageLastSlimView+` p ON s.idPage=p.idPage WHERE s.imageName=@VimageNameCur;  -- image parents
        -- SELECT * FROM tmpParentCur;
        
        SELECT t.idPage, t.idFile, data FROM tmpParentCur t JOIN `+fileTab+` f ON f.idFile=t.idFile WHERE 1;  -- output

        DROP TABLE IF EXISTS tmpParentAll;
        CREATE TEMPORARY TABLE IF NOT EXISTS tmpParentAll ( idPage int(4) NOT NULL ) ENGINE=INNODB COLLATE utf8_general_ci;
        #TRUNCATE tmpParentAll;
        INSERT INTO tmpParentAll
          SELECT idPage FROM `+subImageTab+` WHERE imageName=@VimageNameStub  -- stub parents
            UNION
          SELECT idPage FROM tmpParentCur; -- image parents
        -- SELECT * FROM tmpParentAll;

        REPLACE INTO `+subImageTab+` SELECT idPage, @VimageNameStub FROM tmpParentAll;
          
        SELECT COUNT(*) INTO @VnParent FROM tmpParentAll WHERE 1;

        DELETE FROM `+subImageTab+` WHERE imageName=@VimageNameCur;

          -- Set up nParentITab appropriately
        IF @VnParent THEN
          INSERT INTO `+nParentITab+` (imageName, nParent) VALUES (@VimageNameStub, @VnParent) ON DUPLICATE KEY UPDATE nParent=@VnParent;
        ELSE
          DELETE FROM `+nParentITab+` WHERE imageName=@VimageNameStub;
        END IF;
        
        UPDATE `+imageTab+` SET imageName=@VimageNameStub WHERE idImage=@VidImage;
      END`);
      
        
  SqlFunctionDrop.push(`DROP PROCEDURE IF EXISTS `+strDBPrefix+`deletePage`);
  SqlFunction.push(`CREATE PROCEDURE `+strDBPrefix+`deletePage(Iwww varchar(128), Iname varchar(128))
      BEGIN
        DECLARE VidSite, VidPage, VboTalk, VboTemplate INT;
        START TRANSACTION;
        SELECT idSite, idPage INTO VidSite, VidPage FROM `+pageTab+` WHERE pageName=Iname;
        #CALL testIfTalkOrTemplate(Iname, VboTalk, VboTemplate);
        SET VboTemplate=isTemplate(Iname);
        CALL `+strDBPrefix+`markStaleParentsOfPage(VidSite, Iname, 0, VboTemplate);
        DROP TEMPORARY TABLE IF EXISTS tmp;
        #CREATE TEMPORARY TABLE tmp AS 
        #  SELECT idFile, idFileCache FROM `+versionTab+` WHERE idPage=VidPage;
        CREATE TEMPORARY TABLE IF NOT EXISTS tmp (idFile INT(4), idFileCache INT(4));
        INSERT INTO tmp SELECT idFile, idFileCache FROM `+versionTab+` WHERE idPage=VidPage;
        DELETE FROM `+versionTab+` WHERE idPage=VidPage;
        DELETE f FROM `+fileTab+` f JOIN tmp t ON t.idFile=f.idFile WHERE 1;
        DELETE f FROM `+fileTab+` f JOIN tmp t ON t.idFileCache=f.idFile WHERE 1;
        

              -- Delete/subtract VidPage's children's nParent-value in nParentTab
          -- Delete any rows with 1 (or less) in nParentTab
        DELETE n FROM `+nParentTab+` n JOIN `+subTab+` s ON n.pageName=s.pageName AND n.idSite=VidSite WHERE s.idPage=VidPage AND nParent<=1;
          -- Subtract 1 from nParentTab.nParent for each row in (old) subTab
        UPDATE `+nParentTab+` n JOIN `+subTab+` s ON n.pageName=s.pageName AND n.idSite=VidSite SET n.nParent=n.nParent-1 WHERE s.idPage=VidPage;

              -- Delete/subtract VidPage's images's nParent-value in nParentITab
          -- Delete any rows with 1 (or less) in nParentITab
        DELETE n FROM `+nParentITab+` n JOIN `+subImageTab+` s ON n.imageName=s.imageName WHERE s.idPage=VidPage AND nParent<=1;
          -- Subtract 1 from nParentITab.nParent for each row in (old) subImageTab
        UPDATE `+nParentITab+` n JOIN `+subImageTab+` s ON n.imageName=s.imageName SET n.nParent=n.nParent-1 WHERE s.idPage=VidPage;


        DELETE FROM `+pageTab+` WHERE idPage=VidPage;
        COMMIT;
      END`);
  SqlFunctionDrop.push(`DROP PROCEDURE IF EXISTS `+strDBPrefix+`deletePageID`);
  SqlFunction.push(`CREATE PROCEDURE `+strDBPrefix+`deletePageID(IidPage int(4))
      BEGIN
        DECLARE VidSite, VidPage, VboTalk, VboTemplate INT;
        DECLARE Vname varchar(128);
        START TRANSACTION;
        SELECT idSite, pageName INTO VidSite, Vname FROM `+pageTab+` WHERE idPage=IidPage;
        #CALL testIfTalkOrTemplate(Vname, VboTalk, VboTemplate);
        SET VboTemplate=isTemplate(Vname);
        CALL `+strDBPrefix+`markStaleParentsOfPage(VidSite, Vname, 0, VboTemplate);
        SET VidPage=IidPage;
        DROP TEMPORARY TABLE IF EXISTS tmp;
        #CREATE TEMPORARY TABLE tmp AS 
        #  SELECT idFile, idFileCache FROM `+versionTab+` WHERE idPage=VidPage;
        CREATE TEMPORARY TABLE IF NOT EXISTS tmp (idFile INT(4), idFileCache INT(4));
        INSERT INTO tmp SELECT idFile, idFileCache FROM `+versionTab+` WHERE idPage=VidPage;
        DELETE FROM `+versionTab+` WHERE idPage=VidPage;
        DELETE f FROM `+fileTab+` f JOIN tmp t ON t.idFile=f.idFile WHERE 1;
        DELETE f FROM `+fileTab+` f JOIN tmp t ON t.idFileCache=f.idFile WHERE 1;
       
              -- Delete/subtract VidPage's children's nParent-value in nParentTab
          -- Delete any rows with 1 (or less) in nParentTab
        DELETE n FROM `+nParentTab+` n JOIN `+subTab+` s ON n.pageName=s.pageName AND n.idSite=VidSite WHERE s.idPage=VidPage AND nParent<=1;
          -- Subtract 1 from nParentTab.nParent for each row in (old) subTab
        UPDATE `+nParentTab+` n JOIN `+subTab+` s ON n.pageName=s.pageName AND n.idSite=VidSite SET n.nParent=n.nParent-1 WHERE s.idPage=VidPage;

              -- Delete/subtract VidPage's images's nParent-value in nParentITab
          -- Delete any rows with 1 (or less) in nParentITab
        DELETE n FROM `+nParentITab+` n JOIN `+subImageTab+` s ON n.imageName=s.imageName WHERE s.idPage=VidPage AND nParent<=1;
          -- Subtract 1 from nParentITab.nParent for each row in (old) subImageTab
        UPDATE `+nParentITab+` n JOIN `+subImageTab+` s ON n.imageName=s.imageName SET n.nParent=n.nParent-1 WHERE s.idPage=VidPage;


        DELETE FROM `+pageTab+` WHERE idPage=VidPage;
        COMMIT;
      END`);

  SqlFunctionDrop.push(`DROP PROCEDURE IF EXISTS `+strDBPrefix+`deletePageIDMult`);
  SqlFunction.push(`CREATE PROCEDURE `+strDBPrefix+`deletePageIDMult()
      BEGIN
        CALL `+strDBPrefix+`markStaleParentsOfPageMult(0);
        
        DROP TABLE IF EXISTS tmp;
        CREATE TEMPORARY TABLE IF NOT EXISTS tmp (idFile INT(4), idFileCache INT(4));
        INSERT INTO tmp SELECT idFile, idFileCache FROM `+versionTab+` v JOIN arrPageID arr ON v.idPage=arr.idPage;
        DELETE v FROM `+versionTab+` v JOIN arrPageID arr ON v.idPage=arr.idPage WHERE 1;
        DELETE f FROM `+fileTab+` f JOIN tmp t ON t.idFile=f.idFile WHERE 1;
        DELETE f FROM `+fileTab+` f JOIN tmp t ON t.idFileCache=f.idFile WHERE 1;
       

        DELETE p FROM `+pageTab+` p JOIN arrPageID arr ON p.idPage=arr.idPage WHERE 1;
        
          -- Recalculate nParentTab
        TRUNCATE `+nParentTab+`;
        INSERT INTO `+nParentTab+` SELECT idSite, pageName, COUNT(idPage IS NOT NULL) AS nParent FROM `+subTab+` GROUP BY idSite, pageName;
        
          -- Recalculate nParentITab
        TRUNCATE `+nParentITab+`;
        INSERT INTO `+nParentITab+` SELECT imageName, COUNT(idPage IS NOT NULL) AS nParent FROM `+subImageTab+` GROUP BY imageName;
      END`);
  //SqlFunction.push("CALL "+strDBPrefix+"deletePage('www.common.com','mmm')");

  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+strDBPrefix+"deleteAllButFirst");  
  SqlFunction.push("CREATE PROCEDURE "+strDBPrefix+"deleteAllButFirst(IidPage int(4), Iname varchar(128)) \n\
      proc_label:BEGIN \n\
        DECLARE Vn, VidSite, VboTalk, VboTemplate INT; \n\
        DECLARE VtalkName VARCHAR(128); \n\
        SELECT COUNT(*) INTO Vn FROM "+versionTab+" WHERE idPage=IidPage AND rev!=0; \n\
        IF Vn=0 THEN LEAVE proc_label; END IF;                # Quick exit. \n\
        SELECT idSite INTO VidSite FROM "+pageTab+" WHERE idPage=IidPage; \n\
        DROP TEMPORARY TABLE IF EXISTS tmp; \n\
        CREATE TEMPORARY TABLE tmp AS  \n\
          SELECT idFile, idFileCache FROM "+versionTab+" WHERE idPage=IidPage AND rev!=0; \n\
        #CREATE TEMPORARY TABLE IF NOT EXISTS tmp (idFile INT(4), idFileCache INT(4)); \n\
        #INSERT INTO tmp SELECT idFile, idFileCache FROM "+versionTab+" WHERE idPage=IidPage AND rev!=0; \n\
        DELETE FROM "+versionTab+" WHERE idPage=IidPage AND rev!=0; \n\
        DELETE f FROM "+fileTab+" f JOIN tmp t ON t.idFile=f.idFile; \n\
        DELETE f FROM "+fileTab+" f JOIN tmp t ON t.idFileCache=f.idFile; \n\
   \n\
      END");

  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+strDBPrefix+"deleteImageID");
  SqlFunction.push("CREATE PROCEDURE "+strDBPrefix+"deleteImageID(IidImage int(4)) \n\
      BEGIN \n\
        DECLARE VidImage,VidFile INT; \n\
        DECLARE Vname VARCHAR(128); \n\
        START TRANSACTION; \n\
        #SELECT idImage, idFile INTO VidImage, VidFile FROM "+imageTab+" WHERE imageName=Iname; \n\
        SELECT idImage, idFile, imageName INTO VidImage, VidFile, Vname FROM "+imageTab+" WHERE idImage=IidImage; \n\
        DROP TEMPORARY TABLE IF EXISTS tmp; \n\
        CREATE TEMPORARY TABLE tmp AS  \n\
          SELECT idFile FROM "+thumbTab+" WHERE idImage=VidImage; \n\
        #CREATE TEMPORARY TABLE IF NOT EXISTS tmp (idFile INT(4)); \n\
        #INSERT INTO tmp SELECT idFile FROM "+thumbTab+" WHERE idImage=VidImage; \n\
        DELETE FROM "+thumbTab+" WHERE idImage=VidImage; \n\
        DELETE f FROM "+fileTab+" f JOIN tmp t ON t.idFile=f.idFile WHERE 1; \n\
        DELETE FROM "+imageTab+" WHERE idImage=VidImage; \n\
        DELETE FROM "+fileTab+" WHERE idFile=VidFile; \n\
        # DELETE FROM "+subImageTab+" WHERE imageName=Vname; \n\
        COMMIT; \n\
      END");
  //SqlFunction.push("CALL "+strDBPrefix+"deleteImage('mmm')");
  
  SqlFunctionDrop.push(`DROP PROCEDURE IF EXISTS `+strDBPrefix+`deleteImageIDMult`);
  SqlFunction.push(`CREATE PROCEDURE `+strDBPrefix+`deleteImageIDMult()
      BEGIN
        DROP TABLE IF EXISTS tmp;
        CREATE TEMPORARY TABLE IF NOT EXISTS tmp (idFile INT(4));
        INSERT INTO tmp SELECT idFile FROM `+thumbTab+` t JOIN arrImageID arr ON t.idImage=arr.idImage;
        DELETE t FROM `+thumbTab+` t JOIN arrImageID arr ON t.idImage=arr.idImage WHERE 1;
        DELETE f FROM `+fileTab+` f JOIN tmp ON tmp.idFile=f.idFile WHERE 1;
        
        TRUNCATE tmp; INSERT INTO tmp SELECT idFile FROM `+imageTab+` i JOIN arrImageID arr ON i.idImage=arr.idImage;
        
        DELETE i FROM `+imageTab+` i JOIN arrImageID arr ON i.idImage=arr.idImage WHERE 1;
        DELETE f FROM `+fileTab+` f JOIN tmp ON tmp.idFile=f.idFile WHERE 1;
      END`);

  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+strDBPrefix+"deleteThumb");
  SqlFunction.push("CREATE PROCEDURE "+strDBPrefix+"deleteThumb(IidImage INT(4)) \n\
      BEGIN \n\
        START TRANSACTION; \n\
        DROP TEMPORARY TABLE IF EXISTS tmp; \n\
        #CREATE TEMPORARY TABLE tmp AS  \n\
        #  SELECT idFile FROM "+thumbTab+" WHERE idImage=IidImage; \n\
        CREATE TEMPORARY TABLE IF NOT EXISTS tmp (idFile INT(4)); \n\
        INSERT INTO tmp SELECT idFile FROM "+thumbTab+" WHERE idImage=IidImage; \n\
        DELETE FROM "+thumbTab+" WHERE idImage=IidImage; \n\
        DELETE f FROM "+fileTab+" f JOIN tmp t ON f.idFile=t.idFile; \n\
        COMMIT; \n\
      END");



  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+strDBPrefix+"markStale");
  SqlFunction.push("CREATE PROCEDURE "+strDBPrefix+"markStale(IidPage int(4)) \n\
      BEGIN \n\
        DECLARE nversion, VidPage, VidFile, VidFileCache, VboTalk, VboTemplate INT; \n\
        START TRANSACTION; \n\
        #UPDATE "+pageTab+" SET tModCache=FROM_UNIXTIME(1) WHERE idPage=IidPage; \n\
        UPDATE "+versionTab+" SET tModCache=FROM_UNIXTIME(1) WHERE idPage=IidPage; \n\
        COMMIT; \n\
      END");

  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+strDBPrefix+"markStaleParentsOfPage");
  SqlFunction.push("CREATE PROCEDURE "+strDBPrefix+"markStaleParentsOfPage(IidSite int(4), Iname varchar(128), IboOn TINYINT, IboTemplate TINYINT) \n\
      BEGIN \n\
        UPDATE "+versionTab+" v JOIN "+subTab+" s ON v.idPage=s.idPage \n\
 SET v.tModCache=FROM_UNIXTIME(1) WHERE s.idSite=IidSite AND s.pageName=Iname AND (s.boOnWhenCached!=IboOn OR IboTemplate); \n\
      END");
      
  SqlFunctionDrop.push(`DROP PROCEDURE IF EXISTS `+strDBPrefix+`markStaleParentsOfPageMult`);
  SqlFunction.push(`CREATE PROCEDURE `+strDBPrefix+`markStaleParentsOfPageMult(IboOn TINYINT)
      BEGIN
        UPDATE `+versionTab+` v JOIN `+subTab+` s ON v.idPage=s.idPage JOIN `+pageTab+` p ON s.idSite=p.idSite AND s.pageName=p.pageName JOIN arrPageID arr ON p.idPage=arr.idPage
 SET v.tModCache=FROM_UNIXTIME(1) WHERE (s.boOnWhenCached!=IboOn OR isTemplate(p.pageName));
      END`);

    
  SqlFunctionDrop.push(`DROP PROCEDURE IF EXISTS `+strDBPrefix+`writeSubTables`);
  SqlFunction.push(`CREATE PROCEDURE `+strDBPrefix+`writeSubTables(IidPage INT)
    proc_label:BEGIN
        DECLARE VidSite, VboErrAlreadyTalk, VboTalkExist INT;
        DECLARE VpageName, VtalkName VARCHAR(128);
        DECLARE VnChild, VnImage INT;

          # Get VidSite
        SELECT idSite, pageName INTO VidSite, VpageName FROM `+pageTab+` WHERE idPage=IidPage;

          # If 'non-talkpage' then insert (replace) a talkpage
        CALL calcTalkName(VpageName, VtalkName, VboErrAlreadyTalk);
        IF VboErrAlreadyTalk=0 THEN
          SELECT count(idPage) INTO VboTalkExist FROM `+pageTab+` WHERE idSite=VidSite AND pageName=VtalkName;
          REPLACE INTO `+subTab+` (idPage, idSite, pageName, boOnWhenCached) VALUES (IidPage, VidSite, VtalkName, VboTalkExist);
        END IF;

           # Count VnChild and VnImage
        SELECT COUNT(*) INTO VnChild FROM tmpSubNew;
        SELECT COUNT(*) INTO VnImage FROM tmpSubNewImage;

           # Set nChild and nImage
        UPDATE `+pageTab+` SET nChild=VnChild, nImage=vnImage WHERE idPage=IidPage;

           # Make changes to nParentTab and nParentITab
        # CALL `+strDBPrefix+`makeNParentDiff(VidSite, IidPage);
        # CALL `+strDBPrefix+`makeNParentIDiff(IidPage);


              -- Add/subtract(delete) IidPage's children's nParent-value in nParentTab
          -- Subtract 1 from nParentTab.nParent for each row in (old) subTab
        UPDATE `+nParentTab+` n JOIN `+subTab+` s ON n.pageName=s.pageName AND n.idSite=VidSite SET n.nParent=n.nParent-1 WHERE s.idPage=IidPage;
          -- Insert (or add) 1 to nParentTab for each row in tmpSubTab
        INSERT INTO `+nParentTab+` SELECT VidSite, tsn.pageName, 1 FROM tmpSubNew tsn ON DUPLICATE KEY UPDATE nParent=nParent+1;
          -- Delete any rows with 0 (or less) in nParentTab
        DELETE n FROM `+nParentTab+` n WHERE nParent<=0;

              -- Add/subtract(delete) IidPage's images's nParent-value in nParentITab
          -- Subtract 1 from nParentITab.nParent for each row in (old) subImageTab
        UPDATE `+nParentITab+` n JOIN `+subImageTab+` s ON n.imageName=s.imageName SET n.nParent=n.nParent-1 WHERE s.idPage=IidPage;
          -- Insert (or add) 1 to nParentITab for each row in tmpSubTab
        INSERT INTO `+nParentITab+` SELECT tsn.imageName, 1 FROM tmpSubNewImage tsn ON DUPLICATE KEY UPDATE nParent=nParent+1;
          -- Delete any rows with 0 (or less) in nParentITab
        DELETE n FROM `+nParentITab+` n WHERE nParent<=0;


          # Replace subpages
        DELETE FROM `+subTab+` WHERE idPage=IidPage;
        INSERT INTO `+subTab+` (idPage, idSite, pageName, boOnWhenCached) SELECT IidPage, VidSite, t.pageName, boOn FROM tmpSubNew t;

          # Replace images
        DELETE FROM `+subImageTab+` WHERE idPage=IidPage;
        INSERT INTO `+subImageTab+` (idPage, `+subImageTab+`.imageName) SELECT IidPage, t.imageName FROM tmpSubNewImage t;

      END`);


  //
  // Getting info
  //

  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+strDBPrefix+"getInfo");
  //SqlFunction.push("CREATE PROCEDURE "+strDBPrefix+"getInfo(Iwww varchar(128), Iname varchar(128)) \n\
    //BEGIN \n\
      //SELECT boTLS, boOR, boOW, boSiteMap, UNIX_TIMESTAMP(tMod) AS tMod, UNIX_TIMESTAMP(tModCache) AS tModCache FROM "+pageLastView+" WHERE www=Iwww AND pageName=Iname; \n\
    //END");

//SELECT boOR, boOW, boSiteMap, UNIX_TIMESTAMP(tMod) AS tMod, UNIX_TIMESTAMP(tModCache) AS tModCache FROM "+pageTab+" p JOIN "+versionTab+" v WHERE p.idPage=v.idPage AND p.lastRev=v.rev AND pageName=Iname; \n\

    
  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+strDBPrefix+"getInfoNData");
  SqlFunction.push("CREATE PROCEDURE "+strDBPrefix+"getInfoNData(IboTLS INT(1), Iwww varchar(128), Iname varchar(128), Irev INT, IeTag varchar(32), IreqDate INT) \n\
    proc_label:BEGIN \n\
      DECLARE VidSite, VidPage, Vc, VboTalk, VboTemplate, VboTalkExist, VidFile, VidFileCache, VboValidServerCache, VboValidReqCache INT; \n\
      DECLARE VtMod, VtModCache INT UNSIGNED; \n\
      DECLARE Vwww, Vname, talkPage varchar(128); \n\
      DECLARE VeTag varchar(32); \n\
      DECLARE strEditText, strHtmlText MEDIUMBLOB; \n\
      DECLARE VboTLS, VboRedirectCase, VboOR INT(1); \n\
\n\
          # Get site \n\
      SELECT SQL_CALC_FOUND_ROWS boDefault, @boTLS:=boTLS AS boTLS, @VidSite:=idSite AS idSite, siteName, www, googleAnalyticsTrackingID, urlIcon16, urlIcon200, aPassword, vPassword, UNIX_TIMESTAMP(tCreated) AS tCreated FROM "+siteTab+" WHERE www=Iwww;#  <-- result #0 \n\
      IF FOUND_ROWS()!=1 THEN LEAVE proc_label; END IF; \n\
      SET VboTLS=@boTLS, VidSite=@VidSite; \n\
\n\
          # Check if there is a redirect for this page \n\
      SELECT SQL_CALC_FOUND_ROWS @tmp:=url AS urlRedir FROM "+redirectTab+" WHERE idSite=VidSite AND pageName=Iname;     #  <-- result #1 \n\
      IF FOUND_ROWS() THEN \n\
        UPDATE "+redirectTab+" SET nAccess=nAccess+1, tLastAccess=now() WHERE idSite=VidSite AND pageName=Iname; \n\
        LEAVE proc_label; \n\
      END IF; \n\
\n\
          # Check if there is a redirect for this domain \n\
      SELECT SQL_CALC_FOUND_ROWS @tmp:=url AS urlRedirDomain FROM "+redirectDomainTab+" WHERE www=Iwww;     #  <-- result #2 \n\
      IF FOUND_ROWS() THEN LEAVE proc_label; END IF; \n\
\n\
          # Get wwwCommon \n\
      SELECT SQL_CALC_FOUND_ROWS boTLS, siteName, www  FROM "+siteTab+" WHERE boDefault=1; #  <-- result #3 \n\
\n\
          # Check if page exist \n\
      SELECT SQL_CALC_FOUND_ROWS @Vname:=pageName AS pageName, @VidPage:=idPage AS idPage, @VboOR:=boOR AS boOR, boOW, boSiteMap FROM "+pageTab+" WHERE idSite=VidSite AND pageName=Iname;  #  <-- result #4 \n\
      IF FOUND_ROWS()=0 THEN LEAVE proc_label; END IF;   # noSuchPage \n\
      SET Vname=@Vname, VidPage=@VidPage, VboOR=@VboOR; \n\
\n\
\n\       # Redirect to correct case OR correct boTLS\n\
      SET VboRedirectCase = BINARY Vname!=Iname OR VboTLS!=IboTLS; \n\
      SELECT VboRedirectCase AS boRedirectCase, VboTLS AS boTLS, Vwww AS www, Vname AS pageRedir;  #  <-- result #5 \n\
      IF VboRedirectCase THEN LEAVE proc_label; END IF;   \n\
\n\
      IF !VboOR THEN LEAVE proc_label; END IF;   # Private\n\
\n\
          # Calc VboTalkExist \n\
      SET VboTalk=isTalk(Iname), VboTemplate=isTemplate(Iname); \n\
      IF VboTalk=0 THEN \n\
        IF VboTemplate THEN SET talkPage=CONCAT('template_talk:',Iname); ELSE SET talkPage=CONCAT('talk:',Iname); END IF;\n\
        SELECT count(idPage) INTO VboTalkExist FROM "+pageTab+" WHERE idSite=VidSite AND pageName=talkPage; \n\
      END IF;\n\
      SELECT VboTalkExist AS boTalkExist;  #  <-- result #6 \n\
\n\
          # Get version table \n\
      DROP TEMPORARY TABLE IF EXISTS tmpVersionTable; \n\
      CREATE TEMPORARY TABLE tmpVersionTable AS  \n\
        SELECT SQL_CALC_FOUND_ROWS rev, summary, signature, idFile, idFileCache, UNIX_TIMESTAMP(tMod) AS tMod, UNIX_TIMESTAMP(tModCache) AS tModCache, eTag FROM "+versionTab+" WHERE idPage=VidPage; \n\
      SELECT * FROM tmpVersionTable;                                                 #  <-- result #7 \n\
      SELECT FOUND_ROWS() INTO Vc; \n\
      IF Vc<1 THEN LEAVE proc_label; END IF;   # no versions !? \n\
\n\
      IF Irev>=Vc THEN LEAVE proc_label; END IF;             # noSuchRev \n\
\n\
      IF Irev=-1 THEN SET Irev=Vc-1; END IF;                          # Use last rev \n\
\n\
          # The requested revision Irev \n\
          # Note VtMod and VtModCache are already in unix-time\n\
      SELECT eTag, idFile, idFileCache, tMod, tModCache INTO VeTag, VidFile, VidFileCache, VtMod, VtModCache FROM tmpVersionTable WHERE rev=Irev;   \n\
\n\
      SET VboValidServerCache=VtMod<=VtModCache AND LENGTH(VeTag);                                             # Calc VboValidServerCache \n\
      SELECT VboValidServerCache AS boValidServerCache;  # <-- result #8 \n\
\n\
          # Calc VboValidReqCache \n\
      SET VboValidReqCache= VboValidServerCache AND BINARY VeTag=IeTag AND VtModCache<=IreqDate;  \n\
      SELECT VboValidReqCache AS boValidReqCache;   # <-- result #9 \n\
      IF VboValidReqCache THEN LEAVE proc_label; END IF;                          # 304 \n\
\n\
      SELECT data AS strEditText FROM "+fileTab+" WHERE idFile=VidFile;                            # <-- result #10 \n\
\n\
      IF VboValidServerCache THEN \n\
        SELECT data AS strHtmlText FROM "+fileTab+" WHERE idFile=VidFileCache;                                               # <-- result #11\n\
        SELECT pageName, boOnWhenCached FROM "+subTab+" WHERE idPage=VidPage AND pageName REGEXP '^template:';       #  <-- result #12 \n\
      END IF; \n\
\n\
    END");



  
  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+strDBPrefix+"getInfoNDataTest");
  
  

  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+strDBPrefix+"getInfoNDataBE");
  SqlFunction.push("CREATE PROCEDURE "+strDBPrefix+"getInfoNDataBE(Iwww varchar(128), Iname varchar(128), Irev INT, IeTag varchar(32), IreqDate INT) \n\
    proc_label:BEGIN \n\
      DECLARE VidSite, VidPage, Vc, VboTalk, VboTemplate, boTalkExist, VidFile, VidFileCache, VboValidServerCache, VboValidReqCache INT; \n\
      DECLARE VtMod, VtModCache INT UNSIGNED; \n\
      DECLARE talkPage varchar(128); \n\
      DECLARE VeTag varchar(32); \n\
      DECLARE strEditText, strHtmlText MEDIUMBLOB; \n\
\n\
          # Get VidSite \n\
      SELECT SQL_CALC_FOUND_ROWS idSite INTO VidSite FROM "+siteTab+" WHERE www=Iwww; \n\
\n\
          # Check if page exist \n\
      SELECT SQL_CALC_FOUND_ROWS pageName, @tmp:=idPage AS idPage, boOR, boOW, boSiteMap FROM "+pageTab+" WHERE idSite=VidSite AND pageName=Iname;  #  <-- result #0 \n\
      IF FOUND_ROWS()=0 THEN LEAVE proc_label; END IF;   # noSuchPage \n\
      SET VidPage=@tmp; \n\
\n\
          # Calc boTalkExist \n\
      SET VboTalk=isTalk(Iname), VboTemplate=isTemplate(Iname); \n\
      IF VboTalk=0 THEN \n\
        IF VboTemplate THEN SET talkPage=CONCAT('template_talk:',Iname); ELSE SET talkPage=CONCAT('talk:',Iname); END IF;\n\
        SELECT count(idPage) INTO boTalkExist FROM "+pageTab+" WHERE idSite=VidSite AND pageName=talkPage; \n\
      END IF;\n\
      SELECT boTalkExist;  #  <-- result #1 \n\
\n\
          # Get version table \n\
      DROP TEMPORARY TABLE IF EXISTS tmpVersionTable; \n\
      CREATE TEMPORARY TABLE tmpVersionTable AS  \n\
        SELECT SQL_CALC_FOUND_ROWS rev, summary, signature, idFile, idFileCache, UNIX_TIMESTAMP(tMod) AS tMod, UNIX_TIMESTAMP(tModCache) AS tModCache, eTag FROM "+versionTab+" WHERE idPage=VidPage; \n\
      SELECT * FROM tmpVersionTable;                                                 #  <-- result #2 \n\
      SELECT FOUND_ROWS() INTO Vc; \n\
      IF Vc<1 THEN LEAVE proc_label; END IF;   # no versions !? \n\
\n\
      IF Irev>=Vc THEN LEAVE proc_label; END IF;             # noSuchRev \n\
\n\
      IF Irev=-1 THEN SET Irev=Vc-1; END IF;                          # Use last rev \n\
\n\
          # The requested revision Irev \n\
          # Note VtMod and VtModCache are already in unix-time\n\
      SELECT eTag, idFile, idFileCache, tMod, tModCache INTO VeTag, VidFile, VidFileCache, VtMod, VtModCache FROM tmpVersionTable WHERE rev=Irev;   \n\
\n\
      SET VboValidServerCache=VtMod<=VtModCache AND LENGTH(VeTag);                                             # Calc VboValidServerCache \n\
      SELECT VboValidServerCache AS boValidServerCache;  # <-- result #3 \n\
\n\
          # Calc VboValidReqCache \n\
      SET VboValidReqCache= VboValidServerCache AND BINARY VeTag=IeTag AND VtModCache<=IreqDate; \n\
      SELECT VboValidReqCache AS boValidReqCache;   # <-- result #4 \n\
      IF VboValidReqCache THEN LEAVE proc_label; END IF;                          # 304 \n\
\n\
      SELECT data AS strEditText FROM "+fileTab+" WHERE idFile=VidFile;                            # <-- result #5 \n\
\n\
      IF VboValidServerCache THEN \n\
        SELECT data AS strHtmlText FROM "+fileTab+" WHERE idFile=VidFileCache;                                               # <-- result #6\n\
        SELECT pageName, boOnWhenCached FROM "+subTab+" WHERE idPage=VidPage AND pageName REGEXP '^template:';       #  <-- result #7 \n\
      END IF; \n\
\n\
    END");


  //
  // Saveing, updating cache
  //

  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+strDBPrefix+"saveByReplace");
  SqlFunction.push("CREATE PROCEDURE "+strDBPrefix+"saveByReplace(IsiteName varchar(128), Iwww varchar(128), Iname varchar(128), Idata MEDIUMBLOB, Ihtml MEDIUMBLOB, IeTag varchar(32), OUT Omess varchar(128), OUT OidPage INT) \n\
      proc_label:BEGIN \n\
        DECLARE Vc, VidSite, VidFile, VidFileCache, VboTalk, VboTemplate, Vlen INT; \n\
\n\
          # Get VidSite \n\
        IF(LENGTH(Iwww)) THEN \n\
          SELECT SQL_CALC_FOUND_ROWS idSite INTO VidSite FROM "+siteTab+" WHERE www=Iwww; \n\
          IF FOUND_ROWS()=0 THEN SET Omess='IwwwNotFound'; LEAVE proc_label; END IF; \n\
        ELSEIF(LENGTH(IsiteName)) THEN \n\
          SELECT SQL_CALC_FOUND_ROWS idSite, www INTO VidSite, Iwww FROM "+siteTab+" WHERE siteName=IsiteName; \n\
          IF FOUND_ROWS()=0 THEN SET Omess='IsiteNameNotFound'; LEAVE proc_label; END IF; \n\
        ELSE \n\
          SELECT SQL_CALC_FOUND_ROWS idSite, www INTO VidSite, Iwww FROM "+siteTab+" WHERE boDefault=1; \n\
          IF FOUND_ROWS()=0 THEN SET Omess='noDefault'; LEAVE proc_label; END IF; \n\
        END IF; \n\
\n\
        #CALL testIfTalkOrTemplate(Iname, VboTalk, VboTemplate); \n\
        SET VboTalk=isTalk(Iname);   SET VboTemplate=isTemplate(Iname); \n\
        SET VidFile=NULL, VidFileCache=NULL; \n\
\n\
        INSERT INTO "+pageTab+" (idSite, pageName, boTalk, boTemplate) VALUES (VidSite, Iname, VboTalk, VboTemplate)  \n\
          ON DUPLICATE KEY UPDATE idPage=LAST_INSERT_ID(idPage), pageName=Iname, boTalk=VboTalk, boTemplate=VboTemplate, lastRev=0; \n\
        SELECT LAST_INSERT_ID() INTO OidPage; \n\
        CALL "+strDBPrefix+"markStaleParentsOfPage(VidSite, Iname, 1, VboTemplate); \n\
\n\
        IF LENGTH(Idata)=0 THEN    CALL "+strDBPrefix+"deletePageID(OidPage); SET Omess='deleting'; LEAVE proc_label;        END IF;    # Delete all \n\
  \n\
          # Delete old versions \n\
        CALL "+strDBPrefix+"deleteAllButFirst(OidPage, Iname); \n\
        SELECT count(*), idFile, idFileCache INTO Vc, VidFile, VidFileCache FROM "+versionTab+" WHERE idPage=OidPage AND rev=0; \n\
  \n\
        IF VidFile IS NULL THEN \n\
          INSERT INTO "+fileTab+" (data) VALUES (Idata);    SELECT LAST_INSERT_ID() INTO VidFile; \n\
        ELSE \n\
          UPDATE "+fileTab+" SET data=Idata WHERE idFile=VidFile; \n\
        END IF; \n\
        IF VidFileCache IS NULL THEN \n\
          INSERT INTO "+fileTab+" (data) VALUES (Ihtml);    SELECT LAST_INSERT_ID() INTO VidFileCache; \n\
        ELSE \n\
          UPDATE "+fileTab+" SET data=Ihtml WHERE idFile=VidFileCache; \n\
        END IF; \n\
  \n\
        SET Vlen=LENGTH(Idata); \n\
        IF Vc=0 THEN \n\
          INSERT INTO "+versionTab+" (idPage,rev,idFile,tMod,idFileCache,tModCache,eTag,size) VALUES (OidPage,0,VidFile,now(),VidFileCache,now(),IeTag,Vlen); \n\
        ELSE \n\
          UPDATE "+versionTab+" SET idFile=VidFile, boOther=0, tMod=now(), idFileCache=VidFileCache, tModCache=now(), eTag=IeTag, size=Vlen WHERE idPage=OidPage AND rev=0; \n\
        END IF; \n\
  \n\
        CALL "+strDBPrefix+"writeSubTables(OidPage); \n\
        SET Omess='done'; \n\
        SELECT UNIX_TIMESTAMP(now()) AS tMod, UNIX_TIMESTAMP(now()) AS tModCache; \n\
      END");


  if(0){
    SqlFunction.push(sqlTmpSubNewCreate);
    SqlFunction.push(sqlTmpSubNewImageCreate);

    var tmpUrl="localhost:"+port;
    SqlFunction.push("START TRANSACTION");
    SqlFunction.push("TRUNCATE tmpSubNew"); SqlFunction.push("INSERT INTO tmpSubNew VALUES ('mm',0),('nn',0),('oo',0)");
    SqlFunction.push("CALL "+strDBPrefix+"saveByReplace('','"+tmpUrl+"','tmp','abc','ABC','0123456789abcdef0123456789abcdef')",'');
    SqlFunction.push("COMMIT");

    SqlFunction.push("START TRANSACTION");
    SqlFunction.push("TRUNCATE tmpSubNew"); SqlFunction.push("INSERT INTO tmpSubNew VALUES ('mm',0),('nn',0),('oo',0)");
    SqlFunction.push("CALL "+strDBPrefix+"saveByReplace('','"+tmpUrl+"','mmm','abc','ABC','0123456789abcdef0123456789abcdef')",'');
    SqlFunction.push("COMMIT");

    SqlFunction.push("START TRANSACTION");
    SqlFunction.push("TRUNCATE tmpSubNew"); SqlFunction.push("INSERT INTO tmpSubNew VALUES ('pp',0),('mmm',1),('oo',0)");
    SqlFunction.push("CALL "+strDBPrefix+"saveByReplace('','"+tmpUrl+"','template:nnn','abd','ABD','0123456789abcdef0123456789abcdef')",'');
    SqlFunction.push("COMMIT");

    SqlFunction.push("START TRANSACTION");
    SqlFunction.push("TRUNCATE tmpSubNew"); SqlFunction.push("INSERT INTO tmpSubNew VALUES ('pp',0),('qq',0),('oo',0)");
    SqlFunction.push("CALL "+strDBPrefix+"saveByReplace('','"+tmpUrl+"','mmm','abcd','ABCD','0123456789abcdef0123456789abcdef')",'');
    SqlFunction.push("COMMIT");
  }


  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+strDBPrefix+"saveByAdd");
  SqlFunction.push("CREATE PROCEDURE "+strDBPrefix+"saveByAdd(Iwww varchar(128), Iname varchar(128), Isummary varchar(128), Isignature varchar(128), Idata MEDIUMBLOB, Ihtml MEDIUMBLOB, IeTag varchar(32)) \n\
      proc_label:BEGIN \n\
        DECLARE nversion, VidSite, VidPage, VidFile, VidFileCache, VboTalk, VboTemplate INT; \n\
\n\
          # Get VidSite \n\
        SELECT SQL_CALC_FOUND_ROWS idSite INTO VidSite FROM "+siteTab+" WHERE www=Iwww; \n\
        IF FOUND_ROWS()=0 THEN SELECT 'IwwwNotFound' AS mess; LEAVE proc_label; END IF; \n\
\n\
        #CALL testIfTalkOrTemplate(Iname, VboTalk, VboTemplate); \n\
        SET VboTalk=isTalk(Iname);   SET VboTemplate=isTemplate(Iname); \n\
        INSERT INTO "+pageTab+" (idSite, pageName, boTalk, boTemplate, lastRev, boOR, boOW, boSiteMap) VALUES (VidSite, Iname, VboTalk, VboTemplate, 0, 1,1,1) \n\
          ON DUPLICATE KEY UPDATE idPage=LAST_INSERT_ID(idPage), pageName=Iname, boTalk=VboTalk, boTemplate=VboTemplate, lastRev=lastRev+1; \n\
        SELECT LAST_INSERT_ID() INTO VidPage; \n\
        CALL "+strDBPrefix+"markStaleParentsOfPage(VidSite, Iname, 1, VboTemplate); \n\
  \n\
        SELECT count(*) INTO nversion FROM "+versionTab+" WHERE idPage=VidPage; \n\
         \n\
          #Write to fileTab \n\
        INSERT INTO "+fileTab+" (data) VALUES (Idata);  \n\
        SELECT LAST_INSERT_ID() INTO VidFile; \n\
        INSERT INTO "+fileTab+" (data) VALUES (Ihtml);  \n\
        SELECT LAST_INSERT_ID() INTO VidFileCache;     \n\
       \n\
        INSERT INTO "+versionTab+" (idPage,rev,summary,signature,boOther,idFile,tMod,idFileCache,tModCache,eTag,size)  \n\
  VALUES (VidPage,nversion,Isummary,Isignature,1,VidFile,now(),VidFileCache,now(),IeTag,LENGTH(Idata)); \n\
          \n\
        CALL "+strDBPrefix+"writeSubTables(VidPage); \n\
        SELECT 'done' AS mess, UNIX_TIMESTAMP(now()) AS tMod, UNIX_TIMESTAMP(now()) AS tModCache; LEAVE proc_label;\n\
      END");

  if(0){
    SqlFunction.push("START TRANSACTION");
    var tmpUrl="localhost:"+port;
    SqlFunction.push("TRUNCATE tmpSubNew"); SqlFunction.push("INSERT INTO tmpSubNew VALUES ('rr',0),('ss',1),('tt',0)");
    SqlFunction.push("CALL "+strDBPrefix+"saveByAdd('"+tmpUrl+"','mmm','myEdit','Nisse','abe12','ABE12','0123456789abcdef0123456789abcdef')",'');
    SqlFunction.push("COMMIT");
  }
  //SqlFunction.push("CALL "+strDBPrefix+"deletePage('mmm')");



  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+strDBPrefix+"setNewCache");
  SqlFunction.push("CREATE PROCEDURE "+strDBPrefix+"setNewCache(Iwww varchar(128), Iname varchar(128), Irev INT, Ihtml MEDIUMBLOB, IeTag varchar(32)) \n\
      proc_label:BEGIN \n\
        DECLARE VidSite, VidPage, VidFileCache INT; \n\
        DECLARE VboTalk, VboTemplate INT; \n\
\n\
          # Get VidSite \n\
        SELECT SQL_CALC_FOUND_ROWS idSite INTO VidSite FROM "+siteTab+" WHERE www=Iwww; \n\
\n\
        SET VboTalk=isTalk(Iname);   SET VboTemplate=isTemplate(Iname); \n\
        CALL "+strDBPrefix+"markStaleParentsOfPage(VidSite, Iname, 1, VboTemplate); \n\
\n\
        SELECT idPage INTO VidPage FROM "+pageTab+" WHERE idSite=VidSite AND pageName=Iname; \n\
        SELECT idFileCache INTO VidFileCache FROM "+versionTab+" WHERE idPage=VidPage AND rev=Irev;     \n\
        UPDATE "+fileTab+" SET data=Ihtml WHERE idFile=VidFileCache;    \n\
        UPDATE "+versionTab+" SET tModCache=now(), eTag=IeTag WHERE idPage=VidPage AND rev=Irev;  \n\
\n\
\n\
        CALL "+strDBPrefix+"writeSubTables(VidPage); \n\
        SELECT 'done' AS mess, UNIX_TIMESTAMP(now()) AS tModCache; \n\
      END");


  if(0){
    SqlFunction.push("START TRANSACTION");
    var tmpUrl="localhost:"+port;
    SqlFunction.push("TRUNCATE tmpSubNew"); SqlFunction.push("INSERT INTO tmpSubNew VALUES ('rrr',0),('sss',1),('ttt',0)");
    SqlFunction.push("CALL "+strDBPrefix+"setNewCache('"+tmpUrl+"','mmm',1,'XX','0123456789abcdef0123456789abcdef')",'');
    SqlFunction.push("COMMIT");
  }


  
  //SqlFunction.push("SET @boFront=1, @Iwww='localhost:5000', @Iname='mmm', @Irev=-1, @eTag='', @reqDate=0"); //dumpMat(sqlToMatWHead(sth));
  //SqlFunction.push("CALL "+strDBPrefix+"getInfoNData(@boFront, @Iwww, @Iname, @Irev, @eTag, @reqDate)", '', '', '', '', '');


//var SqlT=[].concat(SqlFunction);



  SqlFunction.push("REPLACE INTO "+settingTab+" VALUES  \n\
  ('lastOthersEdit',''),  \n\
  ('nNewPages','0'), \n\
  ('lastOthersUpload',''), \n\
  ('nNewImages','0')"); 




  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+strDBPrefix+"storeImage");
  SqlFunction.push("CREATE PROCEDURE "+strDBPrefix+"storeImage(Iname varchar(128), IboOther TINYINT, Idata MEDIUMBLOB, IeTag varchar(32), OUT OboOk INT) \n\
      proc_label:BEGIN \n\
        DECLARE VidImage, VidFile, Vc, Vlen INT; \n\
  \n\
        #START TRANSACTION; \n\
        SELECT idImage, idFile, count(*) INTO VidImage,VidFile,Vc FROM "+imageTab+" WHERE imageName=Iname; \n\
        SET OboOk=1, Vlen=LENGTH(Idata); \n\
        IF Vc=0 THEN \n\
          INSERT INTO "+fileTab+" (data) VALUES (Idata);  \n\
          SELECT LAST_INSERT_ID() INTO VidFile; \n\
          INSERT INTO "+imageTab+" (imageName,idFile,boOther,tCreated,eTag,size) VALUES (Iname,VidFile,IboOther,now(),IeTag,Vlen); \n\
        ELSEIF Vc=1 THEN \n\
          IF IboOther THEN SET OboOk=0; LEAVE proc_label; END IF; \n\
          UPDATE "+imageTab+" SET imageName=Iname,boOther=IboOther,tCreated=now(),eTag=IeTag,size=Vlen WHERE idImage=VidImage; \n\
          UPDATE "+fileTab+" SET data=Idata WHERE idFile=VidFile; \n\
          #DELETE FROM "+thumbTab+" WHERE idImage=VidImage; \n\
          CALL "+strDBPrefix+"deleteThumb(VidImage); \n\
        END IF; \n\
        #COMMIT; \n\
      END");

  // , OUT OtCreated INT
  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+strDBPrefix+"storeThumb");
  SqlFunction.push("CREATE PROCEDURE "+strDBPrefix+"storeThumb(IidImage INT, Iwidth INT, Iheight INT, Idata MEDIUMBLOB, IeTag varchar(32)) \n\
      BEGIN \n\
        DECLARE VidFile, Vc INT; \n\
        #START TRANSACTION; \n\
        SELECT idFile, count(*) INTO VidFile,Vc FROM "+thumbTab+" WHERE idImage=IidImage AND width=Iwidth AND height=Iheight; \n\
        IF Vc=0 THEN \n\
          INSERT INTO "+fileTab+" (data) VALUES (Idata); \n\
          SELECT LAST_INSERT_ID() INTO VidFile; \n\
          INSERT INTO "+thumbTab+" (idImage,width,height,idFile,tCreated,eTag) VALUES (IidImage,Iwidth,Iheight,VidFile,now(),IeTag); \n\
        ELSEIF Vc=1 THEN \n\
          UPDATE "+thumbTab+" SET tCreated=now(),eTag=IeTag WHERE idImage=IidImage AND width=Iwidth AND height=Iheight; \n\
          UPDATE "+fileTab+" SET data=Idata WHERE idFile=VidFile; \n\
        END IF; \n\
        #SET OtCreated=UNIX_TIMESTAMP(now()); \n\
        SELECT UNIX_TIMESTAMP(now()) AS tCreated; \n\
        #COMMIT; \n\
      END");
  //SqlFunction.push("CALL "+strDBPrefix+"storeImage('abc.jpg',1,'01234','0123456789abcdef0123456789abcdef',@boOK)"); 
  //SqlFunction.push("SELECT @boOK"); tmp=sth.fetch(PDO.FETCH_NUM); var_dump(tmp);
  //SqlFunction.push("CALL "+strDBPrefix+"storeThumb(1,400,300,'01234','0123456789abcdef0123456789abcdef',@tCreated)"); 
  //SqlFunction.push("CALL "+strDBPrefix+"storeThumb(1,401,301,'012345','0123456789abcdef0123456789abcdef',@tCreated)"); 



  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+strDBPrefix+"storeVideo");
  SqlFunction.push("CREATE PROCEDURE "+strDBPrefix+"storeVideo(Iname varchar(128), Idata MEDIUMBLOB, IeTag varchar(32)) \n\
      proc_label:BEGIN \n\
        DECLARE VidVideo, VidFile, Vc, Vlen INT; \n\
        #START TRANSACTION; \n\
        SELECT idVideo, idFile, count(*) INTO VidVideo,VidFile,Vc FROM "+videoTab+" WHERE name=Iname; \n\
        SET Vlen=LENGTH(Idata); \n\
        IF Vc=0 THEN \n\
          INSERT INTO "+fileTab+" (data) VALUES (Idata);  \n\
          SELECT LAST_INSERT_ID() INTO VidFile; \n\
          INSERT INTO "+videoTab+" (name,idFile,tCreated,eTag,size) VALUES (Iname,VidFile,now(),IeTag,Vlen); \n\
        ELSEIF Vc=1 THEN \n\
          UPDATE "+videoTab+" SET name=Iname,tCreated=now(),eTag=IeTag,size=Vlen WHERE idVideo=VidVideo; \n\
          UPDATE "+fileTab+" SET data=Idata WHERE idFile=VidFile; \n\
        END IF; \n\
        #COMMIT; \n\
      END");
  //SqlFunction.push("CALL "+strDBPrefix+"storeVideo('abc.mp4','012345','0123456789abcdef0123456789abcdef')");


  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+strDBPrefix+"redirectSet");
  SqlFunction.push("CREATE PROCEDURE "+strDBPrefix+"redirectSet(Iname varchar(128), Idata MEDIUMBLOB, IeTag varchar(32)) \n\
      proc_label:BEGIN \n\
        DECLARE VidVideo, VidFile, Vc, Vlen INT; \n\
        START TRANSACTION; \n\
        SELECT idVideo, idFile, count(*) INTO VidVideo,VidFile,Vc FROM "+videoTab+" WHERE name=Iname; \n\
        SET Vlen=LENGTH(Idata); \n\
        IF Vc=0 THEN \n\
          INSERT INTO "+fileTab+" (data) VALUES (Idata);  \n\
          SELECT LAST_INSERT_ID() INTO VidFile; \n\
          INSERT INTO "+videoTab+" (name,idFile,tCreated,eTag,size) VALUES (Iname,VidFile,now(),IeTag,Vlen); \n\
        ELSEIF Vc=1 THEN \n\
          UPDATE "+videoTab+" SET name=Iname,tCreated=now(),eTag=IeTag,size=Vlen WHERE idVideo=VidVideo; \n\
          UPDATE "+fileTab+" SET data=Idata WHERE idFile=VidFile; \n\
        END IF; \n\
        COMMIT; \n\
      END");


  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+strDBPrefix+"dupMake");
  SqlFunction.push("CREATE PROCEDURE "+strDBPrefix+"dupMake() \n\
      BEGIN \n\
        CALL copyTable('"+siteTab+"_dup','"+siteTab+"'); \n\
        CALL copyTable('"+fileTab+"_dup','"+fileTab+"'); \n\
        CALL copyTable('"+pageTab+"_dup','"+pageTab+"'); \n\
        CALL copyTable('"+versionTab+"_dup','"+versionTab+"'); \n\
        CALL copyTable('"+imageTab+"_dup','"+imageTab+"'); \n\
        CALL copyTable('"+thumbTab+"_dup','"+thumbTab+"'); \n\
        CALL copyTable('"+subTab+"_dup','"+subTab+"'); \n\
        CALL copyTable('"+subImageTab+"_dup','"+subImageTab+"'); \n\
      END");

  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+strDBPrefix+"dupRename");
/*  SqlFunction.push("CREATE PROCEDURE "+strDBPrefix+"dupRename() \n\
      BEGIN \n\
RENAME TABLE "+siteTab+" TO "+siteTab+"_dup,\n\
             "+fileTab+" TO "+fileTab+"_dup,\n\
             "+pageTab+" TO "+pageTab+"_dup,\n\
             "+versionTab+" TO "+versionTab+"_dup,\n\
             "+imageTab+" TO "+imageTab+"_dup,\n\
             "+thumbTab+" TO "+thumbTab+"_dup,\n\
             "+subTab+" TO "+subTab+"_dup,\n\
             "+subImageTab+" TO "+subImageTab+"_dup;\n\
      END");*/


  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+strDBPrefix+"dupTrunkOrgNCopyBack");
  SqlFunction.push("CREATE PROCEDURE "+strDBPrefix+"dupTrunkOrgNCopyBack() \n\
      BEGIN \n\
        DELETE FROM "+subImageTab+" WHERE 1; \n\
        DELETE FROM "+subTab+" WHERE 1; \n\
        DELETE FROM "+thumbTab+" WHERE 1; \n\
        DELETE FROM "+imageTab+" WHERE 1; \n\
        DELETE FROM "+versionTab+" WHERE 1; \n\
        DELETE FROM "+pageTab+" WHERE 1; \n\
        DELETE FROM "+fileTab+" WHERE 1; \n\
        DELETE FROM "+siteTab+" WHERE 1; \n\
        INSERT INTO "+siteTab+" SELECT * FROM "+siteTab+"_dup; \n\
        INSERT INTO "+fileTab+" SELECT * FROM "+fileTab+"_dup; \n\
        INSERT INTO "+pageTab+" SELECT * FROM "+pageTab+"_dup; \n\
        INSERT INTO "+versionTab+" SELECT * FROM "+versionTab+"_dup; \n\
        INSERT INTO "+imageTab+" SELECT * FROM "+imageTab+"_dup; \n\
        INSERT INTO "+thumbTab+" SELECT * FROM "+thumbTab+"_dup; \n\
        INSERT INTO "+subTab+" SELECT * FROM "+subTab+"_dup; \n\
        INSERT INTO "+subImageTab+" SELECT * FROM "+subImageTab+"_dup; \n\
      END");

  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS "+strDBPrefix+"dupDrop");
  SqlFunction.push("CREATE PROCEDURE "+strDBPrefix+"dupDrop() \n\
      BEGIN \n\
        DROP TABLE IF EXISTS "+subImageTab+"_dup; \n\
        DROP TABLE IF EXISTS "+subTab+"_dup; \n\
        DROP TABLE IF EXISTS "+thumbTab+"_dup; \n\
        DROP TABLE IF EXISTS "+imageTab+"_dup; \n\
        DROP TABLE IF EXISTS "+versionTab+"_dup; \n\
        DROP TABLE IF EXISTS "+pageTab+"_dup; \n\
        DROP TABLE IF EXISTS "+fileTab+"_dup; \n\
        DROP TABLE IF EXISTS "+siteTab+"_dup; \n\
      END");

  
  var SqlA=this.funcGen(boDropOnly);
  if(boDropOnly) var SqlB=SqlFunctionDrop;
  else var SqlB=array_merge(SqlFunctionDrop, SqlFunction);
  return array_merge(SqlA, SqlB)
}

app.SetupSqlT.prototype.funcGen=function(boDropOnly){
  var SqlFunction=[], SqlFunctionDrop=[];
  SqlFunctionDrop.push("DROP PROCEDURE IF EXISTS copyTable");
  SqlFunction.push("CREATE PROCEDURE copyTable(INameN varchar(128),IName varchar(128)) \n\
    BEGIN \n\
      SET @q=CONCAT('DROP TABLE IF EXISTS ', INameN,';');     PREPARE stmt1 FROM @q;  EXECUTE stmt1;  DEALLOCATE PREPARE stmt1; \n\
      SET @q=CONCAT('CREATE TABLE ',INameN,' LIKE ',IName,';');   PREPARE stmt1 FROM @q;  EXECUTE stmt1; DEALLOCATE PREPARE stmt1; \n\
      SET @q=CONCAT('INSERT INTO ',INameN, ' SELECT * FROM ',IName,';');    PREPARE stmt1 FROM @q;  EXECUTE stmt1;  DEALLOCATE PREPARE stmt1; \n\
    END");

  if(boDropOnly) return SqlFunctionDrop;
  else return array_merge(SqlFunctionDrop, SqlFunction);
}


app.SetupSqlT.prototype.createDummies=function(){
  
  var SqlDummies=[];

  return [];  // not implemented

  var nFile=14;
  var arrTmp=[];
  for(var i=0;i<nFile;i++){
    arrTmp.push(" ("+i+","+i+")"); 
  }
  this.SqlDummies.push("INSERT INTO "+fileTab+" (idFile,data) VALUES "+arrTmp.join(",")  ); 


  this.SqlDummies.push("INSERT INTO "+pageTab+" (idPage,pageName,boTalk,boTemplate,boOR,boOW) VALUES \n\
  (1,'start',0,0,1,1), \n\
  (2,'tmp',0,0,1,1), \n\
  (3,'tmp_tmp',0,0,1,1);"); 

  this.SqlDummies.push("INSERT INTO "+versionTab+" (idPage,rev,summary,signature,boOther,idFile,tMod) VALUES \n\
  (1,0,'ok','MA',0,0,now()), \n\
  (2,1,'ok','MA',0,1,now()), \n\
  (2,2,'nok','Con',1,2,now()), \n\
  (3,3,'ok','MA',0,3,now());"); 


  this.SqlDummies.push("INSERT INTO "+imageTab+" (idImage,pageName,boOther,tCreated,idFile) VALUES \n\
  (1,'oak.jpg',0,now(),8), \n\
  (2,'wiki.png',0,now(),9);"); 

  this.SqlDummies.push("INSERT INTO "+thumbTab+" (idImage,width,height,tCreated,idFile) VALUES \n\
  (1,50,50,now(),10), \n\
  (2,50,50,now(),11);"); 

  this.SqlDummies.push("INSERT INTO "+videoTab+" (idVideo,pageName,tCreated,idFile) VALUES \n\
  (1,'ttt.ogg',now(),12), \n\
  (2,'abc.mp4',now(),13);"); 
  
  return SqlDummies;
}

app.SetupSqlT.prototype.createDummy=function(){
  var SqlDummy=[];
  if(typeof addExtraSqlF!='undefined') addExtraSqlF(SqlDummy,strDBPrefix,PropPage,this.engine,this.collate);
  return SqlDummy;
}
app.SetupSqlT.prototype.truncate=function(){
  
  var SqlTableTruncate=[];

  var StrTabName=object_values(TableName);

  var SqlTmp=[];
  for(var i=0;i<StrTabName.length;i++){
    SqlTmp.push(StrTabName[i]+" WRITE");
  }
  var tmp="LOCK TABLES "+SqlTmp.join(', ');
  SqlTableTruncate.push(tmp);
  for(var i=0;i<StrTabName.length;i++){
    SqlTableTruncate.push("DELETE FROM "+StrTabName[i]);
    SqlTableTruncate.push("ALTER TABLE "+StrTabName[i]+" AUTO_INCREMENT = 1");
  }
  SqlTableTruncate.push('UNLOCK TABLES');
  
  return SqlTableTruncate;
}
/*app.SetupSqlT.prototype.renameToTmp=function(){
  var SqlTableRename=[];
  var StrTabName=object_values(TableName);
  var SqlTmp=[];
  for(var i=0;i<StrTabName.length;i++){
    SqlTmp.push(StrTabName[i]+" TO "+StrTabName[i]+"_tmp");
  }
  var tmp="RENAME TABLE "+SqlTmp.join(', ');
  SqlTableRename.push(tmp);  
  return SqlTableRename;
}*/



  // Called when --sql command line option is used
app.SetupSqlT.prototype.doQuery=function*(strCreateSql, flow){
  //var StrValidSqlCalls=['createTable', 'dropTable', 'createView', 'dropView', 'createFunction', 'dropFunction', 'truncate', 'createDummy', 'createDummies'];
  if(StrValidSqlCalls.indexOf(strCreateSql)==-1){var tmp=strCreateSql+' is not valid input, try any of these: '+StrValidSqlCalls.join(', '); console.log(tmp); return; }
  var Match=RegExp("^(drop|create)?(.*?)$").exec(strCreateSql);
  if(!Match) { debugger;  return; }

  var boDropOnly=false, strMeth=Match[2];
  if(Match[1]=='drop') { boDropOnly=true; strMeth='create'+strMeth;}
  else if(Match[1]=='create')  { strMeth='create'+strMeth; }
  
  this.myMySql=new MyMySql(mysqlPool);
  
  var SqlA=this[strMeth](boDropOnly); 
  var strDelim=';', sql=SqlA.join(strDelim+'\n')+strDelim, Val=[];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val);
  var tmp=createMessTextOfMultQuery(SqlA, err, results);  console.log(tmp);
  this.myMySql.fin();
  if(err){ debugger;  return; }
  
}



var createMessTextOfMultQuery=function(Sql, err, results){
  var nSql=Sql.length, nResults='na'; if(results instanceof Array) nResults=results.length;
  var StrMess=[];   StrMess.push('nSql='+nSql+', nResults='+nResults);
  if(err){
    StrMess.push('err.index: '+err.index+', err: '+err);
    if(nSql==nResults){
      var tmp=Sql.slice(bound(err.index-1,0,nSql), bound(err.index+2,0,nSql)),  sql=tmp.join('\n');
      StrMess.push('Since "Sql" and "results" seem correctly aligned (has the same size), then 3 queries are printed (the preceding, the indexed, and following query (to get a context)):\n'+sql); 
    }
  }
  return StrMess.join('\n');
}


/******************************************************************************
 * ReqSql
 ******************************************************************************/
app.ReqSql=function(req, res){
  this.req=req; this.res=res;
  this.StrType=['table', 'fun', 'dropTable', 'dropFun', 'truncate', 'dummy', 'dummies']; 
}
app.ReqSql.prototype.createZip=function(SetupSql){
  var res=this.res, StrType=this.StrType;

  var zipfile = new NodeZip();
  for(var i=0;i<StrType.length;i++) {
    var strType=StrType[i], SqlA;
    var Match=RegExp("^(drop)?(.*)$").exec(strType), boDropOnly=Match[1]=='drop';
    var SqlA=SetupSql[Match[2].toLowerCase()]( boDropOnly);
    var strDelim=';;', sql='-- DELIMITER '+strDelim+'\n'      +SqlA.join(strDelim+'\n')+strDelim      +'\n-- DELIMITER ;\n';
    zipfile.file(strType+".sql", sql, {date:new Date(), compression:'DEFLATE'});
  }

  //var objArg={base64:false}; if(boCompress) objArg.compression='DEFLATE';
  var objArg={type:'string'}; //if(boCompress) objArg.compression='DEFLATE';
  var outdata = zipfile.generate(objArg);


  var outFileName=strAppName+'Setup.zip';
  var objHead={"Content-Type": 'application/zip', "Content-Length":outdata.length, 'Content-Disposition':'attachment; filename='+outFileName};
  res.writeHead(200,objHead);
  res.end(outdata,'binary');
}
ReqSql.prototype.toBrowser=function(SetupSql){
  var req=this.req, res=this.res, StrType=this.StrType;
  var Match=RegExp("^(drop)?(.*?)(All)?$").exec(req.pathNameWOPrefix), boDropOnly=Match[1]=='drop', strMeth=Match[2].toLowerCase();
  var StrValidMeth=['table', 'fun', 'truncate',  'dummy', 'dummies'];
  //var objTmp=Object.getPrototypeOf(SetupSql);
  if(StrValidMeth.indexOf(strMeth)!=-1){
    var SqlA=SetupSql[strMeth](boDropOnly);  
    var strDelim=';;', sql='-- DELIMITER '+strDelim+'\n'      +SqlA.join(strDelim+'\n')+strDelim      +'\n-- DELIMITER ;\n';
    res.out200(sql);
  }else{ var tmp=req.pathNameWOPrefix+' is not valid input, try: '+this.StrType; console.log(tmp); res.out404(tmp); }
}  



app.createDumpCommand=function(){ 
  var strCommand='', StrTabType=["sub", "subImage", "version", "page", "thumb", "image", "video", "file", "setting", "redirect", "redirectDomain", "site"];
  for(var i=0;i<StrTabType.length;i++){
    strCommand+='          '+strDBPrefix+'_'+StrTabType[i];
  }
  var strCommand="mysqldump mmm --user=root -p --no-create-info --hex-blob"+strCommand+'          >mmmWiki.sql';
  return strCommand;
}









// When reinstalling, to keep the table content, run these mysql queries in for example phpmyadmin:
// CALL "+strDBPrefix+"dupMake(); // After this, verify that the duplicate tables have the same number of rows
// (then do the install (run createTable.php))
// CALL "+strDBPrefix+"dupTrunkOrgNCopyBack();    // After this, verify that the tables have the same number of rows as the duplicates
// CALL "+strDBPrefix+"dupDrop();

