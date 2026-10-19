const actividades = [
    {nombre: "Spinning", instructor: "Ana López", plazas: 15},
    {nombre: "Yoga", instructor: "Carmen Ruiz", plazas: 12},
    {nombre: "Pilates", instructor: "Miguel Moya", plazas: 10},
    {nombre: "Zumba", instructor: "Laura Martín", plazas: 20},
    {nombre: "CrossFit", instructor: "David García", plazas: 8},
    {nombre: "Aqua Aeróbicos", instructor: "Elena Sánchez", plazas: 18},
    {nombre: "BodyCombat", instructor: "Carlos Vega", plazas: 16},
    {nombre: "TRX", instructor: "María González", plazas: 6},
    {nombre: "Boxeo", instructor: "Javier Romero", plazas: 12},
    {nombre: "Body Pump", instructor: "Lucía Navarro", plazas: 14}
];

function mostrarActividades(titulo = "Actividades Disponibles") {
    let texto = titulo + ":\n";
    for (const actividad of actividades) {
        texto += actividad.nombre + ": " + actividad.instructor + " - " + actividad.plazas + " plazas\n";
    }
    alert(texto);
}

// Búsqueda insensible a mayúsculas/minúsculas y espacios
function buscarActividad(nombre) {
    const buscado = (nombre ?? "").trim().toLowerCase();
    return actividades.find((actividad) => actividad.nombre.toLowerCase() === buscado);
}

function reservarPlaza() {
    const actividad = buscarActividad(prompt("Ingrese el nombre de la actividad:", ""));
    if (!actividad) {
        alert("Error: la actividad no existe.");
    } else if (actividad.plazas === 0) {
        alert("Error: no hay plazas disponibles en " + actividad.nombre + ".");
    } else {
        actividad.plazas--;
        alert("Plaza reservada con éxito en " + actividad.nombre + ".");
    }
}

function liberarPlaza() {
    const actividad = buscarActividad(prompt("Ingrese el nombre de la actividad:", ""));
    if (!actividad) {
        alert("Error: la actividad no existe.");
    } else {
        actividad.plazas++;
        alert("Plaza liberada con éxito en " + actividad.nombre + ".");
    }
}

function agregarActividad() {
    const nombre = (prompt("Nombre de la actividad:", "") ?? "").trim();
    const instructor = (prompt("Instructor:", "") ?? "").trim();
    const plazas = Number(prompt("Número de plazas:", ""));
    if (nombre === "" || instructor === "" || !Number.isInteger(plazas) || plazas < 0) {
        alert("Error: datos de la actividad incorrectos.");
    } else if (buscarActividad(nombre)) {
        alert("Error: la actividad " + nombre + " ya existe.");
    } else {
        actividades.push({nombre: nombre, instructor: instructor, plazas: plazas});
        alert("Actividad " + nombre + " añadida con éxito.");
    }
}

const MENU = "¿Qué operación desea realizar?\n"
        + "1. Mostrar actividades\n"
        + "2. Reservar plaza\n"
        + "3. Liberar plaza\n"
        + "4. Agregar actividad\n"
        + "5. Salir\n\n"
        + "Opción:";

let opcion;
do {
    opcion = prompt(MENU, "");
    switch (opcion) {
        case "1":
            mostrarActividades();
            break;
        case "2":
            reservarPlaza();
            mostrarActividades("Actividades Actualizadas");
            break;
        case "3":
            liberarPlaza();
            mostrarActividades("Actividades Actualizadas");
            break;
        case "4":
            agregarActividad();
            mostrarActividades("Actividades Actualizadas");
            break;
        case "5":
        case null:
            alert("Hasta pronto.");
            break;
        default:
            alert("Error: opción no válida.");
    }
} while (opcion !== "5" && opcion !== null);
