"""
Script para actualizar public/ai-index.json con las 27 apps faltantes.
Ejecutar desde: c:/Users/jaceb/meskeia-web
"""
import json, sys, os

sys.stdout.reconfigure(encoding='utf-8')

path = 'public/ai-index.json'
data = json.load(open(path, encoding='utf-8'))

# Nuevas entradas por categoría
nuevas = {
    "Calculadoras Prácticas": [
        {"name": "Contador Manual (Tally Counter)", "slug": "contador-manual", "url": "https://meskeia.com/contador-manual/", "description": "Contador manual digital con múltiples contadores independientes, colores personalizables, sonido y vibración."},
        {"name": "Presupuesto de Viaje", "slug": "presupuesto-viaje", "url": "https://meskeia.com/presupuesto-viaje/", "description": "Planifica el presupuesto de tu viaje por categorías y divide los gastos entre el grupo de viajeros."},
        {"name": "Calculadora Coste Real a Plazos", "slug": "calculadora-coste-plazos", "url": "https://meskeia.com/calculadora-coste-plazos/", "description": "Descubre el coste real de financiar productos a plazos. Calcula la TAE, los intereses ocultos y cuánto pagas de más."},
    ],
    "Herramientas Académicas": [
        {"name": "Curso de Pensamiento Científico", "slug": "curso-pensamiento-cientifico", "url": "https://meskeia.com/curso-pensamiento-cientifico/", "description": "Aprende el método científico, pensamiento crítico, falacias lógicas y cómo aplicarlos en tu vida cotidiana."},
        {"name": "Curso de Introducción a la Teoría Política", "slug": "curso-teoria-politica", "url": "https://meskeia.com/curso-teoria-politica/", "description": "Aprende los fundamentos del pensamiento político: desde Platón y Aristóteles hasta Marx y Rawls."},
    ],
    "Salud y Bienestar": [
        {"name": "Lupa Digital con Cámara", "slug": "lupa-digital", "url": "https://meskeia.com/lupa-digital/", "description": "Lupa digital que usa la cámara trasera con zoom hasta 5x. Incluye filtros de accesibilidad y ajustes de brillo."},
        {"name": "Luxómetro / Fotómetro", "slug": "luxometro", "url": "https://meskeia.com/luxometro/", "description": "Mide la intensidad de luz en lux con tu dispositivo. Ideal para fotógrafos con recomendaciones de ISO y apertura."},
    ],
    "Finanzas Personales": [
        {"name": "Calculadora de Deuda", "slug": "calculadora-deuda", "url": "https://meskeia.com/calculadora-deuda/", "description": "Elimina tus deudas más rápido. Compara el método bola de nieve vs avalancha y descubre cuál te ahorra más."},
        {"name": "Calculadora de Infraseguro", "slug": "calculadora-infraseguro", "url": "https://meskeia.com/calculadora-infraseguro/", "description": "Calcula cuánto cobrarías en caso de siniestro si tienes infraseguro. Regla proporcional según Ley de Contrato de Seguro."},
        {"name": "Calculadora Seguro de Vida", "slug": "calculadora-seguro-vida", "url": "https://meskeia.com/calculadora-seguro-vida/", "description": "Calcula cuánto seguro de vida necesitas para proteger a tu familia según ingresos, deudas e hipoteca."},
        {"name": "Comparador de Coste de Vida", "slug": "comparador-coste-vida", "url": "https://meskeia.com/comparador-coste-vida/", "description": "Compara el coste de vida entre más de 55 ciudades del mundo: alquiler, comida, transporte e internet."},
        {"name": "Comparador Tipos de Seguros", "slug": "comparador-tipos-seguros", "url": "https://meskeia.com/comparador-tipos-seguros/", "description": "Guía educativa para comparar tipos de seguros en España: vida, auto, hogar y salud con coberturas y recomendaciones."},
        {"name": "Checklist Coberturas de Seguros", "slug": "checklist-coberturas-seguros", "url": "https://meskeia.com/checklist-coberturas-seguros/", "description": "Descubre qué seguros necesitas según tu perfil: autónomo, familia, jubilado, propietario."},
        {"name": "Simulador de Cartera de Inversión", "slug": "simulador-cartera-inversion", "url": "https://meskeia.com/simulador-cartera-inversion/", "description": "Simula la evolución de tu cartera con Monte Carlo. Sharpe, volatilidad, percentiles y probabilidad de alcanzar objetivos."},
        {"name": "Simulador de Compraventa Inmobiliaria", "slug": "simulador-compraventa-inmueble", "url": "https://meskeia.com/simulador-compraventa-inmueble/", "description": "Calcula todos los gastos de compra y venta de inmuebles en España: ITP/IVA por CCAA, notaría, registro y más."},
    ],
    "Productividad": [
        {"name": "Generador de .gitignore", "slug": "generador-gitignore", "url": "https://meskeia.com/generador-gitignore/", "description": "Genera archivos .gitignore profesionales combinando plantillas para Node.js, Python, Java, React y más tecnologías."},
        {"name": "Espejo Digital", "slug": "espejo", "url": "https://meskeia.com/espejo/", "description": "Espejo digital que usa la cámara frontal. Imagen espejada real, ajustes de brillo y zoom, y modo pantalla completa."},
        {"name": "Golden Hour - Hora Dorada", "slug": "golden-hour", "url": "https://meskeia.com/golden-hour/", "description": "Calcula las horas de luz dorada y azul para fotografía. Amanecer, atardecer y crepúsculos según tu ubicación."},
    ],
    "Emprendimiento y SEO": [
        {"name": "Asistente de Reclamaciones al Consumidor", "slug": "asistente-reclamaciones", "url": "https://meskeia.com/asistente-reclamaciones/", "description": "Guía interactiva para reclamar tus derechos como consumidor en España con árbol de decisión y modelos de carta."},
    ],
    "Texto y Conversores": [
        {"name": "Conversor Base64", "slug": "conversor-base64", "url": "https://meskeia.com/conversor-base64/", "description": "Codifica y decodifica texto, imágenes y archivos en Base64. Genera data URI para desarrollo web."},
        {"name": "Conversor de Divisas", "slug": "conversor-divisas", "url": "https://meskeia.com/conversor-divisas/", "description": "Convierte entre más de 30 divisas con tipos de cambio actualizados diariamente. Orientativo, no apto para trading."},
        {"name": "Enchufes por País", "slug": "enchufes-por-pais", "url": "https://meskeia.com/enchufes-por-pais/", "description": "Consulta qué tipo de enchufe y adaptador necesitas para cada país. Voltaje, frecuencia y tipos A-M."},
    ],
    "Juegos y Entretenimiento": [
        {"name": "Diapasón Digital (La 440Hz)", "slug": "diapason", "url": "https://meskeia.com/diapason/", "description": "Diapasón digital que genera el La 440Hz de referencia estándar. Incluye frecuencias alternativas y tipos de onda."},
        {"name": "Afinador de Instrumentos", "slug": "afinador-instrumentos", "url": "https://meskeia.com/afinador-instrumentos/", "description": "Afinador cromático digital que detecta la nota que tocas usando el micrófono. Presets para guitarra, bajo, ukelele y violín."},
        {"name": "Generador de Tonos de Audio", "slug": "generador-tonos", "url": "https://meskeia.com/generador-tonos/", "description": "Genera tonos de audio de 20Hz a 20kHz con diferentes tipos de onda. Incluye frecuencias de barrido y presets musicales."},
        {"name": "Metrónomo Online", "slug": "metronomo", "url": "https://meskeia.com/metronomo/", "description": "Metrónomo online con tempo ajustable (40-220 BPM), tap tempo y múltiples compases. Ideal para práctica musical."},
        {"name": "Sonómetro / Decibelímetro", "slug": "sonometro", "url": "https://meskeia.com/sonometro/", "description": "Mide el nivel de ruido en decibelios (dB) con tu micrófono. Ideal para documentar ruido y contaminación acústica."},
    ],
}

# Insertar en las categorías correspondientes
total_anadidas = 0
for cat in data['categories']:
    nombre_cat = cat['name']
    if nombre_cat in nuevas:
        slugs_existentes = {t['slug'] for t in cat.get('tools', [])}
        nuevas_a_anadir = [t for t in nuevas[nombre_cat] if t['slug'] not in slugs_existentes]
        cat['tools'].extend(nuevas_a_anadir)
        total_anadidas += len(nuevas_a_anadir)
        print(f"  {nombre_cat}: +{len(nuevas_a_anadir)} tools añadidas")

# Recalcular total y actualizar
total_real = sum(len(cat.get('tools', [])) for cat in data['categories'])
data['total_tools'] = 231
data['updated'] = '2026-02-23'

print(f"\nTotal entradas en categorías: {total_real}")
print(f"total_tools actualizado a: 231")
print(f"Tools añadidas: {total_anadidas}")

# Guardar
with open(path, 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("\nai-index.json actualizado correctamente")
