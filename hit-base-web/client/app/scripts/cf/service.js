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


angular.module('cf').factory('CFTestPlanListLoader', ['$q', '$http',
    function ($q, $http) {
        return function (scope) {
            var delay = $q.defer();
                $http.get("api/cf/testplans", {timeout: 180000, params: {"scope": scope}}).then(
                    function (object) {
                         delay.resolve(angular.fromJson(object.data));
                    },
                    function (response) {
                        delay.reject(response.data);
                    }
                );
//                $http.get('../../resources/cf/testCases.json').then(
//                    function (object) {
//                         delay.resolve(angular.fromJson(object.data));
//                    },
//                    function (response) {
//                        delay.reject(response.data);
//                    }
//                );

            return delay.promise;
        };
    }
]);


angular.module('cf').factory('CFTestPlanLoader', ['$q', '$http',
  function ($q, $http) {
    return function (id) {
      var delay = $q.defer();
      $http.get("api/cf/testplans/" + id, {timeout: 180000}).then(
        function (object) {
          delay.resolve(angular.fromJson(object.data));
        },
        function (response) {
          delay.reject(response.data);
        }
      );


//            $http.get("../../resources/cb/testPlans.json").then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );
      return delay.promise;
    };
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


