<?php
/**
 * EPD 6 - Ej4: Localización de productos en el almacén.
 *
 * Estructura: $almacen[pasillo][estante] = lista de productos,
 * donde cada producto es un par ['sku' => ..., 'cantidad' => ...].
 * Ejemplo de acceso: $almacen[1]['b'] -> segundo estante del primer pasillo.
 */

$almacen = array(
    1 => array(
        'a' => array(
            array('sku' => 'CCFWT-000500', 'cantidad' => 7),
            array('sku' => 'CCFWT-005000', 'cantidad' => 5),
            array('sku' => 'CCT-025000',   'cantidad' => 8)
        ),
        'b' => array(
            array('sku' => 'COS-025000',   'cantidad' => 5)
        ),
        'c' => array(
            array('sku' => 'COS-025000',   'cantidad' => 9),
            array('sku' => 'CCT-025000',   'cantidad' => 1),
            array('sku' => 'CCT-025000',   'cantidad' => 8)
        )
    ),
    2 => array(
        'a' => array(
            array('sku' => 'CCT-025000',   'cantidad' => 8),
            array('sku' => 'CCT-025000',   'cantidad' => 9)
        )
    )
);

/**
 * Busca un producto en el almacén y suma su stock por estante.
 *
 * @param array  $almacen Inventario [pasillo][estante] => productos.
 * @param string $sku     SKU del producto a buscar.
 * @return array ['ubicaciones' => [[pasillo, estante, unidades], ...], 'total' => int]
 */
function localizarProducto(array $almacen, string $sku): array
{
    $ubicaciones = array();
    $total = 0;

    foreach ($almacen as $pasillo => $estantes) {
        foreach ($estantes as $estante => $productos) {
            $unidades = 0;
            foreach ($productos as $producto) {
                if ($producto['sku'] === $sku) {
                    $unidades += $producto['cantidad'];
                }
            }
            if ($unidades > 0) {
                $ubicaciones[] = array('pasillo' => $pasillo, 'estante' => $estante, 'unidades' => $unidades);
                $total += $unidades;
            }
        }
    }

    return array('ubicaciones' => $ubicaciones, 'total' => $total);
}

/**
 * Devuelve la lista ordenada de SKU distintos del almacén (para el selector).
 */
function listarSkus(array $almacen): array
{
    $skus = array();
    foreach ($almacen as $estantes) {
        foreach ($estantes as $productos) {
            foreach ($productos as $producto) {
                $skus[$producto['sku']] = true;
            }
        }
    }
    $skus = array_keys($skus);
    sort($skus);
    return $skus;
}

// SKU a consultar: el enviado por el formulario o, por defecto, el del enunciado
$sku = strtoupper(trim($_GET['sku'] ?? 'CCT-025000'));
$resultado = localizarProducto($almacen, $sku);
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>EPD 6 - Ej4: Localización de productos</title>
    </head>
    <body>
        <h2>Localización de productos en el almacén</h2>

        <form method="get">
            <label for="sku">SKU:</label>
            <input type="text" id="sku" name="sku" list="skus" value="<?= htmlspecialchars($sku) ?>">
            <datalist id="skus">
                <?php foreach (listarSkus($almacen) as $opcion) { ?>
                <option value="<?= htmlspecialchars($opcion) ?>">
                <?php } ?>
            </datalist>
            <button type="submit">Buscar</button>
        </form>

        <h3>Resultado para <?= htmlspecialchars($sku) ?></h3>
        <?php if ($resultado['total'] === 0) { ?>
            <p>No hay stock de <?= htmlspecialchars($sku) ?> en el almacén.</p>
        <?php } else { ?>
            <p>
            <?php foreach ($resultado['ubicaciones'] as $ubicacion) { ?>
                Pasillo <?= $ubicacion['pasillo'] ?> - Estante <?= htmlspecialchars($ubicacion['estante']) ?>
                - <?= $ubicacion['unidades'] ?> unidades<br/>
            <?php } ?>
                <strong>Total: <?= $resultado['total'] ?> unidades de <?= htmlspecialchars($sku) ?></strong>
            </p>
        <?php } ?>
    </body>
</html>
