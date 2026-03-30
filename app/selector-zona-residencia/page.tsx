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
import styles from './SelectorZonaResidencia.module.css';

// ============================================
// TIPOS
// ============================================

type RecomendacionKey = 'ciudad_grande' | 'ciudad_media' | 'rural' | 'costa';

interface Opcion {
  texto: string;
  pesos: Partial<Record<RecomendacionKey, number>>;
}

interface Pregunta {
  id: number;
  texto: string;
  opciones: Opcion[];
}

interface Recomendacion {
  key: RecomendacionKey;
  icono: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  factores: { etiqueta: string; valor: string }[];
  ventajas: string[];
  consideraciones: string[];
  consejos: string[];
}

// ============================================
// DATOS: PREGUNTAS
// ============================================

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cómo es tu situación laboral?',
    opciones: [
      {
        texto: 'Trabajo presencial en empresa grande',
        pesos: { ciudad_grande: 4 },
      },
      {
        texto: 'Trabajo presencial en empresa mediana o pequeña',
        pesos: { ciudad_media: 3, ciudad_grande: 1 },
      },
      {
        texto: 'Teletrabajo total o soy autónomo/a',
        pesos: { rural: 3, costa: 3 },
      },
      {
        texto: 'Desempleado/a o en transición laboral',
        pesos: { ciudad_grande: 2, ciudad_media: 2 },
      },
    ],
  },
  {
    id: 2,
    texto: '¿Cuál es tu situación familiar actual?',
    opciones: [
      {
        texto: 'Vivo solo/a o en pareja sin hijos',
        pesos: { rural: 2, costa: 2 },
      },
      {
        texto: 'Tengo hijos en edad escolar',
        pesos: { ciudad_grande: 3, ciudad_media: 3 },
      },
      {
        texto: 'Tengo hijos ya independientes',
        pesos: { costa: 2, rural: 2 },
      },
      {
        texto: 'Cuido de familiares mayores',
        pesos: { ciudad_grande: 3, ciudad_media: 2 },
      },
    ],
  },
  {
    id: 3,
    texto: '¿Qué importancia tiene el transporte público para ti?',
    opciones: [
      {
        texto: 'Esencial, no tengo coche',
        pesos: { ciudad_grande: 4 },
      },
      {
        texto: 'Importante, aunque tengo coche',
        pesos: { ciudad_media: 2 },
      },
      {
        texto: 'Prescindible, siempre uso el coche',
        pesos: { rural: 2, costa: 1 },
      },
    ],
  },
  {
    id: 4,
    texto: '¿Cuál es tu presupuesto mensual para vivienda (alquiler o hipoteca)?',
    opciones: [
      {
        texto: 'Menos de 600 €',
        pesos: { rural: 4, ciudad_media: 1 },
      },
      {
        texto: 'Entre 600 € y 1.000 €',
        pesos: { ciudad_media: 3, rural: 1, costa: 1 },
      },
      {
        texto: 'Entre 1.000 € y 1.800 €',
        pesos: { ciudad_grande: 2, costa: 2 },
      },
      {
        texto: 'Más de 1.800 €',
        pesos: { ciudad_grande: 3 },
      },
    ],
  },
  {
    id: 5,
    texto: '¿Qué entorno natural prefieres en tu día a día?',
    opciones: [
      {
        texto: 'Ciudad, me encanta el ambiente urbano',
        pesos: { ciudad_grande: 4 },
      },
      {
        texto: 'Ciudad con parques y zonas verdes',
        pesos: { ciudad_media: 3 },
      },
      {
        texto: 'Naturaleza cercana: campo o montaña',
        pesos: { rural: 4 },
      },
      {
        texto: 'Mar y playa',
        pesos: { costa: 4 },
      },
    ],
  },
  {
    id: 6,
    texto: '¿Cómo valoras la oferta cultural y de ocio (teatros, restaurantes, eventos)?',
    opciones: [
      {
        texto: 'Es muy importante para mí',
        pesos: { ciudad_grande: 4 },
      },
      {
        texto: 'La valoro, pero no necesito demasiado',
        pesos: { ciudad_media: 2 },
      },
      {
        texto: 'Me basta con lo básico, prefiero tranquilidad',
        pesos: { rural: 3, costa: 2 },
      },
    ],
  },
  {
    id: 7,
    texto: '¿Tienes red social o familiar en algún tipo de zona específica?',
    opciones: [
      {
        texto: 'Sí, familia y amigos en ciudad grande',
        pesos: { ciudad_grande: 2 },
      },
      {
        texto: 'Sí, en ciudad media o pueblo',
        pesos: { ciudad_media: 2, rural: 1 },
      },
      {
        texto: 'Sí, en la costa',
        pesos: { costa: 2 },
      },
      {
        texto: 'No tengo vínculos especiales en ninguna zona',
        pesos: {},
      },
    ],
  },
  {
    id: 8,
    texto: '¿Cuánto valoras la tranquilidad y el espacio frente a la actividad?',
    opciones: [
      {
        texto: 'Prefiero la actividad y el movimiento constante',
        pesos: { ciudad_grande: 3 },
      },
      {
        texto: 'Un equilibrio entre ambos',
        pesos: { ciudad_media: 3 },
      },
      {
        texto: 'Prefiero tranquilidad y espacio',
        pesos: { rural: 3, costa: 2 },
      },
    ],
  },
  {
    id: 9,
    texto: '¿Qué importancia tiene para ti la calidad de los servicios sanitarios y educativos?',
    opciones: [
      {
        texto: 'Muy alta, son prioritarios',
        pesos: { ciudad_grande: 3, ciudad_media: 2 },
      },
      {
        texto: 'Media, con lo básico me conformo',
        pesos: { ciudad_media: 1, rural: 1 },
      },
      {
        texto: 'Baja, puedo desplazarme cuando lo necesite',
        pesos: { rural: 2, costa: 1 },
      },
    ],
  },
  {
    id: 10,
    texto: '¿Cómo describirías tu ritmo de vida ideal?',
    opciones: [
      {
        texto: 'Acelerado, siempre haciendo cosas',
        pesos: { ciudad_grande: 3 },
      },
      {
        texto: 'Activo pero equilibrado',
        pesos: { ciudad_media: 3 },
      },
      {
        texto: 'Pausado, con tiempo para disfrutar',
        pesos: { rural: 2, costa: 3 },
      },
      {
        texto: 'Relajado, sin prisas',
        pesos: { rural: 3, costa: 2 },
      },
    ],
  },
];

// ============================================
// DATOS: RECOMENDACIONES
// ============================================

const RECOMENDACIONES: Record<RecomendacionKey, Recomendacion> = {
  ciudad_grande: {
    key: 'ciudad_grande',
    icono: '🏙️',
    titulo: 'Ciudad Grande',
    subtitulo: 'Máxima oferta y oportunidades',
    descripcion:
      'Tu perfil encaja con la vida en una gran ciudad. Aquí encontrarás la mayor variedad de oportunidades laborales, una oferta cultural y de ocio imbatible, y acceso a servicios sanitarios y educativos de primer nivel. El coste de vida será más elevado, pero el potencial profesional y social compensa para perfiles activos y urbanos.',
    factores: [
      { etiqueta: 'Coste de vida', valor: 'Alto' },
      { etiqueta: 'Transporte', valor: 'Excelente' },
      { etiqueta: 'Empleo', valor: 'Máxima oferta' },
      { etiqueta: 'Servicios', valor: 'Completos' },
    ],
    ventajas: [
      'Gran oferta laboral en todos los sectores',
      'Transporte público completo sin necesidad de coche',
      'Máxima oferta cultural, gastronómica y de ocio',
      'Servicios sanitarios y educativos especializados',
      'Red social diversa y posibilidades de networking',
    ],
    consideraciones: [
      'Precio de la vivienda muy elevado, especialmente en Madrid y Barcelona',
      'Tráfico, ruido y densidad pueden generar estrés',
      'Menor contacto con la naturaleza en el día a día',
      'Coste general de vida significativamente mayor que en zonas rurales',
    ],
    consejos: [
      'Valora barrios periféricos bien comunicados para reducir el coste de vivienda',
      'Aprovecha el transporte público para reducir gastos y estrés',
      'Busca parques y espacios verdes cerca de tu vivienda para compensar el entorno urbano',
      'Investiga los servicios específicos del barrio antes de comprometerte',
    ],
  },
  ciudad_media: {
    key: 'ciudad_media',
    icono: '🏘️',
    titulo: 'Ciudad Media',
    subtitulo: 'El equilibrio más infravalorado',
    descripcion:
      'Tu perfil apunta a una ciudad media: el punto dulce entre servicios completos y calidad de vida razonable. Ciudades como Valladolid, Murcia, Alicante, Santander o Zaragoza ofrecen empleo diverso, servicios sanitarios y educativos de calidad, buena oferta cultural y unos precios de vivienda sensiblemente más asequibles que las grandes urbes.',
    factores: [
      { etiqueta: 'Coste de vida', valor: 'Moderado' },
      { etiqueta: 'Transporte', valor: 'Bueno' },
      { etiqueta: 'Empleo', valor: 'Variado' },
      { etiqueta: 'Servicios', valor: 'Completos' },
    ],
    ventajas: [
      'Precio de vivienda mucho más asequible que en grandes ciudades',
      'Servicios completos: sanidad, educación, comercio',
      'Menor tiempo de desplazamiento y menos estrés por tráfico',
      'Buena oferta cultural y gastronómica a escala humana',
      'Comunidades más cohesionadas y cercanas',
    ],
    consideraciones: [
      'Oferta laboral más limitada que en grandes ciudades para perfiles muy especializados',
      'Puede requerir coche para algunos desplazamientos periféricos',
      'Menor diversidad de eventos y cultura en comparación con grandes urbes',
    ],
    consejos: [
      'Investiga el mercado laboral local antes de mudarte si no teletrabajas',
      'Compara el coste total de vida (vivienda + transporte) frente a la gran ciudad',
      'Considera ciudades universitarias para mayor dinamismo cultural',
      'Valora la proximidad a entornos naturales según tus preferencias de ocio',
    ],
  },
  rural: {
    key: 'rural',
    icono: '🌿',
    titulo: 'Zona Rural o Pueblo',
    subtitulo: 'Espacio, tranquilidad y naturaleza',
    descripcion:
      'Tu perfil se adapta bien a la vida en un entorno rural o en un pueblo. Mayor espacio, tranquilidad, contacto directo con la naturaleza y precios de vivienda muy por debajo de la media nacional. Es imprescindible contar con teletrabajo consolidado, negocio propio o una actividad que no requiera presencia diaria en la ciudad.',
    factores: [
      { etiqueta: 'Coste de vida', valor: 'Bajo' },
      { etiqueta: 'Transporte', valor: 'Coche imprescindible' },
      { etiqueta: 'Empleo', valor: 'Limitado (teletrabajo ideal)' },
      { etiqueta: 'Servicios', valor: 'Básicos' },
    ],
    ventajas: [
      'Precio de vivienda muy bajo comparado con ciudades',
      'Espacio, tranquilidad y calidad del aire notablemente mejores',
      'Contacto diario con la naturaleza y menor estrés ambiental',
      'Comunidades pequeñas con relaciones más personales',
      'Menor coste de vida general (alimentación, servicios locales)',
    ],
    consideraciones: [
      'Imprescindible el teletrabajo o actividad económica propia',
      'Acceso limitado a servicios sanitarios especializados',
      'Puede generar aislamiento social, especialmente sin vínculos previos',
      'Coche imprescindible para prácticamente cualquier gestión',
      'Conectividad a internet variable según la zona',
    ],
    consejos: [
      'Verifica la cobertura de fibra óptica o internet de calidad antes de decidirte',
      'Elige pueblos con acceso a servicios básicos (médico, farmacia, supermercado) en radio de 20 km',
      'Visita la zona en distintas épocas del año, especialmente en invierno',
      'Valora unirte a comunidades de teletrabajadores o nómadas digitales en la zona',
    ],
  },
  costa: {
    key: 'costa',
    icono: '🌊',
    titulo: 'Zona Costera',
    subtitulo: 'Clima, mar y calidad de vida',
    descripcion:
      'Tu perfil encaja con vivir en la costa. Clima más favorable, calidad de vida alta, acceso al mar y una oferta de ocio al aire libre muy atractiva. Los precios son variables: muy altos en primera línea de costa en zonas turísticas, pero razonables en localidades a pocos kilómetros del mar. Fundamental valorar la temporada alta si se vive en zona muy turística.',
    factores: [
      { etiqueta: 'Coste de vida', valor: 'Variable (según zona)' },
      { etiqueta: 'Transporte', valor: 'Coche recomendable' },
      { etiqueta: 'Empleo', valor: 'Estacional o teletrabajo' },
      { etiqueta: 'Servicios', valor: 'Buenos en núcleos grandes' },
    ],
    ventajas: [
      'Clima más suave y agradable durante gran parte del año',
      'Acceso inmediato al mar y actividades al aire libre',
      'Buena calidad de vida con ritmo más pausado que en ciudades',
      'Zonas costeras con buena oferta gastronómica y cultural',
      'Precios razonables en localidades alejadas de la primera línea',
    ],
    consideraciones: [
      'La temporada alta puede convertir zonas tranquilas en lugares masificados',
      'Empleo frecuentemente estacional o vinculado al turismo',
      'Primera línea de costa con precios de vivienda muy elevados',
      'Humedad y salinidad pueden afectar a la vivienda y la salud de algunas personas',
    ],
    consejos: [
      'Visita la zona tanto en temporada alta como fuera de ella para tener perspectiva real',
      'Considera localidades a 10-20 km del mar para reducir costes sin renunciar a la playa',
      'Verifica la oferta laboral o asegúrate de que el teletrabajo está consolidado',
      'Valora el acceso a servicios sanitarios, especialmente si tienes hijos o familiares mayores',
    ],
  },
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function SelectorZonaResidencia() {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [preguntaActual, setPreguntaActual] = useState<number>(0);
  const [mostrarResultado, setMostrarResultado] = useState<boolean>(false);

  const totalPreguntas = PREGUNTAS.length;
  const pregunta = PREGUNTAS[preguntaActual];
  const opcionSeleccionada = respuestas[pregunta.id] ?? -1;
  const esUltimaPregunta = preguntaActual === totalPreguntas - 1;
  const progresoPorc = Math.round(((preguntaActual + (opcionSeleccionada >= 0 ? 1 : 0)) / totalPreguntas) * 100);

  // Calcular resultado
  function calcularResultado(): RecomendacionKey {
    const puntuaciones: Record<RecomendacionKey, number> = {
      ciudad_grande: 0,
      ciudad_media: 0,
      rural: 0,
      costa: 0,
    };

    for (const preguntaItem of PREGUNTAS) {
      const idxRespuesta = respuestas[preguntaItem.id];
      if (idxRespuesta === undefined) continue;
      const opcion = preguntaItem.opciones[idxRespuesta];
      if (!opcion) continue;

      for (const [clave, valor] of Object.entries(opcion.pesos)) {
        puntuaciones[clave as RecomendacionKey] += valor ?? 0;
      }
    }

    let mejorClave: RecomendacionKey = 'ciudad_grande';
    let mejorPuntuacion = -1;

    for (const [clave, puntuacion] of Object.entries(puntuaciones)) {
      if (puntuacion > mejorPuntuacion) {
        mejorPuntuacion = puntuacion;
        mejorClave = clave as RecomendacionKey;
      }
    }

    return mejorClave;
  }

  function seleccionarOpcion(indice: number) {
    setRespuestas((prev) => ({ ...prev, [pregunta.id]: indice }));
  }

  function irAnterior() {
    if (preguntaActual > 0) {
      setPreguntaActual((p) => p - 1);
    }
  }

  function irSiguiente() {
    if (opcionSeleccionada >= 0 && preguntaActual < totalPreguntas - 1) {
      setPreguntaActual((p) => p + 1);
    }
  }

  function verResultado() {
    if (opcionSeleccionada >= 0) {
      setMostrarResultado(true);
    }
  }

  function reiniciar() {
    setRespuestas({});
    setPreguntaActual(0);
    setMostrarResultado(false);
  }

  const recomendacionKey = mostrarResultado ? calcularResultado() : null;
  const recomendacion = recomendacionKey ? RECOMENDACIONES[recomendacionKey] : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>¿Ciudad, pueblo o costa?</h1>
        <p className={styles.heroSubtitle}>
          Test de 10 preguntas para descubrir qué tipo de zona de residencia se adapta mejor a tu trabajo, familia y estilo de vida
        </p>
      </header>

      <div className={styles.legalNoticeWrapper}>
        <LegalNotice />
      </div>

      {/* TEST */}
      {!mostrarResultado && (
        <main className={styles.testSection}>
          {/* Barra de progreso */}
          <div className={styles.progreso} role="progressbar" aria-valuenow={progresoPorc} aria-valuemin={0} aria-valuemax={100} aria-label={`Progreso: pregunta ${preguntaActual + 1} de ${totalPreguntas}`}>
            <div className={styles.progresoBar}>
              <div
                className={styles.progresoFill}
                style={{ width: `${progresoPorc}%` }}
              />
            </div>
          </div>

          {/* Pregunta */}
          <div className={styles.pregunta}>
            <p className={styles.preguntaNumero}>Pregunta {preguntaActual + 1} de {totalPreguntas}</p>
            <p className={styles.preguntaTexto}>{pregunta.texto}</p>

            <div className={styles.opciones} role="group" aria-label={`Opciones de la pregunta ${preguntaActual + 1}`}>
              {pregunta.opciones.map((opcion, idx) => {
                const esSeleccionada = opcionSeleccionada === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`${styles.opcionBtn}${esSeleccionada ? ` ${styles.selected}` : ''}`}
                    onClick={() => seleccionarOpcion(idx)}
                    aria-pressed={esSeleccionada ? true : false}
                  >
                    {opcion.texto}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navegación */}
          <div className={styles.navegacion}>
            <button
              type="button"
              className={styles.btnAnterior}
              onClick={irAnterior}
              disabled={preguntaActual === 0}
            >
              ← Anterior
            </button>

            {!esUltimaPregunta ? (
              <button
                type="button"
                className={styles.btnSiguiente}
                onClick={irSiguiente}
                disabled={opcionSeleccionada < 0}
              >
                Siguiente →
              </button>
            ) : (
              <button
                type="button"
                className={styles.btnResultado}
                onClick={verResultado}
                disabled={opcionSeleccionada < 0}
              >
                Ver resultado
              </button>
            )}
          </div>
        </main>
      )}

      {/* RESULTADO */}
      {mostrarResultado && recomendacion && (
        <section className={styles.resultadoSection} aria-live="polite">
          <div className={`${styles.resultadoCard} ${styles[`recomendacion_${recomendacion.key}`]}`}>
            <span className={styles.recomendacionIcono} aria-hidden="true">{recomendacion.icono}</span>
            <h2 className={styles.recomendacionTitulo}>{recomendacion.titulo}</h2>
            <p className={styles.recomendacionSubtitulo}>{recomendacion.subtitulo}</p>
            <p className={styles.recomendacionDesc}>{recomendacion.descripcion}</p>

            {/* Factores */}
            <div className={styles.factoresGrid}>
              {recomendacion.factores.map((factor) => (
                <div key={factor.etiqueta} className={styles.factorCard}>
                  <h4>{factor.etiqueta}</h4>
                  <p>{factor.valor}</p>
                </div>
              ))}
            </div>

            {/* Ventajas */}
            <div className={styles.ventajasSection}>
              <h3>Puntos fuertes</h3>
              <ul>
                {recomendacion.ventajas.map((v) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
            </div>

            {/* Consideraciones */}
            <div className={styles.consejosSection}>
              <h3>Aspectos a tener en cuenta</h3>
              <ul>
                {recomendacion.consideraciones.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>

            {/* Consejos */}
            <div className={styles.ventajasSection}>
              <h3>Consejos antes de decidirte</h3>
              <ul>
                {recomendacion.consejos.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              className={styles.btnReiniciar}
              onClick={reiniciar}
            >
              Repetir el test
            </button>
          </div>
        </section>
      )}

      {/* DISCLAIMER */}
      <DisclaimerCard variant="financial" severity="critical" />

      {/* SECCIÓN EDUCATIVA */}
      <EducationalSection title="Factores clave para elegir dónde vivir" subtitle="Ciudad, pueblo o costa: ventajas e inconvenientes de cada entorno">
        <div className={styles.warningBox}>
          Donde vivimos afecta profundamente a nuestra calidad de vida, pero también a nuestras relaciones, trabajo y economía. Este test ofrece orientación basada en tus respuestas, pero la decisión final debe contemplar todos los factores de tu situación concreta y, si es posible, consultarse con profesionales o personas con experiencia directa en la zona.
        </div>

        <h3>Coste de vida orientativo por tipo de zona en España</h3>
        <p>
          Según datos de referencia del mercado inmobiliario y de consumo en España, el coste mensual estimado de una vivienda de dos habitaciones varía considerablemente según el tipo de zona:
        </p>
        <ul>
          <li><strong>Ciudad grande (Madrid, Barcelona, Bilbao):</strong> entre 1.200 € y 2.500 € en alquiler o hipotecas equivalentes.</li>
          <li><strong>Ciudad media (Zaragoza, Murcia, Valladolid):</strong> entre 600 € y 1.200 € en alquiler, con costes de vida un 20-30 % menores.</li>
          <li><strong>Zona rural o pueblo:</strong> entre 200 € y 600 € en alquiler, o precios de compra muy por debajo de la media nacional.</li>
          <li><strong>Costa (según zona y distancia al mar):</strong> muy variable, desde 500 € en zonas interiores hasta más de 1.500 € en primera línea.</li>
        </ul>

        <h3>El teletrabajo como factor liberador de ubicación</h3>
        <p>
          Desde 2020, el teletrabajo ha transformado el mapa de residencia en España. Más del 15 % de los trabajadores en activo tiene algún modelo de trabajo remoto consolidado, lo que ha generado una migración notable hacia zonas rurales, ciudades medias y costas. Esta tendencia, conocida como <strong>migración inversa</strong>, ha reactivado economías locales en pueblos y municipios pequeños, pero también ha generado presión sobre los precios de vivienda en algunas zonas anteriormente muy asequibles.
        </p>
        <p>
          Si el teletrabajo es total o parcial, la elección de zona puede hacerse en función de la calidad de vida, el coste o la naturaleza, sin depender exclusivamente de la proximidad al centro de trabajo.
        </p>

        <h3>Servicios e infraestructuras: qué valorar</h3>
        <p>
          Más allá del precio de la vivienda, una mudanza exitosa depende de factores como:
        </p>
        <ul>
          <li><strong>Conectividad:</strong> cobertura de fibra óptica o 4G/5G estable, especialmente en zonas rurales.</li>
          <li><strong>Sanidad:</strong> distancia al centro de salud más cercano y tiempo hasta el hospital de referencia.</li>
          <li><strong>Educación:</strong> disponibilidad de centros escolares públicos o concertados según la etapa educativa de los hijos.</li>
          <li><strong>Transporte:</strong> frecuencia de trenes o autobuses si no se dispone de vehículo propio.</li>
          <li><strong>Comercio:</strong> acceso a supermercados y servicios básicos en un radio razonable.</li>
        </ul>

        <h3>Consejo clave: visitar antes de decidir</h3>
        <p>
          Antes de formalizar cualquier mudanza, los expertos en movilidad residencial recomiendan visitar la zona candidata en distintas épocas del año. Una localidad costera en octubre tiene muy poco que ver con la misma en agosto; un pueblo de interior en enero puede presentar condiciones climáticas y sociales muy diferentes a las de primavera. Conocer la zona en distintos contextos ayuda a tomar una decisión más fundamentada y a evitar sorpresas desagradables.
        </p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('selector-zona-residencia')} />
      <ShareCard appName="selector-zona-residencia" />
      <Footer appName="selector-zona-residencia" />
    </div>
  );
}
