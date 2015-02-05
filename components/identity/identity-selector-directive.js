/*!
 * Identity Selector directive.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define([], function() {

'use strict';

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
    templateUrl: requirejs.toUrl(
      'bedrock-idp/components/identity/identity-selector.html'),
    link: function(scope, element, attrs) {
      attrs.$observe('brFixed', function(value) {
        scope.fixed = value;
      });
    }
  };
}

return {brIdentitySelector: factory};

});
