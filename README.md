# meskeIA - Biblioteca de Aplicaciones Web Gratuitas

[![Aplicaciones](https://img.shields.io/badge/aplicaciones-86-2E86AB)](https://meskeia.com)
[![Idioma](https://img.shields.io/badge/idioma-español-48A9A6)](https://meskeia.com)
[![Licencia](https://img.shields.io/badge/licencia-MIT-green)](LICENSE)
[![Estado](https://img.shields.io/badge/estado-activo-success)](https://meskeia.com)

> Biblioteca gratuita de **86 aplicaciones web** educativas en español. Todas funcionan 100% en el navegador, sin registro ni instalación.

**[🌐 Visita meskeIA.com](https://meskeia.com)** | **[📚 Ver Guías](https://meskeia.com/guias)** | **[🎯 Awesome List](https://github.com/meskeIA/awesome-spanish-toolkit)**

---

## 🚀 Últimas Novedades (Noviembre 2025)

### ⭐ Nuevas Aplicaciones

- **📻 Radio meskeIA** - Streaming de emisoras de radio de todo el mundo
- **💰 Impuesto Sucesiones Nacional** - Calculadora para régimen común de España (14 CCAA)
- **💰 Impuesto Donaciones Nacional** - Calculadora para régimen común de España (14 CCAA)

### 🔄 Actualizaciones Recientes

- ✅ Analytics v2.0 con tracking de duración y tipo de dispositivo
- ✅ Botón compartir en todas las aplicaciones
- ✅ Soporte para traducción automática del navegador
- ✅ Meta tags optimizados para SEO internacional

---

## 📊 Estadísticas

- **86 aplicaciones web** (84 principales + 2 legacy)
- **12 categorías** temáticas
- **+80 guías educativas** completas
- **100% gratuito** - Sin registro ni instalación
- **Formato español** - Números, fechas y moneda localizados

---

## 🎨 Categorías de Aplicaciones

### 💰 Finanzas y Fiscalidad (11 apps)
Simuladores de hipoteca, inversiones, jubilación, IRPF, impuestos de sucesiones y donaciones.

### 🧮 Calculadoras y Utilidades (7 apps)
Porcentajes, regla de tres, fechas, tallas, cocina, divisas y más.

### 📐 Matemáticas y Estadística (10 apps)
Álgebra, geometría, cálculo, probabilidad, estadística, investigación operativa.

### 🧪 Física y Química (6 apps)
Cinemática, tabla periódica, fórmulas químicas, electricidad, conversor de unidades.

### ⚡ Herramientas de Productividad (7 apps)
Cuaderno digital, lista de tareas, cronómetro, generador de contraseñas, códigos QR.

### 🎨 Creatividad y Diseño (7 apps)
Gradientes CSS, sombras, paletas de colores, tipografías, contraste WCAG.

### 🎮 Juegos y Entretenimiento (8 apps)
Radio mundial, Wordle español, Sudoku, 2048, juegos de lógica y memoria.

### 📚 Campus Digital (5 apps)
Calculadora de notas, horarios de estudio, flashcards, cursos de inversión y emprendimiento.

### 🏥 Salud & Bienestar (6 apps)
Evaluador de salud, calorías, hidratación, sueño, nutrición, seguimiento de hábitos.

### 💻 Herramientas Web y Tecnología (6 apps)
Validadores JSON/RegEx, conversor Base64, generador de Hash, acortador de URLs.

### 📝 Texto y Documentos (6 apps)
Contador de palabras, comparador de textos, conversor Markdown, limpiador de texto.

### 💼 Emprendimiento y Negocios (6 apps)
ROI marketing, tarifa freelance, cashflow, break-even, generador de nombres de empresa.

---

## 🛠️ Tecnologías

### Frontend
- HTML5, CSS3 (Variables CSS, Flexbox, Grid)
- JavaScript ES6+ (Vanilla JS, sin frameworks)
- Diseño responsive mobile-first
- Paleta oficial meskeIA (#2E86AB, #48A9A6)

### Backend y APIs
- Python Flask para apps con backend
- SQLite para persistencia local
- APIs RESTful con Flask-CORS

### Analytics y SEO
- meskeIA Analytics v2.0 (tracking propietario)
- Sitemap.xml automático
- AI-Index.json para crawlers de IA
- Schema.org para SEO
- Meta tags OpenGraph y Twitter Cards

---

## 📦 Estructura del Proyecto

```
meskeia-web/
├── index.html              # Página principal con buscador
├── sitemap.xml            # Mapa del sitio (91 URLs)
├── ai-index.json          # Índice para crawlers de IA (86 apps)
├── robots.txt             # Configuración para bots
├── guias/                 # Guías educativas (+80 tutoriales)
├── api/v1/                # API de Analytics v2.0
├── [app-name]/            # 86 directorios de aplicaciones
│   ├── index.html
│   └── icon_meskeia.png
└── assets/                # Recursos compartidos
```

---

## 🎯 Características Técnicas

### 🔒 Privacidad y Seguridad
- ✅ Sin cookies de terceros
- ✅ Sin rastreo de usuarios
- ✅ Datos procesados localmente
- ✅ API keys en variables de entorno (.env)

### 🌍 Accesibilidad
- ✅ Contraste WCAG AA/AAA
- ✅ Responsive design (móvil + escritorio)
- ✅ Soporte para traducción automática
- ✅ Meta tags `translate="yes"`

### ⚡ Rendimiento
- ✅ Carga rápida (sin frameworks pesados)
- ✅ Caché optimizado
- ✅ Assets minificados
- ✅ Lazy loading de imágenes

### 📱 PWA (Aplicaciones Seleccionadas)
- ✅ Manifest.json
- ✅ Service Worker
- ✅ Instalable en móvil
- ✅ Funcionamiento offline

---

## 🚀 Instalación y Desarrollo

### Requisitos Previos
- Navegador web moderno
- Python 3.8+ (solo para apps con backend)
- Git (opcional)

### Clonar el Repositorio
```bash
git clone https://github.com/meskeIA/meskeia-web.git
cd meskeia-web
```

### Ejecutar Localmente

#### Apps HTML Estáticas
Abre cualquier `index.html` directamente en tu navegador:
```bash
# Windows
start index.html

# Linux/Mac
open index.html
```

#### Apps con Backend Flask
```bash
# Crear entorno virtual
python -m venv venv

# Activar entorno (Windows)
venv\Scripts\activate

# Activar entorno (Linux/Mac)
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar servidor
python app.py
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. **Fork** el repositorio
2. **Crea una rama** para tu feature (`git checkout -b feature/nueva-app`)
3. **Commit** tus cambios (`git commit -m 'feat: añadir nueva aplicación'`)
4. **Push** a la rama (`git push origin feature/nueva-app`)
5. **Abre un Pull Request**

### Estándares de Código

#### Diseño meskeIA (Obligatorio)
- Paleta de colores oficial: `#2E86AB` (azul), `#48A9A6` (teal)
- Logo meskeIA integrado (CSS, no imagen externa)
- Footer oficial: `© 2025 meskeIA`
- Botón compartir con emoji 🔗

#### Formato Español
- Números: `1.234,56` (punto miles, coma decimal)
- Fechas: `DD/MM/YYYY` (30/11/2025)
- Moneda: `1.234,56 €` (espacio antes de €)

#### Meta Tags Obligatorios
```html
<html lang="es" translate="yes">
<meta name="google" content="translate">
<meta http-equiv="content-language" content="es">
```

#### Analytics v2.0
Todas las apps deben incluir el script de tracking antes de `</body>`.

---

## 📚 Documentación

- **[Guía de Desarrollo](CLAUDE.md)** - Instrucciones completas para Claude Code
- **[Awesome List](https://github.com/meskeIA/awesome-spanish-toolkit)** - Lista curada de todas las apps
- **[Guías Educativas](https://meskeia.com/guias)** - Tutoriales de uso de cada app
- **[API Documentation](api/v1/README.md)** - Endpoints de Analytics v2.0

---

## 📊 SEO y Descubribilidad

### Para Motores de Búsqueda Tradicionales
- ✅ Sitemap XML con 91 URLs
- ✅ Robots.txt optimizado
- ✅ Meta tags completos
- ✅ Schema.org JSON-LD

### Para Crawlers de IA
- ✅ AI-Index.json estructurado
- ✅ Guías educativas optimizadas (1800-2500 palabras)
- ✅ Casos de uso detallados
- ✅ Permitido para todos los crawlers (GPTBot, Claude-Web, etc.)

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

---

## 📧 Contacto

- **Web**: [meskeia.com](https://meskeia.com)
- **Email**: meskeia24@gmail.com
- **GitHub**: [@meskeIA](https://github.com/meskeIA)
- **Awesome List**: [awesome-spanish-toolkit](https://github.com/meskeIA/awesome-spanish-toolkit)

---

## 🙏 Agradecimientos

Gracias a todos los usuarios que han probado y dado feedback sobre las aplicaciones.

**meskeIA** - Creado con ❤️ para la comunidad hispanohablante

---

## 📈 Estadísticas del Proyecto

- **Última actualización**: 18 noviembre 2025
- **Total de aplicaciones**: 86
- **Categorías**: 12
- **Guías educativas**: +80
- **Idiomas soportados**: Español (traducción automática disponible)
- **Licencia**: MIT
- **Estado**: Activo y en desarrollo continuo

---

**[⬆ Volver arriba](#meskeia---biblioteca-de-aplicaciones-web-gratuitas)**
