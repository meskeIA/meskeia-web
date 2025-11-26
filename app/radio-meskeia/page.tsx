'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import styles from './RadioMeskeia.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';

interface Emisora {
  id: string;
  nombre: string;
  categoria: string;
  url: string;
  logo: string;
  pais: string;
}

type Categoria = 'todas' | 'favoritos' | 'musica' | 'noticias' | 'deportes' | 'variada';

const EMISORAS: Emisora[] = [
  // Música
  { id: 'los40', nombre: 'Los 40 Principales', categoria: 'musica', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/LOS40.mp3', logo: '🎵', pais: 'España' },
  { id: 'cadena100', nombre: 'Cadena 100', categoria: 'musica', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CADENA100.mp3', logo: '💯', pais: 'España' },
  { id: 'europaFM', nombre: 'Europa FM', categoria: 'musica', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/EUROPAFM.mp3', logo: '🌍', pais: 'España' },
  { id: 'kissfm', nombre: 'Kiss FM', categoria: 'musica', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KISSFM.mp3', logo: '💋', pais: 'España' },
  { id: 'maxima', nombre: 'Máxima FM', categoria: 'musica', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/MAXIMAFM.mp3', logo: '🔊', pais: 'España' },
  { id: 'melodia', nombre: 'Melodía FM', categoria: 'musica', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/MELODIAFM.mp3', logo: '🎶', pais: 'España' },
  { id: 'rockfm', nombre: 'RockFM', categoria: 'musica', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/ROCK_FM.mp3', logo: '🎸', pais: 'España' },
  { id: 'dialtal', nombre: 'Dial Tal Cual', categoria: 'musica', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CADENADIAL.mp3', logo: '📻', pais: 'España' },

  // Noticias
  { id: 'cadenaser', nombre: 'Cadena SER', categoria: 'noticias', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CADENASER.mp3', logo: '📰', pais: 'España' },
  { id: 'cope', nombre: 'COPE', categoria: 'noticias', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/COPE.mp3', logo: '🎙️', pais: 'España' },
  { id: 'ondacero', nombre: 'Onda Cero', categoria: 'noticias', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/ONDACERO.mp3', logo: '🔵', pais: 'España' },
  { id: 'rne', nombre: 'RNE Radio Nacional', categoria: 'noticias', url: 'https://rtvelivestreamv3.akamaized.net/rne/rne_r1_main.m3u8', logo: '🇪🇸', pais: 'España' },

  // Deportes
  { id: 'radiomarca', nombre: 'Radio MARCA', categoria: 'deportes', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/RADIOMARCA.mp3', logo: '⚽', pais: 'España' },

  // Variada
  { id: 'rac1', nombre: 'RAC1', categoria: 'variada', url: 'https://streaming.rac1.cat/rac1', logo: '📡', pais: 'Catalunya' },
  { id: 'radioole', nombre: 'Radio Olé', categoria: 'variada', url: 'https://playerservices.streamtheworld.com/api/livestream-redirect/RADIOOLE.mp3', logo: '🎺', pais: 'España' },
];

const CATEGORIAS: { id: Categoria; nombre: string }[] = [
  { id: 'todas', nombre: '📻 Todas' },
  { id: 'favoritos', nombre: '❤️ Favoritos' },
  { id: 'musica', nombre: '🎵 Música' },
  { id: 'noticias', nombre: '📰 Noticias' },
  { id: 'deportes', nombre: '⚽ Deportes' },
  { id: 'variada', nombre: '🎭 Variada' },
];

export default function RadioMeskeiaPage() {
  const [emisoraActual, setEmisoraActual] = useState<Emisora | null>(null);
  const [reproduciendo, setReproduciendo] = useState(false);
  const [volumen, setVolumen] = useState(80);
  const [categoria, setCategoria] = useState<Categoria>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [muted, setMuted] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cargar favoritos del localStorage
  useEffect(() => {
    const saved = localStorage.getItem('meskeia-radio-favoritos');
    if (saved) {
      setFavoritos(JSON.parse(saved));
    }
  }, []);

  // Guardar favoritos
  const guardarFavoritos = useCallback((nuevosFavoritos: string[]) => {
    setFavoritos(nuevosFavoritos);
    localStorage.setItem('meskeia-radio-favoritos', JSON.stringify(nuevosFavoritos));
  }, []);

  // Inicializar audio
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volumen / 100;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Actualizar volumen
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volumen / 100;
    }
  }, [volumen, muted]);

  // Reproducir emisora
  const reproducirEmisora = useCallback((emisora: Emisora) => {
    if (audioRef.current) {
      // Si es la misma emisora, toggle play/pause
      if (emisoraActual?.id === emisora.id) {
        if (reproduciendo) {
          audioRef.current.pause();
          setReproduciendo(false);
        } else {
          audioRef.current.play().catch(console.error);
          setReproduciendo(true);
        }
        return;
      }

      // Nueva emisora
      audioRef.current.pause();
      audioRef.current.src = emisora.url;
      audioRef.current.play().catch(console.error);
      setEmisoraActual(emisora);
      setReproduciendo(true);
    }
  }, [emisoraActual, reproduciendo]);

  // Toggle play/pause
  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !emisoraActual) return;

    if (reproduciendo) {
      audioRef.current.pause();
      setReproduciendo(false);
    } else {
      audioRef.current.play().catch(console.error);
      setReproduciendo(true);
    }
  }, [reproduciendo, emisoraActual]);

  // Detener
  const detener = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      setReproduciendo(false);
      setEmisoraActual(null);
    }
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
  const emisorasFiltradas = EMISORAS.filter(emisora => {
    // Filtro por búsqueda
    if (busqueda) {
      const searchLower = busqueda.toLowerCase();
      if (!emisora.nombre.toLowerCase().includes(searchLower) &&
          !emisora.categoria.toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // Filtro por categoría
    if (categoria === 'favoritos') {
      return favoritos.includes(emisora.id);
    }
    if (categoria !== 'todas') {
      return emisora.categoria === categoria;
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

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>📻 Radio meskeIA</h1>
        <p className={styles.subtitle}>Emisoras online en español</p>
      </header>

      {/* Reproductor actual */}
      <div className={styles.reproductorActual}>
        {emisoraActual ? (
          <>
            <div className={styles.emisoraInfo}>
              <div className={styles.emisoraLogo}>{emisoraActual.logo}</div>
              <h2 className={styles.emisoraNombre}>{emisoraActual.nombre}</h2>
              <div className={styles.emisoraCategoria}>
                {emisoraActual.pais}
                <span className={`${styles.estadoReproduccion} ${!reproduciendo ? styles.pausado : ''}`}>
                  {reproduciendo ? '● En vivo' : '⏸ Pausado'}
                </span>
              </div>
            </div>

            {/* Visualizador */}
            <div className={`${styles.visualizador} ${!reproduciendo ? styles.pausado : ''}`}>
              <div className={styles.barra}></div>
              <div className={styles.barra}></div>
              <div className={styles.barra}></div>
              <div className={styles.barra}></div>
              <div className={styles.barra}></div>
              <div className={styles.barra}></div>
              <div className={styles.barra}></div>
            </div>

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
              >
                {reproduciendo ? '⏸' : '▶'}
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
          placeholder="🔍 Buscar emisora..."
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
          <span>Emisoras</span>
          <span className={styles.contadorEmisoras}>{emisorasFiltradas.length} disponibles</span>
        </div>

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
                    {emisora.categoria.charAt(0).toUpperCase() + emisora.categoria.slice(1)} • {emisora.pais}
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
                ? 'No tienes emisoras favoritas aún'
                : 'No se encontraron emisoras'}
            </div>
          )}
        </div>
      </div>

      <Footer appName="radio-meskeia" />
    </div>
  );
}
