'use client';
// @disclaimer: exempt
import { useState } from 'react';
import styles from './VisualizadorPiel.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

// ── Tipos ──────────────────────────────────────────────────────────────────

type SeccionId = 'capas' | 'funciones' | 'cicatrizacion' | 'fototipo';

interface CapaPiel {
  id: string;
  nombre: string;
  profundidad: string;
  color: string;
  colorDark: string;
  grosor: string;
  celulas: string;
  funciones: string[];
  subcapas?: string[];
  curiosidad: string;
}

interface FuncionPiel {
  id: string;
  icono: string;
  titulo: string;
  mecanismo: string;
  detalle: string;
}

interface FaseCicatrizacion {
  id: string;
  numero: number;
  nombre: string;
  icono: string;
  duracion: string;
  descripcion: string;
  procesoClave: string[];
  color: string;
}

interface FototipoPiel {
  numero: number;
  nombre: string;
  descripcion: string;
  colorPiel: string;
  ojos: string;
  pelo: string;
  respuestaSol: string;
  recomendacion: string;
  spf: string;
}

// ── Datos ──────────────────────────────────────────────────────────────────

const CAPAS: CapaPiel[] = [
  {
    id: 'epidermis',
    nombre: 'Epidermis',
    profundidad: 'Capa más externa',
    color: '#F4C87E',
    colorDark: '#C8943A',
    grosor: '0,05–1,5 mm',
    celulas: 'Queratinocitos (90%), melanocitos, células de Langerhans',
    funciones: [
      'Primera barrera física frente a agresiones externas',
      'Síntesis de vitamina D con radiación UV',
      'Pigmentación y protección solar (melanina)',
      'Defensa inmune (células de Langerhans)',
    ],
    subcapas: [
      'Estrato córneo — células muertas queratinizadas (barrera principal)',
      'Estrato lúcido — solo en palmas y plantas',
      'Estrato granuloso — síntesis de lípidos barrera',
      'Estrato espinoso — señalización y cohesión celular',
      'Estrato basal — células madre que renuevan la epidermis',
    ],
    curiosidad:
      'La epidermis se renueva completamente cada 27 días. Las células nacen en el estrato basal y emigran hacia la superficie mientras se queratinizan, muriendo al llegar al estrato córneo.',
  },
  {
    id: 'dermis',
    nombre: 'Dermis',
    profundidad: 'Capa intermedia',
    color: '#E88C7D',
    colorDark: '#B05545',
    grosor: '1–4 mm',
    celulas: 'Fibroblastos, mastocitos, macrófagos',
    funciones: [
      'Soporte estructural y elasticidad (colágeno y elastina)',
      'Red vascular: nutrición y termorregulación',
      'Inervación táctil: presión, temperatura, dolor',
      'Folículos pilosos y glándulas sebáceas',
      'Respuesta inmune local',
    ],
    subcapas: [
      'Dermis papilar — delgada, rica en terminaciones nerviosas y capilares',
      'Dermis reticular — gruesa, colágeno denso y fibras elásticas',
    ],
    curiosidad:
      'El colágeno de la dermis representa el 70% de su peso seco. Con la edad, su producción disminuye y las fibras se fragmentan, causando la pérdida de firmeza y las arrugas.',
  },
  {
    id: 'hipodermis',
    nombre: 'Hipodermis',
    profundidad: 'Capa más profunda',
    color: '#F4E2A0',
    colorDark: '#C8B050',
    grosor: 'Variable (1–30 mm)',
    celulas: 'Adipocitos, fibroblastos, macrófagos',
    funciones: [
      'Almacén de energía en forma de grasa',
      'Aislamiento térmico y amortiguación mecánica',
      'Anclaje de la piel a músculos y huesos',
      'Órgano endocrino: secreción de leptina',
    ],
    curiosidad:
      'La hipodermis no es una capa uniforme: su grosor varía enormemente según la zona del cuerpo, el sexo y el estado nutricional. En párpados apenas existe; en abdomen puede superar los 10 cm.',
  },
];

const FUNCIONES: FuncionPiel[] = [
  {
    id: 'proteccion',
    icono: '🛡️',
    titulo: 'Protección física y química',
    mecanismo: 'Barrera epitelial',
    detalle:
      'El estrato córneo actúa como un muro de ladrillos: células muertas queratinizadas embebidas en lípidos. Resiste la abrasión mecánica, bloquea la entrada de patógenos y limita la pérdida de agua transepidérmica (TEWL). El pH ácido de la superficie (~4,5–5,5) inhibe el crecimiento bacteriano.',
  },
  {
    id: 'termorregulacion',
    icono: '🌡️',
    titulo: 'Termorregulación',
    mecanismo: 'Sudoración + vasodilatación/constricción',
    detalle:
      'Ante el calor: las glándulas ecrinas segregan sudor (hasta 10 L/día en esfuerzo intenso) que al evaporarse enfría la piel. Los vasos dérmicos se dilatan para liberar calor. Ante el frío: vasoconstricción reduce la pérdida de calor y la pilo-erección atrapa aire como aislante.',
  },
  {
    id: 'sensacion',
    icono: '✋',
    titulo: 'Percepción táctil',
    mecanismo: 'Mecanorreceptores y nociceptores',
    detalle:
      'La dermis contiene cuatro tipos de mecanorreceptores: corpúsculos de Meissner (tacto fino, yemas), corpúsculos de Pacini (vibración y presión), corpúsculos de Ruffini (estiramiento) y discos de Merkel (presión sostenida). Los nociceptores libres detectan dolor, temperatura extrema y prurito.',
  },
  {
    id: 'vitamina-d',
    icono: '☀️',
    titulo: 'Síntesis de vitamina D',
    mecanismo: 'Fotosíntesis cutánea',
    detalle:
      'La radiación UVB (290–315 nm) convierte el 7-dehidrocolesterol de la epidermis en pre-vitamina D3, que se isomeriza espontáneamente en vitamina D3. Esta se activa en hígado y riñón. Solo 15–20 min de exposición solar en cara y brazos con piel clara producen 1.000–3.000 UI al día.',
  },
  {
    id: 'inmune',
    icono: '🦠',
    titulo: 'Barrera inmune',
    mecanismo: 'Células de Langerhans + microbioma',
    detalle:
      'Las células de Langerhans son células dendríticas residentes en la epidermis que capturan antígenos y los presentan a los linfocitos T. El microbioma cutáneo (>1 millón de bacterias/cm²) compite con patógenos y modula la respuesta inflamatoria local.',
  },
  {
    id: 'hidratacion',
    icono: '💧',
    titulo: 'Regulación hídrica',
    mecanismo: 'TEWL y función barrera',
    detalle:
      'La piel controla la pérdida de agua transepidérmica (TEWL) mediante los lípidos del estrato córneo: ceramidas, ácidos grasos y colesterol. En condiciones normales se pierden 300–500 mL/día. Una barrera dañada (eccema, quemadura) puede multiplicar esta pérdida por 10, con riesgo vital en grandes quemados.',
  },
];

const FASES_CICATRIZACION: FaseCicatrizacion[] = [
  {
    id: 'hemostasia',
    numero: 1,
    nombre: 'Hemostasia',
    icono: '🩸',
    duracion: '0–10 minutos',
    descripcion:
      'Respuesta inmediata al daño vascular. Los vasos se contraen (vasoconstricción) y las plaquetas se activan formando un trombo provisional. La cascada de coagulación genera fibrina que estabiliza el coágulo.',
    procesoClave: [
      'Vasoconstricción refleja',
      'Adhesión y agregación plaquetaria',
      'Cascada de coagulación → fibrina',
      'Formación del coágulo provisional',
    ],
    color: '#C0392B',
  },
  {
    id: 'inflamacion',
    numero: 2,
    nombre: 'Inflamación',
    icono: '🔴',
    duracion: '1–4 días',
    descripcion:
      'Vasodilatación y aumento de permeabilidad vascular. Los neutrófilos llegan primero para limpiar bacterias y tejido muerto; los macrófagos los sustituyen y orquestan la reparación liberando factores de crecimiento (VEGF, PDGF, TGF-β).',
    procesoClave: [
      'Vasodilatación e infiltrado neutrofílico',
      'Fagocitosis de patógenos y detritus',
      'Reclutamiento de macrófagos',
      'Liberación de factores de crecimiento',
    ],
    color: '#E74C3C',
  },
  {
    id: 'proliferacion',
    numero: 3,
    nombre: 'Proliferación',
    icono: '🌱',
    duracion: '4–21 días',
    descripcion:
      'Los fibroblastos migran y sintetizan colágeno tipo III (provisional). Se forma tejido de granulación vascularizado. Los queratinocitos reepitelizan la superficie desde los bordes de la herida y desde los folículos pilosos.',
    procesoClave: [
      'Síntesis de colágeno tipo III por fibroblastos',
      'Angiogénesis: nuevos capilares (VEGF)',
      'Formación de tejido de granulación',
      'Reepitelización (queratinocitos)',
    ],
    color: '#27AE60',
  },
  {
    id: 'remodelado',
    numero: 4,
    nombre: 'Remodelado',
    icono: '🔧',
    duracion: '21 días – 2 años',
    descripcion:
      'El colágeno tipo III se sustituye progresivamente por colágeno tipo I más resistente. Las metaloproteasas de matriz (MMP) reorganizan el tejido. La resistencia de la cicatriz aumenta pero nunca supera el 80% de la piel original.',
    procesoClave: [
      'Sustitución colágeno III → colágeno I',
      'Reorganización de fibras (MMPs)',
      'Contracción de la herida (miofibroblastos)',
      'Maduración: la cicatriz palidece y se aplana',
    ],
    color: '#2E86AB',
  },
];

const FOTOTIPOS: FototipoPiel[] = [
  {
    numero: 1,
    nombre: 'Fototipo I — Muy claro',
    descripcion: 'Piel muy pálida, pecas frecuentes',
    colorPiel: '#FFE0C0',
    ojos: 'Azules o verdes',
    pelo: 'Rubio o pelirrojo',
    respuestaSol: 'Siempre se quema, nunca se broncea',
    recomendacion: 'Evitar exposición directa. Sombra obligatoria en horas centrales.',
    spf: 'SPF 50+',
  },
  {
    numero: 2,
    nombre: 'Fototipo II — Claro',
    descripcion: 'Piel clara, puede tener pecas',
    colorPiel: '#FCCFA0',
    ojos: 'Azules, verdes o grises',
    pelo: 'Rubio o castaño claro',
    respuestaSol: 'Casi siempre se quema, bronceado mínimo',
    recomendacion: 'Protección alta todo el año. Limitada exposición solar directa.',
    spf: 'SPF 50',
  },
  {
    numero: 3,
    nombre: 'Fototipo III — Intermedio',
    descripcion: 'Piel beige o morena clara',
    colorPiel: '#E8B080',
    ojos: 'Castaños o grises',
    pelo: 'Castaño',
    respuestaSol: 'A veces se quema, se broncea gradualmente',
    recomendacion: 'Protección media-alta. Puede exponerse moderadamente.',
    spf: 'SPF 30–50',
  },
  {
    numero: 4,
    nombre: 'Fototipo IV — Mediterráneo',
    descripcion: 'Piel morena u olivácea',
    colorPiel: '#C88050',
    ojos: 'Castaños oscuros',
    pelo: 'Castaño oscuro o negro',
    respuestaSol: 'Raramente se quema, bronceado fácil',
    recomendacion: 'Protección media. El bronceado no elimina el riesgo de cáncer de piel.',
    spf: 'SPF 20–30',
  },
  {
    numero: 5,
    nombre: 'Fototipo V — Oscuro',
    descripcion: 'Piel marrón oscura',
    colorPiel: '#8B5020',
    ojos: 'Oscuros',
    pelo: 'Negro',
    respuestaSol: 'Muy raramente se quema, bronceado intenso',
    recomendacion: 'Protección baja-media. Riesgo menor de quemadura pero no nulo.',
    spf: 'SPF 15–20',
  },
  {
    numero: 6,
    nombre: 'Fototipo VI — Muy oscuro',
    descripcion: 'Piel muy oscura o negra',
    colorPiel: '#4A2010',
    ojos: 'Muy oscuros',
    pelo: 'Negro',
    respuestaSol: 'Casi nunca se quema, sin bronceado visible',
    recomendacion: 'Protección solar igualmente recomendada. Mayor riesgo de déficit de vitamina D.',
    spf: 'SPF 15',
  },
];

const SECCIONES: { id: SeccionId; label: string; icono: string }[] = [
  { id: 'capas', label: 'Capas', icono: '🔬' },
  { id: 'funciones', label: 'Funciones', icono: '⚙️' },
  { id: 'cicatrizacion', label: 'Cicatrización', icono: '🩹' },
  { id: 'fototipo', label: 'Fototipos', icono: '🌞' },
];

// ── Componente principal ───────────────────────────────────────────────────

export default function VisualizadorPiel() {
  const [seccionActiva, setSeccionActiva] = useState<SeccionId>('capas');
  const [capaSeleccionada, setCapaSeleccionada] = useState<string>('epidermis');
  const [funcionExpandida, setFuncionExpandida] = useState<string | null>(null);
  const [faseActiva, setFaseActiva] = useState<string>('hemostasia');
  const [fototipoSeleccionado, setFototipoSeleccionado] = useState<number>(3);

  const capa = CAPAS.find((c) => c.id === capaSeleccionada) ?? CAPAS[0];
  const fase = FASES_CICATRIZACION.find((f) => f.id === faseActiva) ?? FASES_CICATRIZACION[0];
  const fototipo = FOTOTIPOS.find((f) => f.numero === fototipoSeleccionado) ?? FOTOTIPOS[2];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>🧬 Visualizador de la Piel</h1>
        <p>Explora las capas de la piel, sus funciones y mecanismos de protección</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Navegación de secciones */}
        <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
          {SECCIONES.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navBtnActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span aria-hidden="true">{s.icono}</span>
              {s.label}
            </button>
          ))}
        </nav>

        {/* ── Sección: Capas ── */}
        {seccionActiva === 'capas' && (
          <section className={styles.seccion}>
            <h2 className={styles.sectionTitle}>Estructura de la piel</h2>
            <p className={styles.subtitulo}>
              La piel tiene 3 capas principales con funciones complementarias. Pulsa cada capa para explorar sus detalles.
            </p>

            <div className={styles.pielesDiagrama}>
              {/* Diagrama visual de corte */}
              <div className={styles.cortePiel} aria-label="Diagrama de corte transversal de la piel">
                {CAPAS.map((c, idx) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`${styles.capaBtn} ${capaSeleccionada === c.id ? styles.capaBtnActivo : ''}`}
                    style={
                      {
                        '--capa-color': c.color,
                        '--capa-height': idx === 0 ? '80px' : idx === 1 ? '110px' : '90px',
                      } as React.CSSProperties
                    }
                    onClick={() => setCapaSeleccionada(c.id)}
                    aria-pressed={capaSeleccionada === c.id}
                  >
                    <span className={styles.capaEtiqueta}>{c.nombre}</span>
                    <span className={styles.capaGrosor}>{c.grosor}</span>
                  </button>
                ))}
              </div>

              {/* Detalle de la capa seleccionada */}
              <div className={styles.capaDetalle} style={{ borderColor: capa.color }}>
                <div className={styles.capaDetalleHeader} style={{ background: capa.color }}>
                  <h3>{capa.nombre}</h3>
                  <span className={styles.capaProfundidad}>{capa.profundidad}</span>
                </div>

                <div className={styles.capaDetalleBody}>
                  <div className={styles.capaInfo}>
                    <div className={styles.capaInfoItem}>
                      <span className={styles.capaInfoLabel}>Grosor:</span>
                      <span>{capa.grosor}</span>
                    </div>
                    <div className={styles.capaInfoItem}>
                      <span className={styles.capaInfoLabel}>Células:</span>
                      <span>{capa.celulas}</span>
                    </div>
                  </div>

                  {capa.subcapas && (
                    <div className={styles.subcapasBox}>
                      <h4>Subcapas</h4>
                      <ul>
                        {capa.subcapas.map((sub, i) => (
                          <li key={i}>{sub}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className={styles.capaFunciones}>
                    <h4>Funciones principales</h4>
                    <ul>
                      {capa.funciones.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>

                  <div className={styles.capaCuriosidad}>
                    <span aria-hidden="true">💡</span>
                    <p>{capa.curiosidad}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Datos generales */}
            <div className={styles.datosGenerales}>
              <div className={styles.datoCard}>
                <span className={styles.datoIcono} aria-hidden="true">📐</span>
                <span className={styles.datoValor}>~2 m²</span>
                <span className={styles.datoLabel}>Superficie total</span>
              </div>
              <div className={styles.datoCard}>
                <span className={styles.datoIcono} aria-hidden="true">📏</span>
                <span className={styles.datoValor}>1,5–4 mm</span>
                <span className={styles.datoLabel}>Grosor medio</span>
              </div>
              <div className={styles.datoCard}>
                <span className={styles.datoIcono} aria-hidden="true">🔄</span>
                <span className={styles.datoValor}>27 días</span>
                <span className={styles.datoLabel}>Renovación completa</span>
              </div>
              <div className={styles.datoCard}>
                <span className={styles.datoIcono} aria-hidden="true">🦠</span>
                <span className={styles.datoValor}>1 M/cm²</span>
                <span className={styles.datoLabel}>Células por cm²</span>
              </div>
            </div>
          </section>
        )}

        {/* ── Sección: Funciones ── */}
        {seccionActiva === 'funciones' && (
          <section className={styles.seccion}>
            <h2 className={styles.sectionTitle}>Funciones de la piel</h2>
            <p className={styles.subtitulo}>
              La piel realiza 6 funciones vitales coordinadas. Pulsa cada tarjeta para ver el mecanismo fisiológico.
            </p>

            <div className={styles.funcionesGrid}>
              {FUNCIONES.map((f) => (
                <div
                  key={f.id}
                  className={`${styles.funcionCard} ${funcionExpandida === f.id ? styles.funcionCardExpandida : ''}`}
                >
                  <button
                    type="button"
                    className={styles.funcionBtn}
                    onClick={() => setFuncionExpandida(funcionExpandida === f.id ? null : f.id)}
                    aria-expanded={funcionExpandida === f.id}
                  >
                    <span className={styles.funcionIcono} aria-hidden="true">{f.icono}</span>
                    <div className={styles.funcionTexto}>
                      <span className={styles.funcionTitulo}>{f.titulo}</span>
                      <span className={styles.funcionMecanismo}>{f.mecanismo}</span>
                    </div>
                    <span className={styles.funcionChevron} aria-hidden="true">
                      {funcionExpandida === f.id ? '▲' : '▼'}
                    </span>
                  </button>

                  {funcionExpandida === f.id && (
                    <div className={styles.funcionDetalle}>
                      <p>{f.detalle}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Sección: Cicatrización ── */}
        {seccionActiva === 'cicatrizacion' && (
          <section className={styles.seccion}>
            <h2 className={styles.sectionTitle}>El proceso de cicatrización</h2>
            <p className={styles.subtitulo}>
              Una herida activa 4 fases secuenciales y coordinadas. Pulsa cada fase para ver qué ocurre a nivel celular.
            </p>

            {/* Timeline */}
            <div className={styles.timeline}>
              {FASES_CICATRIZACION.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`${styles.faseBtn} ${faseActiva === f.id ? styles.faseBtnActiva : ''}`}
                  style={{ '--fase-color': f.color } as React.CSSProperties}
                  onClick={() => setFaseActiva(f.id)}
                  aria-pressed={faseActiva === f.id}
                >
                  <span className={styles.faseNumero}>{f.numero}</span>
                  <span className={styles.faseIcono} aria-hidden="true">{f.icono}</span>
                  <span className={styles.faseNombreBtn}>{f.nombre}</span>
                  <span className={styles.faseDuracionBtn}>{f.duracion}</span>
                </button>
              ))}
            </div>

            {/* Detalle de fase */}
            <div className={styles.faseDetalle} style={{ borderColor: fase.color }}>
              <div className={styles.faseDetalleHeader} style={{ background: fase.color }}>
                <span aria-hidden="true">{fase.icono}</span>
                <div>
                  <h3>Fase {fase.numero}: {fase.nombre}</h3>
                  <span className={styles.faseDuracion}><span aria-hidden="true">⏱</span> {fase.duracion}</span>
                </div>
              </div>

              <div className={styles.faseDetalleBody}>
                <p className={styles.faseDescripcion}>{fase.descripcion}</p>

                <div className={styles.faseProcesos}>
                  <h4>Procesos clave</h4>
                  <ul>
                    {fase.procesoClave.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className={styles.warningBox}>
              <h3><span aria-hidden="true">⚠️</span> La cicatriz nunca es idéntica a la piel original</h3>
              <p>
                Incluso tras el remodelado completo, la cicatriz solo alcanza el 70–80% de la resistencia de la piel original. No contiene folículos pilosos ni glándulas sudoríparas y tiene menor elasticidad. En cicatrices queloides y cicatrices hipertróficas, la producción de colágeno se desregula generando un tejido elevado y duro.
              </p>
            </div>
          </section>
        )}

        {/* ── Sección: Fototipo ── */}
        {seccionActiva === 'fototipo' && (
          <section className={styles.seccion}>
            <h2 className={styles.sectionTitle}>Escala de fototipos de Fitzpatrick</h2>
            <p className={styles.subtitulo}>
              La escala Fitzpatrick clasifica la piel en 6 fototipos según su respuesta a la radiación UV. Selecciona el que mejor te describe para ver las recomendaciones de protección.
            </p>

            {/* Selector visual */}
            <div className={styles.fototiposSelector}>
              {FOTOTIPOS.map((ft) => (
                <button
                  key={ft.numero}
                  type="button"
                  className={`${styles.fototipoBtn} ${fototipoSeleccionado === ft.numero ? styles.fototipoBtnActivo : ''}`}
                  style={{ '--fototipo-color': ft.colorPiel } as React.CSSProperties}
                  onClick={() => setFototipoSeleccionado(ft.numero)}
                  aria-pressed={fototipoSeleccionado === ft.numero}
                  aria-label={`Fototipo ${ft.numero}`}
                >
                  <span className={styles.fototipoCirculo} style={{ background: ft.colorPiel }} />
                  <span className={styles.fototipoNumero}>{ft.numero}</span>
                </button>
              ))}
            </div>

            {/* Detalle del fototipo */}
            <div className={styles.fototipoDetalle}>
              <div
                className={styles.fototipoDetalleHeader}
                style={{ background: fototipo.colorPiel, color: fototipo.numero >= 5 ? '#fff' : '#1A1A1A' }}
              >
                <h3>{fototipo.nombre}</h3>
                <p>{fototipo.descripcion}</p>
              </div>

              <div className={styles.fototipoDetalleBody}>
                <div className={styles.fototipoGrid}>
                  <div className={styles.fototipoItem}>
                    <span className={styles.fototipoItemLabel}><span aria-hidden="true">👁️</span> Color de ojos</span>
                    <span>{fototipo.ojos}</span>
                  </div>
                  <div className={styles.fototipoItem}>
                    <span className={styles.fototipoItemLabel}><span aria-hidden="true">💇</span> Color de pelo</span>
                    <span>{fototipo.pelo}</span>
                  </div>
                  <div className={styles.fototipoItem}>
                    <span className={styles.fototipoItemLabel}><span aria-hidden="true">☀️</span> Respuesta al sol</span>
                    <span>{fototipo.respuestaSol}</span>
                  </div>
                  <div className={styles.fototipoItem}>
                    <span className={styles.fototipoItemLabel}><span aria-hidden="true">🧴</span> Protección recomendada</span>
                    <span className={styles.spfBadge}>{fototipo.spf}</span>
                  </div>
                </div>

                <div className={styles.fototipoRecomendacion}>
                  <span aria-hidden="true">💡</span>
                  <p>{fototipo.recomendacion}</p>
                </div>
              </div>
            </div>

            <div className={styles.infoBox}>
              <h4>¿Qué es la melanina?</h4>
              <p>
                Los melanocitos producen melanina, el pigmento que da color a la piel y absorbe la radiación UV protegiendo el ADN de los queratinocitos. La diferencia entre fototipos no es el número de melanocitos (similar en todos), sino la cantidad y tipo de melanina que producen: eumelanina (marrón-negra, más protectora) vs feomelanina (amarilla-rojiza, menos protectora).
              </p>
            </div>
          </section>
        )}

        {/* Sección educativa */}
        <EducationalSection
          title="¿Cómo funciona la piel?"
          subtitle="La piel como órgano: estructura, funciones y datos clave"
        >
          <div className={styles.educativo}>
            <p>
              La piel es el órgano más grande del cuerpo humano. Con una superficie de aproximadamente 2 m² y un peso de 3–5 kg, constituye la primera línea de defensa frente al entorno. Lejos de ser una simple cubierta pasiva, la piel es un órgano activo y multifuncional que regula la temperatura, detecta estímulos, sintetiza vitamina D y aloja una comunidad microbiana esencial.
            </p>
            <p>
              Su estructura se organiza en tres capas con funciones complementarias: epidermis, dermis e hipodermis. La capacidad regenerativa es notable —renovación completa cada 27 días— aunque el envejecimiento y la exposición solar acumulada deterioran progresivamente la función barrera y la producción de colágeno.
            </p>

            {/* 1. Tabla comparativa */}
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Capa</th>
                    <th>Grosor</th>
                    <th>Células principales</th>
                    <th>Función clave</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Epidermis</strong></td>
                    <td>0,05–1,5 mm</td>
                    <td>Queratinocitos (95%), melanocitos, Langerhans</td>
                    <td>Barrera física y UV</td>
                  </tr>
                  <tr>
                    <td><strong>Dermis</strong></td>
                    <td>1–4 mm</td>
                    <td>Fibroblastos, macrófagos</td>
                    <td>Soporte, nutrición, sensores</td>
                  </tr>
                  <tr>
                    <td><strong>Hipodermis</strong></td>
                    <td>Variable</td>
                    <td>Adipocitos (grasa)</td>
                    <td>Aislamiento térmico, amortiguación</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 2. Perfiles de uso */}
            <h3 className={styles.eduSubtitulo}>¿Quién usa este visualizador?</h3>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <span className={styles.escenarioIcono} aria-hidden="true">🎓</span>
                <div>
                  <strong>Estudiante de biología</strong>
                  <p>Aprende los fototipos de Fitzpatrick y las capas de la piel antes del examen de anatomía.</p>
                </div>
              </div>
              <div className={styles.escenarioCard}>
                <span className={styles.escenarioIcono} aria-hidden="true">🏃</span>
                <div>
                  <strong>Deportista</strong>
                  <p>Entiende el proceso de cicatrización tras una abrasión y sabe por qué la herida enrojece los primeros días.</p>
                </div>
              </div>
              <div className={styles.escenarioCard}>
                <span className={styles.escenarioIcono} aria-hidden="true">☀️</span>
                <div>
                  <strong>Persona con piel sensible</strong>
                  <p>Comprende por qué el fototipo I se quema en minutos y qué SPF necesita realmente según su tipo de piel.</p>
                </div>
              </div>
              <div className={styles.escenarioCard}>
                <span className={styles.escenarioIcono} aria-hidden="true">💊</span>
                <div>
                  <strong>Cuidador o familiar</strong>
                  <p>Entiende la barrera epidérmica y por qué la absorción transdérmica de cremas varía según la zona del cuerpo.</p>
                </div>
              </div>
            </div>

            {/* 3. FAQ */}
            <h3 className={styles.eduSubtitulo}>Preguntas frecuentes</h3>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <strong>¿Cada cuánto se renueva la piel?</strong>
                <p>Aproximadamente cada 27 días. Los queratinocitos nacen en el estrato basal y emigran hacia la superficie mientras se queratinizan, muriendo al llegar al estrato córneo donde forman la capa protectora.</p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Por qué algunas cicatrices quedan rojizas?</strong>
                <p>Durante la fase de proliferación (4–21 días), se forman nuevos capilares mediante angiogénesis para nutrir el tejido de granulación. Ese exceso de vascularización le da el color rojo. Con el remodelado posterior, los vasos regresan y la cicatriz palidece.</p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Qué son los melanocitos y por qué determinan el color de la piel?</strong>
                <p>Son células del estrato basal que producen melanina. La diferencia entre fototipos no es el número de melanocitos (similar en todos), sino la cantidad y tipo de melanina: eumelanina (marrón-negra, más protectora) versus feomelanina (amarilla-rojiza, menos protectora).</p>
                <div className={styles.faqTip}>El bronceado no es el tipo de piel original: es una respuesta defensiva al daño UV acumulado.</div>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Por qué el SPF 50 no protege el doble que el SPF 25?</strong>
                <p>La escala SPF no es lineal. SPF 25 bloquea el 96% de la radiación UVB; SPF 50 bloquea el 98%. La diferencia real es pequeña, pero sí importa para fototipos I-II. Aplicar la cantidad correcta (2 mg/cm²) y reaplico cada 2 horas es más importante que subir el SPF.</p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Qué diferencia hay entre una quemadura solar y una de primer grado?</strong>
                <p>Son equivalentes. Ambas afectan únicamente a la epidermis: enrojecimiento, dolor e inflamación sin ampollas. Las quemaduras de segundo grado ya implican la dermis (ampollas) y las de tercer grado destruyen ambas capas y la hipodermis.</p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Puede la piel absorber sustancias?</strong>
                <p>Sí, mediante la vía transdérmica. Ejemplos clínicos: nitroglicerina (angina), estrógenos, nicotina, analgésicos. La absorción depende del tamaño molecular, liposolubilidad y zona del cuerpo. El DMSO es un disolvente que aumenta notablemente esta permeabilidad.</p>
              </div>
            </div>

            {/* 4. Guía paso a paso */}
            <h3 className={styles.eduSubtitulo}>Cómo elegir tu protección solar según el fototipo</h3>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <span className={styles.stepNumber}>1</span>
                <div className={styles.stepContent}>
                  <strong>Identifica tus características</strong>
                  <p>Observa el color natural de tu piel, ojos y cabello. Piensa en cómo reacciona tu piel tras 30 minutos de exposición solar sin protección.</p>
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>2</span>
                <div className={styles.stepContent}>
                  <strong>Consulta la escala Fitzpatrick I-VI</strong>
                  <p>Usa el selector de fototipos de esta app. El fototipo I corresponde a la piel más sensible; el VI, a la más resistente al sol.</p>
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>3</span>
                <div className={styles.stepContent}>
                  <strong>Entiende tu tiempo sin protección</strong>
                  <p>El SPF te dice cuánto tiempo puedes estar al sol antes de quemarte respecto a sin protección. Con fototipo I y SPF 50, ese tiempo se multiplica por 50 (ej: 3 min → 150 min en condiciones ideales).</p>
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>4</span>
                <div className={styles.stepContent}>
                  <strong>Elige el SPF adecuado</strong>
                  <p>Fototipos I-II: SPF 50+. Fototipos III-IV: SPF 30-50. Fototipos V-VI: SPF 15-30. En alta montaña o nieve, subir siempre un nivel.</p>
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>5</span>
                <div className={styles.stepContent}>
                  <strong>Aplica la cantidad correcta</strong>
                  <p>La dosis estándar es 2 mg/cm². En la práctica: 1 cucharada sopera para la cara y el cuello, y unos 30 ml (un shot) para todo el cuerpo. Aplicar poco reduce drásticamente la protección real.</p>
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNumber}>6</span>
                <div className={styles.stepContent}>
                  <strong>Renueva cada 2 horas</strong>
                  <p>Los filtros solares se degradan con el calor, el sudor y el agua. Reaplicar cada 2 horas o inmediatamente tras el baño, independientemente del SPF inicial.</p>
                </div>
              </div>
            </div>

            {/* 5. Mejores prácticas */}
            <h3 className={styles.eduSubtitulo}>Hábitos para cuidar tu piel</h3>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">💧</span>
                <div>
                  <strong>Hidratación desde dentro</strong>
                  <p>Beber suficiente agua ayuda a mantener el manto hidrolipídico. La deshidratación interna se refleja en pérdida de elasticidad y mayor TEWL (pérdida de agua transepidérmica).</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🌙</span>
                <div>
                  <strong>La reparación ocurre de noche</strong>
                  <p>Los queratinocitos se dividen con mayor frecuencia durante el sueño. El retinol (vitamina A) y los AHA funcionan mejor de noche porque también son fotosensibles.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🥗</span>
                <div>
                  <strong>Antioxidantes en la dieta</strong>
                  <p>La vitamina C es cofactor en la síntesis de colágeno. La vitamina E protege las membranas lipídicas del daño oxidativo. Ambas potencian la función barrera desde dentro.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🩺</span>
                <div>
                  <strong>Autoexamen mensual: regla ABCDE</strong>
                  <p>Asimetría, Bordes irregulares, Color no uniforme, Diámetro mayor de 6 mm, Evolución de la lesión. Ante cualquier cambio en un lunar, consulta con un dermatólogo.</p>
                </div>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">❄️</span>
                <div>
                  <strong>Duchas templadas, no calientes</strong>
                  <p>El agua muy caliente disuelve el manto hidrolipídico compuesto por sebo, ceramidas y ácidos grasos que protege la barrera epidérmica. Las duchas frías o templadas lo preservan mejor.</p>
                </div>
              </div>
            </div>

            {/* 6. Warning box */}
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Mitos y errores frecuentes sobre la piel</strong>
              </div>
              <ul className={styles.warningList}>
                <li><strong>«Con SPF 50 puedo estar todo el día sin reaplico»</strong> — FALSO: los filtros solares se degradan. Hay que reaplicar cada 2 horas independientemente del factor de protección.</li>
                <li><strong>«El bronceado previo protege del sol»</strong> — el fototipo base sí importa, pero el bronceado inicial es daño UV ya acumulado, no protección adicional.</li>
                <li><strong>«Si está nublado no necesito protección»</strong> — el 80% de la radiación UV atraviesa las nubes. Las quemaduras en días nublados son más frecuentes precisamente por confianza excesiva.</li>
                <li><strong>«Las cicatrices siempre desaparecen solas»</strong> — depende de la profundidad y del tipo de piel. Las cicatrices queloides e hipertróficas requieren tratamiento activo (silicona, corticoides, láser).</li>
                <li><strong>«La piel seca es piel vieja»</strong> — puede deberse a disfunción de la barrera epidérmica (déficit de ceramidas, eccema), tratable a cualquier edad con emolientes adecuados.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-piel')} />
        <ShareCard appName="visualizador-piel" />
      </main>

      <Footer appName="visualizador-piel" />
    </div>
  );
}
