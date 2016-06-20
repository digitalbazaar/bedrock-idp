/*!
 * IDP components module.
 *
 * Copyright (c) 2012-2016 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define([
  'angular',
  './credentials/credentials',
  './dashboard/dashboard',
  './duplicate-checker/duplicate-checker',
  './identity/identity',
  './key/key',
  './login/login',
  './passcode/passcode',
  './settings/settings'
], function(angular) {

'use strict';

var modulePath = requirejs.toUrl('bedrock-idp/components/');
var credentialsBasePath =
  window.data['bedrock-angular-credential'].credentialsBasePath;
var keyBasePath = window.data['bedrock-angular-key'].basePath;

var module = angular.module(
  'bedrock-idp', Array.prototype.slice.call(arguments, 1).concat([
    'bedrock.identity']));

/* @ngInject */
module.config(function($routeProvider) {
  /* @ngInject */
  function redirectIfReferred(
    $location, $window, brSessionService, config) {
    // return early if session is present
    var wasReferred = ($location.search().referral === 'true');
    var redirectAuto = ($location.search().auto === 'true');
    return brSessionService.get()
      .then(function(session) {
        if(session.identity) {
          var referred = wasReferred ? '?referral=true' : '';
          if(redirectAuto) {
            $window.location = document.referrer;
            return;
          }
          $location.url(config.data.idp.identityBasePath + '/' +
            session.identity.sysSlug + '/dashboard' + referred);
        }
      });
  }

  var basePath = window.data.idp.identityBasePath;
  $routeProvider
    .when(basePath + '/:identity/credentials', {
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
    })
    .when(basePath + '/:identity/dashboard', {
      title: 'Dashboard',
      session: 'required',
      resolve: {redirectIfReferred: redirectIfReferred},
      templateUrl: requirejs.toUrl(
        'bedrock-idp/components/dashboard/dashboard.html')
    })
    .when(basePath, {
      title: 'Identity Credentials',
      templateUrl: requirejs.toUrl(
        'bedrock-idp/components/identity/identity-credentials.html')
    })
    .when(basePath + '/:identity', {
      title: 'Identity',
      template: '<br-identity-viewer br-identity="$resolve.identity">' +
        '<br-identity-additional-content>' +
        '<br-keys br-identity="$resolve.identity"></br-keys>' +
        '<br-credentials br-identity="$resolve.identity"></br-credentials>' +
        '</br-identity-additional-content>' +
        '</br-identity-viewer>',
      resolve: {
        identity: function($route, brIdentityService) {
          var identity = $route.current.params['identity'];
          return brIdentityService.collection.get(
            basePath + '/' + identity);
        }
      }
    })
    .when('/join', {
      title: 'Create Identity',
      resolve: {redirectIfReferred: redirectIfReferred},
      templateUrl: requirejs.toUrl(
        'bedrock-idp/components/identity/create-identity.html')
    })
    .when(basePath + '/:identity/keys', {
      title: 'Keys',
      templateUrl: requirejs.toUrl('bedrock-idp/components/key/keys.html')
    })
    .when(keyBasePath + '/:keyId', {
      title: 'Key',
      templateUrl: requirejs.toUrl('bedrock-angular-key/key.html')
    })
    // FIXME: deprecated endpoint support for old keys
    .when(basePath + '/:identity/keys/:keyId', {
      title: 'Key',
      templateUrl: requirejs.toUrl('bedrock-angular-key/key.html')
    })
    .when(basePath + '/:identity/settings', {
      title: 'Settings',
      session: {
        require: 'identity'
      },
      templateUrl: requirejs.toUrl(
        'bedrock-idp/components/settings/settings.html')
    });
});

/* @ngInject */
module.run(function(
  brAgreementService, brAuthnService, config) {
  brAgreementService.registerGroup('bedrock-idp.join');
  brAuthnService.displayOrder = ['authn-did', 'authn-password'];
  // FIXME: need a mechanism for display order on the tabs
  config.settings = config.settings || {};
  config.settings.panes = config.settings.panes || [];
  config.settings.panes.push(
    {
      templateUrl: modulePath + 'identity/identity-settings.html'
    },
    {
      templateUrl: modulePath + 'key/key-settings.html'
    }
  );
});

});
