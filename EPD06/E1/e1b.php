<!--
E1 b) Con el "$" añadido el código funciona, pero el formato no es el adecuado:
"\n" sí genera un salto de línea en el código fuente HTML, pero el navegador
trata los saltos de línea como un espacio, así que todo sale en una sola línea.
Solución: emitir una etiqueta HTML de salto (<br/>), usar nl2br(), o envolver la
salida en <pre>. Aquí se usa <br/> (se mantiene "\n" para que el HTML generado
también sea legible).
-->
<html>
    <body>
        <?php
        $salida = '';

        for ($i = 0; $i < 10; $i++) {
            $salida .= 'Vuelta' . $i . ' ';
            echo $salida . "<br/>\n";
        }
        ?>
    </body>
</html>
