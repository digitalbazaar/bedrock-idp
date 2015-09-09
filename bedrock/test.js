/*
 * Copyright (c) 2015 Digital Bazaar, Inc. All rights reserved.
 */
var bedrock = require('bedrock');
var fs = require('fs');
var path = require('path');

require('bedrock-express');
require('bedrock-requirejs');
require('bedrock-session-mongodb');
require('bedrock-views');
require('../lib/idp');

var config = bedrock.config;
var dir = path.join(__dirname, '..');
config.requirejs.bower.packages.push({
  path: dir,
  manifest: JSON.parse(fs.readFileSync(
    path.join(dir, 'bower.json'), {encoding: 'utf8'}))
});

// server info
config.server.port = 36443;
config.server.httpPort = 36080;
config.server.bindAddr = ['bedrock-idp.dev'];
config.server.domain = 'bedrock-idp.dev';
config.server.host = 'bedrock-idp.dev:36443';
config.server.baseUri = 'https://' + config.server.host;

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
config.views.vars.aioBaseUri = 'https://authorization.dev:33443';
config.views.vars.idpOwner = config.idp.owner.id;

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

var devId = config.server.baseUri + config.idp.identityBasePath + '/dev';
var devKey = devId + '/keys/1';

// FIXME: credentials *must* use the context that the insertion API is
// expecting
var context = [
  'https://w3id.org/identity/v1',
  'https://w3id.org/credentials/v1',
  {
    'test': 'urn:test:'
  }
];

config['credentials-mongodb'].provider.credentials.push({
  '@context': context,
  id: 'urn:credential:test-recipient-1',
  type: ['Credential', 'test:EmailCredential'],
  name: 'Test 1: Email',
  issued: '2015-01-01T01:02:03Z',
  issuer: 'urn:issuer:test',
  image: 'http://simpleicon.com/wp-content/uploads/mail_envalope-128x128.png',
  claim: {
    id: 'urn:recipient:test',
    'schema:email': 'recipient-test@example.com'
  },
  signature: {
    type: 'GraphSignature2012',
    created: '2015-01-01T01:02:03Z',
    creator: 'urn:issuer:test:key:1',
    signatureValue: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz01234567890ABCDEFGHIJKLM=='
  },
  sysState: 'claimed'
});
config['credentials-mongodb'].provider.credentials.push({
  '@context': context,
  id: 'urn:credential:test-dev-1',
  type: ['Credential', 'test:EmailCredential'],
  name: 'Test 1: Work Email',
  issued: '2015-01-01T01:02:03Z',
  issuer: 'urn:issuer:test',
  image: 'http://simpleicon.com/wp-content/uploads/mail_envalope-128x128.png',
  claim: {
    id: devId,
    'schema:email': 'dev@example.com'
  },
  signature: {
    type: 'GraphSignature2012',
    created: '2015-01-01T01:02:03Z',
    creator: devKey,
    signatureValue: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz01234567890ABCDEFGHIJKLM=='
  },
  sysState: 'claimed'
});
config['credentials-mongodb'].provider.credentials.push({
  '@context': context,
  id: 'urn:credential:test-dev-2',
  type: ['Credential', 'test:EmailCredential'],
  name: 'Test 2: Personal Email',
  issued: '2015-01-02T01:02:03Z',
  issuer: 'urn:issuer:test',
  image: 'http://simpleicon.com/wp-content/uploads/mail_envalope-128x128.png',
  claim: {
    id: devId,
    email: 'dev@example.org'
  },
  signature: {
    type: 'GraphSignature2012',
    created: '2015-01-02T01:02:03Z',
    creator: devKey,
    signatureValue: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz01234567890ABCDEFGHIJKLM=='
  },
  sysState: 'claimed'
});
config['credentials-mongodb'].provider.credentials.push({
  '@context': context,
  id: 'urn:credential:test-dev-3',
  type: ['Credential', 'test:VerifiedAddressCredential'],
  name: 'Test 3: Address',
  issued: '2015-01-03T01:02:03Z',
  issuer: 'urn:issuer:test',
  image: 'http://simpleicon.com/wp-content/uploads/address-128x128.png',
  claim: {
    id: devId,
    address: {
      type: 'PostalAddress',
      streetAddress: '123 Main St',
      addressLocality: 'Sometown',
      addressRegion: 'Somestate',
      postalCode: '12345-1234'
    }
  },
  signature: {
    type: 'GraphSignature2012',
    created: '2015-01-03T01:02:03Z',
    creator: devKey,
    signatureValue: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz01234567890ABCDEFGHIJKLM=='
  },
  sysState: 'claimed'
});
config['credentials-mongodb'].provider.credentials.push({
  '@context': context,
  id: 'urn:credential:test-dev-4',
  type: ['Credential', 'test:AgeOverCredential'],
  name: 'Test 4: Age Over 21',
  issued: '2015-01-04T01:02:03Z',
  issuer: 'urn:issuer:test',
  image: 'http://simpleicon.com/wp-content/uploads/beer1-128x128.png',
  claim: {
    id: devId,
    'test:ageOver': '21'
  },
  signature: {
    type: 'GraphSignature2012',
    created: '2015-01-04T01:02:03Z',
    creator: devKey,
    signatureValue: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz01234567890ABCDEFGHIJKLM=='
  },
  sysState: 'claimed'
});
config['credentials-mongodb'].provider.credentials.push({
  '@context': context,
  id: 'urn:credential:test-dev-5',
  type: ['Credential', 'test:BirthDateCredential'],
  name: 'Test 5: Birth Date',
  issued: '2015-01-05T01:02:03Z',
  issuer: 'urn:issuer:test',
  image: 'http://simpleicon.com/wp-content/uploads/pestry_cake-128x128.png',
  claim: {
    id: devId,
    'schema:birthDate': {'@value': '2001-02-03', '@type': 'xsd:dateTime'},
    'schema:birthPlace': {
      type: 'schema:Place',
      address: {
        type: 'PostalAddress',
        streetAddress: '1000 Birthing Center Rd',
        addressLocality: 'Sometown',
        addressRegion: 'Somestate',
        postalCode: '12345-1234'
      }
    }
  },
  signature: {
    type: 'GraphSignature2012',
    created: '2015-01-05T01:02:03Z',
    creator: devKey,
    signatureValue: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz01234567890ABCDEFGHIJKLM=='
  },
  sysState: 'claimed'
});
config['credentials-mongodb'].provider.credentials.push({
  '@context': context,
  id: 'urn:credential:test-dev-6',
  type: ['Credential', 'test:PhysicalExaminationCredential'],
  name: 'Test 6: Physical',
  issued: '2015-01-06T01:02:03Z',
  issuer: 'urn:issuer:test',
  image: 'http://simpleicon.com/wp-content/uploads/stethoscope1-128x128.png',
  claim: {
    id: devId,
    'schema:height': '182 cm',
    'schema:weight': '77 Kg'
  },
  signature: {
    type: 'GraphSignature2012',
    created: '2015-01-06T01:02:03Z',
    creator: devKey,
    signatureValue: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789abcdefghijklmnopqrstuvwxyz01234567890ABCDEFGHIJKLM=='
  },
  sysState: 'claimed'
});

// idp config
config.idp.defaults.identity.address = [];
config.idp.defaults.identity.preferences = {
  type: 'IdentityPreferences'
};
config.idp.defaults.identity.sysPublic = [];
config.idp.defaults.identity.sysResourceRole = [{
  sysRole: 'identity.registered',
  generateResource: 'id'
}];

// identities
config.idp.identities.push({
  '@context': config.constants.IDENTITY_CONTEXT_V1_URL,
  type: 'Identity',
  sysSlug: 'bedrock',
  label: 'Bedrock',
  email: 'bedrock@bedrock.dev',
  sysPassword: 'password',
  sysResourceRole: [{
    sysRole: 'identity.registered',
    generateResource: 'id'
  }]
});
config.idp.identities.push({
  '@context': config.constants.IDENTITY_CONTEXT_V1_URL,
  type: 'Identity',
  sysSlug: 'dev',
  label: 'Dev',
  email: 'dev@bedrock.dev',
  sysPassword: 'password',
  sysResourceRole: [{
    sysRole: 'identity.registered',
    generateResource: 'id'
  }]
});

bedrock.start();
