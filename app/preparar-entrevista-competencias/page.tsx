'use client';
// @disclaimer: exempt

import { useState, useEffect, useCallback } from 'react';
import styles from './PrepararEntrevistaCompetencias.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatDate } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────────────────────────────────
// Catálogo de competencias conductuales frecuentes en entrevistas de trabajo.
// Contenido específico de la app (no es dato normativo) → vive aquí.
// El JSON-LD (jsonLd + faqJsonLd) lo inyecta layout.tsx, no este componente.
// ─────────────────────────────────────────────────────────────────────────
interface Competencia {
  id: string;
  nombre: string;
  icono: string;
  descripcion: string;
  preguntas: string[];
}

const COMPETENCIAS: Competencia[] = [
  {
    id: 'liderazgo',
    nombre: 'Liderazgo',
    icono: '🧭',
    descripcion: 'Capacidad de guiar, influir y coordinar a otras personas hacia un objetivo común.',
    preguntas: [
      'Cuéntame una situación en la que tuviste que liderar a un equipo, aunque no fueras su jefe formal.',
      'Describe una vez en la que motivaste a alguien que estaba desmotivado.',
      '¿Cómo conseguiste que un grupo siguiera una dirección con la que al principio no estaba de acuerdo?',
    ],
  },
  {
    id: 'trabajo-equipo',
    nombre: 'Trabajo en equipo',
    icono: '🤝',
    descripcion: 'Colaborar de forma efectiva, aportar al grupo y sumar con personas distintas a ti.',
    preguntas: [
      'Háblame de un proyecto en equipo en el que surgieron desacuerdos. ¿Cómo actuaste?',
      '¿Cuál fue tu contribución concreta al éxito de un equipo?',
      'Describe una ocasión en la que ayudaste a un compañero que iba atascado.',
    ],
  },
  {
    id: 'resolucion-conflictos',
    nombre: 'Resolución de conflictos',
    icono: '⚖️',
    descripcion: 'Gestionar tensiones y desacuerdos buscando una salida constructiva.',
    preguntas: [
      'Describe un conflicto que tuviste con un compañero y cómo lo resolviste.',
      'Cuéntame una vez en la que no estabas de acuerdo con tu responsable. ¿Qué hiciste?',
      '¿Cómo manejaste una situación con una persona difícil o poco colaboradora?',
    ],
  },
  {
    id: 'iniciativa',
    nombre: 'Iniciativa y proactividad',
    icono: '🚀',
    descripcion: 'Anticiparte, proponer mejoras y actuar sin esperar a que te lo pidan.',
    preguntas: [
      'Cuéntame una ocasión en la que propusiste una mejora sin que nadie te lo pidiera.',
      'Describe una vez en la que detectaste un problema antes de que se agravara.',
      '¿Cuándo has ido más allá de lo que se esperaba de tu puesto?',
    ],
  },
  {
    id: 'fracaso-resiliencia',
    nombre: 'Gestión del fracaso y resiliencia',
    icono: '🔄',
    descripcion: 'Aprender de los errores y recuperarte ante situaciones adversas.',
    preguntas: [
      'Háblame de un error importante que cometiste y de lo que aprendiste.',
      'Describe un proyecto que no salió como esperabas. ¿Qué hiciste después?',
      'Cuéntame una vez en la que recibiste una crítica dura. ¿Cómo reaccionaste?',
    ],
  },
  {
    id: 'adaptacion',
    nombre: 'Adaptación al cambio',
    icono: '🌱',
    descripcion: 'Responder con flexibilidad ante cambios inesperados de contexto o prioridades.',
    preguntas: [
      'Describe un cambio inesperado en tu trabajo y cómo te adaptaste.',
      'Cuéntame una vez en la que tuviste que aprender algo nuevo muy rápido.',
      '¿Cómo reaccionaste cuando cambiaron las prioridades a mitad de un proyecto?',
    ],
  },
  {
    id: 'orientacion-resultados',
    nombre: 'Orientación a resultados',
    icono: '🎯',
    descripcion: 'Enfocarte en cumplir objetivos concretos y medibles.',
    preguntas: [
      'Cuéntame un objetivo ambicioso que lograste alcanzar.',
      'Describe una vez en la que trabajaste bajo un plazo muy exigente.',
      '¿Cómo mediste el éxito en alguno de tus proyectos?',
    ],
  },
  {
    id: 'comunicacion',
    nombre: 'Comunicación',
    icono: '💬',
    descripcion: 'Explicar ideas con claridad y adaptar el mensaje a cada interlocutor.',
    preguntas: [
      'Describe una vez en la que explicaste algo complejo a alguien sin conocimientos técnicos.',
      'Cuéntame una situación en la que tuviste que dar una noticia difícil.',
      '¿Cómo te aseguraste de que un mensaje importante se entendiera bien?',
    ],
  },
  {
    id: 'toma-decisiones',
    nombre: 'Toma de decisiones',
    icono: '🧩',
    descripcion: 'Decidir con criterio, incluso con información incompleta o presión de tiempo.',
    preguntas: [
      'Háblame de una decisión difícil que tomaste con información incompleta.',
      'Describe una vez en la que tuviste que decidir rápido bajo presión.',
      '¿Cómo elegiste entre dos opciones con ventajas e inconvenientes parecidos?',
    ],
  },
  {
    id: 'gestion-tiempo',
    nombre: 'Gestión del tiempo y prioridades',
    icono: '⏱️',
    descripcion: 'Organizar tareas y priorizar cuando el tiempo o los recursos son limitados.',
    preguntas: [
      'Cuéntame cómo gestionaste varias prioridades a la vez con un plazo ajustado.',
      'Describe una semana especialmente saturada. ¿Cómo la organizaste?',
      '¿Qué haces cuando todo parece urgente al mismo tiempo?',
    ],
  },
];

// Guía por cada casilla del método STAR
const GUIA_STAR = {
  situacion: {
    etiqueta: 'Situación',
    icono: '📍',
    ayuda: 'Describe el contexto en 2-3 frases: dónde estabas, cuándo y qué pasaba. Da solo lo necesario para entender el reto.',
    placeholder:
      'En mi anterior empresa, durante el lanzamiento de un producto, el equipo se quedó sin uno de sus dos desarrolladores a dos semanas de la fecha de entrega…',
  },
  tarea: {
    etiqueta: 'Tarea',
    icono: '🎯',
    ayuda: 'Explica cuál era tu responsabilidad concreta o el reto que debías resolver. ¿Qué se esperaba de ti?',
    placeholder:
      'Yo era responsable de que la funcionalidad de pago estuviera lista y probada para la demo con el cliente…',
  },
  accion: {
    etiqueta: 'Acción',
    icono: '🛠️',
    ayuda: 'Lo más importante: qué hiciste TÚ, en primera persona ("yo", no "nosotros"). Detalla los pasos y tus decisiones.',
    placeholder:
      'Prioricé las tres funciones críticas, negocié con el cliente posponer dos secundarias, y organicé dos sesiones de trabajo conjunto para desbloquear…',
  },
  resultado: {
    etiqueta: 'Resultado',
    icono: '🏁',
    ayuda: 'Cierra con lo que conseguiste. Cuantifica siempre que puedas (%, cifras, tiempo) y añade qué aprendiste.',
    placeholder:
      'Entregamos a tiempo las funciones clave, el cliente firmó el contrato (18.000 €) y adopté esa forma de priorizar para futuros proyectos…',
  },
};

// Ejemplo completo de referencia (competencia: resolución de conflictos)
const EJEMPLO = {
  competencia: 'Resolución de conflictos',
  situacion:
    'En un proyecto de seis meses, dos personas del equipo llevaban semanas sin hablarse tras un malentendido sobre quién debía documentar el código. La tensión empezaba a ralentizar las entregas.',
  tarea:
    'Como coordinador de la parte técnica, mi responsabilidad era que el equipo volviera a colaborar sin que el proyecto se resintiera, aunque yo no era el jefe de ninguno de los dos.',
  accion:
    'Hablé por separado con cada uno para entender su versión sin juzgar. Después propuse una reunión breve, acordamos por escrito quién documentaba cada módulo y establecí una revisión conjunta semanal de 15 minutos para evitar nuevos malentendidos.',
  resultado:
    'En dos semanas la comunicación se normalizó y recuperamos el retraso acumulado (unos 4 días). Entregamos el proyecto en plazo y esa rutina de revisión semanal se mantuvo en proyectos posteriores.',
};

const STORAGE_KEY = 'meskeia-star-historias';

interface HistoriaSTAR {
  id: string;
  competenciaId: string;
  titulo: string;
  situacion: string;
  tarea: string;
  accion: string;
  resultado: string;
  fecha: string; // ISO
}

interface CheckCompletitud {
  label: string;
  ok: boolean;
}

// Evaluación determinista (heurística, sin IA) de la calidad de una respuesta STAR
function evaluarCompletitud(h: {
  situacion: string;
  tarea: string;
  accion: string;
  resultado: string;
}): CheckCompletitud[] {
  const palabras = `${h.situacion} ${h.tarea} ${h.accion} ${h.resultado}`
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  const primeraPersona =
    /\b(yo|mi|me|decid[íi]|propuse|implement[ée]|organic[ée]|cre[ée]|lider[ée]|negoci[ée]|analic[ée]|prioric[ée]|contact[ée]|dise[ñn][ée]|resolv[íi]|coordin[ée]|convenc[íi]|gestion[ée]|desarroll[ée])\b/i;

  const resultadoCuantificado =
    /(\d|%|€|por\s?ciento|redu[jc]|aument|ahorr|mejor|consegu|logr|increment|dupli|super|entreg)/i;

  return [
    { label: 'Situación con contexto claro', ok: h.situacion.trim().length >= 40 },
    { label: 'Tarea o reto bien definido', ok: h.tarea.trim().length >= 25 },
    {
      label: 'Acción en primera persona ("yo", no "nosotros")',
      ok: h.accion.trim().length >= 40 && primeraPersona.test(h.accion),
    },
    {
      label: 'Resultado concreto y, a ser posible, cuantificado',
      ok: h.resultado.trim().length >= 30 && resultadoCuantificado.test(h.resultado),
    },
    {
      label: 'Extensión equilibrada (≈120-320 palabras, 1,5-2 min)',
      ok: palabras >= 120 && palabras <= 320,
    },
  ];
}

function nuevoId(): string {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export default function PrepararEntrevistaCompetenciasPage() {
  const [historias, setHistorias] = useState<HistoriaSTAR[]>([]);
  const [cargado, setCargado] = useState(false);

  const [competenciaSel, setCompetenciaSel] = useState<string>(COMPETENCIAS[0].id);
  const [titulo, setTitulo] = useState('');
  const [situacion, setSituacion] = useState('');
  const [tarea, setTarea] = useState('');
  const [accion, setAccion] = useState('');
  const [resultado, setResultado] = useState('');
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [mostrarEjemplo, setMostrarEjemplo] = useState(false);
  const [filtro, setFiltro] = useState<string>('todas');
  const [aviso, setAviso] = useState('');

  // Cargar banco desde localStorage al montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setHistorias(parsed as HistoriaSTAR[]);
        }
      }
    } catch {
      // Datos corruptos: se ignoran y se empieza en limpio
    }
    setCargado(true);
  }, []);

  // Persistir el banco cada vez que cambia (solo tras la carga inicial)
  useEffect(() => {
    if (!cargado) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(historias));
    } catch {
      // Almacenamiento lleno o no disponible: se ignora silenciosamente
    }
  }, [historias, cargado]);

  const competenciaActual = COMPETENCIAS.find((c) => c.id === competenciaSel) ?? COMPETENCIAS[0];

  const checks = evaluarCompletitud({ situacion, tarea, accion, resultado });
  const puntuacion = checks.filter((c) => c.ok).length;

  const limpiarFormulario = useCallback(() => {
    setTitulo('');
    setSituacion('');
    setTarea('');
    setAccion('');
    setResultado('');
    setEditandoId(null);
  }, []);

  const guardarHistoria = () => {
    if (accion.trim().length < 20 || situacion.trim().length < 20) {
      setAviso('Completa al menos la Situación y la Acción antes de guardar.');
      return;
    }

    const base: HistoriaSTAR = {
      id: editandoId ?? nuevoId(),
      competenciaId: competenciaSel,
      titulo: titulo.trim() || `Historia de ${competenciaActual.nombre.toLowerCase()}`,
      situacion: situacion.trim(),
      tarea: tarea.trim(),
      accion: accion.trim(),
      resultado: resultado.trim(),
      fecha: new Date().toISOString(),
    };

    if (editandoId) {
      setHistorias((prev) => prev.map((h) => (h.id === editandoId ? base : h)));
      setAviso('Historia actualizada y guardada en tu navegador.');
    } else {
      setHistorias((prev) => [base, ...prev]);
      setAviso('Historia guardada en tu navegador.');
    }
    limpiarFormulario();
  };

  const editarHistoria = (h: HistoriaSTAR) => {
    setCompetenciaSel(h.competenciaId);
    setTitulo(h.titulo);
    setSituacion(h.situacion);
    setTarea(h.tarea);
    setAccion(h.accion);
    setResultado(h.resultado);
    setEditandoId(h.id);
    setAviso('Editando una historia existente. Guarda para conservar los cambios.');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const eliminarHistoria = (id: string) => {
    setHistorias((prev) => prev.filter((h) => h.id !== id));
    if (editandoId === id) limpiarFormulario();
    setAviso('Historia eliminada.');
  };

  const nombreCompetencia = (id: string) =>
    COMPETENCIAS.find((c) => c.id === id)?.nombre ?? 'Competencia';

  const iconoCompetencia = (id: string) =>
    COMPETENCIAS.find((c) => c.id === id)?.icono ?? '⭐';

  // Construye el texto Markdown del banco completo
  const construirMarkdown = useCallback((lista: HistoriaSTAR[]) => {
    let md = '# Mi banco de respuestas STAR\n\n';
    md += `_Preparación de entrevista por competencias — ${lista.length} historia(s)_\n\n`;
    COMPETENCIAS.forEach((c) => {
      const delGrupo = lista.filter((h) => h.competenciaId === c.id);
      if (delGrupo.length === 0) return;
      md += `## ${c.nombre}\n\n`;
      delGrupo.forEach((h) => {
        md += `### ${h.titulo}\n\n`;
        md += `**Situación:** ${h.situacion}\n\n`;
        if (h.tarea) md += `**Tarea:** ${h.tarea}\n\n`;
        md += `**Acción:** ${h.accion}\n\n`;
        if (h.resultado) md += `**Resultado:** ${h.resultado}\n\n`;
        md += '---\n\n';
      });
    });
    return md;
  }, []);

  const historiasFiltradas =
    filtro === 'todas' ? historias : historias.filter((h) => h.competenciaId === filtro);

  const copiarBanco = async () => {
    if (historias.length === 0) return;
    try {
      await navigator.clipboard.writeText(construirMarkdown(historias));
      setAviso('Banco copiado al portapapeles en formato Markdown.');
    } catch {
      setAviso('No se pudo copiar. Prueba a descargar el banco.');
    }
  };

  const descargarBanco = () => {
    if (historias.length === 0) return;
    const contenido = construirMarkdown(historias);
    const blob = new Blob([contenido], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'banco-respuestas-star.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setAviso('Banco descargado como banco-respuestas-star.md');
  };

  // Competencias cubiertas (con al menos una historia)
  const competenciasCubiertas = new Set(historias.map((h) => h.competenciaId));

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">🌟</span> Preparar Entrevista por Competencias
        </h1>
        <p className={styles.subtitle}>
          Construye tu banco personal de respuestas con el método STAR: Situación, Tarea, Acción y
          Resultado. Todo se guarda en tu navegador.
        </p>
      </header>

      {/* Enlaces legales RGPD */}
      <LegalNotice />

      {/* Introducción breve */}
      <section className={styles.intro}>
        <p>
          En una <strong>entrevista por competencias</strong> no basta con decir que eres buen líder
          o que trabajas bien en equipo: te piden ejemplos reales. El <strong>método STAR</strong> te
          ayuda a contarlos de forma ordenada y creíble. Elige una competencia, redacta tu historia
          guiado paso a paso y guárdala. Con 8-10 historias variadas llegarás preparado a casi
          cualquier pregunta.
        </p>
      </section>

      {/* ── Paso 1: elegir competencia ── */}
      <section className={styles.panel} aria-labelledby="titulo-competencias">
        <h2 id="titulo-competencias" className={styles.panelTitle}>
          <span aria-hidden="true">1️⃣</span> Elige la competencia que quieres preparar
        </h2>
        <div className={styles.competenciaGrid} role="group" aria-label="Competencias disponibles">
          {COMPETENCIAS.map((c) => (
            <button
              type="button"
              key={c.id}
              className={`${styles.competenciaBtn} ${
                competenciaSel === c.id ? styles.competenciaBtnActiva : ''
              }`}
              aria-pressed={competenciaSel === c.id}
              onClick={() => setCompetenciaSel(c.id)}
            >
              <span className={styles.competenciaIcono} aria-hidden="true">
                {c.icono}
              </span>
              <span>{c.nombre}</span>
              {competenciasCubiertas.has(c.id) && (
                <span className={styles.competenciaCheck} aria-label="ya tienes una historia">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>

        <div className={styles.competenciaInfo}>
          <p className={styles.competenciaDesc}>{competenciaActual.descripcion}</p>
          <p className={styles.preguntasLabel}>
            <span aria-hidden="true">❓</span> Preguntas típicas para esta competencia:
          </p>
          <ul className={styles.preguntasLista}>
            {competenciaActual.preguntas.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Paso 2: redactar la historia STAR ── */}
      <section className={styles.panel} aria-labelledby="titulo-editor">
        <div className={styles.editorHeader}>
          <h2 id="titulo-editor" className={styles.panelTitle}>
            <span aria-hidden="true">2️⃣</span>{' '}
            {editandoId ? 'Editar historia' : 'Redacta tu respuesta STAR'}
          </h2>
          <button
            type="button"
            className={styles.btnGhost}
            aria-pressed={mostrarEjemplo}
            onClick={() => setMostrarEjemplo((v) => !v)}
          >
            <span aria-hidden="true">💡</span>{' '}
            {mostrarEjemplo ? 'Ocultar ejemplo' : 'Ver un ejemplo completo'}
          </button>
        </div>

        {mostrarEjemplo && (
          <div className={styles.ejemploCard}>
            <p className={styles.ejemploTag}>Ejemplo · {EJEMPLO.competencia}</p>
            <p>
              <strong>{GUIA_STAR.situacion.etiqueta}:</strong> {EJEMPLO.situacion}
            </p>
            <p>
              <strong>{GUIA_STAR.tarea.etiqueta}:</strong> {EJEMPLO.tarea}
            </p>
            <p>
              <strong>{GUIA_STAR.accion.etiqueta}:</strong> {EJEMPLO.accion}
            </p>
            <p>
              <strong>{GUIA_STAR.resultado.etiqueta}:</strong> {EJEMPLO.resultado}
            </p>
          </div>
        )}

        <div className={styles.campoGrupo}>
          <label className={styles.label} htmlFor="titulo">
            Título de la historia <span className={styles.opcional}>(opcional)</span>
          </label>
          <input
            id="titulo"
            type="text"
            className={styles.input}
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Ej.: El lanzamiento que salvamos priorizando"
            maxLength={120}
          />
        </div>

        {/* Casillas STAR */}
        <StarCampo id="situacion" guia={GUIA_STAR.situacion} value={situacion} onChange={setSituacion} />
        <StarCampo id="tarea" guia={GUIA_STAR.tarea} value={tarea} onChange={setTarea} />
        <StarCampo id="accion" guia={GUIA_STAR.accion} value={accion} onChange={setAccion} />
        <StarCampo id="resultado" guia={GUIA_STAR.resultado} value={resultado} onChange={setResultado} />

        {/* Indicador de completitud (determinista) */}
        <div className={styles.completitud}>
          <div className={styles.completitudHeader}>
            <span className={styles.completitudTitulo}>
              <span aria-hidden="true">📊</span> Calidad de tu respuesta
            </span>
            <span
              className={`${styles.completitudBadge} ${
                puntuacion >= 4
                  ? styles.badgeAlta
                  : puntuacion >= 2
                    ? styles.badgeMedia
                    : styles.badgeBaja
              }`}
            >
              {puntuacion} / {checks.length}
            </span>
          </div>
          <ul className={styles.completitudLista}>
            {checks.map((c) => (
              <li key={c.label} className={c.ok ? styles.checkOk : styles.checkPend}>
                <span aria-hidden="true">{c.ok ? '✅' : '⬜'}</span> {c.label}
              </li>
            ))}
          </ul>
          <p className={styles.completitudNota}>
            Es una guía orientativa, no una nota: una buena respuesta también depende de que el
            ejemplo sea real y relevante para el puesto.
          </p>
        </div>

        {aviso && (
          <p className={styles.aviso} role="status" aria-live="polite">
            {aviso}
          </p>
        )}

        <div className={styles.botonera}>
          <button type="button" className={styles.btnPrimary} onClick={guardarHistoria}>
            <span aria-hidden="true">💾</span>{' '}
            {editandoId ? 'Guardar cambios' : 'Guardar historia'}
          </button>
          <button type="button" className={styles.btnSecondary} onClick={limpiarFormulario}>
            <span aria-hidden="true">🧹</span> {editandoId ? 'Cancelar edición' : 'Limpiar'}
          </button>
        </div>
      </section>

      {/* ── Banco de historias ── */}
      <section className={styles.panel} aria-labelledby="titulo-banco">
        <div className={styles.bancoHeader}>
          <h2 id="titulo-banco" className={styles.panelTitle}>
            <span aria-hidden="true">🗂️</span> Tu banco de historias
            <span className={styles.bancoContador}>{historias.length}</span>
          </h2>
          {historias.length > 0 && (
            <div className={styles.exportBtns}>
              <button type="button" className={styles.btnExport} onClick={copiarBanco}>
                <span aria-hidden="true">📋</span> Copiar
              </button>
              <button type="button" className={styles.btnExport} onClick={descargarBanco}>
                <span aria-hidden="true">⬇️</span> Descargar .md
              </button>
            </div>
          )}
        </div>

        {/* Mapa de cobertura */}
        <div className={styles.cobertura}>
          <p className={styles.coberturaLabel}>
            Cobertura: {competenciasCubiertas.size} / {COMPETENCIAS.length} competencias con al menos
            una historia
          </p>
          <div className={styles.coberturaBarraFondo}>
            <div
              className={styles.coberturaBarra}
              style={{ width: `${(competenciasCubiertas.size / COMPETENCIAS.length) * 100}%` }}
            />
          </div>
        </div>

        {historias.length === 0 ? (
          <div className={styles.bancoVacio}>
            <span aria-hidden="true">📭</span>
            <p>Todavía no has guardado ninguna historia. Redacta tu primera respuesta arriba.</p>
          </div>
        ) : (
          <>
            {/* Filtros por competencia */}
            <div
              className={styles.filtros}
              role="group"
              aria-label="Filtrar historias por competencia"
            >
              <button
                type="button"
                className={`${styles.filtroBtn} ${filtro === 'todas' ? styles.filtroActivo : ''}`}
                aria-pressed={filtro === 'todas'}
                onClick={() => setFiltro('todas')}
              >
                Todas ({historias.length})
              </button>
              {COMPETENCIAS.filter((c) => competenciasCubiertas.has(c.id)).map((c) => {
                const n = historias.filter((h) => h.competenciaId === c.id).length;
                return (
                  <button
                    type="button"
                    key={c.id}
                    className={`${styles.filtroBtn} ${filtro === c.id ? styles.filtroActivo : ''}`}
                    aria-pressed={filtro === c.id}
                    onClick={() => setFiltro(c.id)}
                  >
                    <span aria-hidden="true">{c.icono}</span> {c.nombre} ({n})
                  </button>
                );
              })}
            </div>

            <ul className={styles.historiasLista}>
              {historiasFiltradas.map((h) => (
                <li key={h.id} className={styles.historiaCard}>
                  <div className={styles.historiaTop}>
                    <div>
                      <span className={styles.historiaCompetencia}>
                        <span aria-hidden="true">{iconoCompetencia(h.competenciaId)}</span>{' '}
                        {nombreCompetencia(h.competenciaId)}
                      </span>
                      <h3 className={styles.historiaTitulo}>{h.titulo}</h3>
                    </div>
                    <span className={styles.historiaFecha}>{formatDate(new Date(h.fecha))}</span>
                  </div>
                  <div className={styles.historiaCuerpo}>
                    <p>
                      <strong>{GUIA_STAR.situacion.etiqueta}:</strong> {h.situacion}
                    </p>
                    {h.tarea && (
                      <p>
                        <strong>{GUIA_STAR.tarea.etiqueta}:</strong> {h.tarea}
                      </p>
                    )}
                    <p>
                      <strong>{GUIA_STAR.accion.etiqueta}:</strong> {h.accion}
                    </p>
                    {h.resultado && (
                      <p>
                        <strong>{GUIA_STAR.resultado.etiqueta}:</strong> {h.resultado}
                      </p>
                    )}
                  </div>
                  <div className={styles.historiaAcciones}>
                    <button type="button" className={styles.btnMini} onClick={() => editarHistoria(h)}>
                      <span aria-hidden="true">✏️</span> Editar
                    </button>
                    <button
                      type="button"
                      className={styles.btnMiniDanger}
                      onClick={() => eliminarHistoria(h.id)}
                    >
                      <span aria-hidden="true">🗑️</span> Eliminar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      {/* ── Contenido educativo (patrón v2.0) ── */}
      <EducationalSection
        icon="🎓"
        title="Guía completa: entrevistas por competencias y método STAR"
        subtitle="Cómo prepararte, ejemplos, errores frecuentes y buenas prácticas"
      >
        <section className={styles.guideSection}>
          <p>
            La <strong>entrevista por competencias</strong> (o entrevista conductual) parte de una
            idea sencilla: la mejor forma de predecir cómo te comportarás en el futuro es conocer cómo
            actuaste en el pasado. Por eso el entrevistador no pregunta «¿eres resolutivo?», sino
            «cuéntame una situación en la que…». El <strong>método STAR</strong> es la forma más
            extendida de estructurar esas respuestas para que sean claras, concretas y memorables.
          </p>

          {/* 1. Tabla Comparativa */}
          <h3 className={styles.eduH3}>
            <span aria-hidden="true">⚖️</span> Las cuatro partes del método STAR
          </h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Parte</th>
                  <th>Qué responde</th>
                  <th>Peso ideal</th>
                  <th>Error frecuente</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Situación</strong>
                  </td>
                  <td>El contexto: dónde, cuándo, qué pasaba</td>
                  <td>~15%</td>
                  <td>Extenderse demasiado en el decorado</td>
                </tr>
                <tr>
                  <td>
                    <strong>Tarea</strong>
                  </td>
                  <td>Tu responsabilidad o el reto concreto</td>
                  <td>~15%</td>
                  <td>Confundirla con la acción</td>
                </tr>
                <tr>
                  <td>
                    <strong>Acción</strong>
                  </td>
                  <td>Qué hiciste tú, paso a paso</td>
                  <td>~50%</td>
                  <td>Hablar en «nosotros» y diluir tu papel</td>
                </tr>
                <tr>
                  <td>
                    <strong>Resultado</strong>
                  </td>
                  <td>Qué conseguiste y qué aprendiste</td>
                  <td>~20%</td>
                  <td>No cuantificar ni cerrar la historia</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 2. Casos de Uso */}
          <h3 className={styles.eduH3}>
            <span aria-hidden="true">💼</span> ¿Para quién es útil?
          </h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  🎓
                </span>
                <h4>Primer empleo o prácticas</h4>
              </div>
              <p className={styles.escenarioTip}>
                Aún sin experiencia laboral, puedes construir historias STAR a partir de proyectos de
                estudios, voluntariado, deporte de equipo o trabajos de fin de curso. Lo que se evalúa
                es el comportamiento, no el cargo.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  🔄
                </span>
                <h4>Cambio de sector</h4>
              </div>
              <p className={styles.escenarioTip}>
                Si cambias de área, las competencias transversales (liderazgo, comunicación,
                adaptación) son tu mejor argumento. STAR te ayuda a traducir tu experiencia previa al
                lenguaje del nuevo puesto.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  📈
                </span>
                <h4>Promoción interna</h4>
              </div>
              <p className={styles.escenarioTip}>
                Para optar a un puesto de mayor responsabilidad, prepara historias que demuestren
                competencias del nivel superior: toma de decisiones, gestión de conflictos y
                orientación a resultados con impacto medible.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  🌐
                </span>
                <h4>Procesos por vídeo o con IA</h4>
              </div>
              <p className={styles.escenarioTip}>
                En entrevistas grabadas o con preguntas automáticas, la estructura STAR es aún más
                valiosa: te obliga a ser concreto y a no divagar cuando no tienes a nadie reaccionando
                delante.
              </p>
            </div>
          </div>

          {/* 3. FAQ */}
          <h3 className={styles.eduH3}>
            <span aria-hidden="true">❓</span> Preguntas frecuentes
          </h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Cuántas historias debo preparar?</h4>
              <p>
                Entre 8 y 10 historias bien trabajadas suelen bastar. La clave es que sean variadas y
                cubran competencias distintas, porque una misma historia puede servir para varias
                preguntas. Es mejor tener 8 sólidas que 20 a medias.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Consejo:</strong> usa el mapa de cobertura
                de esta herramienta para detectar qué competencias te faltan.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Es obligatorio incluir la «Tarea»?</h4>
              <p>
                No siempre. A veces la situación y la tarea se solapan y puedes fusionarlas. Lo
                imprescindible es que quede claro cuál era el reto y qué se esperaba de ti antes de
                contar lo que hiciste.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puedo usar ejemplos que no salieron bien?</h4>
              <p>
                Sí, y de hecho es muy recomendable para preguntas sobre fracaso o aprendizaje. En esos
                casos el «Resultado» se centra en qué aprendiste y qué cambiaste después. Lo que se
                valora es la honestidad y la capacidad de reflexión, no la perfección.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Debo memorizar las respuestas palabra por palabra?</h4>
              <p>
                No. Memorizar al pie de la letra suena artificial y se nota. Es mejor interiorizar la
                estructura y los datos clave (cifras, nombre del reto, resultado) para poder contarla
                con naturalidad y adaptarla a la pregunta concreta.
              </p>
              <p className={styles.faqTip}>
                <span aria-hidden="true">💡</span> <strong>Consejo:</strong> ensaya en voz alta y
                cronométrate: cada historia debería durar entre 1,5 y 2 minutos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay con Europass u otras herramientas?</h4>
              <p>
                Muchas herramientas evalúan tu nivel de competencias con un cuestionario. Esta, en
                cambio, no te puntúa: te ayuda a <em>preparar y ensayar</em> las historias que
                contarás en la entrevista. Es una herramienta de práctica, no un test.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Y si me quedo en blanco durante la entrevista?</h4>
              <p>
                Tener el banco preparado reduce mucho ese riesgo. Si aun así te bloqueas, pide unos
                segundos («déjame pensar un ejemplo») —es perfectamente aceptable— y recurre a una
                historia que ya tengas ensayada, aunque no encaje al 100%.
              </p>
            </div>
          </div>

          {/* 4. Guía Paso a Paso */}
          <h3 className={styles.eduH3}>
            <span aria-hidden="true">📋</span> Cómo preparar tu entrevista paso a paso
          </h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Analiza la oferta y la empresa</h4>
                <p>
                  Subraya en la descripción del puesto las competencias que se repiten o se destacan.
                  Suelen ser justo las que preguntarán en la entrevista.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Haz inventario de tus experiencias</h4>
                <p>
                  Apunta proyectos, logros y momentos difíciles de tu trayectoria. No filtres todavía:
                  cuantas más materias primas tengas, mejores historias podrás montar.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Convierte cada experiencia en una historia STAR</h4>
                <p>
                  Usa el editor de arriba: elige la competencia, redacta Situación, Tarea, Acción y
                  Resultado, y apóyate en el indicador de completitud para no dejarte piezas.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Cuantifica los resultados</h4>
                <p>
                  Añade cifras siempre que puedas: porcentajes, tiempo ahorrado, personas implicadas,
                  ingresos. Un resultado medible es mucho más convincente que un «salió muy bien».
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Cubre las competencias clave</h4>
                <p>
                  Revisa el mapa de cobertura y asegúrate de tener al menos una historia para cada
                  competencia importante del puesto. Prioriza las que más se repetían en la oferta.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Ensaya en voz alta y cronometra</h4>
                <p>
                  Exporta tu banco, léelo y practica cada respuesta hablando. Ajusta las que se
                  alarguen más de dos minutos o las que suenen memorizadas.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Repasa justo antes de la entrevista</h4>
                <p>
                  Un vistazo rápido a tus títulos y resultados clave el mismo día te dará seguridad. No
                  intentes memorizar más: confía en la estructura que ya has trabajado.
                </p>
              </div>
            </div>
          </div>

          {/* 5. Mejores Prácticas */}
          <h3 className={styles.eduH3}>
            <span aria-hidden="true">✅</span> Buenas prácticas
          </h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🙋
              </span>
              <h4>Habla en primera persona</h4>
              <p>Di «yo hice», no «se hizo» ni «hicimos». El entrevistador evalúa tu papel.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🔢
              </span>
              <h4>Cuantifica el resultado</h4>
              <p>«Reduje el tiempo de respuesta un 30%» convence más que «mejoré el proceso».</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🎯
              </span>
              <h4>Elige historias relevantes</h4>
              <p>Adapta el ejemplo a la competencia y al puesto; no cuentes por contar.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ⏱️
              </span>
              <h4>Controla la duración</h4>
              <p>Entre 1,5 y 2 minutos por respuesta. Ni telegrama ni novela.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                🧠
              </span>
              <h4>Interioriza, no memorices</h4>
              <p>Aprende la estructura y los datos clave; el resto sale con naturalidad.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                💬
              </span>
              <h4>Prepara el cierre</h4>
              <p>Termina siempre con el resultado y, si encaja, con lo que aprendiste.</p>
            </div>
          </div>

          {/* 6. Warning Box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠️
              </span>
              <h3>Errores frecuentes que restan puntos</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>❌ Responder en abstracto:</strong> decir «soy muy organizado» sin un ejemplo
                concreto. La entrevista por competencias exige siempre una situación real.
              </li>
              <li>
                <strong>❌ Diluir tu papel en el «nosotros»:</strong> si todo lo hizo el equipo, el
                entrevistador no sabe qué aportaste tú. Deja claro tu contribución.
              </li>
              <li>
                <strong>❌ Olvidar el resultado:</strong> contar la acción y no cerrar. Sin resultado,
                la historia queda incompleta y pierde fuerza.
              </li>
              <li>
                <strong>❌ Elegir un ejemplo demasiado trivial:</strong> un reto sin dificultad no
                demuestra la competencia. Busca situaciones con verdadero desafío.
              </li>
              <li>
                <strong>❌ Inventar o exagerar:</strong> un buen entrevistador repregunta. Si la
                historia no es real, se derrumba en los detalles.
              </li>
              <li>
                <strong>❌ Extenderte sin control:</strong> respuestas de cinco minutos agotan al
                entrevistador y diluyen el mensaje. Sé concreto.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      {/* Apps relacionadas */}
      <RelatedApps apps={getRelatedApps('preparar-entrevista-competencias')} />

      {/* Tarjeta de compartir */}
      <ShareCard appName="preparar-entrevista-competencias" />

      {/* Footer */}
      <Footer appName="preparar-entrevista-competencias" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Subcomponente: una casilla del método STAR con guía y contador de palabras
// ─────────────────────────────────────────────────────────────────────────
interface StarCampoProps {
  id: string;
  guia: { etiqueta: string; icono: string; ayuda: string; placeholder: string };
  value: string;
  onChange: (v: string) => void;
}

function StarCampo({ id, guia, value, onChange }: StarCampoProps) {
  const palabras = value.trim() ? value.trim().split(/\s+/).length : 0;
  return (
    <div className={styles.campoGrupo}>
      <label className={styles.label} htmlFor={id}>
        <span aria-hidden="true">{guia.icono}</span> {guia.etiqueta}
      </label>
      <p className={styles.ayuda}>{guia.ayuda}</p>
      <textarea
        id={id}
        className={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={guia.placeholder}
        rows={4}
      />
      <span className={styles.contador}>{palabras} palabras</span>
    </div>
  );
}
