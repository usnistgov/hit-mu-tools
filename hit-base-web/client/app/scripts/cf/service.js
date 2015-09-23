'use strict';


angular.module('cf').factory('CF',
    ['$rootScope', '$http', '$q', 'Editor', 'EDICursor','Message','Tree', function ($rootScope, $http, $q, Editor, EDICursor, Message, Tree) {
        var CF = {
            editor: new Editor(),
            cursor: new EDICursor(),
            tree: new Tree(),
            testCase: null,
            selectedTestCase: null,
            message: new Message(),
            searchTableId: 0
        };

        return CF;
    }]);

angular.module('cf').factory('CFTestCaseListLoader', ['$q','$http',
    function ($q,$http) {
        return function() {
            var delay = $q.defer();
            $http.get("api/cf/testcases", {timeout: 60000}).then(
                function (object) {
                    delay.resolve(angular.fromJson(object.data));
                },
                function (response) {
                    delay.reject(response.data);
                }
            );
//            $http.get("../../resources/cf/testCases.json", {timeout: 60000}).then(
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

