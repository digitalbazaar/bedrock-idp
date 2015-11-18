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

var module = angular.module(
  'bedrock-idp', Array.prototype.slice.call(arguments, 1));

/* @ngInject */
module.run(function($location, $rootScope, $route, $window, config, util) {
  config.site = config.site || {};
  config.site.navbar = config.site.navbar || {};
  config.site.navbar.templates = config.site.navbar.templates || [];
  // config.site.navbar.templates.push(requirejs.toUrl(
  //   'bedrock-idp/components/navbar/logout.html'));
  config.site.navbar.templates.push(requirejs.toUrl(
    'bedrock-idp/components/navbar/login.html'));
  config.site.navbar.templates.push(requirejs.toUrl(
    'bedrock-idp/components/navbar/hover-card.html'));
  config.settings = config.settings || {};
  config.settings.panes = [
    {
      templateUrl: modulePath + 'identity/identity-settings.html'
    },
    {
      templateUrl: modulePath + 'key/key-settings.html'
    }/*,
    {
      templateUrl: curatorModulePath + 'key/key-settings.html'
    }*/
  ];

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
