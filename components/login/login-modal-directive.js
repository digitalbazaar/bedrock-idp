/*!
 * Login Modal.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define(['angular', 'lodash'], function(angular, _) {

'use strict';

/* @ngInject */
function factory(
  $http, $location, $timeout, $window, brAlertService, brAuthenticationService,
  brPasswordService, brRefreshService, brSessionService, config) {
  return {
    // TODO: change to just 'E'
    restrict: 'EA',
    scope: {
      sysIdentifier: '@brIdentity',
      options: '=?brOptions',
      callback: '&?brCallback'
    },
    require: '^stackable',
    templateUrl: requirejs.toUrl(
      'bedrock-idp/components/login/login-modal.html'),
    link: Link
  };

  function Link(scope, element, attrs, stackable) {
    // TODO: document why $timeout is used
    // clear existing feedback when showing this modal
    $timeout(function() {
      brAlertService.clearFeedback();
    });

    var model = scope.model = {};
    model.loading = false;
    model.newLogin = true;
    if('identity' in config.data.idp.session) {
      model.id = config.data.idp.session.identity.id;
      model.newLogin = false;
    }
    model.email = '';
    model.password = '';
    model.sysIdentifier = null;

    model.display = {
      didLogin: false,
      cancel: false
    };
    // apply option
    var options = scope.options || {};
    _.assign(model.display, options.display || {});

    model.login = function() {
      scope.loading = true;
      brAlertService.clearFeedback();

      var authData = {
        password: model.password,
        sysIdentifier: model.sysIdentifier
      };
      if(scope.sysIdentifier) {
        authData.id = scope.sysIdentifier;
      }

      brPasswordService.login(authData)
        .then(function(data) {
          // if a single 'identity' is returned, login was successful
          if(data.identity) {
            // refresh session information
            return brSessionService.get();
          }

          // show multiple identities
          model.multiple = true;
          model.email = data.email;
          model.choices = [];
          angular.forEach(data.identities, function(identity, identityId) {
            model.choices.push({id: identityId, label: identity.label});
          });
          model.sysIdentifier = model.choices[0].id;
          model.loading = false;
        }).catch(function(err) {
          if(err.type === 'ValidationError') {
            err = 'The password you entered was incorrect. Please try again.';
          }
          brAlertService.add('error', err, {scope: scope});
        }).then(function(session) {
          if(!session) {
            return;
          }
          // FIXME: remove hack to set current identity
          config.data.idp.session.identity = session.identity;
          // refresh services
          brRefreshService.refresh();
          // success, close modal
          stackable.close(null);
          if(angular.isDefined(attrs.brCallback)) {
            return scope.callback({identity: session.identity});
          }
          // FIXME: Use location.url after services have been updated to
          // refresh after session state change
          // $location.url(
            // config.data.idp.identityBasePath + '/' + session.identity.sysSlug +
            // '/dashboard');
          $window.location =
            config.data.idp.identityBaseUri + '/' + session.identity.sysSlug +
            '/dashboard';
        }).then(function() {
          model.loading = false;
          scope.$apply();
        });
    };

    model.didLogin = function() {
      scope.loading = true;
      navigator.credentials.get({
        query: {
          '@context': 'https://w3id.org/identity/v1',
          id: scope.sysIdentifier || '',
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
      }).catch(function(err) {
        brAlertService.add('error', err);
      }).then(function(session) {
        if(!session) {
          return;
        }
        // FIXME: remove hack to set current identity
        config.data.idp.session.identity = session.identity;
        // refresh services
        brRefreshService.refresh();
        // success, close modal
        stackable.close(null);
        if(angular.isDefined(attrs.brCallback)) {
          return scope.callback({identity: session.identity});
        }
        // FIXME: Use location.url after services have been updated to
        // refresh after session state change
        // $location.url(
        //   config.data.idp.identityBasePath + '/' + session.identity.sysSlug +
        //   '/dashboard');
        $window.location =
          config.data.idp.identityBaseUri + '/' + session.identity.sysSlug +
          '/dashboard';
      }).then(function() {
        scope.loading = false;
        scope.$apply();
      });
    };
  }
}

return {brLoginModal: factory};

});
