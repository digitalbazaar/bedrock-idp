/*!
 * Identity Dashboard Controller.
 *
 * Copyright (c) 2012-2017 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 * @author David I. Lehn
 */
export default {
  controller: Ctrl,
  templateUrl: 'bedrock-idp/components/dashboard-component.html'
};

/* @ngInject */
function Ctrl($routeParams, brSessionService, $window) {
  var self = this;
  self.identity = brSessionService.session.identity;
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
