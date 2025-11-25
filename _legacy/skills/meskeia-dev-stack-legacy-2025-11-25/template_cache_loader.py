#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
template_cache_loader.py - Cargador de Templates Optimizados

Fase 2.4: Skills Auto-Optimizantes
Carga y aplica templates cacheados para optimizar generación de código

Integración con meskeia-dev-stack v2.0
"""

import json
from pathlib import Path
from typing import Dict, Optional
from datetime import datetime

# Ruta al template cache
CACHE_FILE = Path(r"C:\Users\jaceb\Mis Desarrollos\Agentes\.cache\template_cache.json")

class TemplateCacheLoader:
    """
    Carga templates cacheados para optimizar generación de código
    """

    def __init__(self):
        self.cache = self._cargar_cache()
        self.templates = self.cache.get('templates', {})
        self.metricas_sesion = {
            'generaciones': 0,
            'templates_usados': 0,
            'tokens_ahorrados': 0,
            'tiempo_ahorrado_ms': 0
        }

    def _cargar_cache(self) -> Dict:
        """Carga caché desde disco"""
        if not CACHE_FILE.exists():
            print(f"  Template cache no encontrado: {CACHE_FILE}")
            return {
                "version": "1.0",
                "templates": {},
                "metricas_globales": {}
            }

        try:
            with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"  Error cargando template cache: {e}")
            return {"templates": {}}

    def get_template(self, nombre: str, variables: Optional[Dict] = None) -> Optional[str]:
        """
        Obtiene template cacheado y aplica variables dinámicas

        Args:
            nombre: Nombre del template (ej: 'logo_css', 'analytics_script')
            variables: Dict con variables a reemplazar (ej: {'APP_NAME': 'calculadora'})

        Returns:
            Código del template con variables aplicadas, o None si no existe
        """
        if nombre not in self.templates:
            return None

        template_data = self.templates[nombre]
        codigo = template_data.get('codigo', '')

        # Aplicar variables dinámicas si existen
        if variables:
            for var_name, var_value in variables.items():
                placeholder = f"{{{{{var_name}}}}}"  # {{VAR_NAME}}
                codigo = codigo.replace(placeholder, str(var_value))

        # Registrar uso
        self.metricas_sesion['templates_usados'] += 1
        self.metricas_sesion['tokens_ahorrados'] += template_data.get('ahorro_tokens_estimado', 150)
        self.metricas_sesion['tiempo_ahorrado_ms'] += template_data.get('ahorro_tiempo_ms_estimado', 500)

        return codigo

    def tiene_template(self, nombre: str) -> bool:
        """Verifica si existe template cacheado"""
        return nombre in self.templates

    def listar_templates(self) -> list:
        """Lista todos los templates disponibles"""
        return list(self.templates.keys())

    def get_info_template(self, nombre: str) -> Optional[Dict]:
        """Obtiene información completa de un template"""
        return self.templates.get(nombre)

    def registrar_generacion(self):
        """Registra una nueva generación"""
        self.metricas_sesion['generaciones'] += 1

    def get_metricas(self) -> Dict:
        """Obtiene métricas de la sesión actual"""
        return {
            **self.metricas_sesion,
            'porcentaje_optimizacion': (
                (self.metricas_sesion['templates_usados'] / self.metricas_sesion['generaciones'] * 100)
                if self.metricas_sesion['generaciones'] > 0 else 0
            )
        }

    def mostrar_resumen(self):
        """Muestra resumen de optimizaciones"""
        metricas = self.get_metricas()

        if metricas['generaciones'] == 0:
            print("\n  No se han registrado generaciones en esta sesión")
            return

        print(f"\n{'='*60}")
        print(f" RESUMEN DE OPTIMIZACIÓN (Sesión Actual)")
        print(f"{'='*60}")
        print(f"Generaciones totales:     {metricas['generaciones']}")
        print(f"Templates usados:         {metricas['templates_usados']}")
        print(f"Optimización:             {metricas['porcentaje_optimizacion']:.1f}%")
        print(f"\n AHORRO ESTIMADO:")
        print(f"   Tokens:                {metricas['tokens_ahorrados']:,}")
        print(f"   Tiempo:                {metricas['tiempo_ahorrado_ms']:,} ms ({metricas['tiempo_ahorrado_ms']/1000:.1f} seg)")
        print(f"{'='*60}\n")


# ================================
# FUNCIONES DE UTILIDAD
# ================================

def cargar_template_cache() -> TemplateCacheLoader:
    """
    Función helper para cargar template cache

    Uso en meskeia-dev-stack:
        cache = cargar_template_cache()
        logo = cache.get_template('logo_css')
    """
    return TemplateCacheLoader()


def generar_con_cache(tipo_app: str, nombre_app: str) -> Dict[str, str]:
    """
    Genera componentes de app usando template cache

    Args:
        tipo_app: Tipo de aplicación (calculadora, conversor, etc.)
        nombre_app: Nombre slug de la app (ej: 'calculadora-propinas')

    Returns:
        Dict con componentes generados o cacheados
    """
    cache = TemplateCacheLoader()
    cache.registrar_generacion()

    componentes = {}

    # Intentar usar templates cacheados
    templates_disponibles = {
        'meta_tags_traduccion': {},
        'seo_meta_tags': {'TITLE': nombre_app.replace('-', ' ').title()},
        'logo_css': {},
        'paleta_colores': {},
        'analytics_script': {'APP_NAME': nombre_app},
        'footer_compartir': {},
        'favicon': {},
        'responsive_css': {}
    }

    for nombre, variables in templates_disponibles.items():
        template = cache.get_template(nombre, variables)
        if template:
            componentes[nombre] = template
            print(f" Usando template cacheado: {nombre}")
        else:
            componentes[nombre] = None
            print(f" Template no disponible: {nombre} (generar manualmente)")

    # Mostrar resumen
    cache.mostrar_resumen()

    return componentes


# ================================
# EJEMPLO DE USO
# ================================

if __name__ == "__main__":
    print("=" * 60)
    print("Template Cache Loader - Prueba de Integración")
    print("=" * 60)

    # Cargar cache
    cache = cargar_template_cache()

    print(f"\n Templates disponibles ({len(cache.listar_templates())}):")
    for template in cache.listar_templates():
        info = cache.get_info_template(template)
        print(f"    {template:<25} ({info['usos']} usos, {info['ahorro_tokens_estimado']} tokens ahorro)")

    # Simular generación de app
    print(f"\n{'='*60}")
    print("Simulando generación de app: calculadora-imc")
    print(f"{'='*60}\n")

    componentes = generar_con_cache('calculadora', 'calculadora-imc')

    print(f"\n{'='*60}")
    print("Componentes generados:")
    print(f"{'='*60}")

    for nombre, codigo in componentes.items():
        if codigo:
            print(f"\n {nombre}:")
            print(f"   Código: {len(codigo)} caracteres")
            print(f"   Preview: {codigo[:100]}...")
        else:
            print(f"\n {nombre}: NO CACHEADO (requiere generación manual)")
