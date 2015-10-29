'use strict';

angular.module('cb')
    .controller('CBTestingCtrl', ['$scope', '$window', '$rootScope', 'CB', 'StorageService', function ($scope, $window, $rootScope, CB, StorageService) {

        $scope.init = function () {
            var tab = StorageService.get(StorageService.ACTIVE_SUB_TAB_KEY);
            if (tab == null || tab != '/cb_execution') tab = '/cb_testcase';
            $rootScope.setSubActive(tab);
        };

        $scope.getTestType = function () {
            return CB.testCase.type;
        };

        $scope.disabled = function () {
            return CB.testCase == null || CB.testCase.id === null;
        };

    }]);


angular.module('cb')
    .controller('CBExecutionCtrl', ['$scope', '$window', '$rootScope', '$timeout', function ($scope, $window, $rootScope, $timeout) {
        $scope.loading = false;
        $scope.error = null;
        $scope.tabs = new Array();
        $scope.testCase = null;
        $scope.setActiveTab = function (value) {
            $scope.tabs[0] = false;
            $scope.tabs[1] = false;
            $scope.tabs[2] = false;
            $scope.tabs[3] = false;
            $scope.activeTab = value;
            $scope.tabs[$scope.activeTab] = true;
        };

        $scope.getTestType = function () {
            return $scope.testCase != null ? $scope.testCase.type : '';
        };

        $scope.init = function () {
            $scope.error = null;
            $scope.setActiveTab(0);
            $rootScope.$on('cb:testCaseLoaded', function (event, testCase, tab) {
                $scope.loading = true;
                $timeout(function () {
                    $rootScope.setSubActive(tab && tab != null ? tab : '/cb_execution');
                    $scope.testCase = testCase;
                    $rootScope.$broadcast('cb:profileLoaded', $scope.testCase.testContext.profile);
                    $rootScope.$broadcast('cb:valueSetLibraryLoaded', $scope.testCase.testContext.vocabularyLibrary);
                    $scope.loading = false;
                });
            });
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
//                        $scope.selectTestCase(testCase);
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
                        $scope.loadTestCase(testCase, tab,false);
                    }
                }
                $scope.loading = false;
            }, function (error) {
                $scope.loading = false;
                $scope.error = "Sorry,cannot load the test cases. Please refresh your page and try again.";
            });
        };

        $scope.refreshEditor = function () {
            $timeout(function () {
                if ($scope.editor) {
                    $scope.editor.refresh();
                }
            }, 1000);
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
                $rootScope.$broadcast('cb:testCaseSelected', $scope.selectedTestCase);
                $scope.loadingTC = false;
            });
        };

        $scope.selectNode = function (id, type) {
            $timeout(function () {
                testCaseService.selectNodeByIdAndType($scope.tree, id, type);
            }, 0);
        };


        $scope.selectTestPlan = function (node) {
            if ($scope.selectedTestCase == null || $scope.selectedTestCase.id != node.id) {
                $scope.selectedTestCase = node;
            }
        };


        $scope.loadTestCase = function (testCase, tab,clear) {
            $timeout(function () {
                if (testCase.type === 'TestStep') {
                    CB.testCase = testCase;
                    $scope.testCase = CB.testCase;
                    var id = StorageService.get(StorageService.CB_LOADED_TESTCASE_ID_KEY);
                    var type = StorageService.get(StorageService.CB_LOADED_TESTCASE_TYPE_KEY);
                    StorageService.set(StorageService.CB_LOADED_TESTCASE_ID_KEY, $scope.testCase.id);
                    StorageService.set(StorageService.CB_LOADED_TESTCASE_TYPE_KEY, $scope.testCase.type);
                    if(clear === undefined || clear === true){
                        StorageService.remove(StorageService.CB_EDITOR_CONTENT_KEY);
                    }
                    $rootScope.$broadcast('cb:testCaseLoaded', $scope.testCase, tab);
                }
            });
        };

        $scope.expand = function (event) {

        };


    }]);

angular.module('cb')
    .controller('CBProfileViewerCtrl', ['$scope', 'CB', function ($scope, CB) {
        $scope.cb = CB;
    }]);


angular.module('cb')
    .controller('CBValidatorCtrl', ['$scope', '$http', 'CB', '$window', '$timeout', '$modal', 'NewValidationResult', '$rootScope', 'ServiceDelegator', 'StorageService', function ($scope, $http, CB, $window, $timeout, $modal, NewValidationResult, $rootScope, ServiceDelegator, StorageService) {

        $scope.cb = CB;
        $scope.testCase = CB.testCase;
        $scope.message = CB.message;
        $scope.selectedMessage = {};
        $scope.loading = true;
        $scope.error = null;
        $scope.vError = null;
        $scope.vLoading = true;
        $scope.mError = null;
        $scope.mLoading = true;
        $scope.validator = null;
        $scope.editorService = null;
        $scope.treeService = null;
        $scope.cursorService = null;
        $scope.parser = null;

        $scope.counter = 0;
        $scope.type = "cb";
        $scope.loadRate = 4000;
        $scope.tokenPromise = null;
        $scope.editorInit = false;
        $scope.nodelay = false;

        $scope.resized = false;
        $scope.selectedItem = null;
        $scope.activeTab = 0;

        $scope.messageObject = [];
        $scope.tError = null;
        $scope.tLoading = false;
        $scope.hasContent = function () {
            return  $scope.cb.message.content != '' && $scope.cb.message.content != null;
        };

        $scope.refreshEditor = function () {
            $timeout(function () {
                $scope.editor.refresh();
            }, 1000);
        };

        $scope.options = {
//            acceptFileTypes: /(\.|\/)(txt|text|hl7|json)$/i,
            paramName: 'file',
            formAcceptCharset: 'utf-8',
            autoUpload: true,
            type: 'POST'
        };

        $scope.$on('fileuploadadd', function (e, data) {
            if (data.autoUpload || (data.autoUpload !== false &&
                $(this).fileupload('option', 'autoUpload'))) {
                data.process().done(function () {
                    var fileName = data.files[0].name;
                    data.url = 'api/message/upload';
                    var jqXHR = data.submit()
                        .success(function (result, textStatus, jqXHR) {
                            $scope.nodelay = true;
                            var tmp = angular.fromJson(result);
                            $scope.cb.message.name = fileName;
                            $scope.cb.editor.instance.doc.setValue(tmp.content);
                            $scope.mError = null;
                            $scope.execute();
                        })
                        .error(function (jqXHR, textStatus, errorThrown) {
                            $scope.cb.message.name = fileName;
                            $scope.mError = 'Sorry, Cannot upload file: ' + fileName + ", Error: " + errorThrown;
                        })
                        .complete(function (result, textStatus, jqXHR) {

                        });
                });

            }
        });

        $scope.loadMessage = function () {
            var testCase = $scope.cb.testCase;
            var testContext = testCase.testContext;
            var message = $scope.cb.testCase.testContext.message;
            var messageContent = message ? message.content : null;
            if (testContext.message != null && messageContent != null && messageContent != "") {
                $scope.nodelay = true;
                $scope.selectedMessage = $scope.cb.testCase.testContext.message;
                if ($scope.selectedMessage != null && $scope.selectedMessage.content != null) {
                    $scope.editor.doc.setValue($scope.selectedMessage.content);
                } else {
                    $scope.editor.doc.setValue('');
                    $scope.cb.message.id = null;
                    $scope.cb.message.name = '';
                }
                $scope.execute();
            }
        };

        $scope.setLoadRate = function (value) {
            $scope.loadRate = value;
        };

        $scope.initCodemirror = function () {
            $scope.editor = CodeMirror.fromTextArea(document.getElementById("cb-textarea"), {
                lineNumbers: true,
                fixedGutter: true,
                readOnly: false,
                showCursorWhenSelecting: true
            });
            $scope.editor.setSize("100%", 345);

            $scope.editor.on("keyup", function () {
                $timeout(function () {
                    var msg = $scope.editor.doc.getValue();
                    if ($scope.tokenPromise) {
                        $timeout.cancel($scope.tokenPromise);
                        $scope.tokenPromise = undefined;
                    }
                    CB.message.name = null;
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
                    var line = editor.doc.getCursor(true).line + 1;
                    coordinate.lineNumber = coordinate.line;
                    coordinate.startIndex = coordinate.startIndex +1;
                    coordinate.endIndex = coordinate.endIndex +1;
                    $scope.cb.cursor.init(coordinate, true);
                    $scope.treeService.selectNodeByIndex($scope.cb.tree.root, CB.cursor, CB.message.content);
                });
            });
        };

        /**
         * Validate the content of the editor
         */
        $scope.validateMessage = function () {
            try {
                if ($scope.cb.testCase != null && $scope.cb.testCase.testContext != null && $scope.cb.message.content !== "") {
                    $scope.vLoading = true;
                    $scope.vError = null;
                    var validator = $scope.validator.validate($scope.cb.testCase.testContext.id, $scope.cb.message.content, $scope.cb.testCase.nav, "Based");
                    validator.then(function (mvResult) {
                        $scope.vLoading = false;
                        $scope.loadValidationResult(mvResult);
                    }, function (error) {
                        $scope.vLoading = false;
                        $scope.vError = error.data;
                        $scope.loadValidationResult(null);
                    });
                } else {
                    $scope.loadValidationResult(null);
                    $scope.vLoading = false;
                    $scope.vError = null;
                }
            } catch (error) {
                $scope.vLoading = false;
                $scope.vError = error.data;
                $scope.loadValidationResult(null);
            }
        };

        $scope.loadValidationResult = function (mvResult) {
            $timeout(function () {
                $rootScope.$broadcast('cb:validationResultLoaded', mvResult);
            });
        };

        $scope.clearMessage = function () {
            $scope.nodelay = true;
            $scope.mError = null;
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
                if ($scope.cb.testCase != null && $scope.cb.testCase.testContext != null && $scope.cb.message.content != '') {
                    $scope.tLoading = true;
                    var parsed = $scope.parser.parse($scope.cb.testCase.testContext.id, $scope.cb.message.content, $scope.cb.testCase.label);
                    parsed.then(function (value) {
                        $scope.tLoading = false;
                        $scope.cb.tree.root.build_all(value.elements);
                        ServiceDelegator.updateEditorMode($scope.editor, value.delimeters, $scope.testCase.testContext.format);
                        $scope.editorService.setEditor($scope.editor);
                        $scope.treeService.setEditor($scope.editor);
                    }, function (error) {
                        $scope.tLoading = false;
                        $scope.tError = error.data;
                    });
                } else {
                    if (typeof $scope.cb.tree.root.build_all == 'function') {
                        $scope.cb.tree.root.build_all([]);
                    }
                    $scope.tError = null;
                    $scope.tLoading = false;
                }
            } catch (error) {
                $scope.tError = null;
                $scope.tLoading = false;
            }
        };

        $scope.onNodeSelect = function (node) {
            $scope.treeService.getEndIndex(node, $scope.cb.message.content);
            $scope.cb.cursor.init(node.data, false);
            $scope.editorService.select($scope.editor, $scope.cb.cursor);
        };

        $scope.execute = function () {
            $scope.error = null;
            $scope.tError = null;
            $scope.mError = null;
            $scope.vError = null;
            $scope.cb.message.content = $scope.editor.doc.getValue();
            StorageService.set(StorageService.CB_EDITOR_CONTENT_KEY, $scope.cb.message.content);
            $scope.validateMessage();
            $scope.parseMessage();
        };

        $scope.init = function () {
            $scope.vLoading = false;
            $scope.tLoading = false;
            $scope.mLoading = false;
            $scope.error = null;
            $scope.tError = null;
            $scope.mError = null;
            $scope.vError = null;
            $scope.loadValidationResult(null);
            $scope.initCodemirror();

            $scope.$on('cb:refreshEditor', function (event) {
                $scope.refreshEditor();
            });
            $rootScope.$on('cb:testCaseLoaded', function (event, testCase) {
                $scope.testCase = testCase;
                if ($scope.testCase != null) {
                    var content = StorageService.get(StorageService.CB_EDITOR_CONTENT_KEY) == null ? '' : StorageService.get(StorageService.CB_EDITOR_CONTENT_KEY);
                    $scope.nodelay = true;
                    $scope.mError = null;
                    $scope.cb.editor = ServiceDelegator.getEditor($scope.testCase.testContext.format);
                    $scope.cb.editor.instance = $scope.editor;
                    $scope.cb.cursor = ServiceDelegator.getCursor($scope.testCase.testContext.format);
                    $scope.validator = ServiceDelegator.getMessageValidator($scope.testCase.testContext.format);
                    $scope.parser = ServiceDelegator.getMessageParser($scope.testCase.testContext.format);
                    $scope.editorService = ServiceDelegator.getEditorService($scope.testCase.testContext.format);
                    $scope.treeService = ServiceDelegator.getTreeService($scope.testCase.testContext.format);
                    $scope.cursorService = ServiceDelegator.getCursorService($scope.testCase.testContext.format);
                    if ($scope.editor) {
                        $scope.editor.doc.setValue(content);
                        $scope.execute();
                    }
                }
                $scope.refreshEditor();
            });
        };

    }])
;


angular.module('cb')
    .controller('CBReportCtrl', ['$scope', '$sce', '$http', 'CB', function ($scope, $sce, $http, CB) {
        $scope.cb = CB;
    }]);

angular.module('cb')
    .controller('CBVocabularyCtrl', ['$scope', 'CB', function ($scope, CB) {
        $scope.cb = CB;
    }]);

