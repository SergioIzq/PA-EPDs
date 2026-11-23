# E1 – Respuestas

## a) ¿La página generada es la esperada? ¿Por qué?

No. En `echo salida . "\n";` falta el `$`, así que PHP no lo interpreta como la
variable `$salida`, sino como una **constante** llamada `salida`, que no existe.

- **PHP 8 (el que trae XAMPP actual):** usar una constante no definida es un error
  fatal (`Fatal error: Uncaught Error: Undefined constant "salida"`). La ejecución
  se detiene en la primera vuelta del bucle y el navegador sólo muestra el mensaje
  de error (si `display_errors` está activo) o una página en blanco.
- **PHP 7 y anteriores:** era sólo un *Warning/Notice* ("Use of undefined constant
  salida – assumed 'salida'"). PHP asumía que era la cadena `'salida'` y seguía,
  imprimiendo diez veces la palabra `salida` en lugar del contenido de la variable.

Conclusión: PHP es un lenguaje interpretado y débilmente tipado; estos errores no
se detectan hasta que se ejecuta la línea, y según la versión se toleran (con un
aviso) o detienen el script.

## b) Corregido el error, ¿el formato del navegador es el adecuado? ¿Cómo solucionarlo?

No. Con `echo $salida . "\n";` todo sale en una sola línea:

```
Vuelta0 Vuelta0 Vuelta1 Vuelta0 Vuelta1 Vuelta2 ...
```

El `"\n"` sí genera un salto de línea en el **código HTML** (se ve con "Ver código
fuente"), pero el navegador trata los saltos de línea y espacios consecutivos como
un único espacio. Para que se vea un salto en pantalla hay que generar HTML:

- `echo $salida . "<br/>";` (solución aplicada en `b_corregido.php`), o
- envolver la salida en `<pre>...</pre>`, o
- usar `nl2br($salida . "\n")`.

## c) Con `echo '$salida\n';` ¿la salida es la esperada? ¿Por qué?

No. Se imprime diez veces el texto literal `$salida\n`.

Con **comillas simples** PHP no sustituye variables ni interpreta secuencias de
escape (sólo `\'` y `\\`). Con **comillas dobles** (`"$salida\n"`) sí se sustituiría
el valor de la variable y `\n` sería un salto de línea.
