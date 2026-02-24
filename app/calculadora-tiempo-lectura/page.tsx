'use client';

import { useState, useEffect } from 'react';
import styles from './CalculadoraTiempoLectura.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Velocidades de lectura por defecto
const VELOCIDADES = {
  lento: 150,
  normal: 200,
  rapido: 250,
  experto: 300
};

// Velocidad de habla promedio
const VELOCIDAD_HABLA = 150; // palabras por minuto

export default function CalculadoraTiempoLecturaPage() {
  const [texto, setTexto] = useState('');
  const [velocidad, setVelocidad] = useState(200);
  const [analisis, setAnalisis] = useState<{
    palabras: number;
    caracteres: number;
    caracteresConEspacios: number;
    oraciones: number;
    parrafos: number;
    lineas: number;
    tiempoLectura: number;
    tiempoEscucha: number;
    promedioPalabrasOracion: number;
    promedioPalabrasParrafo: number;
    densidad: string;
  } | null>(null);

  useEffect(() => {
    if (texto.trim()) {
      analizarTexto();
    } else {
      setAnalisis(null);
    }
  }, [texto, velocidad]);

  const analizarTexto = () => {
    // Contar palabras
    const palabras = texto.trim().split(/\s+/).filter(p => p.length > 0).length;

    // Contar caracteres
    const caracteres = texto.replace(/\s/g, '').length;
    const caracteresConEspacios = texto.length;

    // Contar oraciones
    const oraciones = texto.split(/[.!?]+/).filter(o => o.trim().length > 0).length || 1;

    // Contar párrafos
    const parrafos = texto.split(/\n\s*\n/).filter(p => p.trim().length > 0).length || 1;

    // Contar líneas
    const lineas = texto.split('\n').filter(l => l.trim().length > 0).length;

    // Calcular tiempos
    const tiempoLectura = palabras / velocidad; // en minutos
    const tiempoEscucha = palabras / VELOCIDAD_HABLA; // en minutos

    // Promedios
    const promedioPalabrasOracion = palabras / oraciones;
    const promedioPalabrasParrafo = palabras / parrafos;

    // Densidad del texto
    let densidad = 'Normal';
    if (promedioPalabrasOracion > 25) densidad = 'Denso';
    else if (promedioPalabrasOracion < 12) densidad = 'Ligero';

    setAnalisis({
      palabras,
      caracteres,
      caracteresConEspacios,
      oraciones,
      parrafos,
      lineas,
      tiempoLectura,
      tiempoEscucha,
      promedioPalabrasOracion,
      promedioPalabrasParrafo,
      densidad
    });
  };

  const formatTiempo = (minutos: number): string => {
    if (minutos < 1) {
      const segundos = Math.round(minutos * 60);
      return `${segundos} seg`;
    } else if (minutos < 60) {
      const mins = Math.floor(minutos);
      const segs = Math.round((minutos - mins) * 60);
      if (segs > 0) {
        return `${mins} min ${segs} seg`;
      }
      return `${mins} min`;
    } else {
      const horas = Math.floor(minutos / 60);
      const mins = Math.round(minutos % 60);
      return `${horas}h ${mins}min`;
    }
  };

  const getTipoContenido = (palabras: number): { tipo: string; emoji: string; descripcion: string } => {
    if (palabras < 300) {
      return { tipo: 'Publicación corta', emoji: '📱', descripcion: 'Ideal para redes sociales o notas rápidas' };
    } else if (palabras < 800) {
      return { tipo: 'Artículo breve', emoji: '📰', descripcion: 'Perfecto para newsletters o posts de blog' };
    } else if (palabras < 1500) {
      return { tipo: 'Artículo estándar', emoji: '📝', descripcion: 'Longitud ideal para SEO y engagement' };
    } else if (palabras < 3000) {
      return { tipo: 'Artículo largo', emoji: '📚', descripcion: 'Contenido profundo, guías completas' };
    } else {
      return { tipo: 'Contenido extenso', emoji: '📖', descripcion: 'Ebooks, whitepapers, documentación' };
    }
  };

  const textoEjemplo = `El marketing de contenidos se ha convertido en una estrategia fundamental para las empresas que buscan conectar con su audiencia de manera significativa. A diferencia de la publicidad tradicional, el content marketing se centra en crear y distribuir contenido valioso, relevante y consistente.

Las estadísticas muestran que las empresas que mantienen un blog activo generan un 67% más de leads que aquellas que no lo hacen. Además, el contenido de calidad mejora significativamente el posicionamiento SEO y ayuda a construir autoridad en el sector.

Para implementar una estrategia efectiva, es crucial conocer a tu audiencia. Esto implica investigar sus necesidades, problemas y preferencias de consumo de contenido. Con esta información, puedes crear piezas que realmente aporten valor y generen engagement.

La consistencia es otro factor clave. Publicar regularmente no solo mantiene a tu audiencia comprometida, sino que también señala a los motores de búsqueda que tu sitio está activo y actualizado. Sin embargo, nunca sacrifiques calidad por cantidad.

Finalmente, medir los resultados es esencial. Analiza métricas como tiempo en página, tasa de rebote, compartidos sociales y conversiones para entender qué funciona y qué necesita mejoras. El marketing de contenidos es un proceso iterativo de mejora continua.`;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Tiempo de Lectura</h1>
        <p className={styles.subtitle}>
          Estima cuánto tardarán tus lectores en consumir tu contenido
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Tu texto</h2>

          <div className={styles.inputGroup}>
            <textarea
              className={styles.textarea}
              placeholder="Pega aquí tu texto para calcular el tiempo de lectura..."
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={14}
            />
            <div className={styles.charInfo}>
              <span>{texto.length} caracteres</span>
              <button
                className={styles.ejemploBtn}
                onClick={() => setTexto(textoEjemplo)}
              >
                Cargar ejemplo
              </button>
            </div>
          </div>

          <div className={styles.velocidadSection}>
            <label className={styles.label}>Velocidad de lectura</label>
            <div className={styles.velocidadOptions}>
              {Object.entries(VELOCIDADES).map(([key, value]) => (
                <button
                  key={key}
                  className={`${styles.velocidadBtn} ${velocidad === value ? styles.active : ''}`}
                  onClick={() => setVelocidad(value)}
                >
                  <span className={styles.velocidadLabel}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                  <span className={styles.velocidadValue}>{value} ppm</span>
                </button>
              ))}
            </div>
            <div className={styles.customVelocidad}>
              <label>Personalizar:</label>
              <input
                type="number"
                min="50"
                max="500"
                value={velocidad}
                onChange={(e) => setVelocidad(Number(e.target.value))}
                className={styles.velocidadInput}
              />
              <span>palabras/min</span>
            </div>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.panelTitle}>Análisis</h2>

          {analisis ? (
            <>
              {/* Tiempo principal */}
              <div className={styles.tiempoCard}>
                <div className={styles.tiempoPrincipal}>
                  <span className={styles.tiempoIcon}>⏱️</span>
                  <div className={styles.tiempoInfo}>
                    <span className={styles.tiempoValor}>{formatTiempo(analisis.tiempoLectura)}</span>
                    <span className={styles.tiempoLabel}>tiempo de lectura</span>
                  </div>
                </div>
                <div className={styles.tiempoSecundario}>
                  <div className={styles.tiempoItem}>
                    <span className={styles.tiempoItemIcon}>🎧</span>
                    <span className={styles.tiempoItemValor}>{formatTiempo(analisis.tiempoEscucha)}</span>
                    <span className={styles.tiempoItemLabel}>escucha (audio)</span>
                  </div>
                </div>
              </div>

              {/* Tipo de contenido */}
              {(() => {
                const tipo = getTipoContenido(analisis.palabras);
                return (
                  <div className={styles.tipoCard}>
                    <span className={styles.tipoEmoji}>{tipo.emoji}</span>
                    <div className={styles.tipoInfo}>
                      <span className={styles.tipoNombre}>{tipo.tipo}</span>
                      <span className={styles.tipoDesc}>{tipo.descripcion}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Estadísticas */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{formatNumber(analisis.palabras, 0)}</span>
                  <span className={styles.statLabel}>Palabras</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{formatNumber(analisis.caracteres, 0)}</span>
                  <span className={styles.statLabel}>Caracteres</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{analisis.oraciones}</span>
                  <span className={styles.statLabel}>Oraciones</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statValue}>{analisis.parrafos}</span>
                  <span className={styles.statLabel}>Párrafos</span>
                </div>
              </div>

              {/* Métricas adicionales */}
              <div className={styles.metricasSection}>
                <h3>Métricas de estructura</h3>
                <div className={styles.metricasList}>
                  <div className={styles.metricaItem}>
                    <span className={styles.metricaLabel}>Caracteres con espacios</span>
                    <span className={styles.metricaValue}>{formatNumber(analisis.caracteresConEspacios, 0)}</span>
                  </div>
                  <div className={styles.metricaItem}>
                    <span className={styles.metricaLabel}>Líneas</span>
                    <span className={styles.metricaValue}>{analisis.lineas}</span>
                  </div>
                  <div className={styles.metricaItem}>
                    <span className={styles.metricaLabel}>Palabras/oración (promedio)</span>
                    <span className={styles.metricaValue}>{formatNumber(analisis.promedioPalabrasOracion, 1)}</span>
                  </div>
                  <div className={styles.metricaItem}>
                    <span className={styles.metricaLabel}>Palabras/párrafo (promedio)</span>
                    <span className={styles.metricaValue}>{formatNumber(analisis.promedioPalabrasParrafo, 1)}</span>
                  </div>
                  <div className={styles.metricaItem}>
                    <span className={styles.metricaLabel}>Densidad del texto</span>
                    <span className={`${styles.metricaValue} ${styles[analisis.densidad.toLowerCase()]}`}>
                      {analisis.densidad}
                    </span>
                  </div>
                </div>
              </div>

              {/* Badge para copiar */}
              <div className={styles.badgeSection}>
                <h3>Badge para tu artículo</h3>
                <div className={styles.badgePreview}>
                  <span>⏱️ {Math.ceil(analisis.tiempoLectura)} min de lectura</span>
                </div>
                <button
                  className={styles.copyBtn}
                  onClick={() => {
                    navigator.clipboard.writeText(`⏱️ ${Math.ceil(analisis.tiempoLectura)} min de lectura`);
                  }}
                >
                  Copiar badge
                </button>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>⏱️</span>
              <p>Escribe o pega un texto para calcular el tiempo de lectura</p>
            </div>
          )}
        </div>
      </div>

      {/* Referencia de longitudes */}
      <div className={styles.referenciaSection}>
        <h3>Longitudes recomendadas por tipo de contenido</h3>
        <div className={styles.referenciaGrid}>
          <div className={styles.referenciaCard}>
            <span className={styles.referenciaIcon}>📱</span>
            <h4>Redes Sociales</h4>
            <span className={styles.referenciaPalabras}>50-150 palabras</span>
            <span className={styles.referenciaTiempo}>~30 seg</span>
          </div>
          <div className={styles.referenciaCard}>
            <span className={styles.referenciaIcon}>📧</span>
            <h4>Email / Newsletter</h4>
            <span className={styles.referenciaPalabras}>200-500 palabras</span>
            <span className={styles.referenciaTiempo}>1-2 min</span>
          </div>
          <div className={styles.referenciaCard}>
            <span className={styles.referenciaIcon}>📝</span>
            <h4>Blog Post</h4>
            <span className={styles.referenciaPalabras}>800-1500 palabras</span>
            <span className={styles.referenciaTiempo}>4-7 min</span>
          </div>
          <div className={styles.referenciaCard}>
            <span className={styles.referenciaIcon}>📚</span>
            <h4>Guía Completa</h4>
            <span className={styles.referenciaPalabras}>2000-3000 palabras</span>
            <span className={styles.referenciaTiempo}>10-15 min</span>
          </div>
          <div className={styles.referenciaCard}>
            <span className={styles.referenciaIcon}>📖</span>
            <h4>Ebook / Whitepaper</h4>
            <span className={styles.referenciaPalabras}>5000+ palabras</span>
            <span className={styles.referenciaTiempo}>25+ min</span>
          </div>
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="Optimiza la longitud de tu contenido"
        subtitle="Estrategias para mejorar el engagement según el tiempo de lectura"
      >
        <div className={styles.educationalContent}>
          <section className={styles.eduSection}>
            <h2>¿Por qué importa el tiempo de lectura?</h2>
            <p>
              El tiempo de lectura es una métrica crucial para el engagement. Estudios muestran
              que los artículos con indicador de tiempo visible tienen hasta un 40% más de
              lecturas completas. Los usuarios aprecian saber cuánto tiempo invertirán antes
              de empezar.
            </p>
            <div className={styles.factGrid}>
              <div className={styles.factCard}>
                <span className={styles.factValue}>200</span>
                <span className={styles.factLabel}>PPM promedio adultos</span>
              </div>
              <div className={styles.factCard}>
                <span className={styles.factValue}>7 min</span>
                <span className={styles.factLabel}>Longitud óptima blog</span>
              </div>
              <div className={styles.factCard}>
                <span className={styles.factValue}>+40%</span>
                <span className={styles.factLabel}>Más lecturas con badge</span>
              </div>
            </div>
          </section>

          <section className={styles.eduSection}>
            <h2>Velocidades de lectura</h2>
            <p>La velocidad de lectura varía según la persona y el tipo de contenido:</p>
            <ul className={styles.tipsList}>
              <li><strong>100-150 PPM:</strong> Lectura cuidadosa, contenido técnico o estudiar</li>
              <li><strong>200-250 PPM:</strong> Lectura normal, artículos y noticias</li>
              <li><strong>300-400 PPM:</strong> Lectura rápida, escaneo de contenido</li>
              <li><strong>400+ PPM:</strong> Lectura veloz (requiere práctica)</li>
            </ul>
          </section>

          <section className={styles.eduSection}>
            <h2>Consejos para optimizar tu contenido</h2>
            <ul className={styles.tipsList}>
              <li><strong>Usa subtítulos:</strong> Permiten escanear el contenido rápidamente</li>
              <li><strong>Párrafos cortos:</strong> 3-4 oraciones máximo mejoran la legibilidad</li>
              <li><strong>Listas y viñetas:</strong> Facilitan la absorción de información</li>
              <li><strong>Imágenes relevantes:</strong> Rompen el texto y mantienen la atención</li>
              <li><strong>Resumen inicial:</strong> Da contexto antes de profundizar</li>
              <li><strong>CTA claro:</strong> Indica al lector qué hacer después</li>
            </ul>
          </section>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-tiempo-lectura')} />

      <ShareCard appName="calculadora-tiempo-lectura" />
      <Footer appName="calculadora-tiempo-lectura" />
    </div>
  );
}
