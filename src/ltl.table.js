(function (factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(jQuery, _, moment, ltl) :
        typeof define === 'function' && define.amd ? define(["jQuery", "_", "moment", "ltl"], factory) :
            factory(jQuery, _, moment, ltl);
}(function ($, _, moment, ltl) {
    "use strict";


    // ====================================== TABLE ====================================== //
    var Table = function (tableId) {
        // >> Form ID is invalid
        if (_.isEmpty(tableId))
            console.error('[LTL] Form Id is not valid');

        // Query Form
        this.table = $('#' + tableId.replace(/\#/g, ""));

        // >> Unable to find the required form
        if (!this.table[0])
            console.error('[LTL] Cannot find ' + table);

        return this;
    };

    ltl.Table = Table;
}));