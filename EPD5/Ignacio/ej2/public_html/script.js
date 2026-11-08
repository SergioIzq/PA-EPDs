// Pasa a true la primera vez que se pulsa Confirmar reserva
let intentado = false;

// Vale true mientras se cambia de panel, para no empezar otro cambio a la vez
let cambiandoPanel = false;

$(document).ready(function () {
    // Calendario de jQuery UI en el campo de la fecha
    $("#fecha").datepicker({
        dateFormat: "dd/mm/yy", // En el Datepicker yy es el año con 4 cifras
        minDate: 0, // No deja elegir días anteriores a hoy
        maxDate: "+4D", // El festival dura 5 días, de hoy a dentro de 4 días
        firstDay: 1, // La semana empieza en lunes
        dayNamesMin: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
        monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
        prevText: "Anterior",
        nextText: "Siguiente",
        // Al elegir un día en el calendario no salta el evento change, por eso se valida aquí
        onSelect: function () {
            if (intentado) {
                validarFecha();
            }
        }
    });

    // Botón Confirmar reserva
    $("#form-reserva").on("submit", function (event) {
        event.preventDefault(); // El formulario no se envía y la página no se recarga

        // Solo se confirma si no se está cambiando de panel
        if (!cambiandoPanel) {
            // La primera vez que se intenta confirmar se activa la validación mientras se escribe
            if (!intentado) {
                intentado = true;
                activarValidacionEnVivo();
            }

            if (validarFormulario()) {
                rellenarResumen();
                cambiarPanel($("#formulario-reserva"), $("#panel-resumen"));
            }
        }
    });

    // Botón Modificar reserva, vuelve al formulario con los datos que ya había
    $("#boton-modificar").on("click", function () {
        if (!cambiandoPanel) {
            cambiarPanel($("#panel-resumen"), $("#formulario-reserva"));
        }
    });
});

// Cada campo se vuelve a comprobar en cuanto cambia su valor
function activarValidacionEnVivo() {
    $("#nombre").on("input", function () { validarNombre(); });
    $("#email").on("input", function () { validarEmail(); });
    $("#entradas").on("input", function () { validarEntradas(); });
    $("#fecha").on("input", function () { validarFecha(); });
    $("#tipo").on("change", function () { validarTipo(); });
    $("#condiciones").on("change", function () { validarCondiciones(); });
}

// Comprueba todos los campos y devuelve true si están todos bien
function validarFormulario() {
    // Se guarda cada resultado aparte para que se compruebe todo aunque falle un campo antes
    const nombreOk = validarNombre();
    const emailOk = validarEmail();
    const entradasOk = validarEntradas();
    const fechaOk = validarFecha();
    const tipoOk = validarTipo();
    const condicionesOk = validarCondiciones();
    return nombreOk && emailOk && entradasOk && fechaOk && tipoOk && condicionesOk;
}

// Pone el mensaje de error de un campo y lo enseña, o lo oculta si no hay mensaje
function actualizarError(campo, mensaje) {
    const error = $("#error-" + campo);
    error.stop(true, true); // Termina de golpe la animación anterior para que no se acumulen
    if (mensaje === "") {
        error.fadeOut();
    } else {
        error.text(mensaje).fadeIn();
    }
    return mensaje === ""; // Devuelve true si el campo está bien
}

function validarNombre() {
    let mensaje = "";
    if ($("#nombre").val().trim() === "") {
        mensaje = "Escribe el nombre y apellidos del titular";
    }
    return actualizarError("nombre", mensaje);
}

function validarEmail() {
    const email = $("#email").val().trim();
    let mensaje = "";
    if (email === "") {
        mensaje = "Escribe un email de contacto";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        mensaje = "El email no es válido, por ejemplo: nombre@correo.com";
    }
    return actualizarError("email", mensaje);
}

function validarEntradas() {
    const valor = $("#entradas").val().trim();
    const numero = Number(valor);
    let mensaje = "";
    if (valor === "") {
        mensaje = "Indica cuántas entradas quieres, de 1 a 5";
    } else if (!Number.isInteger(numero)) {
        mensaje = "El número de entradas no puede tener decimales";
    } else if (numero < 1 || numero > 5) {
        mensaje = "Solo se pueden reservar de 1 a 5 entradas";
    }
    return actualizarError("entradas", mensaje);
}

function validarFecha() {
    const valor = $("#fecha").val().trim();
    let mensaje = "";
    if (valor === "") {
        mensaje = "Elige la fecha de asistencia";
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
        mensaje = "La fecha debe tener el formato dd/mm/aaaa";
    } else {
        // Primer y último día del festival, sin la hora para comparar solo los días
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        const ultimoDia = new Date(hoy);
        ultimoDia.setDate(hoy.getDate() + 4);

        let fecha;
        try {
            fecha = $.datepicker.parseDate("dd/mm/yy", valor);
        } catch (error) {
            fecha = null; // Si la fecha no existe, como el 31/02, parseDate da error y se llega aquí
        }

        if (fecha === null) {
            mensaje = "Esa fecha no existe";
        } else if (fecha < hoy || fecha > ultimoDia) {
            mensaje = "El festival es del " + $.datepicker.formatDate("dd/mm/yy", hoy) + " al " + $.datepicker.formatDate("dd/mm/yy", ultimoDia);
        }
    }
    return actualizarError("fecha", mensaje);
}

function validarTipo() {
    let mensaje = "";
    if ($("#tipo").val() === "") {
        mensaje = "Selecciona un tipo de entrada";
    }
    return actualizarError("tipo", mensaje);
}

function validarCondiciones() {
    let mensaje = "";
    if (!$("#condiciones").prop("checked")) {
        mensaje = "Tienes que aceptar las condiciones para reservar";
    }
    return actualizarError("condiciones", mensaje);
}

// Copia los datos del formulario en el panel de resumen
function rellenarResumen() {
    $("#resumen-nombre").text($("#nombre").val().trim());
    $("#resumen-email").text($("#email").val().trim());
    $("#resumen-fecha").text($("#fecha").val().trim());
    $("#resumen-tipo").text($("#tipo option:selected").text()); // El texto de la opción y no su value
    $("#resumen-entradas").text(Number($("#entradas").val()));
}

// Oculta un panel y cuando ha terminado enseña el otro
function cambiarPanel(panelQueSeVa, panelQueViene) {
    cambiandoPanel = true;
    panelQueSeVa.slideUp(function () {
        panelQueViene.slideDown(function () {
            cambiandoPanel = false;
        });
    });
}
