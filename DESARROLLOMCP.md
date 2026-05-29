# DESARROLLOMCP.md — Guía del Servidor MCP de meskeIA

> Documento de referencia permanente. Actualizar cuando cambie el estado de cualquier elemento.
> Última actualización: 2026-05-19

---

## Estado actual del servidor MCP

| Campo | Valor |
|-------|-------|
| **URL producción** | `https://meskeia.com/api/mcp/` |
| **Archivo principal** | `app/api/mcp/route.ts` (~9.100 líneas) |
| **Protocolo** | MCP (Model Context Protocol) — Anthropic |
| **Transporte** | WebStandardStreamableHTTPServerTransport (stateless) |
| **Total tools** | 163 calculadoras |
| **Discovery** | `https://meskeia.com/.well-known/mcp/server-card.json` |
| **Analytics** | Integrados (`modo='mcp'` en cada llamada — ver dashboard-analytics) |
| **Clientes compatibles** | Claude Desktop, Cursor, Windsurf, cualquier cliente MCP estándar |

---

## Directorios donde está publicado

| Directorio | URL pública | Estado | Cuenta |
|-----------|-------------|--------|--------|
| **mcp.so** | mcp.so/server/meskeia-mcp/meskeIA | ✅ Live y visible | GitHub @meskeIA |
| **Smithery.ai** | smithery.ai/servers/meskeia/apps | ✅ Live (tools no escaneadas*) | GitHub @meskeIA |
| **PulseMCP** | pulsemcp.com | ✅ Email enviado — procesan semanalmente | hello@pulsemcp.com |
| **Glama.ai** | glama.ai/mcp/connectors/com.meskeia/meske-ia-mcp | ✅ Aprobado y live | GitHub @meskeIA |

*\*Smithery limitation*: El gateway proxy de Smithery devuelve 502 al inicializar contra nuestro servidor stateless. No afecta al uso real — los desarrolladores pueden usar la URL directamente. Pendiente de resolver si Smithery actualiza su infraestructura o si implementamos manejo de sesiones.

---

## Páginas publicadas en meskeIA

| Página | URL | Descripción |
|--------|-----|-------------|
| **Desarrolladores** | meskeia.com/developers/ | Landing con quick start, categorías, cómo funciona |
| **Términos de Uso** | meskeia.com/developers/terminos/ | 12 secciones legales — exención de responsabilidad |

---

## Protección jurídica implementada

### Avisos legales en respuestas MCP

**148 returns** en `app/api/mcp/route.ts` modificados con `conAviso()`:

```typescript
// Tres constantes disponibles al inicio del archivo
const AVISO_FISCAL    // IRPF, autónomos, sucesiones, hipotecas, modelos...
const AVISO_FINANCIERO // TIR/VAN, FIRE, interés compuesto, rentabilidades...
const AVISO_SALUD     // IMC, macros

// Helper
function conAviso(texto: string, aviso: string)

// Uso en cada tool
return conAviso(lineas.join('\n'), AVISO_FISCAL);
```

**Clasificación de tools:**
- **AVISO_FISCAL** → ~120 tools (fiscal, laboral, inmobiliario, seguridad social)
- **AVISO_FINANCIERO** → ~20 tools (inversiones, finanzas personales)
- **AVISO_SALUD** → 2 tools (IMC, macros)
- **Sin aviso** → 17 tools cotidianas (propina, fechas, porcentajes, unidades...)

### Términos de Uso de la API

Página `/developers/terminos/` con:
- Exención expresa de responsabilidad de meskeIA
- Obligación del integrador de preservar los avisos en cada respuesta
- Naturaleza orientativa de todos los cálculos
- Sin recogida de datos personales de usuarios finales

---

## Regla para nuevas tools MCP

Al añadir una nueva tool al servidor, **aplicar `conAviso()` directamente en el return**:

```typescript
// ✅ CORRECTO — añadir siempre conAviso en el return de éxito
return conAviso(lineas.join('\n'), AVISO_FISCAL);

// ❌ INCORRECTO — return sin aviso
return { content: [{ type: 'text', text: lineas.join('\n') }] };
```

Los directorios (mcp.so, Glama, etc.) descubren las nuevas tools automáticamente — **no hay que tocar ningún directorio** al añadir tools nuevas.

---

## Arquitectura técnica

```
app/api/mcp/route.ts
│
├── registrarUsoMCP()          — analytics por tool (modo='mcp')
├── AVISO_FISCAL / AVISO_FINANCIERO / AVISO_SALUD
├── conAviso(texto, aviso)     — wrapper de respuesta legal
│
└── crearServidorMCP()
    └── servidor.tool('nombre', desc, schema, handler)
        → return conAviso(texto, AVISO_FISCAL)  ← 148 tools

handler()                      — GET/POST/DELETE → Next.js App Router
```

**Por qué UN solo archivo**: MCP usa un único endpoint HTTP. El cliente descubre tools via `tools/list` y llama via `tools/call`, todo al mismo URL.

**Por qué stateless**: Vercel serverless — no hay estado entre peticiones. Cada llamada crea y destruye el servidor MCP.

---

## Discovery: server-card.json

**Ubicación**: `public/.well-known/mcp/server-card.json`
**URL pública**: `https://meskeia.com/.well-known/mcp/server-card.json`

Declara al ecosistema MCP:
- `authentication.required: false` → servidor público
- `capabilities.tools: true` → expone herramientas
- `transport.url` → URL del servidor

**CORS** configurado en `vercel.json` para que los scanners puedan acceder.

---

## Scripts de migración (referencia histórica)

Los scripts en `scripts/` se usaron para la migración masiva de avisos en mayo 2026. Para nuevas tools, aplicar `conAviso()` manualmente al escribir el código.

| Script | Uso |
|--------|-----|
| `scripts/aplicar-avisos-mcp.ps1` | Fase 1A: 15 tools críticas |
| `scripts/aplicar-avisos-mcp-fase1b.ps1` | Fase 1B: 132 tools restantes |

---

## Tareas pendientes

### Alta prioridad
- [ ] **Smithery tools scan**: Investigar si la actualización del SDK MCP o un manejo mínimo de sesiones resuelve el 502. Revisar en ~3 meses.

### Media prioridad
- [ ] **Registro Oficial MCP de Anthropic**: PR al repositorio oficial de Anthropic. Requiere formato específico. Mejora credibilidad y listado automático en PulseMCP. Pendiente para cuando el ecosistema MCP sea más maduro (~2-3 meses).

### Baja prioridad
- [ ] **Perplexity MCP**: Requiere plan Pro. Pendiente de evaluación económica.
- [ ] **Verificación Smithery**: TXT DNS record + link to Smithery + quality score >80. Mejora ranking pero no es urgente.

---

## Decisiones tomadas (y por qué)

| Decisión | Motivo |
|----------|--------|
| Sin API keys | Sin monetización → sin barrera de acceso |
| Sin repositorio GitHub separado | Riesgo de desincronización con `meskeia-web`. Un solo repo es la arquitectura correcta. |
| Aviso en cada respuesta (no solo en ToS) | El aviso viaja con el dato aunque el integrador no lea los ToS |
| Servidor stateless | Vercel serverless — correcto para la arquitectura actual |
| No monetizar | Objetivo = difusión del conocimiento; sin ingresos no tiene sentido el riesgo jurídico |

---

## Notas tecnológicas del ecosistema MCP

- MCP protocolo lanzado por Anthropic (nov 2024) — en rápida evolución
- Claude Desktop soporta servidores MCP remotos via URL (2025)
- Claude.ai web: soporte en expansión — cuando esté disponible, multiplica el impacto enormemente
- Cursor / Windsurf / Zed: soportan MCP remoto (audiencia dev)
- Grok / Gemini: sin sistema MCP público aún (2026-05)
- Perplexity: soporte MCP en plan Pro

**Revisar cada ~3 meses**: evolución del protocolo, nuevos clientes compatibles, estado del directorio oficial Anthropic.

---

## Historial de cambios

| Fecha | Acción |
|-------|--------|
| 2026-05-19 | Documento creado. Plan definido en 4 pasos |
| 2026-05-19 | Paso 1 Fase 1A: avisos aplicados a 15 tools críticas |
| 2026-05-19 | Paso 1 Fase 1B: avisos aplicados a 132 returns — Paso 1 COMPLETADO (148 total) |
| 2026-05-19 | Paso 2: `/developers/terminos/` — 12 secciones legales |
| 2026-05-19 | Paso 3: `/developers/` — landing de integración con quick start |
| 2026-05-19 | Paso 4: mcp.so ✅ + Smithery ✅ + PulseMCP (email) ✅ + Glama ✅ (aprobado mismo día) |
| 2026-05-19 | `/.well-known/mcp/server-card.json` desplegado — discovery estándar MCP |
| 2026-05-19 | Repo GitHub separado descartado — riesgo de desincronización |
| 2026-05-19 | Smithery tools scan: limitación técnica confirmada (502 gateway) — pendiente resolución |
