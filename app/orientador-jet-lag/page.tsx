'use client';

import { useState, useMemo } from 'react';
import styles from './OrientadorJetLag.module.css';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { RelatedApps, LegalNotice, EducationalSection, ShareCard, DisclaimerCard } from '@/components';
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
        <h1 className={styles.title}>Orientador de Jet Lag ✈️</h1>
        <p className={styles.subtitle}>
          Calcula el impacto del cambio horario y prepárate para adaptarte más rápido
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard
        variant="medical"
        severity="medium"
        collapsible={true}
        context="orientador-jet-lag-disclaimer"
      />

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

        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <div className={styles.infoCard}>
          <h3>Tabla comparativa: impacto según dirección y husos cruzados</h3>
          <div className={styles.tableWrapper}>
            <table className={`${styles.tablaComparativa} ${styles.comparativaTable}`}>
              <thead>
                <tr>
                  <th>Husos cruzados</th>
                  <th>Al este ➡️</th>
                  <th>Al oeste ⬅️</th>
                  <th>Días recuperación (este)</th>
                  <th>Días recuperación (oeste)</th>
                  <th>Estrategia clave</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>1–3 h</strong></td>
                  <td>Somnolencia leve, costará conciliar el sueño</td>
                  <td>Sensación de día largo, posible insomnio tardío</td>
                  <td>2–4 días</td>
                  <td>1–3 días</td>
                  <td>Ajustar horario de sueño 30 min/día desde 2 días antes</td>
                </tr>
                <tr>
                  <td><strong>4–6 h</strong></td>
                  <td>Fatiga diurna, insomnio nocturno, dificultad de concentración</td>
                  <td>Levantarse muy temprano, cansancio vespertino</td>
                  <td>5–7 días</td>
                  <td>4–5 días</td>
                  <td>Melatonina 0,5–1 mg al acostarse; luz solar matutina (este) o vespertina (oeste)</td>
                </tr>
                <tr>
                  <td><strong>7–9 h</strong></td>
                  <td>Fatiga intensa, insomnio, dolores de cabeza, digestión alterada</td>
                  <td>Fatiga moderada, despertar muy temprano, somnolencia vespertina</td>
                  <td>8–10 días</td>
                  <td>6–7 días</td>
                  <td>Protocolo completo: pre-ajuste 3 días, melatonina 1–3 mg, exposición solar activa</td>
                </tr>
                <tr>
                  <td><strong>10+ h</strong></td>
                  <td>Desfase total del ritmo circadiano, síntomas gastrointestinales, irritabilidad</td>
                  <td>Impacto significativo aunque menor que al este</td>
                  <td>10–14 días</td>
                  <td>7–10 días</td>
                  <td>Inicio de ajuste 5–7 días antes; considerar consulta médica si hay vuelos frecuentes</td>
                </tr>
              </tbody>
            </table>
            <p className={styles.tableNote}>
              Los desfases UTC indicados son horario estándar; algunas ciudades aplican horario de
              verano y pueden variar ±1 h según la época del año.
            </p>
          </div>
        </div>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <div className={styles.infoCard}>
          <h3>Casos de uso reales: 4 perfiles de viajero</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">💼</span>
                <strong>Viajero de negocios</strong>
              </div>
              <p className={styles.escenarioExample}>Madrid → Nueva York (UTC−5). Diferencia: 6 horas al oeste.</p>
              <p className={styles.escenarioTip}>
                Dirección favorable. Adaptación en 5–6 días. Mantente activo el primer día hasta las
                22:00 hora local. Exposición a la luz natural por la tarde acelera el ajuste.
                Evita reuniones críticas el primer día si puedes organizarlo.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏯</span>
                <strong>Turista en Japón</strong>
              </div>
              <p className={styles.escenarioExample}>Madrid → Tokio (UTC+9). Diferencia: 8 horas al este.</p>
              <p className={styles.escenarioTip}>
                Dirección más difícil. Adaptación en 9–10 días. Empieza a adelantar el sueño
                1 h/día durante 3 días antes del vuelo. Al llegar, busca luz solar por la mañana
                y toma melatonina 1–2 mg al acostarte los primeros 4 días.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🏅</span>
                <strong>Deportista con competición</strong>
              </div>
              <p className={styles.escenarioExample}>Competición a los 2 días de llegar con 6+ horas de diferencia.</p>
              <p className={styles.escenarioTip}>
                Viaja con 4–5 días de antelación mínima. Inicia pre-ajuste 1 semana antes.
                Usa melatonina 0,5 mg (dosis baja para no afectar al rendimiento).
                Prioriza la exposición solar en el momento óptimo según dirección del vuelo.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">✈️</span>
                <strong>Viajero frecuente intercontinental</strong>
              </div>
              <p className={styles.escenarioExample}>Viajes de ida y vuelta intercontinentales cada 2–3 semanas.</p>
              <p className={styles.escenarioTip}>
                El cuerpo no llega a adaptarse completamente entre viajes. Estrategia de
                &quot;ancla horaria&quot;: mantener el horario del destino principal aunque estés en origen.
                Consulta médica si los síntomas afectan a la calidad de vida.
              </p>
            </div>
          </div>
        </div>

        {/* ── SECCIÓN 3: FAQ ── */}
        <div className={styles.infoCard}>
          <h3>Preguntas frecuentes sobre el jet lag</h3>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <strong>¿Por qué el jet lag es peor hacia el este?</strong>
              <p>
                Viajar al este obliga al reloj biológico a adelantarse, lo que va en contra de la
                tendencia natural del ritmo circadiano humano (ligeramente superior a 24 h).
                Por eso la adaptación requiere más tiempo hacia el este (~1,15 días por huso)
                que hacia el oeste (~0,85 días por huso).
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cuántos días tarda en desaparecer el jet lag?</strong>
              <p>
                Depende de los husos cruzados y la dirección. Regla práctica: unos 1,15 días por
                huso cruzado al este y 0,85 días por huso al oeste. Un vuelo Madrid–Tokio (8 h al
                este) implica unos 10 días para una adaptación completa.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Sirve la melatonina y cuándo tomarla?</strong>
              <p>
                Sí, pero la dosis y el momento son clave. Dosis recomendada: <strong>0,5–3 mg</strong>.
                Al viajar al este, tómala justo antes de acostarte en el destino los primeros 3–5 días.
                Al viajar al oeste, puede tomarse al amanecer del destino si te despiertas muy
                temprano. Empieza por la dosis más baja (0,5 mg); dosis altas pueden causar somnolencia residual.
              </p>
              <p className={styles.faqTip}>Nota: la melatonina no es un somnífero; actúa como señal de oscuridad para el reloj biológico.</p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué alimentos ayudan a adaptarse?</strong>
              <p>
                Las comidas abundantes en triptófano (pavo, plátano, lácteos) favorecen la producción
                de melatonina. Los carbohidratos complejos por la noche y las proteínas por la mañana
                refuerzan el ciclo vigilia–sueño. Adaptar el horario de comidas al destino desde el
                primer día es tan importante como el sueño.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Debo dormir en el avión?</strong>
              <p>
                Depende de la hora de llegada al destino. Si llegas de día, evita dormir en el avión
                para poder aguantar despierto hasta la noche local. Si llegas de noche, duerme en el
                avión ajustando el sueño a la hora del destino. Usa antifaz y tapones para maximizar
                la calidad del descanso a bordo.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Cuándo empezar a adaptar el horario antes del viaje?</strong>
              <p>
                Para diferencias de 3–5 h: empieza 2–3 días antes, adelantando o retrasando el sueño
                1 h/día. Para diferencias de 6–9 h: empieza 4–5 días antes. Para diferencias de 10+ h:
                empieza 6–7 días antes. Si el viaje es corto (menos de 3 días), mantener el horario
                de origen puede ser más práctico.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Afecta igual a todo el mundo?</strong>
              <p>
                No. Los cronotipos vespertinos (&quot;noctámbulos&quot;) toleran mejor los viajes al este;
                los matutinos (&quot;alondras&quot;) toleran mejor los viajes al oeste. Con la edad el jet lag
                se agrava. Los niños suelen recuperarse más rápido. El estrés y la falta previa de
                sueño intensifican los síntomas.
              </p>
            </li>
            <li className={styles.faqItem}>
              <strong>¿Qué diferencia hay entre jet lag y cansancio por viaje?</strong>
              <p>
                El <strong>cansancio por viaje</strong> (travel fatigue) es consecuencia directa de la
                incomodidad del vuelo: asientos, ruido, presión de cabina, inmovilidad. Desaparece con
                1–2 noches de buen descanso. El <strong>jet lag</strong> es una desincronización del
                ritmo circadiano y puede durar días o semanas, independientemente de si el vuelo fue
                cómodo o no.
              </p>
            </li>
          </ul>
        </div>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <div className={styles.infoCard}>
          <h3>Guía paso a paso: protocolo completo anti-jet lag</h3>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>5–7 días antes — Calcula tu desfase</strong>
                <p>
                  Usa el orientador para conocer la diferencia horaria y dirección. Decide si
                  merece la pena pre-ajustar (viajes cortos de menos de 3 días: mantén el horario de origen).
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>3–5 días antes — Pre-ajuste de horario</strong>
                <p>
                  Adelanta o retrasa tu hora de sueño 1 h/día según la dirección del vuelo.
                  Ajusta también los horarios de comidas. Exponte a la luz natural en el momento
                  adecuado para acelerar el cambio circadiano.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Al embarcar — Cambia el reloj al horario destino</strong>
                <p>
                  Ajusta mentalmente (y en tu reloj) a la hora del destino desde el momento en que
                  subes al avión. Decide si debes dormir durante el vuelo según cuándo llegues.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Durante el vuelo — Hidratación y movilidad</strong>
                <p>
                  Bebe agua cada hora (el aire de cabina es extremadamente seco, con humedad del 10–20%).
                  Evita el alcohol y limita la cafeína. Levántate y camina cada 2 horas para activar
                  la circulación. Si debes dormir, usa antifaz y tapones.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>Al llegar — Exposición solar estratégica</strong>
                <p>
                  Es la palanca más potente: la luz solar regula directamente la melatonina.
                  Vuelo al este: busca luz matutina (6:00–10:00 h del destino).
                  Vuelo al oeste: busca luz vespertina (16:00–20:00 h del destino).
                  Aunque tengas sueño, sal a caminar al aire libre.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">6</span>
              <div className={styles.stepContent}>
                <strong>Primeras noches — Melatonina si es necesario</strong>
                <p>
                  Para diferencias de 4+ horas, considera melatonina 0,5–3 mg justo antes de
                  acostarte según la hora del destino. Empieza con la dosis más baja. Úsala solo
                  los primeros 3–5 días; no es un tratamiento a largo plazo.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">7</span>
              <div className={styles.stepContent}>
                <strong>Días 2–7 — Refuerza el ritmo local</strong>
                <p>
                  Adapta las comidas al horario local desde el primer día. Haz ejercicio suave por
                  la mañana. Evita siestas de más de 20 minutos. Mantén la exposición solar diaria.
                  Si en 10 días los síntomas persisten con intensidad, consulta a un médico.
                </p>
              </div>
            </li>
          </ol>
        </div>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <div className={styles.infoCard}>
          <h3>Mejores prácticas para minimizar el jet lag</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">☀️</span>
              <strong>Luz solar estratégica</strong>
              <p>
                La exposición a la luz natural es el sincronizador circadiano más potente que existe.
                Al viajar al este, busca luz matutina; al oeste, luz vespertina. Usa gafas de sol
                en los momentos no deseados para bloquear la señal.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💧</span>
              <strong>Hidratación intensa</strong>
              <p>
                La cabina presurizada deshidrata hasta 2 litros en vuelos largos. La deshidratación
                amplifica todos los síntomas del jet lag. Objetivo: 250 ml de agua por hora de vuelo.
                Evita bebidas con alcohol o cafeína en exceso.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🚫</span>
              <strong>Sin alcohol en el avión</strong>
              <p>
                El alcohol a altitud tiene el doble de efecto en el organismo y fragmenta el sueño.
                Aunque parezca que ayuda a dormir, deteriora la calidad del sueño REM e intensifica
                el jet lag al llegar al destino.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🕐</span>
              <strong>Ajusta el reloj al embarcar</strong>
              <p>
                Cambiar mentalmente al horario del destino desde el momento en que subes al avión
                ayuda al cerebro a iniciar el proceso de reajuste. Programa las comidas y el sueño
                a bordo según la hora del destino, no la de origen.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📱</span>
              <strong>Apps de gestión de jet lag</strong>
              <p>
                Aplicaciones como Timeshifter (basada en investigación del MIT) calculan planes
                personalizados de exposición a la luz y melatonina. Son especialmente útiles para
                viajeros frecuentes o deportistas con competiciones inmediatas.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🥗</span>
              <strong>Comidas en horario local</strong>
              <p>
                El sistema digestivo tiene su propio reloj circadiano. Comer a la hora local del
                destino desde el primer día envía señales de ajuste a todo el organismo.
                El ayuno estratégico de 12–16 h antes de llegar también puede acelerar la adaptación.
              </p>
            </div>
          </div>
        </div>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes que empeoran el jet lag</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Dormir en el horario del origen.</strong> Acostarte a las 22:00 (hora de casa)
              aunque en el destino sean las 4:00 de la madrugada impide al cuerpo ajustarse y prolonga
              el jet lag días adicionales.
            </li>
            <li>
              <strong>Tomar melatonina en el momento equivocado.</strong> La melatonina tomada por la
              mañana (hora destino) puede retrasar el reloj en lugar de adelantarlo. Solo es efectiva
              justo antes de acostarte según la hora local del destino.
            </li>
            <li>
              <strong>Cafeína después de las 14:00 h en el destino.</strong> La cafeína bloquea la
              adenosina y retrasa la sensación de sueño hasta 6 horas. Si tomas café a las 15:00 h
              locales, estarás activo hasta la madrugada, perpetuando el ciclo de insomnio.
            </li>
            <li>
              <strong>No hidratarse durante el vuelo.</strong> La falta de agua intensifica la fatiga,
              los dolores de cabeza y la niebla mental. Muchos viajeros confunden los síntomas de
              deshidratación con jet lag, cuando son prevenibles por completo.
            </li>
            <li>
              <strong>Ignorar la luz solar como regulador circadiano.</strong> Quedarse en el hotel
              con persianas bajadas el primer día es el mayor error. La oscuridad mantiene elevada
              la melatonina y retrasa la adaptación. La luz solar es la medicina más eficaz y gratuita.
            </li>
            <li>
              <strong>Hacer siesta larga el día de llegada.</strong> Una siesta de más de 30 minutos
              durante el día local reduce el impulso de sueño nocturno y fragmenta la adaptación.
              Si necesitas descansar, limítate a 20 minutos máximo antes de las 15:00 h locales.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-jet-lag')} />

      <ShareCard appName="orientador-jet-lag" />
      <Footer appName="orientador-jet-lag" />
    </div>
  );
}
