"use strict";

/*
    EPD3 - Ej4 (página 1): sorteo de equipos.
    Cada función adapta la técnica de un snippet de https://css-tricks.com/snippets/javascript/
    (las URLs concretas están en el pie de equipos.html).
*/

const MAX_EQUIPOS = 20;
const EJEMPLO = "Ana, Luis, Marta, Pablo, Lucía, Sergio, Carmen, David, Elena, Javier, Laura, Carlos, ana, Marta";

// Elementos de la página (el script está al final del body, ya existen)
const campoNombres = document.getElementById("nombres");
const campoEquipos = document.getElementById("num-equipos");
const campoCapitanes = document.getElementById("capitanes");
const aviso = document.getElementById("aviso");
const resultado = document.getElementById("resultado");


// ================= SNIPPETS ADAPTADOS =================

// Snippet "Remove Duplicates from an Array": un Set descarta repetidos.
// Aquí además "Ana" y "ana" cuentan como la misma persona (se conserva la primera).
function quitarDuplicados(lista) {
    const vistos = new Set();
    return lista.filter(nombre => {
        const clave = nombre.toLowerCase();
        if (vistos.has(clave)) {
            return false;
        }
        vistos.add(clave);
        return true;
    });
}

// Snippet "Shuffle Array": mezcla Fisher-Yates sobre una copia (no modifica la original)
function barajar(lista) {
    const copia = [...lista];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia;
}

// Snippet "Select Random Item from an Array"
function elegirAleatorio(lista) {
    return lista[Math.floor(Math.random() * lista.length)];
}

// Snippet "How To Generate a Random Color in JavaScript"
function colorAleatorio() {
    return "#" + Math.floor(Math.random() * 0x1000000).toString(16).padStart(6, "0");
}

// Complemento: el texto se pone en negro o blanco según la luminosidad del color de fondo
function colorTexto(hex) {
    const rojo = parseInt(hex.slice(1, 3), 16);
    const verde = parseInt(hex.slice(3, 5), 16);
    const azul = parseInt(hex.slice(5, 7), 16);
    const luminosidad = 0.299 * rojo + 0.587 * verde + 0.114 * azul;
    return luminosidad > 150 ? "#111" : "#fff";
}


// ================= LÓGICA =================

function leerNombres(texto) {
    return texto.split(/[\n,;]+/).map(nombre => nombre.trim()).filter(nombre => nombre !== "");
}

// Reparte la lista (ya mezclada) por turnos para que los equipos queden equilibrados
function repartir(lista, cantidad) {
    const equipos = Array.from({ length: cantidad }, () => []);
    lista.forEach((nombre, indice) => equipos[indice % cantidad].push(nombre));
    return equipos;
}

function mostrarAviso(texto, esError = false) {
    aviso.textContent = texto;
    aviso.classList.toggle("error", esError);   // snippet "The .classList() API"
}

function dibujarEquipos(equipos, conCapitan) {
    resultado.replaceChildren();

    equipos.forEach((miembros, indice) => {
        const color = colorAleatorio();
        const capitan = conCapitan ? elegirAleatorio(miembros) : null;

        const tarjeta = document.createElement("article");
        tarjeta.classList.add("equipo");

        const titulo = document.createElement("h3");
        titulo.textContent = `Equipo ${indice + 1}`;
        titulo.style.background = color;
        titulo.style.color = colorTexto(color);

        const lista = document.createElement("ul");
        miembros.forEach(nombre => {
            const elemento = document.createElement("li");
            elemento.textContent = nombre;
            if (nombre === capitan) {
                elemento.classList.add("capitan");
            }
            lista.appendChild(elemento);
        });

        tarjeta.append(titulo, lista);
        resultado.appendChild(tarjeta);
    });

    // Snippet "Loop Over querySelectorAll Matches": las tarjetas entran escalonadas
    document.querySelectorAll(".equipo").forEach((tarjeta, indice) => {
        tarjeta.style.animationDelay = `${indice * 80}ms`;
    });
}

function sortear() {
    const nombres = leerNombres(campoNombres.value);
    const unicos = quitarDuplicados(nombres);
    const cantidad = Number(campoEquipos.value);

    if (unicos.length < 2) {
        resultado.replaceChildren();
        mostrarAviso("ERROR: escriba al menos dos nombres distintos.", true);
        return;
    }
    if (!Number.isInteger(cantidad) || cantidad < 2 || cantidad > Math.min(unicos.length, MAX_EQUIPOS)) {
        resultado.replaceChildren();
        mostrarAviso(`ERROR: el número de equipos debe ser un entero entre 2 y ${Math.min(unicos.length, MAX_EQUIPOS)}.`, true);
        return;
    }

    dibujarEquipos(repartir(barajar(unicos), cantidad), campoCapitanes.checked);

    const repetidos = nombres.length - unicos.length;
    mostrarAviso(`${unicos.length} participantes en ${cantidad} equipos`
        + (repetidos > 0 ? ` (se han descartado ${repetidos} nombre${repetidos === 1 ? "" : "s"} repetido${repetidos === 1 ? "" : "s"}).` : "."));
}

document.getElementById("sortear").addEventListener("click", sortear);
document.getElementById("ejemplo").addEventListener("click", () => {
    campoNombres.value = EJEMPLO.split(", ").join("\n");
    campoEquipos.value = 3;
    sortear();
});
