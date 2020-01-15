"use strict"


/******************************************************************************
 * ReqBE
 ******************************************************************************/
app.ReqBE=function(objReqRes){
  Object.assign(this, objReqRes);
  this.Str=[];
}

  // Method "mesO" and "mesEO" are only called from "go". Method "mes" can be called from any method.
ReqBE.prototype.mes=function(str){ this.Str.push(str); }
ReqBE.prototype.mesO=function(e){
  var res=this.res;
    // Prepare an error-message for the browser.
  var strEBrowser;
  if(typeof e=='string'){strEBrowser=e; }
  else if(typeof e=='object'){
    if(e instanceof Error) {strEBrowser='message: ' + e.message; }
    else { strEBrowser=e.toString(); }
  }
  
    // Write message (and other data) to browser
  this.Str.push(strEBrowser);
  this.GRet.strMessageText=this.Str.join(', '); 
  
    // mmmWiki specific
  var GRet=this.GRet;    //if('tMod' in GRet && GRet.tMod instanceof Date ) GRet.tMod=GRet.tMod.toUnix();
  
  var str=serialize(this.Out);
  if(str.length<lenGZ) res.end(str);
  else{
    res.setHeader("Content-Encoding", 'gzip');
    //res.setHeader('Content-Type', MimeType.txt);
    Streamify(str).pipe(zlib.createGzip()).pipe(res);
  }
}
ReqBE.prototype.mesEO=function(e){
  var res=this.res;
    // Prepare an error-message for the browser and one for the error log.
  var StrELog=[], strEBrowser;
  if(typeof e=='string'){strEBrowser=e; StrELog.push(e);}
  else if(typeof e=='object'){
    if('syscal' in e) StrELog.push('syscal: '+e.syscal);
    if(e instanceof Error) {strEBrowser='name: '+e.name+', code: '+e.code+', message: ' + e.message; }
    else { strEBrowser=e.toString(); StrELog.push(strEBrowser); }
  }
    
  var strELog=StrELog.join('\n'); console.error(strELog);  // Write message to the error log
  if(e instanceof Error) { console.error(e);}   // Write stack to error log
  
    // Write message (and other data) to browser
  this.Str.push(strEBrowser);
  this.GRet.strMessageText=this.Str.join(', ');
  
    // mmmWiki specific
  var GRet=this.GRet;    //if('tMod' in GRet && GRet.tMod instanceof Date) GRet.tMod=GRet.tMod.toUnix();
  
  //res.writeHead(500, {"Content-Type": MimeType.txt}); 
  res.end(serialize(this.Out));
}



ReqBE.prototype.go=function*(){
  var req=this.req, res=this.res;
  var flow=req.flow;
  
  this.Out={GRet:{boSpecialistExistDiff:{}}, dataArr:[]}; this.GRet=this.Out.GRet;

  
  var strT=req.headers['Sec-Fetch-Site'];
  if(strT && strT!='same-origin') { this.mesEO(new Error("Sec-Fetch-Site header is not 'same-origin' ("+strT+")"));  return;}
  
  
  if('x-requested-with' in req.headers && req.headers['x-requested-with']=="XMLHttpRequest") ; else { this.mesEO(new Error("Ajax-request: req.headers['x-requested-with']!='XMLHttpRequest'"));  return; }
  var urlT=req.strSchemeLong+req.wwwSite, lTmp=urlT.length;
  if('referer' in req.headers && req.headers.referer.slice(0,lTmp)==urlT) ; else { this.mesEO(new Error("Referer is wrong"));  return; }

    // Extract input data either 'POST' or 'GET'
  var jsonInput;
  if(req.method=='POST'){
    if('x-type' in req.headers ){ //&& req.headers['x-type']=='single'
      var form = new formidable.IncomingForm();
      form.multiples = true;  

      var err, fields, files;
      form.parse(req, function(errT, fieldsT, filesT) { err=errT; fields=fieldsT; files=filesT; flow.next();  });  yield;  if(err){ this.mesEO(err);  return; } 
      
      this.File=files['fileToUpload[]'];
      if('g-recaptcha-response' in fields) this.captchaIn=fields['g-recaptcha-response']; else this.captchaIn='';
      if('strName' in fields) this.strName=fields.strName; else this.strName='';
      if(!(this.File instanceof Array)) this.File=[this.File];
      jsonInput=fields.vec;
      

    }else{
      var buf, myConcat=concat(function(bufT){ buf=bufT; flow.next();  });    req.pipe(myConcat);    yield;
      jsonInput=buf.toString();
    }
  } else if(req.method=='GET'){
    var objUrl=url.parse(req.url), qs=objUrl.query||''; jsonInput=urldecode(qs);
    //  With jQuery: "/be.json?[[%22pageLoad%22,1],[%22page%22,%22start%22]]"
    //  Now: "/be.json?%5B%5B%22pageLoad%22%2C1%5D%2C%5B%22page%22%2C%22start%22%5D%5D"
  }
  
  try{ var beArr=JSON.parse(jsonInput); }catch(e){ this.mesEO(e);  return; }
  
  //if(!req.boCookieStrictOK) {this.mesEO(new Error('Strict cookie not set'));  return;   }
  
    // Get boARLoggedIn / boAWLoggedIn.  Conditionally push deadlines forward ("expire" returns 1 if timer was set or 0 if variable doesn't exist)
  var luaCountFunc=`local c=redis.call('GET',KEYS[1]); redis.call('EXPIRE',KEYS[1], ARGV[1]); return c`;
  var [err,value]=yield* cmdRedis(flow, 'EVAL',[luaCountFunc, 1, this.req.cookies.sessionID+'_adminRTimer', maxAdminRUnactivityTime]); this.boARLoggedIn=Number(value);
  var [err,value]=yield* cmdRedis(flow, 'EVAL',[luaCountFunc, 1, this.req.cookies.sessionID+'_adminWTimer', maxAdminWUnactivityTime]); this.boAWLoggedIn=Number(value);
  
  

  //res.setHeader("Content-type", MimeType.json);


    // Remove the beArr[i][0] values that are not functions
  var CSRFIn; this.dateTModBrowser=new Date(0); 
  for(var i=beArr.length-1;i>=0;i--){ 
    var row=beArr[i];
    if(row[0]=='page') {this.pageName=row[1]; array_removeInd(beArr,i);}
    else if(row[0]=='tMod') {this.dateTModBrowser=new Date(Number(row[1])*1000); array_removeInd(beArr,i);}
    else if(row[0]=='CSRFCode') {CSRFIn=row[1]; array_removeInd(beArr,i);}
  }

  var len=beArr.length;
  var StrInFunc=Array(len); for(var i=0;i<len;i++){StrInFunc[i]=beArr[i][0];}
  var arrCSRF, arrNoCSRF, allowed, boCheckCSRF, boSetNewCSRF;

           // Arrays of functions
    // Functions that changes something must check and refresh CSRF-code
  var arrCSRF=['myChMod', 'myChModImage', 'saveByAdd', 'saveByReplace', 'uploadUser', 'uploadAdmin', 'loadFrServW', 'getPageInfo', 'getImageInfo', 'getLastTModNTLastBU', 'setUpPageListCond','getPageList','getPageHist', 'setUpImageListCond','getImageList','getImageHist', 'getParent','getParentOfImage','getSingleParentExtraStuff', 'deletePage','deleteImage','renamePage','renameImage', 'redirectTabGet','redirectTabSet','redirectTabDelete', 'redirectTabResetNAccess', 'siteTabGet', 'siteTabSet', 'siteTabDelete', 'siteTabSetDefault'];
  var arrNoCSRF=['specSetup','vLogin','aLogin','aLogout','pageLoad','pageCompare','getPreview'];  
  allowed=arrCSRF.concat(arrNoCSRF);

    // Assign boCheckCSRF and boSetNewCSRF
  boCheckCSRF=0; boSetNewCSRF=0;   for(var i=0; i<beArr.length; i++){ var row=beArr[i]; if(in_array(row[0],arrCSRF)) {  boCheckCSRF=1; boSetNewCSRF=1;}  }    
  if(StrComp(StrInFunc,['specSetup'])){ boCheckCSRF=0; boSetNewCSRF=1; } // Public pages
  var boSinglePageLoad=StrComp(StrInFunc,['pageLoad']);
  if(boSinglePageLoad){ boCheckCSRF=0; boSetNewCSRF=0; } // Private pages: CSRF was set in index.html
  
    // Require POST-request for most combinations
  if(!boSinglePageLoad && req.method=='GET')  {this.mesEO(new Error("GET-request is not allowed."));  return;}
  
  //if(boDbg) boCheckCSRF=0;
  
  // Private:
  //                                                                 index.html  first ajax (pageLoad)
  //Shall look the same (be cacheable (not include boARLoggedIn etc))     no           yes

  // Public:
  //                                                                 index.html  first ajax (specSetup)
  //Shall look the same (be cacheable (not include boARLoggedIn etc))     yes          no


  var pageName=this.pageName;
    // cecking/set CSRF-code
    
  
      
  var CSRFCode=null;
  if(boCheckCSRF){
    if(!CSRFIn){ this.mesO('CSRFCode not set (try reload page)'); return;}
    
    if(!('sessionIDCSRF' in req.cookies)) { this.mesO('sessionIDCSRF cookie not set (try reload page)'); return;}
    var luaCountFunc=`local c=redis.call('GET',KEYS[1]); redis.call('EXPIRE',KEYS[1], ARGV[1]); return c`;
    var [err,CSRFCode]=yield* cmdRedis(flow, 'EVAL', [luaCountFunc, 1, req.cookies.sessionIDCSRF+'_CSRF', maxAdminRUnactivityTime]);
     

    if(!CSRFCode) { this.mesO('No such CSRF code stored for that sessionIDCSRF (try reload page)'); return;}
    if(CSRFIn!==CSRFCode){ this.mesO('CSRFCode not matching store value (try reload page)'); return;}
 
  }
  
  if(boSetNewCSRF) {
    if(boCheckCSRF) { var sessionIDCSRF=req.cookies.sessionIDCSRF;}
    else{
      var sessionIDCSRF=null, CSRFCode=null;
      if('sessionIDCSRF' in req.cookies) { 
        sessionIDCSRF=req.cookies.sessionIDCSRF;
        var luaCountFunc=`local c=redis.call('GET',KEYS[1]); redis.call('EXPIRE',KEYS[1], ARGV[1]); return c`;
        var [err,CSRFCode]=yield* cmdRedis(flow, 'EVAL', [luaCountFunc, 1, sessionIDCSRF+'_CSRF', maxAdminRUnactivityTime]);
        if(!CSRFCode) sessionIDCSRF=randomHash(); // To avoid session fixation
      }  else sessionIDCSRF=randomHash();
    } 

    var CSRFCode=randomHash();
    var [err,tmp]=yield* cmdRedis(flow, 'SET', [sessionIDCSRF+'_CSRF', CSRFCode, 'EX', maxAdminRUnactivityTime]);
    this.GRet.CSRFCode=CSRFCode;
    
    res.setHeader("Set-Cookie", "sessionIDCSRF="+sessionIDCSRF+strCookiePropLax); 
  }
  

  var Func=[];
  for(var k=0; k<beArr.length; k++){
    var strFun=beArr[k][0];
    if(in_array(strFun,allowed)) {
      var inObj=beArr[k][1],     tmpf; if(strFun in this) tmpf=this[strFun]; else tmpf=global[strFun];
      if(typeof inObj=='undefined' || typeof inObj=='object') {} else {this.mesO('inObj should be of type object or undefined'); return;}
      var fT=[tmpf,inObj];   Func.push(fT);
    }
  }


  for(var k=0; k<Func.length; k++){
    var [func,inObj]=Func[k],   [err, result]=yield* func.call(this, inObj);
    if(res.finished) return;
    else if(err){
      if(typeof err=='object' && err.name=='ErrorClient') this.mesO(err); else this.mesEO(err);     return;
    }
    else this.Out.dataArr.push(result);
  }
  this.mesO();
  
}


ReqBE.prototype.vLogin=function*(inObj){
  var req=this.req, flow=req.flow;
  var GRet=this.GRet;
  var Ou={};  
  if(this.boARLoggedIn!=1 ){
    if('pass' in inObj) {
      var vPass=inObj.pass; 
      if(vPass==aRPassword){
        //var sessionIDOld=req.sessionID;
        //var [err,tmp]=yield* cmdRedis(req.flow, 'SET', [sessionIDOld+'_adminRTimer',1,'EX', maxAdminRUnactivityTime]);
        this.boARLoggedIn=1; this.mes('Logged in (viewing)');
          // Changing session-token at login (as recomended by security recomendations) (to prevent session fixation)
        //var sessionIDNew=randomHash();
        //var StrSuffix=['_adminRTimer', '_adminWTimer', '_CSRF']; //, '_Counter' '_'+this.pageName+
        //var Str=['sessionIDAdminR', 'sessionIDAdminW', 'sessionIDCSRF'];
        //var err=yield* changeSessionId.call(this, sessionIDNew, StrSuffix);
        //var err=yield* changeSessionId.call(this, 'sessionID', sessionIDNew, StrSuffix);
        //var err=yield* changeSessionId.call(this, 'sessionID', StrSuffix);
        //var [err, req.sessionID]=yield* changeSessionId.call(this, req.sessionID, '_adminRTimer'); if(err) return [err];
        //var [err, req.sessionID]=yield* changeSessionId.call(this, req.sessionID, '_adminWTimer'); if(err) return [err];
        
        //var sessionIDOld=sessionID, sessionID=randomHash();
        //var strSuffix='_adminRTimer', redisVarO=sessionIDOld+strSuffix, redisVarN=sessionID+strSuffix; 
        //var [err,value]=yield* cmdRedis(req.flow, 'rename', [redisVarO, redisVarN]); if(err) return [err];
        //var strSuffix='_adminWTimer', redisVarO=sessionIDOld+strSuffix, redisVarN=sessionID+strSuffix; 
        //var [err,value]=yield* cmdRedis(req.flow, 'rename', [redisVarO, redisVarN]); if(err) return [err];
        
        if('sessionID' in req.cookies) {
          var sessionIDOld=req.cookies.sessionID;
          var [err]=yield* cmdRedis(flow, 'DEL', [sessionIDOld+'_adminRTimer', sessionIDOld+'_adminWTimer']);
        }
        var sessionID=randomHash();
        var [err]=yield* cmdRedis(flow, 'SET', [sessionID+'_adminRTimer', 1, 'EX', maxAdminRUnactivityTime]);
        //var luaCountFunc=`local redis.call('DEL',KEYS[1]); redis.call('SET', ARGV[1], 1, 'EX', ARGV[2]);`;
        var arrCookie=["sessionID="+sessionID+strCookiePropLax];
        //var luaCountFunc=`local c=redis.call('GET',KEYS[1]); if(c>0) then redis.call('RENAME', KEYS[1], ARGV[1]); return c`;
        //var [err,CSRFCode]=yield* cmdRedis(flow, 'EVAL', [luaCountFunc, 1, req.cookies.sessionIDCSRF+'_CSRF', maxAdminRUnactivityTime]);
        
        if('sessionIDCSRF' in req.cookies) {
          //var [err]=yield* changeSessionId.call(this, req.cookies.sessionIDCSRF, '_CSRF'); if(err) return [err];
          var sessionIDOld=req.cookies.sessionIDCSRF, sessionID=randomHash();
          var strSuffix='_CSRF', redisVarO=sessionIDOld+strSuffix, redisVarN=sessionID+strSuffix; 
          var [err,value]=yield* cmdRedis(req.flow, 'rename', [redisVarO, redisVarN]); if(err) return [err];
          var boKeyExist=1;
          if(err){
            if(err.message!="ERR no such key") return [err];
            boKeyExist=false;
          }
          if(boKeyExist) arrCookie.push("sessionIDCSRF="+sessionID+strCookiePropLax);
          
        }
        this.res.setHeader("Set-Cookie", arrCookie);
      } else if(vPass=='')  this.mes('Password needed'); else this.mes('Wrong password');
    }
    else {this.mes('Password needed'); }
  }
  GRet.boARLoggedIn=this.boARLoggedIn;
  return [null, [Ou]];
}

ReqBE.prototype.aLogin=function*(inObj){
  var req=this.req, flow=req.flow;
  var GRet=this.GRet;
  var Ou={};  
  if(this.boAWLoggedIn!=1 ){
    if('pass' in inObj) {
      var aPass=inObj.pass; 
      if(aPass==aWPassword) {
        //var sessionIDOld=req.sessionID;
        //var [err,tmp]=yield* cmdRedis(req.flow, 'SET', [sessionIDOld+'_adminWTimer',1,'EX', maxAdminWUnactivityTime]);
        this.boARLoggedIn=1; this.boAWLoggedIn=1; this.mes('Logged in');
          // Changing session-token at login (as recomended by security recomendations) (to prevent session fixation)
        //var sessionIDNew=randomHash();
        //var StrSuffix=['_adminRTimer', '_adminWTimer', '_CSRF']; //, '_Counter' '_'+this.pageName+
        ////var err=yield* changeSessionId.call(this, sessionIDNew, StrSuffix);
        //var err=yield* changeSessionId.call(this, 'sessionID', sessionIDNew, StrSuffix);
        
        
        if('sessionID' in req.cookies) {
          var sessionIDOld=req.cookies.sessionID;
          var [err]=yield* cmdRedis(flow, 'DEL', [sessionIDOld+'_adminRTimer', sessionIDOld+'_adminWTimer']);
        }
        var sessionID=randomHash();
        var [err]=yield* cmdRedis(flow, 'SET', [sessionID+'_adminRTimer', 1, 'EX', maxAdminRUnactivityTime]);
        var [err]=yield* cmdRedis(flow, 'SET', [sessionID+'_adminWTimer', 1, 'EX', maxAdminWUnactivityTime]);
        //var luaCountFunc=`local redis.call('DEL',KEYS[1]); redis.call('SET', ARGV[1], 1, 'EX', ARGV[2]);`;
        var arrCookie=["sessionID="+sessionID+strCookiePropLax];
        //var luaCountFunc=`local c=redis.call('GET',KEYS[1]); if(c>0) then redis.call('RENAME', KEYS[1], ARGV[1]); return c`;
        //var [err,CSRFCode]=yield* cmdRedis(flow, 'EVAL', [luaCountFunc, 1, req.cookies.sessionIDCSRF+'_CSRF', maxAdminRUnactivityTime]);
        
        if('sessionIDCSRF' in req.cookies) {
          //var [err]=yield* changeSessionId.call(this, req.cookies.sessionIDCSRF, '_CSRF'); if(err) return [err];
          var sessionIDOld=req.cookies.sessionIDCSRF, sessionID=randomHash();
          var strSuffix='_CSRF', redisVarO=sessionIDOld+strSuffix, redisVarN=sessionID+strSuffix; 
          var [err,value]=yield* cmdRedis(req.flow, 'rename', [redisVarO, redisVarN]); if(err) return [err];
          var boKeyExist=1;
          if(err){
            if(err.message!="ERR no such key") return [err];
            boKeyExist=false;
          }
          if(boKeyExist) arrCookie.push("sessionIDCSRF="+sessionID+strCookiePropLax);
        }
        this.res.setHeader("Set-Cookie", arrCookie);
        
        
        if(objOthersActivity) extend(objOthersActivity,objOthersActivityDefault);
      }
      else if(aPass=='') {this.mes('Password needed');}
      else {this.mes('Wrong password');}
    }
    else {this.mes("Password needed"); }
  } 
  GRet.boARLoggedIn=this.boARLoggedIn; GRet.boAWLoggedIn=this.boAWLoggedIn; 
  return [null, [Ou]];
}


ReqBE.prototype.myChMod=function*(inObj){   
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boAWLoggedIn) return [new ErrorClient('not logged in (as Administrator)')]; 
  
  if('File' in inObj && inObj.File instanceof Array && inObj.File.length) var File=inObj.File; else { return [new ErrorClient('chmod: no files')]; }   
  var strQ=array_fill(File.length, "?").join(', ');
  var tmpBit; if('boOR' in inObj) tmpBit='boOR'; else if('boOW' in inObj) tmpBit='boOW'; else if('boSiteMap' in inObj) tmpBit='boSiteMap'; 
  var Sql=[],Val=[inObj[tmpBit]];
  Sql.push("UPDATE "+pageTab+" SET "+tmpBit+"=? WHERE idPage IN ("+strQ+");");
  array_mergeM(Val,File);
  
  array_mergeM(Sql, array_fill(File.length, "CALL "+strDBPrefix+"markStale(?);"));
  array_mergeM(Val,File); 
  var sql=Sql.join('\n');
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  this.mes('chmod');
  GRet[tmpBit]=inObj[tmpBit]; // Sending boOW/boSiteMap  back will trigger closing/opening of the save/preview buttons
  return [null, [Ou]];
}
ReqBE.prototype.myChModImage=function*(inObj){   
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)')];}
  
  if('File' in inObj && inObj.File instanceof Array && inObj.File.length) var File=inObj.File; else {  return [new ErrorClient('chmodImage: no files')]; }   
  var strQ=array_fill(File.length, "?").join(', ');
  var Sql=[], Val=[inObj.boOther];
  Sql.push("UPDATE "+imageTab+" SET boOther=? WHERE idImage IN ("+strQ+");");
  array_mergeM(Val,File);
  
  var sql=Sql.join('\n');
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  this.mes('chmodImage');
  GRet.boOther=inObj.boOther; // Sending boOther  back will trigger closing/opening of the save/preview buttons
  return [null, [Ou]];
}

ReqBE.prototype.deletePage=function*(inObj){   
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)')];}
  
  if('File' in inObj && inObj.File instanceof Array && inObj.File.length) var File=inObj.File; else { return [new ErrorClient('deletePage: no files')]; }
  
  var Sql=[], len=File.length;
  if(len>=3){ // This way is quicker if many pages are to be deleted
    Sql.push("START TRANSACTION;");
    //Sql.push("CREATE TEMPORARY TABLE IF NOT EXISTS arrPageID (idPage int(4) NOT NULL);");
    //Sql.push("TRUNCATE arrPageID; INSERT INTO arrPageID VALUES "+array_fill(len,'(?)').join(', ')+';');
    Sql.push("DROP TEMPORARY TABLE IF EXISTS arrPageID;");
    Sql.push("CREATE TEMPORARY TABLE arrPageID (idPage int(4) NOT NULL);");
    Sql.push("INSERT INTO arrPageID VALUES "+array_fill(len,'(?)').join(', ')+';');
    Sql.push("CALL "+strDBPrefix+"deletePageIDMult();"); 
    Sql.push("COMMIT;");
    var sql=Sql.join('\n');
  }else{
    Sql.push("START TRANSACTION;");
    Sql=Sql.concat(array_fill(File.length, "CALL "+strDBPrefix+"deletePageID(?);")); 
    Sql.push("COMMIT;");
    var sql=Sql.join('\n');
  }  
  var Val=File;
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  this.mes('pages deleted');
  return [null, [Ou]];
}
  
  
ReqBE.prototype.deleteImage=function*(inObj){   
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)')]; }

  if('File' in inObj && inObj.File instanceof Array && inObj.File.length) var File=inObj.File; else { return [new ErrorClient('deleteImage: no files')]; }
  
  var Sql=[], len=File.length;
  if(len>=3){ // This way is quicker if many pages are to be deleted
    Sql.push("START TRANSACTION;");
    //Sql.push("CREATE TEMPORARY TABLE IF NOT EXISTS arrImageID (idImage int(4) NOT NULL);");
    //Sql.push("TRUNCATE arrImageID; INSERT INTO arrImageID VALUES "+array_fill(len,'(?)').join(', ')+';');
    Sql.push("DROP TEMPORARY TABLE IF EXISTS arrImageID;");
    Sql.push("CREATE TEMPORARY TABLE arrImageID (idImage int(4) NOT NULL);");
    Sql.push("INSERT INTO arrImageID VALUES "+array_fill(len,'(?)').join(', ')+';');
    Sql.push("CALL "+strDBPrefix+"deleteImageIDMult();"); 
    Sql.push("COMMIT;");
    var sql=Sql.join('\n');
  }else{
    var sql=array_fill(File.length, "CALL "+strDBPrefix+"deleteImageID(?);").join('\n'); 
  }
  
  //var sql=array_fill(File.length, "CALL "+strDBPrefix+"deleteImage(?);").join('\n');
  var Val=File;
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  this.mes('images deleted');   
  return [null, [Ou]];
  
}
ReqBE.prototype.aLogout=function*(inObj){  
  var req=this.req, res=this.res;
  var GRet=this.GRet;
  var Ou={};
  var redisVar=req.sessionID+'_adminWTimer';
  var [err,tmp]=yield* cmdRedis(req.flow, 'DEL', [redisVar]);

  if(this.boAWLoggedIn) {this.mes('Logged out (as Administrator)'); GRet.strDiffText=''; } 
  GRet.boAWLoggedIn=0; 
  return [null, [Ou]];
}



//////////////////////////////////////////////////////////////////////////////////////////////
// pageLoad
//////////////////////////////////////////////////////////////////////////////////////////////
  
ReqBE.prototype.pageLoad=function*(inObj) { 
  var req=this.req, res=this.res;
  var pageName=this.pageName;
  var GRet=this.GRet;
  var Ou={}, flow=req.flow;

  // Private:
  //                                                                 index.html  first ajax (pageLoad)
  //Shall look the same (be cacheable (not include boARLoggedIn etc))     no           yes

  // Public:
  //                                                                 index.html  first ajax (specSetup)
  //Shall look the same (be cacheable (not include boARLoggedIn etc))     yes          no


  this.CSRFCode='';  // If Private then No CSRFCode since the page is going to be cacheable (look the same each time)
  var version, rev; if(typeof inObj=='object' && 'version' in inObj) {  version=inObj.version;  rev=version-1; } else {  version=NaN; rev=-1; }
  var strHashIn='', requesterCacheTime=new Date(0);
  if(req.method=='GET') {strHashIn=getETag(req.headers); requesterCacheTime=getRequesterTime(req.headers); }
  
  var Sql=[];
  Sql.push("CALL "+strDBPrefix+"getInfoNDataBE(?, ?, ?, ?, ?);"); 
  var sql=Sql.join('\n');
  var Val=[req.wwwSite, pageName, rev, strHashIn, requesterCacheTime/1000];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val);  if(err) return [err];
  
  //if(results.length==1) { res.out500("Weird, getInfoNDataBE should have returned one at least one result plus the 'added' result that stored procedures allways add."); return;   } 
  if(results[0].length==0) { 
    res.setHeader("Cache-Control", "must-revalidate");  res.setHeader('Last-Modified',(new Date(0)).toUTCString());  res.setHeader('ETag','');
    res.out404("no such page");
    return [];
  }
  var objPage=results[0][0];
  if(!objPage.boOR && !this.boARLoggedIn) {  return [new ErrorClient('Unauthorized?!?')]; }  // res.outCode(401, "Unauthorized"); return []; 
  var boTalkExist=results[1][0].boTalkExist;
  if(results[2].length==0)  return [new Error('no versions?!?')];
  if(rev>=results[2].length) {
    res.setHeader("Cache-Control", "must-revalidate");  res.setHeader('Last-Modified',(new Date(0)).toUTCString());  res.setHeader('ETag','');
    res.outCode(400, "no such version");
    return [];
  }
  if(rev==-1) rev=results[2].length-1;    version=rev+1;
  var matVersion=makeMatVersion(results[2]);
  var objRev=Object.assign({},results[2][rev]);
    //objRev.tMod=new Date(objRev.tMod*1000);
    //objRev.tModCache=new Date(objRev.tModCache*1000);
  var {boValidServerCache, strHash}=results[3][0];
  var {boValidReqCache}=results[4][0];
  if(boValidReqCache) { res.out304(); return []; }
  else{
    var strEditText=results[5][0].strEditText.toString();
    //let {boOR, boOW, boSiteMap, tCreated}=objPage;
    let {tMod}=objRev;
    if(boValidServerCache) {
      var strHtmlText=results[6][0].strHtmlText.toString();
      var objTemplateE=createObjTemplateE(results[7]);
      //var strHashNew=md5(strHtmlText +JSON.stringify(objTemplateE) +tMod +boOR +boOW +boSiteMap +boTalkExist +JSON.stringify(matVersion));
      var strHashNew=md5(strHtmlText +JSON.stringify(objTemplateE) +JSON.stringify(objPage) +boTalkExist +JSON.stringify(matVersion));
      
      var Sql=[];
      Sql.push(`SET @idPage=?, @rev=?, @strHash=?;`);
      Sql.push(`SELECT @tModCache:=IF(strHash=@strHash,tModCache,now()) FROM `+versionTab+` WHERE idPage=@idPage AND rev=@rev;`);
      Sql.push(`UPDATE `+versionTab+` SET tModCache=@tModCache, strHash=@strHash WHERE idPage=@idPage AND rev=@rev;`);
      Sql.push(`SELECT UNIX_TIMESTAMP(@tModCache) AS tModCache;`); 
      Sql.push(`UPDATE `+pageTab+` SET tModCache=@tModCache WHERE idPage=@idPage;`);
      var sql=Sql.join('\n');
      var Val=[objPage.idPage, rev, strHashNew];
      var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
      var {tModCache}=results[3][0];
      
    }else {
        // parse
      var arg={strEditText:strEditText, wwwSite:req.wwwSite, boOW:objPage.boOW, myMySql:this.myMySql};
      var [err, [objTemplateE, StrSubImage, strHtmlText, arrSub]]=yield* parse(flow, arg); if(err) return [err]
      
      //var strHashNew=md5(strHtmlText +JSON.stringify(objTemplateE) +tMod +boOR +boOW +boSiteMap +boTalkExist +JSON.stringify(matVersion));
      var strHashNew=md5(strHtmlText +JSON.stringify(objTemplateE) +JSON.stringify(objPage) +boTalkExist +JSON.stringify(matVersion));
      
      var Sql=[];
        // setNewCacheSQL
      var {sql, Val, nEndingResults}=createSetNewCacheSQL(req.wwwSite, pageName, rev, strHtmlText, strHashNew, arrSub, StrSubImage);
      Sql.push("START TRANSACTION; "+sql+" COMMIT;");
      var sql=Sql.join('\n');
      var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err]
      var iRowLast=results.length-nEndingResults-2;
      var {tModCache}=results[iRowLast][0];
       
    }

    GRet.objPage=copySome({},objPage, ['boOR','boOW', 'boSiteMap', 'idPage', 'tCreated', 'tMod']);
    //GRet.objPage.tCreated=objPage.tCreated.toUnix();
    GRet.objRev=copySome({},objRev, ['tMod']);
    //GRet.objRev={tMod:objRev.tMod.toUnix()};
    
    extend(GRet, {strDiffText:'', arrVersionCompared:[null, version], strHtmlText:strHtmlText, objTemplateE:objTemplateE, strEditText:strEditText, boTalkExist:boTalkExist, matVersion:matVersion});
    var tmp=objPage.boOR?'':', private';
    var tModCacheDate=new Date(tModCache*1000);
    res.setHeader("Cache-Control", "must-revalidate"+tmp);  res.setHeader('Last-Modified',tModCacheDate.toUTCString());  res.setHeader('ETag',strHashNew);
  } 

  return [null, [Ou]];
}



ReqBE.prototype.pageCompare=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  var versionOld=arr_min(inObj.arrVersionCompared),  version=arr_max(inObj.arrVersionCompared); 
  versionOld=Math.max(1,versionOld);  version=Math.max(1,version);
  if(version==versionOld) {return [new ErrorClient('Same version')]; }
  var strHashIn='', requesterCacheTime=0;
  var rev=versionOld-1;


  var Sql=[], Val=[];
  Sql.push("SELECT SQL_CALC_FOUND_ROWS boOR, boOW, @idPage:=idPage FROM "+pageSiteView+" WHERE www=? AND pageName=?;");
  Sql.push("SELECT data AS strEditTextOld FROM "+versionTab+" v JOIN "+fileTab+" f on v.idFile=f.idFile WHERE v.idPage=@idPage AND v.rev=?;");
  Sql.push("SELECT data AS strEditText FROM "+versionTab+" v JOIN "+fileTab+" f on v.idFile=f.idFile WHERE v.idPage=@idPage AND v.rev=?;");
  Val.push(req.wwwSite, this.pageName, versionOld-1, version-1);
  var sql=Sql.join('\n');
  var [err, results]=yield* this.myMySql.query(flow, sql, Val);  if(err) return [err];
  var boOR=results[0][0].boOR,  boOW=results[0][0].boOW;
  
  if(boOR===false && !this.boARLoggedIn){return [new ErrorClient('Not logged in')]; }
  if(boOR===null){return [new ErrorClient('Page does not exist')]; } 
  
  var strEditTextOld=results[1][0].strEditTextOld.toString();
  var strEditText=results[2][0].strEditText.toString();
  
  
    // parse 
  var arg={strEditText:strEditText, wwwSite:req.wwwSite, boOW:boOW, myMySql:this.myMySql};
  var [err, [objTemplateE, StrSubImage, strHtmlText, arrSub]]=yield* parse(flow, arg); if(err) return [err];

  var strDiffText='';
  if(versionOld!==null){
    strDiffText=myDiff(strEditTextOld,strEditText);
    if(strDiffText.length==0) strDiffText='(equal)';
    this.mes("v "+versionOld+" vs "+version);
  } else this.mes("v "+version);

  
  extend(GRet,{strDiffText:strDiffText, arrVersionCompared:[versionOld,version], strHtmlText:strHtmlText, strEditText:strEditText});
  return [null, [0]];
}


ReqBE.prototype.getPreview=function*(inObj){ 
  var req=this.req, res=this.res;
  var Ou={}, GRet=this.GRet, flow=req.flow;
  var strEditText=inObj.strEditText;
  
  var boOW=1;
  var matVersion=[];

    // parse
  var arg={strEditText:strEditText, wwwSite:req.wwwSite, boOW:boOW, myMySql:this.myMySql};
  var [err, [objTemplateE, StrSubImage, strHtmlText, arrSub]]=yield* parse(flow, arg); if(err) return [err];
  
  this.mes('Preview');
  extend(GRet,{strDiffText:'', strEditText:strEditText, strHtmlText:strHtmlText, objTemplateE:objTemplateE});
  
  return [null, [0]];
} 


ReqBE.prototype.saveByReplace=function*(inObj){   
  var req=this.req, res=this.res;
  var Ou={}, GRet=this.GRet, flow=req.flow;
  
  if(!this.boAWLoggedIn) {return [new ErrorClient('Not logged in as admin')]; } 
 
  var [err]=yield* this.myMySql.startTransaction(flow);  if(err) return [err]; 
  stuff:
  {
  var arrRet=[null];

  var Sql=[], Val=[];
  Sql.push("START TRANSACTION;");
  
    // Getting objSite, hmm the data from this query isn't used (so one could probably remove it)
  Sql.push("SELECT SQL_CALC_FOUND_ROWS boDefault, @boTLS:=boTLS AS boTLS, @idSite:=idSite AS idSite, siteName, www, googleAnalyticsTrackingID, urlIcon16, urlIcon200, aWPassword, aRPassword, UNIX_TIMESTAMP(tCreated) AS tCreated FROM "+siteTab+" WHERE www=?;"), Val.push(req.wwwSite);
  
    // Getting tMod, boOW and tNow
  //Sql.push("SELECT boOW, UNIX_TIMESTAMP(v.tMod) AS tMod FROM "+pageTab+" p JOIN "+versionTab+" v ON p.idPage=v.idPage AND p.lastRev=v.rev WHERE idSite=@idSite AND pageName=?;"), Val.push(this.pageName);
  Sql.push("SELECT boOW, UNIX_TIMESTAMP(p.tMod) AS tMod FROM "+pageTab+" p WHERE idSite=@idSite AND pageName=?;"), Val.push(this.pageName);
  Sql.push("SELECT UNIX_TIMESTAMP(now()) AS tNow;");  // @tNow:=now() AS tNowTrash, 
  var sql=Sql.join('\n'); 
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {arrRet=[err]; break stuff;}
  var tNow=results[3][0].tNow;
  
    // If page existed then check tMod
  if(results[2].length){
    var boOW=results[2][0].boOW;
    var tMod=results[2][0].tMod, dateTMod=new Date(tMod*1000);
    if(this.dateTModBrowser<dateTMod) { 
      //arrRet=[new ErrorClient("tMod from the version on your browser: "+this.dateTModBrowser+" < tMod on the version on the server: "+dateTMod+", "+messPreventBecauseOfNewerVersions)]; break stuff;
      //var [tDiff,unit]=getSuitableTimeUnit(tMod-this.dateTModBrowser.toUnix());
      //arrRet=[new ErrorClient("Someone else has made a change ("+Math.round(tDiff)+" "+unit+" after the tMod you're editing). Copy your edits temporary, then reload page.")]; break stuff;
      var [tDiff,unit]=getSuitableTimeUnit(tNow-tMod); if(unit=='m') unit='min';
      arrRet=[new ErrorClient("Someone else has made a change ("+Math.round(tDiff)+" "+unit+" ago). Copy your edits temporary, then reload the page.")]; break stuff;
    }
  } else {var boOW=1, tMod=0;}
  
  
    // Parse
  var strEditText=inObj.strEditText, len=strEditText.length;
  var arg={strEditText:strEditText, wwwSite:req.wwwSite, boOW:boOW, myMySql:this.myMySql};
  var [err, [objTemplateE, StrSubImage, strHtmlText, arrSub]]=yield* parse(flow, arg); if(err) {arrRet=[err]; break stuff;}
  
  
    // Create tmpSubNew, tmpSubNewImage
  var Sql=[], Val=[];
  var [strSubQ,arrSubV]=createSubStr(arrSub);
  var strSubImageQ=createSubImageStr(StrSubImage);
  Sql.push("DROP TEMPORARY TABLE IF EXISTS tmpSubNew;", sqlTmpSubNewCreate+';', strSubQ);
  Sql.push("DROP TEMPORARY TABLE IF EXISTS tmpSubNewImage;", sqlTmpSubNewImageCreate+';', strSubImageQ);
  var Val=array_merge(arrSubV, StrSubImage);
  var sql=Sql.join('\n'); 
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {arrRet=[err]; break stuff;}
  
  
    // Calc boTalk and boTemplate
  var boTalk=regTalk.test(this.pageName),  boTemplate=this.pageName.substr(0,9)=='template:';
  
    // Insert/Update pageTab
  var Sql=[], Val=[];
  Sql.push("SET @pageName=?, @boTalk=?, @boTemplate=?, @len=?, @tNow=FROM_UNIXTIME(?);");   Val.push(this.pageName, boTalk, boTemplate, len, tNow);
  Sql.push(`INSERT INTO `+pageTab+` (idSite, pageName, boTalk, boTemplate, size) VALUES (@idSite, @pageName, @boTalk, @boTemplate, @len)  
          ON DUPLICATE KEY UPDATE idPage=LAST_INSERT_ID(idPage), pageName=@pageName, boTalk=@boTalk, boTemplate=@boTemplate, lastRev=0, boOther=0, tMod=@tNow, tModCache=@tNow, size=@len;`);
  Sql.push("SELECT @idPage:=LAST_INSERT_ID() AS idPage;");
  Sql.push("SELECT ROW_COUNT()=1 AS boInsert;");
  Sql.push("CALL "+strDBPrefix+"markStaleParentsOfPage(@idSite, @pageName, 1, @boTemplate);");
  var sql=Sql.join('\n'); 
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {arrRet=[err]; break stuff;}
  
  
    // Calculate nParent if page was inserted
  if(results[2][0].boInsert){
    sql=`SELECT COUNT(*) INTO @VnParent FROM `+subTab+` s WHERE pageName=Iname;
      UPDATE `+pageTab+` SET nParent=@VnParent WHERE idPage=OidPage;`;
    var Val=[], [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {arrRet=[err]; break stuff;}
  }
  
  
    // If strEditText is empty then delete page and bail out.
  if(len==0){
    var sql="CALL "+strDBPrefix+"deletePageID(@idPage);", Val=[];
    var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {arrRet=[err]; break stuff;}
    
    //strHtmlText=''; objTemplateE={};
    var matVersion=[];
    var objPage={idPage:NaN, boOR:1, boOW:1, boSiteMap:1, tMod:0}, objRev={tMod:0}; //objRev={tMod:new Date(0)};
    //var idPage=NaN, boOR=1, boOW=1, boSiteMap=1, tMod=new Date(0);
    var mess='pageDeleted'; this.mes('No content, Page deleted'); arrRet=[null,mess]; break stuff;
  }
  
  
  var Sql=[], Val=[];
    // Delete old versions
  Sql.push("CALL "+strDBPrefix+"deleteAllButFirst(@idPage, @pageName);");
    // Count version (should be 0 or 1) and get idFile/idFileCache
  Sql.push("SELECT @c:=count(*) AS c, @idFile:=idFile AS idFile, @idFileCache:=idFileCache AS idFileCache FROM "+versionTab+" WHERE idPage=@idPage AND rev=0;");
    // deleteAllButFirst overwrites these cols, So they must be written again. (versionTab is written below)
  Sql.push(`UPDATE `+pageTab+` SET tMod=@tNow, tModCache=@tNow, boOther=0, size=@len WHERE idPage=@idPage;`);
  var sql=Sql.join('\n'); 
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {arrRet=[err]; break stuff;}
  
  
    // Insert/Update fileTab
  var Sql=[], Val=[];
  if(results[1][0].idFile==null) Sql.push("INSERT INTO "+fileTab+" (data) VALUES (?);    SELECT LAST_INSERT_ID() INTO @idFile;");
  else Sql.push("UPDATE "+fileTab+" SET data=? WHERE idFile=@idFile;");
  Val.push(strEditText);

  if(results[1][0].idFileCache==null) Sql.push("INSERT INTO "+fileTab+" (data) VALUES (?);    SELECT LAST_INSERT_ID() INTO @idFileCache;");
  else Sql.push("UPDATE "+fileTab+" SET data=? WHERE idFile=@idFileCache;");
  Val.push(strHtmlText);
  
    // Insert/Update versionTab
  var strHash='trashSaveByReplace'; //randomHash();
  Sql.push("SET @strHash=?, @len=?, @tNow=FROM_UNIXTIME(?);");   Val.push(strHash, len, tNow);
  if(results[1][0].c==0) Sql.push("INSERT INTO "+versionTab+" (idPage,rev,idFile,tMod,idFileCache,tModCache,strHash,size) VALUES (@idPage,0,@idFile,@tNow,@idFileCache,@tNow,@strHash,@len);");
  else Sql.push("UPDATE "+versionTab+" SET idFile=@idFile, boOther=0, tMod=@tNow, idFileCache=@idFileCache, tModCache=@tNow, strHash=@strHash, size=@len WHERE idPage=@idPage AND rev=0;");
  //Val.push(strHash,len);

  Sql.push("CALL "+strDBPrefix+"writeSubTables(@idPage);");
  var sql=Sql.join('\n');
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {arrRet=[err]; break stuff;}
  
  
  var Sql=[], Val=[];
  
    // objPage
  Sql.push("SELECT SQL_CALC_FOUND_ROWS pageName, idPage, boOR, boOW, boSiteMap, UNIX_TIMESTAMP(tCreated) AS tCreated, UNIX_TIMESTAMP(tMod) AS tMod FROM "+pageTab+" WHERE idPage=@idPage;");
  
    // objRev
  Sql.push("SELECT rev, summary, signature, idFile, idFileCache, UNIX_TIMESTAMP(tMod) AS tMod, UNIX_TIMESTAMP(tModCache) AS tModCache, strHash FROM "+versionTab+" WHERE idPage=@idPage AND rev=(SELECT MAX(rev) FROM "+versionTab+" WHERE idPage=@idPage GROUP BY idPage);"); 
    
    // matVersion, objTemplateE, boTalkExist;
  Sql.push("SELECT SQL_CALC_FOUND_ROWS summary, signature, UNIX_TIMESTAMP(tMod) AS tMod FROM "+versionTab+" WHERE idPage=@idPage;");
  Sql.push("SELECT pageName, boOnWhenCached FROM "+subTab+" WHERE idPage=@idPage AND pageName REGEXP '^template:';");
  
  
  
  if(!boTalk) {var talkPage=calcTalkName(this.pageName); Sql.push("SELECT count(idPage) AS boTalkExist FROM "+pageTab+" WHERE idSite=@idSite AND pageName=?;"); Val.push(talkPage); }
  var sql=Sql.join('\n');
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) {arrRet=[err]; break stuff;}
  var objPage=Object.assign({},results[0][0]);
  var objRev=Object.assign({},results[1][0]);      //objRev.tMod=new Date(objRev.tMod*1000);    objRev.tModCache=new Date(objRev.tModCache*1000);
  var matVersion=makeMatVersion(results[2]);
  var objTemplateE=createObjTemplateE(results[3]);
  var boTalkExist=!boTalk?results[4][0].boTalkExist:false;
    
  var mess='done';  this.mes("Page overwritten");
  
  }
  if(arrRet[0]){ yield* this.myMySql.rollback(flow); return arrRet; } else{ [err]=yield* this.myMySql.commitNRelease(flow); if(err) return [err]; }
 
  //extend(GRet,{strDiffText:'', arrVersionCompared:[null,1], strHtmlText:strHtmlText, objTemplateE:objTemplateE, strEditText:strEditText, matVersion:matVersion, boOR:boOR, boOW:boOW, boSiteMap:boSiteMap, idPage:idPage, tMod:tMod});
  
  extend(GRet,{strDiffText:'', arrVersionCompared:[null,1], strHtmlText:strHtmlText, objTemplateE:objTemplateE, strEditText:strEditText, matVersion:matVersion, objPage:objPage, objRev:objRev});
  
  return [null, [0]];
}


ReqBE.prototype.saveByAdd=function*(inObj){  
  var req=this.req, res=this.res;
  var Ou={}, GRet=this.GRet, flow=req.flow;

    // Check reCaptcha with google
  var strCaptchaIn=inObj['g-recaptcha-response'];
  var uGogCheck = "https://www.google.com/recaptcha/api/siteverify"; 
  var objForm={  secret:strReCaptchaSecretKey, response:strCaptchaIn, remoteip:req.connection.remoteAddress  };
  var semY=0, semCB=0, err, response, body;
  var reqStream=requestMod.post({url:uGogCheck, form:objForm}, function(errT, responseT, bodyT) { err=errT; response=responseT; body=bodyT; if(semY)flow.next(); semCB=1;  }); if(!semCB){semY=1; yield;}
  var buf=body;
  try{ var data = JSON.parse(buf.toString()); }catch(e){ return [e]; }
  //console.log('Data: ', data);
  if(!data.success) return [new ErrorClient('reCaptcha test not successfull')];
  
    // getInfo
  //var sql="SELECT boOR, boOW, boSiteMap, UNIX_TIMESTAMP(tCreated) AS tCreated, UNIX_TIMESTAMP(tMod) AS tMod FROM "+pageLastSiteView+" WHERE www=? AND pageName=?";
  //var Val=[req.wwwSite, this.pageName];
  
  var Sql=[], Val=[];
  Sql.push("SELECT boOR, boOW, boSiteMap, UNIX_TIMESTAMP(tCreated) AS tCreated, UNIX_TIMESTAMP(tMod) AS tMod FROM "+pageLastSiteView+" WHERE www=? AND pageName=?;");
  Val.push(req.wwwSite, this.pageName);
  Sql.push("SELECT UNIX_TIMESTAMP(now()) AS tNow;");
  var sql=Sql.join('\n');
  var [err, results]=yield* this.myMySql.query(flow, sql, Val);  if(err) return [err];
  var row=results[0][0];
  var tNow=results[1][0].tNow;

  if(row){
    var {boOR,boOW,boSiteMap,tMod}=row, dateTMod=new Date(tMod*1000);
    if(!boOR && !this.boARLoggedIn) {return [new ErrorClient('Not logged in')]; }
    if(this.dateTModBrowser<dateTMod) {
      //return [new ErrorClient("tMod from the version on your browser: "+this.dateTModBrowser+" < tMod on the version on the server: "+dateTMod+", "+messPreventBecauseOfNewerVersions)]; 
      //var [tDiff,unit]=getSuitableTimeUnit(tMod-this.dateTModBrowser.toUnix());
      //return [new ErrorClient("Someone else has made a change ("+Math.round(tDiff)+" "+unit+" after the tMod you're editing). Copy your edits temporary, then reload page")];
      var [tDiff,unit]=getSuitableTimeUnit(tNow-tMod); if(unit=='m') unit='min';
      return [new ErrorClient("Someone else has made a change ("+Math.round(tDiff)+" "+unit+" ago). Copy your edits temporary, then reload the page")];
    }
    if(boOW==0) {return [new ErrorClient('Not authorized')]; }  
  }else{
    var boOW=1, boOW=1, boSiteMap=1;
  }
  var strEditText=inObj.strEditText, summary=inObj.summary, signature=inObj.signature;
  summary=myJSEscape(summary); signature=myJSEscape(signature);
  
    
    // parse
  var arg={strEditText:strEditText, wwwSite:req.wwwSite, boOW:boOW, myMySql:this.myMySql};
  var [err, [objTemplateE, StrSubImage, strHtmlText, arrSub]]=yield* parse(flow, arg); if(err) return [err];

  var strHash='trashSaveByAdd'; //randomHash();
  
      // saveByAddSQL
  var {sql, Val, nEndingResults}=createSaveByAddSQL(req.wwwSite, this.pageName, summary, signature, strEditText, strHtmlText, strHash, arrSub, StrSubImage);
  sql="START TRANSACTION; "+sql+" COMMIT;";
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  var iRowLast=results.length-nEndingResults-2;
  var mess=results[iRowLast][0].mess;//if(typeof results[iRowLast][0]=='object')
  
  
      // getInfoNData
  var Sql=[], Val=[];
  Sql.push("SELECT SQL_CALC_FOUND_ROWS siteName, boOR, boOW, boSiteMap, @idSite:=idSite, @idPage:=idPage, UNIX_TIMESTAMP(tCreated) AS tCreated, UNIX_TIMESTAMP(tMod) AS tMod FROM "+pageLastSiteView+" WHERE www=? AND pageName=?;");
  Sql.push("SELECT SQL_CALC_FOUND_ROWS summary, signature, UNIX_TIMESTAMP(tMod) AS tMod FROM "+versionTab+" WHERE idPage=@idPage;");
  Sql.push("SELECT pageName, boOnWhenCached FROM "+subTab+" WHERE idPage=@idPage AND pageName REGEXP '^template:';");
  Val.push(req.wwwSite, this.pageName);
  var talkPage=calcTalkName(this.pageName), boIsTalkPage=Boolean(talkPage.length);
  if(boIsTalkPage) {Sql.push("SELECT count(idPage) AS boTalkExist FROM "+pageTab+" WHERE idSite=@idSite AND pageName=?;"); Val.push(talkPage); }
  var sql=Sql.join('\n');
  var [err, results]=yield* this.myMySql.query(flow, sql, Val);  if(err) return [err];
  var row=results[0][0], {siteName, boOR,  boOW, boSiteMap, idPage}=row, tCreated=row.tCreated, tMod=row.tMod;
  var matVersion=makeMatVersion(results[1]);
  var objTemplateE=createObjTemplateE(results[2]);
  var boTalkExist=boIsTalkPage?false:results[3];
  
  //var strHash=md5(strHtmlText +JSON.stringify(objTemplateE) +tMod +boOR +boOW +boSiteMap +boTalkExist +JSON.stringify(matVersion));
  //var sql=`UPDATE `+pageLastSiteView+` SET tModCache=now(), strHash=? WHERE idPage=?`;
  //var Val=[strHash, idPage];
  //var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  
  this.mes("New version added");
  if(objOthersActivity) { objOthersActivity.nEdit++; objOthersActivity.pageName=siteName+':'+this.pageName; }

  //extend(GRet,{strDiffText:'', arrVersionCompared:[null,matVersion.length], strHtmlText:strHtmlText, objTemplateE:objTemplateE, strEditText:strEditText, boTalkExist:boTalkExist, matVersion:matVersion, boOR:boOR, boOW:boOW, boSiteMap:boSiteMap, idPage:idPage, tCreated:tCreated, tMod:tMod});
  extend(GRet,{strDiffText:'', arrVersionCompared:[null,matVersion.length], strHtmlText:strHtmlText, objTemplateE:objTemplateE, strEditText:strEditText, boTalkExist:boTalkExist, matVersion:matVersion, boOR:boOR, boOW:boOW, boSiteMap:boSiteMap, idPage:idPage, objRev:{tMod:tMod}});  //, objPage:{tCreated:tCreated}

  return [null, [0]];
}

ReqBE.prototype.renamePage=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boAWLoggedIn) { return [new ErrorClient('Not logged in as admin')]; }
  
  var Sql=[];
  Sql.push("START TRANSACTION;");
  Sql.push("CALL "+strDBPrefix+"renamePage(?, ?);");
  var sql=Sql.join('\n');
  var strNewName=inObj.strNewName.replace(RegExp(' ','g'),'_');
  var Val=[inObj.id, strNewName];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  if(results[1][0].err=='nameExist') { return [new ErrorClient('nameExist')]; }
  var nameLCO=results[1][0].nameO.toLowerCase(), resIdPage=results[2], resIdFileData=results[3];
  
  var Sql=[], Val=[];
  var nIdPage=resIdPage.length;
  if(nIdPage==0) { this.mes('OK (No parent links needed to be renamed)'); Ou.boOK=1;  return [null, [Ou]]; }
  for(var i=0;i<nIdPage;i++){ Val.push(resIdPage[i].idPage); }
  var tmp=array_fill(nIdPage, "?").join(',');
  Sql.push("UPDATE "+pageTab+" SET tModCache=FROM_UNIXTIME(1) WHERE idPage IN ("+tmp+");");
  
  var nIdFileData=resIdFileData.length;
  for(var i=0;i<nIdFileData;i++){
    var strEditText=resIdFileData[i].data.toString();
    var mPa=new Parser(), strEditText=mPa.renameILinkOrImage(strEditText, nameLCO, strNewName);
    Val.push(resIdFileData[i].idFile, strEditText);
  }
  
  var tmp=array_fill(nIdFileData, "(?,?)").join(',');
  Sql.push("INSERT INTO "+fileTab+" (idFile, data) VALUES "+tmp+" ON DUPLICATE KEY UPDATE data=VALUES(data);");
  
  for(var i=0;i<nIdFileData;i++){ Val.push(resIdFileData[i].idFile); }
  var tmp=array_fill(nIdFileData, "?").join(',');
  Sql.push("UPDATE "+versionTab+" SET tModCache=FROM_UNIXTIME(1), strHash='renamePage' WHERE idFile IN ("+tmp+");");
  
  //Sql.push("UPDATE "+pageTab+" p JOIN "+versionTab+" v ON p.idPage=v.idPage SET p.tModCache=FROM_UNIXTIME(1), v.tModCache=FROM_UNIXTIME(1) WHERE idFile IN ("+tmp+");");
  Sql.push("COMMIT;");
  var sql=Sql.join('\n');
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  var c=results[1].affectedRows/2;
  var boOK=1, mestmp='Links in '+c+" pages renamed.";
  
  this.mes(mestmp);
  Ou.boOK=boOK;      
  return [null, [Ou]];
}

ReqBE.prototype.renameImage=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boAWLoggedIn) { return [new ErrorClient('Not logged in as admin')]; }
  
  var Sql=[];
  Sql.push("START TRANSACTION;");
  Sql.push("CALL "+strDBPrefix+"renameImage(?, ?);");
  var sql=Sql.join('\n');
  var strNewName=inObj.strNewName.replace(RegExp(' ','g'),'_');
  var Val=[inObj.id, strNewName];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  if(results[1][0].err=='nameExist') { return [new ErrorClient('nameExist')]; }
  var nameLCO=results[1][0].nameO.toLowerCase(), resIdPage=results[2], resIdFileData=results[3];
  
  var Sql=[], Val=[];
  var nIdPage=resIdPage.length;
  if(nIdPage==0) { this.mes('OK (No parent links needed to be renamed)'); Ou.boOK=1;  return [null, [Ou]]; }
  for(var i=0;i<nIdPage;i++){ Val.push(resIdPage[i].idPage); }
  var tmp=array_fill(nIdPage, "?").join(',');
  Sql.push("UPDATE "+pageTab+" SET tModCache=FROM_UNIXTIME(1) WHERE idPage IN ("+tmp+");");
  
  var nIdFileData=resIdFileData.length;
  for(var i=0;i<nIdFileData;i++){
    var strEditText=resIdFileData[i].data.toString();
    var mPa=new Parser(), strEditText=mPa.renameILinkOrImage(strEditText, '', '', nameLCO, strNewName);
    Val.push(resIdFileData[i].idFile, strEditText);
  }
  var tmp=array_fill(nIdFileData, "(?,?)").join(',');
  Sql.push("INSERT INTO "+fileTab+" (idFile, data) VALUES "+tmp+" ON DUPLICATE KEY UPDATE data=VALUES(data);");
  
  for(var i=0;i<nIdFileData;i++){ Val.push(resIdFileData[i].idFile); }
  var tmp=array_fill(nIdFileData, "?").join(',');
  Sql.push("UPDATE "+versionTab+" SET tModCache=FROM_UNIXTIME(1), strHash='renameImage' WHERE idFile IN ("+tmp+");");
  Sql.push("COMMIT;");
  var sql=Sql.join('\n');
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  var c=results[1].affectedRows/2;
  var boOK=1, mestmp='Image urls in '+c+" pages renamed.";
  
  this.mes(mestmp);
  Ou.boOK=boOK;      
  return [null, [Ou]];
}

ReqBE.prototype.specSetup=function*(inObj){
  var req=this.req, res=this.res;
  var GRet=this.GRet;

  var Ou={};
  GRet.boARLoggedIn=this.boARLoggedIn; 
  GRet.boAWLoggedIn=this.boAWLoggedIn;
  return [null, [Ou]];  
}

ReqBE.prototype.setUpPageListCond=function*(inObj){
  var Ou={};
  if(typeof inObj.Filt!='object') return [new ErrorClient('typeof inObj.Filt!="object"')]; 
  this.Filt=inObj.Filt;
  var arg={KeySel:[], Prop:PropPage, Filt:inObj.Filt};
  var tmp=setUpCond(arg);
  copySome(this,tmp,['strCol', 'Where']);
  return [null, [Ou]];
}
 
ReqBE.prototype.getParent=function*(inObj){
  var req=this.req, res=this.res;
  //var Ou={}, sql="SELECT p.pageName FROM "+pageTab+" p JOIN "+subTab+" s ON s.idPage=p.idPage WHERE s.pageName=?;",   Val=[inObj.pageName];
  var Ou={}, sql="SELECT p.boTLS, p.siteName, p.www, p.idPage, p.pageName FROM "+pageSiteView+" p JOIN "+subTab+" s ON s.idPage=p.idPage JOIN "+pageTab+" c ON s.pageName=c.pageName WHERE c.idPage=?;",   Val=[inObj.idPage];
  var flow=req.flow
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  Ou=arrObj2TabNStrCol(results);
  return [null, [Ou]];
}

ReqBE.prototype.getParentOfImage=function*(inObj){
  var req=this.req, res=this.res;
  //var Ou={}, sql="SELECT p.pageName FROM "+pageTab+" p JOIN "+subImageTab+" s ON s.idPage=p.idPage WHERE s.imageName=?;",   Val=[inObj.imageName];
  var Ou={}, sql="SELECT p.boTLS, p.siteName, p.www, p.idPage, p.pageName FROM "+pageSiteView+" p JOIN "+subImageTab+" s ON s.idPage=p.idPage JOIN "+imageTab+" c ON s.imageName=c.imageName  WHERE c.idImage=?;",   Val=[inObj.idImage];
  var flow=req.flow;
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  Ou=arrObj2TabNStrCol(results);
  return [null, [Ou]];
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
    //Sql.push("SELECT boTLS, siteName, www, pageName, idPage, boOR, boOW, boSiteMap FROM "+pageSiteView+" p WHERE p.idPage=?;"); 
    Sql.push("SELECT boTLS, siteName, www, pageName, idPage, boOR, boOW, boSiteMap, size, UNIX_TIMESTAMP(tCreated) AS tCreated, UNIX_TIMESTAMP(tMod) AS tMod, boOther, lastRev FROM "+pageLastSiteView+" p WHERE p.idPage=?;"); 
    Sql.push("SELECT COUNT(*) AS nSame FROM "+pageTab+" pA JOIN "+pageTab+" pB ON pA.pageName=pB.pageName WHERE pB.idPage=?;"); // nSame is >1 if multiple sites have the same pageName 
    Val.push(inObj.idPage, inObj.idPage, inObj.idPage, inObj.idPage);
  }  
  var sql=Sql.join('\n');
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  Ou.nSub=results[0][0].nSub;
  Ou.nImage=results[1][0].nImage;
  if(inObj.idPage!==null) { extend(Ou, results[2][0]); extend(Ou, results[3][0]); }
  return [null, [Ou]];
}
    // nAccess, tCreated, tLastAccess;

ReqBE.prototype.getPageList=function*(inObj) {
  var req=this.req, res=this.res;
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)')]; }
  var Sql=[], flow=req.flow;
  var tmpCond=array_filter(this.Where), strCond=''; if(tmpCond.length) strCond='WHERE '+tmpCond.join(' AND ');

  Sql.push("SELECT SQL_CALC_FOUND_ROWS p.boTLS, p.siteName AS siteName, p.www AS www, p.pageName AS pageName, p.boOR AS boOR, p.boOW AS boOW, p.boSiteMap AS boSiteMap, UNIX_TIMESTAMP(p.tCreated) AS tCreated, UNIX_TIMESTAMP(p.tMod) AS tMod, p.lastRev, p.boOther AS boOther, p.idPage AS idPage, p.size AS size, p.nChild AS nChild, p.nImage AS nImage, p.nParent, s.idPage AS idParent, pp.pageName AS parent  FROM "+strTableRefPage+" "+strCond+" GROUP BY siteName, pageName;"); //, p.idFile AS idFile

  Sql.push("SELECT FOUND_ROWS() AS n;"); // nFound
  Sql.push("SELECT count(idPage) AS n FROM "+pageTab+";"); // nUnFiltered
  var sql=Sql.join('\n'),   Val=[]; 
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  var Ou=arrObj2TabNStrCol(results[0]);
  Ou.NFilt=[results[1][0].n, results[2][0].n];
  return [null, [Ou]];
}



ReqBE.prototype.getPageHist=function*(inObj){
  var req=this.req, res=this.res;
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)')]; }
  var Ou={}, flow=req.flow
  //var strTableRefCount=pageTab+' p';
  var arg={strTableRef:strTableRefPageHist, WhereExtra:[], Prop:PropPage, strDBPrefix:strDBPrefix};  
  copySome(arg, this, ['myMySql', 'Filt', 'Where']);
  var [err, Hist]=yield* getHist(flow, arg); if(err) return [err];  Ou.Hist=Hist;

  
    // Fetching the names of (non-null) parents
  var iColParent=KeyColPageFlip.parent, arrTmpA=Ou.Hist[iColParent], IdParent=[];
  for(var i=0;i<arrTmpA.length;i++){var tmp=arrTmpA[i], boKeep=(tmp instanceof Array) && (typeof tmp[0]==='number'); if(boKeep) IdParent.push(tmp[0]);  }

  var len=IdParent.length;
  if(len){
    var sql="SELECT idPage, boTLS, www, siteName, pageName FROM "+pageSiteView+" WHERE idPage IN ("+IdParent.join(', ')+")",  Val=[];
    var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
    Ou.ParentName=arrObj2TabNStrCol(results);
  }
  
    // Fetching the names of the sites
  var sql="SELECT idSite, boTLS, www, siteName FROM "+siteTab,  Val=[];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  Ou.SiteName=arrObj2TabNStrCol(results);
  

  return [null, [Ou]];
}


ReqBE.prototype.setUpImageListCond=function*(inObj){
  var Ou={};
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)')]; }
  if(typeof inObj.Filt!='object') return [new ErrorClient('typeof inObj.Filt!="object"')];
  this.Filt=inObj.Filt;
  var arg={KeySel:[], Prop:PropImage, Filt:inObj.Filt};
  var tmp=setUpCond(arg);
  copySome(this,tmp,['strCol', 'Where']);
  return [null, [Ou]];
}

ReqBE.prototype.getImageList=function*(inObj) {
  var req=this.req, res=this.res;
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)')]; }
  var Sql=[], flow=req.flow;
  //var sql="SELECT imageName, UNIX_TIMESTAMP(tCreated) AS tCreated, boOther, idImage, idFile FROM "+imageTab+"";
  var tmpCond=array_filter(this.Where), strCond=''; if(tmpCond.length) strCond='WHERE '+tmpCond.join(' AND ');
  Sql.push("SELECT SQL_CALC_FOUND_ROWS i.imageName AS imageName, UNIX_TIMESTAMP(i.tCreated) AS tCreated, i.boOther AS boOther, i.idImage AS idImage, i.idFile AS idFile, i.size AS size, i.nParent, s.idPage AS idParent, pp.pageName AS parent  FROM "+strTableRefImage+" "+strCond+" GROUP BY imageName;"); 

  Sql.push("SELECT FOUND_ROWS() AS n;"); // nFound
  Sql.push("SELECT count(idImage) AS n FROM "+imageTab+";"); // nUnFiltered
  var sql=Sql.join('\n'),   Val=[]; 
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  var Ou=arrObj2TabNStrCol(results[0]);
  Ou.NFilt=[results[1][0].n, results[2][0].n];
  return [null, [Ou]];
}

ReqBE.prototype.getImageHist=function*(inObj){
  var req=this.req, res=this.res;
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)')]; }
  var Ou={}, flow=req.flow
  var arg={strTableRef:strTableRefImageHist, Ou:Ou, WhereExtra:[], Prop:PropImage, strDBPrefix:strDBPrefix};
  copySome(arg, this, ['myMySql', 'Filt', 'Where']);
  
  var [err, Hist]=yield* getHist(flow, arg); if(err) return [err];
  Ou.Hist=Hist;

    // Fetching the names of (non-null) parents
  var iColParent=KeyColImageFlip.parent, arrTmpA=Ou.Hist[iColParent], IdParent=[];
  for(var i=0;i<arrTmpA.length;i++){var tmp=arrTmpA[i], boKeep=(tmp instanceof Array) && (typeof tmp[0]==='number'); if(boKeep) IdParent.push(tmp[0]);  }

  var len=IdParent.length;
  if(len){
    var sql="SELECT idPage, boTLS, www, siteName, pageName FROM "+pageSiteView+" WHERE idPage IN ("+IdParent.join(', ')+")",  Val=[];
    var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
    Ou.ParentName=arrObj2TabNStrCol(results);
  }

    // Fetching the names of the sites
  var sql="SELECT idSite, boTLS, www, siteName FROM "+siteTab,  Val=[];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  Ou.SiteName=arrObj2TabNStrCol(results);

  return [null, [Ou]];
}

ReqBE.prototype.getPageInfo=function*(inObj){  // Used by uploadAdminDiv, by sendConflictCheck
  var req=this.req, res=this.res, Ou={}
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)')]; }
  var GRet=this.GRet, flow=req.flow;
  var Ou={};

  var sql="SELECT pageName, boOR, boOW, UNIX_TIMESTAMP(tCreated) AS tCreated, UNIX_TIMESTAMP(tMod) AS tMod, lastRev, boOther, strHash, size FROM "+pageLastSiteView;
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
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  Ou.FileInfo=results;
  return [null, [Ou]];
}


ReqBE.prototype.getImageInfo=function*(inObj){  // Used by diffBackUpDiv, uploadAdminDiv, uploadUserDiv
  var req=this.req, res=this.res, Ou={}
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)')]; }
  var GRet=this.GRet, flow=req.flow;
  var Ou={};

  var boLimited=0, arrName=[], nName, tmpQ; 
  if('arrName' in inObj) {
    boLimited=1; arrName=inObj.arrName;
    nName=arrName.length; if(nName>1) { tmpQ=array_fill(nName, "?").join(','); tmpQ="imageName IN ("+tmpQ+")";  } else if(nName==1) tmpQ="imageName=?"; else tmpQ="false";
  } 

  var sql="SELECT imageName, UNIX_TIMESTAMP(tCreated) AS tCreated, boOther, strHash, size FROM "+imageTab;
  
  var strLim=''; if(boLimited){ strLim=" WHERE "+tmpQ; }
  sql+=strLim;
  var Val=arrName;
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  Ou.FileInfo=results;
  return [null, [Ou]];
}


ReqBE.prototype.getLastTModNTLastBU=function*(inObj){
  var req=this.req, res=this.res, flow=req.flow, Ou={};
  if(!this.boAWLoggedIn) { return [new ErrorClient('Not logged in as admin')]; }

  //var sql='SELECT UNIX_TIMESTAMP(MAX(tMod)) AS tLastMod FROM '+versionTab;
  //var sql='SELECT pageName, UNIX_TIMESTAMP(MAX(tMod)) AS tLastMod FROM '+pageTab+' p JOIN '+versionTab+' v USING (idPage)';
  //var sql='SELECT pageName, UNIX_TIMESTAMP(v.tMod) AS tLastMod FROM '+pageTab+' p JOIN '+versionTab+' v USING (idPage) WHERE  v.tMod=(SELECT MAX(tMod) FROM '+versionTab+')';
  var sql='SELECT pageName, UNIX_TIMESTAMP(p.tMod) AS tLastMod FROM '+pageTab+' p WHERE  p.tMod=(SELECT MAX(tMod) FROM '+pageTab+')';

  var Val={};
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  if(results[0]) copySome(Ou, results[0], ['pageName', 'tLastMod']);
  
  var [err,strTmp]=yield* cmdRedis(req.flow, 'GET', ['mmmWiki_tLastBU']);
  Ou.tLastBU=strTmp;
  
  return [null, [Ou]];
}

////////////////////////////////////////////////////////////////////////
// RedirectTab
////////////////////////////////////////////////////////////////////////
ReqBE.prototype.redirectTabGet=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  if(!this.boAWLoggedIn) { return [new ErrorClient('Not logged in as admin')];  }
  var sql="SELECT idSite, siteName, www, pageName, url, UNIX_TIMESTAMP(tCreated) AS tCreated, nAccess, UNIX_TIMESTAMP(tLastAccess) AS tLastAccess, UNIX_TIMESTAMP(tMod) AS tMod FROM "+redirectSiteView+";";
  var Val=[];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  var Ou=arrObj2TabNStrCol(results);
  this.mes("Got "+results.length+" entries"); 
  extend(Ou, {boOK:1,nEntry:results.length});
  return [null, [Ou]];
}

ReqBE.prototype.redirectTabSet=function*(inObj){
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boAWLoggedIn) { return [new ErrorClient('Not logged in as admin')];  }
  var boUpd=inObj.boUpd||false;
  if(boUpd){
    //var sql="UPDATE "+redirectTab+" SET url=?, tCreated=now(), tMod=now() WHERE idSite=? AND pageName=?;";
    //var Val=[inObj.url, inObj.idSite, inObj.pageName.replace(RegExp(' ','g'),'_')];
    var sql="UPDATE "+redirectTab+" SET idSite=?, pageName=?, url=?, tCreated=now(), tMod=now() WHERE idSite=? AND pageName=?;"; 
    var Val=[inObj.idSite, inObj.pageName.replace(RegExp(' ','g'),'_'), inObj.url, inObj.idSiteOld, inObj.pageNameOld.replace(RegExp(' ','g'),'_')];
  } else {
    var sql="INSERT INTO "+redirectTab+" (idSite, pageName, url, tCreated, tMod) VALUES (?, ?, ?, now(), now())";
    var Val=[inObj.idSite, inObj.pageName.replace(RegExp(' ','g'),'_'), inObj.url];
  }
  var [err, results]=yield* this.myMySql.query(flow, sql, Val);   
  var boOK=1, mestmp="Done";
  if(err && (typeof err=='object') && err.code=='ER_DUP_ENTRY'){boOK=0; mestmp='dup key';}
  else if(err) return [err];
  
  this.mes(mestmp);
  extend(Ou, {boOK:boOK});
  return [null, [Ou]];
}
ReqBE.prototype.redirectTabDelete=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boAWLoggedIn) { return [new ErrorClient('Not logged in as admin')];  }
  var sql="DELETE FROM "+redirectTab+" WHERE idSite=? AND pageName=?";
  var Val=[inObj.idSite, inObj.pageName];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  var c=results.affectedRows, boOK, mestmp; 
  if(c==1) {boOK=1; mestmp="Entry deleted"; } else {boOK=1; mestmp=c+ " entries deleted!?"; }
  this.mes(mestmp);
  Ou.boOK=boOK;      
  return [null, [Ou]];
}

ReqBE.prototype.redirectTabResetNAccess=function*(inObj){
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boAWLoggedIn) { return [new ErrorClient('Not logged in as admin')];  }
  var sql="UPDATE "+redirectTab+" SET nAccess=0;"; 
  var Val=[];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  var boOK=1, mestmp="Done"; 
  this.mes(mestmp);
  extend(Ou, {boOK:boOK});
  return [null, [Ou]];
}

////////////////////////////////////////////////////////////////////////
// SiteTab
////////////////////////////////////////////////////////////////////////

ReqBE.prototype.siteTabGet=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boAWLoggedIn) { return [new ErrorClient('Not logged in as admin')];  }
  //var sql="SELECT idSite, siteName, www, googleAnalyticsTrackingID, urlIcon16, urlIcon200, UNIX_TIMESTAMP(tCreated) AS tCreated FROM "+siteTab+";";
  var sql="SELECT boDefault, boTLS, st.idSite AS idSite, siteName, www, googleAnalyticsTrackingID, urlIcon16, urlIcon200, UNIX_TIMESTAMP(st.tCreated) AS tCreated, SUM(p.idSite IS NOT NULL) AS nPage FROM "+siteTab+" st LEFT JOIN "+pageTab+" p ON st.idSite=p.idSite GROUP BY idSite;"
  var Val=[];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  var Ou=arrObj2TabNStrCol(results);
  this.mes("Got "+results.length+" entries");
  Ou.boOK=1;
  return [null, [Ou]];
}
  
ReqBE.prototype.siteTabSet=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boAWLoggedIn) { return [new ErrorClient('Not logged in as admin')]; }
  var boUpd=inObj.boUpd||false;

  if(boUpd){
    var sql="UPDATE "+siteTab+" SET boTLS=?, siteName=?, www=?, googleAnalyticsTrackingID=?, urlIcon16=?, urlIcon200=? WHERE idSite=?;";  //, tCreated=now() 
    var Val=[inObj.boTLS, inObj.siteName, inObj.www, inObj.googleAnalyticsTrackingID, inObj.urlIcon16, inObj.urlIcon200, inObj.idSite];
  } else {
    var sql="INSERT INTO "+siteTab+" (boTLS, siteName, www, googleAnalyticsTrackingID, urlIcon16, urlIcon200, tCreated) VALUES (?, ?, ?, ?, ?, ?, now());";
    var Val=[inObj.boTLS, inObj.siteName, inObj.www, inObj.googleAnalyticsTrackingID, inObj.urlIcon16, inObj.urlIcon200];
    sql+="SELECT LAST_INSERT_ID() AS idSite;";
  }
  var [err, results]=yield* this.myMySql.query(flow, sql, Val);
  var boOK, mestmp, idSite=inObj.idSite;
  if(err && (typeof err=='object') && err.code=='ER_DUP_ENTRY'){boOK=0; mestmp='dup key';}
  else if(err) return [err];
  else{
    boOK=1; mestmp="Done";
    if(boUpd){}
    else{idSite=results[1][0].idSite;}
  }
  this.mes(mestmp);
  extend(Ou, {boOK:boOK, idSite:idSite});
  return [null, [Ou]];
}
ReqBE.prototype.siteTabDelete=function*(inObj){ 
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boAWLoggedIn) { return [new ErrorClient('Not logged in as admin')];  }
  var sql="DELETE FROM "+siteTab+" WHERE siteName=?";
  var Val=[inObj.siteName];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  var c=results.affectedRows, boOK, mestmp; 
  if(c==1) {boOK=1; mestmp="Entry deleted"; } else {boOK=1; mestmp=c+ " entries deleted!?"; }
  this.mes(mestmp);
  Ou.boOK=boOK;      
  return [null, [Ou]];
}
ReqBE.prototype.siteTabSetDefault=function*(inObj){
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boAWLoggedIn) { return [new ErrorClient('Not logged in as admin')]; }
  var Sql=[];
  Sql.push("START TRANSACTION;");
  Sql.push("UPDATE "+siteTab+" SET boDefault=0;");
  Sql.push("UPDATE "+siteTab+" SET boDefault=1 WHERE idSite=?;");
  Sql.push("COMMIT;");
  var sql=Sql.join('\n'),    Val=[inObj.idSite];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  this.mes("OK");
  return [null, [Ou]];
}

////////////////////////////////////////////////////////////////////////
// Uploading
////////////////////////////////////////////////////////////////////////

/*********************************************************************
 * Loading pages / images / meta data
 * * a.txt b.txt c.txt
 * * meta.zip page.zip image.zip
 * * site.csv page.csv image.csv redirect.csv page.zip image.zip
 * 
 * ReqBE.prototype.uploadUser
 * app.storeFile
 * app.storeFileMult (with wrapper: ReqBE.prototype.uploadAdmin)
 * 
 * app.loadFrBUOnServ (with wrapper: ReqBE.prototype.loadFrBUOnServ) internally calls:
 *   app.loadMetaFrBU
 *********************************************************************/

ReqBE.prototype.uploadUser=function*(inObj){
  var self=this, req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  var regImg=RegExp("^(png|jpeg|jpg|gif|svg)$"), regVid=RegExp('^(mp4|ogg|webm)$');

    // Check reCaptcha with google
  var strCaptchaIn=this.captchaIn;
  var uGogCheck = "https://www.google.com/recaptcha/api/siteverify"; 
  var objForm={  secret:strReCaptchaSecretKey, response:strCaptchaIn, remoteip:req.connection.remoteAddress  };
  var semY=0, semCB=0, err, response, body;
  var reqStream=requestMod.post({url:uGogCheck, form:objForm}, function(errT, responseT, bodyT) { err=errT; response=responseT; body=bodyT; if(semY)flow.next(); semCB=1;  }); if(!semCB){semY=1; yield;}
  var buf=body;
  try{ var data = JSON.parse(buf.toString()); }catch(e){ return [e]; }
  //console.log('Data: ', data);
  if(!data.success) return [new ErrorClient('reCaptcha test not successfull')];
  
  var File=this.File;
  var n=File.length; this.mes("nFile: "+n);
  
  var file=File[0], tmpname=file.path, fileName=file.name; if(this.strName.length) fileName=this.strName;
  var Match=RegExp('\\.(\\w{1,3})$').exec(fileName); 
  if(!Match){ Ou.strMessage="The file name should be in the form xxxx.xxx"; return [null, [Ou]]; }
  var type=Match[1].toLowerCase(), err, buf;
  fs.readFile(tmpname, function(errT, bufT) { err=errT; buf=bufT; flow.next(); });  yield; if(err) return [err];
  var data=buf;
  if(data.length==0){ this.mes("data.length==0"); return [null, [Ou]]; }

  if(regImg.test(type)){
      // autoOrient
    var semY=0, semCB=0, err;
    var myCollector=concat(function(buf){  data=buf;  if(semY) flow.next(); semCB=1;  });
    var streamImg=gm(data).autoOrient().stream(function streamOut(errT, stdout, stderr) {
      err=errT; if(err){ if(semY) flow.next(); semCB=1; return; }
      stdout.pipe(myCollector);
    });
    if(!semCB) { semY=1; yield;}
    if(err) return [err];

    var strHash=md5(data);
    //var dim=imageSize(data);  console.log(fileName+', w/h: '+dim.width+' / '+dim.height);
    var sql="CALL "+strDBPrefix+"storeImage(?,?,?,?,@boOK);";
    sql="START TRANSACTION; "+sql+" COMMIT;";
    var Val=[fileName,1,data,strHash];
    var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  }else if(regVid.test(type)){ 
    var strHash=md5(data);
    var sql="CALL "+strDBPrefix+"storeVideo(?,?,?);";
    sql="START TRANSACTION; "+sql+" COMMIT;";
    var Val=[fileName,data,strHash];
    var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  }
  else{ Ou.strMessage="Unrecognized file type: "+type; return [null, [Ou]]; }

  Ou.strMessage="Done";
  return [null, [Ou]];
}

app.storeFile=function*(fileName, type, data, flow){
  var regImg=RegExp("^(png|jpeg|jpg|gif|svg)$"), regVid=RegExp('^(mp4|ogg|webm)$');
  
  if(type=='txt'){
    //fileName=fileName.replace(RegExp('(talk|template|template_talk) ','i'),'$1:');   
    var fileNameB=fileName.replace(RegExp('.txt$','i'),'');
    var obj=parsePageNameHD(fileNameB);
    var siteName=obj.siteName, pageName=obj.pageName;

    var strEditText=data.toString(), boOW=1, boOR=1, boSiteMap=1;
    var matVersion=[];

      // parse
    var arg={strEditText:strEditText, boOW:boOW, siteName:siteName, myMySql:this.myMySql};
    var [err, [objTemplateE, StrSubImage, strHtmlText, arrSub]]=yield* parse(flow, arg); if(err) return [err];

    var strHash='upload'; //randomHash();
    
      // saveByReplace
    var tStart=new Date();
    var Sql=[];
    var [strSubQ,arrSubV]=createSubStr(arrSub);
    var strSubImageQ=createSubImageStr(StrSubImage);
    //Sql.push(sqlTmpSubNewCreate+';', sqlTmpSubNewImageCreate+';');
    //Sql.push("TRUNCATE tmpSubNew; "+strSubQ,   "TRUNCATE tmpSubNewImage; "+strSubImageQ);
    Sql.push("DROP TEMPORARY TABLE IF EXISTS tmpSubNew;", sqlTmpSubNewCreate+';', strSubQ);
    Sql.push("DROP TEMPORARY TABLE IF EXISTS tmpSubNewImage;", sqlTmpSubNewImageCreate+';', strSubImageQ);
    Sql.push("CALL "+strDBPrefix+"saveByReplace(?,?,?,?,?,?, @Omess, @idPage);");
    Sql.push("COMMIT;");
    Sql.push("SELECT @Omess AS mess");
    var sql=Sql.join('\n');
    var Val=array_merge(arrSubV, StrSubImage, siteName, '', pageName, strEditText, strHtmlText, strHash);
    var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
    var iRowLast=results.length-1;
    var mess=results[iRowLast][0].mess;
    var tDBOperations=(new Date())-tStart;
    console.log('  size:'+strEditText.length+'/'+strHtmlText.length+' [byte], nSub:'+arrSub.length+', nsubImage:'+StrSubImage.length+', tDBOperations:'+tDBOperations+'ms');
    
    /*
          // saveByReplace
    var {sql, Val}=createSaveByReplaceSQL(siteName, '', pageName, strEditText, strHtmlText, strHash, arrSub, StrSubImage);
    //console.time('dbOperations');
    var tStart=new Date();
    //sql="SET autocommit=0;"+sql+" SET autocommit=1;";
    var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
    //var iRowLast=results.length-nEndingResults-1;
    var iRowLast=results.length-1;
    var mess=results[iRowLast][0].mess;//if(typeof results[iRowLast][0]=='object')
    if(mess!='done' && mess!='deleting') { console.log(mess); return [new ErrorClient('Error: '+mess+' ('+fileName+')')]; }
    var tDBOperations=(new Date())-tStart;
    console.log('  size:'+strEditText.length+'/'+strHtmlText.length+' [byte], nSub:'+arrSub.length+', nsubImage:'+StrSubImage.length+', tDBOperations:'+tDBOperations+'ms');
    //console.timeEnd('dbOperations');
*/

  }else if(regImg.test(type)){
    var strHash=md5(data); 
    //var dim=imageSize(data);  console.log(fileName+', w/h: '+dim.width+' / '+dim.height);
    var sql="CALL "+strDBPrefix+"storeImage(?,?,?,?,@boOK);";
    var Val=[fileName,0,data,strHash];
    var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  }else if(regVid.test(type)){ 
    var strHash=md5(data);
    var sql="CALL "+strDBPrefix+"storeVideo(?,?,?);";
    var Val=[fileName,data,strHash];
    var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  }
  else{  return [new Error("Unrecognized file type: "+type)]; }
  
  return [null, [{}]];
  //process.stdout.write("*");
}

app.storeFileMult=function*(flow, File){
  var regBoTalk=RegExp('(template_)?talk:');
  var FileOrg=File;
  var n=FileOrg.length;
  var tmp=n+" files."; console.log(tmp); 
  var FileTalk=[]; for(var i=FileOrg.length-1;i>=0;i--){ if(regBoTalk.test(FileOrg[i].name)) { var item=mySplice1(FileOrg,i);  FileTalk.push(item);  }  } FileOrg=FileTalk.concat(FileOrg);
  
  //var sql="START TRANSACTION;", Val=[];
  //Sql.push(`LOCK TABLES `+pageTab+` WRITE;`);
  var sql="SET autocommit=0;", Val=[];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  
  for(var i=0;i<FileOrg.length;i++){
    var fileOrg=FileOrg[i], tmpname=fileOrg.path;
    var err, buf;
    fs.readFile(tmpname, function(errT, bufT) { err=errT; buf=bufT; flow.next(); }); yield;  if(err) return [err];
    var dataOrg=buf; 
    if(fileOrg.type=='application/zip' || fileOrg.type=='application/x-zip-compressed'){
       
      var zip=new NodeZip(dataOrg, {base64: false, checkCRC32: true});
      var FileInZip=zip.files;
      
      var tmp="Zip file with "+Object.keys(FileInZip).length+" files."; console.log(tmp);
      var Key=Object.keys(FileInZip), KeyTalk=[];  for(var j=Key.length-1;j>=0;j--){ if(regBoTalk.test(Key[j])) { var item=mySplice1(Key,j);  KeyTalk.push(item); } }  Key=KeyTalk.concat(Key);  
      //for(var fileName in File){
      for(var j=0;j<Key.length;j++){
        var fileName=Key[j];
        var fileInZip=FileInZip[fileName];
        var Match=RegExp('\\.(\\w{1,3})$').exec(fileName);
        //var type=Match[1].toLowerCase(), bufT=new Buffer(fileInZip._data,'binary');//b.toString();
        var type=Match[1].toLowerCase(), bufT=Buffer.from(fileInZip._data,'binary');//b.toString();

        console.log((j+1)+'/'+Key.length+' '+fileName);
        var [err]=yield* storeFile.call(this, fileName, type, bufT, flow);  if(err) return [err];
      } 

    } else {
      var fileName=fileOrg.name;
      var Match=RegExp('\\.(\\w{1,4})$').exec(fileName);
      var type=Match[1].toLowerCase();
 
      console.log((i+1)+'/'+FileOrg.length+' '+fileName+' '+dataOrg.length);
      var [err]=yield* storeFile.call(this, fileName, type, dataOrg, flow);  if(err) return [err];
    } 
  }
  
  //var sql="COMMIT;", Val=[];
  var sql="SET autocommit=1; COMMIT;", Val=[];
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  
  return [null];
}
ReqBE.prototype.uploadAdmin=function*(inObj){
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  var Ou={};
  if(!this.boAWLoggedIn) { return [new ErrorClient('Not logged in as admin')];  }
  this.mes("Working... (check server console for progress) ");
  var [err]=yield* storeFileMult.call(this, flow, this.File); if(err) return [err];
  return [null, [0]];
}


app.loadMetaFrBU=function*(flow, oFile){
  var strFile=oFile.strName, strCSV=oFile.strData;
  if(typeof strCSV=='undefined'){
    //var strFileLong=path.join(__dirname, '..', 'mmmWikiBU', strFile);
    var strFileLong=oFile.path;
    var err, buf;  fs.readFile(strFileLong, function(errT, bufT) {  err=errT; buf=bufT;  flow.next(); });   yield;  if(err) return [err];
    strCSV=buf.toString().trim();
  }

  var [arrHead,arrData]= yield* csvParseMy(flow, strCSV);

  var nRow=arrData.length;
  var ICol=array_flip(arrHead);
  
  var Sql=[], Val=[]; 
  if(strFile=='site.csv'){
    Sql.push('INSERT INTO '+siteTab+' (boDefault, boTLS, siteName, www, googleAnalyticsTrackingID, urlIcon16, urlIcon200, aWPassword, aRPassword, tCreated) VALUES');
    var tmpQ=array_fill(9, "?").join(',')+", FROM_UNIXTIME(GREATEST(1,?))";
    var tmpQ2='('+array_fill(nRow, tmpQ).join('),\n(')+')';
    Sql.push(tmpQ2);
    Sql.push("ON DUPLICATE KEY UPDATE boDefault=VALUES(boDefault), boTLS=VALUES(boTLS), siteName=VALUES(siteName), www=VALUES(www), googleAnalyticsTrackingID=VALUES(googleAnalyticsTrackingID), urlIcon16=VALUES(urlIcon16), urlIcon200=VALUES(urlIcon200), aWPassword=VALUES(aWPassword), aRPassword=VALUES(aRPassword), tCreated=VALUES(tCreated)"); 
    var arrDataN=Array(nRow)
    for(var j=0;j<nRow;j++){ //"boDefault","boTLS","urlIcon16","urlIcon200","googleAnalyticsTrackingID","aWPassword","aRPassword","name","www"
      var rowN=arrArrange(arrData[j],[ICol.boDefault, ICol.boTLS, ICol.name, ICol.www, ICol.googleAnalyticsTrackingID, ICol.urlIcon16, ICol.urlIcon200, ICol.aWPassword, ICol.aRPassword]);
      rowN.push(1);
      arrDataN[j]=rowN;
    }
    var Val=[].concat.apply([], arrDataN);
  } else if(strFile=='page.csv'){
    var strProt="UPDATE "+pageSiteView+" p JOIN "+versionTab+" v ON p.idPage=v.idPage SET boOR=?, boOW=?, boSiteMap=?, tCreated=FROM_UNIXTIME(GREATEST(1,?)), p.tMod=FROM_UNIXTIME(GREATEST(1,?)), v.tMod=FROM_UNIXTIME(GREATEST(1,?)) WHERE p.siteName=? AND pageName=?;";
    Sql=array_fill(nRow, strProt);
    var arrDataN=Array(nRow);
    for(var j=0;j<nRow;j++){
      arrDataN[j]=arrArrange(arrData[j],[ICol.boOR, ICol.boOW, ICol.boSiteMap, ICol.tCreated, ICol.tMod, ICol.tMod, ICol.siteName, ICol.strName]);
    }
    var Val=[].concat.apply([], arrDataN);
  } else if(strFile=='image.csv'){
    var strProt="UPDATE "+imageTab+" SET boOther=?, tCreated=FROM_UNIXTIME(GREATEST(1,?)) WHERE imageName=?;";
    Sql=array_fill(nRow, strProt);
    var arrDataN=Array(nRow);
    for(var j=0;j<nRow;j++){
      arrDataN[j]=arrArrange(arrData[j],[ICol.boOther, ICol.tCreated, ICol.imageName]);
    }
    var Val=[].concat.apply([], arrDataN);
  } else if(strFile=='redirect.csv'){
    var strProt="REPLACE INTO "+redirectTab+" (idSite, pageName, url, tCreated, nAccess, tLastAccess) (SELECT idSite, ?, ?, FROM_UNIXTIME(GREATEST(1,?)), ?, FROM_UNIXTIME(GREATEST(1,?)) FROM mmmWiki_site WHERE siteName=?);";
    Sql=array_fill(nRow, strProt);
    var arrDataN=Array(nRow);
    for(var j=0;j<nRow;j++){
      arrDataN[j]=arrArrange(arrData[j],[ICol.nameLC, ICol.url, ICol.tMod, ICol.nAccess, ICol.tLastAccess, ICol.siteName]);
    }
    var Val=[].concat.apply([], arrDataN);
  }
  
  var sql=Sql.join('\n');
  var [err, results]=yield* this.myMySql.query(flow, sql, Val); if(err) return [err];
  
  
  return [null, [0]];
}

app.loadFrBUOnServ=function*(flow, StrFile){ 
  var strFileToLoadFolder=path.join(__dirname, '..', 'mmmWikiBU'); 
  //if(typeof StrFile=='undefined') {
    //var err, ObjFile;  fs.readdir(strFileToLoadFolder, {withFileTypes:true}, function(errT, filesT){ err=errT; ObjFile=filesT; flow.next(); }); yield;  if(err) return [err];
    //StrFile=[]; ObjFile.forEach((objFile)=>{if(objFile.isFile()) StrFile.push(objFile.name);});
  //}
  if(typeof StrFile=='undefined') { StrFile=['.']; }
  if( StrFile.length==1) {
    var pathTmp=path.join(__dirname, '..', 'mmmWikiBU',StrFile[0]); 
    var err, stats; fs.lstat(pathTmp, function(errT, statsT){ err=errT; stats=statsT; flow.next(); }); yield;  if(err) return [err];
    if(stats.isDirectory()){
      var err, DirEnt;  fs.readdir(pathTmp, {withFileTypes:true}, function(errT, filesT){ err=errT; DirEnt=filesT; flow.next(); }); yield;  if(err) return [err];
      StrFile=[]; DirEnt.forEach((objFile)=>{if(objFile.isFile()) StrFile.push(objFile.name);});
      strFileToLoadFolder=pathTmp;
    }
  }
    // Reorder/extract csv (meta data) files:
    // Look for csv files (also in any meta.zip) and make sure files named "site.csv" comes first, pages/images in the middle, and lastly the remaining csv-files.
  var ObjFile=[], ObjFileStart=[], ObjFileEnd=[], regExt=/\.([a-z]+)/;
  for(var i=0;i<StrFile.length;i++){
    var strName=StrFile[i];
    var Match=regExt.exec(strName), strExt=Match[1].toLowerCase();
    var boMeta=/meta/i.test(strName);
    var strFileLong=path.join(strFileToLoadFolder, strName);
    if(strExt=='csv') { var oFile={strName:strName, strExt:strExt, path:strFileLong}; if(strName=='site.csv') ObjFileStart.unshift(oFile); else ObjFileEnd.push(oFile); }
    else if(strExt=='zip' && boMeta) {
      var err, buf; fs.readFile(strFileLong, function(errT, bufT) { err=errT; buf=bufT; flow.next(); }); yield;  if(err) return [err];
      var dataOrg=buf; 
      
      var zip=new NodeZip(dataOrg, {base64: false, checkCRC32: true});
      var FileInZip=zip.files;
      var Key=Object.keys(FileInZip);  
      for(var j=0;j<Key.length;j++){
        var strFileZ=Key[j];
        var Match=regExt.exec(strFileZ), strExt=Match[1].toLowerCase();
        var fileInZip=FileInZip[strFileZ];
        var bufT=Buffer.from(fileInZip._data,'binary');
        var strCSV=bufT.toString().trim();
        var oFile={strName:strFileZ, strExt:strExt, strData:strCSV}; if(strFileZ=='site.csv') ObjFileStart.push(oFile); else ObjFileEnd.push(oFile);
        
        console.log((j+1)+'/'+Key.length+' '+strFileZ);
      }
    }
    else { ObjFile.push({strName:strName, strExt:strExt, path:strFileLong}); }
  }
  ObjFile=ObjFileStart.concat(ObjFile, ObjFileEnd);
  
    // Load respective file
  var obj={myMySql:new MyMySql(mysqlPool)};
  for(var i=0;i<ObjFile.length;i++){
    var {strName,strExt}=oFile=ObjFile[i];
    if(strExt=='csv') {var [err]=yield* loadMetaFrBU.call(obj, flow, oFile); if(err) return [err]; }
    else {
      var fileTmp={name:oFile.strName, path:oFile.path}; if(strExt=='zip') fileTmp.type='application/zip';
      var [err]=yield* storeFileMult.call(obj, flow, [fileTmp]); if(err) return [err];
    }
    console.log(oFile.strName+' done');
  }
  obj.myMySql.fin(); 
  return [null, [0]];
}
ReqBE.prototype.loadFrBUOnServ=function*(inObj){
  var req=this.req, res=this.res;
  var GRet=this.GRet, flow=req.flow;
  if(!this.boAWLoggedIn) { return [new ErrorClient('Not logged in as admin')]; }
  this.mes("Working... (check server console for progress) ");
  var StrFile=inObj.File;
  var [err]=yield* loadFrBUOnServ(flow, StrFile); if(err) return [err];
  return [null, [0]];
}
