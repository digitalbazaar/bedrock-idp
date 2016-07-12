/*
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 */
/* jshint multistr: true */
var bedrock = global.bedrock;
var expect = global.expect;
var should = global.should;
var describe = global.describe;
var it = global.it;
var uuid = require('uuid');

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
  var fortyCharacters = 'yA2NdBthMcnTqGYz3Eqe9uNHxM8u00TaooiuhIM1';
  var seventyCharacters =
    'yA2NdBthMcnTqGYz3Eqe9uNHxM8u00TaooiuhIMyA2NdBthMcnTqGYz3Eqe9uNHxM8u012';
  var oneHundredFiveCharacters =
    'yA2NdBthMcnTqGYz3Eqe9uNHxM8u00TaooiuhIMyA2NdBthMcnTqGYz3Eqe9uNHxM8u012\
    yA2NdBthMcnTqGYz3Eqe9uNHttwewt';

  describe('form submission', function() {
    before(function() {
      bedrock.pages.join.get();
    });
    it('should accept a valid form', function() {
      bedrock.pages.join.createIdentity(identity);
    });
  }); // end form submission

  describe('form validation', function() {
    before(function() {
      bedrock.pages.join.get();
    });

    it('should contain the proper fields', function() {
      bedrock.pages.join.checkFields();
    });

    describe('email validation', function() {
      it('should warn on a missing email', function() {
        bedrock.pages.join.testField(
          '$ctrl.identity.email', '', 'required');
      });
      it('should warn on a short email', function() {
        bedrock.pages.join.testField(
          '$ctrl.identity.email', threeCharacters, 'minlength');
      });
      it('should warn on a long password', function() {
        bedrock.pages.join.testField(
          '$ctrl.identity.email', oneHundredFiveCharacters, 'maxlength');
      });
      it('should war on an invalid email address', function() {
        bedrock.pages.join.testField(
          '$ctrl.identity.email', 'foo$bar.com', 'email');
      });
    }); // end email validation

    describe('password validation', function() {
      it('should warn on a missing password', function() {
        bedrock.pages.join.testField(
          '$ctrl.identity.sysPassword', '', 'required');
      });
      it('should warn on a short password', function() {
        bedrock.pages.join.testField(
          '$ctrl.identity.sysPassword', threeCharacters, 'minlength');
      });
      it('should warn on a long password', function() {
        bedrock.pages.join.testField(
          '$ctrl.identity.sysPassword', fortyCharacters, 'maxlength');
      });
      it('should warn if password confirmation does not match', function() {
        bedrock.pages.join.testFieldsMatch(
          '$ctrl.identity.sysPassword', '$ctrl.passphraseConfirmation',
          'goodPhraseA', 'nonMatchingPhraseB', 'inputMatch');
      });
    }); // end password validation

    describe('full name validation', function() {
      it('should warn on missing name', function() {
        bedrock.pages.join.testField(
          '$ctrl.identity.label', '', 'required');
      });
      it('should warn on short name', function() {
        bedrock.pages.join.testField(
          '$ctrl.identity.label', threeCharacters, 'minlength');
      });
      it('should warn on long name', function() {
        bedrock.pages.join.testField(
          '$ctrl.identity.label', seventyCharacters, 'maxlength');
      });
    }); // end full name validation

    describe('slug validation', function() {
      it('should warn on missing name', function() {
        bedrock.pages.join.testField(
          '$ctrl.identity.sysSlug', '', 'required');
      });
      it('should warn on short name', function() {
        bedrock.pages.join.testField(
          '$ctrl.identity.sysSlug', 'x', 'minlength');
      });
      it('should warn on long name', function() {
        bedrock.pages.join.testField(
          '$ctrl.identity.sysSlug', fortyCharacters, 'maxlength');
      });
    }); // end slug validation
  }); // end form validation

});
