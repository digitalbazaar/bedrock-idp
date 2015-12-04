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
function factory(
  $http, $location, $scope, $window, brAlertService, brSessionService, config) {
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
  self.passphraseConfirmation = '';

  self.submit = function() {
    if(!self.agreementChecked) {
      return false;
    }
    brAlertService.clearFeedback();
    self.loading = true;
    // TODO: also support local account ID creation as a configurable feature
    navigator.credentials.registerDid({
      idp: config.data.idp.owner.id,
      agentUrl: config.data['authorization-io'].registerUrl
    }).then(function(didDocument) {
      self.identity.id = didDocument.id;
      return Promise.resolve($http.post('/join', self.identity));
    }).then(function(response) {
      return brSessionService.get();
    }).then(function(session) {
      // FIXME: remove after config...session is no longer used to track session
      config.data.idp.session.identity = session.identity;
      // redirect to new dashboard
      // FIXME: Use location.url after services have been updated to
      // refresh after session state change
      // $location.url(config.data.idp.identityBasePath + '/' +
      //   session.identity.sysSlug + '/dashboard');
      $window.location =
        config.data.idp.identityBaseUri + '/' + session.identity.sysSlug +
        '/dashboard';
    }).catch(function(err) {
      brAlertService.add('error', err);
      self.loading = false;
    }).then(function() {
      $scope.$apply();
    });
  };
}

return {CreateIdentityController: factory};

});
