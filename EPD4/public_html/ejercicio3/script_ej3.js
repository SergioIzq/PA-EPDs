/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

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
    restantes: document.getElementById("celdasRestantes"),
    info: document.getElementById("info"),
    btnIniciar: document.getElementById("nuevaPartida"),
    btnResolver: document.getElementById("resolver")
};

const celdas = document.querySelectorAll(".celda");
let ultimaCelda = null;
let numerosUsados = new Array();
let intentosRestantes = NUM_INTENTOS;

window.onload = inicio;

function inicio() {
    ultimaCelda = "1-1";
    document.getElementById(ultimaCelda).classList.add("seleccionada");
    elementos.sumaObjetivo.textContent = `Suma objetivo: ${SUMA}`;
    elementos.restantes.textContent = `Celdas restantes: ${NUM_CELDAS}`;
    elementos.intentos.textContent = `Intentos restantes: ${intentosRestantes}`;
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

    // Verificar si es número (0-9)
    if (event.key >= "1" && event.key <= "9" && !numerosUsados.includes(event.key)) {
        if (document.getElementById(ultimaCelda).textContent !== "") {
            const anterior = document.getElementById(ultimaCelda).textContent;
            if (anterior !== "") {
                const pos = numerosUsados.indexOf(anterior);
                numerosUsados.splice(pos, 1);
            }
        }
        document.getElementById(ultimaCelda).textContent = event.key;
        numerosUsados.push(event.key);
    } else if ((event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 97 && event.keyCode <= 122)) {
        window.alert("el valor introducido no es válido (1-9)");
    }
}

elementos.btnResolver.addEventListener("click", verificarCuadradoMagico);

function verificarCuadradoMagico() {
    let llenas = 0;
// Comprobar si está completo
    celdas.forEach(function (celda) {
        if (document.getElementById(celda.id).textContent !== "") {
            llenas += 1;
        }
        document.getElementById(celda.id).classList.add("vacia");
    });
    if (llenas !== NUM_CELDAS) {
        window.alert("hueles a nabo");
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
            window.alert("ta joya");
            celdas.forEach(function (celda) {
                document.getElementById(celda.id).classList.add("victoria");
            });
            restarIntento();
        } else {
            window.alert("no ta joya");
            restarIntento();
        }
        elementos.restantes.textContent = `Restantes: ${NUM_CELDAS - llenas}`;
    }

    function restarIntento() {
        intentosRestantes -= 1;
        elementos.intentos.textContent = `Intentos restantes: ${intentosRestantes}`;
    }

    elementos.btnIniciar.addEventListener("click", reiniciarJuego);

    function reiniciarJuego() {

// Limpiar todas las celdas
        celdas.forEach(function (celda) {
            document.getElementById(celda.id).textContent = "";
            document.getElementById(celda.id).classList.remove("seleccionada");
        });
        intentosRestantes = NUM_INTENTOS;
        numerosUsados = new Array();
        inicio();
    }
}