// Snippet: https://css-tricks.com/snippets/javascript/random-hex-color/
// (versión de los comentarios con padStart para que siempre tenga 6 dígitos)
function colorAleatorio() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
}

// Snippet: https://css-tricks.com/snippets/javascript/lighten-darken-color/
// (corregido el orden de canales r/g/b y añadido padStart, tal como se indica en los comentarios)
function LightenDarkenColor(col, amt) {
    let usePound = false;
    if (col[0] === "#") {
        col = col.slice(1);
        usePound = true;
    }
    const num = parseInt(col, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amt));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
    return (usePound ? "#" : "") + (b | (g << 8) | (r << 16)).toString(16).padStart(6, "0");
}

function mostrarColor(lista, nombre, color) {
    const elemento = document.createElement("li");
    elemento.textContent = nombre + ": " + color;
    elemento.style.background = color;
    elemento.style.padding = "1em";
    lista.appendChild(elemento);
}

document.getElementById("generar").addEventListener("click", function () {
    const lista = document.getElementById("colores");
    const base = colorAleatorio();
    lista.textContent = "";
    mostrarColor(lista, "Claro", LightenDarkenColor(base, 60));
    mostrarColor(lista, "Base", base);
    mostrarColor(lista, "Oscuro", LightenDarkenColor(base, -60));
});
