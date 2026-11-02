
// 1. Estado inicial de la misión
let misionIniciada = false;
let misionFinalizada = false;
let sistemasOperativos = 0;

//variables temporizador
let tiempoRestante = 90;
let temporizadorMision = null;
let temporizadorAviso = null;
let temporizadorLanzamiento = null;

// 2. Seleccionar elementos del HTML
const nombreMision = document.getElementById("nombre-mision").innerText = "Mision wapisima" 

const estadoNave = document.getElementById("estado-nave");
const contadorSistemas = document.getElementById("sistemas-operativos");
const registroMensajes = document.getElementById("registro-mensajes");

const botonIniciar = document.getElementById("btn-iniciar");
const botonLanzar = document.getElementById("btn-lanzar");
const botonAbandonar = document.getElementById("btn-abandonar");
const botonReiniciar = document.getElementById("btn-reiniciar");

//lista de sistemas
const tarjetasSistemas = document.querySelectorAll(".tarjeta-sistema");

const sistemas = [
    {
        id: "energia",
        nombre: "Energía",
        descripcion: "Gestiona la generación y distribución de energía de la nave.",
        especificaciones: "Fuente: reactor principal | Potencia: 95 MW"
    },
    {
        id: "comunicaciones",
        nombre: "Comunicaciones",
        descripcion: "Permite la comunicación entre la nave y el centro de control.",
        especificaciones: "Frecuencia: banda X | Alcance: 400.000 km"
    },
    {
        id: "navegacion",
        nombre: "Navegación",
        descripcion: "Calcula la trayectoria y determina la posición de la nave.",
        especificaciones: "Sistema: navegación inercial | Precisión: 99,9 %"
    },
    {
        id: "soporte-vital",
        nombre: "Soporte vital",
        descripcion: "Mantiene las condiciones ambientales necesarias para la tripulación.",
        especificaciones: "Oxígeno: regulado | Temperatura: 22 °C"
    },
    {
        id: "propulsion",
        nombre: "Propulsión",
        descripcion: "Controla los motores que permiten maniobrar y desplazar la nave.",
        especificaciones: "Motor: propulsión principal | Estado: en espera"
    }
];

// 3. Función para registrar mensajes en la consola
function registrarMensaje(mensaje) {
    const nuevoMensaje = document.createElement("p");

    nuevoMensaje.textContent = mensaje;

    registroMensajes.appendChild(nuevoMensaje);
}
//funcion para realizar la cuenta atrás
function iniciarCuentaAtras() {
    // Evitar intervalos duplicados
    clearInterval(temporizadorMision);

    temporizadorMision = setInterval(function () {
        tiempoRestante--;

        document.getElementById("contador").textContent = tiempoRestante;

        // Aviso cuando quedan 15 segundos o menos
        if (tiempoRestante <= 15) {
            document.getElementById("contador").classList.add("alerta-tiempo");

            if (tiempoRestante === 15) {
                registrarMensaje("¡ADVERTENCIA! Quedan 15 segundos");
            }
        }

        // La cuenta atrás ha terminado
        if (tiempoRestante <= 0) {
            cancelarMisionPorTiempo();
        }
    }, 1000);
}

//funcion de misión cancelada por límite de tiempo
function cancelarMisionPorTiempo() {
    clearInterval(temporizadorMision);
    clearTimeout(temporizadorAviso);

    misionIniciada = false;
    misionFinalizada = true;

    estadoNave.textContent = "Misión cancelada: tiempo agotado";

    // Bloquear los botones de los sistemas
    tarjetasSistemas.forEach(function (tarjeta) {
        tarjeta.querySelector("button").disabled = true;
    });

    // Bloquear los controles de la misión
    botonIniciar.disabled = true;
    botonLanzar.disabled = true;
    botonAbandonar.disabled = true;
    botonReiniciar.disabled = false;

    // Generar el informe
    const activos = [];
    const pendientes = [];

    sistemas.forEach(function (sistema, indice) {
        if (indice < sistemasOperativos) {
            activos.push(sistema.nombre);
        } else {
            pendientes.push(sistema.nombre);
        }
    });

    registrarMensaje("Tiempo agotado. Misión cancelada.");
    registrarMensaje("Sistemas operativos: " + (activos.join(", ") || "Ninguno"));
    registrarMensaje("Sistemas pendientes: " + (pendientes.join(", ") || "Ninguno"));
}

function lanzarNave() {
    // Verificar que todos los sistemas estén operativos
    if (
        !misionIniciada ||
        misionFinalizada ||
        sistemasOperativos !== sistemas.length
    ) {
        return;
    }

    // Detener la cuenta atrás de preparación
    clearInterval(temporizadorMision);

    // Bloquear la misión para impedir nuevas activaciones
    misionFinalizada = true;

    // Bloquear todos los botones durante el lanzamiento
    document.querySelectorAll("button").forEach(function (boton) {
        boton.disabled = true;
    });

    let segundosLanzamiento = 5;

    estadoNave.textContent =
        "Lanzamiento en curso: " + segundosLanzamiento;

    registrarMensaje("Secuencia de lanzamiento iniciada");

    temporizadorLanzamiento = setInterval(function () {
        segundosLanzamiento--;

        if (segundosLanzamiento > 0) {
            estadoNave.textContent =
                "Lanzamiento en curso: " + segundosLanzamiento;
        } else {
            clearInterval(temporizadorLanzamiento);
            temporizadorLanzamiento = null;

            estadoNave.textContent = "¡Misión en vuelo!";

            registrarMensaje("¡Lanzamiento completado con éxito!");
            registrarMensaje(
                "Informe: los cinco sistemas estaban operativos."
            );
            registrarMensaje(
                "Tiempo restante al iniciar el lanzamiento: " +
                tiempoRestante + " segundos."
            );

            document.title =
                "¡Misión en Vuelo! - Lanzamiento Exitoso";

            // Permitir comenzar una nueva misión
            botonReiniciar.disabled = false;
        }
    }, 1000);
}

function abandonarMision() {
    // No permitir abortar si la misión ya terminó
    if (!misionIniciada || misionFinalizada) {
        return;
    }

    const confirmar = window.confirm(
        "¿Confirma que desea abortar la misión en curso?"
    );

    // Si el usuario cancela la confirmación, no hacemos nada
    if (!confirmar) {
        return;
    }

    // Detener todos los temporizadores
    clearInterval(temporizadorMision);
    clearInterval(temporizadorLanzamiento);
    clearTimeout(temporizadorAviso);

    temporizadorMision = null;
    temporizadorLanzamiento = null;
    temporizadorAviso = null;

    // Actualizar el estado de la misión
    misionIniciada = false;
    misionFinalizada = true;

    estadoNave.textContent = "Misión abortada por el usuario";

    // Ocultar cualquier aviso visible
    avisoError.hidden = true;

    // Bloquear todos los botones
    document.querySelectorAll("button").forEach(function (boton) {
        boton.disabled = true;
    });

    // Permitir reiniciar la simulación
    botonReiniciar.disabled = false;

    // Registrar el aborto
    registrarMensaje("Aborto de misión confirmado");

    // Actualizar el título de la pestaña
    document.title = "Misión abortada";
}

// 4. Función para iniciar la misión
function iniciarMision() {

    // Evitar que la misión se inicie más de una vez
    if (misionIniciada || misionFinalizada) {
        return;
    }

    misionIniciada = true;

    // Actualizar el estado de la nave
    estadoNave.textContent = "Preparación en curso";

    // Habilitar los botones de activación de los sistemas
    const botonesSistemas = document.querySelectorAll(".tarjeta-sistema button");

    botonesSistemas.forEach(function (boton) {
        boton.disabled = false;
    });

    // Habilitar el botón de abandono
    botonAbandonar.disabled = false;

    // Ocultar el botón de inicio
    botonIniciar.hidden = true;

    // Registrar el inicio en la consola
    registrarMensaje("Protocolo de preparación iniciado");

    iniciarCuentaAtras();
}

//funcion para activar el sistema
function activarSistema(indice, metodo) {
    // Comprobar que la misión está en marcha
    if (!misionIniciada || misionFinalizada) {
        return;
    }

    // Comprobar que se respeta el orden
    if (indice !== sistemasOperativos) {
        registrarMensaje(
            "Acción bloqueada: debe activar primero el sistema anterior"
        );
        return;
    }

    const sistema = sistemas[indice];
    const tarjeta = document.getElementById(sistema.id);
    const estado = tarjeta.querySelector("p span");
    const boton = tarjeta.querySelector("button");

    // Actualizar el sistema
    estado.textContent = "Operativo";
    tarjeta.classList.add("operativo");
    boton.disabled = true;

    // Actualizar el contador
    sistemasOperativos++;
    contadorSistemas.textContent = sistemasOperativos;

    // Registrar la activación
    registrarMensaje(
        `${sistema.nombre} activado correctamente mediante ${metodo}`
    );

    // Comprobar si todos los sistemas están activos
    if (sistemasOperativos === sistemas.length) {
        estadoNave.textContent = "Nave preparada para el lanzamiento";
        botonLanzar.disabled = false;

        registrarMensaje("Todos los sistemas están operativos");
    }
}


// 5. Asociar el evento al botón de inicio
botonIniciar.addEventListener("click", iniciarMision);

botonLanzar.addEventListener("click", lanzarNave);

botonAbandonar.addEventListener("click", abandonarMision);

tarjetasSistemas.forEach(function (tarjeta, indice) {
    const boton = tarjeta.querySelector("button");

    boton.addEventListener("click", function (evento) {
        evento.stopPropagation();
        activarSistema(indice, "ratón");
    });
});

// Activar sistemas mediante las teclas del 1 al 5
document.addEventListener("keydown", function (evento) {
    // Ignorar las teclas si la misión no está en marcha
    if (!misionIniciada || misionFinalizada) {
        return;
    }

    // Convertir la tecla pulsada en un índice del 0 al 4
    const indice = Number(evento.key) - 1;

    // Comprobar que se ha pulsado una tecla válida
    if (indice < 0 || indice >= sistemas.length || !Number.isInteger(indice)) {
        return;
    }

    // Activar el sistema correspondiente
    activarSistema(indice, "teclado");
});

const panelInformacion = document.getElementById("descripcion-sistema");

tarjetasSistemas.forEach(function (tarjeta, indice) {

    // Mostrar descripción al hacer clic
    tarjeta.addEventListener("click", function () {
        const sistema = sistemas[indice];

        panelInformacion.textContent = sistema.descripcion;
    });

    // Resaltar tarjeta al pasar el ratón
    tarjeta.addEventListener("mouseover", function () {
        tarjeta.classList.add("resaltado");
    });

    // Quitar el resaltado al retirar el ratón
    tarjeta.addEventListener("mouseout", function () {
        tarjeta.classList.remove("resaltado");
    });

    // Mostrar especificaciones con doble clic
    tarjeta.addEventListener("dblclick", function () {
        const sistema = sistemas[indice];

        window.alert(
            "Especificaciones técnicas de " +
            sistema.nombre +
            ":\n" +
            sistema.especificaciones
        );
    });
});