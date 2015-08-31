var bedrock = GLOBAL.bedrock;
var expect = GLOBAL.expect;
var should = GLOBAL.should;
var describe = GLOBAL.describe;
var it = GLOBAL.it;

// variables used throughout the tests
var baseId = bedrock.randomString().toLowerCase();
var identity = {};
// identity.email = baseId + '@example.com';
identity.email = 'testuser';
identity.passphrase = 'password';

describe('session management', function() {
  /*
  it('should reject an invalid email for login', function() {
    bedrock.pages.authio.navigateToLoginForm();
    bedrock.pages.authio.login({
      email: 'invalid-email@example.com',
      passphrase: identity.passphrase,
      expectFailure: true
    });
  });

  it('should reject an invalid password for login', function() {
    bedrock.pages.authio.navigateToLoginForm();
    bedrock.pages.authio.login({
      email: identity.email,
      passphrase: 'invalid-passphrase',
      expectFailure: true
    });
  });

  it('should allow a valid login from a public computer', function() {
    bedrock.pages.authio.navigateToLoginForm();
    this.timeout(180000);
    bedrock.pages.authio.login({
      email: identity.email,
      passphrase: identity.passphrase,
      publicComputer: true
    });
    bedrock.pages.authio.logout();
  });
  */
  it('should allow a valid login', function() {
    bedrock.pages.idp.navigateToHomePage();
    bedrock.pages.idp.login({
      email: identity.email,
      passphrase: identity.passphrase
    });
    bedrock.pages.idp.logout();
  });

  it('should display error on bad password', function() {
    bedrock.pages.idp.navigateToHomePage();
    bedrock.pages.idp.loginExpectFail({
      email: identity.email,
      passphrase: 'someWrongPassword1234'
    });
    bedrock.pages.idp.logout();
  });
});

describe('credentials', function() {
  it('should display existing credentials', function() {
    bedrock.pages.idp.navigateToHomePage();
    bedrock.pages.idp.login({
      email: identity.email,
      passphrase: identity.passphrase
    });
    bedrock.pages.idp.viewCredentials();
  });
});

describe('credential operations', function() {

  it.only('should accept a credential query', function() {
    bedrock.pages.idp.navigateToHomePage();
    bedrock.pages.idp.login({
      email: identity.email,
      passphrase: identity.passphrase
    });
    bedrock.pages.idp.submitCredentialQuery();
  });

});
