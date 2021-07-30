



"use strict"


app.sanitize=function(attrIn,tag){
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


app.sanitizeStyle=function(attrIn){
  var out=attrIn.replace(RegExp('expression|behavior|javascript|-moz-binding','i'),function(m){return 'MM'+m;});
  return out;
}




  // makeMatVersion: compacting things:
  // Ex: input:  Version=[{tMod:X, summary:'bla', signature:'meh'}, {tMod:Y, summary:'blo', signature:'meehh'}]
  //     output: t=[[X, 'bla', 'meh'], [Y, 'blo', 'meehh']]
app.makeMatVersion=function(Version){ 
  var nVersion=Version.length, t=Array(nVersion);
  for(var i=0;i<nVersion;i++){    t[i]=[Version[i].tMod, Version[i].summary, Version[i].signature];   }  return t;
}

app.parse=function*(flow, arg) {
  var mPa=new Parser(arg.strEditText, arg.boOW==0);
  mPa.text=arg.strEditText;
  mPa.preParse();
  var StrTemplate=mPa.getStrTemplate();

    // Site specifiaction may come in two ways:
  var sqlSiteQuery="www=?", siteArg=arg.wwwSite; if(!siteArg) { sqlSiteQuery="siteName=?"; siteArg=arg.siteName;}
    
    // get objTemplate from DB
  var len=StrTemplate.length, objTemplate={};   
  if(len) {
    var strQ=array_fill(len,'?').join(', ');
    var sql="SELECT pageName, data FROM "+pageLastSiteView+" p JOIN "+fileTab+" f WHERE f.idFile=p.idFile AND "+sqlSiteQuery+" AND pageName IN ("+strQ+")";
    var Val=[siteArg].concat(StrTemplate);
    var [err, results]=yield* arg.myMySql.query(flow, sql, Val);  if(err) return [err, []]; 
     
    for(var i=0;i<results.length;i++){ var tmpR=results[i]; objTemplate[tmpR.pageName]=tmpR.data; }
  }


  var len=StrTemplate.length;
  var objTemplateE={}; for(var i=0;i<len;i++) { var key=StrTemplate[i]; objTemplateE[key]=key in objTemplate; }
  mPa.objTemplate=objTemplate;    mPa.parse();
  var StrSub=mPa.getStrSub(), StrSubImage=mPa.getStrSubImage();


    // get objExistingSub from DB
  var len=StrSub.length, objExistingSub={};
  if(len) {
    var strQ=array_fill(len,'?').join(', ');
    var sql="SELECT pageName FROM "+pageLastSiteView+" WHERE pageName IN ("+strQ+") AND "+sqlSiteQuery+"";
    var Val=StrSub.concat(siteArg);
    var [err, results]=yield* arg.myMySql.query(flow, sql, Val);  if(err) return [err, []]; 
    
    for(var i=0;i<results.length;i++){ var tmpR=results[i]; objExistingSub[tmpR.pageName]=1; }
  }


  mPa.objExistingSub=objExistingSub; mPa.setArrSub();      mPa.endParse();
  var strHtmlText=mPa.text, arrSub=mPa.arrSub;
  
  //var strHash=md5(strHtmlText +JSON.stringify(objTemplateE) +arg.tMod +arg.boOR +arg.boOW +arg.boSiteMap +arg.boTalkExist +JSON.stringify(arg.arrVersionCompared) +JSON.stringify(arg.matVersion));

  //var Ou={StrTemplate, objTemplateE, StrSub, StrSubImage, strHtmlText, arrSub, strHash};
  var Ou=[objTemplateE, StrSubImage, strHtmlText, arrSub];
  return [null, Ou];
}

  // createObjTemplateE: compacting things:
  // Ex: input:  arrOrg=[{pageName:"template:bla", boOnWhenCached:true}, {pageName:"template:blo", boOnWhenCached:false}]
  //     output: objOut={"bla":true, "blo":false}
app.createObjTemplateE=function(arrOrg){  
  var c=arrOrg.length;
  var objOut={}; 
  for(var i=0;i<c;i++){ 
    var tmpR=arrOrg[i];
    var tmpname=tmpR.pageName.replace(RegExp('^template:'),''); objOut[tmpname]=tmpR.boOnWhenCached; 
  }
  return objOut;
}



app.createSubStr=function(arrSub){ // arrSub = [[name,boExist], [name,boExist] ....]   (assigned by setArrSub (in parser.js)) 
  var arrSubQ=[],  arrSubV=[];
  for(var i=0;i<arrSub.length;i++){ var v=arrSub[i]; arrSubQ.push('(?,?)'); [].push.apply(arrSubV,v); }  //arrSubV.push(v[0], v[1], v[2])
  var strSubQ=''; if(arrSubQ.length) strSubQ="INSERT INTO tmpSubNew VALUES "+arrSubQ.join(', ')+';';
  return [strSubQ,arrSubV];
}
app.createSubImageStr=function(StrT){
  var len=StrT.length,  strSubQ=''; if(len) strSubQ="INSERT INTO tmpSubNewImage VALUES "+array_fill(len,'(?)').join(', ')+';';
  return strSubQ;
}

//createSaveByReplaceSQL=function(siteName, wwwSite, strName, strEditText, strHtmlText, strHash, arrSub, StrSubImage){ 
  //var [strSubQ,arrSubV]=createSubStr(arrSub);
  //var strSubImageQ=createSubImageStr(StrSubImage);
  //var Sql=[sqlTmpSubNewCreate+';', sqlTmpSubNewImageCreate+';'];
  //Sql.push("TRUNCATE tmpSubNew; "+strSubQ); // START TRANSACTION; 
  //Sql.push("TRUNCATE tmpSubNewImage; "+strSubImageQ);
  //Sql.push("CALL "+strDBPrefix+"saveByReplace(?,?,?,?,?,?,@Omess);");  //  COMMIT;
  //Sql.push("SELECT @Omess AS mess");
  //var sql=Sql.join('\n'); 
  //var Val=array_merge(arrSubV, StrSubImage, [siteName, wwwSite, strName, strEditText, strHtmlText, strHash]);
  ////return {sql,Val,nEndingResults:1};
  //return {sql,Val};
//}

app.createSaveByAddSQL=function(wwwSite, strName, summary, signature, strEditText, strHtmlText, strHash, arrSub, StrSubImage){ 
  var [strSubQ,arrSubV]=createSubStr(arrSub);
  var strSubImageQ=createSubImageStr(StrSubImage);
  //var Sql=[sqlTmpSubNewCreate+';', sqlTmpSubNewImageCreate+';'];
  //Sql.push("TRUNCATE tmpSubNew; "+strSubQ); // START TRANSACTION; 
  //Sql.push("TRUNCATE tmpSubNewImage; "+strSubImageQ);
  var Sql=[];
  Sql.push("DROP TEMPORARY TABLE IF EXISTS tmpSubNew;", sqlTmpSubNewCreate+';', strSubQ);
  Sql.push("DROP TEMPORARY TABLE IF EXISTS tmpSubNewImage;", sqlTmpSubNewImageCreate+';', strSubImageQ);
  Sql.push("CALL "+strDBPrefix+"saveByAdd(?,?,?,?,?,?,?);"); //  COMMIT;
  var sql=Sql.join('\n');
  var Val=array_merge(arrSubV, StrSubImage, [wwwSite, strName, summary, signature, strEditText, strHtmlText, strHash]);
  return {sql,Val,nEndingResults:1};
}

app.createSetNewCacheSQL=function(wwwSite, strName, rev, strHtmlText, strHash, arrSub, StrSubImage){
  var [strSubQ,arrSubV]=createSubStr(arrSub);
  var strSubImageQ=createSubImageStr(StrSubImage);
  //var Sql=[sqlTmpSubNewCreate+';', sqlTmpSubNewImageCreate+';'];
  //Sql.push("TRUNCATE tmpSubNew; "+strSubQ); // START TRANSACTION; 
  //Sql.push("TRUNCATE tmpSubNewImage; "+strSubImageQ);
  var Sql=[];
  Sql.push("DROP TEMPORARY TABLE IF EXISTS tmpSubNew;", sqlTmpSubNewCreate+';', strSubQ);
  Sql.push("DROP TEMPORARY TABLE IF EXISTS tmpSubNewImage;", sqlTmpSubNewImageCreate+';', strSubImageQ);
  Sql.push("CALL "+strDBPrefix+"setNewCache(?,?,?,?,?);"); //  COMMIT;
  var sql=Sql.join('\n');
  var Val=array_merge(arrSubV, StrSubImage, [wwwSite, strName, rev, strHtmlText, strHash]);
  return {sql,Val,nEndingResults:1}; 
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.is_crawler=function() {
   //sites = 'Google|msnbot|Rambler|Yahoo|AbachoBOT|accoona|AcioRobot|ASPSeek|CocoCrawler|Dumbot|FAST-WebCrawler|GeonaBot|Gigabot|Lycos|MSRBOT|Scooter|AltaVista|IDBot|eStyle|Scrubby|ozi';
   var sites='Googlebot|Yammybot|Openbot|Yahoo|Slurp|msnbot|ia_archiver|Lycos|Scooter|AltaVista|Teoma|Gigabot|Googlebot-Mobile';  
   //sites='Googlebot|Yammybot|Openbot|Yahoo|Slurp|msnbot|ia_archiver|Lycos|Scooter|AltaVista|Teoma|Gigabot|Googlebot-Mobile|Gecko';  
   var ua=this.req.headers['user-agent']||''; 
   return RegExp(sites).test(ua);  
}

app.writeCacheDynamicJS=function*(flow) {
  var buf=createCommonJS();
  var [err]=yield* CacheUri.set(flow, '/'+leafCommon, buf, 'js', true, true);   if(err) return [err];
  return [null];
}

app.createCommonJS=function() {
  var Str=[];
  var StrVar=['boDbg', 'urlPayPal', 'maxAdminWUnactivityTime', 'version', 'intMax', 'leafBE', 'strSalt', 'StrImageExt', 'flFoundOnTheInternetFolder', 'flLibImageFolder', 'maxGroupsInFeat', 'bFlip', 'PropPage', 'PropImage', 'StrOrderFiltPage', 'StrOrderFiltImage', 'nHash', 'strBTC', 'ppStoredButt'];
  var tmp=copySome({},app,StrVar);
  tmp.trash='trash';
  Str.push(`assignCommonJS=function(){
  var tmp=`+JSON.stringify(tmp)+`;
  extend(window,tmp);
}`);
  var str=Str.join('\n');    return str;
}


app.regTalk=RegExp('^(talk|template_talk):','i');
app.regTalkNTemplateNSite=RegExp('^(talk:|template:|template_talk:|)(?:([^:]+):)?(.+)','i');

app.calcTalkName=function(pageName){ // Examples: "abc"=>"talk:abc", "template:abc"=>"template_talk:abc", "talk:abc"=>"", "template_talk:abc"=>""
  var talkPage='';
  if(!regTalk.test(pageName)){
    if(pageName.substr(0,9)=='template:') talkPage='template_talk:'+pageName; else talkPage='talk:'+pageName;
  }
  return talkPage;
}




app.createManifest=function(arg){
  var {siteName, www, srcIcon16}=arg;

  //var srcIcon16=srcIcon16 || srcIcon16Default;
  var Match=srcIcon16.match(/^.*\.([0-9a-zA-Z]+)$/);
  var strType=Match?mime.getType(Match[1]):'';
  var Match=srcIcon16.match(/^(.*)16(.*)$/);

  var IntSizeIcon=[16, 114, 192, 200, 512, 1024];
  //IntSizeIconFlip=array_flip(IntSizeIcon);
  if(Match) {
    var [, p1, p2]=Match;
    var icons=Array(IntSizeIcon.length);
    IntSizeIcon.forEach((size, ind)=>{icons[ind]={ src: p1+size+p2, type:strType, sizes: size+"x"+size, purpose: "any maskable" }; })
  } else { var icons=[{ src: srcIcon16, type:strType, sizes: "16x16", purpose: "any maskable" }]}
  var uSite="https://"+www;
  let objOut={theme_color:"#fff", background_color:"#fff", display:"minimal-ui", prefer_related_applications:false,  short_name:siteName, name:siteName, start_url: uSite, icons }
  
  //let str=serialize(objOut);
  let str=JSON.stringify(objOut);
  return str;
}


app.createManifestNStoreToCache=function*(flow, arg){
  var {www}=arg;
  var strT=createManifest(arg);
  var buf=Buffer.from(strT, 'utf8');
  var [err]=yield* CacheUri.set(flow, www+'/'+leafManifest, buf, 'json', true, false);   if(err) return [err];
  return [null];
}
app.createManifestNStoreToCacheMult=function*(flow, results){
  for(var i=0;i<results.length;i++){   var [err]=yield* createManifestNStoreToCache(flow, results[i]);   if(err) return [err];   }
  return [null];
}
app.createManifestNStoreToCacheFrDB=function*(flow, myMySql){
  var sql="SELECT boDefault, boTLS, idSite, siteName, www, googleAnalyticsTrackingID, srcIcon16, strLangSite, UNIX_TIMESTAMP(tCreated) AS tCreated FROM "+siteTab+" GROUP BY idSite;"
  var [err, results]=yield* myMySql.query(flow, sql); if(err) return [err];
  var [err]=yield* createManifestNStoreToCacheMult(flow, results);   if(err) return [err];
  return [null];
}
