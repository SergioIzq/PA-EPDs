<!DOCTYPE html>
<!-- E1 a) Código original del guion (contiene un error intencionado) -->
<html>
    <head>
        <meta charset="UTF-8">
        <title>E1 a) - Código original</title>
    </head>
    <body>
        <?php
            $salida = '';

            for ($i = 0; $i < 10; $i++) {
                $salida .= 'Vuelta' . $i . ' ';
                echo salida . "\n"; // ERROR: falta el '$' delante de "salida"
            }
        ?>
    </body>
</html>
