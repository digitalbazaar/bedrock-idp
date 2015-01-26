/*!
 * Edit Key Modal.
 *
 * Copyright (c) 2012-2015 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */
define(['angular', 'module'], function(angular, module) {

'use strict';

var modulePath = module.uri.substr(0, module.uri.lastIndexOf('/')) + '/';

/* @ngInject */
function factory(brAlertService, brIdentityService, brKeyService, config) {
  return {
    restrict: 'A',
    scope: {sourceKey: '=brKey'},
    require: '^stackable',
    templateUrl: modulePath + 'edit-key-modal.html',
    link: Link
  };

  function Link(scope, element, attrs, stackable) {
    var model = scope.model = {};
    var keys = brKeyService.get({
      identityMethod: 'route'
    });
    model.modulePath = modulePath;
    model.mode = 'edit';
    model.loading = false;
    // copy source budget for editing
    model.key = {};
    angular.extend(model.key, scope.sourceKey);

    model.editKey = function() {
      // set all fields from UI
      var key = {
        '@context': config.data.contextUrl,
        id: model.key.id,
        label: model.key.label
      };

      model.loading = true;
      brAlertService.clearFeedback();
      var promise = keys.collection.update(key);
      promise.then(function(key) {
        model.loading = false;
        stackable.close(null, key);
      }).catch(function(err) {
        model.loading = false;
        brAlertService.add('error', err, {scope: scope});
      })
      .then(function() {
        scope.$apply();
      });
    };
  }
}

return {brEditKeyModal: factory};

});
