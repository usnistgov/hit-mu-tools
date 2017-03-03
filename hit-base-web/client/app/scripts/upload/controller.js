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
	    
	    
		$scope.profileCheckToggleStatus = true;

        var profileUploader = $scope.profileUploader = new FileUploader({
            url: 'api/upload/uploadProfile',
            filters: [{
            	name: 'xmlFilter',
                fn: function(item) {
                    return /\/(xml)$/.test(item.type);
                }
            }]
        });
       
        var vsUploader = $scope.vsUploader = new FileUploader({
            url: 'api/upload/uploadVS',
            filters: [{
            	name: 'xmlFilter',
                fn: function(item) {
                    return /\/(xml)$/.test(item.type);
                }
            }]
        });
        
        var constraintsUploader = $scope.constraintsUploader = new FileUploader({
            url: 'api/upload/uploadContraints',
            filters: [{
            	name: 'xmlFilter',
                fn: function(item) {
                    return /\/(xml)$/.test(item.type);
                }
            }]
        });
        
        
        var zipUploader = $scope.zipUploader = new FileUploader({
            url: 'api/upload/uploadZip',
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
        		$scope.profileCheckToggle();
        	}      	
        };
        
        profileUploader.onBeforeUploadItem = function(fileItem) {
            fileItem.formData.push({token: $scope.token});
        };
        constraintsUploader.onBeforeUploadItem = function(fileItem) {
            fileItem.formData.push({token: $scope.token});
        };
        vsUploader.onBeforeUploadItem = function(fileItem) {
            fileItem.formData.push({token: $scope.token});
        };
        zipUploader.onBeforeUploadItem = function(fileItem) {
            fileItem.formData.push({token: $scope.token});
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
        		$scope.token = response.token;
        		$http.post('api/upload/uploadedProfiles', {token: $scope.token}).then(
      		          function (response) {
      		        	  if (response.data.success ==false){
      		          		if (response.data.debugError === undefined){
      		          			Notification.error({message: "The zip file you uploaded is not valid, please check and correct the error(s)", templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 10000});
      		              		$scope.profileValidationErrors = angular.fromJson(response.data.profileErrors);
      		              		$scope.valueSetValidationErrors = angular.fromJson(response.data.constraintsErrors);
      		              		$scope.constraintValidationErrors = angular.fromJson(response.data.vsErrors);
      		              	}else{
      		          			Notification.error({message: "  "+response.data.message+'<br>'+response.data.debugError, templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 10000});
      		          			$modalInstance.close();
      		          		}
      		          	}else{
      		          		$scope.profileMessages = response.data.profiles;
      		          		$scope.profileCheckToggle();
      		          	}
      		          },
      		          function (response) {
      		            
      		          }
      		      );	
        		
        		
        		
//        		$scope.profileMessages = response.profiles;
//        		$scope.token = response.token;
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
                $scope.token = $scope.generateUUID();
        		
        		$scope.profileValidationErrors = [];
        	    $scope.valueSetValidationErrors = [];
        	    $scope.constraintValidationErrors = [];
            	vsUploader.uploadAll();  	
            	constraintsUploader.uploadAll();     
            	profileUploader.uploadAll();      	
        };
        
        zipUploader.onBeforeUploadItem = function(fileItem) { 	
        		$scope.profileValidationErrors = [];
        	    $scope.valueSetValidationErrors = [];
        	    $scope.constraintValidationErrors = [];
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
        	$http.post('api/upload/addProfiles', {testcasename: $scope.testcase.name,testcasedescription: $scope.testcase.description, testcases:$scope.getSelectedTestcases(), token: $scope.token}).then(function (result) {  		
        		
        		if (result.data.status === "SUCCESS"){
                	Notification.success({message: "Test Cases saved !", templateUrl: "NotificationSuccessTemplate.html", scope: $rootScope, delay: 5000});
                	$modalInstance.close();
                }else{
                    Notification.error({message: result.data.message +'<br><br>Debug message:<br>'+result.data.debugError, templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 20000});
                }	
                $scope.loading = false;
        	}, function (error) {
        		$scope.loading = false;
            	Notification.error({message: error.data, templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 10000});
            });
        }
        
        $scope.clearTestCases = function(){
        	$http.post('api/upload/clearFiles',{token: $scope.token}).then(function (result) {  	
        		$scope.profileMessages.length =0;
        		zipUploader.clearQueue();
        		profileUploader.clearQueue();
            	vsUploader.clearQueue();
            	constraintsUploader.clearQueue();	
                Notification.success({message: "Profiles cleared!", templateUrl: "NotificationSuccessTemplate.html", scope: $rootScope, delay: 5000});
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
        
        $scope.generateUUID = function() {
            var d = new Date().getTime();
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = (d + Math.random()*16)%16 | 0;
                d = Math.floor(d/16);
                return (c=='x' ? r : (r&0x3|0x8)).toString(16);
            });
            return uuid;
        };


    }]);



angular.module('upload').controller('UploadTokenCtrl', ['$scope', '$http', 'CF', '$window', '$modal', '$filter', '$rootScope', 'CFTestCaseListLoader','CFUserTestCaseListLoader', '$timeout', 'StorageService', 'TestCaseService', 'TestStepService','userInfoService','Notification','modalService','$routeParams','$location','$modalInstance', function ($scope, $http, CF, $window, $modal, $filter, $rootScope, CFTestCaseListLoader, CFUserTestCaseListLoader, $timeout, StorageService, TestCaseService, TestStepService,userInfoService, Notification,modalService,$routeParams,$location,$modalInstance) {
	$scope.testcase = {};
	  
    $scope.profileValidationErrors = [];
    $scope.valueSetValidationErrors = [];
    $scope.constraintValidationErrors = [];
    
    $scope.profileCheckToggleStatus = true;
    
	$scope.token = $routeParams.x;	
	
	$scope.dismissModal = function(){
    	$modalInstance.dismiss();
    }
	
	if ($scope.token !== undefined){

		
		if (userInfoService.isAuthenticated()) {
		  $http.post('api/upload/uploadedProfiles', {token: $scope.token}).then(
		          function (response) {
		        	  if (response.data.success ==false){
		          		if (response.data.debugError === undefined){
		          			Notification.error({message: "The zip file you uploaded is not valid, please check and correct the error(s)", templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 10000});
		              		$scope.profileValidationErrors = angular.fromJson(response.data.profileErrors);
		              		$scope.valueSetValidationErrors = angular.fromJson(response.data.constraintsErrors);
		              		$scope.constraintValidationErrors = angular.fromJson(response.data.vsErrors);
		              	}else{
		          			Notification.error({message: "  "+response.data.message+'<br>'+response.data.debugError, templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 10000});
		          			$modalInstance.close();
		          		}
		          	}else{
		          		$scope.profileMessages = response.data.profiles;
		          		$scope.profileCheckToggle();
		          	}
		          },
		          function (response) {
		            
		          }
		      );
		}
	  		
		
	}
	
	
	
	$scope.addSelectedTestCases = function(){
    	$scope.loading = true;
    	$http.post('api/upload/addProfiles', {testcasename: $scope.testcase.name,testcasedescription: $scope.testcase.description, testcases:$scope.getSelectedTestcases(), token: $scope.token }).then(function (result) {  		
    		if (result.data.status === "SUCCESS"){
            	Notification.success({message: "Test Cases saved !", templateUrl: "NotificationSuccessTemplate.html", scope: $rootScope, delay: 5000});
            	$modalInstance.close();
            }else{
                Notification.error({message: result.data.message, templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 10000});
            }
            $scope.loading = false;
    	}, function (error) {
    		$scope.loading = false;
        	Notification.error({message: error.data, templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 10000});
        });
    }
	
	$scope.profileCheckToggle = function () {
    	$scope.profileMessages.forEach(function(p) {
    	    p.activated = $scope.profileCheckToggleStatus;
    	});
    };	
    
    $scope.getSelectedTestcases = function () {
    	return _.where($scope.profileMessages,{activated:true});
    };	

}]);

angular.module('upload').controller('UploadTokenCheckCtrl', ['$scope', '$http', 'CF', '$window', '$modal', '$filter', '$rootScope', 'CFTestCaseListLoader','CFUserTestCaseListLoader', '$timeout', 'StorageService', 'TestCaseService', 'TestStepService','userInfoService','Notification','modalService','$routeParams','$location', function ($scope, $http, CF, $window, $modal, $filter, $rootScope, CFTestCaseListLoader, CFUserTestCaseListLoader, $timeout, StorageService, TestCaseService, TestStepService,userInfoService, Notification,modalService,$routeParams,$location) {
	$scope.testcase = {};
	  
    $scope.profileValidationErrors = [];
    $scope.valueSetValidationErrors = [];
    $scope.constraintValidationErrors = [];
    
    $scope.profileCheckToggleStatus = false;
    
	$scope.token = decodeURIComponent($routeParams.x);	
	$scope.auth = decodeURIComponent($routeParams.y);	

	
	
	if ($scope.token !== undefined & $scope.auth !== undefined){
				
		
		//check if logged in
		if (!userInfoService.isAuthenticated()) {
			 $scope.$emit('event:loginRequestWithAuth', $scope.auth,'/addprofiles?x='+$scope.token);		
			
		}else{
			$location.url('/addprofiles?x='+$scope.token);
		}
	}
		

	


}]);


