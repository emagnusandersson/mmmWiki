
util =  require('util');
neo4j = require('neo4j-driver').v1;
fs = require("fs");
extend=util._extend;
require('./lib.js');
require('./libNeo4j.js');

process.on('exit', function (){
  driver.close();
  console.log('Goodbye!');
});
var driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "jh10k"));
session = driver.session();
app=(typeof window==='undefined')?global:window;


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
    var MatchA=/data(.*)/.exec(tmpArg);  if(MatchA) data=MatchA[1];
    
    else if(tmp=='help') helpTextExit();
  }
}

if(typeof strGenerator=='undefined') strGenerator='setNewCache';
if(typeof www=='undefined') www='localhost:5000';
if(typeof strName=='undefined') strName='start';
if(typeof data=='undefined') data='abc,link:starta,link:startb';

var regLink=new RegExp('link:([a-zA-Z]+)','g'); 
StrNewLink=[];
var match = regLink.exec(data);
while (match != null) {  StrNewLink.push(match[1]);       match = regLink.exec(data);  }


console.log(strGenerator);




flowStart=app[strGenerator](); flowStart.next();
