'use strict'

const mongodb = require("mongodb").MongoClient;

module.exports = (_this, express) => {
    if(!_this.mongodb){
        mongodb.connect("mongodb://localhost:27017", (err, client) => {
            if(err) console.log("Error to start MongoDB: " + err);
            else console.log("Start MongoDB");

            const db = client.db("blocks");
            _this.set("mongodb", db);
        });
    }

    express.app.get("/users", (req, res) => {
        _this.mongodb.collection("user").find({}).toArray((err, docs) => {
            if(err){
                console.log(err);
                res.status(404);
            }
            else{
                res.send(docs);
            }
        })
    });
}
