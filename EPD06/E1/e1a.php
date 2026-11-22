<!--
E1 a) Código original del guion.

¿La página generada es la esperada? No. En "echo salida" falta el "$", así que
PHP interpreta "salida" como una constante que no existe. En PHP 8 esto lanza
un Error ("Undefined constant 'salida'"): la ejecución se detiene en la primera
vuelta y el navegador solo muestra el mensaje de error fatal (o una página en
blanco si display_errors está desactivado). En PHP 7 era solo un Warning y se
imprimía el texto literal "salida" diez veces. PHP no detecta el fallo hasta que
ejecuta la línea, porque es un lenguaje interpretado sin compilación previa.
-->
<html>
    <body>
        <?php
        $salida = '';

        for ($i = 0; $i < 10; $i++) {
            $salida .= 'Vuelta' . $i . ' ';
            echo salida . "\n";
        }
        ?>
    </body>
</html>
