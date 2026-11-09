$(document).ready(function () {
    const VELOCIDAD = 400;
    const OPACIDAD_ENCENDIDA = 1;
    const OPACIDAD_APAGADA = 0.2;

    const MENSAJES = {
        roja: "Detén el vehículo",
        amarilla: "Precaución",
        verde: "Puedes pasar"
    };

    const $luces = $(".semaforo .luz");
    const $mensaje = $("#mensaje");
    let luzActual = "roja";

    // Estado inicial: roja encendida, el resto apagadas
    $luces.css("opacity", OPACIDAD_APAGADA);
    $luces.filter("[data-luz='roja']").css("opacity", OPACIDAD_ENCENDIDA);
    $mensaje.text(MENSAJES.roja);

    // Panel de control
    $(".panel-control").on("click", ".boton", function () {
        const luz = $(this).data("luz");

        // Si ya está seleccionada, no se reinicia su transición
        if (luz === luzActual) {
            return;
        }
        luzActual = luz;

        const $encender = $luces.filter("[data-luz='" + luz + "']");

        // Se cancelan las animaciones en curso y su cola: prevalece la última selección
        $luces.not($encender).stop(true, false).fadeTo(VELOCIDAD, OPACIDAD_APAGADA);
        $encender.stop(true, false).fadeTo(VELOCIDAD, OPACIDAD_ENCENDIDA);

        $mensaje.text(MENSAJES[luz]);
    });

    // Zoom al pasar el ratón (clase CSS con transform + transition)
    $luces
        .on("mouseenter", function () {
            $(this).addClass("zoom");
        })
        .on("mouseleave", function () {
            $(this).removeClass("zoom");
        });
});
