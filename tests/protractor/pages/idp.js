/*
 * Identity provider page API.
 *
 * Copyright (c) 2015 The Open Payments Foundation. All rights reserved.
 */
var bedrock = GLOBAL.bedrock;
var browser = GLOBAL.browser;
var by = GLOBAL.by;
var element = GLOBAL.element;
var expect = GLOBAL.expect;
var should = GLOBAL.should;
var api = {};
module.exports = api;

api.navigateToHomePage = function() {
  bedrock.get('/');
  bedrock.waitForAngular();
};

api.login = function(options) {
  // FIXME: change variable name from options.email because a slug is what
  // is required and an email would not work
  element(by.brModel('model.sysIdentifier')).sendKeys(options.email);
  element(by.brModel('model.password')).sendKeys(options.passphrase);
  element(by.buttonText('Sign In')).click();
  bedrock.waitForUrl('/i/' + options.email + '/dashboard');
  bedrock.waitForAngular();
  var credentialsLink = element(by.linkText('Credentials'));
  credentialsLink.isPresent().should.eventually.be.true;
};

api.loginExpectFail = function(options) {
  // FIXME: change variable name from options.email because a slug is what
  // is required and an email would not work
  element(by.brModel('model.sysIdentifier')).sendKeys(options.email);
  element(by.brModel('model.password')).sendKeys(options.passphrase);
  element(by.buttonText('Sign In')).click();
  bedrock.waitForAngular();
  var loginError = element(by.css('.br-alert-area-fixed-show'));
  loginError.isPresent().should.eventually.be.true;
};

api.viewCredentials = function(options) {
  // user will already be logged in
  var credentialsLink = element(by.linkText('Credentials'));
  credentialsLink.click();
  bedrock.waitForAngular();
  var links = [];
  links.push(element(by.linkText('Test 1: Work Email')));
  links.push(element(by.linkText('Test 2: Personal Email')));
  links.push(element(by.linkText('Test 3: Address')));
  links.push(element(by.linkText('Test 4: Age Over 21')));
  links.push(element(by.linkText('Test 5: Birth Date')));
  links.push(element(by.linkText('Test 6: Physical')));
  for(var link in links) {
    links[link].isPresent().should.eventually.be.true;
  }
  // browser.driver.sleep(600000);
};

api.logout = function() {
  // bedrock.get is not used here because it does not expect a redirect
  browser.driver.get(bedrock.baseUrl + '/session/logout');
  bedrock.waitForUrl('/');
};

api.submitCredentialQuery = function() {
  browser.executeScript(
    postJsonData, {'@context': 'https://w3id.org/identity/v1', email: ''},
    '/tasks/credentials/compose-identity');
  bedrock.waitForAngular();
  browser.driver.sleep(2500);
  element(by.buttonText('email')).isPresent().should.eventually.be.true;
};

api.submitCredentialStorage = function(credential) {
  browser.executeScript(postJsonData,
    credential, '/tasks/credentials/request-credential-storage');
  bedrock.waitForAngular();
  var storeButton = element(by.buttonText('Store Credential'));
  storeButton.isPresent().should.eventually.be.true;
  storeButton.click();
  // NOTE: sleep is required here
  browser.driver.sleep(500);
  browser.driver.getCurrentUrl()
    .should.eventually.contain('authorization.io/credential');
};

api.submitDuplicateCredentialStorage = function(credential) {
  browser.executeScript(postJsonData,
    credential, '/tasks/credentials/request-credential-storage');
  bedrock.waitForAngular();
  var storeButton = element(by.buttonText('Store Credential'));
  storeButton.isPresent().should.eventually.be.true;
  storeButton.click();
  bedrock.waitForAngular();
  var brError = element(by.css('.br-alert-area-fixed-show'));
  brError.isPresent().should.eventually.be.true;
};

/**
 * Perform a browser navigation via an HTTP POST of given data to a provided
 * URL. The data provided is converted to HTML-escaped JSON before posting.
 * The form encoded data will contain a single item called 'jsonPostData'
 * that can be processed on the server to get to the POSTed JSON data.
 *
 * @param data the JSON data to encode and post to the given URL.
 * @param url the URL to post the data to.
 */
function postJsonData(data, url) {

  var escapeHtml = (function() {
    var entityMap = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': '&quot;',
      "'": '&#39;',
      "/": '&#x2F;'
    };

    return function(str) {
      return String(str).replace(/[&<>"'\/]/g, function(s) {
        return entityMap[s];
      });
    };
  })();

  var form = document.createElement('form');
  form.style.visibility = 'hidden';
  var escapedData = escapeHtml(JSON.stringify(data));

  form.setAttribute('method', 'post');
  form.setAttribute('action', url);
  form.innerHTML =
    '<input type="hidden" name="jsonPostData" value="' +
    escapedData + '" />';

  // add to the DOM (for Firefox) and submit
  document.lastChild.appendChild(form);
  form.submit();

};
