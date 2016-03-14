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
const Icon = require('react-native-vector-icons/FontAwesome');

export default class LILoginMock extends Component {
  constructor(props) {
    super(props);

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
    LinkedinLoginApi.login().then((data) => {
      if (!this.willUnmountSoon) this.setState({ credentials : data.credentials });
    }).catch((err) => {
      if (!this.willUnmountSoon) this.setState({ credentials : null });
    })
  }

  handleLogout(){
    LinkedinLoginApi.logout().then((data) => {
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
    Object.keys(LinkedinLoginApi.Events).forEach((eventType) => {
      let sub = DeviceEventEmitter.addListener( LinkedinLoginApi.Events[eventType], this.invokeHandler.bind(this, eventType) );
      subscriptions.push(sub);
    });

    // Add listeners to state
    this.setState({ subscriptions : subscriptions });
  }

  unSubscribeEvents(subscription) {
    subscription.remove();
  }

  componentWillUnmount() {
    this.willUnmountSoon = true;
    this.state.subscriptions.forEach(this.unSubscribeEvents);

  }

  componentDidMount() {
    LinkedinLoginApi.init(this.props.appDetails).then(() => {
      LinkedinLoginApi.getCredentials().then((data)=>{
        this.setState({ credentials : data.credentials });
      }).catch((err) =>{
        this.setState({ credentials : null });
        console.log('Request failed: ', err);
      });
    });

  }

  render() {
    const loginText = this.props.loginText || "Log in with Linkedin";
    const logoutText = this.props.logoutText || "Log out";
    const text = this.state.credentials ? logoutText : loginText;
    const styles = this.state.styles;

    return (
    <View style={styles.LILoginMock}>
      <TouchableHighlight
        style={styles.LILoginMockButtonContainer}
        onPress={() => { this.onPress(); }}
      >
        <View style={styles.LILoginMockButton}>
          <Icon name="linkedin" size={16}  color="#fff" style={styles.LILoginMockLogo}/>
          <Text style={[styles.LILoginMockButtonText, this.state.credentials ? styles.LILoginMockButtonTextLoggedIn : styles.LILoginMockButtonTextLoggedOut]}
                numberOfLines={1}>{text}</Text>
        </View>
      </TouchableHighlight>
    </View>
    );
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
LILoginMock.propTypes = {
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