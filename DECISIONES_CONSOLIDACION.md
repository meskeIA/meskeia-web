# Decisiones de Consolidación Pre-Migración

## 📅 Fecha: 2025-01-22

---

## ✅ IMPLEMENTAR AHORA (Antes de más migraciones)

### 1. Schema.org JSON-LD - **ALTA PRIORIDAD**
- **Motivo**: Alto impacto SEO, Google lo usa para rich snippets
- **Implementación**: Crear template reutilizable por tipo de app
- **Beneficio**: Mejor posicionamiento, rich results en Google

### 2. Error Boundaries - **CRÍTICO**
- **Motivo**: Evita que errores JS rompan toda la app
- **Implementación**: Archivo `error.tsx` global y por app si necesario
- **Beneficio**: Estabilidad, mejor UX en caso de error

### 3. Loading States - **IMPORTANTE**
- **Motivo**: Mejora UX significativamente
- **Implementación**: Archivo `loading.tsx` (built-in Next.js)
- **Beneficio**: Feedback visual instantáneo al usuario

### 4. Keyboard Navigation Review - **ACCESIBILIDAD**
- **Motivo**: Requisito WCAG básico
- **Implementación**: Validar Tab, Enter, Escape en todos los elementos interactivos
- **Beneficio**: Accesibilidad, mejor SEO

### 5. Screen Reader Support Review - **ACCESIBILIDAD**
- **Motivo**: Mejora accesibilidad y SEO
- **Implementación**: Validar labels, roles ARIA, alt texts
- **Beneficio**: Audiencia más amplia, cumplimiento WCAG

### 6. Offline Fallback Minimalista - **COMPLEMENTA PWA**
- **Motivo**: Ya tenemos PWA, añadir página offline básica
- **Implementación**: `offline.html` simple con diseño meskeIA
- **Beneficio**: Mejor experiencia offline completa

### 7. Meta theme-color Dinámico - **CONDICIONAL**
- **Motivo**: Mejora integración móvil (aunque mayoría uso es desktop)
- **Implementación**: Cambiar theme-color según dark/light mode
- **Beneficio**: Experiencia nativa en móviles
- **Decisión**: ✅ IMPLEMENTAR (baja complejidad, alto impacto visual)

### 8. Canonical URL Dinámico - **SEO**
- **Motivo**: Asegurar canonical correcto en cada app
- **Implementación**: Generar automáticamente desde slug
- **Beneficio**: Evitar contenido duplicado en SEO
- **Estado**: ✅ YA IMPLEMENTADO (verificar)

### 9. Favicon Multi-formato - **PWA**
- **Motivo**: Mejora experiencia PWA en diferentes dispositivos
- **Implementación**: apple-touch-icon, favicon.ico, manifest icons
- **Beneficio**: Iconos correctos en iOS, Android, escritorio
- **Estado**: ⚠️ PARCIAL (verificar apple-touch-icon y favicon.ico)

---

## ❌ DESCARTADOS

### 1. Selector de Idioma Propio
- **Motivo**: Innecesario, traducción automática del navegador es suficiente
- **Alternativa**: Meta tags `translate="yes"` ya implementados
- **Beneficio de descartar**: Evita mantener 84 apps × N idiomas

### 2. i18n con next-intl
- **Motivo**: Overhead de complejidad sin beneficio real
- **Alternativa**: Navegador traduce automáticamente
- **Beneficio de descartar**: Código más simple, menos mantenimiento

### 3. Lazy Loading de Imágenes Manual
- **Motivo**: Next.js ya lo hace automáticamente con `<Image>`
- **Nota**: Las apps de meskeIA NO tienen imágenes (excepto logos)
- **Beneficio de descartar**: No añadir complejidad innecesaria

### 4. Preload Crítico
- **Motivo**: Next.js ya optimiza critical path automáticamente
- **Beneficio de descartar**: Overhead de mantenimiento sin beneficio claro

### 5. Analytics Eventos Custom
- **Motivo**: Analytics v2.1 ya rastrea uso, duración, dispositivo
- **Decisión usuario**: No considerado necesario
- **Beneficio de descartar**: Simplifica implementación

### 6. Toast Notifications
- **Motivo**: Añade complejidad sin beneficio crítico
- **Decisión usuario**: No considerado necesario
- **Beneficio de descartar**: UX más simple

### 7. Rate Limiting en Analytics
- **Motivo**: Innecesario para apps frontend simples
- **Beneficio de descartar**: No añadir lógica de servidor compleja

---

## ✅ YA IMPLEMENTADO (Verificar funcionamiento)

### 1. Sitemap.xml Automático
- **Estado**: ✅ Implementado en `app/sitemap.ts`
- **Funcionalidad**: Genera automáticamente URLs de apps y guías
- **Acción**: Verificar que incluye apps migradas

### 2. robots.txt
- **Estado**: ✅ Implementado en `app/robots.ts`
- **Funcionalidad**: Allow `/`, disallow `/api/` y `/_next/`
- **Acción**: Verificar si debe incluir reglas para `/beta/` (pendiente decisión)

### 3. PWA Base
- **Estado**: ✅ Implementado
- **Componentes**: manifest.json, service worker (sw.js), iconos
- **Acción**: Complementar con offline.html

### 4. Dark Mode
- **Estado**: ✅ Implementado
- **Componentes**: ThemeProvider, ThemeToggle, estilos CSS
- **Acción**: Añadir theme-color dinámico

### 5. Analytics v2.1
- **Estado**: ✅ Implementado
- **Componentes**: AnalyticsTracker, tracking de duración, dispositivo, recurrencia
- **Acción**: Mantener sin cambios

### 6. Favicon Básico
- **Estado**: ✅ Implementado (icon_meskeia.png, iconos PWA)
- **Acción**: Añadir apple-touch-icon y favicon.ico

---

## 🎯 PLAN DE TRABAJO

### Semana 1: Consolidación (7 días)

#### **DÍA 1-2**: Infraestructura Crítica
- [ ] Error boundaries (error.tsx global)
- [ ] Loading states (loading.tsx global)
- [ ] Schema.org template reutilizable
- [ ] Implementar mejoras en las 3 apps

#### **DÍA 3-4**: Accesibilidad
- [ ] Keyboard navigation review (Tab, Enter, Escape)
- [ ] Screen reader support (ARIA, labels, alt)
- [ ] Probar con NVDA/navegación teclado
- [ ] Documentar checklist accesibilidad

#### **DÍA 5**: Offline y UX
- [ ] Crear offline.html minimalista
- [ ] Implementar theme-color dinámico
- [ ] Actualizar service worker (si necesario)
- [ ] Añadir apple-touch-icon y favicon.ico

#### **DÍA 6**: Testing
- [ ] Testing completo con Playwright (3 apps)
- [ ] Validar accesibilidad (keyboard + screen reader)
- [ ] Validar dark mode
- [ ] Validar PWA offline

#### **DÍA 7**: Documentación
- [ ] Actualizar protocolo de migración FINAL
- [ ] Crear CHECKLIST_MIGRACION_FINAL.md
- [ ] Congelar infraestructura ❄️
- [ ] Preparar para migraciones masivas

---

## 📊 MÉTRICAS DE ÉXITO

### Infraestructura
- ✅ 0 errores sin manejar (error boundaries funcionando)
- ✅ Loading states en todas las transiciones
- ✅ Schema.org válido en Google Rich Results Test

### Accesibilidad
- ✅ 100% navegación por teclado
- ✅ NVDA/JAWS leen toda la interfaz correctamente
- ✅ Score Lighthouse Accessibility > 95

### PWA
- ✅ Offline.html se muestra sin conexión
- ✅ Theme-color cambia según dark/light
- ✅ Iconos correctos en todos los dispositivos

### SEO
- ✅ Sitemap incluye todas las apps
- ✅ Canonical URLs correctos
- ✅ Rich snippets en Google Search Console

---

## 🚀 DESPUÉS DE CONSOLIDACIÓN

### Fase 2: Migraciones Masivas (81 apps restantes)

**Estrategia**:
- ✅ Infraestructura CONGELADA (no tocar)
- ✅ Migración manual/semi-automática (20-30 min/app)
- ✅ Apps prioritarias primero (según Analytics)
- ✅ Validación Playwright de cada app
- ✅ Sin cambios de infraestructura hasta completar todas

**Tiempo estimado**: 27-40 horas totales (1-2 meses a 2-3 apps/día)

---

## 📝 NOTAS ADICIONALES

### Migración Automatizada con Python
- **Decisión**: ❌ NO RECOMENDADO
- **Motivo**: Apps muy heterogéneas, alto riesgo de errores
- **Alternativa**: Migración manual siguiendo protocolo validado

### Problemas Conocidos
- ⚠️ Migración incremental puede romper apps ya migradas
- ⚠️ Cambios en infraestructura afectan a apps ya migradas
- ✅ **SOLUCIÓN**: Congelar infraestructura AHORA antes de más migraciones

### Contexto para Nueva Conversación
Este documento sirve como contexto clave para futuras conversaciones sobre el proyecto.

---

**Última actualización**: 2025-01-22
**Estado**: 🚧 En consolidación
**Apps migradas**: 3/84 (calculadora-propinas, generador-contrasenas, calculadora-porcentajes)
