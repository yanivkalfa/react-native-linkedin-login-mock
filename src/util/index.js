import React, { DeviceEventEmitter, NativeModules } from 'react-native';
import store from 'react-native-simple-store';
const { LinkedinLogin } = NativeModules;

const LOGIN_FAILED = 'Login Failed.';
const NO_ACCESS_TOKEN = 'No access token was found, Login first';
const No_PROFILE = 'No profile found';
const NO_PROFILE_IMAGE = 'Profile has no images';
const REQUIRED_FIELD_MISSING = 'A required field is missing.';

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
   * @param  {string} clientId        [description]
   * @param  {string} redirectUrl     [description]
   * @param  {string} clientSecret    [description]
   * @param  {string} state           [description]
   * @param  {Array} scopes           [description]
   * @return {object} promise         [description]
   */
  init: async function({ clientId, redirectUrl, clientSecret, state, scopes }){
    if (!redirectUrl || !clientId || !clientSecret || !state) throw new Error(REQUIRED_FIELD_MISSING);
    this.clientId = clientId;
    this.redirectUrl = redirectUrl;
    this.clientSecret = clientSecret;
    this.state = state;
    this.scopes = scopes;
    await this.restoreToken();
  },

  saveToken: async function(tokenDetails){
    this.accessTokenDetails = tokenDetails;
    await store.save(this.storeKey, tokenDetails);
  },
  restoreToken: async function(){
    this.accessTokenDetails = await store.get(this.storeKey);
    return this.accessTokenDetails;
  },
  removeToken: async function(){
    this.accessTokenDetails = null;
    await store.delete(this.storeKey);
  },


  /**
   * Gets the Profile image
   * @return {object} Returns the promise with the image
   */
  async getProfileImages() {
    const picstr = 'https://api.linkedin.com/v1/people/~/picture-urls::(original)';
    const picstrWithAuth = picstr + '?oauth2_access_token=' + this.accessTokenDetails.accessToken + '&format=json';
    const resp = await fetch(picstrWithAuth);
    const data = JSON.parse(resp._bodyText) || false;
    if (!data || !data.values && !data.values.length) throw new Error(NO_PROFILE_IMAGE);
    return data.values;
  },

  /**
   * Gets the user profile
   * @return {object} Returns a promise with the user object or error
   */
  async getProfile() {
    const profilestr = 'https://api.linkedin.com/v1/people/~:(id,first-name,last-name,industry,email-address)';
    const profilestrWithAuth = profilestr + '?oauth2_access_token=' + this.accessTokenDetails.accessToken + '&format=json';
    const resp = await fetch(profilestrWithAuth);
    const data = JSON.parse(resp._bodyText) || false;
    if (!data) throw new Error(No_PROFILE);
    return data;
  },

  /**
   *
   */
  async getCredentials(){
    if (!this.accessTokenDetails) throw new Error(NO_ACCESS_TOKEN);
    return await this.getProfile();
  },

  loginAsync(){
    return new Promise((resolve, reject)=>{
      LinkedinLogin.login(this.clientId, this.redirectUrl, this.clientSecret, this.state, this.scopes, (err, resp) => {
        return (err) ? reject(new Error(err)) : resolve(resp);
      })
    });
  },

  /**
   * Logs the user in
   * @return {promise} returns whether or not the user logged in successfully
   */
  login: async function() {
    const accessTokenDetails = await this.loginAsync( this.clientId, this.redirectUrl, this.clientSecret, this.state, this.scopes).catch(()=>{
      this.removeToken();
      return false;
    });
    if (!accessTokenDetails || !await this.saveToken(accessTokenDetails)) throw new Error(LOGIN_FAILED);
  },

  logout: async function() {
    await this.removeToken()
  }

}