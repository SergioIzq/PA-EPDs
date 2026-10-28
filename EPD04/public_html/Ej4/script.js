'use strict';

// Parámetros de cada especie. Las energías se miden en unidades y las edades en ciclos de simulación.
const ESPECIES = {
    herbivoro: {
        nombre: 'Herbívoro', icono: '🐰', energia: 80, energiaMax: 120, gasto: 3, edadMax: 40,
        velocidad: 2, probReproduccion: 0.3, energiaReproduccion: 70, costeReproduccion: 30, dieta: ['planta']
    },
    carnivoro: {
        nombre: 'Carnívoro', icono: '🦊', energia: 100, energiaMax: 150, gasto: 3, edadMax: 90,
        velocidad: 3, probReproduccion: 0.25, energiaReproduccion: 80, costeReproduccion: 35, dieta: ['herbivoro']
    },
    omnivoro: {
        nombre: 'Omnívoro', icono: '🐻', energia: 90, energiaMax: 140, gasto: 3, edadMax: 80,
        velocidad: 2, probReproduccion: 0.3, energiaReproduccion: 75, costeReproduccion: 35, dieta: ['planta', 'herbivoro']
    },
    planta: {nombre: 'Planta', icono: '🌿', energia: 40, edadMax: 60, tamanoMax: 3}
};
const TIPOS = Object.keys(ESPECIES);
const DEPREDADORES = ['carnivoro', 'omnivoro'];
const POBLACION_INICIAL = {planta: 14, herbivoro: 6, carnivoro: 2, omnivoro: 2};

const CICLO_MS = 2000;
const TAMANO = 28;
const PASO = 18;
const RADIO_INTERACCION = 32;
const RADIO_VISION = 150;
const RADIO_HUIDA = 80;
const UMBRAL_HAMBRE = 0.8;
const CICLOS_CRECIMIENTO = 8;
const PROB_BROTE = 0.7;
const MAX_PLANTAS = 45;
const MAX_ORGANISMOS = 120;
const MIN_ORGANISMOS = 6;
const RATIO_SOBREPOBLACION = 1.5;
const MAX_EVENTOS = 10;
const DURACION_MUERTE = 500;

let ecosistema;
let tooltip;
let intervalo = null;
let generacion = 1;
let contadorId = 0;
let seleccionado = null;
let arrastre = null;
let estadoEcosistema = '';

document.addEventListener('DOMContentLoaded', iniciarEcosistema);

function iniciarEcosistema() {
    ecosistema = document.getElementById('ecosistema');
    tooltip = document.getElementById('tooltip');

    document.querySelectorAll('#panel-control [data-especie]').forEach((boton) => {
        boton.addEventListener('click', () => añadirEspecie(boton.dataset.especie));
    });
    document.getElementById('btn-pausa').addEventListener('click', alternarPausa);

    // Un clic sobre el fondo (no sobre un organismo) cierra el tooltip fijado
    ecosistema.addEventListener('click', deseleccionar);
    ecosistema.addEventListener('dragover', (event) => {
        if (arrastre) {
            event.preventDefault();
        }
    });
    ecosistema.addEventListener('drop', soltarOrganismo);

    for (const [tipo, cantidad] of Object.entries(POBLACION_INICIAL)) {
        for (let i = 0; i < cantidad; i++) {
            const {x, y} = posicionLibre() || posicionAleatoria();
            crearOrganismo(tipo, x, y);
        }
    }
    registrarEvento('Ecosistema inicializado');
    actualizarEstadisticas();
    intervalo = setInterval(simularCicloVida, CICLO_MS);
}

function generarIdUnico() {
    return String(++contadorId);
}

function añadirEspecie(tipo) {
    if (organismosVivos().length >= MAX_ORGANISMOS) {
        registrarEvento('El ecosistema ha alcanzado su capacidad máxima');
        return;
    }
    const {x, y} = posicionLibre() || posicionAleatoria();
    const organismo = crearOrganismo(tipo, x, y);
    registrarEvento(`Se añade un ${ESPECIES[tipo].nombre.toLowerCase()} (#${organismo.dataset.id})`);
    actualizarEstadisticas();
}

function crearOrganismo(tipo, x, y, generacionOrganismo = 1) {
    const config = ESPECIES[tipo];
    const organismo = document.createElement('div');

    organismo.className = `organismo ${tipo} naciendo`;
    organismo.textContent = config.icono;
    organismo.draggable = true;
    organismo.style.position = 'absolute';
    organismo.style.fontSize = '20px';
    organismo.style.cursor = 'pointer';

    organismo.dataset.tipo = tipo;
    organismo.dataset.energia = config.energia;
    organismo.dataset.edad = '0';
    organismo.dataset.generacion = generacionOrganismo;
    organismo.dataset.id = generarIdUnico();
    if (tipo === 'planta') {
        organismo.dataset.tamano = '1';
        organismo.dataset.rebrota = 'true';
        organismo.style.fontSize = tamanoFuente(1);
    } else {
        organismo.dataset.velocidad = config.velocidad;
    }

    organismo.addEventListener('click', mostrarInfoOrganismo);
    organismo.addEventListener('dblclick', () => eliminarOrganismo(organismo, 'eliminado por el usuario'));
    organismo.addEventListener('mouseover', () => mostrarTooltip(organismo));
    organismo.addEventListener('mouseout', () => seleccionado ? mostrarTooltip(seleccionado) : ocultarTooltip());
    organismo.addEventListener('dragstart', iniciarArrastre);
    organismo.addEventListener('dragend', finalizarArrastre);
    organismo.addEventListener('animationend', () => organismo.classList.remove('naciendo'), {once: true});

    colocar(organismo, x, y);
    ecosistema.appendChild(organismo);
    return organismo;
}

function simularCicloVida() {
    organismosVivos().forEach(envejecer);
    organismosVivos().filter(esAnimal).forEach(moverOrganismo);
    interaccionOrganismos();
    brotarPlantas();
    actualizarEstadisticas();
    if (seleccionado) {
        mostrarTooltip(seleccionado);
    }
}

function envejecer(organismo) {
    const tipo = organismo.dataset.tipo;
    const config = ESPECIES[tipo];
    const edad = valor(organismo, 'edad') + 1;
    organismo.dataset.edad = edad;

    if (tipo === 'planta') {
        const tamano = valor(organismo, 'tamano');
        if (edad % CICLOS_CRECIMIENTO === 0 && tamano < config.tamanoMax) {
            fijarTamanoPlanta(organismo, tamano + 1);
        }
    } else {
        organismo.dataset.energia = valor(organismo, 'energia') - config.gasto;
    }

    if (edad > config.edadMax) {
        eliminarOrganismo(organismo, 'muere de vejez');
    } else if (valor(organismo, 'energia') <= 0) {
        eliminarOrganismo(organismo, 'muere de hambre');
    }
}

function moverOrganismo(elemento) {
    const origen = posicion(elemento);
    const paso = valor(elemento, 'velocidad') * PASO;
    const rumbo = calcularRumbo(elemento);
    let angulo = Math.random() * 2 * Math.PI;
    let avance = paso;

    if (rumbo) {
        const destino = posicion(rumbo.objetivo);
        angulo = Math.atan2(destino.y - origen.y, destino.x - origen.x) + (rumbo.huir ? Math.PI : 0);
        if (!rumbo.huir) {
            avance = Math.min(paso, distancia(elemento, rumbo.objetivo));
        }
    }
    // La transición CSS sobre left/top suaviza el desplazamiento
    colocar(elemento, origen.x + Math.cos(angulo) * avance, origen.y + Math.sin(angulo) * avance);
}

// Prioridades: huir de depredadores > buscar pareja > buscar comida > movimiento aleatorio
function calcularRumbo(elemento) {
    const tipo = elemento.dataset.tipo;
    const depredador = tipo === 'herbivoro' && masCercano(elemento, DEPREDADORES, RADIO_HUIDA);
    if (depredador) {
        return {objetivo: depredador, huir: true};
    }
    const pareja = puedeReproducirse(elemento) && masCercano(elemento, [tipo], RADIO_VISION, puedeReproducirse);
    const presa = estaHambriento(elemento) && masCercano(elemento, ESPECIES[tipo].dieta, RADIO_VISION);
    const objetivo = pareja || presa;
    return objetivo ? {objetivo, huir: false} : null;
}

function interaccionOrganismos() {
    const reproducidos = new Set();

    for (const organismo of organismosVivos().filter(esAnimal)) {
        if (!estaVivo(organismo)) {
            continue;
        }
        const tipo = organismo.dataset.tipo;
        const config = ESPECIES[tipo];

        const presa = estaHambriento(organismo) && masCercano(organismo, config.dieta, RADIO_INTERACCION);
        if (presa) {
            comer(organismo, presa);
        }

        if (reproducidos.has(organismo) || !puedeReproducirse(organismo)) {
            continue;
        }
        const pareja = masCercano(organismo, [tipo], RADIO_INTERACCION,
                (otro) => puedeReproducirse(otro) && !reproducidos.has(otro));
        if (pareja && Math.random() < config.probReproduccion) {
            reproducirEspecie(organismo, pareja);
            reproducidos.add(organismo).add(pareja);
        }
    }
}

function comer(depredador, presa) {
    const config = ESPECIES[depredador.dataset.tipo];
    const energia = Math.min(config.energiaMax, valor(depredador, 'energia') + valor(presa, 'energia'));
    depredador.dataset.energia = energia;

    const quien = `${config.nombre} #${depredador.dataset.id}`;
    if (presa.dataset.tipo === 'planta' && presa.dataset.rebrota === 'true') {
        // La primera vez que se come una planta no muere: vuelve a brotar desde el tamaño mínimo
        presa.dataset.rebrota = 'false';
        presa.dataset.edad = '0';
        fijarTamanoPlanta(presa, 1);
        registrarEvento(`${quien} se alimenta de la planta #${presa.dataset.id}, que rebrota`);
    } else {
        const accion = presa.dataset.tipo === 'planta' ? 'devorada' : 'cazado';
        eliminarOrganismo(presa, `${accion} por ${quien}`);
    }
}

function reproducirEspecie(padre1, padre2) {
    if (organismosVivos().length >= MAX_ORGANISMOS) {
        return;
    }
    const tipo = padre1.dataset.tipo;
    const config = ESPECIES[tipo];
    for (const padre of [padre1, padre2]) {
        padre.dataset.energia = valor(padre, 'energia') - config.costeReproduccion;
    }

    const p1 = posicion(padre1);
    const p2 = posicion(padre2);
    const desplazamiento = () => (Math.random() - 0.5) * 2 * RADIO_INTERACCION;
    const generacionHijo = Math.max(valor(padre1, 'generacion'), valor(padre2, 'generacion')) + 1;
    generacion = Math.max(generacion, generacionHijo);

    const hijo = crearOrganismo(tipo, (p1.x + p2.x) / 2 + desplazamiento(), (p1.y + p2.y) / 2 + desplazamiento(), generacionHijo);
    registrarEvento(`Nace un ${config.nombre.toLowerCase()} (#${hijo.dataset.id}) de generación ${generacionHijo}`);
}

function brotarPlantas() {
    const total = organismosVivos().length;
    if (total >= MAX_ORGANISMOS || organismosVivos('planta').length >= MAX_PLANTAS || Math.random() > PROB_BROTE) {
        return;
    }
    const hueco = posicionLibre();
    if (hueco) {
        crearOrganismo('planta', hueco.x, hueco.y);
    }
}

function eliminarOrganismo(elemento, causa) {
    if (!estaVivo(elemento)) {
        return;
    }
    if (seleccionado === elemento) {
        deseleccionar();
    }
    elemento.classList.add('muriendo');
    registrarEvento(`${ESPECIES[elemento.dataset.tipo].nombre} #${elemento.dataset.id} ${causa}`);
    actualizarEstadisticas();

    // Se espera a que termine la animación de muerte antes de sacarlo del DOM
    setTimeout(() => {
        if (elemento.parentNode === ecosistema) {
            ecosistema.removeChild(elemento);
        }
    }, DURACION_MUERTE);
}

function actualizarEstadisticas() {
    const conteos = {};
    for (const tipo of TIPOS) {
        conteos[tipo] = organismosVivos(tipo).length;
        document.getElementById('count-' + tipo).textContent = conteos[tipo];
    }
    document.getElementById('generacion').textContent = generacion;

    const nuevoEstado = calcularEstado(conteos);
    if (nuevoEstado !== estadoEcosistema) {
        estadoEcosistema = nuevoEstado;
        document.getElementById('estado-ecosistema').textContent = nuevoEstado;
        registrarEvento('Estado del ecosistema: ' + nuevoEstado);
    }
}

function calcularEstado(conteos) {
    const total = Object.values(conteos).reduce((suma, n) => suma + n, 0);
    if (total < MIN_ORGANISMOS) {
        return 'Colapso';
    }
    const extinta = TIPOS.find((tipo) => conteos[tipo] === 0);
    if (extinta) {
        return `Extinción (${ESPECIES[extinta].nombre.toLowerCase()})`;
    }
    // Una especie domina si supera en 1.5 veces al resto de especies juntas
    const dominante = TIPOS.find((tipo) => conteos[tipo] >= RATIO_SOBREPOBLACION * (total - conteos[tipo]));
    if (dominante) {
        return `Sobrepoblación (${ESPECIES[dominante].nombre.toLowerCase()})`;
    }
    return 'Equilibrado';
}

function registrarEvento(mensaje) {
    const lista = document.getElementById('eventos-lista');
    const entrada = document.createElement('p');
    entrada.textContent = `[${new Date().toLocaleTimeString()}] ${mensaje}`;
    lista.insertBefore(entrada, lista.firstChild);

    while (lista.children.length > MAX_EVENTOS) {
        lista.removeChild(lista.lastChild);
    }
}

function alternarPausa() {
    const boton = document.getElementById('btn-pausa');
    if (intervalo) {
        clearInterval(intervalo);
        intervalo = null;
        registrarEvento('Simulación pausada');
    } else {
        intervalo = setInterval(simularCicloVida, CICLO_MS);
        registrarEvento('Simulación reanudada');
    }
    const pausado = intervalo === null;
    boton.textContent = pausado ? 'Reanudar simulación' : 'Pausar simulación';
    boton.classList.toggle('pausado', pausado);
    ecosistema.classList.toggle('pausado', pausado);
}

// --- Tooltip e interacción del usuario ---

function mostrarInfoOrganismo(event) {
    // Evita que el clic llegue al fondo del ecosistema, que cerraría el tooltip
    event.stopPropagation();
    const organismo = event.currentTarget;
    const yaSeleccionado = seleccionado === organismo;
    deseleccionar();
    if (!yaSeleccionado) {
        seleccionado = organismo;
        organismo.classList.add('seleccionado');
        mostrarTooltip(organismo);
    }
}

function deseleccionar() {
    if (seleccionado) {
        seleccionado.classList.remove('seleccionado');
        seleccionado = null;
    }
    ocultarTooltip();
}

function mostrarTooltip(organismo) {
    const config = ESPECIES[organismo.dataset.tipo];
    const datos = organismo.dataset;
    const lineas = [
        `${config.icono} ${config.nombre} #${datos.id}`,
        `Energía: ${datos.energia}`,
        `Edad: ${datos.edad} / ${config.edadMax} ciclos`,
        `Generación: ${datos.generacion}`
    ];
    if (datos.tipo === 'planta') {
        lineas.push(`Tamaño: ${datos.tamano} / ${config.tamanoMax}`, `Puede rebrotar: ${datos.rebrota === 'true' ? 'sí' : 'no'}`);
    } else {
        lineas.push(`Velocidad: ${datos.velocidad}`, `Dieta: ${config.dieta.join(', ')}`);
        if (estaHambriento(organismo)) {
            lineas.push('Estado: hambriento');
        }
    }
    tooltip.textContent = lineas.join('\n');

    const zona = ecosistema.getBoundingClientRect();
    const {x, y} = posicion(organismo);
    tooltip.style.left = zona.left + x + TAMANO + 6 + 'px';
    tooltip.style.top = zona.top + y + 'px';
    tooltip.hidden = false;
}

function ocultarTooltip() {
    tooltip.hidden = true;
}

function iniciarArrastre(event) {
    const organismo = event.currentTarget;
    arrastre = {organismo, dx: event.offsetX, dy: event.offsetY};
    event.dataTransfer.setData('text/plain', organismo.dataset.id);
    event.dataTransfer.effectAllowed = 'move';
    organismo.classList.add('arrastrando');
    ocultarTooltip();
}

function soltarOrganismo(event) {
    if (!arrastre) {
        return;
    }
    event.preventDefault();
    const {organismo, dx, dy} = arrastre;
    const zona = ecosistema.getBoundingClientRect();

    // Se desactiva la transición para que el organismo aparezca directamente donde se suelta
    organismo.style.transition = 'none';
    colocar(organismo, event.clientX - zona.left - dx, event.clientY - zona.top - dy);
    void organismo.offsetWidth;
    organismo.style.transition = '';
    registrarEvento(`${ESPECIES[organismo.dataset.tipo].nombre} #${organismo.dataset.id} reubicado manualmente`);
}

function finalizarArrastre(event) {
    event.currentTarget.classList.remove('arrastrando');
    arrastre = null;
}

// --- Utilidades ---

function organismosVivos(tipo) {
    const selector = '.organismo:not(.muriendo)' + (tipo ? '.' + tipo : '');
    return [...ecosistema.querySelectorAll(selector)];
}

function estaVivo(organismo) {
    return !organismo.classList.contains('muriendo');
}

function esAnimal(organismo) {
    return organismo.dataset.tipo !== 'planta';
}

function estaHambriento(organismo) {
    return valor(organismo, 'energia') < ESPECIES[organismo.dataset.tipo].energiaMax * UMBRAL_HAMBRE;
}

function puedeReproducirse(organismo) {
    return valor(organismo, 'energia') >= ESPECIES[organismo.dataset.tipo].energiaReproduccion;
}

function valor(organismo, propiedad) {
    return Number(organismo.dataset[propiedad]);
}

function fijarTamanoPlanta(planta, tamano) {
    planta.dataset.tamano = tamano;
    planta.dataset.energia = ESPECIES.planta.energia + 20 * (tamano - 1);
    planta.style.fontSize = tamanoFuente(tamano);
}

function tamanoFuente(tamano) {
    return 14 + 6 * tamano + 'px';
}

function posicion(organismo) {
    return {x: parseFloat(organismo.style.left), y: parseFloat(organismo.style.top)};
}

function colocar(organismo, x, y) {
    const limiteX = ecosistema.clientWidth - TAMANO;
    const limiteY = ecosistema.clientHeight - TAMANO;
    organismo.style.left = Math.min(Math.max(0, x), limiteX) + 'px';
    organismo.style.top = Math.min(Math.max(0, y), limiteY) + 'px';
}

function distancia(a, b) {
    const pa = posicion(a);
    const pb = posicion(b);
    return Math.hypot(pa.x - pb.x, pa.y - pb.y);
}

// Devuelve el organismo vivo más cercano de los tipos indicados dentro del radio, o null
function masCercano(origen, tipos, radio, filtro = () => true) {
    let mejor = null;
    let mejorDistancia = radio;
    for (const otro of organismosVivos()) {
        if (otro === origen || !tipos.includes(otro.dataset.tipo) || !filtro(otro)) {
            continue;
        }
        const d = distancia(origen, otro);
        if (d <= mejorDistancia) {
            mejor = otro;
            mejorDistancia = d;
        }
    }
    return mejor;
}

function posicionAleatoria() {
    return {
        x: Math.random() * (ecosistema.clientWidth - TAMANO),
        y: Math.random() * (ecosistema.clientHeight - TAMANO)
    };
}

// Busca una posición aleatoria sin ningún organismo cerca; null si no la encuentra
function posicionLibre(intentos = 20) {
    const vivos = organismosVivos();
    for (let i = 0; i < intentos; i++) {
        const p = posicionAleatoria();
        const ocupada = vivos.some((o) => {
            const q = posicion(o);
            return Math.hypot(p.x - q.x, p.y - q.y) < RADIO_INTERACCION;
        });
        if (!ocupada) {
            return p;
        }
    }
    return null;
}
