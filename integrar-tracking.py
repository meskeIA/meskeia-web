#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de Integración Automática de meskeIA Analytics
Archivo: integrar-tracking.py

Añade automáticamente el código de tracking a todas las aplicaciones web de meskeIA.

Uso:
    python integrar-tracking.py

El script:
1. Escanea todas las carpetas con aplicaciones
2. Detecta archivos index.html
3. Verifica si ya tienen tracking
4. Añade el código de tracking si no lo tienen
5. Genera reporte de cambios
"""

import os
import re
from pathlib import Path
from typing import List, Tuple

# Configuración
BASE_DIR = Path(__file__).parent
TRACKING_MARKER = "meskeIA Analytics - Tracking de uso"

# Plantilla del código de tracking
TRACKING_CODE_TEMPLATE = """
    <!-- meskeIA Analytics - Tracking de uso -->
    <script>
        (async function() {{
            const nombreApp = '{app_name}';

            const datos = {{
                aplicacion: nombreApp,
                navegador: navigator.userAgent,
                sistema_operativo: navigator.platform,
                resolucion: `${{window.screen.width}}x${{window.screen.height}}`
            }};

            try {{
                await fetch('https://meskeia.com/api/v1/guardar-uso.php', {{
                    method: 'POST',
                    headers: {{ 'Content-Type': 'application/json' }},
                    body: JSON.stringify(datos)
                }});
                console.log('✅ Uso registrado en meskeIA Analytics');
            }} catch (error) {{
                // Silencioso: no mostrar errores al usuario
                console.error('Error al registrar uso:', error);
            }}
        }})();
    </script>
</body>
</html>"""

# Carpetas a excluir del procesamiento
EXCLUDE_DIRS = {
    'api',           # API REST
    '.git',          # Control de versiones
    'node_modules',  # Dependencias
    'venv',          # Entorno virtual
    '__pycache__',   # Cache Python
    '.vscode',       # Configuración VS Code
    'assets',        # Recursos estáticos
    'images',        # Imágenes
    'img',           # Imágenes
    'css',           # Estilos
    'js',            # Scripts
    'fonts'          # Fuentes
}

# Archivos en la raíz que no son aplicaciones
ROOT_FILES_TO_SKIP = {
    'index.html',      # Página principal
    'privacidad.html', # Políticas
    'terminos.html',   # Términos
    'herramientas.html' # Catálogo
}


def encontrar_aplicaciones() -> List[Path]:
    """
    Encuentra todas las carpetas que contienen aplicaciones web.

    Returns:
        Lista de rutas a carpetas de aplicaciones
    """
    aplicaciones = []

    for item in BASE_DIR.iterdir():
        # Solo procesar directorios
        if not item.is_dir():
            continue

        # Excluir directorios especiales
        if item.name in EXCLUDE_DIRS:
            continue

        # Verificar si tiene index.html
        index_file = item / 'index.html'
        if index_file.exists():
            aplicaciones.append(item)

    return sorted(aplicaciones)


def tiene_tracking(contenido: str) -> bool:
    """
    Verifica si el archivo ya tiene el tracking integrado.

    Args:
        contenido: Contenido del archivo HTML

    Returns:
        True si ya tiene tracking, False si no
    """
    return TRACKING_MARKER in contenido


def obtener_nombre_app(carpeta: Path) -> str:
    """
    Obtiene el nombre de la aplicación desde el nombre de la carpeta.

    Args:
        carpeta: Ruta de la carpeta de la aplicación

    Returns:
        Nombre de la aplicación (nombre de la carpeta)
    """
    return carpeta.name


def integrar_tracking(archivo: Path, nombre_app: str) -> Tuple[bool, str]:
    """
    Integra el código de tracking en un archivo HTML.

    Args:
        archivo: Ruta del archivo index.html
        nombre_app: Nombre de la aplicación

    Returns:
        Tuple (éxito, mensaje)
    """
    try:
        # Leer contenido del archivo
        with open(archivo, 'r', encoding='utf-8') as f:
            contenido = f.read()

        # Verificar si ya tiene tracking
        if tiene_tracking(contenido):
            return False, "Ya tiene tracking"

        # Verificar que tenga </body></html> al final
        if not re.search(r'</body>\s*</html>\s*$', contenido, re.IGNORECASE):
            return False, "No tiene estructura HTML válida (falta </body></html>)"

        # Generar código de tracking con el nombre de la aplicación
        tracking_code = TRACKING_CODE_TEMPLATE.format(app_name=nombre_app)

        # Reemplazar </body></html> con tracking + </body></html>
        nuevo_contenido = re.sub(
            r'</body>\s*</html>\s*$',
            tracking_code,
            contenido,
            flags=re.IGNORECASE
        )

        # Verificar que se hizo el reemplazo
        if nuevo_contenido == contenido:
            return False, "No se pudo insertar el tracking"

        # Guardar archivo modificado
        with open(archivo, 'w', encoding='utf-8') as f:
            f.write(nuevo_contenido)

        return True, "✅ Tracking integrado correctamente"

    except Exception as e:
        return False, f"❌ Error: {str(e)}"


def main():
    """Función principal del script."""
    print("=" * 70)
    print("Script de Integracion Automatica - meskeIA Analytics")
    print("=" * 70)
    print()

    # Encontrar aplicaciones
    print("Buscando aplicaciones web...")
    aplicaciones = encontrar_aplicaciones()
    print(f"Encontradas {len(aplicaciones)} aplicaciones\n")

    # Estadísticas
    integradas = 0
    ya_tenian = 0
    errores = 0

    # Procesar cada aplicación
    print("Integrando tracking...\n")

    for app_dir in aplicaciones:
        nombre_app = obtener_nombre_app(app_dir)
        index_file = app_dir / 'index.html'

        print(f"{nombre_app:40s} ", end="")

        exito, mensaje = integrar_tracking(index_file, nombre_app)

        if exito:
            integradas += 1
            print(f"[OK] Integrado")
        elif "Ya tiene tracking" in mensaje:
            ya_tenian += 1
            print(f"[SKIP] Ya tenia tracking")
        else:
            errores += 1
            print(f"[ERROR] {mensaje}")

    # Reporte final
    print()
    print("=" * 70)
    print("REPORTE FINAL")
    print("=" * 70)
    print(f"Total de aplicaciones:        {len(aplicaciones)}")
    print(f"Tracking integrado:           {integradas}")
    print(f"Ya tenian tracking:           {ya_tenian}")
    print(f"Errores:                      {errores}")
    print("=" * 70)
    print()

    if integradas > 0:
        print(f"Se integro tracking en {integradas} aplicaciones nuevas")
        print("Ahora puedes subir los archivos modificados al hosting")
    elif ya_tenian == len(aplicaciones):
        print("Todas las aplicaciones ya tienen tracking integrado")
    else:
        print("Revisa los errores para aplicaciones que no se pudieron procesar")

    print()


if __name__ == "__main__":
    main()
