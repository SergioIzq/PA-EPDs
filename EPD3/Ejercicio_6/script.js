const ACTIVIDADES = ["spinning", "yoga", "pilates", "zumba", "crossfit", "aqua", "bodycombat", "trx"];
const CORRECTA = "Correcta";

// Simula la lectura del QR pidiendo la URL que contendría
function leerQR() {
    return prompt("Contenido del QR (URL de reserva):",
            "http://gympa.upo/reserva?actividad=spinning&duracion=45&id_participante=15") ?? "";
}

// Devuelve los parámetros de la URL (vacíos si la URL no es válida)
function extraerParametros(texto) {
    let parametros;
    try {
        parametros = new URL(texto.trim()).searchParams;
    } catch (error) {
        parametros = new URLSearchParams();
    }
    return {
        actividad: parametros.get("actividad") ?? "",
        duracion: parametros.get("duracion") ?? "",
        idParticipante: parametros.get("id_participante") ?? ""
    };
}

// Convierte a número entero, o NaN si el texto no lo es
function aEntero(texto) {
    return /^\d+$/.test(texto) ? Number(texto) : NaN;
}

function validarActividad(actividad) {
    return ACTIVIDADES.includes(actividad.toLowerCase()) ? CORRECTA : "Incorrecto - Actividad no reconocida";
}

function validarDuracion(duracion) {
    const minutos = aEntero(duracion);
    if (isNaN(minutos)) return "Incorrecto - Debe ser un número entero";
    if (minutos < 30) return "Incorrecto - Duración mínima no alcanzada";
    if (minutos > 120) return "Incorrecto - Duración máxima excedida";
    return CORRECTA;
}

function validarParticipante(idParticipante) {
    const id = aEntero(idParticipante);
    return id >= 1 && id <= 50 ? CORRECTA : "Incorrecto";
}

function calcularCoste(duracion, idParticipante) {
    let coste = 1.50;
    if (duracion > 30) coste += 0.50;
    if (idParticipante >= 1 && idParticipante <= 15) coste *= 0.90;
    return coste;
}

function agregarFila(tabla, celdas, negrita) {
    const fila = tabla.insertRow();
    for (const texto of celdas) {
        const celda = fila.insertCell();
        celda.textContent = texto;
    }
    if (negrita) {
        fila.cells[0].style.fontWeight = "bold";
    }
}

const url = leerQR();
const datos = extraerParametros(url);
const validaciones = [
    ["Actividad", datos.actividad, validarActividad(datos.actividad)],
    ["Duración", datos.duracion, validarDuracion(datos.duracion)],
    ["Identificador del participante", datos.idParticipante, validarParticipante(datos.idParticipante)]
];
const valida = validaciones.every((fila) => fila[2] === CORRECTA);

const tabla = document.getElementById("resultado");
document.getElementById("url").textContent = "URL leída: " + url;
validaciones.forEach((fila) => agregarFila(tabla, fila, false));

if (valida) {
    const coste = calcularCoste(Number(datos.duracion), Number(datos.idParticipante));
    agregarFila(tabla, ["Coste total", coste.toFixed(2) + " €", "RESERVA REALIZADA"], true);
} else {
    agregarFila(tabla, ["Coste total", "", "RESERVA RECHAZADA"], true);
}
