"use strict";

/*
    EPD3 - Ej4 (página 3): temporizador de entrenamiento por intervalos.
    Cada función adapta la técnica de un snippet de https://css-tricks.com/snippets/javascript/
    (las URLs concretas están en el pie de intervalos.html).
*/

const COLORES = { trabajo: "#e63946", descanso: "#2a9d8f", listo: "#1d3557", fin: "#e9c46a" };
const ETIQUETAS = { trabajo: "TRABAJO", descanso: "DESCANSO", listo: "LISTO", fin: "¡TERMINADO!" };
const LIMITES = {                       // [mínimo, máximo]
    trabajo:  [5, 600],
    descanso: [1, 300],
    rondas:   [1, 50]
};
const NOMBRES_CAMPO = { trabajo: "El tiempo de trabajo", descanso: "El descanso", rondas: "El número de rondas" };
const COOKIE_CONFIG = "intervalos_config";
const COOKIE_SESIONES = "intervalos_sesiones";

// Elementos de la página (el script está al final del body, ya existen)
const campos = {
    trabajo: document.getElementById("trabajo"),
    descanso: document.getElementById("descanso"),
    rondas: document.getElementById("rondas")
};
const textoFase = document.getElementById("fase");
const textoTiempo = document.getElementById("tiempo");
const textoRonda = document.getElementById("ronda");
const barra = document.getElementById("barra");
const botonAlternar = document.getElementById("alternar");
const aviso = document.getElementById("aviso");
const textoDuracion = document.getElementById("duracion-total");

// Estado del cronómetro
const estado = {
    fase: "listo",
    ronda: 1,
    rondas: 0,
    duraciones: { trabajo: 0, descanso: 0 },   // en milisegundos
    duracionFase: 0,
    restante: 0,
    ultimoInstante: null,
    corriendo: false,
    idFrame: null
};


// ================= SNIPPETS ADAPTADOS =================

// Snippet "Cookie Getter/Setter"
function guardarCookie(nombre, valor, dias = 365) {
    const caduca = new Date(Date.now() + dias * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${nombre}=${encodeURIComponent(valor)}; expires=${caduca}; path=/; SameSite=Lax`;
}

function leerCookie(nombre) {
    const par = document.cookie.split("; ").find(cookie => cookie.startsWith(`${nombre}=`));
    return par === undefined ? null : decodeURIComponent(par.slice(nombre.length + 1));
}

// Snippet "Lighten / Darken Color": suma (o resta) una cantidad a cada canal RGB
function ajustarColor(hex, cantidad) {
    const limitar = valor => Math.max(0, Math.min(255, valor));
    const canales = [1, 3, 5].map(inicio => limitar(parseInt(hex.slice(inicio, inicio + 2), 16) + cantidad));
    return "#" + canales.map(canal => canal.toString(16).padStart(2, "0")).join("");
}

// Snippet "Different Stylesheet Pending the Time of Day": tema de noche de 20:00 a 07:00
function aplicarTemaPorHora() {
    const hora = new Date().getHours();
    const tema = hora >= 20 || hora < 7 ? "noche" : "dia";
    document.body.dataset.tema = tema;
    document.getElementById("tema-texto").textContent = tema === "noche" ? "noche" : "día";
}

// Snippet "Intervals": un reloj que se actualiza cada segundo con setInterval
function actualizarReloj() {
    document.getElementById("reloj").textContent = new Date().toLocaleTimeString("es-ES");
    aplicarTemaPorHora();
}


// ================= UTILIDADES =================

function formatearTiempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    return `${String(minutos).padStart(2, "0")}:${String(segundos % 60).padStart(2, "0")}`;
}

function mostrarAviso(texto, esError = false) {
    aviso.textContent = texto;
    aviso.classList.toggle("error", esError);
}

let contextoAudio = null;
function pitar(frecuencia) {
    const Contexto = window.AudioContext || window.webkitAudioContext;
    if (Contexto === undefined) {
        return;
    }
    try {
        contextoAudio = contextoAudio || new Contexto();
        const oscilador = contextoAudio.createOscillator();
        const volumen = contextoAudio.createGain();
        oscilador.frequency.value = frecuencia;
        volumen.gain.value = 0.15;
        oscilador.connect(volumen).connect(contextoAudio.destination);
        oscilador.start();
        oscilador.stop(contextoAudio.currentTime + 0.15);
    } catch (error) {
        // sin audio disponible: el cronómetro funciona igual
    }
}


// ================= CONFIGURACIÓN =================

// Devuelve { trabajo, descanso, rondas } o null (avisando) si algún valor no es válido
function leerConfiguracion() {
    const valores = {};
    for (const [clave, [minimo, maximo]] of Object.entries(LIMITES)) {
        const texto = campos[clave].value.trim();
        const numero = Number(texto);
        if (!/^\d+$/.test(texto) || numero < minimo || numero > maximo) {
            mostrarAviso(`ERROR: ${NOMBRES_CAMPO[clave].toLowerCase()} debe ser un entero entre ${minimo} y ${maximo}.`, true);
            return null;
        }
        valores[clave] = numero;
    }
    return valores;
}

function mostrarDuracionTotal() {
    const { trabajo, descanso, rondas } = Object.fromEntries(
        Object.entries(campos).map(([clave, campo]) => [clave, Number(campo.value)]));
    const total = rondas * trabajo + (rondas - 1) * descanso;
    textoDuracion.textContent = Number.isFinite(total) && total > 0
        ? `Duración total: ${formatearTiempo(total)}`
        : "";
}

function cargarConfiguracionGuardada() {
    const guardada = leerCookie(COOKIE_CONFIG);
    if (guardada === null) {
        return;
    }
    const [trabajo, descanso, rondas] = guardada.split("-");
    campos.trabajo.value = trabajo;
    campos.descanso.value = descanso;
    campos.rondas.value = rondas;
}

function bloquearCampos(bloqueado) {
    Object.values(campos).forEach(campo => { campo.disabled = bloqueado; });
}


// ================= CRONÓMETRO =================

function dibujar() {
    const segundos = Math.max(0, Math.ceil(estado.restante / 1000));
    const progreso = estado.duracionFase > 0 ? 1 - estado.restante / estado.duracionFase : 0;
    const enMarcha = estado.fase === "trabajo" || estado.fase === "descanso";

    textoFase.textContent = ETIQUETAS[estado.fase];
    textoTiempo.textContent = formatearTiempo(segundos);
    if (enMarcha) {
        textoRonda.textContent = `Ronda ${estado.ronda} de ${estado.rondas}`;
    }
    let ancho = 0;
    if (enMarcha) {
        ancho = Math.min(100, progreso * 100);
    } else if (estado.fase === "fin") {
        ancho = 100;
    }
    barra.style.width = `${ancho}%`;
    barra.style.background = ajustarColor(COLORES[estado.fase], enMarcha ? Math.round(-60 * progreso) : 0);
    document.title = enMarcha ? `${formatearTiempo(segundos)} · ${ETIQUETAS[estado.fase]}` : "Temporizador de intervalos";
}

function empezarFase(fase) {
    estado.fase = fase;
    estado.duracionFase = estado.duraciones[fase];
    estado.restante = estado.duracionFase;
    pitar(fase === "trabajo" ? 880 : 440);
}

function finalizar() {
    estado.fase = "fin";
    estado.restante = 0;
    estado.duracionFase = 0;
    detener();
    pitar(1320);

    const sesiones = Number(leerCookie(COOKIE_SESIONES) || 0) + 1;
    guardarCookie(COOKIE_SESIONES, sesiones);
    textoRonda.textContent = `${estado.rondas} rondas completadas`;
    mostrarAviso(`¡Entrenamiento completado! Sesiones terminadas en este navegador: ${sesiones}.`);
    botonAlternar.textContent = "Iniciar";
    bloquearCampos(false);
}

function avanzarFase() {
    if (estado.fase === "trabajo") {
        if (estado.ronda === estado.rondas) {
            finalizar();
        } else {
            empezarFase("descanso");
        }
    } else {
        estado.ronda++;
        empezarFase("trabajo");
    }
}

// Snippet "Replacements for setInterval Using requestAnimationFrame":
// el bucle mide el tiempo real transcurrido entre fotogramas en vez de fiarse de un intervalo fijo
function bucle(ahora) {
    if (!estado.corriendo) {
        return;
    }
    if (estado.ultimoInstante !== null) {
        estado.restante -= ahora - estado.ultimoInstante;
    }
    estado.ultimoInstante = ahora;

    if (estado.restante <= 0) {
        avanzarFase();
    }
    dibujar();
    if (estado.corriendo) {
        estado.idFrame = requestAnimationFrame(bucle);
    }
}

function arrancar() {
    estado.corriendo = true;
    estado.ultimoInstante = null;
    estado.idFrame = requestAnimationFrame(bucle);
    botonAlternar.textContent = "Pausar";
    bloquearCampos(true);
}

function detener() {
    estado.corriendo = false;
    cancelAnimationFrame(estado.idFrame);
}

function pausar(motivo = "En pausa.") {
    detener();
    botonAlternar.textContent = "Reanudar";
    mostrarAviso(motivo);
}

function alternar() {
    if (estado.corriendo) {
        pausar();
        return;
    }
    if (estado.fase === "trabajo" || estado.fase === "descanso") {   // estaba en pausa
        mostrarAviso("");
        arrancar();
        return;
    }

    const configuracion = leerConfiguracion();
    if (configuracion === null) {
        return;
    }
    guardarCookie(COOKIE_CONFIG, `${configuracion.trabajo}-${configuracion.descanso}-${configuracion.rondas}`);
    estado.duraciones = { trabajo: configuracion.trabajo * 1000, descanso: configuracion.descanso * 1000 };
    estado.rondas = configuracion.rondas;
    estado.ronda = 1;
    mostrarAviso("");
    empezarFase("trabajo");
    dibujar();
    arrancar();
}

function reiniciar() {
    detener();
    estado.fase = "listo";
    estado.ronda = 1;
    estado.restante = 0;
    estado.duracionFase = 0;
    botonAlternar.textContent = "Iniciar";
    textoRonda.textContent = "Pulse Iniciar para empezar";
    bloquearCampos(false);
    mostrarAviso("");
    dibujar();
}


// ================= EVENTOS =================

botonAlternar.addEventListener("click", alternar);
document.getElementById("reiniciar").addEventListener("click", reiniciar);
Object.values(campos).forEach(campo => campo.addEventListener("input", mostrarDuracionTotal));

// Snippet "PageVisibility API": si la pestaña pasa a segundo plano, se pausa
document.addEventListener("visibilitychange", () => {
    if (document.hidden && estado.corriendo) {
        pausar("En pausa: la pestaña pasó a segundo plano.");
    }
});

// Snippet "KeyboardEvent Value (keyCodes, metaKey, etc)": atajos de teclado
document.addEventListener("keydown", evento => {
    if (evento.ctrlKey || evento.metaKey || evento.altKey || evento.target.matches?.("input, button, select, textarea")) {
        return;   // no interferir con Ctrl+R, con la escritura ni con los botones
    }
    if (evento.code === "Space") {
        evento.preventDefault();
        alternar();
    } else if (evento.code === "KeyR") {
        reiniciar();
    }
});

cargarConfiguracionGuardada();
mostrarDuracionTotal();
actualizarReloj();
setInterval(actualizarReloj, 1000);
dibujar();
