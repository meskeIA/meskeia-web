'use client';

import { useState, useMemo } from 'react';
import styles from './VisualizadorSistemaSolar.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'planetas' | 'escala' | 'velocidad' | 'curiosidades';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'planetas', titulo: 'Los planetas', icono: '🪐', subtitulo: 'Los 8 mundos del sistema solar' },
  { id: 'escala', titulo: 'A escala', icono: '📏', subtitulo: 'El tamaño real del sistema solar' },
  { id: 'velocidad', titulo: 'Velocidad y distancia', icono: '💡', subtitulo: 'Cuánto tarda la luz en llegar' },
  { id: 'curiosidades', titulo: 'Curiosidades', icono: '🤯', subtitulo: 'Datos que te dejarán pensando' },
];

// ─────────────────────────────────────────────
// Datos de los planetas
// ─────────────────────────────────────────────

interface PlanetaInfo {
  nombre: string;
  icono: string;
  color: string;
  distanciaUA: number;       // Distancia al Sol en UA
  distanciaKm: number;       // Distancia al Sol en millones de km
  diametroKm: number;        // Diámetro en km
  masaTierras: number;       // Masa relativa a la Tierra
  tempMedia: number;         // Temperatura media superficial en °C
  duracionDia: string;       // Duración de un día
  duracionAnio: string;      // Duración de un año
  lunas: number;
  curiosidad: string;
}

const PLANETAS: PlanetaInfo[] = [
  {
    nombre: 'Mercurio', icono: '☿', color: '#A0522D',
    distanciaUA: 0.39, distanciaKm: 57.9, diametroKm: 4879, masaTierras: 0.055,
    tempMedia: 167, duracionDia: '59 días terrestres', duracionAnio: '88 días',
    lunas: 0, curiosidad: 'Su superficie está llena de cráteres, como nuestra Luna. Un día en Mercurio (sunrise a sunrise) dura 176 días terrestres.',
  },
  {
    nombre: 'Venus', icono: '♀', color: '#E8A317',
    distanciaUA: 0.72, distanciaKm: 108.2, diametroKm: 12104, masaTierras: 0.815,
    tempMedia: 464, duracionDia: '243 días terrestres', duracionAnio: '225 días',
    lunas: 0, curiosidad: 'Gira al revés que los demás planetas. Un día en Venus es más largo que su año. Es el planeta más caliente por su efecto invernadero extremo.',
  },
  {
    nombre: 'Tierra', icono: '🌍', color: '#2E86AB',
    distanciaUA: 1, distanciaKm: 149.6, diametroKm: 12742, masaTierras: 1,
    tempMedia: 15, duracionDia: '24 horas', duracionAnio: '365,25 días',
    lunas: 1, curiosidad: 'El único planeta conocido con vida. El 71% de su superficie es agua. Su campo magnético nos protege del viento solar.',
  },
  {
    nombre: 'Marte', icono: '♂', color: '#CD5C5C',
    distanciaUA: 1.52, distanciaKm: 227.9, diametroKm: 6779, masaTierras: 0.107,
    tempMedia: -65, duracionDia: '24 h 37 min', duracionAnio: '687 días',
    lunas: 2, curiosidad: 'Tiene el volcán más alto del sistema solar: Olympus Mons (21,9 km). Los atardeceres en Marte son azules.',
  },
  {
    nombre: 'Júpiter', icono: '♃', color: '#D4A76A',
    distanciaUA: 5.2, distanciaKm: 778.5, diametroKm: 139820, masaTierras: 317.8,
    tempMedia: -110, duracionDia: '9 h 56 min', duracionAnio: '11,86 años',
    lunas: 95, curiosidad: 'La Gran Mancha Roja es una tormenta que lleva activa al menos 400 años. Cabrían 3 Tierras dentro de ella.',
  },
  {
    nombre: 'Saturno', icono: '♄', color: '#C4A35A',
    distanciaUA: 9.58, distanciaKm: 1434, diametroKm: 116460, masaTierras: 95.2,
    tempMedia: -140, duracionDia: '10 h 42 min', duracionAnio: '29,46 años',
    lunas: 146, curiosidad: 'Su densidad es tan baja que flotaría en agua (si encontraras una bañera lo bastante grande). Sus anillos tienen solo 10 metros de grosor.',
  },
  {
    nombre: 'Urano', icono: '⛢', color: '#5DADE2',
    distanciaUA: 19.2, distanciaKm: 2871, diametroKm: 50724, masaTierras: 14.5,
    tempMedia: -195, duracionDia: '17 h 14 min', duracionAnio: '84 años',
    lunas: 28, curiosidad: 'Gira "de lado": su eje de rotación está inclinado 98°. Probablemente por un impacto gigante en su juventud.',
  },
  {
    nombre: 'Neptuno', icono: '♆', color: '#3742FA',
    distanciaUA: 30.07, distanciaKm: 4495, diametroKm: 49244, masaTierras: 17.1,
    tempMedia: -200, duracionDia: '16 h 6 min', duracionAnio: '164,8 años',
    lunas: 16, curiosidad: 'Tiene los vientos más rápidos del sistema solar: hasta 2.100 km/h. Fue el primer planeta descubierto por cálculos matemáticos, no por observación.',
  },
];

// ─────────────────────────────────────────────
// Datos para escala
// ─────────────────────────────────────────────

interface ObjetoEscala {
  nombre: string;
  tamanioCm: number;  // Tamaño del Sol si fuera este objeto, en cm
}

const OBJETOS_ESCALA: ObjetoEscala[] = [
  { nombre: 'Balón de baloncesto', tamanioCm: 24 },
  { nombre: 'Pelota de tenis', tamanioCm: 6.5 },
  { nombre: 'Naranja', tamanioCm: 8 },
  { nombre: 'Sandía', tamanioCm: 40 },
  { nombre: 'Pelota de playa', tamanioCm: 60 },
];

const SOL_DIAMETRO_KM = 1392700;

// ─────────────────────────────────────────────
// Datos para velocidad/distancia
// ─────────────────────────────────────────────

interface PuntoDistancia {
  nombre: string;
  distanciaKm: number;
  tiempoLuz: string;
  icono: string;
}

const PUNTOS_DISTANCIA: PuntoDistancia[] = [
  { nombre: 'Sol', distanciaKm: 0, tiempoLuz: '0', icono: '☀️' },
  { nombre: 'Mercurio', distanciaKm: 57_900_000, tiempoLuz: '3 min 13 s', icono: '☿' },
  { nombre: 'Venus', distanciaKm: 108_200_000, tiempoLuz: '6 min 1 s', icono: '♀' },
  { nombre: 'Tierra', distanciaKm: 149_600_000, tiempoLuz: '8 min 19 s', icono: '🌍' },
  { nombre: 'Marte', distanciaKm: 227_900_000, tiempoLuz: '12 min 40 s', icono: '♂' },
  { nombre: 'Júpiter', distanciaKm: 778_500_000, tiempoLuz: '43 min 16 s', icono: '♃' },
  { nombre: 'Saturno', distanciaKm: 1_434_000_000, tiempoLuz: '1 h 19 min', icono: '♄' },
  { nombre: 'Urano', distanciaKm: 2_871_000_000, tiempoLuz: '2 h 39 min', icono: '⛢' },
  { nombre: 'Neptuno', distanciaKm: 4_495_000_000, tiempoLuz: '4 h 10 min', icono: '♆' },
];

// ─────────────────────────────────────────────
// Curiosidades
// ─────────────────────────────────────────────

interface CuriosidadInfo {
  icono: string;
  titulo: string;
  descripcion: string;
  datoExtra: string;
}

const CURIOSIDADES: CuriosidadInfo[] = [
  {
    icono: '🔄', titulo: 'Un día más largo que un año',
    descripcion: 'Venus tarda 243 días terrestres en girar sobre sí mismo, pero solo 225 días en dar la vuelta al Sol.',
    datoExtra: 'Además, gira en sentido contrario: el Sol sale por el oeste.',
  },
  {
    icono: '🛁', titulo: 'Saturno flotaría en agua',
    descripcion: 'Con una densidad de 0,687 g/cm³ (menor que el agua), Saturno flotaría si existiera un océano lo bastante grande.',
    datoExtra: 'Es el único planeta del sistema solar menos denso que el agua.',
  },
  {
    icono: '🌀', titulo: 'La Gran Mancha Roja',
    descripcion: 'La tormenta más famosa de Júpiter lleva activa al menos 400 años. Dentro cabrían 3 Tierras.',
    datoExtra: 'Los vientos en su borde alcanzan los 680 km/h.',
  },
  {
    icono: '🔵', titulo: 'Atardeceres azules en Marte',
    descripcion: 'El polvo fino de la atmósfera marciana dispersa la luz roja, haciendo que los atardeceres se vean azules.',
    datoExtra: 'Lo opuesto a la Tierra, donde los atardeceres son rojos/naranjas.',
  },
  {
    icono: '🏔️', titulo: 'Monte Olimpo: el volcán más alto',
    descripcion: 'Olympus Mons en Marte tiene 21,9 km de altura — casi 3 veces el Everest. Su base cabría en toda España.',
    datoExtra: 'Es un volcán escudo tan ancho (624 km) que desde su cima no verías el borde.',
  },
  {
    icono: '💎', titulo: 'Lluvia de diamantes',
    descripcion: 'En Neptuno y Urano, la presión extrema puede comprimir el carbono en diamantes que "llueven" hacia el interior.',
    datoExtra: 'Científicos han replicado estas condiciones en laboratorio.',
  },
  {
    icono: '🛡️', titulo: 'Júpiter, nuestro guardián',
    descripcion: 'La enorme gravedad de Júpiter desvía muchos asteroides y cometas, protegiendo a los planetas interiores.',
    datoExtra: 'Sin Júpiter, la Tierra recibiría hasta 10.000 veces más impactos.',
  },
  {
    icono: '🚀', titulo: 'Voyager 1: el objeto más lejano',
    descripcion: 'Lanzada en 1977, Voyager 1 está a más de 24.000 millones de km. Aun así, solo ha recorrido el 0,06% del camino a la estrella más cercana.',
    datoExtra: 'Su señal de radio tarda más de 22 horas en llegar a la Tierra.',
  },
];

// ─────────────────────────────────────────────
// Sección 1: Los planetas
// ─────────────────────────────────────────────

function SeccionPlanetas() {
  const [planetaActivo, setPlanetaActivo] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Nuestro sistema solar tiene <strong>8 planetas</strong> orbitando alrededor del Sol. Ordenados por distancia: 4 rocosos (interiores) y 4 gaseosos/helados (exteriores).</p>
      </div>

      <div className={styles.planetasGrid}>
        {PLANETAS.map((p, i) => (
          <button
            key={p.nombre}
            type="button"
            className={`${styles.planetaCard} ${planetaActivo === i ? styles.planetaActivo : ''}`}
            onClick={() => setPlanetaActivo(planetaActivo === i ? null : i)}
            style={{ borderColor: planetaActivo === i ? p.color : undefined }}
            aria-expanded={planetaActivo === i}
          >
            <div className={styles.planetaHeader}>
              <div
                className={styles.planetaCirculo}
                style={{
                  background: `radial-gradient(circle at 35% 35%, ${p.color}cc, ${p.color})`,
                  width: `${Math.max(20, Math.min(56, p.diametroKm / 2800))}px`,
                  height: `${Math.max(20, Math.min(56, p.diametroKm / 2800))}px`,
                }}
              />
              <div className={styles.planetaNombreBloque}>
                <span className={styles.planetaNombre}>{p.nombre}</span>
                <span className={styles.planetaOrden}>#{i + 1} desde el Sol</span>
              </div>
            </div>

            <div className={styles.planetaResumen}>
              <span>{formatNumber(p.distanciaKm, 1)} M km</span>
              <span>{p.lunas} {p.lunas === 1 ? 'luna' : 'lunas'}</span>
            </div>

            {planetaActivo === i && (
              <div className={styles.planetaDetalle}>
                <div className={styles.planetaStats}>
                  <div className={styles.planetaStat}>
                    <span className={styles.planetaStatLabel}>Distancia al Sol</span>
                    <span className={styles.planetaStatValor}>{formatNumber(p.distanciaKm, 1)} M km ({formatNumber(p.distanciaUA, 2)} UA)</span>
                  </div>
                  <div className={styles.planetaStat}>
                    <span className={styles.planetaStatLabel}>Diámetro</span>
                    <span className={styles.planetaStatValor}>{formatNumber(p.diametroKm, 0)} km</span>
                  </div>
                  <div className={styles.planetaStat}>
                    <span className={styles.planetaStatLabel}>Masa</span>
                    <span className={styles.planetaStatValor}>{formatNumber(p.masaTierras, 3)}x Tierra</span>
                  </div>
                  <div className={styles.planetaStat}>
                    <span className={styles.planetaStatLabel}>Temperatura media</span>
                    <span className={styles.planetaStatValor}>{p.tempMedia > 0 ? '+' : ''}{formatNumber(p.tempMedia, 0)} °C</span>
                  </div>
                  <div className={styles.planetaStat}>
                    <span className={styles.planetaStatLabel}>Duración del día</span>
                    <span className={styles.planetaStatValor}>{p.duracionDia}</span>
                  </div>
                  <div className={styles.planetaStat}>
                    <span className={styles.planetaStatLabel}>Duración del año</span>
                    <span className={styles.planetaStatValor}>{p.duracionAnio}</span>
                  </div>
                </div>
                <div className={styles.planetaCuriosidad}>
                  <span className={styles.planetaCuriosidadLabel}>Dato curioso</span>
                  <p className={styles.planetaCuriosidadTexto}>{p.curiosidad}</p>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          Los 4 planetas interiores (Mercurio a Marte) son <strong>rocosos y pequeños</strong>.
          Los 4 exteriores (Júpiter a Neptuno) son <strong>gigantes gaseosos o helados</strong>.
          El cinturón de asteroides entre Marte y Júpiter marca la frontera.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: A escala
// ─────────────────────────────────────────────

function SeccionEscala() {
  const [indiceObjeto, setIndiceObjeto] = useState(0);

  const escalaDatos = useMemo(() => {
    const obj = OBJETOS_ESCALA[indiceObjeto];
    const factorEscala = obj.tamanioCm / SOL_DIAMETRO_KM;

    return PLANETAS.map(p => {
      const diametroCm = p.diametroKm * factorEscala;
      const distanciaM = (p.distanciaKm * 1_000_000) * factorEscala / 100; // en metros

      let analogiaTamano: string;
      if (diametroCm < 0.1) analogiaTamano = 'Mota de polvo';
      else if (diametroCm < 0.3) analogiaTamano = 'Grano de arena';
      else if (diametroCm < 0.5) analogiaTamano = 'Grano de pimienta';
      else if (diametroCm < 1) analogiaTamano = 'Cabeza de alfiler';
      else if (diametroCm < 3) analogiaTamano = 'Guisante';
      else if (diametroCm < 6) analogiaTamano = 'Canica';
      else analogiaTamano = 'Pelota pequeña';

      return {
        nombre: p.nombre,
        color: p.color,
        diametroCm,
        distanciaM,
        analogiaTamano,
      };
    });
  }, [indiceObjeto]);

  const objetoActual = OBJETOS_ESCALA[indiceObjeto];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El sistema solar es tan grande que es casi imposible de imaginar. Vamos a <strong>reducirlo a escala</strong> para entenderlo mejor.</p>
      </div>

      {/* Selector de objeto */}
      <div className={styles.sliderZona}>
        <div className={styles.sliderHeader}>
          <label className={styles.sliderLabel}>Si el Sol fuera un/a...</label>
          <span className={styles.sliderValor}>{objetoActual.nombre} ({formatNumber(objetoActual.tamanioCm, 0)} cm)</span>
        </div>
        <input
          type="range"
          className={styles.slider}
          min={0}
          max={OBJETOS_ESCALA.length - 1}
          value={indiceObjeto}
          onChange={(e) => setIndiceObjeto(parseInt(e.target.value))}
          aria-label={`Objeto de referencia: ${objetoActual.nombre}`}
        />
        <div className={styles.sliderExtremos}>
          <span>{OBJETOS_ESCALA[0].nombre}</span>
          <span>{OBJETOS_ESCALA[OBJETOS_ESCALA.length - 1].nombre}</span>
        </div>
      </div>

      {/* Sol de referencia */}
      <div className={styles.escalaRefCard}>
        <div
          className={styles.escalaSolCirculo}
          style={{
            width: `${Math.min(80, objetoActual.tamanioCm * 1.5)}px`,
            height: `${Math.min(80, objetoActual.tamanioCm * 1.5)}px`,
          }}
        />
        <div className={styles.escalaRefTexto}>
          <span className={styles.escalaRefNombre}>Sol = {objetoActual.nombre}</span>
          <span className={styles.escalaRefDato}>{formatNumber(objetoActual.tamanioCm, 0)} cm de diámetro</span>
        </div>
      </div>

      {/* Planetas a escala */}
      <div className={styles.escalaGrid}>
        {escalaDatos.map((p) => (
          <div key={p.nombre} className={styles.escalaCard}>
            <div className={styles.escalaCardHeader}>
              <div
                className={styles.escalaCirculo}
                style={{
                  background: p.color,
                  width: `${Math.max(4, Math.min(40, p.diametroCm * 15))}px`,
                  height: `${Math.max(4, Math.min(40, p.diametroCm * 15))}px`,
                }}
              />
              <span className={styles.escalaNombre}>{p.nombre}</span>
            </div>
            <div className={styles.escalaInfo}>
              <span className={styles.escalaDato}>
                <strong>{p.diametroCm < 0.1 ? '< 0,1' : formatNumber(p.diametroCm, 1)} mm</strong>
                {' '}({p.analogiaTamano})
              </span>
              <span className={styles.escalaDistancia}>
                a {p.distanciaM < 1000 ? `${formatNumber(p.distanciaM, 0)} m` : `${formatNumber(p.distanciaM / 1000, 1)} km`}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          Si el Sol fuera un <strong>{objetoActual.nombre.toLowerCase()}</strong>, la Tierra sería
          un <strong>{escalaDatos[2].analogiaTamano.toLowerCase()}</strong> a {formatNumber(escalaDatos[2].distanciaM, 0)} metros
          de distancia, y Neptuno estaría a <strong>{formatNumber(escalaDatos[7].distanciaM / 1000, 1)} km</strong>.
          El espacio es, sobre todo, espacio vacío.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Velocidad y distancia
// ─────────────────────────────────────────────

function SeccionVelocidad() {
  const maxDist = PUNTOS_DISTANCIA[PUNTOS_DISTANCIA.length - 1].distanciaKm;

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La luz viaja a <strong>299.792 km/s</strong>, la velocidad máxima del universo. Aun así, tarda minutos u horas en cruzar el sistema solar.</p>
      </div>

      {/* Timeline horizontal de luz */}
      <div className={styles.luzTimeline}>
        <h3 className={styles.luzTitulo}>Tiempo que tarda la luz en llegar desde el Sol</h3>
        <div className={styles.luzBarra}>
          {PUNTOS_DISTANCIA.map((p, i) => {
            const porcentaje = maxDist === 0 ? 0 : (p.distanciaKm / maxDist) * 100;
            return (
              <div
                key={p.nombre}
                className={styles.luzPunto}
                style={{ left: `${Math.max(1, porcentaje)}%` }}
                title={`${p.nombre}: ${p.tiempoLuz}`}
              >
                <span className={styles.luzIcono} aria-hidden="true">{p.icono}</span>
                <span className={`${styles.luzNombre} ${i % 2 === 0 ? styles.luzNombreArriba : styles.luzNombreAbajo}`}>
                  {p.nombre}
                </span>
                <span className={`${styles.luzTiempo} ${i % 2 === 0 ? styles.luzTiempoAbajo : styles.luzTiempoArriba}`}>
                  {p.tiempoLuz}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tarjetas de distancia */}
      <div className={styles.distanciaCards}>
        <div className={styles.distanciaCard}>
          <span className={styles.distanciaIcono} aria-hidden="true">☀️ → 🌍</span>
          <span className={styles.distanciaTitulo}>Sol → Tierra</span>
          <span className={styles.distanciaValor}>8 min 19 s</span>
          <span className={styles.distanciaDetalle}>{formatNumber(149600000, 0)} km</span>
        </div>
        <div className={styles.distanciaCard}>
          <span className={styles.distanciaIcono} aria-hidden="true">☀️ → ♃</span>
          <span className={styles.distanciaTitulo}>Sol → Júpiter</span>
          <span className={styles.distanciaValor}>43 min 16 s</span>
          <span className={styles.distanciaDetalle}>{formatNumber(778500000, 0)} km</span>
        </div>
        <div className={styles.distanciaCard}>
          <span className={styles.distanciaIcono} aria-hidden="true">☀️ → ♆</span>
          <span className={styles.distanciaTitulo}>Sol → Neptuno</span>
          <span className={styles.distanciaValor}>4 h 10 min</span>
          <span className={styles.distanciaDetalle}>{formatNumber(4495000000, 0)} km</span>
        </div>
      </div>

      {/* Voyager 1 */}
      <div className={styles.voyagerCard}>
        <div className={styles.voyagerHeader}>
          <span className={styles.voyagerIcono} aria-hidden="true">🛸</span>
          <h3 className={styles.voyagerTitulo}>Voyager 1: nuestro emisario más lejano</h3>
        </div>
        <div className={styles.voyagerStats}>
          <div className={styles.voyagerStat}>
            <span className={styles.voyagerStatLabel}>Lanzamiento</span>
            <span className={styles.voyagerStatValor}>5 de septiembre de 1977</span>
          </div>
          <div className={styles.voyagerStat}>
            <span className={styles.voyagerStatLabel}>Distancia actual</span>
            <span className={styles.voyagerStatValor}>~{formatNumber(24000000000, 0)} km</span>
          </div>
          <div className={styles.voyagerStat}>
            <span className={styles.voyagerStatLabel}>Velocidad</span>
            <span className={styles.voyagerStatValor}>~{formatNumber(17, 0)} km/s ({formatNumber(61200, 0)} km/h)</span>
          </div>
          <div className={styles.voyagerStat}>
            <span className={styles.voyagerStatLabel}>Señal de radio</span>
            <span className={styles.voyagerStatValor}>Tarda +22 horas en llegar a la Tierra</span>
          </div>
        </div>
        <div className={styles.voyagerBarra}>
          <div className={styles.voyagerProgreso} style={{ width: '0.06%' }}>
            <span className={styles.voyagerPuntoActual} />
          </div>
          <div className={styles.voyagerEtiquetas}>
            <span>Sol</span>
            <span>Próxima Centauri (estrella más cercana)</span>
          </div>
        </div>
        <p className={styles.voyagerNota}>
          Voyager 1 ha recorrido solo el <strong>0,06%</strong> de la distancia a la estrella más cercana
          (Próxima Centauri, a 4,24 años luz). A su velocidad actual, tardaría <strong>~73.000 años</strong> en llegar.
        </p>
      </div>

      <div className={styles.insight}>
        <p>
          Cuando miras al Sol, ves cómo era hace <strong>8 minutos</strong>. Cuando miras a Júpiter,
          lo ves como era hace <strong>43 minutos</strong>. La luz de la estrella más cercana tardó
          <strong> 4 años y 3 meses</strong> en llegar a tus ojos. El universo es un ejercicio de paciencia.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Curiosidades
// ─────────────────────────────────────────────

function SeccionCuriosidades() {
  const [curiosidadActiva, setCuriosidadActiva] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El sistema solar está lleno de hechos que desafían la intuición. Aquí van <strong>8 que te dejarán pensando</strong>.</p>
      </div>

      <div className={styles.curiosidadesGrid}>
        {CURIOSIDADES.map((c, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.curiosidadCard} ${curiosidadActiva === i ? styles.curiosidadActiva : ''}`}
            onClick={() => setCuriosidadActiva(curiosidadActiva === i ? null : i)}
            aria-expanded={curiosidadActiva === i}
          >
            <div className={styles.curiosidadHeader}>
              <span className={styles.curiosidadIcono} aria-hidden="true">{c.icono}</span>
              <h3 className={styles.curiosidadTitulo}>{c.titulo}</h3>
            </div>
            <p className={styles.curiosidadDesc}>{c.descripcion}</p>
            {curiosidadActiva === i && (
              <p className={styles.curiosidadExtra}>{c.datoExtra}</p>
            )}
          </button>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          Cada planeta tiene su propia personalidad. Venus gira al revés, Urano rueda de lado,
          Saturno flotaría en agua y en Neptuno llueven diamantes. <strong>La realidad supera a la ficción.</strong>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorSistemaSolarPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('planetas');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'planetas': return <SeccionPlanetas />;
      case 'escala': return <SeccionEscala />;
      case 'velocidad': return <SeccionVelocidad />;
      case 'curiosidades': return <SeccionCuriosidades />;
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>El Sistema Solar en Números</h1>
          <p className={styles.subtitle}>8 planetas, distancias imposibles y curiosidades sorprendentes</p>
        </header>

        <LegalNotice />

        {/* Navegación */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Cabecera sección */}
        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            {SECCIONES.find(s => s.id === seccionActiva)?.icono}{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <EducationalSection
          title="Más sobre el sistema solar"
          subtitle="Preguntas frecuentes sobre nuestro vecindario cósmico"
          defaultOpen={false}
        >
          <h3>¿Por qué Plutón ya no es un planeta?</h3>
          <p>
            En 2006, la Unión Astronómica Internacional redefinió &quot;planeta&quot; con 3 criterios:
            orbitar al Sol, tener forma esférica y haber &quot;limpiado&quot; su órbita de otros objetos.
            Plutón no cumple el tercero — comparte el cinturón de Kuiper con miles de objetos similares.
            Ahora se clasifica como <strong>planeta enano</strong>.
          </p>

          <h3>¿Qué hay más allá de Neptuno?</h3>
          <p>
            El <strong>cinturón de Kuiper</strong> (donde está Plutón), seguido de la
            <strong> nube de Oort</strong>, una esfera de billones de cometas que se extiende
            hasta casi 1 año luz del Sol. Más allá: espacio interestelar.
          </p>

          <h3>¿Podríamos vivir en otro planeta?</h3>
          <p>
            Con la tecnología actual, <strong>Marte</strong> es el candidato más viable, pero
            requeriría hábitats presurizados, protección contra radiación y producción de oxígeno.
            Venus tiene una temperatura superficial de 464 °C, y los gigantes gaseosos no tienen superficie sólida.
          </p>

          <h3>¿Cuánto tardaríamos en llegar a Marte?</h3>
          <p>
            Con tecnología actual, un viaje a Marte tarda entre <strong>6 y 9 meses</strong>.
            La distancia varía enormemente: entre 55 y 400 millones de km según las posiciones orbitales.
            Las ventanas de lanzamiento óptimas ocurren cada 26 meses.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador utiliza valores promedio y simplificados con fines
            educativos. Las distancias planetarias varían según la posición orbital, y los datos
            de lunas se actualizan frecuentemente con nuevos descubrimientos.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-sistema-solar')} />
        <ShareCard appName="visualizador-sistema-solar" />
        <Footer appName="visualizador-sistema-solar" />
      </div>
    </>
  );
}
