/*!
 * Credential Task Controller.
 *
 * Copyright (c) 2015-2017 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 * @author Matt Collier
 */
import {ProfileKeyStore} from 'bedrock-credential-handler';

export default {
  bindings: {
    requestType: '@brRequestType'
  },
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

  self.createSession = async identity => {
    // FIXME: validate identity format

    self.display = {login: false};

    // TODO: add checkbox for new vs. temporary device on login display
    //self.display.newDevice = true;
    //self.display.temporaryDevice = true;

    // check for existing profile on device
    const pkStore = new ProfileKeyStore('/credential-handler');
    const profile = await pkStore.get(identity.id);

    if(!profile) {
      // no profile on device
      self.display.newDevice = true;

      // user needs to login using identifier/password
      self.display.login = true;
      self.sysIdentifier = identity.id;
      return new Promise(resolve => _resolve = resolve);
    }

    // auto-login w/DID
    const domain = window.location.host;
    const vProfile = await pkStore.createCryptoKeyProfile(
      {profile, domain, sign: true});

    try {
      return await brAuthenticationService.login(vProfile);
    } catch(e) {
      brAlertService.add('error', e);
    }

    // FIXME: strange case that DID-based login fails (document when
    // this may happen and implement better handling)
    // show login display on DID-based failure
    self.display.login = true;
    self.sysIdentifier = identity.id;
    $scope.$apply();
    return new Promise(resolve => _resolve = resolve);
  };

  self.loggedIn = function(identity) {
    _resolve(identity);
  };
}
