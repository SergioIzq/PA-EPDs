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
    /* Preinicializar a 0 evita tener que comprobar en el bucle si la clave existe, dejando un código más directo*/
    const recuento = {Sobresaliente: 0, Notable: 0, Aprobado: 0, Suspenso: 0};

    /* Se podría usar reduce() como en la línea 6, pero adaptado*/
    for (const nivel of clasificacion) {
        if (nivel in recuento) {
            recuento[nivel]++; /*  <==> recuento[nivel] = recuento[nivel] + 1; */
        }
    }

    /* Ordenación (slice() crea copias para no modificar el array original) */
    const ascendente = notas.slice().sort((a, b) => a - b);
    const descendente = ascendente.slice().reverse(); /* Usar reverse sobre la copia ya ordenada es más eficiente que ordenar con sort haciendo (b - a)*/
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
        const porcentaje = Math.round((cantidad / notas.length) * 10000) / 100; /* Ejemplo de por qué multiplicamos  10000 y después dividimos 100:
         * cantidad/notas.lenght = 0.816666... ; 0.816666 * 10000 = 8166.66 ; Math.round(8166.66) = 8167 ; 8167 / 100 = 81.67 %. Nota: hay que recordar que
         * Math.round solo redondea enteros */
        const palabra = cantidad === 1 ? 'estudiante' : 'estudiantes'; /* Esto es simplemente para distinguir en el output entre singular y plural. Si
         * la cantidad de alumnos en el recuento es 1, se pone 'estudiante', en caso contrario, 'estudiantes' */
        console.log(`- ${nivel}: ${cantidad} ${palabra} (${porcentaje}%)`);
    }

    console.log(`Calificaciones ordenadas (Mayor a menor): ${descendente.join(', ')}`); /* Convierte el array 'descendente' en un String, separando 
     * los elementos con el separador que le pasas como parámetro. Esto evita que haya una coma en la última columna*/
    console.log(`Calificaciones ordenadas (Menor a mayor): ${ascendente.join(', ')}`);

}

/* Pide al usuario cuántas notas va a introducir. Devuelve un entero mayor que 0 */
function pedirEntero() {
    let N = 0;
    let esNatural;

    /* Uso do...while porque necesito que el prompt salga al menos una vez antes de comprobar nada.
     * Si el usuario mete algo mal, el bucle vuelve a preguntar hasta que sea válido */
    do {
        esNatural = true;
        /* prompt() siempre devuelve un string, por eso lo paso a entero con parseInt.
         * Ojo: parseInt('3abc') devuelve 3, así que aceptaría entradas con basura al final */
        N = parseInt(prompt('¿Cuántas calificaciones desea introducir? '));
        /* isNaN(N) cubre el caso de que el usuario escriba letras o deje el campo vacío (parseInt devuelve NaN).
         * N < 1 cubre el 0 y los negativos */
        if (isNaN(N) || N < 1) {
            esNatural = false;
            alert('Debe insertar un número entero mayor que 0');
            console.log('ERROR: el usuario ha insertado algo que no es un entero o un entero menor que 1.');
        }
    } while (!esNatural);

    return N;
}

/* Pide al usuario N calificaciones, validando que cada una esté entre 0 y 10. Devuelve el array con las notas */
function pedirNotas(N) {
    const notas = [];
    let nota = -1;

    /* Uso parseFloat en lugar de parseInt porque las notas pueden tener decimales (ej: 6.5).
     * "i" cuenta solo las notas válidas guardadas, no los intentos. Así, si el usuario se equivoca,
     * no avanza al siguiente alumno y vuelve a pedir la misma calificación */
    let i = 0;
    do {
        let entrada = prompt(`Calificación ${i + 1}: `);
        /* Si el usuario cancela el prompt, devuelve null. Lo convierto en cadena vacía
         * para que no falle al llamar a replace() */
        if (entrada === null) {
            entrada = '';
        }
        /* Si el usuario escribe una coma (9,2), la cambio por punto para que parseFloat lo entienda.
         * Sin este cambio, parseFloat('9,2') devolvería 9 sin avisar */
        nota = parseFloat(entrada.replace(',', '.'));
        /* Solo guardo la nota si es un número (!isNaN) y está dentro del rango 0-10.
         * Si no, muestro el aviso y el bucle sigue pidiendo la misma */
        if (!isNaN(nota) && nota >= 0 && nota <= 10) {
            notas.push(nota);
            i++;
        } else {
            alert('La nota debe ser un número entre 0 y 10');
        }
    } while (i < N); /* Sigo hasta tener N notas válidas */

    return notas;
}

/* Recibe el array de notas y devuelve otro array con el nivel de cada una (en el mismo orden) */
function clasificarNotas(notas) {
    const clasificacion = [];

    for (const nota of notas) { /* const nota porque no cambiamos su valor */
        let notaClasif;
        /* Los else if van en orden de menor a mayor. Al llegar a un else if, ya sabemos que la nota
         * no cumple el anterior, así que no hace falta repetir condiciones (ej: si es >= 4, no hace falta
         * comprobar que sea >= 4 para llegar a "Aprobado", basta con nota < 6) */
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