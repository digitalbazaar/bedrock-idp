/*
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var _ = require('lodash');
var async = require('async');
var auth = require('./auth');
var bedrock = require('bedrock');
var brIdentity = require('bedrock-identity');
var util = require('util');
var LocalStrategy = require('passport-local');

// export strategy
module.exports = Strategy;

/**
 * Creates a new PasswordStrategy for use with passport.
 *
 * @param options the options to pass to the parent LocalStrategy.
 */
function Strategy(options) {
  options = _.assign({}, options || {});
  if(!('usernameField' in options)) {
    options.usernameField = 'sysIdentifier';
  }
  if(!('passwordField' in options)) {
    options.passwordField = 'password';
  }
  options.passReqToCallback = true;
  LocalStrategy.Strategy.call(
    this, options, function(req, identifier, password, callback) {
    async.auto({
      resolve: function(callback) {
        auth.resolveIdentityIdentifier(identifier, callback);
      },
      resolveUsername: ['resolve', function(callback, results) {
        // skip resolution of username if not present or if matches
        // sysIdentifier
        if(!('username' in req.body) ||
          req.body.username === identifier) {
          return callback(null, results.resolve);
        }
        auth.resolveIdentityIdentifier(req.body.username, callback);
      }],
      verify: ['resolveUsername', function(callback, results) {
        if(results.resolve !== results.resolveUsername) {
          // return no matches; do not leak information about mismatched
          // username
          return callback(null, []);
        }

        // try to authenticate each possible identity ID
        var matches = [];
        async.each(results.resolve, function(id, callback) {
          auth.verifyPassword({
            id: id,
            sysPassword: password
          }, function(err, verified) {
            if(err) {
              return callback(err);
            }
            if(verified) {
              matches.push(id);
            }
            callback();
          });
        }, function(err) {
          callback(err, matches);
        });
      }]
    }, function(err, results) {
      if(err) {
        return callback(err);
      }
      var matches = results.verify;
      if(matches.length === 0) {
        return callback(null, false, {message: 'Invalid login credentials.'});
      }
      // multiple identities authenticated, simply pass (do not do success)
      if(matches.length > 1) {
        return callback(null, false, {
          message: 'Multiple identity matches.',
          email: identifier,
          matches: matches
        });
      }
      // single identity match, populate and return success
      if(matches.length === 1) {
        // look up identity
        var actor = {id: matches[0]};
        async.auto({
          getIdentity: function(callback) {
            brIdentity.get(actor, matches[0], function(err, identity) {
              callback(err, identity);
            });
          }
        }, function(err, results) {
          callback(err, {identity: results.getIdentity});
        });
      }
    });
  });
  this.name = 'bedrock-idp.password';
}
util.inherits(Strategy, LocalStrategy.Strategy);
