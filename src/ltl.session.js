(function (factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(jQuery, _, moment, ltl) :
        typeof define === 'function' && define.amd ? define(["jQuery", "_", "moment", "ltl"], factory) :
            factory(jQuery, _, moment, ltl);
}(function ($, _, moment, ltl) {
    "use strict";


    // ====================================== SESSION ====================================== //
    var Session = function (value, refresh) {
        if (typeof value === 'object')
            sessionStorage.setItem('user_session', JSON.stringify(value));
        else if (typeof value === "string")
            return JSON.parse(sessionStorage.getItem('user_session'))[value];
        else
            return JSON.parse(sessionStorage.getItem('user_session'));
    }
    Session.Login = function (data, callback) {
        ltl.web.post('usuario/login', {
            Correo: data.email,
            Clave: data.password
        }, true, function (err, res) {
            if (err || !res.Data) {
                ltl.Error(err || res);
                return;
            }
            // >> Set Session Storage Object
            sessionStorage.setItem('user_session', JSON.stringify(res.Data));

            if (typeof callback == 'function') {
                callback(null, res.Data);
            }
        });
    }
    Session.Logout = function () {
        ltl.web.post('usuario/logout', {}, true, function (err, data) {
            if (err || !res.Data) {
                ltl.Error(err || res);
                return;
            }
            // >> Clear Session Storage Object
            sessionStorage.clear();
            ltl.go([]);
        });
    }
    Session.Refresh = function () {
        ltl.web.post('usuario/refresh', ltl.Session(), true, function (err, res) {
            if (err || !res.Data) {
                ltl.Error(err || res);
                return;
            }
            // >> Set Session Storage Object
            sessionStorage.setItem('user_session', JSON.stringify(res.Data));
            $(window).trigger('refresh_session');
        });
    }

    ltl.Session = Session;
}));