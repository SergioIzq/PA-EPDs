<?php
// Devuelve los valores que más se repiten en una lista (varios si hay empate) y cuántas veces salen
function masFrecuentes($lista) {
    $veces = array_count_values($lista); // Vector con cada valor distinto y las veces que aparece
    $maximo = max($veces);
    return array('nombres' => array_keys($veces, $maximo), 'veces' => $maximo); // Con un segundo dato, array_keys devuelve solo las claves que tienen ese valor
}

// Lee los registros, los agrupa por socio y calcula las estadísticas de cada socio y de toda la instalación
function procesarRegistrosActividades($cadenaEntrada) {
    $socios = array();
    $actividades = array();
    $instructores = array();
    $duraciones = array();
    $fechas = array();

    // Se recorre la cadena línea por línea
    $lineas = explode("\n", trim($cadenaEntrada));
    foreach ($lineas as $linea) {
        $campos = explode('@@', trim($linea)); // El trim quita también el \r que dejan los saltos de línea de Windows

        // Solo se tienen en cuenta las líneas que traen los 6 datos
        if (count($campos) == 6) {
            $id = $campos[0];
            $actividad = $campos[1];
            $minutos = (int) $campos[2];
            $fecha = date_create_from_format('!d/m/Y', $campos[3]); // El ! pone la hora a 00:00 para que solo cuenten los días
            $instructor = $campos[4];

            // Se guardan los datos en la ficha del socio
            $socios[$id]['minutos'][] = $minutos;
            $socios[$id]['actividades'][] = $actividad;
            $socios[$id]['instructores'][] = $instructor;
            $socios[$id]['fechas'][] = $fecha;

            // Y también en las listas de toda la instalación
            $actividades[] = $actividad;
            $instructores[] = $instructor;
            $duraciones[] = $minutos;
            $fechas[] = $fecha;
        }
    }
    ksort($socios); // Ordena los socios por su ID

    // Estadísticas de cada socio
    $resumenSocios = array();
    $minutosSocios = array();
    foreach ($socios as $id => $datos) {
        $primera = min($datos['fechas']);
        $ultima = max($datos['fechas']);
        $resumenSocios[$id] = array(
            'minutos' => array_sum($datos['minutos']),
            'sesiones' => count($datos['actividades']),
            'favoritas' => masFrecuentes($datos['actividades'])['nombres'],
            'primera' => date_format($primera, 'd/m/Y'),
            'ultima' => date_format($ultima, 'd/m/Y'),
            'dias' => date_interval_format(date_diff($primera, $ultima), '%a'), // El formato %a da los días totales entre las dos fechas
            'principales' => masFrecuentes($datos['instructores'])['nombres']
        );
        $minutosSocios[$id] = $resumenSocios[$id]['minutos'];
    }

    // Estadísticas de toda la instalación
    $maximoMinutos = max($minutosSocios);
    $globales = array(
        'masActivos' => array_keys($minutosSocios, $maximoMinutos),
        'maximoMinutos' => $maximoMinutos,
        'popular' => masFrecuentes($actividades),
        'solicitado' => masFrecuentes($instructores),
        'promedio' => array_sum($duraciones) / count($duraciones),
        'registros' => count($duraciones),
        'listaSocios' => array_keys($resumenSocios),
        'listaActividades' => array_keys(array_count_values($actividades)), // Cada actividad una sola vez
        'numInstructores' => count(array_count_values($instructores)),
        'desde' => date_format(min($fechas), 'd/m/Y'),
        'hasta' => date_format(max($fechas), 'd/m/Y'),
        'duracionMinima' => min($duraciones),
        'duracionMaxima' => max($duraciones)
    );

    return array('socios' => $resumenSocios, 'globales' => $globales);
}

// Escribe la tabla HTML con el resumen de cada socio
function mostrarTablaSocios($socios) {
    echo '<table>';
    echo '<thead><tr><th>ID del socio</th><th>Total de minutos</th><th>Actividades realizadas</th><th>Actividad favorita</th><th>Período de actividad</th><th>Días activo</th><th>Instructor principal</th></tr></thead>';
    echo '<tbody>';
    foreach ($socios as $id => $datos) {
        echo '<tr>';
        echo '<td>' . $id . '</td>';
        echo '<td>' . $datos['minutos'] . '</td>';
        echo '<td>' . $datos['sesiones'] . '</td>';
        echo '<td>' . implode(', ', $datos['favoritas']) . '</td>'; // Si hay empate se ponen todas separadas por comas
        echo '<td>' . $datos['primera'] . ' - ' . $datos['ultima'] . '</td>';
        echo '<td>' . $datos['dias'] . '</td>';
        echo '<td>' . implode(', ', $datos['principales']) . '</td>';
        echo '</tr>';
    }
    echo '</tbody>';
    echo '</table>';
}

// Escribe las estadísticas de toda la instalación
function mostrarEstadisticasGlobales($globales) {
    echo '<h2>Estadísticas globales</h2>';
    echo '<ul>';
    echo '<li>Socio más activo: ' . implode(', ', $globales['masActivos']) . ' (' . $globales['maximoMinutos'] . ' minutos)</li>';
    echo '<li>Actividad más popular: ' . implode(', ', $globales['popular']['nombres']) . ' (' . $globales['popular']['veces'] . ' sesiones)</li>';
    echo '<li>Instructor más solicitado: ' . implode(', ', $globales['solicitado']['nombres']) . ' (' . $globales['solicitado']['veces'] . ' sesiones)</li>';
    echo '<li>Promedio por sesión: ' . round($globales['promedio'], 1) . ' minutos</li>';
    echo '</ul>';

    echo '<h2>Datos procesados</h2>';
    echo '<ul>';
    echo '<li>' . $globales['registros'] . ' registros de actividades</li>';
    $numSocios = count($globales['listaSocios']);
    echo '<li>' . $numSocios . ' socios diferentes (' . $globales['listaSocios'][0] . ' a ' . $globales['listaSocios'][$numSocios - 1] . ')</li>'; // Como están ordenados, el primero y el último marcan el rango
    echo '<li>' . count($globales['listaActividades']) . ' actividades: ' . implode(', ', $globales['listaActividades']) . '</li>';
    echo '<li>' . $globales['numInstructores'] . ' instructores diferentes</li>';
    echo '<li>Fechas desde ' . $globales['desde'] . ' hasta ' . $globales['hasta'] . '</li>';
    echo '<li>Duraciones de ' . $globales['duracionMinima'] . ' a ' . $globales['duracionMaxima'] . ' minutos</li>';
    echo '</ul>';
}

// Registros de entrada del enunciado
$registros = <<<REGISTROS
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
REGISTROS;

$informe = procesarRegistrosActividades($registros);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Informe de actividades</title>
    <link rel="stylesheet" href="estilos.css">
</head>
<body>
    <h1>Informe de actividades de los socios</h1>

    <h2>Resumen por socio</h2>
    <?php
    mostrarTablaSocios($informe['socios']);
    mostrarEstadisticasGlobales($informe['globales']);
    ?>
</body>
</html>
