import React, {
  Component,
  View,
  StyleSheet,
  Text,
  TouchableHighlight,
  PropTypes,
  NativeModules,
  DeviceEventEmitter
} from 'react-native';

import { login, logout, getCredentials, liEvents} from './util';
import styles from './theme/style';
const Icon = require('react-native-vector-icons/FontAwesome');

export default class LILoginMock extends Component {
  constructor(props) {
    super(props);

    this.willUnmountSoon = false;

    this.state = {
      credentials: null,
      subscriptions: []
    };
  }

  handleLogin(){
    login(this.props.appDetails).then((data) => {
      if (!this.willUnmountSoon) this.setState({ credentials : data });
    }).catch((err) => {
      if (!this.willUnmountSoon) this.setState({ credentials : null });
    })
  }

  handleLogout(){
    logout().then((data) => {
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
    Object.keys(liEvents).forEach((eventType) => {
      let sub = DeviceEventEmitter.addListener( liEvents[eventType], this.invokeHandler.bind(this, eventType) );
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
    getCredentials().then((data)=>{
      this.setState({ credentials : data });
    }).catch((err) =>{
      this.setState({ credentials : null });
      console.log('Request failed: ', err);
    });
  }

  prepareStyle(){
    const { style ={} } = this.props;
    const LILMText = style.LILMText || styles.LILMText;
    const LILMTextLoggedIn = style.LILMTextLoggedIn || styles.LILMTextLoggedIn;
    const LILMTextLoggedOut = style.LILMTextLoggedOut || styles.LILMTextLoggedOut;

    return {
      LILMButton: style.LILMButton || styles.LILMButton,
      LILMButtonContent: style.LILMButtonContent || styles.LILMButtonContent,
      LILMIconWrap: style.LILMIconWrap || styles.LILMIconWrap,
      LILMIcon: style.LILMIcon || styles.LILMIcon,
      LILMTextWrap: style.LILMTextWrap || styles.LILMTextWrap,
      LILMText: [LILMText, this.state.credentials ? LILMTextLoggedIn : LILMTextLoggedOut],
    }
  }

  render() {
    const { loginText = "Log in with Linkedin", logoutText = "Log out"} = this.props;
    const text = this.state.credentials ? logoutText : loginText;
    const { LILMButton, LILMButtonContent, LILMIconWrap, LILMIcon, LILMTextWrap, LILMText} = this.prepareStyle();
    return (
      <TouchableHighlight style={ LILMButton } onPress={this.onPress.bind(this)}>
        <View style={LILMButtonContent}>
          <View style={ LILMIconWrap }>
            <Icon name="linkedin" style={ LILMIcon }/>
          </View>
          <View style={ LILMTextWrap }>
            <Text style={ LILMText } numberOfLines={1}>{text}</Text>
          </View>
          <View style={ LILMIconWrap }></View>
        </View>
      </TouchableHighlight>
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