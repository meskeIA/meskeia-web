# NUEVASAPPSPARAMCP.md — Nueva línea estratégica de apps

**Fecha de origen**: 2026-05-19  
**Contexto**: Sesión de revisión MCP + ChatGPT GPTs. Tras completar el 10º GPT (Fotografía Técnica), se identificó una nueva línea de desarrollo.

---

## El criterio estratégico

Hasta ahora las apps de meskeIA eran principalmente **calculadoras fiscales/financieras de España** (IRPF, hipotecas, autónomos...). El 10º GPT de Fotografía Técnica demostró que existe otro tipo de app igualmente valioso:

> **Las IAs fallan cuando la respuesta correcta depende de varios parámetros personales simultáneos + una fórmula técnica precisa.**

ChatGPT y similares:
- ✅ Responden bien preguntas informativas o educativas
- ✅ Conocen historia, ciencia, cultura
- ❌ Aproximan mal cálculos técnicos con múltiples inputs del usuario
- ❌ Confunden fórmulas específicas (NPF vs regla 500, Riegel vs otras)
- ❌ No guardan contexto de los parámetros del usuario (sensor, focal, FTP...)

### Por qué Fotografía fue el caso piloto perfecto

- Fórmula NPF: `(35·N + 30·p) / (f · cos δ)` — ChatGPT la aproxima o usa la regla 500 directamente
- Profundidad de campo: confunde el CoC según sensor, da resultados genéricos
- Universal: no depende de legislación de ningún país
- Audiencia hispanohablante activa (fotógrafos España + LATAM)

### Filtro para nuevas apps de esta línea

```
¿La respuesta depende de ≥3 parámetros personales?
¿Hay una fórmula técnica específica que el chat suele ignorar o equivocar?
¿Es aplicable en España Y en LATAM (sin datos normativos de un solo país)?
¿Tiene audiencia real con necesidad de precisión?
→ SÍ a las 4 → candidata fuerte
```

---

## Categorías identificadas (sesión 2026-05-19)

---

### 1. Deporte y Rendimiento Físico ⭐⭐⭐⭐ PRIORIDAD ALTA

**Por qué las IAs fallan**: confunden fórmulas (Riegel vs Cameron), no aplican restricciones fisiológicas, dan zonas cardíacas sin preguntar edad ni FCreposo.

**Apps candidatas**:

| App | Fórmula clave | Inputs |
|-----|--------------|--------|
| `predictor-tiempos-running` | Riegel: T2 = T1 × (D2/D1)^1.06 | tiempo 5K/10K, distancia objetivo |
| `calculadora-zonas-cardiacas` | Karvonen: FCobj = FCreposo + % × (FCmax - FCreposo) | edad, FCreposo, % zona |
| `calculadora-1rm-gimnasio` | Epley: 1RM = peso × (1 + reps/30) | peso levantado, repeticiones |
| `calculadora-potencia-ciclismo` | W/kg, VAM: VAM = desnivel(m) / tiempo(min) × 100 | peso, FTP, desnivel, tiempo |
| `calculadora-pace-running` | Conversiones pace/velocidad + splits | distancia, tiempo objetivo |
| `calculadora-swolf-natacion` | SWOLF = segundos/largo + brazadas/largo | tiempo, brazadas |

**GPT asociado posible**: `meskeIA — Deporte y Rendimiento`

---

### 2. Videografía ⭐⭐⭐⭐ PRIORIDAD ALTA

**Por qué las IAs fallan**: confunden la regla de los 180°, calculan mal el slow motion, no saben qué filtro ND usar según las condiciones.

**Audiencia**: extensión natural del GPT de Fotografía Técnica (mismo público).

**Apps candidatas**:

| App | Fórmula clave | Inputs |
|-----|--------------|--------|
| `calculadora-regla-180-video` | Obturador = 1 / (2 × fps) | frame rate de grabación |
| `calculadora-camara-lenta` | % slow = fps_grabacion / fps_reproduccion × 100 | fps nativo, fps reproducción |
| `calculadora-filtro-nd-video` | Pasos ND = log2(T_actual / T_objetivo) | obturador actual, objetivo |
| `calculadora-bitrate-video` | Estimación tamaño archivo | resolución, codec, duración |
| `calculadora-fov-video` | Ángulo de campo según sensor/focal | focal, sensor (similar a DoF) |

**Nota**: La lógica de sensor ya está en `lib/calculadoras/fotografia.ts` — reutilizable directamente.

**GPT posible**: añadir tools al GPT de Fotografía Técnica existente o crear `meskeIA — Videografía`.

---

### 3. Reformas y Construcción Doméstica ⭐⭐⭐⭐ PRIORIDAD ALTA

**Por qué las IAs fallan**: las estimaciones de m² → litros → botes varían mucho por tipo de superficie, nº de manos y rendimiento del producto. Las IAs dan rangos vagos.

**Audiencia**: enorme y universal (bricolaje, renovación del hogar). Alta en LATAM.

**Apps candidatas**:

| App | Fórmula clave | Inputs |
|-----|--------------|--------|
| `calculadora-pintura` | litros = m² × capas / rendimiento_producto | m² superficie, tipo muro, nº manos |
| `calculadora-azulejos-suelo` | cajas = (m² × (1 + %merma)) / m²_por_caja | m² habitación, formato baldosa, %merma |
| `calculadora-hormigon-mortero` | kg_cemento, kg_arena, agua según dosificación | m³ necesarios, tipo uso (solera/pegue/enfoscado) |
| `calculadora-cable-electrico` | sección_mm² según I y longitud (IEC) | potencia W, tensión V, longitud m |
| `calculadora-aislamiento-termico` | Grosor necesario según R-value objetivo | material, transmitancia objetivo |

**Disclaimer**: `// @disclaimer: exempt` para calculadoras de materiales. `severity="medium"` si incluye electricidad.

---

### 4. Energía Solar Fotovoltaica ⭐⭐⭐ PRIORIDAD MEDIA

**Por qué las IAs fallan**: el cálculo depende de latitud, orientación, consumo real y tecnología del panel. Las IAs dan estimaciones muy genéricas.

**Relevancia LATAM**: alta. México, Chile, Colombia, Argentina tienen irradiación excelente y mercado solar en expansión.

**Apps candidatas**:

| App | Fórmula clave | Inputs |
|-----|--------------|--------|
| `calculadora-paneles-solares` | nº paneles = (kWh/día) / (HSP × eficiencia) | consumo diario, latitud/HSP, potencia panel |
| `calculadora-amortizacion-solar` | años = coste / ahorro_anual | coste instalación, precio kWh, producción |
| `calculadora-angulo-optimo-panel` | ángulo = latitud ± ajuste estacional | latitud, mes del año |
| `calculadora-bateria-solar` | capacidad Ah = (kWh × días_autonomia) / (V × DOD) | consumo, días autonomía, tensión sistema |

**Nota**: Esfuerzo más alto — necesita tabla de HSP por latitud/ciudad. Valor alto si se hace bien.

---

### 5. Electrónica y Makers ⭐⭐ PRIORIDAD BAJA

**Por qué las IAs fallan**: código de colores de resistencias, cálculos de LEDs en serie/paralelo. Nicho pequeño pero muy fiel.

**Apps candidatas**:

| App | Fórmula clave | Inputs |
|-----|--------------|--------|
| `calculadora-resistencia-led` | R = (Vcc - Vf) / If | tensión alimentación, Vf LED, If deseada |
| `decodificador-codigo-colores` | Lectura banda por banda → valor Ω + tolerancia | 4 o 5 bandas de color |
| `calculadora-divisor-tension` | Vout = Vin × R2/(R1+R2) | Vin, R1, R2 o Vout objetivo |
| `calculadora-condensador-carga` | τ = R × C, tiempo carga al 63%/99% | R en Ω, C en µF |

---

### 6. Cocina Técnica ⭐⭐⭐ PRIORIDAD MEDIA

**Por qué las IAs fallan**: las conversiones de unidades culinarias entre sistemas (tazas americanas vs europeas vs pesos reales) son un caos, y el escalado proporcional con redondeos prácticos las supera.

**Apps candidatas**:

| App | Fórmula clave | Inputs |
|-----|--------------|--------|
| `escalador-recetas` | cantidad_nueva = cantidad_original × (personas_nueva / personas_original) | receta completa, nº personas destino |
| `calculadora-hidratacion-pan` | hidratación% = (agua / harina) × 100 | peso harina, peso agua |
| `conversor-unidades-cocina` | tazas/oz/cucharadas → gramos/ml por ingrediente | cantidad, unidad origen, ingrediente |
| `calculadora-levadura-masa-madre` | sustitución levadura fresca ↔ seca ↔ masa madre | tipo levadura, cantidad, hidratación MM |

---

## Resumen de prioridad

| Categoría | Apps posibles | Esfuerzo | GPT viable | Audiencia LATAM |
|-----------|:---:|:---:|:---:|:---:|
| 🥇 Deporte/Running | 6 | Bajo | ✅ Sí | ⭐⭐⭐⭐⭐ |
| 🥇 Videografía | 5 | Muy bajo (reutiliza código foto) | ✅ Ampliar existente | ⭐⭐⭐⭐ |
| 🥈 Reformas domésticas | 5 | Medio | ✅ Sí | ⭐⭐⭐⭐⭐ |
| 🥈 Cocina técnica | 4 | Bajo | 🟡 Quizás | ⭐⭐⭐⭐⭐ |
| 🥉 Energía solar | 4 | Alto | ✅ Sí | ⭐⭐⭐⭐⭐ |
| ◻️ Electrónica/Makers | 4 | Muy bajo | 🟡 Nicho | ⭐⭐⭐ |

---

## Arquitectura de implementación

Igual que Fotografía Técnica:

```
1. Crear lib/calculadoras/[categoria].ts  — lógica pura, sin React
2. Crear app/[nombre-app]/               — app meskeIA estándar
3. Crear app/api/chatgpt/[tool]/route.ts — endpoint ChatGPT
4. Actualizar public/chatgpt-schema-[categoria].json
5. Publicar nuevo GPT o ampliar uno existente
```

**Referencia de implementación**: `lib/calculadoras/fotografia.ts` + commit `c79f1c58` (2026-05-19).

---

## Estado de implementación (actualizado 2026-05-20)

---

### ✅ TANDA 0 — Fotografía en MCP (2026-05-20, commit `c5a1c2ee`)

3 tools MCP: `calcular_profundidad_campo`, `calcular_astrofoto_exposicion`, `calcular_exposicion_equivalente`
GPT: **meskeIA — Fotografía y Videografía Técnica** (ampliado en sesión 2026-05-20)

---

### ✅ TANDA 1 — Deporte y Rendimiento Físico (2026-05-20, commit `5f406548`)

6 apps web + 6 tools MCP + 6 endpoints ChatGPT + GPT nuevo:
- `calculadora-tiempos-running` — Riegel (⚠️ FCmax corregida a severity=high)
- `calculadora-zonas-cardiacas` — Karvonen
- `calculadora-1rm-gimnasio` — Epley + Brzycki
- `calculadora-potencia-ciclismo` — W/kg + VAM
- `calculadora-pace-running` — pace, splits, proyecciones
- `calculadora-swolf-natacion` — índice SWOLF

**Librería**: `lib/calculadoras/deporte.ts`
**GPT**: "meskeIA — Deporte y Rendimiento" (10 preguntas validadas, resultados correctos en ChatGPT y Claude Desktop)
**Fix posterior**: `calculadora-zonas-cardiacas` severity `medium` → `high`, commit `b9f7e8cf`

---

### ✅ TANDA 2 — Videografía Técnica (2026-05-20, commit `4abe3429`)

5 apps web + 5 tools MCP + 5 endpoints ChatGPT + ampliación GPT Fotografía:
- `calculadora-regla-180-video` — obturador correcto por fps
- `calculadora-camara-lenta` — factor slow motion + duración
- `calculadora-filtro-nd-video` — filtro ND para regla 180° en exteriores
- `calculadora-bitrate-video` — bitrate y tamaño H.264/H.265/ProRes/RAW
- `calculadora-fov-video` — FOV h/v/d, comparativa 4 sensores

**Librería**: `lib/calculadoras/videografia.ts`
**Schema**: `chatgpt-schema-fotografia.json` v2.0 — 8 paths (3 foto + 5 vídeo), commit `7847c0bf`
**Nota**: el schema anterior tenía JSON malformado — regenerado limpio y validado con `python3 json.load`

---

### ✅ TANDA 3 — Cocina Técnica (2026-05-20, commit pendiente)

8 apps web + 8 tools MCP + 8 endpoints ChatGPT + nuevo GPT:
- `calculadora-porcentaje-panadero` — Baker's percentage con detección automática de hidratación
- `calculadora-hidratacion-pan` — hidratación bidireccional: agua→% y %→agua
- `calculadora-masa-madre` — sustitución levadura fresca/seca/instantánea por masa madre + ajuste receta
- `calculadora-temperatura-masa` — DDT: temperatura agua = DDT×3 − ambiente − harina − fricción
- `calculadora-puntos-azucar` — 9 fases de cocción del azúcar por temperatura (100–200°C)
- `calculadora-gelatina` — conversión entre hojas bloom 120/160/200/250, polvo y agar-agar
- `calculadora-ganache` — ratios chocolate:nata por tipo (negro_extra/negro/semi_fondant/leche/blanco) y textura
- `escalador-recetas` — escala no lineal para levadura/impulsores/especias, redondeo práctico por unidad

**Librería**: `lib/calculadoras/cocina.ts`
**Schema**: `chatgpt-schema-cocina.json` — 8 paths OpenAPI 3.1
**GPT**: "meskeIA — Cocina Técnica" (nuevo GPT pendiente de publicar en ChatGPT)

---

### Apps web sin MCP pendientes de implementar

Apps identificadas en sesión 2026-05-20 que tienen valor de catálogo web pero **no justifican MCP**:

**Reformas domésticas** (web solo, SEO bricolaje):
- `calculadora-pintura` — m² → litros según rendimiento
- `calculadora-azulejos-suelo` — cajas con % merma
- `calculadora-cable-electrico` — sección IEC/REBT (esta sí podría tener MCP en el futuro)
- `calculadora-hormigon-mortero` — dosificaciones
- `calculadora-aislamiento-termico` — R-value

**Electrónica makers** (web solo, estudiantes/aficionados):
- `calculadora-resistencia-led` — R = (Vcc - Vf) / If
- `decodificador-codigo-colores-resistencia` — 4 y 5 bandas → valor Ω

---

---

### 🔜 TANDA 4 — Pendiente de definir

Las 3 categorías restantes (Reformas domésticas, Energía Solar, Electrónica) no pasan el filtro MCP (ver criterios arriba). Las apps web de Reformas y Electrónica sin MCP siguen pendientes como catálogo web.

*Última actualización: 2026-05-20. Tanda 3 completada en esta sesión.*
