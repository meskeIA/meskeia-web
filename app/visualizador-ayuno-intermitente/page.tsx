'use client';

import { useState } from 'react';
import styles from './AyunoIntermitente.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  DisclaimerCard,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─── Tipos ───────────────────────────────────────────
type TabId = 'fases' | 'autofagia' | 'tipos' | 'contraindicaciones';

interface FaseMetabolica {
  id: string;
  rango: string;
  titulo: string;
  icono: string;
  color: string;
  combustible: string;
  insulina: string;
  descripcion: string;
  procesos: string[];
}

interface TipoAyuno {
  nombre: string;
  protocolo: string;
  icono: string;
  descripcion: string;
  ventanas: { ayuno: string; comer: string };
}

interface Contraindicacion {
  grupo: string;
  icono: string;
  razon: string;
  nivel: 'absoluta' | 'relativa';
}

// ─── Datos ───────────────────────────────────────────
const FASES: FaseMetabolica[] = [
  {
    id: 'absorcion',
    rango: '0 – 4 h',
    titulo: 'Absorción',
    icono: '🍽️',
    color: '#E8A838',
    combustible: 'Glucosa de la dieta',
    insulina: 'Muy alta',
    descripcion: 'El cuerpo procesa y absorbe los nutrientes de la última comida. La glucosa entra al torrente sanguíneo; el páncreas libera insulina para incorporarla a células y glucógeno.',
    procesos: [
      'Glucosa absorbida → glucógeno hepático y muscular',
      'Insulina en nivel máximo del ciclo',
      'Lipólisis (quema de grasa) prácticamente nula',
      'Exceso de glucosa → síntesis de ácidos grasos',
    ],
  },
  {
    id: 'postabsortivo',
    rango: '4 – 12 h',
    titulo: 'Ayuno temprano',
    icono: '⏰',
    color: '#48A9A6',
    combustible: 'Glucógeno hepático',
    insulina: 'Moderada, bajando',
    descripcion: 'La glucosa de la dieta se agota. El hígado libera glucosa desde sus reservas de glucógeno (aproximadamente 100 g) para mantener la glucemia. Los músculos también consumen su propio glucógeno.',
    procesos: [
      'Glucogenólisis hepática activa',
      'Insulina en descenso progresivo',
      'Glucagón comienza a ascender',
      'Inicio leve de movilización de ácidos grasos',
    ],
  },
  {
    id: 'gluconeogenesis',
    rango: '12 – 18 h',
    titulo: 'Gluconeogénesis',
    icono: '🔄',
    color: '#2E86AB',
    combustible: 'Glucosa de novo + ácidos grasos',
    insulina: 'Baja',
    descripcion: 'Las reservas de glucógeno se agotan o reducen significativamente. El hígado comienza a fabricar glucosa nueva a partir de aminoácidos (alanina, glutamina), glicerol y lactato. La lipólisis se acelera.',
    procesos: [
      'Gluconeogénesis hepática en marcha',
      'Lipólisis activa: ácidos grasos liberados de tejido adiposo',
      'Cortisol y glucagón dirigen el proceso',
      'Los músculos empiezan a usar ácidos grasos directamente',
    ],
  },
  {
    id: 'cetosis',
    rango: '18 – 48 h',
    titulo: 'Cetosis',
    icono: '⚡',
    color: '#5B4FC4',
    combustible: 'Cuerpos cetónicos + ácidos grasos',
    insulina: 'Muy baja',
    descripcion: 'El hígado convierte los ácidos grasos en cuerpos cetónicos (acetoacetato, beta-hidroxibutirato, acetona) que el cerebro y músculo pueden usar como combustible alternativo. La glucemia se estabiliza a valores bajos pero seguros.',
    procesos: [
      'Cetogénesis hepática activa',
      'Cerebro adapta su consumo: hasta 70% de energía desde cetonas',
      'Ahorro de proteínas musculares (a diferencia de ayuno prolongado sin cetosis)',
      'Insulina en mínimos: lipólisis máxima',
    ],
  },
  {
    id: 'autofagia-pico',
    rango: '24 – 72 h',
    titulo: 'Autofagia intensa',
    icono: '♻️',
    color: '#8B5E3C',
    combustible: 'Cuerpos cetónicos (principalmente)',
    insulina: 'Mínima',
    descripcion: 'La autofagia (limpieza celular) alcanza su máxima expresión. Las células degradan organelas y proteínas dañadas para reutilizar sus componentes. Este proceso está regulado por AMPK (alto) y mTOR (suprimido).',
    procesos: [
      'AMPK activada → señal de escasez energética',
      'mTOR inhibida → autofagia desbloqueada',
      'Degradación de proteínas y organelas dañadas',
      'Reciclaje de aminoácidos para síntesis crítica',
    ],
  },
];

const TIPOS_AYUNO: TipoAyuno[] = [
  {
    nombre: '16:8',
    protocolo: 'El más popular',
    icono: '⏱️',
    descripcion: 'Ayuno de 16 horas, ventana de alimentación de 8 horas. Por ejemplo: comer entre las 12:00 y las 20:00. Alcanza la gluconeogénesis moderada y algo de cetosis inicial.',
    ventanas: { ayuno: '16 horas', comer: '8 horas' },
  },
  {
    nombre: '5:2',
    protocolo: 'Semi-ayuno semanal',
    icono: '📅',
    descripcion: 'Cinco días de alimentación normal y dos días con ingesta muy reducida (500-600 kcal). Los días de restricción alcanzan fases de gluconeogénesis.',
    ventanas: { ayuno: '2 días/semana', comer: '5 días normales' },
  },
  {
    nombre: 'OMAD',
    protocolo: 'Una sola comida al día',
    icono: '🍽️',
    descripcion: 'Un único período de alimentación (1-2 horas) con ayuno de 22-23 horas. Alcanza cetosis con regularidad. Requiere especial atención a la ingesta nutricional completa.',
    ventanas: { ayuno: '22-23 horas', comer: '1-2 horas' },
  },
  {
    nombre: 'Ayuno 24h',
    protocolo: 'Ayuno completo de un día',
    icono: '🌙',
    descripcion: 'Ayuno de 24 horas completas, 1-2 veces por semana. Alcanza cetosis significativa y autofagia moderada. Conocido también como eat-stop-eat.',
    ventanas: { ayuno: '24 horas', comer: 'Resto de la semana' },
  },
];

const CONTRAINDICACIONES: Contraindicacion[] = [
  { grupo: 'Embarazo y lactancia', icono: '🤱', razon: 'Las necesidades nutricionales son mayores y constantes. El ayuno puede afectar el desarrollo fetal y la producción de leche.', nivel: 'absoluta' },
  { grupo: 'Diabetes tipo 1', icono: '💉', razon: 'El riesgo de hipoglucemia severa es alto. La cetosis inducida por ayuno puede confundirse con cetoacidosis diabética.', nivel: 'absoluta' },
  { grupo: 'Trastornos de conducta alimentaria', icono: '🧠', razon: 'El ayuno puede reforzar patrones restrictivos y desencadenar recaídas en anorexia, bulimia u otros TCA.', nivel: 'absoluta' },
  { grupo: 'Menores de 18 años', icono: '👦', razon: 'El crecimiento y el desarrollo requieren un aporte nutricional continuo y adecuado. No existe evidencia de seguridad en menores.', nivel: 'absoluta' },
  { grupo: 'Bajo peso o desnutrición', icono: '⚖️', razon: 'Las reservas de glucógeno y grasa son insuficientes para sostener períodos de ayuno sin riesgo de deterioro muscular y deficiencias.', nivel: 'absoluta' },
  { grupo: 'Diabetes tipo 2 con medicación', icono: '💊', razon: 'Algunos hipoglucemiantes (sulfonilureas, insulina) pueden causar hipoglucemia si no se ajusta la dosis. Requiere supervisión médica.', nivel: 'relativa' },
  { grupo: 'Personas con hipoglucemia reactiva', icono: '📉', razon: 'La bajada de glucosa puede ser sintomática y causar mareos, sudoración o pérdida de conciencia.', nivel: 'relativa' },
  { grupo: 'Tratamientos oncológicos', icono: '🏥', razon: 'La quimioterapia y radioterapia aumentan las necesidades energéticas y proteicas. Solo bajo protocolo médico específico.', nivel: 'relativa' },
];

// ─── Componente principal ─────────────────────────────
export default function AyunoIntermitentePage() {
  const [tabActiva, setTabActiva] = useState<TabId>('fases');
  const [faseSeleccionada, setFaseSeleccionada] = useState<string>('absorcion');

  const tabs: { id: TabId; label: string; icono: string }[] = [
    { id: 'fases', label: 'Fases metabólicas', icono: '⏱️' },
    { id: 'autofagia', label: 'Autofagia', icono: '♻️' },
    { id: 'tipos', label: 'Tipos de ayuno', icono: '📅' },
    { id: 'contraindicaciones', label: 'Contraindicaciones', icono: '⚠️' },
  ];

  const faseActual = FASES.find(f => f.id === faseSeleccionada) ?? FASES[0];

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon}>⏳</div>
        <h1>Ayuno Intermitente</h1>
        <p>Qué ocurre en tu cuerpo hora a hora: de la digestión a la cetosis y la autofagia</p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="medical"
        severity="high"
        collapsible={false}
        context="visualizador-ayuno-intermitente"
      >
        <p>
          Este visualizador explica <strong>mecanismos fisiológicos</strong> del ayuno con fines educativos.
          No constituye recomendación médica ni plan de alimentación.
        </p>
        <p>
          <strong>Cualquier cambio en tus hábitos alimentarios debe consultarse con un médico o dietista-nutricionista</strong>,
          especialmente si tienes alguna condición de salud. Consulta la pestaña{' '}
          <em>Contraindicaciones</em> para conocer los grupos en los que el ayuno puede ser perjudicial.
        </p>
      </DisclaimerCard>

      {/* Navegación tabs */}
      <nav className={styles.tabs} aria-label="Secciones del visualizador">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.tab} ${tabActiva === tab.id ? styles.tabActiva : ''}`}
            onClick={() => setTabActiva(tab.id)}
            aria-pressed={tabActiva === tab.id}
          >
            <span aria-hidden="true">{tab.icono}</span> {tab.label}
          </button>
        ))}
      </nav>

      {/* TAB: Fases metabólicas */}
      {tabActiva === 'fases' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Fases metabólicas del ayuno</h2>
          <p className={styles.seccionSubtitulo}>
            Selecciona una fase para ver qué combustible usa tu cuerpo y qué procesos se activan
          </p>

          {/* Timeline visual */}
          <div className={styles.timeline} role="list">
            {FASES.map(fase => (
              <button
                key={fase.id}
                role="listitem"
                className={`${styles.timelineItem} ${faseSeleccionada === fase.id ? styles.timelineActivo : ''}`}
                style={{ borderColor: fase.color }}
                onClick={() => setFaseSeleccionada(fase.id)}
                aria-pressed={faseSeleccionada === fase.id}
              >
                <span className={styles.timelineIcono} aria-hidden="true">{fase.icono}</span>
                <span className={styles.timelineRango}>{fase.rango}</span>
                <span className={styles.timelineTitulo}>{fase.titulo}</span>
              </button>
            ))}
          </div>

          {/* Detalle de la fase seleccionada */}
          <div className={styles.faseDetalle} style={{ borderLeftColor: faseActual.color }}>
            <div className={styles.faseHeader}>
              <span className={styles.faseIconoGrande} aria-hidden="true">{faseActual.icono}</span>
              <div>
                <h3 className={styles.faseTitulo}>{faseActual.titulo}</h3>
                <p className={styles.faseRango}>{faseActual.rango}</p>
              </div>
            </div>

            <div className={styles.faseMetrics}>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Combustible principal</span>
                <span className={styles.metricValor} style={{ color: faseActual.color }}>{faseActual.combustible}</span>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Nivel de insulina</span>
                <span className={styles.metricValor}>{faseActual.insulina}</span>
              </div>
            </div>

            <p className={styles.faseDescripcion}>{faseActual.descripcion}</p>

            <ul className={styles.procesosList}>
              {faseActual.procesos.map((proceso, i) => (
                <li key={i} className={styles.procesoItem}>
                  <span className={styles.procesoCheck} aria-hidden="true">→</span>
                  {proceso}
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.nota}>
            <strong>ℹ️ Nota:</strong> Los tiempos son orientativos y varían según el metabolismo basal,
            el nivel de actividad física, las reservas de glucógeno previas y la composición de la última comida.
          </div>
        </section>
      )}

      {/* TAB: Autofagia */}
      {tabActiva === 'autofagia' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Autofagia: la limpieza celular</h2>

          <div className={styles.autofagiaIntro}>
            <div className={styles.autofagiaIcono} aria-hidden="true">♻️</div>
            <p>
              La <strong>autofagia</strong> (del griego &ldquo;auto&rdquo; = uno mismo + &ldquo;fagia&rdquo; = comer)
              es el proceso por el que las células degradan y reciclan sus propios componentes dañados u obsoletos.
              Yoshinori Ohsumi recibió el Premio Nobel de Fisiología en 2016 por descubrir sus mecanismos moleculares.
            </p>
          </div>

          <div className={styles.autofagiaGrid}>
            <div className={styles.autofagiaCard}>
              <h3>¿Cuándo se activa?</h3>
              <p>
                La autofagia es un proceso continuo a niveles basales. Se <strong>amplifica significativamente</strong>{' '}
                cuando la célula detecta escasez de nutrientes o energía, lo que ocurre típicamente entre las
                16 y 24 horas de ayuno, aunque varía entre individuos.
              </p>
            </div>

            <div className={styles.autofagiaCard}>
              <h3>El interruptor molecular</h3>
              <p>
                Dos proteínas regulan el proceso:
              </p>
              <ul>
                <li><strong>AMPK</strong> (kinasa dependiente de AMP): se activa cuando el nivel de ATP baja. Es la señal de &ldquo;escasez&rdquo;.</li>
                <li><strong>mTOR</strong> (diana de rapamicina): cuando está activo (tras comer), inhibe la autofagia. En ayuno se suprime.</li>
              </ul>
            </div>

            <div className={styles.autofagiaCard}>
              <h3>¿Qué se recicla?</h3>
              <ul>
                <li>Proteínas mal plegadas o dañadas</li>
                <li>Mitocondrias disfuncionales (mitofagia)</li>
                <li>Patógenos intracelulares atrapados</li>
                <li>Orgánelas envejecidas</li>
              </ul>
            </div>

            <div className={styles.autofagiaCard}>
              <h3>Lo que dice la ciencia (con matices)</h3>
              <p>
                Los estudios en humanos sobre autofagia y ayuno son aún limitados. La mayoría de los hallazgos
                provienen de modelos animales o células en cultivo. No existe consenso sobre la duración de ayuno
                óptima para inducirla ni sobre si sus efectos son clínicamente relevantes en personas sanas.
              </p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <strong>⚠️ Importante:</strong> La autofagia no es una &ldquo;limpieza mágica&rdquo;. Es un proceso
            regulado con función fisiológica normal. Inducirla mediante ayuno extremo o prolongado sin supervisión
            puede tener efectos negativos, especialmente en personas con enfermedades crónicas.
          </div>
        </section>
      )}

      {/* TAB: Tipos de ayuno */}
      {tabActiva === 'tipos' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>Tipos de ayuno intermitente</h2>
          <p className={styles.seccionSubtitulo}>
            Descripción de los protocolos más estudiados. Esta información es descriptiva, no es una recomendación.
          </p>

          <div className={styles.tiposGrid}>
            {TIPOS_AYUNO.map(tipo => (
              <div key={tipo.nombre} className={styles.tipoCard}>
                <div className={styles.tipoHeader}>
                  <span className={styles.tipoIcono} aria-hidden="true">{tipo.icono}</span>
                  <div>
                    <h3 className={styles.tipoNombre}>{tipo.nombre}</h3>
                    <span className={styles.tipoProtocolo}>{tipo.protocolo}</span>
                  </div>
                </div>
                <div className={styles.tipoVentanas}>
                  <span className={styles.ventanaAyuno}>Ayuno: {tipo.ventanas.ayuno}</span>
                  <span className={styles.ventanaComer}>Alimentación: {tipo.ventanas.comer}</span>
                </div>
                <p className={styles.tipoDesc}>{tipo.descripcion}</p>
              </div>
            ))}
          </div>

          <div className={styles.nota}>
            <strong>ℹ️ Nota:</strong> Las fases metabólicas alcanzadas con cada protocolo dependen
            de los niveles previos de glucógeno, la actividad física y las características metabólicas individuales.
          </div>
        </section>
      )}

      {/* TAB: Contraindicaciones */}
      {tabActiva === 'contraindicaciones' && (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>¿Para quién no es adecuado el ayuno?</h2>
          <p className={styles.seccionSubtitulo}>
            El ayuno intermitente puede ser perjudicial en determinados grupos. Consulta siempre con tu médico.
          </p>

          <div className={styles.contraLeyenda}>
            <span className={styles.contraAbsoluta}>● Contraindicación absoluta</span>
            <span className={styles.contraRelativa}>● Requiere supervisión médica</span>
          </div>

          <div className={styles.contraGrid}>
            {CONTRAINDICACIONES.map(contra => (
              <div
                key={contra.grupo}
                className={`${styles.contraCard} ${contra.nivel === 'absoluta' ? styles.contraCardAbsoluta : styles.contraCardRelativa}`}
              >
                <div className={styles.contraHeader}>
                  <span className={styles.contraIcono} aria-hidden="true">{contra.icono}</span>
                  <h3 className={styles.contraGrupo}>{contra.grupo}</h3>
                  <span className={`${styles.contraBadge} ${contra.nivel === 'absoluta' ? styles.badgeAbsoluta : styles.badgeRelativa}`}>
                    {contra.nivel === 'absoluta' ? 'No recomendado' : 'Supervisión médica'}
                  </span>
                </div>
                <p className={styles.contraRazon}>{contra.razon}</p>
              </div>
            ))}
          </div>

          <div className={styles.warningBox}>
            <strong>⚕️ Recuerda:</strong> Esta lista no es exhaustiva. Ante cualquier duda sobre tu situación
            particular, consulta con un médico o dietista-nutricionista antes de modificar tus hábitos alimentarios.
          </div>
        </section>
      )}

      <EducationalSection
        title="📚 Fisiología del ayuno: guía completa"
        subtitle="Metabolismo, hormonas y mecanismos celulares explicados"
      >
        <h3>El papel de las hormonas durante el ayuno</h3>
        <p>
          El ayuno es, en gran medida, un estado hormonal. La <strong>insulina</strong> cae al reducirse la glucosa
          disponible, lo que libera el tejido adiposo para la lipólisis. El <strong>glucagón</strong> (producido
          por el páncreas) sube para estimular la liberación de glucosa hepática. El <strong>cortisol</strong>{' '}
          matutino activa la gluconeogénesis, razón por la que muchos protocolos de ayuno aprovechan las horas
          de sueño.
        </p>
        <p>
          La <strong>hormona del crecimiento (GH)</strong> aumenta durante el ayuno, especialmente en las fases
          de cetosis. Esto se ha relacionado con el mantenimiento de la masa muscular, aunque los mecanismos
          en humanos son más complejos que en modelos animales.
        </p>

        <h3>Cetosis vs. cetoacidosis: una distinción crítica</h3>
        <p>
          La <strong>cetosis nutricional</strong> inducida por el ayuno es un estado fisiológico normal con
          niveles de cuerpos cetónicos en sangre de 0,5-3 mmol/L. La <strong>cetoacidosis diabética</strong>{' '}
          (DKA), en cambio, ocurre en diabetes tipo 1 con niveles superiores a 10 mmol/L y es una emergencia
          médica. Son procesos completamente distintos: confundirlos es un error frecuente y peligroso.
        </p>

        <h3>Impacto en el microbioma intestinal</h3>
        <p>
          Investigaciones recientes sugieren que los períodos de ayuno pueden influir en la composición del
          microbioma intestinal, favoreciendo la diversidad bacteriana. Sin embargo, los datos en humanos
          son preliminares y no permiten conclusiones definitivas sobre qué protocolo es óptimo.
        </p>

        <h3>El debate sobre el músculo</h3>
        <p>
          Un temor habitual es que el ayuno cause pérdida muscular. En ayunos de menos de 24 horas en personas
          con reservas de glucógeno y grasa suficientes, la proteólisis muscular es mínima. En ayunos prolongados
          (más de 48-72 horas) la situación cambia. El contexto importa: la actividad física de fuerza y el
          aporte proteico adecuado en la ventana de alimentación son factores protectores.
        </p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-ayuno-intermitente')} />
      <ShareCard appName="visualizador-ayuno-intermitente" />
      <Footer appName="visualizador-ayuno-intermitente" />
    </div>
  );
}
