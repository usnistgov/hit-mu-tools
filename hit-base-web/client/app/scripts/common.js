/**
 * Created by haffo on 11/20/14.
 */

angular.module('commonServices').factory('StorageService',
    ['$rootScope', 'localStorageService', function ($rootScope, localStorageService) {
        var service = {
            CF_EDITOR_CONTENT_KEY: 'CF_EDITOR_CONTENT',
            CF_LOADED_TESTCASE_ID_KEY: 'CF_LOADED_TESTCASE_ID',
            CF_LOADED_TESTCASE_TYPE_KEY: 'CF_LOADED_TESTCASE_TYPE',

            CB_EDITOR_CONTENT_KEY: 'CB_EDITOR_CONTENT',
            CB_SELECTED_TESTCASE_ID_KEY: 'CB_SELECTED_TESTCASE_ID',
            CB_SELECTED_TESTCASE_TYPE_KEY: 'CB_SELECTED_TESTCASE_TYPE',
            CB_LOADED_TESTCASE_ID_KEY: 'CB_LOADED_TESTCASE_ID',
            CB_LOADED_TESTCASE_TYPE_KEY: 'CB_LOADED_TESTCASE_TYPE',
            CB_LOADED_TESTSTEP_TYPE_KEY: 'CB_LOADED_TESTSTEP_TYPE_KEY',
            CB_LOADED_TESTSTEP_ID_KEY: 'CB_LOADED_TESTSTEP_ID',
            SENDER_USERNAME_KEY: 'SENDER_USERNAME',
            SENDER_PWD_KEY: 'SENDER_PWD',
            SENDER_ENDPOINT_KEY: 'SENDER_ENDPOINT',
            SENDER_FACILITYID_KEY: 'SENDER_FACILITYID',
            RECEIVER_USERNAME_KEY: 'RECEIVER_USERNAME',
            RECEIVER_PWD_KEY: 'RECEIVER_PWD',
            RECEIVER_ENDPOINT_KEY: 'RECEIVER_ENDPOINT',
            RECEIVER_FACILITYID_KEY: 'RECEIVER_FACILITYID',
            ACTIVE_SUB_TAB_KEY: 'ACTIVE_SUB_TAB',
            CB_TESTCASE_LOADED_RESULT_MAP_KEY:'CB_TESTCASE_LOADED_RESULT_MAP_KEY',
            SETTINGS_KEY: 'SETTINGS_KEY',

//            SENDER_USERNAME_KEY: 'SENDER_USERNAME',
//            SENDER_PWD_KEY: 'SENDER_PWD',
//            SENDER_ENDPOINT_KEY: 'SENDER_ENDPOINT',
//            SENDER_FACILITYID_KEY: 'SENDER_FACILITYID',
//
//            RECEIVER_USERNAME_KEY: 'RECEIVER_USERNAME',
//            RECEIVER_PWD_KEY: 'RECEIVER_PWD',
//            RECEIVER_ENDPOINT_KEY: 'RECEIVER_ENDPOINT',
//            RECEIVER_FACILITYID_KEY: 'RECEIVER_FACILITYID',

            remove: function (key) {
                return localStorageService.remove(key);
            },

            removeList: function removeItems(key1, key2, key3) {
                return localStorageService.remove(key1, key2, key3);
            },

            clearAll: function () {
                return localStorageService.clearAll();
            },
            set: function (key, val) {
                return localStorageService.set(key, val);
            },
            get: function (key) {
                return localStorageService.get(key);
            }
        };
        return service;
    }]
);







