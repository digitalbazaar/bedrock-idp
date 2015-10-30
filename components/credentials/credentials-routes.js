/*!
 * Credentials Routes.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 * @author David I. Lehn
 */
define([], function(config) {

'use strict';

// TODO: move to main module file (do not separate into routes file)
var credentialsBasePath =
  window.data['bedrock-angular-credential'].credentialsBasePath;

return [{
  path: window.data.idp.identityBasePath + '/:identity/credentials',
  options: {
    title: 'Credentials',
    session: 'required',
    templateUrl: requirejs.toUrl(
      'bedrock-idp/components/credentials/credentials.html')
  }
}, {
  path: credentialsBasePath,
  options: {
    title: 'Credentials',
    templateUrl: requirejs.toUrl(
      'bedrock-angular-credential/credential-viewer.html')
  }
}];

});
