(function (factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(jQuery, _, moment, ltl) :
        typeof define === 'function' && define.amd ? define(["jQuery", "_", "moment", "ltl"], factory) :
            factory(jQuery, _, moment, ltl);
}(function ($, _, moment, ltl) {
    "use strict";


    // ====================================== FORMS ====================================== //
    var Form = function (formId) {
        // >> Form ID is invalid
        if (_.isEmpty(formId))
            console.error('[LTL] Form Id is not valid');

        // Query Form
        this.form = $('#' + formId.replace(/\#/g, ""));

        // >> Unable to find the required form
        if (!this.form[0])
            console.error('[LTL] Cannot find ' + formId);

        return this;
    };
    Form.prototype.GetInputs = function (common) {
        common = _.isEmpty(common) ? '.ltl_input' : common;
        // >> Get all 
        this.inputs = this.form.find(common);
        return this;
    }
    // ====================================== Get Data ====================================== //
    Form.prototype.GetData = function () {
        this.GetInputs();
        // >> Abort if there's not inputs
        if (_.isEmpty(this.inputs) || this.inputs.length == 0) {
            console.warn("[LTL] No Inputs found");
            return {};
        }

        var data = {};

        this.inputs.each(function () {
            var $this = $(this);
            var type = this.type || $this.attr('type');
            var name = $this.attr("ColumnDataName");

            if (_.isEmpty(name)) return;

            var value;
            switch (type) {
                case 'select-one':
                    value = Get_select_one($this);
                    break;
                case 'select-multiple':
                    value = Get_select_multiple($this);
                    break;
                case 'custom':
                    value = Get_custom($this);
                    break;
                default:
                    value = $this.val();
                    break;
            }
            data[name] = value;
        });

        return data;
    }
    var Get_custom = function (input) {
        var name = input.attr('GetCustomFunction');
        if (_.isEmpty(name)) return "";

        return input.data(name)();
    }
    var Get_select_one = function (input) {
        var value = input.val();
        return value === "null" ? null : value;
    }
    var Get_select_multiple = function (input) {
        var value = input.val();
        var MultipleSubId = input.attr("MultipleSubId");

        return _.map(value, function (el) {
            var obj = {};
            obj[MultipleSubId] = el;
            return obj;
        });
    }
    // ====================================== Set Data ====================================== //
    Form.prototype.SetData = function (data) {
        this.GetInputs();
        // >> Abort if there's not inputs
        if (_.isEmpty(this.inputs) || this.inputs.length == 0) {
            console.warn("[LTL] No Inputs found");
            return {};
        }

        if (_.isEmpty(data)) {
            console.warn ("[LTL] Didn't recieve data")
        }

        this.inputs.each(function () {
            var $this = $(this);
            var type = this.type || $this.attr('type');
            var name = $this.attr("ColumnDataName");

            if (_.isEmpty(name)) return;
            
            var value = data[name];;
            switch (type) {
                case 'select-one':
                    value = Set_select_one(value);
                    break;
                case 'select-multiple':
                    value = Set_select_multiple($this, value);
                    break;
                case 'custom':
                    Set_custom($this, value);
                    return;
                case 'date':
                    value = Set_date(value)
                default:
                    value = value;
                    break;
            }
            $this.val(value);
            $this.trigger('keyup.iconpicker');
        });

        return true;
    }
    var Set_custom = function (input, value) {
        var name = input.attr('SetCustomFunction');
        if (_.isEmpty(name)) return "";
        
        input.data(name)(value);
    }
    var Set_date = function (value) {
        return moment(value).format('YYYY-MM-DD');
    }
    var Set_select_one = function (value) {
        return value === null ? "null" : value;
    }
    var Set_select_multiple = function (input, value) {
        var MultipleSubId = input.attr("MultipleSubId");

        return _.map(value, function (el) {
            return el[MultipleSubId] || "";
        });
    }

    ltl.Form = Form;
}));