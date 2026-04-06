'use client';

import { useState } from 'react';
import styles from './VisualizadorOceano.module.css';
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

type Seccion = 'cifras' | 'profundidad' | 'plastico' | 'regulador';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'cifras', titulo: 'Las cifras', icono: '🌊', subtitulo: 'El océano en números' },
  { id: 'profundidad', titulo: 'El corte vertical', icono: '🔵', subtitulo: 'Vida y condiciones por zona' },
  { id: 'plastico', titulo: 'El plástico', icono: '🗑️', subtitulo: 'La invasión silenciosa' },
  { id: 'regulador', titulo: 'Regulador del clima', icono: '🌡️', subtitulo: 'El termostato del planeta' },
];

// ─────────────────────────────────────────────
// Sección 1: Las cifras
// ─────────────────────────────────────────────

interface CifraInfo {
  valor: string;
  unidad: string;
  descripcion: string;
  comparacion: string;
  porcentaje: number;
  icono: string;
}

const CIFRAS: CifraInfo[] = [
  {
    valor: '71',
    unidad: '%',
    descripcion: 'de la superficie terrestre',
    comparacion: 'Si la Tierra fuese un balón de fútbol, solo una cuarta parte sería tierra firme',
    porcentaje: 71,
    icono: '🌍',
  },
  {
    valor: '1.335.000.000',
    unidad: 'km³',
    descripcion: 'de agua en los océanos',
    comparacion: 'Cabría 1.335 millones de veces el volumen total de todos los embalses de España',
    porcentaje: 97,
    icono: '💧',
  },
  {
    valor: '3.688',
    unidad: 'm',
    descripcion: 'de profundidad media',
    comparacion: 'Más de 10 Torres Eiffel apiladas una encima de otra',
    porcentaje: 34,
    icono: '📏',
  },
  {
    valor: '10.994',
    unidad: 'm',
    descripcion: 'punto más profundo (Fosa de las Marianas)',
    comparacion: 'El Everest cabría entero y aún sobrarían 2 km de agua por encima',
    porcentaje: 100,
    icono: '⬇️',
  },
  {
    valor: '80',
    unidad: '%',
    descripcion: 'del océano sin explorar',
    comparacion: 'Conocemos mejor la superficie de Marte que el fondo de nuestros océanos',
    porcentaje: 80,
    icono: '🔭',
  },
  {
    valor: '230.000',
    unidad: 'especies',
    descripcion: 'marinas conocidas',
    comparacion: 'Se estima que hay entre 500.000 y 2 millones por descubrir',
    porcentaje: 15,
    icono: '🐠',
  },
];

function SeccionCifras() {
  const [cifraActiva, setCifraActiva] = useState<number | null>(null);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El océano es <strong>el rasgo más definitorio de la Tierra</strong>. Cubre casi tres cuartas partes del planeta y contiene el 97% de toda el agua. Y apenas hemos empezado a explorarlo.</p>
      </div>

      <div className={styles.cifrasGrid}>
        {CIFRAS.map((c, i) => (
          <button
            key={i}
            type="button"
            className={`${styles.cifraCard} ${cifraActiva === i ? styles.cifraActiva : ''}`}
            onClick={() => setCifraActiva(cifraActiva === i ? null : i)}
            aria-expanded={cifraActiva === i}
          >
            <span className={styles.cifraIcono} aria-hidden="true">{c.icono}</span>
            <div className={styles.cifraNumero}>
              <span className={styles.cifraValor}>{c.valor}</span>
              <span className={styles.cifraUnidad}>{c.unidad}</span>
            </div>
            <span className={styles.cifraDesc}>{c.descripcion}</span>
            <div className={styles.cifraBarraContainer}>
              <div
                className={styles.cifraBarra}
                style={{ width: `${c.porcentaje}%` }}
              />
            </div>
            {cifraActiva === i && (
              <div className={styles.cifraComparacion}>
                <span aria-hidden="true">💡</span> {c.comparacion}
              </div>
            )}
          </button>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          El océano contiene el <strong>97% del agua de la Tierra</strong>, pero solo un 3,5% es sal disuelta.
          A pesar de su inmensidad, seguimos tratándolo como si fuese inagotable. Solo hemos explorado
          un 20% de su extensión.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: El corte vertical
// ─────────────────────────────────────────────

interface ZonaProfundidad {
  nombre: string;
  rango: string;
  profMin: number;
  profMax: number;
  temperatura: string;
  presion: string;
  luz: string;
  criaturas: string[];
  dato: string;
  color: string;
  colorOscuro: string;
}

const ZONAS: ZonaProfundidad[] = [
  {
    nombre: 'Zona Fótica (Epipelágica)',
    rango: '0 - 200 m',
    profMin: 0,
    profMax: 200,
    temperatura: '15 - 30 °C',
    presion: '1 - 20 atm',
    luz: 'Luz solar plena',
    criaturas: ['Atún', 'Delfines', 'Medusas', 'Fitoplancton', 'Tiburones'],
    dato: 'Aquí vive el 90% de toda la vida marina. El fitoplancton produce el 50% del oxígeno del planeta.',
    color: '#0EA5E9',
    colorOscuro: '#0284C7',
  },
  {
    nombre: 'Zona Crepuscular (Mesopelágica)',
    rango: '200 - 1.000 m',
    profMin: 200,
    profMax: 1000,
    temperatura: '5 - 15 °C',
    presion: '20 - 100 atm',
    luz: 'Luz tenue, casi oscuridad',
    criaturas: ['Pez linterna', 'Calamar gigante', 'Pez hacha', 'Pez víbora'],
    dato: 'Muchos animales producen su propia luz (bioluminiscencia). Mayor migración vertical diaria del planeta.',
    color: '#1D4ED8',
    colorOscuro: '#1E40AF',
  },
  {
    nombre: 'Zona de Medianoche (Batipelágica)',
    rango: '1.000 - 4.000 m',
    profMin: 1000,
    profMax: 4000,
    temperatura: '1 - 4 °C',
    presion: '100 - 400 atm',
    luz: 'Oscuridad total',
    criaturas: ['Pez dragón', 'Pulpo Dumbo', 'Rape abisal', 'Gusanos tubulares'],
    dato: 'Presión aplastante. Una lata de refresco se comprimiría al tamaño de un dedal.',
    color: '#1E3A8A',
    colorOscuro: '#172554',
  },
  {
    nombre: 'Zona Abisal (Abisopelágica)',
    rango: '4.000 - 6.000 m',
    profMin: 4000,
    profMax: 6000,
    temperatura: '1 - 2 °C',
    presion: '400 - 600 atm',
    luz: 'Oscuridad total',
    criaturas: ['Pepinos de mar', 'Isópodos gigantes', 'Gusanos zombi', 'Estrellas frágiles'],
    dato: 'La llanura abisal es el hábitat más extenso de la Tierra. Cubre el 65% del fondo oceánico.',
    color: '#0F172A',
    colorOscuro: '#020617',
  },
  {
    nombre: 'Zona Hadal (Hadopelágica)',
    rango: '6.000 - 11.000 m',
    profMin: 6000,
    profMax: 11000,
    temperatura: '1 - 4 °C',
    presion: '600 - 1.100 atm',
    luz: 'Oscuridad total',
    criaturas: ['Anfípodos', 'Pepinos de mar hadales', 'Pez caracol hadal', 'Bacterias barófilas'],
    dato: 'Solo existe en fosas oceánicas. La presión equivale a 50 aviones jumbo apilados sobre una persona.',
    color: '#09090B',
    colorOscuro: '#000000',
  },
];

function SeccionProfundidad() {
  const [zonaActiva, setZonaActiva] = useState(0);
  const zona = ZONAS[zonaActiva];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El océano se divide en <strong>5 zonas verticales</strong>, cada una con condiciones radicalmente distintas. La vida se adapta de maneras sorprendentes a medida que descendemos.</p>
      </div>

      {/* Columna de profundidad visual */}
      <div className={styles.profundidadContainer}>
        <div className={styles.profundidadColumna}>
          {ZONAS.map((z, i) => {
            const alturaPorcentaje = Math.max(
              10,
              ((z.profMax - z.profMin) / 11000) * 100
            );
            return (
              <button
                key={i}
                type="button"
                className={`${styles.profundidadBanda} ${zonaActiva === i ? styles.profundidadBandaActiva : ''}`}
                style={{
                  background: z.color,
                  height: `${alturaPorcentaje}%`,
                }}
                onClick={() => setZonaActiva(i)}
                aria-pressed={zonaActiva === i}
                aria-label={`${z.nombre}: ${z.rango}`}
              >
                <span className={styles.profundidadRango}>{z.rango}</span>
                <span className={styles.profundidadNombreCorto}>{z.nombre.split('(')[0].trim()}</span>
              </button>
            );
          })}
        </div>

        {/* Detalle de la zona seleccionada */}
        <div className={styles.zonaDetalle} style={{ borderColor: zona.color }}>
          <h3 className={styles.zonaNombre} style={{ color: zona.color }}>{zona.nombre}</h3>
          <p className={styles.zonaRango}>{zona.rango}</p>

          <div className={styles.zonaStats}>
            <div className={styles.zonaStat}>
              <span className={styles.zonaStatIcono} aria-hidden="true">🌡️</span>
              <span className={styles.zonaStatLabel}>Temperatura</span>
              <span className={styles.zonaStatValor}>{zona.temperatura}</span>
            </div>
            <div className={styles.zonaStat}>
              <span className={styles.zonaStatIcono} aria-hidden="true">⚖️</span>
              <span className={styles.zonaStatLabel}>Presión</span>
              <span className={styles.zonaStatValor}>{zona.presion}</span>
            </div>
            <div className={styles.zonaStat}>
              <span className={styles.zonaStatIcono} aria-hidden="true">💡</span>
              <span className={styles.zonaStatLabel}>Luz</span>
              <span className={styles.zonaStatValor}>{zona.luz}</span>
            </div>
          </div>

          <div className={styles.zonaCriaturas}>
            <span className={styles.zonaCriaturasLabel}>Habitantes típicos:</span>
            <div className={styles.zonaCriaturasLista}>
              {zona.criaturas.map((c, i) => (
                <span key={i} className={styles.zonaCriaturaBadge}>{c}</span>
              ))}
            </div>
          </div>

          <div className={styles.zonaDato}>
            <span aria-hidden="true">💡</span> {zona.dato}
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Cada <strong>10 metros</strong> de descenso añaden 1 atmósfera de presión. En el fondo de la
          Fosa de las Marianas, la presión es de <strong>{formatNumber(1100, 0)} atmósferas</strong> — más
          de 1.000 veces la presión al nivel del mar. Y aún así, hay vida.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: El plástico
// ─────────────────────────────────────────────

interface PlasticoDegradacion {
  objeto: string;
  anios: number;
  icono: string;
}

const DEGRADACION: PlasticoDegradacion[] = [
  { objeto: 'Bolsa de plástico', anios: 20, icono: '🛍️' },
  { objeto: 'Vaso de poliestireno', anios: 50, icono: '🥤' },
  { objeto: 'Lata de aluminio', anios: 200, icono: '🥫' },
  { objeto: 'Botella de plástico', anios: 450, icono: '🍼' },
  { objeto: 'Pañal desechable', anios: 500, icono: '🧷' },
  { objeto: 'Hilo de pesca', anios: 600, icono: '🎣' },
];

interface PaisContaminante {
  pais: string;
  toneladas: number;
  bandera: string;
}

const PAISES_CONTAMINANTES: PaisContaminante[] = [
  { pais: 'China', toneladas: 3530000, bandera: '🇨🇳' },
  { pais: 'Indonesia', toneladas: 1290000, bandera: '🇮🇩' },
  { pais: 'Filipinas', toneladas: 750000, bandera: '🇵🇭' },
  { pais: 'Vietnam', toneladas: 730000, bandera: '🇻🇳' },
  { pais: 'Sri Lanka', toneladas: 640000, bandera: '🇱🇰' },
  { pais: 'Tailandia', toneladas: 410000, bandera: '🇹🇭' },
];

const MAX_TONELADAS = 3530000;

function SeccionPlastico() {
  const maxAnios = Math.max(...DEGRADACION.map(d => d.anios));

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Cada año, <strong>8 millones de toneladas de plástico</strong> acaban en el océano. Equivale a vaciar un camión de basura al mar cada minuto.</p>
      </div>

      {/* Cifras de impacto */}
      <div className={styles.impactoGrid}>
        <div className={styles.impactoCard}>
          <span className={styles.impactoValor}>1,6M km²</span>
          <span className={styles.impactoDesc}>Gran Isla de Basura del Pacífico</span>
          <span className={styles.impactoComparacion}>3 veces el tamaño de España</span>
        </div>
        <div className={styles.impactoCard}>
          <span className={styles.impactoValor}>83%</span>
          <span className={styles.impactoDesc}>del agua del grifo contiene microplásticos</span>
          <span className={styles.impactoComparacion}>Detectados en 159 muestras de agua potable de todo el mundo</span>
        </div>
        <div className={styles.impactoCard}>
          <span className={styles.impactoValor}>{formatNumber(10994, 0)} m</span>
          <span className={styles.impactoDesc}>plástico en la Fosa de las Marianas</span>
          <span className={styles.impactoComparacion}>Encontrado en el punto más profundo del planeta</span>
        </div>
        <div className={styles.impactoCard}>
          <span className={styles.impactoValor}>100.000</span>
          <span className={styles.impactoDesc}>animales marinos mueren al año por plástico</span>
          <span className={styles.impactoComparacion}>Tortugas, aves, ballenas y delfines</span>
        </div>
      </div>

      {/* Barras de degradación */}
      <div className={styles.degradacionContainer}>
        <h3 className={styles.degradacionTitulo}>Tiempo de degradación en el océano</h3>
        <div className={styles.degradacionLista}>
          {DEGRADACION.map((d, i) => (
            <div key={i} className={styles.degradacionItem}>
              <div className={styles.degradacionInfo}>
                <span aria-hidden="true">{d.icono}</span>
                <span className={styles.degradacionObjeto}>{d.objeto}</span>
              </div>
              <div className={styles.degradacionBarraContainer}>
                <div
                  className={styles.degradacionBarra}
                  style={{ width: `${(d.anios / maxAnios) * 100}%` }}
                />
              </div>
              <span className={styles.degradacionAnios}>{formatNumber(d.anios, 0)} años</span>
            </div>
          ))}
        </div>
      </div>

      {/* Países más contaminantes */}
      <div className={styles.paisesContainer}>
        <h3 className={styles.paisesTitulo}>Principales emisores de plástico al océano</h3>
        <p className={styles.paisesSubtitulo}>Toneladas de plástico mal gestionado al año</p>
        <div className={styles.paisesLista}>
          {PAISES_CONTAMINANTES.map((p, i) => (
            <div key={i} className={styles.paisItem}>
              <div className={styles.paisInfo}>
                <span className={styles.paisPosicion}>#{i + 1}</span>
                <span aria-hidden="true">{p.bandera}</span>
                <span className={styles.paisNombre}>{p.pais}</span>
              </div>
              <div className={styles.paisBarraContainer}>
                <div
                  className={styles.paisBarra}
                  style={{ width: `${(p.toneladas / MAX_TONELADAS) * 100}%` }}
                />
              </div>
              <span className={styles.paisToneladas}>{formatNumber(p.toneladas, 0)} t</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          Si no cambiamos nada, en <strong>2050 habrá más plástico que peces</strong> en el océano (en peso).
          El plástico no desaparece — se fragmenta en <strong>microplásticos</strong> que entran en la cadena
          alimentaria y acaban en nuestros platos.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Regulador del clima
// ─────────────────────────────────────────────

interface DatoClima {
  valor: string;
  etiqueta: string;
  descripcion: string;
  icono: string;
}

const DATOS_CLIMA: DatoClima[] = [
  {
    valor: '30%',
    etiqueta: 'del CO₂ absorbido',
    descripcion: 'El océano ha absorbido un tercio de todo el CO₂ emitido por la humanidad desde la revolución industrial.',
    icono: '🌿',
  },
  {
    valor: '90%',
    etiqueta: 'del exceso de calor',
    descripcion: 'El océano absorbe el 90% del calor extra atrapado por los gases de efecto invernadero. Sin él, la temperatura del aire sería mucho mayor.',
    icono: '🔥',
  },
  {
    valor: '+1,5 °C',
    etiqueta: 'blanqueamiento masivo de coral',
    descripcion: 'Con solo 1,5 °C de calentamiento global, se estima la pérdida del 70-90% de los arrecifes de coral tropicales.',
    icono: '🪸',
  },
  {
    valor: '3,3 mm/año',
    etiqueta: 'subida del nivel del mar',
    descripcion: 'El nivel del mar sube por la expansión térmica del agua y el deshielo. Se acelera cada década.',
    icono: '📈',
  },
];

interface ProyeccionNivelMar {
  escenario: string;
  subida2100: string;
  descripcion: string;
  color: string;
}

const PROYECCIONES: ProyeccionNivelMar[] = [
  { escenario: 'Optimista (RCP 2.6)', subida2100: '0,3 - 0,6 m', descripcion: 'Reducción drástica de emisiones. Cumplimiento del Acuerdo de París.', color: '#22C55E' },
  { escenario: 'Moderado (RCP 4.5)', subida2100: '0,4 - 0,8 m', descripcion: 'Reducción parcial. Políticas climáticas moderadas.', color: '#F59E0B' },
  { escenario: 'Pesimista (RCP 8.5)', subida2100: '0,6 - 1,1 m', descripcion: 'Sin cambios. Continuamos quemando combustibles fósiles como hasta ahora.', color: '#EF4444' },
  { escenario: 'Deshielo acelerado', subida2100: '1,0 - 2,0+ m', descripcion: 'Colapso de capas de hielo de la Antártida occidental. Escenario catastrófico.', color: '#991B1B' },
];

function SeccionRegulador() {
  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>El océano es el <strong>mayor regulador climático</strong> de la Tierra. Absorbe CO₂, almacena calor y distribuye energía a través de corrientes globales. Sin él, el planeta sería inhabitable.</p>
      </div>

      {/* Datos principales */}
      <div className={styles.climaGrid}>
        {DATOS_CLIMA.map((d, i) => (
          <div key={i} className={styles.climaCard}>
            <span className={styles.climaIcono} aria-hidden="true">{d.icono}</span>
            <span className={styles.climaValor}>{d.valor}</span>
            <span className={styles.climaEtiqueta}>{d.etiqueta}</span>
            <p className={styles.climaDesc}>{d.descripcion}</p>
          </div>
        ))}
      </div>

      {/* Circulación termohalina */}
      <div className={styles.circulacionCard}>
        <h3 className={styles.circulacionTitulo}>La Cinta Transportadora Oceánica</h3>
        <p className={styles.circulacionSubtitulo}>Circulación termohalina global</p>
        <div className={styles.circulacionDiagrama}>
          <div className={styles.circulacionPaso}>
            <span className={styles.circulacionNum}>1</span>
            <span className={styles.circulacionTexto}>Agua caliente viaja del trópico al Atlántico Norte</span>
          </div>
          <div className={styles.circulacionFlecha} aria-hidden="true">→</div>
          <div className={styles.circulacionPaso}>
            <span className={styles.circulacionNum}>2</span>
            <span className={styles.circulacionTexto}>Se enfría, se vuelve densa y se hunde</span>
          </div>
          <div className={styles.circulacionFlecha} aria-hidden="true">→</div>
          <div className={styles.circulacionPaso}>
            <span className={styles.circulacionNum}>3</span>
            <span className={styles.circulacionTexto}>Fluye por el fondo hacia el sur y el Pacífico</span>
          </div>
          <div className={styles.circulacionFlecha} aria-hidden="true">→</div>
          <div className={styles.circulacionPaso}>
            <span className={styles.circulacionNum}>4</span>
            <span className={styles.circulacionTexto}>Sube, se calienta y vuelve a empezar (~1.000 años por ciclo)</span>
          </div>
        </div>
        <p className={styles.circulacionNota}>
          Esta corriente global distribuye calor por todo el planeta. Su debilitamiento por el deshielo
          podría alterar el clima de Europa drásticamente.
        </p>
      </div>

      {/* Proyecciones nivel del mar */}
      <div className={styles.proyeccionesContainer}>
        <h3 className={styles.proyeccionesTitulo}>Subida del nivel del mar hasta 2100</h3>
        <div className={styles.proyeccionesLista}>
          {PROYECCIONES.map((p, i) => (
            <div key={i} className={styles.proyeccionItem}>
              <div className={styles.proyeccionHeader}>
                <span className={styles.proyeccionDot} style={{ background: p.color }} />
                <span className={styles.proyeccionEscenario}>{p.escenario}</span>
                <span className={styles.proyeccionSubida} style={{ color: p.color }}>{p.subida2100}</span>
              </div>
              <p className={styles.proyeccionDesc}>{p.descripcion}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.insight}>
        <p>
          El océano nos ha protegido absorbiendo calor y CO₂, pero tiene un límite. Al calentarse,
          <strong> pierde capacidad de absorción</strong>, genera más tormentas y acidifica el agua,
          amenazando la vida marina. Es un círculo vicioso que ya está en marcha.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorOceanoPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('cifras');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'cifras': return <SeccionCifras />;
      case 'profundidad': return <SeccionProfundidad />;
      case 'plastico': return <SeccionPlastico />;
      case 'regulador': return <SeccionRegulador />;
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
          <h1 className={styles.title}>Los Números del Océano</h1>
          <p className={styles.subtitle}>71% del planeta, 11 km de profundidad, 80% sin explorar</p>
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
          title="Más sobre los océanos"
          subtitle="Curiosidades y conceptos clave"
          defaultOpen={false}
        >
          <h3>¿Por qué el mar es salado?</h3>
          <p>
            El agua de los ríos disuelve minerales de las rocas y los arrastra al mar. El agua se evapora,
            pero las sales se quedan. Tras miles de millones de años, la concentración media es de
            <strong> 35 gramos de sal por litro</strong> (3,5%).
          </p>

          <h3>¿Cuánto oxígeno produce el océano?</h3>
          <p>
            El fitoplancton marino produce <strong>entre el 50% y el 80%</strong> de todo el oxígeno
            de la atmósfera. Son organismos microscópicos, pero su impacto es mayor que el de todos
            los bosques terrestres combinados.
          </p>

          <h3>¿Qué es la acidificación oceánica?</h3>
          <p>
            Al absorber CO₂, el agua de mar forma ácido carbónico, reduciendo su pH. Desde la era
            preindustrial, el pH ha bajado de 8,2 a 8,1 — parece poco, pero es un <strong>aumento
            del 30% en acidez</strong> (escala logarítmica). Esto dificulta que moluscos y corales
            formen sus conchas y esqueletos de carbonato.
          </p>

          <h3>¿Cuánta gente depende del océano?</h3>
          <p>
            Más de <strong>3.000 millones de personas</strong> dependen del océano para su sustento.
            El sector pesquero emplea a 60 millones de personas, y el transporte marítimo mueve
            el 90% del comercio mundial.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> este explicador usa datos recopilados de fuentes como NOAA, IPCC, UNEP
            y National Geographic con fines divulgativos. Las cifras se actualizan constantemente con nuevas
            investigaciones y pueden variar según la fuente consultada.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-oceano')} />
        <ShareCard appName="visualizador-oceano" />
        <Footer appName="visualizador-oceano" />
      </div>
    </>
  );
}
