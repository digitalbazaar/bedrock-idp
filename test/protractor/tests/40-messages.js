/*
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 */
var bedrock = global.bedrock;
var protractor = global.protractor;
var EC = protractor.ExpectedConditions;
var uuid = require('uuid').v4;

var app = bedrock.pages['bedrock-angular-messages'].app;
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

  describe('br-messages-notification', () => {
    it('should indicate 8 messages', () => {
      app.messageNotification().getText().should.eventually.equal('Messages 8');
    });
  });

  describe('Messages List', () => {
    it('should navigate to messages page', function() {
      app.messageNotification().click();
      messageList.waitForLoad();
    });

    it('should have 8 messages', function() {
      var messages = messageList.messages();
      messages.count().should.eventually.equal(8);
    });

    it('should archive 5 messages', function() {
      var messages = messageList.messages();
      for(var i = 0; i < 5; ++i) {
        messageList.selectMessage(messages.get(i));
      }
      messageList.archiveSelected();
      messages = messageList.messages();
      messages.count().should.eventually.equal(3);
    });

    it('should navigate newer and older messages', () => {
      var messages = messageList.messages();
      messageList.clickMessage(messages.first());
      messagePage.waitForLoad();
      $('br-message-viewer').getText()
        .should.eventually.contain('(6) An important message for you.');
      messagePage.older().isPresent().should.eventually.be.true;
      messagePage.newer().isPresent().should.eventually.be.false;
      messagePage.older().click();
      messagePage.waitForLoad();
      $('br-message-viewer').getText()
        .should.eventually.contain('(7) An important message for you.');
      messagePage.older().isPresent().should.eventually.be.true;
      messagePage.newer().isPresent().should.eventually.be.true;
      messagePage.older().click();
      messagePage.waitForLoad();
      $('br-message-viewer').getText()
        .should.eventually.contain('(8) An important message for you.');
      messagePage.older().isPresent().should.eventually.be.false;
      messagePage.newer().isPresent().should.eventually.be.true;
      messagePage.newer().click();
      messagePage.waitForLoad();
      $('br-message-viewer').getText()
        .should.eventually.contain('(7) An important message for you.');
      messagePage.older().isPresent().should.eventually.be.true;
      messagePage.newer().isPresent().should.eventually.be.true;
      messagePage.newer().click();
      messagePage.waitForLoad();
      $('br-message-viewer').getText()
        .should.eventually.contain('(6) An important message for you.');
      messagePage.older().isPresent().should.eventually.be.true;
      messagePage.newer().isPresent().should.eventually.be.false;
      messagePage.returnButton().click();
    });

    it('archive tab should have 5 messages', function() {
      messageList.archiveTab(true);
      var messages = messageList.messages();
      messages.count().should.eventually.equal(5);
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
      messageList.archiveTab().getAttribute('class')
        .should.eventually.equal('active');
      var messages = messageList.messages();
      messages.count().should.eventually.equal(4);
    });

    it('should navigate to inbox tab, with 3 messages', function() {
      messageList.inboxTab(true);
      var messages = messageList.messages();
      messages.count().should.eventually.equal(3);
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
      messages.count().should.eventually.equal(2);
    });

    it('archive tab should have 5 messages', function() {
      messageList.archiveTab(true);
      var messages = messageList.messages();
      messages.count().should.eventually.equal(5);
    });

    it('refresh', function() {
      protractor.browser.refresh();
      messageList.waitForLoad();
      messageList.inboxTab().getAttribute('class')
        .should.eventually.equal('active');
    });

    it('inbox page should have 2 messages', function() {
      var messages = messageList.messages();
      messages.count().should.eventually.equal(2);
    });

    it('archive tab should have 5 messages', function() {
      messageList.archiveTab(true);
      var messages = messageList.messages();
      messages.count().should.eventually.equal(5);
    });

    it('should archive all inboxed messages', function() {
      messageList.inboxTab(true);
      var messages = messageList.messages();
      messages.each(function(m) {
        messageList.selectMessage(m);
      });
      messageList.archiveSelected();
      messages = messageList.messages();
      messages.count().should.eventually.equal(0);
    });

    it('should delete all archived messages', function() {
      messageList.archiveTab(true);
      var messages = messageList.messages();
      messages.count().should.eventually.equal(7);
      messages.each(function(m) {
        messageList.selectMessage(m);
      });
      messageList.deleteSelected();
      messages = messageList.messages();
      messages.count().should.eventually.equal(0);
    });

    it('refresh', function() {
      protractor.browser.refresh();
      messageList.waitForLoad();
      messageList.inboxTab().getAttribute('class')
        .should.eventually.equal('active');
    });

    it('inbox page should have 0 messages', function() {
      var messages = messageList.messages();
      messages.count().should.eventually.equal(0);
    });

    it('archive tab should have 0 messages', function() {
      messageList.archiveTab(true);
      var messages = messageList.messages();
      messages.count().should.eventually.equal(0);
    });
  }); // end message list
});
