/*
 * Copyright (c) 2016 Digital Bazaar, Inc. All rights reserved.
 */
define([
  'angular',
  './navbar-tools-component',
  './settings-component'
], function(angular) {

'use strict';

var module = angular.module('bedrock-idp-test', [
  'bedrock-idp', 'bedrock.messages']);

Array.prototype.slice.call(arguments, 1).forEach(function(register) {
  register(module);
});

/* @ngInject */
module.config(function($routeProvider) {
  var identityBasePath = window.data.idp.identityBasePath;
  
  $routeProvider
    .when(identityBasePath + '/:identity/messages', {
      title: 'Messages',
      session: 'required',
      template: '<br-messages></br-messages>'
    })
    .when('/messages/:id', {
      title: 'Message',
      session: 'required',
      template: '<br-message-viewer></br-message-viewer>'
    })
    .when(identityBasePath + '/:identity/settings', {
      title: 'Settings',
      session: 'required',
      template: '<br-idp-test-settings br-identity="$resolve.identity">\
        </br-idp-test-settings>',
      resolve: {
        identity: function($route, brIdentityService) {
          var id = $route.current.locals.brResolve.session.identity.id;
          if(id.indexOf('did:') === 0) {
            id = identityBasePath + '/' + id;
          }
          return brIdentityService.collection.get(id);
        }
      }
    })
    .when('/passcode', {
      title: 'Reset Password',
      template: '<br-authn-password-reset-view></br-authn-password-reset-view>'
    });    
});

/* @ngInject */
module.run(function(
  brAgreementService, brIdentityService, brNavbarService, brSessionService, 
  config) {
  var identityBasePath = window.data.idp.identityBasePath;
  config.site = config.site || {};
  config.site.navbar = config.site.navbar || {};
  config.site.navbar.templates = config.site.navbar.templates || [];
  config.site.navbar.templates.push(requirejs.toUrl(
    'bedrock-idp-test/navbar-tools-template.html'));
    
  brNavbarService.displayOrder = [
    'brDashboard',
    'brCredential',
    'brTestSettings',    
  ];
  
  brNavbarService.registerMenu('brTestSettings', {
    slug: '/settings',
    icon: 'fa fa-wrench',
    label: 'Settings',
    pageTitle: 'Settings',
    visible: false,
    init: function(scope) {
      var menu = this;
      scope.$watch(function() {
        return brSessionService.session;
      }, function(session) {
        if(session && session.identity) {
          // We're logged in, so get the full identity
          var id = session.identity.id;
          if(id.indexOf('did:') === 0) {
            id = identityBasePath + '/' + id;
          }
          brIdentityService.collection.get(id)
            .then(function(identity) {
              menu.visible = true;
              menu.url = identityBasePath + '/' +
                identity.sysSlug + menu.slug;
              scope.$apply();
            });
        } else {
          menu.visible = false;
        }
      }, true);
    }
  });  

  brAgreementService.groups['bedrock-idp.join'].displayOrder = ['brTos'];
  brAgreementService.register(
    'bedrock-idp.join', 'brTos', {
      title: 'Terms of Service',
      templateUrl: requirejs.toUrl('bedrock-idp-test/agreements/tos.html')
    });
});

});
