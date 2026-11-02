/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

const solucion = [2, 7, 6, 9, 5, 1, 4, 3, 8];
const sumaMagica = 15;
// Posiciones de las celdas que forman cada fila, columna y diagonal
const lineas = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
const nombresLineas = ["fila 1","fila 2","fila 3","columna 1","columna 2","columna 3","diagonal principal","diagonal secundaria"];

const $ = id => document.getElementById(id);
const celdas = [...document.querySelectorAll("#tablero td")];

let celdaActiva = 4;      
let intentos = 0;         
let fallos = 0;
let segundos = 0;
let cronometro = null;
let hayCambio = false;    
let juegoTerminado = false;

// Número que hay en una celda o 0 si está vacía
function numeroCelda(i) {
  return Number(celdas[i].textContent) || 0;
}

function actualizarColores() {
  celdas.forEach((celda, i) => {
    celda.className = "";
    if (i === celdaActiva && !juegoTerminado) {
      celda.classList.add("seleccionada");
    } else if (celda.textContent) {
      celda.classList.add("completa");
    }
  });
  const llenas = celdas.filter(c => c.textContent).length;
  $("restantes").textContent = 9 - llenas;
  $("objetivo").textContent = sumaMagica;
  mostrarPista();
}

function seleccionarCelda(event) {
  if (juegoTerminado) return;
  celdaActiva = celdas.indexOf(event.currentTarget);
  actualizarColores();
}

function validarTecla(event) {
  if (juegoTerminado) return;
  const tecla = event.key;

  if (tecla === "Backspace" || tecla === "Delete") {
    celdas[celdaActiva].textContent = "";
    hayCambio = true;
    $("aviso").textContent = "";
    actualizarColores();
    return;
  }

  if (tecla.length > 1 || event.ctrlKey || event.metaKey || event.altKey) return;

  if (!/^[0-9]$/.test(tecla)) {
    $("aviso").textContent = "Solo se aceptan números.";
    return;
  }
  if (tecla === "0") {
    $("aviso").textContent = "Solo se aceptan números del 1 al 9.";
    return;
  }

  const repetido = celdas.some((c, i) => i !== celdaActiva && c.textContent === tecla);
  if (repetido) {
    $("aviso").textContent = "No puedes repetir números\nCada cifra del 1 al 9 debe aparecer solo una vez";
    return;
  }

  celdas[celdaActiva].textContent = tecla;
  $("aviso").textContent = "";
  hayCambio = true;
  actualizarColores();
}

function sumarLinea(linea) {
  return linea.reduce((total, i) => total + numeroCelda(i), 0);
}

function mostrarPista() {
  for (let n = 0; n < lineas.length; n++) {
    const completa = lineas[n].every(i => numeroCelda(i) > 0);
    if (completa && sumarLinea(lineas[n]) !== sumaMagica) {
      $("pista").textContent = `Pista: ${nombresLineas[n]} suma ${sumarLinea(lineas[n])} y debería sumar ${sumaMagica}.`;
      return;
    }
  }
  $("pista").textContent = "";
}

function verificarCuadradoMagico(contarIntento = true) {
  const vacias = celdas.filter(c => !c.textContent);
  if (vacias.length > 0) {
    vacias.forEach(c => c.classList.add("incompleta"));
    return;
  }

  const esMagico = lineas.every(linea => sumarLinea(linea) === sumaMagica);
  if (esMagico) {
    juegoTerminado = true;
    clearInterval(cronometro);
    celdas.forEach(c => { c.className = "dorada"; });
    $("mensaje").textContent = `¡FELICIDADES!\nHas resuelto el cuadrado mágico en ${segundos} segundos\nSuma mágica: ${sumaMagica}\n¿Quieres intentar otro?`;
    $("mensaje").hidden = false;
    $("aviso").textContent = "";
    return;
  }

  $("aviso").textContent = "Este no es un cuadrado mágico\nLas sumas no coinciden. ¡Sigue intentando!";
  if (!contarIntento) return;
  intentos++;
  fallos++;
  $("intentos").textContent = intentos;
  if (fallos % 3 === 0) pistaAutomatica();
}

function pistaAutomatica() {
  const i = solucion.findIndex((valor, n) => numeroCelda(n) !== valor);
  const j = celdas.findIndex(c => Number(c.textContent) === solucion[i]);
  celdas[j].textContent = celdas[i].textContent;   
  celdas[i].textContent = solucion[i];
  $("aviso").textContent += `\nPista automática: la celda ${i + 1} lleva un ${solucion[i]}.`;
  actualizarColores();
  verificarCuadradoMagico(false);
}

function resolverCuadrado() {
  solucion.forEach((valor, i) => { celdas[i].textContent = valor; });
  actualizarColores();
  verificarCuadradoMagico(false);
}

function reiniciarJuego() {
  clearInterval(cronometro);
  celdas.forEach(c => { c.textContent = ""; });
  celdaActiva = 4;
  intentos = 0;
  fallos = 0;
  segundos = 0;
  hayCambio = false;
  juegoTerminado = false;
  $("intentos").textContent = 0;
  $("tiempo").textContent = 0;
  $("aviso").textContent = "";
  $("mensaje").hidden = true;
  cronometro = setInterval(() => {
    segundos++;
    $("tiempo").textContent = segundos;
  }, 1000);
  actualizarColores();
}

window.addEventListener("load", () => {
  celdas.forEach(c => c.addEventListener("click", seleccionarCelda));
  document.addEventListener("keydown", validarTecla);
  document.addEventListener("keyup", () => {
    if (juegoTerminado || !hayCambio) return;
    hayCambio = false;
    verificarCuadradoMagico();
  });
  $("btn-nueva").addEventListener("click", reiniciarJuego);
  $("btn-resolver").addEventListener("click", resolverCuadrado);
  reiniciarJuego();
});