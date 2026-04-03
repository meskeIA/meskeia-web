'use client';

import Link from 'next/link';
import styles from './GuiaPensarMejor.module.css';
import { MeskeiaLogo, Footer, LegalNotice, ShareCard } from '@/components';

/* ─── Datos ─── */

interface Tool {
  id: string;
  name: string;
  icon: string;
  url: string;
  question: string;
  description: string;
  framework: string;
}

interface Chapter {
  id: string;
  number: number;
  title: string;
  emoji: string;
  intro: string;
  insight: string;
  tools: Tool[];
}

const chapters: Chapter[] = [
  {
    id: 'conocete',
    number: 1,
    title: 'Conócete profesionalmente',
    emoji: '🪞',
    intro: 'Antes de cambiar algo, necesitas entender dónde estás. Estas herramientas te ayudan a evaluar tu situación profesional sin autoengaño: tu nivel de desafío, tus habilidades, tu energía y tus compromisos.',
    insight: 'El psicólogo Csikszentmihalyi descubrió que la satisfacción no viene de trabajar menos, sino de encontrar el equilibrio entre lo que te desafía y lo que sabes hacer. La autoexigencia sin reconocimiento genera el síndrome del impostor; la comodidad sin reto genera estancamiento.',
    tools: [
      {
        id: 'estancamiento',
        name: 'Diagnóstico de Estancamiento Profesional',
        icon: '🌊',
        url: '/diagnostico-estancamiento-profesional/',
        question: '¿Estás en zona de confort, estrés o flujo?',
        description: 'Evalúa el equilibrio entre desafío y habilidad en tu situación actual. Basado en el modelo de flujo de Csikszentmihalyi.',
        framework: 'Csikszentmihalyi (1990)',
      },
      {
        id: 'habilidades',
        name: 'Auditoría de Habilidades vs Mercado',
        icon: '🎯',
        url: '/auditoria-habilidades-mercado/',
        question: '¿Lo que sabes hacer es lo que el mercado necesita?',
        description: 'Gap analysis entre tus competencias actuales y la demanda real. Relevancia + actualización.',
        framework: 'Gap Analysis Profesional',
      },
      {
        id: 'impostor',
        name: 'Test de Síndrome del Impostor',
        icon: '🎭',
        url: '/test-sindrome-impostor/',
        question: '¿Subestimas tu competencia real?',
        description: 'Evalúa si la autoexigencia y la falta de reconocimiento de logros están frenando tu carrera.',
        framework: 'Escala de Clance (1978)',
      },
      {
        id: 'energia',
        name: 'Auditoría de Energía Semanal',
        icon: '🔋',
        url: '/auditoria-energia-semanal/',
        question: '¿Dónde gastas energía sin retorno?',
        description: 'Analiza el equilibrio entre desgaste y recarga en tu semana. El recurso clave no es el tiempo — es la energía.',
        framework: 'Loehr y Schwartz (2003)',
      },
      {
        id: 'compromisos',
        name: 'Mapa de Compromisos vs Capacidad',
        icon: '📋',
        url: '/mapa-compromisos-capacidad/',
        question: '¿Has dicho sí a más de lo que puedes hacer bien?',
        description: 'Evalúa si tu carga de compromisos es realista respecto a tu capacidad de gestión.',
        framework: 'Esencialismo (McKeown)',
      },
    ],
  },
  {
    id: 'decide',
    number: 2,
    title: 'Decide mejor',
    emoji: '🧠',
    intro: 'La calidad de tu vida es la calidad de tus decisiones. Estas herramientas te ayudan a detectar sesgos, distinguir lo reversible de lo irreversible, y cuestionar tus propias conclusiones antes de actuar.',
    insight: 'Kahneman demostró que el cerebro opera con dos sistemas: uno rápido e intuitivo (donde viven los sesgos) y uno lento y analítico (que requiere esfuerzo). La mayoría de decisiones importantes se toman con el sistema equivocado. No se trata de pensar más — se trata de pensar en el momento adecuado.',
    tools: [
      {
        id: 'sesgos',
        name: 'Detector de Sesgos Cognitivos',
        icon: '🧠',
        url: '/detector-sesgos-cognitivos/',
        question: '¿Qué sesgos podrían estar afectando tus decisiones?',
        description: 'Evalúa cuánto operas en piloto automático vs cuánto deliberas. Basado en Sistema 1 y Sistema 2.',
        framework: 'Kahneman (2011)',
      },
      {
        id: 'reversible',
        name: 'Decisiones Reversibles vs Irreversibles',
        icon: '🚪',
        url: '/analisis-decision-reversible/',
        question: '¿Das vueltas a cosas que podrías simplemente probar?',
        description: 'Clasifica tus decisiones en tipo 1 (irreversibles) y tipo 2 (reversibles). La mayoría son tipo 2.',
        framework: 'Jeff Bezos (1997)',
      },
      {
        id: 'grupo',
        name: 'Test de Pensamiento de Grupo',
        icon: '🫧',
        url: '/test-pensamiento-grupo/',
        question: '¿Tu equipo realmente debate o solo confirma?',
        description: 'Detecta si tu equipo sufre groupthink: consenso rápido sin análisis crítico.',
        framework: 'Irving Janis (1972)',
      },
      {
        id: 'segunda-opinion',
        name: 'Checklist de Segunda Opinión',
        icon: '🔍',
        url: '/checklist-segunda-opinion/',
        question: '¿Has buscado activamente razones para NO hacerlo?',
        description: 'Evalúa si cuestionas tus decisiones antes de actuar. Principio de red team aplicado a decisiones personales.',
        framework: 'Principio de Adversario',
      },
      {
        id: 'premortem',
        name: 'Checklist Pre-Mortem',
        icon: '🔍',
        url: '/checklist-pre-mortem/',
        question: '¿Por qué podría fallar esto que vas a lanzar?',
        description: 'Antes de lanzar algo: imagina que ha fracasado y pregunta por qué. Anticipa riesgos y actúa sobre ellos.',
        framework: 'Gary Klein (2007)',
      },
    ],
  },
  {
    id: 'emprende',
    number: 3,
    title: 'Emprende con criterio',
    emoji: '🚀',
    intro: 'Emprender no es lanzarse al vacío — es validar antes de construir, diseñar un modelo que funcione, y gestionar el riesgo sin paralizarte. Estas herramientas te ayudan a pensar antes de actuar.',
    insight: 'Eric Ries demostró que la mayoría de startups no fracasan por falta de producto, sino por falta de clientes. Osterwalder enseñó que un negocio necesita tanto una propuesta clara como un modelo sostenible. Y Taleb nos recuerda que el riesgo bien gestionado no es temeridad — es estrategia.',
    tools: [
      {
        id: 'validacion',
        name: 'Test de Validación de Idea',
        icon: '🧪',
        url: '/test-validacion-idea/',
        question: '¿Tu idea resuelve un problema real o solo te gusta a ti?',
        description: 'Evalúa cuánto estás asumiendo sin validar y cuánto estás comprobando con el mercado real.',
        framework: 'Lean Startup (Ries, 2011)',
      },
      {
        id: 'modelo',
        name: 'Diagnóstico de Modelo de Negocio',
        icon: '🏛️',
        url: '/diagnostico-modelo-negocio/',
        question: '¿Los pilares de tu negocio están equilibrados?',
        description: 'Evalúa si tu propuesta de valor es clara y si tu modelo genera ingresos de forma consistente.',
        framework: 'Business Model Canvas (Osterwalder)',
      },
      {
        id: 'propuesta',
        name: 'Auditoría de Propuesta de Valor',
        icon: '💎',
        url: '/auditoria-propuesta-valor/',
        question: '¿Lo que ofreces encaja con lo que tu cliente necesita?',
        description: 'Evalúa el encaje entre tu oferta y la necesidad real del cliente, y cómo comunicas ese valor.',
        framework: 'Value Proposition Canvas (Osterwalder)',
      },
      {
        id: 'riesgo',
        name: 'Mapa de Riesgo del Emprendedor',
        icon: '🎲',
        url: '/mapa-riesgo-emprendedor/',
        question: '¿Qué pasa si esto no funciona? ¿Lo has pensado?',
        description: 'Evalúa tu exposición al riesgo y tu nivel de preparación ante el fracaso.',
        framework: 'Análisis de Riesgos (Taleb)',
      },
    ],
  },
];

const otherGuides = [
  { url: '/guia/freelance/', icon: '💼', title: 'Guía Freelance', description: 'Herramientas para trabajar por tu cuenta' },
  { url: '/guia/montar-negocio/', icon: '🏪', title: 'Guía Montar un Negocio', description: 'Del plan a la ejecución' },
  { url: '/guia/vivir-sano/', icon: '🍏', title: 'Guía Vivir Sano', description: 'Hábitos y bienestar' },
];

const totalTools = chapters.reduce((sum, ch) => sum + ch.tools.length, 0);

/* ─── Componente ─── */

export default function GuiaPensarMejorPage() {
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>🧠</span>
        <h1 className={styles.title}>Pensar Mejor</h1>
        <p className={styles.subtitle}>
          Herramientas de reflexión profesional.
          No calculan — hacen las preguntas correctas para que llegues a tus propias conclusiones.
        </p>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNumber}>{totalTools}</span>
            <span className={styles.heroStatLabel}>Herramientas</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNumber}>{chapters.length}</span>
            <span className={styles.heroStatLabel}>Capítulos</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNumber}>3 min</span>
            <span className={styles.heroStatLabel}>Cada test</span>
          </div>
        </div>
      </header>

      <LegalNotice />

      {/* Intro */}
      <section className={styles.introSection}>
        <p className={styles.introText}>
          La IA amplifica lo que ya eres. Si piensas bien, te hace mejor.
          Si no, te vuelve dependiente. Estas herramientas no dan respuestas —
          <strong> hacen las preguntas correctas</strong> para que pienses mejor
          sobre tu carrera, tus decisiones y tu negocio.
        </p>
        <div className={styles.chapterNav}>
          {chapters.map((ch) => (
            <a key={ch.id} href={`#${ch.id}`} className={styles.chapterNavItem}>
              <span className={styles.chapterNavEmoji}>{ch.emoji}</span>
              <span className={styles.chapterNavTitle}>{ch.title}</span>
            </a>
          ))}
        </div>
      </section>

      {/* Capítulos */}
      {chapters.map((chapter) => (
        <section key={chapter.id} id={chapter.id} className={styles.chapterSection}>
          <div className={styles.chapterHeader}>
            <span className={styles.chapterNumber}>Capítulo {chapter.number}</span>
            <h2 className={styles.chapterTitle}>
              <span>{chapter.emoji}</span> {chapter.title}
            </h2>
            <p className={styles.chapterIntro}>{chapter.intro}</p>
          </div>

          <div className={styles.chapterInsight}>
            <span className={styles.insightIcon}>💡</span>
            <p>{chapter.insight}</p>
          </div>

          <div className={styles.toolsGrid}>
            {chapter.tools.map((tool) => (
              <Link key={tool.id} href={tool.url} className={styles.toolCard}>
                <div className={styles.toolHeader}>
                  <span className={styles.toolIcon}>{tool.icon}</span>
                  <span className={styles.toolFramework}>{tool.framework}</span>
                </div>
                <h3 className={styles.toolName}>{tool.name}</h3>
                <p className={styles.toolQuestion}>{tool.question}</p>
                <p className={styles.toolDescription}>{tool.description}</p>
                <span className={styles.toolCta}>Hacer el test →</span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>¿Por dónde empezar?</h2>
        <p className={styles.ctaText}>
          Si solo tienes 3 minutos, empieza por el que más te resuene.
          No hay orden correcto — cada herramienta funciona por sí sola
          y te lleva a las demás.
        </p>
        <div className={styles.ctaButtons}>
          <Link href="/diagnostico-estancamiento-profesional/" className={styles.ctaButton}>
            🌊 ¿Estoy estancado?
          </Link>
          <Link href="/detector-sesgos-cognitivos/" className={styles.ctaButtonSecondary}>
            🧠 ¿Decido bien?
          </Link>
          <Link href="/test-validacion-idea/" className={styles.ctaButtonSecondary}>
            🧪 ¿Mi idea es buena?
          </Link>
        </div>
      </section>

      {/* Otras guías */}
      <section className={styles.otherGuidesSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon}>📚</span>
          Otras guías que te pueden interesar
        </h2>
        <div className={styles.otherGuidesGrid}>
          {otherGuides.map((guide) => (
            <Link key={guide.url} href={guide.url} className={styles.otherGuideCard}>
              <span className={styles.otherGuideIcon}>{guide.icon}</span>
              <div>
                <h3 className={styles.otherGuideTitle}>{guide.title}</h3>
                <p className={styles.otherGuideDescription}>{guide.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <ShareCard appName="guia-pensar-mejor" />
      <Footer appName="guia-pensar-mejor" />
    </div>
  );
}
