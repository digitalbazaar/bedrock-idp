/*
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 */
var bedrock = GLOBAL.bedrock;

var api = {};
module.exports = api;

var by = GLOBAL.by;
var element = GLOBAL.element;
var expect = GLOBAL.expect;
var should = GLOBAL.should;

api.login = function(options) {
  var slug = options.slug || options.sysIdentifier;
  element(by.brModel('model.sysIdentifier')).sendKeys(options.sysIdentifier);
  element(by.brModel('model.password')).sendKeys(options.passphrase);
  element(by.buttonText('Sign In')).click();
  bedrock.waitForUrl('/i/' + slug + '/dashboard');
  bedrock.waitForAngular();
  var credentialsLink = element(by.linkText('Credentials'));
  credentialsLink.isPresent().should.eventually.be.true;
  return api;
};

api.loginExpectFail = function(options) {
  element(by.brModel('model.sysIdentifier')).sendKeys(options.sysIdentifier);
  element(by.brModel('model.password')).sendKeys(options.passphrase);
  element(by.buttonText('Sign In')).click();
  bedrock.waitForAngular();
  var loginError = element(by.css('.br-alert-area-fixed-show'));
  loginError.isPresent().should.eventually.be.true;
};

api.logout = function() {
  bedrock.get('/');
  element(by.trigger('model.hovercard')).click();
  bedrock.waitForModalTransition();
  element(by.linkText('Sign Out')).click();
  browser.sleep(500);
  bedrock.get('/');
  element(by.brModel('model.sysIdentifier')).isPresent()
    .should.eventually.be.true;
  return api;
};

api.refresh = function() {
  element(by.binding('model.identity.label')).click();
  element(by.linkText('Refresh')).click();
  return api;
};
