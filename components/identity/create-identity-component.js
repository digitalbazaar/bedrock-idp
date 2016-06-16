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

function register(module) {
  module.component('brCreateIdentity', {
    controller: Ctrl,
    templateUrl: requirejs.toUrl(
      'bedrock-idp/components/identity/create-identity-component.html')
  });
}

/* @ngInject */
function Ctrl(
  $http, $location, $scope, $window, $routeParams,
  brAlertService, brRefreshService, brSessionService, config) {
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
  self.agreementAccepted = false;
  self.passphraseConfirmation = '';

  // Setting ?referral=true will trigger a prompt to for the user
  // to go back to the page that linked here once they are done.
  var shouldRedirect = ($routeParams.referral === 'true');
  var shouldRedirectAuto = ($routeParams.auto === 'true');

  self.submit = function() {
    if(!self.agreementAccepted) {
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
      // FIXME: Investigate how service state updates when we don't
      // directly refresh the page after session state change
      // (we've had issues around session state not updating correctly
      // unless explicitly refreshing the app)
      brRefreshService.refresh();
      var referred = shouldRedirect ? '?referral=true' : '';
      if(referred && shouldRedirectAuto) {
        referred = referred + '&auto=true';
      }
      $location.url(config.data.idp.identityBasePath + '/' +
        session.identity.sysSlug + '/dashboard' + referred);
    }).catch(function(err) {
      brAlertService.add('error', err);
      self.loading = false;
    }).then(function() {
      $scope.$apply();
    });
  };
}

return register;

});
