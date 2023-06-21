



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

app.parse=async function(sessionMongo, arg) {
  var {idSite, strEditText, boOW}=arg;
  
    // Parse ...
  var mPa=new Parser(strEditText, boOW==0);    mPa.preParse();


    // Create objTemplate
  var StrTemplate=mPa.getStrTemplate();  // [name, name ....]
  var len=StrTemplate.length, objTemplate={};
  var IdTemplate=Array(len); for(var i=0;i<len;i++){IdTemplate[i]=idSite+":"+StrTemplate[i].toLowerCase(); } 
  if(len) {
    var Arg=[ {_id:{$in:IdTemplate}}, {projection:{_id:1, pageName:1, idFileWiki:1}, session:sessionMongo}];
    var cursor=collectionPage.find(...Arg);
    var [err, PageTemplate]=await cursor.toArray().toNBP();   if(err) return [err, []];
    var lenId=PageTemplate.length, IdTemplateData=Array(lenId), objId={};
    for(var i=0;i<lenId;i++){ var {idFileWiki}=PageTemplate[i]; IdTemplateData[i]=idFileWiki; objId[idFileWiki.toString()]=PageTemplate[i]; } 

    var Arg=[ {_id:{$in:IdTemplateData}}, {session:sessionMongo}];
    var cursor=collectionFileWiki.find(...Arg);
    var [err, results]=await cursor.toArray().toNBP();   if(err) return [err, []];
    var lenD=results.length; if(lenId!==lenD) return [new Error('lenId!==lenD'), []];
    //for(var i=0;i<lenD;i++){ objTemplate[PageTemplate[i].pageName]=results[i].data; }
    for(var i=0;i<lenD;i++){ var {data,_id}=results[i]; objTemplate[objId[_id.toString()].pageName ]=data; }

  }

    // Parse (cont.)
  mPa.parse(objTemplate);


    // Extract Image arrays
  var {StrImage, StrImageLC}=mPa.getStrImage();


    // Create IdChildLax
  var StrChildLink=mPa.getStrChildLink();
  var StrChildLax=[...StrChildLink, ...StrTemplate];
  var IdChildLax=StrChildLax.map(str=>idSite+":"+str.toLowerCase());

    // Create IdChild, StrChild
  var len=IdChildLax.length; //objExistingSub={};
  if(len) {
    var Arg=[ {_id:{$in:IdChildLax}}, {projection:{_id:1, pageName:1}, collation:{locale:"en", strength:2}, session:sessionMongo}];
    var cursor=collectionPage.find(...Arg);
    var [err, results]=await cursor.toArray().toNBP();   if(err) return [err, {}];

    //for(var i=0;i<results.length;i++){ var tmpR=results[i]; objExistingSub[tmpR.pageName]=1; }
    var lExist=results.length, IdChild=Array(lExist), StrChild=Array(lExist);
    for(var i=0;i<lExist;i++){   var {_id, pageName}=results[i]; IdChild[i]=_id; StrChild[i]=pageName;}  

    //var IdChildLC=IdChild.map(str=>str.toLowerCase());
  } else {var IdChild=[], StrChild=[];}  


    // Parse (cont.)
  mPa.endParse(StrChild);

  
  return [null, {strHtmlText:mPa.text, IdChildLax, IdChild, StrImage, StrImageLC}];
}





/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.is_crawler=function() {
   //sites = 'Google|msnbot|Rambler|Yahoo|AbachoBOT|accoona|AcioRobot|ASPSeek|CocoCrawler|Dumbot|FAST-WebCrawler|GeonaBot|Gigabot|Lycos|MSRBOT|Scooter|AltaVista|IDBot|eStyle|Scrubby|ozi';
   var sites='Googlebot|Yammybot|Openbot|Yahoo|Slurp|msnbot|ia_archiver|Lycos|Scooter|AltaVista|Teoma|Gigabot|Googlebot-Mobile';  
   //sites='Googlebot|Yammybot|Openbot|Yahoo|Slurp|msnbot|ia_archiver|Lycos|Scooter|AltaVista|Teoma|Gigabot|Googlebot-Mobile|Gecko';  
   var ua=this.req.headers['user-agent']||''; 
   return RegExp(sites).test(ua);  
}



app.createCommonJS=function() {
  var Str=[];
  var StrVar=['boDbg', 'urlPayPal', 'maxAdminWUnactivityTime', 'version', 'intMax', 'leafBE', 'strSalt', 'StrImageExt', 'flFoundOnTheInternetFolder', 'flLibImageFolder', 'maxGroupsInFeat', 'bFlip', 'PropPage', 'PropImage', 'StrOrderFiltPage', 'StrOrderFiltImage', 'nHash', 'strBTC', 'ppStoredButt'];
  var tmp=copySome({},app,StrVar);
  const strTmp=JSON.stringify(tmp)
  Str.push(`app.assignCommonJS=function(){
  var tmp=${strTmp};
  Object.assign(window,tmp);
}`);
  var str=Str.join('\n');    return str;
}


//app.regTalk=RegExp('^(talk|template_talk):','i');
app.regTalk=RegExp('^(template_)?talk:','i');
app.regTemplate=RegExp('^template(_talk)?:','i');
app.regTalkNTemplateNSite=RegExp('^(talk:|template:|template_talk:|)(?:([^:]+):)?(.+)','i');

app.calcTalkName=function(pageName){ // Examples: "abc"=>"talk:abc", "template:abc"=>"template_talk:abc", "talk:abc"=>"", "template_talk:abc"=>""
  var talkPage='';
  if(!regTalk.test(pageName)){
    if(pageName.substr(0,9)=='template:') talkPage='template_talk:'+pageName; else talkPage='talk:'+pageName;
  }
  return talkPage;
}
app.calcTalkNameNoTest=function(pageName){ // Examples: "abc"=>"talk:abc", "template:abc"=>"template_talk:abc", "talk:abc"=>"", "template_talk:abc"=>""
  var talkPage; if(pageName.substr(0,9)=='template:') talkPage='template_talk:'+pageName; else talkPage='talk:'+pageName;
  return talkPage;
}

app.isTalk=function(pageName){ return regTalk.test(pageName); }
app.isTemplate=function(pageName){ return regTemplate.test(pageName); }


     
  //
  // createManifest
  //

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
  let objOut={display:"minimal-ui", prefer_related_applications:false,  short_name:siteName, name:siteName, start_url: uSite, icons }
  //theme_color:"#fff", background_color:"#fff", 
  //let str=serialize(objOut);
  let str=JSON.stringify(objOut);
  return str;
}

app.createManifestNStoreToCache=async function(arg){
  var {www}=arg;
  var strT=createManifest(arg);
  var buf=Buffer.from(strT, 'utf8');
  var [err]=await CacheUri.set( www+'/'+leafManifest, buf, 'json', true, false);   if(err) return [err];
  return [null];
}
app.createManifestNStoreToCacheMult=async function(Site){
  for(var i=0;i<Site.length;i++){   var [err]=await createManifestNStoreToCache(Site[i]);   if(err) return [err];   }
  return [null];
}

app.createManifestNStoreToCacheFrDB=async function(){
  var Arg=[ {}, {projection:{siteName:"$_id", www:1, srcIcon16:1}}];
  var cursor= collectionSite.find(...Arg);
  var [err, Site]=await cursor.toArray().toNBP();   if(err) return [err]; 

  var [err]=await createManifestNStoreToCacheMult(Site);   if(err) return [err];
  return [null];
}



app.arrayifyCookiePropObj=function(obj){
  var K=Object.keys(obj);
  var O=K.map(k=>{
    var v=obj[k];
    if((k=="HttpOnly" || k=="Secure") && v) return k;
    return k+"="+v;
  });
  return O;
}