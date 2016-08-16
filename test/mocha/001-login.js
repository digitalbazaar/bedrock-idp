/*
 * Copyright (c) 2014-2016 Digital Bazaar, Inc. All rights reserved.
 */
/* jshint node: true */
'use strict';

var bedrock = require('bedrock');
var config = bedrock.config;
var helpers = require('./helpers');
var request = require('request');
request = request.defaults({jar: true, json: true, strictSSL: false});

describe('bedrock-idp password login', function() {
  before(function(done) {
    helpers.prepareDatabase({}, done);
  });
  afterEach(function(done) {
    helpers.logout(request, done);
  });

  var loginService =
    config.server.baseUri + config['authn-password'].routes.login;
  it('should reject bad cookie-based login', function(done) {
    request.post(
      {
        url: loginService,
        body: {sysIdentifier: 'INVALID_LOGIN', password: 'password'}
      },
      function(err, res, body) {
        res.statusCode.should.equal(400);
        body.type.should.equal('InvalidLogin');
        done(err);
      }
    );
  });

  it('should accept good cookie-based login as dev', function(done) {
    request.post(
      {
        url: loginService,
        body: {sysIdentifier: 'dev', password: 'password'}
      },
      function(err, res, body) {
        res.statusCode.should.equal(200);
        body.should.have.property('identity');
        done(err);
      }
    );
  });
});
