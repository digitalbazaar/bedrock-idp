var bedrock = GLOBAL.bedrock;
var expect = GLOBAL.expect;
var should = GLOBAL.should;
var describe = GLOBAL.describe;
var it = GLOBAL.it;
var uuid = require('node-uuid');

describe('IdP join form', function() {
  var identity = {};
  identity.sysIdentifier = bedrock.randomString().toLowerCase();
  identity.id =
    bedrock.baseUrl + bedrock.config.identityBasePath + identity.sysIdentifier;
  identity.label = identity.sysIdentifier;
  identity.email = identity.sysIdentifier + '@bedrock.dev';
  identity.password = 'password';
  var loginCredentials = {
    sysIdentifier: identity.sysIdentifier,
    passphrase: identity.password
  };
  var threeCharacters = 'abc';
  var fortyCharacters = 'yA2NdBthMcnTqGYz3Eqe9uNHxM8u00TaooiuhIM';

  beforeEach(function() {
    bedrock.pages.join.get();
  });

  it('should contain the proper fields', function() {
    bedrock.pages.join.checkFields();
  });

  it('should accept a valid form', function() {
    bedrock.pages.join.createIdentity(identity);
  });

  // FIXME: write test for the various email related conditions
  it('should warn on invalid email');

  it('should warn on a short password', function() {
    bedrock.pages.join.testField(
      'model.identity.sysPassword', threeCharacters, 'minlength');
  });

  it('should warn on a long password', function() {
    bedrock.pages.join.testField(
      'model.identity.sysPassword', fortyCharacters, 'maxlength');
  });

  it('should warn if password confirmation does not match', function() {
    bedrock.pages.join.testFieldsMatch(
      'model.identity.sysPassword', 'model.passphraseConfirmation',
      'goodPhraseA', 'nonMatchingPhraseB', 'inputMatch');
  });

});

describe('Navbar session management', function() {
  var loginCredentials = {
    sysIdentifier: 'testuser',
    passphrase: 'password'
  };

  after(function() {
    bedrock.pages.navbar.logout();
  });

  it('should allow a valid slug login', function() {
    bedrock.pages.home.get();
    bedrock.pages.navbar.login(loginCredentials);
    bedrock.pages.navbar.logout();
  });

  it('should allow a valid email login', function() {
    bedrock.pages.home.get();
    loginCredentials.slug = loginCredentials.sysIdentifier;
    loginCredentials.sysIdentifier =
      loginCredentials.sysIdentifier + '@bedrock.dev';
    bedrock.pages.navbar.login(loginCredentials);
    bedrock.pages.navbar.logout();
  });

  it('should display error on bad password', function() {
    bedrock.pages.home.get();
    bedrock.pages.navbar.loginExpectFail({
      sysIdentifier: loginCredentials.sysIdentifier,
      passphrase: 'someWrongPassword1234'
    });
  });
});

describe('credentials', function() {
  var loginCredentials = {
    sysIdentifier: 'testuser',
    passphrase: 'password'
  };

  before(function() {
    bedrock.pages.home.get();
    bedrock.pages.navbar.login(loginCredentials);
  });

  after(function() {
    bedrock.pages.navbar.logout();
  });

  it('should display existing credentials', function() {
    bedrock.pages.idp.viewCredentials();
  });
});

describe('credential operations', function() {
  var loginCredentials = {
    sysIdentifier: 'testuser',
    passphrase: 'password'
  };

  before(function() {
    bedrock.pages.home.get();
    bedrock.pages.navbar.login(loginCredentials);
  });

  after(function() {
    bedrock.pages.navbar.logout();
  });

  it('should accept a credential query', function() {
    bedrock.pages.idp.submitCredentialQuery();
  });

  it('should accept a credential storage requests', function() {
    bedrock.pages.idp.submitCredentialStorage(generateCredential());
  });

  it('should error on duplicate credential storage requests', function() {
    var credential = generateCredential();
    bedrock.pages.home.get();
    bedrock.pages.idp.submitCredentialStorage(credential);
    bedrock.pages.home.get();
    bedrock.pages.idp.submitDuplicateCredentialStorage(credential);
  });

});

function generateCredential() {
  var mockCredential = {
    "@context": [
      "https://w3id.org/identity/v1",
      "https://w3id.org/credentials/v1",
      {
        "br": "urn:bedrock:"
      }
    ],
    "id": "did:27129b93-1188-4ef7-a5f2-519a98a5ca54",
    "credential": [{
      "@graph": {
        "@context": "https://w3id.org/credentials/v1",
        "id": "https://example.com/credentials/" + uuid.v4(),
        "type": [
          "Credential",
          "br:test:EmailCredential"
        ],
        "name": "Test 1: Work Email",
        "issued": "2015-01-01T01:02:03Z",
        "issuer": "did:3c188385-d415-4ffc-ade9-32940f28c5a1",
        "claim": {
          "id": "did:27129b93-1188-4ef7-a5f2-519a98a5ca54",
          "email": "individual@examplebusiness.com"
        },
        "signature": {
          "type": "GraphSignature2012",
          "created": "2015-01-01T01:02:03Z",
          "creator": "https://example.com/i/demo/keys/1",
          "signatureValue": "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz01234567890ABCDEFGHIJKLM=="
        }
      }
    }]
  };
  return mockCredential;
};