# CIENCIAS.md - Plan de Visualizadores de Ciencias Naturales

> **Objetivo**: Crear explicadores visuales interactivos basados en el temario clásico de Ciencias Naturales de Bachillerato, seleccionando SOLO los temas donde la visualización aporta valor real al estudiante.
>
> **Criterio de selección**: ¿El concepto es abstracto o difícil de imaginar? ¿La interactividad (sliders, clicks, animaciones) ayuda a entenderlo mejor que un texto? Si la respuesta es sí a ambas → candidato.
>
> **Criterio de exclusión**: Temas puramente taxonómicos (listas de clasificación), demasiado descriptivos (no ganan con interactividad) o excesivamente especializados.

---

## Inventario de visualizadores existentes (relevantes para Ciencias)

### Física y Química
| App existente | Capítulo del libro que cubre |
|---|---|
| `visualizador-leyes-newton` | Mecánica clásica |
| `visualizador-fuerzas-invisibles` | Fuerzas cotidianas |
| `visualizador-optica` | Óptica: reflexión, refracción, lentes, prisma |
| `visualizador-estados-materia` | Estados de la materia, transiciones, diagrama de fases |
| `visualizador-reacciones-quimicas` | Tipos de reacciones, balanceo, conservación de masa |
| `visualizador-tabla-periodica` | Elementos individuales |
| `visualizador-tabla-periodica-interactiva` | Tendencias periódicas (mapas de calor) |
| `visualizador-matrices` | Álgebra lineal / transformaciones |
| `visualizador-como-funciona-wifi` | Ondas electromagnéticas |
| `visualizador-produccion-energia` | Fuentes de energía |
| `visualizador-matematicas-musica` | Ondas y sonido |
| `simulador-fisica` | MRU, MRUA, péndulo, proyectil, ondas, MAS |
| `calculadora-movimiento` | Cinemática |
| `calculadora-electricidad` | Ley de Ohm, circuitos |

### Biología
| App existente | Capítulo del libro que cubre |
|---|---|
| `visualizador-celula` | Lec. 25: Citología (animal vs vegetal) |
| `visualizador-fotosintesis` | Lec. 27: Génesis de la energía vital |
| `visualizador-adn-numeros` | ADN en cifras |
| `visualizador-cerebro` | Neurociencia |
| `visualizador-cuerpo-numeros` | Anatomía en datos |
| `visualizador-viaje-comida` | Lec. 48: Sistema digestivo |
| `visualizador-ciclos-sueno` | Ciclos del sueño |
| `visualizador-envejecimiento-cuerpo` | Envejecimiento |
| `visualizador-vacunas` | Inmunología |
| `simulador-genetica` | Lec. 29: Herencia biológica (Mendel, Punnett) |
| `quiz-reinos-naturaleza` | Clasificación de organismos |

### Geología y Ciencias de la Tierra
| App existente | Capítulo del libro que cubre |
|---|---|
| `visualizador-tectonica-placas` | Lec. 15/18/19/20: Geodinámica, volcanes, terremotos |
| `visualizador-clima` | Lec. 13: La atmósfera / Climatología |
| `visualizador-oceano` | Lec. 14: La hidrosfera |
| `visualizador-escala-universo` | Escalas cósmicas |
| `visualizador-sistema-solar` | Sistema Solar |
| `visualizador-vida-estrella` | Evolución estelar |

### Ecología y Medio Ambiente
| App existente | Capítulo del libro que cubre |
|---|---|
| `visualizador-cadena-alimentaria` | Cadena alimentaria |
| `visualizador-agua-virtual` | Huella hídrica |
| `visualizador-huella-alimentos` | Impacto ambiental alimentos |
| `visualizador-viaje-basura` | Reciclaje |
| `calculadora-huella-carbono` | Huella de carbono |

---

## Apps nuevas propuestas

### BLOQUE 1: GEOLOGÍA (Lecciones 1-23)

#### G1. `visualizador-tipos-rocas`
**Lecciones**: 6 (rocas magmáticas), 10 (sedimentarias), 11 (las rocas), 12 (orgánicas)
**Concepto**: Los 3 grandes tipos de rocas y el ciclo de las rocas
- Ciclo de las rocas animado: ígneas → sedimentarias → metamórficas → fusión → ígneas
- Cada tipo con ejemplos clickables (granito, basalto / arenisca, caliza / mármol, pizarra)
- Cómo se forma cada una: enfriamiento magma, compactación sedimentos, presión+calor
- Texturas y usos cotidianos (encimeras de granito, pizarras, mármol en esculturas)
**Valor visual**: El ciclo de las rocas es un proceso circular que se entiende mucho mejor animado
**Estado**: ✅ Implementado (2026-04-07)

#### G2. `visualizador-capas-tierra`
**Lecciones**: 18 (actividad interna del globo), 15 (geodinámica)
**Concepto**: Estructura interna de la Tierra: corteza, manto, núcleo externo, núcleo interno
- Sección transversal animada con capas a escala
- Datos por capa: espesor, temperatura, composición, estado (sólido/líquido)
- Cómo sabemos lo que hay dentro (ondas sísmicas P y S)
- Comparativa: si la Tierra fuera un melocotón, la corteza es la piel
- Convección del manto → motor de las placas tectónicas
**Valor visual**: Las capas a escala con temperaturas son imposibles de imaginar sin visualización
**Estado**: ✅ Implementado (2026-04-07)

#### G3. `visualizador-ciclo-agua`
**Lecciones**: 14 (hidrosfera), 16 (acción geológica aguas continentales)
**Concepto**: El ciclo hidrológico completo
- Diagrama animado: evaporación → condensación → precipitación → escorrentía → infiltración
- Datos de escala: volumen de agua en océanos vs glaciares vs ríos vs atmósfera
- Slider de tiempo: cuánto tarda una gota en completar el ciclo (días en atmósfera vs miles de años en glaciar)
- Solo el 2,5% del agua es dulce, y solo el 0,3% es accesible
**Valor visual**: El ciclo es circular y la escala de volúmenes es contraintuitiva
**Estado**: ✅ Implementado (2026-04-08)
**Nota**: Complementa `visualizador-agua-virtual` (que es sobre huella hídrica, no sobre el ciclo)

#### G4. `visualizador-fosiles-tiempo-geologico`
**Lecciones**: 21 (geología histórica), 22-23 (tiempos geológicos)
**Concepto**: Las eras geológicas y cómo los fósiles cuentan la historia de la Tierra
- Timeline visual comprimido: 4.500 Ma en una barra navegable
- Eones → Eras → Períodos con fósiles representativos clickables
- "Si la historia de la Tierra fuera 1 día": analogía visual (humanos aparecen a las 23:59:56)
- 5 grandes extinciones marcadas con datos de impacto
- Cómo se datan los fósiles (carbono-14, potasio-argón)
**Valor visual**: La escala temporal es tan inmensa que sin visualización no se comprende
**Estado**: ✅ Implementado (2026-04-08)

---

### BLOQUE 2: BIOLOGÍA GENERAL (Lecciones 24-29)

#### B1. `visualizador-biomoleculas`
**Lección**: 24 (composición química de la materia viva)
**Concepto**: Las 4 biomoléculas esenciales: carbohidratos, lípidos, proteínas, ácidos nucleicos
- Estructura 2D simplificada de cada tipo con bloques de construcción
- Función de cada una (energía, estructura, catálisis, información)
- Ejemplos cotidianos: pan=carbohidratos, aceite=lípidos, músculo=proteínas, ADN=ácidos nucleicos
- Proporción en el cuerpo humano (agua 60%, proteínas 20%, lípidos 15%, etc.)
**Valor visual**: Las estructuras moleculares simplificadas ayudan a entender la diversidad
**Estado**: ✅ Implementado (2026-04-08)

#### B2. `visualizador-mitosis-meiosis`
**Lección**: 28 (funciones de reproducción)
**Concepto**: División celular: mitosis (copia exacta) vs meiosis (reducción para gametos)
- Animación paso a paso de mitosis: profase → metafase → anafase → telofase
- Animación de meiosis I y II: el crossing-over y la reducción cromosómica
- Comparativa lado a lado: 1 célula → 2 idénticas (mitosis) vs 1 → 4 diferentes (meiosis)
- Por qué importa: crecimiento vs reproducción sexual → diversidad genética
- Datos: tu cuerpo hace ~3,8 millones de mitosis por segundo
**Valor visual**: Las fases son abstractas en texto pero muy claras con animación de cromosomas
**Estado**: ✅ Implementado (2026-04-07)

#### B3. `visualizador-respiracion-celular`
**Lección**: 27 (génesis de la energía vital)
**Concepto**: El proceso inverso a la fotosíntesis: cómo las células obtienen energía
- Ecuación: C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 36-38 ATP
- 3 fases: glucólisis (citoplasma) → ciclo de Krebs (matriz) → cadena de transporte (membrana)
- Diagrama de la mitocondria con flujo de energía
- Comparativa con fotosíntesis (procesos inversos, mismos actores)
- Dato: produces ~65 kg de ATP al día (pero lo reciclas constantemente)
**Valor visual**: Complementa perfectamente `visualizador-fotosintesis` como su "espejo"
**Estado**: ✅ Implementado (2026-04-08)

---

### BLOQUE 3: ZOOLOGÍA (Lecciones 30-51)

#### Z1. `visualizador-arbol-vida`
**Lecciones**: 30-47 (clasificación animal completa)
**Concepto**: Árbol filogenético simplificado de los grandes grupos animales
- Diagrama de árbol interactivo desde ancestro común
- Ramas principales: invertebrados (esponjas → moluscos → artrópodos) y vertebrados (peces → anfibios → reptiles → aves → mamíferos)
- Click en cada grupo → características clave, número de especies, ejemplo representativo
- Datos: ~8,7 millones de especies estimadas, solo ~1,5 millones descritas
- Timeline de aparición de cada grupo
**Valor visual**: El árbol ramificado muestra relaciones evolutivas mejor que cualquier lista
**Estado**: ✅ Implementado (2026-04-07)
**Nota**: `quiz-reinos-naturaleza` ya existe pero es un quiz, no un visualizador explicativo

#### Z2. `visualizador-metamorfosis`
**Lecciones**: 37-39 (insectos), 42 (anfibios)
**Concepto**: Metamorfosis completa vs incompleta
- Metamorfosis completa (mariposa): huevo → larva → pupa/crisálida → adulto (animación)
- Metamorfosis incompleta (saltamontes): huevo → ninfa → adulto
- Metamorfosis anfibio (rana): huevo → renacuajo (branquias) → rana (pulmones)
- Comparativa: qué cambia en cada fase (alimentación, respiración, locomoción)
- Datos curiosos: una oruga aumenta su peso 3.000 veces antes de convertirse en crisálida
**Valor visual**: La transformación paso a paso es el caso perfecto para animación
**Estado**: ✅ Implementado (2026-04-08)

#### Z3. `visualizador-sistemas-circulatorios`
**Lecciones**: 48 (organografía animal comparada)
**Concepto**: Evolución del sistema circulatorio en el reino animal
- Sin sistema (esponjas) → abierto (insectos) → cerrado simple (peces, 1 circuito) → cerrado doble (mamíferos, 2 circuitos)
- Diagrama animado de flujo sanguíneo en cada tipo
- Corazón: 2 cámaras (pez) → 3 (anfibio/reptil) → 4 (ave/mamífero)
- Por qué importa: sangre oxigenada separada = más eficiencia = sangre caliente
- Dato: el corazón humano late ~100.000 veces/día, bombea ~7.500 litros
**Valor visual**: Los circuitos sanguíneos con flujo animado hacen visible lo invisible
**Estado**: ✅ Implementado (2026-04-08)

---

### BLOQUE 4: BOTÁNICA (Lecciones 52-70)

#### P1. `visualizador-anatomia-flor`
**Lecciones**: 63 (espermafitas), 64 (el fruto)
**Concepto**: Anatomía de una flor y el proceso de polinización → fruto → semilla
- Diagrama clickable de una flor: sépalos, pétalos, estambres (antera+filamento), pistilo (estigma+estilo+ovario)
- Proceso de polinización animado: insecto/viento → polen → estigma → tubo polínico → óvulo
- De la flor al fruto: ovario fecundado → fruto, óvulo → semilla
- Tipos de frutos clickables: carnosos (manzana, tomate) vs secos (nuez, legumbre)
- Dato: el 75% de los cultivos dependen de polinizadores
**Valor visual**: La flor es un mecanismo complejo que se entiende pieza a pieza al hacerlo clickable
**Estado**: ✅ Implementado (2026-04-07)

#### P2. `visualizador-germinacion`
**Lecciones**: 59 (aparato vegetativo), 64 (el fruto)
**Concepto**: De la semilla a la planta: germinación y crecimiento
- Anatomía de una semilla: testa, cotiledones, embrión (radícula, plúmula)
- Animación de germinación paso a paso: absorción agua → radícula → tallo → primeras hojas
- Factores: agua, temperatura, luz (bloques con toggle)
- Monocotiledónea vs dicotiledónea (1 vs 2 cotiledones)
- Timeline de crecimiento: desde semilla hasta planta adulta
- Dato: la semilla más antigua que germinó tenía 2.000 años (palmera datilera de Masada)
**Valor visual**: El proceso subterráneo de germinación es invisible a simple vista
**Estado**: ✅ Implementado (2026-04-08)

#### P3. `visualizador-transporte-plantas`
**Lecciones**: 53 (nutrición vegetales), 61 (transpiración)
**Concepto**: Cómo las plantas transportan agua y nutrientes sin corazón
- Xilema (savia bruta: raíz → hojas) vs floema (savia elaborada: hojas → resto)
- Diagrama de planta en sección con flujo animado
- Motor del transporte: transpiración (tira desde arriba) + ósmosis (empuja desde abajo)
- Estomas: apertura/cierre regulando pérdida de agua (animación)
- Un roble adulto puede transpirar 400 litros de agua al día
- Capilaridad: el agua sube contra la gravedad hasta 100+ metros (secuoyas)
**Valor visual**: El flujo de savia es invisible y contraintuitivo (sube sin bomba)
**Estado**: ✅ Implementado (2026-04-08)

---

### BLOQUE 5: ECOLOGÍA (Lecciones 49-50, 68-69)

#### E1. `visualizador-ecosistema`
**Lecciones**: 49 (ecología animal), 68 (ecología vegetal)
**Concepto**: Componentes de un ecosistema y flujo de energía
- Pirámide trófica animada: productores → herbívoros → carnívoros → descomponedores
- Regla del 10%: solo el 10% de energía pasa al siguiente nivel (barras proporcionales)
- Ciclos biogeoquímicos simplificados: carbono y nitrógeno
- Red trófica vs cadena trófica (más realista)
- Dato: se necesitan ~10.000 kg de fitoplancton para producir 1 kg de atún
**Valor visual**: La pirámide energética y los ciclos son conceptos circulares/jerárquicos perfectos para visualización
**Estado**: ✅ Implementado (2026-04-08)
**Nota**: `visualizador-cadena-alimentaria` cubre la cadena campo→mesa (producción alimentaria), NO la ecología trófica

---

## Resumen y priorización

### Prioridad Alta (conceptos más abstractos, mayor valor de visualización)
| # | App | Bloque | Sesiones necesarias |
|---|-----|--------|:---:|
| 1 | `visualizador-mitosis-meiosis` | Biología | — |
| 2 | `visualizador-capas-tierra` | Geología | — |
| 3 | `visualizador-tipos-rocas` | Geología | — |
| 4 | `visualizador-arbol-vida` | Zoología | — |
| 5 | `visualizador-anatomia-flor` | Botánica | — |

### Prioridad Media (buenos candidatos, algo menos abstractos)
| # | App | Bloque |
|---|-----|--------|
| 6 | `visualizador-ciclo-agua` | Geología |
| 7 | `visualizador-respiracion-celular` | Biología |
| 8 | `visualizador-metamorfosis` | Zoología |
| 9 | `visualizador-transporte-plantas` | Botánica |
| 10 | `visualizador-ecosistema` | Ecología |

### Prioridad Baja (interesantes pero más descriptivos)
| # | App | Bloque |
|---|-----|--------|
| 11 | `visualizador-fosiles-tiempo-geologico` | Geología |
| 12 | `visualizador-biomoleculas` | Biología |
| 13 | `visualizador-germinacion` | Botánica |
| 14 | `visualizador-sistemas-circulatorios` | Zoología |

### Temas DESCARTADOS del índice (no aptos para visualizador)
- Lec. 1-4: Propiedades físicas de minerales → demasiado descriptivo/taxonómico
- Lec. 7-9: Minerales de criaderos filonianos → excesivamente especializado
- Lec. 17: Acción geológica del mar → cubierto parcialmente por `visualizador-oceano`
- Lec. 26: Organismos pluricelulares → cubierto por `visualizador-celula`
- Lec. 31-36: Celentéreos a equinodermos → taxonomía pura, poco interactivo
- Lec. 40: Arácnidos → descriptivo
- Lec. 43-47: Reptiles a mamíferos → cubierto mejor por `visualizador-arbol-vida`
- Lec. 50: Asociaciones animales → descriptivo
- Lec. 51: Zootecnia → muy especializado
- Lec. 55-57: Plantas talofíticas, hongos, líquenes, briofitas → taxonomía
- Lec. 65-67: Clasificación espermafitas/monocotiledóneas/dicotiledóneas → taxonomía
- Lec. 70: Los vegetales y el hombre → cubierto por apps de alimentación existentes

---

## Plan de ejecución

**Implementación en grupos de 5** (sesiones de ~1h cada una):
- **Grupo A** (siguiente sesión): #1-5 (prioridad alta)
- **Grupo B**: #6-10 (prioridad media)
- **Grupo C**: #11-14 (prioridad baja, si se decide continuar)

**Total previsto**: 14 apps nuevas → meskeIA pasaría de 482 a 496 apps

---

## Control de versiones

| Fecha | Cambio |
|-------|--------|
| 2026-04-07 | Creación del plan. 14 apps propuestas en 3 grupos de prioridad |

---

**Última actualización**: 2026-04-07
