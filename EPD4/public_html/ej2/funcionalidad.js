/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

const incidencias = [
    ["Seguridad", "Se detectan numerosos intentos fallidos de acceso por fuerza bruta desde una dirección IP desconocida.", "Alta",
        ["Reiniciar el servidor web", "Bloquear temporalmente la dirección IP en el firewall", "Eliminar todas las cuentas de usuario afectadas", "Desactivar la infraestructura de red completa"], 1,
        "El bloqueo perimetral en el firewall frena el ataque de inmediato sin provocar denegación de servicio a los usuarios legítimos."],
    ["Copias de seguridad", "El proceso programado de respaldo nocturno de las bases de datos académicas ha finalizado con estado erróneo.", "Media",
        ["Ignorar la alerta y esperar a la noche siguiente", "Formatear la cabina de almacenamiento de copias", "Examinar los logs de error y lanzar un respaldo manual inmediato", "Eliminar las copias históricas para liberar espacio"], 2,
        "Analizar el registro permite identificar el motivo del fallo y el respaldo manual garantiza contar con un punto de recuperación reciente."],
    ["Redes", "Los puestos de trabajo de un departamento no tienen conexión a Internet, aunque sí se comunican con los servidores locales.", "Media",
        ["Verificar la puerta de enlace predeterminada y el router de salida", "Sustituir los cables de red de todos los ordenadores", "Reinstalar el sistema operativo de las máquinas cliente", "Apagar el conmutador (switch) de planta"], 0,
        "La comunicación local operativa confirma que el fallo se localiza en el enrutamiento o en el enlace de salida hacia el proveedor externo."],
    ["Hardware", "El sensor térmico del servidor de correo alerta de una temperatura crítica sostenida en la CPU superior a 95°C.", "Alta",
        ["Aumentar la carga de trabajo para forzar la ventilación", "Apagar ordenadamente la máquina y verificar disipación y flujo de aire", "Desactivar las alertas de temperatura de la BIOS", "Desconectar el cable de alimentación de forma abrupta"], 1,
        "El apagado ordenado evita daños físicos en el silicio y permite inspeccionar los ventiladores y la pasta térmica sin corromper datos."],
    ["Aplicaciones", "El portal de matriculación arroja un error '500 Internal Server Error' tras desplegar un parche de actualización.", "Alta",
        ["Solicitar a los alumnos que insistan recargando la página", "Revertir el despliegue a la versión estable previa (rollback)", "Borrar la base de datos de expedientes", "Cambiar el nombre del dominio institucional"], 1,
        "Efectuar un rollback inmediato restituye el servicio a la comunidad universitaria mientras se depura el parche en entorno de pruebas."],
    ["Gestión de usuarios", "Un profesor comunica que ha recibido un correo solicitando sus claves universitarias y sospecha haber caído en una trampa de phishing.", "Alta",
        ["Restablecer su contraseña inmediatamente y revocar sesiones activas", "Publicar un aviso en redes sociales advirtiendo del hecho", "Ignorar el aviso si el profesor aún puede iniciar sesión", "Dar de baja la matrícula de todos sus alumnos"], 0,
        "Inhabilitar la contraseña vulnerada e invalidar los tokens de sesión impide el acceso del atacante a los sistemas de la universidad."]
];

const total = 5;
const limite = 25;
const bonus = 10;     
const tiempoAviso = 5;      
const pausa = 2000;  

const $ = id => document.getElementById(id);

let estado = nuevoEstado();
let intervaloReloj = null;
let cierreAutomatico = null;
let esperaSiguiente = null;

function nuevoEstado() {
    return {
        seleccion: [],
        indice: 0,
        puntos: 0,
        aciertos: 0,
        fallos: 0,
        omisiones: 0,
        tiempos: [],
        restante: limite,
        bloqueado: true
    };
}

function limpiarTemporizadores() {
    clearInterval(intervaloReloj);
    clearTimeout(cierreAutomatico);
    clearTimeout(esperaSiguiente);
    intervaloReloj = cierreAutomatico = esperaSiguiente = null;
}

function seleccionarIncidencias() {
    const copia = [...incidencias];
    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const auxiliar = copia[i];
        copia[i] = copia[j];
        copia[j] = auxiliar;
    }
    return copia.slice(0, total);
}

function iniciarTurno() {
    limpiarTemporizadores();
    estado = nuevoEstado();
    estado.seleccion = seleccionarIncidencias();
    $("historial").innerHTML = "";
    actualizarMarcadores();
    location.hash = "";
    document.title = "SOC - Turno en curso";
    mostrarIncidencia();
}

function actualizarMarcadores() {
    const completadas = estado.aciertos + estado.fallos + estado.omisiones;
    const porcentaje = completadas * (100 / total);
    $("puntos").textContent = estado.puntos;
    $("resueltas").textContent = `${completadas}/${total}`;
    $("avance").style.width = `${porcentaje}%`;
    $("porcentaje").textContent = `${porcentaje}%`;
}

function mostrarIncidencia() {
    const [categoria, descripcion, gravedad, opciones] = estado.seleccion[estado.indice];
    const zona = $("principal");
    zona.innerHTML = "";

    const cabecera = document.createElement("div");
    cabecera.className = "cabecera";
    cabecera.innerHTML = `<h2>Incidencia ${estado.indice + 1} de ${total}</h2><span id="reloj"></span>`;

    const datos = document.createElement("p");
    datos.innerHTML = `<strong>${categoria}</strong> · Gravedad: <span class="gravedad-${gravedad}">${gravedad}</span>`;

    const texto = document.createElement("p");
    texto.textContent = descripcion;

    const aviso = document.createElement("div");
    aviso.id = "aviso";

    zona.append(cabecera, datos, texto, aviso);

    opciones.forEach((opcion, i) => {
        const boton = document.createElement("button");
        boton.className = "opcion";
        boton.textContent = `${i + 1}. ${opcion}`;
        boton.addEventListener("click", () => seleccionarActuacion(i, "ratón"));
        boton.addEventListener("mouseover", () => {
            if (!estado.bloqueado) boton.classList.add("resaltada");
        });
        boton.addEventListener("mouseout", () => boton.classList.remove("resaltada"));
        zona.appendChild(boton);
    });

    const explicacion = document.createElement("div");
    explicacion.id = "explicacion";
    explicacion.hidden = true;
    zona.appendChild(explicacion);

    estado.bloqueado = false;
    iniciarTemporizador();
}

function iniciarTemporizador() {
    estado.restante = limite;
    const reloj = $("reloj");
    reloj.textContent = `${estado.restante} s`;

    intervaloReloj = setInterval(() => {
        estado.restante--;
        reloj.textContent = `${estado.restante} s`;
        if (estado.restante <= tiempoAviso) {
            reloj.classList.add("urgente");
            $("aviso").textContent = "Atención: poco tiempo de respuesta.";
        }
        if (estado.restante <= 0) clearInterval(intervaloReloj);
    }, 1000);

    cierreAutomatico = setTimeout(gestionarTiempoAgotado, limite * 1000);
}

function bloquearOpciones(indiceCorrecto, indiceElegido) {
    estado.bloqueado = true;
    document.querySelectorAll(".opcion").forEach((boton, i) => {
        boton.disabled = true;
        boton.classList.remove("resaltada");
        if (i === indiceCorrecto) boton.classList.add("correcta");
        else if (i === indiceElegido) boton.classList.add("incorrecta");
    });
}

function aplicarPuntos(variacion) {
    estado.puntos = Math.max(0, estado.puntos + variacion);
}

// La primera línea es el veredicto (título); el resto, párrafos
function mostrarExplicacion(lineas, esCorrecta) {
    const panel = $("explicacion");
    panel.className = esCorrecta ? "" : "fallo";
    panel.innerHTML = "";
    lineas.forEach((linea, i) => {
        const elemento = document.createElement(i === 0 ? "h3" : "p");
        elemento.textContent = linea;
        panel.appendChild(elemento);
    });
    panel.hidden = false;
}

function seleccionarActuacion(indiceOpcion, origenEvento) {
    if (estado.bloqueado) return;
    limpiarTemporizadores();

    const [, , , opciones, correcta, explicacion] = estado.seleccion[estado.indice];
    const tiempo = limite - estado.restante;
    const acierto = indiceOpcion === correcta;
    let variacion;

    bloquearOpciones(correcta, indiceOpcion);

    if (acierto) {
        const hayBonus = tiempo <= bonus;
        variacion = hayBonus ? 20 : 15;
        estado.aciertos++;
        mostrarExplicacion([
            `DECISIÓN CORRECTA (+${variacion} pts)`,
            explicacion,
            `Tiempo de respuesta: ${tiempo} segundos${hayBonus ? " (¡Bonificación aplicada!)" : ""}`
        ], true);
    } else {
        variacion = -5;
        estado.fallos++;
        mostrarExplicacion([
            "DECISIÓN INCORRECTA (-5 pts)",
            `Actuación recomendada: ${opciones[correcta]}`,
            explicacion,
            `Tiempo de respuesta: ${tiempo} segundos`
        ], false);
    }

    aplicarPuntos(variacion);
    estado.tiempos.push(tiempo);
    registrarResultado(estado.indice, opciones[indiceOpcion], acierto ? "Correcta" : "Incorrecta", tiempo, variacion);
    avanzar();
}

function gestionarTiempoAgotado() {
    if (estado.bloqueado) return;
    limpiarTemporizadores();

    const [, , , opciones, correcta, explicacion] = estado.seleccion[estado.indice];

    bloquearOpciones(correcta, -1);
    estado.omisiones++;
    aplicarPuntos(-3);
    estado.tiempos.push(limite);

    mostrarExplicacion([
        "TIEMPO DE RESPUESTA AGOTADO (-3 pts)",
        "No se ha aplicado ninguna actuación a tiempo.",
        `Actuación recomendada: ${opciones[correcta]}`,
        explicacion
    ], false);

    registrarResultado(estado.indice, "Sin respuesta", "Tiempo agotado", limite, -3);
    avanzar();
}

function avanzar() {
    actualizarMarcadores();
    esperaSiguiente = setTimeout(() => {
        estado.indice++;
        if (estado.indice < total) mostrarIncidencia();
        else finalizarTurno();
    }, pausa);
}

function registrarResultado(indiceIncidencia, decision, resultado, tiempo, variacion) {
    const [categoria, , gravedad] = estado.seleccion[indiceIncidencia];
    const signo = variacion > 0 ? "+" : "";

    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta";

    // La clase colorea la tarjeta: verde, rojo o ámbar
    if (resultado === "Correcta") tarjeta.classList.add("correcta");
    else if (resultado === "Incorrecta") tarjeta.classList.add("incorrecta");
    else tarjeta.classList.add("agotada");

    [
        `Incidencia ${indiceIncidencia + 1} | Categoría: ${categoria} | Gravedad: ${gravedad}`,
        `Decisión adoptada: ${decision}`,
        `Resultado: ${resultado}`,
        `Tiempo empleado: ${tiempo} segundos`,
        `Variación de puntuación: ${signo}${variacion}`
    ].forEach(texto => {
        const linea = document.createElement("div");
        linea.textContent = texto;
        tarjeta.appendChild(linea);
    });

    $("historial").appendChild(tarjeta);
}

function clasificar(puntos) {
    if (puntos >= 80) return "Especialista";
    if (puntos >= 55) return "Técnico avanzado";
    if (puntos >= 30) return "Técnico en formación";
    return "Debe revisar el protocolo de actuación";
}

function finalizarTurno() {
    limpiarTemporizadores();
    estado.bloqueado = true;

    const suma = estado.tiempos.reduce((acumulado, t) => acumulado + t, 0);
    const media = (suma / total).toFixed(1);

    const datosInforme = [
        ["Incidencias analizadas", total],
        ["Decisiones correctas", estado.aciertos],
        ["Decisiones incorrectas", estado.fallos],
        ["Incidencias sin respuesta", estado.omisiones],
        ["Puntuación final obtenida", estado.puntos],
        ["Tiempo medio de respuesta", `${media} segundos`],
        ["Nivel de desempeño asignado", clasificar(estado.puntos)]
    ];

    const zona = $("principal");
    zona.innerHTML = "";

    const informe = document.createElement("div");
    informe.id = "informe";

    const titulo = document.createElement("h2");
    titulo.textContent = "INFORME TÉCNICO DE FIN DE GUARDIA (SOC)";
    informe.appendChild(titulo);

    datosInforme.forEach(([etiqueta, valor]) => {
        const fila = document.createElement("div");
        fila.className = "fila";
        const nombre = document.createElement("span");
        nombre.textContent = `${etiqueta}:`;
        const dato = document.createElement("strong");
        dato.textContent = valor;
        fila.append(nombre, dato);
        informe.appendChild(fila);
    });

    const botonNuevo = document.createElement("button");
    botonNuevo.id = "btn-nuevo";
    botonNuevo.textContent = "Iniciar nuevo turno";
    botonNuevo.addEventListener("click", () => {
        reiniciarTurno();
        iniciarTurno();
    });

    zona.append(informe, botonNuevo);

    location.hash = "informe-final";
    document.title = `SOC - Turno finalizado (${estado.puntos} pts)`;
}

function reiniciarTurno() {
    limpiarTemporizadores();
    estado = nuevoEstado();
    actualizarMarcadores();
    $("historial").innerHTML = "";
    document.title = "Centro de Operaciones de Ciberseguridad";

    const zona = $("principal");
    zona.innerHTML = "";
    const botonIniciar = document.createElement("button");
    botonIniciar.id = "iniciar";
    botonIniciar.textContent = "Iniciar turno";
    botonIniciar.addEventListener("click", iniciarTurno);
    zona.appendChild(botonIniciar);
}

document.addEventListener("keydown", event => {
    if (estado.bloqueado) return;
    if (["1", "2", "3", "4"].includes(event.key)) {
        seleccionarActuacion(Number(event.key) - 1, "teclado");
    }
});

$("iniciar").addEventListener("click", iniciarTurno);







