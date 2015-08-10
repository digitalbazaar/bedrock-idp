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

return [
  {
    path: window.data.idp.identityBasePath + '/:identity/credentials',
    options: {
      title: 'Credentials',
      session: 'required',
      templateUrl: requirejs.toUrl(
        'bedrock-idp/components/credentials/credentials.html')
    }
  },
  {
    path: '/credentials/',
    options: {
      title: 'Credentials',
      session: 'required',
      templateUrl: requirejs.toUrl(
        'bedrock-idp/components/credentials/credentials.html')
    }
  }
];

});
