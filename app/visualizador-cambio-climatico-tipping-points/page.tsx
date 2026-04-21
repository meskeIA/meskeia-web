'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorCambioClimatico.module.css';
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

type Seccion = 'tipping' | 'retroalimentaciones' | 'cascadas' | 'escenarios';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'tipping', titulo: 'Tipping Points', icono: '🌍', subtitulo: '9 puntos de inflexión críticos' },
  { id: 'retroalimentaciones', titulo: 'Retroalimentaciones', icono: '🔄', subtitulo: 'Feedbacks positivos y negativos' },
  { id: 'cascadas', titulo: 'Cascadas', icono: '🌊', subtitulo: 'Conexiones e interacciones' },
  { id: 'escenarios', titulo: 'Escenarios IPCC', icono: '📊', subtitulo: 'Proyecciones AR6 2021' },
];

interface TippingPoint {
  id: string;
  nombre: string;
  umbral: string;
  impacto: string;
  estadoActual: string;
  feedback: string;
  icono: string;
  color: string;
  detalles: string;
}

const TIPPING_POINTS: TippingPoint[] = [
  {
    id: 'artico',
    nombre: 'Deshielo del Ártico marino',
    umbral: '~1,5–2°C',
    impacto: '+0,6°C adicionales (retroalimentación albedo)',
    estadoActual: 'En curso — mínimos históricos de hielo',
    feedback: 'El hielo blanco refleja el 80% de la radiación solar. El océano oscuro absorbe el 94%. Al perder hielo, el océano se calienta más y acelera el deshielo.',
    icono: '🧊',
    color: '#2E86AB',
    detalles: 'La retroalimentación albedo es uno de los mecanismos más potentes del sistema climático. El Ártico se calienta casi 4 veces más rápido que la media global (amplificación ártica). El hielo marino mínimo de verano podría desaparecer en los años 2030-2050.',
  },
  {
    id: 'groenlandia',
    nombre: 'Capa de Hielo de Groenlandia',
    umbral: '~1,5–2°C',
    impacto: '7 m de subida del nivel del mar (milenios)',
    estadoActual: 'Pérdida acelerada desde 1990',
    feedback: 'Una vez que la superficie baja a altitudes más cálidas, el deshielo se autosostiene aunque bajen las temperaturas.',
    icono: '🏔️',
    color: '#1A6E8A',
    detalles: 'Contiene 2,85 millones de km³ de hielo. La capa ha perdido 280 Gt/año de media desde 2012. El proceso de fusión completa tomaría miles de años, pero una vez iniciado es prácticamente irreversible.',
  },
  {
    id: 'antartida',
    nombre: 'Antártida Occidental',
    umbral: '~1,5–3°C',
    impacto: '+3,3 m de nivel del mar adicionales',
    estadoActual: 'Glaciares Thwaites y Pine Island en colapso potencial',
    feedback: 'Dinámica MICI (Marine Ice Cliff Instability): los acantilados de hielo se vuelven inestables y colapsan en cascada.',
    icono: '❄️',
    color: '#48A9A6',
    detalles: 'La Antártida Occidental reposa sobre una cama marina (bajo el nivel del mar), lo que la hace especialmente vulnerable al calentamiento oceánico desde abajo. El glaciar Thwaites ("Glaciar del Apocalipsis") retrocede aceleradamente desde 2019.',
  },
  {
    id: 'coral',
    nombre: 'Arrecifes de Coral Tropical',
    umbral: '~1,5–2°C',
    impacto: 'Extinción del 70–99% de los corales actuales',
    estadoActual: '~50% ya degradados gravemente',
    feedback: 'El blanqueamiento masivo ocurre cuando la temperatura supera 1°C sobre el promedio estival más de 8 semanas consecutivas.',
    icono: '🐠',
    color: '#E07B35',
    detalles: 'La Gran Barrera de Coral (Australia) ha sufrido 5 episodios de blanqueamiento masivo desde 1998. Los arrecifes albergan el 25% de todas las especies marinas. A +2°C, el 99% de los arrecifes serían invivibles para los corales.',
  },
  {
    id: 'amazonas',
    nombre: 'Bosque Amazónico (Savanización)',
    umbral: '~3–4°C o 20–25% deforestación',
    impacto: 'Conversión de 5,5 M km² de bosque en sabana',
    estadoActual: '~17% deforestado — cerca del umbral',
    feedback: 'El Amazonas genera su propia lluvia mediante la transpiración. Sin masa crítica de árboles, el ciclo del agua colapsa y el bosque muere.',
    icono: '🌿',
    color: '#27AE60',
    detalles: 'El bosque amazónico almacena ~150–200 Gt de carbono. Su conversión a sabana liberaría una cantidad equivalente a décadas de emisiones globales. Ya hay zonas en el sureste del Amazonas que emiten más CO₂ del que absorben.',
  },
  {
    id: 'permafrost',
    nombre: 'Permafrost de Siberia',
    umbral: '~1,5–2°C',
    impacto: '+0,1 a 0,4°C adicionales (metano y CO₂)',
    estadoActual: 'Descongelación acelerada ya en curso',
    feedback: 'El permafrost contiene 1.500 Gt de carbono orgánico. Al descongelarse, las bacterias lo descomponen liberando CH₄ (metano) y CO₂.',
    icono: '🌡️',
    color: '#8E6BBF',
    detalles: 'El metano es 80 veces más potente que el CO₂ como gas de efecto invernadero en un horizonte de 20 años. El permafrost cubre ~22% de la superficie terrestre del hemisferio norte. Se han detectado cráteres en Siberia producidos por explosiones de metano.',
  },
  {
    id: 'amoc',
    nombre: 'Circulación Atlántica (AMOC)',
    umbral: '~1,5–4°C',
    impacto: 'Enfriamiento de 5–10°C en Europa, monzones alterados',
    estadoActual: 'En su punto más débil en 1.000 años (datos proxy)',
    feedback: 'El deshielo de Groenlandia aporta agua dulce al Atlántico Norte, reduciendo la salinidad e impidiendo el hundimiento que mueve la corriente.',
    icono: '🌊',
    color: '#2E86AB',
    detalles: 'La AMOC transporta calor equivalente a 1,3 petavatios hacia el norte (comparable a la producción eléctrica mundial). Su colapso enfriaría Europa severamente pese al calentamiento global, desplazaría los cinturones de lluvias tropicales y afectaría a los monzones africanos y asiáticos.',
  },
  {
    id: 'monzon',
    nombre: 'Monzón de África Occidental',
    umbral: '~2–3°C',
    impacto: 'Desplazamiento drástico; afecta a 300 M de personas',
    estadoActual: 'Variabilidad creciente, tendencias inciertas',
    feedback: 'El debilitamiento de la AMOC y el calentamiento diferencial tierra-mar pueden alterar el gradiente de presiones que impulsa el monzón.',
    icono: '🌧️',
    color: '#3498DB',
    detalles: 'El Sahel africano es extremadamente sensible a pequeños cambios en el monzón. Un desplazamiento de tan solo 2° de latitud en el frente monzónico puede transformar zonas fértiles en desierto o viceversa.',
  },
  {
    id: 'boreales',
    nombre: 'Bosques Boreales (Taiga)',
    umbral: '~4°C',
    impacto: 'Liberación masiva de carbono por incendios y mort. arbórea',
    estadoActual: 'Incendios récord en Siberia, Canadá y Alaska',
    feedback: 'El calentamiento aumenta la frecuencia e intensidad de incendios y plagas de insectos. Los árboles muertos dejan de absorber y pasan a emitir CO₂.',
    icono: '🌲',
    color: '#1E8449',
    detalles: 'Los bosques boreales almacenan ~272 Gt de carbono (más que los tropicales). Los incendios en Siberia de 2020-2021 quemaron áreas récord. El calentamiento del Ártico está desplazando el permafrost subyacente, debilitando el suelo donde crecen los árboles.',
  },
];

interface Feedback {
  id: string;
  nombre: string;
  tipo: 'positivo' | 'negativo';
  mecanismo: string;
  magnitud: string;
  icono: string;
  color: string;
}

const FEEDBACKS: Feedback[] = [
  {
    id: 'albedo',
    nombre: 'Retroalimentación Albedo (hielo-agua)',
    tipo: 'positivo',
    mecanismo: 'Más calor → menos hielo → menor reflexión → más absorción → más calor',
    magnitud: '+0,3 a +0,6°C adicionales',
    icono: '☀️',
    color: '#E74C3C',
  },
  {
    id: 'vapor',
    nombre: 'Vapor de agua atmosférico',
    tipo: 'positivo',
    mecanismo: 'Más calor → más evaporación → más vapor (GEI) → más calor',
    magnitud: 'Duplica el efecto del CO₂ directamente',
    icono: '💧',
    color: '#E74C3C',
  },
  {
    id: 'metano',
    nombre: 'Metano del permafrost y humedales',
    tipo: 'positivo',
    mecanismo: 'Más calor → descongelación → más CH₄ → más calor',
    magnitud: '+0,1 a +0,4°C en 2100',
    icono: '💨',
    color: '#E74C3C',
  },
  {
    id: 'incendios',
    nombre: 'Incendios forestales',
    tipo: 'positivo',
    mecanismo: 'Más calor y sequía → más incendios → más CO₂ → más calor',
    magnitud: 'Efecto creciente, difícil de cuantificar',
    icono: '🔥',
    color: '#E74C3C',
  },
  {
    id: 'oceano',
    nombre: 'Absorción oceánica de CO₂',
    tipo: 'negativo',
    mecanismo: 'Más CO₂ atmosférico → mayor absorción oceánica → frena calentamiento',
    magnitud: 'Absorbe ~26% del CO₂ emitido; capacidad en disminución',
    icono: '🌊',
    color: '#27AE60',
  },
  {
    id: 'vegetacion',
    nombre: 'Absorción por vegetación terrestre',
    tipo: 'negativo',
    mecanismo: 'Más CO₂ → mayor fotosíntesis → más biomasa → menos CO₂',
    magnitud: 'Absorbe ~30% del CO₂; se satura con calentamiento extremo',
    icono: '🌱',
    color: '#27AE60',
  },
];

interface ConexionCascada {
  origen: string;
  destino: string;
  descripcion: string;
  intensidad: 'alta' | 'media' | 'baja';
}

const CONEXIONES: ConexionCascada[] = [
  { origen: 'artico', destino: 'amoc', descripcion: 'El deshielo ártico aporta agua dulce que debilita la AMOC', intensidad: 'alta' },
  { origen: 'groenlandia', destino: 'amoc', descripcion: 'La fusión de Groenlandia aporta agua dulce al Atlántico Norte', intensidad: 'alta' },
  { origen: 'amoc', destino: 'monzon', descripcion: 'El colapso de la AMOC desplaza los cinturones de lluvia tropicales', intensidad: 'alta' },
  { origen: 'monzon', destino: 'amazonas', descripcion: 'La alteración del monzón reduce las lluvias amazónicas', intensidad: 'media' },
  { origen: 'permafrost', destino: 'artico', descripcion: 'El metano del permafrost amplifica el calentamiento ártico', intensidad: 'alta' },
  { origen: 'amazonas', destino: 'boreales', descripcion: 'La savanización del Amazonas amplifica el CO₂ global, afectando a bosques boreales', intensidad: 'baja' },
  { origen: 'coral', destino: 'amazonas', descripcion: 'Pérdida de biodiversidad marina altera el ciclo del carbono oceánico', intensidad: 'baja' },
];

interface EscenarioIPCC {
  id: string;
  nombre: string;
  descripcion: string;
  temperatura: string;
  temperaturaBaja: string;
  temperaturaAlta: string;
  color: string;
  tippingPointsActivados: string[];
  consecuencias: string[];
}

const ESCENARIOS: EscenarioIPCC[] = [
  {
    id: 'ssp1',
    nombre: 'SSP1-1.9',
    descripcion: 'Emisiones netas cero antes de 2050. Transformación rápida hacia renovables.',
    temperatura: '+1,4°C',
    temperaturaBaja: '+1,0°C',
    temperaturaAlta: '+1,8°C',
    color: '#27AE60',
    tippingPointsActivados: ['artico', 'coral'],
    consecuencias: [
      'Pérdida parcial del Ártico marino en verano',
      'Degradación severa de corales (+50%)',
      'Nivel del mar: +0,3–0,6 m en 2100',
      'AMOC debilitada pero estable',
      'Permafrost: descongelación limitada',
    ],
  },
  {
    id: 'ssp2',
    nombre: 'SSP2-4.5',
    descripcion: 'Políticas actuales continuadas. Transición energética parcial y lenta.',
    temperatura: '+2,7°C',
    temperaturaBaja: '+2,1°C',
    temperaturaAlta: '+3,5°C',
    color: '#F39C12',
    tippingPointsActivados: ['artico', 'coral', 'permafrost', 'groenlandia', 'amoc'],
    consecuencias: [
      'Ártico sin hielo en verano de forma permanente',
      'Colapso del 90% de los arrecifes de coral',
      'Descongelación masiva del permafrost',
      'AMOC en colapso parcial o total',
      'Nivel del mar: +0,5–1,0 m en 2100',
      'Riesgo de savanización parcial del Amazonas',
    ],
  },
  {
    id: 'ssp5',
    nombre: 'SSP5-8.5',
    descripcion: 'Uso masivo de combustibles fósiles. Sin acción climática significativa.',
    temperatura: '+4,4°C',
    temperaturaBaja: '+3,3°C',
    temperaturaAlta: '+5,7°C',
    color: '#E74C3C',
    tippingPointsActivados: ['artico', 'coral', 'permafrost', 'groenlandia', 'antartida', 'amoc', 'amazonas', 'monzon', 'boreales'],
    consecuencias: [
      'Activación de 7–9 tipping points simultáneos',
      'Riesgo de "Hothouse Earth" (temperatura autosostenida)',
      'Nivel del mar: +0,6–1,6 m en 2100 (luego sigue subiendo)',
      'Extinción masiva de especies marinas y terrestres',
      'Colapso de la producción agrícola en zonas tropicales',
      'Centenares de millones de refugiados climáticos',
    ],
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorCambioClimatico() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('tipping');
  const [tippingSeleccionado, setTippingSeleccionado] = useState<string | null>(null);
  const [feedbackHover, setFeedbackHover] = useState<string | null>(null);
  const [escenarioSeleccionado, setEscenarioSeleccionado] = useState<string>('ssp2');

  const tippingDetalle = TIPPING_POINTS.find(tp => tp.id === tippingSeleccionado);
  const escenario = ESCENARIOS.find(e => e.id === escenarioSeleccionado)!;

  const getNombreTipping = (id: string) => TIPPING_POINTS.find(tp => tp.id === id)?.nombre ?? id;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroIcon} aria-hidden="true">🌍</span>
          <h1 className={styles.heroTitle}>Puntos de Inflexión Climáticos</h1>
          <p className={styles.heroSubtitle}>
            Retroalimentaciones, umbrales irreversibles y el sistema climático al límite
          </p>
          <div className={styles.heroStats}>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>9</span>
              <span className={styles.heroStatLabel}>Tipping Points</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>1,2°C</span>
              <span className={styles.heroStatLabel}>Calentamiento actual</span>
            </div>
            <div className={styles.heroStat}>
              <span className={styles.heroStatNum}>1,5°C</span>
              <span className={styles.heroStatLabel}>Umbral crítico</span>
            </div>
          </div>
        </div>
      </header>

      <LegalNotice />

      {/* Navegación de secciones */}
      <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
        {SECCIONES.map(sec => (
          <button
            key={sec.id}
            onClick={() => setSeccionActiva(sec.id)}
            className={`${styles.navBtn} ${seccionActiva === sec.id ? styles.navBtnActivo : ''}`}
            aria-pressed={seccionActiva === sec.id}
          >
            <span className={styles.navBtnIcono} aria-hidden="true">{sec.icono}</span>
            <span className={styles.navBtnTitulo}>{sec.titulo}</span>
            <span className={styles.navBtnSub}>{sec.subtitulo}</span>
          </button>
        ))}
      </nav>

      <main className={styles.main}>
        {/* ── SECCIÓN 1: TIPPING POINTS ── */}
        {seccionActiva === 'tipping' && (
          <section className={styles.seccion} aria-label="Tipping Points">
            <div className={styles.seccionHeader}>
              <h2 className={styles.seccionTitulo}>Los 9 Puntos de Inflexión Climáticos</h2>
              <p className={styles.seccionDesc}>
                Umbrales a partir de los cuales el sistema climático pasa a un nuevo estado de forma irreversible.
                Haz clic en cada tarjeta para ver el mecanismo detallado.
              </p>
            </div>
            <div className={styles.tippingGrid}>
              {TIPPING_POINTS.map(tp => (
                <button
                  key={tp.id}
                  className={`${styles.tippingCard} ${tippingSeleccionado === tp.id ? styles.tippingCardActiva : ''}`}
                  style={{ '--tp-color': tp.color } as React.CSSProperties}
                  onClick={() => setTippingSeleccionado(tippingSeleccionado === tp.id ? null : tp.id)}
                  aria-expanded={tippingSeleccionado === tp.id}
                >
                  <span className={styles.tippingIcono} aria-hidden="true">{tp.icono}</span>
                  <h3 className={styles.tippingNombre}>{tp.nombre}</h3>
                  <div className={styles.tippingUmbral}>
                    <span className={styles.tippingUmbralLabel}>Umbral:</span>
                    <span className={styles.tippingUmbralVal}>{tp.umbral}</span>
                  </div>
                  <p className={styles.tippingEstado}>{tp.estadoActual}</p>
                </button>
              ))}
            </div>

            {tippingDetalle && (
              <div className={styles.tippingDetalle} role="region" aria-label={`Detalle: ${tippingDetalle.nombre}`}>
                <div className={styles.tippingDetalleHeader}>
                  <span aria-hidden="true">{tippingDetalle.icono}</span>
                  <div>
                    <h3>{tippingDetalle.nombre}</h3>
                    <span className={styles.tippingDetalleUmbral}>{tippingDetalle.umbral}</span>
                  </div>
                  <button
                    className={styles.tippingDetalleCerrar}
                    onClick={() => setTippingSeleccionado(null)}
                    aria-label="Cerrar detalle"
                  >
                    ✕
                  </button>
                </div>
                <div className={styles.tippingDetalleBody}>
                  <div className={styles.tippingDetalleBloque}>
                    <h4>Impacto estimado</h4>
                    <p>{tippingDetalle.impacto}</p>
                  </div>
                  <div className={styles.tippingDetalleBloque}>
                    <h4>Mecanismo de retroalimentación</h4>
                    <p>{tippingDetalle.feedback}</p>
                  </div>
                  <div className={styles.tippingDetalleBloque}>
                    <h4>Contexto científico</h4>
                    <p>{tippingDetalle.detalles}</p>
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ── SECCIÓN 2: RETROALIMENTACIONES ── */}
        {seccionActiva === 'retroalimentaciones' && (
          <section className={styles.seccion} aria-label="Retroalimentaciones climáticas">
            <div className={styles.seccionHeader}>
              <h2 className={styles.seccionTitulo}>Retroalimentaciones del Sistema Climático</h2>
              <p className={styles.seccionDesc}>
                Los feedbacks determinan si el calentamiento se amplifica (positivos) o se amortigua (negativos).
                El balance actual favorece la amplificación.
              </p>
            </div>

            <div className={styles.feedbackLeyenda}>
              <div className={styles.feedbackLeyendaItem}>
                <span className={styles.feedbackDot} style={{ backgroundColor: '#E74C3C' }}></span>
                <span>Feedback positivo (amplifica el calentamiento)</span>
              </div>
              <div className={styles.feedbackLeyendaItem}>
                <span className={styles.feedbackDot} style={{ backgroundColor: '#27AE60' }}></span>
                <span>Feedback negativo (amortigua el calentamiento)</span>
              </div>
            </div>

            <div className={styles.feedbackGrid}>
              {FEEDBACKS.map(fb => (
                <div
                  key={fb.id}
                  className={`${styles.feedbackCard} ${fb.tipo === 'positivo' ? styles.feedbackPositivo : styles.feedbackNegativo} ${feedbackHover === fb.id ? styles.feedbackActivo : ''}`}
                  onMouseEnter={() => setFeedbackHover(fb.id)}
                  onMouseLeave={() => setFeedbackHover(null)}
                >
                  <div className={styles.feedbackTop}>
                    <span className={styles.feedbackIcono} aria-hidden="true">{fb.icono}</span>
                    <span className={`${styles.feedbackTipo} ${fb.tipo === 'positivo' ? styles.feedbackTipoPos : styles.feedbackTipoNeg}`}>
                      {fb.tipo === 'positivo' ? '↑ Amplifica' : '↓ Amortigua'}
                    </span>
                  </div>
                  <h3 className={styles.feedbackNombre}>{fb.nombre}</h3>
                  <div className={styles.feedbackFlujo}>
                    {fb.mecanismo.split('→').map((paso, i) => (
                      <div key={i} className={styles.feedbackFlujoRow}>
                        {i > 0 && <span className={styles.feedbackFlecha} aria-hidden="true">→</span>}
                        <span className={styles.feedbackPaso}>{paso.trim()}</span>
                      </div>
                    ))}
                  </div>
                  <div className={styles.feedbackMagnitud}>
                    <strong>Magnitud:</strong> {fb.magnitud}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.warningBox}>
              <span aria-hidden="true">⚠️</span>
              <div>
                <strong>Punto de no retorno ("Hothouse Earth")</strong>
                <p>
                  Si se superan suficientes tipping points simultáneamente, los feedbacks positivos podrían
                  mantener el calentamiento de forma autónoma — sin necesidad de emisiones humanas adicionales.
                  Los científicos estiman que este escenario podría producirse a partir de +2°C.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ── SECCIÓN 3: CASCADAS ── */}
        {seccionActiva === 'cascadas' && (
          <section className={styles.seccion} aria-label="Cascadas de tipping points">
            <div className={styles.seccionHeader}>
              <h2 className={styles.seccionTitulo}>Cascadas e Interconexiones</h2>
              <p className={styles.seccionDesc}>
                Los tipping points no son independientes. El colapso de uno puede desencadenar otros.
                Esto hace que las cascadas sean más peligrosas que la suma de sus partes.
              </p>
            </div>

            <div className={styles.cascadaGrid}>
              {TIPPING_POINTS.map(tp => {
                const conexionesSalientes = CONEXIONES.filter(c => c.origen === tp.id);
                const conexionesEntrantes = CONEXIONES.filter(c => c.destino === tp.id);
                return (
                  <div
                    key={tp.id}
                    className={styles.cascadaNodo}
                    style={{ '--tp-color': tp.color } as React.CSSProperties}
                  >
                    <div className={styles.cascadaNodoHeader}>
                      <span aria-hidden="true">{tp.icono}</span>
                      <div>
                        <strong>{tp.nombre}</strong>
                        <span className={styles.cascadaUmbral}>{tp.umbral}</span>
                      </div>
                    </div>
                    {conexionesSalientes.length > 0 && (
                      <div className={styles.cascadaConexiones}>
                        <span className={styles.cascadaConexLabel}>Activa:</span>
                        {conexionesSalientes.map((con, i) => (
                          <div key={i} className={`${styles.cascadaConexItem} ${styles[`cascadaIntens${con.intensidad}`]}`}>
                            <span className={styles.cascadaFlecha} aria-hidden="true">→</span>
                            <span>{getNombreTipping(con.destino)}</span>
                            <span className={styles.cascadaConexDesc}>{con.descripcion}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {conexionesEntrantes.length > 0 && (
                      <div className={styles.cascadaConexiones}>
                        <span className={styles.cascadaConexLabel}>Recibe de:</span>
                        {conexionesEntrantes.map((con, i) => (
                          <div key={i} className={`${styles.cascadaConexItem} ${styles.cascadaEntrada}`}>
                            <span className={styles.cascadaFlecha} aria-hidden="true">←</span>
                            <span>{getNombreTipping(con.origen)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.cascadaInfo}>
              <h3>La investigación de "Hothouse Earth" (Steffen et al., 2018)</h3>
              <p>
                Un estudio seminal en <em>PNAS</em> identificó que el sistema climático puede entrar en
                una "trayectoria invernadero" si se cruzan suficientes tipping points, incluso si las
                emisiones humanas cesan. El calentamiento podría estabilizarse en +4–5°C con un nivel del
                mar 10–60 m más alto que el actual (a escalas de siglos y milenios).
              </p>
            </div>
          </section>
        )}

        {/* ── SECCIÓN 4: ESCENARIOS IPCC ── */}
        {seccionActiva === 'escenarios' && (
          <section className={styles.seccion} aria-label="Escenarios IPCC AR6">
            <div className={styles.seccionHeader}>
              <h2 className={styles.seccionTitulo}>Escenarios de Emisiones IPCC AR6 (2021)</h2>
              <p className={styles.seccionDesc}>
                El IPCC define escenarios socioeconómicos (SSP) que muestran qué futuro climático
                nos espera según las decisiones que tomemos hoy.
              </p>
            </div>

            <div className={styles.escenarioSelector}>
              {ESCENARIOS.map(esc => (
                <button
                  key={esc.id}
                  className={`${styles.escenarioBtn} ${escenarioSeleccionado === esc.id ? styles.escenarioBtnActivo : ''}`}
                  style={{ '--esc-color': esc.color } as React.CSSProperties}
                  onClick={() => setEscenarioSeleccionado(esc.id)}
                  aria-pressed={escenarioSeleccionado === esc.id}
                >
                  <span className={styles.escenarioBtnNombre}>{esc.nombre}</span>
                  <span className={styles.escenarioBtnTemp}>{esc.temperatura}</span>
                </button>
              ))}
            </div>

            <div className={styles.escenarioDetalle} style={{ '--esc-color': escenario.color } as React.CSSProperties}>
              <div className={styles.escenarioDetalleHeader}>
                <div>
                  <h3 className={styles.escenarioNombre}>{escenario.nombre}</h3>
                  <p className={styles.escenarioDescripcion}>{escenario.descripcion}</p>
                </div>
                <div className={styles.escenarioTemps}>
                  <div className={styles.escenarioTempCentral}>{escenario.temperatura}</div>
                  <div className={styles.escenarioTempRango}>Rango: {escenario.temperaturaBaja} – {escenario.temperaturaAlta}</div>
                </div>
              </div>

              <div className={styles.escenarioCuerpo}>
                <div className={styles.escenarioTippings}>
                  <h4>Tipping Points en riesgo</h4>
                  <div className={styles.escenarioTippingsList}>
                    {TIPPING_POINTS.map(tp => {
                      const activado = escenario.tippingPointsActivados.includes(tp.id);
                      return (
                        <div
                          key={tp.id}
                          className={`${styles.escenarioTippingItem} ${activado ? styles.escenarioTippingActivado : styles.escenarioTippingSeguro}`}
                        >
                          <span aria-hidden="true">{tp.icono}</span>
                          <span>{tp.nombre}</span>
                          {activado
                            ? <span className={styles.escenarioRiesgo} aria-label="En riesgo">⚠</span>
                            : <span className={styles.escenarioOk} aria-label="Posiblemente seguro">✓</span>
                          }
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.escenarioConsecuencias}>
                  <h4>Consecuencias principales</h4>
                  <ul className={styles.escenarioLista}>
                    {escenario.consecuencias.map((con, i) => (
                      <li key={i} className={styles.escenarioListaItem}>{con}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className={styles.escenarioNota}>
              <p>
                <strong>Fuente:</strong> IPCC Sixth Assessment Report (AR6), 2021.
                Temperaturas indicadas como cambio respecto al período 1850–1900 (preindustrial).
                Estado climático actual (2024): ~+1,2°C sobre la media preindustrial.
              </p>
            </div>
          </section>
        )}
      </main>

      <EducationalSection
        title="¿Qué son los puntos de inflexión climáticos?"
        subtitle="Umbrales irreversibles y retroalimentaciones del sistema climático"
        icon="🌍"
      >
        {/* 1. Tabla comparativa */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <caption className={styles.comparativaCaption}>5 tipping points más críticos — Umbral, impacto y estado actual</caption>
            <thead>
              <tr>
                <th scope="col">Tipping Point</th>
                <th scope="col">Umbral (°C)</th>
                <th scope="col">Impacto principal</th>
                <th scope="col">Estado 2024</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Deshielo Ártico marino</td>
                <td>1,5–2°C</td>
                <td>+albedo → +0,6°C adicionales</td>
                <td>En progreso</td>
              </tr>
              <tr>
                <td>Permafrost Siberia</td>
                <td>1,5–2°C</td>
                <td>Metano → amplifica calentamiento</td>
                <td>En progreso</td>
              </tr>
              <tr>
                <td>Arrecifes de coral</td>
                <td>1,5–2°C</td>
                <td>Colapso ecosistema, 500 M personas</td>
                <td>50% afectados</td>
              </tr>
              <tr>
                <td>Hielo Groenlandia</td>
                <td>1,5–2°C</td>
                <td>+7 m nivel del mar (miles de años)</td>
                <td>Pérdida acelerada</td>
              </tr>
              <tr>
                <td>AMOC (corriente Atlántico)</td>
                <td>1,5–4°C</td>
                <td>Enfriamiento Europa, monzones</td>
                <td>Debilitamiento</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Perfiles de uso */}
        <div className={styles.escenariosGrid}>
          {[
            { icono: '🎓', titulo: 'Estudiante de ciencias ambientales', desc: 'Aprende los tipping points y sus retroalimentaciones para el examen.' },
            { icono: '📰', titulo: 'Ciudadano que sigue el cambio climático', desc: 'Quiere entender por qué 1,5°C es tan importante y qué consecuencias tiene.' },
            { icono: '🌿', titulo: 'Activista o docente', desc: 'Busca explicar las cascadas climáticas con datos rigurosos y visuales claros.' },
            { icono: '🏛️', titulo: 'Profesional de política pública', desc: 'Comprende el riesgo sistémico para evaluar escenarios del IPCC.' },
          ].map((perfil, i) => (
            <div key={i} className={styles.escenarioCard}>
              <span className={styles.escenarioCardIcono} aria-hidden="true">{perfil.icono}</span>
              <strong className={styles.escenarioCardTitulo}>{perfil.titulo}</strong>
              <p className={styles.escenarioCardDesc}>{perfil.desc}</p>
            </div>
          ))}
        </div>

        {/* 3. FAQ */}
        <dl className={styles.faqList}>
          {[
            {
              q: '¿Por qué 1,5°C es el umbral crítico y no 2°C?',
              a: 'Por encima de 1,5°C se activan simultáneamente varios tipping points. La diferencia entre 1,5 y 2°C implica 10 millones de personas más expuestas a inundaciones costeras y la desaparición práctica de los arrecifes de coral tropicales.',
            },
            {
              q: '¿El permafrost ya se está derritiendo?',
              a: 'Sí: se han detectado emisiones de metano en Siberia y Canadá, así como cráteres formados por explosiones de gas. Se estima que el permafrost almacena el doble de carbono que toda la atmósfera actual.',
            },
            {
              q: '¿Qué es el "Hothouse Earth"?',
              a: 'Escenario en que, superados suficientes tipping points, el sistema climático se autorrefuerza sin emisiones adicionales humanas. La temperatura se estabilizaría en ~4–5°C sobre la media preindustrial, con el nivel del mar 10–60 m más alto en escalas de siglos y milenios.',
            },
            {
              q: '¿Por qué el colapso del AMOC enfriaría Europa si hay calentamiento global?',
              a: 'El AMOC transporta calor tropical hacia el norte; su colapso reduciría las temperaturas de Europa occidental hasta 5–10°C, compensando o superando el calentamiento global en esa región, y alteraría los monzones africanos y asiáticos.',
            },
            {
              q: '¿El Amazonas ya alcanzó su tipping point?',
              a: 'No oficialmente, pero ~17% está deforestado y el umbral se estima entre 20–25%. Algunas zonas del este ya muestran comportamiento de sabana y emiten más CO₂ del que absorben.',
            },
            {
              q: '¿Se puede revertir un tipping point una vez activado?',
              a: 'Muy difícil: algunos son irreversibles en escalas humanas. El hielo marino ártico puede recuperarse si se enfría, pero el hielo de Groenlandia y la Antártida no lo harían en milenios.',
            },
          ].map((item, i) => (
            <div key={i} className={styles.faqItem}>
              <dt className={styles.faqPregunta}>{item.q}</dt>
              <dd className={styles.faqRespuesta}>{item.a}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.faqTip}>
          <strong>Fuentes:</strong> IPCC AR6 (2021), Lenton et al. (2008, 2018), Steffen et al. (2018) «Hothouse Earth», datos de temperatura NOAA/Copernicus 2024.
        </p>

        {/* 4. Guía paso a paso */}
        <ol className={styles.stepGuide}>
          {[
            'Las emisiones humanas elevan la temperatura global ~0,2°C/década (ritmo actual desde 1970).',
            'A ~1,5°C: el Ártico pierde hielo marino en verano → el océano oscuro absorbe más calor (retroalimentación albedo).',
            'El calentamiento adicional desestabiliza el permafrost → libera metano → el efecto invernadero se amplifica.',
            'El agua dulce del deshielo de Groenlandia entra en el Atlántico Norte → perturba el AMOC.',
            'El AMOC debilitado altera los patrones de lluvia → afecta al Amazonas (menos precipitación).',
            'Si el Amazonas supera el 20–25% de deforestación, colapsa en sabana → deja de ser sumidero y se convierte en fuente de CO₂.',
            'El sistema entra en autorrefuerzo: el calentamiento genera más calentamiento sin necesidad de nuevas emisiones humanas.',
          ].map((paso, i) => (
            <li key={i} className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">{i + 1}</span>
              <span className={styles.stepContent}>{paso}</span>
            </li>
          ))}
        </ol>

        {/* 5. Tips / datos clave */}
        <div className={styles.tipsGrid}>
          {[
            { icono: '📏', texto: 'La temperatura actual (2024): ~1,2°C sobre la media preindustrial. Estamos muy cerca de los umbrales críticos.' },
            { icono: '⏱️', texto: 'Los tipping points tienen inercia: aunque dejemos de emitir hoy, algunos procesos ya activados continuarán durante décadas.' },
            { icono: '🌊', texto: 'El nivel del mar ya sube 3,7 mm/año (2023): el doble que en 1993. La inercia oceánica lo prolongará durante siglos.' },
            { icono: '🔄', texto: 'No todos son negativos: la reforestación masiva en latitudes medias podría ser un tipping point positivo de absorción de carbono.' },
            { icono: '🌡️', texto: '2023 fue el año más cálido registrado en 125.000 años según paleoclimatología. Junio–noviembre de 2023 superó en >1,5°C la media preindustrial.' },
          ].map((tip, i) => (
            <div key={i} className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">{tip.icono}</span>
              <p>{tip.texto}</p>
            </div>
          ))}
        </div>

        {/* 6. Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores comunes sobre el cambio climático</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>«El clima siempre ha cambiado»</strong> — verdad, pero el ritmo actual (0,2°C/década) es 10–100 veces más rápido que cualquier cambio natural registrado en el registro geológico.</li>
            <li><strong>«El CO₂ es solo el 0,04% de la atmósfera, no puede hacer tanto»</strong> — la concentración es suficiente: sin CO₂ natural, la temperatura de la Tierra sería −18°C. Hemos pasado de 280 ppm (preindustrial) a 424 ppm (2024).</li>
            <li><strong>«El calentamiento beneficiará a los países fríos»</strong> — los costes globales (migraciones, pérdida de biodiversidad, eventos extremos) superan con creces los posibles beneficios locales.</li>
            <li><strong>«Las energías renovables no son suficientes»</strong> — en 2023 las renovables generaron el 30% de la electricidad mundial; la curva de adopción es exponencial.</li>
            <li><strong>«Un volcán produce más CO₂ que todos los humanos»</strong> — los volcanes emiten ~0,3 Gt CO₂/año; los humanos ~37 Gt CO₂/año (2023). Los humanos emiten ~120 veces más.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-cambio-climatico-tipping-points')} />
      <ShareCard appName="visualizador-cambio-climatico-tipping-points" />
      <Footer appName="visualizador-cambio-climatico-tipping-points" />
    </div>
  );
}
