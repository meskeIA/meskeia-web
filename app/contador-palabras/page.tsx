'use client';

import { useState, useMemo } from 'react';
import styles from './ContadorPalabras.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ==================== TIPOS ====================

interface EstadisticasTexto {
  caracteres: number;
  caracteresSinEspacios: number;
  palabras: number;
  frases: number;
  parrafos: number;
  lineas: number;
  tiempoLectura: string;
  tiempoHablado: string;
}

interface PalabraFrecuencia {
  palabra: string;
  frecuencia: number;
  porcentaje: number;
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function ContadorPalabrasPage() {
  const [texto, setTexto] = useState('');
  const [mostrarDensidad, setMostrarDensidad] = useState(false);

  // Calcular estadísticas
  const estadisticas = useMemo((): EstadisticasTexto => {
    if (!texto.trim()) {
      return {
        caracteres: 0,
        caracteresSinEspacios: 0,
        palabras: 0,
        frases: 0,
        parrafos: 0,
        lineas: 0,
        tiempoLectura: '0 seg',
        tiempoHablado: '0 seg',
      };
    }

    // Caracteres
    const caracteres = texto.length;
    const caracteresSinEspacios = texto.replace(/\s/g, '').length;

    // Palabras (separadas por espacios, ignorando múltiples espacios)
    const palabrasArray = texto.trim().split(/\s+/).filter(p => p.length > 0);
    const palabras = palabrasArray.length;

    // Frases (terminan en . ! ? ... considerando abreviaturas comunes)
    const frases = (texto.match(/[.!?]+(?:\s|$)/g) || []).length || (texto.trim() ? 1 : 0);

    // Párrafos (separados por líneas en blanco)
    const parrafos = texto.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || (texto.trim() ? 1 : 0);

    // Líneas
    const lineas = texto.split('\n').length;

    // Tiempo de lectura (200 palabras/minuto promedio)
    const minutosLectura = palabras / 200;
    let tiempoLectura: string;
    if (minutosLectura < 1) {
      tiempoLectura = `${Math.ceil(minutosLectura * 60)} seg`;
    } else if (minutosLectura < 60) {
      const mins = Math.floor(minutosLectura);
      const segs = Math.round((minutosLectura - mins) * 60);
      tiempoLectura = segs > 0 ? `${mins} min ${segs} seg` : `${mins} min`;
    } else {
      const horas = Math.floor(minutosLectura / 60);
      const mins = Math.round(minutosLectura % 60);
      tiempoLectura = `${horas} h ${mins} min`;
    }

    // Tiempo hablado (150 palabras/minuto promedio)
    const minutosHablado = palabras / 150;
    let tiempoHablado: string;
    if (minutosHablado < 1) {
      tiempoHablado = `${Math.ceil(minutosHablado * 60)} seg`;
    } else if (minutosHablado < 60) {
      const mins = Math.floor(minutosHablado);
      const segs = Math.round((minutosHablado - mins) * 60);
      tiempoHablado = segs > 0 ? `${mins} min ${segs} seg` : `${mins} min`;
    } else {
      const horas = Math.floor(minutosHablado / 60);
      const mins = Math.round(minutosHablado % 60);
      tiempoHablado = `${horas} h ${mins} min`;
    }

    return {
      caracteres,
      caracteresSinEspacios,
      palabras,
      frases,
      parrafos,
      lineas,
      tiempoLectura,
      tiempoHablado,
    };
  }, [texto]);

  // Calcular densidad de palabras (top 10)
  const densidadPalabras = useMemo((): PalabraFrecuencia[] => {
    if (!texto.trim()) return [];

    // Palabras a ignorar (stopwords en español)
    const stopwords = new Set([
      'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
      'de', 'del', 'al', 'a', 'en', 'con', 'por', 'para',
      'y', 'e', 'o', 'u', 'que', 'se', 'es', 'son', 'fue',
      'lo', 'le', 'les', 'su', 'sus', 'mi', 'tu', 'nos',
      'como', 'pero', 'si', 'no', 'más', 'ya', 'muy',
      'este', 'esta', 'estos', 'estas', 'ese', 'esa',
      'hay', 'ha', 'han', 'he', 'ser', 'estar', 'tiene',
    ]);

    // Contar frecuencia de palabras
    const palabras = texto
      .toLowerCase()
      .replace(/[^\wáéíóúüñ\s]/g, '')
      .split(/\s+/)
      .filter(p => p.length > 2 && !stopwords.has(p));

    const frecuencias: Record<string, number> = {};
    palabras.forEach(p => {
      frecuencias[p] = (frecuencias[p] || 0) + 1;
    });

    const totalPalabras = palabras.length;

    // Ordenar por frecuencia y tomar top 10
    return Object.entries(frecuencias)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([palabra, frecuencia]) => ({
        palabra,
        frecuencia,
        porcentaje: totalPalabras > 0 ? (frecuencia / totalPalabras) * 100 : 0,
      }));
  }, [texto]);

  // Limpiar texto
  const limpiarTexto = () => {
    setTexto('');
  };

  // Copiar estadísticas
  const copiarEstadisticas = async () => {
    const stats = `Estadísticas del texto:
- Palabras: ${formatNumber(estadisticas.palabras, 0)}
- Caracteres: ${formatNumber(estadisticas.caracteres, 0)}
- Caracteres (sin espacios): ${formatNumber(estadisticas.caracteresSinEspacios, 0)}
- Frases: ${formatNumber(estadisticas.frases, 0)}
- Párrafos: ${formatNumber(estadisticas.parrafos, 0)}
- Líneas: ${formatNumber(estadisticas.lineas, 0)}
- Tiempo de lectura: ${estadisticas.tiempoLectura}
- Tiempo hablado: ${estadisticas.tiempoHablado}`;

    try {
      await navigator.clipboard.writeText(stats);
      alert('Estadísticas copiadas al portapapeles');
    } catch {
      alert('No se pudieron copiar las estadísticas');
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Contador de Palabras</h1>
        <p className={styles.subtitle}>
          Analiza tu texto: palabras, caracteres, tiempo de lectura y más
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <section className={styles.inputPanel}>
          <div className={styles.inputHeader}>
            <h2 className={styles.sectionTitle}>Tu texto</h2>
            <div className={styles.inputActions}>
              <button onClick={limpiarTexto} className={styles.btnSecundario}>
                Limpiar
              </button>
            </div>
          </div>
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribe o pega tu texto aquí para analizar..."
            className={styles.textArea}
            rows={12}
          />
        </section>

        {/* Panel de resultados */}
        <section className={styles.resultsPanel}>
          <div className={styles.resultsHeader}>
            <h2 className={styles.sectionTitle}>Estadísticas</h2>
            <button onClick={copiarEstadisticas} className={styles.btnSecundario}>
              Copiar
            </button>
          </div>

          {/* Estadísticas principales */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{formatNumber(estadisticas.palabras, 0)}</span>
              <span className={styles.statLabel}>Palabras</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{formatNumber(estadisticas.caracteres, 0)}</span>
              <span className={styles.statLabel}>Caracteres</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{formatNumber(estadisticas.caracteresSinEspacios, 0)}</span>
              <span className={styles.statLabel}>Sin espacios</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{formatNumber(estadisticas.frases, 0)}</span>
              <span className={styles.statLabel}>Frases</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{formatNumber(estadisticas.parrafos, 0)}</span>
              <span className={styles.statLabel}>Párrafos</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{formatNumber(estadisticas.lineas, 0)}</span>
              <span className={styles.statLabel}>Líneas</span>
            </div>
          </div>

          {/* Tiempos */}
          <div className={styles.tiemposGrid}>
            <div className={styles.tiempoCard}>
              <span className={styles.tiempoIcon}>📖</span>
              <div className={styles.tiempoInfo}>
                <span className={styles.tiempoLabel}>Tiempo de lectura</span>
                <span className={styles.tiempoValue}>{estadisticas.tiempoLectura}</span>
              </div>
            </div>
            <div className={styles.tiempoCard}>
              <span className={styles.tiempoIcon}>🎤</span>
              <div className={styles.tiempoInfo}>
                <span className={styles.tiempoLabel}>Tiempo hablado</span>
                <span className={styles.tiempoValue}>{estadisticas.tiempoHablado}</span>
              </div>
            </div>
          </div>

          {/* Toggle densidad */}
          <button
            onClick={() => setMostrarDensidad(!mostrarDensidad)}
            className={styles.btnDensidad}
          >
            {mostrarDensidad ? '▼' : '▶'} Densidad de palabras clave
          </button>

          {/* Densidad de palabras */}
          {mostrarDensidad && (
            <div className={styles.densidadPanel}>
              {densidadPalabras.length > 0 ? (
                <div className={styles.densidadLista}>
                  {densidadPalabras.map((item, index) => (
                    <div key={item.palabra} className={styles.densidadItem}>
                      <span className={styles.densidadRank}>{index + 1}</span>
                      <span className={styles.densidadPalabra}>{item.palabra}</span>
                      <span className={styles.densidadFrecuencia}>{item.frecuencia}x</span>
                      <div className={styles.densidadBarContainer}>
                        <div
                          className={styles.densidadBar}
                          style={{ width: `${Math.min(item.porcentaje * 5, 100)}%` }}
                        />
                      </div>
                      <span className={styles.densidadPorcentaje}>
                        {formatNumber(item.porcentaje, 1)}%
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.densidadVacia}>
                  Escribe texto para ver la densidad de palabras clave
                </p>
              )}
              <p className={styles.densidadNota}>
                * Se excluyen palabras comunes (artículos, preposiciones, etc.)
              </p>
            </div>
          )}
        </section>
      </div>

      {/* Info panel */}
      <section className={styles.infoPanel}>
        <h3>Sobre esta herramienta</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🔒</span>
            <div>
              <strong>100% Privado</strong>
              <p>Tu texto nunca sale de tu navegador</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>⚡</span>
            <div>
              <strong>Tiempo real</strong>
              <p>Resultados instantáneos mientras escribes</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>📊</span>
            <div>
              <strong>Análisis SEO</strong>
              <p>Densidad de palabras clave para optimización</p>
            </div>
          </div>
        </div>
      </section>

      <EducationalSection
        title="Guía de escritura efectiva"
        subtitle="Aprende los límites óptimos para cada tipo de contenido, cómo optimizar para SEO y mejorar la legibilidad de tus textos"
      >
        <h3 className={styles.eduTitle}>Longitud óptima por tipo de contenido</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Tipo de contenido</th>
                <th>Palabras ideales</th>
                <th>Caracteres aprox.</th>
                <th>Objetivo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Post de blog (SEO)</td>
                <td>1.500 – 2.500</td>
                <td>10.000 – 17.000</td>
                <td>Posicionamiento Google</td>
              </tr>
              <tr>
                <td>Email de ventas</td>
                <td>150 – 300</td>
                <td>900 – 1.800</td>
                <td>Conversión rápida</td>
              </tr>
              <tr>
                <td>Post de LinkedIn</td>
                <td>300 – 700</td>
                <td>2.000 – 4.500</td>
                <td>Alcance orgánico</td>
              </tr>
              <tr>
                <td>Newsletter</td>
                <td>500 – 800</td>
                <td>3.000 – 5.000</td>
                <td>Retención de lectores</td>
              </tr>
              <tr>
                <td>Artículo de autoridad</td>
                <td>2.500 – 4.000</td>
                <td>17.000 – 27.000</td>
                <td>Backlinks y referencias</td>
              </tr>
              <tr>
                <td>Descripción de producto</td>
                <td>150 – 300</td>
                <td>900 – 2.000</td>
                <td>Conversión en e-commerce</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className={styles.eduTitle}>Casos de uso frecuentes</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>✍️</span>
              <strong>Redacción SEO</strong>
            </div>
            <p className={styles.escenarioDesc}>
              Pega tu artículo y verifica que supera las 1.500 palabras. Revisa la densidad de palabras clave para mantener una distribución natural entre el 1% y el 3%.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>📧</span>
              <strong>Email marketing</strong>
            </div>
            <p className={styles.escenarioDesc}>
              Los emails de ventas efectivos tienen entre 150 y 300 palabras. Usa el contador para asegurarte de ir al grano y maximizar la tasa de apertura.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🎤</span>
              <strong>Discursos y ponencias</strong>
            </div>
            <p className={styles.escenarioDesc}>
              A 150 palabras por minuto habladas, un discurso de 10 minutos necesita unas 1.500 palabras. Usa el tiempo hablado para afinar la duración exacta.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>📱</span>
              <strong>Redes sociales</strong>
            </div>
            <p className={styles.escenarioDesc}>
              X/Twitter limita a 280 caracteres; LinkedIn recorta a 210 antes del botón &quot;ver más&quot;. Usa el contador de caracteres para ajustar antes de publicar.
            </p>
          </div>
        </div>

        <h3 className={styles.eduTitle}>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <strong>¿Cuántas palabras debe tener un post de blog para posicionar?</strong>
            <p>Google premia los contenidos completos: entre 1.500 y 2.500 palabras para artículos informativos. Para competir en nichos muy disputados, los artículos de más de 3.000 palabras tienen ventaja.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cómo se calcula el tiempo de lectura?</strong>
            <p>La velocidad media de lectura en adultos es de 200-250 palabras por minuto. Esta herramienta usa 200 ppm como referencia conservadora. El tiempo hablado usa 150 ppm, el promedio para discursos formales.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Qué es la densidad de palabras clave y cuál es el valor ideal?</strong>
            <p>Es el porcentaje de veces que aparece una palabra clave respecto al total de palabras. El rango óptimo para SEO es 1-3%. Por encima del 5% puede considerarse keyword stuffing y penalizar tu posicionamiento.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cuántas palabras tiene un libro típico?</strong>
            <p>Una novela media tiene entre 70.000 y 100.000 palabras. Los libros de no ficción suelen estar entre 50.000 y 80.000. Un cuento largo ronda las 7.500-17.500 palabras.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Mi texto nunca sale del navegador?</strong>
            <p>Sí, el análisis es 100% local. El texto que pegas en esta herramienta nunca se envía a ningún servidor. Todo el procesamiento ocurre directamente en tu dispositivo.</p>
          </div>
          <div className={styles.faqItem}>
            <strong>¿Cómo mejorar la legibilidad de un texto largo?</strong>
            <p>Divide el texto en párrafos de 3-4 frases, usa subtítulos cada 300 palabras, alterna frases cortas y largas, y evita párrafos de más de 6 líneas en pantalla.</p>
          </div>
        </div>

        <h3 className={styles.eduTitle}>Cómo usar el contador de forma efectiva</h3>
        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Pega o escribe tu texto</strong>
              <p>Copia el contenido desde tu editor (Word, Google Docs, etc.) y pégalo en el área de texto. Las estadísticas se actualizan en tiempo real.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Revisa las estadísticas básicas</strong>
              <p>Comprueba palabras, caracteres y frases. Si estás escribiendo para una plataforma específica, contrasta con la tabla de longitudes óptimas.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Analiza el tiempo de lectura</strong>
              <p>Para artículos web, el tiempo de lectura óptimo es entre 5 y 10 minutos (1.000-2.000 palabras). Para emails, menos de 1 minuto.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Activa la densidad de palabras clave</strong>
              <p>Despliega el panel de densidad para ver qué palabras se repiten más. Verifica que tu keyword principal aparece de forma natural.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Ajusta y copia las estadísticas</strong>
              <p>Usa el botón &quot;Copiar&quot; para exportar las métricas a tu informe o editor. Las estadísticas incluyen todos los datos relevantes para compartir.</p>
            </div>
          </div>
        </div>

        <h3 className={styles.eduTitle}>Consejos para escribir mejor</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>📏</span>
            <strong>Párrafos cortos</strong>
            <p>Limita cada párrafo a 3-4 frases. En móvil, los bloques de texto largos tienen una tasa de abandono muy alta.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>💡</span>
            <strong>Una idea por párrafo</strong>
            <p>Cada párrafo debe desarrollar una sola idea. Si introduces un segundo concepto, empieza párrafo nuevo.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🏷️</span>
            <strong>Subtítulos cada 300 palabras</strong>
            <p>Los subtítulos (H2, H3) mejoran la escaneabilidad del texto y ayudan al SEO al estructurar el contenido.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🎯</span>
            <strong>Variedad en la longitud</strong>
            <p>Alterna frases cortas (impacto) con frases largas (explicación). La monotonía en el ritmo cansa al lector.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>🔍</span>
            <strong>Densidad natural de keywords</strong>
            <p>Usa tu keyword principal en el primer párrafo, en algún subtítulo y de forma natural en el resto. Nunca la fuerces.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon}>✂️</span>
            <strong>Elimina el relleno</strong>
            <p>Cada frase debe aportar valor. Si puedes eliminar una oración sin perder información, elimínala.</p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon}>⚠️</span>
            <strong>Errores comunes al contar palabras</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Confundir caracteres con palabras en límites de plataformas</strong> — X/Twitter y los SMS limitan por caracteres, no por palabras. Un espacio también cuenta.</li>
            <li><strong>Ignorar el recuento real del destino</strong> — Algunas plataformas cuentan los emojis como múltiples caracteres. Verifica siempre en la propia plataforma.</li>
            <li><strong>Obsesionarse con el número</strong> — La longitud óptima es una guía, no una regla. Un artículo de 800 palabras de alta calidad supera a uno de 2.000 con relleno.</li>
            <li><strong>Ignorar la densidad de keywords</strong> — Una densidad por encima del 5% puede activar filtros de spam en email y penalizaciones en Google.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('contador-palabras')} />

      <ShareCard appName="contador-palabras" />
      <Footer appName="contador-palabras" />
    </div>
  );
}
