'use strict';

angular.module('commonServices', []);
angular.module('hit-util', []);
angular.module('common', ['ngResource', 'my.resource', 'default', 'xml', 'hl7v2-edi', 'hl7v2', 'edi', 'hit-util']);
angular.module('cf', ['common']);
angular.module('doc', ['common']);
angular.module('cb', ['common']);
angular.module('hit-tool-directives', []);
angular.module('hit-tool-services', ['common']);

var httpHeaders;

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
    'hit-util',
    'format',
    'default',
    'hl7v2-edi',
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
    'hit-settings',
    'doc'
//    ,
//    'ngMockE2E'
]);

app.config(function ($routeProvider, $httpProvider, localStorageServiceProvider) {


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
            templateUrl: 'views/cf/cf.html'
        })
        .when('/cb', {
            templateUrl: 'views/cb/cb.html'
        }).when('/error', {
            templateUrl: 'error.html'
        })
        .otherwise({
            redirectTo: '/'
        });

    $httpProvider.interceptors.push('ErrorInterceptor');

    httpHeaders = $httpProvider.defaults.headers;


});


app.factory('ErrorInterceptor', function ($q, $rootScope, $location, StorageService, $window) {
    var handle = function (response) {
        if (response.status === 403) {
            //$location.path("/a");
//            $location.url("/ir.html");
//            $window.location="/ir.html";
            $rootScope.openVersionChangeDlg();
        } else if (response.status === 401) {
//            $location.path("/b");
//            $location.url("/sc.html");
//            $window.location="/sc.html";
            $rootScope.openInvalidReqDlg();
        } else if (response.status === 404) {
            //$rootScope.openNotFoundDlg();
        }
    };
    return {
        responseError: function (response) {
            handle(response);
            return $q.reject(response);
        }
    };

});

app.run(function ($rootScope, $location, $modal, TestingSettings, AppInfo, StorageService, $route, $window,$sce,$templateCache) {
    $rootScope.appInfo = {};
    $rootScope.stackPosition = 0;
    $rootScope.scrollbarWidth = null;


    new AppInfo().then(function (appInfo) {
        $rootScope.appInfo = appInfo;
        httpHeaders.common['csrfToken'] = appInfo.csrfToken;
        httpHeaders.common['dTime'] = appInfo.date;
    }, function (error) {
        $rootScope.appInfo = {};
        $rootScope.openErrorDlg();
    });


    $rootScope.$watch(function () {
        return $location.path();
    }, function (newLocation, oldLocation) {

        //true only for onPopState
        if ($rootScope.activePath === newLocation) {

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
                }, '');

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


    $rootScope.$on('$locationChangeSuccess', function () {
        //$rootScope.activePath = $location.path();
        $rootScope.setActive($location.path());
    });


    $rootScope.getScrollbarWidth = function () {

        if ($rootScope.scrollbarWidth == null) {
            var outer = document.createElement("div");
            outer.style.visibility = "hidden";
            outer.style.width = "100px";
            outer.style.msOverflowStyle = "scrollbar"; // needed for WinJS apps

            document.body.appendChild(outer);

            var widthNoScroll = outer.offsetWidth;
            // force scrollbars
            outer.style.overflow = "scroll";

            // add innerdiv
            var inner = document.createElement("div");
            inner.style.width = "100%";
            outer.appendChild(inner);

            var widthWithScroll = inner.offsetWidth;

            // remove divs
            outer.parentNode.removeChild(outer);

            $rootScope.scrollbarWidth = widthNoScroll - widthWithScroll;
        }

        return $rootScope.scrollbarWidth;
    };

    $rootScope.openValidationResultInfo = function () {
        var modalInstance = $modal.open({
            templateUrl: 'ValidationResultInfoCtrl.html',
            windowClass: 'profile-modal',
            controller: 'ValidationResultInfoCtrl'
        });
    };

    $rootScope.showSettings = function () {
        var modalInstance = $modal.open({
            templateUrl: 'SettingsCtrl.html',
            size:'lg',
            keyboard:'false',
            controller: 'SettingsCtrl'
        });
    };

    $rootScope.openVersionChangeDlg = function () {
        $rootScope.blankPage();

        var vcModalInstance = $modal.open({
            templateUrl: 'VersionChangeCtrl.html',
            size: 'lg',
            backdrop:true,
            keyboard: 'false',
            'controller': 'VersionChangeCtrl'
        });
        vcModalInstance.result.then(function () {
            StorageService.clearAll();
            $templateCache.removeAll();
            $rootScope.index();
        }, function () {
            StorageService.clearAll();
            $templateCache.removeAll();
            $rootScope.index();
        });
    };

    $rootScope.openErrorDlg = function () {
        $location.path('/error');
//        $rootScope.blankPage();
//        var errorModalInstance = $modal.open({
//            templateUrl: 'ErrorCtrl.html',
//            size: 'lg',
//            backdrop:true,
//            keyboard: 'false',
//            'controller': 'ErrorCtrl'
//        });
//        errorModalInstance.result.then(function () {
//            $rootScope.index();
//        }, function () {
//            $rootScope.index();
//        });
    };

    $rootScope.blankPage = function () {
        //$location.path('/blank');
    };

    $rootScope.index = function () {
        //$location.path('/home');
        $('#appcontainer').html('');
        $window.location.reload();
    };

    $rootScope.openInvalidReqDlg = function () {
        $rootScope.blankPage();

         var irModalInstance = $modal.open({
            templateUrl: 'InvalidReqCtrl.html',
            size: 'lg',
            backdrop:true,
            keyboard: 'false',
            'controller': 'InvalidReqCtrl'
        });

        irModalInstance.result.then(function () {
            $rootScope.index();

        }, function () {
            $rootScope.index();
        });
    };

    $rootScope.openNotFoundDlg = function () {
        $rootScope.blankPage();
         var nfModalInstance = $modal.open({
            templateUrl: 'NotFoundCtrl.html',
            size: 'lg',
            backdrop:true,
            keyboard: 'false',
            'controller': 'NotFoundCtrl'
        });

        nfModalInstance.result.then(function () {
            $rootScope.index();
        }, function () {
            $rootScope.index();
        });
    };

//    $rootScope.$on('$routeChangeStart', function(event, next, current) {
//        if (typeof(current) !== 'undefined'){
//            $templateCache.remove(current.templateUrl);
//        }
//    });

    $rootScope.pettyPrintType = function (type) {
        return type === 'TestStep' ? 'Test Step': type === 'TestCase'? 'Test Case':type;
    };






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

app.controller('TableFoundCtrl', function ($scope, $modalInstance, table) {
    $scope.table = table;
    $scope.tmpTableElements = [].concat(table != null ? table.valueSetElements : []);
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});



app.controller('ValidationResultInfoCtrl', [ '$scope', '$modalInstance',
    function ($scope, $modalInstance) {
        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };
    }
]);

app.filter('capitalize', function() {
    return function(input) {
        return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    }
});


app.directive('stRatio', function () {
    return {

        link: function (scope, element, attr) {
            var ratio = +(attr.stRatio);
            element.css('width', ratio + '%');
        }
    };
});


app.controller('InvalidReqCtrl', [ '$scope', '$modalInstance', 'StorageService', '$window',
    function ($scope, $modalInstance, StorageService, $window) {
        $scope.close = function () {
            $modalInstance.close();
        };
    }
]);


app.controller('ErrorCtrl', [ '$scope', '$modalInstance', 'StorageService', '$window',
    function ($scope, $modalInstance, StorageService, $window) {
        $scope.refresh = function () {
            $modalInstance.close($window.location.reload());
        };
    }
]);

app.controller('VersionChangeCtrl', [ '$scope', '$modalInstance', 'StorageService', '$window',
    function ($scope, $modalInstance, StorageService, $window) {
        $scope.close = function () {
            $modalInstance.close();
        };
    }
]);

app.controller('NotFoundCtrl', [ '$scope', '$modalInstance', 'StorageService', '$window',
    function ($scope, $modalInstance, StorageService, $window) {
        $scope.close = function () {
            $modalInstance.close();
        };
    }
]);






