/*!
 * Identity module.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define([
  'angular',
  './create-identity-controller',
  './passphrase-confirmation-directive',
  './identity-controller',
  './identity-service',
  './identity-credentials-controller',
  './identity-selector-directive',
  './identity-settings-controller',
  './add-identity-modal-directive',
  './credential-verify-service'
], function(
  angular, createIdentity, passphraseConfirmation, controller,
  service, identityCredentials, identitySelector, identitySettingsController,
  modalAddIdentity, credentialVerifyService) {

'use strict';

var module = angular.module('bedrock-idp.identity', []);

module.controller(createIdentity);
module.controller(controller);
module.controller(identityCredentials.controller);
module.controller(identitySettingsController);
module.service(service);
module.service(credentialVerifyService);
module.directive(passphraseConfirmation);
module.directive(identitySelector);
module.directive(modalAddIdentity);

return module.name;

});
