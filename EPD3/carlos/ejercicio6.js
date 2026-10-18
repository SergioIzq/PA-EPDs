function solicitaQR(){
    let enlace = prompt("introduce el enlace: ");

    let url = new URL(enlace);                      //Objeto URL
    let parametros = url.searchParams;              //busca parametros despues del ?

    let actividad = parametros.get("actividad");
    let duracion = parametros.get("duracion");
    let id_participante = parametros.get("id_participante");

    // VALIDAR ACTIVIDAD
    let actividadesPermitidas = [
        "spinning", "yoga", "pilates", "zumba",
        "crossfit", "aqua", "bodycombat", "trx"
    ];

    if (!actividadesPermitidas.includes(actividad)) {
        alert("Error: la actividad no está permitida.");
        return;
    }

    // VALIDAR DURACIÓN
    if (duracion < 30 || duracion > 120) {
        alert("Error: la duración debe estar entre 30 y 120 minutos.");
        return;
    }

    // VALIDAR PARTICIPANTES
    if (id_participante < 1 || id_participante > 50) {
        alert("Error: el número de participantes debe estar entre 1 y 50.");
        return;
    }

    //AÑADIR DATOS A LA TABLA

    document.getElementById("actividad").innerHTML = actividad;
    document.getElementById("duracion").innerHTML = duracion;
    document.getElementById("id").innerHTML = id_participante;

    //CALCULAR COSTE

    let coste = 1.5;

    if(duracion>30){
        coste += 0.5;
    }

    if(id_participante<=15){
        coste = coste*0.9;
    }

    document.getElementById("coste").innerHTML = coste;

    document.getElementById("valid1").innerHTML = "CORRECTA";
    document.getElementById("valid2").innerHTML = "CORRECTA";
    document.getElementById("valid3").innerHTML = "CORRECTA";
    document.getElementById("reserva").innerHTML = "RESERVA REALIZADA";
    
}

solicitaQR();
