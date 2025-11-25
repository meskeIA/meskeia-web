# 📦 Componentes Reutilizables meskeIA

Biblioteca de componentes React para aplicaciones meskeIA en Next.js.

---

## 🎨 Componentes Disponibles

### 1. **MeskeiaLogo**
Logo oficial con navegación a página principal.

**Uso:**
```tsx
import { MeskeiaLogo } from '@/components';

<MeskeiaLogo />
```

**Props:** Ninguna (componente simple)

---

### 2. **Footer**
Footer unificado con glassmorphism y botón compartir.

**Uso:**
```tsx
import { Footer } from '@/components';

<Footer appName="mi-calculadora" />
```

**Props:**
- `appName` (string, requerido): Nombre del slug de la app

---

### 3. **ThemeToggle**
Botón para cambiar entre modo claro/oscuro.

**Uso:**
```tsx
import { ThemeToggle } from '@/components';

<ThemeToggle />
```

**Ubicación:** Ya integrado en `layout.tsx` (global)

---

### 4. **NumberInput** ⭐ NUEVO
Input numérico con soporte para formato español (acepta coma y punto).

**Uso:**
```tsx
import { NumberInput } from '@/components';

const [valor, setValor] = useState('');

<NumberInput
  value={valor}
  onChange={setValor}
  label="Capital inicial"
  placeholder="10000"
  helperText="Ingrese la cantidad en euros"
/>
```

**Props:**
- `value` (string, requerido): Valor actual del input
- `onChange` (function, requerido): Callback cuando cambia el valor
- `label` (string, requerido): Etiqueta del campo
- `placeholder` (string, opcional): Placeholder
- `min` (number, opcional): Valor mínimo permitido
- `max` (number, opcional): Valor máximo permitido
- `step` (number, opcional): Incremento/decremento (default: 1)
- `required` (boolean, opcional): Campo obligatorio
- `disabled` (boolean, opcional): Campo deshabilitado
- `helperText` (string, opcional): Texto de ayuda
- `error` (string, opcional): Mensaje de error
- `className` (string, opcional): Clases CSS adicionales

**Características:**
- ✅ Acepta coma (`,`) y punto (`.`) como separador decimal
- ✅ Validación automática al perder foco (blur)
- ✅ Respeta min/max si están definidos
- ✅ Dark mode completo
- ✅ Accesibilidad (ARIA labels)

---

### 5. **ResultCard** ⭐ NUEVO
Card estandarizado para mostrar resultados de cálculos.

**Uso:**
```tsx
import { ResultCard } from '@/components';

<ResultCard
  title="Capital Final"
  value="15.234,56"
  unit="€"
  variant="highlight"
  icon="💰"
  description="Tu inversión ha generado 5.234,56 € en intereses"
/>
```

**Props:**
- `title` (string, requerido): Título del resultado
- `value` (string | number, requerido): Valor a mostrar
- `unit` (string, opcional): Unidad (€, %, kg, etc.)
- `description` (string, opcional): Descripción adicional
- `variant` (string, opcional): Estilo visual
  - `default`: Estilo estándar
  - `highlight`: Resaltado con borde azul
  - `success`: Verde (resultado positivo)
  - `warning`: Amarillo (advertencia)
  - `info`: Teal (información)
- `icon` (string, opcional): Emoji o icono
- `className` (string, opcional): Clases CSS adicionales
- `children` (ReactNode, opcional): Contenido adicional

**Características:**
- ✅ 5 variantes visuales
- ✅ Hover effect (elevación)
- ✅ Dark mode completo
- ✅ Responsive design

---

### 6. **EducationalSection** ⭐ NUEVO - CRÍTICO
Sección colapsable para contenido educativo (filosofía meskeIA).

**Uso:**
```tsx
import { EducationalSection } from '@/components';

<EducationalSection
  title="¿Quieres aprender más sobre Interés Compuesto?"
  subtitle="Descubre estrategias de inversión y conceptos clave"
  icon="📚"
>
  <section>
    <h2>El Poder del Interés Compuesto</h2>
    <p>Albert Einstein llamó al interés compuesto...</p>

    <div className={styles.contentGrid}>
      <div className={styles.contentCard}>
        <h4>Concepto 1</h4>
        <p>Explicación...</p>
      </div>
    </div>
  </section>
</EducationalSection>
```

**Props:**
- `title` (string, requerido): Título principal
- `subtitle` (string, requerido): Subtítulo descriptivo
- `icon` (string, opcional): Emoji (default: 📚)
- `defaultOpen` (boolean, opcional): Abierto por defecto (default: false)
- `children` (ReactNode, requerido): Contenido educativo
- `className` (string, opcional): Clases CSS adicionales

**Características:**
- ✅ Animación fadeIn al abrir
- ✅ Botón con texto dinámico (Ver/Ocultar)
- ✅ Dark mode completo
- ✅ Accesibilidad (aria-expanded, aria-live)
- ✅ **Implementa REGLA #7** de CLAUDE.md

**Filosofía:** Los disclaimers NUNCA deben ir dentro de este componente (deben estar siempre visibles por responsabilidad legal).

---

## 📚 Utilidades (lib/formatters.ts)

### Funciones de Formato Español

**Importar:**
```tsx
import { formatNumber, formatCurrency, formatDate } from '@/lib';
// O específicas:
import { formatNumber } from '@/lib/formatters';
```

#### **formatNumber(num, decimals)**
Formatea número con coma decimal y punto miles.

```tsx
formatNumber(1234.5678, 2)  // "1.234,57"
formatNumber(42, 4)          // "42,0000"
formatNumber(NaN)            // "No definido"
formatNumber(Infinity)       // "∞"
```

#### **formatCurrency(num)**
Formatea como moneda EUR.

```tsx
formatCurrency(1234.56)  // "1.234,56 €"
formatCurrency(1000000)  // "1.000.000,00 €"
```

#### **formatDate(date)**
Formatea fecha (DD/MM/YYYY).

```tsx
formatDate(new Date())  // "25/11/2025"
```

#### **formatDateTime(date)**
Formatea fecha y hora.

```tsx
formatDateTime(new Date())  // "25/11/2025 14:30"
```

#### **formatPercentage(num, decimals)**
Formatea porcentaje.

```tsx
formatPercentage(0.15, 2)   // "15,00%"
formatPercentage(0.8564, 1) // "85,6%"
```

#### **formatCompactNumber(num)**
Formatea con sufijos (K, M, B).

```tsx
formatCompactNumber(1500)       // "1,5K"
formatCompactNumber(2300000)    // "2,3M"
formatCompactNumber(1500000000) // "1,5B"
```

#### **formatDuration(seconds)**
Formatea duración en tiempo legible.

```tsx
formatDuration(45)    // "45seg"
formatDuration(180)   // "3min"
formatDuration(7200)  // "2h"
formatDuration(9000)  // "2h 30min"
```

#### **parseSpanishNumber(input)**
Parsea input con coma o punto.

```tsx
parseSpanishNumber("1.234,56")  // 1234.56
parseSpanishNumber("1234.56")   // 1234.56
parseSpanishNumber("1,5")       // 1.5
```

#### **isValidNumber(input)**
Valida si es número válido.

```tsx
isValidNumber("1.234,56")  // true
isValidNumber("abc")       // false
isValidNumber("123")       // true
```

---

## 🎯 Ejemplos de Uso Completo

### Calculadora con todos los componentes:

```tsx
'use client';

import { useState } from 'react';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection } from '@/components';
import { formatCurrency, parseSpanishNumber } from '@/lib';
import styles from './MiCalculadora.module.css';

export default function MiCalculadoraPage() {
  const [capital, setCapital] = useState('10000');
  const [tasa, setTasa] = useState('5');
  const [resultado, setResultado] = useState('');

  const calcular = () => {
    const c = parseSpanishNumber(capital);
    const t = parseSpanishNumber(tasa) / 100;
    const r = c * (1 + t);
    setResultado(formatCurrency(r));
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Mi Calculadora</h1>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <NumberInput
            value={capital}
            onChange={setCapital}
            label="Capital inicial"
            placeholder="10000"
            helperText="Cantidad en euros"
          />

          <NumberInput
            value={tasa}
            onChange={setTasa}
            label="Tasa de interés (%)"
            placeholder="5"
            min={0}
            max={100}
          />

          <button onClick={calcular} className={styles.btnPrimary}>
            Calcular
          </button>
        </div>

        <div className={styles.resultsPanel}>
          {resultado && (
            <ResultCard
              title="Capital Final"
              value={resultado}
              variant="highlight"
              icon="💰"
              description="Resultado después de 1 año"
            />
          )}
        </div>
      </div>

      <EducationalSection
        title="¿Quieres aprender más sobre inversiones?"
        subtitle="Descubre estrategias y conceptos clave"
      >
        <section>
          <h2>Conceptos Básicos</h2>
          <p>Contenido educativo aquí...</p>
        </section>
      </EducationalSection>

      <Footer appName="mi-calculadora" />
    </div>
  );
}
```

---

## ✅ Checklist de Uso en Nueva App

Al crear una nueva aplicación, asegúrate de:

- [ ] Importar `<MeskeiaLogo />` al inicio
- [ ] Usar `<NumberInput />` para todos los inputs numéricos
- [ ] Usar `<ResultCard />` para mostrar resultados
- [ ] Usar funciones de `lib/formatters` para formato español
- [ ] Incluir `<EducationalSection />` si la app es educativa
- [ ] Incluir `<Footer appName="..." />` al final
- [ ] Verificar dark mode en todos los componentes

---

## 🎨 Paleta de Colores (ya en globals.css)

Los componentes usan automáticamente las variables CSS de meskeIA:

```css
--primary: #2E86AB      /* Azul meskeIA */
--secondary: #48A9A6    /* Teal meskeIA */
--accent: #7FB3D3       /* Azul claro */
--bg-primary: #FAFAFA   /* Background principal */
--bg-card: #FFFFFF      /* Cards */
--text-primary: #1A1A1A /* Texto principal */
--text-secondary: #666  /* Texto secundario */
```

**No es necesario redefinirlas** - están en `app/globals.css`.

---

## 📝 Notas Importantes

1. **Dark Mode:** Todos los componentes soportan dark mode automáticamente via `[data-theme='dark']`

2. **Responsive:** Todos los componentes son responsive (móvil, tablet, desktop)

3. **Accesibilidad:** Todos incluyen ARIA labels y semántica HTML correcta

4. **TypeScript:** Todos los componentes tienen tipos estrictos

5. **CSS Modules:** Cada componente tiene su propio .module.css (sin conflictos)

---

**Creado:** 2025-11-25
**Última actualización:** 2025-11-25
**Versión:** 1.0.0
