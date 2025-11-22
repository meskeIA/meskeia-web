#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para renombrar carpetas con tildes a formato compatible con Next.js
"""

import os
import shutil
from pathlib import Path

# Ruta base
GUIAS_PATH = Path(r"C:\Users\jaceb\meskeia-web-nextjs\app\guias")

# Mapeo de carpetas con tildes a sin tildes
RENAME_MAP = {
    'creatividad-y-diseño': 'creatividad-y-diseno',
    'física-y-química': 'fisica-y-quimica',
    'herramientas-web-y-tecnología': 'herramientas-web-y-tecnologia',
    'matemáticas-y-estadística': 'matematicas-y-estadistica'
}

def main():
    print("🔧 Renombrando carpetas con tildes...")
    print()

    for old_name, new_name in RENAME_MAP.items():
        old_path = GUIAS_PATH / old_name
        new_path = GUIAS_PATH / new_name

        if old_path.exists():
            print(f"📁 Renombrando: {old_name} → {new_name}")

            try:
                # Renombrar la carpeta
                shutil.move(str(old_path), str(new_path))
                print(f"   ✅ Renombrado exitosamente")
            except Exception as e:
                print(f"   ❌ Error: {e}")
        else:
            print(f"⚠️  No existe: {old_name}")

    print()
    print("✨ Proceso completado")
    print()
    print("📝 Próximos pasos:")
    print("   1. Reiniciar el servidor de desarrollo (Ctrl+C y npm run dev)")
    print("   2. Probar las guías que antes daban 404")

if __name__ == '__main__':
    # Configurar codificación UTF-8 para Windows
    import sys
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

    try:
        main()
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
