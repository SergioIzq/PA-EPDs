<?php
/**
 * EPD 6 - Ej2: Generación de códigos únicos de actividad.
 */

const LONGITUD_MINIMA = 6;
const LONGITUD_MAXIMA = 10;
const LONGITUD_PREFIJO = 3;

/**
 * Genera un código de actividad único formado por:
 *   - Prefijo: 3 primeros caracteres alfanuméricos del nombre, en mayúsculas.
 *   - Sufijo: parte final de uniqid() (basado en la hora actual), en mayúsculas.
 * El código se corta a la longitud pedida, que se ajusta al rango [6, 10].
 * Si el código ya se había generado antes, se genera uno nuevo.
 *
 * @param string $nombreActividad Nombre de la actividad (p.e. "yoga").
 * @param int    $longitud        Longitud deseada del código (6-10).
 * @return string Código único.
 */
function generarCodigoActividad(string $nombreActividad, int $longitud): string
{
    static $codigosGenerados = array();

    // La longitud final siempre queda entre 6 y 10 caracteres
    $longitud = max(LONGITUD_MINIMA, min(LONGITUD_MAXIMA, $longitud));

    // Prefijo: nombre limpio, 3 primeros caracteres y en mayúsculas.
    // Si el nombre limpio es más corto se rellena con 'X' (p.e. "TI" -> "TIX").
    $nombreLimpio = preg_replace('/[^A-Za-z0-9]/', '', $nombreActividad);
    $prefijo = strtoupper(str_pad(substr($nombreLimpio, 0, LONGITUD_PREFIJO), LONGITUD_PREFIJO, 'X'));

    $longitudSufijo = $longitud - LONGITUD_PREFIJO;

    do {
        // uniqid() depende de la hora actual: sus últimos caracteres (microsegundos)
        // son los que más cambian entre llamadas, así que se usa el final.
        $sufijo = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', uniqid()));
        $codigo = substr($prefijo . substr($sufijo, -$longitudSufijo), 0, $longitud);
    } while (in_array($codigo, $codigosGenerados, true));

    $codigosGenerados[] = $codigo;

    return $codigo;
}

// Ejemplos del enunciado
$ejemplos = array(
    array('yoga', 8),
    array('spinning', 10),
    array('natacion', 6),
    array('.Running', 7),   // nombre con caracteres no válidos
    array('Natación', 9),   // tilde eliminada por la expresión regular
    array('TI', 4),         // nombre corto y longitud fuera de rango (-> 6)
    array('Aquagym', 15)    // longitud fuera de rango (-> 10)
);

// Prueba de unicidad: muchos códigos cortos seguidos para la misma actividad
$numPruebas = 200;
$codigosPrueba = array();
for ($i = 0; $i < $numPruebas; $i++) {
    $codigosPrueba[] = generarCodigoActividad('yoga', 6);
}
$distintos = count(array_unique($codigosPrueba));
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>EPD 6 - Ej2: Códigos de actividad</title>
    </head>
    <body>
        <h2>Generador de códigos de actividad</h2>

        <table border="1">
            <tr>
                <th>Actividad</th>
                <th>Longitud pedida</th>
                <th>Código generado</th>
                <th>Longitud final</th>
            </tr>
            <?php foreach ($ejemplos as $ejemplo) {
                $codigo = generarCodigoActividad($ejemplo[0], $ejemplo[1]); ?>
            <tr>
                <td><?= htmlspecialchars($ejemplo[0]) ?></td>
                <td><?= $ejemplo[1] ?></td>
                <td><?= htmlspecialchars($codigo) ?></td>
                <td><?= strlen($codigo) ?></td>
            </tr>
            <?php } ?>
        </table>

        <h3>Prueba de unicidad</h3>
        <p>
            Se han generado <?= $numPruebas ?> códigos de 6 caracteres para "yoga":
            <?= $distintos ?> distintos
            (<?= $distintos === $numPruebas ? 'ningún código repetido' : 'HAY REPETIDOS' ?>).
        </p>
        <p><?= htmlspecialchars(implode(' ', array_slice($codigosPrueba, 0, 20))) ?> ...</p>
    </body>
</html>
