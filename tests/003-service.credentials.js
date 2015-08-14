/*
 * Copyright (c) 2014-2015 Digital Bazaar, Inc. All rights reserved.
 */

'use strict';

var async = require('async');
var bedrock = require('bedrock');
var config = bedrock.config;
var request = require('request');
var jar = null;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

function login(callback) {
  var loginService = config.server.baseUri + '/session/login';
  request.post(
    {
      url: loginService,
      body: {sysIdentifier: 'dev', password: 'password'},
      json: true
    },
    function(err, res, body) {
      // console.log('LOGINBODY', body);
      callback(err);
    }
  );
};

describe('bedrock-idp service.credentials unauthenticated', function() {
  beforeEach(function() {
    // create a new cookie jar
    jar = request.jar();
    request = request.defaults({jar: jar});
  });

  it('should prompt login on form post to /credentials', function(done) {
    var testService = bedrock.config.server.baseUri + '/credentials';
    var credentialString = JSON.stringify(config.idp.test.mock.credential);
    request.post(
      {
        url: testService,
        form: {postData: credentialString}
      },
      function(err, res, body) {
        // console.log('RESBODY:', body);
        res.headers['set-cookie'].should.exist;
        res.statusCode.should.equal(200);
        done(err);
      }
    );
  });

  it('should deny a json post to /credentials', function(done) {
    var testService = bedrock.config.server.baseUri + '/credentials';
    request.post(
      {
        url: testService,
        body: config.idp.test.mock.credential,
        json: true
      },
      function(err, res, body) {
        // console.log('RESBODY:', body);
        res.headers['set-cookie'].should.exist;
        res.statusCode.should.equal(400);
        body.type.should.exist;
        body.type.should.equal('PermissionDenied');
        done(err);
      }
    );
  });
});

describe('bedrock-idp service.credentials authenticated', function() {

  beforeEach(function(done) {
    // create a new cookie jar
    jar = request.jar();
    request = request.defaults({jar: jar});
    login(done);
  });

  it('should accept a post to store a credential', function(done) {
    var testService = bedrock.config.server.baseUri + '/credentials';
    request.post(
      {
        url: testService,
        body: config.idp.test.mock.credential,
        json: true
      },
      function(err, res, body) {
        should.not.exist(err);
        // FIXME: perhaps a 201 is more appropriate?
        res.statusCode.should.equal(200);
        done(err);
      }
    );
  });

  /*  This route is used with the issuer is requesting an identity credential
  *
  */

  it('should accept a request to retrieve a credential', function(done) {
    // FIXME: query is not being utilized in the lib, so improve this test
    // once that is working
    // FIXME: possible test if credentialCallback is missing?
    var params = '?action=request&credentialCallback=https://authio.com';
    var testService = bedrock.config.server.baseUri + '/credentials' + params;
    // FIXME: what should this be?
    var credentialQuery = {
      id: ''
    };
    var postData = {
      postData: {
        query: credentialQuery
      }
    };
    // html escaping is not required
    var escapedData = JSON.stringify(postData);
    request.post(
      {
        url: testService,
        body: escapedData,
        json: false
      },
      function(err, res, body) {
        should.not.exist(err);
        res.statusCode.should.equal(200);
        // NOTE: the body of this document is HTML that allows the user to
        // compose a credential in response to fulfill the query.
        done(err);
      }
    );
  });

  /*  This route is used to interactively store a new credential from an
  *   issuer.
  */

  it('should accept req to interactively store a credential', function(done) {
    // FIXME: possible test if credentialCallback is missing?
    var params = '?action=store&storageCallback=https://authio.com';
    var testService = bedrock.config.server.baseUri + '/credentials' + params;
    var credentialString = JSON.stringify(config.idp.test.mock.credential);
    request.post(
      {
        url: testService,
        form: {jsonPostData: credentialString}
      },
      function(err, res, body) {
        should.not.exist(err);
        res.statusCode.should.equal(200);
        // NOTE: the body of this document is HTML that allows the user to
        // store a credential they have been issued
        done(err);
      }
    );
  });

  /*  This route is test sends an undefined action to the API
  *
  */
  it('should respond with 400 on an unknown action', function(done) {
    var params = '?action=unknownAction';
    var testService = bedrock.config.server.baseUri + '/credentials' + params;
    var credentialString = JSON.stringify(config.idp.test.mock.credential);
    request.post(
      {
        url: testService,
        form: {jsonPostData: credentialString}
      },
      function(err, res, body) {
        should.not.exist(err);
        res.statusCode.should.equal(400);
        done(err);
      }
    );
  });

});
