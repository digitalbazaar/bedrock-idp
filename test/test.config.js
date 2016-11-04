/*!
 * Copyright (c) 2012-2016 Digital Bazaar, Inc. All rights reserved.
 */
var config = require('bedrock').config;
var path = require('path');
var fs = require('fs');

// mongodb config
config.mongodb.name = 'bedrock_idp_test';
config.mongodb.host = 'localhost';
config.mongodb.port = 27017;
config.mongodb.local.collection = 'bedrock_idp_test';
// drop all collections on initialization
config.mongodb.dropCollections = {};
config.mongodb.dropCollections.onInit = true;
config.mongodb.dropCollections.collections = [];

require('./test.data.js');

// tests
config.mocha.tests.push(
  fs.realpathSync(path.join(__dirname, '/mocha')));

config.protractor.config.suites['bedrock-idp'] =
  path.join(__dirname, 'protractor', 'tests', '**', '*.js');

// default multiCapabilities, used with Sauce Labs
var caps = config.sauceLabs.capabilities;
config.sauceLabs.multiCapabilities = [
  caps.linux.firefox, caps.linux.chrome, caps.osx1011.safari,
  caps.osx1010.safari, caps.windows10.ie
];

// remove DID document so that IdP to prevent registration
// with authorization-io
delete config.idp.owner.didDocument;
