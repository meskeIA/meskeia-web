# ✅ Checklist de Migración Final - meskeIA Next.js

## 📋 Guía Completa para Migrar Apps de meskeia-web a meskeia-web-nextjs

---

## 🎯 PRE-REQUISITOS (Solo primera vez)

### Antes de migrar CUALQUIER app adicional:

- [ ] ✅ **Infraestructura consolidada y CONGELADA**
- [ ] ✅ Error boundaries implementados
- [ ] ✅ Loading states implementados
- [ ] ✅ Schema.org template creado
- [ ] ✅ Accesibilidad validada en apps piloto
- [ ] ✅ Offline fallback implementado
- [ ] ✅ Theme-color dinámico implementado
- [ ] ✅ Protocolo validado en 3 apps existentes

**⚠️ CRÍTICO**: NO migrar más apps hasta que TODOS los items anteriores estén ✅

---

## 📱 MIGRACIÓN DE APLICACIÓN INDIVIDUAL

### FASE 1: Preparación (5 min)

#### 1.1. Análisis de la App Original
```bash
# Abrir app original en meskeia-web
cd "C:\Users\jaceb\meskeia-web\[nombre-app]"

# Revisar archivos:
- [ ] index.html (lógica funcional)
- [ ] Archivos CSS (estilos personalizados)
- [ ] JavaScript (funcionalidad)
- [ ] Datos estáticos (si tiene JSON, CSV, etc)
```

#### 1.2. Información para Metadata
- [ ] Anotar **título** de la app
- [ ] Anotar **descripción** (1-2 líneas)
- [ ] Anotar **keywords** principales (5-10)
- [ ] Identificar **categoría** de Schema.org (WebApplication, SoftwareApplication, etc)
- [ ] Listar **características principales** (para Schema.org featureList)

---

### FASE 2: Creación de Estructura (5 min)

#### 2.1. Crear Carpeta de App
```bash
cd "C:\Users\jaceb\meskeia-web-nextjs\app"
mkdir [nombre-app]
cd [nombre-app]
```

#### 2.2. Crear Archivos Base
```bash
# Crear archivos obligatorios:
touch page.tsx
touch metadata.ts
touch [NombreApp].module.css

# Crear opcionales (si necesario):
touch error.tsx      # Solo si necesita error handling específico
touch loading.tsx    # Solo si necesita loading personalizado
```

---

### FASE 3: Implementación de Metadata (10 min)

#### 3.1. Archivo metadata.ts

**Template base**:
```typescript
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '[Título de la App] - [Descripción corta] | meskeIA',
  description: '[Descripción completa de 150-160 caracteres para SEO]',
  keywords: [
    'keyword1',
    'keyword2',
    'keyword3',
    // 5-10 keywords relevantes
  ],
  authors: [{ name: 'meskeIA' }],
  openGraph: {
    type: 'website',
    title: '[Título de la App] - meskeIA',
    description: '[Descripción de 2-3 líneas]',
    url: 'https://meskeia.com/[nombre-app]/',
    siteName: 'meskeIA',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: '[Título de la App] - meskeIA',
    description: '[Descripción breve]',
  },
  alternates: {
    canonical: 'https://meskeia.com/[nombre-app]/',
  },
};

// Schema.org JSON-LD
export const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication', // O 'SoftwareApplication'
  name: '[Nombre de la App]',
  description: '[Descripción completa de la funcionalidad]',
  url: 'https://meskeia.com/[nombre-app]/',
  applicationCategory: 'UtilityApplication', // O BusinessApplication, FinanceApplication, etc
  operatingSystem: 'Web Browser',
  inLanguage: 'es-ES',
  author: {
    '@type': 'Organization',
    name: 'meskeIA',
    url: 'https://meskeia.com',
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
  },
  featureList: [
    'Característica 1',
    'Característica 2',
    'Característica 3',
    // Lista de características principales
  ],
  // Campos adicionales según tipo de app:
  aggregateRating: { // Si aplica
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '150',
  },
};
```

**Checklist de Metadata**:
- [ ] Title optimizado (60-70 caracteres)
- [ ] Description optimizada (150-160 caracteres)
- [ ] Keywords relevantes (5-10)
- [ ] Open Graph completo
- [ ] Twitter Card completo
- [ ] Canonical URL correcto
- [ ] Schema.org con tipo correcto
- [ ] featureList con características reales

---

### FASE 4: Migración del Código (15 min)

#### 4.1. Archivo page.tsx

**Template base**:
```typescript
'use client';

import { useState, useEffect } from 'react';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui';
import { jsonLd } from './metadata';
import styles from './[NombreApp].module.css';

export default function [NombreApp]() {
  // 1. Estados
  const [estado1, setEstado1] = useState(valorInicial);

  // 2. Cargar preferencias desde localStorage
  useEffect(() => {
    const prefs = localStorage.getItem('meskeia-[nombre-app]-prefs');
    if (prefs) {
      try {
        const datos = JSON.parse(prefs);
        // Aplicar preferencias
      } catch (e) {
        console.error('Error al cargar preferencias:', e);
      }
    }
  }, []);

  // 3. Guardar preferencias
  useEffect(() => {
    const prefs = { /* datos a guardar */ };
    localStorage.setItem('meskeia-[nombre-app]-prefs', JSON.stringify(prefs));
  }, [/* dependencias */]);

  // 4. Funciones de lógica
  const funcionPrincipal = () => {
    // Lógica migrada de la app original
  };

  // 5. Formateo español (si aplica)
  const formatearNumero = (valor: number) => {
    return valor.toLocaleString('es-ES');
  };

  const formatearMoneda = (valor: number) => {
    return valor.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR',
    });
  };

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Analytics v2.1 */}
      <AnalyticsTracker applicationName="[nombre-app]" />

      {/* Logo meskeIA */}
      <MeskeiaLogo />

      <div className="container-md">
        <div className={styles.container}>
          {/* Header */}
          <header className={styles.header}>
            <h1 className="text-2xl text-lg-3xl text-center mb-sm">
              [Icono] [Título]
            </h1>
            <p className={`${styles.subtitle} text-center`}>
              [Subtítulo]
            </p>
          </header>

          {/* Contenido de la app */}
          {/* ... */}

        </div>

        {/* Secciones educativas (opcional pero recomendado) */}
        <div className={styles.eduSection}>
          <h2>¿Cómo usar [Nombre de la App]?</h2>
          {/* Contenido educativo */}
        </div>
      </div>

      {/* Footer meskeIA Unificado */}
      <Footer appName="[Nombre de la App] - meskeIA" />
    </>
  );
}
```

**Checklist de Código**:
- [ ] 'use client' al inicio (si usa hooks)
- [ ] Imports correctos
- [ ] Schema.org JSON-LD incluido
- [ ] AnalyticsTracker con nombre correcto
- [ ] MeskeiaLogo incluido
- [ ] Lógica funcional migrada y funciona
- [ ] LocalStorage para preferencias
- [ ] Formato español (números, fechas, moneda)
- [ ] Footer al final
- [ ] Responsive (clases utility CSS)

---

### FASE 5: Estilos CSS (10 min)

#### 5.1. Archivo [NombreApp].module.css

**Template base**:
```css
/* Contenedor principal */
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-xl) var(--spacing-md);
}

/* Header */
.header {
  margin-bottom: var(--spacing-xl);
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  margin-top: var(--spacing-xs);
}

/* Inputs y controles */
.label {
  display: block;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  font-size: 0.95rem;
}

.input,
.select {
  width: 100%;
  padding: var(--spacing-sm);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-family: inherit;
  background: var(--bg-secondary);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.input:focus,
.select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-alpha-10);
}

/* Resultados */
.resultados {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  border: 1px solid var(--border-color);
}

/* Secciones educativas */
.eduSection {
  margin-top: var(--spacing-2xl);
  padding: var(--spacing-xl);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
}

.eduSection h2 {
  color: var(--primary);
  margin-bottom: var(--spacing-md);
  font-size: 1.5rem;
}

.eduSection ul {
  margin: var(--spacing-md) 0;
  padding-left: var(--spacing-lg);
}

.eduSection li {
  margin-bottom: var(--spacing-sm);
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    padding: var(--spacing-lg) var(--spacing-sm);
  }

  .eduSection {
    padding: var(--spacing-md);
  }
}
```

**Checklist de Estilos**:
- [ ] Usa variables CSS de globals.css
- [ ] Colores del tema (--primary, --text-primary, etc)
- [ ] Espaciados con variables (--spacing-*)
- [ ] Border radius con variables (--radius-*)
- [ ] Responsive con media queries
- [ ] Dark mode automático (vía variables CSS)
- [ ] Transiciones suaves
- [ ] Focus states accesibles

---

### FASE 6: Error Boundaries y Loading (Opcional)

#### 6.1. error.tsx (Solo si necesario)

```typescript
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Error en [nombre-app]:', error);
  }, [error]);

  return (
    <>
      <MeskeiaLogo />
      <div className="container-md" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>
          ⚠️ Algo salió mal
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Ha ocurrido un error al cargar la aplicación.
        </p>
        <Button onClick={reset}>
          🔄 Intentar de nuevo
        </Button>
      </div>
      <Footer appName="[Nombre de la App] - meskeIA" />
    </>
  );
}
```

#### 6.2. loading.tsx (Solo si necesario)

```typescript
import MeskeiaLogo from '@/components/MeskeiaLogo';

export default function Loading() {
  return (
    <>
      <MeskeiaLogo />
      <div className="container-md" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div className="spinner" aria-label="Cargando...">
          {/* Spinner CSS o componente */}
        </div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
          Cargando aplicación...
        </p>
      </div>
    </>
  );
}
```

**Checklist Opcional**:
- [ ] error.tsx solo si la app tiene lógica compleja
- [ ] loading.tsx solo si carga es perceptible
- [ ] Estilos consistentes con diseño meskeIA

---

### FASE 7: Testing Local (10 min)

#### 7.1. Desarrollo
```bash
cd "C:\Users\jaceb\meskeia-web-nextjs"
npm run dev
```

#### 7.2. Pruebas Funcionales
- [ ] ✅ App carga correctamente
- [ ] ✅ Lógica funcional funciona como original
- [ ] ✅ LocalStorage guarda/carga preferencias
- [ ] ✅ Formato español en números/fechas/moneda
- [ ] ✅ Botones y controles responden

#### 7.3. Pruebas de Diseño
- [ ] ✅ Logo meskeIA visible y posicionado
- [ ] ✅ Footer meskeIA visible
- [ ] ✅ Responsive en móvil (DevTools)
- [ ] ✅ Dark mode funciona correctamente
- [ ] ✅ Colores meskeIA aplicados

#### 7.4. Pruebas de Accesibilidad
- [ ] ✅ Navegación completa con teclado (Tab, Enter, Escape)
- [ ] ✅ Focus visible en todos los elementos
- [ ] ✅ Labels asociados a inputs
- [ ] ✅ ARIA labels si necesario
- [ ] ✅ Botón compartir funciona (Footer)

#### 7.5. Pruebas Técnicas
- [ ] ✅ Schema.org JSON-LD en HTML (inspeccionar)
- [ ] ✅ Analytics tracking funciona (Network tab)
- [ ] ✅ Service Worker registrado
- [ ] ✅ PWA installable
- [ ] ✅ Offline mode (activar offline en DevTools)

---

### FASE 8: Build y Deployment (10 min)

#### 8.1. Build de Producción
```bash
cd "C:\Users\jaceb\meskeia-web-nextjs"
npm run build
```

**Checklist de Build**:
- [ ] ✅ Build completa sin errores
- [ ] ✅ Sin warnings críticos
- [ ] ✅ Tamaño de bundle razonable
- [ ] ✅ Static export exitoso

#### 8.2. Testing de Build Local
```bash
npx serve@latest out
```

- [ ] ✅ App funciona en build de producción
- [ ] ✅ Analytics funciona en producción
- [ ] ✅ Service worker funciona

#### 8.3. Deployment a Beta
```bash
# Copiar carpeta out/[nombre-app] a servidor en /beta/
# Método depende de tu setup (FTP, rsync, etc)
```

- [ ] ✅ App accesible en https://meskeia.com/beta/[nombre-app]/
- [ ] ✅ Funcionalidad completa en servidor
- [ ] ✅ Analytics v2.1 registra visitas

---

### FASE 9: Validación SEO (5 min)

#### 9.1. Google Rich Results Test
- [ ] Ir a https://search.google.com/test/rich-results
- [ ] Ingresar URL: https://meskeia.com/beta/[nombre-app]/
- [ ] ✅ Schema.org válido
- [ ] ✅ Sin errores de markup

#### 9.2. Google Search Console
- [ ] Solicitar indexación de nueva URL
- [ ] Verificar que aparece en sitemap.xml
- [ ] ✅ Sin errores de indexación

---

### FASE 10: Documentación (5 min)

#### 10.1. Actualizar Documentación del Proyecto
- [ ] Añadir entrada en README.md (apps migradas)
- [ ] Crear o actualizar archivo de migración específico (opcional)
- [ ] Anotar peculiaridades o desafíos (si hubo)

#### 10.2. Git Commit
```bash
cd "C:\Users\jaceb\meskeia-web-nextjs"
git add .
git commit -m "$(cat <<'EOF'
feat: Migrar [Nombre App] a Next.js

Incluye:
- Lógica funcional completa migrada
- Schema.org JSON-LD optimizado
- Analytics v2.1 integrado
- Accesibilidad validada
- Dark mode funcionando
- PWA compatible

Apps migradas: [N]/84

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
git push
```

---

## 📊 CHECKLIST COMPLETO DE MIGRACIÓN

### ✅ Pre-Migración
- [ ] Infraestructura consolidada
- [ ] Análisis de app original completo
- [ ] Metadata preparada

### ✅ Desarrollo
- [ ] Estructura de carpetas creada
- [ ] metadata.ts completo
- [ ] page.tsx con lógica migrada
- [ ] CSS module con estilos
- [ ] error.tsx y loading.tsx (si necesario)

### ✅ Testing
- [ ] Funcionalidad validada
- [ ] Diseño responsive validado
- [ ] Accesibilidad validada (keyboard + screen reader)
- [ ] Dark mode validado
- [ ] Build de producción exitoso

### ✅ Deployment
- [ ] Deployed a /beta/
- [ ] SEO validado (Rich Results)
- [ ] Indexación solicitada

### ✅ Documentación
- [ ] README.md actualizado
- [ ] Git commit descriptivo
- [ ] Push a repositorio

---

## ⏱️ TIEMPO ESTIMADO POR APP

- **Preparación**: 5 min
- **Estructura**: 5 min
- **Metadata**: 10 min
- **Código**: 15 min
- **Estilos**: 10 min
- **Testing**: 10 min
- **Build**: 10 min
- **SEO**: 5 min
- **Docs**: 5 min

**TOTAL**: ~75 minutos (1h 15min por app)

**Para 81 apps**: ~101 horas (2.5 meses a 1 app/día, o 1 mes a 2-3 apps/día)

---

## 🚨 ERRORES COMUNES A EVITAR

### ❌ Error 1: Olvidar Schema.org JSON-LD
**Síntoma**: Google no muestra rich snippets
**Solución**: Siempre incluir script con jsonLd en page.tsx

### ❌ Error 2: Nombre incorrecto en AnalyticsTracker
**Síntoma**: Analytics no registra visitas
**Solución**: Usar slug exacto de la app (sin mayúsculas, con guiones)

### ❌ Error 3: No usar variables CSS
**Síntoma**: Dark mode no funciona, colores incorrectos
**Solución**: Usar var(--primary), var(--text-primary), etc

### ❌ Error 4: Olvidar formato español
**Síntoma**: Números con coma como miles
**Solución**: Usar toLocaleString('es-ES') siempre

### ❌ Error 5: Build falla por imports incorrectos
**Síntoma**: npm run build da error
**Solución**: Verificar todos los imports usan alias @ correctamente

### ❌ Error 6: Accesibilidad ignorada
**Síntoma**: No se puede navegar con teclado
**Solución**: Probar navegación completa con Tab antes de deployment

---

## 📚 RECURSOS

### Documentación del Proyecto
- `README.md` - Estado general
- `DECISIONES_CONSOLIDACION.md` - Decisiones tomadas
- `DEPLOYMENT_BETA.md` - Guía de deployment
- `MIGRACION_CALCULADORA_PROPINAS.md` - Ejemplo de migración

### Herramientas de Testing
- Google Rich Results Test: https://search.google.com/test/rich-results
- WAVE Accessibility: https://wave.webaim.org/
- Lighthouse (Chrome DevTools)
- NVDA Screen Reader (Windows): https://www.nvaccess.org/

### Referencias Schema.org
- WebApplication: https://schema.org/WebApplication
- SoftwareApplication: https://schema.org/SoftwareApplication
- Tipos de categorías: https://schema.org/applicationCategory

---

**Última actualización**: 2025-01-22
**Versión**: 1.0 Final
**Estado**: ✅ Listo para usar en migraciones masivas
