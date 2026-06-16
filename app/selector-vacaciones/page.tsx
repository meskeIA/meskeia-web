'use client';

import React, { useState } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import DisclaimerCard from '@/components/DisclaimerCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import styles from './SelectorVacaciones.module.css';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type RecomendacionKey = 'playa' | 'montana' | 'ciudad' | 'aventura' | 'organizado';

interface OpcionPregunta {
  texto: string;
  pesos: Partial<Record<RecomendacionKey, number>>;
}

interface Pregunta {
  id: number;
  texto: string;
  opciones: OpcionPregunta[];
}

interface Recomendacion {
  key: RecomendacionKey;
  emoji: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  ventajas: string[];
  consejos: string[];
}

// ─────────────────────────────────────────────
// Datos: ejemplos de destino por tipo y presupuesto
// ─────────────────────────────────────────────

interface EjemploDestino {
  destino: string;
  descripcion: string;
  coste: string;
}

type PresupuestoIdx = 0 | 1 | 2 | 3;

const PRESUPUESTO_LABELS: Record<PresupuestoIdx, string> = {
  0: 'Hasta 500 €',
  1: '500 – 1.000 €',
  2: '1.000 – 2.000 €',
  3: 'Más de 2.000 €',
};

const EJEMPLOS_DESTINO: Record<RecomendacionKey, Record<PresupuestoIdx, EjemploDestino[]>> = {
  playa: {
    0: [
      { destino: 'Costa de Almería — Cabo de Gata', descripcion: 'Playas vírgenes del Parque Natural. Camping o apartamento compartido.', coste: '300–450 €/persona · 1 semana' },
      { destino: 'Ría de Arousa (Galicia)', descripcion: 'Costa gallega tranquila. Alojamiento rural económico cerca del mar.', coste: '350–490 €/persona · 1 semana' },
    ],
    1: [
      { destino: 'Costa Dorada — Salou o Cambrils', descripcion: 'Vuelo + apartamento turístico. Buena relación calidad-precio en julio-agosto.', coste: '650–900 €/persona · 1 semana' },
      { destino: 'Algarve (Portugal)', descripcion: 'Vuelo low-cost y alojamiento asequible. Playas de acantilado espectaculares.', coste: '700–1.000 €/persona · 1 semana' },
    ],
    2: [
      { destino: 'Mallorca — Puerto de Pollença', descripcion: 'Hotel 4★ frente al mar, vuelo directo y coche de alquiler para explorar.', coste: '1.200–1.700 €/persona · 10 días' },
      { destino: 'Canarias — Fuerteventura', descripcion: 'Resort o apartamento en Corralejo. Playas interminables y viento para deportes.', coste: '1.100–1.600 €/persona · 10 días' },
    ],
    3: [
      { destino: 'Maldivas — villa sobre el agua', descripcion: 'Resort premium con overwater bungalow. Snorkel, buceo y desconexión total.', coste: '3.500–6.000 €/persona · 10 días' },
      { destino: 'Caribe — República Dominicana', descripcion: 'Todo incluido en resort premium o villa privada en Punta Cana.', coste: '2.200–3.500 €/persona · 10–14 días' },
    ],
  },
  montana: {
    0: [
      { destino: 'Pirineos Aragoneses — Benasque', descripcion: 'Albergue o camping. Senderismo gratuito en el Parque Posets-Maladeta.', coste: '280–430 €/persona · 5–7 días' },
      { destino: 'Sierra de Gredos (Ávila)', descripcion: 'Casa rural económica. Rutas accesibles a La Mira o Los Galayos.', coste: '250–400 €/persona · fin de semana largo' },
    ],
    1: [
      { destino: 'Dolomitas (Italia) — intro', descripcion: 'Vuelo low-cost + casa rural en Val Gardena. Ferrata y senderismo para todos.', coste: '700–1.000 €/persona · 1 semana' },
      { destino: 'Picos de Europa + Costa Cantábrica', descripcion: 'Combinación de alta montaña y playa del norte. Hotel rural o Airbnb.', coste: '650–950 €/persona · 8 días' },
    ],
    2: [
      { destino: 'Dolomitas completo — Alta Via', descripcion: 'Hotel de montaña 4★ y rutas de senderismo de alta gama con guía.', coste: '1.300–1.800 €/persona · 10 días' },
      { destino: 'Noruega — Ruta de los Fiordos', descripcion: 'Vuelo + tren Bergen + barco Flåm. Cabañas con vistas al fiordo.', coste: '1.500–2.000 €/persona · 9 días' },
    ],
    3: [
      { destino: 'Patagonia — Torres del Paine', descripcion: 'Vuelo intercontinental + trekking guiado premium + lodges en el parque.', coste: '3.000–5.000 €/persona · 16–20 días' },
      { destino: 'Nepal — Everest Base Camp', descripcion: 'Vuelo a Katmandú + trek de 14 días con guía y portador. Lodges en ruta.', coste: '2.500–3.800 €/persona · 18–22 días' },
    ],
  },
  ciudad: {
    0: [
      { destino: 'Lisboa o Oporto (Portugal)', descripcion: 'Tren o bus desde España + Airbnb económico. Gastronomía barata y de calidad.', coste: '300–470 €/persona · 4–5 días' },
      { destino: 'Praga o Cracovia', descripcion: 'Vuelo low-cost + hostel céntrico. Cerveza barata, museos y arquitectura medieval.', coste: '360–500 €/persona · 4–5 días' },
    ],
    1: [
      { destino: 'Roma + Florencia', descripcion: 'Vuelo directo + hotel bien ubicado. Coliseo, Uffizi, Vaticano y gastronomía italiana.', coste: '700–1.000 €/persona · 6 días' },
      { destino: 'Ámsterdam + Brujas', descripcion: 'Vuelo + hotel 3★ + Eurail de fin de semana. Canales, museos y mercados.', coste: '650–950 €/persona · 5 días' },
    ],
    2: [
      { destino: 'Londres + Edimburgo', descripcion: 'Vuelo + hotel 4★ + museos premium. Excursión opcional a los Highlands escoceses.', coste: '1.400–1.900 €/persona · 8–10 días' },
      { destino: 'Tokio (Japón) — primera vez', descripcion: 'Vuelo directo + hotel en Shinjuku + JR Pass. Cultura radicalmente diferente.', coste: '1.600–2.100 €/persona · 10 días' },
    ],
    3: [
      { destino: 'Japón completo — Tokio › Kioto › Osaka › Hiroshima', descripcion: 'JR Pass nacional + hoteles ryokan y occidentales + guía privado.', coste: '3.000–4.800 €/persona · 14–16 días' },
      { destino: 'Nueva York + Washington D.C.', descripcion: 'Vuelo premium economy + hotel boutique en Manhattan. Museos gratuitos en D.C.', coste: '2.600–4.000 €/persona · 10–12 días' },
    ],
  },
  aventura: {
    0: [
      { destino: 'Montanejos + Maestrazgo (Castellón)', descripcion: 'Barranquismo accesible, senderismo y piscinas naturales. Coche compartido.', coste: '200–370 €/persona · fin de semana largo' },
      { destino: 'Marruecos mochilero — Fez y Merzouga', descripcion: 'Ferry Algeciras–Tánger + autobuses locales + riads económicos. Auténtico.', coste: '450–700 €/persona · 10 días' },
    ],
    1: [
      { destino: 'Islandia mochilera en furgoneta', descripcion: 'Vuelo + van compartida + camping. Auroras, géiseres y glaciares.', coste: '850–1.200 €/persona · 10 días' },
      { destino: 'Costa Rica — volcanes y selva', descripcion: 'Vuelo en oferta + albergues. Arenal, Monteverde y Playa Manuel Antonio.', coste: '900–1.300 €/persona · 14 días' },
    ],
    2: [
      { destino: 'Islandia — Ring Road completa', descripcion: 'Vuelo + autocaravana confortable + la vuelta completa a la isla.', coste: '1.600–2.200 €/persona · 12–14 días' },
      { destino: 'Sudáfrica — Safari Kruger + Ciudad del Cabo', descripcion: 'Vuelo + safari guiado + hotel boutique en Cape Town y el Cabo de Buena Esperanza.', coste: '1.700–2.300 €/persona · 12 días' },
    ],
    3: [
      { destino: 'Kilimanjaro + Zanzíbar (Tanzania)', descripcion: 'Ascensión guiada de 7 días al Kilimanjaro + descanso en la isla spice.', coste: '3.200–4.800 €/persona · 16 días' },
      { destino: 'Patagonia mochilera — W Trek en Torres del Paine', descripcion: 'Vuelo a Punta Arenas + trek autogestionado con refugios + glaciar Perito Moreno.', coste: '2.800–4.000 €/persona · 18–22 días' },
    ],
  },
  organizado: {
    0: [
      { destino: 'Circuito Andalucía — Sevilla, Córdoba y Granada', descripcion: 'Autocar con guía hispanohablante. Hotel céntrico y desayunos incluidos.', coste: '490–700 €/persona · 5 días' },
      { destino: 'Escapada a Ámsterdam en vuelo directo', descripcion: 'Paquete vuelo + hotel con desayuno. Canales, Rijksmuseum y mercado de flores.', coste: '400–600 €/persona · 3–4 días' },
    ],
    1: [
      { destino: 'Turquía — Estambul + Capadocia + Riviera', descripcion: 'Circuito completo en grupo con traslados, hoteles 4★ y mayoría de visitas incluidas.', coste: '850–1.100 €/persona · 10 días' },
      { destino: 'Circuito Países Bajos + Bélgica', descripcion: 'Ámsterdam, Brujas, Gante y Bruselas en autocar con guía. Hoteles 3★ céntricos.', coste: '800–1.100 €/persona · 8 días (vuelo incluido)' },
    ],
    2: [
      { destino: 'Crucero por el Mediterráneo (7 noches)', descripcion: 'Salida desde Barcelona. Roma, Atenas, Santorini, Dubrovnik. Todo incluido a bordo.', coste: '1.300–1.900 €/persona · 7 noches' },
      { destino: 'Japón Imperial — circuito organizado', descripcion: 'Tokio, Nikko, Kioto, Nara y Osaka con guía en español. Noches en ryokan.', coste: '1.600–2.200 €/persona · 12 días' },
    ],
    3: [
      { destino: 'Crucero por los Fiordos Noruegos + Islandia', descripcion: 'Expedición premium con excursiones privadas, auroras boreales y cabina con balcón.', coste: '3.200–5.500 €/persona · 14 noches' },
      { destino: 'Vuelta al Mundo en 30 días', descripcion: 'Bangkok, Bali, Sídney, Fiyi y Nueva York. Hoteles 4–5★ y vuelos intercontinentales.', coste: '6.000–10.000 €/persona · 30 días' },
    ],
  },
};

// ─────────────────────────────────────────────
// Datos: preguntas con pesos
// ─────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cuánto tiempo libre tienes para las vacaciones?',
    opciones: [
      { texto: '3-4 días (un puente o fin de semana largo)', pesos: { organizado: 3, ciudad: 2 } },
      { texto: '1 semana', pesos: { playa: 2, montana: 2, ciudad: 2 } },
      { texto: '2 semanas', pesos: { playa: 3, aventura: 3 } },
      { texto: 'Más de 2 semanas', pesos: { aventura: 4, montana: 3 } },
    ],
  },
  {
    id: 2,
    texto: '¿Cuál es tu presupuesto aproximado por persona?',
    opciones: [
      { texto: 'Hasta 500 €', pesos: { montana: 3, ciudad: 2 } },
      { texto: 'Entre 500 € y 1.000 €', pesos: { playa: 2, ciudad: 2, organizado: 2 } },
      { texto: 'Entre 1.000 € y 2.000 €', pesos: { organizado: 3, aventura: 2 } },
      { texto: 'Más de 2.000 €', pesos: { aventura: 3, organizado: 2 } },
    ],
  },
  {
    id: 3,
    texto: '¿Con quién vas a viajar?',
    opciones: [
      { texto: 'Solo/a', pesos: { aventura: 3, ciudad: 3 } },
      { texto: 'En pareja', pesos: { playa: 2, ciudad: 2, montana: 2 } },
      { texto: 'Con familia e hijos', pesos: { playa: 3, organizado: 3 } },
      { texto: 'Con grupo de amigos', pesos: { aventura: 3, playa: 2 } },
    ],
  },
  {
    id: 4,
    texto: '¿Qué priorizas en las vacaciones?',
    opciones: [
      { texto: 'Descanso total, no hacer nada', pesos: { playa: 4 } },
      { texto: 'Explorar y conocer nueva cultura', pesos: { ciudad: 4 } },
      { texto: 'Actividad física y naturaleza', pesos: { montana: 3, aventura: 3 } },
      { texto: 'Combinar todo sin preocupaciones', pesos: { organizado: 3 } },
    ],
  },
  {
    id: 5,
    texto: '¿Cómo prefieres organizar el viaje?',
    opciones: [
      { texto: 'Todo organizado, sin preocupaciones logísticas', pesos: { organizado: 5 } },
      { texto: 'Vuelo y hotel reservado, el resto libre', pesos: { playa: 2, ciudad: 2 } },
      { texto: 'Planificación mínima, improvisar sobre la marcha', pesos: { aventura: 3, montana: 2 } },
      { texto: 'Ruta detallada planificada por mí mismo/a', pesos: { ciudad: 2, aventura: 2 } },
    ],
  },
  {
    id: 6,
    texto: '¿Cuánta actividad física quieres durante las vacaciones?',
    opciones: [
      { texto: 'Mínima, descansar es la prioridad', pesos: { playa: 4 } },
      { texto: 'Moderada, paseos y visitas turísticas', pesos: { ciudad: 3, organizado: 2 } },
      { texto: 'Alta, senderismo o deportes acuáticos', pesos: { montana: 4 } },
      { texto: 'Intensa, deporte extremo y retos físicos', pesos: { aventura: 4 } },
    ],
  },
  {
    id: 7,
    texto: '¿Qué clima prefieres en tus vacaciones?',
    opciones: [
      { texto: 'Calor y mucho sol', pesos: { playa: 4 } },
      { texto: 'Fresco y temperatura agradable', pesos: { montana: 3, aventura: 2 } },
      { texto: 'Me da igual, lo importante es el destino', pesos: { ciudad: 3 } },
      { texto: 'Variado según la ruta o etapa', pesos: { aventura: 3 } },
    ],
  },
  {
    id: 8,
    texto: '¿Cuánto te importa tener servicios cerca (restaurantes, tiendas, sanidad)?',
    opciones: [
      { texto: 'Mucho, los necesito cerca y disponibles', pesos: { organizado: 3, playa: 2, ciudad: 2 } },
      { texto: 'Moderado, con lo básico me vale', pesos: { montana: 2 } },
      { texto: 'Poco, prefiero entornos remotos y naturales', pesos: { aventura: 3, montana: 2 } },
    ],
  },
  {
    id: 9,
    texto: '¿Cuánta experiencia tienes viajando?',
    opciones: [
      { texto: 'Poca experiencia, prefiero lo conocido y seguro', pesos: { organizado: 4, playa: 2 } },
      { texto: 'Experiencia media, ya he viajado algunas veces', pesos: { playa: 2, ciudad: 2 } },
      { texto: 'Mucha experiencia, me adapto a cualquier situación', pesos: { aventura: 3, montana: 2 } },
    ],
  },
  {
    id: 10,
    texto: '¿Qué recuerdo quieres llevarte de las vacaciones?',
    opciones: [
      { texto: 'Fotos en la playa y desconexión total', pesos: { playa: 4 } },
      { texto: 'Haber conocido nuevos lugares y culturas', pesos: { ciudad: 4 } },
      { texto: 'Haber superado un reto físico o aventura', pesos: { aventura: 4, montana: 3 } },
      { texto: 'Haber compartido momentos especiales con mi gente', pesos: { organizado: 3, playa: 2 } },
    ],
  },
];

// ─────────────────────────────────────────────
// Datos: recomendaciones
// ─────────────────────────────────────────────

const RECOMENDACIONES: Record<RecomendacionKey, Recomendacion> = {
  playa: {
    key: 'playa',
    emoji: '🏖️',
    titulo: 'Vacaciones de Playa o Costa',
    subtitulo: 'Sol, arena, descanso y baño',
    descripcion: 'Tu perfil apunta claramente a unas vacaciones junto al mar. Priorizas el descanso total, el calor y la posibilidad de desconectar sin preocupaciones. La playa o la costa mediterránea española son tu hábitat natural estas vacaciones.',
    ventajas: [
      'Máxima relajación y desconexión del día a día',
      'Oferta hotelera amplia y para todos los presupuestos',
      'Ideal para ir con familia, pareja o grupos de amigos',
      'Gastronomía costera de primer nivel en España',
    ],
    consejos: [
      'Reserva con 3-6 meses de antelación en temporada alta',
      'Considera la costa menos masificada: Asturias, Galicia o Cádiz',
      'Alterna días de playa con excursiones cercanas para no saturarte',
      'Revisa el índice UV y lleva protección solar alta',
    ],
  },
  montana: {
    key: 'montana',
    emoji: '🏔️',
    titulo: 'Turismo Rural o de Montaña',
    subtitulo: 'Naturaleza, senderismo y tranquilidad',
    descripcion: 'Buscas alejarte de la ciudad, respirar aire limpio y conectar con la naturaleza. Un destino rural o de montaña te ofrece paisajes impresionantes, rutas de senderismo y la tranquilidad que necesitas para recargar pilas de verdad.',
    ventajas: [
      'Entornos naturales espectaculares sin masificación turística',
      'Presupuesto más contenido que la playa o los circuitos',
      'Ideal para desconectar y practicar actividad física moderada',
      'Gastronomía de interior: cocidos, caza, quesos y vinos',
    ],
    consejos: [
      'Elige el destino según la estación: Pirineos en verano, Sierra Nevada en invierno',
      'Reserva el alojamiento rural con antelación en festivos',
      'Lleva ropa para cambios bruscos de temperatura',
      'Contrata un seguro de viaje con cobertura de actividades al aire libre',
    ],
  },
  ciudad: {
    key: 'ciudad',
    emoji: '🏛️',
    titulo: 'Viaje Cultural Urbano',
    subtitulo: 'Museos, gastronomía e historia',
    descripcion: 'Tu perfil es el del viajero urbano y cultural. Disfrutas explorando ciudades, visitando museos, descubriendo la gastronomía local y empapándote de historia y arquitectura. Los viajes cortos de fin de semana o puentes son tus aliados perfectos.',
    ventajas: [
      'Perfecto para viajes cortos de 3-5 días',
      'Oferta cultural y gastronómica inagotable',
      'Excelente conectividad en transporte (trenes AVE, vuelos lowcost)',
      'Sin depender del clima para disfrutar del viaje',
    ],
    consejos: [
      'Compra las entradas a museos online con antelación para evitar colas',
      'Alójate en el centro o cerca del transporte público',
      'Alterna visitas culturales con tiempo libre para callejear',
      'Aprovecha las tarjetas de museos y transporte integrado',
    ],
  },
  aventura: {
    key: 'aventura',
    emoji: '🧗',
    titulo: 'Viaje de Aventura o Mochilero',
    subtitulo: 'Exploración, deportes y máxima libertad',
    descripcion: 'Tienes espíritu aventurero y buscas salir de tu zona de confort. Un viaje de aventura o mochilero te permitirá explorar destinos menos convencionales, practicar deportes de riesgo y vivir experiencias únicas con total libertad de movimiento.',
    ventajas: [
      'Máxima libertad e improvisación en el itinerario',
      'Experiencias únicas e irrepetibles',
      'Perfecto para viajeros en solitario o con amigos afines',
      'Se adapta a presupuestos medios-altos según el destino',
    ],
    consejos: [
      'Contrata un seguro de viaje con cobertura de deportes de aventura',
      'Informa a alguien de tu itinerario previsto',
      'Lleva ropa técnica y calzado adecuado para el terreno',
      'Ten siempre un plan B ante imprevistos logísticos',
    ],
  },
  organizado: {
    key: 'organizado',
    emoji: '🗺️',
    titulo: 'Viaje Organizado o Circuito',
    subtitulo: 'Todo incluido, guías y sin preocupaciones',
    descripcion: 'Prefieres disfrutar del viaje sin preocuparte de la logística. Los viajes organizados o circuitos con guía te ofrecen comodidad, seguridad y la posibilidad de conocer varios destinos en un solo viaje. Ideal para familias y personas con menos experiencia viajera.',
    ventajas: [
      'Sin preocupaciones logísticas: todo resuelto de antemano',
      'Guía experto que enriquece la experiencia cultural',
      'Ideal para familias con niños o personas mayores',
      'Conoces varios destinos en un solo viaje',
    ],
    consejos: [
      'Compara precios entre distintas agencias y operadores',
      'Lee bien qué incluye y qué no incluye el precio del paquete',
      'Valora el tamaño del grupo: grupos pequeños ofrecen más calidad',
      'Reserva con 4-6 meses de antelación para mejores precios',
    ],
  },
};

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function SelectorVacaciones() {
  // Estado del test
  const [preguntaActual, setPreguntaActual] = useState<number>(0);
  const [respuestas, setRespuestas] = useState<(number | null)[]>(
    Array(PREGUNTAS.length).fill(null)
  );
  const [mostrarResultado, setMostrarResultado] = useState<boolean>(false);

  // Seleccionar una opción
  const seleccionarOpcion = (indiceOpcion: number) => {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[preguntaActual] = indiceOpcion;
    setRespuestas(nuevasRespuestas);
  };

  // Avanzar a la siguiente pregunta
  const irSiguiente = () => {
    if (preguntaActual < PREGUNTAS.length - 1) {
      setPreguntaActual(preguntaActual + 1);
    }
  };

  // Retroceder a la pregunta anterior
  const irAnterior = () => {
    if (preguntaActual > 0) {
      setPreguntaActual(preguntaActual - 1);
    }
  };

  // Calcular resultado
  const calcularResultado = (): RecomendacionKey => {
    const puntuaciones: Record<RecomendacionKey, number> = {
      playa: 0,
      montana: 0,
      ciudad: 0,
      aventura: 0,
      organizado: 0,
    };

    PREGUNTAS.forEach((pregunta, idx) => {
      const respuesta = respuestas[idx];
      if (respuesta !== null) {
        const opcion = pregunta.opciones[respuesta];
        (Object.keys(opcion.pesos) as RecomendacionKey[]).forEach((key) => {
          puntuaciones[key] += opcion.pesos[key] ?? 0;
        });
      }
    });

    let mejorKey: RecomendacionKey = 'playa';
    let mejorPuntuacion = -1;
    (Object.keys(puntuaciones) as RecomendacionKey[]).forEach((key) => {
      if (puntuaciones[key] > mejorPuntuacion) {
        mejorPuntuacion = puntuaciones[key];
        mejorKey = key;
      }
    });

    return mejorKey;
  };

  // Mostrar resultado
  const verResultado = () => {
    setMostrarResultado(true);
  };

  // Reiniciar el test
  const reiniciar = () => {
    setPreguntaActual(0);
    setRespuestas(Array(PREGUNTAS.length).fill(null));
    setMostrarResultado(false);
  };

  // Datos calculados
  const opcionSeleccionada = respuestas[preguntaActual];
  const todasContestadas = respuestas.every((r) => r !== null);
  const progresoPorcentaje = Math.round(
    (respuestas.filter((r) => r !== null).length / PREGUNTAS.length) * 100
  );

  const resultadoKey = mostrarResultado ? calcularResultado() : null;
  const recomendacion = resultadoKey ? RECOMENDACIONES[resultadoKey] : null;

  return (
    <div className={styles.container}>
      {/* 1. Logo */}
      <MeskeiaLogo />

      {/* 2. Hero */}
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}><span aria-hidden="true">🏖️</span> Selector de Vacaciones</h1>
        <p className={styles.heroSubtitle}>
          Test de 10 preguntas para descubrir qué tipo de viaje se adapta mejor a ti
        </p>
      </header>

      {/* 3. Aviso legal */}
      <LegalNotice />

      {/* 4. Test o Resultado */}
      {!mostrarResultado ? (
        <section className={styles.testSection} aria-label="Test de vacaciones">
          {/* Barra de progreso */}
          <div className={styles.progreso} role="progressbar" aria-valuenow={progresoPorcentaje} aria-valuemin={0} aria-valuemax={100} aria-label="Progreso del test">
            <div className={styles.progresoLabel}>
              <span>Pregunta {preguntaActual + 1} de {PREGUNTAS.length}</span>
              <span>{progresoPorcentaje}% completado</span>
            </div>
            <div className={styles.progresoBar}>
              <div
                className={styles.progresoFill}
                style={{ width: `${progresoPorcentaje}%` }}
              />
            </div>
          </div>

          {/* Pregunta actual */}
          <div className={styles.pregunta}>
            <p className={styles.preguntaNumero}>
              Pregunta {preguntaActual + 1}
            </p>
            <p className={styles.preguntaTexto}>
              {PREGUNTAS[preguntaActual].texto}
            </p>

            <div className={styles.opciones} role="group" aria-label={`Opciones para: ${PREGUNTAS[preguntaActual].texto}`}>
              {PREGUNTAS[preguntaActual].opciones.map((opcion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.opcionBtn} ${opcionSeleccionada === idx ? styles.selected : ''}`}
                  onClick={() => seleccionarOpcion(idx)}
                  aria-pressed={opcionSeleccionada === idx ? true : false}
                >
                  {opcion.texto}
                </button>
              ))}
            </div>
          </div>

          {/* Navegación */}
          <div className={styles.navegacion}>
            <button
              type="button"
              className={styles.btnAnterior}
              onClick={irAnterior}
              disabled={preguntaActual === 0}
              aria-label="Pregunta anterior"
            >
              ← Anterior
            </button>

            {preguntaActual < PREGUNTAS.length - 1 ? (
              <button
                type="button"
                className={styles.btnSiguiente}
                onClick={irSiguiente}
                disabled={opcionSeleccionada === null}
                aria-label="Siguiente pregunta"
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="button"
                className={styles.btnResultado}
                onClick={verResultado}
                disabled={!todasContestadas}
                aria-label="Ver mi recomendación de vacaciones"
              >
                Ver mi resultado ✓
              </button>
            )}
          </div>
        </section>
      ) : (
        /* 5. Resultado */
        recomendacion && (
          <section className={styles.resultadoSection} aria-label="Resultado del test">
            {/* Tarjeta principal */}
            <div className={`${styles.resultadoCard} ${styles[`recomendacion_${recomendacion.key}`]}`}>
              <span className={styles.recomendacionEmoji} aria-hidden="true">
                {recomendacion.emoji}
              </span>
              <h2 className={styles.recomendacionTitulo}>{recomendacion.titulo}</h2>
              <p className={styles.recomendacionSubtitulo}>{recomendacion.subtitulo}</p>
              <p className={styles.recomendacionDesc}>{recomendacion.descripcion}</p>
            </div>

            {/* Ventajas */}
            <div className={styles.ventajasList}>
              <h3>Por qué encaja contigo</h3>
              <ul>
                {recomendacion.ventajas.map((ventaja, idx) => (
                  <li key={idx}>{ventaja}</li>
                ))}
              </ul>
            </div>

            {/* Sección presupuesto */}
            {respuestas[1] !== null && (() => {
              const budgetIdx = respuestas[1] as PresupuestoIdx;
              const ejemplos = EJEMPLOS_DESTINO[resultadoKey!][budgetIdx];
              return (
                <div className={styles.presupuestoSection} aria-label="Destinos sugeridos según tu presupuesto">
                  <div className={styles.presupuestoHeader}>
                    <h3>¿Qué puedes hacer con tu presupuesto?</h3>
                    <span className={styles.presupuestoBadge}>
                      {PRESUPUESTO_LABELS[budgetIdx]}/persona
                    </span>
                  </div>
                  <div className={styles.presupuestoGrid}>
                    {ejemplos.map((ej, idx) => (
                      <div key={idx} className={styles.presupuestoCard}>
                        <span className={styles.presupuestoDestino}>{ej.destino}</span>
                        <p className={styles.presupuestoDesc}>{ej.descripcion}</p>
                        <span className={styles.presupuestoCoste}><span aria-hidden="true">📍</span> {ej.coste}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Consejos grid */}
            <div className={styles.consejosGrid} aria-label="Consejos prácticos">
              {recomendacion.consejos.map((consejo, idx) => (
                <div key={idx} className={styles.consejoCard}>
                  <p>{consejo}</p>
                </div>
              ))}
            </div>

            {/* Botón reiniciar */}
            <button
              type="button"
              className={styles.btnReiniciar}
              onClick={reiniciar}
              aria-label="Volver a realizar el test desde el principio"
            >
              <span aria-hidden="true">🔄</span> Repetir el test
            </button>
          </section>
        )
      )}

      {/* 6. Disclaimer */}
      <DisclaimerCard variant="general" severity="high" />

      {/* 7. Sección educativa */}
      <EducationalSection
        title="Tipos de vacaciones: ventajas de cada opción"
        subtitle="Guía para elegir el viaje que mejor se adapta a ti"
        icon="✈️"
      >
        {/* Grid de tipos */}
        <div className={styles.eduGrid}>
          <div className={styles.eduCard}>
            <h4><span aria-hidden="true">🏖️</span> Playa y Costa</h4>
            <p>Ideal para desconectar y recargar energías. España tiene más de 8.000 km de costa con playas para todos los gustos.</p>
            <ul>
              <li>Mejor época: junio a septiembre</li>
              <li>Presupuesto medio-bajo en destinos nacionales</li>
              <li>Perfecta para familias con niños pequeños</li>
            </ul>
          </div>

          <div className={styles.eduCard}>
            <h4><span aria-hidden="true">🏔️</span> Montaña y Rural</h4>
            <p>Entornos naturales para el senderismo, la fauna y la gastronomía de interior. Menos masificación y precios más asequibles.</p>
            <ul>
              <li>Mejor época: primavera, verano y otoño</li>
              <li>Presupuesto contenido con alojamiento rural</li>
              <li>Recomendada para parejas y pequeños grupos</li>
            </ul>
          </div>

          <div className={styles.eduCard}>
            <h4><span aria-hidden="true">🏛️</span> Ciudad Cultural</h4>
            <p>Museos, arquitectura y gastronomía urbana. Perfecta para viajes cortos: un fin de semana puede ser suficiente.</p>
            <ul>
              <li>Válida durante todo el año</li>
              <li>Presupuesto variable según el destino</li>
              <li>Ideal para viajes de pareja o solo/a</li>
            </ul>
          </div>

          <div className={styles.eduCard}>
            <h4><span aria-hidden="true">🧗</span> Aventura y Mochilero</h4>
            <p>Para quienes buscan salir de la zona de confort. Requiere más planificación y un seguro de viaje robusto.</p>
            <ul>
              <li>Mejor época: según el destino y la actividad</li>
              <li>Presupuesto variable (mochilero o premium)</li>
              <li>Recomendada para viajeros con experiencia</li>
            </ul>
          </div>

          <div className={styles.eduCard}>
            <h4><span aria-hidden="true">🗺️</span> Viaje Organizado</h4>
            <p>La opción más cómoda y sin sorpresas. El operador gestiona toda la logística: transporte, hotel y guías.</p>
            <ul>
              <li>Disponible durante todo el año</li>
              <li>Precio fijo desde el principio (sin sorpresas)</li>
              <li>Ideal para primeros viajes internacionales o familias</li>
            </ul>
          </div>
        </div>

        {/* Aviso reserva con antelación */}
        <div className={styles.warningBox} role="note">
          <strong><span aria-hidden="true">⏰</span> Reserva con antelación y ahorra</strong>
          Reservar con 3-6 meses de antelación para el verano puede suponer un ahorro significativo respecto al precio de última hora. Los precios de vuelos, hoteles y paquetes turísticos se disparan en temporada alta (julio-agosto) y en las semanas previas a la salida. Compara siempre en varios buscadores antes de confirmar la reserva.
        </div>

        {/* Consejo seguro de viaje */}
        <div className={styles.eduCard} style={{ marginTop: '1rem' }}>
          <h4><span aria-hidden="true">🛡️</span> El seguro de viaje: no lo subestimes</h4>
          <p>
            Un buen seguro de viaje cubre cancelaciones, asistencia médica en el extranjero, pérdida de equipaje y repatriación.
            Su coste (habitualmente entre 20 € y 80 € por viaje) es mínimo comparado con los imprevistos que puede cubrir.
            Para viajes de aventura, verifica que el seguro incluya actividades de riesgo como senderismo de alta montaña, deportes acuáticos o escalada.
          </p>
        </div>
      </EducationalSection>

      {/* 8. Apps relacionadas */}
      <RelatedApps apps={getRelatedApps('selector-vacaciones')} />

      {/* 9. Compartir */}
      <ShareCard appName="selector-vacaciones" />

      {/* 10. Footer */}
      <Footer appName="selector-vacaciones" />
    </div>
  );
}
