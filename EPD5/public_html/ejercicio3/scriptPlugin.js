$(document).ready(function () {
  for (let i = 10; i < 22; i++) {
    const $img = $("<img>")
      .addClass("foto lazy")
      .attr("alt", "Foto " + i)
      // Sin src: la URL real va en data-original, que es lo que lee el plugin
      .attr("data-original", "https://picsum.photos/id/" + i + "/2000/1300");

    $("#galeria").append($img);
  }

  // Se activa el plugin sobre las imágenes con clase lazy:
  // solo se cargan cuando están cerca de la zona visible.
  // effect: "fadeIn" las muestra con un fundido al cargar.
  $("img.lazy").lazyload({
    effect: "fadeIn"
  });
});