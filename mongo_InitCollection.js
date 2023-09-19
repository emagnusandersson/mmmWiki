
if(typeof app=='undefined') app={};



// interface SiteSchema {
//   _id: ObjectId;
//   boDefault:boolean; boTLS:true; www:string; googleAnalyticsTrackingID:string; srcIcon16:string; strLangSite:string; aWPassword:string; aRPassword:string; tCreated:Date; boORDefault:boolean; boOWDefault:boolean; boSiteMapDefault:boolean
// }
// interface PageSchema {
//   _id: ObjectId;
//   idSite:number, pageName:string, boTalk:boolean, boTemplate:boolean, boOR:boolean, boOW:boolean, boSiteMap:boolean, tCreated:Date, tLastAccess:Date, nAccess:number, intPriority:number, strLang:string, IdParent:array<ObjectId>, IdChildLax:array<ObjectId>, IdChild:array<ObjectId>, StrImage:array<string>, StrImageStub:array<string>, StrPagePrivate:array<string>, arrRevision: array<number>, nRevision:number, lastRev:number, nParent:number, nChild:number, nImage:number, boTalkExist:boolean, idFileWiki:number, idFileHtml:number, boOther:boolean, tMod:Date, tModCache:Date, strHashParse:string, strHash:string, size:number 
// }
// interface FileWiki {
//   _id: ObjectId;
//   idPage:Number; data:
// }
// interface FileHtml {
//   _id: ObjectId;
//   data
// }
// interface FileImage {
//   _id: ObjectId;
//   data:;
// }
// interface FileThumb {
//   _id: ObjectId;
//   data:;
// }
// interface Image {
//   _id: ObjectId;
//   imageName:; idFile:; boOther:; tCreated:; strHash:; size:; widthSkipThumb:; width:; height:; extension:; tLastAccess:; nAccess:; tMod:; hash:; nParent:; IdParent
// }
// interface Thumb {
//   _id: ObjectId;
//   idImage:; idFile:; width:; height:; strHash:; size
// }
// interface Redirect {
//   _id: ObjectId;
//   idSite:; pageName:; url:; tCreated:; tLastAccess:; tMod:; nAccess
// }
// interface RedirectDomain {
//   _id: ObjectId;
//   www:; url:; tCreated
// }
// interface Setting {
//   _id: ObjectId;
//   name:; value
// }


app.InitCollection={
  // Test:{
  //   validator:{
  //     $jsonSchema:{
  //       bsonType:"object",
  //       required:["boA","strA","tA","intA","longA","doubleA"],
  //     }
  //   }
  // },
  // TestB:{
  //   validator:{
  //     $jsonSchema:{
  //       bsonType:"object",
  //       required:["strA"],
  //     }
  //   },
  //   ArrIndex:[[{strA:1}, {unique:1}]]
  // },
  Site:{
    objDefault:{ boDefault:false, boTLS:true, www:"", googleAnalyticsTrackingID:"", srcIcon16:"", strLangSite:"", aWPassword:"", aRPassword:"", tCreated:new Date(0), boORDefault:false, boOWDefault:false, boSiteMapDefault:false }, //, siteName:""
    validator:{
      $jsonSchema:{
        bsonType:"object",
        required:["boDefault", "boTLS", "www", "googleAnalyticsTrackingID", "srcIcon16", "strLangSite", "aWPassword", "aRPassword", "tCreated", "boORDefault", "boOWDefault", "boSiteMapDefault"], //, "siteName"
        properties:{
          boDefault:{ bsonType:"bool" },
          boTLS:{ bsonType:"bool" },
          tCreated:{ bsonType:"date" },
          boORDefault:{ bsonType:"bool" },
          boOWDefault:{ bsonType:"bool" },
          boSiteMapDefault:{ bsonType:"bool" },
        }
      }
    },
    //ArrIndex:[ [{www:1}, {unique:1}]]  //[{siteName:1}],
    ArrIndex:[ {name:'www', key:{www:1}, unique:1}]  //[{siteName:1}],
  },
  Page:{
    objDefault:{ idSite:0, pageName:"", boTalk:false, boTemplate:false, boOR:false, boOW:false, boSiteMap:false, tCreated:new Date(0), tLastAccess:new Date(0), nAccess:0, intPriority:0, strLang:"en", IdParent:[], IdChildLax:[], IdChild:[], StrImage:[], StrImageStub:[], StrPagePrivate:[], arrRevision: [], nRevision:0, lastRev:0, nParent:0, nChild:0, nImage:0, boTalkExist:false, idFileWiki:0, idFileHtml:0, boOther:false, tMod:new Date(0), tModCache:new Date(0), strHashParse:"", strHash:"", size:0 },
    validator:{
      $jsonSchema:{
        bsonType:"object",
        required:["idSite", "pageName", "boTalk", "boTemplate", "boOR", "boOW", "boSiteMap", "tCreated", "tLastAccess", "nAccess", "intPriority", "strLang", "IdParent", "IdChildLax", "IdChild", "StrImage", "StrImageStub", "StrPagePrivate", "arrRevision", "nRevision", "lastRev", "nParent", "nChild", "nImage", "boTalkExist", "idFileWiki", "idFileHtml", "boOther", "tMod", "tModCache", "strHashParse", "strHash", "size"], 
        properties:{
          //idSite:{  bsonType: "objectId"},
          tCreated:{ bsonType:"date" },
          tLastAccess:{ bsonType:"date" },
          tMod:{ bsonType:"date" },
          tModCache:{ bsonType:"date" },
          arrRevision: {
            bsonType: "array",
            items: {
                bsonType: "object",
                required:["summary", "signature", "idFileWiki", "idFileHtml", "boOther", "tMod", "tModCache", "strHashParse", "strHash", "size"],
                properties:{
                  tModCache:{ bsonType:"date" },
                  tMod:{ bsonType:"date" },
                }
            }
          }
        }
      }
    },
    //ArrIndex:[[{idSite:1, pageName:1}, {unique:1, collation: { locale:'en', strength:2 } }]]
    ArrIndex:[{name:'idSiteNpageName', key:{idSite:1, pageName:1}, unique:1, collation:{locale:'en', strength:2} }]
  },
  FileWiki:{
    validator:{
      $jsonSchema:{
        bsonType:"object",
        required:["idPage", "data"],
      }
    },
    ArrIndex:[]
  },
  FileHtml:{
    validator:{
      $jsonSchema:{
        bsonType:"object",
        required:["data"],
      }
    },
    ArrIndex:[]
  },
  FileImage:{
    validator:{
      $jsonSchema:{
        bsonType:"object",
        required:["data"],
      }
    },
    ArrIndex:[]
  },
  FileThumb:{
    validator:{
      $jsonSchema:{
        bsonType:"object",
        required:["data"],
      }
    },
    ArrIndex:[]
  },
  Image:{
    validator:{
      $jsonSchema:{
        bsonType:"object",
        required:["imageName", "idFile", "boOther", "tCreated", "strHash", "size", "widthSkipThumb", "width", "height", "extension", "tLastAccess", "nAccess", "tMod", "hash", "nParent", "IdParent"],
        properties:{
          tCreated:{ bsonType:"date" },
          tLastAccess:{ bsonType:"date" },
          tMod:{ bsonType:"date" },
        }
      }
    },
    //ArrIndex:[[{imageName:1}, {unique:1, collation: { locale:'en', strength:2 } }],   [{idFile:1}]]
    ArrIndex:[{name:'imageName', key:{imageName:1}, unique:1, collation:{locale:'en', strength:2} },   {name:'idFile', key:{idFile:1}, unique:1}]
  },
  Thumb:{
    validator:{
      $jsonSchema:{
        bsonType:"object",
        required:["idImage", "idFile", "width", "height", "strHash", "size"],
      }
    },
    //ArrIndex:[[{idImage:1, width:1, height:1}, {unique:1}], [{idFile:1}, {unique:1}]]
    ArrIndex:[{name:'idImageNwidthNheight', key:{idImage:1, width:1, height:1}, unique:1}, {name:'idFile', key:{idFile:1}, unique:1}]
  },
  Redirect:{
    validator:{
      $jsonSchema:{
        bsonType:"object",
        required:["idSite", "pageName", "url", "tCreated", "tLastAccess", "tMod", "nAccess"],
        properties:{
          tCreated:{ bsonType:"date" },
          tLastAccess:{ bsonType:"date" },
          tMod:{ bsonType:"date" },
        }
      }
    },
    //ArrIndex:[[{idSite:1, pageName:1}, {unique:1, collation:{locale:'en', strength:2} }]]
    ArrIndex:[{name:'idSiteNpageName', key:{idSite:1, pageName:1}, unique:1, collation:{locale:'en', strength:2} }]
  },
  RedirectDomain:{
    validator:{
      $jsonSchema:{
        bsonType:"object",
        required:["www", "url", "tCreated"],
        properties:{
          tCreated:{ bsonType:"date" },
        }
      }
    },
    //ArrIndex:[[{www:1}, {unique:1}]]
    ArrIndex:[{name:'www', key:{www:1}, unique:1}]
  },
  Setting:{
    validator:{
      $jsonSchema:{
        bsonType:"object",
        required:["name", "value"],
      }
    },
    //ArrIndex:[[{name:1}, {unique:1}]]
    ArrIndex:[{name:'name', key:{name:1}, unique:1}]
  }
}
  






