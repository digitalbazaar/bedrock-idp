/*
 * Copyright (c) 2016 Digital Bazaar, Inc. All rights reserved.
 */
define([
  'angular',
  './navbar/navbar-controller'
], function(angular, navbarController) {

'use strict';

var module = angular.module('bedrock-idp-test', ['bedrock-idp']);

module.controller(navbarController);

/* @ngInject */
module.run(function(brAgreementService, config) {
  config.site = config.site || {};
  config.site.navbar = config.site.navbar || {};
  config.site.navbar.templates = config.site.navbar.templates || [];
  config.site.navbar.templates.push(requirejs.toUrl(
    'bedrock-idp-test/navbar/navbar-tools.html'));

  brAgreementService.groups['bedrock-idp.join'].displayOrder = ['brTos'];
  brAgreementService.register(
    'bedrock-idp.join', 'brTos', {
      title: 'Terms of Service',
      templateUrl: requirejs.toUrl('bedrock-idp-test/agreements/tos.html')
    });
});

return module.name;

});
