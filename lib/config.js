/*
 * Bedrock IDP Module Configuration
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var config = require('bedrock').config;
var path = require('path');
require('bedrock-identity');
require('bedrock-mail');
require('bedrock-validation');
require('bedrock-views');
require('bedrock-credentials-rest');

config.idp = {};
// needs to be set to the DID of an Identity that owns the IdP
config.idp.owner = null;

// base path for identity IDs (appended to config.server.baseUri)
config.idp.identityBasePath = '/i';
config.idp.allowInsecureCallback = false;
config.idp.defaults = {
  identity: {
    '@context': config.constants.IDENTITY_CONTEXT_V1_URL,
    type: 'Identity',
    sysStatus: 'active'
  }
};
config.idp.identities = [];
config.idp.keys = [];

// bedrock-credential-curator
config['credential-curator'].tasks.storeCredential.claimCredential = true;

// mail config
config.mail.events.push({
  type: 'bedrock.Identity.created',
  // email for admin
  template: 'bedrock.Identity.created'
}, {
  type: 'bedrock.Identity.created',
  // email for owner
  template: 'bedrock.Identity.created-identity'
}, {
  type: 'bedrock.Identity.passcodeSent',
  // email for owner
  template: 'bedrock.Identity.passcodeSent'
});

var ids = [
  'bedrock.Identity.created',
  'bedrock.Identity.created-identity',
  'bedrock.Identity.passcodeSent'
];
ids.forEach(function(id) {
  config.mail.templates.config[id] = {
    filename: path.join(__dirname, '..', 'email-templates', id + '.tpl')
  };
});

// default mail setup, should be overridden
config.mail.vars = {
  // could be set to config.views.vars.productionMode,
  productionMode: false,
  baseUri: config.server.baseUri,
  subject: {
    prefix: '[Bedrock] ',
    identityPrefix: '[Bedrock] '
  },
  service: {
    name: 'Bedrock',
    host: config.server.host
  },
  system: {
    name: 'System',
    email: 'cluster@' + config.server.domain
  },
  support: {
    name: 'Customer Support',
    email: 'support@' + config.server.domain
  },
  registration: {
    email: 'registration@' + config.server.domain
  },
  comments: {
    email: 'comments@' + config.server.domain
  },
  machine: require('os').hostname()
};

// common validation schemas
config.validation.schema.paths.push(
  path.join(__dirname, '..', 'schemas')
);

// contexts
config.views.vars.contextUrls.identity =
  config.constants.IDENTITY_CONTEXT_V1_URL;

// authentication
config.views.vars.authentication = config.views.vars.authentication || {};

config.views.vars['angular-credential'] =
  config.views.vars['angular-credential'] || {};
config.views.vars['angular-credential'].altUpdateEndpoint =
  config['credentials-rest'].basePath;

config.idp.mock = {};
config.idp.mock.credential = {
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
