const MDB = require('./../SignStoreDAO');
const EinsteinService = require('./../EinsteinService');

module.exports = function(agenda) {
    try {


        agenda.define('PredictJob', async function(job, done) {
            console.log(' --------- EINSTEIN APP: Starting Agenda queue processing...');
                // Connect to the db
                const db = new MDB();
                db.setDb('SignatureStatus_db');
                db.setCollection('SignatureStatus_c');
                await db.connect();

                const result = await db.query({ _id: { $in: job.attrs.data.xdata }});

                await result.forEach(
                    async (doc) => {

                        try {
                            console.log(' --------- EINSTEIN APP: Predicting signature of Account: '+doc.AccountId+ ' on '+doc.ObjectName+ ' with Id: ' + doc.ObjectId);
                            
                            let service = new EinsteinService();
                            let match = await service.predict(doc);

                            if ( match ) {
                                console.log(' --------- EINSTEIN APP: Match found...');
                                doc.MatchAccuracy = match.probability;
                                doc.SignatureBase64 = '';
                                if ( match.probability > 0.9 ) {
                                    doc.Status = 'VALID';
                                } else {
                                    doc.Status = 'INVALID';
                                }
                     
                                // update in mongo

                                await db.update([doc]);
                                //await db.delete([doc]);
                            } else {

                                console.log(' --------- EINSTEIN APP: Match NOT found...'); 
                                doc.MatchAccuracy = 0;
                                doc.SignatureBase64 = '';
                                doc.Status = 'INVALID';
                                // update in mongo

                                await db.update([doc]);

                            }

                            //post to salesforce

                        } catch (err){
                            console.log(err);
                        }
                        
                        
                    }
                );
                console.log(' --------- EINSTEIN APP: Batch processing completed...'); 
                done();

        });
    } catch ( err ) {
        console.log(err)
    }
}