<?php
/**
 * EPD 6 - Ej1: Asignación aleatoria de turnos de trabajo.
 */

// Paso 1: empleados y su especialidad
$empleados = array(
    'Ana López'     => 'Entrenadora Personal',
    'Miguel Torres' => 'Socorrista',
    'Carmen Ruiz'   => 'Recepcionista',
    'David García'  => 'Monitor de Piscina',
    'Laura Martín'  => 'Instructora de Spinning',
    'Javier Moreno' => 'Mantenimiento',
    'Sara Jiménez'  => 'Fisioterapeuta',
    'Pablo Navarro' => 'Monitor de Sala'
);

// Paso 2: turnos y su horario
$turnos = array(
    'Mañana' => '07:00-15:00',
    'Tarde'  => '15:00-23:00',
    'Noche'  => '23:00-07:00'
);

/**
 * Paso 4 (a): elige al azar $cantidad empleados distintos.
 * Cada nombre elegido se elimina de la lista de candidatos, por lo que
 * ningún empleado puede salir dos veces.
 *
 * @return array Nombres seleccionados, en orden aleatorio.
 */
function seleccionarEmpleados(array $empleados, int $cantidad): array
{
    $candidatos = array_keys($empleados);
    $seleccionados = array();

    for ($i = 0; $i < $cantidad; $i++) {
        $posicion = rand(0, count($candidatos) - 1);
        $seleccionados[] = $candidatos[$posicion];
        array_splice($candidatos, $posicion, 1);
    }

    return $seleccionados;
}

/**
 * Paso 4 (b): reparte los empleados seleccionados entre los turnos.
 * Los primeros empleados (ya en orden aleatorio) cubren un turno cada uno,
 * garantizando que ningún turno quede vacío; el resto va a un turno al azar.
 *
 * @return array Turno => lista de nombres asignados.
 */
function asignarTurnos(array $seleccionados, array $turnos): array
{
    $nombresTurnos = array_keys($turnos);
    $numTurnos = count($nombresTurnos);
    $asignacion = array_fill_keys($nombresTurnos, array());

    foreach ($seleccionados as $indice => $nombre) {
        $turno = $indice < $numTurnos
            ? $nombresTurnos[$indice]
            : $nombresTurnos[rand(0, $numTurnos - 1)];
        $asignacion[$turno][] = $nombre;
    }

    return $asignacion;
}

// Paso 3: cuántos empleados trabajan hoy (entre 3 y el total). Nunca menos
// que el número de turnos, para que todos queden cubiertos.
$minimo = max(3, count($turnos));
$numTrabajan = rand($minimo, count($empleados));

$seleccionados = seleccionarEmpleados($empleados, $numTrabajan);
$asignacion = asignarTurnos($seleccionados, $turnos);
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>EPD 6 - Ej1: Turnos del día</title>
    </head>
    <body>
        <h2>Turnos del día</h2>
        <p>Empleados que trabajan hoy: <?= $numTrabajan ?> de <?= count($empleados) ?></p>

        <!-- Paso 5: tabla generada dinámicamente -->
        <table border="1">
            <tr>
                <th>Turno</th>
                <th>Horario</th>
                <th>Empleados Asignados</th>
            </tr>
            <?php foreach ($turnos as $turno => $horario) { ?>
            <tr>
                <td><?= htmlspecialchars($turno) ?></td>
                <td><?= htmlspecialchars($horario) ?></td>
                <td>
                    <?php
                        $lineas = array();
                        foreach ($asignacion[$turno] as $nombre) {
                            $lineas[] = htmlspecialchars($nombre . ' (' . $empleados[$nombre] . ')');
                        }
                        echo implode('<br/>', $lineas);
                    ?>
                </td>
            </tr>
            <?php } ?>
        </table>
    </body>
</html>
