const CERO = 0;
const PESO_MAX = 30;
const DIMENSION_MAX = 120;
const DIVISOR_VOLUMETRICO = 5000;
/* Divisor estándar del peso volumétrico en transporte: volumen en cm³ / 5000 = kg */
const UMBRAL_RECARGO = 20;
const PORCENTAJE_RECARGO = 0.15;
/* Recargo del 15% para envíos de más de 20 kg facturables */

/* Tarifas por kg y suplemento fijo. El suplemento solo aplica a INTERNACIONAL */
const TARIFAS = {
    LOCAL: { porKg: 2.5, suplemento: 0 },
    NACIONAL: { porKg: 4, suplemento: 0 },
    INTERNACIONAL: { porKg: 8.5, suplemento: 12 }
};

/* Mensajes de error agrupados por campo. Así validarNumero puede usar el mismo código
 * para todas las medidas y solo cambia el objeto de mensajes que recibe */
const errores = {
    peso: {
        tipoDato: 'ERROR: HA INSERTADO UN PESO NO NUMÉRICO',
        menor: 'ERROR: HA INSERTADO UN PESO MENOR O IGUAL A 0 (kg)',
        mayor: 'ERROR: HA INSERTADO UN PESO MAYOR QUE 30 (kg)'
    },
    largo: {
        tipoDato: 'ERROR: HA INSERTADO UN LARGO NO NUMÉRICO',
        noEntero: 'ERROR: HA INSERTADO UN LARGO QUE NO ES UN NÚMERO ENTERO',
        menor: 'ERROR: HA INSERTADO UN LARGO MENOR O IGUAL A 0 (cm)',
        mayor: 'ERROR: HA INSERTADO UN LARGO MAYOR QUE 120 (cm)'
    },
    ancho: {
        tipoDato: 'ERROR: HA INSERTADO UN ANCHO NO NUMÉRICO',
        noEntero: 'ERROR: HA INSERTADO UN ANCHO QUE NO ES UN NÚMERO ENTERO',
        menor: 'ERROR: HA INSERTADO UN ANCHO MENOR O IGUAL A 0 (cm)',
        mayor: 'ERROR: HA INSERTADO UN ANCHO MAYOR QUE 120 (cm)'
    },
    alto: {
        tipoDato: 'ERROR: HA INSERTADO UN ALTO NO NUMÉRICO',
        noEntero: 'ERROR: HA INSERTADO UN ALTO QUE NO ES UN NÚMERO ENTERO',
        menor: 'ERROR: HA INSERTADO UN ALTO MENOR O IGUAL A 0 (cm)',
        mayor: 'ERROR: HA INSERTADO UN ALTO MAYOR QUE 120 (cm)'
    },
    destinoDesconocido: 'ERROR: HA INSERTADO UN DESTINO QUE NO PERTENECE A (LOCAL, NACIONAL, INTERNACIONAL)'
};

/* Error propio para distinguir los errores de validación de otros errores del programa.
 * Así el catch final sabe cuáles debe mostrar al usuario y cuáles relanzar */
class ErrorValidacion extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = 'ErrorValidacion';
    }
}

/* Valida un valor numérico. Lanza ErrorValidacion si no es válido y devuelve el número si lo es.
 * soloEntero indica si las medidas en cm deben ser enteras */
function validarNumero(valor, erroresMedida, limiteSuperior, soloEntero) {
    /* String(valor) por si llega algo que no es texto. trim() quita espacios sobrantes.
     * Number() a diferencia de parseFloat no ignora basura: Number('3abc') devuelve NaN */
    const texto = String(valor).trim();
    /* Number('') devuelve 0, y un campo vacío no debe valer 0, por eso lo forzo a NaN */
    const numero = texto === '' ? NaN : Number(texto);

    /* Las comprobaciones van en orden: primero que sea número, después la forma, después el rango */
    if (Number.isNaN(numero)) {
        throw new ErrorValidacion(erroresMedida.tipoDato);
    }
    /* Number.isInteger en lugar de % 1 para que sea más legible */
    if (soloEntero && !Number.isInteger(numero)) {
        throw new ErrorValidacion(erroresMedida.noEntero);
    }
    if (numero <= CERO) {
        throw new ErrorValidacion(erroresMedida.menor);
    }
    if (numero > limiteSuperior) {
        throw new ErrorValidacion(erroresMedida.mayor);
    }
    return numero;
}

/* Normaliza el destino (quita espacios y pasa a mayúsculas) y comprueba que exista en TARIFAS.
 * El operador "in" busca la clave en el objeto, igual que hacíamos con recuento en el otro ejercicio */
function validarDestino(destino) {
    const destinoNormalizado = String(destino).trim().toUpperCase();

    if (!(destinoNormalizado in TARIFAS)) {
        throw new ErrorValidacion(errores.destinoDesconocido);
    }
    return destinoNormalizado;
}

/* Valida todos los datos y calcula el precio del envío. Devuelve un objeto con el desglose */
function calcular(pesoReal, largo, ancho, alto, destino) {
    // Validaciones
    /* Se valida todo antes de calcular. Si algún dato falla, validarNumero lanza el error y no se llega a los cálculos */
    const peso = validarNumero(pesoReal, errores.peso, PESO_MAX, false);
    const l = validarNumero(largo, errores.largo, DIMENSION_MAX, true);
    const an = validarNumero(ancho, errores.ancho, DIMENSION_MAX, true);
    const al = validarNumero(alto, errores.alto, DIMENSION_MAX, true);
    const destinoValido = validarDestino(destino);

    // Cálculos
    /* El peso volumétrico refleja cuánto espacio ocupa el paquete. Se usa si es mayor que el peso real */
    const pesoVolumetrico = (l * an * al) / DIVISOR_VOLUMETRICO;
    /* Math.max elige el mayor de los dos pesos y Math.ceil redondea hacia arriba (3.2 kg se factura como 4 kg) */
    const pesoFacturable = Math.ceil(Math.max(peso, pesoVolumetrico));

    /* Desestructuración: saco porKg y suplemento directamente del objeto de la tarifa elegida */
    const { porKg, suplemento } = TARIFAS[destinoValido];
    const subtotal = pesoFacturable * porKg + suplemento;
    /* El recargo se calcula sobre el subtotal, no sobre el peso. Si no supera el umbral, vale 0 */
    const recargo = pesoFacturable > UMBRAL_RECARGO ? subtotal * PORCENTAJE_RECARGO : 0;

    return {
        pesoReal: peso,
        pesoVolumetrico,
        pesoFacturable,
        suplemento,
        recargo,
        precioTotal: subtotal + recargo
    };
}

/* Pide los cinco datos al usuario. Los devuelve tal cual los escribe, sin validar.
 * La validación se hace después en calcular() */
function pedirDatos() {
    return {
        pesoReal: prompt('Peso del paquete: '),
        largo: prompt('Largo: '),
        ancho: prompt('Ancho: '),
        alto: prompt('Alto: '),
        destino: prompt('Destino: ')
    };
}

/* Construye el texto del resumen y lo muestra por alert y por consola */
function mostrarResumen(envio) {
    /* toFixed(2) redondea a dos decimales para que los importes se vean como euros */
    let resumen =
        `Peso real: ${envio.pesoReal} kg\n` +
        `Peso volumétrico: ${envio.pesoVolumetrico.toFixed(2)} kg\n` +
        `Peso facturable: ${envio.pesoFacturable} kg\n`;

    /* Las líneas de suplemento y recargo solo aparecen si tienen valor mayor que 0 */
    if (envio.suplemento > CERO) {
        resumen += `Suplemento internacional: ${envio.suplemento.toFixed(2)}€\n`;
    }
    if (envio.recargo > CERO) {
        resumen += `Recargo por peso elevado: ${envio.recargo.toFixed(2)}€\n`;
    }
    resumen += `Precio del envío: ${envio.precioTotal.toFixed(2)}€`;

    alert(resumen);
    console.log(resumen);
}

/* Ejecución del programa. El try/catch recoge los errores de validación */
try {
    const { pesoReal, largo, ancho, alto, destino } = pedirDatos();
    console.log(`Peso del paquete: ${pesoReal}\nLargo: ${largo}\nAncho: ${ancho}\nAlto: ${alto}\nDestino: ${destino}`);

    mostrarResumen(calcular(pesoReal, largo, ancho, alto, destino));
    /* NOTA: el programa no termina su ejecución inmediatamente después de introducir un dato erróneo porque el ejercicio nos pide
     * que validemos los datos en una función calcular, a la cual le llegan todos esos datos por parámetro, por tanto, como se validan dentro
     * hay que pedir todos los parámetros y después ya se procesa si están bien o mal, por tanto, si el primer input tiene un dato incorrecto
     * el programa seguirá pidiendo los demás.*/
} catch (error) {
    /* Si es un error de validación, se muestra el mensaje. Cualquier otro error (un bug, por ejemplo)
     * se relanza para que no quede oculto */
    if (error instanceof ErrorValidacion) {
        alert(error.message);
        console.log(error.message);
    } else {
        throw error;
    }
}