# Guía: Añadir una calculadora al asistente conversacional

Este documento explica el patrón para incorporar una nueva calculadora al
asistente de meskeIA (`✨ ¿Qué necesitas?`), de modo que pueda ejecutar
cálculos directamente en el chat en lugar de limitarse a recomendar la app.

---

## Cuándo añadir una calculadora al asistente

✅ Recomendado:
- Lógica determinista (mismo input → mismo output siempre)
- Parámetros claros y en número limitado (≤ 6)
- Riesgo legal bajo o nulo (matemáticas, conversores, hogar, viajes)

⚠️ Requiere revisión legal previa:
- Apps de la suite Fiscal (IRPF, IVA empresarial, plusvalías...)
- Apps de la suite Salud con orientación clínica
- Cualquier app con DisclaimerCard de nivel 1 o 2

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

**Ejemplo mínimo:**
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

**Nota:** Devuelve JSON con claves descriptivas en español — Claude las usa
para formatear la respuesta al usuario.

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
[ ] npm run build → exit code 0
[ ] Probado en chat: consulta directa + consulta con datos faltantes
[ ] Commit y push
```

---

## Calculadoras ya integradas (referencia)

| Tool | Archivo | Modos |
|------|---------|-------|
| `calcular_propina` | `lib/calculadoras/propinas.ts` | monto + % + personas |
| `calcular_porcentaje` | `lib/calculadoras/porcentajes.ts` | percentOf, whatPercent, increase, decrease, variation |
| `calcular_combustible` | `lib/calculadoras/combustible.ts` | consumo, viaje |

---

## Candidatas prioritarias (sin riesgo legal)

| App | Archivo a crear | Complejidad |
|-----|----------------|-------------|
| Calculadora de Descuentos | `lib/calculadoras/descuentos.ts` | Baja |
| Calculadora de Fechas | `lib/calculadoras/fechas.ts` | Baja |
| Calculadora de Cocina | `lib/calculadoras/cocina.ts` | Media |
| Conversor de Tallas | `lib/calculadoras/tallas.ts` | Baja |
| Calculadora de Pintura | `lib/calculadoras/pintura.ts` | Baja |
| Regla de Tres | `lib/calculadoras/reglaTres.ts` | Baja |

---

*Última actualización: 2026-03-20*
