# meskeIA

Plataforma de aplicaciones web gratuitas en español: calculadoras, conversores, simuladores, visualizadores y herramientas del día a día. Más de 1.100 aplicaciones en producción (julio 2026), sin registro y sin publicidad.

**Producción**: [meskeia.com](https://meskeia.com)

---

## Ecosistema

Además de la web principal (horizontal), el catálogo alimenta portales verticales temáticos servidos desde el mismo repositorio mediante host-rewrite:

| Portal | Dominio | Temática |
|---|---|---|
| Delegum | delegum.com | Fiscal, laboral y finanzas (España) |
| Cronicum | cronicum.com | Historia interactiva (cronologías) |
| Stemum | stemum.com | Simuladores y visualizadores STEM |
| Coquinum | coquinum.com | Gastronomía y cocina técnica |

También se exponen herramientas vía [MCP](https://meskeia.com/developers/) para asistentes de IA.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **CSS Modules** con dark mode completo
- **Turso** (libSQL) para analytics propio, anónimo y agregado
- Despliegue automático en **Vercel** (push a `main`)

## Comandos

```bash
npm run dev        # desarrollo (http://localhost:3050)
npm run build      # build de producción
npm run lint       # ESLint
npm run test:unit  # tests de formatters
```

## Estructura

```
app/           # una carpeta por aplicación (App Router)
components/    # componentes compartidos (ver components/README.md)
data/          # catálogo, suites, relaciones, datos normativos (data/fiscal/)
lib/           # utilidades (formato español, schema-templates)
templates/     # plantilla base para apps nuevas
```

Las guías de desarrollo del proyecto viven en `CLAUDE.md`; la política de avisos legales en `DISCLAIMER-POLICY.md`.

---

**Última actualización**: julio 2026
