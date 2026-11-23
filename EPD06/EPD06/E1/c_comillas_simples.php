<!DOCTYPE html>
<!-- E1 c) Última sentencia cambiada a echo '$salida\n'; -->
<html>
    <head>
        <meta charset="UTF-8">
        <title>E1 c) - Comillas simples</title>
    </head>
    <body>
        <?php
            $salida = '';

            for ($i = 0; $i < 10; $i++) {
                $salida .= 'Vuelta' . $i . ' ';
                // Con comillas simples no se interpolan variables ni se interpretan
                // secuencias de escape: se imprime literalmente  $salida\n
                echo '$salida\n';
            }
        ?>
    </body>
</html>
