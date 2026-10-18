/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/ClientSide/javascript.js to edit this template
 */

const texto = document.getElementById('texto').value;
document.getElementById('enviar').addEventListener('click', cambioCadena);

function cambioCadena() {
    let resultado = "";

    for (let i = 0; i < texto.length; i++) {
        if (i % 2 === 0) {
            resultado += texto[i].toUpperCase();
        } else if (i % 3 === 0) {
            resultado += texto[i].toLowerCase();
        } else if (i % 5 === 0) {
            resultado += '*';
        } else {
            resultado += texto[i];   // se deja igual
        }
    }
    alert(resultado);
}

