'use client';

import React, { useState } from 'react';
import styles from './SelectorVehiculo.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
  DisclaimerCard,
} from '@/components';
import { formatCurrency } from '@/lib';

import {
  PREGUNTAS,
  TOTAL,
  SEGMENTOS,
  MOTORES,
  calcularRecomendacion,
  modelosDe,
  motoresDeLaTabla,
  textoPrecios,
  type Resultado,
} from './motor';

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function SelectorVehiculo() {
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const preguntaActual = paso >= 1 && paso <= TOTAL ? PREGUNTAS[paso - 1] : null;
  const progreso = paso >= 1 && paso <= TOTAL ? ((paso - 1) / TOTAL) * 100 : 0;
  const respuestaActual = paso >= 1 ? respuestas[paso] : undefined;

  function seleccionar(valor: string) {
    setRespuestas((prev) => ({ ...prev, [paso]: valor }));
  }

  function siguiente() {
    if (paso < TOTAL) {
      setPaso((p) => p + 1);
    } else {
      setResultado(calcularRecomendacion(respuestas));
      setPaso(TOTAL + 1);
    }
  }

  function anterior() {
    setPaso((p) => Math.max(0, p - 1));
  }

  function reiniciar() {
    setPaso(0);
    setRespuestas({});
    setResultado(null);
  }

  // ── Intro ──────────────────────────────────

  if (paso === 0) {
    return (
      <div className={styles.container}>
        <MeskeiaLogo />
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>¿Qué coche te conviene?</h1>
          <p className={styles.heroSubtitle}>
            Gasolina o eléctrico. Compacto o SUV. Grande o pequeño.
            <br />
            13 preguntas para dar con el coche que realmente se adapta a ti.
          </p>
        </header>

        <LegalNotice />

        <main className={styles.introContainer}>
          <div className={styles.introCard}>
            <div className={styles.introIconGrid}>
              <span className={styles.introIcon}>🚗</span>
              <span className={styles.introIcon}>🚙</span>
              <span className={styles.introIcon}>⚡</span>
              <span className={styles.introIcon}>🏔️</span>
            </div>
            <h2 className={styles.introTitulo}>El test de orientación de vehículo</h2>
            <p className={styles.introDesc}>
              Con tantas opciones en el mercado, elegir el tipo de coche se ha vuelto complejo.
              Este test analiza tu perfil real y te recomienda el segmento y la motorización más
              adecuados, con comparativa de costes anuales y a 5 años.
            </p>
            <ul className={styles.introFeatures}>
              <li><span aria-hidden="true">📍</span> 13 preguntas sobre tu uso y perfil real</li>
              <li><span aria-hidden="true">🎯</span> Recomendación de segmento y motorización</li>
              <li><span aria-hidden="true">🏷️</span> Etiqueta DGT y modelos de referencia</li>
              <li><span aria-hidden="true">💶</span> Comparativa de costes anuales y a 5 años</li>
              <li><span aria-hidden="true">⏱️</span> Solo 3 minutos</li>
            </ul>
            <button type="button" className={styles.btnStart} onClick={() => setPaso(1)}>
              Empezar el test
            </button>
          </div>
        </main>

        <RelatedApps />
        <ShareCard appName="selector-vehiculo" />
        <Footer key="pie" appName="selector-vehiculo" />
      </div>
    );
  }

  // ── Preguntas ──────────────────────────────

  if (paso >= 1 && paso <= TOTAL && preguntaActual) {
    return (
      <div className={styles.container}>
        <MeskeiaLogo />

        <main className={styles.testContainer}>
          <div className={styles.progresoWrap}>
            <div className={styles.progresoInfo}>
              <span className={styles.progresoPaso}>
                Pregunta {paso} de {TOTAL}
              </span>
              <span className={styles.progresoCategoria}>{preguntaActual.categoria}</span>
            </div>
            <div
              className={styles.progresoBar}
              role="progressbar"
              aria-label={`Progreso: pregunta ${paso} de ${TOTAL}`}
              // El relleno pinta las respondidas (paso − 1) / TOTAL: se anuncia eso. Con
              // valuenow = paso y mínimo 1 salía (paso − 1) / (TOTAL − 1) (cabo C0040)
              aria-valuenow={paso - 1}
              aria-valuemin={0}
              aria-valuemax={TOTAL}
              aria-valuetext={`Pregunta ${paso} de ${TOTAL}`}
            >
              <div className={styles.progresoRelleno} style={{ width: `${progreso}%` } as React.CSSProperties} />
            </div>
          </div>

          <div className={styles.preguntaCard}>
            <div className={styles.preguntaIcon} aria-hidden="true">
              {preguntaActual.icon}
            </div>
            <h2 className={styles.preguntaTexto}>{preguntaActual.pregunta}</h2>

            <div className={styles.opcionesGrid}>
              {preguntaActual.opciones.map((opcion) => (
                <button
                  type="button"
                  key={opcion.valor}
                  className={`${styles.opcionBtn} ${
                    respuestaActual === opcion.valor ? styles.opcionSeleccionada : ''
                  }`}
                  onClick={() => seleccionar(opcion.valor)}
                  aria-pressed={respuestaActual === opcion.valor ? true : false}
                >
                  <span className={styles.opcionEtiqueta}>{opcion.etiqueta}</span>
                  <span className={styles.opcionDesc}>{opcion.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.navegacion}>
            <button
              type="button"
              className={styles.btnAnterior}
              onClick={anterior}
              aria-label="Pregunta anterior"
            >
              ← Anterior
            </button>
            <button
              type="button"
              className={styles.btnSiguiente}
              onClick={siguiente}
              disabled={!respuestaActual}
              aria-label={paso < TOTAL ? 'Siguiente pregunta' : 'Ver mi recomendación'}
            >
              {paso < TOTAL ? 'Siguiente →' : 'Ver mi recomendación ✓'}
            </button>
          </div>
        </main>

        <Footer key="pie" appName="selector-vehiculo" />
      </div>
    );
  }

  // ── Resultados ──────────────────────────────

  if (paso > TOTAL && resultado) {
    const segInfo = SEGMENTOS[resultado.segmentoKey];
    const motorInfo = MOTORES[resultado.motorPrincipal];
    const modelosDisponibles = modelosDe(resultado.segmentoKey, resultado.motorPrincipal);

    // El PHEV entra en la tabla solo cuando es el recomendado, y el eléctrico puro sigue en ella
    // (hasta el 19/11/2026 la fila del eléctrico pasaba a llamarse «PHEV»: hallazgo 5234).
    const motores = motoresDeLaTabla(resultado.motorPrincipal).map((tipo) => ({ tipo, info: MOTORES[tipo] }));

    const minimoTotal = Math.min(...motores.map(({ tipo }) => resultado.costes[tipo].total));

    return (
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.heroResultados}>
          <h1 className={styles.heroTitleSm}>Tu recomendación personalizada</h1>
          <p className={styles.heroSubtitleSm}>
            Basada en tu perfil de {resultado.kmAnuales.toLocaleString('es-ES')} km/año
          </p>
        </header>

        <main className={styles.resultadosContainer}>

          {/* Tarjetas principales */}
          <div className={styles.recomendacionGrid}>

            {/* Segmento */}
            <div className={styles.recomendacionCard}>
              <div className={styles.recomendacionIcon} aria-hidden="true">
                {segInfo.icon}
              </div>
              <div className={styles.recomendacionLabel}>Segmento recomendado</div>
              <div className={styles.recomendacionValor}>{segInfo.nombre}</div>
              <p className={styles.recomendacionDesc}>{segInfo.descripcion}</p>

              {/* Rango de precio */}
              <div className={styles.rangoPrecio}>
                <div className={styles.rangoPrecioItem}>
                  <span className={styles.rangoPrecioLabel}>Nuevo</span>
                  <span className={styles.rangoPrecioValor}>{segInfo.precioNuevo}</span>
                </div>
                {resultado.mostrarSegundaMano && (
                  <div className={styles.rangoPrecioItem}>
                    <span className={styles.rangoPrecioLabel}>2ª mano (2-5 años)</span>
                    <span className={styles.rangoPrecioValorSm}>{segInfo.precioSegundaMano}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Motorización */}
            <div className={`${styles.recomendacionCard} ${styles.recomendacionCardMotor}`}>
              <div className={styles.recomendacionIcon} aria-hidden="true">
                {motorInfo.icon}
              </div>
              <div className={styles.recomendacionLabel}>Motorización recomendada</div>
              <div className={styles.recomendacionValor}>{motorInfo.nombre}</div>

              {/* Etiqueta DGT */}
              <div className={styles.dgtWrap}>
                <span className={`${styles.etiquetaDGT} ${styles[`dgt_${motorInfo.colorDGT}`]}`}>
                  {motorInfo.etiquetaDGT}
                </span>
                <span className={styles.dgtDesc}>{motorInfo.descDGT}</span>
              </div>

              <p className={styles.recomendacionDesc}>{resultado.descripcionMotor}</p>

              {/* Modelos de referencia */}
              {modelosDisponibles.length > 0 && (
                <div className={styles.modelosWrap}>
                  <span className={styles.modelosLabel}>Ejemplos del mercado:</span>
                  <div className={styles.modelosList}>
                    {modelosDisponibles.map((m) => (
                      <span key={m} className={styles.modeloBadge}>{m}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Por qué esta recomendación */}
          {resultado.razones.length > 0 && (
            <div className={styles.razonesSection}>
              <h3 className={styles.razonesTitulo}>Por qué esta recomendación</h3>
              <ul className={styles.razonesList}>
                {resultado.razones.map((r, i) => (
                  <li key={i} className={styles.razonItem}>
                    <span className={styles.razonCheck} aria-hidden="true">✓</span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Alertas contextuales */}
          {resultado.alertas.length > 0 && (
            <div className={styles.alertasSection} role="alert" aria-live="polite">
              <h3 className={styles.alertasTitulo}>Ten en cuenta</h3>
              {resultado.alertas.map((alerta, i) => (
                <div key={i} className={styles.alertaItem}>
                  {alerta}
                </div>
              ))}
            </div>
          )}

          {/* Tabla comparativa de costes */}
          <div className={styles.tablaSection}>
            <h3 className={styles.tablaTitulo}>
              Coste estimado por tipo de motor
              <span className={styles.tablaSublabel}>
                Para {resultado.kmAnuales.toLocaleString('es-ES')} km/año — Valores orientativos 2025
              </span>
            </h3>
            <div className={styles.tablaResponsive}>
              <table className={styles.tabla}>
                <thead>
                  <tr>
                    <th scope="col">Motor</th>
                    <th scope="col">Combustible</th>
                    <th scope="col">Mant.</th>
                    <th scope="col">Fijos*</th>
                    <th scope="col">Año</th>
                    <th scope="col">5 años</th>
                  </tr>
                </thead>
                <tbody>
                  {motores.map(({ tipo, info }) => {
                    const c = resultado.costes[tipo];
                    const esRecomendado = tipo === resultado.motorPrincipal;
                    const esMasBarato = c.total === minimoTotal;
                    return (
                      <tr
                        key={tipo}
                        className={`${styles.tablaFila} ${styles[`fila_${tipo}`]} ${
                          esRecomendado ? styles.filaRecomendada : ''
                        }`}
                      >
                        <td className={styles.celMotor}>
                          <span aria-hidden="true">{info.icon}</span>{' '}
                          {info.nombre}
                          {esRecomendado && (
                            <span className={styles.badgeRecomendado}>✓ Recomendado</span>
                          )}
                          {esMasBarato && !esRecomendado && (
                            <span className={styles.badgeMasBarato}>Más barato</span>
                          )}
                        </td>
                        <td>{formatCurrency(c.combustible)}</td>
                        <td>{formatCurrency(c.mantenimiento)}</td>
                        <td className={styles.celFijos}>{formatCurrency(805)}</td>
                        <td className={styles.celTotal}>{formatCurrency(c.total)}</td>
                        <td className={styles.celTotal5}>{formatCurrency(c.total5)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className={styles.tablaNota}>
              * Fijos: seguro medio 650 € + ITV amortizada 35 € + impuesto circulación 120 €. El
              seguro varía según perfil y zona. Precios: {textoPrecios(resultado)}. La columna
              «5 años» proyecta el coste operativo acumulado sin incluir el precio de compra del
              vehículo.
              <span>
                {resultado.motorPrincipal === 'phev'
                  ? ' PHEV: supone la mitad de los km en eléctrico y la otra mitad con el consumo del híbrido, con su mantenimiento, porque lleva motor de combustión.'
                  : ''}
              </span>
            </p>
          </div>

          {/* CTA siguiente paso */}
          <div className={styles.siguientePaso}>
            <h3 className={styles.siguientePasoTitulo}>¿Ya sabes qué tipo de coche quieres?</h3>
            <p className={styles.siguientePasoDesc}>
              Ahora compara si te conviene más comprarlo al contado, financiarlo, hacer renting o
              leasing con el coste total real de cada opción.
            </p>
            <a href="/comparador-vehiculos/" className={styles.btnCta}>
              Comparar formas de compra <span aria-hidden="true">→</span>
            </a>
          </div>

          {/* Reiniciar */}
          <div className={styles.reiniciarWrap}>
            <button type="button" className={styles.btnReiniciar} onClick={reiniciar}>
              <span aria-hidden="true">↺</span> Repetir el test
            </button>
          </div>

          <DisclaimerCard
            variant="financial"
            severity="critical"
            context="selector-vehiculo"
          />

          <EducationalSection
            title="Guía de tipos de coche y motorizaciones"
            subtitle="Aprende a elegir el segmento y la motorización que realmente te conviene"
            defaultOpen={false}
          >
            <h3>¿Cómo elegir el segmento correcto?</h3>
            <p>
              El segmento del vehículo depende principalmente de tres factores: el número de
              ocupantes habitual, el tipo de conducción y las necesidades especiales de espacio o
              terreno. Un vehículo sobredimensionado es más caro de comprar, consumir y aparcar;
              uno demasiado pequeño generará frustración diaria.
            </p>
            <h3>El factor accesibilidad: por qué el SUV/crossover crece tanto</h3>
            <p>
              Los SUV y crossovers tienen una altura de acceso de 450-500 mm frente a los 380-420
              mm de un compacto. Esos 8-12 cm marcan una diferencia notable para personas con
              problemas de cadera, rodilla o espalda, mayores de 60 años, padres con silletas de
              bebé o cualquiera que cargue con frecuencia. El B-SUV (Arona, Kona, Captur) ofrece
              todas estas ventajas con el mismo tamaño exterior que un compacto B.
            </p>
            <h3>Gasolina vs. diésel: la regla de los km</h3>
            <p>
              El diésel compensa si haces más de 15.000-20.000 km anuales principalmente por
              carretera. Con km bajos o conducción urbana, el precio inicial más alto nunca se
              recupera. Con km altos en autovía y un horizonte de 5+ años, el diésel puede
              ahorrar 3.000-5.000 € respecto a la gasolina.
            </p>
            <h3>El híbrido convencional (HEV): la opción más equilibrada</h3>
            <p>
              Sin necesidad de enchufarse, el HEV recupera energía frenando y la usa para asistir
              al motor. En ciudad y uso mixto reduce el consumo un 20-35%. Toyota (Yaris, Corolla,
              RAV4), Honda (Jazz, HR-V) y Hyundai/Kia tienen modelos HEV con fiabilidad
              contrastada y excelente oferta de segunda mano.
            </p>
            <h3>El eléctrico: cuándo tiene sentido real</h3>
            <p>
              Un eléctrico tiene el menor coste por km (2-4 cts/km vs. 8-12 cts del gasolina) y
              el mantenimiento más reducido. Sin embargo, el precio inicial es mayor y la
              infraestructura de carga es determinante: sin garaje propio la ecuación cambia mucho.
              El PHEV resuelve la ansiedad de autonomía manteniendo la etiqueta CERO.
            </p>
            <h3>¿Nuevo o de segunda mano?</h3>
            <p>
              Un vehículo de 2-5 años es la mejor relación coste-valor: ha perdido el 30-40% de
              depreciación (que paga el primer dueño) pero conserva garantía y tecnología reciente.
              Los híbridos enchufables y eléctricos de segunda mano están abaratándose
              notablemente, con revisión de batería incluida en muchos concesionarios.
            </p>
            <div className={styles.warningBox}>
              <strong>Importante:</strong> Los costes son estimaciones orientativas basadas en
              medias de mercado 2025. El coste real depende del modelo concreto, tu forma de
              conducir y el seguro que contrates. Úsalos como referencia comparativa.
            </div>
          </EducationalSection>

          <RelatedApps />
          <ShareCard appName="selector-vehiculo" />
        </main>

        {/* key="pie" en los tres Footer: sin ella React lo remonta al cambiar de paso y el
            AnalyticsTracker registra otra visita (cabo C0042). */}
        <Footer key="pie" appName="selector-vehiculo" />
      </div>
    );
  }

  return null;
}
