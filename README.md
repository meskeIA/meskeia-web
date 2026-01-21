# meskeIA - Next.js 16.0.3 Migration Project

Proyecto de migración de 84 aplicaciones web de meskeIA desde HTML estático a Next.js con infraestructura completa pre-implementada.

---

## 📊 Estado Actual del Proyecto

### ✅ Infraestructura Completada (5/5 Sistemas)

- [x] **Dark Mode Global** - Botón flotante, persistencia localStorage
- [x] **Componentes UI Reutilizables** - 6 componentes + Logo + Footer
- [x] **Sistema Responsive** - 4 breakpoints, 100+ utilidades CSS, hooks React
- [x] **PWA** - Manifest, Service Worker, 8 iconos instalados
- [x] **Analytics v2.1** - Page Visibility API, detección PWA, BD actualizada

**Inversión**: 12 horas | **Ahorro proyectado**: 294 horas (ROI: 2350%)

### ✅ Aplicaciones Migradas (2/84)

- [x] **calculadora-propinas** (60 min) - Template con componentes reutilizables
- [x] **generador-contrasenas** (20 min) - Validación de protocolo optimizado

**Próximas**: calculadora-fechas, calculadora-cocina, conversor-divisas

### 🔄 En Progreso

- [ ] Migración masiva de 82 apps restantes (~20-30 min c/u)
- [ ] Optimización de builds estáticos
- [ ] Dashboard Analytics v2.1 (opcional)

---

## 🚀 Comandos Disponibles

### Desarrollo Local
```bash
npm run dev
```
Servidor en http://localhost:3000

### Build para Producción
```bash
npm run build
```
Genera archivos HTML estáticos en `out/`

---

## 📚 Documentación Clave

### Para Migrar Apps
- `MIGRACION_CALCULADORA_PROPINAS.md` - Template paso a paso (checklist de 6 pasos)
- `components/README_COMPONENTES.md` - Uso de componentes base

### Deployment
- `DEPLOYMENT_BETA.md` - Guía completa de deployment en /beta/ subdirectory

### Estado del Proyecto
- `ESTADO_PROYECTO_COMPLETO.md` - Resumen ejecutivo + métricas + ROI

### Referencias Técnicas
- `COMPONENTES_UI_README.md` - Biblioteca de 6 componentes UI
- `RESPONSIVE_SYSTEM_README.md` - Sistema responsive completo
- `DARK_MODE_IMPLEMENTACION.md` - Sistema de temas
- `PWA_ANALYTICS_README.md` - PWA + Analytics v2.1
- `FASE_5_SEO_OPTIMIZACION.md` - SEO y metadata
- `DOCS_INDEX.md` - Índice completo de documentación

---

## 🔧 Modo Mantenimiento con Acceso Privado

El sitio puede estar en modo mantenimiento pero permitir acceso solo al administrador mediante un sistema de token/cookie.

### Cómo funciona

1. **Usuarios normales**: Ven página de "Sitio en mantenimiento" (HTTP 503)
2. **Administrador**: Accede con token secreto, obtiene cookie de 1 año

### Acceder durante mantenimiento

```
https://meskeia.com?access=TU_TOKEN_SECRETO
```

Esto:
- Valida el token
- Guarda cookie `meskeia_access` (1 año)
- Redirige a la home sin el token en la URL
- Las siguientes visitas funcionan normal (la cookie ya está)

### Configuración requerida

**Variable de entorno** (en `.env.local` y Vercel Dashboard):
```
MAINTENANCE_ACCESS_TOKEN=tu-token-secreto-aqui
```

### Desactivar modo mantenimiento

Para volver a web pública:
1. Eliminar archivo `middleware.ts`
2. Commit y push a GitHub
3. Vercel despliega automáticamente

### Archivos relacionados

| Archivo | Descripción |
|---------|-------------|
| `middleware.ts` | Lógica de acceso restringido |
| `maintenance.config.ts` | Config anterior (deprecated) |
| `scripts/maintenance-*.ps1` | Scripts PowerShell (modo anterior) |

---

**Última actualización**: 21 de enero de 2026
**Estado**: Infraestructura 100% + Modo mantenimiento con acceso privado
**Velocidad**: 3x más rápido en segunda app gracias a componentes reutilizables
**Servidor**: http://localhost:3000 (activo)
