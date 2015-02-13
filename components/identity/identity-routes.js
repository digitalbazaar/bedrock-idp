/*!
 * Identity Routes.
 *
 * Copyright (c) 2014-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Manu Sporny
 * @author David I. Lehn
 * @author Dave Longley
 */
define([], function() {

'use strict';

var base = window.data.idp.identityBasePath;
return [{
  path: base,
  options: {
    title: 'Identity Credentials',
    templateUrl: requirejs.toUrl(
      'bedrock-idp/components/identity/identity-credentials.html')
  }
}, {
  path: base + '/:identity',
  options: {
    title: 'Identity',
    templateUrl: requirejs.toUrl(
      'bedrock-idp/components/identity/identity.html')
  }
}];

});
