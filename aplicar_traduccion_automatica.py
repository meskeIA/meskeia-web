#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para añadir meta tags de traducción automática a todas las aplicaciones de meskeIA
Autor: meskeIA
Fecha: 2025-01-09
"""

import os
import re
from pathlib import Path

# Configuración
BASE_DIR = Path(r"C:\Users\jaceb\meskeia-web")
PROCESO_EXITOSO = []
PROCESO_FALLIDO = []
PROCESO_OMITIDO = []

# Patrones a buscar y reemplazar
PATRON_HTML_TAG = re.compile(r'<html\s+lang="es">', re.IGNORECASE)
PATRON_HEAD_START = re.compile(r'(<head>\s*<meta charset="UTF-8">\s*<meta name="viewport"[^>]+>)', re.IGNORECASE | re.DOTALL)

# Texto a insertar
NUEVOS_META_TAGS = """
    <!-- Meta tags para traducción automática del navegador -->
    <meta name="google" content="translate">
    <meta http-equiv="content-language" content="es">
"""

def modificar_html(archivo_path):
    """
    Modifica un archivo HTML añadiendo los meta tags de traducción

    Args:
        archivo_path: Path del archivo a modificar

    Returns:
        tuple: (éxito: bool, mensaje: str)
    """
    try:
        # Leer contenido original
        with open(archivo_path, 'r', encoding='utf-8') as f:
            contenido = f.read()

        # Verificar si ya tiene los meta tags
        if 'meta name="google" content="translate"' in contenido:
            return (False, "Ya tiene los meta tags de traducción")

        # Paso 1: Modificar tag <html>
        if PATRON_HTML_TAG.search(contenido):
            contenido = PATRON_HTML_TAG.sub('<html lang="es" translate="yes">', contenido)
        else:
            return (False, "No se encontró tag <html lang=\"es\">")

        # Paso 2: Añadir meta tags después de viewport
        match = PATRON_HEAD_START.search(contenido)
        if match:
            posicion_insercion = match.end()
            contenido = (
                contenido[:posicion_insercion] +
                NUEVOS_META_TAGS +
                contenido[posicion_insercion:]
            )
        else:
            return (False, "No se encontró patrón de <head> esperado")

        # Guardar archivo modificado
        with open(archivo_path, 'w', encoding='utf-8') as f:
            f.write(contenido)

        return (True, "[OK] Modificado correctamente")

    except Exception as e:
        return (False, f"[ERROR] {str(e)}")

def procesar_directorio(directorio):
    """
    Procesa todos los subdirectorios buscando archivos index.html

    Args:
        directorio: Path del directorio base
    """
    print(f"\nExplorando: {directorio}\n")
    print("=" * 80)

    # Buscar todos los archivos index.html
    archivos_html = list(directorio.rglob('index.html'))

    # Excluir algunos directorios especiales
    directorios_excluidos = {'.git', 'node_modules', '__pycache__', '.venv', 'venv', 'api'}
    archivos_html = [
        f for f in archivos_html
        if not any(excluido in f.parts for excluido in directorios_excluidos)
    ]

    print(f"Archivos index.html encontrados: {len(archivos_html)}\n")

    # Procesar cada archivo
    for i, archivo in enumerate(archivos_html, 1):
        ruta_relativa = archivo.relative_to(directorio)
        print(f"[{i}/{len(archivos_html)}] Procesando: {ruta_relativa}")

        exito, mensaje = modificar_html(archivo)

        if exito:
            PROCESO_EXITOSO.append((ruta_relativa, mensaje))
            print(f"    {mensaje}")
        elif "Ya tiene" in mensaje:
            PROCESO_OMITIDO.append((ruta_relativa, mensaje))
            print(f"    [OMITIDO] {mensaje}")
        else:
            PROCESO_FALLIDO.append((ruta_relativa, mensaje))
            print(f"    {mensaje}")

        print()

def generar_reporte():
    """
    Genera un reporte final con el resumen de la operación
    """
    print("\n" + "=" * 80)
    print("REPORTE FINAL")
    print("=" * 80)

    print(f"\n[OK] Modificados exitosamente: {len(PROCESO_EXITOSO)}")
    if PROCESO_EXITOSO:
        for ruta, _ in PROCESO_EXITOSO[:10]:  # Mostrar primeros 10
            print(f"   - {ruta}")
        if len(PROCESO_EXITOSO) > 10:
            print(f"   ... y {len(PROCESO_EXITOSO) - 10} mas")

    print(f"\n[OMITIDO] Omitidos (ya tenian los meta tags): {len(PROCESO_OMITIDO)}")
    if PROCESO_OMITIDO:
        for ruta, _ in PROCESO_OMITIDO[:5]:  # Mostrar primeros 5
            print(f"   - {ruta}")
        if len(PROCESO_OMITIDO) > 5:
            print(f"   ... y {len(PROCESO_OMITIDO) - 5} mas")

    print(f"\n[ERROR] Fallidos: {len(PROCESO_FALLIDO)}")
    if PROCESO_FALLIDO:
        for ruta, mensaje in PROCESO_FALLIDO:
            print(f"   - {ruta}")
            print(f"     Motivo: {mensaje}")

    print("\n" + "=" * 80)
    print(f"Total procesado: {len(PROCESO_EXITOSO) + len(PROCESO_OMITIDO) + len(PROCESO_FALLIDO)}")
    print("=" * 80)

def main():
    """
    Función principal
    """
    print("\n" + "=" * 80)
    print("MESEKIA - APLICAR TRADUCCION AUTOMATICA DEL NAVEGADOR")
    print("=" * 80)
    print("\nEste script anadira los meta tags necesarios para que Chrome/Edge")
    print("ofrezcan traduccion automatica a usuarios internacionales.\n")
    print("Cambios a realizar:")
    print("  1. <html lang=\"es\"> -> <html lang=\"es\" translate=\"yes\">")
    print("  2. Anadir: <meta name=\"google\" content=\"translate\">")
    print("  3. Anadir: <meta http-equiv=\"content-language\" content=\"es\">")
    print("\n" + "=" * 80)

    # Verificar que el directorio existe
    if not BASE_DIR.exists():
        print(f"\n[ERROR] No se encuentra el directorio {BASE_DIR}")
        return

    # Confirmar ejecución
    input("\nPresiona ENTER para comenzar...")

    # Procesar todos los directorios
    procesar_directorio(BASE_DIR)

    # Generar reporte final
    generar_reporte()

    print("\n[OK] Proceso completado. Todas las aplicaciones ahora tienen traduccion automatica habilitada.")
    print("Los usuarios internacionales veran la opcion de traducir automaticamente.\n")

if __name__ == "__main__":
    main()
