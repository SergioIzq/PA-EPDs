let actividades = [
    {nombre: "futbol", instructor: "carlos", plazas: 0},
    {nombre: "javascript", instructor: "pepe", plazas: 100},
    {nombre: "pinpon", instructor: "paco", plazas: 1},
    {nombre: "tenis", instructor: "messi", plazas: 200},
    {nombre: "ajedrez", instructor: "Magnus", plazas: 9},
]

/*
    muy simple: bucle for que itera la lsita.
    También uso document.writeln porque odio el output por consola...
*/

function mostrarActividades() {
    document.getElementById("resultado").innerHTML = "<Strong>Actividades disponibles: </Strong><br>";
    for(let i = 0; i<actividades.length;i++) {
        document.getElementById("resultado").innerHTML += `${actividades[i].nombre}: ${actividades[i].instructor} - ${actividades[i].plazas} plazas<br>`;
    }
}
/* 
    un poco rudimentario creo pero es bastante sólido.
    si no lo encuentra te deja volver a probar, pero si no hay
    plazas cancela la operacion y te deja con el disgusto
*/

function reservarPlaza() {
    let found = false;
    while(!found){
        let actividad = prompt('dime el nombre de la actividad porfa');
        
            for(let i=0;i<actividades.length;i++){
                    if(actividades[i].nombre == actividad){
                        found = true;
                        if(actividades[i].plazas>0){
                            actividades[i].plazas--;
                        }else{
                            alert("operacion cancelada: No hay plazas disponibles");
                        }
                    }
            }
            if(!found){
                alert(`${actividad} no existe`);
            }
        }
}

function liberarPlaza() {
    let found = false;
    while(!found){
        let actividad = prompt('dime el nombre de la actividad porfa');
        
            for(let i=0;i<actividades.length;i++){
                    if(actividades[i].nombre == actividad){
                        found = true;
                        actividades[i].plazas++;
                    }
            }
            if(!found){
                alert(`${actividad} no existe`);
            }
        }
}

function agregarActividad(){
    let nom = prompt("Nombre de la actividad");
    let inst = prompt("Instructor/a de la actividad");
    let plaz = prompt("Número de plazas");

    act = {nombre: nom, instructor: inst, plazas: plaz};

    actividades.push(act);
}

function mostrarOpciones() {
    
    let opcion = prompt("¿Qué operación desea realizar? \n1. Mostrar actividades \n2. Reservar plaza \n3. Liberar plaza \n4. Agregar actividad \n5. Salir")
    switch(opcion) {
        case "1":
            break;
        case "2":
            reservarPlaza();
            break;
        case "3":
            liberarPlaza();
            break;
        case "4":
            agregarActividad();
            break;
        case "5":
            break;
    }
    mostrarActividades();
}

//que pasa hackers