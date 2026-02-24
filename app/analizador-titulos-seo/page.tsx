'use client';

import { useState, useEffect } from 'react';
import styles from './AnalizadorTitulosSeo.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection, RelatedApps, LegalNotice, ShareCard } from '@/components';
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
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('analizador-titulos-seo')} />

      <ShareCard appName="analizador-titulos-seo" />
      <Footer appName="analizador-titulos-seo" />
    </div>
  );
}
