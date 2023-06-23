const msal = require('@azure/msal-node');
require('dotenv').config({ path: '/Users/harshavoleti/Desktop/final try/.env.myenv' });
const axios = require('axios');
var express = require('express');
class AzureAuthentication{

    clientID = process.env.CLIENT_ID;
    tenatID = process.env.TENANT_ID;
    authority = process.env.CLOUD_INSTANCE + process.env.TENANT_ID;
    redirectURI = process.env.REDIRECT_URI;
    clientsecret = process.env.CLIENT_SECRET;
    logoutredirecturl = process.env.POST_LOGOUT_REDIRECT_URI;

   

    login(configs){
        console.log("login button clicked");
        return async (req, res, next) => {
            // console.log("login initiated");
            try{
                console.log("entered try block");
                const authConfigs ={
                    auth : {
                        clientId : this.clientID,
                        authority :  this.authority,                        
                        clientSecret :  this.clientsecret,
                    }
                }
                const authInstance = new msal.ConfidentialClientApplication(authConfigs);
                // if(req.session.tokencache){
                //     authInstance.getTokenCache().deserialize(req.session.tokencache);
                // }

                // console.log("auth instance created", authInstance);
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
                        authority : this.authority,
                        clientSecret : this.clientsecret,
                    },
                });
                // console.log("instance created again:" ,authInstance);
                const response = authInstance.acquireTokenByCode({
                    code : req.query.code,
                    redirectUri : this.redirectURI, 
                    scopes: ['openid', 'profile', 'user.read'], 
                }).then(async function(result){
                    console.log("response recieved:", result);
                    const accessToken = result.accessToken;
                    if(accessToken != null){
                        console.log("accessToken is aquired successfully", accessToken);
                    }
                    const headers = {
                        Authorization: `Bearer ${accessToken}`,
                    };
                    
    
                    try{
    
                        console.log("accessToken Aquired", accessToken);
                        const userResponse = await axios.get('https://graph.microsoft.com/v1.0/me', headers);
                    
                        const userData = userResponse.data;
                        console.log("userData Aquired", userData);
                        const userEmail = userData.mail || userData.userPrincipalName;
                        console.log("useremail Aquired", userEmail);
                        const user = req.session.account?.username;
                        console.log("trail to get user details " );
                      }
                      catch(error){
                        next(error, "hello this is an error");
                        console.log("error occured" , error);
                      }
                })
                


                
                

               
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