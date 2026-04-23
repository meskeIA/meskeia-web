'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './VisualizadorAcetilcolina.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type SistemaId = 'neuromuscular' | 'parasimpatico' | 'snc';

interface Sistema {
  id: SistemaId;
  icono: string;
  titulo: string;
  subtitulo: string;
  contenido: {
    mecanismo: string;
    detalles: string[];
    dato: string;
    toxinas?: { nombre: string; efecto: string }[];
    farmacos?: { nombre: string; efecto: string }[];
  };
}

const SISTEMAS: Sistema[] = [
  {
    id: 'neuromuscular',
    icono: '💪',
    titulo: 'Unión Neuromuscular (UNM)',
    subtitulo: 'Movimiento muscular voluntario',
    contenido: {
      mecanismo:
        'La motoneurona libera ACh en la hendidura sináptica de la UNM. La ACh se une a receptores nicotínicos (nAChR) en la membrana muscular → abre canales de Na⁺/K⁺ → potencial de acción muscular → contracción. La acetilcolinesterasa (AChE) en la hendidura degrada la ACh en acetato + colina → la colina es recaptada y reciclada.',
      detalles: [
        'Velocidad: la contracción ocurre en ~5 ms desde la liberación de ACh',
        'La AChE hidroliza ~10.000 moléculas de ACh por segundo',
        'La colina recaptada se reutiliza para sintetizar nueva ACh (ciclo cerrado)',
        'Cada terminal motor inerva entre 5 y 2.000 fibras musculares (unidad motora)',
      ],
      dato: 'La UNM es el lugar de acción de algunas de las toxinas más potentes conocidas por la ciencia.',
      toxinas: [
        {
          nombre: 'Botulinum toxin (Botox)',
          efecto:
            'Bloquea la liberación de ACh → parálisis flácida. Uso cosmético y médico (espasticidad, migraña).',
        },
        {
          nombre: 'Curare (tubocurarina)',
          efecto:
            'Antagonista competitivo nicotínico → parálisis. Usado históricamente como veneno de flecha.',
        },
        {
          nombre: 'Organofosforados',
          efecto:
            'Inhiben AChE irreversiblemente → acumulación de ACh → parálisis espástica. Gases nerviosos y pesticidas.',
        },
      ],
    },
  },
  {
    id: 'parasimpatico',
    icono: '🫀',
    titulo: 'Sistema Nervioso Autónomo Parasimpático',
    subtitulo: '"Rest and Digest" — regulación visceral',
    contenido: {
      mecanismo:
        'La ACh es el neurotransmisor de TODAS las neuronas preganglionares (simpáticas y parasimpáticas) y de las neuronas postganglionares parasimpáticas. Los receptores muscarínicos (M1-M5, GPCRs) en los órganos diana regulan las funciones vegetativas.',
      detalles: [
        'Corazón (M2): reducción de frecuencia cardíaca — el "freno vagal"',
        'Pulmones (M3): broncoconstricción y aumento de secreciones',
        'Digestivo (M3): mayor motilidad y secreciones gástricas',
        'Pupilas (M3): miosis (constricción pupilar)',
        'Vejiga (M3): contracción del detrusor → micción',
      ],
      dato:
        'Regla mnemotécnica: "Rest and Digest" — frente al "Fight or Flight" del sistema adrenérgico simpático.',
      farmacos: [
        {
          nombre: 'Atropina',
          efecto:
            'Antimuscarínico → taquicardia, midriasis, sequedad de boca, retención urinaria.',
        },
        {
          nombre: 'Escopolamina',
          efecto:
            'Antimuscarínico → previene el mareo (cinetosis) bloqueando M1 en el SNC vestibular.',
        },
        {
          nombre: 'Pilocarpina',
          efecto:
            'Agonista muscarínico → miosis y reducción de presión intraocular. Tratamiento del glaucoma.',
        },
      ],
    },
  },
  {
    id: 'snc',
    icono: '🧠',
    titulo: 'Sistema Nervioso Central — Aprendizaje y Memoria',
    subtitulo: 'Hipocampo, atención y Alzheimer',
    contenido: {
      mecanismo:
        'Neuronas colinérgicas del núcleo basal de Meynert proyectan al córtex y al hipocampo. La ACh facilita la plasticidad sináptica (LTP) y la atención sostenida. El hipocampo necesita ACh para consolidar memorias episódicas.',
      detalles: [
        'El núcleo basal de Meynert es la principal fuente de ACh para el córtex',
        'La ACh modula la LTP (potenciación a largo plazo) — base celular del aprendizaje',
        'Regula la atención selectiva y la memoria de trabajo',
        'Implicada en el ritmo theta del hipocampo (4-8 Hz) durante el aprendizaje',
      ],
      dato:
        'En la enfermedad de Alzheimer, las neuronas colinérgicas del núcleo basal de Meynert degeneran en etapas tempranas → déficit colinérgico → pérdida de memoria y atención.',
      farmacos: [
        {
          nombre: 'Donepezilo',
          efecto:
            'Inhibidor de AChE reversible → más ACh disponible en la sinapsis. Tratamiento sintomático del Alzheimer.',
        },
        {
          nombre: 'Rivastigmina',
          efecto:
            'Inhibidor de AChE y BuChE pseudo-irreversible. Tratamiento Alzheimer y demencia de Parkinson.',
        },
        {
          nombre: 'Galantamina',
          efecto:
            'Inhibidor de AChE + modulador alostérico de nAChR → doble mecanismo de acción.',
        },
      ],
    },
  },
];

interface ReceptorComparacion {
  propiedad: string;
  nicotico: string;
  muscarinico: string;
}

const TABLA_RECEPTORES: ReceptorComparacion[] = [
  { propiedad: 'Tipo', nicotico: 'Ionotrópico (canal iónico)', muscarinico: 'Metabotrópico (GPCR)' },
  { propiedad: 'Ion / mensajero', nicotico: 'Na⁺ / K⁺ (entrada directa)', muscarinico: 'K⁺, Ca²⁺ (vía proteína G)' },
  { propiedad: 'Velocidad de señal', nicotico: 'Milisegundos', muscarinico: 'Segundos' },
  {
    propiedad: 'Localización',
    nicotico: 'UNM, ganglio autónomo, SNC',
    muscarinico: 'Órganos efectores, SNC',
  },
  {
    propiedad: 'Agonista adicional',
    nicotico: 'Nicotina (cigarrillos)',
    muscarinico: 'Muscarina (Amanita muscaria)',
  },
  {
    propiedad: 'Antagonistas',
    nicotico: 'Curare, α-bungarotoxina',
    muscarinico: 'Atropina, escopolamina',
  },
  { propiedad: 'Subtipos', nicotico: 'α1-α10, β1-β4', muscarinico: 'M1 a M5' },
];

interface VenenoAChE {
  nombre: string;
  tipo: 'guerra' | 'pesticida' | 'terapeutico';
  mecanismo: string;
  efecto: string;
  tratamiento: string;
  icono: string;
}

const VENENOS_ACHE: VenenoAChE[] = [
  {
    nombre: 'Agentes nerviosos (Sarin, VX, tabún)',
    tipo: 'guerra',
    icono: '⚠️',
    mecanismo: 'Inhiben AChE irreversiblemente por fosforilación del sitio activo',
    efecto:
      'Crisis colinérgica: pupilas puntiformes (miosis), broncospasmo, secreciones, convulsiones, muerte por parálisis respiratoria',
    tratamiento: 'Atropina (antagonista muscarínico) + pralidoxima (reactiva la AChE si se da precozmente)',
  },
  {
    nombre: 'Organofosforados agrícolas (paratión, malatión)',
    tipo: 'pesticida',
    icono: '🌿',
    mecanismo: 'Mismo mecanismo que los agentes nerviosos pero menor potencia y volatilidad',
    efecto:
      'Intoxicación en agricultores: náuseas, hipersecreción, bradicardia, debilidad muscular',
    tratamiento: 'Atropina + oximas (pralidoxima). Lavado cutáneo y ropa inmediatos.',
  },
  {
    nombre: 'Inhibidores AChE terapéuticos (donepezilo, rivastigmina)',
    tipo: 'terapeutico',
    icono: '💊',
    mecanismo: 'Inhibición reversible y selectiva de AChE → más ACh disponible en la sinapsis colinérgica',
    efecto:
      'Mejora temporal de función cognitiva en Alzheimer. Sin crisis colinérgica a dosis terapéuticas.',
    tratamiento: 'No es un veneno — es tratamiento. Dosis ajustada para eficacia sin toxicidad.',
  },
];

interface DatoAlzheimer {
  edad: number;
  normal: number;
  leve: number;
  moderadoGrave: number;
}

const DATOS_ALZHEIMER: DatoAlzheimer[] = [
  { edad: 40, normal: 100, leve: 100, moderadoGrave: 100 },
  { edad: 50, normal: 95, leve: 80, moderadoGrave: 65 },
  { edad: 60, normal: 88, leve: 62, moderadoGrave: 42 },
  { edad: 70, normal: 82, leve: 52, moderadoGrave: 30 },
  { edad: 80, normal: 80, leve: 42, moderadoGrave: 20 },
  { edad: 90, normal: 78, leve: 35, moderadoGrave: 15 },
];

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function SinapsisCiclo() {
  const pasos = [
    { num: 1, texto: 'Síntesis\n(colina + acetil-CoA,\nenzima ChAT)', color: 'var(--primary)' },
    { num: 2, texto: 'Almacén\nen vesículas', color: 'var(--primary)' },
    { num: 3, texto: 'Liberación\n(PA → fusión\nvesicular)', color: '#48A9A6' },
    { num: 4, texto: 'Unión\na receptores\n→ señal', color: '#48A9A6' },
    { num: 5, texto: 'AChE hidroliza\nACh → acetato\n+ colina', color: '#E07070' },
    { num: 6, texto: 'Recaptación\nde colina\n→ resíntesis', color: 'var(--primary)' },
  ];

  return (
    <div className={styles.sinapsisCiclo} role="img" aria-label="Ciclo completo de la acetilcolina en la sinapsis">
      {pasos.map((paso, i) => (
        <div key={paso.num} className={styles.cicloItem}>
          <div className={styles.cicloNodo} style={{ borderColor: paso.color }}>
            <span className={styles.cicloNum} style={{ color: paso.color }}>{paso.num}</span>
            <span className={styles.cicloTexto}>{paso.texto}</span>
          </div>
          {i < pasos.length - 1 && (
            <span className={styles.cicloFlecha} aria-hidden="true" style={{ color: paso.color }}>
              ▼
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function GraficaAlzheimer() {
  const svgRef = useRef<SVGSVGElement>(null);
  const W = 400;
  const H = 200;
  const PAD = { top: 20, right: 20, bottom: 36, left: 44 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const edades = DATOS_ALZHEIMER.map((d) => d.edad);
  const minEdad = edades[0];
  const maxEdad = edades[edades.length - 1];

  function xPos(edad: number) {
    return PAD.left + ((edad - minEdad) / (maxEdad - minEdad)) * innerW;
  }
  function yPos(val: number) {
    return PAD.top + (1 - val / 100) * innerH;
  }

  function toPoints(key: keyof DatoAlzheimer) {
    return DATOS_ALZHEIMER.map((d) => `${xPos(d.edad)},${yPos(d[key] as number)}`).join(' ');
  }

  return (
    <div className={styles.alzheimerChart}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className={styles.svgAlzheimer}
        aria-label="Gráfico de pérdida de neuronas colinérgicas con la edad y en Alzheimer"
        role="img"
      >
        {/* Ejes */}
        <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + innerH} stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
        <line x1={PAD.left} y1={PAD.top + innerH} x2={PAD.left + innerW} y2={PAD.top + innerH} stroke="currentColor" strokeWidth="1.2" opacity="0.3" />

        {/* Líneas guía */}
        {[100, 75, 50, 25].map((v) => (
          <g key={v}>
            <line
              x1={PAD.left}
              y1={yPos(v)}
              x2={PAD.left + innerW}
              y2={yPos(v)}
              stroke="currentColor"
              strokeWidth="0.7"
              strokeDasharray="3,4"
              opacity="0.2"
            />
            <text x={PAD.left - 4} y={yPos(v) + 3} fontSize="8" fill="currentColor" opacity="0.5" textAnchor="end">
              {v}%
            </text>
          </g>
        ))}

        {/* Etiquetas eje X */}
        {DATOS_ALZHEIMER.map((d) => (
          <text key={d.edad} x={xPos(d.edad)} y={H - PAD.bottom + 12} fontSize="8" fill="currentColor" opacity="0.6" textAnchor="middle">
            {d.edad}
          </text>
        ))}
        <text x={PAD.left + innerW / 2} y={H - 2} fontSize="8" fill="currentColor" opacity="0.5" textAnchor="middle">
          Edad
        </text>

        {/* Curva envejecimiento normal */}
        <polyline
          points={toPoints('normal')}
          fill="none"
          stroke="#48A9A6"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Curva Alzheimer leve */}
        <polyline
          points={toPoints('leve')}
          fill="none"
          stroke="#E0A030"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Curva Alzheimer moderado/grave */}
        <polyline
          points={toPoints('moderadoGrave')}
          fill="none"
          stroke="#E07070"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Leyenda */}
        <rect x={PAD.left + 4} y={PAD.top + 2} width="10" height="3" fill="#48A9A6" />
        <text x={PAD.left + 18} y={PAD.top + 7} fontSize="7.5" fill="currentColor">Envejecimiento normal</text>
        <rect x={PAD.left + 4} y={PAD.top + 13} width="10" height="3" fill="#E0A030" />
        <text x={PAD.left + 18} y={PAD.top + 18} fontSize="7.5" fill="currentColor">Alzheimer leve</text>
        <rect x={PAD.left + 4} y={PAD.top + 24} width="10" height="3" fill="#E07070" />
        <text x={PAD.left + 18} y={PAD.top + 29} fontSize="7.5" fill="currentColor">Alzheimer moderado/grave</text>
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorAcetilcolina() {
  const [sistemaActivo, setSistemaActivo] = useState<SistemaId>('neuromuscular');
  const [cicloAnimando, setCicloAnimando] = useState(false);
  const relacionadas = getRelatedApps('visualizador-acetilcolina');

  const sistema = SISTEMAS.find((s) => s.id === sistemaActivo)!;

  useEffect(() => {
    setCicloAnimando(false);
    const t = setTimeout(() => setCicloAnimando(true), 50);
    return () => clearTimeout(t);
  }, [sistemaActivo]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>NEUROCIENCIA</span>
          <h1 className={styles.heroTitle}>Acetilcolina: El Primer Neurotransmisor Descubierto</h1>
          <p className={styles.heroSubtitle}>Mueve tus músculos, forma tus recuerdos y regula tus órganos</p>
          <p className={styles.heroDesc}>
            La acetilcolina fue el primer neurotransmisor identificado (Otto Loewi, 1921). Actúa en la
            unión neuromuscular, el sistema nervioso autónomo parasimpático y los circuitos de memoria
            del hipocampo. Su déficit es central en el Alzheimer.
          </p>
        </div>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="medical" severity="low" collapsible={true} />

      {/* ── SECCIÓN 1: Los 3 sistemas ── */}
      <section className={styles.section} aria-labelledby="titulo-sistemas">
        <h2 id="titulo-sistemas" className={styles.sectionTitle}>
          Los 3 sistemas donde actúa la ACh
        </h2>
        <p className={styles.sectionDesc}>
          La acetilcolina no tiene un único rol: actúa en tres sistemas distintos con receptores y
          efectos diferentes. Selecciona cada sistema para explorar su mecanismo.
        </p>

        <div className={styles.sistemasNav} role="tablist" aria-label="Sistemas de la acetilcolina">
          {SISTEMAS.map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={s.id === sistemaActivo}
              aria-controls={`panel-${s.id}`}
              className={`${styles.sistemaBtn} ${s.id === sistemaActivo ? styles.sistemaBtnActivo : ''}`}
              onClick={() => setSistemaActivo(s.id)}
            >
              <span aria-hidden="true">{s.icono}</span>
              <span>{s.titulo}</span>
            </button>
          ))}
        </div>

        <div
          id={`panel-${sistema.id}`}
          role="tabpanel"
          aria-label={sistema.titulo}
          className={`${styles.sistemaPanel} ${cicloAnimando ? styles.sistemaPanelVisible : ''}`}
        >
          <div className={styles.sistemaPanelGrid}>
            <div className={styles.sistemaMecanismo}>
              <h3 className={styles.sistemaPanelTitulo}>{sistema.titulo}</h3>
              <p className={styles.sistemaPanelSubtitulo}>{sistema.subtitulo}</p>
              <p className={styles.sistemaMecanismoTexto}>{sistema.contenido.mecanismo}</p>
              <ul className={styles.sistemaDetalles}>
                {sistema.contenido.detalles.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
              <div className={styles.insightBox}>
                <span aria-hidden="true">💡</span> {sistema.contenido.dato}
              </div>
            </div>

            <div className={styles.sistemaFarmacos}>
              {sistema.contenido.toxinas && (
                <>
                  <h4 className={styles.farmacosTitulo}>Toxinas que actúan aquí</h4>
                  <div className={styles.farmacosGrid}>
                    {sistema.contenido.toxinas.map((t) => (
                      <div key={t.nombre} className={`${styles.farmacoCard} ${styles.farmacoCardToxina}`}>
                        <strong className={styles.farmacoNombre}>{t.nombre}</strong>
                        <p className={styles.farmacoEfecto}>{t.efecto}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {sistema.contenido.farmacos && (
                <>
                  <h4 className={styles.farmacosTitulo}>Fármacos que actúan aquí</h4>
                  <div className={styles.farmacosGrid}>
                    {sistema.contenido.farmacos.map((f) => (
                      <div key={f.nombre} className={`${styles.farmacoCard} ${styles.farmacoCardFarmaco}`}>
                        <strong className={styles.farmacoNombre}>{f.nombre}</strong>
                        <p className={styles.farmacoEfecto}>{f.efecto}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── SECCIÓN 2: Receptores nicotínicos vs muscarínicos ── */}
      <section className={styles.section} aria-labelledby="titulo-receptores">
        <h2 id="titulo-receptores" className={styles.sectionTitle}>
          Receptores nicotínicos vs. muscarínicos
        </h2>
        <p className={styles.sectionDesc}>
          La ACh actúa sobre dos familias de receptores completamente distintas en estructura,
          mecanismo y velocidad. El nombre de cada familia viene de los agonistas que los descubrieron.
        </p>

        <div className={styles.tablaReceptoresWrapper}>
          <table className={styles.tablaReceptores} aria-label="Comparación receptores nicotínicos y muscarínicos">
            <thead>
              <tr>
                <th scope="col">Propiedad</th>
                <th scope="col" className={styles.thNico}>Nicotínicos (nAChR)</th>
                <th scope="col" className={styles.thMusc}>Muscarínicos (mAChR)</th>
              </tr>
            </thead>
            <tbody>
              {TABLA_RECEPTORES.map((fila, i) => (
                <tr key={fila.propiedad} className={i % 2 === 0 ? styles.trPar : styles.trImpar}>
                  <td className={styles.tdPropiedad}>{fila.propiedad}</td>
                  <td className={styles.tdNico}>{fila.nicotico}</td>
                  <td className={styles.tdMusc}>{fila.muscarinico}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.insightBox} style={{ marginTop: '1.5rem' }}>
          <span aria-hidden="true">🍄</span> El nombre <strong>nicotínico</strong> viene de la nicotina
          del tabaco, que activa selectivamente estos receptores. El nombre <strong>muscarínico</strong> viene
          de la muscarina de la seta venenosa <em>Amanita muscaria</em>.
        </div>
      </section>

      {/* ── SECCIÓN 3: Ciclo de la AChE ── */}
      <section className={styles.section} aria-labelledby="titulo-ache">
        <h2 id="titulo-ache" className={styles.sectionTitle}>
          La acetilcolinesterasa: la enzima que termina la señal
        </h2>
        <p className={styles.sectionDesc}>
          La AChE es una de las enzimas más rápidas conocidas. Sin ella, la ACh se acumularía en la
          sinapsis y la señal nunca cesaría. Muchas toxinas y fármacos actúan precisamente sobre ella.
        </p>

        <SinapsisCiclo />

        <h3 className={styles.subsectionTitle}>Tres tipos de agentes que afectan a la AChE</h3>
        <div className={styles.venosasGrid}>
          {VENENOS_ACHE.map((v) => (
            <div
              key={v.nombre}
              className={`${styles.venenoCard} ${
                v.tipo === 'guerra'
                  ? styles.venenoCardGuerra
                  : v.tipo === 'pesticida'
                  ? styles.venenoCardPesticida
                  : styles.venenoCardTerapeutico
              }`}
            >
              <div className={styles.venenoHeader}>
                <span className={styles.venenoIcono} aria-hidden="true">{v.icono}</span>
                <strong className={styles.venenoNombre}>{v.nombre}</strong>
              </div>
              <dl className={styles.venenovDL}>
                <dt>Mecanismo</dt>
                <dd>{v.mecanismo}</dd>
                <dt>Efecto</dt>
                <dd>{v.efecto}</dd>
                <dt>Respuesta</dt>
                <dd>{v.tratamiento}</dd>
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECCIÓN 4: Alzheimer ── */}
      <section className={styles.section} aria-labelledby="titulo-alzheimer">
        <h2 id="titulo-alzheimer" className={styles.sectionTitle}>
          La conexión Alzheimer: hipótesis colinérgica
        </h2>
        <p className={styles.sectionDesc}>
          La pérdida de neuronas colinérgicas es uno de los hallazgos más consistentes en la enfermedad
          de Alzheimer. Esta relación dio lugar a la hipótesis colinérgica y a los primeros tratamientos.
        </p>

        <div className={styles.alzheimerLayout}>
          <GraficaAlzheimer />

          <div className={styles.alzheimerPanel}>
            <h3 className={styles.alzheimerPanelTitulo}>Hipótesis colinérgica (años 80)</h3>
            <p>
              El déficit de ACh en el córtex e hipocampo causa los síntomas cognitivos del Alzheimer.
              Esta teoría llevó al desarrollo de los inhibidores de AChE (iAChE) como primera línea
              de tratamiento farmacológico.
            </p>
            <h3 className={styles.alzheimerPanelTitulo}>Limitaciones conocidas</h3>
            <p>
              Los iAChE son <strong>sintomáticos</strong>: mejoran temporalmente la función cognitiva
              pero no modifican la enfermedad. Las placas de amiloide-β y los ovillos de proteína tau
              aparecen <em>antes</em> del déficit colinérgico severo.
            </p>
            <h3 className={styles.alzheimerPanelTitulo}>Estado actual</h3>
            <p>
              La investigación se centra en tau y amiloide (anticuerpos monoclonales: lecanemab,
              donanemab), pero los iAChE siguen siendo el tratamiento farmacológico estándar para
              síntomas cognitivos.
            </p>
          </div>
        </div>
      </section>

      {/* ── SECCIÓN EDUCATIVA ── */}
      <EducationalSection
        title="Más sobre la acetilcolina y el sistema colinérgico"
        subtitle="Descubrimiento, Alzheimer, nicotina y toxinas fascinantes"
      >
        <h3>Historia del descubrimiento: el sueño de Otto Loewi</h3>
        <p>
          En 1921, el farmacólogo austriaco Otto Loewi soñó un experimento que repetiría al despertarse:
          tomó dos corazones de rana, estimuló el nervio vago del primero y recogió el líquido que lo
          rodeaba. Al aplicar ese líquido al segundo corazón (sin estimulación nerviosa), este también
          ralentizó su ritmo. Loewi llamó al factor activo <em>Vagusstoff</em> (sustancia vagal). Era
          la primera demostración de que la señal nerviosa era química, no eléctrica. En 1936 recibió el
          Premio Nobel compartido con Henry Dale, quien identificó la sustancia como acetilcolina.
        </p>

        <h3>La nicotina del tabaco y el sistema colinérgico</h3>
        <p>
          La nicotina activa los receptores nAChR en el núcleo accumbens → libera dopamina → refuerzo
          positivo. Esta es la base neurológica de la adicción al tabaco. Los parches y chicles de nicotina
          usan este mismo mecanismo de forma controlada para reducir el síndrome de abstinencia. La
          vareniclina (Champix) actúa como agonista parcial de nAChR: satura parcialmente el receptor
          para reducir el ansia, sin el pico de dopamina completo.
        </p>

        <h3>Miastenia gravis: el sistema inmune vs. la UNM</h3>
        <p>
          La miastenia gravis es una enfermedad autoinmune en la que anticuerpos atacan y destruyen los
          receptores nicotínicos (nAChR) de la unión neuromuscular. El resultado es debilidad muscular
          fluctuante que empeora con el esfuerzo y mejora con el reposo. El tratamiento incluye
          inhibidores de AChE (para compensar con más ACh disponible), inmunosupresores y timectomía
          (el timo produce los anticuerpos patológicos en muchos casos).
        </p>

        <h3>La araña viuda negra: lo opuesto al Botox</h3>
        <p>
          La α-latrotoxina del veneno de la araña viuda negra (<em>Latrodectus</em>) provoca el efecto
          contrario al Botox: desencadena una liberación masiva y no controlada de ACh en la UNM →
          espasmos musculares intensos, dolor, taquicardia. Es el mejor ejemplo para entender que tanto
          el déficit como el exceso de señal colinérgica son peligrosos.
        </p>

        <div className={styles.warningBox} role="note">
          <strong>Nota educativa:</strong> Este visualizador explica mecanismos neurobiológicos con fines
          educativos. El Alzheimer y otras enfermedades del sistema colinérgico requieren diagnóstico y
          tratamiento médico especializado. La información aquí presentada no sustituye la consulta con
          un profesional de la salud.
        </div>
      </EducationalSection>

      <RelatedApps apps={relacionadas} />
      <ShareCard appName="visualizador-acetilcolina" />
      <Footer appName="visualizador-acetilcolina" />
    </div>
  );
}
