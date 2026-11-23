<?php
/**
 * EPD 6 - E2: Vectores numéricos, de texto y asociativos.
 */

/**
 * b) Muestra el contenido de un vector de índices numéricos consecutivos.
 */
function muestraArray(array $vector): void
{
    $total = count($vector);
    for ($i = 0; $i < $total; $i++) {
        echo 'Valor posición ' . $i . ': ' . htmlspecialchars((string) $vector[$i]) . '<br/>';
    }
}

/**
 * c) Muestra el contenido de un vector recorriéndolo mediante sus claves
 *    (válido para vectores asociativos).
 */
function muestraArrayValor(array $vector): void
{
    $claves = array_keys($vector);
    $total = count($claves);
    for ($i = 0; $i < $total; $i++) {
        $clave = $claves[$i];
        echo 'Valor índice "' . htmlspecialchars((string) $clave) . '": '
            . htmlspecialchars((string) $vector[$clave]) . '<br/>';
    }
}
?>
<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>EPD 6 - E2</title>
    </head>
    <body>
        <?php
            // Código de partida del guion
            $arrayNumerico = array(1, 2, 3, 4, 5);
            print_r($arrayNumerico);
            echo '<br/>';

            $arrayTexto = array('Uno', 'Dos', 'Tres', 'Cuatro', 'Cinco');
            print_r($arrayTexto);
            echo '<br/>';

            $arrayClaveValor = array('Nombre' => 'Eugenio', 'Apellidos' => 'Amador Rivas', 'Edad' => 23);
            print_r($arrayClaveValor);
            echo '<br/>';

            print_r(array_keys($arrayClaveValor));
            echo '<br/>';
        ?>

        <h3>a) y b) Recorrido con muestraArray</h3>
        <?php
            // a) El recorrido manual con for + count() se ha encapsulado en
            //    muestraArray(), tal como pide el apartado b).
            muestraArray($arrayNumerico);
            echo '<br/>';
            muestraArray($arrayTexto);
        ?>

        <h3>c) Recorrido con muestraArrayValor</h3>
        <?php muestraArrayValor($arrayClaveValor); ?>
    </body>
</html>
