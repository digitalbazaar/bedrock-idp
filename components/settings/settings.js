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

});

return module.name;

});
