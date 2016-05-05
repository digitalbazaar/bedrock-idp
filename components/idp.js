/*!
 * IDP components module.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
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
var curatorModulePath =
  requirejs.toUrl('bedrock-credential-curator/components/');
var credentialsBasePath =
  window.data['bedrock-angular-credential'].credentialsBasePath;
var keyBasePath = window.data['bedrock-angular-key'].basePath;

var module = angular.module(
  'bedrock-idp', Array.prototype.slice.call(arguments, 1).concat([
    'bedrock.resolver']));

/* @ngInject */
module.config(function($routeProvider, routeResolverProvider) {
  routeResolverProvider.add('bedrock-idp', 'session', resolve);

  /* @ngInject */
  function resolve($window, $route) {
    // return early if session is present
    var session = $route.current.locals.session;
    if(session && session.identity) {
      return;
    }

    // if route requires a session, redirect to login
    if($route.current.session === 'required') {
      // FIXME: use $location only once any SPA state issues are resolved
      $window.location.href = '/session/login';
      throw new Error('Not authenticated.');
    }
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
      templateUrl: requirejs.toUrl(
        'bedrock-idp/components/identity/identity.html')
    })
    .when('/join', {
      title: 'Create Identity',
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
      session: 'required',
      templateUrl: requirejs.toUrl(
        'bedrock-idp/components/settings/settings.html')
    });
});

/* @ngInject */
module.run(function(
  $location, $rootScope, $route, $window, brAgreementService, brAuthnService,
  config, util) {
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
    }/*,
    {
      templateUrl: curatorModulePath + 'key/key-settings.html'
    }*/
  );

  // FIXME: remove `locationChangeStart` (everything below; replaced with
  // route resolver above) once `queuedRequest` no longer supported

  // do immediate initial location change prior to loading any page content
  // in case a redirect is necessary
  locationChangeStart();

  $rootScope.$on('$locationChangeStart', locationChangeStart);

  function locationChangeStart(event) {
    if(config.data.queuedRequest) {
      // re-route to login if not already there
      if($location.path() !== '/session/login') {
        $location.url('/session/login');
      }
      return;
    }

    // session auth check
    var authenticated = !!config.data.idp.session.identity;
    if(authenticated) {
      return;
    }

    // if the current path is a route that requires authentication,
    // redirect to login
    var route = util.getRouteFromPath($route, $location.path());
    if(route && route.session === 'required') {
      if(event) {
        event.preventDefault();
      }
      $window.location.href = '/session/login';
    }
  }
});

return module.name;

});
