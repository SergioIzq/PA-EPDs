<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title></title>
    </head>
    <body>
        <?php

        function procesarRegistrosActividades($cadenaEntrada) {
            //devuelve un array de strings, cada una siendo una substring creada a partir de separar la cadena original por el separador indicado en el primer param
            $lineas = explode("\n", trim($cadenaEntrada)); //trim quita los espacios en blanco
            $ids = array();
            $acts = array();
            $durs = array();
            $fechas = array();
            $instrs = array();

            //procesar cadena linea por linea
            for ($i = 0; $i < count($lineas); $i++) {
                $linea = trim($lineas[$i]); //limpiamos cada cadena de espacios en blanco
                if ($linea != "") {
                    $campos = explode("@@", $linea);
                    $ids[] = $campos[0];
                    $acts[] = $campos[1];
                    $durs[] = (int) $campos[2];
                    //funcion que crea un tipo date directamente a partir de un formato y una string
                    $fechas[] = date_create_from_format('d/m/Y', $campos[3]);
                    $instrs[] = $campos[4];
                }
            }
            $n = count($ids);
            //agrupar datos por socio
            $socios = array();
            $contActG = array();
            $contInstG = array();
            $totalMin = 0;
            $fMin = null;
            $fMax = null;

            for ($j = 0; $j < $n; $j++) {
                if (!in_array($ids[$j], $socios)) {
                    $socios[] = $ids[$j];
                }
                //isset comprueba si una variable esta definidia y tiene un valor distinto de null
                if (!isset($contActG[$acts[$j]])) {
                    $contActG[$acts[$j]] = 0;
                }
                $contActG[$acts[$j]]++; //
                if (!isset($contInstG[$instrs[$j]])) {
                    $contInstG[$instrs[$j]] = 0;
                }
                $contInstG[$instrs[$j]]++;
                $totalMin += $durs[$j];
                if ($fMin === null || $fechas[$j] < $fMin) {
                    $fMin = $fechas[$j];
                }
                if ($fMax === null || $fechas[$j] > $fMax) {
                    $fMax = $fechas[$j];
                }
            }

            //tabla por socio
            $html = "<h2>Resumen por socio</h2>";
            $html .= "<table border='1'>";
            $html .= "<tr><th>ID socio</th><th>Total minutos</th><th>Nº actividades</th>"
                    . "<th>Actividad favorita</th><th>Período de actividad</th>"
                    . "<th>Días activo</th><th>Instructor principal</th></tr>";
            $mejorSocio = "";
            $mejorMin = 0;

            //estadisticas por socio
            for ($i = 0; $i < count($socios); $i++) {
                $minutos = 0;
                $sesiones = 0;
                $contAct = array();
                $contInstr = array();
                $primera = null;
                $ultima = null;

                for ($j = 0; $j < $n; $j++) {
                    if ($ids[$j] == $socios[$i]) {
                        $minutos += $durs[$j];
                        $sesiones++;
                        if (!isset($contAct[$acts[$j]])) {
                            $contAct[$acts[$j]] = 0;
                        }
                        $contAct[$acts[$j]]++;
                        if (!isset($contInstr[$instrs[$j]])) {
                            $contInstr[$instrs[$j]] = 0;
                        }
                        $contInstr[$instrs[$j]]++;
                        if ($primera === null || $fechas[$j] < $primera) {
                            $primera = $fechas[$j];
                        }
                        if ($ultima === null || $fechas[$j] > $ultima) {
                            $ultima = $fechas[$j];
                        }
                    }
                }

                //actividades más frecuentes, con empates
                $maxAct = max($contAct);
                $favoritas = array();
                //en cada vuelta se guarda la clave de la actividad y la guarda en nombre, y el valor va a 'veces'
                foreach ($contAct as $nombre => $veces) {
                    if ($veces == $maxAct) { //si coincide con el maximo, se guarda en el array de favoritas
                        $favoritas[] = $nombre;
                    }
                }

                //instructores principales, con empates
                $maxInstr = max($contInstr);
                $principales = array();
                foreach ($contInstr as $nombre => $veces) {
                    if ($veces == $maxInstr) {
                        $principales[] = $nombre;
                    }
                }

                //días entre la primera y la última fecha
                $diferencia = date_diff($primera, $ultima);
                $dias = date_interval_format($diferencia, '%a');

                if ($minutos > $mejorMin) {
                    $mejorMin = $minutos;
                    $mejorSocio = $socios[$i];
                }

                $html .= "<tr>";
                $html .= "<td>" . $socios[$i] . "</td>";
                $html .= "<td>" . $minutos . "</td>";
                $html .= "<td>" . $sesiones . "</td>";
                $html .= "<td>" . implode(", ", $favoritas) . "</td>";
                $html .= "<td>" . date_format($primera, 'd/m/Y') . " - " . date_format($ultima, 'd/m/Y') . "</td>";
                $html .= "<td>" . $dias . "</td>";
                $html .= "<td>" . implode(", ", $principales) . "</td>";
                $html .= "</tr>";
            }
            $html .= "</table>";

            // 4. Estadísticas globales
            $maxActG = max($contActG);
            $populares = array();
            foreach ($contActG as $nombre => $veces) {
                if ($veces == $maxActG) {
                    $populares[] = $nombre;
                }
            }
            $maxInstrG = max($contInstG);
            $solicitados = array();
            foreach ($contInstG as $nombre => $veces) {
                if ($veces == $maxInstrG) {
                    $solicitados[] = $nombre;
                }
            }

            $html .= "<h2>Estadísticas globales</h2>";
            $html .= "<ul>";
            $html .= "<li>Socio más activo: " . $mejorSocio . " (" . $mejorMin . " minutos)</li>";
            $html .= "<li>Actividad más popular: " . implode(", ", $populares) . " (" . $maxActG . " sesiones)</li>";
            $html .= "<li>Instructor más solicitado: " . implode(", ", $solicitados) . " (" . $maxInstrG . " sesiones)</li>";
            $html .= "<li>Promedio por sesión: " . number_format($totalMin / $n, 1) . " minutos</li>";
            $html .= "</ul>";

            $html .= "<h2>Características del conjunto de datos</h2>";
            $html .= "<ul>";
            $html .= "<li>" . $n . " registros de actividades</li>";
            $html .= "<li>" . count($socios) . " socios diferentes</li>";
            $html .= "<li>" . count($contActG) . " actividades: " . implode(", ", array_keys($contActG)) . "</li>";
            $html .= "<li>" . count($contInstG) . " instructores diferentes</li>";
            $html .= "<li>Fechas desde " . date_format($fMin, 'd/m/Y') . " hasta " . date_format($fMax, 'd/m/Y') . "</li>";
            $html .= "</ul>";

            return $html;
        }

        $datos = <<<TXT
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

        echo "<h1>Informe de actividades</h1>";
        echo procesarRegistrosActividades($datos);
        ?>
    </body>
</html>
