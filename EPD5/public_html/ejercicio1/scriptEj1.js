//el código se ejecuta cuando el DOM está listo
$(document).ready(function () {
  const mensajes = { //mensaje asociado a cada luz
    rojo: "Detén el vehículo",
    amarillo: "Precaución",
    verde: "Puedes pasar"
  };
  
  //luz seleccionada. Al cargar, es la roja
  let actual = "rojo";

  // Estado inicial: todas apagadas menos la roja
  $(".luz").css("opacity", 0.2);
  $("#luz-rojo").css("opacity", 1);
  //mensaje inicial
  $("#mensaje").text(mensajes[actual]);

  //Se vincula el evento click a los tres botones del panel conn .on()
  $("#panel .btn").on("click", function () {
    const color = $(this).data("color"); //color del botón pulsado, leído de su atributo data-color

    //si se pulsa la luz ya seleccionada, aquí no ha pasado nada
    if (color === actual) {
      return;
    }
    //se guarda la nueva selección al toque
    actual = color;

    //luz a encender
    const $seleccionada = $("#luz-" + color);

    //apaga las demás. con .stop cancelamos las animaciones anteriores y vacía la cola, y con fadeTo bajamos la opacidad sin ocultarlas
    $(".luz").not($seleccionada).stop(true, false).fadeTo(400, 0.2);
    $seleccionada.stop(true, false).fadeTo(400, 1); //la seleccionada, al revés, pasa a brillar
    $("#mensaje").text(mensajes[color]); //mensaje correspondiente
  });

  //Al entrar el cursor se añade la clase zoom, que está en el CSS, y al salir se quita y la luz recupera su tamaño original
  $(".luz")
    .on("mouseenter", function () {
      $(this).addClass("zoom");
    })
    .on("mouseleave", function () {
      $(this).removeClass("zoom");
    });
});