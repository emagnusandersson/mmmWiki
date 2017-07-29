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
  var jsonInput;
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
      jsonInput=fields.vec;
      

    }else{
      var buf, myConcat=concat(function(bufT){ buf=bufT; flow.next();  });    req.pipe(myConcat);    yield;
      jsonInput=buf.toString();
    }
  } else if(req.method=='GET'){
    var objUrl=url.parse(req.url), qs=objUrl.query||''; jsonInput=urldecode(qs);
  }
  
  try{ var beArr=JSON.parse(jsonInput); }catch(e){ console.log(e); res.out500('Error in JSON.parse, '+e); return; }
 
 
  var redisVar=req.sessionID+'_Main', strTmp=yield* wrapRedisSendCommand.call(req, 'set',[redisVar,1]);   var tmp=yield* wrapRedisSendCommand.call(req, 'expire',[redisVar,maxViewUnactivityTime]);

      // Conditionally push deadlines forward
  this.boVLoggedIn=yield* wrapRedisSendCommand.call(req, 'expire',[req.sessionID+'_viewTimer',maxViewUnactivityTime]);
  this.boALoggedIn=yield* wrapRedisSendCommand.call(req, 'expire',[req.sessionID+'_adminTimer',maxAdminUnactivityTime]);
 

  res.setHeader("Content-type", "application/json");


    // Remove the beArr[i][0] values that are not functions
  var CSRFIn; this.tModBrowser=new Date(0); 
  for(var i=beArr.length-1;i>=0;i--){ 
    var row=beArr[i];
    if(row[0]=='page') {this.queredPage=row[1]; array_removeInd(beArr,i);}
    else if(row[0]=='tMod') {this.tModBrowser=new Date(Number(row[1])*1000); array_removeInd(beArr,i);}
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
    var [func,inObj]=Func[k];
    var objT=yield* func.call(this, inObj);
    if(typeof objT=='undefined' || objT.err || objT instanceof(Error)) {
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
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) {this.mesO('not logged in (as Administrator)'); return;}
  
  if('File' in inObj && inObj.File instanceof Array && inObj.File.length) var File=inObj.File; else {var tmp='chmod: no files'; this.mesEO(tmp); return; }   
  var strQ=array_fill(File.length, "?").join(', ');
  var tmpBit; if('boOR' in inObj) tmpBit='boOR'; else if('boOW' in inObj) tmpBit='boOW'; else if('boSiteMap' in inObj) tmpBit='boSiteMap'; 
  var Sql=[],Val=[inObj[tmpBit]];
  Sql.push("UPDATE "+pageTab+" SET "+tmpBit+"=? WHERE idPage IN ("+strQ+");");
  array_mergeM(Val,File);
  
  array_mergeM(Sql, array_fill(File.length, "CALL "+strDBPrefix+"markStale(?);"));
  array_mergeM(Val,File); 
  var sql=Sql.join('\n');
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
  this.mes('chmod');
  GRet[tmpBit]=inObj[tmpBit]; // Sending boOW/boSiteMap  back will trigger closing/opening of the save/preview buttons
  return {err:null, result:[Ou]};
}
ReqBE.prototype.myChModImage=function*(inObj){   
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) {this.mesO('not logged in (as Administrator)'); return;}
  
  if('File' in inObj && inObj.File instanceof Array && inObj.File.length) var File=inObj.File; else {var tmp='chmodImage: no files'; this.mesEO(tmp); return; }   
  var strQ=array_fill(File.length, "?").join(', ');
  var Sql=[], Val=[inObj.boOther];
  Sql.push("UPDATE "+imageTab+" SET boOther=? WHERE idImage IN ("+strQ+");");
  array_mergeM(Val,File);
  
  var sql=Sql.join('\n');
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
  this.mes('chmodImage');
  GRet.boOther=inObj.boOther; // Sending boOther  back will trigger closing/opening of the save/preview buttons
  return {err:null, result:[Ou]};
}

ReqBE.prototype.deletePage=function*(inObj){   
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) {this.mesO('not logged in (as Administrator)'); return;}
  
  if('File' in inObj && inObj.File instanceof Array && inObj.File.length) var File=inObj.File; else {var tmp='deletePage: no files'; this.mesEO(tmp); return; }
  var sql=array_fill(File.length, "CALL "+strDBPrefix+"deletePageID(?);").join('\n'); 
  var Val=File;
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
  this.mes('pages deleted');
  return {err:null, result:[Ou]};
}
  
ReqBE.prototype.deleteImage=function*(inObj){   
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) {this.mesO('not logged in (as Administrator)'); return;}

  if('File' in inObj && inObj.File instanceof Array && inObj.File.length) var File=inObj.File; else {var tmp='deleteImage: no files'; this.mesEO(tmp); return; }
  var sql=array_fill(File.length, "CALL "+strDBPrefix+"deleteImage(?);").join('\n');
  var Val=File;
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; } 
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

  //this.tModCache=UTC2JS(  bootTime.toUnix()  );
  //this.tModCache=new Date(bootTime.toUnix()*1000);
  this.tMod=new Date(0);
  this.tModCache=new Date(0);
  this.CSRFCode='';  // If Private then No CSRFCode since the page is going to be cacheable (look the same each time)
  if(typeof inObj=='object' && 'version' in inObj) {  this.version=inObj.version;  this.rev=this.version-1 } else {  this.version=NaN; this.rev=-1; }
  this.eTagIn=''; this.requesterCacheTime=new Date(0);
  if(req.method=='GET') {this.eTagIn=getETag(req.headers); this.requesterCacheTime=getRequesterTime(req.headers); }
  //if(bootTime>this.requesterCacheTime) this.requesterCacheTime=new Date(0);
  extend(this,{strHtmlText:'', boTalkExist:0, strEditText:'', arrVersionCompared:[null,1], matVersion:[], objTemplateE:{}}); 
  this.boFront=0;


    // getInfoNData
  var objT=yield* getInfoNData.call(this); if(objT.mess=='err') { return objT;  }
  var rowA=objT.row;

  var mess=rowA.mess;
  if(mess=='IwwwNotFound'){ res.out404('No wiki there'); return;   }
  else if(mess=='304') { res.out304(); return; }
  else if(mess=='noSuchRev') {res.out500(mess); return; }
  else if(mess=='noSuchPage'){ res.out404(); return;   }
  else if(mess=='serverCacheStale' || mess=='serverCacheOK'){
    copySome(this,rowA,['idPage', 'rev', 'version', 'eTag', 'boOR', 'boOW', 'boSiteMap', 'talkPage', 'boTalkExist', 'tMod', 'tModCache', 'strEditText']);
    var boValidServerCache=mess=='serverCacheOK'; 
    //this.tModCache=new Date(Math.max(this.tModCache, bootTime)); 
    //this.tMod=new Date(this.tMod); 
    //this.tModCache=new Date(this.tModCache); 
  
    var tmp=this.boOR?'':', private';
    res.setHeader("Cache-Control", "must-revalidate"+tmp);  res.setHeader('Last-Modified',this.tModCache.toUTCString());  res.setHeader('ETag',this.eTag);
    
    //this.matVersion=makeMatVersion.call(this);
    this.matVersion=makeMatVersion(this.Version);
    this.arrVersionCompared=[null,this.rev+1];

    if(!boValidServerCache){

        // parse
      var objT=yield* parse.call(this); if(objT.mess=='err') return objT;

          // setNewCacheSQL
      var {sql, Val, nEndingResults}=createSetNewCacheSQL(req.wwwSite, queredPage, this.rev, this.strHtmlText, this.eTag, this.arrSub, this.StrSubImage);
      var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
      var iRowLast=results.length-nEndingResults-1;
      var mess=results[iRowLast][0].mess;//if(typeof results[iRowLast][0]=='object')

    } else {
      this.strHtmlText=rowA.strHtmlText;
    }
  }
  else { res.out500('mess='+mess); return; }
  //'redir', 'noSuchPage', 'redirCase', 'private', '304', 'serverCacheStale', 'serverCacheOK'
  //this.myAsyncPageLoad.Func.push(         thisChangedWArg(this.pageLoadC, this)        ); 
  //this.pageLoadC.call(this);
  copySome(GRet,this,['idPage', 'boOR', 'boOW', 'boSiteMap', 'tMod', 'tModCache', 'boTalkExist', 'strEditText', 'strHtmlText', 'matVersion', 'objTemplateE']);
  extend(GRet,{strDiffText:'', arrVersionCompared:this.arrVersionCompared});
  return {err:null, result:[Ou]};
}


ReqBE.prototype.pageCompare=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  this.versionOld=arr_min(inObj.arrVersionCompared);  this.version=arr_max(inObj.arrVersionCompared); 
  this.versionOld=Math.max(1,this.versionOld);  this.version=Math.max(1,this.version);
  if(this.version==this.versionOld) {this.mesO('Same version'); return;}
  this.eTagIn=''; this.requesterCacheTime=0;
  this.rev=this.versionOld-1;

  this.boFront=0; this.eTagIn=''; this.requesterCacheTime=0;

      // getInfoNData Old
  var objT=yield* getInfoNData.call(this); if(objT.mess=='err') { return objT; }
  var rowA=objT.row;
  
  var nVersion=this.Version.length; 
  if(nVersion==0){this.mesO('Page does not exist'); return;} 
  if(!rowA.boOR && !this.boVLoggedIn){this.mesO('Not logged in'); return;}

  this.strEditTextOld=rowA.strEditText;

      // getInfoNData 
  this.rev=this.version-1;
  var objT=yield* getInfoNData.call(this); if(objT.mess=='err') { return objT;  }
  var rowA=objT.row;
  
  copySome(this,rowA,['idPage', 'rev', 'version', 'eTag', 'boOR', 'boOW', 'boSiteMap', 'boTalkExist', 'tMod', 'tModCache', 'strEditText']);
  
    // parse
  var objT=yield* parse.call(this); if(objT.mess=='err') return objT;

  this.strEditText=rowA.strEditText;
  this.strHtmlText=rowA.strHtmlText;

  this.strDiffText='';
  if(this.versionOld!==null){
    this.strDiffText=myDiff(this.strEditTextOld,this.strEditText);
    if(this.strDiffText.length==0) this.strDiffText='(equal)';
    this.mes("v "+this.versionOld+" vs "+this.version);
  } else this.mes("v "+this.version);

  //this.matVersion=makeMatVersion.call(this);
  this.matVersion=makeMatVersion(this.Version);
  
  copySome(GRet,this,['idPage', 'boOR', 'boOW', 'boSiteMap', 'tMod', 'tModCache', 'boTalkExist', 'strEditText', 'strHtmlText', 'matVersion', 'objTemplateE']);
  extend(GRet,{strDiffText:this.strDiffText, arrVersionCompared:[this.versionOld,this.version]});
  return {err:null, result:[0]};
}


ReqBE.prototype.getPreview=function*(inObj){ 
  var req=this.req, res=this.res;
  var Ou={}, GRet=this.GRet, flow=req.flow;
  this.strEditText=inObj.newcontent;
  
  this.boOW==1;

    // parse
  var objT=yield* parse.call(this); if(objT.mess=='err') return objT;

  this.mes('Preview');
  GRet.strHtmlText=this.strHtmlText;
  GRet.strEditText=this.strEditText;
  GRet.objTemplateE=this.objTemplateE;
  GRet.strDiffText='';
  
  return {err:null, result:[0]};
} 


ReqBE.prototype.saveByReplace=function*(inObj){   
  var req=this.req, res=this.res;
  var Ou={}, GRet=this.GRet, flow=req.flow;

    // getInfo
  var objT=yield* getInfo.call(this); if(objT.mess=='err') { return objT;  }
  var rowA=objT.row;
  
  if(rowA.mess=='IwwwNotFound'){ res.out404('No wiki there'); return;   }
  else if(rowA.mess=='pageExist'){
    copySome(this,rowA,['boOR', 'boOW', 'boSiteMap', 'tMod', 'tModCache']);
    if(!this.boOR && !this.boVLoggedIn) {this.mesO('Not logged in'); return;}
    if(!this.boALoggedIn) {this.mesO('Not logged in as admin'); return;} 
    if(this.tModBrowser<this.tMod) { this.mesO("tModBrowser (from your action) ("+this.tModBrowser+") < tMod db ("+this.tMod+"), "+messPreventBecauseOfNewerVersions); return; }
  }else if(rowA.mess=='noSuchPage'){
    extend(this,{boOW:1,boOR:1,boSiteMap:1});  
  }
  
  extend(this,{strEditText:inObj.newcontent});

    // parse
  var objT=yield* parse.call(this); if(objT.mess=='err') return objT;
  
      // saveByReplace
  var {sql, Val, nEndingResults}=createSaveByReplaceSQL('', req.wwwSite, this.queredPage, this.strEditText, this.strHtmlText, this.eTag, this.arrSub, this.StrSubImage); 
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
  var iRowLast=results.length-nEndingResults-1;
  var mess=results[iRowLast][0].mess;//if(typeof results[iRowLast][0]=='object')
  
      // getInfoNData
  this.boFront=0; this.rev=0; this.eTagIn='', this.requesterCacheTime=0;
  
  var objT=yield* getInfoNData.call(this); if(objT.mess=='err') { return objT;  }
  var rowA=objT.row;
  
  if(this.strEditText.length>0){
    copySome(this, rowA, ['idPage', 'rev', 'version', 'eTag', 'boOR', 'boOW', 'boSiteMap', 'boTalkExist', 'tMod', 'tModCache', 'strEditText']);
    //this.matVersion=makeMatVersion.call(this);
    this.matVersion=makeMatVersion(this.Version);
    this.mes("Page overwritten");
  } else {
    extend(this, {idPage:NaN, rev:0, version:1, eTag:'', boOR:1, boOW:1, boSiteMap:1, boTalkExist:0, tMod:new Date(0), tModCache:new Date(0), strPageHtml:'', objTemplateE:{}});
    this.mes("No content, Page deleted");
  }
  
  //boPageBUNeeded=true; 
  
  copySome(GRet,this,['idPage', 'boOR', 'boOW', 'boSiteMap', 'tMod', 'tModCache', 'boTalkExist', 'strEditText', 'strHtmlText', 'matVersion', 'objTemplateE']);
  extend(GRet,{strDiffText:'', arrVersionCompared:[null,1]});
  return {err:null, result:[0]};
}


ReqBE.prototype.saveByAdd=function*(inObj){  
  var req=this.req, res=this.res;
  var Ou={}, GRet=this.GRet, flow=req.flow;

    // getInfo
  var objT=yield* getInfo.call(this); if(objT.mess=='err') { return objT;  }
  var rowA=objT.row;

  if(rowA.mess=='IwwwNotFound'){ res.out404('No wiki there'); return;   }
  else if(rowA.mess=='pageExist'){
    copySome(this,rowA,['boOR', 'boOW', 'boSiteMap', 'tMod', 'tModCache']);
    if(!this.boOR && !this.boVLoggedIn) {this.mesO('Not logged in'); return;}
    if(this.tModBrowser<this.tMod) { this.mesO("tModBrowser (from your action) ("+this.tModBrowser+") < tMod db ("+this.tMod+"), "+messPreventBecauseOfNewerVersions); return; }
  }else if(rowA.mess=='noSuchPage'){
    extend(this,{boOW:1,boOR:1,boSiteMap:1});  
  }
 if(this.boOW==0) {this.mesO('Not authorized'); return;} 
  copySome(this,inObj,['summary', 'signature']);    this.strEditText=inObj.newcontent;
    
    // parse
  var objT=yield* parse.call(this); if(objT.mess=='err') return objT;

      // saveByAddSQL
  var {sql, Val, nEndingResults}=createSaveByAddSQL(req.wwwSite, this.queredPage, this.summary, this.signature, this.strEditText, this.strHtmlText, this.eTag, this.arrSub, this.StrSubImage);
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
  var iRowLast=results.length-nEndingResults-1;
  var mess=results[iRowLast][0].mess;//if(typeof results[iRowLast][0]=='object')
  

      // getInfoNData
  this.boFront=0; this.rev=-1; this.eTagIn=''; this.requesterCacheTime=0;
  
  var objT=yield* getInfoNData.call(this); if(objT.mess=='err') { return objT;  }
  var rowA=objT.row;

  copySome(this,rowA,['idPage', 'rev', 'version', 'eTag', 'boOR', 'boOW', 'boSiteMap', 'boTalkExist', 'tMod', 'tModCache', 'strEditText']);
  //this.matVersion=makeMatVersion.call(this);
  this.matVersion=makeMatVersion(this.Version);
  
  this.mes("New version added");
  if(objOthersActivity) { objOthersActivity.nEdit++; objOthersActivity.pageName=this.siteName+':'+this.queredPage; }

  copySome(GRet,this,['idPage', 'boOR', 'boOW', 'boSiteMap', 'tMod', 'tModCache', 'boTalkExist', 'strEditText', 'strHtmlText', 'matVersion', 'objTemplateE']);
  extend(GRet,{strDiffText:'', arrVersionCompared:[null,this.matVersion.length]});

  return {err:null, result:[0]};
}


ReqBE.prototype.renamePage=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }
  var sql="UPDATE "+pageTab+" SET pageName=? WHERE idPage=?";
  var strNewName=inObj.strNewName.replace(RegExp(' ','g'),'_');
  var Val=[strNewName, inObj.id];
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
  var c=results.affectedRows, boOK, mestmp; 
  if(c==1) { boOK=1; mestmp="1 page renamed"; } else {boOK=0; mestmp=c+" pages renamed!?"; }
  this.mes(mestmp);
  Ou.boOK=boOK;      
  return {err:null, result:[Ou]};
}

ReqBE.prototype.renameImage=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }
  var sql="UPDATE "+imageTab+" SET imageName=? WHERE idImage=?";
  var Val=[inObj.strNewName, inObj.id];
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
  var c=results.affectedRows, boOK, mestmp; 
  if(c==1) { boOK=1; mestmp="1 image renamed"; } else {boOK=0; mestmp=c+" images renamed!?"; }
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
  var tmp=setUpCond(undefined, StrOrderFiltPage, PropPage, inObj);
  copySome(this,tmp,['strCol', 'Where']);
  return {err:null, result:[Ou]};
}
 
ReqBE.prototype.getParent=function*(inObj){
  var req=this.req, res=this.res;
  //var Ou={}, sql="SELECT p.pageName FROM "+pageTab+" p JOIN "+subTab+" s ON s.idPage=p.idPage WHERE s.pageName=?;",   Val=[inObj.pageName];
  var Ou={}, sql="SELECT p.boTLS, p.www, p.idPage, p.pageName FROM "+pageWWWView+" p JOIN "+subTab+" s ON s.idPage=p.idPage JOIN "+pageTab+" c ON s.pageName=c.pageName WHERE c.idPage=?;",   Val=[inObj.idPage];
  var flow=req.flow
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
  Ou=arrObj2TabNStrCol(results);
  return {err:null, result:[Ou]};
}

ReqBE.prototype.getParentOfImage=function*(inObj){
  var req=this.req, res=this.res;
  //var Ou={}, sql="SELECT p.pageName FROM "+pageTab+" p JOIN "+subImageTab+" s ON s.idPage=p.idPage WHERE s.imageName=?;",   Val=[inObj.imageName];
  var Ou={}, sql="SELECT p.boTLS, p.www, p.idPage, p.pageName FROM "+pageWWWView+" p JOIN "+subImageTab+" s ON s.idPage=p.idPage JOIN "+imageTab+" c ON s.imageName=c.imageName  WHERE c.idImage=?;",   Val=[inObj.idImage];
  var flow=req.flow;
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
  Ou=arrObj2TabNStrCol(results);
  return {err:null, result:[Ou]};
}

ReqBE.prototype.getSingleParentExtraStuff=function*(inObj){
  var req=this.req, res=this.res;
  var Ou={}, flow=req.flow, Sql=[], Val=[];
  if(inObj.idPage===null){
    Sql.push("SELECT COUNT(*) AS nSub FROM "+pageTab+" p LEFT JOIN "+subTab+" s ON s.pageName=p.pageName AND s.idSite=p.idSite WHERE s.pageName IS NULL;");   
    Sql.push("SELECT COUNT(*) AS nImage FROM "+imageTab+" p LEFT JOIN "+subImageTab+" s ON s.imageName=p.imageName WHERE s.imageName IS NULL;"); 
    //Sql.push("SELECT p.siteName AS siteName FROM "+pageView+" p WHERE p.pageName=?;"); 

  } else {
    Sql.push("SELECT COUNT(*) AS nSub FROM "+pageTab+" p JOIN "+subTab+" s ON s.idPage=p.idPage WHERE p.idPage=?;");   
    Sql.push("SELECT COUNT(*) AS nImage FROM "+pageTab+" p JOIN "+subImageTab+" s ON s.idPage=p.idPage WHERE p.idPage=?;"); 
    Sql.push("SELECT boTLS, siteName, www, pageName FROM "+pageWWWView+" p WHERE p.idPage=?;"); 
    Sql.push("SELECT COUNT(*) AS nSame FROM "+pageTab+" pA JOIN "+pageTab+" pB ON pA.pageName=pB.pageName WHERE pB.idPage=?;"); // nSame is >1 if multiple sites have the same pageName 
    Val.push(inObj.idPage, inObj.idPage, inObj.idPage, inObj.idPage);
  }  
  var sql=Sql.join('\n');
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
  Ou.nSub=results[0][0].nSub;
  Ou.nImage=results[1][0].nImage;
  if(inObj.idPage!==null) { extend(Ou, results[2][0]); extend(Ou, results[3][0]); }
  return {err:null, result:[Ou]};
}


ReqBE.prototype.getPageList=function*(inObj) {
  var req=this.req, res=this.res;
  var Sql=[], flow=req.flow;
  //var sql="SELECT pageName, boOR, boOW, boSiteMap, UNIX_TIMESTAMP(v.tMod) AS tMod, lastRev, boOther, p.idPage, idFile FROM "+pageTab+" p JOIN "+versionTab+" v ON p.idPage=v.idPage AND p.lastRev=v.rev";
  var tmpCond=array_filter(this.Where), strCond=''; if(tmpCond.length) strCond='WHERE '+tmpCond.join(' AND ');
  //Sql.push("SELECT SQL_CALC_FOUND_ROWS p.pageName AS pageName, p.boOR AS boOR, p.boOW AS boOW, p.boSiteMap AS boSiteMap, UNIX_TIMESTAMP(v.tMod) AS tMod, p.lastRev, v.boOther AS boOther, p.idPage AS idPage, v.idFile AS idFile, v.size AS size, COUNT(DISTINCT sc.pageName) AS nChild, COUNT(DISTINCT sI.imageName) AS nImage  FROM "+strTableRefPage+" "+strCond+" GROUP BY pageName;"); 
  //Sql.push("SELECT SQL_CALC_FOUND_ROWS p.pageName AS pageName, p.boOR AS boOR, p.boOW AS boOW, p.boSiteMap AS boSiteMap, UNIX_TIMESTAMP(v.tMod) AS tMod, p.lastRev, v.boOther AS boOther, p.idPage AS idPage, v.idFile AS idFile, v.size AS size, COUNT(DISTINCT sc.pageName) AS nChild, COUNT(DISTINCT sI.imageName) AS nImage, COUNT(DISTINCT pp.pageName) AS nParent, pp.pageName AS nameParent  FROM "+strTableRefPage+" "+strCond+" GROUP BY pageName;"); 
  //Sql.push("SELECT SQL_CALC_FOUND_ROWS p.pageName AS pageName, p.boOR AS boOR, p.boOW AS boOW, p.boSiteMap AS boSiteMap, UNIX_TIMESTAMP(v.tMod) AS tMod, p.lastRev, v.boOther AS boOther, p.idPage AS idPage, v.idFile AS idFile, v.size AS size, COUNT(DISTINCT sc.pageName) AS nChild, COUNT(DISTINCT sI.imageName) AS nImage, COUNT(DISTINCT sParCount.idPage) AS nParent, pParCount.pageName AS nameParent  FROM "+strTableRefPage+" "+strCond+" GROUP BY pageName;"); 
  //Sql.push("SELECT SQL_CALC_FOUND_ROWS p.pageName AS pageName, p.boOR AS boOR, p.boOW AS boOW, p.boSiteMap AS boSiteMap, UNIX_TIMESTAMP(p.tMod) AS tMod, p.lastRev, p.boOther AS boOther, p.idPage AS idPage, p.idFile AS idFile, p.size AS size, COUNT(DISTINCT sc.pageName) AS nChild, COUNT(DISTINCT sI.imageName) AS nImage, COUNT(DISTINCT sParCount.idPage) AS nParent, pParCount.pageName AS nameParent  FROM "+strTableRefPage+" "+strCond+" GROUP BY pageName;"); 
//, pParCount.siteName AS siteParent
  //Sql.push("SELECT SQL_CALC_FOUND_ROWS p.boTLS, p.siteName AS siteName, p.www AS www, p.pageName AS pageName, p.boOR AS boOR, p.boOW AS boOW, p.boSiteMap AS boSiteMap, UNIX_TIMESTAMP(p.tMod) AS tMod, p.lastRev, p.boOther AS boOther, p.idPage AS idPage, p.idFile AS idFile, p.size AS size, COUNT(DISTINCT sc.idSite, sc.pageName) AS nChild, COUNT(DISTINCT sI.imageName) AS nImage, COUNT(DISTINCT sParCount.idPage) AS nParent, pParCount.idPage AS idParent, pParCount.pageName AS nameParent  FROM "+strTableRefPage+" "+strCond+" GROUP BY siteName, pageName;"); 
  //Sql.push("SELECT SQL_CALC_FOUND_ROWS p.boTLS, p.siteName AS siteName, p.www AS www, p.pageName AS pageName, p.boOR AS boOR, p.boOW AS boOW, p.boSiteMap AS boSiteMap, UNIX_TIMESTAMP(p.tMod) AS tMod, p.lastRev, p.boOther AS boOther, p.idPage AS idPage, p.idFile AS idFile, p.size AS size, p.nChild AS nChild, p.nImage AS nImage, COUNT(DISTINCT sParCount.idPage) AS nParent, pParCount.idPage AS idParent, pParCount.pageName AS nameParent  FROM "+strTableRefPage+" "+strCond+" GROUP BY siteName, pageName;"); 

  Sql.push("SELECT SQL_CALC_FOUND_ROWS p.boTLS, p.siteName AS siteName, p.www AS www, p.pageName AS pageName, p.boOR AS boOR, p.boOW AS boOW, p.boSiteMap AS boSiteMap, UNIX_TIMESTAMP(p.tMod) AS tMod, p.lastRev, p.boOther AS boOther, p.idPage AS idPage, p.idFile AS idFile, p.size AS size, p.nChild AS nChild, p.nImage AS nImage, np.nParent, pp.idPage AS idParent, pp.pageName AS nameParent  FROM "+strTableRefPage+" "+strCond+" GROUP BY siteName, pageName;"); 

  Sql.push("SELECT FOUND_ROWS() AS n;"); // nFound
  Sql.push("SELECT count(idPage) AS n FROM "+pageTab+";"); // nUnFiltered
  var sql=Sql.join('\n'),   Val=[]; 
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
  var Ou=arrObj2TabNStrCol(results[0]);
  Ou.NFilt=[results[1][0].n, results[2][0].n];
  return {err:null, result:[Ou]};
}

ReqBE.prototype.getPageHist=function*(inObj){
  var req=this.req, res=this.res;
  var Ou={}, flow=req.flow
  //var strTableRefCount=pageTab+' p';
  var arg={strTableRef:strTableRefPageHist, Ou:Ou, WhereExtra:[], Prop:PropPage, StrOrderFilt:StrOrderFiltPage};  
  copySome(arg, this, ['Where']); arg.strDBPrefix=strDBPrefix;
  
  var {err, Hist}=yield* getHist(flow, mysqlPool, arg); if(err) {  this.mesEO(err); return; };  Ou.Hist=Hist;

    // Removing null parent
  var iColParent=KeyColPageFlip.parent, arrTmpA=Ou.Hist[iColParent], arrTmpB=[];
  for(var i=0;i<arrTmpA.length;i++){var tmp=arrTmpA[i], boKeep=(tmp instanceof Array) && (typeof tmp[0]==='number'); if(boKeep) arrTmpB.push(tmp[0]);  }

    // Fetching the names of the parents
  var len=arrTmpB.length;
  if(len){
    var sql="SELECT idPage, boTLS, www, siteName, pageName FROM "+pageWWWView+" WHERE idPage IN ("+arrTmpB.join(', ')+")",  Val=[];
    var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
    Ou.ParentName=arrObj2TabNStrCol(results);
  }

  return {err:null, result:[Ou]};
}


ReqBE.prototype.setUpImageListCond=function*(inObj){
  var Ou={};
  var tmp=setUpCond(undefined, StrOrderFiltImage, PropImage, inObj);
  copySome(this,tmp,['strCol', 'Where']);
  return {err:null, result:[Ou]};
}

ReqBE.prototype.getImageList=function*(inObj) {
  var req=this.req, res=this.res;
  var Sql=[], flow=req.flow;
  //var sql="SELECT imageName, UNIX_TIMESTAMP(created) AS created, boOther, idImage, idFile FROM "+imageTab+"";
  var tmpCond=array_filter(this.Where), strCond=''; if(tmpCond.length) strCond='WHERE '+tmpCond.join(' AND ');
  //Sql.push("SELECT SQL_CALC_FOUND_ROWS i.imageName AS imageName, UNIX_TIMESTAMP(i.created) AS created, i.boOther AS boOther, i.idImage AS idImage, i.idFile AS idFile, i.size AS size  FROM "+strTableRefImage+" "+strCond+" GROUP BY imageName;"); 
  //Sql.push("SELECT SQL_CALC_FOUND_ROWS i.imageName AS imageName, UNIX_TIMESTAMP(i.created) AS created, i.boOther AS boOther, i.idImage AS idImage, i.idFile AS idFile, i.size AS size, COUNT(DISTINCT pp.pageName) AS nParent, pp.pageName AS nameParent  FROM "+strTableRefImage+" "+strCond+" GROUP BY imageName;"); 
  //Sql.push("SELECT SQL_CALC_FOUND_ROWS i.imageName AS imageName, UNIX_TIMESTAMP(i.created) AS created, i.boOther AS boOther, i.idImage AS idImage, i.idFile AS idFile, i.size AS size, COUNT(DISTINCT sParCount.idPage) AS nParent, pParCount.pageName AS nameParent  FROM "+strTableRefImage+" "+strCond+" GROUP BY imageName;"); 
// , pParCount.siteName AS siteParent
  //Sql.push("SELECT SQL_CALC_FOUND_ROWS i.imageName AS imageName, UNIX_TIMESTAMP(i.created) AS created, i.boOther AS boOther, i.idImage AS idImage, i.idFile AS idFile, i.size AS size, COUNT(DISTINCT sParCount.idPage) AS nParent, pParCount.idPage AS idParent, pParCount.pageName AS nameParent  FROM "+strTableRefImage+" "+strCond+" GROUP BY imageName;"); 
  Sql.push("SELECT SQL_CALC_FOUND_ROWS i.imageName AS imageName, UNIX_TIMESTAMP(i.created) AS created, i.boOther AS boOther, i.idImage AS idImage, i.idFile AS idFile, i.size AS size, np.nParent, pp.idPage AS idParent, pp.pageName AS nameParent  FROM "+strTableRefImage+" "+strCond+" GROUP BY imageName;"); 

  Sql.push("SELECT FOUND_ROWS() AS n;"); // nFound
  Sql.push("SELECT count(idImage) AS n FROM "+imageTab+";"); // nUnFiltered
  var sql=Sql.join('\n'),   Val=[]; 
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
  var Ou=arrObj2TabNStrCol(results[0]);
  Ou.NFilt=[results[1][0].n, results[2][0].n];
  return {err:null, result:[Ou]};
}

ReqBE.prototype.getImageHist=function*(inObj){
  var req=this.req, res=this.res;
  var Ou={}, flow=req.flow
  //var arg={strTableRef:strTableRefImage, Ou:Ou, WhereExtra:[], Prop:PropImage, StrOrderFilt:StrOrderFiltImage};
  var arg={strTableRef:strTableRefImageHist, Ou:Ou, WhereExtra:[], Prop:PropImage, StrOrderFilt:StrOrderFiltImage};  
  copySome(arg, this, ['Where']); arg.strDBPrefix=strDBPrefix;  arg.pool=mysqlPool;
  
  var {err, Hist}=yield* getHist(flow, mysqlPool, arg); if(err) {  this.mesEO(err); return; };
  Ou.Hist=Hist;

  var iColParent=KeyColImageFlip.parent, arrTmpA=Ou.Hist[iColParent], arrTmpB=[];
  //for(var i=arrTmpA.length-1;i>=0;i--){var boKeep=(arrTmpA[i] instanceof Array) && (typeof arrTmpA[i][0]==='number') if(!boKeep) mysplice1(arrTmpA,i); else arrTmpA[i]=arrTmpA[i][0]; }
  for(var i=0;i<arrTmpA.length;i++){var tmp=arrTmpA[i], boKeep=(tmp instanceof Array) && (typeof tmp[0]==='number'); if(boKeep) arrTmpB.push(tmp[0]);  }

  var len=arrTmpB.length;
  if(len){
    var sql="SELECT idPage, boTLS, www, siteName, pageName FROM "+pageWWWView+" WHERE idPage IN ("+arrTmpB.join(', ')+")",  Val=[];
    var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
    Ou.ParentName=arrObj2TabNStrCol(results);
  }

  return {err:null, result:[Ou]};
}

ReqBE.prototype.getPageInfo=function*(inObj){
  var req=this.req, res=this.res, Ou={}
  var GRet=this.GRet, flow=req.flow;
  var Ou={};

  var sql="SELECT pageName, boOR, boOW, UNIX_TIMESTAMP(tMod) AS tMod, lastRev, boOther, eTag, size FROM "+pageLastView;
  var Val=[]; 
  if('objName' in inObj) {
    var strKeyDefault=inObj.strKeyDefault;
    var objName=inObj.objName, arrQ=[];
    var objTmp={};
    for(var siteName in objName){
      var arrName=objName[siteName];
      var nName=arrName.length;
      if(siteName==strKeyDefault){  arrQ.push("boDefault=1 AND pageName IN ("+array_fill(nName, "?").join(',')+")");     Val=Val.concat(arrName);  } 
      else {  arrQ.push("siteName=? AND pageName IN ("+array_fill(nName, "?").join(',')+")");     Val=Val.concat(siteName,arrName);  } 
    }
    var strQ='false'; if(arrQ.length) strQ=arrQ.join(' OR ');
    sql+=" WHERE "+strQ;
  }
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
  Ou.FileInfo=results;
  return {err:null, result:[Ou]};
}


ReqBE.prototype.getImageInfo=function*(inObj){
  var req=this.req, res=this.res, Ou={}
  var GRet=this.GRet, flow=req.flow;
  var Ou={};

  var boLimited=0, arrName=[], nName, tmpQ; 
  if('arrName' in inObj) {
    boLimited=1; arrName=inObj.arrName;
    nName=arrName.length; if(nName>1) { tmpQ=array_fill(nName, "?").join(','); tmpQ="imageName IN ("+tmpQ+")";  } else if(nName==1) tmpQ="imageName=?"; else tmpQ="false";
  } 

  var sql="SELECT imageName, UNIX_TIMESTAMP(created) AS created, boOther, eTag, size FROM "+imageTab;
  
  var strLim=''; if(boLimited){ strLim=" WHERE "+tmpQ; }
  sql+=strLim;
  var Val=arrName;
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
  Ou.FileInfo=results;
  return {err:null, result:[Ou]};
}

////////////////////////////////////////////////////////////////////////
// RedirectTab
////////////////////////////////////////////////////////////////////////
ReqBE.prototype.redirectTabGet=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }
  var sql="SELECT idSite, siteName, www, pageName, url, UNIX_TIMESTAMP(created) AS created, nAccess, UNIX_TIMESTAMP(tLastAccess) AS tLastAccess FROM "+redirectWWWView+";";
  //var sql="SELECT idSite, pageName, url, UNIX_TIMESTAMP(created) AS created FROM "+redirectTab+";";
  var Val=[];
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
  var Ou=arrObj2TabNStrCol(results);
  this.mes("Got "+results.length+" entries"); 
  extend(Ou, {boOK:1,nEntry:results.length});
  return {err:null, result:[Ou]};
}

ReqBE.prototype.redirectTabSet=function*(inObj){
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }
  var boUpd=inObj.boUpd||false;
  if(boUpd){
    //var sql="UPDATE "+redirectTab+" SET url=?, created=now() WHERE idSite=? AND pageName=?;";
    //var Val=[inObj.url, inObj.idSite, inObj.pageName.replace(RegExp(' ','g'),'_')];
    var sql="UPDATE "+redirectTab+" SET idSite=?, pageName=?, url=?, created=now() WHERE idSite=? AND pageName=?;"; 
    var Val=[inObj.idSite, inObj.pageName.replace(RegExp(' ','g'),'_'), inObj.url, inObj.idSiteOld, inObj.pageNameOld.replace(RegExp(' ','g'),'_')];
  } else {
    var sql="INSERT INTO "+redirectTab+" (idSite, pageName, url, created) VALUES (?, ?, ?, now())";
    var Val=[inObj.idSite, inObj.pageName.replace(RegExp(' ','g'),'_'), inObj.url];
  }
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool);   
  var boOK=1, mestmp="Done";
  if(err && (typeof err=='object') && err.code=='ER_DUP_ENTRY'){boOK=0; mestmp='dup key';}
  else if(err){ this.mesEO(err); return;  }
  
  this.mes(mestmp);
  extend(Ou, {boOK:boOK});
  return {err:null, result:[Ou]};
}
ReqBE.prototype.redirectTabDelete=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }
  var sql="DELETE FROM "+redirectTab+" WHERE idSite=? AND pageName=?";
  var Val=[inObj.idSite, inObj.pageName];
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
  var c=results.affectedRows, boOK, mestmp; 
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
  var sql="UPDATE "+redirectTab+" SET nAccess=0;"; 
  var Val=[];
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
  var boOK=1, mestmp="Done"; 
  this.mes(mestmp);
  extend(Ou, {boOK:boOK});
  return {err:null, result:[Ou]};
}

////////////////////////////////////////////////////////////////////////
// SiteTab
////////////////////////////////////////////////////////////////////////

ReqBE.prototype.siteTabGet=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }
  //var sql="SELECT idSite, siteName, www, googleAnalyticsTrackingID, urlIcon16, urlIcon200, UNIX_TIMESTAMP(created) AS created FROM "+siteTab+";";
  var sql="SELECT boDefault, boTLS, st.idSite AS idSite, siteName, www, googleAnalyticsTrackingID, urlIcon16, urlIcon200, UNIX_TIMESTAMP(st.created) AS created, SUM(p.idSite IS NOT NULL) AS nPage FROM "+siteTab+" st LEFT JOIN "+pageTab+" p ON st.idSite=p.idSite GROUP BY idSite;"
  var Val=[];
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
  var Ou=arrObj2TabNStrCol(results);
  this.mes("Got "+results.length+" entries");
  Ou.boOK=1;
  return {err:null, result:[Ou]};
}
  
ReqBE.prototype.siteTabSet=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }
  var boUpd=inObj.boUpd||false;

  if(boUpd){
    var sql="UPDATE "+siteTab+" SET boTLS=?, siteName=?, www=?, googleAnalyticsTrackingID=?, urlIcon16=?, urlIcon200=? WHERE idSite=?;";  //, created=now() 
    var Val=[inObj.boTLS, inObj.siteName, inObj.www, inObj.googleAnalyticsTrackingID, inObj.urlIcon16, inObj.urlIcon200, inObj.idSite];
  } else {
    var sql="INSERT INTO "+siteTab+" (boTLS, siteName, www, googleAnalyticsTrackingID, urlIcon16, urlIcon200, created) VALUES (?, ?, ?, ?, ?, ?, now());";
    var Val=[inObj.boTLS, inObj.siteName, inObj.www, inObj.googleAnalyticsTrackingID, inObj.urlIcon16, inObj.urlIcon200];
    sql+="SELECT LAST_INSERT_ID() AS idSite;";
  }
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool);
  var boOK, mestmp, idSite=inObj.idSite;
  if(err && (typeof err=='object') && err.code=='ER_DUP_ENTRY'){boOK=0; mestmp='dup key';}
  else if(err){
    this.mesEO(err); return;
  }
  else{
    boOK=1; mestmp="Done";
    if(boUpd){}
    else{idSite=results[1][0].idSite;}
  }
  this.mes(mestmp);
  extend(Ou, {boOK:boOK, idSite:idSite});
  return {err:null, result:[Ou]};
}
ReqBE.prototype.siteTabDelete=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boALoggedIn) { this.mesO('Not logged in as admin'); return; }
  var sql="DELETE FROM "+siteTab+" WHERE siteName=?";
  var Val=[inObj.siteName];
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
  var c=results.affectedRows, boOK, mestmp; 
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
  var Sql=[];
  Sql.push("START TRANSACTION;");
  Sql.push("UPDATE "+siteTab+" SET boDefault=0;");
  Sql.push("UPDATE "+siteTab+" SET boDefault=1 WHERE idSite=?;");
  Sql.push("COMMIT;");
  var sql=Sql.join('\n'),    Val=[inObj.idSite];
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
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
    fs.readFile(tmpname, function(errT, bufT) { err=errT; buf=bufT;  flow.next();  }); yield;
    if(err){ boDoExit=1; res.out500(err); return; }
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
    fileName=fileName.replace(RegExp('.txt$','i'),'');
    var obj=parsePage(fileName);
    var siteName=obj.siteName, pageName=obj.pageName;

    extend(this,{strEditText:data.toString(), boOW:1, boOR:1, boSiteMap:1});

      // parse
    var objT=yield* parse.call(this); if(objT.mess=='err') return objT;

          // saveByReplace
    var {sql, Val, nEndingResults}=createSaveByReplaceSQL(siteName, '', pageName, this.strEditText, this.strHtmlText, '', this.arrSub, this.StrSubImage);
    console.log(this.strEditText.length+', '+this.strHtmlText.length+', nSub:'+this.arrSub.length+', nsubImage:'+this.StrSubImage.length);
    console.time('dbOperations');
    sql="SET autocommit=0;"+sql;  // +"SET autocommit=1;";
    var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
    var iRowLast=results.length-nEndingResults-1;
    var mess=results[iRowLast][0].mess;//if(typeof results[iRowLast][0]=='object')
 
    console.timeEnd('dbOperations');

  }else if(regImg.test(type)){
    var eTag=md5(data); 
    //var dim=imageSize(data);  console.log(fileName+', w/h: '+dim.width+' / '+dim.height);
    var sql="CALL "+strDBPrefix+"storeImage(?,?,?,?,@boOK)";
    var Val=[fileName,0,data,eTag];
    var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
  }else if(regVid.test(type)){ 
    var eTag=md5(data);
    var sql="CALL "+strDBPrefix+"storeVideo(?,?,?)";
    var Val=[fileName,data,eTag];
    var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
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
    //var dim=imageSize(data);  console.log(fileName+', w/h: '+dim.width+' / '+dim.height);
    var sql="CALL "+strDBPrefix+"storeImage(?,?,?,?,@boOK)";
    var Val=[fileName,1,data,eTag];
    var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
  }else if(regVid.test(type)){ 
    var eTag=md5(data);
    var sql="CALL "+strDBPrefix+"storeVideo(?,?,?)";
    var Val=[fileName,data,eTag];
    var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool); if(err) {  this.mesEO(err); return; }
  }
  else{ Ou.strMessage="Unrecognized file type: "+type; return {err:null, result:[Ou]}; }

  Ou.strMessage="Done";
  return {err:null, result:[Ou]};
}







