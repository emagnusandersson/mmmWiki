
if(typeof app=='undefined') app={};


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
  //   ArrUnique:[[{strA:1}]]
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
    ArrUnique:[ [{www:1}]]  //[{siteName:1}],
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
    ArrUnique:[[{idSite:1, pageName:1}, {  collation: { locale:'en', strength:2 } }]]
  },
  FileWiki:{
    validator:{
      $jsonSchema:{
        bsonType:"object",
        required:["idPage", "data"],
      }
    },
    ArrUnique:[]
  },
  FileHtml:{
    validator:{
      $jsonSchema:{
        bsonType:"object",
        required:["data"],
      }
    },
    ArrUnique:[]
  },
  FileImage:{
    validator:{
      $jsonSchema:{
        bsonType:"object",
        required:["data"],
      }
    },
    ArrUnique:[]
  },
  FileThumb:{
    validator:{
      $jsonSchema:{
        bsonType:"object",
        required:["data"],
      }
    },
    ArrUnique:[]
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
    ArrUnique:[[{imageName:1}, {  collation: { locale:'en', strength:2 } }], 
    [{idFile:1}]]
  },
  Thumb:{
    validator:{
      $jsonSchema:{
        bsonType:"object",
        required:["idImage", "idFile", "width", "height", "strHash", "size"],
      }
    },
    ArrUnique:[[{idImage:1, width:1, height:1}], 
    [{idFile:1}]]
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
    ArrUnique:[[{idSite:1, pageName:1}, {  collation: { locale:'en', strength:2 } }]]
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
    ArrUnique:[[{www:1}]]
  },
  Setting:{
    validator:{
      $jsonSchema:{
        bsonType:"object",
        required:["name", "value"],
      }
    },
    ArrUnique:[[{name:1}]]
  }
}
  






