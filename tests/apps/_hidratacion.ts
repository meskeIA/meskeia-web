import { ElementHandle, Locator, Page } from '@playwright/test';

/**
 * Esperar a que una app esté HIDRATADA antes de interactuar con ella, y sembrar valores
 * comprobando que el ESTADO DE REACT los recogió.
 *
 * ── El problema, medido el 12/09/2026 ────────────────────────────────────────
 * `page.goto()` espera al evento `load`, que garantiza que los chunks se han DESCARGADO,
 * no que React los haya ejecutado. Y esperar a un encabezado tampoco sirve: el <h1> viaja
 * en el HTML servido, así que está en pantalla mucho antes de que la página responda a
 * nada. Entre esos dos instantes hay una ventana —32 ms en un simulador ligero, más en
 * cuanto la máquina va cargada— en la que el test ya puede escribir en un input y la app
 * todavía no se entera.
 *
 * Lo que ocurre entonces no es un simple «no pasó nada», y por eso cuesta tanto verlo:
 *
 *   · El DOM SÍ cambia (el deslizador se mueve, el campo muestra el texto), de modo que
 *     una comprobación sobre el propio input pasa en verde. Lo que no cambia es el estado
 *     de React, así que todo lo que se derive de él —una etiqueta, un `aria-label`, un
 *     resultado calculado— sigue mostrando el valor anterior. La página queda descuadrada
 *     consigo misma y el test mide otra cosa distinta de la que cree.
 *   · Si además el valor se sembró con el setter nativo, el intento perdido deja el
 *     rastreador de valor de React apuntando a un valor que nunca llegó a aplicarse.
 *     A partir de ahí React DESCARTA por duplicado cualquier evento con ese mismo valor,
 *     así que reintentar no lo arregla nunca: solo lo desatasca un valor distinto.
 *
 * Los dos casos que lo destaparon:
 *   · `simulador-vsepr` — determinista: pedir X=2,E=2 devolvía AX₄E₂ porque el primer
 *     movimiento de cada test se perdía siempre.
 *   · `visualizador-sonido-ondas` — intermitente (1 de cada 3 corridas): tras `fill('880')`
 *     el botón «Escuchar tono a 880 hercios» no llegaba a existir. Reproducido a voluntad
 *     estrangulando la CPU con `Emulation.setCPUThrottlingRate`.
 *
 * ── Cómo se sondea la hidratación ────────────────────────────────────────────
 * Por el rastreador de valor que React instala en cada input controlado al montarlo. Es un
 * interno de React, sí, pero es exactamente la precondición que necesita el test: si no
 * está, el evento no va a llegar. Y si React lo cambiase algún día, esto fallaría con un
 * mensaje legible en vez de dejar pasar tests que miden la molécula equivocada.
 *
 * ── Por qué NO basta con mirar el input (12/09/2026) ─────────────────────────
 * Comprobar `el.value` tras sembrar no prueba nada: el DOM es justo lo que sí cambia cuando
 * el evento se pierde. Y el rastreador tampoco sirve como testigo, porque en el caso
 * envenenado apunta al valor que se pidió MIENTRAS el estado sigue en el viejo — daría
 * verde precisamente en el fallo que buscamos.
 *
 * El único testigo fiable es el valor con el que React ha RENDERIZADO el input, que vive en
 * el objeto de props que React cuelga del propio nodo (`__reactProps$<clave>`). Para un
 * input controlado eso ES el estado después de re-renderizar. Medido en React 19.2 sobre
 * `simulador-vsepr`: al sembrar 2 en un deslizador que estaba en 4, `props.value` pasa de
 * «4» a «2»; al sembrar 99 en uno con máximo 6, el DOM capa a 6 y React ve 6.
 *
 * ⚠️ El DOM y React DIVERGEN de forma legítima cuando el `step` del deslizador no admite el
 * valor del estado: en `simulador-distribucion-normal`, con a = −1 y step 0,01 sobre un
 * rango recentrado, el input muestra «−0.99» mientras el estado de React vale «−1». Otra
 * razón para preguntarle a React y no al input.
 *
 * ── Lo que NINGÚN testigo puede detectar ─────────────────────────────────────
 * Sembrar el valor que el input YA tiene. El estado de React coincide desde el principio, de
 * modo que la comprobación pasa aunque el evento se haya perdido y la app esté sorda. Un
 * caso de prueba que dependa de haber MOVIDO algo tiene que partir de otro estado; en
 * `simulador-vsepr` había dos que pedían la configuración inicial y daban verde sin tocar
 * nada, y en `simulador-distribucion-normal` un segundo intento de σ negativa que el DOM ya
 * dejaba en el mínimo del intento anterior.
 */

/** Margen para que React monte. Generoso: cubre una máquina cargada o la CPU estrangulada. */
const ESPERA_HIDRATACION_MS = 15000;

/** Margen para que React re-renderice tras un evento. Basta con holgura sobre el `expect` (5 s). */
const ESPERA_ESTADO_MS = 10000;

/** Un input, por selector CSS o por localizador (para los que no tienen id y van por `nth`). */
export type Entrada = string | Locator;

type Nodo = ElementHandle<HTMLInputElement>;

/** Resuelve la entrada a un nodo concreto, esperando a que exista. */
async function resolver(page: Page, entrada: Entrada): Promise<Nodo> {
  if (typeof entrada === 'string') {
    const nodo = await page.waitForSelector(entrada, { timeout: ESPERA_HIDRATACION_MS });
    return nodo as Nodo;
  }
  const nodo = await entrada.elementHandle({ timeout: ESPERA_HIDRATACION_MS });
  if (!nodo) throw new Error(`El localizador no resolvió a ningún elemento.`);
  return nodo as Nodo;
}

const comoTexto = (entrada: Entrada): string =>
  typeof entrada === 'string' ? entrada : String(entrada);

interface Diagnostico {
  hidratado: boolean;
  valorDom: string;
  valorReact: string | null;
  valorRastreador: string | null;
}

/** Foto del input en sus tres capas. Solo se usa para redactar el mensaje de un fallo. */
async function diagnosticar(page: Page, nodo: Nodo): Promise<Diagnostico> {
  return page.evaluate((el) => {
    const bruto = el as unknown as Record<string, unknown>;
    const rastreador = bruto._valueTracker as { getValue(): string } | undefined;
    const clave = Object.keys(bruto).find((k) => k.startsWith('__reactProps$'));
    const props = clave ? (bruto[clave] as Record<string, unknown> | null) : null;
    return {
      hidratado: Boolean(rastreador),
      valorDom: el.value,
      valorReact: props && 'value' in props ? String(props.value) : null,
      valorRastreador: rastreador ? rastreador.getValue() : null,
    };
  }, nodo);
}

/**
 * Espera a que React haya montado los inputs indicados. Llamar en el `beforeEach`, después
 * del `goto` y antes de tocar nada — incluidos los botones: un clic anterior a la hidratación
 * también se pierde, y basta con un input de la misma página como testigo.
 *
 * @param page       La página, ya cargada.
 * @param selectores Los inputs cuya interactividad va a necesitar el test.
 */
export async function esperarHidratacion(
  page: Page,
  selectores: readonly string[],
): Promise<void> {
  try {
    await page.waitForFunction(
      (sels) =>
        sels.every((sel) =>
          Boolean(
            (document.querySelector(sel) as unknown as Record<string, unknown> | null)
              ?._valueTracker,
          ),
        ),
      selectores as string[],
      { timeout: ESPERA_HIDRATACION_MS },
    );
  } catch {
    const partes: string[] = [];
    for (const sel of selectores) {
      let estado: string;
      if ((await page.locator(sel).count()) === 0) {
        estado = 'NO existe en el DOM';
      } else {
        const d = await diagnosticar(page, await resolver(page, sel));
        estado = d.hidratado
          ? 'hidratado'
          : 'presente pero SIN hidratar (React no ha montado su rastreador de valor)';
      }
      partes.push(`  ${sel} → ${estado}`);
    }
    throw new Error(
      `La app no se hidrató en ${ESPERA_HIDRATACION_MS} ms; interactuar ahora perdería el evento:\n${partes.join('\n')}`,
    );
  }
}

/** El valor con el que React ha renderizado el input, o null si no lo controla. */
async function valorEnReact(page: Page, nodo: Nodo): Promise<string | null> {
  return page.evaluate((el) => {
    const bruto = el as unknown as Record<string, unknown>;
    const clave = Object.keys(bruto).find((k) => k.startsWith('__reactProps$'));
    if (!clave) return null;
    const props = bruto[clave] as Record<string, unknown> | null;
    return props && 'value' in props ? String(props.value) : null;
  }, nodo);
}

/**
 * Espera a que el ESTADO de React para un input valga `esperado`. Es la comprobación que hace
 * `sembrarValor` por dentro, expuesta para las entradas que NO usan el setter nativo:
 * `fill()` escribe a través del navegador (por eso sí llega a React), pero tampoco llega si la
 * app aún no ha hidratado, y sin este testigo el test seguiría adelante midiendo lo anterior.
 */
export async function esperarValorEnReact(
  page: Page,
  entrada: Entrada,
  esperado: number | string,
): Promise<void> {
  const nodo = await resolver(page, entrada);
  await esperarValorEnNodo(page, nodo, String(esperado), comoTexto(entrada));
}

async function esperarValorEnNodo(
  page: Page,
  nodo: Nodo,
  esperado: string,
  rotulo: string,
): Promise<void> {
  try {
    await page.waitForFunction(
      ({ el, v }) => {
        const bruto = el as unknown as Record<string, unknown>;
        const clave = Object.keys(bruto).find((k) => k.startsWith('__reactProps$'));
        if (!clave) return false;
        const props = bruto[clave] as Record<string, unknown> | null;
        if (!props || !('value' in props)) return false;
        return String(props.value) === v;
      },
      { el: nodo, v: esperado },
      { timeout: ESPERA_ESTADO_MS },
    );
  } catch {
    const d = await diagnosticar(page, nodo);
    if (d.valorReact === null) {
      throw new Error(
        `«${rotulo}»: React no renderiza este input como controlado (no hay «value» en sus ` +
          `props), así que su estado no se puede comprobar. Si es intencionado, muévelo con ` +
          `fill()/click() sin pasar por este helper.`,
      );
    }
    throw new Error(
      `El estado de React para «${rotulo}» no llegó a «${esperado}».\n` +
        `  React: ${d.valorReact}\n  DOM:   ${d.valorDom}\n  rastreador: ${d.valorRastreador}\n` +
        (d.valorDom === esperado
          ? '  → el DOM sí cambió y React no: el evento se perdió, o React lo descartó por duplicado.'
          : '  → el valor no llegó ni al DOM, o la app lo capó a otro (usa la opción «esperado»).'),
    );
  }
}

/**
 * Un input concreto ya hidratado. Sin rastreador no hay manejador enganchado: el evento se
 * perdería y además envenenaría el rastreador, de modo que reintentar con el mismo valor ya no
 * lo arreglaría nunca.
 */
async function esperarHidratacionDeNodo(page: Page, nodo: Nodo, rotulo: string): Promise<void> {
  try {
    await page.waitForFunction(
      (el) => Boolean((el as unknown as Record<string, unknown>)._valueTracker),
      nodo,
      { timeout: ESPERA_HIDRATACION_MS },
    );
  } catch {
    throw new Error(
      `«${rotulo}» sigue sin hidratar tras ${ESPERA_HIDRATACION_MS} ms: sembrar ahora ` +
        `movería el DOM sin que React se entere.`,
    );
  }
}

/**
 * Auditoría de siembras que no prueban nada. No va activada en las corridas normales porque
 * cuesta un viaje al navegador por siembra y porque no todo no-op es un defecto (un helper que
 * fija tres campos puede coincidir con el inicial en uno). Se enciende a propósito:
 *     SIEMBRA_ESTRICTA=1 npx playwright test tests/apps
 * y cada línea «SIEMBRA INÚTIL» hay que mirarla: si el caso depende de haber movido algo, tiene
 * que partir de otro estado.
 */
function avisarSiembraInutil(rotulo: string, previo: string): void {
  const dondeEstoy = (new Error().stack ?? '')
    .split('\n')
    .filter((l) => l.includes('.spec.ts'))
    .slice(0, 2)
    .map((l) => l.trim())
    .join(' ← ');
  console.warn(
    `SIEMBRA INÚTIL · «${rotulo}» ya valía ${previo} en el estado de React: ` +
      `sembrarlo no mueve nada y el test daría verde aunque el evento se perdiera. ${dondeEstoy}`,
  );
}

interface OpcionesSiembra {
  /**
   * Valor con el que debe quedarse el ESTADO de React, cuando no coincide con el pedido
   * porque la app o el propio `<input type="range">` capan el valor. Ej.: pedir 200 en un
   * deslizador con máximo 150 → `{ esperado: 150 }`.
   */
  esperado?: number | string;
}

/**
 * Mueve un input como lo haría un usuario y COMPRUEBA que el estado de React recogió el
 * valor. Espera antes a que ese input esté hidratado, así que es seguro llamarla nada más
 * cargar la página y también sobre un control que React acaba de montar.
 *
 * Un `<input type="range">` no admite `fill()` («Malformed value»), y arrastrarlo con el ratón
 * no da un valor exacto: de ahí el setter nativo más el evento `input`, que es el que React
 * escucha para su `onChange`.
 *
 * ⚠️ Sembrar el valor que el input YA tiene no prueba nada y esta función lo dará por bueno en
 * silencio, porque el estado de React ya coincide. Si el caso depende de que el valor haya
 * CAMBIADO, hay que partir de otro estado.
 */
export async function sembrarValor(
  page: Page,
  entrada: Entrada,
  valor: number | string,
  opciones: OpcionesSiembra = {},
): Promise<void> {
  const nodo = await resolver(page, entrada);
  const rotulo = comoTexto(entrada);
  await esperarHidratacionDeNodo(page, nodo, rotulo);

  if (process.env.SIEMBRA_ESTRICTA) {
    const previo = await valorEnReact(page, nodo);
    if (previo !== null && previo === String(opciones.esperado ?? valor)) {
      avisarSiembraInutil(rotulo, previo);
    }
  }

  await page.evaluate(
    ({ el, v }) => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )!.set!;
      setter.call(el, v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    },
    { el: nodo, v: String(valor) },
  );

  await esperarValorEnNodo(page, nodo, String(opciones.esperado ?? valor), rotulo);
}

/**
 * Como `sembrarValor`, pero para cuando NO se sabe de antemano dónde va a quedar el valor: un
 * `<input type="range">` capa lo que se le escribe a su [min, max] y lo ajusta a su paso, y hay
 * casos de prueba que consisten justo en observar ese recorte. Siembra, lee lo que el control ha
 * ACEPTADO y espera a que el estado de React valga eso mismo; devuelve el valor aceptado.
 *
 * Sigue detectando el evento perdido: si React no se entera, su estado se queda en el valor
 * viejo y no coincide con lo que el DOM acabó mostrando.
 */
export async function sembrarValorAcotado(
  page: Page,
  entrada: Entrada,
  valor: number | string,
): Promise<string> {
  const nodo = await resolver(page, entrada);
  const rotulo = comoTexto(entrada);
  await esperarHidratacionDeNodo(page, nodo, rotulo);

  const previo = process.env.SIEMBRA_ESTRICTA ? await valorEnReact(page, nodo) : null;

  const aceptado = await page.evaluate(
    ({ el, v }) => {
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value',
      )!.set!;
      setter.call(el, v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      return el.value;
    },
    { el: nodo, v: String(valor) },
  );

  if (previo !== null && previo === aceptado) avisarSiembraInutil(rotulo, previo);

  await esperarValorEnNodo(page, nodo, aceptado, rotulo);
  return aceptado;
}

/**
 * El valor que React tiene ahora mismo para un input. Útil para decidir en el propio test si
 * una siembra sería un no-op (y por tanto no probaría nada).
 */
export async function leerValorEnReact(page: Page, entrada: Entrada): Promise<string | null> {
  return valorEnReact(page, await resolver(page, entrada));
}
