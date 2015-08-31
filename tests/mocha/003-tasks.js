/*
 * Copyright (c) 2014-2015 Digital Bazaar, Inc. All rights reserved.
 */

'use strict';

var async = require('async');
var bedrock = require('bedrock');
var config = bedrock.config;
var request = require('request');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

function login(callback) {
  var loginService = config.server.baseUri + '/session/login';
  request.post({
    url: loginService,
    body: {sysIdentifier: 'dev', password: 'password'},
    json: true
  }, function(err, res, body) {
    callback(err);
  });
}

/*
* These tests test for the existence of API endpoints.  The functionionality
* provided by these endpoints is tested by the protractor tests.
*/
describe('bedrock-idp credential queries', function() {

  it('should accept a request to retrieve credentials', function(done) {
    var params = '?credentialCallback=https://authio.com';
    var testService =
      bedrock.config.server.baseUri +
      '/tasks/credentials/compose-identity' + params;
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
      form: postData
    }, function(err, res, body) {
      should.not.exist(err);
      res.statusCode.should.equal(200);
      done(err);
    });
  });

});

describe('bedrock-idp credential storage', function() {

  it('should accept a request to store interactively', function(done) {
    var params = '?storageCallback=https://authio.com';
    var testService =
      bedrock.config.server.baseUri +
      '/tasks/credentials/request-credential-storage' + params;
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
      form: postData
    }, function(err, res, body) {
      should.not.exist(err);
      res.statusCode.should.equal(200);
      done(err);
    });
  });

  it('should accept a request to store automatically', function(done) {
    var testService =
      bedrock.config.server.baseUri +
      '/tasks/credentials/store-credentials';
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
      form: postData
    }, function(err, res, body) {
      should.not.exist(err);
      res.statusCode.should.equal(200);
      // FIXME: there should be some testable data returned
      done(err);
    });
  });

});
