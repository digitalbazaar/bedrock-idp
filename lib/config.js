/*
 * Bedrock IDP Module Configuration
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var config = require('bedrock').config;
var path = require('path');
require('bedrock-identity');
require('bedrock-mail');
require('bedrock-validation');
require('bedrock-views');

config.idp = {};
// needs to be set to the ID of an Identity that owns the IdP
config.idp.owner = null;
// FIXME: provisional name, where should this be stored?
config.idp.ownerDid;
// base path for identity IDs (appended to config.server.baseUri)
config.idp.identityBasePath = '/i';
config.idp.allowInsecureCallback = false;
config.idp.defaults = {
  identity: {
    '@context': config.constants.IDENTITY_CONTEXT_V1_URL,
    type: 'Identity',
    sysStatus: 'active'
  }
};
config.idp.identities = [];
config.idp.keys = [];

// FIXME: this key needs to be stored in a safe place
config.idp.credentialSigningPrivateKey =
  '-----BEGIN RSA PRIVATE KEY-----\n' +
  'MIIEogIBAAKCAQEAlNthygoi1J5gj5i0GmnvoFBlTRg3oMoMhmj0OHRpFQf2igli\n' +
  'NrzxtjNEZBK3WAbcBGHonNBS1MsxKSoHaS4NcJiu3Wq4DX6MJzDKZuNkah1sxSUt\n' +
  'S2owAfO1QzdCxiHNyqDFr1rnoJqIYx+NfQoaLQn3MU1ymppFIK/yUp/ya/22KCFD\n' +
  'ohkmwMxkda8J2FHBun9ReZubZVVn6Yb7AkOgp1pb2TFzph/va9QHXIghU0MEesW+\n' +
  'V3dMveK3ZYenRSsEWFthysxrxiXlPTBFsgWl3vbBcWnAeGbYyUW1gVeKXoOUvCwK\n' +
  'f51eomC0By4DaJyGPeXugW3dk3PHvGIWYmPHIQIDAQABAoIBAGI84i2HQPNWzl0W\n' +
  'Jw4jiawgQqp9aADqNxfhXgN/9/WUOsVgafu7+D0JWoI8w9kJNdyCjRQoe/HJY1lK\n' +
  'TnfAl8gOS6D+lBb7xBz9GyaJvTQ21RjKbzkNDD/NiXuhlaTSnFC0h6IxeRnJwmbA\n' +
  'ZQz3RM0ifYuBFDgpxaNL2r1ip4dSeGEDqOWYp8f9VSwbfyKVuWATN1VLhGYpCrUd\n' +
  'LEdQhImeQa65UR6iri51lbNnovfN8Qce09rDbpXzG5+uj9ZNgGhM+wFZO2CzQBR9\n' +
  'lGC+K9MFQ9SwxHK8Z+zIu+stGYtQNchHju0rvHYV+RkdnpCu6f4ExxDoCZTbbXts\n' +
  'YoAiMhECgYEAxGd3iEZ3O8JnuIrqfwwm4yaKwXPUkMOdR1LPoYtA8+bli102mZOW\n' +
  'XpA67PdFjnhSD3CtlLoJgtJ51ehyKOWwTPoq0FJLmBr+/BWKmEYBHLQGKTPbNuTL\n' +
  'f3NQgRZ8rMfLoiyA48PJu5QZWiJ6QabVM0UXAAnM5hvEtLntLIcUFIUCgYEAwgZ7\n' +
  'in7e3nKa4dR/KjS1ZYHbjXr2JvSrqa0kzlrolcMGvnkb9Re3tgKZbX3YZ0iH6i8J\n' +
  'C7V/3nlJ2Cxm3TgFjvvzZ/KJ2tY4a5eQgZQV7yNYZV+UyvvaHw6JOK34PKyOEgkE\n' +
  'QPfRMEzqkJV2Cr9cYHGdfvxoX3CxjWJwYUq4KO0CgYBBQ+iyvkfM8fMpnfACu/UI\n' +
  'MryVQHp4iKhxFRGuKuowop/Qye7k5ehoECGksR7KEy2ht93WuGOEt5CJBq846+rE\n' +
  'CbXEeDRqnT3yYu4lX83qzd/mPTcxbKI6/gTYgLJ5cAM5JvTFu0AEN1idXSunOVtL\n' +
  'qD/WYWtXZA7fx5EK5PBFSQKBgHw7wGDWiYevpCJTeLUimL+NHXKCuBgLc9sqJTYI\n' +
  'GYLDJI9TZqZRcG0XTvw/pw/C7lvxj/4yUdS2nqTPEXI2S8DY7GqzbrdzkR67JmkB\n' +
  '0+WSISiPwesSxgA6w3xKUHcxGarMoS+kPgqKRWsceD+7db+/H9ROc9ogg19/F2wE\n' +
  'dtSlAoGAKKYHu/Ez+91cB/jXcXpwLVVxpKuzGrpHqMZ6HxAYpWyOtLtvwlj8VqnU\n' +
  '6DYQwjl795JAAjVZBvMq3x2Vp9/1ITlhcykpssmuhPX2pUtviQiBdPENcNLfbFM4\n' +
  'p4xzAGKZd2X8VeyS9jrqJgWZa2k/BAqLZixalPQ3xR8dZkLdwbs=\n' +
  '-----END RSA PRIVATE KEY-----\n';
config.idp.credentialSigningPublicKeyId = 'https://example.com/keys/1';

// mail config
config.mail.events.push({
  type: 'bedrock.Identity.created',
  // email for admin
  template: 'bedrock.Identity.created'
}, {
  type: 'bedrock.Identity.created',
  // email for owner
  template: 'bedrock.Identity.created-identity'
}, {
  type: 'bedrock.Identity.passcodeSent',
  // email for owner
  template: 'bedrock.Identity.passcodeSent'
});

var ids = [
  'bedrock.Identity.created',
  'bedrock.Identity.created-identity',
  'bedrock.Identity.passcodeSent'
];
ids.forEach(function(id) {
  config.mail.templates.config[id] = {
    filename: path.join(__dirname, '..', 'email-templates', id + '.tpl')
  };
});

// default mail setup, should be overridden
config.mail.vars = {
  // could be set to config.views.vars.productionMode,
  productionMode: false,
  baseUri: config.server.baseUri,
  subject: {
    prefix: '[Bedrock] ',
    identityPrefix: '[Bedrock] '
  },
  service: {
    name: 'Bedrock',
    host: config.server.host
  },
  system: {
    name: 'System',
    email: 'cluster@' + config.server.domain
  },
  support: {
    name: 'Customer Support',
    email: 'support@' + config.server.domain
  },
  registration: {
    email: 'registration@' + config.server.domain
  },
  comments: {
    email: 'comments@' + config.server.domain
  },
  machine: require('os').hostname()
};

// common validation schemas
config.validation.schema.paths.push(
  path.join(__dirname, '..', 'schemas')
);

// server-rendered views
config.views.paths.push(
  path.join(__dirname, '..', 'views')
);

// contexts
config.views.vars.contextUrls.identity =
  config.constants.IDENTITY_CONTEXT_V1_URL;

// tests
config.mocha.tests.push(path.join(__dirname, '..', 'tests'));
