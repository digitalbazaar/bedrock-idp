/*!
 * Passcode module.
 *
 * Copyright (c) 2012-2014 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define([
  'angular',
  './passcode-controller'
], function(angular, controller) {

'use strict';

var module = angular.module('bedrock.passcode', []);

module.controller(controller);

return module.name;

});
