'use client';

import { useState, useRef, useCallback } from 'react';
import styles from './GeneradorCarruseles.module.css';
import { MeskeiaLogo, Footer, RelatedApps} from '@/components';
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
        <h1 className={styles.title}>📱 Generador de Carruseles</h1>
        <p className={styles.subtitle}>
          Crea slides profesionales para Instagram y LinkedIn
        </p>
      </header>

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
                    onClick={(e) => { e.stopPropagation(); moverSlide(index, 'up'); }}
                    disabled={index === 0}
                    className={styles.slideActionBtn}
                    title="Mover arriba"
                  >↑</button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moverSlide(index, 'down'); }}
                    disabled={index === slides.length - 1}
                    className={styles.slideActionBtn}
                    title="Mover abajo"
                  >↓</button>
                  <button
                    onClick={(e) => { e.stopPropagation(); eliminarSlide(index); }}
                    disabled={slides.length <= 1}
                    className={`${styles.slideActionBtn} ${styles.deleteBtn}`}
                    title="Eliminar slide"
                  >×</button>
                </div>
              </div>
            ))}

            <button
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
                  className={`${styles.plantillaBtn} ${plantillaActiva.id === plantilla.id ? styles.plantillaBtnActive : ''}`}
                  onClick={() => setPlantillaActiva(plantilla)}
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
                onClick={() => setSlideActivo(Math.max(0, slideActivo - 1))}
                disabled={slideActivo === 0}
                className={styles.navBtn}
              >←</button>
              <span>{slideActivo + 1} / {slides.length}</span>
              <button
                onClick={() => setSlideActivo(Math.min(slides.length - 1, slideActivo + 1))}
                disabled={slideActivo === slides.length - 1}
                className={styles.navBtn}
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

      {/* Información de uso */}
      <section className={styles.infoSection}>
        <h2>💡 Consejos para carruseles efectivos</h2>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <h3>📌 Slide 1: Gancho</h3>
            <p>El primer slide debe captar la atención. Usa una pregunta o afirmación impactante.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>📝 Slides 2-9: Contenido</h3>
            <p>Desarrolla tu idea con puntos claros. Máximo 3-4 puntos por slide.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>🎯 Último slide: CTA</h3>
            <p>Termina con una llamada a la acción: &quot;Sígueme&quot;, &quot;Guarda este post&quot;, etc.</p>
          </div>
          <div className={styles.tipCard}>
            <h3>✨ Menos es más</h3>
            <p>Texto grande, frases cortas. El contenido debe leerse en 3-5 segundos por slide.</p>
          </div>
        </div>
      </section>

      <RelatedApps apps={getRelatedApps('generador-carruseles')} />

      <Footer appName="generador-carruseles" />
    </div>
  );
}
