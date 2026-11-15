'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef } from 'react';
import styles from './Espejo.module.css';
import { MeskeiaLogo, Footer, RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { formatNumber } from '@/lib';
import { PREGUNTA_PRIVACIDAD } from './metadata';

/**
 * Por qué no se abrió la cámara, según el `name` del error de getUserMedia (hallazgo 4746: antes
 * todo era «permiso denegado» y mandaba a la configuración a quien no tiene cámara o la tiene
 * ocupada en una videollamada). Mismo criterio que prueba-camara (hallazgo 4429).
 */
type AvisoCamara = 'denegado' | 'sin-camara' | 'ocupada' | 'desconectada' | 'otro';

const AVISOS: Record<AvisoCamara, { titulo: string; detalle: string }> = {
  denegado: {
    titulo: 'Permiso de cámara denegado',
    detalle: 'Activa la cámara en la configuración del navegador',
  },
  'sin-camara': {
    titulo: 'No se ha encontrado ninguna cámara',
    detalle: 'Conecta una cámara web o abre el espejo en un dispositivo con cámara frontal.',
  },
  ocupada: {
    titulo: 'La cámara está ocupada',
    detalle: 'Otra aplicación la está usando (una videollamada, por ejemplo). Ciérrala e inténtalo de nuevo.',
  },
  desconectada: {
    titulo: 'La cámara se ha desconectado',
    detalle: 'Se retiró el permiso o el sistema dejó de dar imagen. Pulsa «Activar espejo» para volver a abrirla.',
  },
  otro: {
    titulo: 'No se pudo abrir la cámara',
    detalle: 'Comprueba que está conectada y que el navegador tiene permiso.',
  },
};

function avisoDeError(error: unknown): AvisoCamara {
  const nombre = error instanceof DOMException || error instanceof Error ? error.name : '';
  if (nombre === 'NotAllowedError' || nombre === 'SecurityError') return 'denegado';
  if (nombre === 'NotFoundError' || nombre === 'OverconstrainedError') return 'sin-camara';
  if (nombre === 'NotReadableError' || nombre === 'AbortError') return 'ocupada';
  return 'otro';
}

export default function EspejoPage() {
  const [activo, setActivo] = useState(false);
  const [aviso, setAviso] = useState<AvisoCamara | null>(null);
  const [espejado, setEspejado] = useState(true);
  const [brillo, setBrillo] = useState(100);
  const [zoom, setZoom] = useState(1);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Una apertura cada vez (cabo C0715, alcance del hallazgo 4487 de prueba-camara): el botón
  // sigue diciendo «Activar espejo» hasta que getUserMedia resuelve, y un doble clic abría la
  // cámara dos veces; el segundo flujo pisaba al primero en streamRef y este quedaba vivo tras
  // «Apagar», con la luz encendida. `generacionRef` sube con cada apertura y al apagar (también
  // al desmontar): el flujo que llega de una apertura que ya no es la última se cierra al llegar.
  const abriendoRef = useRef(false);
  const generacionRef = useRef(0);

  const iniciarCamara = async () => {
    if (abriendoRef.current) return;
    abriendoRef.current = true;
    const generacion = ++generacionRef.current;
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        }
      });
      if (generacion !== generacionRef.current) {
        stream.getTracks().forEach(track => track.stop());
        return;
      }

      streamRef.current = stream;
      setAviso(null);

      // Si la pista termina sola (permiso retirado, cámara desconectada), la app vuelve a
      // «Activar espejo» y lo dice, en vez de quedarse con el vídeo muerto (hallazgo 4751)
      stream.getVideoTracks().forEach((pista) => {
        pista.addEventListener('ended', () => {
          if (streamRef.current !== stream) return;
          detenerCamara();
          setAviso('desconectada');
        });
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setActivo(true);
    } catch (error) {
      if (generacion !== generacionRef.current) return;
      console.error('Error al acceder a la cámara:', error);
      setAviso(avisoDeError(error));
    } finally {
      if (generacion === generacionRef.current) abriendoRef.current = false;
    }
  };

  const detenerCamara = () => {
    // Invalida una apertura en curso: su flujo, si llega, se cierra al llegar
    generacionRef.current += 1;
    abriendoRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setActivo(false);
  };

  const togglePantallaCompleta = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => {
        setPantallaCompleta(true);
      }).catch(console.error);
    } else {
      document.exitFullscreen().then(() => {
        setPantallaCompleta(false);
      }).catch(console.error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setPantallaCompleta(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      detenerCamara();
    };
  }, []);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Espejo Digital</h1>
        <p className={styles.subtitle}>
          Tu espejo de bolsillo en el móvil (celular) u ordenador (computadora)
        </p>
      </header>

      <LegalNotice />

      {/* Espejo */}
      <div
        ref={containerRef}
        className={`${styles.espejoContainer} ${pantallaCompleta ? styles.fullscreen : ''}`}
      >
        {/* Hallazgo 4748: el recuadro decía «Pulsa para activar el espejo» y no hacía nada; en el
            móvil llena la pantalla y deja el botón bajo el pliegue. Ahora es un botón. */}
        {!activo ? (
          <button type="button" className={styles.espejoPlaceholder} onClick={iniciarCamara}>
            <span className={styles.placeholderIcon} aria-hidden="true">{aviso ? '🚫' : '🪞'}</span>
            <span className={styles.placeholderTexto}>
              {aviso ? 'Pulsa para volver a intentarlo' : 'Pulsa para activar el espejo'}
            </span>
          </button>
        ) : null}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={styles.espejoVideo}
          style={{
            display: activo ? 'block' : 'none',
            transform: `${espejado ? 'scaleX(-1)' : ''} scale(${zoom})`,
            filter: `brightness(${brillo}%)`,
          }}
        />

        {/* Controles en pantalla completa */}
        {activo && pantallaCompleta && (
          <div className={styles.controlesFullscreen}>
            <button type="button" onClick={togglePantallaCompleta} className={styles.btnSalirFullscreen}>
              <span aria-hidden="true">✕</span> Salir
            </button>
          </div>
        )}
      </div>

      {/* Por qué no se abrió la cámara (hallazgos 4746 y 4747): siempre montado para que el
          lector anuncie el cambio; vacío, no ocupa sitio */}
      <div className={styles.avisoCamara} role="alert">
        <p className={styles.avisoTitulo}>{aviso ? AVISOS[aviso].titulo : ''}</p>
        <p className={styles.avisoDetalle}>{aviso ? AVISOS[aviso].detalle : ''}</p>
      </div>

      {/* Botón principal */}
      <div className={styles.controlPrincipal}>
        <button
          type="button"
          className={`${styles.btnPrincipal} ${activo ? styles.activo : ''}`}
          onClick={activo ? detenerCamara : iniciarCamara}
        >
          <span aria-hidden="true">{activo ? '⏹️' : '🪞'}</span>{activo ? ' Apagar' : ' Activar espejo'}
        </button>
      </div>

      {/* Controles */}
      {activo && (
        <div className={styles.controles}>
          {/* Espejado */}
          <button
            type="button"
            aria-pressed={espejado}
            className={`${styles.controlBtn} ${espejado ? styles.controlActivo : ''}`}
            onClick={() => setEspejado(!espejado)}
          >
            <span className={styles.controlIcono} aria-hidden="true">↔️</span>
            {/* Etiqueta fija: el estado lo dice aria-pressed (hallazgo 4755) */}
            <span className={styles.controlTexto}>Espejado</span>
          </button>

          {/* Pantalla completa */}
          <button
            type="button"
            className={styles.controlBtn}
            onClick={togglePantallaCompleta}
          >
            <span className={styles.controlIcono} aria-hidden="true">⛶</span>
            <span className={styles.controlTexto}>Pantalla completa</span>
          </button>
        </div>
      )}

      {/* Ajustes */}
      {activo && (
        <div className={styles.section}>
          <div className={styles.ajuste}>
            <label htmlFor="brillo"><span aria-hidden="true">☀️</span> Brillo: {brillo}&nbsp;%</label>
            <input
              id="brillo"
              type="range"
              min="50"
              max="150"
              value={brillo}
              onChange={(e) => setBrillo(parseInt(e.target.value))}
              className={styles.ajusteSlider}
            />
          </div>

          <div className={styles.ajuste}>
            <label htmlFor="zoom"><span aria-hidden="true">🔍</span> Zoom: {formatNumber(zoom, 1)}x</label>
            <input
              id="zoom"
              type="range"
              min="1"
              max="2"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className={styles.ajusteSlider}
            />
          </div>

          <button
            type="button"
            className={styles.btnReset}
            onClick={() => {
              setBrillo(100);
              setZoom(1);
              setEspejado(true);
            }}
          >
            <span aria-hidden="true">↺</span> Restablecer
          </button>
        </div>
      )}

      {/* Info */}
      <div className={styles.infoSection}>
        <div className={styles.infoCard}>
          <span className={styles.infoIcon} aria-hidden="true">💡</span>
          <h4>Consejo</h4>
          <p>Para mejor iluminación, colócate frente a una fuente de luz natural o artificial.</p>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoIcon} aria-hidden="true">📱</span>
          <h4>Móvil</h4>
          <p>Usa la pantalla completa para tener un espejo más grande y cómodo.</p>
        </div>
      </div>

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Cómo sacar el máximo partido al espejo digital?"
        subtitle="Situaciones de uso, consejos de iluminación y preguntas frecuentes sobre la cámara como espejo"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section className={styles.guideSection}>
          <h2>Cuándo usar el espejo digital: 4 situaciones</h2>
          <p>
            La cámara frontal de tu móvil (celular) u ordenador (computadora) puede
            sustituir a un espejo físico en muchos contextos.
            Esta tabla resume la configuración óptima para cada situación.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Situación</th>
                  <th>Cámara recomendada</th>
                  <th>Distancia óptima</th>
                  <th>Iluminación necesaria</th>
                  <th>Alternativa física</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span aria-hidden="true">🪮</span> Arreglarse antes de una reunión</td>
                  <td>Frontal (selfie)</td>
                  <td>30 – 50 cm</td>
                  <td>Luz frontal difusa</td>
                  <td>Espejo de bolso o de baño</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">👕</span> Probarse ropa sin espejo físico</td>
                  <td>Frontal en modo apaisado</td>
                  <td>1 – 1,5 m</td>
                  <td>Luz ambiente amplia</td>
                  <td>Espejo de cuerpo entero</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">🚌</span> Verificar aspecto en desplazamientos</td>
                  <td>Frontal</td>
                  <td>25 – 40 cm</td>
                  <td>Luz natural de ventana</td>
                  <td>Espejo compacto de bolsillo</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">💻</span> Comprobar iluminación para videollamada</td>
                  <td>Frontal o cámara web del portátil</td>
                  <td>40 – 60 cm</td>
                  <td>Luz frontal, sin contraluz</td>
                  <td>Vista previa de la app de reuniones</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section className={styles.guideSection}>
          <h2>Quién lo usa y cómo</h2>
          <p>
            El espejo digital resulta especialmente útil cuando no hay un espejo físico a mano.
            Aquí tienes tres perfiles reales.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧳</span>
                <h4>Viajero sin espejo en el alojamiento</h4>
              </div>
              <p className={styles.escenarioExample}>
                Se hospeda en un albergue o apartamento sin espejo en el baño.
                Usa la cámara frontal del móvil apoyado en la repisa para revisar el
                peinado y el aspecto antes de salir.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: activa la pantalla completa y apoya el móvil a la altura del
                rostro para una vista más cómoda y estable.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📹</span>
                <h4>Revisión antes de videollamada o presentación</h4>
              </div>
              <p className={styles.escenarioExample}>
                Tiene una reunión de trabajo en cinco minutos y quiere comprobar
                que la iluminación es correcta y no tiene nada en la ropa o el cabello
                fuera de lugar.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: comprueba con la app que no hay contraluz detrás de ti.
                Una ventana a la espalda oscurece la cara en cámara.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏢</span>
                <h4>Uso en oficina o espacio de trabajo sin espejo</h4>
              </div>
              <p className={styles.escenarioExample}>
                Necesita retocar el aspecto durante la jornada laboral pero no hay
                espejo en los aseos del edificio. Usa el espejo digital discretamente
                en su escritorio o en un lugar privado.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: la función de zoom permite revisar detalles concretos
                (corbata, pendientes, maquillaje) sin alejarse del asiento.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <details>
                <summary>¿La imagen está invertida como un espejo real?</summary>
                <p>
                  Sí, por defecto la imagen se muestra en modo espejo (invertida
                  horizontalmente), igual que un espejo físico. Si prefieres ver la
                  imagen sin invertir, puedes desactivar el efecto espejo con el
                  botón de control disponible mientras la cámara está activa.
                </p>
                <p className={styles.faqTip}>
                  Nota: en modo normal (sin inversión) la imagen corresponde a cómo
                  te ven los demás, no a cómo tú te ves en un espejo.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Consume mucha batería?</summary>
                <p>
                  El uso de la cámara activa consume batería de forma notable, más
                  aún con la pantalla al máximo de brillo. Para un uso puntual (30-60
                  segundos) el impacto es mínimo. Si lo usas durante varios minutos
                  seguidos, es recomendable tener el dispositivo conectado a la corriente
                  o reducir el brillo de pantalla.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Puedo usarlo con la cámara trasera?</summary>
                {/* Hallazgo 4757: decía que con la trasera «la imagen no se invierte», y la app
                    ni la pide ni distingue: invierte cualquier flujo */}
                <p>
                  No. La app pide siempre la cámara frontal, la que te mira, y no tiene
                  selector de cámara. Si el dispositivo solo tiene una cámara, usa esa.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                {/* Una sola fuente con el FAQPage (hallazgo 4753) */}
                <summary>{PREGUNTA_PRIVACIDAD.question}</summary>
                <p>{PREGUNTA_PRIVACIDAD.answer}</p>
              </details>
            </li>
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section className={styles.guideSection}>
          <h2>Cómo usar el espejo digital: 4 pasos</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Permitir acceso a la cámara</strong>
                <p>
                  Al pulsar &quot;Activar espejo&quot; el navegador solicitará permiso para usar
                  la cámara. Acepta el permiso para continuar. Si lo denegas, la app
                  no podrá mostrar la imagen. Puedes cambiar este permiso en cualquier
                  momento desde la configuración del navegador.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Seleccionar la cámara frontal</strong>
                <p>
                  La app activa automáticamente la cámara frontal (selfie). Es la más
                  adecuada para usarla como espejo porque te permite verte de frente
                  sin contorsiones. Si el dispositivo solo tiene una cámara, se usará
                  esa directamente.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Ajustar la distancia y el ángulo</strong>
                <p>
                  Coloca el dispositivo a 30-50 cm del rostro para ver la cara completa.
                  Usa el control de zoom si necesitas ver un detalle concreto. Apoya el
                  móvil en una superficie estable o usa un soporte para tener las manos
                  libres.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Verificar la iluminación (luz frontal, no contraluz)</strong>
                <p>
                  La calidad de la imagen depende en gran medida de la iluminación.
                  Sitúa la fuente de luz delante de ti (frente al rostro), no a la
                  espalda. Si hay una ventana detrás de ti, tu cara aparecerá en sombra.
                  Usa el control de brillo de la app para compensar si la luz es escasa.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section className={styles.guideSection}>
          <h2>4 consejos para una imagen más nítida</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💡</span>
              <h4>Iluminación frontal para mejor imagen</h4>
              <p>
                La luz frontal difusa es la más favorecedora y la que da mayor
                nitidez. Evita focos directos que creen sombras duras. Una ventana
                lateral o una lámpara detrás del dispositivo funcionan bien.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📱</span>
              <h4>Apoyar el dispositivo para mayor estabilidad</h4>
              <p>
                Sujetar el móvil con la mano mientras te miras genera movimiento
                y cansa. Apóyalo en una mesa, repisa o utiliza un soporte. Así
                puedes revisar el aspecto con las dos manos libres.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🖥️</span>
              <h4>Usar en pantalla grande para más detalle</h4>
              <p>
                Si tienes acceso a una tablet o a un portátil con cámara web,
                la pantalla más grande facilita ver detalles finos. Activa la
                pantalla completa en el móvil para aprovechar al máximo el
                espacio disponible.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔍</span>
              <h4>Limpiar la lente para imagen más nítida</h4>
              <p>
                La lente de la cámara frontal acumula grasa de los dedos y polvo
                con facilidad. Una pasada suave con un paño de microfibra antes
                de usar el espejo mejora notablemente la nitidez de la imagen.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>3 errores habituales al usar la cámara como espejo</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Usar con contraluz.</strong> Si hay una ventana o una lámpara
                detrás de ti, la cara quedará en sombra y no podrás ver bien el aspecto.
                Recoloca la fuente de luz o muévete a otro ángulo.
              </li>
              <li>
                <strong>Depender del espejo digital para maquillaje de precisión.</strong>{' '}
                La resolución y el rango dinámico de la cámara frontal pueden no ser
                suficientes para detalles muy finos como eyeliner o difuminados precisos.
                Para ese nivel de detalle, un espejo físico con aumento sigue siendo
                más fiable.
              </li>
              <li>
                <strong>No haber concedido permiso a la cámara.</strong> Si en su momento
                denegaste el acceso, la app no funcionará aunque pulses el botón. Revisa
                los permisos del sitio en el navegador y activa la cámara manualmente
                antes de intentarlo de nuevo.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="espejo" />
      <Footer appName="espejo" />
    </div>
  );
}
