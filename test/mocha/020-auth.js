/*
 * Copyright (c) 2014-2016 Digital Bazaar, Inc. All rights reserved.
 */
/* globals describe, before, after, it, should, beforeEach, afterEach */
/* jshint node: true */
/* jshint -W030 */
'use strict';

var brIdentity = require('../../lib/auth');

var testPasswordHash =
  'bcrypt:$2a$10$hjp3zswzxnOV9A1gui//COzuM/.AG4hArsQEiAIA1nUION1hQ5W12';

// FIXME: these test should be moved into bedrock-authn-password
describe.skip('bedrock-idp auth', function() {
  describe('password hashing', function() {
    it('should generate a valid password hash', function(done) {
      brIdentity.createPasswordHash('password', function(err, hash) {
        should.not.exist(err);
        brIdentity.verifyPasswordHash(
          hash, 'password',
          function(err, verified, legacy) {
            should.not.exist(err);
            legacy.should.be.false;
            verified.should.be.true;
            done();
          });
      });
    });

    it('should verify a valid password hash', function(done) {
      brIdentity.verifyPasswordHash(
        testPasswordHash, 'password', function(err, verified, legacy) {
          should.not.exist(err);
          legacy.should.be.false;
          verified.should.be.true;
          done();
        });
    });
  });
});
