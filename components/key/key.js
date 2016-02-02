/*!
 * Key module.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define([
  'angular',
  './identity-keys-controller'
], function(
  angular,
  identityKeysController
) {

'use strict';

var module = angular.module('bedrock-idp.key', []);

module.controller(identityKeysController);

return module.name;

});
