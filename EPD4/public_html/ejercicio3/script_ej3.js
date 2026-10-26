"use strict";
const TIEMPO_INICIAL = 180; //tiempo límite (3 mins)
const NUM_FILAS = 3;
const NUM_CELDAS = NUM_FILAS * NUM_FILAS;
const SUMA = (NUM_FILAS * (NUM_CELDAS + 1)) / 2;
const NUM_INTENTOS = 3;

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
let intentosRestantes = NUM_INTENTOS;
let segundos = 0;
let intervalo = null;

window.onload = inicio;

function inicio() {
    ultimaCelda = "1-1";
    document.getElementById(ultimaCelda).classList.add("seleccionada");
    elementos.sumaObjetivo.textContent = `Suma objetivo: ${SUMA}`;
    elementos.restantes.textContent = `Celdas restantes: ${NUM_CELDAS}`;
    elementos.intentos.textContent = `Intentos restantes: ${intentosRestantes}`;
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

//cuando se seleccione una celda
celdas.forEach(function (celda) {
    celda.addEventListener("click", function (evento) {
        if (ultimaCelda !== null) {
            document.getElementById(ultimaCelda).classList.remove("seleccionada");
        }
        seleccionarCelda(evento, celda.id);
    });
});

document.addEventListener("keydown", function (k) {
    if (k.repeat)
        return;
    if (ultimaCelda !== null) {
        validarTecla(k);
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
        if (event.key === document.getElementById(ultimaCelda).textContent) {
            return;
        }

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

    } else {
        // Letra, símbolo o el 0
        mostrarMensaje("Tecla no válida", "Solo se aceptan números del 1 al 9");
    }
}

elementos.btnResolver.addEventListener("click", verificarCuadradoMagico);

function verificarCuadradoMagico() {
    let llenas = 0;
// Comprobar si está completo
    celdas.forEach(function (celda) {
        if (celda.textContent !== "") {
            llenas += 1;
        } else {
            celda.classList.add("vacia");
        }
    });
    if (llenas !== NUM_CELDAS) {
        mostrarMensaje("Faltan celdas", `Todavía te faltan ${NUM_CELDAS - llenas} celdas por rellenar`);
        restarIntento();
    } else {
        //verificamos la suma de las filas y columnas
        let esMagico = true;
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
                esMagico = false;
            }
        }

        for (var i = 0; i < NUM_FILAS; i++) {
            let idFila = `${i}-${i}`;
            let idFilaInv = `${i}-${NUM_FILAS - 1 - i}`;
            sumaDiagPrincipal += Number(document.getElementById(idFila).textContent);
            sumaDiagSecundaria += Number(document.getElementById(idFilaInv).textContent);
        }

        if (esMagico && sumaDiagPrincipal === SUMA && sumaDiagSecundaria === SUMA) {
            pararCrono();
            mostrarMensaje("¡FELICIDADES!",
                    `Has resuelto el cuadrado mágico en ${segundos} segundos<br>Suma mágica: ${SUMA}<br>¿Quieres intentar otro?`);
            celdas.forEach(function (celda) {
                celda.classList.add("victoria");
            });
            restarIntento();
        } else {
            mostrarMensaje("Este no es un cuadrado mágico",
                    "Las sumas no coinciden. ¡Sigue intentando!");
            restarIntento();
        }
    }
    elementos.restantes.textContent = `Celdas restantes: ${NUM_CELDAS - llenas}`;
}

function restarIntento() {
    intentosRestantes -= 1;
    elementos.intentos.textContent = `Intentos restantes: ${intentosRestantes}`;
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
    intentosRestantes = NUM_INTENTOS;
    numerosUsados = new Array();
    inicio();
}