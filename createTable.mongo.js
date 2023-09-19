//cat mongo_InitCollection.js mongo_createTable.js | mongo

use mmmWiki;

var extend=Object.assign; 

// app.removeDefaultValAll=function(){
//   for(var key in app.InitCollection){
//     var objInitCollection=app.InitCollection[key];
//     objInitCollection.objDefault=app.removeDefaultVal(objInitCollection)
//   }
//   return
// }
//   // How to use: var objDefault=createDefaultDocument(app.InitCollection[nameCollection]);
// app.removeDefaultVal=function(objInitCollection){
//   var {validator, ArrIndex}=objInitCollection;
//   var {$jsonSchema}=validator, {required, properties}=$jsonSchema, OOut={};
//   for(var strProp of required){
//     var prop=properties[strProp]; if(typeof prop=="undefined") continue;
//     var {bsonType, defaultVal}=prop;
//     if(defaultVal) {delete prop.defaultVal;}
//   }
//   return OOut;
// }

// app.removeDefaultValAll();

var NameCollection=Object.keys(app.InitCollection);
for(var i=0;i<NameCollection.length;i++){
  var nameCollection=NameCollection[i],  {validator, ArrIndex}=app.InitCollection[nameCollection];
  db[nameCollection].drop();
  db.createCollection(nameCollection, {validator});
  if(typeof ArrIndex=="undefined") continue;
  for(var j=0;j<ArrIndex.length;j++){
    var arrIndex=ArrIndex[j];
    //const objUnique = Object.fromEntries( arrIndex.map(keyT => [keyT, 1]) );
    //const objUnique = {};  for (const str of arrIndex) { objUnique[str] = 1; }
    //db[nameCollection].createIndex(objUnique, {"unique":1});
    db[nameCollection].createIndex(arrIndex);
  }
}

//show collections;

  // Site insertions
var siteA={boDefault:false, boTLS:true, _id:"mag", www:"localhost:5000", googleAnalyticsTrackingID:"a", srcIcon16:"Site/Icon/iconRed16.png", strLangSite:"en", aWPassword:"a", aRPassword:"a", tCreated:new Date(0), boORDefault:false, boOWDefault:false, boSiteMapDefault:false}
var siteB=Object.assign({},siteA); extend(siteB, {_id:"gav", www:"192.168.0.7:5000", boDefault:true});
var siteC=Object.assign({},siteA); extend(siteC, {_id:"emag", www:"192.168.0.8:5000"});
db.Site.remove({});
db.Site.insertMany([siteA, siteB, siteC]);

var {_id:idSite}=db.Site.find({_id:"gav"},{_id:1}).next();

  // Setting insertions
var uintMax=Math.pow(2,32)-1;
var dateMax=new Date(8640000000000000);
var objSetting={ lastOthersEdit:'', nNewPages:0, lastOthersUpload:'', nNewImages:0, tModLast:dateMax, pageTModLast:'', tLastBU:new Date(0)};
var arrTmp=Object.entries(objSetting), len=arrTmp.length, arrSetting=Array(len);
for (var i=0;i<len;i++) { const [name, value] = arrTmp[i]; arrSetting[i]={name,value};}
db.Setting.remove({});
db.Setting.insertMany(arrSetting);



var idA=new ObjectId("123456789012345678901234");
var idB=new ObjectId("123456789012345678901235");
var idC=new ObjectId("123456789012345678901236");

// Tree
/*
 a
 |\
 b|
/|/
|c
\|
 d 
*/


var objRevision={idFileWiki:idA, idFileHtml:idB, summary:"abc", signature:"abc", size:0, tMod:new Date(), tModCache:new Date(), strHash:"abc", boOther:false}
var pageA={idSite, pageName:"a", boTalk:false, boTemplate:false, boOR:true, boOW:true, boSiteMap:false, tCreated:new Date(), tLastAccess:new Date(), nAccess:0, intPriority:0, strLang:"en", boOther:false, tMod:new Date(), tModCache:new Date(), size:0, IdParent:[], IdChild:["b","c"], StrImage:[], IdChildLax:[], StrImageStub:[], StrPagePrivate:[], arrRevision:[], IdTemplateAll:[], IdTemplate:[],  nRevision:1, lastRev:0, nParent:0, nChild:0, nImage:0, boTalkExist:false, bla:5}
var pageB=Object.assign({},pageA); extend(pageB, {pageName:"b", size:8, strLang:"no", IdParent:["a"], IdChild:["c", "d"]});
var pageC=Object.assign({},pageA); extend(pageC, {pageName:"c", size:14, IdParent:["b", "a"], IdChild:["d"]});
var pageD=Object.assign({},pageA); extend(pageD, {pageName:"d", size:16, strLang:"sv", IdParent:["c"], IdChild:[], IdChildLax:["a"], tCreate:new Date()});
db.Page.remove({});
db.Page.insertMany([pageA, pageB, pageC, pageD]);
//db.Page.find()


  // Add to tCreated
db.Page.updateMany(
  { pageName : { $in : ["a", "b"] } },
  [{ $set: { tCreated: { $add: ["$tCreated", 3600*1000] } } }]
)

  // Subtract to tCreated
db.Page.updateMany(
  { pageName : { $in : ["a", "b"] } },
  [{ $set: { tCreated: { $subtract: ["$tCreated", 3600*1000] } } }]
)

  // Create a histogram

  // grouping on strLang
db.Page.aggregate([  
  {$match: {$and: [{pageName:{$in:["a","b","c","d"]}},{size:{$gte:0}}]}},
  { $group: {  _id: "$strLang", n: {$sum : 1} } }
]);  


  // Bucketing on size
db.Page.aggregate( [
  {$match: {$and: [{pageName:{$in:["a","b","c","d"]}},{size:{$gte:0}}]}},
  {
    $bucket: {
      groupBy: "$size", 
      boundaries: [ 0, 10, 20, Infinity ],
      output: {  "n": { $sum: 1 } }
    }
  }
])

  // Bucketing on parent
db.Page.aggregate([
  {$match: { tCreated: { $gte: new Date(0) } } },
  {$project: { _id: 0, IdParent: 1 } },
  {$unwind: "$IdParent" },
  {$group: { _id: "$IdParent", n: { $sum: 1 } }},
  {$sort: { n: -1 } }
])


var boundaries=[-Infinity, 0, 3600, 2*3600, Infinity ];  boundaries=boundaries.map(it=>it*1000)

  // Bucketing on tCreated
db.Page.aggregate( [
  {$match: {$and: [{pageName:{$in:["a","b","c","d"]}},{size:{$gte:0}}]}},
  {
    $bucket: {
      groupBy: { $subtract: [ 	new Date(), "$tCreated" ] }  , 
      boundaries: boundaries,
      output: {  "n": { $sum: 1 } }
    }
  }
])


  // Converting Date to Long (in Find)
var {_id:idSite, tCreated}=db.Page.find({pageName:{$in:["a","b","d"]}, size:{$lte:14}},{_id:1, pageName:1, tCreated:{$toLong:"$tCreated"}}).next()
db.Page.find({$and:[{pageName:{$in:["a","b","d"]}}, {size:{$lte:14}}]},{_id:1, pageName:1, tCreated:{$toLong:"$tCreated"}})


  // Find Pages with strLang =="sv" OR strLang=="no"
db.Page.find({$or:[{strLang:"sv"},{strLang:"no"}]},{_id:1, pageName:1, tCreated:{$toLong:"$tCreated"}})

  // Find Pages with strLang =="sv" OR size=="14"
db.Page.find({$or:[{strLang:"sv"},{size:14}]},{_id:1, pageName:1, tCreated:{$toLong:"$tCreated"}})

  // Quering arrays

  // Find Pages with certain parent
db.Page.find({IdParent:{$eq:"a"}},{_id:1, pageName:1, tCreated:{$toLong:"$tCreated"}})


  // Find Pages with certain parents (mult)
db.Page.find({IdParent:{$in:["a", "c"]}},{_id:1, pageName:1, tCreated:{$toLong:"$tCreated"}})

  // Find Pages with no empty IdParent (orphan)
db.Page.find({IdParent:{$eq:[]}},{_id:1, pageName:1, tCreated:{$toLong:"$tCreated"}})

  // Find Pages with certain parents OR orphan
db.Page.find({$or:[{IdParent:{$eq:[]}}, {IdParent:{$eq:"a"}}]},{_id:1, pageName:1, tCreated:{$toLong:"$tCreated"}})
  // alt
db.Page.find({IdParent:{$in:[[], "c"]}},{_id:1, pageName:1, tCreated:{$toLong:"$tCreated"}})


db.Page.find({IdParent:{$nin:[[], "b"]}},{_id:1, pageName:1, tCreated:{$toLong:"$tCreated"}})


  // Find range
db.Page.find({size:{$gt:2, $lt:15}},{pageName:1,size:1})

  // Find by time
db.Page.find({tCreated:{$gt:new Date(0), $lt:new Date()}},{pageName:1,size:1})

db.Page.find({$and:[{size:{$gt:2, $lt:15}}, {tCreated:{$gt:new Date(0), $lt:new Date()}}]},{pageName:1,size:1})

db.Page.find({$and:[{size:{$gt:2, $lt:15}}, {tCreated:{$gt:new Date(0), $lt:new Date()}}, {IdParent:"a"}]},{pageName:1,size:1})






