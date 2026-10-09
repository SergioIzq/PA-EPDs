function registrarCalificaciones() {
    const N = pedirEntero();
    const notas = pedirNotas(N);
    const clasificacion = clasificarNotas(notas);

    const suma = notas.reduce((sumaParcial, nota) => sumaParcial + nota, 0);
    /* "sumaParcial", normalmente visto como acc, es el acumulador; "nota" es la nota actual del array iterado; 
     * "0" es el valor inicial de "sumaParcial" */

    const media = Math.round((suma / notas.length) * 100) / 100;
    /* round solo redondea a enteros, por tanto "hacemos entero" provisionalmente hasta el segundo decimal
     * y redondeamos. Finalmente deshacemos el arreglo*/

    const maxima = Math.max(...notas);
    const minima = Math.min(...notas);
    /* "..." es una manera más corta de escribir la solución con apply() para obtener el máx. o mín de un array.
     * Hay un problema con las sintaxis "..." y apply: fallarán si el array tiene demasiados elementos porque intentan pasarlos
     * como parámetros de función. La mejor opción para arrays extensos es con reduce: 
     * const maxima = notas.reduce((max, nota) => Math.max(max, nota), -Infinity);
     * const minima = notas.reduce((min, nota) => Math.min(min, nota), Infinity);
     * Información recogida de la bibliografía de la EPD*/

    /* Recuento y porcentaje por nivel */
    const recuento = {Sobresaliente: 0, Notable: 0, Aprobado: 0, Suspenso: 0};

    for (const nivel of clasificacion) {
        if (nivel in recuento) {
            recuento[nivel]++;
        }
    }

    /* Ordenación (slice() crea copias para no modificar el array original) */
    const ascendente = notas.slice().sort((a, b) => a - b);
    const descendente = ascendente.slice().reverse();
    /* slice() sin parámetros crea una copia del array original. Esto lo hacemos para no cambiar el orden de este. 
     * Se nos pide que lo hagamos con sort, pero podríamos usar toSorted y toReversed que ya devuelve una copia del original modificada
     * sin tener que usar slice. No obstante, estas últimas no tienen compatibilidad con algunos entornos antiguos.*/

    // Clasificación individual
    for (let i = 0; i < notas.length; i++) {
        console.log(`Calificación ${i + 1}: ${notas[i]}\n\t-> Nivel: ${clasificacion[i]}`);
    }

    // Resumen final
    console.log('');
    console.log(`Calificación máxima: ${maxima}`);
    console.log(`Calificación mínima: ${minima}`);
    console.log(`Calificación media: ${media}`);

    console.log('Distribución de niveles:');
    for (const nivel in recuento) {
        const cantidad = recuento[nivel];
        const porcentaje = Math.round((cantidad / notas.length) * 10000) / 100;
        const palabra = cantidad === 1 ? 'estudiante' : 'estudiantes';
        console.log(`- ${nivel}: ${cantidad} ${palabra} (${porcentaje}%)`);
    }

    console.log(`Calificaciones ordenadas (Mayor a menor): ${descendente.join(', ')}`);
    console.log(`Calificaciones ordenadas (Menor a mayor): ${ascendente.join(', ')}`);

}

function pedirEntero() {
    let N = 0;
    let esNatural;

    do {
        esNatural = true;
        N = parseInt(prompt('¿Cuántas calificaciones desea introducir? '));
        if (isNaN(N) || N < 1) {
            esNatural = false;
            alert('Debe insertar un número entero mayor que 0');
            console.log('ERROR: el usuario ha insertado algo que no es un entero o un entero menor que 1.');
        }
    } while (!esNatural);

    return N;
}

function pedirNotas(N) {
    const notas = [];
    let nota = -1;

    let i = 0;
    do {
        nota = parseFloat(prompt(`Calificación ${i + 1}: `));
        if (!isNaN(nota) && nota >= 0 && nota <= 10) {
            notas.push(nota);
            i++;
        } else {
            alert('La nota debe ser un número entre 0 y 10');
        }
    } while (i < N);

    return notas;
}

function clasificarNotas(notas) {
    const clasificacion = [];

    for (const nota of notas) { /* const nota porque no cambiamos su valor */
        let notaClasif;
        if (!(nota >= 0 && nota <= 10)) { /*Si no está en el rango permitido. Esto controla también NaN y undefined*/
            notaClasif = 'Indefinido';
        } else if (nota < 4) {
            notaClasif = 'Suspenso';
        } else if (nota < 6) {
            notaClasif = 'Aprobado';
        } else if (nota < 8) {
            notaClasif = 'Notable';
        } else {
            notaClasif = 'Sobresaliente';
        }

        clasificacion.push(notaClasif);
    }
    return clasificacion;
}

// Ejecución del programa
registrarCalificaciones();