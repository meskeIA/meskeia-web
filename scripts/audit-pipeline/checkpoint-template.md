# Checkpoint Tanda N — [slugs de las 4 apps]

**Fecha**: AAAA-MM-DD · **Commits**: `xxxxxxxx` (sub-tanda A), `yyyyyyyy` (sub-tanda B)

## Resumen
- Apps revisadas: X
- Hallazgos totales: X (🔴 N críticos / 🟠 N medios / 🟡 N menores)
- Fixes aplicados: X
- Build: OK / FALLO (ver sección "Hard-stop")

## Hallazgos fiscales/legales (siempre listados, aunque ya corregidos)
- [app]: descripción del hallazgo → corrección aplicada

## Por app

### [slug-app-1] (#rank, N usos)
- 🔴/🟠/🟡 Hallazgo → fix aplicado / pendiente (motivo)

### [slug-app-2] ...

## Hard-stop (si aplica)
- [ ] Cambio necesario en archivo compartido (`data/fiscal/*`, `components/`, `lib/`) → **PIPELINE PAUSADO**, no se ha tocado el archivo compartido. Descripción: ...
- [ ] Build falló → **PIPELINE PAUSADO**. Error: ...

## Estado del pipeline
- REVISION-PROGRESO.md: [x] marcadas las N apps de esta tanda (fuente única de verdad)
- audit-state.json actualizado: lastTanda → N
- Próxima tanda: [slugs] (ver find-next-batch.mjs)
- Continúa automáticamente: sí (informe-only) / no (esperando revisión por hard-stop)
