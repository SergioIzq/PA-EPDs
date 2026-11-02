const config = {
    ancho: 800,
    alto: 600,
    tamanioOrganismo: 24,
    pausado: false
};

function iniciarEcosistema() {
    //ejecuta la funcion cada 2000ms (2s)
    setInterval(simularCicloVida, 2000);

}

function añadirEspecie(tipo) {
    // busca el tablero de organismos
    const ecosistema = document.getElementById('ecosistema')

    const anchoTablero = ecosistema.clientWidth;
    const altoTablero = ecosistema.clientHeight;

    const x = Math.floor(Math.random() * (anchoTablero - 30));
    const y = Math.floor(Math.random() * (altoTablero - 30));

    crearOrganismo(tipo , x, y);

}

function crearOrganismo(tipo, x, y) {

    const organismo = document.createElement('div');
    organismo.className = 'organismo ' + tipo;
    
    organismo.style.position = 'absolute';
    organismo.style.left = x + 'px';
    organismo.style.top = y + 'px';
    organismo.style.fontSize = '20px';
    organismo.style.cursor = 'pointer';
    organismo.style.width = '20px';
    organismo.style.height = '20px';
    organismo.style.transition = 'left 0.5s ease, top 0.5s ease';

    if (tipo === 'herbivoro') organismo.style.backgroundColor = 'blue';
    if (tipo === 'carnivoro') organismo.style.backgroundColor = 'red';
    if (tipo === 'planta') organismo.style.backgroundColor = 'green';
    if (tipo === 'omnivoro') organismo.style.backgroundColor = 'orange';

    organismo.dataset.tipo = tipo;
    organismo.dataset.energia = '100';
    organismo.dataset.edad = '0';
    organismo.dataset.id = Math.random().toString(36);


    organismo.addEventListener('click', mostrarInfoOrganismo);
    

    document.getElementById('ecosistema').appendChild(organismo);
    return organismo;

}

function mostrarInfoOrganismo(evento) {
    const elemento = evento.target;
    
    // Leemos los atributos que guardaste en el dataset
    const tipo = elemento.dataset.tipo;
    const energia = elemento.dataset.energia;
    const edad = elemento.dataset.edad;
    
    console.log(`Has hecho clic en un ${tipo} con ${energia} de energía y ${edad} de edad.`);
}

function simularCicloVida() {

    const organismos = document.querySelectorAll('.organismo');

    organismos.forEach(organismo => {
        if(organismo.dataset.tipo !== 'planta') {
            moverOrganismo(organismo);
        }
    });

    interaccionOrganismos();

}

function moverOrganismo(elemento) {

    let xActual = parseInt(elemento.style.left);
    let yActual = parseInt(elemento.style.top);

    let pasoX = Math.floor(Math.random() * 81) - 40;
    let pasoY = Math.floor(Math.random() * 81) - 40;

    let nuevoX = xActual + pasoX;
    let nuevoY = yActual + pasoY;

    const ecosistema = document.getElementById('ecosistema');
    const anchoMaximo = ecosistema.clientWidth - 20; // 20 es el ancho de tu cuadrado
    const altoMaximo = ecosistema.clientHeight - 20;

    if (nuevoX < 0) nuevoX = 0;
    if (nuevoX > anchoMaximo) nuevoX = anchoMaximo;
    if (nuevoY < 0) nuevoY = 0;
    if (nuevoY > altoMaximo) nuevoY = altoMaximo;

    elemento.style.left = nuevoX + 'px';
    elemento.style.top = nuevoY + 'px';
}

function interaccionOrganismos() {

    const organismos = Array.from(document.querySelectorAll('.organismo'));


    for (let i = 0; i < organismos.length; i++) {
        for (let j = i + 1; j < organismos.length; j++) {
            
            let org1 = organismos[i];
            let org2 = organismos[j];

            if (!org1.parentNode || !org2.parentNode) continue;


            let x1 = parseInt(org1.style.left);
            let y1 = parseInt(org1.style.top);
            let x2 = parseInt(org2.style.left);
            let y2 = parseInt(org2.style.top);


            let distancia = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));


            if (distancia < 30) {
                let tipo1 = org1.dataset.tipo;
                let tipo2 = org2.dataset.tipo;


                if (tipo1 === 'carnivoro' && tipo2 === 'herbivoro') {
                    comer(org1, org2);
                } else if (tipo1 === 'herbivoro' && tipo2 === 'carnivoro') {
                    comer(org2, org1);
                }


                else if (tipo1 === 'herbivoro' && tipo2 === 'planta') {
                    comer(org1, org2);
                } else if (tipo1 === 'planta' && tipo2 === 'herbivoro') {
                    comer(org2, org1);
                }

            }
        }
    }

}

function comer(depredador, presa) {

    let energiaActual = parseInt(depredador.dataset.energia);
    depredador.dataset.energia = energiaActual + 40; 


    setTimeout(() => depredador.style.transform = 'scale(1)', 500);

    presa.remove();
}

function reproducirEspecie(padre1, padre2) {

// Crea un nuevo organismo hijo

// Posiciona cerca de los padres

// Incrementa la generación

// Registra evento en el log

}

function eliminarOrganismo(elemento) {

// Remueve el elemento del DOM con removeChild()

// Actualiza contadores de especies

// Añade animación de "muerte" antes de eliminar

}

function actualizarEstadisticas() {

// Cuenta organismos actuales en el DOM

// Actualiza los elementos span con los nuevos valores

// Calcula balances del ecosistema

}

function registrarEvento(mensaje) {

// Crea elemento de texto dinámicamente

// Añade timestamp y descripción del evento

// Inserta en la lista de eventos con insertBefore()

// Limita a los últimos 10 eventos

}

iniciarEcosistema();