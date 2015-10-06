/*!
 * Create Identity Controller.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 * @author Manu Sporny
 * @author Matt Collier
 */
define([], function() {

'use strict';

/* @ngInject */
function factory($http, $scope, $window, brAlertService, config) {
  var self = this;
  self.data = config.data;
  self.loading = false;
  self.identity = {
    '@context': config.data.contextUrls.identity,
    id: '',
    type: 'Identity',
    label: '',
    email: '',
    sysPassword: '',
    sysPublic: [],
    sysSlug: ''
  };
  self.agreementChecked = false;
  self.baseUri = config.data.baseUri;
  self.aioBaseUri = config.data['authorization-io'].baseUri;
  self.idpOwner = config.data.idp.owner.id;
  self.passphraseConfirmation = '';

  self.submit = function() {
    if(!self.agreementChecked) {
      return false;
    }
    brAlertService.clearFeedback();
    self.loading = true;
    // TODO: also support local account ID creation as a configurable feature
    navigator.credentials.registerDid({
      idp: self.idpOwner,
      agentUrl: self.aioBaseUri + '/register'
    }).then(function(didDocument) {
      self.identity.id = didDocument.id;
      return Promise.resolve($http.post('/join', self.identity));
    }).then(function(response) {
      // redirect to new dashboard
      $window.location = config.data.idp.identityBaseUri + '/' +
        response.data.sysSlug + '/dashboard';
    }).catch(function(err) {
      brAlertService.add('error', err);
      self.loading = false;
      $scope.$apply();
    });
  };
}

return {CreateIdentityController: factory};

});
