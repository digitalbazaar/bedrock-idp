/*
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var constants = require('bedrock').config.constants;
var schemas = require('bedrock-validation').schemas;

var sysImageType = {
  required: false,
  type: 'string',
  enum: ['url', 'gravatar']
};
var sysGravatarType = {
  required: false,
  type: 'string',
  enum: ['gravatar', 'mm', 'identicon', 'monsterid', 'wavatar', 'retro']
};
var sysPublic = {
  required: false,
  title: 'Identity Property Visibility',
  description: 'A list of Identity properties that are publicly visible.',
  type: 'array',
  uniqueItems: true,
  items: {
    type: 'string',
    enum: [
      'description',
      'email',
      'image',
      'label',
      'url'
    ]
  },
  errors: {
    invalid: 'Only "description", "email", "image", "label", and "url" are ' +
      'permitted.',
    missing: 'Please enter the properties that should be publicly visible.'
  }
};

var postIdentity = {
  title: 'Post Identity',
  type: 'object',
  properties: {
    '@context': schemas.jsonldContext(constants.IDENTITY_CONTEXT_V1_URL),
    id: schemas.identifier(),
    description: schemas.description({required: false}),
    //email: schemas.email({required: false}),
    image: schemas.url({required: false}),
    label: schemas.label({required: false}),
    url: schemas.url({required: false}),
    sysImageType: sysImageType,
    sysGravatarType: sysGravatarType,
    sysPublic: sysPublic,
    sysSigningKey: schemas.identifier({required: false})
  },
  additionalProperties: false
};

var getIdentitiesQuery = {
  title: 'Get Identities Query',
  type: 'object',
  properties: {
    service: {
      required: false,
      type: 'string',
      enum: ['add-key']
    },
    'public-key-label': {
      required: false,
      type: schemas.label()
    },
    'public-key': {
      required: false,
      type: schemas.publicKeyPem()
    },
    'registration-callback': {
      required: false,
      type: schemas.url()
    },
    'response-nonce': {
      required: false,
      type: schemas.nonce()
    }
  }
};

var postIdentitiesQuery = {
  title: 'Post Identities Query',
  type: 'object',
  properties: {
    action: {
      required: false,
      type: 'string',
      enum: ['query']
    },
    authorize: {
      required: false,
      type: 'string',
      enum: ['true']
    },
    credentials: {
      required: false,
      type: 'string',
      enum: ['true', 'false']
    },
    domain: {
      required: true,
      type: 'string',
      minLength: 1,
      maxLength: 100
    },
    callback: {
      required: false,
      type: schemas.url()
    }
  }
};

var postIdentities = {
  title: 'Post Identities',
  description: 'Identity credentials query or Identity creation',
  type: [{
    title: 'Identity Query',
    description: 'Query Identity credentials',
    type: 'object',
    properties: {
      query: {
        required: true,
        type: 'string'
      }
    },
    additionalProperties: false
  }, {
    title: 'Create Identity',
    description: 'Create an Identity',
    type: 'object',
    properties: {
      '@context': schemas.jsonldContext(constants.IDENTITY_CONTEXT_V1_URL),
      id: schemas.identifier({required: false}),
      type: {
        required: true,
        type: 'string',
        enum: ['Identity']
      },
      sysSlug: schemas.slug(),
      label: schemas.label(),
      image: schemas.url({required: false}),
      email: schemas.email(),
      sysPassword: schemas.password(),
      url: schemas.url({required: false}),
      description: schemas.description({required: false}),
      sysImageType: sysImageType,
      sysGravatarType: sysGravatarType,
      sysPublic: sysPublic
    },
    additionalProperties: false
  }]
};

var postPreferences = {
  title: 'Post Preferences',
  type: 'object',
  properties: {
    '@context': schemas.jsonldContext(constants.IDENTITY_CONTEXT_V1_URL),
    type: schemas.jsonldType('IdentityPreferences'),
    publicKey: {
      required: false,
      type: [{
        // IRI only
        type: 'string'
      }, {
        // label+pem
        type: 'object',
        properties: {
          label: schemas.label(),
          publicKeyPem: schemas.publicKeyPem()
        }
      }]
    }
  },
  additionalProperties: false
};

var postEmailVerify = {
  title: 'Verify email',
  description: 'Verify an email address.',
  type: 'object',
  properties: {
    sysPasscode: schemas.passcode()
  },
  additionalProperties: false
};

module.exports.postIdentity = function() {
  return postIdentity;
};
module.exports.getIdentitiesQuery = function() {
  return getIdentitiesQuery;
};
module.exports.postIdentitiesQuery = function() {
  return postIdentitiesQuery;
};
module.exports.postIdentities = function() {
  return postIdentities;
};
module.exports.postPreferences = function() {
  return postPreferences;
};
module.exports.postEmailVerify = function() {
  return postEmailVerify;
};
