<?php
function generarCodigoActividad($nombreActividad, $longitud)
{
    //guardo los códigos para comprobar si se repiten
    static $codigosGenerados = array();

    if (!is_int($longitud) || $longitud < 6 || $longitud > 10) {
        throw new InvalidArgumentException(
            "La longitud debe ser un entero entre 6 y 10."
        );
    }

    //se limpia el nombre y coge las tres primeras letras
    $nombreLimpio = preg_replace(
        '/[^A-Za-z0-9]/',
        '',
        $nombreActividad
    );

    if (strlen($nombreLimpio) < 3) {
        throw new InvalidArgumentException(
            "La actividad debe tener al menos tres caracteres válidos."
        );
    }

    //primeros tres caracteres en mayúsculas
    $prefijo = strtoupper(substr($nombreLimpio, 0, 3));

    $intentos = 0;

    do {
        // evita un bucle indefinido si no encuentra un código libre
        if ($intentos >= 1000) {
            throw new RuntimeException(
                "No se ha podido generar un código libre. Prueba con más longitud."
            );
        }

        //se genera un identificador basado en la hora actual
        $sufijo = uniqid();


        $sufijoLimpio = strtoupper(
            preg_replace('/[^A-Za-z0-9]/', '', $sufijo)
        );

        //se usa la parte final que cambia más rápido
        $sufijoLimpio = substr(
            $sufijoLimpio,
            -($longitud - 3)
        );

        //combina el prefijo y el sufijo.
        $codigo = substr($prefijo . $sufijoLimpio, 0, $longitud);

        $intentos++;

        //si ya existe genera otro
    } while (in_array($codigo, $codigosGenerados, true));

    $codigosGenerados[] = $codigo;

    return $codigo;
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Ejercicio 2 - Códigos de actividad</title>
</head>
<body>
    <h1>Códigos de actividad</h1>

    <?php
    //actividades repetidas para comprobar que sus códigos sean diferentes
    $actividades = array(
        array('yoga', 8),
        array('spinning', 10),
        array('natacion', 6),
        array('.Running', 8),
        array('yoga', 8),
        array('natacion', 6)
    );
    ?>

    <table>
        <thead>
            <tr>
                <th>Actividad</th>
                <th>Longitud</th>
                <th>Código generado</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($actividades as $actividad) { ?>
                <tr>
                    <td><?php echo $actividad[0]; ?></td>
                    <td><?php echo $actividad[1]; ?></td>
                    <td>
                        <?php
                        try {
                            echo generarCodigoActividad(
                                $actividad[0],
                                $actividad[1]
                            );
                        } catch (Exception $error) {
                            echo htmlspecialchars(
                                $error->getMessage(),
                                ENT_QUOTES,
                                'UTF-8'
                            );
                        }
                        ?>
                    </td>
                </tr>
            <?php } ?>
        </tbody>
    </table>
</body>
</html>