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
| Juegos y Ocio | 20/20 | ✅ Revisado | 2026-06-11 |

---

## Auditoría de Alto Tráfico

> Hilo complementario al ciclo por suites. En lugar de seguir el orden de suites, prioriza las apps con mayor uso real según el ranking de `/dashboard-analytics` ("Ranking de Aplicaciones"). Objetivo: detectar y corregir cuanto antes cualquier error en las apps que más usuarios reciben a diario, sin esperar a que les llegue el turno por suite.

### Metodología específica

1. Fuente del ranking: `/dashboard-analytics` → pestaña "Ranking de Aplicaciones" (columna "Usos").
2. Tandas de **1-2 apps** (más pequeñas que el ciclo por suites, para no agotar el cupo de tokens por sesión — lección aprendida en Viajes y Juegos y Ocio).
3. Misma clasificación de severidad y mismo checklist que el ciclo por suites (ver "Metodología" al inicio del documento).
4. Una app ya marcada ✅ en el ciclo por suites no se repite aquí salvo cambios relevantes — se anota "ya auditada (suite X, fecha)".
5. Tras cada tanda: si hay cambios de código, build de verificación + commit + push.

### Ranking de referencia (2026-06-12, dashboard-analytics)

| # | App | Usos | Tiempo medio | Estado auditoría |
|---|---|---|---|---|
| 1 | `tabla-periodica` | 417 | 1m 7s | ✅ Tanda 1 |
| 2 | `test-perfil-inversor` | 415 | 6m 3s | ✅ Tanda 1 |
| 3 | `simulador-equilibrio-quimico` | 401 | 1m 8s | ⏳ Pendiente |
| 4 | `simulador-puertas-logicas` | 323 | 59s | ⏳ Pendiente |
| 5 | `simulador-genetica` | 310 | 5m 18s | ⏳ Pendiente |
| 6 | `conversor-braille` | 261 | 1m 20s | ⏳ Pendiente |
| 7 | `generador-anagramas` | 244 | 1m 27s | ⏳ Pendiente |
| 8 | `calculadora-notas` | 186 | 42s | ⏳ Pendiente |
| 9 | `generador-tonos` | 157 | 2m 33s | ⏳ Pendiente |
| 10 | `simulador-movimiento-circular` | 149 | 2m 51s | ⏳ Pendiente |
| 11 | `simulador-campo-electrico` | 123 | 9m 50s | ⏳ Pendiente |
| 12 | `estimador-compraventa-inmueble` | 104 | 1m 25s | ⏳ Pendiente |
| 13 | `simulador-ecosistema-trofico` | 79 | 3m 37s | ⏳ Pendiente |
| 14 | `calculadora-cocina` | — | 4m 11s | ⏳ Pendiente |

*(`meskeIA` = homepage, 163 usos — no aplica el checklist de auditoría de apps individuales; se excluye del ranking).*

---

### Tanda 1 — Auditoría de Alto Tráfico (`tabla-periodica`, `test-perfil-inversor`) — ✅ COMPLETADA (2026-06-12)

#### 38. `tabla-periodica` (Tabla Periódica Interactiva) — 417 usos, #1 del ranking

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 38.1 | 🟡 Bajo | `page.tsx:409` | La tabla comparativa escribe "Metales alcalinoterreos (Gp2)" sin tilde, mientras `elementos-data.ts` (`FAMILIAS`) usa correctamente "Metales Alcalinotérreos". | Corregir a "Metales alcalinotérreos (Gp2)". |
| 38.2 | 🟡 Bajo | `page.tsx:212` | La celda de cada elemento en la tabla muestra la masa atómica con `elemento.masa.toFixed(...)` (formato US, punto decimal), mientras el modal de detalle usa `formatNumber(..., 3)` (formato español, coma decimal) para el mismo dato — regla #4 (formato español) y consistencia visual. | Sustituir `toFixed()` por `formatNumber(elemento.masa, elemento.masa % 1 === 0 ? 0 : 2)`. |

**RelatedApps**: correcto (`getRelatedApps('tabla-periodica')` resuelve 4 apps existentes: quiz-tabla-periodica, simulador-estequiometria, simulador-equilibrio-quimico, glosario-fisica-quimica). FAQ JSON-LD (118 elementos, masa molar, grupos/períodos, número atómico) coherente con la implementación. Resto del contenido educativo (escenarios, FAQ de química, guía de 7 pasos, tips, warning box) revisado sin errores factuales relevantes.

#### 39. `test-perfil-inversor` (Test de Perfil Inversor) — 415 usos, #2 del ranking

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 39.1 | 🔴 Crítico | `page.tsx:1093` | El botón "📊 Simular esta Cartera" de la pantalla de resultado enlaza a `/simulador-cartera-inversion/?perfil=${profileType}`, una ruta **que no existe** (404). La app `estimador-cartera-inversion` está específicamente diseñada para recibir este parámetro (`PERFILES_PREDEFINIDOS` con las mismas 5 claves `conservador/moderado/equilibrado/dinamico/agresivo` y las mismas asignaciones rv/rf/liq/alt que `PROFILES` de este test). | Cambiar a `/estimador-cartera-inversion/?perfil=${profileType}`. |
| 39.2 | 🔴 Crítico | `page.tsx:1098` | El botón "💼 Calculadora de Inversiones" enlaza a `/calculadora-inversiones/`, ruta **que no existe** (404). | Cambiar a `/estimador-inversiones/` (Estimador de Inversiones — Asignación de Activos), el app existente más afín; ajustar el texto del botón si procede (p.ej. "Estimador de Inversiones"). |
| 39.3 | 🟠 Medio | `metadata.ts:43-47` (FAQ JSON-LD) | La pregunta "¿Qué tipos de perfil inversor existen?" responde "Existen tres perfiles principales: conservador, moderado y agresivo... Algunos sistemas añaden subperfiles como moderado-conservador o moderado-agresivo". La app real tiene **5 perfiles** (`conservador`, `moderado`, `equilibrado`, `dinámico`, `agresivo`), sin esos subperfiles — inconsistencia entre el FAQ usado para grounding de IAs y el resultado real del test. | Reescribir la respuesta para reflejar los 5 perfiles reales de esta herramienta. |

**RelatedApps**: correcto (`getRelatedApps('test-perfil-inversor')` resuelve 4 apps existentes, incluyendo `estimador-cartera-inversion` — coherente con 39.1). Lógica de puntuación (`getProfile`, rangos 10-40 en 5 tramos de 6-7 puntos, `getBarPosition`) verificada correcta. Resto del contenido educativo (tabla comparativa de 5 perfiles, escenarios, FAQ avanzado, guía de 7 pasos, 6 reglas de oro, errores comunes) revisado sin errores factuales relevantes.

**Correcciones aplicadas**:
- 39.1: `/simulador-cartera-inversion/?perfil=...` → `/estimador-cartera-inversion/?perfil=...`
- 39.2: `/calculadora-inversiones/` → `/estimador-inversiones/` (texto del botón actualizado a "Estimador de Inversiones")
- 39.3: FAQ reescrita para reflejar los 5 perfiles reales (conservador/moderado/equilibrado/dinámico/agresivo)
- 38.1: "Metales alcalinoterreos" → "Metales alcalinotérreos"
- 38.2: `toFixed()` → `formatNumber()` para la masa atómica en la tabla principal

**Build**: ✅ exit 0, 999 apps, 1300 páginas (2026-06-12).

---

### Tanda 2 — Spot-check apps Delegum MCP (`estimador-hipoteca`, `verificador-complemento-brecha-genero`) — ✅ COMPLETADA (2026-06-12)

> Fuera del orden del ranking: spot-check solicitado para verificar que las apps web cuya lógica también expone Delegum MCP (`calcular_hipoteca`, `calcular_complemento_brecha_genero`) están bien configuradas y son coherentes con el lib compartido (`lib/calculadoras/`).

#### 40. `estimador-hipoteca` (Estimador de Hipoteca)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 40.1 | 🟡 Bajo | `page.tsx:401,420,435,470,485,500` | 6 sliders (TIN fijo, Euríbor, diferencial, tramo fijo/variable de la mixta) muestran el valor con `.toFixed(2)` (formato US, "3.50%") en lugar de `formatNumber()` (formato español, "3,50%") — Regla #4. El resto de la página usa `formatNumber` correctamente. | Sustituir los 6 `.toFixed(2)` por `formatNumber(valor, 2)`. |
| 40.2 | 🟠 Medio | `page.tsx` Escenarios "Segunda residencia" y "Inversión (alquiler)" | Las cuotas de ejemplo (~1.165 €/mes y ~735 €/mes) para "Euríbor + 0.9%" y "Euríbor + 1.2%" no corresponden a la fórmula francesa del propio simulador con el Euríbor por defecto actual (3.0%): dan 1.261,52 € y 787,24 € respectivamente (desviación 7-8%). Los importes coinciden casi exactamente si se asume un Euríbor de referencia de ~2.0% — probablemente escritos cuando ese era el valor por defecto. | Actualizar a ~1.262 €/mes y ~787 €/mes (recalculado con Euríbor 3.0% actual). |
| 40.3 | 🟠 Medio | `page.tsx` Escenario "No residente (español en el extranjero)" | Cuota de ejemplo ~855 €/mes para 200.000 €/70.000 € entrada (35%)/20 años/4,2% fijo. La fórmula francesa (y `calcular_hipoteca` de Delegum MCP, verificado) dan **801,54 €/mes** para esos mismos datos — desviación de 53 € (6,6%). | Actualizar a ~802 €/mes. |
| 40.4 | 🟡 Bajo | `metadata.ts` FAQ "¿Cuánto se paga en total de intereses en una hipoteca a 30 años?" | El ejemplo "200.000 € al 3% a 30 años → ~103.000 € de intereses" es correcto (103.555 €, OK), pero "reducir a 20 años bajaría los intereses a unos 63.000 €" se queda corto: el cálculo real da 66.207 € (desviación ~5%). | Actualizar a "unos 66.000 €". |
| 40.5 | 🟡 Bajo | `page.tsx:317-318` | Comentario vacío `{/* Última actualización */}` sin contenido — resto de placeholder/código muerto. | Eliminar el comentario huérfano. |
| 40.6 | 🟡 Bajo | `metadata.ts:94` (jsonLd) | `generateWebAppSchema({ ..., features: [] })` con el array de características vacío — Schema.org WebApplication incompleto para grounding de IAs. | Rellenar con 6-8 características reales (amortización francesa, fija/variable/mixta, tabla de amortización, comparador, ratio cuota/ingresos, gratuito, sin registro, en español). |

**RelatedApps/ShareCard/Footer**: correctos. Lógica de cálculo (`useMemo resultado`, sistema francés) verificada correcta y coincide con `lib/calculadoras/hipoteca.ts` (usado por Delegum `calcular_hipoteca`, contrastado numéricamente para 40.3). `DisclaimerCard severity="critical"` correcto. Resto del contenido educativo (comparador 3 vías, tabla de amortización, FAQ ampliado de amortizaciones/comisiones/hipoteca mixta/seguros/Euríbor, buenas prácticas, errores comunes) revisado sin más errores factuales.

#### 41. `verificador-complemento-brecha-genero` (Verificador Complemento Brecha de Género)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 41.1 | 🔴 Crítico | `metadata.ts` FAQ "¿Pueden los hombres cobrar el complemento por brecha de género?" | La respuesta afirmaba que un hombre puede percibirlo "si... tuvo una carrera de cotización más larga que la de su pareja" — un requisito que **no existe** en la normativa, contradice la doctrina post-STJUE C-623/23 / STS 09-07-2025 (requisitos idénticos para ambos sexos, documentada en `lib/calculadoras/complementoBrechaGenero.ts`) y contradice la propia lógica `evaluar()` de esta página (no implementa tal comprobación). Es contenido FAQPage usado para grounding de IAs (Regla 1.ter) — un asistente que lo cite daría información legal incorrecta. | Reescribir explicando que los requisitos son idénticos para ambos sexos (pensión contributiva + hecho causante desde 04/02/2021 + ≥1 hijo + que el otro progenitor no lo perciba ya), y que las denegaciones a hombres anteriores a 2025 por requisitos adicionales hoy eliminados pueden reclamarse. |
| 41.2 | 🟡 Bajo | `metadata.ts` FAQ "¿Cómo saber si tengo derecho...?" | La respuesta añadía como requisito "acreditar que la maternidad o paternidad interrumpió o redujo la carrera de cotización" — esa condición no forma parte de los requisitos reales (ni de `evaluar()` ni del art. 60 LGSS); el complemento se reconoce automáticamente si se cumplen pensión contributiva + hecho causante + hijos + no percepción por el otro progenitor. | Reescribir eliminando la condición de "acreditar interrupción de carrera". |
| 41.3 | 🟡 Bajo | `lib/calculadoras/complementoBrechaGenero.ts:193` (usado por Delegum `calcular_complemento_brecha_genero`) | `esReclamacion = otroProgenitor === 'denegado'` sin comprobar el sexo. Para `sexo: 'mujer'` + `otroProgenitor: 'denegado'`, el resultado marcaba `esReclamacion: true` con un motivo redactado en clave masculina ("denegaciones previas a **hombres**..."), un mensaje incoherente para una mujer. La página web (`page.tsx:138`) ya restringía este caso a `genero === 'hombre'`, por lo que había una divergencia entre el lib (fuente de Delegum) y la app web para este caso límite. | `esReclamacion = otroProgenitor === 'denegado' && p.sexo === 'hombre'` — alinea el lib con la app web y con el comportamiento observado en Delegum MCP (verificado con llamada real: mujer+denegado devuelve el motivo genérico, no el de reclamación). |

**RelatedApps/ShareCard/Footer**: correctos. `DisclaimerCard severity="critical"`, `DataReference` con `COMPLEMENTO_BRECHA_GENERO_META`, `RegionBadge variant="es-only"` correctos. Cifras 36,90 €/mes × 4 hijos = 147,60 €/mes verificadas contra `data/fiscal/pensiones.ts`. Contenido educativo (tabla comparativa maternidad/brecha género, 4 escenarios, 8 FAQ internas, guía de 6 pasos, 6 tips, 6 errores frecuentes) revisado sin más errores factuales.

**Correcciones aplicadas**:
- 40.1: 6× `.toFixed(2)` → `formatNumber(valor, 2)` en los sliders de tipo de interés/Euríbor/diferencial.
- 40.2: Escenarios "Segunda residencia" (~1.165 → ~1.262 €/mes) e "Inversión" (~735 → ~787 €/mes, ajustado también el colchón de alquiler ~900 → ~950 €/mes).
- 40.3: Escenario "No residente" (~855 → ~802 €/mes).
- 40.4: FAQ intereses a 20 años (~63.000 → ~66.000 €).
- 40.5: eliminado el comentario huérfano `{/* Última actualización */}`.
- 40.6: `features: []` → 8 características reales en el jsonLd.
- 41.1: FAQ "¿Pueden los hombres cobrar...?" reescrita con los requisitos reales y la doctrina 2025.
- 41.2: FAQ "¿Cómo saber si tengo derecho...?" reescrita sin la condición inexistente de "interrupción de carrera".
- 41.3: `complementoBrechaGenero.ts` — `esReclamacion` ahora exige también `sexo === 'hombre'`.

**Build**: ✅ exit 0, 999 apps, 1300 páginas (2026-06-12).

---

### Tanda 3 — Cobertura Delegum MCP, Grupo 1: Autónomos (`calcular_cuota_autonomo`) — 🔄 EN CURSO (2026-06-12)

> Tras Tanda 2, el usuario pidió priorizar la cobertura completa de las 39 tools de Delegum MCP (37 pendientes tras `calcular_hipoteca` y `calcular_complemento_brecha_genero`). Revisión por grupos de tools relacionadas (lib/calculadoras compartido). Grupo 1 "Autónomos": `consulta_autonomo`, `calcular_cuota_autonomo`, `comparar_autonomo_vs_sl`, `calcular_gastos_deducibles_autonomo`, `calcular_tarifa_freelance`.

#### 42. `estimador-cuota-autonomo` (Estimador Cuota de Autónomo) — tool `calcular_cuota_autonomo`

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 42.1 | 🔴 Crítico | `page.tsx` sección "Tabla Comparativa: 15 Tramos RETA 2025" (antiguas líneas 588-625) | Tabla **hardcodeada y duplicada** de la tabla real del simulador (que importa `TRAMOS_RETA_2025` de `data/fiscal/autonomos.ts`, verificada 2026-06-09 contra importass.seg-social.es). Bases y cuotas distintas para los mismos tramos (ej. Tramo 1: hardcoded 735,29€/~244€ vs real 653,59€/205,88€) — contradicción visible en la misma página, calculada al tipo antiguo 31,30% + MEI 0,70% (≈2024) en vez del 31,50% + MEI 0,90% vigente en 2026. | Eliminar la tabla duplicada (la tabla real ya está mostrada arriba en la misma página). |
| 42.2 | 🟠 Medio | `page.tsx` "Casos de Uso: 4 Perfiles Reales" (4 tarjetas) | Las 4 cuotas de ejemplo usaban el tipo antiguo 31,30%/MEI 0,70%, y el Caso 2 (4.000 €/mes) asignaba el **Tramo 14 (4.050-6.000€)**, que no incluye 4.000€ — debería ser el Tramo 13 (3.620-4.050€). | Recalculadas con `TRAMOS_RETA_2025` + tipo 31,50%: Caso 1 (1.500€/mes, Tramo 6) 302,65€/mes·3.631,80€/año; Caso 2 (4.000€/mes, **Tramo 13**) 504,41€/mes·6.052,92€/año; Caso 3 (>6.000€, Tramo 15) 607,35€/mes·7.288,20€/año; Caso 4 (tarifa plana) ahorro 222,65€/mes·2.671,80€/año. |
| 42.3 | 🟠 Medio | `page.tsx` (3 menciones) y `asistente-alta-autonomo/page.tsx` (1 mención) | SMI anual citado como "~15.876€ en 2025" para los umbrales de prórroga de tarifa plana y presunción de habitualidad — esa cifra es el SMI **anual 2024** (1.134€×14 pagas), no 2025. SMI 2026 = 17.094€ (`data/fiscal/smi.ts`, verificado 2026-04-01 contra BOE-A-2026-3815). | Actualizado a "~17.094€ en 2026" en las 4 ubicaciones. |
| 42.4 | 🟡 Bajo | `page.tsx` (3 menciones, bloque "errores comunes" y nota tabla) | Tipo de cotización citado como "31,30%" y MEI como "0,70%" en ejemplos sueltos (coste de subir base, base×tipo→cuota, MEI sobre base 1.000€) — vigente en 2026: tipo 31,50%, MEI 0,90%. | Recalculados: 200€ de base extra → 63€/mes (antes 62,60€); base 1.000€→cuota 315€, 2.000€→630€ (antes 313€/626€); MEI sobre base 1.000€ → 9€/mes (antes 7€). |
| 42.5 | 🟠 Medio | `metadata.ts` FAQ "¿Cuánto se paga de cuota de autónomo en 2025 según los ingresos?" | Cifras de cuota mínima/máxima/tramo intermedio (200€/590€/291€) no coinciden con `TRAMOS_RETA_2025` 2026 (205,88€/607,35€/360,29€ para tramos 1/15/7) — mismo origen que 42.1 (tabla antigua ~2024). | Actualizadas a 205,88€/607,35€/360,29€. |
| 42.6 | 🟡 Bajo | `metadata.ts` FAQ "¿Cuál es la tarifa plana...?" | "SMI (1.134€ en 2025)" — mismo problema que 42.3, es el SMI mensual (14 pagas) de 2024. | Actualizado a "1.221€ en 2026" (SMI mensual 14 pagas 2026). |

**Verificación de la tabla 2026**: confirmada vía búsqueda web (cuentica.com) — los 15 tramos de `TRAMOS_RETA_2025` (bases y cuotas) coinciden exactamente con la tabla RETA 2026 publicada por una fuente externa; MEI 2026 = 0,90% (subió desde 0,80% en 2025) confirmado independientemente. La tabla hardcodeada eliminada (42.1) y las cifras "200€/590€/291€" (42.5) corresponden a una tabla de ~2024 que circula también en algunas webs SEO desactualizadas — no son válidas para 2026.

**Correcciones aplicadas**:
- 42.1: eliminada la sección "Tabla Comparativa: 15 Tramos RETA 2025" duplicada y hardcodeada.
- 42.2: 4 tarjetas de "Casos de Uso" recalculadas con datos 2026 (tramo, base, cuota); Caso 2 reasignado a Tramo 13; tips de los Casos 1 y 4 ajustados a las nuevas cifras.
- 42.3: 4 menciones de SMI "~15.876€ en 2025" → "~17.094€ en 2026" (`estimador-cuota-autonomo` ×3, `asistente-alta-autonomo` ×1).
- 42.4: 3 menciones de tipo/MEI antiguos actualizadas a 31,50%/0,90% con cifras recalculadas.
- 42.5: FAQ JSON-LD con cuotas mínima/máxima/tramo intermedio actualizadas.
- 42.6: FAQ JSON-LD tarifa plana, SMI mensual actualizado a 1.221€ (2026).

**Build**: ✅ exit 0, 999 apps, 1300 páginas (2026-06-12).

#### 43. `comparador-autonomo-vs-sl` (Comparador Autónomo vs SL) — tool `comparar_autonomo_vs_sl`

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 43.1 | 🟠 Medio | `page.tsx` tabla comparativa, fila "Cotización mínima mensual SS" | "~230 €/mes (rendimiento bajo, tramo mínimo 2025)" para autónomo y "~512 €/mes" para SL — mismo patrón que #42: tramo mínimo RETA 2026 es 205,88 €/mes y autónomo societario 2026 es 514,99 €/mes (`AUTONOMO_SOCIETARIO_2025.cuotaMinimaMensual`, `data/fiscal/sociedades.ts`). | Actualizado a "~206 €/mes (rendimiento bajo, tramo mínimo 2026)" y "~515 €/mes". |
| 43.2 | 🔴 Crítico | `page.tsx` "Casos de Uso", Caso 1 (Freelance 30.000€) y Caso 2 (Consultor 60.000€) | Las cifras de IRPF/RETA/IS de los 4 escenarios no coinciden con la fórmula del propio comparador (`calcularAutonomo`/`calcularSL`) aplicada a esos mismos importes con los datos 2026 — desviaciones del 25-45%. En Caso 2, el veredicto "Empieza a compensar... ahorro neto real ~3.400 €/año" es la conclusión opuesta a la real: con datos 2026 el ahorro bruto es de solo ~790 € y los costes fijos de la SL (~5.500 €/año) lo convierten en un **sobrecoste neto de ~4.700 €/año** — la SL NO compensa a ese nivel. Es la "comparativa" central de una herramienta cuyo propósito es orientar la decisión autónomo vs SL, expuesta también como tool `comparar_autonomo_vs_sl` de Delegum. | Recalculado con `calcularAutonomo`/`calcularSL` y datos 2026: Caso 1 autónomo 4.015€ IRPF + 5.126€ RETA = 9.142€ (vs SL 18.285€ repartiendo dividendos, veredicto reforzado "no compensa"); Caso 2 autónomo 13.426€ IRPF + 6.547€ RETA = 19.973€ vs SL con salario 30.000€: 7.500€ IS + 5.500€ IRPF salario + 6.180€ autónomo societario = 19.180€ → ahorro bruto ~790€, sobrecoste neto ~4.700€/año tras costes fijos SL. Veredicto reescrito: "a este nivel la SL todavía no compensa por motivos fiscales". |
| 43.3 | 🟡 Bajo | `page.tsx` Caso 3 (reinversión 80.000€) | "Como autónomo, tributarías al 43-47% de IRPF" — 43% no es un tipo marginal real de `TRAMOS_IRPF_2025` (19/24/30/37/45/47); para un rendimiento neto de ~80.000€ el marginal real es 45%, no 47%. | "tributarías hasta al 45% de IRPF en el tramo superior". |
| 43.4 | 🟠 Medio | `page.tsx` tabla comparativa fila "Capital mínimo" vs FAQ JSON-LD (`metadata.ts`) | La tabla decía "3.000 € (o 1 € SRL formación sucesiva)", contradiciendo la propia FAQ de la misma app ("capital mínimo de 1 €, desde la reforma de 2023, antes eran 3.000 €") — la categoría "SRL formación sucesiva" como régimen separado fue eliminada por la Ley 18/2022 (Crea y Crece); el mínimo legal es 1 € para cualquier SL, con reserva legal del 20% y responsabilidad solidaria hasta 3.000 € si el capital es menor. | Tabla actualizada a "1 € (si es < 3.000 €, reserva legal especial hasta alcanzarlos)"; paso 2 de la guía de constitución reescrito sin la terminología "SRL de formación sucesiva". |
| 43.5 | 🟡 Bajo | `page.tsx` FAQ interna "¿Puedo ser administrador...?" y "¿El autónomo societario tiene las mismas prestaciones?" | "~512 €/mes (2025)" y "~1.634 €/mes en 2025" — mismo dato 2025/2026 que 43.1. | Actualizado a "~515 €/mes (2026)" y "~1.634 €/mes en 2026". |

**RelatedApps/ShareCard/Footer**: correctos. `DisclaimerCard severity="critical"`, `RegionBadge variant="es-only"`, `DataReference` con `FISCAL_AUTONOMOS_META` correctos. La lógica viva del comparador (`calcularAutonomo`/`calcularSL`) ya importa correctamente `TRAMOS_RETA_2025`/`TIPO_COTIZACION_RETA` 2026 (sin hardcodear) — el problema estaba solo en los ejemplos estáticos del bloque educativo, no en el cálculo interactivo.

**Correcciones aplicadas**:
- 43.1: tramo mínimo RETA y cuota autónomo societario actualizados a 2026 en la tabla comparativa.
- 43.2: Casos 1 y 2 recalculados con la fórmula real 2026; veredicto del Caso 2 invertido (de "empieza a compensar" a "no compensa a este nivel").
- 43.3: "43-47%" → "hasta al 45%".
- 43.4: tabla "Capital mínimo" y paso 2 de la guía alineados con la FAQ (mínimo legal 1€, régimen único desde Ley 18/2022).
- 43.5: 2 referencias "(2025)" → "(2026)" en FAQ internas.

**Build**: ✅ exit 0, 999 apps, 1300 páginas (2026-06-12).

#### 44. `orientador-gastos-deducibles` (Orientador de Gastos Deducibles) — tool `calcular_gastos_deducibles_autonomo`

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 44.1 | 🔴 Crítico | `page.tsx` "Casos de uso", Escenario 1 (Diseñador freelance) | "Ahorro fiscal estimado: ~2.800 €/año con IRPF al 30%" — recalculando con la fórmula real del propio orientador (`baseDeducible*irpf + ivaRecuperable` por línea) para los 5 gastos listados (30% suministros 540€, 100% Adobe 660€, 50% móvil 240€, 100% hosting 180€, 100% cursos 400€) con IVA 21%, el ahorro real es **~721 €/año** — el texto sobreestima el ahorro en ~3,9x. | Corregido a "~720 €/año". |
| 44.2 | 🟠 Medio | `page.tsx` "Casos de uso", Escenario 2 (Consultor con desplazamientos) | "Ahorro fiscal estimado: ~4.200 €/año con IRPF al 37%" — recalculando con IRPF 37% sobre los 7.280€ deducibles (kilometraje + dietas sin IVA recuperable, hoteles+transporte y asesoría+coworking con IVA 21% recuperable al 100%), el ahorro real es **~3.318 €/año** — sobreestimado en ~27%. | Corregido a "~3.300 €/año". |
| 44.3 | 🟠 Medio | `page.tsx` FAQ "¿La cuota de autónomos es deducible en IRPF e IVA?" | "Importe medio: 230-500 €/mes según tramo. Ahorro IRPF al 30%: ~828-1.800 €/año" — mismo patrón que #42/#43: usa el rango de cuotas RETA ~2024 (230-500€/mes). Con `TRAMOS_RETA_2025` 2026 (Tramo1 cuotaMinima=205,88€, Tramo15 cuotaMinima=607,35€), el ahorro IRPF al 30% real es ~741-2.186 €/año. | Actualizado a "Importe medio: ~206-607 €/mes según tramo (2026). Ahorro IRPF al 30%: ~740-2.190 €/año". |
| 44.4 | 🟡 Bajo | `page.tsx` disclaimer fijo y `metadata.ts` (description + jsonLd description) | "Datos orientativos para 2025" / "Actualizado 2025" — resto de datos normativos de la app (IRPF, IVA, dietas, interés de demora 4,0625% verificado vigente 2026) son válidos para 2026. | Actualizado a "2026" en las 3 ubicaciones. |

**Observación sin cambio (requiere revisión doctrinal aparte)**: el `gastosDB` interactivo incluye "Mantenimiento vehículo (uso mixto)" y "Gasolina vehículo mixto" en la categoría 50% deducible, aplicando ese 50% tanto a IRPF como a IVA. Sin embargo, la sección "Errores comunes" de esta misma app afirma que un turismo de uso mixto **no es deducible en IRPF** (solo en IVA aplica la presunción del 50% del art. 95 LIVA) — posible contradicción interna entre el cálculo interactivo y el contenido educativo, y el mismo patrón existe en `lib/calculadoras/gastosDeduciblesAutonomo.ts` (usado por el tool MCP). No se modifica en esta pasada por ser una cuestión doctrinal de mayor calado (afecta a `lib/calculadoras/`, no solo a contenido estático); queda anotado para revisión específica.

**RelatedApps/ShareCard/Footer**: correctos. `DisclaimerCard severity="critical"`, `RegionBadge variant="es-only"` correctos. El calculador interactivo de esta app es independiente (`gastosDB` propio, no importa `lib/calculadoras/gastosDeduciblesAutonomo.ts`); el problema estaba en los "Casos de uso" estáticos y la FAQ, no en el cálculo interactivo en sí.

**Correcciones aplicadas**:
- 44.1: Escenario 1 "~2.800 €/año" → "~720 €/año".
- 44.2: Escenario 2 "~4.200 €/año" → "~3.300 €/año".
- 44.3: FAQ cuota autónomos actualizada a rango RETA 2026 y ahorro IRPF correspondiente.
- 44.4: 3 referencias "2025" → "2026" (disclaimer + metadata.ts ×2).

**Build**: ✅ exit 0, 999 apps, 1300 páginas (2026-06-12).

#### 45. `orientador-tarifa-freelance` (Orientador de Tarifa Freelance) + `calculadora-precio-por-proyecto` (Calculadora de Precio por Proyecto) — tool `calcular_tarifa_freelance`

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 45.1 | 🟠 Medio | `orientador-tarifa-freelance/page.tsx`, select "Retención IRPF" | Etiquetaba "21% (General)" como tipo estándar y "15% (Reducido)", mientras que la FAQ JSON-LD de la propia app (`metadata.ts`) afirma correctamente que la retención estándar en factura es del 15% (RD 439/2007 art. 95) — en IRPF no existe una retención del 21% (ese es el tipo general de IVA, no de IRPF). Contradicción interna entre el selector y la FAQ. | Select renombrado a "IRPF estimado" con opciones reetiquetadas: 7% (nuevos autónomos - retención reducida), 15% (retención estándar en factura), 21% (estimación para rendimientos en tramos altos). Valores numéricos y opción por defecto (21) sin cambios. |
| 45.2 | 🟡 Bajo | `orientador-tarifa-freelance/page.tsx`, paso 2 de "7 pasos" y FAQ "tarifa bruta vs neta" | Cuota RETA mínima citada como "~204 €/mes en 2026" y rango "204-1.478 €/mes en 2026" — desactualizado frente a `TRAMOS_RETA_2025` (Tramo1 cuotaMinima=205,88€ → ~206€, Tramo15 cuotaMaxima=1.606,88€ → ~1.607€). | Actualizado a "~206 €/mes" y "206-1.607 €/mes en 2026". |
| 45.3 | 🟡 Bajo | `orientador-tarifa-freelance/page.tsx`, FAQ "¿Qué tarifa cobran otros en mi sector?" | "Benchmarks 2025: dev junior 25-40 €/h..." | Actualizado a "Benchmarks 2026". |

**`calculadora-precio-por-proyecto`**: revisado sin hallazgos. Los 4 "Casos de uso" (diseñador, desarrollador, traductor, consultor) se verificaron ejecutando la fórmula real del componente (`costoHorasBase → ×complejidad → ×urgencia → +imprevistos → +gastos`) con los inputs declarados: desviaciones <1% en todos los casos (dentro del margen de "ronda"/"en torno a/alrededor de" usado en el texto). `metadata.ts` sin referencias a años ni datos normativos caducables.

**RelatedApps/ShareCard/Footer**: correctos en ambas apps. `orientador-tarifa-freelance` tiene `DisclaimerCard severity="high"`; `calculadora-precio-por-proyecto` también. Ambas independientes de `lib/calculadoras/tarifaFreelance.ts` en sus cálculos interactivos (mismo patrón de fórmula, sin desincronía detectada).

**Correcciones aplicadas**:
- 45.1: select "Retención IRPF" → "IRPF estimado", opciones reetiquetadas para alinear con la FAQ (15% = retención estándar, 21% = tramos altos).
- 45.2: "~204 €/mes en 2026" → "~206 €/mes en 2026"; "204-1.478 €/mes en 2026" → "206-1.607 €/mes en 2026".
- 45.3: "Benchmarks 2025" → "Benchmarks 2026".

**Build**: ✅ exit 0, 999 apps, 1300 páginas (2026-06-12).

#### 46. `asistente-alta-autonomo` (Asistente Alta Autónomo) + `selector-regimen-fiscal-autonomo` (Selector de Régimen Fiscal Autónomo) — tool `consulta_autonomo` (orquestador)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 46.1 | 🟠 Medio | `asistente-alta-autonomo/page.tsx`, tabla "Comparativa autónomo vs SL", fila "Cuota Seg. Social" | Columna SL decía "~300 €/mes (administrador)" — desactualizado frente a `AUTONOMO_SOCIETARIO_2025.cuotaMinimaMensual=514,99€` (`data/fiscal/sociedades.ts`, 31,5% de la base mínima 1.634,88€ desde 2026 por subida MEI), ~42% por debajo del valor real. | Corregido a "~515 €/mes (autónomo societario obligatorio)". |
| 46.2 | 🟠 Medio | `asistente-alta-autonomo/page.tsx`, tabla "Comparativa de regímenes", fila "Cuota mínima mensual" | Columna autónomo societario decía "Desde 310 €/mes (base mínima RETA admin.)" — mismo problema que 46.1, ~40% por debajo de los 514,99€ reales; columna régimen general decía "Desde 200 €/mes" (RETA 2025). | Corregido a "~515 €/mes (base mínima RETA admin., obligatoria)" y "Desde ~206 €/mes (rendimientos bajos)" (RETA 2026). |
| 46.3 | 🟠 Medio | `asistente-alta-autonomo/page.tsx`, "Casos de uso" Escenario 1 (Pedro) | "Ahorra ~1.800 € en cuotas SS durante el primer año" — recalculando con la fórmula real de `calcularCuotaAutonomo()` ((cuotaNormal − cuotaTarifaPlana) × 12 = (205,88 − 80) × 12 = 1.510,56€), el ahorro real es **~1.510 €**, sobreestimado ~19%. | Corregido a "~1.510 € (cuota mínima ~206 €/mes − tarifa plana 80 €/mes, ×12)". |
| 46.4 | 🟡 Bajo | `asistente-alta-autonomo/page.tsx`, disclaimer fijo | "Datos orientativos para 2025" — mismo patrón que #44.4/#45.2. | Actualizado a "2026". |
| 46.5 | 🔴 Crítico | `asistente-alta-autonomo/metadata.ts`, FAQ JSON-LD "¿Cuánto se paga de cuota de autónomo en 2025?" | "En 2025 hay 15 tramos: el mínimo es de 200 € al mes... y el máximo supera los 590 € para ingresos por encima de 6.000 €/mes" — tabla RETA pre-2026 (31,30%/MEI 0,70%), mismo patrón que #28d25605. El máximo real 2026 (`TRAMOS_RETA_2025` Tramo15 cuotaMaxima=1.606,88€) es ~1.607€, ~2,7x el valor citado. | Pregunta renombrada a "...en 2026?" y respuesta actualizada: "el mínimo es de ~206 € al mes... y el máximo es de ~1.607 € para ingresos por encima de 6.000 €/mes". |

**`selector-regimen-fiscal-autonomo`**: revisado sin hallazgos. Es un quiz de puntuación ponderada (10 preguntas → recomienda `modulos`/`directa_simplificada`/`directa_normal`/`sociedad_limitada`) sin fórmulas numéricas atadas a `consulta_autonomo`. La referencia "47% en los tramos más altos" se verificó correcta contra `TRAMOS_IRPF_2025` (tramo `{hasta: Infinity, tipo: 47}`). `metadata.ts` sin hallazgos (umbrales FAQ 250.000€/150.000€ módulos, 40.000-50.000€ SL, 600.000€ directa normal estables).

**RelatedApps/ShareCard/Footer**: correctos en ambas apps.

**Correcciones aplicadas**:
- 46.1: "~300 €/mes (administrador)" → "~515 €/mes (autónomo societario obligatorio)".
- 46.2: "Desde 310 €/mes" → "~515 €/mes"; "Desde 200 €/mes" → "Desde ~206 €/mes".
- 46.3: "Ahorra ~1.800 €" → "Ahorra ~1.510 €" (recalculado con la fórmula real).
- 46.4: "Datos orientativos para 2025" → "2026".
- 46.5: FAQ "¿...en 2025?" + "200€/590€" → "¿...en 2026?" + "~206€/~1.607€".

**Build**: ✅ exit 0, 999 apps, 1300 páginas (2026-06-12).

**Grupo 1 "Autónomos" — COMPLETADO** (commits `28d25605`, `03d01dd4`, `3bd79ffc`, `61400354`, `0ff4b6dd`).

#### 47. `calculadora-iva` (Calculadora de IVA) — tool `calcular_iva`

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 47.1 | 🟡 Bajo | `page.tsx` sección educativa "Tipos de IVA en España (2025)" y `metadata.ts` FAQ "¿Cuáles son los tipos de IVA en España en 2025?" | Año desactualizado — los tipos (21/10/4/0%) no han cambiado para 2026, mismo patrón de etiqueta "2025"→"2026" que #44.4/#45.3/#46.4. | Actualizado a "2026" en ambas ubicaciones. |

El calculador interactivo (añadir/quitar IVA al 21/10/4/0%) coincide exactamente con la fórmula de `calcular_iva` (base×tipo / total÷(1+tipo)). Escenarios, FAQ y guía paso a paso revisados sin más hallazgos (plazos modelo 303, recargo equivalencia, reglas OSS/UE correctas y estables).

**RelatedApps/ShareCard/Footer**: correctos. `DisclaimerCard severity="critical"` correcto (componente fiscal).

**Correcciones aplicadas**:
- 47.1: "Tipos de IVA en España (2025)" → "(2026)"; FAQ "...en España en 2025?" → "...en 2026?".

#### 48. `simulador-irpf-tramos` (Simulador Visual de Tramos IRPF) — tool `calcular_irpf`

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 48.1 | 🟡 Bajo | `page.tsx`, "Casos de Uso Reales", Asalariado tipo (30.000€ base liquidable) | "12.450 al 19% + 7.750 al 24% + 9.800 al 30% = 7.156,50 € de cuota" — recalculando con `TRAMOS_IRPF_2025` y la fórmula real `calcularCuotaTramos(30000)`, el resultado es **7.165,50 €** (transposición de cifras 56↔65, diferencia de 9€). Tipo medio ~23,9% y marginal 30% sí son correctos. | Corregido a "7.165,50 €". |
| 48.2 | 🟠 Medio | `page.tsx`, "Casos de Uso Reales", Autónomo en RETA (45.000€ base liquidable) | "Cuota ~10.787 €. Tipo medio ~24%, marginal 37%" — recalculando con la misma fórmula (`calcularCuotaTramos(45000)`), el resultado real es **cuota 12.351,50€, tipo medio 27,4%** (marginal 37% sí correcto). La cuota citada está ~12,6% por debajo del valor real, y el tipo medio está desviado ~3,4 puntos porcentuales (24% vs 27,4%). | Corregido a "Cuota ~12.352 €. Tipo medio ~27,4%, marginal 37%". |

**Observación sin cambio**: el caso "Jubilado con pensión (24.000€)" cita cuota ~3.866€/tipo medio 16,1%, mientras que `calcularCuotaTramos(24000)` da 5.365,5€/22,4% si 24.000€ fuera base liquidable directa. A diferencia de los casos 1 y 2 (que dicen explícitamente "base liquidable"), este caso no lo especifica — es plausible que 24.000€ sea ingreso bruto antes de aplicar el mínimo personal (5.550€), lo que se acerca mucho más a la cifra citada (cuota≈3.805€, tipo medio≈15,9% sobre 24.000€). No se modifica por ambigüedad de la base de cálculo.

**RelatedApps/ShareCard/Footer**: correctos. `RegionBadge variant="es-only"`, `DisclaimerCard severity="critical"`, `DataReference` correctos. `TRAMOS_IRPF_2025` (`data/fiscal/irpf.ts`, `vigencia: '2025'`) usado como referencia canónica vigente, sin re-evaluar en esta pasada (cuestión de vigencia anual, fuera del alcance de "Capa Contenido").

**Correcciones aplicadas**:
- 48.1: "7.156,50 €" → "7.165,50 €" (corrección aritmética).
- 48.2: "Cuota ~10.787 €. Tipo medio ~24%" → "Cuota ~12.352 €. Tipo medio ~27,4%" (recalculado con la fórmula real).

#### 49. `calendario-fiscal-emprendedor` (Calendario Fiscal del Emprendedor) — tools `calcular_modelo_130` + `calcular_modelo_303`

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 49.1 | 🟡 Bajo | `page.tsx` disclaimer fijo y `metadata.ts` (description ×2 + FAQ "¿Cuándo hay que presentar el IVA trimestral en 2025?") | "Plazos generales de la AEAT para 2025" / "Calendario fiscal 2025" — los plazos trimestrales (303/130: 1-20 abr/jul/oct, 1-30 ene) son fijos por ley y no han cambiado, mismo patrón de etiqueta "2025"→"2026". | Actualizado a "2026" en las 4 ubicaciones. |

Los estimadores interactivos se verificaron contra las fórmulas de `calcular_modelo_303` (`ivaRepercutido − ivaSoportado`) y `calcular_modelo_130` (`max(0, beneficio×20% − retenciones)`): coinciden con la lógica de los tools MCP en su versión simplificada por trimestre individual (sin acumulado anual ni pagos fraccionados previos), comportamiento explícitamente etiquetado como "estimación aproximada" en la UI — no es un error, es una simplificación declarada.

**RelatedApps/ShareCard/Footer**: correctos.

**Correcciones aplicadas**:
- 49.1: 4 referencias "2025" → "2026" (disclaimer `page.tsx` + `metadata.ts` description ×2 + FAQ).

**Build**: ✅ exit 0, 999 apps, 1300 páginas (2026-06-12).

**Grupo 2 "Fiscal autónomos" — COMPLETADO** (`calculadora-iva`, `simulador-irpf-tramos`, `calendario-fiscal-emprendedor`; sin apps web dedicadas para `modelo_130`/`modelo_303` aisladas — cubiertas vía `calendario-fiscal-emprendedor`).

### Tanda 4 — Cobertura Delegum MCP, Grupo 3: Nómina (`consulta_nomina`, `calcular_sueldo_neto`) — ✅ COMPLETADA (2026-06-12)

#### 50. `estimador-sueldo-neto` (Estimador de Sueldo Neto) — tools `consulta_nomina` + `calcular_sueldo_neto`, + `visualizador-sueldo-neto`, `simulador-desglose-nomina`, `visualizador-anatomia-nomina`

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 50.1 | 🔴 Crítico | `lib/calculadoras/sueldoNeto.ts` (compartido con MCP `calcular_sueldo_neto`/`consulta_nomina`) **y** `app/estimador-sueldo-neto/page.tsx` (`calcularBrutoANeto`) | Fórmula IRPF incompleta — y de forma distinta en cada archivo. La fórmula correcta (art. 19/20/80 bis LIRPF) es: RNT = bruto − SS − gastos deducibles generales (2.000€) → reducción RNT (art. 20, interpolación entre 13.115€ y 16.825€) → base imponible = RNT − reducción → base liquidable = base imponible − mínimo personal/familiar → cuota por tramos → cuota final = cuota − deducción rentas bajas (art. 80 bis, hasta 340€). El MCP tenía los pasos 1-6 y 9 pero le faltaba el paso de deducción rentas bajas (art. 80 bis). La web tenía los pasos 1, 5 (parcial), 6, 7, 9 pero le faltaban los gastos deducibles (2.000€) y la reducción RNT (art. 20) — calculaba `baseImponible = bruto − SS` directamente. Verificado con `node` replicando ambas fórmulas: sobreestimación sistemática del IRPF (infraestimación del neto) de ~900-2.000€/año en rentas de 14.000-80.000€ (9-32% del IRPF real). | Corregidas ambas fórmulas para incluir los 7 pasos completos del art. 19/20/80 bis LIRPF. |
| 50.2 | 🔴 Crítico | `app/visualizador-sueldo-neto/page.tsx` y `app/simulador-desglose-nomina/page.tsx` | Ambos calculaban correctamente RNT + reducción art. 20 + mínimo personal/familiar, pero les faltaba la deducción por rentas bajas del trabajo (art. 80 bis LIRPF), afectando a cualquier RNT ≤ 18.276€/año (deducción de hasta 340€). | Añadida `calcularDeduccionRentasBajas(rnt, 0)` en ambos, igual que en 50.1. |
| 50.3 | 🔴 Crítico | `app/simulador-desglose-nomina/page.tsx` | La cotización SS se calculaba como `bruto × 6,47 %` sin aplicar el tope de la base de cotización (`BASES_SS_2025`: mín. 1.381,20 €/mes, máx. 4.909,50 €/mes). Para rentas bajas (bruto/12 < 1.381,20€) infraestimaba la SS — y por tanto el RNT, llevando a un IRPF mayor de lo real—; para rentas altas (bruto/12 > 4.909,50€) la sobreestimaba, inflando artificialmente las deducciones totales y reduciendo el neto. | Aplicado el tope mín./máx. sobre la base mensual (bruto/12) antes de calcular las 4 cotizaciones (CC, desempleo, FP, MEI), igual que en `lib/calculadoras/sueldoNeto.ts`. |
| 50.4 | 🟡 Bajo | `app/estimador-sueldo-neto/page.tsx`, FAQ "¿Cuánto es el SMI 2025...?" + tip "SMI 2025: 1.184€/mes" + FAQ MEI | Usaban `SMI_2025` (1.184€/mes, 16.576€/año, `data/fiscal/smi.ts`) en vez de `SMI_2026` (1.221€/mes, 17.094€/año) vigente — mismo patrón "2025"→"2026" de Grupo 2. Además, la FAQ del MEI decía "el trabajador paga el 0,12%... esto representa ~29€ anuales" para 30.000€ brutos, pero 30.000/12×0,12%×12 = 36€ — inconsistente con el propio 0,12% citado en la misma frase. | Actualizado a SMI 2026 (1.221€/mes, 17.094€/año, RD 126/2026) + recalculado neto mensual SMI (~1.126€, antes ~1.050€) + MEI corregido a ~36€. |
| 50.5 | 🟡 Bajo | `app/estimador-sueldo-neto/page.tsx`, "Casos de Uso" (4 perfiles) + tabla "12 vs 14 pagas" | Recalculados con la fórmula corregida (50.1). El más afectado: perfil "Trabajadora a tiempo parcial" (14.000€, familia monoparental) pasaba de "IRPF ~1.028€/retención 7,3%/neto ~12.066€" a **IRPF 0€ (base liquidable negativa, no tributa)/retención 0%/neto ~12.928€**; también SS recalculada a ~1.072€/año (sobre la base mínima de cotización, antes 906€). El resto de perfiles (22.000€, 35.000€, 80.000€) variaron entre +0,4 y +5 puntos porcentuales de retención efectiva. | Las 4 fichas, la tabla 12 vs 14 pagas y el bloque "Ejemplo práctico" de tramos IRPF reescritos con las cifras recalculadas. |
| 50.6 | 🟡 Bajo | `app/simulador-desglose-nomina/page.tsx`, "Casos de Uso Reales" (4 perfiles) | Recalculados tras 50.2/50.3. El más afectado: "Directivo 120.000€" pasaba de "SS ~3.555€/neto ~80.500€" a **SS ~4.448€/neto ~77.100€** (el tope de la base de cotización no se aplicaba, sobreestimando el neto en ~3.400€/año); "Mileurista 14.000€" pasó de "SS ~917€/IRPF ~0-200€/neto ~12.880€" a "SS ~1.072€/IRPF 0€/neto ~12.930€"; "Alto 60.000€" y "Mediano 30.000€" con ajustes menores (<1%). | Las 4 fichas reescritas con las cifras recalculadas. |

**App revisada sin hallazgos**: `visualizador-anatomia-nomina` — es un ejemplo estático ilustrativo de una nómina concreta (no implementa la fórmula bruto→neto general), fuera del alcance de los hallazgos 50.1-50.3.

**RelatedApps/ShareCard/Footer**: correctos en las 4 apps.

**Correcciones aplicadas**:
- 50.1: `lib/calculadoras/sueldoNeto.ts` — añadida deducción rentas bajas (art. 80 bis). `app/estimador-sueldo-neto/page.tsx` (`calcularBrutoANeto`) — añadidos gastos deducibles generales (2.000€) y reducción RNT (art. 20).
- 50.2: `app/visualizador-sueldo-neto/page.tsx` y `app/simulador-desglose-nomina/page.tsx` — añadida deducción rentas bajas (art. 80 bis).
- 50.3: `app/simulador-desglose-nomina/page.tsx` — aplicado tope mín./máx. de la base de cotización SS.
- 50.4: FAQ + tip SMI "2025" (1.184€/1.050€) → "2026" (1.221€/~1.126€); MEI "~29€" → "~36€".
- 50.5: 4 perfiles + tabla 12 vs 14 pagas + ejemplo práctico de tramos en `estimador-sueldo-neto` recalculados.
- 50.6: 4 perfiles en `simulador-desglose-nomina` recalculados.

**Build**: ✅ exit 0, 999 apps, 1300 páginas (2026-06-12).

**Grupo 3 "Nómina" — COMPLETADO** (`estimador-sueldo-neto`, `visualizador-sueldo-neto`, `simulador-desglose-nomina`; `visualizador-anatomia-nomina` revisado sin hallazgos; `lib/calculadoras/sueldoNeto.ts` compartido con MCP corregido).

### Tanda 5 — Cobertura Delegum MCP, Grupo 4: Vivienda (`consulta_compra_vivienda`, `consulta_venta_vivienda`, `calcular_hipoteca`, `calcular_capacidad_hipoteca`, `calcular_amortizacion_anticipada`, `calcular_rendimiento_capital_inmobiliario`, `calcular_retencion_alquiler`) — ✅ COMPLETADA (2026-06-12)

#### 51. `estimador-compraventa-inmueble`, `simulador-gastos-compraventa-garaje`, `simulador-gastos-compraventa-trastero`, `amortizacion-hipoteca`, `estimador-hipoteca`, `calculadora-rentabilidad-alquiler`, `selector-tipo-hipoteca` + `lib/calculadoras/compraventa.ts`, `data/itp-ccaa.ts`, `lib/calculadoras/hipoteca.ts`, `lib/calculadoras/retencionAlquiler.ts`

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 51.1 | 🔴 Crítico | `app/estimador-compraventa-inmueble/page.tsx`, `app/simulador-gastos-compraventa-garaje/page.tsx`, `app/simulador-gastos-compraventa-trastero/page.tsx` | El matching de perfiles con tipo reducido de ITP usaba `r.nombre.toLowerCase().includes('joven')` etc., pero `data/fiscal/inmuebles.ts` etiqueta esos tipos como `"Jóvenes < 35 años"` (con tilde). `'jóvenes'.toLowerCase()` no contiene `'joven'` con tilde, por lo que la reducción de ITP para jóvenes/familia numerosa/discapacidad **nunca se aplicaba** — el comprador siempre pagaba el tipo general aunque marcara el perfil especial. | Añadido helper `normalizarTexto` (quita tildes vía `.normalize('NFD')`) y aplicado en las 3 apps al comparar `r.nombre` con `'joven'/'familia'/'discapacidad'`. Verificado con `node` que `normalizarTexto('Jóvenes < 35 años')` produce `'jovenes < 35 anos'`. |
| 51.2 | 🔴 Crítico | `lib/calculadoras/compraventa.ts` (`calcularCompraventa`, usada por `calcular_compraventa_inmueble` MCP y las 3 apps anteriores) | El AJD (Actos Jurídicos Documentados) se calculaba siempre como `precioInmueble × TIPOS_AJD_2025.general / 100`, incluso en `tipoTransmision === 'segunda_mano'`. Por art. 31.2 TRLITP, ITP y AJD gradual son incompatibles sobre el mismo acto: una compraventa de segunda mano sujeta a ITP **no** devenga AJD gradual (el AJD gradual solo aplica a obra nueva/VPO, sujetas a IVA). El resultado duplicaba un gasto que no existe en la operación más común (segunda mano). | `ajd = 0` cuando `tipoTransmision === 'segunda_mano'`; se mantiene el cálculo solo para `obra_nueva`/`vpo`. |
| 51.3 | 🟠 Medio | `data/itp-ccaa.ts` (`calcularPlusvaliaMunicipal`, usada por las 3 apps de compraventa) | El parámetro `tipoMaximo` tenía como valor por defecto `30` (el **máximo legal absoluto** del RDL 26/2021), cuando `data/fiscal/inmuebles.ts` ya define `PLUSVALIA_MUNICIPAL_META.tipoOrientativo = 25` como el tipo medio orientativo que aplican la mayoría de ayuntamientos. Ningún punto de llamada pasaba `tipoMaximo` explícito, por lo que las 3 apps sobreestimaban sistemáticamente la plusvalía municipal en un 20% (30% vs 25%). | Import de `PLUSVALIA_MUNICIPAL_META` desde `@/data/fiscal`; `tipoMaximo = PLUSVALIA_MUNICIPAL_META.tipoOrientativo` (25%) por defecto, documentando en el JSDoc que el máximo legal (30%) sigue disponible si se pasa explícito. |
| 51.4 | 🟡 Bajo | `app/estimador-compraventa-inmueble/page.tsx`, `app/simulador-gastos-compraventa-garaje/page.tsx`, `app/simulador-gastos-compraventa-trastero/page.tsx` | Las 3 apps definían localmente `TRAMOS_IRPF_AHORRO` (tramos de ganancias patrimoniales 2025) duplicando exactamente `TRAMOS_GANANCIAS_PATRIMONIALES_2025` de `data/fiscal/inmuebles.ts` — sin diferencia numérica actual, pero con riesgo de divergencia si cambian los tramos (LPGE). | Eliminada la constante local en las 3 apps; importan y usan `TRAMOS_GANANCIAS_PATRIMONIALES_2025`. |
| 51.5 | 🟡 Bajo | `app/estimador-compraventa-inmueble/page.tsx`, "Caso 1 — Marta" | El caso describía Madrid/200.000€/"tipo reducido 6%" — internamente contradictorio (Madrid no tiene reducido del 6% para ese perfil) y, tras el fix 51.1, el perfil indicado pasaría a calcular un ITP distinto al narrado. | Reescrito como escenario Andalucía/140.000€/ITP 3,5% (tipo reducido jóvenes verificado contra `TIPOS_ITP_CCAA_2025`), con cifras recalculadas: ITP general 9.800€, reducido 4.900€, ahorro 4.900€, notaría+registro+gestoría ~790€. |
| 51.6 | 🟡 Bajo | `app/estimador-compraventa-inmueble/page.tsx`, "Caso 3 — Ana" | La ganancia patrimonial se indicaba como 70.000€ sin restar la comisión de venta (3%) ni la gestoría (300€), que la propia fórmula de la app sí descuenta — el resultado real es 62.200€, un 11% menos. | Recalculado a 62.200€ y ajustada la descripción de tramos aplicables ("19% primeros 6.000€, 21% hasta 50.000€, 23% el resto"). |
| 51.7 | 🟡 Bajo | `app/amortizacion-hipoteca/page.tsx`, bloque "Casos de Uso" | El texto decía "Contrasta hasta 3 importes de amortización simultáneamente", pero la app soporta 4 escenarios (`escenario1`-`escenario4`, etiquetados "Escenario 1"-"Escenario 4" en la UI). | Corregido a "hasta 4 importes". |
| 51.8 | 🟠 Medio | `app/amortizacion-hipoteca/page.tsx` — 3 ubicaciones: bullet introductorio (L341), tabla comparativa "Comisión por amortización" (L908-913) y FAQ "¿Qué comisión me pueden cobrar por amortizar?" (L980-984) | Tres descripciones distintas (y dos incorrectas) de la comisión máxima por amortización anticipada (Ley 5/2019, art. 23). El bullet decía "0,15% en fijas según tiempo restante" (el 0,15% es el tramo 3-5 años de **variable**, no de fijo); la FAQ decía "0,25% los primeros 5 años o 0,5% los primeros 3 para tipo fijo" (cifras sin base normativa — el máximo real para fijo es muy superior: 2%/1,5%); solo la sección "💰 Comisiones" (L846-849) tenía las cifras correctas. La tabla comparativa solo mencionaba "máx. 0,25-0,5% según ley", omitiendo que en hipoteca fija el máximo es hasta 8× mayor (2%). | Las 3 ubicaciones reescritas con las cifras correctas y consistentes: variable 0,25% (≤3 años) / 0,15% (3-5 años) / 0% (>5 años); fijo 2% (≤10 años) / 1,5% (>10 años), citando Ley 5/2019. |
| 51.9 | 🟡 Bajo | `lib/calculadoras/hipoteca.ts` (`calcularHipoteca`, rama `tipoHipoteca === 'mixta'`) | El array `resumenAnual` se inicializa con entradas `{cuotasAnuales: 0, interesesAnio: 0, capitalAnio: 0, capitalPendiente: 0}` dentro del bucle de simulación, pero nunca se actualiza con los valores reales calculados (a diferencia de la rama no-mixta, que tiene un segundo bucle "Reconstruir resumen anual correctamente"). Verificado que ninguna app web ni la salida del tool MCP `calcular_hipoteca` consumen `resumenAnual` para mixta — código muerto sin impacto en el usuario, documentado para una limpieza futura. | No corregido (fuera del alcance fix-as-you-find por no tener impacto observable); documentado aquí para referencia. |
| 51.10 | 🔴 Crítico | `lib/calculadoras/retencionAlquiler.ts` (`calcularRetencionAlquiler`, tool MCP `calcular_retencion_alquiler`) | La reducción por arrendamiento de vivienda habitual se calculaba siempre al **60%**, tipo vigente **hasta 2023**. Desde la Ley 12/2023 (Ley de Vivienda), vigente desde 01/01/2024, el tipo general es del **50%** (60% solo en supuestos especiales de rehabilitación). El propio `lib/calculadoras/rendimientoCapitalInmobiliario.ts` (la versión "detallada" del mismo cálculo) ya documentaba correctamente este cambio. El resultado: `calcular_retencion_alquiler` infraestimaba el rendimiento neto reducido (y por tanto el IRPF a pagar) en cualquier alquiler con rendimiento positivo. | Cambiado `* 0.6` → `* 0.5`; campo renombrado `reduccion60pct` → `reduccionVivienda` (y actualizado en `route.ts` + tests golden); descripción del tool MCP y texto de salida actualizados a "Reducción 50% (vivienda habitual, Ley 12/2023)". |

**Apps revisadas sin hallazgos**: `estimador-compraventa-inmueble` Casos 2 (Carlos/Valencia obra nueva) y 4 (Pedro mayor 65) + FAQ — verificados contra `ITP_CCAA.valencia.ajd` y la lógica de exención `exentoIRPF`, correctos. `estimador-hipoteca` y `app/amortizacion-hipoteca` (fórmulas de cuota/amortización) — verificadas contra `lib/calculadoras/hipoteca.ts` y `lib/calculadoras/amortizacionAnticipada.ts`, coinciden exactamente (sistema francés estándar). `calculadora-rentabilidad-alquiler` — la reducción del 50%/60% ya estaba correctamente explicada (50% general desde 2024, 60% solo contratos anteriores a 2023), sirvió de referencia para el fix 51.10. `selector-tipo-hipoteca` — quiz sin fórmulas de cálculo, comisiones de amortización ya citadas correctamente (Ley 5/2019).

**RelatedApps/ShareCard/Footer**: correctos en todas las apps revisadas.

**Correcciones aplicadas**:
- 51.1: helper `normalizarTexto` + matching sin tildes en 3 apps de compraventa.
- 51.2: `lib/calculadoras/compraventa.ts` — AJD = 0 en segunda mano (incompatibilidad ITP/AJD art. 31.2 TRLITP).
- 51.3: `data/itp-ccaa.ts` — `tipoMaximo` por defecto 25% (orientativo) en lugar de 30% (máximo legal).
- 51.4: `TRAMOS_IRPF_AHORRO` local eliminado en 3 apps, usan `TRAMOS_GANANCIAS_PATRIMONIALES_2025`.
- 51.5/51.6: Casos 1 y 3 de `estimador-compraventa-inmueble` reescritos con cifras recalculadas.
- 51.7/51.8: `amortizacion-hipoteca` — "4 importes" + 3 ubicaciones de comisión por amortización corregidas (Ley 5/2019).
- 51.9: documentado código muerto en `lib/calculadoras/hipoteca.ts` (sin fix).
- 51.10: `lib/calculadoras/retencionAlquiler.ts` — reducción 60%→50% (Ley 12/2023) + tests golden recalculados.

**Build**: ✅ exit 0, 999 apps, 1300 páginas (2026-06-12).

**Grupo 4 "Vivienda" — COMPLETADO** (`estimador-compraventa-inmueble`, `simulador-gastos-compraventa-garaje`, `simulador-gastos-compraventa-trastero`, `amortizacion-hipoteca`, `estimador-hipoteca`, `calculadora-rentabilidad-alquiler`, `selector-tipo-hipoteca`; `lib/calculadoras/compraventa.ts`, `lib/calculadoras/hipoteca.ts`, `lib/calculadoras/amortizacionAnticipada.ts`, `lib/calculadoras/retencionAlquiler.ts`, `lib/calculadoras/rendimientoCapitalInmobiliario.ts`, `data/itp-ccaa.ts` corregidos/verificados. `calcular_capacidad_hipoteca` es MCP-only, sin app web dedicada — `lib/calculadoras/capacidadHipoteca.ts` verificado, fórmula correcta).

---

## Resumen ejecutivo — Suite Viajes

| Severidad | Nº hallazgos |
|---|---|
| 🔴 Crítico | 1 |
| 🟠 Medio | 12 |
| 🟡 Bajo | 27 (25 resueltos en Tanda 3+4, 2 notas de revisión anual sin acción) |

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

### Tanda 2 — ✅ COMPLETADA (2026-06-11)

5. ✅ `comparador-transporte-viaje` — alinear tiempo avión MAD-BCN entre fórmula y FAQ (12.1)
6. ✅ `comparador-coste-vida` — refrescar etiqueta de fechas (2025-2026) y datos de Buenos Aires (15.1, 15.2)
7. ✅ `paises-del-mundo` — resolver 195 vs 196 países (16.1): explicación 193 ONU + Vaticano/Palestina + Taiwán = 196, propagada a `page.tsx`, `metadata.ts`, `data/countries.ts`, `data/applications.ts` y `data/app-relations.ts`
8. ✅ `lista-equipaje` — nota de verificación (junio 2026) y aviso "consulta siempre la política vigente" junto a la tabla de aerolíneas; dato EasyJet matizado (6.1, 6.2)

Build verificado: 998 apps, 1299 páginas, exit 0.

### Tanda 3 — Limpieza menor 🟡 Bajo (parte 1/2) — ✅ COMPLETADA (2026-06-12)

11 ediciones de texto en 6 apps (sin cambios de lógica salvo 2.1):

1. ✅ `calculadora-propinas` — matizar fuente del dato de salario en hostelería (1.4)
2. ✅ `calculadora-combustible` — `parseNum` ahora usa `Math.max(0, ...)` (2.1) + nota de precios orientativos 2025-2026 (2.2)
3. ✅ `conversor-horarios` — "desde la época franquista" → "una decisión de 1940 que nunca se revirtió" (3.2)
4. ✅ `informacion-tiempo` — matizar que la actualización cada ~10 min es del proveedor, no de la app (4.1) + atribuir cifra de estaciones AEMET a aemet.es sin cifra exacta (4.2)
5. ✅ `conversor-unidades` — distinguir GiB (binario) de GB (SI) (5.1) + suavizar "solo 3 países sin SI" con matiz de transición (5.2)
6. ✅ `checklist-documentos-viaje` — tasa pasaporte 30 €→30,90 € (7.1), unificar cobertura seguro EEUU a 150.000 € en `page.tsx` (dos menciones) y `metadata.ts` (7.2), generalizar "México/Costa Rica/Brasil" a "países latinoamericanos" + recomendar consultar embajada (7.3)

Build verificado: 999 apps, 1300 páginas, exit 0.

---

### Tanda 4 — Limpieza menor 🟡 Bajo (parte 2/2) — ✅ COMPLETADA (2026-06-12)

14 hallazgos resueltos en 8 apps (sin cambios de lógica salvo el comentario de `comparador-transporte-viaje`):

1. ✅ `orientador-jet-lag` — tabla husos: última fila "9+ h" → "10+ h" para coherencia con el código `<=9`/`>9` (8.3) + nota indicando que los UTC son horario estándar y pueden variar ±1h con DST (8.4)
2. ✅ `guia-seguro-viaje` — validez de la TSJE: "Tiene validez de 1-2 años" → "La fecha de caducidad viene impresa en la propia tarjeta; compruébala antes de viajar" (9.1) + unificar cobertura mínima EE.UU. a "250.000 USD (recomendable 500.000 USD o ilimitada)" en `page.tsx`, alineado con `metadata.ts` (9.2)
3. ✅ `planificador-itinerario` — Metro París: "billete suelto 2,15 €/viaje vs. día completo 8,65 €" → tarifa única "t+" ~2,50 €/viaje + recomendación de pase turístico/día (10.3)
4. ✅ `conversor-divisas` — eliminado comentario obsoleto sobre "fallback BCE (enero 2025)" en `app/api/divisas/route.ts` (código muerto) (11.1) + matizado "Revolut fin de semana +1%" a "según plan y divisa" (11.2)
5. ✅ `comparador-transporte-viaje` — comentario `0,085 €/km` "combustible + amortización" → "combustible (estimación; no incluye amortización ni seguro)" (12.2) + migrado de `// @disclaimer: exempt` a `<DisclaimerCard variant="general" severity="medium" collapsible>`, alineado con `conversor-divisas` (12.4). Nota: 12.3 es revisión anual, sin acción.
6. ✅ `enchufes-por-pais` — unificado "tipos A-M (15 tipos)" → "tipos A-N (14 tipos)" en comentario del dataset y texto educativo (14.1)
7. ✅ `comparador-coste-vida` — FAQ JSON-LD: "Bucarest, Belgrado, Sofía y Budapest" → "Bucarest, Budapest y Estambul" (ciudades presentes en el dataset `CIUDADES`) (15.3)
8. ✅ `paises-del-mundo` y `data/countries.ts` — comentarios "EUROPA (44 países)"/"ASIA (49 países)" → "(45 países)"/"(48 países)", y tabla comparativa de continentes actualizada igual (16.2); población de India unificada a 1.450 M (ONU/Banco Mundial 2024-2025) en `countries.ts` y en las dos menciones del texto educativo (16.3); densidad de Europa unificada a "~71 hab/km²" (745M/10,5M km²) (16.4). Nota: 16.5 es revisión anual, sin acción.

Build verificado: 999 apps, 1300 páginas, exit 0.

**Cierre Viajes 🟡 Bajo**: 25/27 hallazgos resueltos (11 en Tanda 3 + 14 en Tanda 4) + 2 notas de revisión anual sin acción de código (12.3, 16.5 — pendientes de la revisión anual de enero).

---

## 17. Hallazgo transversal — datos compartidos `data/fiscal/`

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 17.1 | ✅ Resuelto (2026-06-11) | `data/fiscal/pensiones.ts:260` (`smiMensual: 1323`) y `data/fiscal/nomada-digital.ts:24` (`SMI_MENSUAL_NOMADA = 1323`) | Ambos módulos usaban **1.323 €/mes** como "SMI 2025/2026" (en realidad el SMI **2024**, 15.876 €/año ÷ 12 pagas), mientras `data/fiscal/smi.ts` (verificado 2026-04-01, BOE oficial) fija SMI 2025 = 1.184 €/mes y SMI 2026 = 1.221 €/mes (14 pagas). Afectaba a `app/requisitos-nomada-digital`, `app/estimador-pension-viudedad`, `lib/calculadoras/pensionViudedad.ts` (y por tanto al tool MCP Delegum `calcular_pension_viudedad`) y `lib/calculadoras/embargoSalario.ts`. | **Corregido**: `pensiones.ts` y `nomada-digital.ts` ahora importan `SMI_2026` desde `data/fiscal/smi.ts` (`smiMensual`/`SMI_MENSUAL_NOMADA` = 1.221 €, `limiteIngresos70`/`MINIMO_INGRESOS_DEPENDIENTE_NOMADA` = 916 €). Textos hardcoded en `app/requisitos-nomada-digital` (page.tsx + metadata.ts FAQ) actualizados a 2.442 €/916 €/1.221 € (2026). `embargoSalario.ts` migrado a `SMI_2026` (1.221 €/1.424,50 €), eliminando constantes locales duplicadas y la cita errónea "RD 145/2025". Comentarios de `tests/calculadoras-invariantes.spec.ts` actualizados. `npx tsc --noEmit` sin nuevos errores y `npm run test:calc` (136/136) en verde. |

---

## Resumen ejecutivo — Suite Juegos y Ocio

| Severidad | Nº hallazgos |
|---|---|
| 🔴 Crítico | 0 (2 corregidos en Tanda 1) |
| 🟠 Medio | 0 (6 corregidos en Tanda 1, 6 corregidos en Tanda 2) |
| 🟡 Bajo | 0 (13 corregidos en Tanda 3, 13 corregidos en Tanda 4, de 26 totales) |

**Hallazgos críticos** (✅ corregidos en Tanda 1, ver sección "Tanda 1 — Fase 2" más abajo):
- `juego-space-invaders`: el contenido educativo describe búnkeres/defensas y un OVNI bonus como mecánicas centrales del juego, pero ninguna de las dos existe en la implementación real (solo hay nave, balas, filas de invasores y partículas).
- `juego-asteroids`: el contenido educativo dedica tres secciones a la mecánica de "hiperespacio" (tecla H, teletransporte), inexistente en el código; además un cálculo de puntos de la guía da 420 cuando el resultado correcto con las constantes reales del juego es 520.

**Patrones repetidos a vigilar en próximas suites**:
- Contenido educativo que describe niveles, modos o controles que no existen en la implementación real: nivel "Experto" en Memoria y Sudoku, "modo difícil" en Wordle, dificultad adaptativa en Puzzle Matemático, tecla flecha-arriba para saltar en Platform Runner, modalidad "Quiniela" en Generador de Lotería, recetas "Seedlip Spritz"/"Nojito" en Guía de Cócteles, emisoras destacadas con URL vacía en Radio meskeIA. 9 casos en 20 apps — el patrón más repetido de esta suite.
- Estadísticas y porcentajes concretos sin fuente verificable (antipatrón #1 de neutralidad editorial): presente en prácticamente todas las apps con bloque educativo.
- Terminología España-only (ESO/Bachillerato, CCAA, "Ley 13/2011") en apps con suite `estudiantes`/`productividad` que deberían ser neutras para Latam (regla 1.bis): Quiz Verbos Irregulares, Puzzle Matemático, Test de Velocidad de Escritura.

`RelatedApps`/`getRelatedApps` correctos en las 20 apps. `guia-cocteles` mantiene correctamente su `DisclaimerCard severity="high" collapsible={false}` por contenido sobre alcohol.

---

## Hallazgos detallados — Suite Juegos y Ocio

### 18. `cara-o-cruz` (Cara o Cruz)

Sin hallazgos relevantes. `getRelatedApps('cara-o-cruz')` resuelve correctamente. El contenido educativo (Ley de los Grandes Números, falacia del jugador, sesgo de Diaconis) es coherente con la mecánica real (`Math.random() < 0.5`, cálculo de rachas y porcentajes verificado). FAQ JSON-LD alineado con la implementación. `// @disclaimer: exempt` correcto.

---

### 19. `generador-loteria` (Generador de Lotería)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 19.1 | 🟠 Medio | `metadata.ts:6, 39, 44, 92, 95` | El `description`, `jsonLd.features` y dos preguntas de `faqJsonLd` afirman que el generador soporta la **Quiniela** (15 resultados 1/X/2) y "El Gordo de Navidad". `LOTTERY_CONFIG` en `page.tsx` solo define `primitiva`, `euromillones`, `bonoloto`, `gordo` (El Gordo de la Primitiva, no el de Navidad) y `lototurf` — no existe ningún modo Quiniela ni generación 1/X/2. Además, Lototurf sí está implementado pero no se menciona en `description`/FAQ. | Eliminar las menciones a "Quiniela" y "El Gordo de Navidad" de `description`, `keywords`, `jsonLd.features` y la pregunta FAQ correspondiente (sustituir por una pregunta sobre Lototurf, que sí existe), o implementar el modo Quiniela. |
| 19.2 | 🟡 Bajo | `page.tsx:556-566` | FAQ afirma "Los premios de loterías del Estado superiores a 40.000 € tributan al 20% sobre el exceso... art. 13 Ley 16/2012". La cifra y el tipo son correctos, pero el dato fiscal no está centralizado en `data/fiscal/` pese a tener fecha de verificación. | Evaluar mover el umbral (40.000 €) y el tipo (20%) a `data/fiscal/` si se reutiliza en más apps. |

Probabilidades de la tabla comparativa (1/13.983.816 para 6/49, 1/139.838.160 Euromillones, 1/31.625.100 El Gordo) correctas. `RelatedApps`/`DisclaimerCard severity="low" collapsible` correctos.

---

### 20. `guia-cocteles` (Guía de Cócteles Clásicos)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 20.1 | 🟠 Medio | `metadata.ts:87` (FAQ "¿Qué cócteles clásicos se pueden preparar sin alcohol?") | La respuesta menciona "cócteles sin alcohol de identidad propia como el **Seedlip Spritz** o el **Nojito**". El array de 45 cócteles en `page.tsx` solo contiene 7 entradas `familia: 'Sin alcohol'` (Virgin Mojito, Shirley Temple, Arnold Palmer, Virgin Mary, Limonada de frambuesa, Agua de Valencia sin alcohol, Cucumber Cooler); ni "Seedlip Spritz" ni "Nojito" existen en el dataset. | Sustituir los ejemplos por cócteles que sí existen (p. ej. "Agua de Valencia sin alcohol" o "Cucumber Cooler"), o añadirlos al array de 45. |
| 20.2 | 🟡 Bajo | `page.tsx:619` (curiosidad de Virgin Mojito) | "El mercado de los mocktails creció un 42% entre 2019 y 2023 en Europa, impulsado por la tendencia 'sober curious'" sin fuente verificable. | Añadir fuente concreta o suavizar a "según informes del sector...". |

`DisclaimerCard variant="alcohol" severity="high" collapsible={false}` verificado correcto. Recuento "45 cócteles"/"7 sin alcohol" del `jsonLd` coincide con el dataset. `RelatedApps` correcto.

---

### 21. `juego-2048` (Juego 2048)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 21.1 | 🟡 Bajo | `page.tsx:490-493` (FAQ) | "Los jugadores que aplican esta estrategia [esquina fija] tienen tasas de victoria superiores al 90% en la variante 4×4 clásica" sin fuente ni estudio citado. | Suavizar a "se considera la estrategia más fiable según la comunidad de jugadores" o citar fuente. |
| 21.2 | 🟡 Bajo | `page.tsx:621` | Repite "Más del 90% de las victorias documentadas usan esta técnica" — mismo problema que 21.1, duplicado en dos secciones. | Misma corrección que 21.1; unificar el mensaje en un único lugar. |

Mecánica del juego (tablero 4×4, fusión de potencias de 2, generación 90/10 de fichas 2/4, detección de victoria/derrota) correcta y coherente con el FAQ. Ficha máxima teórica 131.072 (2¹⁷) y puntuación máxima ~3,9M consistentes. `RelatedApps`/`// @disclaimer: exempt` correctos.

---

### 22. `juego-asteroids` (Juego Asteroids)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 22.1 | 🔴 Crítico | `page.tsx:1169-1174, 1216-1223, 1254-1258` | El contenido educativo describe extensamente una mecánica de "hiperespacio" (botón H, teletransporte aleatorio, riesgo de aparecer encima de un asteroide) en tres secciones (guía, mejores prácticas, errores comunes). El manejador de teclado real (`handleKeyDown`) solo gestiona `ArrowUp`/`W` (impulso), `Space` (disparo), `P` (pausa) y `R` (reinicio) — no existe tecla `H` ni teletransporte en el código. El contenido describe una función inexistente. | Opción A (recomendada): eliminar las menciones al hiperespacio en las tres secciones y sustituirlas por consejos sobre mecánicas reales (gestión de inercia, límite de 5 balas, rotación). Opción B: implementar la mecánica (tecla H → reposición aleatoria con riesgo de colisión). |
| 22.2 | 🟠 Medio | `page.tsx:1147-1149` | El texto afirma que destruir un asteroide grande (20 pts) hasta fragmentos pequeños (2 medianos de 50 pts, 4 pequeños de 100 pts) "te da 420 puntos totales". El cálculo correcto con esas constantes es 20 + 2×50 + 4×100 = **520**, no 420. | Corregir "420 puntos totales" a "520 puntos totales" en `page.tsx:1149`. |

Rotación, impulso con inercia, límite de 5 balas (`MAX_BULLETS = 5`), división grande→mediano→pequeño y teletransporte en bordes del canvas correctos. `RelatedApps`/`// @disclaimer: exempt` correctos.

---

### 23. `juego-memoria` (Juego de Memoria)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 23.1 | 🟠 Medio | `page.tsx:34-38` (`CONFIGURACION`) vs tabla educativa (~líneas 306-337) | El juego solo tiene 3 niveles seleccionables: Fácil (6 pares, 4×3), Medio (8 pares, 4×4), Difícil (12 pares, 6×4). La tabla "Niveles de dificultad comparados" describe 4 niveles, incluyendo "🔥 Experto (6×5, 15 pares)", que no existe ni es seleccionable; y "🧠 Difícil (5×4, 10 pares)" tampoco coincide con el difícil real (12 pares, 6×4). | Eliminar la fila "Experto" (o implementar un 4º nivel real en `CONFIGURACION`) y corregir la fila "Difícil" a 12 pares / 6×4. |
| 23.2 | 🟡 Bajo | `page.tsx:546` | "Esta agrupación espacial reduce la carga de la memoria de trabajo hasta en un 30%" — cifra sin fuente ni estudio. | Suavizar a "puede reducir la carga de memoria de trabajo" sin porcentaje, o citar fuente. |
| 23.3 | 🟡 Bajo | `page.tsx:608-611` | "Se necesitan al menos 3-4 semanas de práctica regular para notar diferencias medibles" — cifra plausible pero sin fuente. | Matizar como estimación general ("estudios de entrenamiento cognitivo sugieren..."). |

`getRelatedApps('juego-memoria')` correcto. Lógica del juego (mezcla Fisher-Yates, detección de parejas, temporizador, mejores tiempos en `localStorage`) correcta.

---

### 24. `juego-ahorcado` (Juego del Ahorcado)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 24.1 | 🟠 Medio | `page.tsx:41` (array `paises`) | La categoría "🌍 Países" incluye `'CAMBODIA'` (nombre en inglés; en español es "CAMBOYA") junto a `'CROACIA'`, `'TANZANIA'`, `'JORDANIA'`, `'ARMENIA'`, `'URUGUAY'`. El `metadata.ts` afirma "100% local, vocabulario en español" — un anglicismo en una app educativa de vocabulario es inconsistente con esa promesa. | Cambiar `'CAMBODIA'` por `'CAMBOYA'`. |
| 24.2 | 🟡 Bajo | `metadata.ts:39-43` | `jsonLd.features` está vacío (`[]`), mientras otras apps de la suite incluyen 5-7 características reales. Reduce la calidad de los datos estructurados para SEO/IA. | Rellenar `features` con 4-8 características reales (4 categorías, teclado virtual, estadísticas con racha, accesibilidad ARIA, 100% local). |
| 24.3 | 🟡 Bajo | `page.tsx:489-490` | FAQ afirma que la letra E aparece en "aproximadamente el 13,7%" de los textos en español, con cifras exactas para A, O, S, R, N, sin citar fuente del estudio de frecuencia léxica. | Citar fuente (RAE/corpus CREA) o suavizar a "según estudios de frecuencia léxica". |

`getRelatedApps('juego-ahorcado')` correcto. Lógica del juego (selección aleatoria, conteo de errores, estadísticas con racha) correcta. Resto de categorías (animales, profesiones, vocabulario) sin anglicismos.

---

### 25. `juego-piedra-papel-tijera` (Juego Piedra Papel Tijera)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 25.1 | 🟡 Bajo | `page.tsx:604-606` | "La Piedra es elegida ~35% de las veces, Papel ~33% y Tijera ~32% en jugadores sin entrenamiento" — cifras concretas sin fuente. | Suavizar a "estudios sugieren una ligera preferencia por Piedra" sin porcentajes exactos, o citar fuente. |
| 25.2 | 🟡 Bajo | `page.tsx:454-457` | "Según investigaciones en teoría de juegos, la Piedra es la jugada más frecuente... Los hombres eligen Piedra con mayor frecuencia que las mujeres" — afirmación sociológica sin fuente ni año. | Citar el estudio o eliminar la afirmación sobre diferencias de género. |
| 25.3 | 🟡 Bajo | `page.tsx:484-486` | "El campeonato fue muy popular en Canadá durante los años 2000" (World RPS Society) — afirmación histórica sin fuente, con sesgo geográfico anglosajón (antipatrón #5). | Suavizar/generalizar sin anclar a un país/década concretos. |

Sin hallazgos de severidad Medio o superior. Lógica del juego (`determinarGanador`, elección aleatoria, estadísticas con racha) correcta y coherente con el FAQ (33% por jugada). `getRelatedApps('juego-piedra-papel-tijera')` correcto.

---

### 26. `juego-platform-runner` (Juego Platform Runner)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 26.1 | 🟠 Medio | `metadata.ts:51` (FAQ) vs `page.tsx:597-613` (`handleKeyDown`) y `page.tsx:802-805` (panel de controles) | El FAQ afirma "Se juega con las teclas de flecha (movimiento) y la barra espaciadora **o flecha arriba** para saltar". `handleKeyDown` solo activa el salto con `e.key === ' '`; `ArrowUp` no está manejado. El panel de controles en pantalla solo muestra "ESPACIO → Saltar". | Corregir el FAQ a "barra espaciadora para saltar" (eliminar la mención a flecha arriba), o añadir el manejo de `ArrowUp` en `handleKeyDown`. |
| 26.2 | 🟡 Bajo | `page.tsx:170-196` | Todos los niveles ≥3 comparten el mismo diseño "Nivel 3+ - Avanzado" (mismas plataformas/monedas/enemigos). El FAQ promete "niveles progresivos", cierto entre 1→2→3 pero no a partir del 3. | Matizar a "3 niveles con dificultad creciente" o generar variación para niveles 4+. |
| 26.3 | 🟡 Bajo | `page.tsx:983-988` | "Varios estudios de psicología cognitiva han demostrado que los juegos de acción y plataformas mejoran el tiempo de reacción visual..." — usa "han demostrado" para un campo con resultados discutidos, sin citar estudios (antipatrón #3). | Cambiar "han demostrado" por "sugieren" o "han explorado", y citar referencia opcional. |

`getRelatedApps('juego-platform-runner')` correcto. Física (gravedad, colisiones AABB, salto, eliminación de enemigos saltando encima) correcta.

---

### 27. `juego-puzzle-matematico` (Juego Puzzle Matemático)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 27.1 | 🟠 Medio | `page.tsx:644-648` y `metadata.ts:49,69` | El contenido afirma repetidamente que "los niveles se adaptan automáticamente al rendimiento del jugador". `generarProblema` (`page.tsx:76-128`) genera operaciones con rangos numéricos fijos por modo, sin relación con `racha`/`correctas`/`incorrectas`. `racha` solo afecta a la puntuación (`10 + Math.floor(racha/3)*5`), no a la dificultad. No hay dificultad adaptativa real. | Eliminar las afirmaciones de "dificultad adaptativa" del FAQ y de la guía, sustituyéndolas por una descripción precisa, o implementar escalado real de rangos numéricos según `racha`. |
| 27.2 | 🟡 Bajo | `page.tsx:487-491` | La tabla "Tipos de puzzle matemático" usa "Secundaria/Bachillerato (14+)" y "Bachillerato/Adultos (16+)" — terminología España-only en una app de la suite `estudiantes` (regla 1.bis). | Sustituir por "secundaria/preparatoria (14+)" y "educación media/adultos (16+)". |
| 27.3 | 🟡 Bajo | `page.tsx:562-563` | "Estudios de neurociencia cognitiva señalan que la práctica de aritmética mental activa las regiones prefrontal y parietal del cerebro" — afirmación sin cita ni año. | Suavizar a "se asocia comúnmente con..." o citar fuente. |

`getRelatedApps('juego-puzzle-matematico')` correcto. Generación de problemas por modo (suma, resta sin negativos, multiplicación 1-12, división exacta), temporizador de 60s y bonus por racha correctos dentro de su alcance (no adaptativo).

---

### 28. `juego-space-invaders` (Juego Space Invaders)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 28.1 | 🔴 Crítico | `page.tsx:753,763,955-961,966-973,1013-1018,1022-1027,1056-1059` | El contenido educativo describe extensamente "los búnkeres (defensas)" como cobertura táctica clave y un "OVNI rojo" que cruza la pantalla y vale 50-300 puntos según el nº de disparo (incluida una columna "Dificultad defensas" en la tabla de niveles). El juego implementado no tiene ninguna entidad de búnker/defensa ni de OVNI: solo existen `Player`, `Bullet`, `Enemy` (filas de invasores con 30/20/10 pts) y `Particle`. | Eliminar todas las referencias a búnkeres/defensas y al OVNI rojo del contenido educativo (pasos de la guía, tips, columna "Dificultad defensas" y la celda "acumular puntos con el OVNI"), o implementar realmente ambas mecánicas en el game loop. |

Sistema de puntos por fila de invasores (30/20/10) coherente con el FAQ histórico. `RelatedApps` correcto.

---

### 29. `juego-sudoku` (Juego Sudoku)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 29.1 | 🟠 Medio | `page.tsx:674-678` vs `page.tsx:75-142` (`generarSolucion`/`crearPuzzle`) | El FAQ afirma "Un sudoku bien formado tiene exactamente una solución única [...] Los generadores de puzzles verifican esta unicidad antes de presentar el juego." El generador real elimina 35/45/55 celdas (fácil/medio/difícil) en posiciones aleatorias sin ningún solver que cuente soluciones ni verificación de unicidad. En difícil quedan 26 pistas, por debajo del umbral de 17 que el propio texto cita como mínimo para garantizar unicidad. | Implementar un contador de soluciones (solver que se detiene al encontrar 2) tras cada eliminación y revertirla si deja de ser único; o suavizar el texto para no afirmar que este generador verifica unicidad. |
| 29.2 | 🟡 Bajo | `page.tsx:585-589,846,856-857` vs tipo `Dificultad` y selector | El contenido describe un cuarto nivel "⚫ Experto (17-25 pistas)" con técnicas X-wing/swordfish, pero el selector solo ofrece `facil` (46 pistas), `medio` (36) y `dificil` (26) — no existe nivel "Experto" jugable. | Eliminar las referencias al nivel "Experto" inexistente, o añadir un cuarto nivel `experto` (≈56-64 celdas a quitar) con su botón. |

Algoritmo de generación por backtracking (`esValido`/`resolver`) correcto para tableros completos válidos. `RelatedApps` correcto.

---

### 30. `juego-tres-en-raya` (Juego Tres en Raya)

Sin hallazgos relevantes. Implementación de minimax completa y correcta. Cifras de la FAQ (255.168 partidas posibles, 131.184/77.904/46.080 victorias/derrotas/empates del primer jugador, 26.830 posiciones únicas tras simetrías) consistentes con los valores publicados habitualmente para Tic-Tac-Toe. `RelatedApps` correcto.

---

### 31. `juego-wordle` (Juego Wordle)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 31.1 | 🟡 Bajo | `page.tsx:398-404,544-553,644-649` | El contenido educativo dedica una fila de la tabla, una pregunta de la FAQ y un tip a explicar el "modo difícil" de Wordle (reutilizar letras confirmadas). El juego implementado solo tiene un modo — no existe selector de dificultad ni validación de reutilización de pistas en `enviarIntento`. | Eliminar las menciones al "modo difícil" como característica de esta app (o reformular como "en otras versiones de Wordle existe..."), o implementar la validación. |
| 31.2 | 🟡 Bajo | `page.tsx:566-569` | El paso 1 de la guía afirma que "AUDIO, REINA o EUROS... cubren las cinco vocales del español o muy cerca de eso". Ninguna cubre las 5: AUDIO tiene 4 distintas (falta E), REINA tiene 3, EUROS tiene 3. | Reformular a "cubren 3-4 vocales distintas" o usar ejemplos que reflejen correctamente su cobertura vocálica. |
| 31.3 | 🟡 Bajo | `page.tsx:519-523` vs `public/data/palabras-wordle.txt`/`diccionario-es.txt` | La FAQ afirma que "el diccionario de la RAE contiene aproximadamente 8.000-10.000 palabras de 5 letras" y que "los Wordle en español suelen trabajar con 2.000-3.000 palabras", sin fuente, y no coincide con los datos reales de esta app: `diccionario-es.txt` tiene 4.402 palabras de 5 letras y `palabras-wordle.txt` (pool diario) tiene 528. | Citar la fuente real de las cifras de la RAE si se mantienen como dato general, o sustituir por las cifras reales de esta app (4.402 válidas, 528 en el pool diario). |

Evaluación de intentos (`evaluarIntento`) y cálculo de la palabra del día por offset desde 2024-01-01 correctos y deterministas. `RelatedApps` correcto.

---

### 32. `metronomo` (Metrónomo Online)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 32.1 | 🟠 Medio | `page.tsx:15` (preset), `page.tsx:184` (`getTempoName`), `page.tsx:349` (tabla visible), `metadata.ts:67` (FAQ) | El término "Allegro" tiene cuatro valores/rangos distintos en la misma app: preset fijado en 130 BPM; `getTempoName` clasifica como Allegro `< 140` (rango 120-139); la tabla visible dice "Allegro: 120–156 BPM"; el FAQ dice "Allegro (120-168)". Además la tabla visible no incluye "Vivace" (preset 160 BPM, sí existe en `getTempoName` para 140-169), dejando un hueco 156-168 sin clasificación, y el límite superior del FAQ (168) se solapa con el inicio de Presto en la tabla (168-200). | Unificar Allegro a un único rango en los 4 lugares (120-156 BPM, el más citado). Ajustar `getTempoName`: `<120` Moderato, `<156` Allegro, `<168` Vivace, resto Presto. Añadir fila "Vivace (156-168 BPM)" a la tabla y corregir el FAQ a "Allegro (120-156)". |

Resto de presets/clasificaciones (Largo 50/Adagio 70/Andante 90/Moderato 110/Vivace 160/Presto 180) coherentes entre preset y tabla. `RelatedApps` correcto.

---

### 33. `quiz-verbos-irregulares` (Quiz Verbos Irregulares Inglés)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 33.1 | 🟡 Bajo | `page.tsx:390` | El bloque "¿Para quién es útil este quiz?" describe el primer perfil como "Estudiante de ESO/Bachillerato" — terminología España-only en una app de la suite `estudiantes` (regla 1.bis). | Sustituir por "secundaria/preparatoria" o "educación media", o añadir equivalencia entre paréntesis. |
| 33.2 | 🟡 Bajo | `metadata.ts:54` y `page.tsx:450` | La FAQ afirma "el inglés tiene alrededor de 200 verbos irregulares de uso frecuente... unos 75-100"; el bloque educativo dice "con los 75 más frecuentes se cubre más del 90% de los textos". Ambas cifras (200, 90%) sin fuente. | Atribuir fuente concreta o suavizar a "se estima" sin porcentaje exacto. |
| 33.3 | 🟡 Bajo | `page.tsx:470` | "Aprenderlos en grupos reduce el esfuerzo de memorización hasta en un 40%" — cifra sin fuente ni estudio. | Eliminar el porcentaje o sustituir por una afirmación cualitativa. |

Generación de preguntas (`generarPreguntas`/`generarOpciones`) coherente con los 75 verbos de `data/verbos-irregulares.ts` (15 A1 + 20 A2 + 20 B1 + 20 B2). `RelatedApps` correcto.

---

### 34. `radio-meskeia` (Radio meskeIA)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 34.1 | 🟠 Medio | `page.tsx:43-46` | Las dos "emisoras destacadas por defecto" (`los40-default`, `cadena-ser-default`) tienen `url: ''`. El comentario indica que "se muestran mientras carga la API", pero si el usuario hace clic antes de que termine la carga (o si la API falla y se mantiene la lista por defecto), `reproducirEmisora` asigna `audioRef.current.src = ''` y `play()` lanza una excepción capturada que muestra "No se pudo conectar con la emisora" — una emisora "destacada" que nunca puede reproducirse. | Deshabilitar el clic/reproducción en las emisoras placeholder mientras `cargandoEmisoras === true` (mostrar estado "cargando"), o eliminar `EMISORAS_DESTACADAS` y mostrar directamente el spinner sin tarjetas falsas. |
| 34.2 | 🟡 Bajo | `page.tsx:728-730` | La FAQ "¿La música mejora la productividad al trabajar?" cita el "efecto Mozart" sin referencia concreta — concepto popularmente sobreinterpretado y parcialmente refutado. | Citar fuente concreta o eliminar la mención al "efecto Mozart". |
| 34.3 | 🟡 Bajo | `page.tsx:749-753` | "Una emisora estándar a 128 kbps consume aproximadamente 58 MB por hora... a 320 kbps unos 144 MB por hora" — cálculo correcto (128×3600/8≈57,6MB; 320×3600/8≈144MB) pero sin aclarar que es teórico, no medido. | Aclarar que es un cálculo teórico basado en bitrate nominal (opcional). |

---

### 35. `ruleta-aleatoria` (Ruleta Aleatoria)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 35.1 | 🟠 Medio | `metadata.ts:59` | La FAQ "¿Cómo añado mis propias opciones a la ruleta?" afirma "Solo tienes que escribir o pegar tus opciones en el campo de texto, una por línea o separadas por comas. La ruleta se actualiza automáticamente...". La UI real (`page.tsx:334-347`, función `addItem`) es un único `<input type="text">` + botón "+ Añadir" que agrega una opción a la vez; no existe parsing de texto multilínea ni separado por comas. | Reescribir la FAQ describiendo el flujo real (escribir una opción y pulsar "+ Añadir" o Enter, repetir por cada opción; o usar las plantillas de `PRESETS`), o implementar el parsing multilínea/comas descrito. |
| 35.2 | 🟡 Bajo | `page.tsx:608-617` | La FAQ "¿Puedo usar la ruleta para sorteos legales en España?" cita la "Ley 13/2011 de regulación del juego" y umbrales concretos ("premios superiores a 200 € o más de 50 participantes") sin fuente verificable para esas cifras. | Eliminar los umbrales numéricos no respaldados por la normativa citada, o sustituir por una recomendación genérica de consultar a un profesional. |

Algoritmo de giro (`spinWheel`/`drawWheel`) coherente. `RelatedApps` correcto.

---

### 36. `test-velocidad-escritura` (Test de Velocidad de Escritura)

| # | Severidad | Ubicación | Problema | Propuesta |
|---|---|---|---|---|
| 36.1 | 🟠 Medio | `metadata.ts:59,75`, `page.tsx:415` | La FAQ y el bloque educativo afirman que la herramienta calcula "PPM netas" (PPM brutas menos penalización por errores) además de "PPM brutas", y que "los empleadores... suelen usar PPM netos como medida real de rendimiento". `calcularEstadisticas()` (`page.tsx:60-87`) solo calcula `ppm` (sin descontar errores) y `precision` (%); el panel de resultados muestra "PPM" y "Precisión %" por separado — no existe ninguna métrica "PPM netas" en la UI. | Opción A: reescribir FAQ y bloque educativo para reflejar que la app muestra PPM (brutas) y precisión por separado, sin mencionar "PPM netas". Opción B: calcular y mostrar PPM netas (`ppm * precision/100` o restando errores) como métrica adicional. |
| 36.2 | 🟡 Bajo | `page.tsx:395` | El bloque "Oposiciones y Exámenes" cita "Cuerpo General Administrativo del Estado, auxiliares administrativos de CCAA" y "180-200 pulsaciones por minuto" — terminología y normativa España-only en app con suite `productividad` (regla 1.bis). | Generalizar a "exámenes de acceso a la administración pública" sin nombrar cuerpos específicos de España, o añadir contexto equivalente para otros países. |
| 36.3 | 🟡 Bajo | `page.tsx:419` | La FAQ "¿Cuál es la velocidad media de un adulto en España?" cita "Keybr y TypeRacer" y "estudios de productividad laboral" con cifras (35-45 PPM, 60+ PPM) sin enlace ni año. | Atribuir año/fuente concreta o suavizar a estimaciones aproximadas. |

---

### 37. `tirador-dados` (Tirador de Dados)

Sin hallazgos relevantes. El generador de tiradas (`rollDie`/`rollDice`/`quickRoll`) es matemáticamente correcto; las probabilidades de la tabla comparativa y la distribución de 2D6 (7 más probable, 6/36≈16,7%; 2 y 12, 1/36≈2,8%) son correctas. `RelatedApps` correcto.

---

## Tanda 1 — Fase 2 Juegos y Ocio — ✅ COMPLETADA (2026-06-12)

Corregidos los 2 hallazgos 🔴 Crítico y 6 de los 12 hallazgos 🟠 Medio mediante 7 ediciones (Opción A: corrección de contenido educativo para que coincida con la implementación real, sin cambios de lógica de juego):

1. `juego-space-invaders` (28.1) — eliminadas todas las referencias a búnkeres/defensas y OVNI del contenido educativo (guía, tips, errores comunes, FAQ y tabla de niveles); sustituidas por mecánicas reales (filas de invasores 30/20/10 pts, partículas de explosión, frecuencia de disparo enemigo, pausa).
2. `juego-asteroids` (22.1, 22.2) — eliminadas las 3 menciones a "hiperespacio" (tecla H inexistente), sustituidas por consejos sobre `MAX_BULLETS = 5` y gestión de rotación/inercia; corregido el cálculo "420 puntos totales" → "520 puntos totales".
3. `generador-loteria` (19.1) — eliminadas menciones a Quiniela/El Gordo de Navidad (inexistentes en `LOTTERY_CONFIG`) en `description`, `keywords`, `jsonLd.features` y FAQ; añadida pregunta FAQ real sobre Lototurf.
4. `guia-cocteles` (20.1) — corregida FAQ de mocktails: "Seedlip Spritz"/"Nojito" (inexistentes) sustituidos por "Agua de Valencia sin alcohol" y "Cucumber Cooler" (sí presentes en el dataset de 45 cócteles).
5. `juego-memoria` (23.1) — eliminada la fila "🔥 Experto (6×5, 15 pares)" (inexistente) de la tabla de niveles; corregida la fila "Difícil" a "12 pares, 6×4" conforme a `CONFIGURACION`.
6. `juego-ahorcado` (24.1) — corregido `'CAMBODIA'` → `'CAMBOYA'` en el array de países.
7. `juego-platform-runner` (26.1) — corregida FAQ de controles: "barra espaciadora o flecha arriba para saltar" → "barra espaciadora para saltar" (ArrowUp no gestiona el salto).

**Build verificado**: `npm run build` exit 0, 999 apps, 1300 páginas generadas sin errores.

## Tanda 2 — Fase 2 Juegos y Ocio — ✅ COMPLETADA (2026-06-12)

Corregidos los 6 hallazgos 🟠 Medio restantes mediante 6 ediciones (mayormente Opción A; metrónomo y radio incluyen ajustes de lógica/UI menores):

1. `juego-puzzle-matematico` (27.1) — eliminadas las afirmaciones de "dificultad adaptativa" (guía, FAQ, `description`); reformuladas para describir el comportamiento real: modos con rango fijo elegidos por el jugador + racha que solo afecta a la puntuación.
2. `juego-sudoku` (29.1, 29.2) — reformulado el FAQ de unicidad como información matemática general (sin afirmar que el generador de esta app verifique unicidad); eliminada la fila/tabla y menciones al nivel "⚫ Experto" inexistente (X-wing/swordfish reasignado al nivel Difícil).
3. `metronomo` (32.1) — unificado el rango Allegro a 120-156 BPM en `getTempoName`, tabla visible y FAQ; añadida fila "Vivace: 156-168 BPM" a la tabla, eliminando el hueco y el solape con Presto.
4. `radio-meskeia` (34.1) — añadido guard en `reproducirEmisora` (`if (!emisora.url) return`) y estado visual "Cargando..." (spinner, `cursor: not-allowed`, no clicable) para las emisoras destacadas placeholder (`los40-default`, `cadena-ser-default`) mientras no tienen `url`.
5. `ruleta-aleatoria` (35.1) — reescrita la FAQ "¿Cómo añado mis propias opciones?" para describir el flujo real (input + botón "+ Añadir" o Enter, una opción a la vez, o cargar una plantilla predefinida).
6. `test-velocidad-escritura` (36.1) — corregido el FAQ y el bloque educativo: ya no afirman que la app calcule "PPM netas"; se mantiene como concepto explicativo general, aclarando que la app muestra PPM brutas y precisión (%) por separado.

**Build verificado**: `npm run build` exit 0, 999 apps, 1300 páginas generadas sin errores.

## Tanda 3 — Fase 2 Juegos y Ocio (limpieza menor) — ✅ COMPLETADA (2026-06-12)

Corregidos 13 de los 26 hallazgos 🟡 Bajo restantes mediante 6 ediciones (suavizado de cifras sin fuente, atribución a corpus lingüísticos, matización de "han demostrado", relleno de `jsonLd.features` vacío):

1. `generador-loteria` (19.2) — revisado: el umbral de 40.000 € / tipo 20% (art. 13 Ley 16/2012) es correcto y verificable; se decide **sin acción** (no centralizar en `data/fiscal/` por ser uso único — evitar abstracción prematura).
2. `guia-cocteles` (20.2) — eliminada la cifra "42% entre 2019-2023" sobre el mercado de mocktails; reformulado como "ha crecido notablemente en los últimos años".
3. `juego-2048` (21.1, 21.2) — eliminado el ">90% de victorias" (duplicado en FAQ y curiosidad) sobre la estrategia de esquina fija; reformulado de forma cualitativa y con redacción distinta en cada sección.
4. `juego-memoria` (23.2, 23.3) — eliminado "hasta en un 30%" (memoria de trabajo) y "3-4 semanas" (práctica); reformulados como tendencias generales sin cifras exactas.
5. `juego-ahorcado` (24.2, 24.3) — `jsonLd.features` (vacío) rellenado con 6 características reales (categorías, teclado virtual, estadísticas/racha, dibujo progresivo, accesibilidad ARIA, 100% local); FAQ de frecuencia de letras ahora atribuye las cifras a "corpus lingüísticos como el CREA de la RAE".
6. `juego-piedra-papel-tijera` (25.1, 25.2, 25.3) — eliminados los porcentajes exactos de frecuencia de jugadas y la afirmación de diferencia de género sin fuente; generalizada la referencia geográfica/temporal del campeonato RPS (antipatrón #5).
7. `juego-platform-runner` (26.2, 26.3) — FAQ de "niveles progresivos" matizado a "3 niveles con dificultad creciente"; "han demostrado" → "sugieren... aunque los resultados varían según el estudio" (antipatrón #3).

**Build verificado**: `npm run build` exit 0, 999 apps, 1300 páginas generadas sin errores.

## Tanda 4 — Fase 2 Juegos y Ocio (limpieza menor, parte final) — ✅ COMPLETADA (2026-06-12)

Corregidos los 13 hallazgos 🟡 Bajo restantes mediante 6 ediciones (terminología Latam-friendly, eliminación de mecánicas/cifras inexistentes, suavizado de afirmaciones sin fuente):

1. `juego-puzzle-matematico` (27.2, 27.3) — "Secundaria/Bachillerato (14+)" → "Secundaria/preparatoria (14+)" y "Bachillerato/Adultos (16+)" → "Educación media/adultos (16+)"; afirmación de neurociencia reformulada de "estudios... señalan" a "la neurociencia cognitiva sugiere... se asocia con".
2. `juego-wordle` (31.1, 31.2, 31.3) — eliminado el "modo difícil" inexistente (fila de tabla, tip y FAQ reformulados aclarando que esta versión usa modo estándar); corregidos los ejemplos de cobertura vocálica (AUDIO/REINA/EUROS/CAIRE: "3-4 vocales distintas" en vez de "las cinco vocales"); cifras de diccionario sustituidas por las reales del proyecto (`diccionario-es.txt` = 86.972 palabras, `palabras-wordle.txt` = 528 palabras del día).
3. `quiz-verbos-irregulares` (33.1, 33.2, 33.3) — "Estudiante de ESO/Bachillerato" → "Estudiante de secundaria/preparatoria (ESO/Bachillerato en España)"; "más del 90% de los textos" eliminado y reformulado cualitativamente; "reduce el esfuerzo de memorización hasta en un 40%" → recomendación cualitativa de agrupar por patrones (ablaut, sufijo).
4. `radio-meskeia` (34.2, 34.3) — eliminado el "efecto Mozart" como referencia establecida, reformulado hacia el efecto general (y variable según persona) de la música instrumental en la concentración; cálculo de consumo de datos (58/144 MB por hora) aclarado como estimación teórica basada en el bitrate nominal, no una medición real.
5. `ruleta-aleatoria` (35.2) — eliminados los umbrales sin fuente ("200 €", "50 participantes") y la referencia específica a la Ley 13/2011; FAQ reformulada hacia una recomendación genérica (uso informal vs. consultar normativa/Dirección General de Ordenación del Juego para sorteos con premios significativos).
6. `test-velocidad-escritura` (36.2, 36.3) — "Cuerpo General Administrativo del Estado, CCAA" → "exámenes de acceso a la administración pública" (genérico, varía según país); pregunta y respuesta de "velocidad media en España" generalizadas a "velocidad media de un adulto al escribir", atribuyendo las cifras a "datos agregados de Keybr/TypeRacer (sin desglose oficial por país)".

**Build verificado**: `npm run build` exit 0, 999 apps, 1300 páginas generadas sin errores.

## Cierre Fase 2 — Suite Juegos y Ocio (2026-06-12)

**Fase 2 completada en su totalidad**: las 39 incidencias detectadas en la auditoría (2 🔴 Crítico + 12 🟠 Medio + 26 🟡 Bajo, sobre 20 apps revisadas) han sido resueltas en 4 tandas:

- **Tanda 1** (commit `397dee12`): 2 🔴 + 6 de 12 🟠.
- **Tanda 2** (commit `5f834b12`): 6 🟠 restantes.
- **Tanda 3** (commit `ac12c38a`): 13 de 26 🟡 Bajo (incluye 19.2 documentado como "sin acción" por evitar abstracción prematura).
- **Tanda 4** (este commit): 13 🟡 Bajo restantes.

4 builds verificados (uno por tanda), todos exit 0 con 999 apps / 1300 páginas. No quedan hallazgos pendientes en la Suite Juegos y Ocio.


