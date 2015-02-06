/*!
 * Add Key Modal.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 * @author David I. Lehn
 */
define([], function() {

'use strict';

/* @ngInject */
function factory(
  $location, $routeParams, $sce, $timeout,
  brAlertService, brKeyService, config) {
  return {
    restrict: 'A',
    scope: {},
    require: '^stackable',
    templateUrl: requirejs.toUrl(
      'bedrock-idp/components/key/add-key-modal.html'),
    link: Link
  };

  function Link(scope, element, attrs, stackable) {
    var model = scope.model = {};
    var keys = brKeyService.get({
      identityMethod: 'route'
    });
    model.modulePath = requirejs.toUrl('bedrock-idp/components/key/');
    model.mode = 'add';
    model.loading = false;
    model.success = false;
    model.registrationCallback = null;
    model.callbackKey = null;
    model.state = {
      keys: keys.state
    };
    model.key = {
      '@context': config.data.contextUrls.identity,
      label: 'Access Key 1',
      publicKeyPem: ''
    };
    if($routeParams.service === 'add-key') {
      model.key.label = $routeParams['public-key-label'];
      model.key.publicKeyPem = $routeParams['public-key'];
      // trust callback URL
      model.registrationCallback =
        $sce.trustAsResourceUrl($routeParams['registration-callback']);
    }
    // flag if PEM UI is needed
    model.needPem = !model.key.publicKeyPem;

    model.addKey = function() {
      brAlertService.clearFeedback();
      model.loading = true;
      keys.collection.add(model.key).then(function(key) {
        // replace key with newly created key data
        model.key = key;
        model.success = true;
        if(model.registrationCallback) {
          // setup form and submit page to the callback
          // if it fails, provide a manual submission backup

          // form data to send to callback
          model.callbackKey = {
            '@context': config.data.contextUrls.identity,
            id: key.id
          };
          scope.$apply();

          // attempt to auto-submit the form back to the registering site
          element.find('.modal-footer > form').submit();

          // show the manual completion button after a timeout period
          $timeout(function() {
            model.loading = false;
            scope.$apply();
          }, 5000);
        } else {
          // clear query params
          $location.search({});
          model.loading = false;
        }
        scope.$apply();
      }).catch(function(err) {
        model.loading = false;
        brAlertService.add('error', err, {scope: scope});
        scope.$apply();
      });
    };

    model.submit = function() {
      $location.search({});
    };

    model.done = function() {
      stackable.close(null, model.key);
    };
  }
}

return {brAddKeyModal: factory};

});
