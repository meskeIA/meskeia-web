# CLAUDE.md - Instrucciones específicas del proyecto meskeia-web

> **NOTA**: Este archivo complementa las instrucciones globales en `~/.claude/CLAUDE.md`
> Las reglas comunes (paleta meskeIA, TypeScript, formato español, etc.) están en el archivo global.

## Proyecto: meskeia-web

### Ubicación
- **Repositorio**: `C:\Users\jaceb\meskeia-web`
- **Hosting**: Vercel (meskeia.com)
- **Despliegue**: Automático via GitHub push a main

---

## Arquitectura de Clasificación: Suites + Momentos

meskeIA usa un sistema de clasificación bidimensional para organizar las apps:

### Suites Temáticas (12) - "¿Qué problema resuelve?"

Clasificación **NO excluyente**: una app puede pertenecer a múltiples suites.

| ID | Suite | Icono | Descripción |
|----|-------|-------|-------------|
| `fiscal` | Fiscal y Herencias | 🏛️ | Impuestos, herencias, donaciones |
| `inmobiliaria` | Inmobiliaria y Hogar | 🏘️ | Hipotecas, alquiler, gestión hogar |
| `finanzas` | Finanzas e Inversión | 📈 | Ahorro, inversión, planificación |
| `freelance` | Freelance y Autónomo | 💼 | Herramientas para independientes |
| `marketing` | Marketing y Contenido | 📢 | SEO, redes sociales, contenido |
| `diseno` | Diseño y Desarrollo | 🎨 | Herramientas para diseñadores/devs |
| `estudiantes` | Estudiantes | 🧮 | Matemáticas, ciencias, estudio |
| `salud` | Salud y Bienestar | 🏥 | Salud, nutrición, mascotas |
| `juegos` | Juegos y Ocio | 🎲 | Diversión y entretenimiento |
| `cultura` | Cultura General | 📚 | Conocimiento, referencias |
| `productividad` | Productividad | ⚡ | Organización personal |
| `tecnicas` | Herramientas Técnicas | 🔧 | Herramientas especializadas |

### Momentos (7) - "¿Cuándo lo usas?"

Clasificación **NO excluyente**: una app puede aplicar a múltiples momentos.

| ID | Momento | Icono |
|----|---------|-------|
| `trabajo` | En el trabajo | 💼 |
| `estudio` | Estudiando | 🎓 |
| `casa` | En casa | 🏠 |
| `dinero` | Gestionando dinero | 💰 |
| `creando` | Creando contenido | 🎨 |
| `relax` | Tiempo libre | 🎮 |
| `curiosidad` | Por curiosidad | 🔍 |

### Archivos de datos

| Archivo | Descripción |
|---------|-------------|
| `data/suites.ts` | Definición de las 12 suites (id, name, icon, description) |
| `data/applications.ts` | Base de datos de apps (re-exporta suites y moments) |
| `data/implemented-apps.ts` | URLs de apps realmente implementadas |
| `data/app-relations.ts` | Cross-linking entre apps |
| `public/ai-index.json` | Índice para indexación por IAs |

---

## Reglas OBLIGATORIAS al crear nuevas apps

### 1. Cada app DEBE tener al menos una Suite

```typescript
// En data/applications.ts
{
  name: "Calculadora de IVA",
  suites: ['fiscal', 'freelance'],  // OBLIGATORIO: mínimo 1 suite
  contexts: ['trabajo', 'dinero'],   // OBLIGATORIO: mínimo 1 momento
  icon: "🧾",
  description: "...",
  url: "/calculadora-iva/",
  keywords: [...]
}
```

### 2. Cada app DEBE tener al menos un Momento (context)

El campo `contexts` indica cuándo el usuario típicamente usaría la app.

### 3. Checklist al crear nueva app

```
[ ] 1. Crear carpeta app/[nombre-app]/ con metadata.ts, page.tsx, .module.css
[ ] 2. Añadir entrada en data/applications.ts:
      - suites: SuiteType[] (OBLIGATORIO, mínimo 1)
      - contexts: MomentType[] (OBLIGATORIO, mínimo 1)
[ ] 3. Añadir URL en data/implemented-apps.ts
[ ] 4. Añadir relaciones en data/app-relations.ts
[ ] 5. Ejecutar npm run build (verificar que compila)
[ ] 6. Commit y push a GitHub
```

### 4. Ejemplo de app multi-suite

Una app puede resolver múltiples problemas:

```typescript
{
  name: "Simulador de Hipoteca",
  suites: ['inmobiliaria', 'finanzas'],  // Problema inmobiliario Y financiero
  contexts: ['dinero', 'casa'],           // Cuando gestionas dinero O en casa
  // ...
}
```

---

## Componentes disponibles

Ver `components/README.md` para documentación completa.

---

## Para instrucciones completas

Las instrucciones detalladas de desarrollo están en:
- **Global**: `~/.claude/CLAUDE.md` (aplicable a todos los proyectos meskeIA)
- **Componentes**: `components/README.md`
- **Estrategia**: `ESTRATEGIA-NUEVA-WEB-MESKEIA.md`

---

## Control de versiones de este documento

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.1.0 | 2025-12-21 | Añadida arquitectura Suites + Momentos |
| 1.0.0 | 2025-12-19 | Versión inicial |
