// Pide un número por prompt hasta que cumpla la condición indicada
function pedirNumero(mensaje, esValido) {
    let valor;
    do {
        const entrada = prompt(mensaje, "");
        valor = (entrada === null || entrada.trim() === "") ? NaN : Number(entrada);
    } while (!esValido(valor));
    return valor;
}

function nivel(nota) {
    if (nota >= 8) return "Sobresaliente";
    if (nota >= 6) return "Notable";
    if (nota >= 4) return "Aprobado";
    return "Suspenso";
}

const redondear2 = (x) => Math.round(x * 100) / 100;

const n = pedirNumero("¿Cuántas calificaciones desea introducir?",
        (x) => Number.isInteger(x) && x > 0);

const notas = [];
const recuento = {Sobresaliente: 0, Notable: 0, Aprobado: 0, Suspenso: 0};
let salida = "";

for (let i = 1; i <= n; i++) {
    const nota = pedirNumero("Calificación " + i + " (0 - 10):",
            (x) => !isNaN(x) && x >= 0 && x <= 10);
    const nivelNota = nivel(nota);
    notas.push(nota);
    recuento[nivelNota]++;
    salida += "Calificación " + i + ": " + nota + "\n\t-> Nivel: " + nivelNota + "\n";
}

const suma = notas.reduce((total, nota) => total + nota, 0);
const ascendente = [...notas].sort((a, b) => a - b);
const descendente = [...ascendente].reverse();

salida += "\nCalificación máxima: " + Math.max(...notas)
        + "\nCalificación mínima: " + Math.min(...notas)
        + "\nCalificación media: " + redondear2(suma / n)
        + "\nDistribución de niveles:\n";

for (const nombre in recuento) {
    const cantidad = recuento[nombre];
    salida += "- " + nombre + ": " + cantidad + (cantidad === 1 ? " estudiante" : " estudiantes")
            + " (" + redondear2(cantidad / n * 100) + "%)\n";
}

salida += "Calificaciones ordenadas (Mayor a menor): " + descendente.join(", ")
        + "\nCalificaciones ordenadas (Menor a mayor): " + ascendente.join(", ");

document.getElementById("salida").textContent = salida;
