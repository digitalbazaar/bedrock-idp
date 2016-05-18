/*!
 * IdP Login directive.
 *
 * Copyright (c) 2015-2016 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Matthew Collier
 */
define(['angular'], function(angular) {

'use strict';

/* @ngInject */
function factory(brAuthenticationService, brSessionService, $location) {
  return {
    restrict: 'E',
    scope: {},
    templateUrl: requirejs.toUrl(
      'bedrock-idp/components/login/idp-join.html'),
    link: Link
  };

  function Link(scope, elem, attrs) {
    var model = scope.model = {};
    model.loggedIn = false;
    scope.$watch(function() {
      return brSessionService.session.identity;
    }, function(identity) {
      model.loggedIn = !!identity;
    });
    model.join = function() {
      $location.url('/join');
    };
  }
}

return {brIdpJoin: factory};

});
