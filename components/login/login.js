/*!
 * Login module.
 *
 * Copyright (c) 2012-2016 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define([
  'angular',
  './login-controller',
  './idp-join-directive'
], function(
  angular,
  loginController,
  idpJoinDirective
) {

'use strict';

var module = angular.module('bedrock-idp.login', []);

module.controller(loginController);
module.directive(idpJoinDirective);

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
