//  Datos 
const actividades = [
  { nombre: "Spinning", instructor: "Ana López", plazas: 15 },
  { nombre: "Yoga", instructor: "Carmen Ruiz", plazas: 12 },
  { nombre: "Pilates", instructor: "Miguel Moya", plazas: 10 },
  { nombre: "Zumba", instructor: "Laura Martín", plazas: 20 },
  { nombre: "CrossFit", instructor: "David García", plazas: 8 },
  { nombre: "Aqua Aeróbicos", instructor: "Elena Sánchez", plazas: 18 },
  { nombre: "BodyCombat", instructor: "Carlos Vega", plazas: 16 },
  { nombre: "TRX", instructor: "María González", plazas: 6 },
  { nombre: "Body Pump", instructor: "Raúl Díaz", plazas: 14 },
  { nombre: "HIIT", instructor: "Marta Gil", plazas: 12 }
];

const MENU =
  "¿Qué operación desea realizar?\n" +
  "1. Mostrar actividades\n" +
  "2. Reservar plaza\n" +
  "3. Liberar plaza\n" +
  "4. Agregar actividad\n" +
  "5. Salir";

//  Funciones auxiliares 

// Normaliza un texto para comparar nombres sin distinguir mayúsculas ni espacios
const normalizar = (texto) => texto.trim().toLowerCase();

// Devuelve la actividad cuyo nombre coincide o undefined si no existe
function buscarActividad(nombre) {
  return actividades.find((a) => normalizar(a.nombre) === normalizar(nombre));
}

// Pide el nombre de una actividad, devuelve null si el usuario cancela o lo deja vacío
function pedirNombre(mensaje) {
  const texto = prompt(mensaje);
  return texto === null || texto.trim() === "" ? null : texto.trim();
}

//  Funciones requeridas 

function mostrarActividades(titulo = "Actividades Disponibles") {     //uso  map pero se podría hacer con un bucle for 
  const lineas = actividades.map((a) => `${a.nombre}: ${a.instructor} - ${a.plazas} plazas`);
  alert(`${titulo}:\n${lineas.join("\n")}`);
}

/* //versión con bucle
function mostrarActividadesBucle(titulo = "Actividades Disponibles") {
  const lineas = [];
  
  for (const a of actividades) {
    lineas.push(`${a.nombre}: ${a.instructor}\n${a.plazas} plazas`);
  }
  
  alert(`${titulo}:\n${lineas.join("\n")}`);
}
*/

function reservarPlaza() {
  const nombre = pedirNombre("Ingrese el nombre de la actividad:");
  if (nombre === null) {
    alert("ERROR: Debe indicar el nombre de una actividad.");
    return;
  }
  const actividad = buscarActividad(nombre);
  if (!actividad) {
    alert(`ERROR: La actividad "${nombre}" no existe.`);
  } else if (actividad.plazas === 0) {
    alert(`ERROR: No quedan plazas disponibles en ${actividad.nombre}.`);
  } else {
    actividad.plazas--;
    alert(`Plaza reservada con éxito en ${actividad.nombre}.`);
    mostrarActividades("Actividades Actualizadas");
  }
}

function liberarPlaza() {
  const nombre = pedirNombre("Ingrese el nombre de la actividad:");
  if (nombre === null) {
    alert("ERROR: Debe indicar el nombre de una actividad.");
    return;
  }
  const actividad = buscarActividad(nombre);
  if (!actividad) {
    alert(`ERROR: La actividad "${nombre}" no existe.`);
  } else {
    actividad.plazas++;
    alert(`Plaza liberada con éxito en ${actividad.nombre}.`);
    mostrarActividades("Actividades Actualizadas");
  }
}

function agregarActividad() {
  const nombre = pedirNombre("Nombre de la nueva actividad:");
  const instructor = nombre && pedirNombre("Instructor asignado:");
  const plazasTexto = instructor && prompt("Número de plazas:");
  const plazas = Number(plazasTexto);

  if (!nombre || !instructor) {
    alert("ERROR: El nombre y el instructor son obligatorios.");
  } else if (buscarActividad(nombre)) {
    alert(`ERROR: La actividad "${nombre}" ya existe.`);
  } else if (plazasTexto === null || plazasTexto.trim() === "" || !Number.isInteger(plazas) || plazas <= 0) {
    alert("ERROR: El número de plazas debe ser un entero mayor que 0.");
  } else {
    actividades.push({ nombre: nombre, instructor: instructor, plazas: plazas });
    alert(`Actividad "${nombre}" añadida con éxito.`);
    mostrarActividades("Actividades Actualizadas");
  }
}

//  Programa principal 

mostrarActividades();

let opcion;
do {
  const respuesta = prompt(MENU);
  // Si el usuario cancela el prompt, se interpreta como Salir (caso 5)
  opcion = respuesta === null ? "5" : respuesta.trim();

  switch (opcion) {
    case "1":
      mostrarActividades();
      break;
    case "2":
      reservarPlaza();
      break;
    case "3":
      liberarPlaza();
      break;
    case "4":
      agregarActividad();
      break;
    case "5":
      alert("Hasta pronto.");
      break;
    default:
      alert("ERROR: Opción no válida. Elija un número del 1 al 5.");
  }
} while (opcion !== "5");
