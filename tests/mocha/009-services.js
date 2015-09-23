/*
 * Copyright (c) 2014-2015 Digital Bazaar, Inc. All rights reserved.
 */

'use strict';

var bedrock = require('bedrock');
var config = bedrock.config;
var async = require('async');
var request = require('request');
request = request.defaults({jar: request.jar(), json: true});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

describe('bedrock-idp unauthenticated', function() {

  it('should allow an unauthenticated request to /i/:id', function(done) {
    var testIdentity = config.idp.test.testUser;
    var testService = bedrock.config.server.baseUri +
      bedrock.config.idp.identityBasePath + '/' + testIdentity;
    request.get(
      testService,
      function(err, res, body) {
        res.headers['set-cookie'].should.exist;
        res.statusCode.should.equal(200);
        body.should.have.property('@context');
        body.should.have.property('id');
        body.should.have.property('type');
        body.id.should.equal(testService);
        body.type.should.equal('Identity');
        done(err);
      }
    );
  });

  it('should allow an unauthenticated request to /i/:id/keys', function(done) {
    var testIdentity = config.idp.test.testUser;
    var idPath = config.server.baseUri +
      config.idp.identityBasePath + '/' + testIdentity + '/keys';
    var testService = idPath;
    request.get(
      testService,
      function(err, res, body) {
        res.statusCode.should.equal(200);
        body.should.be.an('array');
        body.should.have.length(1);
        var key = body[0];
        key.should.have.property('@context');
        key.should.have.property('id');
        key.should.have.property('type');
        key.should.have.property('label');
        key.should.have.property('publicKeyPem');
        done(err);
      }
    );
  });

  it('should allow an unauthenticated request /i/:id/keys/#', function(done) {
    var testIdentity = config.idp.test.testUser;
    var idPath = config.server.baseUri +
      config.idp.identityBasePath + '/' + testIdentity + '/keys';
    var testService = idPath;
    async.waterfall([
      function(callback) {
        request.get(testService, function(err, res, body) {
          callback(err, body[0].id);
        });
      },
      function(url, callback) {
        request.get(url, function(err, res, body) {
          res.statusCode.should.equal(200);
          res.body.should.be.an('object');
          body.should.have.property('@context');
          body.should.have.property('id');
          body.id.should.equal(url);
          body.should.have.property('type');
          body.should.have.property('label');
          body.should.have.property('publicKeyPem');
          callback(err);
        });
      }
    ], done);
  });

  it('should return 404 on unknown id request to /i/:id', function(done) {
    var testIdentity = 'someUnknownIdentity';
    var idPath = bedrock.config.server.baseUri +
      bedrock.config.idp.identityBasePath + '/' + testIdentity;
    var testService = idPath;
    request.get(
      testService,
      function(err, res, body) {
        res.statusCode.should.equal(404);
        body.should.be.an('object');
        body.should.have.property('message');
        body.should.have.property('type');
        body.type.should.equal('NotFound');
        body.should.have.property('details');
        body.should.have.property('cause');
        done(err);
      }
    );
  });

  it('should return 404 on unknown id request to /i/:id/keys', function(done) {
    var testIdentity = 'someUnknownIdentity';
    var idPath = bedrock.config.server.baseUri +
      bedrock.config.idp.identityBasePath + '/' + testIdentity + '/keys';
    var testService = idPath;
    request.get(
      testService,
      function(err, res, body) {
        res.statusCode.should.equal(404);
        body.should.be.an('object');
        body.should.have.property('message');
        body.should.have.property('type');
        body.type.should.equal('NotFound');
        body.should.have.property('details');
        body.should.have.property('cause');
        done(err);
      }
    );
  });

  it('should return 404 on request to /i/:id/badendpoint', function(done) {
    var testIdentity = config.idp.test.testUser;
    var idPath = bedrock.config.server.baseUri +
      bedrock.config.idp.identityBasePath + '/' + testIdentity + '/badendpoint';
    var testService = idPath;
    request.get(
      testService,
      function(err, res, body) {
        // console.log('STATUS', res.statusCode);
        // console.log('body', body);
        res.statusCode.should.equal(404);
        // FIXME: body of this response is null
        done(err);
      }
    );
  });

  it('should return 404 on an unknown key /i/:id/keys/#', function(done) {
    var testIdentity = config.idp.test.testUser;
    var idPath = config.server.baseUri +
      config.idp.identityBasePath + '/' + testIdentity + '/keys/999';
    var testService = idPath;
    request.get(idPath, function(err, res, body) {
      res.statusCode.should.equal(404);
      body.should.be.an('object');
      body.should.have.property('message');
      body.should.have.property('type');
      body.type.should.equal('NotFound');
      body.should.have.property('details');
      body.details.should.be.an('object');
      body.details.should.have.property('key');
      body.details.key.should.be.an('object');
      body.details.key.should.have.property('id');
      body.details.key.id.should.equal(idPath);
      body.should.have.property('cause');
      done(err);
    });
  });

  // this is proper request, it is not authenticated
  it('should not accept post to add a public key', function(done) {
    var keyService =
      config.server.baseUri +   bedrock.config.idp.identityBasePath +
      '/' + config.idp.test.testUser + '/keys';
    var publicKey = config.idp.test.publicKeys[0];
    request.post({
      url: keyService,
      body: publicKey,
      json: true
    }, function(err, res, body) {
      res.statusCode.should.equal(400);
      body.should.be.an('object');
      body.should.have.property('message');
      body.should.have.property('type');
      body.type.should.equal('PermissionDenied');
      body.should.have.property('details');
      body.details.should.be.an('object');
      body.should.have.property('cause');
      done(err);
    });
  });

});

describe('bedrock-idp authenticated', function() {
  before(function(done) {
    login(done);
  });

  after(function(done) {
    logout(done);
  });

  it('should accept post to add a public key', function(done) {
    var keyService =
      config.server.baseUri +   bedrock.config.idp.identityBasePath +
      '/' + config.idp.test.testUser + '/keys';
    var publicKey = config.idp.test.publicKeys[0];
    request.post({
      url: keyService,
      body: publicKey,
      json: true
    }, function(err, res, body) {
      res.statusCode.should.equal(201);
      body.should.be.an('object');
      body.should.have.property('@context');
      // NOTE: id provides url to retrieve the key
      body.should.have.property('id');
      body.should.have.property('type');
      body.should.have.property('label');
      body.should.have.property('publicKeyPem');
      res.headers.should.be.an('object');
      res.headers.should.have.property('location');
      res.headers.location.should.equal(body.id);
      done(err);
    });
  });

  it('should return 409 on post to add a duplicate public key', function(done) {
    var keyService =
      config.server.baseUri +   bedrock.config.idp.identityBasePath +
      '/' + config.idp.test.testUser + '/keys';
    var publicKey = config.idp.test.publicKeys[1];
    async.series([
      function(callback) {
        request.post({
          url: keyService,
          body: publicKey,
          json: true
        }, callback);
      },
      function(callback) {
        request.post({
          url: keyService,
          body: publicKey,
          json: true
        }, function(err, res, body) {
          res.statusCode.should.equal(409);
          body.should.be.an('object');
          body.should.have.property('message');
          body.should.have.property('type');
          body.type.should.equal('DuplicateIdentityKey');
          body.should.have.property('details');
          body.details.should.be.an('object');
          body.should.have.property('cause');
          callback(err);
        });
      }
    ], done);
  });

  it(
    'should return 400 on post to add a malformed public key', function(done) {
      var keyService =
        config.server.baseUri +   bedrock.config.idp.identityBasePath +
        '/' + config.idp.test.testUser + '/keys';
      var publicKey = bedrock.util.clone(config.idp.test.publicKeys[2]);
      // remove @context to test validator
      delete publicKey['@context'];
      request.post({
        url: keyService,
        body: publicKey,
        json: true
      }, function(err, res, body) {
        res.statusCode.should.equal(400);
        body.should.be.an('object');
        body.should.have.property('message');
        body.should.have.property('type');
        body.type.should.equal('ValidationError');
        body.should.have.property('details');
        body.details.should.be.an('object');
        body.details.should.have.property('errors');
        body.details.errors.should.be.an('array');
        body.details.errors.should.have.length(1);
        var error = body.details.errors[0];
        error.should.be.an('object');
        error.should.have.property('details');
        error.details.should.be.an('object');
        error.details.should.have.property('path');
        error.details.path.should.equal('@context');
        error.details.should.have.property('errors');
        error.details.errors.should.be.an('object');
        error.details.errors.should.have.property('missing');
        body.should.have.property('cause');
        done(err);
      });
    });

  it('should revoke a public key', function(done) {
    var keyService =
      config.server.baseUri +   bedrock.config.idp.identityBasePath +
      '/' + config.idp.test.testUser + '/keys';
    // NOTE: this key was referenced in the previous test but not inserted
    var publicKey = config.idp.test.publicKeys[2];
    async.waterfall([
      function(callback) {
        request.post({
          url: keyService,
          body: publicKey,
          json: true
        }, function(err, res, body) {
          callback(err, body.id);
        });
      },
      function(keyUrl, callback) {
        var keyInfo = {
          '@context': 'https://w3id.org/identity/v1',
          id: keyUrl,
          revoked: ''
        };
        request.post({
          url: keyUrl,
          body: keyInfo,
          json: true
        }, function(err, res, body) {
          res.statusCode.should.equal(200);
          body.should.be.an('object');
          body.should.have.property('@context');
          // NOTE: id provides url to retrieve the key
          body.should.have.property('id');
          body.should.have.property('type');
          body.should.have.property('label');
          body.should.have.property('publicKeyPem');
          body.should.have.property('revoked');
          body.revoked.should.be.a('string');
          callback(err, keyUrl);
        });
      },
      function(keyUrl, callback) {
        // retrieve keyUrl to make sure revoked is present
        request.get({
          url: keyUrl,
          json: true
        }, function(err, res, body) {
          res.statusCode.should.equal(200);
          body.should.be.an('object');
          body.should.have.property('@context');
          // NOTE: id provides url to retrieve the key
          body.should.have.property('id');
          body.should.have.property('type');
          body.should.have.property('label');
          body.should.have.property('publicKeyPem');
          body.should.have.property('revoked');
          body.revoked.should.be.a('string');
          callback(err);
        });
      }
    ], done);
  });

  it('should modify label on a public key', function(done) {
    var keyService =
      config.server.baseUri +   bedrock.config.idp.identityBasePath +
      '/' + config.idp.test.testUser + '/keys';
    // NOTE: this key was referenced in the previous test but not inserted
    var publicKey = config.idp.test.publicKeys[3];
    async.waterfall([
      function(callback) {
        request.post({
          url: keyService,
          body: publicKey,
          json: true
        }, function(err, res, body) {
          callback(err, body.id);
        });
      },
      function(keyUrl, callback) {
        var keyInfo = {
          '@context': 'https://w3id.org/identity/v1',
          id: keyUrl,
          label: 'newLabel3'
        };
        request.post({
          url: keyUrl,
          body: keyInfo,
          json: true
        }, function(err, res, body) {
          res.statusCode.should.equal(204);
          should.not.exist(body);
          callback(err, keyUrl);
        });
      },
      function(keyUrl, callback) {
        // retrieve keyUrl to make sure revoked is present
        request.get({
          url: keyUrl,
          json: true
        }, function(err, res, body) {
          res.statusCode.should.equal(200);
          body.should.be.an('object');
          body.should.have.property('@context');
          body.should.have.property('id');
          body.should.have.property('type');
          body.should.have.property('label');
          body.label.should.equal('newLabel3');
          body.should.have.property('publicKeyPem');
          callback(err);
        });
      }
    ], done);
  });

  it('should return 404 on attempt to modify unknown key', function(done) {
    var testIdentity = config.idp.test.testUser;
    var keyService = config.server.baseUri +
      config.idp.identityBasePath + '/' + testIdentity + '/keys/999';
    var keyInfo = {
      '@context': 'https://w3id.org/identity/v1',
      id: keyService,
      label: 'newLabel3'
    };
    request.post({
      url: keyService,
      body: keyInfo,
      json: true
    }, function(err, res, body) {
      res.statusCode.should.equal(404);
      body.should.be.an('object');
      body.should.have.property('message');
      body.should.have.property('type');
      body.type.should.equal('NotFound');
      body.should.have.property('details');
      body.details.should.be.an('object');
      body.details.should.have.property('key');
      body.details.key.should.be.an('object');
      body.details.key.should.have.property('id');
      body.details.key.id.should.equal(keyService);
      body.should.have.property('cause');
      done(err);
    });
  });

});

function login(callback) {
  var loginService = config.server.baseUri + '/session/login';
  request.post({
    url: loginService,
    body: {sysIdentifier: config.idp.test.testUser, password: 'password'},
    json: true
  }, function(err, res, body) {
    // console.log('LOGINBODY', body);
    callback(err);
  });
}

function logout(callback) {
  var logoutService = config.server.baseUri + '/session/logout';
  request.get({
    url: logoutService,
    json: true
  }, function(err, res, body) {
    callback(err);
  });
}
