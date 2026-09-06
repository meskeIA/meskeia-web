'use client';

import { useMemo, useState } from 'react';
import styles from './SimuladorTeoremaTales.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  CASOS,
  TOTAL_CASOS,
  aCentimetros,
  alturaPorSombraConPasos,
  angulosDeTriangulo,
  aplicarSemejanza,
  areaHeron,
  comprobarRespuesta,
  cuartoProporcionalConPasos,
  distancia,
  efectoSobreAreaYPerimetro,
  elegirUnidad,
  generarEjercicioAleatorio,
  medidaEnPlano,
  medidaReal,
  perimetro,
  puntoEnSecante,
  resolverCaso,
  verticesTriangulo,
  type CasoTales,
  type DatosCaso,
  type EjercicioAleatorio,
  type UnidadLongitud,
  type Veredicto,
} from './motor';

// ============================================
// TIPOS Y CONSTANTES DE LA VISTA
// ============================================

type Pestana = 'tales' | 'semejanza' | 'aplicaciones' | 'casos';
type ModoEscala = 'aReal' | 'aPlano';

/** Lienzo de la figura de Tales. Coordenadas en píxeles del viewBox. */
const LIENZO = {
  ancho: 640,
  alto: 420,
  yArriba: 70,
  yAbajo: 350,
  xParalelaIzq: 40,
  xParalelaDer: 600,
  xSecanteIzq: 180,
  xSecanteDer: 440,
};

/** Cuántos píxeles del dibujo equivalen a 1 cm «medido» sobre la figura. */
const PX_POR_CM = 20;

const TRIANGULOS: { nombre: string; lados: [number, number, number] }[] = [
  { nombre: '3 · 4 · 5 (rectángulo)', lados: [3, 4, 5] },
  { nombre: '5 · 7 · 9 (escaleno)', lados: [5, 7, 9] },
  { nombre: '6 · 6 · 6 (equilátero)', lados: [6, 6, 6] },
];

const ESCALAS_HABITUALES = [50, 100, 200, 500, 25000, 50000];

const ETIQUETA_TIPO: Record<CasoTales['tipo'], string> = {
  tales: 'Tales',
  semejanza: 'Semejanza',
  sombras: 'Sombras',
  escalas: 'Escalas',
};

const ETIQUETA_NIVEL: Record<CasoTales['nivel'], string> = {
  basico: 'Básico',
  medio: 'Medio',
  avanzado: 'Avanzado',
};

/** Formato español que nunca escupe «No definido» en pantalla. */
function mostrar(valor: number, decimales = 2): string {
  return Number.isFinite(valor) ? formatNumber(valor, decimales) : '—';
}

/** Redacta el veredicto del motor en una frase, ya formateada en español. */
function redactarVeredicto(veredicto: Veredicto, unidad: string): string {
  switch (veredicto.motivo) {
    case 'correcta':
      return `¡Correcto! La respuesta es ${mostrar(veredicto.esperado)} ${unidad}.`;
    case 'cerca':
      return `Casi. Te separan ${mostrar(veredicto.desviacion)} ${unidad} del valor esperado: revisa si has redondeado demasiado pronto en un paso intermedio.`;
    case 'incorrecta':
      return 'No es correcto. Comprueba qué segmentos se corresponden entre sí antes de plantear la proporción, y en qué orden los colocas.';
    case 'sin-numero':
      return 'Escribe un número para comprobar. Puedes usar coma o punto decimal: 6,9 y 6.9 valen igual.';
  }
}

// ============================================
// FIGURA PEQUEÑA DE CADA CASO
// ============================================

function FiguraCaso({ datos }: { datos: DatosCaso }) {
  if (datos.tipo === 'tales') {
    return (
      <div className={styles.figuraWrapper}>
        <svg
          className={styles.figura}
          viewBox="0 0 300 150"
          role="img"
          aria-label={`Tres rectas paralelas cortadas por dos secantes. En la primera, segmentos de ${mostrar(datos.a)} y ${mostrar(datos.b)}. En la segunda, ${mostrar(datos.aPrima)} y el segmento buscado.`}
        >
          <line className={styles.svgParalela} x1="15" y1="25" x2="285" y2="25" />
          <line className={styles.svgParalela} x1="15" y1="75" x2="285" y2="75" />
          <line className={styles.svgParalela} x1="15" y1="125" x2="285" y2="125" />
          <line className={styles.svgSecante} x1="100" y1="15" x2="65" y2="140" />
          <line className={styles.svgSecante} x1="200" y1="15" x2="240" y2="140" />
          <line className={styles.svgSegmentoA} x1="97" y1="25" x2="83" y2="75" />
          <line className={styles.svgSegmentoB} x1="83" y1="75" x2="69" y2="125" />
          <line className={styles.svgSegmentoA} x1="203" y1="25" x2="219" y2="75" />
          <line className={styles.svgSegmentoB} x1="219" y1="75" x2="235" y2="125" />
          <text className={styles.svgTexto} x="18" y="45">
            a = {mostrar(datos.a)}
          </text>
          <text className={styles.svgTexto} x="18" y="112">
            b = {mostrar(datos.b)}
          </text>
          <text className={styles.svgTexto} x="245" y="45">
            a′ = {mostrar(datos.aPrima)}
          </text>
          <text className={styles.svgTexto} x="245" y="112">
            b′ = ?
          </text>
        </svg>
      </div>
    );
  }

  if (datos.tipo === 'sombras') {
    // Esquema, NO a escala, y se dice en el propio dibujo. A escala real la vara de
    // 2 m junto a una pirámide de 146 m sería un punto de un píxel: el esquema
    // conserva lo único que importa aquí, que los dos triángulos son semejantes
    // (misma razón sombra/altura), y deja las magnitudes reales en las etiquetas.
    const razonSombra = datos.sombraVara / datos.alturaVara;
    const sueloY = 120;
    const objetoAlto = Math.min(80, 110 / Math.max(razonSombra, 0.1));
    const varaAlto = objetoAlto * 0.35;
    const objetoSombra = objetoAlto * razonSombra;
    const varaSombra = varaAlto * razonSombra;

    return (
      <div className={styles.figuraWrapper}>
        <svg
          className={styles.figura}
          viewBox="0 0 300 150"
          role="img"
          aria-label={`Esquema, no a escala: una vara de ${mostrar(datos.alturaVara)} metros con sombra de ${mostrar(datos.sombraVara)} metros junto a un objeto de altura desconocida con sombra de ${mostrar(datos.sombraObjeto)} metros.`}
        >
          <line className={styles.svgSuelo} x1="10" y1={sueloY} x2="290" y2={sueloY} />
          <line className={styles.svgVara} x1="40" y1={sueloY} x2="40" y2={sueloY - varaAlto} />
          <line className={styles.svgSombra} x1="40" y1={sueloY} x2={40 + varaSombra} y2={sueloY} />
          <line className={styles.svgRayo} x1="40" y1={sueloY - varaAlto} x2={40 + varaSombra} y2={sueloY} />
          <rect className={styles.svgObjeto} x="165" y={sueloY - objetoAlto} width="14" height={objetoAlto} />
          <line className={styles.svgSombra} x1="165" y1={sueloY} x2={165 + objetoSombra} y2={sueloY} />
          <line className={styles.svgRayo} x1="165" y1={sueloY - objetoAlto} x2={165 + objetoSombra} y2={sueloY} />
          <text className={styles.svgTextoTenue} x="10" y={sueloY - varaAlto - 6}>
            {mostrar(datos.alturaVara)} m
          </text>
          <text className={styles.svgTexto} x="150" y={sueloY - objetoAlto - 6}>
            ? m
          </text>
          <text className={styles.svgTextoTenue} x="40" y={sueloY + 16}>
            {mostrar(datos.sombraVara)} m
          </text>
          <text className={styles.svgTextoTenue} x="165" y={sueloY + 16}>
            {mostrar(datos.sombraObjeto)} m
          </text>
          <text className={styles.svgTextoTenue} x="10" y="16">
            Esquema (no a escala): los dos triángulos son semejantes
          </text>
        </svg>
      </div>
    );
  }

  // Semejanza y escalas se entienden con el enunciado: una figura genérica no añadiría nada.
  return null;
}

// ============================================
// PÁGINA
// ============================================

export default function SimuladorTeoremaTalesPage() {
  const [pestana, setPestana] = useState<Pestana>('tales');

  // ---- Pestaña 1: Tales ----
  const [yMedia, setYMedia] = useState(190);
  const [inclinacionIzq, setInclinacionIzq] = useState(-45);
  const [inclinacionDer, setInclinacionDer] = useState(60);
  const [entradaA, setEntradaA] = useState('6');
  const [entradaB, setEntradaB] = useState('9');
  const [entradaAPrima, setEntradaAPrima] = useState('8');

  // ---- Pestaña 2: Semejanza ----
  const [indiceTriangulo, setIndiceTriangulo] = useState(0);
  const [razonK, setRazonK] = useState(1.5);

  // ---- Pestaña 3: Aplicaciones ----
  const [alturaVara, setAlturaVara] = useState(1.5);
  const [sombraVara, setSombraVara] = useState(2);
  const [sombraObjeto, setSombraObjeto] = useState(9.2);
  const [modoEscala, setModoEscala] = useState<ModoEscala>('aReal');
  const [escalaTexto, setEscalaTexto] = useState('50');
  const [medidaTexto, setMedidaTexto] = useState('7,4');

  // ---- Pestaña 4: Casos ----
  const [respuestas, setRespuestas] = useState<Record<number, string>>({});
  const [veredictos, setVeredictos] = useState<Record<number, Veredicto>>({});
  const [pasosAbiertos, setPasosAbiertos] = useState<Record<number, boolean>>({});
  const [ejercicio, setEjercicio] = useState<EjercicioAleatorio | null>(null);
  const [respuestaAleatoria, setRespuestaAleatoria] = useState('');
  const [veredictoAleatorio, setVeredictoAleatorio] = useState<Veredicto | null>(null);
  const [pasosAleatorios, setPasosAleatorios] = useState(false);

  // ============================================
  // CÁLCULOS — PESTAÑA TALES
  // ============================================

  const geometriaTales = useMemo(() => {
    const izqArriba = { x: LIENZO.xSecanteIzq, y: LIENZO.yArriba };
    const izqAbajo = { x: LIENZO.xSecanteIzq + inclinacionIzq, y: LIENZO.yAbajo };
    const derArriba = { x: LIENZO.xSecanteDer, y: LIENZO.yArriba };
    const derAbajo = { x: LIENZO.xSecanteDer + inclinacionDer, y: LIENZO.yAbajo };

    const i1 = puntoEnSecante(izqArriba, izqAbajo, LIENZO.yArriba);
    const i2 = puntoEnSecante(izqArriba, izqAbajo, yMedia);
    const i3 = puntoEnSecante(izqArriba, izqAbajo, LIENZO.yAbajo);
    const d1 = puntoEnSecante(derArriba, derAbajo, LIENZO.yArriba);
    const d2 = puntoEnSecante(derArriba, derAbajo, yMedia);
    const d3 = puntoEnSecante(derArriba, derAbajo, LIENZO.yAbajo);

    return {
      izqArriba,
      izqAbajo,
      derArriba,
      derAbajo,
      i1,
      i2,
      i3,
      d1,
      d2,
      d3,
      // Prolongación de cada secante, solo para que el dibujo no acabe en seco.
      izqProlongaInicio: puntoEnSecante(izqArriba, izqAbajo, 40),
      izqProlongaFin: puntoEnSecante(izqArriba, izqAbajo, 382),
      derProlongaInicio: puntoEnSecante(derArriba, derAbajo, 40),
      derProlongaFin: puntoEnSecante(derArriba, derAbajo, 382),
      a: distancia(i1, i2) / PX_POR_CM,
      b: distancia(i2, i3) / PX_POR_CM,
      aPrima: distancia(d1, d2) / PX_POR_CM,
      bPrima: distancia(d2, d3) / PX_POR_CM,
    };
  }, [yMedia, inclinacionIzq, inclinacionDer]);

  const cuartoProporcionalResuelto = useMemo(
    () =>
      cuartoProporcionalConPasos(
        parseSpanishNumber(entradaA),
        parseSpanishNumber(entradaB),
        parseSpanishNumber(entradaAPrima)
      ),
    [entradaA, entradaB, entradaAPrima]
  );

  // ============================================
  // CÁLCULOS — PESTAÑA SEMEJANZA
  // ============================================

  const semejanza = useMemo(() => {
    const lados = TRIANGULOS[indiceTriangulo].lados;
    const ladosK = aplicarSemejanza([...lados], razonK);
    const efecto = efectoSobreAreaYPerimetro(razonK);
    const perimetroOriginal = perimetro([...lados]);
    const areaOriginal = areaHeron(lados[0], lados[1], lados[2]);
    const angulos = angulosDeTriangulo(lados[0], lados[1], lados[2]);
    const [vA, vB, vC] = verticesTriangulo(lados[0], lados[1], lados[2]);

    const anchoUnidades = Math.max(vB.x, vC.x, 1);
    const altoUnidades = Math.max(vC.y, 1);
    const factorMayor = Math.max(1, razonK);
    const escalaPx = Math.min(240 / (anchoUnidades * factorMayor), 130 / (altoUnidades * factorMayor));

    return {
      lados,
      ladosK,
      efecto,
      perimetroOriginal,
      perimetroSemejante: perimetroOriginal * razonK,
      areaOriginal,
      areaSemejante: areaOriginal * efecto.factorArea,
      angulos,
      vertices: [vA, vB, vC],
      escalaPx,
    };
  }, [indiceTriangulo, razonK]);

  const puntosTriangulo = (escala: number, origenX: number, baseY: number): string =>
    semejanza.vertices
      .map((v) => `${(origenX + v.x * escala).toFixed(1)},${(baseY - v.y * escala).toFixed(1)}`)
      .join(' ');

  // ============================================
  // CÁLCULOS — PESTAÑA APLICACIONES
  // ============================================

  const sombras = useMemo(
    () => alturaPorSombraConPasos(alturaVara, sombraVara, sombraObjeto, 'm'),
    [alturaVara, sombraVara, sombraObjeto]
  );

  const dibujoSombras = useMemo(() => {
    const altura = Number.isFinite(sombras.valor) ? sombras.valor : alturaVara;
    const escala = Math.min(
      150 / Math.max(alturaVara, altura, 0.1),
      200 / Math.max(sombraVara, sombraObjeto, 0.1)
    );
    return {
      altura,
      escala,
      varaAlto: alturaVara * escala,
      varaSombra: sombraVara * escala,
      objetoAlto: altura * escala,
      objetoSombra: sombraObjeto * escala,
    };
  }, [alturaVara, sombraVara, sombraObjeto, sombras.valor]);

  const escalas = useMemo(() => {
    const denominador = parseSpanishNumber(escalaTexto);
    const medida = parseSpanishNumber(medidaTexto);
    const unidadEntrada: UnidadLongitud = modoEscala === 'aReal' ? 'cm' : 'm';

    if (!Number.isFinite(denominador) || denominador <= 0 || !Number.isFinite(medida) || medida <= 0) {
      return {
        error:
          'Escribe una escala y una medida mayores que cero. Para la escala basta el denominador: 50 significa 1:50.',
        valor: NaN,
        unidad: 'cm' as UnidadLongitud,
        pasos: [] as string[],
        denominador,
      };
    }

    // La unidad de salida la decide el propio resultado: 170.000 cm se lee mejor como 1,7 km.
    const enCentimetros = aCentimetros(medida, unidadEntrada);
    const resultadoCm =
      modoEscala === 'aReal' ? medidaReal(enCentimetros, denominador) : medidaEnPlano(enCentimetros, denominador);
    const { unidad } = elegirUnidad(resultadoCm);

    const datos: DatosCaso = {
      tipo: 'escalas',
      modo: modoEscala,
      medida,
      unidadEntrada,
      escala: denominador,
      unidadSalida: unidad,
    };
    const resuelto = resolverCaso(datos, unidad);

    return { error: resuelto.error, valor: resuelto.valor, unidad, pasos: resuelto.pasos, denominador };
  }, [escalaTexto, medidaTexto, modoEscala]);

  // ============================================
  // CASOS
  // ============================================

  const resueltos = useMemo(
    () => Object.values(veredictos).filter((veredicto) => veredicto.correcta).length,
    [veredictos]
  );

  const comprobarCaso = (caso: CasoTales) => {
    const valor = parseSpanishNumber(respuestas[caso.id] ?? '');
    setVeredictos((previos) => ({ ...previos, [caso.id]: comprobarRespuesta(valor, caso.solucion) }));
  };

  const alternarPasos = (id: number) => {
    setPasosAbiertos((previos) => ({ ...previos, [id]: !previos[id] }));
  };

  const nuevoEjercicio = () => {
    setEjercicio(generarEjercicioAleatorio());
    setRespuestaAleatoria('');
    setVeredictoAleatorio(null);
    setPasosAleatorios(false);
  };

  const comprobarAleatorio = () => {
    if (!ejercicio) return;
    setVeredictoAleatorio(comprobarRespuesta(parseSpanishNumber(respuestaAleatoria), ejercicio.caso.solucion));
  };

  const claseMensaje = (veredicto: Veredicto): string => {
    if (veredicto.correcta) return `${styles.casoMensaje} ${styles.mensajeOk}`;
    if (veredicto.motivo === 'cerca') return `${styles.casoMensaje} ${styles.mensajeCerca}`;
    return `${styles.casoMensaje} ${styles.mensajeMal}`;
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">📐</span> Teorema de Tales y semejanza de triángulos
        </h1>
        <p className={styles.subtitle}>
          Mueve las rectas paralelas y comprueba que la proporción se mantiene, ajusta la razón de semejanza y
          descubre por qué el área se multiplica por k², calcula alturas con sombras y resuelve escalas de planos y
          mapas. Con 12 casos numerados iguales para toda la clase de secundaria.
        </p>
        <div className={styles.heroBadges}>
          <span className={styles.heroBadge}>Proporción entre paralelas</span>
          <span className={styles.heroBadge}>Razón k y área k²</span>
          <span className={styles.heroBadge}>Altura por sombras</span>
          <span className={styles.heroBadge}>Escalas 1:50 a 1:50.000</span>
        </div>
      </header>

      <LegalNotice />

      {/* PESTAÑAS */}
      <div className={styles.tabs} role="tablist" aria-label="Modos del simulador">
        <button
          type="button"
          role="tab"
          id="tab-tales"
          aria-selected={pestana === 'tales'}
          aria-controls="panel-tales"
          className={`${styles.tab} ${pestana === 'tales' ? styles.tabActiva : ''}`}
          onClick={() => setPestana('tales')}
        >
          <span aria-hidden="true">📏</span> Teorema de Tales
        </button>
        <button
          type="button"
          role="tab"
          id="tab-semejanza"
          aria-selected={pestana === 'semejanza'}
          aria-controls="panel-semejanza"
          className={`${styles.tab} ${pestana === 'semejanza' ? styles.tabActiva : ''}`}
          onClick={() => setPestana('semejanza')}
        >
          <span aria-hidden="true">🔺</span> Triángulos semejantes
        </button>
        <button
          type="button"
          role="tab"
          id="tab-aplicaciones"
          aria-selected={pestana === 'aplicaciones'}
          aria-controls="panel-aplicaciones"
          className={`${styles.tab} ${pestana === 'aplicaciones' ? styles.tabActiva : ''}`}
          onClick={() => setPestana('aplicaciones')}
        >
          <span aria-hidden="true">🗺️</span> Aplicaciones
        </button>
        <button
          type="button"
          role="tab"
          id="tab-casos"
          aria-selected={pestana === 'casos'}
          aria-controls="panel-casos"
          className={`${styles.tab} ${pestana === 'casos' ? styles.tabActiva : ''}`}
          onClick={() => setPestana('casos')}
        >
          <span aria-hidden="true">✏️</span> Casos ({resueltos}/{TOTAL_CASOS})
        </button>
      </div>

      {/* ============================================
          PANEL 1 — TEOREMA DE TALES
          ============================================ */}
      {pestana === 'tales' && (
        <div className={styles.panel} id="panel-tales" role="tabpanel" aria-labelledby="tab-tales">
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Tres paralelas, dos secantes</h2>
            <p className={styles.cardSubtitle}>
              Las tres rectas discontinuas son paralelas. Muévelas y cambia la inclinación de cada secante: los
              segmentos cambian de longitud, pero la razón entre ellos es la misma en las dos secantes. Eso es
              exactamente lo que afirma el teorema de Tales.
            </p>

            <div className={styles.cardGrid}>
              <div className={styles.figuraWrapper}>
                <svg
                  className={styles.figura}
                  viewBox={`0 0 ${LIENZO.ancho} ${LIENZO.alto}`}
                  role="img"
                  aria-label={`Tres rectas paralelas cortadas por dos secantes. En la primera secante los segmentos miden ${mostrar(geometriaTales.a)} y ${mostrar(geometriaTales.b)} centímetros; en la segunda, ${mostrar(geometriaTales.aPrima)} y ${mostrar(geometriaTales.bPrima)} centímetros.`}
                >
                  {[LIENZO.yArriba, yMedia, LIENZO.yAbajo].map((y, indice) => (
                    <g key={`paralela-${indice}`}>
                      <line
                        className={styles.svgParalela}
                        x1={LIENZO.xParalelaIzq}
                        y1={y}
                        x2={LIENZO.xParalelaDer}
                        y2={y}
                      />
                      <text className={styles.svgTextoTenue} x={LIENZO.xParalelaIzq - 26} y={y + 4}>
                        r{indice + 1}
                      </text>
                    </g>
                  ))}

                  <line
                    className={styles.svgSecante}
                    x1={geometriaTales.izqProlongaInicio.x}
                    y1={geometriaTales.izqProlongaInicio.y}
                    x2={geometriaTales.izqProlongaFin.x}
                    y2={geometriaTales.izqProlongaFin.y}
                  />
                  <line
                    className={styles.svgSecante}
                    x1={geometriaTales.derProlongaInicio.x}
                    y1={geometriaTales.derProlongaInicio.y}
                    x2={geometriaTales.derProlongaFin.x}
                    y2={geometriaTales.derProlongaFin.y}
                  />

                  <line
                    className={styles.svgSegmentoA}
                    x1={geometriaTales.i1.x}
                    y1={geometriaTales.i1.y}
                    x2={geometriaTales.i2.x}
                    y2={geometriaTales.i2.y}
                  />
                  <line
                    className={styles.svgSegmentoB}
                    x1={geometriaTales.i2.x}
                    y1={geometriaTales.i2.y}
                    x2={geometriaTales.i3.x}
                    y2={geometriaTales.i3.y}
                  />
                  <line
                    className={styles.svgSegmentoA}
                    x1={geometriaTales.d1.x}
                    y1={geometriaTales.d1.y}
                    x2={geometriaTales.d2.x}
                    y2={geometriaTales.d2.y}
                  />
                  <line
                    className={styles.svgSegmentoB}
                    x1={geometriaTales.d2.x}
                    y1={geometriaTales.d2.y}
                    x2={geometriaTales.d3.x}
                    y2={geometriaTales.d3.y}
                  />

                  {[
                    geometriaTales.i1,
                    geometriaTales.i2,
                    geometriaTales.i3,
                    geometriaTales.d1,
                    geometriaTales.d2,
                    geometriaTales.d3,
                  ].map((punto, indice) => (
                    <circle key={`punto-${indice}`} className={styles.svgPunto} cx={punto.x} cy={punto.y} r="4" />
                  ))}

                  <text
                    className={styles.svgTexto}
                    x={(geometriaTales.i1.x + geometriaTales.i2.x) / 2 - 92}
                    y={(geometriaTales.i1.y + geometriaTales.i2.y) / 2 + 4}
                  >
                    a = {mostrar(geometriaTales.a)} cm
                  </text>
                  <text
                    className={styles.svgTexto}
                    x={(geometriaTales.i2.x + geometriaTales.i3.x) / 2 - 92}
                    y={(geometriaTales.i2.y + geometriaTales.i3.y) / 2 + 4}
                  >
                    b = {mostrar(geometriaTales.b)} cm
                  </text>
                  <text
                    className={styles.svgTexto}
                    x={(geometriaTales.d1.x + geometriaTales.d2.x) / 2 + 14}
                    y={(geometriaTales.d1.y + geometriaTales.d2.y) / 2 + 4}
                  >
                    a′ = {mostrar(geometriaTales.aPrima)} cm
                  </text>
                  <text
                    className={styles.svgTexto}
                    x={(geometriaTales.d2.x + geometriaTales.d3.x) / 2 + 14}
                    y={(geometriaTales.d2.y + geometriaTales.d3.y) / 2 + 4}
                  >
                    b′ = {mostrar(geometriaTales.bPrima)} cm
                  </text>
                </svg>
              </div>

              <div className={styles.controles}>
                <div className={styles.control}>
                  <label className={styles.controlEtiqueta} htmlFor="control-paralela">
                    <span>Altura de la paralela central</span>
                    <span className={styles.controlValor}>{mostrar((yMedia - LIENZO.yArriba) / PX_POR_CM)} cm</span>
                  </label>
                  <input
                    id="control-paralela"
                    className={styles.slider}
                    type="range"
                    min={110}
                    max={310}
                    step={1}
                    value={yMedia}
                    onChange={(evento) => setYMedia(Number(evento.target.value))}
                  />
                </div>

                <div className={styles.control}>
                  <label className={styles.controlEtiqueta} htmlFor="control-izq">
                    <span>Inclinación de la secante izquierda</span>
                    <span className={styles.controlValor}>{inclinacionIzq} px</span>
                  </label>
                  <input
                    id="control-izq"
                    className={styles.slider}
                    type="range"
                    min={-90}
                    max={90}
                    step={1}
                    value={inclinacionIzq}
                    onChange={(evento) => setInclinacionIzq(Number(evento.target.value))}
                  />
                </div>

                <div className={styles.control}>
                  <label className={styles.controlEtiqueta} htmlFor="control-der">
                    <span>Inclinación de la secante derecha</span>
                    <span className={styles.controlValor}>{inclinacionDer} px</span>
                  </label>
                  <input
                    id="control-der"
                    className={styles.slider}
                    type="range"
                    min={-90}
                    max={90}
                    step={1}
                    value={inclinacionDer}
                    onChange={(evento) => setInclinacionDer(Number(evento.target.value))}
                  />
                </div>

                <div className={styles.leyenda}>
                  <span className={styles.leyendaItem}>
                    <span className={`${styles.leyendaMuestra} ${styles.muestraA}`} aria-hidden="true" />
                    Segmentos a y a′
                  </span>
                  <span className={styles.leyendaItem}>
                    <span className={`${styles.leyendaMuestra} ${styles.muestraB}`} aria-hidden="true" />
                    Segmentos b y b′
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.proporcion}>
              <div className={styles.fraccion}>
                <span className={styles.fraccionArriba}>{mostrar(geometriaTales.a)}</span>
                <span className={styles.fraccionAbajo}>{mostrar(geometriaTales.b)}</span>
                <span className={styles.fraccionEtiqueta}>a / b</span>
              </div>
              <span className={styles.igual} aria-hidden="true">
                =
              </span>
              <div className={styles.fraccion}>
                <span className={styles.fraccionArriba}>{mostrar(geometriaTales.aPrima)}</span>
                <span className={styles.fraccionAbajo}>{mostrar(geometriaTales.bPrima)}</span>
                <span className={styles.fraccionEtiqueta}>a′ / b′</span>
              </div>
              <span className={styles.igual} aria-hidden="true">
                =
              </span>
              <div className={styles.fraccion}>
                <span className={styles.fraccionArriba}>{mostrar(geometriaTales.a / geometriaTales.b, 3)}</span>
                <span className={styles.fraccionEtiqueta}>razón común</span>
              </div>
            </div>

            <p className={styles.nota}>
              Las dos razones coinciden por muy torcidas que estén las secantes: la proporción solo depende de dónde
              están las paralelas. Si inclinas una secante hasta ponerla casi horizontal, los segmentos se alargan
              muchísimo, y aun así la razón no se mueve.
            </p>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Calcular el segmento que falta</h2>
            <p className={styles.cardSubtitle}>
              Escribe los tres segmentos conocidos de la proporción a / b = a′ / b′ y obtén el cuarto proporcional con
              el desarrollo completo. Acepta coma o punto decimal.
            </p>

            <div className={styles.campos}>
              <div className={styles.campo}>
                <label className={styles.campoEtiqueta} htmlFor="entrada-a">
                  Segmento a (primera secante)
                </label>
                <input
                  id="entrada-a"
                  className={styles.campoInput}
                  type="text"
                  inputMode="decimal"
                  value={entradaA}
                  onChange={(evento) => setEntradaA(evento.target.value)}
                  placeholder="6"
                />
              </div>
              <div className={styles.campo}>
                <label className={styles.campoEtiqueta} htmlFor="entrada-b">
                  Segmento b (primera secante)
                </label>
                <input
                  id="entrada-b"
                  className={styles.campoInput}
                  type="text"
                  inputMode="decimal"
                  value={entradaB}
                  onChange={(evento) => setEntradaB(evento.target.value)}
                  placeholder="9"
                />
              </div>
              <div className={styles.campo}>
                <label className={styles.campoEtiqueta} htmlFor="entrada-a-prima">
                  Segmento a′ (segunda secante)
                </label>
                <input
                  id="entrada-a-prima"
                  className={styles.campoInput}
                  type="text"
                  inputMode="decimal"
                  value={entradaAPrima}
                  onChange={(evento) => setEntradaAPrima(evento.target.value)}
                  placeholder="8"
                />
              </div>
            </div>

            {cuartoProporcionalResuelto.error ? (
              <p className={styles.mensajeError} role="alert" aria-live="polite">
                {cuartoProporcionalResuelto.error}
              </p>
            ) : (
              <>
                <div className={styles.resultadosGrid}>
                  <div className={styles.resultado}>
                    <span className={styles.resultadoEtiqueta}>Segmento b′ (el que falta)</span>
                    <span className={styles.resultadoValor}>{mostrar(cuartoProporcionalResuelto.valor)}</span>
                    <span className={styles.resultadoNota}>en las mismas unidades que los datos</span>
                  </div>
                  <div className={styles.resultado}>
                    <span className={styles.resultadoEtiqueta}>Razón de la proporción</span>
                    <span className={styles.resultadoValor}>
                      {mostrar(parseSpanishNumber(entradaA) / parseSpanishNumber(entradaB), 3)}
                    </span>
                    <span className={styles.resultadoNota}>a / b, idéntica a a′ / b′</span>
                  </div>
                </div>

                <ol className={styles.pasosLista}>
                  {cuartoProporcionalResuelto.pasos.map((paso) => (
                    <li key={paso}>{paso}</li>
                  ))}
                </ol>
              </>
            )}
          </section>
        </div>
      )}

      {/* ============================================
          PANEL 2 — TRIÁNGULOS SEMEJANTES
          ============================================ */}
      {pestana === 'semejanza' && (
        <div className={styles.panel} id="panel-semejanza" role="tabpanel" aria-labelledby="tab-semejanza">
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Razón de semejanza k</h2>
            <p className={styles.cardSubtitle}>
              El triángulo azul es el original; el verde es su semejante con razón k. Sube y baja k y observa qué
              cambia y qué no: los lados y el perímetro siguen a k, los ángulos se quedan quietos y el área va por
              libre.
            </p>

            <div className={styles.cardGrid}>
              <div className={styles.figuraWrapper}>
                <svg
                  className={styles.figura}
                  viewBox="0 0 640 260"
                  role="img"
                  aria-label={`Dos triángulos semejantes. El original tiene lados de ${mostrar(semejanza.lados[0])}, ${mostrar(semejanza.lados[1])} y ${mostrar(semejanza.lados[2])} centímetros; el semejante, con razón ${mostrar(semejanza.efecto.razon)}, tiene lados de ${mostrar(semejanza.ladosK[0])}, ${mostrar(semejanza.ladosK[1])} y ${mostrar(semejanza.ladosK[2])} centímetros. Los ángulos son iguales en ambos.`}
                >
                  <polygon
                    className={styles.svgTrianguloOriginal}
                    points={puntosTriangulo(semejanza.escalaPx, 45, 205)}
                  />
                  <polygon
                    className={styles.svgTrianguloSemejante}
                    points={puntosTriangulo(semejanza.escalaPx * semejanza.efecto.razon, 350, 205)}
                  />
                  <text className={styles.svgTexto} x="45" y="235">
                    Original
                  </text>
                  <text className={styles.svgTextoTenue} x="45" y="252">
                    {mostrar(semejanza.lados[0])} · {mostrar(semejanza.lados[1])} · {mostrar(semejanza.lados[2])} cm
                  </text>
                  <text className={styles.svgTexto} x="350" y="235">
                    Semejante (k = {mostrar(semejanza.efecto.razon)})
                  </text>
                  <text className={styles.svgTextoTenue} x="350" y="252">
                    {mostrar(semejanza.ladosK[0])} · {mostrar(semejanza.ladosK[1])} · {mostrar(semejanza.ladosK[2])} cm
                  </text>
                  {semejanza.vertices.map((vertice, indice) => (
                    <text
                      key={`angulo-original-${indice}`}
                      className={styles.svgTextoTenue}
                      x={45 + vertice.x * semejanza.escalaPx - (indice === 1 ? 34 : 0)}
                      y={205 - vertice.y * semejanza.escalaPx - 6}
                    >
                      {mostrar(semejanza.angulos[indice], 1)}°
                    </text>
                  ))}
                  {semejanza.vertices.map((vertice, indice) => (
                    <text
                      key={`angulo-semejante-${indice}`}
                      className={styles.svgTextoTenue}
                      x={350 + vertice.x * semejanza.escalaPx * semejanza.efecto.razon - (indice === 1 ? 34 : 0)}
                      y={205 - vertice.y * semejanza.escalaPx * semejanza.efecto.razon - 6}
                    >
                      {mostrar(semejanza.angulos[indice], 1)}°
                    </text>
                  ))}
                </svg>
              </div>

              <div className={styles.controles}>
                <div className={styles.control}>
                  <span className={styles.controlEtiqueta}>Triángulo original</span>
                  <div className={styles.botonesFila}>
                    {TRIANGULOS.map((triangulo, indice) => (
                      <button
                        key={triangulo.nombre}
                        type="button"
                        aria-pressed={indiceTriangulo === indice}
                        className={`${styles.botonOpcion} ${indiceTriangulo === indice ? styles.botonOpcionActiva : ''}`}
                        onClick={() => setIndiceTriangulo(indice)}
                      >
                        {triangulo.nombre}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.control}>
                  <label className={styles.controlEtiqueta} htmlFor="control-k">
                    <span>Razón de semejanza k</span>
                    <span className={styles.controlValor}>{mostrar(razonK)}</span>
                  </label>
                  <input
                    id="control-k"
                    className={styles.slider}
                    type="range"
                    min={0.25}
                    max={3}
                    step={0.05}
                    value={razonK}
                    onChange={(evento) => setRazonK(Number(evento.target.value))}
                  />
                  <span className={styles.campoAyuda}>
                    k menor que 1 reduce la figura; k mayor que 1 la amplía; k = 1 la deja igual.
                  </span>
                </div>

                <div className={styles.resultadosGrid}>
                  <div className={styles.resultado}>
                    <span className={styles.resultadoEtiqueta}>Perímetro</span>
                    <span className={styles.resultadoValor}>{mostrar(semejanza.perimetroSemejante)} cm</span>
                    <span className={styles.resultadoNota}>
                      {mostrar(semejanza.perimetroOriginal)} cm × k
                    </span>
                  </div>
                  <div className={`${styles.resultado} ${styles.resultadoDestacado}`}>
                    <span className={styles.resultadoEtiqueta}>Área</span>
                    <span className={styles.resultadoValor}>{mostrar(semejanza.areaSemejante)} cm²</span>
                    <span className={styles.resultadoNota}>
                      {mostrar(semejanza.areaOriginal)} cm² × k² ({mostrar(semejanza.efecto.factorArea, 3)})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.tablaWrapper}>
              <table className={styles.tablaDatos}>
                <caption className={styles.campoAyuda}>
                  Qué le pasa a cada magnitud al aplicar la razón de semejanza k = {mostrar(razonK)}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Magnitud</th>
                    <th scope="col">Original</th>
                    <th scope="col">Semejante</th>
                    <th scope="col">Se multiplica por</th>
                  </tr>
                </thead>
                <tbody>
                  {semejanza.lados.map((lado, indice) => (
                    <tr key={`lado-${indice}`}>
                      <td>Lado {indice + 1}</td>
                      <td>{mostrar(lado)} cm</td>
                      <td>{mostrar(semejanza.ladosK[indice])} cm</td>
                      <td>k = {mostrar(razonK)}</td>
                    </tr>
                  ))}
                  <tr>
                    <td>Perímetro</td>
                    <td>{mostrar(semejanza.perimetroOriginal)} cm</td>
                    <td>{mostrar(semejanza.perimetroSemejante)} cm</td>
                    <td>k = {mostrar(razonK)}</td>
                  </tr>
                  <tr className={styles.filaDestacada}>
                    <td>Área</td>
                    <td>{mostrar(semejanza.areaOriginal)} cm²</td>
                    <td>{mostrar(semejanza.areaSemejante)} cm²</td>
                    <td>k² = {mostrar(semejanza.efecto.factorArea, 3)}</td>
                  </tr>
                  <tr>
                    <td>Ángulos</td>
                    <td>
                      {mostrar(semejanza.angulos[0], 1)}° · {mostrar(semejanza.angulos[1], 1)}° ·{' '}
                      {mostrar(semejanza.angulos[2], 1)}°
                    </td>
                    <td>Los mismos</td>
                    <td>1 (no cambian)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.avisoClave}>
              <h3 className={styles.avisoClaveTitulo}>
                <span aria-hidden="true">⚠️</span> El área NO se multiplica por k
              </h3>
              <p>
                Con k = {mostrar(razonK)}, quien multiplique el área por k obtendría{' '}
                {mostrar(semejanza.areaOriginal * razonK)} cm², y el valor correcto es{' '}
                {mostrar(semejanza.areaSemejante)} cm². Un área es el producto de dos longitudes y la semejanza estira
                las dos a la vez, así que el factor es k². Con volúmenes ocurre lo mismo un grado más arriba: k³. Es el
                error más repetido de todo el tema.
              </p>
            </div>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Criterios de semejanza</h2>
            <p className={styles.cardSubtitle}>
              No hace falta comprobar los seis datos (tres lados y tres ángulos) de cada triángulo: basta con que se
              cumpla uno de estos tres criterios para afirmar que dos triángulos son semejantes.
            </p>
            <div className={styles.criterios}>
              <div className={styles.criterioCard}>
                <span className={styles.criterioSigla}>AA</span>
                <p>
                  Dos ángulos iguales. El tercero queda determinado, porque los tres suman 180°. Es el criterio que
                  justifica el método de las sombras: los dos triángulos comparten el ángulo recto del suelo y el
                  ángulo de elevación del Sol.
                </p>
              </div>
              <div className={styles.criterioCard}>
                <span className={styles.criterioSigla}>LAL</span>
                <p>
                  Dos lados proporcionales y el ángulo comprendido entre ellos igual. Ojo al «comprendido»: si el
                  ángulo igual no está entre los dos lados, el criterio no se aplica.
                </p>
              </div>
              <div className={styles.criterioCard}>
                <span className={styles.criterioSigla}>LLL</span>
                <p>
                  Los tres pares de lados proporcionales, todos con la misma razón k. Si una de las tres razones no
                  coincide con las otras dos, los triángulos no son semejantes.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ============================================
          PANEL 3 — APLICACIONES
          ============================================ */}
      {pestana === 'aplicaciones' && (
        <div className={styles.panel} id="panel-aplicaciones" role="tabpanel" aria-labelledby="tab-aplicaciones">
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Altura por sombras</h2>
            <p className={styles.cardSubtitle}>
              Para medir algo demasiado alto para una cinta métrica basta una vara, una sombra y una proporción. Los
              rayos del Sol llegan casi paralelos, así que la vara y el objeto forman dos triángulos rectángulos
              semejantes por el criterio AA.
            </p>

            <div className={styles.cardGrid}>
              <div className={styles.figuraWrapper}>
                <svg
                  className={styles.figura}
                  viewBox="0 0 640 340"
                  role="img"
                  aria-label={`Una vara de ${mostrar(alturaVara)} metros con una sombra de ${mostrar(sombraVara)} metros y un objeto de ${mostrar(dibujoSombras.altura)} metros de alto con una sombra de ${mostrar(sombraObjeto)} metros.`}
                >
                  <line className={styles.svgSuelo} x1="20" y1="280" x2="620" y2="280" />

                  <line className={styles.svgVara} x1="60" y1="280" x2="60" y2={280 - dibujoSombras.varaAlto} />
                  <line
                    className={styles.svgSombra}
                    x1="60"
                    y1="280"
                    x2={60 + dibujoSombras.varaSombra}
                    y2="280"
                  />
                  <line
                    className={styles.svgRayo}
                    x1="60"
                    y1={280 - dibujoSombras.varaAlto}
                    x2={60 + dibujoSombras.varaSombra}
                    y2="280"
                  />
                  <text className={styles.svgTexto} x="18" y={280 - dibujoSombras.varaAlto - 10}>
                    {mostrar(alturaVara)} m
                  </text>
                  <text className={styles.svgTextoTenue} x="62" y="298">
                    sombra {mostrar(sombraVara)} m
                  </text>

                  <rect
                    className={styles.svgObjeto}
                    x="340"
                    y={280 - dibujoSombras.objetoAlto}
                    width="22"
                    height={dibujoSombras.objetoAlto}
                  />
                  <line
                    className={styles.svgSombra}
                    x1="340"
                    y1="280"
                    x2={340 + dibujoSombras.objetoSombra}
                    y2="280"
                  />
                  <line
                    className={styles.svgRayo}
                    x1="340"
                    y1={280 - dibujoSombras.objetoAlto}
                    x2={340 + dibujoSombras.objetoSombra}
                    y2="280"
                  />
                  <text className={styles.svgTexto} x="290" y={280 - dibujoSombras.objetoAlto - 10}>
                    h = {mostrar(dibujoSombras.altura)} m
                  </text>
                  <text className={styles.svgTextoTenue} x="342" y="298">
                    sombra {mostrar(sombraObjeto)} m
                  </text>
                </svg>
              </div>

              <div className={styles.controles}>
                <div className={styles.control}>
                  <label className={styles.controlEtiqueta} htmlFor="control-vara">
                    <span>Altura de la vara</span>
                    <span className={styles.controlValor}>{mostrar(alturaVara)} m</span>
                  </label>
                  <input
                    id="control-vara"
                    className={styles.slider}
                    type="range"
                    min={0.5}
                    max={2.5}
                    step={0.1}
                    value={alturaVara}
                    onChange={(evento) => setAlturaVara(Number(evento.target.value))}
                  />
                </div>
                <div className={styles.control}>
                  <label className={styles.controlEtiqueta} htmlFor="control-sombra-vara">
                    <span>Sombra de la vara</span>
                    <span className={styles.controlValor}>{mostrar(sombraVara)} m</span>
                  </label>
                  <input
                    id="control-sombra-vara"
                    className={styles.slider}
                    type="range"
                    min={0.3}
                    max={4}
                    step={0.1}
                    value={sombraVara}
                    onChange={(evento) => setSombraVara(Number(evento.target.value))}
                  />
                </div>
                <div className={styles.control}>
                  <label className={styles.controlEtiqueta} htmlFor="control-sombra-objeto">
                    <span>Sombra del objeto</span>
                    <span className={styles.controlValor}>{mostrar(sombraObjeto)} m</span>
                  </label>
                  <input
                    id="control-sombra-objeto"
                    className={styles.slider}
                    type="range"
                    min={1}
                    max={40}
                    step={0.1}
                    value={sombraObjeto}
                    onChange={(evento) => setSombraObjeto(Number(evento.target.value))}
                  />
                </div>

                <div className={styles.resultado}>
                  <span className={styles.resultadoEtiqueta}>Altura del objeto</span>
                  <span className={styles.resultadoValor}>{mostrar(sombras.valor)} m</span>
                  <span className={styles.resultadoNota}>
                    altura de la vara × sombra del objeto ÷ sombra de la vara
                  </span>
                </div>
              </div>
            </div>

            <ol className={styles.pasosLista}>
              {sombras.pasos.map((paso) => (
                <li key={paso}>{paso}</li>
              ))}
            </ol>
          </section>

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Escalas de planos y mapas</h2>
            <p className={styles.cardSubtitle}>
              Una escala 1:N dice que cada unidad del papel vale N unidades de la realidad. Es una semejanza con razón
              1/N, así que funciona exactamente igual que los triángulos de arriba.
            </p>

            <div className={styles.controles}>
              <div className={styles.control}>
                <span className={styles.controlEtiqueta}>¿Qué quieres calcular?</span>
                <div className={styles.botonesFila}>
                  <button
                    type="button"
                    aria-pressed={modoEscala === 'aReal'}
                    className={`${styles.botonOpcion} ${modoEscala === 'aReal' ? styles.botonOpcionActiva : ''}`}
                    onClick={() => {
                      setModoEscala('aReal');
                      setMedidaTexto('7,4');
                    }}
                  >
                    Del plano a la realidad
                  </button>
                  <button
                    type="button"
                    aria-pressed={modoEscala === 'aPlano'}
                    className={`${styles.botonOpcion} ${modoEscala === 'aPlano' ? styles.botonOpcionActiva : ''}`}
                    onClick={() => {
                      setModoEscala('aPlano');
                      setMedidaTexto('4,5');
                    }}
                  >
                    De la realidad al plano
                  </button>
                </div>
              </div>

              <div className={styles.control}>
                <span className={styles.controlEtiqueta}>Escala más habitual</span>
                <div className={styles.botonesFila}>
                  {ESCALAS_HABITUALES.map((denominador) => (
                    <button
                      key={denominador}
                      type="button"
                      aria-pressed={escalas.denominador === denominador}
                      className={`${styles.botonOpcion} ${escalas.denominador === denominador ? styles.botonOpcionActiva : ''}`}
                      onClick={() => setEscalaTexto(String(denominador))}
                    >
                      1:{formatNumber(denominador, 0)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.campos}>
              <div className={styles.campo}>
                <label className={styles.campoEtiqueta} htmlFor="entrada-escala">
                  Denominador de la escala
                </label>
                <input
                  id="entrada-escala"
                  className={styles.campoInput}
                  type="text"
                  inputMode="numeric"
                  value={escalaTexto}
                  onChange={(evento) => setEscalaTexto(evento.target.value)}
                  placeholder="50"
                />
                <span className={styles.campoAyuda}>Escribe 50 para 1:50 o 25000 para 1:25.000.</span>
              </div>
              <div className={styles.campo}>
                <label className={styles.campoEtiqueta} htmlFor="entrada-medida">
                  {modoEscala === 'aReal' ? 'Medida sobre el plano (cm)' : 'Medida real (m)'}
                </label>
                <input
                  id="entrada-medida"
                  className={styles.campoInput}
                  type="text"
                  inputMode="decimal"
                  value={medidaTexto}
                  onChange={(evento) => setMedidaTexto(evento.target.value)}
                  placeholder={modoEscala === 'aReal' ? '7,4' : '4,5'}
                />
                <span className={styles.campoAyuda}>Acepta coma o punto decimal.</span>
              </div>
            </div>

            {escalas.error ? (
              <p className={styles.mensajeError} role="alert" aria-live="polite">
                {escalas.error}
              </p>
            ) : (
              <>
                <div className={styles.resultado}>
                  <span className={styles.resultadoEtiqueta}>
                    {modoEscala === 'aReal' ? 'Medida real' : 'Medida sobre el plano'}
                  </span>
                  <span className={styles.resultadoValor}>
                    {mostrar(escalas.valor, escalas.unidad === 'km' ? 3 : 2)} {escalas.unidad}
                  </span>
                  <span className={styles.resultadoNota}>
                    a escala 1:{Number.isFinite(escalas.denominador) ? formatNumber(escalas.denominador, 0) : '—'}
                  </span>
                </div>
                <ol className={styles.pasosLista}>
                  {escalas.pasos.map((paso) => (
                    <li key={paso}>{paso}</li>
                  ))}
                </ol>
              </>
            )}
          </section>
        </div>
      )}

      {/* ============================================
          PANEL 4 — CASOS
          ============================================ */}
      {pestana === 'casos' && (
        <div className={styles.panel} id="panel-casos" role="tabpanel" aria-labelledby="tab-casos">
          <section className={styles.card}>
            <div className={styles.casosCabecera}>
              <div>
                <h2 className={styles.cardTitle}>Casos numerados</h2>
                <p className={styles.cardSubtitle}>
                  Los {TOTAL_CASOS} casos son siempre los mismos, en el mismo orden y con los mismos números: el caso 3
                  de una persona es el caso 3 de cualquier otra. Escribe tu resultado, compruébalo y, si falla,
                  despliega la solución razonada.
                </p>
              </div>
              <button type="button" className={styles.btnPrimary} onClick={nuevoEjercicio}>
                <span aria-hidden="true">🎲</span> Ejercicio aleatorio
              </button>
            </div>

            <p className={styles.contador} aria-live="polite">
              Has resuelto {resueltos} de {TOTAL_CASOS}
            </p>
            <div
              className={styles.contadorBarra}
              role="progressbar"
              aria-valuenow={resueltos}
              aria-valuemin={0}
              aria-valuemax={TOTAL_CASOS}
              aria-label="Casos resueltos"
            >
              <div className={styles.contadorRelleno} style={{ width: `${(resueltos / TOTAL_CASOS) * 100}%` }} />
            </div>

            {ejercicio && (
              <div className={styles.aleatorioCard}>
                <div className={styles.casoCabecera}>
                  <span className={styles.casoNumero} aria-hidden="true">
                    ★
                  </span>
                  <h3 className={styles.casoTitulo}>Ejercicio aleatorio: {ejercicio.caso.titulo}</h3>
                  <span className={styles.etiqueta}>{ETIQUETA_TIPO[ejercicio.caso.tipo]}</span>
                </div>
                <p className={styles.casoEnunciado}>{ejercicio.caso.enunciado}</p>
                <FiguraCaso datos={ejercicio.caso.datos} />
                <div className={styles.casoFila}>
                  <div className={styles.casoCampo}>
                    <label className={styles.campoEtiqueta} htmlFor="respuesta-aleatoria">
                      Tu respuesta ({ejercicio.caso.unidad})
                    </label>
                    <input
                      id="respuesta-aleatoria"
                      className={styles.campoInput}
                      type="text"
                      inputMode="decimal"
                      value={respuestaAleatoria}
                      onChange={(evento) => setRespuestaAleatoria(evento.target.value)}
                      placeholder="0"
                    />
                  </div>
                  <button type="button" className={styles.btnPrimary} onClick={comprobarAleatorio}>
                    Comprobar
                  </button>
                  <button
                    type="button"
                    className={styles.btnSecundario}
                    aria-expanded={pasosAleatorios}
                    onClick={() => setPasosAleatorios(!pasosAleatorios)}
                  >
                    {pasosAleatorios ? 'Ocultar solución' : 'Ver solución'}
                  </button>
                </div>

                {veredictoAleatorio && (
                  <p className={claseMensaje(veredictoAleatorio)} role="alert" aria-live="polite">
                    {redactarVeredicto(veredictoAleatorio, ejercicio.caso.unidad)}
                  </p>
                )}

                {pasosAleatorios && (
                  <>
                    <p className={styles.solucionValor}>
                      Solución: {mostrar(ejercicio.caso.solucion)} {ejercicio.caso.unidad}
                    </p>
                    <ol className={styles.pasosLista}>
                      {ejercicio.caso.pasos.map((paso) => (
                        <li key={paso}>{paso}</li>
                      ))}
                    </ol>
                  </>
                )}

                <p className={styles.semilla}>
                  Semilla {ejercicio.semilla}. Pulsa otra vez el botón para generar un enunciado distinto.
                </p>
              </div>
            )}
          </section>

          <div className={styles.casosGrid}>
            {CASOS.map((caso) => {
              const veredicto = veredictos[caso.id];
              const abierto = Boolean(pasosAbiertos[caso.id]);
              return (
                <article
                  key={caso.id}
                  className={`${styles.casoCard} ${veredicto?.correcta ? styles.casoResuelto : ''}`}
                >
                  <div className={styles.casoCabecera}>
                    <span className={styles.casoNumero}>{caso.id}</span>
                    <h3 className={styles.casoTitulo}>{caso.titulo}</h3>
                    <span className={styles.etiqueta}>{ETIQUETA_TIPO[caso.tipo]}</span>
                    <span className={styles.etiqueta}>{ETIQUETA_NIVEL[caso.nivel]}</span>
                  </div>

                  <p className={styles.casoEnunciado}>{caso.enunciado}</p>

                  <FiguraCaso datos={caso.datos} />

                  <div className={styles.casoFila}>
                    <div className={styles.casoCampo}>
                      <label className={styles.campoEtiqueta} htmlFor={`respuesta-${caso.id}`}>
                        Tu respuesta ({caso.unidad})
                      </label>
                      <input
                        id={`respuesta-${caso.id}`}
                        className={styles.campoInput}
                        type="text"
                        inputMode="decimal"
                        value={respuestas[caso.id] ?? ''}
                        onChange={(evento) =>
                          setRespuestas((previas) => ({ ...previas, [caso.id]: evento.target.value }))
                        }
                        placeholder="0"
                      />
                    </div>
                    <button type="button" className={styles.btnPrimary} onClick={() => comprobarCaso(caso)}>
                      Comprobar
                    </button>
                    <button
                      type="button"
                      className={styles.btnSecundario}
                      aria-expanded={abierto}
                      onClick={() => alternarPasos(caso.id)}
                    >
                      {abierto ? 'Ocultar solución' : 'Ver solución'}
                    </button>
                  </div>

                  {veredicto && (
                    <p className={claseMensaje(veredicto)} role="alert" aria-live="polite">
                      {redactarVeredicto(veredicto, caso.unidad)}
                    </p>
                  )}

                  {abierto && (
                    <>
                      <p className={styles.solucionValor}>
                        Solución: {mostrar(caso.solucion)} {caso.unidad}
                      </p>
                      <ol className={styles.pasosLista}>
                        {caso.pasos.map((paso) => (
                          <li key={paso}>{paso}</li>
                        ))}
                      </ol>
                    </>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      )}

      {/* Disclaimer — Nivel 4 INFORMATIVO (educativo puro) */}
      <DisclaimerCard
        variant="educational"
        severity="low"
        collapsible
        context="simulador-teorema-tales"
      />

      {/* ============================================
          CONTENIDO EDUCATIVO
          ============================================ */}
      <EducationalSection
        icon="📚"
        title="Teorema de Tales y semejanza, de la definición a los problemas"
        subtitle="Qué se multiplica por qué, cómo se plantea la proporción y en qué se equivoca casi todo el mundo"
      >
        <section className={styles.guideSection}>
          <h2>Qué cambia y qué no cuando una figura se amplía o se reduce</h2>
          <p>
            La semejanza conserva la forma y cambia el tamaño. Esa frase suena inofensiva, pero esconde la trampa
            más repetida del tema: no todas las magnitudes cambian igual. Los ángulos no se enteran de nada, las
            longitudes siguen fielmente a la razón k, las áreas van al cuadrado y los volúmenes al cubo.
          </p>

          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <caption className={styles.campoAyuda}>
                Efecto de una razón de semejanza k sobre cada magnitud
              </caption>
              <thead>
                <tr>
                  <th scope="col">Magnitud</th>
                  <th scope="col">Se multiplica por</th>
                  <th scope="col">Con k = 3</th>
                  <th scope="col">Error frecuente</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Ángulo</td>
                  <td>1 (no cambia)</td>
                  <td>Los mismos grados</td>
                  <td>Creer que al ampliar los ángulos «se abren»</td>
                </tr>
                <tr>
                  <td>Lado</td>
                  <td>k</td>
                  <td>3 veces mayor</td>
                  <td>Aplicar k al lado equivocado por no emparejar bien</td>
                </tr>
                <tr>
                  <td>Perímetro</td>
                  <td>k</td>
                  <td>3 veces mayor</td>
                  <td>Elevar k al cuadrado también aquí</td>
                </tr>
                <tr>
                  <td>Área</td>
                  <td>k²</td>
                  <td>9 veces mayor</td>
                  <td>Multiplicar por 3 en vez de por 9</td>
                </tr>
                <tr>
                  <td>Volumen</td>
                  <td>k³</td>
                  <td>27 veces mayor</td>
                  <td>Pensar que un modelo al doble pesa el doble</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Dónde aparece esto fuera de la clase</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  🌳
                </span>
                <h3>Medir lo que no se puede alcanzar</h3>
              </div>
              <p className={styles.escenarioExample}>
                Una vara de 1,5 m da 2 m de sombra y un árbol da 9,2 m a la misma hora: el árbol mide 6,9 m. Sirve
                igual para un poste, una torre o un edificio, y solo hace falta una cinta métrica.
              </p>
              <p className={styles.escenarioTip}>
                Por qué funciona: los rayos del Sol llegan prácticamente paralelos, así que los dos triángulos
                comparten los ángulos y son semejantes por AA.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  🗺️
                </span>
                <h3>Leer un plano o un mapa</h3>
              </div>
              <p className={styles.escenarioExample}>
                En un mapa 1:25.000, 6,8 cm entre dos puntos son 1,7 km reales. En un plano de vivienda 1:50, una
                pared de 7,4 cm mide 3,7 m.
              </p>
              <p className={styles.escenarioTip}>
                Por qué funciona: un plano es una figura semejante al terreno con razón 1/N, y las áreas del plano se
                comportan como N² respecto a las reales.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  🖼️
                </span>
                <h3>Ampliar o reducir un diseño</h3>
              </div>
              <p className={styles.escenarioExample}>
                Un cartel que se imprime al doble de ancho y de alto necesita cuatro veces más superficie de papel y
                de tinta, no el doble. Lo mismo pasa al escalar una imagen o una maqueta.
              </p>
              <p className={styles.escenarioTip}>
                Por qué funciona: el presupuesto sigue al área, y el área va con k². Es la aplicación económica más
                directa del tema.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">
                  📐
                </span>
                <h3>Repartir un segmento en partes iguales</h3>
              </div>
              <p className={styles.escenarioExample}>
                Para dividir una tabla en cinco partes iguales sin calculadora, se traza una recta auxiliar con cinco
                marcas equidistantes y se unen con paralelas: Tales hace el reparto.
              </p>
              <p className={styles.escenarioTip}>
                Por qué funciona: si los segmentos de una secante son iguales, los de la otra también lo son, porque
                todas las razones valen 1.
              </p>
            </div>
          </div>

          <h2>Cómo resolver un problema de Tales o semejanza</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h4>Dibuja la figura y marca lo que conoces</h4>
                <p>
                  Aunque el enunciado no traiga dibujo. Un esquema con los cuatro segmentos anotados evita el 90 % de
                  los errores de emparejamiento, que son los que más puntúan en negativo.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h4>Comprueba que hay paralelismo o semejanza de verdad</h4>
                <p>
                  Tales exige rectas paralelas; la semejanza exige que se cumpla AA, LAL o LLL. Si el enunciado no lo
                  da ni se deduce, no puedes plantear la proporción: el resultado sería inventado.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h4>Empareja los segmentos correspondientes</h4>
                <p>
                  El segmento «de arriba» de una secante va con el «de arriba» de la otra. Escribe la proporción
                  siempre en el mismo orden: a / b = a′ / b′, nunca a / b = b′ / a′.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h4>Despeja multiplicando en cruz</h4>
                <p>
                  De a / b = a′ / b′ sale b′ = b · a′ / a. Trabaja con la fracción entera y redondea solo al final:
                  redondear a mitad de camino es la causa habitual de que el resultado quede «casi bien».
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h4>Comprueba las unidades antes de responder</h4>
                <p>
                  Los dos miembros de la proporción deben ir en la misma unidad. En escalas, pasa todo a centímetros
                  primero y convierte al final: mezclar centímetros del plano con metros reales es el error clásico
                  de esa parte.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h4>Pregúntate si el resultado tiene sentido</h4>
                <p>
                  Si el segmento buscado debía ser mayor que el conocido y te sale menor, la proporción está
                  invertida. Un árbol de 0,7 m o una pirámide de 3 km avisan de que algo se ha colado.
                </p>
              </div>
            </div>
          </div>

          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre figuras semejantes e iguales?</h4>
              <p>
                Dos figuras iguales (congruentes) coinciden al superponerlas: tienen los mismos ángulos y los mismos
                lados. Dos figuras semejantes tienen los mismos ángulos, pero sus lados guardan una razón constante k
                que puede ser distinta de 1. La igualdad es, por tanto, el caso particular de la semejanza con k = 1.
              </p>
              <p className={styles.faqTip}>
                Consejo: si k = 1 sale del enunciado, no hay ampliación ninguna; comprueba si has leído bien los
                datos.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Por qué las rectas tienen que ser paralelas?</h4>
              <p>
                Porque el paralelismo es lo que garantiza que los ángulos que las secantes forman con cada recta sean
                iguales, y de ahí salen los triángulos semejantes. Si dos rectas se cruzan aunque sea con un ángulo
                pequeñísimo, las razones dejan de coincidir, y con segmentos largos la diferencia se vuelve enorme.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puedo usar el método de las sombras a cualquier hora?</h4>
              <p>
                Sí, siempre que las dos sombras se midan en el mismo momento y sobre terreno horizontal. Lo que no
                vale es medir la sombra de la vara por la mañana y la del edificio por la tarde: el Sol habrá cambiado
                de altura y los triángulos ya no serán semejantes. Con el Sol muy bajo las sombras se alargan tanto que
                el error de medida crece; a media mañana o media tarde se trabaja más cómodo.
              </p>
              <p className={styles.faqTip}>
                Consejo: mide la sombra de un objeto desde el punto que está justo debajo de su parte más alta, no
                desde el borde exterior de su base.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>Si duplico la escala de un plano, ¿el papel también se duplica?</h4>
              <p>
                No: pasar de 1:100 a 1:50 duplica cada longitud del dibujo, pero multiplica por cuatro la superficie
                de papel necesaria. Es el mismo k² de los triángulos. Por eso un plano a escala más detallada suele
                obligar a cambiar de formato de hoja.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Cómo sé qué segmentos se corresponden?</h4>
              <p>
                Se corresponden los que quedan entre las mismas dos paralelas, o los que se oponen a ángulos iguales
                si trabajas con triángulos semejantes. Un truco fiable es ordenar los datos de cada figura de menor a
                mayor: en figuras semejantes el orden se conserva, así que el lado más corto de una va con el más
                corto de la otra.
              </p>
              <p className={styles.faqTip}>
                Consejo: escribe las dos ternas una encima de otra antes de plantear nada; el emparejamiento se ve
                solo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Es lo mismo el teorema de Tales que el teorema de la altura?</h4>
              <p>
                No. El teorema de Tales relaciona segmentos determinados por rectas paralelas sobre dos secantes. El
                teorema de la altura y el del cateto son consecuencias de la semejanza dentro de un triángulo
                rectángulo concreto. Comparten la idea de proporción, pero las hipótesis son distintas y no se pueden
                intercambiar.
              </p>
            </div>
          </div>

          <h2>Buenas prácticas al trabajar el tema</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ✅
              </span>
              <h4>Escribe la proporción antes de tocar números</h4>
              <p>
                Plantear a / b = a′ / b′ con letras y sustituir después evita colocar un dato en el sitio del otro.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ✅
              </span>
              <h4>Redondea solo en el último paso</h4>
              <p>
                Guarda la fracción completa mientras operas; redondear a mitad arrastra el error hasta el resultado
                final.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ✅
              </span>
              <h4>Unifica unidades desde el principio</h4>
              <p>
                Pasa todo a la misma unidad antes de dividir. En escalas, los centímetros son casi siempre la mejor
                unidad puente.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ✅
              </span>
              <h4>Comprueba la razón al terminar</h4>
              <p>
                Divide los dos pares de segmentos: si a / b y a′ / b′ no dan lo mismo, el resultado está mal
                emparejado.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ✅
              </span>
              <h4>Separa longitudes, áreas y volúmenes</h4>
              <p>
                Antes de multiplicar por k, pregúntate de qué magnitud hablas. Es la pregunta que decide entre k, k² y
                k³.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">
                ✅
              </span>
              <h4>Usa el simulador como comprobación, no como atajo</h4>
              <p>
                Resuelve primero en papel y compara después: el objetivo es detectar dónde falla tu razonamiento, no
                obtener el número.
              </p>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">
                ⚠️
              </span>
              <h3>Errores que hacen fallar el problema entero</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Confundir semejanza con igualdad:</strong> dos triángulos semejantes solo son iguales si k = 1.
                Dar por hecho que los lados coinciden porque los ángulos lo hacen invalida todo el planteamiento.
              </li>
              <li>
                <strong>Multiplicar el área por k en vez de por k²:</strong> con k = 3 el área no se triplica, se hace
                nueve veces mayor. Es el error más frecuente del tema y el que más se cobra en los exámenes.
              </li>
              <li>
                <strong>Emparejar mal los segmentos correspondientes:</strong> el segmento superior de una secante va
                con el superior de la otra. Cruzarlos da un resultado numéricamente limpio y completamente falso.
              </li>
              <li>
                <strong>Invertir la razón al despejar:</strong> escribir a / b = b′ / a′ en vez de a / b = a′ / b′
                produce el inverso del valor correcto, que además suele «parecer» razonable.
              </li>
              <li>
                <strong>Olvidar que las rectas deben ser paralelas:</strong> sin paralelismo no hay teorema de Tales.
                Si el enunciado no lo afirma ni se deduce de los datos, la proporción no se puede plantear.
              </li>
              <li>
                <strong>Mezclar unidades en la misma proporción:</strong> centímetros del plano con metros reales, o
                una sombra en metros con una vara en centímetros. El resultado sale desviado por un factor 100 sin que
                nada chirríe.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('simulador-teorema-tales')} />

      <ShareCard appName="simulador-teorema-tales" />

      <Footer appName="simulador-teorema-tales" />
    </div>
  );
}
