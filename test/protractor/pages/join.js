/*
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 */
/* jshint -W030 */
var bedrock = global.bedrock;
var protractor = global.protractor;
var EC = protractor.ExpectedConditions;

var api = {};
module.exports = api;

api.get = function() {
  bedrock.get('/join');
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

api.createIdentityForm = function(options) {
  browser.wait(EC.visibilityOf(element(by.tagName('br-create-identity'))), 30000);
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

  var button = element(by.buttonText('Create Identity'));
  browser.wait(EC.elementToBeClickable(button), 3000);
  button.click();
};

api.registerDid = function(options) {
  // wait for AIO window to open
  browser.sleep(2000);
  isInternetExplorer().then(function(isIe) {
    if(isIe) {
      var iframe = by.tagName('iframe');
      var el = browser.driver.findElement(iframe);
      browser.switchTo().frame(el);
      return;
    }
    browser.wait(function() {
      return browser.getAllWindowHandles().then(function(handles) {
        // There should be two windows open now
        if(handles.length === 2) {
          return true;
        }
      });
    }, 30000);
    bedrock.selectWindow(1);
    browser.driver.getCurrentUrl().should.eventually.contain('authorization');
  });
  browser.wait(EC.visibilityOf(element(by.tagName('aio-register-did'))), 30000);
  element(by.brModel('$ctrl.passphrase')).sendKeys(options.password);
  element(by.brModel('$ctrl.passphraseConfirmation'))
    .sendKeys(options.password);
  var registerButton = element(by.buttonText('Register'));
  browser.wait(EC.elementToBeClickable(registerButton), 3000);
  registerButton.click();
  isInternetExplorer().then(function(isIe) {
    if(isIe) {
      browser.switchTo().defaultContent();
      // NOTE: unable to find any way of detecting when the iframe is removed
      browser.sleep(10000);
      return;
    }
    browser.wait(function() {
      return browser.getAllWindowHandles().then(function(handles) {
        // there should only be one window open after AIO is finished
        if(handles.length === 1) {
          return true;
        }
      });
    }, 45000);
    bedrock.selectWindow(0);
    browser.wait(EC.visibilityOf($('.dashboard')), 30000);
  });
};

api.join = function(options) {
  api.get();
  api.createIdentityForm(options);
  api.registerDid(options);
  browser.wait(
    EC.urlIs(bedrock.baseUrl + '/i/' + options.label + '/dashboard'), 30000);
  browser.refresh();
};

api.testField = function(modelName, testString, expectedErrorId) {
  var testElement = element(by.brModel(modelName));
  var navbar = element(by.tagName('br-navbar'));
  testElement
    .clear()
    .sendKeys(testString);
    // NOTE: Safari does not work with TAB, clicking on another element is the
    // general solution for bluring an input
    // .sendKeys(protractor.Key.TAB);
  navbar.click();
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
    var navbar = element(by.tagName('br-navbar'));
    element(by.brModel(modelNameA)).sendKeys(testStringA);
    var testElementB = element(by.brModel(modelNameB));
    testElementB.sendKeys(testStringB);
    navbar.click();
    testElementB.getAttribute('name')
      .then(function(elementName) {
        element(by.attribute('br-model', modelNameB))
          .element(by.attribute(
            'ng-show',
            ['$ctrl.regForm', elementName, '$error', expectedErrorId]
              .join('.')))
          .isDisplayed().should.eventually.be.true;
      });
  };

// set fields to matching values, then change modelNameA
api.testFieldsMatch2 =
  function(modelNameA, modelNameB, testStringA, testStringB, expectedErrorId) {
    var navbar = element(by.tagName('br-navbar'));
    var testElementA = element(by.brModel(modelNameA));
    testElementA
      .clear()
      .sendKeys(testStringA);
    var testElementB = element(by.brModel(modelNameB));
    testElementB
      .clear()
      .sendKeys(testStringA);
    navbar.click();
    testElementB.getAttribute('name')
      .then(function(elementName) {
        element(by.attribute('br-model', modelNameB))
          .element(by.attribute(
            'ng-show',
            ['$ctrl.regForm', elementName, '$error', expectedErrorId]
              .join('.')))
          .isDisplayed().should.eventually.be.false;
      });
    testElementA
      .clear()
      .sendKeys(testStringB);
    testElementB.getAttribute('name')
      .then(function(elementName) {
        element(by.attribute('br-model', modelNameB))
          .element(by.attribute(
            'ng-show',
            ['$ctrl.regForm', elementName, '$error', expectedErrorId]
              .join('.')))
          .isDisplayed().should.eventually.be.true;
      });
  };

function isInternetExplorer() {
  return browser.getCapabilities().then(function(b) {
    return b.get('browserName') === 'internet explorer';
  });
}
