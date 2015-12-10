/*!
 * Login module.
 *
 * Copyright (c) 2012-2014 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define([
  'angular',
  './login-controller',
  './login-modal-directive',
  './idp-login-directive',
  './identity-hovercard-directive',
  './idp-join-directive'
], function(
  angular,
  loginController,
  loginModalDirective,
  idpLoginDirective,
  identityHovercardDirective,
  idpJoinDirective
) {

'use strict';

var module = angular.module('bedrock-idp.login', []);

module.controller(loginController);
module.directive(loginModalDirective);
module.directive(idpLoginDirective);
module.directive(idpJoinDirective);
module.directive(identityHovercardDirective);

/* @ngInject */
module.config(function($routeProvider) {
  $routeProvider
    .when('/session/login', {
      vars: {
        title: 'Login',
        // avoid login entry form on login page
        hideNavbarLogin: true
      },
      templateUrl: requirejs.toUrl('bedrock-idp/components/login/login.html')
    });
});

return module.name;

});
