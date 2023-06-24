const msal = require('@azure/msal-node');
require('dotenv').config({ path: '/Users/harshavoleti/Desktop/final try/.env.myenv' });
const axios = require('axios');
var express = require('express');
class AzureAuthentication{

    clientID = process.env.CLIENT_ID;
    tenatID = process.env.TENANT_ID;
    authority = 'https://login.microsoftonline.com/common';
    redirectURI = process.env.REDIRECT_URI;
    clientsecret = process.env.CLIENT_SECRET;
    logoutredirecturl = process.env.POST_LOGOUT_REDIRECT_URI;

   

    login(){
        console.log("login button clicked");
        return async (req, res, next) => {
            // console.log("login initiated");
            try{
                console.log("entered try block");
                const authConfigs = {
                    auth : {
                        clientId : this.clientID,
                        authority :  'https://login.microsoftonline.com/common',                        
                        clientSecret :  this.clientsecret,
                    },
                    system: {
                        loggerOptions: {
                            loggerCallback(loglevel, message, containsPii) {
                                console.log(message);
                            },
                            piiLoggingEnabled: false,
                            logLevel: 3,
                        }
                    }
                }
                const authInstance = new msal.ConfidentialClientApplication(authConfigs);
                // if(req.session.tokencache){
                //     authInstance.getTokenCache().deserialize(req.session.tokencache);
                // }

                console.log("auth instance created", authInstance);
                const response = await authInstance.getAuthCodeUrl({
                    scopes : ['openid', 'profile', 'user.read'],
                    redirectUri : this.redirectURI, 
                })
                console.log("response recieved", response);
                // console.log(response);
                res.redirect(response);


            }catch(error){
                console.log(error);
                next(error);
            }

        }
    }
    
    getAccessToken(){
        // console.log("handle redirect triggered");
        return async (req, res, next)=> {
            // console.log("handle redirect initiated");
            try {
                // console.log("try block entered");
                const authInstance = new msal.ConfidentialClientApplication({
                    auth : {
                        clientId : this.clientID,
                        authority : 'https://login.microsoftonline.com/common',
                        clientSecret : this.clientsecret,
                    },
                    system: {
                        loggerOptions: {
                            loggerCallback(loglevel, message, containsPii) {
                                console.log(message);
                            },
                            piiLoggingEnabled: false,
                            logLevel: 3,
                        }
                    },
                });
                let accessToken = "" ;
                let name = "";
                let email = "";
                // console.log("instance created again:" ,authInstance);
                const tokenData = authInstance.acquireTokenByCode({
                    code : req.query.code,
                    redirectUri : this.redirectURI, 
                    scopes: ['openid', 'profile', 'user.read'], 
                }).then(async function(result){
                    console.log("response recieved:", result);
                    accessToken = result.accessToken;
                    name = result.idTokenClaims.name;
                    email = result.idTokenClaims.preferred_username;
                    console.log("name:", name );
                    console.log("emailID : ", email);
                    if(accessToken != null){
                        // console.log("accessToken is aquired successfully", accessToken);
                    }
                    
                });
                res.redirect('/dashboard');            
            }catch(error){
                console.log(error);
                next(error);
            }
            }
    }

    logout(){
        console.log('logout button started with logoutredirect');
        return (req, res, next)=> {
            console.log('logout function started ');
            try{
                let logouturi = `${this.authority}/oauth2/v2.0/logout`;
                console.log('logout try started logoutURI:',logouturi);
                
                if(this.logoutredirecturl){
                    logouturi += `?post_logout_redirect_uri=${this.logoutredirecturl}`;
                }
                console.log('logout added with logoutredirect',logouturi);
                // req.session.destroy(() => {
                    res.redirect(logouturi);
                // });
            }catch(error){
                next(error);
                console.log(error);

            }
        }
    }

}

module.exports = AzureAuthentication;