/*!
 * IDP components module.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define([
  'angular',
  './dashboard/dashboard',
  './duplicate-checker/duplicate-checker',
  './identity/identity',
  './key/key',
  './login/login',
  './navbar/navbar',
  './passcode/passcode',
  './settings/settings'
], function(angular) {

'use strict';

var modulePath = requirejs.toUrl('bedrock-idp/components/');

var module = angular.module(
  'app.idp', Array.prototype.slice.call(arguments, 2));

/* @ngInject */
module.run(function($location, $rootScope, $route, $window, config, util) {
  config.site = config.site || {};
  config.site.navbar = {
    private: [
      {
        slug: 'dashboard',
        icon: 'fa fa-dashboard',
        label: 'Dashboard',
        pageTitle: 'Dashboard'
      },
      {
        slug: 'settings',
        icon: 'fa fa-wrench',
        label: 'Settings',
        pageTitle: 'Settings'
      }
    ],
    public: []
  };

  config.settings = config.settings || {};
  config.settings.panes = [
    {
      templateUrl: modulePath + 'identity/identity-settings.html'
    },
    {
      templateUrl: modulePath + 'key/key-settings.html'
    }
  ];

  // do immediate initial location change prior to loading any page content
  // in case a redirect is necessary
  locationChangeStart();

  $rootScope.$on('$locationChangeStart', locationChangeStart);

  function locationChangeStart() {
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
      $window.location.href = '/session/login';
      if(event) {
        event.preventDefault();
      } else {
        throw new Error('Session not found.');
      }
      return;
    }
  }
});

return module.name;

});
