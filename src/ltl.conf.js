(function (factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(jQuery, _, moment, ltl) :
        typeof define === 'function' && define.amd ? define(["jQuery", "_", "moment", "ltl"], factory) :
            factory(jQuery, _, moment, ltl);
}(function ($, _, moment, ltl) {
    "use strict";


    // ====================================== SESSION ====================================== //
    var Conf = function (value, refresh) {
        if (typeof value === "object") {
            sessionStorage.setItem('configuracion', JSON.stringify(value));
        } else if (typeof value === "string") {
            var items = JSON.parse(sessionStorage.getItem('configuracion'));
            var res = _.findWhere(items, { Codigo : value });


            try {
                value = JSON.parse(res.Valor);
            } catch (ex) {
                console.warn('Item is Text', ex);
                value = res.Valor;
            }
            return value;
        } else {
            return JSON.parse(sessionStorage.getItem('configuracion'));
        }
    }
    Conf.Refresh = function () {
        ltl.web.post('configuracion/refresh', {}, true, function (err, res) {
            if (err || !res.Data) {
                ltl.Error(err || res);
                return;
            }
            // >> Set Session Storage Object
            sessionStorage.setItem('configuracion', JSON.stringify(res.Data));
            $(window).trigger('refresh_config');
        });
    }
    ltl.Conf = Conf;

}));