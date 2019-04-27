//imports
const fs = require('fs');
const request = require('request'); // NodeJS custom https wrapper library
const EinsteinService = require('./EinsteinService');
const jwt = require('njwt');

//main

class EinsteinRequest {

    constructor( url, context ){
        this.url = url;
        this.token = fs.readFileSync( __dirname + '/data/einstein_accessToken.txt', 'utf8');
        this.defaultHeaders = {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${this.token}`,
            'Cache-Control': 'no-cache' 
        };
        this.context = context;
    }

    datax(formData) {
        this.data = formData;
        return this;
    }

    headerx( headerObj ) {
        this.customHeaders = headerObj;
        return this;
    }

    async postx(){

        return new Promise((resolve, reject) => {
            let attr = {};
            if ( this.context == 'AUTH') {
               attr = {
                    url: this.url,
                    form: this.data,
                    headers: this.customHeaders ? this.customHeaders : this.defaultHeaders
                };
            } else {
                attr = {
                    url: this.url,
                    formData: this.data,
                    headers: this.customHeaders ? this.customHeaders : this.defaultHeaders
                };
            }
            request.post(
                attr
            )
            .on(
                'response', 
                async (resp) => {
                    console.log(resp.statusCode);
                    console.log(resp.statusMessage);
                    let exitcode = await this.processResponse(resp);
                    if ( exitcode ) {
                        //resolve();
                    } else {
                        //reject();
                    }
                }
            )
            .on(
                'data', 
                (data) => {
                    console.log(data);
                    resolve(this.processData(data));
                }
            );

        });

    }

    getx() {
        // TO DO
    }

    async processResponse(resp) {

        if(resp.statusCode == 401 || resp.statusCode == 500 ){
            await this.getAccessToken();
            console.log(this.token);
            this.postx(); // retry
            return 1;
        } else {
            return 0;
        }

    }

    processData( chunk ) {

        if ( this.context == 'AUTH' ) {

            const body = JSON.parse(chunk);
            const accessToken = body["access_token"];
            console.log('----------->'+accessToken);
            fs.writeFile(
                __dirname + '/data/einstein_accessToken.txt', 
                accessToken,
                (err) => { console.log(err)}
            );


            return;

        } else if ( this.context == 'PREDICT' ) {

            const body = JSON.parse(chunk);

            if (! body.probabilities || body.probabilities.length == 0){
                return 0;
            }

            return body.probabilities[0];
            
        }

    }

    async getAccessToken() {

        const unixTime = Date.now() + (6 * 60 * 60 * 1000);

        const jwtOps = {
            "sub": "sbalaji@in.imshealth.com",
            "aud": 'https://api.einstein.ai/v2/oauth2/token',
            "exp": unixTime
        }

        // PRIVATE key
        const privateKEY  = fs.readFileSync( __dirname + '/data/einstein_private.key', 'utf8');

        //Create an assertion token using njwt to be used in grant type
        const token = jwt
                .create(jwtOps,privateKEY)
                .setHeader("typ", "JWT")
                .setHeader("alg", "RS256")
                .compact();

        const postData = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${token}`;

        console.log(postData);

        await new EinsteinRequest('https://api.einstein.ai/v2/oauth2/token', 'AUTH')
            .datax(postData)
            .headerx({'Content-Type': 'application/x-www-form-urlencoded'})
            .postx();

    }

}

module.exports = EinsteinRequest;

