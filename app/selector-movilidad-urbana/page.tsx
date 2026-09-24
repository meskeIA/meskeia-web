'use client';

import { useState } from 'react';
import styles from './SelectorMovilidadUrbana.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
  DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { calcularResultado, TRANSPORTES, CON_ARTICULO, PREGUNTAS } from './motor';

// Las preguntas con sus pesos, las fichas de cada medio y la lógica viven en ./motor.ts.

/** Lista legible: «A, B y C». */
function enumerar(items: string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`;
}

// ===== COMPONENTE PRINCIPAL =====

export default function SelectorMovilidadUrbana() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<number[]>(Array(PREGUNTAS.length).fill(-1));
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const opcionSeleccionada = respuestas[preguntaActual];
  const porcentajeProgreso = ((preguntaActual + 1) / PREGUNTAS.length) * 100;

  function seleccionarOpcion(indice: number): void {
    const nuevasRespuestas = [...respuestas];
    nuevasRespuestas[preguntaActual] = indice;
    setRespuestas(nuevasRespuestas);
  }

  function irSiguiente(): void {
    if (preguntaActual < PREGUNTAS.length - 1) {
      setPreguntaActual(preguntaActual + 1);
    } else {
      setMostrarResultado(true);
    }
  }

  function irAnterior(): void {
    if (preguntaActual > 0) {
      setPreguntaActual(preguntaActual - 1);
    }
  }

  function reiniciar(): void {
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

      <LegalNotice />

      {!mostrarResultado ? (
        <main className={styles.quiz} aria-label="Test de movilidad urbana">
          <div className={styles.progreso} aria-label={`Pregunta ${preguntaActual + 1} de ${PREGUNTAS.length}`}>
            <span>{preguntaActual + 1}/{PREGUNTAS.length}</span>
            <div className={styles.barraProgreso} role="progressbar" aria-valuenow={Math.round(porcentajeProgreso)} aria-valuemin={0} aria-valuemax={100}>
              <div
                className={styles.barraProgresoRelleno}
                style={{ width: `${porcentajeProgreso}%` }}
              />
            </div>
            <span>{Math.round(porcentajeProgreso)}%</span>
          </div>

          <div className={styles.pregunta}>
            <div className={styles.preguntaHeader}>
              <span className={styles.preguntaIcono} aria-hidden="true">{pregunta.icono}</span>
              <p className={styles.preguntaTexto}>{pregunta.texto}</p>
            </div>

            <div className={styles.opciones} role="radiogroup" aria-label={pregunta.texto}>
              {pregunta.opciones.map((opcion, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.opcion} ${opcionSeleccionada === idx ? styles.seleccionada : ''}`}
                  onClick={() => seleccionarOpcion(idx)}
                  // role="radio" + aria-checked, no aria-pressed: la elección es ÚNICA entre
                  // varias, no un conmutador. El contenedor declaraba radiogroup sin un solo
                  // radio dentro (selector-smartphone, hallazgo 950).
                  role="radio"
                  aria-checked={opcionSeleccionada === idx}
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
                <h2 className={styles.resultadoTitulo}>{res.titulo}</h2>
                <p className={styles.resultadoDescripcion}>{res.descripcion}</p>

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

                <ul className={styles.resultadoVentajas} aria-label="Ventajas principales">
                  {res.ventajas.map((ventaja, i) => (
                    <li key={i}>{ventaja}</li>
                  ))}
                </ul>

                <div className={styles.costoEstimado}>
                  <strong><span aria-hidden="true">💶</span> Coste orientativo</strong>
                  {res.costoMensual}
                </div>

                <button
                  type="button"
                  className={styles.btnReiniciar}
                  onClick={reiniciar}
                  aria-label="Volver a hacer el test"
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
          <p>
            El transporte representa el <strong>13–22 % del gasto mensual</strong> de los hogares
            españoles. Elegir bien puede suponer un ahorro de cientos de euros al mes y reducir
            significativamente tu huella de carbono.
          </p>

          <h3>Los 5 medios de transporte urbano en España</h3>
          <ul>
            <li>
              <strong>Coche propio (también llamado carro o auto en Latinoamérica):</strong> Necesario fuera de grandes ciudades o con cargas
              frecuentes, pero el más caro (400–700 €/mes en ciudad). Las ZBE (Zonas de Bajas
              Emisiones) restringen el acceso de vehículos contaminantes en ciudades de más de
              50.000 habitantes desde 2023.
            </li>
            <li>
              <strong>Transporte público:</strong> La red de metro, autobús y cercanías de ciudades
              como Madrid, Barcelona o Valencia es de las mejores de Europa. Los abonos mensuales
              oscilan entre 20 y 55 €, con descuentos hasta el 50 % para jóvenes (Tarjeta Joven).
            </li>
            <li>
              <strong>Moto o escúter:</strong> El equilibrio ideal para distancias medias. El seguro
              obligatorio parte de 100–200 €/año, y el aparcamiento es gratuito en la mayoría de
              aceras señalizadas. Las motos eléctricas tienen ventajas fiscales (IVA reducido,
              acceso a ZBE).
            </li>
            <li>
              <strong>Bicicleta o patinete eléctrico:</strong> Para distancias cortas (menos de 10
              km) en ciudades con infraestructura ciclista, la bici o e-patinete es casi gratuita y
              la más sostenible. El 60 % de los municipios españoles tiene red de bici-carriles en
              expansión.
            </li>
            <li>
              <strong>Combinación multimodal:</strong> Cada vez más extendida en España. Park &amp;
              Ride (aparcar en periferia + metro), o e-bike + tren, permiten optimizar tiempo y
              coste. Las tarjetas combinadas de transporte facilitan el intermodalismo.
            </li>
          </ul>

          <h3>Factores clave para decidir</h3>
          <ul>
            <li>
              <strong>Distancia y tiempo:</strong> Por encima de 30 km, el transporte público
              interurbano suele ser la mejor opción precio-tiempo.
            </li>
            <li>
              <strong>Coste total de propiedad:</strong> Un coche (carro o auto) de ciudad puede costar
              más de 7.000 €/año contando todo. La bicicleta, menos de 150 €/año.
            </li>
            <li>
              <strong>Infraestructura local:</strong> Verifica el Plan de Movilidad Urbana
              Sostenible (PMUS) de tu municipio para conocer inversiones previstas en ciclismo y
              transporte público.
            </li>
            <li>
              <strong>Zonas de Bajas Emisiones:</strong> Desde enero de 2023 son obligatorias en
              municipios de más de 50.000 habitantes. Consulta si tu vehículo tiene etiqueta
              ambiental de la DGT (CERO, ECO, C, B).
            </li>
          </ul>

          <h3>Ayudas y deducciones disponibles en España</h3>
          <p>
            El Plan MOVES III ofrece ayudas de hasta 7.000 € para la compra de vehículos
            eléctricos o de pila de combustible. Los abonos de transporte público también tienen
            deducciones en el IRPF para trabajadores (hasta 1.500 € anuales desde 2023).
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

      <RelatedApps apps={getRelatedApps('selector-movilidad-urbana')} />

      <ShareCard appName="selector-movilidad-urbana" />

      <Footer appName="selector-movilidad-urbana" />
    </div>
  );
}
