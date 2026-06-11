# REVISIONWEB.md — Auditoría de contenido y cálculo

> Documento de seguimiento de la auditoría global de meskeIA (1000+ apps).
> Esta es una **prueba piloto**: solo lectura, sin modificar código. Sirve para calibrar el formato y la complejidad antes de extender el proceso a más suites.

## Metodología

1. Inventario de apps de la suite mediante `data/applications.ts` (filtro `suites: [..., "viajes"]`).
2. Revisión de `page.tsx`, `metadata.ts` y datos asociados (carpeta `data/` o API routes) buscando:
   - Datos hardcodeados desactualizados (precios, tarifas, normativa, fechas de referencia).
   - Errores o inconsistencias en fórmulas/cálculos.
   - Afirmaciones factuales sin fuente o desactualizadas en contenido educativo / FAQ JSON-LD.
   - Cifras de catálogo hardcodeadas (regla `TOTAL_IMPLEMENTED_APPS`).
   - `RelatedApps` / `getRelatedApps` rotos o apuntando a slugs inexistentes.
3. Clasificación por severidad: **Crítico** (bug funcional o dato fiscal/normativo erróneo) / **Medio** (dato desactualizado o inconsistencia visible para el usuario/IA) / **Bajo** (matiz, fuente, redondeo).

## Estado

| Suite | Apps | Estado | Fecha |
|---|---|---|---|
| Viajes | 16/16 | ✅ Revisado (piloto) | 2026-06-11 |

---

## Resumen ejecutivo — Suite Viajes

| Severidad | Nº hallazgos |
|---|---|
| 🔴 Crítico | 1 |
| 🟠 Medio | 12 |
| 🟡 Bajo | 17 |

**Hallazgo crítico único**: `calculadora-propinas` no muestra su sección de apps relacionadas (RelatedApps vacío) por un bug de slug — afecta al cross-linking SEO obligatorio.

**Patrones repetidos a vigilar en próximas suites**:
- Inconsistencias entre `metadata.ts` (FAQ JSON-LD, usado para grounding de IAs) y el contenido real de `page.tsx` (3 casos: jet-lag, planificador-itinerario, guía-seguro-viaje).
- Precios/tarifas concretas de terceros (transporte, aerolíneas, seguros) que cambian con frecuencia y no llevan fecha de referencia.
- Pequeñas discrepancias numéricas entre dos lugares de la misma página que citan el mismo dato (población, densidad, recuento de elementos).

---

## Hallazgos detallados

### 1. `calculadora-propinas` (Calculadora de Propinas)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 1.1 | 🔴 Crítico | `page.tsx:755` | `getRelatedApps('Calculadora de Propinas')` usa el **nombre visible** en lugar del slug `'calculadora-propinas'`. `app-relations.ts` no encuentra la clave → `RelatedApps` se renderiza vacío, perdiendo el cross-linking obligatorio (Conversor Divisas, Presupuesto Viaje, Calculadora Cocina, Porciones). | Cambiar a `getRelatedApps('calculadora-propinas')`. |
| 1.2 | 🟠 Medio | `page.tsx:183-188` | El `<select id="pais">` tiene `value` duplicados: España y Reino Unido = `"10"`; Francia y Alemania = `"8"`. React selecciona siempre la primera opción coincidente, así que elegir "Reino Unido (10%)" muestra "España (10%)" como seleccionado (y Alemania→Francia). | Usar valores únicos por país (`"es-10"`, `"uk-10"`, `"fr-8"`, `"de-8"`) y mapear a porcentaje en `cambiarPais`. |
| 1.3 | 🟠 Medio | `page.tsx:559` | FAQ afirma "el SMI en 2025 es de 1.184 €/mes". Los datos centralizados del proyecto (`data/fiscal/pensiones.ts`, `data/fiscal/nomada-digital.ts`) fijan el SMI 2025 en **1.323 €/mes** (RD 145/2024, 14 pagas). | Actualizar a 1.323 €/mes o importar la constante desde `data/fiscal/`. |
| 1.4 | 🟡 Bajo | `page.tsx:476-477` | FAQ cita "según el INE, el salario medio en hostelería ronda los 1.200-1.400 € brutos/mes" sin año ni fuente verificable. | Añadir año de referencia o suavizar la afirmación (regla de neutralidad editorial — cifras sin fuente). |

---

### 2. `calculadora-combustible` (Calculadora Consumo Combustible)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 2.1 | 🟡 Bajo | `page.tsx:34-36` | `parseNum` no impide valores negativos (`parseFloat("-5")` es válido). Un precio negativo produciría costes negativos sin aviso. | Validar `>= 0` o usar `Math.max(0, ...)`. |
| 2.2 | 🟡 Bajo | `page.tsx:385-388` | Tabla comparativa con precios de referencia (gasolina ~1,50 €/L, diésel ~1,45 €/L, GLP ~0,70 €/kg, eléctrico ~0,18 €/kWh) sin fecha ni fuente. Los rangos son plausibles para 2025-2026 pero envejecen. | Añadir nota "precios orientativos [mes/año]" o referencia a fuente (Boletín Petrolero UE). |

Fórmulas verificadas correctas: consumo L/100km, coste/km, autonomía, coste de viaje. `RelatedApps` correcto.

---

### 3. `conversor-horarios` (Conversor de Horarios)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 3.1 | 🟠 Medio | `page.tsx:625` | Afirma que "EE.UU. cambia el horario 2 semanas **después** que Europa", generando la diferencia anómala de 5h. En realidad **EE.UU. cambia antes** (segundo domingo de marzo vs. último domingo de marzo en Europa) — esto contradice la propia FAQ JSON-LD (`metadata.ts:79-82`), que sí lo dice correctamente. El resultado numérico (5h) es correcto, la explicación está invertida. | Corregir a "EE.UU. cambia 2-3 semanas **antes** que Europa". |
| 3.2 | 🟡 Bajo | `page.tsx:629` | Afirma de forma tajante que España está en CET "desde la época franquista" sin matiz ni fuente. El dato es correcto (adopción en 1940) pero se presenta sin contexto. | Añadir matiz tipo "una decisión de 1940 que nunca se revirtió" o cita de fuente. |

Conversión de horarios vía `Intl.DateTimeFormat`/IANA: correcta y sin tablas DST hardcodeadas. `RelatedApps` correcto.

---

### 4. `informacion-tiempo` (Información del Tiempo)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 4.1 | 🟡 Bajo | `page.tsx:492` | Afirma "información actualizada cada 10 minutos", describiendo la frecuencia del proveedor (OpenWeatherMap), no de la propia app (no hace polling automático). Puede inducir a pensar que la página se autoactualiza. | Matizar: "los datos del proveedor se actualizan cada ~10 min; refresca la búsqueda para verlos". |
| 4.2 | 🟡 Bajo | `page.tsx:770` | "Más de 900 estaciones automáticas" (AEMET) sin fuente explícita. Cifra plausible. | Opcional: enlazar a aemet.es. |

Integración real con OpenWeatherMap (API key en variable de entorno, cumple regla de seguridad). Cálculo de hora local con offset de la API correcto. `RelatedApps` correcto.

---

### 5. `conversor-unidades` (Conversor de Unidades Científico)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 5.1 | 🟡 Bajo | `page.tsx:629` | Tabla afirma "1 GB = 1.024 MB" (en realidad eso es 1 GiB; 1 GB del SI = 1000 MB). El selector ya distingue Gib/Tib pero etiqueta GB/TB con valores binarios. | Si se busca precisión: renombrar a GiB/MiB/TiB/KiB o añadir nota aclaratoria en FAQ. |
| 5.2 | 🟡 Bajo | `page.tsx:744-746` | "Solo 3 países no usan el SI oficialmente: EE.UU., Myanmar y Liberia" — cifra muy citada pero sin fuente, y Myanmar/Liberia llevan años en adopción parcial. | Suavizar a "históricamente se ha citado..." (antipatrón #1 de neutralidad editorial). |

Factores de conversión (longitud, masa, volumen, presión, energía, fuerza, potencia, química) verificados correctos. `RelatedApps` correcto.

---

### 6. `lista-equipaje` (Lista de Equipaje Inteligente)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 6.1 | 🟠 Medio | `page.tsx:573-577` | Tabla "equipaje de mano por aerolínea": EasyJet figura como "sin límite de peso". Las low-cost ajustan estas políticas con frecuencia (1-2 años) y muchas tarifas básicas actuales sí limitan el peso del bolso de cabina. | Añadir nota de fecha de verificación o reforzar el aviso "consulta siempre la política vigente de tu aerolínea" junto a la tabla (no solo en el FAQ). |
| 6.2 | 🟠 Medio | `page.tsx:554-583` | Toda la tabla de dimensiones/pesos por aerolínea (Vueling, Ryanair, Iberia, EasyJet, Wizz Air) son datos normativos de terceros sin fecha de referencia ni fuente en el código. | Añadir "última verificación: [fecha]" o enlace a la web oficial de cada aerolínea. |

FAQ sobre pilas de litio (100 Wh) correcta y vigente. `RelatedApps` correcto.

---

### 7. `checklist-documentos-viaje` (Organizador de Documentos de Viaje)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 7.1 | 🟡 Bajo | `page.tsx:477` | Tasa de pasaporte español citada como "30 €"; la tasa oficial vigente es 30,90 €. | Actualizar a 30,90 € (opcional, diferencia de redondeo). |
| 7.2 | 🟡 Bajo | `page.tsx:464` vs `metadata.ts:70` | Cobertura mínima de seguro recomendada para EE.UU.: `page.tsx` dice "100.000 $", `metadata.ts` dice "150.000 €". Inconsistencia entre archivos de la misma app. | Unificar cifra y moneda entre `page.tsx` y `metadata.ts`. |
| 7.3 | 🟡 Bajo | `page.tsx:483` | Afirma que México, Costa Rica y Brasil exigen autorización notarial apostillada para menores con un solo progenitor — generalmente cierto pero sin fuente y sujeto a cambios por país. | Matizar con "consulta siempre la embajada del país de destino". |

ESTA (21 USD) y norma DNI-UK post-Brexit verificadas correctas. `RelatedApps` correcto.

---

### 8. `orientador-jet-lag` (Orientador de Jet Lag)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 8.1 | 🟠 Medio | `page.tsx:80, 378-379, 521, 528` | **Tres conjuntos de factores de adaptación distintos** dentro de la misma app: el código usa ×1.15 (este) / ×0.85 (oeste) — coincide con la tabla de la línea 378; pero el FAQ (línea 521) dice "~1 huso/día este vs ~1,5 husos/día oeste" (factor 1.0/0.67) y otro FAQ (línea 528) dice "1 día/huso este, 0,7 días/huso oeste" (factor 1.0/0.7). Un usuario que verifique el cálculo manualmente obtendrá resultados distintos según qué texto use. | Unificar las tres referencias al par usado por el motor (1.15 este / 0.85 oeste) o documentar que son aproximaciones con rangos. |
| 8.2 | 🟠 Medio | `metadata.ts:54` | FAQ JSON-LD: "un vuelo con 8h de desfase puede requerir entre 5 y 8 días". El código da 10 días (este, `Math.ceil(8×1.15)`) o 7 días (oeste, `Math.ceil(8×0.85)`) — el caso este (10 días), que es el ejemplo "Madrid→Tokio" de la propia página (línea 480, "9-10 días"), queda fuera del rango del FAQ. | Corregir el rango a "entre 7 y 10 días según dirección". |
| 8.3 | 🟡 Bajo | `page.tsx:421-450` | Tabla "husos cruzados" con rangos solapados: "7-9h" y "9+h" incluyen ambos el valor 9. | Cambiar la última fila a "10+ h" para coherencia con el código (`<=9` / `>9`). |
| 8.4 | 🟡 Bajo | `page.tsx:52` | Todos los husos usan un offset UTC fijo (sin DST), p. ej. Auckland UTC+12 todo el año pese a aplicar UTC+13 en verano austral. Es una limitación de diseño global (afecta también a Madrid/NY en sus respectivos horarios de verano), no señalada en el disclaimer. | Opcional: nota indicando que los UTC son "horario estándar" y pueden variar ±1h según época del año. |

`RelatedApps` correcto.

---

### 9. `guia-seguro-viaje` (Guía de Seguro de Viaje)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 9.1 | 🟡 Bajo | `page.tsx:452` | Afirma que la TSJE "tiene validez de 1-2 años" sin fuente ni fecha de verificación. | Referenciar fuente oficial (INSS) o suavizar a "consulta la validez en tu documento". |
| 9.2 | 🟡 Bajo | `metadata.ts:67` vs `page.tsx:658` | Cifra mínima de cobertura recomendada para EE.UU.: el FAQ JSON-LD dice "250.000 USD (algunos expertos aconsejan 500.000)", mientras el contenido visible dice directamente "500.000 € por persona" como mínimo. Mensajes distintos para crawlers de IA vs. usuario. | Unificar la cifra mínima entre FAQ JSON-LD y contenido visible. |

Resto del contenido (TSJE, exclusiones, glosario, checklist) generalista y plausible para 2026. `RelatedApps` correcto.

---

### 10. `planificador-itinerario` (Planificador de Itinerario)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 10.1 | 🟠 Medio | `metadata.ts:70` | FAQ JSON-LD afirma "los datos se guardan en el navegador de forma local", pero `page.tsx` **no usa `localStorage`/`sessionStorage`** — todo el estado es `useState` en memoria y se pierde al recargar. Afirmación factual incorrecta en datos estructurados usados por buscadores/IAs. | Corregir el texto (p. ej. "los datos se mantienen mientras la pestaña está abierta; usa la exportación a .txt para conservarlos") o implementar persistencia real. |
| 10.2 | 🟠 Medio | `page.tsx:625` | "Japan Rail Pass (21.100 ¥ ≈ 130 €)" — el JR Pass nacional subió drásticamente de precio en octubre de 2023 (7 días pasó de ~29.650 ¥ a ~50.000 ¥). La cifra citada es pre-2023 y ya no es vigente. | Actualizar a precios post-2023 (~50.000 ¥ / ~300 € por 7 días) o remitir a la web oficial sin cifra fija. |
| 10.3 | 🟡 Bajo | `page.tsx:613` | "Metro París: billete suelto 2,15 €/viaje vs. día completo 8,65 €". Desde 2025 París unificó tarifas en un billete único "t+" de ~2,50 €. Cifra desactualizada. | Actualizar a la tarifa vigente (~2,50 €) o generalizar sin cifra exacta. |

Tarifa metro Roma (1,50 €) verificada correcta. `RelatedApps` correcto.

---

### 11. `conversor-divisas` (Conversor de Divisas)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 11.1 | 🟡 Bajo | `app/api/divisas/route.ts:95-100` | Comentario describe un "fallback con tasas aproximadas del BCE (enero 2025)" que **no existe** en el código del `catch` (solo devuelve error 503). Comentario obsoleto/código muerto. | Eliminar el comentario o implementar el fallback descrito. |
| 11.2 | 🟡 Bajo | `page.tsx:248-253` | Tabla de comisiones/spreads (Wise, Revolut, bancos, cajeros) afirma que Revolut aplica "+1% fin de semana" de forma general; Revolut ha cambiado esta política varias veces (eliminada para Premium/Metal en muchas divisas desde 2024-2025, mantenida solo en Standard/Plus para divisas exóticas). | Matizar a "según plan y divisa". |

Tipos de cambio en tiempo real vía API Frankfurter (BCE) con cache 24h — correcto y cumple la promesa de "actualizado a diario". Fórmula de conversión correcta. `RelatedApps` correcto.

---

### 12. `comparador-transporte-viaje` (Comparador de Transporte para Viajes)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 12.1 | 🟠 Medio | `page.tsx:565` vs `page.tsx:75` | FAQ afirma "el AVE es competitivo: 2h30 puerta a puerta vs. **4-5h en avión**" para Madrid-Barcelona, pero la fórmula del propio comparador (`avionTiempo = 2.5 + distanciaKm/850`, con overhead de 2,5h) da **~3h14min** para esa ruta (621 km). Herramienta y contenido educativo dan cifras distintas para la misma ruta. | Ajustar el texto a "3-3,5h en avión" (coherente con la fórmula) o revisar si el overhead de 2,5h es realista. |
| 12.2 | 🟡 Bajo | `page.tsx:91-93` | Coste coche `0,085 €/km` etiquetado como "combustible + amortización". Para consumo medio (~6L/100km) a precios actuales, solo el combustible ya ronda 0,09-0,10 €/km; con amortización real (baremos RACE/Hacienda ~0,19-0,26 €/km) la cifra parece baja para lo que promete el comentario. | Revisar si 0,085 €/km es solo combustible (renombrar comentario) o ajustar el valor. |
| 12.3 | 🟡 Bajo | `page.tsx:484` | Nota metodológica fechada "precios medios de mercado en España (2025)" — a revisar en la próxima auditoría anual de precios. | Actualizar año cuando se revisen las cifras. |
| 12.4 | 🟡 Bajo | línea 2 (`@disclaimer: exempt`) | La app da estimaciones de coste/tiempo que pueden influir en decisiones de viaje (avión vs. tren vs. coche según presupuesto). Otras apps de cálculo de costes de la suite (`presupuesto-viaje`, `conversor-divisas`) usan `DisclaimerCard severity="medium"`. | Valorar migrar a `<DisclaimerCard severity="medium" collapsible>` para alinear con el resto de la suite. |

Factores de emisión CO₂ (avión 255 g/km, tren 14 g/km, autobús 68 g/km, coche 180 g/km) coherentes con referencias europeas habituales; "18× menos CO₂" matemáticamente correcto. `RelatedApps` correcto.

---

### 13. `presupuesto-viaje` (Presupuesto de Viaje)

Sin hallazgos relevantes. Lógica de reparto (`totalGeneral`, `porPersona`, `porDiaPersona`, distribución por categorías 30/35/20/10/5%) correcta, con guardas de división por cero. `RelatedApps` correcto.

---

### 14. `enchufes-por-pais` (Enchufes por País)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 14.1 | 🟡 Bajo | `page.tsx:25, 250` vs `:473` | Inconsistencia "A-M" vs "A-N": dos lugares dicen "tipos A-M (15 tipos)" pero A→M son 13 letras y el propio dataset incluye el Tipo N (Brasil); otra sección sí dice correctamente "A-N". | Unificar a "tipos A-N (14 tipos)" en todas las menciones. |

Datos de voltaje/frecuencia/tipo de enchufe por país (estándares físicos, no caducan) verificados sin errores. `RelatedApps` correcto.

---

### 15. `comparador-coste-vida` (Comparador de Coste de Vida)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 15.1 | 🟠 Medio | `page.tsx:23, 151, 321` | Etiqueta "Datos de referencia 2024-2025" — a fecha 2026-06-11 tiene 1-2 años de antigüedad. El `DisclaimerCard` mitiga el riesgo, pero conviene refrescar la etiqueta. | Actualizar a "2025-2026" (o año de revisión) en la próxima auditoría anual. |
| 15.2 | 🟠 Medio | `page.tsx:64` | Buenos Aires: `alquiler: 400, índice: 40` (la ciudad más barata del ranking junto a Bali). La fuerte inflación/apreciación real del peso en 2024-2025 ha encarecido sustancialmente Buenos Aires en términos de € — el propio FAQ (`metadata.ts:88`) reconoce esa volatilidad pero el dato hardcodeado no la refleja. | Revisar/actualizar alquiler e índice de Buenos Aires con fuente 2025-2026, o añadir nota de volatilidad en esa fila. |
| 15.3 | 🟡 Bajo | `metadata.ts:64` | FAQ JSON-LD menciona "Belgrado (Serbia), Sofía (Bulgaria) y Budapest (Hungría)" como ciudades baratas, pero ni Belgrado ni Sofía existen en el array `CIUDADES` del comparador (solo Budapest). Un usuario que llegue desde una respuesta de IA no las encontrará. | Añadir Belgrado/Sofía al dataset o cambiar la FAQ a ciudades presentes (Bucarest, Budapest, Estambul). |

Fórmula de diferencia porcentual (`diffPct`) correcta. `RelatedApps` correcto.

---

### 16. `paises-del-mundo` (Países del Mundo)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 16.1 | 🟠 Medio | `data/countries.ts` (196 entradas) vs `page.tsx:109,332,353,373,473,736,780` y `data/app-relations.ts:2609` | El dataset real contiene **196 países** (Europa 45, Asia 48, América 35, África 54, Oceanía 14), pero el texto fijo de la página (hero, FAQ, guías, descripción en `app-relations.ts`) dice "195 países" en múltiples sitios. El contador dinámico `{countries.length}` mostrará 196, contradiciendo el texto estático en la misma página. | Decidir: (a) eliminar un país (p. ej. Taiwán) para cuadrar en 195, coherente con la narrativa "193 ONU + Vaticano + Palestina"; o (b) si se mantiene en 196, actualizar todo el texto y aclarar la FAQ (línea 736, que atribuye el 196 a Kosovo, no a Taiwán). |
| 16.2 | 🟡 Bajo | `data/countries.ts:21,68` vs `page.tsx:625-668` | Comentarios "// EUROPA (44 países)" y "// ASIA (49 países)" no coinciden con el recuento real (45 y 48), y la tabla comparativa de continentes en `page.tsx` repite los números antiguos (44/49). | Recontar y corregir comentarios y tabla para que coincidan con el array real. |
| 16.3 | 🟡 Bajo | `data/countries.ts:85` vs `page.tsx:340,412` | Población de India: el dataset usa 1.417,2 M, pero el texto educativo dice "1.428 millones" en dos sitios distintos de la misma página. Dos cifras distintas para el mismo dato. | Unificar con una fuente actual (ONU/Banco Mundial ~1.450 M en 2024-2025) y aplicar el mismo número en `countries.ts` y en el texto. |
| 16.4 | 🟡 Bajo | `page.tsx:344` vs `:366/427` | Densidad de Europa citada como "~73 hab/km²" en una sección y "~71 hab/km²" en otra de la misma página. | Recalcular (745M/10,5M km² ≈ 71) y unificar a ~71. |
| 16.5 | 🟡 Bajo | `data/countries.ts:2` | Comentario "Datos actualizados 2024" — a 2026-06-11 los datos demográficos tienen ~2 años; normal para datos de referencia, pero a vigilar en países de crecimiento rápido (Nigeria, Etiopía, RD Congo). | Revisión en próxima auditoría anual. |

Capitales/monedas/prefijos muestreados sin errores. `RelatedApps` correcto (4/4 slugs existen).

---

## Próximos pasos (Fase 2)

Regularizar incidencias por sesiones, empezando por las de severidad 🔴 y 🟠:

### Tanda 1 — ✅ COMPLETADA (2026-06-11)

1. ✅ `calculadora-propinas` — fix `getRelatedApps` (1.1) + selector de país (1.2) + SMI (1.3, ver nota)
2. ✅ `conversor-horarios` — corregir explicación cambio horario EE.UU./Europa (3.1)
3. ✅ `orientador-jet-lag` — unificar factores de adaptación (8.1) y rango FAQ (8.2)
4. ✅ `planificador-itinerario` — corregir FAQ persistencia (10.1) y precio JR Pass (10.2)

> **Nota sobre 1.3**: el hallazgo original proponía 1.184→1.323 €/mes tomando como referencia
> `data/fiscal/pensiones.ts`/`nomada-digital.ts`. Al revisar `data/fiscal/smi.ts` (módulo dedicado,
> verificado 2026-04-01 con BOE oficial) se detectó que **1.184 € (SMI 2025, RD 87/2025) era
> correcto** y que el valor 1.323 € de `pensiones.ts`/`nomada-digital.ts` corresponde en realidad
> al SMI 2024 (15.876 €/año) recalculado a 12 pagas — un dato desactualizado, no la cifra correcta.
> Se ha actualizado `calculadora-propinas` a **SMI 2026 = 1.221 €/mes (14 pagas)** importado desde
> `data/fiscal/smi.ts`. Ver nuevo hallazgo 17.1 más abajo.

### Tanda 2 — pendiente

5. `comparador-transporte-viaje` — alinear tiempo avión MAD-BCN entre fórmula y FAQ (12.1)
6. `comparador-coste-vida` — refrescar etiqueta de fechas y datos de Buenos Aires (15.1, 15.2)
7. `paises-del-mundo` — resolver 195 vs 196 países (16.1)
8. `lista-equipaje` — añadir fecha de verificación a tablas de aerolíneas (6.1, 6.2)

El resto de hallazgos 🟡 Bajo pueden agruparse en una sesión de "limpieza menor" posterior.

---

## 17. Hallazgo transversal — datos compartidos `data/fiscal/`

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 17.1 | 🟠 Medio | `data/fiscal/pensiones.ts:260` (`smiMensual: 1323`) y `data/fiscal/nomada-digital.ts:24` (`SMI_MENSUAL_NOMADA = 1323`) | Ambos módulos usan **1.323 €/mes** como "SMI 2025/2026", pero el módulo dedicado `data/fiscal/smi.ts` (verificado 2026-04-01, BOE oficial) fija SMI 2025 = 1.184 €/mes (14 pagas) y SMI 2026 = 1.221 €/mes (14 pagas). El valor 1.323 parece ser el SMI **2024** (15.876 €/año ÷ 12 pagas). Afecta a `app/requisitos-nomada-digital`, `app/estimador-pension-viudedad`, `lib/calculadoras/pensionViudedad.ts` y `lib/calculadoras/embargoSalario.ts` (umbrales de ingresos calculados sobre una base desactualizada). | Sesión dedicada: sustituir `smiMensual`/`SMI_MENSUAL_NOMADA` por referencias a `SMI_2026` de `data/fiscal/smi.ts`, revisar los 4 archivos consumidores y ejecutar `npm run test:unit` (Regla #11, dato compartido). No incluido en esta tanda por su alcance fuera de la suite Viajes. |


