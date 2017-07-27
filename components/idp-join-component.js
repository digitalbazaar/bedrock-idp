/*!
 * IdP Login directive.
 *
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Matthew Collier
 */
export default {
  controller: Ctrl,
  templateUrl: 'bedrock-idp/components/idp-join-component.html'
};

/* @ngInject */
function Ctrl($location, $scope, brSessionService) {
  var self = this;
  self.loggedIn = false;
  $scope.$watch(function() {
    return brSessionService.session.identity;
  }, function(identity) {
    self.loggedIn = !!identity;
  });
  self.join = function() {
    $location.url('/join');
  };
}
