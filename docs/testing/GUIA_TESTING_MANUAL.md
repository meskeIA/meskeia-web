# 🧪 Guía de Testing Manual de Accesibilidad

## 📅 Fecha: 2025-01-22

---

## 🎯 Objetivo

Validar que las 3 apps migradas cumplen con estándares de accesibilidad WCAG 2.1 nivel AA mediante testing manual.

**Tiempo estimado**: 60-90 minutos total (20-30 min por app)

---

## 📋 PREPARACIÓN

### 1. Iniciar Servidor de Desarrollo

```bash
cd "C:\Users\jaceb\meskeia-web-nextjs"
npm run dev
```

**Verificar**: El servidor debe estar corriendo en `http://localhost:3000`

### 2. Apps a Probar

1. **Calculadora de Propinas**: http://localhost:3000/calculadora-propinas
2. **Generador de Contraseñas**: http://localhost:3000/generador-contrasenas
3. **Calculadora de Porcentajes**: http://localhost:3000/calculadora-porcentajes

---

## 🎹 TESTING 1: Navegación por Teclado (30 min)

### Objetivo
Verificar que TODOS los elementos interactivos son accesibles sin ratón.

### Protocolo

#### Para cada app:

**1. Abrir la app en navegador**

**2. Recargar página (Ctrl+R)**

**3. Presionar Tab repetidamente** y verificar:

✅ **Checklist de elementos que DEBEN recibir focus**:

- [ ] Logo meskeIA (si es clickeable)
- [ ] Todos los inputs de texto/número
- [ ] Todos los botones
- [ ] Todos los selectores (select)
- [ ] Todos los checkboxes (si aplica)
- [ ] Todos los radios (si aplica)
- [ ] Slider de rango (si aplica)
- [ ] Botón de tema (dark/light) - ThemeToggle
- [ ] Botón "Compártela" del footer
- [ ] Enlaces en secciones educativas

**4. Verificar Focus Visible**:

Para CADA elemento que recibe focus:
- [ ] ¿Se ve un outline azul (`#2E86AB`) o box-shadow?
- [ ] ¿El outline tiene offset (no pegado al borde)?
- [ ] ¿Es claramente visible sobre fondo claro Y oscuro?

**5. Probar Funcionalidad con Teclado**:

**Inputs**:
- [ ] `Tab` enfoca el input
- [ ] Puedo escribir normalmente
- [ ] `Shift+Tab` va al elemento anterior

**Botones**:
- [ ] `Tab` enfoca el botón
- [ ] `Enter` activa el botón
- [ ] `Space` también activa el botón
- [ ] La acción se ejecuta correctamente

**Selects**:
- [ ] `Tab` enfoca el select
- [ ] `Arrow Down` abre opciones
- [ ] `Arrow Up/Down` navega opciones
- [ ] `Enter` selecciona opción
- [ ] `Escape` cierra sin cambiar

**Checkboxes**:
- [ ] `Tab` enfoca el checkbox
- [ ] `Space` marca/desmarca

**Sliders** (generador-contraseñas):
- [ ] `Tab` enfoca el slider
- [ ] `Arrow Right/Left` cambia valor
- [ ] El valor se actualiza visualmente

**6. Completar Flujo Completo SIN RATÓN**:

**Calculadora de Propinas**:
```
1. Tab hasta input "Monto"
2. Escribir "50"
3. Tab hasta botón "15%"
4. Space para activar
5. Tab hasta input "Personas"
6. Escribir "2"
7. Verificar que resultados se actualizan
```

**Generador de Contraseñas**:
```
1. Tab hasta slider "Longitud"
2. Arrow Right hasta 20
3. Tab hasta checkbox "Mayúsculas"
4. Space para marcar
5. Tab hasta botón "Generar"
6. Enter para generar
7. Verificar que contraseña aparece
```

**Calculadora de Porcentajes**:
```
1. Tab hasta primer tab (si tiene tabs)
2. Arrow Right para cambiar tab (si aplica)
3. Tab hasta input principal
4. Escribir valor
5. Tab hasta botón calcular
6. Enter para calcular
7. Verificar resultados
```

**7. Documentar Problemas**:

| App | Elemento | Problema | Prioridad |
|-----|----------|----------|-----------|
| Ej: Propinas | Botón "10%" | No recibe focus | 🔴 Alta |
| | | | |

---

## 🔦 TESTING 2: Lighthouse Accessibility Audit (15 min)

### Objetivo
Obtener score > 90 en Accessibility para cada app.

### Protocolo

#### Para cada app:

**1. Abrir app en Chrome/Edge**

**2. Abrir DevTools**:
- Presionar `F12`
- O Click derecho → "Inspeccionar"

**3. Ir a pestaña Lighthouse**:
- Click en "Lighthouse" en barra superior de DevTools
- Si no aparece, click en `>>` y seleccionar

**4. Configurar Audit**:
- **Mode**: Navigation (default)
- **Categories**: Desmarcar todas EXCEPTO "Accessibility"
- **Device**: Desktop

**5. Ejecutar**:
- Click "Analyze page load"
- Esperar ~30 segundos

**6. Revisar Resultados**:

**Score Objetivo**: > 90

**Si Score < 90**, revisar sección "Accessibility":

Anotar TODOS los issues:

| Issue | Descripción | Elementos Afectados |
|-------|-------------|---------------------|
| | | |

**Tipos comunes de issues**:
- ❌ Elementos sin labels
- ❌ Contraste insuficiente
- ❌ IDs duplicados
- ❌ Missing alt text
- ❌ ARIA attributes incorrectos

**7. Documentar Scores**:

| App | Score | Issues Críticos | Issues Menores |
|-----|-------|----------------|----------------|
| Calculadora Propinas | | | |
| Generador Contraseñas | | | |
| Calculadora Porcentajes | | | |

---

## 📢 TESTING 3: Screen Reader NVDA (30 min - OPCIONAL)

### Objetivo
Verificar que lectores de pantalla leen correctamente toda la interfaz.

### Preparación

**1. Descargar NVDA**:
- Ir a: https://www.nvaccess.org/download/
- Click "Download"
- Instalar versión portable (no requiere instalación)

**2. Abrir NVDA**:
- Ejecutar `nvda.exe`
- O presionar `Ctrl+Alt+N` si instalaste

**3. Volumen**:
- Asegúrate de tener volumen audible
- NVDA hablará en español si Windows está en español

### Protocolo

#### Para cada app:

**1. Abrir app con NVDA activo**

**2. Comenzar desde arriba**:
- Presionar `Ctrl+Home` (ir al inicio)

**3. Navegar con Arrow Down**:
- `Arrow Down`: Lee siguiente elemento
- Escucha qué anuncia NVDA

**4. Verificar que NVDA anuncia**:

**Headers**:
- [ ] "Encabezado nivel 1: [Título de la app]"
- [ ] "Encabezado nivel 2: [Subsecciones]"

**Labels de Inputs**:
- [ ] "Monto de la cuenta (€), edición, vacío"
- [ ] Si escribe número: "50"
- [ ] NO debe decir solo "edición" sin label

**Botones**:
- [ ] "Limpiar, botón" (NO solo "botón")
- [ ] "10%, botón" (NO solo "botón sin nombre")

**Resultados**:
- [ ] "Total: 50,00 €" (debe leer el valor)

**5. Navegar con Tab**:
- Presionar `Tab` (como en Testing 1)
- NVDA debe anunciar cada elemento
- Verificar que anuncia rol + label + valor

**6. Probar Cambios Dinámicos**:
- Escribir en input
- NVDA debe anunciar el valor al escribir
- Calcular resultado
- NVDA debe anunciar el nuevo resultado (si tiene aria-live)

**7. Documentar Confusiones**:

| App | Elemento | Qué anuncia NVDA | Qué DEBERÍA anunciar |
|-----|----------|------------------|----------------------|
| | | | |

**8. Cerrar NVDA**:
- `NVDA+Q` (Insert+Q)
- O Click derecho en icono de bandeja → Exit

---

## 📊 RESUMEN DE RESULTADOS

### Formato de Reporte

Después de completar todos los tests, rellenar:

---

## 🧪 RESULTADOS DE TESTING

**Fecha**: 2025-01-22
**Tester**: [Tu nombre]

---

### App 1: Calculadora de Propinas

#### Keyboard Navigation
- **Score**: ☐ Excelente ☐ Bueno ☐ Necesita mejoras
- **Elementos sin focus**: [Listar si hay]
- **Focus no visible**: [Listar si hay]
- **Flujo completo**: ☐ Completado sin ratón ☐ Requirió ratón

#### Lighthouse Accessibility
- **Score**: ___/100
- **Issues críticos**: [Listar]
- **Issues menores**: [Listar]

#### NVDA (Opcional)
- **Labels leídos correctamente**: ☐ Sí ☐ No (especificar)
- **Botones descriptivos**: ☐ Sí ☐ No (especificar)
- **Confusiones encontradas**: [Listar]

#### Problemas Encontrados
| Prioridad | Problema | Sugerencia de Fix |
|-----------|----------|-------------------|
| | | |

---

### App 2: Generador de Contraseñas

[Mismo formato que App 1]

---

### App 3: Calculadora de Porcentajes

[Mismo formato que App 1]

---

### Resumen General

**Apps que PASAN (Score > 90)**: ___/3
**Apps que NECESITAN mejoras**: ___/3

**Problemas más comunes**:
1.
2.
3.

**Siguiente paso**:
☐ Corregir issues críticos
☐ Todas las apps pasan, continuar con migraciones
☐ Re-test después de correcciones

---

## 🔧 CORRECCIONES COMUNES

Si encuentras estos problemas, aquí están las soluciones:

### 1. Input sin label leído por NVDA
**Problema**: NVDA dice "edición, vacío" sin nombre

**Fix**:
```tsx
// Antes
<input type="number" placeholder="Monto" />

// Después
<label htmlFor="monto">Monto de la cuenta (€)</label>
<input type="number" id="monto" />
```

### 2. Botón sin descripción
**Problema**: NVDA dice "botón" sin nombre

**Fix**:
```tsx
// Antes
<button>🔄</button>

// Después
<button>🔄 Limpiar</button>
// O
<button aria-label="Limpiar calculadora">🔄</button>
```

### 3. Focus no visible
**Problema**: No se ve outline al presionar Tab

**Fix**: Ya implementado en `globals.css`, verificar que no esté sobrescrito en CSS del componente

### 4. Contraste insuficiente
**Problema**: Lighthouse reporta contraste bajo

**Fix**: Ya corregido `--text-muted` a `#757575`, verificar uso

### 5. Tabs sin keyboard navigation
**Problema**: Arrow keys no cambian tabs en calculadora-porcentajes

**Fix**: Ver documento `TESTING_ACCESIBILIDAD_RESULTADOS.md` sección "Tabs ARIA completos"

---

## ✅ Checklist Final

Antes de considerar testing completo:

- [ ] Las 3 apps probadas con keyboard navigation
- [ ] Focus visible en TODOS los elementos
- [ ] Lighthouse score > 90 en las 3 apps
- [ ] (Opcional) NVDA probado en al menos 1 app
- [ ] Problemas documentados
- [ ] Issues priorizados (🔴 Alta, 🟡 Media, 🟢 Baja)

---

**Próximo paso**: Informar a Claude de los resultados para que implemente correcciones.

**Formato**: "He completado el testing. Resultados: [resumen]. Issues críticos: [lista]"

---

**Tiempo invertido**: ___ minutos
**Apps que pasan**: ___/3
**Correcciones necesarias**: ☐ Sí ☐ No

