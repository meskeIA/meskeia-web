'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorAdaptacionesPlantas.module.css';
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
// Tipos
// ─────────────────────────────────────────────

type TabId = 0 | 1 | 2;

interface AdaptacionHabitat {
  titulo: string;
  descripcion: string;
}

interface Habitat {
  id: number;
  nombre: string;
  icono: string;
  color: string;
  condicion: string;
  adaptaciones: AdaptacionHabitat[];
  ejemplos: string[];
}

interface Mecanismo {
  id: number;
  nombre: string;
  icono: string;
  resumen: string;
  detalle: string;
}

interface PlantaCarnivora {
  id: number;
  nombre: string;
  nombreCientifico: string;
  icono: string;
  tipoTrampa: string;
  mecanismo: string;
  digestion: string;
  distribucion: string;
  curiosidad: string;
}

// ─────────────────────────────────────────────
// Datos: hábitats
// ─────────────────────────────────────────────

const HABITATS: Habitat[] = [
  {
    id: 0,
    nombre: 'Desierto (Xerófitas)',
    icono: '🏜️',
    color: '#D4A060',
    condicion: 'Calor extremo, sequía prolongada, radiación intensa',
    adaptaciones: [
      {
        titulo: 'Raíces profundas o muy extendidas',
        descripcion:
          'Hasta 50 m de profundidad en el mezquite para alcanzar acuíferos, o raíces superficiales muy extendidas en cactus para captar cada gota de lluvia.',
      },
      {
        titulo: 'Tallos suculentos',
        descripcion:
          'Almacenan agua en tejido parenquimático de gran vacuola. El saguaro puede acumular hasta 3.000 litros tras una sola lluvia.',
      },
      {
        titulo: 'Hojas transformadas en espinas',
        descripcion:
          'Reducen drásticamente la superficie de transpiración y la pérdida de agua, a la vez que disuaden a herbívoros.',
      },
      {
        titulo: 'Fotosíntesis CAM',
        descripcion:
          'Estomas cerrados de día y abiertos de noche para fijar CO₂ en forma de ácido málico. Ahorra hasta 10× más agua que la fotosíntesis C3 convencional.',
      },
      {
        titulo: 'Cutícula cerosa gruesa',
        descripcion:
          'Capa lipídica impermeable que recubre la epidermis y minimiza la pérdida de agua por transpiración cuticular.',
      },
      {
        titulo: 'Latencia (dormancia)',
        descripcion:
          'Semillas y bulbos pueden esperar décadas en el suelo hasta que lleguen las condiciones favorables de lluvia y temperatura.',
      },
    ],
    ejemplos: [
      'Carnegiea gigantea (saguaro)',
      'Euphorbia canariensis',
      'Agave americana',
      'Welwitschia mirabilis',
    ],
  },
  {
    id: 1,
    nombre: 'Selva tropical (Higrófilas)',
    icono: '🌴',
    color: '#2D8A4E',
    condicion: 'Competencia por luz, suelos pobres, humedad muy alta',
    adaptaciones: [
      {
        titulo: 'Hojas grandes y horizontales',
        descripcion:
          'Maximizan la captación de la escasa luz que penetra el dosel, donde solo llega el 1-2% de la radiación solar total.',
      },
      {
        titulo: 'Drip tips (puntas goteantes)',
        descripcion:
          'El ápice de la hoja tiene una punta elongada que canaliza el agua de lluvia fuera de la lámina, evitando el crecimiento de hongos y algas.',
      },
      {
        titulo: 'Contrafuertes (raíces tablares)',
        descripcion:
          'Grandes extensiones de raíz lateral que dan estabilidad a árboles muy altos en suelos poco profundos y blandos.',
      },
      {
        titulo: 'Epífitas y raíces aéreas',
        descripcion:
          'Bromelias, orquídeas y helechos se instalan sobre otras plantas (sin parasitarlas) para acceder a la luz del dosel.',
      },
      {
        titulo: 'Micorrizas obligadas',
        descripcion:
          'La mayoría de las plantas de selva tienen simbiosis fúngica imprescindible para captar el fósforo y nitrógeno escasos en suelos tropicales lixiviados.',
      },
      {
        titulo: 'Alelopatía',
        descripcion:
          'Segregan compuestos químicos al suelo o al ambiente que inhiben la germinación y el crecimiento de plantas competidoras cercanas.',
      },
    ],
    ejemplos: [
      'Monstera deliciosa',
      'Ficus benjamina',
      'Tillandsia spp. (bromelia)',
      'Victoria amazonica (nenúfar gigante)',
    ],
  },
  {
    id: 2,
    nombre: 'Tundra y alta montaña (Criófilas)',
    icono: '🏔️',
    color: '#7BA7BC',
    condicion: 'Frío extremo, viento, permafrost, temporada de crecimiento muy corta',
    adaptaciones: [
      {
        titulo: 'Porte almohadillado',
        descripcion:
          'Forma hemisférica compacta que reduce el área expuesta al viento y genera un microclima interno hasta 10 °C más cálido que el exterior.',
      },
      {
        titulo: 'Pelos y pubescencia densa',
        descripcion:
          'Cubierta de finos pelos que atrapan aire caliente cerca de la epidermis, reducen la evapotranspiración y protegen contra la abrasión del viento.',
      },
      {
        titulo: 'Hojas pequeñas y coriáceas',
        descripcion:
          'Limitan la pérdida de calor por convección y son resistentes a la desecación por el viento frío y seco que sopla en las cumbres.',
      },
      {
        titulo: 'Pigmentos antocianos',
        descripcion:
          'Proporcionan protección frente a la alta radiación UV en altitud y absorben calor solar adicional, actuando como captadores de energía.',
      },
      {
        titulo: 'Biomasa subterránea dominante',
        descripcion:
          'Yemas protegidas bajo tierra (hemicriptófitas y geófitas): la mayor parte del tejido vivo sobrevive en órganos subterráneos protegidos por el suelo.',
      },
      {
        titulo: 'Crecimiento extremadamente lento',
        descripcion:
          'Algunas plantas de tundra tardan más de 100 años en alcanzar 1 cm de crecimiento; la corta temporada limita la fotosíntesis a pocas semanas al año.',
      },
    ],
    ejemplos: [
      'Dryas octopetala',
      'Leontopodium alpinum (edelweiss)',
      'Saxifraga oppositifolia',
      'Carex spp. (gramíneas de tundra)',
    ],
  },
  {
    id: 3,
    nombre: 'Medio acuático (Hidrófitas)',
    icono: '💧',
    color: '#2E86AB',
    condicion: 'Bajo O₂ para raíces, luz atenuada, flotación necesaria',
    adaptaciones: [
      {
        titulo: 'Aerénquima',
        descripcion:
          'Tejido lacunar con grandes espacios de aire intercelulares que conduce O₂ desde las hojas hasta las raíces sumergidas en fango anóxico.',
      },
      {
        titulo: 'Hojas flotantes con estomas en el haz',
        descripcion:
          'La cara superior (haz) en contacto con el aire tiene estomas; la cara inferior (envés) está impermeabilizada. Victoria amazonica soporta hasta 40 kg sobre sus hojas.',
      },
      {
        titulo: 'Hojas sumergidas filiformes',
        descripcion:
          'Finamente divididas para maximizar la superficie de contacto con el agua y facilitar el intercambio de gases y nutrientes directamente del medio.',
      },
      {
        titulo: 'Tallos huecos o esponjosos',
        descripcion:
          'Proporcionan flotabilidad y actúan como canales de conducción de gases (O₂ y CO₂) entre las partes aéreas y las sumergidas.',
      },
      {
        titulo: 'Raíces reducidas o ausentes',
        descripcion:
          'En plantas totalmente sumergidas, la absorción de agua y nutrientes ocurre por toda la superficie foliar, haciendo las raíces secundarias o innecesarias.',
      },
      {
        titulo: 'Estrategias de polinización diversas',
        descripcion:
          'Polinización acuática (hidrofilia), aérea, o mediante insectos en especies con flores emergentes; adaptadas según el grado de inmersión.',
      },
    ],
    ejemplos: [
      'Nymphaea alba (nenúfar blanco)',
      'Elodea canadensis',
      'Vallisneria spiralis',
      'Posidonia oceanica (pradera submarina)',
    ],
  },
  {
    id: 4,
    nombre: 'Marisma y suelos salinos (Halófitas)',
    icono: '🌊',
    color: '#48A9A6',
    condicion: 'Alta concentración de sal, estrés osmótico, suelos anóxicos',
    adaptaciones: [
      {
        titulo: 'Glándulas de sal',
        descripcion:
          'Estructuras especializadas en la epidermis foliar que excretan activamente el exceso de NaCl hacia el exterior, evitando la toxicidad iónica interna.',
      },
      {
        titulo: 'Suculencia como dilución',
        descripcion:
          'Almacenan agua en los tejidos para diluir internamente la concentración de sal y mantener el equilibrio osmótico celular.',
      },
      {
        titulo: 'Compartimentación vacuolar',
        descripcion:
          'Secuestran los iones de sal (Na⁺, Cl⁻) dentro de vacuolas celulares, impidiendo que entren en el citosol donde dañarían las enzimas.',
      },
      {
        titulo: 'Neumatóforos',
        descripcion:
          'Raíces aéreas que emergen verticalmente del fango anóxico para captar O₂ del aire mediante lenticelas y aerénquima. Característica de los manglares.',
      },
      {
        titulo: 'Raíces zancudas',
        descripcion:
          'Soportes en arco que dan estabilidad mecánica en sustratos blandos y activos; también capturan sedimentos y protegen la costa de la erosión.',
      },
      {
        titulo: 'Viviparidad (manglares)',
        descripcion:
          'La semilla germina dentro del fruto mientras este aún está unido a la planta madre (propágulo), asegurando que la plántula tenga un inicio ventajoso al caer al fango.',
      },
    ],
    ejemplos: [
      'Salicornia europaea (espárrago de mar)',
      'Rhizophora mangle (mangle rojo)',
      'Tamarix gallica',
      'Avicennia germinans',
    ],
  },
  {
    id: 5,
    nombre: 'Rocas y paredes (Rupícolas)',
    icono: '🪨',
    color: '#8B7355',
    condicion: 'Sustrato mínimo, sequía episódica, fuerte insolación o sombra según orientación',
    adaptaciones: [
      {
        titulo: 'Raíces exploratorias en grietas',
        descripcion:
          'Penetran las fisuras de la roca buscando agua de infiltración y los pocos minerales que se acumulan en las grietas con materia orgánica.',
      },
      {
        titulo: 'Miniaturización',
        descripcion:
          'Reducción del tamaño para ocupar los microhábitats disponibles en superficies rocosas, con menor demanda de agua y nutrientes por unidad de biomasa.',
      },
      {
        titulo: 'Rosetas basales',
        descripcion:
          'Hojas dispuestas en roseta que optimizan la captación de luz solar rasante y canalizan el agua de lluvia hacia el centro de la planta y las raíces.',
      },
      {
        titulo: 'CAM facultativo',
        descripcion:
          'Pueden alternar entre metabolismo C3 (condiciones normales) y CAM (sequía severa), proporcionando gran plasticidad fisiológica.',
      },
      {
        titulo: 'Dependencia de líquenes pioneros',
        descripcion:
          'Los líquenes crustáceos preparan el sustrato descomponiendo la roca y acumulando materia orgánica, creando el nicho que permite el establecimiento posterior.',
      },
      {
        titulo: 'Dispersión eficiente de semillas',
        descripcion:
          'Semillas con estructuras de dispersión por viento (vilanos, alas) o con ganchos para animales; pocas posibilidades de banco de semillas en sustrato duro.',
      },
    ],
    ejemplos: [
      'Saxifraga longifolia',
      'Ramonda myconi',
      'Asplenium trichomanes (helecho rupícola)',
      'Líquenes crustáceos (pioneros)',
    ],
  },
];

// ─────────────────────────────────────────────
// Datos: mecanismos adaptativos
// ─────────────────────────────────────────────

const MECANISMOS: Mecanismo[] = [
  {
    id: 0,
    nombre: 'Fotosíntesis CAM',
    icono: '🌙',
    resumen: 'Estomas abiertos de noche para ahorrar hasta 10× más agua',
    detalle:
      'Crassulacean Acid Metabolism. Los estomas se abren de noche para fijar CO₂ en forma de ácido málico (almacenado en vacuolas). De día, los estomas permanecen cerrados y el CO₂ se libera internamente para el ciclo de Calvin. Esto reduce la pérdida de agua por transpiración hasta 10 veces respecto a las plantas C3. Plantas CAM: cactus, agaves, piñas tropicales (Ananas), orquídeas epífitas.',
  },
  {
    id: 1,
    nombre: 'Fotosíntesis C4',
    icono: '☀️',
    resumen: 'CO₂ concentrado antes del ciclo de Calvin — más eficiente en calor',
    detalle:
      'Ciclo de Hatch-Slack. Hay dos tipos de células fotosintéticas: mesófilo y vaina del haz. El CO₂ se capta y concentra en las células del mesófilo antes de transferirse a la vaina del haz donde opera el ciclo de Calvin. Esto elimina la fotorrespiración, permitiendo mayor eficiencia fotosintética a temperaturas altas e insolación intensa. Plantas C4: maíz, caña de azúcar, sorgo, mijo, esparto. Suponen solo el 3% de las especies pero el 23% de la productividad fotosintética terrestre.',
  },
  {
    id: 2,
    nombre: 'Suculencia',
    icono: '💦',
    resumen: 'Almacenamiento masivo de agua en tejidos especializados',
    detalle:
      'Acumulación de agua en células de gran vacuola en hojas (áloe vera), tallos (cactus) o raíces (yuca). El tejido parenquimático de almacenamiento puede suponer el 95% del volumen total de la planta. Funciona como reserva osmótica que se libera progresivamente durante los períodos de sequía. La presión de turgencia del tejido da soporte estructural al tallo, sustituyendo al tejido leñoso en muchas especies.',
  },
  {
    id: 3,
    nombre: 'Órganos de reserva subterráneos',
    icono: '🥔',
    resumen: 'Bulbos, cormos, rizomas y tubérculos para sobrevivir estaciones adversas',
    detalle:
      'Bulbos (cebolla, tulipán: catáfilos carnosos que envuelven una yema), cormos (gladiolo: tallo engrosado verticalmente), rizomas (lirio, jengibre: tallo horizontal subterráneo con nudos y entrenudos), tubérculos (patata: engrosamiento de un estolón). Permiten a la planta sobrevivir inviernos, sequías o fuegos, y rebrotar rápidamente cuando las condiciones mejoran aprovechando las reservas almacenadas.',
  },
  {
    id: 4,
    nombre: 'Neumatóforos',
    icono: '🌬️',
    resumen: 'Raíces respiratorias que emergen del fango para captar O₂',
    detalle:
      'Raíces especializadas que crecen en dirección opuesta a la gravedad (negativamente geotropas) y emergen del sustrato anóxico. Tienen lenticelas (poros en la corteza) y aerénquima interior que permite el intercambio de gases cuando están expuestos al aire. El O₂ difunde hacia las raíces sumergidas a través de este sistema. Los neumatóforos del mangle negro (Avicennia) pueden alcanzar 1 m de altura y formar densas alfombras alrededor de los árboles.',
  },
  {
    id: 5,
    nombre: 'Hojas esclerófilas',
    icono: '🍃',
    resumen: 'Hojas duras, coriáceas y persistentes del bioma mediterráneo',
    detalle:
      'Del griego skleros (duro) y phyllon (hoja). Cutícula gruesa, epidermis con células de pared engrosada, estomas hundidos en criptas o recubiertos de pelos, y haz vascular con fibras de esclerénquima reforzado. Características del bioma mediterráneo con sequía estival pronunciada. Ejemplos: encina (Quercus ilex), alcornoque (Q. suber), acebuche (Olea europaea var. sylvestris), lentisco (Pistacia lentiscus). Aguantan el verano seco sin caer, a diferencia de las hojas caducas.',
  },
  {
    id: 6,
    nombre: 'Micorrizas',
    icono: '🍄',
    resumen: 'Simbiosis raíz-hongo: la "Wood Wide Web" de los bosques',
    detalle:
      'Simbiosis entre raíces vegetales y hongos del suelo (principalmente Basidiomycota y Glomeromycota). El hongo extiende kilómetros de hifas que absorben fósforo, nitrógeno y agua del suelo; la planta aporta azúcares fotosintéticos al hongo. El 90% de las plantas terrestres dependen de micorrizas. En bosques maduros, los micecios interconectan cientos de árboles de distintas especies formando la llamada "Wood Wide Web": los árboles madre transfieren recursos (azúcares, agua) a plántulas sombreadas o dañadas a través de estas redes.',
  },
  {
    id: 7,
    nombre: 'Plantas carnívoras',
    icono: '🪤',
    resumen: 'Obtienen nitrógeno digiriendo insectos — ver Tab 3 para detalle',
    detalle:
      'En suelos muy pobres en nitrógeno (turberas ácidas, rocas, arenales), algunas plantas obtienen el N que les falta digiriendo insectos y pequeños animales. La carnivoria vegetal ha evolucionado de forma independiente al menos 12 veces en la historia evolutiva. Requiere órganos especializados para atraer, atrapar y digerir presas, así como enzimas proteolíticas propias. Las cinco estrategias de trampa principales se exploran en el Tab 3 de este visualizador.',
  },
];

// ─────────────────────────────────────────────
// Datos: plantas carnívoras
// ─────────────────────────────────────────────

const CARNIVORAS: PlantaCarnivora[] = [
  {
    id: 0,
    nombre: 'Venus atrapamoscas',
    nombreCientifico: 'Dionaea muscipula',
    icono: '🪤',
    tipoTrampa: 'Activa de cierre rápido (cinotrap)',
    mecanismo:
      'Dos lóbulos foliares con pelos trigger en su interior. Cuando un insecto toca dos pelos distintos en menos de 20 segundos, se genera un potencial de acción eléctrico que provoca el cambio de curvatura de las células de la bisagra → la trampa se cierra en menos de 100 milisegundos.',
    digestion: 'Enzimas proteolíticas segregadas por glándulas internas. El proceso dura entre 5 y 12 días.',
    distribucion:
      'Endémica de turberas ácidas con bajo nitrógeno en las Carolinas (sudeste de EEUU). Está en peligro de extinción en estado silvestre por la colecta ilegal.',
    curiosidad:
      'Cada trampa individual solo puede cerrarse correctamente entre 3 y 4 veces antes de agotarse y morir. La planta completa puede vivir más de 20 años.',
  },
  {
    id: 1,
    nombre: 'Drosera (rocío del sol)',
    nombreCientifico: 'Drosera spp.',
    icono: '☀️',
    tipoTrampa: 'Adhesiva pasiva (flypaper)',
    mecanismo:
      'Pelos glandulares (tentáculos) con una gota brillante de mucílago pegajoso en la punta. El insecto queda atrapado al contactar, y los tentáculos adyacentes se curvan lentamente (en horas) hacia la presa para aumentar el contacto con las glándulas digestivas.',
    digestion: 'Enzimas proteolíticas y esterasas secretadas directamente en la mucosidad de los tentáculos.',
    distribucion:
      'Más de 200 especies en todos los continentes excepto la Antártida. Especialmente abundantes en turberas de Europa, Australia y Sudamérica. Varias especies nativas en la Península Ibérica.',
    curiosidad:
      'Algunas especies de Drosera pueden capturar presas de mayor tamaño, como pequeñas ranas o lagartos. La mucosidad es química y físicamente muy difícil de evitar para insectos.',
  },
  {
    id: 2,
    nombre: 'Nepenthes (jarra tropical)',
    nombreCientifico: 'Nepenthes spp.',
    icono: '🫙',
    tipoTrampa: 'Trampa de caída (pitfall)',
    mecanismo:
      'La punta de la hoja se transforma en una copa o jarra con líquido digestivo. Insectos atraídos por néctar o coloración resbalan en el borde encerado (peristoma) y caen al interior. El líquido contiene enzimas propias y, en algunas especies, también bacterias y protozoos que ayudan a la digestión.',
    digestion:
      '1-2 semanas. Algunas especies grandes (N. rajah, N. lowii) pueden capturar ranas, roedores pequeños e incluso ocasionalmente aves.',
    distribucion:
      'Trópicos de Asia: principalmente Borneo, Sumatra, Filipinas y las Islas Malucas. Una especie en Madagascar y Sri Lanka.',
    curiosidad:
      'Algunas especies tienen simbiosis mutualista con murciélagos (Kerivoula hardwickii) que duermen dentro de la jarra y depositan heces ricas en nitrógeno, beneficiando a la planta sin ser digeridos.',
  },
  {
    id: 3,
    nombre: 'Pinguicula (grasilla)',
    nombreCientifico: 'Pinguicula spp.',
    icono: '🌸',
    tipoTrampa: 'Adhesiva pasiva tipo roseta',
    mecanismo:
      'Hoja plana recubierta de dos tipos de glándulas: pediceladas (segregan mucílago adhesivo y enzimas digestivas) y sésiles (absorben los nutrientes digeridos). Los insectos pequeños, esporas y partículas de materia orgánica quedan atrapados directamente. No hay movimiento activo de la hoja.',
    digestion:
      'Enzimas proteolíticas y esterasas segregadas directamente sobre la superficie foliar. Absorción directa por las glándulas sésiles.',
    distribucion:
      'Europa (incluyendo Picos de Europa, Pirineos y Sierra Nevada en España), América Central, América del Norte y Asia. Más de 100 especies.',
    curiosidad:
      'Es una de las carnívoras más fáciles de cultivar en interior. Algunas personas las usan como trampa natural contra mosquitos y moscas pequeñas en casa.',
  },
  {
    id: 4,
    nombre: 'Utricularia (oreja de ratón)',
    nombreCientifico: 'Utricularia spp.',
    icono: '💨',
    tipoTrampa: 'Succión activa subacuática (suction trap)',
    mecanismo:
      'Pequeñas vejigas (utriculos) con una válvula sellada. El interior se mantiene a presión negativa mediante bombas de iones. Cuando un organismo acuático toca los pelos trigger de la válvula → la válvula se abre → el agua y la presa son succionadas al interior en menos de 1 milisegundo. Es la trampa de movimiento más rápido de todo el reino vegetal.',
    digestion:
      'Dentro del utrículo mediante enzimas propias. Una vez digerido el contenido, la trampa se vuelve a preparar. El proceso completo tarda entre 15 minutos y varias horas.',
    distribucion:
      'Cosmopolita: encontrada en todos los continentes excepto la Antártida. Unas 250 especies tanto acuáticas como terrestres (en suelos húmedos).',
    curiosidad:
      'Utricularia gibba puede capturar larvas de mosquito, pequeños crustáceos (copépodos, dafnias) e incluso protozoos. A pesar de carecer de raíces verdaderas, es una de las plantas con mayor tasa de crecimiento relativo.',
  },
];

// ─────────────────────────────────────────────
// Subcomponente: tarjeta de hábitat
// ─────────────────────────────────────────────

interface TarjetaHabitatProps {
  habitat: Habitat;
  seleccionado: boolean;
  onSeleccionar: () => void;
}

function TarjetaHabitat({ habitat, seleccionado, onSeleccionar }: TarjetaHabitatProps) {
  return (
    <button
      className={`${styles.habitatCard} ${seleccionado ? styles.habitatCardActivo : ''}`}
      style={seleccionado ? { borderColor: habitat.color, background: `${habitat.color}15` } : {}}
      onClick={onSeleccionar}
      aria-expanded={seleccionado}
      aria-label={`Ver adaptaciones de ${habitat.nombre}`}
    >
      <span className={styles.habitatIcono} aria-hidden="true">{habitat.icono}</span>
      <span className={styles.habitatNombre}>{habitat.nombre}</span>
      <span
        className={styles.habitatIndicador}
        style={{ background: habitat.color }}
        aria-hidden="true"
      />
    </button>
  );
}

// ─────────────────────────────────────────────
// Tab 1: Por hábitat
// ─────────────────────────────────────────────

function TabHabitats() {
  const [habitatSeleccionado, setHabitatSeleccionado] = useState<number | null>(null);

  const habitat = habitatSeleccionado !== null ? HABITATS[habitatSeleccionado] : null;

  function toggleHabitat(id: number) {
    setHabitatSeleccionado((prev) => (prev === id ? null : id));
  }

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Adaptaciones por hábitat</h2>
      <p className={styles.sectionDesc}>
        Selecciona un hábitat para explorar las adaptaciones específicas de sus plantas.
      </p>

      <div className={styles.habitatsGrid}>
        {HABITATS.map((h) => (
          <TarjetaHabitat
            key={h.id}
            habitat={h}
            seleccionado={habitatSeleccionado === h.id}
            onSeleccionar={() => toggleHabitat(h.id)}
          />
        ))}
      </div>

      {habitat && (
        <div
          className={styles.habitatPanel}
          style={{ borderLeftColor: habitat.color }}
          role="region"
          aria-label={`Detalle del hábitat ${habitat.nombre}`}
        >
          <div className={styles.habitatPanelHeader} style={{ background: `${habitat.color}20` }}>
            <span className={styles.habitatPanelIcono} aria-hidden="true">{habitat.icono}</span>
            <div>
              <h3 className={styles.habitatPanelTitulo}>{habitat.nombre}</h3>
              <p className={styles.habitatPanelCondicion}>
                <strong>Condición:</strong> {habitat.condicion}
              </p>
            </div>
          </div>

          <div className={styles.adaptacionesLista}>
            {habitat.adaptaciones.map((adaptacion, i) => (
              <div key={i} className={styles.adaptacionItem}>
                <h4 className={styles.adaptacionTitulo} style={{ color: habitat.color }}>
                  {adaptacion.titulo}
                </h4>
                <p className={styles.adaptacionDesc}>{adaptacion.descripcion}</p>
              </div>
            ))}
          </div>

          <div className={styles.ejemplosZona}>
            <h4 className={styles.ejemplosTitulo}>Ejemplos representativos</h4>
            <ul className={styles.ejemplosList}>
              {habitat.ejemplos.map((ej, i) => (
                <li key={i} className={styles.ejemplosItem}>
                  <span className={styles.ejemplosBullet} style={{ background: habitat.color }} aria-hidden="true" />
                  <em>{ej}</em>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {habitatSeleccionado === null && (
        <p className={styles.seleccionHint} role="status">
          Haz clic en un hábitat para ver sus adaptaciones específicas.
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 2: Mecanismos adaptativos
// ─────────────────────────────────────────────

function TabMecanismos() {
  const [expandido, setExpandido] = useState<number | null>(null);

  function toggleMecanismo(id: number) {
    setExpandido((prev) => (prev === id ? null : id));
  }

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Mecanismos adaptativos</h2>
      <p className={styles.sectionDesc}>
        8 estrategias clave que las plantas han desarrollado para sobrevivir en condiciones extremas.
      </p>

      <div className={styles.mecanismosGrid}>
        {MECANISMOS.map((mec) => (
          <div key={mec.id} className={styles.mecanismoCardWrapper}>
            <button
              className={`${styles.mecanismoCard} ${expandido === mec.id ? styles.mecanismoCardActivo : ''}`}
              onClick={() => toggleMecanismo(mec.id)}
              aria-expanded={expandido === mec.id}
              aria-label={`${expandido === mec.id ? 'Ocultar' : 'Ver'} detalle de ${mec.nombre}`}
            >
              <span className={styles.mecanismoIcono} aria-hidden="true">{mec.icono}</span>
              <div className={styles.mecanismoTexto}>
                <span className={styles.mecanismoNombre}>{mec.nombre}</span>
                <span className={styles.mecanismoResumen}>{mec.resumen}</span>
              </div>
              <span className={styles.mecanismoChevron} aria-hidden="true">
                {expandido === mec.id ? '▲' : '▼'}
              </span>
            </button>

            {expandido === mec.id && (
              <div className={styles.mecanismoDetalle} role="region" aria-label={`Detalle: ${mec.nombre}`}>
                <p className={styles.mecanismoDetalleTexto}>{mec.detalle}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Tab 3: Plantas carnívoras
// ─────────────────────────────────────────────

function TabCarnivoras() {
  const [expandida, setExpandida] = useState<number | null>(0);

  function toggleCarnivora(id: number) {
    setExpandida((prev) => (prev === id ? null : id));
  }

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Plantas carnívoras</h2>
      <p className={styles.sectionDesc}>
        Cuando el suelo no tiene nitrógeno suficiente, algunas plantas lo obtienen digiriendo insectos.
        La carnivoria vegetal ha evolucionado de forma independiente al menos 12 veces.
      </p>

      <div className={styles.carnivorasLista}>
        {CARNIVORAS.map((planta) => (
          <div key={planta.id} className={styles.carnivoraItem}>
            <button
              className={`${styles.carnivoraHeader} ${expandida === planta.id ? styles.carnivoraHeaderActivo : ''}`}
              onClick={() => toggleCarnivora(planta.id)}
              aria-expanded={expandida === planta.id}
              aria-label={`${expandida === planta.id ? 'Ocultar' : 'Ver'} detalles de ${planta.nombre}`}
            >
              <span className={styles.carnivoraIcono} aria-hidden="true">{planta.icono}</span>
              <div className={styles.carnivoraTitulos}>
                <span className={styles.carnivoraNombre}>{planta.nombre}</span>
                <span className={styles.carnivoraCientifico}>{planta.nombreCientifico}</span>
              </div>
              <span className={styles.carnivoraTrampa}>{planta.tipoTrampa}</span>
              <span className={styles.carnivoraChevron} aria-hidden="true">
                {expandida === planta.id ? '▲' : '▼'}
              </span>
            </button>

            {expandida === planta.id && (
              <div className={styles.carnivoraDetalle} role="region" aria-label={`Detalle: ${planta.nombre}`}>
                <div className={styles.carnivoraGrid}>
                  <div className={styles.carnivoraFila}>
                    <span className={styles.carnivoraEtiqueta}>Mecanismo de trampa</span>
                    <p className={styles.carnivoraValor}>{planta.mecanismo}</p>
                  </div>
                  <div className={styles.carnivoraFila}>
                    <span className={styles.carnivoraEtiqueta}>Digestión</span>
                    <p className={styles.carnivoraValor}>{planta.digestion}</p>
                  </div>
                  <div className={styles.carnivoraFila}>
                    <span className={styles.carnivoraEtiqueta}>Distribución</span>
                    <p className={styles.carnivoraValor}>{planta.distribucion}</p>
                  </div>
                  <div className={`${styles.carnivoraFila} ${styles.carnivoraCuriosidad}`}>
                    <span className={styles.carnivoraEtiqueta}>💡 Curiosidad</span>
                    <p className={styles.carnivoraValor}>{planta.curiosidad}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorAdaptacionesPlantas() {
  const [tabActiva, setTabActiva] = useState<TabId>(0);

  const tabs: { id: TabId; label: string }[] = [
    { id: 0, label: 'Por hábitat' },
    { id: 1, label: 'Mecanismos adaptativos' },
    { id: 2, label: 'Plantas carnívoras' },
  ];

  return (
    <div className={styles.container}>

      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>Ingeniería Vegetal</h1>
        <p className={styles.heroSubtitle}>
          Cómo las plantas conquistan cada hábitat — 6 entornos extremos, 8 mecanismos adaptativos
          y sección especial de plantas carnívoras
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        <nav className={styles.tabNav} role="tablist" aria-label="Secciones del visualizador de adaptaciones">
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
          {tabActiva === 0 && <TabHabitats />}
          {tabActiva === 1 && <TabMecanismos />}
          {tabActiva === 2 && <TabCarnivoras />}
        </div>
      </main>

      <EducationalSection
        title="Adaptaciones vegetales: claves para entenderlas"
        subtitle="De la fotosíntesis CAM a las plantas carnívoras — fisiología vegetal aplicada a los ecosistemas"
      >
        {/* Introducción */}
        <p className={styles.eduIntro}>
          Las plantas son maestras de la ingeniería adaptativa. En 470 millones de años de
          evolución terrestre han desarrollado soluciones para sobrevivir en prácticamente
          cualquier hábitat del planeta, desde los desiertos más secos hasta las aguas más
          profundas. Sus adaptaciones no son simples trucos: son sistemas complejos que integran
          fisiología, morfología y comportamiento.
        </p>

        {/* Tabla comparativa */}
        <h3 className={styles.eduSubtitulo}>Comparativa rápida: datos clave</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Característica</th>
                <th>Valor de referencia</th>
                <th>Detalle</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  caracteristica: 'Pérdida de agua',
                  valor: 'CAM vs C3',
                  detalle: 'Las plantas CAM pierden hasta 10× menos agua que las C3 al hacer la fotosíntesis de noche',
                },
                {
                  caracteristica: 'Eficiencia fotosintética',
                  valor: 'C4 > C3',
                  detalle: 'Las plantas C4 concentran CO₂ antes del ciclo de Calvin: más eficientes en calor e insolación alta',
                },
                {
                  caracteristica: 'Simbiosis más extendida',
                  valor: 'Micorriza',
                  detalle: 'El 90% de las plantas tienen micorrizas; sin ellas, los bosques actuales no existirían',
                },
                {
                  caracteristica: 'Trampa más rápida',
                  valor: 'Utricularia',
                  detalle: 'Succión en menos de 1 milisegundo: más rápido que un parpadeo humano (150 ms)',
                },
                {
                  caracteristica: 'Almacenamiento de agua',
                  valor: 'Cactus saguaro',
                  detalle: 'Puede almacenar hasta 3.000 litros tras una sola lluvia',
                },
                {
                  caracteristica: 'Tolerancia a la sal',
                  valor: 'Salicornia',
                  detalle: 'Crece en salmueras con hasta 10 veces la concentración de sal del mar',
                },
              ].map((fila, i) => (
                <tr key={i}>
                  <td><strong>{fila.caracteristica}</strong></td>
                  <td><span className={styles.valorBadge}>{fila.valor}</span></td>
                  <td>{fila.detalle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Escenarios de uso */}
        <h3 className={styles.eduSubtitulo}>¿Quién puede usar este visualizador?</h3>
        <div className={styles.escenariosGrid}>
          {[
            {
              titulo: 'Estudiante de Biología',
              descripcion:
                'Comprende las estrategias adaptativas que se preguntan en exámenes: CAM, C4, xerofitia, halofitia y adaptaciones morfológicas. Cada mecanismo explicado desde la fisiología.',
              icono: '📚',
            },
            {
              titulo: 'Amante de las plantas carnívoras',
              descripcion:
                'Los 5 géneros principales con su mecanismo de trampa, ecología y distribución. Incluye curiosidades sobre las interacciones más sorprendentes.',
              icono: '🪤',
            },
            {
              titulo: 'Ecólogo o naturalista',
              descripcion:
                'Entiende por qué cada bioma tiene una flora característica y cómo las adaptaciones reflejan la presión selectiva del entorno.',
              icono: '🌿',
            },
            {
              titulo: 'Jardinero o aficionado',
              descripcion:
                'Aprende de dónde vienen tus plantas y qué condiciones necesitan realmente: el cactus tiene fotosíntesis CAM, la orquídea es epífita, el ficus viene de la selva.',
              icono: '🏡',
            },
          ].map((escenario, i) => (
            <div key={i} className={styles.escenarioCard}>
              <span className={styles.escenarioIcono} aria-hidden="true">{escenario.icono}</span>
              <h4 className={styles.escenarioTitulo}>{escenario.titulo}</h4>
              <p className={styles.escenarioDesc}>{escenario.descripcion}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <h3 className={styles.eduSubtitulo}>Preguntas frecuentes</h3>
        <div className={styles.faqLista}>
          {[
            {
              pregunta: '¿Qué diferencia hay entre C3, C4 y CAM?',
              respuesta:
                'Son tres formas de fijar el CO₂ en la fotosíntesis. C3 es la más antigua y común (trigo, patata, la mayoría de árboles). C4 concentra el CO₂ antes del ciclo de Calvin y es más eficiente en calor e insolación alta (maíz, caña de azúcar). CAM fija el CO₂ de noche para ahorrar agua (cactus, agaves, piñas). La evolución de C4 y CAM son respuestas independientes al estrés hídrico y térmico que han surgido en linajes muy distintos.',
            },
            {
              pregunta: '¿Por qué las plantas carnívoras no digieren sus propias hojas?',
              respuesta:
                'Sus enzimas digestivas solo se activan al detectar compuestos específicos de los insectos (quitina, proteínas animales). La hoja tiene además una capa de mucílago protector en su superficie interna que evita la autodigestión del tejido vegetal.',
            },
            {
              pregunta: '¿Las plantas carnívoras pueden vivir sin insectos?',
              respuesta:
                'Sí, pero crecen mucho más lentamente y son menos robustas. En sus hábitats naturales (turberas pobres en nitrógeno), los insectos son su principal fuente de ese elemento; sin ellos obtienen el mínimo del suelo, que suele ser insuficiente para un desarrollo óptimo.',
            },
            {
              pregunta: '¿Qué es exactamente la "Wood Wide Web"?',
              respuesta:
                'El término divulgativo para describir las redes de micorrizas que conectan árboles del bosque entre sí. Estudios publicados han demostrado que los árboles intercambian azúcares, agua y señales químicas a través de estas redes fúngicas. Los llamados "árboles madre" pueden enviar recursos a plántulas sombreadas o árbol dañados cercanos.',
            },
            {
              pregunta: '¿Puede una planta cambiar su tipo de fotosíntesis?',
              respuesta:
                'Algunas plantas son "CAM facultativas": bajo condiciones normales de humedad usan el metabolismo C3, pero bajo sequía severa cambian a CAM. Esto se ha documentado en Mesembryanthemum crystallinum y en algunos agaves. Esta plasticidad fisiológica les da gran ventaja en climas variables.',
            },
          ].map((item, i) => (
            <details key={i} className={styles.faqItem}>
              <summary className={styles.faqPregunta}>{item.pregunta}</summary>
              <p className={styles.faqRespuesta}>{item.respuesta}</p>
            </details>
          ))}
        </div>

        {/* Pasos para identificar adaptaciones */}
        <h3 className={styles.eduSubtitulo}>Cómo identificar adaptaciones en campo</h3>
        <ol className={styles.pasosList}>
          {[
            {
              titulo: 'Observa el entorno',
              descripcion:
                '¿Dónde crece la planta? Desierto, selva, agua, rocas… El hábitat es la primera pista sobre sus adaptaciones.',
            },
            {
              titulo: 'Mira las hojas',
              descripcion:
                'Grandes y finas = selva umbría. Pequeñas y coriáceas = mediterráneo seco. Suculentas = escasez de agua. Transformadas en espinas = desierto extremo.',
            },
            {
              titulo: 'Fíjate en las raíces',
              descripcion:
                'Superficiales y extendidas = lluvia escasa. Profundas = acuífero lejano. Aéreas o tabulares = suelo pobre o anóxico. Reducidas = vida en agua.',
            },
            {
              titulo: 'Pregunta por la floración',
              descripcion:
                'Las plantas de desierto suelen florecer solo cuando llueve. Las alpinas, en pocas semanas de verano. Las acuáticas tienen estrategias muy variadas de polinización.',
            },
            {
              titulo: 'Busca las simbiosis',
              descripcion:
                'Casi ninguna planta es totalmente independiente. Micorrizas, bacterias fijadoras de N₂ (leguminosas), polinizadores específicos y dispersores de semillas son parte del sistema.',
            },
          ].map((paso, i) => (
            <li key={i} className={styles.pasosItem}>
              <strong className={styles.pasosTitulo}>{paso.titulo}</strong>
              <span className={styles.pasosDesc}> — {paso.descripcion}</span>
            </li>
          ))}
        </ol>

        {/* Tips */}
        <h3 className={styles.eduSubtitulo}>Datos sorprendentes</h3>
        <ul className={styles.tipsList}>
          {[
            'El 23% de la productividad fotosintética terrestre la realizan plantas C4, aunque solo representan el 3% de las especies',
            'La Welwitschia mirabilis del desierto de Namib puede vivir más de 1.500 años y solo produce 2 hojas durante toda su vida',
            'Las raíces del mezquite (Prosopis) han sido registradas a 53 metros de profundidad en busca de agua subterránea',
            'Algunas especies de Nepenthes rajah tienen una relación mutualista con musarañas que defecan dentro de la jarra: nutrientes a cambio de refugio',
          ].map((tip, i) => (
            <li key={i} className={styles.tipsItem}>
              <span className={styles.tipsBullet} aria-hidden="true">🌱</span>
              {tip}
            </li>
          ))}
        </ul>

        {/* Errores frecuentes */}
        <h3 className={styles.eduSubtitulo}>Errores frecuentes al estudiar adaptaciones</h3>
        <div className={styles.erroresList}>
          {[
            'Creer que todas las plantas de desierto son suculentas: muchas tienen hojas efímeras que solo duran mientras hay agua, o son directamente caducifolias',
            'Confundir adaptación con aclimatación: la adaptación es genética y tarda generaciones; la aclimatación es la respuesta fisiológica individual a corto plazo',
            'Pensar que las plantas carnívoras son exóticas sin presencia local: hay varias especies nativas de Europa, incluyendo España (Pinguicula, Drosera)',
            'Asumir que las micorrizas son parásitas: son simbiosis mutualistas donde ambos organismos, planta y hongo, se benefician de forma significativa',
          ].map((error, i) => (
            <div key={i} className={styles.errorItem}>
              <span className={styles.errorIcono} aria-hidden="true">⚠️</span>
              <p className={styles.errorTexto}>{error}</p>
            </div>
          ))}
        </div>

        {/* Aviso v2.0 (warningBox) */}
        <div className={styles.warningBox}>
          <strong>Nota editorial:</strong> Los datos de este visualizador tienen fines
          divulgativos y educativos. Los límites cuantitativos (metros de raíz, litros almacenados,
          velocidades de trampa) son valores de referencia documentados en literatura científica;
          pueden variar según la especie, el individuo y las condiciones ambientales.
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-adaptaciones-plantas')} />
      <ShareCard appName="visualizador-adaptaciones-plantas" />
      <Footer appName="visualizador-adaptaciones-plantas" />
    </div>
  );
}
