/*!
 * SportValidator - Plugin de jQuery para validar formularios de inscripción deportiva.
 *
 * Uso básico:
 *   $("#miFormulario").sportValidator();
 *
 * Uso con configuración:
 *   $("#miFormulario").sportValidator({
 *       edad: { min: 18, max: 70 },
 *       mensajes: { email: { error: "Revisa el email" } }
 *   });
 */
(function ($) {
    "use strict";

    const ESPACIO = ".sportValidator";
    const CLASES_CAMPO = "sport-pending sport-valid sport-invalid";

    // Resultado de una validación
    function resultado(valido, mensaje, tipoMensaje) {
        return {
            valido: valido,
            mensaje: mensaje,
            tipoMensaje: tipoMensaje || (valido ? "success" : "error")
        };
    }

    // Reglas de validación por tipo de campo deportivo
    const VALIDADORES = {
        nombre: function (valor, cfg) {
            const longitud = valor.trim().length;
            if (longitud < cfg.nombre.min) {
                return resultado(false, cfg.mensajes.nombre.corto);
            }
            if (longitud > cfg.nombre.max) {
                return resultado(false, cfg.mensajes.nombre.largo);
            }
            return resultado(true, cfg.mensajes.nombre.valido);
        },

        email: function (valor, cfg) {
            return cfg.email.regex.test(valor.trim())
                ? resultado(true, cfg.mensajes.email.valido)
                : resultado(false, cfg.mensajes.email.error);
        },

        edad: function (valor, cfg) {
            const texto = valor.trim();
            if (!/^-?\d+$/.test(texto)) {
                return resultado(false, cfg.mensajes.edad.entero);
            }
            const edad = Number(texto);
            if (edad < cfg.edad.min) {
                return resultado(false, cfg.mensajes.edad.menor);
            }
            if (edad > cfg.edad.max) {
                return resultado(false, cfg.mensajes.edad.mayor);
            }
            return resultado(true, cfg.mensajes.edad.valido);
        },

        actividad: function (valor, cfg) {
            return valor !== ""
                ? resultado(true, cfg.mensajes.actividad.valido)
                : resultado(false, cfg.mensajes.actividad.error);
        },

        experiencia: function (valor, cfg) {
            return valor !== ""
                ? resultado(true, cfg.mensajes.experiencia.valido)
                : resultado(false, cfg.mensajes.experiencia.advertencia, "warning");
        }
    };

    // Elimina el mensaje anterior del campo y crea uno nuevo tras él
    function mostrarMensaje($campo, texto, tipo) {
        $campo.next(".sport-message").remove();
        $("<div>", { "class": "sport-message sport-" + tipo, text: texto }).insertAfter($campo);
    }

    // Aplica el estado visual (pending | valid | invalid) eliminando los anteriores
    function aplicarEstado($campo, estado) {
        $campo.removeClass(CLASES_CAMPO).addClass("sport-" + estado);
    }

    // Valida un campo y actualiza su estado y su mensaje
    function validarCampo($campo, cfg) {
        const tipo = $campo.data("sport-type");
        const res = VALIDADORES[tipo]($campo.val() || "", cfg);

        aplicarEstado($campo, res.valido ? "valid" : "invalid");
        mostrarMensaje($campo, res.mensaje, res.tipoMensaje);
        return res.valido;
    }

    $.fn.sportValidator = function (opciones) {
        const cfg = $.extend(true, {}, $.fn.sportValidator.defaults, opciones);

        return this.each(function () {
            const $form = $(this);

            // Detección automática: solo campos con un tipo deportivo conocido
            const $campos = $form.find("[data-sport-type]").filter(function () {
                return VALIDADORES.hasOwnProperty($(this).data("sport-type"));
            });

            // Evita duplicar manejadores si el plugin se aplica dos veces
            $campos.off(ESPACIO);

            // focus: estado pendiente (amarillo)
            $campos.on("focus" + ESPACIO, function () {
                aplicarEstado($(this), "pending");
            });

            // input: validación en tiempo real (campos de texto)
            $campos.not("select").on("input" + ESPACIO, function () {
                validarCampo($(this), cfg);
            });

            // change: validación de los select
            $campos.filter("select").on("change" + ESPACIO, function () {
                validarCampo($(this), cfg);
            });

            // blur: validación final al salir del campo
            $campos.on("blur" + ESPACIO, function () {
                validarCampo($(this), cfg);
            });
        });
    };

    // Configuración por defecto, modificable globalmente o por llamada
    $.fn.sportValidator.defaults = {
        nombre: { min: 2, max: 50 },
        email: { regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
        edad: { min: 16, max: 65 },
        mensajes: {
            nombre: {
                valido: "Nombre válido para inscripción",
                corto: "El nombre debe tener al menos 2 caracteres",
                largo: "El nombre es demasiado largo para el sistema"
            },
            email: {
                valido: "Email de contacto correcto",
                error: "Formato de email incorrecto"
            },
            edad: {
                valido: "Edad apropiada para actividades",
                menor: "Edad mínima: 16 años",
                mayor: "Edad máxima: 65 años",
                entero: "La edad debe ser un número entero"
            },
            actividad: {
                valido: "Actividad seleccionada",
                error: "Debes elegir una actividad deportiva"
            },
            experiencia: {
                valido: "Nivel de experiencia registrado",
                advertencia: "Selecciona tu nivel de experiencia"
            }
        }
    };
})(jQuery);
