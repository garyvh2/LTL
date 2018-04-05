(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(jQuery, _, ltl) :
        typeof define === 'function' && define.amd ? define(["jQuery", "_", "ltl"], factory) :
            global.ltl = factory(jQuery, _, ltl);
}(function ($, _, ltl) {
    "use strict";
    $.extend(ltl, {
        Session: null,
        UpdateSession: function () {
            $.post ()
        }
    });
}));