<!--
E2.
¿Cómo funciona internamente print_r? Recorre el vector (recursivamente si un
valor es a su vez un vector u objeto) e imprime cada par clave => valor entre
"Array ( ... )". Para tipos escalares simplemente imprime su valor.

¿Qué aporta array_keys? Devuelve un vector indexado numéricamente (0..n-1) con
las claves del vector original. Así se puede recorrer con un for clásico un
vector asociativo, cuyas claves no son 0, 1, 2..., o saber qué claves existen.
-->
<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>EPD 6 - E2</title>
    </head>
    <body>
        <?php

        /** Muestra cada posición de un vector indexado numéricamente. */
        function muestraArray($vector)
        {
            for ($i = 0, $n = count($vector); $i < $n; $i++) {
                echo 'Valor posición ' . $i . ': ' . $vector[$i] . '<br/>';
            }
        }

        /** Muestra cada par clave/valor recorriendo las claves de array_keys. */
        function muestraArrayValor($vector)
        {
            $claves = array_keys($vector);
            for ($i = 0, $n = count($claves); $i < $n; $i++) {
                echo 'Valor índice “' . $claves[$i] . '”: ' . $vector[$claves[$i]] . '<br/>';
            }
        }

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

        // a) y b): el recorrido manual del apartado a) se sustituye por muestraArray
        echo '<h3>a) / b) muestraArray</h3>';
        muestraArray($arrayNumerico);
        echo '<br/>';
        muestraArray($arrayTexto);

        // c)
        echo '<h3>c) muestraArrayValor</h3>';
        muestraArrayValor($arrayClaveValor);
        ?>
    </body>
</html>
