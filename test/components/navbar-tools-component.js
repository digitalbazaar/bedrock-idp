/*
 * Copyright (c) 2016 Digital Bazaar, Inc. All rights reserved.
 */
 
define([], function() {

'use strict';

function register(module) {
  module.component('brIdpTestNavbarTools', {
    controller: Ctrl,
    templateUrl:
      requirejs.toUrl('bedrock-idp-test/navbar-tools-component.html')
  });
}

/* @ngInject */
function Ctrl(
  $location, $scope, brAlertService, brAuthnService, brIdentityService,
  brPasswordService, brRefreshService, brSessionService, config) {
  var self = this;
  self.display = {
    hovercard: false
  };
  self.loggedIn = false;
  self.session = null;
  self.identity = null;
  self.identityBaseUrl = null;
  self.authentication = {
    displayOrder: brAuthnService.displayOrder,
    methods: brAuthnService.methods
  };
  self.showModal = {
    resetPassword: false
  };

  $scope.$watch(function() {
    return brSessionService.session;
  }, function(newValue) {
    if(newValue) {
      init();
    }
  }, true);

  self.onRefresh = function() {
    brRefreshService.refresh();
  };

  self.onLogin = function(identity) {
    // NOTE: the identity object returned here may vary according to
    // authentication method
    brSessionService.get()
      .then(function(session) {
        $location.url(
          config.data.idp.identityBasePath + '/' + session.identity.sysSlug +
          '/dashboard');
        $scope.$apply();
      });
  };

  self.onLogout = function() {
    var err_ = null;
    brSessionService.logout().catch(function(err) {
      err_ = err;
    }).then(function() {
      if(err_) {
        brAlertService.add('error', err_, {scope: $scope});
        $scope.$apply();
        return;
      }
      $location.url('/');
      $scope.$apply();
    });
  };

  self.sendPasscode = function(options) {
    brPasswordService.sendPasscode({sysIdentifier: options.sysIdentifier});
  };

  function init() {
    if(!brSessionService.session.identity) {
      self.loggedIn = false;
      return;
    }
    self.loggedIn = true;
    self.session = brSessionService.session;
    self.identityBaseUrl =
      config.data.idp.identityBasePath + '/' + self.session.identity.sysSlug;
    self.identity = self.session.identity;
  }
}

return register;

});
