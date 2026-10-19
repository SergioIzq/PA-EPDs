// Carácter que sustituye a las posiciones múltiplo de 5 (según el ejemplo del enunciado)
const REEMPLAZO = "*";

// Prioridad: múltiplo de 5 > múltiplo de 3 > par. La posición 0 solo se trata como par.
function formatearCodigo(codigo) {
    let resultado = "";
    for (let i = 0; i < codigo.length; i++) {
        const caracter = codigo.charAt(i);
        if (i > 0 && i % 5 === 0) {
            resultado += REEMPLAZO;
        } else if (i > 0 && i % 3 === 0) {
            resultado += caracter.toLowerCase();
        } else if (i % 2 === 0) {
            resultado += caracter.toUpperCase();
        } else {
            resultado += caracter;
        }
    }
    return resultado;
}

const codigo = prompt("Introduzca el código de la actividad:", "") ?? "";
alert(formatearCodigo(codigo));
