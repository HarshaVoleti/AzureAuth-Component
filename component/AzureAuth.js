const msal = require('@azure/msal-node');
require('dotenv').config({ path: '/Users/harshavoleti/Desktop/final try/.env.myenv' });
const axios = require('axios');
const { Authority } = require('msal');

// const configurations = {
//    clientID : process.env.CLIENT_ID,
//    authority : process.env.CLOUD_INSTANCE + process.env.TENANT_ID,
//    clientsecret : process.env.CLIENT_SECRET,
//    redirectURI : process.env.REDIRECT_URI,
// }


class AzureAuthentication{

    // constructor() {
    //     this.clientID = "0bcb521d-fd86-4cb1-889c-bbc25ee0610b";
    //     this.authority = "https://login.microsoftonline.com/99881f9-8819-451e-ace7-4e600b7fc3e9";
    //     this.clientSecret = "hzD8Q~lL1Kz0LrkWsnHaLvsFWa~2lkGzWe_qscVq";
    //     this.redirectURI = "http://localhost:3000/auth/redirect";
    // }

    login(configs){
        console.log("login button clicked");
        return async (req, res, next) => {
            console.log("login initiated");
            try{
                console.log("entered try block");
                const authConfigs ={
                    auth : {
                        clientId : "0bcb521d-fd86-4cb1-889c-bbc25ee0610b",
                        authority :  "https://login.microsoftonline.com/499881f9-8819-451e-ace7-4e600b7fc3e9"                        ,
                        clientSecret : "5eV8Q~07E~lzMYknxs3e-DDSSvDf3oO9neyk4aiv",
                    }
                }
                const authInstance = new msal.ConfidentialClientApplication(authConfigs);
                console.log("auth instance created", authInstance);
                const response = await authInstance.getAuthCodeUrl({
                    scopes : ['openid', 'profile'],
                    redirectUri : "http://localhost:3000/redirect", 
                })
                console.log("response recieved", response);
                console.log(response);
                res.redirect(response);


            }catch(error){
                console.log(error);
                next(error);
            }

        }
    }
    
    getAccessToken(){
        console.log("handle redirect triggered");
        return (req, res, next)=> {
            console.log("handle redirect initiated");
            try {
                console.log("try block entered");
                const authInstance = new msal.ConfidentialClientApplication({
                    auth : {
                        clientId : "0bcb521d-fd86-4cb1-889c-bbc25ee0610b",
                        authority :  "https://login.microsoftonline.com/499881f9-8819-451e-ace7-4e600b7fc3e9"                        ,
                        clientSecret : "5eV8Q~07E~lzMYknxs3e-DDSSvDf3oO9neyk4aiv",
                    },
                });
                console.log("instance created again:" ,authInstance);
                const response = authInstance.acquireTokenByCode({
                    code : req.query.code,
                    redirectUri : "http://localhost:3000/redirect", 
                    scopes: ['openid', 'profile'], 
                })
                console.log("response recieved:", response);


                const accessToken = response.accessToken;
                console.log("accessToken is aquired successfully", accessToken);
                res.redirect('/dashboard');
            }catch(error){
                console.log(error);
                next(error);
            }
        }

    }

}

module.exports = AzureAuthentication;