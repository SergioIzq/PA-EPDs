"use strict";

/*
    EPD3 - Ej4 (página 2): calculadora de cuotas del gimnasio.
    Cada función adapta la técnica de un snippet de https://css-tricks.com/snippets/javascript/
    (las URLs concretas están en el pie de cuotas.html).
*/

const PLANES = {
    basico:  { nombre: "Básico",  precio: 29.9 },
    plus:    { nombre: "Plus",    precio: 44.5 },
    premium: { nombre: "Premium", precio: 69 }
};
const EXTRAS = {
    piscina:    { nombre: "Piscina",             precio: 12.5 },
    entrenador: { nombre: "Entrenador personal", precio: 60 },
    toalla:     { nombre: "Servicio de toalla",  precio: 5 }
};
const DESCUENTOS = [                 // de mayor a menor duración
    { desde: 24, porcentaje: 15 },
    { desde: 12, porcentaje: 10 },
    { desde: 6,  porcentaje: 5 }
];
const CUOTA_ALTA = 25;
const MESES_SIN_ALTA = 12;
const MESES_MIN = 1;
const MESES_MAX = 24;

// Elementos de la página (el script está al final del body, ya existen)
const campoPlan = document.getElementById("plan");
const campoMeses = document.getElementById("meses");
const textoMeses = document.getElementById("meses-texto");
const casillasExtras = document.querySelectorAll('input[name="extra"]');
const desglose = document.getElementById("desglose");
const aviso = document.getElementById("aviso");
const campoEnlace = document.getElementById("enlace");


// ================= SNIPPETS ADAPTADOS =================

// Snippet "Required Parameters for Functions in JavaScript":
// si falta el argumento, el valor por defecto lanza un error
function obligatorio(nombre) {
    throw new Error(`Falta el parámetro obligatorio "${nombre}".`);
}

// Snippet "Put Comma Values in Numbers": separador de miles con una expresión regular
function separarMiles(entero) {
    return entero.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Snippets "Format Currency" y "Default Arguments for Functions": 1234.5 -> "1.234,50 €"
function formatearMoneda(importe, simbolo = "€", decimales = 2) {
    const [entera, decimal] = Math.abs(importe).toFixed(decimales).split(".");
    const signo = importe < 0 ? "-" : "";
    return `${signo}${separarMiles(entera)}${decimal === undefined ? "" : "," + decimal} ${simbolo}`;
}

// Snippet "Get URL Variables": convierte ?plan=plus&meses=12 en { plan: "plus", meses: "12" }
function leerVariablesURL() {
    const variables = {};
    const consulta = window.location.search.slice(1);
    if (consulta === "") {
        return variables;
    }
    consulta.split("&").forEach(par => {
        const [clave, valor = ""] = par.split("=");
        variables[decodeURIComponent(clave)] = decodeURIComponent(valor);
    });
    return variables;
}


// ================= LÓGICA =================

const redondear = importe => Math.round(importe * 100) / 100;

function calcularCuota(plan = obligatorio("plan"), meses = obligatorio("meses"), extras = []) {
    if (!Object.hasOwn(PLANES, plan)) {
        throw new Error(`Plan desconocido: "${plan}".`);
    }
    if (!Number.isInteger(meses) || meses < MESES_MIN || meses > MESES_MAX) {
        throw new Error(`Los meses deben ser un entero entre ${MESES_MIN} y ${MESES_MAX}.`);
    }
    if (!extras.every(extra => Object.hasOwn(EXTRAS, extra))) {
        throw new Error("Extra desconocido.");
    }

    const mensual = redondear(extras.reduce((suma, extra) => suma + EXTRAS[extra].precio, PLANES[plan].precio));
    const bruto = redondear(mensual * meses);
    const descuento = DESCUENTOS.find(tramo => meses >= tramo.desde);
    const porcentaje = descuento === undefined ? 0 : descuento.porcentaje;
    const importeDescuento = redondear(bruto * porcentaje / 100);
    const alta = meses >= MESES_SIN_ALTA ? 0 : CUOTA_ALTA;
    const total = redondear(bruto - importeDescuento + alta);

    return { plan, meses, extras, mensual, bruto, porcentaje, importeDescuento, alta, total, porMes: redondear(total / meses) };
}


// ================= PRESENTACIÓN =================

function añadirFila(concepto, importe, clase = "") {
    const fila = document.createElement("tr");
    fila.className = clase;
    [concepto, importe].forEach(texto => {
        const celda = document.createElement("td");
        celda.textContent = texto;
        fila.appendChild(celda);
    });
    desglose.appendChild(fila);
}

function extrasMarcados() {
    return [...casillasExtras].filter(casilla => casilla.checked).map(casilla => casilla.value);
}

function actualizar() {
    const meses = Number(campoMeses.value);
    textoMeses.textContent = `${meses} ${meses === 1 ? "mes" : "meses"}`;
    desglose.replaceChildren();
    aviso.textContent = "";

    try {
        const cuota = calcularCuota(campoPlan.value, meses, extrasMarcados());

        añadirFila(`Plan ${PLANES[cuota.plan].nombre}`, formatearMoneda(PLANES[cuota.plan].precio));
        cuota.extras.forEach(extra => añadirFila(`Extra: ${EXTRAS[extra].nombre}`, formatearMoneda(EXTRAS[extra].precio)));
        añadirFila("Cuota mensual", formatearMoneda(cuota.mensual));
        añadirFila(`Subtotal (${cuota.meses} ${cuota.meses === 1 ? "mes" : "meses"})`, formatearMoneda(cuota.bruto));
        if (cuota.porcentaje > 0) {
            añadirFila(`Descuento por permanencia (${cuota.porcentaje} %)`, formatearMoneda(-cuota.importeDescuento), "descuento");
        }
        añadirFila("Cuota de alta", cuota.alta === 0 ? "Gratis" : formatearMoneda(cuota.alta));
        añadirFila("Total", formatearMoneda(cuota.total), "total");
        añadirFila("Equivale a", `${formatearMoneda(cuota.porMes)} al mes`);
    } catch (error) {
        aviso.textContent = `ERROR: ${error.message}`;
    }
}

// Rellena el formulario con las variables de la URL que sean válidas
function cargarDesdeURL() {
    const { plan, meses, extras } = leerVariablesURL();
    if (plan !== undefined && Object.hasOwn(PLANES, plan)) {
        campoPlan.value = plan;
    }
    if (meses !== undefined && /^\d+$/.test(meses) && Number(meses) >= MESES_MIN && Number(meses) <= MESES_MAX) {
        campoMeses.value = meses;
    }
    if (extras !== undefined) {
        const elegidos = extras.split(",");
        // Snippet "Loop Over querySelectorAll Matches"
        document.querySelectorAll('input[name="extra"]').forEach(casilla => {
            casilla.checked = elegidos.includes(casilla.value);
        });
    }
}

function generarEnlace() {
    const base = window.location.href.split("#")[0].split("?")[0];
    const parametros = new URLSearchParams({ plan: campoPlan.value, meses: campoMeses.value });
    if (extrasMarcados().length > 0) {
        parametros.set("extras", extrasMarcados().join(","));
    }
    campoEnlace.value = `${base}?${parametros.toString().replace(/%2C/g, ",")}`;
    campoEnlace.select();
    if (navigator.clipboard) {
        navigator.clipboard.writeText(campoEnlace.value).catch(() => {});   // si no hay permiso, queda seleccionado
    }
}

[campoPlan, campoMeses, ...casillasExtras].forEach(campo => campo.addEventListener("input", actualizar));
document.getElementById("generar-enlace").addEventListener("click", generarEnlace);

cargarDesdeURL();
actualizar();
