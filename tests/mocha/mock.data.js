/* globals require, module, exports */
/* jshint -W097 */
'use strict';

var bedrock = require('bedrock');
var config = bedrock.config;
var util = bedrock.util;
var uuid = require('node-uuid').v4;

var mock = {};
module.exports = mock;

mock.identities = {};
mock.didDocuments = {};

// TODO: Correct these paths to be more accurate
var baseIdPath = bedrock.config.server.baseUri;
var userName = '';

mock.credentialTemplate = {
  '@context': 'https://w3id.org/identity/v1',
  issuer: 'did:603e6408-7afb-49e0-a484-b236ae2ba01f',
  type: [
    'Credential',
    'BirthDateCredential'
  ],
  name: 'Birth Date Credential',
  image: 'https://images.com/verified-email-badge',
  issued: '2013-06-17T11:11:11Z',
  claim: {
    birthDate: '1977-06-17T08:15:00Z',
    birthPlace: {
      address: {
        type: 'PostalAddress',
        streetAddress: '1000 Birthing Center Rd',
        addressLocality: 'San Francisco',
        addressRegion: 'CA',
        postalCode: '98888-1234'
      }
    }
  },
  signature: {
    type: 'GraphSignature2012',
    created: '2015-07-24T12:48:38Z',
    creator: 'https://example.com/keys/1',
    signatureValue: 'lRBljDguLA316oTkXoHPxSFYziXTvSZn1Ap2IEZkDc0F93V5BN' +
      'jHXtC+YS7SbwnYfgBb2d4WnvXDSxzGboAEEw/Jcc2/rz0uqfU1/Jbwps5pLMWnHS/' +
      '5JY+9PPbHNS8PZSeonpEH2hTvK+ofv6CVu7voF3PK3q/Jw3tjmJ88XTA='
  }
};

// user with a valid 2048 bit RSA keypair, identity is made public
userName = 'rsa2048';
mock.identities[userName] = {};
mock.identities[userName].identity = createIdentity(userName);
mock.identities[userName].identity.sysResourceRole.push({
  sysRole: 'identity.registered'
});
// make this identity public
mock.identities[userName].identity.sysPublic.push('email');
mock.identities[userName].keys = createKeyPair({
  userName: userName,
  publicKey: '-----BEGIN PUBLIC KEY-----\n' +
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvazasP9WKWFu1KW/3ASo\n' +
    'frfg6giLVsBGAKN0ZP3wJGvg/y049QRuyyvpdGCD36SGZkQ8bvRSeYnTAFhpKpmt\n' +
    'qb91tXBrsZTILorb7jNWbxn+ziGxOp/IIwWQE6FEbNz8TuxjGgsZk9RdK4ct8ix3\n' +
    '39lso4XkwBACfZPlDTuf9/qE8aFWXxoOy4zP8nfiZSmMcZ7BKT8i4OUvhIfFpVBj\n' +
    '0rZLtKmgBb5r98xQU7G1uVG9+2YhiQTzi8F/ljohyp9WoEsChqoqWUpoOFTuTdha\n' +
    '/TDoPGaACee0FwZJZF8WSIwqzN63/9RA2suB+Tw27XepNsX39xvzhJUCD/NTq68F\n' +
    '2QIDAQAB\n' +
    '-----END PUBLIC KEY-----\n',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIIEpAIBAAKCAQEAvazasP9WKWFu1KW/3ASofrfg6giLVsBGAKN0ZP3wJGvg/y04\n' +
    '9QRuyyvpdGCD36SGZkQ8bvRSeYnTAFhpKpmtqb91tXBrsZTILorb7jNWbxn+ziGx\n' +
    'Op/IIwWQE6FEbNz8TuxjGgsZk9RdK4ct8ix339lso4XkwBACfZPlDTuf9/qE8aFW\n' +
    'XxoOy4zP8nfiZSmMcZ7BKT8i4OUvhIfFpVBj0rZLtKmgBb5r98xQU7G1uVG9+2Yh\n' +
    'iQTzi8F/ljohyp9WoEsChqoqWUpoOFTuTdha/TDoPGaACee0FwZJZF8WSIwqzN63\n' +
    '/9RA2suB+Tw27XepNsX39xvzhJUCD/NTq68F2QIDAQABAoIBAQCsTS/Ehc8xfA8A\n' +
    'ISmuppShuEwajXR2c+ejgNilPYE+tLkJVX1eJo63BcbnLx3ctUpZ8Dat3Ehnm+oP\n' +
    'cEDor/3wK7qz/dH22V8X2JB9TCmCd6zeeADVbnySQ+Vjz6Wm9wBEebx01gyAG/Qf\n' +
    'LIdybS7gLFTiHylzx5dbmFQEt1tUGbAhzjOubGurJ4aBVPb9OsbAthr8Lf4R/t6a\n' +
    'in33kKO95PiuAen6YxlyNDhZU8Eg9vrmXGQUQuw98Jp4GSd6eGSNjf8v1cSRHrVG\n' +
    'GyL5Di8qhngMROE7sw3NFPF/c0iczOrGlzmBseeZgaFcg/iYZrzKy43PtGv+7BXr\n' +
    'MlXFivFhAoGBAOtB30VVnYolfp458ILjBI5VmeYFQCkr7vumj8MzHN0m+cBNakcR\n' +
    'WPeybH+lS9mGahFqrhv/ic9w2q7RcHKC3TDZvVoXa7KbMbMPGytcz7jyTT4HHYqw\n' +
    'G1Lt/mdKSQStVByNxFoXPMfKLjvA6P8WraCwjDBd/DwYjanSFoE0BbQtAoGBAM5m\n' +
    'H1HntpgsOsDBI8pzO56f2vC3lB4lSuTi0rnPJhqvct1iVY/JrMIw7ubWTVJwXGvg\n' +
    'w2XQCm8nmbJHOkMePM6JP9CkD9g/11YeFjIAtO+CaluMVxCTh5+oJWV3l4+FOv+r\n' +
    '4J3WhEn/uh2KcSRMRRH4IgYFY9BHeB1TRGgRMkfdAoGAVj0Xc3sm/PUxrR7gI5rE\n' +
    'mMiYWdGi63THbkhoes3JzufytaOrSdH6IxKs4z3cyCiVyTyqBmluQzTDdUIhTlja\n' +
    'bIXk+5mKSTbKyTDIbOTg4JMx7YL+OVDFM2k60PJSQfyn0K/HQp8yEKr0t8LHpnrR\n' +
    'uw381d4eEImPpKj2xvYjASECgYALUMv8yJBZLWuXL7+PlNu66ZauRdJICNFfVRQq\n' +
    'fbHgGqhYfNCmDm97QgWHAE7C60gV3f+4cDxyNaCWhpMqJNk+lYW7IZOAzpc2sHWV\n' +
    'DjbdPrAoDryjOwNffG94baMQikReygSJgr5D9FI21mU3kTrkLk9nNxpuy8xJB0yj\n' +
    'y/WOvQKBgQCSqlw1OkvHUzzBDXsWfpuiMggjBpkUBG/MC1S1Ljq9ZdJoU6WYVtsD\n' +
    'sKjhuRRrIAHgIJVhmYGUjW8sEK+ljoyATWQ08GaLwtYayHzzJ3BLBtaLB/+Xwx30\n' +
    'ziLGHGiH5LlHT9UJthPUFa0+ReEzaeXDfSKf3Zt0PydhgHRHaay9/g==\n' +
    '-----END RSA PRIVATE KEY-----\n'
});

// user with a valid 2048 bit RSA keypair and issuer permissions
userName = 'privateIdentity';
mock.identities[userName] = {};
mock.identities[userName].identity = createIdentity(userName);
mock.identities[userName].identity.sysResourceRole.push({
  sysRole: 'identity.registered'
});
mock.identities[userName].keys = createKeyPair({
  userName: userName,
  publicKey: '-----BEGIN PUBLIC KEY-----\n' +
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAvazasP9WKWFu1KW/3ASo\n' +
    'frfg6giLVsBGAKN0ZP3wJGvg/y049QRuyyvpdGCD36SGZkQ8bvRSeYnTAFhpKpmt\n' +
    'qb91tXBrsZTILorb7jNWbxn+ziGxOp/IIwWQE6FEbNz8TuxjGgsZk9RdK4ct8ix3\n' +
    '39lso4XkwBACfZPlDTuf9/qE8aFWXxoOy4zP8nfiZSmMcZ7BKT8i4OUvhIfFpVBj\n' +
    '0rZLtKmgBb5r98xQU7G1uVG9+2YhiQTzi8F/ljohyp9WoEsChqoqWUpoOFTuTdha\n' +
    '/TDoPGaACee0FwZJZF8WSIwqzN63/9RA2suB+Tw27XepNsX39xvzhJUCD/NTq68F\n' +
    '2QIDAQAB\n' +
    '-----END PUBLIC KEY-----\n',
  privateKey: '-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIIEpAIBAAKCAQEAvazasP9WKWFu1KW/3ASofrfg6giLVsBGAKN0ZP3wJGvg/y04\n' +
    '9QRuyyvpdGCD36SGZkQ8bvRSeYnTAFhpKpmtqb91tXBrsZTILorb7jNWbxn+ziGx\n' +
    'Op/IIwWQE6FEbNz8TuxjGgsZk9RdK4ct8ix339lso4XkwBACfZPlDTuf9/qE8aFW\n' +
    'XxoOy4zP8nfiZSmMcZ7BKT8i4OUvhIfFpVBj0rZLtKmgBb5r98xQU7G1uVG9+2Yh\n' +
    'iQTzi8F/ljohyp9WoEsChqoqWUpoOFTuTdha/TDoPGaACee0FwZJZF8WSIwqzN63\n' +
    '/9RA2suB+Tw27XepNsX39xvzhJUCD/NTq68F2QIDAQABAoIBAQCsTS/Ehc8xfA8A\n' +
    'ISmuppShuEwajXR2c+ejgNilPYE+tLkJVX1eJo63BcbnLx3ctUpZ8Dat3Ehnm+oP\n' +
    'cEDor/3wK7qz/dH22V8X2JB9TCmCd6zeeADVbnySQ+Vjz6Wm9wBEebx01gyAG/Qf\n' +
    'LIdybS7gLFTiHylzx5dbmFQEt1tUGbAhzjOubGurJ4aBVPb9OsbAthr8Lf4R/t6a\n' +
    'in33kKO95PiuAen6YxlyNDhZU8Eg9vrmXGQUQuw98Jp4GSd6eGSNjf8v1cSRHrVG\n' +
    'GyL5Di8qhngMROE7sw3NFPF/c0iczOrGlzmBseeZgaFcg/iYZrzKy43PtGv+7BXr\n' +
    'MlXFivFhAoGBAOtB30VVnYolfp458ILjBI5VmeYFQCkr7vumj8MzHN0m+cBNakcR\n' +
    'WPeybH+lS9mGahFqrhv/ic9w2q7RcHKC3TDZvVoXa7KbMbMPGytcz7jyTT4HHYqw\n' +
    'G1Lt/mdKSQStVByNxFoXPMfKLjvA6P8WraCwjDBd/DwYjanSFoE0BbQtAoGBAM5m\n' +
    'H1HntpgsOsDBI8pzO56f2vC3lB4lSuTi0rnPJhqvct1iVY/JrMIw7ubWTVJwXGvg\n' +
    'w2XQCm8nmbJHOkMePM6JP9CkD9g/11YeFjIAtO+CaluMVxCTh5+oJWV3l4+FOv+r\n' +
    '4J3WhEn/uh2KcSRMRRH4IgYFY9BHeB1TRGgRMkfdAoGAVj0Xc3sm/PUxrR7gI5rE\n' +
    'mMiYWdGi63THbkhoes3JzufytaOrSdH6IxKs4z3cyCiVyTyqBmluQzTDdUIhTlja\n' +
    'bIXk+5mKSTbKyTDIbOTg4JMx7YL+OVDFM2k60PJSQfyn0K/HQp8yEKr0t8LHpnrR\n' +
    'uw381d4eEImPpKj2xvYjASECgYALUMv8yJBZLWuXL7+PlNu66ZauRdJICNFfVRQq\n' +
    'fbHgGqhYfNCmDm97QgWHAE7C60gV3f+4cDxyNaCWhpMqJNk+lYW7IZOAzpc2sHWV\n' +
    'DjbdPrAoDryjOwNffG94baMQikReygSJgr5D9FI21mU3kTrkLk9nNxpuy8xJB0yj\n' +
    'y/WOvQKBgQCSqlw1OkvHUzzBDXsWfpuiMggjBpkUBG/MC1S1Ljq9ZdJoU6WYVtsD\n' +
    'sKjhuRRrIAHgIJVhmYGUjW8sEK+ljoyATWQ08GaLwtYayHzzJ3BLBtaLB/+Xwx30\n' +
    'ziLGHGiH5LlHT9UJthPUFa0+ReEzaeXDfSKf3Zt0PydhgHRHaay9/g==\n' +
    '-----END RSA PRIVATE KEY-----\n'
});

// FIXME: This should be a sample DID document for a an Individual
// jscs: disable
var recipientDidDocument = {
  "@context": "https://w3id.org/identity/v1",
  "idp": "did:ef2618b9-946a-4f8e-970d-f784de635990",
  "accessControl": {
    "writePermission": [
      {
        "id": "did:32e89321-a5f1-48ff-8ec8-a4112be1215c/keys/1",
        "type": "CryptographicKey"
      },
      {
        "id": "did:d1d1d1d1-d1d1-d1d1-d1d1-d1d1d1d1d1d1",
        "type": "Identity"
      }
    ]
  },
  "publicKey": [
    {
      "id": "did:32e89321-a5f1-48ff-8ec8-a4112be1215c/keys/1",
      "type": "CryptographicKey",
      "owner": "did:32e89321-a5f1-48ff-8ec8-a4112be1215c",
      "publicKeyPem": "-----BEGIN PUBLIC KEY-----\r\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgH4EXOXrM2hgFSPxaLYK\r\njkY2QoHlis5ntvvLi1/t5mloxerCZKTBRki7K+F9ForqREFn5SiSkzCJwNXYfbhj\r\n2BJjhSbOoPdbTanQKasaw22X8pcBeagHnPxG29xvhqDSddoIXjeAnVRU7ODkH4VX\r\n9rqKR+PaJKPCD7T5dx4zqiYgCrBLKRr/yFQUV+csbzmOm3AhJdKIwsPj5DxTP5WX\r\n/bYBJ4sDWbHWiAaDWRYo/SPSHO5RR7Vk/hvQpKn0H7SDX2DMf9RpVKtCNXmLM1pD\r\nA7reJU3VpVK1kG9oTTOPCX5PTVZb7WrFFBDSfGPznpYUeRSBixZUbv7CvC4wTxdh\r\nNwIDAQAB\r\n-----END PUBLIC KEY-----\r\n"
    }
  ],
  "signature": {
    "type": "GraphSignature2012",
    "created": "2015-07-02T21:45:26Z",
    "creator": "did:32e89321-a5f1-48ff-8ec8-a4112be1215c/keys/1",
    "signatureValue": "ba9dvZrSEn97zqnjEN0Mjp4nEMyJrEpfVwyThfXfCjTfmgZ7C325p7u5pTE2Zclw8X74UNOy8HqemQXSuIpdNZiU82o/ABZ6n1IKKxnAEVuMXzH1ukMH0ao32tldcwGtM9yonXJGPqtkzYtsCXdQxkM6C5Qf/MEaU83ZF0sUw6m+cQatWKsGDldu771A7+KxGApjbyMAza4c/oeDsNCuo7cbWZisglzQ0Dp0kGOXSCY3nxs28b1UkeLFf740Bs9j7AtayzYaVjwAdHLZeXK669tcuRDzc+BYLscu/6ry0H5EVOHjItMhjjQ4nho4ONr3dPA60c+3yfXZyIfs8UUI1Q=="
  }
};
// jscs: enable

Object.keys(mock.identities).forEach(function(i) {
  var tempDoc = util.clone(recipientDidDocument);
  tempDoc.id = mock.identities[i].identity.id;
  tempDoc.publicKey[0].id = mock.identities[i].identity.id + '/keys/1';
  tempDoc.publicKey[0].owner = mock.identities[i].identity.id;
  tempDoc.publicKey[0].publicKeyPem =
    mock.identities[i].keys.publicKey.publicKeyPem;
  mock.didDocuments[mock.identities[i].identity.id] = tempDoc;
});

function createIdentity(userName) {
  var newIdentity = {
    id: 'did:' + uuid(),
    type: 'Identity',
    sysSlug: userName,
    label: userName,
    email: userName + '@bedrock.dev',
    sysPassword: 'password',
    sysPublic: [],
    sysResourceRole: [],
    sysStatus: 'active',
    url: config.server.baseUri,
    description: userName
  };
  return newIdentity;
}

function createKeyPair(options) {
  var userName = options.userName;
  var publicKey = options.publicKey;
  var privateKey = options.privateKey;
  var ownerId = null;
  if(userName === 'userUnknown') {
    ownerId = '';
  } else {
    ownerId = mock.identities[userName].identity.id;
  }
  var newKeyPair = {
    publicKey: {
      '@context': 'https://w3id.org/identity/v1',
      id: ownerId + '/keys/1',
      type: 'CryptographicKey',
      owner: ownerId,
      label: 'Signing Key 1',
      publicKeyPem: publicKey
    },
    privateKey: {
      type: 'CryptographicKey',
      owner: ownerId,
      label: 'Signing Key 1',
      publicKey: ownerId + '/keys/1',
      privateKeyPem: privateKey
    }
  };
  return newKeyPair;
}
