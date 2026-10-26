const W=770,H=370,TIPOS={
 herbivoro:{e:'🐇',energia:100,max:120,vel:60,repro:.15},carnivoro:{e:'🦊',energia:120,max:200,vel:70,repro:.3},
 planta:{e:'🌱',energia:40,max:40,vel:0,repro:0},omnivoro:{e:'🐻',energia:110,max:200,vel:65,repro:.2}};
let ciclo,pausado=false,idN=0,generacion=1,arrastrado=null,off=[0,0];
const $=id=>document.getElementById(id),eco=()=>$('ecosistema');
const generarIdUnico=()=>'o'+(++idN);
const orgs=()=>[...eco().querySelectorAll('.organismo:not(.muriendo)')];
const d=o=>o.dataset,pos=o=>[parseFloat(o.style.left),parseFloat(o.style.top)];
const dist=(a,b)=>Math.hypot(pos(a)[0]-pos(b)[0],pos(a)[1]-pos(b)[1]);
const alea=m=>Math.random()*m;
function registrarEvento(m){const p=document.createElement('p'),l=$('eventos-lista');p.textContent=`[${new Date().toLocaleTimeString()}] ${m}`;
 l.insertBefore(p,l.firstChild);while(l.children.length>10)l.removeChild(l.lastChild)}
function crearOrganismo(tipo,x,y){
 const t=TIPOS[tipo],el=document.createElement('div');
 el.className=`organismo ${tipo}`;el.textContent=t.e;el.style.left=x+'px';el.style.top=y+'px';el.draggable=true;
 Object.assign(el.dataset,{tipo,energia:t.energia,edad:0,id:generarIdUnico()});
 if(tipo==='planta'){d(el).tamano=1;d(el).rebrota='true'}else d(el).velocidad=2;
 el.addEventListener('click',mostrarInfoOrganismo);
 el.addEventListener('dblclick',()=>eliminarOrganismo(el));
 el.addEventListener('mouseover',e=>{const tt=$('tooltip');tt.textContent=`${tipo} · energía ${Math.round(d(el).energia)} · edad ${d(el).edad}`;tt.style.left=e.clientX+12+'px';tt.style.top=e.clientY+12+'px';tt.hidden=false});
 el.addEventListener('mouseout',()=>$('tooltip').hidden=true);
 el.addEventListener('dragstart',e=>{arrastrado=el;const r=el.getBoundingClientRect();off=[e.clientX-r.left,e.clientY-r.top];el.style.transition='none'});
 el.addEventListener('dragend',e=>{const r=eco().getBoundingClientRect();
  el.style.left=Math.min(W,Math.max(0,e.clientX-r.left-off[0]))+'px';el.style.top=Math.min(H,Math.max(0,e.clientY-r.top-off[1]))+'px';el.style.transition='';arrastrado=null});
 eco().appendChild(el);return el;
}
function mostrarInfoOrganismo(e){
 orgs().forEach(o=>o.classList.remove('sel'));const o=e.currentTarget;o.classList.add('sel');
 registrarEvento(`Seleccionado ${d(o).tipo} #${d(o).id}: energía ${Math.round(d(o).energia)}, edad ${d(o).edad}`);
}
function añadirEspecie(tipo){crearOrganismo(tipo,alea(W),alea(H));registrarEvento(`Añadido: ${tipo}`);actualizarEstadisticas()}
function moverOrganismo(o){
 if(o===arrastrado||d(o).tipo==='planta')return;const v=TIPOS[d(o).tipo].vel,[x,y]=pos(o);
 o.style.left=Math.min(W,Math.max(0,x+alea(2*v)-v))+'px';o.style.top=Math.min(H,Math.max(0,y+alea(2*v)-v))+'px';
}
function presa(o){const t=d(o).tipo;return t==='herbivoro'?['planta']:t==='carnivoro'?['herbivoro']:t==='omnivoro'?['planta','herbivoro']:[]}
const CAP={herbivoro:40,carnivoro:10,omnivoro:8};
function interaccionOrganismos(){
 const todos=orgs();
 todos.forEach(o=>{
  if(!o.isConnected||o.classList.contains('muriendo')||d(o).tipo==='planta')return;
  const p=todos.filter(x=>x!==o&&x.isConnected&&!x.classList.contains('muriendo')&&presa(o).includes(d(x).tipo)&&dist(o,x)<120).sort((a,b)=>(d(a).tipo==='planta'?0:1e4)-(d(b).tipo==='planta'?0:1e4)+dist(o,a)-dist(o,b))[0];
  if(p&&(d(p).tipo==='planta'||Math.random()<.5)&&+d(o).energia<(d(o).tipo==='herbivoro'?150:110)){d(o).energia=+d(o).energia+(d(p).tipo==='planta'?25:45);registrarEvento(`${d(o).tipo} se alimenta de ${d(p).tipo}`);eliminarOrganismo(p,true)}
  const par=todos.find(x=>x!==o&&x.isConnected&&d(x).tipo===d(o).tipo&&dist(o,x)<120);
  if(par&&+d(o).id.slice(1)<+d(par).id.slice(1)&&d(o).energia>60&&todos.filter(x=>d(x).tipo===d(o).tipo).length<CAP[d(o).tipo]&&Math.random()<TIPOS[d(o).tipo].repro)reproducirEspecie(o,par);
 });
}
function reproducirEspecie(a,b){
 const [x,y]=pos(a),h=crearOrganismo(d(a).tipo,Math.min(W,Math.max(0,x+alea(40)-20)),Math.min(H,Math.max(0,y+alea(40)-20)));
 d(a).energia-=25;d(b).energia-=25;generacion++;$('generacion').textContent=generacion;registrarEvento(`Nace un ${d(a).tipo} (generación ${generacion})`);
}
function eliminarOrganismo(el,silencio){
 if(!el||!el.isConnected||el.classList.contains('muriendo'))return;
 el.classList.add('muriendo');if(!silencio)registrarEvento(`Eliminado ${d(el).tipo} #${d(el).id}`);
 setTimeout(()=>{if(el.parentNode)el.parentNode.removeChild(el);actualizarEstadisticas()},500);
}
function simularCicloVida(){
 if(pausado)return;
 orgs().forEach(o=>{
  d(o).edad=+d(o).edad+1;
  if(d(o).tipo==='planta'){d(o).energia=Math.min(80,+d(o).energia+3)}else d(o).energia-=(d(o).tipo==='herbivoro'?3:2);
  moverOrganismo(o);
  if(d(o).energia<=0){registrarEvento(`${d(o).tipo} muere de hambre`);eliminarOrganismo(o,true)}
  else if(+d(o).edad>TIPOS[d(o).tipo].max){registrarEvento(`${d(o).tipo} muere por edad`);eliminarOrganismo(o,true)}
 });
 interaccionOrganismos();
 for(let k=0;k<2;k++)if(Math.random()<.8&&orgs().filter(o=>d(o).tipo==='planta').length<60)crearOrganismo('planta',alea(W),alea(H));
 actualizarEstadisticas();
}
function actualizarEstadisticas(){
 const c={herbivoro:0,carnivoro:0,planta:0,omnivoro:0};orgs().forEach(o=>c[d(o).tipo]++);
 for(const k in c)$('count-'+k).textContent=c[k];
 const tot=Object.values(c).reduce((a,b)=>a+b,0),v=Object.values(c);let est='Equilibrado';
 if(tot<5)est='Colapso';else if(v.includes(0))est='Extinción';else if(Math.max(...v)>=1.5*(tot-Math.max(...v)))est='Sobrepoblación';
 $('estado').textContent=est;
}
function iniciarEcosistema(){
 Array(14).fill('planta').concat(Array(8).fill('herbivoro'),['carnivoro','carnivoro','omnivoro','omnivoro']).forEach(t=>crearOrganismo(t,alea(W),alea(H)));
 actualizarEstadisticas();registrarEvento('Ecosistema iniciado');ciclo=setInterval(simularCicloVida,2000);
 document.querySelectorAll('[data-tipo]').forEach(b=>b.addEventListener('click',()=>añadirEspecie(b.dataset.tipo)));
 $('btnPausa').addEventListener('click',()=>{pausado=!pausado;$('btnPausa').textContent=pausado?'Reanudar':'Pausar'});
}
document.addEventListener('DOMContentLoaded',iniciarEcosistema);
