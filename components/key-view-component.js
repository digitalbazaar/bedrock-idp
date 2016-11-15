/*!
 * Copyright (c) 2016 Digital Bazaar, Inc. All rights reserved.
 */
define([], function() {

'use strict';

function register(module) {
  module.component('brKeyView', {
    bindings: {
      identity: '<brIdentity'
    },
    templateUrl: requirejs.toUrl(
      'bedrock-idp/components/key-view-component.html')
  });
}

return register;

});
