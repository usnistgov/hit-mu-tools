/**
 * Created by haffo on 6/9/14.
 */
(function (angular) {
    'use strict';
    var mod = angular.module('hit-util');

    mod.factory('XMLUtil',
        [function () {
            var xml_special_to_escaped_one_map = {
                '&': '&',
                '"': '"',
                '&lt;': '&lt;',
                '>': '&gt;'
            };
            var escaped_one_to_xml_special_map = {
                '&': '&',
                '"': '"',
                '&lt;': '&lt;',
                '&gt;': '>'
            };
            var XMLUtil = {

                encodeXml: function (string) {
//                return string.replace(/([\&"&lt;>])/g, function (str, item) {
//                    return xml_special_to_escaped_one_map[item];
//                });
                    return string.replace(/&/g, '&amp;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&apos;');
                },

                decodeXml: function (string) {
//                return string.replace(/("|&lt;|&gt;|&)/g,
//                    function (str, item) {
//                        return escaped_one_to_xml_special_map[item];
//                    });
                    return string.replace(/&apos;/g, "'")
                        .replace(/&quot;/g, '"')
                        .replace(/&gt;/g, '>')
                        .replace(/&lt;/g, '<')
                        .replace(/&amp;/g, '&');

                }
            };

            return XMLUtil;
        }]);

});