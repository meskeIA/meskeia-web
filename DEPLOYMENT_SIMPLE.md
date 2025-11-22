# 🚀 Deployment Simple - Guía Definitiva

## 📅 Fecha: 2025-01-22

---

## ✅ **TU CONFIGURACIÓN (CONFIRMADA)**

**Hosting**: Sin Node.js (shared hosting Apache/Nginx)
**Método**: Static Export (HTML/CSS/JS estático)
**Configuración**: `next.config.ts` ya tiene `output: 'export'` ✅
**Ruta deployment**: `https://meskeia.com/beta/`

---

## 🎯 **PROCESO CADA VEZ QUE MIGRES APPS**

### **PASO 1: Generar Build (EN TU PC)**

```bash
cd "C:\Users\jaceb\meskeia-web-nextjs"

# Generar static export
npm run build
```

**Resultado**: Carpeta `out/` creada con todo compilado.

---

### **PASO 2: Subir al Hosting vía FTP**

**Abrir FileZilla (o tu cliente FTP)**:

```
Conexión:
- Host: ftp.meskeia.com (o el que uses)
- Usuario: tu_usuario
- Contraseña: tu_password

Ruta local (PC):
C:\Users\jaceb\meskeia-web-nextjs\out\beta\

Ruta remota (Hosting):
/public_html/beta/

ACCIÓN: Arrastrar TODO el contenido de out/beta/ a /public_html/beta/
```

**Estructura resultante en hosting**:

```
public_html/
└── beta/
    ├── _next/                     # Carpeta con JS/CSS compilados
    │   ├── static/
    │   │   ├── chunks/
    │   │   └── css/
    │   └── ...
    ├── calculadora-propinas/      # App 1
    │   └── index.html
    ├── generador-contrasenas/     # App 2
    │   └── index.html
    ├── calculadora-porcentajes/   # App 3
    │   └── index.html
    ├── icon_meskeia.png           # Iconos
    ├── icon-16.png
    ├── icon-32.png
    ├── icon-192x192.png
    ├── icon-512x512.png
    ├── apple-touch-icon.png
    ├── manifest.json              # PWA
    ├── sw.js                      # Service Worker
    └── offline.html               # Offline page
```

---

### **PASO 3: Verificar en Navegador**

**Abrir**:
```
https://meskeia.com/beta/calculadora-propinas/
https://meskeia.com/beta/generador-contrasenas/
https://meskeia.com/beta/calculadora-porcentajes/
```

**Verificar**:
- [ ] Apps cargan correctamente
- [ ] Dark mode funciona (botón en esquina inferior derecha)
- [ ] Service Worker se registra (F12 → Application → Service Workers)
- [ ] Offline funciona (F12 → Network → Offline, recargar)

---

## ⚡ **ACTUALIZACIONES FUTURAS**

Cada vez que migres una nueva app:

**1. En tu PC**:
```bash
# Ya migraste la nueva app en app/nueva-app/
npm run build
```

**2. En FTP**:
```
Subir SOLO estas carpetas actualizadas:
✅ out/beta/_next/              # Reemplazar completo (JS/CSS nuevos)
✅ out/beta/nueva-app/          # Nueva app
✅ out/beta/manifest.json       # Si cambió
```

**NO necesitas**:
- ❌ Eliminar apps antiguas (siguen funcionando)
- ❌ Reiniciar nada (es HTML estático)
- ❌ Ejecutar comandos en el servidor

---

## 📊 **QUÉ ARCHIVOS SUBIR vs NO SUBIR**

### ✅ **SIEMPRE SUBIR (contenido de out/beta/)**:

```
✅ _next/                        # JS y CSS compilados
✅ calculadora-propinas/         # Cada app migrada
✅ generador-contrasenas/
✅ calculadora-porcentajes/
✅ *.png                         # Iconos
✅ manifest.json                 # PWA
✅ sw.js                         # Service Worker
✅ offline.html                  # Offline page
```

### ❌ **NUNCA SUBIR (NO están en out/, quedan en PC)**:

```
❌ app/                          # Código fuente Next.js
❌ components/                   # Componentes React
❌ lib/                          # Utilidades
❌ node_modules/                 # Dependencias
❌ tests/                        # Tests Playwright
❌ docs/                         # Documentación
❌ .git/                         # Repositorio Git
❌ .env                          # Variables de entorno
❌ package.json                  # Config de npm
❌ next.config.ts                # Config de Next.js
❌ tsconfig.json                 # Config de TypeScript
❌ *.md                          # Archivos Markdown
```

**Razón**: Estos archivos son de desarrollo, NO son necesarios en producción.

---

## 🔒 **SEGURIDAD**

### ✅ **Ventajas de Static Export**:

1. **NO hay código fuente en el servidor**
   - Solo HTML/CSS/JS compilado (no legible fácilmente)
   - Nadie puede ver tu lógica original

2. **NO hay dependencias expuestas**
   - No hay `package.json` → Nadie sabe qué librerías usas
   - No hay `node_modules/` → No hay vulnerabilidades de paquetes

3. **NO hay variables de entorno**
   - No hay `.env` en el servidor
   - Todo compilado en build time

4. **NO hay servidor dinámico**
   - Apache solo sirve archivos estáticos
   - No hay proceso Node.js que pueda crashear o hackearse

---

## 🎯 **CHECKLIST DE DEPLOYMENT**

Cada vez que subas al hosting:

### Antes de Subir
- [ ] Ejecutado `npm run build` sin errores
- [ ] Carpeta `out/beta/` existe y tiene contenido
- [ ] Verificado localmente (abrir out/beta/calculadora-propinas/index.html)

### Durante Subida
- [ ] Conectado a FTP correctamente
- [ ] Navegado a `/public_html/beta/`
- [ ] Subido TODO el contenido de `out/beta/`
- [ ] Verificado que archivos se subieron (revisar tamaños)

### Después de Subir
- [ ] Abrir `https://meskeia.com/beta/` en navegador
- [ ] Probar cada app migrada
- [ ] Verificar dark mode
- [ ] Verificar service worker (F12 → Application)
- [ ] Probar modo offline (F12 → Network → Offline)
- [ ] Limpiar caché si algo no funciona (Ctrl+Shift+R)

---

## ⚠️ **TROUBLESHOOTING**

### Problema: "La app no carga, pantalla blanca"

**Solución**:
1. F12 → Console → Ver errores
2. Probablemente error 404 en archivos `_next/`
3. Verificar que subiste la carpeta `_next/` completa
4. Verificar permisos (chmod 755 en carpetas, 644 en archivos)

---

### Problema: "Service Worker no se registra"

**Solución**:
1. F12 → Application → Service Workers
2. Click "Unregister" en SW antiguo
3. Recargar página (Ctrl+Shift+R)
4. Verificar que `sw.js` existe en `/beta/sw.js`

---

### Problema: "Dark mode no funciona"

**Solución**:
1. F12 → Console → Buscar errores de ThemeToggle
2. Limpiar localStorage: `localStorage.clear()`
3. Recargar página
4. Verificar que `_next/static/chunks/` tiene los archivos JS

---

### Problema: "Icons no aparecen"

**Solución**:
1. Verificar que todos los .png están en `/beta/`
2. Verificar que `manifest.json` está en `/beta/manifest.json`
3. Abrir `https://meskeia.com/beta/manifest.json` directamente
4. Verificar permisos de archivos (chmod 644)

---

## 📊 **TAMAÑO ESPERADO DE UPLOAD**

### Por App Migrada:
- **HTML**: ~50-100 KB por app
- **JS compartido** (en `_next/static/`): ~500 KB - 1 MB (solo primera vez)
- **CSS compartido**: ~50-100 KB (solo primera vez)
- **Iconos**: ~500 KB (solo primera vez)

### Total Primera Vez (3 apps):
- **Total**: ~5-10 MB

### Cada App Nueva:
- **Incremental**: ~100-200 KB por app adicional
- (JS/CSS compartidos ya subidos)

---

## 🔄 **WORKFLOW COMPLETO**

### Día a Día (Migrando Apps):

```
1. Migrar app en PC (75 min)
   └─ Seguir CHECKLIST_MIGRACION_FINAL.md

2. Probar localmente
   └─ npm run dev
   └─ http://localhost:3001/nueva-app/

3. Testing Playwright (automático)
   └─ npx playwright test

4. Build para producción
   └─ npm run build

5. Subir a hosting vía FTP
   └─ Arrastrar out/beta/ a /public_html/beta/

6. Verificar en producción
   └─ https://meskeia.com/beta/nueva-app/

7. Git commit + push
   └─ git add . && git commit && git push
```

---

## ✅ **RESUMEN EJECUTIVO**

### **Lo que SÍ haces**:
✅ `npm run build` en tu PC
✅ Subir contenido de `out/beta/` a hosting
✅ Verificar en navegador

### **Lo que NO haces**:
❌ Subir código fuente (`app/`, `components/`)
❌ Ejecutar `npm install` en hosting
❌ Reiniciar servidores
❌ Configurar Node.js en hosting

---

**Esto es TODO lo que necesitas saber para deployment** 🎉

**Siguiente paso**: Migrar Calculadora de Impuestos y probar este proceso completo.

---

© 2025 meskeIA - Deployment Simple y Seguro
