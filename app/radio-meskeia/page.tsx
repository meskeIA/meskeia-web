'use client';
// @disclaimer: exempt

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './RadioMeskeia.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import Hls from 'hls.js';

// Tipos para la API de radio-browser.info
interface RadioStation {
  stationuuid: string;
  name: string;
  url: string;
  url_resolved: string;
  favicon: string;
  tags: string;
  country: string;
  countrycode: string;
  language: string;
  votes: number;
  codec: string;
  bitrate: number;
}

interface Emisora {
  id: string;
  nombre: string;
  categoria: string;
  url: string;
  logo: string;
  pais: string;
  codec: string;
  bitrate: number;
  votos: number;
}

type Categoria = 'todas' | 'favoritos' | 'espana' | 'latinoamerica' | 'musica' | 'noticias';

// Emisoras destacadas por defecto (se muestran mientras carga la API)
const EMISORAS_DESTACADAS: Emisora[] = [
  { id: 'los40-default', nombre: 'Los 40 Principales', categoria: 'musica', url: '', logo: '🎵', pais: 'España', codec: 'MP3', bitrate: 128, votos: 100 },
  { id: 'cadena-ser-default', nombre: 'Cadena SER', categoria: 'noticias', url: '', logo: '📰', pais: 'España', codec: 'MP3', bitrate: 128, votos: 100 },
];

// Servidores de la API (usar varios por redundancia)
const API_SERVERS = [
  'de1.api.radio-browser.info',
  'nl1.api.radio-browser.info',
  'at1.api.radio-browser.info',
];

export default function RadioMeskeiaPage() {
  const [emisoras, setEmisoras] = useState<Emisora[]>(EMISORAS_DESTACADAS);
  const [emisoraActual, setEmisoraActual] = useState<Emisora | null>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volumen, setVolumen] = useState(80);
  const [categoria, setCategoria] = useState<Categoria>('espana');
  const [busqueda, setBusqueda] = useState('');
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [muted, setMuted] = useState(false);
  const [cargandoEmisoras, setCargandoEmisoras] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Obtener servidor API aleatorio
  const getApiServer = () => {
    return API_SERVERS[Math.floor(Math.random() * API_SERVERS.length)];
  };

  // Cargar favoritos del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('meskeia-radio-favoritos-v2');
    if (saved) {
      try {
        setFavoritos(JSON.parse(saved));
      } catch {
        // Ignorar error de parsing
      }
    }
  }, []);

  // Guardar favoritos
  const guardarFavoritos = useCallback((nuevosFavoritos: string[]) => {
    setFavoritos(nuevosFavoritos);
    localStorage.setItem('meskeia-radio-favoritos-v2', JSON.stringify(nuevosFavoritos));
  }, []);

  // Convertir estación de API a formato interno
  const convertirEstacion = (station: RadioStation): Emisora => {
    // Determinar categoría basada en tags
    let categoria = 'musica';
    const tagsLower = station.tags.toLowerCase();
    if (tagsLower.includes('news') || tagsLower.includes('noticias') || tagsLower.includes('talk')) {
      categoria = 'noticias';
    }

    // Emoji basado en categoría/país
    let logo = '📻';
    if (categoria === 'noticias') logo = '📰';
    else if (tagsLower.includes('rock')) logo = '🎸';
    else if (tagsLower.includes('pop')) logo = '🎵';
    else if (tagsLower.includes('classical') || tagsLower.includes('clasica')) logo = '🎻';
    else if (tagsLower.includes('jazz')) logo = '🎷';
    else if (tagsLower.includes('electronic') || tagsLower.includes('dance')) logo = '🎧';
    else if (tagsLower.includes('latin') || tagsLower.includes('salsa') || tagsLower.includes('reggaeton')) logo = '💃';
    else if (tagsLower.includes('sports') || tagsLower.includes('deportes')) logo = '⚽';

    return {
      id: station.stationuuid,
      nombre: station.name.trim(),
      categoria,
      url: station.url_resolved || station.url,
      logo,
      pais: station.country || 'Desconocido',
      codec: station.codec || 'MP3',
      bitrate: station.bitrate || 128,
      votos: station.votes || 0,
    };
  };

  // Cargar emisoras desde la API
  const cargarEmisoras = useCallback(async (filtro: Categoria) => {
    setCargandoEmisoras(true);
    setError(null);

    try {
      const server = getApiServer();
      let url = '';

      switch (filtro) {
        case 'espana':
          url = `https://${server}/json/stations/bycountrycodeexact/ES?limit=50&order=votes&reverse=true&hidebroken=true`;
          break;
        case 'latinoamerica':
          // Países hispanohablantes de Latinoamérica
          url = `https://${server}/json/stations/bylanguageexact/spanish?limit=50&order=votes&reverse=true&hidebroken=true`;
          break;
        case 'musica':
          url = `https://${server}/json/stations/bylanguageexact/spanish?limit=50&order=votes&reverse=true&hidebroken=true&tag=music`;
          break;
        case 'noticias':
          url = `https://${server}/json/stations/bylanguageexact/spanish?limit=50&order=votes&reverse=true&hidebroken=true&tag=news`;
          break;
        case 'favoritos':
        case 'todas':
        default:
          url = `https://${server}/json/stations/bylanguageexact/spanish?limit=100&order=votes&reverse=true&hidebroken=true`;
          break;
      }

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'meskeIA Radio/1.0',
        },
      });

      if (!response.ok) {
        throw new Error('Error al conectar con el servidor de radio');
      }

      const stations: RadioStation[] = await response.json();

      // Filtrar estaciones válidas y convertir
      const emisorasValidas = stations
        .filter(s => s.url_resolved || s.url)
        .map(convertirEstacion)
        // Eliminar duplicados por nombre similar
        .filter((emisora, index, self) =>
          index === self.findIndex(e => e.nombre.toLowerCase() === emisora.nombre.toLowerCase())
        );

      setEmisoras(emisorasValidas);
    } catch (err) {
      console.error('Error cargando emisoras:', err);
      setError('No se pudieron cargar las emisoras. Inténtalo de nuevo.');
      // Mantener las emisoras anteriores si las hay
    } finally {
      setCargandoEmisoras(false);
    }
  }, []);

  // Cargar emisoras al cambiar categoría
  useEffect(() => {
    if (categoria !== 'favoritos') {
      cargarEmisoras(categoria);
    }
  }, [categoria, cargarEmisoras]);

  // Inicializar audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volumen / 100;

    // Eventos de audio
    const audio = audioRef.current;

    const handleError = () => {
      console.error('Error de reproducción');
      setError('No se pudo reproducir la emisora. Prueba con otra.');
      setReproduciendo(false);
      setCargando(false);
    };

    const handleCanPlay = () => {
      setCargando(false);
    };

    const handlePlaying = () => {
      setReproduciendo(true);
      setCargando(false);
      setError(null);
    };

    const handleWaiting = () => {
      setCargando(true);
    };

    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('playing', handlePlaying);
    audio.addEventListener('waiting', handleWaiting);

    return () => {
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('playing', handlePlaying);
      audio.removeEventListener('waiting', handleWaiting);

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      audio.pause();
    };
  }, []);

  // Actualizar volumen
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volumen / 100;
    }
  }, [volumen, muted]);

  // Reproducir emisora
  const reproducirEmisora = useCallback(async (emisora: Emisora) => {
    if (!audioRef.current) return;

    // Si es la misma emisora, toggle play/pause
    if (emisoraActual?.id === emisora.id) {
      if (reproduciendo) {
        audioRef.current.pause();
        setReproduciendo(false);
      } else {
        try {
          await audioRef.current.play();
          setReproduciendo(true);
        } catch (err) {
          console.error('Error al reanudar:', err);
        }
      }
      return;
    }

    // Limpiar HLS anterior si existe
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Nueva emisora
    setCargando(true);
    setError(null);
    setEmisoraActual(emisora);
    audioRef.current.pause();

    const url = emisora.url;
    const isHLS = url.includes('.m3u8') || url.includes('m3u8');

    try {
      if (isHLS && Hls.isSupported()) {
        // Usar HLS.js para streams m3u8
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsRef.current = hls;

        hls.loadSource(url);
        hls.attachMedia(audioRef.current);

        hls.on(Hls.Events.MANIFEST_PARSED, async () => {
          try {
            await audioRef.current?.play();
            setReproduciendo(true);
          } catch (err) {
            console.error('Error HLS play:', err);
            setError('No se pudo reproducir la emisora');
            setCargando(false);
          }
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error('Error HLS fatal:', data);
            setError('Error de conexión con la emisora');
            setCargando(false);
            setReproduciendo(false);
          }
        });
      } else if (isHLS && audioRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Safari soporta HLS nativamente
        audioRef.current.src = url;
        await audioRef.current.play();
        setReproduciendo(true);
      } else {
        // Stream normal (MP3, AAC, etc.)
        audioRef.current.src = url;
        await audioRef.current.play();
        setReproduciendo(true);
      }
    } catch (err) {
      console.error('Error al reproducir:', err);
      setError('No se pudo conectar con la emisora');
      setCargando(false);
      setReproduciendo(false);
    }
  }, [emisoraActual, reproduciendo]);

  // Toggle play/pause
  const togglePlayPause = useCallback(async () => {
    if (!audioRef.current || !emisoraActual) return;

    if (reproduciendo) {
      audioRef.current.pause();
      setReproduciendo(false);
    } else {
      try {
        await audioRef.current.play();
        setReproduciendo(true);
      } catch (err) {
        console.error('Error al reanudar:', err);
      }
    }
  }, [reproduciendo, emisoraActual]);

  // Detener
  const detener = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    setReproduciendo(false);
    setCargando(false);
    setEmisoraActual(null);
    setError(null);
  }, []);

  // Toggle favorito
  const toggleFavorito = useCallback((emisoraId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const nuevosFavoritos = favoritos.includes(emisoraId)
      ? favoritos.filter(id => id !== emisoraId)
      : [...favoritos, emisoraId];

    guardarFavoritos(nuevosFavoritos);
  }, [favoritos, guardarFavoritos]);

  // Filtrar emisoras
  const emisorasFiltradas = emisoras.filter(emisora => {
    // Filtro por búsqueda
    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      if (!emisora.nombre.toLowerCase().includes(searchLower) &&
          !emisora.pais.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Filtro por favoritos
    if (categoria === 'favoritos') {
      return favoritos.includes(emisora.id);
    }

    return true;
  });

  // Toggle mute
  const toggleMute = () => {
    setMuted(m => !m);
  };

  // Obtener icono de volumen
  const getVolumenIcon = () => {
    if (muted || volumen === 0) return '🔇';
    if (volumen < 30) return '🔈';
    if (volumen < 70) return '🔉';
    return '🔊';
  };

  const CATEGORIAS: { id: Categoria; nombre: string }[] = [
    { id: 'espana', nombre: '🇪🇸 España' },
    { id: 'latinoamerica', nombre: '🌎 Latinoamérica' },
    { id: 'musica', nombre: '🎵 Música' },
    { id: 'noticias', nombre: '📰 Noticias' },
    { id: 'favoritos', nombre: '❤️ Favoritos' },
    { id: 'todas', nombre: '📻 Todas' },
  ];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📻 Radio meskeIA</h1>
        <p className={styles.subtitle}>Miles de emisoras en español de todo el mundo</p>
      </header>

      <LegalNotice />

      {/* Reproductor actual */}
      <div className={styles.reproductorActual}>
        {emisoraActual ? (
          <>
            <div className={styles.emisoraInfo}>
              <div className={styles.emisoraLogo}>{emisoraActual.logo}</div>
              <h2 className={styles.emisoraNombre}>{emisoraActual.nombre}</h2>
              <div className={styles.emisoraCategoria}>
                {emisoraActual.pais} • {emisoraActual.bitrate}kbps
                <span className={`${styles.estadoReproduccion} ${cargando ? styles.cargando : ''} ${!reproduciendo && !cargando ? styles.pausado : ''}`}>
                  {cargando ? '⏳ Conectando...' : reproduciendo ? '● En vivo' : '⏸ Pausado'}
                </span>
              </div>
            </div>

            {/* Visualizador */}
            <div className={`${styles.visualizador} ${!reproduciendo || cargando ? styles.pausado : ''}`}>
              <div className={styles.barra}></div>
              <div className={styles.barra}></div>
              <div className={styles.barra}></div>
              <div className={styles.barra}></div>
              <div className={styles.barra}></div>
              <div className={styles.barra}></div>
              <div className={styles.barra}></div>
            </div>

            {/* Error */}
            {error && (
              <div className={styles.errorMsg}>
                ⚠️ {error}
              </div>
            )}

            {/* Controles */}
            <div className={styles.controles}>
              <button
                className={`${styles.btnControl} ${styles.btnSecundario}`}
                onClick={detener}
                title="Detener"
              >
                ⏹
              </button>

              <button
                className={`${styles.btnControl} ${styles.btnPlayPause}`}
                onClick={togglePlayPause}
                disabled={cargando}
              >
                {cargando ? '⏳' : reproduciendo ? '⏸' : '▶'}
              </button>

              <button
                className={`${styles.btnControl} ${styles.btnSecundario} ${favoritos.includes(emisoraActual.id) ? styles.favorito : ''}`}
                onClick={() => toggleFavorito(emisoraActual.id)}
                title={favoritos.includes(emisoraActual.id) ? 'Quitar de favoritos' : 'Añadir a favoritos'}
              >
                {favoritos.includes(emisoraActual.id) ? '❤️' : '🤍'}
              </button>
            </div>

            {/* Control de volumen */}
            <div className={styles.volumenContainer}>
              <span className={styles.volumenIcon} onClick={toggleMute}>
                {getVolumenIcon()}
              </span>
              <input
                type="range"
                min="0"
                max="100"
                value={volumen}
                onChange={(e) => setVolumen(parseInt(e.target.value))}
                className={styles.volumenSlider}
              />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', minWidth: '35px' }}>
                {volumen}%
              </span>
            </div>
          </>
        ) : (
          <div className={styles.sinEmisora}>
            <p>🎧 Selecciona una emisora para empezar</p>
          </div>
        )}
      </div>

      {/* Buscador */}
      <div className={styles.buscador}>
        <input
          type="text"
          className={styles.inputBuscar}
          placeholder="🔍 Buscar emisora o país..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Filtros */}
      <div className={styles.filtros}>
        {CATEGORIAS.map((cat) => (
          <button
            key={cat.id}
            className={`${styles.filtroBtn} ${categoria === cat.id ? styles.active : ''}`}
            onClick={() => setCategoria(cat.id)}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* Lista de emisoras */}
      <div className={styles.listaEmisoras}>
        <div className={styles.listaHeader}>
          <span>Emisoras {cargandoEmisoras && '(cargando...)'}</span>
          <span className={styles.contadorEmisoras}>{emisorasFiltradas.length} disponibles</span>
        </div>

        {cargandoEmisoras ? (
          <div className={styles.loadingEmisoras}>
            <div className={styles.spinner}></div>
            <p>Cargando emisoras...</p>
          </div>
        ) : (
          <div className={styles.emisorasGrid}>
            {emisorasFiltradas.length > 0 ? (
              emisorasFiltradas.map((emisora) => (
                <div
                  key={emisora.id}
                  className={`${styles.emisoraItem} ${emisoraActual?.id === emisora.id ? styles.activa : ''}`}
                  onClick={() => reproducirEmisora(emisora)}
                >
                  <div className={styles.emisoraItemLogo}>{emisora.logo}</div>
                  <div className={styles.emisoraItemInfo}>
                    <div className={styles.emisoraItemNombre}>{emisora.nombre}</div>
                    <div className={styles.emisoraItemCategoria}>
                      {emisora.pais} • {emisora.bitrate}kbps
                    </div>
                  </div>
                  <button
                    className={`${styles.emisoraItemFav} ${favoritos.includes(emisora.id) ? styles.esFavorito : ''}`}
                    onClick={(e) => toggleFavorito(emisora.id, e)}
                  >
                    {favoritos.includes(emisora.id) ? '❤️' : '🤍'}
                  </button>
                </div>
              ))
            ) : (
              <div className={styles.sinResultados}>
                {categoria === 'favoritos'
                  ? 'No tienes emisoras favoritas aún. ¡Añade algunas!'
                  : busqueda
                  ? 'No se encontraron emisoras con ese nombre'
                  : 'No hay emisoras disponibles'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className={styles.infoSection}>
        <p>
          📡 Emisoras proporcionadas por <a href="https://www.radio-browser.info" target="_blank" rel="noopener noreferrer">Radio Browser</a> (base de datos comunitaria)
        </p>
      </div>

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Quieres sacar más partido a la radio online?"
        subtitle="Descubre qué género musical ayuda a concentrarte, cuándo escuchar y cómo sacarle el máximo provecho al streaming de audio"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section className={styles.guideSection}>
          <h2>Géneros y tipos de emisora: guía rápida</h2>
          <p>
            No todas las emisoras son iguales para cada momento. Esta tabla compara los cuatro
            tipos más comunes según su efecto en la concentración, el estado de ánimo y la actividad
            que mejor acompaña.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo de emisora</th>
                  <th>Concentración al trabajar</th>
                  <th>Estado de ánimo</th>
                  <th>Momento del día recomendado</th>
                  <th>Actividad compatible</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>🎵 Música pop / hits</td>
                  <td>Baja (letra distrae)</td>
                  <td>Animado y festivo</td>
                  <td>Tarde / noche</td>
                  <td>Ejercicio, tareas del hogar, conducir</td>
                </tr>
                <tr>
                  <td>🎷 Jazz / clásica</td>
                  <td>Alta (sin letra)</td>
                  <td>Relajado y sofisticado</td>
                  <td>Mañana / tarde</td>
                  <td>Teletrabajo, lectura, estudio</td>
                </tr>
                <tr>
                  <td>📰 Noticias / radio generalista</td>
                  <td>Muy baja (contenido verbal)</td>
                  <td>Informado, activo</td>
                  <td>Mañana temprano</td>
                  <td>Desayuno, rutina matinal, cocinar</td>
                </tr>
                <tr>
                  <td>🎧 Ambient / lo-fi trabajo</td>
                  <td>Muy alta (sin letra, ritmo constante)</td>
                  <td>Sereno y enfocado</td>
                  <td>Cualquier hora</td>
                  <td>Teletrabajo intenso, programar, escribir</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section className={styles.guideSection}>
          <h2>Situaciones reales: quién usa radio online y cómo</h2>
          <p>
            La radio online se adapta a momentos muy distintos del día. Aquí tienes tres
            perfiles habituales con su contexto y consejo práctico.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
                <h4>Teletrabajador buscando concentración</h4>
              </div>
              <p className={styles.escenarioExample}>
                María trabaja desde casa y necesita música de fondo que no la distraiga.
                Prueba emisoras de jazz instrumental o lo-fi a volumen bajo (30-40 %) y
                nota que su productividad mejora sin interrupciones lingüísticas.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: evita emisoras con locutores o publicidad frecuente durante bloques
                de trabajo intenso; opta por géneros instrumentales continuos.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏃</span>
                <h4>Persona haciendo deporte en casa</h4>
              </div>
              <p className={styles.escenarioExample}>
                Carlos hace su rutina de ejercicio en el salón. Elige emisoras de pop
                energético o radio dance a volumen más alto (60-70 %) para mantener
                el ritmo y la motivación durante toda la sesión.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: prepara con antelación la emisora antes de empezar para no perder
                calor corporal buscando durante el entrenamiento.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🍳</span>
                <h4>Escucha de noticias mientras cocina</h4>
              </div>
              <p className={styles.escenarioExample}>
                Ana aprovecha el tiempo de cocinar para escuchar las noticias de la mañana
                en una emisora generalista. El audio de fondo le mantiene informada sin
                necesitar mirar ninguna pantalla.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: las emisoras de radio generalista funcionan perfectamente para
                tareas manuales que no requieren atención cognitiva elevada.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre radio online y streaming</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <details>
                <summary>¿La música mejora la productividad al trabajar?</summary>
                <p>
                  Depende del tipo de tarea y del género. Para tareas repetitivas o
                  manuales, la música de fondo mejora el rendimiento y el estado de ánimo.
                  Para tareas que requieren procesamiento verbal intenso (redactar, leer
                  textos complejos), la música con letra puede interferir negativamente.
                  La música instrumental, el jazz o el ambient son las opciones más neutras
                  para el trabajo cognitivo.
                </p>
                <p className={styles.faqTip}>
                  Referencia: efecto Mozart y estudios de productividad con música instrumental
                  sin letra en entornos laborales.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué género es mejor para estudiar?</summary>
                <p>
                  Los géneros instrumentales sin letra son los más recomendados para el
                  estudio: música clásica, jazz suave, lo-fi hip-hop o sonidos ambientales.
                  Estos géneros evitan la interferencia lingüística que produce la letra de
                  las canciones con el procesamiento de texto escrito. El ritmo constante
                  y predecible también favorece el estado de flujo mental.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿La radio online consume muchos datos?</summary>
                <p>
                  El consumo depende de la calidad del stream. Una emisora estándar a
                  128 kbps consume aproximadamente 58 MB por hora. A 320 kbps (alta
                  calidad) sube a unos 144 MB por hora. En conexión WiFi esto es
                  inapreciable; en datos móviles conviene elegir emisoras de menor bitrate
                  si tienes una tarifa limitada.
                </p>
                <p className={styles.faqTip}>
                  Dato: cada emisora muestra su bitrate en kbps en la lista de Radio meskeIA.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cuál es la diferencia entre radio online y podcast?</summary>
                <p>
                  La radio online es emisión en directo y continua: no puedes pausar ni
                  retroceder, y el contenido es determinado por la emisora en tiempo real.
                  El podcast es contenido grabado bajo demanda: puedes escucharlo cuando
                  quieras, pausar, retroceder y elegir el episodio concreto. La radio
                  es más adecuada para música y noticias del momento; el podcast para
                  formación, entretenimiento estructurado y contenidos en profundidad.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Puedo escuchar radio sin internet?</summary>
                <p>
                  La radio online requiere conexión a internet para el streaming en
                  tiempo real. Sin embargo, la radio FM/AM tradicional funciona sin
                  datos usando la antena del dispositivo. Algunos móviles conservan un
                  sintonizador FM integrado que no consume datos. Para escuchar sin
                  internet también puedes descargar podcasts previamente cuando tengas
                  cobertura.
                </p>
              </details>
            </li>
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section className={styles.guideSection}>
          <h2>Cómo elegir la emisora perfecta: 5 pasos</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Identifica tu estado de ánimo y actividad</strong>
                <p>
                  Antes de elegir emisora, pregúntate qué vas a hacer: trabajar con
                  concentración, hacer ejercicio, cocinar o simplemente relajarte. El
                  contexto define qué tipo de audio es más adecuado en cada momento.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Elige el género apropiado para esa actividad</strong>
                <p>
                  Usa la tabla comparativa de esta sección como referencia. Para
                  concentración, instrumentales. Para ejercicio, pop energético. Para
                  tareas del hogar, noticias o music hits. Para máxima concentración,
                  ambient o lo-fi.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Ajusta el volumen según la actividad</strong>
                <p>
                  Para trabajo cognitivo o estudio, mantén el volumen por debajo del
                  50 % del máximo. Para ejercicio físico puedes subirlo a 60-70 %.
                  El volumen excesivo prolongado puede causar fatiga auditiva.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Usa auriculares para mayor inmersión</strong>
                <p>
                  Los auriculares, especialmente los de cancelación de ruido, mejoran
                  significativamente la experiencia de escucha en entornos con
                  distracciones externas. Son especialmente útiles en espacios
                  compartidos o cuando hay ruido ambiental.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>Explora emisoras nuevas cuando la rutina se vuelve monótona</strong>
                <p>
                  Si una emisora empieza a sentirse repetitiva o distrae en lugar de
                  acompañar, es señal de cambiar. Radio meskeIA tiene miles de emisoras
                  organizadas por país y categoría: aprovecha los filtros para descubrir
                  nuevas opciones.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section className={styles.guideSection}>
          <h2>4 buenas prácticas para escuchar radio con intención</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🎹</span>
              <h4>Música instrumental para tareas cognitivas</h4>
              <p>
                Cuando necesites leer, escribir o resolver problemas, opta siempre
                por música sin letra. La voz humana compite con el procesamiento
                lingüístico del cerebro y reduce el rendimiento en estas tareas.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔁</span>
              <h4>No cambies de emisora constantemente</h4>
              <p>
                Cada cambio de emisora interrumpe el flujo de concentración.
                Elige la emisora antes de empezar la tarea y mantenla hasta que
                termines el bloque de trabajo. Cambiar cada pocos minutos genera
                más distracción que silencio.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔉</span>
              <h4>Volumen por debajo del 50 % para trabajar</h4>
              <p>
                El volumen óptimo de fondo para trabajo intelectual es el que permite
                escuchar la música sin prestarle atención activa. Si te sorprendes
                siguiendo la melodía o la letra, el volumen está demasiado alto.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">☁️</span>
              <h4>Prueba radio ambiental para máxima concentración</h4>
              <p>
                El lo-fi, los café sounds y la música ambient están diseñados
                específicamente para crear un fondo sonoro neutro y constante.
                Son la opción más efectiva cuando necesitas el máximo nivel
                de concentración sostenida.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>4 errores frecuentes al usar radio de fondo</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Música con letra para tareas que requieren leer o escribir.</strong> La
                letra de las canciones interfiere directamente con el procesamiento lingüístico
                del cerebro. Es uno de los mayores enemigos de la concentración al trabajar
                con texto.
              </li>
              <li>
                <strong>Volumen demasiado alto en exposición prolongada.</strong> Escuchar
                audio por encima del 85 dB durante más de dos horas continuadas puede causar
                daño auditivo acumulativo. Mantén el volumen en niveles conversacionales
                y tómate descansos auditivos.
              </li>
              <li>
                <strong>Cambiar de emisora cada pocos minutos.</strong> La búsqueda constante
                de la emisora perfecta crea más interrupciones que la propia música. Decide
                antes de empezar y no vuelvas a tocar el reproductor hasta terminar el bloque
                de trabajo.
              </li>
              <li>
                <strong>Usar radio con publicidad frecuente para concentración profunda.</strong> Los
                cortes publicitarios en emisoras comerciales interrumpen el flujo sonoro de
                forma abrupta. Para sesiones de trabajo intenso, elige emisoras sin publicidad
                o con bloques publicitarios infrecuentes.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('radio-meskeia')} />

      <ShareCard appName="radio-meskeia" />
      <Footer appName="radio-meskeia" />
    </div>
  );
}
