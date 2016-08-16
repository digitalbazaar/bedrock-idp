/*
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 */
var bedrock = global.bedrock;

var api = {};
module.exports = api;

var protractor = global.protractor;
var EC = protractor.ExpectedConditions;

var navbar = element(by.tagName('br-navbar'));

api.adminTools = function() {
  return navbar.element(by.linkText('Admin Tools'));
};

api.login = function(options) {
  // Click on navbar login
  var navSignIn = element(by.buttonText('Sign In'));
  browser.wait(EC.elementToBeClickable(navSignIn));
  navSignIn.click();
  var authnPassword = element(by.tagName('br-authn-password'));
  browser.wait(EC.visibilityOf(authnPassword));
  authnPassword.element(by.model('$ctrl.sysIdentifier'))
    .sendKeys(options.label);
  authnPassword.element(by.model('$ctrl.password'))
    .sendKeys(options.password);
  var signInButton = authnPassword.element(by.partialButtonText('Sign In'));
  browser.wait(EC.elementToBeClickable(signInButton));
  signInButton.click();
  if(options.checkAgreements) {
    bedrock.waitForUrl('/agreement')
      .then(function() {
        // refresh required here
        browser.refresh();
        return element.all(by.repeater('agreement in $ctrl.displayOrder'));
      })
      .then(function(agreements) {
        var agree = agreements[0].element(by.tagName('input'));
        agree.click();
        element(by.buttonText('Confirm')).click();
      })
      .catch(function(err) {
        // no agreements
      });
  }
  bedrock.waitForUrl('/i/' + options.label + '/dashboard');
  // NOTE: 20160731 refresh required here for some browsers due to
  // synchronization issues after login redirect.
  browser.refresh();
  browser.wait(EC.visibilityOf($('div .dashboard')), 3000);
};

api.logout = function(shortName) {
  element(by.linkText(shortName)).click();
  element(by.attribute('ng-click', '$ctrl.onLogout()')).click();
  bedrock.waitForUrl('/');
};

api.navigate = function(pageTitle) {
  element(by.attribute('br-slot', 'br-navbar-menu'))
    .element(by.linkText(pageTitle))
    .click();
};

api.clickMessagesToolbar = function() {
  element(by.tagName('br-messages-notification'))
    .element(by.attribute('ng-click', '$ctrl.viewMessages()'))
    .click();
};

api.refresh = function() {
  element(by.binding('model.identity.label')).click();
  element(by.linkText('Refresh')).click();
  return api;
};
