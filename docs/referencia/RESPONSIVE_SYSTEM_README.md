# Sistema Responsive meskeIA Next.js

Sistema completo de diseño responsive con breakpoints, utilidades CSS y hooks de React para todas las aplicaciones.

---

## 🎯 Filosofía: Mobile First

El sistema está diseñado con enfoque **Mobile First**:
- Por defecto, los estilos son para móvil
- Se añaden estilos progresivamente para pantallas más grandes
- Mejor rendimiento en dispositivos móviles

---

## 📐 Breakpoints

### Definición de Breakpoints

```css
--breakpoint-mobile: 480px;   /* Móviles pequeños */
--breakpoint-tablet: 768px;   /* Tablets y móviles grandes */
--breakpoint-desktop: 1024px; /* Escritorio */
--breakpoint-wide: 1280px;    /* Pantallas anchas */
```

### Media Queries

```css
/* Mobile: Por defecto (0-767px) */
/* No requiere media query */

/* Tablet: 768px+ */
@media (min-width: 768px) { }

/* Desktop: 1024px+ */
@media (min-width: 1024px) { }

/* Wide: 1280px+ */
@media (min-width: 1280px) { }
```

---

## 🎨 Variables CSS Disponibles

### Spacing (Espaciado)

```css
--spacing-xs: 0.25rem;   /* 4px */
--spacing-sm: 0.5rem;    /* 8px */
--spacing-md: 1rem;      /* 16px */
--spacing-lg: 1.5rem;    /* 24px */
--spacing-xl: 2rem;      /* 32px */
--spacing-2xl: 3rem;     /* 48px */
--spacing-3xl: 4rem;     /* 64px */
```

**Uso**:
```css
.mi-componente {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}
```

### Typography (Tipografía)

```css
--font-xs: 0.75rem;      /* 12px */
--font-sm: 0.875rem;     /* 14px */
--font-base: 1rem;       /* 16px */
--font-lg: 1.125rem;     /* 18px */
--font-xl: 1.25rem;      /* 20px */
--font-2xl: 1.5rem;      /* 24px */
--font-3xl: 1.875rem;    /* 30px */
--font-4xl: 2.25rem;     /* 36px */
--font-5xl: 3rem;        /* 48px */
```

**Uso**:
```css
h1 {
  font-size: var(--font-3xl);
}

@media (min-width: 768px) {
  h1 {
    font-size: var(--font-4xl);
  }
}
```

### Container Widths

```css
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
--container-xl: 1280px;
```

---

## 🧰 Clases Utilitarias CSS

### Containers

```html
<!-- Container pequeño (640px) -->
<div class="container-sm">
  Contenido limitado a 640px
</div>

<!-- Container mediano (768px) -->
<div class="container-md">
  Contenido limitado a 768px
</div>

<!-- Container grande (1024px) -->
<div class="container-lg">
  Contenido limitado a 1024px
</div>

<!-- Container extra grande (1280px) -->
<div class="container-xl">
  Contenido limitado a 1280px
</div>
```

### Grid System

```html
<!-- Grid básico con gap por defecto -->
<div class="grid grid-cols-3">
  <div>Columna 1</div>
  <div>Columna 2</div>
  <div>Columna 3</div>
</div>

<!-- Grid responsive: 1 col en móvil, 2 en tablet, 3 en desktop -->
<div class="grid grid-cols-1 grid-cols-md-2 grid-cols-lg-3">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>

<!-- Grid con gap personalizado -->
<div class="grid grid-cols-2 gap-lg">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

**Clases disponibles**:
- `.grid-cols-1` a `.grid-cols-4`
- `.grid-cols-md-1` a `.grid-cols-md-4` (tablet+)
- `.grid-cols-lg-1` a `.grid-cols-lg-4` (desktop+)

### Flexbox

```html
<!-- Flex básico -->
<div class="flex items-center justify-between">
  <div>Izquierda</div>
  <div>Derecha</div>
</div>

<!-- Flex columna con gap -->
<div class="flex flex-col gap-md">
  <div>Item 1</div>
  <div>Item 2</div>
</div>

<!-- Flex centrado -->
<div class="flex items-center justify-center">
  <button>Botón centrado</button>
</div>
```

**Clases disponibles**:
- **Layout**: `.flex`, `.flex-col`, `.flex-row`
- **Align**: `.items-center`, `.items-start`, `.items-end`
- **Justify**: `.justify-center`, `.justify-between`, `.justify-around`
- **Gap**: `.gap-xs`, `.gap-sm`, `.gap-md`, `.gap-lg`, `.gap-xl`

### Spacing (Margin y Padding)

```html
<!-- Margin -->
<div class="m-md">Margin 1rem en todos los lados</div>
<div class="mt-lg">Margin-top 1.5rem</div>
<div class="mb-xl">Margin-bottom 2rem</div>

<!-- Padding -->
<div class="p-lg">Padding 1.5rem en todos los lados</div>
<div class="p-0">Sin padding</div>
```

**Clases disponibles**:
- **Margin**: `.m-{size}`, `.mt-{size}`, `.mb-{size}`
- **Padding**: `.p-{size}`
- **Sizes**: `0`, `xs`, `sm`, `md`, `lg`, `xl`

### Typography

```html
<!-- Tamaño de fuente -->
<p class="text-sm">Texto pequeño (14px)</p>
<p class="text-base">Texto normal (16px)</p>
<h1 class="text-3xl">Título grande (30px)</h1>

<!-- Alineación -->
<p class="text-center">Texto centrado</p>
<p class="text-left">Texto izquierda</p>
<p class="text-right">Texto derecha</p>

<!-- Alineación responsive -->
<p class="text-center text-md-left">
  Centrado en móvil, izquierda en tablet+
</p>

<!-- Peso de fuente -->
<p class="font-normal">Normal (400)</p>
<p class="font-medium">Medio (500)</p>
<p class="font-semibold">Semi-negrita (600)</p>
<p class="font-bold">Negrita (700)</p>
```

### Display

```html
<!-- Ocultar/mostrar -->
<div class="hidden">Oculto en todos los tamaños</div>
<div class="block">Visible en todos los tamaños</div>

<!-- Ocultar en móvil, mostrar en tablet+ -->
<div class="hidden-mobile block-md">
  Visible solo en tablet y desktop
</div>

<!-- Mostrar solo en desktop -->
<div class="hidden block-lg">
  Visible solo en desktop
</div>

<!-- Inline-block -->
<span class="inline-block">Elemento inline-block</span>
```

### Width

```html
<!-- Ancho completo -->
<div class="w-full">100% de ancho</div>

<!-- Ancho automático -->
<div class="w-auto">Ancho automático</div>

<!-- Máximo ancho completo -->
<img src="..." class="max-w-full" />
```

---

## ⚛️ Hooks de React

### useMediaQuery

Hook genérico para cualquier media query:

```tsx
import { useMediaQuery } from '@/hooks/useMediaQuery';

function MiComponente() {
  const esMovil = useMediaQuery('(max-width: 767px)');
  const esTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');

  return (
    <div>
      {esMovil && <p>Vista móvil</p>}
      {esTablet && <p>Vista tablet</p>}
    </div>
  );
}
```

### Hooks Predefinidos

```tsx
import {
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useIsWide,
  useBreakpoint
} from '@/hooks/useMediaQuery';

function AppResponsive() {
  const isMobile = useIsMobile();      // true si max-width: 767px
  const isTablet = useIsTablet();      // true si 768px-1023px
  const isDesktop = useIsDesktop();    // true si min-width: 1024px
  const isWide = useIsWide();          // true si min-width: 1280px

  const breakpoint = useBreakpoint();  // 'mobile' | 'tablet' | 'desktop' | 'wide'

  return (
    <div>
      <h1>Dispositivo actual: {breakpoint}</h1>

      {isMobile && (
        <nav>Menú hamburguesa</nav>
      )}

      {isDesktop && (
        <nav>Menú horizontal completo</nav>
      )}
    </div>
  );
}
```

---

## 📚 Constantes TypeScript

Para usar breakpoints en lógica TypeScript:

```tsx
import { BREAKPOINTS, MEDIA_QUERIES, SPACING, FONT_SIZES } from '@/lib/breakpoints';

// Breakpoints numéricos
console.log(BREAKPOINTS.tablet); // 768

// Media queries preformateadas
const query = MEDIA_QUERIES.minTablet; // '(min-width: 768px)'

// Spacing
const padding = SPACING.md; // '1rem'

// Font sizes
const fontSize = FONT_SIZES['2xl']; // '1.5rem'
```

---

## 💡 Ejemplos Prácticos

### Ejemplo 1: Card Responsive

```tsx
import { Card, CardBody } from '@/components/ui';

export default function ProductCard() {
  return (
    <Card className="p-md p-md-lg p-lg-xl">
      <CardBody>
        <h3 className="text-lg text-md-xl text-lg-2xl">
          Producto
        </h3>
        <p className="text-sm text-md-base">
          Descripción del producto...
        </p>
      </CardBody>
    </Card>
  );
}
```

### Ejemplo 2: Layout con Grid

```html
<div class="container-lg">
  <div class="grid grid-cols-1 grid-cols-md-2 grid-cols-lg-3 gap-md gap-md-lg">
    <div>Card 1</div>
    <div>Card 2</div>
    <div>Card 3</div>
    <div>Card 4</div>
    <div>Card 5</div>
    <div>Card 6</div>
  </div>
</div>
```

**Resultado**:
- **Móvil**: 1 columna, gap 16px
- **Tablet**: 2 columnas, gap 24px
- **Desktop**: 3 columnas, gap 24px

### Ejemplo 3: Navegación Condicional

```tsx
import { useIsMobile } from '@/hooks/useMediaQuery';
import { Button } from '@/components/ui';

export default function Navigation() {
  const isMobile = useIsMobile();

  return (
    <nav className="flex items-center justify-between p-md">
      <div className="text-xl font-bold">meskeIA</div>

      {isMobile ? (
        <Button variant="ghost">☰</Button>
      ) : (
        <div className="flex gap-md">
          <a href="/herramientas">Herramientas</a>
          <a href="/guias">Guías</a>
          <a href="/contacto">Contacto</a>
        </div>
      )}
    </nav>
  );
}
```

### Ejemplo 4: Formulario Responsive

```tsx
import { Input, Button } from '@/components/ui';

export default function ContactForm() {
  return (
    <form className="container-md">
      <div className="grid grid-cols-1 grid-cols-md-2 gap-md">
        <Input label="Nombre" fullWidth />
        <Input label="Apellido" fullWidth />
      </div>

      <Input
        label="Correo electrónico"
        type="email"
        fullWidth
        className="mt-md"
      />

      <Button fullWidth className="mt-lg">
        Enviar
      </Button>
    </form>
  );
}
```

---

## 🎨 Combinando con CSS Modules

Puedes combinar las utilidades con CSS Modules:

```tsx
// MiComponente.tsx
import styles from './MiComponente.module.css';

export default function MiComponente() {
  return (
    <div className={`${styles.customCard} p-md`}>
      <h2 className="text-2xl mb-md">Título</h2>
      <p className="text-base">Contenido...</p>
    </div>
  );
}
```

```css
/* MiComponente.module.css */
.customCard {
  background: var(--bg-card);
  border-radius: var(--radius);
}

@media (min-width: 768px) {
  .customCard {
    box-shadow: var(--shadow-medium);
  }
}
```

---

## ✅ Mejores Prácticas

### 1. Mobile First

```css
/* ✅ Correcto - Mobile first */
.elemento {
  font-size: var(--font-base);
}

@media (min-width: 768px) {
  .elemento {
    font-size: var(--font-lg);
  }
}

/* ❌ Incorrecto - Desktop first */
.elemento {
  font-size: var(--font-lg);
}

@media (max-width: 767px) {
  .elemento {
    font-size: var(--font-base);
  }
}
```

### 2. Usar Variables CSS

```css
/* ✅ Correcto */
.card {
  padding: var(--spacing-md);
  font-size: var(--font-base);
}

/* ❌ Incorrecto */
.card {
  padding: 16px;
  font-size: 16px;
}
```

### 3. Aprovechar Clases Utilitarias

```tsx
/* ✅ Correcto - Usar utilidades para casos simples */
<div className="flex items-center gap-md p-lg">
  <img src="..." />
  <span className="text-lg">Título</span>
</div>

/* ❌ Incorrecto - Crear CSS para casos triviales */
<div className={styles.container}>
  <img src="..." className={styles.image} />
  <span className={styles.title}>Título</span>
</div>
```

### 4. Hooks para Lógica Condicional

```tsx
/* ✅ Correcto - Usar hooks para cambios significativos */
const isMobile = useIsMobile();

return (
  <div>
    {isMobile ? <MobileMenu /> : <DesktopMenu />}
  </div>
);

/* ❌ Incorrecto - CSS para componentes diferentes */
<div>
  <MobileMenu className="block-mobile hidden-md" />
  <DesktopMenu className="hidden-mobile block-md" />
</div>
```

---

## 📊 Testing Responsive

### En Navegador

1. Abrir DevTools (F12)
2. Activar modo responsive (Ctrl+Shift+M)
3. Probar breakpoints:
   - 375px (móvil pequeño)
   - 768px (tablet)
   - 1024px (desktop)
   - 1280px (wide)

### En Código

```tsx
// Ejemplo de test con hooks
import { renderHook } from '@testing-library/react';
import { useIsMobile } from '@/hooks/useMediaQuery';

test('detecta móvil correctamente', () => {
  // Mock window.matchMedia
  global.matchMedia = jest.fn().mockImplementation(query => ({
    matches: query === '(max-width: 767px)',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));

  const { result } = renderHook(() => useIsMobile());
  expect(result.current).toBe(true);
});
```

---

## 🎯 Beneficios del Sistema

1. **Consistencia**: Todos los breakpoints y espaciados son consistentes
2. **Productividad**: Clases utilitarias reducen código CSS repetitivo
3. **Mantenibilidad**: Cambiar un breakpoint actualiza toda la app
4. **Type-safe**: Constantes TypeScript previenen errores
5. **SSR-safe**: Hooks previenen errores de hidratación
6. **Performance**: Mobile first optimiza carga en móviles

---

## 📝 Referencia Rápida

### Breakpoints
- Mobile: 0-767px
- Tablet: 768-1023px
- Desktop: 1024-1279px
- Wide: 1280px+

### Hooks
- `useIsMobile()` - ¿Es móvil?
- `useIsTablet()` - ¿Es tablet?
- `useIsDesktop()` - ¿Es desktop?
- `useBreakpoint()` - Breakpoint actual

### Clases Más Usadas
- Containers: `.container-sm`, `.container-md`, `.container-lg`, `.container-xl`
- Grid: `.grid`, `.grid-cols-{n}`, `.gap-{size}`
- Flex: `.flex`, `.items-center`, `.justify-between`
- Spacing: `.p-{size}`, `.m-{size}`, `.mt-{size}`, `.mb-{size}`
- Typography: `.text-{size}`, `.text-center`, `.font-{weight}`
- Display: `.hidden`, `.block`, `.hidden-mobile`, `.block-md`

---

**Fecha de implementación**: 21 noviembre 2025
**Versión de Next.js**: 16.0.3
**Total de utilidades CSS**: 100+
**Breakpoints**: 4 (mobile, tablet, desktop, wide)
**Ahorro estimado**: 50+ horas en desarrollo responsive
