const incidencias=[
["Seguridad","Se detectan numerosos intentos fallidos de acceso por fuerza bruta desde una dirección IP desconocida.","Alta",["Reiniciar el servidor web","Bloquear temporalmente la dirección IP en el firewall","Eliminar todas las cuentas de usuario afectadas","Desactivar la infraestructura de red completa"],1,"El bloqueo perimetral en el firewall frena el ataque de inmediato sin provocar denegación de servicio a los usuarios legítimos."],
["Copias de seguridad","El proceso programado de respaldo nocturno de las bases de datos académicas ha finalizado con estado erróneo.","Media",["Ignorar la alerta y esperar a la noche siguiente","Formatear la cabina de almacenamiento de copias","Examinar los logs de error y lanzar un respaldo manual inmediato","Eliminar las copias históricas para liberar espacio"],2,"Analizar el registro permite identificar el motivo del fallo y el respaldo manual garantiza contar con un punto de recuperación reciente."],
["Redes","Los puestos de trabajo de un departamento no tienen conexión a Internet, aunque sí se comunican con los servidores locales.","Media",["Verificar la puerta de enlace predeterminada y el router de salida","Sustituir los cables de red de todos los ordenadores","Reinstalar el sistema operativo de las máquinas cliente","Apagar el conmutador (switch) de planta"],0,"La comunicación local operativa confirma que el fallo se localiza en el enrutamiento o en el enlace de salida hacia el proveedor externo."],
["Hardware","El sensor térmico del servidor de correo alerta de una temperatura crítica sostenida en la CPU superior a 95°C.","Alta",["Aumentar la carga de trabajo para forzar la ventilación","Apagar ordenadamente la máquina y verificar disipación y flujo de aire","Desactivar las alertas de temperatura de la BIOS","Desconectar el cable de alimentación de forma abrupta"],1,"El apagado ordenado evita daños físicos en el silicio y permite inspeccionar los ventiladores y la pasta térmica sin corromper datos."],
["Aplicaciones","El portal de matriculación arroja un error '500 Internal Server Error' tras desplegar un parche de actualización.","Alta",["Solicitar a los alumnos que insistan recargando la página","Revertir el despliegue a la versión estable previa (rollback)","Borrar la base de datos de expedientes","Cambiar el nombre del dominio institucional"],1,"Efectuar un rollback inmediato restituye el servicio a la comunidad universitaria mientras se depura el parche en entorno de pruebas."],
["Gestión de usuarios","Un profesor comunica que ha recibido un correo solicitando sus claves universitarias y sospecha haber caído en una trampa de phishing.","Alta",["Restablecer su contraseña inmediatamente y revocar sesiones activas","Publicar un aviso en redes sociales advirtiendo del hecho","Ignorar el aviso si el profesor aún puede iniciar sesión","Dar de baja la matrícula de todos sus alumnos"],0,"Inhabilitar la contraseña vulnerada e invalidar los tokens de sesión impide el acceso del atacante a los sistemas de la universidad."]];
const LIMITE=25,TOTAL=5;
let turno,iInt,iOut,iSig;
const $=id=>document.getElementById(id);
function seleccionarIncidencias(){return [...incidencias].sort(()=>Math.random()-.5).slice(0,TOTAL)}
function iniciarTurno(){
 turno={lista:seleccionarIncidencias(),n:0,puntos:0,ok:0,mal:0,omit:0,tiempos:[],resto:LIMITE,bloqueo:true};
 $('puntos').textContent=0;$('resueltas').textContent='0/5';$('progreso').style.width='0';$('historial').innerHTML='';
 document.title='SOC';history.replaceState(null,'',location.href.split('#')[0]);$('btnInicio').hidden=true;mostrarIncidencia();
}
function mostrarIncidencia(){
 const [cat,desc,grav,ops]=turno.lista[turno.n];turno.bloqueo=false;
 $('principal').innerHTML=`<h3>Incidencia ${turno.n+1} · ${cat} · Gravedad ${grav}</h3><p>${desc}</p><p>Tiempo: <span id="reloj"></span> s <span id="alerta"></span></p><div id="opciones"></div><div id="feedback"></div>`;
 ops.forEach((t,i)=>{const b=document.createElement('button');b.className='op';b.textContent=`${i+1}. ${t}`;
  b.addEventListener('click',()=>seleccionarActuacion(i,'ratón'));
  b.addEventListener('mouseover',()=>b.classList.add('hover'));b.addEventListener('mouseout',()=>b.classList.remove('hover'));
  $('opciones').appendChild(b)});
 iniciarTemporizador();
}
function iniciarTemporizador(){
 turno.resto=LIMITE;$('reloj').textContent=LIMITE;
 iInt=setInterval(()=>{turno.resto--;$('reloj').textContent=turno.resto;
  if(turno.resto<=5){$('reloj').className='critico';$('alerta').textContent='Atención: poco tiempo de respuesta'}},1000);
 iOut=setTimeout(gestionarTiempoAgotado,LIMITE*1000);
}
function sumar(v){turno.puntos=Math.max(0,turno.puntos+v);$('puntos').textContent=turno.puntos}
function cerrar(elegido){
 clearInterval(iInt);clearTimeout(iOut);turno.bloqueo=true;const c=turno.lista[turno.n][4];
 document.querySelectorAll('.op').forEach((b,i)=>{b.disabled=true;b.classList.remove('hover');if(i===c)b.classList.add('ok');else if(i===elegido)b.classList.add('mal')});
}
function seleccionarActuacion(i,origen){
 if(turno.bloqueo)return;
 const inc=turno.lista[turno.n],t=LIMITE-turno.resto;cerrar(i);turno.tiempos.push(t);let v,res,txt;
 if(i===inc[4]){v=t<=10?20:15;res='Correcta';turno.ok++;
  txt=`DECISIÓN CORRECTA (+${v} pts)\n${inc[5]}\nTiempo de respuesta: ${t} segundos${t<=10?' (¡Bonificación aplicada!)':''}`}
 else{v=-5;res='Incorrecta';turno.mal++;
  txt=`DECISIÓN INCORRECTA (-5 pts)\nActuación recomendada: ${inc[3][inc[4]]}\n${inc[5]}\nTiempo de respuesta: ${t} segundos`}
 $('feedback').textContent=txt;sumar(v);registrarResultado(turno.n,inc[3][i],res,t,v);avanzar();
}
function gestionarTiempoAgotado(){
 if(turno.bloqueo)return;
 const inc=turno.lista[turno.n];cerrar(-1);turno.omit++;turno.tiempos.push(LIMITE);
 $('feedback').textContent=`TIEMPO DE RESPUESTA AGOTADO (-3 pts)\nNo se ha aplicado ninguna actuación a tiempo.\nActuación recomendada: ${inc[3][inc[4]]}\n${inc[5]}`;
 sumar(-3);registrarResultado(turno.n,'Sin respuesta','Tiempo agotado',LIMITE,-3);avanzar();
}
function registrarResultado(n,dec,res,t,v){
 const d=document.createElement('div'),inc=turno.lista[n];d.className='tarjeta';
 d.textContent=`Incidencia ${n+1} | Categoría: ${inc[0]} | Gravedad: ${inc[2]}\nDecisión adoptada: ${dec}\nResultado: ${res}\nTiempo empleado: ${t} segundos\nVariación de puntuación: ${v>0?'+':''}${v}`;
 $('historial').prepend(d);
}
function avanzar(){
 turno.n++;$('resueltas').textContent=`${turno.n}/5`;$('progreso').style.width=turno.n*20+'%';
 iSig=setTimeout(()=>turno.n<TOTAL?mostrarIncidencia():finalizarTurno(),2000);
}
function finalizarTurno(){
 const p=turno.puntos,media=(turno.tiempos.reduce((a,b)=>a+b,0)/TOTAL).toFixed(1);
 const nivel=p>=80?'Especialista':p>=55?'Técnico avanzado':p>=30?'Técnico en formación':'Debe revisar el protocolo de actuación';
 const l='='.repeat(55);
 $('principal').innerHTML=`<pre id="informe">${l}\nINFORME TÉCNICO DE FIN DE GUARDIA (SOC)\n${l}\nIncidencias analizadas: ${TOTAL}\nDecisiones correctas: ${turno.ok}\nDecisiones incorrectas: ${turno.mal}\nIncidencias sin respuesta: ${turno.omit}\nPuntuación final obtenida: ${p}\nTiempo medio de respuesta: ${media} segundos\nNivel de desempeño asignado: ${nivel}\n${l}</pre>`;
 document.title=`SOC - ${p} puntos`;location.hash='informe';$('btnInicio').textContent='Iniciar nuevo turno';$('btnInicio').hidden=false;
}
function reiniciarTurno(){clearInterval(iInt);clearTimeout(iOut);clearTimeout(iSig);iniciarTurno()}
$('btnInicio').addEventListener('click',reiniciarTurno);
document.addEventListener('keydown',e=>{if(!turno||turno.bloqueo)return;const i=['1','2','3','4'].indexOf(e.key);if(i>=0)seleccionarActuacion(i,'teclado')});
