'use strict';


angular.module('upload')
.controller('UploadCtrl', ['$scope', '$http', '$window', '$modal', '$filter', '$rootScope', '$timeout', 'StorageService', 'TestCaseService', 'TestStepService','FileUploader','Notification','$modalInstance', function ($scope, $http, $window, $modal, $filter, $rootScope, $timeout, StorageService, TestCaseService, TestStepService, FileUploader, Notification,$modalInstance){
		
	
		FileUploader.FileSelect.prototype.isEmptyAfterSelection = function() {
	        return true;
	    };
	    $scope.testcase = {};
	  
	    $scope.profileValidationErrors = [];
	    $scope.valueSetValidationErrors = [];
	    $scope.constraintValidationErrors = [];
	    
	    
		$scope.profileCheckToggleStatus = false;

        var profileUploader = $scope.profileUploader = new FileUploader({
            url: 'api/gvtupload/uploadprofile'
        });
        var vsUploader = $scope.vsUploader = new FileUploader({
            url: 'api/gvtupload/uploadvs'
        });
        var constraintsUploader = $scope.constraintsUploader = new FileUploader({
            url: 'api/gvtupload/uploadcontraints'
        });
         

//        $http.get('../../resources/upload/uploadprofile.json').then(
//                function (object) {
//                	$scope.profileMessages = angular.fromJson(object.data.profiles);
//                },
//                function (response) {
//                }
//            );
//        $http.get('../../resources/upload/resourceError.json').then(
//                function (object) {
//                	
//                	$scope.profileValidationErrors = angular.fromJson(object.data.errors);
//                	$scope.constraintValidationErrors = angular.fromJson(object.data.errors);
//                },
//                function (response) {
//                }
//            );
        
        

        profileUploader.onErrorItem = function(fileItem, response, status, headers) {
        	Notification.error({message: "There was an error while uploading "+fileItem.file.name, templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 10000});
        };
        
        vsUploader.onCompleteItem = function(fileItem, response, status, headers) {
        	if (response.success ==false){
        		Notification.error({message: "The value set file you uploaded is not valid, please check and correct the error(s) and try again", templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 10000});
        		$scope.valueSetValidationErrors = angular.fromJson(response.errors);
        	}
        		
        };
        
        constraintsUploader.onCompleteItem = function(fileItem, response, status, headers) {
        	if (response.success ==false){
        		Notification.error({message: "The constraint file you uploaded is not valid, please check and correct the error(s) and try again", templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 10000});
        		$scope.constraintValidationErrors = angular.fromJson(response.errors);
        	}
        	
        };
        
        profileUploader.onCompleteItem = function(fileItem, response, status, headers) {
        	$scope.profileMessages = response.profiles;
        	if (response.success ==false){
        		Notification.error({message: "The profile file you uploaded is not valid, please check and correct the error(s) and try again", templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 10000});
        		$scope.profileValidationErrors = angular.fromJson(response.errors);
        	}
        };
        
        
        
       
        
        profileUploader.onAfterAddingAll = function(fileItem) {
        	if (profileUploader.queue.length > 1)
        	  {
        		profileUploader.removeFromQueue(0);
        	  }
        };
        
        vsUploader.onAfterAddingAll = function(fileItem) {
        	if (vsUploader.queue.length > 1)
        	  {
        		vsUploader.removeFromQueue(0);
        	  }
        };

        constraintsUploader.onAfterAddingAll = function(fileItem) {
        	if (constraintsUploader.queue.length > 1)
        	  {
        		constraintsUploader.removeFromQueue(0);
        	  }
        };
        
        
        $scope.getSelectedTestcases = function () {
        	return _.where($scope.profileMessages,{activated:true});
        };	
        
        $scope.profileCheckToggle = function () {
        	$scope.profileMessages.forEach(function(p) {
        	    p.activated = $scope.profileCheckToggleStatus;
        	});
        };	
        
        $scope.upload = function (value) {
        	$http.post('api/gvtupload/cleartestcases').then(function (result) {  	
        		$scope.profileValidationErrors = [];
        	    $scope.valueSetValidationErrors = [];
        	    $scope.constraintValidationErrors = [];
            	vsUploader.uploadAll();  	
            	constraintsUploader.uploadAll();     
            	profileUploader.uploadAll();
            }, function (error) {
            	Notification.error({message: error.data, templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 10000});
            });
        	
        };
        
        $scope.remove = function (value) {
        	$scope.profileValidationErrors = [];
    	    $scope.valueSetValidationErrors = [];
    	    $scope.constraintValidationErrors = [];
        	profileUploader.clearQueue();
        	vsUploader.clearQueue();
        	constraintsUploader.clearQueue();	
        };
        
        $scope.closeModal = function(){
        	$modalInstance.close();
        }

        $scope.addSelectedTestCases = function(){
        	$http.post('api/gvtupload/addtestcases', {testcasename: $scope.testcase.name,testcasedescription: $scope.testcase.description, testcases:$scope.getSelectedTestcases()}).then(function (result) {  		
                Notification.success({message: "Test Cases saved !", templateUrl: "NotificationSuccessTemplate.html", scope: $rootScope, delay: 5000});
                $modalInstance.close();
        	}, function (error) {
            	Notification.error({message: error.data, templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 10000});
            });
        }
        
        $scope.clearTestCases = function(){
        	$http.post('api/gvtupload/cleartestcases').then(function (result) {  	
        		$scope.profileMessages.length =0;
                Notification.success({message: "Test Cases cleared !", templateUrl: "NotificationSuccessTemplate.html", scope: $rootScope, delay: 5000});
            }, function (error) {
            	Notification.error({message: error.data, templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 10000});
            });
        }
        
        $scope.getTotalProgress = function () {
        	var numberOfactiveQueue = 0;
        	var progress = 0;
        	if (profileUploader.queue.length > 0){
        		numberOfactiveQueue++;
        		progress +=profileUploader.progress;
        		
        	}
        	if (vsUploader.queue.length > 0){
        		numberOfactiveQueue++;
        		progress +=vsUploader.progress;
        	}
        	if (constraintsUploader.queue.length > 0){
        		numberOfactiveQueue++;
        		progress +=constraintsUploader.progress;
        	}
        	return (progress)/numberOfactiveQueue;
        }	
        


    }]);



