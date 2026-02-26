"""
add-metadata-layout.py
Genera layout.tsx en cada app que tenga metadata.ts pero no tenga layout.tsx.

Propósito: En Next.js App Router, los page.tsx con 'use client' no pueden
exportar metadata. Este script crea un layout.tsx mínimo que re-exporta
el metadata existente, haciendo que Google reciba el title y description
correctos de cada app.

Uso:
    python scripts/add-metadata-layout.py           # modo real
    python scripts/add-metadata-layout.py --dry-run # solo muestra sin escribir
"""

import sys
from pathlib import Path

DRY_RUN = '--dry-run' in sys.argv
APP_DIR = Path(__file__).parent.parent / 'app'

LAYOUT_CONTENT = """\
export {{ metadata }} from './metadata';

export default function Layout({{ children }}: {{ children: React.ReactNode }}) {{
  return <>{{children}}</>;
}}
"""

# Sin placeholders — el contenido es igual para todas las apps
LAYOUT_FINAL = """\
export { metadata } from './metadata';

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
"""

stats = {
    'creadas': 0,
    'saltadas_ya_tiene': 0,
    'saltadas_sin_metadata': 0,
    'errores': 0,
}

# Solo directorios directos de app/ (no subdirectorios de cursos, etc.)
for app_dir in sorted(d for d in APP_DIR.iterdir() if d.is_dir()):
    metadata_file = app_dir / 'metadata.ts'
    layout_file   = app_dir / 'layout.tsx'

    # Sin metadata.ts -> saltar
    if not metadata_file.exists():
        stats['saltadas_sin_metadata'] += 1
        continue

    # Ya tiene layout.tsx -> saltar (cursos, guias con layout propio)
    if layout_file.exists():
        stats['saltadas_ya_tiene'] += 1
        continue

    # Crear layout.tsx
    if DRY_RUN:
        print(f'  OK [DRY-RUN] {app_dir.name}')
    else:
        try:
            layout_file.write_text(LAYOUT_FINAL, encoding='utf-8')
            print(f'  OK {app_dir.name}')
        except Exception as e:
            print(f'  !! ERROR {app_dir.name}: {e}')
            stats['errores'] += 1
            continue

    stats['creadas'] += 1

# Resumen
print()
print('-' * 50)
print(f"  layout.tsx creados:      {stats['creadas']}")
print(f"  Ya tenian layout.tsx:    {stats['saltadas_ya_tiene']}")
print(f"  Sin metadata.ts:         {stats['saltadas_sin_metadata']}")
print(f"  Errores:                 {stats['errores']}")
print('-' * 50)
if DRY_RUN:
    print('  Modo DRY-RUN -- ningun archivo ha sido modificado')
    print('  Ejecuta sin --dry-run para aplicar los cambios')
