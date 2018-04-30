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

            var url = this.root + controller;


            // >> Process Data

            if (typeof data === 'string' || method === 'get') {
                url += "/" + data
                data = {};
            }
            // >> JS Promise
            var promise = new Promise(function (resolve, reject) {
                var jqxhr = $[method](url, data, function (response) {
                    console.log(response);
                    resolve(response);
                }).fail(function (reason) {
                    console.log(reason);
                    reason = reason.responseJSON && reason.responseJSON.ExceptionMessage || reason.ExceptionMessage || reason.Message || typeof reason == 'string' && reason || "";
                    reject(reason);
                });
            });
            if (!processPromise || typeof callback !== 'function') return promise;
            promise
                .then(function (response) {
                    return callback(null, response);
                })
                .catch(function (reason) {
                    console.log(reason);
                    reason = reason.responseJSON && reason.responseJSON.ExceptionMessage || reason.ExceptionMessage || reason.Message || typeof reason == 'string' && reason || "";

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
    ltl.go.home = function () {
        var rol = ltl.Session('Id_Rol');

        switch (rol) {
            case "PASAJERO":
                ltl.go(["Lista", "Tarjetas"])
                break;
            default:
                ltl.go(["Home"])
                break;
        }
    }
    ltl.loadJson = function (path, cb) {
        $
            .getJSON(path)
            .done(function (doc) {
                return cb(null, doc);
            })
            .fail(function (reason) {
                return cb('Unable To Load JSON File');
            });
    };

    // ====================================== Error Handler ==================================== //
    ltl.Error = function (reason) {
        if (typeof data != 'string')
            reason = reason.responseJSON && reason.responseJSON.ExceptionMessage || reason.ExceptionMessage || reason.Message || typeof reason == 'string' && reason || "";

        if (swal.isVisible() && !swal.isLoading()) {
            swal.showValidationError(reason);
        } else {
            if ($("#alert_container")[0]) {
                $("#alert_container").removeClass("alert alert-success alert-dismissable");
                $("#alert_container").addClass("alert alert-danger alert-dismissable");
                $("#alert_message").text(reason);
                $('.alert').show();
            } else {

                swal.close();
                swal({
                    type: 'error',
                    title: 'Ha sucedido un error con la solicitud',
                    text: reason
                });
            }
        }


        console.error(reason);
    }
    ltl.Info = function (data) {
        var reason = data.responseJSON && data.responseJSON.ExceptionMessage || data.ExceptionMessage || data.Message || typeof reason == 'string' && reason || "";

        if (swal.isVisible()) {
            swal.resetValidationError();
            swal.close();
            swal({
                type: 'success',
                title: 'Solicitud procesada correctamente',
                text: reason
            });
        } else {
            if ($("#alert_container")[0]) {
                $("#alert_container").removeClass("alert alert-danger alert-dismissable");
                $("#alert_container").addClass("alert alert-success alert-dismissable");
                $("#alert_message").text(reason);
                $('.alert').show();
            } else {
                swal.resetValidationError();
                swal.close();
                swal({
                    type: 'success',
                    title: 'Solicitud procesada correctamente',
                    text: reason
                });
            }
        }

        console.log(reason);
    }

    ltl.NiceName = function (text) {
        return text.replace(/_/g, ' ')
            .replace(/(\w+)/g, function (match) {
                return match.charAt(0).toUpperCase() + match.slice(1);
            })
    }

    $(document).ready(function () {
        $('[data-toggle="tooltip"]').tooltip()
    });

    $.validator.setDefaults({
        ignore: []
    });

    return ltl;
})));