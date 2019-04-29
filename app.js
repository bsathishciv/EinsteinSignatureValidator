// exports
const express = require('express');
const bodyParser = require('body-parser');
const MDB = require('./einstein/SignStoreDAO');
const BatchService = require('./einstein/BatchService');

// main
let port = process.env.PORT || 5000;
let app = express();
let router = express.Router();

//app.use(bodyParser.text({type : 'text/plain'})); // to parse the post body
//app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async function (req, res) {

    const db = new MDB();
    db.setDb('SignatureStatus_db');
    db.setCollection('SignatureStatus_c');
    await db.connect();
    const result = await db.query();
    
    res.status(200).json(result);

});

app.use(function(req, res, next){
    var data = "";
    req.on('data', function(chunk){ data += chunk})
    req.on('end', function(){
        req.rawBody = data;
        req.jsonBody = JSON.parse(data);
        next();
    })
 })

app.post('/', async function (req, res) {
        
    try {
        console.log(req.jsonBody);
        let obj = req.jsonBody;

        if ( ! obj || ! obj.records || Object.keys(obj).length == 0 ) {
            res.status(400).send('ERROR: empty response');
            return;
        }

        console.log('EINSTEIN APP: Records verified...');

        let result = await new BatchService(
            obj.records
            ).start();
        
        if ( result ) {
            console.log('EINSTEIN APP: Request completed...');
            res.status(200).json(result);
            res.end();
        } else {
            console.log('EINSTEIN APP: Request error...');
            res.status(500).send('ERROR: Could not save records to DB, please try again.');
        }

    } catch ( err ) {

        console.log('EINSTEIN APP: Request error...');

        res.send(err);

    }
    

});

/*
router.get('/status:batchId', function (req, res) {
    
    if ( req.params && req.param.batchId ) {

    }

});

router.post('/validate', function (req, res) {
    
});
*/
app.listen(port, function () {
 console.log(`Example app listening on port !`);
});
