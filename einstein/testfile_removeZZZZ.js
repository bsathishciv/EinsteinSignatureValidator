const Agenda = require('agenda');
const MDB = require('./SignStoreDAO');
const EinsteinRequest = require('./EinsteinRequest');
const jwt = require('njwt');
const fs = require('fs');
const OID = require('mongodb').ObjectId;


async function ni (){

    const db = new MDB();
    db.setDb('SignatureStatus_db');
    db.setCollection('SignatureStatus_c');
    await db.connect();

    console.log(await db.mConnection.deleteMany(
        {
            name : 'PredictJob'
        }
    ));

}

ni();

