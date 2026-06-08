# fiscal-audit — Auditor de frescura normativa (Capa 2)

Verifica que los valores de `data/fiscal/` siguen vigentes contrastándolos con las
fuentes oficiales (BOE, AEAT, Seguridad Social, BCE, boletines autonómicos)
mediante la Messages API de Anthropic con las herramientas `web_search` y
`web_fetch`. **Genera un informe; no edita nada.**

## Por qué existe

Los datos fiscales caducan en fechas concretas del calendario legislativo español.
Mostrar al usuario "datos 2025" a mitad de 2026 resta credibilidad aunque el valor
siga vigente. Este auditor sirve para dos cosas:

1. **Detectar cambios** → propone el nuevo valor con cita oficial (⚠️).
2. **Confirmar vigencia** → recomienda re-sellar la fecha `verificado` del módulo a
   hoy (✅), que es lo que mantiene la credibilidad de cara al usuario.

## Uso (disparo MANUAL desde los apuntes de recordatorio)

```bash
# 15 de enero — impuestos estatales + SS + IPREM/SMI + interés legal + demora H1
npm run audit:fiscal -- --scope=enero

# 1 de julio — demora comercial 2º semestre (Ley 3/2004)
npm run audit:fiscal -- --scope=julio

# 15 de octubre — tributos cedidos a las CCAA (sucesiones, donaciones, inmuebles)
npm run audit:fiscal -- --scope=octubre

# Subconjunto puntual de módulos
npm run audit:fiscal -- --modules=intereses,irpf

# Verificar para un año concreto (por defecto: año en curso)
npm run audit:fiscal -- --scope=julio --year=2026

# Ver qué módulos cubre cada scope
npm run audit:fiscal -- --list
```

## Calendario (mantenido manualmente en los apuntes del usuario)

| Fecha | Scope | Cubre |
|-------|-------|-------|
| 15 enero | `enero` | irpf, autonomos, sociedades, pensiones, dependencia, maternidad, smi, intereses (legal + demora H1), alquiler, nomada-digital, patrimonio |
| 1 julio | `julio` | intereses (demora H2) |
| 15 octubre | `octubre` | sucesiones, donaciones, inmuebles, patrimonio |

Entre los tres scopes se cubren los 14 módulos de `data/fiscal/` al menos una vez al año.

## Requisitos

- `ANTHROPIC_API_KEY` en `.env.local` (o en el entorno).
- Node 18+ (usa `@anthropic-ai/sdk`, ya en el proyecto).

## Salida

Un Markdown en `scripts/fiscal-audit/reports/fiscal-audit-<scope>-<fecha>.md` con,
por módulo: veredicto (✅/⚠️/❓), tabla parámetro-a-parámetro con la fuente citada,
y recomendación (re-sellar `verificado` o actualizar valores).

Los informes generados **no se versionan** (ver `reports/.gitignore`): son artefactos
de trabajo. Si un informe motiva cambios, esos cambios van directamente a
`data/fiscal/` revisados a mano.

## Importante

- **Report-only**: nunca edita `data/fiscal/`. Los datos fiscales son nivel CRÍTICO.
- Verifica cada ⚠️ contra la fuente oficial antes de tocar el código.
- El resultado es orientativo (lo produce un LLM con acceso web); es un punto de
  partida fiable, no una certificación. La certificación final (Capa 1: valores
  golden contra simulador oficial) es un tema aparte y pendiente.
