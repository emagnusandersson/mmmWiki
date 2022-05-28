"use strict"

//const { Int32, Long, ObjectId } = require("mongodb"); //, ObjectID
import { Int32, Long, ObjectId } from "mongodb"; //, ObjectID


/******************************************************************************
 * ReqBE
 ******************************************************************************/
app.ReqBE=function(objReqRes){
  extend(this, objReqRes);
  //this.Str=[];  this.Out={GRet:{}, dataArr:[]}; this.GRet=this.Out.GRet;
  this.Str=[];  this.dataArr=[];  this.GRet={}; 
}

  // Method "mesO" and "mesEO" are only called from "go". Method "mes" can be called from any method.
ReqBE.prototype.mes=function(str){ this.Str.push(str); }
ReqBE.prototype.mesO=function(e){
  var {res}=this;
    // Prepare an error-message for the browser.
  var strEBrowser, statusCode=200;
  if(typeof e=='string'){strEBrowser=e; }
  else if(typeof e=='object'){
    if(e instanceof Error) {var {message,statusCode}=e; strEBrowser='message: ' + message; }
    else { strEBrowser=e.toString(); }
  }
  
    // Write message (and other data) to browser
  this.Str.push(strEBrowser);
  this.GRet.strMessageText=this.Str.join(', '); 
  
    // mmmWiki specific
  var GRet=this.GRet;    //if('tMod' in GRet && GRet.tMod instanceof Date ) GRet.tMod=GRet.tMod.toUnix();
  
  var objOut=copySome({}, this, ["dataArr", "GRet"]);
  var str=serialize(objOut);
  res.statusCode=statusCode;
  if(str.length<lenGZ) res.end(str);
  else{
    res.setHeader("Content-Encoding", 'gzip');
    //res.setHeader('Content-Type', MimeType.txt);
    Streamify(str).pipe(zlib.createGzip()).pipe(res);
  }
}
ReqBE.prototype.mesEO=function(e, statusCode=500){
  var {req,res}=this;

    // Write error to error log
  console.error(e);
  var headersTmp=copySome({}, req.headers, ['user-agent', 'host', 'origin', 'referer', 'x-requested-with']);
  console.error(headersTmp);

    // Prepare an error-message for the browser.
  var strEBrowser;
  if(typeof e=='string'){strEBrowser=e; }
  else if(typeof e=='object'){
    //if('syscal' in e) StrELog.push('syscal: '+e.syscal);
    if(e instanceof Error) {strEBrowser='name: '+e.name+', code: '+e.code+', message: ' + e.message; }
    else { strEBrowser=e.toString();  }
  }

    // Write stuff to browser
  this.Str.push(strEBrowser);    this.GRet.strMessageText=this.Str.join(', ');
  
    // mmmWiki specific
  var GRet=this.GRet;    //if('tMod' in GRet && GRet.tMod instanceof Date) GRet.tMod=GRet.tMod.toUnix();
  
  //res.writeHead(500, {"Content-Type": MimeType.txt}); 
  var objOut=copySome({}, this, ["dataArr", "GRet"]);
  res.statusCode=statusCode;
  res.end(serialize(objOut));
}



ReqBE.prototype.go=async function(){ 
  var {req, res}=this;
  
  var strT=req.headers['sec-fetch-site'];
  if(strT && strT!='same-origin') { this.mesEO(Error("sec-fetch-site header is not 'same-origin' ("+strT+")"));  return;}
  

  if('x-requested-with' in req.headers){
    var str=req.headers['x-requested-with'];   if(str!=="XMLHttpRequest") { this.mesEO(Error("x-requested-with: "+str));  return; }
  } else { this.mesEO(Error("x-requested-with not set"));  return;  }

  if('referer' in req.headers) {
    var urlT=req.strSchemeLong+req.wwwSite, lTmp=urlT.length, referer=req.headers.referer, lMin=Math.min(lTmp, referer.length);
    if(referer.slice(0,lMin)!=urlT.slice(0,lMin)) { this.mesEO(Error('Referer does not match,  got: '+referer+', expected: '+urlT));  return;  }
  } else {  this.mesEO(Error("Referer not set"));  return; }


    // Extract input data either 'POST' or 'GET'
  var jsonInput;
  if(req.method=='POST'){
    //var strOriginTmp=req.urlSite; //if(req.port==5000) strOriginTmp+=':5000';
    //var strT=req.headers.Origin; if(strT!=strOriginTmp) {this.mesEO(Error("Origin-header is not the same wwwSite"));return; }
    if('x-type' in req.headers ){ //&& req.headers['x-type']=='single'
      var form = new formidable.IncomingForm();
      form.multiples = true;  
      var File=this.File=[];

      form.on('file', function(field, file) {
        //console.log(file.originalFilename);
        //console.log(JSON.stringify(field));
        //files.push([field, file]);
        File.push(file);
      });

      var [err, fields, files]=await new Promise(resolve=>{  form.parse(req, function(...arg){ resolve(arg);});  });    if(err){ this.mesEO(err); return; } 
      
      //this.File=files['fileToUpload[]'];
      if('g-recaptcha-response' in fields) this.captchaIn=fields['g-recaptcha-response']; else this.captchaIn='';
      if('strName' in fields) this.strName=fields.strName; else this.strName='';
      if(!(this.File instanceof Array)) this.File=[this.File];
      jsonInput=fields.vec;
      
    }else{
      var [err,buf]=await new Promise(resolve=>{ var myConcat=concat(function(bufT){ resolve([null,bufT]) });    req.pipe(myConcat);  });
      jsonInput=buf.toString();
    }
  } else if(req.method=='GET'){
    var objUrl=url.parse(req.url), qs=objUrl.query||''; jsonInput=urldecode(qs);
    //  With jQuery: "/be.json?[[%22pageLoad%22,1],[%22page%22,%22start%22]]"
    //  Now: "/be.json?%5B%5B%22pageLoad%22%2C1%5D%2C%5B%22page%22%2C%22start%22%5D%5D"
  }
  
  try{ var beArr=JSON.parse(jsonInput); }catch(e){ this.mesEO(e); debugger;  return; }
  
  //this.mesEO("hello.");  return;
  //if(!req.boCookieStrictOK) {this.mesEO(Error('Strict cookie not set'));  return;   }
  
    // Get boARLoggedIn / boAWLoggedIn.  Conditionally push deadlines forward ("expire" returns 1 if timer was set or 0 if variable doesn't exist)
  var {sessionIDR, sessionIDW}=req.cookies; //, arrCookieOut=[];
  var luaCountFunc=`local c=redis.call('GET',KEYS[1]); redis.call('EXPIRE',KEYS[1], ARGV[1]); return c`;
  if(sessionIDR){
    var [err,value]=await cmdRedis('EVAL',[luaCountFunc, 1, sessionIDR+'_adminRTimer', maxAdminRUnactivityTime]); this.boARLoggedIn=Number(value);
    //arrCookieOut.push("sessionIDR="+sessionIDR+StrSessionIDRProp[this.boARLoggedIn]);
    res.replaceCookie("sessionIDR="+sessionIDR+StrSessionIDRProp[this.boARLoggedIn]);
  }else {this.boARLoggedIn=0;}
  if(sessionIDW){
    var [err,value]=await cmdRedis('EVAL',[luaCountFunc, 1, sessionIDW+'_adminWTimer', maxAdminWUnactivityTime]); this.boAWLoggedIn=Number(value);
    //arrCookieOut.push("sessionIDW="+sessionIDW+StrSessionIDWProp[this.boAWLoggedIn]);
    res.replaceCookie("sessionIDW="+sessionIDW+StrSessionIDWProp[this.boAWLoggedIn]);
  }else {this.boAWLoggedIn=0;}

  //if(arrCookieOut.length) res.setHeader("Set-Cookie", arrCookieOut);


  //res.setHeader("Content-type", MimeType.json);


    // Remove the beArr[i][0] values that are not functions
  var CSRFIn; this.tModBrowser=0; 
  for(var i=beArr.length-1;i>=0;i--){ 
    var row=beArr[i];
    if(row[0]=='page') {this.pageName=row[1]; array_removeInd(beArr,i);}
    //else if(row[0]=='tMod') {this.tModBrowser=Number(row[1]); array_removeInd(beArr,i);}
    else if(row[0]=='tMod') {this.tModBrowser=new Date(row[1]); array_removeInd(beArr,i);}
    else if(row[0]=='CSRFCode') {CSRFIn=row[1]; array_removeInd(beArr,i);}
  }

  var len=beArr.length;
  var StrInFunc=Array(len); for(var i=0;i<len;i++){StrInFunc[i]=beArr[i][0];}
  var arrCSRF, arrNoCSRF, allowed, boCheckCSRF, boSetNewCSRF;

           // Arrays of functions
    // Functions that changes something must check and refresh CSRF-code
  var arrCSRF=['myChMod', 'myChModImage', 'saveByAdd', 'saveByReplace', 'uploadUser', 'uploadAdmin', 'loadFrServW', 'getPageInfo', 'getImageInfo', 'setUpPageListCond', 'getPageList', 'getPageHist', 'setUpImageListCond', 'getImageList', 'getImageHist', 'getParent', 'getParentOfImage','getPageInfoById', 'getImageInfoById', 'deletePage', 'deleteImage', 'renamePage', 'renameImage', 'setStrLang', 'setSiteOfPage', 'collisionTestForSetSiteOfPage', 'getAWRestrictedStuff', 'redirectTabGet', 'redirectTabSet', 'redirectTabDelete', 'redirectTabResetNAccess', 'siteTabGet', 'siteTabInsert', 'siteTabUpd', 'siteTabDelete', 'siteTabSetDefault'];  //'getLastTModNTLastBU', ,'siteTabSet'
  var arrNoCSRF=['getLoginBoolean','aRLogin','aWLogin','aWLogout','aRLogout','pageLoad','pageCompare','getPreview'];  
  allowed=arrCSRF.concat(arrNoCSRF);

    // Assign boCheckCSRF and boSetNewCSRF
  boCheckCSRF=0; boSetNewCSRF=0;   for(var i=0; i<beArr.length; i++){ var row=beArr[i]; if(in_array(row[0],arrCSRF)) {  boCheckCSRF=1; boSetNewCSRF=1;}  }    
  if(StrComp(StrInFunc,['getLoginBoolean'])){ boCheckCSRF=0; boSetNewCSRF=1; } // Public pages
  var boSinglePageLoad=StrComp(StrInFunc,['pageLoad']);
  if(boSinglePageLoad){ boCheckCSRF=0; boSetNewCSRF=0; } // Private pages: CSRF was set in index.html
  
    // Require POST-request for most combinations
  if(!boSinglePageLoad && req.method=='GET')  {this.mesEO(Error("GET-request is not allowed."));  return;}
  
  //if(boDbg) boCheckCSRF=0;
  
  // Private:
  //                                                                 index.html  first ajax (pageLoad)
  //Shall look the same (be cacheable (not include boARLoggedIn etc))     no           yes

  // Public:
  //                                                                 index.html  first ajax (getLoginBoolean)
  //Shall look the same (be cacheable (not include boARLoggedIn etc))     yes          no


  var pageName=this.pageName;
    // cecking/set CSRF-code
    
  
      
  var CSRFCode=null;
  if(boCheckCSRF){
    if(!CSRFIn){ this.mesO('CSRFCode not set (try reload page)'); return;}
    
    if(!('sessionIDCSRF' in req.cookies)) { this.mesO('sessionIDCSRF cookie not set (try reload page)'); return;}
    var luaCountFunc=`local c=redis.call('GET',KEYS[1]); redis.call('EXPIRE',KEYS[1], ARGV[1]); return c`;
    var [err,CSRFCode]=await cmdRedis('EVAL', [luaCountFunc, 1, req.cookies.sessionIDCSRF+'_CSRF', maxAdminRUnactivityTime]);
     

    if(!CSRFCode) { this.mesO('No such CSRF code stored for that sessionIDCSRF (try reload page)'); return;}
    if(CSRFIn!==CSRFCode){ this.mesO('CSRFCode not matching stored value (try reload page)'); return;}
 
  }
  
  if(boSetNewCSRF) {
    if(boCheckCSRF) { var sessionIDCSRF=req.cookies.sessionIDCSRF;}
    else{
      var sessionIDCSRF=null, CSRFCode=null;
      if('sessionIDCSRF' in req.cookies) { 
        sessionIDCSRF=req.cookies.sessionIDCSRF;
        var luaCountFunc=`local c=redis.call('GET',KEYS[1]); redis.call('EXPIRE',KEYS[1], ARGV[1]); return c`;
        var [err,CSRFCode]=await cmdRedis('EVAL', [luaCountFunc, 1, sessionIDCSRF+'_CSRF', maxAdminRUnactivityTime]);
        if(!CSRFCode) sessionIDCSRF=randomHash(); // To avoid session fixation
      }  else sessionIDCSRF=randomHash();
    } 

    var CSRFCode=randomHash();
    var [err,tmp]=await cmdRedis('SET', [sessionIDCSRF+'_CSRF', CSRFCode, 'EX', maxAdminRUnactivityTime]);
    this.GRet.CSRFCode=CSRFCode;
    
    //res.setHeader("Set-Cookie", "sessionIDCSRF="+sessionIDCSRF+strCookiePropLax); 
    res.replaceCookie("sessionIDCSRF="+sessionIDCSRF+strCookiePropLax); 
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
    var [func,inObj]=Func[k],   [err, result]=await func.call(this, inObj);
    if(res.finished) return;
    this.dataArr[k]=result;
    if(err){
      if(typeof err=='object' && err.name=='ErrorClient') this.mesO(err); else this.mesEO(err);     return;
    }
    //else this.dataArr.push(result);
  }
  this.mesO();
  
}


ReqBE.prototype.aRLogin=async function(inObj){ 
  var {req, res, GRet}=this, aRPass=inObj.pass; 
  var Ou={};  
  if(this.boARLoggedIn==1 ){ this.mesO('Already have read access'); return [null, [Ou]]; }
  if(!aRPass) { this.mesO('Password needed');  return [null, [Ou]];  }
  if(aRPass!=aRPassword) { this.mesO('Wrong password');  return [null, [Ou]];  }
  
  this.boARLoggedIn=1; this.mes('Logged in (viewing)');

    // Delete old session-token
    // (Changing session-token at login (as recomended by security recomendations) (to prevent session fixation))
  var {sessionIDR}=req.cookies;
  if(sessionIDR) { var [err]=await cmdRedis('DEL', [sessionIDR+'_adminRTimer']); if(err) return [err]; }
  var sessionIDR=randomHash();
  var [err]=await cmdRedis('SET', [sessionIDR+'_adminRTimer', 1, 'EX', maxAdminRUnactivityTime]);
  //res.setHeader("Set-Cookie", "sessionIDR="+sessionIDR+StrSessionIDRProp[1]);
  res.replaceCookie("sessionIDR="+sessionIDR+StrSessionIDRProp[1]);
  
  copySome(GRet,this,['boARLoggedIn','boAWLoggedIn']); 
    // Returning both (to make it a bit simpler on the client side) 
    //   Both are returned in aWLogin, getLoginBoolean and in index-request.
    //     Also aWLogout, aRLogout return both even if it shouldn't be needed.
  return [null, [Ou]];
}

ReqBE.prototype.aWLogin=async function(inObj){ 
  var {req, res, GRet}=this, aWPass=inObj.pass; 
  var Ou={};  
  if(this.boAWLoggedIn==1 ){ this.mesO('Already have write access'); return [null, [Ou]]; }
  if(!aWPass) { this.mesO('Password needed');  return [null, [Ou]];  }
  if(aWPass!=aWPassword) { this.mesO('Wrong password');  return [null, [Ou]];  }

  this.boARLoggedIn=1; this.boAWLoggedIn=1; this.mes('Logged in');
  
    // Delete old session-token
    // (Changing session-token at login (as recomended by security recomendations) (to prevent session fixation))
  var {sessionIDW}=req.cookies;
  if(sessionIDW) {  var [err]=await cmdRedis('DEL', [sessionIDW+'_adminWTimer']); if(err) return [err];  }
  var sessionIDW=randomHash();
  var [err]=await cmdRedis('SET', [sessionIDW+'_adminWTimer', 1, 'EX', maxAdminWUnactivityTime]);
  //res.setHeader("Set-Cookie", "sessionIDW="+sessionIDW+StrSessionIDWProp[1]);
  res.replaceCookie("sessionIDW="+sessionIDW+StrSessionIDWProp[1]);

  
  if(objOthersActivity) extend(objOthersActivity,objOthersActivityDefault);

  copySome(GRet,this,['boARLoggedIn','boAWLoggedIn']);
  return [null, [Ou]];
}

ReqBE.prototype.aRLogout=async function(inObj){ 
  var {req, res, GRet}=this, Ou={}, {sessionIDR}=req.cookies;
  var [err,tmp]=await cmdRedis('DEL', [sessionIDR+'_adminRTimer']);
  //res.setHeader("Set-Cookie", "sessionIDR="+sessionIDR+StrSessionIDRProp[0]);
  res.replaceCookie("sessionIDR="+sessionIDR+StrSessionIDRProp[0]);

  if(this.boARLoggedIn) {this.mes('Logged out (read access)'); GRet.strDiffText=''; } 
  this.boARLoggedIn=0;
  copySome(GRet,this,['boARLoggedIn','boAWLoggedIn']);
  return [null, [Ou]];
}

ReqBE.prototype.aWLogout=async function(inObj){ 
  var {req, res, GRet}=this, Ou={}, {sessionIDW}=req.cookies;
  var [err,tmp]=await cmdRedis('DEL', [sessionIDW+'_adminWTimer']);
  //res.setHeader("Set-Cookie", "sessionIDW="+sessionIDW+StrSessionIDWProp[0]);
  res.replaceCookie("sessionIDW="+sessionIDW+StrSessionIDWProp[0]);

  if(this.boAWLoggedIn) {this.mes('Logged out (write access)'); GRet.strDiffText=''; } 
  this.boAWLoggedIn=0; 
  copySome(GRet,this,['boARLoggedIn','boAWLoggedIn']);
  return [null, [Ou]];
}


ReqBE.prototype.myChMod=async function(inObj){    
  var {req, res, GRet}=this, Ou={};
  if(!this.boAWLoggedIn) return [new ErrorClient('not logged in (as Administrator)', 401)]; 
  var {Id=[]}=inObj;
  if(!(Id instanceof Array) || Id.length==0 || typeof Id[0]!='string') { return [new ErrorClient('no files')]; } 

  var strBit; if('boOR' in inObj) strBit='boOR'; else if('boOW' in inObj) strBit='boOW'; else if('boSiteMap' in inObj) strBit='boSiteMap'; 
  else {return [new ErrorClient('neither boOR, boOW or boSiteMap was set.')];}
  var boBit=Boolean(inObj[strBit]);
  var strHash=strBit+" set to "+boBit;
  var objSet={tModCache:new Date(0), strHashParse:strHash, strHash}; objSet[strBit]=boBit;

  //var lId=Id.length; //for(var i=0;i<lId;i++){ Id[i]=Id[i]; }  // Note! Id[i] is not ObjectId

  // var lId=Id.length, arg=Array(lId);
  // for(var i=0;i<lId;i++){
  //   arg[i]={ updateOne: { "filter": { _id:Id[i] }, "update": { $set : objSet },  "upsert": true } }
  // }
  // var [err, result]=await collectionPage.bulkWrite(arg, {session:sessionMongo}).toNBP(); if(err) return [err];

  var Arg=[{_id:{$in:Id}}, {$set:objSet}];  // Note! Id[i] is not ObjectId
  var [err, result]=await collectionPage.updateMany(...Arg).toNBP(); if(err) return [err];

  this.mes("myChMod: nModified: "+result.modifiedCount);
  //this.mes('chmod: '+strBit+" set to "+boBit+" on "+lId+" page(s).");
  GRet[strBit]=inObj[strBit]; // Sending boOW/boSiteMap  back will trigger closing/opening of the save/preview buttons
  return [null, [Ou]];
}
ReqBE.prototype.myChModImage=async function(inObj){ 
  var {req, res, GRet}=this, Ou={};
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)', 401)];}
  
  if('Id' in inObj && inObj.Id instanceof Array && inObj.Id.length) var Id=inObj.Id; else {  return [new ErrorClient('chmodImage: no files')]; }

  var {boOther}=inObj; boOther=Boolean(boOther);
  var lId=Id.length; for(var i=0;i<lId;i++){ Id[i]=ObjectId(Id[i]); }

  // var lId=Id.length, arg=Array(lId);
  // for(var i=0;i<lId;i++){
  //   arg[i]={ updateOne: { "filter": { _id:ObjectId(Id[i]) }, "update": { $set : {boOther:inObj.boOther} },  "upsert": true } }
  // }
  // var [err, result]=await collectionImage.bulkWrite(arg, {session:sessionMongo}).toNBP(); if(err) return [err];

  var Arg=[{_id:{$in:Id}},{$set:{boOther}}];
  var [err, result]=await collectionImage.updateMany(...Arg).toNBP(); if(err) return [err];

  this.mes("chmodImage: nModified: "+result.result.nModified);
  //this.mes("chmodImage: boOther set to "+boOther+" on "+lId+" page(s).");
  
  GRet.boOther=inObj.boOther; // Sending boOther  back will trigger closing/opening of the save/preview buttons
  return [null, [Ou]];
}

  
ReqBE.prototype.deletePage=async function(inObj){
  var {req, res, GRet}=this, Ou={};
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)', 401)];}
  
  if('Id' in inObj && inObj.Id instanceof Array && inObj.Id.length) var Id=inObj.Id; else { return [new ErrorClient('deletePage: no files')]; }
  
  const sessionMongo = mongoClient.startSession();
  sessionMongo.startTransaction({ readPreference:'primary', readConcern: {level:'local'}, writeConcern:{w:'majority'}   });

  var [err, results]=await deletePageIDMult(sessionMongo,Id);

  if(err) { var a=await sessionMongo.abortTransaction(); sessionMongo.endSession(); return [err]; }
  var a=await sessionMongo.commitTransaction(); sessionMongo.endSession();
  this.mes('pages deleted');
  return [null, [Ou]];
}

ReqBE.prototype.deleteImage=async function(inObj){ 
  var {req, res, GRet}=this, Ou={};
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)', 401)]; }

  if('Id' in inObj && inObj.Id instanceof Array && inObj.Id.length) var Id=inObj.Id; else { return [new ErrorClient('deleteImage: no files')]; }
  
  for(var i=0;i<Id.length;i++) Id[i]=ObjectId(Id[i]);
  const sessionMongo = mongoClient.startSession();
  sessionMongo.startTransaction({ readPreference:'primary', readConcern: {level:'local'}, writeConcern:{w:'majority'}   });

  var [err, results]=await deleteImageIDMult(sessionMongo, Id); if(err) return [err];

  if(err) { var a=await sessionMongo.abortTransaction(); sessionMongo.endSession(); return [err]; }
  var a=await sessionMongo.commitTransaction(); sessionMongo.endSession();

  this.mes('images deleted');   
  return [null, [Ou]];
}

ReqBE.prototype.setStrLang=async function(inObj){   
  var {req, res, GRet}=this, Ou={};
  if(!this.boAWLoggedIn) return [new ErrorClient('not logged in (as Administrator)', 401)]; 
  var {strLang='',Id=[]}=inObj;
  //if('Id' in inObj && inObj.Id instanceof Array && inObj.Id.length) var Id=inObj.Id; else { return [new ErrorClient('setStrLang: no files')]; }
  if(!(Id instanceof Array) || Id.length==0 || typeof Id[0]!='string') { return [new ErrorClient('no files')]; }
  if(strLang.length==0) { return [new ErrorClient('strLang not set / empty')]; }
  strLang=myJSEscape(strLang);

  var Arg=[{_id:{$in:Id}}, {$set:{strLang}}];
  var [err, result]=await collectionPage.updateMany(...Arg).toNBP(); if(err) return [err];

  this.mes(result.modifiedCount+' rows changed');   
  return [null, [Ou]];
}

ReqBE.prototype.collisionTestForSetSiteOfPage=async function(inObj){   
  var {req, res, GRet}=this, Ou={};
  if(!this.boAWLoggedIn) return [new ErrorClient('not logged in (as Administrator)', 401)]; 
  var {idSite,Id=[]}=inObj;
  if(!(Id instanceof Array) || Id.length==0 || typeof Id[0]!='string') { return [new ErrorClient('no files')]; }
  if(idSite==undefined) { return [new ErrorClient('idSite not set')]; }

  var Arg=[{_id:{$in:Id}, idSite}];
  var cursor=collectionPage.find(...Arg);
  var [err, items]=await cursor.toArray().toNBP();   if(err) return [err];
  Ou.tabCollision=arrObj2TabNStrCol(items);

  var len=items.length;
  if(len) this.mes(len+' collisions');   
  return [null, [Ou]];
}

ReqBE.prototype.setSiteOfPage=async function(inObj){   
  var {req, res, GRet}=this, Ou={};
  if(!this.boAWLoggedIn) return [new ErrorClient('not logged in (as Administrator)', 401)]; 
  var {idSite,Id=[]}=inObj;
  if(!(Id instanceof Array) || Id.length==0 || typeof Id[0]!='string') { return [new ErrorClient('no files')]; }
  if(idSite==undefined) { return [new ErrorClient('idSite not set')]; }

  var idPage= myJSEscape(Id[0]);
  
  //for(var i=0;i<Id.length;i++) Id[i]=ObjectId(Id[i]);

  const sessionMongo = mongoClient.startSession();
  sessionMongo.startTransaction({ readPreference:'primary', readConcern: {level:'local'}, writeConcern:{w:'majority'}   });

  var [err, result]=await changeSiteOne(sessionMongo, idPage, idSite);

  if(err) { var a=await sessionMongo.abortTransaction(); sessionMongo.endSession(); return [err]; }
  var a=await sessionMongo.commitTransaction(); sessionMongo.endSession();
  

  this.mes('Done');   
  return [null, [Ou]];
}


//////////////////////////////////////////////////////////////////////////////////////////////
// pageLoad
//////////////////////////////////////////////////////////////////////////////////////////////
  
ReqBE.prototype.pageLoad=async function(inObj) {
  var {req, res, GRet}=this, self=this;
  var pageNameIn=this.pageName;
  var Ou={}, {wwwSite}=req;
  var tNow=nowSFloored();

  // Private:
  //                                                                 index.html  first ajax (pageLoad)
  //Shall look the same (be cacheable (not include boARLoggedIn etc))     no           yes

  // Public:
  //                                                                 index.html  first ajax (getLoginBoolean)
  //Shall look the same (be cacheable (not include boARLoggedIn etc))     yes          no


  this.CSRFCode='';  // If Private then No CSRFCode since the page is going to be cacheable (look the same each time)
  //var version, rev; if(typeof inObj=='object' && 'version' in inObj) {  version=inObj.version;  rev=version-1; } else {  version=NaN; rev=-1; }
  var {version=NaN}=inObj, rev=isNaN(version)?-1:version-1;
  var strHashIn='', requesterCacheTime=new Date(0);
  if(req.method=='GET') {strHashIn=getETag(req.headers); requesterCacheTime=getRequesterTime(req.headers); }
  

  const sessionMongo = mongoClient.startSession();
  sessionMongo.startTransaction({ readPreference:'primary', readConcern: {level:'local'}, writeConcern:{w:'majority'}   });

  stuff:
  {
    var arrRet=[null];
      
      // Get site
    var [err, objSite]=await collectionSite.findOne({www:wwwSite}, {session:sessionMongo}).toNBP();   if(err) {arrRet=[err]; break stuff;}
    if(!objSite) {arrRet=[new Error(wwwSite+', site not found')]; break stuff;}
    var {_id:idSite}=objSite;


      // Check if page exist
    var idPage=(idSite+":"+pageNameIn).toLowerCase();
    // var Arg=[{_id:idPage}, {session:sessionMongo}];
    // var [err, objPage]=await collectionPage.findOne(...Arg).toNBP();   if(err) {arrRet=[err]; break stuff;}
    var objFilt={_id:idPage}, objUpd={ $set: { tLastAccess: tNow }, $inc: { nAccess: 1 } };
    var objOpt={ returnDocument:'after', returnOriginal:false, session:sessionMongo};
    var [err, result]=await collectionPage.findOneAndUpdate(objFilt, objUpd, objOpt).toNBP();   if(err) {arrRet=[err]; break stuff;}
    var objPage=result.value;

    if(objPage===null) { // No such page 
      
      res.setHeader("Cache-Control", "must-revalidate");  res.setHeader('Last-Modified',(new Date(0)).toUTCString());  res.setHeader('ETag','');
      res.out404("no such page");
      arrRet=[null]; break stuff;
    } 

    
      //
      // Page exist
      //

    var {_id:idPage, pageName, boOR, boOW, boSiteMap, tMod, arrRevision, strHashParse, strHash}=objPage;
    objPage.idPage=idPage; delete objPage._id;
    var lenRev=arrRevision.length, iLastRev=lenRev-1;


      // Bail if not public and not logged in
    if(!boOR && !self.boARLoggedIn) {  arrRet=[new ErrorClient('boARLoggedIn not set', 401)]; break stuff;}  


      // Calc boTalkExist
    var boTalk=isTalk(pageName),  boTemplate=isTemplate(pageName), boTalkExist=false;
    if(!boTalk){
      var strPre=boTemplate?'template_talk:':'talk:', talkPage=strPre+pageName, idTalk=(idSite+":"+talkPage).toLowerCase();
      var [err, objPageTalk]=await collectionPage.findOne({_id:idTalk}, {session:sessionMongo}).toNBP();   if(err) {arrRet=[err]; break stuff;}
      var boTalkExist=Boolean(objPageTalk);
    }


      // Get version table
    if(lenRev==0) {  arrRet=[Error('no versions?!?')]; break stuff;  }
    if(rev>=lenRev) {
      res.setHeaderMy({"Cache-Control":"must-revalidate", 'Last-Modified':(new Date(0)).toUTCString(), 'ETag':''});
      res.outCode(400, "no such version");
      arrRet=[null]; break stuff;
    }
    if(rev==-1) rev=iLastRev;    //version=rev+1;  // Use last rev
    var arrVersionCompared=[null,rev+1];

    var arrRevisionSlim=arrRevision.map(ele=>{return copySome({},ele, ['tMod','summary','signature']);});
    var matVersion=arrObj2TabNStrCol(arrRevisionSlim);

    var objRev=arrRevision[rev];
    var {idFileWiki, idFileHtml, tMod, tModCache, strHashParse:strHashParseR, strHash:strHashR} =objRev;
    if(strHashParse!==strHashParseR) strHashParse='obs';  if(strHash!==strHashR) strHash='obs';


      // Calc boValidReqCache => 304
    var boValidReqCache= tMod<=tModCache && strHashIn.length==32 && strHash==strHashIn && tModCache<=requesterCacheTime;
    if(boValidReqCache) { res.out304(); arrRet=[null]; break stuff; }


      //
      // Page must be regenerated
      //

      // Get wwwCommon
    var Arg=[{boDefault:true}, {projection:{_id:0, boTLS:1, siteName:"$_id", www:1}, session:sessionMongo}];
    var [err, objSiteDefault]=await collectionSite.findOne(...Arg).toNBP();   if(err) {arrRet=[err]; break stuff;}
    if(!objSiteDefault) {arrRet=[new Error('Default site not found')]; break stuff; }

      // Get strEditText
    var [err, objFile]=await collectionFileWiki.findOne({_id:idFileWiki}, {session:sessionMongo}).toNBP();   if(err) {arrRet=[err]; break stuff;}
    if(!objFile) {arrRet=[new Error("objFile==null")]; break stuff; };
    var {data:strEditText}=objFile;      

      // Entering some data into objOut
    var objOut={strReCaptchaSiteKey, uRecaptcha, CSRFCode:'',   boTalkExist, strEditText, arrVersionCompared, matVersion, objSiteDefault, objSite, objPage};

    var StrFieldCacheSkip=["arrRevision", "arrRevision", "strHash", "strHashParse", "tLastAccess", "tModCache", "nAccess"];
    var boLastRev=rev==iLastRev

    if(tMod<=tModCache && strHashParse.length==32) {  // Meta data (but not strHtmlText) has changed
      var [err, objFileHtml]=await collectionFileHtml.findOne({_id:idFileHtml}, {session:sessionMongo}).toNBP();   if(err) {arrRet=[err]; break stuff;}
      if(!objFileHtml) {arrRet=[new Error("objFileHtml==null")]; break stuff; }
      var {data:strHtmlText}=objFileHtml;

        // Remove some variables before calculating hash
      var objFieldTmp=copySome({}, objPage, StrFieldCacheSkip);   deleteFields(objPage, StrFieldCacheSkip);
      var strHashOld=strHash;
      strHash=md5(strHtmlText +JSON.stringify(objPage) +boTalkExist +JSON.stringify(matVersion));
      copySome(objPage, objFieldTmp, StrFieldCacheSkip); // copy back fields
    
      if(strHash!=strHashOld){
        tModCache=tNow;   extend(arrRevision[rev], {tModCache,strHash});
        var objPageSet={arrRevision};
        if(boLastRev){ extend(objPageSet,{tModCache, strHash}); }
        var Arg=[{_id:idPage}, [{ $set: objPageSet }], {session:sessionMongo}]
        var [err, result]=await collectionPage.updateOne(...Arg).toNBP();   if(err) {arrRet=[err]; break stuff;}
      }

    } else { // strHtmlText is obsolete

      var {IdChild:IdChildOld, StrImage:StrImageOld}=objPage;

        // parse
      var arg={strEditText, idSite, boOW};
      var [err, {strHtmlText, IdChildLax, IdChild, StrImageLC}]=await parse(sessionMongo, arg); if(err) {arrRet=[err]; break stuff;}
      strHashParse=md5(strHtmlText);
      
        // Remove some variables before calculating hash
      var objFieldTmp=copySome({}, objPage, StrFieldCacheSkip);   deleteFields(objPage, StrFieldCacheSkip);
      strHash=md5(strHtmlText +JSON.stringify(objPage) +boTalkExist +JSON.stringify(matVersion));
      copySome(objPage, objFieldTmp, StrFieldCacheSkip); // copy back fields
    

        // Write File files
      var Arg=[{_id:idFileHtml }, [{ $set: { data: strHtmlText } }], {session:sessionMongo}];
      var [err, result]=await collectionFileHtml.updateOne(...Arg).toNBP();   if(err) {arrRet=[err]; break stuff;}

      tModCache=tNow;
      extend(arrRevision[rev], {tModCache, strHashParse, strHash});
      if(boLastRev) extend(objPage, { tModCache, strHashParse, strHash });

        // Make changes to current page
      delete objPage.idPage;
      var Arg=[ {_id:idPage }, { $set: objPage }, {session:sessionMongo}];
      var [err, result]=await collectionPage.updateOne(...Arg).toNBP();   if(err) {arrRet=[err]; break stuff;}
      objPage.idPage=idPage;

      if(boTemplate){  // Make parents stale
        var Arg=[{_id:{$in:IdParent}}, [{ $set: {strHashParse:"stale", strHash:"stale", tModCache:new Date(0)} }], {session:sessionMongo}];
        var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   {arrRet=[err]; break stuff;}
      }

        // Make changes to children.
      var [err]=await modifyIdParent(sessionMongo, IdChildOld, StrImageOld, idPage, IdChild, StrImageLC, idPage);  if(err) {arrRet=[err]; break stuff;}

    }
    

    GRet.objPage=copySome({},objPage, ['boOR','boOW', 'boSiteMap', 'idPage', 'tCreated', 'tMod']);
    //GRet.objPage.tCreated=objPage.tCreated.toUnix();
    GRet.objRev=copySome({},objRev, ['tMod']);
    //GRet.objRev={tMod:objRev.tMod.toUnix()};
    
    extend(GRet, {strDiffText:'', arrVersionCompared:[null, rev+1], strHtmlText, strEditText, boTalkExist, matVersion});
    var tmp=objPage.boOR?'':', private';
    res.setHeaderMy({"Cache-Control":"must-revalidate"+tmp, 'Last-Modified':tModCache.toUTCString(), 'ETag':strHash});
    //res.setHeader("Cache-Control", "must-revalidate"+tmp);  res.setHeader('Last-Modified',tModCache.toUTCString());  res.setHeader('ETag',strHash);

    arrRet=[null];
  }

  var [errTransaction]=arrRet;
  if(errTransaction) { var a=await sessionMongo.abortTransaction(); sessionMongo.endSession(); return [errTransaction]; }
  var a=await sessionMongo.commitTransaction(); sessionMongo.endSession();
  
  return [null, [Ou]];
}



ReqBE.prototype.pageCompare=async function(inObj){ 
  var {req, res, GRet, pageName}=this, {wwwSite}=req;
  var Ou={};
  var versionOld=arr_min(inObj.arrVersionCompared),  version=arr_max(inObj.arrVersionCompared); 
  versionOld=Math.max(1,versionOld);  version=Math.max(1,version);
  if(version==versionOld) {return [new ErrorClient('Same version')]; }
  var strHashIn='', requesterCacheTime=0;
  var rev=versionOld-1;

    // Get site
  var [err, objSite]=await collectionSite.findOne({www:wwwSite}).toNBP();   if(err) return [err];
  if(!objSite) {return [new Error(wwwSite+', site not found')];};
  var {_id:idSite}=objSite, idPage=(idSite+":"+pageName).toLowerCase();

    // Get Page
  var [err, objPage]=await collectionPage.findOne({_id:idPage}).toNBP();   if(err) return [err];
  if(!objPage) {  return [new ErrorClient('Page does not exist', 404)]; } 
  var {boOR,boOW,arrRevision}=objPage;

  if(boOR===false && !this.boARLoggedIn){return [new ErrorClient('Not logged in', 401)]; }

  var idOld=arrRevision[versionOld-1].idFileWiki;
  var id=arrRevision[version-1].idFileWiki;

  var [err, objFileOld]=await collectionFileWiki.findOne({_id:idOld}).toNBP();   if(err) return [err];
  var [err, objFile]=await collectionFileWiki.findOne({_id:id}).toNBP();   if(err) return [err];

  var strEditTextOld=objFileOld.data;
  var strEditText=objFile.data;

    // parse 
  var arg={strEditText, idSite, boOW};
  const sessionMongo = mongoClient.startSession();
  sessionMongo.startTransaction({ readPreference:'primary', readConcern: {level:'local'}, writeConcern:{w:'majority'}   });

  var [err, {strHtmlText, IdChildLax, IdChild, StrImage, StrImageLC}]=await parse(sessionMongo, arg);

  if(err) { var a=await sessionMongo.abortTransaction(); sessionMongo.endSession();  return [err];  }
  var a=await sessionMongo.commitTransaction(); sessionMongo.endSession();

  var strDiffText='';
  if(versionOld!==null){
    strDiffText=myDiff(strEditTextOld,strEditText);
    if(strDiffText.length==0) strDiffText='(equal)';
    this.mes("v "+versionOld+" vs "+version);
  } else this.mes("v "+version);

  extend(GRet,{strDiffText, arrVersionCompared:[versionOld,version], strHtmlText, strEditText});
  return [null, [0]];
}


ReqBE.prototype.getPreview=async function(inObj){ 
  var {req, res, GRet}=this, Ou={}, {wwwSite}=req;
  var strEditText=inObj.strEditText;
  
  var boOW=1;
  var matVersion={};

    // Get site
  var [err, objSite]=await collectionSite.findOne({www:wwwSite}).toNBP();   if(err) return [err];
  if(!objSite) {return [new Error(wwwSite+', site not found')];};
  var {_id:idSite}=objSite;
  
    // parse
  var arg={strEditText, idSite, boOW};
  const sessionMongo = mongoClient.startSession();
  sessionMongo.startTransaction({ readPreference:'primary', readConcern: {level:'local'}, writeConcern:{w:'majority'}   });

  var [err, {strHtmlText, IdChildLax, IdChild, StrImage, StrImageLC}]=await parse(sessionMongo, arg);

  if(err) { var a=await sessionMongo.abortTransaction(); sessionMongo.endSession();  return [err];  }
  var a=await sessionMongo.commitTransaction(); sessionMongo.endSession();

  this.mes('Preview');
  extend(GRet,{strDiffText:'', strEditText, strHtmlText});
  
  return [null, [0]];
} 


ReqBE.prototype.saveByReplace=async function(inObj){ 
  var {req, res, GRet}=this, self=this, Ou={}, {wwwSite}=req;
  
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)', 401)]; } 

  const sessionMongo = mongoClient.startSession();
  sessionMongo.startTransaction({ readPreference:'primary', readConcern: {level:'local'}, writeConcern:{w:'majority'}   });

  stuff:
  {
  var arrRet=[null];
    
    var {pageName}=self;
    var {strEditText}=inObj;
    var size=strEditText.length, boNewPageExist=size>0;
    var boTalk=isTalk(pageName),  boTemplate=isTemplate(pageName);
    var tNow=nowSFloored();  //unixNow();
    
      // Get site
    var [err, objSite]=await collectionSite.findOne({www:wwwSite}, {session:sessionMongo}).toNBP();   if(err) {arrRet=[err]; break stuff;};
    if(!objSite) {arrRet=[new Error(wwwSite+', site not found')]; break stuff;};
    var {_id:idSite}=objSite, idPage=(idSite+":"+pageName).toLowerCase();

    if(!boTalk){
        // Find talkpage
      var strPre=boTemplate?'template_talk:':'talk:', talkPage=strPre+pageName, idTalk=(idSite+":"+talkPage).toLowerCase();
      var [err, objPageTalk]=await collectionPage.findOne({_id:idTalk.toLowerCase()}, {session:sessionMongo}).toNBP();   if(err) {arrRet=[err]; break stuff;};
      var boTalkExist=Boolean(objPageTalk);
    }


      // Find page
    var Arg=[{_id:idPage}, {session:sessionMongo}];
    var [err, objPage]=await collectionPage.findOne(...Arg).toNBP();   if(err) {arrRet=[err]; break stuff;};
    var boUpdate=Boolean(objPage), boInsert=!boUpdate;


      // If strEditText is empty then delete page and bail out.
    if(!boNewPageExist){
      self.mes('No content');
      if(objPage){
        var [err]=await deletePage(sessionMongo, objPage);   if(err) {arrRet=[err]; break stuff;};
        self.mes('Page deleted');
      }

      var matVersion=arrObj2TabNStrCol([]);
      var objPage={idPage:null, boOR:1, boOW:1, boSiteMap:1, tMod:0}, objRev={tMod:0}; 
      extend(GRet,{strDiffText:'', arrVersionCompared:[null,1], strHtmlText:"", strEditText:"", matVersion, objPage, objRev});
      arrRet=[null, [0]]; break stuff;
    }


      // Bail out if someone else has made an edit.
    if(boUpdate){
      var { boOR, boOW, tMod, IdParent, IdChild:IdChildOld, StrImage:StrImageOld}=objPage;
      if(!boOR && !self.boARLoggedIn) {arrRet=[new ErrorClient('Not logged in', 401)]; break stuff; }
      if(self.tModBrowser<tMod) {
        var tD=(tNow-tMod)/1000, strT=getSuitableTimeUnit(tD).join(' ');
        arrRet=[new ErrorClient("Someone else has made an edit ("+strT+" ago). Copy your edits temporary, then reload the page")]; break stuff;
      }
      var IdParentOld=IdParent;
    }
    
      // Make sure objPage exist
    if(boInsert){
      var objPage=copyObjWMongoTypes(app.InitCollection.Page.objDefault); 

        // Query to create IdParent and nParent
      var Arg=[{IdChildLax:idPage}, {projection:{_id:1}, session:sessionMongo}];
      var cursor=await collectionPage.find(...Arg);
      var [err, items]=await cursor.toArray().toNBP();   if(err) {arrRet=[err]; break stuff;};
      var IdParent=items.map(it=>{return it._id;}),    nParent=IdParent.length;

      var boOR=true, boOW=true, boSiteMap=true, tMod=tNow;
      var IdParentOld=[], IdChildOld=[], StrImageOld=[];
      extend(objPage,{_id:idPage, idSite, pageName, boTalk, boTemplate, lastRev:0, tCreated:tNow, boTalkExist, boOR, boOW, boSiteMap, tMod, IdParent, nParent});

    }

    var {_id:idPage, boOR, boOW, boSiteMap, tMod, arrRevision, IdParent}=objPage;
    
      
      // parse
    var arg={strEditText, idSite, boOW};
    var [err, {strHtmlText, IdChildLax, IdChild, StrImageLC}]=await parse(sessionMongo, arg); if(err) {arrRet=[err]; break stuff;};
    var strHashParse=md5(strHtmlText);

    var nChild=IdChild.length, nImage=StrImageLC.length; 
    var StrImageStub=[], StrPagePrivate=[];


      // Delete File data
    var lTmp=arrRevision.length, arrFile=Array(lTmp), arrFileHtml=Array(lTmp);
    for(var i=0;i<lTmp;i++){var {idFileWiki,idFileHtml}=arrRevision[i]; arrFile[i]=idFileWiki; arrFileHtml[i]=idFileHtml;}
    var Arg=[ {_id : {$in:arrFile}}, {session:sessionMongo}];
    var [err, result]=await collectionFileWiki.deleteMany(...Arg).toNBP();   if(err){arrRet=[err]; break stuff;}
    var Arg=[ {_id : {$in:arrFileHtml}}, {session:sessionMongo}];
    var [err, result]=await collectionFileHtml.deleteMany(...Arg).toNBP();   if(err){arrRet=[err]; break stuff;}

      // Write File data
    var Arg = [{idPage, data:strEditText }, {session:sessionMongo}];
    var [err, result]=await collectionFileWiki.insertOne(...Arg).toNBP();   if(err){arrRet=[err]; break stuff;}
    var idFileWiki=Arg[0]._id;
    var Arg = [{ data:strHtmlText }, {session:sessionMongo}];
    var [err, result]=await collectionFileHtml.insertOne(...Arg).toNBP();   if(err){arrRet=[err]; break stuff;}
    var idFileHtml=Arg[0]._id;


    var strHash='trashSaveByReplace', tModCache=tNow, tMod=tNow;
    var summary="", signature="", boOther=false, arrRevision=[];
    var objRevNew={ summary, signature, idFileWiki, idFileHtml, boOther, tMod, tModCache, strHashParse, strHash, size };
    arrRevision.push(objRevNew);
    var nRevision=arrRevision.length, lastRev=nRevision-1;


      // Make changes to current page
    extend(objPage, { boTalkExist, arrRevision, nRevision, lastRev, IdChild, IdChildLax, StrImage:StrImageLC, StrImageStub, nChild, nImage, idFileWiki, idFileHtml, boOther, tMod, tModCache, strHashParse, strHash, size});
      // Assign unassigned properties
    var Arg=[{_id:idPage}, {$set:objPage}, {upsert:true, new:true, session:sessionMongo}];
    var [err, result]=await collectionPage.updateOne(...Arg).toNBP();   if(err){arrRet=[err]; break stuff;}


      // Changes to parents
    // boTemplate               0                                 1
    // boInsert (or boDelete)
    // 0                                                          strHash etc
    // 1                        strHash etc + IdChild etc         strHash etc + IdChild etc
    var objUpdate={};
    if(boInsert) extend(objUpdate, { $addToSet: {IdChild:idPage}, $inc:{nChild:1} });
    if(boInsert || boTemplate) {
      extend(objUpdate, { $set: { strHashParse:"staleParent", strHash:"staleParent", tModCache:new Date(0)} });
      var Arg=[{_id:{$in:IdParent}}, objUpdate, {session:sessionMongo}];
      var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err){arrRet=[err]; break stuff;}
      //var Arg=[{IdChild:pageName}, objUpdate, {session:sessionMongo}];
      //var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err){arrRet=[err]; break stuff;}
    }

      // Make changes to children.
    var [err]=await modifyIdParent(sessionMongo, IdChildOld, StrImageOld, idPage, IdChild, StrImageLC, idPage);   if(err){arrRet=[err]; break stuff;}

      // Set tModLast and pageTModLast
    var arg=[
      { updateOne: { "filter": { name:"tModLast" }, "update": { $set : {value:tNow} },  "upsert": true } },
      { updateOne: { "filter": { name:"pageTModLast" }, "update": { $set : {value:pageName} },  "upsert": true } }
    ];
    var [err, result]=await collectionSetting.bulkWrite(arg, {session:sessionMongo}).toNBP(); if(err){arrRet=[err]; break stuff;}

    var arrRevisionSlim=arrRevision.map(ele=>{ return copySome({},ele, ['tMod','summary','signature']); });
    var matVersion=arrObj2TabNStrCol(arrRevisionSlim);

    extend(GRet,{strHtmlText, strEditText, strDiffText:'', arrVersionCompared:[null,matVersion.tab.length], matVersion, objPage, objRev:objRevNew});

    arrRet=[null];
  }

  var [errTransaction]=arrRet;
  if(errTransaction) { var a=await sessionMongo.abortTransaction(); sessionMongo.endSession(); return [errTransaction]; }
  var a=await sessionMongo.commitTransaction(); sessionMongo.endSession();

  this.mes("Page overwritten");

  
  return [null, [0]];
}


ReqBE.prototype.saveByAdd=async function(inObj){ 
  var {req, res, GRet}=this, self=this, Ou={};

    // Check reCaptcha with google
  var strCaptchaIn=inObj['g-recaptcha-response'];
  var uGogCheck = "https://www.google.com/recaptcha/api/siteverify"; 
  var objForm={  secret:strReCaptchaSecretKey, response:strCaptchaIn, remoteip:req.connection.remoteAddress  };

  // var p=new Promise(resolve=>{
  //   var reqStream=requestMod.post({url:uGogCheck, form:objForm}, function(errT, responseT, bodyT) { resolve([errT, responseT, bodyT]);   });
  // })
  // var [err, response, body]=await p;
  // var buf=body;
  // try{ var data = JSON.parse(buf.toString()); }catch(e){ debugger; return [e]; }

  
  const params = new URLSearchParams(objForm);
  var [err,response]=await fetch(uGogCheck, {method:'POST', body:params}).toNBP(); if(err) return [err];
  var [err, data]=await response.json().toNBP(); if(err) return [err];
  //console.log('Data: ', data);
  if(!data.success) return [new ErrorClient('reCaptcha test not successfull')];
  

  const sessionMongo = mongoClient.startSession();
  sessionMongo.startTransaction({ readPreference:'primary', readConcern: {level:'local'}, writeConcern:{w:'majority'}   });

  stuff:
  {
    var arrRet=[null];
    var {wwwSite}=req, {pageName}=self;
    var {strEditText, summary, signature}=inObj;   summary=myJSEscape(summary); signature=myJSEscape(signature);
    var size=strEditText.length;
    var boTalk=isTalk(pageName),  boTemplate=isTemplate(pageName);
    var tNow=nowSFloored(); //unixNow();

      // Get site
    var [err, objSite]=await collectionSite.findOne({www:wwwSite}, {session:sessionMongo}).toNBP();   if(err){arrRet=[err]; break stuff;}
    if(!objSite) {arrRet=[new Error(wwwSite+', site not found')]; break stuff;};
    var {_id:idSite}=objSite, siteName=idSite, idPage=(idSite+":"+pageName).toLowerCase();

    if(!boTalk){
        // Find talkpage
      var strPre=boTemplate?'template_talk:':'talk:', talkPage=strPre+pageName, idTalk=(idSite+":"+talkPage).toLowerCase();
      var [err, objPageTalk]=await collectionPage.findOne({_id:idTalk.toLowerCase()}, {session:sessionMongo}).toNBP();   if(err){arrRet=[err]; break stuff;}
      var boTalkExist=Boolean(objPageTalk);
    }


      // Find page
    var Arg=[{_id:idPage}, {session:sessionMongo}];
    var [err, objPage]=await collectionPage.findOne(...Arg).toNBP();   if(err){arrRet=[err]; break stuff;}
    var boUpdate=Boolean(objPage), boInsert=!boUpdate;


      // Bail out if someone else has made an edit.
    if(boUpdate){
      var { boOR, boOW, tMod, IdParent, IdChild:IdChildOld, StrImage:StrImageOld}=objPage;
      if(!boOR && !self.boARLoggedIn) {arrRet=[new ErrorClient('Not logged in', 401)]; break stuff; }
      if(self.tModBrowser<tMod) {
        var tD=(tNow-tMod)/1000, strT=getSuitableTimeUnit(tD).join(' ');
        arrRet=[new ErrorClient("Someone else has made an edit ("+strT+" ago). Copy your edits temporary, then reload the page")]; break stuff;
      }
      if(boOW==0) {arrRet=[new ErrorClient('not logged in (as Administrator)', 401)]; break stuff; }  
      var IdParentOld=IdParent;
    }

      // Make sure objPage exist
    if(boInsert){
      var objPage=copyObjWMongoTypes(app.InitCollection.Page.objDefault); 

        // Query to create IdParent and nParent
      var Arg=[{IdChildLax:idPage}, {projection:{_id:1}, session:sessionMongo}];
      var cursor=collectionPage.find(...Arg);
      var [err, items]=await cursor.toArray().toNBP();   if(err){arrRet=[err]; break stuff;}
      var IdParent=items.map(it=>{return it._id;}),    nParent=IdParent.length;

      var boOR=true, boOW=true, boSiteMap=true, tMod=tNow;
      var IdParentOld=[], IdChildOld=[], StrImageOld=[];
      extend(objPage,{_id:idPage, idSite, pageName, boTalk, boTemplate, lastRev:0, tCreated:tNow, boTalkExist, boOR, boOW, boSiteMap, tMod, IdParent, nParent});

    }

    var {_id:idPage, boOR, boOW, boSiteMap, tMod, arrRevision, IdParent}=objPage;
    
      
      // parse
    var arg={strEditText, idSite, boOW};
    var [err, {strHtmlText, IdChildLax, IdChild, StrImage, StrImageLC}]=await parse(sessionMongo, arg); if(err){arrRet=[err]; break stuff;}
    var strHashParse=md5(strHtmlText);

    var nChild=IdChild.length, nImage=StrImageLC.length; 
    var StrImageStub=[], StrPagePrivate=[];


      // Write File files
    var Arg = [{idPage, data:strEditText }, {session:sessionMongo}];
    var [err, result]=await collectionFileWiki.insertOne(...Arg).toNBP();   if(err){arrRet=[err]; break stuff;}
    var idFileWiki=Arg[0]._id;
    var Arg = [{ data:strHtmlText }, {session:sessionMongo}];
    var [err, result]=await collectionFileHtml.insertOne(...Arg).toNBP();   if(err){arrRet=[err]; break stuff;}
    var idFileHtml=Arg[0]._id;
    

    var strHash='trashSaveByAdd', tModCache=tNow, tMod=tNow;
    var boOther=true;
    var objRevNew={ summary, signature, idFileWiki, idFileHtml, boOther, tMod, tModCache, strHashParse, strHash, size };
    arrRevision.push(objRevNew);
    var nRevision=arrRevision.length, lastRev=nRevision-1;


      // Make changes to current page
    extend(objPage, { boTalkExist, arrRevision, nRevision, lastRev, IdChild, IdChildLax, StrImage:StrImageLC, StrImageStub, nChild, nImage, idFileWiki, idFileHtml, boOther, tMod, tModCache, strHashParse, strHash, size});
      // Assign unassigned properties
    var Arg=[{_id:idPage}, {$set:objPage}, {upsert:true, new:true, session:sessionMongo}];
    var [err, result]=await collectionPage.updateOne(...Arg).toNBP();   if(err){arrRet=[err]; break stuff;}


      // Changes to parents
    // boTemplate               0                                 1
    // boInsert (or boDelete)
    // 0                                                          strHash etc
    // 1                        strHash etc + IdChild etc         strHash etc + IdChild etc
    var objUpdate={};
    if(boInsert) extend(objUpdate, { $addToSet: {IdChild:idPage}, $inc:{nChild:1} });
    if(boInsert || boTemplate) {
      extend(objUpdate, { $set: { strHashParse:"staleParent", strHash:"staleParent", tModCache:new Date(0)} });
      var Arg=[{_id:{$in:IdParent}}, objUpdate, {session:sessionMongo}];
      var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err){arrRet=[err]; break stuff;}
      //var Arg=[{IdChild:pageName}, objUpdate, {session:sessionMongo}];
      //var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err){arrRet=[err]; break stuff;}
    }

      // Make changes to children.
    var [err]=await modifyIdParent(sessionMongo, IdChildOld, StrImageOld, idPage, IdChild, StrImageLC, idPage);   if(err){arrRet=[err]; break stuff;}

      // Set tModLast and pageTModLast
    var arg=[
      { updateOne: { "filter": { name:"tModLast" }, "update": { $set : {value:tNow} },  "upsert": true } },
      { updateOne: { "filter": { name:"pageTModLast" }, "update": { $set : {value:pageName} },  "upsert": true } }
    ];
    var [err, result]=await collectionSetting.bulkWrite(arg, {session:sessionMongo}).toNBP(); if(err){arrRet=[err]; break stuff;}

    var arrRevisionSlim=arrRevision.map(ele=>{ return copySome({},ele, ['tMod','summary','signature']); });
    var matVersion=arrObj2TabNStrCol(arrRevisionSlim);

    extend(GRet,{strHtmlText, strEditText, strDiffText:'', arrVersionCompared:[null,matVersion.tab.length], matVersion, objPage, objRev:objRevNew});

    if(objOthersActivity) { objOthersActivity.nEdit++; objOthersActivity.pageName=siteName+':'+pageName; }

    arrRet=[null];
  }

  var [errTransaction]=arrRet;
  if(errTransaction) { var a=await sessionMongo.abortTransaction(); sessionMongo.endSession(); return [errTransaction]; }
  var a=await sessionMongo.commitTransaction(); sessionMongo.endSession();

  this.mes("New version added");

  return [null, [0]];
}




ReqBE.prototype.renamePage=async function(inObj){ 
  var {req, res, GRet}=this, Ou={};
  if(!this.boAWLoggedIn) { return [new ErrorClient('not logged in (as Administrator)', 401)]; }

  const sessionMongo = mongoClient.startSession();
  sessionMongo.startTransaction({ readPreference:'primary', readConcern: {level:'local'}, writeConcern:{w:'majority'}   });

  
  stuff:
  {
    var arrRet=[null];

    var {id:idPageOld, strNewName}=inObj;
    if(typeof idPageOld!="string") { arrRet=[new ErrorClient('typeof id!="string"', 400)]; break stuff; }
    var pageNameNew=strNewName.replace(RegExp(' ','g'),'_'), pageNameNewLC=pageNameNew.toLowerCase();      // Calculate new name

    var {siteName, pageName:pageNameOldLC}=parsePageNameHD(idPageOld);
    var idSite=siteName, idPageNew=idSite+":"+pageNameNewLC;

      // Check for collision
    var [err, n]=await collectionPage.countDocuments({_id:idPageNew}, {session:sessionMongo}).toNBP();   if(err){arrRet=[err]; break stuff;}
    if(n) {arrRet=[new ErrorClient('nameExist')];  break stuff;}

      // Get stuff from the page: IdParent, IdChild, StrImage
    var [err, objPage]=await collectionPage.findOne({_id:idPageOld}, {session:sessionMongo}).toNBP();   if(err){arrRet=[err]; break stuff;}
    var { pageName, IdParent:IdParentOld, IdChild, IdChildLax, StrImage}=objPage;
    //var pageNameOldLC=pageName.toLowerCase();


      // Parents whose wikiText should be changed:
      // Get parent wikiTexts
    var Arg=[ {idPage: {$in:IdParentOld}}, {session:sessionMongo}];
    var cursor=collectionFileWiki.find(...Arg);
    var [err, FileWiki]=await cursor.toArray().toNBP();   if(err){arrRet=[err]; break stuff;}

      // Rename links in parent wikiTexts
    var nWiki=FileWiki.length;
    for(var i=0;i<nWiki;i++){
      var strEditText=FileWiki[i].data.toString();
      var mPa=new Parser(), strEditText=mPa.renameILinkOrImage(strEditText, pageNameOldLC, strNewName);
      FileWiki[i].data=strEditText;
    }

      // Write parent wikiTexts
    var arg=Array(nWiki);
    for(var i=0;i<nWiki;i++){
      var obj=FileWiki[i], {idPage}=obj;
      var objTmp={ updateOne: { "filter": { idPage }, "update": { $set : obj } } };    arg[i]=objTmp;
    }
    if(nWiki){
      var [err, result]=await collectionFileWiki.bulkWrite(arg, {session:sessionMongo}).toNBP(); if(err){arrRet=[err]; break stuff;}
    }


      // Get existing parents (those who already points to the new name)
    var cursor=collectionPage.find({IdChildLax:idPageNew}, {session:sessionMongo});
    var [err, items]=await cursor.toArray().toNBP();   if(err){arrRet=[err]; break stuff;}
    var len=items.length, IdParentWStubs=Array(len); for(var i=0;i<len;i++) {IdParentWStubs[i]=items[i]._id;}

      // Merge IdParentWStubs and IdParentOld
    var IdParentNew=AUnionB(IdParentWStubs,IdParentOld);

      // Make changes to parents
    var [err]=await modifyIdChild(sessionMongo, IdParentOld, idPageOld, IdParentNew, idPageNew);   if(err){arrRet=[err]; break stuff;}
    var [err]=await modifyIdChildLax(sessionMongo, IdParentOld, idPageOld, idPageNew);   if(err){arrRet=[err]; break stuff;}


      // Change children
    //var [err]=await modifyIdParent(sessionMongo, IdChild, StrImage, idPageOld, IdChild, StrImage, idPageNew);   if(err){arrRet=[err]; break stuff;}
    if(IdChild.length){  
      var Arg=[ {_id: {$in:IdChild}}, { $pull: { IdParent: idPageOld } }, {session:sessionMongo}];   
      var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err){arrRet=[err]; break stuff;}
      var Arg=[ {_id: {$in:IdChild}}, { $addToSet: { IdParent: idPageNew } }, {session:sessionMongo}]; 
      var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err){arrRet=[err]; break stuff;}
    }

      // Change images
    if(StrImage.length){
      var objCollation={ locale: "en", strength: 2 };
      var Arg=[ {imageName: {$in:StrImage}}, { $pull: { IdParent: idPageOld } }, {collation:objCollation, session:sessionMongo}];   
      var [err, result]=await collectionImage.updateMany(...Arg).toNBP();   if(err){arrRet=[err]; break stuff;}
      var Arg=[ {imageName: {$in:StrImage}}, { $addToSet: { IdParent: idPageNew } }, {collation:objCollation, session:sessionMongo}]; 
      var [err, result]=await collectionImage.updateMany(...Arg).toNBP();   if(err){arrRet=[err]; break stuff;}
    }

      // Update page
    extend(objPage, {_id:idPageNew, pageName:pageNameNew, IdParent:IdParentNew, nParent:IdParentNew.length});
    var [err, result]=await collectionPage.insertOne(objPage, {session:sessionMongo}).toNBP();   if(err){arrRet=[err]; break stuff;}    // Write new Page
    var [err, result]=await collectionPage.deleteOne({_id:idPageOld}, {session:sessionMongo}).toNBP();   if(err){arrRet=[err]; break stuff;}    // Delete old Page

      // Change idPage in FileWiki
    var Arg=[{idPage:idPageOld}, {$set:{idPage:idPageNew}}, {session:sessionMongo}];
    var [err, result]=await collectionFileWiki.updateMany(...Arg).toNBP();   if(err){arrRet=[err]; break stuff;}

    arrRet=[null];
  }

  var [errTransaction]=arrRet;
  if(errTransaction) { var a=await sessionMongo.abortTransaction(); sessionMongo.endSession(); return [errTransaction]; }
  var a=await sessionMongo.commitTransaction(); sessionMongo.endSession();
  
  return [null];
}
  
ReqBE.prototype.renameImage=async function(inObj){
  var {req, res, GRet}=this, Ou={};
  if(!this.boAWLoggedIn) { return [new ErrorClient('not logged in (as Administrator)', 401)]; }
  
  const sessionMongo = mongoClient.startSession();
  sessionMongo.startTransaction({ readPreference:'primary', readConcern: {level:'local'}, writeConcern:{w:'majority'}   });

  stuff:
  {
    var arrRet=[null];

    var {id:idImageOld, strNewName}=inObj;
    idImageOld=ObjectId(idImageOld);
    var imageNameNew=strNewName.replace(RegExp(' ','g'),'_'), imageNameNewLC=imageNameNew.toLowerCase();      // Calculate new name

      // Check for collision
    var objCollation={ locale: "en", strength: 2 };
    var Arg=[{imageName:imageNameNewLC}, {collation:objCollation, session:sessionMongo}];
    var [err, n]=await collectionImage.countDocuments(...Arg).toNBP();   if(err){arrRet=[err]; break stuff;}
    if(n) {arrRet=[new ErrorClient('nameExist')]; break stuff; }

      // Get stuff from the image: IdParent
    var [err, objImage]=await collectionImage.findOne({_id:idImageOld}, {session:sessionMongo}).toNBP();   if(err){arrRet=[err]; break stuff;}
    var { imageName:imageNameOld, IdParent:IdParentOld}=objImage;
    var imageNameOldLC=imageNameOld.toLowerCase();


      // Parents whose wikiText should be changed:
      // Get parent wikiTexts
    var Arg=[ {idPage: {$in:IdParentOld}}, {session:sessionMongo}];
    var cursor=collectionFileWiki.find(...Arg);
    var [err, FileWiki]=await cursor.toArray().toNBP();   if(err){arrRet=[err]; break stuff;}

      // Rename links in parent wikiTexts
    var nWiki=FileWiki.length;
    for(var i=0;i<nWiki;i++){
      var strEditText=FileWiki[i].data.toString();
      var mPa=new Parser(), strEditText=mPa.renameILinkOrImage(strEditText, '', '', imageNameOldLC, strNewName);
      FileWiki[i].data=strEditText;
    }

      // Write parent wikiTexts
    var arg=Array(nWiki);
    for(var i=0;i<nWiki;i++){
      var obj=FileWiki[i], {idPage}=obj;
      var objTmp={ updateOne: { "filter": { idPage }, "update": { $set : obj } } };    arg[i]=objTmp;
    }
    if(nWiki){
      var [err, result]=await collectionFileWiki.bulkWrite(arg, {session:sessionMongo}).toNBP(); if(err){arrRet=[err]; break stuff;}
    }
    

      // Get existing parents (already points to the new name)
    var cursor=collectionPage.find({StrImage:imageNameNewLC}, {session:sessionMongo});
    var [err, items]=await cursor.toArray().toNBP();   if(err){arrRet=[err]; break stuff;}
    var len=items.length, IdParentWStubs=Array(len); for(var i=0;i<len;i++) {IdParentWStubs[i]=items[i]._id;}

      // Merge IdParentWStubs and IdParentOld
    var IdParentNew=AUnionB(IdParentWStubs,IdParentOld);

      // Make changes to parents
    var [err]=await modifyStrImage(sessionMongo, IdParentOld, imageNameOldLC, IdParentNew, imageNameNewLC);   if(err){arrRet=[err]; break stuff;}
    

      // Update image
    extend(objImage, {_id: idImageOld, imageName:imageNameNew, IdParent:IdParentNew, nParent:IdParentNew.length });
    var [err, result]=await collectionImage.deleteOne({_id:idImageOld}, {session:sessionMongo}).toNBP();   if(err){arrRet=[err]; break stuff;}    // Delete old Image
    var [err, result]=await collectionImage.insertOne(objImage, {session:sessionMongo}).toNBP();   if(err){arrRet=[err]; break stuff;}    // Write new Image

    arrRet=[null];

  }

  var [errTransaction]=arrRet;
  if(errTransaction) { var a=await sessionMongo.abortTransaction(); sessionMongo.endSession(); return [errTransaction]; }
  var a=await sessionMongo.commitTransaction(); sessionMongo.endSession();
}


ReqBE.prototype.getLoginBoolean=async function(inObj){ 
  var {req, res, GRet}=this, Ou={};
  copySome(GRet, this, ['boARLoggedIn', 'boAWLoggedIn']);

  return [null, [Ou]];  
}
ReqBE.prototype.getAWRestrictedStuff=async function(inObj){ 
  var {req, res, GRet}=this, Ou={};
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)', 401)]; }

  var Arg=[ {name:{$in:['tModLast', 'pageTModLast', 'tLastBU']}}];
  var cursor=collectionSetting.find(...Arg);
  var [err, results]=await cursor.toArray().toNBP();

  GRet.objSetting=convertKeyValueToObj(results); 
  
  return [null, [Ou]];  
}

ReqBE.prototype.setUpPageListCond=async function(inObj){
  var Ou={};
  if(typeof inObj.Filt!='object') return [new ErrorClient('typeof inObj.Filt!="object"')]; 
  this.Filt=inObj.Filt;
  var arg={Prop:PropPage, Filt:inObj.Filt};  //
  var [err,tmp]=setUpCond(arg); if(err) return [err];
  copySome(this,tmp,['Where']); //'strCol', 
  return [null, [Ou]];
}
 
ReqBE.prototype.getParent=async function(inObj){ 
  var {req, res}=this;
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)', 401)]; }
  var Ou={}, {idPage}=inObj;

  if(idPage===null) {  Ou=arrObj2TabNStrCol([]);  return [null, [Ou]]; }
  
    // Get Page
  var [err, objPage]=await collectionPage.findOne({_id:idPage}).toNBP();   if(err) return [err];
  if(!objPage) { return [new Error('page not found')];};

    // Get site
  var [err, objSite]=await collectionSite.findOne({_id:objPage.idSite}).toNBP();   if(err) return [err];
  if(!objSite) {return [new Error('site not found')];};
  var {_id:idSite}=objSite; objSite.siteName=idSite;

    // Get Parent Pages
  var cursor=collectionPage.find({IdChild:objPage._id});
  var [err, results]=await cursor.toArray().toNBP();   if(err) return [err];

  results.forEach(el=>{copySome(el, objSite,["boTLS", "siteName", "www"]); el.idPage=el._id;});
  
  Ou=arrObj2TabNStrCol(results);
  return [null, [Ou]];
}

ReqBE.prototype.getParentOfImage=async function(inObj){ 
  var {req, res}=this;
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)', 401)]; }
  var Ou={};

  if(inObj.idImage===null) {  Ou=arrObj2TabNStrCol([]);  return [null, [Ou]]; }

    // Get info such as boTLS, www
    // Get all siteNames
  var Arg=[{}];
  var cursor=collectionSite.find(...Arg);
  var [err, Site]=await cursor.toArray().toNBP();   if(err) return [err];
  if(Site===null) return [new Error('No sites found')];

    // Create SiteByStrName
  var SiteByStrName={};  for(var site of Site){ var {_id}=site;  SiteByStrName[_id]=site; }


    // Get Image
  var [err, objImage]=await collectionImage.findOne({_id:ObjectId(inObj.idImage)}).toNBP();   if(err) return [err];
  if(!objImage) { return [new Error('image not found')];};


    // Get Parent Pages
  var cursor=collectionPage.find({ StrImage:objImage.imageName.toLowerCase()});
  var [err, results]=await cursor.toArray().toNBP();   if(err) return [err];


  results.forEach(el=>{
    var objSite=SiteByStrName[el.idSite];
    copySome(el, objSite,["boTLS","www"]);
    el.siteName=el.idSite;
    el.idPage=el._id; delete el._id;  //.toString()
  });

  Ou=arrObj2TabNStrCol(results);
  return [null, [Ou]];
}

ReqBE.prototype.getPageInfoById=async function(inObj){ 
  var {req, res}=this;
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)', 401)]; }
  var Ou={}, {idPage}=inObj; 
  if(idPage===null){
    var [err, nChild]=await collectionPage.countDocuments({nParent:0}).toNBP();   if(err) return [err];
    var [err, nImage]=await collectionImage.countDocuments({nParent:0}).toNBP();   if(err) return [err];
    var Ou={nChild,nImage};
  } else {
    var [err, objPage]=await collectionPage.findOne({_id:idPage}).toNBP();   if(err) return [err];
      // Get site
    var [err, objSite]=await collectionSite.findOne({_id:objPage.idSite}).toNBP();   if(err) return [err];
    if(!objSite) {return [new Error('site not found')];};
    copySome(objPage, objSite, ['boTLS', 'www']); objPage.siteName=objPage.idSite; objPage.idPage=objPage._id;
    var [err, nSame]=await collectionPage.countDocuments({pageName:objPage.pageName}).toNBP();   if(err) return [err]; // nSame is >1 if multiple sites have the same pageName
    var Ou=objPage; Ou.nSame=nSame;
  }  

  return [null, [Ou]];
}

ReqBE.prototype.getImageInfoById=async function(inObj){ 
  var {req, res}=this;
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)', 401)]; }
  var Ou={};
  if(inObj.idImage===null){
    var [err, nChild]=await collectionPage.countDocuments({nParent:0}).toNBP();   if(err) return [err];
    var [err, nImage]=await collectionImage.countDocuments({nParent:0}).toNBP();   if(err) return [err];
    var Ou={nChild,nImage};
  } else {
    var [err, objImage]=await collectionImage.findOne({_id:ObjectId(inObj.idImage)}).toNBP();   if(err) return [err];
    objImage.idImage=objImage._id;
    var Ou=objImage;
    //debugger; // Todo: remember to deal with time-properties as Date() in client.js
  } 

  return [null, [Ou]];
}




    // nAccess, tCreated, tLastAccess;

ReqBE.prototype.getPageList=async function(inObj) { 
  var {req, res}=this;
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)', 401)]; }

    // Get sites
  var Arg=[{}, {projection:{ boTLS:1, www:1, siteName:"$_id"}}];
  var cursor=collectionSite.find(...Arg);
  var [err, Site]=await cursor.toArray().toNBP();   if(err) return [err];
  if(Site===null) return [new Error('No sites found')];

    // Create SiteById
  var SiteById={};  for(var site of Site){  SiteById[site._id]=site; }


    // Get Pages
  var WhereFiltered=this.Where.filter(it=>it);
  var objFilt=WhereFiltered.length?{$and:WhereFiltered}:{};
  var cursor=collectionPage.find(objFilt);
  var [err, Page]=await cursor.toArray().toNBP();   if(err) return [err];


  var [err, nUnFiltered]=await collectionPage.countDocuments({}).toNBP();   if(err) return [err];

    // Add some properties representing the first parent.
    // ... and some properties from site.
  for(var i=0;i<Page.length;i++){ 
    var page=Page[i], site=SiteById[page.idSite]; copySome(page, site, [ "www", "boTLS"]);  // Add sitedata to Pages //"siteName",
    page.siteName=page.idSite, page.idPage=page._id;
    if(page.IdParent.length){
      var idParent=page.IdParent[0];
      //var parent=PageByName[idParent]; 
      page.parent=idParent; page.idParent=idParent; 
    }else {page.parent=null; page.idParent=null;}
  }

  var Ou=arrObj2TabNStrCol(Page);
  Ou.NFilt=[Page.length, nUnFiltered];  //PageAll.length

  return [null, [Ou]];
}



ReqBE.prototype.getPageHist=async function(inObj){ 
  var {req, res}=this;
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)', 401)]; }
  var Ou={};
  var arg={ WhereExtra:[], Prop:PropPage, collection:collectionPage};  
  copySome(arg, this, ['Filt', 'Where']);
  var histCalc=new HistCalc(arg);   var [err, Hist]=await histCalc.getHist(); if(err) return [err];  Ou.Hist=Hist;


    // Fetching the names of (non-null) parents
  var histParent=Ou.Hist[StrOrderFiltPageFlip.parent];

  var len=histParent.length, ParentName=[]; 
  for(var i=0;i<len;i++) {
    var binT=histParent[i], boReal=(binT instanceof Array) && binT[0] && (typeof binT[0]==='object');  // boReal: Used to skip boTrunc-value-, trunc- and orphan- bins
    if(boReal) {
      var {_id, pageName, idSite}=binT[0];
      binT[0]=_id;
      ParentName.push({idPage:_id, idSite, pageName});
    }
  }
  Ou.ParentName=arrObj2TabNStrCol(ParentName);
  
  return [null, [Ou]];
}


ReqBE.prototype.setUpImageListCond=async function(inObj){
  var Ou={};
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)', 401)]; }
  if(typeof inObj.Filt!='object') return [new ErrorClient('typeof inObj.Filt!="object"')];
  this.Filt=inObj.Filt;
  var arg={Prop:PropImage, Filt:inObj.Filt};
  var [err,tmp]=setUpCond(arg); if(err) return [err];
  copySome(this,tmp,['Where']); //'strCol', 
  return [null, [Ou]];
}

ReqBE.prototype.getImageList=async function(inObj) { 
  var {req, res}=this;
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)', 401)]; }

    // Get sites
  var Arg=[{}, {projection:{ boTLS:1, www:1, siteName:"$_id"}}];
  var cursor=collectionSite.find(...Arg);
  var [err, Site]=await cursor.toArray().toNBP();   if(err) return [err];
  if(Site===null) return [new Error('No sites found')];

    // Create SiteById
  var SiteById={};  for(var site of Site){  SiteById[site._id]=site; }


    // Get Images
  var WhereFiltered=this.Where.filter(it=>it);
  var objFilt=WhereFiltered.length?{$and:WhereFiltered}:{};
  var cursor=collectionImage.find(objFilt);
  var [err, Image]=await cursor.toArray().toNBP();   if(err) return [err];

    // nUnFiltered
  var [err, nUnFiltered]=await collectionImage.countDocuments({}).toNBP();   if(err) return [err];

    // Add some properties representing the first parent.
  for(var i=0;i<Image.length;i++){ 
    var image=Image[i]; image.idImage=image._id;
    if(image.IdParent.length){
      var idParent=image.IdParent[0];
      //var parent=PageByName[idParent];
      image.parent=idParent; image.idParent=idParent; 
    }else {image.parent=null; image.idParent=null;}
  }

  var Ou=arrObj2TabNStrCol(Image);
  Ou.NFilt=[Image.length, nUnFiltered];

  return [null, [Ou]];
}

ReqBE.prototype.getImageHist=async function(inObj){ 
  var {req, res}=this;
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)', 401)]; }
  var Ou={};

  var arg={Ou, WhereExtra:[], Prop:PropImage, collection:collectionImage};
  copySome(arg, this, [ 'Filt', 'Where']);
  var histCalc=new HistCalc(arg);   var [err, Hist]=await histCalc.getHist(); if(err) return [err];  Ou.Hist=Hist;


    // Get all siteNames
  var Arg=[{}]; //, {projection:{ siteName:"$_id"}}
  var cursor=collectionSite.find(...Arg);
  var [err, Site]=await cursor.toArray().toNBP();   if(err) return [err];
  if(Site===null) return [new Error('No sites found')];

    // Create SiteById
  var SiteById={};  for(var site of Site){  var {_id}=site; SiteById[_id]=site; site.siteName=_id; site.idSite=_id; }

  Ou.SiteName=arrObj2TabNStrCol(Site);


    // Fetching the names of (non-null) parents
  var histParent=Ou.Hist[StrOrderFiltImageFlip.parent];

  var len=histParent.length, ParentName=[]; 
  for(var i=0;i<len;i++) {
    var binT=histParent[i], boReal=(binT instanceof Array) && binT[0] && (typeof binT[0]==='object');  // boReal: Used to skip boTrunc-value-, trunc- and orphan- bins
    if(boReal) {
      var {_id, pageName, idSite}=binT[0];
      binT[0]=_id;
      var {_id:siteName}=SiteById[idSite];
      ParentName.push({idPage:_id, siteName, pageName});
    }
  }
  Ou.ParentName=arrObj2TabNStrCol(ParentName);

  return [null, [Ou]];
}

ReqBE.prototype.getPageInfo=async function(inObj){  // Used by uploadAdminDiv, by sendConflictCheck 
  var {req, res, GRet}=this;
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)', 401)]; }
  var Ou={};

  var {IdPage}=inObj;
  if(!(IdPage instanceof Array)) return [new Error("!(IdPage instanceof Array)")];
  //if(IdPage.length==0) return [new Error("IdPage is empty")];
  if(IdPage.length==0) {Ou.FileInfo=[]; return [null, [Ou]];}
  var objFilter={$or:IdPage};
  
    // Get All Pages
  var Arg=[objFilter];
  var cursor=collectionPage.find(...Arg);
  var [err, results]=await cursor.toArray().toNBP();   if(err) return [err];
  //for(var i=0;i<results.length;i++){ var result=results[i]}

  Ou.FileInfo=results;
  return [null, [Ou]];
}


ReqBE.prototype.getImageInfo=async function(inObj){  // Used by diffBackUpDiv, uploadAdminDiv, uploadUserDiv 
  var {req, res, GRet}=this;
  if(!this.boAWLoggedIn) {return [new ErrorClient('not logged in (as Administrator)', 401)]; }
  var Ou={};

  var {arrName}=inObj;
  if(typeof arrName!=="undefined") {
    if(!(arrName instanceof Array)) return [new Error("!(arrName instanceof Array)")];
    //if(arrName.length==0) return [new Error("arrName.length==0")];
    if(arrName.length==0) {Ou.FileInfo=[];return [null, [Ou]];}
    var objFilter={imageName:{$in:arrName}}
  } else { var objFilter={}; }
  

    // Get All Pages
  var Arg=[objFilter, { collation: { locale: "en", strength: 2 }}];
  var cursor=collectionImage.find(...Arg);
  var [err, results]=await cursor.toArray().toNBP();   if(err) return [err];
  //for(var i=0;i<results.length;i++){ var result=results[i]}

  Ou.FileInfo=results;
  return [null, [Ou]];
}



////////////////////////////////////////////////////////////////////////
// RedirectTab
////////////////////////////////////////////////////////////////////////
ReqBE.prototype.redirectTabGet=async function(inObj){  
  var {req, res, GRet}=this;
  if(!this.boAWLoggedIn) { return [new ErrorClient('not logged in (as Administrator)', 401)];  }


  var cursor=collectionRedirect.find({});
  var [err, results]=await cursor.toArray().toNBP();   if(err) return [err];
  for(var result of results) { var {idSite}=result; result.siteName=idSite;}


  var Ou=arrObj2TabNStrCol(results);
  //this.mes("Got "+results.length+" entries"); 
  extend(Ou, {boOK:1});  //,nEntry:results.length
  return [null, [Ou]];
}

ReqBE.prototype.redirectTabSet=async function(inObj){ 
  var {req, res, GRet}=this, Ou={};
  if(!this.boAWLoggedIn) { return [new ErrorClient('not logged in (as Administrator)', 401)];  }
  //var boUpd=inObj.boUpd||false;
  var tNow=nowSFloored();
  var {boUpd=false, idSite, pageName, url}=inObj;
  idSite=myJSEscape(idSite);
  pageName=myJSEscape(pageName); pageName=pageName.replace(RegExp(' ','g'),'_');

  if(boUpd){
    var {idSiteOld, pageNameOld}=inObj;
    var strIdSiteOld=myJSEscape(idSiteOld);
    pageNameOld=myJSEscape(pageNameOld); pageNameOld=pageNameOld.replace(RegExp(' ','g'),'_')
    var objSet={idSite, pageName, url, tMod:tNow}; //, tCreated:tNow
    //var Arg=[{idSite:idSiteOld, pageName:pageNameOld}, {$set:objSet}, {new:true}]; //, {upsert:true, new:true}
    //var [err, result]=await collectionRedirect.updateOne(...Arg).toNBP();
    var Arg=[{idSite:idSiteOld, pageName:pageNameOld}, {$set:objSet}, {returnDocument:"after", returnOriginal:false}]; //, {upsert:true, new:true}
    var [err, result]=await collectionRedirect.findOneAndUpdate(...Arg).toNBP();
    if(err && (typeof err=='object') && err.code==11000){ this.mes(err.message); extend(Ou, {boOK:0});}  // dup key
    else if(err) return [err];
    else{
      //var c=result.modifiedCount; this.mes(c+" row(s) modified."); 
      var boOK=result.ok, messTmp=boOK?"Entry modified.":"Entry not modified.";  this.mes(messTmp); 
      var objDoc=result.value;
      extend(Ou, {boOK:1, idSite, objDoc});
    }
    return [null, [Ou]]; //['siteName','pageName','url', 'tCreated', 'tMod', 'nAccess', 'tLastAccess']
  
  } else {
    var objDoc={idSite, pageName, url, tCreated:tNow, tMod:tNow, tLastAccess:nowSFloored(), nAccess:0};
    var Arg=[objDoc, {new:true}]; //, {upsert:true, new:true}
    var [err, result]=await collectionRedirect.insertOne(...Arg).toNBP();
    if(err && (typeof err=='object') && err.code==11000){ this.mes(err.message); extend(Ou, {boOK:0});}  // dup key
    else if(err) return [err];
    else{
      var c=result.insertedCount;
      this.mes(c+" row(s) inserted.");  extend(Ou, {boOK:1, tCreated:tNow, tMod:tNow, objDoc});
    }
    return [null, [Ou]];
  }
}

ReqBE.prototype.redirectTabDelete=async function(inObj){  
  var {req, res, GRet}=this, Ou={};
  if(!this.boAWLoggedIn) { return [new ErrorClient('not logged in (as Administrator)', 401)];  }

  var {idSite, pageName}=inObj;

  var [err, result]=await collectionRedirect.deleteOne({idSite, pageName}).toNBP();   if(err) return [err];
  var c=result.deletedCount;

  var mestmp=(c==1)?"Entry deleted":c+ " entries deleted!?";
  this.mes(mestmp);
  Ou.boOK=1;      
  return [null, [Ou]];
}

ReqBE.prototype.redirectTabResetNAccess=async function(inObj){ 
  var {req, res, GRet}=this, Ou={};
  if(!this.boAWLoggedIn) { return [new ErrorClient('not logged in (as Administrator)', 401)];  }

  var Arg=[{}, {$set:{nAccess:0}}]; //, {upsert:true, new:true}
  var [err, result]=await collectionRedirect.updateOne(...Arg).toNBP();
  var boOK=1, mestmp="Done"; 
  this.mes(mestmp);
  extend(Ou, {boOK});
  return [null, [Ou]];
}

////////////////////////////////////////////////////////////////////////
// SiteTab
////////////////////////////////////////////////////////////////////////

ReqBE.prototype.siteTabGet=async function(inObj){  // Used by siteTab
  var {req, res, GRet}=this, Ou={boOK:0};
  if(!this.boAWLoggedIn) { return [new ErrorClient('not logged in (as Administrator)', 401), [Ou]];  }

    // Get sites
  var cursor=collectionSite.find({});
  var [err, ObjSite]=await cursor.toArray().toNBP();   if(err) return [err, [Ou]];
  //for(var site of ObjSite) { var {_id}=site; site.siteName=site.idSite=_id;}
  for(var site of ObjSite) { site.idSite=site._id; delete site._id;}

    // Get nPage
  var arrArg=[ {$group : {_id:"$idSite", n:{$sum:1}}}];
  var cursor=collectionPage.aggregate(arrArg);
  var [err, results]=await cursor.toArray().toNBP();   if(err) return [err, [Ou]];

    // Create NByIdSite 
  var NByIdSite={};
  for(var result of results){ var {_id,n}=result;  NByIdSite[_id]=n;   }

    // Add nPage to objSite
  for(var objSite of ObjSite){
    //var strId=objSite._id, nPage=(strId in NByIdSite)?NByIdSite[strId]:0; extend(objSite, {nPage, idSite:strId});  delete objSite._id;
    var strId=objSite.idSite, nPage=(strId in NByIdSite)?NByIdSite[strId]:0; extend(objSite, {nPage});
  }

  var Ou=arrObj2TabNStrCol(ObjSite);
  this.mes("Got "+ObjSite.length+" entries");
  Ou.boOK=1;
  return [null, [Ou]];
}

//ReqBE.prototype.siteTabSet=async function(inObj){
ReqBE.prototype.siteTabInsert=async function(inObj){
  var {req, res, GRet}=this, self=this, Ou={};
  if(!this.boAWLoggedIn) { return [new ErrorClient('not logged in (as Administrator)', 401)]; }
  
  var { boTLS, idSite, www, googleAnalyticsTrackingID, srcIcon16, strLangSite}=inObj;
  idSite=myJSEscape(idSite);
  www=myJSEscape(www);
  googleAnalyticsTrackingID=myJSEscape(googleAnalyticsTrackingID);
  srcIcon16=myJSEscape(srcIcon16);
  strLangSite=myJSEscape(strLangSite);

  //var [err, result]=await collectionSite.find({$or:[{idSite},{www}]}, {session:sessionMongo}).toNBP();

  var objSite={boTLS:Boolean(boTLS), www, googleAnalyticsTrackingID, srcIcon16, strLangSite};

  objSite.tCreated=nowSFloored();
  extend(objSite,{_id:idSite, aWPassword:"", aRPassword:"", boORDefault:true, boOWDefault:true, boSiteMapDefault:true, boDefault:false});
  var Arg=[objSite, {new:true}]; //, {upsert:true, new:true}
  var [err, result]=await collectionSite.insertOne(...Arg).toNBP();
  if(err && (typeof err=='object') && err.code==11000){ self.mes(err.message); extend(Ou, {boOK:0});}   // dup key
  else if(err) return [err];
  else{
    var c=result.insertedCount;
    var idSite=result.insertedId, strIdSite=idSite; //.toString()
    //objSite.nPage=0;
    self.mes(c+" site(s) inserted.");  extend(Ou, {boOK:1, idSite:idSite, objSite});
    var [err]=await createManifestNStoreToCache({idSite, www, srcIcon16});   if(err) return [err];
  }
  
  return [null, [Ou]];
}

ReqBE.prototype.siteTabUpd=async function(inObj){
  var {req, res, GRet}=this, self=this, Ou={};
  if(!this.boAWLoggedIn) { return [new ErrorClient('not logged in (as Administrator)', 401)]; }
  
  const sessionMongo = mongoClient.startSession();
  sessionMongo.startTransaction({ readPreference:'primary', readConcern: {level:'local'}, writeConcern:{w:'majority'}   });

  stuff:
  {
    var arrRet=[null];

    //var { boTLS, siteName, www, googleAnalyticsTrackingID, srcIcon16, strLangSite}=inObj;
    //siteName=myJSEscape(siteName);
    var { boTLS, idSiteNew, www, googleAnalyticsTrackingID, srcIcon16, strLangSite}=inObj;
    idSiteNew=myJSEscape(idSiteNew);
    www=myJSEscape(www);
    googleAnalyticsTrackingID=myJSEscape(googleAnalyticsTrackingID);
    srcIcon16=myJSEscape(srcIcon16);
    strLangSite=myJSEscape(strLangSite);

    //var [err, result]=await collectionSite.find({$or:[{siteName},{www}]}, {session:sessionMongo}).toNBP();

    var idSite=myJSEscape(inObj.idSite);
    if(idSite!==idSiteNew) {
      var [err, n]=await collectionSite.countDocuments({$and:[{_id:{$ne:idSite}}, {_id:idSiteNew}]}, {session:sessionMongo}).toNBP(); if(err){arrRet=[err]; break stuff;}
      if(n){ self.mes("Name exists"); extend(Ou, {boOK:0}); arrRet=[null, [Ou]]; break stuff;}

      var [err, n]=await collectionSite.countDocuments({$and:[{_id:{$ne:idSite}}, {www}]}, {session:sessionMongo}).toNBP(); if(err){arrRet=[err]; break stuff;}
      if(n){ self.mes("www key exists"); extend(Ou, {boOK:0}); arrRet=[null, [Ou]]; break stuff;}


      var [err, objSite]=await collectionSite.findOne({_id:idSite}, {session:sessionMongo}).toNBP(); if(err){arrRet=[err]; break stuff;}
      extend(objSite,{_id:idSiteNew, boTLS:Boolean(boTLS), www, googleAnalyticsTrackingID, srcIcon16, strLangSite});

      var [err, result]=await collectionSite.deleteOne({_id:idSite}, {session:sessionMongo}).toNBP();   if(err){arrRet=[err]; break stuff;}    // Delete old Site
      var [err, result]=await collectionSite.insertOne(objSite, {new:true, session:sessionMongo}).toNBP(); // Insert new Site
      
        // Get Pages
      var cursor=collectionPage.find({idSite}, {session:sessionMongo});
      var [err, Page]=await cursor.toArray().toNBP();   if(err){arrRet=[err]; break stuff;}
      var regA=RegExp("^"+idSite+":(.*)");
      for(var i=0;i<Page.length;i++){
        var page=Page[i], {IdParent, IdChildLax, IdChild}=page;
        for(var j=0;j<IdParent.length;j++){   var Match=regA.exec(IdParent[j]); IdParent[j]=idSiteNew+":"+Match[1];   }
        for(var j=0;j<IdChildLax.length;j++){   var Match=regA.exec(IdChildLax[j]); IdChildLax[j]=idSiteNew+":"+Match[1];    }
        for(var j=0;j<IdChild.length;j++){   var Match=regA.exec(IdChild[j]); IdChild[j]=idSiteNew+":"+Match[1];    }
        var Match=regA.exec(page._id); page._id=idSiteNew+":"+Match[1];
        page.idSite=idSiteNew;
      }

      var [err, result]=await collectionPage.deleteMany({idSite}, {session:sessionMongo}).toNBP();   if(err){arrRet=[err]; break stuff;}    // Delete old Pages

        // Reinsert Pages
      var nPage=Page.length, arg=Array(nPage);
      for(var i=0;i<nPage;i++){   var obj=Page[i], objTmp={ insertOne: { "document": obj } };    arg[i]=objTmp;    }
      if(nPage){
        var [err, result]=await collectionPage.bulkWrite(arg, {session:sessionMongo}).toNBP();   if(err){arrRet=[err]; break stuff;}  
      }  

        // Get Images
      var cursor=collectionImage.find({IdParent:{$regex:"^"+idSite}}, {session:sessionMongo});
      var [err, Image]=await cursor.toArray().toNBP();   if(err){arrRet=[err]; break stuff;}
      var regA=RegExp("^"+idSite+":(.*)");
      for(var i=0;i<Image.length;i++){
        var image=Image[i], {IdParent}=image;
        for(var j=0;j<IdParent.length;j++){   var Match=regA.exec(IdParent[j]); IdParent[j]=idSiteNew+":"+Match[1];   }
      }

      var [err, result]=await collectionImage.deleteMany({IdParent:{$regex:"^"+idSite}}, {session:sessionMongo}).toNBP();   if(err){arrRet=[err]; break stuff;}    // Delete old Images

        // Reinsert Images
      var nImage=Image.length, arg=Array(nImage);
      for(var i=0;i<nImage;i++){   var obj=Image[i], objTmp={ insertOne: { "document": obj } };    arg[i]=objTmp;    }
      if(nImage){
        var [err, result]=await collectionImage.bulkWrite(arg, {session:sessionMongo}).toNBP();   if(err){arrRet=[err]; break stuff;}   
      }

        // Get Redirects
      var cursor=collectionRedirect.find({idSite}, {session:sessionMongo});
      var [err, Redirect]=await cursor.toArray().toNBP();   if(err){arrRet=[err]; break stuff;}
      for(var i=0;i<Redirect.length;i++){ Redirect[i].idSite=idSiteNew; }

      var [err, result]=await collectionRedirect.deleteMany({idSite}, {session:sessionMongo}).toNBP();   if(err){arrRet=[err]; break stuff;}    // Delete old Redirects

        // Reinsert Redirects
      var nRedirect=Redirect.length, arg=Array(nRedirect);
      for(var i=0;i<nRedirect;i++){   var obj=Redirect[i], objTmp={ insertOne: { "document": obj } };    arg[i]=objTmp;    }
      if(nRedirect){
        var [err, result]=await collectionRedirect.bulkWrite(arg, {session:sessionMongo}).toNBP();   if(err){arrRet=[err]; break stuff;}
      }


      self.mes("site modified."); extend(Ou, {boOK:1, idSite:idSiteNew});
      var [err]=await createManifestNStoreToCache({idSiteNew, www, srcIcon16});   if(err){arrRet=[err]; break stuff;}

      
    }else{
      var objSite={boTLS:Boolean(boTLS), www, googleAnalyticsTrackingID, srcIcon16, strLangSite};
      var Arg=[{_id:idSite}, {$set:objSite}, {session:sessionMongo}]; //, {upsert:true, new:true}
      var [err, result]=await collectionSite.updateOne(...Arg).toNBP();
      if(err && (typeof err=='object') && err.code==11000){ self.mes(err.message); extend(Ou, {boOK:0});}   // dup key
      else if(err){arrRet=[err]; break stuff;}
      else{
        var c=result.modifiedCount;
        self.mes(c+" site(s) modified."); extend(Ou, {boOK:1, idSite:idSiteNew});
        if(c){
          var [err]=await createManifestNStoreToCache({idSiteNew, www, srcIcon16});   if(err){arrRet=[err]; break stuff;}
        }
      }
    }
    arrRet=[null, [Ou]];

  }

  var [errTransaction, resTransaction]=arrRet;
  if(errTransaction) { var a=await sessionMongo.abortTransaction(); sessionMongo.endSession(); return [errTransaction]; }
  var a=await sessionMongo.commitTransaction(); sessionMongo.endSession();
  if(resTransaction instanceof Array) Ou=resTransaction[0];

  return [null, [Ou]];
}


ReqBE.prototype.siteTabDelete=async function(inObj){  
  var {req, res, GRet}=this, self=this;
  if(!this.boAWLoggedIn) { return [new ErrorClient('not logged in (as Administrator)', 401)];  }

  const sessionMongo = mongoClient.startSession();
  sessionMongo.startTransaction({ readPreference:'primary', readConcern: {level:'local'}, writeConcern:{w:'majority'}   });

  stuff:
  {
    var arrRet=[null];
      
    var idSite=myJSEscape(inObj.idSite);

      // Get site data
    var [err, objSite]=await collectionSite.findOne({_id:idSite}, {session:sessionMongo}).toNBP();   if(err){arrRet=[err]; break stuff;}
    var { boDefault}=objSite;
    if(boDefault) { self.mes("Can't delete the default site."); arrRet=[null]; break stuff; }

      // Count pages
    var [err, nPage]=await collectionPage.countDocuments({idSite:idSite}, {session:sessionMongo}).toNBP();   if(err){arrRet=[err]; break stuff;}
    if(nPage!==0) { self.mes('Aborting, since the site has '+nPage+' pages.'); arrRet=[null, {boOK:0}]; break stuff; }

    var [err, result]=await collectionSite.deleteOne({_id:idSite}, {session:sessionMongo}).toNBP();   if(err){arrRet=[err]; break stuff;}
    var c=result.deletedCount;
    var mestmp=(c==1)?"Entry deleted":c+ " entries deleted!?";
    self.mes(mestmp);
    arrRet=[null];
  }

  var [errTransaction, Ou]=arrRet;
  if(errTransaction) { var a=await sessionMongo.abortTransaction(); sessionMongo.endSession(); return [errTransaction]; }
  var a=await sessionMongo.commitTransaction(); sessionMongo.endSession();

  Ou=Ou||{};
  if(typeof Ou.boOK=="undefined") Ou.boOK=1;      
  return [null, [Ou]];
}
ReqBE.prototype.siteTabSetDefault=async function(inObj){ 
  var {req, res, GRet}=this, Ou={};
  if(!this.boAWLoggedIn) { return [new ErrorClient('not logged in (as Administrator)', 401)]; }

  const sessionMongo = mongoClient.startSession();
  sessionMongo.startTransaction({ readPreference:'primary', readConcern: {level:'local'}, writeConcern:{w:'majority'}   });

  stuff:
  {
    var arrRet=[null];
    var Arg=[ {}, { $set: { boDefault:false } }, {session:sessionMongo}];
    var [err, result]=await collectionSite.updateMany(...Arg).toNBP();   if(err) {arrRet=[err]; break stuff;};

    var idSite=myJSEscape(inObj.idSite);
    var Arg=[{_id:idSite}, {$set:{boDefault:true}}, {session:sessionMongo}]; //, {upsert:true, new:true}
    var [err, result]=await collectionSite.updateOne(...Arg).toNBP();   if(err) {arrRet=[err]; break stuff;};
    arrRet=[null];
  };

  var [errTransaction]=arrRet;
  if(errTransaction) { var a=await sessionMongo.abortTransaction(); sessionMongo.endSession(); return [errTransaction]; }
  var a=await sessionMongo.commitTransaction(); sessionMongo.endSession();

  this.mes("OK");
  return [null, [Ou]];
}

////////////////////////////////////////////////////////////////////////
// Uploading
////////////////////////////////////////////////////////////////////////

/*********************************************************************
 * Loading pages / images / meta data
 * * Files may look like (I think (I should probably go through the code and verify this)):
 * * * a.txt b.txt c.txt
 * * * meta.zip page.zip image.zip
 * * * site.csv page.csv image.csv redirect.csv page.zip image.zip
 * 
 *********************************************************************/



//                        ReqBE.prototype.go
//                            /        \
//      ReqBE.prototype.uploadUser  ReqBE.prototype.uploadAdmin     




//                                            script.js
//                                               |
//      ReqBE.prototype.uploadAdmin        loadFrBUFolderOnServ
//                                 \      /
//                                loadFrFiles
//                           /         |         \
//               parseZipFile  csvParseMyWType  storePageMultFrBU
// 


var regImg=RegExp("^("+strImageExtWBar+")$"), regVid=RegExp('^(mp4|ogg|webm)$'); 


ReqBE.prototype.uploadUser=async function(inObj){ 
  var {req, res, GRet}=this, self=this, Ou={};

    // Check reCaptcha with google
  var strCaptchaIn=this.captchaIn;
  var uGogCheck = "https://www.google.com/recaptcha/api/siteverify"; 
  var objForm={  secret:strReCaptchaSecretKey, response:strCaptchaIn, remoteip:req.connection.remoteAddress  };

  // var p=new Promise(resolve=>{
  //   var reqStream=requestMod.post({url:uGogCheck, form:objForm}, function(errT, responseT, bodyT) { resolve([errT, responseT, bodyT]);   });
  // })
  // var [err, response, body]=await p;
  // var buf=body;
  // try{ var data = JSON.parse(buf.toString()); }catch(e){ debugger; return [e]; }

  const params = new URLSearchParams(objForm);
  var [err,response]=await fetch(uGogCheck, {method:'POST', body:params}).toNBP(); if(err) return [err];
  var [err, data]=await response.json().toNBP(); if(err) return [err];


  if(!data.success) return [new ErrorClient('reCaptcha test not successfull')];
  
  var File=this.File;
  var n=File.length; this.mes("nFile: "+n);
  
  var file=File[0], {path:tmpname, name:fileName}=file; if(this.strName.length) fileName=this.strName;
  var Match=RegExp('\\.(\\w{1,3})$').exec(fileName); 
  if(!Match){ Ou.strMessage="The file name should be in the form xxxx.xxx"; return [null, [Ou]]; }
  var type=Match[1].toLowerCase();
  var [err, buf]=await fsPromises.readFile(tmpname).toNBP();    if(err) return [err];
  var data=buf;
  if(data.length==0){ this.mes("data.length==0"); return [null, [Ou]]; }

  if(regImg.test(type)){
      // autoOrient
      var [err,data]=await new Promise(resolve=>{
      var myCollector=concat(function(buf){  resolve([null,buf]);   });
      var streamImg=gm(strDataOrg).autoOrient().resize(wNew, hNew).stream(function streamOut(err, stdout, stderr) {
        if(err) {resolve([err]); return;}
        stdout.pipe(myCollector); 
      });
    });
    if(err) return [err];


    const sessionMongo = mongoClient.startSession();
    sessionMongo.startTransaction({ readPreference:'primary', readConcern: {level:'local'}, writeConcern:{w:'majority'}   });

    var [err]=await storeImage(sessionMongo, {strName:fileName, buffer:data});  

    if(err) { var a=await sessionMongo.abortTransaction(); sessionMongo.endSession(); return [err]; }
    var a=await sessionMongo.commitTransaction(); sessionMongo.endSession();

  }else if(regVid.test(type)){ 
    var strHash=md5(data);
    Ou.strMessage="Videos not supported"; return [null, [Ou]];
  }
  else{ Ou.strMessage="Unrecognized file type: "+type; return [null, [Ou]]; }

  Ou.strMessage="Done";
  return [null, [Ou]];
}



ReqBE.prototype.uploadAdmin=async function(inObj){ 
  var {req, res, GRet}=this, Ou={};
  if(!this.boAWLoggedIn) { return [new ErrorClient('not logged in (as Administrator)', 401)];  }
  this.mes("Working... (check server console for progress) ");

  var regBoTalk=RegExp('(template_)?talk:');
  var FileOrg=this.File, n=FileOrg.length;
  var tmp=n+" files."; console.log(tmp); 

  var [err, result]=await loadFrFiles(FileOrg); if(err) return [err];
  return [null, [0]];
}


app.loadFrBUFolderOnServ=async function(strLoadArg){
  var StrLoadArg, FileOrg;
  if(strLoadArg===true) StrLoadArg=['.'];
  else if(typeof strLoadArg=='undefined') StrLoadArg=['.'];
  else if(typeof strLoadArg=='string') StrLoadArg=strLoadArg.split('+');

  var fsBUFolder=path.join(process.cwd(), '..', 'mmmWikiBackUp')
    // If StrLoadArg is a single directory.
  if( StrLoadArg.length==1) { // If only one item, then check if it is a folder.
    var fsPathArg=path.join(fsBUFolder,StrLoadArg[0]);
    var [err, stats]= await fsPromises.lstat(fsPathArg).toNBP();  if(err) return [err];
    if(stats.isDirectory()){
      var [err, DirEnt]=await fsPromises.readdir(fsPathArg, {withFileTypes:true}).toNBP(); if(err) return [err];
      FileOrg=[]; DirEnt.forEach((objFile)=>{
        if(objFile.isFile()) {
          FileOrg.push({name:objFile.name, path:path.join(fsPathArg,objFile.name)});
        } 
      });
    }
  }
    // If FileOrg was not assigned by the above code. Then assume it is a list of files (file paths).
  if(typeof FileOrg=="undefined"){
    var len=StrLoadArg.length, FileOrg=Array(len);
    for(var i=0;i<len;i++){
      var strT=StrLoadArg[i], obj=path.parse(strT), fsPathArg=path.join(fsBUFolder,strT); FileOrg[i]={name:obj.base, path:fsPathArg};
    }
  }
  var [err, result]=await loadFrFiles(FileOrg); if(err) return [err];
  
  return [null, [0]];
}


app.loadFrFiles=async function(FileOrg){
  // FileOrg is an array where the elements are objects like: {path,name}

  // Loop through all files, parse any zip file, and separate all found files by extension.
  // The elements of FileImg and FilePage looks like:
  //     {strName, strExt, bufFrZip}
  //     {strName, strExt, path}  
  // The properties of FileCsv looks like:
  //    {strName, strExt, strData} 
  //    {strName, strExt, path}
  var FileImg=[], FilePage=[], FileCsv={}, regExt=/^([^\.]+)\.([a-z]+)$/;
  for(var i=0;i<FileOrg.length;i++){
    var {path:strPath, type, name:strName, originalFilename, filepath}=FileOrg[i];
    strName??=originalFilename;
    strPath??=filepath;
    var Match=regExt.exec(strName), strBase=Match[1], strExt=Match[2].toLowerCase();
    if(strExt=='zip') {
      var [err, oZ]=await parseZipFile(strPath); if(err) return [err];
      var KeyCsv=Object.keys(oZ.FileCsv);
      for(var key of KeyCsv) {if(FileCsv[key]) return [new Error("Multiple "+strName)]; else FileCsv[key]=oZ.FileCsv[key];}
      FileImg.push(...oZ.FileImg); FilePage.push(...oZ.FilePage);
    }else if(strExt=='csv') {
      if(StrValidLoadMetaBase.indexOf(strBase)==-1) return [new Error("CSV-file not valid: "+strName+", (valid ones are: "+StrValidLoadMeta.join(", ")+")")];
      var oFile={strName, strExt, path:strPath}; 
      if(FileCsv[strBase]) return [new Error("Multiple "+strName)]; else FileCsv[strBase]=oFile;
    }
    else if(strExt=='txt') { var oFile={strName, strExt, path:strPath};  FilePage.push(oFile); }
    else if(regImg.test(strExt)){ var oFile={strName, strExt, path:strPath};  FileImg.push(oFile); }
    else {debugger; return [new Error("unknown file extention: "+strName)];}
  }


    // Load csv file to ram
  var ObjCsvData={};
  var KeyCsv=Object.keys(FileCsv);
  for(var key of KeyCsv) { 
    var [err, Result]=await csvParseMyWType(FileCsv[key]); if(err) return [err];
    ObjCsvData[key]=Result;
  }
  

  const sessionMongo = mongoClient.startSession();
  sessionMongo.startTransaction({ readPreference:'primary', readConcern: {level:'local'}, writeConcern:{w:'majority'}   });

  
  var [errTransaction, resTransaction]=await (async function(){
    if(ObjCsvData.site){ 
      var objSiteDefault=copyObjWMongoTypes(app.InitCollection.Site.objDefault); objSiteDefault.tCreated=nowSFloored();
      for(var site of ObjCsvData.site){ 
        copySome(site, objSiteDefault, ["tCreated", "boORDefault", "boOWDefault", "boSiteMapDefault"]);
        site._id=site.name.toLowerCase();  delete site.name;
      }

        // Insert sites
      var [err, result]=await collectionSite.insertMany(ObjCsvData.site, {session:sessionMongo}).toNBP();    if(err) return [err];
    }

    if(ObjCsvData.page){
      ObjCsvData.page.forEach((obj,i)=>{   obj.pageName=myEscaper.unescape(obj.pageName);     });   // Unescape pageName

      if(ObjCsvData.page.length!=FilePage.length) return [new Error("ObjCsvData.page.length!=FilePage.length")];
      var [err]=await storePageMultFrBU(sessionMongo, FilePage, ObjCsvData.page);  if(err) return [err];   // Insert pages
    }

      // Insert images
    for(var i=0;i<FileImg.length;i++){
      var [err]=await storeImage(sessionMongo, FileImg[i]);  if(err) return [err];  //, {boDoCalculationOfIdParent:false}
      console.log(FileImg[i].strName+' done');
    }

    var objCollation={ locale: "en", strength: 2 };

    if(ObjCsvData.image){ 
      ObjCsvData.image.forEach((obj,i)=>{   obj.imageName=myEscaper.unescape(obj.imageName);     });   // Unescape imageName

      var Obj=ObjCsvData.image;
      var arg=Array(Obj.length);
      for(var i=0;i<Obj.length;i++){
        var obj=Obj[i], {imageName}=obj;
        obj.tCreated=new Date(obj.tCreated*1000); obj.tMod=new Date(obj.tMod*1000); obj.tLastAccess=new Date(obj.tLastAccess*1000);
        var objTmp={ updateOne: { "filter": { imageName }, "update": { $set : obj }, collation:objCollation } };    arg[i]=objTmp;
      }
      var [err, result]=await collectionImage.bulkWrite(arg, {session:sessionMongo}).toNBP(); if(err) return [err];
    }

    if(ObjCsvData.redirect){ 
      ObjCsvData.redirect.forEach((obj,i)=>{   obj.pageNameLC=myEscaper.unescape(obj.pageNameLC);     });   // Unescape pageNameLC

        // Get all siteNames
      var Arg=[{}, {projection:{ boDefault:1}, session:sessionMongo}];
      var cursor=collectionSite.find(...Arg);
      var [err, Site]=await cursor.toArray().toNBP();   if(err) return [err];
      if(Site===null) return [new Error('No sites found')];

        // Create SiteByStrName
      var SiteByStrName={};  for(var site of Site){ var {_id}=site;  SiteByStrName[_id]=site; }

      var Obj=ObjCsvData.redirect;
      for(var i=0;i<Obj.length;i++){
        var obj=Obj[i]; obj.pageName=obj.pageNameLC; obj.idSite=SiteByStrName[obj.siteName]._id; delete obj.pageNameLC; delete obj.siteName;
        obj.tCreated=new Date(obj.tCreated*1000); obj.tMod=new Date(obj.tMod*1000); obj.tLastAccess=new Date(obj.tLastAccess*1000);
      }
      var [err, result]=await collectionRedirect.insertMany(ObjCsvData.redirect, {session:sessionMongo}).toNBP();    if(err) return [err];  
    }
    return [null,0];
  })();

  if(errTransaction) { var a=await sessionMongo.abortTransaction(); sessionMongo.endSession(); return [errTransaction]; }
  var a=await sessionMongo.commitTransaction(); sessionMongo.endSession();


  return [null, resTransaction];

}


app.parseZipFile=async function(strPath){ 
  var [err, buf]=await fsPromises.readFile(strPath).toNBP();    if(err) return [err];
  var dataOrg=buf; 
  
  //var zip=new NodeZip(dataOrg, {base64: false, checkCRC32: true});
  var [err, zip]=await JSZip.loadAsync(dataOrg).toNBP();   if(err) {console.error(err); process.exit(-1);}

  var FileImg=[], FilePage=[], FileCsv={}, regExt=/^(.+)\.([a-z]+)$/; //, regExt=/^([^\.]+)\.([a-z]+)$/;
  var FileInZip=zip.files, Key=Object.keys(FileInZip);  
  var Ou= {FilePage, FileImg, FileCsv};
  for(var j=0;j<Key.length;j++){
    var strFile=Key[j];
    var Match=regExt.exec(strFile), strBase=Match[1], strExt=Match[2].toLowerCase();
    var fileInZip=FileInZip[strFile];
    if(fileInZip.dir) return [new Error("It is not supposed to be directories in the zip files")];
    //var bufFrZip=Buffer.from(fileInZip._data, 'binary');
    var [err, bufFrZip]=await fileInZip.async("uint8array").toNBP(); if(err) return [err];
    if(strExt=="csv") {
      if(StrValidLoadMetaBase.indexOf(strBase)==-1) return [new Error("CSV-file not valid: "+strFile+", (valid ones are: "+StrValidLoadMeta.join(", ")+")")];
      //var bufT=bufData;
      var strData=bufFrZip.toString(); strData=strData.trim();
      var oFile={strName:strFile, strExt, strData};
      if(FileCsv[strBase]) return [new Error("Multiple "+strFile)]; else FileCsv[strBase]=oFile;
    }else if(strExt=="txt") {
      var oFile={strName:strFile, strExt, bufFrZip};
      FilePage.push(oFile);
    } else if(regImg.test(strExt)) {
      var oFile={strName:strFile, strExt, bufFrZip};
      FileImg.push(oFile);
    }
    //else if(regVid.test(strExt)) FileVid.push(oFile);
    else {debugger; return [new Error("unknown file extention: "+strFile)]; }    
  }
  return [null, Ou];
}


app.csvParseMyWType=async function(oFile){
  var {strName:strFile, strData:strCSV, path}=oFile;
  if(typeof strCSV=='undefined'){
    var [err, buf]=await fsPromises.readFile(path).toNBP();    if(err) return [err];
    strCSV=buf.toString().trim();
  }
  
  //var [arrHead,arrData]= csvParseMy0WithSeparateHeadHandling(strCSV);  // arrData is an array of arrays of strings.
  var arrAll= csvParseMy(strCSV);  
  var arrHead=arrAll[0], arrData=arrAll.slice(1);  // arrData is an array of arrays of strings.
  formatCSVAsHeadPrefix(arrHead,arrData);  // interprete columns starting like "bo-" to boolean, "int-" integer etc

  var nRow=arrData.length;
    // Create an array of objects
  var Obj=Array(nRow);
  arrData.forEach((arr,i)=>{   var obj={};    arr.forEach((v,j)=>{obj[arrHead[j]]=v;});    Obj[i]=obj;     });

  return [null, Obj];
}


app.storePageMultFrBU=async function(sessionMongo, FilePage, PageMeta){
  var tNow=nowSFloored(); //unixNow();


    // Check that page collection is empty
  var Arg=[{}, {session:sessionMongo}];
  var [err, nPage]=await collectionPage.countDocuments(...Arg).toNBP();   if(err) return [err];
  if(nPage!==0) {debugger; return [new Error('The page collection was expected to be empty when uploading pages.')]; }


    // Sort PageMeta by idPage
  var PageMetaByIdPage={};
  for(var obj of PageMeta){ 
    var {siteName, pageName}=obj;
    obj.tCreated=new Date(obj.tCreated*1000); obj.tMod=new Date(obj.tMod*1000); obj.tLastAccess=new Date(obj.tLastAccess*1000);
    var idPageTmp=(siteName+":"+pageName).toLowerCase();
    PageMetaByIdPage[idPageTmp]=obj;
  }

  var strKeyDefault=randomHash();

    // Create two arrays: 
    //   Data (data for the FileWiki collection)
    //   Page (data for the Page collection)
  var Data=Array(FilePage.length), Page=Array(FilePage.length);
  for(var i=0;i<FilePage.length;i++){
    var {strName, bufFrZip, path}=FilePage[i];
    var idPageProt=strName.replace(RegExp('.txt$','i'),''), {siteName, pageName}=parsePageNameHD(idPageProt);

    if(siteName.length==0) {siteName=strKeyDefault; idPageProt=siteName+":"+pageName;}
    var idPage=idPageProt.toLowerCase();


    if(typeof bufFrZip=="undefined"){
      var [err, buf]=await fsPromises.readFile(path).toNBP();    if(err) return [err];
    }else{
        //var buf=Buffer.from(fileInZip._data,'binary');
        //var buf=Buffer.from(bufFrZip,'binary')
        var buf=bufFrZip
    }
    var data=buf;

      // Data
    //var strEditText=data.toString();
    var strEditText=new TextDecoder().decode(data);
    Data[i]={idPage, data:strEditText};

      // Page
    var objPage=copyObjWMongoTypes(app.InitCollection.Page.objDefault);
    console.log(i+' '+idPage);
    var {boOW, boOR, boSiteMap, tCreated, tMod, tLastAccess, nAccess}=PageMetaByIdPage[idPage];
    var idSite=siteName;

      // Some easy to calculate data
    var size=strEditText.length;
    var boTalk=isTalk(pageName),  boTemplate=isTemplate(pageName);

    extend(objPage, {_id:idPage, boOW, boOR, boSiteMap, tCreated, tMod, tLastAccess, nAccess, idSite, pageName, size, boTalk, boTemplate});
    Page[i]=objPage;
  }

  var [err, result]=await collectionFileWiki.insertMany(Data, {session:sessionMongo}).toNBP();   if(err) return [err];
  for(var i=0;i<Data.length;i++){ Page[i].idFileWiki=Data[i]._id; }  // Note! "_id" was written to each element in the above operation.
  var [err, result]=await collectionPage.insertMany(Page, {session:sessionMongo}).toNBP();   if(err) return [err];

  
    // Assign boTalkExist
    // Parse data (Creating: strHtmlText, IdChildLax, IdChild, StrImage)
    // Create arrRevision
  for(var i=0;i<Data.length;i++){
    var {_id:idFileWiki, data:strEditText}=Data[i];
    var objPage=Page[i];
    var {idSite, pageName, boTalk, boTemplate, boOW, tMod, size, _id:idPage}=objPage;
    if(idFileWiki==0)console.log("idFileWiki==0");
  
      // Assign boTalkExist
    if(!boTalk){
      var strPre=boTemplate?'template_talk:':'talk:', talkPage=strPre+pageName, idTalk=(idSite+":"+talkPage).toLowerCase();
      var [err, objPageTalk]=await collectionPage.findOne({_id:idTalk.toLowerCase()}, {session:sessionMongo}).toNBP();   if(err) return [err];
      var boTalkExist=Boolean(objPageTalk);
    } else {var boTalkExist=false;}


      // parse
    var arg={strEditText, idSite, boOW};
    var [err, {strHtmlText, IdChildLax, IdChild, StrImageLC}]=await parse(sessionMongo, arg); if(err) return [err];
    var strHashParse=md5(strHtmlText);

    var nChild=IdChild.length, nImage=StrImageLC.length; 
    var StrImageStub=[], StrPagePrivate=[];
    

      // Write File data
    var Arg = [{ data:strHtmlText }, {session:sessionMongo}];
    var [err, result]=await collectionFileHtml.insertOne(...Arg).toNBP();   if(err) return [err];
    var idFileHtml=Arg[0]._id;


    var strHash='fromBU', tModCache=tNow, boOther=false;
  
    var objRevNew={ summary:"",signature:"",boOther,idFileWiki,tMod,idFileHtml,tModCache,strHashParse,strHash,size };
    var arrRevision=[objRevNew], nRevision=1, lastRev=0;


      // Make changes to current page
    extend(objPage, {  arrRevision, nRevision, lastRev, IdChild, IdChildLax, StrImage:StrImageLC, StrImageStub, nChild, nImage, boTalkExist, idFileWiki, idFileHtml, boOther, tMod, tModCache, strHashParse, strHash, size});
    var Arg=[{_id:idPage}, {$set:objPage}, {session:sessionMongo}]; //, {upsert:true, new:true}
    var [err, result]=await collectionPage.updateOne(...Arg).toNBP();   if(err) return [err];

  }

    // Create data for statistics (IdParent)
  for(var i=0;i<Data.length;i++){
    var objPage=Page[i];
    var { pageName, _id:idPage}=objPage;

      // Query to get parents
    var Arg=[{IdChildLax:idPage}, {projection:{_id:1}, session:sessionMongo}];
    var cursor=collectionPage.find(...Arg);
    var [err, items]=await cursor.toArray().toNBP();   if(err) return [err];
    var IdParent=items.map(it=>{return it._id;}),    nParent=IdParent.length;
      // Make changes to current page
    var Arg=[{_id:idPage}, {$set:{ IdParent, nParent}}, {session:sessionMongo}]; //, {upsert:true, new:true}
    var [err, result]=await collectionPage.updateOne(...Arg).toNBP();   if(err) return [err];
  }

  return [null];
}
