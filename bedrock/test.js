/*
 * Copyright (c) 2015 Digital Bazaar, Inc. All rights reserved.
 */
var bedrock = require('bedrock');
var fs = require('fs');
var path = require('path');

require('bedrock-express');
require('bedrock-requirejs');
require('bedrock-server');
require('bedrock-session-mongodb');
require('bedrock-views');
require('../lib/idp');

var config = bedrock.config;
var testMode = false;

bedrock.events.on('bedrock.test.configure', function() {
  testMode = true;

  // server info
  config.server.port = 36443;
  config.server.httpPort = 36080;
  config.server.bindAddr = ['bedrock-idp.dev'];
  config.server.domain = 'bedrock-idp.dev';
  config.server.host = 'bedrock-idp.dev:36443';
  config.server.baseUri = 'https://' + config.server.host;

  // frontend vars
  config.views.vars.baseUri = config.server.baseUri;
  config.views.vars['bedrock-angular-credential'].libraries.default = {
    vocabs: [
      config.server.baseUri + '/vocabs/test-v1.jsonld'
    ]
  };

  // remove DID document so that IdP to prevent registration
  // with authorization-io
  delete config.idp.owner.didDocument;
});

bedrock.events.on('bedrock.configure', function() {
  if(!testMode) {
    return;
  }
  require('../configs/test.data.js');
});

// server info
config.server.port = 36443;
config.server.httpPort = 36080;
config.server.bindAddr = ['bedrock-idp.dev'];
config.server.domain = 'bedrock-idp.dev';
config.server.host = 'bedrock-idp.dev:36443';
config.server.baseUri = 'https://' + config.server.host;

var dir = path.join(__dirname, '..');
config.requirejs.bower.packages.push({
  path: dir,
  manifest: JSON.parse(fs.readFileSync(
    path.join(dir, 'bower.json'), {encoding: 'utf8'}))
});

// mongodb config
config.mongodb.name = 'bedrock_idp_dev';
config.mongodb.host = 'localhost';
config.mongodb.port = 27017;
config.mongodb.local.collection = 'bedrock_idp_dev';

// identity service
// TODO: owner for local-account management idp disabled
/*config.idp.owner = {
  id: config.server.baseUri + config.idp.identityBasePath + '/bedrock'
};*/
config.idp.owner = {
  id: 'did:291f1b71-de7f-45de-9b6d-9eecc335ecf3'
};
// FIXME: store this securely
config.idp.owner.privateKey = config.idp.credentialSigningPrivateKey;
config.idp.owner.didRegistrationUrl = 'https://authorization.dev:33443/dids';
config.idp.owner.didDocument = {
  '@context': 'https://w3id.org/identity/v1',
  id: config.idp.owner.id,
  idp: config.idp.owner.id,
  url: config.server.baseUri,
  accessControl: {
    writePermission: [{
      id: config.idp.credentialSigningPublicKey.id,
      type: 'CryptographicKey'
    }]
  },
  publicKey: [{
    // TODO: change to use DID URI
    id: config.idp.credentialSigningPublicKey.id,
    type: 'CryptographicKey',
    owner: config.idp.owner.id,
    publicKeyPem: config.idp.credentialSigningPublicKey.publicKeyPem
  }]
};
// TODO: use some other global flag?
config.idp.owner.registerWithStrictSSL = false;

// frontend vars
config.views.vars.baseUri = config.server.baseUri;
config.views.vars['authorization-io'] = {};
config.views.vars['authorization-io'].baseUri =
  'https://authorization.dev:33443';

var permissions = config.permission.permissions;
var roles = config.permission.roles;

roles['identity.admin'] = {
  id: 'identity.administrator',
  label: 'Identity Administrator',
  comment: 'Role for identity administrators.',
  sysPermission: [
    permissions.IDENTITY_ADMIN.id,
    permissions.IDENTITY_ACCESS.id,
    permissions.IDENTITY_INSERT.id,
    permissions.IDENTITY_EDIT.id,
    permissions.IDENTITY_REMOVE.id,
    permissions.PUBLIC_KEY_CREATE.id,
    permissions.PUBLIC_KEY_REMOVE.id
  ]
};
roles['identity.manager'] = {
  id: 'identity.manager',
  label: 'Identity Manager',
  comment: 'Role for identity managers.',
  sysPermission: [
    permissions.IDENTITY_ADMIN.id,
    permissions.IDENTITY_ACCESS.id,
    permissions.IDENTITY_INSERT.id,
    permissions.IDENTITY_EDIT.id,
    permissions.PUBLIC_KEY_CREATE.id,
    permissions.PUBLIC_KEY_REMOVE.id
  ]
};

// admin role contains all permissions
roles['admin'] = {
  id: 'admin',
  label: 'Administrator',
  comment: 'Role for System Administrator.',
  sysPermission: [].concat(roles['identity.admin'].sysPermission)
};

// default registered identity role (contains all permissions for a regular
// identity)
roles['identity.registered'] = {
  id: 'identity.registered',
  label: 'Registered Identity',
  comment: 'Role for registered identities.',
  sysPermission: [].concat(roles['identity.manager'].sysPermission)
};

// serve contexts and vocabs
config.express.static.push(path.join(__dirname, 'static'));

// setup to load vocabs
config.views.vars['bedrock-angular-credential'] =
  config.views.vars['bedrock-angular-credential'] || {};
config.views.vars['bedrock-angular-credential'].libraries =
  config.views.vars['bedrock-angular-credential'].libraries || {};
config.views.vars['bedrock-angular-credential'].libraries.default = {
  vocabs: [
    config.server.baseUri + '/vocabs/test-v1.jsonld'
  ]
};

bedrock.start();
