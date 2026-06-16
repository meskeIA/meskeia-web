'use client';

import { useState, useRef, useCallback } from 'react';
import styles from './GeneradorCarruseles.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Tipos
interface Slide {
  id: string;
  titulo: string;
  subtitulo: string;
  texto: string;
  numeracion: boolean;
}

interface Plantilla {
  id: string;
  nombre: string;
  fondoColor: string;
  fondoGradiente?: string;
  textoColor: string;
  accentColor: string;
  estilo: 'minimalista' | 'bold' | 'gradiente' | 'elegante' | 'vibrante';
}

// Plantillas predefinidas
const PLANTILLAS: Plantilla[] = [
  {
    id: 'minimalista',
    nombre: 'Minimalista',
    fondoColor: '#FFFFFF',
    textoColor: '#1A1A1A',
    accentColor: '#2E86AB',
    estilo: 'minimalista',
  },
  {
    id: 'oscuro',
    nombre: 'Oscuro Elegante',
    fondoColor: '#1A1A1A',
    textoColor: '#FFFFFF',
    accentColor: '#48A9A6',
    estilo: 'elegante',
  },
  {
    id: 'gradiente-azul',
    nombre: 'Gradiente Azul',
    fondoColor: '#2E86AB',
    fondoGradiente: 'linear-gradient(135deg, #2E86AB 0%, #48A9A6 100%)',
    textoColor: '#FFFFFF',
    accentColor: '#FFFFFF',
    estilo: 'gradiente',
  },
  {
    id: 'bold-naranja',
    nombre: 'Bold Naranja',
    fondoColor: '#FF6B35',
    fondoGradiente: 'linear-gradient(135deg, #FF6B35 0%, #F7C59F 100%)',
    textoColor: '#FFFFFF',
    accentColor: '#1A1A1A',
    estilo: 'bold',
  },
  {
    id: 'vibrante',
    nombre: 'Vibrante',
    fondoColor: '#6366F1',
    fondoGradiente: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)',
    textoColor: '#FFFFFF',
    accentColor: '#FCD34D',
    estilo: 'vibrante',
  },
];

// Slide inicial vacío
const crearSlideVacio = (): Slide => ({
  id: crypto.randomUUID(),
  titulo: '',
  subtitulo: '',
  texto: '',
  numeracion: true,
});

export default function GeneradorCarruselesPage() {
  // Estado
  const [slides, setSlides] = useState<Slide[]>([
    { ...crearSlideVacio(), titulo: 'Tu título aquí', subtitulo: 'Subtítulo opcional', texto: '• Punto 1\n• Punto 2\n• Punto 3' },
  ]);
  const [slideActivo, setSlideActivo] = useState(0);
  const [plantillaActiva, setPlantillaActiva] = useState<Plantilla>(PLANTILLAS[0]);
  const [mostrarNumeracion, setMostrarNumeracion] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  const slideRef = useRef<HTMLDivElement>(null);

  // Funciones de gestión de slides
  const agregarSlide = useCallback(() => {
    if (slides.length >= 10) return;
    const nuevoSlide = crearSlideVacio();
    setSlides(prev => [...prev, nuevoSlide]);
    setSlideActivo(slides.length);
  }, [slides.length]);

  const eliminarSlide = useCallback((index: number) => {
    if (slides.length <= 1) return;
    setSlides(prev => prev.filter((_, i) => i !== index));
    if (slideActivo >= slides.length - 1) {
      setSlideActivo(Math.max(0, slides.length - 2));
    }
  }, [slides.length, slideActivo]);

  const actualizarSlide = useCallback((campo: keyof Slide, valor: string | boolean) => {
    setSlides(prev => prev.map((slide, i) =>
      i === slideActivo ? { ...slide, [campo]: valor } : slide
    ));
  }, [slideActivo]);

  const moverSlide = useCallback((fromIndex: number, direction: 'up' | 'down') => {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= slides.length) return;

    const newSlides = [...slides];
    [newSlides[fromIndex], newSlides[toIndex]] = [newSlides[toIndex], newSlides[fromIndex]];
    setSlides(newSlides);
    setSlideActivo(toIndex);
  }, [slides]);

  // Exportar slides como imágenes
  const exportarSlides = useCallback(async () => {
    setExportando(true);
    setMensajeExito('');

    try {
      // Importar html2canvas dinámicamente
      const html2canvas = (await import('html2canvas')).default;

      const imagenes: { blob: Blob; nombre: string }[] = [];

      // Crear un contenedor temporal oculto para renderizar cada slide
      const contenedorTemp = document.createElement('div');
      contenedorTemp.style.position = 'fixed';
      contenedorTemp.style.left = '-9999px';
      contenedorTemp.style.top = '0';
      document.body.appendChild(contenedorTemp);

      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];

        // Crear elemento del slide
        const slideElement = document.createElement('div');
        slideElement.style.width = '1080px';
        slideElement.style.height = '1080px';
        slideElement.style.padding = '80px';
        slideElement.style.boxSizing = 'border-box';
        slideElement.style.display = 'flex';
        slideElement.style.flexDirection = 'column';
        slideElement.style.justifyContent = 'center';
        slideElement.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        slideElement.style.background = plantillaActiva.fondoGradiente || plantillaActiva.fondoColor;
        slideElement.style.color = plantillaActiva.textoColor;
        slideElement.style.position = 'relative';

        // Contenido del slide
        let contenidoHTML = '';

        if (slide.titulo) {
          contenidoHTML += `<h1 style="font-size: 64px; font-weight: 700; margin: 0 0 24px 0; line-height: 1.2;">${slide.titulo}</h1>`;
        }

        if (slide.subtitulo) {
          contenidoHTML += `<h2 style="font-size: 36px; font-weight: 500; margin: 0 0 40px 0; opacity: 0.9;">${slide.subtitulo}</h2>`;
        }

        if (slide.texto) {
          const lineas = slide.texto.split('\n').filter(l => l.trim());
          contenidoHTML += '<div style="font-size: 32px; line-height: 1.8;">';
          lineas.forEach(linea => {
            contenidoHTML += `<p style="margin: 0 0 16px 0;">${linea}</p>`;
          });
          contenidoHTML += '</div>';
        }

        slideElement.innerHTML = contenidoHTML;

        // Numeración si está activa
        if (mostrarNumeracion && slides.length > 1) {
          const numeracion = document.createElement('div');
          numeracion.style.position = 'absolute';
          numeracion.style.bottom = '40px';
          numeracion.style.right = '40px';
          numeracion.style.fontSize = '24px';
          numeracion.style.opacity = '0.7';
          numeracion.textContent = `${i + 1}/${slides.length}`;
          slideElement.appendChild(numeracion);
        }

        contenedorTemp.appendChild(slideElement);

        // Renderizar a canvas
        const canvas = await html2canvas(slideElement, {
          width: 1080,
          height: 1080,
          scale: 1,
          backgroundColor: null,
          logging: false,
        });

        // Convertir a blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png', 1.0);
        });

        imagenes.push({
          blob,
          nombre: `carrusel-slide-${String(i + 1).padStart(2, '0')}.png`,
        });

        contenedorTemp.removeChild(slideElement);
      }

      document.body.removeChild(contenedorTemp);

      // Si es una sola imagen, descargar directamente
      if (imagenes.length === 1) {
        const url = URL.createObjectURL(imagenes[0].blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = imagenes[0].nombre;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        // Múltiples imágenes: crear ZIP
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();

        imagenes.forEach(({ blob, nombre }) => {
          zip.file(nombre, blob);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'carrusel-meskeia.zip';
        a.click();
        URL.revokeObjectURL(url);
      }

      setMensajeExito(`✅ ${imagenes.length} ${imagenes.length === 1 ? 'imagen descargada' : 'imágenes descargadas'} correctamente`);
      setTimeout(() => setMensajeExito(''), 4000);

    } catch (error) {
      console.error('Error al exportar:', error);
      setMensajeExito('❌ Error al exportar. Inténtalo de nuevo.');
      setTimeout(() => setMensajeExito(''), 4000);
    } finally {
      setExportando(false);
    }
  }, [slides, plantillaActiva, mostrarNumeracion]);

  const slideActual = slides[slideActivo];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">📱</span> Generador de Carruseles</h1>
        <p className={styles.subtitle}>
          Crea slides profesionales para Instagram y LinkedIn
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible={true}
        context="generador-carruseles-disclaimer"
      />

      <div className={styles.mainContent}>
        {/* Panel izquierdo: Editor */}
        <div className={styles.editorPanel}>
          <div className={styles.panelHeader}>
            <h2>Editor de Slides</h2>
            <span className={styles.slideCount}>{slides.length}/10 slides</span>
          </div>

          {/* Lista de slides */}
          <div className={styles.slidesList}>
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={`${styles.slideItem} ${index === slideActivo ? styles.slideItemActive : ''}`}
                onClick={() => setSlideActivo(index)}
              >
                <span className={styles.slideNumber}>{index + 1}</span>
                <span className={styles.slidePreviewText}>
                  {slide.titulo || 'Sin título'}
                </span>
                <div className={styles.slideActions}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moverSlide(index, 'up'); }}
                    disabled={index === 0}
                    className={styles.slideActionBtn}
                    title="Mover arriba"
                  >↑</button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moverSlide(index, 'down'); }}
                    disabled={index === slides.length - 1}
                    className={styles.slideActionBtn}
                    title="Mover abajo"
                  >↓</button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); eliminarSlide(index); }}
                    disabled={slides.length <= 1}
                    className={`${styles.slideActionBtn} ${styles.deleteBtn}`}
                    title="Eliminar slide"
                  >×</button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={agregarSlide}
              disabled={slides.length >= 10}
              className={styles.addSlideBtn}
            >
              + Añadir slide
            </button>
          </div>

          {/* Campos de edición */}
          <div className={styles.editFields}>
            <div className={styles.inputGroup}>
              <label htmlFor="titulo">Título</label>
              <input
                id="titulo"
                type="text"
                value={slideActual?.titulo || ''}
                onChange={(e) => actualizarSlide('titulo', e.target.value)}
                placeholder="Escribe el título principal"
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="subtitulo">Subtítulo (opcional)</label>
              <input
                id="subtitulo"
                type="text"
                value={slideActual?.subtitulo || ''}
                onChange={(e) => actualizarSlide('subtitulo', e.target.value)}
                placeholder="Subtítulo o descripción breve"
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="texto">Contenido</label>
              <textarea
                id="texto"
                value={slideActual?.texto || ''}
                onChange={(e) => actualizarSlide('texto', e.target.value)}
                placeholder="• Punto 1&#10;• Punto 2&#10;• Punto 3"
                className={styles.textarea}
                rows={5}
              />
              <span className={styles.hint}>Usa • o - para crear listas</span>
            </div>
          </div>

          {/* Selector de plantilla */}
          <div className={styles.plantillasSection}>
            <h3>Plantilla</h3>
            <div className={styles.plantillasGrid}>
              {PLANTILLAS.map((plantilla) => (
                <button
                  key={plantilla.id}
                  type="button"
                  className={`${styles.plantillaBtn} ${plantillaActiva.id === plantilla.id ? styles.plantillaBtnActive : ''}`}
                  onClick={() => setPlantillaActiva(plantilla)}
                  aria-pressed={plantillaActiva.id === plantilla.id}
                  style={{
                    background: plantilla.fondoGradiente || plantilla.fondoColor,
                    color: plantilla.textoColor,
                  }}
                >
                  <span className={styles.plantillaNombre}>{plantilla.nombre}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Opciones */}
          <div className={styles.opcionesSection}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={mostrarNumeracion}
                onChange={(e) => setMostrarNumeracion(e.target.checked)}
              />
              <span>Mostrar numeración (1/5, 2/5...)</span>
            </label>
          </div>

          {/* Botón de exportar */}
          <button
            type="button"
            onClick={exportarSlides}
            disabled={exportando}
            className={styles.exportBtn}
          >
            {exportando ? '⏳ Generando imágenes...' : '📥 Descargar imágenes PNG'}
          </button>

          {mensajeExito && (
            <div className={styles.mensajeExito}>{mensajeExito}</div>
          )}
        </div>

        {/* Panel derecho: Preview */}
        <div className={styles.previewPanel}>
          <div className={styles.previewHeader}>
            <h2>Vista previa</h2>
            <div className={styles.previewNavigation}>
              <button
                type="button"
                onClick={() => setSlideActivo(Math.max(0, slideActivo - 1))}
                disabled={slideActivo === 0}
                className={styles.navBtn}
                aria-label="Slide anterior"
              >←</button>
              <span>{slideActivo + 1} / {slides.length}</span>
              <button
                type="button"
                onClick={() => setSlideActivo(Math.min(slides.length - 1, slideActivo + 1))}
                disabled={slideActivo === slides.length - 1}
                className={styles.navBtn}
                aria-label="Slide siguiente"
              >→</button>
            </div>
          </div>

          <div className={styles.previewContainer}>
            <div
              ref={slideRef}
              className={styles.slidePreview}
              style={{
                background: plantillaActiva.fondoGradiente || plantillaActiva.fondoColor,
                color: plantillaActiva.textoColor,
              }}
            >
              {slideActual?.titulo && (
                <h1 className={styles.previewTitulo}>{slideActual.titulo}</h1>
              )}

              {slideActual?.subtitulo && (
                <h2 className={styles.previewSubtitulo}>{slideActual.subtitulo}</h2>
              )}

              {slideActual?.texto && (
                <div className={styles.previewTexto}>
                  {slideActual.texto.split('\n').map((linea, i) => (
                    <p key={i}>{linea}</p>
                  ))}
                </div>
              )}

              {mostrarNumeracion && slides.length > 1 && (
                <div className={styles.previewNumeracion}>
                  {slideActivo + 1}/{slides.length}
                </div>
              )}
            </div>
          </div>

          <p className={styles.previewNote}>
            Formato: 1080×1080px (cuadrado) - Ideal para Instagram y LinkedIn
          </p>
        </div>
      </div>

      {/* ========== SECCIÓN EDUCATIVA ========== */}
      <EducationalSection title="📱 Guía completa de carruseles para redes sociales" subtitle="Estrategias, formatos y mejores prácticas para crear carruseles que convierten en Instagram, LinkedIn y TikTok">

        {/* TABLA COMPARATIVA: Plataformas */}
        <section className={styles.eduComparativa}>
          <h2>⚖️ Instagram vs LinkedIn vs TikTok: ¿dónde triunfan los carruseles?</h2>
          <p className={styles.eduIntro}>
            Cada plataforma tiene sus propias reglas de engagement. Los carruseles funcionan diferente según donde los publiques.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Criterio</th>
                  <th>📸 Instagram</th>
                  <th>💼 LinkedIn</th>
                  <th>🎵 TikTok</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Formato ideal</strong></td>
                  <td>1080×1080px (cuadrado)</td>
                  <td>1080×1080px o 1920×1080px</td>
                  <td>1080×1920px (vertical)</td>
                </tr>
                <tr>
                  <td><strong>Nº slides óptimo</strong></td>
                  <td>5-10 slides</td>
                  <td>6-10 slides</td>
                  <td>3-8 slides</td>
                </tr>
                <tr>
                  <td><strong>Texto por slide</strong></td>
                  <td>Mínimo (3-5 palabras)</td>
                  <td>Moderado (1-3 frases)</td>
                  <td>Muy mínimo (1 idea)</td>
                </tr>
                <tr>
                  <td><strong>Tipo de contenido</strong></td>
                  <td>Inspiración, tips de vida, marca personal</td>
                  <td>Consejos profesionales, casos de éxito, datos</td>
                  <td>Tendencias, educación rápida, humor</td>
                </tr>
                <tr>
                  <td><strong>Engagement</strong></td>
                  <td>⭐⭐⭐⭐⭐ Muy alto (guardados + likes)</td>
                  <td>⭐⭐⭐⭐ Alto (comentarios + shares)</td>
                  <td>⭐⭐⭐ Medio (vistas + follows)</td>
                </tr>
                <tr>
                  <td><strong>Mejor hora</strong></td>
                  <td>Martes-Viernes, 9-11h y 18-20h</td>
                  <td>Martes-Jueves, 8-10h y 12-14h</td>
                  <td>Tarde-noche, 19-23h</td>
                </tr>
                <tr>
                  <td><strong>Ideal para</strong></td>
                  <td>Marca personal, lifestyle, e-commerce</td>
                  <td>B2B, consultoría, empleo, networking</td>
                  <td>Gen Z, entretenimiento, viralidad</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* CASOS DE USO */}
        <section className={styles.eduEscenarios}>
          <h2>💼 Casos de uso reales: quién usa carruseles y cómo</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧑‍💼</span>
                <h3>Marca personal de consultor</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Estructura tipo:</strong></p>
                <code>
                  {`Slide 1: "5 errores que cometen mis clientes"\nSlide 2-6: Cada error con solución\nSlide 7: "¿Cuál cometes tú? → Comentario"`}
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> El primer slide genera curiosidad con un problema concreto. Los slides del medio aportan valor real. El último genera interacción. Este formato tiene un 3× más alcance orgánico que las fotos únicas en LinkedIn.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🛒</span>
                <h3>E-commerce de producto</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Estructura tipo:</strong></p>
                <code>
                  {`Slide 1: Foto producto + titular gancho\nSlide 2-4: Beneficios clave (uno por slide)\nSlide 5: Precio + oferta temporal\nSlide 6: "Compra ahora → Link en bio"`}
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Los carruseles de producto en Instagram tienen un CTR 3 veces superior al de las fotos únicas. Mostrar beneficios progresivamente reduce el abandono y aumenta la conversión.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📚</span>
                <h3>Educador / Creador de cursos</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Estructura tipo:</strong></p>
                <code>
                  {`Slide 1: "Aprende X en 60 segundos"\nSlide 2-8: Paso a paso con ejemplos\nSlide 9: Resumen visual\nSlide 10: "Guarda este post para recordarlo"`}
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Los "posts guardados" son la métrica de mayor valor en Instagram. El algoritmo los interpreta como contenido de alta calidad y aumenta su distribución orgánica. Un carrusel educativo bien hecho puede superar los 10.000 guardados.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📊</span>
                <h3>Agencia de marketing</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Estructura tipo:</strong></p>
                <code>
                  {`Slide 1: "Caso de éxito: +340% ventas"\nSlide 2: El problema inicial del cliente\nSlide 3-5: Estrategia aplicada\nSlide 6: Resultados con datos reales\nSlide 7: "¿Quieres lo mismo? → DM"`}
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Los casos de éxito con datos concretos generan credibilidad inmediata. LinkedIn favorece este formato para B2B porque genera conversaciones de calidad. Un carrusel con estadísticas reales puede generar más de 50 solicitudes de contacto.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💡</span>
                <h3>Infoproductor / Coach</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Estructura tipo:</strong></p>
                <code>
                  {`Slide 1: Promesa transformacional\nSlide 2-4: El problema (validar el dolor)\nSlide 5-7: La solución (tu método)\nSlide 8: Prueba social / testimonio\nSlide 9: CTA con urgencia`}
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Esta estructura sigue la fórmula AIDA adaptada al formato carrusel. La validación del problema en los slides iniciales genera identificación emocional, mientras que la prueba social en el penúltimo slide reduce las objeciones antes del CTA.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏢</span>
                <h3>Empresa buscando talento</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p><strong>Estructura tipo:</strong></p>
                <code>
                  {`Slide 1: "¿Por qué trabajar con nosotros?"\nSlide 2: Cultura y valores\nSlide 3: Beneficios + salario\nSlide 4: Testimonio de empleado\nSlide 5: "Únete → Link en bio"`}
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> LinkedIn es la red principal de reclutamiento. Los carruseles de employer branding tienen 5× más interacciones que las publicaciones de texto. Mostrar la cultura real (no solo el salario) atrae candidatos con mayor fit cultural.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.eduFaq}>
          <h2>❓ Preguntas frecuentes sobre carruseles</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>❓ ¿Cuántos slides debe tener un carrusel para maximizar el alcance?</h4>
              <p>
                Para Instagram, el rango óptimo es <strong>6-10 slides</strong>. El algoritmo detecta cuántos usuarios llegan al último slide y lo usa como señal de calidad. Con menos de 5 slides no hay suficiente recorrido; con más de 10 el abandono aumenta. Los carruseles de 7-8 slides suelen tener el mejor equilibrio entre retención y tiempo de lectura.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Pon el CTA en el último slide Y en el segundo (los usuarios que no llegan al final deben ver el CTA igualmente).
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Qué tipo de primer slide genera más clics en &quot;Ver más&quot;?</h4>
              <p>
                Los primeros slides con mayor retención son: <strong>preguntas directas</strong> (&quot;¿Cometes este error?&quot;), <strong>afirmaciones contraintuitivas</strong> (&quot;Lo que te enseñaron sobre marketing está mal&quot;), <strong>listas numéricas</strong> (&quot;5 herramientas que uso cada día&quot;) y <strong>resultados sorprendentes</strong> (&quot;Cómo conseguí 10.000 seguidores en 30 días&quot;). Evita empezar con tu nombre o logo, es el formato menos efectivo.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Dedica el 30% de tu tiempo de creación al primer slide. Es lo único que el algoritmo muestra antes del clic.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Es mejor texto grande o imágenes en los slides?</h4>
              <p>
                Depende de la plataforma. En Instagram, el equilibrio entre diseño visual y texto breve (<strong>3-7 palabras por frase</strong>) funciona mejor. En LinkedIn, el texto más extenso (2-3 frases por slide) genera más credibilidad y comentarios. En ambas plataformas, las fuentes grandes (≥28pt) y el alto contraste son fundamentales porque muchos usuarios leen desde el feed sin ampliar.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Prueba tu carrusel en modo preview de móvil antes de publicar. Si no se lee a 30cm de distancia, el texto es demasiado pequeño.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Cuál es el mejor horario para publicar carruseles?</h4>
              <p>
                En Instagram: <strong>martes y miércoles de 9-11h o 18-21h</strong>. En LinkedIn: <strong>martes a jueves de 8-10h o 12-14h</strong>. Estos horarios coinciden con momentos de navegación pasiva (camino al trabajo, pausa de comida). Sin embargo, la hora óptima varía según tu audiencia específica. Analiza tus propias estadísticas después de 20+ publicaciones para encontrar tu ventana horaria.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Publica con consistencia primero (mismo día/hora cada semana) y luego optimiza la hora basándote en tus datos de reach.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Debo usar la misma plantilla siempre o variar el diseño?</h4>
              <p>
                Usa la <strong>misma plantilla de forma consistente</strong> durante al menos 3-6 meses. El reconocimiento visual de marca (colores, tipografía, estilo) hace que tus seguidores identifiquen tu contenido antes de leer el texto. Las cuentas que varían constantemente de diseño generan una percepción de falta de profesionalidad y reducen la fidelización. Puedes tener 2-3 plantillas predefinidas para distintos tipos de contenido (tips, casos de éxito, anuncios).
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Elige una plantilla que represente tu marca y comprométete a usarla al menos 12 veces antes de evaluar si cambiarla.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Cómo mido si mis carruseles están funcionando bien?</h4>
              <p>
                Las métricas clave para carruseles son: <strong>Tasa de alcance</strong> (impresiones/seguidores, debería superar el 20%), <strong>Slides promedio vistos</strong> (cuántos slides ven de media, objetivo: más del 60% del total), <strong>Guardados</strong> (la métrica más valiosa, indica contenido de referencia) y <strong>Comentarios</strong> (señal de engagement profundo). Evita obsesionarte con los likes, que son la métrica menos valiosa algorítmicamente.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Un carrusel con 50 guardados y 10 comentarios supera ampliamente a uno con 500 likes y 0 interacciones profundas.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Qué resolución debo usar para que las imágenes no se vean pixeladas?</h4>
              <p>
                El estándar para carruseles de Instagram y LinkedIn es <strong>1080×1080px a 72 DPI</strong> (lo que genera esta herramienta). Si publicas desde desktop, puedes usar hasta 2160×2160px. Nunca bajes de 1080px porque Instagram comprime las imágenes al subirlas y la pérdida de calidad es visible. Para formato vertical (Stories-style), usa <strong>1080×1350px</strong> (4:5 ratio).
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> El formato PNG conserva mejor la calidad del texto y los fondos planos. Usa JPEG solo para fotos con gradientes complejos.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h4>❓ ¿Cuántos carruseles debo publicar por semana para crecer?</h4>
              <p>
                La consistencia supera la frecuencia. <strong>1-2 carruseles por semana</strong> publicados de forma consistente durante 6 meses generan más crecimiento que 5 posts por semana durante 1 mes. El algoritmo favorece a las cuentas activas y predecibles. Empieza con una frecuencia que puedas mantener: es mejor comprometerte con 1 carrusel semanal durante un año que quemarte con publicaciones diarias.
              </p>
              <p className={styles.faqTip}>
                💡 <strong>Consejo práctico:</strong> Crea 4-8 carruseles de golpe en una sesión de trabajo y programa su publicación en las próximas semanas.
              </p>
            </div>
          </div>
        </section>

        {/* GUÍA PASO A PASO */}
        <section className={styles.eduGuia}>
          <h2>📋 Cómo crear un carrusel viral en 7 pasos</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Define el objetivo antes de diseñar</h4>
                <p>
                  Decide qué quieres conseguir: más seguidores, más guardados, más ventas o más comentarios. Cada objetivo requiere una estructura diferente. Un carrusel para conseguir seguidores termina con &quot;Sígueme para más&quot;; uno para ventas termina con un link de producto. Sin objetivo claro, el carrusel no convierte.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Escribe el primer slide como un titular de periódico</h4>
                <p>
                  Usa fórmulas probadas: &quot;X formas de...&quot;, &quot;El error que...&quot;, &quot;Por qué deberías...&quot;, &quot;La guía definitiva de...&quot;. El primer slide debe generar una pregunta en la mente del lector que solo se resuelve pasando al siguiente. Dedica el 30% del tiempo de creación a este slide.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Estructura el contenido como una historia</h4>
                <p>
                  Slides 2-3: Contexto o problema. Slides 4-7: Solución con ejemplos concretos. Slide final: CTA claro. Cada slide debe tener UNA sola idea. Si necesitas más de 2 líneas de texto, divide el slide en dos. La progresión debe crear sensación de avance.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Elige una plantilla y no la cambies</h4>
                <p>
                  Selecciona un diseño que represente tu marca. Colores, tipografía y estilo deben ser consistentes con tus otros contenidos. La coherencia visual es más importante que el diseño perfecto. Las cuentas reconocibles crecen más rápido que las creativas pero inconsistentes.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Descarga en formato PNG de alta calidad</h4>
                <p>
                  Usa el botón &quot;Descargar imágenes PNG&quot; para exportar todos los slides en 1080×1080px. Si tienes varios slides, se descarga un ZIP automáticamente. Revisa cada imagen antes de subir para asegurarte de que el texto se lee correctamente en tamaño pequeño.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Sube en el orden correcto y añade pie de foto</h4>
                <p>
                  Al subir el carrusel a Instagram o LinkedIn, respeta el orden exacto de los slides. El pie de foto es SEO para redes: incluye palabras clave naturales, 3-5 hashtags relevantes (no 30 genéricos) y el CTA textual que refuerza el del último slide. Empieza el pie de foto con el texto más importante (se corta tras 125 caracteres).
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h4>Responde todos los comentarios en las primeras 2 horas</h4>
                <p>
                  Los algoritmos de Instagram y LinkedIn amplifican el alcance de publicaciones con alta interacción temprana. Responder comentarios en las primeras 2 horas genera un ciclo positivo: más respuestas → más visibilidad → más comentarios. Incluso un &quot;¡Gracias!&quot; cuenta. Este paso duplica el alcance orgánico en muchos casos.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MEJORES PRÁCTICAS */}
        <section className={styles.eduTips}>
          <h2>✅ 6 mejores prácticas para carruseles de alto rendimiento</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <h4>Usa fuentes sans-serif grandes</h4>
              <p>Mínimo 40px en los slides exportados. En móvil, el 80% de los usuarios lee sin ampliar. Si no se lee cómodo, se pasa de largo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <h4>Contraste de al menos 4.5:1</h4>
              <p>Texto negro sobre blanco o blanco sobre azul meskeIA. Evita texto gris sobre fondo claro: es la queja más frecuente de accesibilidad en redes.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <h4>Una sola idea por slide</h4>
              <p>Si un slide necesita más de 40 palabras, divídelo en dos. La atención en redes dura 1,7 segundos por slide. El mensaje debe captarse de un vistazo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <h4>Activa la numeración (1/5, 2/5...)</h4>
              <p>La numeración reduce el abandono en un 20% porque crea un contrato implícito con el lector: sabe cuánto le queda. Especialmente útil en carruseles largos.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <h4>Termina con un CTA de baja fricción</h4>
              <p>&quot;Guarda este post&quot;, &quot;Etiqueta a alguien que necesite esto&quot; o &quot;Comenta tu experiencia&quot; son CTA efectivos. &quot;Compra ahora&quot; en el último slide de un carrusel educativo es demasiado agresivo.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">✅</span>
              <h4>Reutiliza el carrusel en otras plataformas</h4>
              <p>Un carrusel de Instagram puede adaptarse a LinkedIn (mismo diseño, texto más extenso), a un hilo de Twitter/X, a un artículo de blog o a las diapositivas de una newsletter. Maximiza el retorno por hora de creación.</p>
            </div>
          </div>
        </section>

        {/* WARNING BOX */}
        <section className={styles.eduWarning}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Errores comunes que destruyen el alcance de tus carruseles</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>❌ Primer slide con tu logo grande:</strong> El mayor error de branding. Tu audiencia no se detiene por tu logo, se detiene por el valor que prometes. Pon el logo pequeño (inferior derecha) y el titular grande. Las cuentas que pusieron el titular primero vieron +40% de retención en el primer slide.
              </li>
              <li>
                <strong>❌ Texto demasiado pequeño o bajo contraste:</strong> El 50% de los usuarios no ampliará tu carrusel para leerlo. Si el texto no se ve a 30cm de distancia en pantalla de móvil, pierde el 50% de tu audiencia potencial. Usa fuentes de ≥40px en el archivo exportado.
              </li>
              <li>
                <strong>❌ Último slide con solo el logo:</strong> El slide final es el más valioso y el más desperdiciado. El algoritmo mide cuántos usuarios llegan hasta el final; si el último slide no tiene CTA, hay 0% de conversión después de todo el trabajo previo.
              </li>
              <li>
                <strong>❌ Demasiado texto por slide:</strong> Un párrafo en cada slide convierte el carrusel en un PDF. La regla: si tardas más de 3 segundos en leer el slide, tiene demasiado texto. Divide en dos slides o elimina lo menos relevante.
              </li>
              <li>
                <strong>❌ Publicar sin testear en móvil:</strong> El 94% del consumo en redes es en móvil. Previsualiza siempre en el teléfono antes de publicar. Errores de texto cortado, botones muy pequeños o colores que no se ven bien en pantallas OLED son frecuentes y evitables.
              </li>
              <li>
                <strong>❌ Inconsistencia de diseño entre posts:</strong> Cambiar de plantilla cada semana destruye el reconocimiento de marca. Los seguidores fieles reconocen tu contenido en el feed por el diseño antes de leer. La consistencia durante 3+ meses multiplica la tasa de retención de seguidores.
              </li>
            </ul>
          </div>
        </section>

      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-carruseles')} />

      <ShareCard appName="generador-carruseles" />
      <Footer appName="generador-carruseles" />
    </div>
  );
}
