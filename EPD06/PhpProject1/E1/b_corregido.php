<!DOCTYPE html>
<!-- E1 b) Error corregido y salida adaptada al navegador (salto de línea HTML) -->
<html>
    <head>
        <meta charset="UTF-8">
        <title>E1 b) - Código corregido</title>
    </head>
    <body>
        <?php
            $salida = '';

            for ($i = 0; $i < 10; $i++) {
                $salida .= 'Vuelta' . $i . ' ';
                // "\n" sólo es un salto de línea en el código fuente; el navegador
                // lo trata como un espacio. Para verlo en pantalla se usa <br/>.
                echo $salida . "<br/>\n";
            }
        ?>
    </body>
</html>
