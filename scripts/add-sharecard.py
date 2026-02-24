"""
add-sharecard.py
Añade ShareCard a todas las apps de meskeia-web que tengan Footer con appName.

Uso:
    python scripts/add-sharecard.py           # modo real
    python scripts/add-sharecard.py --dry-run # solo muestra cambios sin escribir
"""

import re
import sys
from pathlib import Path

DRY_RUN = '--dry-run' in sys.argv
APP_DIR = Path(__file__).parent.parent / 'app'

# Línea JSX a insertar (justo antes de <Footer appName=.../>)
SHARE_CARD_JSX = '      <ShareCard appName="{app_name}" />\n'

stats = {'modificadas': 0, 'saltadas_ya_tiene': 0, 'saltadas_sin_footer': 0, 'errores': 0}

for page_file in sorted(APP_DIR.glob('*/page.tsx')):
    app_slug = page_file.parent.name
    content = page_file.read_text(encoding='utf-8')

    # ── Saltar si ya tiene ShareCard ───────────────────────────────────────────
    if 'ShareCard' in content:
        stats['saltadas_ya_tiene'] += 1
        continue

    # ── Buscar <Footer appName="..."> ──────────────────────────────────────────
    footer_match = re.search(r'(<Footer\s+appName="([^"]+)"\s*/>)', content)
    if not footer_match:
        stats['saltadas_sin_footer'] += 1
        continue

    footer_line = footer_match.group(1)   # '<Footer appName="xxx" />'
    app_name    = footer_match.group(2)   # 'xxx'
    share_jsx   = SHARE_CARD_JSX.format(app_name=app_name)

    # ── Insertar ShareCard justo antes de <Footer ...> ─────────────────────────
    new_content = content.replace(
        footer_line,
        share_jsx.strip() + '\n      ' + footer_line,
        1  # solo primera ocurrencia
    )

    # ── Actualizar importación ─────────────────────────────────────────────────
    barrel_match = re.search(r"(import\s*\{[^}]+\}\s*from\s*'@/components';)", new_content)

    if barrel_match:
        # Caso A: ya hay import barrel → añadir ShareCard a la lista
        old_import = barrel_match.group(1)
        if 'ShareCard' not in old_import:
            new_import = old_import.replace(' }', ', ShareCard }')
            new_content = new_content.replace(old_import, new_import, 1)
    else:
        # Caso B: no hay barrel → añadir import nuevo después de la última
        # línea de import de '@/components/...'
        last_comp_import = re.search(
            r"(import .+ from '@/components/[^']+';)(?!.*import .+ from '@/components/[^']+')",
            new_content,
            re.DOTALL
        )
        if last_comp_import:
            old_line = last_comp_import.group(1)
            new_line = old_line + "\nimport { ShareCard } from '@/components';"
            new_content = new_content.replace(old_line, new_line, 1)
        else:
            # Fallback: añadir al inicio de los imports
            new_content = "import { ShareCard } from '@/components';\n" + new_content

    # ── Escribir o mostrar ─────────────────────────────────────────────────────
    if new_content == content:
        print(f'  !! Sin cambios detectados: {app_slug}')
        stats['errores'] += 1
        continue

    if DRY_RUN:
        print(f'  OK [DRY-RUN] {app_slug}')
    else:
        page_file.write_text(new_content, encoding='utf-8')
        print(f'  OK {app_slug}')

    stats['modificadas'] += 1

# ── Resumen ────────────────────────────────────────────────────────────────────
print()
print('-' * 50)
print(f"  Modificadas:          {stats['modificadas']}")
print(f"  Ya tenían ShareCard:  {stats['saltadas_ya_tiene']}")
print(f"  Sin Footer/appName:   {stats['saltadas_sin_footer']}")
print(f"  Errores:              {stats['errores']}")
print('-' * 50)
if DRY_RUN:
    print('  Modo DRY-RUN — ningún archivo ha sido modificado')
    print('  Ejecuta sin --dry-run para aplicar los cambios')
