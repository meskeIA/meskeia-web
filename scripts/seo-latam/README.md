# SEO LATAM ↔ ES — detección de dualidad terminológica

Activo reutilizable para detectar apps que usan **solo una variante regional** de un
término de dominio (España *vs* Hispanoamérica) y que, por tanto, pueden ser
**invisibles en las búsquedas del otro mercado** hispanohablante (~38 % del tráfico es LATAM).

## Origen

Descubierto en `simulador-puertas-logicas`: rankeaba por *"simulador de compuertas
lógicas"* (término LATAM) pese a usar solo *"puertas lógicas"* (España) en title y H1.
El sinónimo solo estaba, por casualidad, en la `description`. Ver commit `884248b4`.

## Archivos

| Archivo | Qué es |
|---|---|
| `glosario-es-latam.json` | Pares de términos de dominio que divergen ES↔LATAM. **Activo vivo**: ampliar con hallazgos de Search Console. |
| `detectar-candidatas-latam.mjs` | Escanea `app/<slug>/{metadata.ts,page.tsx}` y cruza con el glosario. No modifica nada, solo informa. |

## Uso

```bash
node scripts/seo-latam/detectar-candidatas-latam.mjs               # todo
node scripts/seo-latam/detectar-candidatas-latam.mjs --falta-latam # apps ES sin variante LATAM (caso principal)
node scripts/seo-latam/detectar-candidatas-latam.mjs --falta-es    # apps LATAM sin variante ES
node scripts/seo-latam/detectar-candidatas-latam.mjs --dominio=finanzas
node scripts/seo-latam/detectar-candidatas-latam.mjs --json        # salida JSON para pipe
```

## Cómo funciona (por qué tiene poco ruido)

Solo marca candidata cuando el término aparece en una **señal fuerte de SEO**
(title, og/twitter title, `name` del JSON-LD, `keywords` o un `<h1>`), no en una
mención casual del cuerpo educativo. Una app de calorías que nombra "patata" en un
ejemplo **no** es candidata; una app cuyo H1/keywords dicen "puertas lógicas" sin
mencionar "compuertas" en ningún sitio **sí** lo es.

## Flujo de trabajo (mensual, dentro de `/audit-seo-meskeia`)

1. Ejecutar el detector.
2. **Cruzar la lista con el informe de Consultas de Search Console.** Tocar SOLO las
   candidatas con impresiones reales — una app que nadie busca no mejora por añadir sinónimos.
3. Aplicar el **fix barato y aditivo** a 5-10 candidatas por mes:
   title + subtítulo + keywords + JSON-LD + una **FAQ de terminología**
   ("¿Es lo mismo X que Y?"). Nunca reemplazar el H1 ni machacar el texto (keyword stuffing).
4. **No tocar apps marcadas `⚠ es-only`** (fiscales-España con `RegionBadge es-only`)
   sin verificar: su público correcto es España.

## Limitaciones conocidas (filtrar a mano)

- El dominio `educacion` (bachillerato/selectividad) genera mucho volumen pero ya está
  cubierto por la regla Latam-friendly del `CLAUDE.md` para apps nuevas. Baja prioridad.
- Términos polisémicos (`móvil`, `papa`, `matrícula`...) pueden dar algún falso positivo;
  por eso el último filtro siempre es humano + datos de GSC.

---

## Prompt de revisión periódica

Pega esto para disparar una tanda de revisión LATAM. Ejecutar por tandas según
tiempo y tokens disponibles (no hace falta acabarlo de una vez). Método validado en
`simulador-puertas-logicas` (commits `884248b4` + `e46cc46c`).

```
Revisión SEO LATAM de meskeIA. Trabaja una tanda de 5 apps (o las que te indique según tiempo/tokens).

1. Ejecuta `node scripts/seo-latam/detectar-candidatas-latam.mjs --falta-latam` para listar apps que usan solo el término de España y pierden el mercado LATAM.
2. Cruza esas candidatas con Search Console (`node scripts/gsc-stats.mjs 90`, o consulta por página) y PRIORIZA las que tengan impresiones reales en posición 5-15 (las "casi-top", a un empujón del top-3). Ignora las apps `⚠ es-only` (fiscales-España).
3. Para cada app de la tanda, aplica el patrón validado:
   - H1 y title con AMBOS términos regionales, LIDERANDO con el de más demanda según GSC. No reemplazar el de España: incluir los dos. (El H1 es la señal más fuerte; omitir el término LATAM ahí es el fallo típico.)
   - Reforzar ambos términos de forma natural en la intro y el cuerpo visible (sin keyword stuffing). El cuerpo de la EducationalSection ya se sirve en SSR, así que cuenta.
   - Mantener canonical, estructura y JSON-LD intactos.
   - Si descubres un par de términos nuevo, añádelo a `scripts/seo-latam/glosario-es-latam.json`.
4. UN solo build. Verifica que ambos términos aparecen en el HTML servido (`.next/server/app/<slug>.html`). Commit por tanda. NO push salvo que lo pida.
5. Reporta cuántas candidatas quedan y marca en el glosario las apps RESUELTAS.

Si no indico tamaño de tanda, usa 5 apps.
```
