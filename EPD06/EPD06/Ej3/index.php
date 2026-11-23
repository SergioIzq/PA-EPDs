<?php
/**
 * EPD 6 - Ej3: Procesamiento de registros de actividades de socios.
 *
 * Formato de cada línea:
 *   <ID_SOCIO>@@<ACTIVIDAD>@@<DURACION_MINUTOS>@@<FECHA>@@<INSTRUCTOR>@@<PISTA>
 */

const SEPARADOR_CAMPOS = '@@';
const NUM_CAMPOS = 6;
const FORMATO_FECHA = 'd/m/Y';

/**
 * Devuelve todas las claves cuyo valor es el máximo del vector
 * (más de una en caso de empate).
 */
function clavesConMaximo(array $conteo): array
{
    return empty($conteo) ? array() : array_keys($conteo, max($conteo), true);
}

/**
 * Suma 1 a $vector[$clave], creándola si no existe.
 */
function incrementar(array &$vector, string $clave, int $cantidad = 1): void
{
    $vector[$clave] = ($vector[$clave] ?? 0) + $cantidad;
}

/**
 * Procesa la cadena de registros línea por línea, agrupa los datos por socio
 * y calcula las estadísticas por socio y globales.
 *
 * @param string $cadenaEntrada Registros separados por saltos de línea.
 * @return array ['socios' => ..., 'globales' => ..., 'datos' => ...]
 */
function procesarRegistrosActividades(string $cadenaEntrada): array
{
    $socios = array();
    $conteoActividades = array();          // actividad => sesiones
    $conteoInstructores = array();         // instructor => sesiones
    $actividadesPorInstructor = array();   // instructor => [actividad => sesiones]
    $totalMinutos = 0;
    $totalSesiones = 0;
    $lineasDescartadas = 0;
    $duracionMinima = null;
    $duracionMaxima = null;
    $fechaMinima = null;
    $fechaMaxima = null;

    // a) Procesar línea a línea (admite saltos \n y \r\n)
    $lineas = explode("\n", str_replace("\r", '', $cadenaEntrada));

    foreach ($lineas as $linea) {
        $linea = trim($linea);
        if ($linea === '') {
            continue;
        }

        $campos = array_map('trim', explode(SEPARADOR_CAMPOS, $linea));
        $fecha = count($campos) === NUM_CAMPOS
            ? date_create_from_format('!' . FORMATO_FECHA, $campos[3])
            : false;

        // Se descartan las líneas con formato incorrecto
        if ($fecha === false || !ctype_digit($campos[2])) {
            $lineasDescartadas++;
            continue;
        }

        list($idSocio, $actividad, $duracion, , $instructor) = $campos;
        $duracion = (int) $duracion;

        // b) Agrupar por socio
        if (!isset($socios[$idSocio])) {
            $socios[$idSocio] = array(
                'minutos'      => 0,
                'sesiones'     => 0,
                'actividades'  => array(),
                'instructores' => array(),
                'primeraFecha' => $fecha,
                'ultimaFecha'  => $fecha
            );
        }

        $socio = &$socios[$idSocio];
        $socio['minutos'] += $duracion;
        $socio['sesiones']++;
        incrementar($socio['actividades'], $actividad);
        incrementar($socio['instructores'], $instructor);
        if ($fecha < $socio['primeraFecha']) {
            $socio['primeraFecha'] = $fecha;
        }
        if ($fecha > $socio['ultimaFecha']) {
            $socio['ultimaFecha'] = $fecha;
        }
        unset($socio);

        // Acumulados globales
        incrementar($conteoActividades, $actividad);
        incrementar($conteoInstructores, $instructor);
        if (!isset($actividadesPorInstructor[$instructor])) {
            $actividadesPorInstructor[$instructor] = array();
        }
        incrementar($actividadesPorInstructor[$instructor], $actividad);
        $totalMinutos += $duracion;
        $totalSesiones++;
        $duracionMinima = $duracionMinima === null ? $duracion : min($duracionMinima, $duracion);
        $duracionMaxima = $duracionMaxima === null ? $duracion : max($duracionMaxima, $duracion);
        $fechaMinima = ($fechaMinima === null || $fecha < $fechaMinima) ? $fecha : $fechaMinima;
        $fechaMaxima = ($fechaMaxima === null || $fecha > $fechaMaxima) ? $fecha : $fechaMaxima;
    }

    ksort($socios);

    // c) Estadísticas por socio
    $minutosPorSocio = array();
    foreach ($socios as $idSocio => &$socio) {
        $socio['actividadesFavoritas'] = clavesConMaximo($socio['actividades']);
        $socio['instructoresPrincipales'] = clavesConMaximo($socio['instructores']);
        $diferencia = date_diff($socio['primeraFecha'], $socio['ultimaFecha']);
        $socio['diasActivo'] = (int) date_interval_format($diferencia, '%a');
        $minutosPorSocio[$idSocio] = $socio['minutos'];
    }
    unset($socio);

    // c) Estadísticas globales
    $sociosMasActivos = clavesConMaximo($minutosPorSocio);
    $actividadesPopulares = clavesConMaximo($conteoActividades);
    $instructoresTop = clavesConMaximo($conteoInstructores);

    return array(
        'socios'   => $socios,
        'globales' => array(
            'sociosMasActivos'         => $sociosMasActivos,
            'minutosSocioMasActivo'    => $sociosMasActivos ? $minutosPorSocio[$sociosMasActivos[0]] : 0,
            'actividadesPopulares'     => $actividadesPopulares,
            'sesionesActividadPopular' => $actividadesPopulares ? $conteoActividades[$actividadesPopulares[0]] : 0,
            'instructoresTop'          => $instructoresTop,
            'sesionesInstructorTop'    => $instructoresTop ? $conteoInstructores[$instructoresTop[0]] : 0,
            'actividadesPorInstructor' => $actividadesPorInstructor,
            'promedioMinutosSesion'    => $totalSesiones > 0 ? $totalMinutos / $totalSesiones : 0
        ),
        'datos' => array(
            'registros'         => $totalSesiones,
            'lineasDescartadas' => $lineasDescartadas,
            'totalMinutos'      => $totalMinutos,
            'actividades'       => array_keys($conteoActividades),
            'instructores'      => array_keys($conteoInstructores),
            'fechaMinima'       => $fechaMinima,
            'fechaMaxima'       => $fechaMaxima,
            'duracionMinima'    => $duracionMinima,
            'duracionMaxima'    => $duracionMaxima
        )
    );
}

/** Escapa un texto para mostrarlo en HTML. */
function h(string $texto): string
{
    return htmlspecialchars($texto, ENT_QUOTES, 'UTF-8');
}

/** Une una lista de valores escapados con " / " (para empates). */
function listaHTML(array $valores): string
{
    return h(implode(' / ', $valores));
}

/** Describe las sesiones de un instructor: "15 sesiones de Spinning". */
function describirSesionesInstructor(int $sesiones, array $actividades): string
{
    $detalle = array();
    foreach ($actividades as $actividad => $numero) {
        $detalle[] = count($actividades) === 1 ? $actividad : $actividad . ': ' . $numero;
    }
    return count($actividades) === 1
        ? $sesiones . ' sesiones de ' . $detalle[0]
        : $sesiones . ' sesiones (' . implode(', ', $detalle) . ')';
}

/**
 * Genera el informe HTML: tabla por socio y estadísticas globales.
 */
function generarInformeHTML(array $informe): string
{
    $g = $informe['globales'];
    $d = $informe['datos'];
    $ids = array_keys($informe['socios']);

    $html = '<table border="1" cellpadding="4">'
        . '<tr><th>ID del socio</th><th>Total de minutos</th><th>Nº de actividades realizadas</th>'
        . '<th>Actividad favorita</th><th>Período de actividad</th><th>Días activo</th>'
        . '<th>Instructor principal</th></tr>';

    foreach ($informe['socios'] as $idSocio => $s) {
        $html .= '<tr>'
            . '<td>' . h($idSocio) . '</td>'
            . '<td>' . $s['minutos'] . '</td>'
            . '<td>' . $s['sesiones'] . '</td>'
            . '<td>' . listaHTML($s['actividadesFavoritas']) . '</td>'
            . '<td>' . date_format($s['primeraFecha'], FORMATO_FECHA) . ' - '
                     . date_format($s['ultimaFecha'], FORMATO_FECHA) . '</td>'
            . '<td>' . $s['diasActivo'] . '</td>'
            . '<td>' . listaHTML($s['instructoresPrincipales']) . '</td>'
            . '</tr>';
    }
    $html .= '</table>';

    // Instructores más solicitados con el detalle de sus actividades
    $instructores = array();
    foreach ($g['instructoresTop'] as $instructor) {
        $instructores[] = h($instructor) . ' ('
            . h(describirSesionesInstructor($g['sesionesInstructorTop'], $g['actividadesPorInstructor'][$instructor]))
            . ')';
    }

    $html .= '<h3>Estadísticas globales</h3><ul>'
        . '<li>Socio más activo: ' . listaHTML($g['sociosMasActivos'])
            . ' (' . $g['minutosSocioMasActivo'] . ' minutos)</li>'
        . '<li>Actividad más popular: ' . listaHTML($g['actividadesPopulares'])
            . ' (' . $g['sesionesActividadPopular'] . ' sesiones)</li>'
        . '<li>Instructor más solicitado: ' . implode(' / ', $instructores) . '</li>'
        . '<li>Promedio por sesión: ' . number_format($g['promedioMinutosSesion'], 2, ',', '.') . ' minutos</li>'
        . '</ul>';

    $html .= '<h3>Características del conjunto de datos</h3><ul>'
        . '<li>' . $d['registros'] . ' registros de actividades ('
            . $d['totalMinutos'] . ' minutos en total)</li>'
        . '<li>' . count($ids) . ' socios diferentes'
            . ($ids ? ' (' . h($ids[0]) . ' a ' . h(end($ids)) . ')' : '') . '</li>'
        . '<li>' . count($d['actividades']) . ' actividades: ' . h(implode(', ', $d['actividades'])) . '</li>'
        . '<li>' . count($d['instructores']) . ' instructores diferentes</li>';
    if ($d['registros'] > 0) {
        $html .= '<li>Fechas desde ' . date_format($d['fechaMinima'], FORMATO_FECHA)
                . ' hasta ' . date_format($d['fechaMaxima'], FORMATO_FECHA) . '</li>'
            . '<li>Duraciones variadas (' . $d['duracionMinima'] . '-' . $d['duracionMaxima'] . ' minutos)</li>';
    }
    if ($d['lineasDescartadas'] > 0) {
        $html .= '<li>Líneas descartadas por formato incorrecto: ' . $d['lineasDescartadas'] . '</li>';
    }
    $html .= '</ul>';

    return $html;
}

$registros = <<<TXT
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
TXT;

$informe = procesarRegistrosActividades($registros);
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>EPD 6 - Ej3: Informe de actividades</title>
    </head>
    <body>
        <h2>Informe de actividades por socio</h2>
        <?= generarInformeHTML($informe) ?>
    </body>
</html>
