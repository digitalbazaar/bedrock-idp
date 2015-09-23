/*
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var bedrock = GLOBAL.bedrock;
var should = GLOBAL.should;
var describe = GLOBAL.describe;
var it = GLOBAL.it;

describe('Navbar', function() {
  var loginCredentials = {
    sysIdentifier: 'testuser',
    passphrase: 'password'
  };

  describe('Session Management', function() {

    afterEach(function() {
      bedrock.pages.navbar.logout();
    });

    it('should allow a valid slug login', function() {
      bedrock.pages.home.get();
      bedrock.pages.navbar.login(loginCredentials);
    });

    it('should allow a valid email login', function() {
      bedrock.pages.home.get();
      loginCredentials.slug = loginCredentials.sysIdentifier;
      loginCredentials.sysIdentifier =
        loginCredentials.sysIdentifier + '@bedrock.dev';
      bedrock.pages.navbar.login(loginCredentials);
    });

  });

  describe('Invalid Logins', function() {
    it('should display error on bad password', function() {
      bedrock.pages.home.get();
      bedrock.pages.navbar.loginExpectFail({
        sysIdentifier: loginCredentials.sysIdentifier,
        passphrase: 'someWrongPassword1234'
      });
    });
  });
});
