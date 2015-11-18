/*!
 * Settings module.
 *
 * Copyright (c) 2012-2014 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define([
  'angular',
  './settings-controller',
  './settings-routes'
], function(angular, settings, routes) {

'use strict';

var module = angular.module('bedrock-idp.settings', []);

module.controller(settings);

/* @ngInject */
module.config(function($routeProvider) {
  angular.forEach(routes, function(route) {
    $routeProvider.when(route.path, route.options);
  });
});

module.run(function(brNavbarService, brSessionService, config) {
  brNavbarService.menus.push({
    slug: '/settings',
    icon: 'fa fa-wrench',
    label: 'Settings',
    pageTitle: 'Settings',
    visible: 'false',
    weight: 30,
    init: function(scope, menu) {
      scope.$watch(function() {
          return brSessionService.session;
        }, function(session) {
          if(session && session.identity) {
            menu.visible = true;
            menu.url = config.data.idp.identityBaseUri + '/' +
              session.identity.sysSlug + menu.slug;
          } else {
            menu.visible = false;
          }
        }, true);
      brSessionService.get();
    }
  });
});

return module.name;

});
