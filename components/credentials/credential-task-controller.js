/*!
 * Credential Task Controller.
 *
 * Copyright (c) 2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 * @author Matt Collier
 */
define(['jsonld'], function(jsonld) {

'use strict';

/* @ngInject */
function factory($scope, brAlertService, brAuthenticationService) {
  var self = this;
  self.loading = true;
  self.display = {login: false};
  self.sysIdentifier = null;

  // TODO: guarantee only one promise will be pending at a time
  // (could be an issue if )
  var _resolve = null;

  self.createSession = function(identity) {
    // FIXME: validate identity format

    // inspect public key credential
    // TODO: `credential` should be an @set
    var publicKey = identity.credential['@graph'].claim.publicKey;
    if(jsonld.hasValue(publicKey, 'type', 'EphemeralCryptographicKey')) {
      // user needs to login using identifier/password
      self.display.login = true;
      self.sysIdentifier = identity.id;
      $scope.$apply();
      return new Promise(function(resolve) {
        _resolve = resolve;
      });
    }
    // auto-login w/DID
    return new Promise(function(resolve) {
      var sysIdentifier = identity.id;
      brAuthenticationService.login(identity).catch(function(err) {
        brAlertService.add('error', err);
        $scope.$apply();
      }).then(function(identity) {
        if(identity) {
          return resolve(identity);
        }
        // FIXME: strange case that DID-based login fails (document when
        // this may happen and implement better handling)
        // show login modal on DID-based failure
        self.display.login = true;
        self.sysIdentifier = sysIdentifier;
        $scope.$apply();
      });
    });
  };

  self.loggedIn = function(identity) {
    _resolve(identity);
  };
}

return {brCredentialTaskController: factory};

});
