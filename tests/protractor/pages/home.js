/*
 * Identity provider home page.
 *
 * Copyright (c) 2015 The Open Payments Foundation. All rights reserved.
 */
var bedrock = GLOBAL.bedrock;

var api = {};
module.exports = api;

api.get = function() {
  bedrock.get('/');
  bedrock.waitForAngular();
};
