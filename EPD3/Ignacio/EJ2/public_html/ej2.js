const CERO = 0;
const PESO_MAX = 30;
const DIMENSION_MAX = 120;
const DIVISOR_VOLUMETRICO = 5000;
const UMBRAL_RECARGO = 20;
const PORCENTAJE_RECARGO = 0.15;

const TARIFAS = {
    LOCAL: { porKg: 2.5, suplemento: 0 },
    NACIONAL: { porKg: 4, suplemento: 0 },
    INTERNACIONAL: { porKg: 8.5, suplemento: 12 }
};

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

class ErrorValidacion extends Error {
    constructor(mensaje) {
        super(mensaje);
        this.name = 'ErrorValidacion';
    }
}

function validarNumero(valor, erroresMedida, limiteSuperior, soloEntero) {
    const texto = String(valor).trim();
    const numero = texto === '' ? NaN : Number(texto);

    if (Number.isNaN(numero)) {
        throw new ErrorValidacion(erroresMedida.tipoDato);
    }
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

function validarDestino(destino) {
    const destinoNormalizado = String(destino).trim().toUpperCase();

    if (!(destinoNormalizado in TARIFAS)) {
        throw new ErrorValidacion(errores.destinoDesconocido);
    }
    return destinoNormalizado;
}

function calcular(pesoReal, largo, ancho, alto, destino) {
    // Validaciones
    const peso = validarNumero(pesoReal, errores.peso, PESO_MAX, false);
    const l = validarNumero(largo, errores.largo, DIMENSION_MAX, true);
    const an = validarNumero(ancho, errores.ancho, DIMENSION_MAX, true);
    const al = validarNumero(alto, errores.alto, DIMENSION_MAX, true);
    const destinoValido = validarDestino(destino);

    // Cálculos
    const pesoVolumetrico = (l * an * al) / DIVISOR_VOLUMETRICO;
    const pesoFacturable = Math.ceil(Math.max(peso, pesoVolumetrico));

    const { porKg, suplemento } = TARIFAS[destinoValido];
    const subtotal = pesoFacturable * porKg + suplemento;
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

function pedirDatos() {
    return {
        pesoReal: prompt('Peso del paquete: '),
        largo: prompt('Largo: '),
        ancho: prompt('Ancho: '),
        alto: prompt('Alto: '),
        destino: prompt('Destino: ')
    };
}

function mostrarResumen(envio) {
    let resumen =
        `Peso real: ${envio.pesoReal} kg\n` +
        `Peso volumétrico: ${envio.pesoVolumetrico.toFixed(2)} kg\n` +
        `Peso facturable: ${envio.pesoFacturable} kg\n`;

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

try {
    const { pesoReal, largo, ancho, alto, destino } = pedirDatos();
    console.log(`Peso del paquete: ${pesoReal}\nLargo: ${largo}\nAncho: ${ancho}\nAlto: ${alto}\nDestino: ${destino}`);

    mostrarResumen(calcular(pesoReal, largo, ancho, alto, destino));
    /* NOTA: el programa no termina su ejecución inmediatamente después de introducir un dato erróneo porque el ejercicio nos pide
     * que validemos los datos en una función calcular, a la cual le llegan todos esos datos por parámetro, por tanto, como se validan dentro
     * hay que pedir todos los parámetros y después ya se procesa si están bien o mal, por tanto, si el primer input tiene un dato incorrecto
     * el programa seguirá pidiendo los demás.*/
} catch (error) {
    if (error instanceof ErrorValidacion) {
        alert(error.message);
        console.log(error.message);
    } else {
        throw error;
    }
}