const MISION='Misión Apolo',DURACION=90;
const SISTEMAS=[
['Energía','Genera y distribuye la energía de la nave.','Generador por fisión de 250 kW, respaldo auxiliar por celdas fotovoltaicas.'],
['Comunicaciones','Mantiene el enlace con la base.','Antena de alta ganancia en banda X.'],
['Navegación','Controla la trayectoria, posición y orientación de la nave.','Unidad inercial y seguidor estelar.'],
['Soporte vital','Mantiene atmósfera, temperatura y agua.','Reciclado de O2 al 95 %.'],
['Propulsión','Proporciona el empuje del despegue y maniobras.','Motores criogénicos de 4 MN.']];
let st,tInt,tAviso,tLanz;
const $=id=>document.getElementById(id);
function log(m){const p=document.createElement('p');p.textContent=`[${new Date().toLocaleTimeString()}] ${m}`;$('consola').appendChild(p);$('consola').scrollTop=1e9}
function estado(t){$('estado').textContent=t}
function pintarOperativos(){$('operativos').textContent=`Sistemas operativos: ${st.activos} de 5`}
function resetear(){
 clearInterval(tInt);clearInterval(tLanz);clearTimeout(tAviso);
 st={fase:'inicial',activos:0,resto:DURACION};
 $('mision').textContent=MISION;estado('En espera');$('contador').textContent=DURACION;$('contador').className='';
 $('resultado').textContent='';$('consola').innerHTML='';$('aviso').hidden=true;
 $('info').textContent='Seleccione un sistema para ver su descripción.';document.title='Panel de misión';pintarOperativos();
 $('panel').innerHTML='';
 SISTEMAS.forEach((s,i)=>{const d=document.createElement('div');d.className='tarjeta';
  d.innerHTML=`<b>${s[0]}</b><p>Estado: <span class="est">Desactivado</span></p><button disabled>Activar</button>`;
  d.querySelector('button').addEventListener('click',e=>{e.stopPropagation();activar(i,'ratón')});
  d.addEventListener('click',()=>$('info').textContent=`${s[0]}: ${s[1]}`);
  d.addEventListener('dblclick',()=>window.alert(`ESPECIFICACIONES DE ${s[0].toUpperCase()}: ${s[2]}`));
  d.addEventListener('mouseover',()=>d.classList.add('resaltada'));
  d.addEventListener('mouseout',()=>d.classList.remove('resaltada'));
  $('panel').appendChild(d)});
 $('btnIniciar').hidden=false;$('btnIniciar').disabled=false;$('btnLanzar').disabled=true;$('btnAbandonar').disabled=true;$('btnReiniciar').hidden=true;
}
function bloquear(){document.querySelectorAll('.tarjeta button,#btnLanzar,#btnAbandonar').forEach(b=>b.disabled=true);$('btnReiniciar').hidden=false}
function aviso(m){clearTimeout(tAviso);$('aviso').textContent=m;$('aviso').hidden=false;tAviso=setTimeout(()=>$('aviso').hidden=true,3000)}
function iniciar(){
 st.fase='activa';$('btnIniciar').disabled=true;$('btnIniciar').hidden=true;$('btnAbandonar').disabled=false;
 document.querySelectorAll('.tarjeta button').forEach(b=>b.disabled=false);
 estado('Preparación en curso');log('Protocolo de preparación iniciado');
 tInt=setInterval(tick,1000);
}
function tick(){
 st.resto--;$('contador').textContent=st.resto;
 if(st.resto===15){$('contador').className='critico';log('ADVERTENCIA: Tiempo de preparación próximo a finalizar.')}
 if(st.resto<=0){clearInterval(tInt);st.fase='fin';bloquear();estado('MISIÓN CANCELADA: Protocolo incompleto');
  const pend=SISTEMAS.slice(st.activos).map(s=>s[0]).join(', ');
  $('resultado').textContent=`MISIÓN CANCELADA\nSistemas operativos: ${st.activos} de 5\nSistemas pendientes: ${pend}\nEstado: Protocolo incompleto\nResultado: Lanzamiento no autorizado`}
}
function activar(i,via){
 if(st.fase!=='activa'||i<st.activos)return;
 if(i>st.activos){aviso('Acción bloqueada: debe activar primero el sistema anterior.');return}
 const t=$('panel').children[i];t.classList.add('operativo');t.querySelector('.est').textContent='Operativo';t.querySelector('button').disabled=true;
 st.activos++;pintarOperativos();log(`${SISTEMAS[i][0]} activado mediante ${via}.`);
 if(st.activos===5){$('btnLanzar').disabled=false;estado('Nave preparada para el lanzamiento');st.fase='lista'}
}
function lanzar(){
 clearInterval(tInt);st.fase='fin';const rest=st.resto;
 document.querySelectorAll('button').forEach(b=>b.disabled=true);
 let n=5;$('resultado').textContent=n;
 tLanz=setInterval(()=>{n--;$('resultado').textContent=n>0?n:'¡Despegue!';
  if(n<0){clearInterval(tLanz);document.title='¡Misión en Vuelo! - Lanzamiento Exitoso';estado('Nave en vuelo');
   $('btnReiniciar').disabled=false;$('btnReiniciar').hidden=false;
   $('resultado').textContent=`¡LANZAMIENTO COMPLETADO!\nMisión: ${MISION}\nSistemas operativos: 5 de 5\nTiempo restante: ${rest} segundos\nEstado: Nave en vuelo\nResultado: Protocolo ejecutado correctamente`}},1000);
}
function abandonar(){
 if(!window.confirm('¿Confirma que desea abortar la misión en curso?'))return;
 clearInterval(tInt);clearTimeout(tAviso);st.fase='fin';bloquear();estado('Misión abortada por el usuario');log('Aborto de misión confirmado.');document.title='Misión abortada';
}
$('btnIniciar').addEventListener('click',iniciar);$('btnLanzar').addEventListener('click',lanzar);
$('btnAbandonar').addEventListener('click',abandonar);$('btnReiniciar').addEventListener('click',resetear);
$('panel').addEventListener('click',e=>{if(e.target===e.currentTarget)log('Panel de sistemas seleccionado.')});
document.addEventListener('keydown',e=>{const i=['1','2','3','4','5'].indexOf(e.key);if(i>=0)activar(i,'teclado')});
resetear();
