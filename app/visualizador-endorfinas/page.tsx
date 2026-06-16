'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorEndorfinas.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface TipoEndorfina {
  nombre: string;
  subtitulo: string;
  descripcion: string;
  detalles: string[];
  color: string;
}

interface Activador {
  icono: string;
  nombre: string;
  mecanismo: string;
  detalle: string;
}

interface FilaComparativa {
  aspecto: string;
  endogeno: string;
  externo: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const TIPOS_ENDORFINAS: TipoEndorfina[] = [
  {
    nombre: 'Beta-endorfina (β-endorfina)',
    subtitulo: 'La más conocida y estudiada',
    descripcion: 'Producida en la hipófisis y el hipotálamo. Tiene afinidad muy alta por los receptores μ (mu), los mismos que activan los opioides externos.',
    detalles: [
      '31 aminoácidos de longitud',
      'Liberada en respuesta al estrés y el dolor',
      'Papel principal: analgesia y euforia',
      'Activa los receptores μ (mu) opioides',
    ],
    color: '#2E86AB',
  },
  {
    nombre: 'Encefalinas',
    subtitulo: 'Moduladores locales del dolor',
    descripcion: 'Péptidos más cortos (5 aminoácidos) que la β-endorfina. Distribuidas ampliamente en el sistema nervioso central y periférico.',
    detalles: [
      'Solo 5 aminoácidos (vs 31 de la β-endorfina)',
      'Modulación local del dolor en médula espinal',
      'También presentes en el intestino (sistema entérico)',
      'Activan receptores δ (delta) principalmente',
    ],
    color: '#48A9A6',
  },
  {
    nombre: 'Dinorfinas',
    subtitulo: 'Las más potentes de las tres familias',
    descripcion: 'Las más potentes de las tres familias. Pueden tener efectos tanto analgésicos como disfóricos según el receptor al que se unan.',
    detalles: [
      'Mayor potencia que las otras endorfinas',
      'Activan principalmente receptores κ (kappa)',
      'Papel en regulación del estrés y la adicción',
      'Los receptores κ pueden producir disforia',
    ],
    color: '#7FB3D3',
  },
];

const ACTIVADORES: Activador[] = [
  {
    icono: '🏃',
    nombre: 'Ejercicio intenso',
    mecanismo: 'Doble activación: opioides + endocannabinoides',
    detalle: 'Tanto β-endorfina como anandamida. Umbral: aeróbico ≥70% FCM durante ≥30 min. Las endorfinas reducen el dolor muscular periférico; la anandamida produce la euforia central.',
  },
  {
    icono: '😂',
    nombre: 'Reír',
    mecanismo: 'Activación de β-endorfina por risa sostenida',
    detalle: 'La risa genuina y sostenida activa la β-endorfina. Dunbar et al. (Oxford) mostraron que la risa en grupo eleva el umbral del dolor ~15% — marcador indirecto de activación endorfínica.',
  },
  {
    icono: '🌶️',
    nombre: 'Picante (capsaicina)',
    mecanismo: 'Respuesta compensatoria al dolor TRPV1',
    detalle: 'La capsaicina activa los receptores TRPV1 del dolor → el cerebro libera β-endorfinas como contrarregulación. El placer del picante viene de esta respuesta compensatoria.',
  },
  {
    icono: '🎶',
    nombre: 'Música emocionante',
    mecanismo: 'Escalofríos musicales y opioides endógenos',
    detalle: 'Los "frissons" (escalofríos musicales) se acompañan de liberación de opioides endógenos. Salimpoor et al. (2011): bloquear receptores opioides con naltrexona reducía el placer musical.',
  },
  {
    icono: '🤝',
    nombre: 'Contacto social',
    mecanismo: 'Grooming social y sistema opioide',
    detalle: 'En primates, el grooming activa el sistema opioide. En humanos, el contacto físico afectuoso tiene efecto similar — el umbral del dolor sube tras abrazos prolongados.',
  },
  {
    icono: '🍫',
    nombre: 'Chocolate negro',
    mecanismo: 'Teofilina, anandamida y estimulación endorfínica',
    detalle: 'El cacao contiene teofilina y pequeñas cantidades de anandamida, y estimula la producción de endorfinas por mecanismos aún en investigación. El efecto es modesto pero real.',
  },
  {
    icono: '💪',
    nombre: 'Dolor moderado + superación',
    mecanismo: 'Modulación opioide del dolor físico',
    detalle: 'El sistema opioide endógeno se activa ante el dolor físico moderado como mecanismo natural de modulación. El alivio tras el esfuerzo intenso tiene base endorfínica directa.',
  },
  {
    icono: '🧘',
    nombre: 'Meditación y acupuntura',
    mecanismo: 'Activación opioide en neuroimagen',
    detalle: 'Ambas técnicas muestran activación del sistema opioide endógeno en estudios de neuroimagen. La meditación de atención plena reduce la percepción del dolor via opioides endógenos.',
  },
];

const TABLA_COMPARATIVA: FilaComparativa[] = [
  {
    aspecto: 'Dosis',
    endogeno: 'Microgramos, liberada gradualmente',
    externo: 'Miligramos, entrada masiva y brusca',
  },
  {
    aspecto: 'Activación de receptores',
    endogeno: 'Moderada, localizada y controlada',
    externo: 'Masiva y generalizada',
  },
  {
    aspecto: 'Potencial de adicción',
    endogeno: 'Mínimo (el sistema se autorregula)',
    externo: 'Alto (el sistema se desensibiliza)',
  },
  {
    aspecto: 'Efecto en dopamina',
    endogeno: 'Indirecto y moderado',
    externo: 'Dispara dopamina masivamente',
  },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorEndorfinas() {
  const [activadorSeleccionado, setActivadorSeleccionado] = useState<number | null>(null);

  const relatedApps = getRelatedApps('visualizador-endorfinas');

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Endorfinas</h1>
        <p>Los opioides que fabrica tu propio cuerpo</p>
      </header>

      <LegalNotice />

      {/* ── BLOQUE 1: Qué son las endorfinas ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>¿Qué Son las Endorfinas? El Sistema Opioide Endógeno</h2>

        <div className={styles.tarjetaIntro}>
          <p className={styles.tarjetaIntroTexto}>
            Las endorfinas son <strong>opioides que fabrica tu propio cuerpo</strong>. La palabra viene de{' '}
            <em>endógeno</em> + <em>morfina</em>. Son péptidos — cadenas cortas de aminoácidos — que se unen a
            los mismos receptores que la morfina y la heroína, pero producidos internamente por el organismo.
          </p>
          <div className={styles.tarjetaIntroDestacado}>
            <span className={styles.tarjetaIntroIcono} aria-hidden="true">🔬</span>
            <span>
              Descubiertas en <strong>1975</strong> por Hughes y Kosterlitz en la Universidad de Aberdeen.
              El hallazgo explicó por primera vez por qué los opioides externos tienen efecto en el cerebro:
              porque ya existen receptores diseñados para moléculas similares que producimos nosotros mismos.
            </span>
          </div>
        </div>

        <div className={styles.gridTipos}>
          {TIPOS_ENDORFINAS.map((tipo) => (
            <div
              key={tipo.nombre}
              className={styles.tipoCard}
              style={{ borderTopColor: tipo.color }}
            >
              <h3 className={styles.tipoNombre}>{tipo.nombre}</h3>
              <p className={styles.tipoSubtitulo}>{tipo.subtitulo}</p>
              <p className={styles.tipoDescripcion}>{tipo.descripcion}</p>
              <ul className={styles.tipoDetalles}>
                {tipo.detalles.map((detalle) => (
                  <li key={detalle}>{detalle}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── BLOQUE 2: El gran mito del runner's high ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>El Gran Mito: El Runner&apos;s High NO es (solo) Endorfinas</h2>
        <p className={styles.sectionSubtitulo}>
          Este es el dato más sorprendente de la neurociencia popular reciente.
        </p>

        <div className={styles.mitoRealidad}>
          <div className={styles.mitoColumna}>
            <div className={styles.mitoHeader}>
              <span className={styles.mitoIcono} aria-hidden="true">❌</span>
              <h3>El mito popular</h3>
            </div>
            <p>
              &ldquo;El &apos;subidón del corredor&apos; viene de las endorfinas liberadas durante el ejercicio intenso.&rdquo;
            </p>
            <p className={styles.mitoOrigen}>
              <strong>Origen del mito:</strong> el descubrimiento de las endorfinas en los años 70 coincidió
              exactamente con el auge del running como deporte popular. La asociación fue obvia... pero incompleta.
            </p>
          </div>

          <div className={styles.realidadColumna}>
            <div className={styles.realidadHeader}>
              <span className={styles.realidadIcono} aria-hidden="true">✅</span>
              <h3>Lo que dice la ciencia</h3>
            </div>
            <p>
              Las endorfinas son moléculas <strong>grandes</strong> (péptidos) que <strong>NO cruzan fácilmente
              la barrera hematoencefálica</strong>. Sus efectos periféricos (analgesia muscular) son reales,
              pero la euforia central del runner&apos;s high es principalmente...
            </p>
          </div>
        </div>

        <div className={styles.tarjetaAnandamida}>
          <div className={styles.anandamidaHeader}>
            <span className={styles.anandamidaIcono} aria-hidden="true">🌿</span>
            <div>
              <h3 className={styles.anandamidaNombre}>Anandamida (AEA) — el endocannabinoide</h3>
              <p className={styles.anandamidaSubtitulo}>
                El protagonista real de la euforia del runner&apos;s high
              </p>
            </div>
          </div>
          <ul className={styles.anandamidaLista}>
            <li>
              <strong>Molécula lipídica</strong> (a diferencia de las endorfinas, que son péptidos) → cruza
              fácilmente la barrera hematoencefálica
            </li>
            <li>
              Se produce en el cerebro durante el ejercicio aeróbico sostenido
              (<strong>~45-60 minutos</strong>)
            </li>
            <li>
              Activa los <strong>receptores CB1</strong> — los mismos que activa el THC del cannabis
            </li>
            <li>
              Efecto: euforia, reducción de la ansiedad, sensación de tiempo dilatado
            </li>
          </ul>
          <div className={styles.anandamidaEstudio}>
            <strong>Estudio clave:</strong> Meyer et al. (2021, PNAS): ratones con bloqueantes de receptores
            opioides mantenían el runner&apos;s high. Los que tenían bloqueados los receptores
            endocannabinoides, no.
          </div>
        </div>

        <div className={styles.conclusionMito}>
          <div className={styles.conclusionItem}>
            <span className={styles.conclusionIcono} aria-hidden="true">💊</span>
            <div>
              <strong>Endorfinas</strong>
              <span>= alivio del dolor muscular (periférico)</span>
            </div>
          </div>
          <div className={styles.conclusionSeparador}>+</div>
          <div className={styles.conclusionItem}>
            <span className={styles.conclusionIcono} aria-hidden="true">🌿</span>
            <div>
              <strong>Anandamida</strong>
              <span>= la euforia del runner&apos;s high (central)</span>
            </div>
          </div>
          <p className={styles.conclusionTexto}>
            Ambas contribuyen — pero el protagonista de la euforia es el sistema endocannabinoide.
          </p>
        </div>
      </section>

      {/* ── BLOQUE 3: Activadores del sistema ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>¿Qué Activa el Sistema de Opioides Endógenos?</h2>
        <p className={styles.sectionSubtitulo}>
          Haz clic en cada activador para ver el mecanismo detallado.
        </p>

        <div className={styles.gridActivadores}>
          {ACTIVADORES.map((activador, index) => (
            <button
              key={activador.nombre}
              type="button"
              className={`${styles.activadorCard} ${activadorSeleccionado === index ? styles.activadorCardActivo : ''}`}
              onClick={() => setActivadorSeleccionado(activadorSeleccionado === index ? null : index)}
              aria-expanded={activadorSeleccionado === index}
              aria-label={`Ver detalle de ${activador.nombre}`}
            >
              <span className={styles.activadorIcono} aria-hidden="true">{activador.icono}</span>
              <span className={styles.activadorNombre}>{activador.nombre}</span>
              <span className={styles.activadorMecanismo}>{activador.mecanismo}</span>
              {activadorSeleccionado === index && (
                <p className={styles.activadorDetalle}>{activador.detalle}</p>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ── BLOQUE 4: Endorfinas vs Opioides externos ── */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Endorfinas vs Opioides Externos: Por Qué No Es lo Mismo</h2>
        <p className={styles.sectionSubtitulo}>
          El sistema endógeno y los opioides externos activan los mismos receptores, pero de maneras radicalmente distintas.
        </p>

        <div className={styles.tablaWrapper}>
          <table className={styles.tablaComparativa}>
            <thead>
              <tr>
                <th>Aspecto</th>
                <th>Sistema endógeno (endorfinas)</th>
                <th>Opioides externos (morfina, heroína)</th>
              </tr>
            </thead>
            <tbody>
              {TABLA_COMPARATIVA.map((fila) => (
                <tr key={fila.aspecto}>
                  <td className={styles.tablaAspecto}>{fila.aspecto}</td>
                  <td className={styles.tablaEndogeno}>{fila.endogeno}</td>
                  <td className={styles.tablaExterno}>{fila.externo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.warningBox}>
          <p>
            El sistema opioide endógeno está diseñado para la autorregulación. Los opioides externos
            &ldquo;engañan&rdquo; al sistema con señales mucho más intensas que cualquier estímulo natural,
            desensibilizando los receptores y creando dependencia.
          </p>
        </div>
      </section>

      {/* ── Sección educativa ── */}
      <EducationalSection
        title="Profundiza en el sistema opioide endógeno"
        subtitle="Endorfinas, endocannabinoides y neurociencia del placer"
      >
        <div className={styles.educativo}>
          <h3>¿Cómo se descubrieron las endorfinas? (1975)</h3>
          <p>
            John Hughes y Hans Kosterlitz en la Universidad de Aberdeen descubrieron que el cerebro
            producía sus propias sustancias opioides. La pregunta que los llevó al hallazgo: ¿por qué
            el cerebro tiene receptores para morfina? Solo podía ser porque ya había algo parecido en el
            organismo. Encontraron las encefalinas primero, y luego la β-endorfina. El hallazgo abrió toda
            la investigación moderna sobre el dolor, el placer y las adicciones.
          </p>

          <h3>Los cuatro tipos de receptores opioides</h3>
          <p>
            El sistema opioide endógeno opera a través de cuatro tipos de receptores, cada uno con efectos
            distintos según la molécula que los active:
          </p>
          <ul>
            <li><strong>μ (mu):</strong> Analgesia, euforia, sedación — diana principal de morfina y heroína</li>
            <li><strong>δ (delta):</strong> Analgesia, modulación del estado de ánimo, neuroprotección</li>
            <li><strong>κ (kappa):</strong> Analgesia, pero también disforia y alucinaciones</li>
            <li><strong>ORL1 (nociceptina):</strong> Modulación del dolor, el estrés y la memoria</li>
          </ul>

          <h3>El sistema endocannabinoide: anandamida y 2-AG</h3>
          <p>
            El sistema endocannabinoide es paralelo al opioide, con sus propios ligandos endógenos. Los
            dos principales son la anandamida (AEA) y el 2-araquidonoilglicerol (2-AG). A diferencia de los
            neurotransmisores clásicos, los endocannabinoides actúan como señales &ldquo;retrógradas&rdquo;:
            van del postsináptico al presináptico para modular la señal. El CBD no activa directamente los
            receptores CB1/CB2 — bloquea la enzima que degrada la anandamida (FAAH), aumentando sus niveles.
          </p>

          <h3>Endorfinas e inmunidad: receptores opioides en el sistema inmune</h3>
          <p>
            Las células del sistema inmune — linfocitos T, macrófagos, células NK — expresan receptores
            opioides funcionales. Las endorfinas pueden modular la respuesta inmune directamente. Este
            es uno de los vínculos biológicos entre el estado emocional y la salud inmune: no es solo
            metáfora, hay sustrato molecular.
          </p>

          <h3>¿Por qué el dolor frío intenso libera endorfinas? El efecto del hielo</h3>
          <p>
            La inmersión en agua fría activa los receptores TRPV1 y TRPA1 (detectores de temperatura
            extrema), que señalizan dolor. El sistema opioide endógeno responde liberando β-endorfinas para
            modular esa señal de dolor. El bienestar post-inmersión en agua fría combina esta respuesta
            opioide con la activación del sistema noradrenérgico y la normalización térmica progresiva.
          </p>

          <div className={styles.warningBox}>
            La neurociencia del placer y el dolor es fascinante y aún en investigación. Los efectos
            descritos son fenómenos poblacionales — la respuesta individual varía enormemente según
            genética, estado de salud, habituación previa y contexto.
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={relatedApps} />
      <ShareCard appName="visualizador-endorfinas" />
      <Footer appName="visualizador-endorfinas" />
    </div>
  );
}
