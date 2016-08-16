/*
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 */
var bedrock = global.bedrock;
var protractor = global.protractor;
var describe = global.describe;
var uuid = require('uuid').v4;
var EC = protractor.ExpectedConditions;

var identity = bedrock.pages['bedrock-angular-identity'].identity;
var join = bedrock.pages['bedrock-idp-test'].join;
var settings = bedrock.pages['bedrock-angular-identity'].settings;
var navbar = bedrock.pages['bedrock-idp-test'].navbar;

describe('IdP Identity Profile', function() {
  var testIdentity = {};
  testIdentity.sysIdentifier = uuid().substr(0, 23);
  testIdentity.label = 'z' + testIdentity.sysIdentifier.replace(/-/g, '');
  testIdentity.email = testIdentity.sysIdentifier + '@bedrock.dev';
  testIdentity.password = uuid().substr(0, 23);

  var identityPage = '/i/' + testIdentity.label;

  before(function() {
    bedrock.get('/');
    join.join(testIdentity);
  });

  after(function() {
    navbar.logout(testIdentity.label);
  });

  it('should go to user\'s identity page', function() {
    bedrock.get(identityPage);
  });

  it('verify default fields', function() {
    identity.verify({
      label: {
        visible: true,
        value: testIdentity.label
      },
      email: {
        visible: true,
        value: testIdentity.email
      },
      url: {
        visible: false
      },
      description: {
        visible: false
      }
    });
  });

  it('log out', function() {
    navbar.logout(testIdentity.label);
  });

  it('user\'s fields should all be hidden', function() {
    bedrock.get(identityPage);
    identity.verify({
      label: {
        visible: false
      },
      email: {
        visible: false
      },
      url: {
        visible: false
      },
      description: {
        visible: false
      }
    });
  });

  it('log in', function() {
    navbar.login(testIdentity);
  });

  it('should add settings and change to public', function() {
    navbar.navigate('Settings');
    protractor.browser.wait(function() {
      return protractor.browser.isElementPresent(
        by.brModel(settings.LABEL_MODEL));
    }, 8000);
    settings.website('test.com');
    settings.selectedImageType({
      url: true
    });
    settings.imageUrl('http://example.com/image1');
    settings.description('lorem ipsum dolor');
    settings.privacyOption(settings.PRIVACY_ALL_PUBLIC);
    settings.submit();
  });

  it('all fields should be present on profile while logged in', function() {
    bedrock.get(identityPage);
    identity.verify({
      label: {
        visible: true,
        value: testIdentity.label
      },
      email: {
        visible: true,
        value: testIdentity.email
      },
      url: {
        visible: true,
        value: 'test.com'
      },
      description: {
        visible: true,
        value: 'lorem ipsum dolor'
      }
    });
  });

  it('log out', function() {
    navbar.logout(testIdentity.label);
  });

  it('fields should be present on profile while not logged in', function() {
    bedrock.get(identityPage);
    identity.verify({
      label: {
        visible: true,
        value: testIdentity.label
      },
      email: {
        visible: true,
        value: testIdentity.email
      },
      url: {
        visible: true,
        value: 'test.com'
      },
      description: {
        visible: true,
        value: 'lorem ipsum dolor'
      }
    });
  });

  it('log in', function() {
    navbar.login(testIdentity);
  });

  it('should change settings to public except email', function() {
    navbar.navigate('Settings');
    protractor.browser.wait(function() {
      return protractor.browser.isElementPresent(
        by.brModel(settings.LABEL_MODEL));
    }, 8000);
    settings.privacyOption(settings.PRIVACY_PUBLIC_EXCEPT_EMAIL);
    settings.submit();
  });

  it('all fields should be present on profile while logged in', function() {
    bedrock.get(identityPage);
    identity.verify({
      label: {
        visible: true,
        value: testIdentity.label
      },
      email: {
        visible: true,
        value: testIdentity.email
      },
      url: {
        visible: true,
        value: 'test.com'
      },
      description: {
        visible: true,
        value: 'lorem ipsum dolor'
      }
    });
  });

  it('log out', function() {
    navbar.logout(testIdentity.label);
  });

  it('fields should be present on profile except for email', function() {
    bedrock.get(identityPage);
    identity.verify({
      label: {
        visible: true,
        value: testIdentity.label
      },
      email: {
        visible: false
      },
      url: {
        visible: true,
        value: 'test.com'
      },
      description: {
        visible: true,
        value: 'lorem ipsum dolor'
      }
    });
  });

  it('log in', function() {
    navbar.login(testIdentity);
  });

  it('should reset to original fields', function() {
    navbar.navigate('Settings');
    protractor.browser.wait(function() {
      return protractor.browser.isElementPresent(
        by.brModel(settings.LABEL_MODEL));
    }, 8000);
    settings.website('');
    settings.description('');
    settings.imageUrl('');
    settings.privacyOption(settings.PRIVACY_NO_PUBLIC);
    settings.submit();
  });
});
