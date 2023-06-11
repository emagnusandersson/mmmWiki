global.app=global;
import http from "http";
import https from 'https';
//import tls from 'tls';
import url from "url";
import path from "path";
import fs, {promises as fsPromises} from "fs";
import concat from 'concat-stream';
//import requestMod from 'request';
import fetch from 'node-fetch';
import formidable from "formidable";
import myCrypto from 'crypto';
import zlib from 'zlib';
//import imageSize from 'image-size';
//import NodeZip from 'node-zip';
import JSZip from "jszip";
//"redis": "^4.6.5",
//import redis from "redis";
import Redis from "ioredis";
import Streamify from 'streamify-string';
import serialize from 'serialize-javascript';
import validator from 'validator';
import mime from "mime";
//import UglifyJS from "uglify-js";
import gmTmp from 'gm';
app.gm=gmTmp.subClass({ imageMagick: true });
import im from 'imagemagick';
import temporary from 'tmp';
import ejs from "ejs";
import mongodb from 'mongodb';
import mongoSanitize from 'mongo-sanitize';
import minimist from 'minimist';
import * as dotenv from 'dotenv'
dotenv.config();
//import v8 from 'v8'
//import {URLPattern} from "urlpattern-polyfill"
//import mysql from 'mysql';


app.extend=Object.assign;
extend(app, {http, url, path, fsPromises, concat, fetch, formidable, myCrypto, zlib, JSZip, Streamify, serialize, validator, mime, gm, im, temporary, ejs, mongodb, mongoSanitize});
var {MongoClient, ObjectId, Long, Int32} = mongodb;
extend(app, {MongoClient, ObjectId, Long, Int32});


await import('./lib.js');
await import('./libServerGeneral.js');
await import('./libServer.js');
await import('./lib/foundOnTheInternet/lcs.js');
await import('./lib/foundOnTheInternet/diff.js');
await import('./myDiff.js');
//await import('./store.js');

app.strAppName='mmmWiki';

var strInfrastructure=process.env.strInfrastructure||'local';
app.boHeroku=strInfrastructure=='heroku'; 
app.boAF=strInfrastructure=='af'; 
app.boLocal=strInfrastructure=='local'; 
app.boDO=strInfrastructure=='do'; 



app.StrValidLoadMeta=['site.csv', 'page.csv', 'image.csv', 'redirect.csv'];  // ValidLoadMeta calls
app.StrValidLoadMetaBase=StrValidLoadMeta.map(el=>el.slice(0,-4));
app.StrImageExt=['jpg','jpeg','png','gif','svg','ico'];
app.strImageExtWComma=StrImageExt.join(', ');   app.strImageExtWBar=app.StrImageExt.join('|');
app.StrValidMongoDBCalls=['create', 'drop', 'populateSetting', 'truncate', 'truncateAllExceptSetting', 'countRows'];

app.helpTextExit=function(){
  var arr=[];
  arr.push(`USAGE script [OPTION]...
  -h, --help          Display this text

  -p, --port [PORT]   Port number (default: 5000)

  --mongodb [MONGODB_ACTION]  Run a mongodb action.
    MONGODB_ACTION=`+StrValidMongoDBCalls.join('|')+`

  --load [fileOrDirPath]
    Looks for (and loads) pages (txt-files), image-files (`+strImageExtWComma+`), meta-files (csv-files) or zip-files containing the said file formats. (although no zip-files in the zip-files)
    The meta-files must be named any of: `+StrValidLoadMeta.join(', ')+`.
    fileOrDirPath is a path relative to the "mmmWikiBackUp"-folder (a sibling of the "mmmWiki"-program folder).
    If fileOrDirPath is a folder, then the files in that folder is loaded.
    The fileOrDirPath-string is "splitted" on "+"-characters, (so one can supply multiple files like: fileA+fileB+fileC) .
    If fileOrDirPath is empty, the program looks for files in the "mmmWikiBackUp"-folder.
    Note! Files named page.zip, image.zip resp meta.zip in the top level of "mmmWikiBackUp" are overwritten by the program (when the admin clicks resp BU-to-server-button in the web interface).

    Ex: 
      node --load               // Loads all files (not entering any folders) in "mmmWikiBackUp"
      node --load myDir         // Loads all files (not entering any folders) in "mmmWikiBackUp/myDir"
      node --load myPage.txt    // Loads "mmmWikiBackUp/myPage.txt"
      node --load myFiles.zip   // Loads "mmmWikiBackUp/myFiles.zip"
      node --load site.csv+myPage.txt+myImage.jpg+myPages.zip     // Loads the named files from mmmWikiBackUp`);
  console.log(arr.join('\n'));
  process.exit(0);
}

var argv = minimist(process.argv.slice(2), {alias: {h:'help', p:'port'}} );  // Perhaps use yargs !? (according to https://www.youtube.com/watch?v=S-_Fx4-nal8)

var StrUnknown=AMinusB(Object.keys(argv),['_', 'h', 'help', 'p', 'port', 'mongodb', 'load']);
var StrUnknown=[].concat(StrUnknown, argv._);
if(StrUnknown.length){ console.log('Unknown arguments: '+StrUnknown.join(', ')); helpTextExit();}

      
  // Set up redisClient
// var urlRedis=process.env.REDIS_URL;
// if(  urlRedis ) {
//   app.redisClient=redis.createClient({no_ready_check: true, url: urlRedis, legacyMode: true}); // Since v4 this should be the way to use the interface with legacyMode: true
// }else {
//   //var objConnect={host: 'localhost', port: 6379,  password: 'password'};
//   app.redisClient=redis.createClient({ legacyMode: true});
// }
// await redisClient.connect();

var REDIS_URL="redis://localhost:6379"
app.redis = new Redis(REDIS_URL);

  // Default config variables (If you want to change them I suggest you create a file config.js and overwrite them there)
extend(app, {boDbg:0, boAllowSql:1, port:5000, levelMaintenance:0, googleSiteVerification:'googleXXX.html',
  //domainPayPal:'www.paypal.com',
  urlPayPal:'https://www.paypal.com/cgi-bin/webscr',
  maxAdminRUnactivityTime:24*60*60,
  maxAdminWUnactivityTime:5*60,  
  intDDOSMax:100, tDDOSBan:5, 
  strBTC:"",
  ppStoredButt:"",
  boUseSelfSignedCert:false,
  //srcIcon16Default:"Site/Icon/iconRed16.png",
  intDDOSIPMax:100, // intDDOSIPMax: How many requests before DDOSBlocking occurs. 
  tDDOSIPBan:10, // tDDOSIPBan: How long in seconds til the blocking is lifted
  strSalt:'abcdefghijklmnopqrstuvwxyz', // Random letters to prevent that the hashed passwords looks the same as on other sites.
  uRecaptcha:'https://www.google.com/recaptcha/api.js?onload=cbRecaptcha&render=explicit',
  uriDB:'mysql://USER:PASSWORD@localhost/DATABASENAME',
  strReCaptchaSiteKey:"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",   strReCaptchaSecretKey:"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  aRPassword:"123", aWPassword:"123",
  RegRedir:[],
  //strJSConsoleKey:'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'
});


port=argv.p||argv.port||5000;
if(argv.h || argv.help) {helpTextExit(); }

var strConfig;
if(boHeroku){ 
  if(!process.env.jsConfig) { console.error(Error('jsConfig-environment-variable is not set')); process.exit(-1);}
  strConfig=process.env.jsConfig||'';
}
else{
  var [err, buf]=await fsPromises.readFile('./config.js').toNBP();    if(err) {console.error(err); process.exit(-1);}
  strConfig=buf.toString();
  //await import('./config.js');    //await import('./config.example.js');
} 

  // Detecting if the config-file has changed since last time (might be useful to speed up things when the program is auto started)
var strMd5Config=md5(strConfig);
eval(strConfig);
if(typeof strSalt=='undefined') {console.error("typeof strSalt=='undefined'"); process.exit(-1); }

var redisVar='str'+ucfirst(strAppName)+'Md5Config';
//var [err,tmp]=await cmdRedis('GET',[redisVar]); if(err) {console.error(err); process.exit(-1);}
var [err,tmp]=await getRedis(redisVar); if(err) {console.error(err); process.exit(-1);}

//var [err,tmp]=await cmdRedis('GET',[redisVar]);
var boNewConfig=strMd5Config!==tmp; 
//if(boNewConfig) { var [err,tmp]=await cmdRedis('SET',[redisVar,strMd5Config]);   if(err) {console.error(err); process.exit(-1);}      }
if(boNewConfig) { var [err,tmp]=await setRedis(redisVar,strMd5Config);   if(err) {console.error(err); process.exit(-1);}      }

if('levelMaintenance' in process.env) levelMaintenance=process.env.levelMaintenance;

await import('./lib/foundOnTheInternet/sha1.js');
//tmp=await import('./lib/foundOnTheInternet/sha256libNode.js'); Sha256=tmp.Sha256;
//import Sha256 from  './lib/foundOnTheInternet/sha256lib.js';
await import('./filterServer.js'); 
await import('./mongo_InitCollection.js');
await import('./variablesCommon.js');
await import('./libReqBE.js');
await import('./libReq.js'); 
await import('./parser.js'); 
await import('./parserTable.js'); 

//mysqlPool=setUpMysqlPool();
app.myEscaper=new MyEscaper();
//createDefaultDocumentAll();//app.InitCollection.Page.objDefault


var urlMongo = 'mongodb://127.0.0.1:27017';
app.mongoClient=undefined;
var err, Arg=[urlMongo, { useUnifiedTopology: true}];
var [err, result]=await MongoClient.connect(...Arg).toNBP();  if(err) {console.log(err); process.exit(-1);}
mongoClient=result;
process.on('exit', function(){ console.log('Goodbye!'); mongoClient.close();});

app.dbo = mongoClient.db("mmmWiki");
app.NameCollection=Object.keys(app.InitCollection);

  // Check if Page collection exists, if so, assume that the other collections exists.
//var [err, result]=await dbo.command({ listCollections: 1, filter:{name:"Page"}}).toNBP();   if(err) {console.log(err);process.exit(-1); }
var [err, result]=await dbo.command({ listCollections: 1, filter:{name:"Page"}}).toNBP();   if(err) {console.log(err);process.exit(-1); }
if(result!=null){
  for(var nameCollection of NameCollection){ app["collection"+nameCollection]=dbo.collection(nameCollection); }
}

if(boNewConfig) { 
  
}

//var SiteName=[strDBPrefix]; // To make the code analog to my other programs :-)

    // Load fr BU-folder
if(typeof argv.load!='undefined'){
  //var load=argv.load; if(load===true) load=
  var setupMongo=new SetupMongo();
  var [err]=await setupMongo.doQuery("create");
  var [err]=await loadFrBUFolderOnServ(argv.load); if(err) {console.error(err); process.exit(-1);} 
  console.log('done loading');
  process.exit(0);
}
  // Do db-query if --mongodb XXXX was set in the argument
if(typeof argv.mongodb!='undefined'){
  var strMongo=argv.mongodb;
  if(typeof strMongo!='string') {console.log('mongodb argument is not a string'); process.exit(-1); }
  if(StrValidMongoDBCalls.indexOf(strMongo)==-1){
    var tmp=strMongo+' is not valid input, try any of these: '+StrValidMongoDBCalls.join(', ');
    console.error(tmp);  process.exit(0);
  }

  var tTmp=new Date().getTime();
  var setupMongo=new SetupMongo();
  var [err]=await setupMongo.doQuery(strMongo); if(err) {console.error(err); process.exit(-1);} 
  console.log('Time elapsed: '+(new Date().getTime()-tTmp)/1000+' s'); 
  process.exit(0);
}

//app.tIndexMod=nowSFloored();



var regexpLib=RegExp('^/(stylesheets|lib|Site)/');
var regexpLooseJS=RegExp('^/(lib|libClient|client|filter|common)\\.js'); //siteSpecific
var regexpImage=RegExp('^/[^/]*\\.('+strImageExtWBar+')$','i');
var regexpVideo=RegExp('^/[^/]*\\.(mp4|ogg|webm)$','i');

var regexpHerokuDomain=RegExp("\\.herokuapp\\.com$");
var regexpAFDomain=RegExp("\\.af\\.cm$");  


var StrPako=['pako', 'pako_deflate', 'pako_inflate'], strMin=1?'':'.min'; //boDbg
for(var i=0;i<StrPako.length;i++){
  StrPako[i]='bower_components/pako/dist/'+StrPako[i]+strMin+'.js';
}
var regexpPakoJS=RegExp('^/bower_components/pako/dist/pako(|_deflate|_inflate)'); //siteSpecific

  // Creating CacheUri
app.CacheUri=new CacheUriT();

  // PreCaching files
var StrFilePreCache=['filter.js', 'lib.js', 'libClient.js', 'client.js', 'stylesheets/style.css', 'lib/foundOnTheInternet/zip.js', 'lib/foundOnTheInternet/sha1.js'];
StrFilePreCache=StrFilePreCache.concat(StrPako);
for(var i=0;i<StrFilePreCache.length;i++) {
  var filename=StrFilePreCache[i];
  var [err]=await CacheUri.readFileToCache(filename); if(err) {  console.error(err.message);  process.exit(-1);}
}

  // Write leafCommon to Cache
var buf=createCommonJS();
var [err]=await CacheUri.set(leafCommon, buf, 'js', true, true);   if(err) {  console.error(err.message);  process.exit(-1);}

if(boDbg){
  fs.watch('.', makeWatchCB('.', ['filter.js', 'client.js', 'libClient.js', 'lib.js']) );
  fs.watch('stylesheets', makeWatchCB('stylesheets', ['style.css']) );

}

  // Write manifest to Cache
var [err]=await createManifestNStoreToCacheFrDB(); if(err) {console.error(err.message); process.exit(-1);} 


  // Read index template and do some initial insertions of data, then calc its hash.
var [err, buf]=await fsPromises.readFile('views/index.html').toNBP();   if(err) {console.error(err); process.exit(-1);}
app.strIndexTemplate=buf.toString();
app.strIndexTemplateIOSLoc=strIndexTemplate;


var FlJS=['filter.js', 'lib.js', 'libClient.js', 'client.js', leafCommon];
for(var i=0;i<FlJS.length;i++) { 
  var pathTmp=FlJS[i], vTmp=CacheUri[pathTmp].strHash, varName='u'+ucfirst(pathTmp.slice(0,-3));
  app.strIndexTemplate=strIndexTemplate.replace(RegExp(`<%=${varName}%>`), `<%=uSiteCommon%>/${pathTmp}?v=${vTmp}`);
  app.strIndexTemplateIOSLoc=strIndexTemplateIOSLoc.replace(RegExp(`<%=${varName}%>`), `<%=uSiteCommon%>/${pathTmp}?v=0`);
}
var pathTmp='stylesheets/style.css', vTmp=CacheUri[pathTmp].strHash;
app.strIndexTemplate=strIndexTemplate.replace(/<%=uStyle%>/, `<%=uSiteCommon%>/${pathTmp}?v=${vTmp}`);
app.strIndexTemplateIOSLoc=strIndexTemplateIOSLoc.replace(/<%=uStyle%>/, `<%=uSiteCommon%>/${pathTmp}?v=0`);
app.strHashTemplate=md5(strIndexTemplate);
//app.strHashTemplateIOSLoc=md5(strIndexTemplateIOSLoc);

var redisVar=strAppName+'_IndexTemplateHash';
var luaIndexTemplateHashTestNSetFun=`local strHash=redis.call('GET',KEYS[1]);     if(strHash==ARGV[1]) then return 1; else redis.call('SET',KEYS[1],ARGV[1]); return 0; end;`;
//var [err, boHashTemplateMatch]=await cmdRedis('EVAL',[luaIndexTemplateHashTestNSetFun, 1, redisVar, strHashTemplate]); if(err){console.error(err); process.exit(-1);}

var [err, boHashTemplateMatch]=await redis.eval(luaIndexTemplateHashTestNSetFun, 1, redisVar, strHashTemplate).toNBP();
if(err){console.error(err); process.exit(-1);}

if(!boHashTemplateMatch){
  var Arg=[{boOR:true }, [{ $set: { tModCache: new Date(0), strHash:'template changed' } }]];
  var [err, result]=await collectionPage.updateMany( ...Arg).toNBP();   if(err) {console.error(err); process.exit(-1);}
}

// var StrCookiePropProt=["HttpOnly", "Path=/", "Max-Age="+3600*24*30];
// if(!boLocal || boUseSelfSignedCert) StrCookiePropProt.push("Secure");
// app.strCookiePropNormal=";"+StrCookiePropProt.concat("SameSite=None").join(';');
// app.strCookiePropLax=";"+StrCookiePropProt.concat("SameSite=Lax").join(';');
// app.strCookiePropStrict=";"+StrCookiePropProt.concat("SameSite=Strict").join(';');

//'Expires='+new Date(new Date().getTime()+3600*24*365*1000).toUTCString()
//'Max-Age='+3600*24*365

app.StrCookiePropProt={"HttpOnly":1, Path:"/", "Max-Age":3600*24*30, "SameSite":"Lax"};
if(!boLocal || boUseSelfSignedCert) StrCookiePropProt["Secure"]=1;
var oTmp=extend({},StrCookiePropProt); 
oTmp["SameSite"]="None"; app.strCookiePropNormal=";"+arrayifyCookiePropObj(oTmp).join(';');
oTmp["SameSite"]="Lax"; app.strCookiePropLax=";"+arrayifyCookiePropObj(oTmp).join(';');
oTmp["SameSite"]="Strict"; app.strCookiePropStrict=";"+arrayifyCookiePropObj(oTmp).join(';');

var oTmp=extend({},StrCookiePropProt); 
oTmp["Max-Age"]=maxAdminRUnactivityTime; var str1=";"+arrayifyCookiePropObj(oTmp).join(';');
oTmp["Max-Age"]=0; var str0=";"+arrayifyCookiePropObj(oTmp).join(';');
app.StrSessionIDRProp=[str0,str1];
oTmp["Max-Age"]=maxAdminWUnactivityTime; var str1=";"+arrayifyCookiePropObj(oTmp).join(';');
oTmp["Max-Age"]=0; var str0=";"+arrayifyCookiePropObj(oTmp).join(';');
app.StrSessionIDWProp=[str0,str1];



var luaDDosCounterFun=`local c=redis.call('INCR',KEYS[1]); redis.call('EXPIRE',KEYS[1], ARGV[1]); return c`
redis.defineCommand("myDDosCounterFun", { numberOfKeys: 1, lua: luaDDosCounterFun });

var luaGetNExpire=`local c=redis.call('GET',KEYS[1]); redis.call('EXPIRE',KEYS[1], ARGV[1]); return c`;
redis.defineCommand("myGetNExpire", { numberOfKeys: 1, lua: luaGetNExpire });


const handler=async function(req, res){
  if(typeof isRedirAppropriate!='undefined'){ 
    //var tmpUrl=isRedirAppropriate(req); if(tmpUrl) { res.out301(tmpUrl); return; }
    var tmpUrl=isRedirAppropriate(req); if(tmpUrl) { res.out200('The domain name has changed, use: '+tmpUrl+' instead'); return; }
  }

  //res.setHeader("X-Frame-Options", "deny");  // Deny for all (note: this header is removed for images (see reqMediaImage) (should also be removed for videos))
  res.setHeader("Content-Security-Policy", "frame-ancestors 'none'");  // Deny for all (note: this header is removed in certain requests)
  res.setHeader("X-Content-Type-Options", "nosniff");  // Don't try to guess the mime-type (I prefer the rendering of the page to fail if the mime-type is wrong)
  if(!boLocal || boUseSelfSignedCert) res.setHeader("Strict-Transport-Security", "max-age="+3600*24*365); // All future requests must be with https (forget this after a year)
  res.setHeader("Referrer-Policy", "origin");  //  Don't write the refer unless the request comes from the origin
  


  var domainName=req.headers.host; 
  var objUrl=url.parse(req.url),  pathNameOrg=objUrl.pathname;
  var wwwReq=domainName+pathNameOrg;
  
  var wwwSite=domainName, pathName=pathNameOrg;
  
    // Check if cross site request
  //var boCrossSite=domainName==;
  
  var cookies = parseCookies(req);
  req.cookies=cookies;

  
    //
    // DDOS Checking
    //

    // Assign boCookieDDOSCameNExist
  var boCookieDDOSCameNExist=false;
  var {sessionIDDDos=null}=cookies, redisVarDDos;
  if(sessionIDDDos) {
    redisVarDDos=sessionIDDDos+'_DDOS';
    //var [err, tmp]=await cmdRedis('EXISTS', redisVarDDos); boCookieDDOSCameNExist=tmp;
    var [err, tmp]=await existsRedis(redisVarDDos); boCookieDDOSCameNExist=tmp;
  }
    // If !boCookieDDOSCameNExist then create a new sessionIDDDos (and redisVarDDos).
  if(!boCookieDDOSCameNExist) { sessionIDDDos=randomHash();  redisVarDDos=sessionIDDDos+'_DDOS'; }
    // Update redisVarDDos counter
  //var [err, intCount]=await cmdRedis('EVAL',[luaDDosCounterFun, 1, redisVarDDos, tDDOSBan]);
  var [err, intCount]=await redis.myDDosCounterFun(redisVarDDos, tDDOSBan).toNBP();
    // Write to response
  res.replaceCookie("sessionIDDDos="+sessionIDDDos+strCookiePropNormal);


    // Update redisVarDDosIP counter
  var ipClient=getIP(req), redisVarDDosIP=ipClient+'_DDOS';
  // var [err, intCountIP]=await cmdRedis('EVAL',[luaDDosCounterFun, 1, redisVarDDosIP, tDDOSIPBan]);
  var [err, intCountIP]=await redis.myDDosCounterFun(redisVarDDosIP, tDDOSIPBan).toNBP();
  
    // Determine which DDOS counter to use
  if(boCookieDDOSCameNExist) {  var intCountT=intCount, intDDOSMaxT=intDDOSMax, tDDOSBanT=tDDOSBan;   }
  else{  var intCountT=intCountIP, intDDOSMaxT=intDDOSIPMax, tDDOSBanT=tDDOSIPBan;   }
  
    // If the counter is to high, then respond with 429
  if(intCountT>intDDOSMaxT) {
    var strMess="Too Many Requests ("+intCountT+"), wait "+tDDOSBanT+"s\n";
    if(pathName=='/'+leafBE){ var reqBE=new ReqBE({req, res}); reqBE.mesEO(strMess, 429); }
    else res.outCode(429, strMess);
    return;
  }
  

  // if('sessionIDStrict' in cookies) {
  //   var luaCountFunc=`local c=redis.call('GET',KEYS[1]); redis.call('EXPIRE',KEYS[1], ARGV[1]); return c`;
  //   var [err,value]=await cmdRedis('EVAL',[luaCountFunc, 1, cookies.sessionIDStrict, maxAdminRUnactivityTime]);
  //   req.boCookieStrictOK=Number(value);
  // }

    // Set mimetype if the extention is recognized
  var regexpExt=RegExp('\.([a-zA-Z0-9]+)$');
  var Match=pathName.match(regexpExt), strExt; if(Match) strExt=Match[1];
  if(strExt in MimeType) res.setHeader('Content-type', MimeType[strExt]);

  


  if(boDbg) console.log(req.method+' '+pathName);
  
  var boTLS=false;

  if(boHeroku && req.headers['x-forwarded-proto']=='https') { boTLS=true; }
  if(boAF && req.headers['x-forwarded-proto']=='https') { boTLS=true; }
  if(boDO) { boTLS=true; }

  //if(boHeroku && regexpHerokuDomain.test(domainName)) boTLS=true;  // Specialcase: herokuapp.com 
  //if(boHeroku && boTLS && req.headers['x-forwarded-proto']!='https') { res.out301('https://'+req.headers.host+pathName); return; }

  //if(boAF && regexpAFDomain.test(domainName)) boTLS=true;  // Specialcase: af.cm 
  //if(boAF && boTLS && req.headers['x-forwarded-proto']!='https') { res.out301('https://'+req.headers.host+pathName); return; }


  if(boLocal && 'encrypted' in req.connection) boTLS=true;


  var strScheme='http'+(boTLS?'s':''),   strSchemeLong=strScheme+'://';

  extend(req, {wwwSite, objUrl, boTLS, strSchemeLong, pathName}); 
  
  
  if(levelMaintenance){res.outCode(503, "Down for maintenance, try again in a little while."); return;}
  var objReqRes={req, res};

  //if(pathName=='/'+leafPageLoadBE){ var reqPageLoadBE=new ReqPageLoadBE(objReqRes);  await reqPageLoadBE.go();    }
  if(pathName=='/'+leafBE){ var reqBE=new ReqBE(objReqRes);  await reqBE.go();    }
  //else if(pathName.indexOf('/image/')==0){  await reqImage.call(objReqRes);   } //RegExp('^/image/').test(pathName)
  else if(regexpLib.test(pathName) || regexpLooseJS.test(pathName) || regexpPakoJS.test(pathName) || pathName=='/conversion.html' || pathName=='/'+leafManifest){
    if(pathName=='/'+leafManifest) req.boSiteDependant=1;
    await reqStatic.call(objReqRes);   
  }
  //else if(pathName=='/'+leafManifest){   req.boSiteDependant=1; await reqStatic.call(objReqRes);   }
  else if(regexpImage.test(pathName)){    await reqMediaImage.call(objReqRes);    }
  else if(regexpVideo.test(pathName)){  await reqMediaVideo.call(objReqRes);    }
  else if(pathName=='/monitor.html'){   await reqMonitor.call(objReqRes);  }
  else if(pathName.toLowerCase()=='/sitemap.xml'){  await reqSiteMap.call(objReqRes);  }
  else if(pathName=='/robots.txt'){  await reqRobots.call(objReqRes);  }
  else if(pathName=='/stat.html'){     await reqStat.call(objReqRes);  }
  else if(pathName=='/BUMetaSQL'){    await reqBUMetaSQL.call(objReqRes,pathName);    }
  else if(pathName.substr(0,7)=='/BUMeta'){    await reqBUMeta.call(objReqRes,pathName.substr(7));    }
  else if(pathName.substr(0,3)=='/BU'){    await reqBU.call(objReqRes,pathName.substr(3));    }
  else if(pathName=='/debug'){    debugger;  res.end();}
  else if(pathName=='/mini'){
    var tserver=(new Date()).valueOf();  
    res.end('<script>var tserver='+tserver+", tclient=(new Date()).valueOf(); console.log('tserver: '+tserver/1000);console.log('tclient: '+tclient/1000);console.log('tdiff: '+(tclient-tserver)/1000);</script>");
  }
  else if(pathName=='/timeZoneTest'){var dateTrash=new Date();  res.end(''+dateTrash.getTimezoneOffset());}
  else if(pathName=='/'+googleSiteVerification) res.end('google-site-verification: '+googleSiteVerification);
  else { await reqIndex.call(objReqRes);   }
  
}


if(boUseSelfSignedCert){
  //const options = { key: fs.readFileSync('0SelfSignedCert/server.key'), cert: fs.readFileSync('0SelfSignedCert/server.cert') };

  var [err, buf]=await fsPromises.readFile('0SelfSignedCert/server.key').toNBP(); if(err) {console.error(err); process.exit(-1);}
  var key=buf.toString();
  var [err, buf]=await fsPromises.readFile('0SelfSignedCert/server.cert').toNBP(); if(err) {console.error(err); process.exit(-1);}
  var cert=buf.toString();
  const options= {key, cert};
  https.createServer(options, handler).listen(port);   console.log("Listening to HTTPS requests at port " + port);
} else{
  http.createServer(handler).listen(port);   console.log("Listening to HTTP requests at port " + port);
}



