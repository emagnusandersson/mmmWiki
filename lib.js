
boBrowser=(typeof window != 'undefined' && window.document);

thisChanged=function(func,selfT){return function(){return func.apply(selfT,arguments);}}

thisChangedWArg=function(func,selfT,inObj){
  return function(){ var Arg = Array.prototype.slice.call(arguments); Arg.push(inObj); return func.apply(selfT,Arg);}
}



function getCookie(n) {
    let a = `; ${document.cookie}`.match(`;\\s*${n}=([^;]+)`);
    return a ? a[1] : '';
}

MyAsync=function(Func,finF){
  var self=this;
  if(typeof Func=='undefined') Func=[]; if(typeof finF=='undefined') finF=[]; 
  this.Func=Func;   this.iSeries=0; this.Res=[]; this.resLast=undefined, this.finF=finF; 
  this.cb=function(err,res){ 
    self.storeRes(err,res);
    self.iSeries++; 
    //console.log(self.iSeries+'/'+self.Func.length);
    //if(err) console.log('Err '+err);
    if(err || self.iSeries>=self.Func.length) {  self.finF(err,self.Res); return;} // console.log('Exit'); 
    self.Func[self.iSeries](self.cb);
  };
}
MyAsync.prototype.storeRes=function(err,res){ 
  this.Res[this.iSeries]=res; this.resLast=res;
};
MyAsync.prototype.go=function(){
  this.Func[this.iSeries](this.cb);
}
MyAsync.prototype.doneNTrunk=function(err,res){this.Res[this.iSeries]=res;  this.Func=[]; this.iSeries=0; this.finF(err,self.Res);}
MyAsync.prototype.trunkNoFin=function(){}




//
// String
//

ucfirst=function(string){  return string.charAt(0).toUpperCase() + string.slice(1);  }
isAlpha=function(star){  var regEx = /^[a-zA-Z0-9]+$/;  return str.match(regEx); } 
String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g,"");}

arrArrange=function(arrV,arrI){
  var arrNew=[]; if(typeof arrV=='String') arrNew='';
  //for(var i=0;i<arrI.length;i++){    arrNew.push(arrV[arrI[i]]);    }
  for(var i=0;i<arrI.length;i++){    arrNew[i]=arrV[arrI[i]];    }
  return arrNew;
}
pad2=function(n) {return (n<10?'0':'')+n;}
calcLabel=function(Label,strName){ var strLabel=ucfirst(strName); if(strName in Label) strLabel=Label[strName]; return strLabel;}

urldecode=function(url) {
  return decodeURIComponent(url.replace(/\+/g, ' '));
}

var print_r=function(o,boHTML){
  var tmp=JSON.stringify(o,null,'\t');
  if(typeof(boHTML) !='undefined' && boHTML) tmp=tmp.replace(/\n/g,'<br>').replace(/\t/g,'&nbsp;&nbsp;&nbsp;'); return tmp;
}


extractLoc=function(obj,strObjName){   // Ex: eval(extractLoc(objMy,'objMy'));
  var Str=[];  for(var key in obj) Str.push(key+'='+strObjName+'.'+key);
  var str=''; if(Str.length) str='var '+Str.join(', ')+';';  return str;
}
//extract=function(obj){  for(var key in obj){  window[key]=obj[key];  }  }
extract=function(obj,par){
  if(typeof par=='undefined') par=app; for(var key in obj){
    par[key]=obj[key];
  }
}
//extractLocSome=function(strObjName,arrSome){  // Ex: eval(extractLocSome('objMy',['a','b']));
  //if(typeof arrSome=='string') arrSome=[arrSome];
  //var len=arrSome.length, Str=Array(len);  for(var i=0;i<len;i++) { var key=arrSome[i]; Str[i]=key+'='+strObjName+'.'+key; }
  //return 'var '+Str.join(', ')+';';
//}




endsWith=function(str,end){return str.substr(-end.length)==end;}


//
// Array
//

arr_max=function(arr){return Math.max.apply(null, arr);}
arr_min=function(arr){return Math.min.apply(null, arr);}

array_flip=function(A){ var B={}; for(var i=0;i<A.length;i++){B[A[i]]=i;} return B;}
array_fill=function(n, val){ return Array.apply(null, new Array(n)).map(String.prototype.valueOf,val); }
array_merge=function(){  return Array.prototype.concat.apply([],arguments);  } // Does not modify origin
//array_mergeM=function(a,b){  a.push.apply(a,b); return a; } // Modifies origin (first argument)
array_mergeM=function(){var t=[], a=arguments[0], b=t.slice.call(arguments, 1), c=t.concat.apply([],b); t.push.apply(a,c); return a; } // Modifies origin (first argument)

mySplice1=function(arr,iItem){ var item=arr[iItem]; for(var i=iItem, len=arr.length-1; i<len; i++)  arr[i]=arr[i+1];  arr.length = len; return item; }  // GC-friendly splice
myCopy=function(arr,brr){ var len=brr.length; if(typeof arr=="undefined") arr=Array(len); for(var i=0; i<len; i++)  arr[i]=brr[i];  arr.length = len; return arr; }  // GC-friendly copy

is_array=function(a){return a instanceof Array;}
in_array=function(needle,haystack){ return haystack.indexOf(needle)!=-1;}
array_filter=function(A,f){f=f||function(a){return a;}; return A.filter(f);}

array_removeInd=function(a,i){a.splice(i,1);}


arrValMerge=function(arr,val){  var indOf=arr.indexOf(val); if(indOf==-1) arr.push(val); }
//arrValRemove=function(arr,val){  var indOf=arr.indexOf(val); if(indOf!=-1) arr.splice(indOf,1); }
arrValRemove=function(arr,val){  var indOf=arr.indexOf(val); if(indOf!=-1) mySplice1(arr,indOf); }

//
// Str (Array of Strings)
//

StrComp=function(A,B){var lA=A.length; if(lA!==B.length) return false; for(var i=0;i<lA;i++){ if(A[i]!==B[i]) return false;} return true;}

//
// Object
//

copySome=function(a,b,Str){for(var i=0;i<Str.length;i++) { var name=Str[i]; a[name]=b[name]; } return a; }
object_values=function(obj){
  var arr=[];      for(var name in obj) arr.push(obj[name]);
  return arr;
}
overwriteProperties=function(oGoal, oOrg){
    // If oGoal or oOrg has wrong type then return oGoal
  if(oGoal===undefined || oGoal===null || ['string', 'number', 'boolean'].indexOf(typeof oGoal)!==-1) return oGoal;
  if(oOrg===undefined || oOrg===null || ['string', 'number', 'boolean'].indexOf(typeof oOrg)!==-1) return oGoal;
  for(var k in oOrg)  if(oOrg.hasOwnProperty(k)) oGoal[k]= oOrg[k];
  return oGoal;
}
isEmpty=function(obj) {    return Object.keys(obj).length === 0;  }


//
// Dates and time
//

Date.prototype.toUnix=function(){return Math.round(this.valueOf()/1000);}
Date.prototype.toISOStringMy=function(){return this.toISOString().substr(0,19);}
arrMonths=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
arrDay=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
arrDay=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
mySwedDate=function(tmp){ 
  if(!tmp) return tmp;
  var t=UTC2JS(tmp), now=new Date(), diff=(Number(now)-Number(t))/1000; //, y=t.getFullYear(), mo=t.getMonth(), d=t.getDate();
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
swedDate=function(tmp){ if(tmp){tmp=UTC2JS(tmp);  tmp=tmp.getFullYear()+'-'+pad2(tmp.getMonth()+1)+'-'+pad2(tmp.getDate());}  return tmp;}
swedTime=function(tmp){ if(tmp){tmp=UTC2JS(tmp);  tmp=tmp.getFullYear()+'-'+pad2(tmp.getMonth()+1)+'-'+pad2(tmp.getDate())+' '+pad2(tmp.getHours())+':'+pad2(tmp.getMinutes());}  return tmp;}
UTC2JS=function(utcTime){ var tmp=new Date(Number(utcTime)*1000);  return tmp;  }
UTC2Readable=function(utcTime){ var tmp=new Date(Number(utcTime)*1000);   return tmp.toLocaleString();  }
//myISODATE=function(d){ return d.toISOString().substr(0,19);}
//unixNowMS=function(){var tmp=new Date(); return Number(tmp);}
//unixNow=function(){return Math.round(unixNowMS()/1000);}
unixNow=function(){return (new Date()).toUnix();}

getSuitableTimeUnit=function(t){ // t in seconds
  var tabs=Math.abs(t), tsign=t>=0?+1:-1;
  if(tabs<=90) return [tsign*tabs,'s'];
  tabs/=60; // t in minutes
  if(tabs<=90) return [tsign*tabs,'m']; 
  tabs/=60; // t in hours
  if(tabs<=36) return [tsign*tabs,'h'];
  tabs/=24; // t in days
  if(tabs<=2*365) return [tsign*tabs,'d'];
  tabs/=365; // t in years
  return [tsign*tabs,'y'];
}

dosTime2Arr=function(dosDate,dosTime){
  var sec=(dosTime & 0x1f)*2;
  var minute=dosTime>>>5 & 0x3f;
  var hour=dosTime>>>11 & 0x1f;
  var date=dosDate & 0x1f;
  var month=dosDate>>>5 & 0xf;
  var year=1980+(dosDate>>>9 & 0x7f);
  return [year, month, date, hour, minute, sec];
}

dosTime2t=function(dosDate,dosTime){ //dosTime interpreted as local time
  var arr=dosTime2Arr(dosDate,dosTime);
  return new Date(arr[0], arr[1]-1, arr[2], arr[3], arr[4], arr[5]);
}

dosTime2tUTC=function(dosDate,dosTime){ //dosTime interpreted as UTC time
  var arr=dosTime2Arr(dosDate,dosTime);
  arr[1]=arr[1]-1;
  return new Date(Date.UTC.apply(undefined,arr));
}



t2dosTime=function(t){
  var sec=t.getSeconds();
  var minute=t.getMinutes();
  var hour=t.getHours();
  var date=t.getDate();
  var month=t.getMonth()+1;
  var year=t.getFullYear();
  var dosTime= Math.round(sec/2) |minute<<5 |hour<<11;
  var dosDate=date |month<<5 |(year-1980)<<9;
  return {dosDate:dosDate,dosTime:dosTime};
}

//
// Random
//

randomInt=function(min, max){    return min + Math.floor(Math.random() * (max - min + 1));  }
randomHash=function(){ return Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2);}


//
// Math
//

isNumber=function(n) { return !isNaN(parseFloat(n)) && isFinite(n);}
sign=function(val){if(val<0) return -1; else if(val>0) return 1; else return 0;}

bound=function(value, opt_min, opt_max) {
  if (opt_min != null) value = Math.max(value, opt_min);
  if (opt_max != null) value = Math.min(value, opt_max);
  return value;
}

closest2Val=function(v, val){
  var bestFit=Number.MAX_VALUE, curFit, len=v.length, best_i;
  for(var i=0;i<len;i++){
    curFit=Math.abs(v[i]-val);
    if(curFit<bestFit) {bestFit=curFit; best_i=i;}
  }
  return [v[best_i],best_i];
}
preferedValue=function(x,IntPref){  var len=IntPref.length; for(var i=0;i<len;i++) {if(IntPref[i]>=x) return i;} return -1; } // [[wikipedia:prefered value]] (return index above)

numWithUnitPrefix=function(n){ if(n<1000) return n;     n=n/1000; if(n<1000) return n+'k';     n=n/1000; if(n<1000) return n+'M';     n=n/1000; if(n<1000) return n+'G';  return n+'T';}
numWithUnitPrefixArr=function(N){var l=N.length, StrOut=Array(l);for(var i=0;i<l;i++){ StrOut[i]=numWithUnitPrefix(N[i]); } return StrOut; }
//
// Data Formatting
//

arrObj2TabNStrCol=function(arrObj){ //  Ex: [{abc:0,def:1},{abc:2,def:3}] => {tab:[[0,1],[2,3]],StrCol:['abc','def']}
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
tabNStrCol2ArrObj=function(tabNStrCol){  //Ex: {tab:[[0,1],[2,3]],StrCol:['abc','def']}    =>    [{abc:0,def:1},{abc:2,def:3}] 
  var tab=tabNStrCol.tab, StrCol=tabNStrCol.StrCol, arrObj=Array(tab.length);
  for(var i=0;i<tab.length;i++){
    var row={};
    for(var j=0;j<StrCol.length;j++){  var key=StrCol[j]; row[key]=tab[i][j];  }
    arrObj[i]=row;
  }
  return arrObj;
}


calcBUFileName=function(wwwSite,type,ending){
  var www=wwwSite.replace('/','_').replace(':','_'), date=swedDate(unixNow());
  return www+'_'+date+'_'+type+'.'+ending;
}

regParsePageNameHD=RegExp('([^:]+):','g');
parsePageNameHD=function(strPage){ // parsePageNameHD (PageNameHD = pageName that is both Human- and Data-friendly)
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







//
// Found on the internet
//

/**
 * Calculate a 32 bit FNV-1a hash
 * Found here: https://gist.github.com/vaiorabbit/5657561
 * Ref.: http://isthe.com/chongo/tech/comp/fnv/
 *
 * @param {string} str the input value
 * @param {boolean} [asString=false] set to true to return the hash value as 
 *     8-digit hex string instead of an integer
 * @param {integer} [seed] optionally pass the hash of the previous chunk
 * @returns {integer | string}
 */
function hashFnv32a(str, asString, seed) {
    /*jshint bitwise:false */
    var i, l,
        hval = (seed === undefined) ? 0x811c9dc5 : seed;

    for (i = 0, l = str.length; i < l; i++) {
        hval ^= str.charCodeAt(i);
        hval += (hval << 1) + (hval << 4) + (hval << 7) + (hval << 8) + (hval << 24);
    }
    if( asString ){
        // Convert to 8 digit hex string
        return ("0000000" + (hval >>> 0).toString(16)).substr(-8);
    }
    return hval >>> 0;
}
