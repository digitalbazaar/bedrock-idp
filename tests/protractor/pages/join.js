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
  elements.push(element(by.brModel('model.identity.email')));
  elements.push(element(by.brModel('model.identity.sysPassword')));
  elements.push(element(by.brModel('model.passphraseConfirmation')));
  elements.push(element(by.brModel('model.identity.label')));
  elements.push(element(by.model('model.agreementChecked')));
  elements.push(element(by.brModel('model.identity.sysSlug')));
  elements.push(element(by.buttonText('Next')));
  for(var i in elements) {
    elements[i].isPresent().should.eventually.be.true;
  }
};

api.createIdentity = function(options) {
  element(by.brModel('model.identity.email')).sendKeys(options.email);
  element(by.brModel('model.identity.sysPassword')).sendKeys(options.password);
  element(by.brModel('model.passphraseConfirmation'))
    .sendKeys(options.password);
  element(by.brModel('model.identity.label')).sendKeys(options.label);
  element(by.model('model.agreementChecked')).click();
  element(by.brModel('model.identity.sysSlug')).getAttribute('value')
    .then(function(slug) {
      var button = element(by.buttonText('Next'));
      bedrock.waitForAttribute(button, 'disabled', function(disabled) {
        return disabled !== 'true';
      });
      element(by.buttonText('Next')).click();
      // NOTE: sleep is required here
      browser.driver.sleep(500);
      browser.driver.getCurrentUrl()
        .should.eventually.contain('authorization.dev');
    });
  return api;
};

api.testField = function(modelName, testString, expectedErrorId) {
  element(by.brModel(modelName)).sendKeys(testString);
  element(by.brModel(modelName)).getAttribute('name')
    .then(function(elementName) {
      element(by.attribute('br-model', modelName))
        .element(by.attribute(
          'ng-show',
          ['regForm', elementName, '$error', expectedErrorId].join('.')))
        .isDisplayed().should.eventually.be.true;
    });
};

api.testFieldsMatch = function(
    modelNameA, modelNameB, testStringA, testStringB, expectedErrorId) {
  element(by.brModel(modelNameA)).sendKeys(testStringA);
  element(by.brModel(modelNameB)).sendKeys(testStringB);
  element(by.brModel(modelNameB)).getAttribute('name')
    .then(function(elementName) {
      element(by.attribute('br-model', modelNameB))
        .element(by.attribute(
          'ng-show',
          ['regForm', elementName, '$error', expectedErrorId].join('.')))
        .isDisplayed().should.eventually.be.true;
    });
  };
