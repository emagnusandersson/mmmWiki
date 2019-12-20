
http = require("http");
https = require('https');
tls=require('tls');
url = require("url");
path = require("path");
fs = require("fs");
mysql =  require('mysql');
gm =  require('gm').subClass({ imageMagick: true });
im = require('imagemagick');
temporary = require('tmp');
util =  require('util');
concat = require('concat-stream');
requestMod = require('request');
//through = require('through')
querystring = require('querystring');
//async = require('async');
formidable = require("formidable");
//NodeRSA = require('node-rsa');
crypto = require('crypto');
//atob = require('atob');
//childProcess = require('child_process');
zlib = require('zlib');
imageSize = require('image-size');
//Fiber = require('fibers');
//Future = require('fibers/future');
NodeZip=require('node-zip');
//redis = require("then-redis");
redis = require("redis");
//csvParse = require('csv-parse/lib/sync');
//fastCSV = require('fast-csv');
//csvtojson=require('csvtojson');
papaparse = require('papaparse');  // For parsing CSV
//Neo4j = require('neo4j-transactions');
var minimist = require('minimist');
//UglifyJS = require("uglify-js");
Streamify= require('streamify-string');
serialize = require('serialize-javascript');
app=(typeof window==='undefined')?global:window;



require('./lib.js');
require('./libServerGeneral.js');
require('./libServer.js');
require('./lib/foundOnTheInternet/lcs.js');
require('./lib/foundOnTheInternet/diff.js');
require('./myDiff.js');
//require('./store.js');

strAppName='mmmWiki';
extend=util._extend;

strInfrastructure=process.env.strInfrastructure||'local';
boHeroku=strInfrastructure=='heroku'; 
boAF=strInfrastructure=='af'; 
boLocal=strInfrastructure=='local'; 
boDO=strInfrastructure=='do'; 


//StrValidSqlCalls=['createTable', 'dropTable', 'createView', 'dropView', 'createFunction', 'dropFunction', 'truncate', 'createDummy', 'createDummies'];
StrValidSqlCalls=['createTable', 'dropTable', 'createView', 'dropView', 'createFunction', 'dropFunction', 'populateSetting', 'truncate'];

StrValidLoadMeta=['site.csv', 'page.csv', 'image.csv', 'redirect.csv'];  // ValidLoadMeta calls

helpTextExit=function(){
  var arr=[];
  arr.push(`USAGE script [OPTION]...
  -h, --help          Display this text
  -p, --port [PORT]   Port number (default: 5000)
  --sql [SQL_ACTION]  Run a sql action.
    SQL_ACTION=`+StrValidSqlCalls.join('|')+`

  --load [fileOrDirPath]
    Looks for (and loads) pages (txt-files), image-files, meta-files (csv-files) or zip-files.
    The meta-files must be named any of: `+StrValidLoadMeta.join(', ')+`.
    zip-files which name DOESN'T contain the string "meta", may contain further txt/image-files.
    zip-files which name DOES contain the string "meta" are assumed to contain any of the above named csv-files.
    fileOrDirPath is a path relative to the "mmmWikiBU"-folder (a sibling of the "mmmWiki"-program folder).
    If fileOrDirPath is a folder, then the files in that folder is loaded.
    The fileOrDirPath-string is "splitted" on "+"-characters, (so one can supply multiple files like: fileA+fileB+fileC) .
    If fileOrDirPath is empty, the program looks for files in the "mmmWikiBU"-folder.
    Files named page.zip, image.zip resp meta.zip in the top level of "mmmWikiBU" are overwritten by the program (when the admin clicks resp BU-to-server-button in the web interface).

    Ex: 
      node --load               // Loads all files (not entering any folders) in "mmmWikiBU"
      node --load myDir         // Loads all files (not entering any folders) in "mmmWikiBU/myDir"
      node --load myPage.txt    // Loads "mmmWikiBU/myPage.txt"
      node --load myPages.zip   // Loads "mmmWikiBU/myPages.zip"
      node --load mymeta.zip    // Loads "mmmWikiBU/mymeta.zip". mymeta.zip must only contain meta-files (as named above)
      node --load site.csv+myPage.txt+myImage.jpg+myPages.zip     // Loads site.csv, myPage.txt, myImage.jpg and myPages.zip`);
  console.log(arr.join('\n'));
  process.exit(0);
}

var argv = minimist(process.argv.slice(2), {alias: {h:'help', p:'port'}} );  // Perhaps use yargs !? (according to https://www.youtube.com/watch?v=S-_Fx4-nal8)

var C=AMinusB(Object.keys(argv),['_', 'h', 'help', 'p', 'port', 'sql', 'load']);
var tmp=[].concat(C,argv._);
if(tmp.length){ console.log(tmp.join(', ')+' are unknown options'); helpTextExit(); return;}



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
strSalt='abcdef';
strBTC="";
ppStoredButt="";
boUseSelfSignedCert=false;


var flow=( function*(){

  port=argv.p||argv.port||5000;
  if(argv.h || argv.help) {helpTextExit(); return;}

  var strConfig;
  if(boHeroku){ 
    if(!process.env.jsConfig) { console.error(new Error('jsConfig-environment-variable is not set')); return;}  //process.exit(1);
    strConfig=process.env.jsConfig||'';
  }
  else{
    var err, buf; fs.readFile('./config.js', function(errT, bufT) { err=errT;  buf=bufT;  flow.next();  });  yield;     if(err) {console.error(err); return;}
    strConfig=buf.toString();
    //require('./config.js');    //require('./config.example.js');
  } 
  
    // Detecting if the config-file has changed since last time (might be usefull to speed up things when the program is auto started)
  var strMd5Config=md5(strConfig);
  eval(strConfig);
  var redisVar='str'+ucfirst(strAppName)+'Md5Config';
  var [err,tmp]=yield* cmdRedis(flow, 'GET',[redisVar]);
  var boNewConfig=strMd5Config!==tmp; 
  if(boNewConfig) { var [err,tmp]=yield* cmdRedis(flow, 'SET',[redisVar,strMd5Config]);  }

  if('levelMaintenance' in process.env) levelMaintenance=process.env.levelMaintenance;

  tmp=require('./lib/foundOnTheInternet/sha1.js');
  //tmp=require('./lib/foundOnTheInternet/sha256libNode.js'); Sha256=tmp.Sha256;
  //import Sha256 from  './lib/foundOnTheInternet/sha256lib.js';
  require('./filterServer.js'); 
  require('./variablesCommon.js');
  require('./libReqBE.js');
  require('./libReq.js'); 
  require('./parser.js'); 
  require('./parserTable.js'); 

  mysqlPool=setUpMysqlPool();
  myNeo4j=new MyNeo4j();

  if(boNewConfig) { 
    
  }
  
  SiteName=[strDBPrefix]; // To make the code analog to my other programs :-)

      // Load fr BU-folder
  if(typeof argv.load!='undefined'){
    var StrFile; if(typeof argv.load=='string') StrFile=argv.load.split('+');
    var [err]=yield* loadFrBUOnServ(flow, StrFile); if(err) console.error(err);  process.exit(0); return;
  }
    // Do db-query if --sql XXXX was set in the argument
  if(typeof argv.sql!='undefined'){
    if(typeof argv.sql!='string') {console.log('sql argument is not a string'); process.exit(-1); return; }
    var tTmp=new Date().getTime();
    var setupSql=new SetupSql();
    setupSql.myMySql=new MyMySql(mysqlPool);
    var [err]=yield* setupSql.doQuery(flow, argv.sql);
    setupSql.myMySql.fin();
    if(err) {  console.error(err);  return;}
    console.log('Time elapsed: '+(new Date().getTime()-tTmp)/1000+' s'); 
    process.exit(0);
  }

  tIndexMod=new Date(); tIndexMod.setMilliseconds(0);



  regexpLib=RegExp('^/(stylesheets|lib|Site)/');
  regexpLooseJS=RegExp('^/(lib|libClient|client|filter|common)\\.js'); //siteSpecific
  regexpImage=RegExp('^/[^/]*\\.(jpg|jpeg|gif|png|svg|ico)$','i');
  regexpVideo=RegExp('^/[^/]*\\.(mp4|ogg|webm)$','i');

  regexpHerokuDomain=RegExp("\\.herokuapp\\.com$");
  regexpAFDomain=RegExp("\\.af\\.cm$");  

 
  StrPako=['pako', 'pako_deflate', 'pako_inflate'], strMin=1?'':'.min'; //boDbg
  for(var i=0;i<StrPako.length;i++){
    StrPako[i]='bower_components/pako/dist/'+StrPako[i]+strMin+'.js';
  }
  regexpPakoJS=RegExp('^/bower_components/pako/dist/pako(|_deflate|_inflate)'); //siteSpecific

  CacheUri=new CacheUriT();
  StrFilePreCache=['filter.js', 'lib.js', 'libClient.js', 'client.js', 'stylesheets/style.css'];
  StrFilePreCache=StrFilePreCache.concat(StrPako);
  for(var i=0;i<StrFilePreCache.length;i++) {
    var filename=StrFilePreCache[i];
    var [err]=yield* readFileToCache(flow, filename); if(err) {  console.error(err.message);  return;}
  }
  var [err]=yield* writeCacheDynamicJS(flow);   if(err) {  console.error(err.message);  return;}
  
  if(boDbg){
    fs.watch('.', makeWatchCB('.', ['filter.js','client.js','libClient.js']) );
    fs.watch('stylesheets', makeWatchCB('stylesheets', ['style.css']) );
  }

  var StrCookiePropProt=["HttpOnly", "Path=/","max-age="+3600*24*30];
  //if(boDO) { StrCookiePropProt.push("secure"); }
  if(!boLocal || boUseSelfSignedCert) StrCookiePropProt.push("secure");
  var StrCookiePropStrict=StrCookiePropProt.concat("SameSite=Strict"),   StrCookiePropLax=StrCookiePropProt.concat("SameSite=Lax"),   StrCookiePropNormal=StrCookiePropProt.concat("SameSite=None");
  app.strCookiePropStrict=";"+StrCookiePropStrict.join(';');  app.strCookiePropLax=";"+StrCookiePropLax.join(';');  app.strCookiePropNormal=";"+StrCookiePropNormal.join(';');

  handler=function(req, res){
    req.flow=(function*(){
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
      
        // Check if cross site request
      //var boCrossSite=domainName==;
      
      var cookies = parseCookies(req);
      req.cookies=cookies;

      req.boCookieNormalOK=req.boCookieLaxOK=req.boCookieStrictOK=false;
      
        // Check if a valid sessionID-cookie came in
      var boSessionCookieInInput='sessionIDNormal' in cookies, sessionID=null, redisVarSessionMain;
      if(boSessionCookieInInput) {
        sessionID=cookies.sessionIDNormal;  redisVarSessionMain=sessionID+'_Main';
        var [err, tmp]=yield* cmdRedis(req.flow, 'EXISTS', redisVarSessionMain); req.boCookieNormalOK=tmp;
      } 
      
      if(req.boCookieNormalOK){
          // Check if Lax / Strict -cookies are OK
        req.boCookieLaxOK=('sessionIDLax' in cookies) && cookies.sessionIDLax===sessionID;
        req.boCookieStrictOK=('sessionIDStrict' in cookies) && cookies.sessionIDStrict===sessionID;
        var redisVarDDOSCounter=sessionID+'_Counter';
      }else{
        sessionID=randomHash();  redisVarSessionMain=sessionID+'_Main';
        var ipClient=getIP(req), redisVarDDOSCounter=ipClient+'_Counter';
      }
      
        // Increase DDOS counter 
      var luaCountFunc=`local c=redis.call('INCR',KEYS[1]); redis.call('EXPIRE',KEYS[1], ARGV[1]); return c`;
      var [err, intCount]=yield* cmdRedis(req.flow, 'EVAL',[luaCountFunc, 1, redisVarDDOSCounter, tDDOSBan]);
      
      
      res.setHeader("Set-Cookie", ["sessionIDNormal="+sessionID+strCookiePropNormal, "sessionIDLax="+sessionID+strCookiePropLax, "sessionIDStrict="+sessionID+strCookiePropStrict]);
       
        // Check if to many requests comes in a short time (DDOS)
      if(intCount>intDDOSMax) {res.outCode(429,"Too Many Requests ("+intCount+"), wait "+tDDOSBan+"s\n"); return; }
      
      
        // Refresh / create  redisVarSessionMain
      if(req.boCookieNormalOK){
        var luaCountFunc=`local c=redis.call('GET',KEYS[1]); redis.call('EXPIRE',KEYS[1], ARGV[1]); return c`;
        var [err, value]=yield* cmdRedis(req.flow, 'EVAL',[luaCountFunc, 1, redisVarSessionMain, maxAdminRUnactivityTime]); req.sessionCache=JSON.parse(value)
      } else { 
        yield* setRedis(req.flow, redisVarSessionMain, 1, maxAdminRUnactivityTime); 
        req.sessionCache={};
      }
      
      
      
      var wwwSite=domainName, pathName=pathNameOrg;

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
      //req.strSite=strSite; req.site=site;
      req.wwwSite=wwwSite;
      req.sessionID=sessionID; req.objUrl=objUrl;    req.boTLS=boTLS;  req.strSchemeLong=strSchemeLong;    req.pathName=pathName; 
      
      
      if(levelMaintenance){res.outCode(503, "Down for maintenance, try again in a little while."); return;}
      var objReqRes={req:req, res:res};
      objReqRes.myMySql=new MyMySql(mysqlPool);
      //if(pathName=='/'+leafPageLoadBE){ var reqPageLoadBE=new ReqPageLoadBE(objReqRes);  yield* reqPageLoadBE.go();    }
      if(pathName=='/'+leafBE){ var reqBE=new ReqBE(objReqRes);  yield* reqBE.go();    }
      //else if(pathName.indexOf('/image/')==0){  yield* reqImage.call(objReqRes);   } //RegExp('^/image/').test(pathName)
      else if(regexpLib.test(pathName) || regexpLooseJS.test(pathName) || regexpPakoJS.test(pathName) || pathName=='/conversion.html'){    yield* reqStatic.call(objReqRes);   }
      else if(regexpImage.test(pathName)){    yield* reqMediaImage.call(objReqRes);    }
      else if(regexpVideo.test(pathName)){  yield* reqMediaVideo.call(objReqRes);    }
      else if(pathName=='/monitor.html'){   yield* reqMonitor.call(objReqRes);  }
      else if(pathName.toLowerCase()=='/sitemap.xml'){  yield* reqSiteMap.call(objReqRes);  }
      else if(pathName=='/robots.txt'){  yield* reqRobots.call(objReqRes);  }
      else if(pathName=='/stat.html'){     yield* reqStat.call(objReqRes);  }
      else if(pathName=='/createDumpCommand'){  var str=createDumpCommand(); res.out200(str);     }
      else if(pathName=='/BUMetaSQL'){    yield* reqBUMetaSQL.call(objReqRes,pathName);    }
      else if(pathName.substr(0,7)=='/BUMeta'){    yield* reqBUMeta.call(objReqRes,pathName.substr(7));    }
      else if(pathName.substr(0,3)=='/BU'){    yield* reqBU.call(objReqRes,pathName.substr(3));    }
      else if(pathName=='/debug'){    debugger;  res.end();}
      else if(pathName=='/mini'){
        var tserver=(new Date()).valueOf();  
        res.end('<script>tserver='+tserver+";tclient=(new Date()).valueOf(); console.log('tserver: '+tserver/1000);console.log('tclient: '+tclient/1000);console.log('tdiff: '+(tclient-tserver)/1000);</script>");
      }
      else if(pathName=='/timeZoneTest'){var dateTrash=new Date();  res.end(''+dateTrash.getTimezoneOffset());}
      else if(pathName=='/'+googleSiteVerification) res.end('google-site-verification: '+googleSiteVerification);
      else { yield* reqIndex.call(objReqRes);   }
      objReqRes.myMySql.fin();
      
    })(); req.flow.next();
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

})(); flow.next();

