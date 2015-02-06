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
  app.param(':identity', rest.idParam);
});

bedrock.events.on('bedrock-views.vars.get', addViewVars);

function addViewVars(req, vars, callback) {
  // make some config vars available to client
  vars.clientData.contextUrls.identity =
    bedrock.config.constants.IDENTITY_CONTEXT_V1_URL;
  // TODO: should probably be using vars.public.<module-name/abbr>.foo
  vars.clientData.identityBasePath = bedrock.config.identity.basePath;
  vars.clientData.identityBaseUri =
    vars.baseUri + bedrock.config.identity.basePath;

  if(!req.isAuthenticated()) {
    return callback();
  }

  // add session vars
  var user = req.user;
  vars.session.auth = true;
  vars.session.loaded = true;
  vars.session.identity = bedrock.tools.clone(user.identity);
  if(user.identity.label) {
    vars.session.name = user.identity.label;
  } else {
    vars.session.name = user.identity.id;
  }
  vars.clientData.session = vars.session;

  async.auto({
    // TODO: get identities that session identity is a memberOf? (orgs)
    getIdentities: function(callback) {
      callback();
    }
  }, function(err) {
    callback(err);
  });
}
