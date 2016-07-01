/*!
 * Identity module.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define([
  'angular',
  './create-identity-component',
  './passphrase-confirmation-directive',
  './identity-credentials-controller',
  './identity-selector-directive',
  './add-identity-modal-directive',
  './credential-verify-service'
], function(
  angular, createIdentityComponent, passphraseConfirmation,
  identityCredentials, identitySelector, identitySettingsController,
  modalAddIdentity, credentialVerifyService) {

'use strict';

var module = angular.module('bedrock-idp.identity', []);

createIdentityComponent(module);
module.controller(identityCredentials.controller);
module.controller(identitySettingsController);
module.service(credentialVerifyService);
module.directive(passphraseConfirmation);
module.directive(identitySelector);
module.directive(modalAddIdentity);

return module.name;

});
