/*!
 * Identity Routes.
 *
 * Copyright (c) 2014-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Manu Sporny
 * @author David I. Lehn
 * @author Dave Longley
 */
define(['module'], function(module) {

'use strict';

var modulePath = module.uri.substr(0, module.uri.lastIndexOf('/')) + '/';

var base = window.data.identityBasePath;
return [{
  path: base,
  options: {
    title: 'Identity Credentials',
    templateUrl: modulePath + 'identity-credentials.html'
  }
}, {
  path: base + '/:identity',
  options: {
    title: 'Identity',
    templateUrl: modulePath + 'identity.html'
  }
}];

});
