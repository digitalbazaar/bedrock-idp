/*!
 * Copyright (c) 2012-2016 Digital Bazaar, Inc. All rights reserved.
 */
var config = require('bedrock').config;
var path = require('path');
var fs = require('fs');
require('bedrock-protractor');

// server info
config.server.port = 36443;
config.server.httpPort = 36080;
config.server.bindAddr = ['bedrock-idp.dev'];
config.server.domain = 'bedrock-idp.dev';
config.server.host = 'bedrock-idp.dev:36443';
config.server.baseUri = 'https://' + config.server.host;

// mongodb config
config.mongodb.name = 'bedrock_idp_app';
config.mongodb.host = 'localhost';
config.mongodb.port = 27017;
config.mongodb.local.collection = 'bedrock_idp_app';

// bower package for bedrock-idp-test
var dir = path.join(__dirname);
config.requirejs.bower.packages.push({
  path: path.join(dir, 'components'),
  manifest: path.join(dir, 'bower.json')
});
// bower package for bedrock-idp
var parentDir = path.join(__dirname, '..');
config.requirejs.bower.packages.push({
  path: path.join(parentDir),
  manifest: path.join(parentDir, 'bower.json')
});

// identity service
// TODO: owner for local-account management idp disabled
/* config.idp.owner = {
  id: config.server.baseUri + config.idp.identityBasePath + '/bedrock'
};*/
config.idp.owner = {
  id: 'did:291f1b71-de7f-45de-9b6d-9eecc335ecf3'
};
config['credential-curator'].credentialSigningPublicKey.id =
  config.idp.owner.id + '/keys/1';

// FIXME: store this securely
config.idp.owner.privateKey =
  config['credential-curator'].credentialSigningPrivateKey;
config.idp.owner.didRegistrationUrl =
  'https://authorization.dev:33443/dids';
config.idp.owner.didDocument = {
  '@context': 'https://w3id.org/identity/v1',
  id: config.idp.owner.id,
  idp: config.idp.owner.id,
  url: config.server.baseUri,
  accessControl: {
    writePermission: [{
      id: config['credential-curator'].credentialSigningPublicKey.id,
      type: 'CryptographicKey'
    }]
  },
  publicKey: [{
    id: config['credential-curator'].credentialSigningPublicKey.id,
    type: 'CryptographicKey',
    owner: config.idp.owner.id,
    publicKeyPem:
      config['credential-curator'].credentialSigningPublicKey.publicKeyPem
  }]
};
// TODO: use some other global flag?
config.idp.owner.registerWithStrictSSL = false;

// credential curator
config['credential-curator']['authorization-io'].baseUrl =
  'https://authorization.dev:33443/dids/';

var permissions = config.permission.permissions;
var roles = config.permission.roles;

roles['bedrock-idp.identity.admin'] = {
  id: 'bedrock-idp.identity.administrator',
  label: 'Identity Administrator',
  comment: 'Role for identity administrators.',
  sysPermission: [
    permissions.AGREEMENT_ACCESS.id,
    permissions.AGREEMENT_ACCEPT.id,
    permissions.IDENTITY_ADMIN.id,
    permissions.IDENTITY_ACCESS.id,
    permissions.IDENTITY_INSERT.id,
    permissions.IDENTITY_EDIT.id,
    permissions.IDENTITY_REMOVE.id,
    permissions.PUBLIC_KEY_ACCESS.id,
    permissions.PUBLIC_KEY_CREATE.id,
    permissions.PUBLIC_KEY_EDIT.id,
    permissions.PUBLIC_KEY_REMOVE.id,
    permissions.CREDENTIAL_ADMIN.id,
    permissions.CREDENTIAL_ACCESS.id,
    permissions.CREDENTIAL_INSERT.id,
    permissions.CREDENTIAL_REMOVE.id,
    permissions.IDENTITY_COMPOSE.id
  ]
};
roles['bedrock-idp.identity.manager'] = {
  id: 'bedrock-idp.identity.manager',
  label: 'Identity Manager',
  comment: 'Role for identity managers.',
  sysPermission: [
    permissions.AGREEMENT_ACCESS.id,
    permissions.AGREEMENT_ACCEPT.id,
    permissions.IDENTITY_ACCESS.id,
    permissions.IDENTITY_INSERT.id,
    permissions.IDENTITY_EDIT.id,
    permissions.PUBLIC_KEY_ACCESS.id,
    permissions.PUBLIC_KEY_CREATE.id,
    permissions.PUBLIC_KEY_EDIT.id,
    permissions.PUBLIC_KEY_REMOVE.id,
    permissions.CREDENTIAL_ACCESS.id,
    permissions.CREDENTIAL_INSERT.id,
    permissions.CREDENTIAL_REMOVE.id,
    permissions.IDENTITY_COMPOSE.id,
    permissions.MESSAGE_ACCESS.id,
    permissions.MESSAGE_REMOVE.id
  ]
};

// admin role contains all permissions
roles['admin'] = {
  id: 'admin',
  label: 'Administrator',
  comment: 'Role for System Administrator.',
  sysPermission: [].concat(roles['bedrock-idp.identity.admin'].sysPermission)
};

// default registered identity role (contains all permissions for a regular
// identity)
roles['bedrock-idp.identity.registered'] = {
  id: 'bedrock-idp.identity.registered',
  label: 'Registered Identity',
  comment: 'Role for registered identities.',
  sysPermission: [].concat(roles['bedrock-idp.identity.manager'].sysPermission)
};

// defaults for identities
config.idp.defaults.identity = {
  '@context': config.constants.IDENTITY_CONTEXT_V1_URL,
  type: 'Identity',
  address: [],
  preferences: {
    type: 'IdentityPreferences'
  },
  sysPublic: [],
  sysResourceRole: [{
    sysRole: 'bedrock-idp.identity.registered',
    generateResource: 'id'
  }],
  sysStatus: 'active'
};

// serve contexts and vocabs
config.express.static.push(path.join(__dirname, 'static'));

/**
 * Load a local copy of credentials v1 context.
 */
var constants = config.constants;
constants.CREDENTIALS_CONTEXT_V1_URL = 'https://w3id.org/credentials/v1';
constants.CONTEXTS[constants.CREDENTIALS_CONTEXT_V1_URL] = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '/static/contexts/credentials-v1.jsonld'),
    {encoding: 'utf8'}));

// frontend vars
config.views.vars.baseUri = config.server.baseUri;
config.views.vars['authorization-io'] = {};
config.views.vars['authorization-io'].baseUri =
  'https://authorization.dev:33443';
config.views.vars['authorization-io'].agentUrl =
  config.views.vars['authorization-io'].baseUri + '/agent';
config.views.vars['authorization-io'].registerUrl =
  config.views.vars['authorization-io'].baseUri + '/register';

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

// setup to load dev contexts
config.views.vars.contextMap['https://w3id.org/security/v1'] =
  config.server.baseUri + '/contexts/security-v1.jsonld';
config.views.vars.contextMap['https://w3id.org/identity/v1'] =
  config.server.baseUri + '/contexts/identity-v1.jsonld';
config.views.vars.contextMap['https://w3id.org/credentials/v1'] =
  config.server.baseUri + '/contexts/credentials-v1.jsonld';
