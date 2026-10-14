/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */


function pedirNum(mensaje, esValido) {
    while (true) {
        const entrada = prompt(mensaje);
        if (entrada !== null && entrada.trim() !== "") {
            const valor = Number(entrada.trim().replace(",", "."));
            if (!Number.isNaN(valor) && esValido(valor)) {
                return valor;
            }
        }
        alert("Dato no válido, inténtelo de nuevo.");
    }
}

const esNumeroValido = (valor) => Number.isInteger(valor) && valor > 0;

const esNotaValida = (valor) => Number.isInteger(valor) && valor >= 0 && valor <= 10



function leerNotas() {
    const n = pedirNumero("Número total de calificaciones (entero mayor que 0): ");
    const notas = [];
    for (var i = 0; i < n; i++) {
        notas.push(pedirNum(`Nota ${i} de ${n} (0 a 10)`, esNotaValida));
    }
    return notas;
}

function generarInforme(notas) {
    const total = notas.length;
    const media = calcularMedia(notas);
    const maxima = Math.max(...notas);
    const minima = Math.min(...notas);
    const descendente = [...notas].sort((a, b) => b - a);
    const ascendente = [...notas].sort((a, b) => a - b);

    const lineas = [
        `Total de calificaciones: ${total}`,
        `Media de la clase: ${media}`,
        `Calificación máxima: ${maxima}`,
        `Calificación mínima: ${minima}`,
        "",
        "Distribución por rendimiento:"
    ];
}

function calcularMedia(notas){
    
}