/*
 * Copyright (c) 2016 Digital Bazaar, Inc. All rights reserved.
 */
define([], function() {

'use strict';

/* @ngInject */
function factory(brSessionService, config) {
  var self = this;
  self.loggedIn = false;
  self.session = null;
  self.identityBaseUrl = null;

  if(brSessionService.session.identity) {
    self.loggedIn = true;
    self.session = brSessionService.session;
    self.identityUrl =
      config.data.idp.identityBasePath + '/' + self.session.identity.sysSlug;
  }
}

return {bridpNavbarController: factory};

});
