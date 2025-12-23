'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './RadioMeskeia.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps } from '@/components';
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

      <RelatedApps apps={getRelatedApps('radio-meskeia')} />

      <Footer appName="radio-meskeia" />
    </div>
  );
}
