//  Constantes 
const TARIFAS = { LOCAL: 2.5, NACIONAL: 4.0, INTERNACIONAL: 8.5 }; // €/kg facturable
const SUPLEMENTO_INTERNACIONAL = 12.0;                               // €
const DIVISOR_VOLUMETRICO = 5000;
const UMBRAL_RECARGO_KG = 20;
const PORCENTAJE_RECARGO = 0.15;

const PESO_MAX_KG = 30;
const DIMENSION_MAX_CM = 120;

//  Funciones auxiliares 

// Convierte el texto de prompt() en número. Devuelve NaN si es null (cancelar) o vacío
function aNumero(texto) {
  if (texto === null || texto.trim() === "") {
    return NaN;
  }
  return Number(texto);
}

// Valida que valor sea un número en (0, max), si es entero y si en un número 
// Si algo falla lanza un Error, si todo va bien devuelve el número ya convertido
function validarNumero(valor, nombre, max, entero = false) {
  const numero = aNumero(valor);
  if (Number.isNaN(numero)) {
    throw new Error(`${nombre} NO NUMERICO`);
  }
  if (entero && !Number.isInteger(numero)) {
    throw new Error(`${nombre} DEBE SER UN NUMERO ENTERO`);
  }
  if (numero <= 0 || numero > max) {
    throw new Error(`${nombre} FUERA DE RANGO (0 < ${nombre} <= ${max})`);
  }
  return numero;
}

// Normaliza el destino y comprueba que sea una de las opciones permitidas
function validarDestino(destino) {
  const normalizado = String(destino ?? "").trim().toUpperCase();
  if (!Object.hasOwn(TARIFAS, normalizado)) {
    throw new Error("DESTINO NO VALIDO (LOCAL, NACIONAL O INTERNACIONAL)");
  }
  return normalizado;
}


// Valida datos y devuelve el desglose del envío, lanza un Error con el motivo si algún dato es incorrecto
function calcular(pesoReal, largo, ancho, alto, destino) {
  // Validaciones
  const peso = validarNumero(pesoReal, "PESO", PESO_MAX_KG);
  const l = validarNumero(largo, "LARGO", DIMENSION_MAX_CM, true);
  const a = validarNumero(ancho, "ANCHO", DIMENSION_MAX_CM, true);
  const h = validarNumero(alto, "ALTO", DIMENSION_MAX_CM, true);
  const tipoDestino = validarDestino(destino);

  // Cálculos
  const pesoVolumetrico = (l * a * h) / DIVISOR_VOLUMETRICO;
  const pesoFacturable = Math.ceil(Math.max(peso, pesoVolumetrico));

  const suplemento = tipoDestino === "INTERNACIONAL" ? SUPLEMENTO_INTERNACIONAL : 0;
  const subtotal = pesoFacturable * TARIFAS[tipoDestino] + suplemento;
  const recargo = pesoFacturable > UMBRAL_RECARGO_KG ? subtotal * PORCENTAJE_RECARGO : 0;

  // Resultado
  return {
    pesoReal: peso,
    pesoVolumetrico: pesoVolumetrico,
    pesoFacturable: pesoFacturable,
    suplemento: suplemento,
    recargo: recargo,
    precioTotal: subtotal + recargo
  };
}

//  Construcción del resultado para imprimir

const euros = (importe) => importe.toFixed(2) + "€";

function construirResumen(envio) {
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
  return lineas.join("\n");
}

//  Programa principal 

try {
  const pesoReal = prompt("Peso del paquete (kg):");
  const largo = prompt("Largo (cm):");
  const ancho = prompt("Ancho (cm):");
  const alto = prompt("Alto (cm):");
  const destino = prompt("Destino (LOCAL, NACIONAL o INTERNACIONAL):");

  const envio = calcular(pesoReal, largo, ancho, alto, destino);
  alert(construirResumen(envio));
  console.log(construirResumen(envio));
} catch (error) {
  alert("ERROR: " + error.message);
}
