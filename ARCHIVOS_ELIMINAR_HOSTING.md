# 🗑️ Archivos a Eliminar del Hosting

## 📅 Fecha: 2025-01-22

---

## ⚠️ **IMPORTANTE**

Actualmente tienes en el hosting **TODO el contenido** del proyecto, incluyendo código fuente y documentación.

**DEBES eliminar** todos estos archivos **EXCEPTO** el contenido de la carpeta `out/beta/`.

---

## 📋 **ARCHIVOS Y CARPETAS A ELIMINAR**

### ❌ **Código Fuente (NO debe estar en hosting)**

```
/beta/app/                          # Código fuente Next.js
/beta/components/                   # Componentes React
/beta/lib/                          # Utilidades y helpers
/beta/styles/                       # Estilos fuente (si existe)
```

### ❌ **Dependencias (NO debe estar en hosting)**

```
/beta/node_modules/                 # Dependencias npm (CRÍTICO - eliminar)
/beta/package.json                  # Config npm
/beta/package-lock.json             # Lock file npm
```

### ❌ **Configuración de Desarrollo (NO debe estar en hosting)**

```
/beta/next.config.ts                # Config Next.js
/beta/tsconfig.json                 # Config TypeScript
/beta/.gitignore                    # Git ignore
/beta/.git/                         # Repositorio Git completo
/beta/.vscode/                      # Config VS Code
/beta/.next/                        # Build cache (si lo subiste sin querer)
```

### ❌ **Testing (NO debe estar en hosting)**

```
/beta/tests/                        # Tests Playwright
/beta/test-results/                 # Resultados tests
/beta/playwright.config.ts          # Config Playwright (si existe)
```

### ❌ **Documentación (NO debe estar en hosting)**

```
/beta/docs/                         # Toda la carpeta docs/
/beta/*.md                          # Todos los archivos Markdown
/beta/README.md
/beta/DEPLOYMENT_SIMPLE.md
/beta/GUIA_HOSTING_BETA.md
/beta/ESTRATEGIA_MIGRACION_CATEGORIAS.md
/beta/RESUMEN_PREPARACION_MIGRACIONES.md
/beta/COMPONENTES_UI_README.md
/beta/RESPONSIVE_SYSTEM_README.md
/beta/FASE_5_SEO_OPTIMIZACION.md
/beta/SITEMAP_AUTOMATICO_INFO.md
```

### ❌ **Scripts y Archivos Temporales (NO debe estar en hosting)**

```
/beta/REORGANIZAR_DOCS.bat
/beta/.env                          # Variables entorno (CRÍTICO si existe)
/beta/.env.local
/beta/.env.production
```

---

## ✅ **ARCHIVOS QUE DEBEN QUEDAR (Solo estos)**

Después de eliminar todo lo anterior, tu carpeta `/beta/` debe contener **SOLO**:

```
/beta/
├── _next/                          # ✅ MANTENER - JS/CSS compilados
│   ├── static/
│   │   ├── chunks/
│   │   └── css/
│   └── ...
├── calculadora-propinas/           # ✅ MANTENER - App 1
│   └── index.html
├── generador-contrasenas/          # ✅ MANTENER - App 2
│   └── index.html
├── calculadora-porcentajes/        # ✅ MANTENER - App 3
│   └── index.html
├── icon_meskeia.png                # ✅ MANTENER - Iconos
├── icon-16.png
├── icon-32.png
├── icon-48.png
├── icon-192x192.png
├── icon-512x512.png
├── apple-touch-icon.png
├── manifest.json                   # ✅ MANTENER - PWA
├── sw.js                           # ✅ MANTENER - Service Worker
└── offline.html                    # ✅ MANTENER - Página offline
```

**Total de archivos**: ~20-30 archivos
**Total de carpetas**: `_next/` + 3 carpetas de apps

---

## 🔍 **CÓMO IDENTIFICAR QUÉ ELIMINAR**

### Método Fácil (vía FTP):

1. **Conecta a FTP** y navega a `/public_html/beta/`

2. **Elimina estas carpetas completas**:
   ```
   ❌ app/
   ❌ components/
   ❌ lib/
   ❌ node_modules/      # ⚠️ PRIORIDAD ALTA
   ❌ tests/
   ❌ docs/
   ❌ .git/
   ❌ .vscode/
   ```

3. **Elimina todos los archivos .md**:
   ```
   ❌ README.md
   ❌ DEPLOYMENT_SIMPLE.md
   ❌ GUIA_HOSTING_BETA.md
   ❌ (todos los demás .md)
   ```

4. **Elimina archivos de configuración**:
   ```
   ❌ package.json
   ❌ package-lock.json
   ❌ next.config.ts
   ❌ tsconfig.json
   ❌ .gitignore
   ❌ .env (si existe)
   ```

5. **Verifica que SOLO queden**:
   ```
   ✅ _next/
   ✅ calculadora-propinas/
   ✅ generador-contrasenas/
   ✅ calculadora-porcentajes/
   ✅ *.png (iconos)
   ✅ manifest.json
   ✅ sw.js
   ✅ offline.html
   ```

---

## ⚠️ **IMPORTANTE: node_modules/**

**SI subiste `node_modules/`**:

- **Tamaño**: ~50-200 MB
- **Archivos**: Miles de archivos
- **Seguridad**: Expone todas las dependencias y versiones
- **Rendimiento**: Consume espacio innecesario

**DEBE eliminarse con MÁXIMA PRIORIDAD** ⚠️

---

## 🚀 **DESPUÉS DE LIMPIAR**

### Verificar Estructura Final:

```bash
# En FTP, navegar a /public_html/beta/
# Debe verse así:

beta/
├── _next/               # Carpeta con subcarpetas
├── calculadora-propinas/
├── generador-contrasenas/
├── calculadora-porcentajes/
├── icon_meskeia.png
├── (otros .png)
├── manifest.json
├── sw.js
└── offline.html

Total: ~20 archivos + carpetas _next y apps
```

### Verificar que Apps Funcionan:

```
https://meskeia.com/beta/calculadora-propinas/
https://meskeia.com/beta/generador-contrasenas/
https://meskeia.com/beta/calculadora-porcentajes/
```

**Si funcionan correctamente → Limpieza exitosa** ✅

---

## 📊 **BENEFICIOS DE LA LIMPIEZA**

### Antes (TODO subido):
```
Tamaño total: ~150-300 MB
Archivos: ~10,000+ archivos (con node_modules/)
Seguridad: ❌ Código fuente expuesto
Riesgo: ❌ Alto (dependencias visibles)
```

### Después (Solo out/beta/):
```
Tamaño total: ~5-15 MB
Archivos: ~100-200 archivos
Seguridad: ✅ Solo build compilado
Riesgo: ✅ Bajo (sin código fuente)
```

**Reducción de ~90-95% en tamaño y archivos** 🎉

---

## 📝 **CHECKLIST DE LIMPIEZA**

### En FTP (/public_html/beta/):

- [ ] Eliminar carpeta `app/`
- [ ] Eliminar carpeta `components/`
- [ ] Eliminar carpeta `lib/`
- [ ] Eliminar carpeta `node_modules/` ⚠️ PRIORIDAD
- [ ] Eliminar carpeta `tests/`
- [ ] Eliminar carpeta `docs/`
- [ ] Eliminar carpeta `.git/`
- [ ] Eliminar todos los archivos `.md`
- [ ] Eliminar `package.json`, `package-lock.json`
- [ ] Eliminar `next.config.ts`, `tsconfig.json`
- [ ] Eliminar `.gitignore`
- [ ] Eliminar `.env` (si existe)

### Verificación Final:

- [ ] Solo quedan: `_next/`, apps, iconos, manifest, sw.js, offline.html
- [ ] Apps funcionan en navegador
- [ ] Service Worker se registra (F12 → Application)
- [ ] Modo offline funciona

---

## 🆘 **SI ALGO FALLA DESPUÉS DE LIMPIAR**

### Apps no cargan (pantalla blanca):

**Causa**: Eliminaste algo de `_next/` o las apps por error

**Solución**:
```bash
# En tu PC
cd "C:\Users\jaceb\meskeia-web-nextjs"
npm run build

# Subir TODO el contenido de out/beta/ nuevamente
```

---

### Service Worker no funciona:

**Solución**:
- Verificar que `sw.js` existe en `/beta/sw.js`
- Verificar que `manifest.json` existe
- Limpiar caché navegador (Ctrl+Shift+R)

---

## ✅ **PRÓXIMO DEPLOYMENT (Después de Limpiar)**

Proceso correcto para futuras actualizaciones:

```bash
# 1. En tu PC - Generar build
npm run build

# 2. Subir SOLO out/beta/ a FTP
# Conectar FTP → Arrastrar contenido de out/beta/ a /public_html/beta/

# 3. Verificar en navegador
# https://meskeia.com/beta/
```

**NUNCA MÁS subir**: Código fuente, node_modules, docs, etc.

---

**¡Después de limpiar, tu hosting estará optimizado!** 🎉

---

© 2025 meskeIA - Guía de Limpieza de Hosting
