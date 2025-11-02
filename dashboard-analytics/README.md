# 📊 Dashboard meskeIA Analytics

**Dashboard visual para métricas de uso de aplicaciones web meskeIA**

---

## 🎯 Descripción

Dashboard interactivo que muestra estadísticas en tiempo real del uso de las 82 aplicaciones web de meskeIA, consumiendo datos de la API REST v1.0.

---

## 📁 Estructura de Archivos

```
dashboard-analytics/
├── index.html       # Página principal del dashboard
├── style.css        # Estilos con paleta meskeIA
├── script.js        # Lógica y gráficos con Chart.js
└── README.md        # Este archivo
```

---

## 🚀 Uso

### Opción 1: Abrir localmente
1. Abrir `index.html` en el navegador
2. El dashboard carga datos desde `https://meskeia.com/api/v1/`

### Opción 2: Subir al hosting
1. Subir carpeta completa `dashboard-analytics/` al hosting
2. Acceder desde: `https://meskeia.com/dashboard-analytics/`

---

## 📊 Métricas Incluidas

### 📈 Estadísticas Generales
- **Total de Usos**: Suma de todos los registros
- **Aplicaciones Registradas**: Cantidad de apps con al menos 1 uso
- **Primer Uso**: Fecha del primer registro en la base de datos
- **Último Uso**: Fecha del último registro

### 🏆 Gráficos Visuales

1. **Top 10 Aplicaciones Más Usadas**
   - Gráfico de barras con las apps más populares
   - Ordenadas por número total de usos

2. **Tendencia de Uso (Últimos 30 Días)**
   - Gráfico de línea mostrando usos diarios
   - Permite identificar tendencias temporales

3. **Distribución por Navegador**
   - Gráfico de dona (doughnut) con top 5 navegadores
   - Detecta: Chrome, Firefox, Safari, Edge, Opera

4. **Distribución por Sistema Operativo**
   - Gráfico circular (pie) con top 5 sistemas
   - Detecta: Windows, macOS, Linux, Android, iOS

5. **Distribución por Resolución de Pantalla**
   - Gráfico de barras con top 5 resoluciones
   - Útil para optimizar diseño responsive

### 📋 Tabla de Datos
- **Últimos 50 Registros**: Tabla detallada con información completa
- Campos: ID, Aplicación, Fecha/Hora, Navegador, SO, Resolución

---

## 🎨 Diseño

- ✅ **Paleta meskeIA oficial**: #2E86AB (azul), #48A9A6 (teal)
- ✅ **Logo oficial meskeIA**: Incluido en esquina superior izquierda
- ✅ **Footer oficial**: "© 2025 meskeIA"
- ✅ **Responsive**: Adaptado para móvil y escritorio
- ✅ **Tipografía**: System fonts (Segoe UI, Roboto, Arial)

---

## 🔄 Actualización de Datos

- **Manual**: Botón "Actualizar Datos" en el header
- **Sin auto-refresh**: Los datos NO se actualizan automáticamente
- **Estado en tiempo real**: Indicador visual de carga/éxito/error

---

## 🔌 Conexión con la API

El dashboard consume 3 endpoints de la API REST:

1. **`/aplicaciones.php`** - Estadísticas agregadas por aplicación
2. **`/estadisticas.php?limite=1000`** - Registros para gráficos (últimos 1000)
3. **`/estadisticas.php?limite=50`** - Últimos registros para tabla

**Base URL**: `https://meskeia.com/api/v1/`

---

## 📦 Dependencias

- **Chart.js v4.4.0**: Librería de gráficos (cargada desde CDN)
  ```html
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  ```

- **Sin instalación**: Todo funciona directamente en el navegador

---

## 🔒 Seguridad y Acceso

- **Sin protección por contraseña**: Dashboard accesible directamente
- **Datos anónimos**: Solo muestra estadísticas agregadas
- **CORS habilitado**: API permite peticiones desde cualquier origen
- **Privacidad**: No se muestran IPs ni datos personales

### Opcional: Proteger con Contraseña

Si deseas restringir el acceso, crear archivo `.htaccess` en la carpeta:

```apache
AuthType Basic
AuthName "Dashboard meskeIA Analytics"
AuthUserFile /ruta/absoluta/.htpasswd
Require valid-user
```

Y generar archivo `.htpasswd`:
```bash
htpasswd -c .htpasswd admin
```

---

## 🎯 Casos de Uso

1. **Análisis de Popularidad**: Identificar aplicaciones más usadas
2. **Tendencias Temporales**: Detectar picos de uso por fecha
3. **Optimización Técnica**: Adaptar diseño según navegadores/resoluciones
4. **Toma de Decisiones**: Priorizar mejoras en apps populares
5. **Reportes para IAs**: Proporcionar datos para recomendaciones

---

## 🛠️ Personalización

### Cambiar Colores
Editar variables CSS en `style.css`:
```css
:root {
    --primary: #2E86AB;    /* Azul meskeIA */
    --secondary: #48A9A6;  /* Teal meskeIA */
}
```

### Añadir Nuevos Gráficos
1. Crear canvas en `index.html`
2. Añadir función en `script.js`
3. Llamar desde `cargarDatos()`

### Modificar Límites de Datos
Cambiar parámetros en `script.js`:
```javascript
// Cambiar de 1000 a 500 registros
const estadisticas = await fetch(`${API_BASE_URL}/estadisticas.php?limite=500`)
```

---

## 📊 Formato de Datos

Los datos se reciben en formato JSON desde la API:

```json
{
  "status": "success",
  "resumen": {
    "total_aplicaciones": 12,
    "total_usos_global": 1543
  },
  "data": [
    {
      "aplicacion": "generador-gradientes",
      "total_usos": 450,
      "primer_uso": "15/10/2025 10:00:00",
      "ultimo_uso": "02/11/2025 14:30:00"
    }
  ]
}
```

---

## 🐛 Solución de Problemas

### Error: "No se pueden cargar los datos"
- **Causa**: API no accesible o CORS bloqueado
- **Solución**: Verificar que la API esté funcionando en `https://meskeia.com/api/v1/aplicaciones.php`

### Gráficos no se muestran
- **Causa**: Chart.js no cargó desde CDN
- **Solución**: Verificar conexión a internet o descargar Chart.js localmente

### Datos desactualizados
- **Causa**: Caché del navegador
- **Solución**: Pulsar Ctrl+F5 para forzar recarga completa

---

## 📈 Próximas Mejoras (Opcionales)

- [ ] Exportar datos a CSV/Excel
- [ ] Filtros por rango de fechas personalizados
- [ ] Comparación entre aplicaciones
- [ ] Gráficos de evolución histórica
- [ ] Alertas cuando una app supere X usos
- [ ] Dark mode (tema oscuro)
- [ ] Auto-refresh configurable

---

## 📞 Soporte

Para dudas o problemas:
- **Email**: meskeia24@gmail.com
- **GitHub**: https://github.com/meskeIA/meskeia-web

---

**© 2025 meskeIA - Dashboard Analytics v1.0**
