const MDB = require('./../SignStoreDAO');
const EinsteinService = require('./../EinsteinService');

module.exports = function(agenda) {
    try {
        console.log('came in predict');
        console.log(agenda);
        agenda.define('PredictJob', async function(job, done) {
            console.log('came in predict 2');
                // Connect to the db
                const db = new MDB();
                db.setDb('SignatureStatus_db');
                db.setCollection('SignatureStatus_c');
                await db.connect();
                console.log(job.attrs.data);
                const result = await db.query({ _id: { $in: job.attrs.data.xdata }});
                console.log('came in predict 3');
                result.forEach(
                    async (doc) => {

                        try{
                            console.log('came in predict 4');
                            let service = new EinsteinService();
                            let match = await service.predict(doc);
                            console.log('came in predict 5');
                            console.log(match);
                            if ( match ) {

                                doc.MatchAccuracy = match.probability;
                                doc.SignatureBase64 = '';
                                if ( match.probability > 0.9 ) {
                                    doc.Status = 'VALID';
                                } else {
                                    doc.Status = 'INVALID';
                                }

                            
                            
                                // update in mongo
                                console.log(doc);
                                await db.update([doc]);
                                //await db.delete([doc]);
                            }

                            //post to salesforce

                        } catch (err){
                            console.log(err);
                        }
                        
                        
                    }
                );

                done();

        });
    } catch ( err ) {
        console.log(err)
    }
}