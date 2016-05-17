/*!
 * Identity Dashboard Controller.
 *
 * Copyright (c) 2012-2014 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 * @author David I. Lehn
 */
define([], function() {

'use strict';

/* @ngInject */
function factory($routeParams, brIdentityService, $window) {
  var self = this;
  self.identity = brIdentityService.identity;
  self.state = {};
  self.modals = {};

  // Setting ?referral=true will trigger a prompt for the user
  // to go back to the original page that linked to this join page.
  if($routeParams.referral === 'true' && document.referrer) {
    self.state.redirectLink = document.referrer;
    self.modals.shouldShowRedirectModal = true;
  }

  self.redirect = function() {
    if(self.state.redirectLink) {
      $window.location = self.state.redirectLink;
    }
  };
}

return {DashboardController: factory};

});
