"use strict";

/*
    EPD3 - Ej6: verificación de reservas a partir de un código QR.
    La lectura del QR se simula pidiendo con prompt() la URL que contendría.
    Ejemplo: http://gympa.upo/reserva?actividad=spinning&duracion=45&id_participante=15
*/

// ================= CONSTANTES =================

const URL_EJEMPLO = "http://gympa.upo/reserva?actividad=spinning&duracion=45&id_participante=15";

const ACTIVIDADES_PERMITIDAS = ["spinning", "yoga", "pilates", "zumba", "crossfit", "aqua", "bodycombat", "trx"];
const DURACION_MIN = 30;
const DURACION_MAX = 120;
const ID_MIN = 1;
const ID_MAX = 50;

const COSTE_BASE = 1.5;             // € por participante
const SUPLEMENTO_DURACION = 0.5;    // € si la duración supera DURACION_SUPLEMENTO
const DURACION_SUPLEMENTO = 30;     // minutos
const ID_RAPIDO_MAX = 15;           // los identificadores de 1 a 15 reservan rápido
const DESCUENTO_RAPIDO = 0.10;

const ERROR_AUSENTE = "Incorrecto - Parámetro ausente";

// Elementos de la página (el script está al final del body, ya existen)
const cuerpoTabla = document.getElementById("cuerpo");
const urlLeida    = document.getElementById("url-leida");
const estado      = document.getElementById("estado");


// ================= EXTRACCIÓN =================

// Devuelve los tres parámetros como texto, o null si no aparecen en la URL
function extraerParametros(url) {
    const sinFragmento = url.split("#")[0];
    const posicion = sinFragmento.indexOf("?");
    const consulta = new URLSearchParams(posicion === -1 ? "" : sinFragmento.slice(posicion + 1));

    return {
        actividad: consulta.get("actividad"),
        duracion: consulta.get("duracion"),
        idParticipante: consulta.get("id_participante")
    };
}


// ================= VALIDACIÓN =================
// Cada validador devuelve el mensaje de error, o "" si el valor es correcto.

const estaAusente = valor => valor === null || valor.trim() === "";
const esNumero    = valor => /^-?\d+(\.\d+)?$/.test(valor.trim());
const esEntero    = valor => /^-?\d+$/.test(valor.trim());

function validarActividad(valor) {
    if (estaAusente(valor)) {
        return ERROR_AUSENTE;
    }
    if (!ACTIVIDADES_PERMITIDAS.includes(valor.trim().toLowerCase())) {
        return "Incorrecto - Actividad no reconocida";
    }
    return "";
}

function validarDuracion(valor) {
    if (estaAusente(valor)) {
        return ERROR_AUSENTE;
    }
    if (!esNumero(valor)) {
        return "Incorrecto - No es un número válido";
    }
    const minutos = Number(valor);
    if (minutos < DURACION_MIN) {
        return `Incorrecto - Duración mínima no alcanzada (${DURACION_MIN} min)`;
    }
    if (minutos > DURACION_MAX) {
        return `Incorrecto - Duración máxima excedida (${DURACION_MAX} min)`;
    }
    return "";
}

function validarIdentificador(valor) {
    if (estaAusente(valor)) {
        return ERROR_AUSENTE;
    }
    if (!esEntero(valor)) {
        return "Incorrecto - Debe ser un número entero";
    }
    const id = Number(valor);
    if (id < ID_MIN || id > ID_MAX) {
        return `Incorrecto - Fuera de rango (${ID_MIN} a ${ID_MAX})`;
    }
    return "";
}


// ================= CÁLCULO =================

function redondear(euros) {
    return Math.round(euros * 100) / 100;   // a céntimos
}

function calcularCoste(duracion, idParticipante) {
    let coste = COSTE_BASE;
    if (duracion > DURACION_SUPLEMENTO) {
        coste += SUPLEMENTO_DURACION;
    }
    if (idParticipante <= ID_RAPIDO_MAX) {   // ya validado: está entre 1 y ID_MAX
        coste *= 1 - DESCUENTO_RAPIDO;
    }
    return redondear(coste);
}

// Analiza la URL y devuelve el resultado, sin tocar la página
function analizarReserva(url) {
    const { actividad, duracion, idParticipante } = extraerParametros(url);

    const parametros = [
        { nombre: "Actividad", valor: actividad, error: validarActividad(actividad) },
        { nombre: "Duración", valor: duracion, error: validarDuracion(duracion) },
        { nombre: "Identificador del participante", valor: idParticipante, error: validarIdentificador(idParticipante) }
    ];
    const aceptada = parametros.every(parametro => parametro.error === "");
    const coste = aceptada ? calcularCoste(Number(duracion), Number(idParticipante)) : null;

    return { parametros, aceptada, coste };
}


// ================= PRESENTACIÓN =================

function añadirFila(textos, claseValidacion, claseFila = "") {
    const fila = document.createElement("tr");
    fila.className = claseFila;
    textos.forEach((texto, indice) => {
        const celda = document.createElement("td");
        celda.textContent = texto;
        if (indice === 2) {
            celda.className = claseValidacion;
        }
        fila.appendChild(celda);
    });
    cuerpoTabla.appendChild(fila);
}

function mostrarResultado(url, resultado) {
    urlLeida.textContent = url.trim() === "" ? "(vacía)" : url.trim();
    cuerpoTabla.replaceChildren();

    resultado.parametros.forEach(({ nombre, valor, error }) => {
        const correcto = error === "";
        añadirFila(
            [nombre, valor ?? "(no indicado)", correcto ? "Correcta" : error],
            correcto ? "correcta" : "incorrecta"
        );
    });

    const { aceptada, coste } = resultado;
    añadirFila(
        ["Coste total", aceptada ? `${coste.toFixed(2)} €` : "", aceptada ? "RESERVA REALIZADA" : "RESERVA RECHAZADA"],
        aceptada ? "correcta" : "incorrecta",
        "total"
    );
}

// Simula el escaneo: pide la URL "contenida en el QR" y la analiza
function escanearQR() {
    const url = prompt("Simulación de lectura de un código QR.\nIntroduzca la URL que contiene:", URL_EJEMPLO);
    if (url === null) {
        estado.textContent = "Lectura cancelada.";
        return;
    }
    estado.textContent = "";
    mostrarResultado(url, analizarReserva(url));
}

document.getElementById("escanear").addEventListener("click", escanearQR);
setTimeout(escanearQR, 50);   // deja pintar la página antes de abrir el primer diálogo
