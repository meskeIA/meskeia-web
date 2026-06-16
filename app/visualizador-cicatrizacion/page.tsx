'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorCicatrizacion.module.css';
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

type Seccion = 'fases' | 'celulas' | 'tipos' | 'factores';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'fases', titulo: 'Las 4 fases', icono: '⏱️', subtitulo: 'Timeline de la reparación tisular' },
  { id: 'celulas', titulo: 'Células protagonistas', icono: '🔬', subtitulo: 'Quién hace qué en cada fase' },
  { id: 'tipos', titulo: 'Tipos de herida', icono: '🩹', subtitulo: 'Primera, segunda y tercera intención' },
  { id: 'factores', titulo: 'Factores', icono: '⚖️', subtitulo: 'Qué favorece o dificulta la cicatrización' },
];

// ─────────────────────────────────────────────
// Datos: fases
// ─────────────────────────────────────────────

interface Fase {
  id: string;
  numero: number;
  nombre: string;
  icono: string;
  duracion: string;
  color: string;
  resumen: string;
  procesos: string[];
  celulas: string[];
  mediadores: string[];
}

const FASES: Fase[] = [
  {
    id: 'hemostasia',
    numero: 1,
    nombre: 'Hemostasia',
    icono: '🔴',
    duracion: 'Segundos a minutos',
    color: '#e74c3c',
    resumen: 'El objetivo inmediato es detener la hemorragia. El cuerpo activa una respuesta en cadena para sellar el vaso dañado con un coágulo de plaquetas y fibrina.',
    procesos: [
      'Vasoconstricción refleja inmediata (segundos)',
      'Adhesión plaquetaria al colágeno subendotelial (glucoproteína Ib + factor de von Willebrand)',
      'Activación plaquetaria: degranulación, liberación de ADP y tromboxano A2',
      'Cascada de coagulación: vía extrínseca (factor tisular + VIIa) → fibrina',
      'Tapón hemostático: plaquetas + fibrina = coágulo provisional y andamio para migración celular',
    ],
    celulas: ['Plaquetas', 'Células endoteliales'],
    mediadores: ['ADP', 'Tromboxano A2', 'Factor de von Willebrand', 'Fibrina', 'Factor tisular (VIIa)'],
  },
  {
    id: 'inflamacion',
    numero: 2,
    nombre: 'Inflamación',
    icono: '🟠',
    duracion: 'Horas a días (pico 48-72h)',
    color: '#e67e22',
    resumen: 'El cuerpo limpia la herida de bacterias y detritus celulares. Los signos clásicos (dolor, calor, rubor, tumor) son fisiológicos y necesarios, no patológicos.',
    procesos: [
      'Vasodilatación y aumento de permeabilidad vascular: eritema, calor, edema',
      'Quimiotaxis de neutrófilos (primeras 24h): fagocitosis y enzimas proteolíticas',
      'Macrófagos M1 (días 2-5): eliminan neutrófilos apoptóticos, señal inflamatoria',
      'Macrófagos M2 (transición): señal antiinflamatoria para iniciar proliferación',
      'Cicatrización crónica si persiste > 3 semanas sin resolverse',
    ],
    celulas: ['Neutrófilos', 'Macrófagos M1', 'Macrófagos M2', 'Mastocitos'],
    mediadores: ['Histamina', 'Bradicinina', 'Prostaglandinas', 'TNF-α', 'IL-1β', 'IL-6', 'VEGF', 'TGF-β', 'IL-10'],
  },
  {
    id: 'proliferacion',
    numero: 3,
    nombre: 'Proliferación',
    icono: '🟡',
    duracion: 'Días a semanas (4-21 días)',
    color: '#f1c40f',
    resumen: 'El cuerpo construye nuevo tejido provisional para rellenar el defecto. Se forman nuevos vasos, colágeno y se cierran los bordes de la herida.',
    procesos: [
      'Angiogénesis: VEGF estimula brotes capilares → tejido de granulación vascularizado',
      'Fibroblastos migran y sintetizan colágeno tipo III (provisional, más débil)',
      'Contracción de la herida: miofibroblastos (α-SMA+) reducen el área',
      'Re-epitelización: queratinocitos migran desde bordes y folículos pilosos',
      'Tejido de granulación: rojo, granular, frágil — base del tejido cicatricial',
    ],
    celulas: ['Fibroblastos', 'Miofibroblastos', 'Queratinocitos', 'Células endoteliales'],
    mediadores: ['VEGF', 'TGF-β', 'EGF', 'FGF', 'PDGF', 'Colágeno tipo III'],
  },
  {
    id: 'remodelado',
    numero: 4,
    nombre: 'Remodelado',
    icono: '🟢',
    duracion: 'Semanas a años (hasta 2 años)',
    color: '#27ae60',
    resumen: 'El colágeno provisional se reemplaza por colágeno más resistente. La cicatriz se consolida, aunque nunca recupera el 100% de la resistencia original.',
    procesos: [
      'Colágeno tipo III → colágeno tipo I (más resistente, fibras organizadas)',
      'MMPs (metaloproteasas) + TIMPs: equilibrio entre síntesis y degradación',
      'Resistencia final: máximo 70-80% del tejido original',
      'Cicatriz madura: avascular, acelular, pálida',
      'Cicatrices patológicas: hipertrófica (dentro de márgenes) vs queloide (invade tejido sano)',
    ],
    celulas: ['Fibroblastos', 'Macrófagos residuales'],
    mediadores: ['MMPs', 'TIMPs', 'TGF-β', 'Colágeno tipo I'],
  },
];

// ─────────────────────────────────────────────
// Datos: células
// ─────────────────────────────────────────────

interface Celula {
  id: string;
  nombre: string;
  icono: string;
  fases: string[];
  funcion: string;
  dato: string;
  color: string;
}

const CELULAS: Celula[] = [
  {
    id: 'plaquetas',
    nombre: 'Plaquetas',
    icono: '🔴',
    fases: ['Fase 1'],
    funcion: 'Forman el tapón hemostático primario al adherirse al colágeno expuesto y agregarse entre sí. Liberan factores de crecimiento que atraen otras células al lugar de la herida.',
    dato: 'Una plaqueta dura solo 8-12 días en circulación. En reposo son discos; al activarse cambian de forma y extienden pseudópodos.',
    color: '#e74c3c',
  },
  {
    id: 'neutrofilos',
    nombre: 'Neutrófilos',
    icono: '🟠',
    fases: ['Fase 2 (precoz)'],
    funcion: 'Primera línea de defensa antimicrobiana. Fagocitan bacterias, liberan enzimas proteolíticas que limpian tejido necrótico y expulsan NETs (trampas extracelulares).',
    dato: 'Son las células más abundantes en sangre (50-70% de leucocitos). Llegan a la herida en las primeras horas pero solo duran 1-2 días en el tejido.',
    color: '#e67e22',
  },
  {
    id: 'macrofagos-m1',
    nombre: 'Macrófagos M1',
    icono: '🟡',
    fases: ['Fase 2 (tardía)'],
    funcion: 'Eliminan los neutrófilos apoptóticos (efferocitosis) y continúan la limpieza del tejido. Secretan citocinas proinflamatorias que mantienen activa la respuesta.',
    dato: 'Derivan de los monocitos circulantes que migran al tejido. Su activación M1 vs M2 depende de las señales del microambiente.',
    color: '#f39c12',
  },
  {
    id: 'macrofagos-m2',
    nombre: 'Macrófagos M2',
    icono: '🟢',
    fases: ['Fase 2→3 (transición)'],
    funcion: 'Secretan señales antiinflamatorias (TGF-β, IL-10) que frenan la inflamación e inician la fase proliferativa. Son la clave del cambio de fase.',
    dato: 'La transición M1→M2 es crítica. Si no ocurre (por diabetes, infección crónica...), la herida se queda atrapada en inflamación y no cicatriza.',
    color: '#27ae60',
  },
  {
    id: 'fibroblastos',
    nombre: 'Fibroblastos',
    icono: '🔵',
    fases: ['Fase 3', 'Fase 4'],
    funcion: 'Producen colágeno, elastina y otros componentes de la matriz extracelular. Son los "albañiles" de la cicatriz: construyen el andamio estructural del nuevo tejido.',
    dato: 'En condiciones normales están inactivos. La señal TGF-β los activa y los convierte en miofibroblastos, que además contraen la herida.',
    color: '#2980b9',
  },
  {
    id: 'miofibroblastos',
    nombre: 'Miofibroblastos',
    icono: '⚙️',
    fases: ['Fase 3'],
    funcion: 'Fibroblastos modificados con propiedades contráctiles (expresan α-SMA). Reducen físicamente el área de la herida tirando de sus bordes, acelerando el cierre.',
    dato: 'Responsables de las cicatrices retráctiles. En quemaduras y heridas grandes, su exceso puede causar contracturas que limitan el movimiento.',
    color: '#8e44ad',
  },
  {
    id: 'queratinoc',
    nombre: 'Queratinocitos',
    icono: '🟣',
    fases: ['Fase 3'],
    funcion: 'Re-epitelizan la superficie de la herida migrando desde los bordes y los folículos pilosos. Restauran la barrera cutánea que protege de infecciones.',
    dato: 'Migran sobre el tejido de granulación en láminas. La velocidad de migración es ~0,5 mm/día en heridas normales.',
    color: '#9b59b6',
  },
];

// ─────────────────────────────────────────────
// Datos: tipos de cierre
// ─────────────────────────────────────────────

interface TipoCierre {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  proceso: string[];
  resultado: string;
  ejemplos: string;
  color: string;
}

const TIPOS_CIERRE: TipoCierre[] = [
  {
    id: 'primera',
    nombre: 'Primera intención',
    icono: '✂️',
    descripcion: 'Los bordes de la herida se aproximan quirúrgicamente (sutura, grapas, adhesivo). Mínimo tejido de granulación, cicatriz estrecha y discreta.',
    proceso: [
      'Herida limpia con bordes bien definidos',
      'Aproximación quirúrgica inmediata de los bordes',
      'Mínima fase proliferativa necesaria',
      'Cicatriz fina, lineal y bien consolidada',
    ],
    resultado: 'Cicatriz mínima. Resistencia completa en semanas.',
    ejemplos: 'Incisiones quirúrgicas, laceraciones limpias y recientes',
    color: '#27ae60',
  },
  {
    id: 'segunda',
    nombre: 'Segunda intención',
    icono: '🌿',
    descripcion: 'La herida se deja abierta y cierra sola mediante granulación, contracción y re-epitelización. Mayor cicatriz, más tiempo.',
    proceso: [
      'Herida abierta, no se sutura',
      'Tejido de granulación llena progresivamente el defecto',
      'Contracción por miofibroblastos reduce el área',
      'Re-epitelización desde los bordes',
    ],
    resultado: 'Cicatriz más amplia. Proceso lento (semanas a meses).',
    ejemplos: 'Úlceras por presión, abscesos drenados, quemaduras moderadas',
    color: '#e67e22',
  },
  {
    id: 'tercera',
    nombre: 'Tercera intención',
    icono: '⏳',
    descripcion: 'Cierre primario diferido: la herida se limpia y deja abierta 4-5 días antes de suturar, cuando el riesgo de infección ha bajado.',
    proceso: [
      'Herida contaminada o con alto riesgo de infección',
      'Se deja abierta con apósitos durante 4-5 días',
      'Inflamación inicial controlada sin infección',
      'Cierre quirúrgico cuando la herida está limpia',
    ],
    resultado: 'Cicatriz intermedia entre primera y segunda intención.',
    ejemplos: 'Heridas de guerra, mordeduras, heridas muy contaminadas',
    color: '#8e44ad',
  },
];

// ─────────────────────────────────────────────
// Datos: factores
// ─────────────────────────────────────────────

interface Factor {
  id: string;
  nombre: string;
  descripcion: string;
  mecanismo: string;
}

const FACTORES_POSITIVOS: Factor[] = [
  {
    id: 'nutricion',
    nombre: 'Nutrición adecuada',
    descripcion: 'La vitamina C es cofactor de la hidroxilación del colágeno. El zinc interviene en la proliferación celular y la síntesis de proteínas. Las proteínas son el sustrato básico.',
    mecanismo: 'Sin vitamina C → colágeno inestable (escorbuto). Sin zinc → síntesis proteica reducida.',
  },
  {
    id: 'humedad',
    nombre: 'Ambiente húmedo',
    descripcion: 'Las heridas cubiertas con apósitos húmedos cicatrizan un 40% más rápido que las expuestas al aire. La humedad favorece la migración celular.',
    mecanismo: 'Las costras secas crean una barrera física que los queratinocitos deben "cavar" por debajo. La humedad elimina esa barrera.',
  },
  {
    id: 'irrigacion',
    nombre: 'Buena irrigación',
    descripcion: 'El aporte de oxígeno y nutrientes a través de los vasos es esencial. La angiogénesis en fase 3 asegura la vascularización del nuevo tejido.',
    mecanismo: 'Hipoxia local → menor proliferación celular, mayor riesgo de infección, depósito de colágeno defectuoso.',
  },
  {
    id: 'juventud',
    nombre: 'Edad joven',
    descripcion: 'Los jóvenes tienen mayor respuesta celular, mejor calidad de colágeno y más eficiente regulación inflamatoria. Las heridas cicatrizan más rápido.',
    mecanismo: 'Con la edad disminuyen los fibroblastos activos, la respuesta angiogénica y la inmunidad innata local.',
  },
];

const FACTORES_NEGATIVOS: Factor[] = [
  {
    id: 'diabetes',
    nombre: 'Diabetes mellitus',
    descripcion: 'Principal causa de heridas crónicas no cicatrizantes. La hiperglucemia altera múltiples pasos: respuesta inmune, síntesis de colágeno y angiogénesis.',
    mecanismo: 'Glucosilación de proteínas estructurales, neuropatía (no se siente el daño) e insuficiencia vascular periférica.',
  },
  {
    id: 'corticoides',
    nombre: 'Corticoides sistémicos',
    descripcion: 'Frenan la inflamación de forma global, lo que dificulta la fase inicial de limpieza y el cambio a la fase proliferativa.',
    mecanismo: 'Inhiben la síntesis de prostaglandinas y la quimiotaxis de neutrófilos. Reducen la proliferación de fibroblastos.',
  },
  {
    id: 'tabaco',
    nombre: 'Tabaquismo',
    descripcion: 'La nicotina causa vasoconstricción. El CO del humo compite con el O2 en la hemoglobina. Ambos reducen el aporte de oxígeno al tejido en reparación.',
    mecanismo: 'Hipoxia tisular persistente → menor angiogénesis, más infección, colágeno de menor calidad.',
  },
  {
    id: 'infeccion',
    nombre: 'Infección local',
    descripcion: 'Las bacterias compiten por nutrientes, liberan toxinas que destruyen tejido y mantienen la inflamación activa, impidiendo el paso a la fase proliferativa.',
    mecanismo: 'Biofilm bacteriano: estructura que protege a las bacterias de los antibióticos y del sistema inmune, crea herida crónica.',
  },
  {
    id: 'malnutricion',
    nombre: 'Malnutrición',
    descripcion: 'Sin proteínas no hay síntesis de colágeno. Sin calorías, el cuerpo cataboliza sus propias proteínas estructurales para obtener energía.',
    mecanismo: 'Déficit proteico → cicatriz débil. Déficit de vitamina C → colágeno inestable. Déficit de zinc → proliferación reducida.',
  },
  {
    id: 'radioterapia',
    nombre: 'Radioterapia',
    descripcion: 'La radiación daña permanentemente los vasos locales y el ADN de los fibroblastos, creando una zona de tejido hipovascular con mala capacidad de reparación.',
    mecanismo: 'Fibrosis post-radiación: los fibroblastos dañados depositan colágeno desorganizado. Las heridas en campo irradiado son de difícil manejo.',
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCicatrizacion() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('fases');
  const [faseSeleccionada, setFaseSeleccionada] = useState<string>('hemostasia');
  const [celulaSeleccionada, setCelulaSeleccionada] = useState<string | null>(null);
  const [tipoCierreSeleccionado, setTipoCierreSeleccionado] = useState<string>('primera');
  const [factorExpandido, setFactorExpandido] = useState<string | null>(null);

  const faseActual = FASES.find(f => f.id === faseSeleccionada) ?? FASES[0];
  const celulaActual = celulaSeleccionada ? CELULAS.find(c => c.id === celulaSeleccionada) ?? null : null;
  const tipoActual = TIPOS_CIERRE.find(t => t.id === tipoCierreSeleccionado) ?? TIPOS_CIERRE[0];

  const toggleFactor = (id: string) => {
    setFactorExpandido(prev => (prev === id ? null : id));
  };

  return (
    <div className={styles.container}>

      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">🩹</div>
        <h1>Visualizador de la Cicatrización</h1>
        <p>Las 4 fases de reparación de heridas: hemostasia, inflamación, proliferación y remodelado</p>
      </header>

      <LegalNotice />

      {/* Navegación de secciones */}
      <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
        {SECCIONES.map(sec => (
          <button
            key={sec.id}
            type="button"
            className={`${styles.navBtn} ${seccionActiva === sec.id ? styles.navBtnActivo : ''}`}
            onClick={() => setSeccionActiva(sec.id)}
            aria-pressed={seccionActiva === sec.id}
          >
            <span aria-hidden="true">{sec.icono}</span>
            <span>{sec.titulo}</span>
          </button>
        ))}
      </nav>

      <main className={styles.contenido}>

        {/* ── SECCIÓN: FASES ── */}
        {seccionActiva === 'fases' && (
          <section aria-label="Las 4 fases de la cicatrización">
            <h2 className={styles.seccionTitulo}>Las 4 fases de la cicatrización</h2>
            <p className={styles.seccionSubtitulo}>Selecciona una fase para ver sus procesos, células y mediadores clave</p>

            {/* Timeline */}
            <div className={styles.timeline}>
              {FASES.map((fase, idx) => (
                <button
                  key={fase.id}
                  type="button"
                  className={`${styles.timelineItem} ${faseSeleccionada === fase.id ? styles.timelineItemActivo : ''}`}
                  onClick={() => setFaseSeleccionada(fase.id)}
                  style={{ '--fase-color': fase.color } as React.CSSProperties}
                  aria-pressed={faseSeleccionada === fase.id}
                >
                  <span className={styles.timelineNumero}>{fase.numero}</span>
                  <span className={styles.timelineIcono} aria-hidden="true">{fase.icono}</span>
                  <span className={styles.timelineNombre}>{fase.nombre}</span>
                  <span className={styles.timelineDuracion}>{fase.duracion}</span>
                  {idx < FASES.length - 1 && <span className={styles.timelineConector} aria-hidden="true">→</span>}
                </button>
              ))}
            </div>

            {/* Detalle de la fase */}
            <div className={styles.faseDetalle} style={{ '--fase-color': faseActual.color } as React.CSSProperties}>
              <div className={styles.faseDetalleHeader}>
                <span className={styles.faseDetalleIcono} aria-hidden="true">{faseActual.icono}</span>
                <div>
                  <h3 className={styles.faseDetalleNombre}>Fase {faseActual.numero}: {faseActual.nombre}</h3>
                  <p className={styles.faseDetalleDuracion}><span aria-hidden="true">⏱️</span> {faseActual.duracion}</p>
                </div>
              </div>
              <p className={styles.faseDetalleResumen}>{faseActual.resumen}</p>

              <div className={styles.faseDetalleGrid}>
                <div className={styles.faseDetalleBloque}>
                  <h4>Procesos principales</h4>
                  <ul className={styles.faseDetalleLista}>
                    {faseActual.procesos.map((proceso, i) => (
                      <li key={i}>{proceso}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.faseDetalleBloque}>
                  <h4>Células protagonistas</h4>
                  <div className={styles.tags}>
                    {faseActual.celulas.map(c => (
                      <span key={c} className={styles.tagCelula}>{c}</span>
                    ))}
                  </div>
                  <h4 className={styles.mt}>Mediadores químicos</h4>
                  <div className={styles.tags}>
                    {faseActual.mediadores.map(m => (
                      <span key={m} className={styles.tagMediador}>{m}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── SECCIÓN: CÉLULAS ── */}
        {seccionActiva === 'celulas' && (
          <section aria-label="Células protagonistas">
            <h2 className={styles.seccionTitulo}>Células protagonistas</h2>
            <p className={styles.seccionSubtitulo}>Haz clic en cada célula para ver su función y papel en la cicatrización</p>

            <div className={styles.celulaGrid}>
              {CELULAS.map(celula => (
                <button
                  key={celula.id}
                  type="button"
                  className={`${styles.celulaCard} ${celulaSeleccionada === celula.id ? styles.celulaCardActiva : ''}`}
                  onClick={() => setCelulaSeleccionada(prev => prev === celula.id ? null : celula.id)}
                  style={{ '--celula-color': celula.color } as React.CSSProperties}
                  aria-pressed={celulaSeleccionada === celula.id}
                >
                  <span className={styles.celulaIcono} aria-hidden="true">{celula.icono}</span>
                  <span className={styles.celulaNombre}>{celula.nombre}</span>
                  <div className={styles.celulaTags}>
                    {celula.fases.map(f => (
                      <span key={f} className={styles.tagFase}>{f}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {celulaActual && (
              <div className={styles.celulaDetalle} style={{ '--celula-color': celulaActual.color } as React.CSSProperties}>
                <div className={styles.celulaDetalleHeader}>
                  <span className={styles.celulaDetalleIcono} aria-hidden="true">{celulaActual.icono}</span>
                  <div>
                    <h3>{celulaActual.nombre}</h3>
                    <div className={styles.tags}>
                      {celulaActual.fases.map(f => (
                        <span key={f} className={styles.tagFase}>{f}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className={styles.celulaDetalleTexto}>{celulaActual.funcion}</p>
                <div className={styles.warningBox}>
                  <span aria-hidden="true">💡</span>
                  <p>{celulaActual.dato}</p>
                </div>
              </div>
            )}

            {!celulaActual && (
              <div className={styles.placeholder}>
                <span aria-hidden="true">🔬</span>
                <p>Selecciona una célula para ver su función detallada</p>
              </div>
            )}
          </section>
        )}

        {/* ── SECCIÓN: TIPOS DE CIERRE ── */}
        {seccionActiva === 'tipos' && (
          <section aria-label="Tipos de cierre de heridas">
            <h2 className={styles.seccionTitulo}>Tipos de cierre de heridas</h2>
            <p className={styles.seccionSubtitulo}>Tres formas de cicatrizar según el tipo de herida y su manejo clínico</p>

            <div className={styles.tiposBtns}>
              {TIPOS_CIERRE.map(tipo => (
                <button
                  key={tipo.id}
                  type="button"
                  className={`${styles.tipoBtn} ${tipoCierreSeleccionado === tipo.id ? styles.tipoBtnActivo : ''}`}
                  onClick={() => setTipoCierreSeleccionado(tipo.id)}
                  style={{ '--tipo-color': tipo.color } as React.CSSProperties}
                  aria-pressed={tipoCierreSeleccionado === tipo.id}
                >
                  <span aria-hidden="true">{tipo.icono}</span>
                  <span>{tipo.nombre}</span>
                </button>
              ))}
            </div>

            <div className={styles.tipoDetalle} style={{ '--tipo-color': tipoActual.color } as React.CSSProperties}>
              <div className={styles.tipoDetalleHeader}>
                <span className={styles.tipoDetalleIcono} aria-hidden="true">{tipoActual.icono}</span>
                <h3>{tipoActual.nombre}</h3>
              </div>
              <p className={styles.tipoDetalleDesc}>{tipoActual.descripcion}</p>

              <div className={styles.tipoDetalleGrid}>
                <div>
                  <h4>Proceso</h4>
                  <ol className={styles.tipoDetalleLista}>
                    {tipoActual.proceso.map((paso, i) => (
                      <li key={i}>{paso}</li>
                    ))}
                  </ol>
                </div>
                <div>
                  <h4>Resultado esperado</h4>
                  <p className={styles.tipoDetalleResultado}>{tipoActual.resultado}</p>
                  <h4 className={styles.mt}>Ejemplos clínicos</h4>
                  <p className={styles.tipoDetalleEjemplos}>{tipoActual.ejemplos}</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── SECCIÓN: FACTORES ── */}
        {seccionActiva === 'factores' && (
          <section aria-label="Factores que afectan la cicatrización">
            <h2 className={styles.seccionTitulo}>Factores que afectan la cicatrización</h2>
            <p className={styles.seccionSubtitulo}>Qué favorece y qué dificulta la reparación tisular</p>

            <div className={styles.factoresGrid}>
              {/* Columna positivos */}
              <div className={styles.factoresColumna}>
                <h3 className={styles.factoresHeader} data-tipo="positivo">
                  <span aria-hidden="true">✅</span> Favorecen la cicatrización
                </h3>
                {FACTORES_POSITIVOS.map(factor => (
                  <div key={factor.id} className={styles.factorCard} data-tipo="positivo">
                    <button
                      type="button"
                      className={styles.factorBtn}
                      onClick={() => toggleFactor(factor.id)}
                      aria-expanded={factorExpandido === factor.id}
                    >
                      <span className={styles.factorNombre}>{factor.nombre}</span>
                      <span className={styles.factorToggle} aria-hidden="true">
                        {factorExpandido === factor.id ? '▲' : '▼'}
                      </span>
                    </button>
                    {factorExpandido === factor.id && (
                      <div className={styles.factorDetalle}>
                        <p>{factor.descripcion}</p>
                        <div className={styles.warningBox}>
                          <span aria-hidden="true">🔬</span>
                          <p><strong>Mecanismo:</strong> {factor.mecanismo}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Columna negativos */}
              <div className={styles.factoresColumna}>
                <h3 className={styles.factoresHeader} data-tipo="negativo">
                  <span aria-hidden="true">⚠️</span> Dificultan la cicatrización
                </h3>
                {FACTORES_NEGATIVOS.map(factor => (
                  <div key={factor.id} className={styles.factorCard} data-tipo="negativo">
                    <button
                      type="button"
                      className={styles.factorBtn}
                      onClick={() => toggleFactor(factor.id)}
                      aria-expanded={factorExpandido === factor.id}
                    >
                      <span className={styles.factorNombre}>{factor.nombre}</span>
                      <span className={styles.factorToggle} aria-hidden="true">
                        {factorExpandido === factor.id ? '▲' : '▼'}
                      </span>
                    </button>
                    {factorExpandido === factor.id && (
                      <div className={styles.factorDetalle}>
                        <p>{factor.descripcion}</p>
                        <div className={styles.warningBox}>
                          <span aria-hidden="true">🔬</span>
                          <p><strong>Mecanismo:</strong> {factor.mecanismo}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Sección educativa v2.0 */}
      <EducationalSection
        title="¿Cómo cicatriza una herida?"
        subtitle="Las 4 fases de la reparación tisular explicadas"
        icon="🩹"
      >
        {/* 1. Tabla comparativa de las 4 fases */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Fase</th>
                <th>Duración</th>
                <th>Células protagonistas</th>
                <th>Colágeno</th>
                <th>Señal de inicio</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Hemostasia</strong></td>
                <td>Segundos–15 min</td>
                <td>Plaquetas</td>
                <td>No</td>
                <td>Lesión vascular</td>
              </tr>
              <tr>
                <td><strong>Inflamación</strong></td>
                <td>1–5 días (pico 48-72h)</td>
                <td>Neutrófilos → Macrófagos</td>
                <td>No</td>
                <td>Histamina, bradicinina</td>
              </tr>
              <tr>
                <td><strong>Proliferación</strong></td>
                <td>4–21 días</td>
                <td>Fibroblastos, queratinocitos</td>
                <td>Tipo III (provisional)</td>
                <td>TGF-β, VEGF</td>
              </tr>
              <tr>
                <td><strong>Remodelado</strong></td>
                <td>Semanas–2 años</td>
                <td>MMPs, fibroblastos</td>
                <td>Tipo I (definitivo)</td>
                <td>Balance MMPs/TIMPs</td>
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
              <strong>Estudiante de biología o enfermería</strong>
              <p>Aprende las fases para el examen de histología y comprende el papel de cada célula en la reparación tisular.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcono} aria-hidden="true">🏃</span>
            <div>
              <strong>Deportista con abrasión o corte</strong>
              <p>Entiende por qué no debe rascarse la costra: está en la fase de proliferación y retirarla reinicia el proceso.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcono} aria-hidden="true">🏥</span>
            <div>
              <strong>Persona con herida crónica (úlcera)</strong>
              <p>Comprende por qué la inflamación persistente bloquea la transición a la fase proliferativa y la herida no avanza.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcono} aria-hidden="true">💉</span>
            <div>
              <strong>Paciente postquirúrgico</strong>
              <p>Entiende la importancia de la nutrición —vitamina C y zinc— para la síntesis de colágeno en la fase de proliferación.</p>
            </div>
          </div>
        </div>

        {/* 3. FAQ */}
        <h3 className={styles.eduSubtitulo}>Preguntas frecuentes</h3>
        <dl className={styles.faqList}>
          <div className={styles.faqItem}>
            <dt>¿Por qué las heridas pican cuando están cicatrizando?</dt>
            <dd>El picor se debe a la proliferación de nuevas terminaciones nerviosas durante la fase de remodelado y a la liberación de histamina. Es señal de que la cicatrización avanza con normalidad.</dd>
            <div className={styles.faqTip}>Evita rascarte: rascarse puede romper el tejido de granulación recién formado.</div>
          </div>
          <div className={styles.faqItem}>
            <dt>¿Qué diferencia hay entre una cicatriz queloide e hipertrófica?</dt>
            <dd>La cicatriz hipertrófica crece dentro de los márgenes de la herida y puede involucionar con el tiempo. El queloide invade tejido sano más allá de los bordes y no involuciona espontáneamente; tiene mayor predisposición genética.</dd>
            <div className={styles.faqTip}>Los queloides son más frecuentes en pieles con más melanina y en zonas de tensión (esternón, hombros, lóbulos).</div>
          </div>
          <div className={styles.faqItem}>
            <dt>¿Por qué los diabéticos cicatrizan peor?</dt>
            <dd>La hiperglucemia deteriora la quimiotaxis de neutrófilos, reduce la síntesis de colágeno y daña la microvascularización. Además, la neuropatía hace que el paciente no sienta el daño inicial, retrasando el tratamiento.</dd>
            <div className={styles.faqTip}>El pie diabético es el ejemplo clásico: heridas pequeñas que no cicatrizan por la suma de estos mecanismos.</div>
          </div>
          <div className={styles.faqItem}>
            <dt>¿Por qué no se debe reventar ni arrancar la costra?</dt>
            <dd>La costra es la cubierta protectora de la fase proliferativa. Quitarla expone el tejido de granulación frágil, aumenta el riesgo de infección y obliga a reiniciar el proceso de re-epitelización desde el principio.</dd>
            <div className={styles.faqTip}>Mantener la herida húmeda con un apósito hidrocoloide evita que se forme costra y acelera la curación.</div>
          </div>
          <div className={styles.faqItem}>
            <dt>¿Cuánto tiempo tarda una herida en alcanzar su resistencia máxima?</dt>
            <dd>El proceso de remodelado puede durar hasta 2 años. Incluso al final, la cicatriz solo alcanza el 70-80% de la resistencia del tejido original porque el colágeno cicatricial tiene una organización diferente al tejido nativo.</dd>
            <div className={styles.faqTip}>Por eso las cicatrices de intervenciones quirúrgicas abdominales requieren cuidados especiales durante meses.</div>
          </div>
          <div className={styles.faqItem}>
            <dt>¿Por qué el tabaco retrasa la cicatrización?</dt>
            <dd>La nicotina produce vasoconstricción que reduce el flujo sanguíneo local. El monóxido de carbono del humo compite con el oxígeno en la hemoglobina. Ambos efectos crean hipoxia tisular que inactiva los fibroblastos y reduce la síntesis de colágeno.</dd>
            <div className={styles.faqTip}>Los cirujanos plásticos recomiendan dejar de fumar al menos 6 semanas antes de una intervención para mejorar la cicatrización.</div>
          </div>
        </dl>

        {/* 4. Guía paso a paso */}
        <h3 className={styles.eduSubtitulo}>De la lesión a la cicatriz: paso a paso</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">1</span>
            <div className={styles.stepContent}>
              <strong>Segundos: vasoconstricción refleja</strong>
              <p>El vaso dañado se estrecha de forma inmediata y refleja para reducir la hemorragia. Es la primera respuesta del sistema nervioso autónomo.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">2</span>
            <div className={styles.stepContent}>
              <strong>Minutos: tapón plaquetario (hemostasia primaria)</strong>
              <p>Las plaquetas se adhieren al colágeno subendotelial expuesto mediante el factor de von Willebrand. Se activan, cambian de forma y liberan ADP y tromboxano A2 para reclutar más plaquetas.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">3</span>
            <div className={styles.stepContent}>
              <strong>10–15 min: red de fibrina (hemostasia secundaria)</strong>
              <p>La cascada de coagulación se activa por la vía extrínseca (factor tisular + VIIa). El resultado es la fibrina, que refuerza el tapón plaquetario y forma el coágulo provisional.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">4</span>
            <div className={styles.stepContent}>
              <strong>Horas: llegada de neutrófilos (inflamación aguda)</strong>
              <p>Atraídos por quimiocinas e IL-8, los neutrófilos migran desde la sangre. Fagocitan bacterias, liberan enzimas proteolíticas y forman NETs para limpiar la zona de la herida.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">5</span>
            <div className={styles.stepContent}>
              <strong>Días 2–5: macrófagos coordinan la transición</strong>
              <p>Los macrófagos M1 eliminan los neutrófilos apoptóticos (efferocitosis). Los macrófagos M2 liberan TGF-β e IL-10, señalizando el fin de la inflamación e iniciando la fase proliferativa.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">6</span>
            <div className={styles.stepContent}>
              <strong>Semanas: tejido de granulación y cierre</strong>
              <p>Los fibroblastos sintetizan colágeno tipo III (provisional). Los queratinocitos migran desde los bordes y folículos pilosos. Los miofibroblastos contraen la herida. El VEGF estimula la angiogénesis.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber} aria-hidden="true">7</span>
            <div className={styles.stepContent}>
              <strong>Meses–años: remodelado y maduración</strong>
              <p>Las MMPs degradan el colágeno tipo III mientras los fibroblastos depositan colágeno tipo I más resistente. La cicatriz palidece, se endurece y alcanza hasta el 70-80% de la resistencia original.</p>
            </div>
          </li>
        </ol>

        {/* 5. Mejores prácticas */}
        <h3 className={styles.eduSubtitulo}>Cómo favorecer la cicatrización</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🥩</span>
            <div>
              <strong>Proteínas y vitamina C</strong>
              <p>Son imprescindibles para la síntesis de colágeno. El déficit de vitamina C produce colágeno inestable; el déficit proteico genera una cicatriz frágil.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💧</span>
            <div>
              <strong>Mantener la herida húmeda</strong>
              <p>Los apósitos hidrocoloides aceleran la re-epitelización respecto al ambiente seco porque eliminan la barrera física de la costra que los queratinocitos deben superar.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🚫</span>
            <div>
              <strong>No retirar costras</strong>
              <p>Interrumpe la fase de proliferación, expone el tejido de granulación y puede causar cicatrices más visibles al obligar a reiniciar la re-epitelización.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">☀️</span>
            <div>
              <strong>Proteger la cicatriz del sol durante 1 año</strong>
              <p>La melanina no se distribuye correctamente en el tejido cicatricial, lo que puede generar hiperpigmentación permanente si se expone a radiación UV durante la maduración.</p>
            </div>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🩺</span>
            <div>
              <strong>Vigilar signos de infección</strong>
              <p>Si la herida empeora después de 48h —más calor, pus, fiebre o bordes rojos que se expanden— es necesario consultar un médico. El biofilm bacteriano bloquea la cicatrización.</p>
            </div>
          </div>
        </div>

        {/* 6. Warning box — errores comunes */}
        <div className={styles.warningBoxEdu}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores comunes sobre la cicatrización</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong><span aria-hidden="true">❌</span> &quot;El agua oxigenada es lo mejor para limpiar heridas&quot;</strong> — el H₂O₂ destruye los fibroblastos y retrasa la cicatrización; agua corriente limpia es suficiente para la mayoría de heridas.</li>
            <li><strong><span aria-hidden="true">❌</span> &quot;Si no duele, está bien cicatrizando&quot;</strong> — las heridas crónicas como las úlceras neuropáticas no duelen porque hay daño nervioso asociado; la ausencia de dolor no es garantía de curación.</li>
            <li><strong><span aria-hidden="true">❌</span> &quot;Los queloides salen por &lsquo;sangre mala&rsquo;&quot;</strong> — son una respuesta fibroblástica exagerada con base genética; más frecuentes en pieles oscuras y en zonas de alta tensión mecánica.</li>
            <li><strong><span aria-hidden="true">❌</span> &quot;Los corticoides ayudan a curar heridas&quot;</strong> — los corticoides sistémicos inhiben la fase inflamatoria y reducen la proliferación de fibroblastos, retrasando activamente la cicatrización.</li>
            <li><strong><span aria-hidden="true">❌</span> &quot;Una herida pequeña no necesita cuidados&quot;</strong> — las infecciones graves (celulitis, fascitis necrotizante) siempre empiezan en heridas pequeñas; la limpieza y cobertura básica son imprescindibles.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-cicatrizacion')} />
      <ShareCard appName="visualizador-cicatrizacion" />
      <Footer appName="visualizador-cicatrizacion" />
    </div>
  );
}
