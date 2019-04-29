const MDB = require('./SignStoreDAO');
const Agendax = require('./Agenda');

class BatchService {

    constructor(recordsJson){

        let template = MDB.getCollectionMetadata().SignatureStatus_c;

        delete template.__id; // remove Id key, as that is autofilled in mongo

        let SignatureStatusArray = [];

        // Create SignatureStatus_c collection documents.
        for ( let rec of recordsJson ) {
            SignatureStatusArray.push(
                Object.assign(
                    JSON.parse(JSON.stringify(template)),
                    rec 
                )
            );
        }

        this.recordArr = SignatureStatusArray;

    }

    async start() {
        //store collection documents in DB and callout to einstein for prediction.
        try {
            console.log('EINSTEIN APP: Batch Initiated...');
            let db = new MDB();
            //console.log('a');
            db.setDb('SignatureStatus_db');
            db.setCollection('SignatureStatus_c');
            //console.log('b');
            await db.connect();
            //console.log('c');
            let result = await db.insert(this.recordArr);
            //console.log('==========================================');

            let ag = new Agendax();
            await ag.connection();
            //console.log(result);
            ag.setData([result]);
            ag.loadJob('PredictJob');
            ag.startx(); // runs job in background process
            console.log('EINSTEIN APP: Batch Queued...');
            return result;

        } catch ( err ) {
            throw new Error(err);
        }
        
    }

}

module.exports = BatchService;