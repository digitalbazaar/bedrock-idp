var bedrock = GLOBAL.bedrock;

var api = {};
module.exports = api;

var by = GLOBAL.by;
var element = GLOBAL.element;
var expect = GLOBAL.expect;

api.login = function(identifier, password) {
  bedrock.get('/');
  element.all(by.brModel('model.sysIdentifier')).each(function(e) {
    e.getTagName().then(function(tagName) {
      if(tagName === 'input') {
        e.sendKeys(identifier);
      }
    });
  });
  element(by.brModel('model.password')).sendKeys(password);
  element(by.buttonText('Sign In')).click();
  bedrock.waitForUrl(function(url) {
    return url.indexOf('dashboard') !== -1;
  });
  bedrock.waitForAngular();
  return api;
};

api.logout = function() {
  bedrock.get('/');
  element(by.trigger('model.hovercard')).click();
  element(by.linkText('Sign Out')).click();
  bedrock.get('/');
  expect(element(by.brModel('model.sysIdentifier')).isPresent())
    .to.eventually.be.true;
  return api;
};

api.refresh = function() {
  element(by.binding('model.identity.label')).click();
  element(by.linkText('Refresh')).click();
  return api;
};
