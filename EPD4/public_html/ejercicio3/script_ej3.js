"use strict";
const TIEMPO_INICIAL = 180; //tiempo límite (3 mins)
const NUM_FILAS = 3;
const NUM_CELDAS = NUM_FILAS * NUM_FILAS;
const SUMA = (NUM_FILAS * (NUM_CELDAS + 1)) / 2;
const NUM_INTENTOS = 3;

//esto me lo ha dado la IA la verdad
const SOLUCIONES = [
    "276951438", "294753618", "438951276", "492357816",
    "618753294", "672159834", "816357492", "834159672"
];


const elementos = {
    crono: document.getElementById("crono"),
    sumaObjetivo: document.getElementById("sumaObjetivo"),
    intentos: document.getElementById("intentos"),
    mensajes: document.getElementById("mensajes"),
    mensajeTitulo: document.getElementById("mensajeTitulo"),
    mensajeTexto: document.getElementById("mensajeTexto"),
    restantes: document.getElementById("celdasRestantes"),
    info: document.getElementById("info"),
    btnIniciar: document.getElementById("nuevaPartida"),
    btnResolver: document.getElementById("resolver")
};

const celdas = document.querySelectorAll(".celda");
let ultimaCelda = null;
let numerosUsados = new Array();
let intentos = 0;
let fallos = 0;
let segundos = 0;
let intervalo = null;
let juegoActivo = true;
let numeroColocado = false;

window.onload = inicio;

function inicio() {
    ultimaCelda = "1-1";
    document.getElementById(ultimaCelda).classList.add("seleccionada");
    elementos.sumaObjetivo.textContent = `Suma objetivo: ${SUMA}`;
    elementos.restantes.textContent = `Celdas restantes: ${NUM_CELDAS}`;
    actualizarIntentos();
    mostrarMensaje("¡A jugar!", "Rellena el cuadrado con los números del 1 al 9");
    iniciarCrono();
}

function iniciarCrono() {
    clearInterval(intervalo); // por si ya había uno en marcha
    segundos = 0;
    elementos.crono.textContent = formatearTiempo(segundos);
    intervalo = setInterval(function () {
        segundos += 1;
        elementos.crono.textContent = formatearTiempo(segundos);
    }, 1000);
}

function formatearTiempo(segundos) {
    //redondeamos hacia abajo los minutos para no tener decimales.
    // Con padStart añadimos un 0 al ppio si la longitud del texto es menor que 2
    const min = String(Math.floor(segundos / 60)).padStart(2, "0");
    const sec = String(segundos % 60).padStart(2, "0");
    return `${min}:${sec}`;
}

function pararCrono() {
    clearInterval(intervalo);
}
// Escribe un mensaje en el panel de mensajes
function mostrarMensaje(titulo, texto) {
    elementos.mensajeTitulo.textContent = titulo;
    elementos.mensajeTexto.innerHTML = texto;
}

function actualizarIntentos() {
    elementos.intentos.textContent = `Intentos: ${intentos}`;
}

function actualizarRestantes() {
    elementos.restantes.textContent = `Celdas restantes: ${NUM_CELDAS - numerosUsados.length}`;
}

//cuando se seleccione una celda
celdas.forEach(function (celda) {
    celda.addEventListener("click", function (evento) {
        if (!juegoActivo)
            return;

        if (ultimaCelda !== null) {
            document.getElementById(ultimaCelda).classList.remove("seleccionada");
        }
        seleccionarCelda(evento, celda.id);
    });
});

document.addEventListener("keydown", function (k) {
    if (k.repeat || !juegoActivo)
        return;

    if (ultimaCelda !== null) {
        validarTecla(k);
    }
});

document.addEventListener("keyup", function () {
    if (numeroColocado) {
        numeroColocado = false;
        verificarCuadradoMagico();
    }
});

function seleccionarCelda(evento, idCelda) {
    evento.stopPropagation();

    if (ultimaCelda === idCelda) {
        document.getElementById(ultimaCelda).classList.remove("seleccionada");
        ultimaCelda = null;
    } else {
        if (document.getElementById(idCelda).classList.contains("vacia")) {
            document.getElementById(idCelda).classList.remove("vacia");
        }
        document.getElementById(idCelda).classList.add("seleccionada");
        ultimaCelda = idCelda;
    }
}

function validarTecla(event) {

    // 1. Atajos del navegador (Ctrl+R, Ctrl+C, Alt+flecha, Cmd+R...): no hacemos nada
    //    y no usamos preventDefault, así el navegador los ejecuta con normalidad
    if (event.ctrlKey || event.altKey || event.metaKey) {
        return;
    }

    if (event.key === "Backspace" || event.key === "Delete") {
        const contenido = document.getElementById(ultimaCelda).textContent;
        if (contenido !== "") {
            numerosUsados.splice(numerosUsados.indexOf(contenido), 1);
            document.getElementById(ultimaCelda).textContent = "";
            actualizarRestantes();
            numeroColocado = true;
        }
        return;
    }

    // 2. Teclas especiales (F1-F12, flechas, Tab, Enter, Esc, Shift, Bloq Mayús...):
    //    su nombre tiene más de un carácter. También ignoramos el espacio, porque si
    //    un botón tiene el foco, el espacio lo pulsa y no queremos mensaje de error
    if (event.key.length > 1 || event.key === " ") {
        return;
    }

    // 3. A partir de aquí solo quedan letras, números y símbolos

    // Verificar si es número (1-9)
    if (event.key >= "1" && event.key <= "9") {

        // Si pulsa el mismo número que ya hay en la celda, no hacemos nada
        if (event.key === document.getElementById(ultimaCelda).textContent)
            return;

        // Si el número ya está en otra celda, avisamos
        if (numerosUsados.includes(event.key)) {
            mostrarMensaje("No puedes repetir números",
                    "Cada cifra del 1 al 9 debe aparecer solo una vez");
            return;
        }

        const anterior = document.getElementById(ultimaCelda).textContent;
        if (anterior !== "") {
            const pos = numerosUsados.indexOf(anterior);
            numerosUsados.splice(pos, 1);
        }
        document.getElementById(ultimaCelda).textContent = event.key;
        numerosUsados.push(event.key);
        actualizarRestantes();
        numeroColocado = true;

    } else {
        // Letra, símbolo o el 0
        mostrarMensaje("Tecla no válida", "Solo se aceptan números del 1 al 9");
    }
}

elementos.btnResolver.addEventListener("click", resolver);

function esMagico() {
    let magico = true;
    let sumaDiagPrincipal = 0;
    let sumaDiagSecundaria = 0;

    for (var i = 0; i < NUM_FILAS; i++) {
        let sumaFila = 0;
        let sumaCol = 0;
        for (var j = 0; j < NUM_FILAS; j++) {
            let idFila = `${i}-${j}`;
            let idCol = `${j}-${i}`;
            sumaFila += Number(document.getElementById(idFila).textContent);
            sumaCol += Number(document.getElementById(idCol).textContent);
        }
        if (sumaCol !== SUMA || sumaFila !== SUMA) {
            magico = false;
        }
        sumaDiagPrincipal += Number(document.getElementById(`${i}-${i}`).textContent);
        sumaDiagSecundaria += Number(document.getElementById(`${i}-${NUM_FILAS - 1 - i}`).textContent);
    }
    return magico && sumaDiagPrincipal === SUMA && sumaDiagSecundaria === SUMA;
}

function verificarCuadradoMagico() {
    let llenas = 0;
// Comprobar si está completo
    celdas.forEach(function (celda) {
        if (celda.textContent !== "") {
            llenas += 1;
            celda.classList.remove("vacia");
            celda.classList.add("completada");
        } else {
            celda.classList.remove("completada");
            celda.classList.add("vacia");
        }
    });

    if (llenas !== NUM_CELDAS) {
        mostrarMensaje("Faltan celdas", `Todavía te falta(n) ${NUM_CELDAS - llenas} celda(s) por rellenar`);
        return;
    }
    intentos += 1;
    actualizarIntentos();
    if (esMagico()) {
        ganar();
    } else {
        fallos += 1;
        mostrarMensaje("Este cuadrado no es mágico", "Las sumas no coinciden. ¡Sigue intentando!");
        if (fallos >= NUM_INTENTOS) {
            fallos = 0;
            darPista();
        }
    }
}

function ganar() {
    pararCrono();
    juegoActivo = false;
    ultimaCelda = null;
    mostrarMensaje("¡FELICIDADES!",
            `Has resuelto el cuadrado mágico en ${segundos} segundos\n
            Suma mágica: ${SUMA}\n
            ¿Quieres intentar otro?`);
    celdas.forEach(function (celda) {
        celda.classList.remove("seleccionada", "completada");
        celda.classList.add("victoria");
    });
}

function darPista() {
    const solucion = mejorSolucion();
    let pistaDada = false;

    for (var i = 0; i < NUM_FILAS && !pistaDada; i++) {
        for (var j = 0; j < NUM_FILAS && !pistaDada; j++) {
            const celda = document.getElementById(`${i}-${j}`);
            const correcto = solucion[i * NUM_FILAS + j];

            if (celda.textContent !== correcto) {
                for (var k = 0; k < NUM_FILAS; k++) {
                    for (var l = 0; l < NUM_FILAS; l++) {
                        const otra = document.getElementById(`${k}-${l}`);
                        if (otra.textContent === correcto) {
                            otra.textContent = celda.textContent;
                        }
                    }
                }
                celda.textContent = correcto;
                elementos.mensajeTexto.textContent += `\nPista: hemos colocado un ${correcto} en la fila ${i + 1}, columna ${j + 1}`;
                pistaDada = true;
            }
        }
    }
    if (esMagico()) {
        ganar();
    }
}

function resolver() {
    if (!juegoActivo)
        return;
    const solucion = mejorSolucion();
    numerosUsados = new Array();

    for (var i = 0; i < NUM_FILAS; i++) {
        for (var j = 0; j < NUM_FILAS; j++) {
            const celda = document.getElementById(`${i}-${j}`);
            const numero = solucion[i * NUM_FILAS + j];

            celda.textContent = numero;
            celda.classList.remove("seleccionada", "vacia");
            celda.classList.add("completada");
            numerosUsados.push(numero);
        }
    }
    ganar();
    ultimaCelda = null;
    actualizarRestantes();
    pararCrono();
    juegoActivo = false;
    mostrarMensaje("Solución", `Esta es una solución válida (suma mágica: ${SUMA})\n
                    Pulsa «Nueva partida» para intentar otro`);
}


function mejorSolucion() {
    let mejor = SOLUCIONES[0];
    let maxCoincidencias = -1;
    SOLUCIONES.forEach(function (sol) {
        let coincidencias = 0;
        for (let i = 0; i < NUM_FILAS; i++) {
            for (let j = 0; j < NUM_FILAS; j++) {
                if (document.getElementById(`${i}-${j}`).textContent === sol[i * NUM_FILAS + j]) {
                    coincidencias += 1;
                }
            }
        }
        if (coincidencias > maxCoincidencias) {
            maxCoincidencias = coincidencias;
            mejor = sol;
        }
    });
    return mejor;
}

elementos.btnIniciar.addEventListener("click", reiniciarJuego);

function reiniciarJuego() {

// Limpiar todas las celdas
    celdas.forEach(function (celda) {
        celda.textContent = "";
        celda.classList.remove("seleccionada");
        celda.classList.remove("vacia");
        celda.classList.remove("victoria");
    });
    intentos = 0;
    fallos = 0;
    juegoActivo = true;
    numeroColocado = false;
    numerosUsados = new Array();
    inicio();
}