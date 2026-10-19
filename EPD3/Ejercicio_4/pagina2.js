document.getElementById("sortear").addEventListener("click", function () {
    const nombres = document.getElementById("inscritos").value
            .split(",")
            .map((nombre) => nombre.trim())
            .filter((nombre) => nombre !== "");

    // Snippet: https://css-tricks.com/snippets/javascript/remove-duplicates-from-an-array/
    const unicos = [...new Set(nombres)];

    if (unicos.length === 0) {
        document.getElementById("participantes").textContent = "No hay participantes.";
        document.getElementById("ganador").textContent = "";
        return;
    }

    // Snippet: https://css-tricks.com/snippets/javascript/select-random-item-array/
    const ganador = unicos[Math.floor(Math.random() * unicos.length)];

    document.getElementById("participantes").textContent = "Participantes (" + unicos.length + "): " + unicos.join(", ");
    document.getElementById("ganador").textContent = "Ganador/a: " + ganador;
});
