"use strict"

/******************************************************************************
 * ReqBE
 ******************************************************************************/
var ReqBE=app.ReqBE=function(req, res){
  this.req=req; this.res=res; this.Str=[];
}

ReqBE.prototype.go=function*(){
  var req=this.req, res=this.res;
  var flow=req.flow;
  
  this.Out={GRet:{boSpecialistExistDiff:{}}, dataArr:[]}; this.GRet=this.Out.GRet;

    // Extract input data either 'POST' or 'GET'
  if(req.method=='POST'){ 
    if('x-type' in req.headers ){ //&& req.headers['x-type']=='single'
      var form = new formidable.IncomingForm();
      form.multiples = true;  

      var err, fields, files;
      form.parse(req, function(errT, fieldsT, filesT) { err=errT; fields=fieldsT; files=filesT; flow.next();  });  yield;
      if(err){this.mesEO(err);  return; } 
      
      this.File=files['fileToUpload[]'];
      if('captcha' in fields) this.captchaIn=fields.captcha; else this.captchaIn='';
      if('strName' in fields) this.strName=fields.strName; else this.strName='';
      if(!(this.File instanceof Array)) this.File=[this.File];
      this.jsonInput=fields.vec;
      

    }else{  
      var buf, myConcat=concat(function(bufT){ buf=bufT; flow.next();  });    req.pipe(myConcat);    yield;
      this.jsonInput=buf.toString();
    }
  } else if(req.method=='GET'){
    var objUrl=url.parse(req.url), qs=objUrl.query||''; this.jsonInput=urldecode(qs);
  }
  
  
  var redisVar=req.sessionID+'_Main', strTmp=yield* wrapRedisSendCommand.call(req, 'set',[redisVar,1]);   var tmp=yield* wrapRedisSendCommand.call(req, 'expire',[redisVar,maxViewUnactivityTime]);

      // Conditionally push deadlines forward
  this.boVLoggedIn=yield* wrapRedisSendCommand.call(req, 'expire',[req.sessionID+'_viewTimer',maxViewUnactivityTime]);
  this.boALoggedIn=yield* wrapRedisSendCommand.call(req, 'expire',[req.sessionID+'_adminTimer',maxAdminUnactivityTime]);

  var jsonInput=this.jsonInput;
  try{
    var beArr=JSON.parse(jsonInput);
  }catch(e){
    console.log(e); res.out500('Error in JSON.parse, '+e); return;
  } 

  res.setHeader("Content-type", "application/json");


    // Remove the beArr[i][0] values that are not functions
  var CSRFIn; this.tModBrowser=0; //new Date(0); 
  for(var i=beArr.length-1;i>=0;i--){ 
    var row=beArr[i];
    if(row[0]=='page') {this.queredPage=row[1]; array_removeInd(beArr,i);}
    else if(row[0]=='tMod') {this.tModBrowser=Number(row[1]); array_removeInd(beArr,i);}   //this.tModBrowser=new Date(Number(row[1])*1000);
    else if(row[0]=='CSRFCode') {CSRFIn=row[1]; array_removeInd(beArr,i);}
  }

  var len=beArr.length;
  var StrInFunc=Array(len); for(var i=0;i<len;i++){StrInFunc[i]=beArr[i][0];}
  var arrCSRF, arrNoCSRF, allowed, boCheckCSRF, boSetNewCSRF;

           // Arrays of functions
    // Functions that changes something must check and refresh CSRF-code
  var arrCSRF=['myChMod', 'myChModImage', 'saveByAdd', 'saveByReplace', 'uploadUser', 'uploadAdmin', 'uploadAdminServ', 'getPageInfo', 'getImageInfo', 'setUpPageListCond','getPageList','getPageHist', 'setUpImageListCond','getImageList','getImageHist', 'getParent','getParentOfImage','getSingleParentExtraStuff', 'deletePage','deleteImage','renamePage','renameImage', 'redirectTabGet','redirectTabSet','redirectTabDelete', 'redirectTabResetNAccess', 'siteTabGet', 'siteTabSet', 'siteTabDelete', 'siteTabSetDefault'];
  var arrNoCSRF=['specSetup','vLogin','aLogin','aLogout','pageLoad','pageCompare','getPreview'];  
  allowed=arrCSRF.concat(arrNoCSRF);

    // Assign boCheckCSRF and boSetNewCSRF
  boCheckCSRF=0; boSetNewCSRF=0;   for(var i=0; i<beArr.length; i++){ var row=beArr[i]; if(in_array(row[0],arrCSRF)) {  boCheckCSRF=1; boSetNewCSRF=1;}  }    
  if(StrComp(StrInFunc,['specSetup'])){ boCheckCSRF=0; boSetNewCSRF=1; } // Public pages
  if(StrComp(StrInFunc,['pageLoad'])){ boCheckCSRF=0; boSetNewCSRF=0; } // Private pages: CSRF was set in index.html
  
  if(boDbg) boCheckCSRF=0;
  // Private:
  //                                                             index  first ajax (pageLoad)
  //Shall look the same (be cacheable (not include CSRFcode))     no           yes

  // Public:
  //                                                             index  first ajax (specSetup)
  //Shall look the same (be cacheable (not include CSRFcode))     yes          no


    // cecking/set CSRF-code
  var redisVar=req.sessionID+'_'+this.queredPage+'_CSRF', CSRFCode;
  if(boCheckCSRF){
    if(!CSRFIn){ var tmp='CSRFCode not set (try reload page)', error=new MyError(tmp); this.mesO(tmp); return;}
    var tmp=yield* wrapRedisSendCommand.call(req, 'get',[redisVar]);
    if(CSRFIn!==tmp){ var tmp='CSRFCode err (try reload page)', error=new MyError(tmp); this.mesO(tmp); return;}
  }
  if(boSetNewCSRF) {
    var CSRFCode=randomHash();
    var tmp=yield* wrapRedisSendCommand.call(req, 'set',[redisVar,CSRFCode]);
    var tmp=yield* wrapRedisSendCommand.call(req, 'expire',[redisVar,maxViewUnactivityTime]);
    this.GRet.CSRFCode=CSRFCode;
  }

  var Func=[];
  for(var k=0; k<beArr.length; k++){
    var strFun=beArr[k][0]; 
    if(in_array(strFun,allowed)) { 
      var inObj=beArr[k][1],     tmpf; if(strFun in this) tmpf=this[strFun]; else tmpf=global[strFun];
      var fT=[tmpf,inObj];   Func.push(fT);
    }
  }
  //var tmp=randomHash(); console.log(tmp); res.setHeader("Set-Cookie", "myCookieUpdatedOn304Test="+tmp);  //getCookie('myCookieUpdatedOn304Test')

  for(var k=0; k<Func.length; k++){
    var Tmp=Func[k], func=Tmp[0], inObj=Tmp[1];
    var objT=yield* func.call(this, inObj);
    if(typeof objT=='undefined' || objT.err) { 
      //if(objT.err!='exited') { res.out500(objT.err); } return; 
      if(!res.finished) { res.out500(objT.err); } return; 
    }else{
      this.Out.dataArr.push(objT.result);
    }
  }
  this.mesO();
}


ReqBE.prototype.vLogin=function*(inObj){
  var req=this.req, sessionID=req.sessionID;
  var GRet=this.GRet;
  var Ou={};  
  if(this.boVLoggedIn!=1 ){
    if('pass' in inObj) {
      var vPass=inObj.pass; 
      if(vPass==vPassword){
        var tmp=unixNow()+maxViewUnactivityTime;
        var redisVar=sessionID+'_viewTimer';
        var tmp=yield* wrapRedisSendCommand.call(req, 'set',[redisVar,tmp]);
        var tmp=yield* wrapRedisSendCommand.call(req, 'expire',[redisVar,maxViewUnactivityTime]);
        this.boVLoggedIn=1; this.mes('Logged in (viewing)');
      } else if(vPass=='')  this.mes('Password needed'); else this.mes('Wrong password');
    }
    else {this.mes('Password needed'); }
  }
  GRet.boVLoggedIn=this.boVLoggedIn;
  return {err:null, result:[Ou]};
}

ReqBE.prototype.aLogin=function*(inObj){
  var req=this.req, sessionID=req.sessionID;
  var GRet=this.GRet;
  var Ou={};  
  if(this.boALoggedIn!=1 ){
    if('pass' in inObj) {
      var aPass=inObj.pass; 
      if(aPass==aPassword) {
        var tmp=unixNow()+maxAdminUnactivityTime;
        var redisVar=sessionID+'_adminTimer';
        var tmp=yield* wrapRedisSendCommand.call(req, 'set',[redisVar,tmp]);
        var tmp=yield* wrapRedisSendCommand.call(req, 'expire',[redisVar,maxAdminUnactivityTime]);
        this.boVLoggedIn=1; this.boALoggedIn=1; this.mes('Logged in');
        if(objOthersActivity) extend(objOthersActivity,objOthersActivityDefault);
      }
      else if(aPass=='') {this.mes('Password needed');}
      else {this.mes('Wrong password');}
    }
    else {this.mes("Password needed"); }
  } 
  GRet.boALoggedIn=this.boALoggedIn; 
  return {err:null, result:[Ou]};
}



ReqBE.prototype.mes=function(str){ this.Str.push(str); }
ReqBE.prototype.mesO=function(str){
  var GRet=this.GRet;
  if(str) this.Str.push(str);
  GRet.strMessageText=this.Str.join(', '); 
  if('tMod' in GRet) GRet.tMod=GRet.tMod.toUnix();
  if('tModCache' in GRet) GRet.tModCache=GRet.tModCache.toUnix();
  this.res.end(JSON.stringify(this.Out));
}
ReqBE.prototype.mesEO=function(errIn){
  var GRet=this.GRet;
  var boString=typeof errIn=='string';
  var err=errIn; 
  if(boString) { this.Str.push('E: '+errIn); err=new MyError(errIn); } 
  else{  var tmp=err.syscal||''; this.Str.push('E: '+tmp+' '+err.code);  }
  console.log(err.stack);
  //var error=new MyError(err); console.log(error.stack);
  GRet.strMessageText=this.Str.join(', ');
  if('tMod' in GRet) GRet.tMod=GRet.tMod.toUnix();
  if('tModCache' in GRet) GRet.tModCache=GRet.tModCache.toUnix();

  this.res.writeHead(500, {"Content-Type": "text/plain"}); 
  this.res.end(JSON.stringify(this.Out));
}



ReqBE.prototype.myChMod=function*(inObj){   
  var req=this.req, res=this.res, queredPage=this.queredPage;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) {this.mesO('not logged in (as Administrator)'); return;}
  
  if('File' in inObj && inObj.File instanceof Array && inObj.File.length) var File=inObj.File; else {var tmp='chmod: no files'; this.mesEO(tmp); return }  
  
  var tmpBit; if('boOR' in inObj) tmpBit='boOR'; else if('boOW' in inObj) tmpBit='boOW'; else if('boSiteMap' in inObj) tmpBit='boSiteMap'; else {this.mesEO('No allowed bit specified'); return }
  
  var strCql=` 
    MATCH (p:Page)-[hasRevision]->(r:Revision) WHERE p.idPage IN $IdPage
    SET p.`+tmpBit+`=$bit, r.tModCache=0`;
  var Val={IdPage:File, bit:Boolean(inObj[tmpBit])};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }

  this.mes('chmod');
  GRet[tmpBit]=inObj[tmpBit]; // Sending boOW/boSiteMap  back will trigger closing/opening of the save/preview buttons
  return {err:null, result:[Ou]};
}
ReqBE.prototype.myChModImage=function*(inObj){   
  var req=this.req, res=this.res, queredPage=this.queredPage;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) {this.mesO('not logged in (as Administrator)'); return;}
  
  if('File' in inObj && inObj.File instanceof Array && inObj.File.length) var File=inObj.File; else {var tmp='chmodImage: no files'; this.mesEO(tmp); return; }  
   
  var strCql=` 
    MATCH (i:Image) WHERE i.idImage IN $idImage
    SET i.boOther=$bit`;
  var Val={idImage:File, bit:Boolean(inObj.boOther)};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }

  this.mes('chmodImage');
  GRet.boOther=inObj.boOther; // Sending boOther  back will trigger closing/opening of the save/preview buttons
  return {err:null, result:[Ou]};
}

ReqBE.prototype.deletePage=function*(inObj){   
  var req=this.req, res=this.res;
  var queredPage=this.queredPage;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) {this.mesO('not logged in (as Administrator)'); return;}
  
  if('File' in inObj && inObj.File instanceof Array && inObj.File.length) var File=inObj.File; else {var tmp='deletePage: no files'; this.mesEO(tmp); return; }

  var tx=sessionNeo4j.beginTransaction();
  var objArg={};      extend(objArg, {IdPage:File});
  var objT=yield* deletePageByMultIDNeo(flow, tx, objArg);
  if(objT.mess=='err') {
    yield* neo4jRollbackGenerator(flow, tx);
    this.mesEO('err'); return;
  }else{
    yield* neo4jCommitGenerator(flow, tx);
  }

  this.mes('pages deleted');
  return {err:null, result:[Ou]};
}
  
ReqBE.prototype.deleteImage=function*(inObj){   
  var req=this.req, res=this.res;
  var queredPage=this.queredPage;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) {this.mesO('not logged in (as Administrator)'); return;}

  if('File' in inObj && inObj.File instanceof Array && inObj.File.length) var File=inObj.File; else {var tmp='deleteImage: no files'; this.mesEO(tmp); return; }
  
  
    // Get IDs
  var strCql=` 
    MATCH (ii:Image) WHERE ii.idImage IN $IdImage
    RETURN ii.idImage AS id
    UNION 
    MATCH (i:Image)-[h:hasThumb]->(t:ImageThumb) WHERE i.idImage IN $IdImage
    RETURN t.idThumb AS id`;
  var Val={IdImage:File}
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  var arrID=Array(records.length);   for(var i=0;i<records.length;i++){      arrID[i]=new mongodb.ObjectID(records[i].id);    }
  
    // Delete documents
  var collection = dbMongo.collection('documents');
  var result, objDoc={_id:{ "$in": arrID}};
  collection.deleteMany( objDoc, function(errT, resultT) { err=errT; result=resultT;  flow.next(); });   yield;
  if(err) { extend(Ou, {mess:'err', err:err}); return Ou; }  
  
  
     // Delete thumb-meta-data
  var strCql=`
    MATCH (i:Image) WHERE i.idImage IN $IdImage
    WITH i
    OPTIONAL MATCH (i)-[h:hasThumb]->(t:ImageThumb)
    DETACH DELETE t
    SET i.boGotData=NULL`;
  var Val={IdImage:File}
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
 
     // Delete orphaned Images with no data
  var strCql=` 
    MATCH (iOrphan:Image) WHERE iOrphan.idImage IN $IdImage AND (NOT (:Page)-[:hasImage]->(iOrphan)) AND iOrphan.boGotData IS NULL
    DETACH DELETE iOrphan`;
  var Val={IdImage:File};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err ) { extend(Ou, {mess:'err', err:err}); return Ou; }
  this.mes('images deleted');   
  return {err:null, result:[Ou]};
  
}
ReqBE.prototype.aLogout=function*(inObj){  
  var req=this.req, res=this.res;
  var GRet=this.GRet;
  var Ou={};
  //redisClient.del(sessionID+'_adminTimer');
  var redisVar=req.sessionID+'_adminTimer';
  var tmp=yield* wrapRedisSendCommand.call(req, 'del',[redisVar]);

  if(this.boALoggedIn) {this.mes('Logged out (as Administrator)'); GRet.strDiffText=''; } 
  GRet.boALoggedIn=0; 
  return {err:null, result:[Ou]};
}



//////////////////////////////////////////////////////////////////////////////////////////////
// pageLoad
//////////////////////////////////////////////////////////////////////////////////////////////
  
ReqBE.prototype.pageLoad=function*(inObj) { 
  var req=this.req, res=this.res;
  var queredPage=this.queredPage;
  var GRet=this.GRet;
  var Ou={}, flow=req.flow;

  // Private:
  //                                                           index.html  first ajax (pageLoad)
  //Shall look the same (be cacheable (not include CSRFcode))     no           yes

  // Public:
  //                                                           index.html  first ajax (specSetup)
  //Shall look the same (be cacheable (not include CSRFcode))     yes          no

  var tMod=new Date(0);
  var tModCache=new Date(0);
  //this.CSRFCode='';  // If Private then No CSRFCode since the page is going to be cacheable (look the same each time)
  if(typeof inObj=='object' && 'version' in inObj) {  var iRev=inObj.version-1 } else {  var iRev=-1; }
  var eTagIn='', requesterCacheTime=new Date(0);
  if(req.method=='GET') {eTagIn=getETag(req.headers); requesterCacheTime=getRequesterTime(req.headers); }
  GRet.arrVersionCompared=[null,1];
  GRet.matVersion=[];


      // getInfoNData
  var tx=sessionNeo4j.beginTransaction();
  var objArg={};   copySome(objArg, req, ['boTLS', 'www']);     extend(objArg, {strName:queredPage, iRev:iRev, eTag:eTagIn, requesterCacheTime:requesterCacheTime, boFront:0});
  var objT=yield* getInfoNDataNeo(flow, tx, objArg);
  if(objT.mess=='err') {
    yield* neo4jRollbackGenerator(flow, tx);
    this.mesEO('err'); return;
  }else{
    yield* neo4jCommitGenerator(flow, tx);
  }
  var objDBData=objT;
  
  var mess=objDBData.mess;
  if(mess=='wwwNotFound'){ res.out404('No wiki there'); return;   }
  else if(mess=='noSuchPage'){ res.out404(); return;   }
  else if(mess=='noSuchRev') {res.out500(mess); return; }
  else if(mess=='noDefaultSite'){ res.out500(mess); return;   }
  else if(mess=='serverCacheStale' || mess=='304' || mess=='serverCacheOK'){
    var iRev=objDBData.iRev, objRev=objDBData.arrRev[iRev];
    var objPage=objDBData.objPage;
    var tmp=objPage.boOR?'':', private';
    res.setHeader("Cache-Control", "must-revalidate"+tmp);  res.setHeader('Last-Modified',(new Date(objRev.tModCache*1000)).toUTCString());
    if(mess=='304') { res.out304();  return; }
    else{
      
      GRet.strEditText=objRev.strEditText;
      GRet.matVersion=makeMatVersion(objDBData.arrRev);  // tMod, summary and signature
      GRet.arrVersionCompared=[null, iRev+1];

      if(mess=='serverCacheStale'){  //  && iRev+1==objDBData.arrRev.length   // if viewing old versions then serve stale cache
            // refreshRevNeo
        var tx=sessionNeo4j.beginTransaction();
        var objArg={};   copySome(objArg, req, ['boTLS', 'www']);     extend(objArg, {strName:queredPage, iRev:iRev});
        var objT=yield* refreshRevNeo(flow, tx, objArg);
        if(objT.mess=='err') {
          yield* neo4jRollbackGenerator(flow, tx);
          this.mesEO('err'); return;
        }else{
          yield* neo4jCommitGenerator(flow, tx);
        }
        var objDBData=objT;
        
        var objPage=objDBData.objPage;
        var objRev=objDBData.arrRev[iRev];
        
      } 
      //res.setHeader('ETag',eTag);
      copySome(GRet, objDBData, ['objTemplateE', 'boTalkExist']);
      //if(typeof objPage=='undefined') var objPageT={boOR:1, boOW:1, boSiteMap:1, idPage:NaN}; else  var objPageT=copySome({},objPage, ['boOR','boOW', 'boSiteMap', 'idPage']); GRet.objPage=objPageT;
      GRet.objPage=copySome({},objPage, ['boOR','boOW', 'boSiteMap', 'idPage']);
      GRet.objRev=copySome({},objRev, ['tMod']);
      GRet.strHtmlText=objRev.strHtmlText;
      GRet.strDiffText='';
      return {err:null, result:[Ou]};
    }
  }
  else { res.out500('mess='+mess); return; }
}


ReqBE.prototype.pageCompare=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, Ou={}, flow=req.flow;
  var versionO=arr_min(inObj.arrVersionCompared), version=arr_max(inObj.arrVersionCompared);     versionO=Math.max(1,versionO); version=Math.max(1,version);    var iRev=version-1, iRevO=versionO-1;
  if(version==versionO) {this.mesEO('Same version'); return;}


  var tx=sessionNeo4j.beginTransaction(), err, objOut;
  try{
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
    
    var strNameLC=this.queredPage.toLowerCase();
    var Val={strNameLC:strNameLC, www:req.www};
    var strCql=objCql['getNRev'], {err, records}= yield* neo4jTxRun(flow, tx, strCql, Val);
    if(err){throw {mess:'err', err:err}; } 
    var nRev=records[0].nRev;
    if(nRev==0) throw {mess:'noSuchPage'};
    if(version>nRev || versionO>nRev) { throw {mess:'noSuchRev', nRev:nRev}; } 
     
    
    var Val={www:req.www, strNameLC:strNameLC, iRevO:iRevO, iRev:iRev};
    var strCql=objCql['getPage and revs'], {err, records}= yield* neo4jTxRun(flow, tx, strCql, Val);
    if(err) throw {mess:'err', err:err}; 
    var objPage=records[0].p, objRevO=records[0].rO, objRev=records[0].r;
    
    
    if(!objPage.boOR && !this.boVLoggedIn){ throw {mess:'boViewLoginRequired'};;}


    var strEditTextO=objRevO.strEditText;
    var strEditText=objRev.strEditText;
    
        // parse (Reparsing to get right link coloring and the latest templates)
    objOut=yield* parse(flow, tx, {www:req.www, strEditText:strEditText, boOW:objPage.boOW});
    objOut.mess='OK';
  } catch(e){
    objOut=e;
  }finally{
    if(objOut.mess=='err') {
      yield* neo4jRollbackGenerator(flow, tx);
    }else{
      yield* neo4jCommitGenerator(flow, tx);
    }
    if(objOut.mess=='err') { return {err:err}; }
    else if(objOut.mess=='noSuchPage') { this.mesEO('Page does not exist'); return; }
    else if(objOut.mess=='noSuchRev') {this.mesO('Only '+e.nRev+' versions, (trying to compare '+versionO+' and '+version+')'); return; }
    else if(objOut.mess=='boViewLoginRequired') {this.mesEO('Not logged in'); return; }
    
  }
      
  GRet.strDiffText='';
  if(versionO!==null){
    GRet.strDiffText=myDiff(strEditTextO,strEditText);
    if(GRet.strDiffText.length==0) GRet.strDiffText='(equal)';
    this.mes("v "+versionO+" vs "+version);
  } else this.mes("v "+version);

  copySome(GRet, objOut, ['strHtmlText']);
  extend(GRet, {strEditText:strEditText, arrVersionCompared:[versionO,version]});
  //GRet.objPage=copySome({},objPage, ['boOR','boOW', 'boSiteMap', 'idPage']);
  //GRet.objRev=copySome({},objRev, ['tMod']);

  return {err:null, result:[0]};
}


ReqBE.prototype.getPreview=function*(inObj){ 
  var req=this.req, res=this.res;
  var Ou={}, GRet=this.GRet, flow=req.flow;
  
  var tx=sessionNeo4j.beginTransaction();
    // getInfoNeo
  var objT=yield* getInfoNeo(flow, tx, {www:req.www, strName:this.queredPage});
  if(objT.mess=='err') {
    yield* neo4jRollbackGenerator(flow, tx);
    this.mesEO('err'); return;
  }
  var objInfo=objT;
    // parse
  var objParseOut=yield* parse(flow, tx, {www:req.www, strEditText:inObj.strEditText, boOW:objT.boOW});
  if(objT.mess=='err') {
    yield* neo4jRollbackGenerator(flow, tx);
    this.mesEO('err'); return;
  }else{
    yield* neo4jCommitGenerator(flow, tx);
  }
  var arrSub=objParseOut.arrSub, StrSubImage=objParseOut.StrSubImage;

  this.mes('Preview');
  copySome(GRet, objParseOut, ['objTemplateE', 'strHtmlText']);
  GRet.strEditText=inObj.strEditText;
  
  return {err:null, result:[0]};
} 


ReqBE.prototype.saveByReplace=function*(inObj){   
  var req=this.req, res=this.res;
  var queredPage=this.queredPage;
  var Ou={}, GRet=this.GRet, flow=req.flow;
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }

  var strEditText=inObj.strEditText;

  var tx=sessionNeo4j.beginTransaction();
  var objArg={};   copySome(objArg, req, ['boTLS', 'www']);     extend(objArg, {strName:queredPage, strEditText:strEditText, tModBrowser:this.tModBrowser, boVLoggedIn:this.boVLoggedIn});
  var objT=yield* saveByReplaceNeo(flow, tx, objArg);
  if(objT.mess=='err') {
    yield* neo4jRollbackGenerator(flow, tx);
    this.mesEO('err'); return;
  }else{
    yield* neo4jCommitGenerator(flow, tx);
  }
  
  var mess=objT.mess;
  if(mess=='boViewLoginRequired'){this.mesO('Not logged in'); return;}
  else if(mess=='boTModBrowserObs') { 
    var tDiff=objT.tMod-this.tModBrowser, arrTmp=getSuitableTimeUnit(tDiff), strTTmp=Math.round(arrTmp[0])+arrTmp[1]; 
    this.mesO("tMod browser ("+this.tModBrowser+") < tMod db ("+objT.tMod+") (someone saved "+strTTmp+" after you loaded the page), "+messPreventBecauseOfNewerVersions); return;
  }else if(mess=='boPageDeleted'){
    GRet.objTemplateE={}; GRet.boTalkExist=0; GRet.strHtmlText=''; GRet.objRev={strHtmlText:'', tMod:0}; GRet.objPage={idPage:NaN, tMod:0, tModCache:0, boOR:1, boOW:1, boSiteMap:1};
    extend(GRet, {strDiffText:'', strEditText:strEditText, arrVersionCompared:[null,1]});
    this.mes("No content, Page deleted");
  }else if(mess=='OK') {
    GRet.objPage=copySome({},objT.objPage, ['boOR','boOW', 'boSiteMap', 'idPage']);
    var arrRev=objT.arrRev;
    var objRev=arrRev[0];
    GRet.objRev=copySome({},objRev, ['tMod']);
    GRet.strHtmlText=objRev.strHtmlText;
    GRet.matVersion=makeMatVersion(objT.arrRev);
    copySome(GRet, objT, ['objTemplateE', 'objPage', 'boTalkExist']);
    extend(GRet, {strDiffText:'', strEditText:strEditText, arrVersionCompared:[null,1]});
    this.mes("Page overwritten");
  }else if(mess!='OK') {
    res.out500(mess); return;
  }

  return {err:null, result:[0]};
}


ReqBE.prototype.saveByAdd=function*(inObj){  
  var req=this.req, res=this.res;
  var Ou={}, GRet=this.GRet, flow=req.flow;

  var tx=sessionNeo4j.beginTransaction();
  var objArg={};   copySome(objArg, req, ['boTLS', 'www']);     extend(objArg, {strName:this.queredPage, strEditText:inObj.strEditText, tModBrowser:this.tModBrowser, boVLoggedIn:this.boVLoggedIn});
  copySome(objArg,inObj,['summary', 'signature']);    
  var objT=yield* saveByAddNeo(flow, tx, objArg);
  if(objT.mess=='err') {
    yield* neo4jRollbackGenerator(flow, tx);
    this.mesEO('err'); return;
  }else{
    yield* neo4jCommitGenerator(flow, tx);
  }
  var iRev=objT.iRev, objRev=objT.arrRev[iRev];
  var objPage=objT.objPage;

  var mess=objT.mess;
  if(mess=='boViewLoginRequired'){this.mesO('Not logged in'); return;}
  else if(mess=='boViewALoginRequired'){this.mesO('Not authorized'); return;}
  else if(mess=='boTModBrowserObs') { 
    var tDiff=objT.tMod-this.tModBrowser, arrTmp=getSuitableTimeUnit(tDiff), strTTmp=Math.round(arrTmp[0])+arrTmp[1]; 
    this.mesO("tMod browser ("+this.tModBrowser+") < tMod db ("+objT.tMod+") (someone saved "+strTTmp+" after you loaded the page), "+messPreventBecauseOfNewerVersions); return;
  }
  else if(mess!='OK') {res.out500(mess); return;  }
  
  GRet.matVersion=makeMatVersion(objT.arrRev);
  
  this.mes("New version added");
  if(objOthersActivity) { objOthersActivity.nEdit++; objOthersActivity.pageName=objT.siteName+':'+this.queredPage; }

  copySome(GRet, objT, ['objTemplateE', 'boTalkExist']);
  extend(GRet, {strDiffText:'', strEditText:inObj.strEditText, arrVersionCompared:[null,GRet.matVersion.length]});
  GRet.objPage=copySome({},objPage, ['boOR','boOW', 'boSiteMap', 'idPage']);
  GRet.objRev=copySome({},objRev, ['tMod']);
  GRet.strHtmlText=objRev.strHtmlText;
  return {err:null, result:[0]};
}


ReqBE.prototype.renamePage=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }

  var strCql=` 
    MATCH (p:Page {idPage:$idPage})
    SET p.name=$name, p.nameLC=$nameLC
    RETURN p.name AS name`;
  var strNewName=inObj.strNewName.replace(RegExp(' ','g'),'_');
  var Val={idPage:inObj.id, name:strNewName, nameLC:strNewName.toLowerCase()};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err) { extend(Ou, {mess:'err', err:err}); return Ou; }

  var c=records.length, boOK, mestmp; if(c==1) { boOK=1; mestmp="1 page renamed"; } else {boOK=0; mestmp=c+" pages renamed!?"; }
  this.mes(mestmp);
  Ou.boOK=boOK;      
  return {err:null, result:[Ou]};
}

ReqBE.prototype.renameImage=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }

  var strCql=` 
    MATCH (i:Image {idImage:$idImage})
    SET i.name=$name, i.nameLC=$nameLC
    RETURN i.name AS name`;
  var strNewName=inObj.strNewName.replace(RegExp(' ','g'),'_');
  var Val={idImage:inObj.id, name:strNewName, nameLC:strNewName.toLowerCase()};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err) { extend(Ou, {mess:'err', err:err}); return Ou; }

  var c=records.length, boOK, mestmp; if(c==1) { boOK=1; mestmp="1 image renamed"; } else {boOK=0; mestmp=c+" images renamed!?"; }
  this.mes(mestmp);
  Ou.boOK=boOK;      
  return {err:null, result:[Ou]};
  
}


ReqBE.prototype.specSetup=function*(inObj){
  var req=this.req, res=this.res;
  var GRet=this.GRet;

  var Ou={};
  GRet.boVLoggedIn=this.boVLoggedIn; 
  GRet.boALoggedIn=this.boALoggedIn;
  return {err:null, result:[Ou]};  
}

ReqBE.prototype.setUpPageListCond=function*(inObj){
  var Ou={};
  var oTmp=setUpArrWhereETC(StrOrderFiltPage, PropPage, inObj), Where=oTmp.Where, strFeatWNullEntry=oTmp.strFeatWNullEntry;
  if(oTmp.err)  { return oTmp; }
  
  extend(inObj, {type:'page'});
  copySome(this,oTmp,['Where', 'strNullFilterMode']);
  return {err:null, result:[Ou]};
}
 
ReqBE.prototype.getParent=function*(inObj){
  var req=this.req, res=this.res, flow=req.flow, Ou={};
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }

  var strCql=`
    MATCH (s:Site)-[hasPage]->(p:Page)-[hc:hasChild]->(c:Page {idPage:$idPage})
    RETURN s.boTLS AS boTLS, s.www AS www, p.idPage AS idPage, p.name AS pageName`;
  var Val={idPage:inObj.idPage};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err) { extend(Ou, {mess:'err', err:err}); return Ou; }
  
  Ou=arrObj2TabNStrCol(records);
  return {err:null, result:[Ou]};
}

ReqBE.prototype.getParentOfImage=function*(inObj){
  var req=this.req, res=this.res, flow=req.flow, Ou={};
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }

  var strCql=`
    MATCH (s:Site)-[hasPage]->(p:Page)-[hi:hasImage]->(i:Image {idImage:$idImage})
    RETURN s.boTLS AS boTLS, s.www AS www, p.idPage AS idPage, p.name AS pageName`;
  var Val={idImage:inObj.idImage};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err) { extend(Ou, {mess:'err', err:err}); return Ou; }
  
  Ou=arrObj2TabNStrCol(records);
  return {err:null, result:[Ou]};
}

ReqBE.prototype.getSingleParentExtraStuff=function*(inObj){
  var req=this.req, res=this.res, flow=req.flow, Ou={};
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }
  
  if(inObj.idPage===null){
      // Get number of orphaned pages / orphaned images
    var strCql=`
      OPTIONAL MATCH (pOrphan:Page) WHERE (NOT (:Page)-[:hasChild]->(pOrphan)) 
      WITH COUNT(pOrphan) AS nSub
      OPTIONAL MATCH (iOrphan:Image)  WHERE (NOT (:Page)-[:hasImage]->(iOrphan))
      RETURN nSub, COUNT(iOrphan) AS nImage`;
    var Val={};
    var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
    if(err) { extend(Ou, {mess:'err', err:err}); return Ou; }
    if(records.length!=1) {  return {err:new Error('records.length!=1')}; }
    Ou=records[0];

  } else {  
    var strCql=`
      MATCH (s:Site)-[hasPage]->(p:Page {idPage:$idPage})
      OPTIONAL MATCH (p)-[hc:hasChild]->(c:Page)
      WITH s, p, COUNT(c) AS nSub
      OPTIONAL MATCH (p)-[hc:hasImage]->(i:Image)
      WITH s, p, nSub, COUNT(i) AS nImage
      OPTIONAL MATCH (p2:Page {nameLC:p.nameLC})
      RETURN s.boTLS AS boTLS, s.name AS siteName, s.www AS www, p.name AS pageName, p.nameLC AS nameLC, nSub, nImage, COUNT(p2) AS nSame`;
    var Val={idPage:inObj.idPage};
    var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
    if(err) { extend(Ou, {mess:'err', err:err}); return Ou; }
    if(records.length!=1) {  return {err:new Error('records.length!=1')}; }
    Ou=records[0];
  } 
  
  return {err:null, result:[Ou]};
}


ReqBE.prototype.getPageList=function*(inObj) {
  var req=this.req, res=this.res;
  var flow=req.flow;

  var tmp=whereArrToStr(this.Where), strWhere=tmp.strWhere, strWhereWExt=tmp.strWhereWExt;
  var strCql=createListQuery('page', this.strNullFilterMode, strWhere, strWhereWExt);
  var Val={};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err){ this.mesEO(err); return;  }
  var Ou=arrObj2TabNStrCol(records), nFiltered=records.length;
  
  var strCql="MATCH (p:Page)-[h:hasRevision]->(r:RevisionLast), (s:Site)-[hasPage]->(p) RETURN COUNT(p) AS nUnFiltered";  // cqlNUnFiltered
  var Val={};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err){ this.mesEO(err); return;  }
  var nUnFiltered=records[0].nUnFiltered;

  Ou.NFilt=[nFiltered, nUnFiltered];
  return {err:null, result:[Ou]};
}

ReqBE.prototype.getPageHist=function*(inObj){
  var req=this.req, res=this.res;
  var Ou={}, flow=req.flow;
  var arg={Ou:Ou, WhereExtra:[], Prop:PropPage, StrOrderFilt:StrOrderFiltPage, type:'page'};  
  copySome(arg, this, ['Where', 'strNullFilterMode']);
  
  var objT=yield* getHist(flow, arg);
  if(objT.err){ this.mesEO(objT.err); return;  }
  Ou={Hist:objT.Hist};

    // Removing null parent
  var iColParent=KeyColPageFlip.parent, arrTmpA=Ou.Hist[iColParent], arrTmpB=[];
  for(var i=0;i<arrTmpA.length;i++){var tmp=arrTmpA[i]; if(  (tmp instanceof Array) && (tmp[0]!==null)  ) arrTmpB.push(tmp[0]);  }

    // Fetching the names of the parents
  var len=arrTmpB.length;
  if(len){
    var strCql=`MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasRevision]->(r:RevisionLast) WHERE p.idPage IN $IdPage
    RETURN s.name AS siteName, p.idPage AS idPage, p.nameLC AS pageName`;

    var Val={IdPage:arrTmpB};
    var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
    if(err){ this.mesEO(err); return;  }
    Ou.ParentName=arrObj2TabNStrCol(records);
  }

  return {err:null, result:[Ou]};
}


ReqBE.prototype.setUpImageListCond=function*(inObj){
  var Ou={};
  var oTmp=setUpArrWhereETC(StrOrderFiltImage, PropImage, inObj), Where=oTmp.Where, strFeatWNullEntry=oTmp.strFeatWNullEntry;
  if(oTmp.err)  { return oTmp; }
  
  extend(inObj, {type:'image'});
  copySome(this,oTmp,['Where', 'strNullFilterMode']);
  return {err:null, result:[Ou]};
}

ReqBE.prototype.getImageList=function*(inObj) {
  var req=this.req, res=this.res;
  var flow=req.flow;

  var tmp=whereArrToStr(this.Where), strWhere=tmp.strWhere, strWhereWExt=tmp.strWhereWExt;
  var strCql=createListQuery('image', this.strNullFilterMode, strWhere, strWhereWExt);
  var Val={};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err){ this.mesEO(err); return;  }
  var Ou=arrObj2TabNStrCol(records), nFiltered=records.length;

  var strCql="MATCH (i:Image) WHERE i.boGotData RETURN COUNT(i) AS nUnFiltered";  //cqlNUnFiltered
  var Val={};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err){ this.mesEO(err); return;  }
  var nUnFiltered=records[0].nUnFiltered;

  Ou.NFilt=[nFiltered, nUnFiltered];
  return {err:null, result:[Ou]};
}

ReqBE.prototype.getImageHist=function*(inObj){
  var req=this.req, res=this.res;
  var Ou={}, flow=req.flow;
  var arg={Ou:Ou, WhereExtra:[], Prop:PropImage, StrOrderFilt:StrOrderFiltImage, type:'image'};  
  copySome(arg, this, ['Where', 'strNullFilterMode']);
  
  var objT=yield* getHist(flow, arg);
  if(objT.err){ this.mesEO(objT.err); return;  }
  Ou={Hist:objT.Hist};

    // Removing some parents (Not sure why this is needed (to remove null perhaps))
  var iColParent=KeyColImageFlip.parent, arrTmpA=Ou.Hist[iColParent], arrTmpB=[];
  for(var i=0;i<arrTmpA.length;i++){var tmp=arrTmpA[i]; if(  (tmp instanceof Array) && (tmp[0]!==null)  ) arrTmpB.push(tmp[0]);  }

    // Fetching the names of the parents
  var len=arrTmpB.length;
  if(len){
    var strCql=`MATCH (s:Site)-[hasPage]->(p:Page)-[h:hasRevision]->(r:RevisionLast) WHERE p.idPage IN $IdPage
    RETURN s.name AS siteName, p.idPage AS idPage, p.nameLC AS pageName`;

    var Val={IdPage:arrTmpB};
    var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
    if(err){ this.mesEO(err); return;  }
    Ou.ParentName=arrObj2TabNStrCol(records);
  }

  return {err:null, result:[Ou]};
}

//MATCH (s:Site)-[:hasPage]->(p:Page)-[h:hasRevision]->(r:RevisionLast) WHERE s.boDefault=1 AND p.nameLC IN ['start', 'starta', 'startb']
//    RETURN p.name AS pageName, p.boOR AS boOR, p.boOW AS boOW, r.tMod AS tMod, p.boOther AS boOther, r.size AS size
    
ReqBE.prototype.getPageInfo=function*(inObj){
  var req=this.req, res=this.res, Ou={}
  var GRet=this.GRet, flow=req.flow;
  var Ou={FileInfo:[]};
  var strCql=`
      // ----- start
    MATCH (s:Site)-[:hasPage]->(p:Page)-[h:hasRevision]->(r:RevisionLast) WHERE 
    
      // ----- end
    RETURN p.name AS pageName, p.boOR AS boOR, p.boOW AS boOW, r.tMod AS tMod, p.boOther AS boOther, r.size AS size`;
  var objCql=splitCql(strCql);
    
  var Val={}; 
  if('objName' in inObj) {  // objName, Ex: {siteA:['start', 'starta' ...], siteB:['start', 'starta' ...] ...} 
    var strKeyDefault=inObj.strKeyDefault;
    var objName=inObj.objName, arrQ=[];
    var objTmp={};
    for(var siteName in objName){
      var arrName=objName[siteName];
      var nName=arrName.length;
      var strTmp; if(siteName==strKeyDefault){  strTmp="s.boDefault=true";   }   else {  strTmp="s.name='"+siteName+"'";  } 
      arrQ.push(strTmp+" AND p.nameLC IN $Str"+siteName+" ");  Val['Str'+siteName]=arrName;
    }
    var strQ='false'; if(arrQ.length) strQ=arrQ.join(' OR ');
    var strCql=objCql['start']+strQ+objCql['end'];
    
    var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
    if(err) { return {err:err}; }
    Ou.FileInfo=records;
  } 
  else{
    setTimeout(function(){ Ou.FileInfo=[];  flow.next();  });
    yield;
  }
  
  return {err:null, result:[Ou]};
}


ReqBE.prototype.getImageInfo=function*(inObj){
  var req=this.req, res=this.res, Ou={}
  var GRet=this.GRet, flow=req.flow;
  var Ou={FileInfo:[]};
  var strCqlOrg=`
      // ----- start
    MATCH (i:Image) WHERE i.boGotData=TRUE
    
      // ----- end
    RETURN i.name AS imageName, i.tMod AS tMod, i.boOther AS boOther, i.hash AS eTag, i.size AS size`;
  var objCql=splitCql(strCqlOrg);

  var StrNameLC=[], strCond='';
  if('arrName' in inObj) {  // arrName, Ex: ['a.jpg', 'b.jpg' ...]  
    var arrName=inObj.arrName, nName=arrName.length;
    StrNameLC=Array(nName);    for(var i=0;i<nName;i++){ StrNameLC[i]=arrName[i].toLowerCase();}
    strCond=" AND i.nameLC IN $StrNameLC \n";    
  } 
  var Val={StrNameLC:StrNameLC}; 
  var strCql=objCql['start']+strCond+objCql['end'];
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err) { return {err:err}; }
  Ou.FileInfo=records;
  return {err:null, result:[Ou]};
}

////////////////////////////////////////////////////////////////////////
// RedirectTab
////////////////////////////////////////////////////////////////////////
ReqBE.prototype.redirectTabGet=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }
  var strCql=` 
    MATCH (s:Site)-[:hasRedirect]->(r:Redirect)
    RETURN s.name AS idSite, s.name AS siteName, s.www AS www, r.nameLC AS pageName, r.url AS url, r.tCreated AS tCreated, r.tMod AS tMod, r.nAccess AS nAccess, r.tLastAccess AS tLastAccess`;
  var Val={};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err ) { res.out500(err); return; }

  var Ou=arrObj2TabNStrCol(records);
  this.mes("Got "+records.length+" entries"); 
  extend(Ou, {boOK:1,nEntry:records.length});
  return {err:null, result:[Ou]};
}

ReqBE.prototype.redirectTabSet=function*(inObj){
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }
  var boUpd=inObj.boUpd||false;
  if(boUpd){
      // If r.nameLC or idSite changes then nAccess, tLastAccess, tCreated are set as if the Redirect was created.
    var strCql=`MATCH (sOld:Site {name:$idSiteOld})-[relOld:hasRedirect]->(r:Redirect {nameLC:$nameLCOld}), (s:Site {name:$idSite}) 
      CREATE (s)-[relNew:hasRedirect]->(r) 
      SET r.nameLC=$nameLC, r.url=$url, r.tMod=$tNow, r.nAccess=coalesce($boNew*0, r.nAccess), r.tLastAccess=coalesce($boNew*$tNow, r.tLastAccess), r.tCreated=coalesce($boNew*$tNow, r.tCreated)
      DELETE relOld
      RETURN s.name AS idSite, s.name AS siteName, s.www AS www, r.nameLC AS pageName, r.url AS url, r.tCreated AS tCreated, r.tMod AS tMod, r.nAccess AS nAccess, r.tLastAccess AS tLastAccess`;
    var Val=copySome({}, inObj, ['idSiteOld', 'idSite', 'url']);
    Val.nameLC=inObj.pageName.replace(RegExp(' ','g'),'_').toLowerCase();  Val.nameLCOld=inObj.pageNameOld.replace(RegExp(' ','g'),'_').toLowerCase();
    Val.boNew=(Val.nameLC!=Val.nameLCOld || Val.idSite!=Val.idSiteOld)?1:null;
  } else {
    var strCql=`MATCH (s:Site {name:$idSite})
      CREATE (s)-[:hasRedirect]->(r:Redirect) SET r.nameLC=$nameLC, r.url=$url, r.tCreated=$tNow, r.tMod=$tNow, r.tLastAccess=$tNow, r.nAccess=0
      RETURN s.name AS idSite, s.name AS siteName, s.www AS www, r.nameLC AS pageName, r.url AS url, r.tCreated AS tCreated, r.tMod AS tMod, r.nAccess AS nAccess, r.tLastAccess AS tLastAccess`;
    var Val=copySome({}, inObj, ['idSite', 'url']); Val.nameLC=inObj.pageName.replace(RegExp(' ','g'),'_');
  }
  Val.tNow=(new Date()).toUnix();
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  
  var boOK, mestmp;
  if(err && (typeof err=='object') && err.message){boOK=0; mestmp=err.message;}
  else if(err){ this.mesEO(err); return;  }
  else{ boOK=1; mestmp="Done";  }
  var Ou=arrObj2TabNStrCol(records);
  
  this.mes(mestmp);
  extend(Ou, {boOK:boOK});   //if(boUpd) Ou.idSiteOld=inObj.idSite;
  return {err:null, result:[Ou]};
}
ReqBE.prototype.redirectTabDelete=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }
  var strCql=`MATCH (s:Site)-[:hasRedirect]->(r:Redirect) WHERE s.name=$name AND r.nameLC=$nameLC DETACH DELETE r RETURN COUNT(r) AS nDelete`;
  var Val={name:inObj.idSite, nameLC:inObj.pageName.replace(RegExp(' ','g'),'_')};
  
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);

  var c=records[0].nDelete, boOK, mestmp; 
  if(c==1) {boOK=1; mestmp="Entry deleted"; } else {boOK=1; mestmp=c+ " entries deleted!?"; }
  this.mes(mestmp);
  Ou.boOK=boOK;      
  return {err:null, result:[Ou]};
}

ReqBE.prototype.redirectTabResetNAccess=function*(inObj){
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }
  var strCql=`MATCH (r:Redirect) SET r.nAccess=0`;
  var Val={};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);

  var boOK=0, mestmp;
  if(err) {  this.mesEO(err); return;  } else{  boOK=1; mestmp="Done";  }
  this.mes(mestmp);
  extend(Ou, {boOK:boOK});
  return {err:null, result:[Ou]};
}

////////////////////////////////////////////////////////////////////////
// SiteTab
////////////////////////////////////////////////////////////////////////

  // Notice! "idSite" is the same as "name". TODO: The client side should be fixed to conform with this, then these functions (siteTabGet, siteTabSet ...) can be simplified.  
ReqBE.prototype.siteTabGet=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }
  
  var strCql=`
    MATCH (s:Site)
    OPTIONAL MATCH (s)-[:hasPage]->(p:Page)-[:hasRevision]->(:Revision)
    RETURN s.boDefault AS boDefault, s.boTLS AS boTLS, s.name AS idSite, s.name AS siteName, s.www AS www, s.googleAnalyticsTrackingID AS googleAnalyticsTrackingID, s.urlIcon16 AS urlIcon16, s.urlIcon200 AS urlIcon200, s.tCreated AS tCreated, COUNT(p) AS nPage`;

  var Val={};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err) { return {err:err}; }

  var Ou=arrObj2TabNStrCol(records);
  this.mes("Got "+records.length+" entries");
  Ou.boOK=1;
  return {err:null, result:[Ou]};
}
  
ReqBE.prototype.siteTabSet=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }
  var boUpd=inObj.boUpd||false;

  if(boUpd) { 
    var strCql=`
      MATCH (s:Site {name:$nameLC}) 
      SET s.boTLS=$boTLS, s.www=$www, s.googleAnalyticsTrackingID=$googleAnalyticsTrackingID, s.urlIcon16=$urlIcon16, s.urlIcon200=$urlIcon200, s.name=$nameLCNew`;
    var strNameLC=inObj.idSite, strNameLCNew=inObj.siteName.toLowerCase();
  } else {
    var strCql=`
      CREATE (s:Site {name:$nameLC}) 
      SET s.boTLS=$boTLS, s.www=$www, s.googleAnalyticsTrackingID=$googleAnalyticsTrackingID, s.urlIcon16=$urlIcon16, s.urlIcon200=$urlIcon200`;
    var strNameLC=inObj.siteName.toLowerCase(), strNameLCNew=strNameLC;
  }

  var Val={nameLC: strNameLC, nameLCNew: strNameLCNew};  copySome(Val, inObj, ['www', 'googleAnalyticsTrackingID', 'urlIcon16', 'urlIcon200']); Val.boTLS=Boolean(inObj.boTLS);
  //dbNeo4j.cypher({query:strCql, params:Val, raw: true}, function(errT, recordsT){  //, lean: true
     //err=errT; records=recordsT; flow.next(); });  yield;
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);

  var boOK, mestmp;
  if(err && (typeof err=='object') && err.message){boOK=0; mestmp=err.message;}
  else if(err){ this.mesEO(err); return;  }
  else{ boOK=1; mestmp="Done";  }
  
  this.mes(mestmp);
  extend(Ou, {boOK:boOK, idSite:strNameLCNew});   //if(boUpd) Ou.idSiteOld=inObj.idSite;
  return {err:null, result:[Ou]};
}
ReqBE.prototype.siteTabDelete=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }
  
  var strCql=`MATCH (s:Site {name:$nameLC}) DETACH DELETE s RETURN COUNT(s) AS nDelete`;

  var Val={nameLC:inObj.siteName.toLowerCase()};
  var {err, records}= yield* neo4jRun(flow, sessionNeo4j, strCql, Val);
  if(err) { return {err:err}; }
  
  var c=records[0].nDelete, boOK, mestmp; 
  if(c==1) {boOK=1; mestmp="Entry deleted"; } else {boOK=1; mestmp=c+ " entries deleted!?"; }
  this.mes(mestmp);
  Ou.boOK=boOK;      
  return {err:null, result:[Ou]};
}
ReqBE.prototype.siteTabSetDefault=function*(inObj){
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }

  var tx=sessionNeo4j.beginTransaction();
  var Val={nameLC:inObj.idSite.toLowerCase()};
  try{
    var strCql=`MATCH (s:Site) SET s.boDefault=null`;
    var {err, records}= yield* neo4jTxRun(flow, tx, strCql, Val);
    if(err) { throw {mess:'err', err:err}; }
    
    var strCql=`MATCH (s:Site {name:$nameLC}) SET s.boDefault=true`;
    var {err, records}= yield* neo4jTxRun(flow, tx, strCql, Val);
    if(err) { throw {mess:'err', err:err}; }
    var objOut={mess:'OK', err:null};
  } catch(e){
    var objOut=e;
  }finally{
    if(objOut.mess=='err') {
      yield* neo4jRollbackGenerator(flow, tx);
    }else{
      yield* neo4jCommitGenerator(flow, tx);
    }
    if(objOut.mess=='err') { return objOut; }

  }

  this.mes("OK");
  return {err:null, result:[Ou]};
}

////////////////////////////////////////////////////////////////////////
// Uploading
////////////////////////////////////////////////////////////////////////

ReqBE.prototype.uploadAdminServ=function*(inObj){
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }
  var strFileToLoadFolder=path.join(__dirname, '..', 'mmmWikiData', 'FileToLoad'); 
  var err, files;
  fs.readdir(strFileToLoadFolder, function(errT, filesT){ err=errT; files=filesT; flow.next(); }); yield;
  if(err ) { console.log(err); res.out500(err); }

  this.File=Array(files.length);
  for(var i=0;i<files.length;i++){
    var file=files[i], strPath=path.join(strFileToLoadFolder,file);
    var strType=''; if(file.substr(-4)=='.zip') strType='application/zip';
    this.File[i]={name:file, path:strPath,type:strType};
  }
  //files.forEach(file => { console.log(file);  });
  
  var objT=yield* this.uploadAdmin(inObj);
  return objT;
}

ReqBE.prototype.uploadAdmin=function*(inObj){
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }
  var regBoTalk=RegExp('(template_)?talk:');
  var FileOrg=this.File;
  var n=FileOrg.length;
  var tmp=n+" files."; console.log(tmp); this.mes(tmp); 
  var FileTalk=[]; for(var i=FileOrg.length-1;i>=0;i--){ if(regBoTalk.test(FileOrg[i].name)) { var item=mySplice1(FileOrg,i);  FileTalk.push(item);  }  } FileOrg=FileTalk.concat(FileOrg);
  for(var i=0;i<FileOrg.length;i++){
    var fileOrg=FileOrg[i], tmpname=fileOrg.path;
    var err, buf;
    fs.readFile(tmpname, function(errT, bufT) { err=errT; buf=bufT; flow.next(); }); yield;
    if(err){  res.out500(err); return; }
    var dataOrg=buf; 
    if(fileOrg.type=='application/zip' || fileOrg.type=='application/x-zip-compressed'){
       
      var zip=new NodeZip(dataOrg, {base64: false, checkCRC32: true});
      var FileInZip=zip.files;
      
      var tmp="Zip file with "+Object.keys(FileInZip).length+" files."; console.log(tmp); this.mes(tmp);
      var Key=Object.keys(FileInZip), KeyTalk=[];  for(var j=Key.length-1;j>=0;j--){ if(regBoTalk.test(Key[j])) { var item=mySplice1(Key,j);  KeyTalk.push(item); } }  Key=KeyTalk.concat(Key);  
      //for(var fileName in File){
      for(var j=0;j<Key.length;j++){
        var fileName=Key[j];
        var fileInZip=FileInZip[fileName];
        var Match=RegExp('\\.(\\w{1,3})$').exec(fileName);
        var type=Match[1].toLowerCase(), bufT=new Buffer(fileInZip._data,'binary');//b.toString();

        console.log(j+'/'+Key.length+' '+fileName+' '+bufT.length);
        yield* this.storeUploadedFile.call(this,fileName,type,bufT);  
      } 

    } else {  
      var fileName=fileOrg.name;
      var Match=RegExp('\\.(\\w{1,4})$').exec(fileName);
      var type=Match[1].toLowerCase();
 
      console.log(i+'/'+FileOrg.length+' '+fileName+' '+dataOrg.length);
      yield* this.storeUploadedFile.call(this,fileName,type,dataOrg);  
    } 
  }
  return {err:null, result:[0]};
}

//regTalkOrTemplate=RegExp("(template_)?talk");

ReqBE.prototype.storeUploadedFile=function*(fileName,type,data){
  var req=this.req, res=this.res;
  var regImg=RegExp("^(png|jpeg|jpg|gif|svg)$"), regVid=RegExp('^(mp4|ogg|webm)$');
  var flow=req.flow;
  
  if(type=='txt'){
    //fileName=fileName.replace(RegExp('(talk|template|template_talk) ','i'),'$1:');   

    var strEditText=data.toString();

    //console.log(fileName+', '+strEditText.length);
    console.time('dbOperations');
    
        // saveWhenUploading
    var tx=sessionNeo4j.beginTransaction();
    var objArg={};   copySome(objArg, req, ['boTLS', 'www']);     extend(objArg, {fileName:fileName, strEditText:strEditText});
    var objT=yield* saveWhenUploadingNeo(flow, tx, objArg);
    if(objT.mess=='err') {
      yield* neo4jRollbackGenerator(flow, tx);
      this.mesEO('err'); return;
    }else{
      yield* neo4jCommitGenerator(flow, tx);
    }

    var mess=objT.mess;
    if(mess!='OK') {console.log(mess); debugger; return; }

    console.timeEnd('dbOperations');

  }else if(regImg.test(type)){
    
      // Get original image size from data 
    var err, value;
    var semY=0, semCB=0; gm(data).size(function(errT, valueT){ err=errT; value=valueT; if(semY) flow.next(); semCB=1;   });  if(!semCB) { semY=1; yield;}
    if(err){this.mesEO(err);  return; }
    var width=value.width, height=value.height;
    
    var tx=sessionNeo4j.beginTransaction();
    
    var objArg={};   copySome(objArg, req, ['boTLS', 'www']);     extend(objArg, {strName:fileName, data:data, width:width, height:height, boOther:false});
    var objT=yield* storeImageNeo(flow, tx, objArg);
    if(objT.mess=='err') {
      yield* neo4jRollbackGenerator(flow, tx);
      this.mesEO('err'); return;
    }else{
      yield* neo4jCommitGenerator(flow, tx);
    }
  }else if(regVid.test(type)){ 
    var eTag=md5(data);
    var sql="CALL "+strDBPrefix+"storeVideo(?,?,?)";
    var Val=[fileName,data,eTag];
    var objT=yield* myQueryGen(flow, sql, Val, mysqlPool), err=objT.err; if(err) {  this.mesEO(err); return; }   var results=objT.results;
  }
  else{ this.mes("Unrecognized file type: "+type); return {err:null, result:[Ou]}; }

  //process.stdout.write("*");
}


ReqBE.prototype.uploadUser=function*(inObj){
  var self=this, req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  var regImg=RegExp("^(png|jpeg|jpg|gif|svg)$"), regVid=RegExp('^(mp4|ogg|webm)$');

  var redisVar=req.sessionID+'_captcha';
  var tmp=yield* wrapRedisSendCommand.call(req, 'get',[redisVar]);
  if(this.captchaIn!=tmp) { Ou.strMessage='Wrong captcha'; return {err:null, result:[Ou]};}
  var File=this.File;
  var n=File.length; this.mes("nFile: "+n);

  
  var file=File[0], tmpname=file.path, fileName=file.name; if(this.strName.length) fileName=this.strName;
  var Match=RegExp('\\.(\\w{1,3})$').exec(fileName); 
  if(!Match){ Ou.strMessage="The file name should be in the form xxxx.xxx"; return {err:null, result:[Ou]}; }
  var type=Match[1].toLowerCase(), err, buf;
  fs.readFile(tmpname, function(errT, bufT) { err=errT; buf=bufT; flow.next(); });  yield;
  if(err){  this.mesEO(err); return; }
  var data=buf;
  if(data.length==0){ this.mes("data.length==0"); return {err:null, result:[Ou]}; }

  if(regImg.test(type)){
          // autoOrient
    var myCollector=concat(function(buf){      data=buf;  flow.next();     }), boDoExit=0; 
    var streamImg=gm(data).autoOrient().stream(function streamOut(err, stdout, stderr) {
      if(err){ boDoExit=1; self.mesEO(err); return; } 
      stdout.pipe(myCollector); 
    });
    yield;
    if(boDoExit==1) { return; }  

    var eTag=md5(data);

      // Get original image size from data 
    var err, value;
    gm(data).size(function(errT, valueT){ err=errT; value=valueT; flow.next();   });  yield;
    if(err){this.mesEO(err);  return; }
    var width=value.width, height=value.height;
    
 
      // Call storeImageNeo 
    var tx=sessionNeo4j.beginTransaction();
    
    var objArg={};   copySome(objArg, req, ['boTLS', 'www']);     extend(objArg, {strName:fileName, data:data, width:width, height:height, boOther:true});
    var objT=yield* storeImageNeo(flow, tx, objArg);
    if(objT.mess=='err') {
      yield* neo4jRollbackGenerator(flow, tx);
      this.mesEO('err'); return;
    }else{
      yield* neo4jCommitGenerator(flow, tx);
    }
    
    
    
  }else if(regVid.test(type)){ 
    var eTag=md5(data);
    var sql="CALL "+strDBPrefix+"storeVideo(?,?,?)";
    var Val=[fileName,data,eTag];
    var objT=yield* myQueryGen(flow, sql, Val, mysqlPool), err=objT.err; if(err) {  this.mesEO(err); return; }   var results=objT.results;
  }
  else{ Ou.strMessage="Unrecognized file type: "+type; return {err:null, result:[Ou]}; }

  Ou.strMessage="Done";
  return {err:null, result:[Ou]};
}







