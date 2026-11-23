# E2 – Respuestas

## ¿Cómo imagina que funciona internamente `print_r`?

`print_r` recibe una variable y, si es un vector, la **recorre clave a clave**
(como un `foreach ($vector as $clave => $valor)`) escribiendo `Array ( [clave] => valor ... )`.
Si un valor es a su vez un vector, se llama **recursivamente** a sí misma para
mostrarlo con más sangría. Si no es un vector, simplemente convierte el valor a
cadena y lo imprime. Con un segundo parámetro `true` devuelve la cadena en vez de
imprimirla.

## ¿Qué utilidad nos aporta `array_keys`?

Devuelve un vector **con índices numéricos consecutivos (0, 1, 2…)** que contiene
las claves del vector original. Así podemos recorrer con un `for` clásico y
`count()` vectores asociativos (cuyas claves son cadenas, como `'Nombre'`), o
vectores numéricos con huecos, obteniendo en cada vuelta la clave y con ella el
valor: `$vector[$claves[$i]]`. También sirve para conocer qué claves existen o
buscar las claves que tienen un valor concreto (`array_keys($v, $valor)`).

## Salida obtenida

```
Valor posición 0: 1
...
Valor posición 4: 5

Valor posición 0: Uno
...
Valor posición 4: Cinco

Valor índice "Nombre": Eugenio
Valor índice "Apellidos": Amador Rivas
Valor índice "Edad": 23
```
