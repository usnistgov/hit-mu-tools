'use strict';


angular.module('upload')
.controller('UploadCtrl', ['$scope', '$http', '$window', '$modal', '$filter', '$rootScope', '$timeout', 'StorageService', 'TestCaseService', 'TestStepService','FileUploader','Notification', function ($scope, $http, $window, $modal, $filter, $rootScope, $timeout, StorageService, TestCaseService, TestStepService, FileUploader, Notification){
		
	
		FileUploader.FileSelect.prototype.isEmptyAfterSelection = function() {
	        return true;
	    };
	    
	  
	
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
        
        
        

        profileUploader.onErrorItem = function(fileItem, response, status, headers) {
        	Notification.error({message: "There was an error while uploading "+fileItem.file.name, templateUrl: "NotificationErrorTemplate.html", scope: $rootScope, delay: 10000});
        };

        profileUploader.onCompleteItem = function(fileItem, response, status, headers) {
        	$scope.profileMessages = response.profiles;
        };
        
        profileUploader.onAfterAddingAll = function(fileItem) {
        	if (profileUploader.queue.length > 1)
        	  {
        		profileUploader.removeFromQueue(0);
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
        	profileUploader.uploadAll();
        	vsUploader.uploadAll();
        	constraintsUploader.uploadAll();
        	
        };
        
        $scope.remove = function (value) {
        	profileUploader.clearQueue();
        	vsUploader.clearQueue();
        	constraintsUploader.clearQueue();	
        };

        $scope.addSelectedTestCases = function(){
        	$http.post('api/gvtupload/addtestcases', $scope.getSelectedTestcases()).then(function (result) {  		
                Notification.success({message: "Test Cases saved !", templateUrl: "NotificationSuccessTemplate.html", scope: $rootScope, delay: 5000});
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


