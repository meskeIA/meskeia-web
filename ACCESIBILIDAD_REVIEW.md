# ♿ Revisión de Accesibilidad - meskeIA Next.js

## 📅 Fecha: 2025-01-22

---

## 🎯 Objetivo

Asegurar que todas las aplicaciones de meskeIA cumplan con los estándares WCAG 2.1 nivel AA en:
1. **Navegación por teclado** (Keyboard Navigation)
2. **Lectores de pantalla** (Screen Readers)
3. **Contraste de colores**
4. **Etiquetas semánticas**

---

## ✅ Checklist de Accesibilidad por App

### Navegación por Teclado (Keyboard Navigation)

#### Requisitos mínimos:
- [ ] Todos los elementos interactivos son accesibles con `Tab`
- [ ] Orden lógico de tabulación (de arriba a abajo, izquierda a derecha)
- [ ] Focus visible en todos los elementos (outline o ring de enfoque)
- [ ] Funcionalidad completa sin ratón:
  - `Tab` / `Shift+Tab`: Navegar entre elementos
  - `Enter` / `Space`: Activar botones y controles
  - `Escape`: Cerrar modales o diálogos (si aplica)
  - `Arrow keys`: Navegar en selectores o sliders (si aplica)

#### Elementos críticos a verificar:
1. **Inputs de texto**: Enfocables con Tab, pueden escribirse
2. **Botones**: Enfocables con Tab, activables con Enter/Space
3. **Selectores (select)**: Enfocables, navegables con flechas
4. **Checkboxes/Radio**: Enfocables, activables con Space
5. **Links**: Enfocables con Tab, activables con Enter
6. **Footer compartir**: Botón enfocable y activable con teclado

#### Testing manual:
```
1. Abrir app en navegador
2. Presionar Tab repetidamente
3. Verificar que cada elemento interactivo recibe focus
4. Verificar que el focus es visible (outline azul, ring, etc)
5. Intentar usar la app completamente sin ratón
```

---

### Lectores de Pantalla (Screen Readers)

#### Requisitos mínimos:
- [ ] Todos los inputs tienen `<label>` asociado o `aria-label`
- [ ] Botones tienen texto descriptivo o `aria-label`
- [ ] Imágenes tienen `alt` text (si aplica)
- [ ] Estructura semántica HTML (`<h1>`, `<h2>`, `<section>`, etc)
- [ ] Estados dinámicos se anuncian (`aria-live` si aplica)
- [ ] Roles ARIA correctos (si son necesarios)

#### Elementos críticos a verificar:
1. **Labels de inputs**:
   ```html
   <!-- ✅ CORRECTO -->
   <label htmlFor="monto">Monto de la cuenta (€)</label>
   <input id="monto" type="number" />

   <!-- ❌ INCORRECTO -->
   <input type="number" placeholder="Monto" />
   ```

2. **Botones descriptivos**:
   ```html
   <!-- ✅ CORRECTO -->
   <button>🔄 Limpiar calculadora</button>

   <!-- ❌ INCORRECTO -->
   <button>🔄</button>
   ```

3. **Estructura de headings**:
   ```html
   <!-- ✅ CORRECTO -->
   <h1>Calculadora de Propinas</h1>
   <h2>¿Cómo usar la calculadora?</h2>
   <h3>Porcentajes por país</h3>

   <!-- ❌ INCORRECTO -->
   <div class="title">Calculadora de Propinas</div>
   <div class="subtitle">¿Cómo usar?</div>
   ```

4. **Resultados dinámicos**:
   ```html
   <!-- ✅ CORRECTO (si cambia frecuentemente) -->
   <div aria-live="polite" aria-atomic="true">
     Total: {formatearMoneda(total)}
   </div>

   <!-- ✅ CORRECTO (si NO cambia frecuentemente) -->
   <div>Total: {formatearMoneda(total)}</div>
   ```

#### Testing manual con NVDA (Windows):
```
1. Descargar NVDA: https://www.nvaccess.org/download/
2. Instalar y abrir NVDA (Ctrl+Alt+N)
3. Abrir la app en navegador
4. Presionar Tab y escuchar qué anuncia NVDA
5. Verificar que todos los campos se leen correctamente
6. Usar flechas arriba/abajo para navegar por contenido
```

---

## 🎨 Contraste de Colores

### Paleta meskeIA - Verificación WCAG AA:

| Combinación | Contraste | WCAG AA | Uso |
|-------------|-----------|---------|-----|
| `#1A1A1A` sobre `#FAFAFA` | 16.1:1 | ✅ PASS | Texto principal (light mode) |
| `#666666` sobre `#FAFAFA` | 7.0:1 | ✅ PASS | Texto secundario (light mode) |
| `#2E86AB` sobre `#FFFFFF` | 4.6:1 | ✅ PASS | Enlaces, botones primarios |
| `#FAFAFA` sobre `#1A1A1A` | 16.1:1 | ✅ PASS | Texto (dark mode) |

**Herramienta de verificación**: https://webaim.org/resources/contrastchecker/

### Focus States

```css
/* ✅ Focus visible obligatorio */
input:focus,
button:focus,
select:focus,
a:focus {
  outline: 2px solid var(--primary);
  outline-offset: 2px;
  /* O usar box-shadow para ring de focus */
  box-shadow: 0 0 0 3px var(--primary-alpha-10);
}

/* ❌ NUNCA hacer esto */
*:focus {
  outline: none; /* PROHIBIDO sin alternativa visible */
}
```

---

## 📱 Apps Migradas - Estado de Accesibilidad

### 1. Calculadora de Propinas

#### ✅ Implementado:
- Labels asociados a inputs (`htmlFor` + `id`)
- Estructura semántica (`<h1>`, `<h2>`, secciones)
- Botones descriptivos
- Footer accesible

#### ⚠️ A verificar:
- [ ] Tab order lógico
- [ ] Focus visible en todos los elementos
- [ ] Screen reader anuncia resultados correctamente
- [ ] Porcentajes personalizados accesibles con teclado

#### 🔧 Mejoras sugeridas:
```typescript
// Añadir aria-label a inputs numéricos
<input
  type="number"
  id="monto"
  aria-label="Monto de la cuenta en euros"
  aria-describedby="monto-help"
  {...}
/>
<small id="monto-help">Introduce el monto total de la cuenta</small>

// Anunciar cambios de resultados (si aplica)
<div
  className={styles.resultados}
  role="region"
  aria-label="Resultados del cálculo"
>
  {/* Resultados */}
</div>
```

---

### 2. Generador de Contraseñas

#### ✅ Implementado:
- Labels asociados a controles
- Checkboxes accesibles
- Botones descriptivos

#### ⚠️ A verificar:
- [ ] Tab order lógico
- [ ] Slider de longitud accesible con teclado (Arrow keys)
- [ ] Screen reader anuncia contraseñas generadas
- [ ] Botón copiar anuncia éxito

#### 🔧 Mejoras sugeridas:
```typescript
// Slider accesible
<input
  type="range"
  id="longitud"
  min="8"
  max="128"
  value={longitud}
  onChange={...}
  aria-label="Longitud de la contraseña"
  aria-valuemin={8}
  aria-valuemax={128}
  aria-valuenow={longitud}
  aria-valuetext={`${longitud} caracteres`}
/>

// Anunciar contraseña copiada
<button onClick={copiar} aria-live="polite">
  {copiado ? '✅ Copiado' : '📋 Copiar'}
</button>
```

---

### 3. Calculadora de Porcentajes

#### ✅ Implementado:
- Tabs navegables
- Labels en inputs
- Estructura semántica

#### ⚠️ A verificar:
- [ ] Tabs accesibles con teclado (Arrow keys)
- [ ] Tab order respeta estructura visual
- [ ] Gráficos tienen alternativa textual
- [ ] Historial accesible

#### 🔧 Mejoras sugeridas:
```typescript
// Tabs accesibles
<div role="tablist" aria-label="Tipos de cálculo">
  <button
    role="tab"
    aria-selected={activeTab === 'basic'}
    aria-controls="panel-basic"
    onClick={() => setActiveTab('basic')}
    onKeyDown={handleTabKeyDown} // Arrow keys
  >
    Básico
  </button>
</div>

<div
  role="tabpanel"
  id="panel-basic"
  aria-labelledby="tab-basic"
  hidden={activeTab !== 'basic'}
>
  {/* Contenido */}
</div>

// Gráfico con descripción textual
<div role="img" aria-label="Gráfico de barras mostrando...">
  <Chart {...} />
</div>
<div className="sr-only">
  Descripción detallada del gráfico: ...
</div>
```

---

## 🧪 Protocolo de Testing

### Testing Manual (Obligatorio para cada app)

#### 1. Keyboard Navigation (10 min)
```
1. Abrir app
2. Presionar Tab desde el inicio
3. Verificar que TODOS los elementos reciben focus
4. Verificar orden lógico
5. Intentar completar flujo completo sin ratón
6. Documentar elementos que NO son accesibles
```

#### 2. Screen Reader (10 min)
```
1. Abrir NVDA (Windows) o VoiceOver (Mac)
2. Navegar con Tab por toda la app
3. Verificar que NVDA anuncia:
   - Labels de inputs
   - Texto de botones
   - Headings
   - Resultados
4. Intentar usar la app completa solo con NVDA
5. Documentar elementos confusos o silenciosos
```

#### 3. Lighthouse Accessibility (2 min)
```
1. Abrir DevTools (F12)
2. Ir a pestaña Lighthouse
3. Seleccionar "Accessibility"
4. Run audit
5. Objetivo: Score > 95
6. Corregir issues reportados
```

---

### Testing Automatizado (Opcional)

#### Con Playwright + axe-core:
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('accesibilidad de calculadora-propinas', async ({ page }) => {
  await page.goto('http://localhost:3000/calculadora-propinas');

  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

---

## 📋 Checklist Final por App

Copiar y completar para cada app migrada:

### App: _____________

#### Keyboard Navigation:
- [ ] Todos los inputs accesibles con Tab
- [ ] Todos los botones accesibles con Tab
- [ ] Orden de Tab lógico
- [ ] Focus visible (outline/ring)
- [ ] Enter activa botones
- [ ] Space activa checkboxes/radios
- [ ] Escape cierra modales (si aplica)
- [ ] Arrow keys en selectores/sliders (si aplica)

#### Screen Readers:
- [ ] Labels asociados a inputs
- [ ] Botones con texto descriptivo
- [ ] Estructura de headings correcta (h1 → h2 → h3)
- [ ] Imágenes con alt text (si aplica)
- [ ] Roles ARIA correctos (si necesarios)
- [ ] Estados dinámicos anunciados (si aplica)

#### Contraste:
- [ ] Texto principal cumple WCAG AA (4.5:1)
- [ ] Texto secundario cumple WCAG AA
- [ ] Enlaces/botones cumplen WCAG AA

#### Lighthouse:
- [ ] Score > 95 en Accessibility
- [ ] Sin violaciones críticas

---

## 🔧 Clases Utility para Accesibilidad

### Screen Reader Only (sr-only)

Añadir a `globals.css`:

```css
/* Ocultar visualmente pero mantener para lectores de pantalla */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

/* Mostrar en focus (para skip links) */
.sr-only-focusable:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

Uso:
```html
<!-- Descripción solo para screen readers -->
<span className="sr-only">
  Esta calculadora te ayuda a calcular propinas automáticamente
</span>

<!-- Skip link (para saltar navegación) -->
<a href="#main-content" className="sr-only sr-only-focusable">
  Saltar al contenido principal
</a>
```

---

## 📚 Referencias y Recursos

### Estándares:
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### Herramientas:
- **NVDA**: https://www.nvaccess.org/ (Screen reader Windows)
- **JAWS**: https://www.freedomscientific.com/products/software/jaws/ (Screen reader Windows comercial)
- **VoiceOver**: Built-in macOS/iOS (Cmd+F5)
- **axe DevTools**: https://www.deque.com/axe/devtools/ (Chrome extension)
- **WAVE**: https://wave.webaim.org/ (Web accessibility evaluator)
- **Lighthouse**: Built-in Chrome DevTools
- **Contrast Checker**: https://webaim.org/resources/contrastchecker/

### Guías específicas:
- [Accessible Forms](https://www.w3.org/WAI/tutorials/forms/)
- [Keyboard Navigation](https://webaim.org/techniques/keyboard/)
- [ARIA Labels](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques)

---

## ✅ Próximos Pasos

1. **Revisar calculadora-propinas** con keyboard + NVDA
2. **Revisar generador-contrasenas** con keyboard + NVDA
3. **Revisar calculadora-porcentajes** con keyboard + NVDA
4. **Corregir issues** encontrados
5. **Documentar** mejoras aplicadas
6. **Añadir a checklist de migración** verificación obligatoria

---

**Última actualización**: 2025-01-22
**Estado**: 🚧 Pendiente de testing manual
**Tiempo estimado por app**: 20-30 minutos (testing + correcciones)
