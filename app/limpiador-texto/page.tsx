'use client';
// @disclaimer: exempt
import { useState, useMemo } from 'react';
import styles from './LimpiadorTexto.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ==================== TIPOS ====================

interface OpcionLimpieza {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function LimpiadorTextoPage() {
  const [textoEntrada, setTextoEntrada] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [opciones, setOpciones] = useState<OpcionLimpieza[]>([
    { id: 'espaciosExtra', nombre: 'Espacios extra', descripcion: 'Reduce múltiples espacios a uno solo', activo: true },
    { id: 'espaciosInicio', nombre: 'Espacios inicio/fin', descripcion: 'Elimina espacios al inicio y fin de líneas', activo: true },
    { id: 'lineasVacias', nombre: 'Líneas vacías', descripcion: 'Elimina líneas en blanco', activo: false },
    { id: 'lineasDuplicadas', nombre: 'Líneas duplicadas', descripcion: 'Elimina líneas repetidas', activo: false },
    { id: 'saltosLinea', nombre: 'Saltos de línea', descripcion: 'Convierte a una sola línea', activo: false },
    { id: 'tabulaciones', nombre: 'Tabulaciones', descripcion: 'Elimina caracteres de tabulación', activo: false },
    { id: 'caracteresEspeciales', nombre: 'Caracteres especiales', descripcion: 'Elimina símbolos y caracteres especiales', activo: false },
    { id: 'numeros', nombre: 'Números', descripcion: 'Elimina todos los dígitos', activo: false },
    { id: 'puntuacion', nombre: 'Puntuación', descripcion: 'Elimina signos de puntuación', activo: false },
    { id: 'emojis', nombre: 'Emojis', descripcion: 'Elimina emojis y símbolos Unicode', activo: false },
    { id: 'html', nombre: 'Etiquetas HTML', descripcion: 'Elimina tags HTML/XML', activo: false },
    { id: 'urls', nombre: 'URLs', descripcion: 'Elimina enlaces http/https', activo: false },
    { id: 'emails', nombre: 'Emails', descripcion: 'Elimina direcciones de correo', activo: false },
  ]);

  // Toggle opción
  const toggleOpcion = (id: string) => {
    setOpciones(opciones.map(op =>
      op.id === id ? { ...op, activo: !op.activo } : op
    ));
  };

  // Seleccionar todas / ninguna
  const seleccionarTodas = () => {
    setOpciones(opciones.map(op => ({ ...op, activo: true })));
  };

  const seleccionarNinguna = () => {
    setOpciones(opciones.map(op => ({ ...op, activo: false })));
  };

  // Aplicar limpieza
  const textoLimpio = useMemo(() => {
    if (!textoEntrada) return '';

    let resultado = textoEntrada;

    opciones.forEach(op => {
      if (!op.activo) return;

      switch (op.id) {
        case 'espaciosExtra':
          resultado = resultado.replace(/ {2,}/g, ' ');
          break;
        case 'espaciosInicio':
          resultado = resultado.split('\n').map(linea => linea.trim()).join('\n');
          break;
        case 'lineasVacias':
          resultado = resultado.split('\n').filter(linea => linea.trim() !== '').join('\n');
          break;
        case 'lineasDuplicadas':
          const lineas = resultado.split('\n');
          const lineasUnicas: string[] = [];
          const vistas = new Set<string>();
          lineas.forEach(linea => {
            const lineaNormalizada = linea.trim().toLowerCase();
            if (!vistas.has(lineaNormalizada)) {
              vistas.add(lineaNormalizada);
              lineasUnicas.push(linea);
            }
          });
          resultado = lineasUnicas.join('\n');
          break;
        case 'saltosLinea':
          resultado = resultado.replace(/\n+/g, ' ').replace(/ {2,}/g, ' ').trim();
          break;
        case 'tabulaciones':
          resultado = resultado.replace(/\t/g, ' ');
          break;
        case 'caracteresEspeciales':
          resultado = resultado.replace(/[^\w\sáéíóúüñÁÉÍÓÚÜÑ.,;:!?¿¡'"()-]/g, '');
          break;
        case 'numeros':
          resultado = resultado.replace(/\d/g, '');
          break;
        case 'puntuacion':
          resultado = resultado.replace(/[.,;:!?¿¡'"()\-–—…]/g, '');
          break;
        case 'emojis':
          resultado = resultado.replace(/[\u{1F600}-\u{1F6FF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]/gu, '');
          break;
        case 'html':
          resultado = resultado.replace(/<[^>]*>/g, '');
          break;
        case 'urls':
          resultado = resultado.replace(/https?:\/\/[^\s]+/g, '');
          break;
        case 'emails':
          resultado = resultado.replace(/[\w.-]+@[\w.-]+\.\w+/g, '');
          break;
      }
    });

    return resultado;
  }, [textoEntrada, opciones]);

  // Estadísticas
  const estadisticas = useMemo(() => {
    const caracteresAntes = textoEntrada.length;
    const caracteresDespues = textoLimpio.length;
    const diferencia = caracteresAntes - caracteresDespues;
    const porcentaje = caracteresAntes > 0 ? (diferencia / caracteresAntes) * 100 : 0;

    return {
      caracteresAntes,
      caracteresDespues,
      diferencia,
      porcentaje,
    };
  }, [textoEntrada, textoLimpio]);

  // Copiar resultado
  const copiarResultado = async () => {
    if (!textoLimpio) return;
    try {
      await navigator.clipboard.writeText(textoLimpio);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Fallback silencioso — el botón no cambia de estado
    }
  };

  // Limpiar todo
  const limpiarTodo = () => {
    setTextoEntrada('');
  };

  // Usar resultado como entrada
  const usarResultado = () => {
    setTextoEntrada(textoLimpio);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Limpiador de Texto</h1>
        <p className={styles.subtitle}>
          Elimina espacios extra, líneas duplicadas, caracteres especiales y más
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel de opciones */}
        <section className={styles.opcionesPanel}>
          <div className={styles.opcionesHeader}>
            <h2 className={styles.sectionTitle}>Opciones de limpieza</h2>
            <div className={styles.opcionesAcciones}>
              <button type="button" onClick={seleccionarTodas} className={styles.btnMini}>
                Todas
              </button>
              <button type="button" onClick={seleccionarNinguna} className={styles.btnMini}>
                Ninguna
              </button>
            </div>
          </div>
          <div className={styles.opcionesGrid}>
            {opciones.map(op => (
              <label key={op.id} className={styles.opcionItem}>
                <input
                  type="checkbox"
                  checked={op.activo}
                  onChange={() => toggleOpcion(op.id)}
                  className={styles.opcionCheckbox}
                />
                <div className={styles.opcionInfo}>
                  <span className={styles.opcionNombre}>{op.nombre}</span>
                  <span className={styles.opcionDesc}>{op.descripcion}</span>
                </div>
              </label>
            ))}
          </div>
        </section>

        {/* Panel de texto */}
        <div className={styles.textosContainer}>
          {/* Entrada */}
          <section className={styles.textoPanel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.sectionTitle}>Texto original</h2>
              <button type="button" onClick={limpiarTodo} className={styles.btnSecundario}>
                Limpiar
              </button>
            </div>
            <textarea
              id="texto-entrada"
              aria-label="Texto original a limpiar"
              value={textoEntrada}
              onChange={(e) => setTextoEntrada(e.target.value)}
              placeholder="Pega o escribe tu texto aquí..."
              className={styles.textArea}
              rows={10}
            />
          </section>

          {/* Estadísticas */}
          {textoEntrada && (
            <div className={styles.statsBar} role="status" aria-live="polite" aria-atomic="true">
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Antes:</span>
                <span className={styles.statValue}>{formatNumber(estadisticas.caracteresAntes, 0)}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Después:</span>
                <span className={styles.statValue}>{formatNumber(estadisticas.caracteresDespues, 0)}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Eliminados:</span>
                <span className={`${styles.statValue} ${styles.statHighlight}`}>
                  {formatNumber(estadisticas.diferencia, 0)} ({formatNumber(estadisticas.porcentaje, 1)}%)
                </span>
              </div>
              <button type="button" onClick={usarResultado} className={styles.btnUsar} aria-label="Usar texto limpio como nueva entrada">
                ↓ Aplicar
              </button>
            </div>
          )}

          {/* Salida */}
          <section className={styles.textoPanel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.sectionTitle}>Texto limpio</h2>
              <button
                type="button"
                onClick={copiarResultado}
                className={styles.btnSecundario}
                aria-label={copiado ? 'Texto copiado al portapapeles' : 'Copiar texto limpio'}
                disabled={!textoLimpio}
              >
                {copiado ? '¡Copiado!' : 'Copiar'}
              </button>
            </div>
            <textarea
              aria-label="Texto limpio resultante"
              value={textoLimpio}
              readOnly
              placeholder="El resultado aparecerá aquí..."
              className={styles.textArea}
              rows={10}
            />
          </section>
        </div>
      </div>

      {/* Info panel */}
      <section className={styles.infoPanel}>
        <h3>Sobre esta herramienta</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon} aria-hidden="true">🔒</span>
            <div>
              <strong>100% Privado</strong>
              <p>Tu texto nunca sale de tu navegador</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon} aria-hidden="true">⚡</span>
            <div>
              <strong>Tiempo real</strong>
              <p>Ve los cambios mientras escribes</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon} aria-hidden="true">🔄</span>
            <div>
              <strong>Múltiples pasadas</strong>
              <p>Aplica el resultado como entrada</p>
            </div>
          </div>
        </div>
      </section>

      <EducationalSection
        title="Aprende sobre Limpieza y Normalización de Texto"
        subtitle="Casos de uso reales, técnicas avanzadas y cuándo aplicar cada opción"
        defaultOpen={false}
      >
        <section>

          {/* SECCIÓN 1: Guía de opciones */}
          <div className={styles.eduComparativaSection}>
            <h3>📊 Guía de Opciones: Cuándo Usar Cada Una</h3>
            <div className={styles.eduInfoGrid}>
              <div className={styles.eduInfoCard}>
                <h4>🧹 Espacios y formato</h4>
                <p><strong>Espacios extra</strong> → texto copiado de Word/PDF con dobles espacios<br />
                <strong>Espacios inicio/fin</strong> → limpiar líneas antes de procesar en código<br />
                <strong>Tabulaciones</strong> → texto exportado de Excel/tablas</p>
              </div>
              <div className={styles.eduInfoCard}>
                <h4>📄 Estructura de líneas</h4>
                <p><strong>Líneas vacías</strong> → compactar texto para conteo de palabras real<br />
                <strong>Líneas duplicadas</strong> → listas de emails, CSV con registros repetidos<br />
                <strong>Saltos de línea</strong> → convertir párrafos a una sola línea para SQL/JSON</p>
              </div>
              <div className={styles.eduInfoCard}>
                <h4>🔣 Caracteres especiales</h4>
                <p><strong>HTML tags</strong> → extraer texto plano de código HTML<br />
                <strong>URLs</strong> → limpiar posts de redes con muchos enlaces<br />
                <strong>Emails</strong> → anonimizar texto antes de compartir</p>
              </div>
              <div className={styles.eduInfoCard}>
                <h4>✂️ Contenido selectivo</h4>
                <p><strong>Números</strong> → extraer solo texto de documentos mixtos<br />
                <strong>Puntuación</strong> → preparar texto para análisis lingüístico/NLP<br />
                <strong>Emojis</strong> → limpiar comentarios de redes para análisis de sentimiento</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: Casos de uso reales */}
          <div className={styles.eduCasosSection}>
            <h3>🎯 Casos de Uso Reales por Tipo de Usuario</h3>
            <div className={styles.eduCasosGrid}>
              <div className={styles.eduCasoCard}>
                <span className={styles.eduCasoIcon}>👨‍💻</span>
                <h4>Desarrolladores</h4>
                <p>Limpiar datos de entrada antes de guardar en base de datos. Eliminar HTML de texto scrapeado. Normalizar CSV exportados de Excel (espacios extra, BOM characters).</p>
              </div>
              <div className={styles.eduCasoCard}>
                <span className={styles.eduCasoIcon}>📊</span>
                <h4>Analistas de datos</h4>
                <p>Preparar corpus de texto para análisis NLP (eliminar puntuación, URLs, emojis). Deduplicar listas de emails o registros. Limpiar respuestas de encuestas abiertas.</p>
              </div>
              <div className={styles.eduCasoCard}>
                <span className={styles.eduCasoIcon}>✍️</span>
                <h4>Escritores y editores</h4>
                <p>Limpiar texto copiado de PDFs con saltos de línea erráticos. Eliminar espacios dobles de borradores. Compactar texto para verificar conteo de palabras real.</p>
              </div>
              <div className={styles.eduCasoCard}>
                <span className={styles.eduCasoIcon}>📱</span>
                <h4>Community managers</h4>
                <p>Limpiar comentarios de redes antes de exportar a Excel. Eliminar emojis de textos para procesamiento. Anonimizar correos en capturas para publicar.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: FAQ */}
          <div className={styles.eduFaqSection}>
            <h3>❓ Preguntas Frecuentes sobre Limpieza de Texto</h3>
            <div className={styles.eduFaqList}>
              <details className={styles.eduFaqItem}>
                <summary className={styles.eduFaqQuestion}>¿En qué orden se aplican las operaciones?</summary>
                <p className={styles.eduFaqAnswer}>Las operaciones se aplican en el orden en que aparecen en la lista de opciones: primero espacios extra, luego espacios inicio/fin, líneas vacías, líneas duplicadas, saltos de línea, tabulaciones, caracteres especiales, números, puntuación, emojis, HTML, URLs y finalmente emails. El orden importa: por ejemplo, eliminar saltos de línea antes que espacios extra puede dejar espacios que luego se limpian correctamente.</p>
              </details>
              <details className={styles.eduFaqItem}>
                <summary className={styles.eduFaqQuestion}>¿Por qué &quot;Caracteres especiales&quot; mantiene tildes y ñ?</summary>
                <p className={styles.eduFaqAnswer}>La expresión regular usada (<code>[^\w\sáéíóúüñÁÉÍÓÚÜÑ.,;:!?¿¡&apos;&quot;()-]</code>) excluye explícitamente las letras con tilde y la ñ porque son caracteres válidos en español. Si se eliminaran, el texto español perdería significado. La opción elimina símbolos menos comunes (@, #, $, ^, ~, etc.) pero preserva el español correcto.</p>
              </details>
              <details className={styles.eduFaqItem}>
                <summary className={styles.eduFaqQuestion}>¿Qué hace exactamente &quot;Líneas duplicadas&quot;?</summary>
                <p className={styles.eduFaqAnswer}>Compara cada línea con las anteriores (normalizada a minúsculas y sin espacios al inicio/fin). Si una línea ya apareció antes, se elimina. El orden del texto se preserva: se mantiene la primera aparición de cada línea. Es útil para listas de emails, usernames o cualquier dato con entradas repetidas.</p>
              </details>
              <details className={styles.eduFaqItem}>
                <summary className={styles.eduFaqQuestion}>¿El texto se guarda o envía a algún servidor?</summary>
                <p className={styles.eduFaqAnswer}>No. Toda la limpieza ocurre localmente en tu navegador con JavaScript puro. El texto nunca sale de tu dispositivo. Puedes usarlo con información confidencial (contratos, datos personales, código fuente propietario) sin riesgo de exposición.</p>
              </details>
              <details className={styles.eduFaqItem}>
                <summary className={styles.eduFaqQuestion}>¿Cómo limpiar texto de un PDF copiado?</summary>
                <p className={styles.eduFaqAnswer}>El texto copiado de PDFs suele tener: (1) guiones de partición de palabras al final de línea (-), (2) saltos de línea dentro de párrafos, (3) espacios dobles. La combinación más efectiva es activar: <strong>Espacios extra + Espacios inicio/fin</strong>. Si los párrafos están partidos en múltiples líneas, añade también <strong>Saltos de línea</strong>, aunque esto fusionará todos los párrafos en uno.</p>
              </details>
            </div>
          </div>

          {/* SECCIÓN 4: Flujo de múltiples pasadas */}
          <div className={styles.eduPasadasSection}>
            <h3>🔄 Técnica de Múltiples Pasadas</h3>
            <p className={styles.eduPasadasIntro}>
              El botón <strong>&quot;↓ Aplicar&quot;</strong> convierte el texto limpio en entrada para una nueva pasada.
              Esto permite encadenar limpiezas complejas:
            </p>
            <div className={styles.eduPasadasSteps}>
              <div className={styles.eduPasadaStep}>
                <span className={styles.eduPasadaNum}>1</span>
                <div>
                  <strong>Pasada 1: Estructura</strong>
                  <p>Activa: Espacios extra + Espacios inicio/fin + Tabulaciones → &quot;↓ Aplicar&quot;</p>
                </div>
              </div>
              <div className={styles.eduPasadaStep}>
                <span className={styles.eduPasadaNum}>2</span>
                <div>
                  <strong>Pasada 2: Contenido</strong>
                  <p>Activa: Líneas vacías + Líneas duplicadas → &quot;↓ Aplicar&quot;</p>
                </div>
              </div>
              <div className={styles.eduPasadaStep}>
                <span className={styles.eduPasadaNum}>3</span>
                <div>
                  <strong>Pasada 3: Datos sensibles</strong>
                  <p>Activa: URLs + Emails → Copiar resultado final</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 5: Tips */}
          <div className={styles.eduTipsSection}>
            <h3>💡 Tips para Limpiezas Profesionales</h3>
            <div className={styles.eduTipsGrid}>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>💾</span>
                <h4>Guarda el original siempre</h4>
                <p>Antes de limpiar texto importante, guarda siempre una copia del original. Las operaciones de limpieza no tienen deshacer y pueden eliminar contenido que necesitarás recuperar.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>🔍</span>
                <h4>Revisa las estadísticas</h4>
                <p>El porcentaje de caracteres eliminados te da una señal de si la limpieza fue razonable. Una reducción de más del 30% suele indicar que se eliminó contenido que quizás no debías.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>⚡</span>
                <h4>Empieza conservador</h4>
                <p>Activa primero solo &quot;Espacios extra + Espacios inicio/fin&quot;. Son las operaciones más seguras. Añade opciones más agresivas (caracteres especiales, puntuación) solo si el resultado previo es insuficiente.</p>
              </div>
              <div className={styles.eduTipCard}>
                <span className={styles.eduTipIcon}>🌐</span>
                <h4>Para NLP y análisis de texto</h4>
                <p>Si preparas texto para modelos de lenguaje o análisis estadístico, la secuencia estándar es: minúsculas (en Conversor de Texto) → sin puntuación → sin números → sin URLs → sin emojis.</p>
              </div>
            </div>
          </div>

          {/* SECCIÓN 6: Warning Box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon}>⚠️</span>
              <h3>Limitaciones y Riesgos de la Limpieza de Texto</h3>
            </div>
            <ul className={styles.warningList}>
              <li><strong>❌ &quot;Caracteres especiales&quot; puede eliminar datos importantes:</strong> Símbolos como @, #, $, &amp; tienen significado funcional en muchos contextos (menciones de Twitter, hashtags, divisas, operadores lógicos). Esta opción elimina todo símbolo no estándar, lo que puede corromper datos estructurados como JSON, XML o código de programación.</li>
              <li><strong>❌ &quot;Líneas duplicadas&quot; no distingue contexto:</strong> Si tu texto tiene dos párrafos que comienzan igual (por ejemplo, en legalese repetitivo), el segundo se elimina aunque sea diferente. La deduplicación es estricta: cualquier línea normalizada idéntica a una anterior se descarta.</li>
              <li><strong>❌ &quot;Saltos de línea&quot; fusiona párrafos:</strong> Convertir a una sola línea elimina la estructura de párrafos. Si después necesitas distinguir dónde empezaba cada párrafo, habrás perdido esa información. Úsalo solo cuando el texto destino es un campo de texto plano sin estructura (como un campo de búsqueda o una variable de código).</li>
              <li><strong>❌ La detección de emails y URLs es aproximada:</strong> Las expresiones regulares usadas capturan la mayoría de formatos, pero pueden dar falsos positivos (eliminar texto que parece email pero no lo es) o falsos negativos (no detectar URLs con formatos inusuales). Para procesamiento de producción, usa librerías especializadas.</li>
            </ul>
          </div>

        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('limpiador-texto')} />

      <ShareCard appName="limpiador-texto" />
      <Footer appName="limpiador-texto" />
    </div>
  );
}
