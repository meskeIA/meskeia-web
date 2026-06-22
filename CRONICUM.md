# CRONICUM.md — Vertical de Historia interactiva

> Documento de estado del vertical **Cronicum** (`cronicum.com`). Registra lo
> realizado, lo pendiente y lo descartado. Complementa `CLAUDE.md` y los
> `DELEGUM-*.md`. Última actualización: **2026-06-22**.

---

## 1. Qué es Cronicum

Tercer portal vertical de meskeIA (tras la web horizontal meskeIA y **Delegum**,
el vertical fiscal). Cronicum es una **web de Historia interactiva en español**
que reaprovecha las **142 cronologías** del sistema `visualizador-historia/[slug]`.

- **Objetivo**: marca + tráfico/SEO + descubribilidad por IAs. **NO** es premium
  ni monetizable; su valor es la captación orgánica, la autoridad de marca y el
  retorno de citas de IAs hacia el ecosistema meskeIA.
- **Diferenciador**: doble eje de navegación —"El mundo" (geográfico) y "La
  historia de las cosas" (temático)— que ningún competidor en español (World
  History Encyclopedia, etc.) ofrece de forma interactiva.
- **Ventaja estructural frente a Delegum**: contenido **perenne** (la historia no
  caduca) → mantenimiento casi nulo, sin la carga normativa anual de Delegum.

### Identidad de marca

- **Nombre**: Cronicum (de "crónica" + sufijo neutro latino `-um`). Adopta el
  **sistema de nomenclatura `-um`** como firma de los verticales de la casa
  (Deleg·um, Cronic·um). meskeIA = paraguas generalista; los `-um` = verticales
  cultos especializados.
- **Logo**: set Terracota reaprovechado (el que Delegum descartó). Símbolo de 3
  trazos cálidos que convergen en un nodo luminoso + 3 puntos base. Concepto:
  *"raíces/orígenes + luz del conocimiento"*. Assets en `public/cronicum/`.
- **Paleta**: terracota `#A24B2A` (títulos), ámbar `#C9742E` (hover), borde
  tarjeta `#C46A3A`, hero/footer tile cálido `#241C18 → #13100D`.
- **Tipografía**: serif **Lora** (`--font-lora`).
- **Portfolio por temperatura**: meskeIA (paraguas) · Delegum (marino frío
  `#16244C`) · Cronicum (terracota cálido).

---

## 2. Arquitectura técnica

Cronicum **no es un proyecto/repo aparte**: vive en el mismo proyecto Vercel y
repo que meskeIA, servido por **host-rewrite** (igual que Delegum).

- **`proxy.ts`** (raíz): detecta el host. `cronicum.com/*` → reescribe a
  `/cronicum/*`. Matcher amplio `'/((?!api|_next|.*\\..*).*)'` + entradas
  explícitas `/sitemap.xml`, `/robots.txt`, `/llms.txt` (rutas con punto). Para
  hosts que no son de marca hace `next()` de inmediato → **meskeIA y Delegum sin
  cambios**.
- **Dominio**: `cronicum.com` en Cloudflare (registrado 22/06/2026, auto-renew,
  exp. 22/06/2027). DNS: CNAME `@` + CNAME `www` → `ed322da4735d6b97.vercel-dns-017.com`
  (mismo target que Delegum, es a nivel de proyecto), ambos **DNS only** (nube
  gris). `www.cronicum.com` → 308 → apex (configurado en Vercel).

### Estructura de archivos

```
app/cronicum/
├── page.tsx                 # Home (hero + doble eje + banda + "Qué es")
├── layout.tsx               # CronicumHeader/Footer + Lora + Organization JSON-LD
├── metadata.ts              # SEO + siteJsonLd
├── CronicumHome.module.css
├── sitemap.ts               # → /cronicum/sitemap.xml (155 URLs)
├── robots-txt/route.ts      # → /cronicum/robots-txt (robots.ts no se puede anidar)
├── llms-txt/route.ts        # → /cronicum/llms-txt (capa IA)
└── [slug]/                  # Ruta ÚNICA: sirve puertas Y cronologías
    ├── page.tsx             # ramifica: puerta → PuertaView | cronología → HistoriaInteractivo
    ├── layout.tsx           # JSON-LD por página (Collection / WebApp+FAQ+Breadcrumb)
    ├── PuertaView.tsx       # rejilla de cronologías de una puerta
    ├── Migas.tsx            # breadcrumb Cronicum / Puerta / Cronología
    ├── Puerta.module.css
    └── Migas.module.css

components/CronicumHeader.tsx · CronicumFooter.tsx (+ .module.css)
data/cronicum/puertas.ts     # mapeo 142 cronologías → 11 puertas + helpers
public/cronicum/             # logo, favicons, app-icons
```

> **Nota de diseño clave**: Next no permite dos *dynamic segments* hermanos, por
> eso `[slug]` sirve **tanto puertas como cronologías** (ramifica con
> `getPuerta` / `getHistoria`). Las cronologías reutilizan el componente
> `HistoriaInteractivo` de `visualizador-historia/[slug]` mediante la prop
> `marca='cronicum'`, que **oculta el chrome de meskeIA** (logo, RelatedApps,
> ShareCard, Footer, LegalNotice) y usa `topSlot` para las migas. El modo
> `marca='meskeia'` (por defecto) deja la ruta original intacta.

### Estructura de contenido — las 11 puertas (doble eje)

**Eje "El mundo"** (59): Mundo Antiguo (9) · Asia (10) · Europa (16) · América
(16) · Civilizaciones precolombinas (6) · África y Oceanía (2).

**Eje "La historia de las cosas"** (72): Ciencia y tecnología (16) · Comunicación
y mundo digital (16) · Arte, cultura y deporte (15) · Economía, derecho e ideas
(13) · Vida cotidiana y salud (12).

**Banda transversal**: Grandes acontecimientos (11).

> Mapeo completo en `data/cronicum/puertas.ts`. Cada cronología pertenece a UNA
> puerta. América + precolombinas (22) = mayor activo diferencial para Latam.

---

## 3. ✅ Realizado (todo en producción)

- [x] Estrategia: Historia validada como vertical defendible.
- [x] Marca: nombre Cronicum + sistema `-um` + logo/paleta/tipografía.
- [x] Dominio `cronicum.com` (Cloudflare + Vercel + DNS + `www` → 308 apex).
- [x] Host-rewrite en `proxy.ts` (sin afectar a meskeIA ni Delegum).
- [x] Home con doble eje, marca propia.
- [x] 11 puertas (`PuertaView`) que listan sus cronologías.
- [x] 142 cronologías navegables **bajo marca Cronicum** (sin chrome meskeIA).
- [x] Breadcrumb `Cronicum / Puerta / Cronología` + `BreadcrumbList` JSON-LD.
- [x] SEO: JSON-LD (WebApplication + FAQPage + CollectionPage + Organization).
- [x] `sitemap.xml` (155 URLs) — enviado a **Google Search Console** (Correcto,
      155 págs) y **Bing WMT**.
- [x] `robots.txt` propio (apunta al sitemap de Cronicum).
- [x] **Capa IA**: `llms.txt` curado (resumen + 11 puertas + 142 cronologías).

---

## 4. ⏳ Pendiente (sin prisa, opcional)

- [ ] **301** `meskeia.com/visualizador-historia/*` → `cronicum.com/[slug]`.
      **Esperar ~3-4 semanas** a que cronicum.com esté indexado antes de hacerlo
      (transferir autoridad a URLs ya conocidas, evitar bache de ranking). El SEO
      a transferir es pequeño (historia tenía ~0 visitas externas). Buen
      candidato para `/schedule`.
- [ ] **África y Oceanía** solo tiene 2 cronologías → lista natural de
      crecimiento de contenido (Egipto islámico, Imperio de Malí, Nueva
      Zelanda…), cuando se quiera.
- [ ] Posible "más cronologías de esta puerta" al pie de cada cronología (extra
      de enlazado interno; `getPuertaDeCronologia` ya disponible).

---

## 5. ❌ Descartado

- **Blog**: la historia no tiene flujo natural de novedades como Delegum
  (normativa); serían artículos de autor = compromiso de creación continua no
  sostenible con los frentes abiertos. Puerta abierta si en el futuro se quiere
  escribir (patrón Blog→Visualizador de Delegum disponible).
- **MCP de historia**: el MCP encaja con dominios de cálculo/consulta (Delegum:
  IRPF, pensiones…), no con contenido narrativo. Aporta poco sobre web + RAG
  sobre el contenido ya estructurado. No replicar.
- **Endpoint JSON / API de datos**: sin un MCP que lo consuma, no lo descubre
  nadie. Innecesario.
- **Otros verticales** valorados y descartados en la misma sesión: Fotografía
  (PhotoPills domina con ventaja estructural), Deporte (los wearables tienen el
  dato biométrico), Inmobiliaria (redundante con Delegum).

---

## 6. Notas operativas

- **Webhook Git → Vercel intermitente**: a veces un `push` a `main` **no**
  dispara el build automático (ocurrió con varios commits de Cronicum). Solución
  fiable: `git commit --allow-empty -m "chore: fuerza deploy" && git push`. Si ni
  así, revisar Vercel → Settings → Git o desplegar con `vercel --prod`.
- **Build Vercel** ~8 min (añade ~142 páginas SSG extra: las cronologías se
  generan también bajo `/cronicum`).
- **JSON-LD**: se inyecta como texto del `<script type="application/ld+json">`
  (soportado por React 19), **no** mediante el atributo de innerHTML peligroso
  (lo bloquea un hook de seguridad del repo).
- **`robots.ts` y `llms.txt`**: Next solo genera `robots.txt` desde la raíz (no
  anidado); por eso Cronicum los sirve con **Route Handlers** (`robots-txt`,
  `llms-txt`) que el proxy reescribe desde `/robots.txt` y `/llms.txt`.

---

**Proyecto**: meskeIA Web · **Vertical**: Cronicum (https://cronicum.com)
