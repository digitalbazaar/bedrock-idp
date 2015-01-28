/*
 * Copyright (c) 2014-2015 Digital Bazaar, Inc. All rights reserved.
 */

'use strict';

var bedrock = require('bedrock');
var superagent = require('superagent');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

describe('bedrock-idp.login', function() {
  it('should reject bad cookie-based login as dev', function(done) {
    var loginService = bedrock.config.server.baseUri + '/session/login';
    superagent.post(loginService)
      .send({sysIdentifier: 'INVALID_LOGIN', password: 'password'})
      .end(function(err, res) {
        res.status.should.equal(400);
        res.body.should.not.have.property('identity');
        done(err);
      });
  });

  it('should accept good cookie-based login as dev', function(done) {
    var loginService = bedrock.config.server.baseUri + '/session/login';
    superagent.post(loginService)
      .send({sysIdentifier: 'dev', password: 'password'})
      .end(function(err, res) {
        res.status.should.equal(200);
        res.body.should.have.property('identity');
        done(err);
      });
  });
});
