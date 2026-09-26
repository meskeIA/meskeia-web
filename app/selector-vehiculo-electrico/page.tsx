'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import styles from './SelectorVehiculoElectrico.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  DataReference,
  RegionBadge,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  AYUDA_AUTO_PLUS_2026,
  FISCAL_AYUDAS_VEHICULO_META,
  MOVES_III_HISTORICO,
} from '@/data/fiscal';
import { formatDate, formatNumber, formatPercentage, parseISODateLocal } from '@/lib';
import {
  CANDIDATOS,
  NOMBRE,
  crearPreguntas,
  recomendar,
  type Pesos,
  type TipoVehiculo,
  type ResultadoMotor,
} from './motor';

// ─── Datos de la ayuda vigente (data/fiscal/ayudas-vehiculo.ts) ─────────────
// El MOVES III salía como ayuda vigente en la pregunta 8, en la tarjeta, en la nota y en la guía
// nueve meses después de terminar (hallazgo 2054). Todo lo de la ayuda sale ahora del módulo.

const AUTO = AYUDA_AUTO_PLUS_2026;
const NORMA_AUTO = FISCAL_AYUDAS_VEHICULO_META.fuente.split(',')[0];
const NBSP = ' ';
const euros = (n: number): string => `${formatNumber(n, 0)}${NBSP}€`;
const fecha = (iso: string): string => formatDate(parseISODateLocal(iso));
const pct = (x: number): string => formatPercentage(x, 0);

const PREGUNTAS = crearPreguntas(
  `¿Son importantes para ti las ayudas públicas a la compra (el ${AUTO.nombre} y las deducciones fiscales)?`,
);

// ─── Tarjetas de resultado ───────────────────────────────────────────────────
// Describen el TIPO de vehículo, no al usuario: la tarjeta fija del eléctrico puro afirmaba
// «Tienes acceso a carga en casa» a quien aparcaba en la calle (2049) y la de la moto «los
// kilómetros diarios son cortos» a quien hacía más de 150 (2050). Lo que depende de las
// respuestas lo escribe el motor (avisos, razones, descartes).

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
    subtitulo: 'Cero emisiones en el tubo de escape · El menor coste por kilómetro si cargas en casa',
    descripcion:
      'Un eléctrico puro funciona solo con batería y motor eléctrico: no tiene motor de combustión y se recarga enchufándolo. Es el que menos gasta por kilómetro cuando se carga sobre todo con una tarifa doméstica, y el que más planificación exige en los viajes largos.',
    ventajas: [
      'Coste por kilómetro bajo cuando cargas con tarifa doméstica',
      'Mantenimiento reducido (sin motor de combustión, aceite ni embrague)',
      'Etiqueta CERO de la DGT: acceso a las zonas de bajas emisiones según cada ordenanza municipal',
      `Puede recibir la ayuda estatal (${AUTO.nombre}) y la deducción del IRPF si cumples sus requisitos`,
      'Cero emisiones en el tubo de escape',
    ],
  },
  phev: {
    icono: '🔋',
    titulo: 'Híbrido Enchufable (PHEV)',
    subtitulo: 'Eléctrico en el día a día · Combustión para los viajes largos',
    descripcion:
      `Un híbrido enchufable combina un motor eléctrico, con una batería que se recarga por cable, y un motor de combustión. Permite hacer los trayectos cortos en modo 100${NBSP}% eléctrico y usar la combustión en los viajes largos. Solo tiene sentido si lo enchufas con regularidad: sin cargar, circula como un gasolina que además carga con el peso de la batería.`,
    ventajas: [
      'Modo eléctrico para los trayectos cortos si lo cargas a diario',
      'Motor de combustión para los viajes largos, sin depender de la red de carga',
      'Etiqueta CERO o ECO de la DGT, según su autonomía eléctrica',
      `Puede recibir la ayuda estatal (${AUTO.nombre}), menor que la de un eléctrico puro`,
      'Transición gradual hacia la movilidad eléctrica',
    ],
  },
  // «Híbrido Suave (HEV)» usaba el nombre del MHEV, que no puede circular solo en eléctrico, para
  // el híbrido completo que describía (hallazgo 2055).
  hev: {
    icono: '🌿',
    titulo: 'Híbrido Convencional (HEV)',
    subtitulo: 'Sin enchufar · Menos consumo que un gasolina · Sin cambiar hábitos',
    descripcion:
      'El híbrido convencional (o híbrido completo) no se enchufa: recarga su pequeña batería con el propio motor y con la frenada regenerativa, y puede mover el coche en modo eléctrico en tramos cortos y a baja velocidad. Consume menos que un gasolina equivalente, sobre todo en ciudad, y no exige cambiar ningún hábito. No lo confundas con el híbrido ligero o «suave» (MHEV), que no puede circular solo en eléctrico.',
    ventajas: [
      'No necesita punto de carga',
      'Menos consumo que un gasolina equivalente, sobre todo en tráfico urbano',
      'Sin limitaciones de autonomía en los viajes largos',
      'Etiqueta ECO de la DGT (sus ventajas dependen de cada municipio)',
      'Sigues repostando como hasta ahora',
    ],
  },
  moto_electrica: {
    icono: '🛵',
    titulo: 'Moto Eléctrica',
    subtitulo: 'La opción más económica · Pensada para la ciudad',
    descripcion:
      'Una moto eléctrica cubre bien los desplazamientos urbanos con un coste de compra y de uso muy inferior al de un coche, y se aparca con facilidad. Antes de elegir, comprueba su autonomía real y su categoría: los ciclomotores (hasta 45 km/h) no pueden circular por autopistas ni autovías.',
    ventajas: [
      'Precio de compra muy inferior al de un coche eléctrico',
      'Se puede recargar en un enchufe doméstico',
      'Etiqueta CERO de la DGT',
      'Mantenimiento mínimo',
      `Las motocicletas eléctricas (categorías L3e a L5e) también tienen ayuda estatal (${AUTO.nombre})`,
    ],
  },
  // «Esperar 1–2 años» no salía en ninguna combinación (hallazgo 2052). Ahora sale cuando ningún
  // vehículo electrificado nuevo encaja a la vez con el uso y con el presupuesto (ver motor.ts).
  esperar: {
    icono: '⏳',
    titulo: 'Esperar o mirar de ocasión',
    subtitulo: 'Ningún vehículo electrificado nuevo encaja hoy con tu uso y tu presupuesto',
    descripcion:
      'Con tu presupuesto, un coche híbrido o eléctrico nuevo suele quedar por encima de lo que quieres gastar, y la moto eléctrica no encaja con lo que has respondido. Si tu vehículo actual aguanta, esperar te da margen para ahorrar y para ver cómo evoluciona la oferta; si necesitas cambiar ya, un híbrido o un eléctrico de ocasión puede entrar en tu presupuesto.',
    ventajas: [
      'Tiempo para ahorrar sin forzar la compra',
      `El ${AUTO.nombre} está previsto hasta el ${fecha(AUTO.vigenteHasta)}, con solicitudes cada año hasta el ${AUTO.solicitudAnualHasta}: esperar no te hace perder la ayuda estatal mientras tenga fondos`,
      'En el mercado de ocasión hay híbridos y eléctricos por debajo del precio de uno nuevo',
      'En un eléctrico de ocasión, pide un informe del estado de la batería: dice cuánta capacidad conserva',
    ],
  },
};

const ETIQUETAS: Record<TipoVehiculo, string> = {
  bev: 'Eléctrico puro',
  phev: 'Híbrido enchufable',
  hev: 'Híbrido convencional',
  moto_electrica: 'Moto eléctrica',
  esperar: 'Esperar',
};

/** Hueco que deja arriba la barra del logo fijo; igual que el scroll-margin-top del CSS. */
const MARGEN_LOGO = 88;

/** Lleva `bloque` arriba de la pantalla solo si `clave` no se ve entera bajo el logo fijo. */
function traerALaVista(bloque: HTMLElement | null, clave: HTMLElement | null) {
  if (!bloque || !clave) return;
  const r = clave.getBoundingClientRect();
  if (r.top >= MARGEN_LOGO && r.bottom <= window.innerHeight) return;
  bloque.scrollIntoView({ block: 'start', behavior: 'auto' });
}

const mayuscula = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

function listaNombres(tipos: TipoVehiculo[]): string {
  const n = tipos.map((t) => `el ${NOMBRE[t]}`);
  return n.length <= 1 ? n.join('') : `${n.slice(0, -1).join(', ')} y ${n[n.length - 1]}`;
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function SelectorVehiculoElectrico() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>(Array(PREGUNTAS.length).fill(-1));
  const [resultado, setResultado] = useState<ResultadoMotor | null>(null);

  const seleccionActual = respuestas[preguntaActual];
  const pregunta = PREGUNTAS[preguntaActual];
  const totalPreguntas = PREGUNTAS.length;
  const progresoPct = (preguntaActual / totalPreguntas) * 100;

  /**
   * Foco y vista (hallazgos 2064 y 2065, la forma del 1679/1680 de selector-smartphone).
   * Tras «Siguiente →» el botón queda desactivado (la pregunta nueva no tiene respuesta), «←
   * Anterior» se desmonta en la pregunta 1 y «Ver resultado» y «Repetir test» se desmontan con
   * su pantalla: en los cuatro casos el foco caía a <body>. Ahora va al enunciado de la pregunta
   * nueva o al título del resultado y, si no se ve entero bajo el logo fijo, la vista sube.
   * No se mueve en la carga inicial: solo después de que el usuario navegue.
   */
  const navegado = useRef(false);
  const quizRef = useRef<HTMLElement>(null);
  const enunciadoRef = useRef<HTMLHeadingElement>(null);
  const tarjetaRef = useRef<HTMLDivElement>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!navegado.current) return;
    if (resultado) {
      traerALaVista(tarjetaRef.current, tituloRef.current);
      tituloRef.current?.focus({ preventScroll: true });
    } else {
      traerALaVista(quizRef.current, enunciadoRef.current);
      enunciadoRef.current?.focus({ preventScroll: true });
    }
  }, [preguntaActual, resultado]);

  function seleccionarOpcion(idx: number) {
    const nuevas = [...respuestas];
    nuevas[preguntaActual] = idx;
    setRespuestas(nuevas);
  }

  /**
   * Teclado del patrón de radios (WAI-ARIA APG): las flechas mueven el foco a la opción vecina y
   * la marcan, con vuelta al principio; Inicio y Fin van a los extremos. El grupo es una sola
   * parada de Tab (tabindex itinerante).
   */
  function teclaEnOpcion(e: React.KeyboardEvent<HTMLButtonElement>, indice: number) {
    const total = pregunta.opciones.length;
    let destino: number;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') destino = (indice + 1) % total;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') destino = (indice - 1 + total) % total;
    else if (e.key === 'Home') destino = 0;
    else if (e.key === 'End') destino = total - 1;
    else return;
    e.preventDefault();
    seleccionarOpcion(destino);
    const radios = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    radios?.[destino]?.focus();
  }

  function avanzar() {
    if (seleccionActual === -1) return;
    navegado.current = true;
    if (preguntaActual < totalPreguntas - 1) {
      setPreguntaActual(preguntaActual + 1);
    } else {
      setResultado(recomendar(PREGUNTAS, respuestas));
    }
  }

  function retroceder() {
    if (preguntaActual > 0) {
      navegado.current = true;
      setPreguntaActual(preguntaActual - 1);
    }
  }

  function reiniciar() {
    navegado.current = true;
    setPreguntaActual(0);
    setRespuestas(Array(PREGUNTAS.length).fill(-1));
    setResultado(null);
  }

  const puntuaciones: Pesos = resultado?.puntos ?? { bev: 0, phev: 0, hev: 0, moto_electrica: 0, esperar: 0 };
  const maxPuntuacion = Math.max(...Object.values(puntuaciones), 1);
  const descartados = useMemo(
    () => new Set<TipoVehiculo>(resultado?.exclusiones.map((x) => x.tipo) ?? []),
    [resultado],
  );

  const ganador = resultado?.ganador ?? null;
  const info = ganador ? RESULTADOS[ganador] : null;
  const exclusionDe = (t: TipoVehiculo) => resultado?.exclusiones.find((x) => x.tipo === t);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1><span aria-hidden="true">⚡</span> Selector de Vehículo Eléctrico</h1>
        <p>Test de 10 preguntas para saber qué tipo de vehículo eléctrico o híbrido encaja con tu vida</p>
      </header>

      {/* Ayudas, IDAE, impuestos y comunidades autónomas son de España (hallazgo 2062). */}
      <RegionBadge variant="es-data" text="Ayudas e impuestos de referencia: España. El cuestionario sirve en cualquier país" />

      <LegalNotice />

      {!resultado ? (
        <main className={styles.quiz} ref={quizRef}>
          {/* Barra de progreso */}
          <div className={styles.progreso}>
            <div className={styles.progresoBar} role="progressbar" aria-label="Progreso del test" aria-valuenow={preguntaActual} aria-valuemin={0} aria-valuemax={totalPreguntas}>
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
              <h2 className={styles.preguntaTexto} id="enunciado-pregunta" ref={enunciadoRef} tabIndex={-1}>
                {pregunta.texto}
              </h2>
            </div>

            {/* Elección única: radios con aria-checked, no conmutadores aria-pressed (hallazgo 2063). */}
            <div className={styles.opciones} role="radiogroup" aria-labelledby="enunciado-pregunta">
              {pregunta.opciones.map((op, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="radio"
                  aria-checked={seleccionActual === idx}
                  tabIndex={seleccionActual === -1 ? (idx === 0 ? 0 : -1) : seleccionActual === idx ? 0 : -1}
                  className={`${styles.opcion} ${seleccionActual === idx ? styles.seleccionada : ''}`}
                  onClick={() => seleccionarOpcion(idx)}
                  onKeyDown={(e) => teclaEnOpcion(e, idx)}
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
      ) : ganador && info ? (
        <main className={styles.resultado}>
          <div className={styles.resultadoCard} ref={tarjetaRef}>
            <span className={styles.resultadoIcono} aria-hidden="true">
              {info.icono}
            </span>
            <h2 className={styles.resultadoTitulo} ref={tituloRef} tabIndex={-1}>
              {info.titulo}
            </h2>
            <p className={styles.resultadoSubtitulo}>
              {info.subtitulo}
            </p>

            {/* Empate en cabeza: antes lo resolvía en silencio el orden del código (2053). */}
            {resultado.empateCon.length > 0 && (
              <p className={styles.aviso} role="note">
                <strong>Empate:</strong> {listaNombres([ganador, ...resultado.empateCon])} suman los mismos
                puntos ({puntuaciones[ganador]}). Se muestra el primero, pero con tus respuestas encajan igual:
                compara los dos antes de decidir.
              </p>
            )}

            {/* El presupuesto acota lo que pedía el uso (2051). */}
            {resultado.mejorSinPresupuesto && (
              <p className={styles.aviso} role="note">
                <strong>Presupuesto:</strong> por uso, el que más encaja contigo sería el{' '}
                {NOMBRE[resultado.mejorSinPresupuesto]} ({puntuaciones[resultado.mejorSinPresupuesto]} puntos), pero{' '}
                {exclusionDe(resultado.mejorSinPresupuesto)?.motivo ?? 'no cabe en tu presupuesto'}, según la escala
                orientativa de este test. Un modelo de ocasión o una oferta puntual pueden cambiarlo.
              </p>
            )}

            {resultado.avisos.map((a) => (
              <p key={a} className={styles.aviso} role="note">{a}</p>
            ))}

            <p className={styles.resultadoDescripcion}>
              {info.descripcion}
            </p>

            {resultado.razones.length > 0 && (
              <div className={styles.razones}>
                <h3>Lo que más ha pesado a favor</h3>
                <ul>
                  {resultado.razones.map((r) => (
                    <li key={r}>«{r}»</li>
                  ))}
                </ul>
              </div>
            )}

            <ul className={styles.ventajas} aria-label={ganador === 'esperar' ? 'Claves' : 'Ventajas principales'}>
              {info.ventajas.map((v) => (
                <li key={v}>{v}</li>
              ))}
            </ul>

            {/* Puntuaciones comparativas */}
            <div className={styles.resumenPuntuaciones}>
              <h3>Compatibilidad con tu uso</h3>
              {(Object.keys(ETIQUETAS) as TipoVehiculo[]).map((tipo) => (
                <div key={tipo} className={`${styles.barraResultado} ${descartados.has(tipo) ? styles.barraDescartada : ''}`}>
                  <span className={styles.barraLabel}>{ETIQUETAS[tipo]}</span>
                  <div className={styles.barraTrack} aria-hidden="true">
                    <div
                      className={`${styles.barraFill} ${tipo === ganador ? styles.ganadora : ''}`}
                      style={{ width: `${(puntuaciones[tipo] / maxPuntuacion) * 100}%` }}
                    />
                  </div>
                  <span className={styles.barraValor}>{puntuaciones[tipo]}</span>
                </div>
              ))}
              {resultado.exclusiones.length > 0 && (
                <>
                  <h3 className={styles.descartesTitulo}>Por qué no las otras</h3>
                  <ul className={styles.descartes}>
                    {CANDIDATOS.filter((t) => t !== ganador).map((t) => {
                      const x = exclusionDe(t);
                      return x ? (
                        <li key={t}>
                          <strong>{mayuscula(NOMBRE[t])}:</strong> {x.motivo}.
                        </li>
                      ) : null;
                    })}
                  </ul>
                </>
              )}
            </div>

            <div className={styles.warningBox} role="note">
              <strong>Nota:</strong> Este test ofrece una orientación basada en tus respuestas. Antes de comprar,
              consulta las especificaciones técnicas de los modelos que te interesen, las ayudas vigentes (hoy, el{' '}
              {AUTO.nombre}) y valora una prueba de conducción.
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
          <DataReference
            normativa={`${AUTO.nombre} (ayuda estatal a la compra)`}
            fuente={FISCAL_AYUDAS_VEHICULO_META.fuente}
            verificado={FISCAL_AYUDAS_VEHICULO_META.verificado}
            urlOficial={FISCAL_AYUDAS_VEHICULO_META.urlOficial}
          />

          <EducationalSection
            title="Guía de vehículos electrificados en España"
            subtitle="Todo lo que necesitas saber antes de dar el salto a la movilidad eléctrica"
          >
            <h3>¿Qué significan BEV, PHEV, HEV y MHEV?</h3>
            <p>
              <strong>BEV (Battery Electric Vehicle)</strong> — Eléctrico puro: funciona exclusivamente con batería y motor eléctrico. No tiene motor de combustión interna y se recarga enchufándolo a la red. La autonomía depende mucho del modelo: compara la cifra homologada WLTP y cuenta con que en autopista y con frío es menor.
            </p>
            <p>
              <strong>PHEV (Plug-in Hybrid Electric Vehicle)</strong> — Híbrido enchufable: combina un motor eléctrico, con batería recargable por cable, y uno de combustión. Su autonomía en modo eléctrico varía según el modelo (consulta la cifra WLTP). Encaja con quien hace la mayoría de trayectos cortos, puede enchufarlo a diario y también viaja lejos.
            </p>
            <p>
              <strong>HEV (Hybrid Electric Vehicle)</strong> — Híbrido convencional o completo: incorpora un motor eléctrico que se recarga con la conducción y la frenada regenerativa, y puede circular solo en eléctrico en tramos cortos. No se puede enchufar. Reduce el consumo sin cambiar hábitos.
            </p>
            <p>
              <strong>MHEV (Mild Hybrid)</strong> — Híbrido ligero o «suave»: un sistema eléctrico pequeño que asiste al motor de combustión, pero no puede mover el coche solo en eléctrico. No es lo mismo que un HEV.
            </p>

            {/* Tres cifras distintas y sin fuente para el mismo coste (2057): se da el método. */}
            <h3>¿Cuánto cuesta recargar un coche eléctrico?</h3>
            <p>
              Depende de dos datos que puedes consultar tú: el <strong>consumo</strong> del coche (kWh cada 100 km, en su ficha homologada) y el <strong>precio del kWh</strong> de tu tarifa. El coste por 100 km es consumo × precio. Para compararlo con un coche de combustión, multiplica sus litros cada 100 km por el precio del litro. En los cargadores públicos, sobre todo los rápidos, el kWh suele costar más que con una tarifa doméstica.
            </p>

            <h3>Ayudas a la compra en España</h3>
            <ul>
              <li>
                <strong>{AUTO.nombre}</strong> ({NORMA_AUTO}): ayuda estatal para vehículos matriculados desde el{' '}
                {fecha(AUTO.matriculadosDesde)}, prevista hasta el {fecha(AUTO.vigenteHasta)} y con solicitud cada año
                hasta el {AUTO.solicitudAnualHasta}. Máximo por vehículo: {euros(AUTO.maximo.turismo)} en turismos y{' '}
                {euros(AUTO.maximo.motocicleta)} en motocicletas. En un turismo, la ayuda se suma por criterios: ser
                eléctrico puro aporta el {pct(AUTO.criterioElectrico.puro)} del máximo y ser enchufable el{' '}
                {pct(AUTO.criterioElectrico.electrificado)}, y se añaden otros por precio y por fabricación en la Unión
                Europea. Un turismo de más de {euros(AUTO.precioMaxTurismoSinImpuestos)} sin impuestos no recibe ayuda.
                Los híbridos convencionales no tienen esta ayuda.
              </li>
              <li>
                El <strong>{MOVES_III_HISTORICO.nombre}</strong>, que todavía citan muchas páginas, terminó el{' '}
                {fecha(MOVES_III_HISTORICO.finalizado)}.
              </li>
              <li>
                <strong>Deducción en el IRPF</strong>: la Agencia Tributaria recoge una deducción por la compra de
                vehículos eléctricos enchufables nuevos. Consulta en su sede el porcentaje, la base máxima y el plazo
                vigentes antes de contar con ella.
              </li>
              {/* Antes, «Bonificaciones ITP/AJD» explicaba una rebaja del impuesto de matriculación,
                  que es otro impuesto (hallazgo 2059). */}
              <li>
                <strong>Impuesto de matriculación</strong> (Impuesto Especial sobre Determinados Medios de Transporte,
                Ley 38/1992): se calcula según las emisiones oficiales de CO₂, y los eléctricos puros tributan a tipo cero.
              </li>
              <li>
                <strong>Impuesto de circulación</strong>: los ayuntamientos pueden bonificarlo según el tipo de motor.
                Mira la ordenanza fiscal de tu municipio.
              </li>
              <li>
                <strong>Ayudas autonómicas y municipales</strong>: algunas comunidades autónomas y ayuntamientos tienen
                programas propios.
              </li>
            </ul>
            <p>
              Consulta siempre el estado de las ayudas en el{' '}
              <a href={FISCAL_AYUDAS_VEHICULO_META.urlOficial} target="_blank" rel="noopener noreferrer">texto del {NORMA_AUTO} en el BOE</a>,
              en el <a href="https://www.idae.es" target="_blank" rel="noopener noreferrer">IDAE (idae.es)</a> y en la{' '}
              <a href="https://sede.agenciatributaria.gob.es/Sede/vehiculos-embarcaciones/deduccion-irpf-adquisicion-vehiculos-electricos.html" target="_blank" rel="noopener noreferrer">sede de la Agencia Tributaria</a>{' '}
              antes de comprar.
            </p>

            <h3>Infraestructura de carga</h3>
            <p>
              La red pública de carga crece, pero su densidad cambia mucho de una zona a otra. Si no puedes cargar en casa, antes de comprar mira en un mapa de puntos de carga cuáles tienes cerca de casa y del trabajo, su potencia y su precio.
            </p>

            <h3>¿Cuándo elegir moto eléctrica en lugar de coche?</h3>
            <p>
              Si tus desplazamientos son urbanos y cortos, y no necesitas llevar a más personas ni mucha carga, la moto eléctrica puede ser la opción más económica y práctica: cuesta mucho menos que un coche, se recarga en un enchufe doméstico y se aparca con facilidad. El {AUTO.nombre} también subvenciona las motocicletas eléctricas.
            </p>

            <h3>¿Tiene sentido esperar para comprar?</h3>
            <p>
              Si tu vehículo actual funciona y ninguna opción nueva encaja con tu presupuesto, esperar te da tiempo para ahorrar y para comparar con calma. La otra vía es el mercado de ocasión: en un eléctrico usado, pide un informe del estado de la batería.
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
