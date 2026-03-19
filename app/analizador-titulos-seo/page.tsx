'use client';

import { useState, useEffect } from 'react';
import styles from './AnalizadorTitulosSeo.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps, LegalNotice, ShareCard,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Palabras de poder que aumentan CTR
const PALABRAS_PODER = {
  urgencia: ['ahora', 'hoy', 'ya', 'urgente', 'inmediato', 'rápido', 'último', 'limitado'],
  exclusividad: ['exclusivo', 'secreto', 'revelado', 'único', 'especial', 'premium', 'vip'],
  beneficio: ['gratis', 'gratuito', 'fácil', 'simple', 'mejor', 'top', 'definitivo', 'completo'],
  curiosidad: ['descubre', 'aprende', 'conoce', 'sorprendente', 'increíble', 'impresionante'],
  numeros: ['guía', 'tips', 'consejos', 'pasos', 'formas', 'maneras', 'razones', 'trucos'],
  emocionales: ['nuevo', 'probado', 'garantizado', 'esencial', 'imprescindible', 'poderoso']
};

// Palabras negativas o de relleno
const PALABRAS_DEBILES = ['muy', 'bastante', 'algo', 'quizás', 'puede', 'podría', 'tal vez', 'etc'];

export default function AnalizadorTitulosSeoPage() {
  const [titulo, setTitulo] = useState('');
  const [url, setUrl] = useState('https://meskeia.com/ejemplo-articulo/');
  const [analisis, setAnalisis] = useState<{
    longitud: number;
    longitudStatus: 'corto' | 'optimo' | 'largo';
    puntuacion: number;
    palabrasPoder: string[];
    palabrasDebiles: string[];
    tieneNumero: boolean;
    tienePregunta: boolean;
    empiezaMayuscula: boolean;
    tieneGuion: boolean;
    tienePipe: boolean;
    sugerencias: string[];
  } | null>(null);

  useEffect(() => {
    if (titulo.trim()) {
      analizarTitulo();
    } else {
      setAnalisis(null);
    }
  }, [titulo]);

  const analizarTitulo = () => {
    const tituloLower = titulo.toLowerCase();
    const longitud = titulo.length;

    // Estado de longitud
    let longitudStatus: 'corto' | 'optimo' | 'largo' = 'optimo';
    if (longitud < 30) longitudStatus = 'corto';
    else if (longitud > 60) longitudStatus = 'largo';

    // Detectar palabras de poder
    const palabrasPoderEncontradas: string[] = [];
    Object.values(PALABRAS_PODER).flat().forEach(palabra => {
      if (tituloLower.includes(palabra)) {
        palabrasPoderEncontradas.push(palabra);
      }
    });

    // Detectar palabras débiles
    const palabrasDebilesEncontradas: string[] = [];
    PALABRAS_DEBILES.forEach(palabra => {
      if (tituloLower.includes(palabra)) {
        palabrasDebilesEncontradas.push(palabra);
      }
    });

    // Características
    const tieneNumero = /\d/.test(titulo);
    const tienePregunta = titulo.includes('?') ||
      tituloLower.startsWith('cómo') ||
      tituloLower.startsWith('qué') ||
      tituloLower.startsWith('por qué') ||
      tituloLower.startsWith('cuál') ||
      tituloLower.startsWith('cuándo') ||
      tituloLower.startsWith('dónde');
    const empiezaMayuscula = /^[A-ZÁÉÍÓÚÑ]/.test(titulo);
    const tieneGuion = titulo.includes(' - ') || titulo.includes(' – ');
    const tienePipe = titulo.includes(' | ');

    // Calcular puntuación (0-100)
    let puntuacion = 50; // Base

    // Longitud (+/- 15)
    if (longitud >= 50 && longitud <= 60) puntuacion += 15;
    else if (longitud >= 40 && longitud <= 65) puntuacion += 10;
    else if (longitud < 25 || longitud > 70) puntuacion -= 15;
    else puntuacion += 5;

    // Palabras de poder (+20 max)
    puntuacion += Math.min(palabrasPoderEncontradas.length * 5, 20);

    // Palabras débiles (-10 max)
    puntuacion -= Math.min(palabrasDebilesEncontradas.length * 5, 10);

    // Número en título (+10)
    if (tieneNumero) puntuacion += 10;

    // Pregunta (+5)
    if (tienePregunta) puntuacion += 5;

    // Empieza mayúscula (+5)
    if (empiezaMayuscula) puntuacion += 5;

    // Separador marca (+5)
    if (tieneGuion || tienePipe) puntuacion += 5;

    // Limitar entre 0-100
    puntuacion = Math.max(0, Math.min(100, puntuacion));

    // Generar sugerencias
    const sugerencias: string[] = [];

    if (longitud < 30) {
      sugerencias.push('El título es muy corto. Añade más contexto para mejorar el CTR.');
    } else if (longitud > 60) {
      sugerencias.push('El título es muy largo. Google lo cortará en los resultados (~60 caracteres).');
    }

    if (palabrasPoderEncontradas.length === 0) {
      sugerencias.push('Añade palabras de poder como: "definitivo", "fácil", "gratis", "nuevo".');
    }

    if (!tieneNumero) {
      sugerencias.push('Los títulos con números tienen mejor CTR. Ej: "7 consejos", "Top 10".');
    }

    if (!empiezaMayuscula) {
      sugerencias.push('El título debe empezar con mayúscula.');
    }

    if (palabrasDebilesEncontradas.length > 0) {
      sugerencias.push(`Evita palabras débiles: "${palabrasDebilesEncontradas.join('", "')}".`);
    }

    if (!tieneGuion && !tienePipe && longitud > 30) {
      sugerencias.push('Considera añadir tu marca al final: "Título | meskeIA".');
    }

    if (puntuacion >= 80 && sugerencias.length === 0) {
      sugerencias.push('¡Excelente título! Está bien optimizado para SEO.');
    }

    setAnalisis({
      longitud,
      longitudStatus,
      puntuacion,
      palabrasPoder: palabrasPoderEncontradas,
      palabrasDebiles: palabrasDebilesEncontradas,
      tieneNumero,
      tienePregunta,
      empiezaMayuscula,
      tieneGuion,
      tienePipe,
      sugerencias
    });
  };

  const getPuntuacionColor = (puntuacion: number) => {
    if (puntuacion >= 80) return styles.excelente;
    if (puntuacion >= 60) return styles.bueno;
    if (puntuacion >= 40) return styles.mejorable;
    return styles.pobre;
  };

  const getPuntuacionTexto = (puntuacion: number) => {
    if (puntuacion >= 80) return 'Excelente';
    if (puntuacion >= 60) return 'Bueno';
    if (puntuacion >= 40) return 'Mejorable';
    return 'Necesita trabajo';
  };

  const ejemplos = [
    '10 Trucos de SEO que Duplicarán tu Tráfico en 2025',
    'Guía Definitiva de Marketing Digital para Principiantes',
    '¿Cómo Crear una Web Profesional Gratis? Tutorial Completo',
    'Los 7 Errores SEO que Están Matando tu Posicionamiento'
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Analizador de Títulos SEO</h1>
        <p className={styles.subtitle}>
          Optimiza tus title tags para mejorar el CTR en Google
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="technical"
        severity="medium"
        collapsible={true}
        context="analizador-titulos-seo-disclaimer"
      />

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Tu título</h2>

          <div className={styles.inputGroup}>
            <input
              type="text"
              className={styles.inputLarge}
              placeholder="Escribe tu título SEO aquí..."
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={100}
            />
            <div className={styles.charCounter}>
              <span className={analisis?.longitudStatus === 'optimo' ? styles.optimo :
                              analisis?.longitudStatus === 'largo' ? styles.largo : styles.corto}>
                {titulo.length}
              </span>
              <span className={styles.charLimit}>/60 caracteres recomendados</span>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>URL de ejemplo (para vista previa)</label>
            <input
              type="text"
              className={styles.input}
              placeholder="https://tudominio.com/pagina/"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className={styles.ejemplosSection}>
            <span className={styles.sectionLabel}>Ejemplos de títulos optimizados:</span>
            <div className={styles.ejemplosGrid}>
              {ejemplos.map((ej, idx) => (
                <button
                  key={idx}
                  className={styles.ejemploBtn}
                  onClick={() => setTitulo(ej)}
                >
                  {ej.length > 45 ? ej.substring(0, 45) + '...' : ej}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.panelTitle}>Análisis</h2>

          {analisis ? (
            <>
              {/* Puntuación */}
              <div className={`${styles.scoreCard} ${getPuntuacionColor(analisis.puntuacion)}`}>
                <div className={styles.scoreCircle}>
                  <span className={styles.scoreValue}>{analisis.puntuacion}</span>
                  <span className={styles.scoreMax}>/100</span>
                </div>
                <div className={styles.scoreInfo}>
                  <span className={styles.scoreLabel}>{getPuntuacionTexto(analisis.puntuacion)}</span>
                  <span className={styles.scoreDesc}>Puntuación SEO estimada</span>
                </div>
              </div>

              {/* Vista previa SERP */}
              <div className={styles.serpPreview}>
                <span className={styles.serpLabel}>Vista previa en Google</span>
                <div className={styles.serpResult}>
                  <div className={styles.serpTitle}>
                    {titulo.length > 60 ? titulo.substring(0, 57) + '...' : titulo || 'Tu título aquí'}
                  </div>
                  <div className={styles.serpUrl}>{url}</div>
                  <div className={styles.serpDesc}>
                    Esta es una descripción de ejemplo que aparecería debajo de tu título en los resultados de búsqueda de Google...
                  </div>
                </div>
              </div>

              {/* Checklist */}
              <div className={styles.checklist}>
                <div className={`${styles.checkItem} ${analisis.longitudStatus === 'optimo' ? styles.passed : styles.failed}`}>
                  <span className={styles.checkIcon}>{analisis.longitudStatus === 'optimo' ? '✓' : '✗'}</span>
                  <span>Longitud: {analisis.longitud} caracteres
                    {analisis.longitudStatus === 'corto' && ' (muy corto)'}
                    {analisis.longitudStatus === 'largo' && ' (muy largo)'}
                    {analisis.longitudStatus === 'optimo' && ' (óptimo)'}
                  </span>
                </div>
                <div className={`${styles.checkItem} ${analisis.empiezaMayuscula ? styles.passed : styles.failed}`}>
                  <span className={styles.checkIcon}>{analisis.empiezaMayuscula ? '✓' : '✗'}</span>
                  <span>Empieza con mayúscula</span>
                </div>
                <div className={`${styles.checkItem} ${analisis.tieneNumero ? styles.passed : styles.warning}`}>
                  <span className={styles.checkIcon}>{analisis.tieneNumero ? '✓' : '!'}</span>
                  <span>Contiene números {!analisis.tieneNumero && '(recomendado)'}</span>
                </div>
                <div className={`${styles.checkItem} ${analisis.palabrasPoder.length > 0 ? styles.passed : styles.warning}`}>
                  <span className={styles.checkIcon}>{analisis.palabrasPoder.length > 0 ? '✓' : '!'}</span>
                  <span>Palabras de poder: {analisis.palabrasPoder.length > 0 ? analisis.palabrasPoder.join(', ') : 'ninguna detectada'}</span>
                </div>
                <div className={`${styles.checkItem} ${analisis.palabrasDebiles.length === 0 ? styles.passed : styles.failed}`}>
                  <span className={styles.checkIcon}>{analisis.palabrasDebiles.length === 0 ? '✓' : '✗'}</span>
                  <span>Sin palabras débiles {analisis.palabrasDebiles.length > 0 && `(${analisis.palabrasDebiles.join(', ')})`}</span>
                </div>
                <div className={`${styles.checkItem} ${analisis.tienePregunta ? styles.passed : styles.neutral}`}>
                  <span className={styles.checkIcon}>{analisis.tienePregunta ? '✓' : '○'}</span>
                  <span>Formato pregunta {analisis.tienePregunta ? '(detectado)' : '(opcional)'}</span>
                </div>
                <div className={`${styles.checkItem} ${analisis.tieneGuion || analisis.tienePipe ? styles.passed : styles.neutral}`}>
                  <span className={styles.checkIcon}>{analisis.tieneGuion || analisis.tienePipe ? '✓' : '○'}</span>
                  <span>Separador de marca {(analisis.tieneGuion || analisis.tienePipe) ? '(detectado)' : '(opcional)'}</span>
                </div>
              </div>

              {/* Sugerencias */}
              {analisis.sugerencias.length > 0 && (
                <div className={styles.sugerencias}>
                  <h4>Sugerencias de mejora</h4>
                  <ul>
                    {analisis.sugerencias.map((sug, idx) => (
                      <li key={idx}>{sug}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🔍</span>
              <p>Escribe un título para ver el análisis</p>
            </div>
          )}
        </div>
      </div>

      {/* Palabras de poder */}
      <div className={styles.palabrasSection}>
        <h3>Palabras de poder por categoría</h3>
        <div className={styles.palabrasGrid}>
          {Object.entries(PALABRAS_PODER).map(([categoria, palabras]) => (
            <div key={categoria} className={styles.palabraCard}>
              <h4>{categoria.charAt(0).toUpperCase() + categoria.slice(1)}</h4>
              <div className={styles.palabrasTags}>
                {palabras.map((p, idx) => (
                  <span key={idx} className={styles.palabraTag}>{p}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="Aprende a escribir títulos SEO que convierten"
        subtitle="Estrategias probadas para mejorar tu CTR en Google"
      >
        <div className={styles.educationalContent}>
          <section className={styles.eduSection}>
            <h2>¿Por qué importan los títulos SEO?</h2>
            <p>
              El title tag es uno de los factores más importantes para el SEO on-page.
              Es lo primero que ven los usuarios en los resultados de búsqueda y determina
              en gran medida si hacen clic o no en tu resultado.
            </p>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>36%</span>
                <span className={styles.statLabel}>Aumento CTR con números</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>50-60</span>
                <span className={styles.statLabel}>Caracteres óptimos</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statValue}>+20%</span>
                <span className={styles.statLabel}>CTR con palabras de poder</span>
              </div>
            </div>
          </section>

          <section className={styles.eduSection}>
            <h2>Fórmulas de títulos que funcionan</h2>
            <div className={styles.formulasGrid}>
              <div className={styles.formulaCard}>
                <h4>Número + Adjetivo + Keyword + Promesa</h4>
                <p className={styles.formulaExample}>
                  "7 Trucos Sencillos de SEO que Triplicarán tu Tráfico"
                </p>
              </div>
              <div className={styles.formulaCard}>
                <h4>Cómo + Acción + Beneficio</h4>
                <p className={styles.formulaExample}>
                  "Cómo Escribir Títulos SEO que Duplican los Clics"
                </p>
              </div>
              <div className={styles.formulaCard}>
                <h4>Guía + Adjetivo + Tema + Año</h4>
                <p className={styles.formulaExample}>
                  "Guía Completa de Marketing Digital 2025"
                </p>
              </div>
              <div className={styles.formulaCard}>
                <h4>Pregunta + Respuesta Implícita</h4>
                <p className={styles.formulaExample}>
                  "¿Quieres Más Tráfico? Estos 5 Trucos Funcionan"
                </p>
              </div>
            </div>
          </section>

          <section className={styles.eduSection}>
            <h2>Errores comunes a evitar</h2>
            <ul className={styles.errorsList}>
              <li><strong>Títulos demasiado largos:</strong> Google los corta y pierdes contexto importante</li>
              <li><strong>Sin keyword principal:</strong> Google no entenderá de qué trata tu página</li>
              <li><strong>Títulos genéricos:</strong> "Bienvenido" o "Inicio" no aportan valor SEO</li>
              <li><strong>Keyword stuffing:</strong> Repetir la keyword artificialmente es penalizado</li>
              <li><strong>Sin diferenciación:</strong> Tu título debe destacar entre los competidores</li>
            </ul>
          </section>
        </div>

        {/* 1. TABLA COMPARATIVA */}
        <div className={styles.eduSection}>
          <h2>Tabla comparativa: títulos SEO por tipo de página</h2>
          <p>No todos los títulos funcionan igual. Cada tipo de página tiene sus propias reglas y prioridades SEO.</p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo de página</th>
                  <th>Longitud recomendada</th>
                  <th>Estructura ideal</th>
                  <th>Incluir marca</th>
                  <th>Keyword al inicio</th>
                  <th>CTR esperado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Homepage</strong></td>
                  <td>50–60 caracteres</td>
                  <td>Marca + propuesta de valor</td>
                  <td>Sí, al final</td>
                  <td>Opcional</td>
                  <td>Medio-alto (marca conocida)</td>
                </tr>
                <tr>
                  <td><strong>Blog post informativo</strong></td>
                  <td>55–60 caracteres</td>
                  <td>Número + Keyword + Beneficio</td>
                  <td>No obligatorio</td>
                  <td>Sí, posición 1–3</td>
                  <td>Alto con números (+36%)</td>
                </tr>
                <tr>
                  <td><strong>Ficha de producto (e-commerce)</strong></td>
                  <td>50–55 caracteres</td>
                  <td>Producto + atributo + marca</td>
                  <td>Sí, al final</td>
                  <td>Sí, siempre</td>
                  <td>Alto si precio competitivo</td>
                </tr>
                <tr>
                  <td><strong>Categoría (e-commerce)</strong></td>
                  <td>45–60 caracteres</td>
                  <td>Keyword + descriptor + año</td>
                  <td>Opcional</td>
                  <td>Sí, posición 1</td>
                  <td>Medio (competencia alta)</td>
                </tr>
                <tr>
                  <td><strong>Página de servicio</strong></td>
                  <td>50–60 caracteres</td>
                  <td>Servicio + ubicación + beneficio</td>
                  <td>Sí, al final</td>
                  <td>Sí, posición 1–2</td>
                  <td>Alto en búsqueda local</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. CASOS DE USO */}
        <div className={styles.eduSection}>
          <h2>Casos de uso: quién usa este analizador y cómo</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🛒</span>
                <strong>Tienda online (fichas de producto)</strong>
              </div>
              <p>Una tienda de ropa necesita optimizar 300 fichas de producto. Usa el analizador para verificar que cada título incluya el nombre del producto, la talla o color relevante y la marca al final.</p>
              <div className={styles.escenarioExample}>
                Ejemplo: "Zapatillas Running Hombre Ligeras Nike Air | TuTienda"
              </div>
              <div className={styles.escenarioTip}>
                Consejo: mantén la keyword al inicio y la marca al final separada con |
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">✍️</span>
                <strong>Blog de nicho (artículos informativos)</strong>
              </div>
              <p>Un blogger de finanzas personales quiere aumentar el CTR de sus artículos en Google. Prueba distintas variaciones de título con números y palabras de poder para encontrar la combinación ganadora.</p>
              <div className={styles.escenarioExample}>
                Ejemplo: "7 Trucos para Ahorrar 500€ al Mes sin Esfuerzo"
              </div>
              <div className={styles.escenarioTip}>
                Consejo: los títulos con números concretos aumentan el CTR un 36% de media
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📍</span>
                <strong>Negocio local (SEO geolocalizado)</strong>
              </div>
              <p>Una clínica dental en Sevilla quiere aparecer en búsquedas locales. Optimiza sus títulos incluyendo la ciudad y el servicio concreto para mejorar la visibilidad en Google Maps y búsqueda orgánica.</p>
              <div className={styles.escenarioExample}>
                Ejemplo: "Implantes Dentales en Sevilla | Clínica Dental Nombre"
              </div>
              <div className={styles.escenarioTip}>
                Consejo: ciudad + servicio + marca es la estructura más efectiva para SEO local
              </div>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📊</span>
                <strong>Agencia SEO (múltiples clientes)</strong>
              </div>
              <p>Un consultor SEO necesita revisar los títulos de decenas de URLs para varios clientes. Usa el analizador como checklist rápido para detectar títulos duplicados, demasiado largos o sin keyword principal.</p>
              <div className={styles.escenarioExample}>
                Ejemplo de auditoría: detectar todos los títulos &gt; 60 caracteres o con puntuación &lt; 60
              </div>
              <div className={styles.escenarioTip}>
                Consejo: prioriza primero las páginas con más impresiones en Google Search Console
              </div>
            </div>
          </div>
        </div>

        {/* 3. FAQ */}
        <div className={styles.eduSection}>
          <h2>Preguntas frecuentes sobre títulos SEO</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Cuál es la longitud ideal del título SEO?</h4>
              <p>Entre 50 y 60 caracteres, o aproximadamente 580 píxeles de ancho. Google mide el espacio en píxeles, no en caracteres, por lo que letras mayúsculas anchas (como M o W) consumen más espacio. Una buena regla práctica: no superar los 60 caracteres de texto visible.</p>
              <div className={styles.faqTip}>Dato: Google trunca el título con "..." cuando supera ~580px, lo que puede ocultar información clave para el usuario.</div>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué Google reescribe mis títulos?</h4>
              <p>Según estudios de Portent, Google reescribe el 61% de los títulos. Lo hace cuando el título original es demasiado largo, no refleja bien el contenido de la página, contiene keyword stuffing o cuando Google considera que otro texto de la página representa mejor el resultado para una consulta específica.</p>
              <div className={styles.faqTip}>Clave: si Google reescribe tu título, es una señal de que el original no estaba alineado con la intención de búsqueda.</div>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Debo poner la keyword al inicio o al final del título?</h4>
              <p>Al inicio, siempre que sea posible. Las palabras al principio del título reciben más peso en el algoritmo de Google y captan antes la atención del usuario en los resultados de búsqueda. Sin embargo, si la keyword al inicio genera un título forzado o poco natural, es mejor sacrificar la posición por la legibilidad.</p>
              <div className={styles.faqTip}>Excepción: en la homepage, la marca puede ir al inicio si es un nombre conocido (ej. "Zara - Moda Online Mujer y Hombre").</div>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Debo incluir la marca en todos los títulos?</h4>
              <p>No en todos. En páginas internas (blog, producto, servicios) se recomienda incluir la marca al final separada por | o —, especialmente si la marca ya tiene reconocimiento. En páginas con títulos largos cerca del límite de 60 caracteres, omitir la marca es preferible a truncar la keyword principal.</p>
              <div className={styles.faqTip}>Regla práctica: marca al final para páginas internas, marca al inicio solo en la homepage.</div>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cuál es la diferencia entre el title tag y el H1?</h4>
              <p>El title tag aparece en la pestaña del navegador y en los resultados de Google (SERP). El H1 es el titular visible dentro de la página. No tienen que ser idénticos, aunque sí deben ser coherentes. El title tag está optimizado para el CTR en buscadores; el H1 está optimizado para el usuario que ya está en tu página.</p>
              <div className={styles.faqTip}>Buena práctica: el H1 puede ser más largo y descriptivo, el title tag debe ser más conciso y con la keyword al inicio.</div>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo afecta el CTR al posicionamiento en Google?</h4>
              <p>El CTR (Click Through Rate) es una señal de comportamiento del usuario que Google utiliza como factor indirecto de posicionamiento. Un CTR alto indica que los usuarios encuentran relevante tu resultado para esa búsqueda. Aumentar el CTR del 2% al 4% puede mejorar significativamente tu posición, especialmente en posiciones 4-10 donde la competencia es alta.</p>
              <div className={styles.faqTip}>Estrategia: un título bien optimizado puede subir 2-3 posiciones sin ningún cambio técnico en la página.</div>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo escribir títulos para Featured Snippets?</h4>
              <p>Los Featured Snippets (posición 0) responden directamente a preguntas. Para optar a ellos, el título debe formularse como una pregunta o comenzar con "Cómo", "Qué es", "Cuál es", "Por qué". La página debe responder la pregunta de forma concisa en los primeros párrafos. En España, las búsquedas con "qué es" y "cómo" tienen alta tasa de Featured Snippets.</p>
              <div className={styles.faqTip}>Ejemplo efectivo: "¿Qué es el SEO? Guía Completa para Principiantes"</div>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo mido si mi título funciona usando Google Search Console?</h4>
              <p>En Google Search Console (GSC), ve a Rendimiento &gt; Resultados de búsqueda y filtra por la URL de tu página. Observa las impresiones, clics y CTR. Si tienes muchas impresiones pero bajo CTR (menor del 2-3%), el título es el primer elemento a optimizar. Modifica el título, espera 2-4 semanas y compara los datos.</p>
              <div className={styles.faqTip}>Referencia: un CTR superior al 5% para posiciones 1-3 es excelente en mercados hispanohablantes.</div>
            </div>
          </div>
        </div>

        {/* 4. GUÍA PASO A PASO */}
        <div className={styles.eduSection}>
          <h2>Cómo escribir un título SEO perfecto: guía en 7 pasos</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Identifica la keyword principal</h4>
                <p>Investiga qué término busca realmente tu audiencia. Usa Google Search Console, Google Suggest o herramientas como Semrush o Ahrefs. La keyword principal debe aparecer en el título, preferiblemente en los primeros 3 palabras.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Analiza la intención de búsqueda</h4>
                <p>Busca tu keyword en Google y observa los 10 primeros resultados. ¿Son artículos informativos, páginas de compra, comparativas? Tu título debe encajar con la intención dominante o Google no te mostrará para esa búsqueda.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Coloca la keyword al inicio</h4>
                <p>Las primeras palabras del título tienen más peso SEO y captan antes la atención visual del usuario. Si la keyword al inicio genera una frase forzada, reescríbela de forma natural manteniendo la keyword en las primeras 4-5 palabras.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Añade un diferenciador de CTR</h4>
                <p>Incluye un número ("7 técnicas"), un adjetivo de valor ("completo", "definitivo", "gratis"), un año ("2025") o un formato especial ("Guía", "Tutorial", "Checklist"). Estos elementos aumentan el CTR porque destacan visualmente en los resultados de búsqueda.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Controla la longitud</h4>
                <p>Escribe el título y pégalo en este analizador. El objetivo es quedar entre 50 y 60 caracteres. Si es más largo, elimina palabras de relleno ("muy", "bastante", "también"). Si es más corto, añade contexto que aporte valor al usuario.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Añade la marca si el espacio lo permite</h4>
                <p>Si el título tiene menos de 50 caracteres, añade tu marca al final separada por | o —. Esto refuerza el reconocimiento de marca y puede aumentar el CTR si la marca ya tiene autoridad en tu nicho. Si el título ya está al límite, omite la marca.</p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Mide, itera y mejora con GSC</h4>
                <p>Publica el título, espera 2-4 semanas y revisa el CTR en Google Search Console. Si el CTR es bajo (menor del 2%), prueba una variación con diferente número, adjetivo o estructura. El SEO es iteración continua: ningún título es definitivo.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 5. MEJORES PRÁCTICAS */}
        <div className={styles.eduSection}>
          <h2>6 mejores prácticas para títulos SEO de alto rendimiento</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📏</span>
              <h4>55–60 caracteres es el rango dorado</h4>
              <p>Google muestra hasta ~580px de ancho. Los títulos de 55-60 caracteres raramente se truncan y tienen espacio suficiente para incluir keyword, diferenciador y marca. Menos de 40 caracteres desaprovecha el espacio; más de 65 corre riesgo de truncarse.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎯</span>
              <h4>Keyword en posición 1–3 del título</h4>
              <p>Las primeras palabras del título reciben más peso algorítmico en Google. Además, en los resultados de búsqueda el ojo del usuario lee de izquierda a derecha y se detiene en la keyword si coincide con su búsqueda. Moverla al inicio puede aumentar el CTR entre un 10% y 20%.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔢</span>
              <h4>Números y datos concretos aumentan el CTR un 36%</h4>
              <p>Según estudios de Conductor, los títulos con números tienen un CTR un 36% mayor que los títulos sin números. Los números impares (7, 5, 3) funcionan especialmente bien. Evita números redondos genéricos como "10" si puedes ser más específico ("11 técnicas").</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💡</span>
              <h4>Palabras emocionales y de poder</h4>
              <p>Palabras como "definitivo", "secreto", "revelado", "gratis", "fácil" o "probado" activan sesgos cognitivos que aumentan la probabilidad de clic. Úsalas con moderación: 1-2 palabras de poder por título son suficientes; más de 3 puede parecer spam y reducir la credibilidad.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🚫</span>
              <h4>Evita el keyword stuffing a toda costa</h4>
              <p>Repetir la keyword dos o más veces en el mismo título ("Zapatillas Running - Las Mejores Zapatillas Running Baratas") no mejora el posicionamiento y genera una experiencia de usuario negativa. Google puede penalizarlo y reescribir el título automáticamente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧪</span>
              <h4>Test A/B con Google Search Console</h4>
              <p>GSC permite comparar el rendimiento antes y después de cambiar un título. Modifica el título, espera mínimo 28 días (para normalizar variaciones estacionales) y compara CTR e impresiones. En mercados hispanohablantes, los títulos con "España" o la región específica suelen superar a los genéricos.</p>
            </div>
          </div>
        </div>

        {/* 6. WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>6 errores que destruyen tu posicionamiento en Google</h3>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Títulos que se truncan en el SERP:</strong> Si tu título supera los 60 caracteres (~580px), Google lo corta con "...". El usuario no ve el final del título, lo que puede ocultar la keyword secundaria, la marca o el diferenciador de CTR que más convierte. Solución: revisa siempre la vista previa antes de publicar.
            </li>
            <li>
              <strong>Títulos duplicados en todo el sitio:</strong> Tener el mismo title tag en varias páginas confunde a Google sobre qué página debe posicionar para cada keyword. Es uno de los errores más comunes en tiendas con paginación (?page=2, ?page=3) o filtros de categorías. Audita con Screaming Frog o GSC.
            </li>
            <li>
              <strong>Omitir la keyword principal:</strong> El title tag sigue siendo el factor on-page más importante para indicar a Google el tema de tu página. Un título como "Bienvenido a nuestra tienda" no le dice nada ni a Google ni al usuario. La keyword debe aparecer siempre, aunque sea en variante semántica.
            </li>
            <li>
              <strong>Títulos genéricos sin diferenciación:</strong> "Los mejores consejos de marketing" compite contra millones de resultados similares. Sin un elemento diferenciador (número, año, ubicación, formato específico), tu CTR será inferior al promedio del sector, especialmente en posiciones 4-10 donde la competencia visual es máxima.
            </li>
            <li>
              <strong>Keyword stuffing en el título:</strong> Repetir la keyword más de una vez en el mismo título ("Recetas de Cocina Fáciles - Recetas Fáciles Rápidas") no mejora el posicionamiento. Google lo detecta y puede reescribir el título automáticamente por uno más natural, perdiendo así el control sobre lo que se muestra en las SERPs.
            </li>
            <li>
              <strong>Ignorar la intención de búsqueda del usuario:</strong> Si alguien busca "cómo hacer gazpacho" quiere un tutorial, no una tienda. Si tu título de receta dice "Gazpacho Andaluz - Compra Online", Google no te posicionará porque no coincide con la intención. Alinear el título con la intención de búsqueda (informacional, transaccional, navegacional) es más importante que cualquier optimización técnica.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('analizador-titulos-seo')} />

      <ShareCard appName="analizador-titulos-seo" />
      <Footer appName="analizador-titulos-seo" />
    </div>
  );
}
