

two31=Math.pow(2,31);  intMax=two31-1;  intMin=-two31;
sPerDay=24*3600;  sPerMonth=sPerDay*30;

fsWebRootFolder=process.cwd();
flLibFolder='lib';

flFoundOnTheInternetFolder=flLibFolder+"/foundOnTheInternet";
flLibImageFolder=flLibFolder+"/image";  

  // Files: 
leafBE='be.json';
//leafSiteSpecific='siteSpecific.js';
leafCommon='common.js';


StrImageExt=['jpg','jpeg','png','gif','svg'];


messPreventBecauseOfNewerVersions="Preventing overwrite since there are newer versions. Copy your edits temporary, then reload page.";

version='100';
maxGroupsInFeat=20;
nameNodeDefault="p";


    //    0        1
bName=['block','help'];    // block: block(or span in) vendorInfo
bFlip=array_flip(bName);

var tFeat={kind:'S11',min:[0, 0.25, 1, 3, 8, 24, 72, 168, 3*168, 8760/4, 8760, 3*8760], bucketLabel:['0', '¼h', '1h', '3h', '8h', '1d', '3d', '1w', '3w', '¼y', '1y', '3y']};
for(var i=0;i<tFeat.min.length;i++) tFeat.min[i]*=3600; // make hours to seconds

var sizePageFeat={kind:'S11',min:[0, 0.1, 0.3, 1, 3, 10, 30, 100], bucketLabel:['0', '100', '300', '1k', '3k', '10k', '30k', '100k']};
var sizeImageFeat={kind:'S11',min:[0, 0.1, 0.3, 1, 3, 10, 30, 100, 300, 1000, 3000], bucketLabel:['0', '100', '300', '1k', '3k', '10k', '30k', '100k', '300k', '1M', '3M']};
for(var i=0;i<sizePageFeat.min.length;i++) sizePageFeat.min[i]*=1000; // make kB to B
for(var i=0;i<sizeImageFeat.min.length;i++) sizeImageFeat.min[i]*=1000; // make kB to B

//var nAccessFeat={kind:'S11',min:[0, 10, 1e2, 1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9, 1e10], bucketLabel:['0', '10', '100', '1k', '10k', '100k', '1M', '10M', '100M', '1G', '10G']};
var nAccessFeat={kind:'S11',min:[0, 3, 10, 30, 1e2, 3e2, 1e3, 3e3, 1e4, 3e4, 1e5, 3e5, 1e6, 3e6]};  nAccessFeat.bucketLabel=numWithUnitPrefixArr(nAccessFeat.min);

var nChildFeat={kind:'S11',min:[0, 1, 2, 4, 8, 16, 32, 64, 128]};

//name:                {b:'00'}, lastRev:             {b:'00'}, idPage:              {b:'00'}, idFile:              {b:'00'},
 
                    //   01
PropPage={
parent:              {b:'11',feat:{kind:'B'}},
siteName:            {b:'10',feat:{kind:'B'}},
size:                {b:'11',feat:sizePageFeat},
boOR:                {b:'01',feat:{kind:'BN',span:1}},
boOW:                {b:'01',feat:{kind:'BN',span:1}},
boSiteMap:           {b:'01',feat:{kind:'BN',span:1}},
boTalk:              {b:'01',feat:{kind:'BN',span:1}},
boTemplate:          {b:'01',feat:{kind:'BN',span:1}},
boOther:             {b:'01',feat:{kind:'BN',span:1}},
nChild:              {b:'10',feat:nChildFeat},
nImage:              {b:'10',feat:nChildFeat},
tCreated:            {b:'10',feat:tFeat},
tMod:                {b:'11',feat:tFeat},
tModCache:           {b:'11',feat:tFeat},
tLastAccess:         {b:'10',feat:tFeat},
nAccess:             {b:'10',feat:nAccessFeat}
};
StrOrderFiltPage=Object.keys(PropPage);

extend(PropPage,{
pageName:            {b:'00'},
lastRev:             {b:'00'},
idPage:              {b:'00'},
idFile:              {b:'00'},
nParent:             {b:'00'},
nameParent:          {b:'00'},
www:                 {b:'00'}});

var StrTmp=['size','tMod','tModCache','boOther'];    for(var i=0;i<StrTmp.length;i++){ PropPage[StrTmp[i]].nameNode='r'; }
PropPage.parent.nameNode='pp';

PropPage.parent.condBNameF=function(nameNode, name, Val){ return "pp.idPage";} 
PropPage.siteName.condBNameF=function(nameNode, name, Val){ return "s.name";} 

//PropPage.tMod.cond0F=function(nameNode, name, val){  return "r.tMod<=timestamp()/1000-"+val; };
//PropPage.tModCache.cond0F=function(nameNode, name, val){  return "r.tModCache<=timestamp()/1000-"+val; };
var StrTmp=['tCreated','tMod','tLastAccess','tModCache']; 
for(var i=0;i<StrTmp.length;i++){ PropPage[StrTmp[i]].cond0F=function(nameNode, name, val){  return nameNode+'.'+name+"<=timestamp()/1000-"+val; }; }
for(var i=0;i<StrTmp.length;i++){ PropPage[StrTmp[i]].cond1F=function(nameNode, name, val){  return nameNode+'.'+name+">timestamp()/1000-"+val; }; }
//PropPage.size.cond0F=function(nameNode, name, val){ return "r.size>"+val;};

//PropPage.tMod.cond1F=function(nameNode, name, val){ return "r.tMod>timestamp()/1000-"+val;};
//PropPage.tModCache.cond1F=function(nameNode, name, val){ return "r.tModCache>timestamp()/1000-"+val;};
//PropPage.size.cond1F=function(nameNode, name, val){ return "r.size<="+val;};


PropPage.parent.boFeatWNull=1;
PropPage.parent.boCount=1;
PropPage.siteName.boCount=1;



PropImage={
parentSite:          {b:'11',feat:{kind:'B'}},
parent:              {b:'11',feat:{kind:'B'}},
extension:           {b:'10',feat:{kind:'B'}},
size:                {b:'11',feat:sizeImageFeat},
tCreated:            {b:'10',feat:tFeat},
tMod:                {b:'11',feat:tFeat},
tLastAccess:         {b:'10',feat:tFeat},
nAccess:             {b:'10',feat:nAccessFeat},
boOther:             {b:'01',feat:{kind:'BN',span:1}}
};
StrOrderFiltImage=Object.keys(PropImage);

extend(PropImage,{
imageName:           {b:'00'},
idImage:             {b:'00'},
idFile:              {b:'00'},
nParent:             {b:'00'},
nameParent:          {b:'00'}});

var StrTmp=['extension','size','tMod','boOther'];  StrTmp=StrOrderFiltImage;  for(var i=0;i<StrTmp.length;i++){ PropImage[StrTmp[i]].nameNode='i'; }
PropImage.parentSite.nameNode='s';
PropImage.parent.nameNode='p';

PropImage.parentSite.condBNameF=function(nameNode, name, Val){ return "s.name";} 
PropImage.parent.condBNameF=function(nameNode, name, Val){ return "p.idPage";}  

//PropImage.tMod.cond0F=function(nameNode, name, val){ return "i.tMod<=timestamp()/1000-"+val; };
//PropImage.tMod.cond1F=function(nameNode, name, val){ return "i.tMod>timestamp()/1000-"+val; };
//PropImage.size.cond0F=function(nameNode, name, val){ return "i.size>"+val;};
//PropImage.size.cond1F=function(nameNode, name, val){ return "i.size<="+val;};

var StrTmp=['tCreated','tMod','tLastAccess']; 
for(var i=0;i<StrTmp.length;i++){ PropImage[StrTmp[i]].cond0F=function(nameNode, name, val){  return nameNode+'.'+name+"<=timestamp()/1000-"+val; }; }
for(var i=0;i<StrTmp.length;i++){ PropImage[StrTmp[i]].cond1F=function(nameNode, name, val){  return nameNode+'.'+name+">timestamp()/1000-"+val; }; }

PropImage.parentSite.boFeatWNull=1;
PropImage.parent.boFeatWNull=1;
PropImage.parentSite.boCount=1;
PropImage.parent.boCount=1;
//PropImage.extension.boCount=1;  // Assuming the number of different extensions are less than maxGroupsInFeat, one can have PropImage.extension.boCount=0 (unassigned)

condBNameFDefault=function(nameNode, name,arrSpec){ return nameNode+'.`'+name+"`"; }  
cond0FDefault=function(nameNode, name, val){ return nameNode+'.'+name+">="+val; }
cond1FDefault=function(nameNode, name, val){ return nameNode+'.'+name+"<"+val }; 

featCalcValExtend=function(Prop){
  for(var name in Prop){
    var prop=Prop[name];
    if(!('feat' in prop)) continue;
    var feat=prop.feat, boBucket='bucket' in feat, boMin='min' in feat;
    if(boBucket||boMin){  // set n (=length) (if applicable)
      //var len;   if(boBucket) len=feat.bucket.length; else if(boMin) len=feat.min.length;
      var len=boBucket?feat.bucket.length:feat.min.length;
      Prop[name].feat.n=len;  Prop[name].feat.last=len-1;
    }
  
    if(feat.kind[0]=='S'){
            // Create feat.max;  maxClosed
      feat.max=[]; var maxClosed=[];
      var jlast=feat.last;    
      for(var j=0;j<jlast;j++){ 
        var tmp=feat.min[j+1]; feat.max[j]=tmp; maxClosed[j]=tmp-1;
      }
      feat.max[jlast]=intMax; maxClosed[jlast]=intMax;

            // Create minName/maxName (labels in 'sel0') and  feat.maxName (labels in 'sel1') 
      feat.minName=[].concat(feat.min);
      feat.maxName=[].concat(maxClosed);  feat.maxName[feat.last]="&infin;";

      if(!('bucketLabel' in feat)){   feat.bucketLabel=[].concat(feat.min);       feat.bucketLabel[feat.last]='&ge;'+feat.bucketLabel[feat.last]; } // (labels in histogram)

      Prop[name].feat=feat;
    }
  }
}

KeyColPage=Object.keys(PropPage);   nColPage=KeyColPage.length;   KeyColPageFlip=array_flip(KeyColPage);
KeyColImage=Object.keys(PropImage);   nColImage=KeyColImage.length;   KeyColImageFlip=array_flip(KeyColImage);


featCalcValExtend(PropPage);
featCalcValExtend(PropImage);


aPassword=SHA1(aPassword+strSalt);
vPassword=SHA1(vPassword+strSalt);

objOthersActivity=null; boPageBUNeeded=null; boImageBUNeeded=null;
objOthersActivityDefault={nEdit:0, pageName:'',  nImage:0, imageName:''};
// tLastBackup=0; tLastEdit=0; tImageLastBackup=0; tImageLastChange=0;


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
