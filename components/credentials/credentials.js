/*
 * Credentials module.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 * @author David I. Lehn
 */
define([
  'angular',
  './credential-manager-controller',
  './credentials-routes'
], function(angular, credentialManagerController, routes) {

'use strict';

var module = angular.module(
  'bedrock-idp.credentials', ['bedrock-credential-curator']);

/* @ngInject */
module.config(function($routeProvider) {
  angular.forEach(routes, function(route) {
    $routeProvider.when(route.path, route.options);
  });
});

module.controller(credentialManagerController);

return module.name;

});
