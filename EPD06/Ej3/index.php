<?php
/**
 * Ej3 - Procesamiento de registros de actividades e informe consolidado.
 *
 * Formato de cada línea:
 * <ID_SOCIO>@@<ACTIVIDAD>@@<DURACION_MINUTOS>@@<FECHA>@@<INSTRUCTOR>@@<PISTA>
 */

const SEPARADOR_CAMPOS = '@@';
const FORMATO_FECHA = '!d/m/Y';   // "!" pone la hora a 00:00:00

/** Claves con el valor máximo de un vector clave => contador (varias si hay empate). */
function clavesMaximas($contadores)
{
    return array_keys($contadores, max($contadores));
}

/** Suma 1 al contador $clave del vector $contadores. */
function incrementar(&$contadores, $clave, $cantidad = 1)
{
    $contadores[$clave] = (isset($contadores[$clave]) ? $contadores[$clave] : 0) + $cantidad;
}

/**
 * Procesa la cadena de registros línea por línea, agrupa los datos por socio y
 * calcula las estadísticas por socio y globales.
 *
 * @return array ['socios' => [id => estadísticas], 'globales' => estadísticas]
 */
function procesarRegistrosActividades($cadenaEntrada)
{
    $socios = array();
    $actividades = array();     // actividad => sesiones (global)
    $instructores = array();    // instructor => sesiones (global)
    $minutosTotales = 0;
    $numRegistros = 0;
    $duracionMin = PHP_INT_MAX;
    $duracionMax = 0;
    $fechaMin = null;
    $fechaMax = null;

    // a) Línea por línea (acepta \n y \r\n e ignora líneas vacías)
    foreach (explode("\n", $cadenaEntrada) as $linea) {
        $linea = trim($linea);
        if ($linea === '') {
            continue;
        }
        $campos = explode(SEPARADOR_CAMPOS, $linea);
        if (count($campos) !== 6) {
            continue;   // línea mal formada
        }
        list($id, $actividad, $minutos, $textoFecha, $instructor) = array_map('trim', $campos);
        $minutos = (int) $minutos;
        $fecha = date_create_from_format(FORMATO_FECHA, $textoFecha);
        if ($fecha === false) {
            continue;   // fecha no válida
        }

        // b) Agrupar por socio
        if (!isset($socios[$id])) {
            $socios[$id] = array(
                'minutos' => 0, 'sesiones' => 0,
                'actividades' => array(), 'instructores' => array(),
                'primera' => $fecha, 'ultima' => $fecha,
            );
        }
        $socio = &$socios[$id];
        $socio['minutos'] += $minutos;
        $socio['sesiones']++;
        incrementar($socio['actividades'], $actividad);
        incrementar($socio['instructores'], $instructor);
        if ($fecha < $socio['primera']) {
            $socio['primera'] = $fecha;
        }
        if ($fecha > $socio['ultima']) {
            $socio['ultima'] = $fecha;
        }
        unset($socio);

        // Acumulados globales
        incrementar($actividades, $actividad);
        incrementar($instructores, $instructor);
        $minutosTotales += $minutos;
        $numRegistros++;
        $duracionMin = min($duracionMin, $minutos);
        $duracionMax = max($duracionMax, $minutos);
        if ($fechaMin === null || $fecha < $fechaMin) {
            $fechaMin = $fecha;
        }
        if ($fechaMax === null || $fecha > $fechaMax) {
            $fechaMax = $fecha;
        }
    }

    if ($numRegistros === 0) {
        return array('socios' => array(), 'globales' => null);
    }

    // c) Estadísticas derivadas por socio
    ksort($socios);
    $minutosPorSocio = array();
    foreach ($socios as $id => &$socio) {
        $socio['favoritas'] = clavesMaximas($socio['actividades']);
        $socio['principales'] = clavesMaximas($socio['instructores']);
        $socio['dias'] = (int) date_interval_format(date_diff($socio['primera'], $socio['ultima']), '%a');
        $minutosPorSocio[$id] = $socio['minutos'];
    }
    unset($socio);

    $globales = array(
        'sociosActivos' => clavesMaximas($minutosPorSocio),
        'maxMinutos' => max($minutosPorSocio),
        'actividadesPopulares' => clavesMaximas($actividades),
        'maxSesionesActividad' => max($actividades),
        'instructoresSolicitados' => clavesMaximas($instructores),
        'maxSesionesInstructor' => max($instructores),
        'promedioSesion' => $minutosTotales / $numRegistros,
        'registros' => $numRegistros,
        'numSocios' => count($socios),
        'actividades' => array_keys($actividades),
        'instructores' => array_keys($instructores),
        'fechaMin' => $fechaMin,
        'fechaMax' => $fechaMax,
        'duracionMin' => $duracionMin,
        'duracionMax' => $duracionMax,
    );

    return array('socios' => $socios, 'globales' => $globales);
}

/** Une una lista con comas, escapando cada elemento para HTML. */
function listaHtml($elementos)
{
    return implode(', ', array_map('htmlspecialchars', $elementos));
}

/** Genera la tabla HTML por socio y el bloque de estadísticas globales. */
function generarInformeHtml($informe)
{
    if ($informe['globales'] === null) {
        return '<p>No hay registros válidos que procesar.</p>';
    }

    $html = '<table><tr><th>ID socio</th><th>Total minutos</th><th>Nº actividades</th>'
            . '<th>Actividad favorita</th><th>Período de actividad</th><th>Días activo</th>'
            . '<th>Instructor principal</th></tr>';
    foreach ($informe['socios'] as $id => $s) {
        $html .= '<tr><td>' . htmlspecialchars($id) . '</td>'
                . '<td>' . $s['minutos'] . '</td>'
                . '<td>' . $s['sesiones'] . '</td>'
                . '<td>' . listaHtml($s['favoritas']) . '</td>'
                . '<td>' . date_format($s['primera'], 'd/m/Y') . ' - ' . date_format($s['ultima'], 'd/m/Y') . '</td>'
                . '<td>' . $s['dias'] . '</td>'
                . '<td>' . listaHtml($s['principales']) . '</td></tr>';
    }
    $html .= '</table>';

    $g = $informe['globales'];
    $html .= '<h2>Estadísticas globales</h2><ul>'
            . '<li>Socio más activo: ' . listaHtml($g['sociosActivos']) . " ({$g['maxMinutos']} minutos)</li>"
            . '<li>Actividad más popular: ' . listaHtml($g['actividadesPopulares']) . " ({$g['maxSesionesActividad']} sesiones)</li>"
            . '<li>Instructor más solicitado: ' . listaHtml($g['instructoresSolicitados']) . " ({$g['maxSesionesInstructor']} sesiones)</li>"
            . '<li>Promedio por sesión: ' . round($g['promedioSesion'], 1) . ' minutos</li>'
            . '</ul>';

    $html .= '<h2>Características del conjunto de datos</h2><ul>'
            . "<li>{$g['registros']} registros de actividades</li>"
            . "<li>{$g['numSocios']} socios diferentes</li>"
            . '<li>' . count($g['actividades']) . ' actividades: ' . listaHtml($g['actividades']) . '</li>'
            . '<li>' . count($g['instructores']) . ' instructores: ' . listaHtml($g['instructores']) . '</li>'
            . '<li>Fechas desde ' . date_format($g['fechaMin'], 'd/m/Y') . ' hasta ' . date_format($g['fechaMax'], 'd/m/Y') . '</li>'
            . "<li>Duraciones de {$g['duracionMin']} a {$g['duracionMax']} minutos</li>"
            . '</ul>';

    return $html;
}

$registros = <<<DATOS
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

$informe = procesarRegistrosActividades($registros);
?>
<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>EPD 6 - Ej3 Informe de actividades</title>
        <style>
            table { border-collapse: collapse; }
            th, td { border: 1px solid #888; padding: 3px 8px; }
            th { background: #eee; }
        </style>
    </head>
    <body>
        <h1>Informe de actividades por socio</h1>
        <?= generarInformeHtml($informe) ?>
    </body>
</html>
