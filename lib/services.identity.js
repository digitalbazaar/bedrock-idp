/*
 * Copyright (c) 2012-2016 Digital Bazaar, Inc. All rights reserved.
 */
var _ = require('lodash');
var async = require('async');
var auth = require('./auth');
var bedrock = require('bedrock');
var brIdentity = require('bedrock-identity');
var brKey = require('bedrock-key');
var brPassport = require('bedrock-passport');
var brPassword = require('bedrock-authn-password');
var brRest = require('bedrock-rest');
var cors = require('cors');
var database = require('bedrock-mongodb');
var docs = require('bedrock-docs');
var jsonld = bedrock.jsonld;
var store = require('bedrock-credentials-mongodb').provider;
var url = require('url');
var util = require('util');
var views = require('bedrock-views');

var BedrockError = bedrock.util.BedrockError;
var validate = require('bedrock-validation').validate;
var ensureAuthenticated = brPassport.ensureAuthenticated;
var getDefaultViewVars = views.getDefaultViewVars;

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
                return next(new BedrockError(
                  'Could not create a session for the newly created identity.',
                  'AutoLoginFailed', {}, err));
              }
              // return identity
              var localId = auth.createIdentityId(req.body.sysSlug);
              res.set('Location', localId);
              res.status(201).json(results.identity);
            });
          }
        ], function(err) {
          if(err) {
            return next(err);
          }
        });
      });
  }

  app.post(bedrock.config.idp.identityBasePath,
    ensureAuthenticated,
    validate({
      query: 'services.identity.postIdentitiesQuery',
      body: 'services.identity.postIdentities'
    }),
    function(req, res, next) {
      // do identity credentials query
      if(req.query.action === 'query') {
        return _getCredentials(req, res, next);
      }

      // do create identity
      var identity = {};
      identity['@context'] = bedrock.config.constants.IDENTITY_CONTEXT_V1_URL;
      // TODO: allow DID to be specified (if `id` is present, ensure it is
      // validated as a DID w/a validator fix above; only add a local `id` if
      // no `id` (DID) was given)
      identity.id = auth.createIdentityId(req.body.sysSlug);
      identity.type = req.body.type || 'Identity';
      identity.sysSlug = req.body.sysSlug;
      identity.label = req.body.label;

      // conditional values only set if present
      if(req.body.description) {
        identity.description = req.body.description;
      }
      if(req.body.image) {
        identity.image = req.body.image;
      }
      if(req.body.sysGravatarType) {
        identity.sysGravatarType = req.body.sysGravatarType;
      }
      if(req.body.sysImageType) {
        identity.sysImageType = req.body.sysImageType;
      }
      if(req.body.sysPublic) {
        identity.sysPublic = req.body.sysPublic;
      }
      if(req.body.url) {
        identity.url = req.body.url;
      }

      // add identity
      auth.createIdentity(
        req.user.identity, identity, function(err) {
        if(err) {
          if(database.isDuplicateError(err)) {
            return next(new BedrockError(
              'The identity is a duplicate and could not be added.',
              'DuplicateIdentity', {
                identity: identity.id,
                httpStatusCode: 409,
                'public': true
              }));
          }
          return next(new BedrockError(
            'The identity could not be added.',
            'AddIdentityFailed', {
              httpStatusCode: 400,
              'public': true
            }, err));
        }
        // return identity
        res.set('Location', identity.id);
        res.status(201).json(identity);
      });
    });
  docs.annotate.post(bedrock.config.idp.identityBasePath, {
    displayName: 'Managing Identity',
    description: 'Create a new identity on the system.',
    securedBy: ['cookie', 'hs1'],
    schema: 'services.identity.postIdentities',
    querySchema: 'services.identity.postIdentitiesQuery',
    responses: {
      201: 'Identity creation was successful. The Location header will ' +
        'contain the URL identifier for the identity.',
      400: 'The identity was rejected. ' +
        'Error details will be included in the response body.',
      409: 'The identity was rejected because it is a duplicate.'
    }
  });

  app.get(bedrock.config.idp.identityBasePath,
    ensureAuthenticated,
    validate({query: 'services.identity.getIdentitiesQuery'}),
    function(req, res, next) {
      if(req.query.service === 'add-key') {
        // logged in at this point, redirect to keys page and preserve query
        var urlObj = url.parse(req.originalUrl);
        urlObj.pathname = util.format(
          '%s/%s/keys',
          urlObj.pathname,
          req.user.identity.sysSlug);
        var redirUrl = url.format(urlObj);
        res.redirect(307, redirUrl);
        return;
      }

      res.sendStatus(404);
      /*
      // TODO: get identities that current identity is a memberOf? (orgs?)

      // FIXME: use .auto instead?
      async.waterfall([
        function(callback) {
          brIdentity.get(req.user.identity, req.user.identity.id, callback);
        },
        function(identity, identityMeta, callback) {
          // get all related identities
          _getIdentities(req, function(err, identities) {
            callback(err, identity, identityMeta, identities);
          });
        },
        function(identity, identityMeta, identities) {
          getDefaultViewVars(req, function(err, vars) {
            if(err) {
              return callback(err);
            }
            vars.identity = identity;
            vars.identityMeta = identityMeta;
            vars.identities = identities;
            res.render('main.html', vars);
          });
        }
      ], function(err) {
        if(err) {
          next(err);
        }
      });
      */
    });
  docs.annotate.get(bedrock.config.idp.identityBasePath, {
    description: 'Discover the endpoint of a particular identity service. ' +
      'This method is typically used by a 3rd party website that wants to ' +
      'perform operations on an unknown identity, like adding a public key, ' +
      'but does not know the exact service URL for the operation.' +
      'Valid actions include \'query\', and valid services include ' +
      '\'add-key\'.',
    securedBy: ['cookie', 'hs1'],
    querySchema: 'services.identity.getIdentitiesQuery',
    responses: {
      307: 'A redirect to the location of the actual service.',
      404: 'The request did not result in an action.'
    }
  });

  app.post(idPath,
    ensureAuthenticated,
    validate('services.identity.postIdentity'),
    function(req, res, next) {
      async.auto({
        getId: auth.getIdentityIdFromUrl.bind(null, req),
        update: ['getId', function(callback, results) {
          // check id matches
          if(req.body.id !== results.getId) {
            return callback(new BedrockError(
              'Identity mismatch.',
              'IdentityMismatch', {
                identity: results.getId,
                httpStatusCode: 400,
                'public': true
              }));
          }

          var identity = {id: results.getId};

          // conditional values only set if preset
          if(req.body.description) {
            identity.description = req.body.description;
          }
          if(req.body.image) {
            identity.image = req.body.image;
          }
          if(req.body.label) {
            identity.label = req.body.label;
          }
          if(req.body.sysGravatarType) {
            identity.sysGravatarType = req.body.sysGravatarType;
          }
          if(req.body.sysImageType) {
            identity.sysImageType = req.body.sysImageType;
          }
          if(req.body.sysPublic) {
            identity.sysPublic = req.body.sysPublic;
          }
          if(req.body.sysSigningKey) {
            identity.sysSigningKey = req.body.sysSigningKey;
          }
          if(req.body.url) {
            identity.url = req.body.url;
          }

          // FIXME: allow changes to identity type?
          /*
          //identity.type = req.body.type;
          */

          // TODO: replace/implement/reimplement `update`
          // update identity
          brIdentity.update(req.user.identity, identity, callback);
        }]
      }, function(err) {
        if(err) {
          return next(err);
        }
        res.sendStatus(204);
      });
    });
  docs.annotate.post(idPath, {
    description: 'Update an existing identity on the system.',
    securedBy: ['cookie', 'hs1'],
    schema: 'services.identity.postIdentity',
    responses: {
      204: 'The identity was updates successfully.',
      400: 'The provided identity did not match any in the database.'
    }
  });

  // authentication not required
  app.options(idPath, cors());
  app.get(idPath, cors(), function(req, res, next) {
    // FIXME: refactor this ... just put data into the identity like how
    // it is returned when application/ld+json is accepted?
    var data = {};

    // FIXME: optimize this
    async.auto({
      getId: auth.getIdentityIdFromUrl.bind(null, req),
      getIdentity: ['getId', function(callback, results) {
        // get identity without permission check
        brIdentity.get(null, results.getId, function(err, identity, meta) {
          if(err) {
            return callback(err);
          }
          data.privateIdentity = identity;

          // determine if requestor is the identity
          var isIdentity = (req.isAuthenticated() &&
            identity.id === req.user.identity.id);
          if(isIdentity) {
            data.identity = identity;
          } else {
            var actor;
            if(req.user && req.user.identity) {
              actor = req.user.identity;
            }
            var query = {
              recipient: database.hash(results.getId),
              // FIXME: unindexed query
              'credential.sysPublic': '*'
            };
            return store.getAll(actor, query, {}, {limit: 1},
              function(err, records) {
                // if a did-based identity and nothing public
                var isPrivateDid = (results.getId.indexOf('did:') === 0 &&
                  identity.sysPublic.length === 0);
                var noPublicCreds = (records.length === 0);
                // assume hidden if private and no public creds
                if(err || (isPrivateDid && noPublicCreds)) {
                  return callback(new BedrockError(
                    'Identity not found.', 'NotFound', {
                      httpStatusCode: 404,
                      public: true
                    }));
                }

                // only include public info
                data.publicIdentity = {
                  '@context': bedrock.config.constants.IDENTITY_CONTEXT_V1_URL,
                  id: identity.id,
                  // FIXME: always exposes all types
                  type: identity.type
                };
                identity.sysPublic.forEach(function(field) {
                  data.publicIdentity[field] = identity[field];
                });
                data.identity = data.publicIdentity;
                data.identityMeta = meta;
                callback(null, identity);
              });
          }
          data.identityMeta = meta;
          callback(null, identity);
        });
      }],
      getViewVars: ['getIdentity', function(callback) {
        // FIXME: can be skipped if not sending html
        getDefaultViewVars(req, function(err, vars) {
          if(err) {
            return callback(err);
          }
          data.vars = vars;
          //vars.identity = data.identity;
          //vars.identityMeta = data.identityMeta;
          callback();
        });
      }],
      getKeys: ['getId', 'getIdentity', function(callback, results) {
        // get identity's keys
        var idForKeys = results.getId;
        // use local id if identity uses a 'did:'
        if(idForKeys.indexOf('did:') === 0) {
          idForKeys = auth.createIdentityId(results.getIdentity.sysSlug);
        }
        brKey.getPublicKeys(idForKeys, function(err, records) {
          callback(err, records);
        });
      }],
      getActiveKeys: ['getKeys', 'getViewVars', function(callback, results) {

        // FIXME: if getViewVars is bypassed, data.vars.keys will fail
        var keys = data.keys = data.vars.keys = [];
        results.getKeys.forEach(function(record) {
          var key = record.publicKey;
          if(key.sysStatus === 'active') {
            keys.push(key);
          }
        });
        callback(null);
      }]
    }, function(err) {
      if(err) {
        return next(err);
      }

      function ldjson() {
        // build identity w/embedded keys
        var identity = data.identity;
        for(var i = 0; i < data.keys.length; ++i) {
          var key = data.keys[i];
          delete key['@context'];
          delete key.publicKeyPem;
          delete key.sysStatus;
          jsonld.addValue(identity, 'publicKey', key);
        }
        res.json(identity);
      }
      res.format({
        'application/ld+json': ldjson,
        json: ldjson,
        html: function() {
          res.render('main.html', data.vars);
        }
      });
    });
  });
  docs.annotate.get(idPath, {
    description: 'Retrieve an existing identity on the system.',
    securedBy: ['null', 'cookie', 'hs1'],
    responses: {
      200: {
        'application/ld+json': {
          example: 'examples/get.identity.jsonld'
        }
      },
      404: 'The identity was not found on the system.'
    }
  });

  // TODO: determine if DID-based keys should be returned
  // API for getting all keys (including DID-based keys?)
  app.options(idPath + '/keys', cors());
  app.get(idPath + '/keys',
    cors(),
    brRest.when.prefers.ld,
    brRest.linkedDataHandler({
      get: function(req, res, callback) {
        var identityId = auth.createIdentityId(req.params.identity);
        brKey.getPublicKeys(identityId, function(err, records) {
          if(err) {
            return callback(err);
          }
          callback(err, records ? _.map(records, 'publicKey') : null);
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

/**
 * Gets the credentials for the identity specified in the request query.
 *
 * @param req the request.
 * @param res the response.
 * @param next the next route handler.
 */
function _getCredentials(req, res, next) {
  // TODO: support no callback case
  // if present, callback must start with 'https://'
  if(!req.query.callback ||
    (!bedrock.config.idp.allowInsecureCallback &&
    req.query.callback.indexOf('https://') !== 0)) {
    return next(new BedrockError(
      'The Identity credentials callback must be an absolute URL that uses ' +
      'the HTTPS protocol.',
      'InvalidCallback', {
        callback: req.query.callback,
        httpStatusCode: 400,
        'public': true
      }));
  }

  brRest.makeResourceHandler({
    get: function(req, res, callback) {
      // parse and validate query
      var query;
      try {
        query = JSON.parse(req.body.query);
      } catch(e) {}
      validate('identityCredentialsQuery', query, function(err) {
        if(err) {
          return callback(err);
        }
        if(req.query.authorize === 'true') {
          // TODO: actually process query to create identity response
          var identity = {'@context': 'https://w3id.org/identity/v1'};
          if('id' in query) {
            identity.id = req.user.identity.id;
          }

          // sign identity as identity service
          return auth.signJsonLdAsIdentityService(identity, {
            domain: req.query.domain
          }, function(err, signedIdentity) {
            // use identity as resource
            callback(err, signedIdentity);
          });
        }
        // use query as resource
        callback(null, query);
      });
    },
    templateNeedsResource: true,
    updateVars: function(resource, vars, callback) {
      vars.idp.identityCredentials = {
        query: resource,
        domain: req.query.domain,
        callback: req.query.callback
      };
      callback();
    }
  })(req, res, next);
}
