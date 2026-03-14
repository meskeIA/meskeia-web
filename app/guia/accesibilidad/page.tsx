'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './GuiaAccesibilidad.module.css';
import { MeskeiaLogo, Footer, RelatedApps, DisclaimerCard, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Etapas del journey de accesibilidad
const journeyStages = [
  {
    number: 1,
    emoji: '🚦',
    title: 'Calma',
    need: 'La persona está muy activada o desbordada emocionalmente y necesita regularse ahora mismo.',
    tools: [
      {
        id: 'semaforo-emocional',
        name: 'Semáforo Emocional',
        icon: '🚦',
        url: '/semaforo-emocional/',
        description: 'Identifica en qué estado emocional estás (rojo/amarillo/verde) y accede a estrategias de regulación adaptadas.',
      },
      {
        id: 'guia-respiracion',
        name: 'Guía de Respiración',
        icon: '🫁',
        url: '/guia-respiracion/',
        description: 'Técnicas de respiración consciente con guía visual animada para reducir la activación en pocos minutos.',
      },
    ],
  },
  {
    number: 2,
    emoji: '📅',
    title: 'Estructura',
    need: 'El día necesita orden y predictibilidad para reducir la ansiedad ante lo desconocido.',
    tools: [
      {
        id: 'planificador-rutinas',
        name: 'Planificador de Rutinas',
        icon: '📅',
        url: '/planificador-rutinas/',
        description: 'Crea rutinas visuales paso a paso con pictogramas. Ideal para mañanas, tardes y noches.',
      },
      {
        id: 'temporizador-visual',
        name: 'Temporizador Visual',
        icon: '⏱️',
        url: '/temporizador-visual/',
        description: 'Temporizador con círculo de colores que muestra visualmente cuánto tiempo queda en cada actividad.',
      },
    ],
  },
  {
    number: 3,
    emoji: '💬',
    title: 'Comunicación',
    need: 'La persona tiene dificultad para expresarse verbalmente y necesita apoyos para comunicarse.',
    tools: [
      {
        id: 'tablero-aac',
        name: 'Tablero AAC',
        icon: '💬',
        url: '/tablero-aac/',
        description: 'Tablero de comunicación aumentativa y alternativa con pictogramas para expresar necesidades básicas.',
      },
      {
        id: 'generador-tarjetas',
        name: 'Generador de Tarjetas',
        icon: '🃏',
        url: '/generador-tarjetas-comunicacion/',
        description: 'Crea e imprime tarjetas pictográficas personalizadas para comunicación aumentativa.',
      },
    ],
  },
  {
    number: 4,
    emoji: '📖',
    title: 'Lectura',
    need: 'Hay textos que la persona no puede leer o entender con facilidad por dislexia u otras dificultades.',
    tools: [
      {
        id: 'adaptador-dislexia',
        name: 'Adaptador de Textos',
        icon: '📖',
        url: '/adaptador-dislexia/',
        description: 'Adapta visualmente cualquier texto: fuente dislexia, espaciado, colores y tamaño personalizables.',
      },
      {
        id: 'lector-texto',
        name: 'Lector de Texto',
        icon: '🔊',
        url: '/lector-texto-voz/',
        description: 'Lee en voz alta cualquier texto con resaltado de palabras en tiempo real para seguir la lectura.',
      },
    ],
  },
  {
    number: 5,
    emoji: '🗺️',
    title: 'Preparación',
    need: 'Hay una situación nueva, difícil o estresante que anticipar: una visita al médico, cambio de cole, excursión...',
    tools: [
      {
        id: 'historias-sociales',
        name: 'Historias Sociales Visuales',
        icon: '📖',
        url: '/historias-sociales/',
        description: 'Crea historias sociales visuales siguiendo la técnica de Carol Gray para preparar situaciones nuevas.',
      },
    ],
  },
  {
    number: 6,
    emoji: '💊',
    title: 'Rutinas médicas',
    need: 'Hay medicación diaria que gestionar de forma visual y predecible.',
    tools: [
      {
        id: 'recordatorio-medicacion',
        name: 'Recordatorio de Medicación',
        icon: '💊',
        url: '/recordatorio-medicacion/',
        description: 'Gestión visual de medicamentos con pictogramas, horarios por toma y registro diario.',
      },
    ],
  },
];

// Perfiles de inicio rápido
const perfiles = [
  {
    id: 'autismo',
    emoji: '🧩',
    titulo: 'Niño/a con autismo',
    descripcion: 'Necesita estructura, predictibilidad y apoyos visuales para el día a día.',
    herramientas: ['Semáforo Emocional', 'Planificador de Rutinas', 'Tablero AAC', 'Historias Sociales'],
    empezarPor: { nombre: 'Planificador de Rutinas', url: '/planificador-rutinas/', emoji: '📅' },
  },
  {
    id: 'tdah',
    emoji: '⚡',
    titulo: 'Adolescente con TDAH',
    descripcion: 'Necesita gestionar el tiempo, reducir la distracción y anticipar cambios.',
    herramientas: ['Temporizador Visual', 'Guía de Respiración', 'Planificador de Rutinas'],
    empezarPor: { nombre: 'Temporizador Visual', url: '/temporizador-visual/', emoji: '⏱️' },
  },
  {
    id: 'dislexia',
    emoji: '📚',
    titulo: 'Adulto/a con dislexia',
    descripcion: 'Necesita adaptar textos y acceder a contenidos de forma más accesible.',
    herramientas: ['Adaptador de Textos', 'Lector de Texto', 'Generador de Tarjetas'],
    empezarPor: { nombre: 'Adaptador de Textos', url: '/adaptador-dislexia/', emoji: '📖' },
  },
];

export default function GuiaAccesibilidadPage() {
  const [perfilActivo, setPerfilActivo] = useState<string | null>(null);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">♿</span>
        <h1 className={styles.title}>Kit digital de apoyo en casa</h1>
        <p className={styles.subtitle}>
          Para autismo, TDAH y dislexia. Herramientas gratuitas para crear un entorno
          de apoyo visual y comunicación adaptada.
        </p>
        <div className={styles.heroBadges}>
          <span className={styles.badge}>Sin registro</span>
          <span className={styles.badge}>Sin instalación</span>
          <span className={styles.badge}>Funciona offline</span>
          <span className={styles.badge}>100% gratuito</span>
        </div>
        <a href="#etapas" className={styles.heroCtaScroll}>
          Ver las herramientas ↓
        </a>
      </header>

      <LegalNotice />

      {/* Disclaimer de salud - OBLIGATORIO, visible y fuera de toggles */}
      <DisclaimerCard
        variant="medical"
        severity="critical"
        context="accesibilidad-guia"
        title="Información importante sobre estas herramientas"
      >
        Las herramientas de esta guía son apoyos digitales de carácter general. No sustituyen el
        diagnóstico clínico, la evaluación psicopedagógica ni el tratamiento por parte de
        profesionales especializados (logopedas, psicólogos, terapeutas ocupacionales, neurólogos u
        otros). Si tienes dudas sobre las necesidades de una persona, consulta siempre con un
        profesional cualificado.
      </DisclaimerCard>

      {/* Bloque introductorio */}
      <section className={styles.introSection}>
        <div className={styles.introGrid}>
          <div className={styles.introCard}>
            <span className={styles.introIcon} aria-hidden="true">👁️</span>
            <h3 className={styles.introCardTitle}>¿Qué son los apoyos visuales?</h3>
            <p className={styles.introCardText}>
              Son herramientas que hacen visible lo que normalmente es abstracto: el tiempo,
              las emociones, las rutinas, la comunicación. Ayudan a personas con autismo,
              TDAH, dislexia u otras diferencias neurológicas a procesar el entorno con menos esfuerzo.
            </p>
          </div>
          <div className={styles.introCard}>
            <span className={styles.introIcon} aria-hidden="true">⚡</span>
            <h3 className={styles.introCardTitle}>¿Por qué funcionan?</h3>
            <p className={styles.introCardText}>
              El cerebro procesa las imágenes 60.000 veces más rápido que el texto.
              Los apoyos visuales reducen la carga cognitiva, aumentan la autonomía
              y disminuyen la ansiedad ante situaciones impredecibles.
            </p>
          </div>
          <div className={styles.introCard}>
            <span className={styles.introIcon} aria-hidden="true">🔒</span>
            <h3 className={styles.introCardTitle}>Privacidad total</h3>
            <p className={styles.introCardText}>
              Todo funciona en tu dispositivo. No guardamos datos personales,
              no requieren cuenta y funcionan sin conexión a internet
              una vez cargados.
            </p>
          </div>
        </div>
      </section>

      {/* Journey de 6 etapas */}
      <section id="etapas" className={styles.journeySection}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true">🗺️</span> Las 6 etapas del apoyo en casa
        </h2>
        <p className={styles.sectionSubtitle}>
          No es un proceso lineal. Usa las herramientas que necesites, cuando las necesites.
        </p>

        <div className={styles.stagesContainer}>
          {journeyStages.map((stage) => (
            <div key={stage.number} className={styles.stageBlock}>
              <div className={styles.stageHeader}>
                <div className={styles.stageNumber} aria-label={`Etapa ${stage.number}`}>
                  {stage.number}
                </div>
                <div className={styles.stageHeaderText}>
                  <span className={styles.stageEmoji} aria-hidden="true">{stage.emoji}</span>
                  <h3 className={styles.stageTitle}>{stage.title}</h3>
                </div>
              </div>
              <p className={styles.stageNeed}>{stage.need}</p>
              <div className={styles.stageTools}>
                {stage.tools.map((tool) => (
                  <Link key={tool.id} href={tool.url} className={styles.toolCard}>
                    <div className={styles.toolCardHeader}>
                      <span className={styles.toolCardIcon} aria-hidden="true">{tool.icon}</span>
                      <h4 className={styles.toolCardName}>{tool.name}</h4>
                    </div>
                    <p className={styles.toolCardDescription}>{tool.description}</p>
                    <span className={styles.toolCardCta} aria-label={`Usar ${tool.name}`}>
                      Usar ahora →
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bloque "¿Por dónde empiezo?" */}
      <section className={styles.profilesSection}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true">🧭</span> ¿Por dónde empiezo?
        </h2>
        <p className={styles.sectionSubtitle}>
          Selecciona el perfil que más se acerca a tu situación para ver una sugerencia personalizada.
        </p>

        <div className={styles.profilesGrid}>
          {perfiles.map((perfil) => (
            <button
              key={perfil.id}
              type="button"
              className={`${styles.profileCard} ${perfilActivo === perfil.id ? styles.profileCardActive : ''}`}
              onClick={() => setPerfilActivo(perfilActivo === perfil.id ? null : perfil.id)}
              aria-expanded={perfilActivo === perfil.id ? true : false}
              aria-controls={`perfil-detalle-${perfil.id}`}
            >
              <span className={styles.profileEmoji} aria-hidden="true">{perfil.emoji}</span>
              <h3 className={styles.profileTitle}>{perfil.titulo}</h3>
              <p className={styles.profileDescription}>{perfil.descripcion}</p>
            </button>
          ))}
        </div>

        {perfilActivo && (
          <div
            className={styles.profileDetail}
            id={`perfil-detalle-${perfilActivo}`}
            role="region"
            aria-live="polite"
          >
            {perfiles.filter((p) => p.id === perfilActivo).map((perfil) => (
              <div key={perfil.id} className={styles.profileDetailContent}>
                <p className={styles.profileDetailLabel}>
                  <strong>Herramientas recomendadas para este perfil:</strong>{' '}
                  {perfil.herramientas.join(' · ')}
                </p>
                <div className={styles.profileDetailCta}>
                  <span>Te sugerimos empezar por:</span>
                  <Link href={perfil.empezarPor.url} className={styles.profileStartButton}>
                    <span aria-hidden="true">{perfil.empezarPor.emoji}</span>
                    {perfil.empezarPor.nombre}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Bloque de recursos adicionales */}
      <section className={styles.resourcesSection}>
        <h2 className={styles.sectionTitle}>
          <span aria-hidden="true">📚</span> Más recursos de accesibilidad
        </h2>
        <div className={styles.resourcesGrid}>
          <Link href="/suite/accesibilidad/" className={styles.resourceCard}>
            <span className={styles.resourceIcon} aria-hidden="true">♿</span>
            <div>
              <h3 className={styles.resourceTitle}>Suite Accesibilidad e Inclusión</h3>
              <p className={styles.resourceDescription}>
                Catálogo completo con las 15 herramientas de accesibilidad disponibles en meskeIA.
              </p>
              <span className={styles.resourceCta}>Ver todas →</span>
            </div>
          </Link>
          <div className={styles.resourceCard}>
            <span className={styles.resourceIcon} aria-hidden="true">🔒</span>
            <div>
              <h3 className={styles.resourceTitle}>Sin datos, sin preocupaciones</h3>
              <p className={styles.resourceDescription}>
                Ninguna herramienta de esta guía envía datos a servidores externos.
                Todo el procesamiento ocurre en tu dispositivo. Puedes usarlas con total tranquilidad.
              </p>
            </div>
          </div>
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('guia-accesibilidad')} />
      <Footer appName="guia-accesibilidad" />
    </div>
  );
}
