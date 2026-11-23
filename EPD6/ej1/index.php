<?php
// Ej1 - Asignación aleatoria de turnos

$empleados = array(
    'Ana López'     => 'Entrenadora Personal',
    'Miguel Torres' => 'Socorrista',
    'Carmen Ruiz'   => 'Recepcionista',
    'David García'  => 'Monitor de Piscina',
    'Laura Martín'  => 'Instructora de Spinning',
    'Javier Moreno' => 'Mantenimiento'
);

$turnos = array(
    'Mañana' => '07:00-15:00',
    'Tarde'  => '15:00-23:00',
    'Noche'  => '23:00-07:00'
);

function asignarTurnos(array $empleados, array $turnos): array
{
    $nombres = array_keys($empleados);
    $nombresTurnos = array_keys($turnos);

    // mínimo 3 pero nunca menos que el número de turnos
    $cantidad = rand(max(3, count($nombresTurnos)), count($nombres));

    // selecciona aleatoriamente sin repetir
    shuffle($nombres);
    $trabajadores = array_slice($nombres, 0, $cantidad);

    $asignacion = array_fill_keys($nombresTurnos, array());

    foreach ($trabajadores as $i => $nombre) {
        // los primeros empleados cubren un turno cada uno, el resto turno aleatorio
        $turno = ($i < count($nombresTurnos))? $nombresTurnos[$i]: $nombresTurnos[array_rand($nombresTurnos)];
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
    <title>Turnos del día</title>
</head>
<body>
    <h1>Turnos del día</h1>
    <table border="1" cellpadding="4">
        <tr>
            <th>Turno</th>
            <th>Horario</th>
            <th>Empleados Asignados</th>
        </tr>
        <?php foreach ($asignacion as $turno => $trabajadores): ?>
            <tr>
                <td><?= htmlspecialchars($turno) ?></td>
                <td><?= htmlspecialchars($turnos[$turno]) ?></td>
                <td>
                    <?php foreach ($trabajadores as $nombre): ?>
                        <?= htmlspecialchars($nombre) ?> (<?= htmlspecialchars($empleados[$nombre]) ?>)<br>
                    <?php endforeach; ?>
                </td>
            </tr>
        <?php endforeach; ?>
    </table>
</body>
</html>