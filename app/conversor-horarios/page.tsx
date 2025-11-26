'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './ConversorHorarios.module.css';
import { MeskeiaLogo, Footer } from '@/components';

// ==================== TIPOS ====================

interface ZonaHoraria {
  id: string;
  nombre: string;
  zona: string;
  pais: string;
  emoji: string;
}

// ==================== DATOS ====================

const zonasHorarias: ZonaHoraria[] = [
  // Europa
  { id: 'madrid', nombre: 'Madrid', zona: 'Europe/Madrid', pais: 'España', emoji: '🇪🇸' },
  { id: 'londres', nombre: 'Londres', zona: 'Europe/London', pais: 'Reino Unido', emoji: '🇬🇧' },
  { id: 'paris', nombre: 'París', zona: 'Europe/Paris', pais: 'Francia', emoji: '🇫🇷' },
  { id: 'berlin', nombre: 'Berlín', zona: 'Europe/Berlin', pais: 'Alemania', emoji: '🇩🇪' },
  { id: 'roma', nombre: 'Roma', zona: 'Europe/Rome', pais: 'Italia', emoji: '🇮🇹' },
  { id: 'amsterdam', nombre: 'Ámsterdam', zona: 'Europe/Amsterdam', pais: 'Países Bajos', emoji: '🇳🇱' },
  { id: 'moscu', nombre: 'Moscú', zona: 'Europe/Moscow', pais: 'Rusia', emoji: '🇷🇺' },
  { id: 'estambul', nombre: 'Estambul', zona: 'Europe/Istanbul', pais: 'Turquía', emoji: '🇹🇷' },
  // América
  { id: 'nueva_york', nombre: 'Nueva York', zona: 'America/New_York', pais: 'EE.UU.', emoji: '🇺🇸' },
  { id: 'los_angeles', nombre: 'Los Ángeles', zona: 'America/Los_Angeles', pais: 'EE.UU.', emoji: '🇺🇸' },
  { id: 'chicago', nombre: 'Chicago', zona: 'America/Chicago', pais: 'EE.UU.', emoji: '🇺🇸' },
  { id: 'mexico', nombre: 'Ciudad de México', zona: 'America/Mexico_City', pais: 'México', emoji: '🇲🇽' },
  { id: 'bogota', nombre: 'Bogotá', zona: 'America/Bogota', pais: 'Colombia', emoji: '🇨🇴' },
  { id: 'lima', nombre: 'Lima', zona: 'America/Lima', pais: 'Perú', emoji: '🇵🇪' },
  { id: 'buenos_aires', nombre: 'Buenos Aires', zona: 'America/Argentina/Buenos_Aires', pais: 'Argentina', emoji: '🇦🇷' },
  { id: 'santiago', nombre: 'Santiago', zona: 'America/Santiago', pais: 'Chile', emoji: '🇨🇱' },
  { id: 'sao_paulo', nombre: 'São Paulo', zona: 'America/Sao_Paulo', pais: 'Brasil', emoji: '🇧🇷' },
  // Asia
  { id: 'tokio', nombre: 'Tokio', zona: 'Asia/Tokyo', pais: 'Japón', emoji: '🇯🇵' },
  { id: 'pekin', nombre: 'Pekín', zona: 'Asia/Shanghai', pais: 'China', emoji: '🇨🇳' },
  { id: 'hong_kong', nombre: 'Hong Kong', zona: 'Asia/Hong_Kong', pais: 'Hong Kong', emoji: '🇭🇰' },
  { id: 'singapur', nombre: 'Singapur', zona: 'Asia/Singapore', pais: 'Singapur', emoji: '🇸🇬' },
  { id: 'seul', nombre: 'Seúl', zona: 'Asia/Seoul', pais: 'Corea del Sur', emoji: '🇰🇷' },
  { id: 'dubai', nombre: 'Dubái', zona: 'Asia/Dubai', pais: 'EAU', emoji: '🇦🇪' },
  { id: 'mumbai', nombre: 'Bombay', zona: 'Asia/Kolkata', pais: 'India', emoji: '🇮🇳' },
  { id: 'bangkok', nombre: 'Bangkok', zona: 'Asia/Bangkok', pais: 'Tailandia', emoji: '🇹🇭' },
  // Oceanía
  { id: 'sydney', nombre: 'Sídney', zona: 'Australia/Sydney', pais: 'Australia', emoji: '🇦🇺' },
  { id: 'auckland', nombre: 'Auckland', zona: 'Pacific/Auckland', pais: 'Nueva Zelanda', emoji: '🇳🇿' },
  // África
  { id: 'cairo', nombre: 'El Cairo', zona: 'Africa/Cairo', pais: 'Egipto', emoji: '🇪🇬' },
  { id: 'johannesburgo', nombre: 'Johannesburgo', zona: 'Africa/Johannesburg', pais: 'Sudáfrica', emoji: '🇿🇦' },
];

// ==================== COMPONENTE PRINCIPAL ====================

export default function ConversorHorariosPage() {
  // Estado
  const [zonaOrigen, setZonaOrigen] = useState('madrid');
  const [horaOrigen, setHoraOrigen] = useState('');
  const [fechaOrigen, setFechaOrigen] = useState('');
  const [zonasSeleccionadas, setZonasSeleccionadas] = useState<string[]>(['nueva_york', 'tokio', 'londres']);
  const [horaActual, setHoraActual] = useState(new Date());

  // Actualizar hora actual cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setHoraActual(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Inicializar fecha y hora actual
  useEffect(() => {
    const ahora = new Date();
    setHoraOrigen(ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }));
    setFechaOrigen(ahora.toISOString().split('T')[0]);
  }, []);

  // Obtener hora en una zona horaria específica
  const obtenerHoraEnZona = (zona: string, fecha: Date): string => {
    try {
      return fecha.toLocaleTimeString('es-ES', {
        timeZone: zona,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      return '--:--:--';
    }
  };

  // Obtener fecha en una zona horaria específica
  const obtenerFechaEnZona = (zona: string, fecha: Date): string => {
    try {
      return fecha.toLocaleDateString('es-ES', {
        timeZone: zona,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return '--';
    }
  };

  // Convertir hora de origen a otras zonas
  const horasConvertidas = useMemo(() => {
    if (!horaOrigen || !fechaOrigen) return [];

    const zonaOrigenData = zonasHorarias.find(z => z.id === zonaOrigen);
    if (!zonaOrigenData) return [];

    // Crear fecha con la hora de origen
    const [horas, minutos] = horaOrigen.split(':').map(Number);
    const fechaBase = new Date(fechaOrigen);
    fechaBase.setHours(horas, minutos, 0, 0);

    // Obtener offset de la zona origen
    const formatoOrigen = new Intl.DateTimeFormat('en-US', {
      timeZone: zonaOrigenData.zona,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // Crear fecha UTC equivalente
    const partes = formatoOrigen.formatToParts(fechaBase);
    const getValue = (type: string) => partes.find(p => p.type === type)?.value || '0';

    const fechaEnOrigen = new Date(
      `${getValue('year')}-${getValue('month')}-${getValue('day')}T${getValue('hour')}:${getValue('minute')}:${getValue('second')}`
    );

    // Calcular diferencia y crear fecha UTC
    const diffMs = fechaBase.getTime() - fechaEnOrigen.getTime();
    const fechaUTC = new Date(fechaBase.getTime() + diffMs);

    return zonasSeleccionadas.map(zonaId => {
      const zona = zonasHorarias.find(z => z.id === zonaId);
      if (!zona) return null;

      const horaConvertida = obtenerHoraEnZona(zona.zona, fechaUTC);
      const fechaConvertida = obtenerFechaEnZona(zona.zona, fechaUTC);

      return {
        ...zona,
        hora: horaConvertida,
        fecha: fechaConvertida,
      };
    }).filter(Boolean);
  }, [zonaOrigen, horaOrigen, fechaOrigen, zonasSeleccionadas]);

  // Toggle zona seleccionada
  const toggleZona = (zonaId: string) => {
    if (zonasSeleccionadas.includes(zonaId)) {
      setZonasSeleccionadas(zonasSeleccionadas.filter(z => z !== zonaId));
    } else if (zonasSeleccionadas.length < 6) {
      setZonasSeleccionadas([...zonasSeleccionadas, zonaId]);
    }
  };

  // Usar hora actual
  const usarHoraActual = () => {
    const ahora = new Date();
    setHoraOrigen(ahora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false }));
    setFechaOrigen(ahora.toISOString().split('T')[0]);
  };

  // Zona origen datos
  const zonaOrigenData = zonasHorarias.find(z => z.id === zonaOrigen);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Conversor de Horarios</h1>
        <p className={styles.subtitle}>
          Convierte horarios entre zonas horarias del mundo
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de origen */}
        <section className={styles.origenPanel}>
          <h2 className={styles.sectionTitle}>Hora de origen</h2>
          <div className={styles.origenForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Ciudad</label>
                <select
                  value={zonaOrigen}
                  onChange={(e) => setZonaOrigen(e.target.value)}
                  className={styles.select}
                >
                  {zonasHorarias.map(zona => (
                    <option key={zona.id} value={zona.id}>
                      {zona.emoji} {zona.nombre} ({zona.pais})
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label>Hora</label>
                <input
                  type="time"
                  value={horaOrigen}
                  onChange={(e) => setHoraOrigen(e.target.value)}
                  className={styles.inputTime}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Fecha</label>
                <input
                  type="date"
                  value={fechaOrigen}
                  onChange={(e) => setFechaOrigen(e.target.value)}
                  className={styles.inputDate}
                />
              </div>
            </div>
            <button onClick={usarHoraActual} className={styles.btnActual}>
              🕐 Usar hora actual
            </button>
          </div>
        </section>

        {/* Resultados */}
        <section className={styles.resultadosPanel}>
          <h2 className={styles.sectionTitle}>
            Hora en otras ciudades
            <span className={styles.contador}>({zonasSeleccionadas.length}/6 seleccionadas)</span>
          </h2>

          {horasConvertidas.length > 0 ? (
            <div className={styles.resultadosGrid}>
              {horasConvertidas.map((resultado) => resultado && (
                <div key={resultado.id} className={styles.resultadoCard}>
                  <div className={styles.resultadoHeader}>
                    <span className={styles.resultadoEmoji}>{resultado.emoji}</span>
                    <div className={styles.resultadoInfo}>
                      <span className={styles.resultadoCiudad}>{resultado.nombre}</span>
                      <span className={styles.resultadoPais}>{resultado.pais}</span>
                    </div>
                    <button
                      onClick={() => toggleZona(resultado.id)}
                      className={styles.btnRemover}
                      title="Quitar"
                    >
                      ✕
                    </button>
                  </div>
                  <div className={styles.resultadoHora}>{resultado.hora}</div>
                  <div className={styles.resultadoFecha}>{resultado.fecha}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.sinResultados}>Selecciona ciudades para ver los horarios</p>
          )}
        </section>

        {/* Selector de zonas */}
        <section className={styles.selectorPanel}>
          <h2 className={styles.sectionTitle}>Añadir ciudades</h2>
          <div className={styles.zonasGrid}>
            {zonasHorarias
              .filter(z => z.id !== zonaOrigen && !zonasSeleccionadas.includes(z.id))
              .map(zona => (
                <button
                  key={zona.id}
                  onClick={() => toggleZona(zona.id)}
                  className={styles.zonaBtn}
                  disabled={zonasSeleccionadas.length >= 6}
                >
                  {zona.emoji} {zona.nombre}
                </button>
              ))}
          </div>
        </section>

        {/* Reloj mundial actual */}
        <section className={styles.relojPanel}>
          <h2 className={styles.sectionTitle}>Hora actual en el mundo</h2>
          <div className={styles.relojGrid}>
            {[
              zonasHorarias.find(z => z.id === 'madrid'),
              zonasHorarias.find(z => z.id === 'londres'),
              zonasHorarias.find(z => z.id === 'nueva_york'),
              zonasHorarias.find(z => z.id === 'tokio'),
            ].filter(Boolean).map(zona => zona && (
              <div key={zona.id} className={styles.relojItem}>
                <span className={styles.relojCiudad}>{zona.emoji} {zona.nombre}</span>
                <span className={styles.relojHora}>{obtenerHoraEnZona(zona.zona, horaActual)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Info panel */}
      <section className={styles.infoPanel}>
        <h3>Sobre esta herramienta</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>🌍</span>
            <div>
              <strong>+25 ciudades</strong>
              <p>Principales zonas horarias del mundo</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>⏰</span>
            <div>
              <strong>Tiempo real</strong>
              <p>Reloj mundial actualizado cada segundo</p>
            </div>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoIcon}>📅</span>
            <div>
              <strong>Cualquier fecha</strong>
              <p>Convierte horarios de fechas pasadas o futuras</p>
            </div>
          </div>
        </div>
      </section>

      <Footer appName="conversor-horarios" />
    </div>
  );
}
