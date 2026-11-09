$(document).ready(function () {
  // Se crean 12 imágenes grandes (2000x1300) con ids distintos de picsum
  for (let i = 10; i < 22; i++) {
    const $img = $("<img>")
      .addClass("foto")
      .attr("alt", "Foto " + i)
      // src directo: el navegador descarga todas las imágenes al cargar
      .attr("src", "https://picsum.photos/id/" + i + "/2000/1300");

    // Se añade a la galería
    $("#galeria").append($img);
  }
});