/*
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var async = require('async');
var bedrock = require('bedrock');
var auth = require('./auth');
var brExpress = require('bedrock-express');
var brIdentity = require('bedrock-identity');
var database = require('bedrock-mongodb');
var docs = require('bedrock-docs');
var rest = require('bedrock-rest');
var url = require('url');
var views = require('bedrock-views');

var BedrockError = bedrock.util.BedrockError;
var getDefaultViewVars = views.getDefaultViewVars;
var validate = require('bedrock-validation').validate;

// module API
var api = {};
module.exports = api;

// add routes
bedrock.events.on('bedrock-express.configure.routes', addRoutes);

function addRoutes(app) {
  app.get('/session/login', rest.makeResourceHandler());
  docs.annotate.get('/session/login', {hide: true});

  app.post('/session/login',
    validate('services.session.postLogin'),
    function(req, res, next) {
      auth.login(req, res, next, function(err, user, choice) {
        if(err) {
          return next(err);
        }
        var out = {};
        // multiple identities matched credentials
        if(!user) {
          out.email = choice.email;
          out.identities = choice.identities;
        } else {
          out.identity = user.identity;
        }
        res.json(out);
      });
  });
  docs.annotate.post('/session/login', {
    description: 'Perform a login by posting a username and password.',
    schema: 'services.session.postLogin',
    responses: {
      200: 'The login was successful.',
      400: 'The login was unsuccessful.'
    }
  });

  app.get('/session/logout',
    function(req, res, next) {
      if(req.session) {
        return req.session.destroy(function(err) {
          if(err) {
            next(err);
          }
          res.redirect('/');
        });
      }
      res.redirect('/');
  });
  docs.annotate.get('/session/logout', {
    description: 'Perform a logout which destroys the session cookie.',
    responses: {
      307: 'The logout was successful. The Location header contains ' +
        'the location of the post-logout resource.'
    }
  });

  app.post('/session/password/reset',
    validate('services.session.postPasswordReset'),
    function(req, res, next) {
      // either an identity slug or email address
      var identifier = req.body.sysIdentifier;
      async.waterfall([
        function(callback) {
          auth.resolveIdentityIdentifier(identifier, callback);
        },
        function(identityIds, callback) {
          // try to set password for all identities until one is successful
          var success = 0;
          async.until(function() {return success !== 0;}, function(callback) {
            if(identityIds.length === 0) {
              success = -1;
              return callback();
            }
            var next = identityIds.shift();
            var identity = bedrock.util.clone(req.body);
            identity.id = next;
            auth.setPassword({id: next}, identity, function(err) {
              if(!err) {
                success = 1;
              }
              callback();
            });
          }, function(err) {
            callback(null, success === 1);
          });
        },
        function(success, callback) {
          if(!success) {
            return callback(new BedrockError(
              'The password reset failed for the given identity.',
              'PasswordResetFailed', {
                sysIdentifier: req.body.sysIdentifier,
                httpStatusCode: 403,
                'public': true}));
          }
          callback();
        }
      ], function(err) {
        if(err) {
          return next(err);
        }
        res.sendStatus(204);
      });
  });
  docs.annotate.post('/session/password/reset', {
    description: 'Resets a password given an email address and passcode.',
    schema: 'services.session.postPasswordReset',
    responses: {
      204: 'The password reset was successful.',
      403: 'The password reset failed.'
    }
  });

  app.get('/session/passcode',
    validate({query: 'services.session.getPasscodeQuery'}),
    function(req, res, next) {
    getDefaultViewVars(req, function(err, vars) {
      if(err) {
        return next(err);
      }
      if('passcode' in req.query) {
        vars.idp.sysPasscode = req.query.passcode;
      }
      res.render('passcode.html', vars);
    });
  });
  docs.annotate.get('/session/passcode', {hide: true});

  app.post('/session/passcode',
    validate('services.session.postPasscode'),
    function(req, res, next) {
      var identifier = req.body.sysIdentifier;
      async.waterfall([
        function(callback) {
          auth.resolveIdentityIdentifier(identifier, callback);
        },
        function(identityIds, callback) {
          // identity not found
          if(identityIds.length === 0) {
            return callback(new BedrockError(
              'The given email address is not registered.',
              'otFound', {
                sysIdentifier: req.body.sysIdentifier,
                httpStatusCode: 404,
                'public': true
              }));
          }
          // look up identities
          var query = {id: {$in: []}};
          identityIds.forEach(function(identityId) {
            query.id.$in.push(database.hash(identityId));
          });
          brIdentity.getAll(
            null, query, {identity: true}, function(err, records) {
              if(err) {
                return callback(err);
              }
              // send passcode for every identity match
              var identities = [];
              records.forEach(function(record) {
                identities.push(record.identity);
              });
              // determine passcode usage based on query param
              var usage = 'reset';
              if(req.query.usage === 'verify') {
                usage = 'verify';
              } else if(req.query.usage === 'reset') {
                usage = 'reset';
              }
              auth.sendPasscodes(identities, usage, callback);
            });
        }
      ], function(err) {
        if(err) {
          return next(err);
        }
        res.sendStatus(204);
      });
  });
  docs.annotate.post('/session/passcode', {
    description: 'Send a password reset passcode to the email associated ' +
      'with the given system identifier.',
    schema: 'services.session.postPasscode',
    responses: {
      204: 'The passcode was successfully transmitted to the registered ' +
        'email address.',
      404: 'The given system identifier does not exist in the system.'
    }
  });
}

bedrock.events.on('bedrock-express.configure.errorHandlers', function(app) {
  // handle JSON/JSON-LD errors first
  app.use(brExpress.middleware.jsonErrorHandler());
  // handle permission denied by sending login page
  app.use(function(err, req, res, next) {
    if(err.name !== 'PermissionDenied') {
      return next(err);
    }

    // don't send login page if the method isn't GET or a POST using
    // content type 'application/x-www-form-urlencoded'
    if(!(req.method === 'GET' ||
      (req.method === 'POST' && req.is('urlencoded')))) {
      return next(err);
    }

    // not authenticated, send login page
    getDefaultViewVars(req, function(err, vars) {
      if(err) {
        return next(err);
      }

      // queue current request if not to /session/login
      var parsed = url.parse(req.url, true);
      if(parsed.pathname !== '/session/login') {
        vars.queuedRequest = {
          method: req.method,
          url: req.protocol + '://' + req.get('Host') + req.url,
          body: req.body || {}
        };
      }
      res.render('main.html', vars);
    });
  });
});
