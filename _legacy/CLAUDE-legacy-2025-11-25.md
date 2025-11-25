# CLAUDE.md - Guía Completa para Claude Code

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# 🚨 PARTE 1: REGLAS OBLIGATORIAS (APLICAR SIEMPRE PRIMERO)

## 🎨 REGLA #1: DISEÑO meskeIA (OBLIGATORIO)

CADA VEZ que generes HTML/CSS, DEBES usar automáticamente:

### Paleta de Colores Oficial meskeIA
```css
:root {
    /* Backgrounds - Inspirados en Claude */
    --bg-primary: #FAFAFA;      /* Background principal */
    --bg-card: #FFFFFF;         /* Cards y contenedores */

    /* Identidad de marca meskeIA */
    --primary: #2E86AB;         /* Azul meskeIA */
    --secondary: #48A9A6;       /* Teal meskeIA */

    /* Textos minimalistas */
    --text-primary: #1A1A1A;    /* Negro suave */
    --text-secondary: #666666;  /* Gris medio */
    --text-muted: #999999;      /* Gris claro */

    /* Elementos estructurales */
    --border: #E5E5E5;          /* Bordes sutiles */
    --hover: #F5F5F5;           /* Estados hover */
    --focus: rgba(46,134,171,0.1); /* Focus con azul meskeIA */
}
```

### Tipografía Oficial
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
```

### ❌ PROHIBIDO ABSOLUTO
- NO usar #7C3AED (violeta) - ES INCORRECTO
- NO usar #2DD4BF (turquesa) - ES INCORRECTO
- NO preguntar si usar meskeIA
- NO generar código sin estos colores
- NO usar otros esquemas de color

### ✅ COLORES OBLIGATORIOS
- Azul principal: #2E86AB (SIEMPRE)
- Teal secundario: #48A9A6 (SIEMPRE)

---

## 🖼️ REGLA #2: LOGO + FOOTER (OBLIGATORIO EN TODA APP WEB)

CADA aplicación web DEBE incluir automáticamente este código EXACTO:

### 1. LOGO meskeIA (CSS - Pegar al final de estilos)
```css
/* Logo meskeIA - Componente oficial */
.meskeia-logo-container {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(46, 134, 171, 0.2);
    border-radius: 12px;
    padding: 8px 16px;
    box-shadow: 0 4px 20px rgba(46, 134, 171, 0.1);
    transition: all 0.3s ease;
}
.meskeia-logo-container:hover {
    transform: scale(1.02);
    box-shadow: 0 6px 25px rgba(46, 134, 171, 0.15);
}
.meskeia-logo-icon {
    width: 32px;
    height: 32px;
    background: linear-gradient(135deg, #2E86AB 0%, #48A9A6 100%);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
}
.meskeia-logo-icon::before {
    content: '';
    position: absolute;
    width: 12px;
    height: 12px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 50%;
    top: 10px;
    left: 10px;
}
.meskeia-logo-icon::after {
    content: '';
    position: absolute;
    width: 6px;
    height: 6px;
    background: #2E86AB;
    border-radius: 50%;
    top: 13px;
    left: 13px;
}
.meskeia-neural-network {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0.3;
}
.meskeia-neural-dot {
    position: absolute;
    width: 2px;
    height: 2px;
    background: white;
    border-radius: 50%;
}
.meskeia-neural-dot:nth-child(1) { top: 4px; left: 6px; }
.meskeia-neural-dot:nth-child(2) { top: 8px; right: 5px; }
.meskeia-neural-dot:nth-child(3) { bottom: 6px; left: 4px; }
.meskeia-neural-dot:nth-child(4) { bottom: 4px; right: 8px; }
.meskeia-logo-text {
    font-size: 1.2rem;
    font-weight: 600;
    color: #2C3E50;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}
.meskeia-logo-text .meske {
    color: #2E86AB;
}
.meskeia-logo-text .ia {
    color: #48A9A6;
    font-weight: 700;
    position: relative;
}
.meskeia-logo-text .ia::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(90deg, #48A9A6, #7FB3D3);
    border-radius: 1px;
}
@media (max-width: 768px) {
    .meskeia-logo-container {
        top: 10px;
        left: 10px;
        padding: 6px 12px;
        gap: 8px;
    }
    .meskeia-logo-icon {
        width: 24px;
        height: 24px;
    }
    .meskeia-logo-icon::before {
        width: 9px;
        height: 9px;
        top: 7.5px;
        left: 7.5px;
    }
    .meskeia-logo-icon::after {
        width: 4px;
        height: 4px;
        top: 10px;
        left: 10px;
    }
    .meskeia-logo-text {
        font-size: 1rem;
    }
}
```

### 2. LOGO meskeIA (HTML - Pegar después de `<body>`)
```html
<!-- Logo meskeIA -->
<div class="meskeia-logo-container" onclick="window.location.href='../index.html'" style="cursor: pointer;">
    <div class="meskeia-logo-icon">
        <div class="meskeia-neural-network">
            <div class="meskeia-neural-dot"></div>
            <div class="meskeia-neural-dot"></div>
            <div class="meskeia-neural-dot"></div>
            <div class="meskeia-neural-dot"></div>
        </div>
    </div>
    <div class="meskeia-logo-text">
        <span class="meske">meske</span><span class="ia">IA</span>
    </div>
</div>
```

### 3. FOOTER meskeIA UNIFICADO (HTML - Pegar antes de `</body>`)

**IMPORTANTE**: Desde noviembre 2025, TODAS las apps usan el **footer unificado con glassmorphism** (un solo elemento).

**⚠️ CRÍTICO**: Este es el formato ACTUAL. NO usar el formato antiguo de 2 elementos separados.

```html
<!-- Footer meskeIA Unificado -->
<footer style="position: fixed; bottom: 10px; right: 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border: 1px solid rgba(46, 134, 171, 0.2); border-radius: 12px; padding: 8px 20px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); text-align: center; font-size: 0.9rem; z-index: 1000; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; white-space: nowrap;">
    <div style="display: flex; align-items: center; justify-content: center; gap: 6px; margin-bottom: 4px;">
        <span style="color: #2E86AB;">💡 ¿Te resultó útil?</span>
        <button type="button" onclick="compartirApp()" style="background: none; border: none; color: #2E86AB; cursor: pointer; font-size: 0.9rem; padding: 0; display: inline-flex; align-items: center; gap: 4px; font-family: inherit; font-weight: 600; text-decoration: underline; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.7'" onmouseout="this.style.opacity='1'" title="Compartir esta herramienta">
            🔗 Compártela
        </button>
    </div>
    <div style="color: #666; font-size: 0.85rem;">
        © 2025 meskeIA
    </div>
</footer>
```

**✅ CARACTERÍSTICAS del footer unificado**:
1. **Un solo elemento `<footer>`** (no 2 elementos separados)
2. **Glassmorphism**: `backdrop-filter: blur(10px)` + fondo semi-transparente
3. **Posición**: Fixed, bottom-right (10px, 20px)
4. **Estructura de 2 líneas**:
   - Línea 1: "💡 ¿Te resultó útil? 🔗 Compártela"
   - Línea 2: "© 2025 meskeIA"
5. **Color principal**: #2E86AB (azul meskeIA)
6. **Icono 🔗 OBLIGATORIO** en el botón

**❌ NO USAR** el formato antiguo (2 elementos separados):
```html
<!-- ❌ ANTIGUO - NO USAR -->
<div style="position: fixed; bottom: 10px; left: 20px;">...</div>
<footer style="position: fixed; bottom: 10px; right: 20px;">...</footer>
```

**Requiere añadir en CSS (antes de `</style>`):**
```css
/* Animaciones para mensaje de compartir */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes fadeOut {
    from { opacity: 1; transform: translateY(0); }
    to { opacity: 0; transform: translateY(10px); }
}
```

**Requiere añadir en JavaScript (antes de `</script>` o Analytics):**
```javascript
// Función para compartir la aplicación
async function compartirApp() {
    const titulo = document.title;
    const url = window.location.href;
    const texto = '¡Mira esta herramienta útil de meskeIA!';

    if (navigator.share) {
        try {
            await navigator.share({ title: titulo, text: texto, url: url });
            console.log('✅ Compartido exitosamente');
        } catch (err) {
            if (err.name !== 'AbortError') console.error('Error al compartir:', err);
        }
    } else {
        try {
            await navigator.clipboard.writeText(url);
            const mensaje = document.createElement('div');
            mensaje.textContent = '✅ Enlace copiado al portapapeles';
            mensaje.style.cssText = 'position: fixed; bottom: 60px; right: 20px; background: #2E86AB; color: white; padding: 10px 15px; border-radius: 8px; font-size: 0.9rem; font-family: inherit; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 9999; animation: fadeIn 0.3s;';
            document.body.appendChild(mensaje);
            setTimeout(() => {
                mensaje.style.animation = 'fadeOut 0.3s';
                setTimeout(() => mensaje.remove(), 300);
            }, 3000);
        } catch (err) {
            prompt('Copia este enlace para compartir:', url);
        }
    }
}
```

### 4. FAVICON (HTML - Pegar en `<head>` después de viewport)
```html
<link rel="icon" type="image/png" href="icon_meskeia.png">
```

### 5. TRADUCCIÓN AUTOMÁTICA EN NAVEGADORES (OBLIGATORIO desde nov 2025)

**IMPORTANTE**: TODAS las aplicaciones HTML DEBEN incluir soporte para traducción automática.

#### HTML - Estructura del `<head>` (ORDEN OBLIGATORIO):
```html
<!DOCTYPE html>
<html lang="es" translate="yes">
<head>
    <meta charset="UTF-8">

    <!-- Meta tags para traducción automática del navegador -->
    <meta name="google" content="translate">
    <meta http-equiv="content-language" content="es">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Título de la App - meskeIA</title>
    <link rel="icon" type="image/png" href="icon_meskeia.png">
```

#### ✅ OBLIGATORIO:
1. **`<html lang="es" translate="yes">`** - Siempre con ambos atributos
2. **`<meta name="google" content="translate">`** - Para Google Chrome/Edge
3. **`<meta http-equiv="content-language" content="es">`** - Declaración de idioma

#### Beneficios:
- Usuarios pueden traducir la app con un clic en Chrome/Edge/Safari
- Mejor SEO internacional
- Accesibilidad a audiencia global

### 6. ANALYTICS v2.0 - TRACKING AVANZADO (OBLIGATORIO desde nov 2025)

**IMPORTANTE**: TODAS las aplicaciones web DEBEN incluir meskeIA Analytics v2.0 para rastrear uso, duración y dispositivos.

#### JavaScript - Script de Analytics v2.0 (PEGAR ANTES DE `</body>`):

```html
<!-- meskeIA Analytics v2.0 - Tracking con duración y dispositivo -->
<script>
    (async function() {
        const nombreApp = 'nombre-de-la-app';  // ⚠️ CAMBIAR por el slug real

        // Detección de visita recurrente usando localStorage
        const claveStorage = 'meskeia_' + nombreApp;
        const esRecurrente = localStorage.getItem(claveStorage) !== null;

        // Marcar primera visita
        if (!esRecurrente) {
            localStorage.setItem(claveStorage, new Date().toISOString());
        }

        // Detección de tipo de dispositivo
        const esMovil = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
        const tipoDispositivo = esMovil ? 'movil' : 'escritorio';

        // Iniciar contador de duración
        const tiempoInicio = Date.now();

        // Datos de entrada (registro inicial)
        const datosEntrada = {
            aplicacion: nombreApp,
            navegador: navigator.userAgent,
            sistema_operativo: navigator.platform,
            resolucion: `${window.screen.width}x${window.screen.height}`,
            tipo_dispositivo: tipoDispositivo,
            es_recurrente: esRecurrente
        };

        // Registrar entrada
        try {
            await fetch('https://meskeia.com/api/v1/guardar-uso.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosEntrada),
                keepalive: true
            });
            console.log('✅ Uso registrado en meskeIA Analytics v2.0');
        } catch (error) {
            console.error('Error al registrar uso:', error);
        }

        // Registrar duración al salir
        window.addEventListener('beforeunload', () => {
            const duracionSegundos = Math.floor((Date.now() - tiempoInicio) / 1000);

            // Solo registrar si la duración es mayor a 2 segundos (evita clics accidentales)
            if (duracionSegundos > 2) {
                fetch('https://meskeia.com/api/v1/guardar-duracion.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        aplicacion: nombreApp,
                        duracion_segundos: duracionSegundos,
                        tipo_dispositivo: tipoDispositivo
                    }),
                    keepalive: true
                });
            }
        });
    })();
</script>
```

#### ✅ OBLIGATORIO:
1. **Colocar DESPUÉS del script de compartir** (si existe)
2. **ANTES del cierre `</body>`**
3. **Cambiar `nombreApp`** al slug de la aplicación (ej: `generador-gradientes`, `seguimiento-habitos`, `calculadora-propinas`)
4. **NO modificar** el resto del código (URLs, campos, estructura)
5. **NO omitir `keepalive: true`** - crítico para evitar cancelación en móviles

#### Qué registra automáticamente:

**Registro inicial (guardar-uso.php)**:
- aplicacion: nombre de la app
- navegador: User Agent completo
- sistema_operativo: Platform del navegador
- resolucion: Ancho x Alto de pantalla
- **tipo_dispositivo**: 'movil' o 'escritorio' ⭐ NUEVO en v2.0
- **es_recurrente**: true/false según localStorage ⭐ NUEVO en v2.0
- Geolocalización por IP (país y ciudad) - capturada en servidor
- Timestamp con formato español

**Registro al salir (guardar-duracion.php)**:
- aplicacion: nombre de la app
- **duracion_segundos**: Tiempo de permanencia ⭐ NUEVO en v2.0
- tipo_dispositivo: 'movil' o 'escritorio'

#### Beneficios Analytics v2.0:
- 📊 **Tasa de retención**: Usuarios nuevos vs recurrentes
- 📱 **Análisis por dispositivo**: Optimizar UX según móvil/escritorio
- ⏱️ **Engagement real**: Tiempo efectivo de uso de cada app
- 🎯 **Identificación de apps exitosas**: Apps con mayor retención y duración

#### Ejemplo de nombres válidos:
```javascript
const nombreApp = 'generador-gradientes';      // ✅ Correcto
const nombreApp = 'seguimiento-habitos';       // ✅ Correcto
const nombreApp = 'calculadora-propinas';      // ✅ Correcto
const nombreApp = 'Generador de Gradientes';   // ❌ Incorrecto (usar slug)
```

### ❌ PROHIBIDO
- NO usar imagen externa para logo (como .webp o .svg alojados)
- NO usar otro formato de footer
- NO preguntar si incluirlos
- NO omitir meta tags de traducción
- NO omitir script de Analytics
- COPIAR EXACTAMENTE el código completo

---

## 💶 REGLA #3: FORMATO ESPAÑOL (OBLIGATORIO)

SIEMPRE usar formato español automáticamente:

- **Números**: 1.234,56 (punto miles, coma decimal)
- **Fechas**: 30/09/2025 (DD/MM/YYYY)
- **Moneda**: 1.234,56 € (espacio antes de €)
- **Horas**: 14:30 (formato 24h)

### JavaScript
```javascript
// Para números
numero.toLocaleString('es-ES')

// Para moneda
numero.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })

// Para fechas
fecha.toLocaleDateString('es-ES')
```

### ❌ PROHIBIDO
- NO usar formato US (1,234.56 o $)
- NO preguntar qué formato usar

---

## 🔐 REGLA #4: API KEYS SEGURAS (NUNCA HARDCODEAR)

NUNCA escribir claves en el código:

### ❌ MAL
```javascript
const API_KEY = "sk-ant-1234567890"
const ANTHROPIC_API_KEY = "sk-ant-api-..."
```

### ✅ BIEN
```javascript
const API_KEY = process.env.ANTHROPIC_API_KEY
```

```python
import os
API_KEY = os.getenv('ANTHROPIC_API_KEY')
```

### Obligatorio
- SIEMPRE crear archivo .env
- SIEMPRE añadir .env a .gitignore
- NO hardcodear claves NUNCA

---

## 🗣️ REGLA #5: TODO EN ESPAÑOL (OBLIGATORIO)

SIEMPRE escribir en español:
- Comentarios de código
- Variables y funciones descriptivas
- Mensajes de error
- Documentación
- Logs y console.log()

### Excepciones permitidas
- Nombres de librerías (React, Flask, etc.)
- Palabras técnicas sin traducción (API, endpoint, etc.)

---

## 📦 REGLA #6: PROTOCOLO DE INTEGRACIÓN DE NUEVAS APLICACIONES (OBLIGATORIO)

**IMPORTANTE**: CADA VEZ que crees una nueva aplicación web para meskeIA, DEBES seguir automáticamente este protocolo COMPLETO de integración en el ecosistema.

### ⚠️ CRÍTICO: Este protocolo es OBLIGATORIO

NO es opcional. NO preguntar si aplicarlo. APLICAR AUTOMÁTICAMENTE después de crear cualquier aplicación nueva.

---

### FASE 1: Desarrollo de la Aplicación ✅

1. Crear carpeta de la app (ej: `conversor-horarios/`)
2. Generar `index.html` con TODOS los estándares meskeIA (REGLAS 1-5)
3. Copiar `icon_meskeia.png` desde otra app a la carpeta nueva
4. Probar funcionamiento localmente

---

### FASE 2: Integración en Sitio Web (OBLIGATORIO - NO OMITIR)

#### 2.1. Actualizar index.html principal ⭐

**Ruta**: `C:\Users\jaceb\meskeia-web\index.html`

**Acciones OBLIGATORIAS**:

**A) Añadir en el array JavaScript** (buscar la categoría correspondiente):
```javascript
{
    name: "Nombre de la App",
    category: "Nombre de la Categoría",
    icon: "🔧",
    description: "Descripción breve de la funcionalidad principal",
    url: "carpeta-app/",
    keywords: ["palabra1", "palabra2", "frase larga", "caso de uso"]
}
```

**B) Añadir `<li>` en el HTML visual de la tarjeta**:
```html
<li><a href="carpeta-app/" onclick="event.stopPropagation()" title="Descripción breve">Nombre de la App</a></li>
```

**C) Actualizar contador** de apps en la categoría si es necesario.

**❌ ERROR COMÚN**: Olvidar añadir el `<li>` en el HTML visual → La app NO aparece en la tarjeta de la homepage.

---

#### 2.2. Actualizar herramientas/index.html

**Ruta**: `C:\Users\jaceb\meskeia-web\herramientas/index.html`

**Acciones**:

**A) Actualizar meta description** (línea ~10):
- Cambiar "XX aplicaciones" al número correcto

**B) Añadir entrada en la categoría** correspondiente:
```html
<article class="tool-item">
    <h3><a href="../carpeta-app/">Nombre de la App</a></h3>
    <p class="tool-description">Descripción extendida de 2-3 líneas explicando características y beneficios principales.</p>
    <div class="tool-features">
        <span class="feature-tag">Feature 1</span>
        <span class="feature-tag">Feature 2</span>
        <span class="feature-tag">Feature 3</span>
    </div>
    <div class="tool-meta">
        <span class="updated-date">Actualizado: YYYY-MM-DD</span>
    </div>
</article>
```

**C) Actualizar contador de la categoría** (ej: "7 herramientas" → "8 herramientas")

---

#### 2.3. Crear Guía Educativa SEO-optimizada

**Ruta**: `C:\Users\jaceb\meskeia-web\guias/[categoria]/nombre-app-guia.html`

**Categorías de guías disponibles**:
- `finanzas-fiscalidad/`
- `herramientas-de-productividad/`
- `calculadoras-utilidades/`
- `matematicas-estadistica/`
- `creatividad-diseno/`
- `juegos-entretenimiento/`
- `salud-bienestar/`
- `emprendimiento-negocios/`

**Requisitos de contenido**:
- **Longitud**: 1800-2500 palabras
- **Estructura obligatoria**:
  1. Introducción (¿Qué es? ¿Para quién?)
  2. Características principales (lista detallada)
  3. Casos de uso prácticos (4-8 ejemplos reales)
  4. Guía paso a paso (tutorial completo)
  5. Lista de ciudades/items/opciones (si aplica)
  6. Consejos y mejores prácticas
  7. FAQ (5-7 preguntas frecuentes)
  8. Casos de uso avanzados
  9. Tabla comparativa o tabla de datos (opcional pero recomendado)
  10. Conclusión con call-to-action

**SEO**:
- Keywords estratégicas distribuidas naturalmente
- Meta description optimizada (150-160 caracteres)
- Títulos H2, H3 bien estructurados
- Aplicar diseño meskeIA (colores, footer, logo)

**Después de crear la guía**, actualizar:

**Ruta**: `C:\Users\jaceb\meskeia-web\guias/index.html`

Añadir enlace:
```html
<a href="categoria/nombre-app-guia.html" class="guide-card">
    <div class="guide-icon">🔧</div>
    <h3 class="guide-title">Nombre de la App</h3>
    <p class="guide-description">Descripción breve de 1-2 líneas sobre qué aprenderás en la guía...</p>
</a>
```

---

#### 2.4. Actualizar ai-index.json

**Ruta**: `C:\Users\jaceb\meskeia-web\ai-index.json`

**Acciones**:

**A) Actualizar `total_tools`** (línea 4):
```json
"total_tools": 85,  // Incrementar en 1
```

**B) Añadir entrada completa** en array `tools`:
```json
{
    "name": "Nombre de la App",
    "slug": "carpeta-app",
    "url": "https://meskeia.com/carpeta-app/",
    "category": "Nombre de la Categoría",
    "description": "Descripción completa de 2-3 líneas con características principales y beneficios.",
    "features": [
        "Característica específica 1",
        "Característica específica 2",
        "Característica específica 3",
        "Característica específica 4"
    ],
    "use_cases": [
        "Caso de uso concreto 1",
        "Caso de uso concreto 2",
        "Caso de uso concreto 3",
        "Caso de uso concreto 4"
    ],
    "keywords": [
        "keyword principal",
        "variación de keyword",
        "keyword de cola larga específica",
        "pregunta frecuente como keyword",
        "caso de uso como keyword",
        "término relacionado 1",
        "término relacionado 2",
        "sinónimo o variante"
    ],
    "technologies": ["HTML5", "JavaScript", "CSS3"],
    "target_audience": ["Descripción del público objetivo", "Otro segmento"],
    "difficulty_level": "principiante",
    "estimated_time": "X minutos",
    "last_updated": "YYYY-MM-DD"
}
```

**Niveles de dificultad**: `principiante`, `intermedio`, `avanzado`

---

#### 2.5. Actualizar sitemap.xml

**Ruta**: `C:\Users\jaceb\meskeia-web\sitemap.xml`

**Acciones**: Añadir **2 URLs** (app + guía):

```xml
<url>
    <loc>https://meskeia.com/carpeta-app/</loc>
    <lastmod>YYYY-MM-DD</lastmod>
    <priority>0.8</priority>
    <changefreq>monthly</changefreq>
</url>
<url>
    <loc>https://meskeia.com/guias/categoria/nombre-app-guia.html</loc>
    <lastmod>YYYY-MM-DD</lastmod>
    <priority>0.8</priority>
    <changefreq>monthly</changefreq>
</url>
```

**Prioridades recomendadas**:
- Apps principales/muy usadas: `0.9`
- Apps estándar: `0.8`
- Apps de nicho específico: `0.7`
- Guías: `0.8` (siempre)

---

#### 2.6. Actualizar robots.txt

**Ruta**: `C:\Users\jaceb\meskeia-web\robots.txt`

**Acciones**:

**A) Actualizar contador total** (línea ~84):
```
# Este sitio ofrece 85 aplicaciones web gratuitas en español
```

**B) Añadir a lista de nuevas apps** si es del mes actual (línea ~87):
```
# Nuevas apps nov 2025: Radio meskeIA, ..., Nombre Nueva App
```

**C) Actualizar fecha** (línea ~91):
```
# Última actualización: YYYY-MM-DD
```

---

#### 2.7. Actualizar awesome-spanish-toolkit

**Ruta**: `C:\Users\jaceb\awesome-spanish-toolkit\README.md`

**Acción**: Añadir entrada en la categoría correspondiente:

```markdown
* [Nombre de la App](https://meskeia.com/carpeta-app) - Descripción breve en una línea con características principales destacadas
```

**Categorías disponibles**:
- Matemáticas → Calculadoras / Álgebra y Cálculo / Geometría / Estadística
- Ciencias → Física / Química
- Conversores y Calculadoras → Conversores de Unidades / Calculadoras Especializadas
- Generadores → Herramientas de Generación / Diseño y CSS
- Productividad → Gestión de Tiempo / Herramientas de Texto / Herramientas Digitales
- Finanzas → Calculadoras Financieras / Simuladores / Herramientas Empresariales
- Salud y Bienestar → Calculadoras de Salud / Nutrición / Hábitos y Rutinas
- Entretenimiento y Multimedia → Radio y Audio / Otros
- Juegos Educativos → Juegos de Lógica / Juegos de Memoria y Palabras
- Herramientas para Desarrolladores → Conversores y Validadores / Herramientas de Diseño

---

### FASE 3: Control de Calidad (OBLIGATORIO)

Antes de hacer commit/push, **VERIFICAR MANUALMENTE**:

```
[ ] App funciona correctamente en navegador local
[ ] Enlaces en index.html funcionan (tanto JS como HTML visual)
[ ] Enlace en herramientas/ funciona
[ ] Guía se visualiza correctamente
[ ] Enlace en guias/index.html funciona
[ ] ai-index.json tiene sintaxis JSON válida (sin comas extras)
[ ] sitemap.xml tiene sintaxis XML válida
[ ] Contador total de apps es CONSISTENTE en todos los archivos:
    - index.html (meta description)
    - herramientas/index.html (meta description)
    - ai-index.json (total_tools)
    - robots.txt (contador en comentarios)
```

**❌ ERROR CRÍTICO**: Contadores inconsistentes → Confusión en SEO y usuarios

---

### FASE 4: Git y Deployment

**Commits en 2 repositorios**:

```bash
# 1. Repositorio principal (meskeia-web)
cd "C:\Users\jaceb\meskeia-web"
git add .
git commit -m "$(cat <<'EOF'
feat: Añadir [Nombre App] - [Breve descripción]

Incluye:
- App completa en /carpeta-app/
- Integración en index, herramientas, ai-index
- Guía educativa SEO-optimizada (~2000 palabras)
- Actualización de sitemap.xml y robots.txt
- Total de apps: XX

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
git push

# 2. Repositorio awesome-spanish-toolkit
cd "C:\Users\jaceb\awesome-spanish-toolkit"
git add README.md
git commit -m "$(cat <<'EOF'
feat: Añadir [Nombre App] a la lista

[Descripción breve de la app]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
git push
```

---

### FASE 5: Tareas del Usuario (Post-deployment)

**Recordar SIEMPRE al usuario** que debe hacer:

1. ✅ Subir archivos modificados al hosting (FTP/cPanel/Rsync)
2. ✅ Actualizar Google Search Console
3. ✅ Enviar sitemap.xml actualizado
4. ✅ Solicitar indexación de nuevas URLs:
   - https://meskeia.com/carpeta-app/
   - https://meskeia.com/guias/categoria/nombre-app-guia.html

**Texto para el usuario**:
```
Integración completa finalizada ✅

Ahora te toca:
1. Subir archivos al hosting
2. Actualizar Google Search Console
3. Enviar sitemap.xml
4. Solicitar indexación de las nuevas URLs
```

---

### ❌ PROHIBICIONES ABSOLUTAS

NUNCA:
- Omitir algún paso de integración
- Hacer commit sin verificar todos los enlaces
- Olvidar actualizar contadores en todos los archivos
- Usar prioridades incorrectas en sitemap
- Olvidar el `<li>` en el HTML visual del index.html
- Crear guía de menos de 1800 palabras
- NO añadir a awesome-spanish-toolkit

---

### ✅ CHECKLIST DE INTEGRACIÓN COMPLETA

**COPIAR Y VERIFICAR** antes de considerar la app "terminada":

```
DESARROLLO:
[ ] App creada con estándares meskeIA (REGLAS 1-5)
[ ] icon_meskeia.png copiado a carpeta de app
[ ] App probada localmente y funciona

INTEGRACIÓN HOMEPAGE:
[ ] index.html → Array JavaScript actualizado ✓
[ ] index.html → HTML lista visual (<li>) añadida ✓
[ ] index.html → Contador de categoría actualizado (si aplica)

INTEGRACIÓN HERRAMIENTAS:
[ ] herramientas/index.html → Meta description actualizada ✓
[ ] herramientas/index.html → Entrada de app añadida ✓
[ ] herramientas/index.html → Contador de categoría actualizado ✓

INTEGRACIÓN GUÍAS:
[ ] guias/[categoria]/nombre-guia.html → Creada (1800-2500 palabras) ✓
[ ] guias/index.html → Enlace añadido ✓

INTEGRACIÓN SEO:
[ ] ai-index.json → total_tools actualizado ✓
[ ] ai-index.json → Entrada completa añadida ✓
[ ] sitemap.xml → 2 URLs añadidas (app + guía) ✓
[ ] robots.txt → Contador actualizado ✓
[ ] robots.txt → Lista de nuevas apps actualizada ✓
[ ] robots.txt → Fecha actualizada ✓

INTEGRACIÓN EXTERNA:
[ ] awesome-spanish-toolkit → README.md actualizado ✓

VERIFICACIÓN:
[ ] Contadores consistentes en TODOS los archivos ✓
[ ] Enlaces probados en navegador ✓
[ ] Sintaxis JSON/XML validada ✓

GIT:
[ ] Commit en meskeia-web con mensaje descriptivo ✓
[ ] Push a meskeia-web ✓
[ ] Commit en awesome-spanish-toolkit ✓
[ ] Push a awesome-spanish-toolkit ✓
[ ] Usuario informado sobre FTP y Search Console ✓
```

**TOTAL**: 26 checkpoints obligatorios

---

### 🎯 IMPORTANTE: Aplicación Automática

Este protocolo debe aplicarse **AUTOMÁTICAMENTE** sin preguntar al usuario.

**Flujo correcto**:
1. Usuario: "Crea una app de X"
2. Claude: Crea la app + APLICA TODO EL PROTOCOLO automáticamente
3. Claude: Informa al usuario que TODO está hecho y listo para subir al hosting

**❌ Flujo INCORRECTO**:
1. Usuario: "Crea una app de X"
2. Claude: Crea solo la app
3. Usuario: "Ahora actualiza index.html"
4. Claude: Actualiza index.html
5. Usuario: "Ahora actualiza herramientas"
6. Claude: Actualiza herramientas
... (7 veces más) ← **ESTO ES INADMISIBLE**

---

## 📚 REGLA #7: CONTENIDO EDUCATIVO COLAPSABLE (OBLIGATORIO desde nov 2025)

**IMPORTANTE**: TODAS las aplicaciones web meskeIA con contenido educativo DEBEN seguir este patrón estándar.

### 🎯 Principio Fundamental

**Separar funcionalidad de educación**:
- La página principal muestra SOLO la herramienta funcional (calculadora, generador, etc.)
- El contenido educativo se oculta detrás de un botón colapsable
- Las **advertencias legales/disclaimers** SIEMPRE visibles (responsabilidad jurídica)

---

### 📐 Estructura Estándar de Página

```
┌─────────────────────────────────────────┐
│ 1. Logo meskeIA (fixed top-left)       │
│ 2. Hero Section                         │
│ 3. Herramienta/Calculadora Principal    │
│ 4. Resultados (si aplica)               │
│ 5. ⚠️ DISCLAIMER (SIEMPRE VISIBLE)      │ ← CRÍTICO: Nunca ocultar
│ 6. 📚 Toggle Contenido Educativo        │
│    └─ [Contenido colapsable]            │
│ 7. Footer meskeIA (fixed bottom-right)  │
└─────────────────────────────────────────┘
```

---

### 🔧 Implementación Técnica

#### 1. **Estado React (Next.js/React)**

```typescript
// Añadir estado para controlar visibilidad
const [showEducationalContent, setShowEducationalContent] = useState<boolean>(false);
```

#### 2. **Sección de Toggle** (después del disclaimer)

```tsx
{/* Toggle para contenido educativo */}
<div className={styles.educationalToggle}>
  <h3>📚 ¿Quieres aprender más sobre [Tema]?</h3>
  <p className={styles.educationalSubtitle}>
    Descubre estrategias, conceptos clave, ejemplos reales y respuestas a las preguntas más frecuentes
  </p>
  <button
    type="button"
    onClick={() => setShowEducationalContent(!showEducationalContent)}
    className={styles.btnSecondary}
  >
    {showEducationalContent ? '⬆️ Ocultar Guía Educativa' : '⬇️ Ver Guía Completa'}
  </button>
</div>
```

#### 3. **Contenido Educativo Colapsable**

```tsx
{/* Contenido educativo colapsable */}
{showEducationalContent && (
  <div className={styles.educationalContent}>
    {/* Secciones educativas aquí */}
    <section className={styles.guideSection}>
      <h2>Título Principal</h2>
      <p>Introducción...</p>

      <div className={styles.contentGrid}>
        {/* Tarjetas de contenido */}
      </div>
    </section>

    {/* Más secciones según necesidad */}
  </div>
)}
```

#### 4. **Estilos CSS Module Obligatorios**

```css
/* Toggle educativo */
.educationalToggle {
  text-align: center;
  margin-top: var(--spacing-xl);
  padding: var(--spacing-xl);
  background: var(--hover);
  border-radius: var(--radius-large);
  border: 1px solid var(--border);
}

.educationalToggle h3 {
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
  font-size: 1.5em;
}

.educationalSubtitle {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
  font-size: 1.05em;
}

/* Contenido educativo con animación */
.educationalContent {
  margin-top: var(--spacing-xl);
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Secciones de contenido */
.guideSection {
  margin-bottom: var(--spacing-xl);
}

.guideSection h2 {
  color: var(--primary);
  font-size: 1.8em;
  margin-bottom: var(--spacing-lg);
  text-align: center;
  font-weight: 700;
}

.contentGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

/* Tarjetas de contenido */
.contentCard {
  background: var(--hover);
  padding: var(--spacing-lg);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  transition: transform 0.3s ease;
}

.contentCard:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-medium);
}

.contentCard h4 {
  color: var(--primary);
  font-size: 1.15em;
  margin-bottom: var(--spacing-md);
  font-weight: 600;
}

.contentCard p {
  color: var(--text-secondary);
  line-height: 1.7;
  font-size: 0.95em;
  margin-bottom: var(--spacing-sm);
}

/* Responsive */
@media (max-width: 768px) {
  .contentGrid {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }

  .educationalToggle h3 {
    font-size: 1.3em;
  }
}
```

---

### 📋 Tipos de Contenido Educativo Estándar

Dependiendo de la aplicación, incluir las secciones relevantes:

1. **Introducción Principal**
   - Explicación del concepto/herramienta
   - Por qué es importante
   - Casos de uso principales

2. **Características Detalladas**
   - Grid de 4-6 tarjetas
   - Cada característica con título, subtítulo y explicación extendida

3. **Estrategias/Métodos**
   - Enfoques diferentes para usar la herramienta
   - Niveles: básico, intermedio, avanzado

4. **Conceptos Clave**
   - Terminología importante
   - Definiciones claras y concisas

5. **Ejemplos Reales**
   - Casos prácticos con nombres de personas
   - Escenarios concretos y resultados

6. **FAQ (Preguntas Frecuentes)**
   - 5-7 preguntas más comunes
   - Respuestas detalladas

---

### ⚠️ EXCEPCIONES CRÍTICAS

**NUNCA ocultar detrás del toggle**:
- ✅ Disclaimers legales (finanzas, salud, jurídico)
- ✅ Advertencias de responsabilidad
- ✅ Avisos sobre uso de datos personales
- ✅ Términos de uso críticos

**Razón**: Responsabilidad jurídica. Estos avisos DEBEN estar visibles sin interacción del usuario.

---

### 🎨 Ejemplo de Referencia

Ver implementación completa en:
- **Ruta**: `C:\Users\jaceb\meskeia-web-nextjs\app\interes-compuesto\page.tsx`
- **CSS**: `C:\Users\jaceb\meskeia-web-nextjs\app\interes-compuesto\InteresCompuesto.module.css`

**Secciones implementadas**:
- El Poder del Interés Compuesto (6 feature cards)
- Estrategias de Inversión (4 strategy cards)
- Conceptos Clave (4 concept cards)
- Ejemplos Reales (4 example cards con nombres)
- FAQ (5 preguntas)

---

### ✅ Ventajas del Patrón

1. **UX optimizada**: Página limpia, enfocada en la acción
2. **SEO completo**: Google indexa contenido colapsado (verificado)
3. **Engagement opcional**: Usuarios eligen profundizar o no
4. **Consistencia**: Patrón uniforme en todas las apps
5. **Responsabilidad**: Disclaimers siempre visibles

---

### 🚫 Prohibiciones

- ❌ NO crear componente reutilizable (cada app tiene contenido único)
- ❌ NO ocultar disclaimers legales
- ❌ NO omitir animación fadeIn (mejora UX)
- ❌ NO usar acordeones complejos (toggle simple es suficiente)

---

### 📊 Checklist de Contenido Educativo

Antes de considerar completa una app con contenido educativo:

```
[ ] ¿Estado showEducationalContent añadido?
[ ] ¿Sección de toggle después del disclaimer?
[ ] ¿Botón con texto dinámico (Ver/Ocultar)?
[ ] ¿Contenido educativo renderizado condicionalmente?
[ ] ¿Animación fadeIn implementada?
[ ] ¿Disclaimer SIEMPRE visible (no colapsado)?
[ ] ¿Estilos CSS completos para todas las secciones?
[ ] ¿Responsive design para móviles?
[ ] ¿Mínimo 3-5 secciones de contenido educativo?
[ ] ¿Ejemplos con nombres de personas (humanización)?
```

---

## 🔄 PROCESO AUTOMÁTICO ANTES DE GENERAR CÓDIGO

### 1. Detectar tipo de archivo
- ¿HTML/CSS? → Aplicar diseño meskeIA + logo + footer + meta tags traducción
- ¿Python Flask? → Aplicar .env + formato español
- ¿JavaScript? → Aplicar formato español + localStorage

### 2. Auto-aplicar reglas SIN PREGUNTAR
- NO decir "voy a aplicar meskeIA"
- NO pedir confirmación
- DIRECTAMENTE generar con estándares

### 3. Verificar antes de entregar
- ✅ ¿Colores meskeIA (#2E86AB) aplicados?
- ✅ ¿Logo y footer oficiales incluidos?
- ✅ ¿Botón compartir con icono 🔗? (CRÍTICO: no omitir emoji)
- ✅ ¿Meta tags de traducción? (<html translate="yes"> + meta google)
- ✅ ¿Contenido educativo colapsable? (si la app tiene contenido educativo)
- ✅ ¿Disclaimers SIEMPRE visibles? (nunca colapsados)
- ✅ ¿Formato español en números?
- ✅ ¿API keys en .env?
- ✅ ¿Todo en español?

---

## 🚫 PROHIBICIONES ABSOLUTAS

NUNCA:
- Generar HTML sin colores meskeIA (#2E86AB)
- Omitir logo oficial en aplicaciones web
- Usar formato US para números/fechas
- Hardcodear API keys
- Generar código en inglés (excepto libs)
- Preguntar "¿quieres aplicar meskeIA?"
- Decir "no he incluido el logo, ¿lo añado?"
- Usar imágenes externas para el logo

---

## ✅ SI OLVIDAS UNA REGLA

Si generas código sin cumplir estas reglas:
1. Auto-corregirte inmediatamente
2. Regenerar código completo con estándares
3. NO esperar a que el usuario te lo recuerde

---

## 📊 CHECKLIST MENTAL OBLIGATORIO

### FASE 1: Validación de Código
Antes de terminar la generación de código:
```
[ ] ¿Paleta oficial #2E86AB? (si HTML/CSS)
[ ] ¿Logo oficial con CSS completo? (si app web)
[ ] ¿Footer unificado con glassmorphism? (si app web nov 2025+)
[ ] ¿Botón compartir con emoji 🔗? (CRÍTICO: verificar que aparece 🔗 Compártela)
[ ] ¿Meta tags de traducción? (<html translate="yes"> + meta google) (si HTML)
[ ] ¿Script Analytics v2.0? (antes de </body>)
[ ] ¿Contenido educativo colapsable implementado? (REGLA #7, si hay contenido educativo)
[ ] ¿Disclaimers SIEMPRE visibles? (nunca dentro del toggle colapsable)
[ ] ¿Formato español? (números, fechas, moneda)
[ ] ¿API keys en .env? (si hay claves)
[ ] ¿Todo en español? (comentarios, variables)
[ ] ¿icon_meskeia.png copiado?
```

### FASE 2: Validación de Integración (si es nueva app meskeIA)
Después de crear la app, verificar integración completa (REGLA #6):
```
[ ] ¿Actualizado index.html? (JS array + HTML <li>)
[ ] ¿Actualizado herramientas/index.html?
[ ] ¿Guía creada en guias/[categoria]/?
[ ] ¿Enlace en guias/index.html?
[ ] ¿ai-index.json actualizado? (total + entrada)
[ ] ¿sitemap.xml con 2 URLs?
[ ] ¿robots.txt actualizado?
[ ] ¿awesome-spanish-toolkit/README.md?
[ ] ¿Contadores consistentes en todos los archivos?
[ ] ¿Enlaces probados en navegador?
```

### FASE 3: Git y Deployment
```
[ ] ¿Commits con mensajes descriptivos?
[ ] ¿Push a ambos repositorios?
[ ] ¿Usuario informado sobre FTP/Search Console?
```

---

# 📁 PARTE 2: CONTEXTO DE PROYECTOS Y COMANDOS

## Proyecto Principal: API-ANTHROPIC (Cliente Web para Claude)

### Descripción
Aplicación web local para interactuar con la API de Claude (Anthropic) con interfaz intuitiva y gestión de conversaciones.

### Stack Tecnológico
- **Backend**: Flask 2.3+ con Flask-CORS para servidor proxy
- **Frontend**: HTML5, CSS3 con variables CSS personalizadas, JavaScript vanilla
- **API**: Integración con Anthropic API (Claude Sonnet)
- **Diseño**: Paleta minimalista meskeIA (#2E86AB)

### Comandos del Proyecto
```bash
# Iniciar aplicación (Windows)
start_app.bat

# O manualmente:
# 1. Activar entorno virtual
venv\Scripts\activate

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Ejecutar servidor Flask
python server.py

# El servidor se ejecuta en http://localhost:5000
```

### Estructura del Proyecto
```
api-anthropic/
├── index.html          # Interfaz web principal
├── style.css          # Estilos con paleta meskeIA
├── script.js          # Lógica del cliente
├── server.py          # Servidor Flask/proxy API
├── start_app.bat      # Script inicio rápido (Windows)
├── requirements.txt   # Dependencias Python
├── venv/             # Entorno virtual Python
└── uploads/          # Directorio para archivos subidos
```

---

## Ubicaciones Principales de Proyectos

- **C:\Users\jaceb\meskeIA\Web meskeIA** - Sitio web principal con aplicaciones web
- **C:\Users\jaceb\meskeIA\XElements** - Aplicaciones Flask (Contabilidad, Cartera Inversiones)
- **C:\Users\jaceb\meskeIA\Mis Programas** - Utilidades y herramientas diversas
- **C:\Users\jaceb\meskeIA\Proyectos** - Proyectos en desarrollo

---

## Comandos Comunes

### Proyectos Flask
```bash
# Activar entorno virtual
python -m venv venv
venv\Scripts\activate  # Windows

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar aplicación Flask
python app.py
# o
flask run

# Verificar base de datos SQLite
python check_db.py

# Usar script de inicio rápido (Windows)
start_app.bat
```

### Proyectos Node.js
```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev
# o
node server.js
```

### Proyectos Web estáticos
```bash
# Abrir directamente en navegador
start index.html

# O usar servidor Python simple
python -m http.server 8000
```

---

## Stack Tecnológico Principal

- **Backend**: Flask 2.3+ con SQLAlchemy y SQLite
- **Frontend**: HTML5, Bootstrap 5, JavaScript ES6, Chart.js
- **Bases de datos**: SQLite para desarrollo local
- **APIs**: Integración con Anthropic API y Google AI

---

## Consideraciones Importantes

- **Idioma**: Todos los mensajes, comentarios y documentación en español
- **Conversaciones**: SIEMPRE responder en español en VS Code
- **Entorno**: Windows con Git Bash disponible
- **Python**: Usar rutas de Windows con backslashes o raw strings
- **Seguridad**: No incluir claves API en el código, usar archivos .env
- **Base de datos**: SQLite para persistencia local, no usar en producción

---

## 🤖 SISTEMA DE AGENTES DE DESARROLLO

### Ubicación
- **Ruta**: C:\Users\jaceb\Mis Desarrollos\Agentes\
- **Total**: 21 agentes especializados
- **Documentación**: documentacion/INVENTARIO_AGENTES.md
- **Estructura**: Organizada por fases (fase-1-core, fase-2-inteligencia, fase-3-monitoring, fase-4-mejoras)

### 🎭 Testing Automatizado con Playwright

**Configuración de permisos**: Playwright está configurado para ejecutarse SIN confirmaciones continuas.

**Ubicación del archivo de permisos**: `C:\Users\jaceb\.claude\settings.local.json`

**Permisos habilitados**:
```json
{
  "permissions": {
    "allow": [
      "Bash(dir:*)",          // Comandos de directorio
      "Bash(git:*)",          // Operaciones Git sin confirmación
      "mcp__playwright__*",   // TODAS las herramientas Playwright
      "mcp__chrome-devtools__*", // Chrome DevTools para debugging
      "WebFetch(domain:meskeia.com)",
      "WebSearch"
    ]
  }
}
```

**Herramientas Playwright disponibles** (36 herramientas, todas sin confirmación):
- **Navegación**: navigate, new_page, close_page, go_back, go_forward, reload, wait_for
- **Automatización**: click, fill, hover, drag, upload, select, press
- **Captura**: snapshot, take_screenshot, console_messages, network_requests
- **Emulación**: set_viewport, set_user_agent, set_device
- **Performance**: start_trace, stop_trace, get_metrics
- **Debugging**: evaluate_script, list_console_messages, get_dom_snapshot

**Agentes de testing disponibles**:
- `fase-4-mejoras/descartadas/playwright/qa_tester_playwright.py` - Testing automatizado completo
- `chrome_devtools_agent.txt` - Debugging con Chrome DevTools
- `qa_testing_automatico.txt` - Suite de pruebas automáticas

**Uso**: Cuando se solicite testing o revisión de aplicaciones, Claude Code ejecutará Playwright automáticamente sin pedir confirmaciones repetitivas.

### Herramientas de Validación

#### Validador de Proyectos
```bash
# Validar proyecto actual
python "C:\Users\jaceb\Mis Desarrollos\Agentes\fase-1-core\validadores\validar_proyecto.py"

# Validar proyecto específico
python "C:\Users\jaceb\Mis Desarrollos\Agentes\fase-1-core\validadores\validar_proyecto.py" "ruta/proyecto"
```

El validador verifica:
- ✅ Paleta meskeIA correcta (#2E86AB vs #7C3AED incorrecto)
- ✅ Logo oficial (meskeia-logo-container vs imagen externa)
- ✅ Footer oficial ("© 2025 meskeIA")
- ✅ Formato español en números
- ✅ API keys NO hardcodeadas

#### Aplicar Logo y Footer Automáticamente
```bash
python "C:\Users\jaceb\Mis Desarrollos\Agentes\fase-1-core\aplicadores\aplicar_logo_footer.py" index.html
```

---

## 🎯 OBJETIVO FINAL

El usuario NO debe recordarte estas reglas.
Claude debe aplicarlas AUTOMÁTICAMENTE.
**100% cumplimiento en cada generación de código.**