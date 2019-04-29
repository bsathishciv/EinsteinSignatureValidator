/** Mongo DB connector */

// imports
const OID = require('mongodb').ObjectId;
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs');

// main

class MDB {

    constructor() {
        this.configData = JSON.parse(fs.readFileSync( __dirname + '/config.json'));

        this.mClient = new MongoClient( this.configData.uri, { useNewUrlParser:true } );
        this.db = null;
        this.collection = null;
        this.mConnection = null;

    }

    setDb(dbName){
        this.db = dbName;
    }

    setCollection(collectionName){
        this.collection = collectionName;
    }

    setAgenda(agendaInstance){
        this.agenda = agendaInstance;
    }

    get client(){
        return this.mClient;
    }

    async query(queryObj={}) {

        return new Promise( 
            async (resolve, reject) => {
                try{

                    let cursorx = await this.mConnection.find(queryObj);
                    let documents = [];

                    while( await cursorx.hasNext()){
                        documents.push( await cursorx.next());
                    }

                    resolve(documents);

                } catch(err) {
                    reject(err);
                }
            }
        );

    }

    async insert (records=[]) {

        return new Promise( 
            async (resolve, reject) => {
                try{
                    if ( records.length == 0 ){
                        reject('INSERT_ERROR: No records specified');
                    }

                    if ( records.length == 1 ) {
                        //console.log('1');
                        let result = await this.mConnection.insertOne(records[0]);
                        resolve([result.insertedId]);
                    } else {

                        let result = await this.mConnection.insertMany(records);

                        resolve(Object.values(result.insertedIds));
                    }

                    reject('INSERT_ERROR: Failed to insert records');

                } catch(err) {
                    console.log(err);
                    reject('INSERT_ERROR: '+err);
                }
            }
        );

    }

    async update (doc /** doc with Id */) {

        return new Promise( 
            async (resolve, reject) => {
                try{
                    if ( doc.length == 0 ){
                        reject('UPDATE_ERROR: No records specified');
                    }
                    console.log(' --------- EINSTEIN APP: Updating record...'); 
                    if ( doc.length == 1 ) {

                        let result = await this.mConnection.findOneAndReplace(
                            { '_id' : OID(doc[0]._id) },
                            doc[0],
                        );
                        console.log(' --------- EINSTEIN APP: DONE Updating record...'); 
                        resolve(result);

                    } 

                    reject('UPDATE_ERROR: Failed to update records');

                } catch(err) {
                    reject('UPDATE_ERROR: '+err);
                }
            }
        );

    }

    async connect() {

        let connection;

        while ( connection == undefined || connection == null ) {
            try {
                connection = await this.mClient.connect();
                //console.log(connection.db(this.db).collection(this.collection));
                this.mConnection = await connection.db(this.db).collection(this.collection);
            } catch (err) {
                console.log(err);
            }
        }

    }

    static getCollectionMetadata() {
        return {
            SignatureStatus_c : {
                __id : 'READONLY',
                AccountId : '',
                ObjectName : '',
                ObjectId : '',
                SignatureBase64 : '',
                Status : 'FRESH',
                ModelId : '',
                MatchAccuracy: 0,
                BatchId : ''
            }
        }
    }

}

module.exports = MDB;

