/*
 * Bedrock Identity Provider module.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var async = require('async');
var bedrock = require('bedrock');
var rest = require('bedrock-rest');

// load config defaults
require('./config');

// module API
var api = {};
module.exports = api;

require('./services.identifier');
require('./services.identity');
require('./services.key');
require('./services.session');
require('./services.well-known');

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
  vars.idp.session.identity = bedrock.tools.clone(req.user.identity);

  async.auto({
    // TODO: get identities that session identity is a memberOf? (orgs)
    getIdentities: function(callback) {
      callback();
    }
  }, function(err) {
    callback(err);
  });
}
