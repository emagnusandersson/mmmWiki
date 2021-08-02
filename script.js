
http = require("http");
https = require('https');
tls=require('tls');
url = require("url");
path = require("path");
fs = require("fs");
fsPromises = require("fs/promises");
gm =  require('gm').subClass({ imageMagick: true });
im = require('imagemagick');
temporary = require('tmp');
concat = require('concat-stream');
//requestMod = require('request');
fetch = require('node-fetch');
querystring = require('querystring');
formidable = require("formidable");
crypto = require('crypto');
zlib = require('zlib');
imageSize = require('image-size');
NodeZip=require('node-zip');
redis = require("redis");
var minimist = require('minimist');
const { exit } = require("process");
//UglifyJS = require("uglify-js");
Streamify= require('streamify-string');
validator = require('validator');
serialize = require('serialize-javascript');
ejs = require("ejs");
mime = require("mime");
mongodb=require('mongodb');
({MongoClient, ObjectId, Long, Int32} = mongodb);
mongoSanitize=require('mongo-sanitize');
//mysql =  require('mysql');

app=global;app.extend=Object.assign;


require('./lib.js');
require('./libServerGeneral.js');
require('./libServer.js');
require('./lib/foundOnTheInternet/lcs.js');
require('./lib/foundOnTheInternet/diff.js');
require('./myDiff.js');
//require('./store.js');

strAppName='mmmWiki';

strInfrastructure=process.env.strInfrastructure||'local';
boHeroku=strInfrastructure=='heroku'; 
boAF=strInfrastructure=='af'; 
boLocal=strInfrastructure=='local'; 
boDO=strInfrastructure=='do'; 



StrValidLoadMeta=['site.csv', 'page.csv', 'image.csv', 'redirect.csv'];  // ValidLoadMeta calls
StrValidLoadMetaBase=StrValidLoadMeta.map(el=>el.slice(0,-4));
StrImageExt=['jpg','jpeg','png','gif','svg','ico'];
strImageExtWComma=StrImageExt.join(', ');   strImageExtWBar=app.StrImageExt.join('|');
StrValidMongoDBCalls=['create', 'drop', 'populateSetting', 'truncate', 'truncateAllExceptSetting', 'countRows'];

helpTextExit=function(){
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
if(StrUnknown.length){ console.log('Unknown arguments: '+StrUnknown.join(', ')); helpTextExit(); return;}


    // Set up redisClient
var urlRedis;
if(  (urlRedis=process.env.REDISTOGO_URL)  || (urlRedis=process.env.REDISCLOUD_URL)  ) {
  var objRedisUrl=url.parse(urlRedis),    password=objRedisUrl.auth.split(":")[1];
  var objConnect={host: objRedisUrl.hostname, port: objRedisUrl.port,  password: password};
  //redisClient=redis.createClient(objConnect); // , {no_ready_check: true}
  redisClient=redis.createClient(urlRedis, {no_ready_check: true}); //
}else {
  //var objConnect={host: 'localhost', port: 6379,  password: 'password'};
  redisClient=redis.createClient();
}


  // Default config variables (If you want to change them I suggest you create a file config.js and overwrite them there)
boDbg=0; boAllowSql=1; port=5000; levelMaintenance=0; googleSiteVerification='googleXXX.html';
domainPayPal='www.paypal.com';
urlPayPal='https://www.paypal.com/cgi-bin/webscr';
maxAdminRUnactivityTime=24*60*60;
maxAdminWUnactivityTime=5*60;  
intDDOSMax=100; tDDOSBan=5; 
strBTC="";
ppStoredButt="";
boUseSelfSignedCert=false;
//srcIcon16Default="Site/Icon/iconRed16.png"



(async function(){
  port=argv.p||argv.port||5000;
  if(argv.h || argv.help) {helpTextExit(); return;}

  var strConfig;
  if(boHeroku){ 
    if(!process.env.jsConfig) { console.error(Error('jsConfig-environment-variable is not set')); return;}  //process.exit(1);
    strConfig=process.env.jsConfig||'';
  }
  else{
    var [err, buf]=await fsPromises.readFile('./config.js').toNBP();    if(err) {console.error(err); return;}
    strConfig=buf.toString();
    //require('./config.js');    //require('./config.example.js');
  } 

    // Detecting if the config-file has changed since last time (might be usefull to speed up things when the program is auto started)
  var strMd5Config=md5(strConfig);
  eval(strConfig);
  if(typeof strSalt=='undefined') {console.error("typeof strSalt=='undefined'"); return; }

  var redisVar='str'+ucfirst(strAppName)+'Md5Config';
  var [err,tmp]=await cmdRedis('GET',[redisVar]); if(err) {console.error(err); process.exit(1);}

  //var [err,tmp]=await cmdRedis('GET',[redisVar]);
  var boNewConfig=strMd5Config!==tmp; 
  if(boNewConfig) { var [err,tmp]=await cmdRedis('SET',[redisVar,strMd5Config]);   if(err) {console.error(err); process.exit(1);}      }

  if('levelMaintenance' in process.env) levelMaintenance=process.env.levelMaintenance;

  tmp=require('./lib/foundOnTheInternet/sha1.js');
  //tmp=require('./lib/foundOnTheInternet/sha256libNode.js'); Sha256=tmp.Sha256;
  //import Sha256 from  './lib/foundOnTheInternet/sha256lib.js';
  require('./filterServer.js'); 
  require('./mongo_InitCollection.js');
  require('./variablesCommon.js');
  require('./libReqBE.js');
  require('./libReq.js'); 
  require('./parser.js'); 
  require('./parserTable.js'); 

  //mysqlPool=setUpMysqlPool();
  myNeo4j=new MyNeo4j();
  //createDefaultDocumentAll();//app.InitCollection.Page.objDefault


  var urlMongo = 'mongodb://localhost:27017';
  app.mongoClient=undefined;
  var err, Arg=[urlMongo, { useUnifiedTopology: true}];
  var [err, result]=await MongoClient.connect(...Arg).toNBP();  if(err) {console.log(err); return;}
  mongoClient=result;
  process.on('exit', function(){ console.log('Goodbye!'); mongoClient.close();});

  app.dbo = mongoClient.db("mmmWiki");
  app.NameCollection=Object.keys(app.InitCollection);

    // Check if Page collection exists, if so, assume that the other collections exists.
  //var [err, result]=await dbo.command({ listCollections: 1, filter:{name:"Page"}}).toNBP();   if(err) {console.log(err);return; }
  var [err, result]=await dbo.command({ listCollections: 1, filter:{name:"Page"}}).toNBP();   if(err) {console.log(err);return; }
  if(result!=null){
    for(var nameCollection of NameCollection){ app["collection"+nameCollection]=dbo.collection(nameCollection); }
  }

  if(boNewConfig) { 
    
  }

  SiteName=[strDBPrefix]; // To make the code analog to my other programs :-)

      // Load fr BU-folder
  if(typeof argv.load!='undefined'){
    //var load=argv.load; if(load===true) load=
    var setupMongo=new SetupMongo();
    var [err]=await setupMongo.doQuery("create");
    var [err]=await loadFrBUOnServInterior(argv.load); if(err) {console.error(err); process.exit(1);} 
    process.exit(0); return;
  }
    // Do db-query if --mongodb XXXX was set in the argument
  if(typeof argv.mongodb!='undefined'){
    var strMongo=argv.mongodb;
    if(typeof strMongo!='string') {console.log('mongodb argument is not a string'); process.exit(-1); return; }
    if(StrValidMongoDBCalls.indexOf(strMongo)==-1){
      var tmp=strMongo+' is not valid input, try any of these: '+StrValidMongoDBCalls.join(', ');
      console.error(tmp);  process.exit(0);
    }

    var tTmp=new Date().getTime();
    var setupMongo=new SetupMongo();
    var [err]=await setupMongo.doQuery(strMongo); if(err) {console.error(err); process.exit(1);} 
    console.log('Time elapsed: '+(new Date().getTime()-tTmp)/1000+' s'); 
    process.exit(0);
  }

  tIndexMod=nowSFloored();



  regexpLib=RegExp('^/(stylesheets|lib|Site)/');
  regexpLooseJS=RegExp('^/(lib|libClient|client|filter|common)\\.js'); //siteSpecific
  regexpImage=RegExp('^/[^/]*\\.('+strImageExtWBar+')$','i');
  regexpVideo=RegExp('^/[^/]*\\.(mp4|ogg|webm)$','i');

  regexpHerokuDomain=RegExp("\\.herokuapp\\.com$");
  regexpAFDomain=RegExp("\\.af\\.cm$");  


  StrPako=['pako', 'pako_deflate', 'pako_inflate'], strMin=1?'':'.min'; //boDbg
  for(var i=0;i<StrPako.length;i++){
    StrPako[i]='bower_components/pako/dist/'+StrPako[i]+strMin+'.js';
  }
  regexpPakoJS=RegExp('^/bower_components/pako/dist/pako(|_deflate|_inflate)'); //siteSpecific


    // Write files to Cache
  CacheUri=new CacheUriT();
  StrFilePreCache=['filter.js', 'lib.js', 'libClient.js', 'client.js', 'stylesheets/style.css', 'lib/foundOnTheInternet/zip.js', 'lib/foundOnTheInternet/sha1.js'];
  StrFilePreCache=StrFilePreCache.concat(StrPako);
  for(var i=0;i<StrFilePreCache.length;i++) {
    var filename=StrFilePreCache[i];
    var [err]=await readFileToCache(filename); if(err) {  console.error(err.message);  return;}
  }
  var [err]=await writeCacheDynamicJS();   if(err) {  console.error(err.message);  return;}

  if(boDbg){
    fs.watch('.', makeWatchCB('.', ['filter.js', 'client.js', 'libClient.js', 'lib.js']) );
    fs.watch('stylesheets', makeWatchCB('stylesheets', ['style.css']) );
  }

    // Write manifest to Cache
  var [err]=await createManifestNStoreToCacheFrDB(); if(err) {console.error(err.message); process.exit(1);} 


    // Read index template and do some initial insertions of data, then calc its hash.
  var [err, buf]=await fsPromises.readFile('views/index.html').toNBP();   if(err) {console.error(err); process.exit(1);}
  app.strIndexTemplate=buf.toString();
  app.strIndexTemplateIOSLoc=strIndexTemplate;

  var FlJS=['filter.js', 'lib.js', 'libClient.js', 'client.js', leafCommon];
  for(var i=0;i<FlJS.length;i++) { 
    var pathTmp='/'+FlJS[i], vTmp=CacheUri[pathTmp].strHash, varName='u'+ucfirst(FlJS[i].slice(0,-3));
    app.strIndexTemplate=strIndexTemplate.replace(RegExp('<%='+varName+'%>'), '<%=uSiteCommon%>'+pathTmp+'?v='+vTmp);
    app.strIndexTemplateIOSLoc=strIndexTemplateIOSLoc.replace(RegExp('<%='+varName+'%>'), '<%=uSiteCommon%>'+pathTmp+'?v=0');
  }
  var pathTmp='/'+'stylesheets/style.css', vTmp=CacheUri[pathTmp].strHash;
  app.strIndexTemplate=strIndexTemplate.replace(/<%=uStyle%>/, '<%=uSiteCommon%>'+pathTmp+'?v='+vTmp);
  app.strIndexTemplateIOSLoc=strIndexTemplateIOSLoc.replace(/<%=uStyle%>/, '<%=uSiteCommon%>'+pathTmp+'?v=0');
  app.strHashTemplate=md5(strIndexTemplate);
  //app.strHashTemplateIOSLoc=md5(strIndexTemplateIOSLoc);

  var redisVar=strAppName+'_IndexTemplateHash';
  var luaCountFunc=`local strHash=redis.call('GET',KEYS[1]);     if(strHash==ARGV[1]) then return 1; else redis.call('SET',KEYS[1],ARGV[1]); return 0; end;`;
  var [err, boHashTemplateMatch]=await cmdRedis('EVAL',[luaCountFunc, 1, redisVar, strHashTemplate]); if(err){console.error(err); process.exit(1);}
  if(!boHashTemplateMatch){
    var Arg=[{boOR:true }, [{ $set: { tModCache: new Date(0), strHash:'template changed' } }]];
    var [err, result]=await collectionPage.updateMany( ...Arg).toNBP();   if(err) {console.error(err); process.exit(1);}
  }

  var StrCookiePropProt=["HttpOnly", "Path=/", "Max-Age="+3600*24*30];
  //if(boDO) { StrCookiePropProt.push("Secure"); }
  if(!boLocal || boUseSelfSignedCert) StrCookiePropProt.push("Secure");
  var StrCookiePropStrict=StrCookiePropProt.concat("SameSite=Strict"),   StrCookiePropLax=StrCookiePropProt.concat("SameSite=Lax"),   StrCookiePropNormal=StrCookiePropProt.concat("SameSite=None");
  app.strCookiePropStrict=";"+StrCookiePropStrict.join(';');  app.strCookiePropLax=";"+StrCookiePropLax.join(';');  app.strCookiePropNormal=";"+StrCookiePropNormal.join(';');
  //'Expires='+new Date(new Date().getTime()+3600*24*365*1000).toUTCString()
  //'Max-Age='+3600*24*365

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

    var boCookieDDOSOK=false; //req.boCookieLaxOK=req.boCookieStrictOK=
    
      // Check if a valid sessionIDDDos-cookie came in
    var sessionIDDDos=null, redisVarDDos;
    if('sessionIDDDos' in cookies) {
      sessionIDDDos=cookies.sessionIDDDos;  redisVarDDos=sessionIDDDos+'_DDOS';
      var [err, tmp]=await cmdRedis('EXISTS', redisVarDDos); boCookieDDOSOK=tmp;
    }
      // If non-valid sessionIDDDos, then create a new one.
    if(!boCookieDDOSOK) { sessionIDDDos=randomHash();  redisVarDDos=sessionIDDDos+'_DDOS'; }
    
      // Increase redisVarDDos 
    var luaCountFunc=`local c=redis.call('INCR',KEYS[1]); redis.call('EXPIRE',KEYS[1], ARGV[1]); return c`;
    var [err, intCount]=await cmdRedis('EVAL',[luaCountFunc, 1, redisVarDDos, tDDOSBan]);
    
      // Increase redisVarDDosIP.
    var ipClient=getIP(req), redisVarDDosIP=ipClient+'_DDOS';
    var luaCountFunc=`local c=redis.call('INCR',KEYS[1]); redis.call('EXPIRE',KEYS[1], ARGV[1]); return c`;
    var [err, intCountIP]=await cmdRedis('EVAL',[luaCountFunc, 1, redisVarDDosIP, tDDOSIPBan]);
      
    res.setHeader("Set-Cookie", "sessionIDDDos="+sessionIDDDos+strCookiePropNormal);
    
      // If to many, then ban
    if(boCookieDDOSOK) {  var intCountT=intCount, intDDOSMaxT=intDDOSMax, tDDOSBanT=tDDOSBan;   }   else   {    intCountT=intCountIP; intDDOSMaxT=intDDOSIPMax; tDDOSBanT=tDDOSIPBan;   }
    if(intCountT>intDDOSMaxT) {
      var strMess="Too Many Requests ("+intCountT+"), wait "+tDDOSBanT+"s\n";
      if(pathName=='/'+leafBE){ var reqBE=new ReqBE({req, res}); reqBE.mesEO(strMess, 429); }
      else res.outCode(429,strMess);
      return;
    }
    


      // Set mimetype if the extention is recognized
    var regexpExt=RegExp('\.([a-zA-Z0-9]+)$');
    var Match=pathName.match(regexpExt), strExt; if(Match) strExt=Match[1];
    if(strExt in MimeType) res.setHeader('Content-type', MimeType[strExt]);

    

    if(pathName=='/index.php') { var qs=objUrl.query||'', objQS=querystring.parse(qs), tmp=objQS.page||''; res.out301('http://'+domainName+'/'+tmp); return; }

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
    else if(regexpLib.test(pathName) || regexpLooseJS.test(pathName) || regexpPakoJS.test(pathName) || pathName=='/conversion.html' || pathName=='/'+leafManifest){    await reqStatic.call(objReqRes);   }
    //else if(pathName=='/'+leafManifest){    await reqManifest.call(objReqRes);   }
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
      res.end('<script>tserver='+tserver+";tclient=(new Date()).valueOf(); console.log('tserver: '+tserver/1000);console.log('tclient: '+tclient/1000);console.log('tdiff: '+(tclient-tserver)/1000);</script>");
    }
    else if(pathName=='/timeZoneTest'){var dateTrash=new Date();  res.end(''+dateTrash.getTimezoneOffset());}
    else if(pathName=='/'+googleSiteVerification) res.end('google-site-verification: '+googleSiteVerification);
    else { await reqIndex.call(objReqRes);   }
    
    
  }


  if(boUseSelfSignedCert){
    //if(typeof TLSData=='undefined' || !(TLSData instanceof Array) || TLSData.length==0) {  console.error("typeof TLSData=='undefined' || !(TLSData instanceof Array) || TLSData.length==0");  return;}
    //TLSDataExtend.call(TLSData);
    //var options = {
      //SNICallback: function(domain, cb) {
        //console.log('SNI '+domain); 
        ////return TLSData.getContext(domain);
        //cb(null, TLSData.getContext(domain));
      //},
      //key: TLSData[0].strKey,
      //cert: TLSData[0].strCert  
    //};
    
    const options = { key: fs.readFileSync('0SelfSignedCert/server.key'), cert: fs.readFileSync('0SelfSignedCert/server.cert') };

    https.createServer(options, handler).listen(port);   console.log("Listening to HTTPS requests at port " + port);
  } else{
    http.createServer(handler).listen(port);   console.log("Listening to HTTP requests at port " + port);
  }
})();


