/**
* Created by haffo on 5/4/15.
*/


angular.module('hit-tool-directives').directive('profile-viewer', ['ngTreetableParams','$rootScope','ProfileService',function (ngTreetableParams,$rootScope,ProfileService) {
    return {
        restrict: 'E',
        require:'ngTreetableParams',
        scope: {
            type:null,
            testCase:null,
            profile: null,
            elements: [],
            nodeData: [],
            loading: false,
            error : null,
            relevance: true,
            trim: true,
            params:null,
            vocabEvent:'=',
            profileService: new ProfileService()
        },
        replace: true,
        template: '',
        link: function (scope,ngTreetableParams) {
            scope.getConstraintsAsString = function (constraints) {
                var str = '';
                for (var index in constraints) {
                    str = str + "<p style=\"text-align: left\">" + constraints[index].id + " - " + constraints[index].description + "</p>";
                }
                return str;
            };

            scope.showRefSegment = function (id) {
                if (scope.elements.length > 0 && id)
                    for (var i = 1; i < scope.elements.length; i++) {
                        var element = scope.elements[i];
                        if (element.id == id) {
                            scope.getNodeContent(element);
                        }
                    }
            };

            scope.show = function (node) {
                return !scope.relevance || (scope.relevance && node.relevent);
            };

            scope.showValueSetDefinition = function (tableId) {
                $rootScope.$broadcast(type+':showValueSetDefinition', tableId);
            };


            scope.init = function () {
                $rootScope.$on(type + ':testCaseLoaded', function (event, testCase) {
                if (scope.testCase.testContext != null && scope.testCase.testContext.profile.json != null && scope.testCase.testContext.profile.json != "") {
                        scope.loading = true;
                        scope.nodeData = [];
                        scope.loading = false;
                        scope.profile = scope.testCase.testContext.profile;
                        scope.elements = angular.fromJson(scope.profile.json).elements;

                        var datatypes = null;
                        var segments = [];

                        angular.forEach(scope.elements, function (element) {
                            if (element.name === 'Datatypes' && datatypes === null) {
                                datatypes = element;
                            }
                            if (element.type === 'SEGMENT') {
                                segments.push(element);
                            }
                        });
                        scope.profileService.setDatatypesTypesAndIcons(datatypes);
                        var valueSetIds = scope.profileService.getValueSetIds(segments, datatypes.children);
                        $rootScope.$broadcast('cb:valueSetIdsCollected', valueSetIds);
                        scope.nodeData = scope.elements[0];
                        scope.params.refresh();
                        scope.loading = false;
                    } else {
                        scope.loading = false;
                        scope.nodeData = [];
                        scope.elements = [];
                        scope.params.refresh();
                    }
                });
                scope.params = new ngTreetableParams({
                    getNodes: function (parent) {
                        return parent ? parent.children : scope.nodeData.children;
                    },
                    getTemplate: function (node) {
                        return 'TreeNode.html';
                    }
                });
            };

            scope.getNodeContent = function (selectedNode) {
                scope.nodeData = selectedNode;
                scope.params.refresh();
                //scope.params.expandAll();
            };
        }
    }
}]);