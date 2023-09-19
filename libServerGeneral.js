"use strict"
export function blah() {}



//declare global{var parseCookies}
app.parseCookies=function(req) {
  var list={}, rc=req.headers.get('cookie');
  if(typeof rc=='string'){
    rc.split(';').forEach(function( cookie ) {
      var parts = cookie.split('=');
      list[parts.shift().trim()]=unescape(parts.join('='));
    });
  }
  return list;
}


//
// MyEscaper
//

// declare global{
//   interface MyEscaper {
//     escape(length: string): string;
//     unescape(length: string): string;
//   }
//   var MyEscaper
// }
//declare global{var MyEscaper}
app.MyEscaper=function(){
  this.regEscape=/[\"\'\\]/g;
  this.funEscape=function(m){ return "\\"+m;  }
  this.regUnescape=/(\\\"|\\\'|\\\\)/g;
  this.funUnescape=function(m){ return m[1];  }
}
MyEscaper.prototype.escape=function(str){  if(typeof str=='string') str=str.replace(this.regEscape,this.funEscape);  return str;  }
MyEscaper.prototype.unescape=function(str){  if(typeof str=='string') str=str.replace(this.regUnescape,this.funUnescape);  return str;  }


//
// Errors
//

app.ErrorClient=class extends Error {
  constructor(message,statusCode=400) {
    super(message);
    this.name = 'ErrorClient';
    this.statusCode = statusCode;
  }
}

app.MyError=Error;
//MyError=function(){ debugger;}

//declare global{var getETag, getRequesterTime}
//app.getETag=function(headers){var t=false, f='if-none-match'; if(f in headers) t=headers[f]; return t;}
//app.getRequesterTime=function(headers){if("if-modified-since" in headers) return new Date(headers["if-modified-since"]); else return false;}
app.getETag=function(headers){return headers.get('if-none-match')||false;}
app.getRequesterTime=function(headers){const t=headers.get("if-modified-since"); if(t) return new Date(t); else return false;}





//declare global{var checkIfLangIsValid, getBrowserLang, StrMimeType, md5}
app.checkIfLangIsValid=function(langShort){
  for(var i=0; i<arrLang.length; i++){ var langRow=arrLang[i]; if(langShort==langRow[0]){return true;} }  return false;
}

app.getBrowserLang=function(req){
  //echo _SERVER['accept-language']; exit;
  var Lang=[];
  const strHead=req.headers.get('accept-language')
  if(strHead) {
    var myRe=new RegExp('/([a-z]{1,8}(-[a-z]{1,8})?)\\s*(;\\s*q\\s*=\\s*(1|0\\.[0-9]+))?/ig');

      // create a list like [["en", 0.8], ["sv", 0.6], ...]
    var Match;
    while ((Match = myRe.exec(strHead)) !== null)    {
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


app.StrMimeType={
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
  xml:'text/xml',
  json:'application/json',
  zip:'application/zip'
};


//app.md5=function(str){return myCrypto.createHash('md5').update(str).digest('hex');} // One could use Node.js built-in crypto perhaps?!
app.md5=function(str){
  //if(str instanceof Uint8Array){ str=str.buffer}
  //else if(str instanceof Buffer){ str=str.buffer}
  return myCrypto.createHash('md5').update(str).digest('hex');
} 
//app.md5=function(str){return createHash("md5").update(str);} 

  // Redis v3
// app.cmdRedis=async function(strCommand, arr){
//   if(!(arr instanceof Array)) arr=[arr];
//   return await new Promise(resolve=>{
//     redisClient.send_command(strCommand, arr, (...arg)=>resolve(arg)  ); 
//   });
//   //return await redisClient.sendCommand([strCommand, ...arr] ).toNBP();
// }
// // Redis v4 (with legacy mode)
// app.cmdRedis=async function(strCommand, arr){
// if(!(arr instanceof Array)) arr=[arr];
// return await new Promise(resolve=>{
//   redisClient.sendCommand([strCommand, ...arr], (...arg)=>resolve(arg)  ); 
// });
// //return await redisClient.sendCommand([strCommand, ...arr] ).toNBP();
// }
// app.getRedis=async function(strVar, boObj=false){
//   var [err,data]=await cmdRedis('GET', [strVar]);  if(boObj) data=JSON.parse(data);  return [err,data];
// }
// app.setRedis=async function(strVar, val, tExpire=-1){
//   if(typeof val!='string') var strA=JSON.stringify(val); else var strA=val;
//   var arr=[strVar,strA];  if(tExpire>0) arr.push('EX',tExpire);   var [err,strTmp]=await cmdRedis('SET', arr);
//   return [err,strTmp];
// }
// app.expireRedis=async function(strVar, tExpire=-1){
//   if(tExpire==-1) var [err,strTmp]=await cmdRedis('PERSIST', [strVar]);
//   else var [err,strTmp]=await cmdRedis('EXPIRE', [strVar,tExpire]);
//   return [err,strTmp];
// }
// app.delRedis=async function(arr){ 
//   if(!(arr instanceof Array)) arr=[arr];
//   var [err,strTmp]=await cmdRedis('DEL', arr);
//   return [err,strTmp];
// }

  // ioredis 
//declare global {var getRedis, setRedis, expireRedis, delRedis, existsRedis}
app.expireRedis=async function(strVar, tExpire=-1){
  if(tExpire==-1) var [err,strTmp]=await redis.persist(strVar).toNBP();
  else var [err,strTmp]=await redis.expire(strVar,tExpire).toNBP();
  return [err,strTmp];
}
app.delRedis=async function(arr){ 
  if(!(arr instanceof Array)) arr=[arr];
  var [err,strTmp]=await redis.del(...arr).toNBP();
  return [err,strTmp];
}
app.existsRedis=async function(strVar){  return await redis.exists(strVar).toNBP();  }


  // redis (deno/node.js)
app.cmdRedis=async function(strCommand, arr){
  if(!(arr instanceof Array)) arr=[arr];
  return await redis.sendCommand([strCommand, arr] ).toNBP();
}
app.getRedis=async function(strVar, boObj=false){
  //let [err,data]=await cmdRedis('GET', [strVar]);  if(boObj) data=JSON.parse(data);  return [err,data];
  let [err,data]=await redis.get(strVar).toNBP();  if(boObj) data=JSON.parse(data);  return [err,data];
}
app.setRedis=async function(strVar, val, tExpire=-1){
  if(typeof val!='string') var strA=JSON.stringify(val); else var strA=val;
  //var arr=[strVar,strA];  if(tExpire>0) arr.push('EX',tExpire);   var [err,strTmp]=await cmdRedis('SET', arr);
  var arr=[strVar,strA];  if(tExpire>0) arr.push('EX',tExpire);   var [err,strTmp]=await redis.set(...arr).toNBP();
  return [err,strTmp];
}
app.expireRedis=async function(strVar, tExpire=-1){
  if(tExpire==-1) var [err,strTmp]=await cmdRedis('PERSIST', [strVar]);
  else var [err,strTmp]=await cmdRedis('EXPIRE', [strVar,tExpire]);
  return [err,strTmp];
}
app.delRedis=async function(arr){ 
  if(!(arr instanceof Array)) arr=[arr];
  let [err,strTmp]=await cmdRedis('DEL', arr);
  return [err,strTmp];
}
app.evalRedis=async function(strLua, arrKey, arrArg){
  if(boDeno){
    return redis.eval(...arguments).toNBP()
  }else{
    var nK=arrKey.length, nA=arrArg.length;
    var arrArgN=Array(nA); for(let i=0;i<nA;i++) {var v=arrArg[i]; if(typeof v!='string') v=v.toString(); arrArgN[i]=v;}
    return redis.sendCommand(['EVAL', strLua, nK.toString(), ...arrKey, ...arrArgN]).toNBP();
  }
}
  


//declare global {var getIP}
app.getIP=function(reqMy){
  const {req, conn}=reqMy;
  var ipClient='', Match;
    // AppFog ipClient
  var strHead=req.headers.get('x-forwarded-for')
  if(strHead){
    //tmp="79.136.116.122, 127.0.0.1";
    Match=/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.exec(strHead);
    if(Match && Match.length) return Match[0];
  }

  const remoteip=boDeno?conn.remoteAddr.hostname:req.connection.remoteAddress

  if(remoteip){
    Match=/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.exec(remoteip);
    if(Match && Match.length) return Match[0];
  }

  // if('remoteAddr' in req.socket){
  //   var tmp=req.socket.remoteAddr;
  //   Match=/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/.exec(tmp);
  //   if(Match && Match.length) return Match[0];
  // }

  var strHead=req.headers.get('REMOTE_ADDR')
  if(strHead){return strHead;}
  return false
}




//declare global {var CacheUriT, makeWatchCB, isRedirAppropriate, setAccessControlAllowOrigin}
var regFileType=RegExp('\\.([a-z0-9]+)$','i'),    regZip=RegExp('^(css|js|txt|html)$'),   regUglify=RegExp('^js$');
app.CacheUriT=function(){
  this.set=async function(key, buf, type, boZip, boUglify){
    var strHash=app.md5(buf);
    //if(boUglify) { // UglifyJS does not handle ecma6 (when I tested it 2019-05-05).
      //var objU=UglifyJS.minify(buf.toString());
      //buf=new Buffer(objU.code,'utf8');
    //}
    if(boZip){
      var [err, buf]=await new Promise( resolve=>{  zlib.gzip(buf, (...arg)=>resolve(arg)  ); });
    } else{  var err=null; }
    this[key]={buf,type,strHash,boZip,boUglify};
    return [err,buf];
  }
  this.getWAutoSet=async function(key){  // Only to be used when the "key" corresponds to a real file.
    if(key in this){
      return [null, this[key]];
    }else{
      var [err]=await this.readFileToCache(key);
      return [err, this[key]];
    }
  }
  this.readFileToCache=async function(strFileName) {
    var type, Match=regFileType.exec(strFileName);    if(Match && Match.length>1) type=Match[1]; else type='txt';
    var boZip=regZip.test(type),  boUglify=regUglify.test(type);
    var [err, buf]=await fsPromises.readFile(strFileName).toNBP();    if(err) return [err];
    //var [err]=await CacheUri.set('/'+strFileName, buf, type, boZip, boUglify);
    var [err]=await this.set(strFileName, buf, type, boZip, boUglify);
    return [err];
  }
}


app.makeWatchCB=function(strFolder, StrFile) {
  return async function(ev,filename){
    if(StrFile.indexOf(filename)!=-1){
      var strFileName=path.normalize(strFolder+'/'+filename);
      console.log(filename+' changed: '+ev);
      var [err]=await CacheUri.readFileToCache(strFileName); if(err) console.error(err);
    }
  }
}

//app.isRedirAppropriate=function(req){
app.isRedirAppropriate=function(objUrl){
  const {protocol, host, pathname}=objUrl
  if(typeof RegRedir=='undefined') return false;

  //var host=req.headers.get('host');
  for(var i=0;i<RegRedir.length;i++){
    var regTmp=RegRedir[i][0], strNew=RegRedir[i][1];
    var boT=regTmp.test(host);
    if(boT) {
      var hostNew=host.replace(regTmp, strNew);
      return protocol+'//'+hostNew+pathname;
    }
  }
  return false;
}


app.setAccessControlAllowOrigin=function(reqMy, RegAllowed){
  const {req}=reqMy;
  var strHead=req.headers.get('origin')
  if(strHead){ //if cross site
    var http_origin=strHead;
    //var boAllowDbg=boDbg && RegExp("^http\:\/\/(localhost|192\.168\.0)").test(http_origin);
    //var boAllowed=false; for(var i=0;i<RegAllowed.length;i++){ boAllowed=http_origin===RegAllowed[i]; if(boAllowed) break; }
    var boAllowed=false;
    if(RegAllowed.length==0) boAllowed=true;
    else {
      for(var i=0;i<RegAllowed.length;i++){ boAllowed=RegAllowed[i].test(http_origin); if(boAllowed) break; }
    }
    //if(boAllowDbg || http_origin == "https://control.locatabl.com" || http_origin == "https://controllocatablcom.herokuapp.com" || http_origin == "https://emagnusandersson.github.io" ){
    if(boAllowed){
      //reqMy.setOutHeader("Access-Control-Allow-Origin", http_origin); reqMy.setOutHeader("Vary", "Origin"); 
      reqMy.setOutHeader({"Access-Control-Allow-Origin":http_origin, "Vary":"Origin"});
      reqMy.setOutHeader({"Cross-Origin-Opener-Policy":"same-site"})
      // After googling same-site vs same-origin, I find: Websites that have the same scheme and the same eTLD+1 are considered "same-site"
    }
  }
}
//RegAllowedOriginOfStaticFile=[RegExp("^https\:\/\/(control\.locatabl\.com|controllocatablcom\.herokuapp\.com|emagnusandersson\.github\.io)")];
//if(boDbg) RegAllowedOriginOfStaticFile.push(RegExp("^http\:\/\/(localhost|192\.168\.0)"));
//setAccessControlAllowOrigin(setAccessControlAllowOrigin, RegAllowedOriginOfStaticFile);


  // Make Html table
//declare global {var makeTHead, makeTBody, makeTable}
app.makeTHead=function(StrHead){
  if(!StrHead) return "";
  var strD=''; 
  for(var i=0; i<StrHead.length; i++){var d=StrHead[i]; strD+=`<th>${d}</th>`;}
  var strR=`<tr>${strD}</tr>`;
  return `<thead>${strR}</thead>`;
}
app.makeTBody=function(arrObj, StrHead){
  var strR='', boUseStrHead=Boolean(StrHead), nHead=StrHead?StrHead.length:-1; 
  for(var j=0;j<arrObj.length;j++){
    var r=arrObj[j];
    var strD='', nColOut=boUseStrHead?nHead:r.length;
    for(var i=0;i<nColOut;i++){ var k=boUseStrHead?StrHead[i]:i; var d=r[k]; strD+=`<td>${d}</td>`;}
    strR+=`<tr>${strD}</tr>`;
  }
  return `<tbody>${strR}</tbody>`;
}
app.makeTable=function(arrObj, StrHead=null){
  if(arrObj.length && !StrHead) StrHead=Object.keys(arrObj[0]);
  return "<table>"+makeTHead(StrHead)+makeTBody(arrObj, StrHead)+"</table>";
}



//declare global {var csvParseMy}
app.csvParseMy=function(strCSV){  // Should be in lib.js. Although as it is only used on the server I place it here.  
  var arrStr=[];
  var replaceStr=function(m, str){
    var i=arrStr.length;
    arrStr.push(str);
    return `"${i}"`;
  }
  var putBackStr=function(m, str){ 
    return arrStr[Number(str)];  
  }

  //strCSV="0, \"a\\\"b\", 1, \"a\"";  // Example of string for testing
  //strCSV=`0, "a\\"b", 1, "a"`;  // Example of string for testing
  var regString=/"(.*?)(?<!\\)"/g;  // Makes whole script "crash" on older Safari (because of the "lookbehind").  
  //var regString=RegExp('"(.*?)(?<!\\\\)"', 'g');  // Same as above (The regular expression doesn't work (although, the whole script doesn't fail)).
  //var regString=/"(.*?[^\\])"/g; // Works on Safari, but doesn't match an empty string '""' (which is perhaps not needed in this perticular example since the strings are simply put back in.)
  strCSV=strCSV.trim();
  strCSV = strCSV.replace(regString, replaceStr);
  
  var arrRow=strCSV.split('\n');
  arrRow=arrRow.map(function(strRow){
    var row=strRow.trim().split(',');
    row=row.map(function(it){
      it=it.trim()
      it = it.replace(/^"(.*)"$/, putBackStr); return it;
    });
    return row;
  });
  
  return arrRow;
}

//
// Streams
//

app.readAllMy=async function(readable){
  const chunks = []; let len=0
  for await (let chunk of readable) {
    chunks.push(chunk);
    len+=chunk.length
  }
  if(chunks.length==1) return chunks[0]
  var mergedArray = new Uint8Array(len);
  let nStart=0
  for(let chunk of chunks){
    mergedArray.set(chunk, nStart)
    nStart+=chunk.length
  }
  return mergedArray;
}

//
// imagemagick
//

app.imGetSize=async function(bufData){
  if(boDeno){
    var args=[ "-ping", "-format", "%w %h", 'fd:0']
    var command = new Deno.Command('identify', { args, stdin:"piped", stdout:"piped" });
    var child = command.spawn();
    var promiseRead=readAllMy(child.stdout);
    var writer = child.stdin.getWriter();
    await writer.ready;
    writer.write(bufData);
    writer.releaseLock();
    await child.stdin.close();
    var value = await promiseRead;
    const decoder = new TextDecoder();
    value=decoder.decode(value)
    var [w, h]=value.split(' ')
    return [err, [Number(w), Number(h)]]
  }else{
    var [err, value]=await new Promise(resolve=>{
      gm(bufData).size(function(errT, valueT){ resolve([errT,valueT]);  });
    });
    if(err){ return [err]; }  
    var {width, height}=value;
    return [null, [width, height]]
  }
}

