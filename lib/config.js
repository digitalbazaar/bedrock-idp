/*
 * Bedrock IDP Module Configuration
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var config = require('bedrock').config;
var path = require('path');

// tests
config.mocha.tests.push(path.join(__dirname, '..', 'tests'));
