(function ($) {
    "use strict";

    const ESTADOS = "sport-valid sport-invalid sport-pending";
    const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Cada validador devuelve { tipo: "success" | "error" | "warning", texto }
    const validadores = {
        nombre(valor, o) {
            const n = valor.trim().length;
            if (n < o.nombre.min) return { tipo: "error", texto: o.mensajes.nombreCorto };
            if (n > o.nombre.max) return { tipo: "error", texto: o.mensajes.nombreLargo };
            return { tipo: "success", texto: o.mensajes.nombreValido };
        },
        email(valor, o) {
            return EMAIL.test(valor.trim())
                ? { tipo: "success", texto: o.mensajes.emailValido }
                : { tipo: "error", texto: o.mensajes.emailError };
        },
        edad(valor, o) {
            if (!/^\d+$/.test(valor.trim())) return { tipo: "error", texto: o.mensajes.edadNoEntera };
            const edad = Number(valor);
            if (edad < o.edad.min) return { tipo: "error", texto: o.mensajes.edadMenor };
            if (edad > o.edad.max) return { tipo: "error", texto: o.mensajes.edadMayor };
            return { tipo: "success", texto: o.mensajes.edadValida };
        },
        actividad(valor, o) {
            return valor
                ? { tipo: "success", texto: o.mensajes.actividadValida }
                : { tipo: "error", texto: o.mensajes.actividadError };
        },
        experiencia(valor, o) {
            return valor
                ? { tipo: "success", texto: o.mensajes.experienciaValida }
                : { tipo: "warning", texto: o.mensajes.experienciaAviso };
        }
    };

    const claseCampo = { success: "sport-valid", error: "sport-invalid", warning: "sport-pending" };

    function mostrar($campo, resultado) {
        $campo.removeClass(ESTADOS).addClass(claseCampo[resultado.tipo]);
        $campo.next(".sport-message").remove();
        $("<div>", { "class": "sport-message sport-" + resultado.tipo, text: resultado.texto })
            .insertAfter($campo);
    }

    $.fn.sportValidator = function (opciones) {
        const o = $.extend(true, {}, $.fn.sportValidator.defaults, opciones);
        const v = $.extend({}, validadores, o.validadores);

        return this.each(function () {
            $(this).find("[data-sport-type]")
                .filter(function () { return v[$(this).data("sport-type")]; })
                .off(".sportValidator")
                .on("focus.sportValidator", function () {
                    $(this).removeClass(ESTADOS).addClass("sport-pending");
                })
                .on("input.sportValidator blur.sportValidator change.sportValidator", function () {
                    const $campo = $(this);
                    mostrar($campo, v[$campo.data("sport-type")]($campo.val(), o));
                });
        });
    };

    // Valores por defecto públicos: se pueden modificar o ampliar globalmente
    $.fn.sportValidator.defaults = {
        nombre: { min: 2, max: 50 },
        edad: { min: 16, max: 65 },
        validadores: {},
        mensajes: {
            nombreValido: "Nombre válido para inscripción",
            nombreCorto: "El nombre debe tener al menos 2 caracteres",
            nombreLargo: "El nombre es demasiado largo para el sistema",
            emailValido: "Email de contacto correcto",
            emailError: "Formato de email incorrecto",
            edadValida: "Edad apropiada para actividades",
            edadNoEntera: "La edad debe ser un número entero",
            edadMenor: "Edad mínima: 16 años",
            edadMayor: "Edad máxima: 65 años",
            actividadValida: "Actividad seleccionada",
            actividadError: "Debes elegir una actividad deportiva",
            experienciaValida: "Nivel de experiencia registrado",
            experienciaAviso: "Selecciona tu nivel de experiencia"
        }
    };
}(jQuery));
