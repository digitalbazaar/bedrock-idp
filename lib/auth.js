/*
 * Bedrock Identity Provider Authorization module.
 *
 * Copyright (c) 2012-2016 Digital Bazaar, Inc. All rights reserved.
 */
/* jshint node: true */
'use strict';

var _ = require('lodash');
var async = require('async');
var bedrock = require('bedrock');
var brIdentity = require('bedrock-identity');
var brKey = require('bedrock-key');
var brPassport = require('bedrock-passport');
var config = bedrock.config;
var database = require('bedrock-mongodb');
var didio = require('did-io');
var jsigs = require('jsonld-signatures');
var mail = require('bedrock-mail');
var request = require('request');
var rest = require('bedrock-rest');
var util = require('util');
var BedrockError = bedrock.util.BedrockError;

require('bedrock-credential-curator');
require('bedrock-session-http');
require('bedrock-session-mongodb');
require('bedrock-consumer');

// load config defaults
require('./config');

bedrock.events.on('bedrock.test.configure', function() {
  // load test config
  require('./test.config');
});

// configure jsigs using local bedrock jsonld instance; will load
// contexts from local config when available
jsigs = jsigs({inject: {jsonld: bedrock.jsonld}});

// configure didio
didio = didio({inject: {jsonld: bedrock.jsonld}});

// module permissions
var PERMISSIONS = config.permission.permissions;

// module API
var api = {};
module.exports = api;

var logger = bedrock.loggers.get('app');

bedrock.events.on('bedrock.init', function(callback) {
  if(config.idp.keys.length > 0) {
    logger.warning(
      'Move config.idp.keys values to config.key.keys');
    // append old config keys to new config keys
    var keys = config.key.keys;
    keys.push.apply(keys, config.idp.keys);
  }

  // skip DID registration
  if(!config.idp.owner.didDocument ||
    !config.idp.owner.privateKey) {
    return callback();
  }

  var did = config.idp.owner.id;

  didio.use('async', async);
  didio.use('jsigs', jsigs);
  didio.use('request', request);
  didio.use('_', _);
  var options = {
    baseUrl: config.idp.owner.didRegistrationUrl,
    didDocument: config.idp.owner.didDocument,
    privateKeyPem: config.idp.owner.privateKey,
    strictSSL: config.idp.owner.registerWithStrictSSL
  };
  didio.registerDid(options, callback);
});

bedrock.events.on('bedrock-mongodb.ready', function init(callback) {
  async.auto({
    openCollections: function(callback) {
      database.openCollections(['identity'], callback);
    },
    createIndexes: ['openCollections', function(callback) {
      database.createIndexes([{
        collection: 'identity',
        // TODO: move `sysSlug` to meta?
        fields: {'identity.sysSlug': 1},
        options: {unique: true, background: false}
      }, {
        collection: 'identity',
        fields: {'identity.email': 1},
        options: {unique: false, background: false}
      }], callback);
    }],
    createIdentities: ['createIndexes', function(callback) {
      // create identities, ignoring duplicate errors
      async.eachSeries(
        config.idp.identities,
        function(i, callback) {
          api.createIdentity(null, i, function(err) {
            if(err && database.isDuplicateError(err)) {
              err = null;
            }
            callback(err);
          });
        },
        callback);
    }],
    registerTriggers: ['createIndexes', function(callback) {
      mail.registerTrigger('getIdentity', function(event, callback) {
        brIdentity.get(null, event.details.identityId, function(err, identity) {
          if(!err) {
            event.details.identity = identity;
          }
          callback(err);
        });
      });
      callback();
    }]
  }, function(err) {
    callback(err);
  });
});

bedrock.events.on('bedrock-express.init', function(app) {
  app.param('identity', rest.idParam);
});

bedrock.events.on('bedrock-session-http.session.get', function(req, session) {
  if(req.isAuthenticated()) {
    // FIXME: temporary overwrite that exposes all server-side identity
    // information; restrict what is exposed
    session.identity = req.user.identity;
  }
});

bedrock.events.on('bedrock-views.vars.get', addViewVars);

function addViewVars(req, vars, callback) {
  // add idp vars
  vars.idp = {};
  vars.idp.identityBasePath = config.idp.identityBasePath;
  vars.idp.identityBaseUri = vars.baseUri + vars.idp.identityBasePath;
  vars.idp.owner = {id: config.idp.owner.id};
  vars.idp.session = {};

  if(!req.isAuthenticated()) {
    return callback();
  }

  // include authenticated identity in session
  vars.idp.session.identity = bedrock.util.clone(req.user.identity);

  async.auto({
    // TODO: get identities that session identity is a memberOf? (orgs)
    getIdentities: function(callback) {
      callback();
    }
  }, function(err) {
    callback(err);
  });
}

/**
 * Creates a local (non-DID) Identity ID from the given name.
 *
 * @param name the short identity name (slug).
 *
 * @return the local (non-DID) Identity ID for the Identity.
 */
api.createIdentityId = function(name) {
  return util.format('%s%s/%s',
    config.server.baseUri,
    config.idp.identityBasePath,
    encodeURIComponent(name));
};

/**
 * Creates a new Identity. The Identity must contain `id`.
 *
 * @param actor the Identity performing the action.
 * @param identity the Identity containing at least the minimum required data.
 * @param callback(err, record) called once the operation completes.
 */
api.createIdentity = function(actor, identity, callback) {
  // TODO: move password/passcode to meta
  async.auto({
    checkDuplicate: function(callback) {
      // check for a duplicate to prevent generating password hashes
      database.collections.identity.findOne(
        {'identity.sysSlug': identity.sysSlug}, {'identity.sysSlug': true},
        function(err, record) {
          if(err) {
            return callback(err);
          }
          if(record) {
            // simulate duplicate identity error
            err = new Error('Duplicate Identity.');
            err.name = 'MongoError';
            err.code = 11000;
            return callback(err);
          }
          callback();
        });
    },
    setDefaults: ['checkDuplicate', function(callback) {
      var defaults = bedrock.util.clone(config.idp.defaults);
      // add identity defaults
      identity = bedrock.util.extend(
        {}, defaults.identity, bedrock.util.clone(identity));
      // create identity ID from slug if not present
      if(!('id' in identity)) {
        identity.id = api.createIdentityId(identity.sysSlug);
      }

      // if using a 'did:', add resource role for local id
      if(identity.id.indexOf('did:') === 0) {
        identity.sysResourceRole = identity.sysResourceRole || [];
        identity.sysResourceRole.push({
          sysRole: 'identity.registered',
          resource: [api.createIdentityId(identity.sysSlug)]
        });
      }
      callback();
    }],
    insert: ['setDefaults', function(callback, results) {
      // insert the identity
      var now = Date.now();
      var record = {
        id: database.hash(identity.id),
        meta: {
          created: now,
          updated: now
        },
        identity: identity
      };
      brIdentity.insert(null, identity, function(err, record) {
        if(err) {
          return callback(err);
        }
        // return unhashed passcode in record
        // FIXME: is this necessary.  If so, a new solution will need to be
        // implemented since passcode generation is happening elsewhere.
        // record.identity.sysPasscode = results.generatePasscode;
        callback(null, record);
      });
    }]
  }, function(err, results) {
    callback(err, results.insert);
  });
};

/**
 * Gets an IdentityID from the URL parameters in the given request. In the
 * common case, the authenticated user for the request can be used to obtain
 * the ID without an extra database hit.
 *
 * @param req the request.
 * @param callback(err, identityId) called once the operation completes.
 */
api.getIdentityIdFromUrl = function(req, callback) {
  // TODO: determine if this function's usage anywhere leaks DID information
  // through its slug

  // if slug from URL matches authenticated user (common case), then
  // use its ID
  var slug = req.params.identity;
  if(req.isAuthenticated() && req.user && req.user.identity.sysSlug === slug) {
    return callback(null, req.user.identity.id);
  }
  api.resolveIdentitySlug(slug, {error: true}, callback);
};

/**
 * Gets the Identity ID that matches the given identity name (ID or slug). The
 * Identity ID will be null if none is found. If a full identity ID is passed,
 * it will be passed back in the callback if it is valid.
 *
 * @param name the identity name (ID or slug).
 * @param [options] the options to use:
 *          [error] pass a `NotFound` error to the callback if the ID
 *            could not be found.
 * @param callback(err, identityId) called once the operation completes.
 */
api.resolveIdentitySlug = function(name, options, callback) {
  if(typeof options === 'function') {
    callback = options;
    options = {};
  }
  options = options || {};
  database.collections.identity.findOne(
    {$or: [{id: database.hash(name)}, {'identity.sysSlug': name}]},
    {'identity.id': true},
    function(err, result) {
      if(!err) {
        if(result) {
          result = result.identity.id;
        } else if(options.error) {
          err = new BedrockError(
            'Identity not found.', 'NotFound', {
            httpStatusCode: 404,
            public: true
          });
        }
      }
      callback(err, result);
    });
};

/**
 * Updates an Identity's email. Changing the email address will reset
 * its verification status.
 *
 * @param actor the Identity performing the action.
 * @param id the Identity ID.
 * @param email the new email.
 * @param callback(err) called once the operation completes.
 */
api.setEmail = function(actor, id, email, callback) {
  async.auto({
    checkPermission: function(callback) {
      brIdentity.checkPermission(
        actor, PERMISSIONS.IDENTITY_EDIT, {resource: id}, callback);
    },
    update: ['checkPermission', function(callback) {
      // build a database update
      database.collections.identity.update(
        {id: database.hash(id)},
        {$set: {
          'identity.email': email,
          'identity.sysEmailVerified': false
        }}, database.writeOptions, callback);
    }],
    checkUpdate: ['update', function(callback, results) {
      if(results.update.result.n === 0) {
        return callback(new BedrockError(
          'Could not update Identity. Identity not found.',
          'NotFound'));
      }
      callback();
    }]
  }, function(err) {
    callback(err);
  });
};

/**
 * Sign JSON-LD with identity service owner key.
 *
 * @param obj the JSON-LD object to sign.
 * @param options the options to use:
 *   [date] an optional date to override the signature date with.
 *   [domain] an optional domain to include in the signature.
 *   [nonce] an optional nonce to include in the signature.
 * @param callback(err, output) called once the operation completes.
 */
api.signJsonLdAsIdentityService = function(obj, options, callback) {
  async.auto({
    getOwner: function(callback) {
      // get identity service owner identity
      var owner = config.idp.owner.id;
      api.get(null, owner, function(err, ownerIdentity) {
        callback(err, ownerIdentity);
      });
    },
    getSigningKey: ['getOwner', function(callback, results) {
      _getSigningKey(results.getOwner, callback);
    }],
    sign: ['getSigningKey', function(callback, results) {
      // setup options
      var publicKey = results.getSigningKey;
      var privateKey = publicKey.privateKey;
      var _options = {
        privateKeyPem: privateKey,
        creator: publicKey.id,
        algorithm: 'LinkedDataSignature2015'
      };
      if('date' in options) {
        _options.date = options.date;
      }
      if('domain' in options) {
        _options.domain = options.domain;
      }
      if('nonce' in options) {
        _options.nonce = options.nonce;
      }
      // do the signature
      jsigs.sign(obj, _options, callback);
    }]
  }, function(err, results) {
    callback(err, results.sign);
  });
};

/**
 * Try to get a signing key. First try the identity sysSigningKey. Fallback to
 * the first found key with private key data.
 *
 * @param identity the identity of the signer.
 * @param callback(err, signingKey) called once the operation completes.
 */
function _getSigningKey(identity, callback) {
  var sysSigningKey = identity.sysSigningKey;
  if(sysSigningKey) {
    // key id found, get and return the key
    return brKey.getPublicKey({
      id: sysSigningKey
    }, function(err, publicKey, meta, privateKey) {
      if(err) {
        return callback(err);
      }
      publicKey.privateKey = privateKey;
      return callback(null, publicKey);
    });
  }

  // get all keys and return first one with private key
  brKey.getPublicKeys(identity.id, null, function(err, records) {
    if(err) {
      return callback(err);
    }
    for(var i = 0; i < records.length; ++i) {
      var key = records[i].publicKey;
      if('privateKey' in key) {
        return callback(null, key);
      }
    }
    callback(new BedrockError('Signing key not found.', 'NotFound'));
  });
}
