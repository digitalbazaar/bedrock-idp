/*
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var bedrock = require('bedrock');
var brPassport = require('bedrock-passport');
var rest = require('bedrock-rest');
var curator = require('bedrock-credential-curator');
var async = require('async');
var ensureAuthenticated = brPassport.ensureAuthenticated;
var getDefaultViewVars = require('bedrock-views').getDefaultViewVars;
var data = {};

// add routes
bedrock.events.on('bedrock-express.configure.routes', addRoutes);

var fakeCredential = {
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

// FIXME: this route does not prompt for authentication if the session has
// expired
function addRoutes(app) {
  var idPath = bedrock.config.idp.identityBasePath + '/:identity';
  app.get(idPath + '/credentials',
    ensureAuthenticated,
    rest.makeResourceHandler());
  app.post('/credentials', ensureAuthenticated, function(req, res, next) {
    var action = req.query.action;
    var credentialCallbackUrl = req.query.credentialCallback;
    console.log('PARAMS:', req.query);
    console.log('BODY:', JSON.parse(req.body.jsonPostData));
    console.log(req.user);
    // FIXME: template might be query?
    var template = {
      id: ''
    };

    async.waterfall([
      function(callback) {
        curator.compose(
          null, req.user.identity.id, template, function(err, result) {
            console.log('CURATOR ERROR:', err);
            console.log('RESULT FROM CURATOR:', result);
            callback(err, result);
          });
      },
      function(result, callback) {
        // FIXME: not using results from curator at this time
        var credential = fakeCredential;
        getDefaultViewVars(req, function(err, vars) {
          if(err) {
            return next(err);
          }
          vars.curator = {};
          vars.curator.credential = credential;
          vars.request = {};
          vars.request.credentialCallbackUrl = credentialCallbackUrl;
          vars.request.action = action;
          res.render('credentials.html', vars);
          callback(null);
        });
      }
    ], function(err) {
      next(err);
    });

  });
}
