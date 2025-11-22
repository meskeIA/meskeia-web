# 📊 Estrategia de Migración por Categorías

## 📅 Fecha: 2025-01-22

---

## 🎯 Por Qué Migrar por Categorías

### Ventajas:
1. ✅ **Apps similares = Protocolo replicable** - Una vez resueltos los problemas de una app, se replica al resto
2. ✅ **Optimización de Schema.org** - Cada categoría usa el mismo template de Schema
3. ✅ **Detección temprana de patrones** - Identificar issues comunes rápidamente
4. ✅ **Testing más eficiente** - Probar 5-8 apps similares de una vez
5. ✅ **Momentum psicológico** - Completar categorías enteras genera sensación de progreso

### Desventajas:
- ⚠️ Si una categoría tiene apps muy complejas, puede bloquear el progreso
- ⚠️ Menos variedad (puede ser monótono)

---

## 📋 **CATEGORÍAS DE APPS EN meskeia-web**

Análisis basado en `C:\Users\jaceb\meskeia-web\index.html`:

### **CATEGORÍA 1: Calculadoras Básicas** ⭐ EMPEZAR AQUÍ
**Total**: ~12 apps | **Complejidad**: 🟢 Baja | **Prioridad**: Alta

Apps identificadas:
- ✅ Calculadora de Propinas (YA MIGRADA)
- ✅ Calculadora de Porcentajes (YA MIGRADA)
- Calculadora de Impuestos
- Calculadora de IMC
- Calculadora de Calorías
- Calculadora de Descuentos
- Calculadora de Interés Compuesto
- Calculadora de Propina Justa
- Calculadora de Edad
- Calculadora de Días entre Fechas

**Características comunes**:
- 2-5 inputs numéricos
- Cálculos matemáticos simples
- Sin APIs externas
- Sin estado complejo
- Schema: `generateCalculatorSchema()`

**Protocolo específico**:
```typescript
// metadata.ts template
export const jsonLd = generateCalculatorSchema({
  name: 'Calculadora de X',
  calculationType: 'X',
  features: [/* ... */],
});
```

---

### **CATEGORÍA 2: Generadores** ⭐ SEGUNDA PRIORIDAD
**Total**: ~15 apps | **Complejidad**: 🟡 Media | **Prioridad**: Alta

Apps identificadas:
- ✅ Generador de Contraseñas (YA MIGRADO)
- Generador de Gradientes CSS
- Generador de Paletas de Colores
- Generador de QR
- Generador de Lorem Ipsum
- Generador de Nombres Aleatorios
- Generador de UUIDs
- Generador de Códigos de Barras
- Generador de Firmas Email
- Generador de Box-Shadow CSS

**Características comunes**:
- Generación aleatoria o algorítmica
- Botón "Generar" principal
- Copiar al portapapeles
- Preview visual (algunos)
- Schema: `generateGeneratorSchema()`

**Protocolo específico**:
```typescript
// metadata.ts template
export const jsonLd = generateGeneratorSchema({
  name: 'Generador de X',
  generatorType: 'X',
  features: [/* ... */],
});
```

---

### **CATEGORÍA 3: Conversores**
**Total**: ~10 apps | **Complejidad**: 🟢 Baja | **Prioridad**: Media

Apps identificadas:
- Conversor de Divisas
- Conversor de Unidades
- Conversor de Temperatura
- Conversor de Tiempo
- Conversor Hexadecimal/RGB
- Conversor de Moneda
- Conversor de Zonas Horarias
- Conversor Base64

**Características comunes**:
- 2 inputs (de → a)
- Conversión bidireccional
- Tablas de tasas/factores
- Schema: `generateConverterSchema()`

---

### **CATEGORÍA 4: Herramientas de Texto**
**Total**: ~8 apps | **Complejidad**: 🟡 Media | **Prioridad**: Media

Apps identificadas:
- Contador de Palabras
- Convertidor de Mayúsculas/Minúsculas
- Analizador de Texto
- Removedor de Espacios
- Comparador de Textos
- Generador de Slug
- Validador JSON

**Características comunes**:
- Textarea grande como input
- Procesamiento de strings
- Resultados en tiempo real
- Schema: `generateWebAppSchema()` (genérico)

---

### **CATEGORÍA 5: Herramientas de Productividad**
**Total**: ~12 apps | **Complejidad**: 🟡 Media-Alta | **Prioridad**: Media

Apps identificadas:
- Temporizador Pomodoro
- Cronómetro
- Lista de Tareas
- Notas Rápidas
- Generador de Horarios
- Planificador Semanal
- Seguimiento de Hábitos

**Características comunes**:
- Estado complejo (localStorage)
- Timers/intervals
- CRUD básico (crear/editar/eliminar)
- Schema: `generateWebAppSchema()`

---

### **CATEGORÍA 6: Juegos Educativos**
**Total**: ~6 apps | **Complejidad**: 🔴 Alta | **Prioridad**: Baja

Apps identificadas:
- Juego de Memoria
- Adivina el Número
- Quiz de Matemáticas
- Juego de Palabras
- Simon Dice

**Características comunes**:
- Lógica de juego compleja
- Puntuaciones y niveles
- Animaciones
- Schema: `generateWebAppSchema()`

**⚠️ Dejar para el final** - Requieren más tiempo

---

### **CATEGORÍA 7: Visualizadores**
**Total**: ~5 apps | **Complejidad**: 🔴 Alta | **Prioridad**: Baja

Apps identificadas:
- Visor de Markdown
- Visor de Código
- Editor de Imágenes Básico
- Visualizador de Datos

**Características comunes**:
- Renderizado complejo
- Librerías externas (marked.js, highlight.js)
- Canvas/SVG
- Schema: `generateWebAppSchema()`

---

### **CATEGORÍA 8: APIs y Servicios Externos**
**Total**: ~8 apps | **Complejidad**: 🔴 Muy Alta | **Prioridad**: Muy Baja

Apps identificadas:
- Clima
- Noticias
- Traductor
- Buscador de GIFs
- Mapas

**Características comunes**:
- Fetch a APIs externas
- API keys (si requieren)
- Manejo de errores de red
- Schema: `generateWebAppSchema()`

**⚠️ Dejar para el FINAL** - Dependen de servicios externos

---

## 🗺️ **PLAN DE MIGRACIÓN RECOMENDADO**

### **FASE 1: Calculadoras Básicas** (Semana 1-2)
- **Apps**: 10 calculadoras pendientes
- **Tiempo estimado**: 75 min × 10 = 12.5 horas (~2 días)
- **Objetivo**: Dominar el protocolo básico, validar Schema.org

### **FASE 2: Generadores** (Semana 2-3)
- **Apps**: 14 generadores pendientes
- **Tiempo estimado**: 75 min × 14 = 17.5 horas (~2-3 días)
- **Objetivo**: Consolidar patrón de generación + copiar al portapapeles

### **FASE 3: Conversores** (Semana 3)
- **Apps**: 10 conversores
- **Tiempo estimado**: 75 min × 10 = 12.5 horas (~2 días)
- **Objetivo**: Dominar conversión bidireccional

### **FASE 4: Herramientas de Texto** (Semana 4)
- **Apps**: 8 herramientas
- **Tiempo estimado**: 75 min × 8 = 10 horas (~1.5 días)
- **Objetivo**: Manejo de textarea y procesamiento de strings

### **FASE 5: Productividad** (Semana 4-5)
- **Apps**: 12 herramientas
- **Tiempo estimado**: 90 min × 12 = 18 horas (~2-3 días) (más tiempo por complejidad)
- **Objetivo**: Dominar localStorage y timers

### **FASE 6: Juegos + Visualizadores + APIs** (Semana 5-6)
- **Apps**: 19 apps complejas
- **Tiempo estimado**: 120 min × 19 = 38 horas (~5 días) (mucho más tiempo)
- **Objetivo**: Completar el 100% de migraciones

---

## 📊 **ESTIMACIÓN TOTAL**

| Fase | Apps | Horas | Días (8h/día) | Semanas |
|------|------|-------|---------------|---------|
| Fase 1 | 10 | 12.5 | 1.6 | 0.3 |
| Fase 2 | 14 | 17.5 | 2.2 | 0.4 |
| Fase 3 | 10 | 12.5 | 1.6 | 0.3 |
| Fase 4 | 8 | 10 | 1.3 | 0.3 |
| Fase 5 | 12 | 18 | 2.3 | 0.5 |
| Fase 6 | 19 | 38 | 4.8 | 1.0 |
| **TOTAL** | **73** | **108.5** | **13.6** | **~3** |

**+ 3 apps ya migradas = 76 apps**

⚠️ **NOTA**: Estimación basada en 81 apps pendientes del análisis original. El total puede variar según conteo exacto de `meskeia-web/index.html`.

---

## 🎯 **RECOMENDACIÓN FINAL**

### ✅ **EMPEZAR CON CALCULADORAS BÁSICAS**

**Por qué:**
1. Son las más simples
2. Ya tienes 2 migradas (protocolo validado)
3. Completar 10 apps en 2 días genera momentum
4. Schema.org ya testado con `generateCalculatorSchema()`

**Primera app a migrar**: **Calculadora de Impuestos**
- Similar a Calculadora de Propinas
- Inputs numéricos simples
- Sin APIs externas
- Alta utilidad para usuarios

---

## 📋 **CHECKLIST ANTES DE EMPEZAR FASE 1**

- [ ] Reorganizar documentación (ejecutar `REORGANIZAR_DOCS.bat`)
- [ ] Leer `GUIA_HOSTING_BETA.md` para entender deployment
- [ ] Verificar que `CHECKLIST_MIGRACION_FINAL.md` está accesible
- [ ] Preparar lista de calculadoras básicas de `meskeia-web/index.html`
- [ ] Hacer último commit antes de empezar migraciones masivas

---

**¿Listo para empezar?** 🚀

Siguiente paso: Migrar **Calculadora de Impuestos** siguiendo `docs/migracion/CHECKLIST_MIGRACION_FINAL.md`

---

© 2025 meskeIA - Estrategia de Migración
