'use client';

import { useState } from 'react';
import styles from './DiabetesMecanismo.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type EstadoGlucosa = 'alta' | 'baja';
type TipoActivo = 'tipo1' | 'tipo2' | 'gestacional';
type MecanismoComplicacion = {
  nombre: string;
  subtitulo: string;
  descripcion: string;
  color: string;
};

// ─────────────────────────────────────────────
// Datos: Complicaciones moleculares
// ─────────────────────────────────────────────

const MECANISMOS_COMPLICACIONES: MecanismoComplicacion[] = [
  {
    nombre: 'Glicosilación no enzimática (AGEs)',
    subtitulo: 'Productos finales de glicosilación avanzada',
    descripcion: 'La glucosa reacciona espontáneamente con grupos amino de proteínas formando bases de Schiff y luego productos de Amadori. La reorganización ulterior genera AGEs (Advanced Glycation End-products). Estos modifican covalentemente el colágeno y otras proteínas estructurales, alterando sus propiedades biomecánicas y generando entrecruzamientos anómalos que rigidizan las matrices extracelulares.',
    color: '#E67E22',
  },
  {
    nombre: 'Estrés oxidativo mitocondrial',
    subtitulo: 'Sobreproducción de especies reactivas de oxígeno (ROS)',
    descripcion: 'El exceso de glucosa amplifica el flujo a través de la cadena respiratoria mitocondrial. La hiperpolarización de la membrana mitocondrial interna provoca la donación prematura de electrones al O₂, generando anión superóxido (O₂·⁻). Este activa la poliadenilato ribosa polimerasa (PARP), inhibe la gliceraldehído-3-fosfato deshidrogenasa (GAPDH) y daña el ADN mitocondrial.',
    color: '#E74C3C',
  },
  {
    nombre: 'Vía del poliol',
    subtitulo: 'Acumulación intracelular de sorbitol',
    descripcion: 'La aldosa reductasa convierte glucosa en sorbitol consumiendo NADPH. El sorbitol se oxida lentamente a fructosa por la sorbitol deshidrogenasa, consumiendo NAD⁺. El resultado es acumulación de sorbitol (efecto osmótico), depleción de NADPH (que limita la síntesis de glutatión reducido) y aumento del cociente NADH/NAD⁺ (pseudohipoxia).',
    color: '#9B59B6',
  },
  {
    nombre: 'Activación de proteína quinasa C (PKC)',
    subtitulo: 'Disfunción de la señalización endotelial',
    descripcion: 'La glucosa elevada aumenta la síntesis de diacilglicerol (DAG) de novo. El DAG activa isoformas de PKC (especialmente β y δ), que fosforilan sustratos endoteliales clave: reducen la producción de óxido nítrico (eNOS), aumentan la permeabilidad vascular (VEGF), activan NF-κB (inflamación) y aumentan la producción de endotelina-1 (vasoconstricción).',
    color: '#2E86AB',
  },
];

// ─────────────────────────────────────────────
// Componente: Páncreas SVG (ciclo normal)
// ─────────────────────────────────────────────

function BloquePancreas() {
  const [estado, setEstado] = useState<EstadoGlucosa>('alta');

  const esAlta = estado === 'alta';

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>El mecanismo normal — páncreas, insulina y glucagón</h2>
      <p className={styles.sectionDesc}>
        El páncreas endocrino regula la glucemia a través de dos tipos celulares en los islotes de Langerhans:
        las células β productoras de insulina y las células α productoras de glucagón, con efectos antagónicos y coordinados.
      </p>

      <div className={styles.toggleRow}>
        <button
          className={`${styles.toggleBtn} ${esAlta ? styles.toggleBtnActivo : ''}`}
          onClick={() => setEstado('alta')}
          aria-pressed={esAlta}
        >
          Glucosa elevada (tras comer)
        </button>
        <button
          className={`${styles.toggleBtn} ${!esAlta ? styles.toggleBtnActivo : ''}`}
          onClick={() => setEstado('baja')}
          aria-pressed={!esAlta}
        >
          Glucosa baja (ayuno)
        </button>
      </div>

      <div className={styles.pancreasLayout}>
        {/* SVG esquemático del páncreas */}
        <div className={styles.pancreassvgWrapper}>
          <svg viewBox="0 0 320 180" className={styles.pancreasSvg} role="img" aria-label="Esquema del páncreas con células beta y alfa">
            {/* Cuerpo del páncreas */}
            <ellipse cx="160" cy="90" rx="130" ry="62" fill="#FFF3E0" stroke="#E0C8A0" strokeWidth="2" />
            {/* Textura lobular */}
            <ellipse cx="80" cy="90" rx="50" ry="45" fill="#FFE0B2" stroke="#E0C8A0" strokeWidth="1" opacity="0.6" />
            <ellipse cx="175" cy="80" rx="55" ry="48" fill="#FFE0B2" stroke="#E0C8A0" strokeWidth="1" opacity="0.6" />
            <ellipse cx="265" cy="95" rx="40" ry="38" fill="#FFE0B2" stroke="#E0C8A0" strokeWidth="1" opacity="0.6" />

            {/* Islotes de Langerhans */}
            {/* Islote 1 */}
            <circle cx="95" cy="85" r="22" fill={esAlta ? 'rgba(46,134,171,0.15)' : 'rgba(230,126,34,0.15)'} stroke={esAlta ? '#2E86AB' : '#E67E22'} strokeWidth="1.5" />
            {/* Células β (azul) */}
            <circle cx="88" cy="80" r="7" fill={esAlta ? '#2E86AB' : '#ccc'} />
            <circle cx="102" cy="82" r="6" fill={esAlta ? '#2E86AB' : '#ccc'} />
            <circle cx="93" cy="93" r="6" fill={esAlta ? '#2E86AB' : '#ccc'} />
            {/* Célula α (naranja) */}
            <circle cx="103" cy="72" r="5" fill={!esAlta ? '#E67E22' : '#ccc'} />

            {/* Islote 2 */}
            <circle cx="185" cy="75" r="20" fill={esAlta ? 'rgba(46,134,171,0.15)' : 'rgba(230,126,34,0.15)'} stroke={esAlta ? '#2E86AB' : '#E67E22'} strokeWidth="1.5" />
            <circle cx="178" cy="70" r="6" fill={esAlta ? '#2E86AB' : '#ccc'} />
            <circle cx="192" cy="73" r="7" fill={esAlta ? '#2E86AB' : '#ccc'} />
            <circle cx="183" cy="84" r="5" fill={esAlta ? '#2E86AB' : '#ccc'} />
            <circle cx="194" cy="63" r="5" fill={!esAlta ? '#E67E22' : '#ccc'} />

            {/* Etiquetas */}
            <text x="160" y="168" textAnchor="middle" fontSize="11" fill="#888" fontStyle="italic">Islotes de Langerhans (páncreas endocrino)</text>

            {/* Leyenda células */}
            <circle cx="30" cy="165" r="5" fill="#2E86AB" />
            <text x="38" y="169" fontSize="10" fill="#555">Células β (insulina)</text>
            <circle cx="150" cy="165" r="5" fill="#E67E22" />
            <text x="158" y="169" fontSize="10" fill="#555">Células α (glucagón)</text>
          </svg>
        </div>

        {/* Panel de estado */}
        <div className={styles.estadoPanel}>
          {esAlta ? (
            <>
              <div className={`${styles.estadoBadge} ${styles.estadoBadgeAlta}`}>Glucosa elevada</div>
              <ol className={styles.cascadaList}>
                <li>
                  <span className={styles.cascadaNum}>1</span>
                  <span>La glucosa entra en las células β a través de GLUT2. El metabolismo intracelular eleva el cociente ATP/ADP, cerrando los canales K⁺-ATP → despolarización → entrada de Ca²⁺.</span>
                </li>
                <li>
                  <span className={styles.cascadaNum}>2</span>
                  <span>El Ca²⁺ intracelular desencadena la exocitosis de gránulos de insulina (primero la insulina preformada, luego la de nueva síntesis).</span>
                </li>
                <li>
                  <span className={styles.cascadaNum}>3</span>
                  <span>La insulina en sangre se une a su receptor (RTK) en células musculares y adiposas → fosforilación de IRS-1/2 → activación de PI3K → PKB/Akt → translocación de GLUT4 a la membrana.</span>
                </li>
                <li>
                  <span className={styles.cascadaNum}>4</span>
                  <span>En el hígado: insulina activa la glucógeno sintasa y suprime la gluconeogénesis (inhibiendo PEPCK y G6Pasa). Glucosa → glucógeno almacenado (glucogénesis).</span>
                </li>
                <li>
                  <span className={styles.cascadaNum}>5</span>
                  <span>Las células α son inhibidas por la insulina local (paracrina) y por la propia hipoglucemia relativa → secreción de glucagón suprimida.</span>
                </li>
              </ol>
            </>
          ) : (
            <>
              <div className={`${styles.estadoBadge} ${styles.estadoBadgeBaja}`}>Glucosa baja (ayuno)</div>
              <ol className={styles.cascadaList}>
                <li>
                  <span className={styles.cascadaNum}>1</span>
                  <span>Las células α detectan la caída de glucosa (GLUT1 + sensor de ATP/ADP) y abren canales de Ca²⁺ → exocitosis de glucagón.</span>
                </li>
                <li>
                  <span className={styles.cascadaNum}>2</span>
                  <span>El glucagón en sangre se une a su receptor en hepatocitos (GPCR acoplado a Gαs) → activación de adenilato ciclasa → cAMP → PKA.</span>
                </li>
                <li>
                  <span className={styles.cascadaNum}>3</span>
                  <span>PKA activa la glucógeno fosforilasa → glucogenólisis (glucógeno → glucosa-1-fosfato → glucosa liberada a sangre).</span>
                </li>
                <li>
                  <span className={styles.cascadaNum}>4</span>
                  <span>PKA también activa la transcripción de PEPCK y G6Pasa → gluconeogénesis a partir de alanina, lactato y glicerol.</span>
                </li>
                <li>
                  <span className={styles.cascadaNum}>5</span>
                  <span>Las células β están inhibidas por la propia hipoglucemia → secreción de insulina suprimida → sin señal de captación periférica de glucosa.</span>
                </li>
              </ol>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Componente: Tabs Tipo 1 / Tipo 2 / Gestacional
// ─────────────────────────────────────────────

function BloqueTipos() {
  const [tipoActivo, setTipoActivo] = useState<TipoActivo>('tipo1');

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Mecanismo molecular por tipo</h2>
      <p className={styles.sectionDesc}>
        Cada variante altera la homeostasis glucémica por un mecanismo fisiopatológico distinto. Selecciona un tipo para explorar el proceso molecular.
      </p>

      <div className={styles.tabsRow} role="tablist" aria-label="Tipos de diabetes">
        {(['tipo1', 'tipo2', 'gestacional'] as TipoActivo[]).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tipoActivo === t}
            className={`${styles.tab} ${tipoActivo === t ? styles.tabActivo : ''}`}
            onClick={() => setTipoActivo(t)}
          >
            {t === 'tipo1' ? 'Tipo 1' : t === 'tipo2' ? 'Tipo 2' : 'Gestacional'}
          </button>
        ))}
      </div>

      <div className={styles.tipoPanel} role="tabpanel">
        {tipoActivo === 'tipo1' && (
          <div className={styles.tipoPanelInner}>
            <div className={styles.tipoHeader}>
              <span className={styles.tipoIcono} aria-hidden="true">🔬</span>
              <div>
                <h3 className={styles.tipoTitulo}>Mecanismo autoinmune</h3>
                <p className={styles.tipoSubtitulo}>Destrucción selectiva de las células β por el propio sistema inmune</p>
              </div>
            </div>

            {/* SVG: ataque autoinmune */}
            <div className={styles.svgContainer}>
              <svg viewBox="0 0 340 140" className={styles.tipoSvg} role="img" aria-label="Diagrama del ataque autoinmune sobre células beta">
                {/* Islote de Langerhans */}
                <ellipse cx="170" cy="70" rx="90" ry="55" fill="rgba(46,134,171,0.08)" stroke="#2E86AB" strokeWidth="1.5" strokeDasharray="4 3" />
                <text x="170" y="138" textAnchor="middle" fontSize="10" fill="#888">Islote de Langerhans</text>

                {/* Células β (algunas destruidas) */}
                <circle cx="130" cy="65" r="14" fill="#2E86AB" opacity="0.9" />
                <text x="130" y="69" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">β</text>

                <circle cx="160" cy="50" r="14" fill="#2E86AB" opacity="0.4" />
                <text x="160" y="54" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">β</text>
                {/* Cruz de destrucción */}
                <line x1="152" y1="42" x2="168" y2="58" stroke="#E74C3C" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="168" y1="42" x2="152" y2="58" stroke="#E74C3C" strokeWidth="2.5" strokeLinecap="round" />

                <circle cx="195" cy="65" r="14" fill="#2E86AB" opacity="0.2" />
                <text x="195" y="69" textAnchor="middle" fontSize="10" fill="#888" fontWeight="bold">β</text>
                <line x1="187" y1="57" x2="203" y2="73" stroke="#E74C3C" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="203" y1="57" x2="187" y2="73" stroke="#E74C3C" strokeWidth="2.5" strokeLinecap="round" />

                {/* Célula α (intacta) */}
                <circle cx="165" cy="88" r="11" fill="#E67E22" opacity="0.9" />
                <text x="165" y="92" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">α</text>

                {/* Células T autorreactivas */}
                <circle cx="60" cy="40" r="15" fill="rgba(231,76,60,0.15)" stroke="#E74C3C" strokeWidth="2" />
                <text x="60" y="38" textAnchor="middle" fontSize="9" fill="#C0392B" fontWeight="bold">Célula T</text>
                <text x="60" y="50" textAnchor="middle" fontSize="8" fill="#C0392B">CD8+</text>
                <path d="M 75 42 L 112 58" stroke="#E74C3C" strokeWidth="1.5" strokeDasharray="3 2" markerEnd="url(#arrowRed1)" />

                <circle cx="55" cy="100" r="15" fill="rgba(231,76,60,0.15)" stroke="#E74C3C" strokeWidth="2" />
                <text x="55" y="98" textAnchor="middle" fontSize="9" fill="#C0392B" fontWeight="bold">Célula T</text>
                <text x="55" y="110" textAnchor="middle" fontSize="8" fill="#C0392B">CD4+</text>
                <path d="M 70 96 L 108 78" stroke="#E74C3C" strokeWidth="1.5" strokeDasharray="3 2" />

                {/* Anticuerpos */}
                <circle cx="295" cy="55" r="13" fill="rgba(155,89,182,0.15)" stroke="#9B59B6" strokeWidth="2" />
                <text x="295" y="53" textAnchor="middle" fontSize="8" fill="#7D3C98" fontWeight="bold">Anti-</text>
                <text x="295" y="64" textAnchor="middle" fontSize="8" fill="#7D3C98">islote</text>
                <path d="M 282 57 L 250 62" stroke="#9B59B6" strokeWidth="1.5" strokeDasharray="3 2" />

                <defs>
                  <marker id="arrowRed1" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="#E74C3C" />
                  </marker>
                </defs>
              </svg>
            </div>

            <div className={styles.mecanimoSteps}>
              <div className={styles.mecanismoStep}>
                <span className={styles.mecanismoStepNum} style={{ background: '#2E86AB' }}>1</span>
                <div>
                  <strong>Predisposición genética:</strong> Alelos HLA-DR3 y HLA-DR4 (complejo mayor de histocompatibilidad clase II) presentan péptidos propios de las células β como antígenos. El haplotipo HLA-DQ8 es el de mayor riesgo conocido.
                </div>
              </div>
              <div className={styles.mecanismoStep}>
                <span className={styles.mecanismoStepNum} style={{ background: '#E74C3C' }}>2</span>
                <div>
                  <strong>Desencadenante ambiental (hipótesis):</strong> Infecciones virales, microbiota alterada u otros factores rompen la tolerancia inmunológica central. Los linfocitos T autorreactivos escapan al timo sin ser eliminados.
                </div>
              </div>
              <div className={styles.mecanismoStep}>
                <span className={styles.mecanismoStepNum} style={{ background: '#E74C3C' }}>3</span>
                <div>
                  <strong>Insulitis:</strong> Infiltración del islote por linfocitos T CD8+ citotóxicos y CD4+ helper, macrófagos y células NK. Los CD8+ destruyen directamente las células β mediante perforinas y granzimas.
                </div>
              </div>
              <div className={styles.mecanismoStep}>
                <span className={styles.mecanismoStepNum} style={{ background: '#9B59B6' }}>4</span>
                <div>
                  <strong>Anticuerpos anti-islote:</strong> Linfocitos B producen anticuerpos contra la insulina (IAA), glutamato descarboxilasa (GADA), tirosina fosfatasa IA-2 (IA-2A) y transportador de zinc ZnT8 (ZnT8A).
                </div>
              </div>
              <div className={styles.mecanismoStep}>
                <span className={styles.mecanismoStepNum} style={{ background: '#888' }}>5</span>
                <div>
                  <strong>Resultado:</strong> Destrucción progresiva (durante meses o años) de las células β. Cuando queda menos del 10-20% de la masa celular β, la secreción de insulina es insuficiente para mantener la homeostasis. Las células α permanecen intactas (el ataque es específico de célula β).
                </div>
              </div>
              <div className={styles.mecanismoStep}>
                <span className={styles.mecanismoStepNum} style={{ background: '#E67E22' }}>6</span>
                <div>
                  <strong>Cetoacidosis:</strong> Sin insulina, las células no captan glucosa → el organismo activa la lipólisis → ácidos grasos libres → beta-oxidación mitocondrial hepática → acumulación de acetoacetato, beta-hidroxibutirato y acetona (cuerpos cetónicos) → acidosis metabólica.
                </div>
              </div>
            </div>
            <div className={styles.notaHistorica}>
              El término histórico "diabetes juvenil" es obsoleto: aunque suele aparecer en infancia y adolescencia, puede desarrollarse a cualquier edad (incluidos adultos —LADA, diabetes autoinmune latente del adulto—).
            </div>
          </div>
        )}

        {tipoActivo === 'tipo2' && (
          <div className={styles.tipoPanelInner}>
            <div className={styles.tipoHeader}>
              <span className={styles.tipoIcono} aria-hidden="true">🔩</span>
              <div>
                <h3 className={styles.tipoTitulo}>Resistencia a la insulina y agotamiento de células β</h3>
                <p className={styles.tipoSubtitulo}>Un proceso progresivo en dos fases con mecanismos moleculares interconectados</p>
              </div>
            </div>

            {/* SVG: receptor de insulina resistente */}
            <div className={styles.svgContainer}>
              <svg viewBox="0 0 340 130" className={styles.tipoSvg} role="img" aria-label="Diagrama de la resistencia a la insulina en el receptor celular">
                {/* Membrana celular */}
                <rect x="0" y="60" width="340" height="8" fill="#E8F4F8" stroke="#B0D4E0" strokeWidth="1" />
                <text x="10" y="75" fontSize="9" fill="#888">Membrana celular</text>

                {/* Receptor de insulina — lado izquierdo (normal) */}
                <text x="65" y="20" textAnchor="middle" fontSize="10" fill="#2E86AB" fontWeight="bold">Normal</text>
                {/* Subunidades α extracelulares */}
                <rect x="45" y="30" width="18" height="28" rx="4" fill="#2E86AB" opacity="0.8" />
                <rect x="68" y="30" width="18" height="28" rx="4" fill="#2E86AB" opacity="0.8" />
                {/* Insulina unida */}
                <ellipse cx="65" cy="24" rx="16" ry="8" fill="#48A9A6" opacity="0.9" />
                <text x="65" y="27" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">Insulina</text>
                {/* Subunidades β transmembrana */}
                <rect x="50" y="58" width="12" height="22" rx="2" fill="#1A6E8F" />
                <rect x="68" y="58" width="12" height="22" rx="2" fill="#1A6E8F" />
                {/* GLUT4 que se activa */}
                <rect x="42" y="85" width="42" height="18" rx="6" fill="#27AE60" opacity="0.85" />
                <text x="63" y="98" textAnchor="middle" fontSize="9" fill="white" fontWeight="bold">GLUT4 ✓</text>
                {/* Flecha de glucosa entrando */}
                <path d="M 63 110 L 63 120" stroke="#27AE60" strokeWidth="2" markerEnd="url(#arrowGreen)" />
                <text x="63" y="132" textAnchor="middle" fontSize="9" fill="#27AE60">Glucosa entra</text>

                {/* Separador */}
                <line x1="168" y1="10" x2="168" y2="135" stroke="#ddd" strokeWidth="1" strokeDasharray="4 3" />

                {/* Receptor de insulina — lado derecho (resistente) */}
                <text x="253" y="20" textAnchor="middle" fontSize="10" fill="#E74C3C" fontWeight="bold">Resistente</text>
                <rect x="233" y="30" width="18" height="28" rx="4" fill="#aaa" opacity="0.6" />
                <rect x="256" y="30" width="18" height="28" rx="4" fill="#aaa" opacity="0.6" />
                <ellipse cx="253" cy="24" rx="16" ry="8" fill="#48A9A6" opacity="0.9" />
                <text x="253" y="27" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">Insulina</text>
                <rect x="238" y="58" width="12" height="22" rx="2" fill="#888" />
                <rect x="256" y="58" width="12" height="22" rx="2" fill="#888" />
                {/* IRS-1 bloqueado */}
                <rect x="228" y="85" width="50" height="18" rx="6" fill="#E74C3C" opacity="0.25" stroke="#E74C3C" strokeWidth="1.5" />
                <text x="253" y="98" textAnchor="middle" fontSize="9" fill="#C0392B" fontWeight="bold">GLUT4 ✗</text>
                <text x="253" y="132" textAnchor="middle" fontSize="9" fill="#C0392B">Glucosa no entra</text>

                <defs>
                  <marker id="arrowGreen" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="#27AE60" />
                  </marker>
                </defs>
              </svg>
            </div>

            <div className={styles.mecanimoSteps}>
              <div className={styles.mecanismoStep}>
                <span className={styles.mecanismoStepNum} style={{ background: '#E67E22' }}>1</span>
                <div>
                  <strong>Inflamación crónica de bajo grado:</strong> El tejido adiposo visceral hipertrofiado secreta citocinas proinflamatorias (TNF-α, IL-6, resistina). El TNF-α fosforila el sustrato del receptor de insulina IRS-1 en serina (en lugar de tirosina), bloqueando la señalización downstream de PI3K/Akt.
                </div>
              </div>
              <div className={styles.mecanismoStep}>
                <span className={styles.mecanismoStepNum} style={{ background: '#E67E22' }}>2</span>
                <div>
                  <strong>Lipotoxicidad ectópica:</strong> Los ácidos grasos libres y ceramidas se acumulan en hepatocitos y fibras musculares esqueléticas (hígado graso no alcohólico, músculo lipotóxico). Activan proteína quinasa Cθ (PKCθ), que fosforila IRS-1 en serina → resistencia periférica.
                </div>
              </div>
              <div className={styles.mecanismoStep}>
                <span className={styles.mecanismoStepNum} style={{ background: '#2E86AB' }}>3</span>
                <div>
                  <strong>Hiperinsulinemia compensatoria:</strong> Las células β detectan la resistencia periférica y aumentan la producción de insulina. El páncreas puede mantener la normoglucemia durante años sobreproduciendo insulina.
                </div>
              </div>
              <div className={styles.mecanismoStep}>
                <span className={styles.mecanismoStepNum} style={{ background: '#E74C3C' }}>4</span>
                <div>
                  <strong>Agotamiento de células β:</strong> La hipersecreción crónica genera estrés del retículo endoplasmático en las células β (UPR activado), glucolipotoxicidad y depósito de polipéptido amiloide de los islotes (IAPP, amilina). La masa de células β disminuye progresivamente por apoptosis.
                </div>
              </div>
              <div className={styles.mecanismoStep}>
                <span className={styles.mecanismoStepNum} style={{ background: '#27AE60' }}>5</span>
                <div>
                  <strong>Reversibilidad fisiológica en fases iniciales:</strong> En las primeras fases (resistencia + hiperinsulinemia sin agotamiento β), intervenciones sobre la composición corporal pueden restaurar la sensibilidad a la insulina al reducir la lipotoxicidad ectópica. La pérdida de masa de células β es en gran parte irreversible.
                </div>
              </div>
            </div>
          </div>
        )}

        {tipoActivo === 'gestacional' && (
          <div className={styles.tipoPanelInner}>
            <div className={styles.tipoHeader}>
              <span className={styles.tipoIcono} aria-hidden="true">🧬</span>
              <div>
                <h3 className={styles.tipoTitulo}>Resistencia a la insulina de origen placentario</h3>
                <p className={styles.tipoSubtitulo}>Un mecanismo evolutivo de partición de glucosa hacia el feto</p>
              </div>
            </div>

            {/* SVG: eje placenta-páncreas */}
            <div className={styles.svgContainer}>
              <svg viewBox="0 0 340 120" className={styles.tipoSvg} role="img" aria-label="Eje placentario y resistencia a la insulina gestacional">
                {/* Placenta */}
                <ellipse cx="90" cy="60" rx="70" ry="42" fill="rgba(230,126,34,0.12)" stroke="#E67E22" strokeWidth="2" />
                <text x="90" y="48" textAnchor="middle" fontSize="11" fill="#C0392B" fontWeight="bold">Placenta</text>
                <text x="90" y="62" textAnchor="middle" fontSize="9" fill="#E67E22">Lactógeno placentario</text>
                <text x="90" y="74" textAnchor="middle" fontSize="9" fill="#E67E22">Progesterona</text>
                <text x="90" y="86" textAnchor="middle" fontSize="9" fill="#E67E22">Cortisol placentario</text>

                {/* Flecha hacia tejidos maternos */}
                <path d="M 162 55 L 195 55" stroke="#E67E22" strokeWidth="2" markerEnd="url(#arrowOrange)" />
                <text x="178" y="50" textAnchor="middle" fontSize="8" fill="#E67E22">Hormonas</text>

                {/* Tejidos maternos (resistencia) */}
                <rect x="196" y="30" width="80" height="55" rx="8" fill="rgba(231,76,60,0.08)" stroke="#E74C3C" strokeWidth="1.5" />
                <text x="236" y="50" textAnchor="middle" fontSize="10" fill="#C0392B" fontWeight="bold">Tejidos</text>
                <text x="236" y="63" textAnchor="middle" fontSize="9" fill="#C0392B">maternos</text>
                <text x="236" y="76" textAnchor="middle" fontSize="8" fill="#C0392B">(resistencia ↑)</text>

                {/* Flecha hacia glucosa fetal */}
                <path d="M 236 85 L 236 108" stroke="#48A9A6" strokeWidth="2" markerEnd="url(#arrowTeal)" />
                <text x="236" y="118" textAnchor="middle" fontSize="9" fill="#48A9A6">Glucosa → Feto</text>

                {/* Páncreas materno */}
                <rect x="282" y="30" width="52" height="50" rx="8" fill="rgba(46,134,171,0.1)" stroke="#2E86AB" strokeWidth="1.5" />
                <text x="308" y="50" textAnchor="middle" fontSize="9" fill="#2E86AB" fontWeight="bold">Páncreas</text>
                <text x="308" y="63" textAnchor="middle" fontSize="9" fill="#2E86AB">materno</text>
                <text x="308" y="75" textAnchor="middle" fontSize="8" fill="#2E86AB">compensar ↑</text>

                <defs>
                  <marker id="arrowOrange" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="#E67E22" />
                  </marker>
                  <marker id="arrowTeal" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
                    <path d="M0,0 L6,3 L0,6 Z" fill="#48A9A6" />
                  </marker>
                </defs>
              </svg>
            </div>

            <div className={styles.mecanimoSteps}>
              <div className={styles.mecanismoStep}>
                <span className={styles.mecanismoStepNum} style={{ background: '#E67E22' }}>1</span>
                <div>
                  <strong>Resistencia fisiológica placentaria:</strong> La placenta secreta lactógeno placentario humano (hPL), progesterona, cortisol y TNF-α placentario. Estos antagonizan la señalización de la insulina en los tejidos maternos (fosforilación en serina de IRS-1, igual que en el Tipo 2), generando resistencia periférica intencionada.
                </div>
              </div>
              <div className={styles.mecanismoStep}>
                <span className={styles.mecanismoStepNum} style={{ background: '#48A9A6' }}>2</span>
                <div>
                  <strong>Función evolutiva:</strong> Al disminuir la captación materna de glucosa, el organismo mantiene una glucemia ligeramente elevada que asegura el suministro continuo al feto (el feto capta glucosa por GLUT1/3 sin necesitar insulina materna).
                </div>
              </div>
              <div className={styles.mecanismoStep}>
                <span className={styles.mecanismoStepNum} style={{ background: '#2E86AB' }}>3</span>
                <div>
                  <strong>Compensación pancreática:</strong> El páncreas materno normalmente compensa hipertrofiando las células β (aumento de masa β hasta un 50% durante el embarazo) e hipersecretando insulina. Las incretinas (GLP-1) potencian este proceso.
                </div>
              </div>
              <div className={styles.mecanismoStep}>
                <span className={styles.mecanismoStepNum} style={{ background: '#E74C3C' }}>4</span>
                <div>
                  <strong>Cuando la compensación falla:</strong> Si las células β maternas no pueden producir suficiente insulina para vencer la resistencia placentaria (por agotamiento o masa insuficiente), la glucemia materna se eleva más allá del umbral fisiológico → diabetes gestacional.
                </div>
              </div>
              <div className={styles.mecanismoStep}>
                <span className={styles.mecanismoStepNum} style={{ background: '#27AE60' }}>5</span>
                <div>
                  <strong>Resolución posparto:</strong> Tras la expulsión de la placenta, las hormonas placentarias desaparecen rápidamente (semivida corta). La resistencia a la insulina se revierte en horas-días. La función pancreática se normaliza cuando la causa era solo la resistencia placentaria.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Componente: HbA1c
// ─────────────────────────────────────────────

function BloqueHba1c() {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>La HbA1c — marcador molecular retrospectivo</h2>
      <p className={styles.sectionDesc}>
        La hemoglobina glicosilada (HbA1c) es un marcador bioquímico que refleja la exposición acumulada de la hemoglobina a la glucosa durante la vida del eritrocito. No es un valor puntual: es una integral temporal.
      </p>

      <div className={styles.hba1cLayout}>
        {/* SVG glóbulo rojo */}
        <div className={styles.hba1cSvgWrapper}>
          <svg viewBox="0 0 220 200" className={styles.hba1cSvg} role="img" aria-label="Glóbulo rojo con moléculas de hemoglobina glicosilada">
            {/* Glóbulo rojo (disco bicóncavo) */}
            <ellipse cx="110" cy="100" rx="90" ry="55" fill="#FDECEA" stroke="#E74C3C" strokeWidth="2" />
            <ellipse cx="110" cy="100" rx="60" ry="35" fill="#FAD7D3" stroke="#E74C3C" strokeWidth="1" opacity="0.5" />
            <text x="110" y="185" textAnchor="middle" fontSize="11" fill="#888" fontStyle="italic">Eritrocito (vida media: ~120 días)</text>

            {/* Moléculas de hemoglobina normales */}
            <circle cx="75" cy="88" r="10" fill="#E74C3C" opacity="0.8" />
            <text x="75" y="91" textAnchor="middle" fontSize="8" fill="white">Hb</text>

            <circle cx="105" cy="78" r="10" fill="#E74C3C" opacity="0.8" />
            <text x="105" y="81" textAnchor="middle" fontSize="8" fill="white">Hb</text>

            <circle cx="140" cy="90" r="10" fill="#E74C3C" opacity="0.8" />
            <text x="140" y="93" textAnchor="middle" fontSize="8" fill="white">Hb</text>

            {/* Moléculas HbA1c (glicosiladas) — color dorado */}
            <circle cx="90" cy="112" r="11" fill="#F39C12" opacity="0.9" />
            <text x="90" y="112" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">HbA1c</text>
            {/* Glucosa unida */}
            <circle cx="82" cy="102" r="5" fill="#F1C40F" opacity="0.9" />
            <line x1="85" y1="105" x2="88" y2="108" stroke="#F39C12" strokeWidth="1.5" />

            <circle cx="125" cy="108" r="11" fill="#F39C12" opacity="0.9" />
            <text x="125" y="108" textAnchor="middle" fontSize="7" fill="white" fontWeight="bold">HbA1c</text>
            <circle cx="136" cy="100" r="5" fill="#F1C40F" opacity="0.9" />
            <line x1="133" y1="102" x2="130" y2="105" stroke="#F39C12" strokeWidth="1.5" />

            {/* Leyenda */}
            <circle cx="20" cy="160" r="6" fill="#E74C3C" />
            <text x="30" y="164" fontSize="9" fill="#555">Hb sin glicosilar</text>
            <circle cx="20" cy="175" r="6" fill="#F39C12" />
            <text x="30" y="179" fontSize="9" fill="#555">HbA1c (glicosilada)</text>
          </svg>
        </div>

        {/* Explicación molecular */}
        <div className={styles.hba1cExplicacion}>
          <div className={styles.hba1cStep}>
            <span className={styles.hba1cStepTitulo}>Reacción de glicosilación no enzimática</span>
            <p>La glucosa reacciona espontáneamente con el grupo amino terminal de la valina de la cadena β de la hemoglobina (Val-1β) a través de una reacción de Maillard. Se forma primero una base de Schiff lábil (aldiamina), que se reorganiza irreversiblemente al producto de Amadori (fructosamina-Hb). Este es el HbA1c medido clínicamente.</p>
          </div>
          <div className={styles.hba1cStep}>
            <span className={styles.hba1cStepTitulo}>Proporcionalidad y memoria glucémica</span>
            <p>La velocidad de formación de la base de Schiff es directamente proporcional a la concentración de glucosa. Como el eritrocito no puede sintetizar ni degradar la hemoglobina una vez formada, el HbA1c acumula la "memoria" glucémica durante la vida del eritrocito (aproximadamente 120 días). El valor refleja ponderadamente los últimos 2-3 meses, con mayor peso de las semanas más recientes.</p>
          </div>
          <div className={styles.hba1cStep}>
            <span className={styles.hba1cStepTitulo}>Limitaciones del marcador</span>
            <p>Cualquier condición que altere la vida media del eritrocito (hemólisis, anemia por deficiencia de hierro, hemoglobinopatías, esplenomegalia) puede falsear el resultado. En anemias hemolíticas, los eritrocitos más jóvenes dominan y el HbA1c aparece artificialmente bajo. En deficiencia de hierro, los eritrocitos envejecen más → HbA1c artificialmente elevado.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Componente: Complicaciones moleculares
// ─────────────────────────────────────────────

function BloqueComplicaciones() {
  const [mecanismoActivo, setMecanismoActivo] = useState<number | null>(null);

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>Glucotoxicidad crónica — mecanismos moleculares</h2>
      <p className={styles.sectionDesc}>
        La exposición sostenida a glucosa elevada activa cuatro rutas bioquímicas que alteran la función celular. Son mecanismos moleculares interconectados, no clínicos.
      </p>

      <div className={styles.complicacionesGrid}>
        {MECANISMOS_COMPLICACIONES.map((mec, i) => (
          <button
            key={i}
            className={`${styles.complicacionCard} ${mecanismoActivo === i ? styles.complicacionCardActiva : ''}`}
            style={mecanismoActivo === i ? { borderColor: mec.color, background: `${mec.color}10` } : {}}
            onClick={() => setMecanismoActivo(mecanismoActivo === i ? null : i)}
            aria-expanded={mecanismoActivo === i}
          >
            <div className={styles.complicacionIndicador} style={{ background: mec.color }} />
            <h3 className={styles.complicacionNombre} style={mecanismoActivo === i ? { color: mec.color } : {}}>
              {mec.nombre}
            </h3>
            <p className={styles.complicacionSubtitulo}>{mec.subtitulo}</p>
            {mecanismoActivo === i && (
              <p className={styles.complicacionDescripcion}>{mec.descripcion}</p>
            )}
          </button>
        ))}
      </div>

      <div className={styles.insightBox}>
        <strong>Convergencia de rutas:</strong> Los cuatro mecanismos convergen en una vía común: la sobreproducción de superóxido mitocondrial. Según la hipótesis de Brownlee (2001), el superóxido inhibe GAPDH → derivando glucosa hacia las vías de poliol, hexosaminas, PKC y formación de AGEs simultáneamente. Esto explica por qué los mecanismos se potencian mutuamente.
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorDiabetesMecanismo() {
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge} aria-label="Categoría: Biología Molecular">Biología Molecular</span>
          <h1 className={styles.heroTitle}>Diabetes: Mecanismo Biológico</h1>
          <p className={styles.heroSubtitle}>Insulina, glucagón y las rutas moleculares de la regulación glucémica</p>
          <p className={styles.heroDesc}>
            Cómo el páncreas detecta y regula la glucosa, qué ocurre molecularmente en cada tipo de diabetes
            y por qué la glucosa elevada crónica altera la función celular a nivel bioquímico.
          </p>
        </div>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="medical"
        severity="high"
        collapsible={false}
        title="Aviso médico importante"
      >
        Este visualizador explica el mecanismo biológico de la diabetes a nivel molecular. No describe síntomas, no ofrece valores diagnósticos y no sustituye ningún consejo médico. Consulta siempre con tu médico.
      </DisclaimerCard>

      <BloquePancreas />
      <BloqueTipos />
      <BloqueHba1c />
      <BloqueComplicaciones />

      <EducationalSection
        title="Biología molecular de la regulación glucémica"
        subtitle="El páncreas como sensor y regulador del combustible celular"
      >
        <div className={styles.eduGrid}>
          <div className={styles.eduCard}>
            <h3 className={styles.eduCardTitulo}>Las células y la glucosa: dependencia evolutiva</h3>
            <p>
              El cerebro humano depende casi exclusivamente de glucosa como combustible en condiciones normales: consume aproximadamente el 20% de la glucosa total del organismo pese a representar solo el 2% de la masa corporal. Esta dependencia es evolutivamente antigua: las neuronas no almacenan glucógeno significativo y su metabolismo está altamente especializado hacia la oxidación de glucosa (ciclo de Krebs + fosforilación oxidativa). Solo en estados de ayuno prolongado (más de 48-72 h) el cerebro adapta su metabolismo para usar cuerpos cetónicos de forma significativa.
            </p>
            <p>
              Esta dependencia explica por qué la regulación de la glucemia es tan precisa y redundante: múltiples sistemas hormonales (insulina, glucagón, cortisol, adrenalina, hormona del crecimiento) convergen en mantener la glucosa en un rango estrecho que garantice el suministro neuronal sin saturar los tejidos periféricos.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h3 className={styles.eduCardTitulo}>El eje intestino-páncreas: las incretinas</h3>
            <p>
              Tras la ingesta, el intestino delgado secreta dos hormonas peptídicas clave: el péptido similar al glucagón tipo 1 (GLP-1, producido por células L del íleon y colon) y el péptido insulinotrópico dependiente de glucosa (GIP, producido por células K del duodeno y yeyuno). Ambas son incretinas: potencian la secreción de insulina de forma dependiente de glucosa (solo actúan si la glucemia está elevada).
            </p>
            <p>
              El GLP-1 además suprime el glucagón, retrasa el vaciamiento gástrico (reduciendo la velocidad de absorción de glucosa) y actúa sobre el hipotálamo reduciendo el apetito. La enzima DPP-4 degrada rápidamente las incretinas (semivida: 1-2 min), lo que explica por qué los fármacos inhibidores de DPP-4 y los análogos de GLP-1 son una diana terapéutica relevante en bioquímica clínica.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h3 className={styles.eduCardTitulo}>Complejidad evolutiva de la regulación glucémica</h3>
            <p>
              La regulación de la glucosa es uno de los sistemas homeostáticos más complejos del organismo porque integra señales nutricionales, hormonales, neurales y del microbioma. El eje entero-insular (intestino → páncreas) es solo uno de los niveles de regulación. El sistema nervioso autónomo modula directamente la secreción de insulina y glucagón (inervación del páncreas endocrino). El hígado actúa como amortiguador central (buffer glucémico) gracias a su capacidad de captación y liberación de glucosa independientemente de la insulina (GLUT2 de alta capacidad).
            </p>
            <p>
              Esta redundancia explica por qué la desregulación suele ser progresiva (hay múltiples sistemas de compensación) y también por qué, cuando ocurre, afecta a múltiples tejidos simultáneamente a través de vías moleculares interconectadas.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          Este visualizador explica mecanismos biológicos con fines exclusivamente educativos. No incluye valores diagnósticos, síntomas ni orientación terapéutica de ningún tipo.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-diabetes-mecanismo')} />
      <ShareCard appName="visualizador-diabetes-mecanismo" />
      <Footer appName="visualizador-diabetes-mecanismo" />
    </div>
  );
}
