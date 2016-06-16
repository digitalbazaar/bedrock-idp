/*
 * Copyright (c) 2014-2016 Digital Bazaar, Inc. All rights reserved.
 */
/* globals describe, before, after, it, should, beforeEach, afterEach */
/* jshint node: true */
'use strict';

var async = require('async');
var bedrock = require('bedrock');
var config = bedrock.config;
var database = require('bedrock-mongodb');
var request = require('request');
var helpers = require('./helpers');
var mockData = require('./mock.data');
var uuid = require('uuid').v4;
request = request.defaults({jar: true, json: true});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

/*
* These tests test for the existence of API endpoints.  The functionionality
* provided by these endpoints is tested by the protractor tests.
*/
describe('bedrock-idp credential tasks', function() {
  var cryptographicIdentity = {};
  var authData = {sysIdentifier: 'rsa2048', password: 'password'};
  before(function(done) {
    async.auto({
      logout: function(callback) {
        helpers.logout(request, callback);
      },
      prepareDatabase: ['logout', function(callback) {
        helpers.prepareDatabase({}, callback);
      }],
      login: ['logout', 'prepareDatabase', function(callback) {
        helpers.login(request, authData, callback);
      }],
      createCryptoIdentity: function(callback) {
        helpers.createCrytographicIdentity(
          mockData.identities.rsa2048, function(err, result) {
            cryptographicIdentity.rsa2048 = result;
            callback(err);
          });
      }
    }, done);
  });

  after(function(done) {
    async.auto({
      logout: function(callback) {
        helpers.logout(request, callback);
      }
    }, done);
  });

  describe('credential queries', function() {

    it('should get session info', function(done) {
      request.get(
        config.server.baseUri + config['session-http'].routes.session,
        function(err, res, body) {
        done();
      });
    });

    it('should accept a request to retrieve credentials', function(done) {
      var params = '?credentialCallback=https://authio.com';
      var testService =
        bedrock.config.server.baseUri +
        config['credential-curator'].endpoints.composeIdentity + params;
      request.post({
        url: testService,
        body: helpers.createQuery(cryptographicIdentity.rsa2048)
      }, function(err, res, body) {
        should.not.exist(err);
        res.statusCode.should.equal(200);
        body.should.have.property('@context');
        body.should.have.property('id');
        body.should.have.property('credential');
        done(err);
      });
    });

  });

  describe('credential storage', function() {
    var params = '?storageCallback=https://authio.com';
    var testService =
      bedrock.config.server.baseUri +
      config['credential-curator'].endpoints.storeCredentials + params;

    it.skip('should accept a request to store interactively', function(done) {
      var credentialQuery = {
        id: ''
      };
      var postData = {
        jsonPostData: JSON.stringify({
          query: credentialQuery
        })
      };
      request.post({
        url: testService,
        body: postData
      }, function(err, res, body) {
        should.not.exist(err);
        res.statusCode.should.equal(200);
        done(err);
      });
    });

    it('should accept a request to store automatically', function(done) {
      var uniqueCredential = helpers.createUniqueCredential(uuid());
      request.post({
        url: testService,
        body: uniqueCredential
      }, function(err, res, body) {
        should.not.exist(err);
        res.statusCode.should.equal(200);
        var credentialId = uniqueCredential.credential[0]['@graph'].id;
        helpers.findCredential(credentialId, function(err, result) {
          should.not.exist(err);
          result.should.equal(1);
          done();
        });
      });
    });

  });
});
