'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaAutomocion.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type Categoria =
  | 'pioneros'
  | 'industrial'
  | 'dorada'
  | 'posguerra'
  | 'boom'
  | 'crisis'
  | 'electronica'
  | 'hibridos'
  | 'electrico'
  | 'autonomo';

type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoAutomocion {
  id: number;
  periodo: string;
  anio: number;
  anioFin: number;
  titulo: string;
  descripcion: string;
  innovacion: string;
  modeloIconico: string;
  tecnologia: string;
  impacto: string;
  datos: string;
  categoria: Categoria;
}

interface EventoHistorico {
  anio: number;
  evento: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const PERIODOS: PeriodoAutomocion[] = [
  {
    id: 1, periodo: '1885–1900', anio: 1885, anioFin: 1900,
    titulo: 'Los Pioneros del Automóvil',
    descripcion: 'Karl Benz patenta el Motorwagen en 1885: el primer vehículo propulsado exclusivamente por motor de combustión interna. Gottlieb Daimler y Wilhelm Maybach desarrollan su propio motor y lo instalan en una bicicleta (1885) y después en un carruaje (1886). Bertha Benz realiza el primer viaje largo en automóvil (1888, 106 km, sin su marido y con sus hijos). En Francia, Panhard et Levassor y Peugeot fabrican los primeros automóviles en serie limitada.',
    innovacion: 'Motor de combustión interna, primer automóvil de gasolina',
    modeloIconico: 'Benz Patent-Motorwagen (1885)',
    tecnologia: 'Motor 4 tiempos, 0,75 CV, ~16 km/h',
    impacto: 'El automóvil nació como curiosidad científica. Solo los más ricos podían permitírselo — cada unidad era artesanal.',
    datos: 'El Benz Patent-Motorwagen costaba 600 marcos oro (equivalente a varios años de salario obrero). Se fabricaron apenas 25 unidades en la primera década.',
    categoria: 'pioneros',
  },
  {
    id: 2, periodo: '1900–1913', anio: 1900, anioFin: 1913,
    titulo: 'La Carrera Industrializadora',
    descripcion: 'El Ford Modelo T (1908) democratiza el automóvil: 825 dólares en su lanzamiento, sencillo de mantener y robusto. En Europa, Renault, Fiat y Mercedes-Benz compiten en fiabilidad y velocidad. Las primeras carreras de automóviles (París-Burdeos 1895, Le Mans desde 1923) se convierten en escaparate tecnológico. El número de fabricantes explota: en 1910 existen más de 200 marcas en USA.',
    innovacion: 'Ford Modelo T, carrocería de acero, primeras carreras de coches',
    modeloIconico: 'Ford Modelo T (1908)',
    tecnologia: 'Motor 4 cilindros, 20 CV, ~70 km/h',
    impacto: 'El automóvil empieza a verse como herramienta de trabajo, no solo como lujo. El caballo pierde su hegemonía en las ciudades.',
    datos: 'En 1900, los caballos provocaban más accidentes de tráfico en las ciudades que los coches. Nueva York recogía 40 toneladas de estiércol de caballo al día.',
    categoria: 'industrial',
  },
  {
    id: 3, periodo: '1913–1920', anio: 1913, anioFin: 1920,
    titulo: 'La Cadena de Montaje: Revolución de Ford',
    descripcion: 'Henry Ford instala la primera cadena de montaje en movimiento en la planta de Highland Park (1913). El tiempo de fabricación de un Modelo T cae de 12,5 horas a 93 minutos. El precio baja de 825 a 260 dólares (1925). La WWI impulsa la producción de vehículos militares (camiones, ambulancias, tanques). En 1920 hay 8 millones de automóviles en las carreteras estadounidenses.',
    innovacion: 'Cadena de montaje en movimiento, producción en masa, vehículo militar',
    modeloIconico: 'Ford Modelo T (producción en masa)',
    tecnologia: 'Línea de montaje, 1.000 unidades/día',
    impacto: 'La producción en masa transformó no solo el automóvil, sino toda la manufactura industrial del siglo XX.',
    datos: 'Ford llegó a fabricar un Modelo T cada 10 segundos en sus mejores años. En 1927, cuando dejó de fabricarse, se habían vendido 15 millones de unidades.',
    categoria: 'industrial',
  },
  {
    id: 4, periodo: '1920–1940', anio: 1920, anioFin: 1940,
    titulo: 'La Era Dorada: Diseño y Velocidad',
    descripcion: 'General Motors (Chevrolet, Cadillac, Buick) introduce el concepto de gama: distintos modelos para distintos bolsillos. Chrysler lanza el primer coche con ventana delantera curva (1934) y el diseño aerodinámico. En Europa, André Citroën introduce la tracción delantera (Citroën Traction Avant, 1934). El art déco influye en el diseño de carrocerías. El Volkswagen Käfer (Beetle) es encargado por Hitler (1938) para ser el "coche del pueblo".',
    innovacion: 'Diseño aerodinámico, tracción delantera, gamas de precio, radio de coche',
    modeloIconico: 'Citroën Traction Avant (1934) / Chrysler Airflow (1934)',
    tecnologia: 'Carrocería monocasco, transmisión automática, radio integrada',
    impacto: 'El automóvil se convirtió en símbolo de estatus social y libertad personal. La industria del automóvil es ya la más grande de USA.',
    datos: 'El Chrysler Airflow (1934) fue el primer coche diseñado en túnel de viento. Sin embargo, el público lo rechazó por "demasiado futurista": las ventas fueron un fracaso comercial.',
    categoria: 'dorada',
  },
  {
    id: 5, periodo: '1940–1950', anio: 1940, anioFin: 1950,
    titulo: 'WWII, el Jeep y el Renacimiento Europeo',
    descripcion: 'La WWII convierte las fábricas de automóviles en plantas de producción militar. El Jeep Willys (1940) se convierte en el vehículo todoterreno más importante de la guerra. El Volkswagen Beetle (diseñado 1938, producción civil desde 1945) resurge en la posguerra como símbolo de reconstrucción alemana. En Francia, el Renault 4CV (1946) y el Citroën 2CV (1948) responden a la demanda de movilidad asequible.',
    innovacion: 'Jeep (todoterreno), producción militar, renacimiento europeo económico',
    modeloIconico: 'Jeep Willys MB (1942) / Citroën 2CV (1948)',
    tecnologia: 'Tracción 4x4, motor boxer, carrocería ligera',
    impacto: 'La guerra aceleró la ingeniería automotriz 10 años. El concepto todoterreno (4x4) nació en el campo de batalla.',
    datos: 'Se fabricaron 600.000 Jeeps durante la WWII. El general Eisenhower dijo que sin el Jeep, el Ferrocarril y el avión de transporte C-47, los Aliados no habrían ganado la guerra.',
    categoria: 'posguerra',
  },
  {
    id: 6, periodo: '1950–1965', anio: 1950, anioFin: 1965,
    titulo: 'El Sueño Americano y la Movilidad Europea',
    descripcion: 'USA en los 50: aletas de tiburón, cromados y V8. Chevrolet Corvette (1953), Ford Thunderbird (1955), Cadillac Eldorado. En Europa, el SEAT 600 (1957) motoriza España: 65.000 pesetas, 4 plazas, 600cc. El Fiat 500 en Italia y el Mini en Reino Unido. Las autopistas proliferan: la Interstate Highway Act de Eisenhower (1956) crea 75.000 km de autopistas en USA. El automóvil redefine el urbanismo.',
    innovacion: 'Automóvil masivo europeo, autopistas, cultura del coche, motor V8',
    modeloIconico: 'SEAT 600 (1957) / Mini (1959) / Chevrolet Bel Air (1957)',
    tecnologia: 'Motor V8 en USA, motores pequeños eficientes en Europa',
    impacto: 'El SEAT 600 democratizó la movilidad en España. Para muchas familias fue el primer gran electrodoméstico de la era moderna.',
    datos: 'En España, el SEAT 600 se convirtió en símbolo del desarrollismo franquista. La lista de espera llegó a 2 años. Hoy hay unidades restauradas vendidas por más de 15.000 euros.',
    categoria: 'boom',
  },
  {
    id: 7, periodo: '1965–1973', anio: 1965, anioFin: 1973,
    titulo: 'Seguridad y Medioambiente: La Conciencia Crítica',
    descripcion: 'Ralph Nader publica "Unsafe at Any Speed" (1965), denunciando que el Chevrolet Corvair era peligroso. La NHTSA se crea en 1970. El cinturón de seguridad se vuelve obligatorio en muchos estados de USA. El primer reglamento de emisiones de California (1966). En España, el SEAT 124 (1968) compite con el Fiat 124 en diseño moderno. Ford Mustang (1964) lanza la categoría pony car. El primer airbag aparece en 1973.',
    innovacion: 'Cinturón obligatorio, regulación emisiones, airbag, normas de seguridad',
    modeloIconico: 'Ford Mustang (1964) / SEAT 124 (1968)',
    tecnologia: 'Cinturón de seguridad, catalizador, control de emisiones',
    impacto: 'La seguridad vial pasó de ser ignorada a convertirse en requisito legal. Las muertes en carretera en USA cayeron de 55.000 (1972) a menos de 40.000 (1980) a pesar del aumento de vehículos.',
    datos: 'El libro de Ralph Nader vendió 450.000 ejemplares y llevó al Congreso a aprobar la Ley de Seguridad Vial de 1966. General Motors contrató detectives para espiar a Nader, lo que fue peor para su imagen.',
    categoria: 'boom',
  },
  {
    id: 8, periodo: '1973–1985', anio: 1973, anioFin: 1985,
    titulo: 'Crisis del Petróleo y la Japonización',
    descripcion: 'El embargo árabe de 1973 dispara el precio del petróleo. Los coches americanos "gas-guzzlers" (devoradores de gasolina) son sustituidos por compactos japoneses eficientes. Toyota, Honda y Nissan conquistan el mercado mundial. El VW Golf (1974) redefine el automóvil europeo compacto. En España, el SEAT Ibiza (1984) es el primer coche diseñado íntegramente en España (con ayuda de Giorgetto Giugiaro). La tracción delantera se convierte en estándar.',
    innovacion: 'Eficiencia energética, motor transversal FWD, compactos japoneses, calidad Toyota',
    modeloIconico: 'VW Golf Mk1 (1974) / Toyota Corolla / SEAT Ibiza (1984)',
    tecnologia: 'Motor transversal, tracción delantera, inyección electrónica',
    impacto: 'Japón se convirtió en la primera potencia automovilística mundial, superando a USA en producción por primera vez en 1980.',
    datos: 'Toyota introdujo el concepto "kaizen" (mejora continua) y el sistema de producción TPS (Toyota Production System), que revolucionó la manufactura mundial mucho más allá del automóvil.',
    categoria: 'crisis',
  },
  {
    id: 9, periodo: '1985–2000', anio: 1985, anioFin: 2000,
    titulo: 'Era Electrónica y Globalización',
    descripcion: 'El ABS (antibloqueo de frenos) se generaliza. El airbag se hace obligatorio en USA (1989). La centralita electrónica (ECU) gestiona todos los parámetros del motor. El OBD-II estándar (1996) permite diagnosticar averías con un escáner. El Ford Mondeo (1993) se diseña como "coche mundial" para todos los mercados simultáneamente. La globalización fusiona marcas: Daimler-Chrysler, Renault-Nissan. Los SUV americanos explotan como categoría.',
    innovacion: 'ABS obligatorio, airbag, ECU, OBD-II, coche global, SUV masivo',
    modeloIconico: 'Ford Mondeo (1993) / VW Passat / Toyota Land Cruiser',
    tecnologia: 'ECU, ABS, airbag, OBD-II, inyección multipunto',
    impacto: 'La electrónica transformó el automóvil: en 1990, el software representaba el 5% del valor del coche. En 2000, el 25%. En 2025, el 40%.',
    datos: 'Un coche moderno de los 90 tenía más potencia de computación que la misión Apollo 11. El Mondeo fue diseñado simultáneamente en tres continentes, el primer "coche mundo" de la historia.',
    categoria: 'electronica',
  },
  {
    id: 10, periodo: '2000–2010', anio: 2000, anioFin: 2010,
    titulo: 'Híbridos y la Primera Revolución Verde',
    descripcion: 'El Toyota Prius (lanzado en Japón 1997, mundial 2000) populariza la hibridación: motor eléctrico + gasolina, 28 km/l. El GPS integrado llega a los coches de gama alta (2001). Los SUV dominan el mercado americano hasta la crisis de 2008. El accidente financiero de 2008 lleva a la quiebra de GM y Chrysler (rescate gubernamental). En España, el Banco de España critica el crédito al consumo para coches. Honda FCX Clarity (2008): primer coche de hidrógeno de serie.',
    innovacion: 'Híbrido gasolina-eléctrico, GPS integrado, pantallas táctiles, crisis 2008',
    modeloIconico: 'Toyota Prius (2000) / Honda FCX Clarity (2008)',
    tecnologia: 'Motor híbrido, regeneración de frenada, GPS, control de estabilidad ESP',
    impacto: 'El Prius demostró que la electrificación era viable comercialmente. Vendió 1 millón de unidades en 2008, 12 años antes de que la competencia tuviera una respuesta seria.',
    datos: 'Al Gore compró un Prius tras ganar el Oscar por "An Inconvenient Truth" (2007), convirtiendo el coche en símbolo de conciencia medioambiental en Hollywood.',
    categoria: 'hibridos',
  },
  {
    id: 11, periodo: '2010–2020', anio: 2010, anioFin: 2020,
    titulo: 'Tesla y la Revolución Eléctrica',
    descripcion: 'Tesla Model S (2012): el primer eléctrico moderno con 400 km de autonomía, pantalla táctil de 17 pulgadas y rendimiento de superdeportivo (0-100 en 4,2s). El Nissan Leaf (2010) es el eléctrico de masas más vendido del mundo. Uber y el ridesharing transforman la movilidad urbana. El piloto automático de nivel 2 (Autopilot de Tesla, 2014) llega a los coches de consumo. En España, el MOVES Plan incentiva los eléctricos.',
    innovacion: 'Eléctrico de largo alcance, piloto automático nivel 2, ridesharing, app de coche',
    modeloIconico: 'Tesla Model S (2012) / Nissan Leaf (2010)',
    tecnologia: 'Batería Li-ion, motor eléctrico de inducción, OTA updates, Autopilot',
    impacto: 'Tesla demostró que el coche eléctrico podía ser aspiracional. Su capitalización bursátil superó a Toyota en 2020, sin haber fabricado nunca más de 500.000 coches al año.',
    datos: 'Elon Musk publicó en 2006 el "Secret Tesla Motors Master Plan": hacer primero un deportivo caro, luego un sedán de precio medio, luego un coche asequible. Lo cumplió exactamente en ese orden.',
    categoria: 'electrico',
  },
  {
    id: 12, periodo: '2020–2024', anio: 2020, anioFin: 2024,
    titulo: 'Electrificación Masiva y Prohibición 2035',
    descripcion: 'La UE aprueba la prohibición de venta de coches de combustión nuevos para 2035. VW lanza la plataforma MEB: ID.3, ID.4, Audi Q4 e-tron. Renault Megane E-Tech (2022) y Peugeot e-208 lideran en Europa. La escasez de semiconductores (2021-2022) paraliza la producción mundial. China se convierte en el mayor mercado y exportador de eléctricos: BYD supera a Tesla en ventas globales (2023). El precio de las baterías cae de 1.200 $/kWh (2010) a 100 $/kWh (2024).',
    innovacion: 'Plataformas eléctricas nativas, baterías asequibles, BYD, prohibición combustión 2035',
    modeloIconico: 'VW ID.4 (2020) / BYD Atto 3 / Renault Megane E-Tech (2022)',
    tecnologia: 'Plataforma eléctrica dedicada, batería LFP, carga rápida 350 kW',
    impacto: 'En 2023, los eléctricos representaron el 14% de las ventas mundiales. En Noruega, el 90%. En España, el 5%, con infraestructura de carga aún insuficiente.',
    datos: 'BYD (Build Your Dreams), fundada en 1995 como fabricante de baterías para móviles, vendió 3 millones de coches eléctricos en 2023, superando a Tesla por primera vez.',
    categoria: 'electrico',
  },
  {
    id: 13, periodo: '2024–2030', anio: 2024, anioFin: 2030,
    titulo: 'Conducción Autónoma e IA en el Coche',
    descripcion: 'Waymo opera robotaxis comerciales en San Francisco y Phoenix (2023-2024) sin conductor de seguridad. Tesla FSD (Full Self-Driving) en versión 12 usa redes neuronales end-to-end. La IA generativa entra en los sistemas de infoentretenimiento. En China, Baidu Apollo y Huawei ADS2 compiten en autonomía. La UE trabaja en regulación para vehículos de nivel 4. España prueba autobuses autónomos en entornos controlados. El coche conectado intercambia datos con infraestructura (V2X).',
    innovacion: 'Robotaxis comerciales, IA end-to-end, V2X, regulación nivel 4',
    modeloIconico: 'Waymo One / Tesla FSD v12 / Mercedes Drive Pilot (nivel 3)',
    tecnologia: 'IA, LiDAR, radar, cámaras, V2X, 5G conectado',
    impacto: 'El coche autónomo promete eliminar el 90% de los accidentes de tráfico (causados por error humano), pero genera debates éticos, laborales y de ciberseguridad sin resolver.',
    datos: 'Waymo ha recorrido más de 30 millones de km sin conductor en condiciones reales (2024). Su tasa de accidentes es 10 veces inferior a la media humana en las mismas zonas.',
    categoria: 'autonomo',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1885, evento: 'Benz Patent-Motorwagen: nace el automóvil moderno con motor de combustión interna' },
  { anio: 1908, evento: 'Ford Modelo T: el primer automóvil asequible para la clase media' },
  { anio: 1913, evento: 'Ford Highland Park: la cadena de montaje en movimiento revoluciona la manufactura mundial' },
  { anio: 1957, evento: 'SEAT 600: el automóvil que motorizó España — símbolo del desarrollismo' },
  { anio: 1965, evento: 'Ralph Nader: "Unsafe at Any Speed" — nace el movimiento de seguridad vial' },
  { anio: 1973, evento: 'Crisis del petróleo: el automóvil enfrenta su primer gran crisis energética' },
  { anio: 1997, evento: 'Toyota Prius: el primer híbrido de serie — la electrificación comienza en serio' },
  { anio: 2008, evento: 'Crisis financiera: GM y Chrysler quiebran — fin de la era del V8 americano' },
  { anio: 2012, evento: 'Tesla Model S: el eléctrico moderno con 400 km de autonomía redefine el segmento' },
  { anio: 2023, evento: 'BYD supera a Tesla: China lidera la revolución eléctrica global' },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  pioneros: 'Pioneros',
  industrial: 'Industrialización',
  dorada: 'Era Dorada',
  posguerra: 'Posguerra',
  boom: 'Boom Económico',
  crisis: 'Crisis Petróleo',
  electronica: 'Era Electrónica',
  hibridos: 'Híbridos',
  electrico: 'Eléctrico',
  autonomo: 'Autónomo',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  pioneros: '#8B4513',
  industrial: '#D2691E',
  dorada: '#DAA520',
  posguerra: '#696969',
  boom: '#4169E1',
  crisis: '#DC143C',
  electronica: '#1E90FF',
  hibridos: '#228B22',
  electrico: '#2E86AB',
  autonomo: '#48A9A6',
};

// ─────────────────────────────────────────────
// SVG Timeline
// ─────────────────────────────────────────────

const AÑO_MIN = 1885;
const AÑO_MAX = 2030;
const SVG_ANCHO = 1100;
const MARGEN_IZQ = 40;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoAutomocion }) {
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: COLORES_CATEGORIA[periodo.categoria] }}>
      <h3 className={styles.detalleTitulo} style={{ color: COLORES_CATEGORIA[periodo.categoria] }}>
        {periodo.titulo}
      </h3>
      <p className={styles.detallePeriodo}>{periodo.periodo}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Innovación clave</h4>
          <ul className={styles.datosList}>
            {periodo.innovacion.split(', ').map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Datos técnicos</h4>
          <ul className={styles.infoList}>
            <li><strong>Modelo icónico:</strong> {periodo.modeloIconico}</li>
            <li><strong>Tecnología:</strong> {periodo.tecnologia}</li>
          </ul>
        </div>
      </div>

      <div className={styles.lineaIconica}>
        <span className={styles.lineaIconicaLabel}>Impacto histórico</span>
        <p>{periodo.impacto}</p>
      </div>

      <div className={styles.contextoBox}>
        <span className={styles.contextoLabel}>Descripción completa</span>
        <p>{periodo.descripcion}</p>
      </div>

      <div className={styles.curiosidadBox}>
        <span className={styles.curiosidadLabel}>Dato curioso</span>
        <p>{periodo.datos}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoAutomocion | null>(null);

  const filas: PeriodoAutomocion[][] = [[], [], [], []];
  const ordenados = [...PERIODOS].sort((a, b) => a.anio - b.anio);

  for (const per of ordenados) {
    let filaAsignada = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimoEnFila = filas[f][filas[f].length - 1];
      if (!ultimoEnFila || anioAX(ultimoEnFila.anioFin) + 4 <= anioAX(per.anio)) {
        filas[f].push(per);
        filaAsignada = true;
        break;
      }
    }
    if (!filaAsignada) filas[0].push(per);
  }

  const FILA_ALTO = 36;
  const FILA_OFFSET_Y = 24;
  const svgAlto = FILA_OFFSET_Y + filas.length * (FILA_ALTO + 8) + 30;

  const marcadores: number[] = [1900, 1920, 1940, 1960, 1975, 1990, 2000, 2010, 2020];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>
        Haz clic en un período para ver sus detalles. La línea abarca de 1885 a 2030.
      </p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia del automóvil"
        >
          {/* Eje horizontal */}
          <line
            x1={MARGEN_IZQ}
            y1={svgAlto - 16}
            x2={SVG_ANCHO - MARGEN_DER}
            y2={svgAlto - 16}
            stroke="var(--text-muted)"
            strokeWidth={1}
          />

          {/* Marcadores de años */}
          {marcadores.map((m) => (
            <g key={m}>
              <line
                x1={anioAX(m)}
                y1={FILA_OFFSET_Y}
                x2={anioAX(m)}
                y2={svgAlto - 16}
                stroke="var(--text-muted)"
                strokeWidth={0.5}
                strokeDasharray="3,4"
              />
              <text x={anioAX(m)} y={svgAlto - 4} fontSize={10} fill="var(--text-muted)" textAnchor="middle">
                {m}
              </text>
            </g>
          ))}

          {/* Rectángulos de períodos */}
          {filas.map((fila, fi) =>
            fila.map((per) => {
              const x = anioAX(per.anio);
              const w = Math.max(anioAX(per.anioFin) - x, 10);
              const y = FILA_OFFSET_Y + fi * (FILA_ALTO + 8);
              const esSeleccionado = seleccionado?.id === per.id;
              const color = COLORES_CATEGORIA[per.categoria];

              return (
                <g
                  key={per.id}
                  onClick={() => setSeleccionado(esSeleccionado ? null : per)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={FILA_ALTO}
                    rx={4}
                    fill={color}
                    opacity={esSeleccionado ? 1 : 0.8}
                    stroke={esSeleccionado ? '#fff' : 'none'}
                    strokeWidth={2}
                  />
                  {w > 50 && (
                    <text
                      x={x + w / 2}
                      y={y + FILA_ALTO / 2 + 4}
                      fontSize={9}
                      fill="#fff"
                      textAnchor="middle"
                      fontWeight={600}
                      style={{ pointerEvents: 'none' }}
                    >
                      {per.titulo.length > 20 ? per.titulo.substring(0, 18) + '…' : per.titulo}
                    </text>
                  )}
                </g>
              );
            })
          )}
        </svg>
      </div>

      {/* Leyenda */}
      <div className={styles.leyendaCategorias}>
        {(Object.keys(ETIQUETAS_CATEGORIA) as Categoria[]).map((cat) => (
          <span key={cat} className={styles.leyendaItem}>
            <span
              className={styles.leyendaColor}
              style={{ background: COLORES_CATEGORIA[cat] }}
              aria-hidden="true"
            />
            {ETIQUETAS_CATEGORIA[cat]}
          </span>
        ))}
      </div>

      {seleccionado && <PanelDetalle periodo={seleccionado} />}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Período en Detalle
// ─────────────────────────────────────────────

function TabDetalle() {
  const [indice, setIndice] = useState(0);
  const periodo = PERIODOS[indice];
  const color = COLORES_CATEGORIA[periodo.categoria];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Período en Detalle</h2>

      <div className={styles.periodoSelector}>
        {PERIODOS.map((per, i) => (
          <button
            key={per.id}
            className={`${styles.periodoBtn} ${i === indice ? styles.periodoBtnActivo : ''}`}
            onClick={() => setIndice(i)}
            style={i === indice ? { background: COLORES_CATEGORIA[per.categoria], borderColor: COLORES_CATEGORIA[per.categoria] } : {}}
          >
            {per.periodo}
          </button>
        ))}
      </div>

      <div className={styles.detalleTarjeta} style={{ borderTopColor: color }}>
        <div className={styles.detalleTarjetaHeader} style={{ background: color }}>
          <h3>{periodo.titulo}</h3>
          <p>{periodo.periodo}</p>
          <span>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>
        </div>

        <div className={styles.detalleTarjetaBody}>
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Tecnología</span>
              <span className={styles.statValue}>{periodo.tecnologia.split(',')[0]}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Modelo icónico</span>
              <span className={styles.statValue}>{periodo.modeloIconico.split(' /')[0]}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statLabel}>Innovación</span>
              <span className={styles.statValue}>{periodo.innovacion.split(',')[0]}</span>
            </div>
          </div>

          <div className={styles.contextoBox}>
            <span className={styles.contextoLabel}>Descripción del período</span>
            <p style={{ fontStyle: 'normal' }}>{periodo.descripcion}</p>
          </div>

          <div className={styles.lineaIconica}>
            <span className={styles.lineaIconicaLabel}>Impacto histórico</span>
            <p>{periodo.impacto}</p>
          </div>

          <div className={styles.curiosidadBox}>
            <span className={styles.curiosidadLabel}>Dato curioso</span>
            <p>{periodo.datos}</p>
          </div>
        </div>
      </div>

      <div className={styles.navBtns}>
        <button
          className={styles.btnAnterior}
          onClick={() => setIndice((i) => Math.max(0, i - 1))}
          disabled={indice === 0}
          aria-label="Período anterior"
        >
          ← Anterior
        </button>
        <span className={styles.navCounter}>{indice + 1} / {PERIODOS.length}</span>
        <button
          className={styles.btnSiguiente}
          onClick={() => setIndice((i) => Math.min(PERIODOS.length - 1, i + 1))}
          disabled={indice === PERIODOS.length - 1}
          aria-label="Período siguiente"
        >
          Siguiente →
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 3: Comparativa
// ─────────────────────────────────────────────

function TabComparativa() {
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria | 'todos'>('todos');
  const [busqueda, setBusqueda] = useState('');

  const periodosFiltrados = useMemo(() => {
    return PERIODOS.filter((per) => {
      const coincideCategoria = categoriaFiltro === 'todos' || per.categoria === categoriaFiltro;
      const termino = busqueda.toLowerCase();
      const coincideBusqueda =
        !termino ||
        per.titulo.toLowerCase().includes(termino) ||
        per.modeloIconico.toLowerCase().includes(termino) ||
        per.innovacion.toLowerCase().includes(termino);
      return coincideCategoria && coincideBusqueda;
    });
  }, [categoriaFiltro, busqueda]);

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Comparativa</h2>

      <div className={styles.filtroCategoria}>
        <button
          className={`${styles.filtroCatBtn} ${categoriaFiltro === 'todos' ? styles.filtroCatBtnActivo : ''}`}
          onClick={() => setCategoriaFiltro('todos')}
          style={categoriaFiltro === 'todos' ? { background: 'var(--primary)', borderColor: 'var(--primary)', color: '#fff' } : {}}
        >
          Todos
        </button>
        {(Object.keys(ETIQUETAS_CATEGORIA) as Categoria[]).map((cat) => (
          <button
            key={cat}
            className={`${styles.filtroCatBtn} ${categoriaFiltro === cat ? styles.filtroCatBtnActivo : ''}`}
            onClick={() => setCategoriaFiltro(cat)}
            style={categoriaFiltro === cat ? { background: COLORES_CATEGORIA[cat], borderColor: COLORES_CATEGORIA[cat] } : {}}
          >
            {ETIQUETAS_CATEGORIA[cat]}
          </button>
        ))}
      </div>

      <input
        type="search"
        className={styles.buscadorInput}
        placeholder="Buscar por período, modelo o innovación..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período de la historia del automóvil"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Categoría</th>
              <th>Tecnología</th>
              <th>Modelo icónico</th>
            </tr>
          </thead>
          <tbody>
            {periodosFiltrados.map((per, i) => (
              <tr key={per.id} style={i % 2 === 0 ? { background: `${COLORES_CATEGORIA[per.categoria]}18` } : {}}>
                <td>
                  <strong style={{ color: COLORES_CATEGORIA[per.categoria] }}>{per.titulo}</strong>
                </td>
                <td>{per.periodo}</td>
                <td>
                  <span
                    className={styles.badgeCategoria}
                    style={{
                      background: `${COLORES_CATEGORIA[per.categoria]}22`,
                      color: COLORES_CATEGORIA[per.categoria],
                    }}
                  >
                    {ETIQUETAS_CATEGORIA[per.categoria]}
                  </span>
                </td>
                <td className={styles.velocidadCell}>{per.tecnologia.split(',')[0]}</td>
                <td>{per.modeloIconico.split(' /')[0]}</td>
              </tr>
            ))}
            {periodosFiltrados.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.sinResultados}>
                  Sin resultados para la búsqueda actual.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 4: Contexto Histórico — vista por eras
// ─────────────────────────────────────────────

interface Era {
  nombre: string;
  desde: number;
  hasta: number;
  icono: string;
}

const ERAS: Era[] = [
  { nombre: 'Era Pionera', desde: 1885, hasta: 1913, icono: '🔧' },
  { nombre: 'Producción en Masa', desde: 1914, hasta: 1939, icono: '🏭' },
  { nombre: 'Posguerra y Boom', desde: 1940, hasta: 1973, icono: '🌟' },
  { nombre: 'Crisis e Innovación', desde: 1973, hasta: 2000, icono: '⚡' },
  { nombre: 'Era Digital e Híbrida', desde: 2000, hasta: 2015, icono: '💻' },
  { nombre: 'Revolución Eléctrica', desde: 2015, hasta: 9999, icono: '🔋' },
];

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos y eventos de la automoción organizados en 6 grandes eras históricas.
      </p>

      <div className={styles.erasGrid}>
        {ERAS.map((era) => {
          const periodosEra = PERIODOS.filter(
            (p) => p.anio < era.hasta && p.anioFin > era.desde
          );
          const eventosEra = EVENTOS_HISTORICOS.filter(
            (ev) => ev.anio >= era.desde && (era.hasta === 9999 ? true : ev.anio < era.hasta)
          );

          return (
            <div key={era.nombre} className={styles.eraCard}>
              <div className={styles.eraHeader}>
                <span className={styles.eraIcono} aria-hidden="true">{era.icono}</span>
                <div>
                  <h3 className={styles.eraNombre}>{era.nombre}</h3>
                  <span className={styles.eraRango}>
                    {era.desde} – {era.hasta === 9999 ? 'hoy' : era.hasta}
                  </span>
                </div>
              </div>

              {periodosEra.length > 0 && (
                <div className={styles.eraEstilos}>
                  {periodosEra.map((p) => (
                    <span
                      key={p.id}
                      className={styles.eraEstiloBadge}
                      style={{
                        background: `${COLORES_CATEGORIA[p.categoria]}1A`,
                        color: COLORES_CATEGORIA[p.categoria],
                        borderColor: `${COLORES_CATEGORIA[p.categoria]}55`,
                      }}
                    >
                      {p.titulo}
                    </span>
                  ))}
                </div>
              )}

              {eventosEra.length > 0 && (
                <ul className={styles.eraEventos}>
                  {eventosEra.map((ev) => (
                    <li key={ev.anio} className={styles.eraEvento}>
                      <span className={styles.eraEventoAnio}>{ev.anio}</span>
                      <span className={styles.eraEventoTexto}>{ev.evento}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorHistoriaAutomocion() {
  const [tabActiva, setTabActiva] = useState<TabActiva>('timeline');

  const tabs: { id: TabActiva; label: string }[] = [
    { id: 'timeline', label: 'Línea del Tiempo' },
    { id: 'detalle', label: 'Período en Detalle' },
    { id: 'comparativa', label: 'Comparativa' },
    { id: 'contexto', label: 'Contexto Histórico' },
  ];

  return (
    <div className={styles.container}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Historia del Automóvil</h1>
        <p className={styles.heroSubtitle}>
          De Benz (1885) al Coche Eléctrico Autónomo — 140 años de automoción en 13 períodos interactivos
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <nav className={styles.tabNav} role="tablist" aria-label="Secciones del visualizador">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={tabActiva === tab.id}
              className={`${styles.tabBtn} ${tabActiva === tab.id ? styles.tabBtnActivo : ''}`}
              onClick={() => setTabActiva(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className={styles.tabContent} role="tabpanel">
          {tabActiva === 'timeline' && <TabTimeline />}
          {tabActiva === 'detalle' && <TabDetalle />}
          {tabActiva === 'comparativa' && <TabComparativa />}
          {tabActiva === 'contexto' && <TabContexto />}
        </div>
      </main>

      <EducationalSection
        title="Historia del automóvil: 140 años de evolución e impacto"
        subtitle="Cómo el coche transformó la economía, las ciudades y la sociedad desde 1885"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 6 hitos de la historia del automóvil</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Era</th>
                <th>Tecnología clave</th>
                <th>Precio relativo</th>
                <th>País líder</th>
                <th>Modelo emblemático</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Pioneros (1885–1900)</strong></td>
                <td>Motor de combustión interna</td>
                <td>Artesanal, para élites</td>
                <td>Alemania / Francia</td>
                <td>Benz Patent-Motorwagen</td>
              </tr>
              <tr>
                <td><strong>Producción en Masa (1913–1939)</strong></td>
                <td>Cadena de montaje, acero</td>
                <td>Clase media baja (USA)</td>
                <td>Estados Unidos</td>
                <td>Ford Modelo T</td>
              </tr>
              <tr>
                <td><strong>Boom Económico (1950–1973)</strong></td>
                <td>V8, tracción delantera, diseño</td>
                <td>Asequible (Europa)</td>
                <td>USA / Alemania / Francia</td>
                <td>SEAT 600 / VW Beetle / Mini</td>
              </tr>
              <tr>
                <td><strong>Crisis Petróleo (1973–1985)</strong></td>
                <td>Motor eficiente, FWD, electrónica</td>
                <td>Compactos asequibles</td>
                <td>Japón</td>
                <td>VW Golf / Toyota Corolla</td>
              </tr>
              <tr>
                <td><strong>Era Híbrida (2000–2015)</strong></td>
                <td>Híbrido gasolina-eléctrico, GPS</td>
                <td>Premio de eficiencia</td>
                <td>Japón</td>
                <td>Toyota Prius</td>
              </tr>
              <tr>
                <td><strong>Revolución Eléctrica (2012–hoy)</strong></td>
                <td>Batería Li-ion, IA, autonomía</td>
                <td>En caída (paridad ~2025)</td>
                <td>USA / China</td>
                <td>Tesla Model S / BYD Han</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Escenarios de impacto */}
        <h3>Cuatro dimensiones del impacto del automóvil</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🏙️</span>
            <div>
              <strong>Impacto urbano</strong>
              <p>El automóvil rediseñó las ciudades: autopistas urbanas, aparcamientos, centros comerciales periféricos. El 30% del suelo urbano en ciudades americanas está dedicado al coche (carreteras + parking). En España, la bicicleta y el peatón están recuperando espacio gracias a políticas de movilidad sostenible en Madrid, Barcelona y Valencia.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">💰</span>
            <div>
              <strong>Impacto económico</strong>
              <p>La industria del automóvil representa el 8% del PIB español y el 14% de las exportaciones. SEAT (Volkswagen) y sus proveedores dan empleo directo e indirecto a más de 300.000 personas en España. La transición eléctrica amenaza puestos en motores de combustión (SEAT ha anunciado despidos) mientras crea nuevos en electrónica y software.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🌿</span>
            <div>
              <strong>Impacto ambiental</strong>
              <p>El transporte por carretera es el sector con mayor crecimiento de emisiones de CO2 en la UE desde 1990. Un coche eléctrico cargado con energía renovable emite 10 veces menos CO2 por km que uno de gasolina. En 2024, la prohibición de venta de coches de combustión para 2035 ya es ley en la UE, aunque Alemania consiguió una excepción para combustibles sintéticos.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">👥</span>
            <div>
              <strong>Impacto social</strong>
              <p>El automóvil es el mayor símbolo de libertad individual del siglo XX. También es la principal causa de muerte entre 15 y 29 años (accidentes de tráfico). En España, cada hora muere 1 persona en accidente de tráfico. Los sistemas ADAS (frenada automática, alerta de carril) ya evitan miles de muertes al año. El coche autónomo promete eliminar el 90% de los accidentes humanos.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes sobre la historia del automóvil</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Por qué España motoriza con el SEAT 600 y no con otro modelo?</strong>
            <p>El SEAT 600 (1957) fue el resultado directo del acuerdo entre el régimen franquista y Fiat para fabricar el Fiat 600 bajo licencia en España. El gobierno eligió el 600 porque era el más pequeño y asequible de la gama italiana, apto para las rentas de la España desarrollista. Con 65.000 pesetas (unos 15 salarios mínimos de la época), fue el primer coche de millones de familias españolas. La lista de espera llegó a 2 años en los mejores momentos.</p>
            <span className={styles.faqTip}>El SEAT 600 también fue el primer "coche de familia" en carreteras aún sin asfaltar y sin autopistas: muchos conductores lo aprendieron a conducir por primera vez con él en vías de tierra.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuándo será el coche eléctrico más barato que el de gasolina?</strong>
            <p>La "paridad de precio" (momento en que un eléctrico de base cuesta lo mismo que uno de gasolina equivalente) se espera para 2025-2027 en los segmentos medios europeos. El coste de las baterías ha caído de 1.200 $/kWh en 2010 a menos de 100 $/kWh en 2024. El coste de uso (electricidad vs. gasolina + mantenimiento) ya es inferior en el eléctrico en la mayoría de países europeos si se carga en casa. El gran obstáculo sigue siendo la infraestructura de carga rápida en España.</p>
            <span className={styles.faqTip}>En China, algunos modelos eléctricos de BYD ya son más baratos que sus equivalentes de gasolina en 2024. El BYD Seagull cuesta menos de 10.000 dólares en el mercado chino.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué es la conducción autónoma de nivel 4 y cuándo llegará a España?</strong>
            <p>La SAE define 6 niveles de autonomía (0-5). El nivel 4 significa que el coche puede conducir solo en condiciones específicas (zona geográfica, meteorología, velocidad) sin intervención humana. El nivel 5 es autonomía total en cualquier condición. En 2024, solo Waymo opera vehículos nivel 4 comercialmente (en USA, en zonas delimitadas). Mercedes-Benz tiene aprobado el nivel 3 en Alemania y USA (a baja velocidad en autopista). En España, la regulación de nivel 4 está en desarrollo: se esperan pruebas en entornos urbanos controlados para 2026-2028.</p>
            <span className={styles.faqTip}>El mayor obstáculo para la conducción autónoma no es la tecnología, sino la responsabilidad legal: ¿quién paga cuando un coche autónomo tiene un accidente? ¿El fabricante? ¿El propietario? ¿El software?</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué falló el motor de hidrógeno para coches de pasajeros?</strong>
            <p>El hidrógeno funciona en coches de dos maneras: celda de combustible (convierte H2 en electricidad) o motor de combustión modificado. La celda de combustible es eficiente pero cara y necesita infraestructura de hidrogeneras que prácticamente no existe para particulares. En 2024, hay menos de 50 hidrogeneras en toda España, frente a miles de puntos de carga eléctrica. El Toyota Mirai y el Hyundai Nexo son los únicos coches de hidrógeno de serie en Europa. La industria ha concluido que el hidrógeno es más útil para camiones de larga distancia y trenes que para coches de pasajeros.</p>
            <span className={styles.faqTip}>Elon Musk llama al hidrógeno "fool cells" (celdas de tonto) por su baja eficiencia energética: se pierde el 60% de la energía en producir, comprimir, transportar y convertir el H2 en electricidad, frente al 20% en cargar baterías Li-ion.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Qué impacto tendrá la prohibición de coches de combustión en 2035 en España?</strong>
            <p>La UE aprobó que solo se vendan coches de cero emisiones (eléctricos o hidrógeno) desde 2035. Para España, esto implica reconvertir la industria automotriz: SEAT, que fabrica motores de gasolina en Martorell, deberá completar su transición eléctrica. El gobierno español ha prometido fondos PERTE-VEC (2.975 M€) para apoyar esta transición. Los coches de gasolina existentes podrán seguir circulando indefinidamente, pero su valor residual caerá progresivamente.</p>
            <span className={styles.faqTip}>Alemania consiguió en 2023 una excepción: los coches que funcionen exclusivamente con combustibles sintéticos (e-fuels) también podrán venderse después de 2035. Pero los e-fuels son 3-4 veces más caros que la gasolina y casi no se producen en escala.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía paso a paso */}
        <h3>Cómo elegir entre eléctrico, híbrido o gasolina en España</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Analiza tu perfil de uso real</strong>
              <p>Si recorres menos de 50 km al día y puedes cargar en casa o en el trabajo, el eléctrico puro es la opción más económica a largo plazo. Si haces viajes frecuentes de larga distancia o vives en zona rural sin cargadores, el híbrido enchufable (PHEV) es un buen compromiso. Si cambias de coche cada 3-4 años, la diferencia de precio de compra puede no amortizarse con el ahorro en combustible.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Verifica la infraestructura de carga en tu municipio</strong>
              <p>España tiene unas 27.000 estaciones de carga públicas en 2024 (vs. 200.000 en Alemania). En ciudades grandes (Madrid, Barcelona, Valencia) la red es razonable; en zonas rurales, escasa. Comprueba si tu comunidad de vecinos permite instalar un punto de carga en el garaje (Ley de Propiedad Horizontal facilita desde 2021, pero requiere votación). Sin carga nocturna en casa, el ahorro del eléctrico se reduce drásticamente.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Calcula el coste total de propiedad (TCO) a 5 años</strong>
              <p>El precio de compra es solo parte del coste. Suma: seguro (similar o ligeramente más caro para eléctricos), mantenimiento (los eléctricos eliminan cambio de aceite, embrague, distribución: ahorro de 400-600 €/año), combustible (electricidad en casa ~4 €/100 km vs. gasolina ~12 €/100 km), ayudas MOVES III (hasta 9.000 € con achatarramiento). En muchas comparativas, el eléctrico tiene menor TCO a 5 años desde 2023.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Aprovecha las ayudas vigentes antes de que venzan</strong>
              <p>El Plan MOVES III (España) ofrece hasta 7.000 € para eléctricos y 4.500 € para PHEV, con incremento si achatas un coche antiguo. Algunas comunidades autónomas (Cataluña, Madrid) tienen bonificaciones adicionales. El IVA del coche eléctrico se puede deducir si lo usas para la empresa. En 2024 quedan fondos disponibles, pero los planes MOVES tienen presupuesto limitado y pueden agotarse.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Considera la autonomía real, no la del ciclo WLTP</strong>
              <p>La autonomía WLTP (medida en laboratorio) es un 20-30% superior a la real en autopista a 120 km/h y con calefacción/AC. Un eléctrico con 400 km WLTP puede dar 280-320 km reales en invierno a alta velocidad. Para viajes largos, planifica paradas en cargadores rápidos (150-350 kW): en 20-30 minutos recuperas el 80% de la batería. La red IONITY y los Superchargers de Tesla son las más fiables en España.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips */}
        <h3>Claves para entender la evolución del automóvil</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔄</span>
            <p>La historia del automóvil es cíclica: cada vez que el petróleo sube (1973, 2008, 2022), la industria innova en eficiencia. La crisis siempre ha acelerado la tecnología más que los períodos de bonanza. La transición eléctrica actual es la mayor disrupción desde la cadena de montaje de Ford en 1913.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌏</span>
            <p>El liderazgo automovilístico mundial ha cambiado tres veces: primero USA (1913-1973), luego Japón (1973-2008), ahora China. BYD, NIO, Xpeng y Geely son hoy tan innovadores como Toyota o Volkswagen lo fueron en su momento. Europa tiene una ventana de 5-10 años para no perder su industria en la transición eléctrica.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">💡</span>
            <p>El coche es el mayor bien de consumo que la mayoría de familias compra en su vida (tras la vivienda). Por eso cada transición tecnológica se nota en el bolsillo: en los 50, el SEAT 600 costaba 15 salarios mínimos; en los 90, un Polo costaba 8; en 2024, un eléctrico básico cuesta 10-12. La curva de aprendizaje siempre baja los precios con el tiempo.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🛡️</span>
            <p>La seguridad vial mejoró más por regulación que por tecnología voluntaria. El cinturón, el airbag, el ABS y los sistemas ADAS llegaron porque la ley los exigió, no porque la industria los ofreciera espontáneamente. Hoy, la regulación europea (GSR2) obliga desde 2024 a todos los coches nuevos a llevar frenada automática de emergencia, detector de velocidad y alerta de distracción del conductor.</p>
          </div>
        </div>

        {/* Sección 6 — warningBox OBLIGATORIO */}
        <div className={styles.warningBox}>
          <strong>Aviso sobre fechas, proyectos y regulaciones futuras</strong>
          <ul>
            <li>Las fechas de proyectos futuros (<strong>prohibición combustión 2035, coche autónomo nivel 4, hidrogeneras</strong>) son objetivos regulatorios o estimaciones de industria que históricamente se retrasan; verificar el estado actual antes de tomar decisiones de compra o inversión.</li>
            <li>Los datos sobre <strong>emisiones de CO2 del coche eléctrico</strong> varían según la mezcla energética del país: en Polonia (carbón) el beneficio es menor; en España (renovables crecientes) el beneficio aumenta cada año.</li>
            <li>Las <strong>ayudas MOVES</strong> y bonificaciones fiscales mencionadas están sujetas a cambios presupuestarios y pueden haber sido modificadas o agotadas; consultar siempre el IDAE o la comunidad autónoma para información actualizada.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-automocion')} />
      <ShareCard appName="visualizador-historia-automocion" />
      <Footer appName="visualizador-historia-automocion" />
    </div>
  );
}
