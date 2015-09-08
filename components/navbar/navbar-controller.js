/*!
 * Navbar.
 *
 * Copyright (c) 2012-2014 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define([], function() {

'use strict';

/* @ngInject */
function factory($rootScope, brRefreshService, brIdentityService, config) {
  var self = this;
  self.session = config.data.idp.session;
  self.navbar = config.site.navbar;
  self.identity = brIdentityService.identity;
  if(self.identity) {
    self.localIdentityUri = config.data.idp.identityBaseUri + '/' +
      self.identity.sysSlug;
  }

  self.refreshData = function() {
    brRefreshService.refresh();
  };

  $rootScope.$on('showLoginModal', function() {
    self.showLogin = true;
  });
}

return {NavbarController: factory};

});
