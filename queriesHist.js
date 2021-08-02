db.Image.aggregate(
    {"$match":{"$and":[{"IdParent":{"$in":["clo:start"]}}]}},
    {"$project":{"_id":0,"IdParent":1}},
    {"$unwind":{"path":"$IdParent","preserveNullAndEmptyArrays":true}},
    {"$project":{"returnObject":{"$regexFind":{"input":"$IdParent","regex":/^(.*?):/}}}},
    {"$group":{"_id":{"$first":"$returnObject.captures"},"n":{"$sum":1}}},
    {"$sort":{"n":-1,"_id":1}}
    )

db.Image.find({"IdParent":{$in:["clo:start"]}}, {"_id":0,imageName:1,"IdParent.$":1})
db.Image.find({$or:[{"IdParent":{$in:["clo:start"]}}, {IdParent:{"$eq":[]}}]}, {"_id":0,imageName:1,"IdParent":1})


db.Image.aggregate(
    {"$match":{"$and":[{"IdParent":{"$in":["clo:start"]}}]}},
    {"$project":{"_id":0,imageName:1,"IdParent":1}},
    )


  // {$or:[{IdParent:{"$eq":[]}}, {IdParent:{"$regex":"(mag|gav)"}}]}
  // {$and:[{IdParent:{"$ne":[]}}, {IdParent:{$not:{"$regex":"(mag|gav)"}}}]}
db.Image.aggregate(
    {"$match":{"$and":[{"IdParent":{"$in":["clo:start"]}}]}},
    {"$project":{"_id":0,imageName:1,"IdParent":{$filter: {
            input: '$IdParent',
            as: 'idParent',
            cond: {"$in":['$$idParent', ["clo:start"]]}
        }}
        }},
    {"$unwind":{"path":"$IdParent","preserveNullAndEmptyArrays":true}},
    {"$project":{"returnObject":{"$regexFind":{"input":"$IdParent","regex":/^(.*?):/}}}},
    {"$group":{"_id":{"$first":"$returnObject.captures"},"n":{"$sum":1}}},
    {"$sort":{"n":-1,"_id":1}}
)

     //{$or:[{"IdParent":{$in:["clo:start"]}}, {IdParent:{"$eq":[]}}]}
     //{$and:[{"IdParent":{$nin:["clo:start"]}}, {IdParent:{"$ne":[]}}]}

     //{$or:[{"$in":["$$idParent", ["clo:start"]]}, {"$eq":["$$idParent", []]}]}
     //{$and:[{$not:[{"$in":["$$idParent", ["clo:start"]]}]}, {"$ne":["$$idParent", []]}]}
db.Image.aggregate(
    {"$match":{$and:[{"IdParent":{$nin:["clo:start"]}}, {IdParent:{"$ne":[]}}]}},
    {"$project":{"_id":0,imageName:1,"IdParent":{$filter: {
            input: '$IdParent',
            as: 'idParent',
            cond: {$and:[{$not:[{"$in":["$$idParent", ["clo:start"]]}]}, {"$ne":["$$idParent", []]}]}
        }}
        }},
    {"$unwind":{"path":"$IdParent","preserveNullAndEmptyArrays":true}},
    {"$project":{"returnObject":{"$regexFind":{"input":"$IdParent","regex":/^(.*?):/}}}},
    {"$group":{"_id":{"$first":"$returnObject.captures"},"n":{"$sum":1}}},
    {"$sort":{"n":-1,"_id":1}}
)

db.Image.aggregate(
    {"$match":{}},
    {"$project":{"_id":0,"imageName":1,"IdParent":{"$filter":{"input":"$IdParent","as":"idParent","cond":{}}}}},
    {"$unwind":{"path":"$IdParent","preserveNullAndEmptyArrays":true}},
    {"$project":{"returnObject":{"$regexFind":{"input":"$IdParent","regex":/^(.*?):/}}}},
    {"$group":{"_id":{"$first":"$returnObject.captures"},"n":{"$sum":1}}},
    {"$sort":{"n":-1,"_id":1}}
)


db.Image.aggregate(
    {"$match":{"$and":[{"IdParent":{"$in":["clo:start"]}}]}},
    {"$project":{"_id":0,"IdParent":1,imageName:1}},
    {"$unwind":{"path":"$IdParent","preserveNullAndEmptyArrays":true}},
    )



db.Page.aggregate(
    {"$match":{}},
    {"$project":{"_id":0,"idSite":1}},
    {"$group":{"_id":"$idSite","n":{"$sum":1}}},
    {"$sort":{"n":-1,"_id":1}}
)