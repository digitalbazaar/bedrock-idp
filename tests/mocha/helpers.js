/*
 * Copyright (c) 2014-2016 Digital Bazaar, Inc. All rights reserved.
 */
/* globals after, afterEach, before, beforeEach, it, process, describe,
  require, should  */
/* jshint node: true */
'use strict';

var async = require('async');
var bedrock = require('bedrock');
var brIdentity = require('bedrock-identity');
var brKey = require('bedrock-key');
var config = require('bedrock').config;
var database = require('bedrock-mongodb');
var mockData = require('./mock.data');
var store = require('bedrock-credentials-mongodb').provider;
var uuid = require('node-uuid').v4;
var url = require('url');
var util = bedrock.util;
var jsonld = bedrock.jsonld;
var jsigs = require('jsonld-signatures');
jsigs.use('jsonld', jsonld);
var oldLoader = jsonld.documentLoader;
jsonld.documentLoader = function(url, callback) {
  var regex = new RegExp(
    config['credential-curator']['authorization-io'].baseUrl + '(.*?)$');
  var didMatch = url.match(regex);
  if(didMatch && didMatch.length === 2 &&
    didMatch[1] in mockData.didDocuments) {
    return callback(
      null, {
        contextUrl: null,
        document: mockData.didDocuments[didMatch[1]],
        documentUrl: url
      });
  }
  oldLoader(url, callback);
};

var api = {};
module.exports = api;

api.createCrytographicIdentity = function(sourceIdentity, callback) {
  var publicKey = {
    '@context': 'https://w3id.org/identity/v1',
    id: sourceIdentity.keys.publicKey.id,
    type: 'CryptographicKey',
    owner: sourceIdentity.identity.id,
    publicKeyPem: sourceIdentity.keys.publicKey.publicKeyPem
  };
  var credential = {
    '@context': 'https://w3id.org/identity/v1',
    id: 'urn:ephemeral:' + uuid(),
    type: ['Credential', 'CryptographicKeyCredential'],
    claim: {
      id: sourceIdentity.identity.id,
      publicKey: publicKey
    }
  };
  jsigs.sign(
    credential, {
      privateKeyPem:
        sourceIdentity.keys.privateKey.privateKeyPem,
      creator: sourceIdentity.keys.publicKey.id,
      domain: url.parse(config.server.baseUri).host,
      algorithm: 'LinkedDataSignature2015'
    }, function(err, signedCredential) {
      if(err) {
        callback(err);
      }
      var targetIdentity = {
        '@context': 'https://w3id.org/identity/v1',
        id: sourceIdentity.identity.id,
        type: 'Identity',
        credential: {'@graph': signedCredential}
      };
      callback(null, targetIdentity);
    });
};

api.createQuery = function(cryptographicIdentity) {
  var credentialQuery = {
    query: {
      '@context': 'https://w3id.org/identity/v1',
      birthDate: ''
    },
    identity: cryptographicIdentity
  };
  return credentialQuery;
};

api.createUniqueCredential = function(claimId) {
  var testBaseUri = 'https://example.com/credentials/';
  var newCredential = util.clone(mockData.credentialTemplate);
  newCredential.id = testBaseUri + uuid();
  newCredential.claim.id = claimId;
  var newIdentity = {
    '@context': 'https://w3id.org/identity/v1',
    type: 'Identity',
    id: claimId,
    credential: [{'@graph': newCredential}]
  };
  return newIdentity;
};

api.findCredential = function(credentialId, callback) {
  var query = {'credential.id': credentialId};
  store.collection.count(query, {}, function(err, result) {
    if(err) {
      return callback(err);
    }
    callback(null, result);
  });
};

api.login = function(request, authData, callback) {
  var loginService =
    config.server.baseUri + config['authn-password'].routes.login;
  request.post({
    url: loginService,
    body: authData
  }, function(err, res, body) {
    callback(err);
  });
};

api.logout = function(request, callback) {
  request.get(
    config.server.baseUri + config['session-http'].routes.logout, callback);
};

api.prepareDatabase = function(options, callback) {
  async.series([
    function(callback) {
      api.removeCollections(callback);
    },
    function(callback) {
      insertTestData(options, callback);
    }
  ], function(err) {
    callback(err);
  });
};

api.removeCollections = function(callback) {
  var collectionNames = [
    'credentialProvider', 'identity', 'publicKey', 'eventLog'];
  database.openCollections(collectionNames, function(err) {
    async.each(collectionNames, function(collectionName, callback) {
      database.collections[collectionName].remove({}, callback);
    }, function(err) {
      callback(err);
    });
  });
};

// Insert identities and public keys used for testing into database
function insertTestData(options, done) {
  async.forEachOf(mockData.identities, function(identity, key, callback) {
    async.parallel([
      function(callback) {
        brIdentity.insert(null, identity.identity, callback);
      },
      function(callback) {
        brKey.addPublicKey(null, identity.keys.publicKey, callback);
      },
      function(callback) {
        if(!('credentials' in options) || !options.credentials.insert) {
          return callback();
        }
        async.each(identity.credentials, function(credential, callback) {
          if(options.credentials.claimed) {
            credential.sysState = 'claimed';
          }
          credential.sysState = 'unclaimed';
          store.insert(null, credential, callback);
        }, callback);
      }
    ], callback);
  }, function(err) {
    if(err) {
      if(!database.isDuplicateError(err)) {
        // duplicate error means test data is already loaded
        return done(err);
      }
    }
    done();
  });
}
