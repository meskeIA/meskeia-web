# Reposicionamiento meskeIA — Documento de Seguimiento

> **Fuente de verdad** del proyecto de revisión estratégica iniciado el 2026-05-05.
> Aquí se registra: contexto, decisiones tomadas, qué se ha implementado y qué queda por hacer.
> Actualizar este documento al final de cada sesión que toque el tema.

**Última actualización:** 2026-05-06

---

## 1. Contexto inicial

A 9 meses del arranque (con 1 mes de mantenimiento por disclaimers), 3 meses reales de operativa continua, **816 apps en producción** y crecimiento orgánico sin difusión activa (~100 visitas/día), se identificó la necesidad de hacer una revisión global del proyecto:

- ¿Qué hemos hecho bien?
- ¿Qué tenemos pendiente?
- ¿Hacia dónde dirigirnos en el futuro?

El proyecto había crecido por acumulación de tipologías (calculadoras → simuladores → herramientas → cursos → guías journey → guías directorio → historias → juegos…) y el catálogo se había vuelto inabarcable mentalmente.

---

## 2. Hallazgos de la auditoría con datos reales (2026-05-05)

### 2.1 Muestra analizada

- **Periodo**: 01/02/2026 → 05/05/2026 (3 meses)
- **3.175 eventos**, **2.959 sesiones**, **1.237 IPs únicas**
- **505 de 824 apps** han recibido al menos 1 visita (61,3% del catálogo descubierto)
- Crecimiento mensual sostenido: feb 484 → mar 1.052 → abr 1.066 eventos

### 2.2 Concentración del tráfico (Pareto)

| Cuartil | Apps que lo acumulan |
|---------|----------------------|
| 50% del tráfico | **21 apps** |
| 80% del tráfico | **133 apps** |
| 95% del tráfico | **347 apps** |

### 2.3 Top apps (lo que la gente realmente usa)

1. `tabla-periodica` (341 visitas, 38m de duración media) — Estudiantes
2. `test-perfil-inversor` (292 visitas, 8m duración, 63% recurrentes) — Finanzas
3. `simulador-genetica` (137 visitas, 91m duración) — Bachillerato/Universidad
4. `conversor-braille` (101) — Accesibilidad
5. `simulador-puertas-logicas` (90) — Universidad/FP
6. `generador-anagramas` (87) — Curiosidad
7. `calculadora-notas` (70) — Estudiantes
8. `meskeIA` (home, 58)
9. `juego-memoria` (54)
10. `estimador-compraventa-inmueble` (48)

→ **8 de 12 son educativas o de finanzas personales.**

### 2.4 Hallazgo crítico: la inversión está invertida

| Tipo | Apps | Engagement |
|------|------|-----------|
| **Simuladores** | 16 | 43m duración, 41% recurrentes |
| **Tests** | 18 | 8m duración, **63% recurrentes** |
| **Cursos** | 11 | 3m 51s, 42% recurrentes |
| **Visualizadores** | 113 | **55s** duración, **18%** recurrentes |

→ Tienes **7× más visualizadores que simuladores**, pero los simuladores generan **20× más minutos de uso por app**.

### 2.5 Problema de descubrimiento (el más grave)

- **98,9% de sesiones = 1 sola app por sesión**
- La gente entra desde Google a UNA app y se va
- No hay puente interno que les lleve a otras apps

→ Resolverlo puede multiplicar el tráfico **sin crear ni una app más**.

### 2.6 Geografía

- España: 35% (348 IPs) — la web está localizada solo para España
- Latam: 23% (MX 242, CO 104, AR 103, BO 82, EC 45, PE 38, CL 32, CR 51…)
- USA: 25% (gran parte hispanohablante)

→ **Casi la mitad del tráfico no es España**, pero la web no lo está sirviendo conscientemente (todo en clave fiscal/normativa española).

---

## 3. Reposicionamiento confirmado

**Identidad estratégica adoptada el 2026-05-06:**

> **meskeIA es una herramienta de estudio + finanzas personales, con apertura a la curiosidad.**

Inspirada en la filosofía de la página *Acerca de*: "el conocimiento debe ser un bien compartido y gratuito".

### Implicaciones

1. **Público real**: estudiantes (ESO/Bach/Universidad/FP) + adultos activos en finanzas personales
2. **Público hispanohablante completo**: España + Latam (no solo España)
3. **Eje de curiosidad/ocio**: minoritario pero útil como escaparate
4. **No somos**: toolbox de productividad, suite de marketing, suite de diseño (estos crecieron por acumulación, no por estrategia)

### Implicación práctica para apps nuevas

- Apps **no fiscales-España**: usar términos universales ("impuesto sobre la renta" no "IRPF"), formato decimal flexible, evitar referencias culturales solo de España
- Apps **fiscales-España**: claras como tales, no aparentar universalidad

---

## 4. Plan de mejora del descubrimiento interno

### Objetivo único

**Subir la métrica "apps por sesión" de 1,07 actual a 2,0+** sin crear apps nuevas.

### Por qué es la prioridad

- Mayor ROI conocido (impacto alto, esfuerzo bajo)
- Resuelve el problema raíz identificado en datos
- No requiere decidir "qué borrar" (que era prematuro a 3 meses)

### Plan en 4 fases progresivas

| Fase | Qué se hace | Riesgo | Estado |
|------|------------|--------|--------|
| **0** | Tracking de origen de clics | 🟢 Cero | 🚧 EN CURSO (2026-05-06) |
| **1** | Componente `ContinuaCon` con datos dinámicos | 🟢 Bajo | ⏳ Pendiente |
| **2** | Home con tracción real (top semanal, caminos) | 🟡 Bajo | ⏳ Pendiente |
| **3** | Decisión sobre `app-relations.ts` (4.680 líneas curadas) | A decidir | ⏳ Pendiente (depende de FASE 0) |

### Detalle de FASE 0 — Tracking

**Objetivo**: medir el CTR real de RelatedApps y los pares "viene de → va a", para tener base empírica antes de cualquier rediseño.

**Cambios técnicos**:

1. `RelatedApps.tsx`: añadir `?from=related-{slug-origen}` a cada `href` (usando `usePathname` de Next.js, sin tocar las 724 apps que lo usan).
2. `AnalyticsTracker.tsx`: leer parámetro `?from` y guardarlo en `datos_adicionales.from`.
3. (Posterior) Nueva pestaña "Navegación" en `dashboard-analytics` con:
   - CTR de RelatedApps por app
   - Top pares "from → to"
   - Apps con RelatedApps muerto (CTR <1%)
   - Evolución semanal de "apps por sesión"
   - Origen de visitas (orgánico / interno / share / X / mcp)

**Privacidad**: no rompe la filosofía RGPD-sin-cookies actual. No añade cookies, ni datos personales, ni identifica al usuario. Solo metadato de navegación dentro de `datos_adicionales` (campo que ya existía). No requiere actualizar `/privacidad` ni `/terminos`.

**Plan de medición**:
- 1 semana acumulando datos tras desplegar
- Revisión conjunta antes de pasar a FASE 1

---

## 5. Decisiones tomadas (registro)

| Fecha | Decisión | Motivo |
|-------|----------|--------|
| 2026-05-05 | NO eliminar apps con baja visita | A 3 meses de tracking sin difusión activa, "0 visitas" significa "no descubierta" no "inútil" |
| 2026-05-06 | Adoptar reposicionamiento "estudio + finanzas personales + curiosidad" | Confirmado por datos analíticos y por filosofía de la página *Acerca de* |
| 2026-05-06 | Servir a Latam además de España | 23% del tráfico Latam directo + 25% USA hispanohablante |
| 2026-05-06 | NO tocar visualizadores | Generan SEO long-tail útil. No añadir más, pero no eliminar |
| 2026-05-06 | NO crear apps nuevas hasta resolver descubrimiento interno | Mayor ROI esperado: subir apps/sesión es la palanca |
| 2026-05-06 | Empezar por FASE 0 (tracking) | Sin datos de CTR cualquier rediseño es ideología |

---

## 6. Decisiones a tomar más adelante

- **Latam — alcance**: ¿solo apps no-fiscales? ¿o pivote a algunas adaptadas? (decidir tras FASE 2)
- **Suites infrautilizadas** (Marketing 31 apps, Diseño 30 apps): ¿fusionar en "Técnicas"? ¿mantener? (decidir cuando haya datos de uso por suite)
- **app-relations.ts** (4.680 líneas curadas a mano): mantener / simplificar / sustituir por dinámico (decidir tras FASE 0)
- **Apps fiscales-España**: ¿señalizar visualmente que son solo para España? (mejora UX-Latam)
- **Doblar apuesta en simuladores y tests**: roadmap específico cuando descubrimiento esté resuelto

---

## 7. Bitácora de avances

### 2026-05-05
- Auditoría inicial del catálogo (816 apps, 11→15 suites, 25+ tipologías)
- Diagnóstico estratégico inicial: crisis de identidad, inflación de tipologías, BACKLOG táctico

### 2026-05-06
- Auditoría con datos reales de Turso (3 meses de tracking)
- Identificación de Pareto extremo: 21 apps = 50% del tráfico
- Hallazgo de inversión invertida (visualizadores vs simuladores)
- Confirmación del reposicionamiento por parte del usuario
- Creación de este documento de seguimiento
- **FASE 0 en curso**: implementación del tracking de origen de clics

---

## 8. Métricas a seguir

| Métrica | Valor actual (2026-05-05) | Objetivo |
|---------|--------------------------|----------|
| Apps por sesión | 1,07 | 2,0+ |
| % catálogo descubierto | 61,3% | 80%+ |
| Recurrencia global | 28,5% | 40%+ |
| CTR RelatedApps | (sin datos) | medir y luego optimizar |

---

## 9. Documentos relacionados

- `BACKLOG.md` — Tareas tácticas (cola corta)
- `CHANGELOG.md` — Historial técnico
- `DISCLAIMER-POLICY.md` — Política legal de las apps
- `data/applications.ts` — Catálogo
- `app/dashboard-analytics/page.tsx` — Dashboard de analytics

---

**Próximo paso al retomar:** verificar datos de tracking acumulados desde el despliegue de FASE 0 y decidir parámetros de FASE 1.
