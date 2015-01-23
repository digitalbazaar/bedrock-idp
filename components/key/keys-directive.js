/*!
 * Keys directive.
 *
 * Copyright (c) 2014-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author David I. Lehn
 * @author Dave Longley
 */
define(['module'], function(module) {

'use strict';

var modulePath = module.uri.substr(0, module.uri.lastIndexOf('/')) + '/';

var deps = [];
return {brKeys: deps.concat(factory)};

function factory() {
  return {
    restrict: 'E',
    replace: true,
    templateUrl: modulePath + 'keys-view.html'
  };
}

});
