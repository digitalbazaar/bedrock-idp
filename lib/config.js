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

config.identityCredentials = {};
config.identityCredentials.allowInsecureCallback = false;

// mail config
config.mail.events.push({
  type: 'bedrock.Identity.created',
  // email for admin
  template: 'bedrock.Identity.created'
}, {
  type: 'bedrock.Identity.created',
  // email for owner
  template: 'bedrock.Identity.created-identity'
});

var ids = [
  'bedrock.Identity.created',
  'bedrock.Identity.created-identity'
];
ids.forEach(function(id) {
  config.mail.templates.config[id] = {
    filename: path.join(__dirname, '..', 'email-templates', id + '.tpl')
  };
});

// common validation schemas
config.validation.schema.paths.push(
  path.join(__dirname, '..', 'schemas')
);

// server-rendered views
config.views.paths.push(
  path.join(__dirname, '..', 'views')
);

// contexts
config.views.vars.contextUrls.identity =
  bedrock.config.constants.IDENTITY_CONTEXT_V1_URL;

// tests
config.mocha.tests.push(path.join(__dirname, '..', 'tests'));
