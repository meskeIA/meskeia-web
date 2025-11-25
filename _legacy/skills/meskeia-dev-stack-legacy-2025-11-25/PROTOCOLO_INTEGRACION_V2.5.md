# 🔗 PROTOCOLO DE INTEGRACIÓN COMPLETA - v2.5

Este archivo contiene el protocolo COMPLETO de integración de nuevas aplicaciones meskeIA.

**USAR COMO REFERENCIA** para actualizar la PARTE 9 del skill.md

---

## FASE 2.1: Actualizar index.html principal ⭐

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

## FASE 2.2: Actualizar herramientas/index.html

**Ruta**: `C:\Users\jaceb\meskeia-web\herramientas/index.html`

**A) Actualizar meta description** (línea ~10):
- Cambiar "XX aplicaciones" al número correcto

**B) Añadir entrada en la categoría**:
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

## FASE 2.3: Crear Guía Educativa SEO-optimizada

**Ruta**: `C:\Users\jaceb\meskeia-web\guias/[categoria]/nombre-app-guia.html`

**Categorías disponibles**:
- finanzas-fiscalidad/
- herramientas-de-productividad/
- calculadoras-utilidades/
- matematicas-estadistica/
- creatividad-diseno/
- juegos-entretenimiento/
- salud-bienestar/
- emprendimiento-negocios/

**Requisitos**: 1800-2500 palabras con estructura completa (ver CLAUDE.md REGLA #6 para detalles)

**Actualizar**: `C:\Users\jaceb\meskeia-web\guias/index.html`

---

## FASE 2.4: Actualizar ai-index.json

**Ruta**: `C:\Users\jaceb\meskeia-web\ai-index.json`

**A) Actualizar `total_tools`** (incrementar en 1)
**B) Añadir entrada completa** con todos los campos

---

## FASE 2.5: Actualizar sitemap.xml

**Añadir 2 URLs**: app + guía

---

## FASE 2.6: Actualizar robots.txt

**A) Actualizar contador total**
**B) Añadir a lista de nuevas apps (si es del mes actual)**
**C) Actualizar fecha**

---

## FASE 2.7: Actualizar awesome-spanish-toolkit

**Ruta**: `C:\Users\jaceb\awesome-spanish-toolkit\README.md`

Añadir entrada en la categoría correspondiente.

---

## FASE 3: Control de Calidad

Verificar TODOS los enlaces y contadores antes de commit.

---

## FASE 4: Git y Deployment

Commits en 2 repositorios (meskeia-web + awesome-spanish-toolkit).

---

## FASE 5: Recordatorio al Usuario

Informar sobre FTP, Google Search Console, etc.

---

## CHECKLIST COMPLETO: 26 PUNTOS

(Ver CLAUDE.md REGLA #6 para checklist completo)
