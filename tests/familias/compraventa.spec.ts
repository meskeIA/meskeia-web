/**
 * TESTIGO DE FAMILIA — el clúster de compraventa (7 apps hermanas)
 *
 * Un solo fichero que prueba EL MISMO invariante en las siete a la vez, en vez de siete
 * specs que lo prueban cada uno por su cuenta.
 *
 * ── Por qué existe ───────────────────────────────────────────────────────────
 * Las 7 apps del clúster tienen la misma lógica escrita 7 veces. **63 de los 97 hallazgos
 * históricos del Inspector con lenguaje de propagación son de esta familia**: el defecto se
 * repara en una y sigue vivo en las otras seis, y nada lo delata porque cada spec solo mira
 * su app.
 *
 * El 21/09/2026 (`ae1358d6`) se reparó el trastero. El 22/09/2026 (`cfe091a7`) se propagó
 * a propósito «a las SIETE apps del clúster, y el aviso dice en qué dirección falta».
 *
 * **Y aun así quedaron tres huecos**, medidos hoy 23/09/2026 sobre el build posterior a esa
 * reparación:
 *
 *   A1 · `local-comercial` mete «impuestos y gastos de aquella compra» en la lista de
 *        «falta descontar» cuando su dirección es la CONTRARIA — es el defecto del trastero,
 *        reintroducido por la misma reparación que lo corregía. El comentario de sus líneas
 *        461-462 cita el hallazgo 1157 «visto en trastero» y mete el campo en la lista
 *        equivocada.
 *   A2 · `local-comercial` tiene un campo EXCLUSIVO, «Amortizaciones acumuladas deducidas»,
 *        sin guarda ninguna, que mueve el neto +4.200,00 € publicado como definitivo. Las
 *        otras seis hermanas no tienen ese campo: por eso la reparación en lote no lo vio.
 *   C1 · `estimador-compraventa-inmueble` tiene un octavo campo, «Valor catastral total»,
 *        cuyo ilegible es indistinguible del vacío y mueve el neto −84,64 € en silencio.
 *        Y el MISMO hueco en garaje, trastero y local-comercial (−20,83 €, −58,89 € y
 *        −243,00 €), que la medición del 23/09 no vio porque sus filas usaban un caso base
 *        en el que gana el método objetivo y el campo no puede mover nada: se destapó al
 *        reparar, el 23/09/2026, dándoles una base R en la que gana el real.
 *
 * Esa es la razón de ser de este fichero: **una reparación hecha a propósito en las siete no
 * basta; hace falta un testigo que las mida a la vez.**
 *
 * ── El invariante ────────────────────────────────────────────────────────────
 * `parseSpanishNumber` devuelve NaN POR DISEÑO ante `2.000.50` (el millar y el decimal a la
 * estadounidense, un copiar y pegar corriente). De ahí:
 *
 *   > Si un importe ILEGIBLE mueve alguna cifra publicada respecto del mismo importe
 *   > LEGIBLE, la app tiene que (a) NOMBRARLO y (b) decir EN QUÉ DIRECCIÓN falta.
 *   > Si no mueve nada, no hace falta aviso.
 *
 * Y la dirección **se calcula, no se razona**: cada caso ejecuta con el dato y sin el dato,
 * compara la cifra final y solo entonces exige el texto. Un aviso que dice «falta descontar»
 * cuando la cifra real es MAYOR es PEOR que no tener aviso —manda restar de una cifra que en
 * realidad va a subir—, y ese es exactamente el fallo vivo de `local-comercial` (A1).
 *
 * ── Cómo se amplía ───────────────────────────────────────────────────────────
 * Está dirigido por datos: toda la verdad vive en `HERMANAS`, y el bucle del final genera un
 * caso por fila. **Añadir la octava hermana el día de mañana es añadir una fila**, no
 * escribir un test. Lo mismo con un campo nuevo en una app que ya está.
 *
 * Los tres huecos abiertos —y los tres del placeholder del grupo B— van con `test.fail()`, que
 * se traga el motivo. Para leerlo:
 *     VER_HUECOS=1 npx playwright test tests/familias/compraventa.spec.ts
 * Esa corrida quita las marcas y enseña, en cada uno, el aviso que la app publica frente al
 * que la dirección MEDIDA exige. Reparar una de las siete = quitarle el `falla` a su fila.
 *
 * ── Trampas MEDIDAS, que este fichero ya esquiva ──────────────────────────────
 *  · La HIPOTECA PENDIENTE de `estimador-compraventa-inmueble` no se puede probar con
 *    reinversión TOTAL: la proporción satura en `Math.min(1, …)` y el delta es 0,00 €, así
 *    que el caso daría VERDE sin probar nada. Va sobre la BASE A' (reinversión parcial).
 *  · El VALOR CATASTRAL TOTAL no se puede probar con el método objetivo ganando (delta
 *    0,00 €). Va sobre la BASE C en el estimador y sobre la BASE R en garaje, trastero y
 *    local-comercial. Las filas `sin_efecto` de esas tres se quedan para dejarlo dicho: son
 *    las que las dieron por sanas en ese campo, y un verde sin delta no prueba nada.
 *  · Las AMORTIZACIONES de `local-comercial` solo existen con el perfil «Local afecto a
 *    actividad»: la preparación de esa app lo pulsa.
 *  · El `id` de los inputs lo genera React (`_R_…`): aquí se localiza SIEMPRE por
 *    `aria-label`, que es lo que `NumberInput` copia de su `label`.
 *  · Con `2.000.50` el blur NO reescribe el campo (`handleBlur` solo acota cuando
 *    `!isNaN`), y eso es parte del caso: el texto imposible se queda a la vista.
 *  · Las 3 apps del grupo B (nave, solar, terreno rústico) SOLO tienen pestaña de comprador
 *    y **ya están bien**: su guarda es equivalente pero está escrita inline, sin helper —
 *    `grep -c esLegible` da 0 y MIENTE. No se las marca como defectuosas. Su único hueco es
 *    el placeholder del precio, que es de MENSAJE y no de cifra, y va como caso aparte.
 *  · `getByRole('alert')` casa con el anunciador de rutas de Next: aquí no se usa; el aviso
 *    se lee en la descripción de la tarjeta que publica la cifra medida, que es donde tiene
 *    que estar.
 *
 * Las siembras van por `tests/apps/_hidratacion.ts` (candado `check:hidratacion`): escribir
 * con el setter nativo fuera de ese módulo rompe el build.
 */
import { test, expect, type Page, type Locator } from '@playwright/test';
import { esperarHidratacion, sembrarValor } from '../apps/_hidratacion';

/** El texto imposible canónico: millar y decimal a la estadounidense → NaN. */
const ILEGIBLE = '2.000.50';

/** Hacia dónde se mueve la CIFRA PUBLICADA cuando el importe se vuelve ilegible. */
type Direccion =
  /** Sube: la cifra en pantalla queda POR ENCIMA de la real → hay que descontar (TECHO). */
  | 'sube'
  /** Baja: la cifra en pantalla queda POR DEBAJO de la real → la real es MAYOR (SUELO). */
  | 'baja'
  /** No se mueve: no hace falta aviso. */
  | 'sin_efecto'
  /** La app se abstiene por completo y no publica nada: tampoco hace falta aviso. */
  | 'apaga';

type Panel = 'comprador' | 'vendedor';

interface CampoVigilado {
  /** `aria-label` exacto del input (lo copia `NumberInput` de su `label`). */
  etiqueta: string;
  /** Pestaña en la que vive el campo y en la que se publica la cifra medida. */
  panel: Panel;
  /** Valor LEGIBLE con el que se mide la cifra de referencia. */
  legible: string;
  /** Texto imposible, si el canónico no encaja con la forma del campo. */
  ilegible?: string;
  /** Dirección MEDIDA el 23/09/2026 sobre el build posterior a `cfe091a7`. */
  direccion: Direccion;
  /** Euros que se mueve la cifra publicada (con signo). */
  delta: number;
  /** Lo que el aviso tiene que decir para NOMBRAR el campo. */
  nombra?: RegExp;
  /** Base alternativa, cuando la del caso general no puede mover este campo. */
  base?: string;
  /** Motivo del `test.fail()`, cuando el hueco sigue abierto. */
  falla?: string;
}

interface Hermana {
  slug: string;
  /** El caso base, escrito para que se pueda reproducir a mano en el navegador. */
  casoBase: string;
  /** ¿Tiene pestañas comprador/vendedor? Las 3 del grupo B, no. */
  pestanas: boolean;
  /** Título de la tarjeta que publica la cifra final de cada panel. */
  cifraComprador: RegExp;
  cifraVendedor?: RegExp;
  /** Deja la app en el caso base indicado, con todos los campos LEGIBLES. */
  preparar: (page: Page, base: string) => Promise<void>;
  campos: CampoVigilado[];
  /**
   * Grupo B: el precio ilegible apaga el panel entero y el placeholder dice «Introduce el
   * precio…» mientras el `2.000.50` sigue escrito a la vista. Fallo de MENSAJE, no de cifra.
   */
  mensajePrecioIlegible?: { etiqueta: string; hueco: string };
}

/**
 * Un `test.fail()` se traga el motivo: la corrida dice «pasó» y no enseña QUÉ falló, que es
 * justo lo que necesita quien va a reparar. Con
 *     VER_HUECOS=1 npx playwright test tests/familias/compraventa.spec.ts
 * los casos marcados dejan de estar marcados y la salida imprime el aviso que la app publicó
 * frente al que la dirección medida exige. En la corrida normal no cambia nada.
 */
const VER_HUECOS = Boolean(process.env.VER_HUECOS);

const sel = (etiqueta: string): string => `input[aria-label="${etiqueta}"]`;

const sembrar = (page: Page, etiqueta: string, valor: string): Promise<void> =>
  sembrarValor(page, sel(etiqueta), valor);

/** Pestañas: garaje las marca con `role="tab"`; las demás, con botones y `aria-pressed`. */
async function irAPestana(page: Page, cual: Panel): Promise<void> {
  const rotulo = cual === 'comprador' ? 'Comprador' : 'Vendedor';
  const comoTab = page.getByRole('tab', { name: rotulo, exact: true });
  if ((await comoTab.count()) > 0) {
    await comoTab.click();
    return;
  }
  await page.getByRole('button', { name: rotulo, exact: true }).click();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  LA TABLA — las 7 hermanas, su caso base y cada campo de dinero con su dirección
//  MEDIDA y su delta en euros. Todo lo que el bucle del final necesita está aquí.
// ═══════════════════════════════════════════════════════════════════════════════

const HERMANAS: readonly Hermana[] = [
  // ── GRUPO A · las tres con pestaña de vendedor y la guarda por helper `esLegible` ──
  {
    slug: 'simulador-gastos-compraventa-garaje',
    casoBase:
      'COMPRADOR: precio 25.000 · Madrid · segunda mano · perfil General · gestoría 300. ' +
      'VENDEDOR: compra original 18.000 · gastos de aquella compra 1.800 · 8 años · ' +
      'catastral suelo 5.000 · catastral total 12.000 · comisión 3 % · gestoría 500. ' +
      'Publica COSTE TOTAL 27.252,05 € y NETO 22.898,25 €. · ' +
      'BASE R = base + compra original 24.000 (gana el método real de la plusvalía, NETO 23.645,83).',
    pestanas: true,
    cifraComprador: /^COSTE TOTAL/,
    cifraVendedor: /^IMPORTE NETO VENDEDOR$/,
    preparar: async (page, base) => {
      await sembrar(page, 'Precio del garaje / plaza de parking', '25000');
      await sembrar(page, 'Gastos de gestoría del comprador (€)', '300');
      await irAPestana(page, 'vendedor');
      await sembrar(page, 'Precio de compra original del garaje', base === 'R' ? '24000' : '18000');
      await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '1800');
      await sembrar(page, 'Años de propiedad', '8');
      await sembrar(page, 'Valor catastral del suelo (€)', '5000');
      await sembrar(page, 'Valor catastral total (suelo + construcción) (€)', '12000');
      await sembrar(page, 'Comisión inmobiliaria del vendedor (%)', '3');
      await sembrar(page, 'Gestoría y certificados del vendedor (€)', '500');
    },
    campos: [
      {
        etiqueta: 'Precio del garaje / plaza de parking',
        panel: 'comprador',
        legible: '25000',
        direccion: 'apaga',
        delta: 0,
      },
      {
        etiqueta: 'Gastos de gestoría del comprador (€)',
        panel: 'comprador',
        legible: '300',
        direccion: 'baja',
        delta: -300,
        nombra: /gestoría/i,
      },
      {
        etiqueta: 'Precio de compra original del garaje',
        panel: 'vendedor',
        legible: '18000',
        direccion: 'sube',
        delta: 851.75,
        nombra: /precio de compra original/i,
      },
      {
        // El GEMELO del defecto del trastero, aquí YA REPARADO por `cfe091a7`: dice «el neto
        // real es MAYOR», no «falta descontar». Esta es la redacción correcta.
        etiqueta: 'Impuestos y gastos que pagaste al comprarlo (€)',
        panel: 'vendedor',
        legible: '1800',
        direccion: 'baja',
        delta: -342,
        nombra: /impuestos y gastos de aquella compra/i,
      },
      {
        // No es campo de dinero, pero mueve el neto: entra por eso.
        etiqueta: 'Años de propiedad',
        panel: 'vendedor',
        legible: '8',
        ilegible: '1.0.5',
        direccion: 'sube',
        delta: 101.25,
        nombra: /años de (?:propiedad|tenencia)/i,
      },
      {
        etiqueta: 'Valor catastral del suelo (€)',
        panel: 'vendedor',
        legible: '5000',
        direccion: 'sube',
        delta: 101.25,
        nombra: /valor catastral del suelo/i,
      },
      {
        // TRAMPA: con este caso base el método objetivo ya gana, así que el ilegible no mueve
        // nada. Se queda en la tabla justamente para dejarlo dicho: sin delta no hace falta
        // aviso, y quien lo pruebe aquí no está probando nada. ⚠️ Y NO significa que el campo
        // esté protegido: con la base R de la fila siguiente sí mueve, y esta fila es la que dio
        // la app por sana en la medición del 23/09.
        etiqueta: 'Valor catastral total (suelo + construcción) (€)',
        panel: 'vendedor',
        legible: '12000',
        direccion: 'sin_efecto',
        delta: 0,
      },
      {
        // EL CASO QUE LA FILA DE ARRIBA NO PUEDE PROBAR, y por el que esa fila daba a esta
        // app por sana. Con la BASE R (compra original 24.000) el incremento real es
        // pequeño, el método real gana y el ilegible SÍ mueve el neto: −20,83 € en
        // silencio, medido el 23/09/2026. Es el hueco C1 del estimador, idéntico aquí.
        etiqueta: 'Valor catastral total (suelo + construcción) (€)',
        panel: 'vendedor',
        legible: '12000',
        ilegible: '12.000.00',
        base: 'R',
        direccion: 'baja',
        delta: -20.83,
        nombra: /valor catastral total/i,
        falla:
          'HUECO C1 EN LA HERMANA — «Valor catastral total» se lee con `parseSpanishNumber` a ' +
          'pelo: el ilegible entra como `undefined`, indistinguible del VACÍO, y la plusvalía se ' +
          'liquida por el método objetivo aunque el real sea más barato. El neto baja en silencio ' +
          'y la tarjeta de la plusvalía dice «falta el valor catastral total para comparar», que ' +
          'es falso: el usuario lo escribió. La fila `sin_efecto` de arriba no lo veía porque en ' +
          'el caso base gana el objetivo, y por eso la medición del 23/09 dio esta app por sana ' +
          'en este campo. Para ponerlo en verde: su `esLegible` y el campo en la lista de ' +
          'dirección contraria («el neto real es MAYOR»).',
      },
      {
        etiqueta: 'Comisión inmobiliaria del vendedor (%)',
        panel: 'vendedor',
        legible: '3',
        ilegible: '3.5.0',
        direccion: 'sube',
        delta: 607.5,
        nombra: /comisión inmobiliaria/i,
      },
      {
        etiqueta: 'Gestoría y certificados del vendedor (€)',
        panel: 'vendedor',
        legible: '500',
        direccion: 'sube',
        delta: 405,
        nombra: /gestoría/i,
      },
    ],
  },
  {
    slug: 'simulador-gastos-compraventa-trastero',
    casoBase:
      'COMPRADOR: precio 15.000 · Madrid · segunda mano · perfil General · gestoría 300. ' +
      'VENDEDOR: compra original 10.000 · gastos de aquella compra 1.000 · 5 años · ' +
      'catastral suelo 4.000 · catastral total 9.000 · comisión 3 % · gestoría 500. ' +
      'Publica COSTE TOTAL 16.535,58 € y NETO 13.332,80 €. · ' +
      'BASE R = base + compra original 14.000 (gana el método real de la plusvalía, NETO 13.938,89).',
    pestanas: true,
    cifraComprador: /^COSTE TOTAL/,
    cifraVendedor: /^IMPORTE NETO VENDEDOR$/,
    preparar: async (page, base) => {
      await sembrar(page, 'Precio del trastero', '15000');
      await sembrar(page, 'Gastos de gestoría del comprador (€)', '300');
      await irAPestana(page, 'vendedor');
      await sembrar(page, 'Precio de compra original', base === 'R' ? '14000' : '10000');
      await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo', '1000');
      await sembrar(page, 'Años de propiedad', '5');
      await sembrar(page, 'Valor catastral del suelo', '4000');
      await sembrar(page, 'Valor catastral total (suelo + construcción)', '9000');
      await sembrar(page, 'Comisión inmobiliaria (%)', '3');
      await sembrar(page, 'Gestoría y certificados del vendedor (€)', '500');
    },
    campos: [
      {
        etiqueta: 'Precio del trastero',
        panel: 'comprador',
        legible: '15000',
        direccion: 'apaga',
        delta: 0,
      },
      {
        etiqueta: 'Gastos de gestoría del comprador (€)',
        panel: 'comprador',
        legible: '300',
        direccion: 'baja',
        delta: -300,
        nombra: /gestoría/i,
      },
      {
        etiqueta: 'Precio de compra original',
        panel: 'vendedor',
        legible: '10000',
        direccion: 'sube',
        delta: 717.2,
        nombra: /precio de compra original/i,
      },
      {
        // EL DEFECTO DE AYER (hallazgo 1157), reparado por `cfe091a7`. Este caso es el que
        // sujeta esa reparación: si alguien vuelve a meterlo en «falta descontar», salta.
        etiqueta: 'Impuestos y gastos que pagaste al comprarlo',
        panel: 'vendedor',
        legible: '1000',
        direccion: 'baja',
        delta: -190,
        nombra: /impuestos y gastos de aquella compra/i,
      },
      {
        etiqueta: 'Años de propiedad',
        panel: 'vendedor',
        legible: '5',
        ilegible: '1.0.5',
        direccion: 'sube',
        delta: 137.7,
        nombra: /años de (?:propiedad|tenencia)/i,
      },
      {
        etiqueta: 'Valor catastral del suelo',
        panel: 'vendedor',
        legible: '4000',
        direccion: 'sube',
        delta: 137.7,
        nombra: /valor catastral del suelo/i,
      },
      {
        etiqueta: 'Valor catastral total (suelo + construcción)',
        panel: 'vendedor',
        legible: '9000',
        direccion: 'sin_efecto',
        delta: 0,
      },
      {
        // EL CASO QUE LA FILA DE ARRIBA NO PUEDE PROBAR, y por el que esa fila daba a esta
        // app por sana. Con la BASE R (compra original 14.000) el incremento real es
        // pequeño, el método real gana y el ilegible SÍ mueve el neto: −58,89 € en
        // silencio, medido el 23/09/2026. Es el hueco C1 del estimador, idéntico aquí.
        etiqueta: 'Valor catastral total (suelo + construcción)',
        panel: 'vendedor',
        legible: '9000',
        ilegible: '9.000.00',
        base: 'R',
        direccion: 'baja',
        delta: -58.89,
        nombra: /valor catastral total/i,
        falla:
          'HUECO C1 EN LA HERMANA — «Valor catastral total» se lee con `parseSpanishNumber` a ' +
          'pelo: el ilegible entra como `undefined`, indistinguible del VACÍO, y la plusvalía se ' +
          'liquida por el método objetivo aunque el real sea más barato. El neto baja en silencio ' +
          'y la tarjeta de la plusvalía dice «falta el valor catastral total para comparar», que ' +
          'es falso: el usuario lo escribió. La fila `sin_efecto` de arriba no lo veía porque en ' +
          'el caso base gana el objetivo, y por eso la medición del 23/09 dio esta app por sana ' +
          'en este campo. Para ponerlo en verde: su `esLegible` y el campo en la lista de ' +
          'dirección contraria («el neto real es MAYOR»).',
      },
      {
        etiqueta: 'Comisión inmobiliaria (%)',
        panel: 'vendedor',
        legible: '3',
        ilegible: '3.5.0',
        direccion: 'sube',
        delta: 364.5,
        nombra: /comisión inmobiliaria/i,
      },
      {
        etiqueta: 'Gestoría y certificados del vendedor (€)',
        panel: 'vendedor',
        legible: '500',
        direccion: 'sube',
        delta: 405,
        nombra: /gestoría/i,
      },
    ],
  },
  {
    slug: 'simulador-gastos-compraventa-local-comercial',
    casoBase:
      'COMPRADOR: precio 200.000 · Madrid · segunda mano · gestoría 500. ' +
      'VENDEDOR con perfil «Local afecto a actividad» (OBLIGATORIO para que exista el campo ' +
      'de amortizaciones): compra original 150.000 · gastos de aquella compra 15.000 · ' +
      'amortizaciones 20.000 · 10 años · catastral suelo 40.000 · catastral total 100.000 · ' +
      'comisión 3 % · gestoría 500. Publica COSTE TOTAL 213.495,20 € y NETO 182.803,00 €. · ' +
      'BASE R = base + compra original 195.000 (gana el método real de la plusvalía, NETO 192.430,00).',
    pestanas: true,
    cifraComprador: /^COSTE TOTAL/,
    cifraVendedor: /^NETO QUE RECIBES/,
    preparar: async (page, base) => {
      await sembrar(page, 'Precio del local comercial', '200000');
      await sembrar(page, 'Gastos de gestoría del comprador (€)', '500');
      await irAPestana(page, 'vendedor');
      await page.getByRole('button', { name: /Local afecto a actividad/ }).click();
      await sembrar(page, 'Precio de compra original', base === 'R' ? '195000' : '150000');
      await sembrar(page, 'Impuestos y gastos que pagaste al comprarlo (€)', '15000');
      await sembrar(page, 'Amortizaciones acumuladas deducidas (€)', '20000');
      await sembrar(page, 'Años de propiedad', '10');
      await sembrar(page, 'Valor catastral del suelo (€)', '40000');
      await sembrar(page, 'Valor catastral total (suelo + construcción) (€)', '100000');
      await sembrar(page, 'Comisión de la inmobiliaria (%)', '3');
      await sembrar(page, 'Gestoría y certificados del vendedor (€)', '500');
    },
    campos: [
      {
        etiqueta: 'Precio del local comercial',
        panel: 'comprador',
        legible: '200000',
        direccion: 'apaga',
        delta: 0,
      },
      {
        etiqueta: 'Gastos de gestoría del comprador (€)',
        panel: 'comprador',
        legible: '500',
        direccion: 'baja',
        delta: -500,
        nombra: /gestoría/i,
      },
      {
        etiqueta: 'Precio de compra original',
        panel: 'vendedor',
        legible: '150000',
        direccion: 'sube',
        delta: 10697,
        nombra: /precio de compra original/i,
      },
      {
        etiqueta: 'Impuestos y gastos que pagaste al comprarlo (€)',
        panel: 'vendedor',
        legible: '15000',
        direccion: 'baja',
        delta: -3404,
        nombra: /impuestos y gastos de aquella compra/i,
      },
      {
        etiqueta: 'Amortizaciones acumuladas deducidas (€)',
        panel: 'vendedor',
        legible: '20000',
        direccion: 'sube',
        delta: 4200,
        nombra: /amortizaciones/i,
        falla:
          'HUECO A2 — se lee con `parseSpanishNumberOr` A PELO: ni `esLegible` ni bandera en ' +
          '`ResultadosVendedor`. El ilegible vale 0, sube el neto +4.200,00 € y baja el IRPF ' +
          '−4.200,00 €, y la tarjeta se publica como DEFINITIVA («NETO QUE RECIBES», sin ' +
          '«(PARCIAL)») y sin una palabra. Es un campo EXCLUSIVO de esta app —solo existe con ' +
          'el perfil «Local afecto a actividad»—, y por eso la reparación en lote del 22/09 no ' +
          'lo vio: las otras seis hermanas no lo tienen. Para ponerlo en verde: bandera ' +
          '`amortizacionesLegible` y el campo en la lista de «falta descontar», que aquí SÍ es ' +
          'la dirección correcta.',
      },
      {
        etiqueta: 'Años de propiedad',
        panel: 'vendedor',
        legible: '10',
        ilegible: '1.0.5',
        direccion: 'sube',
        delta: 632,
        nombra: /años de (?:propiedad|tenencia)/i,
      },
      {
        etiqueta: 'Valor catastral del suelo (€)',
        panel: 'vendedor',
        legible: '40000',
        direccion: 'sube',
        delta: 632,
        nombra: /valor catastral del suelo/i,
      },
      {
        etiqueta: 'Valor catastral total (suelo + construcción) (€)',
        panel: 'vendedor',
        legible: '100000',
        direccion: 'sin_efecto',
        delta: 0,
      },
      {
        // EL CASO QUE LA FILA DE ARRIBA NO PUEDE PROBAR, y por el que esa fila daba a esta
        // app por sana. Con la BASE R (compra original 195.000) el incremento real es
        // pequeño, el método real gana y el ilegible SÍ mueve el neto: −243,00 € en
        // silencio, medido el 23/09/2026. Es el hueco C1 del estimador, idéntico aquí.
        etiqueta: 'Valor catastral total (suelo + construcción) (€)',
        panel: 'vendedor',
        legible: '100000',
        ilegible: '100.000.00',
        base: 'R',
        direccion: 'baja',
        delta: -243,
        nombra: /valor catastral total/i,
        falla:
          'HUECO C1 EN LA HERMANA — «Valor catastral total» se lee con `parseSpanishNumber` a ' +
          'pelo: el ilegible entra como `undefined`, indistinguible del VACÍO, y la plusvalía se ' +
          'liquida por el método objetivo aunque el real sea más barato. El neto baja en silencio ' +
          'y la tarjeta de la plusvalía dice «falta el valor catastral total para comparar», que ' +
          'es falso: el usuario lo escribió. La fila `sin_efecto` de arriba no lo veía porque en ' +
          'el caso base gana el objetivo, y por eso la medición del 23/09 dio esta app por sana ' +
          'en este campo. Para ponerlo en verde: su `esLegible` y el campo en la lista de ' +
          'dirección contraria («el neto real es MAYOR»).',
      },
      {
        etiqueta: 'Comisión de la inmobiliaria (%)',
        panel: 'vendedor',
        legible: '3',
        ilegible: '3.5.0',
        direccion: 'sube',
        delta: 4666,
        nombra: /comisión inmobiliaria/i,
      },
      {
        etiqueta: 'Gestoría y certificados del vendedor (€)',
        panel: 'vendedor',
        legible: '500',
        direccion: 'sube',
        delta: 395,
        nombra: /gestoría/i,
      },
    ],
  },

  // ── GRUPO B · las tres que SOLO sirven al comprador (2 inputs) y YA ESTÁN BIEN ──
  //    Su guarda es equivalente a `esLegible` pero está escrita INLINE, sin helper: por eso
  //    `grep -c esLegible` da 0 en las tres y el censo por grep miente. No son defectuosas.
  {
    slug: 'simulador-gastos-compraventa-nave-industrial',
    casoBase:
      'Precio 500.000 · Madrid · segunda mano · gestoría 500. ITP 6,00 %. ' +
      'Publica Total gastos adicionales 31.921,73 € y COSTE TOTAL 531.921,73 €.',
    pestanas: false,
    cifraComprador: /^COSTE TOTAL/,
    preparar: async (page) => {
      await sembrar(page, 'Precio de compra de la nave industrial', '500000');
      await sembrar(page, 'Gastos de gestoría (€)', '500');
    },
    mensajePrecioIlegible: {
      etiqueta: 'Precio de compra de la nave industrial',
      hueco: 'el placeholder pide introducir un precio que YA está escrito',
    },
    campos: [
      {
        etiqueta: 'Precio de compra de la nave industrial',
        panel: 'comprador',
        legible: '500000',
        direccion: 'apaga',
        delta: 0,
      },
      {
        etiqueta: 'Gastos de gestoría (€)',
        panel: 'comprador',
        legible: '500',
        direccion: 'baja',
        delta: -500,
        nombra: /gestoría/i,
      },
    ],
  },
  {
    slug: 'simulador-gastos-compraventa-solar',
    casoBase:
      'Precio 120.000 · Madrid · vende un particular · gestoría 500. ITP 6,00 %. ' +
      'Publica Total gastos adicionales 8.532,96 € y COSTE TOTAL 128.532,96 €.',
    pestanas: false,
    cifraComprador: /^COSTE TOTAL/,
    preparar: async (page) => {
      await sembrar(page, 'Precio de compra del solar', '120000');
      await sembrar(page, 'Gastos de gestoría (€)', '500');
    },
    mensajePrecioIlegible: {
      etiqueta: 'Precio de compra del solar',
      hueco: 'el placeholder pide introducir un precio que YA está escrito',
    },
    campos: [
      {
        etiqueta: 'Precio de compra del solar',
        panel: 'comprador',
        legible: '120000',
        direccion: 'apaga',
        delta: 0,
      },
      {
        etiqueta: 'Gastos de gestoría (€)',
        panel: 'comprador',
        legible: '500',
        direccion: 'baja',
        delta: -500,
        nombra: /gestoría/i,
      },
    ],
  },
  {
    slug: 'simulador-gastos-compraventa-terreno-rustico',
    casoBase:
      'Precio 80.000 · Madrid · operación ITP · gestoría 400. ITP 6,00 %. ' +
      'Publica Total gastos adicionales 5.911,96 € y COSTE TOTAL 85.911,96 €.',
    pestanas: false,
    cifraComprador: /^COSTE TOTAL/,
    preparar: async (page) => {
      await sembrar(page, 'Precio de compra de la finca rústica', '80000');
      await sembrar(page, 'Gastos de gestoría (€)', '400');
    },
    mensajePrecioIlegible: {
      etiqueta: 'Precio de compra de la finca rústica',
      hueco: 'el placeholder pide introducir un precio que YA está escrito',
    },
    campos: [
      {
        etiqueta: 'Precio de compra de la finca rústica',
        panel: 'comprador',
        legible: '80000',
        direccion: 'apaga',
        delta: 0,
      },
      {
        etiqueta: 'Gastos de gestoría (€)',
        panel: 'comprador',
        legible: '400',
        direccion: 'baja',
        delta: -400,
        nombra: /gestoría/i,
      },
    ],
  },

  // ── GRUPO C · el hub, que es EL PATRÓN CORRECTO del clúster ────────────────────
  //    Separa los avisos en DOS listas por DIRECCIÓN (`faltanEnElNeto` y `faltanPorAbaratar`)
  //    y la dirección medida coincide con el aviso en los 7 casos avisados. El octavo —el
  //    valor catastral total— no está en ninguna de las dos listas: es el hueco C1.
  {
    slug: 'estimador-compraventa-inmueble',
    casoBase:
      'BASE B — Madrid · vivienda · segunda mano · perfil General · precio 200.000 · gestoría ' +
      'del comprador 300. VENDEDOR: compra original 150.000 · 10 años · catastral suelo ' +
      '50.000 · catastral total VACÍO · comisión 3 % · vivienda habitual MARCADA · sin >65 y ' +
      'sin reinversión. Publica COSTE TOTAL 213.295,20 € y NETO 184.090,00 €. · ' +
      'BASE A = B + reinvierte 193.000 (exento, NETO 193.000,00). · ' +
      "BASE A' = B + reinvierte 150.000 + hipoteca 2.000,50 (NETO 191.181,64). · " +
      'BASE C = B + catastral total 700.000 (método real, NETO 184.174,64).',
    pestanas: true,
    cifraComprador: /^COSTE TOTAL/,
    cifraVendedor: /^IMPORTE NETO VENDEDOR$/,
    preparar: async (page, base) => {
      await sembrar(page, 'Precio de la vivienda', '200000');
      await sembrar(page, 'Gastos de gestoría del comprador (€)', '300');
      await irAPestana(page, 'vendedor');
      await sembrar(page, 'Precio de compra original', '150000');
      await sembrar(page, 'Años de propiedad', '10');
      await sembrar(page, 'Valor catastral del suelo', '50000');
      await sembrar(page, 'Comisión inmobiliaria (%)', '3');
      if (base === 'C') {
        await sembrar(page, 'Valor catastral total (suelo + construcción)', '700000');
      }
      if (base === 'A' || base === "A'") {
        await page
          .getByRole('checkbox', { name: /Voy a reinvertir en otra vivienda habitual/ })
          .check();
        await sembrar(
          page,
          'Importe que reinviertes en la nueva vivienda',
          base === 'A' ? '193000' : '150000',
        );
        if (base === "A'") {
          await sembrar(page, 'Hipoteca pendiente de la vivienda que vendes', '2000,50');
        }
      }
    },
    campos: [
      {
        etiqueta: 'Precio de la vivienda',
        panel: 'comprador',
        legible: '200000',
        direccion: 'apaga',
        delta: 0,
      },
      {
        etiqueta: 'Gastos de gestoría del comprador (€)',
        panel: 'comprador',
        legible: '300',
        direccion: 'baja',
        delta: -300,
        nombra: /gestoría/i,
      },
      {
        etiqueta: 'Precio de compra original',
        panel: 'vendedor',
        legible: '150000',
        direccion: 'sube',
        delta: 9910,
        nombra: /precio de compra original/i,
      },
      {
        etiqueta: 'Años de propiedad',
        panel: 'vendedor',
        legible: '10',
        ilegible: '1.0.5',
        direccion: 'sube',
        delta: 790,
        nombra: /años de (?:propiedad|tenencia)/i,
      },
      {
        // La redacción de referencia del clúster: «REDUCEN el impuesto … el neto real es
        // MAYOR que este». Es la que hay que propagar a las seis hermanas.
        etiqueta: 'Impuestos y gastos que pagaste al comprar',
        panel: 'vendedor',
        legible: '2000,50',
        direccion: 'baja',
        delta: -420.1,
        nombra: /impuestos y gastos de aquella compra/i,
      },
      {
        etiqueta: 'Inversiones y mejoras (opcional)',
        panel: 'vendedor',
        legible: '2000,50',
        direccion: 'baja',
        delta: -420.1,
        nombra: /mejoras/i,
      },
      {
        etiqueta: 'Valor catastral del suelo',
        panel: 'vendedor',
        legible: '50000',
        direccion: 'sube',
        delta: 790,
        nombra: /valor catastral del suelo/i,
      },
      {
        // TRAMPA MEDIDA: sobre la BASE B el método objetivo ya gana y el delta es 0,00 €, así
        // que este caso daría VERDE sin probar nada. Va sobre la BASE C.
        etiqueta: 'Valor catastral total (suelo + construcción)',
        panel: 'vendedor',
        legible: '700000',
        ilegible: '700.000.00',
        base: 'C',
        direccion: 'baja',
        delta: -84.64,
        nombra: /valor catastral total/i,
        falla:
          'HUECO C1 — es el ÚNICO de los ocho importes del vendedor leído con ' +
          '`parseSpanishNumber` a pelo: el ilegible entra como `undefined`, indistinguible del ' +
          'VACÍO, y no lo mira ni `faltanEnElNeto` ni `faltanPorAbaratar`. Mueve el neto ' +
          '−84,64 € EN SILENCIO en cuanto el método real es el favorable, con «Lo que realmente ' +
          'recibes» intacto. Y la única frase que llega a salir —«Método objetivo (falta el ' +
          'valor catastral total para comparar)», en la tarjeta de la plusvalía— es FALSA: el ' +
          'usuario lo escribió y lo sigue viendo en el campo. Para ponerlo en verde: el octavo ' +
          '`esLegible` y el campo en `faltanPorAbaratar`, que es su dirección.',
      },
      {
        etiqueta: 'Comisión inmobiliaria (%)',
        panel: 'vendedor',
        legible: '3,50',
        ilegible: '3.5.0',
        direccion: 'sube',
        delta: 5530,
        nombra: /comisión inmobiliaria/i,
      },
      {
        etiqueta: 'Otros gastos de la venta (opcional)',
        panel: 'vendedor',
        legible: '2000,50',
        direccion: 'sube',
        delta: 1580.4,
        nombra: /otros gastos de la venta/i,
      },
      {
        // El campo más caro de los ocho y el único con aviso dedicado en su propia tarjeta.
        etiqueta: 'Importe que reinviertes en la nueva vivienda',
        panel: 'vendedor',
        legible: '193000',
        base: 'A',
        direccion: 'baja',
        delta: -8910,
        nombra: /reinviert/i,
      },
      {
        // TRAMPA MEDIDA: con reinversión TOTAL (base A) la proporción satura en `Math.min(1, …)`
        // y el delta es 0,00 €. Necesita la BASE A' (reinversión PARCIAL) para mover algo.
        etiqueta: 'Hipoteca pendiente de la vivienda que vendes',
        panel: 'vendedor',
        legible: '2000,50',
        base: "A'",
        direccion: 'baja',
        delta: -73.51,
        nombra: /hipoteca/i,
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
//  El vocabulario de la DIRECCIÓN, tal como lo escriben las siete apps
//
//  ⚠️ La familia habla TRES dialectos para decir lo mismo, y eso también es fruto de que
//  la lógica esté escrita siete veces:
//    · garaje y el estimador → «falta descontar …» / «… REDUCEN el IRPF: el neto real es
//      MAYOR que este».
//    · trastero              → «Techo: aún NO incluye …» / «Suelo: faltan …, que … REDUCEN
//      el IRPF y suben el neto».
//    · los paneles de COMPRADOR de las seis → «No incluye …: el coste real será mayor».
//    · local-comercial       → «No descuenta …: el neto real será menor».
//  Este testigo acepta los cuatro: lo que vigila es la DIRECCIÓN, no la redacción. Por eso
//  «Techo:» y «Suelo:» se buscan CON DOS PUNTOS — un `/\bsuelo\b/` suelto casaría con
//  «el valor catastral del suelo», que sale en la mitad de los avisos y no dice nada de la
//  dirección.
// ═══════════════════════════════════════════════════════════════════════════════

/** La cifra publicada está POR ENCIMA de la real: hay que descontar (TECHO). */
const DICE_TECHO =
  /falta(?:n)? descontar|no descuenta|(?:neto|coste) real (?:es|será) menor|\btecho:/i;

/** La cifra publicada está POR DEBAJO de la real: la real es MAYOR (SUELO). */
const DICE_SUELO =
  /(?:neto|coste) real (?:es|será) mayor|reducen el (?:irpf|impuesto)|falta sumar al valor de adquisición|\bsuelo:/i;

const SENTIDO: Record<'sube' | 'baja', { debe: RegExp; noDebe: RegExp; explica: string }> = {
  sube: {
    debe: DICE_TECHO,
    noDebe: DICE_SUELO,
    explica: 'la cifra publicada queda POR ENCIMA de la real, así que el aviso debe mandar DESCONTAR',
  },
  baja: {
    debe: DICE_SUELO,
    noDebe: DICE_TECHO,
    explica: 'la cifra publicada es un SUELO, así que el aviso debe decir que la real es MAYOR',
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
//  Lectura de la página
// ═══════════════════════════════════════════════════════════════════════════════

/** El formato es-ES separa la cifra del € con un espacio duro (U+00A0). */
const ESPACIO_DURO = new RegExp(String.fromCharCode(160), 'g');

const eur = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
});

const rotuloTarjeta = (page: Page, titulo: RegExp): Locator =>
  page.locator('h3').filter({ hasText: titulo }).first();

/** La cifra de una `ResultCard`, en euros. `null` si la tarjeta no está en pantalla. */
async function leerCifra(page: Page, titulo: RegExp): Promise<number | null> {
  const h3 = rotuloTarjeta(page, titulo);
  if ((await h3.count()) === 0) return null;
  const crudo = await h3.locator('xpath=../following-sibling::div[1]/p').innerText();
  const limpio = crudo
    .replace(ESPACIO_DURO, ' ')
    .replace(/[€\s]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const n = Number(limpio);
  if (!Number.isFinite(n)) throw new Error(`No se pudo leer como euros: «${crudo}»`);
  return n;
}

/** Estrecha el `null` de `leerCifra` a un número, con un motivo legible cuando no lo hay. */
function exigirCifra(valor: number | null, motivo: string): number {
  if (valor === null) throw new Error(motivo);
  return valor;
}

/**
 * El aviso que acompaña a la cifra: el rótulo de la tarjeta (que es donde algunas apps
 * escriben el «(PARCIAL)») más su descripción. Es el sitio donde el aviso TIENE que estar:
 * de nada sirve explicarlo tres tarjetas más arriba si la cifra final se publica limpia.
 */
async function leerAviso(page: Page, titulo: RegExp): Promise<string> {
  const h3 = rotuloTarjeta(page, titulo);
  if ((await h3.count()) === 0) return '';
  const rotulo = await h3.innerText();
  const desc = h3.locator('xpath=../following-sibling::p[1]');
  const texto = (await desc.count()) > 0 ? await desc.innerText() : '';
  return `${rotulo} · ${texto}`.replace(ESPACIO_DURO, ' ');
}

// ═══════════════════════════════════════════════════════════════════════════════
//  El bucle: un caso por fila de la tabla
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Testigo de familia — el importe ilegible en las 7 apps de compraventa', () => {
  // Cada caso navega, prepara el caso base entero y mide dos veces. 60 s de margen cubre
  // una máquina cargada sin tapar un cuelgue de verdad.
  test.describe.configure({ timeout: 60_000 });

  for (const app of HERMANAS) {
    const cifraDe = (panel: Panel): RegExp => {
      if (panel === 'comprador') return app.cifraComprador;
      if (!app.cifraVendedor) {
        throw new Error(
          `La fila de ${app.slug} pone campos en la pestaña de vendedor pero no declara ` +
            `«cifraVendedor»: sin ella no hay cifra publicada que medir.`,
        );
      }
      return app.cifraVendedor;
    };

    for (const campo of app.campos) {
      const ilegible = campo.ilegible ?? ILEGIBLE;
      const titulo =
        `${app.slug} · «${campo.etiqueta}»` +
        (campo.base ? ` [base ${campo.base}]` : '') +
        ` — ${campo.direccion}` +
        (campo.direccion === 'sube' || campo.direccion === 'baja'
          ? ` ${eur.format(campo.delta)}`
          : '') +
        (campo.falla ? ' · HUECO ABIERTO' : '');

      test(titulo, async ({ page }) => {
        if (campo.falla && !VER_HUECOS) test.fail();

        await page.goto(`/${app.slug}/`);
        await esperarHidratacion(page, [sel(app.campos[0].etiqueta)]);
        await app.preparar(page, campo.base ?? 'base');
        if (app.pestanas) await irAPestana(page, campo.panel);

        const cifra = cifraDe(campo.panel);

        // 1) CON el dato legible: la cifra de referencia.
        await sembrar(page, campo.etiqueta, campo.legible);
        const conDato = exigirCifra(
          await leerCifra(page, cifra),
          `Con «${campo.etiqueta}» = ${campo.legible} la app tiene que publicar su cifra final ` +
            `y no la publica.`,
        );

        // 2) SIN el dato, porque es ilegible. El texto imposible se queda a la vista: el blur
        //    no lo reescribe, ya que `handleBlur` solo acota cuando el parser NO devuelve NaN.
        await sembrar(page, campo.etiqueta, ilegible);
        const sinDato = await leerCifra(page, cifra);
        const aviso = await leerAviso(page, cifra);

        // 3) La app se abstiene por completo: no publica nada falso y no hace falta aviso.
        if (campo.direccion === 'apaga') {
          expect(
            sinDato,
            `Con el precio ilegible la app NO debe publicar ninguna cifra final (publicó ${
              sinDato === null ? 'ninguna' : eur.format(sinDato)
            })`,
          ).toBeNull();
          await expect(page.getByText(/Introduce el precio/i).first()).toBeVisible();
          return;
        }

        const conIlegible = exigirCifra(
          sinDato,
          `Con «${campo.etiqueta}» ilegible la app dejó de publicar su cifra final. Si ahora se ` +
            `abstiene a propósito, su fila de la tabla pasa a «apaga».`,
        );

        // 4) LA DIRECCIÓN SE CALCULA, NO SE RAZONA.
        const delta = conIlegible - conDato;
        expect(
          delta,
          `El ilegible mueve la cifra publicada ${eur.format(delta)} y la medición del ` +
            `23/09/2026 dice ${eur.format(campo.delta)} ` +
            `(con dato ${eur.format(conDato)} → sin dato ${eur.format(conIlegible)}). ` +
            `Si el motor ha cambiado a propósito, actualiza la fila de la tabla.`,
        ).toBeCloseTo(campo.delta, 2);

        // 5) Si no mueve nada, no hace falta aviso: ahí termina el caso.
        if (campo.direccion === 'sin_efecto') {
          expect(delta, 'Este campo no mueve la cifra en este caso base').toBeCloseTo(0, 2);
          return;
        }

        const esperado = SENTIDO[campo.direccion];
        if (!campo.nombra) {
          throw new Error(
            `La fila de «${campo.etiqueta}» declara que la cifra se mueve pero no dice por qué ` +
              `texto se reconoce el aviso: añade «nombra» a la tabla.`,
          );
        }

        // 6) (a) NOMBRARLO.
        expect(
          aviso,
          `La cifra se movió ${eur.format(delta)} y el aviso NO nombra «${campo.etiqueta}».\n` +
            `  Aviso publicado: ${aviso || '(ninguno)'}`,
        ).toMatch(campo.nombra);

        // 7) (b) DECIR EN QUÉ DIRECCIÓN FALTA.
        expect(
          aviso,
          `La cifra se movió ${eur.format(delta)}: ${esperado.explica}.\n` +
            `  Aviso publicado: ${aviso || '(ninguno)'}`,
        ).toMatch(esperado.debe);

        // 8) Y no decir la contraria, que es PEOR que no decir nada: manda corregir la cifra
        //    en el sentido equivocado.
        expect(
          aviso,
          `El aviso dice la dirección CONTRARIA a la medida (${eur.format(delta)}): ` +
            `${esperado.explica}.\n  Aviso publicado: ${aviso}`,
        ).not.toMatch(esperado.noDebe);
      });
    }
  }

  // ── Caso aparte: el placeholder del grupo B ─────────────────────────────────
  //    No es un fallo de CIFRA —con el precio ilegible estas tres no publican nada— sino de
  //    MENSAJE: tratan «escrito pero ilegible» como «no escrito» y piden introducir un precio
  //    que el usuario está viendo escrito en el campo. Va marcado porque sigue abierto.
  for (const app of HERMANAS) {
    if (!app.mensajePrecioIlegible) continue;
    const { etiqueta, hueco } = app.mensajePrecioIlegible;

    test(`${app.slug} · el precio ilegible se confunde con el vacío — MENSAJE · HUECO ABIERTO`, async ({
      page,
    }) => {
      // HUECO de MENSAJE, idéntico en las tres (nave 629 · solar 501 · terreno 539): el panel
      // entero se sustituye por «Introduce el precio…» mientras el 2.000.50 sigue escrito y a
      // la vista. Para ponerlo en verde basta con que el placeholder distinga el campo VACÍO
      // del campo con un texto que no se ha podido leer, como ya hace la tarjeta de la
      // gestoría de estas mismas tres apps.
      if (!VER_HUECOS) test.fail();

      await page.goto(`/${app.slug}/`);
      await esperarHidratacion(page, [sel(etiqueta)]);
      await app.preparar(page, 'base');
      await sembrar(page, etiqueta, ILEGIBLE);

      // El texto imposible sigue en pantalla: eso es lo que hace falso al mensaje.
      await expect(page.locator(sel(etiqueta))).toHaveValue(ILEGIBLE);

      const mensaje = await page.getByText(/Introduce el precio/i).first().innerText();
      expect(
        mensaje,
        `El precio está escrito y a la vista, pero ${hueco}.\n  Mensaje publicado: ${mensaje}`,
      ).toMatch(/no se ha podido leer|no se puede leer|ilegible/i);
    });
  }
});
