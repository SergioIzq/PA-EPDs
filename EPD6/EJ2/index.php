<html>
    <head>
        <meta charset="UTF-8">
        <title></title>
    </head>
    <body>
        <?php

        function generarCodigoActividad($nombre, $longitud) {
            static $usados = array(); //los códigos ya generados se guardan entre llamadas

            if ($longitud < 6 || $longitud > 10) {
                return "Longitud no válida (debe estar entre 6 y 10)";
            }
            
            //limpiamos el nombre y cogemos los 3 primeros caracteres en mayusc
            $limpio = preg_replace('/[^A-Za-z0-9]/', '', $nombre);
            $prefijo = strtoupper(substr($limpio, 0, 3));

            //generamos sufijos hasta que no estén repetidos
            do {
                //uniqid devuelve 13 caracteres HEX, y los paso a mayusc. Cojo los últimos con con substr,
                //porque los primeros corresponden a la hora y tienen mas chance de ser iguales que los correspondientes a los microsegundos
                $sufijo = strtoupper(uniqid());
                $espacio = $longitud - strlen($prefijo); //cortamos a la longitud deseada
                $codigo = $prefijo . substr($sufijo, -$espacio); //combinamos prefijo + sufijos
            } while (in_array($codigo, $usados)); //mientras en el array se encuentre el código generado

            //guardamos el código para que no se repita en la prox. iteracion
            $usados[] = $codigo;
            return $codigo;
        }

        echo generarCodigoActividad("yoga", 8) . "<br>";
        echo generarCodigoActividad("spinning", 10) . "<br>";
        echo generarCodigoActividad("natacion", 6) . "<br>";
        echo generarCodigoActividad(".Running", 7) . "<br>";
        echo generarCodigoActividad("yoga", 12) . "<br>";
        ?>
    </body>
</html>
