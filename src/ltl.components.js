(function (factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(jQuery, _, moment, ltl) :
        typeof define === 'function' && define.amd ? define(["jQuery", "_", "moment", "ltl"], factory) :
            factory(jQuery, _, moment, ltl);
}(function ($, _, moment, ltl) {
    "use strict";


    // ====================================== WEB COMPONENTS ====================================== //
    ltl.CardActivator = function (IdUsuario) {
        if (!$('.card-activator')[0]) {
            console.warn('Cannot Find .card-activator');
            return;
        }

        var regex = /[A-z0-9]{8}-([A-z0-9]{4}-){3}[A-z0-9]{12}/g;
        var Usuario = IdUsuario;


        $("#cardId").on("keyup", function (event) {
            $('.fa-credit-card').css({
                color: "#cbcbcb"
            });
            $('.submit-state').css({
                display: "none"
            });


            var selection = window.getSelection().toString();
            if (selection !== '') {
                return;
            }
            if ($.inArray(event.keyCode, [38, 40, 37, 39]) !== -1) {
                return;
            }

            var value = $(this).val();

            var valid = value.match(regex);
            if (!valid) {
                $("#valid-state").css({
                    background: "#F27474",
                    "border-color": "#FFA0A0"
                });
                $("#valid-state i").css({
                    color: "#AC2727"
                }).attr("class", "fas fa-times");
                $('#submitCard').attr('disabled', 'disabled');
            } else {
                $("#valid-state").css({
                    background: "#6EDD57",
                    "border-color": "#6EDD57"
                });
                $("#valid-state i").css({
                    color: "#167C00"
                }).attr("class", "fas fa-check");
                $('#submitCard').removeAttr('disabled');
            }
        });
        $('#submitCard').click(function (ev) {
            ev.preventDefault();
            $('.card-box i.fa-circle-notch').css({
                display: "table-cell"
            });
            $('.card-box i.fa-credit-card').css({
                display: "none"
            });
            $('#submitCard').attr('disabled', 'disabled');
            $('#submitCard').trigger('submit-card', [Usuario]);
            return false;
        });

        $(window).on('reject-card', function () {
            $('.card-box i.fa-circle-notch').css({
                display: "none"
            });
            $('.card-box i.fa-credit-card').css({
                display: "table-cell"
            });
            $('.fa-credit-card').css({
                color: "#F27474"
            });
            $('.submit-state').css({
                display: "block",
                color: "#AC2727"
            }).attr('class', 'submit-state fas fa-times-circle fa-4x');
        });

        $(window).on('accept-card', function () {
            $('.card-box i.fa-circle-notch').css({
                display: "none"
            });
            $('.card-box i.fa-credit-card').css({
                display: "table-cell"
            });
            $('.fa-credit-card').css({
                color: "#6EDD57"
            });
            $('.submit-state').css({
                display: "block",
                color: "#167C00"
            }).attr('class', 'submit-state fas fa-check-circle fa-4x');
        });
    };
    ltl.ImageUploader = function (id) {
        if (!$('#fileupload')[0]) {
            console.warn('Cannot Find #fileupload');
            return;
        }

        var url = ltl.api.root + 'image/user/',
            uploadButton = $('<button/>')
                .addClass('btn btn-primary')
                .prop('disabled', true)
                .text('Procesando...')
                .on('click', function () {
                    var $this = $(this),
                        data = $this.data();
                    $this
                        .off('click')
                        .text('Cancelar')
                        .on('click', function () {
                            $this.remove();
                            data.abort();
                        });

                    data.submit().always(function () {
                        $this.remove();
                    });
                });
        $('#fileupload').fileupload({
            url: url,
            dataType: 'json',
            autoUpload: false,
            formData: {
                id: id
            },
            acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
            maxFileSize: 999000,
            // Enable image resizing, except for Android and Opera,
            // which actually support image resizing, but fail to
            // send Blob objects via XHR requests:
            disableImageResize: /Android(?!.*Chrome)|Opera/
                .test(window.navigator.userAgent),
            previewMaxWidth: 100,
            previewMaxHeight: 100,
            previewCrop: true
        }).on('fileuploadadd', function (e, data) {
            $('#files').empty();
            data.context = $('<div/>').appendTo('#files');
            $.each(data.files, function (index, file) {
                var node = $('<p/>')
                    .append($('<span/>').text(file.name));
                if (!index) {
                    node
                        .append('<br>')
                        .append(uploadButton.clone(true).data(data));
                }
                node.appendTo(data.context);
            });
        }).on('fileuploadprocessalways', function (e, data) {
            var index = data.index,
                file = data.files[index],
                node = $(data.context.children()[index]);
            if (file.preview) {
                node
                    .prepend('<br>')
                    .prepend(file.preview);
            }
            if (file.error) {
                node
                    .append('<br>')
                    .append($('<span class="text-danger"/>').text(file.error));
            }
            if (index + 1 === data.files.length) {
                data.context.find('button')
                    .text('Subir')
                    .prop('disabled', !!data.files.error);
            }
        }).on('fileuploadprogressall', function (e, data) {
            var progress = parseInt(data.loaded / data.total * 100, 10);
            $('#progress .progress-bar').css(
                'width',
                progress + '%'
            );
        }).on('fileuploaddone', function (e, data) {
            ltl.Session.Refresh();
        }).on('fileuploadfail', function (e, data) {
            $('#progress .progress-bar').css(
                'width', "0%"
            );
            $.each(data.files, function (index) {
                var error = $('<span class="text-danger"/>').text('File upload failed.');
                $(data.context.children()[index])
                    .append('<br>')
                    .append(error);
            });
        }).prop('disabled', !$.support.fileInput)
            .parent().addClass($.support.fileInput ? undefined : 'disabled');
    };

    // ====================================== Payments ==========================================//
    ltl.Payments = function (formId, service) {
        var _this = this;

        _this.service = service || 'payments/pay';
        _this.dropin = $('#bt-dropin');
        _this.pay = $('#bt-pay');

        if (!_this.dropin[0] || !_this.pay[0]) {
            console.error('[LTL] Cannot find drop-in');
            return;
        }

        if (_.isEmpty(formId)) {
            console.error('[LTL] No Form ID included');
            return;
        }
        _this.form = new ltl.Form(formId);

        return _this;
    };
    ltl.Payments.prototype.Init = function () {
        var _this = this;

        ltl.api.get('payments/token', {}, true, function (err, res) {
            if (err || !res.Data) {
                ltl.Error(err || res);
                return;
            }
            console.log('[LTL] Got Token');
            braintree.dropin.create({
                authorization: res.Data,
                container: '#bt-dropin',
                paypal: {
                    flow: 'vault'
                },
                locale: 'es_ES'
            }, function (err, instance) {
                if (err) {
                    ltl.Error(err);
                    return;
                }

                _this.pay.click(function (event) {
                    if (!_this.form.Validate()) {
                        return;
                    }

                    instance.requestPaymentMethod(function (err, payload) {
                        if (err) {
                            console.error(err);
                            return;
                        }
                        _this.nonce = payload.nonce;
                        _this.data = _this.form.GetData();

                        var PaymentObject = {
                            Payment: {
                                Nonce: _this.nonce
                            },
                            Comprador: _this.data,
                            Producto: _this.data,
                            Vendedor: ltl.Session()
                        };

                        ltl.api.post(_this.service, PaymentObject, true, function (err, result) {
                            if (err || !result) {
                                ltl.Error(err || result);
                                _this.dropin.trigger('payment_error');
                                return;
                            } else {
                                ltl.Info(result);
                                _this.dropin.trigger('payment_success');
                            }
                        });
                    });
                });
            });
        });
    };
    // ====================================== Progress Bar ======================================= //
    ltl.ProgressBar = {};
    ltl.ProgressBar.State = {};
    ltl.ProgressBar.Init = function (steps, title) {
        var _this = ltl.ProgressBar.State = {};
        _this.steps = steps;
        _this.step_size = 100 / steps;
        _this.progress = 0;

        swal.close();
        swal({
            title: title || 'En proceso',
            html: `<div class="progress">
                        <div id="progress_swal" class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100"></div>
                   </div>`,
            showCloseButton: false,
            showCancelButton: false,
            showConfirmButton: false,
            allowOutsideClick: false
        });
    };
    ltl.ProgressBar.Next = function () {
        var _this = ltl.ProgressBar.State;
        var $bar = $('#progress_swal');
        _this.progress = _this.progress + _this.step_size;
        var nextStep = _this.progress + '%';
        $bar.css({
            width: nextStep
        });
        if (_this.progress >= 100)
            setTimeout(function () {
                swal.close();
            }, 1000);
    };
    ltl.ProgressBar.Complete = function () {
        var $bar = $('#progress_swal');
        $bar.css({
            width: '100%'
        });
        swal.close();
    };
}));