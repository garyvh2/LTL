(function (factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(jQuery, _, moment, ltl, async) :
        typeof define === 'function' && define.amd ? define(["jQuery", "_", "moment", "ltl", "async"], factory) :
            factory(jQuery, _, moment, ltl, async);
}(function ($, _, moment, ltl, async) {
    "use strict";


    // ====================================== TABLE ====================================== //
    var Table = function (tableId, service, formId, config) {
        var _this = this;
        // >> Form ID is invalid
        if (_.isEmpty(tableId))
            console.error('[LTL] Table Id is not valid');

        // Query Table
        _this.config = config || {};
        _this.tableId = tableId;
        _this.service = service;
        _this.table = $('#' + tableId.replace(/\#/g, ""));

        // Query Form
        if (_.isEmpty(formId)) {
            console.warn('[LTL] No Form ID included');
        }
        else {
            _this.formId = formId;
            _this.form = new ltl.Form(formId, _this.service, _this);
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
        var _this = this;
        if (_.isEmpty(_this.service)) {
            console.error('[LTL] No service specified');
            return;
        }
        // >> Get Table Columns
        _this.GetColumns();

        // >> Prepare columns
        var arrayColumnsData = [
            {
                data: null,
                defaultContent: ''
            },
            {
                data: null,
                defaultContent: ''
            }];
        $.each(_this.columns, function (index, value) {
            var obj = {};
            obj.data = value;
            obj.targets = index + 1;
            arrayColumnsData.push(obj);
        });

        // >> Invoke DataTable
        var ajax = {
            url: ltl.api.root + _this.service,
            dataSrc: 'Data'
        }

        // >> Table Buttons
        var buttons = [
            'copy',
            'excel',
            'pdf'
        ]

        // >> Disable top button
        if (!_this.config.disable_delete) {
            buttons.push({
                id: 'eliminarRows',
                text: 'Eliminar 0 Fila(s)',
                action: function (e, dt, node, config) {
                    var selected = _this.table.find('.selected');
                    if (selected.length <= 0)
                        swal(
                            'Ninguna fila ha sido seleccionada',
                            'That thing is still around?'
                        )

                    _this.EliminarSeleccionados();
                }
            });
        }

        // >> Include user session on table request
        if (_this.config.include_session) {
            ajax.data = function () {
                return JSON.stringify(ltl.Session());
            }
            ajax.contentType = "application/json";
            ajax.type = 'POST';
        }

        _this.DataTable = _this.table.DataTable({
            dom: 'Bfrtip',
            language: {
                "decimal": "",
                "emptyTable": "No hay información",
                "info": "Mostrando _START_ a _END_ de _TOTAL_ Entradas",
                "buttons": {
                    "copy": 'Copiar',
                    "copyTitle": 'Copiado al portapapeles',
                    "copyKeys": 'Presione <i> ctrl </ i> o <i> \ u2318 </ i> + <i> C </ i> para copiar los datos de la tabla al portapapeles. <br> <br> Para cancelar, haga clic en este mensaje o presione Esc.',
                    "copySuccess": {
                        _: '%d Filas copiadas',
                        1: '1 Fila copiada'
                    }
                },
                "infoEmpty": "Mostrando 0 to 0 of 0 Entradas",
                "infoFiltered": "(Filtrado de _MAX_ total entradas)",
                "infoPostFix": "",
                "thousands": ",",
                "lengthMenu": "Mostrar _MENU_ Entradas",
                "loadingRecords": "Cargando...",
                "processing": "Procesando...",
                "search": "Buscar:",
                "zeroRecords": "Sin resultados encontrados",
                "paginate": {
                    "first": "Primero",
                    "last": "Ultimo",
                    "next": "Siguiente",
                    "previous": "Anterior"
                },

                "select": {
                    "rows": {
                        _: "%d filas escogidas",
                        1: "1 fila escogida"
                    }
                }
            },
            processing: true,
            ajax: ajax,
            aaSorting: [
                [2, 'asc']
            ],
            colReorder: true,
            rowGroup: {
                dataSrc: 'Agrupar'
            },
            columns: arrayColumnsData,
            columnDefs: [
                {
                    data: null,
                    defaultContent: '',
                    className: 'control',
                    width: "40px",
                    orderable: false,
                    targets: 0
                },
                {
                    orderable: false,
                    className: 'select-checkbox',
                    width: "40px",
                    targets: 1
                }],
            select: {
                style: 'multi',
                selector: 'td:nth-child(2)'
            },
            buttons: buttons,
            responsive: {
                details: {
                    'type': 'column',
                    'target': 0
                }
            }
        });
        _this.DataTable.on('draw.dtSelect.dt select.dtSelect.dt deselect.dtSelect.dt info.dt', function (api) {
            if (!_this.config.disable_delete) {
                var selected = _this.DataTable.rows({ selected: true }).flatten().length;
                if (selected <= 0) {
                    // Delete
                    _this.DataTable.button(3).disable();
                    _this.DataTable.button(3).text("Eliminar 0 Fila(s)")
                } else {
                    // Delete
                    _this.DataTable.button(3).enable();
                    _this.DataTable.button(3).text(`Eliminar ${selected} Fila(s)`)

                }
            }

        })
        _this.DataTable.on("click", "th.select-checkbox", function () {
            if ($("th.select-checkbox").hasClass("selected")) {
                _this.DataTable.rows().deselect();
                $("th.select-checkbox").removeClass("selected");
            } else {
                _this.DataTable.rows().select();
                $("th.select-checkbox").addClass("selected");
            }
        }).on("select deselect", function () {
            if (_this.DataTable.rows({
                selected: true
            }).count() !== _this.DataTable.rows().count()) {
                $("th.select-checkbox").removeClass("selected");
            } else {
                $("th.select-checkbox").addClass("selected");
            }
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
    Table.prototype.EliminarSeleccionados = function () {
        var _this = this;
        var selected = _this.DataTable.rows({ selected: true }).flatten();
        swal({
            title: 'Eliminar',
            text: `Esta seguro que desea proceder a eliminar ${selected.length} fila(s) seleccionada(s)`,
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.value) {
                var selected = _this.DataTable.rows({ selected: true }).data();
                ltl.ProgressBar.Init(selected.length);
                async.each(selected, function (row, cb) {
                    ltl.api.delete(_this.service, row, true, function (err, res) {
                        if (err || !res)
                            return cb(err || res);


                        ltl.ProgressBar.Next();
                        return cb();
                    });
                },
                    function (err) {
                        if (err) {
                            ltl.ProgressBar.Complete();
                            ltl.Error(err);
                            return;
                        }
                        swal(
                            'Eliminadas',
                            '',
                            'success'
                        )
                        _this.Reload();
                    });
            }
        })
    }

    ltl.Table = Table;
}));