'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './Biomoleculas.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'familias' | 'estructuras' | 'composicion' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'familias', titulo: 'Las 4 Familias', icono: '🧪', subtitulo: 'Carbohidratos, lípidos, proteínas y ácidos nucleicos' },
  { id: 'estructuras', titulo: 'Estructuras', icono: '🔬', subtitulo: 'Bloques de construcción y ensamblaje' },
  { id: 'composicion', titulo: '¿De qué Estás Hecho?', icono: '🧬', subtitulo: 'Composición del cuerpo humano' },
  { id: 'datos', titulo: 'Datos Fascinantes', icono: '💡', subtitulo: 'Curiosidades y errores comunes' },
];

// ─────────────────────────────────────────────
// Datos de las 4 familias
// ─────────────────────────────────────────────

type BioId = 'carbohidratos' | 'lipidos' | 'proteinas' | 'acidos-nucleicos';

interface Biomolecula {
  id: BioId;
  nombre: string;
  icono: string;
  color: string;
  colorClaro: string;
  elementos: string;
  funcion: string;
  monomero: string;
  polimero: string;
  ejemplos: string[];
  kcalPorGramo: number;
  descripcion: string;
}

const BIOMOLECULAS: Biomolecula[] = [
  {
    id: 'carbohidratos',
    nombre: 'Carbohidratos',
    icono: '🍞',
    color: '#E67E22',
    colorClaro: 'rgba(230, 126, 34, 0.1)',
    elementos: 'C, H, O',
    funcion: 'Energía rápida',
    monomero: 'Monosacárido (glucosa)',
    polimero: 'Almidón, glucógeno, celulosa',
    ejemplos: ['Pan', 'Arroz', 'Fruta', 'Pasta'],
    kcalPorGramo: 4,
    descripcion: 'Son la fuente de energía inmediata del cuerpo. La glucosa es el combustible preferido del cerebro. Se almacenan como glucógeno en músculos e hígado.',
  },
  {
    id: 'lipidos',
    nombre: 'Lípidos',
    icono: '🫒',
    color: '#F1C40F',
    colorClaro: 'rgba(241, 196, 15, 0.1)',
    elementos: 'C, H, O',
    funcion: 'Reserva energética + membranas',
    monomero: 'Ácidos grasos + glicerol',
    polimero: 'No son polímeros (triglicéridos, fosfolípidos)',
    ejemplos: ['Aceite de oliva', 'Mantequilla', 'Aguacate', 'Frutos secos'],
    kcalPorGramo: 9,
    descripcion: 'Almacenan más del doble de energía que los carbohidratos. Forman las membranas celulares (fosfolípidos) y actúan como aislante térmico y protección de órganos.',
  },
  {
    id: 'proteinas',
    nombre: 'Proteínas',
    icono: '🥩',
    color: '#E74C3C',
    colorClaro: 'rgba(231, 76, 60, 0.1)',
    elementos: 'C, H, O, N, S',
    funcion: 'Estructura + catálisis (enzimas)',
    monomero: 'Aminoácido (20 tipos)',
    polimero: 'Cadenas polipeptídicas',
    ejemplos: ['Músculo', 'Hemoglobina', 'Anticuerpos', 'Enzimas'],
    kcalPorGramo: 4,
    descripcion: 'Son las moléculas más versátiles: forman tejidos (colágeno), transportan oxígeno (hemoglobina), defienden el cuerpo (anticuerpos) y aceleran reacciones (enzimas).',
  },
  {
    id: 'acidos-nucleicos',
    nombre: 'Ácidos Nucleicos',
    icono: '🧬',
    color: '#3498DB',
    colorClaro: 'rgba(52, 152, 219, 0.1)',
    elementos: 'C, H, O, N, P',
    funcion: 'Información genética',
    monomero: 'Nucleótido',
    polimero: 'ADN, ARN',
    ejemplos: ['ADN (doble hélice)', 'ARN mensajero', 'ARN de transferencia', 'ARN ribosómico'],
    kcalPorGramo: 0,
    descripcion: 'Contienen las instrucciones para fabricar todas las proteínas del cuerpo. El ADN almacena la información; el ARN la copia y la traduce.',
  },
];

// ─────────────────────────────────────────────
// Datos de estructuras
// ─────────────────────────────────────────────

type EstructuraId = 'glucosa' | 'acido-graso' | 'aminoacido' | 'nucleotido';

interface Estructura {
  id: EstructuraId;
  nombre: string;
  bioId: BioId;
  color: string;
  bloques: string[];
  enlace: string;
  polimeroNombre: string;
  explicacion: string;
  niveles?: string[];
}

const ESTRUCTURAS: Estructura[] = [
  {
    id: 'glucosa',
    nombre: 'Glucosa',
    bioId: 'carbohidratos',
    color: '#E67E22',
    bloques: ['C₆H₁₂O₆', 'Anillo hexagonal', '6 carbonos'],
    enlace: 'Enlace glucosídico',
    polimeroNombre: 'Almidón / Celulosa',
    explicacion: 'La glucosa forma un anillo de 6 carbonos. Al unir glucosas con enlace glucosídico se forma almidón (digerible) o celulosa (no digerible). Misma molécula, distinto enlace, función totalmente diferente.',
  },
  {
    id: 'acido-graso',
    nombre: 'Ácido Graso',
    bioId: 'lipidos',
    color: '#F1C40F',
    bloques: ['Cabeza polar (COOH)', 'Cola hidrofóbica (cadena C)', 'Saturado / Insaturado'],
    enlace: 'Enlace éster (con glicerol)',
    polimeroNombre: 'Triglicérido (3 ácidos grasos + glicerol)',
    explicacion: 'Un ácido graso tiene una cabeza que atrae agua (polar) y una cola larga que la repele. Esto es lo que hace que el aceite y el agua no se mezclen. Jabón = grasa + sosa: la cabeza polar atrapa el agua, la cola atrapa la grasa.',
  },
  {
    id: 'aminoacido',
    nombre: 'Aminoácido',
    bioId: 'proteinas',
    color: '#E74C3C',
    bloques: ['Grupo amino (NH₂)', 'Grupo carboxilo (COOH)', 'Cadena R (variable)'],
    enlace: 'Enlace peptídico',
    polimeroNombre: 'Cadena polipeptídica → Proteína',
    explicacion: 'Los 20 aminoácidos se diferencian solo en la cadena R. Al unirse con enlace peptídico forman cadenas que se pliegan en formas 3D específicas — la forma determina la función.',
    niveles: ['Primaria: secuencia de aminoácidos', 'Secundaria: α-hélice y β-lámina', 'Terciaria: plegamiento 3D completo', 'Cuaternaria: varias cadenas unidas (ej: hemoglobina)'],
  },
  {
    id: 'nucleotido',
    nombre: 'Nucleótido',
    bioId: 'acidos-nucleicos',
    color: '#3498DB',
    bloques: ['Base nitrogenada (A, T/U, G, C)', 'Azúcar (desoxirribosa / ribosa)', 'Grupo fosfato (PO₄)'],
    enlace: 'Enlace fosfodiéster',
    polimeroNombre: 'ADN (doble hélice) / ARN (cadena simple)',
    explicacion: 'Cada nucleótido tiene 3 partes. Las bases se emparejan: A-T y G-C (en ADN). Esta complementariedad permite copiar la información genética con precisión.',
  },
];

// ─────────────────────────────────────────────
// Composición corporal
// ─────────────────────────────────────────────

interface Componente {
  nombre: string;
  porcentaje: number;
  color: string;
  icono: string;
}

const COMPOSICION_HUMANA: Componente[] = [
  { nombre: 'Agua', porcentaje: 60, color: '#42A5F5', icono: '💧' },
  { nombre: 'Proteínas', porcentaje: 18, color: '#E74C3C', icono: '🥩' },
  { nombre: 'Lípidos', porcentaje: 13, color: '#F1C40F', icono: '🫒' },
  { nombre: 'Minerales', porcentaje: 5.5, color: '#95A5A6', icono: '🦴' },
  { nombre: 'Carbohidratos', porcentaje: 1.5, color: '#E67E22', icono: '🍞' },
  { nombre: 'Ácidos nucleicos', porcentaje: 1, color: '#3498DB', icono: '🧬' },
];

interface SerVivo {
  nombre: string;
  icono: string;
  carbohidratos: number;
  lipidos: number;
  proteinas: number;
  agua: number;
  otros: number;
}

const SERES_VIVOS: SerVivo[] = [
  { nombre: 'Humano', icono: '🧑', carbohidratos: 1.5, lipidos: 13, proteinas: 18, agua: 60, otros: 7.5 },
  { nombre: 'Planta (árbol)', icono: '🌳', carbohidratos: 60, lipidos: 2, proteinas: 5, agua: 25, otros: 8 },
  { nombre: 'Bacteria', icono: '🦠', carbohidratos: 5, lipidos: 9, proteinas: 55, agua: 20, otros: 11 },
  { nombre: 'Insecto', icono: '🐛', carbohidratos: 3, lipidos: 10, proteinas: 20, agua: 60, otros: 7 },
];

interface DietaItem {
  tipo: string;
  color: string;
  gramos: number;
  kcal: number;
  porcentaje: number;
}

const DIETA_2000: DietaItem[] = [
  { tipo: 'Carbohidratos', color: '#E67E22', gramos: 250, kcal: 1000, porcentaje: 50 },
  { tipo: 'Lípidos', color: '#F1C40F', gramos: 78, kcal: 700, porcentaje: 35 },
  { tipo: 'Proteínas', color: '#E74C3C', gramos: 75, kcal: 300, porcentaje: 15 },
];

// ─────────────────────────────────────────────
// Datos fascinantes
// ─────────────────────────────────────────────

interface DatoFascinante {
  icono: string;
  titulo: string;
  detalle: string;
}

const DATOS_FASCINANTES: DatoFascinante[] = [
  { icono: '🧬', titulo: 'ADN de 2 metros en 10 μm', detalle: 'Tu ADN estirado mediría unos 2 metros, pero cabe enrollado dentro del núcleo de una célula de solo 10 micrómetros.' },
  { icono: '🥩', titulo: '100.000 proteínas de 20.000 genes', detalle: 'Tienes unas 100.000 proteínas diferentes, todas codificadas por solo ~20.000 genes. Un gen puede dar lugar a varias proteínas.' },
  { icono: '🫒', titulo: '1 g de grasa = 9 kcal', detalle: '1 gramo de grasa aporta 9 kcal, más del doble que un gramo de carbohidratos o proteínas (4 kcal). Por eso la grasa es la reserva energética más eficiente.' },
  { icono: '🍞', titulo: 'Celulosa = almidón (casi)', detalle: 'La celulosa (madera, algodón) y el almidón (pan) están hechos del MISMO monómero: glucosa. Solo cambia el tipo de enlace entre las moléculas.' },
  { icono: '🧪', titulo: 'Enzimas: x10¹⁷ más rápido', detalle: 'Las enzimas son proteínas que aceleran reacciones químicas hasta 10¹⁷ veces. Sin ellas, la digestión tardaría años en lugar de horas.' },
  { icono: '💊', titulo: 'Insulina: la primera secuenciada', detalle: 'La insulina fue la primera proteína cuya secuencia de aminoácidos se determinó (Frederick Sanger, 1955). Le valió el Nobel.' },
  { icono: '🕷️', titulo: 'Seda de araña > acero', detalle: 'La seda de araña es una proteína (fibroína) que, por peso, es más resistente que el acero. Los ingenieros intentan replicarla para crear materiales avanzados.' },
];

interface ErrorComun {
  mito: string;
  realidad: string;
}

const ERRORES_COMUNES: ErrorComun[] = [
  { mito: '"Las grasas son malas"', realidad: 'Los lípidos son esenciales: forman membranas celulares, producen hormonas, aíslan del frío y protegen órganos. Lo importante es el tipo y la cantidad.' },
  { mito: '"Los carbohidratos engordan"', realidad: 'Ningún macronutriente engorda por sí solo. Engorda el exceso calórico. Los carbohidratos son la fuente principal de energía del cerebro.' },
  { mito: '"Cuanta más proteína, mejor"', realidad: 'El cuerpo solo puede usar cierta cantidad de proteínas. El exceso se convierte en energía o se almacena. Las recomendaciones son 0,8-2 g/kg/día según actividad.' },
  { mito: '"El ADN es solo para heredar"', realidad: 'El ADN se usa constantemente: cada vez que una célula fabrica una proteína, lee y copia un fragmento de ADN. Es un manual de instrucciones activo, no un archivo pasivo.' },
];

// ─────────────────────────────────────────────
// Sección 1: Las 4 Familias
// ─────────────────────────────────────────────

function SeccionFamilias() {
  const [activa, setActiva] = useState<BioId | null>(null);
  const seleccionada = BIOMOLECULAS.find(b => b.id === activa);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Toda la vida se construye con 4 tipos de moléculas. Toca cada una para explorar sus <strong>elementos, función, monómero y ejemplos</strong>.</p>
      </div>

      {/* Cards de las 4 familias */}
      <div className={styles.familiasGrid}>
        {BIOMOLECULAS.map(b => (
          <button
            key={b.id}
            type="button"
            className={`${styles.familiaCard} ${activa === b.id ? styles.familiaActiva : ''}`}
            style={{
              borderColor: activa === b.id ? b.color : undefined,
              background: activa === b.id ? b.colorClaro : undefined,
            }}
            onClick={() => setActiva(activa === b.id ? null : b.id)}
            aria-pressed={activa === b.id}
            aria-label={`${b.nombre}: toca para ver detalles`}
          >
            <span className={styles.familiaIcono} aria-hidden="true">{b.icono}</span>
            <span className={styles.familiaNombre} style={{ color: activa === b.id ? b.color : undefined }}>{b.nombre}</span>
            <span className={styles.familiaElementos}>{b.elementos}</span>
            <span className={styles.familiaFuncion}>{b.funcion}</span>
          </button>
        ))}
      </div>

      {/* Panel expandido */}
      {seleccionada && (
        <div className={styles.infoPanel} style={{ borderLeftColor: seleccionada.color }}>
          <h4 className={styles.infoPanelTitulo} style={{ color: seleccionada.color }}>
            <span aria-hidden="true">{seleccionada.icono}</span> {seleccionada.nombre}
          </h4>
          <p className={styles.infoPanelFuncion}>{seleccionada.descripcion}</p>
          <div className={styles.infoPanelMeta}>
            <span className={styles.infoPanelTag}><strong>Elementos:</strong> {seleccionada.elementos}</span>
            <span className={styles.infoPanelTag}><strong>Monómero:</strong> {seleccionada.monomero}</span>
            <span className={styles.infoPanelTag}><strong>Polímero:</strong> {seleccionada.polimero}</span>
            <span className={styles.infoPanelTag}><strong>Energía:</strong> {seleccionada.kcalPorGramo} kcal/g</span>
          </div>
          <div className={styles.ejemplosLista}>
            <strong>Ejemplos cotidianos:</strong>{' '}
            {seleccionada.ejemplos.join(', ')}
          </div>
        </div>
      )}

      {/* Tabla comparativa */}
      <h3 className={styles.subSeccionTitulo}>Tabla comparativa</h3>
      <div className={styles.tablaContainer}>
        <div className={styles.tablaHeader}>
          <span className={styles.tablaHeaderCell}>Biomolécula</span>
          <span className={styles.tablaHeaderCell}>Elementos</span>
          <span className={styles.tablaHeaderCell}>Función</span>
          <span className={styles.tablaHeaderCell}>Monómero</span>
          <span className={styles.tablaHeaderCell}>kcal/g</span>
        </div>
        {BIOMOLECULAS.map(b => (
          <div key={b.id} className={styles.tablaRow}>
            <span className={styles.tablaCellNombre}>
              <span aria-hidden="true">{b.icono}</span> {b.nombre}
            </span>
            <span className={styles.tablaCell}>{b.elementos}</span>
            <span className={styles.tablaCell}>{b.funcion}</span>
            <span className={styles.tablaCell}>{b.monomero}</span>
            <span className={styles.tablaCellKcal} style={{ color: b.color, fontWeight: 700 }}>{b.kcalPorGramo}</span>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>Tu cuerpo es una fábrica química con <strong>4 ingredientes principales</strong>. Con ellos construye tejidos, almacena energía, transmite información y cataliza miles de reacciones por segundo.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Estructuras Visuales
// ─────────────────────────────────────────────

function SeccionEstructuras() {
  const [estructuraActiva, setEstructuraActiva] = useState<EstructuraId>('glucosa');
  const seleccionada = ESTRUCTURAS.find(e => e.id === estructuraActiva);
  const bioColor = BIOMOLECULAS.find(b => b.id === seleccionada?.bioId)?.color ?? '#2E86AB';

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Cada biomolécula tiene un bloque de construcción (monómero) que se ensambla para formar estructuras mayores. Selecciona una para ver <strong>cómo se construye</strong>.</p>
      </div>

      {/* Selector de estructura */}
      <div className={styles.estructuraBtns}>
        {ESTRUCTURAS.map(e => {
          const color = BIOMOLECULAS.find(b => b.id === e.bioId)?.color ?? '#999';
          return (
            <button
              key={e.id}
              type="button"
              className={`${styles.estructuraBtn} ${estructuraActiva === e.id ? styles.estructuraBtnActiva : ''}`}
              style={{
                borderColor: estructuraActiva === e.id ? color : undefined,
                background: estructuraActiva === e.id ? `${color}18` : undefined,
                color: estructuraActiva === e.id ? color : undefined,
              }}
              onClick={() => setEstructuraActiva(e.id)}
              aria-pressed={estructuraActiva === e.id}
            >
              {e.nombre}
            </button>
          );
        })}
      </div>

      {seleccionada && (
        <>
          {/* Diagrama de bloques: monómero */}
          <div className={styles.diagramaContainer}>
            <h4 className={styles.diagramaTitulo} style={{ color: bioColor }}>
              Monómero: {seleccionada.nombre}
            </h4>
            <div className={styles.bloquesMonoContainer}>
              {seleccionada.bloques.map((bloque, i) => (
                <div
                  key={i}
                  className={styles.bloqueMono}
                  style={{ borderColor: bioColor, background: `${bioColor}12` }}
                >
                  <span className={styles.bloqueTexto}>{bloque}</span>
                </div>
              ))}
            </div>

            {/* Flecha ensamblaje */}
            <div className={styles.ensamblajeFlecha}>
              <span className={styles.ensamblajeLinea} style={{ background: bioColor }} />
              <span className={styles.ensamblajeLabel}>{seleccionada.enlace}</span>
              <span className={styles.ensamblajeLinea} style={{ background: bioColor }} />
            </div>

            {/* Polímero */}
            <div className={styles.polimeroBloque} style={{ borderColor: bioColor, background: `${bioColor}08` }}>
              <span className={styles.polimeroNombre}>{seleccionada.polimeroNombre}</span>
              <div className={styles.polimeroVisual}>
                {[1, 2, 3, 4, 5].map(i => (
                  <span
                    key={i}
                    className={styles.polimeroPieza}
                    style={{ background: `${bioColor}${30 + i * 12}`, borderColor: bioColor }}
                  />
                ))}
                <span className={styles.polimeroEllipsis}>...</span>
              </div>
            </div>
          </div>

          {/* Explicación */}
          <div className={styles.infoPanel} style={{ borderLeftColor: bioColor }}>
            <p className={styles.infoPanelFuncion}>{seleccionada.explicacion}</p>
          </div>

          {/* Niveles de proteínas (solo aminoácido) */}
          {seleccionada.niveles && (
            <div className={styles.nivelesContainer}>
              <h4 className={styles.subSeccionTitulo}>Niveles de organización de proteínas</h4>
              <div className={styles.nivelesGrid}>
                {seleccionada.niveles.map((nivel, i) => (
                  <div key={i} className={styles.nivelCard}>
                    <span className={styles.nivelNum}>{i + 1}a</span>
                    <span className={styles.nivelTexto}>{nivel}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className={styles.insight}>
        <p><strong>20 aminoácidos</strong> distintos producen más de <strong>100.000 proteínas</strong> diferentes en tu cuerpo. Es como formar millones de palabras con un alfabeto de 20 letras.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: ¿De qué Estás Hecho?
// ─────────────────────────────────────────────

function SeccionComposicion() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Tu cuerpo está hecho de biomoléculas en proporciones muy concretas. Compárate con <strong>otros seres vivos</strong> y descubre qué comes cada día.</p>
      </div>

      {/* Composición corporal humana */}
      <h3 className={styles.subSeccionTitulo}>Composición del cuerpo humano</h3>
      <div className={styles.barrasContainer}>
        {COMPOSICION_HUMANA.map(c => (
          <div key={c.nombre} className={styles.barraRow}>
            <div className={styles.barraLabel}>
              <span aria-hidden="true">{c.icono}</span> {c.nombre}
            </div>
            <div className={styles.barraTrack}>
              <div
                className={styles.barraFill}
                style={{ width: `${c.porcentaje}%`, background: c.color }}
              />
            </div>
            <span className={styles.barraPorcentaje}>{c.porcentaje}%</span>
          </div>
        ))}
      </div>

      {/* Comparativa seres vivos */}
      <h3 className={styles.subSeccionTitulo}>Comparativa con otros seres vivos</h3>
      <div className={styles.comparativaVivos}>
        <div className={styles.comparativaVivosHeader}>
          <span className={styles.comparativaVivosLabel}>Ser vivo</span>
          <span className={styles.comparativaVivosVal}>Agua</span>
          <span className={styles.comparativaVivosVal}>Proteínas</span>
          <span className={styles.comparativaVivosVal}>Lípidos</span>
          <span className={styles.comparativaVivosVal}>Carbs</span>
        </div>
        {SERES_VIVOS.map(sv => (
          <div key={sv.nombre} className={styles.comparativaVivosRow}>
            <span className={styles.comparativaVivosNombre}>
              <span aria-hidden="true">{sv.icono}</span> {sv.nombre}
            </span>
            <span className={styles.comparativaVivosVal}>{sv.agua}%</span>
            <span className={styles.comparativaVivosVal}>{sv.proteinas}%</span>
            <span className={styles.comparativaVivosVal}>{sv.lipidos}%</span>
            <span className={styles.comparativaVivosVal}>{sv.carbohidratos}%</span>
          </div>
        ))}
      </div>

      {/* Dieta de 2.000 kcal */}
      <h3 className={styles.subSeccionTitulo}>Dieta típica de 2.000 kcal/día</h3>
      <div className={styles.dietaContainer}>
        <div className={styles.dietaBarra}>
          {DIETA_2000.map(d => (
            <div
              key={d.tipo}
              className={styles.dietaSegmento}
              style={{ width: `${d.porcentaje}%`, background: d.color }}
            >
              <span className={styles.dietaSegLabel}>{d.porcentaje}%</span>
            </div>
          ))}
        </div>
        <div className={styles.dietaLeyenda}>
          {DIETA_2000.map(d => (
            <div key={d.tipo} className={styles.dietaLeyendaItem}>
              <span className={styles.dietaLeyendaColor} style={{ background: d.color }} />
              <span className={styles.dietaLeyendaTexto}>
                {d.tipo}: {d.gramos} g ({d.kcal} kcal)
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.insight}>
        <p>Eres básicamente un saco de agua con proteínas — los <strong>carbohidratos son menos del 2%</strong> de tu cuerpo, pero aportan el <strong>50% de la energía</strong> que consumes cada día.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Datos Fascinantes
// ─────────────────────────────────────────────

function SeccionDatos() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Las biomoléculas son <strong>extraordinarias</strong>. Aquí tienes datos que ponen en perspectiva lo increíbles que son, y algunos mitos que conviene desmontar.</p>
      </div>

      {/* Grid de datos */}
      <div className={styles.datosGrid}>
        {DATOS_FASCINANTES.map((d, i) => (
          <div key={i} className={styles.datoCard}>
            <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
            <h3 className={styles.datoTitulo}>{d.titulo}</h3>
            <p className={styles.datoDetalle}>{d.detalle}</p>
          </div>
        ))}
      </div>

      {/* Errores comunes */}
      <h3 className={styles.subSeccionTitulo}>Mitos y realidades</h3>
      <div className={styles.mitosGrid}>
        {ERRORES_COMUNES.map((e, i) => (
          <div key={i} className={styles.mitoCard}>
            <div className={styles.mitoFalso}>
              <span className={styles.mitoTag}>Mito</span>
              <span className={styles.mitoTexto}>{e.mito}</span>
            </div>
            <div className={styles.mitoReal}>
              <span className={styles.realTag}>Realidad</span>
              <span className={styles.mitoTexto}>{e.realidad}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>Las biomoléculas no son &quot;buenas&quot; ni &quot;malas&quot;: cada una cumple funciones <strong>esenciales e insustituibles</strong>. La clave está en el equilibrio, no en la eliminación.</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorBiomoleculasPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('familias');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'familias': return <SeccionFamilias />;
      case 'estructuras': return <SeccionEstructuras />;
      case 'composicion': return <SeccionComposicion />;
      case 'datos': return <SeccionDatos />;
    }
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Biomoléculas</h1>
          <p className={styles.subtitle}>Los 4 ingredientes de la vida — carbohidratos, lípidos, proteínas y ácidos nucleicos</p>
        </header>

        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            <span aria-hidden="true">{SECCIONES.find(s => s.id === seccionActiva)?.icono}</span>{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Más sobre biomoléculas"
          subtitle="Preguntas frecuentes sobre bioquímica"
          defaultOpen={false}
        >
          <h3>¿Qué son las biomoléculas?</h3>
          <p>
            Son las moléculas que forman parte de los seres vivos. Se clasifican en 4 grandes grupos:
            <strong> carbohidratos</strong> (energía rápida), <strong>lípidos</strong> (reserva y membranas),
            <strong> proteínas</strong> (estructura y catálisis) y <strong>ácidos nucleicos</strong> (información genética).
            Todas están basadas en el carbono.
          </p>

          <h3>¿Por qué el carbono es tan importante?</h3>
          <p>
            El carbono puede formar <strong>4 enlaces covalentes</strong> simultáneos, lo que permite crear cadenas
            largas, ramificadas y anillos. Ningún otro elemento tiene esa versatilidad. Por eso la química
            de la vida se llama &quot;química orgánica&quot; — la química del carbono.
          </p>

          <h3>¿Qué diferencia hay entre grasas saturadas e insaturadas?</h3>
          <p>
            Las <strong>saturadas</strong> tienen todos sus carbonos unidos con enlaces simples (cadena recta,
            sólida a temperatura ambiente: mantequilla). Las <strong>insaturadas</strong> tienen uno o más dobles
            enlaces que crean &quot;codos&quot; en la cadena (líquida a temperatura ambiente: aceite de oliva).
            Las insaturadas son generalmente más saludables para el sistema cardiovascular.
          </p>

          <h3>¿Cómo se relacionan ADN y proteínas?</h3>
          <p>
            El ADN contiene las instrucciones (genes) para fabricar proteínas. El proceso es:
            <strong> ADN → ARN mensajero → proteína</strong>. Cada grupo de 3 nucleótidos (codón) codifica
            un aminoácido específico. Es el &quot;dogma central de la biología molecular&quot;.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador simplifica conceptos de bioquímica con fines educativos.
            La bioquímica es una disciplina extraordinariamente compleja y muchos mecanismos siguen siendo
            objeto de investigación activa. Los datos presentados reflejan el consenso científico actual.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-biomoleculas')} />
        <ShareCard appName="visualizador-biomoleculas" />
        <Footer appName="visualizador-biomoleculas" />
    </div>
  );
}
