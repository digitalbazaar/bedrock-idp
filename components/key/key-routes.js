/*!
 * Key Routes.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Manu Sporny
 * @author David I. Lehn
 * @author Dave Longley
 */
define([], function() {

'use strict';

var base = window.data.idp.identityBasePath + '/:identity/keys';
return [{
  path: base,
  options: {
    title: 'Keys',
    templateUrl: requirejs.toUrl('bedrock-idp/components/key/keys.html')
  }
}, {
  path: base + '/:keyId',
  options: {
    title: 'Key',
    templateUrl: requirejs.toUrl('bedrock-idp/components/key/key.html')
  }
}];

});
