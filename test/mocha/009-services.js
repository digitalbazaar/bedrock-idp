/*
 * Copyright (c) 2014-2016 Digital Bazaar, Inc. All rights reserved.
 */
/* globals should */
/* jshint node: true */
'use strict';

var bedrock = require('bedrock');
var config = bedrock.config;
var async = require('async');
var request = require('request');
var mockData = require('./mock.data');
var helpers = require('./helpers');
var uuid = require('uuid').v4;
request = request.defaults({jar: true, json: true, strictSSL: false});

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
    var testService = identity.id;
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
        body.should.have.property('publicKey');
        done(err);
      });
    });

    it('should return public key for otherwise private id', function(done) {
      var identity = mockData.identities.privateIdentity.identity;
      var testService = identity.id;
      request.get(testService, function(err, res, body) {
        res.statusCode.should.equal(200);
        body.should.have.property('@context');
        body.should.have.property('id');
        body.id.should.equal(identity.id);
        body.should.have.property('type');
        body.type.should.equal('Identity');
        body.should.have.property('publicKey');
        // email should not be exposed in this case
        body.should.not.have.property('email');
        done(err);
      });
    });

    it('allows an unauthenticated request to public key', function(done) {
      var identity = mockData.identities.rsa2048.identity;
      var identityService = identity.id;
      async.auto({
        getIdentity: function(callback) {
          request.get(identityService, function(err, res, body) {
            callback(err, body);
          });
        },
        getKey: ['getIdentity', function(callback, results) {
          request.get(
            results.getIdentity.publicKey.id, function(err, res, body) {
              res.statusCode.should.equal(200);
              body.should.have.property('@context');
              body.should.have.property('id');
              body.should.have.property('type');
              body.should.have.property('label');
              body.should.have.property('publicKeyPem');
              callback();
            });
        }]
      }, done);
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

    it('returns 404 on unknown public key', function(done) {
      var badKeyId = bedrock.config.server.baseUri + config.key.basePath +
        '/' + uuid();
      request.get(badKeyId, function(err, res, body) {
        res.statusCode.should.equal(404);
        body.should.be.an('object');
        body.should.have.property('message');
        body.should.have.property('type');
        body.type.should.equal('NotFound');
        body.should.have.property('details');
        body.should.have.property('cause');
        done(err);
      });
    });

    // this is proper request, it is not authenticated
    it('should not accept post to add a public key', function(done) {
      // var identity = config.idp.test.testIdentity;
      var keysService = config.server.baseUri + config.key.basePath;
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
  describe('bedrock-idp authenticated', function() {
    var identity = mockData.identities.rsa2048.identity;
    var keyService = config.server.baseUri + config.key.basePath;

    before(function(done) {
      var authData = {sysIdentifier: 'rsa2048', password: 'password'};
      async.series([
        function(callback) {
          helpers.prepareDatabase({}, callback);
        },
        function(callback) {
          helpers.login(request, authData, callback);
        }
      ], done);
    });

    after(function(done) {
      helpers.logout(request, done);
    });

    it('should accept post to add a public key', function(done) {
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

    it('returns 409 on post to add a duplicate public key', function(done) {
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

    it('returns 400 on post to add a malformed public key', function(done) {
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
            body: keyInfo
          }, function(err, res, body) {
            res.statusCode.should.equal(204);
            should.not.exist(body);
            callback(err, keyUrl);
          });
        },
        function(keyUrl, callback) {
          // retrieve keyUrl to make sure revoked is present
          request.get({
            url: keyUrl
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

    it('returns error if attempting to modify key belonging to another id');

    it('should return 404 on attempt to modify unknown key', function(done) {
      var badKeyService =
      config.server.baseUri + config.key.basePath + '/' + uuid();
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

    // FIXME: validator in identity-http needs to be repaired
    it.skip('should fail to edit unknown identity property', function(done) {
      async.waterfall([
        function(callback) {
          // bogus update
          request.patch({
            url: identity.id,
            body: [{
              op: 'updateIdentity',
              changes: {
                BADPROPERTY: 'badProperty'
              }
            }]
          }, function(err, res) {
            res.statusCode.should.equal(400);
            callback(err);
          });
        }
      ], done);
    });
  });
});

describe.skip('bedrock-idp non-http authenticated', function() {
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

// helper function for identity editing checks
function _editIdentityProperty(identity, url, done) {
  var originalLabel = null;
  var newLabel = null;
  async.waterfall([
    function(callback) {
      // retrieve identity to get original label
      request.get({
        url: url
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
      request.patch({
        url: url,
        body: [{
          op: 'updateIdentity',
          changes: {
            label: newLabel
          }
        }]
      }, function(err, res) {
        res.statusCode.should.equal(204);
        callback(err);
      });
    },
    function(callback) {
      // retrieve identity to get updated label
      request.get({
        url: url
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
      request.patch({
        url: url,
        body: [{
          op: 'updateIdentity',
          changes: {
            label: originalLabel
          }
        }]
      }, function(err, res) {
        res.statusCode.should.equal(204);
        callback(err);
      });
    }
  ], done);
}
