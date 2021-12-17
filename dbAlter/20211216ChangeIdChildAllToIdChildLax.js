db.getCollectionInfos({name: "Page"})

db.runCommand({ collMod: "Page", validator: {}})

db.Page.updateMany( {}, { $rename: { "IdChildAll": "IdChildLax" } } )
db.Page.updateMany( {}, { $unset: { "objTemplateE": 1 } } )

db.Page.updateMany( {}, { $rename: { "boOther": "boOtherA" } } )

validator={
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
}


db.runCommand({ collMod: "Page", validator, validationLevel: null});


//
// Set it back
//


validator={
  $jsonSchema:{
    bsonType:"object",
    required:["idSite", "pageName", "boTalk", "boTemplate", "boOR", "boOW", "boSiteMap", "tCreated", "tLastAccess", "nAccess", "intPriority", "strLang", "IdParent", "IdChildAll", "IdChild", "StrImage", "StrImageStub", "StrPagePrivate", "arrRevision", "objTemplateE", "nRevision", "lastRev", "nParent", "nChild", "nImage", "boTalkExist", "idFileWiki", "idFileHtml", "boOther", "tMod", "tModCache", "strHashParse", "strHash", "size"], 
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
}