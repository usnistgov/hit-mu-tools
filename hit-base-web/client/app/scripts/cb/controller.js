'use strict';

angular.module('cb')
    .controller('CBTestingCtrl', ['$scope', '$window', '$rootScope', 'CB', 'StorageService', '$timeout', function ($scope, $window, $rootScope, CB, StorageService, $timeout) {

        $scope.testCaseLoaded = null;

        $scope.init = function () {
            var tab = StorageService.get(StorageService.ACTIVE_SUB_TAB_KEY);
            if (tab == null || tab != '/cb_execution') tab = '/cb_testcase';
            $rootScope.setSubActive(tab);

            $scope.$on('cb:testCaseLoaded', function (event, testCase, tab) {
                $scope.testCaseLoaded = testCase;
            });

        };

        $scope.setSubActive = function (tab) {
            $rootScope.setSubActive(tab);
            if (tab === '/cb_execution') {
                $scope.$broadcast('cb:refreshEditor');
            }
        };

    }]);


angular.module('cb')
    .controller('CBExecutionCtrl', ['$scope', '$window', '$rootScope', 'CB', '$modal', 'CBInitiator', 'CBClock', 'Endpoint', 'CBExecutionService', '$timeout', 'StorageService', function ($scope, $window, $rootScope, CB, $modal, CBInitiator, CBClock, Endpoint, CBExecutionService, $timeout, StorageService) {

        $scope.loading = false;
        $scope.error = null;
        $scope.tabs = new Array();
        $scope.testCase = null;
        $scope.testStep = null;
        $scope.logger = CB.logger;
        $scope.connecting = false;
        $scope.user = CB.user;
        $scope.endpoint = null;
        $scope.hidePwd = true;
        $scope.sent = null;
        $scope.received = null;
        $scope.configCollapsed = true;
        $scope.counterMax = 30;
        $scope.counter = 0;
        $scope.listenerReady = false;
        $scope.testStepListCollapsed = false;
        $scope.warning = null;

        var errors = [
            "Incorrect message Received. Please check the log for more details",
            "No Outbound message found",
            "Invalid message Received. Please see console for more details.",
            "Invalid message Sent. Please see console for more details."
        ];

        var parseRequest = function (incoming) {
//            var x2js = new X2JS();
//            var receivedJson = x2js.xml_str2json(incoming);
//            var receivedMessage = XMLUtil.decodeXml(receivedJson.Envelope.Body.submitSingleMessage.hl7Message.toString());
            return incoming;
        };

        var parseResponse = function (outbound) {
//            var x2js = new X2JS();
//            var sentMessageJson = x2js.xml_str2json(outbound);
//            var sentMessage = XMLUtil.decodeXml(sentMessageJson.Envelope.Body.submitSingleMessageResponse.return.toString());
            return outbound;
        };

        $scope.setActiveTab = function (value) {
            $scope.tabs[0] = false;
            $scope.tabs[1] = false;
            $scope.tabs[2] = false;
            $scope.tabs[3] = false;
            $scope.activeTab = value;
            $scope.tabs[$scope.activeTab] = true;
        };


        $scope.getTestType = function () {
            return CB.testCase.type;
        };

        $scope.disabled = function () {
            return CB.testCase == null || CB.testCase.id === null;
        };


        $scope.getTestType = function () {
            return $scope.testCase != null ? $scope.testCase.type : '';
        };


        $scope.initDataInstanceStep = function (testStep) {
            var testContext = testStep['testContext'];
            if (testContext && testContext != null) {
                $scope.setActiveTab(0);
                $timeout(function() {
                    $scope.$broadcast('cb:testStepLoaded', testStep);
                    $scope.$broadcast('cb:profileLoaded', testContext.profile);
                    $scope.$broadcast('cb:valueSetLibraryLoaded', testContext.vocabularyLibrary);
                });
            }
        };

        $scope.resetTestCase = function () {
            StorageService.remove(StorageService.CB_LOADED_TESTSTEP_TYPE_KEY);
            StorageService.remove(StorageService.CB_LOADED_TESTSTEP_ID_KEY);
            $scope.execTestCase($scope.testCase);
        };

        $scope.selectTestStep = function (testStep) {
            CB.testStep = testStep;
            $scope.testStep = testStep;
            StorageService.set(StorageService.CB_LOADED_TESTSTEP_TYPE_KEY, $scope.testStep.type);
            StorageService.set(StorageService.CB_LOADED_TESTSTEP_ID_KEY, $scope.testStep.id);
            if (testStep != null && !$scope.isManualStep(testStep)) {
                if (testStep.executionMessage === undefined && testStep['testingType'] === 'TA_INITIATOR') {
                    CBExecutionService.setExecutionMessage(testStep, testStep.testContext.message.content);
                }
                $scope.initDataInstanceStep(testStep);
            }
        };

        $scope.clearTestStep = function () {
            CB.testStep = null;
            $scope.testStep = null;
            $scope.$broadcast('isolated:removeTestStep');
        };


        $scope.getExecutionStatus = function (testStep) {
            return CBExecutionService.getExecutionStatus(testStep);
        };

        $scope.getValidationStatus = function (testStep) {
            return CBExecutionService.getValidationStatus(testStep);
        };


        $scope.isManualStep = function (testStep) {
            return testStep['testingType'] === 'TA_MANUAL' || testStep['testingType'] === 'SUT_MANUAL';
        };

        $scope.isSutInitiator = function (testStep) {
            return testStep['testingType'] == 'SUT_INITIATOR';
        };

        $scope.isStepCompleted = function (testStep) {
            return $scope.getExecutionStatus(testStep) == 'COMPLETE';
        };

        $scope.completeStep = function (row) {
            CBExecutionService.setExecutionStatus(row, 'COMPLETE');
        };

        $scope.completeManualStep = function (row) {
            $scope.completeStep(row);
        };

        $scope.progressStep = function (row) {
            CBExecutionService.setExecutionStatus(row, 'IN_PROGRESS');
        };


        $scope.executeNextTestStep = function (row) {
            $scope.testStepListCollapsed = false;
            if ($scope.isManualStep(row)) {
                $scope.completeStep(row);
            }
            if (!$scope.isLastStep(row)) {
                $scope.executeTestStep($scope.findNextStep(row.position));
            } else {
                $scope.completeTestCase();
            }
        };

        $scope.executeTestStep = function (testStep) {
            $scope.warning = null;
            $scope.logger.clear();
            if (testStep != null) {
                if (!$scope.isManualStep(testStep)) {
                    CBExecutionService.deleteValidationReport(testStep);
                    if ($scope.isSutInitiator(testStep)) {
                        CBExecutionService.setExecutionMessage(testStep, null);
                    }
//                    $timeout(function () {
//                        $rootScope.$broadcast('isolated:clearEditor');
//                    });
                }
                $scope.selectTestStep(testStep);
            }
        };


        $scope.completeTestCase = function () {
            $scope.testCase.executionStatus = 'COMPLETE';
            if (CB.editor.instance != null) {
                CB.editor.instance.setOption("readOnly", true);
            }
            $scope.clearTestStep();
        };

        $scope.isTestCaseCompleted = function () {
            return $scope.testCase && $scope.testCase.executionStatus === 'COMPLETE';
        };

        $scope.isTestStepCompleted = function (row) {
            return row != null && ((!$scope.isManualStep(row) && $scope.getExecutionStatus(row) == 'COMPLETE') || ($scope.isManualStep(row)));
        };

        $scope.shouldNextStep = function (row) {
            return $scope.testStep != null && $scope.testStep === row && !$scope.isTestCaseCompleted() && !$scope.isLastStep(row) && $scope.isTestStepCompleted(row);
        };

        $scope.isLastStep = function (row) {
            return row != null && $scope.testCase != null && $scope.testCase.children.length === row.position;
        };

        $scope.isTestCaseSuccessful = function () {
            if ($scope.testCase != null) {
                for (var i = 0; i < $scope.testCase.children.length; i++) {
                    if ($scope.getValidationStatus($scope.testCase.children[i]) > 0) {
                        return false;
                    }
                }
            }
            return true;
        };


        $scope.testStepSucceed = function (testStep) {
            return $scope.getValidationStatus(testStep) <= 0;
        };


        $scope.findNextStep = function (position) {
            var nextStep = null;
            for (var i = 0; i < $scope.testCase.children.length; i++) {
                if ($scope.testCase.children[i].position === position + 1) {
                    return  $scope.testCase.children[i];
                }
            }
            return null;
        };

        $scope.clearExecution = function () {
            if ($scope.testCase != null) {
                for (var i = 0; i < $scope.testCase.children.length; i++) {
                    var testStep = $scope.testCase.children[i];
                    CBExecutionService.deleteExecutionStatus(testStep);
                    CBExecutionService.deleteValidationReport(testStep);
                    CBExecutionService.deleteExecutionMessage(testStep);
                    CBExecutionService.deleteMessageTree(testStep);
                }
                delete $scope.testCase.executionStatus;
            }
        };

        $scope.setNextStepMessage = function (message) {
            var nextStep = $scope.findNextStep($scope.testStep.position);
            if (nextStep != null && !$scope.isManualStep(nextStep)) {
                $scope.completeStep(nextStep);
                CBExecutionService.setExecutionMessage(nextStep, message);
            }
        };


        $scope.log = function (log) {
            $scope.logger.log(log);
        };

        $scope.isValidConfig = function () {
            return $scope.user.receiverEndpoint != null && $scope.user.receiverEndpoint != '';
        };

        $scope.outboundMessage = function () {
            return $scope.testStep != null ? $scope.testStep.testContext.message.content : null;
        };

        $scope.isValidConfig = function () {
            return $scope.user != null && $scope.user.receiverEndpoint != null && $scope.user.receiverEndpoint != '';
        };
        $scope.hasRequestContent = function () {
            return  $scope.outboundMessage() != null && $scope.outboundMessage() != '';
        };

        $scope.send = function () {
            $scope.configCollapsed = false;
            $scope.connecting = true;
            $scope.progressStep($scope.testStep);
            $scope.error = null;
            if ($scope.user.receiverEndpoint != '' && $scope.hasRequestContent()) {
                $scope.logger.init();
                $scope.received = '';
                $scope.logger.logOutbound(0);
                var sender = new CBInitiator().send($scope.user, $scope.testStep.id, $scope.outboundMessage());
                sender.then(function (response) {
                    var received = response.incoming;
                    var sent = response.outgoing;
                    $scope.logger.logOutbound(1);
                    $scope.logger.log(sent);
                    $scope.logger.logOutbound(2);
                    $scope.logger.log(received);
                    try {
                        $scope.completeStep($scope.testStep);
                        var rspMessage = parseResponse(received);
                        $scope.logger.logOutbound(3);
                        $scope.setNextStepMessage(rspMessage);
                    } catch (error) {
                        $scope.error = errors[0];
                        $scope.logger.logOutbound(4);
                        $scope.logger.logOutbound(3);
                    }
                    $scope.connecting = false;
                }, function (error) {
                    $scope.connecting = false;
                    $scope.error = error.data;
                    $scope.logger.log("Error: " + error.data);
                    $scope.received = '';
                    $scope.completeStep($scope.testStep);
                    $scope.logger.logOutbound(5);
                });
            } else {
                $scope.error = errors[1];
                $scope.connecting = false;
            }
        };


        $scope.stopListening = function () {
            //$scope.configCollapsed = $scope.counter != $scope.counterMax;
            $scope.connecting = false;
            $scope.counter = $scope.counterMax;
            CBClock.stop();
            $scope.logger.logInbound(14);
            $scope.user.transaction.closeConnection().then(function (response) {
                $scope.logger.logInbound(13);
            }, function (error) {
            });
        };

        $scope.startListening = function () {
            var nextStep = $scope.findNextStep($scope.testStep.position);
            if (nextStep != null) {
                var rspMessageId = nextStep.testContext.message.id;
                $scope.configCollapsed = false;
                $scope.logger.clear();
                $scope.counter = 0;
                $scope.connecting = true;
                $scope.error = null;
                $scope.warning = null;
                var received = '';
                var sent = '';
                $scope.logger.logInbound(0);
                $scope.user.transaction.openConnection(rspMessageId).then(function (response) {
                        $scope.logger.logInbound(1);
                        var execute = function () {
                            ++$scope.counter;
                            $scope.logger.log($scope.logger.getInbound(2) + $scope.counter + "s");
                            $scope.user.transaction.messages().then(function (response) {
                                var incoming = $scope.user.transaction.incoming;
                                var outbound = $scope.user.transaction.outgoing;
                                if ($scope.counter < $scope.counterMax) {
                                    if (incoming != null && incoming != '' && received == '') {
                                        $scope.logger.logInbound(3);
                                        $scope.log(incoming);
                                        received = incoming;
                                        try {
                                            var receivedMessage = parseRequest(incoming);
                                            CBExecutionService.setExecutionMessage($scope.testStep, receivedMessage);
                                            $timeout(function () {
                                                $scope.$broadcast('isolated:setEditorContent', receivedMessage);
                                            });
                                        } catch (error) {
                                            $scope.error = errors[2];
                                            $scope.logger.logOutbound(4);
                                        }
                                    }
                                    if (outbound != null && outbound != '' && sent == '') {
                                        $scope.logger.logInbound(12);
                                        $scope.log(outbound);
                                        sent = outbound;
                                        try {
                                            var sentMessage = parseResponse(outbound);
                                            $scope.setNextStepMessage(sentMessage);
                                        } catch (error) {
                                            $scope.error = errors[3];
                                            $scope.logger.logOutbound(5);
                                            $scope.logger.logOutbound(6);
                                        }
                                    }
                                    if (incoming != '' && outbound != '' && incoming != null && outbound != null) {
                                        $scope.stopListening();
                                    }
                                } else {
                                    if (incoming == null || incoming == '') {
                                        $scope.warning = ConsoleService.getInboundLog(7);
                                        $scope.logger.logInbound(8);
                                    } else if (outbound == null || outbound == '') {
                                        $scope.logger.logInbound(9);
                                    }
                                    $scope.stopListening();
                                }
                            }, function (error) {
                                $scope.error = error;
                                $scope.log("Error: " + error);
                                $scope.received = '';
                                $scope.sent = '';
                                $scope.stopListening();
                            });
                        };
                        CBClock.start(execute);
                    }, function (error) {
                        $scope.logger.log($scope.logger.getInbound(10) + "Error: " + error);
                         $scope.logger.logInbound(11);
                        $scope.connecting = false;
                        $scope.error = error;
                    }
                );
            }
        };

//        $scope.configureReceiver = function () {
//            var modalInstance = $modal.open({
//                templateUrl: 'TransactionConfigureReceiver.html',
//                controller: 'CBConfigureReceiverCtrl',
//                resolve: {
//                    testCase: function () {
//                        return CB.testStep;
//                    },
//                    user: function () {
//                        return CB.user;
//                    }
//                }
//            });
//            modalInstance.result.then(function (user) {
//                CB.user.senderUsername = user.senderUsername;
//                CB.user.senderPassword = user.senderPassword;
//                CB.user.senderFacilityID = user.senderFacilityID;
//                CB.user.receiverUsername = user.receiverUsername;
//                CB.user.receiverPassword = user.receiverPassword;
//                CB.user.receiverFacilityId = user.receiverFacilityId;
//                CB.user.receiverEndpoint = user.receiverEndpoint;
//
//                StorageService.set(StorageService._RECEIVER_USERNAME_KEY,CB.user.receiverUsername);
//                StorageService.set(StorageService._RECEIVER_PWD_KEY,CB.user.receiverPassword);
//                StorageService.set(StorageService._RECEIVER_FACILITYID_KEY,CB.user.receiverFacilityId);
//                StorageService.set(StorageService._RECEIVER_ENDPOINT_KEY,CB.user.receiverEndpoint);
//
//                CB.response.setContent('');
//            }, function () {
//                CB.response.setContent('');
//            });
//        };


        $scope.downloadJurorDoc = function (jurorDocId, title) {
            var content = $("#" + jurorDocId).html();
            if (content && content != '') {
                var form = document.createElement("form");
                form.action = 'api/testartifact/generateJurorDoc/pdf';
                form.method = "POST";
                form.target = "_target";
                var input = document.createElement("textarea");
                input.name = "html";
                input.value = content;
                form.appendChild(input);

                var type = document.createElement("input");
                type.name = "type";
                type.value = "JurorDocument";
                form.style.display = 'none';
                form.appendChild(type);


                var nam = document.createElement("input");
                nam.name = "type";
                nam.value = title;
                form.style.display = 'none';
                form.appendChild(nam);

                document.body.appendChild(form);
                form.submit();
            }

        };


        $scope.downloadTestArtifact = function (path) {
            if ($scope.testCase != null) {
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
            }
        };

        $scope.init = function () {
            $scope.$on('cb:testCaseLoaded', function (event, testCase, tab) {
                $scope.execTestCase(testCase, tab);
            });
        };

        $scope.execTestCase = function (testCase, tab) {
            if (testCase != null) {
                $scope.loading = true;
                CB.testStep = null;
                $scope.testStep = null;
                $scope.setActiveTab(0);
                tab = tab && tab != null ? tab : '/cb_execution';
                $rootScope.setSubActive(tab);
                if (tab === '/cb_execution') {
                    $scope.$broadcast('cb:refreshEditor');
                }

                $timeout(function () {
                    $scope.clearExecution();
                    $scope.logger.clear();
                    $scope.error = null;
                    $scope.warning = null;
                    $scope.connecting = false;
                    CB.testCase = testCase;
                    $scope.testCase = testCase;
                    CBClock.stop();

                    $scope.user.transaction.closeConnection().then(function (response) {
                    }, function (error) {
                    });

                    $scope.user.init().then(function (response) {
                        $scope.endpoint = $scope.user.endpoint;
                    }, function (error) {
                    });

                    $scope.testCase = testCase;
                    if (testCase.type === 'TestCase') {
                        $scope.executeTestStep($scope.testCase.children[0]);
                    } else if (testCase.type === 'TestStep') {
                        $scope.setActiveTab(0);
                        CB.testStep = testCase;
                        $scope.testStep = testCase;
                        StorageService.set(StorageService.CB_LOADED_TESTSTEP_ID_KEY, $scope.testStep.id);
                        if (testCase.testingType === "DATAINSTANCE" || testCase.testingType === "TA_RESPONDER" || testCase.testingType === "TA_INITIATOR" || testCase.testingType === "SUT_RESPONDER" || testCase.testingType === "SUT_INITIATOR") {
                            $scope.initDataInstanceStep(testCase);
                        }
                    }
                    $scope.loading = false;
                });
            }
        };



    }]);


angular.module('cb')
    .controller('CBTestCaseCtrl', ['$scope', '$window', '$filter', '$rootScope', 'CB', '$timeout', 'CBTestCaseListLoader', '$sce', 'StorageService', 'TestCaseService', function ($scope, $window, $filter, $rootScope, CB, $timeout, CBTestCaseListLoader, $sce, StorageService, TestCaseService) {
        $scope.selectedTestCase = CB.selectedTestCase;
        $scope.testCase = CB.testCase;
        $scope.testCases = [];
        $scope.tree = {};
        $scope.loading = true;
        $scope.loadingTC = false;
        $scope.error = null;
        var testCaseService = new TestCaseService();
        $scope.init = function () {
            $scope.error = null;
            $scope.loading = true;
            var tcLoader = new CBTestCaseListLoader();
            tcLoader.then(function (testCases) {
                $scope.error = null;
                angular.forEach(testCases, function (testPlan) {
                    testCaseService.buildTree(testPlan);
                });
                $scope.testCases = testCases;
                if (typeof $scope.tree.build_all == 'function') {
                    $scope.tree.build_all($scope.testCases);
                    var testCase = null;
                    var id = StorageService.get(StorageService.CB_SELECTED_TESTCASE_ID_KEY);
                    var type = StorageService.get(StorageService.CB_SELECTED_TESTCASE_TYPE_KEY);
                    if (id != null && type != null) {
                        for (var i = 0; i < $scope.testCases.length; i++) {
                            var found = testCaseService.findOneByIdAndType(id, type, $scope.testCases[i]);
                            if (found != null) {
                                testCase = found;
                                break;
                            }
                        }
                        if (testCase != null) {
                            $scope.selectNode(id, type);
                        }
                    }

                    testCase = null;
                    id = StorageService.get(StorageService.CB_LOADED_TESTCASE_ID_KEY);
                    type = StorageService.get(StorageService.CB_LOADED_TESTCASE_TYPE_KEY);
                    if (id != null && type != null) {
                        for (var i = 0; i < $scope.testCases.length; i++) {
                            var found = testCaseService.findOneByIdAndType(id, type, $scope.testCases[i]);
                            if (found != null) {
                                testCase = found;
                                break;
                            }
                        }
                        if (testCase != null) {
                            var tab = StorageService.get(StorageService.ACTIVE_SUB_TAB_KEY);
                            $scope.loadTestCase(testCase, tab, false);
                        }
                    }
                } else {
                    $scope.error = "Ooops, Something went wrong. Please refresh your page. We are sorry for the inconvenience.";
                }
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                $scope.error = "Sorry, Cannot load the test cases. Please try again";
            });

        };


        $scope.isSelectable = function (node) {
            return true;
        };

        $scope.selectTestCase = function (node) {
            $scope.loadingTC = true;
            $scope.selectedTestCase = node;
            StorageService.set(StorageService.CB_SELECTED_TESTCASE_ID_KEY, node.id);
            StorageService.set(StorageService.CB_SELECTED_TESTCASE_TYPE_KEY, node.type);
            $timeout(function () {
                $scope.$broadcast('cb:testCaseSelected', $scope.selectedTestCase);
                $scope.loadingTC = false;
            });
        };

        $scope.selectNode = function (id, type) {
            $timeout(function () {
                testCaseService.selectNodeByIdAndType($scope.tree, id, type);
            }, 0);
        };

        $scope.loadTestCase = function (testCase, tab, clear) {
            var id = StorageService.get(StorageService.CB_LOADED_TESTCASE_ID_KEY);
            var type = StorageService.get(StorageService.CB_LOADED_TESTCASE_TYPE_KEY);
            StorageService.set(StorageService.CB_LOADED_TESTCASE_ID_KEY, testCase.id);
            StorageService.set(StorageService.CB_LOADED_TESTCASE_TYPE_KEY, testCase.type);
            if (clear === undefined || clear === true) {
                StorageService.remove(StorageService.CB_EDITOR_CONTENT_KEY);
            }
            $rootScope.$broadcast('cb:testCaseLoaded', testCase, tab);
        };
    }]);


angular.module('cb')
    .controller('CBValidatorCtrl', ['$scope', '$http', 'CB', '$window', '$timeout', '$modal', 'NewValidationResult', '$rootScope', 'ServiceDelegator', 'StorageService', 'CBExecutionService', function ($scope, $http, CB, $window, $timeout, $modal, NewValidationResult, $rootScope, ServiceDelegator, StorageService, CBExecutionService) {

        $scope.cb = CB;
        $scope.testStep = null;
        $scope.message = CB.message;
        $scope.loading = true;
        $scope.error = null;
        $scope.vError = null;
        $scope.vLoading = true;
        $scope.mError = null;
        $scope.mLoading = true;
        $scope.counter = 0;
        $scope.type = "cb";
        $scope.loadRate = 4000;
        $scope.tokenPromise = null;
        $scope.editorInit = false;
        $scope.nodelay = false;
        $scope.resized = false;
        $scope.selectedItem = null;
        $scope.activeTab = 0;
        $scope.tError = null;
        $scope.tLoading = false;

        $scope.isTestCase = function () {
            return CB.testCase != null && CB.testCase.type === 'TestCase';
        };


        $scope.refreshEditor = function () {
            $timeout(function () {
                if ($scope.editor)
                    $scope.editor.refresh();
            }, 1000);
        };

        $scope.loadExampleMessage = function () {
            if ($scope.testStep != null) {
                var testContext = $scope.testStep.testContext;
                if (testContext) {
                    var message = testContext.message && testContext.message != null ? testContext.message.content : '';
                    if($scope.isTestCase()) {
                        CBExecutionService.setExecutionMessage($scope.testStep, message);
                    }
                    $scope.nodelay = true;
                    $scope.cb.editor.instance.doc.setValue(message);
                    $scope.execute();
                }
            }
        };

        $scope.setLoadRate = function (value) {
            $scope.loadRate = value;
        };

        $scope.initCodemirror = function () {
            $scope.editor = CodeMirror.fromTextArea(document.getElementById("cb-textarea"), {
                lineNumbers: true,
                fixedGutter: true,
                theme: "elegant",
                readOnly: false,
                showCursorWhenSelecting: true
            });
            $scope.editor.setSize("100%", 345);

            $scope.editor.on("keyup", function () {
                $timeout(function () {
                    var msg = $scope.editor.doc.getValue();
                    $scope.error = null;
                    if ($scope.tokenPromise) {
                        $timeout.cancel($scope.tokenPromise);
                        $scope.tokenPromise = undefined;
                    }
                    if (msg.trim() !== '') {
                        $scope.tokenPromise = $timeout(function () {
                            $scope.execute();
                        }, $scope.loadRate);
                    } else {
                        $scope.execute();
                    }
                });
            });

            $scope.editor.on("dblclick", function (editor) {
                $timeout(function () {
                    var coordinate = $scope.cursorService.getCoordinate($scope.editor, $scope.cb.tree);
                    if (coordinate && coordinate != null) {
                        coordinate.lineNumber = coordinate.line;
                        coordinate.startIndex = coordinate.startIndex + 1;
                        coordinate.endIndex = coordinate.endIndex + 1;
                        $scope.cb.cursor.init(coordinate, true);
                        $scope.treeService.selectNodeByIndex($scope.cb.tree.root, CB.cursor, CB.message.content);
                    }
                });
            });
        };

        $scope.validateMessage = function () {
            try {
                if ($scope.testStep != null) {
                    if ($scope.cb.message.content !== '' && $scope.testStep.testContext != null) {
                        $scope.vLoading = true;
                        $scope.vError = null;
                        var validator = $scope.validator.validate($scope.testStep.testContext.id, $scope.cb.message.content, $scope.testStep.nav, "Based", [], "1223");
                        validator.then(function (mvResult) {
                            $scope.vLoading = false;
                            $scope.setValidationReport(mvResult);
                        }, function (error) {
                            $scope.vLoading = false;
                            $scope.vError = error;
                            $scope.setValidationReport(null);
                        });
                    } else {
                        $scope.setValidationReport(null);
                        $scope.vLoading = false;
                        $scope.vError = null;
                    }
                }
            } catch (error) {
                $scope.vLoading = false;
                $scope.vError = null;
                $scope.setValidationReport(null);
            }
        };

        $scope.setValidationReport = function (mvResult) {
            if ($scope.testStep != null) {
                if (mvResult != null) {
                    CBExecutionService.setExecutionStatus($scope.testStep, 'COMPLETE');
                }
                $rootScope.$broadcast('cb:validationResultLoaded', mvResult);
            }
        };

        $scope.setMessageTree = function (messageObject) {
            $scope.buildMessageTree(messageObject);
            var tree = messageObject && messageObject != null && messageObject.elements ? messageObject : undefined;
            CBExecutionService.setMessageTree($scope.testStep, tree);
        };

        $scope.buildMessageTree = function (messageObject) {
            if ($scope.testStep != null) {
                var elements = messageObject && messageObject != null && messageObject.elements ? messageObject.elements : [];
                if (typeof $scope.cb.tree.root.build_all == 'function') {
                    $scope.cb.tree.root.build_all(elements);
                }
                var delimeters = messageObject && messageObject != null && messageObject.delimeters ? messageObject.delimeters : [];
                ServiceDelegator.updateEditorMode($scope.editor, delimeters, $scope.testStep.testContext.format);
                $scope.editorService.setEditor($scope.editor);
                $scope.treeService.setEditor($scope.editor);
            }
        };

        $scope.clearMessage = function () {
            $scope.nodelay = true;
            $scope.mError = null;
            if ($scope.testStep != null) {
                CBExecutionService.deleteValidationReport($scope.testStep);
                CBExecutionService.deleteMessageTree($scope.testStep);
            }
            if ($scope.editor) {
                $scope.editor.doc.setValue('');
                $scope.execute();
            }
        };

        $scope.saveMessage = function () {
            $scope.cb.message.download();
        };

        $scope.parseMessage = function () {
            try {
                if ($scope.testStep != null) {
                    if ($scope.cb.message.content != '' && $scope.testStep.testContext != null) {
                        $scope.tLoading = true;
                        var parsed = $scope.parser.parse($scope.testStep.testContext.id, $scope.cb.message.content);
                        parsed.then(function (value) {
                            $scope.tLoading = false;
                            $scope.setMessageTree(value);
                        }, function (error) {
                            $scope.tLoading = false;
                            $scope.tError = error;
                            $scope.setMessageTree([]);
                        });
                    } else {
                        $scope.setMessageTree([]);
                        $scope.tError = null;
                        $scope.tLoading = false;
                    }
                }
            } catch (error) {
                $scope.tLoading = false;
                $scope.tError = error;
            }
        };

        $scope.onNodeSelect = function (node) {
            $scope.treeService.getEndIndex(node, $scope.cb.message.content);
            $scope.cb.cursor.init(node.data, false);
            $scope.editorService.select($scope.editor, $scope.cb.cursor);

        };

        $scope.execute = function () {
            if ($scope.tokenPromise) {
                $timeout.cancel($scope.tokenPromise);
                $scope.tokenPromise = undefined;
            }
            $scope.error = null;
            $scope.tError = null;
            $scope.mError = null;
            $scope.vError = null;
            $scope.cb.message.content = $scope.editor.doc.getValue();
            StorageService.set(StorageService.CB_EDITOR_CONTENT_KEY, $scope.cb.message.content);
            $scope.refreshEditor();
            if (!$scope.isTestCase() || !$scope.isTestCaseCompleted()) {
                CBExecutionService.setExecutionMessage($scope.testStep, $scope.cb.message.content);
                CBExecutionService.deleteValidationReport($scope.testStep);
                CBExecutionService.deleteMessageTree($scope.testStep);
                $scope.validateMessage();
                $scope.parseMessage();
            } else {
                $scope.setValidationReport(CBExecutionService.getValidationReport($scope.testStep));
                $scope.setMessageTree(CBExecutionService.getMessageTree($scope.testStep));
            }
        };

        $scope.clear = function () {
            $scope.vLoading = false;
            $scope.tLoading = false;
            $scope.mLoading = false;
            $scope.error = null;
            $scope.tError = null;
            $scope.mError = null;
            $scope.vError = null;
            $scope.setValidationReport(null);
        };

        $scope.init = function () {
            $scope.clear();
            $scope.initCodemirror();
            $scope.$on('cb:refreshEditor', function (event) {
                $scope.refreshEditor();
            });
            $scope.$on('cb:clearEditor', function (event) {
                $scope.clearMessage();
            });
            $rootScope.$on('cb:reportLoaded', function (event, report) {
                if ($scope.testStep != null) {
                    CBExecutionService.setValidationReport($scope.testStep, report);
                }
            });
            $scope.$on('cb:testStepLoaded', function (event, testStep) {
                $scope.clear();
                $scope.testStep = testStep;
                if ($scope.testStep.testContext != null) {
                    $scope.cb.editor = ServiceDelegator.getEditor($scope.testStep.testContext.format);
                    $scope.cb.editor.instance = $scope.editor;
                    $scope.cb.cursor = ServiceDelegator.getCursor($scope.testStep.testContext.format);
                    $scope.validator = ServiceDelegator.getMessageValidator($scope.testStep.testContext.format);
                    $scope.parser = ServiceDelegator.getMessageParser($scope.testStep.testContext.format);
                    $scope.editorService = ServiceDelegator.getEditorService($scope.testStep.testContext.format);
                    $scope.treeService = ServiceDelegator.getTreeService($scope.testStep.testContext.format);
                    $scope.cursorService = ServiceDelegator.getCursorService($scope.testStep.testContext.format);
                    var content = null;
                    if (!$scope.isTestCase()) {
                        $scope.nodelay = false;
                        content = StorageService.get(StorageService.CB_EDITOR_CONTENT_KEY) == null ? '' : StorageService.get(StorageService.CB_EDITOR_CONTENT_KEY);
                    } else {
                        $scope.nodelay = true;
                        content = CBExecutionService.getExecutionMessage($scope.testStep);
                        content = content && content != null ? content : '';
                    }
                    if ($scope.editor) {
                        $scope.editor.doc.setValue(content);
                        $scope.execute();
                    }
                }
            });

            $scope.$on('cb:removeTestStep', function (event, testStep) {
                $scope.testStep = null;
            });

            $scope.$on('cb:setEditorContent', function (event, message) {
                $scope.nodelay = true;
                var content = message == null ? '' : message;
                $scope.editor.doc.setValue(content);
                $scope.cb.message.id = null;
                $scope.cb.message.name = '';
                $scope.execute();
            });
        };

    }]);


angular.module('cb')
    .controller('CBProfileViewerCtrl', ['$scope', 'CB', function ($scope, CB) {
        $scope.cb = CB;
    }]);

angular.module('cb')
    .controller('CBReportCtrl', ['$scope', '$sce', '$http', 'CB', function ($scope, $sce, $http, CB) {
        $scope.cb = CB;
    }]);

angular.module('cb')
    .controller('CBVocabularyCtrl', ['$scope', 'CB', function ($scope, CB) {
        $scope.cb = CB;
    }]);

