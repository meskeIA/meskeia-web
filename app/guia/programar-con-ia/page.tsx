'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './GuiaProgramarConIa.module.css';
import { MeskeiaLogo, Footer, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import RelatedApps from '@/components/RelatedApps';

// ─── Herramientas del journey ───

const tools = [
  {
    id: 'comparador-ides-ia',
    name: 'IDEs con IA 2026',
    icon: '🖥️',
    url: '/comparador-ides-ia/',
    question: '¿Dónde voy a escribir mi código?',
    description: 'Cursor, Windsurf, VS Code, Zed y JetBrains. Para empezar: VS Code (gratis, millones de tutoriales).',
    step: 1,
    recomendacion: 'VS Code — gratuito y con el mayor ecosistema de recursos para aprender',
  },
  {
    id: 'comparador-asistentes-codigo',
    name: 'Asistentes de Código IA',
    icon: '⌨️',
    url: '/comparador-asistentes-codigo/',
    question: '¿Qué asistente de IA añado?',
    description: 'Claude Code, GitHub Copilot, Gemini Code Assist y Codex. Dos opciones gratuitas para empezar.',
    step: 2,
    recomendacion: 'GitHub Copilot Free o Gemini Code Assist — ambos gratuitos, sin tarjeta',
  },
  {
    id: 'constructor-prompts',
    name: 'Constructor de Prompts',
    icon: '🧱',
    url: '/constructor-prompts/',
    question: '¿Cómo le explico a la IA lo que quiero construir?',
    description: 'Crea instrucciones claras y estructuradas. El 80% del resultado depende de cómo describes lo que quieres.',
    step: 3,
    recomendacion: 'Usa el wizard paso a paso antes de escribir tu primer prompt de proyecto',
  },
  {
    id: 'evaluador-prompts',
    name: 'Evaluador de Prompts',
    icon: '💬',
    url: '/evaluador-prompts/',
    question: '¿Estoy dando instrucciones lo suficientemente buenas?',
    description: 'Puntúa la calidad de tus instrucciones antes de lanzarlas. Detecta si son vagas o demasiado generales.',
    step: 4,
    recomendacion: 'Úsalo para calibrar tu nivel de prompt engineering y mejorar iteración a iteración',
  },
  {
    id: 'tokenizador-ia',
    name: 'Tokenizador Visual',
    icon: '🔤',
    url: '/tokenizador-ia/',
    question: '¿Cuánto me va a costar si uso la API directamente?',
    description: 'Calcula tokens y costes reales por modelo. Útil cuando quieras integrar IA en tu propia app.',
    step: 5,
    recomendacion: 'Opcional al principio — solo si decides usar la API en lugar del chat/extensión',
  },
  {
    id: 'visualizador-llm-funcionamiento',
    name: 'Cómo Funcionan los LLMs',
    icon: '🤖',
    url: '/visualizador-llm-funcionamiento/',
    question: '¿Por qué la IA a veces se equivoca o "inventa" cosas?',
    description: 'Tokens, embeddings, temperatura y atención: entiende el mecanismo para saber cuándo confiar y cuándo verificar.',
    step: 6,
    recomendacion: 'Muy útil para entender alucinaciones y por qué revisar siempre el código generado',
  },
];

// ─── Pasos del journey ───

const journeySteps = [
  {
    number: 1,
    title: 'Define qué quieres construir (antes de abrir nada)',
    description: 'Escribe en papel qué quieres exactamente. ¿Una web con un formulario de contacto? ¿Un script que renombre archivos automáticamente? ¿Una hoja de cálculo que calcule algo repetitivo? Cuanto más concreto, mejor resultado obtendrás de la IA.',
    tip: 'Empieza siempre por lo más pequeño posible. Una web de una sola página es suficiente para aprender. La IA puede ayudarte a ampliarlo después. Los proyectos que "abarcan demasiado" suelen abandonarse.',
  },
  {
    number: 2,
    title: 'Instala tus herramientas en menos de 10 minutos',
    description: 'Para empezar sin gastar nada: descarga VS Code (gratuito, 100MB) e instala la extensión de GitHub Copilot Free o Gemini Code Assist. Eso es todo. No necesitas Cursor, Windsurf ni planes de pago para tu primer proyecto.',
    tip: 'Resistencia de principiante: no pases una semana "eligiendo las herramientas perfectas". VS Code + cualquier asistente gratuito es más que suficiente para empezar. Lo importante es el proyecto, no el entorno.',
  },
  {
    number: 3,
    title: 'Aprende a comunicarte con la IA',
    description: 'La calidad del código que genera la IA depende casi completamente de cómo describes lo que quieres. Instrucción vaga → código genérico y poco útil. Instrucción con contexto, formato esperado y restricciones → algo que puedes usar.',
    tip: 'Buena práctica: describe siempre (1) qué quieres construir, (2) en qué tecnología o lenguaje, (3) qué aspecto visual quieres, (4) qué debe evitar. Usa el Constructor de Prompts de esta guía para estructurarlo.',
  },
  {
    number: 4,
    title: 'Revisa siempre el código — nunca lo aceptes a ciegas',
    description: 'La IA comete errores con naturalidad. Los más frecuentes: inventar funciones que no existen, usar sintaxis desactualizada, omitir casos importantes, o generar código que "funciona" pero es innecesariamente complejo. Trata el resultado como un borrador.',
    tip: 'Pide siempre a la IA que explique lo que genera: "¿Por qué usas este enfoque en lugar de X?" Si no puede explicarlo con claridad, revísalo. Un buen asistente puede explicar su propio código.',
  },
  {
    number: 5,
    title: 'Itera: mejora en rondas pequeñas',
    description: 'El primer resultado nunca es el final. El flujo correcto: genera → revisa → pide ajustes concretos → repite. "Cambia el color del botón", "añade validación al email", "haz que se vea bien en móvil". Cada iteración acerca el resultado a lo que quieres.',
    tip: 'Guarda las instrucciones (prompts) que producen buenos resultados. Son tu plantilla para el próximo proyecto. No reinventes el prompt desde cero cada vez.',
  },
];

// ─── FAQs ───

const faqData = [
  {
    question: '¿Necesito saber programar para usar estas herramientas?',
    answer: 'No para empezar, pero sí para entender y verificar el código. La IA puede escribir código funcional a partir de instrucciones en español, pero si no entiendes nada del resultado no podrás saber si funciona correctamente ni corregir lo que falla. Aprende lo básico de HTML/CSS si quieres hacer una web, o Python si quieres automatizar tareas. No necesitas ser experto, pero sí entender lo que lees.',
  },
  {
    question: '¿Cuánto cuesta empezar?',
    answer: 'Puedes empezar con 0€. VS Code es gratuito y open source. GitHub Copilot Free da 2.000 completions al mes sin tarjeta de crédito. Gemini Code Assist da 6.000 completions al día, también gratis. Solo pagarías si decides escalar a planes Pro ($10-20/mes) para mayor volumen o capacidades avanzadas, y eso tiene sentido cuando ya estás haciendo proyectos reales.',
  },
  {
    question: '¿Qué proyectos son realizables para alguien que empieza?',
    answer: 'Con IA y algo de base básica: webs estáticas (HTML/CSS/JS), páginas con formularios de contacto, scripts de automatización (Python), bots de Telegram sencillos, extensiones de navegador simples, hojas de cálculo automatizadas (Google Apps Script). Proyectos más complejos (apps móviles nativas, e-commerce completo, videojuegos) requieren más base técnica aunque la IA ayude en partes.',
  },
  {
    question: '¿La IA se equivoca? ¿Cómo detecto los errores?',
    answer: 'Sí, con frecuencia. Los errores más comunes: inventar funciones o librerías que no existen, usar sintaxis de una versión antigua, omitir validaciones importantes, o generar código que funciona en casos simples pero falla con datos reales. Para detectarlos: ejecuta el código y ve si da errores, busca las librerías que importa (¿existen?), y pide a la IA que explique cada parte importante.',
  },
  {
    question: '¿Cuándo tiene sentido usar la API de IA en lugar del chat?',
    answer: 'La API tiene sentido cuando quieres integrar la IA directamente dentro de tu app: que analice textos de usuarios, genere respuestas automáticas, clasifique datos, o procese imágenes. Para desarrollar tu propio proyecto usando IA como asistente, el chat (Copilot, Claude.ai, ChatGPT) es suficiente y más económico. La API añade complejidad técnica y coste por uso — véalo como el paso siguiente cuando ya tengas experiencia.',
  },
];

// ─── Caso de estudio ───

const caseStudy = {
  title: 'Marta quiere una web para su tienda artesanal',
  situation: 'Diseñadora gráfica, 32 años. Vende productos artesanales en mercadillos y quiere una web con catálogo y formulario de contacto. Nunca ha programado, pero maneja bien herramientas digitales.',
  steps: [
    { tool: 'Elige VS Code + Gemini Code Assist', result: 'Instalado en 8 minutos. Elige Gemini porque es gratuito y no requiere tarjeta. Abre un proyecto vacío.' },
    { tool: 'Constructor de Prompts', result: 'Escribe: "Web para tienda artesanal. HTML y CSS sencillo. Galería de 6 productos con foto y precio, sección Sobre Mí, formulario de contacto. Colores cálidos (terracota, crema). Sin tienda online." La IA genera la estructura en 2 minutos.' },
    { tool: 'Evaluador de Prompts', result: 'Detecta que necesitaba especificar que los colores son cálidos y el estilo rústico. La segunda versión del prompt produce un CSS mucho más alineado con su marca.' },
    { tool: 'Iteración', result: 'Pide ajustes: "Hazlo responsivo para móvil", "añade animación suave al pasar sobre las fotos", "cambia el azul del botón por terracota #c1440e". Tres iteraciones más.' },
  ],
  conclusion: 'En un fin de semana tiene un prototipo funcional que muestra a sus clientes y sube a un hosting gratuito (GitHub Pages). No es perfecto, pero es suyo y lo entiende lo suficiente para seguir mejorándolo.',
};

// ─── Componente ───

export default function GuiaProgramarConIaPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🚀</span>
        <h1 className={styles.title}>Guía para Programar con IA</h1>
        <p className={styles.subtitle}>
          Tengo una idea para una web, app o script. Nunca lo he hecho solo. ¿Por dónde empiezo?
        </p>
        <div className={styles.heroStats}>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNumber}>{tools.length}</span>
            <span className={styles.heroStatLabel}>Herramientas</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNumber}>{journeySteps.length}</span>
            <span className={styles.heroStatLabel}>Pasos clave</span>
          </div>
          <div className={styles.heroStat}>
            <span className={styles.heroStatNumber}>0€</span>
            <span className={styles.heroStatLabel}>Para empezar</span>
          </div>
        </div>
      </header>

      <LegalNotice />

      {/* Aviso para principiantes */}
      <div className={styles.avisoBox} role="note">
        <span aria-hidden="true">💡</span>
        <div>
          <strong>Esta guía es para ti si:</strong> tienes una idea concreta, quieres intentarlo con IA y no sabes por dónde empezar. No es un curso de programación — es el mapa del camino más corto para tener algo funcionando.
        </div>
      </div>

      {/* Journey Steps */}
      <section className={styles.journeySection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon} aria-hidden="true">🗺️</span>
          El camino paso a paso
        </h2>
        <div className={styles.journeyGrid}>
          {journeySteps.map((step) => (
            <div key={step.number} className={styles.journeyCard}>
              <div className={styles.journeyNumber}>{step.number}</div>
              <h3 className={styles.journeyTitle}>{step.title}</h3>
              <p className={styles.journeyDescription}>{step.description}</p>
              <div className={styles.journeyTip}>
                <span className={styles.tipIcon} aria-hidden="true">💡</span>
                <span>{step.tip}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tools */}
      <section className={styles.toolsSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon} aria-hidden="true">🔧</span>
          Las herramientas del journey
        </h2>
        <p className={styles.toolsIntro}>
          Cada herramienta responde a una pregunta concreta del proceso. Úsalas en orden o salta directamente a la que necesites.
        </p>
        <div className={styles.toolsGrid}>
          {tools.map((tool) => (
            <Link key={tool.id} href={tool.url} className={styles.toolCard}>
              <div className={styles.toolHeader}>
                <span className={styles.toolStep}>{tool.step}</span>
                <span className={styles.toolIcon} aria-hidden="true">{tool.icon}</span>
              </div>
              <h3 className={styles.toolQuestion}>{tool.question}</h3>
              <p className={styles.toolName}>{tool.name}</p>
              <p className={styles.toolDescription}>{tool.description}</p>
              <div className={styles.toolRecomendacion}>
                <span aria-hidden="true">→</span> {tool.recomendacion}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Caso de estudio */}
      <section className={styles.caseStudySection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon} aria-hidden="true">📖</span>
          Ejemplo real
        </h2>
        <div className={styles.caseStudyCard}>
          <h3 className={styles.caseStudyTitle}>{caseStudy.title}</h3>
          <p className={styles.caseStudySituation}>
            <strong>Situación:</strong> {caseStudy.situation}
          </p>
          <div className={styles.caseStudySteps}>
            {caseStudy.steps.map((s, i) => (
              <div key={i} className={styles.caseStudyStep}>
                <span className={styles.caseStudyStepNumber}>{i + 1}</span>
                <div>
                  <strong>{s.tool}:</strong> {s.result}
                </div>
              </div>
            ))}
          </div>
          <div className={styles.caseStudyConclusion}>
            <span aria-hidden="true">✅</span>
            <span><strong>Resultado:</strong> {caseStudy.conclusion}</span>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faqSection}>
        <h2 className={styles.sectionTitle}>
          <span className={styles.sectionIcon} aria-hidden="true">❓</span>
          Preguntas frecuentes
        </h2>
        <div className={styles.faqList}>
          {faqData.map((faq, i) => (
            <div key={i} className={`${styles.faqItem} ${openFaq === i ? styles.faqItemOpen : ''}`}>
              <button
                className={styles.faqQuestion}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
              >
                <span>{faq.question}</span>
                <span className={styles.faqArrow} aria-hidden="true">{openFaq === i ? '▲' : '▼'}</span>
              </button>
              {openFaq === i && (
                <div className={styles.faqAnswer}>{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitulo}>¿Listo para empezar?</h2>
        <p className={styles.ctaDesc}>
          Elige el primer paso según dónde estés ahora mismo:
        </p>
        <div className={styles.ctaBotones}>
          <Link href="/comparador-ides-ia/" className={styles.ctaBtn}>
            🖥️ Elige tu IDE
          </Link>
          <Link href="/constructor-prompts/" className={styles.ctaBtnSecundario}>
            🧱 Escribe tu primer prompt
          </Link>
          <Link href="/comparador-asistentes-codigo/" className={styles.ctaBtnSecundario}>
            ⌨️ Elige tu asistente IA
          </Link>
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('guia-programar-con-ia')} />
      <ShareCard appName="guia-programar-con-ia" />
      <Footer appName="guia-programar-con-ia" />
    </div>
  );
}
