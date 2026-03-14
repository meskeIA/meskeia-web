'use client';

import { useState, useCallback } from 'react';
import styles from './HistoriasSociales.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ============================================
// TIPOS
// ============================================
interface Pagina {
  id: string;
  tipo: TipoPagina;
  texto: string;
  emoji: string;
}

type TipoPagina = 'descriptiva' | 'perspectiva' | 'directiva' | 'afirmativa';

// ============================================
// CONSTANTES
// ============================================
const TIPO_PAGINA_INFO: Record<TipoPagina, { label: string; color: string; desc: string; ejemplo: string }> = {
  descriptiva: {
    label: 'Descriptiva',
    color: '#2E86AB',
    desc: 'Explica qué, quién, cuándo y dónde ocurre',
    ejemplo: 'Ej: "Mañana voy al dentista con mamá."',
  },
  perspectiva: {
    label: 'De perspectiva',
    color: '#48A9A6',
    desc: 'Explica cómo se sienten los demás',
    ejemplo: 'Ej: "La dentista quiere ayudarme a tener los dientes sanos."',
  },
  directiva: {
    label: 'Directiva',
    color: '#8E44AD',
    desc: 'Sugiere qué puede hacer la persona',
    ejemplo: 'Ej: "Puedo llevar mi peluche para estar más tranquilo."',
  },
  afirmativa: {
    label: 'Afirmativa',
    color: '#27AE60',
    desc: 'Refuerza un valor o habilidad positiva',
    ejemplo: 'Ej: "Soy valiente. He ido al dentista antes y lo he hecho bien."',
  },
};

const EMOJIS_PAGINA = [
  '😊', '😢', '😰', '😡', '🤗', '🤔', '👍', '❤️',
  '🏫', '🏥', '🚗', '🏠', '👨‍👩‍👧', '👩‍⚕️', '🎒', '🍽️',
  '🛁', '💊', '🌳', '🎉', '📚', '✅', '⭐', '🌈',
];

const HISTORIAS_EJEMPLO = [
  {
    titulo: 'Ir al dentista',
    icono: '🦷',
    paginas: [
      { tipo: 'descriptiva' as TipoPagina, texto: 'Mañana voy al dentista con mamá.', emoji: '🏥' },
      { tipo: 'perspectiva' as TipoPagina, texto: 'La dentista quiere ayudarme a tener los dientes sanos.', emoji: '👩‍⚕️' },
      { tipo: 'descriptiva' as TipoPagina, texto: 'Me sentaré en una silla especial. La dentista mirará mis dientes.', emoji: '😊' },
      { tipo: 'directiva' as TipoPagina, texto: 'Puedo llevar mi peluche para estar más tranquilo.', emoji: '🤗' },
      { tipo: 'afirmativa' as TipoPagina, texto: 'Soy valiente. Cuando termina, me dan un premio.', emoji: '⭐' },
    ],
  },
  {
    titulo: 'Primer día de clase',
    icono: '🎒',
    paginas: [
      { tipo: 'descriptiva' as TipoPagina, texto: 'El lunes empiezo en una clase nueva.', emoji: '🏫' },
      { tipo: 'descriptiva' as TipoPagina, texto: 'Habrá otros niños y una maestra que se llama señorita Ana.', emoji: '👩‍🏫' },
      { tipo: 'perspectiva' as TipoPagina, texto: 'La señorita Ana está feliz de conocerme.', emoji: '😊' },
      { tipo: 'directiva' as TipoPagina, texto: 'Si me siento nervioso, puedo respirar hondo tres veces.', emoji: '🫁' },
      { tipo: 'afirmativa' as TipoPagina, texto: 'Soy capaz de aprender cosas nuevas.', emoji: '⭐' },
    ],
  },
  {
    titulo: 'Cumpleaños con mucha gente',
    icono: '🎉',
    paginas: [
      { tipo: 'descriptiva' as TipoPagina, texto: 'El sábado voy a un cumpleaños. Habrá mucha gente y ruido.', emoji: '🎉' },
      { tipo: 'perspectiva' as TipoPagina, texto: 'A los demás niños les gusta jugar y celebrar.', emoji: '😊' },
      { tipo: 'directiva' as TipoPagina, texto: 'Si necesito descansar, puedo ir a un sitio tranquilo.', emoji: '🤫' },
      { tipo: 'afirmativa' as TipoPagina, texto: 'Es normal necesitar un descanso. Lo haré bien.', emoji: '👍' },
    ],
  },
];

const STORAGE_KEY = 'meskeia_historias_v1';

interface Historia {
  id: string;
  titulo: string;
  icono: string;
  paginas: Pagina[];
}

function cargarHistorias(): Historia[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function guardarHistorias(historias: Historia[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(historias));
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
export default function HistoriasSocialesPage() {
  const [vista, setVista] = useState<'lista' | 'leer' | 'crear' | 'ejemplo'>('lista');
  const [historias, setHistorias] = useState<Historia[]>(cargarHistorias);
  const [historiaActiva, setHistoriaActiva] = useState<Historia | null>(null);
  const [paginaActual, setPaginaActual] = useState(0);

  // Estado del formulario de creación
  const [formTitulo, setFormTitulo] = useState('');
  const [formIcono, setFormIcono] = useState('📖');
  const [formPaginas, setFormPaginas] = useState<Pagina[]>([
    { id: Date.now().toString(), tipo: 'descriptiva', texto: '', emoji: '😊' },
  ]);

  // ——————————————————————————————————————
  // Acciones de historial
  // ——————————————————————————————————————
  const guardar = useCallback((historia: Historia) => {
    setHistorias(prev => {
      const idx = prev.findIndex(h => h.id === historia.id);
      const updated = idx >= 0
        ? prev.map(h => h.id === historia.id ? historia : h)
        : [...prev, historia];
      guardarHistorias(updated);
      return updated;
    });
  }, []);

  const eliminar = useCallback((id: string) => {
    setHistorias(prev => {
      const updated = prev.filter(h => h.id !== id);
      guardarHistorias(updated);
      return updated;
    });
  }, []);

  // ——————————————————————————————————————
  // Formulario: páginas
  // ——————————————————————————————————————
  const addPagina = () => {
    setFormPaginas(prev => [
      ...prev,
      { id: Date.now().toString(), tipo: 'descriptiva', texto: '', emoji: '😊' },
    ]);
  };

  const removePagina = (id: string) => {
    if (formPaginas.length <= 1) return;
    setFormPaginas(prev => prev.filter(p => p.id !== id));
  };

  const updatePagina = (id: string, field: keyof Pagina, value: string) => {
    setFormPaginas(prev =>
      prev.map(p => p.id === id ? { ...p, [field]: value } : p)
    );
  };

  const guardarHistoria = () => {
    if (!formTitulo.trim() || formPaginas.every(p => !p.texto.trim())) return;
    const nueva: Historia = {
      id: Date.now().toString(),
      titulo: formTitulo.trim(),
      icono: formIcono,
      paginas: formPaginas.filter(p => p.texto.trim()),
    };
    guardar(nueva);
    setFormTitulo('');
    setFormIcono('📖');
    setFormPaginas([{ id: Date.now().toString(), tipo: 'descriptiva', texto: '', emoji: '😊' }]);
    setVista('lista');
  };

  const abrirLeer = (historia: Historia) => {
    setHistoriaActiva(historia);
    setPaginaActual(0);
    setVista('leer');
  };

  const abrirEjemplo = (idx: number) => {
    const ej = HISTORIAS_EJEMPLO[idx];
    const historia: Historia = {
      id: `ejemplo-${idx}`,
      titulo: ej.titulo,
      icono: ej.icono,
      paginas: ej.paginas.map((p, i) => ({ ...p, id: `ej-${idx}-${i}` })),
    };
    setHistoriaActiva(historia);
    setPaginaActual(0);
    setVista('leer');
  };

  // ——————————————————————————————————————
  // VISTA: LEER HISTORIA
  // ——————————————————————————————————————
  if (vista === 'leer' && historiaActiva) {
    const pagina = historiaActiva.paginas[paginaActual];
    const tipInfo = TIPO_PAGINA_INFO[pagina.tipo];
    const esUltima = paginaActual === historiaActiva.paginas.length - 1;
    const esPrimera = paginaActual === 0;

    return (
      <div className={styles.container}>
        <MeskeiaLogo />

        <div className={styles.lectorHeader}>
          <button onClick={() => setVista('lista')} className={styles.btnVolver} aria-label="Volver a la lista">
            ← Volver
          </button>
          <h1 className={styles.lectorTitulo}>
            {historiaActiva.icono} {historiaActiva.titulo}
          </h1>
          <span className={styles.lectorPagNum}>{paginaActual + 1}/{historiaActiva.paginas.length}</span>
        </div>

        {/* Barra de progreso */}
        <div className={styles.lectorProgreso}>
          {historiaActiva.paginas.map((_, i) => (
            <button
              key={i}
              className={`${styles.lectorDot} ${i === paginaActual ? styles.lectorDotActivo : ''} ${i < paginaActual ? styles.lectorDotVisto : ''}`}
              onClick={() => setPaginaActual(i)}
              aria-label={`Ir a página ${i + 1}`}
            />
          ))}
        </div>

        {/* Tarjeta de página */}
        <div
          className={styles.paginaCard}
          style={{ borderColor: tipInfo.color } as React.CSSProperties}
        >
          <span className={styles.paginaEmoji} role="img" aria-hidden="true">{pagina.emoji}</span>
          <p className={styles.paginaTexto}>{pagina.texto}</p>
          <span
            className={styles.paginaTipo}
            style={{ color: tipInfo.color, borderColor: tipInfo.color } as React.CSSProperties}
          >
            {tipInfo.label}
          </span>
        </div>

        {/* Navegación */}
        <div className={styles.lectorNav}>
          <button
            onClick={() => setPaginaActual(p => p - 1)}
            disabled={esPrimera}
            className={styles.btnNavPag}
            aria-label="Página anterior"
          >
            ← Anterior
          </button>
          {esUltima ? (
            <button
              onClick={() => setVista('lista')}
              className={styles.btnFinHistoria}
            >
              ✅ ¡Fin de la historia!
            </button>
          ) : (
            <button
              onClick={() => setPaginaActual(p => p + 1)}
              className={styles.btnNavPagNext}
              aria-label="Siguiente página"
            >
              Siguiente →
            </button>
          )}
        </div>

        <Footer appName="historias-sociales" />
      </div>
    );
  }

  // ——————————————————————————————————————
  // VISTA: CREAR HISTORIA
  // ——————————————————————————————————————
  if (vista === 'crear') {
    return (
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>✏️ Nueva historia social</h1>
          <p className={styles.subtitle}>Crea una historia visual para preparar una situación</p>
        </header>

        <div className={styles.formCard}>
          {/* Título */}
          <div className={styles.formGrupo}>
            <label className={styles.formLabel} htmlFor="hist-titulo">Título de la historia</label>
            <input
              id="hist-titulo"
              type="text"
              value={formTitulo}
              onChange={e => setFormTitulo(e.target.value)}
              placeholder="Ej: Ir al médico, Primer día de cole..."
              className={styles.formInput}
              autoComplete="off"
            />
          </div>

          {/* Icono */}
          <div className={styles.formGrupo}>
            <span className={styles.formLabel}>Icono de la historia</span>
            <div className={styles.emojiSelector}>
              {EMOJIS_PAGINA.map(e => (
                <button
                  key={e}
                  type="button"
                  className={`${styles.emojiBtn} ${formIcono === e ? styles.emojiBtnActivo : ''}`}
                  onClick={() => setFormIcono(e)}
                  aria-pressed={formIcono === e}
                  aria-label={`Icono ${e}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Páginas */}
          <div className={styles.formGrupo}>
            <span className={styles.formLabel}>Páginas de la historia ({formPaginas.length})</span>
            <div className={styles.paginasLista}>
              {formPaginas.map((pag, idx) => {
                const tipInfo = TIPO_PAGINA_INFO[pag.tipo];
                return (
                  <div
                    key={pag.id}
                    className={styles.paginaEditor}
                    style={{ borderLeftColor: tipInfo.color } as React.CSSProperties}
                  >
                    <div className={styles.paginaEditorHeader}>
                      <span className={styles.paginaEditorNum}>Página {idx + 1}</span>
                      {formPaginas.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePagina(pag.id)}
                          className={styles.btnRemovePag}
                          aria-label={`Eliminar página ${idx + 1}`}
                        >
                          🗑️
                        </button>
                      )}
                    </div>

                    {/* Tipo */}
                    <div className={styles.tiposGrid}>
                      {(Object.keys(TIPO_PAGINA_INFO) as TipoPagina[]).map(tipo => (
                        <button
                          key={tipo}
                          type="button"
                          className={`${styles.tipoBtn} ${pag.tipo === tipo ? styles.tipoBtnActivo : ''}`}
                          style={pag.tipo === tipo ? { borderColor: TIPO_PAGINA_INFO[tipo].color, color: TIPO_PAGINA_INFO[tipo].color } as React.CSSProperties : undefined}
                          onClick={() => updatePagina(pag.id, 'tipo', tipo)}
                          aria-pressed={pag.tipo === tipo}
                        >
                          {TIPO_PAGINA_INFO[tipo].label}
                        </button>
                      ))}
                    </div>
                    <p className={styles.tipoDesc}>{tipInfo.desc} — <em>{tipInfo.ejemplo}</em></p>

                    {/* Emoji */}
                    <div className={styles.paginaEmojiRow}>
                      <span className={styles.formLabel}>Pictograma:</span>
                      <div className={styles.emojiSelectorSmall}>
                        {EMOJIS_PAGINA.slice(0, 12).map(e => (
                          <button
                            key={e}
                            type="button"
                            className={`${styles.emojiBtnSmall} ${pag.emoji === e ? styles.emojiBtnActivo : ''}`}
                            onClick={() => updatePagina(pag.id, 'emoji', e)}
                            aria-pressed={pag.emoji === e}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Texto */}
                    <textarea
                      value={pag.texto}
                      onChange={e => updatePagina(pag.id, 'texto', e.target.value)}
                      placeholder={tipInfo.ejemplo.replace('Ej: ', '')}
                      className={styles.paginaTextarea}
                      rows={3}
                      aria-label={`Texto de página ${idx + 1}`}
                    />
                  </div>
                );
              })}
            </div>

            <button type="button" onClick={addPagina} className={styles.btnAddPag}>
              + Añadir página
            </button>
          </div>

          <div className={styles.formAcciones}>
            <button type="button" onClick={() => setVista('lista')} className={styles.btnSecondary}>
              Cancelar
            </button>
            <button
              type="button"
              onClick={guardarHistoria}
              className={styles.btnPrimary}
              disabled={!formTitulo.trim() || formPaginas.every(p => !p.texto.trim())}
            >
              Guardar historia
            </button>
          </div>
        </div>

        <Footer appName="historias-sociales" />
      </div>
    );
  }

  // ——————————————————————————————————————
  // VISTA: LISTA (principal)
  // ——————————————————————————————————————
  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📖 Historias Sociales Visuales</h1>
        <p className={styles.subtitle}>
          Crea y lee historias visuales para preparar situaciones nuevas o difíciles
        </p>
      </header>

      <LegalNotice />

      {/* Historias de ejemplo */}
      <section className={styles.seccion}>
        <h2 className={styles.seccionTitulo}>📚 Ejemplos listos para usar</h2>
        <div className={styles.ejemplosGrid}>
          {HISTORIAS_EJEMPLO.map((ej, idx) => (
            <button
              key={idx}
              className={styles.ejemploCard}
              onClick={() => abrirEjemplo(idx)}
            >
              <span className={styles.ejemploIcono}>{ej.icono}</span>
              <span className={styles.ejemploTitulo}>{ej.titulo}</span>
              <span className={styles.ejemploPags}>{ej.paginas.length} páginas</span>
            </button>
          ))}
        </div>
      </section>

      {/* Historias creadas */}
      <section className={styles.seccion}>
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>🗂️ Mis historias ({historias.length})</h2>
          <button onClick={() => setVista('crear')} className={styles.btnPrimary}>
            + Crear historia
          </button>
        </div>

        {historias.length === 0 && (
          <div className={styles.vacio}>
            <span className={styles.vacioEmoji}>📖</span>
            <p>Aún no has creado ninguna historia</p>
            <button onClick={() => setVista('crear')} className={styles.btnPrimary}>
              Crear mi primera historia
            </button>
          </div>
        )}

        <div className={styles.historiasGrid}>
          {historias.map(hist => (
            <div key={hist.id} className={styles.historiaCard}>
              <button className={styles.historiaCardBtn} onClick={() => abrirLeer(hist)}>
                <span className={styles.historiaIcono}>{hist.icono}</span>
                <span className={styles.historiaTitulo}>{hist.titulo}</span>
                <span className={styles.historiaPags}>{hist.paginas.length} páginas</span>
              </button>
              <button
                className={styles.btnEliminar}
                onClick={() => eliminar(hist.id)}
                aria-label={`Eliminar historia ${hist.titulo}`}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Aviso importante */}
      <div className={styles.avisoBox}>
        <h3>⚠️ Aviso importante</h3>
        <p>Las historias sociales son una herramienta de <strong>apoyo y preparación</strong>, no un tratamiento terapéutico. Para niños con autismo u otras necesidades especiales, combína con la orientación de un <strong>profesional especializado</strong> (logopeda, psicólogo o terapeuta).</p>
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="📚 Guía sobre historias sociales"
        subtitle="Qué son, cómo funcionan y cómo crearlas"
      >
        {/* 1. Tabla comparativa */}
        <section className={styles.guiaSeccion}>
          <h2>Comparativa: métodos para preparar situaciones nuevas</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Método</th>
                  <th>Visual</th>
                  <th>Personalizable</th>
                  <th>Sin registro</th>
                  <th>Ideal para</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={styles.celdaDestacada}>meskeIA Historias Sociales</td>
                  <td>✅ Emoji + texto</td>
                  <td>✅ Totalmente</td>
                  <td>✅ Sí</td>
                  <td>Autismo, TDAH, discapacidad cognitiva</td>
                </tr>
                <tr>
                  <td>Explicación verbal</td>
                  <td>❌ No</td>
                  <td>✅ Sí</td>
                  <td>✅ Sí</td>
                  <td>Personas sin NEE o con comprensión verbal alta</td>
                </tr>
                <tr>
                  <td>Libros ilustrados</td>
                  <td>✅ Alta</td>
                  <td>❌ No</td>
                  <td>✅ Sí</td>
                  <td>Situaciones genéricas muy comunes</td>
                </tr>
                <tr>
                  <td>Role-play sin guión</td>
                  <td>✅ Sí</td>
                  <td>✅ Sí</td>
                  <td>✅ Sí</td>
                  <td>Necesita habilidades de generalización previas</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Casos de uso */}
        <section className={styles.guiaSeccion}>
          <h2>¿Quién se beneficia y en qué situaciones?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcono}>🧩</div>
              <h3>Niño con autismo</h3>
              <p>Preparar visitas médicas, cambios de rutina, celebraciones familiares o cualquier situación nueva que genere incertidumbre y ansiedad anticipatoria.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcono}>⚡</div>
              <h3>Adolescente con TDAH</h3>
              <p>Ensayar situaciones sociales complejas como entrevistas, conflictos con compañeros o nuevas responsabilidades escolares que requieran planificación.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcono}>🏫</div>
              <h3>Aula de educación especial</h3>
              <p>El docente crea historias específicas para el grupo antes de excursiones, actos escolares o cambios de horario. Todos saben qué va a pasar.</p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioIcono}>👨‍👩‍👧</div>
              <h3>Familia en casa</h3>
              <p>Los padres crean historias antes de viajes, mudanzas, nacimiento de un hermano o cualquier evento significativo que altere la rutina familiar.</p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section className={styles.guiaSeccion}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Qué son las historias sociales (Social Stories™)?</dt>
              <dd>Son un método desarrollado por Carol Gray en 1991 para ayudar a personas con autismo a entender situaciones sociales. Usan frases cortas, específicas y positivas para describir qué ocurre, por qué y qué puede hacer la persona.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cuántas páginas debe tener una historia?</dt>
              <dd>Lo recomendado es entre 3 y 10 páginas. Demasiadas páginas pueden perder la atención; pocas pueden no dar el contexto suficiente. 5-7 es un buen punto de partida.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Cuándo leer la historia con el niño?</dt>
              <dd>Leerla 1-3 días antes del evento, y repasar el día antes. No la des el mismo día que ocurre el evento —la preparación requiere tiempo de procesamiento.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué diferencia hay entre páginas descriptivas y directivas?</dt>
              <dd>Las descriptivas explican qué pasará ("Habrá mucha gente"). Las directivas sugieren qué puede hacer la persona ("Puedo pedir ayuda si me agobio"). La proporción recomendada de Carol Gray es 2-5 descriptivas por 1 directiva.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Se guardan las historias en la nube?</dt>
              <dd>No. Toda la información se guarda solo en tu dispositivo (localStorage del navegador). meskeIA no tiene acceso a ningún contenido de las historias.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Puedo imprimir la historia para leerla en papel?</dt>
              <dd>Actualmente puedes usar la función de impresión del navegador (Ctrl+P) en la vista de lectura. Cada página se muestra de forma clara y legible para imprimir.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Es adecuado para adultos?</dt>
              <dd>Sí. Las historias sociales son útiles para cualquier persona que se beneficie de anticipar situaciones, independientemente de la edad: adultos con autismo, con discapacidad intelectual o en situaciones de alta ansiedad.</dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Puede sustituir a la terapia con un especialista?</dt>
              <dd>No. Es una herramienta de apoyo y preparación. Para personas con NEE, su uso debe complementarse con orientación de un logopeda, psicólogo o terapeuta especializado en autismo u otras condiciones.</dd>
            </div>
          </dl>
        </section>

        {/* 4. Guía paso a paso */}
        <section className={styles.guiaSeccion}>
          <h2>Cómo crear una historia social efectiva en 7 pasos</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div>
                <strong>Identifica la situación que genera dificultad</strong>
                <p>Elige una situación concreta y específica que cause ansiedad, confusión o mal comportamiento. No intentes abarcar varias situaciones en una sola historia.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div>
                <strong>Reúne información sobre el evento real</strong>
                <p>Investiga todos los detalles: ¿quién estará?, ¿qué pasará exactamente?, ¿qué ruidos o estímulos habrá?, ¿cuánto tiempo durará? Cuanta más precisión, mejor.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div>
                <strong>Escribe desde la perspectiva del lector</strong>
                <p>Usa la primera persona ("voy", "puedo", "me siento") para que la persona se identifique con la historia. Evita el "debes" o "tienes que".</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div>
                <strong>Usa frases cortas y positivas</strong>
                <p>Cada frase debe ser comprensible. Evita negaciones ("no debes gritar") y usa afirmaciones alternativas ("puedo hablar en voz baja"). El lenguaje literal es más efectivo.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div>
                <strong>Incluye las 4 tipos de páginas</strong>
                <p>Mezcla páginas descriptivas (qué pasa), de perspectiva (cómo se sienten los demás), directivas (qué puedo hacer) y afirmativas (refuerzo positivo).</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div>
                <strong>Lee juntos antes del evento</strong>
                <p>Presenta la historia 1-3 días antes y repásala el día anterior. Léela juntos varias veces. Permite que la persona la lea sola si está preparada.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>7</span>
              <div>
                <strong>Evalúa y ajusta</strong>
                <p>Después del evento, observa si hubo mejora. Si no, ajusta el lenguaje, añade más detalle o cambia el pictograma por uno más representativo.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* 5. Mejores prácticas */}
        <section className={styles.guiaSeccion}>
          <h2>Mejores prácticas para familias y educadores</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <div className={styles.tipIcono}>🎯</div>
              <h3>Una situación, una historia</h3>
              <p>No mezcles situaciones distintas en la misma historia. La especificidad es clave para que el cerebro pueda anticipar correctamente.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcono}>🔄</div>
              <h3>Revisa las historias periódicamente</h3>
              <p>Los detalles cambian: el médico puede cambiar, la ruta puede ser diferente. Actualiza la historia si algo importante cambia.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcono}>🎨</div>
              <h3>Elige emojis reconocibles</h3>
              <p>Usa los pictogramas que la persona ya conoce y asocia a cada concepto. La familiaridad del símbolo refuerza la comprensión.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcono}>📱</div>
              <h3>Acceso fácil en el momento</h3>
              <p>Añade la página al escritorio del móvil. Tener la historia accesible in-situ (mientras esperas en la sala de espera, por ejemplo) puede ser muy útil.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcono}>👏</div>
              <h3>Termina siempre en positivo</h3>
              <p>La última página debe ser afirmativa: un elogio, un logro esperado o un recordatorio de capacidad. Esto refuerza la confianza y la motivación.</p>
            </div>
            <div className={styles.tipCard}>
              <div className={styles.tipIcono}>🤝</div>
              <h3>Involucra a la persona en la creación</h3>
              <p>Si es posible, crea la historia con la persona, no solo para ella. Elegir el emoji o dictar la frase aumenta el sentido de autoría y la eficacia.</p>
            </div>
          </div>
        </section>

        {/* 6. Warning box */}
        <section className={styles.guiaSeccion}>
          <div className={styles.warningBox}>
            <h3>⚠️ Precauciones importantes</h3>
            <ul>
              <li><strong>No usar como única estrategia</strong>: Las historias sociales son más efectivas combinadas con otras intervenciones (modelado, role-play, apoyo en el momento). No sustituyen la terapia especializada.</li>
              <li><strong>No forzar la lectura</strong>: Si la persona se niega a leer la historia, no la obligues. Intenta otra aproximación (lectura compartida, escuchar mientras juegas) o trabaja con un especialista.</li>
              <li><strong>No crear historias en el momento del conflicto</strong>: El cerebro no está en condiciones de aprender durante una crisis. Crea las historias en momentos de calma, para situaciones futuras.</li>
              <li><strong>No generalizar sin verificar</strong>: Una historia efectiva para una situación no garantiza la generalización a situaciones similares. Cada contexto puede necesitar su propia historia.</li>
              <li><strong>Privacidad del contenido</strong>: Las historias pueden contener información personal. Recuerda que se guardan solo en tu dispositivo. No compartas el enlace a la app si tienes abierta información sensible.</li>
              <li><strong>Para diagnósticos complejos, consulta siempre</strong>: Si la persona tiene múltiples diagnósticos o un nivel de soporte alto, el diseño de historias sociales debe realizarse con orientación de un profesional especializado.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('historias-sociales')} />
      <ShareCard appName="historias-sociales" />
      <Footer appName="historias-sociales" />
    </div>
  );
}
