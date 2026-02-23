"""
Analiza cuáles CSS modules realmente necesitan dark mode.
"""
import re, sys, os
sys.stdout.reconfigure(encoding='utf-8')

files = [
    "app/acerca/page.module.css",
    "app/apps/page.module.css",
    "app/calculadora-cocina/CalculadoraCocina.module.css",
    "app/calculadora-regla-de-tres/ReglaDeTres.module.css",
    "app/calculadora-suscripciones/CalculadoraSuscripciones.module.css",
    "app/cifrado-playfair/CifradoPlayfair.module.css",
    "app/cifrado-transposicion/CifradoTransposicion.module.css",
    "app/contador-palabras/ContadorPalabras.module.css",
    "app/conversor-horarios/ConversorHorarios.module.css",
    "app/conversor-texto/ConversorTexto.module.css",
    "app/cronometro/Cronometro.module.css",
    "app/diapason/Diapason.module.css",
    "app/espejo/Espejo.module.css",
    "app/generador-codigos-barras/GeneradorCodigosBarras.module.css",
    "app/generador-contrasenas/GeneradorContrasenas.module.css",
    "app/generador-lorem-ipsum/GeneradorLoremIpsum.module.css",
    "app/generador-tonos/GeneradorTonos.module.css",
    "app/informacion-tiempo/InformacionTiempo.module.css",
    "app/juego-2048/Juego2048.module.css",
    "app/juego-memoria/JuegoMemoria.module.css",
    "app/juego-piedra-papel-tijera/JuegoPiedraPapelTijera.module.css",
    "app/juego-tres-en-raya/JuegoTresEnRaya.module.css",
    "app/juego-wordle/JuegoWordle.module.css",
    "app/limpiador-texto/LimpiadorTexto.module.css",
    "app/lista-compras/ListaCompras.module.css",
    "app/lista-tareas/ListaTareas.module.css",
    "app/loading.module.css",
    "app/lupa-digital/LupaDigital.module.css",
    "app/mantenimiento/Mantenimiento.module.css",
    "app/metronomo/Metronomo.module.css",
    "app/notas/Notas.module.css",
    "app/page.module.css",
    "app/paises-del-mundo/PaisesDelMundo.module.css",
    "app/visualizador-algoritmos/components/SortingCanvas.module.css",
]

# Detectar colores hardcodeados en propiedades CSS (no en definición de variables)
hardcoded_in_prop = re.compile(
    r'(?:background|background-color|color|border-color|fill|stroke|box-shadow)\s*:\s*(?!var\()#[0-9a-fA-F]{3,8}',
)

# Detectar si define sus propias variables en .container (patrón antiguo que SÍ necesita dark mode override)
defines_own_vars = re.compile(r'--bg-primary\s*:', )

base = 'c:/Users/jaceb/meskeia-web/'
print("ANÁLISIS DE DARK MODE")
print("=" * 60)

needs_work = []
already_ok = []
skip_files = ["app/loading.module.css", "app/mantenimiento/Mantenimiento.module.css",
              "app/acerca/page.module.css", "app/apps/page.module.css",
              "app/visualizador-algoritmos/components/SortingCanvas.module.css"]

for f in files:
    path = base + f
    if not os.path.exists(path):
        print(f"❌ No encontrado: {f}")
        continue

    content = open(path, encoding='utf-8').read()

    has_own_vars = bool(defines_own_vars.search(content))
    hardcoded = hardcoded_in_prop.findall(content)

    if f in skip_files:
        print(f"⏭️  SKIP (sistema): {f}")
        continue

    if has_own_vars:
        needs_work.append((f, "Define --bg-primary pero sin [data-theme] override"))
    elif hardcoded:
        # Filtrar los que son solo colores de acento específicos (no bg/text)
        problematic = [h for h in hardcoded if any(k in h for k in ['background', 'color', 'border-color'])]
        if problematic:
            needs_work.append((f, f"Colores hardcodeados: {problematic[:2]}"))
        else:
            already_ok.append(f)
    else:
        already_ok.append(f)

print(f"\n✅ YA FUNCIONA (usa vars globales, sin hardcode) — {len(already_ok)} archivos:")
for f in already_ok:
    print(f"   {f.split('/')[-2]}/{f.split('/')[-1]}")

print(f"\n⚠️ NECESITA BLOQUE DARK MODE — {len(needs_work)} archivos:")
for f, reason in needs_work:
    print(f"   {f.split('/')[-2]}/{f.split('/')[-1]}")
    print(f"      → {reason}")
