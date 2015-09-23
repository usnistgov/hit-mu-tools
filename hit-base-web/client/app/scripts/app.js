'use strict';

angular.module('xml', []);
angular.module('hl7v2', []);
angular.module('edi', []);
angular.module('commonServices', []);
angular.module('common', ['ngResource', 'my.resource', 'xml', 'hl7v2','edi']);
angular.module('cf', ['common']);
angular.module('doc', ['common']);
angular.module('cb', ['common']);
angular.module('hit-tool-directives', []);
angular.module('hit-tool-services', ['common']);
var app = angular.module('hit-tool', [
    'ngRoute',
    'ui.bootstrap',
    'ngCookies',
    'LocalStorageModule',
    'ngResource',
    'ngSanitize',
    'ngAnimate',
    'ui.bootstrap',
    'angularBootstrapNavTree',
     'QuickList',
    'xml',
    'hl7v2',
    'edi',
    'cf',
    'cb',
    'ngTreetable',
    'blueimp.fileupload',
    'hit-tool-directives',
    'hit-tool-services',
    'commonServices',
    'smart-table',
    'hit-profile-viewer',
    'hit-validation-result',
    'hit-vocab-search',
    'hit-report-viewer',
    'hit-testcase-viewer',
    'hit-testcase-tree',
    'hit-doc',
    'doc'
//    ,
//    'ngMockE2E'
]);

app.config(function ($routeProvider, $httpProvider,localStorageServiceProvider) {


    localStorageServiceProvider
        .setPrefix('hit-tool')
        .setStorageType('sessionStorage');

    $routeProvider
        .when('/', {
            templateUrl: 'views/home.html'
        })
        .when('/home', {
            templateUrl: 'views/home.html'
        })
        .when('/testing', {
            templateUrl: '../views/templates.html'
        })
        .when('/doc', {
            templateUrl: 'views/doc.html'
        })
        .when('/setting', {
            templateUrl: 'views/setting.html'
        })
        .when('/about', {
            templateUrl: 'views/about.html'
        })
        .when('/contact', {
            templateUrl: 'views/contact.html'
        })
        .when('/cf', {
            templateUrl: 'views/cf/testing.html'
        })
        .when('/cb', {
            templateUrl: 'views/cb/testing.html'
        })
        .otherwise({
            redirectTo: '/'
        });
});


app.run(function ($rootScope, $location, $modal, TestingSettings, AppInfo,StorageService,$route,$window) {
    $rootScope.appInfo = {};
    $rootScope.stackPosition =0;


    new AppInfo().then(function (response) {
        $rootScope.appInfo = response;
    });


    $rootScope.$watch(function () {
        return $location.path();
    }, function (newLocation, oldLocation) {

        //true only for onPopState
        if($rootScope.activePath === newLocation) {

            var back,
                historyState = $window.history.state;

            back = !!(historyState && historyState.position <= $rootScope.stackPosition);

            if (back) {
                //back button
                $rootScope.stackPosition--;
            } else {
                //forward button
                $rootScope.stackPosition++;
            }

        } else {
            //normal-way change of page (via link click)

            if ($route.current) {

                $window.history.replaceState({
                    position: $rootScope.stackPosition
                },'');

                $rootScope.stackPosition++;

            }
//
//            if (newLocation != null) {
//                $rootScope.setActive(newLocation);
//            }

        }



    });

    $rootScope.isActive = function (path) {
        return path === $rootScope.activePath;
    };

    $rootScope.setActive = function (path) {
        if (path === '' || path === '/') {
            $location.path('/home');
        } else {
            $rootScope.activePath = path;
        }
    };

    $rootScope.isSubActive = function (path) {
        return path === $rootScope.subActivePath;
    };

    $rootScope.setSubActive = function (path) {
        $rootScope.subActivePath = path;
        StorageService.set(StorageService.ACTIVE_SUB_TAB_KEY, path);
    };


    $rootScope.showError = function (error) {
        var modalInstance = $modal.open({
            templateUrl: 'ErrorDlgDetails.html',
            controller: 'ErrorDetailsCtrl',
            resolve: {
                error: function () {
                    return error;
                }
            }
        });
        modalInstance.result.then(function (error) {
            $rootScope.error = error;
        }, function () {
        });
    };

    $rootScope.cutString = function (str) {
        if (str.length > 20) str = str.substring(0, 20) + "...";
        return str;
    };

    $rootScope.tabs = new Array();
    $rootScope.selectTestingType = function (value) {
        $rootScope.tabs[0] = false;
        $rootScope.tabs[1] = false;
        $rootScope.tabs[2] = false;
        $rootScope.tabs[3] = false;
        $rootScope.tabs[4] = false;
        $rootScope.tabs[5] = false;
        $rootScope.activeTab = value;
        $rootScope.tabs[$rootScope.activeTab] = true;
        TestingSettings.setActiveTab($rootScope.activeTab);
    };

    $rootScope.downloadArtifact = function (path) {
        var form = document.createElement("form");
        form.action = "api/testartifact/download";
        form.method = "POST";
        form.target = "_target";
        var input = document.createElement("input");
        input.name = "path";
        input.value = path;
        form.appendChild(input);
        form.style.display = 'none';
        document.body.appendChild(form);
        form.submit();
    };




    $rootScope.toHTML = function (content) {
      return $sce.trustAsHtml(content);
//        return  content;
    };


    $rootScope.compile = function (content) {
//        scope.$watch(
//            function(scope) {
//                // watch the 'compile' expression for changes
//                return scope.$eval(attrs.compile);
//            },
//            function(value) {
//                // when the 'compile' expression changes
//                // assign it into the current DOM
//                element.html(value);
//
//                // compile the new DOM and link it to the current
//                // scope.
//                // NOTE: we only compile .childNodes so that
//                // we don't get into infinite loop compiling ourselves
//                return $compile(content);
//            }
//        );
        return $compile(content);
    };


    $rootScope.$on('$locationChangeSuccess', function() {
        //$rootScope.activePath = $location.path();
        $rootScope.setActive($location.path());
    });




});


angular.module('ui.bootstrap.carousel', ['ui.bootstrap.transition'])
    .controller('CarouselController', ['$scope', '$timeout', '$transition', '$q', function ($scope, $timeout, $transition, $q) {
    }]).directive('carousel', [function () {
        return {

        }
    }]);


angular.module('hit-tool-services').factory('TabSettings',
    ['$rootScope', function ($rootScope) {
        return {
            new: function (key) {
                return{
                    key: key,
                    activeTab: 0,
                    getActiveTab: function () {
                        return this.activeTab;
                    },
                    setActiveTab: function (value) {
                        this.activeTab = value;
                        this.save();
                    },
                    save: function () {
                        sessionStorage.setItem(this.key, this.activeTab);
                    },
                    restore: function () {
                        this.activeTab = sessionStorage.getItem(this.key) != null && sessionStorage.getItem(this.key) != "" ? parseInt(sessionStorage.getItem(this.key)) : 0;
                    }
                };
            }
        };
    }]
);


app.controller('ErrorDetailsCtrl', function ($scope, $modalInstance, error) {
    $scope.error = error;
    $scope.ok = function () {
        $modalInstance.close($scope.error);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

app.directive('stRatio', function () {

    return {

        link: function (scope, element, attr) {

            var ratio = +(attr.stRatio);


            element.css('width', ratio + '%');


        }

    };

});


angular.module('hit-tool-services').factory('AppInfo', ['$http', '$q', function ($http, $q) {
    return function () {
        var delay = $q.defer();
        $http.get('api/appInfo').then(
            function (object) {
                delay.resolve(angular.fromJson(object.data));
            },
            function (response) {
                delay.reject(response.data);
            }
        );


//        $http.get('../../resources/appInfo.json').then(
//            function (object) {
//                delay.resolve(angular.fromJson(object.data));
//            },
//            function (response) {
//                delay.reject(response.data);
//            }
//        );

        return delay.promise;
    };
}]);


angular.module('hit-tool-services').controller('TableFoundCtrl', function ($scope, $modalInstance, table) {
    $scope.table = table;
    $scope.tmpTableElements = [].concat(table != null ? table.valueSetElements : []);
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});









