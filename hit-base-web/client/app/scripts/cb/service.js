'use strict';


angular.module('cb').factory('CB',
    ['Message', 'ValidationSettings', 'Tree', 'StorageService', 'CBCommunicationUser', 'Logger', function (Message, ValidationSettings,Tree,StorageService,CBCommunicationUser,Logger) {

        var initUser = function(){
            var user = new CBCommunicationUser();
            user.receiverUsername = StorageService.get(StorageService.RECEIVER_USERNAME_KEY);
            user.receiverPassword = StorageService.get(StorageService.RECEIVER_PWD_KEY);
            user.receiverFacilityId = StorageService.get(StorageService.RECEIVER_FACILITYID_KEY);
            user.receiverEndpoint = StorageService.get(StorageService.RECEIVER_ENDPOINT_KEY);
            return user;
        };

        var CB = {
            testCase: null,
            selectedTestCase: null,
            editor:null,
            tree: new Tree(),
            user:  initUser(),
            cursor: null,
            message: new Message(),
            logger: new Logger(),
            validationSettings: new ValidationSettings(),
            setContent: function (value) {
                CB.message.content = value;
                CB.editor.instance.doc.setValue(value);
                CB.message.notifyChange();
            },
            getContent: function () {
                return  CB.message.content;
            }
        };

        return CB;
    }]);


angular.module('cb').factory('CBTestCaseListLoader', ['$q','$http',
    function ($q,$http) {
        return function() {
            var delay = $q.defer();
            $http.get("api/cb/testcases").then(
                function (object) {
                    delay.resolve(angular.fromJson(object.data));
                },
                function (response) {
                    delay.reject(response.data);
                }
            );

//
//            $http.get("../../resources/erx/cb-testCases.json").then(
//                function (object) {
//                    delay.resolve(angular.fromJson(object.data));
//                },
//                function (response) {
//                    delay.reject(response.data);
//                }
//            );


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


angular.module('cb').factory('CBCommunicationUser', function (Endpoint, CBTransaction, $q, $http) {
    var CBCommunicationUser = function () {
        this.id = null;
        this.senderUsername = null; // tool auto generate or collect this at registration
        this.senderPassword = null; // tool auto generate or collect this at registration
        this.senderFacilityID = null;
        this.receiverUsername = null; // user enter this into the tool as a receiver
        this.receiverPassword = null; // user enter this into the tool as a receiver
        this.receiverFacilityId = null; // user enter this into the tool as a receiver
        this.receiverEndpoint = null; // user enter this into the tool as a receiver
        this.endpoint = new Endpoint();
        this.transaction = new CBTransaction();
    };

    CBCommunicationUser.prototype.init = function () {
        var delay = $q.defer();
        var self = this;
//        var data = angular.fromJson({"username": self.username, "tokenId": self.tokenId, "id": self.id});
        var data = angular.fromJson({"id": self.id});
        $http.post('api/transaction/initUser', data).then(
            function (response) {
                var user = angular.fromJson(response.data);
                self.id = user.id;
                self.senderUsername = user.username;
                self.senderPassword = user.password;
                self.senderFacilityID = user.facilityID;
                self.endpoint = new Endpoint(user.endpoint);
                self.transaction.init(self.senderUsername, self.senderPassword, self.senderFacilityID);
                delay.resolve(true);
            },
            function (response) {
                delay.reject(response);
            }
        );

//
//        $http.get('../../resources/cb/user.json').then(
//            function (response) {
//                var user = angular.fromJson(response.data);
//                self.id = user.id;
//                self.senderUsername = user.username;
//                self.senderPassword = user.password;
//                self.senderFacilityID = user.facilityID;
//        self.endpoint = new Endpoint(user.endpoint);
//                self.transaction.init(self.senderUsername, self.senderPassword, self.senderFacilityID);
//                delay.resolve(true);
//            },
//            function (response) {
//                delay.reject(response);
//            }
//        );

        return delay.promise;
    };


    return CBCommunicationUser;
});




angular.module('cb').factory('CBInitiator',
    ['$q', '$http', function ($q, $http) {

        var IsolatedSystemInitiator = function () {
        };

        IsolatedSystemInitiator.prototype.send = function (user, testCaseId, content) {
            var delay = $q.defer();
            var data = angular.fromJson({"testCaseId": testCaseId, "content": content, "endpoint": user.receiverEndpoint, "u": user.receiverUsername, "p": user.receiverPassword, "facilityId": user.receiverFacilityId});
            $http.post('api/isolated/soap/send', data, {timeout: 60000}).then(
                function (response) {
                    delay.resolve(angular.fromJson(response.data));
                },
                function (response) {
                    delay.reject(response);
                }
            );

//            $http.get('../../resources/cb/send.json').then(
//                function (response) {
//                    delay.resolve(angular.fromJson(response.data));
//                },
//                function (response) {
//                    delay.reject('Sorry,we did not get a response');
//                }
//            );
            return delay.promise;
        };


        return IsolatedSystemInitiator;
    }]);



angular.module('cb').factory('CBTransaction', function ($q, $http) {
    var CBTransaction = function () {
        this.username = null;
        this.running = false;
        this.password = null;
        this.facilityID = null;
        this.incoming = null;
        this.outgoing = null;
    };

    CBTransaction.prototype.messages = function () {
        var delay = $q.defer();
        var self = this;
        var data = angular.fromJson({"username": self.username, "password": self.password, "facilityID": self.facilityID});
        $http.post('api/transaction', data).then(
            function (response) {
                var transaction = angular.fromJson(response.data);
                self.incoming = transaction.incoming;
                self.outgoing = transaction.outgoing;
                delay.resolve(transaction);
            },
            function (response) {
                delay.reject(null);
            }
        );

//        $http.get('../../resources/cb/transaction.json').then(
//            function (response) {
//                var transaction = angular.fromJson(response.data);
//                self.incoming = transaction.incoming;
//                self.outgoing = transaction.outgoing;
//                delay.resolve(transaction);
//            },
//            function (response) {
//                delay.reject(null);
//            }
//        );

        return delay.promise;
    };

    CBTransaction.prototype.init = function (username, password, facilityID) {
        this.clearMessages();
        this.username = username;
        this.password = password;
        this.facilityID = facilityID;
    };


    CBTransaction.prototype.clearMessages = function () {
        this.incoming = null;
        this.outgoing = null;
    };

    CBTransaction.prototype.closeConnection = function () {
        var self = this;
        var delay = $q.defer();
        var data = angular.fromJson({"username": self.username, "password": self.password, "facilityID": self.facilityID});
        $http.post('api/transaction/close', data).then(
            function (response) {
                self.running = true;
                self.clearMessages();
                delay.resolve(true);
            },
            function (response) {
                self.running = false;
                delay.reject(null);
            }
        );
//
//        $http.get('../../resources/cb/clearFacilityId.json').then(
//            function (response) {
//
//                self.clearMessages();
//                delay.resolve(true);
//            },
//            function (response) {
//                delay.reject(null);
//            }
//        );
        return delay.promise;
    };

    CBTransaction.prototype.openConnection = function (responseMessageId) {
        var self = this;
        var delay = $q.defer();
        var data = angular.fromJson({"username": self.username, "password": self.password, "facilityID": self.facilityID, "responseMessageId": responseMessageId});
        $http.post('api/transaction/open', data).then(
            function (response) {
                self.running = true;
                self.clearMessages();
                delay.resolve(true);
            },
            function (response) {
                self.running = false;
                delay.reject(null);
            }
        );

//        $http.get('../../resources/cb/initFacilityId.json').then(
//            function (response) {
//                self.running = true;
//                delay.resolve(true);
//            },
//            function (response) {
//                self.running = false;
//                delay.reject(null);
//            }
//        );


        return delay.promise;
    };
    return CBTransaction;
});


angular.module('cb').factory('CBExecutionService',
    ['$q', '$http', function ($q, $http) {

        var CBExecutionService = function () {
        };

        CBExecutionService.setExecutionStatus = function (step, value) {
            if(step != null)
                step.executionStatus = value;
        };

        CBExecutionService.getExecutionStatus = function (step) {
            return step != null ? step.executionStatus: undefined;
        };

        CBExecutionService.getValidationStatus = function (step) {
            return  step != null && step.validationReport && step.validationReport.result && step.validationReport.result.errors && step.validationReport.result.errors.categories[0] && step.validationReport.result.errors.categories[0].data ?  step.validationReport.result.errors.categories[0].data.length: -1;
        };

        CBExecutionService.getValidationResult = function (step) {
            return step != null && step.validationReport ? step.validationReport.result: undefined;
        };

        CBExecutionService.setExecutionMessage = function (step, value) {
            if(step != null)
                step.executionMessage = value;

        };

        CBExecutionService.getExecutionMessage = function (step) {
            return step != null ? step.executionMessage: undefined;
        };


        CBExecutionService.setMessageTree = function (step, value) {
            if(step != null)
                step.messageTree = value;
        };

        CBExecutionService.getMessageTree = function (step) {
            return step != null ? step.messageTree: undefined;
        };

        CBExecutionService.getValidationReport = function (step) {
            return step != null ? step.validationReport: undefined;
        };

        CBExecutionService.setValidationReport = function (step, value) {
            step.validationReport = value;
        };


        CBExecutionService.deleteExecutionStatus = function (step) {
            if(step != null)
                delete step.executionStatus;
        };

        CBExecutionService.deleteValidationReport = function (step) {
            if(step && step.validationReport) {
                delete step.validationReport ;
            }
        };

        CBExecutionService.deleteExecutionMessage = function (step) {
            if(step && step.executionMessage) {
                delete step.executionMessage;
            }
        };

        CBExecutionService.deleteMessageTree = function (step) {
            if(step && step.messageTree) {
                delete step.messageTree;
            }
        };



        return CBExecutionService;
    }]);



angular.module('cb').factory('CBClock', function ($interval, Clock) {
    return new Clock(1000);
});




