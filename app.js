// exports
const express = require('express');
const MongoClient = require('mongodb').MongoClient;

// main
let port = process.env.PORT || 3000;
let app = express();
let router = express.Router();

router.use(
    function(req, res, next) {

    }
);

router.get('/', async function (req, res) {
    
 res.send(await getRecord());
});

router.get('/status:batchId', function (req, res) {
    
    if ( req.params && req.param.batchId ) {

    }

});

router.post('/validate', function (req, res) {
    
});

app.listen(port, function () {
 console.log(`Example app listening on port !`);
});

async function getRecord(){

    return new Promise((resolve, reject){
        const uri = "mongodb+srv://sathish_dev:Einstein123@einsteintestcluster0-rz7yb.gcp.mongodb.net/test?ssl=true";
        const client = new MongoClient(uri, {useNewUrlParser:true});

        client.connect((err, x) => {
            if ( !err ) {
                const collection = x.db("SignatureStatus_db").collection("SignatureStatus_c");
                let res = [];
                collection.find(
                    {
                        ObjectName : 'Call__c'
                    }
                ).forEach((doc) => {
                    res.push(doc);
                });

                resolve(doc);

                //console.log(collection.);
                client.close();
            } else {
                reject(err);
            }
        
        });
    });

}