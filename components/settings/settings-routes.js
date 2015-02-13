/*!
 * Identity Settings Routes.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 * @author David I. Lehn
 */
define([], function() {

'use strict';

return [{
  path: window.data.idp.identityBasePath + '/:identity/settings',
  options: {
    title: 'Settings',
    session: 'required',
    templateUrl: requirejs.toUrl(
      'bedrock-idp/components/settings/settings.html')
  }
}];

});
