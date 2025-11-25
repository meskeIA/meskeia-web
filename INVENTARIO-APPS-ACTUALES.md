# 📊 INVENTARIO DE APLICACIONES ACTUALES - meskeIA Next.js

**Fecha:** 2025-11-25
**Total de apps en Next.js:** 26 aplicaciones
**Estado:** Análisis para reestructuración

---

## 🎯 APPS ACTUALES EN NEXT.JS

### 💰 Finanzas y Fiscalidad (11 apps)

1. ✅ **calculadora-inversiones** - Rentabilidad de inversiones
2. ✅ **calculadora-jubilacion** - Planificación de jubilación
3. ✅ **calculadora-porcentajes** - Cálculos de porcentajes
4. ✅ **calculadora-propinas** - Calculadora de propinas
5. ✅ **control-gastos-mensual** - Control de gastos
6. ✅ **impuesto-donaciones** - Impuesto sobre donaciones (regional)
7. ✅ **impuesto-donaciones-nacional** - Impuesto donaciones nacional
8. ✅ **impuesto-sucesiones** - Impuesto sobre sucesiones (regional)
9. ✅ **impuesto-sucesiones-nacional** - Impuesto sucesiones nacional
10. ✅ **interes-compuesto** - Interés compuesto con visualización
11. ✅ **simulador-hipoteca** - Simulador de hipotecas
12. ✅ **simulador-irpf** - Simulador IRPF
13. ✅ **tir-van** - TIR y VAN para inversiones

**Total Finanzas:** 13 apps

---

### 📐 Matemáticas y Ciencias (2 apps)

1. ✅ **algebra-ecuaciones** - Resolución de ecuaciones (NUEVA - creada desde cero)
2. ✅ **trigonometria** - Funciones trigonométricas

**Total Matemáticas:** 2 apps

---

### 🔧 Conversores y Calculadoras (6 apps)

1. ✅ **calculadora-cocina** - Conversiones de cocina
2. ✅ **calculadora-fechas** - Cálculo de fechas
3. ✅ **conversor-divisas** - Conversión de divisas
4. ✅ **conversor-tallas** - Conversión de tallas
5. ✅ **regla-de-tres** - Regla de tres
6. ✅ **lista-compras** - Lista de compras interactiva

**Total Conversores:** 6 apps

---

### 🔐 Seguridad y Utilidades (1 app)

1. ✅ **generador-contrasenas** - Generador de contraseñas seguras

**Total Seguridad:** 1 app

---

### 📄 Páginas Institucionales (4 páginas)

1. ✅ **page.tsx** - Homepage
2. ✅ **acerca** - Acerca de meskeIA
3. ✅ **privacidad** - Política de privacidad
4. ✅ **terminos** - Términos y condiciones
5. ✅ **herramientas** - Directorio de herramientas
6. ✅ **guias** - Guías educativas

**Total Institucionales:** 6 páginas

---

### 🧪 Testing (1 página)

1. ✅ **test-page** - Página de pruebas

**Total Testing:** 1 página

---

## 📊 RESUMEN POR CATEGORÍA

| Categoría | Apps Actuales | Completitud |
|-----------|---------------|-------------|
| 💰 Finanzas y Fiscalidad | 13 | ⭐⭐⭐⭐⭐ Alta |
| 📐 Matemáticas y Ciencias | 2 | ⭐⭐ Baja |
| 🔧 Conversores y Calculadoras | 6 | ⭐⭐⭐ Media |
| 🔐 Seguridad y Utilidades | 1 | ⭐ Muy baja |
| 📄 Institucionales | 6 | ⭐⭐⭐⭐⭐ Completa |
| **TOTAL** | **28** | **52%** |

---

## 🎯 ANÁLISIS DE CALIDAD

### ✅ Apps con Componentes Nuevos (Usando v2.0)

**Solo 2 apps usan los componentes nuevos:**
1. ✅ **algebra-ecuaciones** - Usa NumberInput, ResultCard, EducationalSection
2. ✅ **trigonometria** - Usa componentes básicos

**Resto de apps (24)**: Usan código anterior a componentes v2.0

---

## 🔍 APPS QUE NECESITAN REESTRUCTURACIÓN

### Prioridad ALTA (Tráfico alto, código viejo)

1. **interes-compuesto** ⚠️
   - Estado: Funcional pero SIN componentes v2.0
   - Acción: Reestructurar con NumberInput, ResultCard, EducationalSection
   - Razón: Alta prioridad, mucho tráfico

2. **calculadora-porcentajes** ⚠️
   - Estado: Funcional pero SIN componentes v2.0
   - Acción: Reestructurar con componentes
   - Razón: App básica, tráfico alto

3. **simulador-hipoteca** ⚠️
   - Estado: Funcional pero SIN componentes v2.0
   - Acción: Reestructurar + añadir gráficos (Chart.js)
   - Razón: App compleja, beneficio alto de gráficos

4. **control-gastos-mensual** ⚠️
   - Estado: Funcional pero SIN componentes v2.0
   - Acción: Reestructurar + añadir gráficos
   - Razón: Visualización crítica

---

### Prioridad MEDIA (Funcionales, mejorar progresivamente)

5. **calculadora-inversiones**
6. **calculadora-jubilacion**
7. **conversor-divisas**
8. **simulador-irpf**
9. **tir-van**
10. **generador-contrasenas**

---

### Prioridad BAJA (Funcionales, reestructurar si hay tiempo)

11-24. Resto de apps financieras y conversores

---

## 📋 APPS FALTANTES (Según ESTRATEGIA-NUEVA-WEB-MESKEIA.md)

### Matemáticas y Ciencias (Faltan muchas)

**Faltan:**
- ❌ Cálculo Diferencial
- ❌ Geometría Interactiva
- ❌ Estadística Descriptiva
- ❌ Calculadora de Matrices
- ❌ Resolución de Integrales
- ❌ Calculadora de Probabilidades
- ❌ Física (Cinemática, Dinámica, etc.)
- ❌ Química (Estequiometría, Tabla Periódica)

**Total faltantes Matemáticas:** ~8-10 apps

---

### Conversores (Fusionar en MEGA CONVERSOR)

**Idea:** Crear 1 MEGA CONVERSOR en lugar de múltiples apps pequeñas

**Funcionalidades que debería tener:**
- Unidades de medida (longitud, peso, volumen)
- Temperaturas
- Divisas (tiempo real)
- Zonas horarias
- Velocidades
- Energía
- Bases numéricas

**Estado:** Tenemos conversores separados, falta fusionar

---

### Productividad y Herramientas

**Faltan:**
- ❌ Generador de QR
- ❌ Acortador de URLs (o referencia a servicio)
- ❌ Contador de Palabras/Caracteres
- ❌ Generador de Lorem Ipsum
- ❌ Conversor de Markdown/HTML

**Total faltantes Productividad:** ~5 apps

---

### Salud y Bienestar

**Faltan:**
- ❌ Calculadora de IMC
- ❌ Calculadora de Calorías
- ❌ Seguimiento de Hábitos
- ❌ Calculadora de Agua Diaria

**Total faltantes Salud:** ~4 apps

---

### Creatividad y Diseño

**Faltan:**
- ❌ Generador de Gradientes CSS
- ❌ Paleta de Colores
- ❌ Generador de Sombras CSS
- ❌ Conversor de Colores (HEX/RGB/HSL)

**Total faltantes Diseño:** ~4 apps

---

### Juegos y Entretenimiento

**Faltan:**
- ❌ Juego de Memoria
- ❌ Sudoku
- ❌ Ahorcado
- ❌ Quiz de Cultura General

**Total faltantes Juegos:** ~4 apps

---

## 📊 RESUMEN EJECUTIVO

### Estado Actual:
- ✅ **28 apps/páginas** en Next.js
- ✅ **Infraestructura completa** (componentes, utilidades, agentes)
- ⚠️ Solo **2 apps usan componentes v2.0**
- ⚠️ **24 apps necesitan reestructuración** para usar componentes

### Apps Faltantes (según estrategia):
- ❌ Matemáticas y Ciencias: ~8-10 apps
- ❌ Productividad: ~5 apps
- ❌ Salud: ~4 apps
- ❌ Diseño: ~4 apps
- ❌ Juegos: ~4 apps
- **Total faltantes:** ~25-30 apps

### Total Proyectado:
- Apps actuales: 28
- Apps faltantes: 25-30
- **Total objetivo:** 50-60 apps de calidad

---

## 🎯 RECOMENDACIONES ESTRATÉGICAS

### Opción A: REESTRUCTURAR TODO LO EXISTENTE PRIMERO
**Ventajas:**
- Código consistente desde el principio
- Todos usan componentes v2.0
- Fácil mantenimiento futuro

**Desventajas:**
- Tiempo significativo (1-2 semanas)
- No añade valor funcional inmediato

**Tiempo estimado:** 10-15 días

---

### Opción B: REESTRUCTURAR SOLO TOP 10 + CREAR NUEVAS
**Ventajas:**
- Balance entre mejora y avance
- Apps prioritarias con mejor calidad
- Nuevas funcionalidades más rápido

**Desventajas:**
- Código no 100% consistente
- Mezcla de apps "viejas" y "nuevas"

**Tiempo estimado:** 5-7 días reestructuración + desarrollo nuevo

---

### Opción C: CREAR NUEVAS PRIMERO, REESTRUCTURAR DESPUÉS
**Ventajas:**
- Completitud funcional rápida
- Momentum de desarrollo
- Todas las nuevas usan componentes v2.0

**Desventajas:**
- Deuda técnica temporal en apps existentes
- Inconsistencia visual/código

**Tiempo estimado:** Desarrollo continuo, reestructuración paralela

---

## 💡 RECOMENDACIÓN FINAL

**Enfoque HÍBRIDO (Opción B+):**

1. **Semana 1:** Reestructurar TOP 5 apps (tráfico alto)
   - interes-compuesto
   - calculadora-porcentajes
   - simulador-hipoteca
   - control-gastos-mensual
   - calculadora-inversiones

2. **Semana 2-3:** Crear apps prioritarias faltantes
   - Matemáticas (Cálculo, Geometría, Estadística)
   - MEGA CONVERSOR Universal
   - Productividad (Top 3)

3. **Semana 4:** Reestructurar resto de apps existentes (batch)

4. **Semana 5-6:** Completar apps secundarias (Salud, Diseño, Juegos)

**Total tiempo:** 6 semanas para ~50 apps de calidad

---

**Fecha:** 2025-11-25
**Versión:** 1.0
**Estado:** Análisis completado, pendiente decisión estratégica
