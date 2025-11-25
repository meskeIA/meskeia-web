# 🚀 meskeIA Development Stack - Skill Completa

## 📋 Descripción

Skill automatizada para generar aplicaciones web que cumplen al 100% con los estándares meskeIA, incluyendo:

- ✅ Paleta de colores oficial (#2E86AB)
- ✅ Logo y footer oficiales
- ✅ Diseño responsive móvil optimizado
- ✅ Formato español (números, fechas, moneda)
- ✅ API keys seguras (.env)
- ✅ Comentarios en español
- ✅ Validación automática post-generación

---

## 📁 Estructura de Archivos

```
meskeia-dev-stack/
├── SKILL.md                    # Instrucciones principales para Claude
├── README.md                   # Esta documentación
├── templates/
│   ├── base.html               # Template HTML base meskeIA
│   ├── flask_app.py            # Template Flask completo
│   └── manifest.json           # PWA manifest
├── snippets/
│   ├── logo.html               # Logo oficial completo
│   ├── footer.html             # Footer oficial
│   ├── localization.js         # Funciones formato español
│   ├── env.example             # Template .env
│   └── .gitignore              # Gitignore estándar
└── validators/
    └── checklist.json          # Checklist de validación
```

---

## 🎯 ¿Cuándo se Activa?

Esta skill se activa **automáticamente** cuando Claude Code detecta que el usuario solicita:

- "Crea una aplicación web"
- "Genera un proyecto Flask"
- "Haz una página HTML"
- "Desarrolla una PWA"
- "Aplicación para gestionar..."
- "Sitio web para..."

---

## ✅ Checklist Automático

Antes de entregar código, Claude verifica MENTALMENTE:

```
[✓] ¿Paleta oficial #2E86AB aplicada?
[✓] ¿Logo CSS completo (no imagen externa)?
[✓] ¿Footer "© 2025 meskeIA" incluido?
[✓] ¿Responsive móvil (@media max-width: 768px)?
[✓] ¿Formato español en números/fechas?
[✓] ¿API keys en .env (si aplica)?
[✓] ¿Comentarios en español?
[✓] ¿Viewport meta tag incluido?
[✓] ¿Favicon referenciado?
```

---

## 🔧 Uso Manual (Opcional)

Aunque la skill se activa automáticamente, puedes invocarla manualmente:

```
"Usa la skill meskeIA-dev-stack para generar esta app"
```

---

## 📱 Diseño Responsive Móvil

### Problema Resuelto

En proyectos anteriores se tuvo que rehacer el código responsive para móvil. **Esta skill lo previene** incluyendo automáticamente:

### Media Queries Obligatorias

```css
@media (max-width: 768px) {
    /* Logo responsive */
    .meskeia-logo-container { top: 10px; left: 10px; ... }

    /* Containers */
    .container { padding: 10px; }

    /* Grids a 1 columna */
    .filter-controls,
    .comparison-grid,
    .charts-section { grid-template-columns: 1fr; }

    /* Headers reducidos */
    header h1 { font-size: 1.8rem; }
}
```

### Reglas Responsive

1. **Mobile-first**: Diseño base para móvil
2. **Breakpoints**: < 768px (móvil), 769-1024px (tablet), > 1024px (desktop)
3. **Touch-friendly**: Botones mínimo 44x44px
4. **Texto legible**: Font-size mínimo 14px
5. **Sin scroll horizontal**: `max-width: 100%` siempre

---

## 🎨 Paleta de Colores Oficial

```css
:root {
    --primary: #2E86AB;       /* Azul meskeIA */
    --secondary: #48A9A6;     /* Teal meskeIA */
    --bg-primary: #FAFAFA;    /* Background */
    --bg-card: #FFFFFF;       /* Cards */
    --text-primary: #1A1A1A;  /* Texto principal */
    --border: #E5E5E5;        /* Bordes */
}
```

### ❌ Prohibido

- #7C3AED (violeta) - ES INCORRECTO
- #2DD4BF (turquesa) - ES INCORRECTO

---

## 💶 Formato Español

### JavaScript

```javascript
// Números: 1.234,56
numero.toLocaleString('es-ES')

// Moneda: 1.234,56 €
numero.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })

// Fechas: 30/09/2025
fecha.toLocaleDateString('es-ES')
```

### Python

```python
import locale
locale.setlocale(locale.LC_ALL, 'es_ES.UTF-8')

# Fechas
from datetime import datetime
datetime.now().strftime('%d/%m/%Y')
```

---

## 🔐 API Keys Seguras

### ❌ MAL (hardcodeado)

```javascript
const API_KEY = "sk-ant-1234567890"
```

### ✅ BIEN (en .env)

```javascript
const API_KEY = process.env.ANTHROPIC_API_KEY
```

```python
import os
API_KEY = os.getenv('ANTHROPIC_API_KEY')
```

---

## 📂 Templates Disponibles

### 1. base.html

Template HTML completo con:
- Paleta meskeIA
- Logo oficial
- Footer oficial
- Responsive móvil
- Scripts de localización

### 2. flask_app.py

Aplicación Flask con:
- Configuración .env
- Localización española
- CORS habilitado
- Manejo de errores

### 3. manifest.json

PWA manifest con:
- Theme color meskeIA
- Íconos configurados
- Idioma español

---

## 🔧 Snippets Avanzados (Opcionales)

**NOTA**: Estos snippets **NO se aplican automáticamente**. Solo se usan cuando el usuario solicita funcionalidades específicas.

### 4. htmx.html ⭐ NUEVO

**Cuándo usar**: Interactividad dinámica sin JavaScript complejo
- Búsqueda en tiempo real
- Filtros dinámicos
- Infinite scroll
- Validación instantánea de formularios

**Tamaño**: 14KB | **Compatible con**: Flask, cualquier backend

### 5. jinja_macros.html ⭐ NUEVO

**Cuándo usar**: Proyectos Flask con componentes repetitivos
- Dashboards con estadísticas
- Formularios complejos
- Tablas de datos
- Modales y alertas

**Macros incluidos**:
- `stat_card()` - Tarjetas de estadísticas
- `form_field()` - Campos de formulario
- `modal()` - Ventanas emergentes
- `alert()` - Notificaciones
- `tabla()` - Tablas de datos
- `paginacion()` - Controles de paginación

📖 **Documentación completa**: [snippets/README_SNIPPETS_AVANZADOS.md](snippets/README_SNIPPETS_AVANZADOS.md)

---

## 🧪 Validación Post-Generación

Después de generar código, Claude ejecuta automáticamente:

```bash
python "C:\Users\jaceb\Mis Desarrollos\Agentes\validar_proyecto.py"
```

El validador verifica:
- ✅ Paleta meskeIA correcta
- ✅ Logo oficial (no imagen externa)
- ✅ Footer oficial
- ✅ Formato español
- ✅ API keys NO hardcodeadas

---

## 🎯 Objetivo

**El usuario NO debe recordar aplicar estas reglas.**

**Claude Code las aplica AUTOMÁTICAMENTE con esta skill.**

**100% de cumplimiento en cada generación de código.**

---

## 📊 Estadísticas

- **Versión**: 2.1 (actualizado con snippets avanzados)
- **Fecha creación**: 17 de octubre de 2025
- **Última actualización**: 4 de noviembre de 2025
- **Agentes integrados**: 5 críticos
- **Templates**: 3 base
- **Snippets**: 7 (5 base + 2 avanzados opcionales)
- **Validaciones**: 15

---

## 🔄 Actualizaciones

### v2.1 (04/11/2025) ⭐ NUEVO
- ✅ Añadido `snippets/htmx.html` para interactividad dinámica
- ✅ Añadido `snippets/jinja_macros.html` con 6 macros reutilizables
- ✅ Documentación completa de snippets avanzados
- ✅ Ejemplos de uso completos incluidos
- ⚠️ **Uso manual**: No se aplican automáticamente

### v2.0 (17/10/2025)
- ✅ SEO completo integrado
- ✅ Integración automática con meskeIA
- ✅ Testing con Playwright
- ✅ Responsive móvil optimizado

### v1.0.0 (17/10/2025)
- ✅ Skill inicial creada
- ✅ Diseño responsive móvil integrado
- ✅ Templates base incluidos
- ✅ Validación automática configurada
- ✅ Snippets reutilizables añadidos

---

## 📞 Soporte

Si encuentras problemas con la skill:

1. Verifica que esté en `C:\Users\jaceb\.claude\skills\meskeia-dev-stack\`
2. Asegúrate de que `SKILL.md` existe
3. Reinicia Claude Code si es necesario
4. Pregunta a Claude: "¿Qué skills están disponibles?"

---

© 2025 meskeIA - Development Stack Skill
