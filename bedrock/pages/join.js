var bedrock = GLOBAL.bedrock;

var api = {};
module.exports = api;

var by = GLOBAL.by;
var element = GLOBAL.element;

api.get = function() {
  bedrock.get('/join');
  return api;
};

api.createIdentity = function(options) {
  element(by.brModel('model.identity.email')).sendKeys(options.email);
  element(by.brModel('model.identity.sysPassword')).sendKeys(options.password);
  element(by.brModel('model.identity.label')).sendKeys(options.label);
  element(by.model('model.agreementChecked')).click();
  element(by.brModel('model.identity.sysSlug')).getAttribute('value')
    .then(function(slug) {
      var button = element(by.buttonText('Create Identity'));
      bedrock.waitForAttribute(button, 'disabled', function(disabled) {
        return disabled !== 'true';
      });
      element(by.buttonText('Create Identity')).click();
      bedrock.waitForUrl('/i/' + slug + '/dashboard');
      bedrock.waitForAngular();
    });
  return api;
};
