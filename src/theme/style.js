export default {
  LILoginMock: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  LILoginMockButtonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  LILoginMockButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

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
  LILoginMockButtonText: {
    color: 'white',
    fontWeight: '600',
    fontFamily: 'Helvetica neue',
    fontSize: 14.2
  },
  LILoginMockButtonTextLoggedIn: {
    marginLeft: 5
  },
  LILoginMockButtonTextLoggedOut: {
    marginLeft: 18
  },
  LILoginMockLogo: {
    position: 'absolute',
    left: 7,
    top: 7
  }
}