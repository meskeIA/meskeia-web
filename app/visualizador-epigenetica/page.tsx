'use client';

import { useState } from 'react';
import styles from './Epigenetica.module.css';
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

type EstadoNucleosoma = 'activo' | 'silenciado';
type ModificacionHistona = 'acetilacion' | 'metilH3K4' | 'metilH3K27' | 'fosforilacion';
type AlleloImprinting = 'paterno' | 'materno';

interface DetalleModificacion {
  nombre: string;
  enzima: string;
  efecto: string;
  tipoEfecto: 'activa' | 'silencia' | 'senal';
  contexto: string;
}

interface FactorEpigenetico {
  icono: string;
  nombre: string;
  impacto: 'alto' | 'medio' | 'bajo';
  impactoLabel: string;
  mecanismo: string;
  aviso: string;
}

// ─────────────────────────────────────────────
// Datos: Modificaciones de histonas
// ─────────────────────────────────────────────

const MODIFICACIONES: Record<ModificacionHistona, DetalleModificacion> = {
  acetilacion: {
    nombre: 'Acetilación de histonas',
    enzima: 'HAT (Histona Acetiltransferasa) / HDAC (deacetilasa)',
    efecto: 'Activa la transcripción',
    tipoEfecto: 'activa',
    contexto:
      'La acetilación añade un grupo acetilo (-COCH₃) a los residuos de lisina de las colas de histona. Neutraliza la carga positiva de la lisina, reduciendo la afinidad de la histona por el ADN cargado negativamente. Resultado: cromatina más abierta (eucromatina) accesible para la ARN polimerasa y factores de transcripción. Las HDACs revierten este proceso, restaurando la compactación.',
  },
  metilH3K4: {
    nombre: 'Metilación H3K4 (H3K4me3)',
    enzima: 'MLL (Mixed Lineage Leukemia) / SET1 — HMT',
    efecto: 'Activa la transcripción',
    tipoEfecto: 'activa',
    contexto:
      'La trimetilación de la lisina 4 de la histona H3 (H3K4me3) es una marca característica de los promotores de genes activos. Los cromolectores (bromodominios, cromodominios) reconocen esta marca y reclutan el complejo de iniciación de la transcripción. A diferencia de la metilación del ADN, esta marca es de las más dinámicas y reversibles del epigenoma activo.',
  },
  metilH3K27: {
    nombre: 'Metilación H3K27 (H3K27me3)',
    enzima: 'PRC2 (Polycomb Repressive Complex 2) — EZH2',
    efecto: 'Silencia la transcripción',
    tipoEfecto: 'silencia',
    contexto:
      'La trimetilación de H3K27 es la firma molecular del silenciamiento por el complejo Polycomb. EZH2 (subunidad catalítica de PRC2) escribe esta marca, que es reconocida por PRC1, que compacta la cromatina. Este sistema es fundamental en el desarrollo embrionario (mantiene silenciados genes Hox inapropiados) y en el mantenimiento de la identidad celular. Mutaciones en EZH2 se asocian a varios tipos de cáncer.',
  },
  fosforilacion: {
    nombre: 'Fosforilación de histonas',
    enzima: 'Quinasas (Aurora B, ATM, H3K, DNA-PK)',
    efecto: 'Señalización y reparación',
    tipoEfecto: 'senal',
    contexto:
      'La fosforilación de residuos de serina, treonina o tirosina en las histonas actúa principalmente como señal de respuesta a daño en el ADN (γH2AX), condensación de cromosomas durante la mitosis (H3S10p) o apoptosis. No regula directamente la transcripción como la acetilación o metilación, sino que recluta maquinaria de reparación o señaliza el estado del ciclo celular.',
  },
};

// ─────────────────────────────────────────────
// Datos: Factores epigenéticos
// ─────────────────────────────────────────────

const FACTORES: FactorEpigenetico[] = [
  {
    icono: '🥦',
    nombre: 'Dieta',
    impacto: 'alto',
    impactoLabel: 'Evidencia moderada-alta',
    mecanismo:
      'La disponibilidad de grupos metilo en la dieta (folato, metionina, vitamina B12) afecta directamente los niveles de SAM (S-adenosilmetionina), donador de metilos para las DNMTs. Dietas ricas en polifenoles (curcumina, resveratrol) modulan la actividad de HDACs e histona metiltransferasas en modelos experimentales.',
    aviso:
      'La mayoría de estudios en humanos son observacionales. El efecto de suplementos específicos sobre el epigenoma humano sigue siendo incierto.',
  },
  {
    icono: '🏃',
    nombre: 'Ejercicio físico',
    impacto: 'medio',
    impactoLabel: 'Evidencia moderada',
    mecanismo:
      'El ejercicio aeróbico modifica patrones de metilación en genes relacionados con el metabolismo (PGC-1α, GLUT4) y la inflamación. Se ha observado hipometilación en regiones promotoras de genes mitocondriogénicos tras entrenamiento. Las modificaciones de histonas en músculo esquelético son agudas (reversibles en horas) o crónicas (tras semanas de entrenamiento).',
    aviso:
      'Los cambios epigenéticos inducidos por el ejercicio son en gran parte reversibles. No existe evidencia de que el ejercicio "reprograme" permanentemente el epigenoma adulto.',
  },
  {
    icono: '😰',
    nombre: 'Estrés crónico',
    impacto: 'alto',
    impactoLabel: 'Evidencia moderada-alta',
    mecanismo:
      'El cortisol activa receptores de glucocorticoides (GR) que actúan como factores de transcripción y remodeladores de cromatina. El estrés temprano en la vida altera la metilación del gen del receptor de glucocorticoides (NR3C1) en hipocampo, asociándose con vulnerabilidad al estrés posterior. Estudios en roedores muestran efectos transgeneracionales, aunque la extrapolación directa a humanos requiere cautela.',
    aviso:
      'La hipótesis de herencia epigenética del estrés en humanos tiene evidencia preliminar pero limitada. Muchos estudios son en modelos animales.',
  },
  {
    icono: '⏳',
    nombre: 'Envejecimiento (reloj de Horvath)',
    impacto: 'alto',
    impactoLabel: 'Evidencia alta',
    mecanismo:
      'El reloj epigenético de Horvath (2013) mide la edad biológica usando los niveles de metilación de 353 sitios CpG específicos, altamente conservados entre tejidos. La edad biológica puede divergir de la cronológica: factores como el ejercicio, la dieta, el tabaquismo y enfermedades aceleran o ralentizan el reloj. La metilación de estos sitios cambia de forma reproducible con la edad en todos los tejidos estudiados.',
    aviso:
      'El reloj de Horvath predice riesgo, no determina destino. La edad biológica más elevada se asocia estadísticamente con mayor mortalidad, pero no es un determinismo individual.',
  },
  {
    icono: '☁️',
    nombre: 'Toxinas y contaminantes',
    impacto: 'alto',
    impactoLabel: 'Evidencia moderada',
    mecanismo:
      'El tabaquismo hipometila el ADN en regiones reguladoras de genes relacionados con la inflamación y el cáncer pulmonar (CDKN2A, MLH1). El bisfenol A (BPA) altera la metilación de genes de desarrollo en modelos animales. Los metales pesados (arsénico, cadmio) son inhibidores de DNMTs. Muchos efectos se documentan en exposiciones laborales o ambientales altas.',
    aviso:
      'La mayoría de estudios son en exposiciones elevadas o en modelos animales. La relevancia de exposiciones cotidianas bajas en humanos es un área de investigación activa.',
  },
];

// ─────────────────────────────────────────────
// Sección 1: Nucleosoma con marcas
// ─────────────────────────────────────────────

const SeccionNucleosoma = () => {
  const [estado, setEstado] = useState<EstadoNucleosoma>('activo');

  const esActivo = estado === 'activo';

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>1. Nucleosoma: Cromatina Abierta vs Compacta</h2>
      <p className={styles.sectionDesc}>
        Toggle para ver cómo la acetilación (gen activo) y la metilación del ADN (gen silenciado) cambian el estado de la cromatina.
      </p>

      <div className={styles.toggleRow}>
        <button
          className={`${styles.toggleBtn} ${esActivo ? styles.toggleBtnActive : ''}`}
          onClick={() => setEstado('activo')}
          aria-pressed={esActivo}
        >
          ✅ Gen activo (acetilación)
        </button>
        <button
          className={`${styles.toggleBtn} ${!esActivo ? styles.toggleBtnActive : ''}`}
          onClick={() => setEstado('silenciado')}
          aria-pressed={!esActivo}
        >
          🔴 Gen silenciado (metilación)
        </button>
      </div>

      <div className={styles.nucleosomaWrapper}>
        {/* SVG del nucleosoma */}
        <div className={styles.svgCard}>
          <svg
            viewBox="0 0 400 280"
            width="100%"
            role="img"
            aria-label={`Nucleosoma en estado ${esActivo ? 'activo con cromatina abierta' : 'silenciado con cromatina compacta'}`}
          >
            {/* Fondo */}
            <rect width="400" height="280" fill={esActivo ? '#f0fafa' : '#fff5f5'} rx="12" />

            {/* ADN — más o menos compacto según estado */}
            {esActivo ? (
              /* Cromatina abierta: doble hélice extendida */
              <>
                <path
                  d="M 30,60 Q 80,30 130,60 Q 180,90 230,60 Q 280,30 330,60 Q 370,80 390,70"
                  fill="none" stroke="#2E86AB" strokeWidth="3" strokeLinecap="round"
                />
                <path
                  d="M 30,80 Q 80,110 130,80 Q 180,50 230,80 Q 280,110 330,80 Q 370,60 390,70"
                  fill="none" stroke="#48A9A6" strokeWidth="3" strokeLinecap="round"
                />
                {/* Puentes de unión */}
                {[55, 105, 155, 205, 255, 305, 355].map((x, i) => (
                  <line key={i} x1={x} y1={i % 2 === 0 ? 47 : 60} x2={x} y2={i % 2 === 0 ? 93 : 80} stroke="#7FB3D3" strokeWidth="1.5" />
                ))}
              </>
            ) : (
              /* Cromatina compacta: hélice apretada */
              <>
                <path
                  d="M 30,70 Q 55,45 80,70 Q 105,95 130,70 Q 155,45 180,70 Q 205,95 230,70 Q 255,45 280,70 Q 305,95 330,70 Q 355,45 380,70"
                  fill="none" stroke="#e74c3c" strokeWidth="3" strokeLinecap="round"
                />
                <path
                  d="M 30,90 Q 55,115 80,90 Q 105,65 130,90 Q 155,115 180,90 Q 205,65 230,90 Q 255,115 280,90 Q 305,65 330,90 Q 355,115 380,90"
                  fill="none" stroke="#c0392b" strokeWidth="3" strokeLinecap="round"
                />
                {/* Puentes apretados */}
                {[55, 80, 105, 130, 155, 180, 205, 230, 255, 280, 305, 330, 355].map((x, i) => (
                  <line key={i} x1={x} y1={i % 2 === 0 ? 55 : 70} x2={x} y2={i % 2 === 0 ? 105 : 90} stroke="#e74c3c" strokeWidth="1.2" opacity="0.6" />
                ))}
              </>
            )}

            {/* Histonas (núcleo octamérico) */}
            <ellipse cx="200" cy="175" rx="55" ry="35" fill={esActivo ? '#2E86AB' : '#c0392b'} opacity="0.85" />
            <text x="200" y="170" textAnchor="middle" fontSize="12" fontWeight="700" fill="white">Histonas</text>
            <text x="200" y="186" textAnchor="middle" fontSize="10" fill="white" opacity="0.9">(H2A, H2B, H3, H4)</text>

            {/* Colas de histona */}
            {esActivo ? (
              /* Colas con grupos acetilo */
              <>
                <line x1="155" y1="155" x2="110" y2="130" stroke="#2E86AB" strokeWidth="2" />
                <circle cx="100" cy="125" r="10" fill="#f1c40f" stroke="#e67e22" strokeWidth="1.5" />
                <text x="100" y="129" textAnchor="middle" fontSize="8" fontWeight="700" fill="#7d5a00">Ac</text>
                <line x1="245" y1="155" x2="290" y2="130" stroke="#2E86AB" strokeWidth="2" />
                <circle cx="300" cy="125" r="10" fill="#f1c40f" stroke="#e67e22" strokeWidth="1.5" />
                <text x="300" y="129" textAnchor="middle" fontSize="8" fontWeight="700" fill="#7d5a00">Ac</text>
                <line x1="200" y1="210" x2="200" y2="240" stroke="#2E86AB" strokeWidth="2" />
                <circle cx="200" cy="250" r="10" fill="#f1c40f" stroke="#e67e22" strokeWidth="1.5" />
                <text x="200" y="254" textAnchor="middle" fontSize="8" fontWeight="700" fill="#7d5a00">Ac</text>
              </>
            ) : (
              /* Colas con grupos metilo en ADN */
              <>
                <line x1="155" y1="155" x2="110" y2="130" stroke="#c0392b" strokeWidth="2" />
                <circle cx="100" cy="125" r="10" fill="#9b59b6" stroke="#8e44ad" strokeWidth="1.5" />
                <text x="100" y="129" textAnchor="middle" fontSize="7" fontWeight="700" fill="white">CH₃</text>
                <line x1="245" y1="155" x2="290" y2="130" stroke="#c0392b" strokeWidth="2" />
                <circle cx="300" cy="125" r="10" fill="#9b59b6" stroke="#8e44ad" strokeWidth="1.5" />
                <text x="300" y="129" textAnchor="middle" fontSize="7" fontWeight="700" fill="white">CH₃</text>
                <line x1="200" y1="210" x2="200" y2="240" stroke="#c0392b" strokeWidth="2" />
                <circle cx="200" cy="250" r="10" fill="#9b59b6" stroke="#8e44ad" strokeWidth="1.5" />
                <text x="200" y="254" textAnchor="middle" fontSize="7" fontWeight="700" fill="white">CH₃</text>
              </>
            )}

            {/* ADN enrollado alrededor de histonas */}
            <ellipse cx="200" cy="175" rx="70" ry="50" fill="none"
              stroke={esActivo ? '#48A9A6' : '#e74c3c'} strokeWidth="2.5"
              strokeDasharray={esActivo ? '8 4' : '4 2'} opacity="0.6"
            />

            {/* Etiqueta estado */}
            <rect x="10" y="240" width="380" height="28" rx="6" fill={esActivo ? 'rgba(72,169,166,0.12)' : 'rgba(231,76,60,0.1)'} />
            <text x="200" y="259" textAnchor="middle" fontSize="11" fontWeight="700"
              fill={esActivo ? '#2a7c79' : '#c0392b'}>
              {esActivo ? '🔓 Cromatina abierta — Gen accesible para transcripción' : '🔒 Cromatina compacta — Gen inaccesible (silenciado)'}
            </text>
          </svg>
        </div>

        {/* Panel lateral descriptivo */}
        <div className={styles.estadoPanel}>
          <p className={styles.estadoTitulo}>
            {esActivo ? '✅ Estado activo: Acetilación de histonas' : '🔴 Estado silenciado: Metilación del ADN'}
          </p>
          {esActivo ? (
            <p className={styles.estadoTexto}>
              <strong>Mecanismo:</strong> Las enzimas HAT (histona acetiltransferasas) añaden grupos acetilo (-COCH₃)
              a los residuos de lisina de las colas de histona. Esto neutraliza las cargas positivas de las histonas,
              reduciendo su afinidad por el ADN.<br /><br />
              <strong>Resultado:</strong> La cromatina se abre (eucromatina). Los factores de transcripción y la ARN
              polimerasa II pueden acceder al promotor del gen y comenzar la transcripción.<br /><br />
              <strong>Reversibilidad:</strong> Las HDACs (histona deacetilasas) eliminan los grupos acetilo, restaurando
              la compactación. Este proceso es rápido y reversible.
            </p>
          ) : (
            <p className={styles.estadoTexto}>
              <strong>Mecanismo:</strong> Las DNMTs (ADN metiltransferasas) añaden grupos metilo (-CH₃) a las
              citosinas en dinucleótidos CpG, especialmente en regiones promotoras.<br /><br />
              <strong>Resultado:</strong> La cromatina se compacta (heterocromatina). Las proteínas de unión a ADN
              metilado (MBPs) reclutan complejos represores adicionales, silenciando el gen de forma estable.<br /><br />
              <strong>Reversibilidad:</strong> La desmetilación activa es posible mediante TETs (que oxidan 5-metilcitosina),
              pero suele ser más lenta que la deacetilación.
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// Sección 2: Metilación del ADN
// ─────────────────────────────────────────────

const SeccionMetilacion = () => {
  const [nivel, setNivel] = useState(30);

  const getEstadoGen = (umbralActivo: number): boolean => nivel <= umbralActivo;

  const genesEjemplo = [
    {
      nombre: 'BRCA1',
      umbralActivo: 50,
      descripcionActivo: 'Supresor tumoral activo. Participa en la reparación del ADN por recombinación homóloga. Protege frente a cáncer de mama y ovario.',
      descripcionSilenciado: 'Promotor hipermetilado. El gen BRCA1 queda silenciado en un subconjunto de cánceres esporádicos de mama. La pérdida de función facilita la inestabilidad genómica.',
    },
    {
      nombre: 'NR3C1 (Receptor glucocorticoides)',
      umbralActivo: 45,
      descripcionActivo: 'Promotor activo. El receptor responde correctamente al cortisol, modulando la respuesta al estrés. Niveles adecuados de cortisol regulan la inflamación y la glucemia.',
      descripcionSilenciado: 'Hipermetilación asociada a estrés temprano. Menor expresión del receptor reduce la retroalimentación negativa del eje HPA, manteniendo niveles elevados de glucocorticoides crónicamente.',
    },
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>2. Metilación del ADN en Sitios CpG</h2>
      <p className={styles.sectionDesc}>
        Ajusta el nivel de metilación para ver cómo los grupos •CH₃ en citosinas CpG apagan la expresión génica.
      </p>

      <div className={styles.metilacionWrapper}>
        {/* Slider */}
        <div className={styles.sliderRow}>
          <span className={styles.sliderLabel}>Nivel de metilación:</span>
          <input
            type="range"
            min={0}
            max={100}
            value={nivel}
            onChange={(e) => setNivel(Number(e.target.value))}
            className={styles.slider}
            aria-label="Nivel de metilación del ADN, 0 a 100 por ciento"
          />
          <span className={styles.sliderValue}>{nivel}%</span>
        </div>

        {/* SVG cadena ADN con CpGs */}
        <svg
          viewBox="0 0 600 130"
          width="100%"
          role="img"
          aria-label={`Cadena de ADN con nivel de metilación ${nivel} por ciento`}
        >
          <rect width="600" height="130" fill="#f8fcfe" rx="8" />

          {/* Cadenas de ADN */}
          <path d="M 20,45 Q 320,20 580,45" fill="none" stroke="#2E86AB" strokeWidth="3" />
          <path d="M 20,85 Q 320,110 580,85" fill="none" stroke="#48A9A6" strokeWidth="3" />

          {/* Sitios CpG */}
          {[60, 120, 180, 240, 300, 360, 420, 480, 540].map((x, i) => {
            const metilado = (i / 8) * 100 < nivel;
            return (
              <g key={i}>
                {/* Puente entre cadenas */}
                <line x1={x} y1={48} x2={x} y2={82} stroke={metilado ? '#9b59b6' : '#aaaaaa'} strokeWidth="2" />
                {/* Círculo CpG */}
                <circle cx={x} cy={65} r={metilado ? 10 : 7} fill={metilado ? '#9b59b6' : '#ddd'} />
                {metilado && (
                  <>
                    {/* Grupo metilo arriba */}
                    <circle cx={x} cy={32} r={7} fill="#f39c12" stroke="#e67e22" strokeWidth="1" />
                    <text x={x} y={36} textAnchor="middle" fontSize="7" fontWeight="700" fill="white">CH₃</text>
                    <line x1={x} y1={39} x2={x} y2={55} stroke="#e67e22" strokeWidth="1.5" strokeDasharray="2 1" />
                  </>
                )}
                {/* Etiqueta C */}
                <text x={x} y={69} textAnchor="middle" fontSize="8" fontWeight="700" fill={metilado ? 'white' : '#999'}>C</text>
              </g>
            );
          })}

          {/* Leyenda */}
          <circle cx="30" cy="115" r="6" fill="#9b59b6" />
          <text x="42" y="119" fontSize="10" fill="#555">CpG metilado (5mC)</text>
          <circle cx="170" cy="115" r="6" fill="#ddd" stroke="#aaa" strokeWidth="1" />
          <text x="182" y="119" fontSize="10" fill="#555">CpG sin metilar</text>
          <circle cx="300" cy="115" r="6" fill="#f39c12" />
          <text x="312" y="119" fontSize="10" fill="#555">Grupo •CH₃</text>
        </svg>

        {/* Genes de ejemplo */}
        <div className={styles.genesRow}>
          {genesEjemplo.map((gen) => {
            const activo = getEstadoGen(gen.umbralActivo);
            return (
              <div
                key={gen.nombre}
                className={`${styles.genCard} ${activo ? styles.genCardActivo : styles.genCardSilenciado}`}
              >
                <p className={styles.genNombre}>{gen.nombre}</p>
                <span className={`${styles.genEstado} ${activo ? styles.estadoActivo : styles.estadoSilenciado}`}>
                  {activo ? '🟢 Activo' : '🔴 Silenciado'}
                </span>
                <p className={styles.genDesc}>
                  {activo ? gen.descripcionActivo : gen.descripcionSilenciado}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// Sección 3: Modificaciones de histonas
// ─────────────────────────────────────────────

const SeccionHistonas = () => {
  const [activa, setActiva] = useState<ModificacionHistona>('acetilacion');
  const detalle = MODIFICACIONES[activa];

  // Posiciones de las colas en el SVG del nucleosoma
  const colas: { id: ModificacionHistona; label: string; cx: number; cy: number; color: string }[] = [
    { id: 'acetilacion', label: 'Ac', cx: 95, cy: 95, color: '#f1c40f' },
    { id: 'metilH3K4', label: 'K4', cx: 305, cy: 95, color: '#2E86AB' },
    { id: 'metilH3K27', label: 'K27', cx: 95, cy: 215, color: '#c0392b' },
    { id: 'fosforilacion', label: 'P', cx: 305, cy: 215, color: '#9b59b6' },
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>3. Modificaciones de las Colas de Histona</h2>
      <p className={styles.sectionDesc}>
        Haz clic en cada marca de la cola de histona para ver la enzima responsable, el efecto y el contexto biológico.
      </p>

      <div className={styles.histonasWrapper}>
        {/* SVG nucleosoma interactivo */}
        <div className={styles.histonaSvgCard}>
          <svg
            viewBox="0 0 400 320"
            width="100%"
            role="img"
            aria-label="Diagrama de nucleosoma con colas de histona modificables"
          >
            <rect width="400" height="320" fill="#f8fcfe" rx="12" />

            {/* Octámero de histonas */}
            <ellipse cx="200" cy="160" rx="80" ry="55" fill="#2E86AB" opacity="0.85" />
            <text x="200" y="154" textAnchor="middle" fontSize="13" fontWeight="700" fill="white">Octámero</text>
            <text x="200" y="171" textAnchor="middle" fontSize="10" fill="white" opacity="0.9">H2A·H2B·H3·H4 ×2</text>

            {/* ADN enrollado */}
            <ellipse cx="200" cy="160" rx="105" ry="78" fill="none" stroke="#48A9A6" strokeWidth="2.5" strokeDasharray="10 5" opacity="0.7" />

            {/* Colas de histona — líneas */}
            <line x1="135" y1="130" x2="105" y2="105" stroke="#888" strokeWidth="1.5" />
            <line x1="265" y1="130" x2="295" y2="105" stroke="#888" strokeWidth="1.5" />
            <line x1="135" y1="190" x2="105" y2="215" stroke="#888" strokeWidth="1.5" />
            <line x1="265" y1="190" x2="295" y2="215" stroke="#888" strokeWidth="1.5" />

            {/* Botones de modificación */}
            {colas.map((cola) => (
              <g key={cola.id} onClick={() => setActiva(cola.id)} style={{ cursor: 'pointer' }}>
                <circle
                  cx={cola.cx}
                  cy={cola.cy}
                  r={activa === cola.id ? 22 : 18}
                  fill={cola.color}
                  stroke={activa === cola.id ? '#333' : 'transparent'}
                  strokeWidth="2.5"
                  opacity={activa === cola.id ? 1 : 0.75}
                />
                <text
                  x={cola.cx}
                  y={cola.cy + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="800"
                  fill="white"
                >
                  {cola.label}
                </text>
              </g>
            ))}

            {/* Instrucción */}
            <text x="200" y="305" textAnchor="middle" fontSize="10" fill="#888">
              ← Haz clic en una marca para ver detalles →
            </text>
          </svg>
        </div>

        {/* Panel de detalle */}
        <div className={styles.histonaDetalle}>
          <p className={styles.histonaDetalleTitulo}>{detalle.nombre}</p>
          <p className={styles.histonaDetalleEnzima}>
            <span aria-hidden="true">🔬</span> Enzima: {detalle.enzima}
          </p>
          <span
            className={`${styles.histonaDetalleEfecto} ${
              detalle.tipoEfecto === 'activa'
                ? styles.efectoActiva
                : detalle.tipoEfecto === 'silencia'
                ? styles.efectoSilencia
                : styles.efectoSenal
            }`}
          >
            {detalle.tipoEfecto === 'activa' && '✅ Activa transcripción'}
            {detalle.tipoEfecto === 'silencia' && '🔴 Silencia transcripción'}
            {detalle.tipoEfecto === 'senal' && '⚡ Señalización / Reparación'}
          </span>
          <p className={styles.histonaDetalleContexto}>{detalle.contexto}</p>
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// Sección 4: Imprinting genómico
// ─────────────────────────────────────────────

const SeccionImprinting = () => {
  const [origen, setOrigen] = useState<AlleloImprinting>('paterno');

  const genes = [
    {
      nombre: 'IGF2',
      origen: 'paterno',
      descripcion:
        'Factor de crecimiento insulínico tipo 2. Activo solo en el alelo de origen paterno. Promueve el crecimiento fetal. Si se activa el alelo materno (pérdida de imprinting), puede favorecer tumorigénesis (p.ej. tumor de Wilms).',
      funcion: 'Crecimiento fetal, metabolismo',
    },
    {
      nombre: 'H19',
      origen: 'materno',
      descripcion:
        'ARN no codificante largo (lncRNA) que regula el imprinting de la región 11p15. Activo solo en el alelo de origen materno. Actúa como reservorio de microARNs y como competidor endógeno. Coordina la expresión de IGF2 mediante el aislador CTCF.',
      funcion: 'Regulador del imprinting, lncRNA',
    },
  ];

  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>4. Imprinting Genómico: Genes con Memoria de Origen</h2>
      <p className={styles.sectionDesc}>
        Algunos genes se expresan solo desde el alelo paterno o solo desde el materno. El epigenoma recuerda el origen.
      </p>

      <div className={styles.imprintingWrapper}>
        <p className={styles.notaInfo}>
          <span aria-hidden="true">🧬</span> El imprinting es un fenómeno epigenético en el que el alelo activo depende
          del progenitor de origen. Solo el 1-2% de los genes humanos están imprintados, pero su alteración causa
          síndromes graves (Prader-Willi, Angelman).
        </p>

        <div className={styles.imprintingToggle}>
          <button
            className={`${styles.toggleBtn} ${origen === 'paterno' ? styles.toggleBtnActive : ''}`}
            onClick={() => setOrigen('paterno')}
            aria-pressed={origen === 'paterno'}
          >
            👨 Alelo paterno activo
          </button>
          <button
            className={`${styles.toggleBtn} ${origen === 'materno' ? styles.toggleBtnActive : ''}`}
            onClick={() => setOrigen('materno')}
            aria-pressed={origen === 'materno'}
          >
            👩 Alelo materno activo
          </button>
        </div>

        {/* SVG visual de imprinting */}
        <svg viewBox="0 0 580 100" width="100%" role="img" aria-label="Representación visual de imprinting genómico en IGF2 y H19">
          <rect width="580" height="100" fill="#f8fcfe" rx="8" />

          {/* Alelo paterno */}
          <rect x="20" y="20" width="250" height="60" rx="10" fill={origen === 'paterno' ? 'rgba(46,134,171,0.15)' : 'rgba(200,200,200,0.15)'} stroke={origen === 'paterno' ? '#2E86AB' : '#ccc'} strokeWidth="2" />
          <text x="145" y="38" textAnchor="middle" fontSize="11" fontWeight="700" fill={origen === 'paterno' ? '#2E86AB' : '#aaa'}>👨 Alelo paterno</text>

          {/* Gen IGF2 paterno */}
          <rect x="35" y="50" width="80" height="22" rx="6" fill={origen === 'paterno' ? '#2E86AB' : '#ddd'} opacity="0.9" />
          <text x="75" y="65" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">IGF2 ✓</text>

          {/* Gen H19 paterno (silenciado) */}
          <rect x="145" y="50" width="80" height="22" rx="6" fill="#ddd" opacity="0.6" />
          <text x="185" y="65" textAnchor="middle" fontSize="10" fill="#999">H19 ✗</text>

          {/* Alelo materno */}
          <rect x="310" y="20" width="250" height="60" rx="10" fill={origen === 'materno' ? 'rgba(72,169,166,0.15)' : 'rgba(200,200,200,0.15)'} stroke={origen === 'materno' ? '#48A9A6' : '#ccc'} strokeWidth="2" />
          <text x="435" y="38" textAnchor="middle" fontSize="11" fontWeight="700" fill={origen === 'materno' ? '#48A9A6' : '#aaa'}>👩 Alelo materno</text>

          {/* Gen IGF2 materno (silenciado) */}
          <rect x="325" y="50" width="80" height="22" rx="6" fill="#ddd" opacity="0.6" />
          <text x="365" y="65" textAnchor="middle" fontSize="10" fill="#999">IGF2 ✗</text>

          {/* Gen H19 materno */}
          <rect x="435" y="50" width="80" height="22" rx="6" fill={origen === 'materno' ? '#48A9A6' : '#ddd'} opacity="0.9" />
          <text x="475" y="65" textAnchor="middle" fontSize="10" fontWeight="700" fill="white">H19 ✓</text>
        </svg>

        {/* Detalle genes */}
        <div className={styles.imprintingGenesGrid}>
          {genes.map((gen) => {
            const activo = gen.origen === origen;
            return (
              <div
                key={gen.nombre}
                className={`${styles.imprintingGenCard} ${gen.origen === 'paterno' ? styles.imprintingPaterno : styles.imprintingMaterno}`}
              >
                <p className={styles.imprintingGenNombre}>{gen.nombre}</p>
                <p className={styles.imprintingGenOrigen}>
                  Expresado desde alelo {gen.origen === 'paterno' ? '👨 paterno' : '👩 materno'}
                </p>
                <span
                  className={`${styles.imprintingEstadoBadge} ${activo ? styles.badgeActivo : styles.badgeSilenciado}`}
                >
                  {activo ? '🟢 Activo ahora' : '⚫ Silenciado ahora'}
                </span>
                <p className={styles.imprintingGenDesc}>
                  <strong>Función:</strong> {gen.funcion}<br /><br />
                  {gen.descripcion}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// Sección 5: Factores que modifican el epigenoma
// ─────────────────────────────────────────────

const SeccionFactores = () => {
  return (
    <section className={styles.section}>
      <h2 className={styles.sectionTitle}>5. Factores que Modifican el Epigenoma</h2>
      <p className={styles.sectionDesc}>
        Mecanismo molecular conocido de cada factor y sus limitaciones de evidencia.
      </p>
      <div className={styles.factoresGrid}>
        {FACTORES.map((factor) => (
          <div key={factor.nombre} className={styles.factorCard}>
            <span className={styles.factorIcono} aria-hidden="true">{factor.icono}</span>
            <p className={styles.factorNombre}>{factor.nombre}</p>
            <span
              className={`${styles.factorImpactoBadge} ${
                factor.impacto === 'alto'
                  ? styles.impactoAlto
                  : factor.impacto === 'medio'
                  ? styles.impactoMedio
                  : styles.impactoBajo
              }`}
            >
              {factor.impactoLabel}
            </span>
            <p className={styles.factorMecanismo}>{factor.mecanismo}</p>
            <p className={styles.factorAviso}>
              <span aria-hidden="true">⚠️</span> {factor.aviso}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorEpigenetica() {
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge} aria-label="Categoría: Biología Molecular">
            Biología Molecular
          </span>
          <h1 className={styles.heroTitle}>Epigenética</h1>
          <p className={styles.heroSubtitle}>
            Cómo el entorno modifica la expresión génica sin alterar el ADN
          </p>
          <p className={styles.heroDesc}>
            Metilación del ADN, modificaciones de histonas, imprinting genómico y factores epigenéticos.
            La capa de regulación que conecta el genotipo con el entorno.
          </p>
        </div>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="medical"
        severity="high"
        collapsible={false}
        title="Aviso educativo — biología molecular"
      >
        Este visualizador explica mecanismos epigenéticos a nivel molecular con fines exclusivamente educativos.
        No ofrece orientación diagnóstica, terapéutica ni nutricional. La investigación en epigenética es un campo
        activo con muchos hallazgos aún preliminares. Consulta siempre fuentes científicas revisadas por pares
        y profesionales de la salud para decisiones personales.
      </DisclaimerCard>

      <SeccionNucleosoma />
      <SeccionMetilacion />
      <SeccionHistonas />
      <SeccionImprinting />
      <SeccionFactores />

      <EducationalSection
        title="Epigenética: cuando el entorno modifica la lectura del ADN"
        subtitle="Metilación, histonas e imprinting — la capa de regulación génica"
      >
        <div className={styles.eduGrid}>
          <div className={styles.eduCard}>
            <h3>¿Qué es la epigenética?</h3>
            <p>
              La epigenética estudia los cambios en la expresión génica que son hereditarios (en divisiones celulares)
              pero que no implican alteraciones en la secuencia de ADN. El prefijo &ldquo;epi-&rdquo; significa &ldquo;sobre&rdquo;:
              la epigenética es la capa de información que se asienta sobre el genoma y que determina qué genes
              se leen, cuándo y en qué tipo celular.
            </p>
            <p>
              Los principales mecanismos epigenéticos son: metilación del ADN (adición de grupos metilo a citosinas),
              modificaciones post-traduccionales de histonas (acetilación, metilación, fosforilación, ubiquitinación)
              y ARNs no codificantes (microARNs, lncRNAs) que regulan la estabilidad del ARNm.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h3>Genotipo vs fenotipo epigenético</h3>
            <p>
              Gemelos idénticos comparten exactamente la misma secuencia de ADN pero pueden desarrollar enfermedades
              diferentes, tener aspecto diferente y morir en momentos distintos. La explicación está en parte en
              la divergencia epigenética acumulada a lo largo de la vida: el entorno, la dieta, el estrés y el
              azar moleculelar dejan marcas distintas en el epigenoma de cada gemelo.
            </p>
            <p>
              Estudios con gemelos monocigotos mayores de 50 años muestran hasta 3-4 veces más diferencias
              epigenéticas que en gemelos jóvenes, confirmando que el epigenoma es dinámico y diverge con el tiempo
              incluso en individuos con ADN idéntico.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h3>Herencia transgeneracional: ¿el estrés de los padres afecta a los hijos?</h3>
            <p>
              Algunos estudios en roedores han demostrado que las modificaciones epigenéticas inducidas por el estrés
              o la dieta pueden transmitirse a la siguiente generación (e incluso a F2 y F3). En humanos, estudios
              de cohortes (como los descendientes de supervivientes del Holocausto o de la hambruna holandesa de 1944)
              sugieren efectos similares, pero la magnitud y los mecanismos son objeto de debate.
            </p>
            <p>
              El principal mecanismo propuesto es que algunas marcas epigenéticas &ldquo;escapan&rdquo; al borrado
              epigenético que ocurre en la gametogénesis y durante el desarrollo embrionario temprano, siendo
              transmitidas a la descendencia.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h3>El reloj de Horvath: medir la edad biológica</h3>
            <p>
              En 2013, Steve Horvath publicó un estimador de la edad biológica basado en los niveles de metilación
              de 353 sitios CpG específicos. Este &ldquo;reloj epigenético&rdquo; es asombrosamente preciso: predice
              la edad cronológica con un error medio de 3-4 años y es consistente en todos los tejidos y tipos
              celulares estudiados.
            </p>
            <p>
              Más importante aún, la diferencia entre la edad biológica (medida por el reloj) y la cronológica
              predice la mortalidad y el riesgo de enfermedades asociadas a la edad. Factores modificables
              (ejercicio, dieta) se asocian con un reloj más &ldquo;lento&rdquo;, aunque la causalidad no está
              siempre establecida.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h3>Epigenética y cáncer</h3>
            <p>
              El cáncer es una enfermedad genética y epigenética. Los tumores presentan patrones aberrantes de
              metilación: hipermetilación de promotores de genes supresores de tumores (silenciando BRCA1, MLH1,
              CDKN2A) e hipometilación global que desestabiliza el genoma y activa oncogenes y elementos
              transponibles.
            </p>
            <p>
              Esto ha abierto una vía terapéutica: los fármacos epigenéticos (inhibidores de DNMT como azacitidina,
              inhibidores de HDAC como vorinostat) pueden revertir silenciamientos aberrantes. La epigenética del
              cáncer es uno de los campos más activos de la oncología molecular.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h3>Límites del conocimiento actual</h3>
            <p>
              La epigenética es un campo joven con muchas afirmaciones exageradas en la divulgación popular.
              Afirmaciones como &ldquo;el estrés reescribe tu ADN&rdquo; o &ldquo;los alimentos reprograman
              tu genoma&rdquo; son simplificaciones que pueden inducir a error. La mayoría de estudios en humanos
              son observacionales (no pueden demostrar causalidad), y muchos efectos reportados en modelos animales
              no se replican en humanos con la misma magnitud.
            </p>
            <p>
              La epigenética no contradice la genética clásica: los genes siguen siendo el sustrato fundamental.
              El epigenoma modula cuándo y cuánto se expresan, pero no puede crear información genética nueva ni
              reparar mutaciones estructurales.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          La epigenética <strong>NO</strong> significa que el estilo de vida reescriba tu ADN. Modifica{' '}
          <em>cómo</em> se leen los genes, no los genes en sí. Muchos cambios son reversibles; otros, no.
          Las afirmaciones más populares sobre &ldquo;reprogramar el epigenoma&rdquo; suelen estar exageradas
          respecto a la evidencia científica disponible.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-epigenetica')} />
      <ShareCard appName="visualizador-epigenetica" />
      <Footer appName="visualizador-epigenetica" />
    </div>
  );
}
