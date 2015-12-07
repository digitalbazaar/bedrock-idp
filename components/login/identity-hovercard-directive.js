/*!
 * Copyright (c) 2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Matthew Collier
 */
define(['angular'], function(angular) {

'use strict';

/* @ngInject */
function factory(brRefreshService, brSessionService) {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: requirejs.toUrl(
      'bedrock-idp/components/login/identity-hovercard.html'),
    link: Link
  };

  function Link(scope, elem, attrs) {
    var model = scope.model = {};
    model.loggedIn = false;
    model.identity = {};
    scope.$watch(function() {
      return brSessionService.session.identity;
    }, function(identity) {
      model.loggedIn = !!identity;
      model.identity = identity;
    });
    model.refreshData = function() {
      brRefreshService.refresh();
    };
    // FIXME: refresh session data automatically elsewhere?
    brSessionService.get().catch(function() {}).then(function() {
      scope.$apply();
    });
  }
}

return {brIdentityHovercard: factory};

});
