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

### 🔄 Pendiente (Próximos Pasos)

- [ ] Migrar homepage (index.html → app/page.tsx)
- [ ] Migrar primera app de prueba (Calculadora Porcentajes)
- [ ] Probar build completo y verificar HTML generado
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
**Estado**: Fase 1 completada - Componentes base listos para migración de apps
