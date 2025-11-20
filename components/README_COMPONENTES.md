# Componentes meskeIA - Guía de Uso

## Componentes Disponibles

### 1. MeskeiaLogo
Logo oficial meskeIA (fixed, top-left)

**Uso**:
```tsx
import MeskeiaLogo from '@/components/MeskeiaLogo';

<MeskeiaLogo />
```

### 2. Footer
Footer unificado con glassmorphism + botón compartir integrado

**Uso**:
```tsx
import Footer from '@/components/Footer';

<Footer appName="Calculadora de Porcentajes" />
// o sin appName (usa document.title por defecto)
<Footer />
```

### 3. AnalyticsScript
Google Analytics v2.0 con tracking avanzado

**Uso**:
```tsx
import AnalyticsScript from '@/components/AnalyticsScript';

<AnalyticsScript appName="calculadora-porcentajes" />
```

**IMPORTANTE**: `appName` debe ser el slug de la app (sin espacios, en minúsculas, con guiones)

---

## Ejemplo Completo: Página de Aplicación

```tsx
'use client';

import { useState } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import AnalyticsScript from '@/components/AnalyticsScript';

export default function CalculadoraPorcentajes() {
  const [valor, setValor] = useState(0);
  const [porcentaje, setPorcentaje] = useState(0);
  const [resultado, setResultado] = useState(0);

  const calcular = () => {
    setResultado((valor * porcentaje) / 100);
  };

  return (
    <>
      {/* Logo fijo arriba-izquierda */}
      <MeskeiaLogo />

      {/* Contenido de la app */}
      <main className="container" style={{ paddingTop: '80px' }}>
        <h1>Calculadora de Porcentajes</h1>

        <input
          type="number"
          value={valor}
          onChange={(e) => setValor(Number(e.target.value))}
          placeholder="Valor"
        />

        <input
          type="number"
          value={porcentaje}
          onChange={(e) => setPorcentaje(Number(e.target.value))}
          placeholder="Porcentaje"
        />

        <button onClick={calcular}>Calcular</button>

        <p>Resultado: {resultado}</p>
      </main>

      {/* Footer fijo abajo-derecha */}
      <Footer appName="Calculadora de Porcentajes" />

      {/* Analytics (no renderiza nada visible) */}
      <AnalyticsScript appName="calculadora-porcentajes" />
    </>
  );
}
```

---

## Notas Importantes

### 1. 'use client' Directive
Todos los componentes que usan interactividad (useState, useEffect, onClick) necesitan:
```tsx
'use client';
```
al inicio del archivo.

### 2. Padding Superior
Como el logo es `position: fixed` arriba, añade padding al `<main>`:
```tsx
<main style={{ paddingTop: '80px' }}>
```

### 3. Nombre de App vs Slug
- **appName** (Footer): Texto legible → "Calculadora de Porcentajes"
- **appName** (AnalyticsScript): Slug → "calculadora-porcentajes"

### 4. Rutas de las Apps
En Next.js con App Router, cada app es una carpeta:
```
app/
├── calculadora-porcentajes/
│   └── page.tsx
├── simulador-hipoteca/
│   └── page.tsx
└── probabilidad/
    └── page.tsx
```

La URL será: `http://localhost:3000/calculadora-porcentajes/`

---

## Ventaja de los Componentes

**Antes (HTML estático)**:
- Footer duplicado en 84 archivos
- Cambio en footer = script Python en 84 archivos

**Ahora (Next.js)**:
- Footer en 1 componente
- Cambio en footer = editar 1 archivo → build → 84 apps actualizadas

**Sin riesgo**, **sin errores**, **mantenimiento fácil**.
