(function (factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(jQuery, _, moment, ltl) :
        typeof define === 'function' && define.amd ? define(["jQuery", "_", "moment", "ltl"], factory) :
            factory(jQuery, _, moment, ltl);
}(function ($, _, moment, ltl) {
    "use strict";


    // ====================================== TABLE ====================================== //
    var Table = function (tableId, service, formId) {
        var _this = this;
        // >> Form ID is invalid
        if (_.isEmpty(tableId))
            console.error('[LTL] Table Id is not valid');

        // Query Table
        _this.tableId = tableId;
        _this.service = service;
        _this.table = $('#' + tableId.replace(/\#/g, ""));

        // Query Form
        if (_.isEmpty(formId)) {
            console.warn('[LTL] No Form ID included');
        }
        else {
            _this.formId = formId;
            _this.form = new ltl.Form(formId);
        }


        // >> Unable to find the required form
        if (!_this.table[0])
            console.error('[LTL] Cannot find ' + table);

        // Initialize table
        _this.Fill();
        
        // >> Bind selected event
        _this.table.find('tbody').on('click', 'tr', function () {
            // >> Get Selected Data
            var data = _this.GetRowData(this);
            // >> Store selected row
            _this.SetSelected(data);
            // >> Set Form Data
            if (!!_this.form) {
                _this.form.SetData(data);
            }
        });

        return this;
    };
    Table.prototype.GetRowData = function (row) {
        var data = this.DataTable.row(row).data();

        console.log(data);

        return data;
    }
    Table.prototype.GetColumns = function () {
        this.columns = this.table.attr("ColumnsDataName").split(',');
        return this;
    }
    Table.prototype.Fill = function () {
        if (_.isEmpty (this.service)) {
            console.error('[LTL] No service specified');
            return;
        }
        // >> Get Table Columns
        this.GetColumns();

        // >> Prepare columns
        var arrayColumnsData = [];
        $.each(this.columns, function (index, value) {
            var obj = {};
            obj.data = value;
            arrayColumnsData.push(obj);
        });
        
        // >> Invoke DataTable
        this.DataTable = this.table.DataTable({
            processing: true,
            ajax: {
                url: window.location.protocol + "//" + ltl.api.root + this.service,
                dataSrc: 'Data'
            },
            columns: arrayColumnsData,
            rowReorder: {
                selector: 'td:nth-child(2)'
            },
            responsive: true
        });
    }
    Table.prototype.Reload = function () {
        this.table.DataTable().ajax.reload();
        return true;
    }
    Table.prototype.SetSelected = function (data) {
        sessionStorage.setItem(this.tableId + '-selected', data)
    }
    Table.prototype.GetSelected = function () {
        var data = sessionStorage.getItem(this.tableId + '_selected');
        return data;
    }

    ltl.Table = Table;
}));