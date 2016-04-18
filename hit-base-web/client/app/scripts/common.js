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
            TRANSPORT_CONFIG_KEY: 'TRANSPORT_CONFIG_KEY',
            ACTIVE_SUB_TAB_KEY: 'ACTIVE_SUB_TAB',
            CB_TESTCASE_LOADED_RESULT_MAP_KEY:'CB_TESTCASE_LOADED_RESULT_MAP_KEY',
            SETTINGS_KEY: 'SETTINGS_KEY',
            USER_KEY: 'USER_KEY',
            USER_CONFIG_KEY: 'USER_CONFIG_KEY',
            TRANSPORT_CONFIG_KEY: 'TRANSPORT_CONFIG_KEY',
            APP_STATE_TOKEN: 'APP_STATE_TOKEN',
            TRANSPORT_DISABLED:'TRANSPORT_DISABLED',
            TRANSPORT_PROTOCOL:'TRANSPORT_PROTOCOL',

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
            },
            getTransportConfig: function (domain,protocol) {
                return localStorageService.get(domain + "-" + protocol + "-transport-configs");
            },
            setTransportConfig: function (domain,protocol ,val) {
                return localStorageService.set(domain + "-" + protocol + "-transport-configs", val);
            }
        };
        return service;
    }]
);








