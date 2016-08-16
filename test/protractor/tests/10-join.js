/*
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 */
/* jshint multistr: true */
var bedrock = global.bedrock;
var uuid = require('uuid').v4;
var protractor = global.protractor;
var EC = protractor.ExpectedConditions;

var join = bedrock.pages['bedrock-idp-test'].join;
var navbar = bedrock.pages['bedrock-idp-test'].navbar;

describe('IdP join form', function() {
  var identity = {};
  identity.sysIdentifier = uuid().substr(0, 23);
  identity.label = 'z' + identity.sysIdentifier.replace(/-/g, '');
  identity.email = identity.sysIdentifier + '@bedrock.dev';
  identity.password = uuid().substr(0, 23);
  var threeCharacters = 'abc';
  var fortyCharacters = 'yA2NdBthMcnTqGYz3Eqe9uNHxM8u00TaooiuhIM1';
  var seventyCharacters =
    'yA2NdBthMcnTqGYz3Eqe9uNHxM8u00TaooiuhIMyA2NdBthMcnTqGYz3Eqe9uNHxM8u012';
  var oneHundredFiveCharacters =
    'yA2NdBthMcnTqGYz3Eqe9uNHxM8u00TaooiuhIMyA2NdBthMcnTqGYz3Eqe9uNHxM8u012\
    yA2NdBthMcnTqGYz3Eqe9uNHttwewt';

  describe('form submission', function() {
    before(function() {
      join.get();
    });
    after(function() {
      navbar.logout(identity.label);
    });
    it('should accept a valid form', function() {
      join.createIdentityForm(identity);
      join.registerDid(identity);
      browser.wait(EC.urlIs(
        bedrock.baseUrl + '/i/' + identity.label + '/dashboard'), 30000);
      var dashboard = $('.dashboard');
      browser.wait(EC.visibilityOf(dashboard), 30000);
      dashboard.isDisplayed().should.eventually.be.true;
    });
  }); // end form submission

  describe.skip('multiple create identity iterations', function() {
    before(function() {
      join.get();
    });
    it('should accept a valid form', function() {
      for(var i = 0; i < 10; i++) {
        identity.sysIdentifier = uuid().substr(0, 23);
        identity.label = 'z' + identity.sysIdentifier.replace(/-/g, '');
        identity.email = identity.sysIdentifier + '@bedrock.dev';
        identity.password = uuid().substr(0, 23);
        join.createIdentityPart1(identity);
        browser.refresh();
      }
    });
  }); // end multiple create identity iterations

  describe('form validation', function() {
    before(function() {
      join.get();
    });

    it('should contain the proper fields', function() {
      join.checkFields();
    });

    describe('email validation', function() {
      it('should warn on a missing email', function() {
        join.testField(
          '$ctrl.identity.email', '', 'required');
      });
      it('should warn on a short email', function() {
        join.testField(
          '$ctrl.identity.email', threeCharacters, 'minlength');
      });
      it('should warn on a long email', function() {
        join.testField(
          '$ctrl.identity.email', oneHundredFiveCharacters + '@example.com',
          'maxlength');
      });
      it('should war on an invalid email address', function() {
        join.testField(
          '$ctrl.identity.email', 'foo$bar.com', 'email');
      });
    }); // end email validation

    describe('password validation', function() {
      it('should warn on a missing password', function() {
        join.testField(
          '$ctrl.identity.sysPassword', '', 'required');
      });
      it('should warn on a short password', function() {
        join.testField(
          '$ctrl.identity.sysPassword', threeCharacters, 'minlength');
      });
      it('should warn on a long password', function() {
        join.testField(
          '$ctrl.identity.sysPassword', fortyCharacters, 'maxlength');
      });
      it('should warn if password confirmation does not match', function() {
        join.testFieldsMatch(
          '$ctrl.identity.sysPassword', '$ctrl.passphraseConfirmation',
          'goodPhraseA', 'nonMatchingPhraseB', 'inputMatch');
      });
    }); // end password validation

    describe('full name validation', function() {
      it('should warn on missing name', function() {
        join.testField(
          '$ctrl.identity.label', '', 'required');
      });
      it('should warn on short name', function() {
        join.testField(
          '$ctrl.identity.label', threeCharacters, 'minlength');
      });
      it('should warn on long name', function() {
        join.testField(
          '$ctrl.identity.label', seventyCharacters, 'maxlength');
      });
    }); // end full name validation

    describe('short name validation', function() {
      it('should warn on missing name', function() {
        join.testField(
          '$ctrl.identity.sysSlug', '', 'required');
      });
      it('should warn on short name', function() {
        join.testField(
          '$ctrl.identity.sysSlug', 'x', 'minlength');
      });
      it('should warn on long name', function() {
        join.testField(
          '$ctrl.identity.sysSlug', fortyCharacters, 'maxlength');
      });
    }); // end slug validation
  }); // end form validation

});
