/*
import promisify from 'tiny-promisify';
import { NativeModules } from 'react-native';
const { FBLoginManager } = NativeModules;

const getCredentialsAsync = promisify(FBLoginManager.getCredentials);
const loginWithPermissionsAsync = promisify(FBLoginManager.loginWithPermissions);
const loginAsync = promisify(FBLoginManager.login);
const logoutAsync = promisify(FBLoginManager.logout);

export async function getFBCredentials() {
  return await getCredentialsAsync();
}

export async function loginWithPermissions(permissions = []) {
  return await loginWithPermissionsAsync(permissions);
}

export async function loginWithoutPermissions() {
  return await loginAsync();
}

export async function logout() {
  return await logoutAsync();
}

export async function login(permissions = false) {
  return (permissions) ? await loginWithPermissions(permissions) : await loginWithoutPermissions();
}
*/
import React, { Platform, DeviceEventEmitter, NativeModules } from 'react-native';
import Promise from 'bluebird';
import Promisify from 'tiny-promisify';
const { LinkedinLogin } = NativeModules;


export default class LinkedinLoginApi {

  /**
   * Initializes the LinkedinLogin API
   * @param  {string} redirectUrl     [description]
   * @param  {string} clientId        [description]
   * @param  {string} clientSecret    [description]
   * @param  {string} state           [description]
   * @param  {Array} scopes           [description]
   * @return {object} promise         [description]
   */
  constructor({ redirectUrl, clientId, clientSecret, state, scopes }){
    this.redirectUrl = redirectUrl;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.state = state;
    this.scopes = scopes;
    this.Events = {
      Login: 'linkedinLogin',
      LoginError: 'linkedinLoginError',
      RequestSucess: 'linkedinGetRequest',
      RequestError: 'linkedinGetRequestError',
    }
  }

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
  }

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
  }

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
  }

  /**
   *
   */
  async getCredentials(){
    return true
  }

  /**
   * Logs the user in
   * @return {promise} returns whether or not the user logged in successfully
   */
  login() {
    return new Promise(function(resolve, reject) {

      DeviceEventEmitter.addListener('linkedinLoginError', (error) => {
        reject(error);
      });

      DeviceEventEmitter.addListener('linkedinLogin', (data) => {
        this.accessToken = data.accessToken;
        this.expiresOn = data.expiresOn;

        resolve(data);
      });

      LinkedinLogin.login(
        this.clientId,
        this.redirectUrl,
        this.clientSecret,
        this.state,
        this.scopes
      );

    });


  }

  logout() {
    return new Promise((resolve, reject) => {
      this.accessToken = null;
      resolve(true);

    });
  }

}