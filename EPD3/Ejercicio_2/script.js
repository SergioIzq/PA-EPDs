const TARIFAS = {LOCAL: 2.50, NACIONAL: 4.00, INTERNACIONAL: 8.50};
const SUPLEMENTO_INTERNACIONAL = 12.00;

// Valida los datos y devuelve el desglose del envío. Lanza un Error si algún dato es incorrecto.
function calcular(pesoReal, largo, ancho, alto, destino) {
    // Número positivo con como mucho un decimal
    if (!/^\d+(\.\d)?$/.test(String(pesoReal).trim()) || Number(pesoReal) <= 0 || Number(pesoReal) > 30) {
        throw new Error("PESO INCORRECTO (DEBE SER MAYOR QUE 0 Y MENOR O IGUAL A 30 KG)");
    }
    const dimensiones = {LARGO: largo, ANCHO: ancho, ALTO: alto};
    for (const nombre in dimensiones) {
        const valor = String(dimensiones[nombre]).trim();
        if (!/^\d+$/.test(valor) || Number(valor) <= 0 || Number(valor) > 120) {
            throw new Error(nombre + " INCORRECTO (DEBE SER UN ENTERO MAYOR QUE 0 Y MENOR O IGUAL A 120 CM)");
        }
    }
    const tipo = String(destino).trim().toUpperCase();
    if (!(tipo in TARIFAS)) {
        throw new Error("DESTINO INCORRECTO (LOCAL, NACIONAL O INTERNACIONAL)");
    }

    pesoReal = Number(pesoReal);
    const pesoVolumetrico = (largo * ancho * alto) / 5000;
    const pesoFacturable = Math.ceil(Math.max(pesoReal, pesoVolumetrico));
    const suplemento = tipo === "INTERNACIONAL" ? SUPLEMENTO_INTERNACIONAL : 0;
    const subtotal = pesoFacturable * TARIFAS[tipo] + suplemento;
    const recargo = pesoFacturable > 20 ? subtotal * 0.15 : 0;

    return {
        pesoReal: pesoReal,
        pesoVolumetrico: pesoVolumetrico,
        pesoFacturable: pesoFacturable,
        suplemento: suplemento,
        recargo: recargo,
        precioTotal: subtotal + recargo
    };
}

const peso = prompt("Peso del paquete (kg):", "");
const largo = prompt("Largo (cm):", "");
const ancho = prompt("Ancho (cm):", "");
const alto = prompt("Alto (cm):", "");
const destino = prompt("Destino (LOCAL, NACIONAL o INTERNACIONAL):", "");

let salida = "Peso del paquete: " + peso
        + "\nLargo: " + largo
        + "\nAncho: " + ancho
        + "\nAlto: " + alto
        + "\nDestino: " + destino + "\n\n";

try {
    const envio = calcular(peso, largo, ancho, alto, destino);
    salida += "Peso real: " + envio.pesoReal + " kg"
            + "\nPeso volumétrico: " + envio.pesoVolumetrico.toFixed(2) + " kg"
            + "\nPeso facturable: " + envio.pesoFacturable + " kg";
    if (envio.suplemento > 0) {
        salida += "\nSuplemento internacional: " + envio.suplemento.toFixed(2) + "€";
    }
    if (envio.recargo > 0) {
        salida += "\nRecargo por peso elevado: " + envio.recargo.toFixed(2) + "€";
    }
    salida += "\nPrecio del envío: " + envio.precioTotal.toFixed(2) + "€";
} catch (error) {
    salida += "ERROR: " + error.message;
}

document.getElementById("salida").textContent = salida;
