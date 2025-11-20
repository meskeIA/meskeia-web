# meskeIA - Next.js Migration Project

Proyecto de migración de meskeIA de HTML estático a Next.js con Static Site Generation (SSG).

---

## 📊 Estado Actual del Proyecto

### ✅ Completado (Fase 1: Componentes Base)

- [x] Proyecto Next.js 14 inicializado con TypeScript
- [x] Configuración para Static Export (`output: 'export'`)
- [x] Compatible con Webempresa (hosting estático)
- [x] Variables CSS globales meskeIA configuradas
- [x] Componente `MeskeiaLogo` creado (fixed top-left)
- [x] Componente `Footer` creado (glassmorphism + share integrado)
- [x] Componente `AnalyticsScript` creado (Google Analytics v2.0)
- [x] Icono meskeIA copiado a `public/`
- [x] Documentación de componentes (`README_COMPONENTES.md`)
- [x] Estructura de carpetas base establecida

### ✅ Completado (Fase 2: Homepage y Búsqueda)

- [x] Homepage migrada a Next.js con React
- [x] Base de datos completa con 84 aplicaciones
- [x] 12 categorías organizadas
- [x] Grid responsive con toggle de categorías
- [x] Sección de ventajas (6 cards)
- [x] Búsqueda fuzzy con Fuse.js
- [x] Atajo de teclado Ctrl+K
- [x] Navegación con flechas y Enter
- [x] Diseño modal overlay responsive

### 🔄 Pendiente (Próximos Pasos)

- [ ] Migrar primera app de prueba (Calculadora Porcentajes)
- [ ] Probar build completo y verificar HTML generado
- [ ] Optimizar metadata y SEO
- [ ] Migrar las 84 apps restantes

---

## 🚀 Comandos Disponibles

### Desarrollo Local
```bash
npm run dev
```
Inicia servidor de desarrollo en http://localhost:3000

### Build para Producción
```bash
npm run build
```
Genera archivos HTML estáticos en la carpeta `out/`

---

## 📚 Documentación Completa

Ver documentación detallada en:
- `MIGRATION_GUIDE.md` - Guía paso a paso de migración
- `C:\Users\jaceb\CLAUDE.md` - Reglas de diseño meskeIA

---

**Última actualización**: 20 de noviembre de 2025
**Estado**: Fase 2 completada - Homepage funcional con búsqueda avanzada
**Servidor**: http://localhost:3000 (activo)
