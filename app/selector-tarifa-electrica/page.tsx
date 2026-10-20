'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './SelectorTarifaElectrica.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  DisclaimerCard,
  LegalNotice,
  ShareCard,
  RegionBadge,
} from '@/components';
import { CATEGORIAS_AYUDAS_PERSONAS } from '@/data/fiscal/ayudas-personas';
import { PREGUNTA_CAMBIO_TARIFA, RESPUESTA_CAMBIO_TARIFA } from './metadata';

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
  factores: string[];
  consejos: string[];
}

// ─── Sin estimación de coste (hallazgos 3166, 3167 y 3174, decisión del usuario 12/10/2026) ───
// La app estimaba un «~X €/año» y marcaba una opción como «Más barata» con precios escritos a mano
// («media 2024-2025») y la potencia sin multiplicar por los kW: esa estimación contradecía la
// recomendación en el 82 % de los perfiles que recibían «Mercado libre». Se retiró hasta tener los
// precios en un módulo de data/ con fuente, fecha y <DataReference>; la recomendación es por
// perfil de consumo y la pantalla dice que no compara precios.

// El Bono Social se describe con lo que dice data/fiscal, que no da cuantías y remite a la web
// oficial: la FAQ daba «un descuento del 25 % (o 40 %…)» escrito a mano, sin fuente ni fecha
// (hallazgo 3175).
const BONO_SOCIAL = CATEGORIAS_AYUDAS_PERSONAS.find((a) => a.id === 'bono-social-electrico');

// ─── Preguntas del test ────────────────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  {
    id: 1,
    texto: '¿Cuántas personas viven en tu hogar?',
    opciones: [
      { texto: '1 persona', pvpcPuntos: 1 },
      { texto: '2 personas', pvpcPuntos: 0 },
      { texto: '3-4 personas', pvpcPuntos: -1 },
      { texto: '5 o más', pvpcPuntos: -2 },
    ],
  },
  {
    id: 2,
    texto: '¿Tienes tarifa con discriminación horaria (2.0TD)?',
    opciones: [
      { texto: 'Sí', pvpcPuntos: 2 },
      { texto: 'No', pvpcPuntos: -1 },
      { texto: 'No sé', pvpcPuntos: 0 },
    ],
  },
  {
    id: 3,
    texto: '¿A qué hora sueles cocinar?',
    opciones: [
      { texto: 'Mediodía (12-15 h)', pvpcPuntos: -2 },
      { texto: 'Noche (20-22 h)', pvpcPuntos: -1 },
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
      { texto: 'Sí, mucho', pvpcPuntos: -2 },
      { texto: 'Sí, poco', pvpcPuntos: 0 },
      { texto: 'No tengo', pvpcPuntos: 1 },
    ],
  },
  {
    id: 6,
    texto: '¿Tienes coche eléctrico que cargues en casa?',
    opciones: [
      { texto: 'Sí', pvpcPuntos: 3 },
      { texto: 'No', pvpcPuntos: 0 },
    ],
  },
  {
    id: 7,
    texto: '¿Trabajas desde casa?',
    opciones: [
      { texto: 'Sí, siempre', pvpcPuntos: -2 },
      { texto: 'Híbrido', pvpcPuntos: -1 },
      { texto: 'No', pvpcPuntos: 1 },
    ],
  },
  {
    id: 8,
    texto: '¿Te importa que el precio varíe cada hora?',
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
      { texto: 'Más de 400 kWh', pvpcPuntos: -1 },
    ],
  },
  {
    id: 10,
    texto: '¿Tienes placas solares con excedentes?',
    opciones: [
      { texto: 'Sí', pvpcPuntos: 3 },
      { texto: 'No', pvpcPuntos: 0 },
    ],
  },
];

// ─── Función de cálculo ────────────────────────────────────────────────────────

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

  // Factores según respuestas
  const r = respuestas;

  // Coche eléctrico
  if (r[6] === 0) {
    factores.push('Cargar el coche eléctrico en valle (00-08 h) reduce mucho el coste con PVPC');
    consejos.push('Programa la carga del coche entre las 00:00 y las 08:00 para aprovechar el valle');
  }

  // Placas solares
  if (r[10] === 0) {
    factores.push('Con placas solares, la compensación de excedentes funciona mejor en PVPC');
    consejos.push('Maximiza el autoconsumo y vierte excedentes en horas punta para mayor compensación');
  }

  // Electrodomésticos en valle
  if (r[4] === 0) {
    factores.push('Usar electrodomésticos siempre en valle te da una gran ventaja en PVPC');
    consejos.push('Mantener la lavadora y el lavavajillas en horario nocturno o de fin de semana');
  } else if (r[4] === 2) {
    factores.push('No usar electrodomésticos en valle reduce la ventaja del PVPC');
    consejos.push('Intenta programar lavadora y lavavajillas para la noche o fines de semana');
  }

  // Teletrabajo
  if (r[7] === 0) {
    factores.push('Trabajar desde casa aumenta el consumo en horas punta (mayor coste PVPC)');
    consejos.push('Si teletrabajas, valora un precio fijo que te dé tranquilidad');
  }

  // Cocinar en horas punta
  if (r[3] === 0) {
    factores.push('Cocinar al mediodía cae en franja punta (la más cara en PVPC)');
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
    consejos.push('Programa el aire acondicionado para que enfríe antes de las 18:00 y mantén la temperatura a 25-26 grados');
  }

  // Consumo bajo
  if (r[9] === 0) {
    factores.push('Con consumo bajo, el ahorro del PVPC en valle es muy significativo proporcionalmente');
  }

  // Si no hay factores específicos, añadir genérico
  if (factores.length === 0) {
    factores.push('Tu perfil de consumo es equilibrado entre ambas opciones');
  }

  // Consejos genéricos siempre
  consejos.push('Revisa tu factura actual para conocer tu consumo real por franjas horarias');
  consejos.push('Consulta el comparador de la CNMC (comparador.cnmc.gob.es) para ofertas actualizadas');

  // Determinar recomendación
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
    factores,
    consejos,
  };
}

/** «Responde las N preguntas restantes», con su singular (hallazgo 3176: «las 1 preguntas»). */
function textoPendientes(pendientes: number): string {
  return pendientes === 1
    ? 'Responde la pregunta que falta'
    : `Responde las ${pendientes} preguntas restantes`;
}

// ─── Componente principal ──────────────────────────────────────────────────────

export default function SelectorTarifaElectricaPage() {
  const [respuestas, setRespuestas] = useState<Record<number, number>>({});
  const [mostrarResultado, setMostrarResultado] = useState(false);

  // «Ver recomendación» y «Repetir test» desmontan el botón que tenía el foco, que caía a <body>,
  // y el scrollTo({ top: 0 }) dejaba el resultado bajo el pliegue en móvil (hallazgo 3168). Como
  // en la referencia de la familia (selector-smartphone, 1679), el foco va al encabezado del
  // resultado o a la primera pregunta, y eso los desplaza a la vista. Solo tras un clic: al
  // cargar la página no se mueve nada.
  const tituloResultado = useRef<HTMLHeadingElement>(null);
  const primeraPregunta = useRef<HTMLParagraphElement>(null);
  const enfocarTras = useRef(false);

  useEffect(() => {
    if (!enfocarTras.current) return;
    enfocarTras.current = false;
    if (mostrarResultado) tituloResultado.current?.focus();
    else primeraPregunta.current?.focus();
  }, [mostrarResultado]);

  const totalRespondidas = Object.keys(respuestas).length;
  const todasRespondidas = totalRespondidas === PREGUNTAS.length;

  const handleRespuesta = (preguntaId: number, opcionIdx: number) => {
    setRespuestas((prev) => ({ ...prev, [preguntaId]: opcionIdx }));
  };

  /**
   * Teclado del patrón de radios (WAI-ARIA APG, cabo C0016, hallazgo 3171): las flechas mueven
   * el foco a la opción vecina y la marcan, con vuelta al principio, e Inicio/Fin van a los
   * extremos. Cada grupo es UNA parada de Tab (tabindex itinerante). Receta de selector-smartphone
   * (hallazgo 1681).
   */
  const teclaEnOpcion = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    pregunta: Pregunta,
    indice: number,
  ) => {
    const total = pregunta.opciones.length;
    let destino: number;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') destino = (indice + 1) % total;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') destino = (indice - 1 + total) % total;
    else if (e.key === 'Home') destino = 0;
    else if (e.key === 'End') destino = total - 1;
    else return;
    e.preventDefault();
    handleRespuesta(pregunta.id, destino);
    const radios = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    radios?.[destino]?.focus();
  };

  const handleVerResultado = () => {
    if (todasRespondidas) {
      enfocarTras.current = true;
      setMostrarResultado(true);
    }
  };

  const handleRepetir = () => {
    enfocarTras.current = true;
    setRespuestas({});
    setMostrarResultado(false);
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
            <span aria-hidden="true">⚡</span> Selector de Tarifa Eléctrica
          </h1>
          <p className={styles.subtitle}>
            Responde 10 preguntas y descubre si te conviene más PVPC o mercado libre
          </p>
        </header>

        {/* PVPC, peajes 2.0TD, comercializadoras de referencia y CNMC solo existen en España, y
            la mitad del público es latinoamericano (hallazgo 3178). La regulación es eléctrica,
            no fiscal: Delegum no es la fuente de nada de lo que dice la app. */}
        <RegionBadge
          variant="es-only"
          text="Solo España: PVPC, peajes 2.0TD y comparador de la CNMC son de la regulación eléctrica española"
          fuenteDelegum={false}
        />

        <LegalNotice />

        <DisclaimerCard
          variant="financial"
          severity="high"
          context="selector-tarifa-electrica"
        >
          Esta herramienta ofrece una orientación basada en patrones de consumo típicos.
          Los precios PVPC varían diariamente y los del mercado libre dependen de cada
          comercializadora. Para una comparativa exacta, consulta tu factura actual y las
          ofertas disponibles en el <strong>comparador de la CNMC</strong>.
        </DisclaimerCard>

        {/* ─── RESULTADO ─── */}
        {mostrarResultado && resultado && (
          <div className={styles.resultScreen}>
            <div className={styles.resultHeader}>
              <div className={styles.resultIcon} aria-hidden="true">
                {iconoRecomendacion[resultado.recomendacion]}
              </div>
              <h2 className={styles.resultTitle} ref={tituloResultado} tabIndex={-1}>
                Nuestra recomendación
              </h2>
              <p className={styles.resultProfile}>
                {etiquetaRecomendacion[resultado.recomendacion]}
              </p>
            </div>

            {/* Barras comparativas: miden cuánto apunta el perfil a cada opción, no precios */}
            <div className={styles.barsContainer}>
              <p className={styles.barsNota}>
                Cuánto apunta tu perfil de consumo a cada opción. No es una comparación de
                precios: para saber cuál te sale más barata, compara tu factura con las ofertas
                del comparador de la CNMC.
              </p>
              <div className={styles.barRow}>
                <div className={styles.barLabel}>
                  <span>
                    <span aria-hidden="true">🏛️</span> PVPC (regulada)
                  </span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFillPvpc}
                    style={{
                      width: `${Math.max(15, (resultado.puntosPvpc / maxPuntos) * 100)}%`,
                    }}
                    role="img"
                    aria-label={`Puntuación PVPC: ${resultado.puntosPvpc}`}
                  />
                </div>
              </div>

              <div className={styles.barRow}>
                <div className={styles.barLabel}>
                  <span>
                    <span aria-hidden="true">🏪</span> Mercado libre
                  </span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFillLibre}
                    style={{
                      width: `${Math.max(15, (resultado.puntosLibre / maxPuntos) * 100)}%`,
                    }}
                    role="img"
                    aria-label={`Puntuación mercado libre: ${resultado.puntosLibre}`}
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
              Responde según tus hábitos reales de consumo eléctrico. No hay respuestas
              correctas ni incorrectas: cada hogar tiene un perfil diferente.
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
            {PREGUNTAS.map((pregunta, posicion) => {
              const marcada = respuestas[pregunta.id];
              return (
                <div key={pregunta.id} className={styles.questionCard}>
                  <span className={styles.questionNumber}>
                    Pregunta {pregunta.id} de {PREGUNTAS.length}
                  </span>
                  {/* El grupo se llama como su enunciado: con aria-label «Pregunta N» el lector
                      anunciaba «Pregunta 2, grupo» y luego «Sí / No / No sé» (hallazgo 3170). */}
                  <p
                    id={`pregunta-${pregunta.id}-texto`}
                    className={styles.questionText}
                    ref={posicion === 0 ? primeraPregunta : undefined}
                    tabIndex={posicion === 0 ? -1 : undefined}
                  >
                    {pregunta.texto}
                  </p>
                  <div
                    className={styles.optionsGroup}
                    role="radiogroup"
                    aria-labelledby={`pregunta-${pregunta.id}-texto`}
                  >
                    {pregunta.opciones.map((opcion, idx) => (
                      <button
                        type="button"
                        key={idx}
                        className={`${styles.optionBtn} ${
                          marcada === idx ? styles.optionBtnSelected : ''
                        }`}
                        onClick={() => handleRespuesta(pregunta.id, idx)}
                        onKeyDown={(e) => teclaEnOpcion(e, pregunta, idx)}
                        role="radio"
                        aria-checked={marcada === idx ? 'true' : 'false'}
                        // Tabindex itinerante: la marcada, o la primera si no hay ninguna (3171).
                        tabIndex={marcada === undefined ? (idx === 0 ? 0 : -1) : marcada === idx ? 0 : -1}
                      >
                        {opcion.texto}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Botón ver resultado */}
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleVerResultado}
              disabled={!todasRespondidas}
            >
              {todasRespondidas
                ? 'Ver recomendación'
                : textoPendientes(PREGUNTAS.length - totalRespondidas)}
            </button>
          </>
        )}

        {/* ─── CONTENIDO EDUCATIVO v2.0 ─── */}
        <EducationalSection
          title="Tarifas eléctricas en España: guía completa"
          subtitle="PVPC, mercado libre y cómo elegir la mejor opción"
        >
          {/* PVPC explicado */}
          <section className={styles.guideSection}>
            <h2>¿Qué es el PVPC (tarifa regulada)?</h2>
            <div className={styles.contentGrid}>
              <div className={styles.contentCard}>
                <h4>Precio variable por horas</h4>
                <p>
                  El PVPC (Precio Voluntario para el Pequeño Consumidor) es la tarifa regulada
                  por el Gobierno. El precio del kWh cambia cada hora según el mercado mayorista
                  de electricidad. Puedes consultarlo en la web de Red Eléctrica (ESIOS).
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>Tres franjas horarias (2.0TD)</h4>
                <p>
                  <strong>Punta</strong> (la más cara): 10-14 h y 18-22 h entre semana.{' '}
                  <strong>Llano</strong>: 8-10 h, 14-18 h y 22-24 h entre semana.{' '}
                  <strong>Valle</strong> (la más barata): 0-8 h entre semana y todo el
                  fin de semana y festivos nacionales.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>Para quién es ideal</h4>
                <p>
                  Hogares que pueden concentrar su consumo en horas valle: cargar el coche
                  eléctrico de noche, poner la lavadora en fin de semana, o que tienen placas
                  solares con compensación de excedentes. También para consumos bajos
                  (&lt;200 kWh/mes).
                </p>
              </div>
            </div>
          </section>

          {/* Mercado libre explicado */}
          <section className={styles.guideSection}>
            <h2>¿Qué es el mercado libre?</h2>
            <div className={styles.contentGrid}>
              <div className={styles.contentCard}>
                <h4>Precio fijo pactado</h4>
                <p>
                  En el mercado libre, la comercializadora te ofrece un precio fijo por kWh
                  que no varía con el mercado mayorista.
                  Sabes exactamente cuánto pagarás cada mes por tu consumo.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>Servicios adicionales</h4>
                <p>
                  Muchas comercializadoras incluyen servicios extra: mantenimiento de caldera,
                  seguro del hogar, energía 100&nbsp;% renovable certificada, app de seguimiento
                  de consumo, o descuentos por permanencia.
                </p>
              </div>
              <div className={styles.contentCard}>
                <h4>Para quién es ideal</h4>
                <p>
                  Hogares con consumo repartido a lo largo del día (teletrabajo, familias
                  numerosas), quienes valoran la previsibilidad en la factura, o quienes
                  no quieren preocuparse de a qué hora ponen la lavadora.
                </p>
              </div>
            </div>
          </section>

          {/* Tabla comparativa */}
          <section className={styles.comparativaSection}>
            <h2>Comparativa: PVPC vs. mercado libre</h2>
            <p className={styles.comparativaSubtitle}>
              Diferencias clave entre ambas opciones
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Criterio</th>
                    <th><span aria-hidden="true">🏛️</span> PVPC</th>
                    <th><span aria-hidden="true">🏪</span> Mercado libre</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Precio</strong></td>
                    <td>Variable cada hora</td>
                    <td>Fijo (pactado)</td>
                  </tr>
                  <tr>
                    <td><strong>Regulación</strong></td>
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
                    <td>Compensación a precio horario</td>
                    <td>Según la oferta contratada</td>
                  </tr>
                  <tr>
                    <td><strong>Bono Social</strong></td>
                    <td>Sí, disponible</td>
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
              Descubre cuál se parece más a tu hogar
            </p>
            <div className={styles.profilesGrid}>
              <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                  <span className={styles.profileIcon} aria-hidden="true">🌙</span>
                  <h3>Amante del valle</h3>
                </div>
                <div className={styles.profileExample}>
                  <p>Perfil:</p>
                  <code>Carga el coche eléctrico de noche. Pone lavadora y lavavajillas en fin de semana. Consume poco entre semana de día.</code>
                </div>
                <p className={styles.profileRecommendation}>
                  <strong>Recomendación:</strong> PVPC. Concentrar el consumo en las horas más
                  baratas es justo lo que el precio por franjas premia.
                </p>
              </div>

              <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                  <span className={styles.profileIcon} aria-hidden="true">📊</span>
                  <h3>Consumo plano</h3>
                </div>
                <div className={styles.profileExample}>
                  <p>Perfil:</p>
                  <code>Familia con niños. Consumo repartido durante todo el día. Cocina, calefacción, TV, trabajo desde casa.</code>
                </div>
                <p className={styles.profileRecommendation}>
                  <strong>Recomendación:</strong> Mercado libre. Al tener consumo en todas las
                  franjas, el precio fijo suele ser más ventajoso que pagar la franja punta, la más cara.
                </p>
              </div>

              <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                  <span className={styles.profileIcon} aria-hidden="true">🔥</span>
                  <h3>Pico en punta</h3>
                </div>
                <div className={styles.profileExample}>
                  <p>Perfil:</p>
                  <code>Cocina al mediodía. Aire acondicionado por la tarde. Teletrabajo. Consumo alto entre las 10 y las 22 h.</code>
                </div>
                <p className={styles.profileRecommendation}>
                  <strong>Recomendación:</strong> Mercado libre. El consumo concentrado en horas punta
                  hace que el PVPC sea significativamente más caro que un precio fijo plano.
                </p>
              </div>

              <div className={styles.profileCard}>
                <div className={styles.profileHeader}>
                  <span className={styles.profileIcon} aria-hidden="true">☀️</span>
                  <h3>Hogar solar</h3>
                </div>
                <div className={styles.profileExample}>
                  <p>Perfil:</p>
                  <code>Placas solares con excedentes. Autoconsumo de día. Vierte excedentes a la red en horas de sol.</code>
                </div>
                <p className={styles.profileRecommendation}>
                  <strong>Recomendación:</strong> PVPC. La compensación de excedentes se paga a precio
                  horario del mercado, que en horas de sol (punta/llano) suele ser más favorable.
                </p>
              </div>
            </div>
          </section>

          {/* Preguntas frecuentes */}
          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqGrid}>
              <details className={styles.faqItem}>
                {/* La misma constante que el FAQPage de metadata.ts (hallazgo 3173) */}
                <summary>{PREGUNTA_CAMBIO_TARIFA}</summary>
                <p>{RESPUESTA_CAMBIO_TARIFA}</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Qué es el Bono Social y cómo puedo solicitarlo?</summary>
                <p>
                  {BONO_SOCIAL
                    ? `${BONO_SOCIAL.descripcion} ${BONO_SOCIAL.comoFunciona} Solo existe en la tarifa regulada. `
                    : 'Es un descuento en la factura de la luz para hogares vulnerables, solo en la tarifa regulada. '}
                  Requisitos y cuantías vigentes en{' '}
                  <a href="https://www.bonosocial.gob.es" target="_blank" rel="noopener noreferrer">
                    bonosocial.gob.es
                  </a>
                  .
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Las franjas horarias cambian en verano?</summary>
                <p>
                  No. Las franjas horarias de la 2.0TD son fijas todo el año: punta (10-14 h y
                  18-22 h de lunes a viernes), llano (8-10 h, 14-18 h y 22-24 h de lunes a
                  viernes) y valle (0-8 h de lunes a viernes y todo el sábado, domingo y festivo
                  nacional). No hay cambio estacional.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Los festivos locales cuentan como valle?</summary>
                <p>
                  No. Solo los festivos nacionales tienen tarifa valle las 24 horas. Los festivos
                  autonómicos y locales se tarifican como día laborable normal. Consulta el
                  calendario oficial de Red Eléctrica para las fechas exactas.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿La potencia contratada afecta a la elección?</summary>
                <p>
                  La potencia tiene el mismo coste tanto en PVPC como en mercado libre (salvo
                  ofertas específicas). Lo que sí influye es el número de periodos: la 2.0TD
                  tiene 2 periodos de potencia (P1 diurno y P2 nocturno). Si tu potencia P2
                  es baja, asegúrate de que los electrodomésticos de noche no salten el ICP.
                </p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Merece la pena contratar tarifa nocturna si no tengo coche eléctrico?</summary>
                <p>
                  No necesitas coche eléctrico para beneficiarte del valle. Si puedes programar
                  lavadora, lavavajillas, secadora y acumulador de agua caliente para las horas
                  nocturnas o fines de semana, el ahorro con PVPC puede ser notable incluso sin
                  vehículo eléctrico. La clave es que al menos el 40-50&nbsp;% de tu consumo sea en valle.
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
                <h3>Programa los electrodomésticos</h3>
                <p>
                  Usa los temporizadores de lavadora y lavavajillas para que funcionen
                  entre las 00:00 y las 08:00 o en fin de semana.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIconEdu} aria-hidden="true">🌡️</span>
                <h3>Temperatura inteligente</h3>
                <p>
                  Calefacción a 20-21 grados y aire acondicionado a 25-26 grados. Cada grado
                  de diferencia supone un 7&nbsp;% más de consumo.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIconEdu} aria-hidden="true">💡</span>
                <h3>Iluminación LED</h3>
                <p>
                  Cambiar a LED reduce el consumo en iluminación un 80&nbsp;%. Una bombilla LED
                  de 10 W equivale a una incandescente de 60 W.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIconEdu} aria-hidden="true">🔌</span>
                <h3>Elimina el stand-by</h3>
                <p>
                  Los aparatos en stand-by consumen entre 50 y 100 euros al año. Usa
                  regletas con interruptor para apagarlos de verdad.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIconEdu} aria-hidden="true">📱</span>
                <h3>Monitoriza tu consumo</h3>
                <p>
                  Instala la app i-DE o e-distribución (según tu distribuidora) para ver
                  tu consumo real por horas y detectar picos innecesarios.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIconEdu} aria-hidden="true">📋</span>
                <h3>Revisa tu potencia</h3>
                <p>
                  Muchos hogares tienen más potencia contratada de la que necesitan.
                  Ajustarla a lo que de verdad usas baja el término fijo de todas las facturas.
                </p>
              </div>
            </div>
          </section>

          {/* Warning Box */}
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>Errores comunes al elegir tarifa eléctrica</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>&quot;El PVPC siempre es más barato&quot;.</strong> Depende de tu patrón
                de consumo. Si la mayor parte de tu gasto es en horas punta, el mercado libre
                con precio plano puede ser más económico. El PVPC solo es claramente ventajoso
                si concentras consumo en valle.
              </li>
              <li>
                <strong>&quot;El mercado libre es una estafa&quot;.</strong> Hay ofertas buenas
                y malas. La clave es comparar en el comparador oficial de la CNMC
                (comparador.cnmc.gob.es) y leer bien las condiciones: permanencia, servicios
                incluidos y precio real por kWh.
              </li>
              <li>
                <strong>&quot;Las franjas horarias son iguales todo el año&quot;.</strong> Las
                franjas de la 2.0TD no cambian, pero el precio PVPC sí varía mucho según la
                época: en invierno y verano (alta demanda) suele ser más caro, mientras que
                primavera y otoño suelen tener precios más bajos.
              </li>
              <li>
                <strong>&quot;Solo importa el precio del kWh&quot;.</strong> El término de
                potencia es una parte fija de la factura que pagas aunque no consumas. Ajustar la potencia
                contratada puede ahorrar más que cambiar de tarifa. Revisa si tu potencia
                P1 y P2 están bien ajustadas.
              </li>
              <li>
                <strong>&quot;Cambiar de tarifa es complicado&quot;.</strong> En realidad
                es gratuito, no hay corte de suministro y se puede hacer en línea. No necesitas
                cambiar el contador ni hacer ninguna instalación; solo conviene mirar antes si
                tu contrato actual tiene permanencia.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps />
        <ShareCard appName="selector-tarifa-electrica" />
        <Footer appName="selector-tarifa-electrica" />
    </div>
  );
}
