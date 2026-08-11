'use client';

import { useMemo, useState } from 'react';
import styles from './CalculadoraFrigoriasBtu.module.css';
import {
  MeskeiaLogo,
  Footer,
  RelatedApps,
  EducationalSection,
  DisclaimerCard,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber, parseSpanishNumber } from '@/lib';

// Equivalencias exactas entre las tres unidades con las que se vende la misma potencia
const W_POR_FRIGORIA = 1.163; // 1 frigoría/h = 1 kcal/h = 1,163 W
const BTU_POR_W = 3.412142; // 1 W = 3,412142 BTU/h

type ZonaVerano = 'templada' | 'calida' | 'muyCalida';
type ZonaInvierno = 'suave' | 'fria' | 'muyFria';
type Aislamiento = 'bueno' | 'medio' | 'malo';
type Nivel = 'poca' | 'media' | 'mucha';
type Cristal = 'pequeno' | 'medio' | 'grande';

interface OpcionSelector<T> {
  id: T;
  label: string;
  detalle: string;
}

// Carga base de refrigeración por metro cúbico. Son los valores de dimensionado rápido
// habituales en instalación: el volumen manda sobre la superficie porque el aire que hay
// que enfriar es el de toda la estancia, no el del suelo.
const cargaBase: Record<ZonaVerano, number> = {
  templada: 30,
  calida: 40,
  muyCalida: 50,
};

// Carga de calefacción por metro cuadrado: aquí sí manda la envolvente, y el aislamiento
// pesa mucho más que en verano porque la pérdida es por transmisión continua.
const cargaCalefaccion: Record<ZonaInvierno, Record<Aislamiento, number>> = {
  suave: { bueno: 55, medio: 75, malo: 95 },
  fria: { bueno: 75, medio: 100, malo: 125 },
  muyFria: { bueno: 95, medio: 125, malo: 155 },
};

const factorAislamiento: Record<Aislamiento, number> = { bueno: 0.9, medio: 1, malo: 1.15 };
const factorSol: Record<Nivel, number> = { poca: 0.95, media: 1, mucha: 1.1 };
const factorCristal: Record<Cristal, number> = { pequeno: 0.95, medio: 1, grande: 1.1 };
const FACTOR_CUBIERTA = 1.1;
const W_POR_PERSONA = 100; // calor sensible + latente de una persona en reposo

// Tamaños comerciales habituales de equipo, en BTU/h. Sin marcas ni precios: es la escala
// con la que se etiquetan los equipos en cualquier país.
const tamanosComerciales = [9000, 12000, 18000, 24000, 30000, 36000, 42000, 48000];

const opcionesVerano: OpcionSelector<ZonaVerano>[] = [
  { id: 'templada', label: 'Templado', detalle: 'veranos de 28-32 °C' },
  { id: 'calida', label: 'Cálido', detalle: 'veranos de 33-38 °C' },
  { id: 'muyCalida', label: 'Muy cálido', detalle: 'por encima de 38 °C' },
];

const opcionesInvierno: OpcionSelector<ZonaInvierno>[] = [
  { id: 'suave', label: 'Suave', detalle: 'inviernos por encima de 5 °C' },
  { id: 'fria', label: 'Frío', detalle: 'entre 0 y 5 °C' },
  { id: 'muyFria', label: 'Muy frío', detalle: 'bajo cero con frecuencia' },
];

const opcionesAislamiento: OpcionSelector<Aislamiento>[] = [
  { id: 'bueno', label: 'Bueno', detalle: 'obra reciente o rehabilitada' },
  { id: 'medio', label: 'Medio', detalle: 'ventanas cambiadas, muro sin tocar' },
  { id: 'malo', label: 'Escaso', detalle: 'construcción antigua sin aislar' },
];

const opcionesSol: OpcionSelector<Nivel>[] = [
  { id: 'poca', label: 'Poco sol', detalle: 'norte o siempre en sombra' },
  { id: 'media', label: 'Sol medio', detalle: 'este, o sol unas horas' },
  { id: 'mucha', label: 'Mucho sol', detalle: 'sur u oeste, sol de tarde' },
];

const opcionesCristal: OpcionSelector<Cristal>[] = [
  { id: 'pequeno', label: 'Poca', detalle: 'una ventana normal' },
  { id: 'medio', label: 'Normal', detalle: 'ventanas en proporción a la sala' },
  { id: 'grande', label: 'Mucha', detalle: 'ventanal o pared acristalada' },
];

export default function CalculadoraFrigoriasBtuPage() {
  const [superficie, setSuperficie] = useState('20');
  const [altura, setAltura] = useState('2,5');
  const [zonaVerano, setZonaVerano] = useState<ZonaVerano>('calida');
  const [zonaInvierno, setZonaInvierno] = useState<ZonaInvierno>('suave');
  const [aislamiento, setAislamiento] = useState<Aislamiento>('medio');
  const [sol, setSol] = useState<Nivel>('media');
  const [cristal, setCristal] = useState<Cristal>('medio');
  const [bajoCubierta, setBajoCubierta] = useState(false);
  const [ocupantes, setOcupantes] = useState('2');
  const [equipos, setEquipos] = useState('200');

  // Validación y cálculo van por separado: una unión discriminada devuelta desde un
  // useMemo no discrimina bien al leerla en el JSX, así que se evita de raíz.
  const error = useMemo<string | null>(() => {
    const sup = parseSpanishNumber(superficie);
    const alt = parseSpanishNumber(altura);
    const pers = parseSpanishNumber(ocupantes);
    const equip = parseSpanishNumber(equipos);

    if (sup === null || alt === null || pers === null || equip === null) {
      return 'Revisa los datos: hay algún campo vacío o que no es un número.';
    }
    if (sup < 4 || sup > 300) return 'Introduce una superficie de entre 4 y 300 m².';
    if (alt < 2 || alt > 6) return 'Introduce una altura de entre 2 y 6 metros.';
    if (pers < 0 || pers > 30) return 'Introduce un número de ocupantes de entre 0 y 30.';
    if (equip < 0 || equip > 6000) return 'Introduce una potencia de equipos de entre 0 y 6.000 W.';
    return null;
  }, [superficie, altura, ocupantes, equipos]);

  const datos = useMemo(() => {
    if (error !== null) return null;
    const sup = parseSpanishNumber(superficie);
    const alt = parseSpanishNumber(altura);
    const pers = parseSpanishNumber(ocupantes);
    const equip = parseSpanishNumber(equipos);
    if (sup === null || alt === null || pers === null || equip === null) return null;

    const volumen = sup * alt;

    // --- Refrigeración: carga de la envolvente + cargas internas ---
    const base = volumen * cargaBase[zonaVerano];
    const correccion =
      factorAislamiento[aislamiento] * factorSol[sol] * factorCristal[cristal] * (bajoCubierta ? FACTOR_CUBIERTA : 1);
    const envolvente = base * correccion;
    const cargaPersonas = pers * W_POR_PERSONA;
    const frioW = envolvente + cargaPersonas + equip;

    // --- Calefacción: pérdida por transmisión, sin restar las cargas internas ---
    const calorW = sup * cargaCalefaccion[zonaInvierno][aislamiento] * (bajoCubierta ? FACTOR_CUBIERTA : 1);

    const frioBtu = frioW * BTU_POR_W;
    const equipoBtu = tamanosComerciales.find((t) => t >= frioBtu) ?? null;
    const margen = equipoBtu !== null ? (equipoBtu / frioBtu - 1) * 100 : 0;

    return {
      superficie: sup,
      volumen,
      base,
      correccion,
      envolvente,
      cargaPersonas,
      equipos: equip,
      frioW,
      frioFrigorias: frioW / W_POR_FRIGORIA,
      frioBtu,
      calorW,
      calorBtu: calorW * BTU_POR_W,
      equipoBtu,
      margen,
      // El consumo eléctrico depende del rendimiento estacional del equipo, que varía
      // mucho: se da como rango en lugar de fingir una cifra exacta.
      consumoMin: frioW / 8,
      consumoMax: frioW / 4.5,
    };
  }, [error, superficie, altura, zonaVerano, zonaInvierno, aislamiento, sol, cristal, bajoCubierta, ocupantes, equipos]);

  const renderSelector = <T extends string>(
    etiqueta: string,
    opciones: OpcionSelector<T>[],
    valor: T,
    onChange: (v: T) => void,
  ) => (
    <div className={styles.campo}>
      <span className={styles.etiqueta}>{etiqueta}</span>
      <div className={styles.opcionesGrid}>
        {opciones.map((o) => (
          <button
            key={o.id}
            type="button"
            className={`${styles.opcionBtn} ${valor === o.id ? styles.opcionActiva : ''}`}
            aria-pressed={valor === o.id}
            onClick={() => onChange(o.id)}
          >
            <span className={styles.opcionLabel}>{o.label}</span>
            <span className={styles.opcionDetalle}>{o.detalle}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">❄️</span> Calculadora de Frigorías y BTU
        </h1>
        <p className={styles.subtitle}>
          Cuánta potencia de frío y de calor necesita una estancia, y de dónde sale cada vatio
        </p>
      </header>

      <LegalNotice lastUpdated="2026-08-11" />

      <main className={styles.main}>
        <div className={styles.grid}>
          {/* ---------- Entradas ---------- */}
          <section className={styles.panel} aria-labelledby="tituloDatos">
            <h2 id="tituloDatos" className={styles.panelTitle}>
              <span aria-hidden="true">📐</span> La estancia
            </h2>

            <div className={styles.filaDoble}>
              <div className={styles.campo}>
                <label className={styles.etiqueta} htmlFor="superficie">
                  Superficie
                </label>
                <div className={styles.inputConUnidad}>
                  <input
                    id="superficie"
                    type="text"
                    inputMode="decimal"
                    className={styles.input}
                    value={superficie}
                    onChange={(e) => setSuperficie(e.target.value)}
                  />
                  <span className={styles.unidad}>m²</span>
                </div>
              </div>

              <div className={styles.campo}>
                <label className={styles.etiqueta} htmlFor="altura">
                  Altura del techo
                </label>
                <div className={styles.inputConUnidad}>
                  <input
                    id="altura"
                    type="text"
                    inputMode="decimal"
                    className={styles.input}
                    value={altura}
                    onChange={(e) => setAltura(e.target.value)}
                  />
                  <span className={styles.unidad}>m</span>
                </div>
              </div>
            </div>

            {renderSelector('Verano de tu zona', opcionesVerano, zonaVerano, setZonaVerano)}
            {renderSelector('Invierno de tu zona', opcionesInvierno, zonaInvierno, setZonaInvierno)}
            {renderSelector('Aislamiento', opcionesAislamiento, aislamiento, setAislamiento)}
            {renderSelector('Sol que recibe', opcionesSol, sol, setSol)}
            {renderSelector('Superficie acristalada', opcionesCristal, cristal, setCristal)}

            <div className={styles.campo}>
              <span className={styles.etiqueta}>Bajo cubierta</span>
              <button
                type="button"
                className={`${styles.toggle} ${bajoCubierta ? styles.toggleActivo : ''}`}
                aria-pressed={bajoCubierta}
                onClick={() => setBajoCubierta(!bajoCubierta)}
              >
                {bajoCubierta ? 'Sí, es la última planta o un ático' : 'No, tiene vivienda encima'}
              </button>
            </div>

            <div className={styles.filaDoble}>
              <div className={styles.campo}>
                <label className={styles.etiqueta} htmlFor="ocupantes">
                  Personas habituales
                </label>
                <input
                  id="ocupantes"
                  type="text"
                  inputMode="numeric"
                  className={styles.input}
                  value={ocupantes}
                  onChange={(e) => setOcupantes(e.target.value)}
                />
              </div>

              <div className={styles.campo}>
                <label className={styles.etiqueta} htmlFor="equipos">
                  Aparatos encendidos
                </label>
                <div className={styles.inputConUnidad}>
                  <input
                    id="equipos"
                    type="text"
                    inputMode="numeric"
                    className={styles.input}
                    value={equipos}
                    onChange={(e) => setEquipos(e.target.value)}
                  />
                  <span className={styles.unidad}>W</span>
                </div>
                <span className={styles.ayuda}>
                  Ordenador ≈ 150 W · televisor ≈ 100 W · horno u hornillo, mucho más
                </span>
              </div>
            </div>
          </section>

          {/* ---------- Resultados ---------- */}
          <section className={styles.panel} aria-labelledby="tituloResultado">
            <h2 id="tituloResultado" className={styles.panelTitle}>
              <span aria-hidden="true">📊</span> Potencia necesaria
            </h2>

            <div role="status" aria-live="polite">
              {error !== null && (
                <p className={styles.error} role="alert">
                  <span aria-hidden="true">⚠️</span> {error}
                </p>
              )}

              {datos && (
                <>
                  <div className={styles.destacado}>
                    <span className={styles.destacadoLabel}>Refrigeración</span>
                    <span className={styles.destacadoValor}>{formatNumber(datos.frioFrigorias, 0)}</span>
                    <span className={styles.destacadoUnidad}>frigorías/h</span>
                    <div className={styles.equivalencias}>
                      {formatNumber(datos.frioBtu, 0)} BTU/h · {formatNumber(datos.frioW, 0)} W
                    </div>
                  </div>

                  {datos.equipoBtu !== null ? (
                    <p className={styles.equipo}>
                      Equipo equivalente: <strong>{formatNumber(datos.equipoBtu, 0)} BTU</strong> (
                      {formatNumber((datos.equipoBtu / BTU_POR_W) / W_POR_FRIGORIA, 0)} frigorías), el primer tamaño
                      comercial que cubre la carga, con un margen del {formatNumber(datos.margen, 0)} %.
                    </p>
                  ) : (
                    <p className={styles.equipo}>
                      La carga supera el mayor tamaño de equipo doméstico habitual: la estancia pide{' '}
                      <strong>más de un equipo</strong> o una instalación de otra categoría.
                    </p>
                  )}

                  {datos.margen > 35 && datos.equipoBtu !== null && (
                    <p className={styles.avisoMargen} role="status">
                      <span aria-hidden="true">⚠️</span> Ese tamaño comercial queda un{' '}
                      {formatNumber(datos.margen, 0)} % por encima de lo calculado. Sobra potencia: el equipo enfriará
                      a golpes y deshumidificará peor. Merece la pena comprobar si existe un tamaño intermedio.
                    </p>
                  )}

                  <div className={styles.tarjetasGrid}>
                    <div className={styles.tarjeta}>
                      <span className={styles.tarjetaLabel}>Calefacción</span>
                      <span className={styles.tarjetaValor}>{formatNumber(datos.calorW / 1000, 2)} kW</span>
                      <span className={styles.tarjetaPie}>{formatNumber(datos.calorBtu, 0)} BTU/h</span>
                    </div>
                    <div className={styles.tarjeta}>
                      <span className={styles.tarjetaLabel}>Consumo eléctrico</span>
                      <span className={styles.tarjetaValor}>
                        {formatNumber(datos.consumoMin / 1000, 2)}-{formatNumber(datos.consumoMax / 1000, 2)} kW
                      </span>
                      <span className={styles.tarjetaPie}>según la eficiencia del equipo</span>
                    </div>
                    <div className={styles.tarjeta}>
                      <span className={styles.tarjetaLabel}>Volumen</span>
                      <span className={styles.tarjetaValor}>{formatNumber(datos.volumen, 1)} m³</span>
                      <span className={styles.tarjetaPie}>
                        {formatNumber(datos.frioFrigorias / datos.superficie, 0)} frig/m²
                      </span>
                    </div>
                  </div>

                  <h3 className={styles.subtitulo}>De dónde sale la carga de frío</h3>
                  <div className={styles.tablaWrap}>
                    <table className={styles.tabla}>
                      <caption className={styles.tablaCaption}>
                        Desglose de los {formatNumber(datos.frioW, 0)} W de refrigeración
                      </caption>
                      <thead>
                        <tr>
                          <th scope="col">Concepto</th>
                          <th scope="col">Vatios</th>
                          <th scope="col">Peso</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <th scope="row">
                            Volumen de aire ({formatNumber(datos.volumen, 1)} m³ × {cargaBase[zonaVerano]} W/m³)
                          </th>
                          <td>{formatNumber(datos.base, 0)}</td>
                          <td>{formatNumber((datos.base / datos.frioW) * 100, 0)} %</td>
                        </tr>
                        <tr>
                          <th scope="row">
                            Corrección por aislamiento, sol, cristal y cubierta (×
                            {formatNumber(datos.correccion, 2)})
                          </th>
                          <td>
                            {datos.envolvente - datos.base >= 0 ? '+' : ''}
                            {formatNumber(datos.envolvente - datos.base, 0)}
                          </td>
                          <td>{formatNumber(((datos.envolvente - datos.base) / datos.frioW) * 100, 0)} %</td>
                        </tr>
                        <tr>
                          <th scope="row">Personas ({formatNumber(datos.cargaPersonas / W_POR_PERSONA, 0)} × 100 W)</th>
                          <td>{formatNumber(datos.cargaPersonas, 0)}</td>
                          <td>{formatNumber((datos.cargaPersonas / datos.frioW) * 100, 0)} %</td>
                        </tr>
                        <tr>
                          <th scope="row">Aparatos encendidos</th>
                          <td>{formatNumber(datos.equipos, 0)}</td>
                          <td>{formatNumber((datos.equipos / datos.frioW) * 100, 0)} %</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>

        <DisclaimerCard variant="technical" severity="high" collapsible={false}>
          <p>
            Este cálculo es un <strong>dimensionado orientativo</strong> por factores, el mismo método
            rápido que se usa para hacerse una idea antes de pedir presupuesto. No sustituye a un
            cálculo de cargas térmicas real, que mide cada cerramiento por separado con su
            transmitancia, su orientación y su superficie, y añade la ventilación, las infiltraciones y
            la humedad del aire.
          </p>
          <p>
            Para una vivienda entera, un local de trabajo o cualquier instalación que requiera
            proyecto, el dimensionado lo firma un instalador o técnico competente. Las cifras de aquí
            sirven para contrastar una propuesta, no para sustituirla.
          </p>
        </DisclaimerCard>

        <EducationalSection
          title="Cómo se dimensiona la climatización de una estancia"
          subtitle="Frigorías, BTU y vatios, y por qué el volumen manda sobre los metros cuadrados"
        >
          <p>
            Climatizar una estancia consiste en retirar (o aportar) exactamente el calor que entra o
            sale por ella. Ese calor no es un número que dependa solo del tamaño: depende de por dónde
            entra. En verano llega sobre todo por el sol que atraviesa el vidrio, por la cubierta si
            no hay nadie encima, por los muros mal aislados y por todo lo que desprende calor dentro,
            empezando por las personas. En invierno el mecanismo es otro: el calor se escapa por
            diferencia de temperatura a través de la envolvente, de forma continua y sin sol que
            ayude, por eso el aislamiento pesa mucho más en la cifra de calefacción que en la de frío.
          </p>

          <h3>Las tres unidades son la misma potencia</h3>
          <p>
            Una frigoría/h es una kilocaloría/h de frío y equivale a <strong>1,163 vatios</strong>. Un
            BTU/h equivale a 0,293 vatios, así que una frigoría son <strong>3,968 BTU</strong>, que
            todo el mundo redondea a 4. Un equipo de 3.000 frigorías, uno de 12.000 BTU y uno de 3,5 kW
            son el mismo aparato descrito en tres idiomas: el de España y parte de Latinoamérica, el
            del etiquetado internacional y el del Sistema Internacional. Confundirlos es lo que lleva a
            comprar un equipo cuatro veces más grande de lo necesario.
          </p>

          <h3>Por qué el volumen y no la superficie</h3>
          <p>
            La regla de «100 frigorías por metro cuadrado» funciona razonablemente en una habitación
            corriente porque asume, sin decirlo, un techo de dos metros y medio. En cuanto la estancia
            se sale de ese molde deja de servir: un salón de 25 m² en una casa antigua con techos de
            3,5 metros tiene un 40 % más de aire que enfriar que el mismo salón en un piso moderno.
            Por eso aquí la carga base se calcula sobre los metros cúbicos y las correcciones se
            aplican después.
          </p>

          <h3>Qué hacen las correcciones</h3>
          <p>
            El aislamiento mueve la carga entre un 10 % arriba y un 10 % abajo; la orientación y el
            acristalamiento, hasta un 10 % cada uno; estar bajo cubierta, otro 10 %. Parecen ajustes
            menores por separado, pero se multiplican entre sí: una buhardilla mal aislada con
            ventanal al oeste puede pedir un 45 % más de potencia que una habitación interior idéntica
            en tamaño. Las personas y los aparatos se suman aparte, en vatios, porque no dependen del
            tamaño de la sala sino de lo que ocurra dentro: una cocina o una sala con varios equipos
            encendidos puede duplicar la carga interna prevista.
          </p>

          <h3>El error más caro es pasarse</h3>
          <p>
            La intuición dice que sobrar potencia no puede ser malo, y en climatización es justo al
            revés. Un equipo demasiado grande baja la temperatura en unos minutos, se para, y vuelve a
            arrancar poco después. En esos arranques cortos el aire se enfría pero no da tiempo a
            deshumidificarlo, así que la sensación es de frío húmedo y desagradable pese a que el
            termómetro marque lo pedido. Además, el rendimiento real de un compresor es peor en los
            arranques, de modo que un equipo sobredimensionado suele consumir más que uno ajustado.
          </p>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span aria-hidden="true">⚠️</span> <strong>Lo que este cálculo no ve</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>La ventilación y las infiltraciones.</strong> El aire que entra de fuera hay
                que enfriarlo también. En una vivienda estanca pesa poco; en un local con puerta
                abriéndose todo el día puede ser la mitad de la carga.
              </li>
              <li>
                <strong>La humedad.</strong> Los cálculos por factores dan potencia total; el reparto
                entre enfriar el aire y secarlo depende del clima y decide qué equipo conviene, no solo
                de qué tamaño.
              </li>
              <li>
                <strong>La distribución.</strong> La misma potencia repartida en varias estancias con
                puertas cerradas no rinde igual que en un espacio diáfano. Un solo equipo no climatiza
                una casa por el pasillo.
              </li>
              <li>
                <strong>La orientación real de cada hueco.</strong> Aquí se elige una exposición
                global; un cálculo riguroso mide cada ventana con su superficie, su vidrio y su
                sombreado.
              </li>
            </ul>
          </div>

          <h3>Preguntas frecuentes</h3>
          <p>
            <strong>¿Sirve para un local comercial?</strong> Como primera aproximación sí, pero la
            ocupación y la ventilación de un local pesan mucho más que en una vivienda: ahí las
            personas y la puerta abriéndose dejan de ser un ajuste para convertirse en el grueso de la
            carga.
          </p>
          <p>
            <strong>¿Y si el equipo va a hacer frío y calor?</strong> Manda la mayor de las dos cifras.
            En clima suave suele ganar la de refrigeración y en clima frío la de calefacción; si ambas
            se parecen, cualquier equipo bien elegido cubrirá las dos.
          </p>
          <p>
            <strong>¿Por qué el consumo eléctrico es un rango?</strong> Porque depende del rendimiento
            estacional del aparato, que varía aproximadamente entre 4,5 y 8 vatios de frío por vatio
            consumido según el modelo y las condiciones. Dar una cifra exacta sería fingir una
            precisión que no existe.
          </p>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('calculadora-frigorias-btu')} />
        <ShareCard appName="calculadora-frigorias-btu" />
      </main>

      <Footer appName="calculadora-frigorias-btu" />
    </div>
  );
}
