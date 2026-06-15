'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef } from 'react';
import styles from './LupaDigital.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type FiltroTipo = 'ninguno' | 'alto-contraste' | 'invertir' | 'escala-grises' | 'sepia';

export default function LupaDigitalPage() {
  const [activo, setActivo] = useState(false);
  const [zoom, setZoom] = useState(2);
  const [filtro, setFiltro] = useState<FiltroTipo>('ninguno');
  const [brillo, setBrillo] = useState(100);
  const [contraste, setContraste] = useState(100);
  const [linterna, setLinterna] = useState(false);
  const [permisoCamara, setPermisoCamara] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [camaraActual, setCamaraActual] = useState<'user' | 'environment'>('environment');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const iniciarCamara = async () => {
    try {
      // Detener stream anterior si existe
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: camaraActual,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setPermisoCamara('granted');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setActivo(true);

      // Intentar activar linterna si está solicitada
      if (linterna) {
        toggleLinterna(true);
      }
    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      setPermisoCamara('denied');
    }
  };

  const detenerCamara = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setActivo(false);
    setLinterna(false);
  };

  const toggleLinterna = async (estado: boolean) => {
    if (!streamRef.current) return;

    const track = streamRef.current.getVideoTracks()[0];
    if (track && 'getCapabilities' in track) {
      const capabilities = track.getCapabilities() as MediaTrackCapabilities & { torch?: boolean };
      if (capabilities.torch) {
        try {
          await track.applyConstraints({
            advanced: [{ torch: estado } as MediaTrackConstraintSet]
          });
          setLinterna(estado);
        } catch {
          console.log('Linterna no disponible');
        }
      }
    }
  };

  const cambiarCamara = async () => {
    const nuevaCamara = camaraActual === 'user' ? 'environment' : 'user';
    setCamaraActual(nuevaCamara);
    if (activo) {
      // Reiniciar con nueva cámara
      detenerCamara();
      setTimeout(() => iniciarCamara(), 100);
    }
  };

  useEffect(() => {
    return () => {
      detenerCamara();
    };
  }, []);

  // Reiniciar cámara al cambiar
  useEffect(() => {
    if (activo) {
      iniciarCamara();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camaraActual]);

  const getFiltroStyle = (): string => {
    const filtros: string[] = [];

    filtros.push(`brightness(${brillo}%)`);
    filtros.push(`contrast(${contraste}%)`);

    switch (filtro) {
      case 'alto-contraste':
        filtros.push('contrast(200%)');
        break;
      case 'invertir':
        filtros.push('invert(100%)');
        break;
      case 'escala-grises':
        filtros.push('grayscale(100%)');
        break;
      case 'sepia':
        filtros.push('sepia(100%)');
        break;
    }

    return filtros.join(' ');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Lupa Digital</h1>
        <p className={styles.subtitle}>
          Amplía texto y objetos con la cámara
        </p>
      </header>

      <LegalNotice />

      {/* Visor de la lupa */}
      <div className={styles.lupaContainer}>
        {!activo ? (
          <div className={styles.lupaPlaceholder} role="status" aria-live="polite">
            {permisoCamara === 'denied' ? (
              <div role="alert">
                <span aria-hidden="true" className={styles.placeholderIcon}>🚫</span>
                <p>Permiso de cámara denegado</p>
                <p className={styles.placeholderSubtexto}>
                  Activa la cámara en la configuración del navegador
                </p>
              </div>
            ) : (
              <>
                <span aria-hidden="true" className={styles.placeholderIcon}>🔍</span>
                <p>Pulsa para activar la lupa</p>
              </>
            )}
          </div>
        ) : null}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={styles.lupaVideo}
          style={{
            display: activo ? 'block' : 'none',
            transform: `scale(${zoom})`,
            filter: getFiltroStyle(),
          }}
        />

        {/* Controles sobre el video */}
        {activo && (
          <div className={styles.controlesOverlay}>
            <span className={styles.zoomIndicador}>{zoom}x</span>
          </div>
        )}
      </div>

      {/* Botón principal */}
      <div className={styles.controlPrincipal}>
        <button
          type="button"
          className={`${styles.btnPrincipal} ${activo ? styles.activo : ''}`}
          onClick={activo ? detenerCamara : iniciarCamara}
          aria-pressed={activo}
        >
          {activo ? <><span aria-hidden="true">⏹️</span> Detener</> : <><span aria-hidden="true">🔍</span> Activar lupa</>}
        </button>

        {activo && (
          <button type="button" className={styles.btnCambiarCamara} onClick={cambiarCamara}>
            <span aria-hidden="true">🔄</span> Cambiar cámara
          </button>
        )}
      </div>

      {/* Control de zoom */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Zoom: {zoom}x</h3>
        <div className={styles.zoomControl}>
          <button
            type="button"
            className={styles.zoomBtn}
            onClick={() => setZoom(Math.max(1, zoom - 0.5))}
            disabled={zoom <= 1}
          >
            −
          </button>
          <input
            type="range"
            min="1"
            max="5"
            step="0.5"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className={styles.zoomSlider}
          />
          <button
            type="button"
            className={styles.zoomBtn}
            onClick={() => setZoom(Math.min(5, zoom + 0.5))}
            disabled={zoom >= 5}
          >
            +
          </button>
        </div>
        <div className={styles.zoomPresets}>
          {[1, 1.5, 2, 3, 4, 5].map(z => (
            <button
              type="button"
              key={z}
              className={`${styles.zoomPresetBtn} ${zoom === z ? styles.zoomPresetActivo : ''}`}
              onClick={() => setZoom(z)}
              aria-pressed={zoom === z}
            >
              {z}x
            </button>
          ))}
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Filtros de accesibilidad</h3>
        <div className={styles.filtrosGrid}>
          {[
            { id: 'ninguno' as FiltroTipo, nombre: 'Normal', icono: '🔍' },
            { id: 'alto-contraste' as FiltroTipo, nombre: 'Alto contraste', icono: '◐' },
            { id: 'invertir' as FiltroTipo, nombre: 'Invertir', icono: '🔄' },
            { id: 'escala-grises' as FiltroTipo, nombre: 'Grises', icono: '⬛' },
            { id: 'sepia' as FiltroTipo, nombre: 'Sepia', icono: '📜' },
          ].map(f => (
            <button
              type="button"
              key={f.id}
              className={`${styles.filtroBtn} ${filtro === f.id ? styles.filtroActivo : ''}`}
              onClick={() => setFiltro(f.id)}
              aria-pressed={filtro === f.id}
            >
              <span aria-hidden="true" className={styles.filtroIcono}>{f.icono}</span>
              <span className={styles.filtroNombre}>{f.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Ajustes de imagen */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Ajustes de imagen</h3>

        <div className={styles.ajuste}>
          <label><span aria-hidden="true">☀️</span> Brillo: {brillo}%</label>
          <input
            type="range"
            min="50"
            max="200"
            value={brillo}
            onChange={(e) => setBrillo(parseInt(e.target.value))}
            className={styles.ajusteSlider}
          />
        </div>

        <div className={styles.ajuste}>
          <label><span aria-hidden="true">◐</span> Contraste: {contraste}%</label>
          <input
            type="range"
            min="50"
            max="200"
            value={contraste}
            onChange={(e) => setContraste(parseInt(e.target.value))}
            className={styles.ajusteSlider}
          />
        </div>

        {activo && (
          <button
            type="button"
            className={`${styles.btnLinterna} ${linterna ? styles.linternaActiva : ''}`}
            onClick={() => toggleLinterna(!linterna)}
            aria-pressed={linterna}
          >
            {linterna ? <><span aria-hidden="true">🔦</span> Linterna ON</> : <><span aria-hidden="true">💡</span> Activar linterna</>}
          </button>
        )}

        <button
          type="button"
          className={styles.btnReset}
          onClick={() => {
            setBrillo(100);
            setContraste(100);
            setFiltro('ninguno');
          }}
        >
          <span aria-hidden="true">↺</span> Restablecer ajustes
        </button>
      </div>

      {/* Usos */}
      <div className={styles.usosSection}>
        <h3>Usos comunes</h3>
        <div className={styles.usosGrid}>
          <div className={styles.usoItem}>📖 Leer letra pequeña</div>
          <div className={styles.usoItem}>💊 Ver prospectos</div>
          <div className={styles.usoItem}>🏷️ Leer etiquetas</div>
          <div className={styles.usoItem}>🔧 Trabajos de precisión</div>
          <div className={styles.usoItem}>📱 Ver componentes</div>
          <div className={styles.usoItem}>♿ Accesibilidad</div>
        </div>
      </div>

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Quieres aprender más sobre la Lupa Digital?"
        subtitle="Niveles de zoom, casos de uso, preguntas frecuentes y consejos prácticos"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section>
          <h2>Niveles de zoom: ¿cuál usar en cada situación?</h2>
          <p>
            La calidad de imagen varía según el zoom aplicado. Elige el nivel adecuado
            para cada tarea para obtener el mejor resultado posible.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Nivel de zoom</th>
                  <th>Campo visual</th>
                  <th>Uso recomendado</th>
                  <th>Detalle visible</th>
                  <th>Limitación principal</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🔍 2x</td>
                  <td>Amplio</td>
                  <td>Leer etiquetas y texto normal</td>
                  <td>Letras de 6–8 pt</td>
                  <td>Poco útil para detalles muy finos</td>
                </tr>
                <tr>
                  <td>🔍 4x</td>
                  <td>Medio</td>
                  <td>Manuales, mapas, prospectos</td>
                  <td>Letras de 4–5 pt, líneas finas</td>
                  <td>Pulso leve causa desenfoque</td>
                </tr>
                <tr>
                  <td>🔍 8x</td>
                  <td>Reducido</td>
                  <td>Componentes electrónicos, marcas pequeñas</td>
                  <td>Detalles de 1–2 mm</td>
                  <td>Requiere apoyo del teléfono para estabilidad</td>
                </tr>
                <tr>
                  <td>🔍 16x</td>
                  <td>Muy reducido</td>
                  <td>Trabajos de precisión, grabados</td>
                  <td>Detalles sub-milimétricos</td>
                  <td>Pixelado notable, solo con buena iluminación</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section>
          <h2>¿Para quién es útil la lupa digital?</h2>
          <p>
            Cualquier persona puede beneficiarse, pero estos son los tres perfiles que
            más la usan en el día a día.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👴</span>
                <h4>Persona mayor con letra pequeña</h4>
              </div>
              <p className={styles.escenarioExample}>
                Necesita leer las instrucciones de un medicamento, la fecha de caducidad
                de un producto o el texto de un contrato impreso en cuerpo 8.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: usa el zoom 3x–4x con brillo al 130 % para leer etiquetas
                de supermercado sin esfuerzo visual.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🗺️</span>
                <h4>Leer texto fino en mapas o manuales</h4>
              </div>
              <p className={styles.escenarioExample}>
                Mapas de papel, planos de montaje, instrucciones de electrodomésticos
                o la letra pequeña de un contrato impreso a doble cara.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: activa el filtro de alto contraste para que el texto negro
                sobre fondo claro sea más legible con zoom alto.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🖼️</span>
                <h4>Ver detalles en fotos o documentos</h4>
              </div>
              <p className={styles.escenarioExample}>
                Ampliar una fotografía impresa, revisar la firma en un documento, o
                examinar el detalle de una pintura sin necesidad de escáner.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: congela la imagen con el botón de pausa y tómate el tiempo
                que necesites para leer sin mover el teléfono.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section>
          <h2>Preguntas frecuentes</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <details>
                <summary>¿La lupa digital tiene la misma calidad que una lupa física?</summary>
                <p>
                  No exactamente. Una lupa óptica de calidad ofrece imagen nítida sin
                  degradación. La lupa digital amplía mediante software, por lo que a
                  partir de cierto zoom (normalmente 5x–8x) la imagen puede pixelarse.
                  Para usos cotidianos (leer etiquetas, manuales) la calidad es más que
                  suficiente y tiene la ventaja de añadir filtros, congelar imagen y
                  ajustar el brillo.
                </p>
                <p className={styles.faqTip}>
                  Dato: los smartphones modernos con zoom óptico integrado obtienen
                  resultados significativamente mejores que el zoom digital puro.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Puedo tomar fotos con la lupa activa?</summary>
                <p>
                  Sí, aunque esta herramienta está orientada a la visualización en tiempo
                  real. Para capturar la imagen ampliada puedes hacer una captura de
                  pantalla del dispositivo mientras la lupa está activa. Así conservas
                  el nivel de zoom y los filtros aplicados en ese momento.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Funciona sin conexión a internet?</summary>
                <p>
                  Sí. La lupa digital utiliza únicamente la cámara de tu dispositivo y
                  procesa todo localmente en el navegador. No envía imágenes a ningún
                  servidor. Solo necesitas conexión para cargar la página por primera vez.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Consume mucha batería usar la cámara como lupa?</summary>
                <p>
                  El uso continuado de la cámara consume batería de forma moderada,
                  similar a grabar un vídeo. Para sesiones cortas (leer una etiqueta o
                  un documento) el consumo es mínimo. Si vas a usarla durante varios
                  minutos seguidos, conecta el cargador o activa el modo congelado, que
                  detiene la cámara y reduce el consumo.
                </p>
              </details>
            </li>
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section>
          <h2>Cómo usar la lupa digital: 4 pasos</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Apuntar la cámara al texto u objeto</strong>
                <p>
                  Coloca el teléfono a unos 15–20 cm del objeto. La cámara trasera
                  ofrece mejor resolución. Activa la lupa y enfoca el área que quieres
                  leer o examinar.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Ajustar el zoom hasta ver claramente</strong>
                <p>
                  Usa el deslizador o los botones de preajuste para encontrar el nivel
                  de zoom adecuado. Empieza siempre por el zoom más bajo y sube
                  gradualmente para no perder el contexto.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Congelar la imagen si necesitas leer sin mover el teléfono</strong>
                <p>
                  El modo congelado captura el fotograma actual y te permite leer con
                  calma sin mantener el pulso. Ideal para texto largo o cuando necesitas
                  comparar varias zonas del documento.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Aumentar brillo si la iluminación es baja</strong>
                <p>
                  En entornos con poca luz, sube el brillo al 140–160 % y activa la
                  linterna integrada si tu dispositivo la soporta. El filtro de alto
                  contraste también ayuda a distinguir texto en superficies oscuras.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section>
          <h2>4 consejos para obtener la mejor imagen</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💡</span>
              <h4>Buena iluminación mejora mucho la claridad</h4>
              <p>
                La calidad de imagen a zoom alto depende casi por completo de la luz
                disponible. Acércate a una ventana o usa la linterna integrada para
                iluminar el objeto directamente.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⏸️</span>
              <h4>Usa el modo congelado para leer sin pulso</h4>
              <p>
                El movimiento involuntario de la mano hace que la imagen se mueva a
                zoom alto. Congela el fotograma cuando el texto esté bien enfocado y
                lee sin prisa.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <h4>Apoya el teléfono para mayor estabilidad</h4>
              <p>
                Apoya el codo en la mesa o coloca el teléfono sobre un libro para
                mantenerlo firme. A partir de 4x, cualquier movimiento reduce
                notablemente la nitidez de la imagen.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔦</span>
              <h4>Limpia la lente de la cámara antes de usar</h4>
              <p>
                Una lente sucia con huellas o polvo deteriora la imagen incluso a
                zoom bajo. Limpia suavemente con un paño de microfibra antes de
                usar la lupa para obtener la máxima nitidez.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>4 errores habituales al usar la lupa digital</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Usar en entornos muy oscuros sin linterna.</strong> Con poca
                luz el sensor eleva el ISO automáticamente, lo que produce imagen
                granulada e ilegible. Activa la linterna o busca mejor iluminación
                antes de aumentar el zoom.
              </li>
              <li>
                <strong>Aplicar zoom excesivo para la cámara del dispositivo.</strong>{' '}
                Por encima del zoom óptico disponible, la imagen pierde calidad y
                nitidez rápidamente. Busca el nivel donde el texto es legible sin
                forzar más el zoom.
              </li>
              <li>
                <strong>No limpiar la lente antes de usar.</strong> Las huellas
                dactilares crean halos y borrosidad que ningún ajuste de software
                puede corregir. Un paño limpio tarda cinco segundos y marca una
                diferencia notable.
              </li>
              <li>
                <strong>Depender exclusivamente de la lupa para tareas de seguridad.</strong>{' '}
                La lupa digital es una ayuda de accesibilidad, no un instrumento de
                precisión certificado. Para conductores, trabajadores de seguridad
                o tareas críticas, utiliza la óptica adecuada certificada para ese uso.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('lupa-digital')} />
      <ShareCard appName="lupa-digital" />
      <Footer appName="lupa-digital" />
    </div>
  );
}
