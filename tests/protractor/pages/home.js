/*
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var bedrock = GLOBAL.bedrock;

var api = {};
module.exports = api;

api.get = function() {
  bedrock.get('/');
  bedrock.waitForAngular();
};
