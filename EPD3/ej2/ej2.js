"use strict";

/*
    EPD3 - Ej2: coste de envío de un paquete.
    Los datos se piden con prompt() y el resumen se muestra en la página.
*/

const TARIFAS = { local: 2.5, nacional: 4, internacional: 8.5 };   // € por kg facturable
const SUPLEMENTO_INTERNACIONAL = 12;                                // € fijos
const DIVISOR_VOLUMETRICO = 5000;
const PESO_MAX = 30;                                                // kg
const DIMENSION_MAX = 120;                                          // cm
const PESO_RECARGO = 20;                                            // kg facturables a partir de los que hay recargo
const PORCENTAJE_RECARGO = 15;

// Elementos de la página (el script está al final del body, ya existen)
const salida = document.getElementById("salida");
const estado = document.getElementById("estado");


// ================= LÓGICA =================

// Convierte texto a número (acepta coma decimal). Devuelve NaN si no es un número
function leerNumero(valor) {
    const texto = String(valor).trim().replace(",", ".");
    return /^\d+(\.\d+)?$/.test(texto) ? Number(texto) : NaN;
}

/*
    Valida los datos y calcula el envío.
    Datos incorrectos: devuelve { error: "..." } con el tipo de error.
    Datos válidos: devuelve el desglose del envío.
*/
function calcular(pesoReal, largo, ancho, alto, destino) {
    const peso = leerNumero(pesoReal);
    const dimensiones = [largo, ancho, alto].map(leerNumero);
    const tipoDestino = String(destino).trim().toLowerCase();

    const pesoValido = peso > 0 && peso <= PESO_MAX;
    const dimensionesValidas = dimensiones.every(
        medida => Number.isInteger(medida) && medida > 0 && medida <= DIMENSION_MAX);
    if (!pesoValido || !dimensionesValidas) {
        return { error: "DATOS INCORRECTOS" };
    }
    if (!Object.hasOwn(TARIFAS, tipoDestino)) {
        return { error: "DESTINO INCORRECTO" };
    }

    const [medidaLargo, medidaAncho, medidaAlto] = dimensiones;
    const pesoVolumetrico = (medidaLargo * medidaAncho * medidaAlto) / DIVISOR_VOLUMETRICO;
    const pesoFacturable = Math.ceil(Math.max(peso, pesoVolumetrico));
    const suplemento = tipoDestino === "internacional" ? SUPLEMENTO_INTERNACIONAL : 0;
    const subtotal = pesoFacturable * TARIFAS[tipoDestino] + suplemento;
    const recargo = pesoFacturable > PESO_RECARGO ? subtotal * PORCENTAJE_RECARGO / 100 : 0;

    return {
        pesoReal: peso,
        pesoVolumetrico,
        pesoFacturable,
        suplemento,
        recargo,
        precioTotal: subtotal + recargo
    };
}


// ================= PRESENTACIÓN =================

const euros = importe => `${importe.toFixed(2)}€`;

// Líneas del resumen a partir del objeto que devuelve calcular()
function generarResumen(envio) {
    const lineas = [
        `Peso real: ${envio.pesoReal} kg`,
        `Peso volumétrico: ${envio.pesoVolumetrico.toFixed(2)} kg`,
        `Peso facturable: ${envio.pesoFacturable} kg`
    ];
    if (envio.suplemento > 0) {
        lineas.push(`Suplemento internacional: ${euros(envio.suplemento)}`);
    }
    if (envio.recargo > 0) {
        lineas.push(`Recargo por peso elevado: ${euros(envio.recargo)}`);
    }
    lineas.push(`Precio del envío: ${euros(envio.precioTotal)}`);
    return lineas;
}

function calcularEnvio() {
    estado.textContent = "";
    salida.textContent = "";

    const preguntas = ["Peso del paquete", "Largo", "Ancho", "Alto", "Destino"];
    const sufijos = [" (kg)", " (cm)", " (cm)", " (cm)", " (LOCAL, NACIONAL o INTERNACIONAL)"];
    const datos = [];
    for (let i = 0; i < preguntas.length; i++) {
        const entrada = prompt(`${preguntas[i]}${sufijos[i]}:`);
        if (entrada === null) {
            estado.textContent = "Operación cancelada.";
            return;
        }
        datos.push(entrada.trim());
    }

    const envio = calcular(...datos);
    const lineas = preguntas.map((pregunta, i) => `${pregunta}: ${datos[i]}`);
    lineas.push("");
    if (envio.error !== undefined) {
        lineas.push(`ERROR: ${envio.error}`);
    } else {
        lineas.push(...generarResumen(envio));
    }
    salida.textContent = lineas.join("\n");
}

document.getElementById("iniciar").addEventListener("click", calcularEnvio);
setTimeout(calcularEnvio, 50);   // deja pintar la página antes de abrir el primer diálogo
