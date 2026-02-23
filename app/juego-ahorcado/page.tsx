'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './JuegoAhorcado.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

type Categoria = 'animales' | 'paises' | 'profesiones' | 'vocabulario';

interface Estadisticas {
  partidas: number;
  victorias: number;
  racha: number;
  mejorRacha: number;
}

const MAX_ERRORES = 6;

const ABECEDARIO_FILAS = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
  ['J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q'],
  ['R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
];

const PALABRAS: Record<Categoria, string[]> = {
  animales: [
    'ELEFANTE', 'COCODRILO', 'MURCIELAGO', 'DELFIN', 'JIRAFA', 'CANGURO',
    'PINGUINO', 'CAMALEON', 'TIBURON', 'MARIPOSA', 'TORTUGA', 'FLAMENCO',
    'HIPOPOTAMO', 'GUEPARDO', 'AVESTRUZ', 'GORILA', 'SERPIENTE', 'ERIZO',
    'ARDILLA', 'SALAMANDRA', 'MAPACHE', 'ORNITORRINCO', 'CAPIBARA', 'SURICATA',
    'ALBATROS', 'MANATI', 'AXOLOTE', 'IGUANA', 'TARANTULA', 'CALAMAR',
  ],
  paises: [
    'ALEMANIA', 'PORTUGAL', 'BELGICA', 'AUSTRALIA', 'NORUEGA', 'FINLANDIA',
    'MARRUECOS', 'TAILANDIA', 'ARGENTINA', 'COLOMBIA', 'FILIPINAS', 'INDONESIA',
    'VENEZUELA', 'ESLOVENIA', 'ESLOVAQUIA', 'ZIMBABUE', 'CAMERUN', 'MOZAMBIQUE',
    'AZERBAIYAN', 'KAZAJISTAN', 'SINGAPUR', 'MALDIVAS', 'LUXEMBURGO', 'ISLANDIA',
    'CROACIA', 'TANZANIA', 'JORDANIA', 'ARMENIA', 'CAMBODIA', 'URUGUAY',
  ],
  profesiones: [
    'CARPINTERO', 'FONTANERO', 'ELECTRICISTA', 'PERIODISTA', 'VETERINARIO',
    'ARQUITECTO', 'ECONOMISTA', 'PSICOLOGO', 'INGENIERO', 'COCINERO',
    'AGRICULTOR', 'ASTRONAUTA', 'DIPLOMATICO', 'ARQUEOLOGO', 'PODOLOGA',
    'LOGOPEDA', 'METEOROLOGO', 'ENFERMERO', 'FOTOGRAFO', 'OCEANOGRAFO',
    'CRIMINOLOGO', 'TAXIDERMISTA', 'SOMMELIER', 'ORTOFONISTA', 'TOPOGRAFO',
    'CARTOGRAFO', 'VULCANOLOGO', 'ENTOMOLOGA', 'MUSICOLOGA', 'SILVICULTOR',
  ],
  vocabulario: [
    'ORDENADOR', 'BIBLIOTECA', 'PARAGUAS', 'CALENDARIO', 'MONTANA',
    'DICCIONARIO', 'TELEFONO', 'PELICULA', 'GEOGRAFIA', 'MATEMATICAS',
    'QUIMICA', 'TECNOLOGIA', 'AUTOMOVIL', 'SUPERMERCADO', 'RESTAURANTE',
    'AEROPUERTO', 'FERROCARRIL', 'SUBMARINO', 'TELESCOPIO', 'MICROSCOPIO',
    'VITAMINA', 'FOTOGRAFIA', 'MAGNETISMO', 'TERREMOTO', 'VOLCAN',
    'ARRECIFE', 'PENINSULA', 'ESTALACTITA', 'MEANDRO', 'DESIERTO',
  ],
};

const ETIQUETAS: Record<Categoria, string> = {
  animales: '🐾 Animales',
  paises: '🌍 Países',
  profesiones: '💼 Profesiones',
  vocabulario: '📚 Vocabulario',
};

// Partes del cuerpo del ahorcado (se muestran según número de errores)
function DibujoAhorcado({ errores }: { errores: number }) {
  return (
    <svg
      viewBox="0 0 200 180"
      className={styles.svgWrapper}
      aria-label={`Ahorcado con ${errores} errores`}
    >
      {/* Patíbulo (siempre visible) */}
      <line x1="20" y1="170" x2="180" y2="170" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="170" x2="50" y2="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="10" x2="130" y2="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="130" y1="10" x2="130" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 2" />

      {/* Cabeza */}
      {errores >= 1 && (
        <circle cx="130" cy="47" r="17" stroke="currentColor" strokeWidth="3" fill="none" />
      )}
      {/* Cuerpo */}
      {errores >= 2 && (
        <line x1="130" y1="64" x2="130" y2="110" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      )}
      {/* Brazo izquierdo */}
      {errores >= 3 && (
        <line x1="130" y1="74" x2="105" y2="96" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      )}
      {/* Brazo derecho */}
      {errores >= 4 && (
        <line x1="130" y1="74" x2="155" y2="96" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      )}
      {/* Pierna izquierda */}
      {errores >= 5 && (
        <line x1="130" y1="110" x2="110" y2="140" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      )}
      {/* Pierna derecha */}
      {errores >= 6 && (
        <line x1="130" y1="110" x2="150" y2="140" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      )}
    </svg>
  );
}

const STATS_KEY = 'ahorcado-stats';
const STATS_INICIAL: Estadisticas = { partidas: 0, victorias: 0, racha: 0, mejorRacha: 0 };

export default function JuegoAhorcadoPage() {
  const [categoria, setCategoria] = useState<Categoria>('animales');
  const [palabra, setPalabra] = useState<string>('');
  const [letrasUsadas, setLetrasUsadas] = useState<Set<string>>(new Set());
  const [errores, setErrores] = useState<number>(0);
  const [juegoTerminado, setJuegoTerminado] = useState<boolean>(false);
  const [ganado, setGanado] = useState<boolean>(false);
  const [estadisticas, setEstadisticas] = useState<Estadisticas>(STATS_INICIAL);

  // Cargar estadísticas desde localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STATS_KEY);
      if (saved) setEstadisticas(JSON.parse(saved) as Estadisticas);
    } catch {
      // Ignorar error de localStorage
    }
  }, []);

  const guardarStats = useCallback((stats: Estadisticas) => {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch {
      // Ignorar error de localStorage
    }
    setEstadisticas(stats);
  }, []);

  const nuevaPalabra = useCallback((cat: Categoria) => {
    const lista = PALABRAS[cat];
    const elegida = lista[Math.floor(Math.random() * lista.length)];
    setPalabra(elegida);
    setLetrasUsadas(new Set());
    setErrores(0);
    setJuegoTerminado(false);
    setGanado(false);
  }, []);

  // Iniciar juego al montar
  useEffect(() => {
    nuevaPalabra('animales');
  }, [nuevaPalabra]);

  const cambiarCategoria = (cat: Categoria) => {
    setCategoria(cat);
    nuevaPalabra(cat);
  };

  const pulsarLetra = (letra: string) => {
    if (juegoTerminado || letrasUsadas.has(letra) || !palabra) return;

    const nuevasLetras = new Set(letrasUsadas);
    nuevasLetras.add(letra);
    setLetrasUsadas(nuevasLetras);

    if (!palabra.includes(letra)) {
      const nuevosErrores = errores + 1;
      setErrores(nuevosErrores);

      if (nuevosErrores >= MAX_ERRORES) {
        setJuegoTerminado(true);
        setGanado(false);
        const nuevasStats: Estadisticas = {
          ...estadisticas,
          partidas: estadisticas.partidas + 1,
          racha: 0,
        };
        guardarStats(nuevasStats);
      }
    } else {
      const todasDescubiertas = palabra.split('').every(l => nuevasLetras.has(l));
      if (todasDescubiertas) {
        setJuegoTerminado(true);
        setGanado(true);
        const nuevaRacha = estadisticas.racha + 1;
        const nuevasStats: Estadisticas = {
          partidas: estadisticas.partidas + 1,
          victorias: estadisticas.victorias + 1,
          racha: nuevaRacha,
          mejorRacha: Math.max(nuevaRacha, estadisticas.mejorRacha),
        };
        guardarStats(nuevasStats);
      }
    }
  };

  const resetStats = () => {
    if (confirm('¿Reiniciar todas las estadísticas?')) {
      guardarStats(STATS_INICIAL);
    }
  };

  const letrasCorrectas = new Set(palabra.split('').filter(l => letrasUsadas.has(l)));
  const letrasIncorrectas = new Set([...letrasUsadas].filter(l => !palabra.includes(l)));

  const mensajeEstado = () => {
    if (!juegoTerminado) return `🎯 ${MAX_ERRORES - errores} intentos restantes`;
    if (ganado) return '🎉 ¡Lo has adivinado!';
    return `💀 Era: ${palabra}`;
  };

  const claseEstado = juegoTerminado
    ? (ganado ? styles.estadoGanado : styles.estadoPerdido)
    : styles.estadoJugando;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>🎯 Juego del Ahorcado</h1>
        <p className={styles.subtitle}>Adivina la palabra letra a letra · 4 categorías en español</p>
      </header>

      <LegalNotice />

      {/* Selector de categoría */}
      <div className={styles.categoriaBar}>
        <div className={styles.categoriaBtnWrapper}>
          {(Object.keys(ETIQUETAS) as Categoria[]).map(cat => (
            <button
              key={cat}
              onClick={() => cambiarCategoria(cat)}
              className={`${styles.categoriaBtn} ${categoria === cat ? styles.active : ''}`}
              aria-pressed={categoria === cat}
            >
              {ETIQUETAS[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Área de juego */}
      <div className={styles.gameArea}>
        {/* Panel izquierdo: dibujo + estadísticas */}
        <div className={styles.svgPanel}>
          <DibujoAhorcado errores={errores} />

          <p className={styles.errorCount}>
            Errores: <span>{errores}</span> / {MAX_ERRORES}
          </p>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValor}>{estadisticas.partidas}</span>
              <span className={styles.statLabel}>Partidas</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValor}>{estadisticas.victorias}</span>
              <span className={styles.statLabel}>Victorias</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValor}>{estadisticas.racha}</span>
              <span className={styles.statLabel}>Racha actual</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValor}>{estadisticas.mejorRacha}</span>
              <span className={styles.statLabel}>Mejor racha</span>
            </div>
          </div>
        </div>

        {/* Panel derecho: palabra + teclado */}
        <div className={styles.gamePanel}>
          {/* Estado */}
          <div className={`${styles.estadoJuego} ${claseEstado}`} role="alert" aria-live="polite">
            {mensajeEstado()}
          </div>

          {/* Palabra */}
          <div className={styles.palabraWrapper} aria-label={`Palabra: ${palabra.split('').map(l => letrasUsadas.has(l) ? l : '_').join(' ')}`}>
            {palabra.split('').map((letra, i) => {
              const descubierta = letrasUsadas.has(letra);
              const perdida = juegoTerminado && !ganado && !descubierta;
              return (
                <span
                  key={i}
                  className={`${styles.letra} ${descubierta ? styles.letraRevelada : ''} ${perdida ? styles.letraPerdida : ''}`}
                >
                  {(descubierta || perdida) ? letra : '\u00A0'}
                </span>
              );
            })}
          </div>

          {/* Teclado virtual */}
          <div className={styles.teclado} role="group" aria-label="Teclado de letras">
            {ABECEDARIO_FILAS.map((fila, fi) => (
              <div key={fi} className={styles.tecladoFila}>
                {fila.map(letra => {
                  const correcta = letrasCorrectas.has(letra);
                  const incorrecta = letrasIncorrectas.has(letra);
                  return (
                    <button
                      key={letra}
                      onClick={() => pulsarLetra(letra)}
                      disabled={letrasUsadas.has(letra) || juegoTerminado}
                      className={`${styles.tecla} ${correcta ? styles.teclaCorrecta : ''} ${incorrecta ? styles.teclaIncorrecta : ''}`}
                      aria-label={`Letra ${letra}${correcta ? ', correcta' : incorrecta ? ', incorrecta' : ''}`}
                    >
                      {letra}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Botones de acción */}
          <div className={styles.accionBtns}>
            <button
              onClick={() => nuevaPalabra(categoria)}
              className={styles.btnNueva}
            >
              {juegoTerminado ? '🔄 Nueva palabra' : '⏭️ Saltar palabra'}
            </button>
            <button
              onClick={resetStats}
              className={styles.btnReset}
              aria-label="Reiniciar estadísticas"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>

      <RelatedApps apps={getRelatedApps('juego-ahorcado')} />
      <Footer appName="juego-ahorcado" />
    </div>
  );
}
