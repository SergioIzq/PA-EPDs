<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title></title>
    </head>
    <body>
        <?php
        //trabajadores que trabajan ese día
        $num = rand(3, 6);
        $empleados = array(
            'Carlos "Bouncing Booty" Gallego' => 'FullStacker novato',
            'Sandra MyGolla' => 'Gestora de base de datos avanzada',
            'Ji Mun Sot' => 'Coordinador de commits experto',
            'Sergio Derecho' => 'Calculador en alza',
            'Ana "The GOAT?" Acosta' => 'Revulsivo histórico en el min. 65',
            'Paco-Paula (PP)' => 'De todo menos estudiar'
        );
        $turnos = array(
            'Mañana' => '07:00-15:00',
            'Tarde' => '15:00-23:00',
            'Noche' => '23:00-07:00'
        );
        
        $nombres = array_keys($empleados);
        shuffle($nombres); //reordena un array como le da la gana (random)
        $nombres = array_slice($nombres, 0, $num);
        
        $nombresTurnos = array_keys($turnos);
        $horarios = array_values($turnos);
        
        echo "<h1>Turnos del día (". $num ." empleados)</h1>";
        echo "<table border = '1'>";
        echo "<tr><th>Turnos</th><th>Horario</th><th>Empleado</th><th>Especialidad</th></tr>";
        
        for ($i=0; $i<count($nombresTurnos); $i++){
            for ($j = 0; $j<$num; $j++){
                // el empleado va al turno j%3, así cada turno tiene un trabajador asignado
                if ($j % 3 == $i){
                    $nombre = $nombres[$j];
                    echo "<tr>";
                    echo "<td>" . $nombresTurnos[$i] . "</td>";
                    echo "<td>" . $horarios[$i] . "</td>";
                    echo "<td>" . $nombre . "</td>";
                    echo "<td>" . $empleados[$nombre] . "</td>";
                    echo "</tr>";
                }
            }
        }
        echo "</table>";
        ?>
    </body>
</html>