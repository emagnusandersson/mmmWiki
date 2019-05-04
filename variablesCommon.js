

two31=Math.pow(2,31);  intMax=two31-1;  intMin=-two31;
sPerDay=24*3600;  sPerMonth=sPerDay*30;

fsWebRootFolder=process.cwd();
flLibFolder='lib';

flFoundOnTheInternetFolder=flLibFolder+"/foundOnTheInternet";
flLibImageFolder=flLibFolder+"/image";  

  // Files: 
leafBE='be.json';
leafCommon='common.js';


StrImageExt=['jpg','jpeg','png','gif','svg'];


messPreventBecauseOfNewerVersions="Preventing overwrite since there are newer versions. Copy your edits temporary, then reload page.";

version='100';
maxGroupsInFeat=20;
preDefault="p.";


selTimeF=function(name){  return "UNIX_TIMESTAMP("+name+")";  };

    //    0        1
bName=['block','help'];
bFlip=array_flip(bName);

var tFeat={kind:'S11',min:[0, 0.25, 1, 3, 8, 24, 72, 168, 3*168, 8760/4, 8760, 3*8760], bucketLabel:['0', '¼h', '1h', '3h', '8h', '1d', '3d', '1w', '3w', '¼y', '1y', '3y']};
for(var i=0;i<tFeat.min.length;i++) tFeat.min[i]*=3600; // make hours to seconds

var sizePageFeat={kind:'S11',min:[0, 0.1, 0.3, 1, 3, 10, 30, 100], bucketLabel:['0', '100', '300', '1k', '3k', '10k', '30k', '100k']};
var sizeImageFeat={kind:'S11',min:[0, 0.1, 0.3, 1, 3, 10, 30, 100, 300, 1000, 3000], bucketLabel:['0', '100', '300', '1k', '3k', '10k', '30k', '100k', '300k', '1M', '3M']};
for(var i=0;i<sizePageFeat.min.length;i++) sizePageFeat.min[i]*=1000; // make kB to B
for(var i=0;i<sizeImageFeat.min.length;i++) sizeImageFeat.min[i]*=1000; // make kB to B


var arrMinT=[0, 10, 20, 30, 40, 50, 60, 70, 80, 90], arrMaxT=[], arrLabT=[];
for(var i=0;i<arrMinT.length;i++) { var tmp=arrMinT[i]; arrMaxT[i]=tmp+10; arrLabT[i]=tmp/100; }
var intPriorityFeat={kind:'S11',min:arrMinT,max:arrMaxT,bucketLabel:arrLabT};

var nAccessFeat={kind:'S11',min:[0, 3, 10, 30, 1e2, 3e2, 1e3, 3e3, 1e4, 3e4, 1e5, 3e5, 1e6, 3e6]};  nAccessFeat.bucketLabel=numWithUnitPrefixArr(nAccessFeat.min);
var nChildFeat={kind:'S11',min:[0, 1, 2, 4, 8, 16, 32, 64, 128]};
var nParentFeat={kind:'S11',min:[0, 1, 2, 3, 4, 5, 6, 8, 10]};
var lastRevFeat={kind:'S11',min:[0, 1, 2, 3, 4, 5, 6, 8, 10]};

/*******************************************************************
 * PropPage
 *******************************************************************/

PropPage={
siteName:            {b:'10',feat:{kind:'B'}},
parent:              {b:'11',feat:{kind:'B'}},
size:                {b:'11',feat:sizePageFeat},
boOR:                {b:'01',feat:{kind:'BN',span:1}},
boOW:                {b:'01',feat:{kind:'BN',span:1}},
boSiteMap:           {b:'01',feat:{kind:'BN',span:1}},
boTalk:              {b:'01',feat:{kind:'BN',span:1}},
boTemplate:          {b:'01',feat:{kind:'BN',span:1}},
boOther:             {b:'01',feat:{kind:'BN',span:1}},
tCreated:            {b:'11',feat:tFeat},
tMod:                {b:'11',feat:tFeat},
tModCache:           {b:'11',feat:tFeat},
nChild:              {b:'10',feat:nChildFeat},
nImage:              {b:'10',feat:nChildFeat},
intPriority:         {b:'10',feat:intPriorityFeat},
tLastAccess:         {b:'10',feat:tFeat},
nAccess:             {b:'10',feat:nAccessFeat},
nParent:             {b:'10',feat:nParentFeat},
lastRev:             {b:'10',feat:lastRevFeat}
};
StrOrderFiltPage=Object.keys(PropPage);

extend(PropPage,{
pageName:            {b:'00'},
idPage:              {b:'00'},
idFile:              {b:'00'},
www:                 {b:'00'}});


  // Note! all methods use column-name as the name-parameter (ex: name="tMod") except cond0F and cond1F that uses table-alias (pre) + column-name as the name-parameter (ex: name="p.tMod").
  // It would probably be best that the table-alias and column-name comes in two separate parameters.

  // cond0F
tmpCond0F=function(name, val){  return "UNIX_TIMESTAMP("+name+")<=UNIX_TIMESTAMP(now())-"+val; };
PropPage.tCreated.cond0F=PropPage.tMod.cond0F=PropPage.tModCache.cond0F=PropPage.tLastAccess.cond0F=tmpCond0F;
  // cond1F
tmpCond1F=function(name, val){  return "UNIX_TIMESTAMP("+name+")>UNIX_TIMESTAMP(now())-"+val; };
PropPage.tCreated.cond1F=PropPage.tMod.cond1F=PropPage.tModCache.cond1F=PropPage.tLastAccess.cond1F=tmpCond1F;
  // condBNameF
PropPage.siteName.condBNameF=function(name, Val){ return "idSite";} // Becomes pre+".idSite"
PropPage.parent.condBNameF=function(name, Val){ return "idPage";} // Becomes pre+".idPage"
  // boIncludeNull
PropPage.siteName.boIncludeNull=1;
PropPage.parent.boIncludeNull=1;

  // pre
PropPage.parent.pre='s.';
//PropPage.siteName.pre='p.';
 
  // relaxCountExp
PropPage.siteName.relaxCountExp=function(name){ return "COUNT(DISTINCT p.idPage)"; }
PropPage.parent.relaxCountExp=function(name){ return "COUNT(DISTINCT p.idPage)"; }
var tmpRelaxCountExp=function(){ return null;}
var StrTmp=['boOR','boOW','boSiteMap','boTalk','boTemplate','boOther'];
for(var i=0;i<StrTmp.length;i++){  var name=StrTmp[i]; PropPage[name].relaxCountExp=tmpRelaxCountExp; }

  // histF
PropPage.siteName.histF=function(name, strTableRef,strCond,strOrder){
  return `SELECT p.idSite AS bin, COUNT(DISTINCT p.idPage) AS groupCount FROM 
`+pageLastSiteView+` p LEFT JOIN `+subTab+` s  ON s.idSite=p.idSite AND s.pageName=p.pageName 
`+strCond+`
GROUP BY bin ORDER BY `+strOrder+`;`;
}
PropPage.parent.histF=function(name, strTableRef,strCond,strOrder){
  return `SELECT s.idPage AS bin, COUNT(DISTINCT p.idPage) AS groupCount FROM 
`+pageLastSiteView+` p LEFT JOIN `+subTab+` s  ON s.idSite=p.idSite AND s.pageName=p.pageName 
`+strCond+`
GROUP BY bin ORDER BY `+strOrder+`;`;
}

  // binValueF
var tmpBinValueF=function(name){ return "COUNT(DISTINCT p.idPage)";}
var StrTmp=['siteName','parent', 'size','boOR','boOW','boSiteMap','boTalk','boTemplate','boOther','tCreated','tMod','tModCache', 'nChild', 'nImage','intPriority', 'tLastAccess', 'nAccess', 'nParent', 'lastRev'];
for(var i=0;i<StrTmp.length;i++){  var name=StrTmp[i]; PropPage[name].binValueF=tmpBinValueF; }

  // histCondF
var tmpHistCondF=function(name){ return "-UNIX_TIMESTAMP(p."+name+")+UNIX_TIMESTAMP(now())";};
PropPage.tCreated.histCondF=PropPage.tMod.histCondF=PropPage.tModCache.histCondF=PropPage.tLastAccess.histCondF=tmpHistCondF;



/*******************************************************************
 * PropImage
 *******************************************************************/

PropImage={
siteName:          {b:'11',feat:{kind:'B'}},
parent:              {b:'11',feat:{kind:'B'}},
extension:           {b:'10',feat:{kind:'B'}},
size:                {b:'11',feat:sizeImageFeat},
width:               {b:'11',feat:{kind:'S11',min:[0, 3, 10, 30, 100, 300, 1000, 3000]}},
height:              {b:'11',feat:{kind:'S11',min:[0, 3, 10, 30, 100, 300, 1000, 3000]}},
tCreated:            {b:'10',feat:tFeat},
tMod:                {b:'11',feat:tFeat},
tLastAccess:         {b:'10',feat:tFeat},
nAccess:             {b:'10',feat:nAccessFeat},
boOther:             {b:'01',feat:{kind:'BN',span:1}},
nParent:             {b:'10',feat:nParentFeat}
};
StrOrderFiltImage=Object.keys(PropImage);

extend(PropImage,{
imageName:           {b:'00'},
idImage:             {b:'00'},
idFile:              {b:'00'}
});

  // cond0F
tmpCond0F=function(name, val){  return "UNIX_TIMESTAMP("+name+")<=UNIX_TIMESTAMP(now())-"+val; };
PropImage.tCreated.cond0F=PropImage.tMod.cond0F=PropImage.tLastAccess.cond0F=tmpCond0F;
  // cond1F
tmpCond1F=function(name, val){  return "UNIX_TIMESTAMP("+name+")>UNIX_TIMESTAMP(now())-"+val; };
PropImage.tCreated.cond1F=PropImage.tMod.cond1F=PropImage.tLastAccess.cond1F=tmpCond1F;
  // condBNameF
PropImage.siteName.condBNameF=function(name, Val){ return "idSite";} // Becomes pre+".idSite"
PropImage.parent.condBNameF=function(name, Val){ return "idPage";}  // Becomes pre+".idPage"
  // boIncludeNull
PropImage.siteName.boIncludeNull=1;
PropImage.parent.boIncludeNull=1;

  // pre
PropImage.siteName.pre=PropImage.parent.pre='s.';
var tmpPre = 'i.',  StrTmp=['extension', 'size', 'width', 'height', 'tCreated', 'tMod', 'tLastAccess', 'nAccess', 'boOther', 'nParent'];
for(var i=0;i<StrTmp.length;i++){  var name=StrTmp[i]; PropImage[name].pre=tmpPre; }

  // relaxCountExp
PropImage.siteName.relaxCountExp=function(name){ return "COUNT(DISTINCT i.idImage)"; }
PropImage.parent.relaxCountExp=function(name){ return "COUNT(DISTINCT i.idImage)"; }
PropImage.extension.relaxCountExp=function(name){ return "COUNT(DISTINCT i.idImage)"; } 
PropImage.boOther.relaxCountExp=function(name){ return null; }  

  // histF
PropImage.siteName.histF=function(name, strTableRef,strCond,strOrder){
  return `SELECT s.idSite AS bin, COUNT(DISTINCT i.idImage) AS groupCount FROM 
`+imageTab+` i LEFT JOIN `+subImageTab+` s ON s.imageName=i.imageName 
`+strCond+`
GROUP BY bin ORDER BY `+strOrder+`;`;
}
PropImage.parent.histF=function(name, strTableRef,strCond,strOrder){
  return `SELECT s.idPage AS bin, COUNT(DISTINCT i.idImage) AS groupCount FROM 
`+imageTab+` i LEFT JOIN `+subImageTab+` s ON s.imageName=i.imageName 
`+strCond+`
GROUP BY bin ORDER BY `+strOrder+`;`;
}

  // binValueF
var tmpF=function(name){ return "COUNT(DISTINCT i.idImage)";}
var StrTmp=['extension', 'size', 'width', 'height', 'tCreated', 'tMod', 'tLastAccess', 'nAccess', 'boOther', 'nParent'];
for(var i=0;i<StrTmp.length;i++){  var name=StrTmp[i]; PropImage[name].binValueF=tmpF; }

  // histCondF
var tmpHistCondF=function(name){ return "-UNIX_TIMESTAMP(i."+name+")+UNIX_TIMESTAMP(now())";};
PropImage.tCreated.histCondF=PropImage.tMod.histCondF=PropImage.tLastAccess.histCondF=tmpHistCondF;


/*******************************************************************
 * featCalcValExtend
 *******************************************************************/

featCalcValExtend=function(Prop){
  for(var name in Prop){
    var prop=Prop[name];
    if(!('feat' in prop)) continue;
    var feat=prop.feat, boBucket='bucket' in feat, boMin='min' in feat;
    if(boBucket||boMin){  // set n (=length) (if applicable)
      var len=boBucket?feat.bucket.length:feat.min.length;
      Prop[name].feat.n=len;  Prop[name].feat.last=len-1;
    }
  
    if(feat.kind[0]=='S'){
      var jlast=feat.last;    
      if(!('max' in feat)){
            // Create feat.max;  maxClosed
        feat.max=[]; var maxClosed=[];
        for(var j=0;j<jlast;j++){ 
          var tmp=feat.min[j+1]; feat.max[j]=tmp; maxClosed[j]=tmp-1;
        }
        feat.max[jlast]=intMax; maxClosed[jlast]=intMax;
      }

      if(!('bucketLabel' in feat)){ // (labels in histogram)
        feat.bucketLabel=[].concat(feat.min);
        feat.bucketLabel[jlast]='≥'+feat.bucketLabel[jlast];
      }

      Prop[name].feat=feat;
    }
  }
}



KeyColPage=Object.keys(PropPage);   nColPage=KeyColPage.length;   KeyColPageFlip=array_flip(KeyColPage);
KeyColImage=Object.keys(PropImage);   nColImage=KeyColImage.length;   KeyColImageFlip=array_flip(KeyColImage);


featCalcValExtend(PropPage);
featCalcValExtend(PropImage);


nHash=1000;
//aRPassword=SHA1(aRPassword+strSalt);
//aWPassword=SHA1(aWPassword+strSalt);
var data=aRPassword+strSalt; for(var i=0;i<nHash;i++) data=SHA1(data); aRPassword=data;
var data=aWPassword+strSalt; for(var i=0;i<nHash;i++) data=SHA1(data); aWPassword=data;

//aRPassword=Sha256.hash(aRPassword+strSalt);
//aWPassword=Sha256.hash(aWPassword+strSalt);
//var data=aRPassword+strSalt; for(var i=0;i<nHash;i++) data=Sha256.hash(data); aRPassword=data;
//var data=aWPassword+strSalt; for(var i=0;i<nHash;i++) data=Sha256.hash(data); aWPassword=data;


objOthersActivity=null; boPageBUNeeded=null; boImageBUNeeded=null;
objOthersActivityDefault={nEdit:0, pageName:'',  nImage:0, imageName:''};
// tLastBackup=0; tLastEdit=0; tImageLastBackup=0; tImageLastChange=0;


sqlTmpSubNewCreate="CREATE TEMPORARY TABLE tmpSubNew (pageName varchar(128) NOT NULL,  boOn TINYINT(1) NOT NULL)";  //,  UNIQUE KEY (pageName)
sqlTmpSubNewImageCreate="CREATE TEMPORARY TABLE tmpSubNewImage (imageName varchar(128) NOT NULL)";  //,  UNIQUE KEY (imageName)


strDBPrefix='mmmWiki';
//StrTableKey=["sub", "subImage", "version", "page", "thumb", "image", "video", "file", "setting", "redirect", "redirectDomain", "site"]; //, "nParent", "nParentI"
//StrViewsKey=["pageSite", "pageLast", "pageLastSite", "redirectSite", "parentInfo", "parentImInfo", "childInfo", "childImInfo", "subWChildID", "subWExtra"]; 
//TableName={};for(var i=0;i<StrTableKey.length;i++) {var name=StrTableKey[i]; TableName[StrTableKey[i]+"Tab"]=strDBPrefix+'_'+name;}
//ViewName={};for(var i=0;i<StrViewsKey.length;i++) {var name=StrViewsKey[i]; ViewName[StrViewsKey[i]+"View"]=strDBPrefix+'_'+name;}


StrTableKey=["subTab", "subImageTab", "versionTab", "pageTab", "thumbTab", "imageTab", "videoTab", "fileTab", "settingTab", "redirectTab", "redirectDomainTab", "siteTab"];
StrViewsKey=["pageSiteView", "pageLastView", "pageLastSiteView", "redirectSiteView", "parentInfoView", "parentImInfoView", "childInfoView", "childImInfoView", "subWChildIDView", "subWExtraView"]; 
TableName={};for(var i=0;i<StrTableKey.length;i++) {var name=StrTableKey[i]; TableName[name]=strDBPrefix+'_'+name.slice(0,-3);}
ViewName={};for(var i=0;i<StrViewsKey.length;i++) {var name=StrViewsKey[i]; ViewName[name]=strDBPrefix+'_'+name.slice(0,-4);}

extract(TableName);
extract(ViewName);


//CREATE TEMPORARY TABLE IF NOT EXISTS pageRef AS SELECT p.*, s.idPage AS idParent FROM mmmWiki_pageLastSite p LEFT JOIN mmmWiki_sub s  ON s.idSite=p.idSite AND s.pageName=p.pageName;


strTableRefPage=pageSiteView+" p \n\
LEFT JOIN "+subTab+" s ON s.idSite=p.idSite AND s.pageName=p.pageName \n\
LEFT JOIN "+pageTab+" pp ON pp.idPage=s.idPage";
// Starting with the list of pages
// The 1:st join: adds idPage of parent (The table is expanded if there are multiple parents)
// The 2:nd join: adds pageName of parent(s)

strTableRefImage=imageTab+" i \n\
LEFT JOIN "+subImageTab+" s ON s.imageName=i.imageName \n\
LEFT JOIN "+pageTab+" pp ON pp.idPage=s.idPage";

strTableRefPageHist=pageSiteView+" p LEFT JOIN "+subTab+" s  ON s.idSite=p.idSite AND s.pageName=p.pageName";  // Should be used with a COUNT(DISTINCT p.idPage)  
strTableRefImageHist=imageTab+" i LEFT JOIN "+subImageTab+" s ON s.imageName=i.imageName";  // Should be used with COUNT(DISTINCT i.idImage) 



nDBConnectionLimit=10; nDBQueueLimit=100;
nDBRetry=14;

setUpMysqlPool=function(){
  var uriObj=url.parse(uriDB); 
  var StrMatch=RegExp('^(.*):(.*)$').exec(uriObj.auth);
  var nameDB=uriObj.pathname.substr(1);
  var mysqlPool  = mysql.createPool({
    connectionLimit : nDBConnectionLimit,
    host            : uriObj.host,
    user            : StrMatch[1],
    password        : StrMatch[2],
    database        : nameDB,
    multipleStatements: true,
    waitForConnections:true,
    queueLimit:nDBQueueLimit,
    flags:'-FOUND_ROWS'
  });
  mysqlPool.on('error',function(e){debugger});
  return mysqlPool;
}

TLSDataExtend=function(){
  this.getContext=function(domainName){
    for(var i=0;i<this.length;i++){
      if(this[i].testDomain(domainName)) return this[i].context;
    }
    return undefined;
    //return false;
  }
  
  for(var i=0;i<this.length;i++){
    var item=this[i];
    if('domainReg' in item) {  item.regexp=RegExp(item.domainReg);       item.testDomain=function(domain){ return this.regexp.test(domain);};    } 
    else item.testDomain=function(domain){ return this.domain===domain;};
    //item.context=crypto.createCredentials({        key:  item.strKey,        cert: item.strCert      }).context;
    item.context=tls.createSecureContext({        key:  item.strKey,        cert: item.strCert      });//.context;
  }
}
