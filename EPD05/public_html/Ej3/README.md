# Ej3 - Medición de carga: sin lazy vs plugin LazyLoad vs HTML5

Páginas (mismas 20 imágenes de 1920x1280 mostradas a 960x640):

- `sin-lazy.html`: carga normal, todas las imágenes se piden al abrir la página.
- `lazy-plugin.html`: plugin jQuery LazyLoad 1.9.1 (`data-original` + `$("img.lazy").lazyload()`).
- `lazy-html5.html`: atributo nativo `loading="lazy"`.

## Procedimiento

1. Servir la carpeta con un servidor local (NetBeans o `npx serve`), no con `file://`.
2. Abrir DevTools (F12) → pestaña **Red / Network**.
3. Marcar **Disable cache** y, opcionalmente, limitar la red (p. ej. "Fast 4G") para que la diferencia se vea.
4. Recargar la página (Ctrl+Shift+R) **sin hacer scroll** y anotar los valores de la barra inferior:
   número de peticiones, datos transferidos, `DOMContentLoaded` y `Load`.
5. TTFB: seleccionar la petición del documento HTML → pestaña **Timing** → "Waiting for server response".
6. Repetir 3 veces por página y quedarse con la media.
7. Hacer scroll hasta el final y comprobar cómo aparecen nuevas peticiones de imágenes en las versiones lazy.

## Resultados (rellenar con las mediciones propias)

| Página          | Peticiones | Transferido | TTFB | DOMContentLoaded | Load |
|-----------------|-----------:|------------:|-----:|-----------------:|-----:|
| Sin lazy        |            |             |      |                  |      |
| Plugin LazyLoad |            |             |      |                  |      |
| HTML5 nativo    |            |             |      |                  |      |

## Conclusiones esperadas

- El TTFB es prácticamente igual en las tres: depende del servidor, no de las imágenes.
- `Load`, peticiones y bytes iniciales bajan mucho con carga perezosa: solo se descargan las imágenes visibles.
- El plugin necesita jQuery + JS extra y solo funciona con JavaScript activo; `loading="lazy"` es nativo,
  sin dependencias y el navegador decide el umbral (suele precargar algo más que el plugin).
- Las mediciones en local no son fiables (el equipo es cliente y servidor a la vez).
