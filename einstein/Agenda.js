const Agenda = require('agenda');
const MDB = require('./SignStoreDAO');

class Agendax {

    constructor(){

        this.types = [];
        this.data = {};

        //process.on('SIGTERM', this.graceful());
        //process.on('SIGINT' , this.graceful());

    }

    async connection() {

        return new Promise( async (resolve, reject ) => {

            console.log(' befor invoking  agenda');

            this.agenda = await new Agenda(
                { db: 
                    {
                        address: new MDB().configData.uri,
                        collection: 'SignatureStatus_c', 
                        options: {ssl: true}
                    }
                
                }
            );

            this.agenda.on('ready', () => {
                //console.log(this.agenda);
                resolve();
            })

        })
       
    }

    startx() {

        console.log('AGENDA Start: Starting Job in Mongo');
        console.log(this.data);
        let job = this.agenda.now(this.types[0], { xdata : this.data });
        this.agenda.start();
        console.log('>>>>>>>>');
        console.log(job);
        console.log('AGENDA end: '+ job);

    }

    schedulex( cronexp ) {

        this.agenda.schedule(cronexp, this.types[0] /** TO DO */ );

    }

    onComplete() {


    }

    loadJob(type) {
        console
        .log('came in load');
        this.types.push(type);
        try {
            require('./jobs/PredictJob')(this.agenda);
            console.log('done');
        } catch (err) {
            console.log(err);
        }
        

    }

    setData(data){
        this.data = data;
    }

    graceful() {
        this.agenda.stop(
            function() {
                rocess.exit(0);
            }
        );
    }

}

module.exports = Agendax;
