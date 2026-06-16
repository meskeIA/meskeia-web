'use client';

import React, { useState } from 'react';
import styles from './SelectorVehiculoElectrico.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ──────────────────────────────────────────────────────────────────

type TipoVehiculo = 'bev' | 'phev' | 'hev' | 'moto_electrica' | 'esperar';

interface Pesos {
  bev: number;
  phev: number;
  hev: number;
  moto_electrica: number;
  esperar: number;
}

interface OpcionPregunta {
  texto: string;
  icono: string;
  pesos: Partial<Pesos>;
}

interface Pregunta {
  id: number;
  icono: string;
  texto: string;
  opciones: OpcionPregunta[];
}

// ─── Preguntas ───────────────────────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    icono: '📏',
    texto: '¿Cuántos kilómetros recorres habitualmente al día?',
    opciones: [
      {
        texto: 'Menos de 30 km (solo ciudad)',
        icono: '🏙️',
        pesos: { bev: 3, moto_electrica: 4, hev: 1 },
      },
      {
        texto: 'Entre 30 y 80 km (uso mixto)',
        icono: '🚗',
        pesos: { bev: 3, phev: 3, hev: 2 },
      },
      {
        texto: 'Entre 80 y 150 km (uso intensivo)',
        icono: '🛣️',
        pesos: { bev: 2, phev: 3, hev: 3 },
      },
      {
        texto: 'Más de 150 km diarios',
        icono: '🚀',
        pesos: { hev: 3, phev: 2, esperar: 1 },
      },
    ],
  },
  {
    id: 2,
    icono: '🔌',
    texto: '¿Puedes instalar o ya tienes un punto de carga en casa (garaje o plaza privada)?',
    opciones: [
      {
        texto: 'Sí, tengo garaje propio y puedo instalar cargador',
        icono: '✅',
        pesos: { bev: 4, phev: 3 },
      },
      {
        texto: 'Tengo garaje de comunidad, aún sin cargador pero es posible',
        icono: '🏢',
        pesos: { bev: 2, phev: 2, hev: 1 },
      },
      {
        texto: 'No tengo garaje propio, aparco en la calle',
        icono: '🚫',
        pesos: { hev: 4, esperar: 2, moto_electrica: 2 },
      },
    ],
  },
  {
    id: 3,
    icono: '🗺️',
    texto: '¿Con qué frecuencia realizas viajes largos (más de 200 km sin parar)?',
    opciones: [
      {
        texto: 'Raramente o nunca',
        icono: '😌',
        pesos: { bev: 4, moto_electrica: 2 },
      },
      {
        texto: 'Alguna vez al mes',
        icono: '📅',
        pesos: { bev: 2, phev: 3, hev: 2 },
      },
      {
        texto: 'Cada semana',
        icono: '🔁',
        pesos: { phev: 3, hev: 3 },
      },
      {
        texto: 'Es mi uso habitual (viajante, comercial…)',
        icono: '💼',
        pesos: { hev: 4, phev: 2 },
      },
    ],
  },
  {
    id: 4,
    icono: '💶',
    texto: '¿Cuál es tu presupuesto aproximado para el vehículo?',
    opciones: [
      {
        texto: 'Menos de 15.000 €',
        icono: '💰',
        pesos: { moto_electrica: 5, esperar: 2 },
      },
      {
        texto: 'Entre 15.000 y 25.000 €',
        icono: '💰💰',
        pesos: { hev: 3, esperar: 2, bev: 1 },
      },
      {
        texto: 'Entre 25.000 y 40.000 €',
        icono: '💰💰💰',
        pesos: { bev: 3, phev: 3, hev: 2 },
      },
      {
        texto: 'Más de 40.000 €',
        icono: '💎',
        pesos: { bev: 5, phev: 3 },
      },
    ],
  },
  {
    id: 5,
    icono: '🛤️',
    texto: '¿Qué tipo de conducción realizas principalmente?',
    opciones: [
      {
        texto: 'Exclusivamente ciudad y tráfico urbano',
        icono: '🏙️',
        pesos: { bev: 4, moto_electrica: 3, hev: 2 },
      },
      {
        texto: 'Mixto (ciudad + alguna carretera)',
        icono: '🔀',
        pesos: { phev: 4, bev: 2, hev: 2 },
      },
      {
        texto: 'Principalmente carretera y autopista',
        icono: '🛣️',
        pesos: { hev: 4, phev: 2 },
      },
      {
        texto: 'Mucho fuera de asfalto o rural',
        icono: '🌾',
        pesos: { hev: 3, esperar: 2 },
      },
    ],
  },
  {
    id: 6,
    icono: '🧳',
    texto: '¿Necesitas gran capacidad de maletero o transportar objetos voluminosos habitualmente?',
    opciones: [
      {
        texto: 'Sí, es imprescindible (familia, trabajo…)',
        icono: '🚐',
        pesos: { hev: 2, phev: 2, bev: 1 },
      },
      {
        texto: 'A veces, pero no es prioritario',
        icono: '🎒',
        pesos: { bev: 2, phev: 2, hev: 2 },
      },
      {
        texto: 'No, me basta con poco espacio',
        icono: '👜',
        pesos: { bev: 3, moto_electrica: 3 },
      },
    ],
  },
  {
    id: 7,
    icono: '🚗',
    texto: '¿Dispones de otro vehículo en casa para viajes largos o emergencias?',
    opciones: [
      {
        texto: 'Sí, tenemos un segundo coche',
        icono: '✅',
        pesos: { bev: 4, moto_electrica: 2 },
      },
      {
        texto: 'No, este sería el único vehículo del hogar',
        icono: '🚗',
        pesos: { hev: 3, phev: 3, esperar: 1 },
      },
    ],
  },
  {
    id: 8,
    icono: '🏦',
    texto: '¿Son importantes para ti las ayudas y subvenciones actuales (MOVES III, deducciones fiscales)?',
    opciones: [
      {
        texto: 'Sí, quiero aprovecharlas al máximo',
        icono: '💸',
        pesos: { bev: 4, phev: 2 },
      },
      {
        texto: 'Las tendré en cuenta pero no son determinantes',
        icono: '🤔',
        pesos: { bev: 2, phev: 2, hev: 2 },
      },
      {
        texto: 'No me influyen demasiado',
        icono: '😐',
        pesos: { hev: 2, esperar: 1 },
      },
    ],
  },
  {
    id: 9,
    icono: '😰',
    texto: '¿Te preocupa quedarte sin batería lejos de un punto de carga (ansiedad de rango)?',
    opciones: [
      {
        texto: 'Mucho, me generaría estrés',
        icono: '😨',
        pesos: { hev: 4, phev: 3, esperar: 1 },
      },
      {
        texto: 'Un poco, pero podría adaptarme',
        icono: '😐',
        pesos: { phev: 3, bev: 2, hev: 1 },
      },
      {
        texto: 'Nada, planificaría las recargas sin problema',
        icono: '😎',
        pesos: { bev: 4 },
      },
    ],
  },
  {
    id: 10,
    icono: '🛵',
    texto: '¿Te plantearías una moto eléctrica como alternativa real al coche para tus desplazamientos?',
    opciones: [
      {
        texto: 'Sí, sería perfecta para mi día a día',
        icono: '✅',
        pesos: { moto_electrica: 4 },
      },
      {
        texto: 'Quizás para algunos trayectos, pero no como único vehículo',
        icono: '🤔',
        pesos: { moto_electrica: 2, bev: 1, hev: 1 },
      },
      {
        texto: 'No, necesito un coche sí o sí',
        icono: '🚗',
        pesos: { bev: 2, phev: 2, hev: 2 },
      },
    ],
  },
];

// ─── Resultados ──────────────────────────────────────────────────────────────

interface ResultadoInfo {
  icono: string;
  titulo: string;
  subtitulo: string;
  descripcion: string;
  ventajas: string[];
}

const RESULTADOS: Record<TipoVehiculo, ResultadoInfo> = {
  bev: {
    icono: '⚡',
    titulo: 'Eléctrico Puro (BEV)',
    subtitulo: '0 emisiones · Máxima eficiencia · Ideal para tu perfil',
    descripcion:
      'Tu perfil encaja perfectamente con un vehículo eléctrico puro. Tienes acceso a carga en casa, haces pocos o moderados kilómetros diarios y los viajes largos no son tu rutina. Disfrutarás de las menores emisiones, el menor coste por km y una experiencia de conducción silenciosa y fluida.',
    ventajas: [
      'Coste de recarga muy bajo (≈ 2–3 € cada 100 km)',
      'Mantenimiento reducido (sin motor de combustión)',
      'Acceso libre a zonas de bajas emisiones',
      'Subvenciones MOVES III y deducciones en IRPF',
      'Cero emisiones locales de CO₂',
    ],
  },
  phev: {
    icono: '🔋',
    titulo: 'Híbrido Enchufable (PHEV)',
    subtitulo: 'Lo mejor de ambos mundos · Eléctrico en ciudad · Sin límite en carretera',
    descripcion:
      'Tu situación es mixta: usas el coche en ciudad pero también haces viajes largos con cierta frecuencia, o tienes ciertas dudas sobre la autonomía eléctrica. El PHEV te permite hacer los trayectos cortos en modo 100% eléctrico y usar el motor de combustión cuando lo necesitas, sin ansiedad de rango.',
    ventajas: [
      'Autonomía eléctrica de 40–80 km para el día a día',
      'Motor de combustión para viajes largos sin límites',
      'Etiqueta CERO o ECO según modelo',
      'Deducciones fiscales disponibles en muchos modelos',
      'Transición gradual hacia la movilidad eléctrica',
    ],
  },
  hev: {
    icono: '🌿',
    titulo: 'Híbrido Suave (HEV)',
    subtitulo: 'Sin enchufar · Mayor eficiencia que gasolina · Sin cambiar hábitos',
    descripcion:
      'No necesitas enchufar nada ni cambiar tus rutinas. El híbrido convencional recarga la batería de forma automática durante la conducción y el frenado regenerativo. Consume entre un 20–30 % menos que un gasolina equivalente y es ideal si haces muchos kilómetros en carretera o no tienes dónde cargar en casa.',
    ventajas: [
      'Sin infraestructura de carga necesaria',
      'Ahorro de combustible del 20–30 %',
      'Mayor fiabilidad en trayectos de larga distancia',
      'Etiqueta ECO (peajes reducidos, estacionamiento)',
      'Transición suave a la conducción electrificada',
    ],
  },
  moto_electrica: {
    icono: '🛵',
    titulo: 'Moto Eléctrica',
    subtitulo: 'La opción más económica · Perfecta para ciudad · Sin aparcamiento problemático',
    descripcion:
      'Tu perfil de uso es principalmente urbano y los kilómetros diarios son cortos. Una moto eléctrica puede cubrir perfectamente tu movilidad cotidiana a un coste de adquisición y mantenimiento muy inferior al de un coche. Olvídate de aparcar y muévete con agilidad por la ciudad.',
    ventajas: [
      'Precio de compra muy inferior al de un coche eléctrico',
      'Recarga con cualquier enchufe doméstico',
      'Cero emisiones y acceso a todas las zonas urbanas',
      'Mantenimiento mínimo',
      'Aparcamiento gratuito en muchos municipios',
    ],
  },
  esperar: {
    icono: '⏳',
    titulo: 'Esperar 1–2 años',
    subtitulo: 'La tecnología avanza rápido · Mejor precio · Más opciones',
    descripcion:
      'En tu caso, esperar puede ser la decisión más inteligente. La tecnología de baterías mejora cada año (más autonomía, menor coste), los precios siguen bajando y las infraestructuras de recarga se están expandiendo en España. Si tu vehículo actual aguanta 1–2 años más, podrías conseguir un coche eléctrico mucho mejor por el mismo dinero.',
    ventajas: [
      'Precios de los BEV bajando un 8–12 % anual',
      'Baterías de estado sólido en 2026–2027',
      'Red de carga ultrarrápida en expansión',
      'Posibles nuevas subvenciones y regulaciones favorables',
      'Más modelos y competencia en todos los segmentos',
    ],
  },
};

// ─── Componente principal ────────────────────────────────────────────────────

export default function SelectorVehiculoElectrico() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>(Array(PREGUNTAS.length).fill(-1));
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [resultado, setResultado] = useState<TipoVehiculo | null>(null);
  const [puntuaciones, setPuntuaciones] = useState<Pesos>({
    bev: 0, phev: 0, hev: 0, moto_electrica: 0, esperar: 0,
  });

  const seleccionActual = respuestas[preguntaActual];
  const pregunta = PREGUNTAS[preguntaActual];
  const totalPreguntas = PREGUNTAS.length;
  const progresoPct = ((preguntaActual) / totalPreguntas) * 100;

  function seleccionarOpcion(idx: number) {
    const nuevas = [...respuestas];
    nuevas[preguntaActual] = idx;
    setRespuestas(nuevas);
  }

  function avanzar() {
    if (seleccionActual === -1) return;
    if (preguntaActual < totalPreguntas - 1) {
      setPreguntaActual(preguntaActual + 1);
    } else {
      calcularResultado();
    }
  }

  function retroceder() {
    if (preguntaActual > 0) {
      setPreguntaActual(preguntaActual - 1);
    }
  }

  function calcularResultado() {
    const totales: Pesos = { bev: 0, phev: 0, hev: 0, moto_electrica: 0, esperar: 0 };

    PREGUNTAS.forEach((preg, pIdx) => {
      const respIdx = respuestas[pIdx];
      if (respIdx === -1) return;
      const opcion = preg.opciones[respIdx];
      (Object.keys(opcion.pesos) as TipoVehiculo[]).forEach((tipo) => {
        totales[tipo] += opcion.pesos[tipo] ?? 0;
      });
    });

    const ganador = (Object.keys(totales) as TipoVehiculo[]).reduce((a, b) =>
      totales[a] >= totales[b] ? a : b
    );

    setPuntuaciones(totales);
    setResultado(ganador);
    setMostrarResultado(true);
  }

  function reiniciar() {
    setPreguntaActual(0);
    setRespuestas(Array(PREGUNTAS.length).fill(-1));
    setMostrarResultado(false);
    setResultado(null);
    setPuntuaciones({ bev: 0, phev: 0, hev: 0, moto_electrica: 0, esperar: 0 });
  }

  // Normalizar puntuaciones para las barras
  const maxPuntuacion = Math.max(...Object.values(puntuaciones), 1);

  const etiquetas: Record<TipoVehiculo, string> = {
    bev: 'Eléctrico puro',
    phev: 'Híbrido enchufable',
    hev: 'Híbrido suave',
    moto_electrica: 'Moto eléctrica',
    esperar: 'Esperar',
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1><span aria-hidden="true">⚡</span> Selector de Vehículo Eléctrico</h1>
        <p>Test de 10 preguntas para saber qué tipo de vehículo eléctrico o híbrido encaja con tu vida</p>
      </header>

      <LegalNotice />

      {!mostrarResultado ? (
        <main className={styles.quiz}>
          {/* Barra de progreso */}
          <div className={styles.progreso}>
            <div className={styles.progresoBar} role="progressbar" aria-valuenow={preguntaActual} aria-valuemin={0} aria-valuemax={totalPreguntas}>
              <div
                className={styles.progresoFill}
                style={{ width: `${progresoPct}%` }}
              />
            </div>
            <span className={styles.progresoTexto}>
              {preguntaActual + 1} / {totalPreguntas}
            </span>
          </div>

          {/* Pregunta */}
          <div className={styles.pregunta}>
            <div className={styles.preguntaHeader}>
              <span className={styles.preguntaIcono} aria-hidden="true">
                {pregunta.icono}
              </span>
              <p className={styles.preguntaTexto}>{pregunta.texto}</p>
            </div>

            <div className={styles.opciones} role="group" aria-label={`Opciones para: ${pregunta.texto}`}>
              {pregunta.opciones.map((op, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.opcion} ${seleccionActual === idx ? styles.seleccionada : ''}`}
                  onClick={() => seleccionarOpcion(idx)}
                  aria-pressed={seleccionActual === idx}
                >
                  <span className={styles.opcionIcono} aria-hidden="true">{op.icono}</span>
                  {op.texto}
                </button>
              ))}
            </div>
          </div>

          {/* Navegación */}
          <nav className={styles.navegacion} aria-label="Navegación del test">
            {preguntaActual > 0 && (
              <button
                type="button"
                className={styles.btnSecundario}
                onClick={retroceder}
              >
                ← Anterior
              </button>
            )}
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={avanzar}
              disabled={seleccionActual === -1}
              style={{ marginLeft: preguntaActual === 0 ? 'auto' : undefined }}
            >
              {preguntaActual < totalPreguntas - 1 ? 'Siguiente →' : 'Ver resultado'}
            </button>
          </nav>
        </main>
      ) : resultado ? (
        <main className={styles.resultado}>
          <div className={styles.resultadoCard}>
            <span className={styles.resultadoIcono} aria-hidden="true">
              {RESULTADOS[resultado].icono}
            </span>
            <h2 className={styles.resultadoTitulo}>
              {RESULTADOS[resultado].titulo}
            </h2>
            <p className={styles.resultadoSubtitulo}>
              {RESULTADOS[resultado].subtitulo}
            </p>

            <p className={styles.resultadoDescripcion}>
              {RESULTADOS[resultado].descripcion}
            </p>

            <ul className={styles.ventajas} aria-label="Ventajas principales">
              {RESULTADOS[resultado].ventajas.map((v, i) => (
                <li key={i}>{v}</li>
              ))}
            </ul>

            {/* Puntuaciones comparativas */}
            <div className={styles.resumenPuntuaciones}>
              <h3>Compatibilidad con tu perfil</h3>
              {(Object.keys(etiquetas) as TipoVehiculo[]).map((tipo) => (
                <div key={tipo} className={styles.barraResultado}>
                  <span className={styles.barraLabel}>{etiquetas[tipo]}</span>
                  <div className={styles.barraTrack}>
                    <div
                      className={`${styles.barraFill} ${tipo === resultado ? styles.ganadora : ''}`}
                      style={{ width: `${(puntuaciones[tipo] / maxPuntuacion) * 100}%` }}
                    />
                  </div>
                  <span className={styles.barraValor}>{puntuaciones[tipo]}</span>
                </div>
              ))}
            </div>

            <div className={styles.warningBox} role="note">
              <strong>Nota:</strong> Este test ofrece una orientación basada en tus respuestas. Antes de comprar, consulta las especificaciones técnicas de los modelos que te interesen, las ayudas vigentes (MOVES III) y valora una prueba de conducción.
            </div>

            <button
              type="button"
              className={styles.btnReiniciar}
              onClick={reiniciar}
            >
              Repetir test
            </button>
          </div>

          <DisclaimerCard variant="financial" severity="high" />

          <EducationalSection
            title="Guía de vehículos electrificados en España"
            subtitle="Todo lo que necesitas saber antes de dar el salto a la movilidad eléctrica"
          >
            <h3>¿Qué significan BEV, PHEV y HEV?</h3>
            <p>
              <strong>BEV (Battery Electric Vehicle)</strong> — Eléctrico puro: funciona exclusivamente con batería y motor eléctrico. No tiene motor de combustión interna. Se recarga enchufándolo a la red eléctrica. Autonomías actuales: 250–600 km.
            </p>
            <p>
              <strong>PHEV (Plug-in Hybrid Electric Vehicle)</strong> — Híbrido enchufable: combina motor eléctrico (con batería recargable por cable) y motor de combustión. Autonomía eléctrica típica: 40–80 km. Ideal para quienes hacen la mayoría de trayectos en ciudad pero también viajes largos.
            </p>
            <p>
              <strong>HEV (Hybrid Electric Vehicle)</strong> — Híbrido convencional: incorpora un motor eléctrico auxiliar que se recarga automáticamente mediante la conducción y el frenado regenerativo. No se puede enchufar. Reduce el consumo sin cambiar hábitos de uso.
            </p>

            <h3>¿Cuánto cuesta recargar un coche eléctrico?</h3>
            <p>
              Con tarifa nocturna doméstica (≈ 0,10 €/kWh), recargar 60 kWh (autonomía ~400 km) cuesta unos <strong>6 €</strong> — equivalente a 1,5 €/100 km frente a los 8–12 €/100 km de un gasolina. En cargador público rápido el precio sube a 0,35–0,55 €/kWh pero sigue siendo competitivo.
            </p>

            <h3>Subvenciones disponibles en España (2025)</h3>
            <ul>
              <li><strong>MOVES III</strong>: hasta 7.000 € para coches BEV con achatarramiento; hasta 4.500 € sin achatarramiento.</li>
              <li><strong>Deducción IRPF</strong>: 15 % del precio de compra de vehículos de cero emisiones (base máx. 20.000 €).</li>
              <li><strong>Bonificaciones ITP/AJD</strong>: muchas comunidades autónomas aplican reducciones en el impuesto de matriculación.</li>
              <li><strong>Subvenciones autonómicas</strong>: Madrid, Cataluña, Valencia y otras CCAA tienen programas adicionales.</li>
            </ul>
            <p>
              Consulta siempre el estado actualizado de las ayudas en el <a href="https://www.idae.es" target="_blank" rel="noopener noreferrer">IDAE (idae.es)</a> antes de comprar.
            </p>

            <h3>Infraestructura de carga en España</h3>
            <p>
              España cuenta con más de <strong>30.000 puntos de carga públicos</strong> (2025) en continua expansión. Las principales redes son: Ionity, Tesla Supercharger (abierto a otras marcas), Repsol, Endesa X, Iberdrola SmartCharge y Zunder. La app <em>PlugShare</em> o <em>Chargemap</em> te permiten localizar los más cercanos en tiempo real.
            </p>

            <h3>¿Cuándo elegir moto eléctrica en lugar de coche?</h3>
            <p>
              Si todos tus desplazamientos son urbanos (menos de 50 km/día), la moto eléctrica puede ser la opción más económica y práctica: precio de compra desde 2.000 € (ciclomotores) hasta 8.000 € (motocicletas), recarga con cualquier enchufe doméstico en 3–6 horas y aparcamiento gratuito en muchas ciudades. El programa MOVES III también incluye subvenciones para motos eléctricas.
            </p>

            <h3>¿Tiene sentido esperar para comprar?</h3>
            <p>
              Los precios de los BEV han bajado un 8–12 % anual en los últimos años. Las baterías de estado sólido (mayor densidad, menor coste) se esperan en producción masiva para 2026–2027. Si tu vehículo actual es funcional, esperar 12–24 meses puede suponer un ahorro significativo y acceder a mejores autonomías por el mismo precio.
            </p>
          </EducationalSection>
        </main>
      ) : null}

      <RelatedApps apps={getRelatedApps('selector-vehiculo-electrico')} />
      <ShareCard appName="selector-vehiculo-electrico" />
      <Footer appName="selector-vehiculo-electrico" />
    </div>
  );
}
