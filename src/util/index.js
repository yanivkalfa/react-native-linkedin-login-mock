import React, { Platform, DeviceEventEmitter, NativeModules } from 'react-native';
import Promise from 'bluebird';
import Promisify from 'tiny-promisify';
import store from 'react-native-simple-store';
const { LinkedinLogin } = NativeModules;


const loginAsync = Promisify(LinkedinLogin.login);

export default {

  Events:  {
    Login: 'linkedinLogin',
    LoginError: 'linkedinLoginError',
    RequestSucess: 'linkedinGetRequest',
    RequestError: 'linkedinGetRequestError'
  },

  storeKey: '@liAccessToken',

  /**
   * Initializes the LinkedinLogin API
   * @param  {string} redirectUrl     [description]
   * @param  {string} clientId        [description]
   * @param  {string} clientSecret    [description]
   * @param  {string} state           [description]
   * @param  {Array} scopes           [description]
   * @return {object} promise         [description]
   */
  init: async function({ redirectUrl, clientId, clientSecret, state, scopes }){
    this.redirectUrl = redirectUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.state = state;
    this.scopes = scopes;
    await this.restoreToken();
  },

  saveToken: async function(token){
    await store.save(this.storeKey, this.accessToken);
  },
  restoreToken: async function(){
    this.accessToken = await store.get(this.storeKey);
    return this.accessToken;
  },
  removeToken: async function(){
    this.accessToken = null;
    await store.delete(this.storeKey);
  },


  /**
   * Gets the Profile image
   * @return {object} Returns the promise with the image
   */
  getProfileImages() {
    return new Promise(function(resolve, reject) {

      DeviceEventEmitter.addListener('linkedinGetRequest', (d) => {

        const data = JSON.parse(d.data);

        if (data.values) {
          resolve(data.values);
        } else {
          reject('No profile image found');
        }

      });

      DeviceEventEmitter.addListener('linkedinGetRequestError', (error) => {
        reject(error);
      });

      var picstr = 'https://api.linkedin.com/v1/people/~/picture-urls::(original)';
      var picstrWithAuth = picstr + '?oauth2_access_token=' + this.accessToken + '&format=json';

      if (Platform.OS === 'android') {
        LinkedinLogin.getRequest(picstr);
      } else {
        // if ios
        console.log('picstrWithAuth', picstrWithAuth);
        fetch(picstrWithAuth).then((dta) => {
          console.log('fetched profile image', dta);

          var data = JSON.parse(dta._bodyText);

          if (data.values && data.values.length > 0) {
            resolve(data.values);
          }
          else {
            reject('Profile has no images');
          }

        });
      }

    });
  },

  /**
   * Gets the user profile
   * @return {object} Returns a promise with the user object or error
   */
  getProfile() {
    return new Promise(function(resolve, reject) {

      DeviceEventEmitter.addListener('linkedinGetRequest', (d) => {

        const data = JSON.parse(d.data);

        if (data.emailAddress)
        {
          resolve(data);
        }

      });


      DeviceEventEmitter.addListener('linkedinGetRequestError', (error) => {
        reject(error);
      });

      var profilestr = 'https://api.linkedin.com/v1/people/~:(id,first-name,last-name,industry,email-address)';
      var profilestrWithAuth = profilestr + '?oauth2_access_token=' + this.accessToken + '&format=json';
      console.log(profilestrWithAuth);
      if (Platform.OS === 'android') {
        LinkedinLogin.getRequest(profilestr);
      } else {

        fetch(profilestrWithAuth).then((dta) => {

          var data = JSON.parse(dta._bodyText);

          if (data) {
            resolve(data);
          }
          else {
            reject('No profile found');
          }

        });
      }

    });
  },

  /**
   * Sets the Linkedin session
   * @param  {string} accessToken Linkedin access token
   * @param  {Number} expiresOn   The access token's expiration number
   * @return {object} promise     Returns if access token is valid or not
   */
  setSession(accessToken, expiresOn) {

    this.accessToken = accessToken;
    this.expiresOn = expiresOn;

    return new Promise(function (resolve, reject) {
      //TODO: need to send an error if the token isn't valid
      resolve({success: true});


    });
  },

  /**
   *
   */
  getCredentials(){
    return true
  },

  /**
   * Logs the user in
   * @return {promise} returns whether or not the user logged in successfully
   */
  login: async function() {
    return await loginAsync(
      this.clientId,
      this.redirectUrl,
      this.clientSecret,
      this.state,
      this.scopes
    );

  },

  logout: async function() {
    this.accessToken = null;
  }

}