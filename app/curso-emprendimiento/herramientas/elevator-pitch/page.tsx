'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './ElevatorPitch.module.css';
import { MeskeiaLogo, Footer } from '@/components';

interface PitchData {
  problema: string;
  cliente: string;
  solucion: string;
  diferencia: string;
  nombre: string;
}

const STORAGE_KEY = 'meskeia-elevator-pitch';

const TEMPLATES = [
  {
    name: 'Problema-Solución',
    template: '{cliente} tiene el problema de {problema}. {nombre} resuelve esto con {solucion}, siendo único porque {diferencia}.',
  },
  {
    name: 'Analogía',
    template: '{nombre} es como [analogía conocida] pero para {cliente}. Mientras otros {problema}, nosotros {solucion} gracias a {diferencia}.',
  },
  {
    name: 'Historia',
    template: 'Imagina que eres {cliente} y {problema}. Con {nombre}, ahora puedes {solucion}. Lo que nos hace diferentes es {diferencia}.',
  },
  {
    name: 'Estadística',
    template: '[Dato impactante sobre {problema}]. {nombre} ayuda a {cliente} a {solucion}. Nuestro secreto: {diferencia}.',
  },
];

const EXAMPLES: PitchData[] = [
  {
    nombre: 'Glovo',
    problema: 'no tienen tiempo para ir a comprar o hacer recados',
    cliente: 'profesionales urbanos ocupados',
    solucion: 'una app que te trae cualquier cosa de tu ciudad en menos de 30 minutos',
    diferencia: 'entregamos de todo, no solo comida: farmacia, supermercado, regalos, lo que necesites',
  },
  {
    nombre: 'Wallapop',
    problema: 'tienen cosas en casa que no usan y no saben cómo venderlas fácilmente',
    cliente: 'cualquier persona',
    solucion: 'una app donde puedes vender cualquier cosa en segundos, solo con una foto desde el móvil',
    diferencia: 'la geolocalización te conecta con compradores cerca de ti, sin envíos ni complicaciones',
  },
  {
    nombre: 'Doctoralia',
    problema: 'no encuentran médico disponible rápido y no saben qué especialistas tienen buenas opiniones',
    cliente: 'pacientes',
    solucion: 'una plataforma donde ver opiniones, comparar especialistas y reservar cita online al instante',
    diferencia: 'las opiniones son de pacientes reales verificados, y puedes comparar precios y disponibilidad',
  },
];

export default function ElevatorPitchPage() {
  const [pitch, setPitch] = useState<PitchData>({
    problema: '',
    cliente: '',
    solucion: '',
    diferencia: '',
    nombre: '',
  });
  const [selectedTemplate, setSelectedTemplate] = useState(0);
  const [generatedPitch, setGeneratedPitch] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar datos guardados
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setPitch(JSON.parse(savedData));
      } catch {
        // Ignorar errores
      }
    }
  }, []);

  // Guardar automáticamente
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pitch));
  }, [pitch]);

  // Generar pitch cuando cambian los datos
  useEffect(() => {
    if (pitch.problema && pitch.cliente && pitch.solucion && pitch.diferencia) {
      const template = TEMPLATES[selectedTemplate].template;
      const generated = template
        .replace(/{problema}/g, pitch.problema)
        .replace(/{cliente}/g, pitch.cliente)
        .replace(/{solucion}/g, pitch.solucion)
        .replace(/{diferencia}/g, pitch.diferencia)
        .replace(/{nombre}/g, pitch.nombre || 'Tu empresa');
      setGeneratedPitch(generated);
    } else {
      setGeneratedPitch('');
    }
  }, [pitch, selectedTemplate]);

  const handleChange = (key: keyof PitchData, value: string) => {
    setPitch(prev => ({ ...prev, [key]: value }));
  };

  const loadExample = (index: number) => {
    setPitch(EXAMPLES[index]);
  };

  const clearAll = () => {
    if (confirm('¿Estás seguro de que quieres borrar todo?')) {
      setPitch({
        problema: '',
        cliente: '',
        solucion: '',
        diferencia: '',
        nombre: '',
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPitch);
  };

  // Timer para practicar
  const startTimer = () => {
    setIsRecording(true);
    setTimer(0);
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timer <= 30) return '#10B981'; // Verde
    if (timer <= 45) return '#F59E0B'; // Amarillo
    return '#EF4444'; // Rojo
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroIcon}>🎤</div>
        <h1 className={styles.title}>Generador de Elevator Pitch</h1>
        <p className={styles.subtitle}>
          Crea tu pitch perfecto en 30 segundos. Completa los campos y obtén tu presentación lista para impresionar.
        </p>
      </header>

      {/* Main Content */}
      <div className={styles.mainGrid}>
        {/* Form Panel */}
        <div className={styles.formPanel}>
          <h2 className={styles.sectionTitle}>📝 Completa tu pitch</h2>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Nombre de tu empresa/proyecto
              <span className={styles.optional}>(opcional)</span>
            </label>
            <input
              type="text"
              value={pitch.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              placeholder="Ej: Glovo, MiApp, Tu Startup"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>¿Para quién es? (Cliente)</label>
            <input
              type="text"
              value={pitch.cliente}
              onChange={(e) => handleChange('cliente', e.target.value)}
              placeholder="Ej: pequeñas empresas con menos de 50 empleados"
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>¿Qué problema resuelves?</label>
            <textarea
              value={pitch.problema}
              onChange={(e) => handleChange('problema', e.target.value)}
              placeholder="Ej: pierden tiempo buscando proveedores confiables"
              className={styles.textarea}
              rows={2}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>¿Cómo lo resuelves? (Solución)</label>
            <textarea
              value={pitch.solucion}
              onChange={(e) => handleChange('solucion', e.target.value)}
              placeholder="Ej: una plataforma que conecta empresas con proveedores verificados"
              className={styles.textarea}
              rows={2}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>¿Qué te hace diferente?</label>
            <textarea
              value={pitch.diferencia}
              onChange={(e) => handleChange('diferencia', e.target.value)}
              placeholder="Ej: todos nuestros proveedores están certificados con reseñas reales"
              className={styles.textarea}
              rows={2}
            />
          </div>

          <div className={styles.formActions}>
            <button onClick={clearAll} className={styles.btnSecondary}>
              🗑️ Limpiar
            </button>
          </div>

          {/* Examples */}
          <div className={styles.examples}>
            <h3>📋 Cargar ejemplo:</h3>
            <div className={styles.exampleButtons}>
              {EXAMPLES.map((ex, idx) => (
                <button
                  key={idx}
                  onClick={() => loadExample(idx)}
                  className={styles.btnExample}
                >
                  {ex.nombre}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Result Panel */}
        <div className={styles.resultPanel}>
          <h2 className={styles.sectionTitle}>🎯 Tu Elevator Pitch</h2>

          {/* Template Selector */}
          <div className={styles.templateSelector}>
            <label className={styles.label}>Elige un estilo:</label>
            <div className={styles.templateButtons}>
              {TEMPLATES.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTemplate(idx)}
                  className={`${styles.btnTemplate} ${selectedTemplate === idx ? styles.active : ''}`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Generated Pitch */}
          <div className={styles.pitchResult}>
            {generatedPitch ? (
              <>
                <p className={styles.pitchText}>{generatedPitch}</p>
                <button onClick={copyToClipboard} className={styles.btnCopy}>
                  📋 Copiar
                </button>
              </>
            ) : (
              <p className={styles.pitchPlaceholder}>
                Completa todos los campos para generar tu pitch...
              </p>
            )}
          </div>

          {/* Timer */}
          <div className={styles.timerSection}>
            <h3>⏱️ Practica tu pitch</h3>
            <p className={styles.timerHint}>El objetivo es decirlo en menos de 30 segundos</p>

            <div
              className={styles.timerDisplay}
              style={{ color: getTimerColor() }}
            >
              {formatTime(timer)}
            </div>

            <div className={styles.timerButtons}>
              {!isRecording ? (
                <button onClick={startTimer} className={styles.btnStart}>
                  ▶️ Empezar
                </button>
              ) : (
                <button onClick={stopTimer} className={styles.btnStop}>
                  ⏹️ Parar
                </button>
              )}
            </div>

            <div className={styles.timerLegend}>
              <span className={styles.legendItem}>
                <span style={{ color: '#10B981' }}>●</span> Perfecto (0-30s)
              </span>
              <span className={styles.legendItem}>
                <span style={{ color: '#F59E0B' }}>●</span> Aceptable (30-45s)
              </span>
              <span className={styles.legendItem}>
                <span style={{ color: '#EF4444' }}>●</span> Muy largo (45s+)
              </span>
            </div>
          </div>

          {/* Tips */}
          <div className={styles.tips}>
            <h3>💡 Consejos para un pitch efectivo</h3>
            <ul>
              <li>Practica hasta que suene natural, no memorizado</li>
              <li>Adapta el pitch según quién te escucha</li>
              <li>Termina con una pregunta o call-to-action</li>
              <li>Nunca digas "no tenemos competencia"</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navegación */}
      <div className={styles.navigation}>
        <Link href="/curso-emprendimiento/herramientas/dafo" className={styles.navLink}>
          ← Análisis DAFO
        </Link>
        <Link href="/curso-emprendimiento" className={styles.navLink}>
          Volver al curso →
        </Link>
      </div>

      <Footer appName="curso-emprendimiento" />
    </div>
  );
}
