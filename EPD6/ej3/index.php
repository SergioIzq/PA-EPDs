<?php
//devuelve todos los nombres que tengan el contador más alto
function obtenerMasFrecuentes($contadores)
{
    if (empty($contadores)) {
        return array();
    }

    return array_keys($contadores, max($contadores));
}

function procesarRegistrosActividades($cadenaEntrada)
{
    $socios = array();
    $actividadesGlobales = array();
    $instructoresGlobales = array();
    $totalMinutos = 0;
    $totalSesiones = 0;

    $lineas = explode("\n", trim($cadenaEntrada));

    foreach ($lineas as $linea) {
        $linea = trim($linea);

        if ($linea === '') {
            continue;
        }

        $datos = explode('@@', $linea);

        if (count($datos) !== 6) {
            throw new InvalidArgumentException(
                "Cada registro debe tener seis campos."
            );
        }

        $id = trim($datos[0]);
        $actividad = trim($datos[1]);
        $duracion = trim($datos[2]);
        $textoFecha = trim($datos[3]);
        $instructor = trim($datos[4]);
        $pista = trim($datos[5]);

        $fecha = date_create_from_format('!d/m/Y', $textoFecha);

        if (
            !$fecha ||
            date_format($fecha, 'd/m/Y') !== $textoFecha
        ) {
            throw new InvalidArgumentException(
                "Fecha incorrecta: " . $textoFecha
            );
        }

        if (!ctype_digit($duracion)) {
            throw new InvalidArgumentException(
                "La duración debe ser un número entero positivo o cero."
            );
        }

        $minutos = (int) $duracion;

        //si es la primera vez que aparece el socio, lo añadimos
        if (!isset($socios[$id])) {
            $socios[$id] = array(
                'minutos' => 0,
                'sesiones' => 0,
                'actividades' => array(),
                'instructores' => array(),
                'primeraFecha' => $fecha,
                'ultimaFecha' => $fecha
            );
        }

        $socios[$id]['minutos'] += $minutos;
        $socios[$id]['sesiones']++;

        if (!isset($socios[$id]['actividades'][$actividad])) {
            $socios[$id]['actividades'][$actividad] = 0;
        }

        $socios[$id]['actividades'][$actividad]++;

        if (!isset($socios[$id]['instructores'][$instructor])) {
            $socios[$id]['instructores'][$instructor] = 0;
        }

        $socios[$id]['instructores'][$instructor]++;

        //buscamos la primera y la última fecha de cada socio
        if ($fecha < $socios[$id]['primeraFecha']) {
            $socios[$id]['primeraFecha'] = $fecha;
        }

        if ($fecha > $socios[$id]['ultimaFecha']) {
            $socios[$id]['ultimaFecha'] = $fecha;
        }

        if (!isset($actividadesGlobales[$actividad])) {
            $actividadesGlobales[$actividad] = 0;
        }

        $actividadesGlobales[$actividad]++;

        if (!isset($instructoresGlobales[$instructor])) {
            $instructoresGlobales[$instructor] = 0;
        }

        $instructoresGlobales[$instructor]++;

        $totalMinutos += $minutos;
        $totalSesiones++;
    }

    $minutosPorSocio = array();

    foreach ($socios as $id => $socio) {
        $diferencia = date_diff(
            $socio['primeraFecha'],
            $socio['ultimaFecha']
        );

        $socios[$id]['dias'] = date_interval_format(
            $diferencia,
            '%a'
        );

        $socios[$id]['favoritas'] = obtenerMasFrecuentes(
            $socio['actividades']
        );

        $socios[$id]['principales'] = obtenerMasFrecuentes(
            $socio['instructores']
        );

        $minutosPorSocio[$id] = $socio['minutos'];
    }

    $promedio = 0;

    if ($totalSesiones > 0) {
        $promedio = $totalMinutos / $totalSesiones;
    }

    return array(
        'socios' => $socios,
        'sociosMasActivos' => obtenerMasFrecuentes($minutosPorSocio),
        'actividadesPopulares' => obtenerMasFrecuentes($actividadesGlobales),
        'instructoresSolicitados' => obtenerMasFrecuentes($instructoresGlobales),
        'minutosPorSocio' => $minutosPorSocio,
        'actividadesGlobales' => $actividadesGlobales,
        'instructoresGlobales' => $instructoresGlobales,
        'totalMinutos' => $totalMinutos,
        'totalSesiones' => $totalSesiones,
        'promedio' => $promedio
    );
}

//para mostrar los textos en HTML
function escapar($texto)
{
    return htmlspecialchars($texto, ENT_QUOTES, 'UTF-8');
}

$cadenaEntrada = <<<DATOS
SOC001@@Spinning@@45@@15/01/2025@@Ana López@@Sala1
SOC001@@Natación@@30@@16/01/2025@@Miguel Torres@@Piscina1
SOC002@@Spinning@@45@@15/01/2025@@Ana López@@Sala1
SOC001@@Yoga@@60@@17/01/2025@@Carmen Ruiz@@Sala2
SOC003@@Natación@@30@@16/01/2025@@Miguel Torres@@Piscina1
SOC002@@Tenis@@90@@18/01/2025@@David García@@Pista1
SOC001@@Spinning@@45@@19/01/2025@@Ana López@@Sala1
SOC004@@Pilates@@50@@15/01/2025@@Laura Martín@@Sala3
SOC003@@Spinning@@45@@17/01/2025@@Ana López@@Sala1
SOC005@@Natación@@40@@16/01/2025@@Miguel Torres@@Piscina1
SOC004@@Yoga@@60@@18/01/2025@@Carmen Ruiz@@Sala2
SOC002@@Natación@@35@@20/01/2025@@Miguel Torres@@Piscina1
SOC006@@Tenis@@120@@17/01/2025@@David García@@Pista1
SOC001@@Pilates@@50@@21/01/2025@@Laura Martín@@Sala3
SOC007@@Spinning@@45@@18/01/2025@@Ana López@@Sala1
SOC003@@Yoga@@60@@20/01/2025@@Carmen Ruiz@@Sala2
SOC005@@Tenis@@90@@19/01/2025@@David García@@Pista1
SOC008@@Natación@@25@@17/01/2025@@Miguel Torres@@Piscina1
SOC006@@Spinning@@45@@21/01/2025@@Ana López@@Sala1
SOC004@@Natación@@40@@22/01/2025@@Miguel Torres@@Piscina1
SOC007@@Pilates@@55@@20/01/2025@@Laura Martín@@Sala3
SOC002@@Yoga@@60@@22/01/2025@@Carmen Ruiz@@Sala2
SOC009@@Spinning@@45@@19/01/2025@@Ana López@@Sala1
SOC008@@Tenis@@75@@21/01/2025@@David García@@Pista1
SOC005@@Pilates@@50@@23/01/2025@@Laura Martín@@Sala3
SOC010@@Natación@@30@@20/01/2025@@Miguel Torres@@Piscina1
SOC003@@Spinning@@45@@24/01/2025@@Ana López@@Sala1
SOC006@@Yoga@@60@@23/01/2025@@Carmen Ruiz@@Sala2
SOC009@@Natación@@35@@22/01/2025@@Miguel Torres@@Piscina1
SOC001@@Tenis@@105@@25/01/2025@@David García@@Pista1
SOC007@@Spinning@@45@@24/01/2025@@Ana López@@Sala1
SOC010@@Pilates@@50@@22/01/2025@@Laura Martín@@Sala3
SOC004@@Spinning@@45@@25/01/2025@@Ana López@@Sala1
SOC008@@Yoga@@60@@25/01/2025@@Carmen Ruiz@@Sala2
SOC002@@Spinning@@45@@26/01/2025@@Ana López@@Sala1
SOC005@@Natación@@40@@26/01/2025@@Miguel Torres@@Piscina1
SOC011@@Tenis@@80@@23/01/2025@@David García@@Pista1
SOC006@@Pilates@@55@@26/01/2025@@Laura Martín@@Sala3
SOC012@@Spinning@@45@@24/01/2025@@Ana López@@Sala1
SOC003@@Natación@@30@@27/01/2025@@Miguel Torres@@Piscina1
SOC009@@Yoga@@60@@26/01/2025@@Carmen Ruiz@@Sala2
SOC011@@Spinning@@45@@27/01/2025@@Ana López@@Sala1
SOC007@@Natación@@40@@28/01/2025@@Miguel Torres@@Piscina1
SOC010@@Tenis@@95@@27/01/2025@@David García@@Pista1
SOC012@@Pilates@@50@@28/01/2025@@Laura Martín@@Sala3
SOC001@@Spinning@@45@@29/01/2025@@Ana López@@Sala1
SOC008@@Natación@@35@@28/01/2025@@Miguel Torres@@Piscina1
SOC004@@Yoga@@60@@29/01/2025@@Carmen Ruiz@@Sala2
SOC005@@Spinning@@45@@30/01/2025@@Ana López@@Sala1
SOC011@@Pilates@@55@@30/01/2025@@Laura Martín@@Sala3
SOC006@@Natación@@40@@30/01/2025@@Miguel Torres@@Piscina1
DATOS;

$resultado = procesarRegistrosActividades($cadenaEntrada);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Ejercicio 3 - Registros de actividades</title>
    <style>
        table {
            border-collapse: collapse;
        }

        th, td {
            border: 1px solid #999;
            padding: 8px;
        }

        th {
            background-color: #eee;
        }
    </style>
</head>
<body>
    <h1>Resumen por socio</h1>

    <table>
        <thead>
            <tr>
                <th>ID del socio</th>
                <th>Total de minutos</th>
                <th>Número de actividades realizadas</th>
                <th>Actividad favorita</th>
                <th>Período de actividad</th>
                <th>Días activo</th>
                <th>Instructor principal</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($resultado['socios'] as $id => $socio) { ?>
                <tr>
                    <td><?= escapar($id) ?></td>
                    <td><?= $socio['minutos'] ?></td>
                    <td><?= $socio['sesiones'] ?></td>
                    <td>
                        <?= escapar(implode(', ', $socio['favoritas'])) ?>
                    </td>
                    <td>
                        <?= date_format($socio['primeraFecha'], 'd/m/Y') ?>
                        -
                        <?= date_format($socio['ultimaFecha'], 'd/m/Y') ?>
                    </td>
                    <td><?= $socio['dias'] ?></td>
                    <td>
                        <?= escapar(implode(', ', $socio['principales'])) ?>
                    </td>
                </tr>
            <?php } ?>
        </tbody>
    </table>

    <h2>Estadísticas globales</h2>

    <p>
        <strong>Socio más activo:</strong>
        <?php foreach ($resultado['sociosMasActivos'] as $id) { ?>
            <?= escapar($id) ?>
            (<?= $resultado['minutosPorSocio'][$id] ?> minutos)
        <?php } ?>
    </p>

    <p>
        <strong>Actividad más popular:</strong>
        <?php foreach ($resultado['actividadesPopulares'] as $actividad) { ?>
            <?= escapar($actividad) ?>
            (<?= $resultado['actividadesGlobales'][$actividad] ?> sesiones)
        <?php } ?>
    </p>

    <p>
        <strong>Instructor más solicitado:</strong>
        <?php foreach ($resultado['instructoresSolicitados'] as $instructor) { ?>
            <?= escapar($instructor) ?>
            (<?= $resultado['instructoresGlobales'][$instructor] ?> sesiones)
        <?php } ?>
    </p>

    <p>
        <strong>Promedio de minutos por sesión:</strong>
        <?= number_format($resultado['promedio'], 2, ',', '.') ?>
    </p>

    <p>
        Total de registros: <?= $resultado['totalSesiones'] ?>
        <br>
        Total de socios: <?= count($resultado['socios']) ?>
    </p>
</body>
</html>