/*!
 * Login Routes.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Manu Sporny
 * @author David I. Lehn
 * @author Dave Longley
 */
define(['module'], function(module) {

'use strict';

var modulePath = module.uri.substr(0, module.uri.lastIndexOf('/')) + '/';

return [{
  path: '/session/login',
  options: {
    vars: {
      title: 'Login',
      // avoid login entry form on login page
      hideNavbarLogin: true
    },
    templateUrl: modulePath + 'login.html'
  }
}];

});
