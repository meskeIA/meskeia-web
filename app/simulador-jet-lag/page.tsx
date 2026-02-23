'use client';

import { useState, useMemo } from 'react';
import styles from './SimuladorJetLag.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

interface Ciudad {
  nombre: string;
  pais: string;
  utc: number; // offset en horas
  emoji: string;
}

const CIUDADES: Ciudad[] = [
  // Europa
  { nombre: 'Madrid', pais: 'España', utc: 1, emoji: '🇪🇸' },
  { nombre: 'Lisboa', pais: 'Portugal', utc: 0, emoji: '🇵🇹' },
  { nombre: 'Londres', pais: 'Reino Unido', utc: 0, emoji: '🇬🇧' },
  { nombre: 'París', pais: 'Francia', utc: 1, emoji: '🇫🇷' },
  { nombre: 'Berlín', pais: 'Alemania', utc: 1, emoji: '🇩🇪' },
  { nombre: 'Roma', pais: 'Italia', utc: 1, emoji: '🇮🇹' },
  { nombre: 'Moscú', pais: 'Rusia', utc: 3, emoji: '🇷🇺' },
  { nombre: 'Atenas', pais: 'Grecia', utc: 2, emoji: '🇬🇷' },
  { nombre: 'Estambul', pais: 'Turquía', utc: 3, emoji: '🇹🇷' },
  { nombre: 'Amsterdam', pais: 'Países Bajos', utc: 1, emoji: '🇳🇱' },
  // América
  { nombre: 'Nueva York', pais: 'EE.UU.', utc: -5, emoji: '🇺🇸' },
  { nombre: 'Los Ángeles', pais: 'EE.UU.', utc: -8, emoji: '🇺🇸' },
  { nombre: 'Chicago', pais: 'EE.UU.', utc: -6, emoji: '🇺🇸' },
  { nombre: 'Miami', pais: 'EE.UU.', utc: -5, emoji: '🇺🇸' },
  { nombre: 'Ciudad de México', pais: 'México', utc: -6, emoji: '🇲🇽' },
  { nombre: 'Bogotá', pais: 'Colombia', utc: -5, emoji: '🇨🇴' },
  { nombre: 'Lima', pais: 'Perú', utc: -5, emoji: '🇵🇪' },
  { nombre: 'Santiago', pais: 'Chile', utc: -3, emoji: '🇨🇱' },
  { nombre: 'Buenos Aires', pais: 'Argentina', utc: -3, emoji: '🇦🇷' },
  { nombre: 'São Paulo', pais: 'Brasil', utc: -3, emoji: '🇧🇷' },
  // Asia
  { nombre: 'Dubái', pais: 'EAU', utc: 4, emoji: '🇦🇪' },
  { nombre: 'Bombay', pais: 'India', utc: 5.5, emoji: '🇮🇳' },
  { nombre: 'Bangkok', pais: 'Tailandia', utc: 7, emoji: '🇹🇭' },
  { nombre: 'Singapur', pais: 'Singapur', utc: 8, emoji: '🇸🇬' },
  { nombre: 'Hong Kong', pais: 'China', utc: 8, emoji: '🇭🇰' },
  { nombre: 'Pekín', pais: 'China', utc: 8, emoji: '🇨🇳' },
  { nombre: 'Seúl', pais: 'Corea del Sur', utc: 9, emoji: '🇰🇷' },
  { nombre: 'Tokio', pais: 'Japón', utc: 9, emoji: '🇯🇵' },
  { nombre: 'Yakarta', pais: 'Indonesia', utc: 7, emoji: '🇮🇩' },
  // Oceanía y África
  { nombre: 'Sídney', pais: 'Australia', utc: 10, emoji: '🇦🇺' },
  { nombre: 'Auckland', pais: 'Nueva Zelanda', utc: 12, emoji: '🇳🇿' },
  { nombre: 'El Cairo', pais: 'Egipto', utc: 2, emoji: '🇪🇬' },
  { nombre: 'Johannesburgo', pais: 'Sudáfrica', utc: 2, emoji: '🇿🇦' },
  { nombre: 'Lagos', pais: 'Nigeria', utc: 1, emoji: '🇳🇬' },
  { nombre: 'Nairobi', pais: 'Kenia', utc: 3, emoji: '🇰🇪' },
];

type NivelImpacto = 'ninguno' | 'leve' | 'moderado' | 'significativo' | 'severo';
type DireccionViaje = 'local' | 'este' | 'oeste';

interface ResultadoJetLag {
  diferencia: number; // horas absolutas
  direccion: DireccionViaje;
  nivel: NivelImpacto;
  diasAdaptacion: number;
  sintomas: string[];
  recomendaciones: string[];
}

function calcularJetLag(origen: Ciudad, destino: Ciudad): ResultadoJetLag {
  const rawDiff = destino.utc - origen.utc;
  const diferencia = Math.abs(rawDiff);

  let direccion: DireccionViaje = 'local';
  if (rawDiff > 0) direccion = 'este';
  else if (rawDiff < 0) direccion = 'oeste';

  // Días de adaptación: 1 día por hora de diferencia, ×1.15 si viajas al este
  const factorDireccion = direccion === 'este' ? 1.15 : direccion === 'oeste' ? 0.85 : 1;
  const diasAdaptacion = diferencia === 0 ? 0 : Math.ceil(diferencia * factorDireccion);

  let nivel: NivelImpacto;
  if (diferencia === 0) nivel = 'ninguno';
  else if (diferencia <= 3) nivel = 'leve';
  else if (diferencia <= 6) nivel = 'moderado';
  else if (diferencia <= 9) nivel = 'significativo';
  else nivel = 'severo';

  const sintomas: string[] = [];
  const recomendaciones: string[] = [];

  if (nivel === 'ninguno') {
    recomendaciones.push('¡Sin jet lag! Disfruta tu viaje sin preocupaciones de adaptación horaria.');
    recomendaciones.push('Mantén tu rutina de sueño habitual.');
    recomendaciones.push('Hidrátate bien durante el vuelo.');
  } else {
    // Síntomas según nivel
    if (nivel === 'leve') {
      sintomas.push('Leve somnolencia a horas inusuales');
      sintomas.push('Posible dificultad para conciliar el sueño el primer día');
    } else if (nivel === 'moderado') {
      sintomas.push('Fatiga diurna durante 2-4 días');
      sintomas.push('Insomnio nocturno las primeras noches');
      sintomas.push('Posibles problemas de concentración');
    } else {
      sintomas.push('Fatiga intensa durante varios días');
      sintomas.push('Insomnio o somnolencia severa');
      sintomas.push('Dolores de cabeza y dificultad de concentración');
      sintomas.push('Posibles problemas digestivos');
    }

    // Recomendaciones según dirección y nivel
    if (direccion === 'este') {
      recomendaciones.push('Ajusta tu horario de sueño 1h antes por día durante los días previos al viaje.');
      recomendaciones.push('Al llegar, exponerte a la luz solar matutina acelera la adaptación.');
      if (nivel !== 'leve') {
        recomendaciones.push('Considera melatonina (0.5-3 mg) justo antes de dormir al llegar.');
        recomendaciones.push('Evita la cafeína por la tarde y noche en el destino.');
      }
    } else {
      recomendaciones.push('Viajar al oeste es más fácil: tu cuerpo alarga el día naturalmente.');
      recomendaciones.push('Exponerte a la luz solar vespertina ayuda a retrasar el reloj interno.');
      if (nivel !== 'leve') {
        recomendaciones.push('Mantente despierto hasta la hora de dormir local el primer día.');
      }
    }

    // Recomendaciones generales por nivel
    recomendaciones.push('Bebe agua abundante antes, durante y después del vuelo (evita alcohol).');
    if (nivel === 'moderado' || nivel === 'significativo' || nivel === 'severo') {
      recomendaciones.push('Adapta tus comidas al horario local desde el primer día.');
      recomendaciones.push('Haz ejercicio suave (caminar) durante el día para combatir la fatiga.');
    }
    if (nivel === 'significativo' || nivel === 'severo') {
      recomendaciones.push('Reserva el primer día para actividades de bajo esfuerzo si es posible.');
      recomendaciones.push('Usa antifaz y tapones si duermes en el avión para maximizar el descanso.');
    }
    if (nivel === 'severo') {
      recomendaciones.push('Consulta con tu médico si viajas frecuentemente: existen tratamientos más avanzados.');
    }
  }

  return { diferencia, direccion, nivel, diasAdaptacion, sintomas, recomendaciones };
}

const NIVEL_CONFIG = {
  ninguno: { emoji: '✅', label: 'Sin jet lag', desc: 'Misma zona horaria o diferencia mínima. No necesitas adaptación.', className: 'impactoNinguno' },
  leve: { emoji: '🟡', label: 'Jet lag leve', desc: '1-3 horas de diferencia. Te adaptarás en 1-3 días sin mayores problemas.', className: 'impactoLeve' },
  moderado: { emoji: '🟠', label: 'Jet lag moderado', desc: '4-6 horas de diferencia. Espera 3-5 días para una adaptación completa.', className: 'impactoModerado' },
  significativo: { emoji: '🔴', label: 'Jet lag significativo', desc: '7-9 horas de diferencia. Prepárate para una semana de adaptación.', className: 'impactoSignificativo' },
  severo: { emoji: '🔴', label: 'Jet lag severo', desc: '10+ horas de diferencia. Preparación previa es clave para minimizar el impacto.', className: 'impactoSevero' },
};

const DIRECCION_CONFIG = {
  local: { label: '🏠 Sin cambio horario', className: 'direccionLocal' },
  este: { label: '➡️ Dirección Este (más difícil)', className: 'direccionEste' },
  oeste: { label: '⬅️ Dirección Oeste (más fácil)', className: 'direccionOeste' },
};

export default function SimuladorJetLagPage() {
  const [origenIdx, setOrigenIdx] = useState<number>(0);
  const [destinoIdx, setDestinoIdx] = useState<number>(27); // Tokio por defecto

  const origen = CIUDADES[origenIdx];
  const destino = CIUDADES[destinoIdx];

  const resultado: ResultadoJetLag = useMemo(
    () => calcularJetLag(origen, destino),
    [origen, destino]
  );

  const nivelCfg = NIVEL_CONFIG[resultado.nivel];
  const dirCfg = DIRECCION_CONFIG[resultado.direccion];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Simulador de Jet Lag ✈️</h1>
        <p className={styles.subtitle}>
          Calcula el impacto del cambio horario y prepárate para adaptarte más rápido
        </p>
      </header>

      <LegalNotice />

      <div className={styles.mainGrid}>
        {/* Panel selector */}
        <div className={styles.panelSelector}>
          <h2 className={styles.panelTitle}>Configura tu vuelo</h2>

          <div className={styles.selectGroup}>
            <label className={styles.selectLabel}>
              <span className={styles.selectIcon}>🛫</span>
              Ciudad de origen
            </label>
            <select
              className={styles.select}
              value={origenIdx}
              onChange={(e) => setOrigenIdx(Number(e.target.value))}
              aria-label="Ciudad de origen"
            >
              {CIUDADES.map((c, i) => (
                <option key={i} value={i}>
                  {c.emoji} {c.nombre} ({c.pais}) — UTC{c.utc >= 0 ? '+' : ''}{c.utc}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.flechaViaje} aria-hidden="true">✈️</div>

          <div className={styles.selectGroup}>
            <label className={styles.selectLabel}>
              <span className={styles.selectIcon}>🛬</span>
              Ciudad de destino
            </label>
            <select
              className={styles.select}
              value={destinoIdx}
              onChange={(e) => setDestinoIdx(Number(e.target.value))}
              aria-label="Ciudad de destino"
            >
              {CIUDADES.map((c, i) => (
                <option key={i} value={i}>
                  {c.emoji} {c.nombre} ({c.pais}) — UTC{c.utc >= 0 ? '+' : ''}{c.utc}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.diferenciaInfo}>
            <p className={styles.diferenciaLabel}>Diferencia horaria</p>
            <p className={styles.diferenciaValor}>
              {resultado.diferencia}
              <span>hora{resultado.diferencia !== 1 ? 's' : ''}</span>
            </p>
          </div>
        </div>

        {/* Panel resultados */}
        <div className={styles.panelResultados}>
          {/* Card nivel impacto */}
          <div className={`${styles.impactoCard} ${styles[nivelCfg.className]}`}>
            <div className={styles.impactoEmoji} aria-hidden="true">{nivelCfg.emoji}</div>
            <div className={styles.impactoNivel}>{nivelCfg.label}</div>
            <p className={styles.impactoDesc}>{nivelCfg.desc}</p>
          </div>

          {/* Estadísticas */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcono} aria-hidden="true">🕐</div>
              <span className={styles.statValor}>{resultado.diferencia}h</span>
              <p className={styles.statLabel}>Diferencia horaria</p>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcono} aria-hidden="true">📅</div>
              <span className={styles.statValor}>{resultado.diasAdaptacion}</span>
              <p className={styles.statLabel}>Días de adaptación</p>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcono} aria-hidden="true">
                {resultado.direccion === 'este' ? '🔴' : resultado.direccion === 'oeste' ? '🟢' : '🟢'}
              </div>
              <span className={`${styles.statValor} ${styles.statValorSmall}`}>
                {resultado.direccion === 'este' ? 'Al este' : resultado.direccion === 'oeste' ? 'Al oeste' : 'Local'}
              </span>
              <p className={styles.statLabel}>Dirección</p>
            </div>
          </div>

          {/* Recomendaciones */}
          <div className={styles.recomendacionesCard}>
            <h3 className={styles.recomTitle}>
              <span aria-hidden="true">💡</span>
              Recomendaciones para tu viaje
            </h3>
            <span className={`${styles.direccionBadge} ${styles[dirCfg.className]}`}>
              {dirCfg.label}
            </span>
            {resultado.sintomas.length > 0 && (
              <>
                <p className={styles.sintomasLabel}>
                  Síntomas esperables:
                </p>
                <ul className={`${styles.recomLista} ${styles.recomListaSintomas}`}>
                  {resultado.sintomas.map((s, i) => (
                    <li key={i} className={styles.recomItem}>
                      <span className={styles.recomBullet} aria-hidden="true">⚠</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </>
            )}
            <ul className={styles.recomLista}>
              {resultado.recomendaciones.map((r, i) => (
                <li key={i} className={styles.recomItem}>
                  <span className={styles.recomBullet} aria-hidden="true">→</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Sección educativa colapsable */}
      <EducationalSection title="¿Qué es el jet lag y por qué ocurre?" subtitle="Entiende el desfase horario y cómo minimizar su impacto en tu próximo vuelo">
        <div className={styles.sectionGrid}>
          <div className={styles.infoCard}>
            <h3>¿Cómo se desarrolla el jet lag?</h3>
            <ol className={styles.fasesLista}>
              <li className={styles.faseItem}>
                <span className={styles.faseNum}>1</span>
                <span className={styles.faseTxt}>
                  <strong>Vuelo:</strong> Tu cuerpo mantiene el reloj biológico del origen durante el trayecto.
                </span>
              </li>
              <li className={styles.faseItem}>
                <span className={styles.faseNum}>2</span>
                <span className={styles.faseTxt}>
                  <strong>Llegada:</strong> El destino tiene un horario de luz/oscuridad diferente, creando conflicto.
                </span>
              </li>
              <li className={styles.faseItem}>
                <span className={styles.faseNum}>3</span>
                <span className={styles.faseTxt}>
                  <strong>Días 1-3:</strong> El cuerpo empieza a ajustar melatonina y cortisol al nuevo horario.
                </span>
              </li>
              <li className={styles.faseItem}>
                <span className={styles.faseNum}>4</span>
                <span className={styles.faseTxt}>
                  <strong>Adaptación:</strong> La exposición a la luz solar y comidas locales acelera el proceso.
                </span>
              </li>
            </ol>
          </div>
          <div className={styles.infoCard}>
            <h3>Comparativa: Este vs. Oeste</h3>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Factor</th>
                  <th>Al este ➡️</th>
                  <th>Al oeste ⬅️</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Dificultad</td>
                  <td>Mayor</td>
                  <td>Menor</td>
                </tr>
                <tr>
                  <td>Efecto</td>
                  <td>Acorta el día</td>
                  <td>Alarga el día</td>
                </tr>
                <tr>
                  <td>Reloj interno</td>
                  <td>Se adelanta</td>
                  <td>Se retrasa</td>
                </tr>
                <tr>
                  <td>Factor adaptación</td>
                  <td>×1.15 días/h</td>
                  <td>×0.85 días/h</td>
                </tr>
                <tr>
                  <td>Exposición luz</td>
                  <td>Mañana</td>
                  <td>Tarde/noche</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.infoCard}>
          <h3>Regla general de adaptación</h3>
          <p className={styles.infoParrafo}>
            El cuerpo humano se adapta aproximadamente <strong>1 hora de diferencia horaria por día</strong>.
            Viajar hacia el este es más difícil porque requiere avanzar el reloj biológico,
            mientras que viajar al oeste lo retrasa (más natural para nosotros).
          </p>
          <p className={styles.infoParrafoSecundario}>
            Factores que influyen: edad (los mayores lo sufren más), exposición a la luz solar,
            hidratación, actividad física, y si el viajero es madrugador o noctámbulo.
          </p>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-jet-lag')} />

      <Footer appName="simulador-jet-lag" />
    </div>
  );
}
