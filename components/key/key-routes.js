/*!
 * Key Routes.
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

var base = window.data.identityBasePath + '/:identity/keys';
return [{
  path: base,
  options: {
    title: 'Keys',
    templateUrl: modulePath + 'keys.html'
  }
}, {
  path: base + '/:keyId',
  options: {
    title: 'Key',
    templateUrl: modulePath + 'key.html'
  }
}];

});
