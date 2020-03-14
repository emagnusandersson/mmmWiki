"use strict"
var app=(typeof window==='undefined')?global:window;

app.thisChanged=function(func,selfT){return function(){return func.apply(selfT,arguments);}}


//
// String
//

app.ucfirst=function(string){  return string.charAt(0).toUpperCase() + string.slice(1);  }
app.isAlpha=function(star){  var regEx = /^[a-zA-Z0-9]+$/;  return str.match(regEx); } 
//String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g,"");}
//String.prototype.ltrim = function() {return this.replace(/^\s+/,"");}
//String.prototype.rtrim = function() {return this.replace(/\s+$/,"");}

app.ltrim=function(str,charlist=String.raw`\s`){
  return str.replace(new RegExp("^[" + charlist + "]+"), "");
};
app.rtrim=function(str,charlist=String.raw`\s`){
  return str.replace(new RegExp("[" + charlist + "]+$"), "");
};
app.trim=function(str,charlist=String.raw`\s`){
  return str.replace(new RegExp("^[" + charlist + "]+([^" + charlist + "]*)[" + charlist + "]+$"), function(m,n){return n;});
}

app.arrArrange=function(arrV,arrI){
  var arrNew=[]; if(typeof arrV=='String') arrNew='';
  //for(var i=0;i<arrI.length;i++){    arrNew.push(arrV[arrI[i]]);    }
  for(var i=0;i<arrI.length;i++){    arrNew[i]=arrV[arrI[i]];    }
  return arrNew;
}
app.pad2=function(n) {return (n<10?'0':'')+n;}
app.calcLabel=function(Label,strName){ var strLabel=ucfirst(strName); if(strName in Label) strLabel=Label[strName]; return strLabel;}

app.urldecode=function(url) {
  url=url.replace(/\+/g, ' '); // Pluses shouldn't be in the url, but who knows;
  return decodeURIComponent(url); 
}


app.extractLoc=function(obj,strObjName){   // Ex: eval(extractLoc(objMy,'objMy'));
  var Str=[];  for(var key in obj) Str.push(key+'='+strObjName+'.'+key);
  var str=''; if(Str.length) str='var '+Str.join(', ')+';';  return str;
}
app.extract=function(obj,par=app){ for(var key in obj){ par[key]=obj[key]; } }
//extractLocSome=function(strObjName,arrSome){  // Ex: eval(extractLocSome('objMy',['a','b']));
  //if(typeof arrSome=='string') arrSome=[arrSome];
  //var len=arrSome.length, Str=Array(len);  for(var i=0;i<len;i++) { var key=arrSome[i]; Str[i]=key+'='+strObjName+'.'+key; }
  //return 'var '+Str.join(', ')+';';
//}

app.isUpperCase=function(c){return c == c.toUpperCase(); }



app.endsWith=function(str,end){return str.substr(-end.length)==end;}

app.str_repeat=function(str,n){ return Array(n+1).join(str);}


//
// Array
//

app.arr_max=function(arr){return Math.max.apply(null, arr);}
app.arr_min=function(arr){return Math.min.apply(null, arr);}

app.intersectionAB=function(A,B){var Rem=[]; for(var i=A.length-1;i>=0;i--){var a=A[i]; if(B.indexOf(a)==-1) A.splice(i,1); else Rem.push(a);} return Rem.reverse();}  // Changes A, returns the remainder
app.AMinusB=function(A,B){var ANew=[]; for(var i=0;i<A.length;i++){var a=A[i]; if(B.indexOf(a)==-1) ANew.push(a);} return ANew;}  // Does not change A, returns ANew
app.isAWithinB=function(A,B){ for(var i=0; i<A.length; i++){if(B.indexOf(A[i])==-1) return false;} return true;}  


app.array_flip=function(A){ var B={}; for(var i=0;i<A.length;i++){B[A[i]]=i;} return B;}
app.array_fill=function(n, val){ return Array.apply(null, new Array(n)).map(String.prototype.valueOf,val); }
app.array_merge=function(){  return Array.prototype.concat.apply([],arguments);  } // Does not modify origin
//app.array_mergeM=function(a,b){  a.push.apply(a,b); return a; } // Modifies origin (first argument)
app.array_mergeM=function(){var t=[], a=arguments[0], b=t.slice.call(arguments, 1), c=t.concat.apply([],b); t.push.apply(a,c); return a; } // Modifies origin (first argument)

app.mySplice1=function(arr,iItem){ var item=arr[iItem]; for(var i=iItem, len=arr.length-1; i<len; i++)  arr[i]=arr[i+1];  arr.length = len; return item; }  // GC-friendly splice
app.myCopy=function(arr,brr){ var len=brr.length; if(typeof arr=="undefined") arr=Array(len); for(var i=0; i<len; i++)  arr[i]=brr[i];  arr.length = len; return arr; }  // GC-friendly copy

app.is_array=function(a){return a instanceof Array;}
app.in_array=function(needle,haystack){ return haystack.indexOf(needle)!=-1;}
app.array_filter=function(A,f){f=f||function(a){return a;}; return A.filter(f);}

app.array_removeInd=function(a,i){a.splice(i,1);}


app.arrValMerge=function(arr,val){  var indOf=arr.indexOf(val); if(indOf==-1) arr.push(val); }
//app.arrValRemove=function(arr,val){  var indOf=arr.indexOf(val); if(indOf!=-1) arr.splice(indOf,1); }
app.arrValRemove=function(arr,val){  var indOf=arr.indexOf(val); if(indOf!=-1) mySplice1(arr,indOf); }



app.arrArrange=function(arrV,arrI){
  var n=arrI.length, arrNew;
  if(typeof arrV=='string') arrNew=''; else arrNew=Array(n);
  //for(var i=0;i<arrI.length;i++){    arrNew.push(arrV[arrI[i]]);    }
  for(var i=0;i<arrI.length;i++){    arrNew[i]=arrV[arrI[i]];    }
  return arrNew;
}

//
// Str (Array of Strings)
//

app.StrComp=function(A,B){var lA=A.length; if(lA!==B.length) return false; for(var i=0;i<lA;i++){ if(A[i]!==B[i]) return false;} return true;}

//
// Object
//

app.copySome=function(a,b,Str){for(var i=0;i<Str.length;i++) { var name=Str[i]; a[name]=b[name]; } return a; }
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


//
// Dates and time
//

Date.prototype.toUnix=function(){return Math.round(this.valueOf()/1000);}
Date.prototype.toISOStringMy=function(){return this.toISOString().substr(0,19);}
Date.prototype.toISODateMy=function(){return this.toISOString().substr(0,10);}
Date.prototype.toISOTimeOfDayMy=function(){return this.toISOString().substr(11,8);}
var arrMonths=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var arrDay=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var arrDay=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
app.mySwedDate=function(tmp){ 
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
app.swedDate=function(tmp, sep=''){ if(tmp){tmp=UTC2JS(tmp);  tmp=tmp.getFullYear()+sep+pad2(tmp.getMonth()+1)+sep+pad2(tmp.getDate());}  return tmp;}
app.swedTime=function(tmp){ if(tmp){tmp=UTC2JS(tmp);  tmp=tmp.getFullYear()+'-'+pad2(tmp.getMonth()+1)+'-'+pad2(tmp.getDate())+' '+pad2(tmp.getHours())+':'+pad2(tmp.getMinutes());}  return tmp;}
app.UTC2JS=function(utcTime){ var tmp=new Date(Number(utcTime)*1000);  return tmp;  }
app.UTC2TimeOrDate=function(utcTime){ 
  var tDate=new Date(Number(utcTime)*1000), tNow=new Date(), tDiff=(tNow-tDate)/1000;
  if(Math.abs(tDiff)<24*3600) return tDate.toISOTimeOfDayMy(); else return tDate.toISODateMy();
}
app.UTC2Readable=function(utcTime){ var tmp=new Date(Number(utcTime)*1000);   return tmp.toLocaleString();  }
//myISODATE=function(d){ return d.toISOString().substr(0,19);}
//unixNowMS=function(){var tmp=new Date(); return Number(tmp);}
//unixNow=function(){return Math.round(unixNowMS()/1000);}
app.unixNow=function(){return (new Date()).toUnix();}

app.getSuitableTimeUnit=function(t){ // t in seconds
  var tAbs=Math.abs(t), tSign=t>=0?+1:-1;
  if(tAbs<=90) return [tSign*tAbs,'s'];
  tAbs/=60; // t in minutes
  if(tAbs<=90) return [tSign*tAbs,'m']; 
  tAbs/=60; // t in hours
  if(tAbs<=36) return [tSign*tAbs,'h'];
  tAbs/=24; // t in days
  if(tAbs<=2*365) return [tSign*tAbs,'d'];
  tAbs/=365; // t in years
  return [tSign*tAbs,'y'];
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

app.randomInt=function(min, max){    return min + Math.floor(Math.random() * (max - min + 1));  }
app.randomHash=function(){ return Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2);}


//
// Math
//

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

app.arrObj2TabNStrCol=function(arrObj){ //  Ex: [{abc:0,def:1},{abc:2,def:3}] => {tab:[[0,1],[2,3]],StrCol:['abc','def']}
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
  var tab=tabNStrCol.tab, StrCol=tabNStrCol.StrCol, arrObj=Array(tab.length);
  for(var i=0;i<tab.length;i++){
    var row={};
    for(var j=0;j<StrCol.length;j++){  var key=StrCol[j]; row[key]=tab[i][j];  }
    arrObj[i]=row;
  }
  return arrObj;
}

app.deserialize=function(serializedJavascript){
  return eval('(' + serializedJavascript + ')');
}

app.calcBUFileName=function(wwwSite,type,ending){
  var www=wwwSite.replace('/','_').replace(':','_'), date=swedDate(unixNow());
  return www+'_'+date+'_'+type+'.'+ending;
}

app.regParsePageNameHD=RegExp('([^:]+):','g');
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


app.csvParseMy=function(strCSV){ // My parser of csv, where the type of each column is determined by the prefix of the column name.
  // var indNL=strCSV.search('\n'), strHead=strCSV.substr(0,indNL), arrHead=strHead.split(','), arrType=Array(arrHead.length); arrHead.forEach(function(str,ind){
  //   str=trim(str,'"'); arrHead[ind]=str;
  //   var strType;
  //   if(str.slice(0,2)=='bo' && isUpperCase(str[2])) strType='boolean';
  //   else if(str.slice(0,3)=='int' && isUpperCase(str[3])) strType='number';
  //   else if(str[0]=='n' && isUpperCase(str[1])) strType='number';
  //   else if(str[0]=='t' && isUpperCase(str[1])) strType='number';
  //   else strType='string';
  //   arrType[ind]=strType;
  // });
  
  var arrStr=[];
  var replaceStr=function(m, str){
    var i=arrStr.length;
    arrStr.push(str);
    return '"'+i+'"';
  }
  var putBackStr=function(m, str){ return arrStr[Number(str)];  }

  //strCSV="0, \"a\\\"b\", 1, \"a\"";
  //var regString=/"(.*?)(?<!\\)"/g;
  var regString=RegExp('"(.*?)(?<!\\\\)"', 'g');
  //strCSV.match(regString)
  strCSV=strCSV.trim();
  strCSV = strCSV.replace(regString, replaceStr);
  
  var arrAll=strCSV.split('\n');
  var arrHead=arrAll[0].trim().split(',');
  arrHead=arrHead.map(function(it){
    it = it.replace(/^"(.*)"$/, putBackStr); return it;
  })
  if(arrAll.length==1) return [arrHead,null];

  var arrRow=arrAll.slice(1);
  arrRow=arrRow.map(function(strRow){
    var row=strRow.trim().split(',');
    row=row.map(function(it){
      it = it.replace(/^"(.*)"$/, putBackStr); return it;
    });
    return row;
  });

  // var arrData;
  // var arrTmp=strCSV.substr(indNL).trim();
  // papaparse.parse(arrTmp, { complete: function(results, file) { //dynamicTyping:true,
  //     arrData=results.data;
  //   }, transform:function(val, col){
  //     if(arrType[col]=='boolean') return val.toLowerCase()=='true';
  //     else if(arrType[col]=='number') return Number(val);
  //     return val;
  //   }
  // });
  
  return [arrHead,arrRow];
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