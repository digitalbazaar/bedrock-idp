/*!
 * IDP components module.
 *
 * Copyright (c) 2012-2016 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
import angular from 'angular';
import _ from 'lodash';
import CreateIdentityComponent from './create-identity-component.js';
import CredentialsComponent from './credentials-component.js';
import CredentialTaskComponent from './credential-task-component.js';
import DashboardComponent from './dashboard-component.js';
import DuplicateCheckerDirective from './duplicate-checker-directive.js';
import IdentityCredentialsComponent from './identity-credentials-component.js';
import JoinComponent from './idp-join-component.js';
import KeyViewComponent from './key-view-component.js';

var credentialsBasePath =
  window.data['bedrock-angular-credential'].credentialsBasePath;
var keyBasePath = window.data['bedrock-angular-key'].basePath;

var module = angular.module(
  'bedrock.idp', [
    'bedrock.agreement', 'bedrock.alert',
    'bedrock.authn-password', 'bedrock.credential',
    'bedrock.credential-curator', 'bedrock.identity', 'bedrock.resolver'
  ]);

module.component('briCredentials', CredentialsComponent);
module.component('briCredentialTask', CredentialTaskComponent);
module.component('briDashboard', DashboardComponent);
module.component('briIdentityCredentials', IdentityCredentialsComponent);
module.component('brCreateIdentity', CreateIdentityComponent);
module.component('brKeyView', KeyViewComponent);
module.component('brIdpJoin', JoinComponent);
module.directive('brDuplicateChecker', DuplicateCheckerDirective);

/* @ngInject */
module.config(function($routeProvider, routeResolverProvider) {
  /* @ngInject */
  function redirectIfReferred(
    $location, $window, brSessionService, config) {
    // return early if session is present
    var wasReferred = ($location.search().referral === 'true');
    var redirectAuto = ($location.search().auto === 'true');
    return brSessionService.get()
      .then(function(session) {
        if(session.identity) {
          var referred = wasReferred ? '?referral=true' : '';
          if(redirectAuto) {
            $window.location = document.referrer;
            return;
          }
          $location.url(config.data.idp.identityBasePath + '/' +
            session.identity.sysSlug + '/dashboard' + referred);
        }
      });
  }

  routeResolverProvider.add('bedrock-idp', 'session', resolve);

  var agreementRedirect = null;
  /* @ngInject */
  function resolve($location, $route, brAgreementService, config) {
    var session = $route.current.locals.session;

    var requiredAgreements =
      brAgreementService.getAgreements('bedrock-idp.join');

    if(session && session.identity) {
      // see if identity has signed required agreements
      var hasRequiredAgreements = _.difference(
        requiredAgreements, session.identity.agreements).length === 0;
      if(!hasRequiredAgreements) {
        if($location.url() === '/agreement') {
          // already on agreement page, nothing to do
          return;
        }
        // go to agreements page
        agreementRedirect = $location.url();
        $location.url('/agreement');
        throw new Error('Service Agreement required.');
      }

      // identity has signed required agreements...
      if($location.url() === '/agreement') {
        // location is '/agreement' but identity has signed everything, so
        // go to the dashboard
        $location.url(config.data.identity.baseUri + '/' +
          session.identity.sysSlug + '/dashboard');
        throw new Error('Required agreements already signed.');
      }
    }
  }

  var basePath = window.data.idp.identityBasePath;
  $routeProvider
    .when('/agreement', {
      title: 'Agreements',
      session: 'required',
      template:
       '<br-agreement-view br-agreement-group="bedrock-idp.join" ' +
       'br-on-agree="$resolve.relocate()" br-on-cancel="$resolve.cancel()">' +
       '</br-agreement-view>',
      resolve: {
        cancel: function($route, brSessionService) {
          return function() {
            return brSessionService.logout().then(function() {
              // $location.url('/') does not work here
              $route.reload();
            });
          };
        },
        relocate: function($location, $route, config) {
          return function() {
            if(agreementRedirect) {
              var redirect = agreementRedirect;
              agreementRedirect = null;
              return $location.url(redirect);
            }
            var sysSlug =
              $route.current.locals.brResolve.session.identity.sysSlug;
            $location.url(config.data.identity.baseUri + '/' + sysSlug +
              '/dashboard');
          };
        }
      }
    })
    .when(basePath + '/:identity/credentials', {
      title: 'Credentials',
      session: 'required',
      templateUrl: '<bri-credentials></bri-credentials>'
    })
    .when(credentialsBasePath, {
      title: 'Credentials',
      templateUrl: 'bedrock-angular-credential/credential-viewer.html'
    })
    .when('/credential-task', {
      vars: {
        title: 'Credential Task',
        navbar: {display: 'brand'}
      },
      templateUrl: '<bri-credential-task></bri-credential-task>'
    })
    .when(basePath + '/:identity/dashboard', {
      title: 'Dashboard',
      session: 'required',
      resolve: {redirectIfReferred: redirectIfReferred},
      template: '<bri-dashboard></bri-dashboard'
    })
    .when(basePath, {
      title: 'Identity Credentials',
      template: '<bri-identity-credentials></bri-identity-credentials>'
    })
    .when(basePath + '/:identity', {
      title: 'Identity',
      template:
        '<br-identity-viewer br-identity="$resolve.identity">' +
        '  <br-identity-additional-content>' +
        '    <br-keys br-identity="$resolve.identity"></br-keys>' +
        '    <br-credentials br-identity="$resolve.identity">' +
        '    </br-credentials>' +
        '  </br-identity-additional-content>' +
        '</br-identity-viewer>',
      resolve: {
        identity: function($route, brIdentityService) {
          var identity = $route.current.params.identity;
          return brIdentityService.collection.get(
            basePath + '/' + identity);
        }
      }
    })
    .when('/join', {
      title: 'Create Identity',
      resolve: {redirectIfReferred: redirectIfReferred},
      template: '<bri-create-identity></bri-create-identity>'
    })
    .when(basePath + '/:identity/keys', {
      title: 'Keys',
      template: '<br-key-view br-identity="$resolve.identity"></br-key-view>',
      resolve: {
        identity: function($route, brIdentityService) {
          var identity = $route.current.params.identity;
          return brIdentityService.collection.get(
            basePath + '/' + identity);
        }
      }
    })
    .when(keyBasePath + '/:keyId', {
      title: 'Key',
      templateUrl: 'bedrock-angular-key/key.html'
    })
    // FIXME: deprecated endpoint support for old keys
    .when(basePath + '/:identity/keys/:keyId', {
      title: 'Key',
      templateUrl: 'bedrock-angular-key/key.html'
    });
});

/* @ngInject */
module.run(function(
  brAgreementService, brAuthnService, brNavbarService, brSessionService,
  config) {
  brAgreementService.registerGroup('bedrock-idp.join');
  brAuthnService.displayOrder = ['authn-did', 'authn-password'];

  brNavbarService.registerMenu('brDashboard', {
    slug: '/dashboard',
    icon: 'fa fa-dashboard',
    label: 'Dashboard',
    pageTitle: 'Dashboard',
    visible: false,
    init: function(scope) {
      var menu = this;
      scope.$watch(function() {
        return brSessionService.session;
      }, function(session) {
        if(session && session.identity) {
          menu.visible = true;
          menu.url = config.data.idp.identityBaseUri + '/' +
            session.identity.sysSlug + menu.slug;
        } else {
          menu.visible = false;
        }
      }, true);
      // TODO: should be done elsewhere once
      // get latest session information
      brSessionService.get();
    }
  });

  brNavbarService.registerMenu('brCredential', {
    slug: '/credentials',
    icon: 'fa fa-trophy',
    label: 'Credentials',
    pageTitle: 'Credentials',
    visible: false,
    init: function(scope) {
      var menu = this;
      scope.$watch(function() {
        return brSessionService.session;
      }, function(session) {
        if(session && session.identity) {
          menu.visible = true;
          menu.url = config.data.idp.identityBaseUri + '/' +
            session.identity.sysSlug + menu.slug;
        } else {
          menu.visible = false;
        }
      }, true);
      // TODO: should be done elsewhere once
      // get latest session information
      brSessionService.get();
    }
  });
});
