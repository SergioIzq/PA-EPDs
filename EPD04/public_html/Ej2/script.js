'use strict';

// Banco de incidencias: [categoría, descripción, gravedad, opciones[], indiceCorrecto, explicacion]
const incidencias = [
    [
        "Seguridad",
        "Se detectan numerosos intentos fallidos de acceso por fuerza bruta desde una dirección IP desconocida.",
        "Alta",
        [
            "Reiniciar el servidor web",
            "Bloquear temporalmente la dirección IP en el firewall",
            "Eliminar todas las cuentas de usuario afectadas",
            "Desactivar la infraestructura de red completa"
        ],
        1,
        "El bloqueo perimetral en el firewall frena el ataque de inmediato sin provocar denegación de servicio a los usuarios legítimos."
    ],
    [
        "Copias de seguridad",
        "El proceso programado de respaldo nocturno de las bases de datos académicas ha finalizado con estado erróneo.",
        "Media",
        [
            "Ignorar la alerta y esperar a la noche siguiente",
            "Formatear la cabina de almacenamiento de copias",
            "Examinar los logs de error y lanzar un respaldo manual inmediato",
            "Eliminar las copias históricas para liberar espacio"
        ],
        2,
        "Analizar el registro permite identificar el motivo del fallo y el respaldo manual garantiza contar con un punto de recuperación reciente."
    ],
    [
        "Redes",
        "Los puestos de trabajo de un departamento no tienen conexión a Internet, aunque sí se comunican con los servidores locales.",
        "Media",
        [
            "Verificar la puerta de enlace predeterminada y el router de salida",
            "Sustituir los cables de red de todos los ordenadores",
            "Reinstalar el sistema operativo de las máquinas cliente",
            "Apagar el conmutador (switch) de planta"
        ],
        0,
        "La comunicación local operativa confirma que el fallo se localiza en el enrutamiento o en el enlace de salida hacia el proveedor externo."
    ],
    [
        "Hardware",
        "El sensor térmico del servidor de correo alerta de una temperatura crítica sostenida en la CPU superior a 95°C.",
        "Alta",
        [
            "Aumentar la carga de trabajo para forzar la ventilación",
            "Apagar ordenadamente la máquina y verificar disipación y flujo de aire",
            "Desactivar las alertas de temperatura de la BIOS",
            "Desconectar el cable de alimentación de forma abrupta"
        ],
        1,
        "El apagado ordenado evita daños físicos en el silicio y permite inspeccionar los ventiladores y la pasta térmica sin corromper datos."
    ],
    [
        "Aplicaciones",
        "El portal de matriculación arroja un error '500 Internal Server Error' tras desplegar un parche de actualización.",
        "Alta",
        [
            "Solicitar a los alumnos que insistan recargando la página",
            "Revertir el despliegue a la versión estable previa (rollback)",
            "Borrar la base de datos de expedientes",
            "Cambiar el nombre del dominio institucional"
        ],
        1,
        "Efectuar un rollback inmediato restituye el servicio a la comunidad universitaria mientras se depura el parche en entorno de pruebas."
    ],
    [
        "Gestión de usuarios",
        "Un profesor comunica que ha recibido un correo solicitando sus claves universitarias y sospecha haber caído en una trampa de phishing.",
        "Alta",
        [
            "Restablecer su contraseña inmediatamente y revocar sesiones activas",
            "Publicar un aviso en redes sociales advirtiendo del hecho",
            "Ignorar el aviso si el profesor aún puede iniciar sesión",
            "Dar de baja la matrícula de todos sus alumnos"
        ],
        0,
        "Inhabilitar la contraseña vulnerada e invalidar los tokens de sesión impide el acceso del atacante a los sistemas de la universidad."
    ]
];

// Posiciones de cada campo dentro de una incidencia
const CATEGORIA = 0;
const DESCRIPCION = 1;
const GRAVEDAD = 2;
const OPCIONES = 3;
const CORRECTA = 4;
const EXPLICACION = 5;

const NUM_INCIDENCIAS = 5;
const TIEMPO_LIMITE = 25;
const TIEMPO_AVISO = 5;
const TIEMPO_BONIFICACION = 10;
const PAUSA_TRANSICION = 2000;
const PUNTOS = {correcta: 15, bonificacion: 5, incorrecta: -5, agotado: -3};
const TITULO_ORIGINAL = document.title;

const estado = {
    turno: [],
    actual: 0,
    puntuacion: 0,
    aciertos: 0,
    fallos: 0,
    omisiones: 0,
    tiempos: [],
    restante: TIEMPO_LIMITE,
    inicio: 0,
    bloqueado: true,
    intervalo: null,
    limite: null,
    transicion: null
};

const $ = (id) => document.getElementById(id);

document.addEventListener('DOMContentLoaded', () => {
    $('btn-iniciar').addEventListener('click', iniciarTurno);
    $('btn-nuevo').addEventListener('click', iniciarTurno);

    // Delegación de eventos: un único manejador en el contenedor para todos los botones de opción
    const opciones = $('opciones');
    opciones.addEventListener('click', (event) => {
        const boton = event.target.closest('button');
        if (boton) {
            seleccionarActuacion(Number(boton.dataset.indice), 'ratón');
        }
    });
    opciones.addEventListener('mouseover', (event) => alternarResaltado(event, true));
    opciones.addEventListener('mouseout', (event) => alternarResaltado(event, false));

    document.addEventListener('keydown', (event) => {
        if (!event.repeat && ['1', '2', '3', '4'].includes(event.key)) {
            seleccionarActuacion(Number(event.key) - 1, 'teclado');
        }
    });
});

function alternarResaltado(event, activo) {
    const boton = event.target.closest('button');
    if (boton && !estado.bloqueado) {
        boton.classList.toggle('resaltado', activo);
    }
}

function iniciarTurno() {
    reiniciarTurno();
    estado.turno = seleccionarIncidencias();
    $('btn-iniciar').hidden = true;
    mostrarIncidencia();
}

function seleccionarIncidencias() {
    // Barajado de Fisher-Yates sobre una copia para no alterar el banco original
    const copia = [...incidencias];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copia[i], copia[j]] = [copia[j], copia[i]];
    }
    return copia.slice(0, NUM_INCIDENCIAS);
}

function mostrarIncidencia() {
    const incidencia = estado.turno[estado.actual];

    $('titulo-incidencia').textContent = `Incidencia ${estado.actual + 1} de ${NUM_INCIDENCIAS}`;
    $('categoria').textContent = incidencia[CATEGORIA];
    $('gravedad').textContent = incidencia[GRAVEDAD];
    $('gravedad').className = 'gravedad-' + incidencia[GRAVEDAD].toLowerCase();
    $('descripcion').textContent = incidencia[DESCRIPCION];
    $('aviso').hidden = true;
    $('contador').classList.remove('critico');
    $('retroalimentacion').hidden = true;

    const botones = incidencia[OPCIONES].map((texto, i) => {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.dataset.indice = i;
        boton.textContent = `${i + 1}. ${texto}`;
        return boton;
    });
    $('opciones').replaceChildren(...botones);

    $('incidencia').hidden = false;
    estado.bloqueado = false;
    iniciarTemporizador();
}

function iniciarTemporizador() {
    estado.restante = TIEMPO_LIMITE;
    estado.inicio = Date.now();
    $('contador').textContent = estado.restante;

    estado.intervalo = setInterval(() => {
        estado.restante--;
        $('contador').textContent = estado.restante;
        if (estado.restante === TIEMPO_AVISO) {
            $('contador').classList.add('critico');
            $('aviso').hidden = false;
        }
    }, 1000);
    estado.limite = setTimeout(gestionarTiempoAgotado, TIEMPO_LIMITE * 1000);
}

function detenerTemporizadores() {
    clearInterval(estado.intervalo);
    clearTimeout(estado.limite);
    clearTimeout(estado.transicion);
}

function bloquearIncidencia() {
    detenerTemporizadores();
    estado.bloqueado = true;
    for (const boton of $('opciones').children) {
        boton.disabled = true;
        boton.classList.remove('resaltado');
    }
}

function seleccionarActuacion(indiceOpcion, origenEvento) {
    if (estado.bloqueado) {
        return;
    }
    bloquearIncidencia();

    const incidencia = estado.turno[estado.actual];
    const segundos = Math.max(1, Math.ceil((Date.now() - estado.inicio) / 1000));
    const esCorrecta = indiceOpcion === incidencia[CORRECTA];
    const bonificada = esCorrecta && segundos <= TIEMPO_BONIFICACION;
    let variacion;

    if (esCorrecta) {
        estado.aciertos++;
        variacion = PUNTOS.correcta + (bonificada ? PUNTOS.bonificacion : 0);
    } else {
        estado.fallos++;
        variacion = PUNTOS.incorrecta;
    }

    const botones = $('opciones').children;
    botones[indiceOpcion].classList.add(esCorrecta ? 'correcta' : 'incorrecta');
    botones[incidencia[CORRECTA]].classList.add('correcta');

    const lineas = [];
    if (!esCorrecta) {
        lineas.push('Actuación recomendada: ' + incidencia[OPCIONES][incidencia[CORRECTA]]);
    }
    lineas.push(incidencia[EXPLICACION]);
    lineas.push(`Tiempo de respuesta: ${segundos} segundos` + (bonificada ? ' (¡Bonificación aplicada!)' : ''));
    lineas.push(`Selección realizada mediante ${origenEvento}.`);

    const veredicto = esCorrecta ? 'DECISIÓN CORRECTA' : 'DECISIÓN INCORRECTA';
    mostrarRetroalimentacion(`${veredicto} (${formatearVariacion(variacion)} pts)`, lineas, esCorrecta);

    completarIncidencia(incidencia[OPCIONES][indiceOpcion], esCorrecta ? 'Correcta' : 'Incorrecta', segundos, variacion);
}

function gestionarTiempoAgotado() {
    bloquearIncidencia();
    estado.restante = 0;
    $('contador').textContent = 0;
    estado.omisiones++;

    const incidencia = estado.turno[estado.actual];
    $('opciones').children[incidencia[CORRECTA]].classList.add('correcta');

    mostrarRetroalimentacion(`TIEMPO DE RESPUESTA AGOTADO (${PUNTOS.agotado} pts)`, [
        'No se ha aplicado ninguna actuación a tiempo.',
        'Actuación recomendada: ' + incidencia[OPCIONES][incidencia[CORRECTA]],
        incidencia[EXPLICACION]
    ], false);

    completarIncidencia('Sin respuesta', 'Tiempo agotado', TIEMPO_LIMITE, PUNTOS.agotado);
}

function mostrarRetroalimentacion(titulo, lineas, acierto) {
    const panel = $('retroalimentacion');
    const cabecera = document.createElement('h3');
    cabecera.textContent = titulo;
    const parrafos = lineas.map((texto) => {
        const p = document.createElement('p');
        p.textContent = texto;
        return p;
    });
    panel.replaceChildren(cabecera, ...parrafos);
    panel.className = acierto ? 'acierto' : 'fallo';
    panel.hidden = false;
}

// Cierre común de una incidencia: puntuación, historial, progreso y paso a la siguiente
function completarIncidencia(decision, resultado, segundos, variacion) {
    estado.puntuacion = Math.max(0, estado.puntuacion + variacion);
    estado.tiempos.push(segundos);
    registrarResultado(estado.actual, decision, resultado, segundos, variacion);

    estado.actual++;
    actualizarMarcadores();

    const siguiente = estado.actual < NUM_INCIDENCIAS ? mostrarIncidencia : finalizarTurno;
    estado.transicion = setTimeout(siguiente, PAUSA_TRANSICION);
}

function registrarResultado(indiceIncidencia, decision, resultado, tiempo, variacion) {
    const incidencia = estado.turno[indiceIncidencia];
    const clases = {'Correcta': 'correcta', 'Incorrecta': 'incorrecta', 'Tiempo agotado': 'agotado'};

    const entrada = document.createElement('li');
    entrada.className = clases[resultado];
    [
        `Incidencia ${indiceIncidencia + 1} | Categoría: ${incidencia[CATEGORIA]} | Gravedad: ${incidencia[GRAVEDAD]}`,
        `Decisión adoptada: ${decision}`,
        `Resultado: ${resultado}`,
        `Tiempo empleado: ${tiempo} segundos`,
        `Variación de puntuación: ${formatearVariacion(variacion)}`
    ].forEach((texto) => {
        const p = document.createElement('p');
        p.textContent = texto;
        entrada.appendChild(p);
    });
    $('lista-historial').appendChild(entrada);
}

function formatearVariacion(variacion) {
    return variacion > 0 ? '+' + variacion : String(variacion);
}

function actualizarMarcadores() {
    const porcentaje = estado.actual * 100 / NUM_INCIDENCIAS;
    $('puntuacion').textContent = estado.puntuacion;
    $('resueltas').textContent = estado.actual;
    $('barra-relleno').style.width = porcentaje + '%';
    $('barra-relleno').textContent = porcentaje + '%';
    $('barra').setAttribute('aria-valuenow', porcentaje);
}

function clasificarDesempeno(puntos) {
    if (puntos >= 80) {
        return 'Especialista';
    }
    if (puntos >= 55) {
        return 'Técnico avanzado';
    }
    if (puntos >= 30) {
        return 'Técnico en formación';
    }
    return 'Debe revisar el protocolo de actuación';
}

function finalizarTurno() {
    detenerTemporizadores();
    $('incidencia').hidden = true;

    const media = estado.tiempos.reduce((suma, t) => suma + t, 0) / estado.tiempos.length;
    const separador = '='.repeat(55);
    $('texto-informe').textContent = [
        separador,
        'INFORME TÉCNICO DE FIN DE GUARDIA (SOC)',
        separador,
        `Incidencias analizadas: ${NUM_INCIDENCIAS}`,
        `Decisiones correctas: ${estado.aciertos}`,
        `Decisiones incorrectas: ${estado.fallos}`,
        `Incidencias sin respuesta: ${estado.omisiones}`,
        `Puntuación final obtenida: ${estado.puntuacion}`,
        `Tiempo medio de respuesta: ${media.toFixed(1)} segundos`,
        `Nivel de desempeño asignado: ${clasificarDesempeno(estado.puntuacion)}`,
        separador
    ].join('\n');

    $('informe').hidden = false;
    document.title = `Informe SOC - ${estado.puntuacion} pts`;
    location.href = '#informe';
}

function reiniciarTurno() {
    detenerTemporizadores();
    Object.assign(estado, {
        turno: [],
        actual: 0,
        puntuacion: 0,
        aciertos: 0,
        fallos: 0,
        omisiones: 0,
        tiempos: [],
        restante: TIEMPO_LIMITE,
        bloqueado: true
    });

    $('lista-historial').replaceChildren();
    $('opciones').replaceChildren();
    $('incidencia').hidden = true;
    $('informe').hidden = true;
    $('btn-iniciar').hidden = false;
    document.title = TITULO_ORIGINAL;
    actualizarMarcadores();
}
