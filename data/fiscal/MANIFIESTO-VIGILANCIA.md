# Manifiesto de Vigilancia Normativa — `data/fiscal/`

> **Propósito**: este documento es el "contrato de vigilancia" del repositorio fiscal de meskeIA/Delegum.
> Define, para cada módulo de `data/fiscal/`, qué normativa lo sustenta, qué fuente
> oficial hay que vigilar, con qué cadencia cambia y qué señales distinguen un **cambio de datos**
> (importes, tipos, tramos) de un **cambio de metodología** (nueva fórmula o sistema de cálculo).
>
> **Consumidores**: (1) el agente Vigía Normativo (Claude Agent SDK) — que SOLO detecta y produce
> informes, NUNCA edita estos módulos ni hace commits; (2) la revisión manual mensual con Claude
> Code, que es la única autoridad que aplica cambios (edita → re-sella `verificado` → actualiza
> `app/delegum/datos-fiscales/novedades.ts` → push).
>
> **Creado**: 2026-07-13 · Las fechas `Verificado` reflejan el estado de los módulos en esa fecha.

---

## 1. Fuentes maestras

### 1.0 Jerarquía de fuentes — qué vale para SELLAR un dato

> **Una cifra solo se sella contra el texto de la norma. Los portales oficiales
> sirven para encontrarla y para entenderla, nunca para copiarla.**

| Nivel | Fuente | Para qué vale |
|---|---|---|
| **1** | Texto publicado en el **BOE** (o boletín autonómico), y el **consolidado** para lo que vive en leyes | **Sellar.** Es la única fuente que fija el dato |
| **2** | Serie oficial del organismo que la produce, con tabla o API descargable (INE) | **Sellar**, cuando el dato no nace de una norma (índices, estadística) |
| **3** | Portales divulgativos oficiales: Importass, SEPE, sede AEAT, seg-social.es, IMSERSO | Localizar la norma, entender el concepto, contrastar una duda. **Nunca sellar** |
| **4** | Notas de prensa, resúmenes, agregadores, prensa especializada | Nada. Ni para orientarse |

**El caso del que sale esta regla (12/08/2026)**: la tabla de tramos de `autonomos.ts`
se había verificado en junio contra la **guía web de Importass** —fuente oficial de la
Seguridad Social, pero divulgativa— en lugar de contra la Orden anual de cotización. Al
contrastarla con el art. 18 de la Orden PJC/297/2026 aparecía una base máxima de 718,95 €
donde la norma dice 718,94 €. Catorce de las quince filas eran correctas: la única mal era
la que la fuente primaria contradice.

Lo agrava que **el error de la web ya estaba documentado en el propio módulo**: su nota
advertía de que Importass mostraba «31,40 %» cuando el desglose daba 31,50 %. Es decir, se
sabía que esa página arrastraba texto viejo, y aun así se usó para sellar una tabla de
cifras. Un portal oficial se redacta a mano y se actualiza cuando alguien se acuerda; el BOE
no.

Mismo día, mismo patrón por otra vía: `COMPLEMENTO_MINIMOS_LIMITES_2026` citaba como fuente
la «LPGE 2026», **una ley que no existe** —los Presupuestos siguen prorrogados desde los de
2023—, y sus dos cifras estaban entre 828 y 966 € por debajo de las del RD 241/2026. De ahí
la regla de trazabilidad que la acompaña:

> **Todo bloque de datos cita su fuente con el identificador que permita abrirla**: `BOE-A-`,
> número de norma y artículo, o la tabla del organismo. Una fuente que no se puede abrir —un
> portal genérico, una ley que no existe, «resolución del INSS» sin más— es una señal de que
> el dato no se comprobó donde debía.

**Ampliación del 13/08/2026 — la cita tiene que abrir lo que dice, y eso se comprueba, no se
supone.** El barrido de trazabilidad de ese día verificó los 12 identificadores `BOE-A-` citados
en `data/fiscal/` preguntándole al BOE qué norma es cada uno: 11 abrían exactamente la norma
citada, y uno no. `iprem.ts` decía «Ley 31/2022 de PGE 2023» con la referencia BOE-A-2022-22685,
que es el **RDL 20/2022**, una norma distinta. Las cuatro cifras del IPREM eran correctas —están
en la DA 90.ª de la Ley 31/2022, BOE-A-**2022-22128**—, así que el fallo no se veía por ningún
lado: el dato era bueno y la fuente parecía formal. Se había sellado el día anterior.

De ahí la regla operativa: **un identificador citado se abre y se lee, aunque el dato que
acompaña sea correcto y aunque el sello sea reciente**. La comprobación es mecánica y está en
`npm run audit:fiscal-fuentes`. No se engancha al build a propósito —depende de la red, y un
candado que falla porque el BOE tarda en responder acaba desactivado—, así que se ejecuta en el
triaje mensual.

**Fuente genérica sobre un catálogo ≠ fuente genérica sobre cifras.** El mismo barrido marcó
`ayudas-personas`, `ayudas-publicas` y `jubilacion-tramites` por citar organismos («INSS, SEPE,
IMSERSO…») en vez de normas. Se comprobó que **ninguno de los tres declara un solo importe**: son
catálogos de categorías (§3.5), y para eso un directorio de organismos es la fuente correcta. Se
deja escrito aquí para que la próxima auditoría no vuelva a marcarlos: en un catálogo sin cifras,
la §1.0 no pide `BOE-A-`; en cuanto uno de ellos declare un importe, sí.

| Fuente | URL | Qué publica | Cadencia |
|---|---|---|---|
| BOE — Disposiciones generales (Sección I) | https://www.boe.es/boe/dias/ | Leyes, RD, RDL, Órdenes ministeriales y **leyes autonómicas** (las leyes de medidas fiscales de las CCAA también se publican en el BOE) | Diaria |
| BOE — Sumario API/RSS | https://www.boe.es/datosabiertos/ | Sumario diario en XML/JSON — la vía programática para el vigía | Diaria |
| LPGE / leyes de acompañamiento | vía BOE | Interés legal y de demora, IPREM, coeficientes IIVTNU, revalorización, mínimos IRPF | Anual (dic-ene) — ojo prórrogas |
| Orden anual de cotización SS | vía BOE (p.ej. Orden PJC/297/2026) | Bases y tipos de cotización cuenta ajena y RETA, MEI | Anual (ene-feb) |
| Resolución Secretaría Gral. del Tesoro | vía BOE | Tipo de demora comercial (Ley 3/2004) | **Semestral** (~ene y ~jul) |
| AEAT — Novedades y calendario | https://sede.agenciatributaria.gob.es | Calendario del contribuyente, criterios, modelos | Anual + continua |
| Seguridad Social — Revalorización | https://www.seg-social.es | RD de revalorización de pensiones, cuantías mín/máx | Anual (ene) |
| INE — Tabla 72975 (IRAV) | https://www.ine.es/jaxiT3/Tabla.htm?t=72975 | Índice de referencia de arrendamientos de vivienda (mensual). IPC interanual: calculadora varipc (https://www.ine.es/varipc/), sistema base 2025. ⚠️ La antigua tabla 25171 sirve hoy el IPV (corregido 2026-07-14) | **Mensual** |
| Ministerio de Educación — Becas | https://www.becaseducacion.gob.es | RD de umbrales y cuantías por curso académico | Anual (~jun-ago) |
| IMSERSO / SAAD | https://imserso.es/el-saad/prestaciones | Cuantías de prestaciones de dependencia | Anual |
| Consejo de Ministros (referencias) | https://www.lamoncloa.gob.es | Anticipa RDL antes de su publicación en BOE | Semanal (martes) |

### 1.1 Hasta dónde llega este contrato (y dónde deja de llegar)

Este manifiesto cubre `data/fiscal/`. **No cubre `lib/calculadoras/`**, y ahí también vive normativa.

Descubierto el 13/08/2026, probando en navegador: `permisoParental.ts` —motor del MCP— calculaba el
permiso con **16 semanas**, la duración derogada el 31/07/2025 por el RDL 9/2025; sumaba 2 semanas por
hijo en parto múltiple donde la norma dice 1; y **descontaba una retención de IRPF de una prestación
exenta**, anunciando un neto inferior al que se cobra. Llevaba así desde su sello, de enero de 2025.

Lo que importa no es el error, sino **por qué sobrevivió**: el módulo escribía sus semanas a mano en
vez de importarlas de `maternidad.ts`, que sí está aquí, sí se vigila y sí se actualizó a tiempo. El
dato correcto y el incorrecto convivieron un año en el mismo repositorio.

De los **210 motores de `lib/calculadoras/`, 172 no importan nada de `data/fiscal/`**. Muchos son de
cocina y no tienen normativa que envejecer, pero hay decenas fiscales selladas en enero de 2025. La
auditoría está planificada en la Agenda Operativa (`auditoria-motores-lib-calculadoras`).

**Regla mientras tanto**: un motor de `lib/calculadoras/` **no declara datos normativos propios**. Los
importa de `data/fiscal/`, y si el dato no existe allí, se crea el módulo primero. Es la misma regla
que ya rige para las apps en `CLAUDE.md`, que nadie había extendido explícitamente a los motores.

## 2. Calendario anual de ventanas de cambio

| Ventana | Qué suele cambiar | Módulos afectados |
|---|---|---|
| **Diciembre–enero** | LPGE (o prórroga), leyes de medidas fiscales de las 17 CCAA, calendario AEAT, Resolución Tesoro S1, coeficientes IIVTNU | `irpf` `iprem` `intereses` `inmuebles` `sucesiones` `donaciones` `patrimonio` `calendario` `sociedades` |
| **Enero** | RD revalorización pensiones, Orden de cotización (bases, tipos, MEI), tramos RETA del ejercicio, escala micropymes IS del ejercicio | `pensiones` `irpf` (bloque SS) `autonomos` `sociedades` |
| **Enero–febrero** | RD del SMI (arrastra: nómada digital, umbral obligación de declarar) | `smi` `nomada-digital` `irpf` |
| **Abril–junio** | Campaña de Renta (plazos, criterios AEAT) | `calendario` |
| **Junio–agosto** | RD umbrales de becas del curso siguiente; Resolución Tesoro S2 (~1 jul) | `becas-estudio` `intereses` |
| **Noviembre** | Indicadores Demográficos Básicos del INE (esperanza de vida del año anterior) | `esperanza-vida` |
| **Trimestral** | IRAV (INE) — y IPC interanual mensual | `alquiler` |
| **2.º semestre 2026** | Convocatorias autonómicas del Plan Estatal de Vivienda 2026-2030 (concretan el marco del RD 326/2026 y pueden elevar la renta máxima) | `vivienda-joven` |
| **Todo el año** | RDL tras Consejo de Ministros (impredecible): IVA de productos concretos, permisos familiares, medidas pensiones | `iva` `maternidad` `pensiones` y cualquiera |

## 3. Fichas de vigilancia por módulo

Formato: **Contiene** (qué datos encapsula) · **Normativa** (base legal) · **Vigilar** (fuente y señal
concreta) · **Cadencia** · **Alerta metodológica** (qué indicaría cambio de sistema de cálculo, no de
cifras) · **Verificado** (sello del módulo a fecha del manifiesto).

### 3.1 Cadencia alta (trimestral / semestral)

#### `alquiler.ts` — Actualización de rentas de alquiler
- **Contiene**: `IRAV_POR_TRIMESTRE`, `IPC_INTERANUAL_POR_MES`, fecha de corte Ley 12/2023, helpers de conversión.
- **Normativa**: Ley 12/2023 de Vivienda; índices INE.
- **Vigilar**: INE tabla 72975 (IRAV mensual) + calculadora varipc para el IPC interanual (sistema base 2025). **Este módulo caduca solo con el paso del tiempo** aunque no cambie ninguna ley. ⚠️ Ojo a las reorganizaciones de tablas del INE (jun-2026 dejó congeladas la 25171→IPV histórico y la 50902).
- **Cadencia**: mensual (IRAV e IPC).
- **Alerta metodológica**: cambio del índice legal de referencia (precedente real: IPC → IRAV con la Ley 12/2023; contratos pre-26/05/2023 siguen con IPC). Una nueva ley de vivienda que toque el art. de actualización de rentas es alerta máxima.
- **Verificado**: 2026-07-14 · vigencia 2026 (corregida serie IPC jun25-feb26 y fuente IRAV).

#### `intereses.ts` — Interés legal, demora comercial y demora tributario
- **Contiene**: interés legal del dinero, tipo de demora comercial por semestre (histórico), demora tributario, plazos de reclamación Ley 3/2004.
- **Normativa**: Ley 3/2004 (morosidad) + LPGE (interés legal y tributario) + BCE (tipo base).
- **Vigilar**: Resolución semestral de la Secretaría General del Tesoro (BOE, ~primeros días de enero y julio) → nuevo tipo comercial. LPGE → interés legal y tributario.
- **Cadencia**: **semestral** (comercial) + anual (legal/tributario).
- **Alerta metodológica**: cambio en la fórmula "tipo BCE + 8 puntos" del art. 7 Ley 3/2004, o en los plazos legales de pago (60/30 días). Transposición de nuevas directivas UE de morosidad = alerta máxima (hay reglamento UE en discusión).
- **Verificado**: 2026-07-09 · vigencia 2026.

### 3.2 Cadencia anual — bloque enero (LPGE, cotización, revalorización)

#### `irpf.ts` — IRPF y cotización SS cuenta ajena (2 bloques con META propia)
- **Contiene**: tramos IRPF (estatal + autonómico medio), mínimos personales/familiares, gastos deducibles y reducción por rendimientos del trabajo, deducción art. 80 bis, umbrales de obligación de declarar, helpers de tipo marginal; bloque SS: tipos de cotización del trabajador (Orden PJC/297/2026).
- **Normativa**: Ley 35/2006 + LPGE; Orden anual de cotización.
- **Vigilar**: LPGE o RDL que modifique tramos/mínimos/reducciones; Orden de cotización de cada enero (tipos + MEI); RD del SMI (mueve el umbral de obligación de declarar de perceptores con dos pagadores).
- **Cadencia**: anual (ene) + RDL puntuales.
- **Alerta metodológica**: deflactación automática de tramos (debate recurrente), cambio en la estructura de la reducción por rendimientos del trabajo (la LPGE 2025 ya la retocó), tributación del SMI, cuota de solidaridad para bases altas (RDL 2/2023, en despliegue progresivo — afecta al bloque SS).
- **Verificado**: 2025-01-15 (IRPF, vigencia 2025) · 2026-06-13 (SS, vigencia 2026).

#### `autonomos.ts` — Cotización RETA por ingresos reales
- **Contiene**: `TIPO_COTIZACION_RETA` (31,50% = CC 28,30 + AT 1,30 + Cese 0,90 + FP 0,10 + MEI 0,90), `TRAMOS_RETA_2025`, `BASES_RETA_2025`, `TARIFA_PLANA_2025`.
- **Normativa**: RDL 13/2022 + Orden de cotización anual + tabla importass.
- **Vigilar**: Orden de cotización de enero (el **MEI sube cada año** — cambio anual garantizado del tipo); negociación de la nueva senda de tramos 2026-2032 (la tabla del RDL 13/2022 solo llegaba a 2025 — cualquier acuerdo Gobierno/asociaciones es señal); cuantía y condiciones de la tarifa plana.
- **Cadencia**: anual (ene) garantizada.
- **Alerta metodológica**: el sistema entero es reciente (precedente: RDL 13/2022 sustituyó la libre elección de base por ingresos reales en 2023). Cambios en la definición de "rendimientos netos computables" o regularización = alerta máxima.
- **Verificado**: 2026-06-09 · vigencia 2026.

#### `modulos-irpf.ts` — Límites de exclusión del régimen de módulos (estimación objetiva)
- **Contiene**: `LIMITES_EXCLUSION_MODULOS_2025` — los tres límites cuantitativos excluyentes: volumen de ingresos del conjunto de actividades (250.000 €), facturación a otros empresarios/profesionales obligados a expedir factura (125.000 €) y volumen de compras en bienes y servicios excluido inmovilizado (250.000 €).
- **Normativa**: art. 31 Ley 35/2006 IRPF + art. 32 Reglamento IRPF (RD 439/2007). Los tres importes están vigentes desde 2016 y se prorrogan cada año por la Orden HFP/HAC que desarrolla el método de estimación objetiva (última: Orden HAC/1425/2025, para 2026).
- **Vigilar**: la Orden HFP/HAC de cada diciembre — hasta ahora solo prorroga las cifras sin tocarlas, pero es la norma que podría cambiarlas. Cualquier ley que modifique el art. 31 LIRPF o el art. 32 del Reglamento es alerta directa.
- **Cadencia**: anual (dic), aunque las cifras llevan sin moverse desde 2016 — la expectativa correcta es "se prorroga siempre, hasta que un año no lo haga".
- **Alerta metodológica**: sustitución del criterio "facturación a empresas > importe absoluto" por un umbral en porcentaje (o viceversa), o fin de la prórroga con una rebaja de los límites a los de 2015 (150.000 €/75.000 €), que es la reforma que Ley 26/2014 dejó prevista y que cada LPGE ha ido posponiendo.
- **Consumido por**: `simulador-modulos-vs-directa` (hallazgo 567 del Inspector, reparado 02/09/2026: antes los umbrales estaban repetidos a mano en tres sitios del JSX sin aplicarse al cálculo de elegibilidad).
- **Verificado**: 2026-09-02.

#### `pensiones.ts` — Jubilación, viudedad, mínimos, brecha de género (4 bloques con META)
- **Contiene**: edad ordinaria (tabla progresiva 2024-2027+), años mínimos, % por años cotizados, límites máx/mín del ejercicio, base reguladora, **sistema dual DT 40ª LGSS** (RDL 2/2023: elección 25/29 años en despliegue), coeficientes de anticipada, límites plan de pensiones, jubilación parcial, viudedad, complemento a mínimos, complemento brecha género (art. 60 LGSS + RDL 3/2026 + doctrina STJUE C-623/23).
- **Normativa**: LGSS (RDL 8/2015) + Ley 21/2021 + RDL 2/2023 + RDL 16/2025.
- **Vigilar**: RD de revalorización (enero: pensión máx/mín, complemento mínimos, cuantía brecha género); avance anual de la tabla de edad ordinaria y de la ventana del sistema dual (cambia CADA año hasta 2044); sentencias TS/TJUE sobre brecha de género; RDL de medidas de pensiones (frecuentes).
- **Cadencia**: anual (ene) garantizada + RDL/jurisprudencia puntual.
- **Alerta metodológica**: el sistema dual está en despliegue — cada ejercicio cambia qué años de cómputo aplican (esto es metodología, no dato). Cambios en coeficientes de anticipada o en el factor de sostenibilidad/MEI = alerta máxima.
- **Jubilación parcial — sistema vigente desde 01/04/2025 (RDL 11/2024)**: no hay edad mínima fija. Se puede anticipar **3 años como máximo** sobre la edad ordinaria del art. 205.1.a) (la que corresponda por año y años cotizados), con 33 años cotizados —25 con discapacidad ≥33%— y 6 de antigüedad en la empresa; reducción de jornada del 25% al 75%, y si la anticipación supera los 2 años, el primer año entre el 20% y el 33%. Sin contrato de relevo (art. 215.1, ya cumplida la edad ordinaria) la reducción también llega al 75%.
- **Verificado**: 2026-03-16 (principal) · 2026-06-14 (planes) · **2026-08-12 (parcial)** · 2026-05-13 (brecha género).

#### `smi.ts` — Salario Mínimo Interprofesional
- **Contiene**: SMI 2026 (RD 126/2026: 1.221 €/mes × 14) + salarios medios provinciales (AEAT 2023 / INE EAES).
- **Normativa**: RD anual del SMI.
- **Vigilar**: RD del SMI de cada enero-febrero; decisión sobre su tributación en IRPF (afecta a `irpf.ts`).
- **Cadencia**: anual (ene-feb). **Efecto cascada**: `nomada-digital.ts` (mínimos de ingresos = múltiplos del SMI) y umbral de declarar de `irpf.ts`.
- **Alerta metodológica**: vinculación automática del SMI al 60% del salario medio (Carta Social Europea — debate de convertirlo en fórmula); cambio de base de los salarios provinciales.
- **Verificado**: 2026-04-01 · vigencia 2026.

#### `iprem.ts` — IPREM
- **Contiene**: `IPREM_2026` (congelado desde 2023 por prórrogas presupuestarias).
- **Normativa**: Ley 31/2022 de PGE 2023, **DA 90.ª** (BOE-A-2022-22128), prorrogada.
- **Vigilar**: aprobación de una nueva LPGE → casi con seguridad actualiza el IPREM tras años congelado. Señal de altísima probabilidad si hay presupuestos nuevos.
- **Cadencia**: anual (si hay LPGE).
- **Alerta metodológica**: sustitución del IPREM como referencia de ayudas (improbable, impacto enorme — lo usan umbrales de justicia gratuita, bono social, alquiler…).
- **Consumido por**: `maternidad.ts` importa `IPREM_2026` para la prestación no contributiva por nacimiento. Un cambio aquí se propaga allí sin tocar nada.
- **Corrección de trazabilidad (13/08/2026)**: la `urlOficial` apuntaba a BOE-A-2022-22685 (**RDL 20/2022**, otra norma) mientras la `fuente` decía «Ley 31/2022». Las cuatro cifras se confirmaron correctas contra el texto de la DA 90.ª. Ver el caso completo en §1.0.
- **Verificado**: 2026-08-13 · vigencia 2026.

#### `sociedades.ts` — Impuesto sobre Sociedades y SL
- **Contiene**: tipos IS 2025/2026, **escala progresiva micropymes (DT 44ª LIS, Ley 7/2024) — transitoria, varía cada ejercicio 2025-2027**, retenciones dividendos, cotización autónomo societario, gastos deducibles, obligaciones periódicas SL.
- **Normativa**: Ley 27/2014 + Ley 7/2024.
- **Vigilar**: cada enero, el avance automático de la escala micropymes al tramo del nuevo ejercicio (cambio anual garantizado hasta 2027, ya previsto en la ley); modificaciones LIS en leyes de acompañamiento.
- **Cadencia**: anual (ene) garantizada hasta 2027.
- **Alerta metodológica**: precedente reciente = Ley 7/2024 (creó la escala micropymes). Vigilar tipo mínimo efectivo y cambios en pagos fraccionados.
- **Verificado**: 2026-06-10 · vigencia 2026.

#### `calendario.ts` — Calendario fiscal del contribuyente
- **Contiene**: `CALENDARIO_FISCAL` (plazos recurrentes de modelos: 303, 130, 111, Renta, IS…).
- **Normativa**: calendario AEAT + normativa de cada impuesto.
- **Vigilar**: publicación del calendario del contribuyente (AEAT, ~diciembre); cambios de plazo de modelos concretos (p.ej. fechas campaña Renta).
- **Cadencia**: anual (dic) + ajustes puntuales.
- **Alerta metodológica**: nuevos modelos obligatorios (precedente: Veri*factu / factura electrónica B2B — en calendario de despliegue, afectará a obligaciones de autónomos y SL).
- **Sobre su fuente genérica (13/08/2026)**: cita el calendario del contribuyente de la AEAT, que es nivel 3. Se acepta porque **no declara ningún importe**: solo plazos recurrentes en texto, y el propio módulo advierte de que las fechas exactas del ejercicio se confirman en la AEAT. Si algún día incorporase fechas concretas de una campaña, necesitaría la orden que las fija.
- **Verificado**: 2026-06-20 · vigencia 2026.

#### `dependencia.ts` — SAAD, copago y cuidadores
- **Contiene**: grados (BVD), **Grado III+ dependencia extrema (RDL 17/2026, sin baremo aún)**, **nivel mínimo de protección garantizado 2026 (90/260/660/4.930 €/mes)**, cuantías máximas por prestación, catálogo de servicios, copago (RD 1051/2013), convenio especial de cuidadores, deducciones IRPF por discapacidad, escala Zarit, recursos.
- **Normativa**: Ley 39/2006 + LPGE + RD 1051/2013 + Orden ISM/835/2023 + RDL 17/2026.
- **Vigilar**: cuantías SAAD en LPGE/acuerdos del Consejo Territorial; **desarrollo reglamentario del baremo del Grado III+** (el RDL 17/2026 no lo definió — cuando se publique habrá que integrarlo en GRADOS_DEPENDENCIA); despliegues autonómicos del III+ (precedente: Extremadura DL 2/2026); **reforma de la Ley 39/2006 en tramitación** (anteproyecto en curso — seguir su iter parlamentario).
- **Cadencia**: anual + reforma legislativa pendiente.
- **Alerta metodológica**: precedente reciente = RDL 17/2026 (creó el Grado III+, detectado por el vigía en su primera pasada, 13/07/2026). La reforma en tramitación puede cambiar grados, catálogo y copago → alerta máxima cuando se publique en BOE.
- **Verificado**: 2026-07-14 · vigencia 2025-2026.

### 3.3 Cadencia anual — bloque CCAA (leyes de medidas, dic-ene y sorpresas a mitad de año)

> Los tres módulos siguientes dependen de la normativa de **17 CCAA**. Sus leyes de medidas fiscales
> se publican también en el BOE (además del boletín autonómico), normalmente entre diciembre y enero,
> pero hay reformas a mitad de ejercicio (precedentes: Cantabria, Baleares, Aragón). El vigía debe
> filtrar el BOE por "Comunidad Autónoma" + "medidas fiscales" / "ISD" / "ITP".

#### `sucesiones.ts` — ISD rama sucesiones
- **Contiene**: tarifa estatal (7 tramos), tarifa propia de Cataluña, coeficientes multiplicadores por grupo y patrimonio preexistente (estatal y Cataluña), reducciones estatales (parentesco, edad <21, seguro de vida, vivienda 95%, discapacidad), ajuar 3%, **bonificaciones de las 17 CCAA** por grupo.
- **Sistema de cálculo vigente** (contra el que comparar): base imponible (+ ajuar 3%) → reducciones (parentesco/edad/discapacidad/vivienda/seguro) → base liquidable → tarifa progresiva (estatal o autonómica propia) → cuota íntegra → × coeficiente multiplicador (grupo × patrimonio preexistente) → cuota tributaria → − bonificación autonómica → cuota a pagar.
- **Normativa**: Ley 29/1987 + normativas de las 17 CCAA.
- **Vigilar**: leyes de medidas fiscales autonómicas (bonificaciones y reducciones cambian con los ciclos políticos autonómicos); cualquier reforma de la Ley 29/1987.
- **Cadencia**: anual por CCAA + reformas a mitad de año.
- **Alerta metodológica**: (a) armonización estatal del ISD (debate recurrente — eliminaría la ventaja autonómica: alerta máxima, obligaría a rehacer el estimador); (b) una CCAA que pase de "bonificación en cuota" a "reducción en base" o a tarifa propia (cambia el orden de las operaciones, no solo cifras); (c) cambios en los coeficientes multiplicadores.
- **Alerta (b) MATERIALIZADA — Madrid, 2026-08-12**: la Ley 3/2026, de 30 de junio, de Apoyo a la Empresa Familiar (BOE-A-2026-16019, en vigor desde el 01/07/2026) modifica los arts. 21 y 22 del Decreto Legislativo 1/2010 e introduce una **reducción del 99% EN BASE** por transmisión de empresa individual, negocio profesional o participaciones, extendida a Grupos I, II y III y a colaterales de cuarto grado, con permanencia de 5 años y participación mínima del 5% individual / 20% del grupo familiar. El módulo modela Madrid **solo como bonificación en cuota por parentesco** y no contiene ninguna reducción de empresa familiar (tampoco la estatal del 95% del art. 20.2.c LISD). Aplicado hoy como advertencia en `notas`; **modelarlo exige tocar el código** de `estimador-impuesto-sucesiones` y `simulador-heredar-vivienda`, porque cambia el orden de las operaciones. Planificado en la Agenda Operativa.
- **Verificado**: 2025-01-01 · vigencia 2025. ⚠️ El sello más antiguo del repositorio junto a donaciones. No se re-selló el 12/08/2026 pese a aplicarse un hallazgo: el sello de un módulo cedido afirma "las 17 comunidades verificadas" y aquí solo se verificó Madrid.

#### `donaciones.ts` — ISD rama donaciones
- **Contiene**: tarifa estatal (16 tramos — distinta de sucesiones), tarifas Cataluña general y reducida (Grupos I/II + escritura pública), coeficientes multiplicadores, reducciones, bonificaciones 17 CCAA (algunas exigen escritura pública — campo `requiereEscritura`).
- **Sistema de cálculo vigente**: como sucesiones pero sin ajuar ni reducción de vivienda; la bonificación autonómica frecuentemente condicionada a formalización en escritura pública. Plazo Modelo 651: 1 mes.
- **Normativa**: Ley 29/1987 + normativas de las 17 CCAA.
- **Vigilar / Cadencia / Alerta**: idéntico a `sucesiones.ts`. Señal específica: cambios en requisitos formales (escritura, origen de fondos) que condicionan la bonificación — es metodología, no dato.
- **Alerta (b) MATERIALIZADA — Madrid, 2026-08-12**: la misma Ley 3/2026 extiende la reducción del 99% en base a las **donaciones** de empresa familiar, con los requisitos de formalización que ya contempla el campo `requiereEscritura`. Ver la ficha de `sucesiones.ts`. App afectada: `estimador-impuesto-donaciones`.
- **Verificado**: 2025-01-01 · vigencia 2025. ⚠️ Sello antiguo, por el mismo motivo que `sucesiones.ts`.

#### `patrimonio.ts` — IP e ITSGF (2 bloques con META)
- **Contiene**: constantes del límite conjunto IRPF-IP (art. 31: tope 60% de bases imponibles, reducción máx. 80% de cuota IP), datos ITSGF (Ley 38/2022, prorrogado), bonificaciones autonómicas, escalas autonómicas detalladas, escala estatal de fallback, lógica de orientación del límite conjunto.
- **Normativa**: Ley 19/1991 + Ley 38/2022 + normativa autonómica.
- **Vigilar**: prórroga/derogación del ITSGF en leyes de acompañamiento (cada diciembre); movimientos de bonificaciones autonómicas (Madrid, Andalucía, Galicia reaccionan al ITSGF); mínimo exento estatal.
- **Cadencia**: anual (dic-ene).
- **Alerta metodológica**: derogación del ITSGF (reordena la estrategia de todas las CCAA bonificadas) o cambio del mecanismo del límite conjunto del art. 31 (60%/80%) — ambas alertas máximas.
- **Verificado**: 2025-01-15 · vigencia 2025. ⚠️ Sello antiguo.

#### `inmuebles.ts` — ITP/AJD, IVA obra nueva, plusvalías IRPF, IIVTNU (2 bloques con META)
- **Contiene**: ITP por CCAA (del 4% del País Vasco al 13% del tramo alto de las escalas de Baleares y Cataluña), AJD, IVA obra nueva (10%), tramos del ahorro para plusvalías IRPF, otros costes de compraventa, IIVTNU (coeficientes anuales + tipo máximo legal 30%).
- **Sistema de cálculo IIVTNU vigente**: método dual del RDL 26/2021 — el contribuyente elige entre (a) base objetiva = valor catastral del suelo × coeficiente según años de tenencia (coeficientes actualizados por LPGE) y (b) plusvalía real. Precedente metodológico máximo: STC 182/2021 tumbó el sistema anterior.
- **Normativa**: Ley 1/1993 ITP-AJD (+ leyes CCAA) + Ley 35/2006 + Ley 37/1992 + RDL 26/2021.
- **Vigilar**: coeficientes IIVTNU en cada LPGE; tipos ITP/AJD en leyes de medidas CCAA; tramos del ahorro en LPGE (precedente: nuevo tramo 30% > 300.000 € en 2023); nueva jurisprudencia constitucional sobre IIVTNU. **Y la EDAD de los tipos reducidos de jóvenes, que es el punto débil demostrado**: el 19/08/2026 se verificaron tres comunidades en fuente oficial y las tres estaban desactualizadas en algún sitio —Murcia ≤40 (no <35, y sin límite de valor), La Rioja <40 al 4% (no <36 al 5%), Cataluña ≤35 desde el 27/06/2025 (no ≤32)—. Las comunidades cuya ficha sigue diciendo «<36» o «<35» no se han contrastado: es material de la inmersión de enero.
- **Cadencia**: anual (coeficientes + CCAA) + jurisprudencia puntual.
- **Alerta metodológica**: cambios sobre el valor de referencia catastral como base imponible (Ley 11/2021 — los ajustes de este mecanismo son metodología); una nueva sentencia sobre IIVTNU.
- **Verificado**: 2026-06-17 (principal) · 2025-01-15 (IIVTNU). ⚠️ Bloque IIVTNU con sello antiguo: los coeficientes 2026 deben confirmarse.

### 3.4 Cadencia media-baja / cambios puntuales por RDL

#### `iva.ts` — Tipos, exenciones, OSS, recargo de equivalencia
- **Contiene**: tipos (21/10/4/0), exenciones art. 20, umbral OSS, recargo de equivalencia, modelos.
- **Normativa**: Ley 37/1992 + Directiva 2006/112/CE.
- **Vigilar**: RDL con rebajas selectivas (precedentes: alimentos básicos 0%→2%→4%, electricidad 5%, aceite de oliva) — impredecibles, todo el año; transposición del **régimen de franquicia del IVA** (Directiva UE 2020/285, pendiente en España — eximiría de IVA a autónomos con facturación baja).
- **Cadencia**: puntual (RDL) + directivas UE.
- **Alerta metodológica**: la franquicia del IVA es LA alerta de este módulo — cambiaría el orientador y las obligaciones de miles de autónomos (nuevo régimen, no nuevas cifras).
- **Verificado**: 2026-06-18 · vigencia 2025-2026.

#### `maternidad.ts` — Nacimiento y cuidado del menor
- **Contiene**: semanas de permiso (RDL 9/2025), ampliaciones, prestación económica contributiva y no contributiva (LGSS arts. 177-182), deducción por maternidad IRPF (art. 81), gastos estimados primer año, estilos parentales (Baumrind).
- **Normativa**: RDL 6/2019 + RDL 9/2025 + LGSS + Ley 35/2006 art. 81 (redacción del art. 64 de la Ley 31/2022).
- **Vigilar**: nuevos RDL de ampliación de permisos (materia políticamente activa — precedente RDL 9/2025); cambios en la deducción del art. 81; revisión del IPREM (la prestación no contributiva es 100% IPREM) y de las bases de cotización de cada enero.
- **Cadencia**: puntual (RDL) + anual.
- **Alerta metodológica**: cambio del mecanismo de la prestación (% de base reguladora) o de la deducción (universalización, cuantía por tramos).
- **Dependencias internas**: importa `IPREM_2026` de `iprem.ts` y `BASES_SS_2026` de `irpf.ts`. Ninguno de los dos datos se copia aquí.
- **Auditoría a fondo del 13/08/2026** — el bloque de permisos coincidía **literalmente** con el RDL 9/2025 (19/32 semanas, 6 obligatorias, 11/22 flexibles, 2/4 hasta los 8 años). Lo que no coincidía era todo lo demás:
  - La **deducción por maternidad negaba el derecho a quien lo tiene**. El módulo y la app decían «no aplica a desempleadas que cobran prestación sin cotizar», y el art. 81.1 vigente **desde el 01/01/2023** incluye expresamente a quien percibe prestaciones contributivas o asistenciales de desempleo al nacer el menor, y a quien se da de alta después con 30 días cotizados. La app tenía un `if` que devolvía «no elegible» a esa persona. Mismo patrón que el fallo del complemento a mínimos de 12/08.
  - Faltaban tres piezas del mismo artículo: el **incremento de 150 €** del mes en que se completan los 30 días cotizados, la **incompatibilidad mes a mes con el complemento de ayuda para la infancia del IMV**, y el segundo tope del incremento por guardería (**gasto efectivo no subvencionado**).
  - La **prestación no contributiva** ignoraba el **incremento de 14 días naturales** del art. 182.3 (familia numerosa, monoparentalidad, parto múltiple, discapacidad ≥65%) — introducido por el propio RDL 9/2025 que el módulo ya citaba— y presentaba el 100% del IPREM como cuantía fija, cuando el art. 182.2 lo somete a la base reguladora si esta es inferior.
  - Las **bases de cotización** eran las de 2025 (Orden PJC/178/2025) declarando vigencia «2025-2026», mientras `irpf.ts` ya tenía las de 2026.
  - La `fuente` citaba **«LPGE 2025»**, ley que no existe (prórroga presupuestaria), y la `urlOficial` era un portal divulgativo de la Seguridad Social. La norma real detrás de la deducción es la Ley 31/2022.
- **Segunda pasada del 13/08/2026 — el motor del MCP** (`lib/calculadoras/prestacionMaternidadPaternidad.ts`, que sirve a ChatGPT y Claude vía `calcular_prestacion_maternidad_paternidad`):
  - Sin carencia devolvía **0 €**. Quien no acredita el período mínimo no se queda sin nada: pasa al subsidio no contributivo del art. 182. Es el mismo fallo de fondo que el de la deducción —negar un derecho—, aquí servido a las IA.
  - Advertía de que la prestación **«tributa en IRPF como rendimiento del trabajo y está sujeta a retención»**, cuando el art. 7.h) LIRPF la declara **exenta** (redacción del RDL 27/2018, con efectos desde 2018 y ejercicios no prescritos, tras la STS 1462/2018). El propio `maternidad.ts` ya decía `exentaIRPF: true`: **dos piezas del mismo sistema afirmaban lo contrario**, y la que hablaba con las IA era la equivocada.
  - La app `estimacion-prestacion-nacimiento` decidía contributiva/no contributiva con `base ≥ mínima × 0,5`, un umbral inventado. El art. 178 lo decide por **edad y días cotizados** (90/180 o 180/360, alternativos), datos que ahora se piden. Con los días sin declarar se asume carencia cumplida y se advierte: dar por incumplido lo que nadie ha dicho sería negar la prestación por omisión.
  - Motor cubierto con casos a mano (contributiva, sin carencia, monoparental con el +14, base inferior al IPREM y tope de la base máxima).
- **Verificado**: 2026-08-13 · vigencia 2026.

#### `amortizacion.ts` — Tabla de amortización LIS
- **Contiene**: coeficientes lineales máximos y períodos máximos (art. 12.1.a LIS), multiplicadores de degresiva.
- **Normativa**: Ley 27/2014 (estable desde 2015).
- **Vigilar**: regímenes temporales de libertad de amortización / amortización acelerada en leyes de acompañamiento (precedentes: renovables, vehículos eléctricos).
- **Cadencia**: baja; incentivos puntuales.
- **Alerta metodológica**: reforma de la tabla del art. 12.1.a (no ocurre desde 2015 — sería alerta).
- **Verificado**: 2026-06-18 · vigencia 2026.

#### `costas-judiciales.ts` — Arancel de la Procura, tasas judiciales y umbrales de la LEC
- **Contiene**: escala del arancel de los profesionales de la Procura (art. 2 RD 434/2024, 34 peldaños), suplemento por exceso de 600.000 €, cuantía indeterminada, tope global por asunto, recargo del juicio ordinario y concepto propio del monitorio; cuotas fijas vigentes de la tasa judicial (art. 7.1 Ley 10/2012) y sus dos exenciones; umbrales procesales de la LEC (cuantía del verbal, mínimo sin abogado ni procurador, límite del tercio del art. 394.3 y valoración de la pretensión inestimable).
- **Normativa**: RD 434/2024 + Ley 10/2012 con la nulidad parcial de la STC 140/2016 + LEC en la redacción de la LO 1/2025.
- **Vigilar**: nuevo real decreto de arancel de la Procura (el vigente sustituyó al RD 1373/2003 tras anular el Tribunal Supremo el RD 307/2022, así que la materia lleva tres normas en tres años); cualquier reforma de la Ley 10/2012 —las tasas llevan congeladas desde 2015 pero su reinstauración es materia políticamente activa—; y las reformas procesales de la LEC, que son las que mueven los umbrales.
- **Cadencia**: baja, por real decreto o ley procesal. Sin ventana fija.
- **Alerta metodológica**: que el arancel de la Procura vuelva a ser de mínimos (sería contrario al procedimiento de infracción de la Comisión Europea que originó el de máximos), o que se restablezca alguna cuota **variable** de tasa judicial: la anterior fue declarada inconstitucional en su totalidad, así que su vuelta exigiría una construcción distinta.
- **Dependencias internas**: la app `estimador-costas-judiciales` importa de aquí y toma el tipo de IVA de `iva.ts`. Ningún dato se duplica.
- **Auditoría de origen (26/08/2026)** — el módulo nace de la reparación de los hallazgos 414-421 del Inspector, y al contrastar contra el BOE aparecieron **tres defectos que el acta no recogía y que pesaban más que varios de los que sí**:
  - La app atribuía los aranceles del procurador al **RD 1373/2003, derogado el 02/05/2024**, y sus cifras **superaban el máximo legal vigente** a partir de 60.000 € de cuantía (1.100 € frente a los 1.026,36 € del arancel) y hasta un 44 % en 600.000 €.
  - Sumaba a la tasa judicial una **cuota variable del «0,10 % con tope 10.000 €»**. El art. 7.2 de la Ley 10/2012 fue declarado inconstitucional y **nulo en su totalidad** por la STC 140/2016, con efectos del 15/08/2016: la app cobraba un tributo inexistente, y con un tipo que ni siquiera era el que la ley anulada preveía (0,5 %).
  - Usaba **6.000 €** como frontera entre juicio verbal y ordinario. Desde el **03/04/2025** son **15.000 €** (art. 250.2 LEC, reformado por la LO 1/2025). El acta lo marcó como «el candidato más probable a estar caducado» sin poder afirmarlo; queda confirmado.
  - También faltaba la exención **objetiva** del art. 4.1.c (monitorio y verbal de cantidad hasta 2.000 €), que alcanza igualmente a las personas jurídicas, y el IVA del 21 % sobre unos servicios profesionales que la app presentaba sin él.
- **Verificado**: 2026-08-26 · vigencia 2025-2026.

#### `nomada-digital.ts` — Visa nómada digital
- **Contiene**: mínimos de ingresos (**múltiplos del SMI** — se actualiza en cascada con `smi.ts`), duraciones de visado/autorización/renovación, requisitos.
- **Normativa**: Ley 28/2022 de Startups + RD 1008/2023.
- **Vigilar**: RD del SMI (recalcula mínimos automáticamente); modificaciones del reglamento de la Ley de Startups; criterios UGE (Unidad de Grandes Empresas).
- **Cadencia**: anual vía SMI; marco estable.
- **Alerta metodológica**: cambio del múltiplo (200% SMI titular) o del régimen fiscal asociado (impatriados/Beckham).
- **Verificado**: 2026-06-11 · vigencia 2026.

### 3.5 Catálogos estables (marcos, no cifras)

> Estos cuatro módulos describen **categorías** de ayuda/trámite, no importes. Cambian poco, pero
> cuando cambian es porque nace o muere un marco normativo — que es exactamente lo que hay que contar
> en Delegum antes que nadie.
>
> **No se les aplica la §1.0 igual que a los demás** (verificado el 13/08/2026: ninguno declara un
> solo importe). Su `fuente` es legítimamente una lista de organismos —INSS, SEPE, IMSERSO, BDNS—,
> porque lo que catalogan son las prestaciones que esos organismos gestionan, no cifras que una
> norma fije. En cuanto uno de ellos declare un importe, deja de valer y pasa a necesitar su
> `BOE-A-`.

#### `ayudas-personas.ts` — Catálogo de ayudas a personas y familias
- **Vigilar**: creación/supresión de prestaciones estatales (precedente: IMV 2020); reformas de las existentes (SEPE, INSS, IMSERSO). Cadencia: baja. **Verificado**: 2026-06-11.

#### `ayudas-publicas.ts` — Catálogo de ayudas a autónomos/pymes
- **Vigilar**: nuevos programas marco (ICO, ENISA, CDTI, Kit Digital y sucesores); BDNS para el pulso general. Cadencia: baja (el catálogo), continua (las convocatorias — fuera de alcance). **Verificado**: 2026-06-10.

#### `becas-estudio.ts` — Catálogo de becas y ayudas al estudio
- **Vigilar**: RD anual de umbrales de renta/patrimonio y cuantías (BOE, ~jun-ago, por curso académico) — el catálogo es estable pero el RD anual es señal segura. **Verificado**: 2026-06-11.

#### `jubilacion-tramites.ts` — Catálogo de trámites al jubilarse
- **Vigilar**: cambios en trámites INSS/IMSERSO y complementos (sigue a `pensiones.ts`). Cadencia: baja. **Verificado**: 2026-06-11.

### 3.6 Clasificaciones de actividad (catálogo externo, verificación automatizada)

#### `cnae-iae.ts` — CNAE-2025 e IAE (metadatos) + `public/datos/cnae-iae-catalogo.json` (catálogo)
- **Contiene**: el módulo TS solo guarda **metadatos** (fuente, URL oficial, sello) más tres datos
  normativos citables: `SECCIONES_IAE` (con los porcentajes de retención de IRPF), `IAE_EXENCION`
  (umbral de cifra de negocio) y `CNAE_VIGENCIA`. El catálogo en sí —~1.430 códigos IAE y ~1.060
  CNAE-2025— vive en `public/datos/` porque no cabe en el bundle, y se **genera**, no se edita.
- **Normativa**: RD Legislativo 1175/1990 (Tarifas e Instrucción del IAE) · RD 10/2025 (CNAE-2025) ·
  art. 82.1.c) RDL 2/2004 (exención por cifra de negocio).
- **Vigilar**: no hace falta vigilancia manual. **Basta con reejecutar
  `node scripts/generar-catalogos-cnae-iae.mjs`**: descarga las fuentes oficiales, compara con el
  catálogo publicado y enumera altas, bajas y títulos modificados. Si no hay diferencias, lo dice y
  no toca nada. Ventana natural: **enero**, junto al resto del bloque, porque las leyes de
  acompañamiento de diciembre son la vía histórica por la que se han reescrito epígrafes del IAE
  (precedentes reales: Ley 21/1993 y Ley 12/1996 sobre el grupo 505).
- **Cadencia**: muy baja. La CNAE se sustituyó en 2025 tras **dieciséis años** de vigencia de la
  CNAE-2009; el IAE es de 1990 con reformas esporádicas. La expectativa correcta es "casi nunca
  cambia, y cuando cambia es grande".
- **Alerta metodológica**: **una clasificación nueva que sustituya a la vigente** (precedente
  exacto: CNAE-2009 → CNAE-2025, RD 10/2025, operativa desde enero de 2026, que dejó desalineadas
  67 de las 110 entradas del dataset anterior). No es un cambio de cifras: obliga a remapear todo lo
  que dependa de los códigos. Señal de aviso: el INE publica la tabla de correspondencia entre
  versiones antes de la entrada en vigor.
- **Trampa conocida**: NO existe tabla oficial de equivalencia CNAE ⇄ IAE (organismos y finalidades
  distintas). Cualquier presión para "convertir" entre ambas produce criterio disfrazado de dato;
  `FISCAL_CNAE_IAE_META.sinEquivalenciaOficial` lo deja sellado en el propio módulo.
- **Verificado**: 2026-07-20.

### 3.7 Módulos EXENTOS de vigilancia normativa

> Un módulo de `data/fiscal/` puede quedar legítimamente fuera de este contrato cuando **no contiene
> datos con fecha de caducidad**: solo la fórmula o la estructura de cálculo que fija la ley. Un sello
> `verificado` ahí no significaría nada, porque no hay ninguna cifra que pueda envejecer.
>
> **La exención tiene que estar declarada aquí, nunca sobreentendida.** Un módulo sin ficha y sin
> exención es indistinguible de un olvido, y esa ambigüedad es justo lo que este manifiesto existe
> para impedir. Lo comprueba `npm run check:fiscal`, que rompe el build si aparece uno.
>
> **Criterio para exentar** (los tres, no basta con uno): (1) el módulo no declara importes, tipos,
> tramos ni plazos; (2) las cifras que use las importa de otro módulo que sí esté vigilado; (3) si la
> ley cambiara, cambiaría su *código*, no un número — y eso lo caza el chequeo de fórmula de enero,
> no el barrido mensual.

<!-- EXENTOS:INICIO -->

| Módulo | Por qué queda fuera | Quién lo cubre |
|---|---|---|
| `ganancia-inmueble.ts` | Implementa la fórmula del art. 35 LIRPF (valor de adquisición y de transmisión) y las exenciones de los arts. 33.4.b y 38 LIRPF y 41 RIRPF. No declara ni un solo importe: los tramos de la base del ahorro los importa de `inmuebles.ts`, que sí está vigilado. | Chequeo de FÓRMULA de enero (`/revision-fiscal-enero`), no el barrido mensual |

<!-- EXENTOS:FIN -->

### 3.8 Estadística oficial (no normativa)

> Va aparte porque **no la cambia una norma**: la republica un organismo estadístico en su calendario
> propio. No hay `BOE-A-` que citar ni Consejo de Ministros que vigilar, así que la §1.0 no le aplica
> igual —su cita legítima es la operación estadística y su nota de prensa—. Y la señal de cambio es de
> otra naturaleza: no «ha cambiado la ley», sino «hay un año nuevo publicado».
>
> (La numeración deja los exentos en 3.7 a propósito: el mensaje de error de `check:fiscal` apunta a
> esa sección por su número, y renumerarla lo dejaría señalando al sitio equivocado.)

#### `esperanza-vida.ts` — Esperanza de vida a los 65 años

- **Contiene**: la esperanza de vida a los 65 años en España por sexo (2024) y la función que traduce
  una edad de jubilación en años de pensión a cubrir. **No es una tabla de mortalidad**: solo el dato
  a los 65, que es el que necesitan las calculadoras de jubilación.
- **Fuente**: INE — Movimiento Natural de la Población / Indicadores Demográficos Básicos.
- **Vigilar**: la publicación anual de los Indicadores Demográficos Básicos (**~noviembre**, referida
  al año anterior). Señal: aparece un año de referencia posterior al sellado en el módulo.
- **Cadencia**: anual. Los valores se mueven décimas de año salvo choque de mortalidad —el precedente
  real es 2020, cuando la esperanza de vida cayó de golpe y recuperó después—, así que la expectativa
  correcta es «cambia poco todos los años, mucho una vez por generación».
- **Alerta metodológica**: que el INE cambie la base de proyección o la metodología de las tablas de
  mortalidad; y, del lado de casa, cualquier app que empiece a presentar este dato como pronóstico
  individual en vez de como media poblacional.
- **Por qué está aquí y no exento**: declara cifras con fecha de caducidad. Nació el 13/08/2026 al
  descubrirse que el mismo supuesto de longevidad vivía escrito cuatro veces con cuatro valores
  distintos y **ninguna fuente** (20 años en `brechaJubilacion`, esperanza de vida 85 en
  `pensionComplementaria`, «20-25» en el formulario de `planificador-ahorro-jubilacion` y «25-30» en
  la FAQ de esa misma página). El candado que lo impide reaparecer es el test GOLDEN-BO2.
- **Verificado**: 2026-08-13.

#### `vivienda-joven.ts` — Ayudas jóvenes del Plan Estatal de Vivienda 2026-2030

- **Contiene**: `BONO_ALQUILER_JOVEN_2026` (cuantías 300/200 €/mes, límite del 60 % de la renta,
  rentas máximas 1.000/600 y 500/250 en municipios pequeños, edad 18-35 inclusive, plazo 2+2 años) y
  `AYUDA_COMPRA_JOVEN_RURAL_2026` (15.000 € o el 20 % del coste, municipios ≤10.000 hab), más el
  umbral de ingresos en veces el IPREM (5 · 5,5 · 6).
- **Normativa**: **RD 326/2026, de 22 de abril** (BOE-A-2026-8872), Capítulo IV, secciones 3.ª
  (arts. 132-139, alquiler) y 4.ª (arts. 140-145, compra rural). Cada constante cita su artículo.
- **Vigilar**: las convocatorias autonómicas —que es donde se concreta y donde puede subir la renta
  máxima (art. 135, con acuerdo previo del Ministerio)— y cualquier modificación del RD. El anexo IV
  (precio máximo de vivienda por CA para la ayuda de compra) **no está volcado aquí**: si alguna app
  llega a necesitarlo, se trae con su propia verificación.
- **Cadencia**: al abrir convocatorias las CCAA (previstas para el 2.º semestre de 2026) y ante
  cualquier reforma del Plan. El Plan cubre 2026-2030, así que fuera de eso el dato es estable.
- **Alerta metodológica**: **confundirlo con el RD 42/2022**. No es una actualización de cifras: el
  plan anterior fijaba 600 €/mes de renta máxima ampliables a 900 € en zona tensionada, y el vigente
  fija 1.000 € (vivienda) / 600 € (habitación), sin esa figura. Un texto que hable de «900 € en zona
  tensionada» está citando la convocatoria muerta.
- **Por qué está aquí y no exento**: son cuantías y umbrales con fecha de caducidad, en apps de
  riesgo 1. Nació el 23/08/2026 al reparar el hallazgo 154 del Inspector: los valores vivían inline
  en `simulador-bono-joven-alquiler`, y al verificarlos contra el BOE resultó que **los límites de
  renta en producción eran los del RD 42/2022**, derogado. Sin punto único, el Vigía Normativo no
  tenía nada que vigilar.
- **Verificado**: 2026-08-23 · artículo por artículo contra el texto del BOE.

---

## 4. Precedentes de cambio de metodología (la vara de medir)

Casos reales en los que la administración cambió el **sistema de cálculo**, no las cifras — el tipo
de evento que el vigía debe distinguir y escalar como alerta máxima:

| Año | Cambio | Norma | Módulo hoy |
|---|---|---|---|
| 2021 | IIVTNU: sistema objetivo único → método dual (objetivo/real) tras STC 182/2021 | RDL 26/2021 | `inmuebles` |
| 2023 | RETA: libre elección de base → cotización por ingresos reales con 15 tramos | RDL 13/2022 | `autonomos` |
| 2023 | Alquiler: IPC → IRAV como índice legal | Ley 12/2023 | `alquiler` |
| 2023-2026 | Pensiones: base reguladora fija 25 años → sistema dual 25/29 años en despliegue | RDL 2/2023 | `pensiones` |
| 2025 | IS micropymes: tipo fijo → escala progresiva transitoria | Ley 7/2024 | `sociedades` |
| 2025 | Brecha género: acceso restringido → igualdad de trato tras STJUE C-623/23 | Jurisprudencia | `pensiones` |

**Lecciones para el vigía**: los cambios de metodología llegan por (a) RDL tras sentencia
(constitucional o europea), (b) reformas estructurales pactadas (pensiones, autónomos), (c) leyes
ómnibus de diciembre. Ninguno de los seis casos anteriores fue "una cifra nueva en la misma casilla".

## 5. Reglas de clasificación para el informe del vigía

Cada hallazgo se clasifica en un nivel. El vigía **nunca** edita módulos ni código; su única salida
es el informe.

| Nivel | Qué es | Ejemplo | Acción del informe |
|---|---|---|---|
| **N0 — Sin efecto** | Norma que no toca ningún módulo | Orden de pesca en el BOE | No aparece en el informe |
| **N1 — Cambio de datos** | Mismas fórmulas, nuevas cifras/fechas | Nueva Resolución del Tesoro con el tipo de demora del semestre | Tabla: módulo · constante afectada · valor actual → valor nuevo · URL BOE · fecha de efectos |
| **N2 — Cambio de metodología** | Nueva fórmula, índice, estructura u orden de cálculo | Una CCAA convierte su bonificación ISD en reducción en base | ALERTA destacada: descripción del sistema nuevo vs el documentado en §3 · módulos y apps afectadas · urgencia (fecha de entrada en vigor) |
| **N3 — Cambio de universo** | Nace o muere un impuesto/prestación/régimen | Franquicia de IVA transpuesta; nueva prestación estatal | Oportunidad: propuesta de nuevo módulo/app o retirada |

**Reglas duras del vigía**:
1. Solo lectura de fuentes + este manifiesto + los sellos `*_META` de los módulos. Nada de escritura en el repositorio.
2. Todo hallazgo N1-N3 debe citar la disposición exacta (BOE-A-XXXX-XXXXX) y su fecha de entrada en vigor. Sin URL oficial verificable, el hallazgo se marca "SIN CONFIRMAR" y no se reporta como hecho.
3. Si una fuente no responde o el resultado es ambiguo, se reporta la duda — nunca se rellena con suposición.
4. El informe termina siempre con: módulos NO revisados en esta pasada (transparencia de cobertura).
5. Los sellos `verificado` de cada módulo indican la línea base: solo interesa lo publicado DESPUÉS de esa fecha.
6. **Un N3 sobre un régimen de la lista 5.bis no se escala**: se menciona en una línea y se cierra citando esta sección. Sin esto, un anexo que se actualiza dos veces al año obliga a re-decidir lo mismo cada mes.

### 5.bis Regímenes DESCARTADOS del universo (no volver a proponerlos)

Un N3 propone dar de alta un régimen que hoy no existe en `data/fiscal/`. Cuando la respuesta es que
**no entra**, se anota aquí con su motivo. La decisión se revisa solo si cambia el motivo, no cada vez
que la norma se actualiza.

| Régimen | Descartado | Motivo |
|---|---|---|
| **Jubilación anticipada por discapacidad ≥45%** (RD 1851/2009, anexo de patologías) | 2026-08-12 | Lo que aportaría es **una lista de patologías**, no un cálculo: la pregunta que resuelve («¿está mi enfermedad en el anexo?») es consulta de tabla, y la respuesta autorizada la da el INSS con dictamen del EVI. El anexo se ha actualizado dos veces en pocos meses (la última, RD 632/2026), así que sería mantenimiento alto con caducidad silenciosa. Y el resultado sería un **veredicto binario sobre la persona** sobre una lista que cambia por RD. Ninguna app del catálogo lo roza hoy: verificado que las 10 apps de jubilación no mencionan discapacidad y las 5 de discapacidad/dependencia no mencionan jubilación, así que no hay deuda que cerrar — solo un borde, resuelto con una advertencia en el bloque educativo de `simulador-jubilacion-publica`. |

---

## Anexo A — Mapa de dependencias módulo → apps

*(Generado 2026-07-13 a partir de los imports de `@/data/fiscal` en `app/` — 91 archivos verificados,
incluidos los imports directos por subpath. Las "fichas Delegum" son páginas de
`app/delegum/datos-fiscales/`; "API" indica exposición vía `/api/datos`. Este anexo permite al
informe del vigía enumerar las apps afectadas por cada hallazgo.)*

| Módulo | Apps | Fichas Delegum | API |
|---|---|---|:---:|
| `alquiler` | estimador-actualizacion-alquiler | — | — |
| `amortizacion` | calculadora-amortizacion-inmovilizado | amortizacion-inmovilizado | ✅ |
| `autonomos` | asistente-alta-autonomo · comparador-autonomo-vs-sl · estimador-cuota-autonomo · orientador-tarifa-freelance · simulador-modulos-vs-directa | cuota-autonomos-reta | ✅ |
| `ayudas-personas` | orientador-ayudas-personas-familias | — | — |
| `ayudas-publicas` | orientador-ayudas-autonomos-pymes | — | — |
| `becas-estudio` | orientador-becas-ayudas-estudio | — | — |
| `calendario` | *(solo Delegum/API)* | calendario-fiscal | ✅ |
| `dependencia` | estimacion-prestaciones-dependencia · estimacion-deduccion-discapacidad · test-zarit-cuidador | prestaciones-dependencia | ✅ |
| `donaciones` | estimador-impuesto-donaciones | donaciones-isd | ✅ |
| `esperanza-vida` | planificador-ahorro-jubilacion · *(y los motores `brechaJubilacion` y `pensionComplementaria`, vía MCP Delegum y Actions de ChatGPT)* | — | — |
| `inmuebles` | comparador-autonomo-vs-sl · estimador-compraventa-inmueble · estimador-plusvalia-municipal · estimador-plusvalias-irpf · optimizador-rentas-60 · orientador-tipos-renta-irpf · simulador-heredar-vivienda · simulador-gastos-compraventa-garaje · simulador-gastos-compraventa-trastero | itp-ccaa · plusvalia-municipal · irpf-tramos-minimos | ✅ |
| `intereses` | orientador-intereses-demora | interes-legal-demora | ✅ |
| `iprem` | *(solo Delegum/API)* | iprem | ✅ |
| `irpf` | comparador-autonomo-vs-sl · estimacion-deduccion-discapacidad · estimador-smi · estimador-irpf · estimador-irpf-pensionista · estimador-sueldo-neto · impuestos-divorcio · optimizador-rentas-60 · orientador-tipos-renta-irpf · planificador-ahorro-jubilacion · simulador-jubilacion-publica · simulador-desglose-nomina · simulador-renta-plan-pensiones · simulador-modulos-vs-directa · simulador-irpf-tramos · simulador-mito-tramo-superior · test-obligado-declarar-renta · visualizador-sueldo-neto | irpf-tramos-minimos | ✅ |
| `iva` | orientador-iva-espana | iva-tipos | ✅ |
| `jubilacion-tramites` | orientador-tramites-jubilacion | — | — |
| `maternidad` | estimacion-prestacion-nacimiento · estimacion-deduccion-maternidad · estimacion-baja-maternal · planificador-gastos-bebe · test-estilo-parental | permiso-prestacion-nacimiento | ✅ |
| `nomada-digital` | requisitos-nomada-digital | — | — |
| `patrimonio` | orientador-limite-conjunto-patrimonio · orientador-impuesto-patrimonio | impuesto-patrimonio | ✅ |
| `pensiones` | estimador-pension-viudedad · estimador-complemento-minimos · planificador-ahorro-jubilacion · selector-plan-pensiones · simulador-jubilacion-publica · simulador-renta-plan-pensiones · verificador-complemento-brecha-genero · visualizador-jubilacion-perspectiva | pensiones-jubilacion | ✅ |
| `smi` | calculadora-propinas · estimador-smi | smi-salario-minimo | ✅ |
| `sociedades` | comparador-autonomo-vs-sl · simulador-financiacion-empresarial | impuesto-sociedades | ✅ |
| `sucesiones` | estimador-impuesto-sucesiones · simulador-heredar-vivienda | sucesiones-isd | ✅ |
| `vivienda-joven` | simulador-bono-joven-alquiler · orientador-ayuda-vivienda-rural | — | — |

**Observaciones del mapa** (relevantes para priorizar alertas):
- **`irpf.ts` es el módulo de mayor radio de impacto**: 18 apps + ficha Delegum + API. Un cambio N2 en IRPF es el escenario de máxima urgencia.
- **Dependencia interna en cascada**: `nomada-digital.ts` importa el SMI desde `smi.ts` — un RD de SMI nuevo afecta a ambos módulos aunque solo se edite uno.
- Apps multi-módulo (un hallazgo puede afectarles por varias vías): `comparador-autonomo-vs-sl` (autonomos+inmuebles+irpf+sociedades), `simulador-heredar-vivienda` (sucesiones+inmuebles), `optimizador-rentas-60` (irpf+inmuebles+patrimonio vía barrel y subpath).
- 16 módulos están expuestos también por `/api/datos` (capa IA de Delegum): un dato desactualizado ahí lo consumen directamente ChatGPT/Claude/Perplexity — refuerza la prioridad de los sellos antiguos.
