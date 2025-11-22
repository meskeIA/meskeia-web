# 🚀 Guía de Deployment al Hosting (Beta)

## 📅 Fecha: 2025-01-22

---

## 🎯 Qué Subir al Hosting `/beta/`

### ✅ **ARCHIVOS Y CARPETAS OBLIGATORIOS**

Estos archivos **DEBEN** estar en `meskeia.com/beta/`:

```
meskeia.com/beta/
├── .next/              # Build de Next.js (generado con npm run build)
├── app/                # Toda la aplicación Next.js
├── components/         # Componentes React reutilizables
├── lib/                # Utilidades y helpers
├── public/             # Archivos estáticos públicos
│   ├── icon_meskeia.png
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-48.png
│   ├── icon-192x192.png
│   ├── icon-512x512.png
│   ├── apple-touch-icon.png
│   ├── manifest.json
│   ├── sw.js
│   └── offline.html
├── styles/             # Estilos CSS (si existen módulos adicionales)
├── node_modules/       # ⚠️ Solo SI el hosting NO ejecuta npm install
├── package.json        # Dependencias del proyecto
├── package-lock.json   # Lock file de dependencias
├── next.config.ts      # Configuración de Next.js
└── tsconfig.json       # Configuración de TypeScript
```

---

## ❌ **ARCHIVOS QUE NO DEBEN SUBIRSE**

### 🔒 Confidenciales / Seguridad
```
.env
.env.local
.env.production
.env.development
```

### 📝 Documentación Local
```
docs/                   # Toda la carpeta de documentación
README.md               # Readme del proyecto (no necesario en hosting)
COMPONENTES_UI_README.md
RESPONSIVE_SYSTEM_README.md
SITEMAP_AUTOMATICO_INFO.md
FASE_5_SEO_OPTIMIZACION.md
*.md (excepto si alguno es parte del contenido público)
```

### 🧪 Testing
```
tests/                  # Tests de Playwright
test-results/           # Resultados de tests
playwright.config.ts    # Configuración de testing (si existe)
```

### 🔧 Desarrollo
```
.git/                   # Repositorio Git local
.gitignore
.vscode/                # Configuración de VS Code
.idea/                  # Configuración de IDEs
REORGANIZAR_DOCS.bat    # Scripts de desarrollo
```

### 📦 Cache y Temporales (si existen)
```
.turbo/
.cache/
.eslintcache
```

---

## 🏗️ **PROCESO DE DEPLOYMENT**

### Opción 1: Build + Upload (RECOMENDADO)

**1. En tu PC local:**
```bash
cd "C:\Users\jaceb\meskeia-web-nextjs"

# Generar build de producción
npm run build

# Esto crea la carpeta .next/ optimizada
```

**2. Subir al hosting vía FTP/FileZilla:**
```
Subir SOLO estas carpetas/archivos:
✅ .next/
✅ app/
✅ components/
✅ lib/
✅ public/
✅ package.json
✅ package-lock.json
✅ next.config.ts
✅ tsconfig.json

⚠️ node_modules/ (solo si el hosting NO tiene Node.js)
```

**3. En el hosting (si tiene SSH/terminal):**
```bash
cd /home/tu_usuario/public_html/beta

# Instalar dependencias (si tiene Node.js)
npm install --production

# Iniciar servidor Next.js
npm run start
```

---

### Opción 2: Static Export (Si NO tienes Node.js en hosting)

Si tu hosting **NO soporta Node.js**, usa static export:

**1. Modificar `next.config.ts`:**
```typescript
const nextConfig: NextConfig = {
  output: 'export', // ⭐ Añadir esta línea
  // ... resto de config
};
```

**2. Generar static export:**
```bash
npm run build
```

Esto genera una carpeta `out/` con HTML/CSS/JS estático.

**3. Subir SOLO la carpeta `out/`:**
```
Subir TODO el contenido de out/ a /beta/:
✅ out/_next/
✅ out/calculadora-propinas/
✅ out/generador-contrasenas/
✅ out/calculadora-porcentajes/
✅ out/icon_meskeia.png
✅ out/manifest.json
✅ out/sw.js
✅ out/offline.html
✅ out/index.html (si existe)
```

**NO necesitas:**
- ❌ node_modules/
- ❌ app/, components/, lib/ (ya compilados en out/)
- ❌ package.json
- ❌ Ningún archivo de configuración

---

## 📋 **CHECKLIST DE DEPLOYMENT**

Antes de subir al hosting, verifica:

### Archivos Críticos
- [ ] `.next/` generado con `npm run build` (o `out/` si static export)
- [ ] `public/manifest.json` con URLs correctas
- [ ] `public/sw.js` actualizado
- [ ] Todos los iconos PNG en `public/`

### Configuración
- [ ] `next.config.ts` tiene configuración correcta
- [ ] `package.json` tiene scripts de start
- [ ] URLs en metadata apuntan a `https://meskeia.com/beta/` (no localhost)

### Testing Post-Deployment
- [ ] Abrir `https://meskeia.com/beta/` en navegador
- [ ] Verificar que todas las apps cargan correctamente
- [ ] Probar dark mode (ThemeToggle)
- [ ] Verificar que service worker se registra (DevTools → Application → Service Workers)
- [ ] Probar modo offline (DevTools → Network → Offline)

---

## 🔄 **ACTUALIZACIONES FUTURAS**

Cada vez que migres una nueva app:

**1. En tu PC:**
```bash
# Migrar nueva app según CHECKLIST_MIGRACION_FINAL.md
# Generar nuevo build
npm run build
```

**2. Subir al hosting:**
```
Solo subir archivos modificados:
✅ .next/ (completo, reemplazar todo)
✅ app/nueva-app/ (solo la nueva app)
✅ Cualquier componente/lib modificado
```

**3. Reiniciar servidor (si es Node.js server):**
```bash
# Reiniciar proceso Node.js
pm2 restart meskeia-beta
# O como esté configurado tu hosting
```

---

## ⚠️ **IMPORTANTE: URLs en Producción**

Asegúrate de que todas las URLs en metadata usan el dominio correcto:

**Incorrecto:**
```typescript
url: 'http://localhost:3000/calculadora-propinas/'
```

**Correcto:**
```typescript
url: 'https://meskeia.com/beta/calculadora-propinas/'
```

Esto afecta a:
- Schema.org JSON-LD
- Canonical URLs
- Open Graph URLs
- Sitemap

---

## 📊 **TAMAÑO ESTIMADO DE UPLOAD**

### Static Export (`out/`)
- **Total**: ~15-25 MB por app migrada
- `.next/static/`: ~5-10 MB (chunks de JS/CSS)
- `public/`: ~2-5 MB (imágenes, iconos)
- HTML generado: ~100-500 KB por app

### Node.js Server
- **Total**: ~50-100 MB inicialmente
- `node_modules/`: ~30-50 MB (con --production)
- `.next/`: ~10-20 MB
- Código fuente: ~5-10 MB

---

## 🎯 **RESUMEN RÁPIDO**

### ¿Tienes Node.js en el hosting?

**SÍ** → Subir carpetas de código + ejecutar `npm install && npm run build && npm start`

**NO** → Usar `output: 'export'` en next.config.ts + subir solo carpeta `out/`

---

## 📞 **Soporte del Hosting**

Si tienes dudas sobre capacidades del hosting:

1. ¿Soporta Node.js v18+?
2. ¿Tiene acceso SSH/terminal?
3. ¿Permite ejecutar `npm install`?
4. ¿Tiene gestor de procesos (PM2, Forever)?

Si todas son **NO** → Usa static export (`output: 'export'`)

---

**Última actualización**: 2025-01-22

© 2025 meskeIA - Guía de Deployment
