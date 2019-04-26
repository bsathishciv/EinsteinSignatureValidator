const MongoClient = require('mongodb').MongoClient;


const uri = "mongodb+srv://sathish_dev:Einstein123@einsteintestcluster0-rz7yb.gcp.mongodb.net/test?ssl=true";
const client = new MongoClient(uri, {useNewUrlParser:true});

client.connect((err, x) => {
    if ( !err ) {
        const collection = x.db("SignatureStatus_db").collection("SignatureStatus_c");

        collection.find(
            {
                ObjectName : 'Call__c'
            }
        ).forEach((doc) => {
            console.log(doc);
        })

        //console.log(collection.);
        client.close();
    } else {
        console.log(err);
    }
    
});
