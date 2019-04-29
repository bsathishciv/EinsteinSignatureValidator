
const EinsteinRequest = require('./EinsteinRequest');

class EinsteinService {

    constructor(){

    }

    static URL(){

        return {
            DETECT_URL : 'https://api.einstein.ai/v2/vision/detect',
            TOKEN_URL : 'https://api.einstein.ai/v2/oauth2/token'
        }

    }

    async predict(doc) {

        var formData = {
            sampleBase64Content: doc.SignatureBase64,
            modelId: doc.ModelId
        };

        let er = new EinsteinRequest(EinsteinService.URL().DETECT_URL, 'PREDICT');
        er.datax(formData);
        return await er.postx();
        
    }

}

module.exports = EinsteinService;
