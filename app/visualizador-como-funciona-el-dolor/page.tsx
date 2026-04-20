'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './ComoFuncionaElDolor.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type FaseNocicepcion = 'transduccion' | 'transmision' | 'modulacion' | 'percepcion';
type TipoDolor = 'agudo' | 'cronico' | 'neuropatico';

interface Fase {
  id: FaseNocicepcion;
  titulo: string;
  icono: string;
  subtitulo: string;
  color: string;
  colorBg: string;
}

interface TipoDolorInfo {
  id: TipoDolor;
  titulo: string;
  icono: string;
  color: string;
  colorBg: string;
  duracion: string;
  causa: string;
  mecanismo: string;
  tratamiento: string;
  dato?: string;
}

// ─────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────

const FASES: Fase[] = [
  {
    id: 'transduccion',
    titulo: 'Transducción',
    icono: '🔥',
    subtitulo: 'En el tejido lesionado',
    color: '#E67E22',
    colorBg: 'rgba(230,126,34,0.12)',
  },
  {
    id: 'transmision',
    titulo: 'Transmisión',
    icono: '⚡',
    subtitulo: 'Por el nervio',
    color: '#2E86AB',
    colorBg: 'rgba(46,134,171,0.12)',
  },
  {
    id: 'modulacion',
    titulo: 'Modulación',
    icono: '🔧',
    subtitulo: 'En la médula espinal',
    color: '#48A9A6',
    colorBg: 'rgba(72,169,166,0.12)',
  },
  {
    id: 'percepcion',
    titulo: 'Percepción',
    icono: '🧠',
    subtitulo: 'En el cerebro',
    color: '#9B59B6',
    colorBg: 'rgba(155,89,182,0.12)',
  },
];

const TIPOS_DOLOR: TipoDolorInfo[] = [
  {
    id: 'agudo',
    titulo: 'Dolor agudo',
    icono: '⚡',
    color: '#E67E22',
    colorBg: 'rgba(230,126,34,0.12)',
    duracion: 'Horas a días, máx. 3 meses',
    causa: 'Lesión identificable (corte, fractura, cirugía)',
    mecanismo: 'Señal de alarma: protege el tejido dañado evitando que se use',
    tratamiento: 'Analgésicos, reposo, curación de la causa subyacente',
  },
  {
    id: 'cronico',
    titulo: 'Dolor crónico',
    icono: '🔴',
    color: '#E74C3C',
    colorBg: 'rgba(231,76,60,0.12)',
    duracion: 'Más de 3 meses',
    causa: 'Puede no haber lesión activa: el sistema nervioso ha cambiado',
    mecanismo: 'Sensibilización central: la "alarma" queda encendida sin incendio',
    tratamiento: 'Multidisciplinar: fisioterapia, psicología del dolor, medicación, actividad',
    dato: 'Afecta al 20 % de la población europea',
  },
  {
    id: 'neuropatico',
    titulo: 'Dolor neuropático',
    icono: '🔮',
    color: '#8E44AD',
    colorBg: 'rgba(142,68,173,0.12)',
    duracion: 'Crónico',
    causa: 'Daño o disfunción del propio nervio (diabetes, herpes zóster, lesión medular)',
    mecanismo: 'El nervio dañado genera señales espontáneas o responde a estímulos no dolorosos',
    tratamiento: 'Anticonvulsivantes o antidepresivos a dosis bajas — el paracetamol no es efectivo',
    dato: 'Característica: quemazón, electricidad, alodinia (dolor ante estímulos normales como el roce)',
  },
];

interface PasoProcesamiento {
  numero: number;
  titulo: string;
  descripcion: string;
  icono: string;
}

const PASOS_PROCESAMIENTO: PasoProcesamiento[] = [
  { numero: 1, titulo: 'Estímulo dañino', descripcion: 'Mecánico, térmico o químico activa los nociceptores en el tejido', icono: '🔥' },
  { numero: 2, titulo: 'Transducción', descripcion: 'El nociceptor convierte el estímulo en señal eléctrica si supera el umbral', icono: '⚡' },
  { numero: 3, titulo: 'Transmisión', descripcion: 'La señal viaja por fibras A-delta (rápidas) o C (lentas) hasta la médula', icono: '🧵' },
  { numero: 4, titulo: 'Modulación', descripcion: 'La médula amplifica o atenúa la señal según el estado del organismo', icono: '🔧' },
  { numero: 5, titulo: 'Percepción', descripcion: 'El tálamo y la corteza crean la experiencia consciente del dolor', icono: '🧠' },
];

interface FilaDolores {
  tipo: string;
  duracion: string;
  mecanismo: string;
  enfoque: string;
}

const TABLA_DOLORES: FilaDolores[] = [
  { tipo: 'Agudo', duracion: '< 3 meses', mecanismo: 'Nociceptivo (lesión real)', enfoque: 'Analgesia + curar causa' },
  { tipo: 'Crónico', duracion: '> 3 meses', mecanismo: 'Sensibilización central', enfoque: 'Multidisciplinar' },
  { tipo: 'Neuropático', duracion: 'Crónico', mecanismo: 'Daño nervioso directo', enfoque: 'Anticonvulsivantes/AD' },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function ComoFuncionaElDolorPage() {
  const [faseActiva, setFaseActiva] = useState<FaseNocicepcion>('transduccion');
  const [tipoActivo, setTipoActivo] = useState<TipoDolor>('agudo');

  const faseInfo = FASES.find(f => f.id === faseActiva)!;
  const tipoInfo = TIPOS_DOLOR.find(t => t.id === tipoActivo)!;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">🧠</span> Cómo Funciona el Dolor</h1>
          <p className={styles.subtitle}>De la lesión al cerebro: fisiología de la nocicepción</p>
        </header>

        <LegalNotice />

        {/* ═══════ SECCIÓN 1: LAS 4 FASES ═══════ */}
        <section className={styles.seccionCard} aria-labelledby="titulo-fases">
          <h2 id="titulo-fases" className={styles.seccionTitulo}>Las 4 fases de la nocicepción</h2>
          <p className={styles.seccionDesc}>
            El dolor no es una señal simple: pasa por cuatro procesos antes de llegar a la conciencia.
          </p>

          {/* Selector de fases */}
          <nav className={styles.navFases} aria-label="Fases de la nocicepción">
            {FASES.map(fase => (
              <button
                key={fase.id}
                className={`${styles.faseBtn} ${faseActiva === fase.id ? styles.faseBtnActivo : ''}`}
                style={faseActiva === fase.id ? { borderColor: fase.color, background: fase.colorBg } : undefined}
                onClick={() => setFaseActiva(fase.id)}
                aria-pressed={faseActiva === fase.id}
              >
                <span className={styles.faseIcono} aria-hidden="true">{fase.icono}</span>
                <span className={styles.faseTitulo}>{fase.titulo}</span>
                <span className={styles.faseSubtitulo}>{fase.subtitulo}</span>
              </button>
            ))}
          </nav>

          {/* Contenido de la fase activa */}
          <div className={styles.faseContenido} style={{ borderColor: faseInfo.color }}>
            <div className={styles.faseHeader} style={{ background: faseInfo.colorBg }}>
              <span className={styles.faseHeaderIcono} aria-hidden="true">{faseInfo.icono}</span>
              <div>
                <h3 className={styles.faseHeaderTitulo} style={{ color: faseInfo.color }}>{faseInfo.titulo}</h3>
                <p className={styles.faseHeaderSub}>{faseInfo.subtitulo}</p>
              </div>
            </div>

            {faseActiva === 'transduccion' && (
              <div className={styles.faseBody}>
                <ul className={styles.listaPuntos}>
                  <li>Los <strong>nociceptores</strong> (terminaciones nerviosas libres) detectan el estímulo dañino en el tejido</li>
                  <li><strong>Tipos de estímulo:</strong> mecánico (presión/corte), térmico (calor/frío extremo), químico (ácidos, toxinas)</li>
                  <li><strong>Umbral de activación:</strong> la señal solo viaja si supera el umbral — por debajo no hay dolor consciente</li>
                  <li>Mediadores inflamatorios locales (prostaglandinas, bradiquinina) reducen el umbral → <strong>hiperalgesia primaria</strong></li>
                </ul>
                <div className={styles.faseInsight} style={{ background: faseInfo.colorBg, borderColor: faseInfo.color }}>
                  <strong>Por qué duele más una zona inflamada:</strong> los mediadores inflamatorios sensibilizan los nociceptores, bajando el umbral de activación. Por eso un leve roce duele en una quemadura.
                </div>
              </div>
            )}

            {faseActiva === 'transmision' && (
              <div className={styles.faseBody}>
                <div className={styles.fibrasGrid}>
                  <div className={styles.fibraCard} style={{ borderColor: '#2E86AB' }}>
                    <span className={styles.fibraLetra} style={{ color: '#2E86AB' }}>Aδ</span>
                    <span className={styles.fibraNombre}>Fibras A-delta</span>
                    <ul className={styles.fibraLista}>
                      <li>Mielínicas (con vaina)</li>
                      <li>Velocidad: 5–30 m/s</li>
                      <li>Dolor <strong>agudo y localizado</strong></li>
                      <li>&quot;Primer dolor&quot; — llega en milisegundos</li>
                    </ul>
                  </div>
                  <div className={styles.fibraCard} style={{ borderColor: '#E74C3C' }}>
                    <span className={styles.fibraLetra} style={{ color: '#E74C3C' }}>C</span>
                    <span className={styles.fibraNombre}>Fibras C</span>
                    <ul className={styles.fibraLista}>
                      <li>No mielínicas (sin vaina)</li>
                      <li>Velocidad: 0,5–2 m/s</li>
                      <li>Dolor <strong>sordo y difuso</strong></li>
                      <li>&quot;Segundo dolor&quot; — llega en segundos</li>
                    </ul>
                  </div>
                </div>
                <div className={styles.rutaVisual}>
                  <div className={styles.rutaPaso}>Nociceptor</div>
                  <span className={styles.rutaFlecha} aria-hidden="true">→</span>
                  <div className={styles.rutaPaso}>Nervio periférico</div>
                  <span className={styles.rutaFlecha} aria-hidden="true">→</span>
                  <div className={styles.rutaPaso}>Médula espinal</div>
                  <span className={styles.rutaFlecha} aria-hidden="true">→</span>
                  <div className={styles.rutaPaso}>Tálamo</div>
                </div>
                <div className={styles.faseInsight} style={{ background: faseInfo.colorBg, borderColor: faseInfo.color }}>
                  <strong>El fenómeno de doble impacto:</strong> al golpearte el dedo, primero sientes el dolor agudo (A-delta, milisegundos) y después el dolor profundo persistente (fibras C, 1-2 segundos). Son dos mensajes distintos viajando por rutas diferentes.
                </div>
              </div>
            )}

            {faseActiva === 'modulacion' && (
              <div className={styles.faseBody}>
                <div className={styles.teoriaBox}>
                  <h4 className={styles.teoriaTitulo}>Teoría de la Puerta (Melzack &amp; Wall, 1965)</h4>
                  <p>La médula espinal actúa como una <strong>puerta</strong> que puede amplificar o atenuar la señal de dolor antes de que llegue al cerebro.</p>
                </div>
                <div className={styles.modulacionGrid}>
                  <div className={styles.modulacionCard} style={{ borderColor: '#27AE60' }}>
                    <h4 className={styles.modulacionTitulo} style={{ color: '#27AE60' }}>🔒 Cierra la puerta (menos dolor)</h4>
                    <ul className={styles.listaPuntos}>
                      <li>Opioides endógenos (endorfinas, encefalinas)</li>
                      <li>Serotonina y noradrenalina</li>
                      <li>Estimulación de fibras A-beta (TENS, masaje, frío)</li>
                      <li>Estados de relajación, bienestar, distracción</li>
                    </ul>
                  </div>
                  <div className={styles.modulacionCard} style={{ borderColor: '#E74C3C' }}>
                    <h4 className={styles.modulacionTitulo} style={{ color: '#E74C3C' }}>🔓 Abre la puerta (más dolor)</h4>
                    <ul className={styles.listaPuntos}>
                      <li>Estrés y ansiedad sostenidos</li>
                      <li>Falta de sueño crónica</li>
                      <li>Atención focalizada en el dolor</li>
                      <li>Catastrofización y miedo al dolor</li>
                    </ul>
                  </div>
                </div>
                <div className={styles.faseInsight} style={{ background: faseInfo.colorBg, borderColor: faseInfo.color }}>
                  <strong>Por qué el TENS y el masaje funcionan:</strong> estimulan las fibras A-beta (tacto no doloroso) que activan interneurnas inhibidoras en la médula, cerrando la puerta para las señales de dolor de fibras C y A-delta.
                </div>
              </div>
            )}

            {faseActiva === 'percepcion' && (
              <div className={styles.faseBody}>
                <div className={styles.cerebroGrid}>
                  <div className={styles.cerebroArea} style={{ borderColor: '#2E86AB' }}>
                    <span className={styles.cerebroIcono} aria-hidden="true">📍</span>
                    <h4 style={{ color: '#2E86AB' }}>Corteza somatosensorial</h4>
                    <p>Localización e intensidad del dolor. Procesa el componente <strong>sensorial-discriminativo</strong>: ¿dónde duele y cuánto?</p>
                  </div>
                  <div className={styles.cerebroArea} style={{ borderColor: '#9B59B6' }}>
                    <span className={styles.cerebroIcono} aria-hidden="true">💜</span>
                    <h4 style={{ color: '#9B59B6' }}>Sistema límbico</h4>
                    <p>Componente emocional y afectivo: el sufrimiento, el miedo, la aversión. Explica por qué el mismo dolor puede sentirse muy diferente según el contexto.</p>
                  </div>
                  <div className={styles.cerebroArea} style={{ borderColor: '#48A9A6' }}>
                    <span className={styles.cerebroIcono} aria-hidden="true">🔬</span>
                    <h4 style={{ color: '#48A9A6' }}>Corteza prefrontal</h4>
                    <p>Evaluación cognitiva: interpretación, expectativas, memoria de dolores anteriores. El placebo actúa aquí activando opioides endógenos reales.</p>
                  </div>
                </div>
                <div className={styles.faseInsight} style={{ background: faseInfo.colorBg, borderColor: faseInfo.color }}>
                  <strong>Sin corteza activa, no hay dolor consciente:</strong> la anestesia general funciona desconectando la conciencia. Los estímulos dolorosos siguen activando reflejos en la médula, pero no se perciben. El dolor requiere un cerebro activo.
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ═══════ SECCIÓN 2: TIPOS DE DOLOR ═══════ */}
        <section className={styles.seccionCard} aria-labelledby="titulo-tipos">
          <h2 id="titulo-tipos" className={styles.seccionTitulo}>Tipos de dolor</h2>
          <p className={styles.seccionDesc}>
            No todo el dolor funciona igual. La clasificación orienta el tratamiento.
          </p>

          <div className={styles.navTipos} role="tablist" aria-label="Tipos de dolor">
            {TIPOS_DOLOR.map(tipo => (
              <button
                key={tipo.id}
                role="tab"
                aria-selected={tipoActivo === tipo.id}
                className={`${styles.tipoBtn} ${tipoActivo === tipo.id ? styles.tipoBtnActivo : ''}`}
                style={tipoActivo === tipo.id ? { borderColor: tipo.color, background: tipo.colorBg, color: tipo.color } : undefined}
                onClick={() => setTipoActivo(tipo.id)}
              >
                <span aria-hidden="true">{tipo.icono}</span> {tipo.titulo}
              </button>
            ))}
          </div>

          <div className={styles.tipoContenido} style={{ borderColor: tipoInfo.color }}>
            <div className={styles.tipoGrid}>
              <div className={styles.tipoCampo}>
                <span className={styles.tipoCampoLabel}>Duración</span>
                <span className={styles.tipoCampoValor}>{tipoInfo.duracion}</span>
              </div>
              <div className={styles.tipoCampo}>
                <span className={styles.tipoCampoLabel}>Causa habitual</span>
                <span className={styles.tipoCampoValor}>{tipoInfo.causa}</span>
              </div>
              <div className={styles.tipoCampo}>
                <span className={styles.tipoCampoLabel}>Mecanismo</span>
                <span className={styles.tipoCampoValor}>{tipoInfo.mecanismo}</span>
              </div>
              <div className={styles.tipoCampo}>
                <span className={styles.tipoCampoLabel}>Enfoque terapéutico</span>
                <span className={styles.tipoCampoValor}>{tipoInfo.tratamiento}</span>
              </div>
            </div>
            {tipoInfo.dato && (
              <div className={styles.tipoDato} style={{ background: tipoInfo.colorBg, borderColor: tipoInfo.color }}>
                <span aria-hidden="true">ℹ️</span> {tipoInfo.dato}
              </div>
            )}
          </div>
        </section>

        {/* ═══════ SECCIÓN 3: SENSIBILIZACIÓN CENTRAL ═══════ */}
        <section className={styles.sensibilizacionCard} aria-labelledby="titulo-sensi">
          <h2 id="titulo-sensi" className={styles.sensibilizacionTitulo}>
            <span aria-hidden="true">⚠️</span> La sensibilización central
          </h2>
          <p className={styles.sensibilizacionDesc}>
            El concepto clave para entender el dolor crónico
          </p>

          <div className={styles.sensibilizacionGrid}>
            <div className={styles.sensibilizacionItem}>
              <span className={styles.sensibilizacionIcono} aria-hidden="true">🔔</span>
              <h3>¿Qué ocurre?</h3>
              <p>
                En el dolor crónico, el sistema nervioso central se <strong>recalibra</strong>: baja el umbral
                de activación globalmente. El cerebro aprende a doler aunque no haya lesión nueva.
              </p>
            </div>
            <div className={styles.sensibilizacionItem}>
              <span className={styles.sensibilizacionIcono} aria-hidden="true">🚗</span>
              <h3>La analogía</h3>
              <p>
                Como una alarma de coche que se dispara con el viento. El mecanismo funciona,
                pero está mal calibrado. El problema ya no está en el &quot;peligro externo&quot; sino en
                el sistema de detección.
              </p>
            </div>
            <div className={styles.sensibilizacionItem}>
              <span className={styles.sensibilizacionIcono} aria-hidden="true">🔬</span>
              <h3>Ejemplos fisiológicos</h3>
              <p>
                Fibromialgia, lumbalgia crónica y cefalea tensional crónica muestran
                sensibilización central medible: el umbral al dolor es más bajo en todo el cuerpo,
                no solo en la zona afectada.
              </p>
            </div>
            <div className={styles.sensibilizacionItem}>
              <span className={styles.sensibilizacionIcono} aria-hidden="true">💡</span>
              <h3>Implicación clínica</h3>
              <p>
                Tratar solo la zona de dolor no es suficiente cuando hay sensibilización central.
                Es necesario modular el sistema nervioso central mediante fisioterapia, psicología
                del dolor, sueño, actividad gradual y, en algunos casos, medicación.
              </p>
            </div>
          </div>
        </section>

        {/* warningBox */}
        <div className={styles.warningBox}>
          <span aria-hidden="true">🔑</span>{' '}
          <strong>El dolor siempre es real:</strong> aunque no haya lesión visible, el dolor crónico
          no es &quot;imaginado&quot;. Los cambios en el sistema nervioso central son medibles y reales.
          Comprender el mecanismo es el primer paso del tratamiento.
        </div>

        {/* ═══════ CONTENIDO EDUCATIVO ═══════ */}
        <EducationalSection
          title="📚 Profundiza en la fisiología del dolor"
          subtitle="Conceptos clave para estudiantes, pacientes y cuidadores"
        >
          <section className={styles.guideSection}>
            <h2>El dolor como experiencia multidimensional</h2>
            <p>
              La IASP (Asociación Internacional para el Estudio del Dolor) define el dolor como
              &quot;una experiencia sensorial y emocional desagradable asociada, o similar a la asociada,
              con daño tisular real o potencial&quot;. Esta definición reconoce explícitamente que el
              dolor es siempre subjetivo y que su componente emocional es tan real como el físico.
            </p>

            <h3>¿Para quién es útil este explicador?</h3>
            <ul>
              <li><strong>Estudiantes de ciencias de la salud:</strong> fisioterapia, enfermería, medicina, psicología clínica — base para comprender el manejo del dolor.</li>
              <li><strong>Personas con dolor crónico:</strong> entender el mecanismo reduce la catastrofización y mejora el pronóstico (educación en neurociencia del dolor — PNE).</li>
              <li><strong>Cuidadores:</strong> comprender por qué el dolor crónico no significa &quot;lesión activa&quot; facilita el acompañamiento sin invalidar la experiencia.</li>
            </ul>

            <h3>Tabla resumen: tipos de dolor</h3>
            <div className={styles.tablaContainer}>
              <div className={styles.tablaHeader}>
                <span>Tipo</span>
                <span>Duración</span>
                <span>Mecanismo principal</span>
                <span>Enfoque terapéutico</span>
              </div>
              {TABLA_DOLORES.map(fila => (
                <div key={fila.tipo} className={styles.tablaFila}>
                  <span><strong>{fila.tipo}</strong></span>
                  <span>{fila.duracion}</span>
                  <span>{fila.mecanismo}</span>
                  <span>{fila.enfoque}</span>
                </div>
              ))}
            </div>

            <h3>Los 5 pasos del procesamiento del dolor</h3>
            <div className={styles.pasosContainer}>
              {PASOS_PROCESAMIENTO.map(paso => (
                <div key={paso.numero} className={styles.pasoCard}>
                  <div className={styles.pasoNumero}>{paso.numero}</div>
                  <div className={styles.pasoContenido}>
                    <span className={styles.pasoTitulo}>
                      <span aria-hidden="true">{paso.icono}</span> {paso.titulo}
                    </span>
                    <span className={styles.pasoDesc}>{paso.descripcion}</span>
                  </div>
                </div>
              ))}
            </div>

            <h3>Preguntas frecuentes</h3>

            <h4>¿Por qué el mismo dolor duele más de noche?</h4>
            <p>
              De noche hay menos distractores sensoriales y la atención se focaliza en el dolor.
              Además, el cortisol (hormonal antiinflamatoria) alcanza su nivel más bajo entre las 2-4 h.
              Los ritmos circadianos modulan la sensibilidad al dolor de forma medible.
            </p>

            <h4>¿Qué son los opioides endógenos?</h4>
            <p>
              Son moléculas producidas por el propio organismo (endorfinas, encefalinas, dinorfinas)
              que se unen a los mismos receptores que la morfina. Se liberan con el ejercicio intenso,
              la risa, el contacto social y, sí, también con el efecto placebo.
            </p>

            <h4>¿El dolor crónico es psicológico?</h4>
            <p>
              Esta dicotomía física/psicológica es obsoleta. Los cambios en el sistema nervioso central
              que produce el dolor crónico son biológicos y medibles (neuroimagen, estudios de umbral).
              Los factores psicológicos (ansiedad, catastrofización) modulan la intensidad del dolor,
              pero no lo &quot;generan&quot; de la nada: actúan sobre una base neurobiológica real.
            </p>

            <h4>¿Por qué el placebo funciona realmente?</h4>
            <p>
              El efecto placebo activa la liberación de opioides endógenos reales. Estudios con naloxona
              (bloqueador de opioides) demuestran que al bloquear estos receptores, el efecto placebo
              desaparece. El placebo no &quot;engaña&quot; al cerebro: le da la señal de que puede cerrar la puerta.
            </p>

            <h4>¿Se puede &quot;desaprender&quot; el dolor?</h4>
            <p>
              Sí, en cierta medida. La educación en neurociencia del dolor (PNE), la exposición gradual
              y la fisioterapia cognitivo-conductual pueden recalibrar el sistema nervioso central.
              El cerebro es plástico: puede aprender a doler, pero también puede aprender a no hacerlo.
              Esto sustenta los programas multidisciplinares para el dolor crónico.
            </p>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-como-funciona-el-dolor')} />
        <ShareCard appName="visualizador-como-funciona-el-dolor" />
        <Footer appName="visualizador-como-funciona-el-dolor" />
      </div>
    </>
  );
}
