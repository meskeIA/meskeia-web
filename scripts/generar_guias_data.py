#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para generar el archivo de datos de guías con todos los enlaces
"""

import json
from pathlib import Path
from bs4 import BeautifulSoup

# Rutas
ORIGINAL_GUIDES_PATH = Path(r"C:\Users\jaceb\meskeia-web\guias")
OUTPUT_FILE = Path(r"C:\Users\jaceb\meskeia-web-nextjs\data\guides.ts")

# Mapeo de categorías (del script de migración)
CATEGORY_FOLDERS = {
    'calculadoras-y-utilidades': 'Calculadoras y Utilidades',
    'campus-digital': 'Campus Digital',
    'creatividad-y-diseño': 'Creatividad y Diseño',
    'emprendimiento-y-negocios': 'Emprendimiento y Negocios',
    'finanzas-y-fiscalidad': 'Finanzas y Fiscalidad',
    'física-y-química': 'Física y Química',
    'herramientas-de-productividad': 'Herramientas de Productividad',
    'herramientas-web-y-tecnología': 'Herramientas Web y Tecnología',
    'juegos-y-entretenimiento': 'Juegos y Entretenimiento',
    'matemáticas-y-estadística': 'Matemáticas y Estadística',
    'salud-y-bienestar': 'Salud & Bienestar',
    'texto-y-documentos': 'Texto y Documentos',
}

# Mapeo sin tildes para Next.js
CATEGORY_FOLDER_NEXTJS = {
    'calculadoras-y-utilidades': 'calculadoras-y-utilidades',
    'campus-digital': 'campus-digital',
    'creatividad-y-diseño': 'creatividad-y-diseno',
    'emprendimiento-y-negocios': 'emprendimiento-y-negocios',
    'finanzas-y-fiscalidad': 'finanzas-y-fiscalidad',
    'física-y-química': 'fisica-y-quimica',
    'herramientas-de-productividad': 'herramientas-de-productividad',
    'herramientas-web-y-tecnología': 'herramientas-web-y-tecnologia',
    'juegos-y-entretenimiento': 'juegos-y-entretenimiento',
    'matemáticas-y-estadística': 'matematicas-y-estadistica',
    'salud-y-bienestar': 'salud-y-bienestar',
    'texto-y-documentos': 'texto-y-documentos',
}

def extract_guide_title(html_file):
    """Extrae el título de una guía HTML"""
    with open(html_file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    title = soup.find('h1')
    if title:
        title_text = title.get_text().strip()
        # Limpiar el título (remover "Guía Completa:" si existe)
        title_text = title_text.replace('Guía Completa:', '').strip()
        return title_text
    return None

def generate_guides_data():
    """Genera la estructura de datos de todas las guías"""
    guides_data = {}

    for category_folder, category_name in CATEGORY_FOLDERS.items():
        category_path = ORIGINAL_GUIDES_PATH / category_folder

        if not category_path.exists():
            continue

        # Buscar guías en esta categoría
        guide_files = sorted(category_path.glob('*-guia.html'))

        if not guide_files:
            continue

        category_guides = []

        for guide_file in guide_files:
            guide_name = guide_file.stem.replace('-guia', '')
            title = extract_guide_title(guide_file)

            if title:
                # Obtener carpeta sin tildes para la URL
                category_folder_nextjs = CATEGORY_FOLDER_NEXTJS.get(category_folder, category_folder)

                category_guides.append({
                    'slug': guide_name,
                    'title': title,
                    'url': f'/guias/{category_folder_nextjs}/{guide_name}'
                })

        if category_guides:
            guides_data[category_name] = category_guides

    return guides_data

def generate_typescript_file(guides_data):
    """Genera el archivo TypeScript con los datos de guías"""

    # Generar el contenido del archivo
    content = """// Datos de guías educativas generados automáticamente
// Total de guías: {}

export interface Guide {{
  slug: string;
  title: string;
  url: string;
}}

export interface GuidesByCategory {{
  [category: string]: Guide[];
}}

export const guidesByCategory: GuidesByCategory = {{
""".format(sum(len(guides) for guides in guides_data.values()))

    # Añadir cada categoría
    for category_name, guides in guides_data.items():
        content += f'  "{category_name}": [\n'
        for guide in guides:
            content += f'    {{ slug: "{guide["slug"]}", title: "{guide["title"]}", url: "{guide["url"]}" }},\n'
        content += '  ],\n'

    content += "};\n\n"

    # Añadir función helper para obtener total de guías
    content += """// Obtener total de guías
export const getTotalGuidesCount = (): number => {
  return Object.values(guidesByCategory).reduce((total, guides) => total + guides.length, 0);
};

// Obtener guías por categoría
export const getGuidesByCategory = (categoryName: string): Guide[] => {
  return guidesByCategory[categoryName] || [];
};
"""

    return content

def main():
    print("📚 Generando archivo de datos de guías...")
    print()

    # Generar datos
    guides_data = generate_guides_data()

    # Estadísticas
    total_categories = len(guides_data)
    total_guides = sum(len(guides) for guides in guides_data.values())

    print(f"✅ Encontradas {total_guides} guías en {total_categories} categorías")
    print()

    # Generar archivo TypeScript
    content = generate_typescript_file(guides_data)

    # Crear directorio si no existe
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    # Guardar archivo
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ Archivo generado: {OUTPUT_FILE}")
    print()

    # Mostrar resumen por categoría
    print("📊 Resumen por categoría:")
    for category_name, guides in sorted(guides_data.items()):
        print(f"  • {category_name}: {len(guides)} guías")

    print()
    print("✨ Archivo data/guides.ts listo para usar en Next.js")

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
