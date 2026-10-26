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
    if (event.key >= "1" && event.key <= "9") {
        document.getElementById(ultimaCelda).textContent = event.key;
    } else if ((event.keyCode >= 65 && event.keyCode <= 90) || (event.keyCode >= 97 && event.keyCode <= 122)) {
        window.alert("el valor introducido no es válido (1-9)");
    }
}

elementos.btnResolver.addEventListener("click", function(e){
    
});

function verificarCuadradoMagico() {


}

function reiniciarJuego() {

// Limpiar todas las celdas

// Restablecer colores

// Seleccionar celda central

}