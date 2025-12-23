'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './LupaDigital.module.css';
import { MeskeiaLogo, Footer, RelatedApps } from '@/components';
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

      {/* Visor de la lupa */}
      <div className={styles.lupaContainer}>
        {!activo ? (
          <div className={styles.lupaPlaceholder}>
            {permisoCamara === 'denied' ? (
              <>
                <span className={styles.placeholderIcon}>🚫</span>
                <p>Permiso de cámara denegado</p>
                <p className={styles.placeholderSubtexto}>
                  Activa la cámara en la configuración del navegador
                </p>
              </>
            ) : (
              <>
                <span className={styles.placeholderIcon}>🔍</span>
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
          className={`${styles.btnPrincipal} ${activo ? styles.activo : ''}`}
          onClick={activo ? detenerCamara : iniciarCamara}
        >
          {activo ? '⏹️ Detener' : '🔍 Activar lupa'}
        </button>

        {activo && (
          <button className={styles.btnCambiarCamara} onClick={cambiarCamara}>
            🔄 Cambiar cámara
          </button>
        )}
      </div>

      {/* Control de zoom */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Zoom: {zoom}x</h3>
        <div className={styles.zoomControl}>
          <button
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
              key={z}
              className={`${styles.zoomPresetBtn} ${zoom === z ? styles.zoomPresetActivo : ''}`}
              onClick={() => setZoom(z)}
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
              key={f.id}
              className={`${styles.filtroBtn} ${filtro === f.id ? styles.filtroActivo : ''}`}
              onClick={() => setFiltro(f.id)}
            >
              <span className={styles.filtroIcono}>{f.icono}</span>
              <span className={styles.filtroNombre}>{f.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Ajustes de imagen */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Ajustes de imagen</h3>

        <div className={styles.ajuste}>
          <label>☀️ Brillo: {brillo}%</label>
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
          <label>◐ Contraste: {contraste}%</label>
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
            className={`${styles.btnLinterna} ${linterna ? styles.linternaActiva : ''}`}
            onClick={() => toggleLinterna(!linterna)}
          >
            {linterna ? '🔦 Linterna ON' : '💡 Activar linterna'}
          </button>
        )}

        <button
          className={styles.btnReset}
          onClick={() => {
            setBrillo(100);
            setContraste(100);
            setFiltro('ninguno');
          }}
        >
          ↺ Restablecer ajustes
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

      <RelatedApps apps={getRelatedApps('lupa-digital')} />
      <Footer appName="lupa-digital" />
    </div>
  );
}
