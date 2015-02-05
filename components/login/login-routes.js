/*!
 * Login Routes.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Manu Sporny
 * @author David I. Lehn
 * @author Dave Longley
 */
define([], function() {

'use strict';

return [{
  path: '/session/login',
  options: {
    vars: {
      title: 'Login',
      // avoid login entry form on login page
      hideNavbarLogin: true
    },
    templateUrl: requirejs.toUrl('bedrock-idp/components/login/login.html')
  }
}];

});
