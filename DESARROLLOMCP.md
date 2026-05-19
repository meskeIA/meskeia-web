# DESARROLLOMCP.md — Plan de Publicación del Servidor MCP meskeIA

> Documento vivo. Actualizar tras cada sesión de trabajo.
> Última actualización: 2026-05-19

---

## Estado actual del servidor MCP

| Campo | Valor |
|-------|-------|
| **URL producción** | `https://meskeia.com/api/mcp` |
| **Archivo** | `app/api/mcp/route.ts` |
| **Protocolo** | MCP (Model Context Protocol) — Anthropic |
| **Transporte** | WebStandardStreamableHTTPServerTransport (stateless) |
| **Total tools** | 160 calculadoras |
| **Analytics** | Integrados (`modo='mcp'` en cada llamada) |
| **Clientes compatibles** | Claude Desktop, Cursor, Windsurf (cualquier cliente MCP) |

---

## Hoja de ruta

### ✅ Paso 0 — Infraestructura base (completado)
- Servidor MCP desplegado en producción
- 160 tools implementadas y funcionando
- Analytics integrados con el sistema meskeIA
- Testado con Claude Desktop (`calcular_propina` verificado)

---

### 🔄 Paso 1 — Protección jurídica técnica en respuestas MCP

**Objetivo**: Añadir aviso legal al final de cada respuesta de tools de riesgo, de modo que cualquier IA que consuma el MCP transmita el aviso al usuario final.

**Implementación técnica**:
- Constantes `AVISO_FISCAL`, `AVISO_FINANCIERO`, `AVISO_SALUD` en `route.ts`
- Helper `conAviso(texto, aviso)` que envuelve el return
- Aplicado tool por tool en las categorías de riesgo

#### Fase 1A — Tools FISCAL CRÍTICO (sesión 2026-05-19)

| Tool | Línea inicio | Estado |
|------|-------------|--------|
| `calcular_imc` | 404 | ✅ aplicado (SALUD) |
| `calcular_donaciones` | 620 | ✅ aplicado |
| `calcular_iva` | 743 | ✅ aplicado |
| `calcular_pension_publica` | 859 | ✅ aplicado |
| `calcular_sucesiones` | 933 | ✅ aplicado |
| `calcular_hipoteca` | 1056 | ✅ aplicado |
| `calcular_compraventa_inmueble` | 1214 | ✅ aplicado |
| `calcular_legitimas` | 1618 | ✅ aplicado |
| `calcular_jubilacion_anticipada` | 2101 | ✅ aplicado |
| `calcular_sueldo_neto` | 2239 | ✅ aplicado |
| `calcular_irpf` | 2295 | ✅ aplicado |
| `calcular_cuota_autonomo` | 2370 | ✅ aplicado |
| `calcular_herencia_conjunta` | 2978 | ✅ aplicado |
| `calcular_declaracion_conjunta` | 3208 | ✅ aplicado |
| `calcular_pension_complementaria` | 4151 | ✅ aplicado |

#### Fase 1B — Tools ✅ COMPLETADA (sesión 2026-05-19)

132 líneas modificadas. Script usado: `scripts/aplicar-avisos-mcp-fase1b.ps1`

**Resultado final**: 148 líneas con `conAviso()` en el archivo — cobertura total de todas las tools de riesgo.

#### Fase 1B — Lista de referencia (ya procesadas)

**Fiscal** (aplicar `AVISO_FISCAL`):
- `calcular_interes_demora` (788) — intereses legales/tributarios
- `calcular_prestamo` (1145)
- `calcular_amortizacion_anticipada` (1323)
- `calcular_brecha_jubilacion` (1387)
- `calcular_pension_viudedad` (1560)
- `calcular_tarifa_freelance` (1677)
- `calcular_coste_aplazado` (1756)
- `calcular_break_even` (2173)
- `calcular_plusvalias_irpf` (2424)
- `calcular_coste_empleado` (2686)
- `calcular_finiquito` (2753)
- `calcular_pension_desempleo` (2831)
- `calcular_venta_inmueble` (2893)
- `calcular_subida_salarial` (3287)
- `calcular_pago_fraccionado` (3340)
- `calcular_baja_medica` (3402)
- `calcular_periodo_carencia` (3458)
- `calcular_kilometraje` (3518)
- `calcular_plan_pensiones` (3648)
- `calcular_leasing` (3709)
- `calcular_capacidad_hipoteca` (3895)
- `calcular_regla_72` (4025)
- `calcular_retencion_alquiler` (4222)
- Y todas las tools de lotes K-R (líneas 4300+)

**Financiero** (aplicar `AVISO_FINANCIERO`):
- `calcular_interes_compuesto` (445)
- `calcular_tir_van` (1445)
- `calcular_fire` (1499)
- `calcular_roi_marketing` (1807)
- `calcular_valor_presente` (3594)
- `calcular_rentabilidad_alquiler` (3774)
- `calcular_estrategia_deuda` (3835)
- `calcular_objetivo_ahorro` (3962)

**Salud** (aplicar `AVISO_SALUD`):
- `calcular_macros` (2555)

**Sin aviso** (cotidiano/educativo — no modificar):
- `calcular_propina`, `calcular_porcentaje`, `calcular_combustible`
- `calcular_diferencia_fechas`, `calcular_fecha_resultado`, `calcular_dia_semana`, `calcular_edad`
- `calcular_mcd_mcm`, `convertir_unidades`, `calcular_regla_tres`, `calcular_estadisticas`
- `calcular_gasto_energetico`, `consultar_etiqueta_dgt`

---

### ✅ Paso 2 — Términos de Uso de la API (completado 2026-05-19)

**Objetivo**: Página legal que transfiere responsabilidad al integrador.

**Ruta**: `/developers/terminos`

**Contenido**:
- Qué es el MCP de meskeIA
- Uso permitido (integración en apps, bots, agentes IA)
- Obligaciones del integrador: informar al usuario final del carácter orientativo
- Exención de responsabilidad de meskeIA
- Resultados orientativos — no asesoramiento fiscal/financiero/médico
- Gratuito, sin garantía de disponibilidad
- Contacto: meskeia@proton.me

**Archivos a crear**:
- `app/developers/terminos/metadata.ts`
- `app/developers/terminos/page.tsx`
- `app/developers/terminos/Terminos.module.css`

---

### ⏳ Paso 3 — Página /developers

**Objetivo**: Punto de entrada para desarrolladores que quieran integrar meskeIA.

**Ruta**: `/developers`

**Contenido**:
- Qué es el MCP de meskeIA (160 calculadoras)
- Instrucciones Claude Desktop (snippet JSON listo para copiar)
- Instrucciones Cursor / Windsurf
- Categorías de tools disponibles (fiscal, financiero, salud, cotidiano)
- Enlace a `/developers/terminos`
- Contacto para dudas

**Snippet Claude Desktop**:
```json
{
  "mcpServers": {
    "meskeia": {
      "url": "https://meskeia.com/api/mcp"
    }
  }
}
```

**Archivos a crear**:
- `app/developers/metadata.ts`
- `app/developers/page.tsx`
- `app/developers/Developers.module.css`
- Registrar en `data/applications.ts` + `data/implemented-apps.ts`

---

### ⏳ Paso 4 — Distribución en directorios MCP

**Objetivo**: Hacer descubrible el servidor MCP a desarrolladores de todo el mundo.

| Directorio | URL envío | Prioridad |
|-----------|-----------|-----------|
| **mcp.so** | mcp.so/submit | Alta |
| **Smithery.ai** | smithery.ai | Alta |
| **Glama.ai** | glama.ai/mcp | Media |
| **PulseMCP** | pulsemcp.com | Media |
| GitHub repo público | github.com/new | Opcional |

**Información necesaria para el envío**:
- Nombre: meskeIA MCP
- Descripción: 160 calculadoras fiscales, financieras y de salud en español
- URL: `https://meskeia.com/api/mcp`
- Categorías: Finance, Legal, Health, Utilities
- Idioma: Español (España + Latam compatible)

---

## Textos de aviso legal (versión canónica)

```
AVISO_FISCAL:
"Resultado orientativo generado automáticamente. No constituye asesoramiento
fiscal ni jurídico. meskeIA no asume responsabilidad por decisiones tomadas
en base a estos datos. Consulte a un asesor fiscal colegiado o a la Agencia
Tributaria (aeat.es) para su caso concreto."

AVISO_FINANCIERO:
"Resultado orientativo generado automáticamente. No constituye asesoramiento
financiero ni de inversión. meskeIA no asume responsabilidad por decisiones
económicas tomadas en base a estos datos. Consulte a un profesional
financiero antes de actuar."

AVISO_SALUD:
"Resultado orientativo generado automáticamente. No constituye diagnóstico
ni consejo médico. meskeIA no asume responsabilidad por decisiones de salud
tomadas en base a estos datos. Consulte a un profesional sanitario para
su caso concreto."
```

---

## Arquitectura técnica del servidor MCP

```
app/api/mcp/route.ts
│
├── registrarUsoMCP()          — analytics por tool
├── AVISO_FISCAL / AVISO_FINANCIERO / AVISO_SALUD  — constantes de aviso
├── conAviso(texto, aviso)     — helper que añade aviso al return
│
└── crearServidorMCP()
    ├── servidor.tool('calcular_propina', ...)
    ├── servidor.tool('calcular_irpf', ...)     ← conAviso + AVISO_FISCAL
    └── ... (160 tools)

handler()                      — Next.js App Router (GET/POST/DELETE)
```

**Por qué UN solo archivo (no carpetas separadas como /api/chatgpt/)**:
El protocolo MCP usa un único endpoint HTTP. El cliente descubre tools via
`tools/list` y llama via `tools/call`, todo al mismo URL. Es la diferencia
entre REST (múltiples URLs) y MCP (protocolo propio, una URL).

---

## Notas tecnológicas (evolución del ecosistema)

- **MCP** es un protocolo en rápida evolución desde Anthropic (lanzado nov 2024)
- **Claude Desktop** ya soporta servidores MCP remotos via URL (2025)
- **Claude.ai web**: soporte en expansión — cuando esté disponible públicamente, amplía el alcance enormemente
- **Cursor / Windsurf / Zed**: soportan MCP remoto, audiencia dev
- **Grok / Gemini**: no tienen sistema MCP público aún (2026-05)
- **Perplexity**: soporte MCP en plan Pro — pendiente de integrar
- Los **directorios MCP** más activos en 2026: mcp.so, Smithery.ai, Glama.ai, PulseMCP

**Por qué NO un SDK npm**:
Las IAs no instalan paquetes npm. Consumen APIs y servidores MCP.
Un SDK npm sirve para desarrolladores que construyen apps, no para IAs directamente.
El MCP es el canal correcto para que las IAs usen meskeIA.

---

## Decisiones tomadas

| Decisión | Motivo |
|----------|--------|
| Sin API keys por ahora | Sin monetización → sin barrera de acceso |
| Sin rate limiting inicial | Tráfico esperado bajo en fase inicial |
| Aviso en respuesta (no solo en ToS) | El integrador puede no leer ToS; el aviso viaja con el dato |
| Gratuito indefinido | Objetivo = difusión del conocimiento, no ingresos |
| Aviso en descripción de tool también | Claude lee la descripción antes de llamar — doble protección |

---

## Historial de cambios

| Fecha | Acción |
|-------|--------|
| 2026-05-19 | Documento creado. Plan definido en 4 pasos |
| 2026-05-19 | Paso 1 Fase 1A: avisos aplicados a 15 tools críticas |
| 2026-05-19 | Paso 1 Fase 1B: avisos aplicados a 132 returns en el resto de tools — Paso 1 COMPLETADO |
| 2026-05-19 | Paso 2: página /developers/terminos creada — 12 secciones, exención de responsabilidad, obligaciones del integrador |
