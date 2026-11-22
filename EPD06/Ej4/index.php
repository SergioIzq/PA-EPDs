<?php
/**
 * Ej4 - Localización de productos en el almacén.
 *
 * $almacen[pasillo][estante] = vector de [SKU, cantidad]
 */
$almacen = array(
    1 => array(
        'a' => array(
            array('CCFWT-000500', 7),
            array('CCFWT-005000', 5),
            array('CCT-025000', 8),
        ),
        'b' => array(
            array('COS-025000', 5),
        ),
        'c' => array(
            array('COS-025000', 9),
            array('CCT-025000', 1),
            array('CCT-025000', 8),
        ),
    ),
    2 => array(
        'a' => array(
            array('CCT-025000', 8),
            array('CCT-025000', 9),
        ),
    ),
);

/**
 * Busca un SKU en todo el almacén.
 *
 * @return array ['localizaciones' => [[pasillo, estante, unidades], ...], 'total' => int]
 *         Las unidades de un mismo estante se suman en una sola localización.
 */
function buscarProducto($almacen, $sku)
{
    $localizaciones = array();
    $total = 0;

    foreach ($almacen as $pasillo => $estantes) {
        foreach ($estantes as $estante => $productos) {
            $unidades = 0;
            foreach ($productos as $producto) {
                if ($producto[0] === $sku) {
                    $unidades += $producto[1];
                }
            }
            if ($unidades > 0) {
                $localizaciones[] = array($pasillo, $estante, $unidades);
                $total += $unidades;
            }
        }
    }
    return array('localizaciones' => $localizaciones, 'total' => $total);
}

/** Lista de SKU distintos del almacén, para el desplegable. */
function listarSkus($almacen)
{
    $skus = array();
    foreach ($almacen as $estantes) {
        foreach ($estantes as $productos) {
            foreach ($productos as $producto) {
                $skus[$producto[0]] = true;
            }
        }
    }
    $skus = array_keys($skus);
    sort($skus);
    return $skus;
}

$sku = isset($_GET['sku']) ? strtoupper(trim($_GET['sku'])) : 'CCT-025000';
$resultado = buscarProducto($almacen, $sku);
$skuHtml = htmlspecialchars($sku);
?>
<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>EPD 6 - Ej4 Localización de productos</title>
    </head>
    <body>
        <h1>Localización de productos</h1>
        <form method="get">
            <label>SKU: <input type="text" name="sku" list="skus" value="<?= $skuHtml ?>"></label>
            <datalist id="skus">
                <?php foreach (listarSkus($almacen) as $opcion) { ?>
                    <option value="<?= $opcion ?>">
                <?php } ?>
            </datalist>
            <button type="submit">Buscar</button>
        </form>

        <p>
            <?php
            foreach ($resultado['localizaciones'] as $loc) {
                echo "Pasillo $loc[0] - Estante $loc[1] - $loc[2] unidades<br/>";
            }
            echo $resultado['total'] > 0
                ? "<strong>Total: {$resultado['total']} unidades de $skuHtml</strong>"
                : "No hay stock de $skuHtml en el almacén.";
            ?>
        </p>
    </body>
</html>
