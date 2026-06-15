'use client';
// @disclaimer: exempt
import { useState } from 'react';
import styles from './DigestionNutrientes.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type Seccion = 'macronutrientes' | 'digestion' | 'micronutrientes' | 'datos';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface Macronutriente {
  id: string;
  nombre: string;
  icono: string;
  color: string;
  fuentes: string;
  composicion: string;
  kcalPorGramo: number;
  funcion: string;
  proporcion: string;
}

interface PasoDigestion {
  lugar: string;
  icono: string;
  enzima: string;
  resultado: string;
  detalle: string;
}

interface Micronutriente {
  nombre: string;
  tipo: 'vitamina' | 'mineral';
  solubilidad?: 'hidrosoluble' | 'liposoluble';
  funcion: string;
  fuentes: string;
  deficit: string;
  icono: string;
}

interface DatoMetabolismo {
  titulo: string;
  icono: string;
  contenido: string;
  cifra?: string;
}

// ─────────────────────────────────────────────
// Datos: Macronutrientes
// ─────────────────────────────────────────────

const MACRONUTRIENTES: Macronutriente[] = [
  {
    id: 'carbohidratos',
    nombre: 'Carbohidratos',
    icono: '🍞',
    color: '#2E86AB',
    fuentes: '🍞 Pan, 🍚 Arroz, 🍝 Pasta, 🍌 Frutas, 🥔 Patatas, 🍯 Miel',
    composicion: 'C, H, O — Fórmula general: Cₙ(H₂O)ₙ',
    kcalPorGramo: 4,
    funcion: 'Energía inmediata. La glucosa es el combustible preferido del cerebro y los músculos.',
    proporcion: '50-55%',
  },
  {
    id: 'proteinas',
    nombre: 'Proteínas',
    icono: '🥩',
    color: '#E74C3C',
    fuentes: '🥩 Carne, 🐟 Pescado, 🥚 Huevos, 🫘 Legumbres, 🥛 Lácteos, 🥜 Frutos secos',
    composicion: 'C, H, O, N (+ S en algunas) — 20 aminoácidos, 9 esenciales',
    kcalPorGramo: 4,
    funcion: 'Construcción y reparación. Forman músculos, enzimas, anticuerpos, hormonas y transportadores.',
    proporcion: '15-20%',
  },
  {
    id: 'grasas',
    nombre: 'Grasas (Lípidos)',
    icono: '🫒',
    color: '#F39C12',
    fuentes: '🫒 Aceite de oliva, 🥑 Aguacate, 🥜 Frutos secos, 🐟 Pescado azul, 🧈 Mantequilla',
    composicion: 'C, H, O — Triglicéridos: glicerol + 3 ácidos grasos',
    kcalPorGramo: 9,
    funcion: 'Reserva energética, aislamiento térmico, protección de órganos, absorción de vitaminas liposolubles.',
    proporcion: '25-30%',
  },
];

// ─────────────────────────────────────────────
// Datos: Digestión paso a paso
// ─────────────────────────────────────────────

const DIGESTION_PASOS: Record<string, PasoDigestion[]> = {
  carbohidratos: [
    {
      lugar: 'Boca',
      icono: '😮',
      enzima: 'Amilasa salival',
      resultado: 'Almidón → Maltosa',
      detalle: 'La masticación rompe mecánicamente los alimentos. La amilasa salival (ptialina) empieza a descomponer los polisacáridos (almidón) en disacáridos (maltosa). Hasta un 40% del almidón cocido se digiere aquí.',
    },
    {
      lugar: 'Estómago',
      icono: '🫙',
      enzima: 'HCl (pH 1,5-2)',
      resultado: 'Desnaturalización parcial',
      detalle: 'El ácido clorhídrico detiene la acción de la amilasa salival (necesita pH neutro). Los carbohidratos no se digieren significativamente aquí, pero el medio ácido prepara el bolo para el intestino.',
    },
    {
      lugar: 'Intestino delgado',
      icono: '🌀',
      enzima: 'Maltasa, lactasa, sacarasa',
      resultado: 'Disacáridos → Monosacáridos',
      detalle: 'Las enzimas del borde en cepillo intestinal completan la digestión. La maltasa rompe maltosa en glucosa. La lactasa rompe lactosa en glucosa + galactosa. La sacarasa rompe sacarosa en glucosa + fructosa.',
    },
    {
      lugar: 'Glucosa en sangre',
      icono: '🩸',
      enzima: 'Absorción por vellosidades',
      resultado: 'Glucosa → Sangre portal → Hígado',
      detalle: 'Los monosacáridos se absorben por transporte activo en las vellosidades intestinales. Pasan a la sangre portal y llegan al hígado, que regula la liberación de glucosa al torrente sanguíneo.',
    },
    {
      lugar: 'Células (ATP)',
      icono: '⚡',
      enzima: 'Glucólisis + Ciclo de Krebs',
      resultado: 'Glucosa → CO₂ + H₂O + 36 ATP',
      detalle: 'Las células captan la glucosa gracias a la insulina. Dentro de la mitocondria, la glucólisis y el ciclo de Krebs la oxidan completamente, produciendo ~36 moléculas de ATP (energía celular), CO₂ (que exhalamos) y H₂O.',
    },
  ],
  proteinas: [
    {
      lugar: 'Estómago',
      icono: '🫙',
      enzima: 'Pepsina + HCl',
      resultado: 'Proteínas → Péptidos grandes',
      detalle: 'El HCl (pH 1,5-2) desnaturaliza las proteínas, desplegando su estructura tridimensional. El pepsinógeno se activa en pepsina, que rompe las proteínas en péptidos grandes (cadenas de aminoácidos).',
    },
    {
      lugar: 'Intestino delgado',
      icono: '🌀',
      enzima: 'Tripsina, quimotripsina',
      resultado: 'Péptidos → Dipéptidos + Aminoácidos',
      detalle: 'Las proteasas pancreáticas (tripsina, quimotripsina, carboxipeptidasa) continúan rompiendo los péptidos en fragmentos cada vez menores. Las peptidasas del borde en cepillo los reducen a aminoácidos individuales.',
    },
    {
      lugar: 'Aminoácidos en sangre',
      icono: '🩸',
      enzima: 'Absorción activa',
      resultado: 'Aminoácidos → Sangre portal → Hígado',
      detalle: 'Los aminoácidos se absorben por transporte activo en las vellosidades intestinales. El hígado recibe el "pool" de aminoácidos y decide cuáles liberar, cuáles usar para fabricar proteínas hepáticas y cuáles descomponer.',
    },
    {
      lugar: 'Músculos y tejidos',
      icono: '💪',
      enzima: 'Síntesis proteica (ribosomas)',
      resultado: 'Aminoácidos → Proteínas funcionales',
      detalle: 'Las células usan los aminoácidos como ladrillos para fabricar proteínas nuevas: fibras musculares (actina, miosina), enzimas, anticuerpos, hemoglobina, colágeno, hormonas peptídicas. Los 9 aminoácidos esenciales deben venir obligatoriamente de la dieta.',
    },
  ],
  grasas: [
    {
      lugar: 'Intestino delgado',
      icono: '🌀',
      enzima: 'Bilis (emulsión)',
      resultado: 'Gotas grandes → Micelas pequeñas',
      detalle: 'Las grasas son insolubles en agua. La bilis (producida por el hígado, almacenada en la vesícula biliar) actúa como un detergente: emulsiona las gotas grandes de grasa en micelas diminutas, multiplicando la superficie de ataque para las enzimas.',
    },
    {
      lugar: 'Intestino delgado',
      icono: '🧪',
      enzima: 'Lipasa pancreática',
      resultado: 'Triglicéridos → Ácidos grasos + Glicerol',
      detalle: 'La lipasa pancreática actúa sobre las micelas y rompe los triglicéridos en ácidos grasos libres y glicerol. La colipasa es un cofactor que ayuda a la lipasa a anclarse a la superficie de las micelas.',
    },
    {
      lugar: 'Quilomicrones',
      icono: '🔵',
      enzima: 'Reesterificación en enterocitos',
      resultado: 'Ácidos grasos → Quilomicrones → Linfa',
      detalle: 'Dentro de las células intestinales (enterocitos), los ácidos grasos se re-ensamblan en triglicéridos y se empaquetan en quilomicrones (lipoproteínas de transporte). A diferencia de glucosa y aminoácidos, NO van por la sangre portal: entran al sistema linfático.',
    },
    {
      lugar: 'Sangre y tejidos',
      icono: '🩸',
      enzima: 'Lipoproteín-lipasa',
      resultado: 'Quilomicrones → Tejidos → Reserva',
      detalle: 'Los quilomicrones llegan a la sangre desde la linfa. La lipoproteín-lipasa en los capilares libera los ácidos grasos, que las células captan para energía (oxidación beta) o almacenamiento en tejido adiposo como reserva energética de largo plazo.',
    },
  ],
};

// ─────────────────────────────────────────────
// Datos: Micronutrientes
// ─────────────────────────────────────────────

const MICRONUTRIENTES: Micronutriente[] = [
  { nombre: 'Vitamina A', tipo: 'vitamina', solubilidad: 'liposoluble', icono: '👁️', funcion: 'Visión, piel, sistema inmune', fuentes: 'Zanahoria, hígado, espinacas', deficit: 'Ceguera nocturna, piel seca' },
  { nombre: 'Vitamina C', tipo: 'vitamina', solubilidad: 'hidrosoluble', icono: '🍊', funcion: 'Antioxidante, síntesis de colágeno, absorción de hierro', fuentes: 'Cítricos, kiwi, pimiento, fresas', deficit: 'Escorbuto, encías sangrantes' },
  { nombre: 'Vitamina D', tipo: 'vitamina', solubilidad: 'liposoluble', icono: '☀️', funcion: 'Absorción de calcio, salud ósea, sistema inmune', fuentes: 'Sol, pescado azul, huevos, lácteos', deficit: 'Raquitismo (niños), osteomalacia (adultos)' },
  { nombre: 'Vitamina E', tipo: 'vitamina', solubilidad: 'liposoluble', icono: '🛡️', funcion: 'Antioxidante, protección de membranas celulares', fuentes: 'Aceite de oliva, almendras, aguacate', deficit: 'Daño oxidativo, debilidad muscular' },
  { nombre: 'Vitamina K', tipo: 'vitamina', solubilidad: 'liposoluble', icono: '🩹', funcion: 'Coagulación sanguínea, metabolismo óseo', fuentes: 'Verduras de hoja verde, brócoli', deficit: 'Hemorragias, mala coagulación' },
  { nombre: 'Vitamina B12', tipo: 'vitamina', solubilidad: 'hidrosoluble', icono: '🧬', funcion: 'Formación de glóbulos rojos, sistema nervioso, ADN', fuentes: 'Carne, huevos, lácteos (origen animal)', deficit: 'Anemia megaloblástica, neuropatía' },
  { nombre: 'Hierro', tipo: 'mineral', icono: '🔴', funcion: 'Transporte de oxígeno (hemoglobina), energía celular', fuentes: 'Carne roja, legumbres, espinacas', deficit: 'Anemia ferropénica, fatiga, palidez' },
  { nombre: 'Calcio', tipo: 'mineral', icono: '🦴', funcion: 'Huesos y dientes, contracción muscular, señalización', fuentes: 'Lácteos, brócoli, sardinas, almendras', deficit: 'Osteoporosis, calambres musculares' },
  { nombre: 'Zinc', tipo: 'mineral', icono: '🔬', funcion: 'Sistema inmune, cicatrización, sentido del gusto', fuentes: 'Marisco, carne, semillas de calabaza', deficit: 'Inmunidad baja, pérdida de gusto/olfato' },
  { nombre: 'Magnesio', tipo: 'mineral', icono: '⚙️', funcion: 'Más de 300 reacciones enzimáticas, músculos, nervios', fuentes: 'Chocolate negro, nueces, plátano, legumbres', deficit: 'Calambres, fatiga, irritabilidad' },
];

// ─────────────────────────────────────────────
// Datos: Metabolismo
// ─────────────────────────────────────────────

const DATOS_METABOLISMO: DatoMetabolismo[] = [
  {
    titulo: 'Metabolismo basal',
    icono: '🔥',
    cifra: '1.500-2.000 kcal/día',
    contenido: 'Es la energía que tu cuerpo gasta simplemente por existir: respirar, bombear sangre, mantener la temperatura corporal, renovar células. Sin mover un dedo, tu cerebro consume ~20% de esa energía (unas 400 kcal/día). El metabolismo basal supone el 60-75% del gasto energético total diario.',
  },
  {
    titulo: 'Índice glucémico',
    icono: '📊',
    cifra: '0-100',
    contenido: 'No todos los carbohidratos son iguales. El índice glucémico (IG) mide la velocidad a la que un alimento eleva la glucosa en sangre. Azúcar de mesa: IG ~65. Plátano: IG ~51. Lentejas: IG ~32. Aunque un plátano y una cucharada de azúcar tienen calorías similares, el plátano libera la glucosa gradualmente gracias a su fibra, mientras el azúcar provoca un pico rápido seguido de un bajón.',
  },
  {
    titulo: 'Fibra: el nutriente que no se digiere',
    icono: '🌾',
    cifra: '25-30 g/día recomendados',
    contenido: 'La fibra dietética no puede ser digerida por enzimas humanas, pero es esencial. La fibra soluble (avena, legumbres) forma un gel que ralentiza la absorción de glucosa y colesterol. La fibra insoluble (cereales integrales, verduras) aumenta el volumen fecal y acelera el tránsito. Ambas alimentan la microbiota intestinal, que las fermenta en ácidos grasos de cadena corta beneficiosos.',
  },
  {
    titulo: 'Agua: el nutriente olvidado',
    icono: '💧',
    cifra: '60% del cuerpo',
    contenido: 'El agua constituye aproximadamente el 60% del peso corporal. Es el disolvente universal donde ocurren todas las reacciones bioquímicas de la digestión y el metabolismo. Transporta nutrientes, regula la temperatura, lubrica articulaciones y facilita la absorción intestinal. Una deshidratación del 2% ya reduce el rendimiento cognitivo y físico.',
  },
  {
    titulo: 'El intestino delgado por dentro',
    icono: '📏',
    cifra: '~6 m de largo, ~32 m² de superficie',
    contenido: 'El intestino delgado mide unos 6 metros de longitud, pero su verdadero secreto son las vellosidades y microvellosidades intestinales. Estos pliegues microscópicos multiplican la superficie de absorción hasta alcanzar ~32 m², comparable a una pista de tenis de mesa. Sin ellos, necesitarías cientos de metros de intestino para absorber los mismos nutrientes.',
  },
];

// ─────────────────────────────────────────────
// Secciones del tab
// ─────────────────────────────────────────────

const SECCIONES: { id: Seccion; nombre: string; icono: string }[] = [
  { id: 'macronutrientes', nombre: 'Macronutrientes', icono: '🍽️' },
  { id: 'digestion', nombre: 'Digestión', icono: '🔬' },
  { id: 'micronutrientes', nombre: 'Micronutrientes', icono: '💊' },
  { id: 'datos', nombre: 'Datos', icono: '📊' },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorDigestionNutrientesPage() {
  const [seccion, setSeccion] = useState<Seccion>('macronutrientes');
  const [macroActivo, setMacroActivo] = useState<string | null>(null);
  const [macroDigestion, setMacroDigestion] = useState<string>('carbohidratos');

  const maxKcal = Math.max(...MACRONUTRIENTES.map(m => m.kcalPorGramo));

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Digestión y Nutrientes</h1>
          <p className={styles.subtitle}>
            De la comida a la célula: qué pasa con cada macronutriente tras comer,
            vitaminas, minerales y datos del metabolismo
          </p>
        </header>

        <LegalNotice />

        {/* Navegación por tabs */}
        <nav className={styles.tabNav} aria-label="Secciones del explicador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.tabBtn} ${seccion === s.id ? styles.tabActivo : ''}`}
              onClick={() => setSeccion(s.id)}
              aria-pressed={seccion === s.id}
            >
              <span aria-hidden="true">{s.icono}</span> {s.nombre}
            </button>
          ))}
        </nav>

        {/* ─── SECCIÓN 1: Macronutrientes ─── */}
        {seccion === 'macronutrientes' && (
          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Los 3 macronutrientes</h2>
            <p className={styles.seccionIntro}>
              Todo lo que comes se reduce a tres familias de moléculas. Pulsa cada una para ver sus detalles.
            </p>

            <div className={styles.macroGrid}>
              {MACRONUTRIENTES.map(m => (
                <button
                  key={m.id}
                  type="button"
                  className={`${styles.macroCard} ${macroActivo === m.id ? styles.macroCardActivo : ''}`}
                  onClick={() => setMacroActivo(macroActivo === m.id ? null : m.id)}
                  style={{ borderColor: macroActivo === m.id ? m.color : undefined }}
                  aria-expanded={macroActivo === m.id}
                >
                  <span className={styles.macroIcono} aria-hidden="true">{m.icono}</span>
                  <span className={styles.macroNombre} style={{ color: m.color }}>{m.nombre}</span>
                  <span className={styles.macroKcal}>
                    {m.kcalPorGramo} kcal/g
                  </span>

                  {macroActivo === m.id && (
                    <div className={styles.macroDetalle} onClick={e => e.stopPropagation()}>
                      <div className={styles.macroFila}>
                        <span className={styles.macroEtiqueta}>Fuentes</span>
                        <span>{m.fuentes}</span>
                      </div>
                      <div className={styles.macroFila}>
                        <span className={styles.macroEtiqueta}>Composición</span>
                        <span>{m.composicion}</span>
                      </div>
                      <div className={styles.macroFila}>
                        <span className={styles.macroEtiqueta}>Función</span>
                        <span>{m.funcion}</span>
                      </div>
                      <div className={styles.macroFila}>
                        <span className={styles.macroEtiqueta}>% recomendado</span>
                        <span>{m.proporcion} de la dieta</span>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Comparativa visual kcal/g */}
            <div className={styles.comparativaBloque}>
              <h3 className={styles.comparativaTitulo}>Calorías por gramo</h3>
              {MACRONUTRIENTES.map(m => (
                <div key={m.id} className={styles.comparativaFila}>
                  <span className={styles.comparativaLabel}>{m.nombre}</span>
                  <div className={styles.comparativaBarra}>
                    <div
                      className={styles.comparativaRelleno}
                      style={{
                        width: `${(m.kcalPorGramo / maxKcal) * 100}%`,
                        backgroundColor: m.color,
                      }}
                    />
                  </div>
                  <span className={styles.comparativaValor}>{m.kcalPorGramo} kcal</span>
                </div>
              ))}
              <p className={styles.comparativaNota}>
                Las grasas aportan {formatNumber(9 / 4, 1)}x más energía por gramo que los carbohidratos o las proteínas
              </p>
            </div>

            {/* Proporción recomendada */}
            <div className={styles.proporcionBloque}>
              <h3 className={styles.proporcionTitulo}>Proporción recomendada en la dieta</h3>
              <div className={styles.proporcionBarra}>
                <div className={styles.proporcionSegmento} style={{ width: '52.5%', backgroundColor: MACRONUTRIENTES[0].color }}>
                  <span>50-55%</span>
                </div>
                <div className={styles.proporcionSegmento} style={{ width: '17.5%', backgroundColor: MACRONUTRIENTES[1].color }}>
                  <span>15-20%</span>
                </div>
                <div className={styles.proporcionSegmento} style={{ width: '27.5%', backgroundColor: MACRONUTRIENTES[2].color }}>
                  <span>25-30%</span>
                </div>
              </div>
              <div className={styles.proporcionLeyenda}>
                {MACRONUTRIENTES.map(m => (
                  <div key={m.id} className={styles.leyendaItem}>
                    <span className={styles.leyendaColor} style={{ backgroundColor: m.color }} />
                    <span>{m.nombre}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ─── SECCIÓN 2: Digestión paso a paso ─── */}
        {seccion === 'digestion' && (
          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Digestión paso a paso</h2>
            <p className={styles.seccionIntro}>
              Elige un macronutriente y sigue su camino desde el plato hasta la célula.
            </p>

            {/* Selector de macronutriente */}
            <div className={styles.selectorMacro}>
              {MACRONUTRIENTES.map(m => (
                <button
                  key={m.id}
                  type="button"
                  className={`${styles.selectorBtn} ${macroDigestion === m.id ? styles.selectorActivo : ''}`}
                  onClick={() => setMacroDigestion(m.id)}
                  style={macroDigestion === m.id ? { backgroundColor: m.color, borderColor: m.color, color: 'white' } : undefined}
                  aria-pressed={macroDigestion === m.id}
                >
                  <span aria-hidden="true">{m.icono}</span> {m.nombre}
                </button>
              ))}
            </div>

            {/* Pasos con flechas */}
            <div className={styles.pasosWrap}>
              {DIGESTION_PASOS[macroDigestion].map((paso, i) => (
                <div key={i} className={styles.pasoRow}>
                  <div className={styles.pasoCard}>
                    <div className={styles.pasoHeader}>
                      <span className={styles.pasoNum}>{i + 1}</span>
                      <span className={styles.pasoIcono} aria-hidden="true">{paso.icono}</span>
                      <div className={styles.pasoInfo}>
                        <span className={styles.pasoLugar}>{paso.lugar}</span>
                        <span className={styles.pasoEnzima}>{paso.enzima}</span>
                      </div>
                    </div>
                    <div className={styles.pasoResultado}>
                      <span className={styles.pasoFlecha} aria-hidden="true">→</span>
                      <span>{paso.resultado}</span>
                    </div>
                    <p className={styles.pasoDetalle}>{paso.detalle}</p>
                  </div>
                  {i < DIGESTION_PASOS[macroDigestion].length - 1 && (
                    <div className={styles.pasoConector}>
                      <span className={styles.pasoFlechaAbajo} aria-hidden="true">▼</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── SECCIÓN 3: Micronutrientes ─── */}
        {seccion === 'micronutrientes' && (
          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Vitaminas y minerales esenciales</h2>
            <p className={styles.seccionIntro}>
              Los micronutrientes no aportan energía pero son imprescindibles para que el metabolismo funcione.
            </p>

            {/* Tipo: hidrosolubles vs liposolubles */}
            <div className={styles.tipoBanner}>
              <div className={styles.tipoCard}>
                <span className={styles.tipoIcono} aria-hidden="true">💧</span>
                <div>
                  <strong>Hidrosolubles</strong> (B, C)
                  <span className={styles.tipoDesc}>Se disuelven en agua. No se almacenan, se eliminan por orina. Necesitas ingerirlas a diario.</span>
                </div>
              </div>
              <div className={styles.tipoCard}>
                <span className={styles.tipoIcono} aria-hidden="true">🫒</span>
                <div>
                  <strong>Liposolubles</strong> (A, D, E, K)
                  <span className={styles.tipoDesc}>Se disuelven en grasa. Se almacenan en hígado y tejido adiposo. El exceso puede ser tóxico.</span>
                </div>
              </div>
            </div>

            <div className={styles.microGrid}>
              {MICRONUTRIENTES.map((mn, i) => (
                <div key={i} className={styles.microCard}>
                  <div className={styles.microHeader}>
                    <span className={styles.microIcono} aria-hidden="true">{mn.icono}</span>
                    <div>
                      <span className={styles.microNombre}>{mn.nombre}</span>
                      {mn.solubilidad && (
                        <span className={`${styles.microBadge} ${mn.solubilidad === 'hidrosoluble' ? styles.badgeHidro : styles.badgeLipo}`}>
                          {mn.solubilidad === 'hidrosoluble' ? '💧 Hidrosoluble' : '🫒 Liposoluble'}
                        </span>
                      )}
                      {mn.tipo === 'mineral' && (
                        <span className={`${styles.microBadge} ${styles.badgeMineral}`}>⚙️ Mineral</span>
                      )}
                    </div>
                  </div>
                  <div className={styles.microFila}>
                    <span className={styles.microEtiqueta}>Función</span>
                    <span>{mn.funcion}</span>
                  </div>
                  <div className={styles.microFila}>
                    <span className={styles.microEtiqueta}>Fuentes</span>
                    <span>{mn.fuentes}</span>
                  </div>
                  <div className={styles.microFila}>
                    <span className={styles.microEtiqueta}>Si falta...</span>
                    <span className={styles.microDeficit}>{mn.deficit}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.absorcionTip}>
              <span aria-hidden="true">💡</span>
              <p>
                <strong>La vitamina C mejora la absorción de hierro.</strong> Combinar legumbres o espinacas
                con cítricos (un chorro de limón) puede duplicar la cantidad de hierro que absorbes.
                En cambio, el café y el té inhiben su absorción.
              </p>
            </div>
          </section>
        )}

        {/* ─── SECCIÓN 4: Datos y metabolismo ─── */}
        {seccion === 'datos' && (
          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>Datos y metabolismo</h2>
            <p className={styles.seccionIntro}>
              Cifras sorprendentes sobre cómo tu cuerpo procesa lo que comes.
            </p>

            <div className={styles.datosGrid}>
              {DATOS_METABOLISMO.map((d, i) => (
                <div key={i} className={styles.datoCard}>
                  <div className={styles.datoHeader}>
                    <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
                    <div>
                      <span className={styles.datoTitulo}>{d.titulo}</span>
                      {d.cifra && <span className={styles.datoCifra}>{d.cifra}</span>}
                    </div>
                  </div>
                  <p className={styles.datoContenido}>{d.contenido}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className={styles.insight}>
          <p>
            La digestión no es solo mecánica: es una <strong>cadena bioquímica precisa</strong> donde
            cada enzima, cada pH y cada segmento del tubo digestivo cumple una función específica.
            Los carbohidratos se convierten en glucosa en horas, las proteínas en aminoácidos y las
            grasas toman una ruta especial por la linfa antes de llegar a la sangre.
          </p>
        </div>

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Relacionado →{' '}
          <a href="/visualizador-viaje-comida/">El Viaje de tu Comida (anatómico)</a> ·{' '}
          <a href="/visualizador-huella-alimentos/">Huella de los Alimentos</a>
        </div>

        <EducationalSection
          title="Bioquímica de la nutrición"
          subtitle="Conceptos clave para Bachillerato y Selectividad"
          defaultOpen={false}
        >
          <h3>Catabolismo vs anabolismo</h3>
          <p>
            El metabolismo tiene dos caras: el catabolismo (romper moléculas complejas para obtener
            energía, como la glucólisis) y el anabolismo (usar energía para construir moléculas
            complejas, como la síntesis de proteínas musculares). Ambos procesos ocurren
            simultáneamente en el cuerpo. Cuando comes más calorías de las que gastas, el anabolismo
            predomina (almacenamiento). Cuando gastas más, predomina el catabolismo (quema de reservas).
          </p>

          <h3>ATP: la moneda energética universal</h3>
          <p>
            El adenosín trifosfato (ATP) es la molécula que todas las células usan como fuente de
            energía inmediata. La glucólisis produce 2 ATP por glucosa. El ciclo de Krebs y la cadena
            respiratoria en la mitocondria producen ~34 ATP adicionales. En total, una molécula de
            glucosa rinde ~36 ATP. Las grasas producen aún más ATP por molécula (hasta 129 ATP por
            ácido palmítico), lo que explica por qué son la reserva energética preferida del cuerpo.
          </p>

          <h3>Aminoácidos esenciales vs no esenciales</h3>
          <p>
            De los 20 aminoácidos que forman las proteínas humanas, 9 son esenciales (el cuerpo no
            puede fabricarlos): leucina, isoleucina, valina, lisina, metionina, fenilalanina,
            treonina, triptófano e histidina. Deben obtenerse de la dieta. Las proteínas animales
            contienen los 9 (completas), mientras que la mayoría de las vegetales carecen de alguno
            (incompletas). Combinando legumbres + cereales se obtienen todos.
          </p>

          <h3>El papel de la insulina</h3>
          <p>
            Cuando la glucosa en sangre sube tras comer, el páncreas libera insulina. Esta hormona
            es la &quot;llave&quot; que permite a las células captar glucosa. Sin insulina (diabetes tipo 1)
            o con resistencia a ella (diabetes tipo 2), la glucosa se acumula en sangre causando
            daño en vasos sanguíneos, nervios y órganos. Los alimentos con bajo índice glucémico
            provocan una subida de insulina más gradual y sostenida.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota académica:</strong> los datos de calorías, proporciones y procesos
            bioquímicos son valores de referencia generales para una persona adulta sana. Las
            necesidades nutricionales varían según edad, sexo, actividad física y estado de salud.
            Esta información es de carácter educativo y no sustituye el consejo de un profesional
            de la nutrición.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-digestion-nutrientes')} />
        <ShareCard appName="visualizador-digestion-nutrientes" />
        <Footer appName="visualizador-digestion-nutrientes" />
    </div>
  );
}
