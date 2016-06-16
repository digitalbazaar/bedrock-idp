/*
 * Copyright (c) 2014-2016 Digital Bazaar, Inc. All rights reserved.
 */
/* globals describe, before, after, it, should, beforeEach, afterEach */
/* jshint node: true */
'use strict';

var bedrock = require('bedrock');
var config = bedrock.config;
var helpers = require('./helpers');
var request = require('request');
request = request.defaults({jar: true, json: true});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

describe('bedrock-idp password login', function() {
  after(function(done) {
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
        should.exist(res.headers['set-cookie']);
        res.statusCode.should.equal(400);
        res.body.should.not.have.property('identity');
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
        res.body.should.have.property('identity');
        done(err);
      }
    );
  });

});
