/*
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 */
var pages = global.bedrock.pages || {};

pages.home = require('./home');
pages.idp = require('./idp');
pages.join = require('./join');

module.exports = global.bedrock.pages = pages;
