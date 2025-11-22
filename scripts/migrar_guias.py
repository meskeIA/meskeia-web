#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de migración masiva de guías HTML a Next.js
Convierte las 91 guías de meskeIA del formato HTML original a componentes Next.js
"""

import os
import re
import shutil
from pathlib import Path
from bs4 import BeautifulSoup

# Rutas
ORIGINAL_GUIDES_PATH = Path(r"C:\Users\jaceb\meskeia-web\guias")
NEXTJS_GUIDES_PATH = Path(r"C:\Users\jaceb\meskeia-web-nextjs\app\guias")
TEMPLATE_CSS_PATH = Path(r"C:\Users\jaceb\meskeia-web-nextjs\app\guias\calculadoras-y-utilidades\calculadora-simple-guia\page.module.css")

# Mapeo de categorías a slugs de carpeta
# IMPORTANTE: Las carpetas en Next.js NO deben tener tildes (causan error 404)
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

# Mapeo de carpetas originales con tildes a carpetas sin tildes para Next.js
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

def convert_html_to_jsx(html_content):
    """Convierte HTML a JSX (React)"""
    # Cambiar class por className
    jsx = html_content.replace('class="', 'className="')

    # Cambiar style inline a camelCase
    jsx = re.sub(r'style="([^"]*)"', lambda m: convert_inline_styles(m.group(1)), jsx)

    # Autocierre de tags
    jsx = jsx.replace('<hr>', '<hr />')
    jsx = jsx.replace('<br>', '<br />')

    # Eliminar comentarios HTML
    jsx = re.sub(r'<!--.*?-->', '', jsx, flags=re.DOTALL)

    # CRÍTICO: Escapar llaves dentro de bloques de código para evitar conflictos con JSX
    # Los bloques <pre> y <code> contienen llaves literales que JSX interpreta como expresiones
    def escape_braces_in_code(match):
        code_content = match.group(1)
        # Escapar llaves { y } con entidades HTML
        code_content = code_content.replace('{', '&#123;')
        code_content = code_content.replace('}', '&#125;')
        return f'<code>{code_content}</code>'

    # Aplicar escape a todos los bloques <code>...</code>
    jsx = re.sub(r'<code>(.*?)</code>', escape_braces_in_code, jsx, flags=re.DOTALL)

    return jsx

def convert_inline_styles(style_string):
    """Convierte estilos inline de CSS a camelCase de React"""
    if not style_string.strip():
        return 'style={{}}'

    # Por ahora, convertimos los estilos a objeto JavaScript
    # Esto es una simplificación; estilos complejos pueden necesitar más trabajo
    styles = {}
    for style in style_string.split(';'):
        if ':' in style:
            prop, value = style.split(':', 1)
            prop = prop.strip()
            value = value.strip()

            # Convertir kebab-case a camelCase
            prop_camel = ''.join(word.capitalize() if i > 0 else word
                                for i, word in enumerate(prop.split('-')))
            styles[prop_camel] = value

    # Generar string de objeto JavaScript
    style_obj = ', '.join([f'{k}: "{v}"' for k, v in styles.items()])
    return f'style={{{{{style_obj}}}}}'

def extract_guide_content(html_file):
    """Extrae el contenido principal de una guía HTML"""
    with open(html_file, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f.read(), 'html.parser')

    # Extraer título
    title = soup.find('h1')
    title_text = title.get_text() if title else "Guía"

    # Extraer contenido del container
    container = soup.find('div', class_='container')
    if not container:
        return None, None

    # Eliminar el nav breadcrumb (lo añadiremos con nuestro componente)
    nav = soup.find('nav')
    if nav:
        nav.decompose()

    # Eliminar footer (usaremos nuestro componente)
    footer = soup.find('footer')
    if footer:
        footer.decompose()

    # Extraer solo el contenido interno del container
    content_html = str(container)

    # Limpiar el HTML
    content_html = content_html.replace('<div class="container">', '')
    content_html = content_html.replace('</div>', '', 1)  # Solo el primer </div>

    return title_text, content_html.strip()

def generate_nextjs_component(title, content_html, category_folder, guide_slug):
    """Genera el componente Next.js para una guía"""

    # Convertir HTML a JSX
    content_jsx = convert_html_to_jsx(content_html)

    # Template del componente
    component = f"""'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';
import styles from './page.module.css';

export default function GuiaPage() {{
  return (
    <>
      {{/* Navegación breadcrumb */}}
      <nav className={{styles.breadcrumb}}>
        <Link href="/">🏠 meskeIA</Link>
        <span>›</span>
        <Link href="/guias">📚 Guías</Link>
        <span>›</span>
        <span className={{styles.current}}>Guía actual</span>
      </nav>

      <div className={{styles.container}}>
        <article className={{styles.content}}>
          {content_jsx}
        </article>
      </div>

      <Footer appName="meskeIA" />
    </>
  );
}}
"""

    return component

def migrate_guide(html_file, category_folder):
    """Migra una guía individual de HTML a Next.js"""

    # Extraer información del archivo
    guide_name = html_file.stem  # nombre sin extensión

    # Crear slug (eliminar -guia del final)
    guide_slug = guide_name.replace('-guia', '')

    print(f"  Migrando: {guide_name} -> {guide_slug}")

    # Extraer contenido
    title, content_html = extract_guide_content(html_file)

    if not content_html:
        print(f"    ⚠️  No se pudo extraer contenido de {guide_name}")
        return False

    # Obtener nombre de carpeta sin tildes para Next.js
    category_folder_nextjs = CATEGORY_FOLDER_NEXTJS.get(category_folder, category_folder)

    # Crear estructura de carpetas en Next.js
    guide_folder = NEXTJS_GUIDES_PATH / category_folder_nextjs / guide_slug
    guide_folder.mkdir(parents=True, exist_ok=True)

    # Generar componente Next.js
    component_code = generate_nextjs_component(title, content_html, category_folder, guide_slug)

    # Guardar page.tsx
    page_file = guide_folder / 'page.tsx'
    with open(page_file, 'w', encoding='utf-8') as f:
        f.write(component_code)

    # Copiar CSS Module template
    css_file = guide_folder / 'page.module.css'
    if TEMPLATE_CSS_PATH.exists():
        shutil.copy(TEMPLATE_CSS_PATH, css_file)

    print(f"    ✅ Creado: {guide_folder.relative_to(NEXTJS_GUIDES_PATH)}")
    return True

def main():
    """Función principal de migración"""
    print("🚀 Iniciando migración masiva de guías HTML → Next.js")
    print(f"📂 Origen: {ORIGINAL_GUIDES_PATH}")
    print(f"📂 Destino: {NEXTJS_GUIDES_PATH}")
    print()

    total_guides = 0
    migrated_guides = 0

    # Iterar por cada categoría
    for category_folder in CATEGORY_FOLDERS.keys():
        category_path = ORIGINAL_GUIDES_PATH / category_folder

        if not category_path.exists():
            print(f"⚠️  Categoría no encontrada: {category_folder}")
            continue

        print(f"📁 Procesando categoría: {CATEGORY_FOLDERS[category_folder]}")

        # Buscar todas las guías en esta categoría
        guide_files = list(category_path.glob('*-guia.html'))

        if not guide_files:
            print(f"  ℹ️  No hay guías en esta categoría")
            continue

        print(f"  Encontradas {len(guide_files)} guías")

        for guide_file in guide_files:
            total_guides += 1
            if migrate_guide(guide_file, category_folder):
                migrated_guides += 1

        print()

    # Resumen
    print("=" * 60)
    print(f"✨ Migración completada")
    print(f"📊 Total de guías procesadas: {total_guides}")
    print(f"✅ Migradas exitosamente: {migrated_guides}")
    print(f"❌ Fallidas: {total_guides - migrated_guides}")
    print("=" * 60)

    if migrated_guides > 0:
        print()
        print("🎉 Las guías migradas están disponibles en:")
        print(f"   {NEXTJS_GUIDES_PATH}")
        print()
        print("📝 Próximos pasos:")
        print("   1. Revisar algunas guías en el navegador")
        print("   2. Verificar que los estilos se apliquen correctamente")
        print("   3. Ajustar conversiones de HTML→JSX si es necesario")

if __name__ == '__main__':
    # Configurar codificación UTF-8 para Windows
    import sys
    if sys.platform == 'win32':
        import io
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Migración interrumpida por el usuario")
    except Exception as e:
        print(f"\n\n❌ Error durante la migración: {e}")
        import traceback
        traceback.print_exc()
