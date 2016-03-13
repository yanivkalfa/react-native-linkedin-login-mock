import React, {
  Component,
  View,
  StyleSheet,
  Text,
  Image,
  TouchableHighlight,
  PropTypes,
  NativeModules,
  DeviceEventEmitter
} from 'react-native';

import extend from 'extend';

import LinkedinLoginApi from './util';
import defaultStyles from './theme/style';

export default class LinkedinLoginMock extends Component {
  constructor(props) {
    super(props);

    // instantiating api.
    this.LinkedinLoginApi = new LinkedinLoginApi(this.props.appDetails);

    this.willUnmountSoon = false;

    // extending default styles with provided styles.
    const extendedStyles = extend(true, {}, defaultStyles, this.props.styleOverride);

    this.state = {
      credentials: null,
      subscriptions: [],
      styles: StyleSheet.create(extendedStyles)
    };
  }

  handleLogin(){
    this.LinkedinLoginApi.login().then((data) => {
      if (!this.willUnmountSoon) this.setState({ credentials : data.credentials });
    }).catch((err) => {
      if (!this.willUnmountSoon) this.setState({ credentials : null });
    })
  }

  handleLogout(){
    this.LinkedinLoginApi.logout().then((data) => {
      if (!this.willUnmountSoon) this.setState({ credentials : null });
    }).catch((err) => {
      console.warn(err);
    })
  }

  onPress() {
    this.state.credentials
      ? this.handleLogout()
      : this.handleLogin();

    this.props.onPress && this.props.onPress();
  }

  invokeHandler(eventType, eventData) {
    const eventHandler = this.props["on" + eventType];
    if (typeof eventHandler === 'function') eventHandler(eventData);
  }

  componentWillMount() {
    this.willUnmountSoon = false;

    const subscriptions = this.state.subscriptions;
    Object.keys(this.LinkedinLoginApi.Events).forEach((eventType) => {
      let sub = DeviceEventEmitter.addListener( this.LinkedinLoginApi.Events[eventType], this.invokeHandler.bind(this, eventType) );
      subscriptions.push(sub);
    });

    // Add listeners to state
    this.setState({ subscriptions : subscriptions });
  }

  unSubscribeEvents(subscription) {
    subscription.remove();
  }

  componentWillUnmount() {
    this.LinkedinLoginApi = null;
    this.willUnmountSoon = true;
    this.state.subscriptions.forEach(this.unSubscribeEvents);

  }

  componentDidMount() {
    this.LinkedinLoginApi.getCredentials().then((data)=>{
      this.setState({ credentials : data.credentials });
    }).catch((err) =>{
      this.setState({ credentials : null });
      console.log('Request failed: ', err);
    });

  }

  render() {
    const loginText = this.props.loginText || "Log in with Linkedin";
    const logoutText = this.props.logoutText || "Log out";
    const text = this.state.credentials ? logoutText : loginText;
    const styles = this.state.styles;

    return (
      <View style={styles.FBLoginMock}>
        <Icon.Button name="linkedin" backgroundColor="#0059b3" onPress={() => {this.onPress(); }}>
          <Text style={[styles.FBLoginMockButtonText, this.state.credentials ? styles.FBLoginMockButtonTextLoggedIn : styles.FBLoginMockButtonTextLoggedOut]}
                numberOfLines={1}>{text}</Text>
        </Icon.Button>
      </View>
    );

    /*
    if (!this.state.user) {
      return (
        <View style={styles.container}>
          <Icon.Button name="linkedin" backgroundColor="#0059b3" onPress={() => {this.onPress(); }}>
            <Text style={[styles.FBLoginMockButtonText, this.state.credentials ? styles.FBLoginMockButtonTextLoggedIn : styles.FBLoginMockButtonTextLoggedOut]}
                  numberOfLines={1}>{text}</Text>
          </Icon.Button>
        </View>
      );
    }


    if (this.state.user) {
      var lastNameComp = (this.state.user.lastName) ? <Text style={{fontSize: 18, fontWeight: 'bold', marginBottom: 20}}>Welcome {this.state.user.firstName + " " + this.state.user.lastName}</Text> : <View/>;
      var emailAddressComp = (this.state.user.emailAddress) ? <Text>Your email is: {this.state.user.emailAddress}</Text> : <View/>;
      var imageComp = (this.state.user.images) ? <Image source={{ uri: this.state.user.images[0].toString() }} style={{ width: 100, height: 100 }} /> : <View/>;
      var expiresOnComp = (this.state.user.expiresOn) ? <Text>Your token expires in: {this.state.user.expiresOn.toFixed()}</Text> : <View/>;

      return (
        <View style={styles.container}>
          { lastNameComp }
          { emailAddressComp }
          { expiresOnComp }
          { imageComp }

          <TouchableOpacity onPress={() => {this._logout(); }}>
            <View style={{marginTop: 50}}>
              <Text>Log out</Text>
            </View>
          </TouchableOpacity>


        </View>
      );
    }
    */


  }
}

/**
 *
 *  appDetails: {
 *    redirectUrl, // optional
 *    clientId, // client id
 *    clientSecret, // client secret
 *    state, // some unique string that is hard to guess
 *    scopes // an array of permissions / scores your app will request access to.
 *  }
 *
 */

FBLoginMock.propTypes = {
  styleOverride: PropTypes.object,
  appDetails: PropTypes.object,
  loginText: PropTypes.string,
  logoutText: PropTypes.string,
  onPress: PropTypes.func,
  onLogin: PropTypes.func,
  onLoginError: PropTypes.func,
  onRequestSucess: PropTypes.func,
  onRequestError: PropTypes.func
};