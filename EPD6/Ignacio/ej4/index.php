<?php
// Busca un SKU en todo el almacén y devuelve en qué estantes está y el total de unidades
function buscarProducto($tabla, $sku) { // La tabla se pasa como parámetro porque dentro de una función no se ven las variables de fuera
    $localizaciones = array();
    $total = 0;
    foreach ($tabla as $pasillo => $estantes) {
        foreach ($estantes as $estante => $productos) {
            // Se suman las unidades del producto en este estante, aunque aparezca varias veces
            $unidades = 0;
            foreach ($productos as $producto) {
                if ($producto[0] === $sku) { // En cada producto [0] es el SKU y [1] la cantidad
                    $unidades += $producto[1];
                }
            }

            // Solo se guardan los estantes donde hay unidades del producto
            if ($unidades > 0) {
                $localizaciones[] = array('pasillo' => $pasillo, 'estante' => $estante, 'unidades' => $unidades);
                $total += $unidades;
            }
        }
    }
    return array('localizaciones' => $localizaciones, 'total' => $total);
}

// Escribe la cantidad con la palabra unidad o unidades según toque
function textoUnidades($cantidad) {
    return $cantidad . ($cantidad == 1 ? ' unidad' : ' unidades');
}

// Escribe dónde está el producto y el total, o un aviso si no hay ninguna unidad
function mostrarResultado($sku, $resultado) {
    $sku = htmlspecialchars($sku); // Evita que lo que escribe el usuario se interprete como HTML
    if ($resultado['total'] > 0) {
        echo '<ul>';
        foreach ($resultado['localizaciones'] as $sitio) {
            echo '<li>Pasillo ' . $sitio['pasillo'] . ' - Estante ' . $sitio['estante'] . ' - ' . textoUnidades($sitio['unidades']) . '</li>';
        }
        echo '</ul>';
        echo '<p><strong>Total: ' . textoUnidades($resultado['total']) . ' de ' . $sku . '</strong></p>';
    } else {
        echo '<p>No hay unidades de ' . $sku . ' en el almacén</p>';
    }
}

// Escribe todo el inventario en una tabla, una fila por producto
function mostrarInventario($tabla) {
    echo '<table>';
    echo '<thead><tr><th>Pasillo</th><th>Estante</th><th>SKU</th><th>Cantidad</th></tr></thead>';
    echo '<tbody>';
    foreach ($tabla as $pasillo => $estantes) {
        foreach ($estantes as $estante => $productos) {
            foreach ($productos as $producto) {
                echo '<tr><td>' . $pasillo . '</td><td>' . $estante . '</td><td>' . $producto[0] . '</td><td>' . $producto[1] . '</td></tr>';
            }
        }
    }
    echo '</tbody>';
    echo '</table>';
}

// Inventario: pasillo (número), estante (letra) y la lista de productos con su SKU y su cantidad
$tabla = array(
    1 => array(
        'a' => array(array('CCFWT-000500', 7), array('CCFWT-005000', 5), array('CCT-025000', 8)),
        'b' => array(array('COS-025000', 5)),
        'c' => array(array('COS-025000', 9), array('CCT-025000', 1), array('CCT-025000', 8))
    ),
    2 => array(
        'a' => array(array('CCT-025000', 8), array('CCT-025000', 9))
    )
);

// Se busca el SKU escrito en el formulario y, si no hay ninguno, el del ejemplo del enunciado
$sku = 'CCT-025000';
if (isset($_GET['sku']) && trim($_GET['sku']) !== '') {
    $sku = strtoupper(trim($_GET['sku'])); // En mayúsculas para que también se encuentre si se escribe en minúsculas
}
$resultado = buscarProducto($tabla, $sku);
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Localización de productos</title>
    <link rel="stylesheet" href="estilos.css">
</head>
<body>
    <h1>Localización de productos en el almacén</h1>

    <form method="get">
        <label for="sku">SKU del producto:</label>
        <input type="text" id="sku" name="sku" value="<?php echo htmlspecialchars($sku); ?>">
        <button type="submit">Buscar</button>
    </form>

    <h2>Resultado de la búsqueda</h2>
    <?php mostrarResultado($sku, $resultado); ?>

    <h2>Inventario completo</h2>
    <?php mostrarInventario($tabla); ?>
</body>
</html>
