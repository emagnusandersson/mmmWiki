"use strict"

/******************************************************************************
 * ReqBE
 ******************************************************************************/
var ReqBE=app.ReqBE=function(req, res){
  this.req=req; this.res=res; this.Str=[];
}

ReqBE.prototype.go=function*(){
  var self=this, req=this.req, res=this.res;
  var sessionID=req.sessionID;
  
 
  this.Out={GRet:{boSpecialistExistDiff:{}}, dataArr:[]}; this.GRet=this.Out.GRet;

    
  if(req.method=='POST'){ 
    if('x-type' in req.headers ){ //&& req.headers['x-type']=='single'
      var form = new formidable.IncomingForm();
      form.multiples = true;  
      //form.uploadDir='tmp';
      
      //var fT=thisChangedWArg(this.myStoreF, this, null);
      //var myStore=concat(fT);
      //form.onPart = function(part) { debugger
      //  if(!part.filename){  form.handlePart(part);  }  // let formidable handle all non-file parts
      //  //part.pipe(myStore);
      // }

      form.parse(req, function(err, fields, files) {
        if(err){self.mesEO(err);  return; } 
        else{
          self.File=files['fileToUpload[]'];
          if('captcha' in fields) self.captchaIn=fields.captcha; else self.captchaIn='';
          if('strName' in fields) self.strName=fields.strName; else self.strName='';
          if(!(self.File instanceof Array)) self.File=[self.File];
          self.jsonInput=fields.vec;
          //Fiber( function(){ self.interpretInput.call(self); }).run();
          req.flow.next();
        }
      });
      yield;
      yield* self.interpretInput.call(self);

    }else{  
      var myConcat=concat(function(buf){
        self.jsonInput=buf.toString();
        //Fiber( function(){ self.interpretInput.call(self); }).run();
        req.flow.next();
      });
      req.pipe(myConcat);
      yield;
      yield* self.interpretInput.call(self);
    }
  }
  else if(req.method=='GET'){
    var objUrl=url.parse(req.url), qs=objUrl.query||''; self.jsonInput=urldecode(qs);
    //Fiber( function(){ self.interpretInput.call(self); }).run();
    yield* self.interpretInput.call(self);
  }
}





ReqBE.prototype.interpretInput=function*(){
  var self=this, req=this.req, res=this.res, sessionID=req.sessionID;
  var redisVar=this.req.sessionID+'_Main', strTmp=yield* wrapRedisSendCommand.call(req, 'set',[redisVar,1]);   var tmp=yield* wrapRedisSendCommand.call(req, 'expire',[redisVar,maxViewUnactivityTime]);

      // Conditionally push deadlines forward
  this.boVLoggedIn=yield* wrapRedisSendCommand.call(req, 'expire',[this.req.sessionID+'_viewTimer',maxViewUnactivityTime]);
  this.boALoggedIn=yield* wrapRedisSendCommand.call(req, 'expire',[this.req.sessionID+'_adminTimer',maxAdminUnactivityTime]);

  var jsonInput=this.jsonInput;
  try{
    var beArr=JSON.parse(jsonInput);
  }catch(e){
    console.log(e); res.out500('Error in JSON.parse, '+e); return;
  } 

  res.setHeader("Content-type", "application/json");


    // Remove the beArr[i][0] values that are not functions
  var CSRFIn; this.tModIn=new Date(0); 
  for(var i=beArr.length-1;i>=0;i--){ 
    var row=beArr[i];
    if(row[0]=='page') {this.queredPage=row[1]; array_removeInd(beArr,i);}
    else if(row[0]=='tMod') {this.tModIn=new Date(Number(row[1])*1000); array_removeInd(beArr,i);}
    else if(row[0]=='CSRFCode') {CSRFIn=row[1]; array_removeInd(beArr,i);}
  }

  var len=beArr.length;
  var StrInFunc=Array(len); for(var i=0;i<len;i++){StrInFunc[i]=beArr[i][0];}
  var arrCSRF, arrNoCSRF, allowed, boCheckCSRF, boSetNewCSRF;

           // Arrays of functions
    // Functions that changes something must check and refresh CSRF-code
  var arrCSRF=['myChMod', 'myChModImage', 'saveByAdd', 'saveByReplace', 'uploadUser', 'uploadAdmin', 'getPageInfo', 'getImageInfo', 'setUpPageListCond','getPageList','getPageHist', 'setUpImageListCond','getImageList','getImageHist', 'getParent','getParentOfImage','getSingleParentExtraStuff', 'deletePage','deleteImage','renamePage','renameImage', 'redirectTabGet','redirectTabSet','redirectTabDelete', 'siteTabGet', 'siteTabSet', 'siteTabDelete', 'siteTabSetDefault'];
  var arrNoCSRF=['specSetup','vLogin','aLogin','aLogout','pageLoad','pageCompare','getPreview'];  
  allowed=arrCSRF.concat(arrNoCSRF);

    // Assign boCheckCSRF and boSetNewCSRF
  boCheckCSRF=0; boSetNewCSRF=0;   for(var i=0; i<beArr.length; i++){ var row=beArr[i]; if(in_array(row[0],arrCSRF)) {  boCheckCSRF=1; boSetNewCSRF=1;}  }    
  if(StrComp(StrInFunc,['specSetup'])){ boCheckCSRF=0; boSetNewCSRF=1; } // Public pages
  if(StrComp(StrInFunc,['pageLoad'])){ boCheckCSRF=0; boSetNewCSRF=0; } // Private pages: CSRF was set in index.html
  

  // Private:
  //                                                             index  first ajax (pageLoad)
  //Shall look the same (be cacheable (not include CSRFcode))     no           yes

  // Public:
  //                                                             index  first ajax (specSetup)
  //Shall look the same (be cacheable (not include CSRFcode))     yes          no


    // cecking/set CSRF-code
  var CSRFVar=this.queredPage+'_CSRF', CSRFCode;
  var redisVar=sessionID+'_'+this.queredPage+'_CSRF', CSRFCode;
  if(boCheckCSRF){
    if(!CSRFIn){ var tmp='CSRFCode not set (try reload page)', error=new MyError(tmp); self.mesO(tmp); return;}
    //if(CSRFIn!==session[CSRFVar]){ var tmp='CSRFCode err (try reload page)', error=new MyError(tmp); self.mesO(tmp); return;}
    var tmp=yield* wrapRedisSendCommand.call(req, 'get',[redisVar]);
    if(CSRFIn!==tmp){ var tmp='CSRFCode err (try reload page)', error=new MyError(tmp); self.mesO(tmp); return;}
  }
  if(boSetNewCSRF) {
    var CSRFCode=randomHash();
    //session[CSRFVar]=CSRFCode;
    var tmp=yield* wrapRedisSendCommand.call(req, 'set',[redisVar,CSRFCode]);
    var tmp=yield* wrapRedisSendCommand.call(req, 'expire',[redisVar,maxViewUnactivityTime]);
    self.GRet.CSRFCode=CSRFCode;
  }

  var Func=[];
  for(var k=0; k<beArr.length; k++){
    var strFun=beArr[k][0]; 
    if(in_array(strFun,allowed)) { 
      var inObj=beArr[k][1],     tmpf; if(strFun in self) tmpf=self[strFun]; else tmpf=global[strFun];     
      //var fT=thisChangedWArg(tmpf, self, inObj);   Func.push(fT);
      var fT=[tmpf,inObj];   Func.push(fT);
    }
  }

  for(var k=0; k<Func.length; k++){
    var Tmp=Func[k], func=Tmp[0], inObj=Tmp[1];
    var semY=0, semCB=0, boDoExit=0;
    var tmpRet=function(err, results) {
      if(err){ 
        boDoExit=1;
        if(err!='exited') { debugger; res.out500(err); }
      }
      else {
        self.Out.dataArr.push(results);
      }      
      if(semY) { req.flow.next(); } semCB=1;
    }
    yield* func.call(self, tmpRet, inObj);      
    if(!semCB) { semY=1; yield;}
    if(boDoExit==1) return;
  }
  self.mesO();
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


ReqBE.prototype.myChMod=function*(callback,inObj){   
  var self=this, req=this.req, res=this.res, queredPage=this.queredPage;
  var GRet=this.GRet;
  var Ou={};
	if(!this.boALoggedIn) {self.mesO('not logged in (as Administrator)'); callback('exited'); return;}
	
  if('File' in inObj && inObj.File instanceof Array && inObj.File.length) var File=inObj.File; else {var tmp='chmod: no files'; self.mesEO(tmp); callback('exited');  return; }   
  var strQ=array_fill(File.length, "?").join(', ');
  var tmpBit; if('boOR' in inObj) tmpBit='boOR'; else if('boOW' in inObj) tmpBit='boOW'; else if('boSiteMap' in inObj) tmpBit='boSiteMap'; 
  var Sql=[],Val=[inObj[tmpBit]];
	Sql.push("UPDATE "+pageTab+" SET "+tmpBit+"=? WHERE idPage IN ("+strQ+");");
  array_mergeM(Val,File);
  
  array_mergeM(Sql, array_fill(File.length, "CALL "+strDBPrefix+"markStale(?);"));
  array_mergeM(Val,File); 
  var sql=Sql.join('\n'); 
  myQueryF(sql, Val, mysqlPool, function(err, results) {
    if(err){self.mesEO(err); callback('exited');  return; } 
    else{
      self.mes('chmod');
      GRet[tmpBit]=inObj[tmpBit]; // Sending boOW/boSiteMap  back will trigger closing/opening of the save/preview buttons
      callback(null, [Ou]);
    }
  });
}
ReqBE.prototype.myChModImage=function*(callback,inObj){   
  var self=this, req=this.req, res=this.res, queredPage=this.queredPage;
  var GRet=this.GRet;
  var Ou={};
	if(!this.boALoggedIn) {self.mesO('not logged in (as Administrator)'); callback('exited'); return;}
	
  if('File' in inObj && inObj.File instanceof Array && inObj.File.length) var File=inObj.File; else {var tmp='chmodImage: no files'; self.mesEO(tmp); callback('exited');  return; }   
  var strQ=array_fill(File.length, "?").join(', ');
  var Sql=[],Val=[inObj.boOther];
	Sql.push("UPDATE "+imageTab+" SET boOther=? WHERE idImage IN ("+strQ+");");
  array_mergeM(Val,File);
  
  var sql=Sql.join('\n'); 
  myQueryF(sql, Val, mysqlPool, function(err, results) {
    if(err){self.mesEO(err); callback('exited');  return; } 
    else{
      self.mes('chmodImage');
      GRet.boOther=inObj.boOther; // Sending boOther  back will trigger closing/opening of the save/preview buttons
      callback(null, [Ou]);
    }
  });
}

ReqBE.prototype.deletePage=function*(callback,inObj){   
  var self=this, req=this.req, res=this.res;
  var queredPage=this.queredPage;
  var GRet=this.GRet;
  var Ou={};
	if(!this.boALoggedIn) {self.mesO('not logged in (as Administrator)'); callback('exited'); return;}
	
  if('File' in inObj && inObj.File instanceof Array && inObj.File.length) var File=inObj.File; else {var tmp='chmod: no files'; self.mesEO(tmp); callback('exited');  return; }
  var sql=array_fill(File.length, "CALL "+strDBPrefix+"deletePageID(?);").join('\n'); 
  var Val=File;
  myQueryF(sql, Val, mysqlPool, function(err, results) {
    if(err){self.mesEO(err); callback('exited');  return; } 
    else{
      self.mes('pages deleted');
       
      callback(null, [Ou]);
    }
  });
}
ReqBE.prototype.deleteImage=function*(callback,inObj){   
  var self=this, req=this.req, res=this.res;
  var queredPage=this.queredPage;
  var GRet=this.GRet;
  var Ou={};
	if(!this.boALoggedIn) {self.mesO('not logged in (as Administrator)'); callback('exited'); return;}

  if('File' in inObj && inObj.File instanceof Array && inObj.File.length) var File=inObj.File; else {var tmp='chmod: no files'; self.mesEO(tmp); callback('exited');  return; }
  var sql=array_fill(File.length, "CALL "+strDBPrefix+"deleteImage(?);").join('\n');
  var Val=File;
  var err;
  myQueryF(sql, Val, mysqlPool, function(err, results) {
    if(err){self.mesEO(err); callback('exited');  return; } 
    else{
      self.mes('images deleted');       
      callback(null, [Ou]);
    }
  });
}

ReqBE.prototype.aLogout=function*(callback, inObj){  
  var self=this, req=this.req, res=this.res, sessionID=req.sessionID;
  var GRet=this.GRet;
  var Ou={};
  //session.adminTimer = unixNow(); 
  //redisClient.del(sessionID+'_adminTimer');
  var redisVar=sessionID+'_adminTimer';
  var tmp=yield* wrapRedisSendCommand.call(req, 'del',[redisVar]);

	if(this.boALoggedIn) {self.mes('Logged out (as Administrator)'); GRet.strDiffText=''; } 
  GRet.boALoggedIn=0; 
  callback(null, [Ou]);
}



//////////////////////////////////////////////////////////////////////////////////////////////
// pageLoad
//////////////////////////////////////////////////////////////////////////////////////////////

ReqBE.prototype.pageLoad=function*(callback,inObj) { 
  var self=this, req=this.req, res=this.res, sessionID=req.sessionID;
  var queredPage=this.queredPage;
  var GRet=this.GRet;
  var Ou={};

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
  if(typeof inObj=='object' && 'version' in inObj) {  self.version=inObj.version;  self.rev=self.version-1 } else {  self.version=NaN; self.rev=-1; }
  this.eTagIn=''; this.requesterCacheTime=new Date(0);
  if(req.method=='GET') {this.eTagIn=getETag(req.headers); this.requesterCacheTime=getRequesterTime(req.headers); }
  //if(bootTime>this.requesterCacheTime) this.requesterCacheTime=new Date(0);
  extend(self,{strHtmlText:'', boTalkExist:0, strEditText:'', arrVersion:[null,1], matVersion:[], objTemplateE:{}}); 
  self.boFront=0;


      // getInfoNData
  var mess='', rowA, boDoExit=0;
  getInfoNData.call(self,function(err,results){
    if(err){boDoExit=1; self.mesEO(err); } 
    else{ rowA=results;}
    req.flow.next();
  });
  yield;
  if(boDoExit==1) { callback('exited'); return; }

  var mess=rowA.mess;
  if(mess=='IwwwNotFound'){ res.out404('No wiki there'); callback('exited'); return;   }
  else if(mess=='304') { res.out304(); callback('exited'); return; }
  else if(mess=='noSuchRev') {res.out500(mess); callback('exited'); return; }
  else if(mess=='noSuchPage'){ res.out404(); callback('exited'); return;   }
  else if(mess=='serverCacheStale' || mess=='serverCacheOK'){
    copySome(self,rowA,['idPage', 'rev', 'version', 'eTag', 'boOR', 'boOW', 'boSiteMap', 'talkPage', 'boTalkExist', 'tMod', 'tModCache', 'strEditText']);
    var boValidServerCache=mess=='serverCacheOK'; 
    //self.tModCache=new Date(Math.max(self.tModCache, bootTime)); 
    //self.tMod=new Date(self.tMod); 
    //self.tModCache=new Date(self.tModCache); 
  
    var tmp=self.boOR?'':', private';
    res.setHeader("Cache-Control", "must-revalidate"+tmp);  res.setHeader('Last-Modified',self.tModCache.toUTCString());  res.setHeader('ETag',self.eTag);
    
    //self.matVersion=makeMatVersion.call(self);
    self.matVersion=makeMatVersion(self.Version);
    self.arrVersion=[null,self.rev+1];

    if(!boValidServerCache){

            // parse
      var semY=0, semCB=0, err, boDoExit=0;
      var tmpf=function(err,results){
        if(err){boDoExit=1; self.mesEO(err); }      
        if(semY) { req.flow.next(); } semCB=1;
      }
      yield* parse.call(self,tmpf);       
      if(!semCB) { semY=1; yield;}
      if(boDoExit==1) { callback('exited'); return; }

          // setNewCacheSQL
      var mess='', tmp=createSetNewCacheSQL(req.wwwSite, queredPage, self.rev, self.strHtmlText, self.eTag, self.arrSub, self.StrSubImage),    sql=tmp.sql, Val=tmp.Val, nEndingResults=tmp.nEndingResults;
      var boDoExit=0;
      myQueryF(sql, Val, mysqlPool, function(err, results) {
        if(err){boDoExit=1; self.mesEO(err); }
        else{
          var iRowLast=results.length-nEndingResults-1;
          mess=results[iRowLast][0].mess;//if(typeof results[iRowLast][0]=='object')
        }
        req.flow.next();
      });
      yield;
      if(boDoExit==1) { callback('exited'); return; }

    } else {
      self.strHtmlText=rowA.strHtmlText;
    }

  }
  else { res.out500('mess='+mess); callback('exited'); return; }
  //'redir', 'noSuchPage', 'redirCase', 'private', '304', 'serverCacheStale', 'serverCacheOK'
  //self.myAsyncPageLoad.Func.push(         thisChangedWArg(self.pageLoadC, self)        ); 
  //self.pageLoadC.call(self);
  copySome(GRet,self,['idPage', 'boOR', 'boOW', 'boSiteMap', 'tMod', 'tModCache', 'boTalkExist', 'strEditText', 'strHtmlText', 'matVersion', 'objTemplateE']);
  extend(GRet,{strDiffText:'', arrVersion:self.arrVersion});
  callback(null,[Ou]);
}


ReqBE.prototype.pageCompare=function*(callback,inObj){ 
  var self=this, req=this.req, res=this.res;
  var GRet=this.GRet;
  var Ou={};
  self.versionOld=arr_min(inObj.arrVersion);  self.version=arr_max(inObj.arrVersion); 
  self.versionOld=Math.max(1,self.versionOld);  self.version=Math.max(1,self.version);
  if(self.version==self.versionOld) {this.mesO('Same version'); callback('exited'); return;}
  this.eTagIn=''; this.requesterCacheTime=0;
  self.rev=self.versionOld-1;

  self.boFront=0; self.eTagIn=''; self.requesterCacheTime=0;


      // getInfoNData Old
  var rowA, boDoExit=0;
  getInfoNData.call(self,function(err,results){
    if(err){boDoExit=1; self.mesEO(err); } 
    else{ rowA=results;}
    req.flow.next();
  });
  yield;
  if(boDoExit==1) { callback('exited'); return; }

	var nVersion=self.Version.length; 
	if(nVersion==0){this.mesO('Page does not exist'); callback('exited'); return;} 
	if(!rowA.boOR && !self.boVLoggedIn){this.mesO('Not logged in'); callback('exited'); return;}

  self.strEditTextOld=rowA.strEditText;

      // getInfoNData 
  self.rev=self.version-1;
  var rowA, boDoExit=0;
  getInfoNData.call(self,function(err,results){
    if(err){boDoExit=1; self.mesEO(err); } 
    else{ rowA=results;}
    req.flow.next();
  });
  yield;
  if(boDoExit==1) { callback('exited'); return; }
  copySome(self,rowA,['idPage', 'rev', 'version', 'eTag', 'boOR', 'boOW', 'boSiteMap', 'boTalkExist', 'tMod', 'tModCache', 'strEditText']);
  
      // parse
  var semY=0, semCB=0, boDoExit=0;
  var tmpf=function(err,results){
    if(err){boDoExit=1; self.mesEO(err); }      
    if(semY) { req.flow.next(); } semCB=1;
  }
  yield* parse.call(self,tmpf);
  if(!semCB) { semY=1; yield;}
  if(boDoExit==1) { callback('exited'); return; }
  self.strEditText=rowA.strEditText;
  self.strHtmlText=rowA.strHtmlText;

  self.strDiffText='';
  if(self.versionOld!==null){
  	self.strDiffText=myDiff(self.strEditTextOld,self.strEditText);
    if(self.strDiffText.length==0) self.strDiffText='(equal)';
    self.mes("v "+self.versionOld+" vs "+self.version);
	} else self.mes("v "+self.version);

  //self.matVersion=makeMatVersion.call(self);
  self.matVersion=makeMatVersion(self.Version);
  
  copySome(GRet,self,['idPage', 'boOR', 'boOW', 'boSiteMap', 'tMod', 'tModCache', 'boTalkExist', 'strEditText', 'strHtmlText', 'matVersion', 'objTemplateE']);
  extend(GRet,{strDiffText:self.strDiffText, arrVersion:[self.versionOld,self.version]});
	callback(null, [0]);
}

ReqBE.prototype.getPreview=function*(callback,inObj){ 
  var self=this, req=this.req, res=this.res;
  var queredPage=this.queredPage;
  var GRet=this.GRet;
  var Ou={};
  this.strEditText=inObj.newcontent;
	
  self.boOW==1;

      // parse
  var semY=0, semCB=0, boDoExit=0;
  var tmpf=function(err,results){
    if(err){boDoExit=1; self.mesEO(err); }  
    if(semY) { req.flow.next(); } semCB=1;
  }
  yield* parse.call(self,tmpf);
  if(!semCB) { semY=1; yield;}
  if(boDoExit==1) { callback('exited'); return; }

	self.mes('Preview');
	GRet.strHtmlText=self.strHtmlText;
	GRet.strEditText=self.strEditText;
	GRet.objTemplateE=self.objTemplateE;
  GRet.strDiffText='';
  
	callback(null, [0]);
} 
ReqBE.prototype.saveByAdd=function*(callback,inObj){  
  var self=this, req=this.req, res=this.res;
  var queredPage=this.queredPage;
  var GRet=this.GRet;
  var Ou={};

      // getInfo
  var rowA, boDoExit=0;
  getInfo.call(self,function(err,results){
    if(err){boDoExit=1; self.mesEO(err); } 
    else{ rowA=results;}
    req.flow.next();
  });
  yield;
  if(boDoExit==1) { callback('exited'); return; }
  if(rowA.mess=='IwwwNotFound'){ res.out404('No wiki there'); callback('exited'); return;   }
  else if(rowA.mess=='pageExist'){
    copySome(self,rowA,['boOR', 'boOW', 'boSiteMap', 'tMod', 'tModCache']);
    if(!self.boOR && !self.boVLoggedIn) {self.mesO('Not logged in'); callback("exited"); return;}
    if(this.tModIn<self.tMod) { self.mesO("tModIn (from your action) ("+this.tModIn+") < tMod db ("+self.tMod+"), "+messPreventBecauseOfNewerVersions); callback("exited"); return; }
  }else if(rowA.mess=='noSuchPage'){
    extend(self,{boOW:1,boOR:1,boSiteMap:1});  
  }
	if(self.boOW==0) {this.mesO('Not authorized'); callback('exited'); return;} 
  copySome(self,inObj,['summary', 'signature']);    self.strEditText=inObj.newcontent;
		 
      // parse
  var semY=0, semCB=0, boDoExit=0;
  var tmpf=function(err,results){
    if(err){boDoExit=1; self.mesEO(err); }       
    if(semY) { req.flow.next(); } semCB=1;
  }
  yield* parse.call(self,tmpf);       
  if(!semCB) { semY=1; yield;}
  if(boDoExit==1) { callback('exited'); return; }

      // saveByAddSQL
  var mess='', tmp=createSaveByAddSQL(req.wwwSite, queredPage, self.summary, self.signature, self.strEditText, self.strHtmlText, self.eTag, self.arrSub, self.StrSubImage),    sql=tmp.sql, Val=tmp.Val, nEndingResults=tmp.nEndingResults;
  var boDoExit=0;
  myQueryF(sql, Val, mysqlPool, function(err, results, fields) {
    if(err){boDoExit=1; self.mesEO(err); }
    else{
      var iRowLast=results.length-nEndingResults-1;
      mess=results[iRowLast][0].mess;//if(typeof results[iRowLast][0]=='object')
    }
    req.flow.next();
  });
  yield;
  if(boDoExit==1) { callback('exited'); return; }
  


      // getInfoNData
  self.boFront=0; self.rev=-1; self.eTagIn=''; self.requesterCacheTime=0;
  var rowA, boDoExit=0;
  getInfoNData.call(self,function(err,results){
    if(err){boDoExit=1; self.mesEO(err); } 
    else{ rowA=results;}
    req.flow.next();
  });
  yield;
  if(boDoExit==1) { callback('exited'); return; }
  copySome(self,rowA,['idPage', 'rev', 'version', 'eTag', 'boOR', 'boOW', 'boSiteMap', 'boTalkExist', 'tMod', 'tModCache', 'strEditText']);
  //self.matVersion=makeMatVersion.call(self);
  self.matVersion=makeMatVersion(self.Version);
  
  self.mes("New version added");
  if(objOthersActivity) { objOthersActivity.nEdit++; objOthersActivity.pageName=this.siteName+':'+this.queredPage; }

  copySome(GRet,self,['idPage', 'boOR', 'boOW', 'boSiteMap', 'tMod', 'tModCache', 'boTalkExist', 'strEditText', 'strHtmlText', 'matVersion', 'objTemplateE']);
  extend(GRet,{strDiffText:'', arrVersion:[null,this.matVersion.length]});

	callback(null, [0]);
}


ReqBE.prototype.saveByReplace=function*(callback,inObj){   
  var self=this, req=this.req, res=this.res;
  var queredPage=this.queredPage;
  var GRet=this.GRet;
  var Ou={};

      // getInfo
  var rowA, boDoExit=0;
  getInfo.call(self,function(err,results){
    if(err){boDoExit=1; self.mesEO(err); } 
    else{ rowA=results;}
    req.flow.next();
  });
  yield;
  if(boDoExit==1) { callback('exited'); return; }
  if(rowA.mess=='IwwwNotFound'){ res.out404('No wiki there'); callback('exited'); return;   }
  else if(rowA.mess=='pageExist'){
    copySome(self,rowA,['boOR', 'boOW', 'boSiteMap', 'tMod', 'tModCache']);
    if(!self.boOR && !self.boVLoggedIn) {self.mesO('Not logged in'); callback("exited"); return;}
    if(!self.boALoggedIn) {self.mesO('Not logged in as admin'); callback("exited"); return;} 
    if(this.tModIn<self.tMod) { self.mesO("tModIn (from your action) ("+this.tModIn+") < tMod db ("+self.tMod+"), "+messPreventBecauseOfNewerVersions); callback("exited"); return; }
  }else if(rowA.mess=='noSuchPage'){
    extend(self,{boOW:1,boOR:1,boSiteMap:1});  
  }
  
  extend(self,{strEditText:inObj.newcontent});

      // parse
  var semY=0, semCB=0, boDoExit=0;
  var tmpf=function(err,results){
    if(err){boDoExit=1; self.mesEO(err); } 
    if(semY) { req.flow.next(); } semCB=1;
  }
  yield* parse.call(self,tmpf);
  if(!semCB) { semY=1; yield;}
  if(boDoExit==1) { callback('exited'); return; }

      // saveByReplace
  var mess='', tmp=createSaveByReplaceSQL('', req.wwwSite, self.queredPage, self.strEditText, self.strHtmlText, self.eTag, self.arrSub, self.StrSubImage),     sql=tmp.sql, Val=tmp.Val, nEndingResults=tmp.nEndingResults; 
  var boDoExit=0;
  myQueryF(sql, Val, mysqlPool, function(err, results) {
    if(err){boDoExit=1; self.mesEO(err); } 
    else{
      var iRowLast=results.length-nEndingResults-1;
      mess=results[iRowLast][0].mess;//if(typeof results[iRowLast][0]=='object')
    }
    req.flow.next();
  });
  yield;
  if(boDoExit==1) { callback('exited'); return; }

      // getInfoNData
  self.boFront=0; self.rev=0; self.eTagIn='', self.requesterCacheTime=0;
  var rowA, boDoExit=0;
  getInfoNData.call(self,function(err,results){
    if(err){boDoExit=1; self.mesEO(err); } 
    else{ rowA=results;}
    req.flow.next();
  });
  yield;
  if(boDoExit==1) { callback('exited'); return; }
  if(self.strEditText.length>0){
    copySome(self, rowA, ['idPage', 'rev', 'version', 'eTag', 'boOR', 'boOW', 'boSiteMap', 'boTalkExist', 'tMod', 'tModCache', 'strEditText']);
    //self.matVersion=makeMatVersion.call(self);
    self.matVersion=makeMatVersion(self.Version);
    self.mes("Page overwritten");
  } else {
    extend(self, {idPage:NaN, rev:0, version:1, eTag:'', boOR:1, boOW:1, boSiteMap:1, boTalkExist:0, tMod:new Date(0), tModCache:new Date(0), strPageHtml:'', objTemplateE:{}});
    self.mes("No content, Page deleted");
  }
  
  //boPageBUNeeded=true; 
	
  copySome(GRet,self,['idPage', 'boOR', 'boOW', 'boSiteMap', 'tMod', 'tModCache', 'boTalkExist', 'strEditText', 'strHtmlText', 'matVersion', 'objTemplateE']);
  extend(GRet,{strDiffText:'', arrVersion:[null,1]});
	callback(null, [0]);
}


ReqBE.prototype.renamePage=function*(callback,inObj){ 
  var self=this, req=this.req, res=this.res;
  var GRet=this.GRet;
  var Ou={};
  if(!this.boALoggedIn) { self.mesO('Not logged in as admin'); callback('exited'); return; }
  var sql="UPDATE "+pageTab+" SET pageName=? WHERE idPage=?";
  var strNewName=inObj.strNewName.replace(RegExp(' ','g'),'_');
  var Val=[strNewName, inObj.id];
  myQueryF(sql, Val, mysqlPool, function(err, results) {
    if(err){self.mesEO(err); callback('exited');  return; } 
    else{
      var c=results.affectedRows, boOK, mestmp; 
      if(c==1) { boOK=1; mestmp="1 page renamed"; } else {boOK=0; mestmp=c+" pages renamed!?"; }
      self.mes(mestmp);
      Ou.boOK=boOK;      
      callback(null, [Ou]);
    }
  });
}

ReqBE.prototype.renameImage=function*(callback,inObj){ 
  var self=this, req=this.req, res=this.res;
  var GRet=this.GRet;
  var Ou={};
  if(!this.boALoggedIn) { self.mesO('Not logged in as admin'); callback('exited'); return; }
  var sql="UPDATE "+imageTab+" SET imageName=? WHERE idImage=?";
  var Val=[inObj.strNewName, inObj.id];
  myQueryF(sql, Val, mysqlPool, function(err, results) {
    if(err){self.mesEO(err); callback('exited');  return; } 
    else{
      var c=results.affectedRows, boOK, mestmp; 
      if(c==1) { boOK=1; mestmp="1 image renamed"; } else {boOK=0; mestmp=c+" images renamed!?"; }
      self.mes(mestmp);
      Ou.boOK=boOK;      
      callback(null, [Ou]);
    }
  });
}


ReqBE.prototype.specSetup=function*(callback,inObj){
  var self=this, req=this.req, res=this.res;
  var GRet=this.GRet;

  var Ou={};
  GRet.boVLoggedIn=this.boVLoggedIn; 
  GRet.boALoggedIn=this.boALoggedIn;
  callback(null, [Ou]);  
}

ReqBE.prototype.setUpPageListCond=function*(callback,inObj){
  var Ou={};
  var tmp=setUpCond(undefined, StrOrderFiltPage, PropPage, inObj);
  copySome(this,tmp,['strCol', 'Where']);
  callback(null, [Ou]);
}
 
ReqBE.prototype.getParent=function*(callback,inObj){
  var self=this, req=this.req, res=this.res;
  //var Ou={}, sql="SELECT p.pageName FROM "+pageTab+" p JOIN "+subTab+" s ON s.idPage=p.idPage WHERE s.pageName=?;",   Val=[inObj.pageName];
  var Ou={}, sql="SELECT p.boTLS, p.www, p.idPage, p.pageName FROM "+pageWWWView+" p JOIN "+subTab+" s ON s.idPage=p.idPage JOIN "+pageTab+" c ON s.pageName=c.pageName WHERE c.idPage=?;",   Val=[inObj.idPage];

  var semY=0, semCB=0, err, results;
  myQueryF(sql, Val, mysqlPool, function(errT, resultsT) {
    err=errT;  results=resultsT;
    if(semY) { req.flow.next(); } semCB=1;
  });
  if(!semCB) { semY=1; yield;}
  if(err){ self.mesEO(err); callback('exited');  return;  }
  Ou=arrObj2TabNStrCol(results);
  callback(null, [Ou]);
}
ReqBE.prototype.getParentOfImage=function*(callback,inObj){
  var self=this, req=this.req, res=this.res;
  //var Ou={}, sql="SELECT p.pageName FROM "+pageTab+" p JOIN "+subImageTab+" s ON s.idPage=p.idPage WHERE s.imageName=?;",   Val=[inObj.imageName];
  var Ou={}, sql="SELECT p.boTLS, p.www, p.idPage, p.pageName FROM "+pageWWWView+" p JOIN "+subImageTab+" s ON s.idPage=p.idPage JOIN "+imageTab+" c ON s.imageName=c.imageName  WHERE c.idImage=?;",   Val=[inObj.idImage];
  /*myQueryF(sql, Val, mysqlPool, function(err, results) {
    if(err){self.mesEO(err); callback('exited');  return; } 
    else{
      var lenI=results.length; Ou.tab=Array(lenI);
      var StrCol=[]; if(lenI) StrCol=Object.keys(results[0]); var lenJ=StrCol.length;
      for(var i=0;i<lenI;i++) {
        var row=results[i], rowN=Array(lenJ);
        for(var j=0;j<lenJ;j++){ var key=StrCol[j]; rowN[j]=row[key]; }
        Ou.tab.push(rowN);
      } 
      Ou.StrCol=StrCol;
      callback(null, [Ou]);
    }
  });*/
  var semY=0, semCB=0, err, results;
  myQueryF(sql, Val, mysqlPool, function(errT, resultsT) {
    err=errT;  results=resultsT;
    if(semY) { req.flow.next(); } semCB=1;
  });
  if(!semCB) { semY=1; yield;}
  if(err){ self.mesEO(err); callback('exited');  return;  }
  Ou=arrObj2TabNStrCol(results);
  callback(null, [Ou]);
}
ReqBE.prototype.getSingleParentExtraStuff=function*(callback,inObj){
  var self=this, req=this.req, res=this.res;
  var Ou={}, Sql=[], Val=[];
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
  myQueryF(sql, Val, mysqlPool, function(err, results) {
    if(err){self.mesEO(err); callback('exited');  return; } 
    else{
      Ou.nSub=results[0][0].nSub;
      Ou.nImage=results[1][0].nImage;
      if(inObj.idPage!==null) { extend(Ou, results[2][0]); extend(Ou, results[3][0]); }
      callback(null, [Ou]);
    }
  });
}/*
ReqBE.prototype.getExtraPageStat=function*(callback,inObj){
  var self=this, req=this.req, res=this.res;
  var Ou={}, Sql=[], Val=[];
  var strName=inObj.pageName;
  if(strName===null){
    Sql.push("SELECT 1 FROM "+pageTab+" WHERE FALSE;"); 
    Sql.push("SELECT COUNT(*) AS nSub FROM "+pageTab+" p LEFT JOIN "+subTab+" s ON s.pageName=p.pageName WHERE s.pageName IS NULL;");   
    //Sql.push("SELECT COUNT(*) AS nImage FROM "+imageTab+" p WHERE p.imageName NOT IN (SELECT DISTINCT imageName FROM "+subImageTab+";"); 
    Sql.push("SELECT COUNT(*) AS nImage FROM "+imageTab+" p LEFT JOIN "+subImageTab+" s ON s.imageName=p.imageName WHERE s.imageName IS NULL;"); 
    //Sql.push("SELECT p.siteName AS siteName FROM "+pageView+" p WHERE p.pageName=?;"); 

  } else {
    Sql.push("SELECT p.pageName FROM "+pageTab+" p JOIN "+subTab+" s ON s.idPage=p.idPage WHERE s.pageName=?;"); 
    Sql.push("SELECT COUNT(*) AS nSub FROM "+pageTab+" p JOIN "+subTab+" s ON s.idPage=p.idPage WHERE p.pageName=?;");   
    Sql.push("SELECT COUNT(*) AS nImage FROM "+pageTab+" p JOIN "+subImageTab+" s ON s.idPage=p.idPage WHERE p.pageName=?;"); 
    //Sql.push("SELECT p.siteName AS siteName FROM "+pageView+" p WHERE p.pageName=?;"); 
    Val.push(strName,strName,strName);
  }  
  var sql=Sql.join('\n');
  myQueryF(sql, Val, mysqlPool, function(err, results) {
    if(err){self.mesEO(err); callback('exited');  return; } 
    else{
      var len=results[0].length; Ou.Parent=Array(len);
      for(var i=0;i<len;i++) { Ou.Parent[i]=results[0][i].pageName;     }
      Ou.nSub=results[1][0].nSub;
      Ou.nImage=results[2][0].nImage;
      callback(null, [Ou]);
    }
  });
}*/
ReqBE.prototype.getPageList=function*(callback,inObj) {
  var self=this, req=this.req, res=this.res;
  var Sql=[];
  //var sql="SELECT pageName, boOR, boOW, boSiteMap, UNIX_TIMESTAMP(v.tMod) AS tMod, lastRev, boOther, p.idPage, idFile FROM "+pageTab+" p JOIN "+versionTab+" v ON p.idPage=v.idPage AND p.lastRev=v.rev";
  var tmpCond=array_filter(this.Where), strCond=''; if(tmpCond.length) strCond='WHERE '+tmpCond.join(' AND ');
  //Sql.push("SELECT SQL_CALC_FOUND_ROWS p.pageName AS pageName, p.boOR AS boOR, p.boOW AS boOW, p.boSiteMap AS boSiteMap, UNIX_TIMESTAMP(v.tMod) AS tMod, p.lastRev, v.boOther AS boOther, p.idPage AS idPage, v.idFile AS idFile, v.size AS size, COUNT(DISTINCT sc.pageName) AS nChild, COUNT(DISTINCT sI.imageName) AS nImage  FROM "+strTableRefPage+" "+strCond+" GROUP BY pageName;"); 
  //Sql.push("SELECT SQL_CALC_FOUND_ROWS p.pageName AS pageName, p.boOR AS boOR, p.boOW AS boOW, p.boSiteMap AS boSiteMap, UNIX_TIMESTAMP(v.tMod) AS tMod, p.lastRev, v.boOther AS boOther, p.idPage AS idPage, v.idFile AS idFile, v.size AS size, COUNT(DISTINCT sc.pageName) AS nChild, COUNT(DISTINCT sI.imageName) AS nImage, COUNT(DISTINCT pp.pageName) AS nParent, pp.pageName AS nameParent  FROM "+strTableRefPage+" "+strCond+" GROUP BY pageName;"); 
  //Sql.push("SELECT SQL_CALC_FOUND_ROWS p.pageName AS pageName, p.boOR AS boOR, p.boOW AS boOW, p.boSiteMap AS boSiteMap, UNIX_TIMESTAMP(v.tMod) AS tMod, p.lastRev, v.boOther AS boOther, p.idPage AS idPage, v.idFile AS idFile, v.size AS size, COUNT(DISTINCT sc.pageName) AS nChild, COUNT(DISTINCT sI.imageName) AS nImage, COUNT(DISTINCT sParCount.idPage) AS nParent, pParCount.pageName AS nameParent  FROM "+strTableRefPage+" "+strCond+" GROUP BY pageName;"); 
  //Sql.push("SELECT SQL_CALC_FOUND_ROWS p.pageName AS pageName, p.boOR AS boOR, p.boOW AS boOW, p.boSiteMap AS boSiteMap, UNIX_TIMESTAMP(p.tMod) AS tMod, p.lastRev, p.boOther AS boOther, p.idPage AS idPage, p.idFile AS idFile, p.size AS size, COUNT(DISTINCT sc.pageName) AS nChild, COUNT(DISTINCT sI.imageName) AS nImage, COUNT(DISTINCT sParCount.idPage) AS nParent, pParCount.pageName AS nameParent  FROM "+strTableRefPage+" "+strCond+" GROUP BY pageName;"); 
  Sql.push("SELECT SQL_CALC_FOUND_ROWS p.boTLS, p.siteName AS siteName, p.www AS www, p.pageName AS pageName, p.boOR AS boOR, p.boOW AS boOW, p.boSiteMap AS boSiteMap, UNIX_TIMESTAMP(p.tMod) AS tMod, p.lastRev, p.boOther AS boOther, p.idPage AS idPage, p.idFile AS idFile, p.size AS size, COUNT(DISTINCT sc.idSite, sc.pageName) AS nChild, COUNT(DISTINCT sI.imageName) AS nImage, COUNT(DISTINCT sParCount.idPage) AS nParent, pParCount.idPage AS idParent, pParCount.pageName AS nameParent  FROM "+strTableRefPage+" "+strCond+" GROUP BY siteName, pageName;"); 
//, pParCount.siteName AS siteParent

  Sql.push("SELECT FOUND_ROWS() AS n;"); // nFound
  Sql.push("SELECT count(idPage) AS n FROM "+pageTab+";"); // nUnFiltered
  var sql=Sql.join('\n'),   Val=[]; 
  /*myQueryF(sql, Val, mysqlPool, function(err, results) {
    if(err){self.mesEO(err); callback('exited');  return; } 
    else{
      var res0=results[0], len0=res0.length, tab=[], StrCol=[]; if(len0) StrCol=Object.keys(res0[0]);  var lenJ=StrCol.length;
      for(var i=0;i<len0;i++) {
        var row=res0[i], rowN=Array(lenJ);
        for(var j=0;j<lenJ;j++){ var key=StrCol[j]; rowN[j]=row[key]; }
        tab.push(rowN);
      } 
      Ou.tab=tab;Ou.StrCol=StrCol;
      Ou.NFilt=[results[1][0].n, results[2][0].n];
      callback(null, [Ou]);
    }
  });*/
  var semY=0, semCB=0, err, results;
  myQueryF(sql, Val, mysqlPool, function(errT, resultsT) {
    err=errT;  results=resultsT;
    if(semY) { req.flow.next(); } semCB=1;
  });
  if(!semCB) { semY=1; yield;}
  if(err){ self.mesEO(err); callback('exited');  return;  }
  var Ou=arrObj2TabNStrCol(results[0]);
  Ou.NFilt=[results[1][0].n, results[2][0].n];
  callback(null, [Ou]);
}

ReqBE.prototype.getPageHist=function*(callback,inObj){
  var self=this, req=this.req, res=this.res;
  var Ou={}
  //var strTableRefCount=pageTab+' p';
  var arg={strTableRef:strTableRefPageHist, Ou:Ou, WhereExtra:[], Prop:PropPage, StrOrderFilt:StrOrderFiltPage};  
  copySome(arg, this, ['Where']); arg.strDBPrefix=strDBPrefix; arg.pool=mysqlPool;
  
  var semY=0, semCB=0, err, results;
  getHist(arg, function(errT, resultsT){
    err=errT;  results=resultsT;
    if(semY) { req.flow.next(); } semCB=1;
  });
  if(!semCB) { semY=1; yield;}
  if(err){ self.mesEO(err); callback('exited');  return;  }
  Ou=results;

  var iColParent=KeyColPageFlip.parent, arrTmpA=results.Hist[iColParent], arrTmpB=[];
  //for(var i=arrTmpA.length-1;i>=0;i--){var boKeep=(arrTmpA[i] instanceof Array) && (typeof arrTmpA[i][0]==='number') if(!boKeep) mysplice1(arrTmpA,i); else arrTmpA[i]=arrTmpA[i][0]; }
  for(var i=0;i<arrTmpA.length;i++){var tmp=arrTmpA[i], boKeep=(tmp instanceof Array) && (typeof tmp[0]==='number'); if(boKeep) arrTmpB.push(tmp[0]);  }

  var len=arrTmpB.length;
  if(len){
    var sql="SELECT idPage, boTLS, www, siteName, pageName FROM "+pageWWWView+" WHERE idPage IN ("+arrTmpB.join(', ')+")",  Val=[];
    var semY=0, semCB=0, err, results;
    myQueryF(sql, Val, mysqlPool, function(errT, resultsT) {
      err=errT;  results=resultsT;
      if(semY) { req.flow.next(); } semCB=1;
    });
    if(!semCB) { semY=1; yield;}
    if(err){ self.mesEO(err); callback('exited');  return;  }
    Ou.ParentName=arrObj2TabNStrCol(results);
  }

  callback(null, [Ou]);

}


ReqBE.prototype.setUpImageListCond=function*(callback,inObj){
  var Ou={};
  var tmp=setUpCond(undefined, StrOrderFiltImage, PropImage, inObj);
  copySome(this,tmp,['strCol', 'Where']);
  callback(null, [Ou]);
}

ReqBE.prototype.getImageList=function*(callback,inObj) {
  var self=this, req=this.req, res=this.res;
  var Sql=[];
  //var sql="SELECT imageName, UNIX_TIMESTAMP(created) AS created, boOther, idImage, idFile FROM "+imageTab+"";
  var tmpCond=array_filter(this.Where), strCond=''; if(tmpCond.length) strCond='WHERE '+tmpCond.join(' AND ');
  //Sql.push("SELECT SQL_CALC_FOUND_ROWS i.imageName AS imageName, UNIX_TIMESTAMP(i.created) AS created, i.boOther AS boOther, i.idImage AS idImage, i.idFile AS idFile, i.size AS size  FROM "+strTableRefImage+" "+strCond+" GROUP BY imageName;"); 
  //Sql.push("SELECT SQL_CALC_FOUND_ROWS i.imageName AS imageName, UNIX_TIMESTAMP(i.created) AS created, i.boOther AS boOther, i.idImage AS idImage, i.idFile AS idFile, i.size AS size, COUNT(DISTINCT pp.pageName) AS nParent, pp.pageName AS nameParent  FROM "+strTableRefImage+" "+strCond+" GROUP BY imageName;"); 
  //Sql.push("SELECT SQL_CALC_FOUND_ROWS i.imageName AS imageName, UNIX_TIMESTAMP(i.created) AS created, i.boOther AS boOther, i.idImage AS idImage, i.idFile AS idFile, i.size AS size, COUNT(DISTINCT sParCount.idPage) AS nParent, pParCount.pageName AS nameParent  FROM "+strTableRefImage+" "+strCond+" GROUP BY imageName;"); 
  Sql.push("SELECT SQL_CALC_FOUND_ROWS i.imageName AS imageName, UNIX_TIMESTAMP(i.created) AS created, i.boOther AS boOther, i.idImage AS idImage, i.idFile AS idFile, i.size AS size, COUNT(DISTINCT sParCount.idPage) AS nParent, pParCount.idPage AS idParent, pParCount.pageName AS nameParent  FROM "+strTableRefImage+" "+strCond+" GROUP BY imageName;"); 
// , pParCount.siteName AS siteParent

  Sql.push("SELECT FOUND_ROWS() AS n;"); // nFound
  Sql.push("SELECT count(idImage) AS n FROM "+imageTab+";"); // nUnFiltered
  var sql=Sql.join('\n'),   Val=[]; 
  /*myQueryF(sql, Val, mysqlPool, function(err, results) {
    if(err){self.mesEO(err); callback('exited');  return; } 
    else{
      var res0=results[0], len0=res0.length, tab=[], StrCol=[]; if(len0) StrCol=Object.keys(res0[0]);  var lenJ=StrCol.length;
      for(var i=0;i<len0;i++) {
        var row=res0[i], rowN=Array(lenJ);
        for(var j=0;j<lenJ;j++){ var key=StrCol[j]; rowN[j]=row[key]; }
        tab.push(rowN);
      }   
      Ou.tab=tab; Ou.StrCol=StrCol;
      Ou.NFilt=[results[1][0].n, results[2][0].n];
      callback(null, [Ou]);
    }
  }); */
  var semY=0, semCB=0, err, results;
  myQueryF(sql, Val, mysqlPool, function(errT, resultsT) {
    err=errT;  results=resultsT;
    if(semY) { req.flow.next(); } semCB=1;
  });
  if(!semCB) { semY=1; yield;}
  if(err){ self.mesEO(err); callback('exited');  return;  }
  var Ou=arrObj2TabNStrCol(results[0]);
  Ou.NFilt=[results[1][0].n, results[2][0].n];
  callback(null, [Ou]);
}

ReqBE.prototype.getImageHist=function*(callback,inObj){
  var self=this, req=this.req, res=this.res;
  var Ou={}
  //var arg={strTableRef:strTableRefImage, Ou:Ou, WhereExtra:[], Prop:PropImage, StrOrderFilt:StrOrderFiltImage};
  var arg={strTableRef:strTableRefImageHist, Ou:Ou, WhereExtra:[], Prop:PropImage, StrOrderFilt:StrOrderFiltImage};  
  copySome(arg, this, ['Where']); arg.strDBPrefix=strDBPrefix;  arg.pool=mysqlPool;
  

  var semY=0, semCB=0, err, results;
  getHist(arg, function(errT, resultsT){
    err=errT;  results=resultsT;
    if(semY) { req.flow.next(); } semCB=1;
  });
  if(!semCB) { semY=1; yield;}
  if(err){ self.mesEO(err); callback('exited');  return;  }
  Ou=results;

  var iColParent=KeyColImageFlip.parent, arrTmpA=results.Hist[iColParent], arrTmpB=[];
  //for(var i=arrTmpA.length-1;i>=0;i--){var boKeep=(arrTmpA[i] instanceof Array) && (typeof arrTmpA[i][0]==='number') if(!boKeep) mysplice1(arrTmpA,i); else arrTmpA[i]=arrTmpA[i][0]; }
  for(var i=0;i<arrTmpA.length;i++){var tmp=arrTmpA[i], boKeep=(tmp instanceof Array) && (typeof tmp[0]==='number'); if(boKeep) arrTmpB.push(tmp[0]);  }

  var len=arrTmpB.length;
  if(len){
    var sql="SELECT idPage, boTLS, www, siteName, pageName FROM "+pageWWWView+" WHERE idPage IN ("+arrTmpB.join(', ')+")",  Val=[];
    var semY=0, semCB=0, err, results;
    myQueryF(sql, Val, mysqlPool, function(errT, resultsT) {
      err=errT;  results=resultsT;
      if(semY) { req.flow.next(); } semCB=1;
    });
    if(!semCB) { semY=1; yield;}
    if(err){ self.mesEO(err); callback('exited');  return;  }
    Ou.ParentName=arrObj2TabNStrCol(results);
  }

  callback(null, [Ou]);

}

ReqBE.prototype.getPageInfo=function*(callback,inObj){
  var self=this, req=this.req, res=this.res, Ou={}
  var GRet=this.GRet;
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
    var strQ='false'; if(arrQ.length) strQ=arrQ.join (' OR ');
    sql+=" WHERE "+strQ;
  } 

  myQueryF(sql, Val, mysqlPool, function(err, results) {
    if(err){res.out500(err); callback('exited');  return; } 
    else{
      //var tmp=results[0];
      Ou.FileInfo=results;
      callback(null, [Ou]);
    }
  });
}
ReqBE.prototype.getImageInfo=function*(callback,inObj){
  var self=this, req=this.req, res=this.res, Ou={}
  var GRet=this.GRet;
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
  myQueryF(sql, Val, mysqlPool, function(err, results) {
    if(err){res.out500(err); callback('exited');  return; } 
    else{
      Ou.FileInfo=results;
      callback(null, [Ou]);
    }
  });
}


ReqBE.prototype.redirectTabGet=function*(callback,inObj){ 
  var self=this, req=this.req, res=this.res;
  var GRet=this.GRet;
  if(!this.boALoggedIn) { self.mesO('Not logged in as admin'); callback('exited'); return; }
  var sql="SELECT idSite, siteName, www, pageName, url, UNIX_TIMESTAMP(created) AS created FROM "+redirectWWWView+";";
  //var sql="SELECT idSite, pageName, url, UNIX_TIMESTAMP(created) AS created FROM "+redirectTab+";";
  var Val=[];
  /*myQueryF(sql, Val, mysqlPool, function(err, results) {
    if(err){self.mesEO(err); callback('exited');  return; } 
    else{
      var lenI=results.length; Ou.tab=Array(lenI);
      var StrCol=[]; if(lenI) StrCol=Object.keys(results[0]); var lenJ=StrCol.length;
      for(var i=0;i<lenI;i++) {
        var row=results[i], rowN=Array(lenJ);
        for(var j=0;j<lenJ;j++){ var key=StrCol[j]; rowN[j]=row[key]; }
        Ou.tab.push(rowN);
      } 
      Ou.StrCol=StrCol;
      self.mes("Got "+lenI+" entries"); 
      extend(Ou, {boOK:1,nEntry:lenI});     
      callback(null, [Ou]);
    }
  });*/
  var semY=0, semCB=0, err, results;
  myQueryF(sql, Val, mysqlPool, function(errT, resultsT) {
    err=errT;  results=resultsT;
    if(semY) { req.flow.next(); } semCB=1;
  });
  if(!semCB) { semY=1; yield;}
  if(err){ self.mesEO(err); callback('exited');  return;  }
  var Ou=arrObj2TabNStrCol(results);
  self.mes("Got "+results.length+" entries"); 
  extend(Ou, {boOK:1,nEntry:results.length});
  callback(null, [Ou]);
}
ReqBE.prototype.redirectTabSet=function*(callback,inObj){
  var self=this, req=this.req, res=this.res;
  var GRet=this.GRet;
  var Ou={};
  if(!this.boALoggedIn) { self.mesO('Not logged in as admin'); callback('exited'); return; }
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
  
  myQueryF(sql, Val, mysqlPool, function(err, results){
    var boOK, mestmp;
    if(err && (typeof err=='object') && err.code=='ER_DUP_ENTRY'){boOK=0; mestmp='dup key';}
    else if(err){
      self.mesEO(err); callback('exited');  return;
    }
    else{
      boOK=1; mestmp="Done";
    }
    self.mes(mestmp);
    extend(Ou, {boOK:boOK});
    callback(null, [Ou]);
    
  });
}
ReqBE.prototype.redirectTabDelete=function*(callback,inObj){ 
  var self=this, req=this.req, res=this.res;
  var GRet=this.GRet;
  var Ou={};
  if(!this.boALoggedIn) { self.mesO('Not logged in as admin'); callback('exited'); return; }
  var sql="DELETE FROM "+redirectTab+" WHERE idSite=? AND pageName=?";
  var Val=[inObj.idSite, inObj.pageName];
  myQueryF(sql, Val, mysqlPool, function(err, results) {
    if(err){self.mesEO(err); callback('exited');  return; } 
    else{
      var c=results.affectedRows, boOK, mestmp; 
      if(c==1) {boOK=1; mestmp="Entry deleted"; } else {boOK=1; mestmp=c+ " entries deleted!?"; }
      self.mes(mestmp);
      Ou.boOK=boOK;      
      callback(null, [Ou]);
    }
  });
}

ReqBE.prototype.siteTabGet=function*(callback,inObj){ 
  var self=this, req=this.req, res=this.res;
  var GRet=this.GRet;
  var Ou={};
  if(!this.boALoggedIn) { self.mesO('Not logged in as admin'); callback('exited'); return; }
  //var sql="SELECT idSite, siteName, www, googleAnalyticsTrackingID, urlIcon16, urlIcon200, UNIX_TIMESTAMP(created) AS created FROM "+siteTab+";";
  var sql="SELECT boDefault, boTLS, st.idSite AS idSite, siteName, www, googleAnalyticsTrackingID, urlIcon16, urlIcon200, UNIX_TIMESTAMP(st.created) AS created, SUM(p.idSite IS NOT NULL) AS nPage FROM "+siteTab+" st LEFT JOIN "+pageTab+" p ON st.idSite=p.idSite GROUP BY idSite;"
  var Val=[];
  /*myQueryF(sql, Val, mysqlPool, function(err, results) {
    if(err){self.mesEO(err); callback('exited');  return; } 
    else{
      var lenI=results.length; Ou.tab=Array(lenI);
      var StrCol=[]; if(lenI) StrCol=Object.keys(results[0]); var lenJ=StrCol.length;
      for(var i=0;i<lenI;i++) {
        var row=results[i], rowN=Array(lenJ);
        for(var j=0;j<lenJ;j++){ var key=StrCol[j]; rowN[j]=row[key]; }
        Ou.tab.push(rowN);
      } 
      Ou.StrCol=StrCol;
      self.mes("Got "+lenI+" entries");
      Ou.boOK=1;      
      callback(null, [Ou]);
    }
  });*/
  var semY=0, semCB=0, err, results;
  myQueryF(sql, Val, mysqlPool, function(errT, resultsT) {
    err=errT;  results=resultsT;
    if(semY) { req.flow.next(); } semCB=1;
  });
  if(!semCB) { semY=1; yield;}
  if(err){ self.mesEO(err); callback('exited');  return;  }
  var Ou=arrObj2TabNStrCol(results);
  self.mes("Got "+results.length+" entries");
  Ou.boOK=1;
  callback(null, [Ou]);
}

ReqBE.prototype.siteTabSet=function*(callback,inObj){ 
  var self=this, req=this.req, res=this.res;
  var GRet=this.GRet;
  var Ou={};
  if(!this.boALoggedIn) { self.mesO('Not logged in as admin'); callback('exited'); return; }
  var boUpd=inObj.boUpd||false;

  if(boUpd){
    var sql="UPDATE "+siteTab+" SET boTLS=?, siteName=?, www=?, googleAnalyticsTrackingID=?, urlIcon16=?, urlIcon200=? WHERE idSite=?;";  //, created=now() 
    var Val=[inObj.boTLS, inObj.siteName, inObj.www, inObj.googleAnalyticsTrackingID, inObj.urlIcon16, inObj.urlIcon200, inObj.idSite];
  } else {
    var sql="INSERT INTO "+siteTab+" (boTLS, siteName, www, googleAnalyticsTrackingID, urlIcon16, urlIcon200, created) VALUES (?, ?, ?, ?, ?, ?, now());";
    var Val=[inObj.boTLS, inObj.siteName, inObj.www, inObj.googleAnalyticsTrackingID, inObj.urlIcon16, inObj.urlIcon200];
    sql+="SELECT LAST_INSERT_ID() AS idSite;";
  }
  
  myQueryF(sql, Val, mysqlPool, function(err, results){
    var boOK, mestmp, idSite=inObj.idSite;
    if(err && (typeof err=='object') && err.code=='ER_DUP_ENTRY'){boOK=0; mestmp='dup key';}
    else if(err){
      self.mesEO(err); callback('exited');  return;
    }
    else{
      boOK=1; mestmp="Done";
      if(boUpd){}
      else{idSite=results[1][0].idSite;}
    }
    self.mes(mestmp);
    extend(Ou, {boOK:boOK, idSite:idSite});
    callback(null, [Ou]);
    
  });
}
ReqBE.prototype.siteTabDelete=function*(callback,inObj){ 
  var self=this, req=this.req, res=this.res;
  var GRet=this.GRet;
  var Ou={};
  if(!this.boALoggedIn) { self.mesO('Not logged in as admin'); callback('exited'); return; }
  var sql="DELETE FROM "+siteTab+" WHERE siteName=?";
  var Val=[inObj.siteName];
  myQueryF(sql, Val, mysqlPool, function(err, results) {
    if(err){self.mesEO(err); callback('exited');  return; } 
    else{
      var c=results.affectedRows, boOK, mestmp; 
      if(c==1) {boOK=1; mestmp="Entry deleted"; } else {boOK=1; mestmp=c+ " entries deleted!?"; }
      self.mes(mestmp);
      Ou.boOK=boOK;      
      callback(null, [Ou]);
    }
  });
}
ReqBE.prototype.siteTabSetDefault=function*(callback,inObj){ 
  var self=this, req=this.req, res=this.res;
  var GRet=this.GRet;
  var Ou={};
  if(!this.boALoggedIn) { self.mesO('Not logged in as admin'); callback('exited'); return; }
  var Sql=[];
  Sql.push("START TRANSACTION;");
  Sql.push("UPDATE "+siteTab+" SET boDefault=0;");
  Sql.push("UPDATE "+siteTab+" SET boDefault=1 WHERE idSite=?;");
  Sql.push("COMMIT;");
  var sql=Sql.join('\n'),    Val=[inObj.idSite];
  myQueryF(sql, Val, mysqlPool, function(err, results) {
    if(err){self.mesEO(err); callback('exited');  return; } 
    else{
      self.mes("OK");
      callback(null, [Ou]);
    }
  });
}




ReqBE.prototype.uploadAdmin=function*(callback,inObj){
  var self=this, req=this.req, res=this.res;
  var GRet=this.GRet;
  var Ou={};
  if(!this.boALoggedIn) { self.mesO('Not logged in as admin'); callback('exited'); return; }
  var regBoTalk=RegExp('(template_)?talk:');
  var FileOrg=self.File;
  var n=FileOrg.length;
  var tmp=n+" files."; console.log(tmp); self.mes(tmp); 
  var FileTalk=[]; for(var i=FileOrg.length-1;i>=0;i--){ if(regBoTalk.test(FileOrg[i].name)) { var item=mySplice1(FileOrg,i);  FileTalk.push(item);  }  } FileOrg=FileTalk.concat(FileOrg);
  for(var i=0;i<FileOrg.length;i++){
    var fileOrg=FileOrg[i], tmpname=fileOrg.path;
    var dataOrg, boDoExit=0;
    fs.readFile(tmpname, function(err, buf) { //, this.encRead
      if(err){ boDoExit=1; res.out500(err);  }
      else dataOrg=buf; //.toString();
      req.flow.next();
    });
    yield;
    if(boDoExit==1) { callback('exited'); return; }
    if(fileOrg.type=='application/zip' || fileOrg.type=='application/x-zip-compressed'){
       
      var zip=new NodeZip(dataOrg, {base64: false, checkCRC32: true});
      var FileInZip=zip.files;
      
      var tmp="Zip file with "+Object.keys(FileInZip).length+" files."; console.log(tmp); self.mes(tmp);
      var Key=Object.keys(FileInZip), KeyTalk=[];  for(var j=Key.length-1;j>=0;j--){ if(regBoTalk.test(Key[j])) { var item=mySplice1(Key,j);  KeyTalk.push(item); } }  Key=KeyTalk.concat(Key);  
      //for(var fileName in File){
      for(var j=0;j<Key.length;j++){
        var fileName=Key[j];
        var fileInZip=FileInZip[fileName];
        var Match=RegExp('\\.(\\w{1,3})$').exec(fileName);
        var type=Match[1].toLowerCase(), bufT=new Buffer(fileInZip._data,'binary');//b.toString();

        yield* self.storeUploadedFile.call(self,fileName,type,bufT,callback);  
      } 

    } else {  
      var fileName=fileOrg.name;
      var Match=RegExp('\\.(\\w{1,4})$').exec(fileName);
      var type=Match[1].toLowerCase();
 
      yield* self.storeUploadedFile.call(self,fileName,type,dataOrg,callback);  
    } 
  }
  callback(null, [0]);
}

//regTalkOrTemplate=RegExp("(template_)?talk");

ReqBE.prototype.storeUploadedFile=function*(fileName,type,data,callback){
  var self=this, req=this.req, res=this.res;
  var regImg=RegExp("^(png|jpeg|jpg|gif|svg)$"), regVid=RegExp('^(mp4|ogg|webm)$');
  
  if(type=='txt'){
    //fileName=fileName.replace(RegExp('(talk|template|template_talk) ','i'),'$1:');   
    fileName=fileName.replace(RegExp('.txt$','i'),'');
    var obj=parsePage(fileName);
    var siteName=obj.siteName, pageName=obj.pageName;

    extend(self,{strEditText:data.toString(), boOW:1, boOR:1, boSiteMap:1});

            // parse
    var semY=0, semCB=0, boDoExit=0;
    var tmpf=function(err,results){
      if(err){boDoExit=1; self.mesEO(err); } 
      if(semY) { req.flow.next(); } semCB=1;
    }
    yield* parse.call(self,tmpf);
    if(!semCB) { semY=1; yield;}
    if(boDoExit==1) { callback('exited'); return; }

          // saveByReplace
    var mess='', tmp=createSaveByReplaceSQL(siteName, '', pageName, self.strEditText, self.strHtmlText, '', self.arrSub, self.StrSubImage),     sql=tmp.sql, Val=tmp.Val, nEndingResults=tmp.nEndingResults;
    console.log(siteName+', '+pageName+', '+self.strEditText.length+', '+self.strHtmlText.length+', nSub:'+self.arrSub.length+', nsubImage:'+self.StrSubImage.length);
    console.time('bla');
    var boDoExit=0;
    myQueryF(sql, Val, mysqlPool, function(err, results) {
      if(err){boDoExit=1; self.mesEO(err); }
      else{
        var iRowLast=results.length-nEndingResults-1;
        mess=results[iRowLast][0].mess;//if(typeof results[iRowLast][0]=='object')
      }
      req.flow.next();
    });
    yield;
    
 /*
    var mess='', tmp=createSaveByReplaceNeo(siteName, '', pageName, self.strEditText, self.strHtmlText, '', self.arrSub, self.StrSubImage),     sql=tmp.sql, Val=tmp.Val, nEndingResults=tmp.nEndingResults;
    console.time('bla');
    var boDoExit=0;
    myQueryF(sql, Val, mysqlPool, function(err, results) {
      if(err){boDoExit=1; self.mesEO(err); }
      else{
        var iRowLast=results.length-nEndingResults-1;
        mess=results[iRowLast][0].mess;//if(typeof results[iRowLast][0]=='object')
      }
      req.flow.next();
    });
    yield;
 */
 
    console.timeEnd('bla');
    if(boDoExit==1) { callback('exited'); return; }
    if(mess!='done'){console.log(mess); debugger;}

  }else if(regImg.test(type)){
    var eTag=md5(data); 
    //var dim=imageSize(data);  console.log(fileName+', w/h: '+dim.width+' / '+dim.height);
    var sql="CALL "+strDBPrefix+"storeImage(?,?,?,?,@boOK)";
    var Val=[fileName,0,data,eTag], boDoExit=0;
    myQueryF(sql, Val, mysqlPool, function(err, results) {
      if(err){ boDoExit=1; self.mesEO(err); } 
      req.flow.next();
    });
    yield;
    if(boDoExit==1) { callback('exited'); return; }
  }else if(regVid.test(type)){ 
    var eTag=md5(data);
    var sql="CALL "+strDBPrefix+"storeVideo(?,?,?)";
    var Val=[fileName,data,eTag], boDoExit=0;
    myQueryF(sql, Val, mysqlPool, function(err, results) {
      if(err){ boDoExit=1; self.mesEO(err);  } 
      req.flow.next();
    });
    yield;
    if(boDoExit==1) { callback('exited'); return; }
  }
  else{ self.mes("Unrecognized file type: "+type); callback(null,[Ou]); return; }

  //process.stdout.write("*");
}



ReqBE.prototype.uploadUser=function*(callback,inObj){
  var self=this, req=this.req, res=this.res, sessionID=req.sessionID;
  var GRet=this.GRet;
  var Ou={};
  var regImg=RegExp("^(png|jpeg|jpg|gif|svg)$"), regVid=RegExp('^(mp4|ogg|webm)$');

  //if(self.captchaIn!=session.captcha) { Ou.strMessage='Wrong captcha'; callback(null,[Ou]);  return;}
  var redisVar=sessionID+'_captcha';
  var tmp=yield* wrapRedisSendCommand.call(req, 'get',[redisVar]);
  if(self.captchaIn!=tmp) { Ou.strMessage='Wrong captcha'; callback(null,[Ou]);  return;}
  var File=self.File;
  var n=File.length; self.mes("nFile: "+n);

  
  var file=File[0], tmpname=file.path, fileName=file.name; if(self.strName.length) fileName=self.strName;
  var Match=RegExp('\\.(\\w{1,3})$').exec(fileName); 
  if(!Match){ Ou.strMessage="The file name should be in the form xxxx.xxx"; callback(null,[Ou]); return; }
  var type=Match[1].toLowerCase(),data, boDoExit=0;
  fs.readFile(tmpname, function(err, buf) { //, this.encRead
    if(err){ boDoExit=1; self.mesEO(err);   }
    else data=buf;//.toString();
    req.flow.next();
  });
  yield;
  if(boDoExit==1) { callback('exited'); return; }
  if(data.length==0){ self.mes("data.length==0"); callback(null,[Ou]); return; }

  if(regImg.test(type)){
          // autoOrient
    var myCollector=concat(function(buf){      data=buf;  req.flow.next();     }), boDoExit=0; 
    var streamImg=gm(data).autoOrient().stream(function streamOut(err, stdout, stderr) {
      if(err){ boDoExit=1; self.mesEO(err); return; } 
      stdout.pipe(myCollector); 
    });
    yield;
    if(boDoExit==1) { callback('exited'); return; }  

    var eTag=md5(data);
    //var dim=imageSize(data);  console.log(fileName+', w/h: '+dim.width+' / '+dim.height);
    var sql="CALL "+strDBPrefix+"storeImage(?,?,?,?,@boOK)";
    var Val=[fileName,1,data,eTag], boDoExit=0;
    myQueryF(sql, Val, mysqlPool, function(err, results) {
      if(err){ boDoExit=1; self.mesEO(err); } 
      req.flow.next();
    });
    yield;
    if(boDoExit==1) { callback('exited'); return; }
  }else if(regVid.test(type)){ 
    var eTag=md5(data);
    var sql="CALL "+strDBPrefix+"storeVideo(?,?,?)";
    var Val=[fileName,data,eTag], boDoExit=0;
    myQueryF(sql, Val, mysqlPool, function(err, results) {
      if(err){ boDoExit=1; self.mesEO(err);  } 
      req.flow.next();
    });
    yield;
    if(boDoExit==1) { callback('exited'); return; }
  }
  else{ Ou.strMessage="Unrecognized file type: "+type; callback(null,[Ou]); return; }

  Ou.strMessage="Done";
  callback(null, [Ou]);
}






