# Ejecutar dentro de la carpeta ej3:  powershell -ExecutionPolicy Bypass -File .\descargar-recursos.ps1
$ErrorActionPreference = "Stop"

# jQuery 3.7.1
Invoke-WebRequest "https://code.jquery.com/jquery-3.7.1.min.js" -OutFile "js\jquery-3.7.1.min.js"

# Plugin LazyLoad (si falla, descárgalo a mano desde https://plugins.jquery.com/lazyload/)
try {
  Invoke-WebRequest "https://raw.githubusercontent.com/tuupola/jquery_lazyload/1.9.x/jquery.lazyload.js" -OutFile "js\jquery.lazyload.js"
} catch {
  Write-Host "No se pudo bajar el plugin automaticamente. Descargalo de plugins.jquery.com/lazyload y guardalo como js\jquery.lazyload.js"
}

# 12 imágenes grandes
1..12 | ForEach-Object {
  $n = "{0:D2}" -f $_
  Invoke-WebRequest "https://picsum.photos/2400/1600?random=$_" -OutFile "img\foto$n.jpg"
}
Write-Host "Listo."
