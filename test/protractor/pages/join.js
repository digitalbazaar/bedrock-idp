var bedrock = GLOBAL.bedrock;

var api = {};
module.exports = api;

var by = GLOBAL.by;
var element = GLOBAL.element;
var should = GLOBAL.should;
var expect = GLOBAL.expect;

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
      browser.driver.close();
      bedrock.selectWindow(0);
    });
  return api;
};

api.testField = function(modelName, testString, expectedErrorId) {
  var testElement = element(by.brModel(modelName));
  testElement.sendKeys(testString);
  testElement.sendKeys(protractor.Key.TAB);
  element(by.brModel(modelName)).getAttribute('name')
    .then(function(elementName) {
      element(by.attribute('br-model', modelName))
        .element(by.attribute(
          'ng-show',
          ['$ctrl.regForm', elementName, '$error', expectedErrorId].join('.')))
        .isDisplayed().should.eventually.be.true;
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
