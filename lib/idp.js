/*
 * Bedrock Identity Provider module.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
// module API
var api = require('./auth');
module.exports = api;

var curator = require('bedrock-credential-curator');
curator.store = require('bedrock-credentials-mongodb').provider;
require('bedrock-agreement-http');
require('bedrock-key-http');
require('bedrock-authn-password');
require('bedrock-authn-did');

require('./services.identifier');
require('./services.identity');
require('./services.well-known');
