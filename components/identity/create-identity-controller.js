/*!
 * Identity Creation Controller.
 *
 * Copyright (c) 2012-2014 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 * @author Manu Sporny
 */
define([
  'node-uuid'
], function(uuid) {

'use strict';

/* @ngInject */
function factory(
  $scope, $http, $window, brAlertService, config, ipCookie) {
  var self = this;
  self.data = config.data;
  self.loading = false;
  self.identity = {
    '@context': config.data.contextUrls.identity,
    type: 'Identity',
    label: '',
    email: '',
    sysPassword: '',
    sysPublic: [],
    sysSlug: ''
  };
  self.agreementChecked = false;
  self.display = {};
  self.display.form = true;
  self.display.information = false;
  self.identityToken = null;
  self.baseUri = config.data.baseUri;
  self.aioBaseUri = config.data.aioBaseUri;
  self.idpOwner = config.data.idpOwner;

  self.submit = function() {
    if(!self.agreementChecked) {
      return false;
    }
    brAlertService.clearFeedback();
    self.display.form = false;
    self.display.information = true;
    self.identityToken = uuid.v4();
    // FIXME: possibly bcrypt the password contained in self.identity
    var cookieOptions = {
      secure: true,
      expirationUnit: 'minutes',
      expires: 90
    };
    ipCookie(self.identityToken, self.identity, cookieOptions);
  };

  // FIXME: set all of these values based on config
  self.registerIdentity = function() {
    var options = {
      idp: self.idpOwner,
      registrationUrl: self.aioBaseUri + '/register',
      registrationCallback: self.baseUri + '/register/' + self.identityToken
    };
    return navigator.credentials.registerDid(options);
  };
}

return {CreateIdentityController: factory};

});
