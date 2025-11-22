#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para regenerar guías específicas con bloques de código que tienen problemas de parsing JSX
"""

import sys
import os

# Añadir el directorio actual al path para importar migrar_guias
sys.path.insert(0, os.path.dirname(__file__))

from pathlib import Path
from migrar_guias import (
    ORIGINAL_GUIDES_PATH,
    CATEGORY_FOLDER_NEXTJS,
    migrate_guide
)

# Guías que necesitan regeneración (tienen bloques de código con llaves)
GUIDES_TO_REGENERATE = {
    'herramientas-web-y-tecnología': [
        'validador-json-guia.html',
        'conversor-base64-guia.html',
        'validador-regex-guia.html',
    ],
    'herramientas-de-productividad': [
        'generador-codigos-qr-guia.html',
    ],
    # Añadir más categorías y guías según sea necesario
}

def main():
    print("🔧 Regenerando guías con bloques de código...")
    print()

    total = 0
    regenerated = 0

    for category_folder, guide_files in GUIDES_TO_REGENERATE.items():
        category_path = ORIGINAL_GUIDES_PATH / category_folder

        if not category_path.exists():
            print(f"⚠️  Categoría no encontrada: {category_folder}")
            continue

        print(f"📁 Procesando categoría: {category_folder}")

        for guide_file_name in guide_files:
            guide_file = category_path / guide_file_name

            if not guide_file.exists():
                print(f"  ⚠️  No encontrado: {guide_file_name}")
                continue

            total += 1
            print(f"  🔄 Regenerando: {guide_file_name}")

            if migrate_guide(guide_file, category_folder):
                regenerated += 1
                print(f"    ✅ Regenerado exitosamente")
            else:
                print(f"    ❌ Error al regenerar")

        print()

    # Resumen
    print("=" * 60)
    print(f"✨ Regeneración completada")
    print(f"📊 Total de guías procesadas: {total}")
    print(f"✅ Regeneradas exitosamente: {regenerated}")
    print(f"❌ Fallidas: {total - regenerated}")
    print("=" * 60)

if __name__ == '__main__':
    # Configurar codificación UTF-8 para Windows
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Regeneración interrumpida por el usuario")
    except Exception as e:
        print(f"\n\n❌ Error durante la regeneración: {e}")
        import traceback
        traceback.print_exc()
