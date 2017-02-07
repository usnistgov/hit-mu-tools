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
            url: 'api/gvt/upload/uploadprofile',
            filters: [{
            	name: 'xmlFilter',
                fn: function(item) {
                    return /\/(xml)$/.test(item.type);
                }
            }]
        });
       
        var vsUploader = $scope.vsUploader = new FileUploader({
            url: 'api/gvt/upload/uploadvs',
            filters: [{
            	name: 'xmlFilter',
                fn: function(item) {
                    return /\/(xml)$/.test(item.type);
                }
            }]
        });
        
        var constraintsUploader = $scope.constraintsUploader = new FileUploader({
            url: 'api/gvt/upload/uploadcontraints',
            filters: [{
            	name: 'xmlFilter',
                fn: function(item) {
                    return /\/(xml)$/.test(item.type);
                }
            }]
        });
        
        
        var zipUploader = $scope.zipUploader = new FileUploader({
            url: 'api/gvt/upload/uploadzip',
            autoUpload: true,
            filters: [{
            	name: 'zipFilter',
                fn: function(item) {
                    return /\/(zip)$/.test(item.type);
                }
            }]
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
        	if (response.success ==false){
        		Notification.error({message: "The profile file you uploaded is not valid, please check and correct the error(s) and try again", templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 10000});
        		$scope.profileValidationErrors = angular.fromJson(response.errors);
        	}else{
        		$scope.profileMessages = response.profiles;
        	}
        	
        };
        
        
        zipUploader.onCompleteItem = function(fileItem, response, status, headers) {      	
        	if (response.success ==false){
        		if (response.debugError === undefined){
        			Notification.error({message: "The zip file you uploaded is not valid, please check and correct the error(s) and try again", templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 10000});
            		$scope.profileValidationErrors = angular.fromJson(response.profileErrors);
            		$scope.valueSetValidationErrors = angular.fromJson(response.constraintsErrors);
            		$scope.constraintValidationErrors = angular.fromJson(response.vsErrors);
            	}else{
        			Notification.error({message: "The tool could not upload and process your file.<br>"+response.message+'<br>'+response.debugError, templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 10000});
        		}
        	}else{
        		$scope.profileMessages = response.profiles;
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
        	$http.post('api/gvt/cleartestcases').then(function (result) {  	
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
        
        zipUploader.onBeforeUploadItem = function(fileItem) {
        	$http.post('api/gvt/cleartestcases').then(function (result) {  	
        		$scope.profileValidationErrors = [];
        	    $scope.valueSetValidationErrors = [];
        	    $scope.constraintValidationErrors = [];
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
        
        $scope.dismissModal = function(){
        	$modalInstance.dismiss();
        }

        $scope.addSelectedTestCases = function(){
        	$scope.loading = true;
        	$http.post('api/gvt/addtestcases', {testcasename: $scope.testcase.name,testcasedescription: $scope.testcase.description, testcases:$scope.getSelectedTestcases()}).then(function (result) {  		
        		if (result.data.status === "FAILURE"){
                	Notification.error({message: result.data.message, templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 10000});
                }else if (result.data.status === "FAILURE"){
                	Notification.success({message: "Test Cases saved !", templateUrl: "NotificationSuccessTemplate.html", scope: $rootScope, delay: 5000});                
                }   		
                $scope.loading = false;
                $modalInstance.close();
        	}, function (error) {
        		$scope.loading = false;
            	Notification.error({message: error.data, templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 10000});
            });
        }
        
        $scope.clearTestCases = function(){
        	$http.post('api/gvt/cleartestcases').then(function (result) {  	
        		$scope.profileMessages.length =0;
        		zipUploader.clearQueue();
        		profileUploader.clearQueue();
            	vsUploader.clearQueue();
            	constraintsUploader.clearQueue();	
                Notification.success({message: "Test Case cleared!", templateUrl: "NotificationSuccessTemplate.html", scope: $rootScope, delay: 5000});
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
        
        $scope.test = function () {
        	
        }	


    }]);



