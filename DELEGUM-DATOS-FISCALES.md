# Delegum · Procedimiento para añadir una ficha de Datos Fiscales

Guía operativa para crear una **ficha nueva** en `delegum.com/datos-fiscales/<slug>/`.
Replica el patrón de las 6 fichas existentes (IRPF, IVA, SMI, RETA, ITP, intereses).

> Contexto de fondo (idea D, arquitectura Delegum, gotchas técnicos): ver la memoria
> `project_delegum_sitio_propio.md`. Este documento es el **checklist de ejecución**.

---

## Principios

- **Fuente única de datos**: todos los números salen de `data/fiscal/*.ts`. NUNCA hardcodear
  en la ficha. Si el dato no existe, primero se crea/actualiza el módulo en `data/fiscal/`
  con su `FISCAL_*_META` (`fuente`, `verificado`, `vigencia`, `urlOficial`).
- **CSS compartido**: usar `app/delegum/datos-fiscales/Ficha.module.css`. NO crear CSS nuevo.
- **Chrome heredado**: el header/footer de Delegum y la tipografía Sora los pone el layout
  compartido `app/delegum/layout.tsx`. La ficha NO importa FixedHeader/Footer/ShareCard.
- **Disclaimer**: dato fiscal = Nivel 1 CRÍTICO → `<DisclaimerCard variant="financial" severity="critical" />`
  + `<DataReference …>` con el META del módulo.
- **Lenguaje**: "plataforma"/"datos", nunca "asesoría" en positivo (sí en negaciones protectoras).
  Neutralidad editorial (ver CLAUDE.md).

---

## Archivos a crear/tocar por cada ficha nueva (slug = p.ej. `sucesiones-isd`)

### 1. Datos (si no existen)
- `data/fiscal/<modulo>.ts` con `FISCAL_<X>_META` + las constantes. Exportado en `data/fiscal/index.ts`.

### 2. La ficha (3 archivos en `app/delegum/datos-fiscales/<slug>/`)
- **`metadata.ts`** — copiar de `irpf-tramos-minimos/metadata.ts`:
  - `title`, `description`, `keywords`, `alternates.canonical` = `https://delegum.com/datos-fiscales/<slug>/`
  - `jsonLd` tipo `Dataset` (name, description, url, isBasedOn = urlOficial, dateModified = verificado,
    temporalCoverage = vigencia, spatialCoverage España, variableMeasured, keywords)
  - `faqJsonLd` tipo `FAQPage` con **5 preguntas reales** con datos concretos (sin mencionar "meskeIA").
  - `icons` Delegum (favicon.svg, favicon-32.png, app-icon-180.png).
- **`layout.tsx`** — idéntico al de cualquier ficha: `export { metadata }` + inyecta `jsonLd` y `faqJsonLd`
  como dos `<script type="application/ld+json">`. (No lleva Sora ni chrome; lo aporta el layout padre.)
- **`page.tsx`** — `'use client'`; copiar estructura de una ficha existente:
  - `<AnalyticsTracker appName="delegum-datos-<slug>" />`
  - Hero (símbolo blanco + "Delegum" + kicker "Datos fiscales · Referencia" + h1 + subtitle + badge verificado)
  - `<DisclaimerCard variant="financial" severity="critical" />` + `<DataReference …>`
  - Secciones con tablas servidas desde `data/fiscal` (usar `formatCurrency`/`formatDate` de `@/lib`)
  - Bloque "Cómo citar" (con botón copiar)
  - CTA a la calculadora de meskeIA relevante (https://meskeia.com/<app>/)
  - `brandFoot` (pertenencia a meskeIA)
  - Estilos desde `../Ficha.module.css`

### 3. Índice de datos-fiscales
- `app/delegum/datos-fiscales/page.tsx` → añadir objeto al array `FICHAS`
  (icon, titulo, desc, href `/datos-fiscales/<slug>`, verificado = `FISCAL_<X>_META.verificado`).
  Importar el META nuevo arriba.

### 4. Endpoint JSON (capa 2 IA)
- `app/api/datos/[slug]/route.ts` → añadir entrada al objeto `DATASETS` (meta + datos).
- `app/api/datos/route.ts` → añadir entrada a la lista `DATASETS` del índice.

### 5. llms.txt
- `public/llms.txt` → en la sección **"## Delegum — datos fiscales citables"**, añadir la línea:
  `- [<Nombre>](https://delegum.com/datos-fiscales/<slug>/) — JSON: https://delegum.com/api/datos/<slug>/`

### 6. Sitemap
- `public/delegum-sitemap.xml` → añadir un bloque `<url>` con
  `https://delegum.com/datos-fiscales/<slug>/` (con barra final), `lastmod`, `changefreq monthly`, `priority 0.8`.

### NO hace falta tocar
- `proxy.ts` — el matcher `/datos-fiscales/:path*` ya cubre cualquier ficha nueva.
- `next.config.ts`, robots, el chrome, el CSS.

---

## Verificación (antes de commit)

```bash
npm run build            # exit 0; comprueba que la ficha sale prerenderizada (○)
# JSON-LD de la ficha (debe haber 1 Dataset + 1 FAQPage):
grep -o '"@type":"Dataset"\|"@type":"FAQPage"' .next/server/app/delegum/datos-fiscales/<slug>.html | sort | uniq -c
```

Prueba por host (OJO: matar el puerto antes, si no `next start` deja el build viejo sirviendo):
```bash
npx kill-port 3050; (npm run start &) ; sleep 12
curl -s -H "Host: delegum.com" http://localhost:3050/datos-fiscales/<slug>/ -o /dev/null -w "%{http_code}\n"   # 200
curl -s -H "Host: delegum.com" http://localhost:3050/api/datos/<slug>/ -o /dev/null -w "%{http_code}\n"        # 200 (con barra)
curl -s -H "Host: delegum.com" http://localhost:3050/llms.txt | grep -c "<slug>"                               # 1
```
Luego commit + push (deploy automático en Vercel).

---

## Gotchas aprendidos (no repetir errores)

- **Route handlers + `trailingSlash:true`**: los endpoints JSON van bajo `/api` y se sirven **CON barra
  final** (`/api/datos/<slug>/`). Fuera de `/api` o como `force-static` dan 308→404.
- **`next start` no ejecuta el proxy sobre estáticos** (llms.txt, sitemap): por eso llms.txt y sitemap
  son ficheros en `public/`, no rutas.
- **URLs canónicas con barra final** siempre (`trailingSlash:true`).
- En GSC (propiedad de Dominio) el sitemap se envía con **URL completa** `https://delegum.com/delegum-sitemap.xml`.

---

## Candidatos de fichas pendientes (verificar que el módulo tiene datos + META)

| Posible slug | Módulo `data/fiscal/` | Contenido |
|---|---|---|
| `sucesiones-isd` | `sucesiones.ts` | Impuesto de Sucesiones por CCAA (grupos, bonificaciones) |
| `donaciones` | `donaciones.ts` | Impuesto de Donaciones por CCAA |
| `impuesto-sociedades` | `sociedades.ts` | Tipos IS (general, pyme, microempresa) |
| `pensiones-jubilacion` | `pensiones.ts` | % por años cotizados, pensión máx/mín, coef. anticipada |
| `impuesto-patrimonio` | `patrimonio.ts` | Escalas IP por CCAA, mínimo exento |
| `iprem` | `iprem.ts` | IPREM (anual/mensual/diario) y usos |
| `amortizacion-inmovilizado` | `amortizacion.ts` | Coeficientes de amortización por tipo de activo |

Antes de proponer una, **grepear** que el dato existe y tiene `FISCAL_*_META`, y elegir la calculadora
de meskeIA correspondiente para el CTA.
