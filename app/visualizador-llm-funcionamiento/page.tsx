'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './VisualizadorLlmFuncionamiento.module.css';
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

interface Punto {
  palabra: string;
  x: number;
  y: number;
  grupo: string;
}

interface TokenInfo {
  texto: string;
  colorIdx: number;
}

interface DistribucionTemp {
  palabra: string;
  prob: number;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const TEXTO_DEFECTO = 'Hola, soy un modelo de lenguaje grande';

const EJEMPLOS_TEXTO = [
  'Hola, soy un modelo de lenguaje grande',
  'La inteligencia artificial transformará el mundo',
  'ChatGPT, Claude y Gemini son modelos LLM',
  'El procesamiento del lenguaje natural es fascinante',
];

// Puntos del espacio semántico (coordenadas 2D simplificadas)
const PUNTOS_SEMANTICOS: Punto[] = [
  // Animales
  { palabra: 'perro', x: 15, y: 20, grupo: 'animales' },
  { palabra: 'gato', x: 20, y: 15, grupo: 'animales' },
  { palabra: 'pájaro', x: 12, y: 28, grupo: 'animales' },
  { palabra: 'pez', x: 25, y: 22, grupo: 'animales' },
  // Colores
  { palabra: 'rojo', x: 75, y: 18, grupo: 'colores' },
  { palabra: 'azul', x: 82, y: 25, grupo: 'colores' },
  { palabra: 'verde', x: 70, y: 28, grupo: 'colores' },
  { palabra: 'amarillo', x: 78, y: 35, grupo: 'colores' },
  // Verbos
  { palabra: 'correr', x: 45, y: 75, grupo: 'verbos' },
  { palabra: 'saltar', x: 52, y: 70, grupo: 'verbos' },
  { palabra: 'nadar', x: 40, y: 82, grupo: 'verbos' },
  { palabra: 'volar', x: 55, y: 78, grupo: 'verbos' },
  // Comida
  { palabra: 'pan', x: 72, y: 72, grupo: 'comida' },
  { palabra: 'leche', x: 78, y: 65, grupo: 'comida' },
  { palabra: 'arroz', x: 68, y: 80, grupo: 'comida' },
  { palabra: 'fruta', x: 82, y: 75, grupo: 'comida' },
  // Analogía Rey/Reina
  { palabra: 'rey', x: 30, y: 48, grupo: 'royalty' },
  { palabra: 'reina', x: 38, y: 42, grupo: 'royalty' },
  { palabra: 'hombre', x: 28, y: 55, grupo: 'royalty' },
  { palabra: 'mujer', x: 36, y: 50, grupo: 'royalty' },
];

const COLORES_GRUPO: Record<string, string> = {
  animales: '#2E86AB',
  colores: '#48A9A6',
  verbos: '#e67e22',
  comida: '#27ae60',
  royalty: '#8e44ad',
};

// Similitud aproximada: distancia euclidiana inversa
function similitudCercanos(origen: Punto, todos: Punto[]): Punto[] {
  return todos
    .filter((p) => p.palabra !== origen.palabra)
    .map((p) => ({
      ...p,
      dist: Math.sqrt((p.x - origen.x) ** 2 + (p.y - origen.y) ** 2),
    }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, 3) as Punto[];
}

// Tokenización aproximada
function tokenizar(texto: string): TokenInfo[] {
  const palabras = texto.split(/(\s+|[,.:;!?¡¿"'()[\]{}])/u).filter((t) => t.length > 0);
  const tokens: TokenInfo[] = [];
  let colorIdx = 0;

  for (const palabra of palabras) {
    if (/^\s+$/u.test(palabra)) {
      tokens.push({ texto: '▪', colorIdx: colorIdx % 6 });
      colorIdx++;
    } else if (/^[,.:;!?¡¿"'()[\]{}]$/u.test(palabra)) {
      tokens.push({ texto: palabra, colorIdx: colorIdx % 6 });
      colorIdx++;
    } else if (palabra.length > 8) {
      // Palabras largas = 2-3 tokens
      const mitad = Math.ceil(palabra.length / 2);
      tokens.push({ texto: palabra.slice(0, mitad), colorIdx: colorIdx % 6 });
      colorIdx++;
      tokens.push({ texto: palabra.slice(mitad), colorIdx: colorIdx % 6 });
      colorIdx++;
    } else {
      tokens.push({ texto: palabra, colorIdx: colorIdx % 6 });
      colorIdx++;
    }
  }
  return tokens;
}

// Distribuciones de probabilidad por temperatura para "El cielo es..."
function getDistribucion(temp: number): DistribucionTemp[] {
  if (temp <= 0.1) {
    return [
      { palabra: 'azul', prob: 100 },
      { palabra: 'gris', prob: 0 },
      { palabra: 'naranja', prob: 0 },
      { palabra: 'nublado', prob: 0 },
      { palabra: 'oscuro', prob: 0 },
    ];
  }
  if (temp <= 0.5) {
    return [
      { palabra: 'azul', prob: 70 },
      { palabra: 'gris', prob: 20 },
      { palabra: 'naranja', prob: 0 },
      { palabra: 'nublado', prob: 0 },
      { palabra: 'oscuro', prob: 10 },
    ];
  }
  if (temp <= 1.0) {
    return [
      { palabra: 'azul', prob: 40 },
      { palabra: 'gris', prob: 25 },
      { palabra: 'naranja', prob: 15 },
      { palabra: 'nublado', prob: 10 },
      { palabra: 'oscuro', prob: 10 },
    ];
  }
  if (temp <= 1.5) {
    return [
      { palabra: 'azul', prob: 28 },
      { palabra: 'gris', prob: 22 },
      { palabra: 'naranja', prob: 20 },
      { palabra: 'nublado', prob: 18 },
      { palabra: 'oscuro', prob: 12 },
    ];
  }
  return [
    { palabra: 'azul', prob: 20 },
    { palabra: 'gris', prob: 20 },
    { palabra: 'naranja', prob: 20 },
    { palabra: 'nublado', prob: 20 },
    { palabra: 'oscuro', prob: 20 },
  ];
}

function elegirToken(distribucion: DistribucionTemp[]): string {
  const r = Math.random() * 100;
  let acum = 0;
  for (const d of distribucion) {
    acum += d.prob;
    if (r < acum) return d.palabra;
  }
  return distribucion[distribucion.length - 1].palabra;
}

// Nucleus sampling: palabras cuya probabilidad acumulada (de mayor a menor) cubre topP*100 %
function calcularNucleo(dist: DistribucionTemp[], topP: number): Set<string> {
  const sorted = [...dist].sort((a, b) => b.prob - a.prob);
  const nucleo = new Set<string>();
  let acum = 0;
  for (const d of sorted) {
    if (acum >= topP * 100) break;
    nucleo.add(d.palabra);
    acum += d.prob;
  }
  return nucleo;
}

function getEjemploPenalizacion(freq: number, pres: number): { titulo: string; texto: string } {
  const total = (freq + pres) / 2;
  if (total < 0.3) return {
    titulo: 'Sin penalización — repetición frecuente',
    texto: 'El modelo respondió. La respuesta del modelo fue larga. El modelo siguió respondiendo y la respuesta del modelo continuó repitiéndose sin variación.',
  };
  if (total < 1.2) return {
    titulo: 'Penalización moderada — equilibrio natural',
    texto: 'El modelo respondió con detalle. La contestación resultó extensa. El asistente continuó generando texto relevante sin repetir las mismas palabras.',
  };
  return {
    titulo: 'Penalización alta — vocabulario muy diverso',
    texto: 'El sistema emitió información pertinente. La comunicación resultó amplia. El agente prosiguió elaborando contenido enriquecido, evitando reutilizar términos previos.',
  };
}

const TABLA_RECOMENDACIONES = [
  { tarea: 'Código / SQL', temp: '0.1', topP: '0.9', freq: '0', pres: '0', nota: 'Máxima precisión, sin creatividad' },
  { tarea: 'Preguntas factuales', temp: '0.0', topP: '—', freq: '0', pres: '0', nota: 'Totalmente determinista' },
  { tarea: 'Emails profesionales', temp: '0.5', topP: '0.9', freq: '0.1', pres: '0', nota: 'Coherente y sin repeticiones' },
  { tarea: 'Redacción creativa', temp: '0.9', topP: '0.95', freq: '0.3', pres: '0.1', nota: 'Variedad sin caos' },
  { tarea: 'Brainstorming / ideas', temp: '1.2', topP: '0.95', freq: '0.5', pres: '0.3', nota: 'Máxima diversidad temática' },
  { tarea: 'Chatbot conversacional', temp: '0.7', topP: '0.9', freq: '0.1', pres: '0.1', nota: 'Natural y variado' },
];

// Frase de atención
const FRASE_ATENCION = ['El', 'banco', 'está', 'cerca', 'del', 'río'];

// Matrices de atención por contexto (valores 0-1 que indican intensidad)
const MATRICES_ATENCION: Record<string, number[][]> = {
  rio: [
    // El  banco  está  cerca  del   río
    [0.9, 0.2, 0.1, 0.1, 0.1, 0.1], // El
    [0.2, 0.8, 0.3, 0.5, 0.4, 0.9], // banco → atiende mucho a río
    [0.1, 0.3, 0.7, 0.6, 0.2, 0.2], // está
    [0.1, 0.5, 0.6, 0.8, 0.5, 0.4], // cerca
    [0.1, 0.4, 0.2, 0.5, 0.7, 0.6], // del
    [0.1, 0.9, 0.2, 0.4, 0.6, 0.9], // río → atiende mucho a banco
  ],
  financiero: [
    [0.8, 0.3, 0.1, 0.1, 0.1, 0.1], // El
    [0.3, 0.9, 0.4, 0.3, 0.2, 0.1], // banco → atiende mucho a sí mismo
    [0.1, 0.4, 0.8, 0.4, 0.2, 0.1], // está
    [0.1, 0.3, 0.4, 0.7, 0.4, 0.2], // cerca
    [0.1, 0.2, 0.2, 0.4, 0.6, 0.3], // del
    [0.1, 0.1, 0.1, 0.2, 0.3, 0.5], // río → poca atención en contexto financiero
  ],
};

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorLlmFuncionamiento() {
  // Sección 1: Tokenización
  const [textoInput, setTextoInput] = useState(TEXTO_DEFECTO);
  const tokens = tokenizar(textoInput);
  const numTokens = tokens.length;
  const costePor1k = 0.01;
  const costeEstimado = ((numTokens / 1000) * costePor1k).toFixed(5);

  // Sección 2: Embeddings
  const [puntoSeleccionado, setPuntoSeleccionado] = useState<Punto | null>(null);
  const [mostrarAnalogia, setMostrarAnalogia] = useState(false);
  const cercanos = puntoSeleccionado ? similitudCercanos(puntoSeleccionado, PUNTOS_SEMANTICOS) : [];

  // Sección 3: Atención
  const [tokenAtencionIdx, setTokenAtencionIdx] = useState<number | null>(1); // "banco" por defecto
  const [contextoAtencion, setContextoAtencion] = useState<'rio' | 'financiero'>('rio');
  const matrizActual = MATRICES_ATENCION[contextoAtencion];

  // Sección 4: Temperatura
  const [temperatura, setTemperatura] = useState(1.0);
  const [textoGenerado, setTextoGenerado] = useState('El cielo es...');
  const distribucion = getDistribucion(temperatura);

  // Sección 5: Parámetros avanzados
  const [topP, setTopP] = useState(0.9);
  const [freqPenalty, setFreqPenalty] = useState(0.0);
  const [presPenalty, setPresPenalty] = useState(0.0);
  const nucleo = calcularNucleo(distribucion, topP);
  const ejemploPenalizacion = getEjemploPenalizacion(freqPenalty, presPenalty);

  const handleTextoChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTextoInput(e.target.value);
  }, []);

  const handleEjemplo = useCallback((ejemplo: string) => {
    setTextoInput(ejemplo);
  }, []);

  const handleLimpiar = useCallback(() => {
    setTextoInput('');
  }, []);

  const handleGenerarToken = useCallback(() => {
    const token = elegirToken(distribucion);
    setTextoGenerado((prev) => {
      if (prev.endsWith('...')) return prev.slice(0, -3) + token;
      if (prev.split(' ').length > 15) return 'El cielo es...';
      return prev + ' ' + token;
    });
  }, [distribucion]);

  const handleResetGenerado = useCallback(() => {
    setTextoGenerado('El cielo es...');
  }, []);

  const getIntensidadColor = (valor: number): string => {
    const v = Math.round(valor * 255);
    return `rgb(46, ${Math.round(134 + (255 - 134) * (1 - valor))}, ${Math.round(171 + (255 - 171) * (1 - valor))})`;
  };

  const getEtiquetaTemp = (t: number): string => {
    if (t <= 0.2) return 'Muy frío — totalmente determinista';
    if (t <= 0.7) return 'Frío — predecible y coherente';
    if (t <= 1.1) return 'Equilibrado — estándar para chatbots';
    if (t <= 1.6) return 'Caliente — más creativo, puede errar';
    return 'Muy caliente — caótico e incoherente';
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>🤖 Visualizador Interactivo</span>
          <h1 className={styles.heroTitle}>Cómo Funcionan los LLMs</h1>
          <p className={styles.heroSubtitle}>Tokens, embeddings, atención y temperatura</p>
          <p className={styles.heroDesc}>
            Explora cómo ChatGPT, Claude y Gemini leen texto, comprenden el significado,
            resuelven ambigüedades y generan respuestas. Sin matemáticas complejas.
          </p>
        </div>
      </header>

      <LegalNotice />

      <main className={styles.main}>

        {/* ── Sección 1: Tokenización ───────────────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">🔤</span>
            <div>
              <h2 className={styles.sectionTitle}>Tokenización — Cómo el modelo "lee" el texto</h2>
              <p className={styles.sectionSubtitle}>
                El modelo no ve letras ni palabras: divide el texto en "tokens" (fragmentos de palabras).
              </p>
            </div>
          </div>

          <textarea
            className={styles.textarea}
            value={textoInput}
            onChange={handleTextoChange}
            placeholder="Escribe cualquier texto..."
            rows={3}
            aria-label="Texto para tokenizar"
          />

          <div className={styles.ejemplosBtns}>
            {EJEMPLOS_TEXTO.map((ej) => (
              <button
                key={ej}
                className={styles.btnSecundario}
                onClick={() => handleEjemplo(ej)}
                style={{ fontSize: '0.78rem' }}
                aria-label={`Cargar ejemplo: ${ej}`}
              >
                {ej.slice(0, 30)}…
              </button>
            ))}
            <button
              className={styles.btnSecundario}
              onClick={handleLimpiar}
              aria-label="Limpiar texto"
            >
              Limpiar
            </button>
          </div>

          <div className={styles.tokensVisuales} role="region" aria-label="Tokens visualizados">
            {tokens.map((t, i) => (
              <span
                key={i}
                className={`${styles.token} ${styles[`token${t.colorIdx}`]}`}
                title={`Token ${i + 1}: "${t.texto}"`}
              >
                {t.texto}
              </span>
            ))}
          </div>

          <div className={styles.tokenStats}>
            <div className={styles.tokenStat}>
              <span className={styles.tokenStatNum} aria-live="polite">{numTokens}</span>
              <span className={styles.tokenStatLabel}>tokens</span>
            </div>
            <div className={styles.tokenStat}>
              <span className={styles.tokenStatNum}>{textoInput.length}</span>
              <span className={styles.tokenStatLabel}>caracteres</span>
            </div>
            <div className={styles.tokenStat}>
              <span className={styles.tokenStatNum}>~${costeEstimado}</span>
              <span className={styles.tokenStatLabel}>coste GPT-4 input</span>
            </div>
          </div>

          <div className={styles.tarjetasDatos}>
            <div className={styles.tarjetaDato}>
              <span className={styles.tarjetaDatoIcono} aria-hidden="true">🇬🇧</span>
              <span>1 token ≈ 0,75 palabras en inglés</span>
            </div>
            <div className={styles.tarjetaDato}>
              <span className={styles.tarjetaDatoIcono} aria-hidden="true">🇪🇸</span>
              <span>1 token ≈ 0,5 palabras en español</span>
            </div>
            <div className={styles.tarjetaDato}>
              <span className={styles.tarjetaDatoIcono} aria-hidden="true">📏</span>
              <span>GPT-4: 128.000 tokens de context window</span>
            </div>
            <div className={styles.tarjetaDato}>
              <span className={styles.tarjetaDatoIcono} aria-hidden="true">📖</span>
              <span>128k tokens ≈ 300 páginas de libro</span>
            </div>
          </div>

          <div className={styles.warningBox}>
            <span aria-hidden="true">💡</span>
            <span>
              El modelo nunca ve texto crudo: todo se convierte a IDs numéricos de tokens.
              "ChatGPT" puede ser 1 token en inglés pero 2 en otros idiomas.
            </span>
          </div>
        </section>

        {/* ── Sección 2: Embeddings ─────────────────────────────── */}
        <section className={styles.sectionAlt}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">🌐</span>
            <div>
              <h2 className={styles.sectionTitle}>Embeddings — El espacio semántico</h2>
              <p className={styles.sectionSubtitle}>
                Cada palabra se representa como un punto en un espacio de miles de dimensiones.
                Palabras similares quedan cerca. Haz clic en cualquier palabra.
              </p>
            </div>
          </div>

          <div className={styles.leyendaGrupos}>
            {Object.entries(COLORES_GRUPO).map(([grupo, color]) => (
              <span key={grupo} className={styles.leyendaItem}>
                <span
                  className={styles.leyendaDot}
                  style={{ backgroundColor: color }}
                  aria-hidden="true"
                />
                {grupo.charAt(0).toUpperCase() + grupo.slice(1)}
              </span>
            ))}
          </div>

          <div className={styles.embeddingWrapper}>
            <svg
              className={styles.embeddingSvg}
              viewBox="0 0 100 100"
              aria-label="Espacio semántico de embeddings. Cada punto representa una palabra."
              role="img"
            >
              {/* Fondo de cuadrícula */}
              <line x1="50" y1="0" x2="50" y2="100" stroke="#e0e0e0" strokeWidth="0.3" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="#e0e0e0" strokeWidth="0.3" />

              {/* Flechas analogía Rey→Reina */}
              {mostrarAnalogia && (
                <g opacity="0.7">
                  <line x1="30" y1="48" x2="37" y2="42" stroke="#8e44ad" strokeWidth="0.8" strokeDasharray="1.5 1" markerEnd="url(#arrowhead)" />
                  <line x1="28" y1="55" x2="35" y2="50" stroke="#8e44ad" strokeWidth="0.8" strokeDasharray="1.5 1" />
                  <text x="22" y="38" fontSize="2.8" fill="#8e44ad" fontWeight="700">Rey − Hombre + Mujer ≈ Reina</text>
                </g>
              )}
              <defs>
                <marker id="arrowhead" markerWidth="3" markerHeight="3" refX="1.5" refY="1.5" orient="auto">
                  <polygon points="0 0, 3 1.5, 0 3" fill="#8e44ad" />
                </marker>
              </defs>

              {/* Líneas hacia cercanos */}
              {puntoSeleccionado && cercanos.map((c) => (
                <line
                  key={`line-${c.palabra}`}
                  x1={puntoSeleccionado.x}
                  y1={puntoSeleccionado.y}
                  x2={c.x}
                  y2={c.y}
                  stroke="#48A9A6"
                  strokeWidth="0.6"
                  strokeDasharray="1.5 1"
                  opacity="0.7"
                />
              ))}

              {/* Puntos */}
              {PUNTOS_SEMANTICOS.map((p) => {
                const esSeleccionado = puntoSeleccionado?.palabra === p.palabra;
                const esCercano = cercanos.some((c) => c.palabra === p.palabra);
                return (
                  <g
                    key={p.palabra}
                    onClick={() => setPuntoSeleccionado(esSeleccionado ? null : p)}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    aria-label={`Palabra: ${p.palabra}. Grupo: ${p.grupo}. Haz clic para ver palabras similares.`}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setPuntoSeleccionado(esSeleccionado ? null : p)}
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={esSeleccionado ? 3 : esCercano ? 2.2 : 1.8}
                      fill={COLORES_GRUPO[p.grupo]}
                      stroke={esSeleccionado ? '#1A1A1A' : esCercano ? '#48A9A6' : 'none'}
                      strokeWidth={esSeleccionado ? 0.8 : 0.5}
                      opacity={puntoSeleccionado && !esSeleccionado && !esCercano ? 0.35 : 1}
                    />
                    <text
                      x={p.x + 2.5}
                      y={p.y - 1.5}
                      fontSize="3.2"
                      fill={COLORES_GRUPO[p.grupo]}
                      fontWeight={esSeleccionado || esCercano ? '700' : '400'}
                      opacity={puntoSeleccionado && !esSeleccionado && !esCercano ? 0.4 : 1}
                    >
                      {p.palabra}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {puntoSeleccionado && (
            <div className={styles.cercanosPanel} role="region" aria-live="polite" aria-label={`Palabras más cercanas a "${puntoSeleccionado.palabra}"`}>
              <p className={styles.cercanosTitulo}>
                Palabras más cercanas a <strong>"{puntoSeleccionado.palabra}"</strong>:
              </p>
              <div className={styles.cercanosList}>
                {cercanos.map((c, i) => (
                  <span key={c.palabra} className={styles.cercanoPill} style={{ borderColor: COLORES_GRUPO[c.grupo] }}>
                    <span style={{ color: COLORES_GRUPO[c.grupo] }}>#{i + 1}</span> {c.palabra}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            className={styles.btnPrimario}
            onClick={() => setMostrarAnalogia(!mostrarAnalogia)}
            aria-pressed={mostrarAnalogia}
            aria-label={mostrarAnalogia ? 'Ocultar analogía Rey→Reina' : 'Mostrar analogía Rey→Reina'}
          >
            {mostrarAnalogia ? '🙈 Ocultar analogía' : '👑 Mostrar analogía Rey→Reina'}
          </button>

          <div className={styles.analogiaBox}>
            <strong>Rey − Hombre + Mujer ≈ Reina</strong>: en el espacio vectorial,
            la dirección que va de "hombre" a "mujer" es la misma que va de "rey" a "reina".
            Esto es aritmética vectorial sobre el espacio semántico — no magia, matemáticas.
          </div>
        </section>

        {/* ── Sección 3: Atención (Transformers) ───────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">👁️</span>
            <div>
              <h2 className={styles.sectionTitle}>Mecanismo de atención — Transformers</h2>
              <p className={styles.sectionSubtitle}>
                La atención permite al modelo saber qué palabras son relevantes para entender cada token.
                Haz clic en un token para ver a qué presta atención.
              </p>
            </div>
          </div>

          <div className={styles.contextoToggle}>
            <span className={styles.contextoLabel}>Contexto:</span>
            <button
              className={`${styles.contextoBtn} ${contextoAtencion === 'rio' ? styles.contextoBtnActivo : ''}`}
              onClick={() => { setContextoAtencion('rio'); setTokenAtencionIdx(1); }}
              aria-pressed={contextoAtencion === 'rio'}
            >
              🌊 Banco del río
            </button>
            <button
              className={`${styles.contextoBtn} ${contextoAtencion === 'financiero' ? styles.contextoBtnActivo : ''}`}
              onClick={() => { setContextoAtencion('financiero'); setTokenAtencionIdx(1); }}
              aria-pressed={contextoAtencion === 'financiero'}
            >
              🏦 Banco financiero
            </button>
          </div>

          <p className={styles.fraseAtencion}>
            {FRASE_ATENCION.map((token, i) => (
              <button
                key={i}
                className={`${styles.tokenAtencion} ${tokenAtencionIdx === i ? styles.tokenAtencionActivo : ''}`}
                onClick={() => setTokenAtencionIdx(tokenAtencionIdx === i ? null : i)}
                aria-pressed={tokenAtencionIdx === i}
                aria-label={`Token: "${token}". Haz clic para ver su atención.`}
              >
                {token}
              </button>
            ))}
          </p>

          {/* Matriz de atención */}
          <div className={styles.atencionMatrizWrapper}>
            <p className={styles.atencionMatrizTitulo}>
              {tokenAtencionIdx !== null
                ? `Atención desde "${FRASE_ATENCION[tokenAtencionIdx]}":`
                : 'Selecciona un token para ver su atención'}
            </p>
            <div className={styles.atencionGrid} role="grid" aria-label="Matriz de atención">
              {/* Cabecera */}
              <div className={styles.atencionCeldaVacia} />
              {FRASE_ATENCION.map((t) => (
                <div key={`col-${t}`} className={styles.atencionCabecera}>{t}</div>
              ))}
              {/* Filas */}
              {FRASE_ATENCION.map((filaToken, fi) => (
                <>
                  <div key={`row-${fi}`} className={styles.atencionCabecera}>{filaToken}</div>
                  {FRASE_ATENCION.map((_, ci) => {
                    const valor = matrizActual[fi][ci];
                    const esDestacado = tokenAtencionIdx === fi;
                    return (
                      <div
                        key={`cell-${fi}-${ci}`}
                        className={styles.atencionCelda}
                        style={{
                          backgroundColor: esDestacado
                            ? getIntensidadColor(valor)
                            : `rgba(46, 134, 171, ${valor * 0.25})`,
                          opacity: esDestacado ? 1 : 0.55,
                          fontWeight: esDestacado ? 700 : 400,
                        }}
                        role="gridcell"
                        aria-label={`Atención de "${FRASE_ATENCION[fi]}" hacia "${FRASE_ATENCION[ci]}": ${Math.round(valor * 100)}%`}
                        title={`${Math.round(valor * 100)}%`}
                      >
                        {Math.round(valor * 100)}%
                      </div>
                    );
                  })}
                </>
              ))}
            </div>
          </div>

          <div className={styles.atencionExplicacion} role="status" aria-live="polite">
            {contextoAtencion === 'rio'
              ? '🌊 "banco" atiende fuertemente a "río" y "cerca" → el modelo infiere que es un asiento junto al río.'
              : '🏦 En contexto financiero, "banco" se atiende a sí mismo y a "El" → institución financiera.'}
          </div>

          <div className={styles.datosClave}>
            <div className={styles.datoClave}>
              <span className={styles.datoClaveNum}>96</span>
              <span className={styles.datoClaveLbl}>capas de atención en GPT-4</span>
            </div>
            <div className={styles.datoClave}>
              <span className={styles.datoClaveNum}>96</span>
              <span className={styles.datoClaveLbl}>cabezas por capa</span>
            </div>
            <div className={styles.datoClave}>
              <span className={styles.datoClaveNum}>9.216</span>
              <span className={styles.datoClaveLbl}>mecanismos de atención en paralelo</span>
            </div>
          </div>
        </section>

        {/* ── Sección 4: Temperatura ────────────────────────────── */}
        <section className={styles.sectionAlt}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">🌡️</span>
            <div>
              <h2 className={styles.sectionTitle}>Temperatura — Creatividad vs. Coherencia</h2>
              <p className={styles.sectionSubtitle}>
                Dado el prompt <em>"El cielo es..."</em>, la temperatura determina cuán predecible es la respuesta.
              </p>
            </div>
          </div>

          <div className={styles.tempSliderWrapper}>
            <div className={styles.tempEtiquetas}>
              <span className={styles.tempEtiquetaFria}>❄️ Frío (predecible)</span>
              <span className={styles.tempEtiquetaCaliente}>🔥 Caliente (creativo/caótico)</span>
            </div>
            <input
              type="range"
              min={0}
              max={2}
              step={0.1}
              value={temperatura}
              onChange={(e) => setTemperatura(parseFloat(e.target.value))}
              className={styles.tempSlider}
              aria-label={`Temperatura del modelo: ${temperatura.toFixed(1)}`}
            />
            <div className={styles.tempValorWrapper}>
              <span className={styles.tempValor}>T = {temperatura.toFixed(1)}</span>
              <span className={styles.tempDescripcion}>{getEtiquetaTemp(temperatura)}</span>
            </div>
          </div>

          <div className={styles.probWrapper}>
            <p className={styles.probTitulo}>
              Distribución de probabilidad para la siguiente palabra tras "El cielo es...":
            </p>
            {distribucion.map((d) => (
              <div key={d.palabra} className={styles.probFila}>
                <span className={styles.probPalabra}>{d.palabra}</span>
                <div className={styles.probBarraWrapper}>
                  <div
                    className={styles.barraProb}
                    style={{ width: `${d.prob}%` }}
                    role="img"
                    aria-label={`${d.palabra}: ${d.prob}%`}
                  />
                </div>
                <span className={styles.probPorcentaje}>{d.prob}%</span>
              </div>
            ))}
          </div>

          <div className={styles.generadorWrapper}>
            <p className={styles.generadorTitulo}>Texto generado:</p>
            <p className={styles.textoGenerado} role="status" aria-live="polite">
              {textoGenerado}
            </p>
            <div className={styles.generadorBtns}>
              <button
                className={styles.btnPrimario}
                onClick={handleGenerarToken}
                aria-label="Generar siguiente token según la distribución actual"
              >
                ▶ Generar siguiente token
              </button>
              <button
                className={styles.btnSecundario}
                onClick={handleResetGenerado}
                aria-label="Reiniciar texto generado"
              >
                🔄 Reiniciar
              </button>
            </div>
          </div>
        </section>

        {/* ── Sección 5: Parámetros Avanzados ──────────────────── */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionIcon} aria-hidden="true">⚙️</span>
            <div>
              <h2 className={styles.sectionTitle}>Parámetros avanzados — top-p, frequency y presence penalty</h2>
              <p className={styles.sectionSubtitle}>
                Además de la temperatura, hay tres parámetros que controlan la diversidad y la repetición. Ajústalos para ver su efecto.
              </p>
            </div>
          </div>

          {/* top-p */}
          <div className={styles.paramBloque}>
            <div className={styles.paramCabecera}>
              <span className={styles.paramNombre}>top-p <span className={styles.paramAlias}>(nucleus sampling)</span></span>
              <span className={styles.paramValorBadge}>{topP.toFixed(2)}</span>
            </div>
            <p className={styles.paramDesc}>
              Solo considera las palabras cuya probabilidad acumulada (de mayor a menor) no supera este valor.
              Las palabras fuera del núcleo quedan excluidas sin importar su probabilidad individual.
            </p>
            <input
              type="range" min={0.1} max={1.0} step={0.05}
              value={topP} onChange={(e) => setTopP(parseFloat(e.target.value))}
              className={styles.paramSlider}
              aria-label={`top-p: ${topP.toFixed(2)}`}
            />
            <div className={styles.paramTicksRow}>
              <span>0.1 — solo la más probable</span>
              <span>0.9 — estándar</span>
              <span>1.0 — todas</span>
            </div>
            <p className={styles.paramSubDesc}>
              Distribución actual (temperatura {temperatura.toFixed(1)}) — palabras en el núcleo marcadas:
            </p>
            <div className={styles.nucleoWrapper} role="list" aria-label="Distribución con nucleus sampling">
              {[...distribucion].sort((a, b) => b.prob - a.prob).map((d) => {
                const enNucleo = nucleo.has(d.palabra);
                return (
                  <div key={d.palabra} className={`${styles.nucleoFila} ${enNucleo ? styles.nucleoFilaActiva : styles.nucleoFilaFuera}`}
                    role="listitem" aria-label={`${d.palabra}: ${d.prob}% — ${enNucleo ? 'en el núcleo' : 'excluida'}`}>
                    <span className={styles.nucleoPalabra}>{d.palabra}</span>
                    <div className={styles.probBarraWrapper}>
                      <div className={styles.barraProb} style={{ width: `${d.prob}%`, opacity: enNucleo ? 1 : 0.25 }} />
                    </div>
                    <span className={styles.probPorcentaje}>{d.prob}%</span>
                    <span className={styles.nucleoBadge}>{enNucleo ? '✓ núcleo' : '✗ fuera'}</span>
                  </div>
                );
              })}
            </div>
            <div className={styles.warningBox} style={{ marginTop: '0.75rem' }}>
              <span aria-hidden="true">💡</span>
              <span>Normalmente se ajusta <strong>temperature O top-p</strong>, no los dos a la vez. Combinarlos puede producir resultados impredecibles.</span>
            </div>
          </div>

          {/* frequency_penalty y presence_penalty */}
          <div className={styles.paramBloque}>
            <div className={styles.penaltyGrid}>
              <div>
                <div className={styles.paramCabecera}>
                  <span className={styles.paramNombre}>frequency_penalty</span>
                  <span className={styles.paramValorBadge}>{freqPenalty.toFixed(1)}</span>
                </div>
                <p className={styles.paramDesc}>
                  Reduce la probabilidad de cada palabra <em>proporcionalmente</em> a cuántas veces ya apareció en el texto generado.
                </p>
                <input type="range" min={0} max={2} step={0.1} value={freqPenalty}
                  onChange={(e) => setFreqPenalty(parseFloat(e.target.value))}
                  className={styles.paramSlider} aria-label={`frequency_penalty: ${freqPenalty.toFixed(1)}`} />
                <div className={styles.paramTicksRow}><span>0 sin efecto</span><span>2 máximo</span></div>
              </div>
              <div>
                <div className={styles.paramCabecera}>
                  <span className={styles.paramNombre}>presence_penalty</span>
                  <span className={styles.paramValorBadge}>{presPenalty.toFixed(1)}</span>
                </div>
                <p className={styles.paramDesc}>
                  Penaliza palabras que ya aparecieron <em>al menos una vez</em>, sin importar cuántas. Favorece nuevos temas.
                </p>
                <input type="range" min={0} max={2} step={0.1} value={presPenalty}
                  onChange={(e) => setPresPenalty(parseFloat(e.target.value))}
                  className={styles.paramSlider} aria-label={`presence_penalty: ${presPenalty.toFixed(1)}`} />
                <div className={styles.paramTicksRow}><span>0 sin efecto</span><span>2 máximo</span></div>
              </div>
            </div>
            <div className={styles.penaltyEjemplo} role="status" aria-live="polite">
              <p className={`${styles.penaltyTitulo} ${(freqPenalty + presPenalty) < 0.3 ? styles.penaltyTituloMal : (freqPenalty + presPenalty) > 2 ? styles.penaltyTituloAlto : styles.penaltyTituloBien}`}>
                {(freqPenalty + presPenalty) < 0.3 ? '❌' : (freqPenalty + presPenalty) > 2 ? '⚠️' : '✅'} {ejemploPenalizacion.titulo}
              </p>
              <p className={styles.penaltyTexto}>&ldquo;{ejemploPenalizacion.texto}&rdquo;</p>
            </div>
          </div>

          {/* Tabla de recomendaciones */}
          <div className={styles.paramBloque}>
            <h3 className={styles.paramTitulo}>Configuraciones recomendadas por caso de uso</h3>
            <div className={styles.tablaRecomWrapper}>
              <table className={styles.tablaRecom} aria-label="Configuraciones recomendadas de parámetros por tarea">
                <thead>
                  <tr>
                    <th className={styles.thRecom}>Tarea</th>
                    <th className={styles.thRecom}>temperature</th>
                    <th className={styles.thRecom}>top-p</th>
                    <th className={styles.thRecom}>freq_pen</th>
                    <th className={styles.thRecom}>pres_pen</th>
                    <th className={styles.thRecom}>Por qué</th>
                  </tr>
                </thead>
                <tbody>
                  {TABLA_RECOMENDACIONES.map((r) => (
                    <tr key={r.tarea} className={styles.trRecom}>
                      <td className={styles.tdRecom}><strong>{r.tarea}</strong></td>
                      <td className={styles.tdRecom}>{r.temp}</td>
                      <td className={styles.tdRecom}>{r.topP}</td>
                      <td className={styles.tdRecom}>{r.freq}</td>
                      <td className={styles.tdRecom}>{r.pres}</td>
                      <td className={styles.tdRecom} style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #666)' }}>{r.nota}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Sección Educativa ─────────────────────────────────── */}
        <EducationalSection
          title="Cómo funcionan los LLMs — Guía completa"
          subtitle="Pre-entrenamiento, RLHF, alucinaciones y la diferencia entre modelos"
          icon="🤖"
          defaultOpen={false}
        >
          <h3>¿Qué es un LLM?</h3>
          <p>
            Un Large Language Model (Modelo de Lenguaje Grande) es una red neuronal entrenada con cantidades masivas
            de texto para predecir el siguiente token dado un contexto. GPT-4 tiene estimados ~1,8 billones de
            parámetros. Claude 3 Opus tiene una escala similar. Estos parámetros son ajustes numéricos (pesos)
            que la red aprende durante el entrenamiento.
          </p>

          <h3>Pre-entrenamiento vs Fine-tuning vs RLHF</h3>
          <ul>
            <li>
              <strong>Pre-entrenamiento</strong>: El modelo aprende a predecir el siguiente token en billones de
              palabras extraídas de internet, libros y código. Esto le da conocimiento del mundo y del lenguaje.
              Puede tardar meses en clusters de miles de GPUs.
            </li>
            <li>
              <strong>Fine-tuning</strong>: El modelo pre-entrenado se ajusta con datos específicos (ej: diálogos
              de asistente-usuario) para que responda de forma útil en lugar de completar texto aleatoriamente.
            </li>
            <li>
              <strong>RLHF (Aprendizaje por Refuerzo con Retroalimentación Humana)</strong>: Evaluadores humanos
              puntúan respuestas del modelo. Un modelo de recompensa aprende esas preferencias y guía al LLM
              hacia respuestas más útiles, honestas y seguras.
            </li>
          </ul>

          <h3>Context window: ¿qué es y por qué importa?</h3>
          <p>
            El context window es la cantidad máxima de texto que el modelo puede "recordar" en una conversación.
            GPT-4 Turbo: 128.000 tokens (~300 páginas). Claude 3: 200.000 tokens (~500 páginas). Gemini 1.5 Pro:
            1 millón de tokens (~2.500 páginas). Fuera del context window, el modelo olvida completamente lo que
            ocurrió antes. No tiene memoria persistente entre conversaciones (a menos que se implemente externamente).
          </p>

          <h3>Alucinaciones: ¿por qué los LLMs inventan cosas?</h3>
          <p>
            Los LLMs no son bases de datos ni buscadores. Generan texto token a token buscando la continuación
            más probable según su entrenamiento. Si el modelo no sabe algo, puede generar una respuesta
            "plausible" que no es verdad. Esto ocurre porque el objetivo del entrenamiento es predecir texto
            humano, no verificar hechos. Técnicas como RAG (Retrieval-Augmented Generation) conectan el modelo
            a bases de datos externas para reducir alucinaciones.
          </p>

          <h3>Diferencia entre Claude, ChatGPT y Gemini</h3>
          <ul>
            <li>
              <strong>ChatGPT (OpenAI)</strong>: Basado en GPT-4. Primer chatbot masivo (noviembre 2022).
              Enfoque en utilidad general. Integración con DALL-E, Code Interpreter y plugins.
            </li>
            <li>
              <strong>Claude (Anthropic)</strong>: Diseñado con énfasis en seguridad (Constitutional AI).
              Context window muy largo. Mayor coherencia en textos extensos y menos alucinaciones en algunos benchmarks.
            </li>
            <li>
              <strong>Gemini (Google DeepMind)</strong>: Nativo multimodal desde el diseño (texto, imágenes, audio).
              Integrado con el ecosistema Google (búsqueda, Workspace).
            </li>
          </ul>

          <h3>¿Qué NO saben hacer los LLMs?</h3>
          <ul>
            <li><strong>Aritmética precisa sin herramientas</strong>: 347 × 829 puede dar un resultado incorrecto si no usa una calculadora.</li>
            <li><strong>Razonamiento simbólico formal</strong>: La lógica matemática rigurosa y las demostraciones formales son difíciles sin andamiaje externo.</li>
            <li><strong>Acceder a información en tiempo real</strong>: Tienen fecha de corte de entrenamiento (salvo que usen búsqueda web).</li>
            <li><strong>Recordar conversaciones pasadas</strong>: Sin memoria externa, cada conversación empieza desde cero.</li>
            <li><strong>Contar letras con fiabilidad</strong>: Preguntar "¿cuántas 'r' tiene 'strawberry'?" puede dar respuestas incorrectas.</li>
          </ul>

          <h3>Conexión con la computación cuántica</h3>
          <p>
            Los investigadores exploran si los ordenadores cuánticos podrían acelerar el entrenamiento de LLMs
            en el futuro. Por ahora, los LLMs se entrenan en chips clásicos (GPUs/TPUs). La computación cuántica
            podría ayudar con la optimización de los parámetros, aunque esto aún está en fase teórica y de
            investigación temprana.
          </p>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-llm-funcionamiento')} />
        <ShareCard appName="visualizador-llm-funcionamiento" />
      </main>

      <Footer appName="visualizador-llm-funcionamiento" />
    </div>
  );
}
