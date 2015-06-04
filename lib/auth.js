/*
 * Bedrock Identity Provider Authorization module.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var async = require('async');
var bcrypt = require('bcrypt');
var bedrock = require('bedrock');
var brIdentity = require('bedrock-identity');
var database = require('bedrock-mongodb');
var jsigs = require('jsonld-signatures');
var rest = require('bedrock-rest');
var BedrockError = bedrock.util.BedrockError;

// load config defaults
require('./config');

// configure jsigs using local bedrock jsonld instance; will load
// contexts from local config when available
jsigs = jsigs({}, {
  inject: {jsonld: bedrock.jsonld}
});

// module API
var api = {};
module.exports = api;

bedrock.events.on('bedrock-mongodb.ready', function init(callback) {
  async.auto({
    openCollections: function(callback) {
      database.openCollections(['identity'], callback);
    },
    createIndexes: ['openCollections', function(callback) {
      database.createIndexes([{
        collection: 'identity',
        fields: {'identity.sysSlug': 1},
        options: {unique: true, background: false}
      }, {
        collection: 'identity',
        fields: {'identity.email': 1},
        options: {unique: false, background: false}
      }], callback);
    }]
  }, function(err) {
    callback(err);
  });
});

bedrock.events.on('bedrock-express.init', function(app) {
  app.param('identity', rest.idParam);
});

bedrock.events.on('bedrock-views.vars.get', addViewVars);

function addViewVars(req, vars, callback) {
  // add idp vars
  vars.idp = {};
  vars.idp.identityBasePath = bedrock.config.identity.basePath;
  vars.idp.identityBaseUri =
    vars.baseUri + bedrock.config.identity.basePath;
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
 * Gets the Identity ID(s) that match the given email address.
 *
 * @param email the email address.
 * @param callback(err, identityIds) called once the operation completes.
 */
api.resolveEmail = function(email, callback) {
  database.collections.identity.find(
    {'identity.email': email},
    {'identity.id': true}).toArray(function(err, records) {
    if(records) {
      records.forEach(function(record, i) {
        records[i] = record.identity.id;
      });
    }
    callback(err, records);
  });
};

/**
 * Gets the Identity ID that matches the given identity name (ID or slug). The
 * Identity ID will be null if none is found. If a full identity ID is passed,
 * it will be passed back in the callback if it is valid.
 *
 * @param name the identity name (ID or slug).
 * @param callback(err, identityId) called once the operation completes.
 */
api.resolveIdentitySlug = function(name, callback) {
  database.collections.identity.findOne(
    {$or: [{id: database.hash(name)}, {'identity.sysSlug': name}]},
    {'identity.id': true},
    function(err, result) {
      if(!err && result) {
        result = result.identity.id;
      }
      callback(err, result);
    });
};

/**
 * Gets the Identity IDs that match the given identifier. The identifier
 * can be an Identity ID, an Identity slug, or an email address.
 *
 * @param identifier the identifier to resolve.
 * @param callback(err, identityIds) called once the operation completes.
 */
api.resolveIdentityIdentifier = function(identifier, callback) {
  // looks like an email
  if(identifier.indexOf('@') !== -1) {
    return api.resolveEmail(identifier, callback);
  }
  // must be an identity or slug
  api.resolveIdentitySlug(identifier, function(err, identityId) {
    if(err) {
      return callback(err);
    }
    if(!identityId) {
      return callback(null, []);
    }
    // arrayify result
    callback(null, [identityId]);
  });
};

/**
 * Sets an Identity's password. This method can optionally check an old password
 * or passcode and will always generate a new passcode and set it as
 * 'sysPasscode'. A new password doesn't have to be set using this method, it
 * can be called to simply generate a new passcode. If 'sysPassword' is
 * provided, it must be the old password and it will be checked. The same
 * applies to 'sysPasscode'. If a new password is to be set, it should be
 * passed as 'sysPasswordNew'.
 *
 * @param actor the Identity performing the action.
 * @param identity the Identity.
 * @param callback(err, changes) called once the operation completes.
 */
api.setIdentityPassword = function(actor, identity, callback) {
  var changes = {};
  async.auto({
    checkPermission: function(callback) {
      api.checkPermission(
        actor, PERMISSIONS.IDENTITY_EDIT, {resource: identity}, callback);
    },
    checkPassword: ['checkPermission', function(callback) {
      if('sysPassword' in identity) {
        return api.verifyIdentityPassword(identity, callback);
      }
      callback(null, null);
    }],
    checkPasscode: ['checkPermission', function(callback) {
      if('sysPasscode' in identity) {
        return api.verifyIdentityPasscode(identity, callback);
      }
      callback(null, null);
    }],
    hashPassword: ['checkPassword', 'checkPasscode', function(
      callback, results) {
      if(results.checkPassword === false) {
        return callback(new BedrockError(
          'Could not update identity password; invalid password.',
          'InvalidPassword'));
      }
      if(results.checkPasscode === false) {
        return callback(new BedrockError(
          'Could not update identity passcode; invalid passcode.',
          'InvalidPasscode'));
      }
      if('sysPasswordNew' in identity) {
        return api.createPasswordHash(identity.sysPasswordNew, callback);
      }
      callback();
    }],
    generatePasscode: ['hashPassword', function(callback, results) {
      if(results.hashPassword) {
        changes.sysPassword = results.hashPassword;
      }
      var passcode = identity.sysPasscode = _generatePasscode();
      api.createPasswordHash(passcode, callback);
    }],
    update: ['generatePasscode', function(callback, results) {
      changes.sysPasscode = results.generatePasscode;
      database.collections.identity.update(
        {id: database.hash(identity.id)},
        {$set: database.buildUpdate(changes, 'identity')},
        database.writeOptions,
        function(err, result) {
          if(err) {
            return callback(err);
          }
          if(result.result.n === 0) {
            return callback(new BedrockError(
              'Could not set Identity password. Identity not found.',
              'NotFound'));
          }
          callback();
        });
    }]
  }, function(err) {
    callback(err, changes);
  });
};

/**
 * Verifies the Identity's password against the stored password.
 *
 * @param identity the Identity with the password to verify.
 * @param callback(err, verified) called once the operation completes.
 */
api.verifyIdentityPassword = function(identity, callback) {
  _verifyIdentityPasswordHash(identity, 'password', callback);
};

/**
 * Verifies the Identity's passcode against the stored passcode.
 *
 * @param identity the Identity with the passcode to verify.
 * @param callback(err, verified) called once the operation completes.
 */
api.verifyIdentityPasscode = function(identity, callback) {
  _verifyIdentityPasswordHash(identity, 'passcode', callback);
};

/**
 * Verifies the Identity's passcode against the stored passcode and sets
 * the Identity's email address as verified upon success.
 *
 * @param actor the Identity performing the action.
 * @param identity the Identity with the passcode to verify.
 * @param callback(err, verified) called once the operation completes.
 */
api.verifyIdentityEmail = function(actor, identity, callback) {
  async.waterfall([
    function(callback) {
      api.checkPermission(
        actor, PERMISSIONS.IDENTITY_EDIT, {resource: identity}, callback);
    },
    function(callback) {
      _verifyIdentityPasswordHash(identity, 'passcode', callback);
    },
    function(verified, callback) {
      if(!verified) {
        return callback(null, verified);
      }
      database.collections.identity.update(
        {id: database.hash(identity.id)},
        {$set: {'identity.sysEmailVerified': true}},
        database.writeOptions, function(err) {
          callback(err, verified);
      });
    }
  ], callback);
};

/**
 * Sends an Identity's or multiple Identity's passcodes to their contact point
 * (eg: email address). The Identities must all have the same contact point and
 * must be populated.
 *
 * @param identities the Identities to send the passcode to.
 * @param usage 'reset' if the passcode is for resetting a password,
 *          'verify' if it is for verifying an email address/contact point.
 * @param callback(err) called once the operation completes.
 */
api.sendIdentityPasscodes = function(identities, usage, callback) {
  // FIXME: require actor and check permissions to send email/sms/etc?

  // create event
  var event = {
    type: 'bedrock.Identity.passcodeSent',
    details: {
      usage: usage,
      identities: [],
      email: null
    }
  };

  // generate passcodes for every identity
  async.each(identities, function(identity, callback) {
    // remove password and passcode from identity; this prevents checking
    // passwords/passcodes and only generates a new passcode
    identity = bedrock.util.clone(identity);
    delete identity.sysPassword;
    delete identity.sysPasscode;
    api.setIdentityPassword(null, identity, function(err) {
      if(err) {
        return callback(err);
      }
      event.details.identities.push(identity);
      if(!event.details.email) {
        event.details.email = identity.email;
      } else if(event.details.email !== identity.email) {
        return callback(new BedrockError(
          'Could not send Identity passcodes. The identities do not all ' +
          'have the same contact point (eg: email address).',
          'ContactPointMismatch'));
      }
      callback();
    });
  }, function(err) {
    if(err) {
      return callback(err);
    }

    // emit passcode sent event
    bedrock.events.emitLater(event);
    // TODO: limit # emails sent per identity per day
    // TODO: use job scheduler for this?
    callback();
  });
};

/**
 * Creates a password hash that can be stored and later used to verify a
 * password at a later point in time.
 *
 * @param password the password to hash.
 * @param callback(err, hash) called once the operation completes.
 */
api.createPasswordHash = function(password, callback) {
  bcrypt.genSalt(function(err, salt) {
    if(err) {
      return callback(err);
    }
    bcrypt.hash(password, salt, function(err, hash) {
      callback(err, 'bcrypt:' + hash);
    });
  });
};

/**
 * Verifies a password against a previously generated password hash. The
 * hash value should have been generated via createPasswordHash() or by
 * a supported legacy method.
 *
 * @param hash the hash value to verify against.
 * @param password the password to verify.
 * @param callback(err, verified, legacy) called once the operation completes.
 */
api.verifyPasswordHash = function(hash, password, callback) {
  var fields = hash.split(':');
  if(fields.length !== 2 && fields.length !== 3) {
    return callback(new BedrockError(
      'Could not verify password hash. Invalid input.',
      'MalformedPasswordHash'));
  }
  // bcrypt hash
  if(fields[0] === 'bcrypt') {
    return bcrypt.compare(password, fields[1], function(err, verified) {
      callback(err, verified, false);
    });
  }
  // unknown algorithm
  callback(new BedrockError(
    'Could not verify password hash. Invalid input.',
    'MalformedPasswordHash'));
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
  async.waterfall([
    function(callback) {
      // get identity service owner identity
      var owner = bedrock.config.identity.owner;
      api.getIdentity(null, owner, function(err, ownerIdentity) {
        callback(err, ownerIdentity);
      });
    },
    function(ownerIdentity, callback) {
      _getSigningKey(ownerIdentity, callback);
    },
    function(publicKey, callback) {
      // setup options
      var privateKey = publicKey.privateKey;
      var _options = {
        privateKeyPem: privateKey,
        creator: publicKey.id
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
    }
  ], callback);
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
    return api.getIdentityPublicKey({
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
  api.getIdentityPublicKeys(identity.id, null, function(err, records) {
    for(var i = 0; i < records.length; ++i) {
      var key = records[i].publicKey;
      if('privateKey' in key) {
        return callback(null, key);
      }
    }
    callback(new BedrockError(
      'Signing key not found.',
      'NotFound'));
  });
}

/**
 * A helper function for verifying passwords and passcodes.
 *
 * @param identity the Identity with the password or passcode.
 * @param type 'password' or 'passcode'.
 * @param callback(err, verified) called once the operation completes.
 */
function _verifyIdentityPasswordHash(identity, type, callback) {
  var field = 'sys' + type[0].toUpperCase() + type.substr(1);
  async.waterfall([
    function(callback) {
      // get status and <type> from db
      var fields = {'identity.sysStatus': true};
      fields['identity.' + field] = true;
      database.collections.identity.findOne(
        {id: database.hash(identity.id)}, fields, callback);
    },
    function(record, callback) {
      if(!record) {
        return callback(new BedrockError(
          'Could not verify Identity ' + type + '. Identity not found.',
          'NotFound'));
      }
      if(record.identity.sysStatus !== 'active') {
        return callback(new BedrockError(
          'Could not verify Identity ' + type + '. Identity is not active.',
          'IdentityInactive'));
      }
      callback(null, record.identity[field]);
    },
    function(hash, callback) {
      api.verifyPasswordHash(hash, identity[field], callback);
    },
    function(verified, legacy) {
      if(!verified || !legacy) {
        return callback(null, verified);
      }

      // update legacy password
      api.createPasswordHash(identity[field], function(err, hash) {
        var update = {$set: {}};
        update.$set['identity.' + field] = hash;
        database.collections.identity.update(
          {id: database.hash(identity.id)}, update,
          database.writeOptions,
          function(err) {
            callback(err, verified);
          });
      });
      callback(null, verified);
    }
  ], callback);
}

// static passcode character set
var CHARSET = (
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');

/**
 * Generates a passcode for resetting a password. This passcode must be
 * stored using a password hash in the database.
 *
 * @return the generated passcode.
 */
function _generatePasscode() {
  // passcodes are 8 chars long
  var rval = '';
  for(var i = 0; i < 8; ++i) {
    rval += CHARSET.charAt(parseInt(Math.random() * (CHARSET.length - 1), 10));
  }
  return rval;
}
