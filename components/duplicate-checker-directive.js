/*!
 * Duplicate Checker.
 *
 * Copyright (c) 2012-2017 Digital Bazaar, Inc. All rights reserved.
 *
 * @author Dave Longley
 */

/* @ngInject */
export default function factory(
  $http, $filter, $timeout, brAlertService, config) {
  return {
    restrict: 'A',
    scope: {
      input: '=brDuplicateChecker',
      type: '@brDuplicateCheckerType',
      available: '@brDuplicateCheckerAvailable',
      invalid: '@brDuplicateCheckerInvalid',
      taken: '@brDuplicateCheckerTaken',
      checking: '@brDuplicateCheckerChecking',
      owner: '@brDuplicateCheckerOwner',
      result: '=brDuplicateCheckerResult'
    },
    link: Link
  };

  function Link(scope, element) {
    scope.data = config.data || {};

    // hide feedback until input changes
    element.addClass('alert');
    element.css('display', 'none');

    scope.result = false;
    var lastInput = null;
    var timer = null;
    var init = false;

    function change(value) {

      // FIXME: scope.owner is not utilized in this module
      var ownerReady = (scope.owner === undefined);
      // determine if owner input is ready
      // var ownerReady = (scope.owner === undefined ||
      //   scope.owner.length > (scope.data.idp.identityBaseUri + '/').length);

      // initialized once value is defined and owner is ready
      if(!init && value !== undefined && ownerReady) {
        init = true;
      }
      if(!init) {
        return;
      }

      // stop previous check
      $timeout.cancel(timer);

      // nothing to check
      if(value === undefined || value.length === 0 || !ownerReady) {
        scope.result = false;
        element.css('display', 'none');
      } else if(value !== lastInput) {
        // show checking
        element
          .removeClass('alert-danger alert-success alert-warning')
          .addClass('alert-warning')
          .text(scope.checking)
          .css('display', 'block');
        lastInput = null;
        scope.result = false;

        // start timer to check
        timer = $timeout(function() {
          if(value.length === 0) {
            element.css('display', 'none');
          } else {
            if(scope.type === 'email') {
              lastInput = scope.input;
            } else {
              lastInput = $filter('slug')(scope.input);
            }
            var data = {};
            if(scope.type === 'email') {
              data.email = lastInput;
            } else {
              data.sysSlug = lastInput;
            }
            $http.post('/identifier/' + scope.type, $.extend(
              data, scope.owner ? {owner: scope.owner} : {}))
              .then(function() {
                scope.result = 'available';
                return scope.available;
              }).catch(function(err) {
                var status = (err.details && err.details.httpStatusCode ?
                  err.details.httpStatusCode : 500);
                if(status === 400) {
                  scope.result = 'invalid';
                  return scope.invalid;
                }
                if(status === 409) {
                  scope.result = 'unavailable';
                  return scope.taken;
                }
                scope.result = 'error';
                brAlertService.add('error', err);
                return null;
              }).then(function(text) {
                element.css('display', 'none');
                element.removeClass('alert-danger alert-success alert-warning');
                if(text !== null) {
                  if(scope.result === 'available') {
                    element.addClass('alert-success');
                  } else {
                    element.addClass('alert-danger');
                  }
                  element.text(text).css('display', 'block');
                }
              });
          }
        }, 1000);
      }
    }

    scope.$watch('input', change);
    scope.$watch('owner', function() {
      change(scope.input);
    });
  }
}
