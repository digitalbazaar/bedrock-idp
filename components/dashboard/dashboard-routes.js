/*!
 * Identity Dashboard Routes.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 * @author David I. Lehn
 */
define([], function() {

'use strict';

return [{
  path: window.data.idp.identityBasePath + '/:identity/dashboard',
  options: {
    title: 'Dashboard',
    session: 'required',
    templateUrl: requirejs.toUrl(
      'bedrock-idp/components/dashboard/dashboard.html')
  }
}];

});
