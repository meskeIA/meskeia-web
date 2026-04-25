'use client';
// @disclaimer: exempt

import { useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './Desinformacion.module.css';

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface Etapa {
  id: number;
  titulo: string;
  icono: string;
  colorBorde: string;
  resumen: string;
  detalle: string;
}

interface Sesgo {
  nombre: string;
  icono: string;
  resumen: string;
  detalle: string;
}

interface PasoVerificacion {
  numero: number;
  titulo: string;
  descripcion: string;
}

// ── Datos ─────────────────────────────────────────────────────────────────────

const ETAPAS: Etapa[] = [
  {
    id: 0,
    titulo: '1. Creación',
    icono: '🏭',
    colorBorde: '#E57C00',
    resumen: 'El contenido falso se fabrica o distorsiona',
    detalle:
      'Un bulo puede nacer de tres motivaciones principales: económica (sitios web de clickbait que generan ingresos publicitarios), política (desinformación coordinada para influir en elecciones o debate público), o entretenimiento/humor que pierde contexto al viralizarse.\n\nLos bulos más eficaces mezclan elementos reales con falsos, usan titulares emocionales y se presentan imitando el formato de medios legítimos. El 59% de los artículos compartidos en redes no son leídos (estudio Columbia University, 2016).',
  },
  {
    id: 1,
    titulo: '2. Amplificación',
    icono: '📢',
    colorBorde: '#D63031',
    resumen: 'Los algoritmos y las redes lo multiplican',
    detalle:
      'Los algoritmos de redes sociales optimizan para engagement (reacciones, comentarios, compartidos), y el contenido emocional —especialmente el que genera indignación o miedo— genera más interacción.\n\nLas cámaras de eco (echo chambers) son entornos donde solo se consume información que confirma las propias creencias. En grupos cerrados de WhatsApp o Telegram, el bulo circula sin exposición a refutaciones. La amplificación es exponencial: un post visto por 1.000 personas puede llegar a 1 millón en 24 horas si cada uno lo comparte con 10.',
  },
  {
    id: 2,
    titulo: '3. Viralización',
    icono: '🌐',
    colorBorde: '#C0392B',
    resumen: 'El bulo alcanza escala masiva e impacto real',
    detalle:
      'Un estudio del MIT (Vosoughi et al., Science, 2018) analizó 126.000 cadenas de rumores en Twitter entre 2006 y 2017. Resultado: las noticias falsas se difunden 6 veces más rápido que las verdaderas y llegan a 10 veces más personas.\n\n¿Por qué? Las noticias falsas son más novedosas (lo inusual sorprende) y generan reacciones emocionales más intensas (miedo, indignación). En el momento de máxima viralización, el bulo ya forma parte de la "realidad percibida" de millones de personas, independientemente de su veracidad.',
  },
  {
    id: 3,
    titulo: '4. Desmentido',
    icono: '🔍',
    colorBorde: '#27AE60',
    resumen: 'La corrección llega tarde y llega a menos',
    detalle:
      'Las correcciones y desmentidos tienen un problema estructural: llegan tarde y alcanzan a menos personas. El mismo estudio del MIT mostró que las correcciones tardan 6 veces más en alcanzar la misma audiencia que el bulo original.\n\nEl backfire effect (efecto rebote) describe el fenómeno por el que, en algunos casos, mostrar a una persona la corrección de un bulo refuerza su creencia inicial. Las plataformas muestran las correcciones a quienes ya las buscan, raramente a quienes compartieron el bulo. Los medios que publicaron el contenido falso rara vez dan la misma cobertura al desmentido.',
  },
];

const SESGOS: Sesgo[] = [
  {
    nombre: 'Sesgo de confirmación',
    icono: '🪞',
    resumen: 'Buscamos información que confirma lo que ya creemos',
    detalle:
      'Tendemos a aceptar sin crítica las noticias que encajan con nuestra visión del mundo y a rechazar (o no buscar) las que la cuestionan. Los bulos que confirman nuestros sesgos previos se comparten sin verificar.',
  },
  {
    nombre: 'Sesgo de disponibilidad',
    icono: '📱',
    resumen: 'Lo que vemos con frecuencia nos parece más verdadero',
    detalle:
      'Cuanto más veces encontramos una información —aunque sea falsa— más familiar y verdadera nos parece. La repetición masiva de un bulo en redes crea la ilusión de veracidad por mera exposición.',
  },
  {
    nombre: 'Efecto Dunning-Kruger',
    icono: '🧠',
    resumen: 'Cuanto menos sabemos de un tema, más seguros estamos',
    detalle:
      'Las personas con menos conocimiento sobre un tema suelen sobreestimar su comprensión de él y sentirse más seguras al compartir información sin contrastarla. El conocimiento profundo genera duda; la ignorancia genera certeza.',
  },
  {
    nombre: 'Apofenia',
    icono: '🔗',
    resumen: 'Encontramos patrones y conexiones donde no existen',
    detalle:
      'La mente humana está diseñada evolutivamente para encontrar patrones. A veces los encontramos donde no existen, lo que facilita las teorías conspirativas: cualquier coincidencia puede interpretarse como "prueba" de una conspiración.',
  },
  {
    nombre: 'Efecto Baader-Meinhof',
    icono: '👁️',
    resumen: 'Lo que acabamos de conocer lo vemos en todas partes',
    detalle:
      'Después de leer sobre algo por primera vez, empezamos a "verlo" constantemente. En el contexto de bulos, si alguien nos cuenta una historia falsa, empezará a encontrar "confirmaciones" de esa historia en todas partes, cuando en realidad solo está prestando más atención a ese tema.',
  },
  {
    nombre: 'Falacia ad hominem',
    icono: '⚔️',
    resumen: 'Atacamos a la persona en vez de argumentar el hecho',
    detalle:
      'En lugar de refutar un dato con evidencia, se ataca la credibilidad, motivación o identidad del mensajero. Los desmentidos suelen recibir esta respuesta: "eso lo dice [grupo X] porque tiene intereses en [Y]", evitando así analizar la evidencia.',
  },
];

const PASOS: PasoVerificacion[] = [
  {
    numero: 1,
    titulo: 'Fuente',
    descripcion:
      '¿Quién lo publica? ¿Es un medio reconocido? ¿Aparece en otras fuentes independientes?',
  },
  {
    numero: 2,
    titulo: 'Fecha',
    descripcion:
      '¿Cuándo ocurrió realmente? Los bulos a menudo reciclan eventos antiguos con nueva presentación.',
  },
  {
    numero: 3,
    titulo: 'Autor',
    descripcion:
      '¿Tiene firma? ¿Existe esa persona? ¿Tiene historial verificable en otras publicaciones?',
  },
  {
    numero: 4,
    titulo: 'Contexto',
    descripcion:
      '¿La imagen o el dato se presentan fuera de contexto? ¿Qué dice el texto completo del artículo?',
  },
  {
    numero: 5,
    titulo: 'Imagen inversa',
    descripcion:
      'Buscar la imagen en Google Images o TinEye para ver si fue reutilizada de otro contexto o fecha.',
  },
];

// ── Componente principal ───────────────────────────────────────────────────────

export default function DesinformacionPage() {
  const [etapaActiva, setEtapaActiva] = useState<number>(0);
  const [sesgosExpandidos, setSesgosExpandidos] = useState<Set<number>>(new Set());

  const toggleSesgo = (idx: number) => {
    setSesgosExpandidos(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const etapaSeleccionada = ETAPAS[etapaActiva];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* ── Hero ── */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>Pensamiento Crítico</span>
          <h1 className={styles.heroTitle}>El Ciclo de la Desinformación</h1>
          <p className={styles.heroSubtitle}>
            Cómo nace, se amplifica y por qué los bulos ganan a la verdad
          </p>
          <p className={styles.heroDesc}>
            Explora las 4 etapas del ciclo de un bulo, los 6 sesgos cognitivos que lo amplifican
            y las herramientas para verificar información antes de compartirla.
          </p>
        </div>
      </header>

      <LegalNotice />

      {/* ── Sección 1: Las 4 etapas ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">🔄</span>
            <h2 className={styles.sectionTitle}>Las 4 etapas del ciclo</h2>
            <p className={styles.sectionSubtitle}>
              Haz clic en cada etapa para explorar cómo funciona en detalle.
            </p>
          </div>

          <div className={styles.etapasGrid}>
            {ETAPAS.map(etapa => (
              <button
                key={etapa.id}
                type="button"
                className={`${styles.etapaTarjeta} ${etapaActiva === etapa.id ? styles.etapaActiva : ''}`}
                style={{ borderTopColor: etapa.colorBorde }}
                onClick={() => setEtapaActiva(etapa.id)}
                aria-pressed={etapaActiva === etapa.id}
                aria-controls="panel-detalle-etapa"
              >
                <span className={styles.etapaIcono} aria-hidden="true">{etapa.icono}</span>
                <p className={styles.etapaTitulo}>{etapa.titulo}</p>
                <p className={styles.etapaResumen}>{etapa.resumen}</p>
              </button>
            ))}
          </div>

          {etapaSeleccionada && (
            <div
              id="panel-detalle-etapa"
              className={styles.panelDetalle}
              role="region"
              aria-label={`Detalle: ${etapaSeleccionada.titulo}`}
            >
              <div className={styles.panelDetalleHeader}>
                <span aria-hidden="true">{etapaSeleccionada.icono}</span>
                <h3 className={styles.panelDetalleTitulo}>{etapaSeleccionada.titulo}</h3>
              </div>
              {etapaSeleccionada.detalle.split('\n\n').map((parrafo, idx) => (
                <p key={idx} className={styles.panelDetalleParrafo}>
                  {parrafo}
                </p>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Sección 2: Insight MIT ── */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.insightBox} role="note">
            <p className={styles.insightLabel}>Dato clave — MIT, Science 2018</p>
            <p className={styles.insightTexto}>
              Los bulos viajan <strong>6 veces más rápido</strong> que la verdad y llegan
              a <strong>10 veces más personas</strong>. El análisis abarcó 126.000 cadenas de
              rumores en Twitter entre 2006 y 2017.
            </p>
            <p className={styles.insightFuente}>
              Vosoughi, Roy &amp; Aral — &ldquo;The spread of true and false news online&rdquo;,{' '}
              <em>Science</em>, vol. 359, 2018.
            </p>
          </div>
        </div>
      </section>

      {/* ── Sección 3: 6 sesgos cognitivos ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">🧩</span>
            <h2 className={styles.sectionTitle}>6 sesgos que amplifican el bulo</h2>
            <p className={styles.sectionSubtitle}>
              Haz clic en cada sesgo para entender por qué somos vulnerables.
            </p>
          </div>

          <div className={styles.sesgosGrid}>
            {SESGOS.map((sesgo, idx) => {
              const expandido = sesgosExpandidos.has(idx);
              return (
                <article
                  key={sesgo.nombre}
                  className={styles.sesgoBloq}
                  onClick={() => toggleSesgo(idx)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleSesgo(idx);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={expandido}
                  aria-label={sesgo.nombre}
                >
                  <div className={styles.sesgoHeader}>
                    <span className={styles.sesgoIcono} aria-hidden="true">{sesgo.icono}</span>
                    <div>
                      <p className={styles.sesgoNombre}>{sesgo.nombre}</p>
                      <p className={styles.sesgoResumen}>{sesgo.resumen}</p>
                    </div>
                  </div>
                  {expandido && (
                    <p className={styles.sesgoDetalle}>{sesgo.detalle}</p>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Sección 4: Cómo verificar ── */}
      <section className={styles.sectionAlt}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">✅</span>
            <h2 className={styles.sectionTitle}>Cómo verificar antes de compartir</h2>
            <p className={styles.sectionSubtitle}>
              5 comprobaciones rápidas para detectar un bulo antes de difundirlo.
            </p>
          </div>

          <div className={styles.pasosGrid}>
            {PASOS.map(paso => (
              <div key={paso.numero} className={styles.pasoCard}>
                <span className={styles.pasoBadge} aria-hidden="true">{paso.numero}</span>
                <p className={styles.pasoTitulo}>{paso.titulo}</p>
                <p className={styles.pasoDesc}>{paso.descripcion}</p>
              </div>
            ))}
          </div>

          <div className={styles.recursosBox}>
            <p className={styles.recursosLabel}>Recursos de verificación en España</p>
            <div className={styles.recursosLista}>
              <span className={styles.recursoChip}>Maldita.es</span>
              <span className={styles.recursoChip}>AFP Factual</span>
              <span className={styles.recursoChip}>Newtral</span>
              <span className={styles.recursoChip}>EFE Verifica</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Sección 5: DSA 2023 ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.dsaBox} role="note">
            <div className={styles.dsaHeader}>
              <span className={styles.dsaIcono} aria-hidden="true">🇪🇺</span>
              <h3 className={styles.dsaTitulo}>Ley de Servicios Digitales (DSA) — en vigor desde 2023</h3>
            </div>
            <ul className={styles.dsaLista}>
              <li>
                Las plataformas con más de 45 millones de usuarios en la UE deben identificar
                y eliminar contenido ilegal, incluida la desinformación verificada por autoridades.
              </li>
              <li>
                Obligación de ofrecer sistemas de recomendación sin perfilado: el usuario puede
                optar por un feed cronológico sin algoritmo de amplificación.
              </li>
              <li>
                Supervisión independiente con acceso a datos internos de las plataformas para
                investigadores acreditados por los Estados miembros.
              </li>
            </ul>
            <p className={styles.dsaFuente}>
              Reglamento (UE) 2022/2065 — Digital Services Act.
            </p>
          </div>
        </div>
      </section>

      {/* ── Sección educativa ── */}
      <EducationalSection
        title="Medios y desinformación en España"
        subtitle="Contexto, tendencias y recursos para verificar información"
        defaultOpen={false}
      >
        <h3>El ecosistema informativo español</h3>
        <p>
          Según el Reuters Institute Digital News Report 2023, España tiene uno de los niveles
          más bajos de confianza en los medios de comunicación de Europa occidental (33% confía
          en las noticias en general). Esta desconfianza generalizada es terreno fértil para la
          desinformación: cuando no se confía en los medios verificados, los bulos llenan el vacío.
        </p>
        <p>
          Al mismo tiempo, España cuenta con una red sólida de verificadores independientes:
          Maldita.es, Newtral y EFE Verifica son reconocidos por la IFCN (International
          Fact-Checking Network) y verifican decenas de bulos cada semana.
        </p>

        <h3>Tipos de desinformación</h3>
        <p>
          No toda información falsa es igual. Claire Wardle (First Draft) propone una taxonomía
          útil de siete tipos:
        </p>
        <ul>
          <li><strong>Sátira/parodia</strong>: sin intención de dañar pero puede engañar</li>
          <li><strong>Contenido engañoso</strong>: uso engañoso de información real</li>
          <li><strong>Contenido impostor</strong>: fuentes genuinas suplantadas</li>
          <li><strong>Contenido fabricado</strong>: 100% falso, diseñado para engañar</li>
          <li><strong>Conexión falsa</strong>: titulares o imágenes que no reflejan el contenido</li>
          <li><strong>Contexto falso</strong>: contenido genuino con contexto falso</li>
          <li><strong>Contenido manipulado</strong>: información o imágenes genuinas manipuladas</li>
        </ul>

        <h3>La asimetría del desmentido</h3>
        <p>
          Existe una asimetría estructural entre la propagación del bulo y su corrección.
          Un bulo se comparte por sorpresa, indignación o humor; una corrección se comparte
          por deber cívico. Emocionalmente, el bulo gana casi siempre.
        </p>
        <p>
          Las investigaciones muestran que las correcciones son más efectivas cuando:
          se presentan con una narrativa alternativa (no solo negando el bulo),
          provienen de alguien de confianza del mismo entorno ideológico,
          y se ofrecen en el momento justo (no mucho después de la exposición al bulo).
        </p>

        <h3>IA y desinformación: el desafío de los próximos años</h3>
        <p>
          Los modelos de lenguaje y la IA generativa han reducido drásticamente el coste de
          producción de desinformación sofisticada: textos convincentes, imágenes falsas
          (deepfakes), vídeos manipulados y audios sintéticos. El DSA y el Reglamento de IA
          de la UE (AI Act, 2024) exigen marcado de contenido generado por IA, pero la
          verificación técnica sigue siendo un reto abierto.
        </p>

        <div className={styles.warningBox}>
          <strong>Fuentes:</strong> Estudio MIT (Vosoughi et al., Science 2018), Reuters Institute
          Digital News Report 2023, Directiva DSA (UE) 2022/2065, Columbia University / Chartbeat 2016,
          Claire Wardle — First Draft News, IFCN (poynter.org).
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-desinformacion')} />
      <ShareCard appName="visualizador-desinformacion" />
      <Footer appName="visualizador-desinformacion" />
    </div>
  );
}
