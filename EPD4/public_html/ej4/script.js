// tamaño del ecosistema en píxeles, el mismo que en el css
const ANCHO = 800;
const ALTO = 500;

// distancias en píxeles para comer, criar y buscar pareja
const DISTANCIA_CONTACTO = 35;
const DISTANCIA_PAREJA = 70;
const DISTANCIA_BUSCAR_PAREJA = 400;

// datos de cada especie
const especies = {
    herbivoro: {
        nombre: "Herbívoro", icono: "🐇", energia: 100, velocidad: 2, vision: 150, gasto: 4,
        edadMaxima: 40, madurez: 4, descanso: 5, probCria: 0.5, maximo: 30
    },
    carnivoro: {
        nombre: "Carnívoro", icono: "🐺", energia: 140, velocidad: 3, vision: 130, gasto: 4,
        edadMaxima: 80, madurez: 6, descanso: 12, probCria: 0.3, probCaza: 0.55, maximo: 8
    },
    omnivoro: {
        nombre: "Omnívoro", icono: "🐻", energia: 130, velocidad: 2, vision: 120, gasto: 5,
        edadMaxima: 60, madurez: 6, descanso: 12, probCria: 0.2, probCaza: 0.25, maximo: 8
    },
    planta: {
        nombre: "Planta", icono: "🌱", energia: 40, edadMaxima: 90, maximo: 50
    }
};

// variables de la simulación
let contadorId = 0;
let generacion = 1;
let intervalo = null;
let arrastrado = null;
let organismoTooltip = null;
let estadoAnterior = "";

document.addEventListener("DOMContentLoaded", iniciarEcosistema);

// crea los organismos iniciales y arranca el ciclo de vida
function iniciarEcosistema() {
    const ecosistema = document.getElementById("ecosistema");
    ecosistema.addEventListener("dragover", permitirSoltar);
    ecosistema.addEventListener("drop", soltarOrganismo);
    crearIniciales("planta", 16);
    crearIniciales("herbivoro", 10);
    crearIniciales("carnivoro", 4);
    crearIniciales("omnivoro", 4);
    registrarEvento("Ecosistema iniciado");
    actualizarEstadisticas();
    intervalo = setInterval(simularCicloVida, 2000); // ejecuta el ciclo de vida cada 2 segundos
}

// crea varios organismos con edades distintas para que no envejezcan todos a la vez
function crearIniciales(tipo, cantidad) {
    for (let i = 0; i < cantidad; i++) {
        const sitio = buscarSitioLibre();
        const organismo = crearOrganismo(tipo, sitio.x, sitio.y);
        organismo.dataset.edad = Math.floor(Math.random() * especies[tipo].edadMaxima / 2);
    }
}

// añade un organismo del tipo indicado en una posición libre al azar
function añadirEspecie(tipo) {
    const sitio = buscarSitioLibre();
    const organismo = crearOrganismo(tipo, sitio.x, sitio.y);
    registrarEvento("Se añade " + nombre(organismo));
    actualizarEstadisticas();
}

// crea el div del organismo con sus propiedades y eventos y lo añade al ecosistema
function crearOrganismo(tipo, x, y) {
    const especie = especies[tipo];
    const organismo = document.createElement("div");
    organismo.className = "organismo " + tipo;
    organismo.innerText = especie.icono;
    organismo.draggable = true; // permite arrastrar el organismo con el ratón
    colocar(organismo, x, y);

    // propiedades del organismo
    organismo.dataset.tipo = tipo; // dataset guarda los datos en atributos data- del elemento
    organismo.dataset.id = generarIdUnico();
    organismo.dataset.energia = especie.energia;
    organismo.dataset.edad = 0;
    if (tipo === "planta") {
        organismo.dataset.tamano = 1;
        organismo.dataset.rebrota = "true";
        organismo.style.fontSize = "16px";
    } else {
        organismo.dataset.velocidad = especie.velocidad;
        organismo.dataset.generacion = 1;
        organismo.dataset.descanso = 0;
    }

    // eventos para interactuar con el organismo
    organismo.addEventListener("click", mostrarInfoOrganismo);
    organismo.addEventListener("dblclick", eliminarConDobleClic);
    organismo.addEventListener("mouseover", mostrarResumen);
    organismo.addEventListener("mouseout", ocultarTooltip);
    organismo.addEventListener("dragstart", empezarArrastre);
    organismo.addEventListener("dragend", terminarArrastre);

    document.getElementById("ecosistema").appendChild(organismo);
    return organismo;
}

// devuelve un número distinto para cada organismo
function generarIdUnico() {
    contadorId++;
    return contadorId;
}

// coloca el organismo en x, y sin que se salga del ecosistema
function colocar(organismo, x, y) {
    if (x < 0) {
        x = 0;
    }
    if (x > ANCHO - 30) {
        x = ANCHO - 30;
    }
    if (y < 0) {
        y = 0;
    }
    if (y > ALTO - 30) {
        y = ALTO - 30;
    }
    organismo.style.left = Math.round(x) + "px";
    organismo.style.top = Math.round(y) + "px";
}

// busca al azar una posición sin organismos alrededor
function buscarSitioLibre() {
    const organismos = obtenerOrganismos();
    let x;
    let y;
    let libre;
    let intentos = 0;

    // prueba posiciones al azar hasta encontrar una libre o llegar a 20 intentos
    do {
        x = Math.random() * (ANCHO - 30);
        y = Math.random() * (ALTO - 30);
        libre = true;
        for (let i = 0; i < organismos.length; i++) {
            const dx = parseInt(organismos[i].style.left) - x;
            const dy = parseInt(organismos[i].style.top) - y;
            if (Math.sqrt(dx * dx + dy * dy) < 30) {
                libre = false;
            }
        }
        intentos++;
    } while (!libre && intentos < 20);
    return { x: x, y: y };
}

// devuelve una lista con los organismos que siguen vivos
function obtenerOrganismos() {
    const divs = document.getElementById("ecosistema").getElementsByTagName("div");
    const lista = [];
    for (let i = 0; i < divs.length; i++) {
        if (divs[i].dataset.muerto !== "si") {
            lista.push(divs[i]);
        }
    }
    return lista;
}

// cuenta los organismos vivos de un tipo
function contar(tipo) {
    const organismos = obtenerOrganismos();
    let total = 0;
    for (let i = 0; i < organismos.length; i++) {
        if (organismos[i].dataset.tipo === tipo) {
            total++;
        }
    }
    return total;
}

// texto con el icono, la especie y el número del organismo
function nombre(organismo) {
    return organismo.innerText + " " + especies[organismo.dataset.tipo].nombre + " #" + organismo.dataset.id;
}

// distancia en píxeles entre dos organismos
function distancia(a, b) {
    const dx = parseInt(a.style.left) - parseInt(b.style.left);
    const dy = parseInt(a.style.top) - parseInt(b.style.top);
    return Math.sqrt(dx * dx + dy * dy);
}

// ciclo de vida: envejecer, moverse, comer, reproducirse y brotar plantas
function simularCicloVida() {
    let organismos = obtenerOrganismos();
    for (let i = 0; i < organismos.length; i++) {
        envejecer(organismos[i]);
    }
    organismos = obtenerOrganismos();
    for (let i = 0; i < organismos.length; i++) {
        moverOrganismo(organismos[i]);
    }
    interaccionOrganismos();
    brotarPlantas();
    actualizarEstadisticas();
}

// suma un ciclo de edad y gasta energía; muere si es demasiado viejo o se queda sin energía
function envejecer(organismo) {
    const especie = especies[organismo.dataset.tipo];
    const edad = parseInt(organismo.dataset.edad) + 1;
    organismo.dataset.edad = edad;
    if (edad > especie.edadMaxima) {
        if (organismo.dataset.tipo !== "planta") {
            registrarEvento(nombre(organismo) + " ha muerto de vejez");
        }
        eliminarOrganismo(organismo);
        return;
    }

    // las plantas crecen cada 4 ciclos hasta el tamaño 3
    if (organismo.dataset.tipo === "planta") {
        if (edad % 4 === 0 && parseInt(organismo.dataset.tamano) < 3) {
            cambiarTamano(organismo, parseInt(organismo.dataset.tamano) + 1);
        }
        return;
    }

    const energia = parseInt(organismo.dataset.energia) - especie.gasto;
    organismo.dataset.energia = energia;
    if (parseInt(organismo.dataset.descanso) > 0) {
        organismo.dataset.descanso = parseInt(organismo.dataset.descanso) - 1;
    }
    if (energia <= 0) {
        registrarEvento(nombre(organismo) + " ha muerto de hambre");
        eliminarOrganismo(organismo);
    }
}

// cambia el tamaño de una planta y la energía que da al comerla
function cambiarTamano(planta, tamano) {
    planta.dataset.tamano = tamano;
    planta.dataset.energia = especies.planta.energia * tamano;
    planta.style.fontSize = (10 + tamano * 6) + "px";
}

// mueve el organismo; si es un animal y ve comida o pareja va hacia ella y si no, o si ya está encima, se mueve al azar
function moverOrganismo(elemento) {
    if (elemento === arrastrado) {
        return;
    }
    const x = parseInt(elemento.style.left);
    const y = parseInt(elemento.style.top);
    let paso = 8; // las plantas solo se mueven un poco
    let objetivo = null;
    if (elemento.dataset.tipo !== "planta") {
        paso = parseInt(elemento.dataset.velocidad) * 22;
        objetivo = buscarObjetivo(elemento);
    }

    if (objetivo !== null && distancia(elemento, objetivo) > 0) {
        // avanza en línea recta hacia el objetivo sin pasarse
        const dx = parseInt(objetivo.style.left) - x;
        const dy = parseInt(objetivo.style.top) - y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d <= paso) {
            colocar(elemento, x + dx, y + dy);
        } else {
            colocar(elemento, x + dx / d * paso, y + dy / d * paso);
        }
    } else {
        colocar(elemento, x + (Math.random() * 2 - 1) * paso, y + (Math.random() * 2 - 1) * paso); // desplazamiento al azar entre -paso y paso
    }
}

// con hambre busca comida y si puede criar busca pareja
function buscarObjetivo(animal) {
    if (tieneHambre(animal)) {
        return buscarCercano(animal, especies[animal.dataset.tipo].vision, "comida");
    }
    if (puedeCriar(animal)) {
        return buscarCercano(animal, DISTANCIA_BUSCAR_PAREJA, "pareja");
    }
    return null;
}

// devuelve el organismo más cercano que sea comida o pareja del animal dentro de la distancia
function buscarCercano(animal, maxDistancia, queBusca) {
    const organismos = obtenerOrganismos();
    let elegido = null;
    let menor = maxDistancia;
    for (let i = 0; i < organismos.length; i++) {
        const otro = organismos[i];
        let sirve = false;
        if (queBusca === "comida") {
            sirve = esComida(animal, otro);
        } else {
            sirve = otro !== animal && otro.dataset.tipo === animal.dataset.tipo && puedeCriar(otro);
        }
        if (sirve && distancia(animal, otro) <= menor) {
            elegido = otro;
            menor = distancia(animal, otro);
        }
    }
    return elegido;
}

// indica si el organismo otro es comida para el animal
function esComida(animal, otro) {
    const tipo = animal.dataset.tipo;
    const presa = otro.dataset.tipo;
    if (tipo === "herbivoro") {
        return presa === "planta";
    }
    if (tipo === "carnivoro") {
        return presa === "herbivoro";
    }
    return presa === "planta" || presa === "herbivoro";
}

// un animal tiene hambre si le queda menos del 60 % de su energía
function tieneHambre(animal) {
    return parseInt(animal.dataset.energia) < especies[animal.dataset.tipo].energia * 0.6;
}

// un animal puede criar si es adulto, ha descansado y tiene al menos la mitad de su energía
function puedeCriar(animal) {
    const especie = especies[animal.dataset.tipo];
    return parseInt(animal.dataset.edad) >= especie.madurez && parseInt(animal.dataset.descanso) === 0 && parseInt(animal.dataset.energia) >= especie.energia / 2;
}

// detecta los organismos que están cerca para comer, cazar, huir y reproducirse
function interaccionOrganismos() {
    const organismos = obtenerOrganismos();

    // los animales con hambre comen lo que tengan al lado
    for (let i = 0; i < organismos.length; i++) {
        const animal = organismos[i];
        if (animal.dataset.tipo !== "planta" && animal.dataset.muerto !== "si" && tieneHambre(animal)) {
            const comida = buscarCercano(animal, DISTANCIA_CONTACTO, "comida");
            if (comida !== null) {
                comer(animal, comida);
            }
        }
    }

    // los animales que pueden criar tienen una cría si hay una pareja a su lado
    for (let i = 0; i < organismos.length; i++) {
        const animal = organismos[i];
        if (animal.dataset.tipo !== "planta" && animal.dataset.muerto !== "si" && puedeCriar(animal)) {
            const especie = especies[animal.dataset.tipo];
            const pareja = buscarCercano(animal, DISTANCIA_PAREJA, "pareja");
            if (pareja !== null && Math.random() < especie.probCria && contar(animal.dataset.tipo) < especie.maximo) {
                reproducirEspecie(animal, pareja);
            }
        }
    }
}

// el animal se come la planta o intenta cazar al otro animal
function comer(animal, comida) {
    const especie = especies[animal.dataset.tipo];
    if (comida.dataset.tipo === "planta") {
        ganarEnergia(animal, parseInt(comida.dataset.energia));
        // la planta rebrota la primera vez y la segunda desaparece
        if (comida.dataset.rebrota === "true") {
            comida.dataset.rebrota = "false";
            cambiarTamano(comida, 1);
        } else {
            eliminarOrganismo(comida);
        }
    } else if (Math.random() < especie.probCaza) {
        ganarEnergia(animal, 70);
        registrarEvento(nombre(comida) + " ha sido cazado por " + nombre(animal));
        eliminarOrganismo(comida);
    } else {
        huir(comida, animal);
    }
}

// suma energía al animal sin pasarse de su máximo
function ganarEnergia(animal, cantidad) {
    let energia = parseInt(animal.dataset.energia) + cantidad;
    if (energia > especies[animal.dataset.tipo].energia) {
        energia = especies[animal.dataset.tipo].energia;
    }
    animal.dataset.energia = energia;
}

// la presa se aleja del depredador
function huir(presa, depredador) {
    const dx = parseInt(presa.style.left) - parseInt(depredador.style.left);
    const dy = parseInt(presa.style.top) - parseInt(depredador.style.top);
    let d = Math.sqrt(dx * dx + dy * dy);
    if (d === 0) {
        d = 1;
    }
    const salto = parseInt(presa.dataset.velocidad) * 30;
    colocar(presa, parseInt(presa.style.left) + dx / d * salto, parseInt(presa.style.top) + dy / d * salto);
    registrarEvento(nombre(presa) + " escapa de " + nombre(depredador));
}

// crea una cría cerca de los padres y aumenta la generación
function reproducirEspecie(padre1, padre2) {
    const tipo = padre1.dataset.tipo;
    const especie = especies[tipo];
    const x = (parseInt(padre1.style.left) + parseInt(padre2.style.left)) / 2 + Math.random() * 40 - 20;
    const y = (parseInt(padre1.style.top) + parseInt(padre2.style.top)) / 2 + Math.random() * 40 - 20;
    const hijo = crearOrganismo(tipo, x, y);

    // la cría es de la generación siguiente a la del padre más avanzado
    let generacionPadres = parseInt(padre1.dataset.generacion);
    if (parseInt(padre2.dataset.generacion) > generacionPadres) {
        generacionPadres = parseInt(padre2.dataset.generacion);
    }
    hijo.dataset.generacion = generacionPadres + 1;
    hijo.dataset.energia = especie.energia * 0.6;
    if (generacionPadres + 1 > generacion) {
        generacion = generacionPadres + 1;
    }

    // los padres pierden energía y tienen que descansar antes de volver a criar
    padre1.dataset.energia = parseInt(padre1.dataset.energia) - especie.energia * 0.2;
    padre2.dataset.energia = parseInt(padre2.dataset.energia) - especie.energia * 0.2;
    padre1.dataset.descanso = especie.descanso;
    padre2.dataset.descanso = especie.descanso;

    registrarEvento("Nace " + nombre(hijo) + " (generación " + hijo.dataset.generacion + ")");
    return hijo;
}

// cada ciclo pueden aparecer hasta 3 plantas nuevas en sitios vacíos
function brotarPlantas() {
    for (let i = 0; i < 3; i++) {
        if (Math.random() < 0.7 && contar("planta") < especies.planta.maximo) {
            const sitio = buscarSitioLibre();
            crearOrganismo("planta", sitio.x, sitio.y);
        }
    }
}

// hace la animación de muerte y después quita el organismo del ecosistema
function eliminarOrganismo(elemento) {
    if (elemento.dataset.muerto === "si") {
        return;
    }
    elemento.dataset.muerto = "si";
    elemento.style.opacity = "0";
    elemento.style.transform = "scale(0)"; // con la transición del css se va encogiendo
    if (elemento === organismoTooltip) {
        ocultarTooltip();
    }
    actualizarEstadisticas();

    // se quita del dom cuando termina la animación
    setTimeout(function () {
        document.getElementById("ecosistema").removeChild(elemento);
    }, 600);
}

// el doble clic elimina el organismo
function eliminarConDobleClic(event) {
    registrarEvento("El usuario elimina " + nombre(event.target));
    eliminarOrganismo(event.target);
}

// cuenta los organismos, actualiza los contadores y calcula el estado del ecosistema
function actualizarEstadisticas() {
    const herbivoros = contar("herbivoro");
    const carnivoros = contar("carnivoro");
    const plantas = contar("planta");
    const omnivoros = contar("omnivoro");
    document.getElementById("count-herbivoro").innerText = herbivoros;
    document.getElementById("count-carnivoro").innerText = carnivoros;
    document.getElementById("count-planta").innerText = plantas;
    document.getElementById("count-omnivoro").innerText = omnivoros;
    document.getElementById("generacion").innerText = generacion;

    // hay sobrepoblación si una especie pasa de 1.5 veces su proporción normal (30 %, 15 %, 40 % y 15 %)
    const total = herbivoros + carnivoros + plantas + omnivoros;
    let estado = "Equilibrado";
    if (herbivoros + carnivoros + omnivoros < 3) {
        estado = "Colapso";
    } else if (herbivoros === 0 || carnivoros === 0 || plantas === 0 || omnivoros === 0) {
        estado = "Extinción";
    } else if (herbivoros > total * 0.3 * 1.5 || carnivoros > total * 0.15 * 1.5 || plantas > total * 0.4 * 1.5 || omnivoros > total * 0.15 * 1.5) {
        estado = "Sobrepoblación";
    }
    document.getElementById("estado").innerText = estado;
    if (estado !== estadoAnterior) {
        registrarEvento("Estado del ecosistema: " + estado);
        estadoAnterior = estado;
    }
}

// añade el mensaje con la hora al principio del registro y deja solo los 10 últimos
function registrarEvento(mensaje) {
    const lista = document.getElementById("eventos-lista");
    const evento = document.createElement("p");
    const hora = new Date().toLocaleTimeString(); // hora actual en formato hh:mm:ss
    evento.appendChild(document.createTextNode(hora + " - " + mensaje));
    lista.insertBefore(evento, lista.firstChild); // lo pone el primero de la lista
    if (lista.childNodes.length > 10) {
        lista.removeChild(lista.lastChild);
    }
}

// al hacer clic muestra toda la información del organismo
function mostrarInfoOrganismo(event) {
    const organismo = event.target;
    let texto = nombre(organismo) + "\nEdad: " + organismo.dataset.edad + " ciclos\nEnergía: " + organismo.dataset.energia;
    if (organismo.dataset.tipo === "planta") {
        texto = texto + "\nTamaño: " + organismo.dataset.tamano + "\nRebrota: " + organismo.dataset.rebrota;
    } else {
        texto = texto + "\nVelocidad: " + organismo.dataset.velocidad + "\nGeneración: " + organismo.dataset.generacion;
    }
    mostrarTooltip(organismo, texto, event);
}

// al pasar el ratón por encima muestra un resumen del organismo
function mostrarResumen(event) {
    mostrarTooltip(event.target, nombre(event.target) + " - energía: " + event.target.dataset.energia, event);
}

// coloca el tooltip al lado del ratón con el texto indicado
function mostrarTooltip(organismo, texto, event) {
    const tooltip = document.getElementById("tooltip");
    tooltip.innerText = texto;
    tooltip.style.left = (event.pageX + 15) + "px"; // pageX y pageY son la posición del ratón en la página
    tooltip.style.top = (event.pageY + 15) + "px";
    tooltip.style.display = "block";
    organismoTooltip = organismo;
}

// oculta el tooltip cuando el ratón sale del organismo
function ocultarTooltip() {
    document.getElementById("tooltip").style.display = "none";
    organismoTooltip = null;
}

// guarda el organismo que se empieza a arrastrar
function empezarArrastre(event) {
    arrastrado = event.target;
    event.dataTransfer.setData("text", arrastrado.dataset.id); // firefox necesita datos para dejar arrastrar
    ocultarTooltip();
}

// al terminar el arrastre ya no hay ningún organismo arrastrado
function terminarArrastre() {
    arrastrado = null;
}

// permite soltar organismos dentro del ecosistema
function permitirSoltar(event) {
    event.preventDefault(); // por defecto el navegador no deja soltar nada
}

// mueve el organismo arrastrado al punto donde se suelta
function soltarOrganismo(event) {
    event.preventDefault(); // evita que el navegador intente abrir lo que se suelta
    if (arrastrado !== null && arrastrado.dataset.muerto !== "si") {
        const ecosistema = document.getElementById("ecosistema");
        const x = event.pageX - ecosistema.offsetLeft - 15; // offsetLeft y offsetTop son la posición del ecosistema en la página
        const y = event.pageY - ecosistema.offsetTop - 15;
        colocar(arrastrado, x, y);
        registrarEvento("El usuario mueve " + nombre(arrastrado));
    }
}

// para o reanuda la simulación
function pausarReanudar() {
    const boton = document.getElementById("boton-pausa");
    if (intervalo === null) {
        intervalo = setInterval(simularCicloVida, 2000);
        boton.innerText = "Pausar";
        registrarEvento("Simulación reanudada");
    } else {
        clearInterval(intervalo);
        intervalo = null;
        boton.innerText = "Reanudar";
        registrarEvento("Simulación en pausa");
    }
}
