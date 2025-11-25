# 📋 PLAN DE REESTRUCTURACIÓN COMPLETA - meskeIA Next.js v2.0

**Fecha:** 2025-11-25
**Objetivo:** Reestructurar TODA la web desde el principio, app por app, usando componentes v2.0
**Estrategia:** Mejor romper ahora que la web no está en producción

---

## 🎯 FILOSOFÍA DEL PLAN

✅ **SÍ romper cosas** - La web no está en producción
✅ **SÍ reestructurar todo** - Código consistente desde el inicio
✅ **SÍ usar componentes v2.0** en TODAS las apps
✅ **NO preocuparse** por el tráfico actual (web vieja sigue online)

---

## 📊 SITUACIÓN ACTUAL

### Apps Implementadas: 28 de 84
- 26 apps con código "viejo" (sin componentes v2.0)
- 2 apps con código "nuevo" (Álgebra, Trigonometría)

### Componentes v2.0 Disponibles:
- ✅ `<NumberInput />` - Input con formato español
- ✅ `<ResultCard />` - Cards de resultados (5 variantes)
- ✅ `<EducationalSection />` - Contenido educativo colapsable
- ✅ `lib/formatters.ts` - 9 funciones de formato
- ✅ `<MeskeiaLogo />`, `<Footer />` - Componentes básicos

---

## 🚀 PLAN DE EJECUCIÓN (ORDEN ESTRICTO)

### **FASE 0: Páginas Base y Estructura** (1-2 días)

#### 0.1. Página Principal (Homepage)
**Archivo:** `app/page.tsx`

**Estado actual:** ✅ Funcional
**Componentes usados:**
- `<FixedHeader />` ✅
- `<WhyMeskeIA />` ✅
- `<FAQ />` ✅
- `<HomeFooter />` ✅

**Acción:**
- [x] Revisar que usa componentes modernos
- [ ] Verificar que `data/applications.ts` está actualizado (solo 28 apps activas)
- [ ] Actualizar contador de apps en página (mostrar "28 aplicaciones" en lugar de 84)
- [ ] Verificar dark mode completo
- [ ] Verificar responsive design

**Prioridad:** ALTA (es la entrada principal)

---

#### 0.2. Páginas Institucionales

**Páginas a revisar:**
1. `/acerca` - Acerca de meskeIA
2. `/privacidad` - Política de privacidad
3. `/terminos` - Términos y condiciones
4. `/herramientas` - Directorio de herramientas
5. `/guias` - Guías educativas (REVISAR PROBLEMAS)

**Acción para cada página:**
- [ ] Verificar que usa `<MeskeiaLogo />` y `<Footer />`
- [ ] Verificar dark mode
- [ ] Verificar responsive
- [ ] Actualizar contenido si es necesario
- [ ] Decidir sobre `/guias` (tiene problemas de adaptación)

**Prioridad:** ALTA (son páginas visibles desde inicio)

---

### **FASE 1: Reestructurar Apps Existentes** (5-7 días)

**Objetivo:** Todas las 28 apps con componentes v2.0

#### Orden de reestructuración (por complejidad creciente):

##### **Grupo A: Apps Simples** (1-2 días, ~10 apps)
Apps con 1-2 inputs y 1-2 resultados

1. ✅ **calculadora-porcentajes** - 2 inputs, resultado simple
2. ✅ **calculadora-propinas** - 2 inputs, propina
3. ✅ **calculadora-fechas** - Date pickers, diferencia
4. ✅ **conversor-tallas** - Selects, conversión
5. ✅ **regla-de-tres** - 3 inputs, resultado
6. ✅ **generador-contrasenas** - Opciones, resultado
7. ✅ **calculadora-cocina** - Conversiones simples
8. ✅ **conversor-divisas** - 2 selects, cantidad

**Template común:**
```tsx
<NumberInput value={x} onChange={setX} />
<ResultCard title="Resultado" value={result} />
<EducationalSection>Contenido educativo</EducationalSection>
```

---

##### **Grupo B: Apps Intermedias** (2-3 días, ~10 apps)
Apps con múltiples inputs y/o gráficos

9. ✅ **interes-compuesto** - 4 inputs, gráfico Chart.js
10. ✅ **calculadora-inversiones** - 5 inputs, gráfico
11. ✅ **calculadora-jubilacion** - 6 inputs, tabla + gráfico
12. ✅ **simulador-hipoteca** - 4 inputs, tabla amortización
13. ✅ **control-gastos-mensual** - Multiple inputs, gráficos
14. ✅ **simulador-irpf** - Formulario complejo, cálculo
15. ✅ **tir-van** - Array de flujos, cálculos
16. ✅ **lista-compras** - LocalStorage, categorías

**Necesitan:**
- `chartjs_nextjs.txt` (agente)
- `localstorage_nextjs.txt` (agente)
- Múltiples `<NumberInput />`
- Múltiples `<ResultCard />`

---

##### **Grupo C: Apps Fiscales** (1-2 días, ~4 apps)
Apps con cálculos fiscales complejos

17. ✅ **impuesto-donaciones** (Cataluña)
18. ✅ **impuesto-donaciones-nacional**
19. ✅ **impuesto-sucesiones** (Cataluña)
20. ✅ **impuesto-sucesiones-nacional**

**Necesitan:**
- Tablas de datos fiscales actualizadas
- Cálculos complejos con tramos
- Múltiples `<ResultCard />` con desglose

---

##### **Grupo D: Apps Ya Actualizadas** (0 días)
Apps que ya usan componentes v2.0

21. ✅ **algebra-ecuaciones** - YA HECHA ✅
22. ✅ **trigonometria** - YA HECHA ✅

---

##### **Grupo E: Apps Test** (eliminar?)
23. ⚠️ **test-page** - ELIMINAR? (solo para pruebas)

---

**Total Fase 1:** 22 apps a reestructurar (6-8 días)

---

### **FASE 2: Crear Apps Faltantes Prioritarias** (8-10 días)

Apps con alta demanda o valor educativo

#### Matemáticas y Ciencias (Prioridad ALTA)
24. ❌ **Cálculo Diferencial** - Derivadas con visualización
25. ❌ **Geometría Interactiva** - Canvas API, figuras
26. ❌ **Estadística Descriptiva** - Chart.js, análisis
27. ❌ **Calculadora de Matrices** - Operaciones matriciales
28. ❌ **Física - Cinemática** - Animaciones, gráficos

#### MEGA CONVERSOR Universal (Fusión)
29. ❌ **Conversor Universal** - Fusionar múltiples conversores
   - Unidades (longitud, peso, volumen)
   - Temperaturas
   - Divisas (ya existe, integrar)
   - Bases numéricas

#### Productividad
30. ❌ **Generador de QR** - Códigos QR con opciones
31. ❌ **Contador de Palabras** - Análisis de texto
32. ❌ **Generador Lorem Ipsum** - Texto placeholder

#### Salud
33. ❌ **Calculadora IMC** - BMI con interpretación
34. ❌ **Calculadora Calorías** - TDEE, macros
35. ❌ **Seguimiento Hábitos** - Tracker con localStorage

---

### **FASE 3: Apps Secundarias y Especializadas** (5-7 días)

#### Creatividad y Diseño
36. ❌ **Generador Gradientes CSS** - Color picker
37. ❌ **Paleta de Colores** - Generador de paletas
38. ❌ **Generador Sombras CSS** - Shadow generator

#### Juegos
39. ❌ **Juego Memoria** - Cartas, niveles
40. ❌ **Sudoku** - Generador, solver
41. ❌ **Ahorcado** - Palabras español

---

### **FASE 4: Testing, SEO y Optimización** (3-5 días)

- [ ] Testing con Playwright de TODAS las apps
- [ ] SEO completo (metadata.ts) en todas
- [ ] Performance optimization
- [ ] Accesibilidad (ARIA labels)
- [ ] Dark mode verification
- [ ] Mobile responsive verification

---

## 📋 CHECKLIST POR APP (Template)

Cada app debe cumplir:

### Estructura:
- [ ] `metadata.ts` con SEO completo
- [ ] `page.tsx` con componentes v2.0
- [ ] `.module.css` con dark mode
- [ ] Usar `'use client'` si necesario

### Componentes obligatorios:
- [ ] `<MeskeiaLogo />` al inicio
- [ ] `<NumberInput />` para inputs numéricos
- [ ] `<ResultCard />` para resultados
- [ ] `<EducationalSection />` si tiene contenido educativo
- [ ] `<Footer appName="..." />` al final

### Utilidades:
- [ ] Usar `formatNumber()`, `formatCurrency()`, etc.
- [ ] Usar `parseSpanishNumber()` para inputs
- [ ] Usar `isValidNumber()` para validación

### Calidad:
- [ ] Dark mode completo
- [ ] Responsive design (móvil, tablet, desktop)
- [ ] Accesibilidad (ARIA)
- [ ] TypeScript sin errores
- [ ] Testing con Playwright

---

## 🎯 DECISIONES PENDIENTES

### 1. Página de Guías
**Problema:** "Había algunos problemas de adaptación"

**Opciones:**
- A) Arreglar problemas y mantener `/guias`
- B) Eliminar `/guias` por ahora, crear después
- C) Fusionar con `/herramientas`

**Decisión:** Pendiente del usuario

---

### 2. Test Page
**Pregunta:** ¿Eliminar `/test-page`?

**Opciones:**
- A) Eliminar (no necesaria en producción)
- B) Mantener para desarrollo (útil para pruebas)

**Decisión:** Pendiente del usuario

---

### 3. Orden de Prioridad
**Pregunta:** ¿Empezar por reestructurar o crear nuevas?

**Opción elegida por usuario:**
1. ✅ Páginas base (homepage, institucionales)
2. ✅ Reestructurar 22 apps existentes
3. ✅ Crear apps faltantes

---

## 📊 RESUMEN EJECUTIVO

### Tiempo Total Estimado: 20-25 días
- Fase 0: 1-2 días (páginas base)
- Fase 1: 6-8 días (reestructurar 22 apps)
- Fase 2: 8-10 días (crear 12 apps prioritarias)
- Fase 3: 5-7 días (apps secundarias)
- Fase 4: 3-5 días (testing y optimización)

### Total de Apps al Final: ~50-60 apps
- 28 existentes reestructuradas
- 25-30 nuevas creadas

### Calidad Garantizada:
- ✅ 100% componentes v2.0
- ✅ 100% dark mode completo
- ✅ 100% responsive
- ✅ 100% TypeScript
- ✅ 100% SEO optimizado

---

## 🚀 INICIO INMEDIATO

**Empezar por:**
1. ✅ Revisar homepage (`app/page.tsx`)
2. ✅ Actualizar contador de apps en homepage (28 en lugar de 84)
3. ✅ Revisar páginas institucionales (Acerca, Términos, Privacidad, Herramientas)
4. ❓ Decidir qué hacer con `/guias`
5. ⏭️ Empezar reestructuración Grupo A (apps simples)

---

**Fecha:** 2025-11-25
**Estado:** Plan creado, pendiente de aprobación
**Próximo paso:** Empezar Fase 0 (páginas base)
