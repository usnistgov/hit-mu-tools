///**
//* Created by haffo on 2/2/15.
//*/
//
//angular.module('hit-tool').run(function ($httpBackend) {
//
//
//    $httpBackend.whenGET(/index.html\//).passThrough();
//    $httpBackend.whenGET(/views\//).passThrough();
//
//
//    $httpBackend.whenGET('api/appInfo').respond(function(method, url, data, headers) {
//        var request = new XMLHttpRequest();
//        request.open('GET', '../../resources/appInfo.json', false);
//        request.send(null);
//        var res =  angular.fromJson(request.response);
//        return [request.status, res, {}];
//    });
//
//
//    $httpBackend.whenGET('api/cf/testcases').respond(function(method, url, data, headers) {
//        var request = new XMLHttpRequest();
//        request.open('GET', '../../resources/cf/testCases.json', false);
//        request.send(null);
//        var res =  angular.fromJson(request.response);
//        return [request.status, res, {}];
//    });
//
//    $httpBackend.whenGET('api/cb/testcases').respond(function(method, url, data, headers) {
//        var request = new XMLHttpRequest();
//        request.open('GET', '../../resources/cb/testCases.json', false);
//        request.send(null);
//        var res =  angular.fromJson(request.response);
//        return [request.status, res, {}];
//    });
//
//    $httpBackend.whenGET(/\*\/testcontext\/\d+\/validateMessage\//).respond(function(method, url, data, headers) {
//        var request = new XMLHttpRequest();
//        request.open('GET', '../../resources/cf/validationResult.json', false);
//        request.send(null);
//        var res =  angular.fromJson(request.response);
//        return [request.status, res, {}];
//    });
//
//    $httpBackend.whenGET(/\*\/testcontext\/\d+\/parseMessage\//).respond(function(method, url, data, headers) {
//        var request = new XMLHttpRequest();
//        request.open('GET', '../../resources/cf/messageObject.json', false);
//        request.send(null);
//        var res =  angular.fromJson(request.response);
//        return [request.status, res, {}];
//    });
//
//
//
//
//
//});
//
