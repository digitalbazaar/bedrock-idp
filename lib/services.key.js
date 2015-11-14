/*
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var _ = require('underscore');
var async = require('async');
var auth = require('./auth');
var bedrock = require('bedrock');
var brIdentity = require('bedrock-identity');
var brPassport = require('bedrock-passport');
var database = require('bedrock-mongodb');
var cors = require('cors');
var docs = require('bedrock-docs');
var rest = require('bedrock-rest');

var BedrockError = bedrock.util.BedrockError;
var ensureAuthenticated = brPassport.ensureAuthenticated;
var validate = require('bedrock-validation').validate;

// module API
var api = {};
module.exports = api;

// add routes
bedrock.events.on('bedrock-express.configure.routes', addRoutes);

function addRoutes(app) {
  var idPath = bedrock.config.idp.identityBasePath + '/:identity';

  // TODO: determine if this API can be used to create DID-based keys
  app.post(idPath + '/keys',
    ensureAuthenticated,
    validate('services.key.postKeys'),
    function(req, res, next) {
      async.auto({
        getId: auth.getIdentityIdFromUrl.bind(null, req),
        add: ['getId', function(callback, results) {
          var identityId = results.getId;

          // build public key
          var publicKey = {
            '@context': bedrock.config.constants.IDENTITY_CONTEXT_V1_URL,
            type: 'CryptographicKey',
            owner: identityId,
            label: req.body.label,
            publicKeyPem: req.body.publicKeyPem
          };

          var privateKey = null;
          if('privateKeyPem' in req.body) {
            privateKey = {
              type: 'CryptographicKey',
              owner: identityId,
              label: req.body.label,
              privateKeyPem: req.body.privateKeyPem
            };
          }

          // add public key
          brIdentity.addPublicKey(
            req.user.identity, publicKey, privateKey, function(err) {
            if(err && database.isDuplicateError(err)) {
              return next(new BedrockError(
                'The identity key is a duplicate and could not be added.',
                'DuplicateIdentityKey', {
                  httpStatusCode: 409,
                  'public': true
                }));
            }
            callback(err, publicKey);
          });
        }]
      }, function(err, results) {
        if(err) {
          return next(new BedrockError(
            'The identity key could not be added.',
            'AddIdentityKeyFailed', {
              httpStatusCode: 400,
              'public': true
            }, err));
        }
        // return key
        res.set('Location', results.add.id);
        res.status(201).json(results.add);
      });
    });
  docs.annotate.post(idPath + '/keys', {
    description: 'Associate a public key with the identity.',
    securedBy: ['cookie', 'hs1'],
    schema: 'services.key.postKeys',
    responses: {
      201: 'Key registration was successful.',
      400: 'The key could not be added.',
      409: 'The key is a duplicate and was not added.'
    }
  });

  // TODO: determine if DID-based keys should be returned
  // API for getting all keys (including DID-based keys?)
  app.options(idPath + '/keys', cors());
  app.get(idPath + '/keys',
    cors(),
    rest.makeResourceHandler({
      get: function(req, res, callback) {
        async.auto({
          getId: auth.getIdentityIdFromUrl.bind(null, req),
          getKeys: ['getId', function(callback, results) {
            // get keys
            brIdentity.getPublicKeys(results.getId, function(err, records) {
              if(err) {
                return callback(err);
              }
              callback(err, records ? _.pluck(records, 'publicKey') : null);
            });
          }]
        }, function(err, results) {
          callback(err, results.getKeys);
        });
      }
    }));
  docs.annotate.get(idPath + '/keys', {
    description: 'Get the list of public keys associated with an identity.',
    securedBy: ['null', 'cookie', 'hs1'],
    responses: {
      200: {
        'application/ld+json': {
          'example': 'examples/get.identity.keys.jsonld'
        }
      }
    }
  });

  // API for updating a local public key
  app.post(idPath + '/keys/:publicKey',
    ensureAuthenticated,
    validate('services.key.postKey'),
    function(req, res, next) {
      // get IDs from URL
      var identityId = auth.createIdentityId(req.params.identity);
      var publicKeyId = brIdentity.createPublicKeyId(
        identityId, req.params.publicKey);

      if(publicKeyId !== req.body.id) {
        // id mismatch
        return next(new BedrockError(
          'Incorrect key id.',
          'KeyIdError', {
            'public': true,
            httpStatusCode: 400
          }));
      }

      if('revoked' in req.body) {
        // revoke public key
        return brIdentity.revokePublicKey(
          req.user.identity, publicKeyId, function(err, key) {
            if(err) {
              return next(err);
            }
            res.status(200).send(key);
          });
      }

      async.waterfall([
        function(callback) {
          brIdentity.getPublicKey({id: publicKeyId}, function(err, publicKey) {
            callback(err, publicKey);
          });
        },
        function(key, callback) {
          // update public key
          if('label' in req.body) {
            key.label = req.body.label;
          }
          brIdentity.updatePublicKey(req.user.identity, key, callback);
        }
      ], function(err) {
        if(err) {
          return next(err);
        }
        res.sendStatus(204);
      });
    });
  docs.annotate.post(idPath + '/keys/:publicKey', {
    description: 'Modify an existing public key.',
    securedBy: ['cookie', 'hs1'],
    schema: 'services.key.postKey',
    responses: {
      200: 'The key was revoked successfully.',
      204: 'The key was updated successfully.',
      400: 'The key could not be modified.'
    }
  });

  // API for getting a local public key
  app.options(idPath + '/keys/:publicKey', cors());
  app.get(idPath + '/keys/:publicKey',
    cors(),
    rest.makeResourceHandler({
      get: function(req, res, callback) {
        var identityId = auth.createIdentityId(req.params.identity);
        var publicKeyId = brIdentity.createPublicKeyId(
          identityId, req.params.publicKey);

        // get public key
        brIdentity.getPublicKey({id: publicKeyId}, function(err, key) {
          callback(err, key);
        });
      },
      template: 'key.html',
      templateNeedsResource: true,
      updateVars: function(resource, vars, callback) {
        vars.key = resource;
        callback();
      }
    }));
  docs.annotate.get(idPath + '/keys/:publicKey', {
    description: 'Get a public keys associated with an identity.',
    securedBy: ['null', 'cookie', 'hs1'],
    responses: {
      200: {
        'application/ld+json': {
          'example': 'examples/get.identity.keys.publicKey.jsonld'
        }
      },
      404: 'The key was not found.'
    }
  });
}
