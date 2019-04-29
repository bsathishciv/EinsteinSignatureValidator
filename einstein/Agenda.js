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

            console.log(' --------- EINSTEIN APP: Setting Agenda');

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

        let job = this.agenda.now(this.types[0], { xdata : this.data });
        this.agenda.start();

    }

    schedulex( cronexp ) {

        this.agenda.schedule(cronexp, this.types[0] /** TO DO */ );

    }

    onComplete() {


    }

    loadJob(type) {

        console.log(' --------- EINSTEIN APP: loading jobs into Agenda...');
        this.types.push(type);
        try {
            require('./jobs/PredictJob')(this.agenda);
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
