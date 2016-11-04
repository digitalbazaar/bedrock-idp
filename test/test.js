/*
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 */
var bedrock = require('bedrock');
var config = bedrock.config;
// NOTE: it is critical that bedrock-protractor be required first so that
// it can register a bedrock.cli event listener
require('bedrock-protractor');
require('bedrock-idp');
var brMessages = require('bedrock-messages');

require('./app.config.js');

// generate test messages to new identities
bedrock.events.on('bedrock.Identity.created', (options, callback) => {
  var identity = options.details.identity;
  if(identity.id.indexOf('did:') === 0) {
    let newMessages = [];
    for(var i = 1; i < 9; ++i) {
      newMessages.push({
        '@context': 'https://example.com/someContext',
        date: new Date().toJSON(),
        recipient: identity.id,
        sender: 'did:9806452c-7190-4f05-b090-99fec665d6d2',
        subject: '(' + i + ') ' + 'An important message for you.',
        type: 'SomeMessageType',
        content: {
          body: 'Here is an important message.'
        }
      });
    }
    brMessages.store(newMessages, callback);
  }
});

// minify
config.views.vars.minify = false;
config.protractor.config.mochaOpts.timeout = 240000;

require('bedrock-test');
bedrock.start();
