/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

"use strict";
const TIEMPO_INICIAL = 180; //tiempo límite (3 mins)
const elementos = {
    crono: document.getElementById("crono"),
    numeroObjetivo: document.getElementById("numeroObjetivo"),
    tablero: document.getElementById("tablero"),
    mensajes: document.getElementById("mensajes"),
    restantes: document.getElementById("celdasRestantes"),
    info: document.getElementById("info"),
    btnIiniciar: document.getElementById("nuevaPartida"),
    btnResolver: document.getElementById("resolver")
};

const celdas = document.querySelectorAll(".celda");
let ultimaCelda = null;

window.onload = function () {
    ultimaCelda = "1-1";
    document.getElementById(ultimaCelda).classList.add("seleccionada");
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

function seleccionarCelda(evento, idCelda) {
    evento.stopPropagation();

// Cambiar color de celda activa
    if (ultimaCelda === idCelda) {
        document.getElementById(ultimaCelda).classList.remove("seleccionada");
        ultimaCelda = null;
    } else {
        document.getElementById(idCelda).classList.add("seleccionada");
        ultimaCelda = idCelda;
    }

// Actualizar variable de celda seleccionada

}

function validarTecla(event) {

// Verificar si es número (0-9)

// Mostrar aviso si no es válido

// Colocar número en celda activa

}

function verificarCuadradoMagico() {

// Comprobar si está completo

// Calcular sumas de filas, columnas y diagonales

// Verificar si todas las sumas son iguales

// Mostrar resultado (victoria o continuar)
}

function reiniciarJuego() {

// Limpiar todas las celdas

// Restablecer colores

// Seleccionar celda central

}