/*
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var bedrock = require('bedrock');

var schema = {
  required: true,
  title: 'Identity Credentials Query',
  description: 'A query for Identity Credentials.',
  type: 'object',
  properties: {
    '@context': {
      required: true,
      title: 'JSON-LD Identity context',
      description: 'A JSON-LD Identity context',
      type: 'string',
      enum: ['https://w3id.org/identity/v1']
    }
  }
};

module.exports = function(extend) {
  if(extend) {
    return bedrock.util.extend(true, bedrock.util.clone(schema), extend);
  }
  return schema;
};
