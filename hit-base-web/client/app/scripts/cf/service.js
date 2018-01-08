'use strict';


angular.module('cf').factory('CF',
    ['$rootScope', '$http', '$q', 'Message', 'Tree', function ($rootScope, $http, $q, Message, Tree) {
        var CF = {
            editor: null,
            cursor: null,
            tree: new Tree(),
            testCase: null,
            selectedTestCase: null,
            message: new Message(),
            searchTableId: 0
        };
        return CF;
}]);



angular.module('cf').factory('CFTestPlanExecutioner', ['$q', '$http',
  function ($q, $http) {
    var manager = {
      getTestPlan:  function (id) {
        var delay = $q.defer();
        $http.get("api/cf/testplans/" + id, {timeout: 180000}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );

        return delay.promise;
      },

      getTestPlans: function (scope) {
        var delay = $q.defer();
        $http.get("api/cf/testplans", {timeout: 180000, params: {"scope": scope}}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      }
    };
    return manager;
  }
]);


angular.module('cf').factory('CFTestPlanManager', ['$q', '$http',
  function ($q, $http) {
    var manager = {
      getProfiles: function(groupId){
        var delay = $q.defer();
        $http.get("api/cf/management/groups/"+ groupId + "/profiles", {timeout: 180000}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },

      getTokenProfiles: function(domain, token){
        var delay = $q.defer();
        $http.get("api/cf/" + domain + "/management/tokens/"+ token + "/profiles", {timeout: 180000}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },

      getTestPlan:  function (id) {
        var delay = $q.defer();
        $http.get("api/cf/testplans/" + id, {timeout: 180000}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );

        return delay.promise;
      },

      getTestPlans: function (scope) {
        var delay = $q.defer();
        $http.get("api/cf/management/groups", {timeout: 180000, params: {"scope": scope}}).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },

      create : function (catego, scop, pos) {
        var delay = $q.defer();
        var params = $.param({category: catego, scope: scop, position: pos});
        var config = {
          headers : {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
          }
        };
        $http.post('api/cf/management/groups/create', params,config).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },

      deleteProfile : function (domain, profileId) {
        var delay = $q.defer();
        $http.post('api/cf/'+ domain+ '/management/profiles/' + profileId + '/delete').then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },

      deleteGroup : function (groupId) {
        var delay = $q.defer();
        $http.post('api/cf/management/groups/' + groupId + '/delete').then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      deleteGroups : function (groupIds) {
        var delay = $q.defer();
        $http.post('api/cf/management/groups/delete', groupIds).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      updateCategory : function (category, groupId) {
        var delay = $q.defer();
        $http.post('api/cf/management/categories/'+ category + "/addGroup", groupId).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      deleteToken : function (tok) {
        var delay = $q.defer();
        $http.post('api/cf/management/tokens/'+ tok + "/delete").then(function (object) {
          delay.resolve(angular.fromJson(object.data));
        }, function (error) {
          delay.reject(response.data);
        });
        return delay.promise;
      },
      updateCategories:  function (category, groups) {
        var delay = $q.defer();
        $http.post("api/cf/management/categories/" +category , groups).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      saveGroup:  function (domain, scope, token, updated, removed, added, metadata) {
        var delay = $q.defer();
        $http.post('api/cf/'+ domain + '/management/groups/' +metadata.groupId, {
          groupId: metadata.groupId,
          testcasename:metadata.name,
          testcasedescription: metadata.description,
          added: added,
          removed: removed,
          updated: updated,
          token: token,
          scope: scope
        }).then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      },
      publishGroup:  function (groupId) {
        var delay = $q.defer();
        $http.post('api/cf/management/groups/'+ groupId + '/publish').then(
          function (object) {
            delay.resolve(angular.fromJson(object.data));
          },
          function (response) {
            delay.reject(response.data);
          }
        );
        return delay.promise;
      }

    };
    return manager;
  }
]);

angular.module('cf').service('modalService', ['$modal',	function ($modal) {

    var modalDefaults = {
        backdrop: true,
        keyboard: true,
        modalFade: true,
        templateUrl: 'views/cf/modal.html'
    };

    var modalOptions = {
        closeButtonText: 'Close',
        actionButtonText: 'OK',
        headerText: 'Proceed?',
        bodyText: 'Perform this action?'
    };

    this.showModal = function (customModalDefaults, customModalOptions) {
        if (!customModalDefaults) customModalDefaults = {};
        customModalDefaults.backdrop = 'static';
        return this.show(customModalDefaults, customModalOptions);
    };

    this.show = function (customModalDefaults, customModalOptions) {
        //Create temp objects to work with since we're in a singleton service
        var tempModalDefaults = {};
        var tempModalOptions = {};

        //Map angular-ui modal custom defaults to modal defaults defined in service
        angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

        //Map modal.html $scope custom properties to defaults defined in service
        angular.extend(tempModalOptions, modalOptions, customModalOptions);

        if (!tempModalDefaults.controller) {
            tempModalDefaults.controller = ['$scope','$modalInstance',function ($scope, $modalInstance) {
                $scope.modalOptions = tempModalOptions;
                $scope.modalOptions.ok = function (result) {
                    $modalInstance.close(result);
                };
                $scope.modalOptions.close = function (result) {
                    $modalInstance.dismiss('cancel');
                };
            }];
        }

        return $modal.open(tempModalDefaults).result;
    };

}]);



