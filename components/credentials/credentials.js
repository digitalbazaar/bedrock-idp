/*
 * Credentials module.
 *
 * Copyright (c) 2012-2016 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 * @author David I. Lehn
 */
define([
  'angular',
  './credentials-controller',
  './credential-task-controller'
], function(angular, credentialsController, credentialTaskController) {

'use strict';

var module = angular.module(
  'bedrock-idp.credentials',
  ['bedrock.alert', 'bedrock.credential', 'bedrock-credential-curator']);

module.controller(credentialsController);
module.controller(credentialTaskController);

module.run(function(brNavbarService, brSessionService, config) {
  brNavbarService.menus.push({
    slug: '/credentials',
    icon: 'fa fa-trophy',
    label: 'Credentials',
    pageTitle: 'Credentials',
    visible: false,
    weight: 20,
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
