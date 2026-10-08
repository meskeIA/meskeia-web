'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './SelectorMovilidadUrbana.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RegionBadge,
  RelatedApps,
  ShareCard,
  EducationalSection,
  DisclaimerCard,
} from '@/components';
import {
  calcularResultado,
  TRANSPORTES,
  CON_ARTICULO,
  PREGUNTAS,
  COSTE_MENSUAL,
  enumerar,
  rangoMensual,
  rangoAnual,
} from './motor';

// Las preguntas con sus pesos, las fichas de cada medio, los costes y la lógica viven en ./motor.ts.

// ===== COMPONENTE PRINCIPAL =====

export default function SelectorMovilidadUrbana() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>(Array(PREGUNTAS.length).fill(-1));
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const tituloResultado = useRef<HTMLHeadingElement>(null);
  const enunciado = useRef<HTMLHeadingElement>(null);

  // Al cambiar de pregunta o de pantalla se desactiva o se desmonta el botón que tenía el foco
  // («Siguiente» en la pregunta nueva, aún sin respuesta; «Anterior» al volver a la 1; «Ver mi
  // resultado» y «Repetir el test», que se desmontan), y el foco caía a <body>: el Tab siguiente
  // saltaba las opciones y, tras «Repetir el test», la pregunta 1 quedaba cientos de píxeles por
  // encima de la pantalla (hallazgos 2694 y 2695; regla g de la familia). Se lleva al enunciado
  // de la pregunta nueva o al título del resultado, lo que además los desplaza a la vista.
  // Solo tras una navegación: al cargar la página el foco no se mueve (la marca la ponen los
  // manejadores, no el primer render, que en desarrollo React ejecuta dos veces).
  const moverFoco = useRef(false);
  useEffect(() => {
    if (!moverFoco.current) return;
    moverFoco.current = false;
    if (mostrarResultado) tituloResultado.current?.focus();
    else enunciado.current?.focus();
  }, [mostrarResultado, preguntaActual]);

  const opcionSeleccionada = respuestas[preguntaActual];
  const porcentajeProgreso = ((preguntaActual + 1) / PREGUNTAS.length) * 100;

  /**
   * Doble clic y dos toques seguidos (hallazgo 2698; receta común de la familia, referencia
   * selector-smartphone, 2659). Hasta 480 px la navegación va en columna invertida, «Siguiente»
   * arriba y «Anterior» debajo: al pasar a una pregunta con menos opciones la tarjeta encoge, la
   * navegación sube y el segundo toque caía en «Anterior», que devolvía a la pregunta recién
   * contestada. Un doble toque es UNA intención, así que un clic se ignora cuando:
   *   · es el 2.º (o 3.º…) de una ráfaga: `detail` > 1, que cuenta el navegador (con teclado o
   *     lector de pantalla es 0);
   *   · y el clic ANTERIOR de la app cambió de pantalla. Sin esta condición, contestar y tocar
   *     «Siguiente» deprisa —dos toques cercanos que Chrome también cuenta como ráfaga— se comía
   *     el «Siguiente», que sí era una intención nueva.
   * El clic ignorado no toca el registro: el 3.º de una ráfaga se ignora igual que el 2.º.
   */
  const ultimoCambioPantalla = useRef(false);
  const clicDeMas = (e: React.MouseEvent<HTMLButtonElement>): boolean =>
    e.detail > 1 && ultimoCambioPantalla.current;
  const registrarClic = (cambiaPantalla: boolean): void => {
    ultimoCambioPantalla.current = cambiaPantalla;
    if (cambiaPantalla) moverFoco.current = true;
  };

  function seleccionarOpcion(indice: number): void {
    registrarClic(false);
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[preguntaActual] = indice;
    setRespuestas(nuevasRespuestas);
  }

  function elegirOpcion(e: React.MouseEvent<HTMLButtonElement>, indice: number): void {
    if (clicDeMas(e)) return;
    seleccionarOpcion(indice);
  }

  /**
   * Teclado del patrón de radios (WAI-ARIA APG): las flechas mueven el foco a la opción vecina y
   * la marcan, con vuelta al principio, e Inicio/Fin van a los extremos. El grupo es UNA parada de
   * Tab (tabindex itinerante). Antes cada opción era una parada y las flechas no hacían nada
   * (hallazgo 2696; referencia selector-smartphone, 1681).
   */
  function teclaEnOpcion(e: React.KeyboardEvent<HTMLButtonElement>, indice: number): void {
    const total = PREGUNTAS[preguntaActual].opciones.length;
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

  // Avanza a la pregunta SIGUIENTE A LA PULSADA (la del render, no `p => p + 1`): dos clics antes
  // de repintar no saltan una pregunta. Y solo con la pregunta respondida, aunque el botón ya esté
  // desactivado sin ella: el `disabled` lo pone el render, y un clic que llega antes no lo ve.
  function irSiguiente(e: React.MouseEvent<HTMLButtonElement>): void {
    if (clicDeMas(e) || respuestas[preguntaActual] === -1) return;
    registrarClic(true);
    if (preguntaActual < PREGUNTAS.length - 1) {
      setPreguntaActual(preguntaActual + 1);
    } else {
      setMostrarResultado(true);
    }
  }

  function irAnterior(e: React.MouseEvent<HTMLButtonElement>): void {
    if (clicDeMas(e) || preguntaActual === 0) return;
    registrarClic(true);
    setPreguntaActual(preguntaActual - 1);
  }

  function reiniciar(e: React.MouseEvent<HTMLButtonElement>): void {
    if (clicDeMas(e)) return;
    registrarClic(true);
    setPreguntaActual(0);
    setRespuestas(Array(PREGUNTAS.length).fill(-1));
    setMostrarResultado(false);
  }

  const pregunta = PREGUNTAS[preguntaActual];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Selector de Movilidad Urbana</h1>
        <p>10 preguntas para descubrir qué medio de transporte se adapta mejor a tu vida</p>
      </header>

      {/* Costes en euros de una ciudad española y normativa de España en la guía (DGT, ZBE,
          IRPF); el test en sí sirve en cualquier país (hallazgo 1503, como el 1340 de mascota). */}
      <RegionBadge variant="es-data" />

      <LegalNotice />

      {!mostrarResultado ? (
        <main className={styles.quiz} aria-label="Test de movilidad urbana">
          {/* El «Pregunta N de 10» estaba en el aria-label de este <div>, genérico, que no lo
              expone: la barra no tenía nombre (axe: aria-progressbar-name) y se anunciaba «10 %»
              en la pregunta 1 sin contestar (hallazgo 2697). Nombre y texto van en la propia
              barra; la escala (porcentaje de la pregunta en curso) no cambia, y cuadra con lo
              que pinta el relleno. */}
          <div className={styles.progreso}>
            <span>{preguntaActual + 1}/{PREGUNTAS.length}</span>
            <div
              className={styles.barraProgreso}
              role="progressbar"
              aria-label={`Pregunta ${preguntaActual + 1} de ${PREGUNTAS.length}`}
              aria-valuenow={Math.round(porcentajeProgreso)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuetext={`Pregunta ${preguntaActual + 1} de ${PREGUNTAS.length}`}
            >
              <div
                className={styles.barraProgresoRelleno}
                style={{ width: `${porcentajeProgreso}%` }}
              />
            </div>
            <span>{Math.round(porcentajeProgreso)}{'\u00A0'}%</span>
          </div>

          <div className={styles.pregunta}>
            <div className={styles.preguntaHeader}>
              <span className={styles.preguntaIcono} aria-hidden="true">{pregunta.icono}</span>
              {/* Encabezado con tabIndex −1: recibe el foco al cambiar de pregunta (2695). */}
              <h2 className={styles.preguntaTexto} ref={enunciado} tabIndex={-1}>{pregunta.texto}</h2>
            </div>

            <div className={styles.opciones} role="radiogroup" aria-label={pregunta.texto}>
              {pregunta.opciones.map((opcion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.opcion} ${opcionSeleccionada === idx ? styles.seleccionada : ''}`}
                  onClick={(e) => elegirOpcion(e, idx)}
                  // role="radio" + aria-checked, no aria-pressed: la elección es ÚNICA entre
                  // varias, no un conmutador. El contenedor declaraba radiogroup sin un solo
                  // radio dentro (selector-smartphone, hallazgo 950).
                  role="radio"
                  aria-checked={opcionSeleccionada === idx}
                  // Tabindex itinerante: la marcada, o la primera si no hay ninguna (2696).
                  tabIndex={opcionSeleccionada === -1 ? (idx === 0 ? 0 : -1) : opcionSeleccionada === idx ? 0 : -1}
                  onKeyDown={(e) => teclaEnOpcion(e, idx)}
                >
                  <span className={styles.opcionIcono} aria-hidden="true">{opcion.icono}</span>
                  <span className={styles.opcionTexto}>{opcion.texto}</span>
                  <span className={styles.opcionMarca} aria-hidden="true" />
                </button>
              ))}
            </div>
          </div>

          <div className={styles.navegacion}>
            <button
              type="button"
              className={styles.btnSecundario}
              onClick={irAnterior}
              disabled={preguntaActual === 0}
              aria-label="Pregunta anterior"
            >
              ← Anterior
            </button>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={irSiguiente}
              disabled={opcionSeleccionada === -1}
              aria-label={preguntaActual < PREGUNTAS.length - 1 ? 'Siguiente pregunta' : 'Ver mi resultado'}
            >
              {preguntaActual < PREGUNTAS.length - 1 ? 'Siguiente →' : 'Ver mi resultado'}
            </button>
          </div>
        </main>
      ) : (
        <main className={styles.resultado} aria-label="Resultado del selector">
          {(() => {
            const calculo = calcularResultado(respuestas);
            const res = TRANSPORTES[calculo.tipo];
            return (
              <div className={styles.resultadoCard}>
                <div className={styles.resultadoIcono} aria-hidden="true">{res.icono}</div>
                <p className={styles.resultadoEtiqueta}>{res.etiqueta}</p>
                <h2 className={styles.resultadoTitulo} ref={tituloResultado} tabIndex={-1}>{res.titulo}</h2>
                <p className={styles.resultadoDescripcion}>{res.descripcion}</p>

                {/* Lo declarado como imposibilidad descarta, y se dice si ha cambiado algo:
                    antes salía el transporte público a quien decía que en su zona no lo hay, o
                    la bici a quien tiene limitaciones de movilidad (hallazgos 1488-1490). */}
                {calculo.avisoDescarte && (
                  <p className={styles.avisoDescarte} role="note">
                    <span aria-hidden="true">⚠️</span> {calculo.avisoDescarte}
                  </p>
                )}

                {/* Un empate no se resuelve en silencio: antes lo ganaba la combinación
                    multimodal, que era el valor inicial del reduce, o el coche por ser el
                    primero del objeto. */}
                {calculo.empatados.length > 0 && (
                  <p className={styles.avisoEmpate} role="note">
                    <span aria-hidden="true">⚖️</span> Empate: con tus respuestas,{' '}
                    {enumerar([calculo.tipo, ...calculo.empatados].map((k) => CON_ARTICULO[k]))}{' '}
                    encajan exactamente igual; {calculo.criterioDesempate}.
                  </p>
                )}

                {/* Por qué: las respuestas que más han sumado. La descripción afirmaba cosas
                    del usuario que no dependían de lo contestado («Vives en una ciudad bien
                    comunicada…» a quien había marcado una red deficiente). */}
                <div className={styles.razones}>
                  <h3>Por qué esta recomendación</h3>
                  <ul>
                    {calculo.razones.map((razon) => (
                      <li key={razon}>{razon}</li>
                    ))}
                  </ul>
                </div>

                {/* Las preferencias declaradas que el medio recomendado no cumple (carga, coste,
                    seguridad, clima, distancia): siguen siendo pesos, pero ya no en silencio
                    (hallazgos 1491-1494). */}
                {calculo.enContra.length > 0 && (
                  <div className={styles.enContra}>
                    <h3>Lo que juega en contra, según tus respuestas</h3>
                    <ul>
                      {calculo.enContra.map((texto) => (
                        <li key={texto}>{texto}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <ul className={styles.resultadoVentajas} aria-label="Ventajas principales">
                  {res.ventajas.map((ventaja, i) => (
                    <li key={i}>{ventaja}</li>
                  ))}
                </ul>

                <div className={styles.costoEstimado}>
                  <strong><span aria-hidden="true">💶</span> Coste orientativo</strong>
                  {res.costoMensual}
                  <span className={styles.costoNota}>
                    Estimación orientativa de meskeIA (2026) para una ciudad española: cambia mucho
                    con la ciudad, el vehículo y el uso.
                  </span>
                </div>

                {/* Sin aria-label: el nombre accesible es el texto visible, «Repetir el test»
                    (WCAG 2.5.3; antes se llamaba «Volver a hacer el test», hallazgo 1507). */}
                <button
                  type="button"
                  className={styles.btnReiniciar}
                  onClick={reiniciar}
                >
                  Repetir el test
                </button>
              </div>
            );
          })()}
        </main>
      )}

      <DisclaimerCard variant="general" severity="medium" />

      <EducationalSection
        title="Movilidad urbana en España"
        subtitle="Encuentra el transporte que mejor se adapta a tu vida"
      >
        <div>
          <h3>¿Por qué la movilidad urbana importa?</h3>
          {/* Antes «13–22 % del gasto mensual», sin fuente (hallazgo 1501). INE, EPF 2025,
              nota de prensa del 25/06/2026: el transporte, el 11,5 % del presupuesto del hogar. */}
          <p>
            En España, el transporte supuso el <strong>11,5&nbsp;% del presupuesto de los hogares</strong>{' '}
            en 2025, según la Encuesta de Presupuestos Familiares del INE (nota de prensa del
            25/06/2026). Elegir bien el medio de cada día cambia ese gasto y tu huella de carbono.
          </p>

          <h3>Los 5 medios de transporte urbano</h3>
          {/* Una sola fuente para los costes: COSTE_MENSUAL de ./motor.ts, la misma de la
              tarjeta y del FAQPage (hallazgo 1496). */}
          <ul>
            <li>
              <strong>Coche propio (carro o auto en Latinoamérica):</strong> responde a distancias
              largas, a cargas frecuentes y a zonas sin transporte público, pero es el más caro:{' '}
              {rangoMensual('coche_propio')} ({COSTE_MENSUAL.coche_propio.incluye}).
            </li>
            <li>
              <strong>Transporte público:</strong> metro, autobús, tranvía o cercanías. Con abono,{' '}
              {rangoMensual('transporte_publico')}; rinde cuando la red cubre tu origen, tu destino y
              tus horarios.
            </li>
            <li>
              <strong>Moto o escúter:</strong> ágil en distancias medias y fácil de aparcar;{' '}
              {rangoMensual('moto_escuter')} ({COSTE_MENSUAL.moto_escuter.incluye}). Las motos
              eléctricas pueden llevar el distintivo ambiental CERO de la DGT, y el Programa Auto+
              (más abajo) ayuda a comprarlas.
            </li>
            <li>
              <strong>Bicicleta o patinete eléctrico:</strong> para trayectos cortos, sobre todo
              donde hay carriles bici, es lo más sostenible y lo más barato de mantener:{' '}
              {rangoMensual('bici_patinete')}, sin contar la compra.
            </li>
            <li>
              <strong>Combinación multimodal:</strong> aparcar en la periferia y seguir en metro, o
              combinar bici y tren, permite ajustar tiempo y coste; los abonos integrados facilitan
              pasar de un medio a otro. Según la combinación, {rangoMensual('combinacion')}.
            </li>
          </ul>
          <p>
            Las horquillas de coste son una estimación orientativa de meskeIA (2026) para una
            ciudad española, no una estadística oficial: cambian mucho con la ciudad, el vehículo y
            el uso.
          </p>

          <h3>Factores clave para decidir</h3>
          <ul>
            {/* Antes: «Por encima de 30 km, el transporte público interurbano suele ser la mejor
                opción precio-tiempo», sin fuente y al revés de lo que suma el test, que con más
                de 40 km da 4 puntos al coche y ninguno al transporte público (hallazgo 1495). */}
            <li>
              <strong>Distancia:</strong> la bici y el patinete rinden en trayectos cortos. En los
              largos, el coche gana flexibilidad; si hay transporte público interurbano (cercanías,
              autobús) que una tu origen y tu destino, compara los dos en tiempo y en coste.
            </li>
            <li>
              <strong>Coste total:</strong> con las horquillas de este test, un coche cuesta{' '}
              {rangoAnual('coche_propio')} al año contando amortización, seguro, combustible,
              aparcamiento y mantenimiento; una bici o un patinete, {rangoAnual('bici_patinete')} al
              año de mantenimiento o carga.
            </li>
            <li>
              <strong>Infraestructura local:</strong> Verifica el Plan de Movilidad Urbana
              Sostenible (PMUS) de tu municipio para conocer inversiones previstas en ciclismo y
              transporte público.
            </li>
            {/* Antes: «Desde enero de 2023 son obligatorias» y, en el coche, «restringen el
                acceso … desde 2023» (hallazgo 1500). La Ley 7/2021, art. 14.3, obliga a
                ADOPTAR planes que incluyan ZBE; cuándo y cómo restringen lo decide cada
                ordenanza municipal. */}
            <li>
              <strong>Zonas de bajas emisiones (ZBE):</strong> la Ley 7/2021 de cambio climático
              (art. 14.3) obliga a los municipios de más de 50.000 habitantes y a los territorios
              insulares —y a los de más de 20.000 cuando superan los valores límite de contaminación
              del aire— a establecer ZBE en sus planes de movilidad. La ley fijaba 2023 como plazo,
              pero cuándo empiezan a restringir el acceso y con qué reglas lo decide la ordenanza de
              cada municipio: consúltala, y mira qué distintivo ambiental de la DGT tiene tu vehículo
              (CERO, ECO, C o B).
            </li>
          </ul>

          <h3>Ayudas y ventajas fiscales en España</h3>
          {/* Antes: «El Plan MOVES III ofrece ayudas…» (terminó el 31/12/2025: RDL 3/2025,
              art. 1; hallazgo 1497) y «deducciones en el IRPF … desde 2023» (es una exención de
              lo que paga la empresa, art. 46 bis RIRPF; hallazgo 1498). Las motos eléctricas no
              tienen IVA reducido (hallazgo 1499): la frase se ha retirado. */}
          <p>
            El Plan MOVES III, que ayudaba a comprar vehículos eléctricos, terminó el 31 de
            diciembre de 2025 (Real Decreto-ley 3/2025). El programa estatal que lo sigue es el{' '}
            <strong>Programa Auto+</strong> (Real Decreto 609/2026, de 22 de julio, vigente hasta
            2030), del Ministerio de Industria y Turismo: ayuda a particulares y empresas a comprar
            turismos, furgonetas y motos eléctricos con el distintivo CERO de la DGT. Los importes y
            requisitos están en su convocatoria.
          </p>
          {/* Antes: «directamente o con una tarjeta o un vale … exenta hasta 1.500 € al año
              (Reglamento del IRPF, art. 46 bis)», sin el tope mensual de la tarjeta (hallazgo
              2701). Texto consolidado del BOE leído el 02/10/2026: el límite anual lo fija la Ley
              35/2006, art. 42.3.e) (BOE-A-2006-20764), «con el límite de 1.500 euros anuales para
              cada trabajador»; para las fórmulas indirectas, el RD 439/2007, art. 46 bis.1.2.º
              (BOE-A-2007-6820), «no podrá exceder de 136,36 euros mensuales por trabajador, con
              el límite de 1.500 euros anuales», y el 46 bis.2: si se incumplen esos límites,
              «únicamente existirá retribución en especie por el exceso». El 46 bis habla de
              «tarjetas o cualquier otro medio electrónico de pago»: el «vale» se ha retirado. */}
          <p>
            Si tu empresa te paga el transporte público entre casa y el trabajo, esa retribución en
            especie está exenta de IRPF hasta 1.500 € al año por trabajador (Ley del IRPF, art.
            42.3.e). Si lo hace con una tarjeta de transporte u otro medio electrónico de pago, el
            Reglamento del IRPF (art. 46 bis) pone además un tope de <strong>136,36 € al mes</strong>,
            sin pasar de los 1.500 € al año, y lo que exceda de esos límites tributa como
            retribución en especie. Es una exención de lo que paga la empresa, no una deducción que
            el trabajador se aplique en su declaración.
          </p>

          <div className={styles.warningBox}>
            <span className={styles.warningIcono} aria-hidden="true">⚠️</span>
            <span>
              Este selector ofrece orientación general. Las condiciones específicas de tu ciudad,
              normativa de circulación y situación personal pueden variar. Consulta el Ayuntamiento
              y la DGT para información actualizada sobre ZBE y etiquetas ambientales.
            </span>
          </div>
        </div>
      </EducationalSection>

      <RelatedApps />

      <ShareCard appName="selector-movilidad-urbana" />

      <Footer appName="selector-movilidad-urbana" />
    </div>
  );
}
