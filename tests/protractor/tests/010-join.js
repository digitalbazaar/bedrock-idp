/*
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var bedrock = GLOBAL.bedrock;
var should = GLOBAL.should;
var describe = GLOBAL.describe;
var it = GLOBAL.it;

describe('IdP join form', function() {
  var identity = {};
  identity.sysIdentifier = bedrock.randomString().toLowerCase();
  identity.id =
    bedrock.baseUrl + bedrock.config.identityBasePath + identity.sysIdentifier;
  identity.label = identity.sysIdentifier;
  identity.email = identity.sysIdentifier + '@bedrock.dev';
  identity.password = 'password';
  var loginCredentials = {
    sysIdentifier: identity.sysIdentifier,
    passphrase: identity.password
  };
  var threeCharacters = 'abc';
  var fortyCharacters = 'yA2NdBthMcnTqGYz3Eqe9uNHxM8u00TaooiuhIM';

  beforeEach(function() {
    bedrock.pages.join.get();
  });

  it('should contain the proper fields', function() {
    bedrock.pages.join.checkFields();
  });

  it('should accept a valid form', function() {
    bedrock.pages.join.createIdentity(identity);
  });

  // FIXME: write test for the various email related conditions
  it('should warn on invalid email');

  it('should warn on a short password', function() {
    bedrock.pages.join.testField(
      'model.identity.sysPassword', threeCharacters, 'minlength');
  });

  it('should warn on a long password', function() {
    bedrock.pages.join.testField(
      'model.identity.sysPassword', fortyCharacters, 'maxlength');
  });

  it('should warn if password confirmation does not match', function() {
    bedrock.pages.join.testFieldsMatch(
      'model.identity.sysPassword', 'model.passphraseConfirmation',
      'goodPhraseA', 'nonMatchingPhraseB', 'inputMatch');
  });

});
