<?php
/**
 * Ej1 - Asignación aleatoria de turnos de trabajo.
 */

// Paso 1: empleados y especialidades
$empleados = array(
    'Ana López' => 'Entrenadora Personal',
    'Miguel Torres' => 'Socorrista',
    'Carmen Ruiz' => 'Recepcionista',
    'David García' => 'Monitor de Piscina',
    'Laura Martín' => 'Instructora de Spinning',
    'Javier Moreno' => 'Mantenimiento'
);

// Paso 2: turnos y horarios
$turnos = array(
    'Mañana' => '07:00-15:00',
    'Tarde' => '15:00-23:00',
    'Noche' => '23:00-07:00'
);

/**
 * Selecciona entre 3 y count($empleados) empleados al azar y los reparte entre
 * los turnos. Cada empleado aparece en un único turno y ningún turno queda vacío.
 *
 * @return array nombreTurno => vector de nombres de empleados
 */
function asignarTurnos($empleados, $turnos)
{
    $nombresTurnos = array_keys($turnos);
    $numTurnos = count($nombresTurnos);

    // Paso 3: cuántos empleados trabajan hoy (nunca menos que turnos a cubrir)
    $numTrabajadores = rand(max(3, $numTurnos), count($empleados));

    // Paso 4: elegir empleados distintos al azar (barajar y quedarse con los primeros)
    $nombres = array_keys($empleados);
    shuffle($nombres);
    $seleccionados = array_slice($nombres, 0, $numTrabajadores);

    $asignacion = array_fill_keys($nombresTurnos, array());
    foreach ($seleccionados as $i => $nombre) {
        // Los primeros cubren un turno cada uno; el resto va a un turno aleatorio
        $turno = $i < $numTurnos ? $nombresTurnos[$i] : $nombresTurnos[rand(0, $numTurnos - 1)];
        $asignacion[$turno][] = $nombre;
    }
    return $asignacion;
}

$asignacion = asignarTurnos($empleados, $turnos);
?>
<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>EPD 6 - Ej1 Turnos</title>
        <style>
            table { border-collapse: separate; border: 1px solid #888; }
            th, td { border: 1px solid #888; padding: 2px 6px; vertical-align: middle; }
        </style>
    </head>
    <body>
        <h1>Turnos del día</h1>
        <!-- Paso 5: tabla generada dinámicamente -->
        <table>
            <tr><th>Turno</th><th>Horario</th><th>Empleados Asignados</th></tr>
            <?php foreach ($asignacion as $turno => $asignados) { ?>
                <tr>
                    <td><?= $turno ?></td>
                    <td><?= $turnos[$turno] ?></td>
                    <td>
                        <?php
                        $lineas = array();
                        foreach ($asignados as $nombre) {
                            $lineas[] = $nombre . ' (' . $empleados[$nombre] . ')';
                        }
                        echo implode('<br/>', $lineas);
                        ?>
                    </td>
                </tr>
            <?php } ?>
        </table>
        <p>Trabajan hoy <?= count($asignacion, COUNT_RECURSIVE) - count($asignacion) ?>
            de <?= count($empleados) ?> empleados. Recargue la página para otra asignación.</p>
    </body>
</html>
