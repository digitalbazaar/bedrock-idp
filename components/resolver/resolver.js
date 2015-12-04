/*!
 * Resolver module.
 *
 * Copyright (c) 2012-2014 Digital Bazaar, Inc. All rights reserved.
 *
 */
define([
  'angular'
], function(angular) {

'use strict';

var module = angular.module('bedrock-idp.resolver', []);

/* @ngInject */
module.config(function(routeResolverProvider) {
  console.log('IN IDP RESOLVER CONFIG');
  routeResolverProvider.resolve.idp =  function($route) {
    $route.current.locals.session.then(function(session) {
      console.log('HERE IN IDP RESOLVER', session);
    });
  };
});

return module.name;

});
