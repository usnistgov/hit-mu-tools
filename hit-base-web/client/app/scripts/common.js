/**
 * Created by haffo on 11/20/14.
 */



angular.module('commonServices').factory('TestContext', function ($http, $q) {
    var TestContext = function () {
        this.id = null;
    };

    TestContext.prototype.init = function (newTestContext) {
        this.id = newTestContext.id;
    };

    TestContext.prototype.clear = function () {
        this.id = null;
    };

    return TestContext;
});

angular.module('commonServices').factory('Editor', function ($http, $q) {
    var Editor = function () {
        this.instance = null;
        this.updateIndicator = '0';
        this.id = null;
        this.name = '';
    };

    Editor.prototype.notifyChange = function () {
        this.updateIndicator = new Date().getTime();
    };

    Editor.prototype.init = function (editor) {
        if (editor != undefined) {
            this.instance = editor;
        }
    };

    Editor.prototype.getContent = function () {
        if (this.instance != undefined) {
            return this.instance.doc.getValue();
        }
        return null;
    };

    Editor.prototype.setContent = function (content) {
        if (this.instance != undefined) {
            this.instance.doc.setValue(content);
            this.notifyChange();
        }
    };


    return Editor;
});

angular.module('commonServices').factory('XmlEditor', function (Editor) {
    var XmlEditor = function () {
        Editor.apply(this, arguments);
    };

    XmlEditor.prototype = Object.create(Editor.prototype);
    XmlEditor.prototype.constructor = XmlEditor;

    XmlEditor.prototype.format = function () {
        this.instance.doc.setValue(this.instance.doc.getValue().replace(/\n/g, "")
            .replace(/[\t ]+\</g, "<")
            .replace(/\>[\t ]+\</g, "><")
            .replace(/\>[\t ]+$/g, ">"));
        var totalLines = this.instance.lineCount();
        var totalChars = this.instance.getTextArea().value.length;
        this.instance.autoFormatRange({line: 0, ch: 0}, {line: totalLines, ch: totalChars});
    };

    return XmlEditor;
});


angular.module('commonServices').factory('EDICursor', function () {
    var EDICursor = function () {
        this.line = 1;
        this.startIndex = -1;
        this.endIndex = -1;
        this.index = -1;
        this.segment = "";
        this.updateIndicator = '0';
        this.triggerTree = undefined;
    };

    EDICursor.prototype.init = function (line, startIndex, endIndex, index, triggerTree) {
        this.line = line;
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        this.index = index;
        this.triggerTree = triggerTree;
        this.notify();
    };

    EDICursor.prototype.notify = function () {
        this.updateIndicator = new Date().getTime();
    };

    return EDICursor;
});


angular.module('commonServices').factory('XmlCursor', function () {
    var XmlCursor = function () {
        this.line = -1;
        this.start = {line: 1, index: -1};
        this.end = {line: 1, index: -1};
        this.updateIndicator = '0';
    };

    XmlCursor.prototype.setLine = function (line) {
        this.line = line;
        this.notify();
    };


    XmlCursor.prototype.toString = function (line) {
        return  this.line + "," + this.start + "," + this.end;
    };

    XmlCursor.prototype.notify = function () {
        this.updateIndicator = new Date().getTime();
    };


    return XmlCursor;
});


angular.module('commonServices').factory('ValidationResultItem', function () {
    var ValidationResultItem = function () {
        this.data = [];
        this.categories = [];
        this.categories.push({"title": "All", "data": []});
        this.show = true;
        this.updateIndicator = '0';
    };

    ValidationResultItem.prototype.init = function (data) {
        this.data = data;
        this.categories = [];
        this.categories.push({"title": "All", "data": []});
        this.show = true;
        this.notify();
    };
    ValidationResultItem.prototype.notify = function () {
        this.updateIndicator = new Date().getTime();
    };
    return ValidationResultItem;
});


angular.module('commonServices').factory('ValidationSettings', function () {
    var ValidationSettings = function () {
        this.errors = true;
        this.affirmatives = true;
        this.ignores = true;
        this.alerts = true;
        this.warnings = true;
    };
    return ValidationSettings;
});

angular.module('commonServices').factory('ValidationResult', function (ValidationResultItem, $q) {
    var ValidationResult = function (key) {
        this.key = key;
        this.xml = '';
        this.errors = new ValidationResultItem();
        this.affirmatives = new ValidationResultItem();
        this.ignores = new ValidationResultItem();
        this.alerts = new ValidationResultItem();
        this.warnings = new ValidationResultItem();
        this.informationals = new ValidationResultItem();
        this.id = '';
    };


    ValidationResult.prototype.updateId = function () {
        this.id = new Date().getTime();
    };


    ValidationResult.prototype.clear = function () {
        this.xml = '';
        this.errors = new ValidationResultItem();
        this.affirmatives = new ValidationResultItem();
        this.ignores = new ValidationResultItem();
        this.alerts = new ValidationResultItem();
        this.warnings = new ValidationResultItem();
        this.informationals = new ValidationResultItem();
        this.updateId();
    };

    ValidationResult.prototype.init = function (object) {
        this.xml = object.xml;
        this.errors.init(object.errors);
        this.affirmatives.init(object.affirmatives);
        this.ignores.init(object.ignores);
        this.alerts.init(object.alerts);
        this.warnings.init(object.warnings);
        this.informationals.init(object.informationals);
        this.updateId();
    };


    ValidationResult.prototype.saveState = function () {
        sessionStorage.setItem(this.key, this.content);
    };

    ValidationResult.prototype.restoreState = function () {
        this.content = sessionStorage.getItem(this.key);
    };
    ValidationResult.prototype.hasState = function () {
        return sessionStorage.getItem(this.key) !== {xml: ''} && sessionStorage.getItem(this.key) != null;
    };
    ValidationResult.prototype.getState = function () {
        return sessionStorage.getItem(this.key);
    };
    ValidationResult.prototype.getContent = function () {
        return  this.content;
    };
    ValidationResult.prototype.setContent = function (value) {
        this.content = value;
    };

    return ValidationResult;
});


angular.module('commonServices').factory('DQAValidationResult', function () {
    var DQAValidationResult = function (result) {
        this.errors = [];
        this.warnings = [];
        for (var i = 0; i < result['issuesList'].length; i++) {
            var issue = result['issuesList'][i];
            if (issue.type === 'Error') {
                this.errors.push(issue);
            } else {
                this.warnings.push(issue);
            }
        }
    };
    return DQAValidationResult;
});


angular.module('commonServices').factory('Profile', function ($http, $q) {
    var Profile = function () {
        this.id = null;
        this.xml = '';
        this.json = '';
        this.name = [];
        this.description = '';
    };

    Profile.prototype.notifyChange = function () {
        this.updateIndicator = new Date().getTime();
    };

    Profile.prototype.init = function (data) {
        this.id = data.id;
        this.xml = data.xml;
        this.json = null;
        this.name = data.name;
        this.description = data.description;
    };

    Profile.prototype.clear = function () {
        this.id = null;
        this.xml = null;
        this.json = null;
        this.name = null;
        this.description = null;
    };

    return Profile;
});


angular.module('commonServices').factory('Message', function ($http, $q) {
    var Message = function () {
        this.id = null;
        this.name = '';
        this.content = '';
        this.description = '';
        this.updateIndicator = "0";
    };

    Message.prototype.notifyChange = function () {
        this.updateIndicator = new Date().getTime();
    };


    Message.prototype.setContent = function (content) {
        this.content = content != undefined ? content : '';
        this.notifyChange();
    };

    Message.prototype.init = function (m) {
        this.id = m.id;
        this.name = m.name;
        this.description = m.description;
        this.setContent(m.content);
    };


    Message.prototype.download = function () {
        var form = document.createElement("form");
        form.action = "api/message/download";
        form.method = "POST";
        form.target = "_target";
        var input = document.createElement("textarea");
        input.name = "content";
        input.value = this.content;
        form.appendChild(input);
        form.style.display = 'none';
        document.body.appendChild(form);
        form.submit();
    };

    return Message;
});


angular.module('commonServices').factory('Tree', function () {
    var Tree = function () {
        this.id = null;
        this.root = {};
    };
    return Tree;
});

angular.module('commonServices').factory('Report', function ($http, $q) {
    var Report = function () {
        this.html = null;
    };
    Report.prototype.generate = function (url, xmlReport) {
        var delay = $q.defer();
        $http({
            url: url,
            data: $.param({'xmlReport': xmlReport}),
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
            method: 'POST',
            timeout: 60000
        }).success(function (data) {
            delay.resolve(angular.fromJson(data));
        }).error(function (err) {
            delay.reject(err);
        });
        return delay.promise;
    };

    Report.prototype.download = function (url, xmlReport) {
        var form = document.createElement("form");
        form.action = url;
        form.method = "POST";
        form.target = "_target";
        var input = document.createElement("textarea");
        input.name = "xmlReport";
        input.value = xmlReport;
        form.appendChild(input);
        form.style.display = 'none';
        document.body.appendChild(form);
        form.submit();
    };

    return Report;
});


angular.module('commonServices').factory('DataInstanceReport', function ($http, NewValidationReport) {
    var DataInstanceReport = function () {
        NewValidationReport.call(this, arguments);
    };
    DataInstanceReport.prototype = Object.create(NewValidationReport.prototype);
    DataInstanceReport.prototype.constructor = DataInstanceReport;
    DataInstanceReport.prototype.generateByFormat = function (json, format) {
        return this.generate("api/report/generateAs/" + format, json);
    };
    DataInstanceReport.prototype.downloadByFormat = function (json, format) {
        return this.generate("api/report/downloadAs/" + format, json);
    };
    return DataInstanceReport;
});


angular.module('commonServices').factory('MessageValidator', function ($http, $q, HL7EditorUtils) {
    var MessageValidator = function () {
    };
    MessageValidator.prototype.validate = function (testContextId, content) {
        var delay = $q.defer();
             $http.post('api/testcontext/'+ testContextId + '/validateMessage', angular.fromJson({"content": content})).then(
                function (object) {
                    try {
                        delay.resolve(angular.fromJson(object.data));
                    } catch (e) {
                        delay.reject("Invalid character in the message");
                    }
                },
                function (response) {
                    delay.reject(response.data);
                }
            );

//        $http.get('../../resources/cb/messageValidationResult.json', angular.fromJson({"content": content})).then(
//            function (object) {
//                delay.resolve(angular.fromJson(object.data));
//            },
//            function (response) {
//                delay.reject(response.data);
//            }
//        );


         return delay.promise;
    };

    return MessageValidator;
});

angular.module('commonServices').factory('MessageParser', function ($http, $q, HL7EditorUtils) {
    var MessageParser = function () {
    };
    MessageParser.prototype.parse = function (testContextId, content) {
        var delay = $q.defer();
        $http.post('api/testcontext/' + testContextId + '/parseMessage', angular.fromJson({"content": content})).then(
            function (object) {
                delay.resolve(angular.fromJson(object.data));
            },
            function (response) {
                delay.reject(response.data);
            }
        );

//        $http.get('../../resources/cb/messageObject.json', angular.fromJson({"content": content})).then(
//            function (object) {
//                delay.resolve(angular.fromJson(object.data));
//            },
//            function (response) {
//                delay.reject(response.data);
//            }
//        );

        return delay.promise;
    };

    return MessageParser;
});





angular.module('commonServices').factory('NewValidationReport', function ($http, $q) {
    var NewValidationReport = function () {
        this.content = {
            metaData: {},
            result: {}
        }
    };
    NewValidationReport.prototype.download = function (url) {
        var form = document.createElement("form");
        form.action = url;
        form.method = "POST";
        form.target = "_target";
        var input = document.createElement("textarea");
        input.name = "jsonReport";
        input.value = this.content;
        form.appendChild(input);
        form.style.display = 'none';
        document.body.appendChild(form);
        form.submit();
    };


    NewValidationReport.prototype.generate = function (url) {
        var delay = $q.defer();
        $http({
            url: url,
            data: $.param({'jsonReport': this.content }),
            headers: {'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'},
            method: 'POST',
            timeout: 60000
        }).success(function (data) {
            delay.resolve(angular.fromJson(data));
        }).error(function (err) {
            delay.reject(err);
        });
        return delay.promise;
    };


    return NewValidationReport;
});



angular.module('commonServices').factory('Logger', function () {
    var Logger = function () {
        this.content = '';
    };

    Logger.prototype.log = function (value) {
        this.content = this.content + "\n" + this.getCurrentTime() + ":" + value;
    };

    Logger.prototype.clear = function () {
        this.content = '';
    };

    Logger.prototype.init = function () {
        this.clear();
    };


    Logger.prototype.getCurrentTime = function () {
        var now = new Date();
        return (((now.getMonth() + 1) < 10) ? "0" : "") + (now.getMonth() + 1) + "/" + ((now.getDate() < 10) ? "0" : "") + now.getDate() + "/" + now.getFullYear() + " - " +
            ((now.getHours() < 10) ? "0" : "") + now.getHours() + ":" + ((now.getMinutes() < 10) ? "0" : "") + now.getMinutes() + ":" + ((now.getSeconds() < 10) ? "0" : "") + now.getSeconds();
    };
    return Logger;
});


angular.module('commonServices').factory('Endpoint', function () {
    var Endpoint = function () {
        this.value = null;
    };

    var Endpoint = function (url) {
        this.value = url;
    };

    return Endpoint;
});

angular.module('commonServices').factory('SecurityFaultCredentials', function ($q, $http) {

    var SecurityFaultCredentials = function () {
        this.username = null;
        this.password = null;
    };

    SecurityFaultCredentials.prototype.init = function (username, password) {
        this.username = username;
        this.password = password;
    };

    return SecurityFaultCredentials;
});


angular.module('commonServices').factory('Clock', function ($interval) {
    var Clock = function (intervl) {
        this.value = undefined;
        this.intervl = intervl;
    };
    Clock.prototype.start = function (fn) {
        if (angular.isDefined(this.value)) {
            this.stop();
        }
        this.value = $interval(fn, this.intervl);
    };
    Clock.prototype.stop = function () {
        if (angular.isDefined(this.value)) {
            $interval.cancel(this.value);
            this.value = undefined;
        }
    };
    return Clock;
});



