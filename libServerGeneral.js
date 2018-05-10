parseCookies=function(req) {
"use strict"
  var list={}, rc=req.headers.cookie;
  if(typeof rc=='string'){
    rc.split(';').forEach(function( cookie ) {
      var parts = cookie.split('=');
      list[parts.shift().trim()]=unescape(parts.join('='));
    });
  }
  return list;
}



myQueryGen=function*(flow, sql, Val, pool){ 
  var err, connection, results, fields;
  for(var i=0;i<nDBRetry;i++){
    pool.getConnection(function(errT, connectionT) { err=errT; connection=connectionT; flow.next(); }); yield;
    if(err) {
      console.log('Error when getting mysql connection, attemptCounter: '+i);
      if(typeof err=='object' && 'code' in err) {
        console.log('err.code: '+err.code);
        if(err.code=='PROTOCOL_CONNECTION_LOST' || err.code=='ECONNREFUSED' || err.code=='ECONNRESET'){
          setTimeout(function(){ flow.next();}, 2000); yield;  continue;
        } else { console.log('Can\'t handle: err.code: '+err.code); return [err]; }
      }
      else { console.log('No \'code\' in err'); return [err]; }
    }
  
    //console.log('connection.threadId: ' + connection.threadId);
    connection.query(sql, Val, function(errT, resultsT, fieldsT) { err=errT; results=resultsT; fields=fieldsT; flow.next();}); yield;
    connection.release();
//connection.destroy();
    if(err) {
      console.log('Error when making mysql query, attemptCounter: '+i);
      if(typeof err=='object' && 'code' in err) {
        console.log('err.code: '+err.code); debugger
        if(err.code=='PROTOCOL_CONNECTION_LOST' || err.code=='ECONNREFUSED'){
          setTimeout(function(){ flow.next();}, 2000); yield;   continue;
        } else { console.log('Can\'t handle: err.code: '+err.code); break; }
      }
      else { console.log('No \'code\' in err'); break; }
    }
    else {break;}
  }
  return [err, results, fields];
}
myQueryGen=function*(flow, sql, Val, pool, connection=null){ 
  var err, results, fields;
  for(var i=0;i<nDBRetry;i++){
    if(connection){
      connection.query(sql, Val, function(errT, resultsT, fieldsT) { err=errT; results=resultsT; fields=fieldsT; flow.next();}); yield;
      if(err==null){ break;}
      else{
        console.log('Error when making mysql query, attemptCounter: '+i);
        if(typeof err=='object' && 'code' in err) {
          console.log('err.code: '+err.code); debugger
          if(err.code!='PROTOCOL_CONNECTION_LOST' && err.code!='ECONNREFUSED') { console.log('Can\'t handle: err.code: '+err.code); break; }
        }
        else { console.log('No \'code\' in err'); break; }
      }
    }
    pool.getConnection(function(errT, connectionT) { err=errT; connection=connectionT; flow.next(); }); yield;
    if(err) {
      connection=null;
      console.log('Error when getting mysql connection, attemptCounter: '+i);
      if(typeof err=='object' && 'code' in err) {
        console.log('err.code: '+err.code);
        if(err.code=='PROTOCOL_CONNECTION_LOST' || err.code=='ECONNREFUSED' || err.code=='ECONNRESET'){
          setTimeout(function(){ flow.next();}, 2000); yield;  
        } else { console.log('Can\'t handle: err.code: '+err.code); break; }
      }
      else { console.log('No \'code\' in err'); break; }
    }
    else{  console.log('connection.threadId: ' + connection.threadId);     }
  }
  return [err, results, fields, connection];
}
myQueryOneGen=function*(flow, sql, Val, pool){ 
  var [err, results, fields]=yield* myQueryGen(flow, sql, Val, pool);
  connection.release();
  //connection.destroy();
  return [err, results, fields];
}
MyMySql=function(pool){
  this.pool=pool;
  this.connection=null;
}
MyMySql.prototype.query=function*(flow, sql, Val, boLast=false){
  var [err, results, fields, connection]=yield* myQueryGen(flow, sql, Val, this.pool, this.connection);
  this.connection=connection;
  return [err, results, fields];
}
MyMySql.prototype.fin=function(){
  if(this.connection) {
    //this.connection.release();
    this.connection.destroy();
    this.connection=null;
  };
}

myGetConnectionGen=function*(flow, sql, Val, pool){ 
  var err, connection, results, fields;
  for(var i=0;i<nDBRetry;i++){
    pool.getConnection(function(errT, connectionT) { err=errT; connection=connectionT; flow.next(); }); yield;
    if(err) {
      console.log('Error when getting mysql connection, attemptCounter: '+i);
      if(typeof err=='object' && 'code' in err) {
        console.log('err.code: '+err.code);
        if(err.code=='PROTOCOL_CONNECTION_LOST' || err.code=='ECONNREFUSED' || err.code=='ECONNRESET'){
          setTimeout(function(){ flow.next();}, 2000); yield;  continue;
        } else { console.log('Can\'t handle: err.code: '+err.code); return [err]; }
      }
      else { console.log('No \'code\' in err'); return [err]; }
    }
  }
  return [err, connection];
}

myQueryW=function*(flow, connection, sql, Val){ 
  var err, results, fields;
  connection.query(sql, Val, function(errT, resultsT, fieldsT) { err=errT; results=resultsT; fields=fieldsT; flow.next();}); yield;
  //connection.release();
  //connection.destroy();
  
  return [err, results, fields];
}

MyNeo4j=function(){
  var chars = ['\\"', '\\\'', '\\\\'],   tmpStr='[' +chars.join("") +']';  this.regEscape=new RegExp(tmpStr, 'g');
  this.funEscape=function(m){ return "\\"+m;  }
}
MyNeo4j.prototype.escape=function(str){  if(typeof str=='string') str=str.replace(this.regEscape,this.funEscape);  return str;  }

ErrorClient=class extends Error {
  constructor(message) {
    super(message);
    this.name = 'ErrorClient';
  }
}

MyError=Error;
//MyError=function(){ debugger;}

getETag=function(headers){var t=false, f='if-none-match'; if(f in headers) t=headers[f]; return t;}
getRequesterTime=function(headers){if("if-modified-since" in headers) return new Date(headers["if-modified-since"]); else return false;}

var tmp=http.ServerResponse.prototype;
tmp.outCode=function(iCode,str){  str=str||''; this.statusCode=iCode; if(str) this.setHeader("Content-Type", "text/plain");   this.end(str);}
tmp.out200=function(str){ this.outCode(200, str); }
tmp.out201=function(str){ this.outCode(201, str); }
tmp.out204=function(str){ this.outCode(204, str); }
tmp.out301=function(url){  this.writeHead(301, {Location: url});  this.end();   }
tmp.out301Loc=function(url){  this.writeHead(301, {Location: '/'+url});  this.end();   }
tmp.out403=function(){ this.outCode(403, "403 Forbidden\n");  }
tmp.out304=function(){  this.outCode(304);   }
tmp.out404=function(str){ str=str||"404 Not Found\n"; this.outCode(404, str);    }
//tmp.out500=function(err){ var errN=(err instanceof Error)?err:(new MyError(err)); console.log(errN.stack); this.writeHead(500, {"Content-Type": "text/plain"});  this.end(err+ "\n");   }
tmp.out500=function(e){
  if(e instanceof Error) {var mess=e.name + ': ' + e.message; console.error(e.stack);} else {var mess=e; console.error(mess);} 
  this.writeHead(500, {"Content-Type": "text/plain"});  this.end(mess+ "\n");
}
tmp.out501=function(){ this.outCode(501, "Not implemented\n");   }




checkIfLangIsValid=function(langShort){
  for(var i=0; i<arrLang.length; i++){ var langRow=arrLang[i]; if(langShort==langRow[0]){return true;} }  return false;
}

getBrowserLang=function(req){
"use strict"
  //echo _SERVER['accept-language']; exit;
  var Lang=[];
  if('accept-language' in req.headers) {
    var myRe=new RegExp('/([a-z]{1,8}(-[a-z]{1,8})?)\\s*(;\\s*q\\s*=\\s*(1|0\\.[0-9]+))?/ig');
    var str=req.headers['accept-language'];

      // create a list like [["en", 0.8], ["sv", 0.6], ...]
    var Match;
    while ((Match = myRe.exec(str)) !== null)    {
      var val=Match[4]; if(val=='') val=1;
      Lang.push([Match[1], Number(val)]);
    }
    if(Lang.length) {
      Lang.sort(function(a, b){return b[1]-a[1];});
    }
  }
  var strLang='en';
  for(var i=0; i<Lang.length; i++){
    var lang=Lang[i][0];
    if(lang.substr(0,2)=='sv'){  strLang='sv';  } 
  }
  return strLang;
}


MimeType={
  txt:'text/plain; charset=utf-8',
  jpg:'image/jpg',
  jpeg:'image/jpg',
  gif:'image/gif',
  png:'image/png',
  svg:'image/svg+xml',
  ico:'image/x-icon',
  mp4:'video/mp4',
  ogg:'video/ogg',
  webm:'video/webm',
  js:'application/javascript; charset=utf-8',
  css:'text/css',
  pdf:'application/pdf',
  html:'text/html',
  xml:'text/xml'
};



genRandomString=function(len) {
  var characters = 'abcdefghijklmnopqrstuvwxyz';
  //var characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var str ='';    
  for(var p=0; p<len; p++) {
    str+=characters[randomInt(0, characters.length-1)];
  }
  return string;
}
md5=function(str){return crypto.createHash('md5').update(str).digest('hex');}


wrapRedisSendCommand=function*(strCommand,arr){
  var flow=this.flow, value;
  redisClient.send_command(strCommand,arr, function(err, valueT){  value=valueT; flow.next();  }); yield;
  return value;
}
getSessionMain=function*(){ 
  var redisVar=this.req.sessionID+'_Main', strTmp=yield* wrapRedisSendCommand.call(this.req, 'get', [redisVar]);   this.sessionMain=JSON.parse(strTmp);
}
setSessionMain=function*(){
  var strA=JSON.stringify(this.sessionMain);
  var redisVar=this.req.sessionID+'_Main', strTmp=yield* wrapRedisSendCommand.call(this.req, 'set',[redisVar,strA]);   var tmp=yield* wrapRedisSendCommand.call(this.req, 'expire',[redisVar,maxUnactivity]);
}
resetSessionMain=function*(){
  var userInfoFrIPTmp={};
  this.sessionMain={userInfoFrDB:extend({},specialistDefault),   userInfoFrIP:userInfoFrIPTmp};
  yield* setSessionMain.call(this);
}



getIP=function(req){
  var ipClient='', Match;
    // AppFog ipClient
  if('x-forwarded-for' in req.headers){
    var tmp=req.headers['x-forwarded-for'];
    //tmp="79.136.116.122, 127.0.0.1";
    Match=/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.exec(tmp);
    if(Match && Match.length) return Match[0];
  }

  if('remoteAddress' in req.connection){
    var tmp=req.connection.remoteAddress;
    Match=/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.exec(tmp);
    if(Match && Match.length) return Match[0];
  }

  if('remoteAddress' in req.socket){
    var tmp=req.socket.remoteAddress;
    Match=/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.exec(tmp);
    if(Match && Match.length) return Match[0];
  }

  if('REMOTE_ADDR' in req.headers){return req.headers.REMOTE_ADDR;}
  return false
}

luaCountFunc="\n\
local boSessionExist=redis.call('EXISTS',KEYS[1]);\n\
local c;\n\
if(boSessionExist>0) then c=redis.call('INCR',KEYS[2]); redis.call('EXPIRE',KEYS[2], ARGV[1]);\n\
else c=redis.call('INCR',KEYS[3]); redis.call('EXPIRE', KEYS[3], ARGV[1]);\n\
end;\n\
return c";




var regFileType=RegExp('\\.([a-z0-9]+)$','i'),    regZip=RegExp('^(css|js|txt|html)$'),   regUglify=RegExp('^js$');
readFileToCache=function*(strFileName) {
  var flow=this.flow;
  var type, Match=regFileType.exec(strFileName);    if(Match && Match.length>1) type=Match[1]; else type='txt';
  var boZip=regZip.test(type),  boUglify=regUglify.test(type);
  var err, buf;
  fs.readFile(strFileName, function(errT, bufT) {  err=errT; buf=bufT;  flow.next();   });  yield;  if(err) return [err];
  var [err]=yield* CacheUri.set.call(this, '/'+strFileName, buf, type, boZip, boUglify);  if(err) return [err];
  return [null];  
}

CacheUriT=function(){
  var self=this;
  this.set=function*(key,buf,type,boZip,boUglify){
    var selfA=this;
    var eTag=crypto.createHash('md5').update(buf).digest('hex'); 
    /*if(boUglify) {
      var objU; objU=UglifyJS.minify(bufO.toString(), {fromString: true});
      bufO=new Buffer(objU.code,'utf8');
    }*/
    if(boZip){
      var bufI=buf;
      var gzip = zlib.createGzip();
      var err;
      zlib.gzip(bufI, function(errT, bufT) { err=errT; buf=bufT; selfA.flow.next(); });  yield;
      if(err) return [err];
      //if(err){  console.log(err);  process.exit(); return;}
    }
    self[key]={buf:buf,type:type,eTag:eTag,boZip:boZip,boUglify:boUglify};
    return [null];
  }
}



isRedirAppropriate=function(req){
  if(typeof RegRedir=='undefined') return false;

  var domainName=req.headers.host;
  for(var i=0;i<RegRedir.length;i++){
    var regTmp=RegRedir[i][0], strNew=RegRedir[i][1];
    var boT=regTmp.test(domainName);
    if(boT) {
      var domainNameNew=domainName.replace(regTmp, strNew);
      return 'http://'+domainNameNew+req.url;
    }
  }
  return false;
}




