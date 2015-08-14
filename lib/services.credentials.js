/*
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var bedrock = require('bedrock');
var BedrockError = bedrock.util.BedrockError;
var config = bedrock.config;
var jsigs = require('jsonld-signatures')({
  inject: {jsonld: bedrock.jsonld}
});
var rest = require('bedrock-rest');
var curator = require('bedrock-credential-curator');
var _ = require('lodash');
var async = require('async');
var ensureAuthenticated = require('bedrock-passport').ensureAuthenticated;
var getDefaultViewVars = require('bedrock-views').getDefaultViewVars;
var data = {};

// mock credential store
var gCredentials = {};

// add routes
bedrock.events.on('bedrock-express.configure.routes', addRoutes);

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

    // FIXME: template might be query from the request body?
    var template = {
      id: ''
    };

    if(action === 'request') {
      async.waterfall([
        function(callback) {
          curator.compose(
            null, req.user.identity.id, template, function(err, result) {
              // console.log('CURATOR ERROR:', err);
              // console.log('RESULT FROM CURATOR:', result);
              callback(err, result);
            });
        },
        function(result, callback) {
          // FIXME: not using results from curator at this time since there
          // is no identity credential in the database.
          var credential = config.idp.mock.credential;
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
        // FIXME: Error Handling?
      });
    } else if(req.query.action === 'store') {
      // console.log('BODY:', req.body);
      // console.log('POSTDATA', req.body.postData);
      var credential = JSON.parse(req.body.jsonPostData);
      var storageCallback = req.query.storageCallback;
      getDefaultViewVars(req, function(err, vars) {
        if(err) {
          return next(err);
        }
        vars.curator = {};
        vars.curator.credential = credential;
        vars.request = {};
        vars.request.storageCallback = storageCallback;
        vars.request.action = action;
        res.render('credentials.html', vars);
      });

    } else if(req.query.action === undefined) {
      var identity = req.body;

      // store the identity
      if(identity) {
        var privateKeyPem = config.idp.credentialSigningPrivateKey;
        var credentials = identity.credential;

        // ensure that each credential is signed
        async.map(credentials, function(item, callback) {
          if(item['@graph'].signature) {
            return callback(null, item);
          }

          // sign the credential if it doesn't already have a signature
          jsigs.sign(item['@graph'], {
            privateKeyPem: privateKeyPem,
            creator: config.server.baseUri + '/idp/keys/1'
          }, function(err, signedCredential) {
            if(err) {
              return callback(err);
            }
            callback(null, {
              '@graph': signedCredential
            });
          });
        }, function(err, results) {
          if(err) {
            return next(err);
          }
          identity.credential = results;
          _mergeCredentials(identity);
          res.sendStatus(200);
        });
      }
    } else {
      // action did not match
      // FIXME: appropriate name for exception?
      return next(new BedrockError(
        'Invalid action.', 'InvalidAction',
        {'public': true, httpStatusCode: 400}));
    }
  });

  /**
   * Merge the given credentials with the credentials in the database.
   *
   * @param identity the identity to take the credentials from.
   */
  function _mergeCredentials(identity) {
    if(!gCredentials[identity.id]) {
      gCredentials[identity.id] = [];
    }
    gCredentials[identity.id] =
      _.union(gCredentials[identity.id], identity.credential);
  };

}
