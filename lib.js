"use strict"
export function blah() {}
//var app;  if(typeof window!=='undefined') app=window; else if(typeof global!=='undefined') app=global; else app=self;  // if browser else if server else serviceworker
//var app=globalThis;
globalThis.app=globalThis;

app.thisChanged=function(func,selfT){return function(){return func.apply(selfT,arguments);}}


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
Promise.prototype.toNBP=function(){   return this.then(a=>{return [null,a];}).catch(e=>{return [e];});   }  // toNodeBackPromise


//
// String
//

//declare global {var ucfirst, pad2, calcLabel, urldecode, extractLoc, extract, isUpperCase, endsWith, str_repeat, strCountEqualFromStart}

app.ucfirst=function(string){  return string.charAt(0).toUpperCase() + string.slice(1);  }
//app.isAlpha=function(star){  var regEx = /^[a-zA-Z0-9]+$/;  return str.match(regEx); } 

app.pad2=function(n) {return (n<10?'0':'')+n;}
app.calcLabel=function(Label,strName){ var strLabel=ucfirst(strName); if(strName in Label) strLabel=Label[strName]; return strLabel;}

app.urldecode=function(url) {
  url=url.replace(/\+/g, ' '); // Pluses shouldn't be in the url, but who knows;
  return decodeURIComponent(url); 
}


app.extractLoc=function(obj,strObjName){   // Ex: eval(extractLoc(objMy,'objMy'));
  var Str=[];  for(var key in obj) Str.push(`${key}=${strObjName}.${key}`);
  var str=''; if(Str.length) str='var '+Str.join(', ')+';';  return str;
}
app.extract=function(obj,par=app){ for(var key in obj){ par[key]=obj[key]; } }
//extractLocSome=function(strObjName,arrSome){  // Ex: eval(extractLocSome('objMy',['a','b']));
  //if(typeof arrSome=='string') arrSome=[arrSome];
  //var len=arrSome.length, Str=Array(len);  for(var i=0;i<len;i++) { var key=arrSome[i]; Str[i]=`${key}=${strObjName}.${key}`; }
  //return 'var '+Str.join(', ')+';';
//}

app.isUpperCase=function(c){return c == c.toUpperCase(); }



app.endsWith=function(str,end){return str.substr(-end.length)==end;}

app.str_repeat=function(str,n){ return Array(n+1).join(str);}


   // Ex: a="abcdef", b="abcghij" => returns 3
app.strCountEqualFromStart=function(a,b){var l=Math.min(a.length,b.length); for(var i=0;i<l;i++){if(a[i]!=b[i]) return i;} return l; }

//
// Array
//
//declare global {var arr_max, arr_min, arrArrange, intersectionAB, AMinusB, isAWithinB, AMUnionB, AUnionB, mySplice1, myCopy, arrCopy, array_merge, array_mergeM, array_flip, array_fill, is_array, in_array, array_filter, array_removeInd, arrValMerge, arrValRemove, array_equal}

app.arr_max=function(arr){return Math.max.apply(null, arr);}
app.arr_min=function(arr){return Math.min.apply(null, arr);}

app.arrArrange=function(arrV,arrI){
  var n=arrI.length, arrNew;
  if(typeof arrV=='string') arrNew=" ".repeat(n); else arrNew=Array(n);
  //for(var i=0;i<arrI.length;i++){    arrNew.push(arrV[arrI[i]]);    }
  for(var i=0;i<arrI.length;i++){    arrNew[i]=arrV[arrI[i]];    }
  return arrNew;
}
app.intersectionAB=function(A,B){var Rem=[]; for(var i=A.length-1;i>=0;i--){var a=A[i]; if(B.indexOf(a)==-1) A.splice(i,1); else Rem.push(a);} return Rem.reverse();}  // Changes A, returns the remainder
app.AMinusB=function(A,B){var ANew=[]; for(var i=0;i<A.length;i++){var a=A[i]; if(B.indexOf(a)==-1) ANew.push(a);} return ANew;}  // Does not change A, returns ANew
app.isAWithinB=function(A,B){ for(var i=0; i<A.length; i++){if(B.indexOf(A[i])==-1) return false;} return true;}  
app.AMUnionB=function(A,B){ // Modifies A
  for(var i=0;i<B.length;i++) { var b=B[i]; if(A.indexOf(b)==-1) A.push(b); }   return A;  
}
app.AUnionB=function(A,B){  var AC=arrCopy(A); return AMUnionB(AC,B) }

app.mySplice1=function(arr,iItem){ var item=arr[iItem]; for(var i=iItem, len=arr.length-1; i<len; i++)  arr[i]=arr[i+1];  arr.length = len; return item; }  // GC-friendly splice
app.myCopy=function(arr,brr){ var len=brr.length; if(typeof arr=="undefined") arr=Array(len); else arr.length = len; for(var i=0; i<len; i++)  arr[i]=brr[i];   return arr; }  // GC-friendly copy

app.arrCopy=function(A){return [].concat(A);}

app.array_merge=function(){  return Array.prototype.concat.apply([],arguments);  } // Does not modify origin
//app.array_mergeM=function(a,b){  a.push.apply(a,b); return a; } // Modifies origin (first argument)
app.array_mergeM=function(){var t=[], a=arguments[0], b=t.slice.call(arguments, 1), c=t.concat.apply([],b); t.push.apply(a,c); return a; } // Modifies origin (first argument)

app.array_flip=function(A){ var B={}; for(var i=0;i<A.length;i++){B[A[i]]=i;} return B;}
//app.array_fill=function(n, val){ return Array.apply(null, new Array(n)).map(String.prototype.valueOf,val); }
app.array_fill=function(n, val){ var a=new Array(n); for(var i=0;i<n;i++)a[i]=val; return a; }

app.is_array=function(a){return a instanceof Array;}
app.in_array=function(needle,haystack){ return haystack.indexOf(needle)!=-1;}
app.array_filter=function(A,f){f=f||function(a){return a;}; return A.filter(f);}

app.array_removeInd=function(a,i){a.splice(i,1);}


app.arrValMerge=function(arr,val){  var indOf=arr.indexOf(val); if(indOf==-1) arr.push(val); }
//app.arrValRemove=function(arr,val){  var indOf=arr.indexOf(val); if(indOf!=-1) arr.splice(indOf,1); }
app.arrValRemove=function(arr,val){  var indOf=arr.indexOf(val); if(indOf!=-1) mySplice1(arr,indOf); }
app.array_equal=function(a,b){if(a.length!==b.length) return false; for(var i in a){if(a[i]!=b[i]) return false;} return true;}


//
// Str (Array of Strings)
//
//declare global {var StrComp}

app.StrComp=function(A,B){var lA=A.length; if(lA!==B.length) return false; for(var i=0;i<lA;i++){ if(A[i]!==B[i]) return false;} return true;}

//
// Object
//
//declare global {var extend, copySome, copyIfExist, object_values, overwriteProperties, isEmpty, copyDeep, copyDeepB, deleteFields}

app.extend=Object.assign;
app.copySome=function(a,b,Str){for(var i=0;i<Str.length;i++) { var name=Str[i]; a[name]=b[name]; } return a; }
app.copySomeGet=function(a,b,Str){for(var i=0;i<Str.length;i++) { var name=Str[i]; a[name]=b.get(name); } return a; }
app.copyIfExist=function(a,b,Str){for(var i=0;i<Str.length;i++) { var name=Str[i]; if(name in b) a[name]=b[name]; } return a; }
app.object_values=function(obj){
  var arr=[];      for(var name in obj) arr.push(obj[name]);
  return arr;
}
app.overwriteProperties=function(oGoal, oOrg){
    // If oGoal or oOrg has wrong type then return oGoal
  if(oGoal===undefined || oGoal===null || ['string', 'number', 'boolean'].indexOf(typeof oGoal)!==-1) return oGoal;
  if(oOrg===undefined || oOrg===null || ['string', 'number', 'boolean'].indexOf(typeof oOrg)!==-1) return oGoal;
  for(var k in oOrg)  if(oOrg.hasOwnProperty(k)) oGoal[k]= oOrg[k];
  return oGoal;
}
app.isEmpty=function(obj) {    return Object.keys(obj).length === 0;  }
app.copyDeep=function(objI) { return JSON.parse(JSON.stringify(objI));};
app.copyDeepB=function(o, isdeep=true){ // Also copies Date
  if (o===undefined || o===null || ['string', 'number', 'boolean'].indexOf(typeof o)!==-1) return o;
  if(o instanceof Date) return new Date(o.getTime());
  var n= o instanceof Array? [] :{};
  for (var k in o)
      if (o.hasOwnProperty(k))
          n[k]= isdeep? copyDeepB(o[k], isdeep) : o[k];
  return n;
}
app.deleteFields=function(o,Str){ for(var str of Str) delete o[str]; }

app.vennSeparateObjKeys=function(A,B){
  var KeyInAOnly=[], KeyInBoth=[], KeyInBOnly=[]
  for(let key in A){
    if(key in B) {KeyInBoth.push(key);}
    else {KeyInAOnly.push(key)}
  }
  for(let key in B){
    if(!(key in A)) {KeyInBOnly.push(key)}
  }
  return [KeyInAOnly, KeyInBoth, KeyInBOnly]
}

//
// Dates and time
//

// declare global {
//   interface Date {
//     toUnix(): number;
//     toISOStringMy(): String;
//     toISODateMy(): String;
//     toISOTimeOfDayMy(): String;
//   }
// }

//declare global {var arrMonths, arrDay, mySwedDate, swedDate, swedTime, UTC2JS, date2ToSuitableString, UTC2Readable, unixNow, nowSFloored, getSuitableTimeUnit, getSuitableTimeUnitStr, dosTime2Arr, dosTime2t, dosTime2tUTC, t2dosTime}

Date.prototype.toUnix=function(){return Math.round(this.valueOf()/1000);}
Date.prototype.toISOStringMy=function(){return this.toISOString().substr(0,19);}
Date.prototype.toISODateMy=function(){return this.toISOString().substr(0,10);}
Date.prototype.toISOTimeOfDayMy=function(){return this.toISOString().substr(11,8);}
var arrMonths=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var arrDay=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var arrDay=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
app.mySwedDate=function(t){ 
  if(!t) return t;
  if(typeof t=='number') t=UTC2JS(t);
  var now=new Date(), diff=(Number(now)-Number(t))/1000; //, y=t.getFullYear(), mo=t.getMonth(), d=t.getDate();
  if(diff>3600*24*365) return Math.floor(diff/(3600*24*365))+'y'; 
  if(diff>3600*24*275) return '¾y'; 
  if(diff>3600*24*183) return '½y'; 
  if(diff>3600*24*91) return '¼y'; 
  //if(diff>3600*24*60) return '2mo'; 
  if(diff>3600*24*7) return Math.floor(diff/(3600*24*7))+'w'; 
  if(diff>3600*24*2) return Math.floor(diff/(3600*24))+'d'; 
  if(diff>3600) return Math.floor(diff/3600)+'h';
  if(diff>60*45) return '¾h';  
  if(diff>60*30) return '½h';  
  if(diff>60*15) return '¼h';  
  return '0h'; 
  //if(diff>3600*24*90) return arrMonths[t.getMonth()]); // After 90 days, use Month
  //if(diff>3600*24*4) return arrMonths[t.getMonth()]+'-'+pad2(t.getDate()); // After 4 days, use Month-Date
  //var day=t.getDay(); if(diff>3600*24) return arrDay[t.getDay()]; // After 1 day, use Weekday
  //if(diff>3600) return Math.floor(diff/3600)+'h ago'; // After 1 hour, use Hours
  //return Math.floor(diff/60)+'min';  // Else use Minutes
}
app.swedDate=function(tmp, sep=''){ 
  if(typeof tmp=="number") tmp=new Date(Number(tmp)*1000);
  //if(tmp){tmp=UTC2JS(tmp);  
  //tmp=tmp.getFullYear()+sep+pad2(tmp.getMonth()+1)+sep+pad2(tmp.getDate());
  tmp=[tmp.getFullYear(), pad2(tmp.getMonth()+1), pad2(tmp.getDate())].join(sep);
  return tmp;
}
app.swedTime=function(tmp){ 
  if(typeof tmp=="number") tmp=new Date(Number(tmp)*1000);
  //if(tmp){tmp=UTC2JS(tmp);
  tmp=`${tmp.getFullYear()}-${pad2(tmp.getMonth()+1)}-${pad2(tmp.getDate())} ${pad2(tmp.getHours())}:${pad2(tmp.getMinutes())}`;
  return tmp;
}
app.UTC2JS=function(utcTime){ var tmp=new Date(Number(utcTime)*1000);  return tmp;  }
//app.UTC2TimeOrDate=function(tDate){
app.date2ToSuitableString=function(tDate){
  if(tDate===null) tDate=0;
  if(typeof tDate=="number") tDate=new Date(Number(tDate)*1000);
  var tNow=new Date(), tDiff=(tNow-tDate)/1000;
  if(Math.abs(tDiff)<24*3600) return tDate.toISOTimeOfDayMy(); else return tDate.toISODateMy();
}
app.UTC2Readable=function(utcTime){ var tmp=new Date(Number(utcTime)*1000);   return tmp.toLocaleString();  }
//myISODATE=function(d){ return d.toISOString().substr(0,19);}
//unixNowMS=function(){var tmp=new Date(); return Number(tmp);}
//unixNow=function(){return Math.round(unixNowMS()/1000);}
app.unixNow=function(){return (new Date()).toUnix();}
app.nowSFloored=function(){ const t=new Date(); t.setMilliseconds(0); return t; }

app.getSuitableTimeUnit=function(t){ // t in seconds
  var tAbs=Math.abs(t), tSign=t>=0?+1:-1, strU
  lab:{
  if(tAbs<=90) {strU='s'; break lab;}
  tAbs/=60; // t in minutes
  if(tAbs<=90) {strU='m'; break lab;}; 
  tAbs/=60; // t in hours
  if(tAbs<=36) {strU='h'; break lab;}
  tAbs/=24; // t in days
  if(tAbs<=2*365) {strU='d'; break lab;}
  tAbs/=365; strU='y'; break lab;  // t in years 
  }
  tAbs=Math.round(tAbs)
  return [tSign*tAbs,strU];
}
app.getSuitableTimeUnitStr=function(tdiff,objLang=langHtml.timeUnit,boLong=0,boArr=0){
  var [ttmp,u]=getSuitableTimeUnit(tdiff), n=Math.round(ttmp);
  var strU=objLang[u][boLong][Number(n!=1)];
  if(boArr){  return [n,strU];  } else{  return n+' '+strU;   }
}
app.dosTime2Arr=function(dosDate,dosTime){
  var sec=(dosTime & 0x1f)*2;
  var minute=dosTime>>>5 & 0x3f;
  var hour=dosTime>>>11 & 0x1f;
  var date=dosDate & 0x1f;
  var month=dosDate>>>5 & 0xf;
  var year=1980+(dosDate>>>9 & 0x7f);
  return [year, month, date, hour, minute, sec];
}

app.dosTime2t=function(dosDate,dosTime){ //dosTime interpreted as local time
  var arr=dosTime2Arr(dosDate,dosTime);
  return new Date(arr[0], arr[1]-1, arr[2], arr[3], arr[4], arr[5]);
}

app.dosTime2tUTC=function(dosDate,dosTime){ //dosTime interpreted as UTC time
  var arr=dosTime2Arr(dosDate,dosTime);
  arr[1]=arr[1]-1;
  return new Date(Date.UTC.apply(undefined,arr));
}

app.t2dosTime=function(t){
  var sec=t.getSeconds();
  var minute=t.getMinutes();
  var hour=t.getHours();
  var date=t.getDate();
  var month=t.getMonth()+1;
  var year=t.getFullYear();
  var dosTime= Math.round(sec/2) |minute<<5 |hour<<11;
  var dosDate=date |month<<5 |(year-1980)<<9;
  return {dosDate,dosTime};
}

//
// Random
//
//declare global {var randomInt, randomHash, genRandomString} 

app.randomInt=function(min, max){    return min + Math.floor(Math.random() * (max - min + 1));  }
app.randomHash=function(){ return Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2);}
app.genRandomString=function(len) {
  //var characters = 'abcdefghijklmnopqrstuvwxyz';
  var characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var str ='';    
  for(var p=0; p<len; p++) {
    str+=characters[randomInt(0, characters.length-1)];
  }
  return str;
}

//
// Math
//
//declare global {var isNumber, sign, bound, closest2Val, preferedValue, numWithUnitPrefix, numWithUnitPrefixArr } 

app.isNumber=function(n) { return !isNaN(parseFloat(n)) && isFinite(n);}
app.sign=function(val){if(val<0) return -1; else if(val>0) return 1; else return 0;}

app.bound=function(value, opt_min, opt_max) {
  if (opt_min != null) value = Math.max(value, opt_min);
  if (opt_max != null) value = Math.min(value, opt_max);
  return value;
}

app.closest2Val=function(v, val){
  var bestFit=Number.MAX_VALUE, curFit, len=v.length, best_i;
  for(var i=0;i<len;i++){
    curFit=Math.abs(v[i]-val);
    if(curFit<bestFit) {bestFit=curFit; best_i=i;}
  }
  return [v[best_i],best_i];
}
app.preferedValue=function(x,IntPref){  var len=IntPref.length; for(var i=0;i<len;i++) {if(IntPref[i]>=x) return i;} return -1; } // [[wikipedia:prefered value]] (return index above)

app.numWithUnitPrefix=function(n){ if(n<1000) return n;     n=n/1000; if(n<1000) return n+'k';     n=n/1000; if(n<1000) return n+'M';     n=n/1000; if(n<1000) return n+'G';  return n+'T';}
app.numWithUnitPrefixArr=function(N){var l=N.length, StrOut=Array(l);for(var i=0;i<l;i++){ StrOut[i]=numWithUnitPrefix(N[i]); } return StrOut; }


//
// Data Formatting
//
//declare global {var arrObj2TabNStrCol, tabNStrCol2ArrObj, tabNStrCol2ArrObjGC, deserialize, calcBUFileName, parsePageNameHD, formatCSVAsHeadPrefix, convertKeyValueToObj, parseQS2, mySplit}
app.arrObj2TabNStrCol=function(arrObj){ //  Ex: [{abc:0,def:1},{abc:2,def:3}] => {tab:[[0,1],[2,3]],StrCol:['abc','def']}
    // Note! empty arrObj returns {tab:[]}
  var Ou={tab:[]}, lenI=arrObj.length, StrCol=[]; if(!lenI) return Ou;
  StrCol=Object.keys(arrObj[0]);  var lenJ=StrCol.length;
  for(var i=0;i<lenI;i++) {
    var row=arrObj[i], rowN=Array(lenJ);
    for(var j=0;j<lenJ;j++){ var key=StrCol[j]; rowN[j]=row[key]; }
    Ou.tab.push(rowN);
  }
  Ou.StrCol=StrCol;
  return Ou;
}
app.tabNStrCol2ArrObj=function(tabNStrCol){  //Ex: {tab:[[0,1],[2,3]],StrCol:['abc','def']}    =>    [{abc:0,def:1},{abc:2,def:3}] 
  var {StrCol, tab}=tabNStrCol; if(typeof tab=="undefined") return [];
  var arrObj=Array(tab.length);
  for(var i=0;i<tab.length;i++){
    var row={};
    for(var j=0;j<StrCol.length;j++){  var key=StrCol[j]; row[key]=tab[i][j];  }
    arrObj[i]=row;
  }
  return arrObj;
}
  // GC friendly version of the above
  // Note!!! If StrCol changes then this function wont work.
app.tabNStrCol2ArrObjGC=function(tabNStrCol, arrObj){ 
  var {StrCol, tab}=tabNStrCol; if(typeof tab=="undefined") {arrObj.length=0; return arrObj;}
  var len=tab.length; if(arrObj==undefined) arrObj=Array(len); else arrObj.length=len;
  for(var i=0;i<len;i++){
    if(arrObj[i]==undefined) arrObj[i]={};
    var row=arrObj[i];
    for(var j=0;j<StrCol.length;j++){  var key=StrCol[j]; row[key]=tab[i][j];  }
  }
  return arrObj;
}

app.deserialize=function(serializedJavascript){
  return eval(`(${serializedJavascript})`);
}

app.calcBUFileName=function(wwwSite,type,ending){
  var www=wwwSite.replace('/','_').replace(':','_'), date=swedDate(unixNow());
  return `${www}_${date}_${type}.${ending}`;
}

var regParsePageNameHD=RegExp('([^:]+):','g');
app.parsePageNameHD=function(strPage){ // parsePageNameHD (PageNameHD = pageName that is both Human- and Data-friendly)
  regParsePageNameHD.lastIndex=0;
  var obj={boTalk:false, boTemplate:false, strTemplateTalk:'', siteName:''}, lastIndex;
  while(true) {
    var Match=regParsePageNameHD.exec(strPage);
    if(Match==null) break;
    lastIndex=regParsePageNameHD.lastIndex;
    var tmp=Match[1]; 
    if(tmp=='talk') {obj.boTalk=true; obj.strTemplateTalk=tmp;}
    else if(tmp=='template') {obj.boTemplate=true; obj.strTemplateTalk=tmp;}
    else if(tmp=='template_talk') {obj.boTalk=true; obj.boTemplate=true; obj.strTemplateTalk=tmp;}
    else obj.siteName=tmp;
  }
  obj.pageNameA=strPage.substr(lastIndex);
  var strColon=obj.strTemplateTalk.length?':':'';
  obj.pageName=obj.strTemplateTalk+strColon+obj.pageNameA;
  //obj.pageName=strPage.substr(lastIndex);
  return obj;
}

app.formatCSVAsHeadPrefix=function(arrHead,arrRow){
  var arrType=Array(arrHead.length);
  arrHead.forEach(function(str,ind){
    var strType;
    if(str.slice(0,2)=='bo' && isUpperCase(str[2])) strType='boolean';
    else if(str.slice(0,3)=='int' && isUpperCase(str[3])) strType='number';
    else if(str[0]=='n' && isUpperCase(str[1])) strType='number';
    else if(str[0]=='t' && isUpperCase(str[1])) strType='number';
    else strType='string';
    arrType[ind]=strType;
    //arrHead[ind]=str;
  });
  arrRow.forEach(function(row, iRow){
    row.forEach(function(val, iCol){
      if(arrType[iCol]=='boolean') val=val.toLowerCase()=='true';
      else if(arrType[iCol]=='number') val=Number(val);
      row[iCol]=val;
    });
    arrRow[iRow]=row;
  });
  
}

app.convertKeyValueToObj=function(arr){
  var oOut={};
  arr.forEach(function(it){oOut[it.name]=it.value;});
  return oOut;
}


// app.parseQS2=function(qs){
//   var objQS={}, objTmp=new URLSearchParams(qs);
//   for(const [name, value] of objTmp) {  objQS[name]=value;  }
//   return objQS;
// }


app.mySplit=function(str, sep, n) {
  var out = [];
  while(n--) out.push(str.slice(sep.lastIndex, sep.exec(str).index));
  out.push(str.slice(sep.lastIndex));
  return out;
}
//console.log(mySplit("a=b=c=d", /=/g, 2)); // ['a', 'b', 'c=d']

app.mySplit=function(str, sep, n=Infinity) {
  var out = [];
  while(n--) {
    var iStart=sep.lastIndex, result=sep.exec(str)
    if(result===null) {
      out.push(str.slice(iStart)); return out;
    }
    out.push(str.slice(iStart, result.index));
  }
  out.push(str.slice(sep.lastIndex));
  return out;
}
//console.log(mySplit("a=b=c=d", /=/g, 2)); // ['a', 'b', 'c=d']
//console.log(mySplit("a  b  c  d", /\s+/g, 2)); // ['a', 'b', 'c=d']

//
// Escaping data
//
//declare global {var myJSEscape, myAttrEscape, myLinkEscape}

app.myJSEscape=function(str){return str.replace(/&/g,"&amp;").replace(/</g,"&lt;");}
  // myAttrEscape
  // Only one of " or ' must be escaped depending on how it is wrapped when on the client.
app.myAttrEscape=function(str){return str.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/\//g,"&#47;");} // This will keep any single quataions.
app.myLinkEscape=function(str){ str=myAttrEscape(str); if(str.startsWith('javascript:')) str='javascript&#58;'+str.substr(11); return str; }
