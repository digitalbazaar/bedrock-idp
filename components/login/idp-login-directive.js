/*!
 * IdP Login directive.
 *
 * Copyright (c) 2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Matthew Collier
 */
define(['angular'], function(angular) {

'use strict';

/* @ngInject */
function factory(brAuthenticationService, brSessionService) {
  return {
    restrict: 'E',
    scope: {
      displayLogin: '='
    },
    templateUrl: requirejs.toUrl(
      'bedrock-idp/components/login/idp-login.html'),
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
    model.login = function() {
      scope.displayLogin = true;
    };
  }
}

return {brIdpLogin: factory};

});
