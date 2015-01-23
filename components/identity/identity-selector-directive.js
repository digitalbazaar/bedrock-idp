/*!
 * Identity Selector directive.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define(['module'], function(module) {

'use strict';

var modulePath = module.uri.substr(0, module.uri.lastIndexOf('/')) + '/';

/* @ngInject */
function factory() {
  return {
    restrict: 'A',
    scope: {
      identityTypes: '=brIdentityTypes',
      identities: '=brIdentities',
      selected: '=brSelected',
      invalid: '=brInvalid',
      fixed: '@brFixed'
    },
    templateUrl: modulePath + 'identity-selector.html',
    link: function(scope, element, attrs) {
      attrs.$observe('brFixed', function(value) {
        scope.fixed = value;
      });
    }
  };
}

return {brIdentitySelector: factory};

});
