/*
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var bedrock = require('bedrock');
var docs = require('bedrock-docs');

// module API
var api = {};
module.exports = api;

// add routes
bedrock.events.on('bedrock-express.configure.routes', addRoutes);

function addRoutes(app) {
  app.get('/.well-known/web-keys', function(req, res) {
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

  app.get('/.well-known/identity', function(req, res) {
    var endpoints = {
      '@context': {
        id: '@id',
        identityService: 'https://w3id.org/identity#identityService',
        owner: 'https://w3id.org/security#owner'
      },
      identityService: {
        id: bedrock.config.server.baseUri + bedrock.config.idp.identityBasePath,
        owner: bedrock.config.identity.owner
      }
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
