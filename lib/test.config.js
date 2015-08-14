/*
 * Bedrock IDP Module Configuration
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */

var config = require('bedrock').config;

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
