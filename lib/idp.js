/*
 * Bedrock Identity Provider module.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var bedrock = require('bedrock');
var rest = require('bedrock-rest');

// module API
var api = {};
module.exports = api;

require('./services.identifier');
require('./services.identity');
require('./services.key');
require('./services.session');
require('./services.well-known');

bedrock.events.on('bedrock-express.init', function(app) {
  app.param(':identity', rest.idParam);
});
