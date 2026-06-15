'use client';

import { useState } from 'react';
import styles from './SelectorTarifaElectrica.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  DisclaimerCard,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─── Tipos ─────────────────────────────────────────────────────────────────────

interface Pregunta {
  id: number;
  texto: string;
  opciones: Opcion[];
}

interface Opcion {
  texto: string;
  pvpcPuntos: number; // positivo = favorece PVPC, negativo = favorece mercado libre
}

interface Resultado {
  recomendacion: 'pvpc' | 'libre' | 'ambas';
  puntosPvpc: number;
  puntosLibre: number;
  costeAnualPvpc: number;
  costeAnualLibre: number;
  factores: string[];
  consejos: string[];
}

// ─── Datos de precios de referencia ────────────────────────────────────────────

const PRECIOS = {
  pvpc: {
    punta: 0.22,  // media 2024-2025
    llano: 0.16,
    valle: 0.10,
  },
  libre: {
    plano: 0.18,  // precio fijo medio mercado libre
  },
  potencia: {
    p1: 0.10, // precio potencia periodo 1 (dia)
    p2: 0.04, // precio potencia periodo 2 (noche)
  },
};

// ─── Preguntas del test ────────────────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cuantas personas viven en tu hogar?',
    opciones: [
      { texto: '1 persona', pvpcPuntos: 1 },
      { texto: '2 personas', pvpcPuntos: 0 },
      { texto: '3-4 personas', pvpcPuntos: -1 },
      { texto: '5 o mas', pvpcPuntos: -2 },
    ],
  },
  {
    id: 2,
    texto: '¿Tienes tarifa con discriminacion horaria (2.0TD)?',
    opciones: [
      { texto: 'Si', pvpcPuntos: 2 },
      { texto: 'No', pvpcPuntos: -1 },
      { texto: 'No se', pvpcPuntos: 0 },
    ],
  },
  {
    id: 3,
    texto: '¿A que hora sueles cocinar?',
    opciones: [
      { texto: 'Mediodia (12-15h)', pvpcPuntos: -2 },
      { texto: 'Noche (20-22h)', pvpcPuntos: -1 },
      { texto: 'Variable', pvpcPuntos: 0 },
    ],
  },
  {
    id: 4,
    texto: '¿Usas lavadora/lavavajillas en horario valle (noche/fines de semana)?',
    opciones: [
      { texto: 'Siempre', pvpcPuntos: 3 },
      { texto: 'A veces', pvpcPuntos: 1 },
      { texto: 'Nunca', pvpcPuntos: -2 },
    ],
  },
  {
    id: 5,
    texto: '¿Tienes aire acondicionado? ¿Lo usas mucho en verano?',
    opciones: [
      { texto: 'Si, mucho', pvpcPuntos: -2 },
      { texto: 'Si, poco', pvpcPuntos: 0 },
      { texto: 'No tengo', pvpcPuntos: 1 },
    ],
  },
  {
    id: 6,
    texto: '¿Tienes coche electrico que cargues en casa?',
    opciones: [
      { texto: 'Si', pvpcPuntos: 3 },
      { texto: 'No', pvpcPuntos: 0 },
    ],
  },
  {
    id: 7,
    texto: '¿Trabajas desde casa?',
    opciones: [
      { texto: 'Si, siempre', pvpcPuntos: -2 },
      { texto: 'Hibrido', pvpcPuntos: -1 },
      { texto: 'No', pvpcPuntos: 1 },
    ],
  },
  {
    id: 8,
    texto: '¿Te importa que el precio varie cada hora?',
    opciones: [
      { texto: 'Me da igual', pvpcPuntos: 2 },
      { texto: 'Prefiero precio fijo', pvpcPuntos: -3 },
      { texto: 'No entiendo', pvpcPuntos: -1 },
    ],
  },
  {
    id: 9,
    texto: '¿Tu consumo mensual aproximado?',
    opciones: [
      { texto: 'Menos de 200 kWh', pvpcPuntos: 2 },
      { texto: '200-400 kWh', pvpcPuntos: 0 },
      { texto: 'Mas de 400 kWh', pvpcPuntos: -1 },
    ],
  },
  {
    id: 10,
    texto: '¿Tienes placas solares con excedentes?',
    opciones: [
      { texto: 'Si', pvpcPuntos: 3 },
      { texto: 'No', pvpcPuntos: 0 },
    ],
  },
];

// ─── Funcion de calculo ────────────────────────────────────────────────────────

function calcularResultado(respuestas: Record<number, number>): Resultado {
  let puntosPvpc = 0;
  const factores: string[] = [];
  const consejos: string[] = [];

  // Sumar puntos de cada pregunta
  for (const pregunta of PREGUNTAS) {
    const opcionIdx = respuestas[pregunta.id];
    if (opcionIdx !== undefined) {
      const opcion = pregunta.opciones[opcionIdx];
      puntosPvpc += opcion.pvpcPuntos;
    }
  }

  // Factores segun respuestas
  const r = respuestas;

  // Coche electrico
  if (r[6] === 0) {
    factores.push('Cargar el coche electrico en valle (00-08h) reduce mucho el coste con PVPC');
    consejos.push('Programa la carga del coche entre las 00:00 y las 08:00 para aprovechar el valle');
  }

  // Placas solares
  if (r[10] === 0) {
    factores.push('Con placas solares, la compensacion de excedentes funciona mejor en PVPC');
    consejos.push('Maximiza el autoconsumo y vierte excedentes en horas punta para mayor compensacion');
  }

  // Electrodomesticos en valle
  if (r[4] === 0) {
    factores.push('Usar electrodomesticos siempre en valle te da una gran ventaja en PVPC');
    consejos.push('Mantener la lavadora y el lavavajillas en horario nocturno o de fin de semana');
  } else if (r[4] === 2) {
    factores.push('No usar electrodomesticos en valle reduce la ventaja del PVPC');
    consejos.push('Intenta programar lavadora y lavavajillas para la noche o fines de semana');
  }

  // Teletrabajo
  if (r[7] === 0) {
    factores.push('Trabajar desde casa aumenta el consumo en horas punta (mayor coste PVPC)');
    consejos.push('Si teletrabajas, valora un precio fijo que te de tranquilidad');
  }

  // Cocinar en horas punta
  if (r[3] === 0) {
    factores.push('Cocinar al mediodia cae en franja punta (la mas cara en PVPC)');
    consejos.push('Si puedes, prepara comidas la noche anterior o en fin de semana');
  }

  // Preferencia precio fijo
  if (r[8] === 1) {
    factores.push('Prefieres la tranquilidad de un precio fijo sin sorpresas');
    consejos.push('Compara ofertas en el comparador de la CNMC para encontrar el mejor precio fijo');
  }

  // Aire acondicionado
  if (r[5] === 0) {
    factores.push('Uso intensivo de aire acondicionado en verano (muchas horas punta)');
    consejos.push('Programa el AC para que enfrie antes de las 18h y mantener temperatura a 25-26 grados');
  }

  // Consumo bajo
  if (r[9] === 0) {
    factores.push('Con consumo bajo, el ahorro del PVPC en valle es muy significativo proporcionalmente');
  }

  // Si no hay factores especificos, añadir generico
  if (factores.length === 0) {
    factores.push('Tu perfil de consumo es equilibrado entre ambas opciones');
  }

  // Consejos genericos siempre
  consejos.push('Revisa tu factura actual para conocer tu consumo real por franjas horarias');
  consejos.push('Consulta el comparador de la CNMC (comparador.cnmc.gob.es) para ofertas actualizadas');

  // Estimar costes anuales
  const consumoMensualIdx = r[9] ?? 1;
  const consumoMensual = consumoMensualIdx === 0 ? 150 : consumoMensualIdx === 1 ? 300 : 500;

  // Distribucion de consumo segun perfil
  let pctPunta = 0.35;
  let pctLlano = 0.30;
  let pctValle = 0.35;

  // Ajustar segun respuestas
  if (r[4] === 0) { // Siempre electrodomesticos en valle
    pctPunta = 0.25;
    pctLlano = 0.25;
    pctValle = 0.50;
  } else if (r[4] === 2) { // Nunca en valle
    pctPunta = 0.45;
    pctLlano = 0.35;
    pctValle = 0.20;
  }

  if (r[7] === 0) { // Teletrabajo siempre
    pctPunta += 0.10;
    pctValle -= 0.10;
  }

  if (r[6] === 0) { // Coche electrico
    pctValle += 0.15;
    pctPunta -= 0.08;
    pctLlano -= 0.07;
  }

  // Normalizar porcentajes
  const total = pctPunta + pctLlano + pctValle;
  pctPunta /= total;
  pctLlano /= total;
  pctValle /= total;

  const consumoAnual = consumoMensual * 12;
  const costeAnualPvpc =
    consumoAnual * pctPunta * PRECIOS.pvpc.punta +
    consumoAnual * pctLlano * PRECIOS.pvpc.llano +
    consumoAnual * pctValle * PRECIOS.pvpc.valle +
    (PRECIOS.potencia.p1 + PRECIOS.potencia.p2) * 365;

  const costeAnualLibre =
    consumoAnual * PRECIOS.libre.plano +
    (PRECIOS.potencia.p1 + PRECIOS.potencia.p2) * 365;

  // Determinar recomendacion
  let recomendacion: 'pvpc' | 'libre' | 'ambas';
  if (puntosPvpc >= 4) {
    recomendacion = 'pvpc';
  } else if (puntosPvpc <= -3) {
    recomendacion = 'libre';
  } else {
    recomendacion = 'ambas';
  }

  const puntosLibre = -puntosPvpc;

  return {
    recomendacion,
    puntosPvpc: Math.max(0, puntosPvpc),
    puntosLibre: Math.max(0, puntosLibre),
    costeAnualPvpc: Math.round(costeAnualPvpc * 100) / 100,
    costeAnualLibre: Math.round(costeAnualLibre * 100) / 100,
    factores,
    consejos,
  };
}

// ─── Componente principal ──────────────────────────────────────────────────────

export default function SelectorTarifaElectricaPage() {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const totalRespondidas = Object.keys(respuestas).length;
  const todasRespondidas = totalRespondidas === PREGUNTAS.length;

  const handleRespuesta = (preguntaId: number, opcionIdx: number) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: opcionIdx }));
  };

  const handleVerResultado = () => {
    if (todasRespondidas) {
      setMostrarResultado(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleRepetir = () => {
    setRespuestas({});
    setMostrarResultado(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resultado = todasRespondidas ? calcularResultado(respuestas) : null;

  // Para las barras comparativas
  const maxPuntos = resultado
    ? Math.max(resultado.puntosPvpc, resultado.puntosLibre, 1)
    : 1;

  const etiquetaRecomendacion: Record<string, string> = {
    pvpc: 'PVPC (tarifa regulada)',
    libre: 'Mercado libre (precio fijo)',
    ambas: 'Ambas pueden funcionar para ti',
  };

  const iconoRecomendacion: Record<string, string> = {
    pvpc: '🏛️',
    libre: '🏪',
    ambas: '⚖️',
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">⚡</span> Selector de Tarifa Electrica
          </h1>
          <p className={styles.subtitle}>
            Responde 10 preguntas y descubre si te conviene mas PVPC o mercado libre
          </p>
        </header>

        <LegalNotice />

        <DisclaimerCard
          variant="financial"
          severity="high"
          context="selector-tarifa-electrica"
        >
          Esta herramienta ofrece una orientacion basada en patrones de consumo tipicos.
          Los precios PVPC varian diariamente y los del mercado libre dependen de cada
          comercializadora. Para una comparativa exacta, consulta tu factura actual y las
          ofertas disponibles en el <strong>comparador de la CNMC</strong>.
        </DisclaimerCard>

        {/* ─── RESULTADO ─── */}
        {mostrarResultado && resultado && (
          <div className={styles.resultScreen}>
            <div className={styles.resultHeader}>
              <div className={styles.resultIcon}>
                {iconoRecomendacion[resultado.recomendacion]}
              </div>
              <h2 className={styles.resultTitle}>Nuestra recomendacion</h2>
              <p className={styles.resultProfile}>
                {etiquetaRecomendacion[resultado.recomendacion]}
              </p>
            </div>

            {/* Barras comparativas */}
            <div className={styles.barsContainer}>
              <div className={styles.barRow}>
                <div className={styles.barLabel}>
                  <span>
                    🏛️ PVPC (regulada)
                    {resultado.costeAnualPvpc < resultado.costeAnualLibre && (
                      <span className={styles.winnerTag}>Mas barata</span>
                    )}
                  </span>
                  <span className={styles.barLabelCost}>
                    ~{formatCurrency(resultado.costeAnualPvpc)}/ano
                  </span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFillPvpc}
                    style={{
                      width: `${Math.max(15, (resultado.puntosPvpc / maxPuntos) * 100)}%`,
                    }}
                    role="img"
                    aria-label={`Puntuacion PVPC: ${resultado.puntosPvpc}`}
                  />
                </div>
              </div>

              <div className={styles.barRow}>
                <div className={styles.barLabel}>
                  <span>
                    🏪 Mercado libre
                    {resultado.costeAnualLibre < resultado.costeAnualPvpc && (
                      <span className={styles.winnerTag}>Mas barata</span>
                    )}
                  </span>
                  <span className={styles.barLabelCost}>
                    ~{formatCurrency(resultado.costeAnualLibre)}/ano
                  </span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFillLibre}
                    style={{
                      width: `${Math.max(15, (resultado.puntosLibre / maxPuntos) * 100)}%`,
                    }}
                    role="img"
                    aria-label={`Puntuacion mercado libre: ${resultado.puntosLibre}`}
                  />
                </div>
              </div>
            </div>

            {/* Factores clave */}
            <div className={styles.factorsSection}>
              <h3 className={styles.factorsTitle}>Factores clave en tu resultado</h3>
              <ul className={styles.factorsList}>
                {resultado.factores.map((factor, i) => (
                  <li key={i} className={styles.factorItem}>
                    <span className={styles.factorIcon} aria-hidden="true">📌</span>
                    {factor}
                  </li>
                ))}
              </ul>
            </div>

            {/* Consejos */}
            <div className={styles.tipsBox}>
              <h3>Consejos para tu perfil</h3>
              <ul className={styles.tipsList}>
                {resultado.consejos.map((consejo, i) => (
                  <li key={i}>{consejo}</li>
                ))}
              </ul>
            </div>

            <button
              type="button"
              className={styles.btnSecondary}
              onClick={handleRepetir}
            >
              Repetir test
            </button>
          </div>
        )}

        {/* ─── TEST ─── */}
        {!mostrarResultado && (
          <>
            <p className={styles.introText}>
              Responde segun tus habitos reales de consumo electrico. No hay respuestas
              correctas ni incorrectas — cada hogar tiene un perfil diferente.
            </p>

            {/* Progreso */}
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${(totalRespondidas / PREGUNTAS.length) * 100}%` }}
              />
            </div>
            <p className={styles.progressText}>
              {totalRespondidas} de {PREGUNTAS.length} preguntas respondidas
            </p>

            {/* Preguntas */}
            {PREGUNTAS.map((pregunta) => (
              <div key={pregunta.id} className={styles.questionCard}>
                <span className={styles.questionNumber}>
                  Pregunta {pregunta.id} de {PREGUNTAS.length}
                </span>
                <p className={styles.questionText}>{pregunta.texto}</p>
                <div
                  className={styles.optionsGroup}
                  role="radiogroup"
                  aria-label={`Pregunta ${pregunta.id}`}
                >
                  {pregunta.opciones.map((opcion, idx) => (
                    <button
                      type="button"
                      key={idx}
                      className={`${styles.optionBtn} ${
                        respuestas[pregunta.id] === idx ? styles.optionBtnSelected : ''
                      }`}
                      onClick={() => handleRespuesta(pregunta.id, idx)}
                      role="radio"
                      aria-checked={respuestas[pregunta.id] === idx ? 'true' : 'false'}
                      aria-label={opcion.texto}
                    >
                      {opcion.texto}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Boton ver resultado */}
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleVerResultado}
              disabled={!todasRespondidas}
              aria-label={
                todasRespondidas
                  ? 'Ver recomendacion'
                  : `Responde las ${PREGUNTAS.length - totalRespondidas} preguntas restantes`
              }
            >
              {todasRespondidas
                ? 'Ver recomendacion'
                : `Responde las ${PREGUNTAS.length - totalRespondidas} preguntas restantes`}
            </button>
          </>
        )}

        {/* ─── CONTENIDO EDUCATIVO v2.0 ─── */}
        <EducationalSection
          title="Tarifas electricas en Espana: guia completa"
          subtitle="PVPC, mercado libre y como elegir la mejor opcion"
        >
          {/* PVPC explicado */}
          <section className={styles.guideSection}>
            <h2>¿Que es la PVPC (tarifa regulada)?</h2>
            <div className={styles.contentGrid}>
              <div className={styles.contentCard}>
                <h4>Precio variable por horas</h4>
                <p>
                  La PVPC (Precio Voluntario para el Pequeno Consumidor) es la tarifa regulada
                  por el Gobierno. El precio del kWh cambia cada hora segun el mercado mayorista
                  de electricidad. Puedes consultarlo en la web de Red Electrica (ESIOS).
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>Tres franjas horarias (2.0TD)</h4>
                <p>
                  <strong>Punta</strong> (la mas cara): 10-14h y 18-22h entre semana.{' '}
                  <strong>Llano</strong>: 8-10h, 14-18h y 22-00h entre semana.{' '}
                  <strong>Valle</strong> (la mas barata): 00-08h entre semana y todo el
                  fin de semana y festivos nacionales.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>Para quien es ideal</h4>
                <p>
                  Hogares que pueden concentrar su consumo en horas valle: cargar coche electrico
                  de noche, poner lavadora en fin de semana, o que tienen placas solares con
                  compensacion de excedentes. Tambien para consumos bajos (&lt;200 kWh/mes).
                </p>
              </div>
            </div>
          </section>

          {/* Mercado libre explicado */}
          <section className={styles.guideSection}>
            <h2>¿Que es el mercado libre?</h2>
            <div className={styles.contentGrid}>
              <div className={styles.contentCard}>
                <h4>Precio fijo pactado</h4>
                <p>
                  En el mercado libre, la comercializadora te ofrece un precio fijo por kWh
                  (normalmente entre 0,16 y 0,20 euros) que no varia con el mercado mayorista.
                  Sabes exactamente cuanto pagaras cada mes por tu consumo.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>Servicios adicionales</h4>
                <p>
                  Muchas comercializadoras incluyen servicios extra: mantenimiento de caldera,
                  seguro del hogar, energia 100% renovable certificada, app de seguimiento
                  de consumo, o descuentos por permanencia.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>Para quien es ideal</h4>
                <p>
                  Hogares con consumo repartido a lo largo del dia (teletrabajo, familias
                  numerosas), quienes valoran la previsibilidad en la factura, o quienes
                  no quieren preocuparse de en que hora ponen la lavadora.
                </p>
              </div>
            </div>
          </section>

          {/* Tabla comparativa */}
          <section className={styles.comparativaSection}>
            <h2>Comparativa: PVPC vs Mercado libre</h2>
            <p className={styles.comparativaSubtitle}>
              Diferencias clave entre ambas opciones
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Criterio</th>
                    <th>🏛️ PVPC</th>
                    <th>🏪 Mercado libre</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Precio</strong></td>
                    <td>Variable cada hora</td>
                    <td>Fijo (pactado)</td>
                  </tr>
                  <tr>
                    <td><strong>Regulacion</strong></td>
                    <td>Gobierno (BOE)</td>
                    <td>Comercializadora privada</td>
                  </tr>
                  <tr>
                    <td><strong>Franjas horarias</strong></td>
                    <td>3 periodos (punta/llano/valle)</td>
                    <td>Normalmente precio plano</td>
                  </tr>
                  <tr>
                    <td><strong>Permanencia</strong></td>
                    <td>Sin permanencia</td>
                    <td>Puede tener permanencia</td>
                  </tr>
                  <tr>
                    <td><strong>Previsibilidad</strong></td>
                    <td>Baja (depende del mercado)</td>
                    <td>Alta (precio conocido)</td>
                  </tr>
                  <tr>
                    <td><strong>Excedentes solares</strong></td>
                    <td>Compensacion a precio horario</td>
                    <td>Segun la oferta contratada</td>
                  </tr>
                  <tr>
                    <td><strong>Bono Social</strong></td>
                    <td>Si, disponible</td>
                    <td>No disponible</td>
                  </tr>
                  <tr>
                    <td><strong>Ideal para</strong></td>
                    <td>Consumo en valle / bajo consumo</td>
                    <td>Consumo repartido / tranquilidad</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 4 Perfiles de consumidor */}
          <section className={styles.profilesSection}>
            <h2>4 perfiles de consumidor</h2>
            <p className={styles.profilesSubtitle}>
              Descubre cual se parece mas a tu hogar
            </p>
            <div className={styles.profilesGrid}>
              <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                  <span className={styles.profileIcon} aria-hidden="true">🌙</span>
                  <h3>Amante del valle</h3>
                </div>
                <div className={styles.profileExample}>
                  <p>Perfil:</p>
                  <code>Carga coche electrico de noche. Pone lavadora y lavavajillas en fin de semana. Consume poco entre semana de dia.</code>
                </div>
                <p className={styles.profileRecommendation}>
                  <strong>Recomendacion:</strong> PVPC. Puede ahorrar entre un 20% y un 35% respecto
                  al mercado libre al concentrar el consumo en las horas mas baratas.
                </p>
              </div>

              <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                  <span className={styles.profileIcon} aria-hidden="true">📊</span>
                  <h3>Consumo plano</h3>
                </div>
                <div className={styles.profileExample}>
                  <p>Perfil:</p>
                  <code>Familia con ninos. Consumo repartido durante todo el dia. Cocina, calefaccion, TV, trabajo desde casa.</code>
                </div>
                <p className={styles.profileRecommendation}>
                  <strong>Recomendacion:</strong> Mercado libre. Al tener consumo en todas las
                  franjas, el precio fijo suele ser mas ventajoso que pagar punta a 0,22 euros/kWh.
                </p>
              </div>

              <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                  <span className={styles.profileIcon} aria-hidden="true">🔥</span>
                  <h3>Pico en punta</h3>
                </div>
                <div className={styles.profileExample}>
                  <p>Perfil:</p>
                  <code>Cocina al mediodia. Aire acondicionado por la tarde. Teletrabajo. Consumo alto entre 10h y 22h.</code>
                </div>
                <p className={styles.profileRecommendation}>
                  <strong>Recomendacion:</strong> Mercado libre. El consumo concentrado en horas punta
                  hace que el PVPC sea significativamente mas caro que un precio fijo plano.
                </p>
              </div>

              <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                  <span className={styles.profileIcon} aria-hidden="true">☀️</span>
                  <h3>Hogar solar</h3>
                </div>
                <div className={styles.profileExample}>
                  <p>Perfil:</p>
                  <code>Placas solares con excedentes. Autoconsumo de dia. Vierte excedentes a la red en horas de sol.</code>
                </div>
                <p className={styles.profileRecommendation}>
                  <strong>Recomendacion:</strong> PVPC. La compensacion de excedentes se paga a precio
                  horario del mercado, que en horas de sol (punta/llano) suele ser mas favorable.
                </p>
              </div>
            </div>
          </section>

          {/* Preguntas frecuentes */}
          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqGrid}>
              <details className={styles.faqItem}>
                <summary>¿Puedo cambiar de PVPC a mercado libre y viceversa?</summary>
                <p>
                  Si, puedes cambiar en cualquier momento y sin coste. El cambio de mercado libre
                  a PVPC es inmediato (salvo permanencia contractual). El cambio de PVPC a libre
                  se tramita con la nueva comercializadora y suele tardar 2-3 semanas. No hay
                  corte de suministro durante el proceso.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Que es el Bono Social y como puedo solicitarlo?</summary>
                <p>
                  El Bono Social es un descuento del 25% (o 40% para consumidores vulnerables
                  severos) sobre la factura PVPC. Solo esta disponible en la tarifa regulada.
                  Para solicitarlo, debes cumplir requisitos de renta y solicitarlo a tu
                  comercializadora de referencia (la que aparece en tu zona).
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Las franjas horarias cambian en verano?</summary>
                <p>
                  No. Las franjas horarias de la 2.0TD son fijas todo el ano: punta (10-14h y
                  18-22h L-V), llano (8-10h, 14-18h y 22-00h L-V) y valle (00-08h L-V y todo
                  sabado, domingo y festivo nacional). No hay cambio estacional.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Los festivos locales cuentan como valle?</summary>
                <p>
                  No. Solo los festivos nacionales (14 al ano) tienen tarifa valle las 24 horas.
                  Los festivos autonomicos y locales se tarifica como dia laborable normal.
                  Consulta el calendario oficial de Red Electrica para las fechas exactas.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿La potencia contratada afecta a la eleccion?</summary>
                <p>
                  La potencia tiene el mismo coste tanto en PVPC como en mercado libre (salvo
                  ofertas especificas). Lo que si influye es el numero de periodos: la 2.0TD
                  tiene 2 periodos de potencia (P1 diurno y P2 nocturno). Si tu potencia P2
                  es baja, asegurate de que los electrodomesticos de noche no salten el ICP.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Merece la pena contratar tarifa nocturna si no tengo coche electrico?</summary>
                <p>
                  No necesitas coche electrico para beneficiarte del valle. Si puedes programar
                  lavadora, lavavajillas, secadora y acumulador de agua caliente para las horas
                  nocturnas o fines de semana, el ahorro con PVPC puede ser notable incluso sin
                  vehiculo electrico. La clave es que al menos el 40-50% de tu consumo sea en valle.
                </p>
              </details>
            </div>
          </section>

          {/* Consejos para ahorrar */}
          <section className={styles.tipsSection}>
            <h2>Consejos para ahorrar en electricidad</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIconEdu} aria-hidden="true">⏰</span>
                <h3>Programa electrodomesticos</h3>
                <p>
                  Usa los temporizadores de lavadora y lavavajillas para que funcionen
                  entre las 00:00 y las 08:00 o en fin de semana.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIconEdu} aria-hidden="true">🌡️</span>
                <h3>Temperatura inteligente</h3>
                <p>
                  Calefaccion a 20-21 grados y aire acondicionado a 25-26 grados. Cada grado
                  de diferencia supone un 7% mas de consumo.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIconEdu} aria-hidden="true">💡</span>
                <h3>Iluminacion LED</h3>
                <p>
                  Cambiar a LED reduce el consumo en iluminacion un 80%. Una bombilla LED
                  de 10W equivale a una incandescente de 60W.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIconEdu} aria-hidden="true">🔌</span>
                <h3>Elimina el stand-by</h3>
                <p>
                  Los aparatos en stand-by consumen entre 50 y 100 euros al ano. Usa
                  regletas con interruptor para apagarlos de verdad.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIconEdu} aria-hidden="true">📱</span>
                <h3>Monitoriza tu consumo</h3>
                <p>
                  Instala la app i-DE o e-distribucion (segun tu distribuidora) para ver
                  tu consumo real por horas y detectar picos innecesarios.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIconEdu} aria-hidden="true">📋</span>
                <h3>Revisa tu potencia</h3>
                <p>
                  Muchos hogares tienen mas potencia contratada de la que necesitan.
                  Bajar de 5,75 a 4,6 kW puede ahorrar 40-60 euros al ano.
                </p>
              </div>
            </div>
          </section>

          {/* Warning Box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Errores comunes al elegir tarifa electrica</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>&quot;La PVPC siempre es mas barata&quot;.</strong> Depende de tu patron
                de consumo. Si la mayor parte de tu gasto es en horas punta, el mercado libre
                con precio plano puede ser mas economico. La PVPC solo es claramente ventajosa
                si concentras consumo en valle.
              </li>
              <li>
                <strong>&quot;El mercado libre es una estafa&quot;.</strong> Hay ofertas buenas
                y malas. La clave es comparar en el comparador oficial de la CNMC
                (comparador.cnmc.gob.es) y leer bien las condiciones: permanencia, servicios
                incluidos y precio real por kWh.
              </li>
              <li>
                <strong>&quot;Las franjas horarias son iguales todo el ano&quot;.</strong> Las
                franjas de la 2.0TD no cambian, pero el precio PVPC si varia mucho segun la
                epoca: en invierno y verano (alta demanda) suele ser mas caro, mientras que
                primavera y otono suelen tener precios mas bajos.
              </li>
              <li>
                <strong>&quot;Solo importa el precio del kWh&quot;.</strong> El termino de
                potencia supone entre el 30% y el 40% de la factura. Optimizar la potencia
                contratada puede ahorrar mas que cambiar de tarifa. Revisa si tu potencia
                P1 y P2 estan bien ajustadas.
              </li>
              <li>
                <strong>&quot;Cambiar de tarifa es complicado&quot;.</strong> En realidad
                es gratuito, no hay corte de suministro y se puede hacer online. El proceso
                tarda entre 1 y 3 semanas. No necesitas cambiar el contador ni hacer ninguna
                instalacion.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('selector-tarifa-electrica')} />
        <ShareCard appName="selector-tarifa-electrica" />
        <Footer appName="selector-tarifa-electrica" />
    </div>
  );
}
