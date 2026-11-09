# Ej3 - Comparación de carga de imágenes

Pestaña *Network* de Chrome, caché desactivada, *throttling* Fast 4G, servidor local, 12 imágenes (5,8 MB). Media de 3 recargas por página. Las columnas hasta Finish son de la carga inicial, sin hacer scroll; la última, tras bajar hasta el final de la página.
| Versión                | Peticiones | Transferido | TTFB | Load | Finish |Transferido tras scroll |
|------------------------|------------|-------------|------|------|--------|------------------------|
| 1. Sin lazy load       |     15     |   5,8 MB    |188 ms|6,62 s| 6,64 s |        5,8 MB          |
| 2. Plugin LazyLoad     |     8      |   0,28 MB   |170 ms|1,08 s| 1,10 s |        5,9 MB          |
| 3. HTML5 `loading="lazy"` |  6      | 0,97 MB     |183 ms|0,45 s| 1,71 s |        5,8 MB          |

*En la versión 3 el evento Load termina antes que las imágenes (las diferidas no lo bloquean), por lo que el tiempo comparable es Finish. No se da el Finish tras el scroll porque incluye el tiempo que tarda el usuario en desplazarse.*

## Comparación

- La carga perezosa reduce mucho los datos y el tiempo de la carga inicial: de 5,8 MB y 6,64 s a menos de 1 MB y entre 1,1 y 1,7 s.
- El TTFB es prácticamente igual en las tres (170-190 ms): solo mide la respuesta del servidor con el HTML, que es el mismo en todas.
- El plugin descargó solo la imagen visible (0,28 MB) y terminó antes; el atributo HTML5 descargó 3 imágenes (Chrome carga las cercanas a la zona visible), pero no necesita jQuery ni el plugin.
- Tras hacer scroll hasta el final las tres transfieren lo mismo (5,8-5,9 MB): la carga perezosa solo retrasa la descarga de lo que no se ve.

## Fiabilidad

La medición no es fiable: se hace en local, sin latencia real, con solo 2 recargas por página y con una zona visible pequeña por tener las DevTools abiertas.
