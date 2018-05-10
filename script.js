
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
papaparse = require('papaparse');
//captchapng = require('captchapng');
//Neo4j = require('neo4j-transactions');
var argv = require('minimist')(process.argv.slice(2));
require('./lib.js');
require('./libServerGeneral.js');
require('./libServer.js');
require('./lib/foundOnTheInternet/lcs.js');
require('./lib/foundOnTheInternet/diff.js');
require('./myDiff.js');
//require('./store.js');

strAppName='mmmWiki';
app=(typeof window==='undefined')?global:window;
extend=util._extend;

strInfrastructure=process.env.strInfrastructure||'local';
boHeroku=strInfrastructure=='heroku'; 
boAF=strInfrastructure=='af'; 
boLocal=strInfrastructure=='local'; 
boDO=strInfrastructure=='do'; 


//StrValidSqlCalls=['createTable', 'dropTable', 'createView', 'dropView', 'createFunction', 'dropFunction', 'truncate', 'createDummy', 'createDummies'];
StrValidSqlCalls=['createTable', 'dropTable', 'createView', 'dropView', 'createFunction', 'dropFunction', 'truncate'];

StrValidLoadMeta=['site.csv', 'page.csv', 'image.csv', 'redirect.csv'];  // ValidLoadMeta calls

helpTextExit=function(){
  var arr=[];
  arr.push('USAGE script [OPTION]...');
  arr.push('  -h, --help          Display this text');
  arr.push('  -p, --port [PORT]   Port number (default: 5000)');
  arr.push('  --sql [SQL_ACTION]  Run a sql action.');
  arr.push('    SQL_ACTION='+StrValidSqlCalls.join('|'));

  arr.push('  --loadFrBU [FILE[+FILE...]] Load from BU folder.');
  arr.push('    FILE can be any of page.zip, image.zip, '+StrValidLoadMeta.join(', ')+'');
  //arr.push('    FILE= A file of any of the following formats:');
  //arr.push('          txt-file with wiki-text');
  //arr.push('          image-file (acceptable formats: jpg, jpeg, png, gif, svg)');
  //arr.push('          zip-file containing one or multiple files of the above formats.');
  //arr.push('          zip-file containing one or multiple files of the above formats.');
  //arr.push('          Any of "'+StrValidLoadMeta.join('", "')+'" "');
  arr.push('    NOTE!!! the order in which the files are supplied matters. Check the website for this program for valid combinations.');
  console.log(arr.join('\n'));
  process.exit(0);
}




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


// Create a Neo4j client instance 
/*
var client = Neo4j({
  url: 'http://localhost:7474',
  credentials: {
    username: 'neo4j',
    password: 'jh10k'
  }
})
*/

var flow=( function*(){

    // Default config variables
  boDbg=0; boAllowSql=1; port=5000; levelMaintenance=0; googleSiteVerification='googleXXX.html';
  domainPayPal='www.paypal.com';
  urlPayPal='https://www.paypal.com/cgi-bin/webscr';
  maxViewUnactivityTime=24*60*60;
  maxAdminUnactivityTime=5*60;  
  intDDOSMax=100; tDDOSBan=5; 
  strSalt='abcdef';
  strBTC="";
  ppStoredButt="";
  
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
  var tmp=yield* wrapRedisSendCommand.call({flow:flow}, 'get',[redisVar]);
  var boNewConfig=strMd5Config!==tmp; 
  if(boNewConfig) { var tmp=yield* wrapRedisSendCommand.call({flow:flow}, 'set',[redisVar,strMd5Config]);  }

  if('levelMaintenance' in process.env) levelMaintenance=process.env.levelMaintenance;

  tmp=require('./lib/foundOnTheInternet/sha1.js');
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
  if(typeof argv.loadFrBU!='undefined'){    yield* loadFrBU(flow, argv.loadFrBU);   process.exit(0); return;   }
  //if(typeof argv.loadDataFrBU!='undefined' || typeof argv.loadMetaFrBU!='undefined'){
    //var obj={myMySql:new MyMySql(mysqlPool)};
    //if(typeof argv.loadDataFrBU!='undefined' ){   yield* loadDataFrBU.call(obj, flow, argv.loadDataFrBU); }
    //else if(typeof argv.loadMetaFrBU!='undefined'){   yield* loadMetaFrBU.call(obj, flow, argv.loadMetaFrBU); }
    //obj.myMySql.fin(); 
    //process.exit(0); return;
  //}
    // Do db-query if --sql XXXX was set in the argument
  if(typeof argv.sql!='undefined'){
    if(typeof argv.sql!='string') {console.log('sql argument is not a string'); process.exit(-1); return; }
    var tTmp=new Date().getTime();
    var SetupSql=new SetupSqlT(); yield* SetupSql.doQuery(argv.sql,flow);
    console.log('Time elapsed: '+(new Date().getTime()-tTmp)/1000+' s'); 
    process.exit(0);
  }

  tIndexMod=new Date(); tIndexMod.setMilliseconds(0);

  ETagUri={}; CacheUri={};


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
  StrFilePreCache=['filter.js', 'lib.js', 'libClient.js', 'client.js', 'stylesheets/style.css'];
  StrFilePreCache=StrFilePreCache.concat(StrPako);
  if(boDbg){
    fs.watch('.',function (ev,filename) {
      var StrFile=['filter.js','client.js','libClient.js'];
        //console.log(filename+' changed: '+ev);
      if(StrFile.indexOf(filename)!=-1){
        console.log(filename+' changed: '+ev);
        var flowWatch=( function*(){ 
          var [err]=yield* readFileToCache.call({flow:flowWatch}, filename); if(err) {console.error(err); return; }
        })(); flowWatch.next();
      }
    });
    fs.watch('stylesheets',function (ev,filename) {
      var StrFile=['style.css'];
        //console.log(filename+' changed: '+ev);
      if(StrFile.indexOf(filename)!=-1){
        console.log(filename+' changed: '+ev);
        var flowWatch=( function*(){ 
          var [err]=yield* readFileToCache.call({flow:flowWatch}, 'stylesheets/'+filename); if(err) {console.error(err); return; }
        })(); flowWatch.next();
      }
    });
  }

  CacheUri=new CacheUriT();
  for(var i=0;i<StrFilePreCache.length;i++) {
    var filename=StrFilePreCache[i];
    var [err]=yield* readFileToCache.call({flow:flow}, filename); if(err) {  console.error(err.message);  return;}
  }
  var [err]=yield* writeCacheDynamicJS.call({flow:flow});   if(err) {  console.error(err.message);  return;}
  

  handler=function(req, res){
    req.flow=(function*(){
      if(typeof isRedirAppropriate!='undefined'){ 
        //var tmpUrl=isRedirAppropriate(req); if(tmpUrl) { res.out301(tmpUrl); return; }
        var tmpUrl=isRedirAppropriate(req); if(tmpUrl) { res.out200('The domain name has changed, use: '+tmpUrl+' instead'); return; }
      }
    
      var cookies = parseCookies(req);
      var sessionID;  if('sessionID' in cookies) sessionID=cookies.sessionID; else { sessionID=randomHash();   res.setHeader("Set-Cookie", "sessionID="+sessionID+"; SameSite=Lax"); }  //+ " HttpOnly" 


      var ipClient=getIP(req);
      var redisVarSession=sessionID+'_Main', redisVarCounter=sessionID+'_Counter', redisVarCounterIP=ipClient+'_Counter'; 


        // get intCount
      var semY=0, semCB=0, err, intCount;
      var tmp=redisClient.send_command('eval',[luaCountFunc, 3, redisVarSession, redisVarCounter, redisVarCounterIP, tDDOSBan], function(errT,intCountT){
        err=errT; intCount=intCountT; if(semY) { req.flow.next(); } semCB=1;
      });
      if(!semCB) { semY=1; yield;}
      if(err) {console.error(err); return;}
      if(intCount>intDDOSMax) {res.outCode(429,"Too Many Requests ("+intCount+"), wait "+tDDOSBan+"s\n"); return; }


      var domainName=req.headers.host; 
      var objUrl=url.parse(req.url),  pathNameOrg=objUrl.pathname;
      var wwwReq=domainName+pathNameOrg;

      //if(endsWith(wwwReq,'be.json')) debugger
      
      //var strSite=Site.getSite(wwwReq);
      //if(!strSite){ res.out404("404 Nothing at that url\n"); return; }
      //var site=Site[strSite], wwwSite=site.wwwSite, pathName=wwwReq.substr(wwwSite.length); if(pathName.length==0) pathName='/';


      var wwwSite=domainName, pathName=pathNameOrg;
      

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
      
       

      var objReqRes={req:req, res:res};
      if(pathName.substr(0,5)=='/sql/'){
        //if(!boDbg && !boAllowSql){ res.out200('Set boAllowSql=1 (or boDbg=1) in the config.js-file');  return }
        //var reqSql=new ReqSql(req, res),  SetupSql=new SetupSqlT();
        //req.pathNameWOPrefix=pathName.substr(5);
        //if(req.pathNameWOPrefix=='zip'){       reqSql.createZip(SetupSql);     }
        //else {  reqSql.toBrowser(SetupSql); }
      }
      else {
        if(levelMaintenance){res.outCode(503, "Down for maintenance, try again in a little while."); return;}
        objReqRes.myMySql=new MyMySql(mysqlPool);
        if(pathName=='/'+leafBE){ var reqBE=new ReqBE(objReqRes);  yield* reqBE.go();    }
        //else if(pathName.indexOf('/image/')==0){  yield* reqImage.call(objReqRes);   } //RegExp('^/image/').test(pathName)
        //else if(pathName=='/captcha.png'){    yield* reqCaptcha.call(objReqRes);    }
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
      }
    })(); req.flow.next();
  }



  
  if(boLocal){
    if(typeof TLSData!='undefined' && TLSData instanceof Array && TLSData.length){
      TLSDataExtend.call(TLSData);
      var options = {
        SNICallback: function(domain, cb) {
          console.log('SNI '+domain); 
          //return TLSData.getContext(domain);
          cb(null, TLSData.getContext(domain));
        },
        key: TLSData[0].strKey,
        cert: TLSData[0].strCert  
      }; 
      https.createServer(options, handler).listen(portS);   console.log("Listening to HTTPS requests at port " + portS);
    }
  } 
  http.createServer(handler).listen(port);   console.log("Listening to HTTP requests at port " + port);

})(); flow.next();

