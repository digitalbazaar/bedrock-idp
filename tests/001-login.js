/*
 * Copyright (c) 2014-2015 Digital Bazaar, Inc. All rights reserved.
 */

'use strict';

var bedrock = require('bedrock');
var request = require('request');
var jar = request.jar();
request = request.defaults({jar: jar, json: true});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

describe('bedrock-idp.login', function() {
  it('should reject bad cookie-based login as dev', function(done) {
    var loginService = bedrock.config.server.baseUri + '/session/login';
    request.post(
      {
        url: loginService,
        body: {sysIdentifier: 'INVALID_LOGIN', password: 'password'}
      },
      function(err, res, body) {
        res.headers['set-cookie'].should.exist;
        res.statusCode.should.equal(400);
        res.body.should.not.have.property('identity');
        done(err);
      }
    );
  });

  it('should accept good cookie-based login as dev', function(done) {
    var loginService = bedrock.config.server.baseUri + '/session/login';
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
