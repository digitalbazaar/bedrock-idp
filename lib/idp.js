/*
 * Bedrock Identity Provider module.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
// module API
var api = require('./auth');
module.exports = api;

require('./services.identifier');
require('./services.identity');
require('./services.key');
require('./services.session');
require('./services.well-known');
