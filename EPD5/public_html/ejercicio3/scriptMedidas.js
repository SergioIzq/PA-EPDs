// Calcula las medidas y las muestra en el cuadro #medidas.
// "momento" indica cuándo se ha medido ("Al cargar" o "Al llegar al fondo")
function mostrarMedidas(momento) {
  // Datos de la navegación (incluye el TTFB)
  const nav = performance.getEntriesByType("navigation")[0];

  // TTFB: tiempo hasta recibir el primer byte de la respuesta
  const ttfb = Math.round(nav.responseStart);

  // Imágenes que se han pedido (y terminado de descargar) hasta ahora
  const imagenes = performance.getEntriesByType("resource").filter(function (r) {
    return r.initiatorType === "img";
  });

  // Tiempo de carga:
  // - Al cargar: tiempo hasta el evento load de la ventana
  // - Al llegar al fondo: instante en que terminó de llegar la última imagen
  let carga = Math.round(performance.now());
  if (momento === "Al llegar al fondo") {
    carga = 0;
    for (let i = 0; i < imagenes.length; i++) {
      // Algunas entradas (imágenes de caché o que fallan) traen responseEnd = 0,
      // así que se usa también startTime + duration y se queda el mayor
      const fin = Math.max(imagenes[i].responseEnd, imagenes[i].startTime + imagenes[i].duration);
      if (fin > carga) {
        carga = Math.round(fin);
      }
    }
    // Si no hay ninguna entrada válida, se usa el instante actual
    if (carga === 0) {
      carga = Math.round(performance.now());
    }
  }

  // Se muestra en el cuadro con .text() de jQuery
  $("#medidas").text(
    momento + " | TTFB: " + ttfb + " ms | Carga: " + carga +
    " ms | Imágenes pedidas: " + imagenes.length
  );
}

// Devuelve true si la última foto de la galería ya se ha descargado
function ultimaImagenCargada() {
  const $ultima = $("img.foto").last();
  // Con el plugin la URL real está en data-original; en el resto, en src
  const url = $ultima.attr("data-original") || $ultima.attr("src");
  return performance.getEntriesByType("resource").some(function (r) {
    return r.name === url;
  });
}

// Medida inicial, cuando termina el evento load de la ventana
$(window).on("load", function () {
  mostrarMedidas("Al cargar");
});

// Medida final: al llegar al fondo de la página
let esperando = false;
let medidoFondo = false; // la medida del fondo se hace solo la primera vez
$(window).on("scroll", function () {
  const enElFondo = $(window).scrollTop() + $(window).height() >= $(document).height() - 5;
  if (!enElFondo || esperando || medidoFondo) {
    return;
  }
  esperando = true;

  // La última imagen puede tardar un poco en llegar: se comprueba cada 200 ms
  // (máximo 10 s, por si falla la red)
  let intentos = 0;
  const espera = setInterval(function () {
    intentos++;
    if (ultimaImagenCargada() || intentos > 50) {
      clearInterval(espera);
      mostrarMedidas("Al llegar al fondo");
      medidoFondo = true;
      esperando = false;
    }
  }, 200);
});