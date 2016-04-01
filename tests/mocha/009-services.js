/*
 * Copyright (c) 2014-2016 Digital Bazaar, Inc. All rights reserved.
 */
/* globals describe, before, after, it, should, beforeEach, afterEach */
/* jshint node: true */
'use strict';

var bedrock = require('bedrock');
var config = bedrock.config;
var async = require('async');
var request = require('request');
var mockData = require('./mock.data');
var helpers = require('./helpers');
request = request.defaults({jar: true, json: true});

process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

describe('bedrock-idp 009-services', function() {
  before(function(done) {
    async.auto({
      prepareDatabase: function(callback) {
        helpers.prepareDatabase({}, callback);
      }
    }, done);
  });

  describe('bedrock-idp unauthenticated', function() {
    var identity = mockData.identities.rsa2048.identity;
    var testService = config.server.baseUri + config.idp.identityBasePath +
      '/' + identity.id;
    it('allows an unauthenticated request to /i/:id', function(done) {
      request.get(testService, function(err, res, body) {
        res.statusCode.should.equal(200);
        body.should.have.property('@context');
        body.should.have.property('id');
        body.id.should.equal(identity.id);
        body.should.have.property('type');
        body.type.should.equal('Identity');
        body.should.have.property('email');
        body.email.should.equal(mockData.identities.rsa2048.identity.email);
        done(err);
      });
    });

    it('should return 404 for private /i/:id', function(done) {
      var identity = mockData.identities.privateIdentity.identity;
      var testService = config.server.baseUri + config.idp.identityBasePath +
        '/' + identity.id;
      request.get(testService, function(err, res, body) {
        res.statusCode.should.equal(404);
        done(err);
      });
    });

    // FIXME: API for accessing public keys has changed
    it.skip('allows an unauthenticated request to /i/:id/keys', function(done) {
      var keysService = testService + '/keys';
      request.get(
        keysService,
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

    it.skip('allows an unauthenticated request /i/:id/keys/#', function(done) {
      var keysService = testService + '/keys';
      async.waterfall([
        function(callback) {
          request.get(keysService, function(err, res, body) {
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
      var identity = {
        id: bedrock.config.server.baseUri +
          bedrock.config.idp.identityBasePath + '/someUnknownIdentity'
      };
      request.get(
        identity.id,
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

    it.skip('returns 404 on unknown id request to /i/:id/keys', function(done) {
      var identity = {
        id: bedrock.config.server.baseUri +
          bedrock.config.idp.identityBasePath + '/someUnknownIdentity'
      };
      var keysService = identity.id + '/keys';
      request.get(
        keysService,
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
      var identity = config.idp.test.testIdentity;
      var badService = identity.id + '/badendpoint';
      request.get(
        badService,
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
      var identity = config.idp.test.testIdentity;
      var keyId = identity.id + '/keys/999';
      request.get(keyId, function(err, res, body) {
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
        body.details.key.id.should.equal(keyId);
        body.should.have.property('cause');
        done(err);
      });
    });

    // this is proper request, it is not authenticated
    it.skip('should not accept post to add a public key', function(done) {
      var identity = config.idp.test.testIdentity;
      var keysService = identity.id + '/keys';
      var publicKey = config.idp.test.publicKeys[0];
      request.post({
        url: keysService,
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
});
// helper function for identity editing checks
function _editIdentityProperty(identity, url, done) {
  var originalLabel = null;
  var newLabel = null;
  async.waterfall([
    function(callback) {
      // retrieve identity to get original label
      request.get({
        url: url,
        json: true
      }, function(err, res, body) {
        res.statusCode.should.equal(200);
        body.should.be.an('object');
        body.should.have.property('id');
        body.id.should.equal(identity.id);
        body.should.have.property('label');
        originalLabel = body.label;
        newLabel = 'NEW ' + originalLabel;
        callback(err);
      });
    },
    function(callback) {
      // update label
      request.post({
        url: url,
        body: {
          '@context': 'https://w3id.org/identity/v1',
          id: identity.id,
          label: newLabel
        },
        json: true
      }, function(err, res, body) {
        res.statusCode.should.equal(204);
        callback(err);
      });
    },
    function(callback) {
      // retrieve identity to get updated label
      request.get({
        url: url,
        json: true
      }, function(err, res, body) {
        res.statusCode.should.equal(200);
        body.should.be.an('object');
        body.should.have.property('id');
        body.id.should.equal(identity.id);
        body.should.have.property('label');
        body.label.should.equal(newLabel);
        callback(err);
      });
    },
    function(callback) {
      // restore original label
      request.post({
        url: url,
        body: {
          '@context': 'https://w3id.org/identity/v1',
          id: identity.id,
          label: originalLabel
        },
        json: true
      }, function(err, res, body) {
        res.statusCode.should.equal(204);
        callback(err);
      });
    }
  ], done);
}

// FIXME: the keys API has changed
describe.skip('bedrock-idp authenticated', function() {
  var identity = config.idp.test.testIdentity;

  before(function(done) {
    var authData = {sysIdentifier: 'rsa2048', password: 'password'};
    helpers.login(request, authData, done);
  });

  after(function(done) {
    helpers.logout(request, done);
  });

  it('should accept post to add a public key', function(done) {
    var keysService = identity.id + '/keys';
    var publicKey = config.idp.test.publicKeys[0];
    request.post({
      url: keysService,
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
    var keysService = identity.id + '/keys';
    var publicKey = config.idp.test.publicKeys[1];
    async.series([
      function(callback) {
        request.post({
          url: keysService,
          body: publicKey,
          json: true
        }, callback);
      },
      function(callback) {
        request.post({
          url: keysService,
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
      var keysService = identity.id + '/keys';
      var publicKey = bedrock.util.clone(config.idp.test.publicKeys[2]);
      // remove @context to test validator
      delete publicKey['@context'];
      request.post({
        url: keysService,
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
    var keysService = identity.id + '/keys';
    // NOTE: this key was referenced in the previous test but not inserted
    var publicKey = config.idp.test.publicKeys[2];
    async.waterfall([
      function(callback) {
        request.post({
          url: keysService,
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
    var keysService = identity.id + '/keys';
    // NOTE: this key was referenced in the previous test but not inserted
    var publicKey = config.idp.test.publicKeys[3];
    async.waterfall([
      function(callback) {
        request.post({
          url: keysService,
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
    var badKeyService = identity.id + '/keys/999';
    var keyInfo = {
      '@context': 'https://w3id.org/identity/v1',
      id: badKeyService,
      label: 'newLabel3'
    };
    request.post({
      url: badKeyService,
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
      body.details.key.id.should.equal(badKeyService);
      body.should.have.property('cause');
      done(err);
    });
  });

  it('should edit an identity property', function(done) {
    _editIdentityProperty(identity, identity.id, done);
  });

  it('should fail to edit unknown identity property', function(done) {
    async.waterfall([
      function(callback) {
        // bogus update
        request.post({
          url: identity.id,
          body: {
            '@context': 'https://w3id.org/identity/v1',
            id: identity.id,
            BOGUS: 'BOGUS'
          },
          json: true
        }, function(err, res, body) {
          res.statusCode.should.equal(400);
          callback(err);
        });
      }
    ], done);
  });
});

describe.skip('bedrock-idp non-http authenticated', function() {
  var identity = config.idp.test.nonHttpTestIdentity;

  before(function(done) {
    var authData = {sysIdentifier: 'rsa2048', password: 'password'};
    helpers.login(request, authData, done);
  });

  after(function(done) {
    helpers.logout(request, done);
  });

  it('should edit an identity property', function(done) {
    var identity = config.idp.test.nonHttpTestIdentity;
    var url = config.server.baseUri + bedrock.config.idp.identityBasePath +
      '/' + identity.sysSlug;
    _editIdentityProperty(identity, url, done);
  });
});
