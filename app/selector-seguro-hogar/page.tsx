'use client';

import React, { useEffect, useRef, useState } from 'react';
import styles from './SelectorSeguroHogar.module.css';
import { MeskeiaLogo, Footer, LegalNotice, RelatedApps, EducationalSection, ShareCard, DisclaimerCard, RegionBadge } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { calcularResultado, PREGUNTAS, VEREDICTOS, UMBRAL_BASICA, UMBRAL_ESTANDAR, type Resultado } from './motor';

// Las preguntas con sus puntos, los veredictos y la lógica viven en ./motor.ts.

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

type Pantalla = 'inicio' | 'test' | 'resultado';

export default function SelectorSeguroHogar() {
  const [pantalla, setPantalla] = useState<Pantalla>('inicio');
  const [paso, setPaso] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, string>>({});
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const tituloResultado = useRef<HTMLHeadingElement>(null);

  // Al pulsar «Ver resultado» la sección del test se desmonta con el botón que tenía el foco, y
  // el foco caía a <body> (hallazgo 1527): se lleva al encabezado del resultado.
  useEffect(() => {
    if (pantalla === 'resultado') tituloResultado.current?.focus();
  }, [pantalla]);

  const preguntaActual = PREGUNTAS[paso];
  const totalPreguntas = PREGUNTAS.length;
  const progreso = (paso / totalPreguntas) * 100;

  function seleccionarOpcion(valor: string) {
    setRespuestas(prev => ({ ...prev, [preguntaActual.id]: valor }));
  }

  function avanzar() {
    if (paso < totalPreguntas - 1) {
      setPaso(p => p + 1);
    } else {
      setResultado(calcularResultado(respuestas));
      setPantalla('resultado');
    }
  }

  function retroceder() {
    if (paso > 0) setPaso(p => p - 1);
  }

  function reiniciar() {
    setPantalla('inicio');
    setPaso(0);
    setRespuestas({});
    setResultado(null);
  }

  const veredictoData = resultado ? VEREDICTOS[resultado.veredicto] : null;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {pantalla !== 'resultado' ? (
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>¿Qué seguro de hogar necesitas?</h1>
          <p className={styles.heroSubtitle}>
            {pantalla === 'inicio'
              ? 'Descubre la cobertura adecuada para tu vivienda y situación real'
              : `Pregunta ${paso + 1} de ${totalPreguntas} · ${preguntaActual.categoria}`}
          </p>
        </header>
      ) : (
        <header className={styles.heroResultados}>
          <h1 className={styles.heroTitleSm} ref={tituloResultado} tabIndex={-1}>Tu cobertura recomendada</h1>
          <p className={styles.heroSubtitleSm}>{veredictoData?.titulo ?? ''}</p>
        </header>
      )}

      {/* Ley de Contrato de Seguro, Consorcio de Compensación de Seguros, seguro exigido con
          hipoteca y precios del mercado español: la app no sirve fuera de España (hallazgo 1522). */}
      <RegionBadge variant="es-only" fuenteDelegum={false} text="Solo España: coberturas, precios y normativa de los seguros de hogar españoles (Ley de Contrato de Seguro y Consorcio de Compensación de Seguros)" />

      <LegalNotice />
      <DisclaimerCard variant="financial" severity="critical" />

      {/* ── Pantalla de inicio ── */}
      {pantalla === 'inicio' && (
        <div className={styles.introContainer}>
          <div className={styles.introCard}>
            <div className={styles.introIconGrid} aria-hidden="true">
              <span className={styles.introIcon}>🏠</span>
              <span className={styles.introIcon}>🔒</span>
              <span className={styles.introIcon}>💧</span>
              <span className={styles.introIcon}>🛡️</span>
            </div>
            <h2 className={styles.introTitulo}>¿Qué seguro de hogar necesitas?</h2>
            <p className={styles.introDesc}>
              La cobertura adecuada según tu vivienda y situación personal. En 10 preguntas analizamos
              tu régimen de tenencia, el tipo de vivienda, la zona y el valor de lo que quieres proteger
              para orientarte sin sesgos comerciales.
            </p>
            <ul className={styles.introFeatures} aria-label="Qué obtendrás con este test">
              <li><span aria-hidden="true">✅</span> Veredicto claro: básica, estándar o completa</li>
              <li><span aria-hidden="true">✅</span> Coberturas incluidas y recomendadas por perfil</li>
              <li><span aria-hidden="true">✅</span> Rango de precio orientativo en España</li>
              <li><span aria-hidden="true">✅</span> Consejos para contratar sin errores</li>
            </ul>
            <button
              type="button"
              className={styles.btnStart}
              onClick={() => setPantalla('test')}
            >
              Empezar el test →
            </button>
          </div>
        </div>
      )}

      {/* ── Pantalla de test ── */}
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
              aria-label={`Progreso del test: pregunta ${paso + 1} de ${totalPreguntas}`}
              // Lo anunciado y lo pintado van sobre la misma escala: preguntas RESPONDIDAS
              // (paso / total). aria-valuenow era el número de pregunta con mínimo 1, y un
              // lector de pantalla anunciaba otra fracción que la que se veía (mismo defecto
              // y misma reparación que selector-smartphone, hallazgo 951).
              aria-valuenow={paso}
              aria-valuemin={0}
              aria-valuemax={totalPreguntas}
              aria-valuetext={`Pregunta ${paso + 1} de ${totalPreguntas}`}
            >
              <div className={styles.progresoRelleno} data-progreso={progreso} style={{ width: `${progreso}%` }} />
            </div>
          </div>

          <div className={styles.preguntaCard}>
            <span className={styles.preguntaIcon} aria-hidden="true">{preguntaActual.icono}</span>
            <h2 className={styles.preguntaTexto}>{preguntaActual.texto}</h2>
            <div className={styles.opcionesGrid} role="radiogroup" aria-label={preguntaActual.texto}>
              {preguntaActual.opciones.map(op => (
                <button
                  key={op.valor}
                  type="button"
                  className={`${styles.opcionBtn} ${respuestas[preguntaActual.id] === op.valor ? styles.opcionSeleccionada : ''}`}
                  onClick={() => seleccionarOpcion(op.valor)}
                  // role="radio" + aria-checked, no aria-pressed: la elección es ÚNICA entre
                  // varias, no un conmutador. El contenedor declaraba radiogroup sin un solo
                  // radio dentro (selector-smartphone, hallazgo 950).
                  role="radio"
                  aria-checked={respuestas[preguntaActual.id] === op.valor}
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

      {/* ── Pantalla de resultado ── */}
      {pantalla === 'resultado' && resultado && veredictoData && (
        <div className={styles.resultadosContainer}>

          {/* Veredicto principal */}
          <div className={`${styles.veredictoCard} ${styles[`veredicto_${resultado.veredicto}`]}`}>
            <span className={styles.veredictoIcon} aria-hidden="true">{veredictoData.icono}</span>
            <p className={styles.veredictoLabel}>{veredictoData.etiqueta}</p>
            <p className={styles.veredictoValor}>{veredictoData.titulo}</p>
            <p className={styles.veredictoDesc}>{resultado.ficha.descripcion}</p>
          </div>

          {/* Lo declarado que la cobertura recomendada no recoge, dicho a la cara y fuera de la guía
              plegada (hallazgos 1514, 1515 y 1521). */}
          {resultado.avisos.map((aviso) => (
            <p key={aviso} className={styles.aviso} role="note">
              <span aria-hidden="true">⚠️</span> {aviso}
            </p>
          ))}

          {/* Precio orientativo */}
          <p className={styles.precioRango}>{veredictoData.precioOrientativo}</p>
          <p className={styles.precioNota}>{resultado.ficha.precioNota}</p>

          {/* Grid de coberturas: la ficha ya filtrada por lo declarado (al inquilino no se le manda
              valorar ni asegurar el continente, que no es suyo: hallazgo 1513) */}
          <div className={styles.coberturaGrid}>
            <div className={styles.coberturaCard}>
              <p className={styles.coberturaTitulo}>Coberturas incluidas</p>
              {resultado.ficha.coberturaIncluida.map((item, i) => (
                <p key={i} className={styles.coberturaItem}>{item}</p>
              ))}
            </div>
            <div className={styles.coberturaCard}>
              <p className={styles.coberturaTitulo}>También recomendamos</p>
              {resultado.ficha.coberturaRecomendada.map((item, i) => (
                <p key={i} className={styles.coberturaItem}>{item}</p>
              ))}
            </div>
          </div>

          {/* Por qué esta cobertura */}
          <div className={styles.razonesSection}>
            <p className={styles.razonesTitulo}>Por qué esta cobertura</p>
            {/* Salen de las respuestas. Antes eran cuatro fijas por cobertura, y a quien salía
                «completa» sin objetos de valor le decían «Tienes objetos de valor que
                requieren cobertura específica». */}
            <p className={styles.puntuacionNota}>
              Tu puntuación es {resultado.puntuacion}: hasta {UMBRAL_BASICA}, cobertura básica; hasta{' '}
              {UMBRAL_ESTANDAR}, multirriesgo estándar; por encima, multirriesgo completa. Lo que más ha sumado:
            </p>
            {resultado.razones.map((razon) => (
              <p key={razon} className={styles.razonItem}>{razon}</p>
            ))}
          </div>

          {resultado.sinPeso.length > 0 && (
            <div className={styles.razonesSection}>
              <p className={styles.razonesTitulo}>Lo que no ha sumado</p>
              {resultado.sinPeso.map((razon) => (
                <p key={razon} className={`${styles.razonItem} ${styles.razonContraria}`}>{razon}</p>
              ))}
            </div>
          )}

          {/* Antes de contratar */}
          <div className={styles.consejosSection}>
            <p className={styles.consejosTitulo}>Antes de contratar</p>
            {resultado.ficha.consejos.map((consejo, i) => (
              <p key={i} className={styles.consejoItem}>{consejo}</p>
            ))}
          </div>

          {/* Sección educativa */}
          <EducationalSection
            title="Guía completa: seguros de hogar en España"
            subtitle="Continente, contenido, coberturas, infraseguro y cómo comparar sin errores"
            defaultOpen={false}
          >
            <h3>Diferencia entre seguro de continente y contenido</h3>
            <p>
              El <strong>continente</strong> es la estructura del inmueble: paredes, suelos, techo, instalaciones fijas
              (fontanería, electricidad, calefacción). Solo interesa a propietarios. El <strong>contenido</strong>
              son todos los bienes muebles: muebles, electrodomésticos, ropa, electrónica, joyas. Tanto propietarios
              como inquilinos pueden asegurar el contenido. Un error frecuente es solo asegurar el continente y olvidar
              el contenido, o viceversa.
            </p>

            <h3>Qué es el infraseguro y cómo evitarlo</h3>
            {/* Antes el ejemplo medía el capital contra lo que «vale» el piso. La regla proporcional
                (art. 30 de la Ley 50/1980) compara la suma asegurada con el valor del interés
                asegurado, y el continente se asegura por reconstrucción sin el suelo (hallazgo 1518). */}
            <p>
              El infraseguro ocurre cuando el capital asegurado es inferior al valor del interés asegurado: para el
              continente, lo que costaría reconstruir la vivienda, sin el suelo; para el contenido, el valor de tus
              bienes tal como lo defina la póliza. En caso de siniestro, la aseguradora aplica la <em>regla
              proporcional</em> (art. 30 de la Ley 50/1980 de Contrato de Seguro): si tienes asegurado el 60 % de ese
              valor, te indemnizará el 60 % del daño, aunque el daño sea parcial, salvo que la póliza la excluya.
            </p>
            <div className={styles.warningBox}>
              <strong>Ejemplo práctico:</strong> tu piso se vende por 200.000 €, pero reconstruirlo (sin el suelo, que
              no se quema) costaría 150.000 €. Si lo tienes asegurado por 90.000 €, cubres el 60 % del valor de
              reconstrucción: en un incendio con 40.000 € de daños, la aseguradora pagará 24.000 € (el 60 %). Si lo
              aseguras por 150.000 €, no hay infraseguro y cobras los 40.000 €; asegurarlo por los 200.000 € del
              precio de venta sería pagar prima por el suelo. Actualiza el capital asegurado cada pocos años y cuando
              hagas reformas importantes.
            </div>

            <h3>Qué siniestros son más frecuentes en los hogares españoles</h3>
            {/* Antes: agua 45 %, robo 20 %, incendio 15 %, fenómenos 12 % y RC 8 %, sin fuente y sumando
                exactamente 100 (hallazgo 1517). Cifras de ICEA, nota del 25/06/2025. */}
            <p>
              Según ICEA (Análisis Técnico de los Seguros Multirriesgo, estadística del año 2024), el 38,2 % de los
              siniestros de hogar fueron daños por agua, seguidos de los de asistencia, con un 15,2 %. Por importe,
              los daños por agua supusieron el 42,4 % del total; los cristales, el 10,8 %, y los fenómenos
              atmosféricos, el 9,3 %. Por siniestro, un incendio costó de media 3.719 €, frente a 718 € un robo.
            </p>
            <ul>
              <li><strong>Daños por agua:</strong> fugas, roturas de tuberías, filtraciones desde pisos superiores y comunidades. Es el siniestro más habitual.</li>
              <li><strong>Asistencia:</strong> reparaciones urgentes de fontanería, cerrajería o electricidad; es la segunda causa por número de siniestros.</li>
              <li><strong>Cristales y fenómenos atmosféricos:</strong> roturas de cristales, granizo, viento, nieve o rayos. El Consorcio de Compensación de Seguros cubre algunos fenómenos extraordinarios.</li>
              <li><strong>Incendio y explosión:</strong> potencialmente catastrófico. Suele estar incluido en todas las coberturas.</li>
              <li><strong>Robo:</strong> tanto en el interior como expoliación fuera del hogar. La cobertura varía mucho entre pólizas: revisa el capital máximo y las exclusiones.</li>
              <li><strong>Responsabilidad civil:</strong> daños causados a terceros (vecinos, viandantes) por descuidos o accidentes en tu vivienda.</li>
            </ul>

            <h3>Propietario vs inquilino: qué cubre cada uno</h3>
            <p>
              Como <strong>propietario</strong> necesitas asegurar el continente (obligatorio si tienes hipoteca: el
              Real Decreto 716/2009, art. 10, exige asegurar el inmueble contra daños por su valor de tasación, sin el
              suelo) y opcionalmente el contenido y la responsabilidad civil. Como <strong>inquilino</strong>, el
              continente es responsabilidad del propietario; tú solo necesitas asegurar tu contenido y una
              buena responsabilidad civil por daños que puedas causar. Un seguro de inquilino asegura menos capital
              que uno con continente, así que su prima es menor, y te protege de situaciones como una fuga tuya que
              inunde al vecino de abajo.
              Tanto si hablamos de alquiler como de arriendo, el reparto es el mismo: el dueño asegura el
              inmueble y quien arrienda protege sus propias pertenencias y su responsabilidad civil.
            </p>

            <h3>Cómo comparar seguros sin caer en trampas</h3>
            <ul>
              <li><strong>No compares solo el precio:</strong> Una póliza barata con capital de robo de 3.000 € puede ser inútil si tu electrónica vale más. Compara capitales y coberturas, no solo primas.</li>
              <li><strong>Lee las exclusiones:</strong> Los seguros excluyen habitualmente daños por humedad ambiental, desgaste ordinario, obras sin permiso y siniestros por negligencia grave.</li>
              <li><strong>Atención a las franquicias:</strong> Algunas pólizas económicas tienen franquicias (cantidad mínima que asumes tú) de 150-300 €, lo que hace inútil reclamar siniestros pequeños.</li>
              <li><strong>Consorcio de Compensación de Seguros:</strong> Cualquier seguro de hogar en España incluye automáticamente cobertura del Consorcio para catástrofes naturales extraordinarias (terremotos, inundaciones graves, erupciones). No necesitas contratarlo por separado.</li>
              {/* Antes nombraba siete marcas y atribuía «mejores condiciones» a dos, en una app que promete
                  orientar «sin sesgos comerciales» (hallazgo 1519). */}
              <li><strong>Pide varios presupuestos:</strong> directamente a aseguradoras o a través de un mediador o un comparador, pero compara siempre las mismas coberturas y los mismos capitales, no solo la prima.</li>
            </ul>
          </EducationalSection>

          {/* Botón repetir */}
          <button
            type="button"
            className={styles.btnRepetir}
            onClick={reiniciar}
            aria-label="Repetir el test desde el principio"
          >
            ← Repetir el test
          </button>

          {/* Aviso orientativo */}
          <div className={styles.warningBox}>
            Esta herramienta es orientativa. Las coberturas y precios indicados son aproximados y pueden variar
            significativamente según la aseguradora, la zona y las características específicas de tu vivienda.
            Compara siempre varias pólizas antes de contratar.
          </div>

        </div>
      )}

      <ShareCard appName="selector-seguro-hogar" />
      <RelatedApps apps={getRelatedApps('selector-seguro-hogar')} />
      <Footer appName="selector-seguro-hogar" />
    </div>
  );
}
