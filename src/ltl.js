(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(jQuery, _) :
        typeof define === 'function' && define.amd ? define(["jQuery", "_"], factory) :
            global.ltl = factory(jQuery, _);
}(this, (function ($, _) {
    "use strict";
    var methods = ['get', 'delete', 'put', 'post'];

    function ltl() { }
    // ====================================== WEB HTTP ====================================== //
    // Local Location
    ltl.root = window.location.hostname;
    // WebAPP API Location
    ltl.web = function () { };
    ltl.web.root = window.location.hostname + "/api/";
    // API Location
    ltl.api = function () { };
    ltl.api.root = "localhost:54684/api/";
    // Instantiation of every method
    _.each(methods, function (method) {
        ltl[method] = ltl.web[method] = ltl.api[method] = function (controller, data, processPromise, callback) {
            var _this = this;

            // >> Default controller and data
            if (_.isEmpty(controller)) controller = "";
            if (_.isEmpty(data)) data = "";
            // >> Check if the root is present
            if (_.isEmpty(_this.root)) {
                console.error('[LTL] No Root Could Be Found');
                return;
            }

            var url = window.location.protocol + "//" + this.root + "/" + controller;

            
            // >> Process Data
            
            if (typeof data == 'string' || method == 'get') {
                url += data
                data = {};
            }
            // >> JS Promise
            var promise = new Promise(function (resolve, reject) {
                var jqxhr = $[method](url, data, function (response) {
                    console.log(response);
                    resolve(response);
                }).fail(function (reason) {
                    console.log(reason);
                    reject(reason);
                });
            });
            if (!processPromise || typeof callback != 'function') return promise;
            promise
                .then(function (response) {
                    return callback(null, response);
                })
                .catch(function (reason) {
                    console.log(reason);
                    reason = reason.responseJSON && reason.responseJSON.ExceptionMessage || reason.message || "";

                    return callback(reason);
                });
        }
    });

    // ====================================== NAVIGATION ====================================== //
    // >> Route navigation
    ltl.go = function (sections, data) {
        var url = "/";
        _.each(sections, function (section) {
            url += section + "/";
        });
        url += data || "";
        window.location.href = url;
    };
    ltl.loadJson = function (path, cb) {
        $
            .getJSON(path, function (doc) {
                return cb(null, doc);
            })
            .fail(function () {
                return cb('Unable To Load View Properties');
            });
    };
    
    return ltl;
})));