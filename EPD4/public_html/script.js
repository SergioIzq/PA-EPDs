// solución del ejemplo del enunciado, se usa para las pistas y para resolver
const solucion = [2, 7, 6, 9, 5, 1, 4, 3, 8];
const sumaMagica = 15;

// variables de la partida
let celdas;
let celdaActiva = 4;
let segundos = 0;
let cronometro;
let intentos = 0;
let fallidos = 0;
let numeroNuevo = false;
let marcarVacias = false;
let terminado = false;

// se llama al cargar la página
function iniciarJuego() {
    celdas = document.getElementsByTagName("td");
    reiniciarJuego();
}

// cambia la celda activa por la celda pulsada
function seleccionarCelda(event) {
    if (terminado) {
        return;
    }
    for (let i = 0; i < celdas.length; i++) {
        if (celdas[i] === event.target) { // event.target es la celda en la que se ha hecho clic
            celdaActiva = i;
        }
    }
    pintarCeldas();
}

// comprueba si la tecla es un número válido y lo escribe en la celda activa
function validarTecla(event) {
    if (terminado) {
        return;
    }
    const tecla = event.key;
    if (tecla === "Backspace" || tecla === "Delete") {
        celdas[celdaActiva].innerText = "";
        mostrarMensaje("");
    } else if (tecla.length !== 1 || !tecla.match(/[0-9]/)) { // la tecla no es una cifra
        mostrarMensaje("Tecla no válida\nSolo se aceptan números");
    } else if (tecla === "0") {
        mostrarMensaje("El 0 no está permitido\nSolo se aceptan números del 1 al 9");
    } else if (estaRepetido(tecla)) {
        mostrarMensaje("No puedes repetir números\nCada cifra del 1 al 9 debe aparecer solo una vez");
    } else {
        celdas[celdaActiva].innerText = tecla;
        numeroNuevo = true;
        mostrarMensaje("");
    }
    pintarCeldas();
}

// devuelve true si el número ya está escrito en otra celda
function estaRepetido(numero) {
    for (let i = 0; i < celdas.length; i++) {
        if (i !== celdaActiva && celdas[i].innerText === numero) {
            return true;
        }
    }
    return false;
}

// al soltar una tecla comprueba el estado del cuadrado
function verificarCuadradoMagico() {
    if (terminado) {
        return;
    }
    const restantes = actualizarDatos();

    // si faltan cifras se marcan en rojo las celdas vacías
    if (restantes > 0) {
        marcarVacias = true;
        pintarCeldas();
        return;
    }

    // solo se comprueba cuando se acaba de escribir un número
    if (!numeroNuevo) {
        return;
    }
    numeroNuevo = false;
    intentos++;
    document.getElementById("intentos").innerText = intentos;

    // el cuadrado es mágico si todas las sumas son iguales
    const sumas = calcularSumas();
    let esMagico = true;
    for (let i = 1; i < sumas.length; i++) {
        if (sumas[i] !== sumas[0]) {
            esMagico = false;
        }
    }

    if (esMagico) {
        ganar();
    } else {
        fallidos++;
        document.getElementById("fallidos").innerText = fallidos;
        let texto = "Este no es un cuadrado mágico\nLas sumas no coinciden. ¡Sigue intentando!";
        if (fallidos % 3 === 0) { // cada 3 intentos fallidos se da una pista
            texto = texto + "\n" + darPista();
            actualizarDatos();
        }
        mostrarMensaje(texto);
        pintarCeldas();
    }
}

// devuelve las sumas de las 3 filas, las 3 columnas y las 2 diagonales
function calcularSumas() {
    const n = [];
    for (let i = 0; i < celdas.length; i++) {
        if (celdas[i].innerText === "") {
            n[i] = 0;
        } else {
            n[i] = parseInt(celdas[i].innerText);
        }
    }
    return [n[0] + n[1] + n[2], n[3] + n[4] + n[5], n[6] + n[7] + n[8],
        n[0] + n[3] + n[6], n[1] + n[4] + n[7], n[2] + n[5] + n[8],
        n[0] + n[4] + n[8], n[2] + n[4] + n[6]];
}

// muestra las celdas que faltan y las sumas actuales y devuelve las celdas que faltan
function actualizarDatos() {
    let restantes = 0;
    for (let i = 0; i < celdas.length; i++) {
        if (celdas[i].innerText === "") {
            restantes++;
        }
    }
    document.getElementById("restantes").innerText = restantes;
    const s = calcularSumas();
    document.getElementById("sumas").innerText = "Sumas actuales: filas " + s[0] + ", " + s[1] + ", " + s[2] +
        " | columnas " + s[3] + ", " + s[4] + ", " + s[5] + " | diagonales " + s[6] + ", " + s[7];
    return restantes;
}

// pone en su sitio un número de la solución y devuelve el texto de la pista
function darPista() {
    for (let i = 0; i < celdas.length; i++) {
        if (celdas[i].innerText !== String(solucion[i])) {
            // se borra ese número de la celda donde estaba para que no se repita
            for (let j = 0; j < celdas.length; j++) {
                if (celdas[j].innerText === String(solucion[i])) {
                    celdas[j].innerText = "";
                }
            }
            celdas[i].innerText = solucion[i];
            return "Pista: el " + solucion[i] + " va en la fila " + (Math.floor(i / 3) + 1) + ", columna " + (i % 3 + 1); // fila y columna a partir de la posición
        }
    }
    return "";
}

// pinta las celdas de dorado, para el cronómetro y felicita al jugador
function ganar() {
    terminado = true;
    clearInterval(cronometro);
    for (let i = 0; i < celdas.length; i++) {
        celdas[i].style.backgroundColor = "gold";
        celdas[i].style.border = "2px solid orange";
    }
    mostrarMensaje("¡Cuadrado mágico completado!");

    // se espera medio segundo para que se vea el dorado antes del mensaje
    setTimeout(function () {
        const otra = confirm("¡FELICIDADES!\n\nHas resuelto el cuadrado mágico en " + segundos + " segundos\n\nSuma mágica: " + sumaMagica + "\n\n¿Quieres intentar otro?");
        if (otra) {
            reiniciarJuego();
        }
    }, 500);
}

// escribe una solución válida y termina la partida
function resolver() {
    terminado = true;
    clearInterval(cronometro);
    for (let i = 0; i < celdas.length; i++) {
        celdas[i].innerText = solucion[i];
        celdas[i].style.backgroundColor = "lightgreen";
        celdas[i].style.border = "2px solid green";
    }
    actualizarDatos();
    mostrarMensaje("Esta es una solución válida, todas las líneas suman " + sumaMagica);
}

// limpia las celdas, restablece colores y contadores y selecciona la celda central
function reiniciarJuego() {
    for (let i = 0; i < celdas.length; i++) {
        celdas[i].innerText = "";
    }
    celdaActiva = 4;
    segundos = 0;
    intentos = 0;
    fallidos = 0;
    numeroNuevo = false;
    marcarVacias = false;
    terminado = false;
    document.getElementById("tiempo").innerText = 0;
    document.getElementById("intentos").innerText = 0;
    document.getElementById("fallidos").innerText = 0;
    actualizarDatos();
    mostrarMensaje("");
    pintarCeldas();

    // el cronómetro suma un segundo cada segundo
    clearInterval(cronometro);
    cronometro = setInterval(function () {
        segundos++;
        document.getElementById("tiempo").innerText = segundos;
    }, 1000);
}

// pinta cada celda según su estado
function pintarCeldas() {
    for (let i = 0; i < celdas.length; i++) {
        if (i === celdaActiva) {
            celdas[i].style.backgroundColor = "lightblue";
            celdas[i].style.border = "2px solid blue";
        } else if (celdas[i].innerText !== "") {
            celdas[i].style.backgroundColor = "lightgray";
            celdas[i].style.border = "2px solid gray";
        } else if (marcarVacias) {
            celdas[i].style.backgroundColor = "lightcoral";
            celdas[i].style.border = "2px dotted red";
        } else {
            celdas[i].style.backgroundColor = "white";
            celdas[i].style.border = "2px dotted red";
        }
    }
}

// escribe un mensaje para el jugador
function mostrarMensaje(texto) {
    document.getElementById("mensaje").innerText = texto;
}
