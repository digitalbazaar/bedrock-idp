/*!
 * Dashboard module.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define([
  'angular',
  './dashboard-controller'
], function(angular, controller) {

'use strict';

var module = angular.module('bedrock-idp.dashboard', []);

module.controller(controller);

/* @ngInject */
module.run(function(brNavbarService, brSessionService, config) {
  brNavbarService.menus.push({
    slug: '/dashboard',
    icon: 'fa fa-dashboard',
    label: 'Dashboard',
    pageTitle: 'Dashboard',
    visible: false,
    weight: 10,
    init: function(scope) {
      var menu = this;
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
      // TODO: should be done elsewhere once
      // get latest session information
      brSessionService.get();
    }
  });
});

return module.name;

});
