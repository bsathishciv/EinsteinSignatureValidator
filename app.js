// exports
const express = require('express');
const bodyParser = require('body-parser');
const MDB = require('./einstein/SignStoreDAO');
const BatchService = require('./einstein/BatchService');

// main
let port = process.env.PORT || 5000;
let app = express();
let router = express.Router();

app.use(bodyParser.json()); // to parse the post body
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async function (req, res) {

    const db = new MDB();
    db.setDb('SignatureStatus_db');
    db.setCollection('SignatureStatus_c');
    await db.connect();
    const result = await db.query();
    
    res.status(200).json(result);

});

app.post('/', async function (req, res) {
        
    try {

        if ( ! req.body || Object.keys(req.body).length == 0 ) {
            res.status(400).send('ERROR: empty response');
            return;
        }

        let result = await new BatchService(
            req.body.records
            ).start();
        
        if ( result ) {
            res.status(200).json(result);
            res.end();
        } else {
            res.status(500).send('ERROR: Could not save records to DB, please try again.');
        }

    } catch ( err ) {

        //console.log(err);

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
