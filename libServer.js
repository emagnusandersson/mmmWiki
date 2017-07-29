






sanitize=function(attrIn,tag){
  var tag=tag.toLowerCase(), matches=[],  out=[];
    
  if(tag=='tr') {
    var tmp='colspan';
    var arr=[]; attrIn.replace(RegExp('('+tmp+')\\s*=\\s*[^\\s]+(?=\\s|$)','i'),function(m,n){arr.push(m); return m;}); if(arr.length) out.push(arr.join(' '));
  }
  else if(tag=='td') {
    var tmp='rowspan|colspan';
    var arr=[]; attrIn.replace(RegExp('('+tmp+')\\s*=\\s*[^\\s]+(?=\\s|$)','i'),function(m,n){arr.push(m); return m;}); if(arr.length) out.push(arr.join(' '));
  }
  else if(tag=='br') {
    var arr=[]; attrIn.replace(RegExp('clear\\s*=\\s*all','i'),function(m,n){arr.push(m); return m;}); if(arr.length) out.push(arr.join(' '));
  }
  else if(tag=='source') {
    var arr=[]; attrIn.replace(RegExp('src\\s*=\\s*[^\\s]+(?=\\s|$)','i'),function(m,n){arr.push(m); return m;}); if(arr.length) out.push(arr.join(' '));
  }
  else if(tag=='video') {
    var tmp='controls|poster';
    var arr=[]; attrIn.replace(RegExp('('+tmp+')\\s*=\\s*[^\\s]+(?=\\s|$)','i'),function(m,n){arr.push(m); return m;}); if(arr.length) out.push(arr.join(' '));
  }
  else if(tag=='iframe') {
    var tmp='scrolling';
    var arr=[]; attrIn.replace(RegExp('('+tmp+')\\s*=\\s*[^\\s]+(?=\\s|$)','i'),function(m,n){arr.push(m); return m;}); if(arr.length) out.push(arr.join(' '));   
    var arr=[]; attrIn.replace(RegExp('src\\s*=\\s*[^\\s]+(?=\\s|$)','i'),function(m,n){arr.push(m); return m;}); if(arr.length) out.push(arr.join(' '));
  }
  else if(tag=='img') {
    var arr=[]; attrIn.replace(RegExp('src\\s*=\\s*[^\\s]+(?=\\s|$)','i'),function(m,n){arr.push(m); return m;}); if(arr.length) out.push(arr.join(' ')); 
  }
  else if( RegExp('('+simpleTags+')').test(tag) ) {
  }

  var arr=[]; attrIn.replace(RegExp('class\\s*=\\s*[^\\s]+(?=\\s|$)','i'),function(m,n){arr.push(m); return m;}); if(arr.length) out.push(arr.join(' '));
    
  var arr=[]; attrIn.replace(RegExp('style\\s*=\\s*\\"([^\\"]*?)\\"','i'),function(m,n){arr.push(n); return m;}); 
  if(arr.length==0) attrIn.replace(RegExp('style\\s*=\\s*\\\'([^\\"]*?)\\\'','i'),function(m,n){arr.push(n); return m;});  // If no double quoted attribute, the try single quoted attribute
  if(arr.length){
    var text=sanitizeStyle(arr[0]);  out.push(' style="'+text+'"'); 
  }
  out=out.join(' ');

  return out;
}


sanitizeStyle=function(attrIn){
  var out=attrIn.replace(RegExp('expression|behavior|javascript|-moz-binding','i'),function(m){return 'MM'+m;});
  return out;
}



//myDump=function(a,boStr){ if(typeof boStr=='undefined') boStr=1; var str='<pre>'+print_r(a,1)+'</pre>'; if(boStr) echo str; else return str;}
//lcnotfirst=function(str){  if(count(str)>1) return str[0]+substr(str,1).toLowerCase(); else return str; }  // Make all except first lowercase


calcETag=function(){ return md5(this.strHtmlText +this.tMod +this.tModCache +this.boOR +this.boOW +this.boSiteMap +this.boTalkExist +JSON.stringify(this.objTemplateE) +JSON.stringify(this.arrVersionCompared) +JSON.stringify(this.matVersion)  );}


makeMatVersion=function(Version){ 
  var nVersion=Version.length, t=Array(nVersion);
  for(var i=0;i<nVersion;i++){    t[i]=[Version[i].tMod, Version[i].summary, Version[i].signature];   }  return t;
}

parse=function*() { // Should be seen as a method  (assigns things to this)
  var req=this.req, flow=req.flow;
  var Ou={};
  var mPa=new Parser(this.strEditText, this.boOW==0);
  mPa.text=this.strEditText;
  mPa.preParse();
  this.StrTemplate=mPa.getStrTemplate();

    // get objTemplate from DB
  var len=this.StrTemplate.length, objTemplate={};   
  if(len) {
    var strQ=array_fill(len,'?').join(', ');
    var sql="SELECT pageName, data FROM "+pageLastView+" p JOIN "+fileTab+" f WHERE f.idFile=p.idFile AND www=? AND pageName IN ("+strQ+")";
    var Val=[this.req.wwwSite].concat(this.StrTemplate);
    var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool);   if(err) { extend(Ou, {mess:'err', err:err}); return Ou; }
     
    for(var i=0;i<results.length;i++){ var tmpR=results[i]; objTemplate[tmpR.pageName]=tmpR.data; }
  }


  var len=this.StrTemplate.length;
  this.objTemplateE={}; for(var i=0;i<len;i++) { var key=this.StrTemplate[i]; this.objTemplateE[key]=key in objTemplate; }
  mPa.objTemplate=objTemplate;    mPa.parse();
  this.StrSub=mPa.getStrSub(); this.StrSubImage=mPa.getStrSubImage();


    // get objExistingSub from DB
  var len=this.StrSub.length, objExistingSub={};
  if(len) {
    var strQ=array_fill(len,'?').join(', ');
    var sql="SELECT pageName FROM "+pageLastView+" WHERE pageName IN ("+strQ+") AND www=?";
    var Val=this.StrSub.concat(this.req.wwwSite);
    var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool);  if(err) { extend(Ou, {mess:'err', err:err}); return Ou; }
    
    for(var i=0;i<results.length;i++){ var tmpR=results[i]; objExistingSub[tmpR.pageName]=1; }
  }


  mPa.objExistingSub=objExistingSub; mPa.setArrSub();      mPa.endParse();
  this.strHtmlText=mPa.text;  this.arrSub=mPa.arrSub; this.eTag=calcETag.call(this);

  //callback(null,0);
  extend(Ou, {mess:'OK'}); return Ou;
}

getInfoNData=function*() {
  var req=this.req, flow=req.flow;
  var Ou={};
  var sql="CALL "+strDBPrefix+"getInfoNData(?, ?, ?, ?, ?, ?, ?);"; 
  var Val=[this.boFront, req.boTLS, req.wwwSite, this.queredPage, this.rev, this.eTagIn, this.requesterCacheTime/1000];
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool);  if(err) { extend(Ou, {mess:'err', err:err}); return Ou; }
  var len=results.length, iRowLast=len-2; 
  var rowLast=results[iRowLast][0]; 
  //if('strEditText' in rowLast) rowLast.strEditText=rowLast.strEditText?rowLast.strEditText.toString():'';
  //if('strHtmlText' in rowLast) rowLast.strHtmlText=rowLast.strHtmlText?rowLast.strHtmlText.toString():'';
  if('rev' in rowLast) rowLast.version=rowLast.rev+1;
  if('tMod' in rowLast) rowLast.tMod=new Date(rowLast.tMod*1000);
  if('tModCache' in rowLast) rowLast.tModCache=new Date(rowLast.tModCache*1000);


  var mess=rowLast.mess, nRes=0;
  if(mess=='serverCacheOK') nRes=6;
  else if(mess=='serverCacheStale') nRes=4;
  else if(mess=='304' || mess=='noSuchRev' || mess=='zeroVersion' ) nRes=3; 
  else if(mess=='noSuchPage' || mess=='redirectCase' || mess=='private' ) nRes=2; 
  else if(mess=='IwwwNotFound') nRes=1; 
  else if(mess=='redirect' || mess=='redirectDomain' || mess=='multDefault') nRes=0;

  if(nRes>0) {  var tmp=results[0][0]; copySome(this,tmp,['boTLSCommon', 'wwwCommon']); }
  if(nRes>1) {  var tmp=results[1][0]; copySome(this,tmp,['siteName', 'googleAnalyticsTrackingID', 'urlIcon16', 'urlIcon200', 'aPassword', 'vPassword']); }
  if(nRes>2)    this.Version=results[2];
  if(nRes>3)    rowLast.strEditText=results[3][0].strEditText.toString();
  if(nRes>4)    rowLast.strHtmlText=results[4][0].strHtmlText.toString();
  if(nRes>5) {
    var resT=results[5], c=resT.length;
    var obj={}; 
    for(var i=0;i<c;i++){ 
      var tmpR=resT[i];
      var tmpname=tmpR.pageName.replace(RegExp('^template:'),''); obj[tmpname]=tmpR.boOnWhenCached; 
    }
    this.objTemplateE=obj;
  }

  //callback(null,rowLast);
  extend(Ou, {mess:'OK', row:rowLast}); return Ou;  
}


getInfo=function*() {
  var Ou={};
  var req=this.req, flow=req.flow;
  var sql="CALL "+strDBPrefix+"getInfo(?,?);", Val=[req.wwwSite, this.queredPage];
  var {err, results}=yield* myQueryGen(flow, sql, Val, mysqlPool);  if(err) { extend(Ou, {mess:'err', err:err}); return Ou; }
  var rowLast;
  if(results[0].length==0) { rowLast={mess:'noSuchPage'}; }
  else {
    rowLast=results[0][0];    rowLast.mess='pageExist';
    rowLast.tMod=new Date(rowLast.tMod*1000);
    rowLast.tModCache=new Date(rowLast.tModCache*1000);
  }
  //callback(null,rowLast);
  extend(Ou, {mess:'OK', row:rowLast}); return Ou; 
}


createSubStr=function(arrSub){ // arrSub = [[name,boExist], [name,boExist] ....]   (assigned by setArrSub (in parser.js)) 
  var arrSubQ=[],  arrSubV=[];
  for(var i=0;i<arrSub.length;i++){ var v=arrSub[i]; arrSubQ.push('(?,?)'); [].push.apply(arrSubV,v); }  //arrSubV.push(v[0], v[1], v[2])
  var strSubQ=''; if(arrSubQ.length) strSubQ="INSERT INTO "+tmpSubNew+" VALUES "+arrSubQ.join(', ')+';';
  return [strSubQ,arrSubV];
}
createSubImageStr=function(StrT){
  var len=StrT.length,  strSubQ=''; if(len) strSubQ="INSERT INTO "+tmpSubNewImage+" VALUES "+array_fill(len,'(?)').join(', ')+';';
  return strSubQ;
}

createSaveByReplaceSQL=function(siteName, wwwSite, strName, strEditText, strHtmlText, eTag, arrSub, StrSubImage){ 
  var [strSubQ,arrSubV]=createSubStr(arrSub);
  var strSubImageQ=createSubImageStr(StrSubImage);
  var Sql=[sqlTmpSubNewCreate+';', sqlTmpSubNewImageCreate+';'];
  Sql.push("START TRANSACTION; TRUNCATE "+tmpSubNew+"; "+strSubQ);
  Sql.push("TRUNCATE "+tmpSubNewImage+"; "+strSubImageQ);
  Sql.push("CALL "+strDBPrefix+"saveByReplace(?,?,?,?,?,?); COMMIT;");
  var sql=Sql.join('\n'); 
  var Val=array_merge(arrSubV, StrSubImage, [siteName, wwwSite, strName, strEditText, strHtmlText, eTag]);
  return {sql:sql,Val:Val,nEndingResults:2};
}

createSaveByAddSQL=function(wwwSite, strName, summary, signature, strEditText, strHtmlText, eTag, arrSub, StrSubImage){ 
  var [strSubQ,arrSubV]=createSubStr(arrSub);
  var strSubImageQ=createSubImageStr(StrSubImage);
  var Sql=[sqlTmpSubNewCreate+';', sqlTmpSubNewImageCreate+';'];
  Sql.push("START TRANSACTION; TRUNCATE "+tmpSubNew+"; "+strSubQ);
  Sql.push("TRUNCATE "+tmpSubNewImage+"; "+strSubImageQ);
  Sql.push("CALL "+strDBPrefix+"saveByAdd(?,?,?,?,?,?,?); COMMIT;");
  var sql=Sql.join('\n');
  var Val=array_merge(arrSubV, StrSubImage, [wwwSite, strName, summary, signature, strEditText, strHtmlText, eTag]);
  return {sql:sql,Val:Val,nEndingResults:2};
}

createSetNewCacheSQL=function(wwwSite, strName, rev, strHtmlText, eTag, arrSub, StrSubImage){
  var [strSubQ,arrSubV]=createSubStr(arrSub);
  var strSubImageQ=createSubImageStr(StrSubImage);
  var Sql=[sqlTmpSubNewCreate+';', sqlTmpSubNewImageCreate+';'];
  Sql.push("START TRANSACTION;");
  Sql.push("TRUNCATE "+tmpSubNew+"; "+strSubQ);
  Sql.push("TRUNCATE "+tmpSubNewImage+"; "+strSubImageQ);
  Sql.push("CALL "+strDBPrefix+"setNewCache(?,?,?,?,?); COMMIT;");
  var sql=Sql.join('\n');
  var Val=array_merge(arrSubV, StrSubImage, [wwwSite, strName, rev, strHtmlText, eTag]);
  return {sql:sql,Val:Val,nEndingResults:2}; 
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


echoAllAndExitObj=function(){
  //global Out,GRet; 
  Out.GRet=GRet;
  Out.GRet.strMessageText=Out.GRet.strMessageText.join(', ');; 
  //echo json_encode(Out);
}



is_crawler=function() {
   //sites = 'Google|msnbot|Rambler|Yahoo|AbachoBOT|accoona|AcioRobot|ASPSeek|CocoCrawler|Dumbot|FAST-WebCrawler|GeonaBot|Gigabot|Lycos|MSRBOT|Scooter|AltaVista|IDBot|eStyle|Scrubby|ozi';
   var sites='Googlebot|Yammybot|Openbot|Yahoo|Slurp|msnbot|ia_archiver|Lycos|Scooter|AltaVista|Teoma|Gigabot|Googlebot-Mobile';  
   //sites='Googlebot|Yammybot|Openbot|Yahoo|Slurp|msnbot|ia_archiver|Lycos|Scooter|AltaVista|Teoma|Gigabot|Googlebot-Mobile|Gecko';  
   var ua=this.req.headers['user-agent']||''; 
   return RegExp(sites).test(ua);  
}





  // getSetting and setSetting aren't maintained or used, I just keep them around because they might become useful.
getSetting=function*(inObj){ 
  var req=this.req;
  var Ou={}
  if( count(array_diff(inObj,['lastOthersEdit','lastOthersUpload'])) ) mesEO(__LINE__,'Illegal invariable');  strV=inObj.join("', '");;
  var sth=dbh.prepare("SELECT * FROM "+settingTab+" WHERE name IN('"+strV+"')");    if(!sth.execute()) mesESqlO(sth,__LINE__);
  while(1){   tmp=sth.fetch(PDO.FETCH_NUM); if(!tmp) break; Ou[tmp[0]]=tmp[1];  }
  return {err:null, result:[Ou]};
}

setSetting=function*(inObj){ 
  var req=this.req, Ou={}
  var Str=['lastOthersEdit','lastOthersUpload'];

  if( count(array_diff(array_keys(inObj), Str)) ) mesEO(__LINE__,'Illegal invariable');
  var sql="INSERT INTO "+settingTab+" (name,value) VALUES (?,?) ON DUPLICATE KEY UPDATE value=?";
  var sth=dbh.prepare(sql);  
  for(var name in inObj){
    var value=inObj[name];
    //if(!sth.execute([value,name])) mesESqlO(sth,__LINE__);
    if(!sth.execute([name,value,value])) mesESqlO(sth,__LINE__);
    Ou[name]=value;
  }
  return {err:null, result:[Ou]};
}




writeCacheDynamicJS=function*() {
  /*for(var key in Site){
    var buf=createWWWJS(key);
    var keyCache=key+'/'+leafSiteSpecific;
    CacheUri.set(keyCache, buf, 'js', true, true);
  }*/
  var buf=createCommonJS();
  yield* CacheUri.set.call(this, '/'+leafCommon, buf, 'js', true, true);
}

/*
var makeSiteLimited=function(site){
  var StrLimited=['wwwSite', 'strRootDomain', 'AliasBack', 'domain'];  
  var siteLimited={}; for(var i=0;i<StrLimited.length;i++){ var name=StrLimited[i]; siteLimited[name]=site[name]; }
  return siteLimited;
}
*/
/*
createWWWJS=function(strSite) {
  var site=Site[strSite], wwwSite=site.wwwSite; 

  var siteLimited=makeSiteLimited(site);

  var Str=[];
  Str.push("assignWWWJS=function(){\n\
\n\
strBTC="+JSON.stringify(strBTC)+";\n\
ppStoredButt="+JSON.stringify(ppStoredButt)+";\n\
wwwSite="+JSON.stringify(wwwSite)+";\n\
}");
  var str=Str.join('\n');    return str;
}
*/
// site="+JSON.stringify(siteLimited)+";\n\

createCommonJS=function() {
  var Str=[];
  Str.push("assignCommonJS=function(){\n\
\n\
boDbg="+JSON.stringify(boDbg)+";\n\
urlPayPal="+JSON.stringify(urlPayPal)+";\n\
\n\
maxAdminUnactivityTime="+JSON.stringify(maxAdminUnactivityTime)+";\n\
version="+JSON.stringify(version)+";\n\
intMax="+JSON.stringify(intMax)+";\n\
leafBE="+JSON.stringify(leafBE)+";\n\
strSalt="+JSON.stringify(strSalt)+";\n\
StrImageExt="+JSON.stringify(StrImageExt)+";\n\
flFoundOnTheInternetFolder="+JSON.stringify(flFoundOnTheInternetFolder)+";\n\
flLibImageFolder="+JSON.stringify(flLibImageFolder)+";\n\
maxGroupsInFeat="+JSON.stringify(maxGroupsInFeat)+";\n\
bFlip="+JSON.stringify(bFlip)+";\n\
PropPage="+JSON.stringify(PropPage)+";\n\
PropImage="+JSON.stringify(PropImage)+";\n\
StrOrderFiltPage="+JSON.stringify(StrOrderFiltPage)+";\n\
StrOrderFiltImage="+JSON.stringify(StrOrderFiltImage)+";\n\
}");
//versionC="+JSON.stringify(versionC)+";\n\

  var str=Str.join('\n');    return str;
}


regTalkNTemplateNSite=RegExp('^(talk:|template:|template_talk:|)(?:([^:]+):)?(.+)','i')


