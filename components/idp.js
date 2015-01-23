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

var module = angular.module(
  'app.idp', Array.prototype.slice.call(arguments, 1));

/* @ngInject */
module.run(function(config) {
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
      templateUrl: '/app/components/identity/identity-settings.html'
    },
    {
      templateUrl: '/app/components/key/key-settings.html'
    }
  ];
});

return module.name;

});
