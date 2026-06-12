'use client';
// @disclaimer: exempt

import { useState, useEffect, useCallback } from 'react';
import styles from './JuegoAhorcado.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
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
    'CROACIA', 'TANZANIA', 'JORDANIA', 'ARMENIA', 'CAMBOYA', 'URUGUAY',
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
    // Núcleo original
    'ORDENADOR', 'BIBLIOTECA', 'PARAGUAS', 'CALENDARIO', 'MONTANA',
    'DICCIONARIO', 'TELEFONO', 'PELICULA', 'GEOGRAFIA', 'MATEMATICAS',
    'QUIMICA', 'TECNOLOGIA', 'AUTOMOVIL', 'SUPERMERCADO', 'RESTAURANTE',
    'AEROPUERTO', 'FERROCARRIL', 'SUBMARINO', 'TELESCOPIO', 'MICROSCOPIO',
    'VITAMINA', 'FOTOGRAFIA', 'MAGNETISMO', 'TERREMOTO', 'VOLCAN',
    'ARRECIFE', 'PENINSULA', 'ESTALACTITA', 'MEANDRO', 'DESIERTO',
    // Ampliación: palabras frecuentes del español (cruce de lista de frecuencias
    // de subtítulos + Lemario de Olea para validar existencia en el lemario)
    'ABOGADO', 'ACCIDENTE', 'ACERCA', 'ACUERDO', 'ADELANTE', 'AFUERA',
    'AGENTE', 'ALGUIEN', 'ALREDEDOR', 'ANOCHE', 'ARRIBA', 'ASUNTO',
    'AYUDAR', 'BASTANTE', 'BONITO', 'BUSCAR', 'CABEZA', 'CAMBIAR',
    'CAMBIO', 'CAMINO', 'CARIÑO', 'CENTRO', 'CIERTO', 'CIUDAD',
    'COMIDA', 'COMPRAR', 'CONMIGO', 'CONTIGO', 'CONTRA', 'CONTROL',
    'CORRECTO', 'CUANDO', 'CUARTO', 'CUATRO', 'CUENTA', 'CUERPO',
    'CUIDADO', 'DEMASIADO', 'DENTRO', 'DERECHO', 'DIFERENTE', 'DINERO',
    'DIVERTIDO', 'DOCTOR', 'DORMIR', 'EMPEZAR', 'ENCIMA', 'ENCONTRADO',
    'ENCONTRAR', 'ENTENDIDO', 'ENTRAR', 'EQUIPO', 'ESCUCHA', 'ESCUELA',
    'ESPECIAL', 'ESPERA', 'ESPERAR', 'ESPOSA', 'ESTADO', 'EXTRAÑO',
    'FAMILIA', 'FIESTA', 'FRENTE', 'FUERTE', 'FUERZA', 'FUTURO',
    'GENERAL', 'GENIAL', 'GRANDE', 'GUERRA', 'HABLAR', 'HAMBRE',
    'HERMANO', 'HISTORIA', 'HOMBRE', 'HOSPITAL', 'IMPORTANTE', 'IMPOSIBLE',
    'LAMENTO', 'LLAMADA', 'LLAMADO', 'LLAMAR', 'LLEGADO', 'LLEGAR',
    'LLEVAR', 'MANERA', 'MAÑANA', 'MARIDO', 'MENSAJE', 'MINUTO',
    'MOMENTO', 'NEGOCIO', 'NOMBRE', 'NORMAL', 'NUESTRO', 'OFICIAL',
    'OFICINA', 'PALABRA', 'PASADO', 'PENSAR', 'PEQUEÑO', 'PERDER',
    'PERDIDO', 'PERFECTO', 'PERSONA', 'PERSONAL', 'PIENSO', 'POSIBLE',
    'PREGUNTA', 'PRESIDENTE', 'PRIMER', 'PRIMERA', 'PRIMERO', 'PROBLEMA',
    'PRONTO', 'PROPIO', 'PRUEBA', 'PUEBLO', 'PUERTA', 'PUESTO',
    'QUERIDO', 'REALIDAD', 'REALMENTE', 'RECUERDO', 'RESPUESTA', 'SECRETO',
    'SEGUIR', 'SEGUNDO', 'SEGURIDAD', 'SEGURO', 'SEMANA', 'SENTIDO',
    'SENTIR', 'SIEMPRE', 'SIGUIENTE', 'SISTEMA', 'SUERTE', 'SUFICIENTE',
    'TIEMPO', 'TIENDA', 'TIERRA', 'TOTALMENTE', 'TRABAJAR', 'TRABAJO',
    'TRANQUILO', 'VERDAD', 'VOLVER', 'VUELTA', 'VUELTO',
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

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Quieres dominar el juego del Ahorcado?"
        subtitle="Aprende estrategia, curiosidades del español y consejos para ganar siempre"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section className={styles.guideSection}>
          <h2>Niveles de dificultad</h2>
          <p>
            Las palabras del ahorcado varían mucho en dificultad según su longitud y frecuencia de uso.
            Aquí tienes una guía para saber qué esperar en cada nivel.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Nivel</th>
                  <th>Longitud de la palabra</th>
                  <th>Intentos dados</th>
                  <th>Estrategia de letras</th>
                  <th>Vocabulario ejercitado</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🟢 Fácil</td>
                  <td>4–5 letras</td>
                  <td>6 errores</td>
                  <td>Vocales primero, luego S y R</td>
                  <td>Palabras cotidianas frecuentes</td>
                </tr>
                <tr>
                  <td>🟡 Medio</td>
                  <td>6–7 letras</td>
                  <td>6 errores</td>
                  <td>A, E, O → S, R, N, L, T</td>
                  <td>Vocabulario general amplio</td>
                </tr>
                <tr>
                  <td>🔴 Difícil</td>
                  <td>8+ letras</td>
                  <td>6 errores</td>
                  <td>Deducir por patrones de sufijos</td>
                  <td>Términos técnicos y compuestos</td>
                </tr>
                <tr>
                  <td>⚫ Experto</td>
                  <td>Variable (palabras raras)</td>
                  <td>6 errores</td>
                  <td>Buscar letras distintivas únicas</td>
                  <td>Léxico poco frecuente del español</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section className={styles.guideSection}>
          <h2>¿Quién juega al ahorcado?</h2>
          <p>
            El juego del ahorcado tiene aplicaciones muy distintas según el jugador.
            Aquí tienes tres perfiles habituales.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🧒</span>
                <h4>Niños ampliando vocabulario</h4>
              </div>
              <p className={styles.escenarioExample}>
                Un niño de 8 años juega al ahorcado en español para aprender palabras nuevas
                de forma lúdica. Cada partida le introduce términos que no conocía.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: empieza por la categoría Animales, con palabras conocidas pero que
                se escriben de forma sorprendente (MURCIELAGO, ORNITORRINCO).
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📖</span>
                <h4>Aprendizaje de palabras poco frecuentes</h4>
              </div>
              <p className={styles.escenarioExample}>
                Un adulto que quiere enriquecer su vocabulario en español juega con la categoría
                Vocabulario, descubriendo términos como ESTALACTITA, MEANDRO o ARRECIFE.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: cuando pierdas una partida y veas la palabra revelada, búscala en el
                diccionario. Aprenderás una palabra nueva en cada derrota.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👨‍👩‍👧</span>
                <h4>Juego entre amigos y familia</h4>
              </div>
              <p className={styles.escenarioExample}>
                Una familia lo usa en sobremesa para pasar el tiempo. Turnan el uso del
                dispositivo y hacen competencia de quién tiene mejor racha.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: usa la categoría Países para los más viajados y Profesiones para
                quien trabaje con vocabulario técnico. El contador de racha añade emoción.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre el ahorcado</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cuál es la letra más frecuente del español?</summary>
                <p>
                  La letra más frecuente del español es la E, que según estudios de frecuencia
                  léxica del español (basados en corpus lingüísticos como el CREA de la RAE)
                  aparece en aproximadamente el 13,7 % de todos los textos escritos. Le siguen
                  la A (12,5 %), la O (8,7 %), la S (8 %), la R (6,9 %) y la N (6,7 %). Esta
                  frecuencia hace que empezar siempre por las vocales sea la estrategia óptima
                  en el ahorcado.
                </p>
                <p className={styles.faqTip}>
                  Dato: la frecuencia de letras en español difiere del inglés, donde la E
                  también lidera pero las siguientes posiciones cambian notablemente.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cuál es la estrategia óptima para el ahorcado?</summary>
                <p>
                  La estrategia más eficiente parte de las letras con mayor frecuencia estadística
                  en el español: primero vocales (E, A, O, I, U), luego las consonantes más
                  comunes (S, R, N, L, T, C, D). Una vez reveladas algunas letras, el patrón
                  visible te permite deducir palabras enteras gracias al reconocimiento de prefijos
                  y sufijos habituales (-CIÓN, -MENTE, -ISMO, DES-, RE-, PRE-).
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué letras debo probar primero?</summary>
                <p>
                  El orden recomendado por frecuencia estadística en español es: E → A → O →
                  S → R → N → I → L → T → C → U → D → P → M → G → B. Reserva para el final
                  las letras raras: Z, X, K, W, J, Ñ. La Ñ es exclusiva del español y aunque
                  poco frecuente, puede ser clave en ciertas palabras.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿El ahorcado mejora el vocabulario?</summary>
                <p>
                  Sí, especialmente cuando el jugador encuentra palabras desconocidas. Al ver
                  la palabra revelada tras una derrota, el contexto emocional (haber perdido)
                  refuerza la memorización. Estudios sobre aprendizaje de vocabulario en L1 y L2
                  muestran que los juegos de palabras con retroalimentación inmediata son más
                  efectivos que la memorización pasiva de listas.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cuántas letras tiene el español que no tiene el inglés?</summary>
                <p>
                  El español tiene la Ñ, letra exclusiva de este idioma y algunos otros del
                  mundo hispánico. También utiliza dígrafos históricos como CH y LL (aunque
                  la RAE los eliminó del abecedario oficial en 1994, siguen siendo sonidos
                  propios). Además, el español usa acentos gráficos (tildes) sobre vocales
                  (á, é, í, ó, ú) y la diéresis (ü), ausentes en el inglés estándar.
                </p>
                <p className={styles.faqTip}>
                  En el ahorcado, la Ñ merece atención especial: aunque poco frecuente,
                  palabras como MAÑANA, MONTAÑA o ESPAÑA la incluyen y puede ser la letra
                  decisiva.
                </p>
              </details>
            </li>
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section className={styles.guideSection}>
          <h2>Cómo jugar al ahorcado con estrategia: 5 pasos</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Empieza siempre por las vocales (A, E, O)</strong>
                <p>
                  Las vocales cubren más del 40 % de las letras en cualquier palabra española.
                  Probar E, A y O en las primeras jugadas te da un mapa claro de la estructura
                  de la palabra sin arriesgar demasiados errores.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Prueba las consonantes más frecuentes (S, R, N, L, T)</strong>
                <p>
                  Una vez conocidas las vocales, estas cinco consonantes son las más habituales
                  en el español. Pruébalas en orden de frecuencia para maximizar la información
                  obtenida con el menor número de errores posible.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Deduce por el patrón de letras reveladas</strong>
                <p>
                  Con varias letras en su posición, busca prefijos y sufijos comunes en español:
                  -CIÓN, -MENTE, -ISMO, -ADOR, DES-, RE-, SUB-. Reconocer estos patrones
                  reduce drásticamente el espacio de palabras posibles.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Evita las letras poco frecuentes hasta tener más contexto</strong>
                <p>
                  No pruebes Z, X, K, W, J ni Q hasta que tengas información suficiente.
                  Gastar intentos en estas letras raras sin pistas previas es el error más
                  común de los jugadores novatos.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>Adivina la palabra cuando tengas suficiente información</strong>
                <p>
                  Cuando el patrón visible + las letras descartadas te dejen pocas opciones,
                  identifica la palabra completa. Intentar adivinarla demasiado pronto, con
                  pocas pistas, desperdicia la ventaja acumulada con una buena estrategia de letras.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section className={styles.guideSection}>
          <h2>4 consejos para mejorar en el ahorcado</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔤</span>
              <h4>Las vocales primero, siempre</h4>
              <p>
                Las vocales (A, E, I, O, U) cubren la mitad del alfabeto en términos de
                frecuencia estadística en el español. Empezar por ellas es la regla más
                importante y la que más partidas gana.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">👁️</span>
              <h4>Recuerda las letras ya usadas</h4>
              <p>
                El teclado visual de la app marca las letras ya probadas. Úsalo como referencia
                constante para no repetir una letra incorrecta y desperdiciar un intento que
                ya no cambia nada.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧩</span>
              <h4>Piensa en familias de palabras</h4>
              <p>
                Cuando veas letras reveladas, piensa en grupos de palabras con esa estructura.
                Si ves _ A _ _ A _ A, probablemente la palabra tenga terminación femenina o
                plural. Las letras en su posición son pistas muy valiosas.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🇪🇸</span>
              <h4>La Ñ existe en español, no la olvides</h4>
              <p>
                A diferencia del inglés, el español tiene la Ñ. Aunque aparece en pocas palabras,
                puede ser la letra definitiva. El teclado del juego la incluye: MAÑANA, España,
                MONTAÑA, CAÑÓN son ejemplos habituales.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>4 errores frecuentes en el ahorcado</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Empezar por consonantes poco frecuentes (Z, X, K, W).</strong> Probar
                estas letras en los primeros turnos es un desperdicio estadístico. Aparecen
                en menos del 1 % de las letras del español y reducen tus intentos sin aportar
                casi información útil.
              </li>
              <li>
                <strong>Repetir letras ya probadas.</strong> Cada vez que intentas una letra
                que ya usaste, pierdes un intento sin ninguna ganancia. Mira siempre el teclado
                visual antes de pulsar cualquier letra.
              </li>
              <li>
                <strong>Adivinar la palabra demasiado pronto sin suficientes letras.</strong>{' '}
                Con solo una o dos letras reveladas, el número de palabras posibles es enorme.
                Espera a tener al menos el 40-50 % de las letras visibles antes de intentar
                adivinar la palabra completa.
              </li>
              <li>
                <strong>Ignorar los patrones de prefijos y sufijos comunes en español.</strong>{' '}
                Terminaciones como -CIÓN, -MENTE, -ISMO, -ADOR y prefijos como DES-, RE-, PRE-,
                SUB- son muy frecuentes. Reconocerlos cuando aparezcan letras en esas posiciones
                te dará una ventaja decisiva sobre el juego.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('juego-ahorcado')} />
      <ShareCard appName="juego-ahorcado" />
      <Footer appName="juego-ahorcado" />
    </div>
  );
}
