# BACKLOG.md - meskeIA Web

> **Última actualización**: 2026-03-01
> **Apps totales**: 250 | **Suites**: 12
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
| 🏘️ Inmobiliaria y Hogar | 24 | 🟡 Aceptable |
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
  - *Estado 2026-03-01*: `@types/node` 20→25 disponible (bajo riesgo). `eslint` 9→10 disponible (dev dep). Next.js/React al día.

- [x] **ai-index.json: texto desactualizado** — Corregido a 250 apps, suites actualizadas, fecha 2026-03-01. *(resuelto: 2026-03-01)*

- [x] **Dark mode (verificado)** — Los 25 CSS modules sin `[data-theme]` son falsos positivos: usan colores de marca o semánticos intencionales (juegos, espejo, hero). Resto de interfaz usa variables CSS de globals.css. Dark mode funciona correctamente en toda la plataforma. *(verificado: 2026-03-01)*

---

## 🟡 NUEVAS APPS — Alta Prioridad (cubrir gaps de suites)

> Suites con menos cobertura. Cada app nueva en estas suites tiene mayor impacto relativo.

### ✈️ Viajes y Turismo (15 apps — objetivo cubierto)

> ⚠️ `guia-visados-espana` **descartada**: políticas de visados cambian frecuentemente por motivos imprevistos (diplomacia, pandemias, reciprocidad). Inviable mantener actualizado sin riesgo de dar información errónea en un tema crítico para el viajero.

### 💼 Freelance y Autónomo (17 apps — reducir gap con mejoras en apps existentes)

> ⚠️ Apps fiscales con datos dinámicos **descartadas**:
> - `calculadora-cuota-autonomo` — Cuota SS por tramos se revisa anualmente (ya hubo 2 cambios en 2 años). Alta probabilidad de quedar desactualizada.
> - `comparador-asalariado-autonomo` — Cálculo depende de gastos deducibles individuales muy variables; simplificación excesiva con riesgo de malinterpretación.
> - `simulador-declaracion-trimestral` — Modelo 303+130, riesgo legal.
>
> **Estrategia**: Cubrir Freelance mediante mejoras en apps existentes (ver sección 🔵), no con nuevas apps fiscales dinámicas.

### 🎲 Juegos y Ocio (20 apps — objetivo: quizzes de universo acotado)

> ⚠️ `quiz-cultura-general` **descartado**: universo abierto (historia/ciencia/arte/deporte/geografía) es a la vez demasiado amplio para curar bien y demasiado pequeño para ser representativo. El modelo correcto es universo cerrado y verificable (como `quiz-paises-capitales`).
>
> **Candidatos válidos para próximas sesiones**: quiz de símbolos químicos, quiz de tablas de multiplicar, quiz de presidentes/reyes de España, quiz de capitales europeas.

---

## 🟢 NUEVAS APPS — Media Prioridad

> Suites mejor cubiertas pero con oportunidades relevantes para usuarios españoles.

### 📈 Finanzas

> ⚠️ Apps fiscales con datos dinámicos **descartadas**:
> - `simulador-pension-publica` — La Seguridad Social ya ofrece simulador oficial con datos reales de cotización del usuario (Mi SS). Nuestra estimación genérica no puede competir y tiene alto riesgo de desactualización con cada reforma del sistema.
> - `calculadora-irpf-nomina` — Tablas de retención IRPF se actualizan con cada Presupuestos Generales. La AEAT tiene su propio simulador oficial. Sin ventaja diferencial.

### 🏘️ Inmobiliaria y Hogar

> ✅ `calculadora-reformas-hogar` **implementada** — ver sección ✅

---

## 🟣 PROFESIONALIZACIÓN DE APPS EXISTENTES

> Aplicar el patrón v2.0: tabla comparativa, casos de uso, FAQ, guía paso a paso, tips, warning box.
> **Estado actual**: 153 apps profesionalizadas de 250 (61%). *(actualizado 2026-03-01)*
> **No aplica a**: juegos, cursos, utilidades triviales (cronómetro, dado, espejo, nivel burbuja).

### 🟡 Pendientes confirmados (genuinamente sin EducationalSection)

- [x] **generador-utm** — Tabla comparativa 5 parámetros, 4 casos de uso (Google Ads/Email/Instagram/Black Friday), FAQ 5 preguntas, guía 6 pasos, tips + errores comunes. *(2026-03-01)*
- [x] **checklist-coberturas-seguros** — Tabla comparativa 8 tipos de seguros, 4 casos de uso (freelance/familia/hipoteca/jubilación), FAQ 5 preguntas, guía 6 pasos, tips + errores. DisclaimerCard corregida (collapsible: false). *(2026-03-01)*

### 🟡 Nuevos candidatos detectados en barrido (sin EducationalSection)

> Apps reales con potencial educativo que no están en el patrón v2.0 aún.

- [ ] **calculadora-alquiler-vs-compra** — Decisión financiera de alto impacto. Tabla comparativa escenarios, casos de uso, FAQ. DisclaimerCard financial.
- [ ] **calculadora-suscripciones** — Conciencia financiera. Tabla comparativa costes anuales vs mensuales, tips de auditoría de suscripciones.
- [ ] **generador-contrasenas** — Educación en seguridad: entropía, ataques de diccionario, gestores de contraseñas. FAQ.
- [ ] **validador-regex** — Referencia técnica: tabla comparativa sintaxis regex (JS/Python/PCRE), casos de uso, errores comunes.
- [ ] **calculadora-mcd-mcm** — Herramienta académica (ESO/Bachillerato): visualización algoritmo de Euclides, casos de uso, FAQ.
- [ ] **paises-del-mundo** — Referencia geográfica: datos comparativos por región, casos de uso (viajes/estudios/trabajo).
- [ ] **seguimiento-habitos** — Ciencia del hábito: bucle hábito (señal/rutina/recompensa), casos de uso, FAQ formación de hábitos.
- [ ] **planificador-menu** — Nutrición práctica: tabla comparativa grupos alimentarios, casos de uso, FAQ planificación semanal.

### ✅ Verificadas como ya profesionalizadas (barrido 2026-03-01)

> Estaban marcadas como pendientes pero ya tenían EducationalSection implementada.

- [x] **tabla-periodica** — Historia, comparativa metales/no metales, casos de uso ESO/Bachillerato/Universidad, FAQ, guía estequiometría, tips. 1.020 líneas.
- [x] **creador-paletas** — Comparativa armonías, casos de uso profesionales, FAQ, tips, errores. 733 líneas.
- [x] **calculadora-coste-vivienda** — DisclaimerCard financial, EducationalSection, FAQ avanzado. 827 líneas.
- [x] **calculadora-fondo-emergencia** — ✅ ya implementada.
- [x] **calculadora-tir-van** — ✅ ya implementada.
- [x] **simulador-compraventa-inmueble** — ✅ ya implementada.
- [x] **calculadora-regla-50-30-20** — ✅ ya implementada.
- [x] **planificador-cashflow** — ✅ ya implementada.
- [x] **calculadora-break-even** — ✅ ya implementada.
- [x] **analizador-densidad-seo** — ✅ ya implementada.
- [x] **calculadora-electricidad** — ✅ ya implementada.
- [x] **calculadora-calorias-ejercicio** — ✅ ya implementada.
- [x] **calculadora-colesterol** — ✅ ya implementada.
- [x] **calculadora-estadistica** — ✅ ya implementada.
- [x] **generador-og-images** — ✅ ya implementada.

---

## 🔵 MEJORAS DE APPS EXISTENTES

> Apps ya publicadas que pueden mejorar en calidad, contenido educativo o experiencia.

- [ ] **lista-equipaje**: Añadir modo "por días de viaje" (vista alternativa agrupada por día). *(categorías personalizables ya implementadas — 2026-02-24)*

- [ ] **calculadora-jubilacion**: Revisar si los cálculos reflejan la reforma del sistema de pensiones 2024. Añadir DisclaimerCard `financial` si no la tiene.

- [ ] **simulador-hipoteca**: Comparativa fija vs variable vs mixta en un mismo visualizador. Actualmente solo simula un tipo.

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

### Apps descartadas (con justificación)
- [x] **guia-visados-espana** — Descartada: políticas de visados cambian con frecuencia imprevisible (diplomacia, pandemias). Inviable mantener datos fiables. *(2026-02-25)*
- [x] **calculadora-cuota-autonomo** — Descartada: cuota SS por tramos revisada anualmente. Alta probabilidad de quedarse desactualizada con riesgo real para el usuario. *(2026-02-25)*
- [x] **comparador-asalariado-autonomo** — Descartada: depende de gastos deducibles individuales muy variables; simplificación con riesgo de malinterpretación. *(2026-02-25)*
- [x] **calculadora-retencion-irpf** — Descartada como app independiente (demasiado trivial). Lógica integrada en profesionalización de `generador-facturas`. *(2026-02-25)*
- [x] **quiz-cultura-general** — Descartado: universo abierto inabarcable. Modelo correcto = quizzes de universo acotado (como `quiz-paises-capitales`). *(2026-02-25)*
- [x] **simulador-pension-publica** — Descartado: la SS tiene simulador oficial con datos reales del usuario (Mi SS). Sin ventaja diferencial. *(2026-02-25)*
- [x] **calculadora-irpf-nomina** — Descartado: tablas IRPF se actualizan con PGE. AEAT tiene simulador oficial. Sin ventaja diferencial. *(2026-02-25)*
- [x] **calculadora-reformas-hogar** — Presupuesto estimado por tipo de reforma (10 partidas) y nivel de calidad (básica/estándar/premium). Precios referencia España 2026. DisclaimerCard financial. *(2026-02-25)*

### Mantenimiento y correcciones
- [x] **DisclaimerCard medical — exoneración responsabilidad** — Añadida cláusula explícita en `DefaultContent` (10 apps) y en `calculadora-estadistica-medica`, `calculadora-sueno`, `calculadora-medicamentos-mascotas`. *(2026-02-24)*

### Profesionalizaciones
- [x] **calculadora-fire** — Tabla comparativa 5 variantes FIRE, 4 casos de uso, FAQ 5 preguntas. *(2026-02-23)*
- [x] **calculadora-amortizacion-hipoteca** — Tabla cuota vs plazo, 4 casos de uso, FAQ 5 preguntas (comisiones Ley 5/2019, IRPF, sistema francés). *(2026-02-23)*
- [x] **calculadora-notas** — Tabla comparativa sistemas calificación, 4 casos de uso (ESO/EvAU/ECTS/Erasmus), FAQ 5 preguntas. *(2026-02-23)*
- [x] **calculadora-seguro-vida** — Tabla comparativa (temporal/entera/unit-linked/PIAS), 4 casos de uso (joven/familia/autónomo/jubilado), warning infraasegurarse. DisclaimerCard corregida (no collapsible). *(2026-02-25)*
- [x] **comparador-tipos-seguros** — Guía paso a paso 6 pasos, FAQ legal 6 preguntas. DisclaimerCard variant financial corregida. *(2026-02-25)*
- [x] **generador-facturas** — Tabla comparativa 5 tipos de factura, 4 casos de uso (autónomo/SL/UE/minorista), FAQ fiscal 6 preguntas, warning sanciones LGT. DisclaimerCard sin collapsible. *(2026-02-25)*
- [x] **calculadora-deuda** — Tabla comparativa (Bola de Nieve/Avalancha/Solo Mínimos × 5 criterios), 4 casos de uso, FAQ 6 preguntas (pago mínimo/hipoteca/consolidar/mora), warning ejemplo 5.000€ al 20% TAE. Fix collapsible + type="button". *(2026-02-25)*

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
