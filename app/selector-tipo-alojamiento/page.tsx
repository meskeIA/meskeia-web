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
import styles from './SelectorTipoAlojamiento.module.css';

// ─────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────

type TipoAlojamiento = 'hotel' | 'apartamento' | 'hostel' | 'camping_glamping' | 'casa_rural';

interface OpcionPregunta {
  texto: string;
  pesos: Partial<Record<TipoAlojamiento, number>>;
}

interface Pregunta {
  id: number;
  texto: string;
  opciones: OpcionPregunta[];
}

interface Resultado {
  key: TipoAlojamiento;
  emoji: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  ventajas: string[];
  consejos: string[];
}

// ─────────────────────────────────────────────
// Datos: preguntas con pesos
// ─────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Con quién vas a viajar?',
    opciones: [
      { texto: 'Solo/a', pesos: { hostel: 4, hotel: 2 } },
      { texto: 'En pareja', pesos: { hotel: 3, apartamento: 2, casa_rural: 2 } },
      { texto: 'Con familia e hijos', pesos: { apartamento: 4, casa_rural: 3 } },
      { texto: 'Con grupo de amigos (4 o más personas)', pesos: { apartamento: 3, casa_rural: 4, hostel: 2 } },
    ],
  },
  {
    id: 2,
    texto: '¿Cuál es tu presupuesto aproximado por noche?',
    opciones: [
      { texto: 'Menos de 30 € por persona', pesos: { hostel: 5, camping_glamping: 3 } },
      { texto: 'Entre 30 € y 70 € por noche (total)', pesos: { camping_glamping: 3, casa_rural: 2, hostel: 2 } },
      { texto: 'Entre 70 € y 150 € por noche (total)', pesos: { hotel: 3, apartamento: 3, casa_rural: 2 } },
      { texto: 'Más de 150 € por noche (total)', pesos: { hotel: 4, apartamento: 3 } },
    ],
  },
  {
    id: 3,
    texto: '¿Cuántos días vas a alojarte?',
    opciones: [
      { texto: '1-2 noches (escapada rápida)', pesos: { hotel: 4, hostel: 2 } },
      { texto: '3-5 noches (viaje de una semana)', pesos: { hotel: 3, apartamento: 3, hostel: 2 } },
      { texto: '1-2 semanas', pesos: { apartamento: 4, casa_rural: 3, camping_glamping: 2 } },
      { texto: 'Más de 2 semanas', pesos: { apartamento: 5, casa_rural: 3 } },
    ],
  },
  {
    id: 4,
    texto: '¿Qué tipo de destino es?',
    opciones: [
      { texto: 'Ciudad o capital urbana', pesos: { hotel: 4, hostel: 3, apartamento: 2 } },
      { texto: 'Costa o playa', pesos: { apartamento: 3, hotel: 2, camping_glamping: 2 } },
      { texto: 'Montaña o parque natural', pesos: { camping_glamping: 4, casa_rural: 4 } },
      { texto: 'Pueblo o zona rural', pesos: { casa_rural: 5, camping_glamping: 2 } },
    ],
  },
  {
    id: 5,
    texto: '¿Necesitas cocina propia para preparar tus comidas?',
    opciones: [
      { texto: 'Sí, es importante para mí ahorrar comiendo en casa', pesos: { apartamento: 5, casa_rural: 3 } },
      { texto: 'A veces, me gusta poder calentar algo', pesos: { apartamento: 3, casa_rural: 3, hostel: 2 } },
      { texto: 'No, prefiero salir a comer o desayunar en el hotel', pesos: { hotel: 4 } },
      { texto: 'Cocinar es parte de la experiencia de acampar', pesos: { camping_glamping: 5 } },
    ],
  },
  {
    id: 6,
    texto: '¿Qué nivel de servicio y comodidad buscas?',
    opciones: [
      { texto: 'Máximo: recepción 24h, servicio de habitaciones, limpieza diaria', pesos: { hotel: 5 } },
      { texto: 'Medio: comodidades básicas pero sin muchos servicios extra', pesos: { apartamento: 3, casa_rural: 3 } },
      { texto: 'Básico: lo mínimo necesario para dormir y ducharme', pesos: { hostel: 4, camping_glamping: 3 } },
      { texto: 'Prefiero privacidad y autonomía total sin personal', pesos: { apartamento: 4, casa_rural: 3, camping_glamping: 2 } },
    ],
  },
  {
    id: 7,
    texto: '¿Viajas con niños pequeños o personas mayores?',
    opciones: [
      { texto: 'Sí, con niños menores de 10 años', pesos: { apartamento: 4, hotel: 3, casa_rural: 2 } },
      { texto: 'Sí, con personas mayores o con movilidad reducida', pesos: { hotel: 4, apartamento: 3 } },
      { texto: 'No, todos son adultos jóvenes o de mediana edad', pesos: { hostel: 3, camping_glamping: 3, casa_rural: 2 } },
      { texto: 'Viajo solo/a sin dependientes', pesos: { hostel: 4, camping_glamping: 2 } },
    ],
  },
  {
    id: 8,
    texto: '¿Te importa socializar y conocer a otros viajeros?',
    opciones: [
      { texto: 'Sí, es una de mis motivaciones para viajar', pesos: { hostel: 5 } },
      { texto: 'No me importa, pero tampoco lo descarto', pesos: { hostel: 2, hotel: 2 } },
      { texto: 'Prefiero privacidad y evitar compartir espacios', pesos: { hotel: 3, apartamento: 3, casa_rural: 2 } },
      { texto: 'Quiero intimidad total con mi grupo o pareja', pesos: { casa_rural: 4, apartamento: 3 } },
    ],
  },
  {
    id: 9,
    texto: '¿Quieres estar en contacto con la naturaleza durante el viaje?',
    opciones: [
      { texto: 'Sí, es mi principal motivación: aire libre y naturaleza', pesos: { camping_glamping: 5, casa_rural: 3 } },
      { texto: 'Me gusta la naturaleza cerca pero durmiendo bajo techo con confort', pesos: { casa_rural: 4, camping_glamping: 2 } },
      { texto: 'Indiferente, lo importante es el destino no el tipo de alojamiento', pesos: { hotel: 2, apartamento: 2 } },
      { texto: 'Prefiero el entorno urbano o las comodidades de la ciudad', pesos: { hotel: 3, hostel: 2 } },
    ],
  },
  {
    id: 10,
    texto: '¿Necesitas aparcamiento propio o facilidad para llegar en coche?',
    opciones: [
      { texto: 'Sí, es imprescindible tener parking o llegar en mi vehículo', pesos: { casa_rural: 4, apartamento: 3, camping_glamping: 3 } },
      { texto: 'Sí, pero me sirve cualquier parking cercano aunque tenga coste', pesos: { hotel: 3, apartamento: 2 } },
      { texto: 'No, voy en transporte público o el destino es caminable', pesos: { hotel: 3, hostel: 3 } },
      { texto: 'Viajo con mochila, no me importa el acceso en coche', pesos: { hostel: 4, camping_glamping: 2 } },
    ],
  },
];

// ─────────────────────────────────────────────
// Datos: resultados
// ─────────────────────────────────────────────

const RESULTADOS: Record<TipoAlojamiento, Resultado> = {
  hotel: {
    key: 'hotel',
    emoji: '🏨',
    titulo: 'Hotel',
    subtitulo: 'Servicio completo, comodidad y ubicación',
    descripcion: 'Tu perfil encaja perfectamente con un hotel. Valoras el servicio completo, la comodidad y la ubicación céntrica. Ideal para estancias cortas, viajes de negocio o escapadas en las que no quieres preocuparte de nada: la recepción, el desayuno y la limpieza diaria están incluidos.',
    ventajas: [
      'Servicio 24 horas: recepción, conserjería y atención inmediata',
      'Desayuno buffet y restaurante en el propio establecimiento',
      'Ubicación céntrica con fácil acceso a atracciones y transporte',
      'Limpieza diaria y cambio de sábanas sin preocupaciones',
    ],
    consejos: [
      'Compara en Booking, Hotels.com y la web oficial del hotel (puede haber precios exclusivos)',
      'Reserva directamente para mejores condiciones de cancelación y upgrades',
      'Considera la categoría: un 3 estrellas bien ubicado puede superar a un 4 estrellas en las afueras',
      'Revisa las opiniones recientes sobre limpieza y atención al cliente',
    ],
  },
  apartamento: {
    key: 'apartamento',
    emoji: '🏠',
    titulo: 'Apartamento Turístico',
    subtitulo: 'Más espacio, autonomía y cocina propia',
    descripcion: 'El apartamento turístico es tu mejor opción. Ofrece el espacio y la autonomía que necesitas, con cocina propia para ahorrar en comidas y la comodidad de sentirte como en casa. Especialmente rentable para familias, grupos o estancias superiores a 4-5 noches.',
    ventajas: [
      'Cocina equipada para preparar tus propias comidas y ahorrar',
      'Mucho más espacio que una habitación de hotel al mismo precio',
      'Ideal para familias con niños: horarios propios y más intimidad',
      'Precio por noche más bajo cuanto más tiempo te quedes',
    ],
    consejos: [
      'Revisa bien las fotos y lee las opiniones sobre limpieza y equipamiento',
      'Confirma que el apartamento tiene licencia turística (obligatoria en España)',
      'Consulta las normas de la comunidad de vecinos y las horas de silencio',
      'Airbnb, Booking Apartamentos y Vrbo son las plataformas principales',
    ],
  },
  hostel: {
    key: 'hostel',
    emoji: '🎒',
    titulo: 'Hostel o B&B',
    subtitulo: 'Precio bajo, ambiente social y experiencias únicas',
    descripcion: 'El hostel o bed & breakfast es tu tipo de alojamiento. Priorizas el precio y la experiencia social: conocer a otros viajeros, intercambiar recomendaciones y vivir el destino de forma auténtica. Los hostels modernos van mucho más allá de las literas y ofrecen espacios comunes de calidad.',
    ventajas: [
      'El precio más bajo por noche de todos los tipos de alojamiento',
      'Ambiente social: conocerás a viajeros de todo el mundo',
      'Ubicación generalmente céntrica en las ciudades más turísticas',
      'Los hostels de calidad ofrecen zonas comunes, cocina compartida y actividades',
    ],
    consejos: [
      'Hostelworld y Booking son las mejores plataformas para comparar hostels',
      'Lee las reseñas sobre la limpieza de baños y el ambiente del lugar',
      'Si quieres más privacidad, muchos hostels ofrecen habitaciones privadas a buen precio',
      'Pregunta por actividades organizadas: tours gratuitos, cenas colectivas, etc.',
    ],
  },
  camping_glamping: {
    key: 'camping_glamping',
    emoji: '⛺',
    titulo: 'Camping o Glamping',
    subtitulo: 'Contacto con la naturaleza a distintos niveles de confort',
    descripcion: 'La naturaleza y el aire libre son tu prioridad. El camping tradicional o el glamping (camping con glamour y comodidades) te conectan con el entorno de una forma que ningún otro alojamiento puede ofrecer. Desde tiendas básicas hasta cabañas de lujo en el bosque, hay opción para todos los perfiles.',
    ventajas: [
      'Máximo contacto con la naturaleza: bosques, costas, montañas',
      'Precio muy competitivo en camping tradicional',
      'El glamping ofrece comodidades premium en entornos naturales únicos',
      'Ideal para familias aventureras, parejas y grupos de amigos',
    ],
    consejos: [
      'Reserva con antelación en temporada alta, especialmente en la costa',
      'Verifica los servicios disponibles: duchas, electricidad, wifi, piscina',
      'Para glamping, compara en plataformas como Glamping Hub o Airbnb (Cabañas)',
      'Infórmate sobre las normas del camping: horario de silencio, mascotas, fuego',
    ],
  },
  casa_rural: {
    key: 'casa_rural',
    emoji: '🏡',
    titulo: 'Casa Rural',
    subtitulo: 'Privacidad total, ambiente auténtico y tranquilidad',
    descripcion: 'La casa rural es tu alojamiento ideal. Buscas privacidad total, autenticidad y la tranquilidad de un espacio solo para ti y tu grupo. Perfecta para grupos de amigos, escapadas familiares o parejas que quieren desconectar del todo en un entorno rural con encanto.',
    ventajas: [
      'Privacidad total: toda la casa es para ti y tu grupo',
      'Ambiente auténtico con arquitectura y decoración tradicional española',
      'Cocina equipada, jardín, barbacoa o chimenea según la casa',
      'Ideal para grupos: el precio por persona baja mucho cuantos más seáis',
    ],
    consejos: [
      'Ruralia, Casa Rural y Booking son las plataformas más completas en España',
      'Verifica la política de mascotas si viajas con perro',
      'Lee bien las condiciones de cancelación y el depósito de fianza',
      'Confirma que la casa tiene calefacción si viajas en otoño o invierno',
    ],
  },
};

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function SelectorTipoAlojamientoPage() {
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

  // Calcular resultado por sistema de pesos
  const calcularResultado = (): TipoAlojamiento => {
    const puntuaciones: Record<TipoAlojamiento, number> = {
      hotel: 0,
      apartamento: 0,
      hostel: 0,
      camping_glamping: 0,
      casa_rural: 0,
    };

    PREGUNTAS.forEach((pregunta, idx) => {
      const respuesta = respuestas[idx];
      if (respuesta !== null) {
        const opcion = pregunta.opciones[respuesta];
        (Object.keys(opcion.pesos) as TipoAlojamiento[]).forEach((key) => {
          puntuaciones[key] += opcion.pesos[key] ?? 0;
        });
      }
    });

    let mejorKey: TipoAlojamiento = 'hotel';
    let mejorPuntuacion = -1;
    (Object.keys(puntuaciones) as TipoAlojamiento[]).forEach((key) => {
      if (puntuaciones[key] > mejorPuntuacion) {
        mejorPuntuacion = puntuaciones[key];
        mejorKey = key;
      }
    });

    return mejorKey;
  };

  // Ver resultado
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
  const resultado = resultadoKey ? RESULTADOS[resultadoKey] : null;

  return (
    <div className={styles.container}>
      {/* 1. Logo */}
      <MeskeiaLogo />

      {/* 2. Hero */}
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>🏨 Selector de Tipo de Alojamiento</h1>
        <p className={styles.heroSubtitle}>
          Test de 10 preguntas para saber qué tipo de alojamiento se adapta mejor a tu viaje
        </p>
      </header>

      {/* 3. Aviso legal */}
      <LegalNotice />

      {/* 4. Test o Resultado */}
      {!mostrarResultado ? (
        <section className={styles.quiz} aria-label="Test de tipo de alojamiento">
          {/* Barra de progreso */}
          <div
            className={styles.progreso}
            role="progressbar"
            aria-valuenow={progresoPorcentaje}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Progreso del test"
          >
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

            <div
              className={styles.opciones}
              role="group"
              aria-label={`Opciones para: ${PREGUNTAS[preguntaActual].texto}`}
            >
              {PREGUNTAS[preguntaActual].opciones.map((opcion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.opcion} ${opcionSeleccionada === idx ? styles.seleccionada : ''}`}
                  onClick={() => seleccionarOpcion(idx)}
                  aria-pressed={opcionSeleccionada === idx}
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
                className={styles.btnPrimary}
                onClick={irSiguiente}
                disabled={opcionSeleccionada === null}
                aria-label="Siguiente pregunta"
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="button"
                className={styles.btnPrimary}
                onClick={verResultado}
                disabled={!todasContestadas}
                aria-label="Ver mi tipo de alojamiento recomendado"
              >
                Ver mi resultado ✓
              </button>
            )}
          </div>
        </section>
      ) : (
        /* 5. Resultado */
        resultado && (
          <section className={styles.resultado} aria-label="Resultado del test">
            {/* Tarjeta principal */}
            <div className={`${styles.resultadoCard} ${styles[resultado.key]}`}>
              <span className={styles.resultadoEmoji} aria-hidden="true">
                {resultado.emoji}
              </span>
              <h2 className={styles.resultadoTitulo}>{resultado.titulo}</h2>
              <p className={styles.resultadoSubtitulo}>{resultado.subtitulo}</p>
              <p className={styles.resultadoDesc}>{resultado.descripcion}</p>
            </div>

            {/* Ventajas */}
            <div className={styles.ventajasList}>
              <h3>Por qué encaja contigo</h3>
              <ul>
                {resultado.ventajas.map((ventaja, idx) => (
                  <li key={idx}>{ventaja}</li>
                ))}
              </ul>
            </div>

            {/* Consejos prácticos */}
            <div className={styles.consejosGrid} aria-label="Consejos prácticos">
              {resultado.consejos.map((consejo, idx) => (
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
              🔄 Repetir el test
            </button>
          </section>
        )
      )}

      {/* 6. Disclaimer */}
      <DisclaimerCard variant="general" severity="medium" />

      {/* 7. Sección educativa */}
      <EducationalSection
        title="🏨 Tipos de alojamiento: ventajas de cada opción"
        subtitle="Guía para elegir el alojamiento que mejor se adapta a tu viaje"
      >
        {/* Grid de tipos */}
        <div className={styles.eduGrid}>
          <div className={styles.eduCard}>
            <h4>🏨 Hotel</h4>
            <p>El alojamiento con mayor servicio y comodidad. Ideal para estancias cortas, viajes de negocios o cuando quieres despreocuparte de la logística.</p>
            <ul>
              <li>Mejor para: viajes de 1-3 noches en ciudad</li>
              <li>Precio medio: 70-200 € por noche</li>
              <li>Ideal para: parejas, viajeros solos, negocios</li>
            </ul>
          </div>

          <div className={styles.eduCard}>
            <h4>🏠 Apartamento Turístico</h4>
            <p>Más espacio y autonomía que un hotel al mismo precio o menos. Con cocina propia, perfecta para estancias largas o familias numerosas.</p>
            <ul>
              <li>Mejor para: estancias de 4 noches o más</li>
              <li>Precio medio: 60-150 € por noche (el conjunto)</li>
              <li>Ideal para: familias, grupos, viajes largos</li>
            </ul>
          </div>

          <div className={styles.eduCard}>
            <h4>🎒 Hostel o B&B</h4>
            <p>La opción más económica y social. Los hostels modernos tienen zonas comunes de calidad, cocina compartida y organizan actividades para viajeros.</p>
            <ul>
              <li>Mejor para: viajeros solos o mochileros</li>
              <li>Precio medio: 15-40 € por persona y noche</li>
              <li>Ideal para: conocer gente y ahorrar dinero</li>
            </ul>
          </div>

          <div className={styles.eduCard}>
            <h4>⛺ Camping o Glamping</h4>
            <p>Desde la tienda de campaña más básica hasta cabañas de lujo en el bosque. El glamping ha revolucionado este tipo de alojamiento con propuestas premium en entornos naturales únicos.</p>
            <ul>
              <li>Mejor para: destinos rurales, costa y montaña</li>
              <li>Precio medio: 10-150 € por noche según tipo</li>
              <li>Ideal para: familias aventureras, naturaleza</li>
            </ul>
          </div>

          <div className={styles.eduCard}>
            <h4>🏡 Casa Rural</h4>
            <p>Privacidad total en un espacio con carácter y encanto. La casa es tuya durante la estancia: perfecta para grupos o familias que quieren desconectar del todo.</p>
            <ul>
              <li>Mejor para: grupos de 4-10 personas</li>
              <li>Precio medio: 80-250 € por noche (la casa entera)</li>
              <li>Ideal para: escapadas, cumpleaños, despedidas</li>
            </ul>
          </div>
        </div>

        {/* Consejo de reserva con antelación */}
        <div className={styles.warningBox} role="note">
          <strong>📅 Reserva con antelación y ahorra hasta un 40 %</strong>
          En temporada alta (verano, Semana Santa, puentes) los precios de todos los tipos de alojamiento se disparan. Reservar con 2-4 meses de antelación puede suponer un ahorro significativo, especialmente en casas rurales y apartamentos turísticos de costa. Los hoteles también ofrecen tarifas no reembolsables más baratas cuanto antes se reserven.
        </div>

        {/* Comparativa de criterios */}
        <div className={styles.eduCard} style={{ marginTop: '1rem' }}>
          <h4>🔍 ¿Cómo elegir según el tipo de viaje?</h4>
          <p>
            La elección del alojamiento depende de cuatro factores clave: el número de personas, el presupuesto total, la duración de la estancia y el tipo de destino.
            Para viajes cortos en ciudad, el hotel suele ser la mejor relación comodidad-precio.
            Para estancias largas o grupos, el apartamento o la casa rural ganan en espacio y ahorro.
            Si el presupuesto es limitado o viajas solo, los hostels son difícilmente superables.
            Y si buscas naturaleza por encima de todo, el camping o el glamping son una experiencia en sí misma.
          </p>
        </div>
      </EducationalSection>

      {/* 8. Apps relacionadas */}
      <RelatedApps apps={getRelatedApps('selector-tipo-alojamiento')} />

      {/* 9. Compartir */}
      <ShareCard appName="selector-tipo-alojamiento" />

      {/* 10. Footer */}
      <Footer appName="selector-tipo-alojamiento" />
    </div>
  );
}
