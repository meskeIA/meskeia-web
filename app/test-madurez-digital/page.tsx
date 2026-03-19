'use client';

import { useState, useMemo } from 'react';
import styles from './TestMadurezDigital.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

interface Pregunta {
  id: number;
  dimension: number;
  texto: string;
}

interface Dimension {
  id: number;
  emoji: string;
  titulo: string;
  descripcion: string;
}

interface PerfilMadurez {
  nombre: string;
  emoji: string;
  descripcion: string;
  recomendaciones: Array<{ titulo: string; desc: string }>;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const OPCIONES = [
  { puntos: 1, etiqueta: 'Casi nunca' },
  { puntos: 2, etiqueta: 'A veces' },
  { puntos: 3, etiqueta: 'Con frecuencia' },
  { puntos: 4, etiqueta: 'Siempre' },
];

const DIMENSIONES: Dimension[] = [
  { id: 1, emoji: '💻', titulo: 'Herramientas digitales', descripcion: 'Comunicación y colaboración' },
  { id: 2, emoji: '🤖', titulo: 'Inteligencia Artificial', descripcion: 'Uso de IA en el día a día' },
  { id: 3, emoji: '⚙️', titulo: 'Automatización', descripcion: 'Procesos y tareas automáticas' },
  { id: 4, emoji: '📚', titulo: 'Cultura digital', descripcion: 'Formación y mentalidad digital' },
  { id: 5, emoji: '📊', titulo: 'Datos y decisiones', descripcion: 'Análisis y toma de decisiones' },
];

const PREGUNTAS: Pregunta[] = [
  // Dimensión 1 — Herramientas digitales
  { id: 1, dimension: 1, texto: 'En mi empresa usamos herramientas de colaboración en la nube (Teams, Slack, Google Workspace…) para comunicarnos y compartir documentos.' },
  { id: 2, dimension: 1, texto: 'Las reuniones y presentaciones se hacen habitualmente de forma digital o híbrida, con herramientas como Zoom, Meet o Teams.' },
  { id: 3, dimension: 1, texto: 'Los documentos y proyectos están almacenados en la nube y son accesibles para el equipo desde cualquier dispositivo.' },
  // Dimensión 2 — IA
  { id: 4, dimension: 2, texto: 'Mis compañeros usan herramientas de IA (ChatGPT, Copilot, Gemini…) para tareas cotidianas como redactar emails, resumir documentos o hacer búsquedas.' },
  { id: 5, dimension: 2, texto: 'La empresa ha adoptado o está evaluando soluciones de IA para mejorar la productividad o los procesos de negocio.' },
  { id: 6, dimension: 2, texto: 'Existe una política o guía interna sobre cómo usar la IA de forma responsable (privacidad de datos, verificación de resultados, etc.).' },
  // Dimensión 3 — Automatización
  { id: 7, dimension: 3, texto: 'Tareas repetitivas como envío de informes, notificaciones o copias de seguridad están automatizadas con herramientas como Zapier, Power Automate o scripts.' },
  { id: 8, dimension: 3, texto: 'Los flujos de trabajo entre departamentos (ventas, operaciones, atención al cliente) están parcialmente automatizados.' },
  { id: 9, dimension: 3, texto: 'Se miden y optimizan los procesos con el objetivo de reducir tareas manuales y errores humanos.' },
  // Dimensión 4 — Cultura digital
  { id: 10, dimension: 4, texto: 'La empresa ofrece formación continua sobre herramientas digitales, nuevas tecnologías o tendencias del sector.' },
  { id: 11, dimension: 4, texto: 'Los mandos intermedios y la dirección muestran interés activo en adoptar nuevas tecnologías y promover la digitalización.' },
  { id: 12, dimension: 4, texto: 'Los empleados se sienten cómodos probando nuevas herramientas digitales sin miedo a equivocarse o ser penalizados.' },
  // Dimensión 5 — Datos y decisiones
  { id: 13, dimension: 5, texto: 'Las decisiones de negocio importantes se toman con base en datos e indicadores (KPIs) y no solo por intuición.' },
  { id: 14, dimension: 5, texto: 'Disponemos de paneles o informes digitales (dashboards) que permiten ver el estado del negocio en tiempo real o casi real.' },
  { id: 15, dimension: 5, texto: 'Los datos de clientes, ventas u operaciones se analizan regularmente para identificar oportunidades o problemas.' },
];

const PERFILES: Record<string, PerfilMadurez> = {
  analogica: {
    nombre: 'Empresa Analógica',
    emoji: '🏭',
    descripcion: 'Tu empresa opera principalmente con procesos tradicionales y tiene una adopción digital mínima. La digitalización aún no es una prioridad real o hay resistencias importantes al cambio.',
    recomendaciones: [
      { titulo: 'Empieza por lo básico', desc: 'Adopta una suite de colaboración en la nube (Microsoft 365 o Google Workspace). Es el primer paso con mayor retorno.' },
      { titulo: 'Forma al equipo', desc: 'Organiza sesiones básicas de formación digital. La cultura es el mayor obstáculo en empresas analógicas.' },
      { titulo: 'Un proceso a la vez', desc: 'Digitaliza un proceso manual (ej: solicitudes de vacaciones o aprobación de facturas). El éxito visible genera tracción.' },
      { titulo: 'Designa un responsable', desc: 'Nombra un "embajador digital" interno que lidere la transformación, aunque sea a tiempo parcial.' },
    ],
  },
  emergente: {
    nombre: 'Empresa Emergente',
    emoji: '🌱',
    descripcion: 'Tu empresa ha dado los primeros pasos en digitalización pero de forma desigual. Algunas áreas son más avanzadas que otras y falta una visión estratégica común.',
    recomendaciones: [
      { titulo: 'Homogeniza las herramientas', desc: 'Reduce la fragmentación de apps. Un solo ecosistema (Microsoft o Google) suele ser más eficiente que mezclar varias plataformas.' },
      { titulo: 'Prueba la IA en tareas concretas', desc: 'Identifica 2-3 tareas repetitivas donde una IA como Copilot o ChatGPT pueda ahorrar tiempo inmediatamente.' },
      { titulo: 'Crea un plan digital', desc: 'Define un roadmap de digitalización a 12 meses con objetivos medibles. Sin plan, la digitalización avanza caóticamente.' },
      { titulo: 'Mide antes de invertir', desc: 'Instala dashboards básicos (Google Analytics, Power BI gratuito) para tomar decisiones con datos reales.' },
    ],
  },
  activa: {
    nombre: 'Empresa Activa',
    emoji: '📱',
    descripcion: 'Tu empresa tiene una digitalización sólida y usa bien las herramientas disponibles. El equipo tiene cultura digital y las tecnologías están integradas en el trabajo diario.',
    recomendaciones: [
      { titulo: 'Escala la IA internamente', desc: 'Si hay usos aislados de IA, crea una política interna y comparte buenas prácticas entre equipos para escalar el impacto.' },
      { titulo: 'Automatiza los flujos entre sistemas', desc: 'Integra tus herramientas (CRM, ERP, email, contabilidad) para eliminar trasvases manuales de datos entre plataformas.' },
      { titulo: 'Invierte en analítica avanzada', desc: 'Pasa de informes descriptivos a modelos predictivos. Herramientas como Power BI Pro o Tableau permiten anticiparse a problemas.' },
      { titulo: 'Atrae y retén talento digital', desc: 'En el mercado actual, mostrar una cultura digital activa es un factor clave para atraer perfiles técnicos y jóvenes.' },
    ],
  },
  avanzada: {
    nombre: 'Empresa Avanzada',
    emoji: '🚀',
    descripcion: 'Tu empresa está en la vanguardia de la transformación digital. La IA y la automatización forman parte del día a día y las decisiones se toman basadas en datos.',
    recomendaciones: [
      { titulo: 'Desarrolla IA propia', desc: 'Considera construir modelos o asistentes internos con tus propios datos. Las empresas avanzadas están pasando del "usar IA" a "crear IA".' },
      { titulo: 'Lidera el ecosistema', desc: 'Comparte conocimiento con clientes o partners. Convertirse en referente digital del sector genera ventaja competitiva.' },
      { titulo: 'Gobernanza del dato', desc: 'Implementa una estrategia formal de data governance: quién accede a qué, cómo se aseguran los datos y cómo se cumple con el RGPD.' },
      { titulo: 'Prepárate para la IA generativa empresarial', desc: 'Evalúa modelos privados (Azure OpenAI, AWS Bedrock) que permitan usar IA con tus datos sin enviarlos a terceros.' },
    ],
  },
  lider: {
    nombre: 'Líder Digital',
    emoji: '⭐',
    descripcion: '¡Tu empresa es un referente en madurez digital! Tienes los procesos, la cultura y la tecnología alineados para competir en la economía digital.',
    recomendaciones: [
      { titulo: 'Innova con IA agéntica', desc: 'Los agentes de IA autónomos (que ejecutan tareas sin supervisión humana) son el siguiente nivel. Considera pilotos en operaciones.' },
      { titulo: 'Crea un laboratorio de innovación', desc: 'Formaliza un espacio (tiempo + recursos) para experimentar con tecnologías emergentes: IA multimodal, IoT, blockchain o edge computing.' },
      { titulo: 'Mide el ROI digital', desc: 'Establece métricas de retorno sobre cada inversión digital. Justificar el gasto en tecnología con datos fortalece la cultura de inversión.' },
      { titulo: 'Mentoriza a tu sector', desc: 'Las empresas líderes digitales que comparten su experiencia construyen reputación, atraen talento y generan oportunidades de negocio.' },
    ],
  },
};

function clasificarPerfil(total: number): string {
  if (total <= 24) return 'analogica';
  if (total <= 34) return 'emergente';
  if (total <= 44) return 'activa';
  if (total <= 54) return 'avanzada';
  return 'lider';
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function TestMadurezDigitalPage() {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const totalRespondidas = Object.keys(respuestas).length;
  const todasRespondidas = totalRespondidas === PREGUNTAS.length;

  const totalPuntos = useMemo(() => {
    return Object.values(respuestas).reduce((acc, v) => acc + v, 0);
  }, [respuestas]);

  const puntosPorDimension = useMemo(() => {
    return DIMENSIONES.map(d => {
      const pregsDim = PREGUNTAS.filter(p => p.dimension === d.id);
      const pts = pregsDim.reduce((acc, p) => acc + (respuestas[p.id] ?? 0), 0);
      return { ...d, puntos: pts, max: pregsDim.length * 4 };
    });
  }, [respuestas]);

  const perfilKey = clasificarPerfil(totalPuntos);
  const perfil = PERFILES[perfilKey];

  const responder = (preguntaId: number, puntos: number) => {
    setRespuestas(prev => ({ ...prev, [preguntaId]: puntos }));
  };

  const verResultado = () => {
    if (!todasRespondidas) return;
    setMostrarResultado(true);
    setTimeout(() => {
      document.getElementById('resultado-madurez')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const reiniciar = () => {
    setRespuestas({});
    setMostrarResultado(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const porcentajeTotal = Math.round(((totalPuntos - 15) / (60 - 15)) * 100);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcon} aria-hidden="true">🤖</div>
        <h1 className={styles.title}>Test Madurez Digital</h1>
        <p className={styles.subtitle}>¿Qué tan digital es tu empresa? Descúbrelo en 5 minutos</p>
        <div className={styles.heroBadges}>
          <span>15 preguntas</span>
          <span>5 dimensiones</span>
          <span>5 perfiles de madurez</span>
        </div>
      </header>

      <LegalNotice />

      {/* FORMULARIO */}
      <div className={styles.formPanel}>
        {DIMENSIONES.map(dimension => (
          <div key={dimension.id} className={styles.dimensionBlock}>
            <div className={styles.dimensionHeader}>
              <span className={styles.dimensionEmoji} aria-hidden="true">{dimension.emoji}</span>
              <div>
                <p className={styles.dimensionTitulo}>{dimension.titulo}</p>
                <p className={styles.dimensionDesc}>{dimension.descripcion}</p>
              </div>
            </div>

            {PREGUNTAS.filter(p => p.dimension === dimension.id).map(pregunta => (
              <div key={pregunta.id} className={styles.preguntaItem}>
                <span className={styles.preguntaLabel}>{pregunta.texto}</span>
                <div className={styles.opcionesRow} role="group" aria-label={`Respuesta para: ${pregunta.texto}`}>
                  {OPCIONES.map(opcion => (
                    <button
                      key={opcion.puntos}
                      type="button"
                      className={`${styles.opcionItem} ${respuestas[pregunta.id] === opcion.puntos ? styles.opcionActiva : ''}`}
                      onClick={() => responder(pregunta.id, opcion.puntos)}
                    >
                      <span className={styles.opcionPuntos}>{opcion.puntos}pt</span>
                      <span>{opcion.etiqueta}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

        <div>
          <button
            type="button"
            className={styles.btnVerResultado}
            onClick={verResultado}
            disabled={!todasRespondidas}
          >
            Ver mi perfil de madurez digital →
          </button>
          <p className={styles.contadorRespuestas}>
            {totalRespondidas} de {PREGUNTAS.length} preguntas respondidas
          </p>
        </div>
      </div>

      {/* RESULTADO */}
      {mostrarResultado && (
        <div id="resultado-madurez" className={styles.resultadoPanel}>
          <div className={styles.perfilCard}>
            <div className={styles.perfilEmoji} aria-hidden="true">{perfil.emoji}</div>
            <h2 className={styles.perfilNombre}>{perfil.nombre}</h2>
            <p className={styles.perfilPuntuacion}>{totalPuntos} puntos de 60 ({porcentajeTotal}%)</p>
            <div className={styles.scoreBarra} role="progressbar" aria-label={`Puntuación: ${porcentajeTotal}%`}>
              <div className={styles.scoreFill} style={{ width: `${porcentajeTotal}%` }} />
            </div>
            <p className={styles.scoreLabel}>Nivel de madurez digital</p>
            <p className={styles.perfilDescripcion}>{perfil.descripcion}</p>
          </div>

          {/* Detalle por dimensiones */}
          <div className={styles.dimensionesDetalle}>
            <h3>Puntuación por dimensión</h3>
            {puntosPorDimension.map(d => (
              <div key={d.id} className={styles.dimDetalleItem}>
                <span className={styles.dimDetalleEmoji} aria-hidden="true">{d.emoji}</span>
                <span className={styles.dimDetalleNombre}>{d.titulo}</span>
                <span className={styles.dimPuntos}>{d.puntos}/{d.max}</span>
                <div className={styles.dimBarraWrapper}>
                  <div
                    className={styles.dimBarraFill}
                    style={{ width: `${(d.puntos / d.max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Recomendaciones */}
          <div className={styles.recomendacionesSection}>
            <h3>Recomendaciones para tu empresa</h3>
            <div className={styles.recoGrid}>
              {perfil.recomendaciones.map(r => (
                <div key={r.titulo} className={styles.recoItem}>
                  <h4>{r.titulo}</h4>
                  <p>{r.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.finBotones}>
            <button type="button" className={styles.btnRepetir} onClick={reiniciar}>
              Repetir el test
            </button>
            <button type="button" className={styles.btnSecundario} onClick={reiniciar}>
              Compartir con mi equipo
            </button>
          </div>
        </div>
      )}

      <EducationalSection
        title="🚀 Transformación digital: guía para empresas"
        subtitle="Qué es la madurez digital y cómo mejorarla"
      >
        {/* Qué es madurez digital */}
        <section className={styles.guideSection}>
          <h2>¿Qué es la madurez digital?</h2>
          <div className={styles.scenariosGrid}>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">📐</span>
              <h3>Una medida, no un destino</h3>
              <p>La madurez digital mide en qué punto del viaje de digitalización está una empresa. No hay un "100% digital" final: la tecnología avanza y las empresas deben evolucionar continuamente.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🔄</span>
              <h3>Cultura + Proceso + Tecnología</h3>
              <p>Digitalizar no es solo comprar software. Las empresas con más éxito combinan las herramientas correctas con procesos rediseñados y una cultura que acepta el cambio.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">📊</span>
              <h3>Ventaja competitiva real</h3>
              <p>Según McKinsey, las empresas líderes digitales generan un 45% más de ingresos y tienen costes 35% menores que las analógicas. La digitalización no es opcional a largo plazo.</p>
            </div>
            <div className={styles.scenarioCard}>
              <span className={styles.scenarioIcon} aria-hidden="true">🌍</span>
              <h3>Contexto español</h3>
              <p>España está en la media europea en digitalización empresarial (índice DESI 2024), pero hay grandes diferencias entre PYMES (rezagadas) y grandes empresas (avanzadas).</p>
            </div>
          </div>
        </section>

        {/* Los 5 perfiles */}
        <section className={styles.guideSection}>
          <h2>Los 5 perfiles de madurez digital</h2>
          <div className={styles.faqGrid}>
            {[
              { titulo: '🏭 Analógica (15-24 pts)', desc: 'Opera principalmente con papel, email y herramientas básicas de Office. La digitalización no es prioridad o hay resistencia cultural al cambio. Representa aprox. el 20% de las PYMEs españolas.' },
              { titulo: '🌱 Emergente (25-34 pts)', desc: 'Ha adoptado herramientas básicas de colaboración y tiene presencia digital, pero los procesos siguen siendo mayoritariamente manuales. Es el estadio más común en PYMEs españolas.' },
              { titulo: '📱 Activa (35-44 pts)', desc: 'Usa activamente herramientas digitales, tiene cultura de datos básica y empieza a experimentar con automatización. El equipo está cómodo con la tecnología.' },
              { titulo: '🚀 Avanzada (45-54 pts)', desc: 'La IA y la automatización forman parte del trabajo diario. Las decisiones se toman con datos. Tiene ventaja competitiva clara en eficiencia y velocidad.' },
              { titulo: '⭐ Líder Digital (55-60 pts)', desc: 'Referente en su sector. Crea y adapta tecnología, no solo la consume. Atrae talento digital, innova continuamente y tiene procesos totalmente integrados.' },
            ].map(p => (
              <div key={p.titulo} className={styles.faqItem}>
                <h3>{p.titulo}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Pasos para mejorar */}
        <section className={styles.guideSection}>
          <h2>6 pasos para mejorar la madurez digital de tu empresa</h2>
          <div className={styles.stepsGrid}>
            {[
              { n: '1', titulo: 'Diagnostica la situación actual', desc: 'Usa este test como punto de partida. Identifica las dimensiones más débiles: suelen ser automatización y cultura digital.' },
              { n: '2', titulo: 'Define un roadmap a 12 meses', desc: 'Prioriza 2-3 iniciativas concretas por año. Un plan realista ejecutado supera a una estrategia ambiciosa que no se implementa.' },
              { n: '3', titulo: 'Empieza por quick wins', desc: 'Elige proyectos con alto impacto y baja complejidad. Un éxito visible genera confianza y recursos para lo siguiente.' },
              { n: '4', titulo: 'Invierte en formación', desc: 'La tecnología sin formación fracasa. Destina al menos el 20% del presupuesto digital a capacitar a las personas.' },
              { n: '5', titulo: 'Mide y ajusta', desc: 'Define KPIs antes de implementar cada herramienta. Si en 3 meses no hay mejora medible, replantea el enfoque.' },
              { n: '6', titulo: 'Repite el diagnóstico', desc: 'Vuelve a hacer este test cada 6-12 meses. Ver la evolución motiva al equipo y permite ajustar la estrategia.' },
            ].map(s => (
              <div key={s.n} className={styles.stepCard}>
                <div className={styles.stepNum} aria-hidden="true">{s.n}</div>
                <h3>{s.titulo}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tendencias IA */}
        <section className={styles.guideSection}>
          <h2>Tendencias de IA en empresas españolas (2025-2026)</h2>
          <div className={styles.tipsGrid}>
            {[
              { icon: '✍️', titulo: 'IA generativa para comunicaciones', desc: 'El 63% de las empresas españolas ya usa alguna IA generativa para redactar emails, crear contenido o resumir documentos (IDC, 2025).' },
              { icon: '🎧', titulo: 'Atención al cliente con IA', desc: 'Los chatbots y asistentes virtuales con IA están transformando el soporte al cliente, con resolución automatizada del 40-60% de consultas.' },
              { icon: '📋', titulo: 'Automatización de procesos (RPA)', desc: 'La Automatización Robótica de Procesos (RPA) crece un 25% anual en España, principalmente en finanzas, RRHH y logística.' },
              { icon: '🔍', titulo: 'IA para análisis de datos', desc: 'Herramientas como Power BI con Copilot permiten a personas no técnicas hacer preguntas en lenguaje natural y obtener análisis complejos.' },
              { icon: '🛡️', titulo: 'IA en ciberseguridad', desc: 'Las soluciones de seguridad basadas en IA detectan amenazas un 60% más rápido. Se vuelven imprescindibles ante el aumento de ciberataques.' },
              { icon: '🏗️', titulo: 'Agentes de IA autónomos', desc: 'Los agentes de IA capaces de ejecutar tareas multistep sin supervisión humana serán el avance más disruptivo de 2025-2026 para empresas avanzadas.' },
            ].map(t => (
              <div key={t.icon} className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">{t.icon}</span>
                <h3>{t.titulo}</h3>
                <p>{t.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Warning */}
        <section className={styles.warningBox}>
          <h2>⚠️ Sobre este test de madurez digital</h2>
          <div className={styles.warningGrid}>
            {[
              { titulo: 'Es orientativo, no una auditoría profesional', desc: 'Este test ofrece una aproximación rápida basada en tu percepción. No sustituye a una auditoría digital profesional con acceso a datos reales de la empresa.' },
              { titulo: 'Los resultados dependen de la honestidad', desc: 'La precisión del resultado depende de que las respuestas reflejen la realidad, no la situación ideal. Responde pensando en "cómo es hoy", no en "cómo debería ser".' },
              { titulo: 'Una empresa puede ser avanzada en unas áreas y básica en otras', desc: 'La puntuación global oculta diferencias entre departamentos. Un equipo de marketing puede ser muy digital mientras el departamento de contabilidad sigue siendo analógico.' },
              { titulo: 'La madurez digital no garantiza el éxito empresarial', desc: 'La tecnología es una herramienta, no un fin. Hay empresas con baja madurez digital que son muy rentables y viceversa. El objetivo es usarla para mejorar, no tecnificar por tecnificar.' },
            ].map(w => (
              <div key={w.titulo} className={styles.warningItem}>
                <strong>{w.titulo}</strong>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('test-madurez-digital')} />
      <ShareCard appName="test-madurez-digital" />
      <Footer appName="test-madurez-digital" />
    </div>
  );
}
