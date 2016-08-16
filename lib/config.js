/*
 * Bedrock IDP Module Configuration
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var config = require('bedrock').config;
var path = require('path');
require('bedrock-identity');
require('bedrock-mail');
require('bedrock-validation');
require('bedrock-views');
require('bedrock-credentials-rest');

config.idp = {};
// needs to be set to the DID of an Identity that owns the IdP
config.idp.owner = null;

// base path for identity IDs (appended to config.server.baseUri)
config.idp.identityBasePath = '/i';
config.idp.allowInsecureCallback = false;
config.idp.defaults = {
  identity: {
    '@context': config.constants.IDENTITY_CONTEXT_V1_URL,
    type: 'Identity',
    sysStatus: 'active'
  }
};
config.idp.identities = [];
config.idp.keys = [];

// bedrock-credential-curator
config['credential-curator'].tasks.storeCredential.claimCredential = true;

// mail config
config.mail.events.push({
  type: 'bedrock.Identity.created',
  // email for admin
  template: 'bedrock.Identity.created'
}, {
  type: 'bedrock.Identity.created',
  // email for owner
  template: 'bedrock.Identity.created-identity'
}, {
  type: 'bedrock.Identity.passcodeSent',
  // email for owner
  template: 'bedrock.Identity.passcodeSent'
});

var ids = [
  'bedrock.Identity.created',
  'bedrock.Identity.created-identity',
  'bedrock.Identity.passcodeSent'
];
ids.forEach(function(id) {
  config.mail.templates.config[id] = {
    filename: path.join(__dirname, '..', 'email-templates', id + '.tpl')
  };
});

// default mail setup, should be overridden
config.mail.vars = {
  // could be set to config.views.vars.productionMode,
  productionMode: false,
  baseUri: config.server.baseUri,
  subject: {
    prefix: '[Bedrock] ',
    identityPrefix: '[Bedrock] '
  },
  service: {
    name: 'Bedrock',
    host: config.server.host
  },
  system: {
    name: 'System',
    email: 'cluster@' + config.server.domain
  },
  support: {
    name: 'Customer Support',
    email: 'support@' + config.server.domain
  },
  registration: {
    email: 'registration@' + config.server.domain
  },
  comments: {
    email: 'comments@' + config.server.domain
  },
  machine: require('os').hostname()
};

// common validation schemas
config.validation.schema.paths.push(
  path.join(__dirname, '..', 'schemas')
);

// contexts
config.views.vars.contextUrls.identity =
  config.constants.IDENTITY_CONTEXT_V1_URL;

// authentication
config.views.vars.authentication = config.views.vars.authentication || {};

config.views.vars['angular-credential'] =
  config.views.vars['angular-credential'] || {};
config.views.vars['angular-credential'].altUpdateEndpoint =
  config['credentials-rest'].basePath;
config.views.vars.identity = {
  baseUri: config['identity-http'].basePath
};
