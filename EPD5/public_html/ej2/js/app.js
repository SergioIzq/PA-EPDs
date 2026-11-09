$(document).ready(function () {
    const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const FORMATO = "dd/mm/yy";

    let intentado = false;   // se ha pulsado confrmar alguna vez
    let cambiando = false;   // cambio panel en curso

    const $nombre = $("#nombre");
    const $email = $("#email");
    const $entradas = $("#entradas");
    const $fecha = $("#fecha");
    const $tipo = $("#tipo");
    const $acepto = $("#acepto");

    // cada validador devuelve "" si es válido o el mensaje de error usando un ternario
    const validadores = {
        nombre: function () {
            return $nombre.val().trim() === "" ? "Introduce tu nombre y apellidos." : "";
        },
        email: function () {
            const v = $email.val().trim();
            if (v === "")
                return "Introduce tu email.";
            return REGEX_EMAIL.test(v) ? "" : "El email no tiene un formato válido.";
        },
        entradas: function () {
            const v = $entradas.val().trim();
            if (v === "")
                return "Indica el número de entradas.";
            if (!/^\d+$/.test(v))
                return "Debe ser un número entero.";
            const n = Number(v);
            return (n >= 1 && n <= 5) ? "" : "Debes reservar entre 1 y 5 entradas.";
        },
        fecha: function () {
            const v = $fecha.val().trim();
            if (v === "")
                return "Selecciona la fecha de asistencia.";
            let fecha;
            try {
                fecha = $.datepicker.parseDate(FORMATO, v);
            } catch (e) {
                return "Fecha no válida. Usa el formato dd/mm/aaaa.";
            }
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const limite = new Date(hoy);
            limite.setDate(limite.getDate() + 4);
            if (fecha < hoy || fecha > limite) {
                return "La fecha debe estar entre hoy y los próximos 4 días.";
            }
            return "";
        },
        tipo: function () {
            return $tipo.val() === "" ? "Selecciona un tipo de entrada." : "";
        },
        acepto: function () {
            return $acepto.prop("checked") ? "" : "Debes aceptar las condiciones.";
        }
    };

    // valida un campo actualiza su error y devuelve true si es válido
    function validar(campo) {
        const mensaje = validadores[campo]();
        const $error = $("#error-" + campo);
        if (mensaje !== "") {
            $error.stop(true, true).text(mensaje).fadeIn();
            return false;
        }
        $error.stop(true, true).fadeOut();
        return true;
    }

    // plugin Datepicker
    $fecha.datepicker({
        dateFormat: "dd/mm/yy",
        minDate: 0,
        maxDate: "+4D",
        onSelect: function () {
            if (intentado)
                validar("fecha");
        }
    });

    // revalidación tras el primer intento de confirmación
    $("#nombre, #email, #entradas, #fecha").on("input", function () {
        if (intentado)
            validar($(this).attr("id"));
    });
    $("#tipo, #acepto").on("change", function () {
        if (intentado)
            validar($(this).attr("id"));
    });

    // envío del formulario
    $("#formulario-reserva form").on("submit", function (event) {
        event.preventDefault();
        if (cambiando)
            return;
        intentado = true;

        let todoValido = true;
        $.each(validadores, function (campo) {
            if (!validar(campo))
                todoValido = false;   // no se corta en el primer error
        });

        if (!todoValido)
            return;

        $(".error").stop(true, true).fadeOut();

        $("#rnombre").text($nombre.val().trim());
        $("#remail").text($email.val().trim());
        $("#rfecha").text($fecha.val().trim());
        $("#rtipo").text($tipo.find("option:selected").text());
        $("#rentradas").text($entradas.val().trim());

        cambiando = true;
        $("#formulario-reserva").slideUp(function () {
            $("#panel-resumen").slideDown(function () {
                cambiando = false;
            });
        });
    });

    // Modificar reserva
    $("#modificar").on("click", function () {
        if (cambiando)
            return;
        cambiando = true;
        $("#panel-resumen").slideUp(function () {
            $("#formulario-reserva").slideDown(function () {
                cambiando = false;
            });
        });
    });
});
