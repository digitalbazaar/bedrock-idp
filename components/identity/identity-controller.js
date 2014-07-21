/*!
 * Identity Details.
 *
 * Copyright (c) 2012-2014 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Manu Sporny
 * @author David I. Lehn
 * @author Dave Longley
 */
define(['jsonld'], function(jsonld) {

'use strict';

/* @ngInject */
function factory($scope, IdentityService, ModelService, RefreshService) {
  var self = this;
  self.identity = {};

  RefreshService.register($scope, function(force) {
    var opts = {force: !!force};
    IdentityService.collection.getCurrent(opts)
      .then(function(identity) {
        // ensure an array of zero or more publicKeys
        identity.publicKey = jsonld.getValues(identity, 'publicKey');
        ModelService.replace(self.identity, identity);
        $scope.$apply();
      });
  })();
}

return {IdentityController: factory};

});