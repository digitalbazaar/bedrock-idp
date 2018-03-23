/*
 * Copyright (c) 2016 Digital Bazaar, Inc. All rights reserved.
 */
 
define([], function() {

'use strict';

function register(module) {
  module.component('brIdpTestSettings', {
    bindings: {
      identity: '<brIdentity'
    },
    templateUrl: 'bedrock-idp-test/settings-component.html'
  });
}

return register;

});
