# Guía de Migración meskeIA → Next.js

## Próximos Pasos Detallados

### PASO 1: Crear Componentes Base

#### Footer Component
Ubicación: components/Footer.tsx
Ver CLAUDE.md REGLA #2, sección 3

#### ShareButton Component  
Función Web Share API + fallback clipboard

#### AnalyticsScript Component
Google Analytics v2.0 (tracking uso + duración + dispositivo)

### PASO 2: Copiar Assets
cp icon_meskeia.png desde meskeia-web/

### PASO 3: Migrar Homepage
Convertir index.html → app/page.tsx

### PASO 4: Migrar Primera App
calculadora-porcentajes/index.html → app/calculadora-porcentajes/page.tsx

### PASO 5: Probar Build
npm run build
Verificar carpeta out/

Consultar README.default.md para más detalles de Next.js
