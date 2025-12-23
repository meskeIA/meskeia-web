'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './Espejo.module.css';
import { MeskeiaLogo, Footer, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

export default function EspejoPage() {
  const [activo, setActivo] = useState(false);
  const [permisoCamara, setPermisoCamara] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [espejado, setEspejado] = useState(true);
  const [brillo, setBrillo] = useState(100);
  const [zoom, setZoom] = useState(1);
  const [pantallaCompleta, setPantallaCompleta] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const iniciarCamara = async () => {
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

      streamRef.current = stream;
      setPermisoCamara('granted');

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setActivo(true);
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
          Tu espejo de bolsillo en el móvil
        </p>
      </header>

      {/* Espejo */}
      <div
        ref={containerRef}
        className={`${styles.espejoContainer} ${pantallaCompleta ? styles.fullscreen : ''}`}
      >
        {!activo ? (
          <div className={styles.espejoPlaceholder}>
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
                <span className={styles.placeholderIcon}>🪞</span>
                <p>Pulsa para activar el espejo</p>
              </>
            )}
          </div>
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
            <button onClick={togglePantallaCompleta} className={styles.btnSalirFullscreen}>
              ✕ Salir
            </button>
          </div>
        )}
      </div>

      {/* Botón principal */}
      <div className={styles.controlPrincipal}>
        <button
          className={`${styles.btnPrincipal} ${activo ? styles.activo : ''}`}
          onClick={activo ? detenerCamara : iniciarCamara}
        >
          {activo ? '⏹️ Apagar' : '🪞 Activar espejo'}
        </button>
      </div>

      {/* Controles */}
      {activo && (
        <div className={styles.controles}>
          {/* Espejado */}
          <button
            className={`${styles.controlBtn} ${espejado ? styles.controlActivo : ''}`}
            onClick={() => setEspejado(!espejado)}
          >
            <span className={styles.controlIcono}>↔️</span>
            <span className={styles.controlTexto}>{espejado ? 'Espejado' : 'Normal'}</span>
          </button>

          {/* Pantalla completa */}
          <button
            className={styles.controlBtn}
            onClick={togglePantallaCompleta}
          >
            <span className={styles.controlIcono}>⛶</span>
            <span className={styles.controlTexto}>Pantalla completa</span>
          </button>
        </div>
      )}

      {/* Ajustes */}
      {activo && (
        <div className={styles.section}>
          <div className={styles.ajuste}>
            <label>☀️ Brillo: {brillo}%</label>
            <input
              type="range"
              min="50"
              max="150"
              value={brillo}
              onChange={(e) => setBrillo(parseInt(e.target.value))}
              className={styles.ajusteSlider}
            />
          </div>

          <div className={styles.ajuste}>
            <label>🔍 Zoom: {zoom}x</label>
            <input
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
            className={styles.btnReset}
            onClick={() => {
              setBrillo(100);
              setZoom(1);
              setEspejado(true);
            }}
          >
            ↺ Restablecer
          </button>
        </div>
      )}

      {/* Info */}
      <div className={styles.infoSection}>
        <div className={styles.infoCard}>
          <span className={styles.infoIcon}>💡</span>
          <h4>Consejo</h4>
          <p>Para mejor iluminación, colócate frente a una fuente de luz natural o artificial.</p>
        </div>
        <div className={styles.infoCard}>
          <span className={styles.infoIcon}>📱</span>
          <h4>Móvil</h4>
          <p>Usa la pantalla completa para tener un espejo más grande y cómodo.</p>
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('espejo')} />
      <Footer appName="espejo" />
    </div>
  );
}
