'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorEscalaUniverso.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Datos de los 12 niveles de escala
// ─────────────────────────────────────────────

interface NivelEscala {
  id: string;
  nombre: string;
  icono: string;
  /** Tamaño representativo en metros */
  metros: number;
  /** Notación legible, ej: "10⁻¹⁸ m" */
  notacion: string;
  /** Descripción del objeto representativo */
  objeto: string;
  /** Comparación con el nivel anterior (si existe) */
  comparacion: string;
  /** Dato curioso o fascinante */
  datoCurioso: string;
  /** Color de acento para este nivel */
  color: string;
}

const NIVELES: NivelEscala[] = [
  {
    id: 'quark',
    nombre: 'Quark',
    icono: '⚛️',
    metros: 1e-18,
    notacion: '10⁻¹⁸ m',
    objeto: 'Quark up (componente del protón)',
    comparacion: 'Punto de partida: la escala más pequeña observable',
    datoCurioso: 'Los quarks nunca se encuentran solos: están siempre confinados dentro de otras partículas. Separarlos requiere tanta energía que se crean nuevas partículas.',
    color: '#9b59b6',
  },
  {
    id: 'proton',
    nombre: 'Protón / Neutrón',
    icono: '🔴',
    metros: 1e-15,
    notacion: '10⁻¹⁵ m',
    objeto: 'Protón (núcleo del hidrógeno)',
    comparacion: '1.000 veces más grande que un quark',
    datoCurioso: 'Un protón contiene 3 quarks unidos por la fuerza nuclear fuerte. Si el protón fuera una pelota de tenis, el átomo sería tan grande como un estadio de fútbol.',
    color: '#e74c3c',
  },
  {
    id: 'atomo',
    nombre: 'Átomo',
    icono: '💠',
    metros: 1e-10,
    notacion: '10⁻¹⁰ m',
    objeto: 'Átomo de hidrógeno (el más pequeño)',
    comparacion: '100.000 veces más grande que un protón',
    datoCurioso: 'El átomo es casi todo espacio vacío: si el núcleo fuera una naranja en el centro de un campo de fútbol, los electrones estarían en las gradas. El 99,9999% es vacío.',
    color: '#3498db',
  },
  {
    id: 'molecula',
    nombre: 'Molécula de ADN',
    icono: '🧬',
    metros: 2e-9,
    notacion: '~2 nm',
    objeto: 'Doble hélice de ADN (anchura)',
    comparacion: '20 veces más ancha que un átomo de hidrógeno',
    datoCurioso: 'El ADN humano extendido mediría ~2 metros por célula. Si estiráramos todo el ADN de tu cuerpo, llegaría al Sol y volvería unas 70 veces.',
    color: '#2E86AB',
  },
  {
    id: 'virus',
    nombre: 'Virus',
    icono: '🦠',
    metros: 1e-7,
    notacion: '100 nm',
    objeto: 'Coronavirus SARS-CoV-2',
    comparacion: '50 veces más grande que el ancho de una molécula de ADN',
    datoCurioso: 'Un virus es tan pequeño que podría caber en el interior de una bacteria como un autobús dentro de un estadio. Son el límite entre lo vivo y lo no-vivo.',
    color: '#e67e22',
  },
  {
    id: 'celula',
    nombre: 'Célula',
    icono: '🔬',
    metros: 1e-5,
    notacion: '10 µm',
    objeto: 'Célula humana (glóbulo rojo)',
    comparacion: '100 veces más grande que un virus típico',
    datoCurioso: 'Tu cuerpo tiene ~37 billones de células. Cada segundo pierdes ~3,8 millones y creas otras tantas. Una célula puede leer 600 instrucciones de ADN por segundo.',
    color: '#27ae60',
  },
  {
    id: 'hormiga',
    nombre: 'Hormiga',
    icono: '🐜',
    metros: 1e-3,
    notacion: '1 mm',
    objeto: 'Hormiga hormiguero (obrera)',
    comparacion: '100 veces más grande que una célula humana',
    datoCurioso: 'Una hormiga puede levantar 50 veces su propio peso. Si un humano tuviera la misma fuerza proporcional, podría levantar un camión de 3 toneladas.',
    color: '#795548',
  },
  {
    id: 'humano',
    nombre: 'Ser Humano',
    icono: '🧍',
    metros: 1.7,
    notacion: '1,7 m',
    objeto: 'Persona adulta de talla media',
    comparacion: '1.700 veces más alto que una hormiga',
    datoCurioso: 'Somos la única escala que puede percibir directamente todas las demás (con instrumentos). En el universo observable somos exactamente medianos: tan lejos de lo más grande como de lo más pequeño.',
    color: '#2E86AB',
  },
  {
    id: 'edificio',
    nombre: 'Rascacielos',
    icono: '🏙️',
    metros: 500,
    notacion: '500 m',
    objeto: 'Torre Eiffel / Burj Khalifa (~830 m)',
    comparacion: '300 veces más alto que una persona',
    datoCurioso: 'El edificio más alto del mundo (Burj Khalifa, 828 m) es tan alto que puedes ver el atardecer desde la planta baja, subir al piso 160 en ascensor y ver el Sol ponerse de nuevo.',
    color: '#607D8B',
  },
  {
    id: 'montana',
    nombre: 'Montaña',
    icono: '🏔️',
    metros: 8849,
    notacion: '8,8 km',
    objeto: 'Monte Everest (8.849 m)',
    comparacion: '17 veces más alto que el Burj Khalifa',
    datoCurioso: 'Si pusieras el Everest en el fondo del Challenger Deep (la fosa más profunda del océano, 11 km), habría más de 2 km de agua sobre su cima.',
    color: '#78909C',
  },
  {
    id: 'tierra',
    nombre: 'Tierra',
    icono: '🌍',
    metros: 1.27e7,
    notacion: '12.700 km',
    objeto: 'Diámetro del planeta Tierra',
    comparacion: '1.435 veces más grande que el Everest',
    datoCurioso: 'La Tierra es la densidad más alta de todos los planetas del sistema solar. Si pudieras colocarla sobre agua (de un océano enorme), se hundiría: no flota.',
    color: '#1565C0',
  },
  {
    id: 'sol',
    nombre: 'El Sol',
    icono: '☀️',
    metros: 1.39e9,
    notacion: '1,4 millones km',
    objeto: 'Diámetro del Sol',
    comparacion: '109 veces el diámetro de la Tierra',
    datoCurioso: 'Dentro del Sol cabrían 1,3 millones de planetas Tierra. La luz tarda 8 minutos en llegar desde el Sol a la Tierra, pero en salir del núcleo solar tarda ¡100.000 años!',
    color: '#F39C12',
  },
  {
    id: 'sistema-solar',
    nombre: 'Sistema Solar',
    icono: '🪐',
    metros: 9e12,
    notacion: '9 × 10¹² m (60 UA)',
    objeto: 'Órbita de Plutón (~60 UA)',
    comparacion: '6.500 veces el diámetro del Sol',
    datoCurioso: 'La sonda Voyager 1 lleva viajando desde 1977 y acaba de salir del sistema solar. A 17 km/s, tardó 45 años en recorrer lo que la luz cruza en 22 horas.',
    color: '#8E24AA',
  },
  {
    id: 'galaxia',
    nombre: 'Vía Láctea',
    icono: '🌌',
    metros: 9.46e20,
    notacion: '100.000 años luz',
    objeto: 'Diámetro de la Vía Láctea',
    comparacion: '100.000 millones de veces el diámetro del sistema solar',
    datoCurioso: 'La Vía Láctea tiene entre 200.000 y 400.000 millones de estrellas. Si viajáramos a la velocidad de la luz, cruzarla de punta a punta llevaría 100.000 años.',
    color: '#48A9A6',
  },
];

// ─────────────────────────────────────────────
// Utilidad: formato de metros
// ─────────────────────────────────────────────

function formatMetros(metros: number): string {
  if (metros < 1e-15) return `${(metros * 1e18).toFixed(0)} × 10⁻¹⁸ m`;
  if (metros < 1e-12) return `${(metros * 1e15).toFixed(0)} fm`;
  if (metros < 1e-9) return `${(metros * 1e9).toFixed(1)} nm`;
  if (metros < 1e-6) return `${(metros * 1e9).toFixed(0)} nm`;
  if (metros < 1e-3) return `${(metros * 1e6).toFixed(0)} µm`;
  if (metros < 1) return `${(metros * 1000).toFixed(1)} mm`;
  if (metros < 1000) return `${metros.toFixed(1)} m`;
  if (metros < 1e6) return `${(metros / 1000).toFixed(0)} km`;
  if (metros < 1e9) return `${(metros / 1e6).toFixed(2)} millones km`;
  if (metros < 1e12) return `${(metros / 1e9).toFixed(2)} × 10⁹ m`;
  if (metros < 1e16) return `${(metros / 1e12).toFixed(0)} × 10¹² m`;
  if (metros < 1e20) return `${(metros / 9.46e15).toFixed(0)} años luz`;
  return `${(metros / 9.46e15).toFixed(0)} años luz`;
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorEscalaUniversoPage() {
  const [nivelActivo, setNivelActivo] = useState<number>(7); // Humano por defecto
  const nivel = NIVELES[nivelActivo];

  // Calcular porcentaje logarítmico para la posición en el slider
  const minLog = Math.log10(NIVELES[0].metros);
  const maxLog = Math.log10(NIVELES[NIVELES.length - 1].metros);

  function pctLog(metros: number): number {
    return ((Math.log10(metros) - minLog) / (maxLog - minLog)) * 100;
  }

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>La Escala del Universo</h1>
          <p className={styles.subtitle}>Del quark a la galaxia — 14 niveles de zoom que cambian tu perspectiva del cosmos</p>
        </header>

        <LegalNotice />

        {/* Visualizador principal */}
        <div className={styles.visualizador}>

          {/* Tarjeta del nivel activo */}
          <div className={styles.nivelCard} style={{ borderColor: nivel.color }}>
            <div className={styles.nivelHeader} style={{ background: nivel.color }}>
              <span className={styles.nivelIconoGrande} aria-hidden="true">{nivel.icono}</span>
              <div>
                <h2 className={styles.nivelNombre}>{nivel.nombre}</h2>
                <p className={styles.nivelNotacion}>{nivel.notacion}</p>
              </div>
              <div className={styles.nivelMetros}>
                <span className={styles.metrosLabel}>Tamaño</span>
                <span className={styles.metrosValor}>{formatMetros(nivel.metros)}</span>
              </div>
            </div>

            <div className={styles.nivelCuerpo}>
              <div className={styles.nivelObjeto}>
                <span className={styles.objetoLabel}>Objeto representativo</span>
                <span className={styles.objetoValor}>{nivel.objeto}</span>
              </div>

              <div className={styles.nivelComparacion}>
                <span className={styles.comparacionIcono} aria-hidden="true">↔️</span>
                <span className={styles.comparacionTexto}>{nivel.comparacion}</span>
              </div>

              <div className={styles.datoBox} style={{ borderLeftColor: nivel.color }}>
                <p className={styles.datoTexto}>{nivel.datoCurioso}</p>
              </div>
            </div>
          </div>

          {/* Slider / controles de navegación */}
          <div className={styles.sliderZona}>
            <div className={styles.sliderLabels}>
              <span className={styles.sliderLabelMin}>⚛️ Quark</span>
              <span className={styles.sliderLabelCentro}>🧍 Humano</span>
              <span className={styles.sliderLabelMax}>🌌 Galaxia</span>
            </div>
            <input
              type="range"
              min={0}
              max={NIVELES.length - 1}
              value={nivelActivo}
              onChange={(e) => setNivelActivo(Number(e.target.value))}
              className={styles.slider}
              aria-label="Nivel de escala del universo"
              style={{ '--nivel-color': nivel.color } as React.CSSProperties}
            />
            <div className={styles.sliderEscala}>
              <span className={styles.escalaExtremo}>10⁻¹⁸ m</span>
              <span className={styles.escalaExtremo}>10²¹ m</span>
            </div>
          </div>

          {/* Botones de nivel */}
          <div className={styles.nivelesGrid}>
            {NIVELES.map((n, i) => (
              <button
                key={n.id}
                type="button"
                className={`${styles.nivelBtn} ${i === nivelActivo ? styles.nivelBtnActivo : ''}`}
                onClick={() => setNivelActivo(i)}
                style={i === nivelActivo ? { borderColor: n.color, background: `${n.color}18` } : {}}
                aria-pressed={i === nivelActivo}
                title={`${n.nombre} (${n.notacion})`}
              >
                <span className={styles.nivelBtnIcono} aria-hidden="true">{n.icono}</span>
                <span className={styles.nivelBtnNombre}>{n.nombre}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Línea de escala logarítmica */}
        <div className={styles.lineaEscala}>
          <h3 className={styles.lineaTitulo}>Posición en la escala del universo</h3>
          <div className={styles.lineaFondo} role="presentation">
            {NIVELES.map((n, i) => (
              <button
                key={n.id}
                type="button"
                className={`${styles.lineaPunto} ${i === nivelActivo ? styles.lineaPuntoActivo : ''}`}
                style={{ left: `${pctLog(n.metros)}%`, borderColor: n.color, background: i === nivelActivo ? n.color : undefined }}
                onClick={() => setNivelActivo(i)}
                title={`${n.nombre}: ${n.notacion}`}
                aria-label={`Nivel ${n.nombre}, ${n.notacion}`}
              />
            ))}
          </div>
          <div className={styles.lineaRangos}>
            <span>Subatómico</span>
            <span>Microscópico</span>
            <span>Humano</span>
            <span>Astronómico</span>
          </div>
        </div>

        {/* Tabla comparativa */}
        <div className={styles.tablaZona}>
          <h3 className={styles.tablaTitulo}>Todos los niveles de un vistazo</h3>
          <div className={styles.tablaScroll}>
            <table className={styles.tabla}>
              <thead>
                <tr>
                  <th scope="col">Nivel</th>
                  <th scope="col">Nombre</th>
                  <th scope="col">Tamaño</th>
                  <th scope="col">Objeto</th>
                </tr>
              </thead>
              <tbody>
                {NIVELES.map((n, i) => (
                  <tr
                    key={n.id}
                    className={i === nivelActivo ? styles.filaActiva : ''}
                    onClick={() => setNivelActivo(i)}
                    style={{ cursor: 'pointer' }}
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setNivelActivo(i); }}
                    aria-selected={i === nivelActivo}
                  >
                    <td><span aria-hidden="true">{n.icono}</span></td>
                    <td className={styles.celdaNombre}>{n.nombre}</td>
                    <td><code className={styles.celdaNotacion}>{n.notacion}</code></td>
                    <td className={styles.celdaObjeto}>{n.objeto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Comparación de escala */}
        <div className={styles.comparacionesBloque}>
          <h3 className={styles.compTitulo}>Comparaciones que asombran</h3>
          <div className={styles.compGrid}>
            <div className={styles.compCard}>
              <p className={styles.compTexto}>
                Si un átomo fuera tan grande como un campo de fútbol, un quark sería <strong>más pequeño que un grano de arroz</strong> dentro de ese campo.
              </p>
            </div>
            <div className={styles.compCard}>
              <p className={styles.compTexto}>
                La Vía Láctea es <strong>10³⁹ veces más grande que un quark</strong>. Ese número tiene 39 ceros.
              </p>
            </div>
            <div className={styles.compCard}>
              <p className={styles.compTexto}>
                Un ser humano está exactamente a mitad de la escala logarítmica entre un quark y la galaxia. <strong>Somos el centro del universo en escala</strong>.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.insight}>
          <p>
            La diferencia entre el objeto más pequeño conocido y el más grande abarca <strong>39 órdenes de magnitud</strong>.
            Si pudiéramos ver todo esto a la vez, la Tierra sería invisible —
            un punto de polvo flotando en un océano infinito.
            <strong> Zoom out. Respira. Eso eres tú.</strong>
          </p>
        </div>

        <EducationalSection
          title="Física de las escalas"
          subtitle="Por qué la escala del universo importa en Bachillerato"
          defaultOpen={false}
        >
          <h3>Notación científica: la herramienta imprescindible</h3>
          <p>
            Para manejar estas escalas, la física usa la notación científica: expresar números como
            una potencia de 10. Un quark mide 10⁻¹⁸ m, una galaxia mide ~10²¹ m.
            Operar con estas cifras (suma de exponentes al multiplicar, resta al dividir) es fundamental
            en Física y Química de 1.º y 2.º de Bachillerato.
          </p>

          <h3>La fuerza nuclear y por qué los quarks están confinados</h3>
          <p>
            A escala subatómica (10⁻¹⁵ m) domina la <strong>interacción fuerte</strong>: la fuerza que une quarks
            para formar protones y neutrones. Es 100 veces más intensa que la electromagnética, pero
            actúa solo a distancias menores de ~10⁻¹⁵ m. Más allá, es como si no existiera. Por eso
            los átomos &mdash;a 10⁻¹⁰ m&mdash; son territorio del electromagnetismo, no de la fuerza fuerte.
          </p>

          <h3>El espacio vacío en la materia</h3>
          <p>
            El átomo es 99,9999% espacio vacío. Si elimináramos ese vacío de todos los átomos del
            cuerpo humano, quedaríamos reducidos a un polvo invisible a simple vista. La densidad del
            núcleo atómico es de ~10¹⁷ kg/m³ — la materia que forma las estrellas de neutrones.
          </p>

          <h3>Años luz: distancia, no tiempo</h3>
          <p>
            Un año luz es la distancia que recorre la luz en un año: ~9,46 × 10¹⁵ metros.
            La estrella más cercana (Próxima Centauri) está a 4,2 años luz. Cuando la miras, ves
            cómo era hace 4 años. Cuando miras la Vía Láctea en una noche despejada, ves luz
            que salió hace 26.000 años — antes de que existiera cualquier civilización humana.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota didáctica:</strong> los tamaños indicados son valores representativos medios con fines divulgativos.
            Las partículas subatómicas no tienen un &quot;tamaño&quot; clásico bien definido (depende del experimento
            y la energía). Los valores astronómicos varían según la fuente y la definición exacta (ej: borde del sistema solar).
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-escala-universo')} />
        <ShareCard appName="visualizador-escala-universo" />
        <Footer appName="visualizador-escala-universo" />
    </div>
  );
}
