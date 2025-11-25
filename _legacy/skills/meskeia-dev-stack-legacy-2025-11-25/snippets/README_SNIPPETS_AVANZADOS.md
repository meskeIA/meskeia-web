# 📦 Snippets Avanzados - meskeIA Development Stack

## 🎯 Propósito

Estos snippets opcionales **NO se aplican automáticamente**. Solo se usan cuando el usuario solicita explícitamente funcionalidades avanzadas que el skill base no cubre.

---

## 📁 Snippets Disponibles

### 1. **htmx.html** - Interactividad Dinámica sin JavaScript

**Cuándo usar:**
- Usuario pide "búsqueda en tiempo real"
- "Filtros dinámicos"
- "Cargar sin recargar página"
- "Infinite scroll"
- "Validación instantánea de formularios"

**Qué hace:**
- Añade interactividad AJAX sin escribir JavaScript complejo
- Compatible con cualquier backend (Flask, Node.js, etc.)
- Solo 14KB minificado
- Progressive enhancement (funciona sin JS también)

**Cómo aplicar:**
```
Usuario: "Añade un buscador que filtre en tiempo real"

Claude:
1. Lee C:\Users\jaceb\.claude\skills\meskeia-dev-stack\snippets\htmx.html
2. Aplica el snippet de búsqueda dinámica
3. Configura el endpoint Flask correspondiente
4. Mantiene todos los estilos meskeIA
```

**Ejemplos incluidos:**
- ✅ Búsqueda dinámica con delay
- ✅ Filtros sin recargar página
- ✅ Paginación AJAX
- ✅ Validación de formularios en tiempo real
- ✅ Infinite scroll (cargar más)
- ✅ Eliminar items con confirmación
- ✅ Ejemplos de endpoints Flask

---

### 2. **jinja_macros.html** - Componentes Reutilizables Jinja2

**Cuándo usar:**
- Proyectos Flask con muchas vistas
- Usuario pide "dashboard con estadísticas"
- "Formularios complejos"
- "Tablas de datos"
- "Modales/alertas"

**Qué hace:**
- Proporciona macros Jinja2 pre-diseñados con paleta meskeIA
- Acelera desarrollo de interfaces Flask
- Garantiza consistencia visual

**Cómo aplicar:**
```
Usuario: "Crea un dashboard con tarjetas de estadísticas"

Claude:
1. Lee C:\Users\jaceb\.claude\skills\meskeia-dev-stack\snippets\jinja_macros.html
2. Crea templates/macros.html con los macros
3. Importa en la plantilla: {% from 'macros.html' import stat_card %}
4. Usa los macros: {{ stat_card("Ventas", 1234.56, "💰") }}
```

**Macros disponibles:**
- ✅ `stat_card()` - Tarjetas de estadísticas
- ✅ `form_field()` - Campos de formulario con validación
- ✅ `modal()` - Ventanas emergentes
- ✅ `alert()` - Notificaciones (success, danger, warning, info)
- ✅ `tabla()` - Tablas de datos con hover y striped
- ✅ `paginacion()` - Controles de paginación

---

## 🚫 Cuándo NO Usar Estos Snippets

### No usar HTMX si:
- La app es 100% estática (sin backend)
- Necesitas una SPA compleja (mejor React/Vue)
- Requieres estado complejo del lado del cliente
- La app debe funcionar offline-first (usar Service Workers en su lugar)

### No usar Jinja2 Macros si:
- El proyecto no usa Flask/Jinja2
- Es una aplicación de una sola página
- Ya tienes componentes definidos

---

## 📋 Flujo de Uso Recomendado

### Escenario 1: Aplicación Estática Simple

```
Usuario: "Crea una calculadora web"

Claude:
✅ Usa skill meskeia-dev-stack automáticamente
✅ NO aplica htmx.html (no se necesita)
✅ NO aplica jinja_macros.html (no es Flask)
✅ Genera HTML/CSS/JS estático con diseño meskeIA
```

### Escenario 2: Aplicación Flask con Búsqueda Dinámica

```
Usuario: "Crea una app Flask para gestionar productos con buscador en tiempo real"

Claude:
✅ Usa skill meskeia-dev-stack automáticamente
✅ Detecta necesidad de búsqueda dinámica
✅ Pregunta: "¿Quieres usar HTMX para la búsqueda en tiempo real?"
   - Si SÍ: Aplica snippets/htmx.html
   - Si NO: Implementa con JavaScript vanilla
✅ Pregunta: "¿Usar macros Jinja2 para formularios?"
   - Si SÍ: Aplica snippets/jinja_macros.html
```

### Escenario 3: Dashboard Flask Completo

```
Usuario: "Desarrolla un dashboard de ventas con gráficos y tablas interactivas"

Claude:
✅ Usa skill meskeia-dev-stack automáticamente
✅ Aplica snippets/jinja_macros.html para:
   - Tarjetas de estadísticas
   - Tablas de datos
   - Modales de detalles
✅ Pregunta si quiere HTMX para filtros dinámicos
✅ Añade Chart.js con paleta meskeIA (ya incluido en skill base)
```

---

## 🔧 Mantenimiento de los Snippets

### Actualizar Snippets

Si necesitas modificar un snippet:

```bash
# Editar directamente
code "C:\Users\jaceb\.claude\skills\meskeia-dev-stack\snippets\htmx.html"
```

**IMPORTANTE**: Siempre mantener:
- ✅ Paleta de colores meskeIA
- ✅ Comentarios en español
- ✅ Formato español en ejemplos
- ✅ Responsive móvil

### Añadir Nuevos Snippets

Crear nuevos snippets siguiendo la estructura:

```html
<!-- ===============================================
     NOMBRE DEL SNIPPET - Descripción breve
     ===============================================

     📋 Cuándo usar:
     - Caso de uso 1
     - Caso de uso 2

     ⚠️ USO MANUAL: No se aplica automáticamente

     ✅ Compatible con: ...
     ================================================ -->

<!-- Código del snippet aquí -->
```

---

## 📊 Estadísticas de Uso

| Snippet | Casos de Uso | Frecuencia Estimada |
|---------|--------------|---------------------|
| **htmx.html** | Búsquedas, filtros, AJAX | 20% de proyectos |
| **jinja_macros.html** | Dashboards, formularios | 30% de proyectos Flask |

**Conclusión**: El 70-80% de proyectos NO necesitan estos snippets. El skill base es suficiente.

---

## 🎓 Ejemplos Completos

### Ejemplo 1: Buscador de Productos con HTMX

**Solicitud del usuario:**
```
"Crea una app Flask para gestionar productos con buscador que filtre en tiempo real"
```

**Código generado por Claude:**

**1. app.py (Flask backend)**
```python
from flask import Flask, request, render_template

app = Flask(__name__)

# ... (setup completo del skill base)

@app.route('/api/buscar-productos')
def buscar_productos():
    """Endpoint para HTMX - búsqueda dinámica"""
    query = request.args.get('query', '').lower()

    productos = [
        {'id': 1, 'nombre': 'Laptop HP', 'precio': 899.99},
        {'id': 2, 'nombre': 'Mouse Logitech', 'precio': 29.99},
        # ...
    ]

    # Filtrar
    resultados = [p for p in productos if query in p['nombre'].lower()]

    # Devolver HTML fragmento
    html = ''
    for p in resultados:
        html += f'''
        <div class="producto-item">
            <h4>{p['nombre']}</h4>
            <p>{p['precio']:,.2f} €</p>
        </div>
        '''

    return html if html else '<p>No se encontraron productos</p>'
```

**2. templates/productos.html**
```html
{% extends 'base.html' %}

{% block content %}
<div style="margin-bottom: 20px;">
    <input type="search"
           placeholder="Buscar productos..."
           hx-get="/api/buscar-productos"
           hx-trigger="keyup changed delay:500ms"
           hx-target="#resultados-productos"
           style="width: 100%; padding: 12px; border: 1px solid var(--border); border-radius: 8px;">
</div>

<div id="resultados-productos">
    <!-- Resultados aparecerán aquí dinámicamente -->
</div>

<!-- Incluir HTMX -->
<script src="https://unpkg.com/htmx.org@1.9.10"></script>
{% endblock %}
```

---

### Ejemplo 2: Dashboard con Macros Jinja2

**Solicitud del usuario:**
```
"Crea un dashboard de ventas con tarjetas de estadísticas"
```

**Código generado por Claude:**

**1. templates/macros.html** (copia completa de jinja_macros.html)

**2. templates/dashboard.html**
```html
{% extends 'base.html' %}
{% from 'macros.html' import stat_card, tabla, paginacion %}

{% block content %}
<!-- Grid de estadísticas -->
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
    {{ stat_card("Ventas Totales", ventas_total, "💰", "primary", "€") }}
    {{ stat_card("Productos Vendidos", productos_vendidos, "📦", "secondary") }}
    {{ stat_card("Clientes Nuevos", clientes_nuevos, "👥", "success") }}
    {{ stat_card("Pendientes", pedidos_pendientes, "⏳", "warning") }}
</div>

<!-- Tabla de últimas ventas -->
<h2>Últimas Ventas</h2>
{% call tabla(["Fecha", "Cliente", "Total", "Estado"]) %}
    {% for venta in ultimas_ventas %}
    <tr>
        <td>{{ venta.fecha.strftime('%d/%m/%Y') }}</td>
        <td>{{ venta.cliente }}</td>
        <td>{{ "{:,.2f}".format(venta.total)|replace(',', 'TEMP')|replace('.', ',')|replace('TEMP', '.') }} €</td>
        <td>
            <span class="badge badge-{{ 'success' if venta.pagado else 'warning' }}">
                {{ "Pagado" if venta.pagado else "Pendiente" }}
            </span>
        </td>
    </tr>
    {% endfor %}
{% endcall %}

{{ paginacion(pagina_actual, total_paginas, "/dashboard") }}
{% endblock %}
```

**3. app.py (ruta del dashboard)**
```python
@app.route('/dashboard')
def dashboard():
    # Calcular estadísticas
    ventas_total = calcular_ventas_total()
    productos_vendidos = contar_productos_vendidos()
    clientes_nuevos = contar_clientes_nuevos()
    pedidos_pendientes = contar_pedidos_pendientes()

    # Últimas ventas
    ultimas_ventas = obtener_ultimas_ventas(pagina=1, por_pagina=10)

    return render_template('dashboard.html',
                         ventas_total=ventas_total,
                         productos_vendidos=productos_vendidos,
                         clientes_nuevos=clientes_nuevos,
                         pedidos_pendientes=pedidos_pendientes,
                         ultimas_ventas=ultimas_ventas,
                         pagina_actual=1,
                         total_paginas=calcular_total_paginas())
```

---

## 🚀 Próximos Pasos

1. **No hacer nada**: Los snippets están listos para usar cuando se necesiten
2. **Documentar en CLAUDE.md principal** (opcional): Añadir referencia a estos snippets
3. **Probar en proyecto real**: La próxima vez que necesites interactividad dinámica o componentes Flask

---

## 📞 Soporte

Si tienes dudas sobre cuándo usar estos snippets, pregunta a Claude:

```
"¿Debería usar HTMX para esta funcionalidad?"
"¿Necesito los macros Jinja2 para este proyecto?"
```

Claude evaluará el contexto y recomendará la mejor opción.

---

© 2025 meskeIA - Snippets Avanzados Opcionales
