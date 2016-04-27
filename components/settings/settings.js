/*!
 * Settings module.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define([
  'angular',
  './settings-controller'
], function(angular, settings) {

'use strict';

var module = angular.module('bedrock-idp.settings', []);

module.controller(settings);

module.run(function(brNavbarService, brSessionService, config) {
  brNavbarService.registerMenu('brSettings', {
    slug: '/settings',
    icon: 'fa fa-wrench',
    label: 'Settings',
    pageTitle: 'Settings',
    visible: false,
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
