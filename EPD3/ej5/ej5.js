"use strict";

/*
    EPD3 - Ej5: gestor de actividades de un gimnasio.
    Cada actividad es un objeto { nombre, instructor, plazas } dentro de un vector.
    Los datos se piden con prompt() y los resultados se muestran en la página.
*/

// ================= DATOS =================

const actividades = [
    { nombre: "Spinning",       instructor: "Ana López",      plazas: 15 },
    { nombre: "Yoga",           instructor: "Carmen Ruiz",    plazas: 12 },
    { nombre: "Pilates",        instructor: "Miguel Moya",    plazas: 10 },
    { nombre: "Zumba",          instructor: "Laura Martín",   plazas: 20 },
    { nombre: "CrossFit",       instructor: "David García",   plazas: 8 },
    { nombre: "Aerobic", instructor: "Elena Sánchez",  plazas: 18 },
    { nombre: "BodyCombat",     instructor: "Carlos Vega",    plazas: 16 },
    { nombre: "TRX",            instructor: "María González", plazas: 6 },
    { nombre: "Body Pump",      instructor: "Pablo Ortega",   plazas: 14 },
    { nombre: "Boxeo",          instructor: "Sergio Navarro", plazas: 10 }
];

const OPCION_SALIR = 5;
const MENU = `¿Qué operación desea realizar?
1. Mostrar actividades
2. Reservar plaza
3. Liberar plaza
4. Agregar actividad
5. Salir

Opción:`;

// Elementos de la página (el script está al final del body, ya existen)
const tituloLista = document.getElementById("titulo-lista");
const lista       = document.getElementById("lista");
const mensaje     = document.getElementById("mensaje");
const botonIniciar = document.getElementById("iniciar");


// ================= UTILIDADES =================

// Quita tildes, espacios sobrantes y mayúsculas: "  AEROBIC " == "Aerobic"
function normalizar(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLowerCase();
}

// Devuelve la actividad con ese nombre o undefined si no existe
function buscarActividad(nombre) {
    const buscado = normalizar(nombre);
    return actividades.find(actividad => normalizar(actividad.nombre) === buscado);
}

function describirActividad(actividad) {
    const unidad = actividad.plazas === 1 ? "plaza" : "plazas";
    return `${actividad.nombre}: ${actividad.instructor} - ${actividad.plazas} ${unidad}`;
}

function mostrarMensaje(texto, esError = false) {
    mensaje.textContent = texto;
    mensaje.className = esError ? "error" : "ok";
}

// Los diálogos bloquean el navegador: esta pausa le da tiempo a pintar la página antes de abrir el siguiente
function dejarPintar() {
    return new Promise(resolve => setTimeout(resolve, 50));
}

/*
    Pide un dato hasta que sea válido. "validar" recibe el texto y devuelve
    un mensaje de error, o "" si es correcto. Devuelve el texto sin espacios
    sobrantes, o null si el usuario cancela el diálogo.
*/
function pedirDato(pregunta, validar) {
    let error = "";
    while (true) {
        const entrada = prompt(error ? `${error}\n\n${pregunta}` : pregunta);
        if (entrada === null) {
            return null;
        }
        error = validar(entrada);
        if (error === "") {
            return entrada.trim();
        }
    }
}

// Pide el nombre de una actividad. Si no existe o se cancela, avisa y devuelve null
function pedirActividad() {
    const nombre = prompt("Ingrese el nombre de la actividad:");
    if (nombre === null) {
        mostrarMensaje("Operación cancelada.");
        return null;
    }
    const actividad = buscarActividad(nombre);
    if (actividad === undefined) {
        mostrarMensaje(`ERROR: la actividad "${nombre.trim()}" no existe.`, true);
        return null;
    }
    return actividad;
}


// ================= FUNCIONES PEDIDAS =================

// Recorre el vector y muestra "Nombre: Instructor - Plazas" de cada actividad
function mostrarActividades(titulo = "Actividades disponibles:") {
    tituloLista.textContent = titulo;
    lista.replaceChildren();
    actividades.forEach(actividad => {
        const elemento = document.createElement("li");
        elemento.textContent = describirActividad(actividad);
        if (actividad.plazas === 0) {
            elemento.classList.add("completa");
        }
        lista.appendChild(elemento);
    });
}

// Devuelve true si ha cambiado alguna plaza
function reservarPlaza() {
    const actividad = pedirActividad();
    if (actividad === null) {
        return false;
    }
    if (actividad.plazas === 0) {
        mostrarMensaje(`ERROR: no quedan plazas disponibles en ${actividad.nombre}.`, true);
        return false;
    }
    actividad.plazas--;
    mostrarMensaje(`Plaza reservada con éxito en ${actividad.nombre}.`);
    return true;
}

// Devuelve true si ha cambiado alguna plaza
function liberarPlaza() {
    const actividad = pedirActividad();
    if (actividad === null) {
        return false;
    }
    actividad.plazas++;
    mostrarMensaje(`Plaza liberada con éxito en ${actividad.nombre}.`);
    return true;
}

// Devuelve true si se ha añadido la actividad
function agregarActividad() {
    const cancelar = () => {
        mostrarMensaje("Operación cancelada.");
        return false;
    };

    const nombre = pedirDato("Nombre de la nueva actividad:", valor => {
        if (valor.trim() === "") {
            return "ERROR: el nombre no puede estar vacío.";
        }
        return buscarActividad(valor) ? "ERROR: ya existe una actividad con ese nombre." : "";
    });
    if (nombre === null) {
        return cancelar();
    }

    const instructor = pedirDato("Instructor asignado:", valor =>
        valor.trim() === "" ? "ERROR: el instructor no puede estar vacío." : "");
    if (instructor === null) {
        return cancelar();
    }

    const plazas = pedirDato("Número de plazas:", valor =>
        /^\d+$/.test(valor.trim()) && Number(valor) > 0
            ? ""
            : "ERROR: las plazas deben ser un número entero mayor que 0.");
    if (plazas === null) {
        return cancelar();
    }

    actividades.push({ nombre, instructor, plazas: Number(plazas) });
    mostrarMensaje(`Actividad "${nombre}" agregada con éxito.`);
    return true;
}


// ================= MENÚ =================

// Devuelve el número elegido, 0 si no es válido, u OPCION_SALIR si se cancela el diálogo
function pedirOpcion() {
    const entrada = prompt(MENU);
    if (entrada === null) {
        return OPCION_SALIR;
    }
    return /^[1-5]$/.test(entrada.trim()) ? Number(entrada) : 0;
}

function ejecutarOpcion(opcion) {
    const ACTUALIZADAS = "Actividades actualizadas:";
    switch (opcion) {
        case 1:
            mostrarActividades();
            mostrarMensaje(`Hay ${actividades.length} actividades registradas.`);
            break;
        case 2:
            if (reservarPlaza()) mostrarActividades(ACTUALIZADAS);
            break;
        case 3:
            if (liberarPlaza()) mostrarActividades(ACTUALIZADAS);
            break;
        case 4:
            if (agregarActividad()) mostrarActividades(ACTUALIZADAS);
            break;
        default:
            mostrarMensaje("ERROR: opción no válida. Elija un número del 1 al 5.", true);
    }
}

async function gestionarGimnasio() {
    botonIniciar.disabled = true;
    mensaje.textContent = "";
    mostrarActividades();

    while (true) {
        await dejarPintar();
        const opcion = pedirOpcion();
        if (opcion === OPCION_SALIR) {
            break;
        }
        ejecutarOpcion(opcion);
    }

    mostrarMensaje("Sesión finalizada. Pulse el botón para abrir el menú de nuevo.");
    botonIniciar.disabled = false;
}

botonIniciar.addEventListener("click", gestionarGimnasio);
gestionarGimnasio();
