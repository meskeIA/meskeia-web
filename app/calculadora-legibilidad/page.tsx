'use client';

import { useState, useEffect } from 'react';
import styles from './CalculadoraLegibilidad.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { EducationalSection } from '@/components';
import { formatNumber } from '@/lib';

// Función para contar sílabas en español
function contarSilabas(palabra: string): number {
  palabra = palabra.toLowerCase().trim();
  if (!palabra) return 0;

  // Vocales
  const vocales = 'aeiouáéíóúü';

  // Diptongos (no se separan)
  const diptongos = [
    'ai', 'au', 'ei', 'eu', 'oi', 'ou', 'ui', 'iu',
    'ia', 'ie', 'io', 'ua', 'ue', 'uo',
    'ái', 'áu', 'éi', 'éu', 'ói', 'óu',
    'iá', 'ié', 'ió', 'uá', 'ué', 'uó'
  ];

  let silabas = 0;
  let i = 0;

  while (i < palabra.length) {
    if (vocales.includes(palabra[i])) {
      silabas++;
      // Verificar si es diptongo
      if (i + 1 < palabra.length) {
        const par = palabra.substring(i, i + 2);
        if (diptongos.includes(par)) {
          i++; // Saltar la segunda vocal del diptongo
        }
      }
    }
    i++;
  }

  return Math.max(silabas, 1);
}

// Función para contar palabras
function contarPalabras(texto: string): number {
  const palabras = texto.trim().split(/\s+/).filter(p => p.length > 0);
  return palabras.length;
}

// Función para contar oraciones
function contarOraciones(texto: string): number {
  const oraciones = texto.split(/[.!?]+/).filter(o => o.trim().length > 0);
  return Math.max(oraciones.length, 1);
}

// Función para obtener todas las palabras
function obtenerPalabras(texto: string): string[] {
  return texto.toLowerCase()
    .replace(/[^a-záéíóúüñ\s]/gi, ' ')
    .split(/\s+/)
    .filter(p => p.length > 0);
}

export default function CalculadoraLegibilidadPage() {
  const [texto, setTexto] = useState('');
  const [analisis, setAnalisis] = useState<{
    palabras: number;
    oraciones: number;
    silabas: number;
    promedioSilabasPalabra: number;
    promedioPalabrasOracion: number;
    fleschSzigriszt: number;
    fernandezHuerta: number;
    inflesz: number;
    nivelEducativo: string;
    dificultad: string;
    palabrasLargas: number;
    porcentajeLargas: number;
  } | null>(null);

  useEffect(() => {
    if (texto.trim().length > 20) {
      analizarTexto();
    } else {
      setAnalisis(null);
    }
  }, [texto]);

  const analizarTexto = () => {
    const palabras = contarPalabras(texto);
    const oraciones = contarOraciones(texto);
    const listaPalabras = obtenerPalabras(texto);

    let totalSilabas = 0;
    let palabrasLargas = 0;

    listaPalabras.forEach(palabra => {
      const silabas = contarSilabas(palabra);
      totalSilabas += silabas;
      if (silabas >= 3) palabrasLargas++;
    });

    const promedioSilabasPalabra = palabras > 0 ? totalSilabas / palabras : 0;
    const promedioPalabrasOracion = oraciones > 0 ? palabras / oraciones : 0;

    // Fórmula Flesch-Szigriszt (adaptada al español)
    // IFSZ = 206.835 - 62.3 * (sílabas/palabras) - 1.02 * (palabras/oraciones)
    const fleschSzigriszt = 206.835 - (62.3 * promedioSilabasPalabra) - (1.02 * promedioPalabrasOracion);

    // Fórmula Fernández Huerta (español)
    // P = 206.84 - 60 * (sílabas/palabras) - 1.02 * (palabras/oraciones)
    const fernandezHuerta = 206.84 - (60 * promedioSilabasPalabra) - (1.02 * promedioPalabrasOracion);

    // Escala INFLESZ (simplificada)
    // Usa la fórmula de Szigriszt pero con interpretación diferente
    const inflesz = fleschSzigriszt;

    // Determinar nivel educativo
    let nivelEducativo = '';
    let dificultad = '';

    if (fleschSzigriszt >= 80) {
      nivelEducativo = 'Primaria (6-10 años)';
      dificultad = 'Muy fácil';
    } else if (fleschSzigriszt >= 65) {
      nivelEducativo = 'ESO (11-14 años)';
      dificultad = 'Fácil';
    } else if (fleschSzigriszt >= 50) {
      nivelEducativo = 'Bachillerato (15-18 años)';
      dificultad = 'Normal';
    } else if (fleschSzigriszt >= 35) {
      nivelEducativo = 'Universitario';
      dificultad = 'Algo difícil';
    } else if (fleschSzigriszt >= 20) {
      nivelEducativo = 'Especializado';
      dificultad = 'Difícil';
    } else {
      nivelEducativo = 'Muy especializado';
      dificultad = 'Muy difícil';
    }

    const porcentajeLargas = palabras > 0 ? (palabrasLargas / palabras) * 100 : 0;

    setAnalisis({
      palabras,
      oraciones,
      silabas: totalSilabas,
      promedioSilabasPalabra,
      promedioPalabrasOracion,
      fleschSzigriszt: Math.max(0, Math.min(100, fleschSzigriszt)),
      fernandezHuerta: Math.max(0, Math.min(100, fernandezHuerta)),
      inflesz: Math.max(0, Math.min(100, inflesz)),
      nivelEducativo,
      dificultad,
      palabrasLargas,
      porcentajeLargas
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 65) return styles.facil;
    if (score >= 50) return styles.normal;
    if (score >= 35) return styles.dificil;
    return styles.muyDificil;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Muy fácil';
    if (score >= 65) return 'Fácil';
    if (score >= 50) return 'Normal';
    if (score >= 35) return 'Algo difícil';
    if (score >= 20) return 'Difícil';
    return 'Muy difícil';
  };

  const textoEjemplo = `La inteligencia artificial está transformando nuestra vida diaria. Desde los asistentes virtuales hasta los coches autónomos, esta tecnología avanza a pasos agigantados.

Los expertos predicen que en los próximos años veremos cambios significativos. La automatización llegará a más sectores. Sin embargo, también surgen preocupaciones sobre el empleo y la privacidad.

Es importante que la sociedad se prepare para estos cambios. La educación debe adaptarse. Los gobiernos necesitan crear regulaciones adecuadas. Solo así podremos aprovechar los beneficios de la IA minimizando sus riesgos.`;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Legibilidad</h1>
        <p className={styles.subtitle}>
          Analiza la facilidad de lectura de tus textos en español
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Tu texto</h2>

          <div className={styles.inputGroup}>
            <textarea
              className={styles.textarea}
              placeholder="Pega aquí tu texto para analizar su legibilidad... (mínimo 20 caracteres)"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              rows={12}
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
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.panelTitle}>Análisis de legibilidad</h2>

          {analisis ? (
            <>
              {/* Score principal */}
              <div className={`${styles.mainScore} ${getScoreColor(analisis.fleschSzigriszt)}`}>
                <div className={styles.scoreCircle}>
                  <span className={styles.scoreValue}>{Math.round(analisis.fleschSzigriszt)}</span>
                </div>
                <div className={styles.scoreDetails}>
                  <span className={styles.scoreLabel}>{analisis.dificultad}</span>
                  <span className={styles.scoreNivel}>{analisis.nivelEducativo}</span>
                </div>
              </div>

              {/* Métricas básicas */}
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <span className={styles.metricValue}>{analisis.palabras}</span>
                  <span className={styles.metricLabel}>Palabras</span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricValue}>{analisis.oraciones}</span>
                  <span className={styles.metricLabel}>Oraciones</span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricValue}>{analisis.silabas}</span>
                  <span className={styles.metricLabel}>Sílabas</span>
                </div>
                <div className={styles.metricCard}>
                  <span className={styles.metricValue}>{formatNumber(analisis.promedioPalabrasOracion, 1)}</span>
                  <span className={styles.metricLabel}>Palabras/Oración</span>
                </div>
              </div>

              {/* Índices de legibilidad */}
              <div className={styles.indicesSection}>
                <h3>Índices de legibilidad</h3>

                <div className={styles.indiceItem}>
                  <div className={styles.indiceHeader}>
                    <span className={styles.indiceName}>Flesch-Szigriszt</span>
                    <span className={`${styles.indiceScore} ${getScoreColor(analisis.fleschSzigriszt)}`}>
                      {formatNumber(analisis.fleschSzigriszt, 1)}
                    </span>
                  </div>
                  <div className={styles.indiceBar}>
                    <div
                      className={`${styles.indiceProgress} ${getScoreColor(analisis.fleschSzigriszt)}`}
                      style={{ width: `${analisis.fleschSzigriszt}%` }}
                    />
                  </div>
                  <span className={styles.indiceDesc}>Adaptación española del índice Flesch</span>
                </div>

                <div className={styles.indiceItem}>
                  <div className={styles.indiceHeader}>
                    <span className={styles.indiceName}>Fernández Huerta</span>
                    <span className={`${styles.indiceScore} ${getScoreColor(analisis.fernandezHuerta)}`}>
                      {formatNumber(analisis.fernandezHuerta, 1)}
                    </span>
                  </div>
                  <div className={styles.indiceBar}>
                    <div
                      className={`${styles.indiceProgress} ${getScoreColor(analisis.fernandezHuerta)}`}
                      style={{ width: `${analisis.fernandezHuerta}%` }}
                    />
                  </div>
                  <span className={styles.indiceDesc}>Fórmula específica para español</span>
                </div>

                <div className={styles.indiceItem}>
                  <div className={styles.indiceHeader}>
                    <span className={styles.indiceName}>Escala INFLESZ</span>
                    <span className={`${styles.indiceScore} ${getScoreColor(analisis.inflesz)}`}>
                      {getScoreLabel(analisis.inflesz)}
                    </span>
                  </div>
                  <span className={styles.indiceDesc}>Interpretación para textos sanitarios/divulgativos</span>
                </div>
              </div>

              {/* Análisis adicional */}
              <div className={styles.extraAnalysis}>
                <div className={styles.extraItem}>
                  <span className={styles.extraLabel}>Promedio sílabas/palabra</span>
                  <span className={styles.extraValue}>{formatNumber(analisis.promedioSilabasPalabra, 2)}</span>
                </div>
                <div className={styles.extraItem}>
                  <span className={styles.extraLabel}>Palabras largas (3+ sílabas)</span>
                  <span className={styles.extraValue}>
                    {analisis.palabrasLargas} ({formatNumber(analisis.porcentajeLargas, 1)}%)
                  </span>
                </div>
              </div>

              {/* Sugerencias */}
              <div className={styles.sugerencias}>
                <h4>Recomendaciones</h4>
                <ul>
                  {analisis.promedioPalabrasOracion > 25 && (
                    <li>Tus oraciones son largas (promedio {formatNumber(analisis.promedioPalabrasOracion, 0)}). Intenta dividirlas para mejorar la legibilidad.</li>
                  )}
                  {analisis.porcentajeLargas > 30 && (
                    <li>Tienes muchas palabras largas ({formatNumber(analisis.porcentajeLargas, 0)}%). Usa sinónimos más cortos cuando sea posible.</li>
                  )}
                  {analisis.fleschSzigriszt < 50 && (
                    <li>El texto puede ser difícil para lectores generales. Simplifica si tu audiencia no es especializada.</li>
                  )}
                  {analisis.fleschSzigriszt >= 65 && (
                    <li>Excelente legibilidad. Tu texto es accesible para la mayoría de lectores.</li>
                  )}
                </ul>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>📖</span>
              <p>Escribe o pega un texto de al menos 20 caracteres</p>
            </div>
          )}
        </div>
      </div>

      {/* Guía de interpretación */}
      <div className={styles.guideSection}>
        <h3>Interpretación de la puntuación</h3>
        <div className={styles.guideGrid}>
          <div className={`${styles.guideItem} ${styles.facil}`}>
            <span className={styles.guideRange}>80-100</span>
            <span className={styles.guideLabel}>Muy fácil</span>
            <span className={styles.guideDesc}>Primaria</span>
          </div>
          <div className={`${styles.guideItem} ${styles.facil}`}>
            <span className={styles.guideRange}>65-79</span>
            <span className={styles.guideLabel}>Fácil</span>
            <span className={styles.guideDesc}>ESO</span>
          </div>
          <div className={`${styles.guideItem} ${styles.normal}`}>
            <span className={styles.guideRange}>50-64</span>
            <span className={styles.guideLabel}>Normal</span>
            <span className={styles.guideDesc}>Bachillerato</span>
          </div>
          <div className={`${styles.guideItem} ${styles.dificil}`}>
            <span className={styles.guideRange}>35-49</span>
            <span className={styles.guideLabel}>Algo difícil</span>
            <span className={styles.guideDesc}>Universitario</span>
          </div>
          <div className={`${styles.guideItem} ${styles.muyDificil}`}>
            <span className={styles.guideRange}>20-34</span>
            <span className={styles.guideLabel}>Difícil</span>
            <span className={styles.guideDesc}>Especializado</span>
          </div>
          <div className={`${styles.guideItem} ${styles.muyDificil}`}>
            <span className={styles.guideRange}>0-19</span>
            <span className={styles.guideLabel}>Muy difícil</span>
            <span className={styles.guideDesc}>Muy técnico</span>
          </div>
        </div>
      </div>

      {/* Contenido educativo */}
      <EducationalSection
        title="Aprende sobre legibilidad y comprensión lectora"
        subtitle="Cómo medir y mejorar la claridad de tus textos"
      >
        <div className={styles.educationalContent}>
          <section className={styles.eduSection}>
            <h2>¿Qué es la legibilidad?</h2>
            <p>
              La legibilidad mide lo fácil que resulta leer y comprender un texto.
              No se trata de simplificar el contenido, sino de presentarlo de forma
              clara y accesible para tu audiencia objetivo.
            </p>
            <p>
              Un texto con buena legibilidad reduce el esfuerzo cognitivo del lector,
              aumenta la comprensión y mejora la experiencia de lectura.
            </p>
          </section>

          <section className={styles.eduSection}>
            <h2>Las fórmulas de legibilidad</h2>

            <div className={styles.formulaCard}>
              <h4>Índice Flesch-Szigriszt</h4>
              <p className={styles.formula}>
                IFSZ = 206.835 - 62.3 × (sílabas/palabras) - 1.02 × (palabras/oraciones)
              </p>
              <p>
                Adaptación al español de la fórmula original de Rudolf Flesch.
                Tiene en cuenta las características del español con sus palabras
                generalmente más largas que en inglés.
              </p>
            </div>

            <div className={styles.formulaCard}>
              <h4>Índice Fernández Huerta</h4>
              <p className={styles.formula}>
                P = 206.84 - 60 × (sílabas/palabras) - 1.02 × (palabras/oraciones)
              </p>
              <p>
                Desarrollado específicamente para el español por José Fernández Huerta.
                Ajusta los coeficientes para reflejar mejor las características
                de nuestro idioma.
              </p>
            </div>
          </section>

          <section className={styles.eduSection}>
            <h2>Consejos para mejorar la legibilidad</h2>
            <ul className={styles.tipsList}>
              <li><strong>Oraciones cortas:</strong> Intenta que no superen las 20-25 palabras</li>
              <li><strong>Palabras sencillas:</strong> Usa sinónimos cortos cuando sea posible</li>
              <li><strong>Voz activa:</strong> "El equipo ganó" en vez de "El partido fue ganado"</li>
              <li><strong>Párrafos breves:</strong> 3-4 oraciones máximo por párrafo</li>
              <li><strong>Conectores:</strong> Usa palabras como "además", "sin embargo", "por tanto"</li>
              <li><strong>Evita jerga:</strong> Explica términos técnicos cuando los uses</li>
            </ul>
          </section>

          <section className={styles.eduSection}>
            <h2>Legibilidad recomendada por tipo de contenido</h2>
            <div className={styles.contentTypeGrid}>
              <div className={styles.contentTypeCard}>
                <h4>Blog / Noticias</h4>
                <span className={styles.recommendedScore}>60-70</span>
                <p>Accesible para público general</p>
              </div>
              <div className={styles.contentTypeCard}>
                <h4>Marketing / Ventas</h4>
                <span className={styles.recommendedScore}>65-80</span>
                <p>Muy fácil de leer y persuasivo</p>
              </div>
              <div className={styles.contentTypeCard}>
                <h4>Académico</h4>
                <span className={styles.recommendedScore}>30-50</span>
                <p>Especializado pero claro</p>
              </div>
              <div className={styles.contentTypeCard}>
                <h4>Legal / Médico</h4>
                <span className={styles.recommendedScore}>20-40</span>
                <p>Técnico por necesidad</p>
              </div>
            </div>
          </section>
        </div>
      </EducationalSection>

      <Footer appName="calculadora-legibilidad" />
    </div>
  );
}
