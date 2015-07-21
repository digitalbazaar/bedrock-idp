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

require('./services.credentials');
require('./services.identifier');
require('./services.identity');
require('./services.key');
require('./services.session');
require('./services.well-known');
