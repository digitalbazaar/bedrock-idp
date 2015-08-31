/*
 * Bedrock IDP Module Configuration
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */

var config = require('bedrock').config;
var path = require('path');
require('bedrock-protractor');

// mongodb config
config.mongodb.name = 'bedrock_idp_test';
config.mongodb.host = 'localhost';
config.mongodb.port = 27017;
config.mongodb.local.collection = 'bedrock_idp_test';
// drop all collections on initialization
config.mongodb.dropCollections = {};
config.mongodb.dropCollections.onInit = true;
config.mongodb.dropCollections.collections = [];

// add protractor tests
var protractor = config.protractor.config;
protractor.suites.authorizationio = path.join(
  __dirname, '..', 'tests', 'protractor', 'tests', '**', '*.js');
var prepare = path.join(__dirname, '..', 'tests', 'protractor', 'prepare.js');
protractor.params.config.onPrepare.push(prepare);

var baseIdPath = config.server.baseUri + config.idp.identityBasePath;

// tests
config.mocha.tests.push(path.join(__dirname, '..', 'tests/mocha'));

config.idp.test = {};
config.idp.test.mock = {};
config.idp.test.mock.credential = {
  "@context": "https://w3id.org/identity/v1",
  "id": "did:7bc19e31-ff42-41f1-b46c-eeaa0633ac8f",
  "type": "Identity",
  "credential": [
    {
      "@graph": {
        "@context": "https://w3id.org/identity/v1",
        "type": [
          "Credential",
          "EmailCredential"
        ],
        "claim": {
          "id": "did:7bc19e31-ff42-41f1-b46c-eeaa0633ac8f",
          "email": "test@7bc19e31-ff42-41f1-b46c-eeaa0633ac8f.example.com"
        },
        "signature": {
          "type": "GraphSignature2012",
          "created": "2015-08-11T01:21:56Z",
          "creator": "https://authorization.io/idp/keys/1",
          "signatureValue": "gQAMWF72HDK7l7xcxBW7SCCNZxI+T2RlBZjcVA40822N2Es1VJ4lLc5rcR1JefY8KvllqA5mBV4s0MeoRzuFKQ=="
        }
      }
    },
    {
      "@graph": {
        "@context": "https://w3id.org/identity/v1",
        "type": [
          "Credential",
          "EmailCredential"
        ],
        "claim": {
          "id": "did:7bc19e31-ff42-41f1-b46c-eeaa0633ac8f",
          "email": "test@7bc19e31-ff42-41f1-b46c-eeaa0633ac8f.example.org"
        },
        "signature": {
          "type": "GraphSignature2012",
          "created": "2015-08-11T01:21:56Z",
          "creator": "https://authorization.io/idp/keys/1",
          "signatureValue": "LDVGX3f3d1+I14UWjwn+H6rLZO7nA4pj8kKgmcphGnahfhdylsUi+JaROUba7N+gRNw/ykWS9hKVwO/bLvvXjg=="
        }
      }
    },
    {
      "@graph": {
        "@context": "https://w3id.org/identity/v1",
        "type": [
          "Credential",
          "CryptographicKeyCredential"
        ],
        "claim": {
          "id": "did:7bc19e31-ff42-41f1-b46c-eeaa0633ac8f",
          "publicKey": {
            "publicKeyPem": "-----BEGIN PUBLIC KEY-----\r\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2hLMl9F4GGx/8CFhtBsc\r\n7oITCDMFZxvKtMl0ue1YGle7L1/3vY9wab2Tsi42IncfFPLR2BHQkmsdnVQLvAcd\r\nDgduDcrwCvQDzOu3s+46HrA302z7gFAaJ2joaYjtGppiIv7Izuvs4RComlwLh1eV\r\nqgDsL4DYRB7RsHjXazRJfEP86nTl7fxtSxj4hP4bWokbWFIM1NUSrdXaSgfbRyiw\r\nXfulgPFC6CtRELFswGjOGdK0X2jlTaUV2+/zhTeweIdlXgidOJdDzq07r0ds+ybV\r\nPtHv/ie+g5ht/+oezUGUZY51S2c/3te0DMgNEqmYSN/GU3VecbhS8JaOpmhnxAUc\r\nbwIDAQAB\r\n-----END PUBLIC KEY-----\r\n",
            "id": "did:7bc19e31-ff42-41f1-b46c-eeaa0633ac8f/keys/1"
          }
        },
        "signature": {
          "type": "GraphSignature2012",
          "created": "2015-08-11T01:22:05Z",
          "creator": "https://authorization.io/idp/keys/1",
          "signatureValue": "nlOAEnxu/4YpcoX64DIA/FFZiJ6YvsnHwRq0KIcytcqHfGpkd4QEHY/Fy3Gu1lgFmkr7Pb9+54PFO7vUo+81/Q=="
        }
      }
    }
  ]
};

// test account
config.idp.test.testUser = 'testuser';

config.idp.identities.push(createIdentity(config.idp.test.testUser));

var testKeyPair = createKeyPair({
  userName: config.idp.test.testUser,
  publicKey: '-----BEGIN PUBLIC KEY-----\n' +
    'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAxBTbcgMr6WY74XoUkXBg\n' +
    'n+0PUP2XE4fbcvALoBSBIlMcWep8TUl4/BGM2FBwbgeEgp9ZRJ8dObiK+ZqQjFOh\n' +
    'Gfj0PYP3Xb0c5Djrm0qmC8NRgVO4h2QNEX3Keps1bC6+S096n5XS9qiRsMfr4vN5\n' +
    'ohV9svSP9mmRs+iEs3UBWJl6uoMpkopCxViI1GhhYGjCoB+MGnVJbgEwPjA4POAm\n' +
    'WyMm76tSx0vpI0HLFdN0S9tghrl4jkAzFaBILMfoakx/LpFOiAApivM7HF6YeDZT\n' +
    'MOk6wVYMbbd1jiiy4PLj+nKl96K7RMU+RQZekAZ6Y2FU7wrAbOVBwaXaaRUTVIrN\n' +
    'hOCl7ihXo4w348rVNmDT0pejbSx2QbOY/X7NfUePIkOpyekRChGCrQL3KIicpKCA\n' +
    'bJG83U4niPsynBI3Y/zWvDgs8R/FxEc/UdlBB6Mr9jAeOhbY5vhH1E5dyThJD9Px\n' +
    'pmlY2PuzeAUscsfoXzxHRo2CLzanbvKJKXxMpMVl9lPyvVQHAevVZJO+kJf+Mpzw\n' +
    'Q5X4x/THt7NpSLDjpTsISQGc+0X3DhKvYzcW0iW/bDc9IqXuCPGqa/xf7XhNRLzg\n' +
    '41J2uX0nX9yWwl1opexN3dCxCsYNKTqBTq3uY1aK6WnWWXWt4t8G42A3bKv/7Ncu\n' +
    '9jEBOHnbHLXdQPk+q6wFNfECAwEAAQ==\n' +
    '-----END PUBLIC KEY-----\n',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\n' +
    '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\n' +
    '-----END RSA PRIVATE KEY-----\n'
});

config.idp.keys.push(testKeyPair);

config.idp.test.publicKeys = [];
config.idp.test.publicKeys.push({
  '@context': 'https://w3id.org/identity/v1',
  label: 'SomeKeyLabel0',
  publicKeyPem: '-----BEGIN PUBLIC KEY-----\n' +
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwWDnqsCB2eYSGicntVHU\n' +
    '1nqzBdlInoLkNzrjp5nd7b57kZQwJteYtlnjVa4WD39iNnJbsLlpFsUJSL7TvgzC\n' +
    'JNuey9/6QvYpZNuXz2a8EdOA0tPu6GmVdV5ZW7eJRWUZXhE01nrHbfGVWqU5xVy6\n' +
    'mcI9JB+vc151sleyrdVZkt+MvZy9D1gMre/bb8AM6YxkMoW/kwhkDpu6LcX8xhws\n' +
    'MmX0+W+i2BKauSDNrooRpFJhPBsvAJc2a8QN8Qa2QOrDEANR/h+hS66/A/TGNNcl\n' +
    'eItkVXFDeLhta724RXHwhY4mJN9xU9/B6TPtz4v0NCpB6t8UyDw6lxRJM5ws3wM1\n' +
    'lQIDAQAB\n' +
    '-----END PUBLIC KEY-----\n'
});

config.idp.test.publicKeys.push({
  '@context': 'https://w3id.org/identity/v1',
  label: 'SomeKeyLabel1',
  publicKeyPem: '-----BEGIN PUBLIC KEY-----\n' +
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA1JijN/i4Jb04tUC/DMbi\n' +
    'LlagEBqxPJl42rBvFw2lxvJ15tlJr5FELpYOYHFsZltbe3P2LDawhtTtEkbe/LCq\n' +
    'ZBAh+wWHXz2rjUNoh8zJmyv4tnt2d4IX3eIYsNoiA6Eu4uuxHUZHmpXWgvejp+l3\n' +
    '2qpWwD63HZZ8WzE0KE4p4C+KTET7NMQ4Q6fa2f8aISNt4AnVb6r3E3C7/FEeeq4m\n' +
    'L/XShRakz34KV1OOLtt5RgUtgBO9OBXIXbS2fQOY6mD6a3wcihoqVBHan8EEStFL\n' +
    'C0EqGuroBEHQBg5u70bJ8yjrPg+nb+e3K98APj/LNXb13NwV9M6bgJmqJ5PwhU5N\n' +
    'KwIDAQAB\n' +
    '-----END PUBLIC KEY-----\n'
});

config.idp.test.publicKeys.push({
  '@context': 'https://w3id.org/identity/v1',
  label: 'SomeKeyLabel2',
  publicKeyPem: '-----BEGIN PUBLIC KEY-----\n' +
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsRD9oymkLwJrhEfFKbZC\n' +
    'VJW0fKF2jTlYb3pmArps9jbPJaRW805xp3ggCMC+wh87MMV6Bmu81ttSD1p91xkl\n' +
    'UA5b9COGObl8A6S429R/IXM749zundrrk5x6FN8wod3sSK8c7P8xKcsOfIJRkmJ3\n' +
    'TEBSVhb25l5qLq6zrBFNxxTDjljNsFKofQ3uPNv2SICAtTHoUPE5g0V0WU/zq59f\n' +
    '3jEopwJ8xhOZeiDPsfgxQ79d4P+TNxxPi20pKD/Vrp+GawOnAPxwphmLzLlUFB4f\n' +
    'dEfBxKDqVxpuzaHusOSa6qY/9JDkPYZ1aGsOGOV4878YdQNHgIcdWs1Vg/3v6bpR\n' +
    'iwIDAQAB\n' +
    '-----END PUBLIC KEY-----\n'
});

config.idp.test.publicKeys.push({
  '@context': 'https://w3id.org/identity/v1',
  label: 'SomeKeyLabel3',
  publicKeyPem: '-----BEGIN PUBLIC KEY-----\n' +
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwPxW0XfZrJfDwLU6o0iC\n' +
    'C2ls0itWJgdLL+2rGpfFD+xZNkAdyXCdiQvhsQPeALXgODRRj1R2mF5B1H6Mhla2\n' +
    'Hdt32o1751Xh1O+eigy8Bs7FhbjiNDS6Sg0zVLQx38Y9gXpbEn1XBYuCF3CBokKU\n' +
    '79LIDbBnYtTIUvgGT5mrwH9lLgoadvwU/AfsjDduv0VTZWOUe+jHsl0jU/lC8oyt\n' +
    'bsiWjNFhHrCBVc0kjoHA+57d1SfHYUcxvH0BXEru3RE8d5AMVSxFd3GLF1kMxajc\n' +
    'Wx3yTMGf0Dp2fOReV5M7771bL4wkRTEktAHq4RJAXmVpm7WC9AgpqqbQj3UyD5PO\n' +
    'CwIDAQAB\n' +
    '-----END PUBLIC KEY-----\n'
});

// serve test contexts and vocabs
config.express.static.push(path.join(
  __dirname, '..', 'bedrock', 'static'));

// setup to load demo vocabs
config.views.vars['bedrock-angular-credential'] =
  config.views.vars['bedrock-angular-credential'] || {};
config.views.vars['bedrock-angular-credential'].libraries =
  config.views.vars['bedrock-angular-credential'].libraries || {};
config.views.vars['bedrock-angular-credential'].libraries.default = {
  vocabs: [
    config.server.baseUri + '/vocabs/test-v1.jsonld'
  ]
};

// common demo cred vars
var claimId = config.server.baseUri + config.idp.identityBasePath + '/testuser';
var sigKey = claimId + '/keys/1';

// FIXME: credentials *must* use the context that the insertion API is
// expecting
var context = [
  'https://w3id.org/identity/v1',
  'https://w3id.org/credentials/v1',
  {
    'test': 'urn:test:'
  }
];

// setup credentials for test
config['credentials-mongodb'].provider.credentials.push({
  '@context': context,
  id: 'urn:credential:test-recipient-1',
  type: ['Credential', 'test:EmailCredential'],
  name: 'Test 1: Email',
  issued: '2015-01-01T01:02:03Z',
  issuer: 'urn:issuer:test',
  image: 'http://simpleicon.com/wp-content/uploads/mail_envalope-128x128.png',
  claim: {
    id: 'urn:recipient:test',
    'email': 'recipient-test@example.com'
  },
  signature: {
    type: 'GraphSignature2012',
    created: '2015-01-01T01:02:03Z',
    creator: 'urn:issuer:test:key:1',
    signatureValue: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz01234567890ABCDEFGHIJKLM=='
  },
  sysState: 'claimed'
});
config['credentials-mongodb'].provider.credentials.push({
  '@context': context,
  id: 'urn:credential:test-dev-1',
  type: ['Credential', 'test:EmailCredential'],
  name: 'Test 1: Work Email',
  issued: '2015-01-01T01:02:03Z',
  issuer: 'urn:issuer:test',
  image: 'http://simpleicon.com/wp-content/uploads/mail_envalope-128x128.png',
  claim: {
    id: claimId,
    'email': 'dev@example.com'
  },
  signature: {
    type: 'GraphSignature2012',
    created: '2015-01-01T01:02:03Z',
    creator: sigKey,
    signatureValue: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz01234567890ABCDEFGHIJKLM=='
  },
  sysState: 'claimed'
});
config['credentials-mongodb'].provider.credentials.push({
  '@context': context,
  id: 'urn:credential:test-dev-2',
  type: ['Credential', 'test:EmailCredential'],
  name: 'Test 2: Personal Email',
  issued: '2015-01-02T01:02:03Z',
  issuer: 'urn:issuer:test',
  image: 'http://simpleicon.com/wp-content/uploads/mail_envalope-128x128.png',
  claim: {
    id: claimId,
    email: 'dev@example.org'
  },
  signature: {
    type: 'GraphSignature2012',
    created: '2015-01-02T01:02:03Z',
    creator: sigKey,
    signatureValue: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz01234567890ABCDEFGHIJKLM=='
  },
  sysState: 'claimed'
});
config['credentials-mongodb'].provider.credentials.push({
  '@context': context,
  id: 'urn:credential:test-dev-3',
  type: ['Credential', 'test:VerifiedAddressCredential'],
  name: 'Test 3: Address',
  issued: '2015-01-03T01:02:03Z',
  issuer: 'urn:issuer:test',
  image: 'http://simpleicon.com/wp-content/uploads/address-128x128.png',
  claim: {
    id: claimId,
    address: {
      type: 'PostalAddress',
      streetAddress: '123 Main St',
      addressLocality: 'Sometown',
      addressRegion: 'Somestate',
      postalCode: '12345-1234'
    }
  },
  signature: {
    type: 'GraphSignature2012',
    created: '2015-01-03T01:02:03Z',
    creator: sigKey,
    signatureValue: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz01234567890ABCDEFGHIJKLM=='
  },
  sysState: 'claimed'
});
config['credentials-mongodb'].provider.credentials.push({
  '@context': context,
  id: 'urn:credential:test-dev-4',
  type: ['Credential', 'test:AgeOverCredential'],
  name: 'Test 4: Age Over 21',
  issued: '2015-01-04T01:02:03Z',
  issuer: 'urn:issuer:test',
  image: 'http://simpleicon.com/wp-content/uploads/beer1-128x128.png',
  claim: {
    id: claimId,
    'test:ageOver': '21'
  },
  signature: {
    type: 'GraphSignature2012',
    created: '2015-01-04T01:02:03Z',
    creator: sigKey,
    signatureValue: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz01234567890ABCDEFGHIJKLM=='
  },
  sysState: 'claimed'
});
config['credentials-mongodb'].provider.credentials.push({
  '@context': context,
  id: 'urn:credential:test-dev-5',
  type: ['Credential', 'test:BirthDateCredential'],
  name: 'Test 5: Birth Date',
  issued: '2015-01-05T01:02:03Z',
  issuer: 'urn:issuer:test',
  image: 'http://simpleicon.com/wp-content/uploads/pestry_cake-128x128.png',
  claim: {
    id: claimId,
    'schema:birthDate': {'@value': '2001-02-03', '@type': 'xsd:dateTime'},
    'schema:birthPlace': {
      type: 'schema:Place',
      address: {
        type: 'PostalAddress',
        streetAddress: '1000 Birthing Center Rd',
        addressLocality: 'Sometown',
        addressRegion: 'Somestate',
        postalCode: '12345-1234'
      }
    }
  },
  signature: {
    type: 'GraphSignature2012',
    created: '2015-01-05T01:02:03Z',
    creator: sigKey,
    signatureValue: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz01234567890ABCDEFGHIJKLM=='
  },
  sysState: 'claimed'
});
config['credentials-mongodb'].provider.credentials.push({
  '@context': context,
  id: 'urn:credential:test-dev-6',
  type: ['Credential', 'test:PhysicalExaminationCredential'],
  name: 'Test 6: Physical',
  issued: '2015-01-06T01:02:03Z',
  issuer: 'urn:issuer:test',
  image: 'http://simpleicon.com/wp-content/uploads/stethoscope1-128x128.png',
  claim: {
    id: claimId,
    'schema:height': '182 cm',
    'schema:weight': '77 Kg'
  },
  signature: {
    type: 'GraphSignature2012',
    created: '2015-01-06T01:02:03Z',
    creator: sigKey,
    signatureValue: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz01234567890ABCDEFGHIJKLM=='
  },
  sysState: 'claimed'
});

function createKeyPair(options) {
  var userName = options.userName;
  var publicKey = options.publicKey;
  var privateKey = options.privateKey;
  var newKeyPair = {
    publicKey: {
      '@context': 'someContextURL',
      type: 'CryptographicKey',
      owner: baseIdPath + '/' + userName,
      label: 'Signing Key 1',
      publicKeyPem: publicKey
    },
    privateKey: {
      type: 'CryptographicKey',
      owner: baseIdPath + '/' + userName,
      label: 'Signing Key 1',
      publicKey: baseIdPath + '/' + userName + '/keys/1',
      privateKeyPem: privateKey
    }
  };
  return newKeyPair;
}

function createIdentity(userName) {
  var newIdentity = {
    id: baseIdPath + '/' + userName,
    type: 'Identity',
    sysSlug: userName,
    label: userName,
    email: userName + '@bedrock.dev',
    sysPassword: 'password',
    sysPublic: ['label', 'url', 'description'],
    sysResourceRole: [{
      sysRole: 'identity.registered',
      generateResource: 'id'
    }],
    url: config.server.baseUri,
    description: userName
  };
  return newIdentity;
}
