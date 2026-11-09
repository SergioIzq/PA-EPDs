$(document).ready(function () {
    const FORMATO_FECHA = "dd/mm/yy";
    const DIAS_FESTIVAL = 4; // Desde hoy hasta hoy + 4 días, ambos inclusive
    const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const REGEX_ENTERO = /^-?\d+$/;
    const REGEX_FECHA = /^\d{2}\/\d{2}\/\d{4}$/;

    const $formSeccion = $("#formulario-reserva");
    const $form = $("#form-reserva");
    const $resumen = $("#panel-resumen");

    let intentoRealizado = false;
    let enTransicion = false;

    // Selector de fechas (Datepicker)
    $("#fecha").datepicker({
        dateFormat: FORMATO_FECHA,
        minDate: 0,
        maxDate: "+" + DIAS_FESTIVAL + "D",
        firstDay: 1,
        monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
            "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
        dayNamesMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sá"],
        prevText: "Anterior",
        nextText: "Siguiente",
        onSelect: function () {
            if (intentoRealizado) {
                validarCampo("fecha");
            }
        }
    });

    // ---------- Reglas de validación: devuelven "" si el valor es válido ----------

    function validarFecha(valor) {
        if (valor === "") {
            return "Indica la fecha de asistencia.";
        }
        if (!REGEX_FECHA.test(valor)) {
            return "La fecha debe tener el formato dd/mm/aaaa.";
        }

        let fecha;
        try {
            fecha = $.datepicker.parseDate(FORMATO_FECHA, valor);
        } catch (e) {
            return "La fecha indicada no existe.";
        }

        const inicio = new Date();
        inicio.setHours(0, 0, 0, 0);
        const fin = new Date(inicio);
        fin.setDate(fin.getDate() + DIAS_FESTIVAL);

        if (fecha < inicio || fecha > fin) {
            return "Elige un día del festival: del " +
                $.datepicker.formatDate(FORMATO_FECHA, inicio) + " al " +
                $.datepicker.formatDate(FORMATO_FECHA, fin) + ".";
        }
        return "";
    }

    const VALIDADORES = {
        nombre: function () {
            return $("#nombre").val().trim() === "" ? "Introduce el nombre y apellidos del titular." : "";
        },
        email: function () {
            const valor = $("#email").val().trim();
            if (valor === "") {
                return "Introduce un email de contacto.";
            }
            return REGEX_EMAIL.test(valor) ? "" : "El email no tiene un formato válido.";
        },
        entradas: function () {
            const valor = $("#entradas").val().trim();
            if (valor === "") {
                return "Indica el número de entradas.";
            }
            if (!REGEX_ENTERO.test(valor)) {
                return "El número de entradas debe ser un número entero.";
            }
            const numero = Number(valor);
            return numero >= 1 && numero <= 5 ? "" : "Puedes reservar entre 1 y 5 entradas.";
        },
        fecha: function () {
            return validarFecha($("#fecha").val().trim());
        },
        tipo: function () {
            return $("#tipo").val() === "" ? "Selecciona un tipo de entrada." : "";
        },
        condiciones: function () {
            return $("#condiciones").prop("checked") === true ? "" : "Debes aceptar las condiciones de la reserva.";
        }
    };

    // Valida un campo, muestra u oculta su error y devuelve si es válido
    function validarCampo(campo) {
        const mensaje = VALIDADORES[campo]();
        const $error = $("#error-" + campo);
        const valido = mensaje === "";

        $("#" + campo).toggleClass("invalido", !valido);

        if (valido) {
            $error.stop(true, true).fadeOut();
        } else {
            $error.text(mensaje).stop(true, true).fadeIn();
        }
        return valido;
    }

    function validarTodo() {
        let valido = true;
        // Se validan todos los campos, sin detenerse en el primer error
        $.each(Object.keys(VALIDADORES), function (i, campo) {
            if (!validarCampo(campo)) {
                valido = false;
            }
        });
        return valido;
    }

    // Validación en vivo, activada solo tras el primer intento de confirmación
    function activarValidacionEnVivo() {
        $form.on("input", "#nombre, #email, #entradas, #fecha", function () {
            validarCampo(this.id);
        });
        $form.on("change", "#tipo, #condiciones", function () {
            validarCampo(this.id);
        });
    }

    function actualizarResumen() {
        $("#resumen-nombre").text($("#nombre").val().trim());
        $("#resumen-email").text($("#email").val().trim());
        $("#resumen-fecha").text($("#fecha").val().trim());
        $("#resumen-tipo").text($("#tipo option:selected").text());
        $("#resumen-entradas").text($("#entradas").val().trim());
    }

    // ---------- Confirmación de la reserva ----------
    $form.on("submit", function (event) {
        event.preventDefault();

        if (enTransicion) {
            return;
        }

        if (!intentoRealizado) {
            intentoRealizado = true;
            activarValidacionEnVivo();
        }

        if (!validarTodo()) {
            $resumen.hide();
            return;
        }

        enTransicion = true;
        actualizarResumen();
        $(".error").stop(true, true).hide();
        $("#fecha").datepicker("hide");

        $formSeccion.slideUp(function () {
            $resumen.slideDown(function () {
                enTransicion = false;
            });
        });
    });

    // ---------- Modificación de la reserva ----------
    $("#modificar").on("click", function () {
        if (enTransicion) {
            return;
        }
        enTransicion = true;

        $resumen.slideUp(function () {
            $formSeccion.slideDown(function () {
                enTransicion = false;
            });
        });
    });
});
