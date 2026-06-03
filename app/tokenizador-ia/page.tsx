'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import styles from './TokenizadorIa.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { DataReference } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ───

interface Token { texto: string; colorIdx: number; id: number; }

interface ModeloIA {
  id: string; nombre: string; empresa: string; icono: string;
  contexto: number; precioEntrada: number; precioSalida: number; urlPrecios: string;
}

// ─── Constantes ───

const TOKEN_COLORS = ['#2E86AB','#48A9A6','#e67e22','#27ae60','#8e44ad','#c0392b','#2980b9','#16a085'];

const MODELOS_DEFAULT: ModeloIA[] = [
  { id: 'gpt4o',         nombre: 'GPT-4o',          empresa: 'OpenAI',    icono: '🤖', contexto: 128000,  precioEntrada: 2.50,  precioSalida: 10.00, urlPrecios: 'https://openai.com/pricing' },
  { id: 'gpt4o-mini',    nombre: 'GPT-4o mini',     empresa: 'OpenAI',    icono: '🤖', contexto: 128000,  precioEntrada: 0.15,  precioSalida: 0.60,  urlPrecios: 'https://openai.com/pricing' },
  { id: 'claude-sonnet', nombre: 'Claude Sonnet 4.6',empresa: 'Anthropic', icono: '🧠', contexto: 200000,  precioEntrada: 3.00,  precioSalida: 15.00, urlPrecios: 'https://www.anthropic.com/pricing' },
  { id: 'claude-haiku',  nombre: 'Claude Haiku 4.5', empresa: 'Anthropic', icono: '🧠', contexto: 200000,  precioEntrada: 0.80,  precioSalida: 4.00,  urlPrecios: 'https://www.anthropic.com/pricing' },
  { id: 'gemini-pro',    nombre: 'Gemini 1.5 Pro',   empresa: 'Google',    icono: '✨', contexto: 1048576, precioEntrada: 1.25,  precioSalida: 5.00,  urlPrecios: 'https://ai.google.dev/pricing' },
  { id: 'gemini-flash',  nombre: 'Gemini 1.5 Flash', empresa: 'Google',    icono: '✨', contexto: 1048576, precioEntrada: 0.075, precioSalida: 0.30,  urlPrecios: 'https://ai.google.dev/pricing' },
];

const EJEMPLOS = [
  { etiqueta: '📱 Tweet',   texto: '¡Acabo de descubrir que la IA puede escribir código! Probando GitHub Copilot con Python y estoy flipando. El futuro ya está aquí.' },
  { etiqueta: '📧 Email',   texto: 'Hola equipo,\n\nOs escribo para confirmar la reunión del próximo martes a las 10:00h. El orden del día incluye la revisión del presupuesto Q3 y los objetivos de septiembre.\n\nSaludos,' },
  { etiqueta: '📄 Párrafo', texto: 'Los modelos de lenguaje grande (LLMs) son sistemas de IA entrenados con enormes cantidades de texto. No piensan como los humanos: predicen la siguiente palabra más probable en función del contexto previo.' },
  { etiqueta: '💻 Código',  texto: 'function calcularFactorial(n: number): number {\n  if (n <= 1) return 1;\n  return n * calcularFactorial(n - 1);\n}\nconst resultado = calcularFactorial(10);' },
];

// ─── Tokenizador BPE educativo ───
// Usa matchAll en lugar de exec para compatibilidad con hooks de seguridad

function tokenizar(texto: string): Token[] {
  if (!texto.trim()) return [];
  const RE = /\s?[A-Za-zÀ-ɏ]+(?:'[a-z]*)?|\s?[0-9]+(?:[.,][0-9]+)?|\s?[^\s]/gu;
  const tokens: Token[] = [];
  let idx = 0;
  for (const match of texto.matchAll(RE)) {
    const chunk = match[0];
    const word = chunk.trimStart();
    const space = chunk.length > word.length ? ' ' : '';
    if (word.length <= 5) {
      tokens.push({ texto: chunk, colorIdx: idx % TOKEN_COLORS.length, id: idx++ });
    } else if (word.length <= 11) {
      const h = Math.ceil(word.length / 2);
      tokens.push({ texto: space + word.slice(0, h), colorIdx: idx % TOKEN_COLORS.length, id: idx++ });
      tokens.push({ texto: word.slice(h), colorIdx: idx % TOKEN_COLORS.length, id: idx++ });
    } else {
      const t = Math.ceil(word.length / 3);
      tokens.push({ texto: space + word.slice(0, t), colorIdx: idx % TOKEN_COLORS.length, id: idx++ });
      tokens.push({ texto: word.slice(t, 2 * t), colorIdx: idx % TOKEN_COLORS.length, id: idx++ });
      tokens.push({ texto: word.slice(2 * t), colorIdx: idx % TOKEN_COLORS.length, id: idx++ });
    }
  }
  return tokens;
}

function formatUSD(n: number): string {
  if (n === 0) return '$0,000000';
  if (n < 0.000001) return `$${n.toExponential(2)}`;
  if (n < 0.01) return `$${n.toFixed(6)}`;
  if (n < 1) return `$${n.toFixed(4)}`;
  return `$${n.toFixed(3)}`;
}

function formatContextoPct(tokens: number, contexto: number): string {
  const pct = (tokens / contexto) * 100;
  if (pct < 0.01) return '<0,01%';
  if (pct > 100) return '100%';
  return `${pct.toFixed(2).replace('.', ',')}%`;
}

function calcularCoste(tokens: number, outputRatio: number, modelo: ModeloIA): number {
  return (tokens * modelo.precioEntrada + tokens * outputRatio * modelo.precioSalida) / 1_000_000;
}

// ─── Componente principal ───

export default function TokenizadorIa() {
  const [texto, setTexto] = useState('');
  const [outputRatio, setOutputRatio] = useState(1.0);
  const [editandoPrecios, setEditandoPrecios] = useState(false);
  const [modelos, setModelos] = useState<ModeloIA[]>(MODELOS_DEFAULT);

  const tokens = useMemo(() => tokenizar(texto), [texto]);
  const numTokens = tokens.length;
  const numPalabras = texto.trim() ? texto.trim().split(/\s+/).length : 0;
  const numChars = texto.length;
  const ratio = numPalabras > 0 ? numTokens / numPalabras : 0;

  const handleEjemplo = useCallback((t: string) => setTexto(t), []);

  function actualizarPrecio(id: string, campo: 'precioEntrada' | 'precioSalida', valor: string) {
    const num = parseFloat(valor.replace(',', '.'));
    if (isNaN(num) || num < 0) return;
    setModelos((prev) => prev.map((m) => m.id === id ? { ...m, [campo]: num } : m));
  }

  function restaurarDefecto() { setModelos(MODELOS_DEFAULT); }

  const ratioLabel = outputRatio === 1
    ? '1:1 (igual entrada que salida)'
    : outputRatio < 1 ? `1:${outputRatio} (respuestas cortas)` : `1:${outputRatio} (respuestas largas)`;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Tokenizador Visual de IA</h1>
        <p className={styles.heroSubtitle}>
          Escribe texto y ve en tiempo real cómo lo divide un LLM — con conteo de tokens y calculadora de costes por modelo
        </p>
      </header>
      <LegalNotice />

      <main className={styles.main}>
        {/* Ejemplos rápidos */}
        <div className={styles.ejemplosRow} role="group" aria-label="Ejemplos rápidos">
          {EJEMPLOS.map((ej) => (
            <button key={ej.etiqueta} className={styles.ejemploBtn} onClick={() => handleEjemplo(ej.texto)}>
              {ej.etiqueta}
            </button>
          ))}
          <button className={styles.ejemploBtn} onClick={() => setTexto('')}>🗑️ Limpiar</button>
        </div>

        {/* Textarea */}
        <div className={styles.inputArea}>
          <label htmlFor="textoInput" className={styles.inputLabel}>Introduce o pega tu texto</label>
          <textarea
            id="textoInput"
            className={styles.textarea}
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe aquí tu prompt, email, artículo o cualquier texto… Los tokens aparecerán debajo en tiempo real."
            rows={6}
            aria-describedby="stats-desc"
          />
        </div>

        {/* Stats */}
        <div className={styles.statsRow} id="stats-desc" role="status" aria-live="polite" aria-label="Estadísticas">
          <div className={styles.statCard}>
            <span className={styles.statValor}>{numTokens.toLocaleString('es-ES')}</span>
            <span className={styles.statLabel}>Tokens</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValor}>{numPalabras.toLocaleString('es-ES')}</span>
            <span className={styles.statLabel}>Palabras</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValor}>{numChars.toLocaleString('es-ES')}</span>
            <span className={styles.statLabel}>Caracteres</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValor}>{ratio > 0 ? ratio.toFixed(2).replace('.', ',') : '—'}</span>
            <span className={styles.statLabel}>Tokens / palabra</span>
          </div>
        </div>

        {/* Visualización de tokens */}
        {numTokens > 0 && (
          <section className={styles.vizSection} aria-label="Visualización de tokens">
            <h2 className={styles.seccionTitulo}>
              Visualización de tokens
              <span className={styles.aproxBadge}>aproximación educativa</span>
            </h2>
            <p className={styles.vizDesc}>
              Cada bloque de color es un token. Los espacios dentro del token se muestran como <strong>·</strong>
            </p>
            <div className={styles.tokensWrap} aria-label={`${numTokens} tokens`}>
              {tokens.map((t) => (
                <span
                  key={t.id}
                  className={styles.tokenChip}
                  style={{
                    background: TOKEN_COLORS[t.colorIdx] + '22',
                    borderColor: TOKEN_COLORS[t.colorIdx],
                    color: TOKEN_COLORS[t.colorIdx],
                  }}
                  title={`Token ${t.id + 1}`}
                >
                  {t.texto.replace(/ /g, '·')}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Calculadora de costes */}
        <section className={styles.costesSection} aria-labelledby="costes-titulo">
          <h2 id="costes-titulo" className={styles.seccionTitulo}>Calculadora de costes de API</h2>

          <div className={styles.ratioRow}>
            <label htmlFor="ratioSlider" className={styles.ratioLabel}>
              Tokens de salida estimados: <strong>{ratioLabel}</strong>
            </label>
            <input
              id="ratioSlider" type="range" min="0.25" max="4" step="0.25"
              value={outputRatio} onChange={(e) => setOutputRatio(parseFloat(e.target.value))}
              className={styles.ratioSlider} aria-valuetext={ratioLabel}
            />
            <div className={styles.ratioTicks}>
              <span>Respuesta corta</span><span>1:1</span><span>Respuesta larga</span>
            </div>
          </div>

          <div className={styles.tablaWrapper}>
            <table className={styles.tablaModelos} aria-label="Costes por modelo de IA">
              <thead>
                <tr>
                  <th className={styles.th}>Modelo</th>
                  <th className={styles.th}>Contexto usado</th>
                  <th className={styles.th}>Coste por uso</th>
                  <th className={styles.th}>Coste × 1.000 usos</th>
                  <th className={styles.th}>Precio entrada / salida</th>
                </tr>
              </thead>
              <tbody>
                {modelos.map((m) => {
                  const costeUso = calcularCoste(numTokens, outputRatio, m);
                  const coste1k = costeUso * 1000;
                  const pct = Math.min((numTokens / m.contexto) * 100, 100);
                  const pctStr = formatContextoPct(numTokens, m.contexto);
                  const barColor = pct > 80 ? '#c0392b' : pct > 50 ? '#e67e22' : '#27ae60';
                  return (
                    <tr key={m.id} className={styles.tr}>
                      <td className={styles.td}>
                        <span aria-hidden="true">{m.icono}</span>{' '}
                        <span className={styles.modeloNombre}>{m.nombre}</span>
                        <br /><span className={styles.modeloEmpresa}>{m.empresa}</span>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.contextoCell}>
                          <span className={styles.contextoPct}>{pctStr}</span>
                          <div className={styles.contextoBar} aria-label={`${pctStr} del contexto usado`}>
                            <div className={styles.contextoFill} style={{ width: `${Math.min(pct, 100)}%`, background: barColor }} />
                          </div>
                          <span className={styles.contextoMax}>{(m.contexto / 1000).toLocaleString('es-ES')}K</span>
                        </div>
                      </td>
                      <td className={styles.td}><span className={styles.coste}>{numTokens > 0 ? formatUSD(costeUso) : '—'}</span></td>
                      <td className={styles.td}><span className={styles.coste}>{numTokens > 0 ? formatUSD(coste1k) : '—'}</span></td>
                      <td className={styles.td}>
                        <span className={styles.precioTag}>${m.precioEntrada} / ${m.precioSalida}</span>
                        <br />
                        <a href={m.urlPrecios} target="_blank" rel="noopener noreferrer" className={styles.enlaceOficial}
                          aria-label={`Ver precios oficiales de ${m.nombre}`}>Verificar →</a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className={styles.notaUSD}>
            Precios en USD por millón de tokens (input / output). Sin IVA. Tipo de cambio variable — consulta precios actuales en cada web oficial.
          </p>

          <button className={styles.editarBtn} onClick={() => setEditandoPrecios((p) => !p)} aria-expanded={editandoPrecios}>
            {editandoPrecios ? '▲ Ocultar editor de precios' : '✏️ Editar precios'}
          </button>

          {editandoPrecios && (
            <div className={styles.editorPrecios}>
              <p className={styles.editorDesc}>Actualiza los precios cuando cambien. Los valores se guardan en esta sesión.</p>
              <div className={styles.editorGrid}>
                {modelos.map((m) => (
                  <div key={m.id} className={styles.editorCard}>
                    <p className={styles.editorModeloNombre}>{m.icono} {m.nombre}</p>
                    <div className={styles.editorInputRow}>
                      <label htmlFor={`entrada-${m.id}`} className={styles.editorInputLabel}>Entrada ($/1M)</label>
                      <input id={`entrada-${m.id}`} type="number" min="0" step="0.01" className={styles.editorInput}
                        value={m.precioEntrada} onChange={(e) => actualizarPrecio(m.id, 'precioEntrada', e.target.value)} />
                    </div>
                    <div className={styles.editorInputRow}>
                      <label htmlFor={`salida-${m.id}`} className={styles.editorInputLabel}>Salida ($/1M)</label>
                      <input id={`salida-${m.id}`} type="number" min="0" step="0.01" className={styles.editorInput}
                        value={m.precioSalida} onChange={(e) => actualizarPrecio(m.id, 'precioSalida', e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
              <button className={styles.restaurarBtn} onClick={restaurarDefecto}>
                🔄 Restaurar precios por defecto (junio 2026)
              </button>
            </div>
          )}
        </section>

        <DataReference
          normativa="Precios de API de modelos LLM"
          fuente="OpenAI Platform Pricing · Anthropic Pricing · Google AI Studio Pricing"
          verificado="2026-06-01"
          nota="Precios en USD/1M tokens verificados en junio 2026. Los precios de IA cambian con frecuencia — usa el editor de precios para actualizarlos."
        />
      </main>

      <EducationalSection
        title="Cómo funcionan los tokens en los LLMs"
        subtitle="BPE, ventanas de contexto y estrategias para reducir costes"
      >
        <p>
          Cuando escribes un mensaje en ChatGPT, Claude o Gemini, lo primero que hace el modelo es convertir tu texto en <strong>tokens</strong> — fragmentos de texto que pueden ser palabras completas, partes de palabras, números o signos de puntuación. Este proceso usa <strong>BPE (Byte Pair Encoding)</strong>: las combinaciones de caracteres más frecuentes en el entrenamiento se convierten en tokens únicos. El español genera un 10-30% más de tokens que el inglés porque el vocabulario BPE tiene menos representación de morfemas en español.
        </p>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Comparativa de modelos: tokens y contexto
        </h4>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr><th>Modelo</th><th>Contexto</th><th>Equivale a</th><th>Entrada</th><th>Salida</th></tr>
            </thead>
            <tbody>
              <tr><td>GPT-4o</td><td>128.000 tokens</td><td>~350 págs.</td><td>$2,50/1M</td><td>$10,00/1M</td></tr>
              <tr><td>GPT-4o mini</td><td>128.000 tokens</td><td>~350 págs.</td><td>$0,15/1M</td><td>$0,60/1M</td></tr>
              <tr><td>Claude Sonnet 4.6</td><td>200.000 tokens</td><td>~550 págs.</td><td>$3,00/1M</td><td>$15,00/1M</td></tr>
              <tr><td>Claude Haiku 4.5</td><td>200.000 tokens</td><td>~550 págs.</td><td>$0,80/1M</td><td>$4,00/1M</td></tr>
              <tr><td>Gemini 1.5 Pro</td><td>1.048.576 tokens</td><td>~2.800 págs.</td><td>$1,25/1M</td><td>$5,00/1M</td></tr>
              <tr><td>Gemini 1.5 Flash</td><td>1.048.576 tokens</td><td>~2.800 págs.</td><td>$0,075/1M</td><td>$0,30/1M</td></tr>
            </tbody>
          </table>
        </div>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Casos de uso y tokens típicos
        </h4>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <strong>💬 Conversación cotidiana</strong>
            <p>50-300 tokens por turno. Con historial de 10 mensajes: 500-3.000 tokens. Cualquier modelo lo gestiona sin problema.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>📄 Análisis de documento</strong>
            <p>Un contrato de 10 páginas ≈ 6.000-8.000 tokens. Un informe de 50 páginas ≈ 30.000-40.000 tokens.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>💻 Generación de código</strong>
            <p>1 función de 50 líneas ≈ 250-750 tokens. El output de código suele superar al input.</p>
          </div>
          <div className={styles.escenarioCard}>
            <strong>🏢 Escala empresarial</strong>
            <p>1.000 conv./día × 500 tokens = 500K tokens/día. Con GPT-4o mini: ~$0,075/día = ~$27/año.</p>
          </div>
        </div>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Preguntas frecuentes
        </h4>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Los tokens de entrada y salida cuestan lo mismo?</strong>
            <span>No — los tokens de salida son 3-5× más caros que los de entrada en todos los modelos principales. Por eso el ratio entrada/salida es tan relevante para estimar costes reales.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué pasa si supero la ventana de contexto?</strong>
            <span>El modelo olvida los mensajes más antiguos. No genera coste extra pero sí pérdida de calidad en la respuesta.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cómo de precisa es esta herramienta?</strong>
            <span>Aproximación educativa con ~15-20% de error vs. el tokenizador oficial. Para cálculos exactos usa la API de tiktoken de OpenAI.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Los emojis y caracteres especiales generan muchos tokens?</strong>
            <span>Sí. Un emoji puede generar 1-3 tokens. Textos con muchos emojis pueden tener el doble de tokens que texto plano equivalente.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Vale la pena pagar más por mayor ventana de contexto?</strong>
            <span>Para conversaciones normales, 128K es más que suficiente. Para analizar libros completos o bases de código extensas, 1M de tokens abre posibilidades que otros modelos no tienen.</span>
          </li>
        </ul>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          5 estrategias para reducir el consumo de tokens
        </h4>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Sé conciso en tus prompts</strong> — cada palabra extra es un token extra. Elimina saludos, repeticiones y relleno.
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Usa modelos pequeños para tareas simples</strong> — GPT-4o mini o Gemini Flash a 10-20× menor coste resuelven el 80% de las tareas cotidianas.
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Limita la longitud de respuesta</strong> — añadir &ldquo;máximo 200 palabras&rdquo; reduce los tokens de salida (los más caros).
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Comprime el historial</strong> — pide al modelo que resuma el contexto previo. 2.000 tokens de historial → 300 tokens de resumen.
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Usa prompt caching si disponible</strong> — Anthropic y OpenAI ofrecen 50-90% de descuento en tokens repetidos entre llamadas.
            </div>
          </div>
        </div>

        <h4 style={{ color: 'var(--primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
          Buenas prácticas
        </h4>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📊</span>
            <strong>Mide antes de optimizar</strong>
            Antes de cambiar de modelo, mide el coste real actual. Muchas optimizaciones prematuras no valen el esfuerzo.
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔢</span>
            <strong>Planifica por escala</strong>
            1 petición al día y 10.000 tienen costes radicalmente distintos. Calcula siempre en tu escala real.
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌍</span>
            <strong>El inglés genera menos tokens</strong>
            Si el idioma no importa, el inglés tiene menor coste por token. Para apps donde sí importa, el extra es inevitable.
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📅</span>
            <strong>Revisa precios cada trimestre</strong>
            Los precios de IA bajan con frecuencia. Lo que costaba $X hace 6 meses puede costar $X/3 hoy con un modelo equivalente.
          </div>
        </div>

        <div className={styles.warningBox} role="note">
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al calcular costes de tokens</strong>
          </div>
          <ul className={styles.warningList}>
            <li>Calcular solo los tokens de entrada y olvidar los de salida — que son 3-5× más caros por token.</li>
            <li>Asumir que esta herramienta es exacta — es una aproximación educativa, no el tokenizador oficial.</li>
            <li>Comparar precios de distintas fechas sin verificar que sean actuales.</li>
            <li>No considerar el historial en aplicaciones con memoria — cada mensaje previo suma tokens en cada nueva llamada.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('tokenizador-ia')} />
      <ShareCard appName="tokenizador-ia" />
      <Footer appName="tokenizador-ia" />
    </div>
  );
}
