# 📡 meskeIA API REST - Documentación

## 🎯 Descripción

API REST para el seguimiento de métricas de uso de las aplicaciones web de meskeIA.

**Versión**: 1.0
**Base URL**: `https://meskeia.com/api/v1/`
**Formato de respuesta**: JSON
**Codificación**: UTF-8

---

## 🗂️ Estructura de Archivos

```
api/
└── v1/
    ├── db-init.php           # Inicializador de base de datos SQLite
    ├── guardar-uso.php       # Endpoint para registrar uso
    ├── estadisticas.php      # Endpoint para consultar estadísticas
    ├── aplicaciones.php      # Endpoint para listar aplicaciones
    ├── meskeia-analytics.db  # Base de datos SQLite (se crea automáticamente)
    └── README_API.md         # Este archivo
```

---

## 📊 Base de Datos

### Tabla: `uso_aplicaciones`

```sql
CREATE TABLE uso_aplicaciones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    aplicacion TEXT NOT NULL,              -- Nombre de la aplicación
    timestamp TEXT NOT NULL,               -- Fecha/hora formato español (DD/MM/YYYY HH:MM:SS)
    navegador TEXT,                        -- Navegador del usuario
    sistema_operativo TEXT,                -- Sistema operativo del usuario
    resolucion TEXT,                       -- Resolución de pantalla
    datos_adicionales TEXT,                -- JSON con datos adicionales
    created_at TEXT DEFAULT (datetime('now', 'localtime'))
);
```

---

## 🔌 Endpoints

### 1. Guardar Uso de Aplicación

**URL**: `/api/v1/guardar-uso.php`
**Método**: `POST`
**Content-Type**: `application/json`

#### Request Body

```json
{
  "aplicacion": "generador-gradientes",
  "navegador": "Chrome 119.0",
  "sistema_operativo": "Windows 10",
  "resolucion": "1920x1080",
  "datos_adicionales": {
    "accion": "exportar_css",
    "colores_usados": 5
  }
}
```

**Campos**:
- `aplicacion` (obligatorio): Nombre de la aplicación
- `navegador` (opcional): Navegador del usuario
- `sistema_operativo` (opcional): Sistema operativo
- `resolucion` (opcional): Resolución de pantalla
- `datos_adicionales` (opcional): Objeto JSON con información adicional

#### Response (201 Created)

```json
{
  "status": "success",
  "message": "Uso registrado correctamente",
  "data": {
    "id": 123,
    "aplicacion": "generador-gradientes",
    "timestamp": "02/11/2025 14:30:00"
  }
}
```

#### Ejemplo de uso (JavaScript)

```javascript
async function registrarUso(nombreApp) {
    const datos = {
        aplicacion: nombreApp,
        navegador: navigator.userAgent,
        sistema_operativo: navigator.platform,
        resolucion: `${window.screen.width}x${window.screen.height}`
    };

    try {
        const response = await fetch('https://meskeia.com/api/v1/guardar-uso.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datos)
        });

        const resultado = await response.json();
        console.log('Uso registrado:', resultado);
    } catch (error) {
        console.error('Error al registrar uso:', error);
    }
}

// Llamar al cargar la página
registrarUso('generador-gradientes');
```

---

### 2. Consultar Estadísticas

**URL**: `/api/v1/estadisticas.php`
**Método**: `GET`

#### Parámetros Query String (todos opcionales)

- `aplicacion`: Filtrar por nombre de aplicación
- `desde`: Fecha inicio (formato: DD/MM/YYYY)
- `hasta`: Fecha fin (formato: DD/MM/YYYY)
- `limite`: Número máximo de registros (default: 100)

#### Ejemplos de URLs

```
https://meskeia.com/api/v1/estadisticas.php
https://meskeia.com/api/v1/estadisticas.php?aplicacion=generador-gradientes
https://meskeia.com/api/v1/estadisticas.php?desde=01/11/2025&hasta=30/11/2025
https://meskeia.com/api/v1/estadisticas.php?limite=50
```

#### Response (200 OK)

```json
{
  "status": "success",
  "filtros": {
    "aplicacion": "generador-gradientes",
    "desde": null,
    "hasta": null,
    "limite": 100
  },
  "estadisticas": {
    "total_usos": 245,
    "total_aplicaciones": 1,
    "primer_uso": "01/11/2025 08:30:00",
    "ultimo_uso": "02/11/2025 14:30:00"
  },
  "registros_mostrados": 100,
  "data": [
    {
      "id": 245,
      "aplicacion": "generador-gradientes",
      "timestamp": "02/11/2025 14:30:00",
      "navegador": "Chrome 119.0",
      "sistema_operativo": "Windows 10",
      "resolucion": "1920x1080",
      "datos_adicionales": {
        "accion": "exportar_css"
      },
      "created_at": "2025-11-02 14:30:00"
    }
  ]
}
```

#### Ejemplo de uso (JavaScript)

```javascript
async function obtenerEstadisticas(nombreApp) {
    try {
        const url = `https://meskeia.com/api/v1/estadisticas.php?aplicacion=${nombreApp}&limite=10`;
        const response = await fetch(url);
        const datos = await response.json();

        console.log(`Total de usos: ${datos.estadisticas.total_usos}`);
        console.log('Últimos registros:', datos.data);
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
    }
}

obtenerEstadisticas('generador-gradientes');
```

---

### 3. Listar Aplicaciones

**URL**: `/api/v1/aplicaciones.php`
**Método**: `GET`

#### Response (200 OK)

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
      "ultimo_uso": "02/11/2025 14:30:00",
      "navegadores_diferentes": 5,
      "sistemas_operativos_diferentes": 3
    },
    {
      "aplicacion": "calculadora-aspectos",
      "total_usos": 320,
      "primer_uso": "20/10/2025 09:15:00",
      "ultimo_uso": "02/11/2025 12:00:00",
      "navegadores_diferentes": 4,
      "sistemas_operativos_diferentes": 2
    }
  ]
}
```

#### Ejemplo de uso (JavaScript)

```javascript
async function listarAplicaciones() {
    try {
        const response = await fetch('https://meskeia.com/api/v1/aplicaciones.php');
        const datos = await response.json();

        console.log(`Total de aplicaciones: ${datos.resumen.total_aplicaciones}`);
        console.log('Aplicaciones:', datos.data);

        // Mostrar aplicación más usada
        const masUsada = datos.data[0];
        console.log(`App más usada: ${masUsada.aplicacion} (${masUsada.total_usos} usos)`);
    } catch (error) {
        console.error('Error al listar aplicaciones:', error);
    }
}

listarAplicaciones();
```

---

## 🔒 Seguridad y CORS

### CORS (Cross-Origin Resource Sharing)

La API permite peticiones desde cualquier origen:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

### Métodos HTTP Permitidos

- `POST` → `/guardar-uso.php`
- `GET` → `/estadisticas.php`, `/aplicaciones.php`
- `OPTIONS` → Todos los endpoints (preflight CORS)

---

## 📈 Formato de Respuesta Estándar

### Respuesta Exitosa

```json
{
  "status": "success",
  "message": "Operación completada",
  "data": { ... }
}
```

### Respuesta de Error

```json
{
  "status": "error",
  "message": "Descripción del error"
}
```

### Códigos HTTP

- `200 OK` - Consulta exitosa
- `201 Created` - Recurso creado exitosamente
- `400 Bad Request` - Datos inválidos
- `405 Method Not Allowed` - Método HTTP no permitido
- `500 Internal Server Error` - Error del servidor

---

## 🚀 Instalación y Configuración

### 1. Subir Archivos al Hosting

Subir toda la carpeta `api/` a la raíz de tu hosting:

```
public_html/
└── api/
    └── v1/
        ├── db-init.php
        ├── guardar-uso.php
        ├── estadisticas.php
        └── aplicaciones.php
```

### 2. Configurar Permisos

Asegurar que la carpeta `api/v1/` tenga permisos de escritura para crear la base de datos:

```bash
chmod 755 api/v1/
```

### 3. Inicializar Base de Datos (Opcional)

La base de datos se crea automáticamente al primer uso. Para inicializarla manualmente:

```bash
php api/v1/db-init.php
```

**Salida esperada**:
```
✅ Base de datos inicializada correctamente en: /path/to/api/v1/meskeia-analytics.db
📋 Tablas creadas: uso_aplicaciones
🔍 Índices creados: idx_aplicacion, idx_timestamp, idx_created_at
```

### 4. Verificar Funcionamiento

Acceder a:
```
https://meskeia.com/api/v1/aplicaciones.php
```

Debería devolver:
```json
{
  "status": "success",
  "resumen": {
    "total_aplicaciones": 0,
    "total_usos_global": 0
  },
  "data": []
}
```

---

## 📝 Integración con Aplicaciones Existentes

### Código JavaScript para Integrar

Añadir al final de cada aplicación web (antes de `</body>`):

```html
<script>
// Registrar uso automáticamente al cargar la página
(async function() {
    const nombreApp = 'NOMBRE_DE_TU_APP'; // Cambiar según la aplicación

    const datos = {
        aplicacion: nombreApp,
        navegador: navigator.userAgent,
        sistema_operativo: navigator.platform,
        resolucion: `${window.screen.width}x${window.screen.height}`
    };

    try {
        await fetch('https://meskeia.com/api/v1/guardar-uso.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datos)
        });
        console.log('✅ Uso registrado en meskeIA Analytics');
    } catch (error) {
        console.error('❌ Error al registrar uso:', error);
    }
})();
</script>
```

### Nombres de Aplicaciones Sugeridos

Usar el nombre de la carpeta de cada aplicación:
- `generador-gradientes`
- `calculadora-aspectos`
- `generador-tipografias`
- `convertidor-medidas`
- etc.

---

## 🧪 Testing de la API

### Test con cURL (desde terminal)

#### 1. Registrar un uso

```bash
curl -X POST https://meskeia.com/api/v1/guardar-uso.php \
  -H "Content-Type: application/json" \
  -d '{
    "aplicacion": "test-app",
    "navegador": "cURL",
    "sistema_operativo": "Linux"
  }'
```

#### 2. Consultar estadísticas

```bash
curl https://meskeia.com/api/v1/estadisticas.php?aplicacion=test-app
```

#### 3. Listar aplicaciones

```bash
curl https://meskeia.com/api/v1/aplicaciones.php
```

---

## 🔧 Mantenimiento

### Backup de la Base de Datos

La base de datos está en:
```
api/v1/meskeia-analytics.db
```

**Recomendación**: Hacer backup semanal descargando este archivo vía FTP.

### Limpiar Datos Antiguos

Para eliminar registros antiguos (por ejemplo, más de 1 año):

```sql
DELETE FROM uso_aplicaciones
WHERE created_at < datetime('now', '-1 year');
```

### Consultar Tamaño de la Base de Datos

```bash
ls -lh api/v1/meskeia-analytics.db
```

---

## 📊 Casos de Uso

### 1. Dashboard de Analíticas

Crear una página de administración que muestre:
- Total de usos por aplicación
- Gráfica de usos en el tiempo
- Aplicaciones más populares
- Navegadores y sistemas operativos más usados

### 2. Notificaciones de Uso

Enviar email cuando una aplicación alcance X usos.

### 3. Optimización de Aplicaciones

Identificar aplicaciones con poco uso para mejorarlas o descontinuarlas.

### 4. Reportes para IAs

Las IAs pueden consultar la API para conocer qué aplicaciones son más populares y ofrecer mejores recomendaciones.

---

## ❓ Preguntas Frecuentes

**P: ¿La API consume mucha base de datos?**
R: No. SQLite es muy eficiente. 10,000 registros ocupan aproximadamente 1 MB.

**P: ¿Puedo usar MySQL en lugar de SQLite?**
R: Sí, modificando `db-init.php` para usar PDO con MySQL.

**P: ¿Cómo evito spam o registros falsos?**
R: Implementar rate limiting (próxima versión) o validación por IP.

**P: ¿Los datos son anónimos?**
R: Sí, no se recopila información personal identificable.

---

## 🎯 Próximas Mejoras (v2.0)

- [ ] Autenticación con API Key
- [ ] Rate limiting (límite de peticiones por IP)
- [ ] Endpoint para eliminar datos (GDPR)
- [ ] Exportar estadísticas a CSV/Excel
- [ ] Dashboard web de administración
- [ ] Webhooks para eventos importantes
- [ ] Soporte para métricas personalizadas

---

## 📞 Soporte

Para dudas o problemas con la API:
- **Email**: [tu-email]
- **GitHub**: [tu-repositorio]
- **Web**: https://meskeia.com

---

**© 2025 meskeIA - Analytics API v1.0**
