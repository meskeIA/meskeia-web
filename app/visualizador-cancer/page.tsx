'use client';

import { useState } from 'react';
import styles from './Cancer.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos y constantes de navegación
// ─────────────────────────────────────────────

type SeccionId = 'ciclo' | 'oncogenes' | 'hallmarks' | 'inmunoterapia' | 'tipos';

interface SeccionInfo {
  id: SeccionId;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'ciclo',       titulo: 'Ciclo celular',    icono: '🔄', subtitulo: 'División normal vs descontrolada' },
  { id: 'oncogenes',   titulo: 'Oncogenes',        icono: '🧬', subtitulo: 'Aceleradores y frenos moleculares' },
  { id: 'hallmarks',   titulo: 'Hallmarks',        icono: '⬡',  subtitulo: 'Los 6 sellos del cáncer' },
  { id: 'inmunoterapia', titulo: 'Inmunoterapia',  icono: '🛡️', subtitulo: 'PD-1/PD-L1 y anticuerpos bloqueantes' },
  { id: 'tipos',       titulo: 'Tipos',            icono: '🔬', subtitulo: 'Carcinoma, sarcoma, linfoma, leucemia' },
];

// ─────────────────────────────────────────────
// Sección 1: Ciclo celular
// ─────────────────────────────────────────────

interface FaseCiclo {
  nombre: string;
  subtitulo: string;
  color: string;
  descripcion: string;
  checkpoint?: string;
}

const FASES: FaseCiclo[] = [
  {
    nombre: 'G1',
    subtitulo: 'Crecimiento 1',
    color: '#2E86AB',
    descripcion: 'La célula crece, sintetiza proteínas y se prepara para duplicar su ADN. Punto de control G1/S: Rb (en su forma activa) retiene el factor E2F y bloquea la entrada en fase S hasta que las condiciones sean favorables.',
    checkpoint: 'Checkpoint G1/S: ¿Hay suficientes nutrientes y señales de crecimiento? ¿El ADN está íntegro? Responsable principal: Rb + CDK4/CDK6 + p16',
  },
  {
    nombre: 'S',
    subtitulo: 'Síntesis ADN',
    color: '#e67e22',
    descripcion: 'Replicación completa del ADN genómico. Las dos cromátidas hermanas quedan unidas por cohesinas. Cualquier error de copia que no sea reparado queda como mutación permanente.',
    checkpoint: 'Si se detecta daño en el ADN durante la replicación, ATR/CHK1 activa una respuesta de replicación que detiene las horquillas de replicación activas.',
  },
  {
    nombre: 'G2',
    subtitulo: 'Crecimiento 2',
    color: '#8e44ad',
    descripcion: 'La célula verifica que el ADN esté completamente replicado y sin daños antes de proceder a la mitosis. El complejo CDK1/ciclina B es el motor de entrada en mitosis.',
    checkpoint: 'Checkpoint G2/M: ¿Está el ADN completamente replicado? ¿Hay lesiones sin reparar? p53 puede detener aquí el ciclo o activar apoptosis.',
  },
  {
    nombre: 'M',
    subtitulo: 'Mitosis',
    color: '#27ae60',
    descripcion: 'Las cromátidas hermanas se separan al polo opuesto de la célula (segregación cromosómica). Al final (citocinesis), dos células hijas con genomas idénticos.',
    checkpoint: 'Checkpoint del ensamblaje del huso (SAC): ningún cromosoma puede segregar hasta que todos estén correctamente anclados al huso mitótico. Evita aneuploidía.',
  },
];

function SeccionCiclo() {
  const [faseActiva, setFaseActiva] = useState<number>(0);
  const fase = FASES[faseActiva];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          En condiciones normales, la división celular está <strong>estrictamente controlada</strong> por puntos
          de control (checkpoints) que verifican que cada paso sea correcto. En el cáncer, estos controles se pierden.
        </p>
      </div>

      {/* SVG ciclo celular */}
      <div className={styles.cicloCelularWrap}>
        <svg viewBox="0 0 320 320" className={styles.cicloCelularSvg} role="img" aria-label="Diagrama del ciclo celular: G1, S, G2, M en sentido horario con checkpoints">
          {/* Fondo circular */}
          <circle cx="160" cy="160" r="130" fill="none" stroke="var(--border)" strokeWidth="2" />

          {/* Segmentos del ciclo (sentido horario desde arriba) */}
          {/* G1 — arco superior-derecho (~90° a 180°) */}
          <path d="M 160 30 A 130 130 0 0 1 290 160" fill="rgba(46,134,171,0.15)" stroke="#2E86AB" strokeWidth={faseActiva === 0 ? 4 : 2} />
          {/* S — arco inferior-derecho (~180° a 270°) */}
          <path d="M 290 160 A 130 130 0 0 1 160 290" fill="rgba(230,126,34,0.15)" stroke="#e67e22" strokeWidth={faseActiva === 1 ? 4 : 2} />
          {/* G2 — arco inferior-izquierdo (~270° a 360°) */}
          <path d="M 160 290 A 130 130 0 0 1 30 160" fill="rgba(142,68,173,0.15)" stroke="#8e44ad" strokeWidth={faseActiva === 2 ? 4 : 2} />
          {/* M — arco superior-izquierdo (~360° a 90°) */}
          <path d="M 30 160 A 130 130 0 0 1 160 30" fill="rgba(39,174,96,0.15)" stroke="#27ae60" strokeWidth={faseActiva === 3 ? 4 : 2} />

          {/* Etiquetas de fase */}
          <text x="235" y="110" textAnchor="middle" fill="#2E86AB" fontSize="14" fontWeight="700">G1</text>
          <text x="235" y="220" textAnchor="middle" fill="#e67e22" fontSize="14" fontWeight="700">S</text>
          <text x="82" y="220" textAnchor="middle" fill="#8e44ad" fontSize="14" fontWeight="700">G2</text>
          <text x="82" y="110" textAnchor="middle" fill="#27ae60" fontSize="14" fontWeight="700">M</text>

          {/* Flecha dirección horario */}
          <path d="M 175 32 L 165 20 L 155 32" fill="currentColor" opacity="0.5" />

          {/* Centro: célula */}
          <circle cx="160" cy="160" r="46" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="2" />
          <circle cx="160" cy="160" r="20" fill="rgba(46,134,171,0.2)" stroke="#2E86AB" strokeWidth="1.5" />
          <text x="160" y="164" textAnchor="middle" fill="var(--text-primary)" fontSize="10" fontWeight="600">núcleo</text>

          {/* Checkpoints — puntos en las transiciones */}
          <circle cx="240" cy="128" r="8" fill="#f1c40f" stroke="#f39c12" strokeWidth="1.5" />
          <text x="258" y="132" fill="currentColor" fontSize="8" fontWeight="600" opacity="0.7">G1/S</text>
          <circle cx="240" cy="192" r="8" fill="#f1c40f" stroke="#f39c12" strokeWidth="1.5" />
          <text x="258" y="196" fill="currentColor" fontSize="8" fontWeight="600" opacity="0.7">G2/M</text>
          <circle cx="90" cy="104" r="8" fill="#f1c40f" stroke="#f39c12" strokeWidth="1.5" />
          <text x="55" y="98" fill="currentColor" fontSize="8" fontWeight="600" opacity="0.7">SAC</text>
        </svg>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'center' }}>
          Los puntos amarillos son checkpoints — &quot;semáforos&quot; que detienen el ciclo si algo va mal
        </p>
      </div>

      {/* Selector de fases */}
      <div className={styles.fasesGrid}>
        {FASES.map((f, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.faseCard} ${faseActiva === i ? styles.faseActiva : ''}`}
            style={{ borderColor: faseActiva === i ? f.color : undefined }}
            onClick={() => setFaseActiva(i)}
            aria-pressed={faseActiva === i}
            aria-label={`Ver fase ${f.nombre}: ${f.subtitulo}`}
          >
            <p className={styles.faseNombre} style={{ color: f.color }}>{f.nombre}</p>
            <p className={styles.faseSubtitulo}>{f.subtitulo}</p>
          </button>
        ))}
      </div>
      <div className={styles.faseDetalle} style={{ borderLeftColor: fase.color }}>
        <p style={{ marginBottom: fase.checkpoint ? '0.75rem' : 0 }}>{fase.descripcion}</p>
        {fase.checkpoint && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: 0 }}>
            <strong style={{ color: '#f39c12' }}>Checkpoint:</strong> {fase.checkpoint}
          </p>
        )}
      </div>

      <h3 className={styles.subSeccionTitulo}>Cómo surge el cáncer: mutaciones acumuladas</h3>
      <div className={styles.mutacionesList}>
        {[
          { txt: 'Mutaciones en el ADN se acumulan a lo largo de décadas. La carcinogénesis es un proceso gradual, no un evento único.' },
          { txt: 'Las mutaciones que afectan a oncogenes «activan» señales de proliferación de forma permanente — el acelerador queda bloqueado.' },
          { txt: 'Las mutaciones que inactivan genes supresores de tumores «eliminan» los frenos — los checkpoints dejan de funcionar.' },
          { txt: 'Una célula con ambas alteraciones (acelerador bloqueado + frenos cortados) divide sin control — dando lugar a un tumor.' },
        ].map((m, i) => (
          <div key={i} className={styles.mutacionItem}>
            <span className={styles.mutacionNum}>{i + 1}</span>
            <span className={styles.mutacionTexto}>{m.txt}</span>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          En una célula normal, los checkpoints actúan como <strong>filtros de calidad</strong>: si detectan un error,
          detienen el ciclo para dar tiempo a la reparación o, si el daño es irreparable, activan la apoptosis
          (muerte celular programada). En el cáncer, estos filtros se pierden.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Oncogenes vs Genes Supresores
// ─────────────────────────────────────────────

interface GenInfo {
  nombre: string;
  apodo: string;
  desc: string;
  detalle: string;
  mutacion: string;
  tipo: 'oncogen' | 'supresor';
}

const GENES: GenInfo[] = [
  {
    nombre: 'RAS',
    apodo: 'La GTPasa transmisora',
    desc: 'Transmite señales de proliferación desde los receptores de superficie hasta el núcleo.',
    detalle: 'Normalmente alterna entre forma activa (unida a GTP) e inactiva (unida a GDP). La mutación en Gly12 impide la hidrólisis de GTP → RAS permanece activo de forma constitutiva → señalización proliferativa sin receptor.',
    mutacion: 'Mutación Gly12Asp → RAS constitutivamente activo',
    tipo: 'oncogen',
  },
  {
    nombre: 'MYC',
    apodo: 'El maestro transcriptor',
    desc: 'Factor de transcripción que activa cientos de genes implicados en crecimiento, metabolismo y ciclo celular.',
    detalle: 'La amplificación génica produce sobreexpresión de MYC. El exceso de proteína MYC activa de forma masiva genes de proliferación y suprime genes de diferenciación y apoptosis.',
    mutacion: 'Amplificación génica → sobreexpresión MYC',
    tipo: 'oncogen',
  },
  {
    nombre: 'HER2/ERBB2',
    apodo: 'El receptor siempre activo',
    desc: 'Receptor tirosina quinasa de membrana. La amplificación produce un exceso de receptores que se activan entre sí sin necesidad de ligando.',
    detalle: 'Con más de 25–50 copias del gen (frente a las 2 normales), la densidad de receptor en membrana es tan alta que se activan por dimerización espontánea → señal proliferativa permanente sin factor de crecimiento.',
    mutacion: 'Amplificación ERBB2 (>25 copias) → señalización constitutiva',
    tipo: 'oncogen',
  },
  {
    nombre: 'TP53',
    apodo: '\"El guardián del genoma\"',
    desc: 'Detecta daño en el ADN y activa la respuesta: detiene el ciclo, activa la reparación o induce apoptosis.',
    detalle: 'Proteína p53 actúa como factor de transcripción de emergencia. Si el daño es reparable, detiene el ciclo en G1/S vía p21 (inhibidor de CDK). Si no, activa genes proapoptóticos como BAX. Mutado en >50% de todos los cánceres humanos.',
    mutacion: 'Pérdida biallélica de TP53 → sin respuesta al daño de ADN',
    tipo: 'supresor',
  },
  {
    nombre: 'RB1',
    apodo: 'El freno de la fase S',
    desc: 'En forma activa (hipofosforilada), Rb se une al factor E2F y bloquea la entrada en fase S.',
    detalle: 'Las CDK (CDK4/6 en G1) fosforilan Rb → libera E2F → la célula entra en fase S. Cuando RB1 está mutado, E2F queda libre permanentemente y la célula pasa a fase S sin control. Ejemplo fundacional del concepto "two-hit hypothesis" de Knudson.',
    mutacion: 'Mutación biallélica → E2F libre permanentemente → entrada en S sin control',
    tipo: 'supresor',
  },
  {
    nombre: 'BRCA1/BRCA2',
    apodo: 'Los reparadores de ADN',
    desc: 'Coordinan la reparación de roturas de doble cadena de ADN por recombinación homóloga (HR).',
    detalle: 'Sin BRCA1/2 funcionales, las roturas de doble cadena se reparan por NHEJ (unión de extremos no homólogos), un mecanismo propenso a errores. La inestabilidad genómica resultante acelera la acumulación de mutaciones driver.',
    mutacion: 'Pérdida biallélica → reparación defectuosa → inestabilidad genómica',
    tipo: 'supresor',
  },
];

function SeccionOncogenes() {
  const [genActivo, setGenActivo] = useState<number | null>(null);

  const oncogenes = GENES.filter(g => g.tipo === 'oncogen');
  const supresores = GENES.filter(g => g.tipo === 'supresor');

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          La analogía del coche es clásica en oncología molecular: el cáncer se produce cuando el
          <strong> acelerador queda bloqueado</strong> (oncogenes constitutivamente activos) <em>y</em> los
          <strong> frenos se cortan</strong> (genes supresores inactivados).
        </p>
      </div>

      {/* SVG del coche */}
      <div className={styles.cocheWrap}>
        <svg viewBox="0 0 500 200" className={styles.cocheSvg} role="img" aria-label="Coche con acelerador en verde (oncogenes) y freno en rojo (genes supresores)">
          {/* Carrocería */}
          <rect x="60" y="90" width="360" height="75" rx="12" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="2" />
          {/* Techo */}
          <path d="M 130 90 Q 160 40 240 35 Q 320 30 350 90 Z" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="2" />
          {/* Ventana delantera */}
          <path d="M 310 85 Q 330 52 350 85 Z" fill="rgba(46,134,171,0.15)" stroke="#2E86AB" strokeWidth="1" />
          {/* Ventana trasera */}
          <path d="M 155 85 Q 175 52 205 85 Z" fill="rgba(46,134,171,0.15)" stroke="#2E86AB" strokeWidth="1" />

          {/* Ruedas */}
          <circle cx="140" cy="165" r="28" fill="var(--text-muted)" />
          <circle cx="140" cy="165" r="14" fill="var(--bg-card)" />
          <circle cx="350" cy="165" r="28" fill="var(--text-muted)" />
          <circle cx="350" cy="165" r="14" fill="var(--bg-card)" />

          {/* Acelerador (izquierda del interior) — verde */}
          <rect x="90" y="108" width="30" height="42" rx="4" fill="#27ae60" />
          <text x="105" y="124" textAnchor="middle" fill="white" fontSize="7" fontWeight="700">Acele-</text>
          <text x="105" y="133" textAnchor="middle" fill="white" fontSize="7" fontWeight="700">rador</text>
          <text x="105" y="142" textAnchor="middle" fill="white" fontSize="6" opacity="0.85">Oncogén</text>
          {/* Flecha acelerador bloqueado */}
          <text x="105" y="155" textAnchor="middle" fill="#27ae60" fontSize="12" fontWeight="700">↓</text>

          {/* Freno (derecha del interior) — rojo */}
          <rect x="360" y="108" width="30" height="42" rx="4" fill="#e74c3c" />
          <text x="375" y="124" textAnchor="middle" fill="white" fontSize="7" fontWeight="700">Freno</text>
          <text x="375" y="135" textAnchor="middle" fill="white" fontSize="6" opacity="0.85">Supresor</text>
          <text x="375" y="144" textAnchor="middle" fill="white" fontSize="6" opacity="0.85">tumoral</text>
          {/* Freno cortado (línea tachada) */}
          <line x1="358" y1="106" x2="392" y2="152" stroke="#fff" strokeWidth="2.5" strokeDasharray="4 2" />

          {/* Etiqueta normal */}
          <text x="220" y="130" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="600">División</text>
          <text x="220" y="142" textAnchor="middle" fill="var(--text-primary)" fontSize="9" fontWeight="600">controlada</text>

          {/* Estado cáncer (flechas de velocidad) */}
          <path d="M 420 145 L 460 145 L 454 140 M 460 145 L 454 150" stroke="#e74c3c" strokeWidth="2" fill="none" />
          <text x="465" y="148" fill="#e74c3c" fontSize="8" fontWeight="700">→</text>
        </svg>
      </div>

      {/* Two-hit hypothesis */}
      <div className={styles.knudsonBox}>
        <strong>Hipótesis de los dos impactos (Knudson, 1971):</strong> Los genes supresores de tumores requieren
        la inactivación de <em>ambas</em> copias (alelos) para perder su función. En células somáticas normales
        hay dos copias; si una muta, la otra copia sirve como respaldo. Solo cuando ambas copias están inactivadas
        (por mutación, deleción o silenciamiento epigenético) se pierde el efecto supresor.
      </div>

      <div className={styles.genesGrid}>
        {/* Oncogenes */}
        <div className={styles.genesColumna}>
          <div className={`${styles.genColumnaHeader} ${styles.genColumnaAcel}`}>
            Oncogenes (acelerador bloqueado)
          </div>
          {oncogenes.map((gen, i) => {
            const idx = GENES.indexOf(gen);
            const activo = genActivo === idx;
            return (
              <div
                key={i}
                className={`${styles.genCard} ${activo ? styles.genCardActiva : ''}`}
                onClick={() => setGenActivo(activo ? null : idx)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setGenActivo(activo ? null : idx); } }}
                tabIndex={0}
                role="button"
                aria-expanded={activo}
                aria-label={`Ver detalles de ${gen.nombre}`}
                style={{ borderLeftColor: activo ? '#27ae60' : undefined, borderLeftWidth: activo ? '4px' : undefined }}
              >
                <p className={styles.genNombre}>{gen.nombre}</p>
                <p className={styles.genApodo}>{gen.apodo}</p>
                <p className={styles.genDesc}>{gen.desc}</p>
                {activo && (
                  <div className={styles.genDetalle}>
                    <p>{gen.detalle}</p>
                    <span className={styles.genMutacion}>{gen.mutacion}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Supresores */}
        <div className={styles.genesColumna}>
          <div className={`${styles.genColumnaHeader} ${styles.genColumnaFrenos}`}>
            Genes supresores (frenos cortados)
          </div>
          {supresores.map((gen, i) => {
            const idx = GENES.indexOf(gen);
            const activo = genActivo === idx;
            return (
              <div
                key={i}
                className={`${styles.genCard} ${activo ? styles.genCardActiva : ''}`}
                onClick={() => setGenActivo(activo ? null : idx)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setGenActivo(activo ? null : idx); } }}
                tabIndex={0}
                role="button"
                aria-expanded={activo}
                aria-label={`Ver detalles de ${gen.nombre}`}
                style={{ borderLeftColor: activo ? '#e74c3c' : undefined, borderLeftWidth: activo ? '4px' : undefined }}
              >
                <p className={styles.genNombre}>{gen.nombre}</p>
                <p className={styles.genApodo}>{gen.apodo}</p>
                <p className={styles.genDesc}>{gen.desc}</p>
                {activo && (
                  <div className={styles.genDetalle}>
                    <p>{gen.detalle}</p>
                    <span className={styles.genMutacion}>{gen.mutacion}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          En la mayoría de cánceres humanos, es la <strong>combinación</strong> de mutaciones en oncogenes
          (ganancia de función) <em>y</em> en genes supresores (pérdida de función) lo que desencadena la
          proliferación maligna. El término «mutación driver» describe las que confieren ventaja proliferativa;
          las «mutaciones passenger» se acumulan pero no aportan ventaja selectiva.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Los 6 Hallmarks del cáncer
// ─────────────────────────────────────────────

interface Hallmark {
  nombre: string;
  icono: string;
  color: string;
  descripcion: string;
  molecular: string;
}

const HALLMARKS: Hallmark[] = [
  {
    nombre: 'Autosuficiencia en señales de crecimiento',
    icono: '📡',
    color: '#2E86AB',
    descripcion: 'Las células cancerosas producen sus propios factores de crecimiento (autocrinia), sobreexpresan receptores de superficie o mutan proteínas señalizadoras para recibir señales proliferativas de forma continua, sin depender de estímulos externos.',
    molecular: 'Mutación en RAS, amplificación de EGFR/HER2, producción autocrina de TGF-α o EGF. El circuito de señalización proliferativa se vuelve autónomo.',
  },
  {
    nombre: 'Insensibilidad a señales antiproliferativas',
    icono: '🚫',
    color: '#e67e22',
    descripcion: 'Las células normales responden a señales que frenan la proliferación (TGF-β, contacto célula-célula, diferenciación). Las células cancerosas han perdido esta capacidad de respuesta.',
    molecular: 'Pérdida de Rb, p16/INK4a o de receptores TGF-β funcionales. La inactivación de Rb libera E2F permanentemente → entrada en ciclo sin estímulo externo.',
  },
  {
    nombre: 'Evasión de la apoptosis',
    icono: '☠️',
    color: '#e74c3c',
    descripcion: 'Cuando el ADN está gravemente dañado o hay señales aberrantes de proliferación, lo normal es que la célula active su muerte programada (apoptosis). Las células cancerosas evaden este mecanismo de seguridad.',
    molecular: 'Sobreexpresión de BCL-2/BCL-XL (antiapoptóticos), pérdida de p53 (principal activador de apoptosis), activación de la vía PI3K/AKT/mTOR que promueve la supervivencia celular.',
  },
  {
    nombre: 'Potencial replicativo ilimitado',
    icono: '♾️',
    color: '#8e44ad',
    descripcion: 'Las células normales tienen un número limitado de divisiones (~50-70, límite de Hayflick) debido al acortamiento progresivo de los telómeros. Las cancerosas reactivan la telomerasa para mantener sus telómeros y dividirse indefinidamente.',
    molecular: 'Sobreexpresión o mutación del promotor de hTERT (subunidad catalítica de la telomerasa) → estabilización de telómeros → bypass del límite de Hayflick → inmortalización celular.',
  },
  {
    nombre: 'Angiogénesis sostenida',
    icono: '🩸',
    color: '#c0392b',
    descripcion: 'Sin suministro de oxígeno y nutrientes, un tumor no puede crecer más de 1-2 mm³. Las células tumorales activan el "interruptor angiogénico" para estimular el crecimiento de nuevos vasos.',
    molecular: 'Sobreproducción de VEGF (factor de crecimiento vascular endotelial) + FGF. En hipoxia, HIF-1α estabiliza y activa la transcripción de VEGF → los vasos crecen hacia el tumor.',
  },
  {
    nombre: 'Invasión y metástasis',
    icono: '🔀',
    color: '#2c3e50',
    descripcion: 'El tumor primario invade tejidos adyacentes, entra en vasos sanguíneos o linfáticos, sobrevive en circulación y coloniza órganos distantes formando metástasis.',
    molecular: 'Transición epitelio-mesenquimal (EMT): pérdida de E-cadherina, activación de vimentina/N-cadherina. Las metaloproteasas de matriz (MMP-2, MMP-9) digieren la membrana basal y la matriz extracelular. En circulación, las células tumorales evaden las células NK.',
  },
];

const COLORES_HALLMARK = HALLMARKS.map(h => h.color);

function SeccionHallmarks() {
  const [activo, setActivo] = useState<number>(0);
  const hk = HALLMARKS[activo];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          En el año 2000, Hanahan y Weinberg publicaron en <em>Cell</em> uno de los artículos más citados
          de la biología: los <strong>6 Hallmarks of Cancer</strong> (sellos del cáncer). Describen las
          capacidades funcionales que toda célula cancerosa debe adquirir para progresar.
        </p>
      </div>

      <div className={styles.hallmarksGrid}>
        {HALLMARKS.map((hm, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.hallmarkCard} ${activo === i ? styles.hallmarkActivo : ''}`}
            onClick={() => setActivo(i)}
            aria-pressed={activo === i}
            aria-label={`Hallmark ${i + 1}: ${hm.nombre}`}
          >
            <div className={styles.hallmarkNum} style={{ background: hm.color }}>{i + 1}</div>
            <span className={styles.hallmarkIcono} aria-hidden="true">{hm.icono}</span>
            <p className={styles.hallmarkNombre}>{hm.nombre}</p>
          </button>
        ))}
      </div>

      <div className={styles.hallmarkPanel} style={{ borderLeftColor: hk.color }}>
        <div className={styles.hallmarkPanelHeader}>
          <div className={styles.hallmarkPanelNum} style={{ background: hk.color }}>
            {activo + 1}
          </div>
          <h3 className={styles.hallmarkPanelTitulo}>{hk.nombre}</h3>
        </div>
        <p className={styles.hallmarkPanelDesc}>{hk.descripcion}</p>
        <p className={styles.hallmarkPanelMol}>
          <strong>Base molecular:</strong> {hk.molecular}
        </p>
      </div>

      <div className={styles.insight}>
        <p>
          Los 6 hallmarks son <strong>capacidades que la célula tumoral adquiere de forma progresiva</strong>,
          no de golpe. Cada mutación driver que selecciona el tumor aporta una o más de estas capacidades.
          Entender los hallmarks ha sido clave para identificar las dianas moleculares de los fármacos oncológicos modernos.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Inmunoterapia
// ─────────────────────────────────────────────

type EstadoInmuno = 'normal' | 'evasion' | 'terapia';

const ESTADOS_INMUNO: { id: EstadoInmuno; label: string }[] = [
  { id: 'normal',   label: 'Vigilancia normal' },
  { id: 'evasion',  label: 'Evasión tumoral' },
  { id: 'terapia',  label: 'Inmunoterapia' },
];

const DESC_INMUNO: Record<EstadoInmuno, string> = {
  normal: 'En condiciones normales, los linfocitos T citotóxicos (CD8+) reconocen y destruyen células con antígenos aberrantes (mutados o virales) presentados en MHC-I. El linfocito T necesita dos señales: el reconocimiento del antígeno (TCR/MHC) y una señal coestimuladora (CD28/B7).',
  evasion: 'Las células tumorales sobreexpresan PD-L1 en su superficie. Cuando PD-L1 se une a PD-1 del linfocito T, envía una señal inhibidora que "apaga" al linfocito: deja de proliferar, produce menos citoquinas citotóxicas (IFN-γ, TNF-α) y entra en un estado de agotamiento (exhaustion). El tumor se vuelve invisible al sistema inmune.',
  terapia: 'Los anticuerpos monoclonales anti-PD-1 (pembrolizumab, nivolumab) o anti-PD-L1 (atezolizumab, durvalumab) bloquean físicamente la interacción PD-1/PD-L1. Al eliminar la señal inhibidora, el linfocito T recupera su capacidad citotóxica y ataca a las células tumorales. Es una terapia que "quita el freno" al sistema inmune.',
};

interface CheckpointInfo {
  nombre: string;
  farmaco: string;
  desc: string;
  activo: boolean;
}

const CHECKPOINTS_INMUNE: CheckpointInfo[] = [
  { nombre: 'PD-1 / PD-L1', farmaco: 'Pembrolizumab, nivolumab, atezolizumab', desc: 'El eje más conocido. PD-L1 en célula tumoral apaga PD-1 en linfocito T. El anti-PD-1 bloquea la señal inhibidora.', activo: true },
  { nombre: 'CTLA-4 / B7', farmaco: 'Ipilimumab', desc: 'CTLA-4 compite con CD28 por unirse a B7 en células dendríticas. Bloquear CTLA-4 potencia la activación de T en ganglios linfáticos.', activo: false },
  { nombre: 'LAG-3 / TIM-3', farmaco: 'En investigación (relatlimab)', desc: 'Nuevos checkpoints en fase clínica. LAG-3 frena T helper; TIM-3 frena T citotóxico y células NK. Combinaciones con anti-PD-1 en estudio.', activo: false },
];

function SeccionInmunoterapia() {
  const [estado, setEstado] = useState<EstadoInmuno>('normal');

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          El sistema inmune normalmente patrulla el organismo y elimina células con mutaciones.
          Los tumores evolucionan mecanismos para <strong>evadir esta vigilancia</strong>.
          La inmunoterapia de checkpoint actúa bloqueando esos mecanismos de evasión.
        </p>
      </div>

      <div className={styles.inmunoEstadoNav}>
        {ESTADOS_INMUNO.map(e => (
          <button
            key={e.id}
            type="button"
            className={`${styles.estadoBtn} ${estado === e.id ? styles.estadoBtnActivo : ''}`}
            onClick={() => setEstado(e.id)}
            aria-pressed={estado === e.id}
          >
            {e.label}
          </button>
        ))}
      </div>

      {/* SVG sinapsis inmunológica */}
      <div className={styles.inmunoSvgWrap}>
        <svg viewBox="0 0 520 220" className={styles.inmunoSvg} role="img" aria-label={`Sinapsis inmunológica: estado ${estado}`}>
          {/* Linfocito T (izquierda) */}
          <circle cx="100" cy="110" r="65" fill="rgba(46,134,171,0.12)" stroke="#2E86AB" strokeWidth="2" />
          <circle cx="100" cy="110" r="28" fill="rgba(46,134,171,0.25)" stroke="#2E86AB" strokeWidth="1.5" />
          <text x="100" y="114" textAnchor="middle" fill="#2E86AB" fontSize="8" fontWeight="700">núcleo T</text>
          <text x="100" y="195" textAnchor="middle" fill="#2E86AB" fontSize="9" fontWeight="600">Linfocito T CD8+</text>
          {/* PD-1 en la superficie del linfocito T */}
          <rect x="158" y="90" width="32" height="20" rx="6" fill="#2E86AB" opacity="0.85" />
          <text x="174" y="103" textAnchor="middle" fill="white" fontSize="7.5" fontWeight="700">PD-1</text>

          {/* Célula tumoral (derecha) */}
          <circle cx="400" cy="110" r="65" fill="rgba(231,76,60,0.1)" stroke="#e74c3c" strokeWidth="2" />
          <circle cx="400" cy="110" r="28" fill="rgba(231,76,60,0.2)" stroke="#e74c3c" strokeWidth="1.5" />
          <text x="400" y="114" textAnchor="middle" fill="#e74c3c" fontSize="8" fontWeight="700">núcleo</text>
          <text x="400" y="195" textAnchor="middle" fill="#e74c3c" fontSize="9" fontWeight="600">Célula tumoral</text>
          {/* PD-L1 en la superficie tumoral */}
          <rect x="330" y="90" width="32" height="20" rx="6" fill="#e74c3c" opacity="0.85" />
          <text x="346" y="103" textAnchor="middle" fill="white" fontSize="7.5" fontWeight="700">PD-L1</text>

          {/* Estado NORMAL: sin interacción PD-1/PD-L1 */}
          {estado === 'normal' && (
            <>
              {/* T activo → destruye célula tumoral */}
              <path d="M 165 110 L 330 110" stroke="#27ae60" strokeWidth="2.5" strokeDasharray="5 3" markerEnd="url(#arrowGreen)" />
              <text x="247" y="103" textAnchor="middle" fill="#27ae60" fontSize="8" fontWeight="700">T activo → destruye</text>
              <defs>
                <marker id="arrowGreen" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto">
                  <path d="M 0 0 L 6 3 L 0 6 Z" fill="#27ae60" />
                </marker>
              </defs>
              <text x="247" y="135" textAnchor="middle" fill="var(--text-secondary)" fontSize="7.5">Receptor TCR reconoce antígeno</text>
              <text x="247" y="146" textAnchor="middle" fill="var(--text-secondary)" fontSize="7.5">en MHC-I → activación citotóxica</text>
            </>
          )}

          {/* Estado EVASIÓN: PD-L1 apaga PD-1 */}
          {estado === 'evasion' && (
            <>
              {/* Línea PD-1 -- PD-L1 activa (inhibición) */}
              <line x1="190" y1="100" x2="330" y2="100" stroke="#e74c3c" strokeWidth="3" />
              <circle cx="260" cy="100" r="6" fill="#e74c3c" />
              <text x="260" y="84" textAnchor="middle" fill="#e74c3c" fontSize="8" fontWeight="700">PD-1 ⟷ PD-L1</text>
              <text x="260" y="75" textAnchor="middle" fill="#e74c3c" fontSize="7.5">Señal inhibidora → T apagado</text>
              {/* Símbolo de "stop" en el linfocito */}
              <circle cx="100" cy="110" r="12" fill="rgba(231,76,60,0.7)" />
              <text x="100" y="114" textAnchor="middle" fill="white" fontSize="10" fontWeight="700">✕</text>
              <text x="247" y="145" textAnchor="middle" fill="var(--text-secondary)" fontSize="7.5">El linfocito T entra en estado</text>
              <text x="247" y="156" textAnchor="middle" fill="var(--text-secondary)" fontSize="7.5">de agotamiento (exhaustion)</text>
            </>
          )}

          {/* Estado TERAPIA: anticuerpo bloquea PD-1 */}
          {estado === 'terapia' && (
            <>
              {/* Anticuerpo (forma de Y) bloqueando PD-1 */}
              {/* Tallo */}
              <line x1="215" y1="130" x2="215" y2="112" stroke="#48A9A6" strokeWidth="3" strokeLinecap="round" />
              {/* Brazos */}
              <line x1="215" y1="112" x2="198" y2="96" stroke="#48A9A6" strokeWidth="3" strokeLinecap="round" />
              <line x1="215" y1="112" x2="232" y2="96" stroke="#48A9A6" strokeWidth="3" strokeLinecap="round" />
              {/* Extremos brazos */}
              <circle cx="198" cy="96" r="5" fill="#48A9A6" />
              <circle cx="232" cy="96" r="5" fill="#48A9A6" />
              <text x="215" y="148" textAnchor="middle" fill="#48A9A6" fontSize="7.5" fontWeight="700">anti-PD-1</text>
              {/* Bloqueo de la interacción */}
              <line x1="235" y1="95" x2="330" y2="100" stroke="var(--border)" strokeWidth="2" strokeDasharray="4 3" />
              <circle cx="282" cy="97" r="8" fill="none" stroke="#e74c3c" strokeWidth="2" />
              <line x1="277" y1="92" x2="287" y2="102" stroke="#e74c3c" strokeWidth="2" />
              {/* T activo */}
              <path d="M 165 130 L 330 120" stroke="#27ae60" strokeWidth="2.5" strokeDasharray="5 3" markerEnd="url(#arrowGreen2)" />
              <defs>
                <marker id="arrowGreen2" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto">
                  <path d="M 0 0 L 6 3 L 0 6 Z" fill="#27ae60" />
                </marker>
              </defs>
              <text x="247" y="158" textAnchor="middle" fill="#27ae60" fontSize="7.5" fontWeight="700">T recupera actividad citotóxica</text>
            </>
          )}
        </svg>
      </div>

      <div className={styles.inmunoDesc}>{DESC_INMUNO[estado]}</div>

      <h3 className={styles.subSeccionTitulo}>Otros checkpoints inmunes</h3>
      <div className={styles.checkpointsGrid}>
        {CHECKPOINTS_INMUNE.map((cp, i) => (
          <div key={i} className={styles.checkpointCard}>
            <p className={styles.checkpointNombre}>{cp.nombre}</p>
            <p className={styles.checkpointFarmaco}>{cp.farmaco}</p>
            <p className={styles.checkpointDesc}>{cp.desc}</p>
            <span className={`${styles.checkpointTag} ${cp.activo ? styles.checkpointTagActivo : ''}`}>
              {cp.activo ? 'Ampliamente aprobado' : 'En investigación / reciente aprobación'}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          La inmunoterapia de checkpoint no actúa directamente sobre el tumor: actúa sobre el
          <strong> sistema inmune del propio paciente</strong>, eliminando los frenos que el tumor había
          activado. Es un cambio de paradigma respecto a la quimioterapia clásica, que atacaba directamente
          las células en división.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 5: Tipos por origen celular
// ─────────────────────────────────────────────

interface TipoCancer {
  nombre: string;
  icono: string;
  origen: string;
  descripcion: string;
  color: string;
}

const TIPOS: TipoCancer[] = [
  {
    nombre: 'Carcinoma',
    icono: '🧱',
    origen: 'Células epiteliales',
    color: '#2E86AB',
    descripcion: 'Las células epiteliales revisten superficies externas e internas: piel, mucosas, glándulas, conductos de órganos. Tienen una tasa de renovación elevada, lo que incrementa la probabilidad de que se acumulen mutaciones en cada ciclo de división. Por ello, los carcinomas son el tipo más frecuente de neoplasia maligna en términos generales.',
  },
  {
    nombre: 'Sarcoma',
    icono: '🦴',
    origen: 'Tejido conectivo (mesenquimal)',
    color: '#e67e22',
    descripcion: 'Se originan en células de hueso, cartílago, músculo liso, músculo esquelético, grasa, tendones o vasos sanguíneos. Los sarcomas son neoplasias poco frecuentes comparadas con los carcinomas, en parte porque el tejido conectivo se renueva con menos frecuencia.',
  },
  {
    nombre: 'Linfoma',
    icono: '🔵',
    origen: 'Células linfoides (sistema inmune)',
    color: '#8e44ad',
    descripcion: 'Se originan en linfocitos B o T del sistema linfático. Se manifiestan habitualmente en ganglios linfáticos, bazo, timo o tejido linfoide asociado a mucosas (MALT). La transformación maligna puede implicar defectos en la apoptosis (Bcl-2), en la recombinación de los genes de receptor de antígeno, o en factores de transcripción propios de la diferenciación linfoide.',
  },
  {
    nombre: 'Leucemia',
    icono: '🩸',
    origen: 'Células hematopoyéticas (médula ósea)',
    color: '#c0392b',
    descripcion: 'Se originan en progenitores de la médula ósea: mieloides (granulocitos, eritrocitos, megacariocitos) o linfoides. Las células malignas proliferan en médula y circulan en sangre. La translocación t(9;22) que genera el cromosoma Filadelfia y la proteína de fusión BCR-ABL es un ejemplo paradigmático de cómo una translocación cromosómica puede crear un oncogén.',
  },
];

function SeccionTipos() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>
          La nomenclatura de los tumores malignos refleja el <strong>tipo celular del que se originan</strong>,
          no el órgano en el que crecen. Esta clasificación por origen celular tiene implicaciones en el comportamiento
          biológico y en los mecanismos moleculares subyacentes.
        </p>
      </div>

      <div className={styles.tiposGrid}>
        {TIPOS.map((tipo, i) => (
          <div key={i} className={styles.tipoCard} style={{ borderTop: `4px solid ${tipo.color}` }}>
            <span className={styles.tipoIcono} aria-hidden="true">{tipo.icono}</span>
            <h3 className={styles.tipoNombre}>{tipo.nombre}</h3>
            <span className={styles.tipoOrigen}>{tipo.origen}</span>
            <p className={styles.tipoDesc}>{tipo.descripcion}</p>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          La biología molecular ha revelado que tumores con el mismo origen celular pueden tener
          perfiles genómicos muy diferentes (heterogeneidad intertumoral), y que tumores en órganos
          distintos pueden compartir las mismas mutaciones driver. Esto ha impulsado el concepto de
          oncología de <strong>precisión molecular</strong>: tratar la mutación, no solo el órgano.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCancerPage() {
  const [seccionActiva, setSeccionActiva] = useState<SeccionId>('ciclo');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'ciclo':         return <SeccionCiclo />;
      case 'oncogenes':     return <SeccionOncogenes />;
      case 'hallmarks':     return <SeccionHallmarks />;
      case 'inmunoterapia': return <SeccionInmunoterapia />;
      case 'tipos':         return <SeccionTipos />;
    }
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Cáncer: Biología Molecular</h1>
          <p className={styles.subtitle}>Oncogenes, genes supresores, los 6 hallmarks y la inmunoterapia PD-1/PD-L1</p>
        </header>

        <LegalNotice />

        <DisclaimerCard
          variant="medical"
          severity="critical"
          collapsible={false}
          title="Aviso importante: contenido estrictamente educativo"
        >
          <p>
            Este visualizador explica <strong>biología molecular básica</strong> con fines exclusivamente educativos.
            No incluye síntomas, estadísticas de supervivencia, estadios, tratamientos específicos ni ninguna
            información diagnóstica o pronóstica. No está diseñado para ser interpretado en relación con ningún
            caso clínico, propio o ajeno.
          </p>
          <p>
            Ante cualquier preocupación médica, consulta siempre con un <strong>oncólogo u otro especialista sanitario</strong>.
          </p>
        </DisclaimerCard>

        {/* Navegación principal */}
        <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
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

        {/* Cabecera de sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            <span aria-hidden="true">{SECCIONES.find(s => s.id === seccionActiva)?.icono}</span>{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Biología molecular del cáncer"
          subtitle="Mutaciones acumuladas, checkpoints perdidos y cómo el sistema inmune puede recuperar el control"
          defaultOpen={false}
        >
          <h3>El cáncer como enfermedad evolutiva</h3>
          <p>
            Las células tumorales no son estáticas: evolucionan por <strong>selección natural darwiniana</strong>
            dentro del tumor. Las subpoblaciones con mutaciones que aportan mayor ventaja proliferativa, mayor
            resistencia a la apoptosis o mayor capacidad de evadir el sistema inmune son seleccionadas positivamente.
            Este proceso (heterogeneidad intratumoral) explica por qué los tumores pueden desarrollar resistencia
            a los tratamientos: las células resistentes estaban ya presentes como subclones minoritarios.
          </p>

          <h3>La carcinogénesis como proceso de décadas</h3>
          <p>
            El cáncer no surge de un día para otro. La acumulación de mutaciones driver es un proceso que puede
            extenderse durante <strong>10-30 años</strong>. El concepto de <em>campo de cancerización</em>
            (field cancerization) describe cómo un epitelio sometido a un carcinógeno crónico puede acumular
            mutaciones subclínicas en toda un área antes de que aparezca el primer tumor detectable.
          </p>

          <h3>Reparación del ADN: los guardianes moleculares</h3>
          <p>
            El genoma humano sufre miles de lesiones al día (oxidación, alquilación, radiación UV, errores de
            replicación). Varios mecanismos de reparación los corrigen:
          </p>
          <ul>
            <li><strong>BER (Base Excision Repair):</strong> bases oxidadas o modificadas químicamente.</li>
            <li><strong>NER (Nucleotide Excision Repair):</strong> fotodímeros UV y lesiones voluminosas.</li>
            <li><strong>MMR (Mismatch Repair):</strong> errores de apareamiento durante la replicación. Su defecto provoca alta inestabilidad de microsatélites (MSI-H).</li>
            <li><strong>NHEJ:</strong> roturas de doble cadena por unión de extremos (propensa a errores).</li>
            <li><strong>HR (Recombinación Homóloga):</strong> reparación fiel de doble cadena usando la cromátida hermana como molde. Requiere BRCA1/2.</li>
          </ul>
          <p>
            Cuando estos sistemas fallan —por mutación en los genes reparadores— la tasa de mutación se
            dispara y la carcinogénesis se acelera.
          </p>

          <h3>El papel de los carcinógenos: mecanismo molecular</h3>
          <p>
            Un carcinógeno es cualquier agente que incrementa la tasa de mutación somática:
          </p>
          <ul>
            <li><strong>Radiación UV:</strong> forma fotodímeros ciclobutánicos entre pirimidinas adyacentes → mutaciones características C→T en sitios CC o TC (firma mutacional SBS7).</li>
            <li><strong>Benzopireno (humo de tabaco):</strong> se activa metabólicamente a un diolepóxido que forma aductos en guaninas del ADN → mutaciones G→T, frecuentes en TP53 en pulmón.</li>
            <li><strong>Virus oncogénicos:</strong> VPH integra E6 (degrada p53) y E7 (inactiva Rb); VEB activa MYC mediante translocación t(8;14) en linfoma de Burkitt.</li>
          </ul>
          <p>
            La distinción clave es que los carcinógenos no &quot;causan&quot; el cáncer directamente: aumentan
            la probabilidad de que se acumulen las mutaciones driver necesarias.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> Este visualizador explica biología molecular con fines educativos. No incluye
            síntomas, estadísticas de supervivencia, estadios ni ningún tipo de información diagnóstica o
            pronóstica. Ante cualquier preocupación médica, consulta siempre con un oncólogo.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-cancer')} />
        <ShareCard appName="visualizador-cancer" />
        <Footer appName="visualizador-cancer" />
    </div>
  );
}
