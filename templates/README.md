# Templates meskeIA

Plantillas reutilizables para acelerar el desarrollo de nuevas apps.

## 📁 Estructura

```
templates/
├── app-base/                      # Plantilla base de aplicación
│   ├── metadata.template.ts       # Metadata SEO
│   ├── page.template.tsx          # Componente principal
│   └── App.module.template.css    # Estilos CSS Module
├── trpc-router.template.ts        # Router tRPC con ejemplos
└── README.md                      # Este archivo
```

---

## 🚀 Uso de Templates

### 1. **Crear nueva app desde template base**

```bash
# 1. Copiar plantilla a nueva carpeta
cp -r templates/app-base app/mi-nueva-app

# 2. Renombrar archivos
cd app/mi-nueva-app
mv page.template.tsx page.tsx
mv metadata.template.ts metadata.ts
mv App.module.template.css MiNuevaApp.module.css

# 3. Reemplazar placeholders en todos los archivos:
# - [NombreApp] → MiNuevaApp
# - [nombre-app] → mi-nueva-app
# - [Título de la App] → Título real
# - [Descripción breve] → Descripción real
```

**Placeholders a reemplazar:**
- `[NombreApp]` - PascalCase (ej: `CalculadoraIva`)
- `[nombre-app]` - kebab-case (ej: `calculadora-iva`)
- `[Título de la App]` - Título visible (ej: `Calculadora de IVA`)
- `[Descripción breve]` - Subtítulo (ej: `Calcula IVA español de forma rápida`)

---

### 2. **Crear nuevo router tRPC**

```bash
# 1. Copiar template
cp templates/trpc-router.template.ts server/routers/mi-router.ts

# 2. Renombrar router
# Cambiar: ejemploRouter → miRouter

# 3. Implementar lógica de negocio en procedures

# 4. Registrar en server/routers/_app.ts:
import { miRouter } from './mi-router';

export const appRouter = router({
  analytics: analyticsRouter,
  miRouter: miRouter,  // ← Añadir aquí
});
```

---

## 📋 Checklist Post-Creación

Después de crear una app desde template:

```
[ ] 1. Reemplazar todos los placeholders
[ ] 2. Añadir entrada en data/applications.ts
      - suites: SuiteType[] (mínimo 1)
      - contexts: MomentType[] (mínimo 1)
[ ] 3. Añadir URL en data/implemented-apps.ts
[ ] 4. Añadir relaciones en data/app-relations.ts
[ ] 5. Actualizar public/ai-index.json
[ ] 6. Implementar lógica de negocio
[ ] 7. Eliminar componentes no usados del template
      (ej: DisclaimerCard si no aplica)
[ ] 8. Verificar build: npm run build
[ ] 9. Commit y push a GitHub
```

---

## 🎨 Componentes Incluidos en Template Base

El template `app-base/page.template.tsx` incluye:

### ✅ Obligatorios (SIEMPRE presentes)
- `<MeskeiaLogo />` - Logo con navegación
- `<LegalNotice />` - Enlaces legales RGPD
- `<RelatedApps />` - Cross-linking entre apps
- `<Footer />` - Footer con analytics

### ⚙️ Opcionales (comentados, descomentar si aplica)
- `<DisclaimerCard />` - Avisos legales (finanzas, salud, fiscal)
- `<EducationalSection />` - Contenido educativo colapsable
- `<NumberInput />` - Input numérico formato español
- `<ResultCard />` - Cards de resultados

---

## 💡 Tips

1. **Usa Find & Replace** en tu editor para reemplazar placeholders de golpe
2. **No omitas DisclaimerCard** en apps financieras/fiscales/salud
3. **Siempre incluye RelatedApps** - mejora SEO y UX
4. **Verifica dark mode** - todos los estilos deben tener variante dark
5. **Ejecuta npm run build** antes de commit - detecta errores TypeScript

---

## 🔗 Referencias

- **Componentes completos**: `components/README.md`
- **Reglas de diseño**: `~/.claude/CLAUDE.md`
- **Arquitectura proyecto**: `CLAUDE.md` (raíz del proyecto)
- **Stack tRPC**: `CLAUDE.md` sección "Stack Tecnológico: tRPC + React Query"

---

**Última actualización**: 2026-02-16
