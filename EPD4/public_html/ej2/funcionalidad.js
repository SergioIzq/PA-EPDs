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


const total=5, limite=25, bonus=10, umbralAviso=5, pausa=2000;
const $=id => document.getElementById(id);
let estado = nuevoEstado();
let idIntervalo=null, idLimite=null, idSiguiente=null;

function nuevoEstado(){
    return{ seleccion: [],indice:0, puntos:0, aciertos:0, fallos:0, omisiones:0, tiempos: [], restante: limite, bloqueado:true};
}

function limpiarTemporizadores(){
    clearInterval(idIntervalo);
    clearTimeout(idLimite);
    clearTimeout(idSiguiente);
    idIntervalo=idLimite =idSiguiente=null;
}

function seleccionarIncidencias(){ //recorre el array de incidencias desde el final hasta el principio 
    const copia=[...incidencias]; //crea un array nuevo con los mismos elementos
    for(let i=copia.length-1;i>0;i--){  //recorre la copia desde la ultima posicion 
        const j= Math.floor(Math.random()*(i+1)); //elige un aposicion al azar entre 0 e i (incluidas ambas) 
        const auxiliar = copia[i]; //intercambia la incidencia de la posicion i a la posicion j 
        copia[i] = copia[j];
        copia[j] = auxiliar;
    }
    return copia.slice(0,total);    //se queda con lo que haya del 0 al total 
}

function iniciarTurno(){
    limpiarTemporizadores();
    estado = nuevoEstado();
    estado.seleccion = seleccionarIncidencias();
    $("historial").innerHTML="";
    actualizarMarcadores();
    location.hash="";
    document.title="SOC - Turno: en curso";
    mostrarIncidencia();
}

function actualizarMarcadores(){
    const hechas= estado.aciertos + estado.fallos + estado.omisiones;
    $("puntos").textContent=estado.puntos;
    $("pregResu").textContent=`${estado.aciertos}/${total}`;
    $("avance").style.width=`${hechas*20}%`;
    $("porcentaje").textContent=`${hechas*20}%`;
}

function mostrarIncidencia() {
  const [categoria, descripcion, gravedad, opciones] = estado.seleccion[estado.indice];
  const zona = $("principal");
  zona.innerHTML = "";

  const cab = document.createElement("div");
  cab.className = "cabecera";
  cab.innerHTML = `<h2>Incidencia ${estado.indice + 1} de ${total}</h2><span id="reloj"></span>`;
  const info = document.createElement("p");
  info.innerHTML = `<strong>${categoria}</strong> · Gravedad: <span class="gravedad-${gravedad}">${gravedad}</span>`;
  const desc = document.createElement("p");
  desc.textContent = descripcion;
  const aviso = document.createElement("div");
  aviso.id = "aviso";
  zona.append(cab, info, desc, aviso);

  opciones.forEach((texto, i) => {
    const b = document.createElement("button");
    b.className = "opcion";
    b.textContent = `${i + 1}. ${texto}`;
    b.addEventListener("click", () => seleccionarActuacion(i, "ratón"));
    b.addEventListener("mouseover", () => { if (!estado.bloqueado) b.classList.add("resaltada"); });
    b.addEventListener("mouseout", () => b.classList.remove("resaltada"));
    zona.appendChild(b);
  });

  const fb = document.createElement("div");
  fb.id = "feedback";
  fb.hidden = true;
  zona.appendChild(fb);

  estado.bloqueado = false;
  iniciarTemporizador();
}

function iniciarTemporizador() {
  estado.restante = limite;
  const reloj = $("reloj");
  reloj.textContent = `${estado.restante} s`;
  idIntervalo = setInterval(() => {
    estado.restante--;
    reloj.textContent = `${estado.restante} s`;
    if (estado.restante <= umbralAviso) {
      reloj.classList.add("urgente");
      $("aviso").textContent = "Atención: poco tiempo de respuesta.";
    }
    if (estado.restante <= 0) clearInterval(idIntervalo);
  }, 1000);
  idLimite = setTimeout(gestionarTiempoAgotado, limite * 1000);
}

function bloquearOpciones(indiceCorrecto, indiceElegido) {
  estado.bloqueado = true;
  document.querySelectorAll(".opcion").forEach((b, i) => {
    b.disabled = true;
    b.classList.remove("resaltada");
    if (i === indiceCorrecto) b.classList.add("correcta");
    else if (i === indiceElegido) b.classList.add("incorrecta");
  });
}

function aplicarPuntos(variacion) {
  estado.puntos = Math.max(0, estado.puntos + variacion);   // nunca por debajo de 0
}

function mostrarFeedback(lineas, ok) {
  const fb = $("feedback");
  fb.className = ok ? "" : "ko";
  fb.innerHTML = "";
  lineas.forEach((t, i) => {
    const el = document.createElement(i === 0 ? "h3" : "p");
    el.textContent = t;
    fb.appendChild(el);
  });
  fb.hidden = false;
}

function seleccionarActuacion(indiceOpcion, origenEvento) {
  if (estado.bloqueado) return;
  limpiarTemporizadores();
  const [, , , opciones, correcto, explicacion] = estado.seleccion[estado.indice];
  const tiempo = limite - estado.restante;
  const acierto = indiceOpcion === correcto;
  let variacion;

  bloquearOpciones(correcto, indiceOpcion);
  if (acierto) {
    const b = tiempo <= bonus;
    variacion = b ? 20 : 15;
    estado.aciertos++;
    mostrarFeedback([`DECISIÓN CORRECTA (+${variacion} pts)`, explicacion,
      `Tiempo de respuesta: ${tiempo} segundos${b ? " (¡Bonificación aplicada!)" : ""}`], true);
  } else {
    variacion = -5;
    estado.fallos++;
    mostrarFeedback(["DECISIÓN INCORRECTA (-5 pts)", `Actuación recomendada: ${opciones[correcto]}`,
      explicacion, `Tiempo de respuesta: ${tiempo} segundos`], false);
  }
  aplicarPuntos(variacion);
  estado.tiempos.push(tiempo);
  registrarResultado(estado.indice, opciones[indiceOpcion], acierto ? "Correcta" : "Incorrecta", tiempo, variacion);
  avanzar(origenEvento);
}


function gestionarTiempoAgotado() {
  if (estado.bloqueado) return;
  limpiarTemporizadores();
  const [, , , opciones, correcto, explicacion] = estado.seleccion[estado.indice];
  bloquearOpciones(correcto, -1);
  estado.omisiones++;
  aplicarPuntos(-3);
  estado.tiempos.push(limite);
  mostrarFeedback(["TIEMPO DE RESPUESTA AGOTADO (-3 pts)", "No se ha aplicado ninguna actuación a tiempo.",
    `Actuación recomendada: ${opciones[correcto]}`, explicacion], false);
  registrarResultado(estado.indice, "Sin respuesta", "Tiempo agotado", limite, -3);
  avanzar();
}

function avanzar() {
  actualizarMarcadores();
  idSiguiente = setTimeout(() => {
    estado.indice++;
    if (estado.indice < total) mostrarIncidencia();
    else finalizarTurno();
  }, pausa);
}

function registrarResultado(indiceIncidencia, decision, resultado, tiempo, variacion) {
  const [categoria, , gravedad] = estado.seleccion[indiceIncidencia];
  const signo = variacion > 0 ? "+" : "";
  const t = document.createElement("div");
  t.className = "tarjeta";
  [`Incidencia ${indiceIncidencia + 1} | Categoría: ${categoria} | Gravedad: ${gravedad}`,
   `Respuesta: ${decision}`, `Resultado: ${resultado}`,
   `Tiempo empleado: ${tiempo} segundos`, `Puntuación: ${signo}${variacion}`]
    .forEach(l => { const p = document.createElement("div"); p.textContent = l; t.appendChild(p); });
  $("historial").appendChild(t);
}

function clasificar(p) {
  if (p >= 80) return "Especialista";
  if (p >= 55) return "Técnico avanzado";
  if (p >= 30) return "Técnico en formación";
  return "Debe revisar el protocolo de actuación";
}

function finalizarTurno() {
  limpiarTemporizadores();
  estado.bloqueado = true;
  const media = (estado.tiempos.reduce((a, b) => a + b, 0) / total).toFixed(1);
  const linea = "-·".repeat(52);
  const informe = [linea, "INFORME TÉCNICO DE LA GUARDIA ", linea,
    `Incidencias analizadas: ${total}`, `Decisiones correctas: ${estado.aciertos}`,
    `Decisiones incorrectas: ${estado.fallos}`, `Incidencias sin respuesta: ${estado.omisiones}`,
    `Puntuación final obtenida: ${estado.puntos}`, `Tiempo medio de respuesta: ${media} segundos`,
    `Nivel de desempeño asignado: ${clasificar(estado.puntos)}`, linea].join("\n");

  const zona = $("principal");
  zona.innerHTML = "";
  const pre = document.createElement("pre");
  pre.id = "informe";
  pre.textContent = informe;
  const btn = document.createElement("button");
  btn.id = "btn-nuevo";
  btn.textContent = "Iniciar nuevo turno";
  btn.addEventListener("click", () => { reiniciarTurno(); iniciarTurno(); });
  zona.append(pre, btn);

  location.hash = "informe-final";                 
  document.title = `SOC - Turno: finalizado (${estado.puntos} pts)`;  
}

function reiniciarTurno() {
  limpiarTemporizadores();
  estado = nuevoEstado();
  actualizarMarcadores();
  $("historial").innerHTML = "";
  document.title = "Centro de Operaciones de Ciberseguridad";
  const zona = $("principal");
  zona.innerHTML = "";
  const b = document.createElement("button");
  b.id = "iniciar";
  b.textContent = "Iniciar turno";
  b.addEventListener("click", iniciarTurno);
  zona.appendChild(b);
}

document.addEventListener("keydown", event => {
  if (estado.bloqueado) return;
  if (["1", "2", "3", "4"].includes(event.key)) seleccionarActuacion(Number(event.key) - 1, "teclado");
});

$("iniciar").addEventListener("click", iniciarTurno);









