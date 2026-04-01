'use client';

import { useState } from 'react';
import styles from './OrientadorTipoOposicion.module.css';
import {
  MeskeiaLogo, Footer, LegalNotice, EducationalSection, RelatedApps,
  ShareCard, DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Pregunta {
  id: string;
  texto: string;
  opciones: { valor: string; texto: string }[];
}

interface Oposicion {
  nombre: string;
  grupo: string;
  icono: string;
  descripcion: string;
  requisitos: string;
  duracionPreparacion: string;
  salarioOrientativo: string;
  ambitos: string[];
  estudiosMinimo: string[];
  compatibleTrabajo: boolean;
}

// ─── Preguntas ────────────────────────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 'estudios',
    texto: '¿Cuál es tu nivel de estudios?',
    opciones: [
      { valor: 'eso', texto: 'ESO o equivalente' },
      { valor: 'bach', texto: 'Bachillerato o FP Medio' },
      { valor: 'grado', texto: 'Grado universitario o FP Superior' },
      { valor: 'master', texto: 'Máster o doctorado' },
    ],
  },
  {
    id: 'ambito',
    texto: '¿Qué ámbito te interesa más?',
    opciones: [
      { valor: 'admin', texto: 'Administración y gestión' },
      { valor: 'seguridad', texto: 'Seguridad y emergencias' },
      { valor: 'educacion', texto: 'Educación y formación' },
      { valor: 'justicia', texto: 'Justicia y derecho' },
      { valor: 'salud', texto: 'Sanidad y salud pública' },
      { valor: 'tecnico', texto: 'Técnico / TIC / ingeniería' },
    ],
  },
  {
    id: 'dedicacion',
    texto: '¿Cuánto tiempo puedes dedicar a prepararte?',
    opciones: [
      { valor: 'completa', texto: 'Dedicación completa (6-8h/día)' },
      { valor: 'parcial', texto: 'Media jornada (3-4h/día)' },
      { valor: 'minima', texto: 'Pocas horas (1-2h/día, compatibilizo con trabajo)' },
    ],
  },
  {
    id: 'plazo',
    texto: '¿En cuánto tiempo quieres presentarte?',
    opciones: [
      { valor: 'corto', texto: 'Menos de 1 año' },
      { valor: 'medio', texto: '1-2 años' },
      { valor: 'largo', texto: 'Más de 2 años (estoy preparándome a fondo)' },
    ],
  },
  {
    id: 'prioridad',
    texto: '¿Qué es más importante para ti?',
    opciones: [
      { valor: 'estabilidad', texto: 'Estabilidad y seguridad laboral' },
      { valor: 'salario', texto: 'Salario alto' },
      { valor: 'vocacion', texto: 'Vocación y servicio público' },
      { valor: 'conciliacion', texto: 'Conciliación y horario fijo' },
    ],
  },
  {
    id: 'movilidad',
    texto: '¿Aceptarías destino fuera de tu provincia?',
    opciones: [
      { valor: 'si', texto: 'Sí, sin problema' },
      { valor: 'ccaa', texto: 'Solo dentro de mi comunidad autónoma' },
      { valor: 'no', texto: 'Prefiero quedarme en mi ciudad' },
    ],
  },
  {
    id: 'tipo_examen',
    texto: '¿Qué tipo de prueba prefieres?',
    opciones: [
      { valor: 'test', texto: 'Test tipo examen' },
      { valor: 'desarrollo', texto: 'Temas a desarrollar por escrito' },
      { valor: 'practico', texto: 'Pruebas prácticas / físicas' },
      { valor: 'indiferente', texto: 'Me da igual' },
    ],
  },
  {
    id: 'edad',
    texto: '¿Tu rango de edad?',
    opciones: [
      { valor: 'joven', texto: 'Menos de 30 años' },
      { valor: 'medio', texto: '30-45 años' },
      { valor: 'mayor', texto: 'Más de 45 años' },
    ],
  },
];

// ─── Catálogo de oposiciones ──────────────────────────────────────────────────

const OPOSICIONES: Oposicion[] = [
  { nombre: 'Auxiliar Administrativo del Estado', grupo: 'C2', icono: '📋', descripcion: 'Tareas de apoyo administrativo, registro, archivo y atención al ciudadano en organismos de la AGE.', requisitos: 'ESO o equivalente', duracionPreparacion: '6-12 meses', salarioOrientativo: '18.000-22.000 €/año', ambitos: ['admin'], estudiosMinimo: ['eso', 'bach', 'grado', 'master'], compatibleTrabajo: true },
  { nombre: 'Administrativo del Estado', grupo: 'C1', icono: '🏛️', descripcion: 'Gestión administrativa, tramitación de expedientes, contabilidad pública.', requisitos: 'Bachillerato o FP Medio', duracionPreparacion: '12-18 meses', salarioOrientativo: '22.000-27.000 €/año', ambitos: ['admin'], estudiosMinimo: ['bach', 'grado', 'master'], compatibleTrabajo: true },
  { nombre: 'Técnico de Gestión (AGE)', grupo: 'A2', icono: '📊', descripcion: 'Gestión y coordinación en ministerios y organismos públicos.', requisitos: 'Grado universitario', duracionPreparacion: '18-24 meses', salarioOrientativo: '28.000-35.000 €/año', ambitos: ['admin'], estudiosMinimo: ['grado', 'master'], compatibleTrabajo: false },
  { nombre: 'Técnico Superior de la AGE (A1)', grupo: 'A1', icono: '⭐', descripcion: 'Puestos directivos y de alta responsabilidad en la Administración General del Estado.', requisitos: 'Grado universitario', duracionPreparacion: '24-36 meses', salarioOrientativo: '35.000-50.000 €/año', ambitos: ['admin', 'tecnico'], estudiosMinimo: ['grado', 'master'], compatibleTrabajo: false },
  { nombre: 'Policía Nacional', grupo: 'C1', icono: '👮', descripcion: 'Seguridad ciudadana, investigación criminal, extranjería, fronteras.', requisitos: 'Bachillerato + pruebas físicas', duracionPreparacion: '12-18 meses', salarioOrientativo: '25.000-32.000 €/año', ambitos: ['seguridad'], estudiosMinimo: ['bach', 'grado', 'master'], compatibleTrabajo: false },
  { nombre: 'Guardia Civil', grupo: 'C1', icono: '🛡️', descripcion: 'Seguridad rural, tráfico, medio ambiente, costas, intervención de armas.', requisitos: 'Bachillerato + pruebas físicas', duracionPreparacion: '12-18 meses', salarioOrientativo: '24.000-30.000 €/año', ambitos: ['seguridad'], estudiosMinimo: ['bach', 'grado', 'master'], compatibleTrabajo: false },
  { nombre: 'Bombero', grupo: 'C1/C2', icono: '🚒', descripcion: 'Extinción de incendios, rescate, emergencias. Convocatorias locales y autonómicas.', requisitos: 'ESO/Bach + pruebas físicas exigentes', duracionPreparacion: '12-24 meses', salarioOrientativo: '25.000-35.000 €/año', ambitos: ['seguridad'], estudiosMinimo: ['eso', 'bach', 'grado'], compatibleTrabajo: false },
  { nombre: 'Maestro/a (Educación Primaria)', grupo: 'A2', icono: '📚', descripcion: 'Docencia en colegios públicos de educación primaria.', requisitos: 'Grado en Educación Primaria', duracionPreparacion: '12-24 meses', salarioOrientativo: '25.000-32.000 €/año', ambitos: ['educacion'], estudiosMinimo: ['grado', 'master'], compatibleTrabajo: true },
  { nombre: 'Profesor/a de Secundaria', grupo: 'A1', icono: '🎓', descripcion: 'Docencia en institutos públicos de ESO y Bachillerato.', requisitos: 'Grado + Máster del Profesorado', duracionPreparacion: '12-24 meses', salarioOrientativo: '28.000-38.000 €/año', ambitos: ['educacion'], estudiosMinimo: ['master'], compatibleTrabajo: true },
  { nombre: 'Auxilio Judicial', grupo: 'C2', icono: '⚖️', descripcion: 'Apoyo en juzgados: notificaciones, embargos, actos de comunicación.', requisitos: 'ESO o equivalente', duracionPreparacion: '6-12 meses', salarioOrientativo: '18.000-22.000 €/año', ambitos: ['justicia'], estudiosMinimo: ['eso', 'bach', 'grado', 'master'], compatibleTrabajo: true },
  { nombre: 'Tramitación Procesal', grupo: 'C1', icono: '📜', descripcion: 'Tramitación de procedimientos judiciales, gestión de expedientes en juzgados.', requisitos: 'Bachillerato o FP Medio', duracionPreparacion: '12-18 meses', salarioOrientativo: '22.000-27.000 €/año', ambitos: ['justicia'], estudiosMinimo: ['bach', 'grado', 'master'], compatibleTrabajo: true },
  { nombre: 'Gestión Procesal', grupo: 'A2', icono: '🏛️', descripcion: 'Dirección técnica procesal, fe pública judicial, coordinación de oficina judicial.', requisitos: 'Grado universitario', duracionPreparacion: '18-24 meses', salarioOrientativo: '28.000-35.000 €/año', ambitos: ['justicia'], estudiosMinimo: ['grado', 'master'], compatibleTrabajo: false },
  { nombre: 'Enfermero/a (SERMAS / SAS / etc.)', grupo: 'A2', icono: '🏥', descripcion: 'Enfermería en hospitales y centros de salud públicos. Convocatorias autonómicas.', requisitos: 'Grado en Enfermería', duracionPreparacion: '12-18 meses', salarioOrientativo: '26.000-34.000 €/año', ambitos: ['salud'], estudiosMinimo: ['grado', 'master'], compatibleTrabajo: true },
  { nombre: 'Técnico/a en Informática (AGE)', grupo: 'A1/A2', icono: '💻', descripcion: 'Desarrollo, sistemas, ciberseguridad y gestión TIC en la Administración.', requisitos: 'Grado en Informática o similar', duracionPreparacion: '12-24 meses', salarioOrientativo: '28.000-42.000 €/año', ambitos: ['tecnico'], estudiosMinimo: ['grado', 'master'], compatibleTrabajo: true },
  { nombre: 'Celador/a (SAS / SERMAS)', grupo: 'E/C2', icono: '🚑', descripcion: 'Traslado de pacientes, vigilancia, apoyo en hospitales y centros de salud públicos.', requisitos: 'Sin titulación específica', duracionPreparacion: '3-6 meses', salarioOrientativo: '16.000-20.000 €/año', ambitos: ['salud'], estudiosMinimo: ['eso', 'bach', 'grado', 'master'], compatibleTrabajo: true },
  { nombre: 'Correos (Personal Laboral)', grupo: 'Laboral', icono: '📮', descripcion: 'Reparto, atención en oficinas, clasificación. Convocatoria anual masiva.', requisitos: 'ESO o equivalente', duracionPreparacion: '3-6 meses', salarioOrientativo: '16.000-20.000 €/año', ambitos: ['admin'], estudiosMinimo: ['eso', 'bach', 'grado', 'master'], compatibleTrabajo: true },
];

// ─── Lógica de filtrado ───────────────────────────────────────────────────────

function filtrarOposiciones(respuestas: Record<string, string>): Oposicion[] {
  return OPOSICIONES.filter(op => {
    // Filtro por estudios
    if (respuestas.estudios && !op.estudiosMinimo.includes(respuestas.estudios)) return false;

    // Filtro por ámbito
    if (respuestas.ambito && !op.ambitos.includes(respuestas.ambito)) return false;

    // Filtro por compatibilidad con trabajo
    if (respuestas.dedicacion === 'minima' && !op.compatibleTrabajo) return false;

    return true;
  }).sort((a, b) => {
    // Priorizar por dedicación disponible
    if (respuestas.plazo === 'corto') {
      const durA = parseInt(a.duracionPreparacion) || 12;
      const durB = parseInt(b.duracionPreparacion) || 12;
      return durA - durB;
    }
    return 0;
  });
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function OrientadorTipoOposicionPage() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const testTerminado = Object.keys(respuestas).length === PREGUNTAS.length;

  const handleRespuesta = (preguntaId: string, valor: string) => {
    setRespuestas(prev => ({ ...prev, [preguntaId]: valor }));
    if (preguntaActual < PREGUNTAS.length - 1) {
      setPreguntaActual(preguntaActual + 1);
    }
  };

  const reiniciar = () => {
    setRespuestas({});
    setPreguntaActual(0);
  };

  const resultados = testTerminado ? filtrarOposiciones(respuestas) : [];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">🎯</span>
          <h1 className={styles.title}>Orientador de Tipo de Oposición</h1>
          <p className={styles.subtitle}>
            8 preguntas para descubrir qué oposiciones encajan con tu perfil, estudios y objetivos
          </p>
        </header>

        <LegalNotice />
        <DisclaimerCard variant="educational" severity="medium" context="orientador-tipo-oposicion" />

        {/* ── Test ── */}
        {!testTerminado ? (
          <div className={styles.testSection}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${(Object.keys(respuestas).length / PREGUNTAS.length) * 100}%` }} />
            </div>
            <p className={styles.progressText}>Pregunta {preguntaActual + 1} de {PREGUNTAS.length}</p>

            <div className={styles.preguntaCard}>
              <h2 className={styles.preguntaTexto}>{PREGUNTAS[preguntaActual].texto}</h2>
              <div className={styles.opcionesGrid}>
                {PREGUNTAS[preguntaActual].opciones.map(op => (
                  <button
                    key={op.valor}
                    type="button"
                    className={`${styles.opcionBtn} ${respuestas[PREGUNTAS[preguntaActual].id] === op.valor ? styles.opcionSeleccionada : ''}`}
                    onClick={() => handleRespuesta(PREGUNTAS[preguntaActual].id, op.valor)}
                  >
                    {op.texto}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.navBtns}>
              {preguntaActual > 0 && (
                <button type="button" className={styles.btnSecundario} onClick={() => setPreguntaActual(preguntaActual - 1)}>Anterior</button>
              )}
              {respuestas[PREGUNTAS[preguntaActual].id] && preguntaActual < PREGUNTAS.length - 1 && (
                <button type="button" className={styles.btn} onClick={() => setPreguntaActual(preguntaActual + 1)}>Siguiente</button>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.resultadoSection}>
            <div className={styles.resultadoHeader}>
              <h2>{resultados.length} oposiciones encajan con tu perfil</h2>
              <button type="button" className={styles.btnSecundario} onClick={reiniciar}>Repetir test</button>
            </div>

            {resultados.length === 0 ? (
              <div className={styles.sinResultados}>
                <span aria-hidden="true">🔍</span>
                <p>No hemos encontrado oposiciones que coincidan exactamente con tu perfil. Prueba a cambiar alguna respuesta (especialmente ámbito o nivel de estudios).</p>
              </div>
            ) : (
              <div className={styles.oposicionesGrid}>
                {resultados.map((op, i) => (
                  <div key={i} className={styles.oposicionCard}>
                    <div className={styles.oposicionHeader}>
                      <span className={styles.oposicionIcono} aria-hidden="true">{op.icono}</span>
                      <div>
                        <h3 className={styles.oposicionNombre}>{op.nombre}</h3>
                        <span className={styles.grupoBadge}>Grupo {op.grupo}</span>
                      </div>
                    </div>
                    <p className={styles.oposicionDesc}>{op.descripcion}</p>
                    <div className={styles.oposicionMeta}>
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Requisitos</span>
                        <span className={styles.metaValor}>{op.requisitos}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Preparación</span>
                        <span className={styles.metaValor}>{op.duracionPreparacion}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Salario orientativo</span>
                        <span className={styles.metaValor}>{op.salarioOrientativo}</span>
                      </div>
                      <div className={styles.metaItem}>
                        <span className={styles.metaLabel}>Compatible con trabajo</span>
                        <span className={styles.metaValor}>{op.compatibleTrabajo ? 'Sí' : 'Difícil'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.avisoCard}>
              <span aria-hidden="true">⚠️</span>
              <p>
                <strong>Esto es solo orientación.</strong> Los requisitos, plazas y condiciones cambian en cada
                convocatoria. Consulta siempre el BOE o el boletín oficial correspondiente para ver la
                convocatoria vigente de la oposición que te interese.
              </p>
            </div>
          </div>
        )}

        <EducationalSection
          title="📚 Guía básica para opositores"
          subtitle="Lo que debes saber antes de empezar"
        >
          <section className={styles.guideSection}>
            <h2>¿Cómo funcionan las oposiciones en España?</h2>
            <p>
              Las oposiciones son procesos selectivos para acceder al empleo público. Se publican en el
              BOE (Administración General del Estado) o en los boletines de cada CCAA/ayuntamiento.
              Hay diferentes <strong>grupos</strong> según la titulación requerida:
            </p>

            <div className={styles.gruposGrid}>
              <div className={styles.grupoCard}><strong>A1</strong><p>Grado universitario. Puestos directivos. Mayor salario.</p></div>
              <div className={styles.grupoCard}><strong>A2</strong><p>Grado universitario. Puestos técnicos medios.</p></div>
              <div className={styles.grupoCard}><strong>C1</strong><p>Bachillerato o FP Medio. Administrativos, policía.</p></div>
              <div className={styles.grupoCard}><strong>C2</strong><p>ESO o equivalente. Auxiliares, celadores.</p></div>
            </div>

            <div className={styles.faqList}>
              <details className={styles.faqItem}>
                <summary>¿Necesito academia para preparar oposiciones?</summary>
                <p>No es obligatorio, pero ayuda mucho: temarios actualizados, simulacros de examen, preparadores especializados y grupo de apoyo. Hay opositores que se preparan por libre con éxito, especialmente para grupos C1 y C2.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Puedo presentarme a varias oposiciones a la vez?</summary>
                <p>Sí, siempre que los exámenes no coincidan en fecha. Muchos opositores se presentan a varias convocatorias similares (ej: auxiliar AGE + auxiliar CCAA) para multiplicar oportunidades.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Hay límite de edad?</summary>
                <p>Para la mayoría no (salvo jubilación forzosa a los 65). Las excepciones principales son Policía Nacional (máximo 65 años), Guardia Civil (máximo 40 años para ingreso directo) y bomberos (varía por convocatoria).</p>
              </details>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">💡</span>
                <strong>Antes de decidir</strong>
              </div>
              <ul className={styles.warningList}>
                <li>Consulta siempre la convocatoria oficial en el BOE o boletín de tu CCAA</li>
                <li>Los salarios y requisitos son orientativos — varían por administración y complementos</li>
                <li>El tiempo de preparación depende de tu base, dedicación y la dificultad de la oposición</li>
                <li>Habla con opositores que hayan aprobado para conocer la experiencia real</li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('orientador-tipo-oposicion')} />
        <ShareCard appName="orientador-tipo-oposicion" />
        <Footer appName="orientador-tipo-oposicion" />
      </div>
    </>
  );
}
