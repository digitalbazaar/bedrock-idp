/*
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 */
/* jshint -W030 */
var bedrock = global.bedrock;
var EC = protractor.ExpectedConditions;

var api = {};
module.exports = api;

var by = global.by;
var element = global.element;
var should = global.should;
var expect = global.expect;

api.get = function() {
  bedrock.get('/join');
  return api;
};

api.checkFields = function() {
  var elements = [];
  elements.push(element(by.brModel('$ctrl.identity.email')));
  elements.push(element(by.brModel('$ctrl.identity.sysPassword')));
  elements.push(element(by.brModel('$ctrl.passphraseConfirmation')));
  elements.push(element(by.brModel('$ctrl.identity.label')));
  elements.push(element(by.model('$ctrl.agreementAccepted')));
  elements.push(element(by.brModel('$ctrl.identity.sysSlug')));
  elements.push(element(by.buttonText('Create Identity')));
  for(var i in elements) {
    elements[i].isPresent().should.eventually.be.true;
  }
};

api.createIdentity = function(options) {
  element(by.brModel('$ctrl.identity.email')).sendKeys(options.email);
  element(by.brModel('$ctrl.identity.sysPassword')).sendKeys(options.password);
  element(by.brModel('$ctrl.passphraseConfirmation'))
    .sendKeys(options.password);
  element(by.brModel('$ctrl.identity.label')).sendKeys(options.label);

  element.all(by.repeater('agreement in $ctrl.displayOrder'))
    .then(function(agreements) {
      var agree = agreements[0].element(by.tagName('input'));
      agree.click();
    });
  element(by.brModel('$ctrl.identity.sysSlug')).getAttribute('value')
    .then(function(slug) {
      var button = element(by.buttonText('Create Identity'));
      bedrock.waitForAttribute(button, 'disabled', function(disabled) {
        return disabled !== 'true';
      });
      // element(by.buttonText('Next')).click();
      button.click();
      bedrock.selectWindow(1);
      browser.driver.getCurrentUrl()
        .should.eventually.contain('authorization.dev');
      if(!options.authio) {
        browser.driver.close();
        bedrock.selectWindow(0);
        return;
      }
      bedrock.waitForAngular();
      bedrock.waitForElement(element(by.brModel('$ctrl.email')));
      // Register with auth.io
      element(by.brModel('$ctrl.email')).sendKeys(options.email);
      element(by.brModel('$ctrl.passphrase')).sendKeys(options.password);
      element(by.brModel('$ctrl.passphraseConfirmation'))
        .sendKeys(options.password);
      element(by.buttonText('Register')).click();
      bedrock.waitForPopupClose(1);
      bedrock.selectWindow(0);
    });
  return api;
};

api.testField = function(modelName, testString, expectedErrorId) {
  var testElement = element(by.brModel(modelName));
  testElement
    .clear()
    .sendKeys(testString)
    .sendKeys(protractor.Key.TAB);
  element(by.brModel(modelName)).getAttribute('name')
    .then(function(elementName) {
      var validationError = element(by.attribute('br-model', modelName))
        .element(by.attribute(
          'ng-show',
          ['$ctrl.regForm', elementName, '$error', expectedErrorId].join('.')));
      browser.wait(EC.visibilityOf(validationError), 3000);
      validationError.isDisplayed().should.eventually.be.true;
    });
};

api.testFieldsMatch =
  function(modelNameA, modelNameB, testStringA, testStringB, expectedErrorId) {
    element(by.brModel(modelNameA)).sendKeys(testStringA);
    var testElementB = element(by.brModel(modelNameB));
    testElementB.sendKeys(testStringB);
    testElementB.sendKeys(protractor.Key.TAB);
    element(by.brModel(modelNameB)).getAttribute('name')
      .then(function(elementName) {
        element(by.attribute('br-model', modelNameB))
          .element(by.attribute(
            'ng-show',
            ['$ctrl.regForm', elementName, '$error', expectedErrorId]
              .join('.')))
          .isDisplayed().should.eventually.be.true;
      });
  };
