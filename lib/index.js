/*
 * Bedrock Identity Provider module.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */

var curator = require('bedrock-credential-curator');
curator.store = require('bedrock-credentials-mongodb').provider;

require('bedrock-key-http');
require('bedrock-authn-password');
require('bedrock-authn-did');
require('bedrock-identity-http');

// module API
var api = require('./auth');
module.exports = api;

require('./services.identifier');
require('./services.identity');
require('./services.well-known');
