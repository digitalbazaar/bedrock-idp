/*!
 * Login module.
 *
 * Copyright (c) 2012-2016 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define([
  'angular',
  './idp-join-directive'
], function(
  angular,
  idpJoinDirective
) {

'use strict';

var module = angular.module('bedrock-idp.login', []);

module.directive(idpJoinDirective);

return module.name;

});
