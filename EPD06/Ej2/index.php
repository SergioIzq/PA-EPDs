<?php
/**
 * Ej2 - Generación de códigos únicos de actividad.
 */

const LONGITUD_MIN = 6;
const LONGITUD_MAX = 10;
const PATRON_LIMPIEZA = '/[^A-Za-z0-9]/';

/**
 * Genera un código PREFIJO + SUFIJO de la longitud indicada que no se ha
 * generado antes durante la ejecución.
 *
 * @throws InvalidArgumentException si la longitud no está en [6, 10] o el
 *         nombre no contiene ningún carácter alfanumérico.
 */
function generarCodigoActividad($nombreActividad, $longitud)
{
    static $generados = array();   // códigos ya emitidos (persiste entre llamadas)

    if ($longitud < LONGITUD_MIN || $longitud > LONGITUD_MAX) {
        throw new InvalidArgumentException(
            'La longitud debe estar entre ' . LONGITUD_MIN . ' y ' . LONGITUD_MAX . " (recibido: $longitud)");
    }

    $limpio = preg_replace(PATRON_LIMPIEZA, '', $nombreActividad);
    if ($limpio === '') {
        throw new InvalidArgumentException("El nombre \"$nombreActividad\" no tiene caracteres válidos");
    }
    $prefijo = strtoupper(substr($limpio, 0, 3));

    do {
        // uniqid() son 13 hex de la hora actual: los primeros dígitos (segundos)
        // apenas cambian entre llamadas, así que se usan los últimos (microsegundos).
        $sufijo = strtoupper(preg_replace(PATRON_LIMPIEZA, '', uniqid()));
        $codigo = substr($prefijo . substr($sufijo, -($longitud - strlen($prefijo))), 0, $longitud);
    } while (isset($generados[$codigo]));

    $generados[$codigo] = true;
    return $codigo;
}

$pruebas = array(
    array('yoga', 8),
    array('spinning', 10),
    array('natacion', 6),
    array('.Running', 7),
    array('yoga', 8),        // misma entrada: el código debe ser distinto
    array('natación', 9),    // la "ó" se elimina al limpiar
    array('yoga', 12),       // longitud no válida
    array('***', 8),         // nombre sin caracteres válidos
);
?>
<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>EPD 6 - Ej2 Códigos de actividad</title>
    </head>
    <body>
        <h1>Generador de códigos de actividad</h1>
        <ul>
            <?php
            foreach ($pruebas as $prueba) {
                list($nombre, $longitud) = $prueba;
                echo "<li>generarCodigoActividad(\"$nombre\", $longitud) → ";
                try {
                    echo '<strong>' . generarCodigoActividad($nombre, $longitud) . '</strong>';
                } catch (InvalidArgumentException $e) {
                    echo '<em>Error: ' . htmlspecialchars($e->getMessage()) . '</em>';
                }
                echo '</li>';
            }
            ?>
        </ul>
    </body>
</html>
