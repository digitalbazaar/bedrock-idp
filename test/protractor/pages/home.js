/*
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 */
var bedrock = global.bedrock;

var api = {};
module.exports = api;

api.get = function() {
  bedrock.get('/');
  bedrock.waitForAngular();
};
