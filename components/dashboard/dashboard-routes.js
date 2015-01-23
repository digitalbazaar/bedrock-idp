/*!
 * Identity Dashboard Routes.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 * @author David I. Lehn
 */
define(['module'], function(module) {

'use strict';

var modulePath = module.uri.substr(0, module.uri.lastIndexOf('/')) + '/';

return [{
  path: window.data.identityBasePath + '/:identity/dashboard',
  options: {
    title: 'Dashboard',
    session: 'required',
    templateUrl: modulePath + 'dashboard.html'
  }
}];

});
