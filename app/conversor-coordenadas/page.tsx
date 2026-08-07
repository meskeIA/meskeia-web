'use client';
// @disclaimer: exempt — herramienta técnica de conversión, sin consejo profesional

import { useState, useMemo, useCallback } from 'react';
import styles from './ConversorCoordenadas.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';
import {
  aUTM,
  aMGRS,
  aSexagesimal,
  aGradosMinutosDecimales,
  distanciaYRumbo,
  rumboACardinal,
  interpretarCoordenada,
  type PuntoGeografico,
} from '@/lib/geo/coordenadas';

type Pestana = 'convertir' | 'distancia';
type Precision = 1 | 2 | 3 | 4 | 5;

interface EjemploPunto {
  nombre: string;
  entrada: string;
}

// Puntos repartidos por los dos hemisferios y por varias zonas UTM: sirven de ejemplo
// y a la vez enseñan que el formato de entrada da igual
const EJEMPLOS: EjemploPunto[] = [
  { nombre: 'Puerta del Sol', entrada: '40,416775, -3,703790' },
  { nombre: 'Sagrada Familia', entrada: `41°24'12,2"N 2°10'26,5"E` },
  { nombre: 'Teide', entrada: '28,272337, -16,642510' },
  { nombre: 'Machu Picchu', entrada: '-13,163140, -72,544963' },
  { nombre: 'Ushuaia', entrada: '-54,801912, -68,302948' },
];

const PRECISIONES: { valor: Precision; etiqueta: string; detalle: string }[] = [
  { valor: 2, etiqueta: '1 km', detalle: '2 dígitos por eje' },
  { valor: 3, etiqueta: '100 m', detalle: '3 dígitos por eje' },
  { valor: 4, etiqueta: '10 m', detalle: '4 dígitos por eje' },
  { valor: 5, etiqueta: '1 m', detalle: '5 dígitos por eje' },
];

const NOMBRE_FORMATO: Record<string, string> = {
  decimal: 'grados decimales',
  sexagesimal: 'grados, minutos y segundos',
  'grados-minutos': 'grados y minutos decimales',
  utm: 'UTM',
  mgrs: 'MGRS',
};

export default function ConversorCoordenadasPage() {
  const [pestanaActiva, setPestanaActiva] = useState<Pestana>('convertir');
  const [entrada, setEntrada] = useState('40,416775, -3,703790');
  const [precisionMGRS, setPrecisionMGRS] = useState<Precision>(5);
  const [copiado, setCopiado] = useState<string | null>(null);

  // Pestaña de distancia
  const [origen, setOrigen] = useState('40,416775, -3,703790');
  const [destino, setDestino] = useState('41,385064, 2,173404');

  const interpretacion = useMemo(() => interpretarCoordenada(entrada), [entrada]);

  const conversiones = useMemo(() => {
    if (!interpretacion) return null;
    const punto = interpretacion.punto;

    const latGMS = aSexagesimal(punto.latitud, 'lat');
    const lonGMS = aSexagesimal(punto.longitud, 'lon');
    const latGM = aGradosMinutosDecimales(punto.latitud, 'lat');
    const lonGM = aGradosMinutosDecimales(punto.longitud, 'lon');

    let utm: string | null = null;
    let mgrs: string | null = null;
    let avisoPolar: string | null = null;

    try {
      const coordUTM = aUTM(punto);
      utm = `${coordUTM.zona} ${coordUTM.banda || coordUTM.hemisferio} ${formatNumber(coordUTM.este, 2)} ${formatNumber(coordUTM.norte, 2)}`;
      mgrs = aMGRS(coordUTM, precisionMGRS);
    } catch (error) {
      avisoPolar = error instanceof Error ? error.message : 'No convertible a UTM.';
    }

    const fmtGMS = (c: ReturnType<typeof aSexagesimal>) =>
      `${c.grados}° ${String(c.minutos).padStart(2, '0')}' ${formatNumber(c.segundos, 2)}" ${c.hemisferio}`;
    const fmtGM = (c: ReturnType<typeof aGradosMinutosDecimales>) =>
      `${c.grados}° ${formatNumber(c.minutos, 3)}' ${c.hemisferio}`;

    return {
      punto,
      decimal: `${formatNumber(punto.latitud, 6)}, ${formatNumber(punto.longitud, 6)}`,
      decimalCrudo: `${punto.latitud.toFixed(6)}, ${punto.longitud.toFixed(6)}`,
      gms: `${fmtGMS(latGMS)}  ${fmtGMS(lonGMS)}`,
      gm: `${fmtGM(latGM)}  ${fmtGM(lonGM)}`,
      utm,
      mgrs,
      avisoPolar,
    };
  }, [interpretacion, precisionMGRS]);

  const recorrido = useMemo(() => {
    const a = interpretarCoordenada(origen);
    const b = interpretarCoordenada(destino);
    if (!a || !b) return null;
    const r = distanciaYRumbo(a.punto, b.punto);
    return { ...r, origen: a.punto, destino: b.punto };
  }, [origen, destino]);

  const copiar = useCallback(async (texto: string, clave: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(clave);
      window.setTimeout(() => setCopiado((actual) => (actual === clave ? null : actual)), 1800);
    } catch {
      setCopiado(null);
    }
  }, []);

  const enlaceMapa = (punto: PuntoGeografico) =>
    `https://www.openstreetmap.org/?mlat=${punto.latitud.toFixed(6)}&mlon=${punto.longitud.toFixed(6)}#map=16/${punto.latitud.toFixed(5)}/${punto.longitud.toFixed(5)}`;

  const filas = conversiones
    ? [
        { clave: 'decimal', etiqueta: 'Grados decimales', valor: conversiones.decimal, copia: conversiones.decimalCrudo, nota: 'El formato de Google Maps y de la mayoría de APIs' },
        { clave: 'gms', etiqueta: 'Grados, minutos y segundos', valor: conversiones.gms, copia: conversiones.gms, nota: 'El de los mapas topográficos y las escrituras' },
        { clave: 'gm', etiqueta: 'Grados y minutos decimales', valor: conversiones.gm, copia: conversiones.gm, nota: 'El de la náutica y la aviación' },
        { clave: 'utm', etiqueta: 'UTM', valor: conversiones.utm ?? '—', copia: conversiones.utm ?? '', nota: 'Zona, banda, este y norte en metros' },
        { clave: 'mgrs', etiqueta: 'MGRS', valor: conversiones.mgrs ?? '—', copia: conversiones.mgrs ?? '', nota: 'Cuadrícula de montaña, rescate y ámbito militar' },
      ]
    : [];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span aria-hidden="true" className={styles.heroIcon}>🧭</span>
        <h1>Conversor de Coordenadas Geográficas</h1>
        <p>
          Pega una coordenada en el formato que tengas —decimal, grados minutos segundos, UTM o
          MGRS— y obtén todos los demás. Con distancia y rumbo entre dos puntos.
        </p>
      </header>

      <LegalNotice />

      <div className={styles.tabs} role="tablist" aria-label="Modo de la herramienta">
        <button
          type="button"
          role="tab"
          aria-selected={pestanaActiva === 'convertir'}
          className={`${styles.tab} ${pestanaActiva === 'convertir' ? styles.tabActiva : ''}`}
          onClick={() => setPestanaActiva('convertir')}
        >
          <span aria-hidden="true">🔄</span> Convertir formatos
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={pestanaActiva === 'distancia'}
          className={`${styles.tab} ${pestanaActiva === 'distancia' ? styles.tabActiva : ''}`}
          onClick={() => setPestanaActiva('distancia')}
        >
          <span aria-hidden="true">📐</span> Distancia y rumbo
        </button>
      </div>

      {pestanaActiva === 'convertir' && (
        <section className={styles.panel} role="tabpanel" aria-label="Conversión de formatos">
          <div className={styles.campoEntrada}>
            <label className={styles.label} htmlFor="entrada-coordenada">
              Coordenada de entrada
            </label>
            <input
              id="entrada-coordenada"
              type="text"
              className={styles.input}
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              placeholder={`40,416775, -3,703790  ·  40°25'00,4"N 3°42'13,6"O  ·  30 T 440291 4474255`}
              autoComplete="off"
              spellCheck={false}
            />
            <p className={styles.ayuda}>
              Vale la coma o el punto decimal, la O de Oeste o la W inglesa, y cualquier símbolo de
              grado. También acepta UTM (<code>30 T 440291 4474255</code>) y MGRS (<code>30T VK 40291 74254</code>).
            </p>
          </div>

          <div className={styles.ejemplos}>
            <span className={styles.ejemplosTitulo}>Prueba con:</span>
            {EJEMPLOS.map((ejemplo) => (
              <button
                key={ejemplo.nombre}
                type="button"
                className={styles.chipEjemplo}
                onClick={() => setEntrada(ejemplo.entrada)}
              >
                {ejemplo.nombre}
              </button>
            ))}
          </div>

          {!interpretacion && entrada.trim() !== '' && (
            <div className={styles.aviso} role="alert" aria-live="polite">
              <span aria-hidden="true">⚠️</span>
              <div>
                <strong>No se reconoce esa coordenada.</strong>
                <p>
                  Revisa que la latitud esté entre -90 y 90, la longitud entre -180 y 180, y que los
                  minutos y segundos no lleguen a 60. Si vienen de un mapa antiguo, comprueba antes
                  el datum: ED50 y ETRS89 no son intercambiables.
                </p>
              </div>
            </div>
          )}

          {interpretacion && conversiones && (
            <>
              <p className={styles.formatoDetectado} aria-live="polite">
                <span aria-hidden="true">✅</span> Interpretado como{' '}
                <strong>{NOMBRE_FORMATO[interpretacion.formato]}</strong>
              </p>

              <div className={styles.resultados}>
                {filas.map((fila) => (
                  <div key={fila.clave} className={styles.filaResultado}>
                    <div className={styles.filaTexto}>
                      <span className={styles.filaEtiqueta}>{fila.etiqueta}</span>
                      <span className={styles.filaValor}>{fila.valor}</span>
                      <span className={styles.filaNota}>{fila.nota}</span>
                    </div>
                    <button
                      type="button"
                      className={styles.btnCopiar}
                      onClick={() => copiar(fila.copia, fila.clave)}
                      disabled={!fila.copia}
                      aria-label={`Copiar ${fila.etiqueta}`}
                    >
                      {copiado === fila.clave ? '✓ Copiado' : 'Copiar'}
                    </button>
                  </div>
                ))}
              </div>

              {conversiones.avisoPolar && (
                <p className={styles.avisoPolar} role="note">
                  <span aria-hidden="true">🧊</span> {conversiones.avisoPolar}
                </p>
              )}

              <div className={styles.precisionBloque}>
                <span className={styles.label}>Precisión del MGRS</span>
                <div className={styles.precisionBotones}>
                  {PRECISIONES.map((p) => (
                    <button
                      key={p.valor}
                      type="button"
                      aria-pressed={precisionMGRS === p.valor}
                      className={`${styles.chipPrecision} ${precisionMGRS === p.valor ? styles.chipActivo : ''}`}
                      onClick={() => setPrecisionMGRS(p.valor)}
                    >
                      {p.etiqueta}
                      <span className={styles.chipDetalle}>{p.detalle}</span>
                    </button>
                  ))}
                </div>
              </div>

              <a
                className={styles.enlaceMapa}
                href={enlaceMapa(conversiones.punto)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span aria-hidden="true">🗺️</span> Ver este punto en OpenStreetMap
              </a>
            </>
          )}
        </section>
      )}

      {pestanaActiva === 'distancia' && (
        <section className={styles.panel} role="tabpanel" aria-label="Distancia y rumbo">
          <div className={styles.dosCampos}>
            <div className={styles.campoEntrada}>
              <label className={styles.label} htmlFor="punto-origen">Punto de origen</label>
              <input
                id="punto-origen"
                type="text"
                className={styles.input}
                value={origen}
                onChange={(e) => setOrigen(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
            <div className={styles.campoEntrada}>
              <label className={styles.label} htmlFor="punto-destino">Punto de destino</label>
              <input
                id="punto-destino"
                type="text"
                className={styles.input}
                value={destino}
                onChange={(e) => setDestino(e.target.value)}
                autoComplete="off"
                spellCheck={false}
              />
            </div>
          </div>

          {!recorrido ? (
            <div className={styles.aviso} role="alert" aria-live="polite">
              <span aria-hidden="true">⚠️</span>
              <div>
                <strong>Hace falta que los dos puntos sean reconocibles.</strong>
                <p>Admiten los mismos formatos que la pestaña de conversión.</p>
              </div>
            </div>
          ) : (
            <>
              <div className={styles.tarjetasDistancia}>
                <div className={styles.tarjetaDistancia}>
                  <span className={styles.tarjetaEtiqueta}>Distancia</span>
                  <span className={styles.tarjetaValor}>
                    {recorrido.distancia >= 1000
                      ? `${formatNumber(recorrido.distancia / 1000, 3)} km`
                      : `${formatNumber(recorrido.distancia, 1)} m`}
                  </span>
                  <span className={styles.tarjetaNota}>
                    En línea recta sobre la superficie terrestre (geodésica)
                  </span>
                </div>
                <div className={styles.tarjetaDistancia}>
                  <span className={styles.tarjetaEtiqueta}>Rumbo inicial</span>
                  <span className={styles.tarjetaValor}>
                    {formatNumber(recorrido.rumboInicial, 1)}° {rumboACardinal(recorrido.rumboInicial)}
                  </span>
                  <span className={styles.tarjetaNota}>
                    Medido desde el norte geográfico, no el magnético
                  </span>
                </div>
                <div className={styles.tarjetaDistancia}>
                  <span className={styles.tarjetaEtiqueta}>Rumbo de llegada</span>
                  <span className={styles.tarjetaValor}>
                    {formatNumber(recorrido.rumboFinal, 1)}° {rumboACardinal(recorrido.rumboFinal)}
                  </span>
                  <span className={styles.tarjetaNota}>
                    Cambia respecto al inicial: la ruta más corta no es una recta en el mapa
                  </span>
                </div>
              </div>

              <p className={styles.metodo} role="note">
                <span aria-hidden="true">📏</span>{' '}
                {recorrido.metodo === 'vincenty' ? (
                  <>
                    Calculado con la fórmula de <strong>Vincenty</strong> sobre el elipsoide WGS84:
                    precisión milimétrica.
                  </>
                ) : (
                  <>
                    Los dos puntos están casi en las antípodas y Vincenty no converge ahí, así que se
                    ha usado la fórmula del <strong>semiverseno</strong> sobre una esfera: el error
                    puede llegar al 0,5 %.
                  </>
                )}
              </p>
            </>
          )}
        </section>
      )}

      <EducationalSection
        title="Cómo funcionan las coordenadas geográficas"
        subtitle="Qué significa cada formato, cuándo se usa y por qué el datum importa más que los decimales"
        icon="🌍"
      >
        <p className={styles.eduIntro}>
          Una coordenada no es un número: es un número <strong>más el sistema en el que está
          escrito</strong>. La mayoría de los errores de localización no vienen de convertir mal,
          sino de convertir bien entre formatos mientras se ignora el datum. Este bloque explica qué
          significa cada formato, cuándo se usa y qué precisión tiene.
        </p>

        <h3 className={styles.eduSubtitulo}>Los cinco formatos, comparados</h3>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Formato</th>
                <th>Ejemplo</th>
                <th>Dónde se usa</th>
                <th>Ventaja</th>
                <th>Inconveniente</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Grados decimales</strong></td>
                <td>40,416775 · -3,703790</td>
                <td>Google Maps, GPS, APIs, bases de datos</td>
                <td>Se opera con él directamente</td>
                <td>El signo se pierde al copiar y manda al hemisferio contrario</td>
              </tr>
              <tr>
                <td><strong>Grados, minutos y segundos</strong></td>
                <td>40°25&apos;00,4&quot;N</td>
                <td>Mapas topográficos, escrituras, catastro</td>
                <td>Es el de la cartografía clásica</td>
                <td>Incómodo de calcular: es base 60</td>
              </tr>
              <tr>
                <td><strong>Grados y minutos decimales</strong></td>
                <td>40°25,006&apos;N</td>
                <td>Náutica y aviación</td>
                <td>Un minuto de latitud es una milla náutica</td>
                <td>Se confunde a simple vista con el anterior</td>
              </tr>
              <tr>
                <td><strong>UTM</strong></td>
                <td>30 T 440291 4474255</td>
                <td>Topografía, ingeniería, SIG</td>
                <td>Está en metros: se mide y se resta</td>
                <td>Sin la zona no significa nada</td>
              </tr>
              <tr>
                <td><strong>MGRS</strong></td>
                <td>30T VK 40291 74254</td>
                <td>Montaña, rescate, ámbito militar</td>
                <td>Corto de dictar y con precisión graduable</td>
                <td>Hay que conocer la cuadrícula para leerlo</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className={styles.eduSubtitulo}>Quién necesita cada conversión</h3>
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcono} aria-hidden="true">🥾</span>
            <strong>Excursionismo y montaña</strong>
            <p>
              El mapa del parque natural viene en UTM y el móvil da decimales. Convertir permite
              cotejar la posición real con la hoja impresa, que es la que sigue funcionando cuando se
              acaba la batería. Para dar una posición por radio, el MGRS es más corto y se dicta sin
              errores.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcono} aria-hidden="true">📐</span>
            <strong>Topografía y obra</strong>
            <p>
              Los proyectos se replantean en UTM porque está en metros: la distancia entre dos puntos
              se calcula restando. La conversión a geográficas hace falta al cruzar con datos de GPS
              o con cartografía de otra fuente.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcono} aria-hidden="true">🛥️</span>
            <strong>Náutica y aviación</strong>
            <p>
              Las cartas usan grados y minutos decimales porque un minuto de latitud equivale a una
              milla náutica: se mide con el compás sobre la escala lateral sin convertir nada. El
              rumbo de esta herramienta es geográfico; para gobernar hay que aplicarle la declinación
              magnética de la zona.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <span className={styles.escenarioIcono} aria-hidden="true">🎓</span>
            <strong>Estudio y clase</strong>
            <p>
              Pasar de grados decimales a sexagesimales y volver es un ejercicio clásico de base 60,
              y ver la misma coordenada en los cinco formatos a la vez hace tangible que la
              proyección no es la Tierra, sino una manera de aplanarla.
            </p>
          </div>
        </div>

        <h3 className={styles.eduSubtitulo}>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <details className={styles.faqItem}>
            <summary>¿Por qué mis coordenadas antiguas no coinciden con las del GPS?</summary>
            <p>
              Casi siempre es el datum. La cartografía española anterior a 2007 usa ED50 y la actual
              usa ETRS89, que a efectos prácticos coincide con el WGS84 de los GPS. El mismo punto
              tiene coordenadas distintas en cada sistema y la diferencia ronda los 200 metros en la
              Península. Esta herramienta trabaja en ETRS89/WGS84: si tu fuente es ED50, hay que
              transformarla antes con los parámetros oficiales del IGN.
            </p>
          </details>
          <details className={styles.faqItem}>
            <summary>¿Qué precisión tiene cada número de decimales?</summary>
            <p>
              En grados decimales, cada decimal divide la distancia por diez: el cuarto decimal son
              unos 11 metros, el quinto poco más de un metro y el sexto unos 11 centímetros. Dar más
              de seis decimales es fingir una precisión que ningún GPS de consumo tiene: lo normal
              son entre 3 y 10 metros de error.
            </p>
          </details>
          <details className={styles.faqItem}>
            <summary>¿Por qué UTM necesita la zona y las coordenadas geográficas no?</summary>
            <p>
              Porque UTM no es un sistema global sino 60 proyecciones distintas, una por huso de 6°.
              Los mismos metros de este y norte existen en las 60 y señalan 60 puntos diferentes.
              Anotar «440291 4474255» sin la zona es como dar un número de portal sin la calle.
            </p>
          </details>
          <details className={styles.faqItem}>
            <summary>¿Qué significan las letras del MGRS?</summary>
            <p>
              La primera es la banda de latitud, que va de la C a la X en escalones de 8° saltándose
              la I y la O. Las dos siguientes identifican un cuadro de 100 km dentro de la zona. Los
              dígitos finales sitúan el punto dentro de ese cuadro, y su número marca la precisión:
              con dos por eje se señala un kilómetro; con cinco, un metro.
            </p>
            <p className={styles.faqTip}>
              La I y la O no se usan en ninguna posición: por radio se confunden con el 1 y el 0.
            </p>
          </details>
          <details className={styles.faqItem}>
            <summary>¿La distancia que calcula es la que recorreré?</summary>
            <p>
              No. Es la distancia geodésica: la más corta sobre la superficie del elipsoide, sin
              carreteras ni desniveles. Sirve como referencia mínima absoluta, no como estimación de
              un trayecto. En montaña, además, un desnivel importante puede alargar bastante el
              recorrido real respecto a la proyección horizontal.
            </p>
          </details>
          <details className={styles.faqItem}>
            <summary>¿Por qué el rumbo de llegada no es el mismo que el de salida?</summary>
            <p>
              Porque la ruta más corta entre dos puntos de una esfera es un arco de círculo máximo, y
              ese arco va cruzando los meridianos con ángulos distintos. En trayectos cortos la
              diferencia es inapreciable; en un Madrid-Tokio son decenas de grados. Mantener un rumbo
              constante es navegar por una loxodroma, que es un camino distinto y más largo.
            </p>
          </details>
        </div>

        <h3 className={styles.eduSubtitulo}>Cómo usar la herramienta</h3>
        <ol className={styles.stepGuide}>
          <li className={styles.step}>
            <span className={styles.stepNumber}>1</span>
            <div className={styles.stepContent}>
              <strong>Pega la coordenada tal como la tengas</strong>
              <p>
                No hace falta elegir formato ni limpiar el texto: se detecta solo. Funciona con lo
                que copia Google Maps, con lo que aparece en una hoja del IGN y con lo que dicta una
                emisora.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>2</span>
            <div className={styles.stepContent}>
              <strong>Comprueba el formato detectado</strong>
              <p>
                Bajo el campo aparece cómo se ha interpretado. Si dice algo distinto de lo que
                esperabas, la entrada es ambigua: lo más habitual es un signo menos perdido o un
                hemisferio sin indicar.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>3</span>
            <div className={styles.stepContent}>
              <strong>Copia el formato que necesites</strong>
              <p>
                Cada fila tiene su botón. El de grados decimales copia el valor con punto decimal,
                que es lo que esperan las APIs y las hojas de cálculo en inglés.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>4</span>
            <div className={styles.stepContent}>
              <strong>Ajusta la precisión del MGRS a lo que vas a hacer</strong>
              <p>
                Para citar una zona de búsqueda bastan 100 metros; para marcar un vértice hacen falta
                los cinco dígitos. Dar más precisión de la que tienes transmite una falsa seguridad.
              </p>
            </div>
          </li>
          <li className={styles.step}>
            <span className={styles.stepNumber}>5</span>
            <div className={styles.stepContent}>
              <strong>Verifica en el mapa antes de fiarte</strong>
              <p>
                El enlace a OpenStreetMap abre el punto exacto. Un vistazo detecta al instante el
                error más común de todos: la coordenada que cae en mitad del océano porque se ha
                perdido el signo de la longitud.
              </p>
            </div>
          </li>
        </ol>

        <h3 className={styles.eduSubtitulo}>Buenas prácticas</h3>
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🗂️</span>
            <strong>Anota siempre el datum junto a la coordenada</strong>
            <p>
              Unos números sin sistema de referencia son un dato incompleto. «ETRS89» o «WGS84» al
              lado ahorra la duda de los 200 metros años después.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">➖</span>
            <strong>Prefiere N/S y E/O al signo</strong>
            <p>
              Un menos se pierde al copiar entre celdas o al pasar por un formulario. La letra del
              hemisferio sobrevive a casi todo y no admite interpretación.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">📶</span>
            <strong>Guarda el MGRS si vas a transmitir por voz</strong>
            <p>
              Es el formato diseñado para dictarse: menos caracteres, sin decimales que confundir y
              con la precisión ajustable al detalle que haga falta.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">🧲</span>
            <strong>Corrige la declinación si vas con brújula</strong>
            <p>
              Los rumbos de aquí son geográficos. La brújula apunta al norte magnético, que en la
              Península se desvía varios grados y cambia con los años.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores frecuentes al manejar coordenadas</strong>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Confundir ED50 con ETRS89.</strong> Es el error más caro y el más silencioso:
              todo parece correcto y el punto está 200 metros más allá. Mira la leyenda del mapa antes
              de convertir.
            </li>
            <li>
              <strong>Invertir latitud y longitud.</strong> La mayoría de los mapas piden latitud
              primero, pero algunas librerías y formatos como GeoJSON usan el orden contrario. Si el
              punto aparece en el mar, es lo primero que hay que mirar.
            </li>
            <li>
              <strong>Perder el signo de la longitud.</strong> En España casi todas son negativas
              (oeste). Sin el menos, Madrid se planta en Turquía.
            </li>
            <li>
              <strong>Dar UTM sin la zona.</strong> El este y el norte por sí solos son ambiguos: la
              misma pareja de números existe en las 60 zonas del planeta.
            </li>
            <li>
              <strong>Copiar más decimales de los que se tienen.</strong> Seis decimales son 11
              centímetros. Si el dato viene de un móvil con 5 metros de error, esa precisión es
              inventada.
            </li>
            <li>
              <strong>Tomar la distancia geodésica por la del camino.</strong> Es la línea recta sobre
              el elipsoide, sin carreteras, sin desniveles y sin obstáculos.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conversor-coordenadas')} />
      <ShareCard appName="conversor-coordenadas" />
      <Footer appName="conversor-coordenadas" />
    </div>
  );
}
