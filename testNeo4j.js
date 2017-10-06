
http = require("http");
util =  require('util');
crypto = require('crypto');
mongodb = require('mongodb');  MongoClient = mongodb.MongoClient;
neo4j = require('neo4j-driver').v1;
//neo4j = require('neo4j');
path = require("path");
fs = require("fs");
extend=util._extend;
require('./lib.js');
require('./libServerGeneral.js');
require('./libServer.js');
require('./libNeo4j.js');
//require('./libNeo4jImage.js');

app=(typeof window==='undefined')?global:window;

require('./parser.js'); 
require('./parserTable.js'); 


process.on('exit', function (){
  console.log('Goodbye!');
});

//dbNeo4j = new neo4j.GraphDatabase('http://neo4j:jh10k@localhost:7474');
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "jh10k"));
sessionNeo4j = driver.session();

// node --inspect --debug-brk testNeo4j.js --gengetInfoNDataNeo
// node --inspect --debug-brk testNeo4j.js --gensaveByReplaceNeo --dataabc,link:starta,link:startd
// node --inspect --debug-brk testNeo4j.js --gensaveByAddNeo  --pagestart --dataabclink:template:ttt,link:starta,mm,link:template:tttt,
// node --inspect --debug-brk testNeo4j.js --gensaveByAddNeo  --pagestart --dataabclink:template:tt,link:template:ttt,link:starta,mm,link:template:tttt,
// node --inspect --debug-brk testNeo4j.js --gensaveByAddNeo  --pagetemplate:tt --dataabc
// node --inspect --debug-brk testNeo4j.js --gensaveByAddNeo  --pagetemplate:ttt --dataabc

var myArg=process.argv.slice(2);
for(var i=0;i<myArg.length;i++){
  var Match=RegExp("^(-{1,2})([^-\\s]+)$").exec(myArg[i]);
  if(Match[1]=='-') {
    var tmp=Match[2][0];
    if(tmp=='p') port=Match[2].substr(1);
    else if(tmp=='h') helpTextExit();
  }else if(Match[1]=='--') {
    var tmpArg=Match[2]; 
    var MatchA=/gen(.*)/.exec(tmpArg);  if(MatchA) strGenerator=MatchA[1];
    var MatchA=/www(.*)/.exec(tmpArg);  if(MatchA) www=MatchA[1];
    var MatchA=/page(.*)/.exec(tmpArg);  if(MatchA) strName=MatchA[1];
    var MatchA=/data(.*)/.exec(tmpArg);  if(MatchA) strEditText=MatchA[1];
    
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


objArg={boTLS:boTLS, www:www, strName:strName, strEditText:strEditText, strHtmlText:strHtmlText, requesterCacheTime:0, StrNewLink:StrNewLink, StrSubImage:StrSubImage, boOR:true, boOW:true, boSiteMap:true, summary:'myEdit', signature:'me'}


var arrNoTX=['writePageFile', 'readPageFile'];  
var boStartTX=1; if(arrNoTX.indexOf(strGenerator)!=-1){ boStartTX=0; } 

generatorWrap=function*(){

  var urlMongo = 'mongodb://localhost:27017';
  var dbMongoParent=null;
  var err;  MongoClient.connect(urlMongo, function(errT, dbT) { err=errT; dbMongoParent=dbT; flow.next(); }); yield;   if(err) {console.error(err); return; }
  dbMongo = dbMongoParent.db('myproject');
  
  if(boStartTX){
    var tx=sessionNeo4j.beginTransaction();
    
    if(strGenerator=='deletePageNeo'){  var objT=yield* app[strGenerator](flow, tx, objArg);
    }else if(strGenerator=='deletePageByMultIDNeo'){ extend(objArg,{IdPage:['Z91YJJD0bSx9r0QA','So9yR8W2iy2hHgAO']});   var objT=yield* app[strGenerator](flow, tx, objArg);
    }else if(strGenerator=='saveWhenUploadingNeo'){ extend(objArg,{fileName:"talk:start.txt"});  var objT=yield* app[strGenerator](flow, tx, objArg);
    }else if(strGenerator=='saveByReplaceNeo'){ extend(objArg,{boVLoggedIn:0,tModBrowser:(new Date).toUnix()});   var objT=yield* app[strGenerator](flow, tx, objArg); 
    }else if(strGenerator=='saveByAddNeo'){ var objT=yield* app[strGenerator](flow, tx, objArg); 
    }else if(strGenerator=='refreshRevNeo'){ extend(objArg,{iRev:-1});   var objT=yield* app[strGenerator](flow, tx, objArg);
    }else if(strGenerator=='comparePageNeo'){ extend(objArg,{iRevO:0, iRev:1, boVLoggedIn:1});   var objT=yield* app[strGenerator](flow, tx, objArg);
    }else if(strGenerator=='storeImageNeo'){ extend(objArg,{data:'abc', strName:'abc.jpg'});   var objT=yield* app[strGenerator](flow, tx, objArg);
    }else if(strGenerator=='getInfoNeo'){  var objT=yield* app[strGenerator](flow, tx, objArg);
    }else if(strGenerator=='getInfoNDataNeo'){ extend(objArg,{iRev:0,boFront:1});   var objT=yield* app[strGenerator](flow, tx, objArg);
    }else if(strGenerator=='parse'){extend(objArg,{boOW:1});   var objT=yield* app[strGenerator](flow, tx, objArg);
    }else if(strGenerator=='getTemplateDataNeo'){extend(objArg,{StrTemplate:['tt','ttt','tttt']});   var objT=yield* app[strGenerator](flow, tx, objArg);
    }else if(strGenerator=='getExistingSubNeo'){ extend(objArg,{StrSub:['template:tt','template:ttt']});   var objT=yield* app[strGenerator](flow, tx, objArg);
    }else if(strGenerator=='getBoTalkExistNeo'){   var objT=yield* app[strGenerator](flow, tx, objArg);
    }else if(strGenerator=='getRevisionTableNeo'){   var objT=yield* app[strGenerator](flow, tx, objArg);
    }else if(strGenerator=='getLastVersionMeta'){   var objT=yield* app[strGenerator](flow, tx, objArg);
    }else if(strGenerator=='mergePageNeo'){ extend(objArg,{www:www, strName:strName, nChild:5, nImage:6, tNow:0, boAccDefault:true}); var objT=yield* app[strGenerator](flow, tx, objArg);
    }else if(strGenerator=='saveWhenUploadingImageNeo'){   extend(objArg,{strName:'abc.jpg', data:'aabbcc'});  var objT=yield* app[strGenerator](flow, tx, objArg);
    }
    if(objT[0]) {
      yield* neo4jRollbackGenerator(flow, tx);
    }else{
      yield* neo4jCommitGenerator(flow, tx);
    }
  }else{
    
    if(strGenerator=='setUpNeo'){extend(objArg,{aPassword:'123'});   var objT=yield* app[strGenerator](flow, tx, objArg);
    }else if(strGenerator=='writePageFile'){
      var strIDPage='abc', strData='abcdåäö';
      var objT=yield* app[strGenerator](flow, 'editText', strIDPage, strData);
    }else if(strGenerator=='readPageFile'){
      var strIDPage='abcd';
      var objT=yield* app[strGenerator](flow, 'editText',  strIDPage);
    }else{console.log('no such generator');}
  }
  console.log(objT);
}
flow=generatorWrap(); flow.next();
//flow=app[strGenerator](objArg); flow.flow=flow; flow.next();
