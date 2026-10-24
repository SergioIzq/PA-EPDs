/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */


"use strict";

const TIEMPO_INICIAL = 90;   // segundos de cuenta atrás
const UMBRAL_URGENTE = 15;   // a partir de aquí el contador parpadea
const TIEMPO_DESPEGUE = 5;

// El orden del array es la secuencia estricta de activación
// las descripciones me las ha hecho la IA la verdad
const SISTEMAS = [
    {
        id: "energia",
        nombre: "Energía",
        descripcion: "Alimenta el resto de la nave mediante paneles solares y baterías. Sin energía estable ningún otro sistema puede arrancar."
    },
    {
        id: "comunicaciones",
        nombre: "Comunicaciones",
        descripcion: "Mantiene el enlace con el centro de control en tierra: telemetría, voz y órdenes de vuelo."
    },
    {
        id: "navegacion",
        nombre: "Navegación",
        descripcion: "Calcula la trayectoria y la orientación de la nave mediante giroscopios, sensores estelares y el ordenador de vuelo."
    },
    {
        id: "soporte-vital",
        nombre: "Soporte vital",
        descripcion: "Controla oxígeno, presión, temperatura y reciclado de agua para mantener con vida a la tripulación."
    },
    {
        id: "propulsion",
        nombre: "Propulsión",
        descripcion: "Gestiona los motores y el combustible. Es el último sistema en activarse porque genera el empuje del despegue."
    }
];

/* referencias al DOM */
const elementos = {
    estadoNave: document.getElementById("estado-nave"),
    contador: document.getElementById("contador"),
    registro: document.getElementById("registro"),
    descripcion: document.getElementById("descripcion-sistema"),
    btnIniciar: document.getElementById("btn-iniciar"),
    btnLanzar: document.getElementById("btn-lanzar"),
    btnAbandonar: document.getElementById("btn-abandonar"),
    popUp: document.getElementById("popUp"),
    popUpTexto: document.getElementById("popUp-texto"),
    btnCerrarPopUp: document.getElementById("btn-cerrar-popup"),
    btnAceptarPopUp: document.getElementById("btn-aceptar-popup")
};
const tarjetas = document.querySelectorAll(".sistema");

/* estados de la misión */
let estado = "espera";
let tiempo = TIEMPO_INICIAL;
let temporizador = null;
let activados = 0;            // sistemas operativos hasta ahora
let seleccionado = null;      // id del sistema seleccionado
let temporizadorPopUp = null;
let segundosDespegue = null;

const TEXTO_DESCRIPCION_INICIAL = "Selecciona un sistema para ver su descripción operativa.";

/* funciones */
/* creamos una etiqueta de texto para mostrar en el panel de mensajes */
function crear(etiqueta, texto, clase) {
    const nodo = document.createElement(etiqueta);
    if (texto !== undefined) {
        nodo.textContent = texto;
    }
    //si hay clase definida
    if (clase) {
        nodo.className = clase;
    }
    return nodo;
}

//para poner el tiempo legible
function formatearTiempo(segundos) {
    //redondeamos hacia abajo los minutos para no tener decimales.
    // Con padstart añadimos un 0 al ppio si la longitud del texto es menor que 2
    const min = String(Math.floor(segundos / 60)).padStart(2, "0");
    const sec = String(segundos % 60).padStart(2, "0");
    return `${min}:${sec}`;
}

//devuelve true si encuentra el sistema introducido
function buscarSistema(id) {
    return SISTEMAS.find(function (sistema) {
        return sistema.id === id;
    });
}

//devuelve la tarjeta seleccionada
function buscarTarjeta(id) {
    return document.getElementById(id);
}

/* funciones de la consola de mensajes */
/* usamos el tiempo del ordenador usuario */
function registrar(texto, tipo) {
    const hora = new Date().toLocaleTimeString();
    //usamos la funcion para crear parrafos que hemos declarado antes
    //en caso de que no se especifique un tipo, usamos 'info'
    const linea = crear("p", `[${hora}] ${texto}`, tipo || "info");
    //añadimos el elemento creado al registro
    elementos.registro.appendChild(linea);
    //baja al último mensaje recibido
    elementos.registro.scrollTop = elementos.registro.scrollHeight;
}

/* funciones sobre el estado general de la nave*/
const CLASES_ESTADO = ["preparando", "lista", "lanzada", "fallo", "abortada"];


function cambiarEstadoNave(clase, texto) {
    //limpiamos el elemento
    //el operador ... es de 'propagacion', y toma el array para quitar todos los estilos de golpe
    elementos.estadoNave.classList.remove(...CLASES_ESTADO);
    if (clase) {
        elementos.estadoNave.classList.add(clase);
    }
    elementos.estadoNave.textContent = texto;
}

/* funciones del panel de informacion */
//para mostrar la información de las tarjetas
function mostrarDescripcion(id) {
    //buscamos el sistema del que se trata
    const sistema = buscarSistema(id);
    //si no se detecta ninguno, se muestra la descripcion por defecto
    if (!sistema) {
        elementos.descripcion.textContent = TEXTO_DESCRIPCION_INICIAL;
        return;
    }
    //reemplazamos el texto por defecto por uno referente al sistema escogido
    elementos.descripcion.replaceChildren(
            crear("strong", sistema.nombre),
            crear("br"),
            document.createTextNode(sistema.descripcion)
            );
}

//quitamos el 'seleccionado' de todas las tarjetas previas y guardamos en la variable
//'seleccionado' el id del sistema correspondiente
function seleccionarSistema(id) {
    tarjetas.forEach(function (tarjeta) {
        tarjeta.classList.remove("seleccionado");
    });
    buscarTarjeta(id).classList.add("seleccionado");
    seleccionado = id;
    mostrarDescripcion(id);
}

/* funciones de los botones según estado */

function actualizarBotones() {
    //enCurso es true cuando se ha iniciado la misión
    const enCurso = estado === "preparando";
    const terminada = estado === "abortada" || estado === "fallo" || estado === "lanzada";

    elementos.btnIniciar.textContent = terminada ? "Reiniciar misión" : "Iniciar misión";
    elementos.btnIniciar.disabled = !(estado === "espera" || terminada);

    //una vez que iniciamos, desactivamos iniciar misión y activamos el de abandonar
    elementos.btnAbandonar.disabled = !enCurso;
    //si la misión está en curso y todos los sistemas están activados, se puede despegar
    elementos.btnLanzar.disabled = !(enCurso && activados === SISTEMAS.length);

    tarjetas.forEach(function (tarjeta) {
        const boton = tarjeta.querySelector(".btn-activar");
        const operativo = tarjeta.classList.contains("operativo");
        //el botón de cada tarjeta se mostrará desactivado cuando la misión no esté en curso o cuando ya esté operativo el sistema que activa
        boton.disabled = !enCurso || operativo;
    });
}

/* funciones de tarjetas */
function reiniciarTarjetas() {
    tarjetas.forEach(function (tarjeta) {
        tarjeta.classList.remove("operativo", "error");
        tarjeta.querySelector(".estado").textContent = "Desactivado";
        tarjeta.querySelector(".btn-activar").textContent = "Activar";
    });
    activados = 0;
}

function errorSecuencia(tarjeta) {
    tarjeta.classList.remove("error");
    void tarjeta.offsetWidth; // fuerza reflow para poder repetir la animación
    tarjeta.classList.add("error");
    tarjeta.addEventListener("animationend", function () {
        tarjeta.classList.remove("error");
    }, {once: true});
}

function activarSistema(id) {
    const sistema = buscarSistema(id);
    const tarjeta = buscarTarjeta(id);
    const parrafo = elementos.popUp.querySelector("p");

    if (estado !== "preparando") {
        registrar("Inicia la misión antes de activar sistemas.", "error");
        return;
    }
    if (tarjeta.classList.contains("operativo")) {
        registrar(`${sistema.nombre} ya está operativo.`, "aviso");
        return;
    }

    // Secuencia estricta: solo puede activarse el que ocupa la posición "activados"
    if (SISTEMAS[activados].id !== id) {
        mostrarPopUp(`Acción bloqueada: debe activar primero ${SISTEMAS[activados].nombre}.`);
        registrar("Secuencia incorrecta", "error");
        errorSecuencia(tarjeta);
        return;
    }

    tarjeta.classList.add("operativo");
    tarjeta.querySelector(".estado").textContent = "Operativo";
    tarjeta.querySelector(".btn-activar").textContent = "Activado";
    activados++;
    registrar(`${sistema.nombre} operativo (${activados}/${SISTEMAS.length}).`, "info");

    if (activados === SISTEMAS.length) {
        cambiarEstadoNave("lista", "Nave preparada para el lanzamiento");
        registrar("Todos los sistemas están operativos. Autoriza el despegue con «Lanzar nave».", "aviso");
    } else {
        cambiarEstadoNave("preparando", `Preparando (${activados}/${SISTEMAS.length} sistemas)`);
    }
    actualizarBotones();
}

/* cuenta atrás*/
function mostrarContador() {
    elementos.contador.textContent = formatearTiempo(tiempo);
    elementos.contador.classList.toggle("urgente", tiempo <= UMBRAL_URGENTE);
}

function tick() {
    tiempo--;
    mostrarContador();

    if (tiempo === 30) {
        registrar("Quedan 30 segundos para cerrar la ventana de lanzamiento.", "aviso");
    } else if (tiempo === UMBRAL_URGENTE) {
        registrar("ADVERTENCIA: Tiempo de preparación próximo a finalizar.", "aviso");
    }
    if (tiempo <= 0) {
        finalizar("fallo", "MISIÓN CANCELADA: Protocolo incompleto", "error");
        registrar(`MISIÓN CANCELADA\n\ 
                  Sistemas operativos: [${activados}] de ${SISTEMAS.length}\n\ 
                  Sistemas pendientes: ${programasQueFaltan()}\n\ 
                  Estado: Protocolo incompleto\n\ 
                  Resumen: Lanzamiento no completo\n\ `);
    }
}

function programasQueFaltan() {
    let stringProgramas = "";
    for (var i = (activados - 1), max = (SISTEMAS.length - 1); i < max; i++) {
        stringProgramas += `${SISTEMAS[i + 1].nombre} \n\ `;
    }
    return stringProgramas;
}

function cuentaAtras() {
    segundosDespegue = TIEMPO_DESPEGUE;
    elementos.contador.textContent = `T-${segundosDespegue}`;
    registrar(`T-${segundosDespegue}`, "aviso");               // muestra el primer número al instante

    clearInterval(temporizador);
    temporizador = setInterval(printSeg, 1000);
}

function printSeg() {
    segundosDespegue--;

    if (segundosDespegue > 0) {
        elementos.contador.textContent = `T-${segundosDespegue}`;
        registrar(`T-${segundosDespegue}`, "aviso");
    } else {
        clearInterval(temporizador);                   // ahora sí, con el id correcto
        finalizar("lanzada", "¡Despegue! Misión Praena II en órbita.", "info");
    }
}

/* fin de misión */
function finalizar(nuevoEstado, mensaje, tipo) {
    clearInterval(temporizador);
    temporizador = null;
    estado = nuevoEstado;

    if (nuevoEstado === "lanzada") {
        cambiarEstadoNave("lanzada", "Nave lanzada");
        elementos.contador.textContent = "¡Despegue!";
        elementos.contador.classList.remove("urgente");
    } else if (nuevoEstado === "fallo") {
        cambiarEstadoNave("fallo", "MISIÓN CANCELADA: Protocolo incompleto");
        elementos.contador.textContent = "00:00";
    } else {
        cambiarEstadoNave("abortada", "Misión abortada por el usuario");
        elementos.contador.textContent = "--";
        elementos.contador.classList.remove("urgente");
    }

    registrar(mensaje, tipo);
    cerrarPopUp();
    actualizarBotones();
}

/* botones serios */
function iniciarMision() {
    reiniciarTarjetas();
    tiempo = TIEMPO_INICIAL;
    estado = "preparando";
    segundosDespegue = TIEMPO_DESPEGUE;

    cambiarEstadoNave("preparando", "Preparación en curso");
    mostrarContador();
    registrar(`Protocolo de preparación iniciado`, "info");

    clearInterval(temporizador);
    temporizador = setInterval(tick, 1000);
    actualizarBotones();
}

function reiniciarMision() {
    clearInterval(temporizador);
    temporizador = null;
    cerrarPopUp();
    
    estado = "espera";
    tiempo = TIEMPO_INICIAL;
    segundosDespegue = null;
    seleccionado = null;
    
    reiniciarTarjetas();
    tarjetas.forEach(tarjeta => {
       tarjeta.classList.remove("seleccionado", "resaltada") 
    });
    mostrarDescripcion(null);
    elementos.registro.replaceChildren();
    elementos.resumen.replaceChildren();
    elementos.contador.classList.remove("urgente");
    document.title = TITULO_INICIAL;
    
    cambiarEstadoNave("", "En espera");
    elementos.contador.textContent = formatearTiempo(TIEMPO_INICIAL);
    actualizarBotones();
    registrar("Panel de control listo. Pulsa «Iniciar misión» para comenzar.", "info");
    
}


function lanzarNave() {
    if (estado !== "preparando") {
        registrar("No hay ninguna misión en curso.", "error");
        return;
    }
    if (activados < SISTEMAS.length) {
        registrar("No se puede lanzar: faltan sistemas por activar.", "error");
        return;
    }
    clearInterval(temporizador);          // detiene la cuenta atrás de preparación
    temporizador = null;
    estado = "lanzando";                  // deshabilita botones y atajos durante la secuencia
    elementos.contador.classList.remove("urgente");
    cambiarEstadoNave("lanzada", "Lanzamiento en curso");
    registrar(`Despegue autorizado a T-${tiempo}s. Iniciando secuencia de ignición.`, "aviso");
    actualizarBotones();

    cuentaAtras();
}

function abandonarMision() {
    if (estado !== "preparando") {
        return;
    } else if (window.confirm("¿Confirma que desea abortar la misión en curso?")) {
        finalizar("abortada", "Aborto de misión confirmado", "aviso");
        document.title = "Misión abortada";
    }
}

function mostrarPopUp(texto) {
    clearInterval(temporizadorPopUp);
    elementos.popUpTexto.textContent = texto;
    elementos.popUp.style.display = "flex";   //flex para que se centre
    elementos.btnAceptarPopUp.focus();        //Enter lo cierra
    temporizadorPopUp = setTimeout(cerrarPopUp, 3000);
}

function cerrarPopUp() {
    clearTimeout(temporizadorPopUp);
    elementos.popUp.style.display = "none";
}

function popUpAbierto() {
    return elementos.popUp.style.display === "flex";
}

/*eventos de ratón*/
elementos.btnIniciar.addEventListener("click", () => {
    if (estado === "espera")
        iniciarMision();
    else if (estado === "abortada" || estado === "fallo" || estado === "lanzada")
        reiniciarMision();
});
elementos.btnLanzar.addEventListener("click", lanzarNave);
elementos.btnAbandonar.addEventListener("click", abandonarMision);
elementos.btnCerrarPopUp.addEventListener("click", cerrarPopUp);
elementos.btnAceptarPopUp.addEventListener("click", cerrarPopUp);
elementos.popUp.addEventListener("click", function (e) {
    if (e.target === elementos.popUp)
        cerrarPopUp();   //clic en el fondo oscuro
});
tarjetas.forEach(function (tarjeta) {
    const btn = tarjeta.querySelector(".btn-activar");
    
    btn.addEventListener("click", function(evento){
        evento.stopPropagation();
        activarSistema(tarjeta.id);
    });
    btn.addEventListener("dblclick", evento => evento.stopPropagation());
    
    tarjeta.addEventListener("click", () => seleccionarSistema(tarjeta.id));
    tarjeta.addEventListener("dblclick", function(){
        const sist = buscarSistema(tarjeta.id);
        window.alert(`Especificaciones de ${sist.nombre.toUpperCase()} : ${sist.descripcion}` );
    });
    tarjeta.addEventListener("mouseover", () => tarjeta.classList.add("resaltada"));
    tarjeta.addEventListener("mouseout", () => tarjeta.classList.remove("resaltada"));
});




document.addEventListener("keydown", function (k) {
    if (k.ctrlKey || k.altKey || k.metaKey)
        return;
    if(k.repeat) return;

    const tecla = k.key.toLowerCase();

    if (tecla >= "1" && tecla <= String(SISTEMAS.length)) {
        activarSistema(SISTEMAS[Number(tecla) - 1].id);
    } else if (tecla === "i") {
        if (!elementos.btnIniciar.disabled)
            elementos.btnIniciar.click();
    } else if (tecla === "l") {
        lanzarNave();
    } else if (tecla === "escape") {
        abandonarMision();
    }
});

cambiarEstadoNave("", "En espera");
elementos.contador.textContent = formatearTiempo(TIEMPO_INICIAL);
actualizarBotones();
registrar("Panel de control listo. Pulsa «Iniciar misión» para comenzar.", "info");
registrar("Atajos: 1-5 -> activar sistema (respectivamente), I -> Iniciar misión, L -> Lanzar nave, Esc -> Abandonar misión.", "aviso");