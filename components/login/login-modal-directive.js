/*!
 * Login Modal.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define(['lodash'], function(_) {

'use strict';

/* @ngInject */
function factory($http, $timeout, $location, brAlertService, brRefreshService,
  config, brAuthenticationService, brSessionService) {
  return {
    restrict: 'A',
    scope: {
      sysIdentifier: '@brSysIdentifier',
      brOptions: '=?'
    },
    require: '^stackable',
    templateUrl: requirejs.toUrl(
      'bedrock-idp/components/login/login-modal.html'),
    link: Link
  };

  function Link(scope, element, attrs, stackable) {
    // clear existing feedback when showing this modal
    $timeout(function() {
      brAlertService.clearFeedback();
    });

    var model = scope.model = {};
    model.userName = null;
    model.newLogin = true;
    if('identity' in config.data.idp.session) {
      model.sysIdentifier = config.data.idp.session.identity.id;
      model.newLogin = false;
    }
    model.password = '';
    model.loading = false;

    model.display = {
      didLogin: false,
      cancel: false
    };
    // apply option
    _.assign(model.display, scope.brOptions.display);

    model.cancel = function() {
      stackable.close(null);
    };

    model.login = function() {
      scope.loading = true;
      brAlertService.clearFeedback();

      var authData = {
        password: model.password
      };
      if(scope.sysIdentifier) {
        authData.sysIdentifier = scope.sysIdentifier;
        authData.usernameField = model.userName;
      } else {
        authData.sysIdentifier = model.userName;
      }

      Promise.resolve($http.post('/session/login', authData))
          .then(function(response) {
          // success, close modal
          stackable.close(null);
          brRefreshService.refresh();
          // scope.$apply();
          return brSessionService.get();
        }).then(function(session) {
          config.data.idp.session.identity = session.identity;
          $location.url(
            config.data.idp.identityBasePath + '/' + session.identity.sysSlug +
            '/dashboard');
        }).catch(function(err) {
          model.loading = false;
          if(err.type === 'ValidationError') {
            brAlertService.add(
              'error',
              'The password you entered was incorrect. Please try again.',
              {scope: scope});
          } else {
            brAlertService.add('error', err, {scope: scope});
          }
        }).then(function() {
          scope.$apply();
        });
    };

    model.didLogin = function() {
      navigator.credentials.get({
        query: {
          '@context': 'https://w3id.org/identity/v1',
          id: '',
          publicKey: ''
        },
        agentUrl: config.data['authorization-io'].agentUrl
      }).then(function(identity) {
        if(!identity || !identity.id) {
          throw new Error('DID not provided.');
        }
        return brAuthenticationService.login(identity);
      }).then(function() {
        return brSessionService.get();
      }).then(function(session) {
        config.data.idp.session.identity = session.identity;
        $location.url(
          config.data.idp.identityBasePath + '/' + session.identity.sysSlug +
          '/dashboard');
      }).catch(function(err) {
        brAlertService.add('error', err);
      }).then(function() {
        scope.$apply();
      });
    };
  }
}

return {brLoginModal: factory};

});
