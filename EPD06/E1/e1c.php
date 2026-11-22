<!--
E1 c) Con echo '$salida\n'; la salida NO es la esperada: se imprime diez veces
el texto literal "$salida\n". Dentro de comillas simples PHP no interpola
variables ni interpreta secuencias de escape (salvo \' y \\). Para obtener el
valor habría que usar comillas dobles ("$salida\n") o concatenar ($salida . "\n").
-->
<html>
    <body>
        <?php
        $salida = '';

        for ($i = 0; $i < 10; $i++) {
            $salida .= 'Vuelta' . $i . ' ';
            echo '$salida\n';
        }
        ?>
    </body>
</html>
