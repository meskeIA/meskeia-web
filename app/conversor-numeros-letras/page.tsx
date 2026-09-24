'use client';

import { useMemo, useRef, useState, type FocusEvent, type MouseEvent } from 'react';
import styles from './ConversorNumerosLetras.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import {
  formatNumber,
  parseSpanishNumber,
  partesNumericas,
  lecturaAmbiguaAlternativa,
  type PartesNumericas,
} from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  MONEDAS,
  cantidadALetras,
  numeroALetras,
  separarMarcaMoneda,
  nombrarMonedas,
  LIMITE_NUMERO_A_LETRAS,
  type EstiloFraccion,
  type MarcaMoneda,
} from '@/lib/numeroALetras';

type Modo = 'importe' | 'numero';

interface Resultado {
  texto: string;
  error: string;
  valor?: number;
  partes?: PartesNumericas;
}

const MENSAJE_NO_RECONOCIDA = 'No se reconoce esa cantidad. Escribe solo cifras, con coma o punto decimal.';

/**
 * Etiqueta de control del número suelto, con las cifras decimales TAL COMO SE TECLEARON.
 *
 * Hallazgo 1543 (24/09/2026): la etiqueta forzaba dos decimales mientras el texto leía todas
 * las cifras, así que «1,5» se etiquetaba «1,50» y «0,001» «0,00» junto a «cero coma cero cero
 * uno». Las dos lecturas del mismo número tienen que coincidir. La parte entera sí pasa por
 * `formatNumber` (cabe entera en un número exacto: el tope es 999.999.999.999); los decimales
 * NO, porque como número ya han perdido sus ceros finales y sus cifras más allá de la 15.ª.
 */
function etiquetaNumeroSuelto(valor: number, partes: PartesNumericas): string {
  const signo = valor < 0 ? '-' : ''; // -0 no lleva signo, igual que el texto («cero»)
  const entera = formatNumber(Number(partes.entera || '0'), 0);
  return `${signo}${entera}${partes.decimales ? `,${partes.decimales}` : ''}`;
}

const citar = (textos: string[]) => textos.map((t) => `«${t}»`).join(' y ');
const mismaMarca = (a: MarcaMoneda | null, b: MarcaMoneda | null) =>
  JSON.stringify(a) === JSON.stringify(b);

const EJEMPLOS = [
  { etiqueta: '3.847,50', valor: '3.847,50' },
  { etiqueta: '21', valor: '21' },
  { etiqueta: '100', valor: '100' },
  { etiqueta: '1.000.000', valor: '1.000.000' },
  { etiqueta: '0,05', valor: '0,05' },
];

const ESTILOS_FRACCION: Array<{ id: EstiloFraccion; etiqueta: string; ayuda: string }> = [
  { id: 'letras', etiqueta: 'En letras', ayuda: 'con cincuenta céntimos' },
  { id: 'fraccion', etiqueta: 'Fracción 00/100', ayuda: 'con 50/100' },
  { id: 'omitir', etiqueta: 'Sin decimales', ayuda: 'solo la parte entera' },
];

export default function ConversorNumerosLetrasPage() {
  const [entrada, setEntrada] = useState('3.847,50');
  const [modo, setModo] = useState<Modo>('importe');
  const [codigoMoneda, setCodigoMoneda] = useState('EUR');
  const [estiloFraccion, setEstiloFraccion] = useState<EstiloFraccion>('letras');
  const [mayusculas, setMayusculas] = useState(false);
  const [copiado, setCopiado] = useState(false);
  /** Moneda que eligió la app por el símbolo tecleado, para decirlo (hallazgo 1540) */
  const [monedaPorMarca, setMonedaPorMarca] = useState<string | null>(null);

  const bloqueCantidad = useRef<HTMLDivElement>(null);
  const recienEnfocado = useRef(false);

  const moneda = MONEDAS.find((m) => m.codigo === codigoMoneda) ?? MONEDAS[0];

  // La moneda escrita junto a la cifra («£1.500», «S/ 1,500.00», «1500 pesos») se separa
  // ANTES de leer el número, y no se tira: decide la moneda o se avisa (hallazgos 1540 y 1542).
  const lectura = useMemo(() => separarMarcaMoneda(entrada), [entrada]);

  const resultado = useMemo<Resultado>(() => {
    const limpio = entrada.trim();
    if (limpio === '') return { texto: '', error: '' };

    // `partesNumericas` da además las cifras decimales TAL COMO SE TECLEARON: el número ya no
    // recuerda el cero final de 0,50 y esta app promete leerlas «una a una».
    const partes = partesNumericas(lectura.cifra);
    const valor = parseSpanishNumber(lectura.cifra);
    if (!partes || !Number.isFinite(valor)) {
      return { texto: '', error: MENSAJE_NO_RECONOCIDA };
    }
    // «$1.500 €»: dos monedas que se contradicen. Elegir una sería adivinar en un pagaré.
    if (modo === 'importe' && lectura.marca && lectura.marca.codigos.length === 0) {
      return {
        texto: '',
        error: `${citar(lectura.marca.textos)} no son la misma moneda: deja solo una.`,
      };
    }
    // El tope se compara contra la parte ENTERA: la ayuda anuncia «hasta 999.999.999.999 y dos
    // decimales», y comparando el valor completo el propio máximo declarado se rechazaba.
    //
    // En modo IMPORTE, además, sobre la parte entera ya redondeada a céntimos, que es la que
    // se va a leer: 999.999.999.999,995 se redondea a un billón y no cabe. Sin esto, esa
    // franja de un céntimo se colaba y salía el mensaje interno del motor —con el número sin
    // formato español— en lugar del aviso que la propia app promete (hallazgo 263).
    const enteroQueSeLee = modo === 'importe'
      ? Math.floor(Math.round(Math.abs(valor) * 100) / 100)
      : Math.floor(Math.abs(valor));
    if (enteroQueSeLee > LIMITE_NUMERO_A_LETRAS) {
      return {
        texto: '',
        error: `La cantidad máxima admitida es ${formatNumber(LIMITE_NUMERO_A_LETRAS, 0)}.`,
      };
    }

    try {
      const texto =
        modo === 'importe'
          ? cantidadALetras(valor, { moneda, estiloFraccion, mayusculas }).texto
          : mayusculas
            ? numeroALetras(valor, 'masculino', partes.decimales).toUpperCase()
            : numeroALetras(valor, 'masculino', partes.decimales);
      return { texto, error: '', valor, partes };
    } catch (e) {
      return { texto: '', error: e instanceof Error ? e.message : 'No se ha podido convertir la cantidad.' };
    }
  }, [entrada, lectura, modo, moneda, estiloFraccion, mayusculas]);

  /**
   * Si lo tecleado trae una marca que solo puede ser UNA moneda del selector («£», «S/», «L»,
   * «RD$»…), la app la elige y lo dice. Solo cuando la marca CAMBIA: seguir tecleando cifras
   * detrás de «£» no vuelve a pisar una moneda que el usuario haya cambiado a mano.
   * Las ambiguas («$», «Bs», «pesos») no eligen nada: se avisa abajo y se pide elegir.
   */
  const cambiarEntrada = (nueva: string) => {
    const marcaNueva = separarMarcaMoneda(nueva).marca;
    if (
      modo === 'importe' &&
      marcaNueva?.codigos.length === 1 &&
      !mismaMarca(marcaNueva, lectura.marca) &&
      marcaNueva.codigos[0] !== codigoMoneda
    ) {
      setCodigoMoneda(marcaNueva.codigos[0]);
      setMonedaPorMarca(marcaNueva.codigos[0]);
    }
    setEntrada(nueva);
  };

  /**
   * Hallazgo 1539: el campo llega RELLENO con un ejemplo, y al tocarlo el cursor quedaba al
   * final, así que teclear «1500» producía «3.847,501500» —que se redondeaba a 3.847,50 y el
   * panel no cambiaba—. Al entrar en el campo se selecciona todo: lo que se teclea SUSTITUYE
   * al ejemplo. El `mouseup` que sigue al primer clic deshace la selección en Chrome, de ahí
   * `recienEnfocado`.
   *
   * Hallazgo 1538, el que mejor explica la firma de rotura en móvil: al tocar el campo, el
   * teclado virtual tapa media pantalla y el resultado quedaba debajo. En pantallas estrechas
   * se sube el campo hasta arriba (bajo la barra fija del logo, `scroll-margin-top`), de modo
   * que el resultado, que va justo detrás, queda en la mitad que el teclado deja libre.
   * Instantáneo y no suave: un desplazamiento animado lo interrumpe el del propio navegador
   * al abrir el teclado.
   */
  const alEnfocarCampo = (e: FocusEvent<HTMLInputElement>) => {
    e.currentTarget.select();
    recienEnfocado.current = true;
    if (window.matchMedia('(max-width: 768px)').matches) {
      bloqueCantidad.current?.scrollIntoView({ block: 'start' });
    }
  };

  const alSoltarEnCampo = (e: MouseEvent<HTMLInputElement>) => {
    if (!recienEnfocado.current) return;
    recienEnfocado.current = false;
    e.preventDefault();
  };

  const copiar = async () => {
    if (!resultado.texto) return;
    try {
      await navigator.clipboard.writeText(resultado.texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  };

  const valorNumerico = typeof resultado.valor === 'number' ? resultado.valor : null;

  // «830,400» tanto puede ser ochocientos treinta con cuarenta como ochocientos treinta mil
  // cuatrocientos, y ninguna regla lo resuelve: depende del país de quien escribe. La app lo
  // dice en voz alta y ofrece la otra lectura en vez de adivinar en silencio, porque de aquí
  // sale la cantidad de un pagaré y equivocarse cuesta un factor mil.
  const alternativa = useMemo(
    () => (resultado.error ? null : lecturaAmbiguaAlternativa(lectura.cifra)),
    [lectura.cifra, resultado.error]
  );

  /**
   * Hallazgo 1539, la otra mitad: un importe se redondea a céntimos, y con más de dos
   * decimales eso cambiaba la cifra EN SILENCIO («3.847,501500» salía igual que 3.847,50).
   * Se dice. Calla cuando ya habla el aviso de la coma ambigua, que explica esa misma lectura.
   */
  const decimalesDeMas =
    modo === 'importe' &&
    !resultado.error &&
    !alternativa &&
    valorNumerico !== null &&
    (resultado.partes?.decimales.length ?? 0) > 2;

  const marca = resultado.error ? null : lectura.marca;
  const marcaCuadra = !!marca && marca.codigos.includes(moneda.codigo);
  const nombresMarca = marca ? nombrarMonedas(marca.codigos, 'o') : '';
  const monedaDeLaMarca =
    marca?.codigos.length === 1 ? MONEDAS.find((m) => m.codigo === marca.codigos[0]) : undefined;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">✍️</span> Números a Letras
        </h1>
        <p className={styles.subtitle}>
          Escribe cualquier cifra en palabras con las reglas del español bien aplicadas: apócope,
          concordancia de género, cien frente a ciento y escala larga. Para cheques, pagarés,
          contratos y facturas.
        </p>
      </header>

      <LegalNotice />

      {/*
        ═══════ HERRAMIENTA ═══════
        Orden pensado para el móvil (hallazgo 1538): lo que se elige ANTES de escribir (modo y
        moneda) va encima del campo, y el resultado va JUSTO DEBAJO, antes que los ajustes finos
        (ejemplos, decimales, mayúsculas). Antes había unos 770 px entre el campo y el resultado,
        y con el teclado abierto no se veía nada de lo que se tecleaba.
      */}
      <div className={styles.card}>
        <div className={styles.modoSelector} role="group" aria-label="Qué se va a escribir en letras">
          <button
            type="button"
            className={`${styles.modoBtn} ${modo === 'importe' ? styles.modoBtnActivo : ''}`}
            aria-pressed={modo === 'importe'}
            onClick={() => setModo('importe')}
          >
            <span aria-hidden="true">💶</span> Importe con moneda
          </button>
          <button
            type="button"
            className={`${styles.modoBtn} ${modo === 'numero' ? styles.modoBtnActivo : ''}`}
            aria-pressed={modo === 'numero'}
            onClick={() => setModo('numero')}
          >
            <span aria-hidden="true">🔢</span> Número suelto
          </button>
        </div>

        <div className={styles.entrada}>
          {modo === 'importe' && (
            <div className={styles.campoMoneda}>
              <label className={styles.label} htmlFor="moneda">
                Moneda
              </label>
              <select
                id="moneda"
                className={styles.select}
                value={codigoMoneda}
                onChange={(e) => {
                  setCodigoMoneda(e.target.value);
                  setMonedaPorMarca(null);
                }}
              >
                {MONEDAS.map((m) => (
                  <option key={`${m.codigo}-${m.zona}`} value={m.codigo}>
                    {m.singular.charAt(0).toUpperCase() + m.singular.slice(1)} — {m.zona}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.campoPrincipal} ref={bloqueCantidad}>
            <label className={styles.label} htmlFor="cantidad">
              Cantidad
            </label>
            <input
              id="cantidad"
              type="text"
              inputMode="decimal"
              className={styles.input}
              value={entrada}
              onChange={(e) => cambiarEntrada(e.target.value)}
              onFocus={alEnfocarCampo}
              onMouseUp={alSoltarEnCampo}
              onBlur={() => {
                recienEnfocado.current = false;
              }}
              placeholder="Por ejemplo, 1.500,00"
              autoComplete="off"
            />
            <p className={styles.helper}>
              Admite 3.847,50 y 3,847.50, con o sin símbolo de moneda. Hasta{' '}
              {formatNumber(LIMITE_NUMERO_A_LETRAS, 0)} y dos decimales.
            </p>
          </div>
        </div>
      </div>

      {/* ═══════ RESULTADO ═══════ */}
      <div className={styles.resultadoCard} role="region" aria-label="Resultado">
        {resultado.error ? (
          <p className={styles.error} role="alert">
            {resultado.error}
          </p>
        ) : resultado.texto ? (
          <>
            <div className={styles.resultadoCabecera}>
              <span className={styles.resultadoEtiqueta}>
                {valorNumerico === null
                  ? ''
                  : modo === 'importe'
                    ? `${formatNumber(valorNumerico, 2)} ${moneda.codigo}`
                    : resultado.partes
                      ? etiquetaNumeroSuelto(valorNumerico, resultado.partes)
                      : ''}
              </span>
              <button type="button" className={styles.copiarBtn} onClick={copiar}>
                <span aria-hidden="true">{copiado ? '✅' : '📋'}</span>{' '}
                {copiado ? 'Copiado' : 'Copiar'}
              </button>
            </div>
            <p className={styles.resultadoTexto} aria-live="polite">
              {resultado.texto}
            </p>

            {/* La moneda escrita junto a la cifra: elegida, contradicha o sobrante (1540) */}
            {marca && modo === 'numero' && (
              <p className={styles.nota} role="status">
                En «Número suelto» no se escribe la moneda: {citar(marca.textos)} se ha dejado
                fuera. Para escribirla, elige «Importe con moneda».
              </p>
            )}
            {marca && modo === 'importe' && marcaCuadra && monedaPorMarca === moneda.codigo && (
              <p className={styles.nota} role="status">
                Moneda elegida por {citar(marca.textos)}: {moneda.singular} ({moneda.zona}). Si no
                es la tuya, cámbiala en «Moneda».
              </p>
            )}
            {marca && modo === 'importe' && !marcaCuadra && (
              <div className={styles.aviso} role="status">
                <p className={styles.avisoTexto}>
                  {citar(marca.textos)} {monedaDeLaMarca || !nombresMarca.includes(' o ') ? 'indica' : 'puede ser'}{' '}
                  {nombresMarca}, pero el texto sale en <strong>{moneda.plural}</strong>, la moneda
                  elegida.{monedaDeLaMarca ? '' : ' Elige la tuya en «Moneda».'}
                </p>
                {monedaDeLaMarca && (
                  <button
                    type="button"
                    className={styles.avisoBtn}
                    onClick={() => {
                      setCodigoMoneda(monedaDeLaMarca.codigo);
                      setMonedaPorMarca(monedaDeLaMarca.codigo);
                    }}
                  >
                    Escribir en {monedaDeLaMarca.plural}
                  </button>
                )}
              </div>
            )}

            {decimalesDeMas && valorNumerico !== null && (
              <div className={styles.aviso} role="status">
                <p className={styles.avisoTexto}>
                  Un importe lleva dos decimales como mucho: <strong>{entrada.trim()}</strong> se
                  ha leído como <strong>{formatNumber(valorNumerico, 2)}</strong>.
                </p>
              </div>
            )}

            {alternativa && (
              <div className={styles.desambiguacion} role="status">
                <p className={styles.desambiguacionTexto}>
                  <span aria-hidden="true">🔎</span> La coma de{' '}
                  <strong>{entrada.trim()}</strong> se ha leído como decimal. Si separa los
                  millares —como se escribe en México, Perú o Centroamérica—, la cantidad es{' '}
                  <strong>{alternativa.texto}</strong>.
                </p>
                <button
                  type="button"
                  className={styles.desambiguacionBtn}
                  onClick={() => setEntrada(`${lectura.antes}${alternativa.texto}${lectura.despues}`)}
                >
                  Leer {alternativa.texto}
                </button>
              </div>
            )}
            {modo === 'importe' && (
              <p className={styles.resultadoDocumento}>
                <span aria-hidden="true">📄</span> En un documento:{' '}
                <em>
                  «Págese por este {moneda.codigo === 'EUR' ? 'pagaré' : 'documento'} la cantidad de{' '}
                  {resultado.texto}»
                </em>
              </p>
            )}
          </>
        ) : (
          <p className={styles.vacio}>Escribe una cantidad para verla en letras.</p>
        )}
      </div>

      {/* ═══════ AJUSTES ═══════ */}
      <div className={styles.card}>
        <div className={styles.ejemplos}>
          <span className={styles.ejemplosLabel}>Prueba con:</span>
          {EJEMPLOS.map((ej) => (
            <button
              key={ej.valor}
              type="button"
              className={styles.ejemploBtn}
              onClick={() => setEntrada(ej.valor)}
            >
              {ej.etiqueta}
            </button>
          ))}
        </div>

        {modo === 'importe' && (
          <div className={styles.opcionCampo}>
            <span className={styles.label} id="etiqueta-decimales">
              Decimales
            </span>
            <div className={styles.estiloGrid} role="group" aria-labelledby="etiqueta-decimales">
              {ESTILOS_FRACCION.map((estilo) => (
                <button
                  key={estilo.id}
                  type="button"
                  className={`${styles.estiloBtn} ${estiloFraccion === estilo.id ? styles.estiloBtnActivo : ''}`}
                  aria-pressed={estiloFraccion === estilo.id}
                  onClick={() => setEstiloFraccion(estilo.id)}
                >
                  <strong>{estilo.etiqueta}</strong>
                  <small>{estilo.ayuda}</small>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.opcionMayusculas}>
          <button
            type="button"
            className={`${styles.toggleBtn} ${mayusculas ? styles.toggleBtnActivo : ''}`}
            aria-pressed={mayusculas}
            onClick={() => setMayusculas((v) => !v)}
          >
            <span aria-hidden="true">🔠</span> MAYÚSCULAS
          </button>
          <span className={styles.toggleAyuda}>Con tildes, como manda la ortografía</span>
        </div>
      </div>

      <DisclaimerCard variant="general" severity="medium">
        Esta herramienta aplica las reglas ortográficas del español, no valida documentos. Antes de
        firmar un cheque, un pagaré o un contrato, comprueba que la cantidad en letras y la escrita
        en cifras coinciden: si difieren, la normativa mercantil suele dar preferencia a la escrita
        en letras.
      </DisclaimerCard>

      {/* ═══════ CONTENIDO EDUCATIVO ═══════ */}
      <EducationalSection
        title="Cómo se escriben las cantidades en letras"
        subtitle="Apócope, concordancia, cien frente a ciento y por qué mil millones no es un billón"
        icon="📚"
      >
        <p>
          Pasar una cifra a palabras parece mecánico hasta que aparecen los casos que el español
          resuelve de forma particular. Las cuatro reglas de abajo concentran casi todos los errores
          que se ven en cheques, pagarés y contratos redactados a mano.
        </p>

        <h2>
          <span aria-hidden="true">📊</span> Las cuatro reglas que más se fallan
        </h2>

        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th scope="col">Regla</th>
                <th scope="col">Correcto</th>
                <th scope="col">Incorrecto</th>
                <th scope="col">Por qué</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Apócope</td>
                <td>veintiún euros</td>
                <td>veintiuno euros</td>
                <td>«Uno» se acorta delante del sustantivo</td>
              </tr>
              <tr>
                <td>Concordancia</td>
                <td>doscientas una libras</td>
                <td>doscientos un libras</td>
                <td>El numeral concuerda con el género de la moneda</td>
              </tr>
              <tr>
                <td>Cien / ciento</td>
                <td>cien mil · ciento veinte</td>
                <td>ciento mil · cien veinte</td>
                <td>«Cien» multiplica; «ciento» precede a un número menor</td>
              </tr>
              <tr>
                <td>Escala larga</td>
                <td>mil millones (10⁹)</td>
                <td>un billón (10⁹)</td>
                <td>En español un billón es un millón de millones</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h2>
          <span aria-hidden="true">👥</span> Para qué se usa
        </h2>

        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <h3>
              <span aria-hidden="true">🏦</span> Cheques y pagarés
            </h3>
            <p>
              El importe va dos veces: en cifras y en letras. Si no coinciden, la normativa mercantil
              suele dar preferencia a la escrita en letras, precisamente porque es más difícil de
              alterar que un número.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>
              <span aria-hidden="true">📝</span> Contratos y escrituras
            </h3>
            <p>
              Precios, plazos y superficies se duplican en letras por la misma razón. En una compraventa,
              un dígito añadido a mano cambia el precio; una palabra no se añade sin que se note.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>
              <span aria-hidden="true">🧾</span> Facturas en Latinoamérica
            </h3>
            <p>
              Muchos formatos piden el monto en letras con los centavos como fracción sobre cien:
              «ciento veinte pesos con 50/100». Es la opción «Fracción 00/100» de arriba.
            </p>
          </div>
          <div className={styles.escenarioCard}>
            <h3>
              <span aria-hidden="true">🎓</span> Clase de lengua
            </h3>
            <p>
              Los numerales son de los pocos apartados de ortografía con reglas nítidas y muchas
              excepciones memorizables. Cambiar la moneda muestra la concordancia de género en acción.
            </p>
          </div>
        </div>

        <h2>
          <span aria-hidden="true">❓</span> Preguntas frecuentes
        </h2>

        <ul className={styles.faqList}>
          <li className={styles.faqItem}>
            <strong>¿Se escribe veintiún euros o veintiuno euros?</strong>
            <p>
              Veintiún euros. Delante del sustantivo, «uno» se apocopa: un euro, veintiún euros,
              treinta y un euros. La forma plena aparece solo al decir el número suelto.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Y si la moneda es femenina?</strong>
            <p>
              Concuerda con ella: veintiuna libras, doscientas una libras. Cambia la moneda en el
              selector y verás la diferencia sin tocar la cifra.
            </p>
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> «Millón» es masculino siempre: doscientos un millones de libras, no doscientas una.
            </p>
            {/* DLE, s. v. «lempira» y «córdoba»: «m. Unidad monetaria de…» (hallazgo 1537) */}
            <p className={styles.faqTip}>
              <span aria-hidden="true">💡</span> Que acabe en -a no la hace femenina: el lempira y el
              córdoba son masculinos según el diccionario académico. Un lempira, doscientos córdobas.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Cuándo se escribe cien y cuándo ciento?</strong>
            <p>
              Cien cuando son 100 exactos o cuando multiplica (cien mil, cien millones); ciento cuando
              le sigue un número menor (ciento uno, ciento cincuenta).
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Por qué mil millones y no un billón?</strong>
            <p>
              Porque el español usa la escala larga: un billón son 10¹², un millón de millones. El
              «billion» inglés equivale a nuestros mil millones, y confundirlos multiplica la cifra
              por mil.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿Las mayúsculas llevan tilde?</strong>
            <p>
              Sí: VEINTIÚN EUROS, DIECISÉIS. Lo contrario es una costumbre heredada de las máquinas de
              escribir, no una norma.
            </p>
          </li>
          <li className={styles.faqItem}>
            <strong>¿3,45 es «tres coma cuarenta y cinco»?</strong>
            <p>
              Suelto no: las cifras tras la coma se leen una a una, «tres coma cuatro cinco». Como
              dinero sí forman número: «tres euros con cuarenta y cinco céntimos».
            </p>
          </li>
        </ul>

        <h2>
          <span aria-hidden="true">📝</span> Cómo escribir un importe paso a paso
        </h2>

        <div className={styles.stepGuide}>
          <div className={styles.step}>
            <div className={styles.stepNumber}>1</div>
            <div className={styles.stepContent}>
              <h3>Separa la parte entera de los decimales</h3>
              <p>3.847,50 son 3.847 unidades y 50 céntimos. Se escriben con reglas distintas.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>2</div>
            <div className={styles.stepContent}>
              <h3>Escribe la parte entera concordando con la moneda</h3>
              <p>Si la moneda es femenina, el numeral cambia: veintiuna libras, no veintiún libras.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>3</div>
            <div className={styles.stepContent}>
              <h3>Apocopa el «uno» final</h3>
              <p>Va pegado al sustantivo: treinta y un euros, doscientos un euros.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>4</div>
            <div className={styles.stepContent}>
              <h3>Añade los decimales en el formato que pida el documento</h3>
              <p>«con cincuenta céntimos» en España; «con 50/100» en buena parte de Latinoamérica.</p>
            </div>
          </div>
          <div className={styles.step}>
            <div className={styles.stepNumber}>5</div>
            <div className={styles.stepContent}>
              <h3>Comprueba que coincide con la cifra</h3>
              <p>
                Es el paso que de verdad importa: ante discrepancia, manda lo escrito en letras.
              </p>
            </div>
          </div>
        </div>

        <h2>
          <span aria-hidden="true">💡</span> Buenas prácticas
        </h2>

        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              🔒
            </span>
            <p>
              En documentos con valor económico, rellena la línea sobrante hasta el final para que
              nadie pueda añadir palabras después del importe.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              🖋️
            </span>
            <p>
              Escribe la moneda completa («euros», no «€») en la línea en letras: el símbolo se
              modifica con un trazo, la palabra no.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              🌎
            </span>
            <p>
              Antes de rellenar una factura, mira qué formato de centavos usa el país de destino: la
              fracción 00/100 es habitual en América y rara en España.
            </p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcon} aria-hidden="true">
              ✅
            </span>
            <p>
              Lee el resultado en voz alta. Casi todos los errores de concordancia se oyen antes de
              verse.
            </p>
          </div>
        </div>

        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">
              ⚠️
            </span>
            <h3>Errores habituales</h3>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>«Ciento mil»</strong> — es cien mil. «Ciento» solo va delante de un número
              menor que cien.
            </li>
            <li>
              <strong>«Un mil euros»</strong> — mil no lleva numeral cuando vale uno: mil euros.
            </li>
            <li>
              <strong>«Veintiuno euros»</strong> — falta la apócope: veintiún euros.
            </li>
            <li>
              <strong>Traducir «billion» por billón</strong> — son mil millones; el error multiplica
              la cifra por mil.
            </li>
            <li>
              <strong>Quitar las tildes al pasar a mayúsculas</strong> — VEINTIÚN conserva la suya.
            </li>
            <li>
              <strong>Escribir los céntimos como número ordinal</strong> — son «cincuenta céntimos»,
              no «quincuagésimo».
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('conversor-numeros-letras')} />

      <ShareCard appName="conversor-numeros-letras" />

      <Footer appName="conversor-numeros-letras" />
    </div>
  );
}
