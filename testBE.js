
http = require("http");
util =  require('util');
crypto = require('crypto');
//neo4j = require('neo4j-driver').v1;
neo4j = require('neo4j');
mongodb = require('mongodb');  MongoClient = mongodb.MongoClient;
gm =  require('gm').subClass({ imageMagick: true });
path = require("path");
fs = require("fs");
extend=util._extend;
require('./lib.js');
require('./libServerGeneral.js');
require('./libServer.js');
require('./lib/foundOnTheInternet/lcs.js');
require('./lib/foundOnTheInternet/diff.js');
require('./myDiff.js');
require('./libNeo4j.js');
require('./testLib.js');

app=(typeof window==='undefined')?global:window;

vPassword=aPassword='123'; strSalt='abc'
tmp=require('./lib/foundOnTheInternet/sha1.js');
require('./filterServer.js'); 
require('./variablesCommon.js');
require('./libReqBE.js');
require('./libReq.js'); 
require('./parser.js'); 
require('./parserTable.js'); 

process.on('exit', function (){
  //driverNeo4j.close();
  console.log('Goodbye!');
});
//var driverNeo4j = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "jh10k"));
//sessionNeo4j = driverNeo4j.session();

dbNeo4j = new neo4j.GraphDatabase('http://neo4j:jh10k@localhost:7474');

// node --inspect --debug-brk testNeo4j.js --gengetInfoNDataNeo
// node --inspect --debug-brk testNeo4j.js --gensaveByReplaceNeo --dataabc,link:starta,link:startd
// node --inspect --debug-brk testNeo4j.js --gensaveByAddNeo  --pagestart --dataabclink:template:ttt,link:starta,mm,link:template:tttt,
// node --inspect --debug-brk testNeo4j.js --gensaveByAddNeo  --pagestart --dataabclink:template:tt,link:template:ttt,link:starta,mm,link:template:tttt,
// node --inspect --debug-brk testNeo4j.js --gensaveByAddNeo  --pagetemplate:tt --dataabc
// node --inspect --debug-brk testNeo4j.js --gensaveByAddNeo  --pagetemplate:ttt --dataabc
// node --inspect --debug-brk testNeo4jBEReq.js --pageLoad  

var myArg=process.argv.slice(2);
for(var i=0;i<myArg.length;i++){
  var Match=RegExp("^(-{1,2})([^-\\s]+)$").exec(myArg[i]);
  if(Match[1]=='-') {
    var tmp=Match[2][0];
    if(tmp=='p') port=Match[2].substr(1);
    else if(tmp=='h') helpTextExit();
  }else if(Match[1]=='--') {
    var tmpArg=Match[2]; 
    var MatchA=/^gen(.*)/.exec(tmpArg);  if(MatchA) strGenerator=MatchA[1];
    var MatchA=/^www(.*)/.exec(tmpArg);  if(MatchA) www=MatchA[1];
    var MatchA=/^page(.*)/.exec(tmpArg);  if(MatchA) strName=MatchA[1];
    var MatchA=/^data(.*)/.exec(tmpArg);  if(MatchA) strEditText=MatchA[1];
    
    else if(tmp=='help') helpTextExit();
  }
}

if(typeof strGenerator=='undefined') strGenerator='setNewCache';
if(typeof www=='undefined') www='localhost:5000';
if(typeof strName=='undefined') strName='start';
if(typeof strEditText=='undefined') strEditText='abc,link:starta,link:startb';
boTLS=false;

//var regLink=new RegExp('link:([a-zA-Z:]+)','g'); 
StrNewLink=[];
//var match = regLink.exec(strEditText);
//while (match != null) {  StrNewLink.push(match[1]);       match = regLink.exec(strEditText);  }

StrSubImage=[];
console.log(strGenerator);
strHtmlText=strEditText;

headers={'if-none-match':'', "if-modified-since":0};
req={method:'GET', boTLS:boTLS, www:www, headers:headers};  //, objUrl:objUrl, strSchemeLong:strSchemeLong, pathName:pathName

tmpf=function(){};
//thisObj={req:req, res:res, queredPage:strName, GRet:{}, mesEO:tmpf, tModBrowser:(new Date()).toUnix(), Str:[], boVLoggedIn:1, boALoggedIn:1};

objArg={boTLS:boTLS, www:www, strName:strName, strEditText:strEditText, strHtmlText:strHtmlText, requesterCacheTime:0, StrNewLink:StrNewLink, StrSubImage:StrSubImage, boOR:true, boOW:true, boSiteMap:true, summary:'myEdit', signature:'me', aPassword:'123'}



generatorWrap=function*(){
  
  var urlMongo = 'mongodb://localhost:27017/myproject';
  dbMongo=null;
  var err;
  MongoClient.connect(urlMongo, function(errT, dbT) {err=errT; dbMongo=dbT;  flow.next();  });  yield;
  if(err) {console.log(err); return; }
  
  //var objT=yield* readFilterQueriesFile(flow);   if(objT.err) console.log(objT.err);   objCqlFilter=objT.objCqlFilter;
  filterQueries=new FilterQueries();  var objT=yield* filterQueries.readQueryFile(flow);  if(objT.err) console.log(objT.err);
  myNeo4j=new MyNeo4j();
  
  req=extend(req, {flow:flow, sessionID:0});
  var reqBE=new ReqBE(req, res); extend(reqBE,{queredPage:strName, GRet:{}, mes:tmpf, mesO:tmpf, mesEO:tmpf, tModBrowser:(new Date()).toUnix(), boVLoggedIn:1, boALoggedIn:1})
  if(strGenerator=='pageLoad'){
    var objT=yield* reqBE[strGenerator](objArg); 
  }else if(strGenerator=='saveByReplace'){
    var objT=yield* reqBE[strGenerator](objArg); 
  }else if(strGenerator=='saveByAdd'){
    var objT=yield* reqBE[strGenerator](objArg);
  }else if(strGenerator=='pageCompare'){
    objArg.arrVersionCompared=[1,2];  var objT=yield* reqBE[strGenerator](objArg);
  }else if(strGenerator=='getPreview'){
    var objT=yield* reqBE[strGenerator](objArg);
  }else if(strGenerator=='getPageInfo'){
    extend(objArg,{strKeyDefault:'a45d', objName:{'a45d':['start','starta','startb'],'abc':['start','starta','startb']}});   var objT=yield* reqBE[strGenerator](objArg);
  }else if(strGenerator=='getImageInfo'){
    //extend(objArg,{arrName:['oak.jpg','maple.jpg']});
       var objT=yield* reqBE[strGenerator](objArg);
  }else if(strGenerator=='myChMod'){
    extend(objArg,{File:['Z91YJJD0bSx9r0QA','So9yR8W2iy2hHgAO'], boOR:1});   var objT=yield* reqBE[strGenerator](objArg);
  }else if(strGenerator=='myChModImage'){
    extend(objArg,{File:['94b3aced1f20f4408a902e12','366ed9f3a6028ba39190e452'], boOther:1});   var objT=yield* reqBE[strGenerator](objArg);
  }else if(strGenerator=='deletePage'){
    extend(objArg,{File:['Z91YJJD0bSx9r0QA','So9yR8W2iy2hHgAO']});   var objT=yield* reqBE[strGenerator](objArg);
  }else if(strGenerator=='deleteImage'){
    extend(objArg,{File:['94b3aced1f20f4408a902e12','366ed9f3a6028ba39190e452']});   var objT=yield* reqBE[strGenerator](objArg);
  }else if(strGenerator=='renamePage'){
    extend(objArg,{id:'Z91YJJD0bSx9r0QA', strNewName:'Oak'});   var objT=yield* reqBE[strGenerator](objArg);
  }else if(strGenerator=='renameImage'){
    extend(objArg,{id:'94b3aced1f20f4408a902e12', strNewName:'Oak'});   var objT=yield* reqBE[strGenerator](objArg);
  }else if(strGenerator=='getParent'){
    extend(objArg,{idPage:'Z91YJJD0bSx9r0QA'});   var objT=yield* reqBE[strGenerator](objArg);
  }else if(strGenerator=='getParentOfImage'){
    extend(objArg,{idImage:'94b3aced1f20f4408a902e12'});   var objT=yield* reqBE[strGenerator](objArg);
  }else if(strGenerator=='getSingleParentExtraStuff'){
    extend(objArg,{idPage:'GO8jGCUSYLMUJ88Y'});   var objT=yield* reqBE[strGenerator](objArg);
  }else if(strGenerator=='siteTabGet'){
    extend(objArg,{});   var objT=yield* reqBE[strGenerator](objArg);
  }else if(strGenerator=='siteTabSet'){
    var tmp='SqrhrW5'; extend(objArg,{idSite:tmp, siteName:tmp, boUpd:true, googleAnalyticsTrackingID:'gogo', urlIcon16:'', urlIcon200:''});   var objT=yield* reqBE[strGenerator](objArg);
  }else if(strGenerator=='siteTabDelete'){
    extend(objArg,{siteName:'SqrhrW5'});   var objT=yield* reqBE[strGenerator](objArg);
  }else if(strGenerator=='siteTabSetDefault'){
    extend(objArg,{idSite:'SqrhrW5'});   var objT=yield* reqBE[strGenerator](objArg);
  }else if(strGenerator=='getPageList'){
    var arg={"Filt":[[['GO8jGCUSYLMUJ88Y'],1], [[],0], [0,8], [[],0], [[],0], [[],0], [[],0], [[],0], [[],0], [0,12], [0,12]]};
    extend(objArg,arg);   var objT=yield* reqBE['setUpPageListCond'](objArg);
    extend(objArg,arg);   var objT=yield* reqBE[strGenerator]({});
  }else if(strGenerator=='getImageList'){
    var arg={"Filt":[[[],0],[['So9yR8W2iy2hHgAO'],1],[0,11],[0,12],[[],0]]};
    extend(objArg,arg);   var objT=yield* reqBE['setUpImageListCond'](objArg);
    extend(objArg,arg);   var objT=yield* reqBE[strGenerator]({});
  }else if(strGenerator=='getPageHist'){
    var arg={"Filt":[[['GO8jGCUSYLMUJ88Y'],1], [[],0], [0,8], [[],0], [[],0], [[],0], [[],0], [[],0], [[],0], [0,12], [0,12]]};
    extend(objArg,arg);   var objT=yield* reqBE['setUpPageListCond'](objArg);
    extend(objArg,arg);   var objT=yield* reqBE[strGenerator]({});
  }else if(strGenerator=='getImageHist'){
    var arg={"Filt":[[[],0],[['So9yR8W2iy2hHgAO'],1],[0,11],[0,12],[[],0]]};
    extend(objArg,arg);   var objT=yield* reqBE['setUpImageListCond'](objArg);
    extend(objArg,arg);   var objT=yield* reqBE[strGenerator]({});
  }else if(strGenerator=='uploadAdminFS'){
    var arg={};
    extend(objArg,arg);   var objT=yield* reqBE[strGenerator]({});
  }else{console.log('no such generator');}
  
  console.log(objT);
}
flow=generatorWrap(); flow.next();
//flow=app[strGenerator](objArg); flow.flow=flow; flow.next();
