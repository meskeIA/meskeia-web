# Guía: Añadir una calculadora al asistente conversacional

Este documento explica el patrón para incorporar una nueva calculadora al
asistente de meskeIA (`✨ ¿Qué necesitas?`), de modo que pueda ejecutar
cálculos directamente en el chat en lugar de limitarse a recomendar la app.

---

## Cuándo añadir una calculadora al asistente

✅ Recomendado sin disclaimer:
- Lógica determinista (mismo input → mismo output siempre)
- Parámetros claros y en número limitado (≤ 6)
- Riesgo legal bajo o nulo (matemáticas, conversores, hogar, viajes, fechas)

✅ Recomendado con disclaimer estándar (patrón `_disclaimer`):
- Apps de la suite Salud con carácter orientativo (IMC, nutrición, hábitos)
- Apps financieras generales (ahorro, simuladores, comparadores)
- Cualquier app con `DisclaimerCard` de severity `medium` o `high`

⚠️ Requiere validación legal antes de implementar:
- Suite Fiscal (IRPF, IVA empresarial, plusvalías, retenciones...)
- Apps de salud con orientación clínica directa
- Cualquier app con `DisclaimerCard` de severity `critical`

❌ No aplica:
- Quizzes, juegos, generadores de contenido
- Apps que dependen de estado externo (divisas en tiempo real, etc.)

---

## Paso 1 — Extraer la lógica a `lib/calculadoras/`

Crea (o verifica que existe) un archivo TypeScript puro para la calculadora:

```
lib/calculadoras/[nombre].ts
```

**Requisitos del archivo:**
- Sin imports de React, sin hooks, sin referencias al DOM
- Exporta al menos una función con tipos explícitos en input y output
- Lanza errores descriptivos para inputs inválidos

**Ejemplo mínimo (sin disclaimer):**
```typescript
// lib/calculadoras/descuentos.ts

export interface ParametrosDescuento {
  precioOriginal: number;
  porcentajeDescuento: number;
}

export interface ResultadoDescuento {
  precioFinal: number;
  ahorro: number;
}

export function calcularDescuento(p: ParametrosDescuento): ResultadoDescuento {
  if (p.precioOriginal <= 0) throw new Error('El precio debe ser mayor que 0');
  if (p.porcentajeDescuento < 0 || p.porcentajeDescuento > 100)
    throw new Error('El porcentaje debe estar entre 0 y 100');

  const ahorro = (p.precioOriginal * p.porcentajeDescuento) / 100;
  return {
    precioFinal: p.precioOriginal - ahorro,
    ahorro,
  };
}
```

---

## Paso 2 — Registrar la tool en la API route

Abre `app/api/asistente/route.ts` y haz **tres adiciones**:

### 2a. Importar la función
```typescript
// Al inicio del archivo, junto a los otros imports de calculadoras
import { calcularDescuento } from '@/lib/calculadoras/descuentos';
```

### 2b. Añadir la definición de tool al array `HERRAMIENTAS`
```typescript
{
  name: 'calcular_descuento',
  description: 'Calcula el precio final tras aplicar un descuento y cuánto se ahorra. Úsalo cuando el usuario quiera saber el precio con descuento o rebajas.',
  input_schema: {
    type: 'object' as const,
    properties: {
      precioOriginal:      { type: 'number', description: 'Precio original del artículo en euros' },
      porcentajeDescuento: { type: 'number', description: 'Porcentaje de descuento, ej: 20 para 20%' },
    },
    required: ['precioOriginal', 'porcentajeDescuento'],
  },
},
```

**Consejos para la `description`:**
- Explica cuándo debe usarse esta tool (ayuda a Claude a decidir)
- Menciona sinónimos clave: "descuento", "rebajas", "precio con oferta"
- Sé conciso — Claude lee todas las descripciones para elegir la correcta

### 2c. Añadir el caso en `ejecutarHerramienta()`

**Sin disclaimer** (matemáticas puras, sin riesgo legal):
```typescript
if (nombre === 'calcular_descuento') {
  const { precioOriginal, porcentajeDescuento } = params as {
    precioOriginal: number;
    porcentajeDescuento: number;
  };
  const r = calcularDescuento({ precioOriginal, porcentajeDescuento });
  return JSON.stringify({
    precio_final: r.precioFinal,
    ahorro: r.ahorro,
    porcentaje_aplicado: porcentajeDescuento,
  });
}
```

**Con disclaimer** (salud, financiero, legal): añadir `_disclaimer` al JSON:
```typescript
if (nombre === 'calcular_imc') {
  const { pesoKg, alturaCm } = params as { pesoKg: number; alturaCm: number };
  const r = calcularIMC({ pesoKg, alturaCm });
  return JSON.stringify({
    imc: r.imcFormateado,
    categoria: r.categoria,
    // ... resto de campos ...
    _disclaimer: { variant: 'medical', severity: 'high' },  // ← esto es todo
  });
}
```

La infraestructura (route.ts + AsistenteChat) detecta `_disclaimer` automáticamente,
lo extrae antes de enviar el resultado a Claude, y renderiza el `DisclaimerCard`
estándar en el chat tras la respuesta. **No requiere ningún otro cambio.**

---

## Paso 3 — Verificar y desplegar

```bash
npm run build          # Debe terminar con exit code 0
git add .
git commit -m "feat: añadir calcular_descuento al asistente"
git push origin main   # Vercel despliega automáticamente
```

---

## Checklist completo

```
[ ] lib/calculadoras/[nombre].ts existe y exporta función pura
[ ] Sin imports React/DOM en el archivo de lógica
[ ] Import añadido en app/api/asistente/route.ts
[ ] Tool añadida a HERRAMIENTAS[] con description clara
[ ] Caso añadido en ejecutarHerramienta()
[ ] Si la app tiene DisclaimerCard → añadir _disclaimer:{variant,severity} al JSON
[ ] npm run build → exit code 0
[ ] Probado en chat: consulta directa + consulta con datos faltantes
[ ] Si tiene disclaimer: verificar que aparece tras el resultado
[ ] Commit y push
```

---

## Patrón `_disclaimer` — referencia rápida

El disclaimer en el chat usa exactamente el mismo componente (`DisclaimerCard`)
y los mismos contenidos por defecto que las apps individuales. No se escribe
texto personalizado — se reutiliza el estándar de la política de disclaimers.

### Mapa variant + severity por suite

| Suite | variant | severity |
|-------|---------|----------|
| Salud orientativa (IMC, nutrición, hábitos) | `medical` | `high` |
| Salud clínica (diagnóstico, medicación) | `medical` | `critical` |
| Financiero general (ahorro, simuladores) | `financial` | `high` |
| Fiscal (IRPF, IVA, plusvalías...) | `financial` | `critical` |
| Productividad / planificadores cotidianos | `general` | `medium` |
| Matemáticas / conversores / fechas | — | *(sin disclaimer)* |

### Cómo funciona internamente

```
ejecutarHerramienta() devuelve JSON con _disclaimer
    ↓
route.ts detecta _disclaimer, lo extrae, lo almacena en disclaimerInfo
    ↓
Claude recibe el JSON limpio (sin _disclaimer)
    ↓
API response incluye campo disclaimer: { variant, severity }
    ↓
AsistenteChat renderiza <DisclaimerCard variant=... severity=... />
tras el texto de la respuesta
```

---

## Calculadoras ya integradas (referencia)

| Tool | Archivo | Disclaimer |
|------|---------|-----------|
| `calcular_propina` | `lib/calculadoras/propinas.ts` | — |
| `calcular_porcentaje` | `lib/calculadoras/porcentajes.ts` | — |
| `calcular_combustible` | `lib/calculadoras/combustible.ts` | — |
| `calcular_diferencia_fechas` | `lib/calculadoras/fechas.ts` | — |
| `calcular_fecha_resultado` | `lib/calculadoras/fechas.ts` | — |
| `calcular_dia_semana` | `lib/calculadoras/fechas.ts` | — |
| `calcular_edad` | `lib/calculadoras/fechas.ts` | — |
| `calcular_imc` | `lib/calculadoras/imc.ts` | `medical/high` |

---

## Candidatas siguientes

### Sin disclaimer (incorporación directa)

| App | Archivo a crear | Complejidad |
|-----|----------------|-------------|
| Calculadora de Descuentos | `lib/calculadoras/descuentos.ts` | Baja |
| Regla de Tres | `lib/calculadoras/reglaTres.ts` | Baja |
| Calculadora de Pintura | `lib/calculadoras/pintura.ts` | Baja |
| Conversor de Tallas | `lib/calculadoras/tallas.ts` | Baja |
| Calculadora de Cocina | `lib/calculadoras/cocina.ts` | Media |

### Con disclaimer `medical/high`

| App | Archivo a crear |
|-----|----------------|
| Calculadora de Calorías | `lib/calculadoras/calorias.ts` |
| Calculadora de Hidratación | `lib/calculadoras/hidratacion.ts` |

### Con disclaimer `financial/high`

| App | Archivo a crear |
|-----|----------------|
| Calculadora de Ahorro | `lib/calculadoras/ahorro.ts` |
| Simulador de Interés Compuesto | `lib/calculadoras/interes.ts` |

---

*Última actualización: 2026-03-20*
