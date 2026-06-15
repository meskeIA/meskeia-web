'use client';
// @disclaimer: exempt
import { useState } from 'react';
import styles from './MineralesGemas.module.css';
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

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'mohs' | 'gemas' | 'formacion' | 'usos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'mohs', titulo: 'Escala de Mohs', icono: '💎', subtitulo: 'Los 10 minerales de referencia' },
  { id: 'gemas', titulo: 'Gemas Preciosas', icono: '✨', subtitulo: 'Diamante, rubí, zafiro, esmeralda' },
  { id: 'formacion', titulo: 'Formación', icono: '🌋', subtitulo: 'Cómo se crean bajo tierra' },
  { id: 'usos', titulo: 'Usos y Datos', icono: '⚙️', subtitulo: 'Industrial vs joyería' },
];

// ─────────────────────────────────────────────
// Datos: Minerales de Mohs
// ─────────────────────────────────────────────

interface MineralMohs {
  dureza: number;
  nombre: string;
  color: string;
  brillo: string;
  sistemaCristalino: string;
  usoConocido: string;
  colorHex: string;
  descripcion: string;
}

const MINERALES_MOHS: MineralMohs[] = [
  { dureza: 1, nombre: 'Talco', color: 'Blanco, verde pálido', brillo: 'Perlado, graso', sistemaCristalino: 'Monoclínico', usoConocido: 'Polvos de talco, cosmética', colorHex: '#A8D8A8', descripcion: 'Mineral más blando. Se raya con la uña fácilmente. Tacto jabonoso. Componente principal del talco cosmético.' },
  { dureza: 2, nombre: 'Yeso', color: 'Blanco, incoloro', brillo: 'Vítreo, sedoso', sistemaCristalino: 'Monoclínico', usoConocido: 'Escayola, construcción (pladur)', colorHex: '#C9C9C9', descripcion: 'Se raya con la uña. Forma cristales transparentes (selenita). Material base de la construcción moderna (placas de yeso).' },
  { dureza: 3, nombre: 'Calcita', color: 'Incoloro, blanco, variados', brillo: 'Vítreo', sistemaCristalino: 'Trigonal', usoConocido: 'Cemento, cal, neutralizar acidez', colorHex: '#F5E6CA', descripcion: 'Burbujea con ácido (vinagre). Doble refracción: al poner un texto debajo, se ve doble. Principal componente de la caliza.' },
  { dureza: 4, nombre: 'Fluorita', color: 'Violeta, verde, azul, amarillo', brillo: 'Vítreo', sistemaCristalino: 'Cúbico', usoConocido: 'Óptica, metalurgia (fundente)', colorHex: '#9B59B6', descripcion: 'Mineral más colorido del mundo. Fluorescente bajo luz UV (de ahí el término "fluorescencia"). Cristales cúbicos perfectos.' },
  { dureza: 5, nombre: 'Apatito', color: 'Verde, azul, amarillo', brillo: 'Vítreo a subadamantino', sistemaCristalino: 'Hexagonal', usoConocido: 'Fertilizantes (fosfato)', colorHex: '#27AE60', descripcion: 'Componente mineral de huesos y dientes humanos. Fuente principal de fósforo para fertilizantes agrícolas a nivel mundial.' },
  { dureza: 6, nombre: 'Ortoclasa', color: 'Rosa, blanco, crema', brillo: 'Vítreo a perlado', sistemaCristalino: 'Monoclínico', usoConocido: 'Cerámica, porcelana', colorHex: '#E8A87C', descripcion: 'Feldespato potásico. Mineral más abundante en la corteza terrestre (junto con otros feldespatos). Base de la industria cerámica.' },
  { dureza: 7, nombre: 'Cuarzo', color: 'Incoloro, variados', brillo: 'Vítreo', sistemaCristalino: 'Trigonal', usoConocido: 'Relojes, electrónica, vidrio', colorHex: '#ECF0F1', descripcion: 'Segundo mineral más abundante. Efecto piezoeléctrico: vibra a frecuencia exacta con electricidad. Oscilador en todos los relojes de cuarzo.' },
  { dureza: 8, nombre: 'Topacio', color: 'Amarillo, azul, incoloro', brillo: 'Vítreo', sistemaCristalino: 'Ortorrómbico', usoConocido: 'Joyería, gema preciosa', colorHex: '#F1C40F', descripcion: 'Cristales prismáticos grandes. El topacio imperial (naranja-rosado) es el más valioso. Raya el cuarzo pero no el corindón.' },
  { dureza: 9, nombre: 'Corindón', color: 'Rojo (rubí), azul (zafiro), variados', brillo: 'Adamantino a vítreo', sistemaCristalino: 'Trigonal', usoConocido: 'Rubíes, zafiros, abrasivos', colorHex: '#E74C3C', descripcion: 'Óxido de aluminio. Las impurezas le dan color: cromo = rojo (rubí), hierro/titanio = azul (zafiro). Segundo mineral más duro.' },
  { dureza: 10, nombre: 'Diamante', color: 'Incoloro, amarillo, azul, rosa', brillo: 'Adamantino', sistemaCristalino: 'Cúbico', usoConocido: 'Joyería, cortadores industriales', colorHex: '#85C1E9', descripcion: 'Carbono puro cristalizado. Material más duro conocido. Se forma a 150-200 km de profundidad. Solo otro diamante puede rayarlo.' },
];

interface ComparacionPractica {
  nombre: string;
  dureza: number;
  emoji: string;
}

const COMPARACIONES: ComparacionPractica[] = [
  { nombre: 'Uña', dureza: 2.5, emoji: '💅' },
  { nombre: 'Moneda de cobre', dureza: 3.5, emoji: '🪙' },
  { nombre: 'Vidrio', dureza: 5.5, emoji: '🪟' },
  { nombre: 'Acero (cuchillo)', dureza: 6.5, emoji: '🔪' },
];

// ─────────────────────────────────────────────
// Datos: Gemas preciosas
// ─────────────────────────────────────────────

interface Gema {
  nombre: string;
  icono: string;
  dureza: string;
  mineral: string;
  colorGema: string;
  colorHex: string;
  impureza: string;
  breve: string;
  detalle: string;
  cardinal: boolean;
}

const GEMAS: Gema[] = [
  { nombre: 'Diamante', icono: '💎', dureza: '10', mineral: 'Carbono puro', colorGema: 'Incoloro ideal', colorHex: '#B8E6F0', impureza: 'Nitrógeno (amarillo), boro (azul)', breve: 'El más duro y brillante. Carbono puro cristalizado a presiones extremas.', detalle: 'Su brillo excepcional viene del alto índice de refracción (2,42) y la dispersión de la luz ("fuego"). Los diamantes de color son más raros y valiosos que los incoloros.', cardinal: true },
  { nombre: 'Rubí', icono: '🔴', dureza: '9', mineral: 'Corindón (Al₂O₃)', colorGema: 'Rojo intenso', colorHex: '#E74C3C', impureza: 'Cromo (Cr)', breve: 'Corindón rojo. El cromo le da su color sangre característico.', detalle: 'El color "sangre de paloma" (rojo intenso con matiz azulado) es el más cotizado. Rubíes de calidad pueden superar en precio al diamante. Birmania produce los mejores ejemplares.', cardinal: true },
  { nombre: 'Zafiro', icono: '🔵', dureza: '9', mineral: 'Corindón (Al₂O₃)', colorGema: 'Azul (y otros)', colorHex: '#2E86AB', impureza: 'Hierro (Fe) + Titanio (Ti)', breve: 'Corindón azul. El mismo mineral que el rubí, con diferente impureza.', detalle: 'Existe en todos los colores excepto rojo (que sería rubí). El zafiro padparadscha (rosa-naranja) es extremadamente raro. Los zafiros estrella muestran asterismo (estrella de 6 puntas).', cardinal: true },
  { nombre: 'Esmeralda', icono: '💚', dureza: '7,5-8', mineral: 'Berilo (Be₃Al₂Si₆O₁₈)', colorGema: 'Verde intenso', colorHex: '#27AE60', impureza: 'Cromo (Cr) y/o Vanadio (V)', breve: 'Berilo verde. Las inclusiones ("jardín") son parte de su carácter.', detalle: 'A diferencia de otras gemas, las inclusiones son aceptadas e incluso valoradas ("jardín de la esmeralda"). Colombia produce el 70% mundial. Cleopatra era famosa coleccionista.', cardinal: true },
  { nombre: 'Amatista', icono: '🟣', dureza: '7', mineral: 'Cuarzo (SiO₂)', colorGema: 'Violeta', colorHex: '#9B59B6', impureza: 'Hierro (Fe³⁺) + radiación', breve: 'Cuarzo violeta. Antes tan valiosa como el diamante hasta hallarse en Brasil.', detalle: 'Su nombre viene del griego "amethystos" (no embriagado): los griegos creían que protegía contra la borrachera. Grandes depósitos en Brasil la hicieron accesible en el siglo XIX.', cardinal: false },
  { nombre: 'Ópalo', icono: '🌈', dureza: '5,5-6,5', mineral: 'Sílice hidratada (SiO₂·nH₂O)', colorGema: 'Juego de colores', colorHex: '#F39C12', impureza: 'Esferas de sílice (difracción)', breve: 'Sílice hidratada con juego de colores por difracción de la luz.', detalle: 'No es cristalino, sino amorfo. El "juego de colores" se debe a esferas de sílice que difractan la luz. Australia produce el 95% mundial. El ópalo negro es el más valioso.', cardinal: false },
  { nombre: 'Turquesa', icono: '🩵', dureza: '5-6', mineral: 'Fosfato de cobre y aluminio', colorGema: 'Azul-verde', colorHex: '#48A9A6', impureza: 'Cobre (azul) + Hierro (verde)', breve: 'Fosfato opaco azul-verde. Una de las primeras gemas usadas en joyería.', detalle: 'Usada en joyería desde hace 5.000 años (Antiguo Egipto, Persia). El nombre viene del francés "pierre turquoise" (piedra turca) por llegar a Europa via Turquía. Las vetas oscuras (matriz) son parte de su estética.', cardinal: false },
];

// ─────────────────────────────────────────────
// Datos: Formación
// ─────────────────────────────────────────────

interface TipoFormacion {
  id: string;
  nombre: string;
  icono: string;
  proceso: string;
  descripcion: string;
  ejemplos: string[];
}

const TIPOS_FORMACION: TipoFormacion[] = [
  { id: 'ignea', nombre: 'Ígnea', icono: '🌋', proceso: 'Del magma', descripcion: 'Se forman cuando el magma se enfría y cristaliza, ya sea en profundidad (plutónicas) o en superficie (volcánicas). La velocidad de enfriamiento determina el tamaño de los cristales.', ejemplos: ['Diamante', 'Olivino (peridoto)', 'Granate', 'Circón', 'Topacio'] },
  { id: 'sedimentaria', nombre: 'Sedimentaria', icono: '🏖️', proceso: 'Por precipitación', descripcion: 'Se forman por precipitación química en cuerpos de agua, evaporación o acumulación biológica. Proceso lento que puede tardar millones de años en capas sucesivas.', ejemplos: ['Halita (sal)', 'Yeso', 'Ópalo', 'Turquesa', 'Malaquita'] },
  { id: 'metamorfica', nombre: 'Metamórfica', icono: '⛰️', proceso: 'Presión + temperatura', descripcion: 'Se forman cuando minerales existentes se transforman por calor y presión extremos sin fundirse. Reorganización atómica que crea nuevas estructuras cristalinas más densas y ordenadas.', ejemplos: ['Rubí', 'Zafiro', 'Esmeralda', 'Jade', 'Granate', 'Lapislázuli'] },
];

interface PasoDiamante {
  titulo: string;
  descripcion: string;
}

const FORMACION_DIAMANTE: PasoDiamante[] = [
  { titulo: 'Profundidad extrema (150-200 km)', descripcion: 'El carbono se somete a temperaturas superiores a 1.000 °C y presiones de más de 50.000 atmósferas en el manto terrestre.' },
  { titulo: 'Cristalización (millones de años)', descripcion: 'Los átomos de carbono se organizan en estructura cúbica perfecta, el enlace más fuerte de la naturaleza. Proceso que dura entre 1.000 y 3.000 millones de años.' },
  { titulo: 'Ascenso por kimberlita', descripcion: 'Erupciones volcánicas ultradeep crean "chimeneas kimberlíticas" que arrastran los diamantes a la superficie a velocidades de 20-30 km/h.' },
  { titulo: 'Llegada a la superficie', descripcion: 'Los diamantes se encuentran en las chimeneas kimberlíticas o en depósitos aluviales donde los ríos los han transportado tras la erosión de la roca madre.' },
];

// ─────────────────────────────────────────────
// Datos: Usos y datos
// ─────────────────────────────────────────────

interface DatoCurioso {
  icono: string;
  titulo: string;
  descripcion: string;
}

const DATOS_INDUSTRIALES: DatoCurioso[] = [
  { icono: '💎', titulo: 'Diamante industrial', descripcion: 'El 80% de los diamantes extraídos son de grado industrial: cortadores, brocas de perforación, abrasivos de precisión y discos de corte para hormigón.' },
  { icono: '⏱️', titulo: 'Cuarzo en electrónica', descripcion: 'El efecto piezoeléctrico del cuarzo lo hace vibrar a 32.768 Hz exactos. Cada reloj, smartphone y ordenador tiene un oscilador de cuarzo para medir el tiempo.' },
  { icono: '✈️', titulo: 'Corindón sintético', descripcion: 'Las ventanas de aviones militares y LEDs de alta potencia usan zafiro sintético (corindón). Dureza 9 = resistencia a rayones extrema con transparencia óptica.' },
  { icono: '🔴', titulo: 'Primer láser (1960)', descripcion: 'Theodore Maiman construyó el primer láser funcional usando un rubí sintético como medio activo. La fluorescencia del cromo en el corindón amplifica la luz coherente.' },
  { icono: '🏭', titulo: 'Cuarzo industrial', descripcion: 'Arena de cuarzo = materia prima del vidrio, fibra óptica, chips de silicio (tras purificación), hormigón y cerámica. El mineral más versátil industrialmente.' },
  { icono: '💊', titulo: 'Talco farmacéutico', descripcion: 'Además de cosmética, el talco se usa como excipiente en pastillas, como lubricante industrial y como carga en papel, plásticos y pinturas.' },
];

interface MineralSmartphone {
  mineral: string;
  uso: string;
}

const MINERALES_SMARTPHONE: MineralSmartphone[] = [
  { mineral: 'Litio', uso: 'Batería recargable' },
  { mineral: 'Cobalto', uso: 'Cátodo de la batería' },
  { mineral: 'Tantalio', uso: 'Condensadores electrónicos' },
  { mineral: 'Oro', uso: 'Contactos y conectores' },
  { mineral: 'Cobre', uso: 'Circuitos y cableado' },
  { mineral: 'Cuarzo (silicio)', uso: 'Chip procesador' },
];

interface ColorImpureza {
  elemento: string;
  color: string;
  colorHex: string;
  ejemplo: string;
}

const COLORES_IMPUREZAS: ColorImpureza[] = [
  { elemento: 'Cromo (Cr)', color: 'Rojo', colorHex: '#E74C3C', ejemplo: 'Rubí, esmeralda' },
  { elemento: 'Hierro (Fe²⁺)', color: 'Verde', colorHex: '#27AE60', ejemplo: 'Peridoto' },
  { elemento: 'Hierro (Fe³⁺)', color: 'Amarillo/Naranja', colorHex: '#F39C12', ejemplo: 'Citrino' },
  { elemento: 'Fe + Ti', color: 'Azul', colorHex: '#2E86AB', ejemplo: 'Zafiro' },
  { elemento: 'Manganeso (Mn)', color: 'Rosa', colorHex: '#E91E63', ejemplo: 'Morganita' },
  { elemento: 'Nitrógeno (N)', color: 'Amarillo', colorHex: '#F1C40F', ejemplo: 'Diamante amarillo' },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorMineralesGemas() {
  const [seccion, setSeccion] = useState<Seccion>('mohs');
  const [mineralSeleccionado, setMineralSeleccionado] = useState<number | null>(null);
  const [gemaSeleccionada, setGemaSeleccionada] = useState<number | null>(null);
  const [formacionSeleccionada, setFormacionSeleccionada] = useState<string | null>('ignea');
  const [sliderDureza, setSliderDureza] = useState(5.5);

  const seccionActual = SECCIONES.find(s => s.id === seccion)!;

  // Determinar qué raya a qué según slider
  const mineralesQueRaya = MINERALES_MOHS.filter(m => m.dureza < sliderDureza);
  const mineralesQueNoRaya = MINERALES_MOHS.filter(m => m.dureza >= sliderDureza);

  // ─── Renderizado de secciones ───

  function renderMohs() {
    const seleccionado = mineralSeleccionado !== null ? MINERALES_MOHS[mineralSeleccionado] : null;

    return (
      <div className={styles.seccionContent}>
        <div className={styles.contexto}>
          <span aria-hidden="true">📏</span> Friedrich Mohs creó esta escala en 1812: un mineral raya a todos los de número inferior
        </div>

        {/* Barra visual degradado 1-10 */}
        <div className={styles.mohsBarraContainer}>
          <div className={styles.mohsBarraTitulo}>Escala de dureza 1-10</div>
          <div className={styles.mohsBarraVisual} role="group" aria-label="Escala de Mohs visual">
            {MINERALES_MOHS.map((m, i) => (
              <button
                key={m.dureza}
                className={styles.mohsBarraSegmento}
                style={{ backgroundColor: m.colorHex }}
                onClick={() => setMineralSeleccionado(mineralSeleccionado === i ? null : i)}
                aria-label={`${m.nombre}, dureza ${m.dureza}`}
                aria-pressed={mineralSeleccionado === i}
              >
                {m.dureza}
              </button>
            ))}
          </div>
          <div className={styles.mohsReferencias}>
            {COMPARACIONES.map(c => (
              <span key={c.nombre} className={styles.mohsRefItem}>
                <span className={styles.mohsRefMark} aria-hidden="true" />
                <span aria-hidden="true">{c.emoji}</span> {c.nombre} ({formatNumber(c.dureza, 1)})
              </span>
            ))}
          </div>
        </div>

        {/* Grid de 10 minerales (5x2) */}
        <div className={styles.mineralesGrid} role="group" aria-label="Minerales de la escala de Mohs">
          {MINERALES_MOHS.map((m, i) => (
            <button
              key={m.dureza}
              className={`${styles.mineralCard} ${mineralSeleccionado === i ? styles.mineralCardActivo : ''}`}
              onClick={() => setMineralSeleccionado(mineralSeleccionado === i ? null : i)}
              aria-expanded={mineralSeleccionado === i}
            >
              <span className={styles.mineralDureza} style={{ backgroundColor: m.colorHex }}>
                {m.dureza}
              </span>
              <span className={styles.mineralNombre}>{m.nombre}</span>
            </button>
          ))}
        </div>

        {/* Detalle del mineral seleccionado */}
        {seleccionado && (
          <div className={styles.mineralDetalle} role="region" aria-label={`Detalle de ${seleccionado.nombre}`}>
            <div className={styles.mineralDetalleHeader}>
              <span className={styles.mineralDetalleNombre}>{seleccionado.nombre}</span>
              <span className={styles.mineralDetalleDureza} style={{ backgroundColor: seleccionado.colorHex }}>
                Dureza {seleccionado.dureza}
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1rem' }}>
              {seleccionado.descripcion}
            </p>
            <div className={styles.mineralDetalleGrid}>
              <div className={styles.mineralDetalleProp}>
                <span className={styles.mineralDetallePropLabel}>Color: </span>{seleccionado.color}
              </div>
              <div className={styles.mineralDetalleProp}>
                <span className={styles.mineralDetallePropLabel}>Brillo: </span>{seleccionado.brillo}
              </div>
              <div className={styles.mineralDetalleProp}>
                <span className={styles.mineralDetallePropLabel}>Sistema cristalino: </span>{seleccionado.sistemaCristalino}
              </div>
              <div className={styles.mineralDetalleProp}>
                <span className={styles.mineralDetallePropLabel}>Uso más conocido: </span>{seleccionado.usoConocido}
              </div>
            </div>
          </div>
        )}

        {/* Slider interactivo */}
        <div className={styles.sliderContainer}>
          <div className={styles.sliderTitulo}>
            <span aria-hidden="true">🔬</span> Comparador de dureza interactivo
          </div>
          <div className={styles.sliderSubtitulo}>Mueve el slider para ver qué raya a qué</div>
          <input
            type="range"
            min="0.5"
            max="10.5"
            step="0.5"
            value={sliderDureza}
            onChange={(e) => setSliderDureza(parseFloat(e.target.value))}
            className={styles.sliderInput}
            aria-label="Seleccionar dureza para comparar"
          />
          <div className={styles.sliderValor}>Dureza {formatNumber(sliderDureza, 1)}</div>
          <div className={styles.sliderResultado}>
            Un material con dureza {formatNumber(sliderDureza, 1)} puede rayar {mineralesQueRaya.length} de los 10 minerales de Mohs
          </div>
          <div className={styles.sliderListas}>
            <div>
              <div className={`${styles.sliderListaTitulo} ${styles.sliderListaRaya}`}>
                ✅ Raya ({mineralesQueRaya.length})
              </div>
              {mineralesQueRaya.map(m => (
                <div key={m.dureza} className={styles.sliderListaItem}>
                  {m.nombre} ({m.dureza})
                </div>
              ))}
              {mineralesQueRaya.length === 0 && (
                <div className={styles.sliderListaItem}>Ninguno</div>
              )}
            </div>
            <div>
              <div className={`${styles.sliderListaTitulo} ${styles.sliderListaNoRaya}`}>
                ❌ No raya ({mineralesQueNoRaya.length})
              </div>
              {mineralesQueNoRaya.map(m => (
                <div key={m.dureza} className={styles.sliderListaItem}>
                  {m.nombre} ({m.dureza})
                </div>
              ))}
              {mineralesQueNoRaya.length === 0 && (
                <div className={styles.sliderListaItem}>Ninguno</div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.insight}>
          <p>
            <strong>¿Por qué no es lineal?</strong> La diferencia real de dureza entre 9 (corindón) y 10 (diamante) es mucho mayor que entre 1 y 9 juntos. La escala de Mohs es ordinal, no proporcional: indica orden, no magnitud exacta.
          </p>
        </div>
      </div>
    );
  }

  function renderGemas() {
    const seleccionada = gemaSeleccionada !== null ? GEMAS[gemaSeleccionada] : null;

    return (
      <div className={styles.seccionContent}>
        <div className={styles.contexto}>
          <span aria-hidden="true">👑</span> Las 4 gemas &quot;cardinales&quot; (diamante, rubí, zafiro, esmeralda) se consideran las más valiosas desde la antigüedad
        </div>

        {/* Grid de gemas */}
        <div className={styles.gemasGrid} role="group" aria-label="Gemas preciosas">
          {GEMAS.map((g, i) => (
            <button
              key={g.nombre}
              className={`${styles.gemaCard} ${gemaSeleccionada === i ? styles.gemaCardActiva : ''}`}
              style={{ borderColor: gemaSeleccionada === i ? g.colorHex : undefined }}
              onClick={() => setGemaSeleccionada(gemaSeleccionada === i ? null : i)}
              aria-expanded={gemaSeleccionada === i}
            >
              <div className={styles.gemaCardHeader}>
                <span className={styles.gemaIcono} aria-hidden="true">{g.icono}</span>
                <span className={styles.gemaCardNombre}>{g.nombre}</span>
                <span className={styles.gemaCardDureza}>{g.dureza}</span>
                {g.cardinal && <span style={{ fontSize: '0.65rem', color: '#D97706', fontWeight: 700 }}>CARDINAL</span>}
              </div>
              <div className={styles.gemaCardBreve}>{g.breve}</div>
              {gemaSeleccionada === i && seleccionada && (
                <div className={styles.gemaDetalle}>
                  <div className={styles.gemaDetalleText}>
                    <span className={styles.gemaDetalleLabel}>Mineral: </span>{g.mineral}
                  </div>
                  <div className={styles.gemaDetalleText}>
                    <span className={styles.gemaDetalleLabel}>Color: </span>{g.colorGema}
                  </div>
                  <div className={styles.gemaDetalleText}>
                    <span className={styles.gemaDetalleLabel}>Impureza: </span>{g.impureza}
                  </div>
                  <div className={styles.gemaDetalleText}>{g.detalle}</div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Corindón → rubí o zafiro */}
        <div className={styles.corindoncardContainer}>
          <div className={styles.corindoncardTitulo}>
            <span aria-hidden="true">🔬</span> Un mineral, dos gemas
          </div>
          <div className={styles.corindoncardDesc}>
            El <strong>corindón</strong> (Al₂O₃) puro es incoloro. Basta un <strong>1-2% de cromo</strong> para obtener un rubí rojo intenso, o <strong>hierro + titanio</strong> para un zafiro azul. El mismo mineral cristalino produce gemas completamente diferentes solo por las impurezas atrapadas durante la formación.
          </div>
        </div>

        {/* Las 4C del diamante */}
        <div className={styles.cuatroCContainer}>
          <div className={styles.cuatroCTitulo}>
            <span aria-hidden="true">💎</span> Las 4C del diamante (factores de valor)
          </div>
          <div className={styles.cuatroCGrid}>
            <div className={styles.cuatroCItem}>
              <span className={styles.cuatroCLetra}>C</span>
              <span className={styles.cuatroCNombre}>Cut (Talla)</span>
              <span className={styles.cuatroCDesc}>Cómo se corta: determina el brillo y el fuego. Un mal corte arruina un buen diamante.</span>
            </div>
            <div className={styles.cuatroCItem}>
              <span className={styles.cuatroCLetra}>C</span>
              <span className={styles.cuatroCNombre}>Color</span>
              <span className={styles.cuatroCDesc}>De D (incoloro perfecto) a Z (amarillento). Cuanto menos color, más valor.</span>
            </div>
            <div className={styles.cuatroCItem}>
              <span className={styles.cuatroCLetra}>C</span>
              <span className={styles.cuatroCNombre}>Clarity (Claridad)</span>
              <span className={styles.cuatroCDesc}>Inclusiones internas. FL (perfecto) a I3 (inclusiones visibles a simple vista).</span>
            </div>
            <div className={styles.cuatroCItem}>
              <span className={styles.cuatroCLetra}>C</span>
              <span className={styles.cuatroCNombre}>Carat (Quilates)</span>
              <span className={styles.cuatroCDesc}>Peso: 1 quilate = 0,2 gramos. El precio crece exponencialmente con los quilates.</span>
            </div>
          </div>
        </div>

        <div className={styles.insight}>
          <p>
            <strong>Dato:</strong> Un rubí de 5 quilates de calidad &quot;sangre de paloma&quot; puede valer más que un diamante del mismo peso. La rareza del color perfecto es lo que determina el precio, no solo la dureza.
          </p>
        </div>
      </div>
    );
  }

  function renderFormacion() {
    const tipoActivo = TIPOS_FORMACION.find(t => t.id === formacionSeleccionada);

    return (
      <div className={styles.seccionContent}>
        <div className={styles.contexto}>
          <span aria-hidden="true">🌍</span> Las gemas se forman en 3 procesos geológicos diferentes, cada uno a distintas profundidades y condiciones
        </div>

        {/* Selector de tipo de formación */}
        <div className={styles.formacionGrid} role="group" aria-label="Tipos de formación">
          {TIPOS_FORMACION.map(t => (
            <button
              key={t.id}
              className={`${styles.formacionCard} ${formacionSeleccionada === t.id ? styles.formacionCardActiva : ''}`}
              onClick={() => setFormacionSeleccionada(formacionSeleccionada === t.id ? null : t.id)}
              aria-expanded={formacionSeleccionada === t.id}
            >
              <span className={styles.formacionIcono} aria-hidden="true">{t.icono}</span>
              <span className={styles.formacionNombre}>{t.nombre}</span>
              <span className={styles.formacionBreve}>{t.proceso}</span>
            </button>
          ))}
        </div>

        {/* Detalle del tipo seleccionado */}
        {tipoActivo && (
          <div className={styles.formacionDetalle} role="region" aria-label={`Formación ${tipoActivo.nombre}`}>
            <div className={styles.formacionDetalleTitulo}>
              {tipoActivo.icono} Formación {tipoActivo.nombre}
            </div>
            <div className={styles.formacionDetalleDesc}>{tipoActivo.descripcion}</div>
            <div className={styles.formacionEjemplos}>
              {tipoActivo.ejemplos.map(ej => (
                <span key={ej} className={styles.formacionEjemplo}>{ej}</span>
              ))}
            </div>
          </div>
        )}

        {/* Timeline del diamante */}
        <div className={styles.diamanteCard}>
          <div className={styles.diamanteCardTitulo}>
            <span aria-hidden="true">💎</span> Cómo se forma un diamante
          </div>
          <div className={styles.diamanteTimeline}>
            {FORMACION_DIAMANTE.map((paso, i) => (
              <div key={i} className={styles.diamanteStep}>
                <span className={styles.diamanteStepNum}>{i + 1}</span>
                <div className={styles.diamanteStepContent}>
                  <div className={styles.diamanteStepTitulo}>{paso.titulo}</div>
                  <div className={styles.diamanteStepDesc}>{paso.descripcion}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.timelineDestacado}>
          <span className={styles.timelineValor}>1.000-3.000 M años</span>
          <span className={styles.timelineTexto}>
            El diamante que lleva alguien en un anillo tardó más tiempo en formarse que la vida compleja en la Tierra
          </span>
        </div>

        <div className={styles.insight}>
          <p>
            <strong>El rubí:</strong> Se forma cuando el corindón (óxido de aluminio) se recristaliza bajo presión y temperatura metamórfica, atrapando átomos de cromo que le dan el color rojo. Por eso los mejores rubíes provienen de mármoles metamórficos de Myanmar (Birmania).
          </p>
        </div>
      </div>
    );
  }

  function renderUsos() {
    return (
      <div className={styles.seccionContent}>
        <div className={styles.datoDestacado}>
          <span className={styles.datoDestacadoValor}>80%</span>
          <span className={styles.datoDestacadoTexto}>
            de los diamantes extraídos se destinan a uso industrial, no a joyería
          </span>
        </div>

        {/* Grid de usos industriales */}
        <div className={styles.usosGrid}>
          {DATOS_INDUSTRIALES.map(d => (
            <div key={d.titulo} className={styles.usoCard}>
              <span className={styles.usoIcono} aria-hidden="true">{d.icono}</span>
              <p className={styles.usoTitulo}>{d.titulo}</p>
              <p className={styles.usoDesc}>{d.descripcion}</p>
            </div>
          ))}
        </div>

        {/* Minerales en tu smartphone */}
        <div className={styles.smartphoneCard}>
          <div className={styles.smartphoneTitulo}>
            <span aria-hidden="true">📱</span> Minerales en tu smartphone
          </div>
          <div className={styles.smartphoneGrid}>
            {MINERALES_SMARTPHONE.map(m => (
              <div key={m.mineral} className={styles.smartphoneItem}>
                <span className={styles.smartphoneMineral}>{m.mineral}</span>
                <span className={styles.smartphoneUso}>{m.uso}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Color de las gemas = impurezas */}
        <div className={styles.colorImpurezas}>
          <div className={styles.colorImpurezasTitulo}>
            <span aria-hidden="true">🎨</span> El color de las gemas viene de impurezas
          </div>
          <div className={styles.colorImpurezasGrid}>
            {COLORES_IMPUREZAS.map(c => (
              <div key={c.elemento} className={styles.colorImpurezaItem}>
                <span className={styles.colorMuestra} style={{ backgroundColor: c.colorHex }} aria-hidden="true" />
                <span className={styles.colorImpurezaTexto}>
                  <span className={styles.colorImpurezaElemento}>{c.elemento}</span> → {c.color} ({c.ejemplo})
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.datoDestacado}>
          <span className={styles.datoDestacadoValor}>{formatNumber(3106)} ct</span>
          <span className={styles.datoDestacadoTexto}>
            El diamante Cullinan (1905, Sudáfrica): el más grande jamás encontrado. Se dividió en 9 gemas principales, incluyendo la Estrella de África en la corona británica.
          </span>
        </div>

        <div className={styles.insight}>
          <p>
            <strong>Dato:</strong> Un smartphone medio contiene más de 30 minerales diferentes de todo el planeta. La pantalla usa silicio (cuarzo purificado), la batería usa litio y cobalto, y los contactos usan oro por su conductividad y resistencia a la corrosión.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Minerales y Gemas</h1>
        <p className={styles.subtitle}>
          Escala de Mohs, piedras preciosas, formación y usos del mundo mineral
        </p>
      </header>

      <LegalNotice />

      {/* Navegación por secciones */}
      <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
        {SECCIONES.map(s => (
          <button
            key={s.id}
            className={`${styles.navBtn} ${seccion === s.id ? styles.navActivo : ''}`}
            onClick={() => setSeccion(s.id)}
            aria-pressed={seccion === s.id}
          >
            <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
            <span className={styles.navTexto}>{s.titulo}</span>
          </button>
        ))}
      </nav>

      {/* Cabecera de sección */}
      <div className={styles.seccionHeader}>
        <h2 className={styles.seccionTitulo}>{seccionActual.titulo}</h2>
        <p className={styles.seccionSubtitulo}>{seccionActual.subtitulo}</p>
      </div>

      {/* Contenido de sección */}
      {seccion === 'mohs' && renderMohs()}
      {seccion === 'gemas' && renderGemas()}
      {seccion === 'formacion' && renderFormacion()}
      {seccion === 'usos' && renderUsos()}

      {/* Bloque educativo */}
      <EducationalSection title="Sobre minerales y gemas" subtitle="Mineralogía, gemología y escala de Mohs">
        <p>
          Los <strong>minerales</strong> son sustancias inorgánicas naturales con composición química definida y estructura cristalina ordenada. Existen más de 5.000 minerales conocidos, pero solo unos 30 son comunes en la corteza terrestre.
        </p>
        <p>
          Una <strong>gema</strong> es un mineral (o material orgánico como el ámbar o la perla) que por su belleza, dureza y rareza se emplea en joyería. Solo una pequeña fracción de los minerales conocidos alcanza la categoría de gema.
        </p>
        <p>
          La <strong>escala de Mohs</strong>, creada por Friedrich Mohs en 1812, clasifica la dureza relativa de los minerales del 1 (talco, el más blando) al 10 (diamante, el más duro). Es una escala ordinal: indica orden de dureza pero no proporciones. La diferencia real entre 9 y 10 es mucho mayor que entre 1 y 2.
        </p>
        <p>
          Los minerales se forman por tres procesos geológicos principales: <strong>ígneo</strong> (cristalización del magma), <strong>sedimentario</strong> (precipitación y acumulación) y <strong>metamórfico</strong> (transformación por presión y temperatura). Cada proceso produce minerales con características distintivas.
        </p>
        <p>
          Este visualizador utiliza datos de referencia de mineralogía general. Las propiedades descritas son valores típicos; los minerales reales pueden variar según su origen geográfico, condiciones de formación e impurezas presentes.
        </p>
        <div className={styles.warningBox}>
          <strong>Nota educativa:</strong> La información presentada tiene fines divulgativos. Para identificación profesional de minerales y gemas, consulta un gemólogo certificado o un laboratorio mineralógico acreditado. Los valores de mercado de las gemas varían enormemente según calidad, origen y certificación.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-minerales-gemas')} />
      <ShareCard appName="visualizador-minerales-gemas" />
      <Footer appName="visualizador-minerales-gemas" />
    </div>
  );
}
