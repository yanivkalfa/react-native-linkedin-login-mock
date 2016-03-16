import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  LILMButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems:'center',

    height: 30,
    width: 175,
    paddingLeft: 2,

    backgroundColor: '#0059b3',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#0B5FB5',

    shadowColor: "#000000",
    shadowOpacity: 0.8,
    shadowRadius: 2,
    shadowOffset: {
      height: 1,
      width: 0
    }
  },
  LILMButtonContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems:'center'
  },
  LILMIconWrap:{
    flex:1
  },
  LILMIcon: {
    fontSize:14,
    color:'white'
  },
  LILMTextWrap:{
    flex:2,
    alignItems:'center'
  },
  LILMText: {
    color: 'white',
    fontWeight: '600',
    fontFamily: 'Helvetica neue',
    fontSize: 14
  },
  LILMTextLoggedIn: {
    marginLeft: 5
  },
  LILMTextLoggedOut: {
    marginLeft: 18
  }
});