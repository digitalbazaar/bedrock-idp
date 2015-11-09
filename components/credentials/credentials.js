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
  './credential-task-controller'
], function(angular, credentialTaskController) {

'use strict';

var credentialsBasePath =
  window.data['bedrock-angular-credential'].credentialsBasePath;

var module = angular.module(
  'bedrock-idp.credentials',
  ['bedrock-credential-curator', 'bedrock.alert', 'bedrock.credential']);

module.controller(credentialTaskController);

/* @ngInject */
module.config(function($routeProvider) {
  $routeProvider
    .when(window.data.idp.identityBasePath + '/:identity/credentials', {
      title: 'Credentials',
      session: 'required',
      templateUrl: requirejs.toUrl(
        'bedrock-idp/components/credentials/credentials.html')
    })
    .when(credentialsBasePath, {
      title: 'Credentials',
      templateUrl: requirejs.toUrl(
        'bedrock-angular-credential/credential-viewer.html')
    })
    .when('/credential-task', {
      title: 'Credential Task',
      templateUrl: requirejs.toUrl(
        'bedrock-idp/components/credentials/credential-task.html')
    });
});

return module.name;

});
