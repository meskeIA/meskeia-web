'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './ConstructorPrompts.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type Paso = 1 | 2 | 3 | 4 | 5 | 6;

interface Selecciones {
  modelo: string;
  objetivo: string;
  usarRol: boolean;
  rol: string;
  rolPersonalizado: string;
  contexto: string;
  formato: string;
  tono: string;
  longitud: string;
  evitar: string;
  incluir: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const MODELOS = [
  { id: 'chatgpt', icono: '🤖', nombre: 'ChatGPT', empresa: 'OpenAI' },
  { id: 'claude', icono: '🧠', nombre: 'Claude', empresa: 'Anthropic' },
  { id: 'gemini', icono: '✨', nombre: 'Gemini', empresa: 'Google' },
  { id: 'copilot', icono: '🪟', nombre: 'Copilot', empresa: 'Microsoft' },
  { id: 'mistral', icono: '🌊', nombre: 'Mistral', empresa: 'Mistral AI' },
  { id: 'cualquiera', icono: '🌐', nombre: 'Cualquier IA', empresa: 'Universal' },
];

const OBJETIVOS = [
  { id: 'redaccion', icono: '✍️', nombre: 'Redacción y texto', ejemplo: 'emails, artículos, resúmenes' },
  { id: 'codigo', icono: '💻', nombre: 'Código y programación', ejemplo: 'escribir, depurar, explicar' },
  { id: 'analisis', icono: '📊', nombre: 'Análisis de documentos', ejemplo: 'contratos, informes, PDFs' },
  { id: 'busqueda', icono: '🔍', nombre: 'Investigación y búsqueda', ejemplo: 'comparativas, datos, fuentes' },
  { id: 'creatividad', icono: '🎨', nombre: 'Creatividad', ejemplo: 'ideas, guiones, historias' },
  { id: 'ensenanza', icono: '📚', nombre: 'Enseñanza y explicación', ejemplo: 'simplificar conceptos, tutoriales' },
  { id: 'extraccion', icono: '🗂️', nombre: 'Extracción de datos', ejemplo: 'estructurar info, listas, tablas' },
  { id: 'traduccion', icono: '🌍', nombre: 'Traducción y adaptación', ejemplo: 'idiomas, registros, formatos' },
];

const ROLES = [
  { id: 'redactor', nombre: 'Redactor experto', descripcion: 'Especialista en comunicación escrita' },
  { id: 'programador', nombre: 'Programador senior', descripcion: 'Desarrollador con experiencia en múltiples lenguajes' },
  { id: 'profesor', nombre: 'Profesor paciente', descripcion: 'Explica conceptos de forma clara y progresiva' },
  { id: 'analista', nombre: 'Analista de datos', descripcion: 'Extrae conclusiones y patrones de información' },
  { id: 'abogado', nombre: 'Asesor jurídico', descripcion: 'Revisa documentos con criterio legal (sin consejo vinculante)' },
  { id: 'consultor', nombre: 'Consultor de marketing', descripcion: 'Estrategia de contenido y comunicación comercial' },
  { id: 'coach', nombre: 'Coach de productividad', descripcion: 'Ayuda a organizar tareas y prioridades' },
  { id: 'investigador', nombre: 'Investigador crítico', descripcion: 'Contrasta fuentes y detecta sesgos' },
  { id: 'personalizado', nombre: 'Rol personalizado…', descripcion: 'Define tú mismo el rol que debe asumir la IA' },
];

const FORMATOS = [
  { id: 'parrafo', icono: '📝', nombre: 'Texto libre', descripcion: 'Respuesta en prosa natural' },
  { id: 'lista-numerada', icono: '🔢', nombre: 'Lista numerada', descripcion: 'Pasos o puntos en orden' },
  { id: 'lista-bullets', icono: '•', nombre: 'Lista con viñetas', descripcion: 'Puntos sin orden específico' },
  { id: 'tabla', icono: '📋', nombre: 'Tabla', descripcion: 'Comparativa en filas y columnas' },
  { id: 'email', icono: '📧', nombre: 'Email', descripcion: 'Asunto + cuerpo estructurado' },
  { id: 'codigo', icono: '💾', nombre: 'Código / JSON', descripcion: 'Bloque de código o datos estructurados' },
  { id: 'paso-a-paso', icono: '🪜', nombre: 'Paso a paso', descripcion: 'Instrucciones secuenciales detalladas' },
  { id: 'resumen', icono: '⚡', nombre: 'Respuesta concisa', descripcion: 'Máximo 3-4 frases, sin relleno' },
];

const TONOS = [
  { id: 'formal', nombre: 'Formal', descripcion: 'Profesional y riguroso' },
  { id: 'neutro', nombre: 'Neutral', descripcion: 'Equilibrado, sin excesos' },
  { id: 'informal', nombre: 'Informal', descripcion: 'Cercano y conversacional' },
  { id: 'tecnico', nombre: 'Técnico', descripcion: 'Especializado, con terminología precisa' },
  { id: 'divulgativo', nombre: 'Divulgativo', descripcion: 'Claro y accesible para no expertos' },
];

const LONGITUDES = [
  { id: 'corta', nombre: 'Corta', descripcion: 'Menos de 100 palabras' },
  { id: 'media', nombre: 'Media', descripcion: 'Entre 100 y 300 palabras' },
  { id: 'detallada', nombre: 'Detallada', descripcion: 'Más de 300 palabras, exhaustiva' },
];

const PASOS_LABELS: Record<Paso, string> = {
  1: 'Modelo',
  2: 'Objetivo',
  3: 'Rol',
  4: 'Formato',
  5: 'Ajustes',
  6: 'Resultado',
};

const ESTADO_INICIAL: Selecciones = {
  modelo: '',
  objetivo: '',
  usarRol: false,
  rol: '',
  rolPersonalizado: '',
  contexto: '',
  formato: '',
  tono: 'neutro',
  longitud: 'media',
  evitar: '',
  incluir: '',
};

// ─────────────────────────────────────────────
// Generador de prompt
// ─────────────────────────────────────────────

function generarPrompt(s: Selecciones): string {
  const lineas: string[] = [];

  const modeloObj = MODELOS.find((m) => m.id === s.modelo);
  const objetivoObj = OBJETIVOS.find((o) => o.id === s.objetivo);
  const formatoObj = FORMATOS.find((f) => f.id === s.formato);
  const tonoObj = TONOS.find((t) => t.id === s.tono);
  const longitudObj = LONGITUDES.find((l) => l.id === s.longitud);

  // Línea 1: Rol
  if (s.usarRol) {
    const rolNombre = s.rol === 'personalizado' && s.rolPersonalizado
      ? s.rolPersonalizado
      : ROLES.find((r) => r.id === s.rol)?.nombre ?? '';
    if (rolNombre) {
      lineas.push(`Actúa como ${rolNombre.toLowerCase()}.`);
    }
  }

  // Línea 2: Contexto
  if (s.contexto.trim()) {
    lineas.push(`Contexto: ${s.contexto.trim()}`);
  }

  // Línea 3: Tarea
  const tareaBase = objetivoObj ? `Tu tarea es [${objetivoObj.nombre.toLowerCase()}: describe aquí exactamente qué necesitas].` : '';
  if (tareaBase) lineas.push(tareaBase);

  // Línea 4: Formato y longitud
  const parteFormato = formatoObj ? `${formatoObj.nombre.toLowerCase()}` : '';
  const parteLongitud = longitudObj ? `Extensión: ${longitudObj.nombre.toLowerCase()} (${longitudObj.descripcion.toLowerCase()}).` : '';
  const parteTono = tonoObj ? `Tono: ${tonoObj.nombre.toLowerCase()}.` : '';
  if (parteFormato || parteLongitud || parteTono) {
    const lineaFormato = [
      parteFormato ? `Formato de la respuesta: ${parteFormato}.` : '',
      parteLongitud,
      parteTono,
    ].filter(Boolean).join(' ');
    lineas.push(lineaFormato);
  }

  // Línea 5: Incluir
  if (s.incluir.trim()) {
    lineas.push(`Asegúrate de incluir: ${s.incluir.trim()}`);
  }

  // Línea 6: Evitar
  if (s.evitar.trim()) {
    lineas.push(`Evita: ${s.evitar.trim()}`);
  }

  // Nota modelo si aplica
  if (modeloObj && modeloObj.id !== 'cualquiera') {
    lineas.push(`[Optimizado para ${modeloObj.nombre}]`);
  }

  return lineas.join('\n\n');
}

function contarCamposRellenos(s: Selecciones): number {
  let n = 0;
  if (s.modelo) n++;
  if (s.objetivo) n++;
  if (s.usarRol && s.rol) n++;
  if (s.contexto.trim()) n++;
  if (s.formato) n++;
  if (s.tono !== 'neutro') n++;
  if (s.longitud !== 'media') n++;
  if (s.incluir.trim()) n++;
  if (s.evitar.trim()) n++;
  return n;
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function ConstructorPrompts() {
  const [paso, setPaso] = useState<Paso>(1);
  const [sel, setSel] = useState<Selecciones>(ESTADO_INICIAL);
  const [copiado, setCopiado] = useState(false);
  const [promptGenerado, setPromptGenerado] = useState('');

  function actualizar<K extends keyof Selecciones>(campo: K, valor: Selecciones[K]) {
    setSel((prev) => ({ ...prev, [campo]: valor }));
  }

  function irAPaso(n: Paso) {
    setPaso(n);
    if (n === 6) {
      setPromptGenerado(generarPrompt(sel));
      setCopiado(false);
    }
  }

  function copiar() {
    navigator.clipboard.writeText(promptGenerado).then(() => {
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    });
  }

  function reiniciar() {
    setSel(ESTADO_INICIAL);
    setPaso(1);
    setPromptGenerado('');
    setCopiado(false);
  }

  const totalCampos = contarCamposRellenos(sel);
  const calidad = totalCampos <= 2 ? 'básico' : totalCampos <= 5 ? 'bueno' : 'excelente';
  const calidadColor = calidad === 'básico' ? '#e57373' : calidad === 'bueno' ? '#ffb300' : '#48A9A6';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Constructor de Prompts Guiado</h1>
        <p className={styles.heroSubtitle}>
          Crea instrucciones efectivas para ChatGPT, Claude, Gemini y más — paso a paso, sin conocimientos previos
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Indicador de pasos */}
        <nav className={styles.pasoNav} aria-label="Progreso del constructor">
          {([1, 2, 3, 4, 5, 6] as Paso[]).map((n) => (
            <button
              key={n}
              type="button"
              className={`${styles.pasoBtn} ${paso === n ? styles.pasoBtnActivo : ''} ${n < paso ? styles.pasoBtnCompletado : ''}`}
              onClick={() => { if (n < paso || n === paso) irAPaso(n); }}
              aria-current={paso === n ? 'step' : undefined}
              aria-label={`Paso ${n}: ${PASOS_LABELS[n]}`}
            >
              <span className={styles.pasoNum}>{n < paso ? '✓' : n}</span>
              <span className={styles.pasoLabel}>{PASOS_LABELS[n]}</span>
            </button>
          ))}
        </nav>

        {/* ─── Paso 1: Modelo ─── */}
        {paso === 1 && (
          <section className={styles.pasoSection} aria-labelledby="paso1-titulo">
            <h2 id="paso1-titulo" className={styles.pasoTitulo}>
              <span className={styles.pasoNumGrande}>1</span>
              ¿Para qué IA vas a usar este prompt?
            </h2>
            <p className={styles.pasoDesc}>El modelo no cambia la estructura, pero sí algunos matices del prompt.</p>
            <div className={styles.opcionesGrid}>
              {MODELOS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`${styles.opcionCard} ${sel.modelo === m.id ? styles.opcionCardActiva : ''}`}
                  onClick={() => actualizar('modelo', m.id)}
                  aria-pressed={sel.modelo === m.id}
                >
                  <span className={styles.opcionIcono} aria-hidden="true">{m.icono}</span>
                  <strong className={styles.opcionNombre}>{m.nombre}</strong>
                  <span className={styles.opcionDesc}>{m.empresa}</span>
                </button>
              ))}
            </div>
            <div className={styles.pasoAcciones}>
              <button
                type="button"
                className={styles.btnSiguiente}
                onClick={() => irAPaso(2)}
                disabled={!sel.modelo}
                aria-disabled={!sel.modelo}
              >
                Siguiente →
              </button>
            </div>
          </section>
        )}

        {/* ─── Paso 2: Objetivo ─── */}
        {paso === 2 && (
          <section className={styles.pasoSection} aria-labelledby="paso2-titulo">
            <h2 id="paso2-titulo" className={styles.pasoTitulo}>
              <span className={styles.pasoNumGrande}>2</span>
              ¿Qué necesitas hacer?
            </h2>
            <p className={styles.pasoDesc}>Elige el tipo de tarea principal.</p>
            <div className={styles.opcionesGrid}>
              {OBJETIVOS.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`${styles.opcionCard} ${sel.objetivo === o.id ? styles.opcionCardActiva : ''}`}
                  onClick={() => actualizar('objetivo', o.id)}
                  aria-pressed={sel.objetivo === o.id}
                >
                  <span className={styles.opcionIcono} aria-hidden="true">{o.icono}</span>
                  <strong className={styles.opcionNombre}>{o.nombre}</strong>
                  <span className={styles.opcionDesc}>{o.ejemplo}</span>
                </button>
              ))}
            </div>
            <div className={styles.pasoAcciones}>
              <button type="button" className={styles.btnAnterior} onClick={() => setPaso(1)}>← Anterior</button>
              <button
                type="button"
                className={styles.btnSiguiente}
                onClick={() => irAPaso(3)}
                disabled={!sel.objetivo}
                aria-disabled={!sel.objetivo}
              >
                Siguiente →
              </button>
            </div>
          </section>
        )}

        {/* ─── Paso 3: Rol ─── */}
        {paso === 3 && (
          <section className={styles.pasoSection} aria-labelledby="paso3-titulo">
            <h2 id="paso3-titulo" className={styles.pasoTitulo}>
              <span className={styles.pasoNumGrande}>3</span>
              ¿Quieres asignarle un rol a la IA?
            </h2>
            <p className={styles.pasoDesc}>
              Dar un rol mejora la especialización de la respuesta. Es opcional pero recomendado para tareas complejas.
            </p>

            <div className={styles.toggleRow}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${sel.usarRol ? styles.toggleBtnActivo : ''}`}
                onClick={() => actualizar('usarRol', true)}
                aria-pressed={sel.usarRol}
              >
                <span aria-hidden="true">✅</span> Sí, asignar rol
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${!sel.usarRol ? styles.toggleBtnActivo : ''}`}
                onClick={() => { actualizar('usarRol', false); actualizar('rol', ''); }}
                aria-pressed={!sel.usarRol}
              >
                <span aria-hidden="true">⏭️</span> Sin rol
              </button>
            </div>

            {sel.usarRol && (
              <>
                <div className={styles.rolesGrid}>
                  {ROLES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      className={`${styles.rolCard} ${sel.rol === r.id ? styles.rolCardActiva : ''}`}
                      onClick={() => actualizar('rol', r.id)}
                      aria-pressed={sel.rol === r.id}
                    >
                      <strong className={styles.rolNombre}>{r.nombre}</strong>
                      <span className={styles.rolDesc}>{r.descripcion}</span>
                    </button>
                  ))}
                </div>

                {sel.rol === 'personalizado' && (
                  <div className={styles.inputGroup}>
                    <label htmlFor="rolPersonalizado" className={styles.inputLabel}>
                      Describe el rol personalizado
                    </label>
                    <input
                      id="rolPersonalizado"
                      type="text"
                      className={styles.inputText}
                      placeholder="Ej: experto en nutrición deportiva, arquitecto de software senior…"
                      value={sel.rolPersonalizado}
                      onChange={(e) => actualizar('rolPersonalizado', e.target.value)}
                      maxLength={120}
                    />
                  </div>
                )}

                <div className={styles.inputGroup}>
                  <label htmlFor="contexto" className={styles.inputLabel}>
                    Contexto adicional <span className={styles.opcional}>(opcional)</span>
                  </label>
                  <textarea
                    id="contexto"
                    className={styles.inputTextarea}
                    placeholder="Ej: Soy autónomo en el sector tecnológico. Tengo que redactar una propuesta para un cliente que no tiene conocimientos técnicos."
                    value={sel.contexto}
                    onChange={(e) => actualizar('contexto', e.target.value)}
                    rows={3}
                    maxLength={400}
                  />
                  <span className={styles.contador}>{sel.contexto.length}/400</span>
                </div>
              </>
            )}

            <div className={styles.pasoAcciones}>
              <button type="button" className={styles.btnAnterior} onClick={() => setPaso(2)}>← Anterior</button>
              <button
                type="button"
                className={styles.btnSiguiente}
                onClick={() => irAPaso(4)}
                disabled={sel.usarRol && !sel.rol}
                aria-disabled={sel.usarRol && !sel.rol}
              >
                Siguiente →
              </button>
            </div>
          </section>
        )}

        {/* ─── Paso 4: Formato ─── */}
        {paso === 4 && (
          <section className={styles.pasoSection} aria-labelledby="paso4-titulo">
            <h2 id="paso4-titulo" className={styles.pasoTitulo}>
              <span className={styles.pasoNumGrande}>4</span>
              ¿Cómo quieres que responda?
            </h2>
            <p className={styles.pasoDesc}>Elige el formato de salida más útil para tu caso.</p>
            <div className={styles.formatosGrid}>
              {FORMATOS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`${styles.formatoCard} ${sel.formato === f.id ? styles.formatoCardActivo : ''}`}
                  onClick={() => actualizar('formato', f.id)}
                  aria-pressed={sel.formato === f.id}
                >
                  <span className={styles.formatoIcono} aria-hidden="true">{f.icono}</span>
                  <strong className={styles.formatoNombre}>{f.nombre}</strong>
                  <span className={styles.formatoDesc}>{f.descripcion}</span>
                </button>
              ))}
            </div>
            <div className={styles.pasoAcciones}>
              <button type="button" className={styles.btnAnterior} onClick={() => setPaso(3)}>← Anterior</button>
              <button
                type="button"
                className={styles.btnSiguiente}
                onClick={() => irAPaso(5)}
                disabled={!sel.formato}
                aria-disabled={!sel.formato}
              >
                Siguiente →
              </button>
            </div>
          </section>
        )}

        {/* ─── Paso 5: Ajustes finales ─── */}
        {paso === 5 && (
          <section className={styles.pasoSection} aria-labelledby="paso5-titulo">
            <h2 id="paso5-titulo" className={styles.pasoTitulo}>
              <span className={styles.pasoNumGrande}>5</span>
              Ajustes finales
            </h2>
            <p className={styles.pasoDesc}>Afina el tono, la longitud y añade restricciones si quieres. Todo es opcional.</p>

            <div className={styles.ajustesGrid}>
              <div className={styles.ajusteGroup}>
                <p className={styles.ajusteTitulo}>Tono de la respuesta</p>
                <div className={styles.ajusteBotones}>
                  {TONOS.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`${styles.ajusteBtn} ${sel.tono === t.id ? styles.ajusteBtnActivo : ''}`}
                      onClick={() => actualizar('tono', t.id)}
                      aria-pressed={sel.tono === t.id}
                      title={t.descripcion}
                    >
                      {t.nombre}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.ajusteGroup}>
                <p className={styles.ajusteTitulo}>Extensión de la respuesta</p>
                <div className={styles.ajusteBotones}>
                  {LONGITUDES.map((l) => (
                    <button
                      key={l.id}
                      type="button"
                      className={`${styles.ajusteBtn} ${sel.longitud === l.id ? styles.ajusteBtnActivo : ''}`}
                      onClick={() => actualizar('longitud', l.id)}
                      aria-pressed={sel.longitud === l.id}
                      title={l.descripcion}
                    >
                      {l.nombre}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="incluir" className={styles.inputLabel}>
                ¿Qué debe incluir la respuesta? <span className={styles.opcional}>(opcional)</span>
              </label>
              <input
                id="incluir"
                type="text"
                className={styles.inputText}
                placeholder="Ej: ejemplos concretos, estadísticas, llamada a la acción al final…"
                value={sel.incluir}
                onChange={(e) => actualizar('incluir', e.target.value)}
                maxLength={200}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="evitar" className={styles.inputLabel}>
                ¿Qué debe evitar? <span className={styles.opcional}>(opcional)</span>
              </label>
              <input
                id="evitar"
                type="text"
                className={styles.inputText}
                placeholder="Ej: tecnicismos, anglicismos, mencionar precios, repetir la pregunta…"
                value={sel.evitar}
                onChange={(e) => actualizar('evitar', e.target.value)}
                maxLength={200}
              />
            </div>

            <div className={styles.pasoAcciones}>
              <button type="button" className={styles.btnAnterior} onClick={() => setPaso(4)}>← Anterior</button>
              <button
                type="button"
                className={styles.btnGenerar}
                onClick={() => irAPaso(6)}
              >
                <span aria-hidden="true">✨</span> Generar prompt
              </button>
            </div>
          </section>
        )}

        {/* ─── Paso 6: Resultado ─── */}
        {paso === 6 && (
          <section className={styles.pasoSection} aria-labelledby="paso6-titulo">
            <h2 id="paso6-titulo" className={styles.pasoTitulo}>
              <span className={styles.pasoNumGrande}>6</span>
              Tu prompt está listo
            </h2>

            <div className={styles.calidadRow} role="status" aria-live="polite">
              <span className={styles.calidadLabel}>Calidad del prompt:</span>
              <span className={styles.calidadBadge} style={{ background: calidadColor }}>
                {calidad === 'básico' && <><span aria-hidden="true">⚠️</span> Básico</>}
                {calidad === 'bueno' && <><span aria-hidden="true">👍</span> Bueno</>}
                {calidad === 'excelente' && <><span aria-hidden="true">⭐</span> Excelente</>}
              </span>
              <span className={styles.calidadInfo}>
                {totalCampos} de 9 dimensiones configuradas
              </span>
            </div>

            <div className={styles.promptBox}>
              <pre className={styles.promptTexto} aria-label="Prompt generado">{promptGenerado}</pre>
            </div>

            <div className={styles.resultadoAcciones}>
              <button
                type="button"
                className={styles.btnCopiar}
                onClick={copiar}
                aria-live="polite"
              >
                {copiado ? <><span aria-hidden="true">✅</span> ¡Copiado!</> : <><span aria-hidden="true">📋</span> Copiar prompt</>}
              </button>
              <button
                type="button"
                className={styles.btnRefinir}
                onClick={() => setPaso(5)}
              >
                <span aria-hidden="true">✏️</span> Refinar
              </button>
              <button
                type="button"
                className={styles.btnNuevo}
                onClick={reiniciar}
              >
                <span aria-hidden="true">🔄</span> Nuevo prompt
              </button>
            </div>

            {calidad === 'básico' && (
              <div className={styles.mejoraTip} role="note">
                <strong><span aria-hidden="true">💡</span> Consejo:</strong> Tu prompt es básico porque tiene pocos detalles. Añade contexto (paso 3), restricciones de lo que debe evitar (paso 5) o especifica qué debe incluir para obtener respuestas mucho más precisas.
              </div>
            )}

            <div className={styles.resumenConfiguracion}>
              <h3 className={styles.resumenTitulo}>Configuración usada</h3>
              <ul className={styles.resumenLista}>
                {sel.modelo && <li><strong>Modelo:</strong> {MODELOS.find((m) => m.id === sel.modelo)?.nombre}</li>}
                {sel.objetivo && <li><strong>Objetivo:</strong> {OBJETIVOS.find((o) => o.id === sel.objetivo)?.nombre}</li>}
                {sel.usarRol && sel.rol && (
                  <li>
                    <strong>Rol:</strong>{' '}
                    {sel.rol === 'personalizado' ? sel.rolPersonalizado : ROLES.find((r) => r.id === sel.rol)?.nombre}
                  </li>
                )}
                {sel.formato && <li><strong>Formato:</strong> {FORMATOS.find((f) => f.id === sel.formato)?.nombre}</li>}
                {sel.tono && <li><strong>Tono:</strong> {TONOS.find((t) => t.id === sel.tono)?.nombre}</li>}
              </ul>
            </div>
          </section>
        )}
      </main>

      {/* Sección educativa */}
      <EducationalSection
        title="Cómo escribir mejores prompts para IA"
        subtitle="Técnicas, estructuras y errores frecuentes"
      >
        <p>
          Un <strong>prompt</strong> es la instrucción que le das a una IA. La diferencia entre una respuesta genérica y una respuesta exactamente útil suele estar en cómo está redactado ese prompt, no en el modelo elegido. El prompt engineering (el arte de escribir buenas instrucciones para IAs) se ha convertido en una habilidad profesional valorada, pero sus principios básicos son accesibles para cualquier persona.
        </p>
        <p>
          La estructura más efectiva sigue el esquema <strong>ROL + CONTEXTO + TAREA + FORMATO + RESTRICCIONES</strong>. No es necesario incluir los cinco elementos en todos los prompts: para tareas simples basta con tarea y formato. Para tareas complejas o que requieren especialización, añadir rol y contexto mejora notablemente la calidad de la respuesta.
        </p>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Comparativa: prompt básico vs. prompt completo
        </h4>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Elemento</th>
                <th>Prompt básico</th>
                <th>Prompt completo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Tarea</td>
                <td>Escribe un email de bienvenida</td>
                <td>Escribe un email de bienvenida para nuevos clientes de una tienda de moda sostenible</td>
              </tr>
              <tr>
                <td>Rol</td>
                <td>—</td>
                <td>Actúa como experto en email marketing con tono cercano</td>
              </tr>
              <tr>
                <td>Formato</td>
                <td>—</td>
                <td>Asunto + 3 párrafos + llamada a la acción. Máximo 150 palabras</td>
              </tr>
              <tr>
                <td>Restricciones</td>
                <td>—</td>
                <td>Evita precio, descuentos y comparaciones con otras marcas</td>
              </tr>
              <tr>
                <td>Resultado típico</td>
                <td>Genérico, reutilizable para cualquier negocio</td>
                <td>Específico, usable directamente con mínima edición</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Perfiles de usuario y sus prompts más frecuentes
        </h4>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <strong>🎓 Estudiante</strong>
            <p>Explicación de conceptos, resúmenes de apuntes, preparación de exámenes con preguntas de práctica.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>💼 Profesional independiente</strong>
            <p>Propuestas comerciales, emails a clientes, análisis de contratos y generación de contenido para redes.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>⚙️ Desarrollador</strong>
            <p>Depuración de código, revisión de arquitectura, documentación técnica y explicación de errores.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>🏢 Equipo empresarial</strong>
            <p>Informes ejecutivos, actas de reuniones, traducciones y adaptación de comunicaciones internas.</p>
          </div>
        </div>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Preguntas frecuentes
        </h4>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Cuánto cambia el resultado según el prompt?</strong>
            <span>Mucho. Equipos de OpenAI y Anthropic documentan mejoras de relevancia del 30-50% entre un prompt vago y uno estructurado. Para tareas complejas la diferencia puede ser aún mayor: una instrucción bien construida puede hacer que un modelo pequeño supere a uno más potente con una instrucción deficiente.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿El rol importa o es solo decorativo?</strong>
            <span>Importa en tareas que requieren perspectiva especializada. Decirle a la IA que actúe como "analista financiero senior" activa patrones lingüísticos y terminología asociados a ese dominio en los datos de entrenamiento. En tareas cotidianas simples el rol añade poco; en análisis complejo puede cambiar sustancialmente la profundidad de la respuesta.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Es mejor un prompt largo o uno corto?</strong>
            <span>Ni uno ni otro: el objetivo es la precisión. Un prompt corto pero específico funciona mejor que uno largo y vago. La clave no es la extensión sino que cada elemento que añades resuelve una ambigüedad real. Añadir contexto solo si es relevante; añadir restricciones solo si la respuesta por defecto los ignora.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Funciona igual en ChatGPT que en Claude o Gemini?</strong>
            <span>La estructura funciona en todos, aunque con matices. Claude es especialmente sensible al contexto explícito. ChatGPT responde bien a ejemplos. Gemini aprovecha mejor las instrucciones de búsqueda y verificación de hechos. El constructor genera prompts compatibles con todos los modelos principales.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es el "prompt injection" y debo preocuparme?</strong>
            <span>El prompt injection ocurre cuando contenido externo (un documento, una web) incluye instrucciones que intentan manipular el comportamiento de la IA. Como usuario final creando prompts propios no es una amenaza relevante. Sí importa si construyes aplicaciones que procesan contenido de terceros con IA.</span>
          </li>
        </ul>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          5 técnicas avanzadas de prompting
        </h4>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Few-shot prompting</strong> — Incluye 1-2 ejemplos del resultado que esperas. La IA aprende el patrón de tus ejemplos y lo aplica a tu caso.
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Chain of thought</strong> — Añade &ldquo;Piensa paso a paso antes de responder&rdquo;. Mejora notablemente los resultados en problemas lógicos, matemáticos y de razonamiento.
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Restricciones negativas</strong> — Especifica qué debe evitar. &ldquo;Sin tecnicismos&rdquo;, &ldquo;sin mencionar precios&rdquo; o &ldquo;sin hacer suposiciones&rdquo; reduce respuestas fuera de lo pedido.
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Iteración guiada</strong> — Trata la primera respuesta como borrador. Pide mejoras específicas: &ldquo;Acorta el tercer párrafo&rdquo;, &ldquo;añade más ejemplos concretos&rdquo;.
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Meta-prompts</strong> — Pide a la IA que reformule tu instrucción antes de ejecutarla: &ldquo;Antes de responder, reformula mi petición para confirmar que la entendiste bien&rdquo;.
            </div>
          </div>
        </div>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Buenas prácticas
        </h4>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🎯</span>
            <strong>Una tarea a la vez</strong>
            Divide peticiones complejas en varios prompts. Un único prompt con tres tareas distintas produce peor resultado que tres prompts enfocados.
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <strong>Guarda los que funcionan</strong>
            Cuando un prompt produce un resultado excelente, guárdalo como plantilla. No lo reescribas desde cero cada vez.
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔍</span>
            <strong>Verifica hechos</strong>
            Las IAs pueden equivocarse en datos, fechas y estadísticas. Contrasta los resultados con fuentes externas antes de usarlos.
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✏️</span>
            <strong>Edita el output</strong>
            Usa la respuesta de la IA como base, no como producto final. La personalización y revisión final siempre debe ser tuya.
          </div>
        </div>

        <div className={styles.warningBox} role="note">
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes a evitar</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Aceptar la primera respuesta sin verificar datos o citas — las IAs pueden inventar fuentes.</li>
            <li>Usar prompts vagos y culpar al modelo: la instrucción deficiente es la causa más común de respuestas mediocres.</li>
            <li>Compartir datos confidenciales o personales en prompts de IAs con servidores fuera de la UE.</li>
            <li>Asumir que el mismo prompt funcionará igual en todos los modelos — hay diferencias sutiles entre ellos.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('constructor-prompts')} />
      <ShareCard appName="constructor-prompts" />
      <Footer appName="constructor-prompts" />
    </div>
  );
}
