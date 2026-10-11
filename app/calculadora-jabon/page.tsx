'use client';

import { useMemo, useState } from 'react';
import styles from './CalculadoraJabon.module.css';
import {
  MeskeiaLogo,
  Footer,
  NumberInput,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { PREGUNTAS_FRECUENTES } from './metadata';
import { ACEITES, FUENTE_ACEITES } from './aceites';
import { calcular, escalar, validar, RANGOS, type Alcali, type Aviso, type MetodoAgua, type Propiedades } from './motor';

// ─── Estado editable ──────────────────────────────────────────────────────

interface FilaAceite {
  /** Clave estable de la fila (no el índice), para que React no mezcle filas al quitar una */
  clave: number;
  id: string;
  gramos: string;
}

interface Ejemplo {
  id: string;
  nombre: string;
  icono: string;
  alcali: Alcali;
  pureza: string;
  sobreengrase: string;
  metodoAgua: MetodoAgua;
  valorAgua: string;
  aceites: [string, string][];
}

const EJEMPLOS: Ejemplo[] = [
  {
    id: 'oliva-coco',
    nombre: 'Oliva y coco (70/30)',
    icono: '🧼',
    alcali: 'NaOH',
    pureza: '100',
    sobreengrase: '5',
    metodoAgua: 'concentracion',
    valorAgua: '33',
    aceites: [['oliva', '700'], ['coco', '300']],
  },
  {
    id: 'castilla',
    nombre: 'Jabón de Castilla (100 % oliva)',
    icono: '🫒',
    alcali: 'NaOH',
    pureza: '100',
    sobreengrase: '5',
    metodoAgua: 'concentracion',
    valorAgua: '33',
    aceites: [['oliva', '1000']],
  },
  {
    id: 'karite',
    nombre: 'Pastilla con karité y ricino',
    icono: '🧴',
    alcali: 'NaOH',
    pureza: '100',
    sobreengrase: '6',
    metodoAgua: 'concentracion',
    valorAgua: '33',
    aceites: [['oliva', '500'], ['coco', '250'], ['karite', '150'], ['ricino', '50'], ['cacao', '50']],
  },
  {
    id: 'potasico',
    nombre: 'Jabón potásico (líquido)',
    icono: '💧',
    alcali: 'KOH',
    pureza: '90',
    sobreengrase: '3',
    metodoAgua: 'proporcion',
    valorAgua: '3',
    aceites: [['oliva', '700'], ['coco', '300']],
  },
];

let siguienteClave = 1;
const filasDe = (aceites: [string, string][]): FilaAceite[] =>
  aceites.map(([id, gramos]) => ({ clave: siguienteClave++, id, gramos }));

const NOMBRE_ALCALI: Record<Alcali, string> = {
  NaOH: 'Sosa cáustica (NaOH)',
  KOH: 'Potasa (KOH)',
};

const TEXTO_AVISO: Record<Aviso, string> = {
  'koh-sobreengrase-alto':
    'Con potasa para jabón líquido se suele usar un sobreengrase de 0 a 3 %: el aceite libre de más enturbia el jabón.',
  'sobreengrase-alto': 'Un sobreengrase de más del 10 % da un jabón blando y con más tendencia a enranciarse.',
  'concentracion-baja':
    'La lejía queda por debajo del 25 %: con tanta agua el jabón tardará más en endurecer y en curar.',
  'concentracion-alta':
    'La lejía pasa del 40 %: con tan poca agua el álcali puede no disolverse del todo y la mezcla traza muy deprisa.',
};

const PROPIEDADES: { clave: keyof Propiedades; nombre: string; escala: number; ayuda: string }[] = [
  { clave: 'dureza', nombre: 'Dureza', escala: 100, ayuda: 'Pastilla firme que dura' },
  { clave: 'limpieza', nombre: 'Limpieza', escala: 100, ayuda: 'Arrastra grasa; en exceso reseca' },
  { clave: 'acondicionamiento', nombre: 'Acondicionamiento', escala: 100, ayuda: 'Suavidad en la piel' },
  { clave: 'burbuja', nombre: 'Burbuja', escala: 100, ayuda: 'Espuma abundante y ligera' },
  { clave: 'cremosidad', nombre: 'Cremosidad', escala: 100, ayuda: 'Espuma densa y estable' },
  { clave: 'yodo', nombre: 'Yodo', escala: 150, ayuda: 'Más alto, más blando y más fácil de enranciar' },
  { clave: 'ins', nombre: 'INS', escala: 300, ayuda: 'Equilibrio general; ~160 se considera ideal' },
];

const OLIVA = ACEITES.find((a) => a.id === 'oliva');

const fmtG = (n: number) => `${formatNumber(n, 1)} g`;

export default function CalculadoraJabonPage() {
  const inicial = EJEMPLOS[0];
  const [alcali, setAlcali] = useState<Alcali>(inicial.alcali);
  const [pureza, setPureza] = useState(inicial.pureza);
  const [sobreengrase, setSobreengrase] = useState(inicial.sobreengrase);
  const [metodoAgua, setMetodoAgua] = useState<MetodoAgua>(inicial.metodoAgua);
  const [valorAgua, setValorAgua] = useState(inicial.valorAgua);
  const [filas, setFilas] = useState<FilaAceite[]>(() => filasDe(inicial.aceites));
  const [objetivo, setObjetivo] = useState('');

  const cargarEjemplo = (e: Ejemplo) => {
    setAlcali(e.alcali);
    setPureza(e.pureza);
    setSobreengrase(e.sobreengrase);
    setMetodoAgua(e.metodoAgua);
    setValorAgua(e.valorAgua);
    setFilas(filasDe(e.aceites));
  };

  const cambiarAlcali = (a: Alcali) => {
    setAlcali(a);
    // La pureza habitual cambia con el álcali: NaOH comercial ~100 %, KOH en escamas ~90 %
    setPureza(a === 'NaOH' ? '100' : '90');
  };

  const cambiarMetodoAgua = (m: MetodoAgua) => {
    setMetodoAgua(m);
    setValorAgua(m === 'concentracion' ? '33' : '2');
  };

  const editarFila = (clave: number, campo: 'id' | 'gramos', valor: string) =>
    setFilas((prev) => prev.map((f) => (f.clave === clave ? { ...f, [campo]: valor } : f)));

  const anadirAceite = () => {
    const usados = new Set(filas.map((f) => f.id));
    const libre = ACEITES.find((a) => !usados.has(a.id)) ?? ACEITES[0];
    setFilas((prev) => [...prev, { clave: siguienteClave++, id: libre.id, gramos: '' }]);
  };

  const quitarAceite = (clave: number) =>
    setFilas((prev) => (prev.length <= 1 ? prev : prev.filter((f) => f.clave !== clave)));

  const aplicarEscala = () => {
    const meta = parseSpanishNumber(objetivo);
    if (!(meta > 0)) return;
    const lineas = filas.map((f) => ({ id: f.id, gramos: parseSpanishNumber(f.gramos) }));
    const escaladas = escalar(lineas, meta);
    setFilas((prev) =>
      prev.map((f, i) => {
        const g = escaladas[i].gramos;
        return Number.isFinite(g) && g > 0 ? { ...f, gramos: formatNumber(g, Number.isInteger(Math.round(g * 10) / 10) ? 0 : 1) } : f;
      }),
    );
  };

  // ─── Cálculo ────────────────────────────────────────────────────────────
  const calculo = useMemo(() => {
    const entrada = {
      lineas: filas.map((f) => ({ id: f.id, gramos: f.gramos.trim() === '' ? 0 : parseSpanishNumber(f.gramos) })),
      alcali,
      pureza: parseSpanishNumber(pureza),
      sobreengrase: parseSpanishNumber(sobreengrase),
      metodoAgua,
      valorAgua: parseSpanishNumber(valorAgua),
    };
    const error = validar(entrada, ACEITES);
    if (error) return { error } as const;
    return { error: null, r: calcular(entrada, ACEITES) } as const;
  }, [filas, alcali, pureza, sobreengrase, metodoAgua, valorAgua]);

  const totalGramos = filas.reduce((s, f) => {
    const g = parseSpanishNumber(f.gramos);
    return s + (Number.isFinite(g) && g > 0 ? g : 0);
  }, 0);

  return (
    <>
      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>
            <span aria-hidden="true">🧼</span> Calculadora de Jabón Casero
          </h1>
          <p className={styles.subtitle}>
            Cuánta sosa (soda cáustica) o potasa y cuánta agua necesita tu mezcla de aceites, con el sobreengrase que
            elijas y cómo saldrá el jabón.
          </p>
        </header>

        <LegalNotice />

        {/* ─── 1. Tipo de jabón ─── */}
        <section className={styles.panel} aria-labelledby="titulo-tipo">
          <h2 id="titulo-tipo" className={styles.panelTitulo}>
            1. Tipo de jabón
          </h2>
          <div className={styles.ejemplos}>
            <span className={styles.etiqueta}>Cargar una receta de ejemplo:</span>
            {EJEMPLOS.map((e) => (
              <button key={e.id} type="button" className={styles.btnEjemplo} onClick={() => cargarEjemplo(e)}>
                <span aria-hidden="true">{e.icono}</span> {e.nombre}
              </button>
            ))}
          </div>
          <div className={styles.grupo} role="group" aria-label="Álcali">
            <div className={styles.toggle}>
              <button
                type="button"
                aria-pressed={alcali === 'NaOH'}
                className={alcali === 'NaOH' ? styles.toggleActivo : styles.toggleBoton}
                onClick={() => cambiarAlcali('NaOH')}
              >
                Pastilla · sosa cáustica (NaOH)
              </button>
              <button
                type="button"
                aria-pressed={alcali === 'KOH'}
                className={alcali === 'KOH' ? styles.toggleActivo : styles.toggleBoton}
                onClick={() => cambiarAlcali('KOH')}
              >
                Blando o líquido · potasa (KOH)
              </button>
            </div>
          </div>
        </section>

        {/* ─── 2. Aceites ─── */}
        <section className={styles.panel} aria-labelledby="titulo-aceites">
          <h2 id="titulo-aceites" className={styles.panelTitulo}>
            2. Aceites y mantecas
          </h2>
          <div className={styles.tablaWrapper}>
            <table className={styles.tablaAceites}>
              <caption className={styles.srOnly}>Aceites de la receta con su peso en gramos</caption>
              <thead>
                <tr>
                  <th scope="col">Aceite</th>
                  <th scope="col">Gramos</th>
                  <th scope="col">%</th>
                  <th scope="col">
                    <span className={styles.srOnly}>Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f, i) => {
                  const g = parseSpanishNumber(f.gramos);
                  const pct = totalGramos > 0 && Number.isFinite(g) && g > 0 ? (g / totalGramos) * 100 : null;
                  return (
                    <tr key={f.clave}>
                      <td>
                        <select
                          value={f.id}
                          onChange={(e) => editarFila(f.clave, 'id', e.target.value)}
                          aria-label={`Aceite de la fila ${i + 1}`}
                          className={styles.select}
                        >
                          {ACEITES.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.nombre}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={f.gramos}
                          onChange={(e) => editarFila(f.clave, 'gramos', e.target.value)}
                          aria-label={`Gramos de la fila ${i + 1}`}
                          placeholder="0"
                          className={styles.inputGramos}
                        />
                      </td>
                      <td className={styles.celdaPct}>{pct === null ? '—' : `${formatNumber(pct, 1)} %`}</td>
                      <td>
                        <button
                          type="button"
                          className={styles.btnQuitar}
                          onClick={() => quitarAceite(f.clave)}
                          disabled={filas.length <= 1}
                          aria-label={`Quitar la fila ${i + 1}`}
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">Total de aceites</th>
                  <td className={styles.celdaTotal}>{fmtG(totalGramos)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
          <div className={styles.accionesAceites}>
            <button type="button" className={styles.btnSecundario} onClick={anadirAceite}>
              + Añadir aceite
            </button>
            <div className={styles.escalar}>
              <label className={styles.campoInline}>
                <span className={styles.etiqueta}>Escalar a</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value)}
                  placeholder="500"
                  className={styles.inputGramos}
                  aria-label="Total de aceites al que escalar la receta, en gramos"
                />
                <span>g de aceites</span>
              </label>
              <button type="button" className={styles.btnSecundario} onClick={aplicarEscala}>
                Escalar receta
              </button>
            </div>
          </div>
        </section>

        {/* ─── 3. Ajustes ─── */}
        <section className={styles.panel} aria-labelledby="titulo-ajustes">
          <h2 id="titulo-ajustes" className={styles.panelTitulo}>
            3. Ajustes
          </h2>
          <div className={styles.ajustes}>
            <NumberInput
              value={sobreengrase}
              onChange={setSobreengrase}
              label="Sobreengrase (%)"
              suffix="%"
              min={0}
              max={99}
              helperText={alcali === 'NaOH' ? 'Habitual en pastilla: 5-8 %' : 'Habitual en jabón líquido: 0-3 %'}
            />
            <NumberInput
              value={pureza}
              onChange={setPureza}
              label={`Pureza de la ${alcali === 'NaOH' ? 'sosa' : 'potasa'} (%)`}
              suffix="%"
              min={1}
              max={100}
              helperText="Mira la etiqueta del envase"
            />
            <div className={styles.grupoAgua}>
              <div className={styles.grupo} role="group" aria-label="Cómo calcular el agua">
                <span className={styles.etiqueta}>Agua de la lejía por:</span>
                <div className={styles.toggle}>
                  <button
                    type="button"
                    aria-pressed={metodoAgua === 'concentracion'}
                    className={metodoAgua === 'concentracion' ? styles.toggleActivo : styles.toggleBoton}
                    onClick={() => cambiarMetodoAgua('concentracion')}
                  >
                    Concentración
                  </button>
                  <button
                    type="button"
                    aria-pressed={metodoAgua === 'proporcion'}
                    className={metodoAgua === 'proporcion' ? styles.toggleActivo : styles.toggleBoton}
                    onClick={() => cambiarMetodoAgua('proporcion')}
                  >
                    Proporción
                  </button>
                </div>
              </div>
              <NumberInput
                value={valorAgua}
                onChange={setValorAgua}
                label={metodoAgua === 'concentracion' ? 'Concentración de la lejía (%)' : 'Partes de agua por cada parte de álcali'}
                suffix={metodoAgua === 'concentracion' ? '%' : ': 1'}
                min={0}
                helperText={metodoAgua === 'concentracion' ? 'Habitual: 28-38 %' : 'Habitual: 2:1 a 3:1'}
              />
            </div>
          </div>
        </section>

        {/* ─── Resultados ─── */}
        <section className={styles.panel} aria-labelledby="titulo-resultado">
          <h2 id="titulo-resultado" className={styles.panelTitulo}>
            4. Tu receta
          </h2>

          {calculo.error !== null ? (
            <div role="alert" className={styles.error}>
              {calculo.error}
            </div>
          ) : (
            <>
              <div className={styles.cifras}>
                <div className={`${styles.cifra} ${styles.cifraAlcali}`}>
                  <span className={styles.cifraEtiqueta}>{NOMBRE_ALCALI[alcali]} a pesar</span>
                  <span className={styles.cifraValor}>{fmtG(calculo.r.alcaliPesar)}</span>
                </div>
                <div className={styles.cifra}>
                  <span className={styles.cifraEtiqueta}>Agua</span>
                  <span className={styles.cifraValor}>{fmtG(calculo.r.agua)}</span>
                </div>
                <div className={styles.cifra}>
                  <span className={styles.cifraEtiqueta}>Aceites</span>
                  <span className={styles.cifraValor}>{fmtG(calculo.r.totalAceites)}</span>
                </div>
              </div>

              <dl className={styles.datos}>
                <div>
                  <dt>Concentración de la lejía</dt>
                  <dd>{formatNumber(calculo.r.concentracion, 1)}&nbsp;%</dd>
                </div>
                <div>
                  <dt>Proporción agua:álcali</dt>
                  <dd>{formatNumber(calculo.r.proporcion, 2)}&nbsp;:&nbsp;1</dd>
                </div>
                <div>
                  <dt>Masa total aproximada</dt>
                  <dd>{fmtG(calculo.r.masaTotal)}</dd>
                </div>
                <div>
                  <dt>Álcali puro sin sobreengrase</dt>
                  <dd>{fmtG(calculo.r.alcaliSinDescuento)}</dd>
                </div>
              </dl>

              <p className={styles.seguridad}>
                <span aria-hidden="true">⚠️</span> Echa siempre el álcali sobre el agua, nunca el agua sobre el álcali.
              </p>

              {calculo.r.avisos.length > 0 && (
                <ul className={styles.avisos}>
                  {calculo.r.avisos.map((a) => (
                    <li key={a}>{TEXTO_AVISO[a]}</li>
                  ))}
                </ul>
              )}

              <h3 className={styles.subtitulo}>Lo que aporta cada aceite</h3>
              <div className={styles.tablaWrapper}>
                <table className={styles.tablaDesglose}>
                  <caption className={styles.srOnly}>
                    Peso, porcentaje y álcali que saponifica cada aceite, sin contar el sobreengrase
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Aceite</th>
                      <th scope="col">Gramos</th>
                      <th scope="col">%</th>
                      <th scope="col">Índice ({alcali})</th>
                      <th scope="col">{alcali} que saponifica</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculo.r.lineas.map((l) => (
                      <tr key={l.aceite.id}>
                        <td>{l.aceite.nombre}</td>
                        <td>{fmtG(l.gramos)}</td>
                        <td>{formatNumber(l.porcentaje, 1)}&nbsp;%</td>
                        <td>{formatNumber(alcali === 'NaOH' ? l.aceite.sapNaOH : l.aceite.sapKOH, 3)}</td>
                        <td>{fmtG(l.alcaliTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className={styles.subtitulo}>Cómo saldrá el jabón</h3>
              {alcali === 'KOH' && (
                <p className={styles.nota}>
                  Los rangos son los de SoapCalc para jabón en pastilla: en un jabón líquido de potasa sirven para
                  comparar recetas, no como objetivo.
                </p>
              )}
              <ul className={styles.propiedades}>
                {PROPIEDADES.map((p) => {
                  const v = calculo.r.propiedades[p.clave];
                  const [min, max] = RANGOS[p.clave];
                  const estado = v < min ? 'por debajo' : v > max ? 'por encima' : 'dentro';
                  return (
                    <li key={p.clave} className={styles.propiedad}>
                      <div className={styles.propiedadCabecera}>
                        <span className={styles.propiedadNombre}>{p.nombre}</span>
                        <span className={styles.propiedadValor}>
                          {formatNumber(v, 0)}
                          <span className={estado === 'dentro' ? styles.estadoDentro : styles.estadoFuera}>
                            {' '}
                            {estado === 'dentro' ? `en rango (${min}-${max})` : `${estado} de ${min}-${max}`}
                          </span>
                        </span>
                      </div>
                      <div className={styles.barra} aria-hidden="true">
                        <span
                          className={styles.barraRango}
                          style={{ left: `${(min / p.escala) * 100}%`, width: `${((max - min) / p.escala) * 100}%` }}
                        />
                        <span
                          className={styles.barraValor}
                          style={{ width: `${Math.min(100, (v / p.escala) * 100)}%` }}
                        />
                      </div>
                      <span className={styles.propiedadAyuda}>{p.ayuda}</span>
                    </li>
                  );
                })}
              </ul>
              <p className={styles.nota}>
                Índices de saponificación y ácidos grasos: {FUENTE_ACEITES.tabla}, cotejados el {FUENTE_ACEITES.verificado}.
                Son promedios; el sobreengrase cubre la variación de cada aceite.
              </p>
            </>
          )}
        </section>

        <DisclaimerCard variant="technical" severity="high" collapsible={false} title="Trabajar con sosa o potasa cáustica">
          <p>
            La sosa y la potasa cáusticas son <strong>corrosivas</strong>: queman la piel y pueden causar lesiones graves
            en los ojos. Trabaja con gafas de protección, guantes y manga larga, en un sitio ventilado y lejos de niños y
            mascotas. Echa siempre el álcali sobre el agua, nunca al revés, y usa recipientes de acero inoxidable, vidrio
            resistente al calor o plástico apto; <strong>nunca de aluminio</strong>, que reacciona con la sosa.
          </p>
          <p>
            Los resultados son orientativos: los índices de saponificación son promedios. Pesa con una báscula de
            precisión, revisa la receta antes de mezclar y deja curar el jabón antes de usarlo.
          </p>
        </DisclaimerCard>

        {/* ─── Contenido educativo ─── */}
        <EducationalSection
          icon="📚"
          title="Cómo se calcula un jabón"
          subtitle="Saponificación, sobreengrase, sosa frente a potasa y los errores habituales"
        >
          <section className={styles.guideSection}>
            <h2>La saponificación en una línea</h2>
            <p>
              Un aceite reacciona con un álcali fuerte y se convierte en jabón y glicerina. Cada aceite necesita una
              cantidad concreta de álcali para transformarse por completo: es su <strong>índice de saponificación</strong>.
              Sumando el de cada aceite por su peso sale el álcali total; el <strong>sobreengrase</strong> descuenta un
              pequeño porcentaje para que no quede álcali libre en el jabón.
            </p>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th scope="col">Aspecto</th>
                    <th scope="col">Sosa cáustica (NaOH)</th>
                    <th scope="col">Potasa (KOH)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Jabón que da</td>
                    <td>Duro, en pastilla</td>
                    <td>Blando o pasta para jabón líquido</td>
                  </tr>
                  <tr>
                    <td>Cantidad por gramo de aceite</td>
                    <td>Menor (oliva: {formatNumber(OLIVA?.sapNaOH ?? 0, 3)} g)</td>
                    <td>Unas 1,4 veces más (oliva: {formatNumber(OLIVA?.sapKOH ?? 0, 3)} g)</td>
                  </tr>
                  <tr>
                    <td>Pureza comercial habitual</td>
                    <td>~100 %</td>
                    <td>~90 %</td>
                  </tr>
                  <tr>
                    <td>Sobreengrase habitual</td>
                    <td>5-8 %</td>
                    <td>0-3 %</td>
                  </tr>
                  <tr>
                    <td>Otros nombres</td>
                    <td>Soda cáustica, hidróxido de sodio</td>
                    <td>Hidróxido de potasio</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Para quién es útil</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <h3>
                  <span aria-hidden="true">🧼</span> Tu primera pastilla
                </h3>
                <p>Parte de una receta sencilla de oliva y coco, comprueba la sosa y el agua y escálala al molde que tengas.</p>
              </div>
              <div className={styles.escenarioCard}>
                <h3>
                  <span aria-hidden="true">🔁</span> Cambiar un aceite de la receta
                </h3>
                <p>Sustituye un aceite por otro y mira cuánto cambia la sosa y cómo se mueven la dureza y la limpieza.</p>
              </div>
              <div className={styles.escenarioCard}>
                <h3>
                  <span aria-hidden="true">💧</span> Jabón líquido de potasa
                </h3>
                <p>Calcula la potasa con su pureza real y el agua de la pasta antes de diluirla.</p>
              </div>
              <div className={styles.escenarioCard}>
                <h3>
                  <span aria-hidden="true">🍳</span> Aceite de cocina usado
                </h3>
                <p>
                  Cuélalo bien y calcúlalo como el aceite del que procede (oliva o girasol); un sobreengrase algo mayor da
                  margen a la variación que trae.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Paso a paso</h2>
            <div className={styles.stepGuide}>
              {[
                ['Elige el tipo de jabón', 'Sosa para pastilla, potasa para jabón blando o líquido.'],
                ['Escribe los aceites y su peso', 'En gramos. El porcentaje de cada uno se calcula solo.'],
                ['Ajusta sobreengrase, pureza y agua', 'Los valores por defecto son los más habituales.'],
                ['Revisa las propiedades', 'Si la limpieza se dispara o la dureza se queda corta, cambia la mezcla.'],
                ['Escala a tu molde', 'Escribe el total de aceites que cabe y pulsa «Escalar receta».'],
                ['Pesa y trabaja con protección', 'Báscula de precisión, gafas y guantes; el álcali siempre sobre el agua.'],
              ].map(([titulo, texto], i) => (
                <div key={titulo} className={styles.step}>
                  <span className={styles.stepNumber}>{i + 1}</span>
                  <div className={styles.stepContent}>
                    <h3>{titulo}</h3>
                    <p>{texto}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Buenas prácticas</h2>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
                <p>Pesa todo, también el agua: los volúmenes no sirven para el álcali.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🧾</span>
                <p>Comprueba la pureza en la etiqueta del álcali y escríbela: la potasa rara vez es del 100 %.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🥥</span>
                <p>Con mucho coco (más del 30 %) sube la limpieza y el jabón puede resecar: compénsalo con más sobreengrase.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📝</span>
                <p>Apunta la receta exacta y el lote: si el jabón sale bien, podrás repetirlo.</p>
              </div>
            </div>
          </section>

          <section className={styles.guideSection}>
            <div className={styles.warningBox}>
              <h2 className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span> Errores frecuentes
              </h2>
              <ul className={styles.warningList}>
                <li>Usar el índice de la sosa con potasa, o al revés: la cantidad cambia en un 40 %.</li>
                <li>Cambiar un aceite por otro sin recalcular.</li>
                <li>Echar el agua sobre la sosa: la reacción es violenta y puede salpicar.</li>
                <li>Usar recipientes o utensilios de aluminio.</li>
                <li>Olvidar la pureza de la potasa, que deja el jabón con menos álcali del necesario.</li>
                <li>Usar el jabón antes de que termine de curar.</li>
              </ul>
            </div>
          </section>

          <section className={styles.guideSection}>
            <h2>Preguntas frecuentes</h2>
            <div className={styles.faqList}>
              {PREGUNTAS_FRECUENTES.map((f) => (
                <div key={f.question} className={styles.faqItem}>
                  <h3>{f.question}</h3>
                  <p>{f.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </EducationalSection>

        <RelatedApps />

        <ShareCard appName="calculadora-jabon" />

        <Footer appName="calculadora-jabon" />
      </div>
    </>
  );
}
