$(document).ready(function () {
  for (let i = 10; i < 22; i++) {
    const $img = $("<img>")
      .addClass("foto")
      .attr("alt", "Foto " + i)
      // loading="lazy" se pone ANTES que src, para que el navegador
      // ya sepa que debe retrasar la descarga
      .attr("loading", "lazy")
      .attr("src", "https://picsum.photos/id/" + i + "/2000/1300");

    $("#galeria").append($img);
  }
});