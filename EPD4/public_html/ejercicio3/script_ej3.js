/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

"use strict";
const TIEMPO_INICIAL = 180; //tiempo límite (3 mins)
const NUM_FILAS = 3;
const NUM_CELDAS = NUM_FILAS * NUM_FILAS;
const SUMA = (NUM_FILAS * (NUM_CELDAS + 1)) / 2;
const elementos = {
    crono: document.getElementById("crono"),
    sumaObjetivo: document.getElementById("sumaObjetivo"),
    tablero: document.getElementById("tablero"),
    mensajes: document.getElementById("mensajes"),
    restantes: document.getElementById("celdasRestantes"),
    info: document.getElementById("info"),
    btnIiniciar: document.getElementById("nuevaPartida"),
    btnResolver: document.getElementById("resolver")
};

const celdas = document.querySelectorAll(".celda");
let ultimaCelda = null;
let numerosUsados = new Array();

window.onload = function () {
    ultimaCelda = "1-1";
    document.getElementById(ultimaCelda).classList.add("seleccionada");
    elementos.sumaObjetivo.textContent = `Suma objetivo: ${SUMA} `;
};

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
        document.getElementById(idCelda).classList.add("seleccionada");
        ultimaCelda = idCelda;
    }
}

function validarTecla(event) {

    // Verificar si es número (0-9)
    if (event.key >= "1" && event.key <= "9" && !numerosUsados.includes(event.key)) {
        if (document.getElementById(ultimaCelda).textContent !== "") {
            numerosUsados.pop(document.getElementById(ultimaCelda).textContent);
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
    });
    if (llenas !== NUM_CELDAS) {
        window.alert("hueles a nabo");
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
        } else {
            window.alert("no ta joya");
        }
    }
}

function reiniciarJuego() {

// Limpiar todas las celdas

// Restablecer colores

// Seleccionar celda central

}