'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './HistoriaAviacion.module.css';
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
  | 'militar_ww1'
  | 'civil_clasica'
  | 'jet'
  | 'comercial'
  | 'supersonica'
  | 'espacial'
  | 'digital'
  | 'lowcost'
  | 'sostenible';

type TabActiva = 'timeline' | 'detalle' | 'comparativa' | 'contexto';

interface PeriodoAviacion {
  id: string;
  nombre: string;
  anioInicio: number;
  anioFin: number;
  categoria: Categoria;
  innovacion: string;
  pioneros: string[];
  hitos: string[];
  obra: string;
  pregunta: string;
  contexto: string;
  color: string;
}

interface EventoHistorico {
  anio: number;
  evento: string;
}

interface Era {
  nombre: string;
  desde: number;
  hasta: number;
  icono: string;
  descripcion: string;
}

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

const PERIODOS: PeriodoAviacion[] = [
  {
    id: 'wright',
    nombre: 'Los Pioneros del Vuelo',
    anioInicio: 1900,
    anioFin: 1914,
    categoria: 'pioneros',
    innovacion: 'Motor de combustión en aeroplano',
    pioneros: ['Wilbur y Orville Wright', 'Alberto Santos-Dumont', 'Louis Blériot'],
    hitos: [
      'Primer vuelo motorizado (Wright, 17/12/1903)',
      '12 segundos, 36,6 metros a 6,8 m/s',
      'Primer vuelo en Europa — Santos-Dumont (1906)',
      'Cruce del Canal de la Mancha — Blériot (1909)',
      'Primera escuela de aviación (1910)',
    ],
    obra: 'El Flyer de los hermanos Wright (17 de diciembre de 1903) — Kitty Hawk, Carolina del Norte',
    pregunta: '¿Por qué los Wright tuvieron éxito donde otros fallaron, y cómo se inició la industria aeronáutica?',
    contexto: 'El 17 de diciembre de 1903, Orville Wright voló 12 segundos sobre las dunas de Kitty Hawk. Su secreto: el control de tres ejes (alabeo, cabeceo, guiñada) mediante alabeado de las alas. Santos-Dumont realizó el primer vuelo europeo certificado en 1906. Blériot cruzó el Canal de la Mancha en 1909 y demostró el potencial militar del aeroplano. En 1909 ya había 10 aviadores certificados.',
    color: '#8B4513',
  },
  {
    id: 'ww1',
    nombre: 'Gran Guerra y Aviación Militar',
    anioInicio: 1914,
    anioFin: 1919,
    categoria: 'militar_ww1',
    innovacion: 'Caza y bombardero militar',
    pioneros: ['Manfred von Richthofen (Barón Rojo)', 'Eddie Rickenbacker', 'René Fonck'],
    hitos: [
      'Primeros aviones de reconocimiento (1914)',
      'Ametralladoras sincronizadas con la hélice (1915)',
      'Primer bombardero estratégico (Gotha)',
      'El "Barón Rojo" con 80 derribos (1917)',
      '5.000 aviones en el frente occidental en 1918',
    ],
    obra: 'El Fokker Dr.I triplane del Barón Rojo — el avión de combate más famoso de la WWI',
    pregunta: '¿Cómo transformó la Primera Guerra Mundial el aeroplano de curiosidad a arma decisiva?',
    contexto: 'En 1914, los aviones solo servían para reconocimiento. Hacia 1918, eran cazas supersofisticados con ametralladoras sincronizadas, bombarderos estratégicos y aviones de asalto. El "Barón Rojo" Manfred von Richthofen derribó 80 aviones antes de morir en combate. La guerra transformó la producción: Francia fabricó 68.000 aviones entre 1914 y 1918. Los pilotos se convirtieron en héroes populares.',
    color: '#8B6914',
  },
  {
    id: 'edad_oro',
    nombre: 'Edad de Oro de la Aviación',
    anioInicio: 1919,
    anioFin: 1939,
    categoria: 'civil_clasica',
    innovacion: 'Aviación civil y grandes vuelos récord',
    pioneros: ['Charles Lindbergh', 'Amelia Earhart', 'Juan de la Cierva'],
    hitos: [
      'Primer vuelo transatlántico sin escalas — Lindbergh (1927)',
      'Primer autogiro — Juan de la Cierva (1923)',
      'Amelia Earhart cruza el Atlántico sola (1932)',
      'Primeras líneas aéreas comerciales',
      'Graf Zeppelin rodea el mundo (1929)',
    ],
    obra: 'El Spirit of St. Louis de Lindbergh — 5.810 km de New York a París en 33 horas (1927)',
    pregunta: '¿Por qué la aviación civil de los años 20-30 capturó la imaginación popular como ninguna otra tecnología?',
    contexto: 'El 20 de mayo de 1927, Charles Lindbergh despegó de Nueva York a bordo del Spirit of St. Louis y aterrizó en París 33,5 horas después. 150.000 personas le recibieron en Le Bourget. Juan de la Cierva inventó el autogiro (precursor del helicóptero) en 1923. Las primeras aerolíneas — KLM (1919), Lufthansa (1926) — iniciaron el transporte aéreo comercial. Amelia Earhart desapareció intentando rodear el mundo en 1937.',
    color: '#DAA520',
  },
  {
    id: 'ww2',
    nombre: 'Segunda Guerra Mundial y Aviación',
    anioInicio: 1939,
    anioFin: 1945,
    categoria: 'militar_ww1',
    innovacion: 'Radar, combate aéreo masivo y primer jet',
    pioneros: ['Frank Whittle', 'Hans von Ohain', 'Wernher von Braun'],
    hitos: [
      'Batalla de Inglaterra (verano 1940)',
      'Radar de la RAF como ventaja decisiva',
      'Primer avión a reacción — He 178 (1939)',
      'Me 262: primer caza jet en combate (1944)',
      'B-29 Superfortress (bombardero a gran altitud)',
    ],
    obra: 'El Messerschmitt Me 262 — primer avión a reacción usado en combate, 1944',
    pregunta: '¿Por qué el jet alemán Me 262 llegó tarde para cambiar el resultado de la guerra?',
    contexto: 'La Batalla de Inglaterra (julio-octubre 1940) fue el primer conflicto decidido exclusivamente en el aire. El radar de la RAF neutralizó la Luftwaffe. Hans von Ohain hizo volar el primer jet en 1939 (He 178). El Me 262 entró en combate en 1944 pero demasiado tarde y en número insuficiente. Frank Whittle en Gran Bretaña desarrolló el jet en paralelo. La guerra aceleró la aviación décadas.',
    color: '#4A4A4A',
  },
  {
    id: 'jet_civil',
    nombre: 'Era del Jet Comercial',
    anioInicio: 1952,
    anioFin: 1970,
    categoria: 'jet',
    innovacion: 'Reactor civil — transporte masivo',
    pioneros: ['Geoffrey de Havilland', 'Juan Trippe (Pan Am)', 'Boeing 707'],
    hitos: [
      'Comet — primer jet comercial (1952)',
      'Accidentes del Comet por fatiga metal (1954)',
      'Boeing 707 (1958) — jet dominante',
      'Pan Am inaugura vuelos transocéanicos (1958)',
      'Concorde primer vuelo (1969)',
    ],
    obra: 'El Boeing 707 (1958) — redefinió el transporte aéreo internacional durante dos décadas',
    pregunta: '¿Cómo democratizó el Boeing 707 el viaje aéreo transatlántico para la clase media?',
    contexto: 'El de Havilland Comet fue el primer jet comercial en 1952, pero sus ventanas cuadradas causaron fatiga de metal y dos accidentes (1954). Boeing analizó los fallos y diseñó el 707 con ventanas redondeadas. En 1958, Pan Am inauguró vuelos Nueva York-París con 707. El precio de los billetes cayó un 50% en una década. Juan Trippe de Pan Am fue el pionero de la democratización del vuelo.',
    color: '#4682B4',
  },
  {
    id: 'supersonica',
    nombre: 'Era Supersónica y Concorde',
    anioInicio: 1969,
    anioFin: 2003,
    categoria: 'supersonica',
    innovacion: 'Vuelo supersónico civil',
    pioneros: ['André Turcat (Concorde)', 'Ingenieros soviéticos (Tu-144)'],
    hitos: [
      'Concorde primer vuelo (1969)',
      'Tu-144 soviético (1968) — primero pero con problemas',
      'Concorde en servicio (1976)',
      '2h 52min: Londres-Nueva York',
      'Accidente del Air France Concorde (2000)',
      'Retirada del Concorde (2003)',
    ],
    obra: 'El Concorde — Mach 2, 60.000 pies de altitud, 100 pasajeros, 27 años de servicio (1976-2003)',
    pregunta: '¿Por qué el Concorde nunca fue rentable y qué frenó el vuelo supersónico comercial?',
    contexto: 'El Concorde voló a Mach 2.04 (2.170 km/h), cruzando el Atlántico en menos de 3 horas. Pero consumía combustible cuatro veces más que un 747 por pasajero. Solo se fabricaron 14 unidades. La boom sónica prohibió el vuelo supersónico sobre tierra. El accidente de 2000 en París (113 muertos) aceleró su retirada en 2003. El sueño supersónico renació con Boom Supersonic en los años 2020.',
    color: '#00CED1',
  },
  {
    id: 'jumbo',
    nombre: 'El Jumbo y la Democratización del Vuelo',
    anioInicio: 1970,
    anioFin: 1995,
    categoria: 'comercial',
    innovacion: 'Avión de gran capacidad para vuelo masivo',
    pioneros: ['Juan Trippe (Pan Am)', 'Joe Sutter (Boeing 747)'],
    hitos: [
      'Boeing 747 Jumbo Jet (1969)',
      'Primer vuelo comercial Pan Am (1970)',
      'Capacidad: 490 pasajeros',
      'Revoluciona el turismo internacional',
      'Airbus A300 — primer avión europeo bicuerpo (1974)',
    ],
    obra: 'El Boeing 747 (1970) — el "Jumbo Jet" más icónico de la historia de la aviación',
    pregunta: '¿Cómo el 747 transformó el turismo internacional y puso los vuelos al alcance de la clase media?',
    contexto: 'Joe Sutter diseñó el 747 en un tiempo récord: 28 meses desde la firma del contrato. Pan Am lo puso en servicio el 22 de enero de 1970 en la ruta Nueva York-Londres. Con 490 pasajeros (vs 189 del 707), el coste por asiento cayó drásticamente. Por primera vez, el vuelo transatlántico era accesible para la clase media. El 747 impulsó el turismo de masas internacional.',
    color: '#6A5ACD',
  },
  {
    id: 'lowcost_digital',
    nombre: 'Low Cost y Desregulación',
    anioInicio: 1978,
    anioFin: 2010,
    categoria: 'lowcost',
    innovacion: 'Modelo low-cost y desregulación aérea',
    pioneros: ["Herb Kelleher (Southwest)", "Michael O'Leary (Ryanair)", 'Stelios Haji-Ioannou (EasyJet)'],
    hitos: [
      'Airline Deregulation Act EE.UU. (1978)',
      'Southwest Airlines modelo low-cost',
      'Ryanair copia el modelo europeo (1985)',
      'Reservas online (1996)',
      'EasyJet: primeras reservas por internet',
      '100€ Madrid-Londres se hace posible',
    ],
    obra: 'El modelo Southwest Airlines — un solo tipo de avión, sin asignación de asientos, rotación rápida',
    pregunta: '¿Cómo el modelo low-cost de Southwest revolucionó la industria aérea global?',
    contexto: 'La desregulación aérea estadounidense de 1978 permitió la competencia de precios. Southwest Airlines demostró que se podía volar barato con un solo tipo de avión (Boeing 737), sin intermediarios y con rotaciones rápidas. Ryanair copió el modelo en Europa en 1985. Internet permitió vender directamente al pasajero. El número de pasajeros mundiales se cuadruplicó entre 1980 y 2010.',
    color: '#FF8C00',
  },
  {
    id: 'digital',
    nombre: 'Aviación Digital y Composite',
    anioInicio: 2000,
    anioFin: 2020,
    categoria: 'digital',
    innovacion: 'Materiales compuestos y fly-by-wire',
    pioneros: ['Boeing (787 Dreamliner)', 'Airbus (A380 y A350)'],
    hitos: [
      'Airbus A380 (2005) — el mayor avión comercial',
      'Boeing 787 Dreamliner (2011) — 50% composite',
      'Fly-by-wire generalizado',
      'GPS y navegación digital',
      'A350 XWB: 70% composite y materiales avanzados',
    ],
    obra: 'El Boeing 787 Dreamliner (2011) — primer avión con 50% de materiales compuestos de carbono',
    pregunta: '¿Qué significa para la seguridad y eficiencia volar en un avión 50% fabricado en fibra de carbono?',
    contexto: 'El Boeing 787 Dreamliner revolucionó la ingeniería aeronáutica: el 50% de su estructura es carbono-epoxy, 20% aluminio. Consume un 20% menos de combustible que aviones equivalentes. Las ventanas son electrocromáticas (sin persianas). La cabina tiene mayor presión y humedad, reduciendo el jet lag. El A380 de Airbus (550 pasajeros) nunca fue rentable: los hub-to-hub no se impusieron frente al punto-a-punto.',
    color: '#1E90FF',
  },
  {
    id: 'drones_uam',
    nombre: 'Drones y Movilidad Aérea Urbana',
    anioInicio: 2010,
    anioFin: 2025,
    categoria: 'digital',
    innovacion: 'Vehículos aéreos autónomos',
    pioneros: ['DJI (drones civiles)', 'Joby Aviation', 'Lilium', 'Archer Aviation'],
    hitos: [
      'DJI Phantom — primer drone civil masivo (2013)',
      'Drones de entrega Amazon Prime Air',
      'eVTOL: taxis aéreos eléctricos',
      'Certificación FAA primer eVTOL (2023)',
      'Drones militares en guerras de Ucrania y Gaza',
    ],
    obra: 'El DJI Phantom (2013) — democratizó la fotografía aérea y abrió el mercado de drones civiles',
    pregunta: '¿Se convertirán los taxis aéreos eléctricos en el Metro del cielo para 2030?',
    contexto: 'DJI convirtió los drones en productos de consumo masivo en 2013. La guerra de Ucrania demostró el valor táctico de drones baratos. Joby Aviation, Lilium y Archer desarrollan eVTOL (vehículos de despegue y aterrizaje vertical eléctricos) para movilidad urbana. La FAA certificó el primer eVTOL en 2023. Dubai y São Paulo planean lanzar servicios comerciales en 2025-2026.',
    color: '#32CD32',
  },
  {
    id: 'sostenibilidad',
    nombre: 'Aviación Sostenible',
    anioInicio: 2015,
    anioFin: 2030,
    categoria: 'sostenible',
    innovacion: 'SAF, hidrógeno y aviación verde',
    pioneros: ['Airbus (ZEROe)', 'ZeroAvia', 'Heart Aerospace'],
    hitos: [
      'Vuelo con SAF (combustible sostenible de aviación)',
      'Avión de hidrógeno ZeroAvia (2023)',
      'Objetivo Net-Zero aviación 2050 (IATA)',
      'Airbus ZEROe: concepto hidrógeno (2020)',
      'Impuesto de carbono en aviación (UE 2024)',
    ],
    obra: 'El ZeroAvia HyFlyer — primer avión de hidrógeno con pasajeros (19 plazas, 2023)',
    pregunta: '¿Puede la aviación descarbonizarse sin sacrificar la conectividad global que ha creado?',
    contexto: 'La aviación emite el 2.5% del CO₂ global pero el 3.5% del forzamiento radiativo total. IATA se comprometió a Net-Zero en 2050. El SAF (combustible sostenible: biomasa, CO₂ capturado) puede reducir emisiones un 80%. ZeroAvia voló el primer avión de hidrógeno con pasajeros en 2023. Airbus presenta el ZEROe: un avión de hidrógeno para los años 2030. El reto: el SAF cuesta 3-5 veces más que el queroseno.',
    color: '#3CB371',
  },
  {
    id: 'supersonico_nuevo',
    nombre: 'Renacimiento Supersónico',
    anioInicio: 2020,
    anioFin: 2035,
    categoria: 'supersonica',
    innovacion: 'Supersónico civil de nueva generación',
    pioneros: ['Blake Scholl (Boom Supersonic)', 'Aerion Supersonic'],
    hitos: [
      'Boom Supersonic XB-1 (primer vuelo 2024)',
      'Overture: 80 pasajeros a Mach 1.7',
      'United Airlines: 15 Overture reservados',
      'NASA X-59 QueSST — boom sónico silencioso',
      'Aerion AS2: cancelado por financiación',
    ],
    obra: 'El Boom Overture — 80 pasajeros, Mach 1.7, Nueva York-Londres en 3h30min (estimado 2029)',
    pregunta: '¿Conseguirá Boom Supersonic lo que el Concorde no pudo: hacer rentable el vuelo supersónico?',
    contexto: 'Boom Supersonic, fundada en 2014, planea el Overture con 80 pasajeros a Mach 1.7. Su clave diferencial: combustible 100% SAF y boom sónico reducido. United Airlines tiene 15 unidades reservadas. La NASA desarrolla el X-59 QueSST para demostrar que el boom sónico puede ser silencioso. El desafío sigue siendo el mismo que el Concorde: coste de operación y restricciones sobre tierra.',
    color: '#9370DB',
  },
  {
    id: 'ia_piloto',
    nombre: 'IA y Vuelo Autónomo',
    anioInicio: 2020,
    anioFin: 2040,
    categoria: 'digital',
    innovacion: 'Inteligencia artificial en aviación',
    pioneros: ['Xwing (cargo autónomo)', 'Reliable Robotics', 'Airbus (A350 autonomous landing)'],
    hitos: [
      'A350 aterriza autónomamente (Airbus, 2020)',
      'Xwing: carga autónoma nocturna en EE.UU.',
      'Boeing 737 con piloto automático IA',
      'Sistemas de prevención de colisiones con IA',
      'Mantenimiento predictivo con machine learning',
    ],
    obra: 'El A350 de Airbus con aterrizaje autónomo completo (2020) — sin intervención humana',
    pregunta: '¿Cuándo volaremos en aviones completamente autónomos sin piloto a bordo?',
    contexto: 'Airbus demostró en 2020 el aterrizaje autónomo completo de un A350 sin intervención del piloto, usando visión por computador y sensores LiDAR. Xwing opera vuelos de carga nocturnos autónomos en EE.UU. La IA analiza millones de datos para mantenimiento predictivo. Los pilotos automáticos ya gestionan el 99% del vuelo. La transición completa a autónomo enfrenta barreras regulatorias y de percepción pública.',
    color: '#4B0082',
  },
  {
    id: 'electrico_futuro',
    nombre: 'Aviación Eléctrica e IA',
    anioInicio: 2023,
    anioFin: 2040,
    categoria: 'sostenible',
    innovacion: 'Aviones eléctricos y vuelo sostenible',
    pioneros: ['Heart Aerospace (ES-30)', 'TECNAM P-Volt', 'Pipistrel Velis Electro'],
    hitos: [
      'Pipistrel Velis Electro — primer avión eléctrico certificado (2020)',
      'Heart Aerospace ES-30 — 30 pasajeros eléctricos (2028)',
      'Baterías de estado sólido para aviación',
      'Rutas cortas totalmente eléctricas',
      'Hibridación eléctrica para largo alcance',
    ],
    obra: 'El Pipistrel Velis Electro (2020) — primer avión eléctrico certificado por la EASA',
    pregunta: '¿Puede la aviación eléctrica reemplazar al keroseno en rutas cortas antes de 2035?',
    contexto: 'El Pipistrel Velis Electro se convirtió en 2020 en el primer avión eléctrico certificado por la EASA. Heart Aerospace (Suecia) desarrolla el ES-30: 30 pasajeros, 200 km de alcance, lanzamiento en 2028. Las baterías actuales tienen 1/50 de la densidad energética del keroseno. Las rutas menores de 500 km son el objetivo inicial. La hibridación eléctrica podría reducir el consumo de largo alcance un 30%.',
    color: '#20B2AA',
  },
];

const EVENTOS_HISTORICOS: EventoHistorico[] = [
  { anio: 1903, evento: 'Wright Flyer en Kitty Hawk: 12 segundos, 36,6 metros — el primer vuelo motorizado de la historia' },
  { anio: 1909, evento: 'Blériot cruza el Canal de la Mancha en 37 minutos: el aeroplano conquista Europa' },
  { anio: 1927, evento: 'Lindbergh cruza el Atlántico en solitario en 33,5 horas: el vuelo como hazaña épica' },
  { anio: 1939, evento: 'Primer avión a reacción — He 178 de Heinkel: el futuro de la propulsión aeronáutica' },
  { anio: 1947, evento: 'Chuck Yeager rompe la barrera del sonido en el Bell X-1: Mach 1,06' },
  { anio: 1969, evento: 'Boeing 747 Jumbo Jet y primer vuelo del Concorde: el año que cambió la aviación comercial' },
  { anio: 1978, evento: 'Desregulación aérea en EE.UU.: nacen las aerolíneas de bajo coste' },
  { anio: 2003, evento: 'Retirada del Concorde: fin de la era supersónica comercial — por ahora' },
  { anio: 2011, evento: 'Boeing 787 Dreamliner: primer avión con 50% de materiales compuestos en servicio' },
  { anio: 2023, evento: 'ZeroAvia vuela el primer avión de hidrógeno con pasajeros; FAA certifica el primer eVTOL' },
];

const ERAS: Era[] = [
  {
    nombre: 'Pioneros y Gran Guerra',
    desde: 1900,
    hasta: 1919,
    icono: '✈️',
    descripcion: 'Del primer vuelo de 12 segundos a 5.000 aviones en el frente occidental',
  },
  {
    nombre: 'Edad de Oro y Segunda Guerra',
    desde: 1920,
    hasta: 1950,
    icono: '⭐',
    descripcion: 'Lindbergh, el Concorde embrionario, el radar y el jet nacen en tiempos de paz y guerra',
  },
  {
    nombre: 'Jet y Democratización',
    desde: 1950,
    hasta: 1980,
    icono: '🚀',
    descripcion: 'El 707, el Jumbo y el Concorde transforman el viaje aéreo para millones',
  },
  {
    nombre: 'Low Cost y Digital',
    desde: 1980,
    hasta: 2010,
    icono: '💻',
    descripcion: 'Ryanair, Internet y materiales composites hacen volar barato y eficiente',
  },
  {
    nombre: 'Drones, IA y Autonomía',
    desde: 2010,
    hasta: 2025,
    icono: '🤖',
    descripcion: 'DJI, eVTOL y aterrizajes autónomos: la nueva frontera aérea',
  },
  {
    nombre: 'Aviación Sostenible y Supersónica',
    desde: 2020,
    hasta: 2040,
    icono: '🌱',
    descripcion: 'Hidrógeno, eléctrico, SAF y supersónico renaciente definen el futuro',
  },
];

const ETIQUETAS_CATEGORIA: Record<Categoria, string> = {
  pioneros: 'Pioneros',
  militar_ww1: 'Militar',
  civil_clasica: 'Civil Clásica',
  jet: 'Era Jet',
  comercial: 'Comercial',
  supersonica: 'Supersónica',
  espacial: 'Espacial',
  digital: 'Digital',
  lowcost: 'Low Cost',
  sostenible: 'Sostenible',
};

const COLORES_CATEGORIA: Record<Categoria, string> = {
  pioneros: '#8B4513',
  militar_ww1: '#8B6914',
  civil_clasica: '#DAA520',
  jet: '#4682B4',
  comercial: '#6A5ACD',
  supersonica: '#00CED1',
  espacial: '#9932CC',
  digital: '#1E90FF',
  lowcost: '#FF8C00',
  sostenible: '#3CB371',
};

// ─────────────────────────────────────────────
// Subcomponentes
// ─────────────────────────────────────────────

function PanelDetalle({ periodo }: { periodo: PeriodoAviacion }) {
  return (
    <div className={styles.detallePanel} style={{ borderLeftColor: periodo.color }}>
      <h3 className={styles.detalleTitulo} style={{ color: periodo.color }}>{periodo.nombre}</h3>
      <p className={styles.detallePeriodo}>{periodo.anioInicio} – {periodo.anioFin}</p>
      <span className={styles.detalleCategoria}>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>

      <div className={styles.detalleGrid}>
        <div>
          <h4 className={styles.detalleSubtitulo}>Hitos clave</h4>
          <ul className={styles.hitosList}>
            {periodo.hitos.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className={styles.detalleSubtitulo}>Pioneros</h4>
          <ul className={styles.pionerosList}>
            {periodo.pioneros.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.obraIconica}>
        <span className={styles.obraIconicaLabel}>Obra / Innovación icónica</span>
        <p>{periodo.obra}</p>
      </div>

      <div className={styles.preguntaBox}>
        <span className={styles.preguntaLabel}>Pregunta central</span>
        <p className={styles.preguntaTexto}>{periodo.pregunta}</p>
      </div>

      <div className={styles.contextoBox}>
        <span className={styles.contextoLabel}>Contexto histórico</span>
        <p>{periodo.contexto}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Línea del Tiempo
// ─────────────────────────────────────────────

const AÑO_MIN = 1900;
const AÑO_MAX = 2025;
const SVG_ANCHO = 1100;
const MARGEN_IZQ = 40;
const MARGEN_DER = 20;
const AREA_ANCHO = SVG_ANCHO - MARGEN_IZQ - MARGEN_DER;

function anioAX(anio: number): number {
  return MARGEN_IZQ + ((anio - AÑO_MIN) / (AÑO_MAX - AÑO_MIN)) * AREA_ANCHO;
}

function TabTimeline() {
  const [seleccionado, setSeleccionado] = useState<PeriodoAviacion | null>(null);

  const filas: PeriodoAviacion[][] = [[], [], [], []];
  const ordenados = [...PERIODOS].sort((a, b) => a.anioInicio - b.anioInicio);

  for (const per of ordenados) {
    let filaAsignada = false;
    for (let f = 0; f < filas.length; f++) {
      const ultimoEnFila = filas[f][filas[f].length - 1];
      const finUltimo = ultimoEnFila ? Math.min(ultimoEnFila.anioFin, AÑO_MAX) : AÑO_MIN;
      if (!ultimoEnFila || anioAX(finUltimo) + 4 <= anioAX(per.anioInicio)) {
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

  const marcadores: number[] = [1900, 1910, 1920, 1930, 1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Línea del Tiempo</h2>
      <p className={styles.sectionDesc}>Haz clic en un período para ver sus detalles. La línea abarca desde 1900 hasta la actualidad.</p>

      <div className={styles.timelineScrollWrapper}>
        <svg
          className={styles.timelineSvg}
          width={SVG_ANCHO}
          height={svgAlto}
          role="img"
          aria-label="Línea del tiempo de la historia de la aviación"
        >
          {/* Eje horizontal */}
          <line x1={MARGEN_IZQ} y1={svgAlto - 16} x2={SVG_ANCHO - MARGEN_DER} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={1} />

          {/* Marcadores de años */}
          {marcadores.map((m) => (
            <g key={m}>
              <line x1={anioAX(m)} y1={FILA_OFFSET_Y} x2={anioAX(m)} y2={svgAlto - 16} stroke="var(--text-muted)" strokeWidth={0.5} strokeDasharray="3,4" />
              <text x={anioAX(m)} y={svgAlto - 4} fontSize={10} fill="var(--text-muted)" textAnchor="middle">{m}</text>
            </g>
          ))}

          {/* Rectángulos de períodos */}
          {filas.map((fila, fi) =>
            fila.map((per) => {
              const anioFin = Math.min(per.anioFin, AÑO_MAX);
              const x = anioAX(per.anioInicio);
              const w = Math.max(anioAX(anioFin) - x, 10);
              const y = FILA_OFFSET_Y + fi * (FILA_ALTO + 8);
              const esSeleccionado = seleccionado?.id === per.id;

              return (
                <g key={per.id} onClick={() => setSeleccionado(esSeleccionado ? null : per)} style={{ cursor: 'pointer' }}>
                  <rect
                    x={x}
                    y={y}
                    width={w}
                    height={FILA_ALTO}
                    rx={4}
                    fill={per.color}
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
                      {per.nombre.length > 18 ? per.nombre.substring(0, 16) + '…' : per.nombre}
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
            <span className={styles.leyendaColor} style={{ background: COLORES_CATEGORIA[cat] }} aria-hidden="true" />
            {ETIQUETAS_CATEGORIA[cat]}
          </span>
        ))}
      </div>

      {seleccionado && (
        <PanelDetalle periodo={seleccionado} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Período en Detalle
// ─────────────────────────────────────────────

function TabDetalle() {
  const [indice, setIndice] = useState(0);
  const periodo = PERIODOS[indice];

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Período en Detalle</h2>

      <div className={styles.movimientoSelector}>
        {PERIODOS.map((per, i) => (
          <button
            key={per.id}
            className={`${styles.movimientoBtn} ${i === indice ? styles.movimientoBtnActivo : ''}`}
            onClick={() => setIndice(i)}
            style={i === indice ? { background: per.color, borderColor: per.color } : {}}
          >
            {per.nombre}
          </button>
        ))}
      </div>

      <div className={styles.detalleTarjeta} style={{ borderTopColor: periodo.color }}>
        <div className={styles.detalleTarjetaHeader} style={{ background: periodo.color }}>
          <h3>{periodo.nombre}</h3>
          <p>{periodo.anioInicio} – {periodo.anioFin}</p>
          <span>{ETIQUETAS_CATEGORIA[periodo.categoria]}</span>
        </div>

        <div className={styles.detalleTarjetaBody}>
          <div className={styles.preguntaDestacada}>
            <span className={styles.preguntaIcono} aria-hidden="true">?</span>
            <p>{periodo.pregunta}</p>
          </div>

          <div className={styles.detalleGrid}>
            <div>
              <h4 className={styles.detalleSubtitulo}>Hitos clave</h4>
              <ul className={styles.hitosList}>
                {periodo.hitos.map((h) => <li key={h}>{h}</li>)}
              </ul>
            </div>
            <div>
              <h4 className={styles.detalleSubtitulo}>Pioneros</h4>
              <ul className={styles.pionerosList}>
                {periodo.pioneros.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>
          </div>

          <div className={styles.obraIconica}>
            <span className={styles.obraIconicaLabel}>Obra / Innovación icónica</span>
            <p>{periodo.obra}</p>
          </div>

          <div className={styles.contextoBox}>
            <span className={styles.contextoLabel}>Contexto histórico</span>
            <p>{periodo.contexto}</p>
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
      const coincideBusqueda = !termino ||
        per.nombre.toLowerCase().includes(termino) ||
        per.pioneros.some((p) => p.toLowerCase().includes(termino)) ||
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
          style={categoriaFiltro === 'todos' ? { background: 'var(--primary)', borderColor: 'var(--primary)' } : {}}
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
        placeholder="Buscar por período, pionero o innovación..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        aria-label="Buscar período de la historia de la aviación"
      />

      <div className={styles.tableWrapper}>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Período</th>
              <th>Rango</th>
              <th>Categoría</th>
              <th>Pionero clave</th>
              <th>Innovación</th>
            </tr>
          </thead>
          <tbody>
            {periodosFiltrados.map((per, i) => (
              <tr
                key={per.id}
                style={i % 2 === 0 ? { background: `${per.color}18` } : {}}
              >
                <td><strong style={{ color: per.color }}>{per.nombre}</strong></td>
                <td>{per.anioInicio}–{per.anioFin}</td>
                <td>
                  <span className={styles.badgeCategoria} style={{ background: `${COLORES_CATEGORIA[per.categoria]}22`, color: COLORES_CATEGORIA[per.categoria] }}>
                    {ETIQUETAS_CATEGORIA[per.categoria]}
                  </span>
                </td>
                <td>{per.pioneros[0]}</td>
                <td className={styles.innovacionCell}>{per.innovacion}</td>
              </tr>
            ))}
            {periodosFiltrados.length === 0 && (
              <tr>
                <td colSpan={5} className={styles.sinResultados}>Sin resultados para la búsqueda actual.</td>
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

function TabContexto() {
  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Contexto Histórico</h2>
      <p className={styles.sectionDesc}>
        Períodos de la aviación y eventos históricos organizados por eras.
      </p>

      <div className={styles.erasGrid}>
        {ERAS.map((era) => {
          const periodosEra = PERIODOS.filter(
            (p) => p.anioInicio < era.hasta && p.anioFin > era.desde
          );
          const eventosEra = EVENTOS_HISTORICOS.filter(
            (ev) => ev.anio >= era.desde && ev.anio < era.hasta
          );

          return (
            <div key={era.nombre} className={styles.eraCard}>
              <div className={styles.eraHeader}>
                <span className={styles.eraIcono} aria-hidden="true">{era.icono}</span>
                <div>
                  <h3 className={styles.eraNombre}>{era.nombre}</h3>
                  <span className={styles.eraRango}>
                    {era.desde} – {era.hasta > 2025 ? 'hoy' : era.hasta}
                  </span>
                </div>
              </div>

              <p className={styles.eraDescripcion}>{era.descripcion}</p>

              {periodosEra.length > 0 && (
                <div className={styles.eraEstilos}>
                  {periodosEra.map((p) => (
                    <span
                      key={p.id}
                      className={styles.eraEstiloBadge}
                      style={{ background: `${p.color}1A`, color: p.color, borderColor: `${p.color}55` }}
                    >
                      {p.nombre}
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

export default function VisualizadorHistoriaAviacion() {
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
        <h1 className={styles.heroTitle}>Historia de la Aviación</h1>
        <p className={styles.heroSubtitle}>
          De los hermanos Wright a la aviación eléctrica — 14 períodos con los pioneros, innovaciones y eventos que transformaron el vuelo en 125 años
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
        title="Guía completa sobre la historia de la aviación"
        subtitle="Cómo el aeroplano transformó la humanidad en poco más de un siglo"
      >
        {/* Sección 1 — Tabla Comparativa */}
        <h3>Comparativa rápida: 5 períodos clave de la historia de la aviación</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Era</th>
                <th>Hito tecnológico</th>
                <th>Velocidad / Capacidad</th>
                <th>Impacto económico</th>
                <th>Reto pendiente</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Pioneros (1900–1919)</strong></td>
                <td>Aeroplano de motor y hélice</td>
                <td>50 km/h, 1 persona</td>
                <td>Industria aeronáutica naciente</td>
                <td>Control, potencia y alcance</td>
              </tr>
              <tr>
                <td><strong>Jet Civil (1952–1970)</strong></td>
                <td>Motor turborreactor comercial</td>
                <td>900 km/h, 150 pasajeros</td>
                <td>Billetes 50% más baratos en 10 años</td>
                <td>Fatiga de materiales (Comet)</td>
              </tr>
              <tr>
                <td><strong>Jumbo (1970–1995)</strong></td>
                <td>Gran capacidad 747</td>
                <td>920 km/h, 490 pasajeros</td>
                <td>Turismo internacional de masas</td>
                <td>Rentabilidad por asiento</td>
              </tr>
              <tr>
                <td><strong>Low Cost (1978–2010)</strong></td>
                <td>Modelo Southwest / Ryanair</td>
                <td>Boeing 737, rotación rápida</td>
                <td>100€ Madrid-Londres posible</td>
                <td>Impacto ambiental ignorado</td>
              </tr>
              <tr>
                <td><strong>Aviación Verde (2015–hoy)</strong></td>
                <td>SAF, hidrógeno, eléctrico</td>
                <td>200 km (eléctrico), emisiones -80%</td>
                <td>SAF 3-5x más caro que keroseno</td>
                <td>Escala industrial y densidad energética</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Sección 2 — Escenarios */}
        <h3>Debates clave en la aviación del futuro</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🚕</span>
            <div>
              <strong>Taxis aéreos en 2030: ¿realidad o marketing?</strong>
              <p>Joby, Archer y Lilium tienen certificaciones parciales. Dubai y São Paulo planean lanzar servicios. La FAA certificó el primer eVTOL en 2023. Pero los vertiports, la normativa urbana y el coste siguen siendo barreras reales.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">⚡</span>
            <div>
              <strong>Supersónico rentable: el reto del Boom Overture</strong>
              <p>Boom Supersonic planea el Overture (Mach 1.7, 80 pasajeros) para 2029 con SAF al 100%. United tiene 15 reservados. El desafío del Concorde fue económico y regulatorio — no tecnológico. ¿Esta vez es diferente?</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🌍</span>
            <div>
              <strong>Aviación Net-Zero 2050: ¿misión imposible?</strong>
              <p>IATA se comprometió a cero emisiones netas en 2050. El SAF puede reducirlas un 80% pero representa menos del 0,1% del combustible actual. El hidrógeno y el eléctrico tienen limitaciones de densidad energética para largo alcance.</p>
            </div>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcon} aria-hidden="true">🤖</span>
            <div>
              <strong>Autonomía total: ¿aviones sin piloto para 2040?</strong>
              <p>Airbus aterrizó autónomamente un A350 en 2020. Xwing opera vuelos de carga autónomos en EE.UU. Las barreras son regulatorias y de confianza pública, no técnicas. La transición será gradual: primero carga, luego regional, luego largo alcance.</p>
            </div>
          </div>
        </div>

        {/* Sección 3 — FAQ */}
        <h3>Preguntas frecuentes sobre historia de la aviación</h3>
        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Quiénes inventaron el avión realmente?</strong>
            <p>Los hermanos Wright son los reconocidos universalmente por el primer vuelo motorizado, controlado y sostenido (17 de diciembre de 1903, Kitty Hawk, 12 segundos, 36,6 metros). Su clave fue el control de tres ejes. Brasil reivindica a Santos-Dumont, que voló en 1906 sin catapulta. Blériot cruzó el Canal de la Mancha en 1909, certificando el potencial del aeroplano ante el mundo.</p>
            <span className={styles.faqTip}>Curiosidad: los Wright mantuvieron en secreto su invento durante años. Su primer vuelo público fue en Francia en 1908 — cinco años después de Kitty Hawk.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué desapareció el Concorde?</strong>
            <p>El Concorde dejó de operar en 2003 por tres factores: el accidente de París en julio de 2000 (113 muertos) dañó su reputación irreparablemente; el 11S de 2001 hundió el tráfico transatlántico de primera clase (su único mercado); y sus costes operativos eran prohibitivos — consumía combustible cuatro veces más por pasajero que un 747. British Airways y Air France decidieron no invertir en renovarlo.</p>
            <span className={styles.faqTip}>Boom Supersonic intenta revivir el vuelo supersónico con el Overture (Mach 1.7, 80 pasajeros), previsto para 2029. La diferencia clave: SAF al 100% y boom sónico reducido.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cómo afecta la aviación al cambio climático?</strong>
            <p>La aviación emite el 2,5% del CO₂ global, pero su efecto climático total (contrails, ozono a gran altitud) se estima en el 3,5% del forzamiento radiativo total. Un vuelo transatlántico de ida y vuelta genera entre 1 y 3 toneladas de CO₂ equivalente por pasajero. El SAF puede reducir las emisiones hasta un 80%, pero representa menos del 0,1% del combustible consumido actualmente.</p>
            <span className={styles.faqTip}>El impacto per cápita más eficiente: volar en clase turista (más pasajeros por vuelo) reduce el impacto individual más que cualquier compensación de carbono actual.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuándo habrá aviones eléctricos comerciales?</strong>
            <p>Los aviones totalmente eléctricos para vuelos regionales cortos (menos de 500 km, menos de 30 pasajeros) podrían estar en servicio comercial entre 2027 y 2030. Heart Aerospace (ES-30, 30 pasajeros) y Pipistrel ya tienen el primer avión eléctrico certificado (Velis Electro). El problema fundamental: el queroseno tiene 12 kWh/kg de densidad energética; las mejores baterías actuales llegan a 0,3 kWh/kg.</p>
            <span className={styles.faqTip}>Para vuelos de largo alcance, el hidrógeno líquido es más prometedor que las baterías. El ZEROe de Airbus apunta a los años 2030 — con propulsión de hidrógeno, no baterías.</span>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Es seguro volar?</strong>
            <p>La aviación comercial es el medio de transporte más seguro por kilómetro recorrido. En 2023, con más de 4.500 millones de pasajeros, los accidentes mortales fueron mínimos. La probabilidad de morir en un vuelo comercial es aproximadamente 1 en 11 millones. El coche es entre 50 y 100 veces más peligroso por kilómetro. El TCAS (sistema anticolisión), el mantenimiento predictivo con IA y los simuladores explican esta seguridad récord.</p>
            <span className={styles.faqTip}>La década 2010-2020 fue la más segura de la historia de la aviación. El mayor riesgo estadístico en un viaje aéreo es el trayecto en coche hasta el aeropuerto.</span>
          </li>
        </ul>

        {/* Sección 4 — Guía Paso a Paso */}
        <h3>5 pasos para entender la evolución aeronáutica</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Empieza por los Wright: ¿por qué 1903 y no antes?</strong>
              <p>El vuelo de 1903 no fue un accidente: fue el resultado de años de estudio sistemático de la aerodinámica de Lilienthal, el diseño de una hélice eficiente y la construcción de su propio motor ligero de 12 CV. Entender por qué el avión fue posible en 1903 es la clave de toda la historia posterior.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Comprende el papel acelerador de las guerras mundiales</strong>
              <p>Las dos guerras mundiales comprimieron 20 años de desarrollo en 4-6 años. El radar, el motor a reacción y los bombarderos estratégicos nacieron de la urgencia bélica. Sin la guerra, el jet comercial habría llegado 10-15 años más tarde. La Batalla de Inglaterra fue el primer conflicto decidido exclusivamente en el aire.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Sigue la economía del transporte aéreo</strong>
              <p>El Boeing 747 no fue solo un avión más grande: redujo el coste por asiento-kilómetro un 30%, haciendo rentable el vuelo transatlántico para la clase media. La desregulación de 1978 eliminó los cárteles de precios. Ryanair llevó el modelo al extremo. La historia de la aviación es también una historia de democratización económica.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Conecta la aviación con la geopolítica global</strong>
              <p>El control del espacio aéreo ha sido un factor estratégico desde la Primera Guerra Mundial. La Guerra Fría produjo el enfrentamiento MiG vs. F-86 Sabre sobre Corea. El 11S rediseñó la seguridad aeroportuaria global en meses. Los drones ucranianos redefinen hoy la guerra sin tripulantes. La aviación y la geopolítica son inseparables.</p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Mira el futuro con ojos críticos</strong>
              <p>El eVTOL, el hidrógeno y la IA en cabina son tecnologías reales con pruebas en marcha. Pero los obstáculos no son solo técnicos: son regulatorios (certificación EASA/FAA), de infraestructura (vertiports) y económicos (densidad energética de baterías). La historia enseña que las revoluciones tecnológicas tardan entre 10 y 20 años en escalar.</p>
            </div>
          </li>
        </ol>

        {/* Sección 5 — Tips */}
        <h3>Claves para entender la aviación moderna</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">✈️</span>
            <p>El vuelo comercial de hoy es el resultado de capas de innovación acumuladas: el ala supercrítica de los años 70, el motor de alto índice de derivación de los 80, los materiales compuestos de los 2000 y la gestión digital del vuelo de los 2010. Ninguna revolución fue de una sola pieza.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📅</span>
            <p>Los períodos de la aviación se solapan: el Concorde voló mientras nacían las aerolíneas de bajo coste. El A380 (853 pasajeros) entró en servicio cuando los drones militares ya llevaban una década redefiendo la guerra. Las eras no son limpias ni secuenciales.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🌍</span>
            <p>La aviación ha reducido la distancia psicológica entre continentes más que cualquier otro medio de transporte. Un vuelo que en 1950 tardaba 15 horas y costaba el equivalente a 3 meses de salario, hoy tarda 8 horas y puede comprarse por menos de 500€. Eso tiene consecuencias culturales, económicas y migratorias enormes.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🔗</span>
            <p>Para entender la aviación del futuro, estudia sus limitaciones actuales: la densidad energética de las baterías, las normativas de certificación aeronáutica y la infraestructura aeroportuaria. Las mayores barreras a los aviones eléctricos y al hidrógeno no son tecnológicas sino sistémicas.</p>
          </div>
        </div>

        {/* Sección 6 — Warning Box */}
        <div className={styles.warningBox}>
          <strong>Nota sobre proyecciones y datos técnicos</strong>
          <ul>
            <li>Los datos técnicos (velocidad, capacidad, consumo) son especificaciones de fabricantes y organismos como IATA/EASA. Las proyecciones de nuevos modelos son estimaciones sujetas a cambios.</li>
            <li>Las fechas de entrada en servicio de los modelos eléctricos (ES-30, Alice, ZEROe) son proyecciones de los fabricantes y pueden retrasarse significativamente.</li>
            <li>El SAF (combustible de aviación sostenible) representa menos del 0,1% del combustible consumido globalmente en 2024. Su escalada industrial sigue siendo un reto pendiente.</li>
            <li>Los taxis aéreos eVTOL (Joby, Archer) han obtenido certificaciones parciales pero su operación comercial urbana a gran escala no tiene fecha firme en Europa.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-historia-aviacion')} />
      <ShareCard appName="visualizador-historia-aviacion" />
      <Footer appName="visualizador-historia-aviacion" />
    </div>
  );
}
