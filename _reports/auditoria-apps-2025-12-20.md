# Auditoría de Apps meskeIA - 2025-12-20

## Resumen Ejecutivo

- **Total apps principales**: 191
- **Calculadoras/Simuladores analizados**: 54
- **Apps con potencial de mejora identificadas**: 15-20

---

## 1. Calculadoras Financieras sin Multi-Escenario

Apps que podrían beneficiarse de comparar múltiples escenarios (como amortizacion-hipoteca):

| App | Líneas | Mejora sugerida |
|-----|--------|-----------------|
| calculadora-inversiones | 473 | Comparar diferentes importes/plazos |
| calculadora-jubilacion | 454 | Comparar escenarios de ahorro |
| calculadora-inflacion | 356 | Comparar períodos históricos |
| calculadora-roi-marketing | 439 | Comparar campañas |
| calculadora-break-even | 472 | Comparar escenarios de costes |
| simulador-prestamos | 443 | Comparar diferentes préstamos |
| calculadora-plusvalias-irpf | 475 | Comparar ventas |
| calculadora-suscripciones | 460 | Ya tiene multi-item, revisar |

**Prioridad alta**: calculadora-inversiones, calculadora-jubilacion, simulador-prestamos

---

## 2. Apps Numéricas sin Gráficos

Apps que manejan datos evolutivos y podrían visualizarse mejor:

| App | Líneas | Tipo de gráfico sugerido |
|-----|--------|--------------------------|
| calculadora-imc | 369 | Rangos visuales (gauge) |
| calculadora-inversiones | 473 | Evolución del capital (línea) |
| calculadora-jubilacion | 454 | Proyección de ahorro (área) |
| calculadora-inflacion | 356 | Pérdida de poder adquisitivo (línea) |
| calculadora-estadistica | 411 | Distribución de datos (histograma) |

**Prioridad alta**: calculadora-inversiones (ya que también necesita multi-escenario)

---

## 3. Apps Pequeñas con Potencial de Expansión

Apps muy básicas (<300 líneas) que podrían ofrecer más funcionalidad:

| App | Líneas | Estado actual | Expansión posible |
|-----|--------|---------------|-------------------|
| calculadora-iva | 180 | Solo cálculo básico | Añadir tipos IVA por país/producto |
| calculadora-descuentos | 202 | Solo % simple | Añadir descuentos encadenados |
| calculadora-porcentajes | 242 | Operaciones básicas | Añadir más casos de uso |

**Prioridad baja**: Son útiles por su simplicidad

---

## 4. Apps sin EducationalSection

13 calculadoras no tienen contenido educativo colapsable:

- Revisar si aplica añadir guía educativa
- Algunas son puramente utilitarias y no lo necesitan

**Acción**: Revisar caso por caso, no prioritario

---

## 5. Simuladores Financieros

Estado actual de los 4 simuladores:

| App | Líneas | Estado |
|-----|--------|--------|
| simulador-hipoteca | 494 | ✅ Completo (tiene amortizacion-hipoteca como complemento) |
| simulador-prestamos | 443 | ⚠️ Sin multi-escenario |
| simulador-irpf | 592 | ✅ Completo |
| simulador-gastos-deducibles | 501 | ✅ Completo |

---

## Recomendación de Prioridades

### Alta prioridad (mayor impacto):
1. **calculadora-inversiones** - Añadir multi-escenario + gráfico evolución
2. **simulador-prestamos** - Añadir comparativa de préstamos
3. **calculadora-jubilacion** - Añadir escenarios de ahorro

### Media prioridad:
4. calculadora-inflacion - Visualización temporal
5. calculadora-roi-marketing - Comparar campañas
6. calculadora-imc - Gauge visual de rangos

### Baja prioridad:
- Apps pequeñas que funcionan bien por su simplicidad
- EducationalSection en apps puramente utilitarias

---

## Próximos Pasos

Este informe se puede actualizar ejecutando el análisis periódicamente.
Seleccionar 1-2 apps de alta prioridad por sesión de trabajo.

---

*Generado automáticamente - 2025-12-20*
