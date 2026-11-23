<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Ejercicio 2 - Generador de Códigos</title>
</head>
<body>
    <h2>Generador de Códigos de Actividad</h2>
    <?php
    function generarCodigoActividad($nombreActividad, $longitud) {
        // Array de códigos generados
        static $codigosGenerados = array();

        // Validación longitud
        if ($longitud < 6 || $longitud > 10) {
            return "Error: La longitud debe estar entre 6 y 10 caracteres.";
        }

        // Limpiar el nombre dejando solo letras y números
        $nombreLimpio = preg_replace('/[^A-Za-z0-9]/', '', $nombreActividad);

        // Tomar los primeros 3 caracteres y pasarlos a mayúsculas
        $prefijo = strtoupper(substr($nombreLimpio, 0, 3));

        // Generar códigos hasta encontrar uno que no esté repetido
        do {
            // Generar sufijo único en mayúsculas
            $sufijo = strtoupper(uniqid());
            
            // Combinar prefijo y sufijo, y cortar a la longitud deseada
            $codigoFinal = substr($prefijo . $sufijo, 0, $longitud);
            
        } while (in_array($codigoFinal, $codigosGenerados));

        // Guardar el nuevo código en el historial
        $codigosGenerados[] = $codigoFinal;

        return $codigoFinal;
    }

    // Pruebas de funcionamiento
    echo "Código para yoga (8): " . generarCodigoActividad("yoga", 8) . "<br/>";
    echo "Código para spinning (10): " . generarCodigoActividad("spinning", 10) . "<br/>";
    echo "Código para natación (6): " . generarCodigoActividad("natacion", 6) . "<br/>";
    echo "Código con símbolos .Running (7): " . generarCodigoActividad(".Running", 7) . "<br/>";
    echo "Prueba longitud inválida (4): " . generarCodigoActividad("tenis", 4) . "<br/>";
    ?>
</body>
</html>