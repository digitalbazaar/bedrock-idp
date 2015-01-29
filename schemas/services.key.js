/*
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var schemas = require('bedrock-validation').schemas;

var postKey = {
  type: 'object',
  properties: {
    '@context': schemas.jsonldContext(),
    id: schemas.identifier(),
    label: schemas.label({required: false}),
    revoked: {
      required: false,
      type: 'string'
    }
  },
  additionalProperties: false
};

var postKeys = {
  type: 'object',
  properties: {
    '@context': schemas.jsonldContext(),
    label: schemas.label(),
    publicKeyPem: schemas.publicKeyPem(),
    privateKeyPem: schemas.privateKeyPem({required: false})
  },
  additionalProperties: false
};

module.exports.postKey = function() {
  return postKey;
};
module.exports.postKeys = function() {
  return postKeys;
};
