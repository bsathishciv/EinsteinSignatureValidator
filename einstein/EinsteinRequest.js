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
        this.loadDefaultHeaders();
        this.context = context;
    }

    loadDefaultHeaders(){
        this.defaultHeaders = {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${this.token}`,
            'Cache-Control': 'no-cache' 
        };
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
                attr,
                async ( err, resp, body ) => {
                    console.log(this.context);
                    if ( resp && resp.statusCode != 401 ) {

                        //console.log('<<>> '+ resp.statusCode);
                        if ( body ) {
                            await this.processData(body);
                            resolve();
                        }

                    } else if ( resp && resp.statusCode == 401 ) {
                        //console.log(' ---- '+ resp.statusCode);
                        await this.processResponse(resp);
                        // re-process with new access token
                        this.token = fs.readFileSync( __dirname + '/data/einstein_accessToken.txt', 'utf8');
                        this.loadDefaultHeaders();
                        await this.postx();
                        resolve();
                    }
                }
            )

        });

    }

    getx() {
        // TO DO
    }

    async processResponse(resp) {

        if(resp.statusCode == 401 || resp.statusCode == 500 ){
            await this.getAccessToken();
            //console.log(this.token);
            
            return 1;
        } else {
            return 0;
        }

    }

    processData( chunk ) {

        if ( this.context == 'AUTH' ) {

            const body = JSON.parse(chunk);
            const accessToken = body["access_token"];
            //console.log('----------->'+accessToken);
            fs.writeFileSync(
                __dirname + '/data/einstein_accessToken.txt', 
                accessToken
            );

            this.token = accessToken;
            this.loadDefaultHeaders();

            return;

        } else if ( this.context == 'PREDICT' ) {

            const body = JSON.parse(chunk);
            console.log(body);
            if (! body.probabilities || body.probabilities.length == 0){
                return 0;
            }
            console.log(body.probabilities);
            console.log(body.probabilities[0]);
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

        //console.log(postData);

        await new EinsteinRequest('https://api.einstein.ai/v2/oauth2/token', 'AUTH')
            .datax(postData)
            .headerx({'Content-Type': 'application/x-www-form-urlencoded'})
            .postx();

    }

}

module.exports = EinsteinRequest;

