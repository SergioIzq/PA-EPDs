<?php
//cada pasillo contiene sus estantes y los productos de cada uno
$tabla = array(
    1 => array(
        'a' => array(
            array('SKU' => 'CCFWT-000500', 'cantidad' => 7),
            array('SKU' => 'CCFWT-005000', 'cantidad' => 5),
            array('SKU' => 'CCT-025000', 'cantidad' => 8)
        ),
        'b' => array(
            array('SKU' => 'COS-025000', 'cantidad' => 5)
        ),
        'c' => array(
            array('SKU' => 'COS-025000', 'cantidad' => 9),
            array('SKU' => 'CCT-025000', 'cantidad' => 1),
            array('SKU' => 'CCT-025000', 'cantidad' => 8)
        )
    ),
    2 => array(
        'a' => array(
            array('SKU' => 'CCT-025000', 'cantidad' => 8),
            array('SKU' => 'CCT-025000', 'cantidad' => 9)
        )
    )
);

function buscarProducto($sku, $tabla)
{
    $total = 0;
    $localizaciones = array();

    foreach ($tabla as $pasillo => $estantes) {
        foreach ($estantes as $estante => $productos) {
            $cantidadEstante = 0;
            $encontrado = false;

            //se suma las veces que aparece el producto en este estante
            foreach ($productos as $producto) {
                if ($producto['SKU'] === $sku) {
                    $cantidadEstante += $producto['cantidad'];
                    $encontrado = true;
                }
            }

            if ($encontrado) {
                $localizaciones[] = array(
                    'pasillo' => $pasillo,
                    'estante' => $estante,
                    'cantidad' => $cantidadEstante
                );

                $total += $cantidadEstante;
            }
        }
    }

    return array(
        'sku' => $sku,
        'total' => $total,
        'localizaciones' => $localizaciones
    );
}

//cambia este código para buscar otro producto
$skuBuscado = 'CCT-025000';
$resultado = buscarProducto($skuBuscado, $tabla);
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Ejercicio 4 - Stock del almacén</title>
</head>
<body>
    <h1>Localizaciones del producto</h1>

    <p>
        Producto:
        <?= htmlspecialchars($resultado['sku'], ENT_QUOTES, 'UTF-8') ?>
    </p>

    <?php if (empty($resultado['localizaciones'])) { ?>
        <p>El producto no se encuentra en el almacén.</p>
    <?php } else { ?>
        <ul>
            <?php foreach ($resultado['localizaciones'] as $localizacion) { ?>
                <li>
                    Pasillo <?= $localizacion['pasillo'] ?>
                    -
                    Estante
                    <?= htmlspecialchars(
                        $localizacion['estante'],
                        ENT_QUOTES,
                        'UTF-8'
                    ) ?>
                    -
                    <?= $localizacion['cantidad'] ?> unidades
                </li>
            <?php } ?>
        </ul>
    <?php } ?>

    <p>
        <strong>
            Total: <?= $resultado['total'] ?> unidades de
            <?= htmlspecialchars($resultado['sku'], ENT_QUOTES, 'UTF-8') ?>
        </strong>
    </p>
</body>
</html>