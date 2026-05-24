# ESCRITURA.md — Universo Literatura meskeIA

Documento de planificación para el bloque temático de **escritura y literatura**.
Actualizar en cada sesión antes de continuar.

---

## Apps implementadas (5)

| App | URL | Commit | Suite |
|-----|-----|--------|-------|
| Orientador de Escritura Creativa | `/orientador-escritura-creativa/` | `e8d4535c` | cultura, productividad |
| Estilos y Movimientos Literarios | `/visualizador-estilos-literarios/` | `b785b054` | cultura, estudiantes |
| Comparador de Voces Narrativas | `/comparador-voces-narrativas/` | `039c4590` | cultura, estudiantes |
| Test: ¿Qué tipo de lector eres? | `/test-tipo-lector/` | `12b3fa81` | cultura |
| Quiz de Literatura Universal | `/quiz-literatura-universal/` | `12b3fa81` | cultura, estudiantes |

### Qué cubre ya el Orientador (evitar duplicar)

El `orientador-escritura-creativa` ya incluye dentro de su paso 3:
- **Estructura mínima** por género (planteamiento, nudo, desenlace / 3 actos / etc.)
- **Kit de arranque**: preguntas clave para definir la historia antes de escribir
- **Errores frecuentes** por género (breves, 3-4 por género)
- **Perspectiva narrativa**: 1ª, 3ª omnisciente, 3ª limitada, 2ª persona (paso 2)

> Las propuestas "Mini-guía de estructura" y "Kit de arranque" están ya implementadas.
> No crear como apps independientes.

---

## Apps pendientes (6 válidas)

### ~~🔴 Alta prioridad~~ ✅ Completado

| # | App | Estado |
|---|-----|--------|
| 1 | **Test: ¿Qué tipo de lector eres?** | ✅ `12b3fa81` |
| 2 | **Quiz de Literatura Universal** | ✅ `12b3fa81` |

### 🟡 Media prioridad

| # | App | Descripción | Suite | Slug |
|---|-----|-------------|-------|------|
| 3 | **Recursos literarios** | Glosario interactivo: metáfora, ironía, metonimia, analepsis, elipsis, hipérbole, antítesis... con definición, ejemplo en texto real y efecto en el lector. Para estudiantes de secundaria/bachillerato y escritores | estudiantes, cultura | `visualizador-recursos-literarios` |
| 4 | **Grandes géneros de la novela** | Negro, terror, ciencia ficción, fantasía épica, romance, thriller histórico... Perspectiva del **lector**: características definitorias, autores fundacionales, obras de entrada recomendadas. Complementa el orientador (perspectiva del escritor) | cultura | `visualizador-generos-novela` |
| 5 | **Configurador narrativo** | Herramienta interactiva: el usuario elige 1ª/3ª persona, narrador omnisciente/limitado/testigo, tiempo verbal (pasado/presente). Para cada combinación: explicación del efecto en el lector + ejemplo + obras que lo usan. Diferencia del orientador: va mucho más profundo en las consecuencias de cada decisión | cultura, estudiantes | `configurador-narrativo` |
| 6 | **Errores frecuentes del escritor principiante** | 10–15 errores con ejemplo **malo ↔ correcto** detallado: adverbios en exceso, diálogos irreales, principios lentos, show don't tell, POV inconsistente, adjetivitis, clichés de género... Va mucho más lejos que los errores breves del orientador | cultura, productividad | `errores-escritura-creativa` |

### 🟢 Baja prioridad (interesantes pero menos urgentes)

| # | App | Descripción | Suite | Slug |
|---|-----|-------------|-------|------|
| 7 | **Generador de Incipit** | Seleccionas género, tono y época; la app muestra 3–4 primeras frases pre-generadas en ese estilo, con análisis de los recursos literarios usados. Estático (no requiere API de IA): ejemplos curados editorialmente | cultura, productividad | `generador-incipit` |
| 8 | **Visualizador de Narratología** | Conceptos de teoría narrativa visualizados: narrador (homodiegético/heterodiegético), focalización (Genette), tiempo del relato (orden, duración, frecuencia), estructura actancial (Greimas). Enfoque académico/teórico, diferente del configurador narrativo | estudiantes | `visualizador-narratologia` |

---

## Solapamientos a vigilar

| Par | Solapamiento | Resolución |
|----|-------------|------------|
| Configurador narrativo ↔ Visualizador de Narratología | Los tipos de narrador aparecen en ambos | Configurador = *práctico* (qué elijo para mi novela y qué efecto produce en el lector); Narratología = *teórico* (qué es cada concepto según Genette, Greimas, Bal) |
| Errores frecuentes ↔ Orientador | El orientador incluye 3–4 errores por género | La app dedicada es cross-género, con 10–15 errores, ejemplos largo malo/correcto y explicación del porqué |
| Géneros de la novela ↔ Orientador | El orientador tiene géneros desde la perspectiva del escritor | Géneros de la novela = perspectiva del lector (qué esperar de cada género) |

---

## Propuestas descartadas

| Propuesta | Motivo |
|-----------|--------|
| Kit de arranque (standalone) | Ya implementado dentro del orientador (paso 3) |
| Mini-guía de estructura (standalone) | Ya implementado dentro del orientador (paso 3) |

---

## Orden de implementación sugerido

```
✅ Completado (sesión 2026-05-24):
  [x] 1. Test: ¿Qué tipo de lector eres?
  [x] 2. Quiz de Literatura Universal

Sesión siguiente:
  [ ] 3. Recursos literarios
  [ ] 4. Grandes géneros de la novela

Sesión posterior:
  [ ] 5. Configurador narrativo
  [ ] 6. Errores frecuentes del escritor principiante

Cuando haya tiempo:
  [ ] 7. Generador de Incipit
  [ ] 8. Visualizador de Narratología
```

---

## Relaciones entre apps (cross-linking)

```
test-tipo-lector ──────────────► visualizador-generos-novela
                                  visualizador-estilos-literarios
                                  comparador-voces-narrativas

quiz-literatura-universal ─────► visualizador-estilos-literarios
                                  visualizador-recursos-literarios
                                  visualizador-narratologia

configurador-narrativo ────────► orientador-escritura-creativa
                                  visualizador-narratologia
                                  errores-escritura-creativa

errores-escritura-creativa ────► orientador-escritura-creativa
                                  configurador-narrativo
                                  generador-incipit

visualizador-generos-novela ───► orientador-escritura-creativa
                                  comparador-voces-narrativas
                                  test-tipo-lector
```

---

_Última actualización: 2026-05-24 (sesión 2)_
_Apps totales en el bloque: 5 implementadas + 6 pendientes = 11 apps_
