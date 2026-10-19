// Snippet: https://css-tricks.com/snippets/javascript/pagevisibility-api/
// (adaptado: muestra el tiempo en la página en lugar de alert y valora el descanso)
let timer = 0;

function stateChanged() {
    if (document.hidden) {
        timer = new Date().getTime();
        return;
    }
    const segundos = (new Date().getTime() - timer) / 1000;
    let valoracion = "descanso adecuado";
    if (segundos < 30) {
        valoracion = "descanso demasiado corto";
    } else if (segundos > 120) {
        valoracion = "descanso demasiado largo";
    }
    const elemento = document.createElement("li");
    elemento.textContent = "Ha descansado " + segundos.toFixed(1) + " segundos: " + valoracion + ".";
    document.getElementById("descansos").appendChild(elemento);
}

document.addEventListener("visibilitychange", stateChanged);
