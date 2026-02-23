# BACKLOG.md - meskeIA Web

> **Última actualización**: 2026-02-23
> **Apps totales**: 235 | **Suites**: 12
> **Uso**: Claude Code lee este fichero al inicio de cada sesión y trabaja la siguiente tarea disponible.

---

## 📊 Estado de Suites (referencia rápida)

| Suite | Apps | Estado |
|-------|------|--------|
| 🧮 Estudiantes | 49 | ✅ Bien cubierta |
| 📚 Cultura General | 43 | ✅ Bien cubierta |
| ⚡ Productividad | 38 | ✅ Bien cubierta |
| 📈 Finanzas | 34 | ✅ Bien cubierta |
| 🔧 Herramientas Técnicas | 32 | ✅ Bien cubierta |
| 🎨 Diseño y Desarrollo | 28 | 🟡 Aceptable |
| 🏥 Salud y Bienestar | 25 | 🟡 Aceptable |
| 📢 Marketing y Contenido | 25 | 🟡 Aceptable |
| 🏘️ Inmobiliaria y Hogar | 23 | 🟡 Aceptable |
| 🎲 Juegos y Ocio | 18 | 🔴 GAP |
| 💼 Freelance y Autónomo | 17 | 🔴 GAP |
| ✈️ Viajes y Turismo | 10 | 🔴 GAP CRÍTICO |

**Valor diferencial meskeIA**: Gratuito · Sin registro · 100% local en el PC · Total confidencialidad

---

## 🔴 URGENTE — Mantenimiento Técnico

> Tareas técnicas que afectan la calidad y seguridad de toda la plataforma.

- [x] ~~**CSP Enforcement**: Cambiar `Content-Security-Policy-Report-Only` → `Content-Security-Policy` en `vercel.json` y `next.config.ts`.~~ ✅ Completado 2026-02-23

- [ ] **Actualizar dependencias (Fase 6)**: `npm outdated` → evaluar actualizaciones. Priorizar: Next.js, React, Chart.js. Sesión dedicada por alto riesgo de breaking changes.
  - *Impacto*: Rendimiento, seguridad, compatibilidad futura
  - *Complejidad*: Alta (sesión separada, con build verification)

- [x] ~~**Auditoría ai-index.json**~~: Verificado y corregido. `total_tools` ajustado a 236 (234 previos + 2 nuevas apps). ✅ Completado 2026-02-23

- [x] ~~**Revisar apps sin dark mode completo**~~: De 34 archivos, 8 tenían problemas reales (fondos claros en estados error/danger). Corregidos. 12 usaban hover states válidos. 5 juegos con colores intencionales. ✅ Completado 2026-02-23

- [x] ~~**ai-index.json desactualizado**~~: 27 apps añadidas a sus categorías. `total_tools` actualizado a 231. ✅ Completado 2026-02-23

---

## 🟡 NUEVAS APPS — Alta Prioridad (cubrir gaps de suites)

> Suites con menos cobertura. Cada app nueva en estas suites tiene mayor impacto relativo.

### ✈️ Viajes y Turismo (10 apps — GAP CRÍTICO, objetivo: +5 apps)

- [ ] **Planificador de itinerario de viaje** (`planificador-itinerario`)
  - Suite: `viajes` | Contextos: `relax`, `casa`
  - Descripción: Organiza días, actividades y tiempos de un viaje. Exportable como texto.
  - Privacidad: ✅ 100% local
  - Complejidad: Media

- [ ] **Calculadora de seguro de viaje** (`calculadora-seguro-viaje`)
  - Suite: `viajes`, `finanzas` | Contextos: `relax`, `dinero`
  - Descripción: Estima coste de seguro según destino, duración, edad y cobertura deseada. Con explicación de qué cubre cada tipo.
  - Privacidad: ✅ 100% local
  - Complejidad: Media

- [ ] **Guía de visados desde España** (`guia-visados-espana`)
  - Suite: `viajes`, `cultura` | Contextos: `relax`, `curiosidad`
  - Descripción: Base de datos local de requisitos de visado para ciudadanos españoles por país de destino. Sin API externa.
  - Privacidad: ✅ 100% local (datos embebidos)
  - Complejidad: Media (requiere investigar y embeber datos)

- [x] ~~**Simulador de jet lag**~~ (`simulador-jet-lag`) ✅ Completado 2026-02-23
  - Suite: `viajes`, `salud` | Contextos: `relax`, `trabajo`
  - Descripción: Calcula el impacto del jet lag según zonas horarias cruzadas y da recomendaciones de adaptación.
  - Privacidad: ✅ 100% local
  - Complejidad: Baja

- [x] ~~**Organizador de documentos de viaje**~~ (`checklist-documentos-viaje`) ✅ Completado 2026-02-23
  - Suite: `viajes`, `productividad` | Contextos: `relax`, `casa`
  - Descripción: Checklist personalizable: pasaporte, visado, seguros, vacunas, reservas, dinero. Editable y descargable.
  - Privacidad: ✅ 100% local
  - Complejidad: Baja

### 💼 Freelance y Autónomo (17 apps — GAP, objetivo: +4 apps)

- [ ] **Calculadora cuota autónomo 2026** (`calculadora-cuota-autonomo`)
  - Suite: `freelance`, `finanzas` | Contextos: `trabajo`, `dinero`
  - Descripción: Nueva tarifa plana por tramos de rendimiento neto. Cuota mensual según ingresos esperados, con simulación anual.
  - Privacidad: ✅ 100% local
  - Complejidad: Media (fórmulas SS 2024+)

- [ ] **Simulador declaración trimestral** (`simulador-declaracion-trimestral`)
  - Suite: `freelance`, `finanzas` | Contextos: `trabajo`, `dinero`
  - Descripción: Modelo 303 (IVA trimestral) y Modelo 130 (IRPF estimación directa). Calcula qué pagar cada trimestre.
  - Privacidad: ✅ 100% local
  - Complejidad: Alta (legislación fiscal española)
  - DisclaimerCard: `financial` obligatorio

- [ ] **Comparador asalariado vs autónomo** (`comparador-asalariado-autonomo`)
  - Suite: `freelance`, `finanzas` | Contextos: `trabajo`, `dinero`
  - Descripción: Dado el mismo ingreso bruto, compara neto final como asalariado vs autónomo. Incluye cuotas, impuestos, gastos deducibles.
  - Privacidad: ✅ 100% local
  - Complejidad: Media
  - DisclaimerCard: `financial`

- [ ] **Calculadora de retención IRPF en facturas** (`calculadora-retencion-irpf`)
  - Suite: `freelance`, `finanzas` | Contextos: `trabajo`, `dinero`
  - Descripción: Calcula la retención IRPF a aplicar en facturas (7% nuevos, 15% general, 19% profesionales). Con desglose de IVA.
  - Privacidad: ✅ 100% local
  - Complejidad: Baja
  - DisclaimerCard: `financial`

### 🎲 Juegos y Ocio (18 apps — GAP, objetivo: +3 apps)

- [x] ~~**Quiz de países y capitales**~~ (`quiz-paises-capitales`) ✅ Completado 2026-02-23
  - Suite: `juegos`, `cultura`, `estudiantes` | Contextos: `relax`, `curiosidad`, `estudio`
  - Descripción: Quiz geográfico con los 195 países del mundo. Modos: adivina capital, adivina país, adivina bandera. Con puntuación.
  - Privacidad: ✅ 100% local (datos embebidos)
  - Complejidad: Media

- [x] ~~**Juego del ahorcado**~~ (`juego-ahorcado`) ✅ Completado 2026-02-23
  - Suite: `juegos`, `estudiantes` | Contextos: `relax`, `estudio`
  - Descripción: Clásico juego del ahorcado en español. Categorías: animales, países, profesiones, palabras comunes. Sin datos externos.
  - Privacidad: ✅ 100% local
  - Complejidad: Baja

- [ ] **Quiz de cultura general** (`quiz-cultura-general`)
  - Suite: `juegos`, `cultura` | Contextos: `relax`, `curiosidad`
  - Descripción: 500+ preguntas por categorías (historia, ciencia, arte, deporte, geografía). Modo timed y modo calma.
  - Privacidad: ✅ 100% local (preguntas embebidas)
  - Complejidad: Media

---

## 🟢 NUEVAS APPS — Media Prioridad

> Suites mejor cubiertas pero con oportunidades relevantes para usuarios españoles.

### 📈 Finanzas

- [ ] **Simulador de pensión pública** (`simulador-pension-publica`)
  - Suite: `finanzas`, `salud` | Contextos: `dinero`, `trabajo`
  - Descripción: Estimación de pensión basada en años cotizados, base reguladora y edad de jubilación. Con comparativa según distintos escenarios.
  - Privacidad: ✅ 100% local | DisclaimerCard: `financial`
  - Complejidad: Media

- [ ] **Calculadora IRPF nómina 2026** (`calculadora-irpf-nomina`)
  - Suite: `finanzas`, `freelance` | Contextos: `trabajo`, `dinero`
  - Descripción: Retención IRPF en nómina actualizada a 2026. Salario bruto → neto mensual con desglose SS + IRPF.
  - Privacidad: ✅ 100% local | DisclaimerCard: `financial`
  - Complejidad: Media

### 🏥 Salud y Bienestar

- [ ] **Calculadora de tensión arterial** (`calculadora-tension-arterial`)
  - Suite: `salud` | Contextos: `casa`, `curiosidad`
  - Descripción: Interpreta valores de tensión sistólica/diastólica. Clasifica el resultado (normal, elevada, hipertensión I/II). Con recomendaciones generales.
  - Privacidad: ✅ 100% local | DisclaimerCard: `medical`
  - Complejidad: Baja

- [ ] **Planificador de chequeos médicos** (`planificador-chequeos-medicos`)
  - Suite: `salud`, `productividad` | Contextos: `casa`, `curiosidad`
  - Descripción: Chequeos y revisiones médicas recomendadas por edad y sexo en España (basado en calendarios del Ministerio de Sanidad). Lista personalizable.
  - Privacidad: ✅ 100% local | DisclaimerCard: `medical`
  - Complejidad: Media

### 🏘️ Inmobiliaria y Hogar

- [ ] **Calculadora de reformas del hogar** (`calculadora-reformas-hogar`)
  - Suite: `inmobiliaria` | Contextos: `casa`, `dinero`
  - Descripción: Presupuesto estimado de reformas por tipo (cocina, baño, pintura, suelos) y metros cuadrados. Precios de referencia España 2026.
  - Privacidad: ✅ 100% local | DisclaimerCard: `financial`
  - Complejidad: Media

---

## 🟣 PROFESIONALIZACIÓN DE APPS EXISTENTES

> Aplicar el patrón v2.0 de PROFESIONALIZACION.md (7 secciones: tabla comparativa, casos de uso, FAQ, guía paso a paso, tips, warning box, HTML exportable).
> **Estado actual**: 25 apps profesionalizadas de 231 (~11%). Metodología en [PROFESIONALIZACION.md](PROFESIONALIZACION.md).
> **No aplica a**: juegos, cursos, utilidades triviales (cronómetro, dado, espejo, nivel burbuja).

### 🔴 Candidatos prioritarios (mayor impacto)

- [ ] **calculadora-fire** — Planificación financiera a largo plazo, alta implicación económica, muy popular entre comunidad FIRE española.
  - Secciones clave: Tabla comparativa (FIRE vs inversión tradicional), Casos de uso (4 perfiles edad/capital), FAQ (¿cuánto necesito realmente?), Warning (errores de cálculo de inflación)
  - DisclaimerCard: `financial`

- [ ] **calculadora-seguro-vida** — Decisión financiera con implicaciones legales y familiares. Alta carga educativa necesaria.
  - Secciones clave: Tabla comparativa (temporal vs entera vs unit-linked), Casos de uso (joven sin hijos, familia con hipoteca, autónomo, jubilado), FAQ (8 preguntas sobre exclusiones y capitales), Warning (infraasegurarse)
  - DisclaimerCard: `financial`

- [ ] **comparador-tipos-seguros** — App con múltiples alternativas: perfecta para tabla comparativa. Alta utilidad para usuarios que no conocen los tipos.
  - Secciones clave: Tabla comparativa (vida/hogar/coche/salud/viaje × 6 criterios), Casos de uso, FAQ legal, Guía paso a paso (cómo elegir el seguro correcto)
  - DisclaimerCard: `financial`

- [ ] **generador-facturas** — Output exportable, uso profesional, alta recurrencia. Pendiente también: añadir campo retención IRPF (ver sección 🔵).
  - Secciones clave: HTML exportable, Tabla comparativa (factura con IVA / sin IVA / con retención), Casos de uso (autónomo, SL, internacional), FAQ fiscal, Warning (errores en facturación que generan sanciones)
  - DisclaimerCard: `financial`

- [ ] **calculadora-amortizacion-hipoteca** — Complemento natural del simulador-hipoteca (ya profesionalizado). Alta búsqueda en España.
  - Secciones clave: Tabla comparativa (amortizar cuota vs plazo), Casos de uso (3 perfiles según años restantes y capital), Guía paso a paso (cuándo y cómo amortizar), Warning (penalizaciones, 2% vs 0.15%)
  - DisclaimerCard: `financial`

### 🟡 Candidatos de media prioridad

- [ ] **calculadora-notas** — Top 5 analytics (22 usos). Usada por estudiantes. Añadir tabla comparativa sistemas de calificación, casos de uso (ESO, Bachiller, Universidad), FAQ (cómo calcular nota media ponderada).
  - *Añadido por analytics*: 2026-02-23

- [ ] **calculadora-deuda** — Método bola de nieve vs avalancha. Decisión con gran impacto en finanzas personales.

- [ ] **calculadora-fondo-emergencia** — Regla de las 3-6 nóminas. Educational value muy alto para usuarios con deudas.

- [ ] **calculadora-tir-van** — App técnica usada por estudiantes y profesionales. Tabla comparativa TIR vs VAN vs Payback muy útil.

- [ ] **simulador-compraventa-inmueble** — Gran decisión financiera, complemento de calculadora-coste-vivienda (ya profesionalizada).

- [ ] **calculadora-regla-50-30-20** — Regla de presupuesto personal. Alta búsqueda, fácil de enriquecer con casos de uso reales.

- [ ] **planificador-cashflow** — Herramienta para autónomos/empresas. Casos de uso: freelance, startup, pyme.

- [ ] **calculadora-break-even** — Herramienta de negocio con alto valor educativo para emprendedores.

- [ ] **generador-utm** — Output exportable, uso de marketing. HTML colapsable con ejemplos de implementación GA4.

- [ ] **analizador-densidad-seo** — Herramienta de contenido, casos de uso para bloggers/redactores/SEOs.

- [ ] **calculadora-electricidad** — Alta demanda en España por precio de la luz. Warning: errores de interpretación de la factura eléctrica.

### 🟢 Candidatos de baja prioridad (pero válidos)

- [ ] **calculadora-calorias-ejercicio** — Salud, casos de uso (pérdida peso, mantenimiento, ganancia muscular). DisclaimerCard: `medical`.
- [ ] **calculadora-colesterol** — Salud, interpretación de valores con tabla comparativa LDL/HDL/triglicéridos. DisclaimerCard: `medical`.
- [ ] **calculadora-estadistica** — Estudiantes, tabla comparativa de medidas de centralización vs dispersión.
- [ ] **generador-og-images** — Output exportable, casos de uso (blog, ecommerce, redes).
- [ ] **checklist-coberturas-seguros** — Guía paso a paso para revisar si estás bien cubierto.

---

## 🔵 MEJORAS DE APPS EXISTENTES

> Apps ya publicadas que pueden mejorar en calidad, contenido educativo o experiencia.

- [ ] **lista-equipaje**: Añadir categorías personalizables y modo "por días de viaje". Actualmente demasiado básica vs. el potencial de la suite viajes.

- [ ] **calculadora-jubilacion**: Revisar si los cálculos reflejan la reforma del sistema de pensiones 2024. Añadir DisclaimerCard `financial` si no la tiene.

- [ ] **simulador-hipoteca**: Comparativa fija vs variable vs mixta en un mismo visualizador. Actualmente solo simula un tipo.

- [ ] **generador-facturas**: Añadir soporte para IRPF en la factura (campo retención). Es la queja más común en apps de facturación para autónomos.

---

## ⚪ IDEAS FUTURAS

> Ideas que requieren más investigación o que son para fases posteriores.

- **Guía interactiva "Montar una SL en España"**: Journey completo con calculadoras integradas (costes, impuestos, pasos legales).
- **Simulador de cartera de ETFs con rebalanceo**: Más avanzado que el simulador actual. Requiere datos históricos embebidos.
- **Generador de plan de negocio básico**: Plantilla estructurada exportable a PDF/texto.
- **Juego de banderas del mundo**: Adivina el país por su bandera (SVG embebido, sin APIs).
- **Calculadora de huella hídrica**: Complemento a la calculadora de huella de carbono existente.
- **Comparador de operadoras de móvil en España**: Datos embebidos actualizados trimestralmente.

---

## ✅ COMPLETADAS (archivo histórico)

> Mover aquí cada tarea al finalizarla, con fecha de completado.

- [x] **CSP Enforcement** — Activado enforcement en `vercel.json` + `next.config.ts`. Dominios añadidos: cdn.jsdelivr.net, ipapi.co, api64.ipify.org, api.openweathermap.org, openstreetmap.org. *(2026-02-23)*
- [x] **Seguridad API analytics** — Endpoints `/api/analytics/stats` y `/api/analytics/ip-filter` protegidos con `x-api-key: ANALYTICS_SECRET`. *(2026-02-23)*
- [x] **Sanitización mensajes de error** — 7 API routes ya no exponen `error.message` interno. *(2026-02-23)*
- [x] **Validación inputs analytics** — Límites de longitud y rango en `track` y `duration`. *(2026-02-23)*
- [x] **Reemplazar xlsx por exceljs** — CVEs críticos de xlsx eliminados. `conversor-formatos` migrado a ExcelJS. *(2026-02-23)*
- [x] **Fix CVEs jsPDF** — 3 CVEs eliminados con `npm audit fix`. *(2026-02-23)*
- [x] **ai-index.json actualizado** — 27 apps añadidas a categorías. `total_tools: 231`. *(2026-02-23)*
- [x] **Dark mode corregido** — 8 CSS modules con fondos claros en estados error/danger: calculadora-suscripciones, conversor-horarios, informacion-tiempo, lista-compras, lista-tareas, notas, cifrado-transposicion, generador-contrasenas. *(2026-02-23)*

---

## 📋 INSTRUCCIONES PARA CLAUDE CODE

Al iniciar sesión, seguir este orden:
1. Leer este BACKLOG.md
2. Tomar la primera tarea disponible en 🔴 (si hay urgentes)
3. Si no hay urgentes, tomar la primera tarea en 🟡
4. Ejecutar el checklist completo de CLAUDE.md al crear apps
5. Marcar como completada moviendo la tarea a la sección ✅ con fecha
6. Actualizar el contador de apps totales en la cabecera de este fichero

**Criterio de prioridad**: 🔴 → 🟡 → 🟢 → 🔵
**No iniciar nueva tarea sin completar la anterior** (salvo que requiera sesión separada por alta complejidad).
