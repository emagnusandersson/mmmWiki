// deno-lint-ignore-file no-var
globalThis.app=globalThis;
app.boDeno="Deno" in app
import * as http from "node:http";
import * as https from 'node:https';
//import tls from 'tls';
import * as url from "node:url";
import * as path from "node:path";
import * as fs from "node:fs";
const fsPromises=fs.promises
//import requestMod from 'request';
import * as myCrypto from 'node:crypto';
import * as zlib from 'node:zlib';
const { gzip } =zlib
import { pipeline } from 'node:stream';
import * as Redis from "redis";
//import Redis from "redis";
import serialize from 'serialize-javascript';
import validator from 'validator';
import mime from "mime";
//import UglifyJS from "uglify-js";
import ejs from "ejs";
import * as mongodb from 'mongodb';
//import * as mongodb  from "https://deno.land/x/mongo/mod.ts";
import mongoSanitize from 'mongo-sanitize';
import * as minimist from "minimist";

import * as dotenv from 'dotenv'
import {Buffer} from "buffer";
import probeImageSize from 'probe-image-size';

  // Deno only imports
// import * as jszip from "jszip";  // Deno
// var { JSZip, readZip, zipDir }=jszip
// import { multiParser } from "multiparser"

  // Node.js only imports
import JSZip from "jszip";
import formidable from "formidable";
import concat from 'concat-stream';
import Streamify from 'streamify-string';
import im from 'imagemagick';
import gmTmp from 'gm';
import temporary from 'tmp';

dotenv.config();
//import {URLPattern} from "urlpattern-polyfill"


// declare global {
//   interface String {
//     padZero(length: number): string;
//   }
//   interface Date {
//     toUnix(): number;
//   }
//   interface Promise<T> {
//     toNBP(): Promise<T>;
//   }
// }
// declare global {
//   interface Date {
//     toUnix(): number;
//     toISOStringMy(): string;
//     toISODateMy(): string;
//     toISOTimeOfDayMy(): string;
//   }
// }

// interface Promise<T> {
//   toNBP(): Promise<any>;
// }
//Promise.prototype.toNBP=function(){   return this.then(a=>{return [null,a];}).catch(e=>{return [e];});   }  // toNodeBackPromise



const extend=Object.assign;
extend(app, {http, url, path, fsPromises, myCrypto, zlib, gzip, pipeline, JSZip, serialize, validator, mime, ejs, mongodb, mongoSanitize, Buffer, probeImageSize }); 

if(boDeno){
  extend(app, { multiParser}); //readZip, 
}else{
  var gm=gmTmp.subClass({ imageMagick: true });
  extend(app, { formidable, concat, Streamify, im, gm, temporary}); 
}

const {MongoClient, ObjectId, Long, Int32} = mongodb;
extend(app, {MongoClient, ObjectId, Long, Int32});


// import * as libTest from './libTest.js';
// libTest.gg()
// console.log(hh)

import * as libA from './lib.js';
import * as libB from './libServerGeneral.js';
import * as libC from './libServer.js';
import * as libD from './lib/foundOnTheInternet/lcs.js';
import * as libE from './lib/foundOnTheInternet/diff.js';
import * as libF from './myDiff.js';
libA.blah(); libB.blah(); libC.blah(); libD.blah(); libE.blah(); libF.blah();
//await import('./lib.js');
// await import('./libServerGeneral.js');
// await import('./libServer.js');
// await import('./lib/foundOnTheInternet/lcs.js');
// await import('./lib/foundOnTheInternet/diff.js');
// await import('./myDiff.js');

const strAppName='mmmWiki';
if(!boDeno){
  app.Deno={
    env:{get:function(str){return process.env[str]}},
    cwd:process.cwd,
    exit:process.exit,
    args:process.argv.slice(2),
    Command:null,
    Conn:null,
    listen:null,
    listenTls:null
  }
}

app.strInfrastructure=Deno.env.get("strInfrastructure")||'local';
const boHeroku=strInfrastructure=='heroku'; 
const boAF=strInfrastructure=='af'; 
const boLocal=strInfrastructure=='local'; 
const boDO=strInfrastructure=='do';

// declare global {
//   var StrValidLoadMeta:Array<string>, StrValidLoadMetaBase:Array<string>, StrImageExt:Array<string>, strImageExtWComma:string, strImageExtWBar:string
// }
var myGlob=app.myGlob=app
myGlob.StrValidLoadMeta=['site.csv', 'page.csv', 'image.csv', 'redirect.csv'];  // ValidLoadMeta calls
myGlob.strValidLoadMetaWComma=myGlob.StrValidLoadMeta.join(", ")
myGlob.StrValidLoadMetaBase=myGlob.StrValidLoadMeta.map((el)=>el.slice(0,-4));  //:string
myGlob.StrImageExt=['jpg','jpeg','png','gif','svg','ico'];
myGlob.strImageExtWComma=myGlob.StrImageExt.join(', ');   myGlob.strImageExtWBar=myGlob.StrImageExt.join('|');
const StrValidMongoDBCalls=['create', 'drop', 'populateSetting', 'truncate', 'truncateAllExceptSetting', 'countRows'];
const helpTextExit=function(){
  const arr=[];
  arr.push(`USAGE script [OPTION]...
  -h, --help          Display this text

  -p, --port [PORT]   Port number (default: 5000)

  --mongodb [MONGODB_ACTION]  Run a mongodb action.
    MONGODB_ACTION=${StrValidMongoDBCalls.join('|')}

  --load [fileOrDirPath]
    Looks for (and loads) pages (txt-files), image-files (${myGlob.strImageExtWComma}), meta-files (csv-files) or zip-files containing the said file formats. (although no zip-files in the zip-files)
    The meta-files must be named any of: ${myGlob.StrValidLoadMeta.join(', ')}.
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
  Deno.exit(0);
}

const minimistParseF=boDeno?minimist.parse:minimist.default
const argv = minimistParseF(Deno.args, {alias: {h:'help', p:'port'}} );  // Perhaps use yargs !? (according to https://www.youtube.com/watch?v=S-_Fx4-nal8)

let StrUnknown=app.AMinusB(Object.keys(argv),['_', 'h', 'help', 'p', 'port', 'mongodb', 'load']);
StrUnknown=[].concat(StrUnknown, argv._);
if(StrUnknown.length){ console.log('Unknown arguments: '+StrUnknown.join(', ')); helpTextExit();}

      
  // Set up redisClient
// let urlRedis=Deno.env.get("REDIS_URL");
// if(  urlRedis ) {
//   app.redisClient=redis.createClient({no_ready_check: true, url: urlRedis, legacyMode: true}); // Since v4 this should be the way to use the interface with legacyMode: true
// }else {
//   //let objConnect={host: 'localhost', port: 6379,  password: 'password'};
//   app.redisClient=redis.createClient({ legacyMode: true});
// }
// await redisClient.connect();

const REDIS_URL="redis://localhost:6379"
//app.redis = new Redis(REDIS_URL);
if(boDeno){
  //app.redis = await Redis.connect({hostname: "127.0.0.1", port: 6379});
  app.redis = await Redis.connect(REDIS_URL);
}else {
  app.redis = Redis.createClient({url:REDIS_URL});
  redis.on('error', err => console.log('Redis Client Error', err));
  await redis.connect();
}


app.port=argv.p||argv.port||5000;
if(argv.h || argv.help) {helpTextExit(); }

  // Default config variables (If you want to change them I suggest you create a file config.js and overwrite them there)
extend(app, {boDbg:0, boAllowSql:1, port, levelMaintenance:0, googleSiteVerification:'googleXXX.html',
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
  strReCaptchaSiteKey:"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",   strReCaptchaSecretKey:"XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  aRPassword:"123", aWPassword:"123",
  RegRedir:[],
  //strJSConsoleKey:'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX'
});




//import * as libG from './config.js';
//const libG=await import('./config.js')
// libG.blah();


let strConfig;
if(boHeroku){ 
  if(!Deno.env.get("jsConfig")) { console.error(Error('jsConfig-environment-variable is not set')); Deno.exit(-1);}
  strConfig=Deno.env.get("jsConfig")||'';
}
else{
  let [err, buf]=await fsPromises.readFile('./config.js').toNBP();    if(err) {console.error(err); Deno.exit(-1);}
  strConfig=buf.toString();
  //await import('./config.js');    //await import('./config.example.js');
} 
function tseval (code) { //:string
  return import('data:application/javascript,' + encodeURIComponent(code));
}
   // Detecting if the config-file has changed since last time (might be useful to speed up things when the program is auto started)
const strMd5Config=app.md5(strConfig);
//var p=tseval("console.log('g')")
await tseval(strConfig);
if(typeof app.strSalt=='undefined') {console.error("typeof app.strSalt=='undefined'"); Deno.exit(-1); }

var redisVar=`str${ucfirst(strAppName)}Md5Config`;
//var [err,tmp]=await cmdRedis('GET',[redisVar]); if(err) {console.error(err); Deno.exit(-1);}
var [err,tmp]=await getRedis(redisVar); if(err) {console.error(err); Deno.exit(-1);}

//var [err,tmp]=await cmdRedis('GET',[redisVar]);
const boNewConfig=strMd5Config!==tmp; 
//if(boNewConfig) { let [err,tmp]=await cmdRedis('SET',[redisVar,strMd5Config]);   if(err) {console.error(err); Deno.exit(-1);}      }
if(boNewConfig) { let [err,tmp]=await setRedis(redisVar,strMd5Config);   if(err) {console.error(err); Deno.exit(-1);}      }

//declare global{let levelMaintenance}
if('levelMaintenance' in Deno.env) levelMaintenance=Deno.env.get("levelMaintenance");

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


const urlMongo = 'mongodb://127.0.0.1:27017';
app.mongoClient=undefined;
var err, Arg=[urlMongo]; //, { useUnifiedTopology: true}
// app.mongoClientInst=new MongoClient()
// var [err, result]=await mongoClientInst.connect(...Arg).toNBP();  if(err) {console.log(err); Deno.exit(-1);}
// mongoClient=result;
// app.dbo = mongoClientInst.database("mmmWiki");
// globalThis.addEventListener('unload', function(){  console.log('globalThis unload event, Good bye!'); mongoClientInst.close();});

var [err, result]=await MongoClient.connect(...Arg).toNBP();  if(err) {console.log(err); Deno.exit(-1);}
mongoClient=result;
app.dbo = mongoClient.db("mmmWiki");
if(boDeno){
  globalThis.addEventListener('unload', function(){  console.log('globalThis unload event, Good bye!'); mongoClient.close();});
}else{
  process.on('exit', function(){  console.log('exit event on process Good bye!'); mongoClient.close();});
}

app.NameCollection=Object.keys(app.InitCollection);

  // Check if Page collection exists, if so, assume that the other collections exists.
var [err, result]=await dbo.command({ listCollections: 1, filter:{name:"Page"}}).toNBP();   if(err) {console.log(err);Deno.exit(-1); }
if(result!=null){
  for(let nameCollection of NameCollection){ app["collection"+nameCollection]=dbo.collection(nameCollection); }
}

if(boNewConfig) { 
  
}

//let SiteName=[strDBPrefix]; // To make the code analog to my other programs :-)

    // Load fr BU-folder
if(typeof argv.load!='undefined'){
  //let load=argv.load; if(load===true) load=
  const setupMongo=new SetupMongo();
  var [err]=await setupMongo.doQuery("create");
  console.log('loadFrBUFolderOnServ')
  console.log('====================')
  var [err]=await loadFrBUFolderOnServ(argv.load); if(err) {console.error(err); Deno.exit(-1);} 
  console.log('done loading');
  Deno.exit(0);
}
  // Do db-query if --mongodb XXXX was set in the argument
if(typeof argv.mongodb!='undefined'){
  const strMongo=argv.mongodb;
  if(typeof strMongo!='string') {console.log('mongodb argument is not a string'); Deno.exit(-1); }
  if(StrValidMongoDBCalls.indexOf(strMongo)==-1){
    let tmp=strMongo+' is not valid input, try any of these: '+StrValidMongoDBCalls.join(', ');
    console.error(tmp);  Deno.exit(0);
  }

  let tTmp=new Date().getTime();
  const setupMongo=new SetupMongo();
  let [err]=await setupMongo.doQuery(strMongo); if(err) {console.error(err); Deno.exit(-1);} 
  console.log('Time elapsed: '+(new Date().getTime()-tTmp)/1000+' s'); 
  Deno.exit(0);
}

//app.tIndexMod=nowSFloored();



const regexpLib=RegExp('^/(stylesheets|lib|Site)/');
const regexpLooseJS=RegExp('^/(lib|libClient|client|filter|common)\\.js'); //siteSpecific
const regexpImage=RegExp(`^/[^/]*\\.(${myGlob.strImageExtWBar})$`,'i');
const regexpVideo=RegExp('^/[^/]*\\.(mp4|ogg|webm)$','i');

const regexpHerokuDomain=RegExp("\\.herokuapp\\.com$");
const regexpAFDomain=RegExp("\\.af\\.cm$");  


// let StrPako=['pako', 'pako_deflate', 'pako_inflate'], strMin=1?'':'.min'; //boDbg
// for(let i=0;i<StrPako.length;i++){
//   StrPako[i]=`bower_components/pako/dist/${StrPako[i]}${strMin}.js`;
// }
// const regexpPakoJS=RegExp('^/bower_components/pako/dist/pako(|_deflate|_inflate)'); //siteSpecific

  // Creating CacheUri
app.CacheUri=new CacheUriT();

  // PreCaching files
let StrFilePreCache=['filter.js', 'lib.js', 'libClient.js', 'client.js', 'stylesheets/style.css', 'lib/foundOnTheInternet/zip.js', 'lib/foundOnTheInternet/sha1.js', 'lib/foundOnTheInternet/jszip.js'];
//StrFilePreCache=StrFilePreCache.concat(StrPako);
for(let i=0;i<StrFilePreCache.length;i++) {
  let filename=StrFilePreCache[i];
  let [err]=await CacheUri.readFileToCache(filename); if(err) {  console.error(err.message);  Deno.exit(-1);}
}

  // Write leafCommon to Cache
var buf=createCommonJS();
var [err]=await CacheUri.set(leafCommon, buf, 'js', true, true);   if(err) {  console.error(err.message);  Deno.exit(-1);}

if(boDbg){
  fs.watch('.', makeWatchCB('.', ['filter.js', 'client.js', 'libClient.js', 'lib.js']) );
  fs.watch('stylesheets', makeWatchCB('stylesheets', ['style.css']) );

}

  // Write manifest to Cache
var [err]=await createManifestNStoreToCacheFrDB(); if(err) {console.error(err.message); Deno.exit(-1);} 


  // Read index template and do some initial insertions of data, then calc its hash.
var [err, buf]=await fsPromises.readFile('views/index.html').toNBP();   if(err) {console.error(err); Deno.exit(-1);}
app.strIndexTemplate=buf.toString();


let FlJS=['filter.js', 'lib.js', 'libClient.js', 'client.js', leafCommon];
for(let i=0;i<FlJS.length;i++) { 
  let pathTmp=FlJS[i], vTmp=CacheUri[pathTmp].strHash, varName='u'+ucfirst(pathTmp.slice(0,-3));
  app.strIndexTemplate=strIndexTemplate.replace(RegExp(`<%=${varName}%>`), `<%=uSiteCommon%>/${pathTmp}?v=${vTmp}`);
}
var pathTmp='stylesheets/style.css', vTmp=CacheUri[pathTmp].strHash;
app.strIndexTemplate=strIndexTemplate.replace(/<%=uStyle%>/, `<%=uSiteCommon%>/${pathTmp}?v=${vTmp}`);
app.strHashTemplate=app.md5(strIndexTemplate);

var redisVar=strAppName+'_IndexTemplateHash';
let luaIndexTemplateHashTestNSetFun=`local strHash=redis.call('GET',KEYS[1]);     if(strHash==ARGV[1]) then return 1; else redis.call('SET',KEYS[1],ARGV[1]); return 0; end;`;
var [err, boHashTemplateMatch]=await evalRedis(luaIndexTemplateHashTestNSetFun, [redisVar], [strHashTemplate]);
if(err){console.error(err); Deno.exit(-1);}

if(!boHashTemplateMatch){
  let Arg=[{boOR:true }, [{ $set: { tModCache: new Date(0), strHash:'template changed' } }]];
  let [err, result]=await collectionPage.updateMany( ...Arg).toNBP();   if(err) {console.error(err); Deno.exit(-1);}
}


const objCookiePropProt={"HttpOnly":1, Path:"/", "Max-Age":3600*24*30, "SameSite":"Lax"};
if(!boLocal || boUseSelfSignedCert) objCookiePropProt["Secure"]=1;
var oTmp=extend({},objCookiePropProt); 
oTmp["SameSite"]="None"; app.strCookiePropNormal=";"+arrayifyCookiePropObj(oTmp).join(';');
oTmp["SameSite"]="Lax"; app.strCookiePropLax=";"+arrayifyCookiePropObj(oTmp).join(';');
oTmp["SameSite"]="Strict"; app.strCookiePropStrict=";"+arrayifyCookiePropObj(oTmp).join(';');

var oTmp=extend({},objCookiePropProt); 
oTmp["Max-Age"]=maxAdminRUnactivityTime; var str1=";"+arrayifyCookiePropObj(oTmp).join(';');
oTmp["Max-Age"]=0; var str0=";"+arrayifyCookiePropObj(oTmp).join(';');
app.StrSessionIDRProp=[str0,str1];
oTmp["Max-Age"]=maxAdminWUnactivityTime; var str1=";"+arrayifyCookiePropObj(oTmp).join(';');
oTmp["Max-Age"]=0; var str0=";"+arrayifyCookiePropObj(oTmp).join(';');
app.StrSessionIDWProp=[str0,str1];



app.luaDDosCounterFun=`local c=redis.call('INCR',KEYS[1]); redis.call('EXPIRE',KEYS[1], ARGV[1]); return c`
//redis.defineCommand("myDDosCounterFun", { numberOfKeys: 1, lua: luaDDosCounterFun });

app.luaGetNExpire=`local c=redis.call('GET',KEYS[1]); redis.call('EXPIRE',KEYS[1], ARGV[1]); return c`;
//redis.defineCommand("myGetNExpire", { numberOfKeys: 1, lua: luaGetNExpire });

class ReqMy{
  constructor(){
    if(boDeno){
      var [requestEvent, conn]=arguments
      if(!requestEvent) debugger
      this.requestEvent=requestEvent;
      var req=requestEvent.request
      this.conn=conn;
    } else{
      var [req, res]=arguments
      this.res=res;
      this.conn=req.connection;
      req.headers.get=function(str){return req.headers[str];}
    }
    this.req=req;
    this.cookies = parseCookies(req);
    this.outCookies={}; this.outHeaders={};
    this.outCodeN=200;  this.boResponseSent=false
  }

  //setOutHeader=function(k:string,v:string){this.outHeaders[k]=v;}
  statusOut=function(code){this.outCodeN=code; return this;}
  setOutHeader=function(obj){
    if(typeof obj=='string') {
      if(arguments.length!=2) {console.error('arguments.length!=2'); Deno.exit(-1)}
      let [k,v]=arguments
      if(typeof v=='number') v=v.toString()
      if(typeof v!='string') {console.error(typeof v!='string'); Deno.exit(-1)}
      obj={[k]:v}
    }
    for(const k in obj){
      this.outHeaders[k]=obj[k];
    }
    return this;
  }
  removeOutHeader=function(k){delete this.outHeaders[k]; return this;}
  end=function(str=null){ //:any
    if(boDeno){
      //if(this.outCodeN==304) debugger
      this.res=new Response(str, {status:this.outCodeN});
      this.setHeaderActual()
      this.setCookiesActual()
      if(this.boResponseSent) {debugger; console.error(new Error('boResponseSent==true?!?!?'))}
      this.requestEvent.respondWith(this.res);
    }else{
      // const headers = new Headers(this.outHeaders);
      // this.res.setHeaders(headers);
      const o=this.outCookies, arrT=[];
      for(var k in o) {arrT.push(`${k}=${o[k]}`);}
      this.res.setHeader('Set-Cookie', arrT);
      this.res.writeHead(this.outCodeN, this.outHeaders);
      if(str===null || typeof str=='string' || (typeof str=='object' && !str.pipe)) {
        this.res.end(str)
      } else {
        //if(!('pipe' in str)) debugger
        str.pipe(this.res)
      }
    } 
    this.boResponseSent=true
    
  }
  //sendResponse=function(){this.requestEvent.respondWith(this.res); this.boResponseSent=true}

  setHeaderActual=function(){ const o=this.outHeaders; for(var k in o) {this.res.headers.append(k,o[k]);}}
  setCookiesActual=function(){
    const o=this.outCookies;
    for(var k in o) {this.res.headers.append("Set-Cookie", `${k}=${o[k]}`);}
  }
  clearHeaders=function(){
    this.outHeaders={}; this.outCookies={}; return this
  }
    
  outCode=function(status, str=''){
    this.statusOut(status)
    //if(str) this.setOutHeader("Content-Type", StrMimeType.txt)
    this.end(str)
  }
  out200=function(str){ this.clearHeaders().outCode(200, str); }
  out201=function(str){ this.clearHeaders().outCode(201, str); }
  out204=function(str){ this.clearHeaders().outCode(204, str); }
  //out301=function(url){ const res= new Response('', { status:301 });  res.headers.append("Location", url);   this.requestEvent.respondWith(res); }
  out301=function(url){ this.clearHeaders().setOutHeader("Location", url).outCode(301); }
  out301Loc=function(url){ this.clearHeaders().out301('/'+url) }
  out304=function(){ 
    this.outCode(304, null); } //.clearHeaders()
  out403=function(){ this.clearHeaders().outCode(403, "403 Forbidden\n"); }
  out404=function(str="404 Not Found\n"){ this.clearHeaders().outCode(404, str); }
  out500=function(e){
    debugger
    if(e instanceof Error) {var mess=e.name + ': ' + e.message; console.error(e);} else {var mess=e; console.error(mess);}
    this.clearHeaders().outCode(500, mess+ "\n");
  }
  out501=function(){ this.clearHeaders().outCode(501, "Not implemented\n");   }
}

//const handler=async function(req, res){
//const handler=async function(requestEvent: Deno.RequestEvent, conn:Deno.Conn){
const handler=async function(){

  var reqMy=new ReqMy(...arguments);

  const {req, cookies}=reqMy
  
  //if(boDbg) console.log(req.method+' '+req.url);
  

  let objUrlOld=url.parse(req.url);

  let uTmp=boDeno?req.url:`https://${req.headers.host}${req.url}`
  let objUrl=new URL(uTmp), objQS=objUrl.searchParams;
  //let blah=objQS.get('blah')||'';
  if(typeof isRedirAppropriate!='undefined'){ 
    //let tmpUrl=isRedirAppropriate(req); if(tmpUrl) { reqMy.out301(tmpUrl); return; }
    let tmpUrl=isRedirAppropriate(objUrl); if(tmpUrl) { reqMy.out200(`The domain name has changed, use: ${tmpUrl} instead`); return; }
  }

  //reqMy.setOutHeader("X-Frame-Options", "deny");  // Deny for all (note: this header is removed for images (see reqMediaImage) (should also be removed for videos))
  reqMy.setOutHeader("Content-Security-Policy", "frame-ancestors 'none'");  // Deny for all (note: this header is removed in certain requests)
  reqMy.setOutHeader("X-Content-Type-Options", "nosniff");  // Don't try to guess the mime-type (I prefer the rendering of the page to fail if the mime-type is wrong)
  if(!boLocal || boUseSelfSignedCert) reqMy.setOutHeader("Strict-Transport-Security", "max-age="+3600*24*365); // All future requests must be with https (forget this after a year)
  reqMy.setOutHeader("Referrer-Policy", "origin");  //  Don't write the refer unless the request comes from the origin
  


  var domainName=req.headers.get('host')
  
  let pathNameOrg=objUrl.pathname;
  let wwwReq=domainName+pathNameOrg;
  
  let wwwSite=domainName, pathName=pathNameOrg;

  if(boDbg) console.log(req.method+' '+pathName);

  
    //
    // DDOS Checking
    //

    // Assign boCookieDDOSCameNExist
  let boCookieDDOSCameNExist=false;
  let {sessionIDDDos=null}=cookies, redisVarDDos;
  if(sessionIDDDos) {
    redisVarDDos=sessionIDDDos+'_DDOS';
    //let [err, tmp]=await cmdRedis('EXISTS', redisVarDDos); boCookieDDOSCameNExist=tmp;
    let [err, tmp]=await existsRedis(redisVarDDos); boCookieDDOSCameNExist=tmp;
  }
    // If !boCookieDDOSCameNExist then create a new sessionIDDDos (and redisVarDDos).
  if(!boCookieDDOSCameNExist) { sessionIDDDos=randomHash();  redisVarDDos=sessionIDDDos+'_DDOS'; }
    // Update redisVarDDos counter
  var [err, intCount]=await evalRedis(luaDDosCounterFun, [redisVarDDos], [tDDOSBan]);
    // Write to response
  //res.replaceCookie("sessionIDDDos="+sessionIDDDos+strCookiePropNormal);
  reqMy.outCookies.sessionIDDDos=sessionIDDDos+strCookiePropNormal


    // Update redisVarDDosIP counter
  let ipClient=getIP(reqMy), redisVarDDosIP=ipClient+'_DDOS';
  var [err, intCountIP]=await evalRedis(luaDDosCounterFun, [redisVarDDosIP], [tDDOSIPBan]);
  
    // Determine which DDOS counter to use
  // if(boCookieDDOSCameNExist) {  var intCountT=intCount, intDDOSMaxT=intDDOSMax, tDDOSBanT=tDDOSBan;   }
  // else{  var intCountT=intCountIP, intDDOSMaxT=intDDOSIPMax, tDDOSBanT=tDDOSIPBan;   }
  let [intCountT, intDDOSMaxT, tDDOSBanT]=boCookieDDOSCameNExist?[intCount, intDDOSMax, tDDOSBan]:[intCountIP, intDDOSIPMax, tDDOSIPBan]
  
    // If the counter is to high, then respond with 429
  if(intCountT>intDDOSMaxT) {
    let strMess=`Too Many Requests (${intCountT}), wait ${tDDOSBanT}s\n`;
    if(pathName=='/'+leafBE){ let reqBE=new ReqBE({reqMy}); reqBE.mesEO(strMess, 429); }
    else reqMy.outCode(429, strMess);
    return;
  }
  

  // if('sessionIDStrict' in cookies) {
  //   let luaCountFunc=`local c=redis.call('GET',KEYS[1]); redis.call('EXPIRE',KEYS[1], ARGV[1]); return c`;
  //   let [err,value]=await cmdRedis('EVAL',[luaCountFunc, 1, cookies.sessionIDStrict, maxAdminRUnactivityTime]);
  //   req.boCookieStrictOK=number(value);
  // }

    // Set mimetype if the extention is recognized
  let regexpExt=RegExp('\.([a-zA-Z0-9]+)$');
  let Match=pathName.match(regexpExt), strExt; if(Match) strExt=Match[1];
  if(strExt in StrMimeType) reqMy.setOutHeader('Content-type', StrMimeType[strExt]);

  


  
  let boTLS=false;
  if(boHeroku || boAF){
    const strHead=req.headers.get('x-forwarded-proto')
    if(strHead=='https') boTLS=true;
  }
  else if(boDO) { boTLS=true; }
  else if(boLocal) { if(app.boUseSelfSignedCert) boTLS=true;}


  //if(boLocal && 'encrypted' in req.connection) boTLS=true;
  


  let strScheme='http'+(boTLS?'s':''),   strSchemeLong=strScheme+'://';

  //extend(req, {wwwSite, objUrl:objUrlOld, boTLS, strSchemeLong, pathName});
  extend(reqMy, {objUrl, strSchemeLong, boTLS, wwwSite, pathName}); 
  
  
  if(levelMaintenance){reqMy.outCode(503, "Down for maintenance, try again in a little while."); return;}
  //let objReqRes={req, res};
  let objReqRes={reqMy};

  //if(pathName=='/'+leafPageLoadBE){ var reqPageLoadBE=new ReqPageLoadBE(objReqRes);  await reqPageLoadBE.go();    }
  if(pathName=='/'+leafBE){ var reqBE=new ReqBE(objReqRes);  await reqBE.go();    }
  //else if(pathName.indexOf('/image/')==0){  await reqImage.call(objReqRes);   } //RegExp('^/image/').test(pathName)
  else if(regexpLib.test(pathName) || regexpLooseJS.test(pathName) || pathName=='/conversion.html' || pathName=='/'+leafManifest){
    if(pathName=='/'+leafManifest) reqMy.boSiteDependant=1;
    await reqStatic.call(objReqRes);   
  } //|| regexpPakoJS.test(pathName)
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
  else if(pathName=='/debug'){    debugger;  reqMy.end();}
  else if(pathName=='/mini'){
    let tserver=(new Date()).valueOf();  
    resMy.end(`<script>let tserver=${tserver}, tclient=(new Date()).valueOf(); console.log('tserver: '+tserver/1000);console.log('tclient: '+tclient/1000);console.log('tdiff: '+(tclient-tserver)/1000);</script>`);
  }
  else if(pathName=='/timeZoneTest'){let dateTrash=new Date();  res.end(''+dateTrash.getTimezoneOffset());}
  else if(pathName=='/'+googleSiteVerification) reqMy.end('google-site-verification: '+googleSiteVerification);
  else { await reqIndex.call(objReqRes);   }
  
}

if(boDeno){


  // async function serveHttp(conn: Deno.Conn) {
  //   // This "upgrades" a network connection into an HTTP connection.
  //   const httpConn = Deno.serveHttp(conn);
  //   // Each request sent over the HTTP connection will be yielded as an async
  //   // iterator from the HTTP connection.
  //   for await (const requestEvent of httpConn) {
  //     // The native HTTP server uses the web standard `Request` and `Response`
  //     // objects.

  //     handler(requestEvent)
  //   }
  // }

  async function serveHttp(conn) { //: Deno.Conn
    const httpConn = Deno.serveHttp(conn);
    for await (const requestEvent of httpConn) {
    //while(1){
      //var requestEvent=await httpConn.nextRequest();
      //var [err, requestEvent]= await httpConn.nextRequest().toNBP(); if(err) break;
      //var reqMy=new ReqMy(requestEvent, conn);
      handler(requestEvent, conn)
      // var [err,res]=await requestEvent.respondWith(response).toNBP(); if(err) break;
    }
    //return [err];
  }
  // interface Promise<T> {
  //   toNBP(): Promise<any>;
  // }
  Promise.prototype.toNBP=function(){   return this.then(a=>{return [null,a];}).catch(e=>{return [e];});   }  // toNodeBackPromise

  //let boUseSelfSignedCert=1// app.port=5000
  let server
  if(boUseSelfSignedCert){
    server = Deno.listenTls({port, certFile:"./0SelfSignedCert/server.cert", keyFile:"./0SelfSignedCert/server.key"});
  }else{
    //app.port=5000
    server = Deno.listen({ port });
  }
  console.log(`HTTP${boUseSelfSignedCert?'S':''} webserver running on port ${port}`);

  // Connections to the server will be yielded up as an async iterable.
  for await (const conn of server) {
    // In order to not be blocking, we need to handle each connection individually
    // without awaiting the function
    if(boDbg) console.log('got conn');
    serveHttp(conn);
  }
  // while(1){
  //   var [err, conn]= await server.accept().toNBP(); if(err) break;
  //   console.log('got conn');
  //   var [err]=await serveHttp(conn); if(err) break;
  // }
  //if(err) {console.error(err); }

}else{
  if(boUseSelfSignedCert){
    //const options = { key: fs.readFileSync('0SelfSignedCert/server.key'), cert: fs.readFileSync('0SelfSignedCert/server.cert') };

    var [err, buf]=await fsPromises.readFile('0SelfSignedCert/server.key').toNBP(); if(err) {console.error(err); Deno.exit(-1);}
    var key=buf.toString();
    var [err, buf]=await fsPromises.readFile('0SelfSignedCert/server.cert').toNBP(); if(err) {console.error(err); Deno.exit(-1);}
    var cert=buf.toString();
    const options= {key, cert};
    https.createServer(options, handler).listen(port);   console.log("Listening to HTTPS requests at port " + port);
  } else{
    http.createServer(handler).listen(port);   console.log("Listening to HTTP requests at port " + port);
  }
}

