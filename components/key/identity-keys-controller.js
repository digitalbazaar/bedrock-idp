/*!
 * Identity Keys Controller.
 *
 * Copyright (c) 2012-2016 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 * @author David I. Lehn
 */
define([], function() {

'use strict';

/* @ngInject */
function factory(brIdentityService) {
  var self = this;
  self.identity = brIdentityService.identity;
}

return {IdentityKeysController: factory};

});
