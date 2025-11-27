'use client';

import { useState } from 'react';
import styles from './CalculadoraSueno.module.css';
import { MeskeiaLogo, Footer } from '@/components';

type ModoCalculo = 'despertar' | 'dormir';

interface HoraSueno {
  hora: string;
  ciclos: number;
  duracion: string;
  calidad: 'optima' | 'buena' | 'aceptable';
}

const DURACION_CICLO = 90; // minutos
const TIEMPO_DORMIRSE = 15; // minutos promedio para quedarse dormido

function formatearHora(fecha: Date): string {
  return fecha.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function calcularDuracion(minutos: number): string {
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  if (mins === 0) {
    return `${horas}h`;
  }
  return `${horas}h ${mins}min`;
}

function obtenerCalidad(ciclos: number): 'optima' | 'buena' | 'aceptable' {
  if (ciclos >= 5 && ciclos <= 6) return 'optima';
  if (ciclos === 4) return 'buena';
  return 'aceptable';
}

export default function CalculadoraSuenoPage() {
  const [modo, setModo] = useState<ModoCalculo>('despertar');
  const [hora, setHora] = useState('07:00');
  const [resultados, setResultados] = useState<HoraSueno[] | null>(null);

  const calcular = () => {
    const [horaNum, minNum] = hora.split(':').map(Number);
    const fechaBase = new Date();
    fechaBase.setHours(horaNum, minNum, 0, 0);

    const horas: HoraSueno[] = [];

    if (modo === 'despertar') {
      // Calcular horas para ir a dormir (hacia atrás desde la hora de despertar)
      for (let ciclos = 6; ciclos >= 3; ciclos--) {
        const minutosAtras = (ciclos * DURACION_CICLO) + TIEMPO_DORMIRSE;
        const horaDormir = new Date(fechaBase.getTime() - minutosAtras * 60000);

        horas.push({
          hora: formatearHora(horaDormir),
          ciclos,
          duracion: calcularDuracion(ciclos * DURACION_CICLO),
          calidad: obtenerCalidad(ciclos),
        });
      }
    } else {
      // Calcular horas para despertar (hacia adelante desde la hora de dormir)
      const horaRealDormir = new Date(fechaBase.getTime() + TIEMPO_DORMIRSE * 60000);

      for (let ciclos = 3; ciclos <= 6; ciclos++) {
        const minutosAdelante = ciclos * DURACION_CICLO;
        const horaDespertar = new Date(horaRealDormir.getTime() + minutosAdelante * 60000);

        horas.push({
          hora: formatearHora(horaDespertar),
          ciclos,
          duracion: calcularDuracion(ciclos * DURACION_CICLO),
          calidad: obtenerCalidad(ciclos),
        });
      }
    }

    setResultados(horas);
  };

  const getCalidadClase = (calidad: string) => {
    switch (calidad) {
      case 'optima': return styles.calidadOptima;
      case 'buena': return styles.calidadBuena;
      default: return styles.calidadAceptable;
    }
  };

  const getCalidadTexto = (calidad: string) => {
    switch (calidad) {
      case 'optima': return '⭐ Óptimo';
      case 'buena': return '✅ Bueno';
      default: return '👍 Aceptable';
    }
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🌙 Calculadora de Sueño</h1>
        <p className={styles.subtitle}>
          Calcula la hora ideal para dormir o despertar respetando los ciclos de sueño de 90 minutos
        </p>
      </header>

      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>¿Qué quieres calcular?</h2>

          <div className={styles.modoSelector}>
            <button
              className={`${styles.modoBtn} ${modo === 'despertar' ? styles.activo : ''}`}
              onClick={() => { setModo('despertar'); setResultados(null); }}
            >
              <span className={styles.modoIcono}>⏰</span>
              <span className={styles.modoTexto}>Sé a qué hora quiero despertar</span>
              <span className={styles.modoDesc}>Calcular hora para ir a dormir</span>
            </button>
            <button
              className={`${styles.modoBtn} ${modo === 'dormir' ? styles.activo : ''}`}
              onClick={() => { setModo('dormir'); setResultados(null); }}
            >
              <span className={styles.modoIcono}>🛏️</span>
              <span className={styles.modoTexto}>Sé a qué hora me voy a dormir</span>
              <span className={styles.modoDesc}>Calcular hora para despertar</span>
            </button>
          </div>

          <div className={styles.horaSection}>
            <label className={styles.label}>
              {modo === 'despertar' ? '¿A qué hora quieres despertar?' : '¿A qué hora te vas a dormir?'}
            </label>
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className={styles.horaInput}
            />
          </div>

          <button onClick={calcular} className={styles.btnPrimary}>
            Calcular Horas Óptimas
          </button>

          <div className={styles.infoBox}>
            <h3>💡 ¿Por qué 90 minutos?</h3>
            <p>
              Un ciclo de sueño completo dura aproximadamente 90 minutos e incluye todas las fases:
              sueño ligero, profundo y REM. Despertar al final de un ciclo te hace sentir más
              descansado que hacerlo a mitad de uno.
            </p>
          </div>
        </div>

        <div className={styles.resultsPanel}>
          {resultados ? (
            <>
              <h2 className={styles.resultsTitulo}>
                {modo === 'despertar'
                  ? '🌙 Horas recomendadas para ir a dormir'
                  : '☀️ Horas recomendadas para despertar'}
              </h2>
              <p className={styles.resultsSubtitulo}>
                {modo === 'despertar'
                  ? `Para despertar a las ${hora}, intenta dormirte a una de estas horas:`
                  : `Si te duermes a las ${hora}, despierta a una de estas horas:`}
              </p>

              <div className={styles.horasGrid}>
                {resultados.map((resultado, index) => (
                  <div
                    key={index}
                    className={`${styles.horaCard} ${getCalidadClase(resultado.calidad)}`}
                  >
                    <span className={styles.horaValor}>{resultado.hora}</span>
                    <span className={styles.horaCiclos}>{resultado.ciclos} ciclos</span>
                    <span className={styles.horaDuracion}>{resultado.duracion} de sueño</span>
                    <span className={styles.horaCalidad}>{getCalidadTexto(resultado.calidad)}</span>
                  </div>
                ))}
              </div>

              <div className={styles.recomendacion}>
                <h3>💤 Recomendación</h3>
                <p>
                  Los adultos necesitan entre <strong>7-9 horas de sueño</strong> (4-6 ciclos).
                  Lo ideal es completar <strong>5-6 ciclos</strong> para un descanso óptimo.
                  El tiempo para quedarse dormido (≈15 min) ya está incluido en el cálculo.
                </p>
              </div>

              <div className={styles.fasesSection}>
                <h3>🧠 Fases de un ciclo de sueño</h3>
                <div className={styles.fasesGrid}>
                  <div className={styles.faseCard}>
                    <span className={styles.faseNum}>1</span>
                    <span className={styles.faseNombre}>Adormecimiento</span>
                    <span className={styles.faseDuracion}>5-10 min</span>
                  </div>
                  <div className={styles.faseCard}>
                    <span className={styles.faseNum}>2</span>
                    <span className={styles.faseNombre}>Sueño ligero</span>
                    <span className={styles.faseDuracion}>20 min</span>
                  </div>
                  <div className={styles.faseCard}>
                    <span className={styles.faseNum}>3</span>
                    <span className={styles.faseNombre}>Sueño profundo</span>
                    <span className={styles.faseDuracion}>30-40 min</span>
                  </div>
                  <div className={styles.faseCard}>
                    <span className={styles.faseNum}>4</span>
                    <span className={styles.faseNombre}>REM (Sueños)</span>
                    <span className={styles.faseDuracion}>20-25 min</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.placeholder}>
              <span className={styles.placeholderIcon}>🌙</span>
              <p>Selecciona un modo y una hora para calcular tus ciclos de sueño óptimos</p>
            </div>
          )}
        </div>
      </div>

      <div className={styles.tipsSection}>
        <h3>🌟 Consejos para dormir mejor</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>📱</span>
            <h4>Evita pantallas</h4>
            <p>Deja el móvil 1 hora antes de dormir. La luz azul afecta la melatonina.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🌡️</span>
            <h4>Temperatura ideal</h4>
            <p>Mantén la habitación entre 18-21°C para un sueño reparador.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>☕</span>
            <h4>Limita cafeína</h4>
            <p>Evita café, té y refrescos con cafeína 6 horas antes de dormir.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🕐</span>
            <h4>Horario regular</h4>
            <p>Acuéstate y levántate a la misma hora, incluso fines de semana.</p>
          </div>
        </div>
      </div>

      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Importante</h3>
        <p>
          Esta calculadora proporciona estimaciones basadas en ciclos de sueño promedio de 90 minutos.
          La duración real puede variar según la persona, edad y otros factores. Si experimentas
          problemas persistentes de sueño, <strong>consulta con un profesional de la salud</strong>.
          Esta herramienta no sustituye el diagnóstico ni tratamiento médico.
        </p>
      </div>

      <Footer appName="calculadora-sueno" />
    </div>
  );
}
