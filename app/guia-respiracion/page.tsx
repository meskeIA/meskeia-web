'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './GuiaRespiracion.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  DisclaimerCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Fases del ciclo de respiración
type Fase = 'parado' | 'inhala' | 'reten1' | 'exhala' | 'reten2';

// Configuración de una técnica
interface Tecnica {
  id: string;
  nombre: string;
  descripcion: string;
  icono: string;
  inhala: number;   // segundos
  reten1: number;   // retención tras inhalar
  exhala: number;
  reten2: number;   // retención tras exhalar
  usos: string;
}

// Colores y escalas por fase
const FASE_CONFIG: Record<Fase, { texto: string; color: string; escala: number; colorTexto: string }> = {
  parado:  { texto: 'Preparado', color: '#E8F4F8', escala: 0.55, colorTexto: '#2E86AB' },
  inhala:  { texto: 'Inhala...', color: '#2E86AB', escala: 1.0,  colorTexto: '#FFFFFF' },
  reten1:  { texto: 'Retén',    color: '#48A9A6', escala: 1.0,  colorTexto: '#FFFFFF' },
  exhala:  { texto: 'Exhala...', color: '#7FB3D3', escala: 0.45, colorTexto: '#1A1A1A' },
  reten2:  { texto: 'Retén',    color: '#B0DDD9', escala: 0.45, colorTexto: '#1A1A1A' },
};

// Técnicas de respiración disponibles
const TECNICAS: Tecnica[] = [
  {
    id: 'diafragmatica',
    nombre: 'Diafragmática',
    descripcion: 'Básica y natural',
    icono: '🌬️',
    inhala: 4, reten1: 0, exhala: 6, reten2: 0,
    usos: 'Principiantes, EPOC, relajación general',
  },
  {
    id: 'cuadrada',
    nombre: 'Cuadrada',
    descripcion: '4 fases iguales',
    icono: '⬜',
    inhala: 4, reten1: 4, exhala: 4, reten2: 4,
    usos: 'Concentración, calma ante el estrés',
  },
  {
    id: 'cuatro-siete-ocho',
    nombre: '4-7-8',
    descripcion: 'Para ansiedad',
    icono: '💤',
    inhala: 4, reten1: 7, exhala: 8, reten2: 0,
    usos: 'Ansiedad, insomnio, ataques de pánico',
  },
  {
    id: 'coherente',
    nombre: 'Coherente',
    descripcion: 'Ritmo constante',
    icono: '💙',
    inhala: 5, reten1: 0, exhala: 5, reten2: 0,
    usos: 'Equilibrio emocional, meditación',
  },
];

// Secuencia de fases según la técnica
function getFases(t: Tecnica): Fase[] {
  const fases: Fase[] = ['inhala'];
  if (t.reten1 > 0) fases.push('reten1');
  fases.push('exhala');
  if (t.reten2 > 0) fases.push('reten2');
  return fases;
}

// Duración de cada fase
function getDuracion(t: Tecnica, fase: Fase): number {
  switch (fase) {
    case 'inhala':  return t.inhala;
    case 'reten1':  return t.reten1;
    case 'exhala':  return t.exhala;
    case 'reten2':  return t.reten2;
    default: return 0;
  }
}

export default function GuiaRespiracionPage() {
  const [tecnicaId, setTecnicaId] = useState<string>('diafragmatica');
  const [corriendo, setCorriendo] = useState(false);
  const [fase, setFase] = useState<Fase>('parado');
  const [cuenta, setCuenta] = useState(0);
  const [ciclos, setCiclos] = useState(0);
  const [vozActiva, setVozActiva] = useState(false);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const faseIndexRef = useRef(0);
  const cuentaIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tecnica = TECNICAS.find(t => t.id === tecnicaId) ?? TECNICAS[0];
  const fasesSecuencia = getFases(tecnica);
  const configFase = FASE_CONFIG[fase];

  // Limpiar todo al desmontar
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (cuentaIntervalRef.current) clearInterval(cuentaIntervalRef.current);
    };
  }, []);

  // Hablar la fase con síntesis de voz
  const hablar = useCallback((texto: string) => {
    if (!vozActiva || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(texto);
    utt.lang = 'es-ES';
    utt.rate = 0.85;
    utt.pitch = 1;
    window.speechSynthesis.speak(utt);
  }, [vozActiva]);

  // Avanzar a la siguiente fase
  const avanzarFase = useCallback((
    t: Tecnica,
    fases: Fase[],
    indexActual: number,
    ciclosActuales: number
  ) => {
    const siguienteIndex = (indexActual + 1) % fases.length;
    const esPrimeraCiclo = siguienteIndex === 0;
    const nuevaFase = fases[siguienteIndex];
    const duracion = getDuracion(t, nuevaFase);

    faseIndexRef.current = siguienteIndex;

    if (esPrimeraCiclo) {
      setCiclos(prev => prev + 1);
    }

    setFase(nuevaFase);
    setCuenta(duracion);

    // Voz guiada
    const textoVoz = nuevaFase === 'inhala' ? 'Inhala'
      : nuevaFase === 'reten1' || nuevaFase === 'reten2' ? 'Retén'
      : 'Exhala';
    hablar(textoVoz);

    // Cuenta regresiva
    if (cuentaIntervalRef.current) clearInterval(cuentaIntervalRef.current);
    let c = duracion;
    cuentaIntervalRef.current = setInterval(() => {
      c -= 1;
      setCuenta(c);
    }, 1000);

    // Programar siguiente fase
    timeoutRef.current = setTimeout(() => {
      clearInterval(cuentaIntervalRef.current!);
      avanzarFase(t, fases, siguienteIndex, esPrimeraCiclo ? ciclosActuales + 1 : ciclosActuales);
    }, duracion * 1000);
  }, [hablar]);

  // Iniciar sesión
  const iniciar = useCallback(() => {
    faseIndexRef.current = -1;
    setCiclos(0);
    setCorriendo(true);

    const fases = getFases(tecnica);
    // Arrancar con la primera fase (inhala)
    const primeraFase = fases[0];
    const duracion = getDuracion(tecnica, primeraFase);
    faseIndexRef.current = 0;
    setFase(primeraFase);
    setCuenta(duracion);
    hablar('Inhala');

    if (cuentaIntervalRef.current) clearInterval(cuentaIntervalRef.current);
    let c = duracion;
    cuentaIntervalRef.current = setInterval(() => {
      c -= 1;
      setCuenta(c);
    }, 1000);

    timeoutRef.current = setTimeout(() => {
      clearInterval(cuentaIntervalRef.current!);
      avanzarFase(tecnica, fases, 0, 0);
    }, duracion * 1000);
  }, [tecnica, avanzarFase, hablar]);

  // Detener sesión
  const detener = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (cuentaIntervalRef.current) clearInterval(cuentaIntervalRef.current);
    if (vozActiva && typeof window !== 'undefined') window.speechSynthesis?.cancel();
    setCorriendo(false);
    setFase('parado');
    setCuenta(0);
  }, [vozActiva]);

  // Cambiar técnica (detiene si está corriendo)
  const cambiarTecnica = (id: string) => {
    if (corriendo) detener();
    setTecnicaId(id);
  };

  // Etiqueta del botón principal
  const descripcionFase =
    fase === 'inhala' ? `Inhala durante ${tecnica.inhala} segundos`
    : fase === 'reten1' ? `Retén ${tecnica.reten1} segundos`
    : fase === 'exhala' ? `Exhala durante ${tecnica.exhala} segundos`
    : fase === 'reten2' ? `Retén ${tecnica.reten2} segundos`
    : 'Pulsa Iniciar para comenzar';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🫁 Guía de Respiración Consciente</h1>
        <p className={styles.subtitle}>
          Elige una técnica, pulsa Iniciar y deja que el círculo te guíe.
          Respira con calma y a tu ritmo.
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="medical"
        severity="medium"
        title="Herramienta de bienestar"
      >
        Estas técnicas son ejercicios de bienestar general. Si tienes una condición
        respiratoria (asma, EPOC, SAOS) o cardiovascular, consulta a tu médico antes
        de practicar ejercicios de retención de respiración.
      </DisclaimerCard>

      {/* Selección de técnica */}
      <section className={styles.tecnicas} aria-label="Selección de técnica de respiración">
        <h2 className={styles.seccionTitulo}>Elige tu técnica</h2>
        <div className={styles.tecnicaGrid} role="group" aria-label="Técnicas disponibles">
          {TECNICAS.map(t => (
            <button
              key={t.id}
              className={`${styles.tecnicaCard} ${tecnicaId === t.id ? styles.tecnicaActiva : ''}`}
              onClick={() => cambiarTecnica(t.id)}
              aria-pressed={tecnicaId === t.id}
              aria-label={`${t.nombre}: ${t.descripcion}`}
            >
              <span className={styles.tecnicaIcono} aria-hidden="true">{t.icono}</span>
              <span className={styles.tecnicaNombre}>{t.nombre}</span>
              <span className={styles.tecnicaDesc}>{t.descripcion}</span>
              <span className={styles.tecnicaRitmo}>
                {[t.inhala, t.reten1, t.exhala, t.reten2]
                  .filter(n => n > 0)
                  .join(' - ')}s
              </span>
            </button>
          ))}
        </div>
        <p className={styles.tecnicaUsos}>
          <strong>Ideal para:</strong> {tecnica.usos}
        </p>
      </section>

      {/* Círculo animado */}
      <section className={styles.ejercicioSection} aria-label="Ejercicio de respiración">
        {/* Contador de ciclos */}
        <div className={styles.ciclosInfo} aria-live="polite" aria-atomic="true">
          <span className={styles.ciclosNum}>{ciclos}</span>
          <span className={styles.ciclosLabel}>{ciclos === 1 ? 'ciclo' : 'ciclos'}</span>
        </div>

        {/* Círculo principal */}
        <div
          className={styles.circuloWrapper}
          role="img"
          aria-label={`${configFase.texto}. ${descripcionFase}`}
        >
          <div
            className={styles.circuloExterno}
            style={{
              transform: `scale(${configFase.escala})`,
              backgroundColor: configFase.color,
              transition: fase === 'parado' ? 'none'
                : fase === 'inhala' ? `transform ${tecnica.inhala}s ease-in-out, background-color 0.5s ease`
                : fase === 'exhala' ? `transform ${tecnica.exhala}s ease-in-out, background-color 0.5s ease`
                : 'background-color 0.5s ease',
            }}
          >
            <div className={styles.circuloInterno}>
              {corriendo && cuenta > 0 && (
                <span className={styles.cuentaNum} style={{ color: configFase.colorTexto }}>
                  {cuenta}
                </span>
              )}
              {!corriendo && (
                <span className={styles.iconoEspera} aria-hidden="true">🫁</span>
              )}
            </div>
          </div>
        </div>

        {/* Texto de fase */}
        <div className={styles.faseInfo} aria-live="assertive" aria-atomic="true">
          <p className={styles.faseTitulo} style={{ color: corriendo ? configFase.color : '#2E86AB' }}>
            {corriendo ? configFase.texto : 'Preparado'}
          </p>
          <p className={styles.faseDesc}>{descripcionFase}</p>
        </div>

        {/* Botones */}
        <div className={styles.controles}>
          {!corriendo ? (
            <button
              className={styles.btnIniciar}
              onClick={iniciar}
              aria-label="Iniciar ejercicio de respiración"
            >
              ▶ Iniciar
            </button>
          ) : (
            <button
              className={styles.btnDetener}
              onClick={detener}
              aria-label="Detener ejercicio de respiración"
            >
              ⏹ Detener
            </button>
          )}

          <button
            className={`${styles.btnVoz} ${vozActiva ? styles.vozOn : styles.vozOff}`}
            onClick={() => setVozActiva(prev => !prev)}
            aria-pressed={vozActiva}
            aria-label={vozActiva ? 'Voz guiada activada, pulsar para desactivar' : 'Voz guiada desactivada, pulsar para activar'}
          >
            {vozActiva ? '🔊 Voz activada' : '🔇 Voz desactivada'}
          </button>
        </div>
      </section>

      <EducationalSection
        title="📚 ¿Por qué funciona la respiración consciente?"
        subtitle="Ciencia y beneficios de las técnicas de respiración"
      >
        <section className={styles.guiaSeccion}>
          <h2>El poder de la respiración</h2>
          <p>
            La respiración es la única función vital que podemos controlar conscientemente.
            Al hacerlo, activamos el sistema nervioso parasimpático (el &quot;freno&quot; del estrés)
            y reducimos la respuesta de lucha o huida del cuerpo. En pocos minutos, se puede
            notar una reducción real de la ansiedad y la tensión muscular.
          </p>

          <h2>Las 4 técnicas en detalle</h2>
          <ul>
            <li>
              <strong>🌬️ Diafragmática (4-6)</strong>: La respiración natural y profunda.
              Activa el diafragma en lugar del pecho. La exhalación más larga que la inhalación
              estimula el nervio vago y reduce la frecuencia cardíaca. Ideal para principiantes y EPOC.
            </li>
            <li>
              <strong>⬜ Cuadrada (4-4-4-4)</strong>: Usada por fuerzas especiales y meditadores.
              Las retenciones equilibran el CO₂ en sangre y mejoran la concentración.
              Excelente para prepararse antes de una situación estresante.
            </li>
            <li>
              <strong>💤 4-7-8</strong>: Desarrollada por el Dr. Andrew Weil.
              La retención larga (7s) actúa como sedante natural del sistema nervioso.
              Especialmente eficaz para reducir la ansiedad aguda y facilitar el sueño.
            </li>
            <li>
              <strong>💙 Coherente (5-5)</strong>: Crea coherencia entre el ritmo cardíaco
              y la respiración. Mejora el equilibrio emocional y la variabilidad de la
              frecuencia cardíaca (HRV), un indicador de salud cardiovascular.
            </li>
          </ul>

          <h2>¿Cuándo practicar?</h2>
          <ul>
            <li><strong>Por la mañana</strong>: 5 minutos de respiración cuadrada para arrancar enfocado</li>
            <li><strong>Antes de dormir</strong>: 4-7-8 para desconectar y conciliar el sueño</li>
            <li><strong>En momentos de estrés</strong>: Diafragmática para una calma rápida</li>
            <li><strong>En meditación</strong>: Coherente para un estado de equilibrio profundo</li>
          </ul>

          <h2>Para personas con necesidades especiales</h2>
          <ul>
            <li><strong>Autismo</strong>: El ritmo visual predecible del círculo ayuda a la regulación sensorial</li>
            <li><strong>TDAH</strong>: 2-3 minutos de respiración mejoran la concentración antes de una tarea</li>
            <li><strong>Ansiedad</strong>: La técnica 4-7-8 puede interrumpir un ciclo de ansiedad en pocos ciclos</li>
            <li><strong>EPOC</strong>: La respiración diafragmática mejora la eficiencia respiratoria. Siempre con supervisión médica.</li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('guia-respiracion')} />
      <Footer appName="guia-respiracion" />
    </div>
  );
}
