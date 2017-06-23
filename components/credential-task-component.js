/*!
 * Credential Task Controller.
 *
 * Copyright (c) 2015-2017 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 * @author Matt Collier
 */
import jsonld from 'jsonld';

export default {
  controller: Ctrl,
  templateUrl: 'bedrock-idp/components/credential-task-component.html'
};

/* @ngInject */
function Ctrl($scope, brAlertService, brAuthenticationService) {
  var self = this;
  self.loading = true;
  self.display = {login: false};
  self.sysIdentifier = null;

  // TODO: guarantee only one promise will be pending at a time
  // (could be an issue if )
  var _resolve = null;

  self.createSession = function(identity) {
    // FIXME: validate identity format

    var needsLogin = false;
    self.display = {login: false};

    // inspect public key credential
    // TODO: `credential` should be an @set; find public key credential in
    // the set
    var credentials = jsonld.getValues(identity, 'credential');
    var publicKey;
    if(credentials.length === 1) {
      publicKey = credentials[0]['@graph'].claim.publicKey;
    }
    if(publicKey && jsonld.hasValue(
      publicKey, 'type', 'EphemeralCryptographicKey')) {
      needsLogin = true;
      self.display.temporaryDevice = true;
    } else if(publicKey && publicKey.id.indexOf('did:') !== 0) {
      needsLogin = true;
      self.display.newDevice = true;
    }
    if(needsLogin) {
      // user needs to login using identifier/password
      self.display.login = true;
      self.sysIdentifier = identity.id;
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
