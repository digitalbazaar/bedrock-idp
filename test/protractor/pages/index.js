/*
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 */
var pages = global.bedrock.pages || {};
module.exports = pages;

pages['bedrock-idp-test'] = {};
pages['bedrock-idp-test'].home = require('./home');
pages['bedrock-idp-test'].idp = require('./idp');
pages['bedrock-idp-test'].join = require('./join');
pages['bedrock-idp-test'].navbar = require('./navbar');
