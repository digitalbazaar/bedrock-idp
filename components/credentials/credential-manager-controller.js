define([], function() {

'use strict';

/* @ngInject */
function factory(
  $scope, $http, $location, $routeParams, brAlertService, config) {
  var self = this;
  self.request = config.data.request;
  self.idp = {};
  if(config.data.curator !== undefined) {
    self.idp.identity = config.data.curator.credential;
  }
  self.action = 'request';
  self.routeParams = $routeParams;

  if($location.search().action === 'store') {
    self.action = 'store';
  }

  // transmit the selected credential to the requestor
  self.transmit = function(identity) {
    navigator.credentials.transmit(identity, {
      responseUrl: self.request.credentialCallbackUrl
    });
  };

  self.store = function(identity) {
    Promise.resolve($http.post('/credentials', identity))
      .then(function(response) {
        if(response.status !== 200) {
          throw response;
        }
      }).then(function() {
        navigator.credentials.transmit(identity, {
          responseUrl: self.request.storageCallback
        });
      }).catch(function(err) {
        console.error('Failed to store credential', err);
        brAlertService.add('error', 'Failed to store the credential.');
      }).then(function() {
        $scope.$apply();
      });
  };
}

return {CredentialManagerController: factory};

});
