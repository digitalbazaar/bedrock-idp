/*
 * Copyright (c) 2012-2016 Digital Bazaar, Inc. All rights reserved.
 */
var async = require('async');
var auth = require('./auth');
var bedrock = require('bedrock');
var brIdentity = require('bedrock-identity');
var brKey = require('bedrock-key');
var brPassport = require('bedrock-passport');
var brPassword = require('bedrock-authn-password');
var brRest = require('bedrock-rest');
var database = require('bedrock-mongodb');
var docs = require('bedrock-docs');
var store = require('bedrock-credentials-mongodb').provider;
var views = require('bedrock-views');

var BedrockError = bedrock.util.BedrockError;
var validate = require('bedrock-validation').validate;
var ensureAuthenticated = brPassport.ensureAuthenticated;

// module API
var api = {};
module.exports = api;

// add routes
bedrock.events.on('bedrock-express.configure.routes', addRoutes);

function addRoutes(app) {
  var idPath = bedrock.config.idp.identityBasePath + '/:identity';

  // creating new identities must be enabled via flags
  var flags = bedrock.config.views.vars.flags;
  if(flags.enableCreateIdentity) {
    app.post('/join',
      validate('services.session.postJoin'),
      function(req, res, next) {
        async.waterfall([
          function(callback) {
            api._createIdentity({}, req, callback);
          },
          function(results, callback) {
            req.body.sysIdentifier = results.identity.id;
            req.body.password = req.body.sysPassword;
            brPassword.login(req, res, next, function(err) {
              if(err) {
                return callback(new BedrockError(
                  'Could not create a session for the newly created identity.',
                  'AutoLoginFailed', {}, err));
              }
              // return identity
              var localId = auth.createIdentityId(req.body.sysSlug);
              res.set('Location', localId);
              res.status(201).json(results.identity);
              callback();
            });
          }
        ], function(err) {
          if(err) {
            return next(err);
          }
        });
      });
  }

  app.post(idPath + '/email/verify',
    ensureAuthenticated,
    validate('services.identity.postEmailVerify'),
    function(req, res, next) {
      async.auto({
        getId: auth.getIdentityIdFromUrl.bind(null, req),
        verify: ['getId', function(callback, results) {
          var identity = {
            id: results.getId,
            sysPasscode: req.body.sysPasscode
          };
          auth.verifyIdentityEmail(req.user.identity, identity, callback);
        }]
      }, function(err, results) {
        if(err) {
          return next(err);
        }
        if(!results.verify) {
          return next(new BedrockError(
            'Email verification failed.',
            'EmailVerificationFailed', {
              identity: results.getId,
              httpStatusCode: 403,
              'public': true
            }));
        }
        res.sendStatus(204);
      });
    });
  docs.annotate.post(idPath + '/email/verify', {
    description: 'Perform an email verification.',
    securedBy: ['cookie', 'hs1'],
    schema: 'services.identity.postEmailVerify',
    responses: {
      204: 'The email was verified successfully.',
      403: 'The provided email verification code was invalid.'
    }
  });
}

/**
 * Identity creation service. Used by normal and testing services.
 */
api._createIdentity = function(options, req, callback) {
  var identityId;
  if('id' in req.body && req.body.id.indexOf('did:') === 0) {
    identityId = req.body.id;
  } else {
    identityId = auth.createIdentityId(req.body.sysSlug);
  }
  async.auto({
    createIdentity: function(callback) {
      // create identity
      var identity = {
        '@context': bedrock.config.constants.IDENTITY_CONTEXT_V1_URL,
        id: identityId,
        sysSlug: req.body.sysSlug,
        label: req.body.label,
        email: req.body.email,
        sysPassword: req.body.sysPassword
      };
      auth.createIdentity(null, identity, function(err, record) {
        callback(err, record ? record.identity : null);
      });
    }
  }, function(err, results) {
    if(err) {
      if(database.isDuplicateError(err)) {
        err = new BedrockError(
          'Could not create identity, it is a duplicate.',
          'DuplicateIdentity', {
            identity: identityId,
            'public': true,
            httpStatusCode: 400
          });
      }
      return callback(err);
    }
    // result details
    var details = {identity: results.createIdentity};
    callback(null, details);
  });
};
