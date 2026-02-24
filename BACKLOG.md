# BACKLOG.md - meskeIA Web

> **Última actualización**: 2026-02-24
> **Apps totales**: 242 | **Suites**: 12
> **Uso**: Claude Code lee este fichero al inicio de cada sesión y trabaja la siguiente tarea disponible.

---

## 📊 Estado de Suites (referencia rápida)

| Suite | Apps | Estado |
|-------|------|--------|
| 🧮 Estudiantes | 49 | ✅ Bien cubierta |
| 📚 Cultura General | 44 | ✅ Bien cubierta |
| ⚡ Productividad | 39 | ✅ Bien cubierta |
| 📈 Finanzas | 35 | ✅ Bien cubierta |
| 🔧 Herramientas Técnicas | 32 | ✅ Bien cubierta |
| 🎨 Diseño y Desarrollo | 28 | 🟡 Aceptable |
| 🏥 Salud y Bienestar | 28 | 🟡 Aceptable |
| 📢 Marketing y Contenido | 25 | 🟡 Aceptable |
| 🏘️ Inmobiliaria y Hogar | 23 | 🟡 Aceptable |
| 🎲 Juegos y Ocio | 20 | 🟡 Aceptable |
| ✈️ Viajes y Turismo | 15 | 🟡 Aceptable (era GAP) |
| 💼 Freelance y Autónomo | 17 | 🔴 GAP |

**Valor diferencial meskeIA**: Gratuito · Sin registro · 100% local en el PC · Total confidencialidad

---

## 🔴 URGENTE — Mantenimiento Técnico

> Tareas técnicas que afectan la calidad y seguridad de toda la plataforma.

- [ ] **Actualizar dependencias (Fase 6)**: `npm outdated` → evaluar actualizaciones. Priorizar: Next.js, React, Chart.js. Sesión dedicada por alto riesgo de breaking changes.
  - *Impacto*: Rendimiento, seguridad, compatibilidad futura
  - *Complejidad*: Alta (sesión separada, con build verification)

---

## 🟡 NUEVAS APPS — Alta Prioridad (cubrir gaps de suites)

> Suites con menos cobertura. Cada app nueva en estas suites tiene mayor impacto relativo.

### ✈️ Viajes y Turismo (15 apps — mejorado, objetivo: +2 apps más)

- [ ] **Guía de visados desde España** (`guia-visados-espana`)
  - Suite: `viajes`, `cultura` | Contextos: `relax`, `curiosidad`
  - Descripción: Base de datos local de requisitos de visado para ciudadanos españoles por país de destino. Sin API externa.
  - Privacidad: ✅ 100% local (datos embebidos)
  - Complejidad: Media (requiere investigar y embeber datos)

### 💼 Freelance y Autónomo (17 apps — GAP, objetivo: +4 apps)

- [ ] **Calculadora cuota autónomo 2026** (`calculadora-cuota-autonomo`)
  - Suite: `freelance`, `finanzas` | Contextos: `trabajo`, `dinero`
  - Descripción: Nueva tarifa plana por tramos de rendimiento neto. Cuota mensual según ingresos esperados, con simulación anual.
  - Privacidad: ✅ 100% local
  - Complejidad: Media (fórmulas SS 2024+)

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

> ⚠️ **Nota**: `simulador-declaracion-trimestral` (Modelo 303+130) descartado por riesgo de responsabilidad legal en cálculos fiscales complejos.

### 🎲 Juegos y Ocio (20 apps — objetivo: +2 apps más)

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

### 🏘️ Inmobiliaria y Hogar

- [ ] **Calculadora de reformas del hogar** (`calculadora-reformas-hogar`)
  - Suite: `inmobiliaria` | Contextos: `casa`, `dinero`
  - Descripción: Presupuesto estimado de reformas por tipo (cocina, baño, pintura, suelos) y metros cuadrados. Precios de referencia España 2026.
  - Privacidad: ✅ 100% local | DisclaimerCard: `financial`
  - Complejidad: Media

---

## 🟣 PROFESIONALIZACIÓN DE APPS EXISTENTES

> Aplicar el patrón v2.0: tabla comparativa, casos de uso, FAQ, guía paso a paso, tips, warning box.
> **Estado actual**: 28 apps profesionalizadas de 242 (~12%).
> **No aplica a**: juegos, cursos, utilidades triviales (cronómetro, dado, espejo, nivel burbuja).

### 🔴 Candidatos prioritarios (mayor impacto)

- [ ] **calculadora-seguro-vida** — Decisión financiera con implicaciones legales y familiares.
  - Secciones clave: Tabla comparativa (temporal vs entera vs unit-linked), Casos de uso (joven sin hijos, familia con hipoteca, autónomo, jubilado), FAQ (8 preguntas sobre exclusiones y capitales), Warning (infraasegurarse)
  - DisclaimerCard: `financial`

- [ ] **comparador-tipos-seguros** — App con múltiples alternativas: perfecta para tabla comparativa.
  - Secciones clave: Tabla comparativa (vida/hogar/coche/salud/viaje × 6 criterios), Casos de uso, FAQ legal, Guía paso a paso (cómo elegir el seguro correcto)
  - DisclaimerCard: `financial`

- [ ] **generador-facturas** — Output exportable, uso profesional, alta recurrencia. Pendiente también: añadir campo retención IRPF.
  - Secciones clave: HTML exportable, Tabla comparativa (factura con IVA / sin IVA / con retención), Casos de uso (autónomo, SL, internacional), FAQ fiscal, Warning (errores en facturación que generan sanciones)
  - DisclaimerCard: `financial`

### 🟡 Candidatos de media prioridad

- [ ] **calculadora-deuda** — Método bola de nieve vs avalancha. Decisión con gran impacto en finanzas personales.
- [ ] **calculadora-fondo-emergencia** — Regla de las 3-6 nóminas. Educational value muy alto para usuarios con deudas.
- [ ] **calculadora-tir-van** — App técnica usada por estudiantes y profesionales. Tabla comparativa TIR vs VAN vs Payback.
- [ ] **simulador-compraventa-inmueble** — Gran decisión financiera, complemento de calculadora-coste-vivienda (ya profesionalizada).
- [ ] **calculadora-regla-50-30-20** — Alta búsqueda, fácil de enriquecer con casos de uso reales.
- [ ] **planificador-cashflow** — Herramienta para autónomos/empresas. Casos de uso: freelance, startup, pyme.
- [ ] **calculadora-break-even** — Herramienta de negocio con alto valor educativo para emprendedores.
- [ ] **generador-utm** — Output exportable. HTML colapsable con ejemplos de implementación GA4.
- [ ] **analizador-densidad-seo** — Herramienta de contenido, casos de uso para bloggers/redactores/SEOs.
- [ ] **calculadora-electricidad** — Alta demanda en España por precio de la luz.

### 🟢 Candidatos de baja prioridad (pero válidos)

- [ ] **calculadora-calorias-ejercicio** — DisclaimerCard: `medical`.
- [ ] **calculadora-colesterol** — Tabla comparativa LDL/HDL/triglicéridos. DisclaimerCard: `medical`.
- [ ] **calculadora-estadistica** — Tabla comparativa medidas centralización vs dispersión.
- [ ] **generador-og-images** — Output exportable, casos de uso (blog, ecommerce, redes).
- [ ] **checklist-coberturas-seguros** — Guía paso a paso para revisar si estás bien cubierto.

---

## 🔵 MEJORAS DE APPS EXISTENTES

> Apps ya publicadas que pueden mejorar en calidad, contenido educativo o experiencia.

- [ ] **lista-equipaje**: Añadir modo "por días de viaje" (vista alternativa agrupada por día). *(categorías personalizables ya implementadas — 2026-02-24)*

- [ ] **calculadora-jubilacion**: Revisar si los cálculos reflejan la reforma del sistema de pensiones 2024. Añadir DisclaimerCard `financial` si no la tiene.

- [ ] **simulador-hipoteca**: Comparativa fija vs variable vs mixta en un mismo visualizador. Actualmente solo simula un tipo.

- [ ] **generador-facturas**: Añadir soporte para IRPF en la factura (campo retención). Es la queja más común en apps de facturación para autónomos.

- [ ] **DisclaimerCard medical (Grupo B)**: Revisar las 8 apps con children custom de baja prioridad (`test-habitos-saludables`, `curso-nutrisalud`, `calculadora-porciones`, `calculadora-edad-mascotas`, `calculadora-tamano-adulto-perro`, `planificador-mascota`, `guia-cuidado-mascota`, `guia/vivir-sano`) para añadir cláusula de exoneración si se considera necesario.

---

## ⚪ IDEAS FUTURAS

> Ideas que requieren más investigación o que son para fases posteriores.

- **Guía interactiva "Montar una SL en España"**: Journey completo con calculadoras integradas (costes, impuestos, pasos legales).
- **Simulador de cartera de ETFs con rebalanceo**: Más avanzado que el simulador actual. Requiere datos históricos embebidos.
- **Generador de plan de negocio básico**: Plantilla estructurada exportable a PDF/texto.
- **Calculadora de huella hídrica**: Complemento a la calculadora de huella de carbono existente.
- **Comparador de operadoras de móvil en España**: Datos embebidos actualizados trimestralmente.

---

## ✅ COMPLETADAS (archivo histórico)

> Historial de tareas finalizadas con fecha de completado.

### Apps nuevas
- [x] **planificador-itinerario** — Organiza días, actividades, horarios y notas de viaje. Exporta a .txt. 100% local. *(2026-02-24)*
- [x] **calculadora-tension-arterial** — Clasificación ESH/ESC 2018 (9 categorías), TAM, presión de pulso, historial localStorage. *(2026-02-24)*
- [x] **planificador-chequeos-medicos** — Checklist 16 revisiones preventivas filtrado por grupo de edad y sexo. Fuente: Ministerio de Sanidad y SEMFyC. *(2026-02-24)*
- [x] **guia-seguro-viaje** — Coberturas recomendadas por destino (Europa/mundo/riesgo) y tipo de viaje. Checklist 12 puntos pre-contratación. *(nota: `calculadora-seguro-viaje` descartada por inviabilidad de estimación de costes — implementada como guía)* *(2026-02-24)*
- [x] **simulador-jet-lag** — Jet lag por diferencia horaria, 35 ciudades, 5 niveles de impacto, recomendaciones por dirección. *(2026-02-23)*
- [x] **quiz-paises-capitales** — Quiz geografía 195 países, 3 modos (capital/país/bandera), 5 dificultades. *(2026-02-23)*
- [x] **checklist-documentos-viaje** — Checklist documentos por tipo destino (España/Europa/Internacional). *(2026-02-23)*
- [x] **juego-ahorcado** — Ahorcado en español, 4 categorías × 30 palabras, SVG progresivo, stats localStorage. *(2026-02-23)*

### Mejoras apps existentes
- [x] **lista-equipaje** — Categorías personalizables: eliminar items (✕), añadir a categoría existente, nueva categoría personalizada, persistencia localStorage. *(2026-02-24)*

### Mantenimiento y correcciones
- [x] **DisclaimerCard medical — exoneración responsabilidad** — Añadida cláusula explícita en `DefaultContent` (10 apps) y en `calculadora-estadistica-medica`, `calculadora-sueno`, `calculadora-medicamentos-mascotas`. *(2026-02-24)*

### Profesionalizaciones
- [x] **calculadora-fire** — Tabla comparativa 5 variantes FIRE, 4 casos de uso, FAQ 5 preguntas. *(2026-02-23)*
- [x] **calculadora-amortizacion-hipoteca** — Tabla cuota vs plazo, 4 casos de uso, FAQ 5 preguntas (comisiones Ley 5/2019, IRPF, sistema francés). *(2026-02-23)*
- [x] **calculadora-notas** — Tabla comparativa sistemas calificación, 4 casos de uso (ESO/EvAU/ECTS/Erasmus), FAQ 5 preguntas. *(2026-02-23)*

### Mantenimiento técnico
- [x] **CSP Enforcement** — Activado enforcement en `vercel.json` + `next.config.ts`. *(2026-02-23)*
- [x] **Seguridad API analytics** — Endpoints protegidos con `x-api-key: ANALYTICS_SECRET`. *(2026-02-23)*
- [x] **Sanitización errores API** — 7 API routes ya no exponen `error.message` interno. *(2026-02-23)*
- [x] **Validación inputs analytics** — Límites de longitud y rango en `track` y `duration`. *(2026-02-23)*
- [x] **Reemplazar xlsx por exceljs** — CVEs críticos eliminados en `conversor-formatos`. *(2026-02-23)*
- [x] **Fix CVEs jsPDF** — 3 CVEs eliminados con `npm audit fix`. *(2026-02-23)*
- [x] **ai-index.json auditado** — 27 apps añadidas. `total_tools` corregido y actualizado a 238. *(2026-02-23)*
- [x] **Dark mode corregido** — 8 CSS modules con fondos claros en estados error/danger corregidos. *(2026-02-23)*

---

## 📋 INSTRUCCIONES PARA CLAUDE CODE

Al iniciar sesión, seguir este orden:
1. Leer este BACKLOG.md
2. Tomar la primera tarea disponible en 🔴 (si hay urgentes)
3. Si no hay urgentes, tomar la primera tarea en 🟡
4. Ejecutar el checklist completo de CLAUDE.md al crear apps
5. Marcar como completada añadiéndola a la sección ✅ con fecha
6. Actualizar el contador de apps totales en la cabecera de este fichero

**Criterio de prioridad**: 🔴 → 🟡 → 🟢 → 🔵
**No iniciar nueva tarea sin completar la anterior** (salvo que requiera sesión separada por alta complejidad).
