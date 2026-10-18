"use strict";

/*
    EPD3 - Ej3: formateo de códigos de actividades deportivas.
    Reglas por posición (empezando en 0), de mayor a menor prioridad:
      1. múltiplo de 5 -> se sustituye por SUSTITUTO
      2. múltiplo de 3 -> minúscula
      3. par           -> mayúscula
    La posición 0 solo se considera par (así lo indica el ejemplo del guión).
*/

const SUSTITUTO = "*";   // ponga "" para eliminar el carácter en vez de sustituirlo

// Elementos de la página (el script está al final del body, ya existen)
const salida = document.getElementById("salida");
const estado = document.getElementById("estado");

function formatearCodigo(codigo) {
    let resultado = "";
    for (let posicion = 0; posicion < codigo.length; posicion++) {
        const caracter = codigo.charAt(posicion);
        if (posicion > 0 && posicion % 5 === 0) {
            resultado += SUSTITUTO;
        } else if (posicion > 0 && posicion % 3 === 0) {
            resultado += caracter.toLowerCase();
        } else if (posicion % 2 === 0) {
            resultado += caracter.toUpperCase();
        } else {
            resultado += caracter;
        }
    }
    return resultado;
}

function procesarCodigo() {
    estado.textContent = "";
    salida.textContent = "";

    let aviso = "";
    let codigo;
    do {
        codigo = prompt(`${aviso}Introduzca el código de actividad:`);
        if (codigo === null) {
            estado.textContent = "Operación cancelada.";
            return;
        }
        aviso = "ERROR: el código no puede estar vacío.\n\n";
    } while (codigo === "");

    const resultado = formatearCodigo(codigo);
    salida.textContent = `Entrada: "${codigo}"\nSalida: "${resultado}"`;
    alert(`Resultado: ${resultado}`);
}

document.getElementById("iniciar").addEventListener("click", procesarCodigo);
setTimeout(procesarCodigo, 50);   // deja pintar la página antes de abrir el primer diálogo
