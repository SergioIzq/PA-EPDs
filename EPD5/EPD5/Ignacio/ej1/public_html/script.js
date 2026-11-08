// Texto que se muestra con cada luz
const mensajes = { roja: "Detén el vehículo", amarilla: "Precaución", verde: "Puedes pasar" };

// Tiempo que tarda una luz en encenderse o apagarse
const velocidad = 600; // En milisegundos

// Luz que está encendida ahora mismo
let luzEncendida = "roja";

$(document).ready(function () {
    // Al empezar solo está encendida la roja
    $(".luz").css("opacity", 0.2);
    $("#luz-roja").css("opacity", 1);
    $("#mensaje").text(mensajes.roja);

    // Los tres botones hacen lo mismo, cada uno con el color que tiene en data-luz
    $("#panel-control button").on("click", function () {
        encenderLuz($(this).attr("data-luz"));
    });

    // Zoom de la luz al pasar el ratón por encima
    $(".luz").on("mouseenter", function () {
        $(this).addClass("zoom");
    });

    // Al quitar el ratón la luz vuelve a su tamaño
    $(".luz").on("mouseleave", function () {
        $(this).removeClass("zoom");
    });
});

// Enciende poco a poco la luz elegida y apaga las demás
function encenderLuz(color) {
    // Si ya era la luz encendida no se hace nada para no empezar otra vez su animación
    if (color !== luzEncendida) {
        luzEncendida = color;
        $("#mensaje").text(mensajes[color]);

        const luz = $("#luz-" + color);
        $(".luz").stop(true, false); // Para las animaciones que estaban a medias y borra las que esperaban
        luz.fadeTo(velocidad, 1);
        $(".luz").not(luz).fadeTo(velocidad, 0.2); // Todas las luces menos la elegida
    }
}
