<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Ejercicio 3 - Registro de Actividades</title>
</head>
<body>
    <h2>Informe Consolidado de Actividades</h2>
    <?php
    function procesarRegistrosActividades($cadenaEntrada) {
        // Dividir la cadena en líneas eliminando espacios/saltos sobrantes
        $lineas = explode("\n", trim($cadenaEntrada));

        // Estructuras para almacenar datos por socio y globales
        $datosSocios = array();
        $actividadesGlobales = array();
        $instructoresGlobales = array();
        $totalMinutosGlobales = 0;
        $totalSesionesGlobales = 0;

        //Procesa linea por linea
        foreach ($lineas as $linea) {
            $linea = trim($linea);
            if ($linea == "") {
                continue;
            }

            // Separar los campos por "@@"
            $partes = explode("@@", $linea);
            $idSocio = $partes[0];
            $actividad = $partes[1];
            $duracion = (int)$partes[2];
            $fechaStr = $partes[3];
            $instructor = $partes[4];

            // Convertir la cadena de fecha a objeto DateTime
            $fechaObj = date_create_from_format('d/m/Y', $fechaStr);

            // Inicializar el registro del socio si es la primera vez que aparece
            if (!isset($datosSocios[$idSocio])) {
                $datosSocios[$idSocio] = array(
                    'minutos' => 0,
                    'sesiones' => 0,
                    'actividades' => array(),
                    'instructores' => array(),
                    'fechaMin' => $fechaObj,
                    'fechaMax' => $fechaObj
                );
            }

            // Actualizar datos del socio
            $datosSocios[$idSocio]['minutos'] += $duracion;
            $datosSocios[$idSocio]['sesiones'] += 1;

            // Contar frecuencia de actividades del socio
            if (!isset($datosSocios[$idSocio]['actividades'][$actividad])) {
                $datosSocios[$idSocio]['actividades'][$actividad] = 0;
            }
            $datosSocios[$idSocio]['actividades'][$actividad] += 1;

            // Contar frecuencia de instructores del socio
            if (!isset($datosSocios[$idSocio]['instructores'][$instructor])) {
                $datosSocios[$idSocio]['instructores'][$instructor] = 0;
            }
            $datosSocios[$idSocio]['instructores'][$instructor] += 1;

            // Comprobar fecha más antigua y más reciente
            if ($fechaObj < $datosSocios[$idSocio]['fechaMin']) {
                $datosSocios[$idSocio]['fechaMin'] = $fechaObj;
            }
            if ($fechaObj > $datosSocios[$idSocio]['fechaMax']) {
                $datosSocios[$idSocio]['fechaMax'] = $fechaObj;
            }

            // Actualizar contadores globales
            $totalMinutosGlobales += $duracion;
            $totalSesionesGlobales += 1;

            if (!isset($actividadesGlobales[$actividad])) {
                $actividadesGlobales[$actividad] = 0;
            }
            $actividadesGlobales[$actividad] += 1;

            if (!isset($instructoresGlobales[$instructor])) {
                $instructoresGlobales[$instructor] = 0;
            }
            $instructoresGlobales[$instructor] += 1;
        }

        // 2. Generar tabla HTML por socio
        echo "<table border='1' cellpadding='6' cellspacing='0'>";
        echo "<tr>
                <th>ID Socio</th>
                <th>Total Minutos</th>
                <th>Nº Actividades</th>
                <th>Actividad Favorita</th>
                <th>Período de Actividad</th>
                <th>Días Activo</th>
                <th>Instructor Principal</th>
              </tr>";

        $socioMasActivo = "";
        $maxMinutosSocio = -1;

        foreach ($datosSocios as $id => $info) {
            // Comprobar si es el socio más activo globalmente
            if ($info['minutos'] > $maxMinutosSocio) {
                $maxMinutosSocio = $info['minutos'];
                $socioMasActivo = $id;
            }

            // Obtener actividad o actividades favoritas (manejo de empates)
            $maxAct = max($info['actividades']);
            $favoritas = array();
            foreach ($info['actividades'] as $nombreAct => $cantidad) {
                if ($cantidad == $maxAct) {
                    $favoritas[] = $nombreAct;
                }
            }
            $textoFavoritas = implode(", ", $favoritas);

            // Obtener instructor o instructores principales (manejo de empates)
            $maxInst = max($info['instructores']);
            $principales = array();
            foreach ($info['instructores'] as $nombreInst => $cantidad) {
                if ($cantidad == $maxInst) {
                    $principales[] = $nombreInst;
                }
            }
            $textoInstructores = implode(", ", $principales);

            // Calcular diferencia de días de forma procedimental
            $diferencia = date_diff($info['fechaMin'], $info['fechaMax']);
            $diasActivo = date_interval_format($diferencia, '%a');

            $periodo = date_format($info['fechaMin'], 'd/m/Y') . " - " . date_format($info['fechaMax'], 'd/m/Y');

            // Imprimir fila de la tabla
            echo "<tr>";
            echo "<td>" . $id . "</td>";
            echo "<td>" . $info['minutos'] . "</td>";
            echo "<td>" . $info['sesiones'] . "</td>";
            echo "<td>" . $textoFavoritas . "</td>";
            echo "<td>" . $periodo . "</td>";
            echo "<td>" . $diasActivo . " días</td>";
            echo "<td>" . $textoInstructores . "</td>";
            echo "</tr>";
        }
        echo "</table>";

        // 3. Calcular y mostrar estadísticas globales
        $maxSesionesAct = max($actividadesGlobales);
        $populares = array();
        foreach ($actividadesGlobales as $act => $cant) {
            if ($cant == $maxSesionesAct) {
                $populares[] = $act;
            }
        }

        $maxSesionesInst = max($instructoresGlobales);
        $solicitados = array();
        foreach ($instructoresGlobales as $inst => $cant) {
            if ($cant == $maxSesionesInst) {
                $solicitados[] = $inst;
            }
        }

        $promedioMinutos = round($totalMinutosGlobales / $totalSesionesGlobales, 1);

        echo "<h3>Estadísticas Globales</h3>";
        echo "<ul>";
        echo "<li><strong>Socio más activo:</strong> " . $socioMasActivo . " (" . $maxMinutosSocio . " minutos)</li>";
        echo "<li><strong>Actividad más popular:</strong> " . implode(", ", $populares) . " (" . $maxSesionesAct . " sesiones)</li>";
        echo "<li><strong>Instructor más solicitado:</strong> " . implode(", ", $solicitados) . " (" . $maxSesionesInst . " sesiones)</li>";
        echo "<li><strong>Promedio de minutos por sesión:</strong> " . $promedioMinutos . " minutos</li>";
        echo "</ul>";
    }

    // Datos de prueba del enunciado
    $datosEntrada = "SOC001@@Spinning@@45@@15/01/2025@@Ana López@@Sala1
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
SOC006@@Natación@@40@@30/01/2025@@Miguel Torres@@Piscina1";

    procesarRegistrosActividades($datosEntrada);
    ?>
</body>
</html>