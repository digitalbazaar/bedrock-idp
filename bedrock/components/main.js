/*
 * Copyright (c) 2016 Digital Bazaar, Inc. All rights reserved.
 */
define([
  'angular',
  './navbar/navbar-controller'
], function(angular, navbarController) {

'use strict';

var module = angular.module('bedrock-idp-test', []);

module.controller(navbarController);

/* @ngInject */
module.run(function(config) {
  config.site = config.site || {};
  config.site.navbar = config.site.navbar || {};
  config.site.navbar.templates = config.site.navbar.templates || [];
  config.site.navbar.templates.push(requirejs.toUrl(
    'bedrock-idp-dev/navbar/navbar-tools.html'));
});

return module.name;

});
