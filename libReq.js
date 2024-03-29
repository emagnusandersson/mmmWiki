

"use strict"

const extend=Object.assign;

// deno run --allow-env --allow-read --allow-net --allow-sys --allow-run script.ts

// Todo (possible improvements)

// loginA resets objOthersActivity, but perhaps one should do it even at reload of a logged in session.
// Commas after link should not be included in link
// OneLine dl syntax: " ; Volvo : Car brand"

// When two tabs are open, and one has edited one, then edits the other, one gets "Already logged in"

// Does uploadUser work? what is in "tmpname" in that function

//sessionIDDDos, sessionIDCSRF, sessionIDR, sessionIDW
// sessionIDR, sessionIDW: Set-Cookie should be called in reqBU, reqBUMeta, reqIndex, reqMonitor and reqStat

// redis interface 4.0 does not work
// In loadFrFilesOrBufs via uploadAdmin: duplicate key error if same page is uploaded.
// Values in Page that are cached from values in Revision (tMod etc) should be rename to tMod_cached


// After googling "node.js connect debugger to running process" I found:
//   kill -USR1 <node-pid>   // starts debugger

// speechelo.com (Instantly Generate Voice from Text)
// start every css file with table {collapsable:collapsable}

// Fix cache problem when returning to edited page
// Fix green monitor.html that should be white

// links to private pages should be green (or perhaps a lock (🔒) symbol)
// parse async

// (?<!cmd|del|set|get)redis


// nsVote and syncameeting should use StateOpen instead of StateMy
// First visible MainDiv: mmmWiki:pageView, locatabl:viewFront, idPlace:mainDiv, nsVote:summaryDiv, syncAMeeting:viewFront
// mSort and merge should be in lib.js instead of libClient.js. Right
// Rewrite redirectTab (etc on other apps) as siteTab (using SiteTabRow "class")

// Safari back button issues
// Movable fixed div in viewFront


// deno

// DB
// Image extension as property (filterable)

// A pages parent(s) should be visible in the pageView-mini-Fixed-div. If multiple parents, then the parrent with most children should be available in a popup.

/******************************************************************************
 * BU (BackUp requests):
 * (As shown in script.js) the requests:
 * /BUMetaSQL goes to reqBUMetaSQL
 * /BUMeta* (BUMeta and BUMetaServ) goes to reqBUMeta
 * /BU* (BUPage, BUImage, BUVideo, BUPageServ, BUImageServ, BUImageServ) goes to reqBU
 ******************************************************************************/

/******************************************************************************
 * reqBU
 ******************************************************************************/
app.reqBU=async function(strArg) {
  var {reqMy}=this, {req, objUrl}=reqMy, tNow=nowSFloored();
  
  //if(!req.boCookieStrictOK) { reqMy.outCode(401, "Strict cookie not set");  return;   }
  
      // Conditionally push deadlines forward
  var [err, value]=await evalRedis(luaGetNExpire, [reqMy.cookies.sessionIDR+'_adminRTimer'], [maxAdminRUnactivityTime]); this.boARLoggedIn=Number(value);
  var [err, value]=await evalRedis(luaGetNExpire, [reqMy.cookies.sessionIDW+'_adminWTimer'], [maxAdminWUnactivityTime]); this.boAWLoggedIn=Number(value);
  

  if(this.boAWLoggedIn!=1) {reqMy.outCode(401,'not logged in'); return;}

  var Match=RegExp('(.*?)(Serv)?$').exec(strArg);
  if(!Match){ reqMy.out500(Error('Cant read backup argument'));   return; } 
  var type=Match[1].toLowerCase();
  var boServ=0; if(Match[2]) boServ=1;
  
  if(type=='page' || type=='image') ; else { reqMy.out400(Error("Bad request")); debugger;  return; }
  var strNameVar=type+'Name';

  var jsonInput;
  if(req.method=='POST'){
    //var [err,buf]=await new Promise(resolve=>{   req.body.pipe(concat(function(bufT){ resolve([null, bufT]);  }));    });
    //const buf = await Deno.readAll(req.body);
    if(boDeno){
      var buf = await readAllMy(req?.body)
    }else{
      var [err,buf]=await new Promise(resolve=>{ var myConcat=concat(function(bufT){ resolve([null,bufT]) });    req.pipe(myConcat);  });
    }
   
    const decoder = new TextDecoder();
    jsonInput = decoder.decode(buf);
    //jsonInput=buf.toString();
  } else if(req.method=='GET'){
    //var objUrlOld=url.parse(req.url), qs=objUrlOld.query||'';
    //let objUrl=new URL(req.url);
    //let objQS=objUrl.searchParams, qs=objQS.toString()
    var qs=objUrl.search.slice(1)
    jsonInput=urldecode(qs);
  } 
  //const json = JSON.parse(jsonInput);
  //var inObj={}; if(jsonInput.length) inObj=JSON.parse(jsonInput);
  var inObj={}; if(jsonInput.length) {
    try{ inObj=JSON.parse(jsonInput); }catch(e){ reqMy.out500(Error("JSON.parse error")); debugger;  return; }
  }
  
  var boFilter='arrName' in inObj;
  var {arrName=[]}=inObj, nName=arrName.length;
  if(boFilter) { 
    if(nName) { tmpQ=array_fill(nName, "?").join(','); tmpQ=`${strNameVar} IN (${tmpQ})`;  } else tmpQ="false";  
  } else { var arrName=[], tmpQ='true';}

  var {boUsePrefixOnDefaultSitePages=true}=inObj;
  //var strExt;

  //var strSiteDefault, File;
  var boCompress=type=='page';

  //const sessionMongo = await dbo.command({startSession:1});
  const sessionMongo = mongoClient.startSession();
  sessionMongo.startTransaction({ readPreference:'primary', readConcern: {level:'local'}, writeConcern:{w:'majority'}   });

  stuff:
  {
  var arrRet=[null];

      // Get wwwCommon
    var Arg=[{boDefault:true}, {session:sessionMongo}];
    var [err, objSiteDefault]=await collectionSite.findOne(...Arg).toNBP();   if(err) {arrRet=[err]; break stuff;};
    if(!objSiteDefault) { arrRet=[new Error('Default site not found')]; break stuff; } 
    var strSiteDefault=objSiteDefault._id; 


    if(type=='page'){ 
      var strExt='.txt'; 

        // Get data from Page-collection
      var objFilter=boFilter?{pageName:{$in:arrName}}:{};
      var Arg=[ objFilter, {projection:{_id:1, idSite:1, pageName:1, date:"$tMod", strHash:"blah"}, collation:{locale:"en", strength:2}, session:sessionMongo}];
      var cursor=collectionPage.find(...Arg);
      var [err, File]=await cursor.toArray().toNBP();   if(err) {arrRet=[err]; break stuff;};
      var Id=Array(File.length); for(var i=0;i<File.length;i++){Id[i]=File[i]._id;}

        // Get data from FileWiki
      var objFilter=boFilter?{_id:{$in:Id}}:{};
      var Arg=[ objFilter, {projection:{_id:1, idPage:1, data:1}, session:sessionMongo}];
      var cursor=collectionFileWiki.find(...Arg);
      var [err, FileData]=await cursor.toArray().toNBP();   if(err) {arrRet=[err]; break stuff;};
      
      if(File.length!=FileData.length) { arrRet=[new Error("File.length!=FileData.length")]; break stuff; }

        // Assign data to File
      var objIdToFileWiki={};
      for(var fileData of FileData){   objIdToFileWiki[fileData.idPage]=fileData;    }
      for(var i=0;i<File.length;i++){var _id=File[i]._id; File[i].data=objIdToFileWiki[_id].data;}


      var Arg=[{name:"tLastBU"}, {$set:{value:tNow}}, {upsert:true, session:sessionMongo}]
      var [err, result]=await collectionSetting.updateOne(...Arg).toNBP();   if(err) {arrRet=[err]; break stuff;};


    } else if(type=='image'){
      var strExt='';

        // Get data from Image-collection
      var objFilter=boFilter?{imageName:{$in:arrName}}:{};
      var Arg=[ objFilter, {projection:{_id:1, imageName:1, idFile:1, date:"$tCreated", strHash:1}, session:sessionMongo}];
      var cursor=collectionImage.find(...Arg);
      var [err, File]=await cursor.toArray().toNBP();   if(err) {arrRet=[err]; break stuff;};
      var Id=Array(File.length); for(var i=0;i<File.length;i++){Id[i]=File[i].idFile;}

        // Get data from File
      var objFilter=boFilter?{_id:{$in:Id}}:{};
      var Arg=[ objFilter, {projection:{_id:1, data:1}, session:sessionMongo}];
      var cursor=collectionFileImage.find(...Arg);
      var [err, FileData]=await cursor.toArray().toNBP();   if(err) {arrRet=[err]; break stuff;};
      
      if(File.length!=FileData.length) { arrRet=[new Error("File.length!=FileData.length")]; break stuff; }

        // Assign data to File
      var objIdToData={};
      for(var fileData of FileData){   objIdToData[fileData._id]=fileData;    }
      for(var i=0;i<File.length;i++){var idFile=File[i].idFile; File[i].data=objIdToData[idFile].data.buffer;}
    }
    else if(type=='video') { arrRet=[new Error('Error, zipping video is not implemented')]; break stuff; }
    else {arrRet=[new Error('Error backing up, no such type')]; break stuff;}
    arrRet=[null];
  };
  var [errTransaction]=arrRet;

  if(errTransaction) { var a=await sessionMongo.abortTransaction(); sessionMongo.endSession();  reqMy.out500(errTransaction); return;  }
  var a=await sessionMongo.commitTransaction(); sessionMongo.endSession();


  //var zipfile = new NodeZip();
  var zip = new JSZip();

  for(var i=0;i<File.length;i++) { 
    var file=File[i], {idSite:siteName, boDefault, date, strHash, data}=file; //, fileData=FileData[i];
    var strNameTmp=file[strNameVar]+strExt; if(type=='page' && (boUsePrefixOnDefaultSitePages || !boDefault)) strNameTmp=siteName+':'+strNameTmp;

      // The "NodeZip"-library assumes you want the local time written in the zip-file, I want UTC time (too be able to compare times even thought timezone and daylight-savings-time has changed).
    //var unixSkew= date.getTime() +date.getTimezoneOffset()*60*1000;
    //var objArg={date:new Date(unixSkew), comment:strHash}; if(boCompress) objArg.compression='DEFLATE';
    //zipfile.file(strNameTmp, data, objArg);

    var compression=boCompress?'DEFLATE':'STORE';
    var objArg={date, comment:strHash, compression};
    const arg=[strNameTmp, data, objArg]
    if(boDeno){
      zip.addFile(...arg);
    }else{
      zip.file(...arg);
    }
  } 

  
    // Output data
  //var objArg={type:'string'}, outdata = zipfile.generate(objArg);

  //var strType=(JSZip.support.uint8array)?"uint8array":"string";
  var strType="uint8array";
  var outdata = await zip.generateAsync({type : strType});
  
  if(boServ){
    var outFileName=type+'.zip';
    var fsPage=path.join(Deno.cwd(), '..', 'mmmWikiBackUp', outFileName); 
    var [err]=await fsPromises.writeFile(fsPage, outdata, 'binary').toNBP();
    if(err) { console.log(err); reqMy.out500(err); }
    reqMy.out200(outFileName+' written');
  }else{
    var outFileName=`${strSiteDefault}_${swedDate(unixNow())}_${type}.zip`;
    var objHead={"Content-Type": StrMimeType.zip, "Content-Length":outdata.length, 'Content-Disposition':'attachment; filename='+outFileName};
    reqMy.setOutHeader(objHead);  //'binary' ??!??
    reqMy.end(outdata,'binary');
  }
  //var [err,tmp]=await cmdRedis('SET',['mmmWiki_tLastBU',unixNow()]);
  var [err,tmp]=await setRedis('mmmWiki_tLastBU',unixNow());
}




/******************************************************************************
 * reqBUMeta
 ******************************************************************************/
app.reqBUMeta=async function(strArg) {
  var {reqMy}=this, {req}=reqMy;

  //if(!req.boCookieStrictOK) {reqMy.outCode(401, "Strict cookie not set");  return;  }
  
        // Conditionally push deadlines forward
  var [err, value]=await evalRedis(luaGetNExpire, [reqMy.cookies.sessionIDR+'_adminRTimer'], [maxAdminRUnactivityTime]); this.boARLoggedIn=Number(value);
  var [err, value]=await evalRedis(luaGetNExpire, [reqMy.cookies.sessionIDW+'_adminWTimer'], [maxAdminWUnactivityTime]); this.boAWLoggedIn=Number(value);

  if(this.boAWLoggedIn!=1) {reqMy.outCode(401,'not logged in'); return;}

  //const sessionMongo = await dbo.command({startSession:1});
  const sessionMongo = mongoClient.startSession();
  sessionMongo.startTransaction({ readPreference:'primary', readConcern: {level:'local'}, writeConcern:{w:'majority'}   });

  stuff:
  {
  var arrRet=[null];

      // Get data from collectionSite
    var Arg=[{}, {session:sessionMongo}]; 
    var cursor=collectionSite.find(...Arg);
    var [err, Site]=await cursor.toArray().toNBP();   if(err) {arrRet=[err]; break stuff;};
    if(Site===null) {arrRet=[new Error('No sites found')]; break stuff;}

      // Get strSiteDefault
    var strSiteDefault="";
    for(var site of Site){   if(site.boDefault) strSiteDefault=site._id;   }
    if(strSiteDefault=="") {arrRet=[new Error('Default site not found')]; break stuff;}

      // Get data from collectionPage
    var Arg=[ {}, {projection:{_id:0, siteName:"$idSite", pageName:1, boOR:1, boOW:1, boSiteMap:1, tCreated:1, tMod:1, tLastAccess:1, nAccess:1, strLang:1}, session:sessionMongo}];
    var cursor=collectionPage.find(...Arg);
    var [err, matPage]=await cursor.toArray().toNBP();   if(err) {arrRet=[err]; break stuff;};

      // Get data from collectionImage
    var Arg=[ {}, {projection:{_id:0, imageName:1, boOther:1, tCreated:1, tMod:1, tLastAccess:1, nAccess:1}, session:sessionMongo}];
    var cursor=collectionImage.find(...Arg);
    var [err, matImage]=await cursor.toArray().toNBP();   if(err) {arrRet=[err]; break stuff;};

      // Get data from collectionRedirect
    var Arg=[ {}, {projection:{_id:0, siteName:"$idSite", pageName:1, url:1, tCreated:1, tMod:1, tLastAccess:1, nAccess:1}, session:sessionMongo}];
    var cursor=collectionRedirect.find(...Arg);
    var [err, matRedirect]=await cursor.toArray().toNBP();   if(err) {arrRet=[err]; break stuff;};
    arrRet=[null];
  }
  var [errTransaction]=arrRet;

  if(errTransaction) { var a=await sessionMongo.abortTransaction(); sessionMongo.endSession();  reqMy.out500(errTransaction); return;  }
  var a=await sessionMongo.commitTransaction(); sessionMongo.endSession();

  var matTmp=matPage, StrTmp=['tCreated','tMod','tLastAccess'];
  for(var i=0;i<matTmp.length;i++){  for(var j of StrTmp){  matTmp[i][j]=matTmp[i][j].toUnix(); }   }
  var matTmp=matImage, StrTmp=['tCreated','tMod','tLastAccess'];
  for(var i=0;i<matTmp.length;i++){  for(var j of StrTmp){  matTmp[i][j]=matTmp[i][j].toUnix(); }   }
  var matTmp=matRedirect, StrTmp=['tCreated','tMod','tLastAccess'];
  for(var i=0;i<matTmp.length;i++){  for(var j of StrTmp){  matTmp[i][j]=matTmp[i][j].toUnix(); }   }


  //var zipfile = new NodeZip();
  var zip = new JSZip();
  //var myEscapeF=function(str){ return `"${myEscaper.escape(str)}"`; }
  var myEscapeF=function(str){ return `"${myEscaper.escape(str)}"`; }
  var StrData=[], StrFileName=[];
  
    // Site
  var StrFile=['"boDefault","boTLS","srcIcon16","strLangSite","googleAnalyticsTrackingID","aWPassword","aRPassword","name","www"'];
  for(var k=0;k<Site.length;k++){
    var r=Site[k], StrRow=[Boolean(r.boDefault), Boolean(r.boTLS), myEscapeF(r.srcIcon16), myEscapeF(r.strLangSite), myEscapeF(r.googleAnalyticsTrackingID), myEscapeF(r.aWPassword), myEscapeF(r.aRPassword), myEscapeF(r._id), myEscapeF(r.www)];
    StrFile.push(StrRow.join(','));
  } 
  StrData.push(StrFile.join("\n")); StrFileName.push('site.csv');

    // Page
  var StrFile=['"boOR","boOW","boSiteMap","strLang","tCreated","tMod","tLastAccess","nAccess","siteName","pageName"'];
  for(var k=0;k<matPage.length;k++){
    var r=matPage[k], StrRow=[Boolean(r.boOR), Boolean(r.boOW), Boolean(r.boSiteMap), myEscapeF(r.strLang), r.tCreated, r.tMod, r.tMod, r.nAccess, myEscapeF(r.siteName), myEscapeF(r.pageName)];
    StrFile.push(StrRow.join(','));
  } 
  StrData.push(StrFile.join("\n")); StrFileName.push('page.csv');
   
    // Image
  var StrFile=['"boOther","tCreated","tMod","tLastAccess","nAccess","imageName"'];
  for(var k=0;k<matImage.length;k++){
    var r=matImage[k], StrRow=[Boolean(r.boOther), r.tCreated, r.tCreated, r.tCreated, r.nAccess, myEscapeF(r.imageName)];
    StrFile.push(StrRow.join(','));
  } 
  StrData.push(StrFile.join("\n")); StrFileName.push('image.csv');

    // Redirect
  var StrFile=['"tCreated","tMod","tLastAccess","nAccess","siteName","pageNameLC","url"'];
  for(var k=0;k<matRedirect.length;k++){
    var r=matRedirect[k], StrRow=[r.tCreated, r.tCreated, Number(r.tLastAccess), r.nAccess, myEscapeF(r.siteName), myEscapeF(r.pageName), myEscapeF(r.url)];
    StrFile.push(StrRow.join(','));
  }
  StrData.push(StrFile.join("\n")); StrFileName.push('redirect.csv');

    // Create zip 
  // for(var i=0;i<StrData.length;i++){ zipfile.file(StrFileName[i], StrData[i], {compression:'DEFLATE'}); }
  // var outdata = zip.generate({type:'string'});

  for(var i=0;i<StrData.length;i++){
    const arg=[StrFileName[i], StrData[i], {compression:'DEFLATE'}]
    if(boDeno){
      zip.addFile(...arg);
    }else{
      zip.file(...arg);
    }
  }
  //var strType=(JSZip.support.uint8array)?"uint8array":"string";
  var strType="uint8array";
  var outdata = await zip.generateAsync({type : strType});


  
    // Output data 
  var boOutputZip=1;
  if(strArg=='Serv'){
    var fsBU=path.join(Deno.cwd(), '..', 'mmmWikiBackUp'), strMess;
    if(boOutputZip){
      var fsTmp=path.join(fsBU, 'meta.zip');
      var [err]=await fsPromises.writeFile(fsTmp, outdata, 'binary').toNBP();
      if(err) { console.log(err); reqMy.out500(err); }
      strMess='meta.zip written';
    }else{
      for(var i=0;i<StrData.length;i++){ 
        var fsTmp=path.join(fsBU, StrFileName[i]);
        var [err]=await fsPromises.writeFile(fsTmp, StrData[i]).toNBP();
        if(err) { console.log(err); reqMy.out500(err); }
      }  //, 'binary'
      strMess=StrData.length+' files created';
    }
    reqMy.out200(strMess);
  }else{
    var outFileName=`${strSiteDefault}_${swedDate(unixNow())}_meta.zip`;
    
    var objHead={"Content-Type": StrMimeType.zip, "Content-Length":outdata.length, 'Content-Disposition':'attachment; filename='+outFileName};
    reqMy.setOutHeader(objHead);  //'binary' ??!??
    reqMy.end(outdata,'binary');
  } 
}




/******************************************************************************
 * reqIndex
 ******************************************************************************/

let makeOutput=function(objOut, strHtmlText){
  var {reqMy}=this, {req, wwwSite, strSchemeLong}=reqMy;
  var {objSiteDefault, objSite, objPage}=objOut, {pageName}=objPage; //, {www:wwwSite}=objSite;

  var ua=req.headers.get('user-agent')||''; ua=ua.toLowerCase();
  //var boIOS= RegExp('iphone','i').test(ua);

  var strMetaNoIndex='', boTemplate=RegExp('^template:','i').test(pageName);
  if(!objPage || !objPage.boSiteMap || !objPage.boOR || boTemplate){ strMetaNoIndex='<meta name="robots" content="noindex">\n'; }


    // uSite, uSiteCommon, uCanonical    
  var uSite=strSchemeLong+objSite.www;
  var strSchemeCommon='http'+(objSiteDefault.boTLS?'s':''),   strSchemeCommonLong=strSchemeCommon+'://';
  var uSiteCommon=strSchemeCommonLong+objSiteDefault.www;
  var uCanonical=uSite; if(pageName!='start') uCanonical=uCanonical+"/"+pageName;

    // Files to include
  var keyTmp=wwwSite+'/'+leafManifest, vTmp=CacheUri[keyTmp].strHash;     const uManifest=`${strSchemeLong}${keyTmp}?v=${vTmp}`;
  var pathTmp='lib/foundOnTheInternet/zip.js', vTmp=CacheUri[pathTmp].strHash;    const uZip=`${uSiteCommon}/${pathTmp}?v=${vTmp}`;
  var pathTmp='lib/foundOnTheInternet/sha1.js', vTmp=CacheUri[pathTmp].strHash;   const uSha1=`${uSiteCommon}/${pathTmp}?v=${vTmp}`;
  var pathTmp='lib/foundOnTheInternet/jszip.js', vTmp=CacheUri[pathTmp].strHash;   const uJszip=`${uSiteCommon}/${pathTmp}?v=${vTmp}`;
 
  var strTracker, tmpID=objSite.googleAnalyticsTrackingID||null;
  tmpID=null;  // Disabling ga
  if(boDbg||!tmpID){strTracker="<script> ga=function(){};</script>";}else{ 
  strTracker=`
<script type="text/javascript">
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
  ga('create', '${tmpID}', { 'storage': 'none' });
  ga('send', 'pageview');
</script>`;
  }
  //ga('create', '${tmpID}', 'auto');
  
  extend(objOut, {uZip, uSha1, uJszip});

    // Set strDBType
  var strT; if(typeof mysql!='undefined') strT='mysql'; else if(typeof mongoClient!='undefined') strT='mongodb'; else strT='neo4j';
  var strDBType=strT;

    // Include beginning of password (I have to rethink, if this is really the right thing to do.)
  var aRPasswordStart=aRPassword.substr(0,2), aWPasswordStart=aWPassword.substr(0,2);

    // Make temporary copy (to remove certain stuff before serializing)
  var arrRevisionOrg=objPage.arrRevision;

  var StrOutFieldSkip=["objSite", "objSiteDefault"];
  var objOutFieldSkip=copySome({}, objOut, StrOutFieldSkip);
  var StrPageFieldSkip=["arrRevision", "strHashParse", "strHash", "tLastAccess", "tModCache", "nAccess"];
  var objPageFieldSkip=copySome({}, objPage, StrPageFieldSkip);
    
    // Create modified variables
  objOut.objSite=copySome({},objSite, ['www', 'boTLS', 'siteName', 'idSite']); 
  objOut.objSiteDefault=copySome({},objSiteDefault, ['www', 'boTLS', 'siteName']);
  deleteFields(objPage, StrPageFieldSkip);
  objPage.arrRevision=objPageFieldSkip.arrRevision.map(ele=>{return copySome({},ele, ['tMod','summary','signature', 'size', 'boOther']);});
  var matVersion=arrObj2TabNStrCol(objPage.arrRevision);

  extend(objOut, {matVersion, strReCaptchaSiteKey, uRecaptcha, strDBType, aRPasswordStart, aWPasswordStart});   // Add stuff to objOut

  var strObjOut=serialize(objOut);   // Serialize
    // Set back original
  copySome(objOut, objOutFieldSkip, StrOutFieldSkip); copySome(objPage, objPageFieldSkip, StrPageFieldSkip);


    // Set strTitle
  var strTitle;
  if(pageName=='start') { 
    if(typeof strStartPageTitle!='undefined' && strStartPageTitle) strTitle=strStartPageTitle; else strTitle=wwwSite;
  } else strTitle=pageName.replace(RegExp('_','g'),' ');
  
  var srcIcon16=objSite.srcIcon16 || ''; //srcIcon16Default;
  var uIcon16=srcIcon16;
  var uIcon114=srcIcon16.replace(/16/,'114');
  
  var objData={uIcon16, uIcon114, strMetaNoIndex, uCanonical, uSiteCommon, uManifest, strTracker, strObjOut, strTitle, strHtmlText, strDescription:strTitle};
  //objPage.idPage=objPage._id; delete objPage._id;
  copySome(objData, objPage, ['strLang']);
  var strTmp=strIndexTemplate;   
  var strOut=ejs.render(strTmp, objData, {});
  return {strOut};
}

//queredPage, uCommonSite, strObjOut, strHtmlText


app.reqIndex=async function() {
  var {reqMy}=this, {req, boTLS, wwwSite, pathName, objUrl}=reqMy;
  var tNow=nowSFloored();
  
  var strT=req.headers.get('sec-fetch-mode');
  if(strT && !(strT=='navigate' || strT=='same-origin')) { reqMy.outCode(400, `sec-fetch-mode header not allowed (${strT})`); return;}
  
  //var qs=objUrl.query||'', objQS=parseQS2(qs);
  //var qs=objUrl.search.slice(1)
  
  var pathName=decodeURIComponent(pathName);

  var Match=RegExp('^/([^\\/]+)$').exec(pathName);
  if(Match) var queredPage=Match[1]; 
  else{
    if(pathName!='/') { reqMy.out301Loc(''); return;}
    //if('page' in objQS) { reqMy.out301Loc(objQS.page); return;}
    var queredPage='start';
  }
  
    // Set strict cookie
  // var sessionID=randomHash(),  redisVar=sessionID; 
  // var [err, tmp]=await setRedis(redisVar, 1, 3600*24*30); if(err) {reqMy.out500(err); return; };
  // reqMy.setOutHeader("Set-Cookie", "sessionIDStrict="+sessionID+strCookiePropStrict);

    // Conditionally push deadlines forward
  var [err, value]=await evalRedis(luaGetNExpire, [reqMy.cookies.sessionIDR+'_adminRTimer'], [maxAdminRUnactivityTime]); this.boARLoggedIn=Number(value);
  var [err, value]=await evalRedis(luaGetNExpire, [reqMy.cookies.sessionIDW+'_adminWTimer'], [maxAdminWUnactivityTime]); this.boAWLoggedIn=Number(value);

  // Private:
  //                                                                 index.html  first ajax (pageLoad)
  //Shall look the same (be cacheable (not include boARLoggedIn etc))     no           yes

  // Public:
  //                                                                 index.html  first ajax (getLoginBoolean)
  //Shall look the same (be cacheable (not include boARLoggedIn etc))     yes          no

  var CSRFCode='';  // If public then No CSRFCode since the page is going to be cacheable (look the same each time)

  //if(req.boTLS) reqMy.setOutHeader("Strict-Transport-Security", "max-age="+24*3600+"; includeSubDomains");
  //var tmpS=req.boTLS?'s':'';
  //reqMy.setOutHeader("Content-Security-Policy", `default-src http${tmpS}: 'this'  *.google.com; img-src *`);
  //reqMy.setOutHeader("Content-Security-Policy", "default-src http");
  
  
  
  var rev=-1;  //version=NaN, 
  //var version, rev; if('version' in objQS) {  version=objQS.version;  rev=version-1 } else {  version=NaN; rev=-1; }
  var strHashIn=getETag(req.headers), requesterCacheTime=getRequesterTime(req.headers);
  
  var pageName=queredPage, pageNameLC=pageName.toLowerCase();
  
    // Get site
  var [err, objSite]=await collectionSite.findOne({www:wwwSite}).toNBP();   if(err) {reqMy.out500(err); return; };
  if(!objSite) {reqMy.out404(wwwSite+', site not found'); return;};
  var {_id:idSite}=objSite; objSite.siteName=idSite; objSite.idSite=idSite
  var idPage=idSite+":"+pageNameLC;

    // Check if there is a redirect for this page
  var objFilt={idSite, pageName:queredPage}, objUpd={ $set: { tLastAccess: tNow }, $inc: { nAccess: 1 } };
  var [err, objT]=await collectionRedirect.findOneAndUpdate(objFilt, objUpd).toNBP();   if(err) {reqMy.out500(err); return; };
  if(objT!=null) {
    reqMy.out301(objT.url); return;
  }
  

    // Check if there is a redirect for the domain
  var [err, item]=await collectionRedirectDomain.findOne({www:wwwSite}).toNBP();   if(err) {reqMy.out500(err); return; };
  if(item) { reqMy.out301(item.url+'/'+queredPage); return; }

    // Get wwwCommon
  var Arg=[{boDefault:true}, {projection:{_id:0, boTLS:1, siteName:"$_id", www:1}}];
  var [err, objSiteDefault]=await collectionSite.findOne(...Arg).toNBP();   if(err) {reqMy.out500(err); return; };
  if(!objSiteDefault) {reqMy.out500('Default site not found'); return;}
  
    // Get tModLast, pageTModLast and tLastBU
  var Arg=[{name:{$in:['tModLast', 'pageTModLast', 'tLastBU']}}];
  var cursor=collectionSetting.find(...Arg);
  var [err, items]=await cursor.toArray().toNBP();   if(err) {reqMy.out500(err); return;}
  var objSetting=convertKeyValueToObj(items);
  


    // Check if page exist
  var objFilt={_id:idPage}, objUpd={ $set: { tLastAccess: tNow }, $inc: { nAccess: 1 } };
  var objOpt={ collation:{locale:"en", strength:2}, returnDocument:'after', returnOriginal:false}; // returnDocument should be enough
  //var [err, objPage]=await collectionPage.findOne(objFilt, objOpt).toNBP();   if(err) {reqMy.out500(err); return; };
  var [err, objPage]=await collectionPage.findOneAndUpdate(objFilt, objUpd, objOpt).toNBP();   if(err) {reqMy.out500(err); return; };
  //var objPage=result?.value;
  if(objPage==null) { // No such page 
    //res.statusCode=404;
    var boOR=1, boOW=1, boSiteMap=1, idPage=null, tCreated=null, tMod=null, arrRevision=[];
    var objPage=extend({}, {pageName:queredPage, boOR, boOW, boSiteMap, idPage, tCreated, tMod, arrRevision});
    var objOut={ CSRFCode:'',   boTalkExist:false, strEditText:"", arrVersionCompared:[null,1], matVersion:{}, objSiteDefault, objSite, objPage};
    var strHtmlText='';
    var {strOut}=makeOutput.call(this, objOut, strHtmlText), strHash=app.md5(strOut);

    var objHead={"Content-Type": StrMimeType.html};  //, "Content-Encoding":'gzip', "Content-Length":strOut.length
    //res.writeHead(404, objHead);
    reqMy.statusOut(404).setOutHeader(objHead);
    //Streamify(strOut).pipe(zlib.createGzip()).pipe(res);
    reqMy.end(strOut);
    return;
  } 
  

    //
    // Page exist
    //

  var {_id:idPage, pageName, boOR, boOW, boSiteMap, tMod, arrRevision, strHashParse, strHash}=objPage;
  objPage.idPage=idPage; delete objPage._id;
  var lenRev=arrRevision.length, iLastRev=lenRev-1;

    // Redirect to correct case OR correct boTLS
  if(pageName!==queredPage || objSite.boTLS!=boTLS){ reqMy.out301(pageName); return; };


    //
    // Private
    //
    
  if(!boOR){
      // Setup sessionIDCSRF-cookie
      // Check if incoming cookie is valid, and what CSRFCode is stored under it.
    if('sessionIDCSRF' in reqMy.cookies) { 
      var sessionIDCSRF=reqMy.cookies.sessionIDCSRF;
      var [err, CSRFCode]=await evalRedis(luaGetNExpire, [sessionIDCSRF+'_CSRF'], [maxAdminRUnactivityTime]);
      
      if(!CSRFCode) sessionIDCSRF=randomHash(); // To avoid session fixation
    } else var sessionIDCSRF=randomHash();

    var CSRFCode=randomHash();
    //var [err,tmp]=await cmdRedis('SET', [sessionIDCSRF+'_CSRF', CSRFCode, 'EX', maxAdminRUnactivityTime]);
    var [err,tmp]=await setRedis(sessionIDCSRF+'_CSRF', CSRFCode, maxAdminRUnactivityTime);
    
    var objOut={CSRFCode,   boTalkExist:0, strEditText:'', arrVersionCompared:[null,1], matVersion:{}, objSiteDefault, objSite, objPage};
    copySome(objOut, this, ['boARLoggedIn', 'boAWLoggedIn']);
    if(this.boAWLoggedIn) extend(objOut, {objSetting});
    var strHtmlText='';
    var {strOut}=makeOutput.call(this, objOut, strHtmlText), strHash=app.md5(strOut);

    var objHead={"Content-Type": StrMimeType.html, "Cache-Control":"no-store, no-cache, must-revalidate, post-check=0, pre-check=0"};  //, "Content-Encoding":'gzip', "Content-Length":strOut.length
    //res.replaceCookie("sessionIDCSRF="+sessionIDCSRF+strCookiePropLax);
    reqMy.outCookies.sessionIDCSRF=sessionIDCSRF+strCookiePropLax
    //res.writeHead(403, objHead); 
    reqMy.statusOut(403).setOutHeader(objHead);
    //Streamify(strOut).pipe(zlib.createGzip()).pipe(res);
    reqMy.end(strOut);
    return;
  }


    //
    // Public
    //


    // Get version table
  if(lenRev==0) { reqMy.out500('no versions?!?'); return;   }
  if(rev==-1) rev=iLastRev;  //version=rev+1;  // Use last rev
  var arrVersionCompared=[null,rev+1];


  var objRev=arrRevision[rev];
  var {idFileWiki, idFileHtml, tMod, tModCache, strHashParse:strHashParseR, strHash:strHashR} =objRev;
  if(strHashParse!==strHashParseR) strHashParse='obs';  if(strHash!==strHashR) strHash='obs';


    // Calc boValidReqCache => 304
  var boValidReqCache= tMod<=tModCache && strHashIn.length==32 && strHash==strHashIn && tModCache<=requesterCacheTime;
  if(boValidReqCache) { reqMy.out304(); return; }


    //
    // Page must be regenerated
    //

  //const sessionMongo = await dbo.command({startSession:1});
  const sessionMongo = mongoClient.startSession();
  sessionMongo.startTransaction({ readPreference:'primary', readConcern: {level:'local'}, writeConcern:{w:'majority'}   });

  stuff:
  {
  var arrRet=[null];

      // Calc boTalkExist
    var boTalk=isTalk(pageName),  boTemplate=isTemplate(pageName), boTalkExist=false;
    if(!boTalk){
      var strPre=boTemplate?'template_talk:':'talk:', talkPage=strPre+pageName, idTalk=(idSite+":"+talkPage).toLowerCase();
      var [err, objPageTalk]=await collectionPage.findOne({_id:idTalk}, {session:sessionMongo}).toNBP();   if(err) {arrRet=[err]; break stuff;}
      var boTalkExist=Boolean(objPageTalk);
    }

      // Get strEditText
    var [err, objFile]=await collectionFileWiki.findOne({_id:idFileWiki}, {session:sessionMongo}).toNBP();   if(err) {arrRet=[err]; break stuff;}
    if(!objFile) {arrRet=[new Error("!objFile")]; break stuff;}
    var {data:strEditText}=objFile;
                        
      // Entering some data into objOut
    var objOut={CSRFCode:'',   boTalkExist, strEditText, arrVersionCompared, objSiteDefault, objSite, objPage, boARLoggedIn:0, boAWLoggedIn:0};

    var strHashOld=strHash;
    var boLastRev=rev==iLastRev

    if(tMod<=tModCache && strHashParse.length==32) {  // Meta data (but not strHtmlText) has changed
      var [err, objFileHtml]=await collectionFileHtml.findOne({_id:idFileHtml}, {session:sessionMongo}).toNBP();   if(err) {arrRet=[err]; break stuff;}
      if(!objFileHtml) {arrRet=[new Error("objFileHtml==null")]; break stuff;}
      var {data:strHtmlText}=objFileHtml;

      var {strOut}=makeOutput.call({reqMy}, objOut, strHtmlText); strHash=app.md5(strOut);

    
      if(strHash!=strHashOld){
        tModCache=tNow;   extend(arrRevision[rev], {tModCache,strHash});
        var objPageSet={arrRevision};
        if(boLastRev){ extend(objPageSet,{tModCache, strHashParse, strHash}); }
        var Arg=[{_id:idPage}, [{ $set: objPageSet }], {session:sessionMongo}]
        var [err, result]=await collectionPage.updateOne(...Arg).toNBP();   if(err) {arrRet=[err]; break stuff;}
      }

    } else { // strHtmlText is obsolete

      var {IdChild:IdChildOld, StrImage:StrImageOld}=objPage;

        // parse
      var arg={strEditText, idSite, boOW};
      var [err, {strHtmlText, IdChildLax, IdChild, StrImageLC}]=await parse(sessionMongo, arg); if(err) {arrRet=[err]; break stuff;}
      strHashParse=app.md5(strHtmlText);
      
      var {strOut}=makeOutput.call({reqMy}, objOut, strHtmlText); strHash=app.md5(strOut);


      if(strHash!=strHashOld){ 

          // Write File files
        var Arg=[{_id:idFileHtml }, [{ $set: { data: strHtmlText } }], {session:sessionMongo}];
        var [err, result]=await collectionFileHtml.updateOne(...Arg).toNBP();   if(err) {arrRet=[err]; break stuff;}

        tModCache=tNow;
        extend(arrRevision[rev], {tModCache, strHashParse, strHash});
        if(boLastRev) extend(objPage, { tModCache, strHashParse, strHash });

          // Make changes to current page
        delete objPage.idPage;
        var Arg=[ {_id:idPage }, { $set: objPage }, {session:sessionMongo}];
        var [err, result]=await collectionPage.updateOne(...Arg).toNBP();   if(err) {arrRet=[err]; break stuff;}
        objPage.idPage=idPage;

        if(boTemplate){  // Make parents stale
          var Arg=[{_id:{$in:IdParent}}, [{ $set: {strHashParse:"stale", strHash:"stale", tModCache:new Date(0)} }], {session:sessionMongo}];
          var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   {arrRet=[err]; break stuff;}

        }

          // Make changes to children.
        var [err]=await modifyIdParent(sessionMongo, IdChildOld, StrImageOld, idPage, IdChild, StrImageLC, idPage);  if(err) {arrRet=[err]; break stuff;}

      }
    
    }

    var objHead={"Content-Type": StrMimeType.html, ETag:strHash, "Cache-Control":"must-revalidate, public", 'Last-Modified':tModCache.toUTCString(), "Content-Encoding":'gzip'};  //, "Content-Length":strOut.length
    //res.writeHead(200, objHead); 
    reqMy.setOutHeader(objHead);

    arrRet=[null,strOut];
  }
  var [errTransaction, strOut]=arrRet;

  if(errTransaction) { var a=await sessionMongo.abortTransaction(); sessionMongo.endSession();  reqMy.out500(errTransaction); return;  }
  var a=await sessionMongo.commitTransaction(); sessionMongo.endSession();

  //Streamify(strOut).pipe(zlib.createGzip()).pipe(res);

    // One could just call reqMy.end(strOut); and removing "Content-Encoding":'gzip' above and the system would handle compression.
  if(boDeno){
    const encObj = new TextEncoderStream();
    const writerEnc = encObj.writable.getWriter();
    const webstreamComp=new CompressionStream("gzip")
    encObj.readable.pipeTo(webstreamComp.writable)

    reqMy.end(webstreamComp.readable);
    await writerEnc.ready;
    writerEnc.write(strOut);
    writerEnc.releaseLock();
    encObj.writable.close();
  }else{
    //Streamify(strOut).pipe(zlib.createGzip()).pipe(res);
    var s1=Streamify(strOut);
    var s2=s1.pipe(zlib.createGzip());
    //var s3=s2.pipe(res);
    reqMy.end(s2);
  }

  return;
}




/******************************************************************************
 * reqStatic
 ******************************************************************************/
app.reqStatic=async function() {
  var {reqMy}=this, {req, wwwSite, pathName, boSiteDependant=false}=reqMy;

  //var RegAllowedOriginOfStaticFile=[RegExp("^https\:\/\/(locatabl\.com|gavott\.com)")];
  //var RegAllowedOriginOfStaticFile=[RegExp("^http\:\/\/(localhost|192\.168\.0)")];
  var RegAllowedOriginOfStaticFile=[];
  setAccessControlAllowOrigin(reqMy, RegAllowedOriginOfStaticFile);
  if(req.method=='OPTIONS'){ reqMy.end(); return ;}

  const {headers}=req
  var strHashIn=getETag(headers);
  var keyCache=boSiteDependant?wwwSite+pathName:pathName.substr(1); 
  var [err, objT]=await CacheUri.getWAutoSet(keyCache);
  if(err) {
    if(err.code=='ENOENT') {reqMy.out404(); return;}
    const host=headers.get('host'), referer=headers.get('referer')
    console.error(`Faulty request, headers:\n\thost:${host}\treferer:${referer}`);
    reqMy.out500(err); return;
  }
  //if(typeof objT.buf=='undefined') debugger;
  var {buf, type, strHash, boZip, boUglify}=objT;
  if(strHash===strHashIn){ reqMy.out304(); return; }
  var mimeType=StrMimeType[type];
  if(typeof mimeType!='string') console.log(`type: ${type}, mimeType: `, mimeType);
  if(typeof buf!='object' || !('length' in buf)) console.log('typeof buf: '+typeof buf);
  if(typeof strHash!='string') console.log('typeof strHash: '+strHash);
  var objHead={"Content-Type": mimeType, "Content-Length":buf.length, ETag:strHash, "Cache-Control":"public, max-age=31536000"};
  if(boZip) objHead["Content-Encoding"]='gzip';
  //res.writeHead(200, objHead); // "Last-Modified": maxModTime.toUTCString(),
  reqMy.setOutHeader(objHead);
  //res.write(buf); //, this.encWrite
  //res.end();
  reqMy.end(buf);
}





/******************************************************************************
 * reqMediaImage
 ******************************************************************************/
app.reqMediaImage=async function(){
  var {reqMy}=this, {req, pathName}=reqMy;
  
  //res.removeOutHeader("X-Frame-Options"); // Allow to be shown in frame, iframe, embed, object
  reqMy.removeOutHeader("Content-Security-Policy"); // Allow to be shown in frame, iframe, embed, object
  
  
  var Match=RegExp('^/(.*?)$').exec(pathName);
  if(!Match) {reqMy.out404('Not Found'); return;}
  var nameQ=Match[1];


  this.strHashIn=getETag(req.headers);
  this.requesterCacheTime=getRequesterTime(req.headers);

  var RegThumb=RegExp(`(\\d+)(.?)px-(.*)\\.(${myGlob.strImageExtWBar})$`,'i'); 
  var RegImage=RegExp(`(.*)\\.(${myGlob.strImageExtWBar})$`,'i');  // Ex "100hpx-oak.jpg"
  var Match, nameOrg, wMax, hMax, kind, boThumb;
  if(Match=RegThumb.exec(nameQ)){ 
    nameOrg=Match[3]+'.'+Match[4];
    if(Match[2]=='a'){  wMax=Match[1]; hMax=Match[1];  }
    else if(Match[2]=='h'){  wMax=0; hMax=Match[1];  }
    else{  wMax=Match[1]; hMax=0;  }
    wMax=Number(wMax); hMax=Number(hMax);
    kind=Match[4].toLowerCase();
    boThumb=1;
  } 
  else { 
    nameOrg=nameQ; boThumb=0;
    if(Match=RegImage.exec(nameQ)){ 
      kind=Match[2].toLowerCase();
    }
  }
  
  if( !nameOrg || nameOrg == "" ){ reqMy.out404('Not Found'); return;} // Exit because non-valid name


  var tNow=nowSFloored();

    // Get info from collectionImage
  var objFilt={imageName:nameOrg}, objUpd={ $set: { tLastAccess: tNow }, $inc: { nAccess: 1 } }, objOpt={collation:{locale:'en', strength:2}};
  var [err, objT]=await collectionImage.findOneAndUpdate(objFilt, objUpd, objOpt).toNBP();   if(err) {reqMy.out500(err); return; };
  if(objT==null) {reqMy.out404('Not Found'); return; };
  var {_id:idImage, tCreated:orgTime, idFile:idFileOrg, strHash:strHashOrg, imageName:nameCanonical, width:wOrg, height:hOrg}=objT;

  // var Arg=[{imageName:nameOrg}, {collation:{locale:'en', strength:2}}];
  // var [err, results]=await collectionImage.findOne(...Arg).toNBP();   if(err) {reqMy.out500(err); return; };
  // if(!results) {reqMy.out404('Not Found'); return; };
  // var {_id:idImage, tCreated:orgTime, idFile:idFileOrg, strHash:strHashOrg, imageName:nameCanonical}=results;
  

  if(nameCanonical!=nameOrg){    reqMy.out301Loc(nameCanonical); return;    }

  //var maxModTime=new Date(Math.max(orgTime,bootTime));
  var maxModTime=orgTime;
  

  if(boThumb) {
    extend(this, {nameCanonical, wMax, hMax, kind, idImage, idFileOrg, maxModTime, tNow, wOrg, hOrg});
    await reqMediaImageThumb.call(this); return;
  }

  var boValidRequesterCache=this.requesterCacheTime && this.requesterCacheTime>=maxModTime && (this.strHashIn === strHashOrg);
  if(boValidRequesterCache) {  reqMy.out304(); return; }   // Exit because the requester has a valid version


    // Ok so the reponse will be an image
  reqMy.setOutHeader("Content-type", StrMimeType[kind]);
  //reqMy.setOutHeader("Content-type", StrMimeType.jpeg);


  const Arg=[{_id:idFileOrg}];
  var [err, results]=await collectionFileImage.findOne(...Arg).toNBP();   if(err) {reqMy.out500(err); return; };
  if(!results) {reqMy.out500('c!=1'); return; };
  var data=results.data.buffer;

  var strHashOrg=app.md5(data);  //reqMy.setOutHeader('Last-Modified', maxModTime.toUTCString());    reqMy.setOutHeader('ETag', strHashOrg); reqMy.setOutHeader('Content-Length',data.length);
  reqMy.setOutHeader({'Last-Modified':maxModTime.toUTCString(), 'ETag':strHashOrg, 'Content-Length':data.length});
  reqMy.end(data);
 
}

 
app.reqMediaImageThumb=async function(){
  var {reqMy}=this, {req}=reqMy;
  var {nameCanonical, wMax, hMax, kind, idImage, idFileOrg, maxModTime, tNow, wOrg:width, hOrg:height}=this;

    // Get info from thumbCollection
  var objFilter={}
  if(wMax==0) objFilter.height=hMax;
  else if(hMax==0) objFilter.width=wMax;
  else objFilter['$or']=[{width:wMax}, {height:hMax}]; 
  objFilter.idImage=idImage;
  var Arg=[objFilter];
  var [err, result]=await collectionThumb.findOne(...Arg).toNBP();   if(err) {reqMy.out500(err); return; };
  var boExist=Boolean(result);
  var {tCreated:thumbTime=false, idFile:idFileThumb, strHash:strHashThumb}=result||{};

  
  var boValidRequesterCache=this.requesterCacheTime && this.requesterCacheTime>=maxModTime && (this.strHashIn === strHashThumb);
  if(boValidRequesterCache) {  reqMy.out304(); return; }   // Exit because the requester has a valid version


    // If there is an entry in thumbTab (a valid version on the server or boBigger==1)
  var boGotStored=0;
  if(thumbTime!==false && thumbTime>=maxModTime) {
    const Arg=[{_id:idFileThumb}];
    var [err, result]=await collectionFileThumb.findOne(...Arg).toNBP();   if(err) {reqMy.out500(err); return; };
    var boExist=Boolean(result); if(!boExist) {reqMy.out500('Thumb data not found');return;}
    var data=result.data.buffer;

    //if(typeof data == "undefined"){ debugger; reqMy.out500('typeof data == "undefined"'); return;    }

      // If this "thumb" has been requested before and its been calculated that the thumb is bigger than the original (indicated by data.length==0) 
    if(typeof data=="undefined" || data.length==0){  reqMy.out301Loc(nameCanonical); return;    }   //reqMy.setOutHeader(); 
    boGotStored=1;
  } 

    // Ok so the reponse will be an image
  var strMime=StrMimeType[kind];  if(kind=='svg') strMime=StrMimeType['png'];  // using png for svg-thumbs
  reqMy.setOutHeader("Content-type",strMime);

  //if(boGotStored){    reqMy.setOutHeader('Last-Modified', thumbTime.toUTCString());   reqMy.setOutHeader('ETag',strHashThumb);  reqMy.setOutHeader('Content-Length',data.length);  res.end(data);  return;   }
  if(boGotStored){ 
    reqMy.setOutHeader({'Last-Modified':thumbTime.toUTCString(), 'ETag':strHashThumb, 'Content-Length':data.length});
    reqMy.end(data);  return;
  }


  

  //SELECT * FROM mmmWiki_file f left JOIN mmmWiki_thumb t ON f.idFile=t.idFile WHERE f.idFile IN (39,360)

  //
  // No valid (cached) thumb, so go ahead and do the work (create/calculate) it
  //

    // Fetch original data from db
  var Arg=[{_id:idFileOrg}];
  var [err, result]=await collectionFileImage.findOne(...Arg).toNBP();   if(err) {reqMy.out500(err); return; };
  var boExist=Boolean(result); if(!boExist) {reqMy.out500('Original data not found');return;}
  const bufDataOrg=result.data.buffer;



  //var [err, [width, height]]=await imGetSize(bufDataOrg);  if(err) {reqMy.out500(err); return; };
  //var {width, height}=probeImageSize.sync(bufDataOrg)
  if(width==0 && height==0){
    //var [err, [width, height]]=await imGetSize(data);  if(err) return [err];
    var {width, height}=probeImageSize.sync(bufDataOrg)
  }


  var hNew, scale, wNew;
  if(wMax==0) {hNew=hMax; scale=hMax/height; wNew=Math.floor(scale*width);}
  else if(hMax==0) {wNew=wMax; scale=wMax/width; hNew=Math.floor(scale*height);} 
  else { // Watch out for rounding errors:   x!==Math.floor((x/xOrg)*xOrg)    (Which might lead to that another size is cached)
    var arrScale=[wMax/width, hMax/height]; scale=arr_min(arrScale); var k=arrScale[0]<arrScale[1]?0:1;
    if(k==0) {wNew=wMax; hNew=Math.floor(scale*height);   }
    else {wNew=Math.floor(scale*width); hNew=hMax;} 
  }

  var bufDataThumb=bufDataOrg;
  //if(scale>=1) { scale=1;  if(wNew>100){ reqMy.outCode(400,'Bad Request, 100px is the max width for enlargements.'); return;} } // No enlargements
  //if(scale>=1) { scale=1;  if(wNew>100){ reqMy.out301Loc(nameCanonical);  return;} } // 100px is the max width for enlargements
  if(scale>=1) {   reqMy.out301Loc(nameCanonical);  return; } // If enlargement, then redirect to original
  else {
  //if(scale <= 1){

    // if(kind=='svg'){

    //   var [err, pathTmp, fd]=await new Promise(resolve=>{
    //     temporary.file(function(errT, pathT, fd) { resolve([errT, pathT, fd]); }); 
    //   });
    //   if(err){reqMy.out500(err);  return;}

    //   var [err]=await fsPromises.writeFile(pathTmp, bufDataOrg).toNBP();  if(err){reqMy.out500(err); return;}
      
    //   var [err, stdout]=await new Promise(resolve=>{
    //     im.convert(['-resize', wNew+'x'+hNew, 'svg:'+pathTmp, 'png:-'],  function(errT, stdoutT){ resolve([errT, stdoutT]); });
    //   });
    //   if(err) {reqMy.out500(err); return;}
    //   //bufDataThumb=new Buffer(stdout,'binary');
    //   //bufDataThumb=Buffer.from(stdout,'binary');  // Node.js
    //   bufDataThumb=new Buffer(stdout, 'binary');  // Deno
       
    // }else{
    //   // var [err,bufDataThumb]=await new Promise(resolve=>{
    //   //   var myCollector=concat(function(buf){  resolve([null,buf]);   });
    //   //   var streamImg=gm(bufDataOrg).autoOrient().resize(wNew, hNew).stream(function streamOut(err, stdout, stderr) {
    //   //     if(err) {resolve([err]); return;}
    //   //     stdout.pipe(myCollector); 
    //   //   });
    //   // });
    //   // if(err){reqMy.out500(err);  return; } 

    //   const buf=bufDataOrg
    //   const command = new Deno.Command('convert', { args:["fd:0", "-resize", wNew+'x'+hNew, "fd:1"], stdin:"piped", stdout:"piped" });
    //   const child = command.spawn();
    //   const promiseRead=readAllMy(child.stdout);
    //   const writer = child.stdin.getWriter();
    //   await writer.ready;
    //   writer.write(buf);
    //   writer.releaseLock();
    //   await child.stdin.close();
    //   var bufDataThumb = await promiseRead;

    // }
    if(boDeno){
      const boSvg=kind=='svg';
      var args=[ "fd:0", "-resize", wNew+'x'+hNew]
      var argsExtra=boSvg?["svg:fd:1", "png:-"]:["fd:1"]
      args.push(...argsExtra);

      var command = new Deno.Command('convert', { args, stdin:"piped", stdout:"piped" });
      var child = command.spawn();
      var promiseRead=readAllMy(child.stdout);
      var writer = child.stdin.getWriter();
      await writer.ready;
      writer.write(bufDataOrg);
      writer.releaseLock();
      await child.stdin.close();
      var bufDataThumb = await promiseRead;
    }else{
      if(kind=='svg'){
        var [err, pathTmp, fd]=await new Promise(resolve=>{
          temporary.file(function(errT, pathT, fd) { resolve([errT, pathT, fd]); }); 
        });
        if(err){res.out500(err);  return;}

        var [err]=await fsPromises.writeFile(pathTmp, bufDataOrg).toNBP();  if(err){res.out500(err); return;}
        
        var [err, stdout]=await new Promise(resolve=>{
          im.convert(['-resize', wNew+'x'+hNew, 'svg:'+pathTmp, 'png:-'],  function(errT, stdoutT){ resolve([errT, stdoutT]); });
        });
        if(err) {res.out500(err); return;}
        //var bufDataThumb=new Buffer(stdout,'binary');
        var bufDataThumb=Buffer.from(stdout,'binary');
        
      }else{
        var [err,bufDataThumb]=await new Promise(resolve=>{
          var myCollector=concat(function(buf){  resolve([null,buf]);   });
          var streamImg=gm(bufDataOrg).autoOrient().resize(wNew, hNew).stream(function streamOut(err, stdout, stderr) {
            if(err) {resolve([err]); return;}
            stdout.pipe(myCollector); 
          });
        });
        if(err){res.out500(err);  return; } 
        
      }
    }
  }


  var bo301ToOrg=0; if(bufDataThumb.length>bufDataOrg.length/2) {   bufDataThumb=''; bo301ToOrg=1;  }  // If the bufDataThumb is bigger than bufDataOrg/2 then do a 301 to the origin instead. 

  var strHashThumb=app.md5(bufDataThumb);


    // Store in thumb collection
  var thumbTime=tNow;  //tNow=nowSFloored(),
  //const sessionMongo = await dbo.command({startSession:1});
  const sessionMongo = mongoClient.startSession();
  sessionMongo.startTransaction({ readPreference:'primary', readConcern: {level:'local'}, writeConcern:{w:'majority'}   });

  var [err, result]=await storeThumb(sessionMongo, idImage, wNew,hNew, bufDataThumb, strHashThumb, tNow);

  if(err) { var a=await sessionMongo.abortTransaction(); sessionMongo.endSession();  reqMy.out500(err); return; }
  var a=await sessionMongo.commitTransaction(); sessionMongo.endSession();


  if(bo301ToOrg) { reqMy.out301Loc(nameCanonical); return; }

    // Echo to buffer
  //reqMy.setOutHeader('Last-Modified', thumbTime.toUTCString());     reqMy.setOutHeader('ETag',strHashThumb);  reqMy.setOutHeader('Content-Length',bufDataThumb.length);
  reqMy.setOutHeader({'Last-Modified':thumbTime.toUTCString(), 'ETag':strHashThumb, 'Content-Length':bufDataThumb.length});
  //reqMy.setOutHeader('X-Robots-Tag','noindex');
  reqMy.end(bufDataThumb);

}



/******************************************************************************
 * reqMediaVideo
 ******************************************************************************/
app.reqMediaVideo=async function(){
  var {reqMy}=this, {req, pathName}=reqMy;
  
  var Match=RegExp('^/(.*?)$').exec(pathName);
  if(!Match) {reqMy.out404('Not Found'); return;}
  var nameQ=Match[1];

  var strHashIn=getETag(req.headers);
  var requesterCacheTime=getRequesterTime(req.headers);

  var nameOrg=nameQ;
  if( !nameOrg || nameOrg == "" ){ reqMy.out404('Not Found'); return;} // Exit because non-valid name


    // Get info from videoTab
  var sql=`SELECT idVideo, UNIX_TIMESTAMP(tCreated) AS tCreated, idFile, strHash, size, name FROM ${videoTab} WHERE name=?`;
  var Val=[nameOrg];
  var [err, results]=await this.myMySql.query(sql, Val); if(err) {  reqMy.out500(err); return; }
  var c=results.length; if(c==0) {reqMy.out404('Not Found'); return;}
  //var tmp=results[0];
  //var idVideo=tmp.idVideo, orgTime=new Date(tmp.tCreated*1000), idFileOrg=tmp.idFile, strHashOrg=tmp.strHash, total=tmp.size, nameCanonical=tmp.name;
  var {idVideo, tCreated, idFile:idFileThumb, strHash:strHashThumb, size:total, name:nameCanonical}=results[0]; var orgTime=(typeof tCreated!='undefined')?new Date(tCreated*1000):null;
      
       
  if(nameCanonical!=nameOrg){   reqMy.out301Loc(nameCanonical); return;  }


  if(strHashOrg===strHashIn) { reqMy.out304(); return }


  var range = req.headers.get('range')||'0-';
  var positions = range.replace(/bytes=/, "").split("-");
  var start = parseInt(positions[0], 10);
  
  var end=positions[1] ? parseInt(positions[1], 10) : total-1;
  var chunksize=(end-start)+1;



  var type, Match=RegExp('\\.(mp4|ogg|webm)$').exec(nameOrg); if(Match && Match.length>1) type=Match[1]; else {type='txt'; }
  var mimeType=StrMimeType[type]||'txt'; 


  //var sql=`SELECT data FROM ${fileTab} WHERE idFile=?`;
  var sql=`SELECT substr(data, ${start+1}, ${chunksize}) AS data FROM ${fileTab} WHERE idFile=?`;
  var Val=[idFileOrg];
  var [err, results]=await this.myMySql.query(sql, Val); if(err) {  reqMy.out500(err); return; }
  var c=results.length; if(c==0) {reqMy.out404('Not Found');  return;}
  var c=results.length; if(c!=1) {reqMy.out500('c!=1'); return;}
  var {data:buf}=results[0];

  if(chunksize!=buf.length) {reqMy.out500(`chunksize!=buf.length, (${chunksize}!=${buf.length})`); return;}

  reqMy.statusOut(206).setOutHeader({
    "Content-Range": `bytes ${start}-${end}/${total}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunksize,
    "Content-Type": mimeType,
    "ETag": strHashOrg,
    "Cache-Control":"public, max-age=31536000",
    "Last-Modified":orgTime.toUTCString()
  });

  reqMy.end(buf);
}



/******************************************************************************
 * reqSiteMap
 ******************************************************************************/
app.reqSiteMap=async function() {
  var {reqMy}=this, {req, wwwSite}=reqMy;

  //xmlns:image="http://www.google.com/schemas/sitemap-image/1.1

  var Arg=[{www:wwwSite}];
  var [err, result]=await collectionSite.findOne(...Arg).toNBP();   if(err) {reqMy.out500(err); return;}
  if(!result) {reqMy.out500(wwwSite+', site not found'); return;}
  var {_id:idSite, boTLS}=result;

  var Arg=[{idSite,boTemplate:false, boOR:true, boSiteMap:true}];
  var cursor=collectionPage.find(...Arg);
  var [err, results]=await cursor.toArray().toNBP();   if(err) {reqMy.out500(err); return;}


  var Str=[];
  Str.push('<?xml version="1.0" encoding="UTF-8"?>');
  Str.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
  for(var i=0;i<results.length;i++){
    var file=results[i]; //, boTLS=file.boTLS; 
    var strScheme='http'+(boTLS?'s':''),     strSchemeLong=strScheme+'://',    uSite=strSchemeLong+wwwSite;
    var tmp=''; if(file.pageName!='start') tmp='/'+file.pageName;
    var url=uSite+tmp;
    //var tMod=(new Date(file.tMod*1000)).toISOString().slice(0,10);
    var tMod=file.tMod.toISOString().slice(0,10);
    Str.push(`<url><loc>${url}</loc><lastmod>${tMod}</lastmod></url>`);
  }
  Str.push('</urlset>');  
  var str=Str.join('\n'); //res.writeHead(200, "OK", {'Content-Type': StrMimeType.xml});
  reqMy.end(str);
}


/******************************************************************************
 * reqRobots
 ******************************************************************************/
app.reqRobots=async function() {
  var {reqMy}=this, {req, wwwSite}=reqMy;

  if(1) {
    var Str=[];
    Str.push("User-agent: *"); 
    Str.push("Disallow: ")
    var str=Str.join('\n');   reqMy.out200(str);  return; 
  }
  //if(1) {reqMy.out404('404 Not found'); return; }

  //var sql=`SELECT boTLS, pageName, boOR, boOW, UNIX_TIMESTAMP(tMod) AS tMod, lastRev, boOther FROM ${pageLastSiteView} WHERE www=? AND !(pageName REGEXP '^template:.*') AND boOR=1 AND boSiteMap=1`;
  var sql=`SELECT boTLS, pageName, boOR, boOW, UNIX_TIMESTAMP(tMod) AS tMod, lastRev, boOther FROM ${pageLastSiteView} WHERE www=? AND !(pageName REGEXP '^template:.*') AND boOR=1 AND boSiteMap=1`; 
  var Val=[wwwSite];
  var [err, results]=await this.myMySql.query(sql, Val); if(err) {  reqMy.out500(err); return; }
  var Str=[];
  Str.push("User-agent: Google"); 
  Str.push("Disallow: /");
  Str.push("Allow: /$")

  for(var i=0;i<results.length;i++){
    var file=results[i];
    var q=file.pageName;
    Str.push("Allow: /"+q);
  }
  var str=Str.join('\n');   //res.writeHead(200, "OK", {'Content-Type': StrMimeType.txt});   res.end(str);
  reqMy.out200(str);
}


/******************************************************************************
 * reqMonitor
 ******************************************************************************/
app.reqMonitor=async function(){
  var {reqMy}=this, {req}=reqMy;
  
  //if(!req.boCookieLaxOK) {reqMy.outCode(401, "Lax cookie not set");  return;  }
  
  reqMy.removeOutHeader("Content-Security-Policy"); // Allow to be shown in frame, iframe, embed, object
  //res.removeOutHeader("X-Content-Type-Options"); // Allow to be shown in frame, iframe, embed, object
  
  
        // Conditionally push deadlines forward
  var [err, value]=await evalRedis(luaGetNExpire, [reqMy.cookies.sessionIDR+'_adminRTimer'], [maxAdminRUnactivityTime]); this.boARLoggedIn=Number(value);

  if(this.boARLoggedIn!=1) {reqMy.outCode(401,'must be logged in with read access'); return;}

  if(!objOthersActivity){  //  && boPageBUNeeded===null && boImageBUNeeded===null

    var Arg=[{boOther:true}];
    var cursor=collectionPage.find(...Arg);
    var [err, Page]=await cursor.toArray().toNBP();   if(err) {reqMy.out500(err);return; }
    var nEdit=Page.length, boMult=false, strSite="";
    for(var i=0;i<nEdit;i++) { var {idSite}=Page[i]; if(strSite.length==0) strSite=idSite; else if(strSite!==idSite) boMult=true;  }
    if(nEdit==0) {var strPageInfo="0";} 
    else if(nEdit==1) {var strPageInfo=Page[0]._id;} 
    else if(boMult) {var strPageInfo=nEdit+ " (multiple sites)";}
    else {var strPageInfo=nEdit+', '+strSite;}

    

    var Arg=[{boOther:true}];
    var cursor=collectionImage.find(...Arg);
    var [err, Image]=await cursor.toArray().toNBP();   if(err) {reqMy.out500(err);return; }
    var resI=Image[0], nImage=Image.length, strImageInfo=nImage==1?resI.imageName:nImage;

    objOthersActivity={nEdit, strPageInfo,  nImage, strImageInfo};
  }
  
  
  var colPage='';   //if(boPageBUNeeded) colPage='orange';
  var n=objOthersActivity.nEdit,  strPage=n==1?objOthersActivity.pageName:n;   if(n) colPage='red';   

  var colImg='';  //if(boImageBUNeeded) colImg='orange';
  var n=objOthersActivity.nImage,  strImg=n==1?objOthersActivity.imageName:n;   if(n) colImg='red';   

  if(colPage) strPage=`<span style="background-color:${colPage}">${strPage}</span>`;
  if(colImg) strImg=`<span style="background-color:${colImg}">${strImg}</span>`;
  reqMy.end(`<body style="margin: 0px;padding: 0px">${strPage} / ${strImg}</body>`);

}


/******************************************************************************
 * reqStat
 ******************************************************************************/
app.reqStat=async function(){
  var {reqMy}=this, {req, wwwSite}=reqMy;

  //if(!req.boCookieLaxOK) {reqMy.outCode(401, "Lax cookie not set");  return;  }
  
        // Conditionally push deadlines forward
  var [err, value]=await evalRedis(luaGetNExpire, [reqMy.cookies.sessionIDR+'_adminRTimer'], [maxAdminRUnactivityTime]); this.boARLoggedIn=Number(value);

  if(this.boARLoggedIn!=1) {reqMy.outCode(401,'must be logged in with read access'); return;}
  

    // Get the number of documents of each collection.
  var NRow={}
  for(var nameCollection of NameCollection){ 
    var [err, nTmp]=await app["collection"+nameCollection].countDocuments({}).toNBP();   if(err) {reqMy.out500(err); return; };
    NRow["n"+nameCollection]=nTmp;
  }


    // Count number of thumbs for each image
  var Arg=[  
    { "$lookup": {
      "from": "Thumb",
      "localField": "_id",
      "foreignField": "idImage",
      "as": "collB"
    }},
    { "$addFields": { "nThumbCount": { "$size": "$collB" } } }
    //{ $group: {  _id: "$collB", sum: {$sum : 1} } },
  ];
  var cursor=collectionImage.aggregate(Arg);
  var [err, items]=await cursor.toArray().toNBP();   if(err) {reqMy.out500(err);return; }


    // Find collectionPage documents without collectionFileWiki document
  var Arg=[
    { "$lookup": {
      "from": "FileWiki",
      "localField": "idFileWiki",
      "foreignField": "_id",
      "as": "collB"
    }},
    //{ "$project": { myId:"$collB._id", pageName:1 } },
    { "$match": { "collB.0": { "$exists": false } } }
  ];
  var cursor=collectionPage.aggregate(Arg);
  var [err, items]=await cursor.toArray().toNBP();   if(err) {reqMy.out500(err); return; };



  var Str=[]; 
  Str.push(`<!DOCTYPE html>
  <html lang="en"><head>
  <meta name="robots" content="noindex">
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8" >
  <meta name="viewport" id="viewportMy" content="width=device-width, initial-scale=1, minimum-scale=1" />
  <style> table,td,tr {border: solid 1px;border-collapse:collapse}</style>`);


  //var uSiteCommon=''; if(wwwCommon) uSiteCommon=req.strSchemeLong+wwwCommon;
  var wwwCommon=wwwSite;
  var uSiteCommon=reqMy.strSchemeLong+wwwCommon;
  

//   Str.push(`<style>
//   :root {}
//   body {margin:0; height:100%; display:flow-root; font-family:arial, verdana, helvetica; }
// </style>`);

    // If boDbg then set vTmp=0 so that the url is the same, this way the debugger can reopen the file between changes

    // Include stylesheets
  var pathTmp='stylesheets/style.css', vTmp=CacheUri[pathTmp].strHash; if(boDbg) vTmp=0;    Str.push(`<link rel="stylesheet" href="${uSiteCommon}/${pathTmp}?v=${vTmp}" type="text/css">`);

  Str.push(`<script>
    window.elHtml=document.documentElement
    var themeOS=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"
    if(themeOS=='dark') elHtml.setAttribute('data-theme', 'dark'); else elHtml.removeAttribute('data-theme');
  </script>`);

    // Include site specific JS-files
  //var uSite=req.strSchemeLong+wwwSite;
  //var keyCache=req.strSite+'/'+leafSiteSpecific, vTmp=CacheUri[keyCache].strHash; if(boDbg) vTmp=0;  Str.push(`<script type="module" src="${uSite}/${leafSiteSpecific}?v=${vTmp}"></script>`);

    // Include JS-files
  var StrTmp=['lib.js', 'libClient.js'];
  for(var i=0;i<StrTmp.length;i++){
    var pathTmp=StrTmp[i], vTmp=CacheUri[pathTmp].strHash; //if(boDbg) vTmp=0;
    Str.push(`<script type="module" src="${uSiteCommon}/${pathTmp}?v=${vTmp}" crossorigin="anonymous"></script>`);  // crossorigin : to make request cors (not needed really)
  }

  //Str.push(`<script type="module" src="${uSiteCommon}/lib/foundOnTheInternet/sortable.js" crossorigin="anonymous"></script>`);

  Str.push(`</head>
<body style="margin:0">
<h3>Comparing collections</h3>`);


  var {nPage, nFileWiki, nFileHtml, nImage, nFileImage, nThumb, nFileThumb}=NRow;

  var strCol=(nFileWiki==nPage)?"green":"red", strTmpA=`nFileWiki: <font style="background:var(--bg-${strCol})">${nFileWiki}</font>`;
  var strCol=(nFileHtml==nPage)?"green":"red", strTmpB=`nFileHtml: <font style="background:var(--bg-${strCol})">${nFileHtml}</font>`; 
  //var strRow=`nPage: <b>${nPage}</b> (${strTmpA}, ${strTmpB})`;
  // Str.push(`<p>${strRow}</p>`);
  var strRow=`nPage: <b>${nPage}</b> (${strTmpA}, ${strTmpB})`;
  Str.push(`<p>${strRow}</p>`);

  var strCol=(nFileImage==nImage)?"green":"red", strTmpA=`nFileImage: <font style="background:var(--bg-${strCol})">${nFileImage}</font>`;
  //var strRow=`nImage: <b>${nImage}</b> (${strTmpA})`;
  // Str.push(`<p>${strRow}</p>`);
  var strRow=`nImage: <b>${nImage}</b> (${strTmpA})`;
  Str.push(`<p>${strRow}</p>`);

  var strCol=(nFileThumb==nThumb)?"green":"red", strTmpA=`nFileThumb: <font style="background:var(--bg-${strCol})">${nFileThumb}</font>`;
  //var strRow=`nThumb: <b>${nThumb}</b> (${strTmpA})`;
  // Str.push(`<p>${strRow}</p>`);
  var strRow=`nThumb: <b>${nThumb}</b> (${strTmpA})`;
  Str.push(`<p>${strRow}</p>`);


      // PageWNParentErr
  var Arg=[{$where: "function() { return this.nParent != this.IdParent.length }" }, {projection:{_id:1,nParent:1,"nParentCalc":{$size:"$IdParent"}}}];
  var cursor=collectionPage.find(...Arg);
  var [err, PageWNParentErr]=await cursor.toArray().toNBP();   if(err) {reqMy.out500(err); return; };

  Str.push("<h3>List of pages with nParent error</h3>");
  Str.push(makeTable(PageWNParentErr));

    // PageWNChildErr
  var Arg=[{$where: "function() { return this.nChild != this.IdChild.length }" }, {projection:{_id:1,nChild:1,"nChildCalc":{$size:"$IdChild"}}}];
  var cursor=collectionPage.find(...Arg);
  var [err, PageWNChildErr]=await cursor.toArray().toNBP();   if(err) {reqMy.out500(err); return; };

  Str.push("<h3>List of pages with nChild error</h3>");
  Str.push(makeTable(PageWNChildErr));

    // PageWNImageErr
  var Arg=[{$where: "function() { return this.nImage != this.StrImage.length }" }, {projection:{_id:1,nChild:1,"nImageCalc":{$size:"$StrImage"}}}];
  var cursor=collectionPage.find(...Arg);
  var [err, PageWNImageErr]=await cursor.toArray().toNBP();   if(err) {reqMy.out500(err); return; };

  Str.push("<h3>List of pages with nImage error</h3>");
  Str.push(makeTable(PageWNImageErr));


    // PageWNRevisionErr
  var Arg=[{$where: "function() { return this.nRevision != this.arrRevision.length }" }, {projection:{_id:1,nRevision:1,"nRevisionCalc":{$size:"$arrRevision"}}}];
  var cursor=collectionPage.find(...Arg);
  var [err, PageWNRevisionErr]=await cursor.toArray().toNBP();   if(err) {reqMy.out500(err); return; };

  Str.push("<h3>List of pages with nRevision error</h3>");
  Str.push(makeTable(PageWNRevisionErr));
  
    // ImageWNParentErr
  var Arg=[{$where: "function() { return this.nParent != this.IdParent.length }" }, {projection:{_id:1,nParent:1,"nParentCalc":{$size:"$IdParent"}}}];
  var cursor=collectionImage.find(...Arg);
  var [err, ImageWNParentErr]=await cursor.toArray().toNBP();   if(err) {reqMy.out500(err); return; };

  Str.push("<h3>List of images with nParent error</h3>");
  Str.push(makeTable(ImageWNParentErr));
  
  Str.push(`</body>
  </html>`);

  var str=Str.join('\n'); 
  reqMy.end(str);  

}


/******************************************************************************
 * Global functions for mongodb
 ******************************************************************************/

app.deletePageIDMult=async function(sessionMongo, Id){  // Used by BE-deletePage
    // Get IdParent, IdChild, StrImage, arrRevision from the documents
  var Arg=[ {_id:{$in:Id}}, {projection:{IdParent:1, IdChild:1, StrImage:1, arrRevision:1}, session:sessionMongo}];
  var cursor=collectionPage.find(...Arg);
  var [err, ObjPage]=await cursor.toArray().toNBP();   if(err) return [err];

    // Rewrite IdParent, IdChild and StrImage so that there is only one of each.
    // Create IdFile and IdFileHtml.
  var nId=ObjPage.length;
  //const objChild = new Set(), objImage = new Set(), objParent = new Set();
  const objChild = {}, objImage = {}, objParent = {}, StrPage=Array(nId), IdFile=[], IdFileHtml=[];
  for(var i=0;i<nId;i++){
    var {arrRevision, IdChild, StrImage, IdParent, _id:idPage, pageName}=ObjPage[i], nRev=arrRevision.length;
    StrPage[i]=idPage;
    for(var str of IdChild) objChild[str]=1;
    for(var str of StrImage) objImage[str]=1;
    for(var str of IdParent) objParent[str]=1;
    for(var objRev of arrRevision) {IdFile.push(objRev.idFileWiki); IdFileHtml.push(objRev.idFileHtml);}
  }
  var IdChild=Object.keys(objChild), StrImage=Object.keys(objImage), IdParent=Object.keys(objParent);

  var t0=new Date(0);

    // Make changes to parent documents:

    // Make stale, and remove entries from IdChild.
  var strHash="staleBecauseChildDeleted";
  var Arg=[{_id:{$in:IdParent}}, {$set:{strHashParse:strHash, strHash, tModCache:t0}, $pull:{IdChild:{$in:StrPage}}}, {session:sessionMongo}];
  var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err) return [err];
    // Recalculate nChild (can't be done at the same time as IdChild is changed)
  var Arg=[  {_id:{$in:IdParent}},    [{ "$addFields": { "nChild": { "$size": "$IdChild" } } }], {session:sessionMongo}];
  var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err) return [err];



    // Update to child documents:

    // Remove entries from IdParent.
  var Arg=[ {_id: {$in:IdChild}}, { $pull: { IdParent: {$in:StrPage} } }, {session:sessionMongo}];
  var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err) return [err];
    // Recalculate nParent (can't be done at the same time as IdParent is changed)
  var Arg=[  { _id: { $in: IdChild } },    [{ "$addFields": { "nParent": { "$size": "$IdParent" } } }], {session:sessionMongo}];
  var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err) return [err];


    // Update image documents:

    // Remove entries from IdParent.
  var objCollation={ locale:'en', strength:2 };
  var Arg=[ {imageName: {$in:StrImage}},  { $pull: { IdParent: {$in:StrPage} }},  {collation:objCollation, session:sessionMongo}];
  var [err, result]=await collectionImage.updateMany(...Arg).toNBP();   if(err) return [err];
    // Recalculate nParent fin StrImage images (can't be done at the same time as IdParent is changed)
  var Arg=[  { imageName: { $in: StrImage } },    [{ "$addFields": { "nParent": { $size: "$IdParent" } } }],  {collation:objCollation, session:sessionMongo}];
  var [err, result]=await collectionImage.updateMany(...Arg).toNBP();   if(err) return [err];


    // Delete actual data
  var Arg=[ {_id : {$in:IdFile}}, {session:sessionMongo}];
  var [err, result]=await collectionFileWiki.deleteMany(...Arg).toNBP();   if(err) return [err];
  var Arg=[ {_id : {$in:IdFileHtml}}, {session:sessionMongo}];
  var [err, result]=await collectionFileHtml.deleteMany(...Arg).toNBP();   if(err) return [err];


    // Delete pages
  var [err, result]=await collectionPage.deleteMany({_id : {$in:Id}}, {session:sessionMongo}).toNBP();   if(err) return [err];
  return [null];
}

app.deletePage=async function(sessionMongo, objPage){  // Used by saveByReplace
  var {arrRevision, IdChild, StrImage, IdParent, _id:idPage, pageName}=objPage, len=arrRevision.length;
    
    // Delete actual data
  var arrFile=Array(len), arrFileHtml=Array(len);
  for(var i=0;i<len;i++){var {idFileWiki,idFileHtml}=arrRevision[i]; arrFile[i]=idFileWiki; arrFileHtml[i]=idFileHtml;}
  var Arg=[ {_id : {$in:arrFile}}, {session:sessionMongo}];
  var [err, result]=await collectionFileWiki.deleteMany(...Arg).toNBP();   if(err) return [err];
  var Arg=[ {_id : {$in:arrFileHtml}}, {session:sessionMongo}];
  var [err, result]=await collectionFileHtml.deleteMany(...Arg).toNBP();   if(err) return [err];

    // Make changes to parents
  var [err]=await modifyIdChild(sessionMongo, IdParent, idPage, [], []);   if(err) return [err];
  
    // Make changes to children.
  var [err]=await modifyIdParent(sessionMongo, IdChild, StrImage, idPage, [], [], idPage);   if(err) return [err];

    // Delete page
  var [err, result]=await collectionPage.deleteOne({_id:idPage}, {session:sessionMongo}).toNBP();   if(err) return [err];
  return [null];
}

app.deleteImageIDMult=async function(sessionMongo, Id){  // Used by BE-deleteImage
    // Get IdParent and idFile from the documents
  var Arg=[ {_id:{$in:Id}}, {projection:{IdParent:1, imageName:1, idFile:1}, session:sessionMongo}];
  var cursor=collectionImage.find(...Arg);
  var [err, ObjImage]=await cursor.toArray().toNBP();   if(err) return [err];

    // Create IdParent where there is only one of each.
    // Create IdFile.
  var nId=ObjImage.length;
  const objParent = {}, IdFile=[], StrImage=Array(nId);
  for(var i=0;i<nId;i++){
    var {IdParent, _id, idFile, imageName}=ObjImage[i];
    StrImage[i]=imageName.toLowerCase();
    for(var str of IdParent) objParent[str]=1;
    IdFile[i]=idFile;
  }
  var IdParent=Object.keys(objParent);

  var t0=new Date(0);
  
    // Make changes to parent documents:

    // Make stale, and remove entries from StrImage.
  var strHash="staleBecauseChildDeleted";
  var Arg=[{_id:{$in:IdParent}}, {$set:{strHashParse:strHash, strHash, tModCache:t0}, $pull:{StrImage:{$in:StrImage}}}, {session:sessionMongo}];
  var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err) return [err];
    // Recalculate nImage (can't be done at the same time as StrImage is changed)
  var Arg=[  { _id: { $in: IdParent } },    [{ "$addFields": { "nImage": { "$size": "$StrImage" } } }], {session:sessionMongo}];
  var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err) return [err];


    // Delete image meta and data
  var Arg=[ {_id:{$in:Id}}, {session:sessionMongo}];
  var [err, result]=await collectionImage.deleteMany(...Arg).toNBP();   if(err) return [err];
  var [err, result]=await collectionFileImage.deleteMany({_id : {$in:IdFile}}, {session:sessionMongo}).toNBP();   if(err) return [err];



    // Get IdThumbFile
  var Arg=[ {idImage:{$in:Id}}, {projection:{ idFile:1}, session:sessionMongo}];
  var cursor=collectionThumb.find(...Arg);
  var [err, ObjThumb]=await cursor.toArray().toNBP();   if(err) return [err];

  var nThumb=ObjThumb.length, IdThumbFile=Array(nThumb);
  for(var i=0;i<nThumb;i++){IdThumbFile[i]=ObjThumb[i].idFile;}

    // Delete from collectionFileThumb
  var [err, result]=await collectionFileThumb.deleteMany({_id : {$in:IdThumbFile}}, {session:sessionMongo}).toNBP();   if(err) return [err];
    // Delete from collectionThumb
  var [err, result]=await collectionThumb.deleteMany({idImage : {$in:Id}}, {session:sessionMongo}).toNBP();   if(err) return [err];

  return [null];
}


  // Modify StrImage: (alt name: modifyParentsRelationsI)
  // In IdParentOld: remove IdImageOld from StrImage
  // In IdParentNew: add IdImageNew to StrImage
app.modifyStrImage=async function(sessionMongo, IdParentOld, StrImageOld, IdParentNew, StrImageNew){  // Used by BE-renameImage

  if(!(StrImageOld instanceof Array)) StrImageOld=[StrImageOld];
  if(!(StrImageNew instanceof Array)) StrImageNew=[StrImageNew];
  StrImageOld=StrImageOld.sort(); StrImageNew=StrImageNew.sort();
  var boStrImageEqual=array_equal(StrImageOld, StrImageNew);

    // If boStrImageEqual then one can skip the intersection of IdChildOld and IdChildNew
  if(boStrImageEqual){   var IdParentRemove=AMinusB(IdParentOld, IdParentNew), IdParentInsert=AMinusB(IdParentNew, IdParentOld);   }
  else {   var IdParentRemove=IdParentOld, IdParentInsert=IdParentNew;  }

  var t0=new Date(0);

    // Remove entries from StrImage.
  var strHash="modifyStrImage";
  var Arg=[{_id:{$in:IdParentRemove}}, {$set:{strHashParse:strHash, strHash, tModCache:t0}, $pull:{StrImage:{$in:StrImageOld}}}, {session:sessionMongo}];
  var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err) return [err];
    // Recalculate nImage (can't be done at the same time as StrImage is changed)
  var Arg=[{_id:{$in:IdParentRemove}},    [{ "$addFields": { "nImage": { "$size": "$StrImage" } } }], {session:sessionMongo}];
  var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err) return [err];


    // Add entries from StrImage.
  var strHash="modifyStrImage";
  var Arg=[{_id:{$in:IdParentNew}}, {$set:{strHashParse:strHash, strHash, tModCache:t0}, $addToSet:{StrImage:{$each:StrImageNew}}}, {session:sessionMongo}];
  var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err) return [err];
    // Recalculate nImage (can't be done at the same time as StrImage is changed)
  var Arg=[{_id:{$in:IdParentNew}},    [{ "$addFields": { "nImage": { "$size": "$StrImage" } } }], {session:sessionMongo}];
  var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err) return [err];
  return [null];
}

  // Remove from IdChild: (alt name: removeArrIdPageFromIdChildInArrIdParent)
  // For pages in arrIdParent: remove arrIdPage from IdChild
app.removeFromIdChild=async function(sessionMongo, arrIdParent, arrIdPage){
  if(!(arrIdPage instanceof Array)) arrIdPage=[arrIdPage];
    // Remove entries from IdChild.
  var strHash="removeFromIdChild", t0=new Date(0);
  var Arg=[{_id:{$in:arrIdParent}}, {$set:{strHashParse:strHash, strHash, tModCache:t0}, $pull:{IdChild:{$in:arrIdPage}}}, {session:sessionMongo}];
  var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err) return [err];
    // Recalculate nChild (can't be done at the same time as IdChild is changed)
  var Arg=[{_id:{$in:arrIdParent}},    [{ "$addFields": { "nChild": { "$size": "$IdChild" } } }], {session:sessionMongo}];
  var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err) return [err];
  return [null];
}

  // Add to IdChild: (alt name: addArrIdPageToIdChildInArrIdParent)
  // For pages in arrIdParent: add arrIdPage to IdChild
app.addToIdChild=async function(sessionMongo, arrIdParent, arrIdPage){
  if(!(arrIdPage instanceof Array)) arrIdPage=[arrIdPage];
    // Add entries from IdChild.
  var strHash="addToIdChild", t0=new Date(0);
  var Arg=[{_id:{$in:arrIdParent}}, {$set:{strHashParse:strHash, strHash, tModCache:t0}, $addToSet:{IdChild:{$each:arrIdPage}}}, {session:sessionMongo}];
  var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err) return [err];
    // Recalculate nChild (can't be done at the same time as IdChild is changed)
  var Arg=[{_id:{$in:arrIdParent}},    [{ "$addFields": { "nChild": { "$size": "$IdChild" } } }], {session:sessionMongo}];
  var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err) return [err];
  return [null];
}

  // Modify IdChild: (alt name: modifyParentsRelations)
  // For pages in IdParentOld: remove IdPageOld from IdChild
  // For pages in IdParentNew: add IdPageNew to IdChild
app.modifyIdChild=async function(sessionMongo, IdParentOld, IdPageOld, IdParentNew, IdPageNew){// Used by deletePage, changeSiteOne, BE-renamePage

  if(!(IdPageOld instanceof Array)) IdPageOld=[IdPageOld];
  if(!(IdPageNew instanceof Array)) IdPageNew=[IdPageNew];
  IdPageOld=IdPageOld.sort(); IdPageNew=IdPageNew.sort();
  var boIdPageEqual=array_equal(IdPageOld, IdPageNew);

    // If boIdPageEqual then one can skip the intersection of IdChildOld and IdChildNew
  if(boIdPageEqual){   var IdParentRemove=AMinusB(IdParentOld, IdParentNew), IdParentInsert=AMinusB(IdParentNew, IdParentOld);   }
  else {   var IdParentRemove=IdParentOld, IdParentInsert=IdParentNew;  }

    // Remove IdPageOld from IdChild in IdParentRemove.
  if(IdParentRemove.length && IdPageOld.length){
    var [err]=await removeFromIdChild(sessionMongo, IdParentRemove, IdPageOld);   if(err) return [err];
  }

    // Add IdPageNew to IdChild in IdParentInsert.
  if(IdParentInsert.length && IdPageNew.length){
    var [err]=await addToIdChild(sessionMongo, IdParentInsert, IdPageNew);   if(err) return [err];
  }

  return [null];
}

  // Modify IdChildLax:
  // For pages in arrIdParent: 
  //     remove IdPageOld from IdChildLax
  //     add IdPageNew to IdChildLax
app.modifyIdChildLax=async function(sessionMongo, arrIdParent, IdPageOld, IdPageNew){ // Used by BE-renamePage
  if(!(IdPageOld instanceof Array)) IdPageOld=[IdPageOld];
  if(!(IdPageNew instanceof Array)) IdPageNew=[IdPageNew];

    // Add entries from IdChildLax.
  var Arg=[{_id:{$in:arrIdParent}}, { $pull:{IdChildLax:{$in:IdPageOld}}}, {session:sessionMongo}];
  var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err) return [err];
    // Add entries from IdChildLax.
  var Arg=[{_id:{$in:arrIdParent}}, { $addToSet:{IdChildLax:{$each:IdPageNew}}}, {session:sessionMongo}];
  var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err) return [err];
  return [null];
}

  // Modify IdParent (alt name: modifyChildrensRelations):
  // For pages in IdChildOld and StrImageOld: remove IdPageOld from IdParent.
  // For pages in IdChildNew and StrImageNew: add IdPageNew to IdParent.
app.modifyIdParent=async function(sessionMongo, IdChildOld, StrImageOld, IdPageOld, IdChildNew, StrImageNew, IdPageNew){ //Used by reqIndex, deletePage, changeSiteOne, BE-pageLoad, BE-saveByReplace, BE-saveByAdd

  if(!(IdPageOld instanceof Array)) IdPageOld=[IdPageOld];
  if(!(IdPageNew instanceof Array)) IdPageNew=[IdPageNew];
  IdPageOld=IdPageOld.sort(); IdPageNew=IdPageNew.sort();
  var boIdPageEqual=array_equal(IdPageOld, IdPageNew)

    // Child documents: 
    // If boIdPageEqual then one can skip the intersection of IdChildOld and IdChildNew
  if(boIdPageEqual){   var IdChildRemove=AMinusB(IdChildOld, IdChildNew), IdChildInsert=AMinusB(IdChildNew, IdChildOld);   }
  else {   var IdChildRemove=IdChildOld, IdChildInsert=IdChildNew;   }
    // Removes
  if(IdChildRemove.length){  
    var Arg=[ {_id: {$in:IdChildRemove}}, { $pull: { IdParent: {$in:IdPageOld} } }, {session:sessionMongo}];  // Remove from IdParent
    var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err) return [err];
      // Recalculate nParent (as it is unknown if something was removed)
    var Arg=[  { _id: { $in: IdChildRemove } },    [{ "$addFields": { "nParent": { "$size": "$IdParent" } } }], {session:sessionMongo}];
    var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err) return [err];
  }
    // Inserts
  if(IdChildInsert.length){
    var Arg=[ {_id: {$in:IdChildInsert}}, { $addToSet: { IdParent: {$each:IdPageNew} } }, {session:sessionMongo}];  // Add to IdParent
    var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err) return [err];
      // Recalculate nParent (as it is unknown if something was removed)
    var Arg=[  { _id: { $in: IdChildInsert } },    [{ "$addFields": { "nParent": { "$size": "$IdParent" } } }], {session:sessionMongo}];
    var [err, result]=await collectionPage.updateMany(...Arg).toNBP();   if(err) return [err];
  }


    // Image documents:
    // If boIdPageEqual then one can skip the intersection of StrImageOld and StrImageNew
  if(boIdPageEqual){   var StrImageRemove=AMinusB(StrImageOld, StrImageNew), StrImageInsert=AMinusB(StrImageNew, StrImageOld);   }
  else {   var StrImageRemove=StrImageOld, StrImageInsert=StrImageNew;   }

  var objCollation={ locale:'en', strength:2 };
    // Removes
  if(StrImageRemove.length){
    var Arg=[ {imageName: {$in:StrImageRemove}}, { $pull: { IdParent: {$in:IdPageOld} } },  {collation:objCollation, session:sessionMongo}];
    var [err, result]=await collectionImage.updateMany(...Arg).toNBP();   if(err) return [err];
      // Recalculate nParent (as it is unknown if something was removed)
    var Arg=[  { imageName: { $in: StrImageRemove } },    [{ "$addFields": { nParent: { $size: "$IdParent" } } }],  {collation:objCollation, session:sessionMongo}];
    var [err, result]=await collectionImage.updateMany(...Arg).toNBP();   if(err) return [err];
  }
    // Inserts
  if(StrImageInsert.length){
    var Arg=[ {imageName: {$in:StrImageInsert}}, { $addToSet: { IdParent: {$each:IdPageNew} } },  {collation:objCollation, session:sessionMongo}];
    var [err, result]=await collectionImage.updateMany(...Arg).toNBP();   if(err) return [err];
      // Recalculate nParent (as it is unknown if something was removed)
    var Arg=[  { imageName: { $in: StrImageInsert } },    [{ "$addFields": { nParent: { $size: "$IdParent" } } }],  {collation:objCollation, session:sessionMongo}];
    var [err, result]=await collectionImage.updateMany(...Arg).toNBP();   if(err) return [err];
  }
  return [null]
}




app.storeImage=async function(sessionMongo, oFile, arg={}){ //Used by BE-uploadUser, loadFrFilesOrBufs
  //"imageName", "idFile", "boOther", "tCreated", "strHash", "size", "widthSkipThumb", "width", "height", "extension", "tLastAccess", "nAccess", "tMod", "hash", "nParent", "IdParent"

  var {boDoCalculationOfIdParent=true, boOther=false, width=0, height=0}=arg;

  var {strName:imageName, strExt:extension, buf, strPath}=oFile;
  if(typeof buf!="undefined"){
    //var buf=Buffer.from(fileInZip._data,'binary');
    //var buf=bufFrZip;
  }else if(typeof strPath!="undefined"){
    var [err, buf]=await fsPromises.readFile(strPath).toNBP();    if(err) return [err];
  }else{ return [new Error('neither "bufData", "strPath", nor "buffer" is set')]; }

  var data=buf;

  if(width==0 && height==0){
    //var [err, [width, height]]=await imGetSize(data);  if(err) return [err];
    var {width, height}=probeImageSize.sync(data)
  }
  

  if(typeof extension=="undefined"){ var Match=regExt.exec(imageName), extension=Match[1].toLowerCase();}

  var size=data.length, strHash=app.md5(data), tNow=nowSFloored();

    // Check if image exists
  var objCollation={ locale:'en', strength:2 };
  var Arg=[ {imageName}, {collation:objCollation, session:sessionMongo}];  
  var [err, objImage]=await collectionImage.findOne(...Arg).toNBP();   if(err) return [err];
  var boExist=Boolean(objImage);

  if(boExist){
    var {idFile, _id:idImage}=objImage;
    var Arg=[ {_id:idFile}, {$set:{data}}, {session:sessionMongo}];
    var [err, result]=await collectionFileImage.updateOne(...Arg).toNBP();   if(err) return [err];

    var objSet={ boOther, tMod:tNow, size, strHash, hash:strHash, width, height};
    var objSetOnInsert={ tCreated:tNow, tLastAccess:new Date(0), nAccess:0, nParent:0, IdParent:[]};
    var Arg=[ {_id:idImage}, {$set:objSet, $setOnInsert:objSetOnInsert}, {session:sessionMongo}];
    var [err, result]=await collectionImage.updateOne(...Arg).toNBP();   if(err) return [err];
  }else{
    var Arg=[{data}, {session:sessionMongo}];
    var [err, result]=await collectionFileImage.insertOne(...Arg).toNBP();   if(err) return [err];
    var {insertedId:idFile}=result;

    var objSet={imageName, idFile, extension, boOther, tMod:tNow, size, strHash, hash:strHash, width, height, widthSkipThumb:0, tCreated:tNow, tLastAccess:new Date(0), nAccess:0, nParent:0, IdParent:[]};

    if(boDoCalculationOfIdParent){
      var Arg=[ {StrImage: imageName.toLowerCase()}, {session:sessionMongo}];  // Find parents
      var cursor=collectionPage.find(...Arg);
      var [err, items]=await cursor.toArray().toNBP();   if(err) return [err];
      if(items===null) var IdParent=[];
      else {     var IdParent=Array(items.length);   for(var i=0;i<items.length;i++){ IdParent[i]=items[i]._id; }       }
      extend(objSet, {IdParent, nParent:IdParent.length});
    }
    var Arg=[objSet, {session:sessionMongo}];  
    var [err, result]=await collectionImage.insertOne(...Arg).toNBP();   if(err) return [err];
  }

  return [null];
}


app.storeThumb=async function(sessionMongo, idImage, width, height, data, strHash, tNow){ //Used by reqMediaImageFile
  var size=data.length;

    // Check if image exists
  var Arg=[ {idImage,width,height}, {session:sessionMongo}];  
  var [err, objThumb]=await collectionThumb.findOne(...Arg).toNBP();   if(err) return [err];
  var boExist=Boolean(objThumb);

  if(boExist){
    var {idFile}=objThumb;
    var Arg=[ {idImage,width,height}, {$set:{ tCreated:tNow, strHash, size}}, {session:sessionMongo}];
    var [err, result]=await collectionThumb.updateOne(...Arg).toNBP();   if(err) return [err];

    var Arg=[ {_id:idFile}, {$set:{data}}, {session:sessionMongo}];
    var [err, result]=await collectionFileThumb.updateOne(...Arg).toNBP();   if(err) return [err];
  }else{
    var Arg=[{data}, {session:sessionMongo}];
    var [err, result]=await collectionFileThumb.insertOne(...Arg).toNBP();   if(err) return [err];
    var {insertedId:idFile}=result;

    var objSet={idImage, width, height, idFile, tCreated:tNow, strHash, size};
    var Arg=[objSet, {session:sessionMongo}];  
    var [err, result]=await collectionThumb.insertOne(...Arg).toNBP();   if(err) return [err];
  }

  return [null];
}


app.changeSiteOne=async function(sessionMongo, idPageOld, idSiteNew){ // Used by BE-setSiteOfPage
  //debugger; // not yet implemented
  //return [new Error('changeSiteOne not yet implemented')];

  var {siteName:idSiteOld, pageName:pageNameLC}=parsePageNameHD(idPageOld);
  var idPageNew=idSiteNew+":"+pageNameLC;

    // Check for collision
  var [err, n]=await collectionPage.countDocuments({_id:idPageNew}, {session:sessionMongo}).toNBP();   if(err) return [err];
  if(n) return [new Error('nameExist')];

    // Get stuff from the page: IdParent IdChild, StrImage
  var [err, objPage]=await collectionPage.findOne({_id:idPageOld}, {session:sessionMongo}).toNBP();   if(err) return [err];
  if(!objPage) return [new Error('Page does not exist')]
  var { IdParent:IdParentOld, IdChild:IdChildOld, IdChildLax:IdChildLaxOld, StrImage}=objPage;

    // Translate IdChildLax
  var len=IdChildLaxOld.length, IdChildLaxTranslated=Array(len);
  for(var i=0;i<len;i++) {   let {pageName}=parsePageNameHD(IdChildLaxOld[i]);   IdChildLaxTranslated[i]=idSiteNew+":"+pageName.toLowerCase();   }


    // Get existing parents (those who already points to the new name)
  var cursor=collectionPage.find({IdChildLax:idPageNew}, {session:sessionMongo});
  var [err, items]=await cursor.toArray().toNBP();   if(err) return [err];
  var len=items.length, IdParentWStubs=Array(len); for(var i=0;i<len;i++) {IdParentWStubs[i]=items[i]._id;}
  
  var IdParentNew=IdParentWStubs;

    // Make changes to parents
  var [err]=await modifyIdChild(sessionMongo, IdParentOld, idPageOld, IdParentNew, idPageNew);   if(err) return [err];


    // Get IdChildNew (Check which of IdChildLaxTranslated that exist)
  var Arg=[ {_id: {$in:IdChildLaxTranslated}}, { projection:{_id:1}, session:sessionMongo}];
  var cursor=collectionPage.find(...Arg);
  var [err, items]=await cursor.toArray().toNBP();   if(err) return [err];
  var IdChildNew=Array(items.length); for(var i=0;i<items.length;i++) {IdChildNew[i]=items[i]._id}
  

    // Change children
  var [err]=await modifyIdParent(sessionMongo, IdChildOld, StrImage, idPageOld, IdChildNew, StrImage, idPageNew);   if(err) return [err];


    // Update page
  extend(objPage, {_id:idPageNew, idSite:idSiteNew, IdParent:IdParentNew, IdChild:IdChildNew, IdChildLax:IdChildLaxTranslated, nParent:IdParentNew.length, nChild:IdChildNew.length});
  var [err, result]=await collectionPage.insertOne(objPage, {session:sessionMongo}).toNBP();   if(err) return [err];    // Write new Page
  var [err, result]=await collectionPage.deleteOne({_id:idPageOld}, {session:sessionMongo}).toNBP();   if(err) return [err];    // Delete old Page
    
    // Change idPage in FileWiki
  var Arg=[{idPage:idPageOld}, {$set:{idPage:idPageNew}}, {session:sessionMongo}];
  var [err, result]=await collectionFileWiki.updateMany(...Arg).toNBP();   if(err) return [err];

  return [null];
}


/******************************************************************************
 * SetupMongo
 ******************************************************************************/
app.SetupMongo=function(){}

app.SetupMongo.prototype.drop=async function(){
  var [err, result]=await dbo.listCollections().toArray().toNBP(); if(err) return [err];
  for(var obj of result){
    var nameCollection=obj.name;
    //const coll = dbo.collection(nameCollection);
    //var [err, result]=await coll.drop().toNBP(); if(err) return [err];
    var [err, result]=await dbo.command({ drop:nameCollection}).toNBP();   if(err) return [err];
    var objTmp=copySome({}, result, ['nIndexesWas', 'ok'])
    console.log(`Dropping: ${result.ns} `+serialize(objTmp))
    //var len=result.length||0;  if(len) console.log(len+" collections dropped.");
  }
  
  return [null];
}
app.SetupMongo.prototype.truncate=async function(boSkippSetting=false){
  for(var nameCollection of NameCollection){
    if(boSkippSetting && nameCollection=="Setting") continue;
    var [err, result]=await app["collection"+nameCollection].deleteMany({}).toNBP();   if(err) return [err];
    console.log(nameCollection+": "+result.deletedCount);
  }
  return [null];
}
app.SetupMongo.prototype.truncateAllExceptSetting=async function(){
  var [err]=await this.truncate(true);  if(err) return [err];
  return [null];
}
app.SetupMongo.prototype.countRows=async function(){
  for(var nameCollection of NameCollection){
    var [err, result]=await app["collection"+nameCollection].countDocuments({}).toNBP();   if(err) return [err];
    console.log(nameCollection+": "+result);
  }
  return [null];
}
app.SetupMongo.prototype.create=async function(){
  console.log(`Dropping collections:`)
  console.log(`=====================`)
  var [err]=await this.drop();  if(err) return [err];

  console.log(`Creating collections (and indexes):`)
  console.log(`===================================`)
  for(var nameCollection of NameCollection){
    //var [err, result]=await app["collection"+nameCollection].deleteMany({}).toNBP();   if(err) return [err]; ;

    //var [err, result]=await app["collection"+nameCollection].drop().toNBP();   if(err) return [err];
    var {validator, ArrIndex}=app.InitCollection[nameCollection];
    var [err, item]=await dbo.createCollection(nameCollection, {validator}).toNBP();   if(err) return [err];
    console.log(`${nameCollection}`)

    if(typeof ArrIndex=="undefined" || ArrIndex.length==0) continue;
    // for(var j=0;j<ArrIndex.length;j++){
    //   var arrIndex=ArrIndex[j];
    //   var objExtra={"unique":1};
    //   if(arrIndex.length==1) arrIndex.push(objExtra);
    //   else extend(arrIndex[arrIndex.length-1], objExtra);
    //   //var [err, result]=await app["collection"+nameCollection].createIndex(...arrIndex).toNBP();   if(err) return [err];
    // }
    var [err, result]=await dbo.command({ createIndexes:nameCollection, indexes:ArrIndex}).toNBP();   if(err) return [err];
    //console.log(result)
    var objTmp=copySome({}, result, ['numIndexesBefore', 'numIndexesAfter', 'ok', 'commitQuorum', 'createdCollectionAutomatically'])
    console.log(`  Indexes: `+serialize(objTmp))
  }
  var len=NameCollection.length||0;  console.log(len+" collections created.");

  console.log("Populating settings.");
  console.log("====================");
  var [err]=await this.populateSetting();  if(err) return [err];
  return [null];
}
app.SetupMongo.prototype.populateSetting=async function(){
  var tNow=nowSFloored();
  var t0=new Date(0);
  var arg=[
    {name:"lastOthersEdit", value:""},
    {name:"nNewPages", value:"0"},
    {name:"lastOthersUpload", value:""},
    {name:"nNewImages", value:"0"},
    {name:"pageTModLast", value:"(no mods done yet)"},
    {name:"tModLast", value:tNow},
    {name:"tLastBU", value:t0}
  ];
  var [err, result]=await app.collectionSetting.insertMany(arg).toNBP();   if(err) return [err];
  return [null];
}

  // Called when --mongodb command line option is used
app.SetupMongo.prototype.doQuery=async function(strMongoCreate){
  var [err]=await this[strMongoCreate]();  if(err) return [err];
  return [null];
}




