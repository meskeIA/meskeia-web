'use client';
// @disclaimer: exempt

import { useState } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import styles from './CicloViral.module.css';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface EtapaCiclo {
  numero: number;
  nombre: string;
  icono: string;
  descripcion: string;
  detalle: string;
  ejemplo: string;
  cx: number;
  cy: number;
}

interface FilaComparacion {
  aspecto: string;
  adn: string;
  arn: string;
  retrovirus: string;
}

interface MecanismoEvasion {
  titulo: string;
  icono: string;
  descripcion: string;
  ejemplo: string;
}

// ─────────────────────────────────────────────
// Datos: Etapas del ciclo viral
// ─────────────────────────────────────────────

const ETAPAS: EtapaCiclo[] = [
  {
    numero: 1,
    nombre: 'Adhesión',
    icono: '🔑',
    descripcion:
      'El virus reconoce receptores específicos de la célula huésped mediante proteínas de superficie complementarias.',
    detalle:
      'La adhesión es altamente específica: las proteínas virales de superficie (ligandos) encajan con receptores celulares concretos, como una llave en una cerradura. Esta especificidad determina el tropismo viral, es decir, qué tipos de células puede infectar cada virus.',
    ejemplo: 'VIH: la glicoproteína gp120 se une al receptor CD4 de los linfocitos T. Influenza: la hemaglutinina (HA) se une al ácido siálico de las células del tracto respiratorio.',
    cx: 250,
    cy: 40,
  },
  {
    numero: 2,
    nombre: 'Entrada',
    icono: '🚪',
    descripcion:
      'El virus penetra en el interior de la célula huésped mediante fusión de membranas o endocitosis.',
    detalle:
      'Los virus envueltos (como VIH o influenza) fusionan su membrana lipídica con la membrana celular, inyectando la cápside directamente. Los virus no envueltos suelen entrar por endocitosis: la célula los engloba en una vesícula (endosoma), desde la cual escapan al citoplasma.',
    ejemplo: 'VIH: la glicoproteína gp41 media la fusión de membranas. Adenovirus: entra por endocitosis y escapa del endosoma por rotura osmótica.',
    cx: 430,
    cy: 130,
  },
  {
    numero: 3,
    nombre: 'Liberación del genoma',
    icono: '📦',
    descripcion:
      'La cápside viral se desensambla (decapsidación) y libera el material genético viral en el citoplasma o el núcleo.',
    detalle:
      'Una vez dentro, la cápside debe abrirse para liberar el genoma viral. Este proceso puede ocurrir en el citoplasma o, en virus que necesitan acceder al núcleo (como los de ADN), el genoma viaja al poro nuclear. El momento y lugar de la decapsidación están controlados por señales bioquímicas del entorno celular.',
    ejemplo: 'Influenza: la acidificación del endosoma activa la proteína M2 (canal de protones), desestabilizando la cápside. El ARN segmentado se libera al citoplasma.',
    cx: 430,
    cy: 290,
  },
  {
    numero: 4,
    nombre: 'Replicación y transcripción',
    icono: '⚙️',
    descripcion:
      'La maquinaria celular es secuestrada para fabricar ARNm viral y replicar el genoma del virus.',
    detalle:
      'Los virus ADN suelen replicarse en el núcleo, aprovechando las polimerasas de la célula. Los virus ARN replican en el citoplasma con su propia ARN-polimerasa dependiente de ARN (RdRp), ya que la célula no tiene esta enzima. Los retrovirus primero convierten su ARN en ADN mediante la transcriptasa inversa, y luego integran ese ADN en el genoma huésped.',
    ejemplo: 'SARS-CoV-2: su RdRp replica el ARN genómico de ~30.000 bases en el citoplasma. Herpesvirus: replica su ADN en el núcleo usando polimerasas propias y del huésped.',
    cx: 250,
    cy: 370,
  },
  {
    numero: 5,
    nombre: 'Ensamblaje',
    icono: '🧩',
    descripcion:
      'Las proteínas virales recién sintetizadas y las copias del genoma se ensamblan en nuevos viriones.',
    detalle:
      'El ensamblaje puede ocurrir en el citoplasma, el núcleo o en asociación con membranas celulares. Las proteínas de la cápside se pliegan espontáneamente alrededor del genoma viral. En virus envueltos, las glucoproteínas de superficie se insertan en la membrana celular antes de que el virión brote.',
    ejemplo: 'VIH: el ensamblaje ocurre en la membrana plasmática. La proteasa viral corta las poliproteínas durante o después del ensamblaje, generando viriones maduros e infecciosos.',
    cx: 70,
    cy: 290,
  },
  {
    numero: 6,
    nombre: 'Liberación',
    icono: '💥',
    descripcion:
      'Los nuevos viriones salen de la célula por lisis o por gemación (budding), listos para infectar otras células.',
    detalle:
      'Lisis: la célula se llena de viriones hasta reventar, liberando miles de partículas de golpe. Es típica de bacteriófagos y algunos virus animales (poliovirus). Gemación o budding: el virión brota de la membrana plasmática envuelto en lípidos del huésped. No mata inmediatamente la célula. Es el mecanismo de VIH, influenza y coronavirus.',
    ejemplo: 'Influenza: la neuraminidasa (NA) corta el ácido siálico que retiene los viriones en la membrana, permitiendo la diseminación. Por eso los inhibidores de NA son antivirales efectivos.',
    cx: 70,
    cy: 130,
  },
];

// ─────────────────────────────────────────────
// Datos: Comparativa ADN vs ARN vs Retrovirus
// ─────────────────────────────────────────────

const COMPARATIVA: FilaComparacion[] = [
  {
    aspecto: 'Tipo de genoma',
    adn: 'ADN (doble cadena, generalmente)',
    arn: 'ARN (simple o doble cadena)',
    retrovirus: 'ARN → se convierte en ADN',
  },
  {
    aspecto: 'Lugar de replicación',
    adn: 'Núcleo celular',
    arn: 'Citoplasma',
    retrovirus: 'Citoplasma → núcleo (integración)',
  },
  {
    aspecto: 'Tasa de mutación',
    adn: 'Baja (con corrección de errores)',
    arn: 'Alta (sin corrección de errores)',
    retrovirus: 'Muy alta (transcriptasa inversa propensa a errores)',
  },
  {
    aspecto: 'Enzima clave',
    adn: 'ADN polimerasa (propia o del huésped)',
    arn: 'ARN polimerasa dependiente de ARN (RdRp)',
    retrovirus: 'Transcriptasa inversa + integrasa',
  },
  {
    aspecto: 'Integración en huésped',
    adn: 'Algunos (herpesvirus: episoma extracromosómico)',
    arn: 'No',
    retrovirus: 'Sí (provirus permanente en el genoma)',
  },
  {
    aspecto: 'Capacidad de latencia',
    adn: 'Alta (herpesvirus, VPH)',
    arn: 'Baja o nula',
    retrovirus: 'Alta (VIH como provirus silencioso)',
  },
  {
    aspecto: 'Ejemplos',
    adn: 'Herpes simple, VPH, adenovirus, varicela-zoster',
    arn: 'Influenza, SARS-CoV-2, ébola, poliovirus',
    retrovirus: 'VIH-1, VIH-2, HTLV-1',
  },
];

// ─────────────────────────────────────────────
// Datos: Mecanismos de evasión inmune
// ─────────────────────────────────────────────

const MECANISMOS: MecanismoEvasion[] = [
  {
    titulo: 'Latencia viral',
    icono: '😴',
    descripcion:
      'Algunos virus pueden permanecer en un estado silencioso dentro de células del huésped durante años, sin replicarse activamente. En este estado, no producen proteínas virales detectables por el sistema inmune, evitando la eliminación.',
    ejemplo:
      'Herpesvirus (VHS-1, VZV): el ADN viral persiste como episoma en el núcleo de neuronas sensoriales. La reactivación ocurre ante estrés, inmunosupresión o radiación UV.',
  },
  {
    titulo: 'Variación antigénica',
    icono: '🎭',
    descripcion:
      'Los virus ARN mutan sus proteínas de superficie continuamente, generando variantes que los anticuerpos generados previamente no reconocen con la misma eficacia. Existen dos formas: drift (acumulación gradual de mutaciones) y shift (intercambio brusco de segmentos genómicos entre cepas).',
    ejemplo:
      'Influenza: el drift antigénico explica por qué se necesita una vacuna anual. El shift antigénico, posible porque el genoma está segmentado (8 fragmentos de ARN), puede producir nuevas cepas pandémicas si dos cepas de diferentes huéspedes coinfectan la misma célula.',
  },
  {
    titulo: 'Tropismo celular selectivo',
    icono: '🎯',
    descripcion:
      'La especificidad del receptor determina qué células puede infectar cada virus. Al infectar solo ciertos tipos celulares, los virus quedan fuera del alcance de mecanismos inmunes que no actúan en esos tejidos. El tropismo también limita el daño a órganos concretos.',
    ejemplo:
      'VIH: infecta principalmente linfocitos T CD4+ y macrófagos, precisamente las células que coordinarían la respuesta inmune adaptativa. Hepatitis B: solo infecta hepatocitos humanos y de chimpancé (tropismo muy estricto por co-receptor NTCP).',
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCicloViral() {
  const [etapaActiva, setEtapaActiva] = useState<number | null>(null);
  const [seccionActiva, setSeccionActiva] = useState<'adn' | 'arn' | 'retrovirus'>('arn');

  const etapa = etapaActiva !== null ? ETAPAS[etapaActiva - 1] : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcono} aria-hidden="true">🦠</span>
        <h1>Ciclo de Replicación Viral</h1>
        <p>
          Cómo los virus secuestran células para reproducirse — 6 etapas interactivas,
          estrategias ADN vs ARN y mecanismos de evasión inmune.
        </p>
      </header>

      <LegalNotice />

      {/* ─── Visualizador SVG interactivo ─────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.tituloSeccion}>Las 6 etapas del ciclo viral</h2>
        <p className={styles.subtituloSeccion}>
          Pulsa cada etapa numerada para ver el detalle del proceso
        </p>

        <div className={styles.cicloWrapper}>
          <div className={styles.svgContainer}>
            <svg
              viewBox="0 0 500 420"
              className={styles.svgCelula}
              aria-label="Diagrama interactivo del ciclo de replicación viral con 6 etapas"
              role="img"
            >
              {/* Gradiente de fondo de la célula */}
              <defs>
                <radialGradient id="gradCelula" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#E8F4F8" />
                  <stop offset="100%" stopColor="#C8E6F0" />
                </radialGradient>
                <radialGradient id="gradNucleo" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#B8D4E8" />
                  <stop offset="100%" stopColor="#90BDD8" />
                </radialGradient>
              </defs>

              {/* Célula huésped */}
              <ellipse
                cx="250"
                cy="210"
                rx="160"
                ry="140"
                fill="url(#gradCelula)"
                stroke="#48A9A6"
                strokeWidth="2.5"
                strokeDasharray="8 4"
              />

              {/* Núcleo celular */}
              <ellipse
                cx="250"
                cy="220"
                rx="65"
                ry="55"
                fill="url(#gradNucleo)"
                stroke="#2E86AB"
                strokeWidth="2"
              />

              {/* Etiqueta núcleo */}
              <text x="250" y="215" textAnchor="middle" fontSize="11" fill="#1A5C7A" fontWeight="600">
                Núcleo
              </text>
              <text x="250" y="230" textAnchor="middle" fontSize="9" fill="#2E86AB">
                (ADN celular)
              </text>

              {/* Ribosomas en el citoplasma */}
              {[
                [185, 175], [310, 185], [185, 265], [310, 270], [220, 300], [280, 155],
              ].map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="4" fill="#48A9A6" opacity="0.4" />
              ))}

              {/* Etiqueta célula */}
              <text x="250" y="365" textAnchor="middle" fontSize="11" fill="#48A9A6" fontWeight="500">
                Célula huésped
              </text>

              {/* Virión externo (etapa 1) */}
              <g transform="translate(250,40)">
                <circle r="18" fill="#E74C3C" opacity="0.85" />
                <circle r="18" fill="none" stroke="#C0392B" strokeWidth="1.5" />
                {/* Espículas */}
                {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => {
                  const rad = (ang * Math.PI) / 180;
                  return (
                    <line
                      key={i}
                      x1={Math.cos(rad) * 18}
                      y1={Math.sin(rad) * 18}
                      x2={Math.cos(rad) * 26}
                      y2={Math.sin(rad) * 26}
                      stroke="#C0392B"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  );
                })}
                <text y="5" textAnchor="middle" fontSize="10" fill="white" fontWeight="700">V</text>
              </g>

              {/* Círculos de etapas clicables */}
              {ETAPAS.map((e) => {
                const activo = etapaActiva === e.numero;
                return (
                  <g
                    key={e.numero}
                    onClick={() => setEtapaActiva(activo ? null : e.numero)}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    aria-label={`Etapa ${e.numero}: ${e.nombre}`}
                    aria-pressed={activo}
                  >
                    {/* Sombra/halo cuando activo */}
                    {activo && (
                      <circle
                        cx={e.cx}
                        cy={e.cy}
                        r="22"
                        fill="#2E86AB"
                        opacity="0.25"
                      />
                    )}
                    <circle
                      cx={e.cx}
                      cy={e.cy}
                      r="17"
                      fill={activo ? '#2E86AB' : '#FFFFFF'}
                      stroke={activo ? '#1A5C7A' : '#2E86AB'}
                      strokeWidth="2.5"
                    />
                    <text
                      x={e.cx}
                      y={e.cy - 2}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="800"
                      fill={activo ? 'white' : '#2E86AB'}
                    >
                      {e.numero}
                    </text>
                    <text
                      x={e.cx}
                      y={e.cy + 10}
                      textAnchor="middle"
                      fontSize="7"
                      fill={activo ? 'white' : '#48A9A6'}
                    >
                      {e.nombre.split(' ')[0]}
                    </text>
                  </g>
                );
              })}

              {/* Flechas indicando sentido del ciclo */}
              <path
                d="M 250 57 Q 370 80 430 130"
                fill="none"
                stroke="#2E86AB"
                strokeWidth="1.5"
                strokeDasharray="5 3"
                markerEnd="url(#arrowBlue)"
                opacity="0.5"
              />
              <path
                d="M 430 147 Q 450 210 430 290"
                fill="none"
                stroke="#2E86AB"
                strokeWidth="1.5"
                strokeDasharray="5 3"
                opacity="0.5"
              />
              <path
                d="M 430 307 Q 370 360 250 370"
                fill="none"
                stroke="#2E86AB"
                strokeWidth="1.5"
                strokeDasharray="5 3"
                opacity="0.5"
              />
              <path
                d="M 250 370 Q 130 360 70 290"
                fill="none"
                stroke="#2E86AB"
                strokeWidth="1.5"
                strokeDasharray="5 3"
                opacity="0.5"
              />
              <path
                d="M 70 290 Q 50 210 70 130"
                fill="none"
                stroke="#2E86AB"
                strokeWidth="1.5"
                strokeDasharray="5 3"
                opacity="0.5"
              />
              <path
                d="M 70 113 Q 130 60 232 42"
                fill="none"
                stroke="#2E86AB"
                strokeWidth="1.5"
                strokeDasharray="5 3"
                opacity="0.5"
              />

              <defs>
                <marker id="arrowBlue" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                  <path d="M0,0 L0,8 L8,4 z" fill="#2E86AB" opacity="0.5" />
                </marker>
              </defs>
            </svg>
          </div>

          {/* Panel de detalle de etapa */}
          <div className={styles.panelDetalle}>
            {etapa ? (
              <div className={styles.etapaCard}>
                <div className={styles.etapaHeader}>
                  <span className={styles.etapaNumero}>{etapa.numero}</span>
                  <div>
                    <span className={styles.etapaIcono} aria-hidden="true">{etapa.icono}</span>
                    <h3 className={styles.etapaNombre}>{etapa.nombre}</h3>
                  </div>
                </div>
                <p className={styles.etapaDescripcion}>{etapa.descripcion}</p>
                <div className={styles.etapaDetalle}>
                  <p>{etapa.detalle}</p>
                </div>
                <div className={styles.etapaEjemplo}>
                  <strong>Ejemplo molecular:</strong>
                  <p>{etapa.ejemplo}</p>
                </div>
                <button
                  type="button"
                  className={styles.btnCerrar}
                  onClick={() => setEtapaActiva(null)}
                  aria-label="Cerrar detalle de etapa"
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <div className={styles.panelVacio}>
                <span aria-hidden="true" className={styles.panelVacioIcono}>👆</span>
                <p>Pulsa una etapa numerada en el diagrama para ver el detalle molecular</p>
                <ul className={styles.etapaLista}>
                  {ETAPAS.map((e) => (
                    <li key={e.numero}>
                      <button
                        type="button"
                        className={styles.etapaBoton}
                        onClick={() => setEtapaActiva(e.numero)}
                      >
                        <span className={styles.etapaBotonNum}>{e.numero}</span>
                        <span>{e.nombre}</span>
                        <span aria-hidden="true">{e.icono}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Sección ADN vs ARN vs Retrovirus ─────────────── */}
      <section className={styles.section}>
        <h2 className={styles.tituloSeccion}>ADN vs ARN — dos estrategias evolutivas</h2>
        <p className={styles.subtituloSeccion}>
          La naturaleza del genoma determina cómo se replica, qué tan rápido muta y si puede
          establecer infección persistente
        </p>

        <div className={styles.tabsContainer}>
          {(['adn', 'arn', 'retrovirus'] as const).map((tipo) => (
            <button
              key={tipo}
              type="button"
              className={`${styles.tab} ${seccionActiva === tipo ? styles.tabActivo : ''}`}
              onClick={() => setSeccionActiva(tipo)}
              aria-pressed={seccionActiva === tipo}
            >
              {tipo === 'adn' ? 'Virus ADN' : tipo === 'arn' ? 'Virus ARN' : 'Retrovirus'}
            </button>
          ))}
        </div>

        <div className={styles.tablaWrapper}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Característica</th>
                <th
                  className={
                    seccionActiva === 'adn'
                      ? styles.colActiva
                      : styles.colInactiva
                  }
                >
                  Virus ADN
                </th>
                <th
                  className={
                    seccionActiva === 'arn'
                      ? styles.colActiva
                      : styles.colInactiva
                  }
                >
                  Virus ARN
                </th>
                <th
                  className={
                    seccionActiva === 'retrovirus'
                      ? styles.colActiva
                      : styles.colInactiva
                  }
                >
                  Retrovirus
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARATIVA.map((fila, i) => (
                <tr key={i}>
                  <td className={styles.celdaAspecto}>{fila.aspecto}</td>
                  <td className={seccionActiva === 'adn' ? styles.colActiva : styles.colInactiva}>
                    {fila.adn}
                  </td>
                  <td className={seccionActiva === 'arn' ? styles.colActiva : styles.colInactiva}>
                    {fila.arn}
                  </td>
                  <td className={seccionActiva === 'retrovirus' ? styles.colActiva : styles.colInactiva}>
                    {fila.retrovirus}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tarjeta de detalle según selección */}
        <div className={styles.tipoDetalle}>
          {seccionActiva === 'adn' && (
            <div className={styles.tipoCard}>
              <h3>Virus ADN: estabilidad y latencia</h3>
              <p>
                Los virus ADN tienen genomas más estables porque la ADN polimerasa incluye mecanismos
                de corrección de errores (proofreading). Esto hace que muten más lentamente, facilitando
                el desarrollo de vacunas duraderas. Muchos pueden establecer latencia integrándose o
                persistiendo como episomas en el núcleo celular.
              </p>
              <p>
                Herpesvirus simplex (VHS-1), virus varicela-zóster (VZV) y citomegalovirus (CMV) son
                ejemplos de virus ADN capaces de latencia prolongada en tejido neuronal o linfoide.
                El virus del papiloma humano (VPH) persiste como episoma en células epiteliales;
                su integración ocasional en el genoma humano puede desregular oncogenes.
              </p>
            </div>
          )}
          {seccionActiva === 'arn' && (
            <div className={styles.tipoCard}>
              <h3>Virus ARN: velocidad evolutiva</h3>
              <p>
                La ARN polimerasa dependiente de ARN (RdRp) carece de actividad correctora, por lo que
                introduce un error por cada 10.000-100.000 nucleótidos copiados, frente a 1 por cada
                10⁹ de la replicación de ADN. Esto genera cuasiespecies: nubes de variantes genéticas
                que permiten adaptación rápida a nuevos huéspedes y evasión inmune.
              </p>
              <p>
                Influenza, SARS-CoV-2, VIH (antes de la transcripción inversa) y ébola son virus ARN.
                La alta variabilidad es la razón por la que la vacuna contra la gripe debe reformularse
                cada temporada, ajustando las cepas seleccionadas según la vigilancia epidemiológica global.
              </p>
            </div>
          )}
          {seccionActiva === 'retrovirus' && (
            <div className={styles.tipoCard}>
              <h3>Retrovirus: el dogma invertido</h3>
              <p>
                Los retrovirus llevan dos copias de su genoma de ARN monocatenario y una enzima única:
                la transcriptasa inversa (TI). Esta enzima sintetiza ADN a partir del ARN viral (proceso
                que invierte el &quot;dogma central&quot; habitual de ARN→proteína). El ADN resultante
                se integra en el genoma huésped como &quot;provirus&quot;, donde puede permanecer silencioso
                indefinidamente o activarse para producir nuevos viriones.
              </p>
              <p>
                La TI también es propensa a errores: las mutaciones se acumulan al ritmo de los virus ARN,
                lo que hace muy difícil la erradicación completa. Además del VIH, el HTLV-1 (asociado
                a leucemia de células T) es otro retrovirus humano importante. Los endovirus retrovirales
                representan ~8% del genoma humano, evidencia de integraciones ancestrales.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Mecanismos de evasión inmune ─────────────────── */}
      <section className={styles.section}>
        <h2 className={styles.tituloSeccion}>Mecanismos de evasión inmune</h2>
        <p className={styles.subtituloSeccion}>
          Estrategias moleculares que permiten a ciertos virus persistir frente al sistema inmune
        </p>

        <div className={styles.evasionGrid}>
          {MECANISMOS.map((m, i) => (
            <div key={i} className={styles.evasionCard}>
              <div className={styles.evasionIcono} aria-hidden="true">{m.icono}</div>
              <h3 className={styles.evasionTitulo}>{m.titulo}</h3>
              <p className={styles.evasionDesc}>{m.descripcion}</p>
              <div className={styles.evasionEjemplo}>
                <strong>Ejemplo:</strong> {m.ejemplo}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Sección educativa v2.0 ───────────────────────── */}
      <EducationalSection
        title="Biología de los virus"
        subtitle="Parásitos moleculares obligados: por qué los virus no son células"
      >
        <div className={styles.eduGrid}>
          <div className={styles.eduCard}>
            <h4>¿Son los virus seres vivos?</h4>
            <p>
              Los virus no cumplen los criterios tradicionales de vida: no tienen metabolismo propio,
              no generan energía mediante reacciones bioquímicas internas, no pueden reproducirse de
              forma autónoma y no tienen estructura celular. Son parásitos genéticos obligados que
              solo adquieren propiedades &quot;vitales&quot; al infectar una célula huésped.
            </p>
            <p>
              Esta ambigüedad llevó al virólogo Patrick Forterre a proponer la distinción entre
              &quot;virión&quot; (la partícula extracelular, inerte) y &quot;virus&quot; (el
              programa genético en ejecución dentro de la célula). Bajo esta visión, el virus
              es el proceso, no la partícula.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h4>Estructura de un virión</h4>
            <p>
              Todo virión contiene al menos: (1) el genoma (ADN o ARN), (2) la cápside
              (proteínas que envuelven y protegen el genoma), y a veces (3) una envuelta lipídica
              derivada de la membrana del huésped, con glucoproteínas virales insertadas.
            </p>
            <p>
              La simetría de la cápside puede ser helicoidal (TMV, rabdovirus), icosaédrica
              (adenovirus, poliovirus) o compleja (bacteriófago T4). El tamaño varía de ~20 nm
              (parvovirus) a ~500 nm (mimivirus), comparable a bacterias pequeñas.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h4>Por qué los antibióticos no actúan contra virus</h4>
            <p>
              Los antibióticos tienen dianas moleculares específicas de las bacterias: la pared
              celular bacteriana (penicilina), los ribosomas 70S bacterianos (eritromicina),
              la ADN girasa bacteriana (quinolonas) o la síntesis del folato (sulfamidas). Los
              virus no tienen ninguna de estas estructuras.
            </p>
            <p>
              Los antivirales, en cambio, actúan sobre enzimas o procesos propios del virus:
              la transcriptasa inversa del VIH (análogos de nucleósidos), la neuraminidasa del
              influenza (oseltamivir), la proteasa del VIH (inhibidores de proteasa) o la RdRp
              de coronavirus (remdesivir). Al compartir maquinaria con la célula huésped, diseñar
              antivirales selectivos es más difícil que diseñar antibióticos.
            </p>
          </div>

          <div className={styles.eduCard}>
            <h4>Ciclo lítico vs. ciclo lisogénico (bacteriófagos)</h4>
            <p>
              En bacteriófagos (virus que infectan bacterias) existe una distinción clásica.
              El ciclo lítico sigue las 6 etapas del visualizador y termina en lisis bacteriana.
              El ciclo lisogénico (temperado) permite al fago integrar su ADN en el cromosoma
              bacteriano como profago, replicándose pasivamente con la bacteria durante generaciones.
              El estrés puede inducir la escisión del profago y la entrada al ciclo lítico.
            </p>
            <p>
              Este mecanismo tiene implicaciones biotecnológicas: la ingeniería de fagos lisogénicos
              es la base de técnicas de edición genética y de la CRISPR (originalmente un sistema
              inmune bacteriano contra fagos).
            </p>
          </div>
        </div>

        <div className={styles.warningBox} role="note">
          Este visualizador es biología molecular educativa. No describe síntomas ni permite
          diagnosticar ninguna infección viral. Cualquier preocupación sobre salud personal
          debe consultarse con un profesional sanitario.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-ciclo-viral')} />
      <ShareCard appName="visualizador-ciclo-viral" />
      <Footer appName="visualizador-ciclo-viral" />
    </div>
  );
}
