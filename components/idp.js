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

angular.module('bedrock.idp', Array.prototype.slice.call(arguments, 1));

});
