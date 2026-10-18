"use strict";
/*
    EPD3 - Ej1: informe estadístico de calificaciones.
    Las notas se piden con prompt() y el informe se muestra en la página.
*/
const NOTA_MIN = 0;
const NOTA_MAX = 10;
const NIVELES = ["Sobresaliente", "Notable", "Aprobado", "Suspenso"];

// Elementos de la página (el script está al final del body, ya existen)
const salida = document.getElementById("salida");
const estado = document.getElementById("estado");

/*
    Pide un número hasta que sea válido (acepta coma o punto decimal).
    "esValido" recibe el número y decide si se acepta.
    Devuelve el número, o null si el usuario cancela el diálogo.
*/
function pedirNumero(pregunta, esValido, mensajeError) {
    let aviso = "";
    while (true) {
        const entrada = prompt(aviso + pregunta);
        if (entrada === null) {
            return null;
        }
        const texto = entrada.trim().replace(",", ".");
        if (/^\d+(\.\d+)?$/.test(texto) && esValido(Number(texto))) {
            return Number(texto);
        }
        aviso = `${mensajeError}\n\n`;
    }
}


// ================= CÁLCULOS =================

function clasificar(nota) {
    if (nota >= 8) {
        return "Sobresaliente";
    }
    if (nota >= 6) {
        return "Notable";
    }
    if (nota >= 4) {
        return "Aprobado";
    }
    return "Suspenso";
}

function redondear(valor) {
    return Math.round(valor * 100) / 100;   // a dos decimales
}

function describirCantidad(cantidad) {
    return `${cantidad} estudiante${cantidad === 1 ? "" : "s"}`;
}

// Devuelve las líneas del resumen final
function generarInforme(notas) {
    const total = notas.length;
    const media = redondear(notas.reduce((suma, nota) => suma + nota, 0) / total);

    const recuento = {};
    NIVELES.forEach(nivel => { recuento[nivel] = 0; });
    notas.forEach(nota => { recuento[clasificar(nota)]++; });

    const ascendente = [...notas].sort((a, b) => a - b);
    const descendente = [...ascendente].reverse();

    return [
        `Calificación máxima: ${Math.max(...notas)}`,
        `Calificación mínima: ${Math.min(...notas)}`,
        `Calificación media: ${media}`,
        "Distribución de niveles:",
        ...NIVELES.map(nivel =>
            `- ${nivel}: ${describirCantidad(recuento[nivel])} (${redondear(recuento[nivel] / total * 100)}%)`),
        `Calificaciones ordenadas (Mayor a menor): ${descendente.join(", ")}`,
        `Calificaciones ordenadas (Menor a mayor): ${ascendente.join(", ")}`
    ];
}


// ================= PROGRAMA =================

function registrarCalificaciones() {
    estado.textContent = "";
    salida.textContent = "";

    const pregunta = "¿Cuántas calificaciones desea introducir?";
    const total = pedirNumero(pregunta, n => Number.isInteger(n) && n > 0,
        "ERROR: debe ser un número entero mayor que 0.");
    if (total === null) {
        estado.textContent = "Operación cancelada.";
        return;
    }

    const notas = [];
    const lineas = [`"${pregunta}": ${total}`, ""];
    for (let i = 1; i <= total; i++) {
        const nota = pedirNumero(`Calificación ${i} de ${total} (de ${NOTA_MIN} a ${NOTA_MAX}):`,
            n => n >= NOTA_MIN && n <= NOTA_MAX,
            `ERROR: la nota debe ser un número entre ${NOTA_MIN} y ${NOTA_MAX}.`);
        if (nota === null) {
            estado.textContent = "Operación cancelada.";
            return;
        }
        notas.push(nota);
        lineas.push(`Calificación ${i}: ${nota}`, `    -> Nivel: ${clasificar(nota)}`);
    }

    salida.textContent = [...lineas, "", ...generarInforme(notas)].join("\n");
}

document.getElementById("iniciar").addEventListener("click", registrarCalificaciones);
setTimeout(registrarCalificaciones, 50);   // deja pintar la página antes de abrir el primer diálogo
