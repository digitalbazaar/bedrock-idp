/*
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var bedrock = require('bedrock');
var cors = require('cors');
var docs = require('bedrock-docs');

// module API
var api = {};
module.exports = api;

// TODO: move well-known services to a root domain (JSON-LD) document

// add routes
bedrock.events.on('bedrock-express.configure.routes', addRoutes);

function addRoutes(app) {
  app.options('/.well-known/identity', cors());
  app.get('/.well-known/web-keys', cors(), function(req, res) {
    var endpoints = {
      '@context': {
        publicKeyService: 'https://w3id.org/security#publicKeyService'
      },
      publicKeyService:
        bedrock.config.server.baseUri +
        bedrock.config.idp.identityBasePath +
        '?service=add-key'
    };
    res.type('application/json');
    res.send(endpoints);
  });
  docs.annotate.get('/.well-known/web-keys', {
    displayName: 'Discovery - Web Keys',
    description: 'Get the Web keys services associated with this website.',
    responses: {
      200: {
        'application/ld+json': {
          'example': 'examples/well-known.web-keys.jsonld'
        }
      }
    }
  });

  app.options('/.well-known/identity', cors());
  app.get('/.well-known/identity', cors(), function(req, res) {
    // TODO: move entire document to config system
    var endpoints = {
      '@context': {
        id: '@id',
        identityService: 'https://w3id.org/identity#identityService',
        credentialsRequestUrl: 'https://w3id.org/identity#credentialsRequestUrl',
        storageRequestUrl: 'https://w3id.org/identity#storageRequestUrl',
        credentialManagementUrl:
          'https://w3id.org/identity#credentialManagementUrl',
        owner: 'https://w3id.org/security#owner'
      },
      identityService: {
        id: bedrock.config.server.baseUri + bedrock.config.idp.identityBasePath,
        owner: bedrock.config.idp.owner.id
      },
      // TODO: base on credential-curator endpoint config
      credentialsRequestUrl: bedrock.config.server.baseUri +
        '/tasks/credentials/compose-identity',
      storageRequestUrl: bedrock.config.server.baseUri +
        '/tasks/credentials/store-credentials',
      credentialManagementUrl: bedrock.config.server.baseUri +
        '/credential-task'
    };
    res.type('application/json');
    res.send(endpoints);
  });
  docs.annotate.get('/.well-known/identity', {
    displayName: 'Discovery - Identity Credentials',
    description: 'Get the Identity services associated with this website.',
    responses: {
      200: {
        'application/ld+json': {
          'example': 'examples/well-known.identity.jsonld'
        }
      }
    }
  });
}
