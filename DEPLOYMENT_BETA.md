# 🚀 Guía de Deployment en /beta/ Subdirectory

Documentación completa para desplegar el proyecto Next.js en el subdirectorio `/beta/` del hosting.

---

## 📋 Resumen

**Objetivo**: Desplegar las apps migradas en `https://meskeia.com/beta/` mientras `meskeia.com` sigue funcionando con la versión antigua.

**Estrategia**: Migración incremental sin downtime

---

## ⚙️ Configuración de next.config.ts

### Configuración Actual (Testing en /beta/)

```typescript
const nextConfig: NextConfig = {
  output: 'export',           // Static Site Generation
  basePath: '/beta',          // ⭐ CRÍTICO para subdirectorio
  trailingSlash: true,        // Compatibilidad Apache
  images: {
    unoptimized: true,        // Sin servidor Node.js
  },
};
```

### Configuración Final (Producción en raíz)

Cuando se complete la migración de las 84 apps, cambiar:

```typescript
basePath: '',  // Cambiar de '/beta' a '' (raíz del dominio)
```

---

## 🔧 Proceso de Build

### 1. Generar archivos estáticos

```bash
cd C:\Users\jaceb\meskeia-web-nextjs
npm run build
```

**Resultado**: Carpeta `out/` con archivos HTML, CSS, JS optimizados

**Tiempo estimado**: ~10 segundos (con Turbopack)

---

### 2. Verificar archivos generados

```bash
ls out/
```

Debe contener:
- ✅ `_next/` - CSS, JavaScript, fuentes
- ✅ `calculadora-propinas/` - App migrada 1
- ✅ `generador-contrasenas/` - App migrada 2
- ✅ `guias/` - 91 guías educativas
- ✅ `index.html` - Página principal
- ✅ `icon.png`, `robots.txt`, `sitemap.xml`

---

## 📤 Subir al Hosting (Webempresa)

### Opción A: FTP/SFTP

1. Conectar a Webempresa vía FTP
2. Navegar a `/public_html/beta/`
3. **Borrar todo el contenido actual** de `/beta/`
4. Subir **TODO el contenido** de `out/` a `/beta/`

**Estructura final en hosting**:
```
/public_html/
├── beta/                    ← Nuevo Next.js
│   ├── _next/              ← CSS, JS (CRÍTICO)
│   ├── calculadora-propinas/
│   ├── generador-contrasenas/
│   ├── guias/
│   ├── index.html
│   └── ...
├── calculadora-propinas/    ← Antigua versión
├── generador-contrasenas/   ← Antigua versión
└── index.html               ← Antigua versión
```

---

### Opción B: Rsync (más rápido)

```bash
rsync -avz --delete out/ usuario@meskeia.com:/public_html/beta/
```

**Ventajas**:
- Solo sube archivos modificados
- Más rápido para updates incrementales

---

## ✅ Verificación Post-Deployment

### 1. Verificar página principal

Abrir: `https://meskeia.com/beta/`

**Verificar**:
- ✅ Estilos CSS se aplican correctamente
- ✅ Logo meskeIA aparece (con círculos concéntricos)
- ✅ Footer aparece (parte inferior derecha)
- ✅ Navegación entre secciones funciona

---

### 2. Verificar apps migradas

**Calculadora de Propinas**: `https://meskeia.com/beta/calculadora-propinas/`

**Verificar**:
- ✅ Logo y footer presentes
- ✅ Funcionalidad completa (cálculos)
- ✅ Dark mode funciona
- ✅ Responsive en móvil

**Generador de Contraseñas**: `https://meskeia.com/beta/generador-contrasenas/`

**Verificar**:
- ✅ Input numérico para longitud (4-64)
- ✅ Botón "Generar Contraseña" grande
- ✅ Contraseñas se generan correctamente
- ✅ Historial funciona

---

### 3. Verificar guías

Abrir: `https://meskeia.com/beta/guias/`

**Verificar**:
- ✅ Lista de guías se muestra
- ✅ Enlaces funcionan
- ✅ Contenido se renderiza

---

## 🐛 Troubleshooting

### Problema: CSS no se carga, página sin estilos

**Causa**: Rutas de CSS incorrectas (falta `basePath`)

**Solución**:
1. Verificar que `basePath: '/beta'` está en `next.config.ts`
2. Regenerar build: `npm run build`
3. Subir de nuevo TODO el contenido de `out/`

---

### Problema: Carpeta `_next/` no existe en hosting

**Causa**: No se subió la carpeta completa

**Solución**:
1. Verificar que `out/_next/` existe localmente
2. Asegurar que FTP sube carpetas ocultas/especiales
3. Subir manualmente `_next/` si es necesario

---

### Problema: 404 en algunas páginas

**Causa**: Trailing slashes faltantes o incorrectos

**Solución**:
- URLs deben terminar con `/`
- Correcto: `https://meskeia.com/beta/calculadora-propinas/`
- Incorrecto: `https://meskeia.com/beta/calculadora-propinas`

---

## 📊 Updates Incrementales

Para actualizar después de migrar más apps:

```bash
# 1. Generar nuevo build
npm run build

# 2. Subir solo lo nuevo (con rsync)
rsync -avz --delete out/ usuario@meskeia.com:/public_html/beta/

# 3. Verificar en navegador
# https://meskeia.com/beta/nueva-app/
```

---

## 🔄 Migración Final a Producción

Cuando las 84 apps estén migradas:

### Paso 1: Cambiar basePath

```typescript
// next.config.ts
basePath: '',  // De '/beta' a '' (raíz)
```

### Paso 2: Rebuild

```bash
npm run build
```

### Paso 3: Backup antigua versión

```bash
# En el hosting
mv /public_html /public_html_backup_old
```

### Paso 4: Deploy a raíz

```bash
# Subir out/ a /public_html/
rsync -avz --delete out/ usuario@meskeia.com:/public_html/
```

### Paso 5: Verificar

- `https://meskeia.com/` (nueva versión)
- `https://meskeia.com/calculadora-propinas/` (nueva versión)
- etc.

### Paso 6: Limpiar /beta/

```bash
# Después de confirmar que todo funciona
rm -rf /public_html/beta/
```

---

## 📝 Notas Importantes

### basePath es CRÍTICO

- ✅ **Con basePath='/beta'**: Assets en `/beta/_next/static/...`
- ❌ **Sin basePath**: Assets en `/_next/static/...` (404 en subdirectorio)

### Regenerar build siempre que cambies basePath

```bash
# Después de cambiar basePath en next.config.ts
npm run build
```

### URLs siempre con trailing slash

Next.js genera URLs con `/` al final por defecto cuando `trailingSlash: true`

---

## 🎯 Checklist de Deployment

```
[ ] Build generado: npm run build
[ ] Carpeta out/ verificada localmente
[ ] Conexión FTP/SFTP establecida
[ ] Carpeta /beta/ limpiada en hosting
[ ] Todo el contenido de out/ subido a /beta/
[ ] Verificado: https://meskeia.com/beta/
[ ] Verificado: https://meskeia.com/beta/calculadora-propinas/
[ ] Verificado: https://meskeia.com/beta/generador-contrasenas/
[ ] Verificado: CSS se carga correctamente
[ ] Verificado: Logo y footer aparecen
[ ] Verificado: Funcionalidades operativas
[ ] Verificado: Responsive en móvil
```

---

**Última actualización**: 22 de noviembre de 2025
**Apps desplegadas**: 2/84
**URL de testing**: https://meskeia.com/beta/
