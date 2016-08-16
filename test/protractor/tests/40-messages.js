/*
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 */
/* globals expect */
var bedrock = global.bedrock;
var protractor = global.protractor;
var EC = protractor.ExpectedConditions;
var uuid = require('uuid').v4;

var join = bedrock.pages['bedrock-idp-test'].join;
var messageList = bedrock.pages['bedrock-angular-messages'].messageList;
var messagePage = bedrock.pages['bedrock-angular-messages'].message;
var navbar = bedrock.pages['bedrock-idp-test'].navbar;

describe('IdP Messages', function() {
  var testIdentity = {};
  testIdentity.sysIdentifier = uuid().substr(0, 23);
  testIdentity.label = 'z' + testIdentity.sysIdentifier.replace(/-/g, '');
  testIdentity.email = testIdentity.sysIdentifier + '@bedrock.dev';
  testIdentity.password = uuid().substr(0, 23);

  before(function() {
    bedrock.get('/');
    join.join(testIdentity);
  });

  after(function() {
    navbar.logout(testIdentity.label);
  });

  it('should navigate to messages page', function() {
    navbar.clickMessagesToolbar();
    messageList.waitForLoad();
  });

  it('should have 8 messages', function() {
    var messages = messageList.messages();
    expect(messages.count()).to.eventually.equal(8);
  });

  it('should archive 5 messages', function() {
    var messages = messageList.messages();
    for(var i = 0; i < 5; ++i) {
      messageList.selectMessage(messages.get(i));
    }
    messageList.archiveSelected();
    messages = messageList.messages();
    expect(messages.count()).to.eventually.equal(3);
  });

  it('archive tab should have 5 messages', function() {
    messageList.archiveTab(true);
    var messages = messageList.messages();
    expect(messages.count()).to.eventually.equal(5);
  });

  it('should click on first archived message', function() {
    var messages = messageList.messages();
    messageList.clickMessage(messages.first());
    messagePage.waitForLoad();
  });

  it('should delete the message', function() {
    browser.wait(
      EC.elementToBeClickable(element(by.buttonText('Delete'))), 3000);
    messagePage.delete();
    messageList.waitForLoad();
  });

  it('archive tab should be displayed, with 4 messages', function() {
    expect(messageList.archiveTab().getAttribute('class'))
      .to.eventually.be.equal('active');
    var messages = messageList.messages();
    expect(messages.count()).to.eventually.equal(4);
  });

  it('should navigate to inbox tab, with 3 messages', function() {
    messageList.inboxTab(true);
    var messages = messageList.messages();
    expect(messages.count()).to.eventually.equal(3);
  });

  it('should click on last message', function() {
    var messages = messageList.messages();
    messageList.clickMessage(messages.last());
    messagePage.waitForLoad();
  });

  it('should archive message', function() {
    messagePage.archive();
    messageList.waitForLoad();
  });

  it('inbox page should have 2 messages', function() {
    var messages = messageList.messages();
    expect(messages.count()).to.eventually.equal(2);
  });

  it('archive tab should have 5 messages', function() {
    messageList.archiveTab(true);
    var messages = messageList.messages();
    expect(messages.count()).to.eventually.equal(5);
  });

  it('refresh', function() {
    protractor.browser.refresh();
    messageList.waitForLoad();
    expect(messageList.inboxTab().getAttribute('class'))
      .to.eventually.be.equal('active');
  });

  it('inbox page should have 2 messages', function() {
    var messages = messageList.messages();
    expect(messages.count()).to.eventually.equal(2);
  });

  it('archive tab should have 5 messages', function() {
    messageList.archiveTab(true);
    var messages = messageList.messages();
    expect(messages.count()).to.eventually.equal(5);
  });

  it('should archive all inboxed messages', function() {
    messageList.inboxTab(true);
    var messages = messageList.messages();
    messages.each(function(m) {
      messageList.selectMessage(m);
    });
    messageList.archiveSelected();
    messages = messageList.messages();
    expect(messages.count()).to.eventually.equal(0);
  });

  it('should delete all archived messages', function() {
    messageList.archiveTab(true);
    var messages = messageList.messages();
    expect(messages.count()).to.eventually.equal(7);
    messages.each(function(m) {
      messageList.selectMessage(m);
    });
    messageList.deleteSelected();
    messages = messageList.messages();
    expect(messages.count()).to.eventually.equal(0);
  });
});
