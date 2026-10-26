const SOL=[2,7,6,9,5,1,4,3,8],SUMA=15;
let tAuto,celdas=[],sel=4,t0,reloj,intentos,fallos,fin,ultimo;
const $=id=>document.getElementById(id);
function msg(m){$('mensaje').textContent=m}
function crear(){
 $('tabla').innerHTML='';celdas=[];
 for(let f=0;f<3;f++){const tr=$('tabla').insertRow();for(let c=0;c<3;c++){const td=tr.insertCell();td.addEventListener('click',seleccionarCelda);celdas.push(td)}}
}
function pintar(){
 celdas.forEach((td,i)=>{td.className=td.textContent?'llena':'';if(!td.textContent&&faltaMarcar)td.classList.add('vacia-roja');if(i===sel)td.classList.add('sel')});
 $('restantes').textContent=celdas.filter(c=>!c.textContent).length;
}
let faltaMarcar=false;
function seleccionarCelda(e){if(fin)return;sel=celdas.indexOf(e.currentTarget);pintar()}
function validarTecla(e){
 if(fin||e.ctrlKey||e.metaKey||e.altKey||e.key.length>1&&e.key!=='Backspace'&&e.key!=='Delete'){return}
 if(e.key==='Backspace'||e.key==='Delete'){celdas[sel].textContent='';pintar();return}
 if(!/^[0-9]$/.test(e.key)){msg('Solo se aceptan números');return}
 if(e.key==='0'){msg('Solo se aceptan números del 1 al 9');return}
 if(celdas.some((c,i)=>i!==sel&&c.textContent===e.key)){msg('No puedes repetir números\nCada cifra del 1 al 9 debe aparecer solo una vez');return}
 celdas[sel].textContent=e.key;msg('');pintar();
}
function verificarCuadradoMagico(){
 if(fin)return;
 const v=celdas.map(c=>+c.textContent);faltaMarcar=v.includes(0);
 if(faltaMarcar){pintar();ultimo='';return}
 const huella=v.join('');if(huella===ultimo)return;ultimo=huella;
 const s=[0,1,2].flatMap(i=>[v[3*i]+v[3*i+1]+v[3*i+2],v[i]+v[i+3]+v[i+6]]).concat(v[0]+v[4]+v[8],v[2]+v[4]+v[6]);
 intentos++;$('intentos').textContent=intentos;
 if(s.every(x=>x===s[0])){
  fin=true;clearInterval(reloj);celdas.forEach(c=>c.className='oro');
  msg(`¡FELICIDADES!\nHas resuelto el cuadrado mágico en ${Math.floor((Date.now()-t0)/1000)} segundos\nSuma mágica: ${s[0]}\n¿Quieres intentar otro?`);
  tAuto=setTimeout(()=>reiniciarJuego(true),5000);
 }else{
  fallos++;$('fallos').textContent=fallos%3;msg('Este no es un cuadrado mágico\nLas sumas no coinciden. ¡Sigue intentando!');
  if(fallos%3===0){const i=celdas.findIndex((c,k)=>+c.textContent!==SOL[k]);celdas[i].textContent=SOL[i];
   celdas.forEach((c,k)=>{if(k!==i&&+c.textContent===SOL[i])c.textContent=''});
   msg($('mensaje').textContent+`\nPista: la celda ${i+1} debe valer ${SOL[i]}.`);ultimo=''}
  pintar();
 }
}
function reiniciarJuego(conservar){
 clearInterval(reloj);clearTimeout(tAuto);celdas.forEach(c=>c.textContent='');sel=4;intentos=0;fallos=0;fin=false;ultimo='';faltaMarcar=false;
 $('intentos').textContent=0;$('fallos').textContent=0;$('tiempo').textContent=0;if(!conservar)msg('');pintar();
 t0=Date.now();reloj=setInterval(()=>$('tiempo').textContent=Math.floor((Date.now()-t0)/1000),1000);
}
function resolver(){clearInterval(reloj);fin=true;celdas.forEach((c,i)=>{c.textContent=SOL[i];c.className='llena'});$('restantes').textContent=0;msg('Solución válida mostrada. Suma mágica: 15')}
window.addEventListener('load',()=>{crear();reiniciarJuego();
 document.addEventListener('keydown',validarTecla);document.addEventListener('keyup',verificarCuadradoMagico);
 $('btnNueva').addEventListener('click',()=>reiniciarJuego());$('btnResolver').addEventListener('click',resolver)});
