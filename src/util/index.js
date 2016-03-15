import React, { DeviceEventEmitter, NativeModules } from 'react-native';
import promisify from 'tiny-promisify';
const { LinkedinLogin } = NativeModules;
const REQUIRED_FIELD_MISSING = 'A required field is missing.';

const loginAsync = promisify(LinkedinLogin.login);

export const liEvents = {
  Login: 'linkedinLogin',
  LoginError: 'linkedinLoginError',
  RequestSucess: 'linkedinGetRequest',
  RequestError: 'linkedinGetRequestError'
};

export const logout = promisify(LinkedinLogin.logout);
export const getCredentials = promisify(LinkedinLogin.getCredentials);
export const getProfileImages = promisify(LinkedinLogin.getProfileImages);

export async function login({ clientId, redirectUrl, clientSecret, state, scopes }) {
  if (!clientId || !redirectUrl || !clientSecret || !state) throw new Error(REQUIRED_FIELD_MISSING);
  await loginAsync( clientId, redirectUrl, clientSecret, state, scopes);
  return await getCredentials();
}