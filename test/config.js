/*
 * Test Configuration.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var path = require('path');

module.exports = function(bedrock) {
  var config = bedrock.config;
  if(!config.protractor) {
    return;
  }
  var protractor = config.protractor.config;
  var prepare =
    path.join(__dirname, 'protractor', 'prepare.js');
  protractor.params.config.onPrepare.push(prepare);
};
