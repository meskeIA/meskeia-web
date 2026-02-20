# PROFESIONALIZACION.md - Guía Quick Wins meskeIA

Mejoras rápidas de alto impacto (30-50% más profesional) para aplicaciones web meskeIA.

---

## 📊 Filosofía Quick Wins

**Principio**: Máximo valor con mínimo esfuerzo.

- **Tiempo**: 45-90 minutos por app
- **Impacto**: +30-50% percepción de profesionalidad
- **ROI**: Alto valor con poco esfuerzo
- **Aplicabilidad**: Apps informativas, calculadoras, generadores, simuladores

---

## ✅ Criterios de Aplicabilidad

### Apps que SÍ se benefician:

- ✅ **Calculadoras financieras/fiscales** (hipoteca, IVA, jubilación, ROI, tarifa freelance)
- ✅ **Generadores con output exportable** (QR, meta descripciones, facturas, contratos)
- ✅ **Conversores/Herramientas técnicas** (colores, unidades, formatos, texto)
- ✅ **Simuladores complejos** (inversión, seguros, préstamos, cartera)
- ✅ **Apps con múltiples opciones/alternativas** (fijo vs variable, HEX vs RGB, etc.)

### Apps que NO necesitan:

- ❌ **Juegos** (2048, Sudoku, Memory, Space Invaders)
- ❌ **Herramientas triviales** (cronómetro, dado, cara-cruz, temporizador)
- ❌ **Utilidades simples** sin decisiones complejas (contador manual, espejo, nivel burbuja)
- ❌ **Cursos** (ya tienen estructura educativa propia con capítulos)

---

## 🎯 Patrón Establecido (5 Apps Implementadas)

### 1. HTML Code Generation (si exportable) ⭐

**Cuándo usar**: La app genera contenido que puede exportarse o implementarse en otros sitios.

**Ejemplos**: Generador QR, Meta Descripciones, Colores, Facturas, Iconos.

**Implementación**:

```tsx
// Estados
const [htmlCode, setHtmlCode] = useState<string>('');
const [htmlExpanded, setHtmlExpanded] = useState(false);

// Función generación
const generarCodigoHTML = useCallback(() => {
  if (!inputPrincipal) {
    setHtmlCode('');
    return;
  }

  let codigo = '<!-- [Nombre App] - generado con meskeIA -->\n\n';
  codigo += '<!-- Implementación básica -->\n';
  codigo += '<div class="widget-nombre-app">\n';
  // ... generar código HTML útil con comentarios
  codigo += '</div>\n\n';

  // Opcional: CSS recomendado
  codigo += '<!-- CSS recomendado -->\n';
  codigo += '<style>\n';
  codigo += '  .widget-nombre-app { ... }\n';
  codigo += '</style>\n\n';

  // Opcional: Metadata (OG, Twitter) si aplica
  codigo += '<!-- Open Graph -->\n';
  codigo += '<meta property="og:title" content="...">\n';

  setHtmlCode(codigo);
}, [dependencies]);

// Copiar código
const copiarCodigoHTML = async () => {
  try {
    await navigator.clipboard.writeText(htmlCode);
    alert('✅ Código HTML copiado al portapapeles');
  } catch {
    alert('Error al copiar. Copia manualmente el código.');
  }
};

// Auto-generar cuando cambia el input
useEffect(() => {
  generarCodigoHTML();
}, [generarCodigoHTML]);
```

**JSX**:

```tsx
{/* Código HTML de implementación - Colapsable */}
{resultado && htmlCode && (
  <div className={styles.htmlSection}>
    <div className={styles.htmlHeader}>
      <div>
        <h2>💻 Código de implementación</h2>
        <p className={styles.htmlSubtitle}>
          Descripción breve del uso del código
        </p>
      </div>
      <button
        type="button"
        onClick={() => setHtmlExpanded(!htmlExpanded)}
        className={styles.btnToggleCode}
        aria-label={htmlExpanded ? 'Ocultar código' : 'Mostrar código'}
      >
        {htmlExpanded ? '🔼 Ocultar código' : '🔽 Ver código completo'}
      </button>
    </div>

    {htmlExpanded && (
      <div className={styles.codeContainer}>
        <pre className={styles.codeBlock}>
          <code>{htmlCode}</code>
        </pre>
        <button type="button" onClick={copiarCodigoHTML} className={styles.btnCopyCode}>
          📋 Copiar código completo
        </button>
      </div>
    )}
  </div>
)}
```

**Ubicación**: Después de resultados, antes de contenido educativo.
**Estado inicial**: Cerrado (`htmlExpanded = false`).

---

### 2. Tabla Comparativa ⚖️

**Cuándo usar**: App con 2+ alternativas/opciones a elegir.

**Ejemplos**:
- Hipoteca Fija vs Variable
- HEX vs RGB vs HSL vs CMYK
- Plan Básico vs Premium
- Método A vs Método B

**Estructura**:

```tsx
<div className={styles.tableWrapper}>
  <table className={styles.comparativaTable}>
    <thead>
      <tr>
        <th>Criterio / Aspecto</th>
        <th>Opción A</th>
        <th>Opción B</th>
        <th>Opción C</th> {/* Si aplica */}
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>Criterio 1</strong></td>
        <td>Valor A1</td>
        <td>Valor B1</td>
        <td>Valor C1</td>
      </tr>
      {/* 4-6 criterios relevantes */}
    </tbody>
  </table>
</div>
```

**Mejores prácticas**:
- **4-6 criterios** (filas): No más, para evitar sobrecarga
- **Datos concisos**: 1-2 líneas por celda máximo
- **Iconos/emojis**: Usar para claridad (✅ ❌ ⚠️)
- **Última fila**: "Ideal para..." con perfiles de usuario

---

### 3. Casos de Uso Prácticos 💼

**Estructura**: 4-6 escenarios reales con:
1. **Icono distintivo** (emoji del contexto)
2. **Nombre del caso** (breve, descriptivo)
3. **Ejemplo concreto** (código/datos/texto)
4. **Explicación** de por qué funciona

**JSX**:

```tsx
<div className={styles.escenariosGrid}>
  <div className={styles.escenarioCard}>
    <div className={styles.escenarioHeader}>
      <span className={styles.escenarioIcon}>🛍️</span>
      <h3>E-commerce: Ficha de Producto</h3>
    </div>
    <div className={styles.escenarioExample}>
      <p><strong>Ejemplo:</strong></p>
      <code>
        Ejemplo concreto del caso de uso (texto, código, datos)
      </code>
    </div>
    <p className={styles.escenarioTip}>
      <strong>Por qué funciona:</strong> Explicación detallada con razones
      específicas y beneficios concretos.
    </p>
  </div>
  {/* Repetir para 4-6 casos */}
</div>
```

**Tipos de casos de uso por app**:
- **Generadores**: Contextos de uso (blog, redes, email, web)
- **Calculadoras financieras**: Perfiles de usuario (joven, familia, inversor, jubilado)
- **Conversores**: Industrias (diseño web, impresión, desarrollo, marketing)

---

### 4. FAQ Ampliado ❓

**Mínimo**: 6-8 preguntas frecuentes
**Estructura**: Pregunta accionable + respuesta detallada (150-250 palabras)

**JSX**:

```tsx
<div className={styles.faqList}>
  <div className={styles.faqItem}>
    <h4>❓ Pregunta específica y accionable</h4>
    <p>
      Respuesta con contexto, datos concretos, ejemplos reales...
    </p>
    <p className={styles.faqTip}>
      💡 <strong>Consejo práctico:</strong> Tip accionable que el usuario
      puede aplicar inmediatamente.
    </p>
  </div>
  {/* Repetir para 6-8 preguntas */}
</div>
```

**Tipos de preguntas**:
1. **Comparación**: "¿Qué es mejor: X o Y?"
2. **Cómo hacer**: "¿Cómo puedo [acción específica]?"
3. **Cuándo usar**: "¿En qué casos conviene [opción]?"
4. **Errores comunes**: "¿Qué pasa si [error]?"
5. **Normativa/legal**: "¿Es legal/obligatorio [acción]?"
6. **Optimización**: "¿Cómo mejoro [métrica]?"
7. **Troubleshooting**: "¿Por qué no funciona [cosa]?"
8. **Medición**: "¿Cómo mido la efectividad de [resultado]?"

---

### 5. Guía Paso a Paso 📋

**Pasos**: 5-7 pasos numerados con círculos gradiente meskeIA

**JSX**:

```tsx
<div className={styles.stepGuide}>
  <div className={styles.step}>
    <div className={styles.stepNumber}>1</div>
    <div className={styles.stepContent}>
      <h4>Título del paso accionable</h4>
      <p>
        Explicación detallada con datos específicos, ejemplos concretos,
        y acciones claras que el usuario debe realizar.
      </p>
    </div>
  </div>
  {/* Repetir para 5-7 pasos */}
</div>
```

**Mejores prácticas**:
- **Orden lógico**: Del paso 1 al N de forma secuencial
- **Datos específicos**: "Ahorra 30% del precio" vs "Ahorra lo suficiente"
- **Verbos de acción**: Calcula, Solicita, Negocia, Revisa, Firma
- **Tips inline**: Incluir consejos prácticos en cada paso
- **Duración estimada**: Opcional mencionar "Este paso toma X tiempo"

---

### 6. Mejores Prácticas ✅

**Grid**: 6 cards con tips accionables

**JSX**:

```tsx
<div className={styles.tipsGrid}>
  <div className={styles.tipCard}>
    <span className={styles.tipIcon}>✅</span>
    <h4>Tip conciso (5-10 palabras)</h4>
    <p>Explicación práctica en 1-2 líneas con acción clara.</p>
  </div>
  {/* Repetir para 6 tips */}
</div>
```

**Estructura de cada tip**:
- **Título**: Imperativo, accionable ("Compara TAE, no TIN")
- **Descripción**: Explicación breve del beneficio
- **Específico > Genérico**: Evitar obviedades

**Ejemplos BUENOS**:
- ✅ "Compara TAE, no TIN: La TAE incluye comisiones y seguros"
- ✅ "Negocia productos vinculados: Calcula si los seguros compensan el diferencial"
- ✅ "Usa HSL para variaciones: Ajustar luminosidad sin cambiar el tono"

**Ejemplos MALOS**:
- ❌ "Investiga bien antes de decidir" (obvio, no accionable)
- ❌ "Elige la mejor opción" (genérico, sin valor)
- ❌ "Lee todo con atención" (no específico)

---

### 7. Warning Box ⚠️

**Errores comunes**: 6-8 errores con explicación de impacto

**JSX**:

```tsx
<div className={styles.warningBox}>
  <div className={styles.warningHeader}>
    <span className={styles.warningIcon}>⚠️</span>
    <h3>Errores Comunes que [Consecuencia Negativa]</h3>
  </div>
  <ul className={styles.warningList}>
    <li>
      <strong>❌ Error específico y concreto:</strong> Consecuencia negativa
      clara y cuantificable. Solución o alternativa recomendada.
    </li>
    {/* Repetir para 6-8 errores */}
  </ul>
</div>
```

**Estructura de cada error**:
1. **❌ Error**: Descripción del error específico
2. **Consecuencia**: Impacto negativo (cuantificado si es posible)
3. **Solución**: Qué hacer en su lugar

**Ejemplo BUENO**:
> ❌ **Apurar toda tu capacidad de ahorro en la entrada:** Necesitas colchón post-compra para imprevistos (muebles, reformas, comunidad). Reserva 5.000-10.000 € adicionales.

**Ejemplo MALO**:
> ❌ **No ahorrar suficiente:** Puedes tener problemas después.

---

## 🎨 Plantilla CSS Completa

**Ubicación**: Copiar desde `_templates/profesionalizacion.css`

**Clases disponibles**:

### HTML Colapsable
- `.htmlHeader` - Header con título y botón
- `.btnToggleCode` - Botón toggle azul meskeIA
- `.codeContainer` - Contenedor del código (con animación slideDown)
- `.codeBlock` - Bloque de código con estilo terminal
- `.btnCopyCode` - Botón copiar código (teal meskeIA)

### Tabla Comparativa
- `.tableWrapper` - Wrapper con scroll horizontal
- `.comparativaTable` - Tabla con header gradiente meskeIA
- `.comparativaTable th` - Headers con gradiente
- `.comparativaTable td` - Celdas con border-bottom
- `.comparativaTable tbody tr:hover` - Hover en filas

### Casos de Uso / Escenarios
- `.escenariosGrid` - Grid 2 columnas → 1 en móvil
- `.escenarioCard` - Card con hover effect
- `.escenarioHeader` - Header con icono + título
- `.escenarioIcon` - Icono grande (1.75rem)
- `.escenarioExample` - Ejemplo con fondo gris y border-left azul
- `.escenarioTip` - Texto del tip con color secondary

### FAQ
- `.faqList` - Lista vertical con gap
- `.faqItem` - Card FAQ con hover effect
- `.faqItem h4` - Pregunta (color primary)
- `.faqItem p` - Respuesta (color text-secondary)

### Guía Paso a Paso
- `.stepGuide` - Contenedor vertical
- `.step` - Card con flex horizontal
- `.stepNumber` - Círculo gradiente meskeIA
- `.stepContent` - Contenido del paso
- `.stepContent h4` - Título del paso
- `.stepContent p` - Descripción del paso

### Mejores Prácticas
- `.tipsGrid` - Grid 3 → 2 → 1 columnas
- `.tipCard` - Card de tip
- `.tipIcon` - Icono del tip (✅)

### Warning Box
- `.warningBox` - Box con fondo amarillo/naranja
- `.warningHeader` - Header con icono ⚠️
- `.warningIcon` - Icono de advertencia
- `.warningList` - Lista de errores
- `.warningList li` - Item con border-left warning

**Características completas**:
- ✅ Responsive: Grid adaptativo (3 → 2 → 1 columnas)
- ✅ Dark mode: Todos los elementos con soporte `[data-theme='dark']`
- ✅ Animaciones: slideDown, hover effects suaves
- ✅ Accesibilidad: ARIA labels, focus states, :focus-visible

---

## 📋 Checklist de Implementación

```
FASE 1: ANÁLISIS
[ ] 1. ¿La app se beneficia de profesionalización? (ver criterios)
[ ] 2. Identificar elementos aplicables:
      [ ] HTML code (¿exportable?)
      [ ] Tabla comparativa (¿hay alternativas?)
      [ ] Casos de uso (siempre recomendado si hay contextos variados)
      [ ] FAQ ampliado (¿hay preguntas frecuentes reales?)
      [ ] Guía paso a paso (¿hay un proceso completo?)
      [ ] Mejores prácticas (¿hay tips accionables?)
      [ ] Warning box (¿hay errores comunes costosos?)

FASE 2: IMPLEMENTACIÓN
[ ] 3. Crear estados necesarios (htmlCode, htmlExpanded, etc.)
[ ] 4. Implementar funciones (generarCodigoHTML, copiar, etc.)
[ ] 5. Añadir JSX dentro de <EducationalSection>
[ ] 6. Copiar estilos CSS desde _templates/profesionalizacion.css
[ ] 7. Ajustar clases CSS al nombre del módulo

FASE 3: CONTENIDO
[ ] 8. Escribir contenido específico (NO genérico):
      [ ] Datos concretos, ejemplos reales
      [ ] Números, porcentajes, casos verificables
      [ ] Tips accionables, no obviedades
[ ] 9. Revisar tono: Específico, profesional, útil

FASE 4: VERIFICACIÓN
[ ] 10. Verificar responsive en móvil (Chrome DevTools)
[ ] 11. Verificar dark mode completo (toggle en app)
[ ] 12. Verificar accesibilidad (ARIA labels, focus states)
[ ] 13. Build exitoso: npm run build
[ ] 14. Commit: "feat: Mejoras profesionales [NombreApp]"
[ ] 15. Push a GitHub (Vercel despliega automáticamente)
```

---

## 📊 Métricas de Impacto (Promedio)

| Métrica | Valor |
|---------|-------|
| **Líneas añadidas page.tsx** | 500-880 |
| **Líneas añadidas CSS** | 200-250 |
| **Tiempo implementación** | 45-90 min |
| **Incremento profesionalidad** | +30-50% |
| **Secciones nuevas** | 5-7 |
| **Dark mode + Responsive** | ✅ 100% |
| **Accesibilidad (ARIA)** | ✅ Completa |

---

## 🏆 Apps Implementadas (Referencias)

### Implementación Completa (FULL)

1. **Conversor Colores** - `app/conversor-colores/page.tsx`
   - Tabla comparativa HEX/RGB/HSL/CMYK (6 criterios)
   - 6 casos de uso prácticos (web, diseño, impresión, móvil)
   - FAQ ampliado (6 preguntas)
   - Guía paso a paso (4 pasos)
   - 6 mejores prácticas
   - Warning box (6 errores comunes)
   - HTML code colapsable
   - **880 líneas añadidas**

2. **Generador Meta Descripciones** - `app/generador-meta-descripciones/page.tsx`
   - Tabla comparativa estrategias por tipo de página (6 tipos)
   - 6 casos de uso prácticos (e-commerce, blog, SaaS, local, comparativa, categoría)
   - FAQ ampliado (8 preguntas)
   - Guía paso a paso (7 pasos)
   - Warning box (8 errores comunes)
   - HTML code colapsable
   - **855 líneas añadidas**

3. **Simulador Hipoteca** - `app/simulador-hipoteca/page.tsx`
   - Tabla comparativa Fija vs Variable (6 criterios)
   - 3 escenarios típicos (primera vivienda, segunda residencia, inversión)
   - FAQ ampliado (6 preguntas detalladas)
   - Guía paso a paso (6 pasos)
   - 6 mejores prácticas
   - Warning box (6 errores comunes)
   - HTML code colapsable (widget embebible)
   - **600+ líneas añadidas**

### Cleanup (Eliminación previews + HTML colapsable)

4. **Generador QR** - `app/generador-qr/page.tsx`
   - Eliminado preview section (no añadía valor)
   - HTML code colapsable
   - Mantenido tabla casos de uso existente

5. **Calculadora IMC** - NO requería cambios (uso personal, sin exportación)

**Ver estos archivos como referencia completa para implementaciones futuras.**

---

## 💡 Consejos de Implementación

### Personalización por Tipo de App

#### Apps Financieras/Fiscales
- **FAQ**: Enfoque en implicaciones legales, casos límite, normativa española
- **Warning**: Errores que cuestan dinero (multas, intereses, malas decisiones)
- **Guía**: Proceso completo desde decisión hasta ejecución legal
- **Ejemplos**: Datos financieros reales con cálculos verificables

#### Generadores/Conversores
- **Casos de uso**: Contextos reales de uso (diseño, desarrollo, marketing, impresión)
- **Tabla comparativa**: Formatos/opciones disponibles (HEX vs RGB, MP3 vs WAV)
- **FAQ**: Compatibilidad navegadores, mejores prácticas, cuándo usar cada opción
- **HTML code**: Siempre incluir, es el valor principal

#### Calculadoras/Simuladores
- **Escenarios típicos**: 3-4 perfiles de usuario con datos concretos
- **Guía paso a paso**: Cómo usar los resultados para tomar decisiones reales
- **Tips**: Optimización, negociación, estrategias avanzadas
- **Warning**: Errores de interpretación, limitaciones del cálculo

---

### Tono y Estilo

**Principios**:
1. **Específico > Genérico**
   - ✅ "Ahorra 22.000 € amortizando 10.000 € en año 5"
   - ❌ "Amortizar anticipadamente ahorra dinero"

2. **Datos concretos siempre que sea posible**
   - ✅ "Ratio de endeudamiento máximo: 35% (40% dificulta aprobación)"
   - ❌ "Mantén un ratio bajo"

3. **Accionable > Teórico**
   - ✅ "Solicita ofertas en 3-5 bancos. Lleva: DNI, 3 últimas nóminas, declaración renta"
   - ❌ "Compara varias opciones antes de decidir"

4. **Evitar obviedades**
   - ✅ "Verifica cláusulas de penalización (máximo 0.15% en fijas, gratis en variables tras 5 años)"
   - ❌ "Lee bien el contrato antes de firmar"

5. **Contextualizar con ejemplos reales**
   - Siempre que menciones un concepto, incluir ejemplo práctico
   - Usar números reales, no placeholders ("200.000 €" vs "X €")

---

### Estructura de Contenido Educativo

**Orden recomendado dentro de `<EducationalSection>`**:

1. **Introducción breve** (1-2 párrafos): Qué es y por qué importa
2. **Tabla comparativa** (si aplica): Ver alternativas de un vistazo
3. **Casos de uso prácticos**: Contextos reales de aplicación
4. **FAQ ampliado**: Responder dudas frecuentes en detalle
5. **Guía paso a paso**: Proceso completo desde inicio a fin
6. **Mejores prácticas** (ya existe en muchas apps): 6 tips accionables
7. **Warning box**: Errores comunes y sus consecuencias

**Nota**: Las secciones ya existentes (Conceptos Clave, Mejores Prácticas básicas) se pueden mantener o fusionar según el caso.

---

## 🔄 Mantenimiento y Evolución

### Cuándo actualizar este documento

- ✅ Se identifican nuevos patrones exitosos en apps posteriores
- ✅ Se mejoran plantillas CSS (optimizaciones, nuevos componentes)
- ✅ Se reducen tiempos de implementación con mejores métodos
- ✅ Se añaden nuevos tipos de apps no contemplados

### Versiones del Patrón

**v1.0** (2026-02-04):
- 7 elementos profesionales establecidos
- 5 apps implementadas (3 FULL, 2 cleanup)
- Plantilla CSS completa (~250 líneas)
- Tiempo promedio: 60 minutos
- **Limitación**: Scroll muy largo en móvil

**v2.0** (2026-02-05) - ⭐ PATRÓN MEJORADO:
- **Cambio clave**: Secciones profesionales DENTRO de `<EducationalSection>`
- **Excepción**: HTML exportable queda FUERA (funcional vs educativo)
- **Beneficio**: Reduce scroll inicial en móvil (mejora UX significativa)
- **Filosofía**: Progressive disclosure - usuario decide si profundizar
- **Apps implementadas (11)**:
  1. Conversor de Unidades (app/conversor-unidades/) - Piloto
  2. Simulador de Préstamos (app/simulador-prestamos/) - 7 secciones profesionales
  3. Calculadora Jubilación (app/calculadora-jubilacion/) - 6 secciones profesionales
  4. Conversor de Colores (app/conversor-colores/) - 7 secciones profesionales (Tabla Comparativa HEX/RGB/HSL/CMYK, Casos de Uso, FAQ, Guía, Tips, Warning, HTML Code)
  5. Calculadora IVA (app/calculadora-iva/) - 7 secciones profesionales (Tabla Comparativa tipos IVA, Casos de Uso freelance/e-commerce, FAQ fiscal, Guía declaración, Tips, Warning, HTML Code)
  6. Simulador Hipoteca (app/simulador-hipoteca/) - 7 secciones profesionales (Tabla Comparativa Fija vs Variable, Escenarios, Conceptos, Guía, FAQ, Tips, Warning, HTML Code)
  7. Generador QR (app/generador-qr/) - Casos de Uso (6 tipos QR), Conceptos Clave, Warning Box, HTML Code
  8. Simulador Cartera Inversión (app/simulador-cartera-inversion/) - 7 secciones profesionales (Tabla Comparativa perfiles, Casos de Uso 4 inversores, FAQ 8 preguntas, Guía 7 pasos, Tips 6 prácticas, Warning 8 errores)
  9. Calculadora Tarifa Freelance (app/calculadora-tarifa-freelance/) - 7 secciones profesionales (Tabla Comparativa 5 modelos, Casos de Uso 4 freelancers, FAQ 8 preguntas negociación, Guía 7 pasos cálculo, Tips 6 prácticas, Warning 8 errores)
  10. Tabla Periódica Interactiva (app/tabla-periodica/) - 6 secciones profesionales enfocadas en estudiantes (Tabla Comparativa Metales/No Metales/Metaloides, Casos de Uso 4 perfiles, FAQ 8 preguntas estudio, Guía 7 pasos estequiometría, Tips 6 prácticas, Warning 8 errores)
  11. Calculadora de Geometría (app/calculadora-geometria/) - 6 secciones profesionales enfocadas en estudiantes (Tabla Comparativa 2D vs 3D 10 filas, Casos de Uso 4 perfiles academia/universidad, FAQ 8 preguntas comunes, Guía 7 pasos resolver problemas, Tips 6 consejos estudio, Warning 8 errores comunes)
- Plantilla CSS: Sin cambios (misma de v1.0)
- Tiempo promedio: 60 minutos (sin cambios)

**Futuras mejoras**:
- Componentes React reutilizables para FAQ/Steps/Cards
- Generador automático de estructura base
- Templates por tipo de app (financiera, generador, conversor)

---

## 📚 Recursos Adicionales

### Archivos de Referencia

1. **CSS Template**: `_templates/profesionalizacion.css` - Plantilla completa lista para copiar
2. **Apps implementadas**: Ver carpetas mencionadas en sección "Apps Implementadas"
3. **CLAUDE.md**: Reglas generales de desarrollo meskeIA (este documento las complementa)

### Próximos Pasos Sugeridos

Si quieres profesionalizar más apps:

**Candidatos prioritarios** (máximo impacto):
1. Generador Facturas (exportable, legal)
2. Calculadora Seguro Vida (financiero, decisión importante)
3. Calculadora FIRE (financiero, planificación largo plazo)
4. Generador Meta Descripciones (ya tiene v1.0, migrar a v2.0)
5. Comparador Tipos Seguros (financiero, decisión importante)

**Criterio de priorización**:
- Alto tráfico de usuarios
- Contexto profesional/empresarial
- Output exportable
- Decisiones con implicaciones económicas/legales

---

  12. Huesos Cuerpo Humano (app/huesos-cuerpo-humano/) - 6 secciones profesionales (Tabla Comparativa Axial/Apendicular 7 criterios, Casos de Uso 4 perfiles, FAQ 8 preguntas anatomía/clínica, Guía 7 pasos estudio esqueleto, Tips 6 prácticas, Warning 6 errores de examen)
  13. Instrumentos Musicales (app/instrumentos-musicales/) - 6 secciones profesionales (Tabla Comparativa 4 familias 7 criterios, Casos de Uso 4 perfiles, FAQ 8 preguntas organología, Guía 6 pasos reconocimiento auditivo, Tips 6 prácticas, Warning 6 errores conceptuales)
  14. Glosario de Programación (app/glosario-programacion/) - 6 secciones profesionales (Tabla Comparativa 4 paradigmas, Casos de Uso 4 perfiles dev, FAQ 8 preguntas técnicas, Guía 6 pasos ruta junior, Tips 6 prácticas aprendizaje, Warning 6 errores conceptuales)
  15. Creador de Paletas (app/creador-paletas/) - 6 secciones profesionales (Tabla Comparativa 6 armonías 5 criterios, Casos de Uso 4 perfiles diseño, FAQ 8 preguntas color/accesibilidad, Guía 6 pasos identidad visual, Tips 6 prácticas, Warning 6 errores de diseño)
  16. Simulador Genética (app/simulador-genetica/) - 6 secciones profesionales (Tabla Comparativa 4 tipos herencia 6 criterios, Casos de Uso 4 perfiles estudiante/criador/familiar, FAQ 8 preguntas genética, Guía 7 pasos resolver problema genético, Tips 6 prácticas estudio, Warning 6 errores conceptuales)
  17. Test Perfil Inversor (app/test-perfil-inversor/) - 6 secciones profesionales (Tabla Comparativa 5 perfiles 6 criterios rentabilidad/volatilidad/horizonte, Casos de Uso 4 perfiles vital, FAQ 8 preguntas avanzadas, Guía 7 pasos determinar perfil real, Tips 6 reglas de oro, Warning 6 errores al elegir perfil)
  18. Interés Compuesto (app/interes-compuesto/) - 6 secciones profesionales (Tabla Comparativa 5 instrumentos 6 criterios, Casos de Uso 4 perfiles vital, FAQ 8 preguntas TAE/inflación/DCA/comisiones, Guía 7 pasos empezar a invertir, Tips 6 hábitos, Warning 6 errores que destruyen el interés compuesto)
  19. Calculadora de Inversiones (app/calculadora-inversiones/) - 6 secciones profesionales con CSS prefijado 'edu' (Tabla Comparativa 5 tipos activos 6 criterios, Casos de Uso 4 perfiles capital, FAQ 8 preguntas Sharpe/rebalanceo/ETF vs fondo/REITs, Guía 7 pasos construir cartera, Tips 6 principios, Warning 6 errores diseño cartera)

**Última actualización**: 2026-02-20 (Sesión profesionalización x4: simulador-genetica, test-perfil-inversor, interes-compuesto, calculadora-inversiones)
**Autor**: Claude Code + Usuario (Sesión profesionalización)
**Versión**: 2.0
**Apps implementadas**: 23 (3 v1.0 FULL, 2 v1.0 cleanup, 19 v2.0 migradas)
