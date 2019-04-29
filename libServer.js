






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

  // makeMatVersion: compacting things:
  // Ex: input:  Version=[{tMod:X, summary:'bla', signature:'meh'}, {tMod:Y, summary:'blo', signature:'meehh'}]
  //     output: t=[[X, 'bla', 'meh'], [Y, 'blo', 'meehh']]
makeMatVersion=function(Version){ 
  var nVersion=Version.length, t=Array(nVersion);
  for(var i=0;i<nVersion;i++){    t[i]=[Version[i].tMod, Version[i].summary, Version[i].signature];   }  return t;
}

parse=function*(flow, arg) {
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
  
  //var eTag=md5(strHtmlText +JSON.stringify(objTemplateE) +arg.tMod +arg.boOR +arg.boOW +arg.boSiteMap +arg.boTalkExist +JSON.stringify(arg.arrVersionCompared) +JSON.stringify(arg.matVersion));

  //var Ou={StrTemplate:StrTemplate, objTemplateE:objTemplateE, StrSub:StrSub, StrSubImage:StrSubImage, strHtmlText:strHtmlText, arrSub:arrSub, eTag:eTag};
  var Ou=[objTemplateE, StrSubImage, strHtmlText, arrSub];
  return [null, Ou];
}

  // createObjTemplateE: compacting things:
  // Ex: input:  arrOrg=[{pageName:"template:bla", boOnWhenCached:true}, {pageName:"template:blo", boOnWhenCached:false}]
  //     output: objOut={"bla":true, "blo":false}
createObjTemplateE=function(arrOrg){  
  var c=arrOrg.length;
  var objOut={}; 
  for(var i=0;i<c;i++){ 
    var tmpR=arrOrg[i];
    var tmpname=tmpR.pageName.replace(RegExp('^template:'),''); objOut[tmpname]=tmpR.boOnWhenCached; 
  }
  return objOut;
}



createSubStr=function(arrSub){ // arrSub = [[name,boExist], [name,boExist] ....]   (assigned by setArrSub (in parser.js)) 
  var arrSubQ=[],  arrSubV=[];
  for(var i=0;i<arrSub.length;i++){ var v=arrSub[i]; arrSubQ.push('(?,?)'); [].push.apply(arrSubV,v); }  //arrSubV.push(v[0], v[1], v[2])
  var strSubQ=''; if(arrSubQ.length) strSubQ="INSERT INTO tmpSubNew VALUES "+arrSubQ.join(', ')+';';
  return [strSubQ,arrSubV];
}
createSubImageStr=function(StrT){
  var len=StrT.length,  strSubQ=''; if(len) strSubQ="INSERT INTO tmpSubNewImage VALUES "+array_fill(len,'(?)').join(', ')+';';
  return strSubQ;
}

//createSaveByReplaceSQL=function(siteName, wwwSite, strName, strEditText, strHtmlText, eTag, arrSub, StrSubImage){ 
  //var [strSubQ,arrSubV]=createSubStr(arrSub);
  //var strSubImageQ=createSubImageStr(StrSubImage);
  //var Sql=[sqlTmpSubNewCreate+';', sqlTmpSubNewImageCreate+';'];
  //Sql.push("TRUNCATE tmpSubNew; "+strSubQ); // START TRANSACTION; 
  //Sql.push("TRUNCATE tmpSubNewImage; "+strSubImageQ);
  //Sql.push("CALL "+strDBPrefix+"saveByReplace(?,?,?,?,?,?,@Omess);");  //  COMMIT;
  //Sql.push("SELECT @Omess AS mess");
  //var sql=Sql.join('\n'); 
  //var Val=array_merge(arrSubV, StrSubImage, [siteName, wwwSite, strName, strEditText, strHtmlText, eTag]);
  ////return {sql:sql,Val:Val,nEndingResults:1};
  //return {sql:sql,Val:Val};
//}

createSaveByAddSQL=function(wwwSite, strName, summary, signature, strEditText, strHtmlText, eTag, arrSub, StrSubImage){ 
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
  var Val=array_merge(arrSubV, StrSubImage, [wwwSite, strName, summary, signature, strEditText, strHtmlText, eTag]);
  return {sql:sql,Val:Val,nEndingResults:1};
}

createSetNewCacheSQL=function(wwwSite, strName, rev, strHtmlText, eTag, arrSub, StrSubImage){
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
  var Val=array_merge(arrSubV, StrSubImage, [wwwSite, strName, rev, strHtmlText, eTag]);
  return {sql:sql,Val:Val,nEndingResults:1}; 
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




/*
  // getSetting and setSetting aren't maintained or used, I just keep them around because they might become useful.
getSetting=function*(inObj){ 
  var req=this.req;
  var Ou={}
  if( count(array_diff(inObj,['lastOthersEdit','lastOthersUpload'])) ) mesEO(__LINE__,'Illegal invariable');  strV=inObj.join("', '");;
  var sth=dbh.prepare("SELECT * FROM "+settingTab+" WHERE name IN('"+strV+"')");    if(!sth.execute()) mesESqlO(sth,__LINE__);
  while(1){   tmp=sth.fetch(PDO.FETCH_NUM); if(!tmp) break; Ou[tmp[0]]=tmp[1];  }
  return [null, [Ou]];
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
  return [null, [Ou]];
}
*/



writeCacheDynamicJS=function*(flow) {
  var buf=createCommonJS();
  var [err]=yield* CacheUri.set(flow, '/'+leafCommon, buf, 'js', true, true);   if(err) return [err];
  return [null];
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
maxAdminWUnactivityTime="+JSON.stringify(maxAdminWUnactivityTime)+";\n\
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


regTalk=RegExp('^(talk|template_talk):','i');
regTalkNTemplateNSite=RegExp('^(talk:|template:|template_talk:|)(?:([^:]+):)?(.+)','i');

calcTalkName=function(queredPage){ // Examples: "abc"=>"talk:abc", "template:abc"=>"template_talk:abc", "talk:abc"=>"", "template_talk:abc"=>""
  var talkPage='';
  if(!regTalk.test(queredPage)){
    if(queredPage.substr(0,9)=='template:') talkPage='template_talk:'+queredPage; else talkPage='talk:'+queredPage;
  }
  return talkPage;
}
