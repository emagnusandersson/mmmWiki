

app.two31=Math.pow(2,31);  app.intMax=two31-1;  app.intMin=-two31; app.uintMax=Math.pow(2,32)-1;
app.sPerDay=24*3600;  app.sPerMonth=sPerDay*30;

var fsWebRootFolder=process.cwd();
var flLibFolder='lib';

app.flFoundOnTheInternetFolder=flLibFolder+"/foundOnTheInternet";
app.flLibImageFolder=flLibFolder+"/image";  

  // Files: 
app.leafBE='be.json';
app.leafCommon='common.js';
app.leafManifest='manifest.json'




app.messPreventBecauseOfNewerVersions="Preventing overwrite since there are newer versions. Copy your edits temporary, then reload page.";

app.version='100';
app.maxGroupsInFeat=20;



       //     0       1
app.bName=['block','help'];
app.bFlip=array_flip(bName);

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

app.PropPage={
  siteName:            {b:'10',feat:{kind:'B'}},
  parent:              {b:'11',feat:{kind:'B'}},
  //child:               {b:'11',feat:{kind:'B'}},
  //image:               {b:'11',feat:{kind:'B'}},
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
  strLang:             {b:'10',feat:{kind:'B'}},
  tLastAccess:         {b:'10',feat:tFeat},
  nAccess:             {b:'10',feat:nAccessFeat},
  nParent:             {b:'10',feat:nParentFeat},
  lastRev:             {b:'10',feat:lastRevFeat}
};
app.StrOrderFiltPage=Object.keys(PropPage);

extend(PropPage,{
pageName:            {b:'00'},
idPage:              {b:'00'},
idFileWiki:          {b:'00'},
www:                 {b:'00'}});

// "IdParent", "IdChild", "StrImage", "IdChildLax", "StrImageStub", "StrPagePrivate"


  // Note! all methods use column-name as the name-parameter (ex: name="tMod") except cond0F and cond1F that uses table-alias (pre) + column-name as the name-parameter (ex: name="p.tMod").
  // It would probably be best that the table-alias and column-name comes in two separate parameters.


  // Methods for creating filter...
  // ... for some S-features

  // cond0F
var tmpCond0F=function(obj, name, val){  obj.$lte=new Date(Date.now() - val*1000); }; // Is this correct shouldn't it be: tmpCond0F=function(obj, name, val){  obj.$lte=new Date(Date.now() - val); };
//tmpCond0F=function(obj, name, val){  var t=unixNow()-val; obj.$lte=t; };
PropPage.tCreated.cond0F=PropPage.tMod.cond0F=PropPage.tModCache.cond0F=PropPage.tLastAccess.cond0F=tmpCond0F;
  // cond1F
var tmpCond1F=function(obj, name, val){  obj.$gt=new Date(Date.now() - val*1000); }; // Is this correct shouldn't it be: tmpCond1F=function(obj, name, val){  var t=unixNow()-val; obj.$gt=t; };
PropPage.tCreated.cond1F=PropPage.tMod.cond1F=PropPage.tModCache.cond1F=PropPage.tLastAccess.cond1F=tmpCond1F;

  // ...for some B-features

  // condBNameF
PropPage.siteName.condBNameF=function(){ return "idSite"; }
PropPage.parent.condBNameF=function(){ return "IdParent"; }

PropPage.siteName.histBNameF=function(){ return "idSite"; }
//PropPage.child.condBNameF=function(){ return "IdChild"; }
//PropPage.image.condBNameF=function(){ return "StrImage"; }
  // condBNullF

var condBNullFProt=function(name,boWhite){ var method=boWhite?"$eq":"$ne", o={}, oWrap={}; o[method]=[]; oWrap[name]=o; return oWrap;  }
//var condBNullFProt=function(name,boWhite){ if(boWhite) return {"IdParent":{"$eq":[]}}; else return {"IdParent":{"$ne":[]}}; }
PropPage.parent.condBNullF=condBNullFProt;
//PropPage.child.condBNullF=condBNullFProt;
//PropPage.image.condBNullF=condBNullFProt;


  // Methods for creating histograms...
  
  // ...for some B-features

  // histQueryF
PropPage.parent.histQueryF=function(Where){  return [   
  {$match: Where },
  {$project: { _id: 0, IdParent:1 } },   
  {$unwind:  { path: "$IdParent", "preserveNullAndEmptyArrays":true} },   
  {$group: { _id:"$IdParent", n: { $sum: 1 } }}, 
  {$sort: { n: -1, _id:1 } } 
]}

// PropPage.child.histQueryF=function(Where){  return [   
//   {$match: Where },
//   {$project: { _id: 0, IdChild:1 } },   
//   {$unwind:  { path: "$IdChild", "preserveNullAndEmptyArrays":true} },   
//   {$group: { _id:"$IdChild", n: { $sum: 1 } }}, 
//   {$sort: { n: -1, _id:1 } } 
// ]}

// PropPage.image.histQueryF=function(Where){  return [   
//   {$match: Where },
//   {$project: { _id: 0, StrImage:1 } },   
//   {$unwind:  { path: "$StrImage", "preserveNullAndEmptyArrays":true} },   
//   {$group: { _id:"$StrImage", n: { $sum: 1 } }}, 
//   {$sort: { n: -1, _id:1 } } 
// ]}



  // ...for some S-features

  // histGroupByF
//var tmpGroupByF=function(name){ return { $subtract: [ 	new Date(), "$"+name ] }; }
//var tmpGroupByF=function(name){ return {$divide:[{$subtract:[new Date(),'$'+name]},1000]}; }
var tmpGroupByF=function(name){ return {$divide:[   { $toLong:{$subtract: ["$$NOW",'$'+name ]} },     1000   ]}; }
//var tmpGroupByF=function(name){ return { $subtract: [ 	unixNow(), "$"+name ] }; }
PropPage.tCreated.histGroupByF=PropPage.tMod.histGroupByF=PropPage.tModCache.histGroupByF=PropPage.tLastAccess.histGroupByF=tmpGroupByF;



/*******************************************************************
 * PropImage
 *******************************************************************/

app.PropImage={
siteName:            {b:'11',feat:{kind:'B'}},
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
app.StrOrderFiltImage=Object.keys(PropImage);

extend(PropImage,{
imageName:           {b:'00'},
idImage:             {b:'00'},
idFile:              {b:'00'}
});



  // cond0F
var tmpCond0F=function(obj, name, val){  obj.$lte=new Date(Date.now() - val*1000); };
PropImage.tCreated.cond0F=PropImage.tMod.cond0F=PropImage.tLastAccess.cond0F=tmpCond0F;
  // cond1F
var tmpCond1F=function(obj, name, val){   obj.$gt=new Date(Date.now() - val*1000); };
PropImage.tCreated.cond1F=PropImage.tMod.cond1F=PropImage.tLastAccess.cond1F=tmpCond1F;


  // condBNameF
PropImage.parent.condBNameF=function(){ return "IdParent"; }
  // condBF
  // {$or:[{IdParent:{"$eq":[]}}, {IdParent:{"$in":["start"]}}]}
  // {$and:[{IdParent:{"$ne":[]}}, {IdParent:{"$nin":["start"]}}]}

  // {$or:[{IdParent:{"$eq":[]}}, {IdParent:{"$regex":"(mag|gav)"}}]}
  // {$and:[{IdParent:{"$ne":[]}}, {IdParent:{$not:{"$regex":"(mag|gav)"}}}]}
//PropImage.siteName.condBF=function(name, boWhite, arrSpec){ var method=boWhite?"$eq":"$ne", o={}, oW={}; o[method]=[], oW[name]=o; return oW;  }
PropImage.siteName.condBF=function(name, boWhite, arrSpec){ 
  var ind=arrSpec.indexOf(null), Cond=[], objCondFeat=null;
  if(ind!=-1) {  mySplice1(arrSpec,ind); Cond.push(condBNullFProt("IdParent",boWhite));   }
  var len=arrSpec.length, arrSpecEscaped=Array(len);
  for(var j=0;j<len;j++){    arrSpecEscaped[j]=mongoSanitize(arrSpec[j]);  }

  if(len) {
    var str=arrSpecEscaped.join("|");
    var objReg={$regex:str};
    var objTmp=boWhite?objReg:{$not:objReg};
    Cond.push({IdParent:objTmp});
  }
  if(Cond.length){
    if(Cond.length==1) objCondFeat=Cond[0];
    else if(Cond.length>1){
      var strMethod=boWhite?'$or':'$and';
      var objTmp={}; objTmp[strMethod]=Cond; objCondFeat=objTmp;
    } 
  }
  return objCondFeat;
}

// condBNullF
//PropImage.parent.condBNullF=function(name,boWhite){ if(boWhite) return {"IdParent":{"$eq":[]}}; else return {"IdParent":{"$ne":[]}}; }
PropImage.parent.condBNullF=condBNullFProt;

  // condBNameF
//PropImage.siteName.condBNameF=function(name, Val){ return "idSite";}
//PropImage.parent.condBNameF=function(name, Val){ return "idPage";}



  // histQueryF
PropImage.parent.histQueryF=function(Where){  return [   
  {$match: Where },
  {$project: { _id: 0, IdParent:1 } },   
  {$unwind:  { path: "$IdParent", "preserveNullAndEmptyArrays":true} },   
  {$group: { _id:"$IdParent", n: { $sum: 1 } }}, 
  {$sort: { n: -1, _id:1 } } 
]}


  // histF
  //{$or:[{"$in":["$$idParent", ["clo:start"]]}, {"$eq":["$$idParent", []]}]}
  //{$and:[{$not:[{"$in":["$$idParent", ["clo:start"]]}]}, {"$ne":["$$idParent", []]}]}
var condBAggregateF=function(arrSpec,boWhite){ 
  var ind=arrSpec.indexOf(null), Cond=[], objCondFeat={};
  if(ind!=-1) {  
    mySplice1(arrSpec,ind);   var oTmp={};   oTmp[boWhite?"$eq":"$ne"]=['$$idParent',[]];   Cond.push(oTmp);
  }
  var len=arrSpec.length, arrSpecEscaped=Array(len);
  for(var j=0;j<len;j++){    arrSpecEscaped[j]=mongoSanitize(arrSpec[j]);  }

  if(len) {
    var objIn={$in:['$$idParent',arrSpecEscaped]};
    var objTmp=boWhite?objIn:{$not:[objIn]};    Cond.push(objTmp);
  }
  if(Cond.length){
    if(Cond.length==1) objCondFeat=Cond[0];
    else if(Cond.length>1){
      var strMethod=boWhite?'$or':'$and';
      var objTmp={}; objTmp[strMethod]=Cond; objCondFeat=objTmp;
    } 
  }
  return objCondFeat;
}

PropImage.siteName.histF=async function(collection,Where,Filt){
  var filt=Filt.parent; //StrOrderFiltImageFlip
  if(filt.length==0) return [new Error('filt.length==0')];
  if(!is_array(filt[0])) return [new Error('filt[0] is not an array.')];
  var [arrSpec, boWhite]=filt;

  var WhereFilt=condBAggregateF(arrSpec, boWhite)
  
  var strProjectVar=collection===collectionPage?"pageName":"$IdParent";
    //{$or:[{"IdParent":{$in:["clo:start"]}}, {IdParent:{"$eq":[]}}]}
    //{$and:[{"IdParent":{$nin:["clo:start"]}}, {IdParent:{"$ne":[]}}]}

    //{$or:[{"$in":["$$idParent", ["clo:start"]]}, {"$eq":["$$idParent", []]}]}
    //{$and:[{$not:[{"$in":["$$idParent", ["clo:start"]]}]}, {"$ne":["$$idParent", []]}]}
  var arrArg=[ 
    {"$match":Where},
    {"$project":{"_id":0,pageName:1,"IdParent":{$filter: {
          input: '$IdParent', as: 'idParent', cond: WhereFilt
      }}
      }},
    {"$unwind":{"path":"$IdParent","preserveNullAndEmptyArrays":true}},
    {"$project":{"returnObject":{"$regexFind":{"input":"$IdParent","regex":/^(.*?):/}}}},
    {"$group":{"_id":{"$first":"$returnObject.captures"},"n":{"$sum":1}}},
    {"$sort":{"n":-1,"_id":1}}
  ];


  var cursor=collection.aggregate(arrArg);
  var [err, results]=await cursor.toArray().toNBP();   if(err) return [err];

  var nAll=0; for(var i=0;i<nRes;i++){   nAll+=results[i].n; }

  var nRes=results.length,   boTruncate=nRes>maxGroupsInFeat,  nBinDisp=boTruncate?maxGroupsInFeat:nRes,  nDisp=0;
  var hist=Array(nBinDisp+1+boTruncate); 
  for(var i=0;i<nBinDisp;i++){ 
    var {_id:bin, n}=results[i];
    nDisp+=n;   hist[i]=[bin, n];
  }

  if(boTruncate){ var nTrunk=nAll-nDisp;  hist[nBinDisp]=['', nTrunk]; } 
  hist[nBinDisp+boTruncate]=boTruncate;  // The last item marks if the second-last-item is a trunk (remainder)
  return [null, hist];
};



  // histGroupByF
var tmpGroupByF=function(name){ return {$divide:[{$subtract:[new Date(),'$tCreated']},1000]}; }
PropImage.tCreated.histGroupByF=PropImage.tMod.histGroupByF=PropImage.tLastAccess.histGroupByF=tmpGroupByF;


/*******************************************************************
 * featCalcValExtend
 *******************************************************************/

var featCalcValExtend=function(Prop){
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

      feat.boundaries=feat.min.concat(feat.max[jlast]);
      feat.boundariesIndFlip=array_flip(feat.min);

      Prop[name].feat=feat;
    }
  }
}



app.StrOrderFiltPageFlip=array_flip(StrOrderFiltPage);
app.StrOrderFiltImageFlip=array_flip(StrOrderFiltImage);


featCalcValExtend(PropPage);
featCalcValExtend(PropImage);


app.nHash=1000;
app.lenGZ=100;

//aRPassword=SHA1(aRPassword+strSalt);
//aWPassword=SHA1(aWPassword+strSalt);
var data=aRPassword+strSalt; for(var i=0;i<nHash;i++) data=SHA1(data); aRPassword=data;
var data=aWPassword+strSalt; for(var i=0;i<nHash;i++) data=SHA1(data); aWPassword=data;

//aRPassword=Sha256.hash(aRPassword+strSalt);
//aWPassword=Sha256.hash(aWPassword+strSalt);
//var data=aRPassword+strSalt; for(var i=0;i<nHash;i++) data=Sha256.hash(data); aRPassword=data;
//var data=aWPassword+strSalt; for(var i=0;i<nHash;i++) data=Sha256.hash(data); aWPassword=data;


app.objOthersActivity=null; app.boPageBUNeeded=null; app.boImageBUNeeded=null;
app.objOthersActivityDefault={nEdit:0, pageName:'',  nImage:0, imageName:''};
// tLastBackup=0; tLastEdit=0; tImageLastBackup=0; tImageLastChange=0;

//strDBPrefix='mmmWiki';







// app.createDefaultDocumentAll=function(){
//   for(var key in app.InitCollection){
//     var objInitCollection=app.InitCollection[key];
//     objInitCollection.objDefault=app.createDefaultDocument(objInitCollection)
//   }
//   return
// }
//   // How to use: var objDefault=createDefaultDocument(app.InitCollection[nameCollection]);
// app.createDefaultDocument=function(objInitCollection){
//   var date0=new Date(0), id0=ObjectId("123456789012345678901234"); //, int0=mongodb.Int32(0), long0=mongodb.Long(0);
//   var {validator, ArrUnique, objDefault}=objInitCollection;
//   var {$jsonSchema}=validator, {required, properties}=$jsonSchema, OOut={};
//   for(var strProp of required){
//     var prop=properties[strProp];  if(typeof prop=="undefined") {prop={bsonType:"bool"};}
//     var {bsonType, defaultVal}=prop;
//     bsonType=bsonType.toLowerCase();
//     if(defaultVal) {val=defaultVal; delete prop.defaultVal;}
//     else if(bsonType=="bool") val=false;
//     else if(bsonType=="string") val="";
//     else if(bsonType=="date") val=date0;
//     else if(bsonType=="objectid") val=id0;
//     else if(bsonType=="array") val=[];
//     else if(bsonType=="object") val={};
//     else if(bsonType=="float") val=0;
//     else if(bsonType=="double") val=mongodb.Double(0);
//     else if(bsonType=="int") val=mongodb.Int32(0);
//     else if(bsonType=="long") val=mongodb.Long(0);
//     else if(bsonType=="bindata") val="";
//     else val="";
//     OOut[strProp]=val;
//   }
//   return OOut;
// }

// app.convertToMongoObj=function(obj, strCollection){
//   var objInitCollection=app.InitCollection[strCollection];
//   var {validator, ArrUnique}=objInitCollection;
//   var {$jsonSchema}=validator, {properties}=$jsonSchema, OOut={};
//   var Key=Object.keys(properties);
//   //var date0=new Date(0), id0=ObjectId("123456789012345678901234"), int0=mongodb.Int32(0), long0=mongodb.Long(0);
//   for(var strProp of Key){
//     var prop=properties[strProp];  if(typeof prop=="undefined") {prop={bsonType:"bool"};}
//     var {bsonType}=prop;    bsonType=bsonType.toLowerCase();
//     var val=obj[strProp];
    
//     if(bsonType=="bool" && typeof val!="boolean") {obj[strProp]=Boolean(val); continue; }
//     //else if(bsonType=="string");
//     //else if(bsonType=="date") ;
//     //else if(bsonType=="objectid") ;
//     //else if(bsonType=="array") ;
//     else if(bsonType=="int" && !(val instanceof Int32)) {obj[strProp]=Int32(val); continue; }
//     else if(bsonType=="long" && !(val instanceof Long)) {obj[strProp]=Long(val); continue; } 
//     //else if(bsonType=="bindata");
//     //else val="";
    
//   }
//   return OOut;
// }


  //How to use: var objPageTmp=copyObjWMongoTypes(objPage); convertToMongoObj(objPageTmp, "Page");
app.copyObjWMongoTypes=function(o){ // Also copies Date
  if (o===undefined || o===null || ['string', 'number', 'boolean'].indexOf(typeof o)!==-1) return o;
  if(o instanceof Date) return new Date(o.getTime());
  if(o instanceof ObjectId) return ObjectId.createFromHexString(o.toHexString());
  if(o instanceof Int32) return Int32(o);
  if(o instanceof Long) return Long(o);
  var n= o instanceof Array? [] :{};
  for (var k in o)
    n[k]= copyObjWMongoTypes(o[k]);
  return n;
}

// How to use: obj=copyNCastMongoObj(obj, app.InitCollection[strCollection].validator.$jsonSchema);
app.copyNCastMongoObj=function(obj, objInit){
  if(typeof objInit=="undefined") return copyObjWMongoTypes(obj);

  var {bsonType, items, properties}=objInit;    bsonType=bsonType.toLowerCase();
  if(bsonType=="bool") { return (typeof obj=="boolean")?obj:Boolean(obj);}
  if(bsonType=="string") {return (typeof obj=="string")?obj:String(obj);}
  if(bsonType=="date") {return (obj instanceof Date)? (new Date(obj.getTime())) : (new Date(obj));}
  if(bsonType=="objectid") {var str= (obj instanceof ObjectId)? (obj.toHexString()):obj; return ObjectId.createFromHexString(str);}
  if(bsonType=="int") { return Int32(obj); }
  if(bsonType=="long") { return Long(obj); }

  if(bsonType=="array") { 
    if(typeof items=="undefined") { return copyObjWMongoTypes(obj);}
    var n=[];   for (var k in obj) n[k]= copyNCastMongoObj(obj[k], items);   return n;
  }
  if(bsonType=="object") { 
    if(typeof properties=="undefined") { return copyObjWMongoTypes(obj);}
    var n={};   for (var k in obj) n[k]= copyNCastMongoObj(obj[k], properties[k]);   return n;
  }
  //if(bsonType=="bindata") return obj;
  //return obj;
}

// How to use: obj=copyNCastMongoObj(obj, app.InitCollection[strCollection].validator.$jsonSchema);
app.copyNCastMongoObj=function(obj, objInit){
  var boGotInit=typeof objInit!="undefined";
  if(boGotInit) { var {bsonType, items, properties}=objInit;    bsonType=bsonType.toLowerCase(); } 
  else {
    var bsonType=typeof obj;
    if(bsonType=="boolean") bsonType="bool";
    else if(bsonType=="number") bsonType="int";
    else if(bsonType=="object") {
      if(obj instanceof Date) bsonType="date";
      else if(obj instanceof ObjectId) bsonType="objectid";
      else if(obj instanceof Int32) bsonType="int";
      else if(obj instanceof Long) bsonType="long";
      else if(obj instanceof Array) bsonType="array";
    }
  }
  if(bsonType=="bool") { return (typeof obj=="boolean")?obj:Boolean(obj);}
  if(bsonType=="string") {return (typeof obj=="string")?obj:String(obj);}
  if(bsonType=="date") {return (obj instanceof Date)? (new Date(obj.getTime())) : (new Date(obj));}
  if(bsonType=="objectid") {var str= (obj instanceof ObjectId)? (obj.toHexString()):obj; return ObjectId.createFromHexString(str);}
  if(bsonType=="int") { return Int32(obj); }
  if(bsonType=="long") { return Long(obj); }

  if(bsonType=="array") { 
    //if(typeof items=="undefined") { return copyObjWMongoTypes(obj);}
    var n=[];   for(var k in obj) n[k]= copyNCastMongoObj(obj[k], boGotInit?items:undefined);   return n;
  }
  if(bsonType=="object") { 
    //if(typeof properties=="undefined") { return copyObjWMongoTypes(obj);}
    var n={};   for(var k in obj) n[k]= copyNCastMongoObj(obj[k], boGotInit?properties[k]:undefined);   return n;
  }
  //if(bsonType=="bindata") return obj;
  //return obj;
}

