'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './SelectorAlquilerVsCompra.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
  DisclaimerCard,
  DataReference,
  RegionBadge,
} from '@/components';
import {
  calcularResultado,
  PREGUNTAS,
  VEREDICTOS,
  UMBRAL,
  DESCRIPCION_LIMITADA,
  FRASE_PLAZO_DEL_TEST,
  FRASE_SIN_PLAZO_UNIVERSAL,
  puntuacionConSigno,
  type Limite,
  type Resultado,
} from './motor';
import {
  AVAL_ICO,
  ENTRADA_HABITUAL,
  FINANCIACION_HABITUAL,
  FRASE_GASTOS,
  RANGO_GASTOS_USADA,
  REFERENCIA_NORMATIVA,
  porcentaje,
} from './cifras';

// Las preguntas con sus puntos, los veredictos y la lógica viven en ./motor.ts; las cifras que
// salen de la normativa o de una fuente externa, en ./cifras.ts.

/**
 * Por qué un límite aparta «comprar», con las cifras de ./cifras.ts (hallazgos 1459 y 1460).
 */
function AvisoLimite({ limite }: { limite: Limite }) {
  if (limite.id === 'ahorro') {
    return (
      <p className={styles.avisoLimite} role="note" data-limite="ahorro">
        <span aria-hidden="true">⚠️</span> Has declarado un ahorro de «{limite.etiqueta}». El banco suele
        financiar como máximo el {porcentaje(FINANCIACION_HABITUAL.maximo)} del valor de tasación (según el
        Banco de España), así que la entrada —el {porcentaje(ENTRADA_HABITUAL)}— y los gastos de compra salen
        del ahorro. En España, {FRASE_GASTOS}. Con menos del {porcentaje(ENTRADA_HABITUAL)} no se llega ni a
        la entrada. La vía que existe para ese hueco es el {AVAL_ICO.nombre}: {AVAL_ICO.descripcion}{' '}
        <a href={AVAL_ICO.url} className={styles.avisoEnlace}>Comprueba si cumples sus requisitos</a>.
      </p>
    );
  }
  return (
    <p className={styles.avisoLimite} role="note" data-limite="horizonte">
      <span aria-hidden="true">⚠️</span> Has declarado que prevés quedarte «{limite.etiqueta}». Los gastos de
      compra no se recuperan al vender ({RANGO_GASTOS_USADA} del precio solo en impuestos, notaría y registro
      de una vivienda usada, más los de la venta), y en tan poco tiempo solo compensan si la vivienda se
      revaloriza o si el alquiler que te ahorras supera con creces lo que cuesta ser propietario: ninguna de
      las dos cosas se puede dar por hecha.
    </p>
  );
}

// ─────────────────────────────────────────────
// Helpers para mostrar etiqueta de respuesta
// ─────────────────────────────────────────────

function getEtiquetaRespuesta(preguntaId: string, valor: string): string {
  const pregunta = PREGUNTAS.find(p => p.id === preguntaId);
  if (!pregunta) return valor;
  const opcion = pregunta.opciones.find(o => o.valor === valor);
  return opcion ? opcion.etiqueta : valor;
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

type Pantalla = 'inicio' | 'test' | 'resultado';

export default function SelectorAlquilerVsCompra() {
  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);

  // Al cambiar de pantalla o de pregunta se desmonta o se desactiva el botón que tenía el foco
  // («Empezar», «Siguiente» sin respuesta aún, «Ver resultado»), y el foco caía a <body>: el
  // siguiente Tab salía del cuestionario y, en móvil, la pregunta nueva quedaba bajo la barra o
  // fuera de la vista (hallazgos 3108 y 3110; la receta de selector-smartphone, 1680 y 2657). Se
  // lleva al enunciado de la pregunta nueva o al encabezado del resultado, que además lo desplaza a
  // la vista con su scroll-margin-top.
  const encabezadoResultado = useRef<HTMLHeadingElement>(null);
  const enunciado = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (pantalla === 'resultado') encabezadoResultado.current?.focus();
    else if (pantalla === 'test') enunciado.current?.focus();
  }, [pantalla, paso]);

  const preguntaActual = PREGUNTAS[paso];
  const totalPreguntas = PREGUNTAS.length;
  const progreso = ((paso + 1) / totalPreguntas) * 100;

  /**
   * Doble clic y dos toques seguidos (hallazgo 3111; receta `clicDeMas` de la familia, 2659 de
   * selector-smartphone). El primer clic cambia la pantalla y el segundo caía sobre lo que hubiera
   * debajo en la nueva: tras «Siguiente» de la 1, marcaba «Contrato temporal o en transición» en
   * la 2; tras «Ver resultado», el enlace de Delegum o «Contacto» de la cabecera, y se perdían las
   * 10 respuestas. Un clic se ignora cuando es el 2.º de una ráfaga (`detail` > 1, que el teclado
   * no produce) Y el clic anterior de la app cambió de pantalla.
   */
  const ultimoCambioPantallaRef = useRef(false);
  const clicDeMas = (e: React.MouseEvent<HTMLButtonElement>): boolean =>
    e.detail > 1 && ultimoCambioPantallaRef.current;
  const registrarClic = (cambiaPantalla: boolean) => {
    ultimoCambioPantallaRef.current = cambiaPantalla;
  };

  // Lo que el segundo toque pisa tras «Ver resultado» no es de esta app: el foco sube la página al
  // encabezado y el toque cae en la cabecera común (el enlace de Delegum de <LegalNotice />, o
  // «Contacto»), que `clicDeMas` no alcanza. La misma regla, en fase de captura sobre window, antes
  // de que el enlace o React lo vean. Un clic suelto (detail 1) no se toca y cierra la ráfaga: la
  // app vuelve a marcar el cambio de pantalla, si lo hay, en su propio manejador.
  useEffect(() => {
    function filtrar(e: MouseEvent) {
      if (e.detail > 1 && ultimoCambioPantallaRef.current) {
        e.preventDefault();
        e.stopPropagation();
      } else if (e.detail <= 1) {
        ultimoCambioPantallaRef.current = false;
      }
    }
    window.addEventListener('click', filtrar, true);
    return () => window.removeEventListener('click', filtrar, true);
  }, []);

  function seleccionarOpcion(valor: string) {
    registrarClic(false);
    setRespuestas(prev => ({ ...prev, [preguntaActual.id]: valor }));
  }

  function elegirOpcion(e: React.MouseEvent<HTMLButtonElement>, valor: string) {
    if (clicDeMas(e)) return;
    seleccionarOpcion(valor);
  }

  function empezar(e: React.MouseEvent<HTMLButtonElement>) {
    if (clicDeMas(e)) return;
    registrarClic(true);
    setPantalla('test');
  }

  /**
   * Teclado del patrón de radios (WAI-ARIA APG, hallazgo 3109; 1681 de selector-smartphone): las
   * flechas mueven el foco a la opción vecina y la marcan, con vuelta al principio, e Inicio/Fin
   * van a los extremos. El grupo es UNA parada de Tab (tabindex itinerante).
   */
  function teclaEnOpcion(e: React.KeyboardEvent<HTMLButtonElement>, indice: number) {
    const total = preguntaActual.opciones.length;
    let destino: number;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') destino = (indice + 1) % total;
    else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') destino = (indice - 1 + total) % total;
    else if (e.key === 'Home') destino = 0;
    else if (e.key === 'End') destino = total - 1;
    else return;
    e.preventDefault();
    seleccionarOpcion(preguntaActual.opciones[destino].valor);
    const radios = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    radios?.[destino]?.focus();
  }

  // Avanza a la pregunta SIGUIENTE A LA PULSADA (`paso + 1` del render, no `p => p + 1`): dos
  // clics antes de repintar no saltan una pregunta. Y solo con la pregunta respondida: el
  // `disabled` lo pone el render, y un clic que llega antes de repintar no lo ve.
  function avanzar(e: React.MouseEvent<HTMLButtonElement>) {
    if (clicDeMas(e) || !respuestas[preguntaActual.id]) return;
    registrarClic(true);
    if (paso < totalPreguntas - 1) {
      setPaso(paso + 1);
    } else {
      const res = calcularResultado(respuestas);
      setResultado(res);
      setPantalla('resultado');
    }
  }

  function retroceder(e: React.MouseEvent<HTMLButtonElement>) {
    if (clicDeMas(e) || paso === 0) return;
    registrarClic(true);
    setPaso(paso - 1);
  }

  function reiniciar(e: React.MouseEvent<HTMLButtonElement>) {
    if (clicDeMas(e)) return;
    registrarClic(true);
    setPantalla('inicio');
    setPaso(0);
    setRespuestas({});
    setResultado(null);
  }

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {pantalla !== 'resultado' ? (
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>¿Alquilar (arrendar) o comprar?</h1>
          <p className={styles.heroSubtitle}>
            {pantalla === 'inicio'
              ? 'Alquilar o arrendar frente a comprar: descubre qué opción se adapta mejor a tu situación vital real'
              : `Pregunta ${paso + 1} de ${totalPreguntas} · ${preguntaActual.categoria}`}
          </p>
        </header>
      ) : (
        <header className={styles.heroResultados}>
          <h1 className={styles.heroTitleSm} ref={encabezadoResultado} tabIndex={-1}>Tu resultado</h1>
          <p className={styles.heroSubtitleSm}>
            {resultado ? VEREDICTOS[resultado.veredicto].titulo : ''}
          </p>
        </header>
      )}

      {/* Hipoteca, ITP, IVA de obra nueva, AJD, IBI y el aval ICO son de España; el test sobre la
          situación personal vale en cualquier país (hallazgo 1468). */}
      <RegionBadge
        variant="es-data"
        text="Datos de referencia: España (impuestos, gastos de compra, financiación y ayudas). El test sobre tu situación vale en cualquier país"
      />

      <LegalNotice />
      <DisclaimerCard variant="financial" severity="critical" />
      {/* Publica gastos de compra y financiación, que caducan: normativa, fuente y fecha (hallazgo 1469). */}
      <DataReference
        normativa={REFERENCIA_NORMATIVA.normativa}
        fuente={REFERENCIA_NORMATIVA.fuente}
        verificado={REFERENCIA_NORMATIVA.verificado}
        urlOficial={REFERENCIA_NORMATIVA.urlOficial}
        nota={REFERENCIA_NORMATIVA.nota}
      />

      {pantalla === 'inicio' && (
        <div className={styles.introContainer}>
          <div className={styles.introCard}>
            <div className={styles.introIconGrid} aria-hidden="true">
              <span className={styles.introIcon}>🏠</span>
              <span className={styles.introIcon}>📋</span>
              <span className={styles.introIcon}>💰</span>
              <span className={styles.introIcon}>📍</span>
            </div>
            <h2 className={styles.introTitulo}>¿Alquilar o comprar?</h2>
            <p className={styles.introDesc}>
              Antes de mirar los números, hay algo más importante: ¿está tu vida en el punto adecuado
              para comprar? Este test analiza tu estabilidad laboral, horizonte temporal, situación
              familiar y mercado local para orientarte sin sesgos ni cálculos. Solo tú y tu contexto real.
            </p>
            <ul className={styles.introFeatures} aria-label="Qué obtendrás con el test">
              <li><span aria-hidden="true">✅</span> Veredicto claro: alquila, espera o compra</li>
              <li><span aria-hidden="true">✅</span> Análisis de tu estabilidad laboral y personal</li>
              <li><span aria-hidden="true">✅</span> Evaluación de tu horizonte temporal real</li>
              <li><span aria-hidden="true">✅</span> Consideración del mercado de tu zona</li>
              <li><span aria-hidden="true">✅</span> Sin registro ni datos personales</li>
            </ul>
            <button
              type="button"
              className={styles.btnStart}
              onClick={empezar}
            >
              Empezar el test →
            </button>
          </div>
        </div>
      )}

      {pantalla === 'test' && (
        <div className={styles.testContainer}>
          <div className={styles.progresoWrap}>
            <div className={styles.progresoInfo}>
              <span className={styles.progresoPaso}>Pregunta {paso + 1} de {totalPreguntas}</span>
              <span className={styles.progresoCategoria}>{preguntaActual.categoria}</span>
            </div>
            <div
              className={styles.progresoBar}
              role="progressbar"
              // Lo anunciado y lo pintado van sobre la misma escala. El relleno cuenta la
              // pregunta en curso ((paso + 1) / total), y aria-valuenow también, pero con
              // mínimo 1 un lector de pantalla anunciaba otra fracción: 0 % en la primera
              // pregunta con un décimo de barra pintado (selector-smartphone, hallazgo 951).
              aria-label={`Progreso del test: pregunta ${paso + 1} de ${totalPreguntas}`}
              aria-valuenow={paso + 1}
              aria-valuemin={0}
              aria-valuemax={totalPreguntas}
              aria-valuetext={`Pregunta ${paso + 1} de ${totalPreguntas}`}
            >
              <div className={styles.progresoRelleno} data-progreso={progreso} style={{ width: `${progreso}%` }} />
            </div>
          </div>

          <div className={styles.preguntaCard}>
            <span className={styles.preguntaIcon} aria-hidden="true">{preguntaActual.icono}</span>
            <h2 className={styles.preguntaTexto} ref={enunciado} tabIndex={-1}>{preguntaActual.texto}</h2>
            <div className={styles.opcionesGrid} role="radiogroup" aria-label={preguntaActual.texto}>
              {preguntaActual.opciones.map((op, indice) => (
                <button
                  key={op.valor}
                  type="button"
                  className={`${styles.opcionBtn} ${respuestas[preguntaActual.id] === op.valor ? styles.opcionSeleccionada : ''}`}
                  onClick={e => elegirOpcion(e, op.valor)}
                  // role="radio" + aria-checked, no aria-pressed: la elección es ÚNICA entre
                  // varias, no un conmutador. El contenedor declaraba radiogroup sin un solo
                  // radio dentro (selector-smartphone, hallazgo 950).
                  role="radio"
                  aria-checked={respuestas[preguntaActual.id] === op.valor}
                  // Tabindex itinerante: la marcada, o la primera si no hay ninguna (3109).
                  tabIndex={
                    respuestas[preguntaActual.id]
                      ? respuestas[preguntaActual.id] === op.valor ? 0 : -1
                      : indice === 0 ? 0 : -1
                  }
                  onKeyDown={e => teclaEnOpcion(e, indice)}
                >
                  <span className={styles.opcionEtiqueta}>{op.etiqueta}</span>
                  <span className={styles.opcionDesc}>{op.descripcion}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.navegacion}>
            <button
              type="button"
              className={styles.btnAnterior}
              onClick={retroceder}
              disabled={paso === 0}
              aria-label="Pregunta anterior"
            >
              ← Anterior
            </button>
            <button
              type="button"
              className={styles.btnSiguiente}
              onClick={avanzar}
              disabled={!respuestas[preguntaActual.id]}
              aria-label={paso === totalPreguntas - 1 ? 'Ver resultado' : 'Siguiente pregunta'}
            >
              {paso === totalPreguntas - 1 ? 'Ver resultado →' : 'Siguiente →'}
            </button>
          </div>
        </div>
      )}

      {pantalla === 'resultado' && resultado && (
        <div className={styles.resultadosContainer}>

          {/* Veredicto principal */}
          <div className={`${styles.veredictoCard} ${styles[`veredicto_${resultado.veredicto}`]}`}>
            <span className={styles.veredictoIcon} aria-hidden="true">
              {VEREDICTOS[resultado.veredicto].icono}
            </span>
            <p className={styles.veredictoLabel}>{VEREDICTOS[resultado.veredicto].etiqueta}</p>
            <p className={styles.veredictoValor}>{VEREDICTOS[resultado.veredicto].titulo}</p>
            <p className={styles.veredictoDesc}>
              {resultado.limitado ? DESCRIPCION_LIMITADA : VEREDICTOS[resultado.veredicto].descripcion}
            </p>
          </div>

          {/* Lo declarado que la puntuación no puede compensar, dicho a la cara (hallazgos 1459, 1460). */}
          {resultado.limitado && resultado.limites.map((limite) => (
            <AvisoLimite key={limite.id} limite={limite} />
          ))}

          {/* Grid de 4 factores clave */}
          <div className={styles.factoresGrid}>
            <div className={styles.factorCard}>
              <p className={styles.factorLabel}><span aria-hidden="true">📅</span> Horizonte temporal</p>
              <p className={styles.factorValor}>
                {resultado.respuestasPorCategoria['horizonte']
                  ? getEtiquetaRespuesta('horizonte', resultado.respuestasPorCategoria['horizonte'])
                  : '—'}
              </p>
            </div>
            <div className={styles.factorCard}>
              <p className={styles.factorLabel}><span aria-hidden="true">💼</span> Estabilidad laboral</p>
              <p className={styles.factorValor}>
                {resultado.respuestasPorCategoria['laboral']
                  ? getEtiquetaRespuesta('laboral', resultado.respuestasPorCategoria['laboral'])
                  : '—'}
              </p>
            </div>
            <div className={styles.factorCard}>
              <p className={styles.factorLabel}><span aria-hidden="true">💰</span> Capacidad de ahorro</p>
              <p className={styles.factorValor}>
                {resultado.respuestasPorCategoria['ahorro']
                  ? getEtiquetaRespuesta('ahorro', resultado.respuestasPorCategoria['ahorro'])
                  : '—'}
              </p>
            </div>
            <div className={styles.factorCard}>
              <p className={styles.factorLabel}><span aria-hidden="true">🏙️</span> Mercado local</p>
              <p className={styles.factorValor}>
                {resultado.respuestasPorCategoria['mercado']
                  ? getEtiquetaRespuesta('mercado', resultado.respuestasPorCategoria['mercado'])
                  : '—'}
              </p>
            </div>
          </div>

          {/* Razones del veredicto: salen de las respuestas. Antes eran cuatro fijas por
              veredicto, y a quien salía «comprar» con un contrato temporal le decían «Tu
              estabilidad laboral y permanencia prevista justifican la inversión». */}
          <div className={styles.razonesSection}>
            <p className={styles.razonesTitulo}>
              {resultado.veredicto === 'espera' ? 'Lo que empuja hacia comprar' : 'Por qué esta recomendación'}
            </p>
            <p className={styles.puntuacionNota}>
              Tu puntuación total es {puntuacionConSigno(resultado.puntuacion)}: a partir de{' '}
              {puntuacionConSigno(UMBRAL)} la orientación es comprar, hasta {puntuacionConSigno(-UMBRAL)} alquilar,
              y entre medias, esperar.
              {resultado.limitado && ' Aquí pasa de ese umbral, pero lo que has declarado arriba impide recomendar la compra.'}
            </p>
            {resultado.razones.length > 0 ? (
              resultado.razones.map((razon) => (
                <p key={razon} className={styles.razonItem}>{razon}</p>
              ))
            ) : (
              <p className={styles.razonItem}>Ninguna de tus respuestas suma en esta dirección.</p>
            )}
            {/* Lo que no cabe en las tres de más peso, sumado: así lo enseñado cuadra con la
                puntuación de arriba (hallazgo 3107). */}
            {resultado.restoRazones && <p className={styles.razonResto}>{resultado.restoRazones}</p>}
          </div>

          {resultado.contrapeso.length > 0 && (
            <div className={styles.razonesSection}>
              <p className={styles.razonesTitulo}>
                {resultado.veredicto === 'espera' ? 'Lo que empuja hacia alquilar' : 'Lo que apunta en sentido contrario'}
              </p>
              {resultado.contrapeso.map((razon) => (
                <p key={razon} className={`${styles.razonItem} ${styles.razonContraria}`}>{razon}</p>
              ))}
              {resultado.restoContrapeso && <p className={styles.razonResto}>{resultado.restoContrapeso}</p>}
            </div>
          )}

          {/* Próximos pasos */}
          <div className={styles.proximosSection}>
            <p className={styles.proximosTitulo}>Próximos pasos</p>
            {resultado.proximosPasos.map((paso, i) => (
              <p key={i} className={styles.proximoItem}>{paso}</p>
            ))}
          </div>

          <button
            type="button"
            className={styles.btnRepetir}
            onClick={reiniciar}
            aria-label="Repetir el test desde el principio"
          >
            ← Repetir el test
          </button>

          <div className={styles.warningBox} role="note">
            Esta herramienta es orientativa y se basa exclusivamente en tus respuestas. No tiene en cuenta
            datos financieros concretos ni el mercado específico de tu zona. Para una decisión tan importante,
            consulta con un profesional inmobiliario o financiero.
          </div>

        </div>
      )}

      {/* Guía educativa, en TODAS las pantallas (hallazgo 3112; 2663 de selector-smartphone). Vivía
          dentro de la rama del resultado: el HTML servido no traía ni una línea de ella, aunque
          EducationalSection monta su contenido siempre «porque Googlebot no hace clic», y quien no
          terminaba las 10 preguntas no podía abrirla. Los avisos van arriba, fuera de ella. */}
      <div className={styles.guiaContainer}>
        <EducationalSection
          title="Alquilar (arrendar) vs Comprar: lo que nadie te cuenta"
          subtitle="Más allá de los números, los factores que realmente importan al decidir entre arriendo y compra"
          defaultOpen={false}
        >
          {/* Las cifras salen de ./cifras.ts y el plazo de ./motor.ts, lo mismo que lee la FAQ.
              Decía «entre un 10 % y un 15 %» de gastos, escrito a mano (hallazgo 1462), y «entre 5 y
              8 años» frente a los «7 a 12» de la FAQ (hallazgo 1463). */}
          <h3>El punto de equilibrio: cuántos años hacen falta</h3>
          <p>
            Comprar tiene costes iniciales que no se recuperan al vender. La entrada sigue siendo
            patrimonio tuyo (el banco suele financiar como máximo el {porcentaje(FINANCIACION_HABITUAL.maximo)} del
            valor de tasación, así que el {porcentaje(ENTRADA_HABITUAL)} restante sale del ahorro), pero los gastos no:
            en España, {FRASE_GASTOS}. Si tienes que vender antes de amortizarlos, pierdes esa parte,
            más los gastos de la venta.
          </p>
          <p>
            {FRASE_SIN_PLAZO_UNIVERSAL} {FRASE_PLAZO_DEL_TEST}
          </p>

          {/* Sin cifras que no tengan fuente (hallazgo 3113): decía «200-1.500 €/año» de IBI, «1 % del
              valor al año» de mantenimiento, «100-400 €/año» de seguro y «3-5 %» de agencia, escritos
              a mano. El seguro exigible es el de daños del inmueble, no «el del hogar»: RD 716/2009,
              art. 10.1, consultado en el BOE el 09/10/2026. Y la venta de la vivienda habitual tiene
              las exenciones de data/fiscal/ganancia-inmueble.ts (hallazgo 3114): arts. 33.4.b y 38.1
              de la Ley 35/2006, consultados en el BOE el 09/10/2026. */}
          <h3>Costes ocultos de la compra que nadie menciona</h3>
          <p>
            Más allá de la hipoteca mensual, comprar tiene costes que los propietarios suelen olvidar:
          </p>
          <ul>
            <li><strong>IBI:</strong> impuesto anual del ayuntamiento, que se calcula sobre el valor catastral con el tipo que fija cada municipio: la cuota cambia mucho de un sitio a otro. Pide el último recibo antes de comprar.</li>
            <li><strong>Comunidad de propietarios:</strong> cuotas mensuales, derramas y obras imprevistas.</li>
            <li><strong>Mantenimiento:</strong> reparaciones, electrodomésticos, instalaciones. Conviene reservar algo cada año, más cuanto más antigua sea la vivienda.</li>
            <li><strong>Seguro de daños:</strong> con hipoteca, la vivienda tiene que estar asegurada contra daños por su valor de tasación sin contar el suelo (Real Decreto 716/2009, art. 10). Esa norma no exige las demás coberturas de un seguro de hogar, como el contenido.</li>
            <li><strong>Gastos de venta:</strong> si vendes, la comisión de la agencia si la contratas (se pacta con ella), la plusvalía municipal y el IRPF por la ganancia. Si es tu vivienda habitual, la ganancia está exenta para los mayores de 65 años (y para las personas en situación de dependencia severa o gran dependencia), y total o parcialmente con la reinversión de lo obtenido en otra vivienda habitual (Ley del IRPF, arts. 33.4.b y 38).</li>
          </ul>

          <h3>Las ventajas reales del alquiler (arriendo)</h3>
          <p>
            El alquiler —arriendo, como se conoce en gran parte de Latinoamérica— no es tirar el dinero.
            Te ofrece cosas que la compra no puede darte:
          </p>
          <ul>
            <li><strong>Liquidez:</strong> el dinero de la entrada sigue siendo tuyo e invertible.</li>
            <li><strong>Flexibilidad:</strong> cambiar de ciudad, de zona o de tamaño sin penalizaciones.</li>
            <li><strong>Sin riesgo de depreciación:</strong> si el mercado cae, no te afecta como propietario.</li>
            <li><strong>Sin imprevistos costosos:</strong> las reparaciones estructurales son responsabilidad del propietario.</li>
          </ul>

          <h3>Cuándo comprar tiene sentido de verdad</h3>
          <p>
            La compra tiene más sentido cuando se dan varios de estos factores a la vez:
          </p>
          <ul>
            <li>Estabilidad laboral sólida (indefinido o autónomo consolidado +3 años).</li>
            <li>Horizonte de más de 7 años en la misma zona (el tramo que este test puntúa a favor).</li>
            <li>Ahorro para la entrada y los gastos sin agotar el colchón de emergencia, o acceso al {AVAL_ICO.nombre} si cumples sus requisitos.</li>
            <li>Cuota hipotecaria razonable respecto a tus ingresos netos: cada banco fija su propio límite según tu perfil completo de ingresos y gastos.</li>
            <li>Mercado donde el alquiler es proporcionalmente más caro que la hipoteca equivalente.</li>
          </ul>

          <div className={styles.warningBox}>
            <strong>Recuerda:</strong> este test analiza factores cualitativos y vitales, no los números concretos
            de tu caso. Para una decisión informada, combina este resultado con una calculadora de alquiler
            vs compra que tenga en cuenta precios reales, tipos de interés actuales y tu situación fiscal específica.
          </div>
        </EducationalSection>
      </div>

      <RelatedApps />
      <ShareCard appName="selector-alquiler-vs-compra" />
      <Footer appName="selector-alquiler-vs-compra" />
    </div>
  );
}
