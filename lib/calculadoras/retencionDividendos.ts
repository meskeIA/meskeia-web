/**
 * Calculadora de Retencion e IRPF sobre Dividendos
 * Usada por: API /api/chatgpt/retencion-dividendos (ChatGPT Actions)
 *
 * Calcula la retencion aplicable a los dividendos y participaciones en
 * beneficios, la tributacion en el IRPF del receptor persona fisica,
 * y la exencion aplicable en el Impuesto sobre Sociedades cuando el
 * receptor es una entidad con participacion significativa.
 *
 * Marco normativo:
 *   - LIRPF art. 25.1.a: dividendos como rendimiento del capital mobiliario
 *   - LIRPF art. 96.4: retencion del 19% sobre dividendos
 *   - LIRPF art. 80: deduccion por doble imposicion internacional
 *   - LIS art. 21: exencion de dividendos en IS (participacion >= 5%, 1 ano)
 *   - LIRNR art. 14: dividendos de no residentes (tipo general 19%)
 *
 * QUE MODELA Y QUE NO (leer antes de usar las cifras):
 *   - Receptor PERSONA FISICA RESIDENTE: dividendo de fuente espanola (completo) y
 *     dividendo de fuente extranjera (retencion en origen + deduccion por doble
 *     imposicion del art. 80 LIRPF), siempre que se indique `retencionOrigen`.
 *   - Receptor SOCIEDAD RESIDENTE: solo dividendo de fuente ESPANOLA. El dividendo
 *     de fuente extranjera se rechaza: lo resuelven los arts. 21/31/32 LIS, que
 *     modela `lib/calculadoras/deduccionDobleImposicionIS.ts`.
 *   - Receptor NO RESIDENTE: solo dividendo de fuente ESPANOLA (es lo unico que
 *     tributa en Espana). El tipo de CDI se aplica tal como se indique; el motor no
 *     conoce los convenios ni comprueba que ese tipo sea el del convenio invocado.
 *
 * TRIBUTACION EN IRPF (persona fisica residente):
 *   - Los dividendos tributan como rendimiento del capital mobiliario
 *   - Se integran en la BASE DEL AHORRO (no en la base general)
 *   - Escala del ahorro: la canonica de data/fiscal (TRAMOS_GANANCIAS_PATRIMONIALES_2025)
 *   - Retencion a cuenta: la de data/fiscal (RETENCIONES_IS_2025.dividendos)
 *   - Los gastos de administracion y deposito son deducibles
 *
 *   EXENCION 1.500 EUR (DEROGADA):
 *   La exencion de los primeros 1.500 EUR de dividendos quedo derogada
 *   desde 2015 (Ley 26/2014). TODOS los dividendos tributan.
 *
 * TRIBUTACION EN IS (persona juridica receptora):
 *   - EXENCION art. 21: si la participacion es >= 5% (o valor > 20 M EUR)
 *     mantenida durante >= 1 ano: los dividendos estan EXENTOS de IS
 *   - Si no se cumplen los requisitos: tributan al tipo general del IS
 *   - Retencion: la exencion del IS y la excepcion a la obligacion de retener NO
 *     comparten umbral en este motor (5% frente a 25%). Ver el comentario de
 *     PCT_PARTICIPACION_SIN_RETENCION: el 25% esta PENDIENTE DE VERIFICAR.
 *
 * DIVIDENDOS DE NO RESIDENTES:
 *   - Tipo general LIRNR: el de data/fiscal (19%)
 *   - Tipos reducidos por CDI: se toman del parametro `tipoCDI`, que debe ser un
 *     porcentaje entre 0 y 100
 *
 * Fuente y fecha de verificacion: NO se escriben a mano aqui. Se derivan de los
 * metadatos de data/fiscal (FISCAL_INMUEBLES_META y FISCAL_SOCIEDADES_META), que son
 * los que el triaje fiscal mensual re-sella. Ver `fuenteDatos` en el resultado.
 *
 * Encadenable con: calcular_irpf, calcular_impuesto_sociedades, calcular_plusvalias_irpf,
 * calcular_deduccion_doble_imposicion_is
 */

import {
  TRAMOS_GANANCIAS_PATRIMONIALES_2025,
  RETENCIONES_IS_2025,
  TIPOS_IS_2025,
  FISCAL_INMUEBLES_META,
  FISCAL_SOCIEDADES_META,
} from '@/data/fiscal';

// --- Constantes ---

/** % retencion general IRPF/IRNR sobre dividendos — importado, NO hardcodeado */
const PCT_RETENCION_DIVIDENDOS = RETENCIONES_IS_2025.dividendos;
/** % tipo general del IS — importado, NO hardcodeado */
const PCT_IS_GENERAL = TIPOS_IS_2025.general;

const PCT_PARTICIPACION_EXENCION_IS = 5;  // % participacion minima para exencion IS art. 21
const MESES_TENENCIA_MINIMA_IS = 12;      // Meses de tenencia minima para exencion IS

/**
 * % de participacion a partir del cual este motor deja de practicar retencion.
 *
 * ⚠️ PENDIENTE DE VERIFICAR EN /triaje-fiscal (anotado el 09/09/2026).
 * data/fiscal NO tiene modulo de excepciones a la obligacion de retener, y la consulta
 * al RIS art. 61 no fue concluyente. El valor 25 NO se ha tocado en la reparacion del
 * 09/09/2026 precisamente porque no se pudo anclar en fuente oficial: puede que el
 * umbral correcto sea el mismo 5% del art. 21 LIS, en cuyo caso este 25 sobra.
 *
 * Mientras no se ancle, lo que el motor SI garantiza es que el resultado no se
 * contradiga: cuando declara la exencion del IS y a la vez practica retencion, lo dice
 * y explica que esa retencion es un pago a cuenta integramente recuperable.
 */
const PCT_PARTICIPACION_SIN_RETENCION = 25;

/**
 * Escala base del ahorro — canonica de data/fiscal.
 * ⚠️ 09/09/2026: esta escala ERA una copia local con el ultimo tramo al 28 %, el valor de
 * 2024. La Ley 7/2024 lo elevo al 30 % con efectos 1/1/2025. NO volver a copiarla aqui:
 * data/fiscal/irpf.ts deja escrita la instruccion de importarla desde
 * data/fiscal/inmuebles.ts.
 */
const TRAMOS_AHORRO = TRAMOS_GANANCIAS_PATRIMONIALES_2025;

// --- Tipos publicos ---

export type TipoReceptorDividendo = 'persona_fisica_residente' | 'sociedad_residente' | 'no_residente';

/**
 * Origen del dividendo. NO es lo mismo que la residencia del receptor: un residente
 * espanol puede cobrar un dividendo de una sociedad estadounidense, y entonces hay
 * retencion en el pais de la fuente ademas de la espanola.
 */
export type OrigenDividendo = 'espana' | 'extranjero';

/** Error de parametro: la ruta lo traduce a un 400 con el mensaje, no a un 500 mudo. */
export class ErrorParametroDividendos extends Error {
  constructor(mensaje: string) {
    super(mensaje);
    this.name = 'ErrorParametroDividendos';
  }
}

export interface ParametrosRetencionDividendos {
  tipoReceptor: TipoReceptorDividendo;
  /** Importe bruto del dividendo acordado (EUR) */
  dividendoBruto: number;
  /**
   * Origen del dividendo. Por defecto 'espana'.
   * 'extranjero' solo se modela para persona fisica residente.
   */
  origenDividendo?: OrigenDividendo;
  /** Gastos de administracion y deposito (EUR) — solo para PF */
  gastosAdministracion?: number;
  /**
   * Para receptor sociedad: porcentaje de participacion en la entidad pagadora (%)
   * Para determinar si aplica la exencion del art. 21 LIS.
   * Si se omite, el motor NO lo interpreta como 0: lo declara como dato no aportado.
   */
  porcentajeParticipacion?: number;
  /**
   * Para receptor sociedad: meses de tenencia de la participacion.
   * Si se omite, el motor NO lo interpreta como 0: lo declara como dato no aportado.
   */
  mesesTenencia?: number;
  /**
   * Para no residentes: tipo del CDI aplicable en % (si existe convenio).
   * Si se omite, se aplica el tipo general del IRNR. Debe estar entre 0 y 100.
   */
  tipoCDI?: number;
  /**
   * Solo si origenDividendo = 'extranjero': % efectivamente retenido en el pais de la
   * fuente (p. ej. 15 en EE. UU. con el W-8BEN presentado).
   */
  retencionOrigen?: number;
  /**
   * Solo si origenDividendo = 'extranjero': % maximo que el convenio permite retener en
   * origen. El exceso sobre ese tope NO es deducible en Espana: solo se recupera
   * reclamandolo al pais de la fuente. Si se omite, se supone que lo retenido en origen
   * no supera el tope del convenio.
   */
  tipoMaximoCDIOrigen?: number;
  /** Otros dividendos del ahorro en el ejercicio (para calcular escala acumulada) */
  otrosRdtoAhorroEjercicio?: number;
}

export interface ResultadoRetencionDividendos {
  tipoReceptor: TipoReceptorDividendo;
  origenDividendo: OrigenDividendo;
  dividendoBruto: number;
  gastosDeducibles: number;
  /** Rendimiento neto del capital mobiliario (EUR) */
  rendimientoNeto: number;
  /** Aplica exencion IS art. 21? */
  aplicaExencionIS: boolean;
  motivoNoExencion?: string;
  /** Retencion praticada en ESPANA por la pagadora o el depositario (EUR) */
  retencionPracticada: number;
  /** Dividendo neto tras la retencion espanola (EUR) = dividendoBruto - retencionPracticada */
  dividendoNeto: number;
  /** Solo fuente extranjera: retencion practicada en el pais de la fuente (EUR) */
  retencionOrigenExtranjero?: number;
  /**
   * Solo fuente extranjera: importe que se cobra realmente el dia del pago (EUR)
   * = dividendoBruto - retencionOrigenExtranjero - retencionPracticada
   */
  dividendoNetoCaja?: number;
  /** Solo fuente extranjera: deduccion por doble imposicion internacional (EUR, art. 80 LIRPF) */
  deduccionDobleImposicion?: number;
  /** Solo fuente extranjera: exceso retenido en origen que NO se recupera en Espana (EUR) */
  excesoRetencionOrigenNoDeducible?: number;
  /** Cuota IRPF/IS sobre el dividendo (EUR) */
  cuotaImpuesto: number;
  /** Tipo efectivo sobre dividendo bruto (%) */
  tipoEfectivo: number;
  /** Cuota diferencial (cuota - retencion espanola). Negativa = a devolver */
  cuotaDiferencial: number;
  /** Campos que el motor necesitaba y NO se le han dado. Vacio = no falta nada */
  datosNoAportados: string[];
  advertencias: string[];
  fuenteDatos: string;
}

// --- Validacion de parametros ---

/**
 * Exige que un numero exista de verdad. NaN e Infinity atraviesan cualquier comparacion
 * (`NaN <= 0` es false) y salen al otro lado convertidos en `null` por JSON.stringify,
 * con las advertencias y el aviso legal intactos: una respuesta con toda la apariencia
 * de ser buena y sin una sola cifra dentro.
 */
function exigirFinito(valor: number, campo: string): number {
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    throw new ErrorParametroDividendos(
      `El campo ${campo} debe ser un numero real. Recibido: ${String(valor)}. ` +
      'Un valor no numerico, NaN o infinito no se calcula: se rechaza.'
    );
  }
  return valor;
}

/** Exige un porcentaje dentro de [0, 100]: fuera de ahi la aritmetica es imposible. */
function exigirPorcentaje(valor: number, campo: string, contexto: string): number {
  exigirFinito(valor, campo);
  if (valor < 0 || valor > 100) {
    throw new ErrorParametroDividendos(
      `El campo ${campo} es un PORCENTAJE y debe estar entre 0 y 100. Recibido: ${valor}. ` +
      contexto
    );
  }
  return valor;
}

/** Exige un importe en euros no negativo. */
function exigirImporteNoNegativo(valor: number, campo: string): number {
  exigirFinito(valor, campo);
  if (valor < 0) {
    throw new ErrorParametroDividendos(
      `El campo ${campo} no puede ser negativo. Recibido: ${valor} EUR.`
    );
  }
  return valor;
}

// --- Funciones auxiliares ---

const r = (n: number): number => Math.round(n * 100) / 100;

/** Cuota de la base del ahorro, escalonada tramo a tramo (nunca marginal x base entera). */
function cuotaAhorro(base: number): number {
  if (base <= 0) return 0;
  let cuota = 0;
  let resto = base;
  let ant = 0;
  for (const t of TRAMOS_AHORRO) {
    const tramo = Math.min(resto, t.hasta - ant);
    cuota += tramo * t.tipo / 100;
    resto -= tramo;
    ant = t.hasta;
    if (resto <= 0) break;
  }
  return cuota;
}

// --- Funcion principal ---

export function calcularRetencionDividendos(
  p: ParametrosRetencionDividendos
): ResultadoRetencionDividendos {
  // 1. Validacion de entrada — antes de cualquier aritmetica.
  exigirFinito(p.dividendoBruto, 'dividendoBruto');
  if (p.dividendoBruto <= 0) {
    throw new ErrorParametroDividendos('El dividendo bruto debe ser mayor que cero.');
  }

  // Se redondea UNA vez y todo lo demas se deriva de este valor, para que las lineas
  // publicadas cuadren entre si (bruto - gastos = neto, bruto - retencion = neto cobrado).
  // Antes se publicaba r(bruto) y r(gastos) pero se restaban los valores SIN redondear:
  // con medio centimo de por medio la resta publicada no daba el resultado publicado.
  const dividendoBruto = r(p.dividendoBruto);
  if (dividendoBruto <= 0) {
    throw new ErrorParametroDividendos(
      `El dividendo bruto redondeado a centimos es 0 EUR (recibido ${p.dividendoBruto}). ` +
      'El importe minimo calculable es 0,01 EUR.'
    );
  }

  const origenDividendo: OrigenDividendo = p.origenDividendo ?? 'espana';
  if (origenDividendo !== 'espana' && origenDividendo !== 'extranjero') {
    throw new ErrorParametroDividendos(
      `El campo origenDividendo solo admite "espana" o "extranjero". Recibido: ${String(origenDividendo)}.`
    );
  }

  const gastosDeducibles = p.gastosAdministracion !== undefined
    ? r(exigirImporteNoNegativo(p.gastosAdministracion, 'gastosAdministracion'))
    : 0;

  const otrosRdtoAhorro = p.otrosRdtoAhorroEjercicio !== undefined
    ? r(exigirImporteNoNegativo(p.otrosRdtoAhorroEjercicio, 'otrosRdtoAhorroEjercicio'))
    : 0;

  if (p.porcentajeParticipacion !== undefined) {
    exigirPorcentaje(
      p.porcentajeParticipacion, 'porcentajeParticipacion',
      'Es el % del capital de la pagadora que posee la sociedad receptora.'
    );
  }
  if (p.mesesTenencia !== undefined) {
    exigirImporteNoNegativo(p.mesesTenencia, 'mesesTenencia');
  }
  if (p.tipoCDI !== undefined) {
    exigirPorcentaje(
      p.tipoCDI, 'tipoCDI',
      'Es el TIPO de retencion del convenio (p. ej. 15 para un 15%), no un importe en euros. ' +
      'Un tipo fuera de [0, 100] produciria una retencion mayor que el dividendo o negativa.'
    );
  }
  if (p.retencionOrigen !== undefined) {
    exigirPorcentaje(
      p.retencionOrigen, 'retencionOrigen',
      'Es el % retenido en el pais de la fuente (p. ej. 15 en EE. UU.), no un importe en euros.'
    );
  }
  if (p.tipoMaximoCDIOrigen !== undefined) {
    exigirPorcentaje(
      p.tipoMaximoCDIOrigen, 'tipoMaximoCDIOrigen',
      'Es el % maximo que el convenio permite retener en origen (p. ej. 15).'
    );
  }

  // 2. Origen extranjero: solo se modela para persona fisica residente.
  if (origenDividendo === 'extranjero' && p.tipoReceptor === 'sociedad_residente') {
    throw new ErrorParametroDividendos(
      'Este motor no calcula el dividendo de fuente EXTRANJERA percibido por una sociedad ' +
      'espanola: se rige por los arts. 21, 31 y 32 LIS (exencion de participaciones ' +
      'significativas y deducciones por doble imposicion, directa e indirecta), que este ' +
      'calculo no modela. Usa la calculadora de deduccion por doble imposicion en el IS.'
    );
  }
  if (origenDividendo === 'extranjero' && p.tipoReceptor === 'no_residente') {
    throw new ErrorParametroDividendos(
      'Un dividendo de fuente extranjera percibido por un no residente en Espana no tributa ' +
      'en Espana: no hay nada que calcular aqui. Tributa en el pais de la fuente y en el pais ' +
      'de residencia del perceptor.'
    );
  }

  const advertencias: string[] = [];
  const datosNoAportados: string[] = [];

  const rendimientoNeto = r(dividendoBruto - gastosDeducibles);

  let retencionPracticada = 0;
  let cuotaImpuesto = 0;
  let aplicaExencionIS = false;
  let motivoNoExencion: string | undefined;
  let tipoEfectivo = 0;
  let retencionOrigenExtranjero: number | undefined;
  let dividendoNetoCaja: number | undefined;
  let deduccionDobleImposicion: number | undefined;
  let excesoRetencionOrigenNoDeducible: number | undefined;

  // 3. Calculo por tipo de receptor — switch exhaustivo: un valor nuevo del tipo union
  //    no puede volver a liquidarse en silencio como si fuera un no residente.
  switch (p.tipoReceptor) {
    case 'persona_fisica_residente': {
      retencionPracticada = r(dividendoBruto * PCT_RETENCION_DIVIDENDOS / 100);

      // Cuota en escala ahorro (con otros rendimientos del ahorro acumulados)
      const baseAcum = r(rendimientoNeto + otrosRdtoAhorro);
      const cuotaAcumulada = r(cuotaAhorro(baseAcum));
      const cuotaAnteriores = r(cuotaAhorro(otrosRdtoAhorro));
      const cuotaAntesDeduccion = r(cuotaAcumulada - cuotaAnteriores);
      cuotaImpuesto = cuotaAntesDeduccion;

      advertencias.push(
        'EXENCION 1.500 EUR DEROGADA (desde 2015): todos los dividendos tributan. ' +
        'No existe exencion para los primeros euros de dividendos en IRPF.'
      );
      const tipoUltimoTramo = TRAMOS_AHORRO.length > 0
        ? TRAMOS_AHORRO[TRAMOS_AHORRO.length - 1].tipo
        : PCT_RETENCION_DIVIDENDOS;
      advertencias.push(
        'La retencion del ' + PCT_RETENCION_DIVIDENDOS + '% la practica la sociedad pagadora. ' +
        'Los dividendos se integran en la base del ahorro junto con otras rentas del capital mobiliario. ' +
        'La escala progresiva (' + TRAMOS_AHORRO[0].tipo + '%-' + tipoUltimoTramo + '%) ' +
        'puede superar la retencion si la base del ahorro es alta.'
      );

      if (origenDividendo === 'espana') {
        advertencias.push(
          'ORIGEN DEL DIVIDENDO: el calculo asume que lo reparte una sociedad ESPANOLA. ' +
          'Si el dividendo lo paga una sociedad extranjera (acciones de EE. UU., Alemania, ' +
          'Reino Unido...), el pais de la fuente retiene ademas su propio impuesto y ese ' +
          'importe NO esta descontado aqui: el cobro real seria menor. En ese caso, indica ' +
          'origenDividendo = "extranjero" y el porcentaje retenido en origen, para que se ' +
          'calcule la deduccion por doble imposicion internacional (art. 80 LIRPF).'
        );
      } else if (p.retencionOrigen === undefined) {
        // Falta el dato clave: no se inventa un 0 ni se publica una cifra de caja falsa.
        datosNoAportados.push(
          'retencionOrigen (% retenido en el pais que paga el dividendo)'
        );
        advertencias.push(
          'DIVIDENDO DE FUENTE EXTRANJERA SIN CALCULAR DEL TODO: no se ha indicado el ' +
          'porcentaje retenido en el pais de la fuente, asi que NO se calcula ni el cobro ' +
          'real ni la deduccion por doble imposicion. Las cifras de esta respuesta solo ' +
          'cubren la parte espanola (retencion del ' + PCT_RETENCION_DIVIDENDOS + '% y cuota ' +
          'del ahorro): el importe que se cobra el dia del pago es MENOR, porque el pais de ' +
          'la fuente retiene antes.'
        );
      } else {
        const pctOrigen = p.retencionOrigen;
        retencionOrigenExtranjero = r(dividendoBruto * pctOrigen / 100);
        dividendoNetoCaja = r(dividendoBruto - retencionOrigenExtranjero - retencionPracticada);

        // Art. 80 LIRPF: se deduce la MENOR de estas dos cantidades.
        //   (a) el impuesto satisfecho en el extranjero, limitado al tope del convenio;
        //   (b) el tipo medio efectivo de gravamen del ahorro aplicado a la renta extranjera.
        const pctDeducibleOrigen = p.tipoMaximoCDIOrigen !== undefined
          ? Math.min(pctOrigen, p.tipoMaximoCDIOrigen)
          : pctOrigen;
        const impuestoExtranjeroDeducible = r(dividendoBruto * pctDeducibleOrigen / 100);
        excesoRetencionOrigenNoDeducible = r(retencionOrigenExtranjero - impuestoExtranjeroDeducible);

        const tipoMedioEfectivoAhorro = baseAcum > 0 ? cuotaAcumulada / baseAcum : 0;
        const limiteEspanol = r(rendimientoNeto * tipoMedioEfectivoAhorro);
        deduccionDobleImposicion = r(Math.min(impuestoExtranjeroDeducible, limiteEspanol));

        cuotaImpuesto = r(cuotaAntesDeduccion - deduccionDobleImposicion);

        advertencias.push(
          'DIVIDENDO DE FUENTE EXTRANJERA. Secuencia de cobro: bruto ' + dividendoBruto +
          ' EUR - retencion en origen (' + pctOrigen + '%) ' + retencionOrigenExtranjero +
          ' EUR - retencion espanola (' + PCT_RETENCION_DIVIDENDOS + '%) ' + retencionPracticada +
          ' EUR = ' + dividendoNetoCaja + ' EUR cobrados el dia del pago. ' +
          'En la declaracion de la renta, la cuota del ahorro (' + cuotaAntesDeduccion +
          ' EUR) se reduce en ' + deduccionDobleImposicion + ' EUR por la deduccion por doble ' +
          'imposicion internacional (art. 80 LIRPF), que es la MENOR entre el impuesto ' +
          'extranjero deducible (' + impuestoExtranjeroDeducible + ' EUR) y el limite del tipo ' +
          'medio efectivo del ahorro (' + limiteEspanol + ' EUR).'
        );

        if (excesoRetencionOrigenNoDeducible > 0) {
          advertencias.push(
            'EXCESO RETENIDO EN ORIGEN NO RECUPERABLE EN ESPANA: ' +
            excesoRetencionOrigenNoDeducible + ' EUR. Lo retenido en origen por encima del tope ' +
            'del convenio (' + p.tipoMaximoCDIOrigen + '%) no se deduce en el IRPF espanol: solo ' +
            'se recupera reclamando la devolucion a la administracion fiscal del pais de la fuente.'
          );
        } else if (p.tipoMaximoCDIOrigen === undefined) {
          advertencias.push(
            'SUPUESTO DEL CALCULO: no se ha indicado el tope del convenio (tipoMaximoCDIOrigen), ' +
            'asi que se supone que el ' + pctOrigen + '% retenido en origen NO lo supera y es ' +
            'deducible entero. Si el pais de la fuente ha retenido por encima del convenio ' +
            '(pasa cuando no se ha presentado el formulario que acredita la residencia fiscal), ' +
            'ese exceso no se deduce en el IRPF: hay que reclamarlo a ese pais.'
          );
        }
        if (impuestoExtranjeroDeducible > limiteEspanol) {
          advertencias.push(
            'DEDUCCION LIMITADA: el impuesto extranjero deducible (' + impuestoExtranjeroDeducible +
            ' EUR) supera el limite del art. 80 LIRPF (' + limiteEspanol + ' EUR), que es lo que ' +
            'esa renta paga en Espana. La diferencia se pierde: el IRPF no devuelve impuesto ' +
            'extranjero por encima de lo que la renta tributa aqui.'
          );
        }
        advertencias.push(
          'SUPUESTO DEL CALCULO: se asume que hay un depositario espanol que practica la ' +
          'retencion a cuenta del ' + PCT_RETENCION_DIVIDENDOS + '%. Si las acciones estan en un ' +
          'broker extranjero sin representante en Espana, no hay retencion espanola y la cuota ' +
          'se paga entera en la declaracion.'
        );
      }

      tipoEfectivo = r(cuotaImpuesto / dividendoBruto * 100);

      if (origenDividendo === 'extranjero' && retencionOrigenExtranjero !== undefined) {
        // El tipo efectivo publicado es el de la cuota ESPANOLA. Dicho a secas, en un
        // dividendo extranjero suena a que se paga muy poco, cuando lo que ha pasado es
        // que parte del impuesto se ha pagado fuera.
        const cargaTotal = r((retencionOrigenExtranjero + cuotaImpuesto) / dividendoBruto * 100);
        advertencias.push(
          'OJO AL TIPO EFECTIVO: el ' + tipoEfectivo + '% que figura arriba es solo la cuota ' +
          'ESPANOLA despues de la deduccion. Sumando el impuesto pagado en el pais de la fuente, ' +
          'la carga total sobre este dividendo es del ' + cargaTotal + '%.'
        );
      }
      break;
    }

    case 'sociedad_residente': {
      const faltaParticipacion = p.porcentajeParticipacion === undefined;
      const faltaTenencia = p.mesesTenencia === undefined;
      const pctPart = p.porcentajeParticipacion;
      const mesesTen = p.mesesTenencia;

      if (faltaParticipacion) {
        datosNoAportados.push(
          'porcentajeParticipacion (% del capital de la pagadora que posee la sociedad receptora)'
        );
      }
      if (faltaTenencia) {
        datosNoAportados.push(
          'mesesTenencia (meses que lleva manteniendose esa participacion)'
        );
      }

      // La exencion solo se puede AFIRMAR con los dos datos delante. Si falta alguno, el
      // motor no inventa un 0: calcula el escenario mas gravoso y DICE que falta el dato.
      // Antes, `p.mesesTenencia ?? 0` convertia un dividendo exento en 25.000 EUR de IS y
      // encima lo escribia como si el usuario hubiera declarado «(0 meses)».
      aplicaExencionIS =
        !faltaParticipacion && !faltaTenencia &&
        (pctPart as number) >= PCT_PARTICIPACION_EXENCION_IS &&
        (mesesTen as number) >= MESES_TENENCIA_MINIMA_IS;

      if (!aplicaExencionIS) {
        if (faltaParticipacion || faltaTenencia) {
          const faltantes = [
            faltaParticipacion ? 'el porcentaje de participacion' : null,
            faltaTenencia ? 'los meses de tenencia' : null,
          ].filter((x): x is string => x !== null).join(' ni ');
          motivoNoExencion =
            'NO SE HA PODIDO COMPROBAR LA EXENCION: no se ha indicado ' + faltantes + '. ' +
            'La cuota que figura abajo es el escenario SIN exencion (el mas gravoso), no una ' +
            'conclusion. Con participacion >= ' + PCT_PARTICIPACION_EXENCION_IS + '% mantenida ' +
            '>= ' + MESES_TENENCIA_MINIMA_IS + ' meses, la cuota del IS sobre este dividendo ' +
            'seria 0 EUR (art. 21 LIS). Facilita los dos datos para saber cual de los dos ' +
            'escenarios es el tuyo.';
        } else if ((pctPart as number) < PCT_PARTICIPACION_EXENCION_IS) {
          motivoNoExencion = 'Participacion inferior al ' + PCT_PARTICIPACION_EXENCION_IS + '% (' + pctPart + '%).';
        } else {
          motivoNoExencion = 'Tenencia inferior a ' + MESES_TENENCIA_MINIMA_IS + ' meses (' + mesesTen + ' meses).';
        }
        cuotaImpuesto = r(rendimientoNeto * PCT_IS_GENERAL / 100);
        tipoEfectivo = r(cuotaImpuesto / dividendoBruto * 100);
      }

      // Retencion: este motor deja de retener a partir de PCT_PARTICIPACION_SIN_RETENCION.
      // ⚠️ Ese umbral esta PENDIENTE DE VERIFICAR (ver la constante).
      if (!faltaParticipacion && (pctPart as number) >= PCT_PARTICIPACION_SIN_RETENCION) {
        retencionPracticada = 0;
        advertencias.push(
          'NO SE PRACTICA RETENCION: la participacion del ' + pctPart + '% alcanza el ' +
          PCT_PARTICIPACION_SIN_RETENCION + '% a partir del cual la sociedad pagadora no ' +
          'retiene. Confirma este extremo con la pagadora: el umbral exacto de la excepcion a ' +
          'la obligacion de retener esta pendiente de verificacion en fuente oficial.'
        );
      } else {
        retencionPracticada = r(dividendoBruto * PCT_RETENCION_DIVIDENDOS / 100);
        if (faltaParticipacion) {
          advertencias.push(
            'RETENCION APLICADA POR DEFECTO: al no conocerse el porcentaje de participacion, se ' +
            'calcula la retencion general del ' + PCT_RETENCION_DIVIDENDOS + '%. Con ' +
            'participaciones altas la pagadora puede estar exceptuada de retener.'
          );
        }
      }

      if (aplicaExencionIS) {
        advertencias.push(
          'EXENCION IS ART. 21: los dividendos estan EXENTOS de IS al cumplirse: ' +
          'participacion >= ' + PCT_PARTICIPACION_EXENCION_IS + '% (' + pctPart + '%) ' +
          'y tenencia >= ' + MESES_TENENCIA_MINIMA_IS + ' meses (' + mesesTen + ' meses).'
        );
      } else {
        advertencias.push('Los dividendos NO estan exentos de IS: ' + (motivoNoExencion ?? ''));
      }
      break;
    }

    case 'no_residente': {
      const tipoAplicable = p.tipoCDI !== undefined ? p.tipoCDI : PCT_RETENCION_DIVIDENDOS;
      retencionPracticada = r(dividendoBruto * tipoAplicable / 100);
      cuotaImpuesto = retencionPracticada;
      tipoEfectivo = r(cuotaImpuesto / dividendoBruto * 100);

      advertencias.push(
        'IRNR (no residente): tipo de retencion aplicado ' + tipoAplicable + '%' +
        (p.tipoCDI !== undefined ? ' (tipo CDI aplicable)' : ' (tipo general IRNR — sin CDI)') + '. ' +
        'El CDI puede reducir el tipo a 5-15% segun el convenio con el pais de residencia del receptor.'
      );
      if (p.tipoCDI !== undefined) {
        advertencias.push(
          'El tipo del ' + p.tipoCDI + '% se ha aplicado TAL COMO SE HA INDICADO: este calculo no ' +
          'consulta los convenios ni comprueba que sea el tipo del convenio invocado. ' +
          'Verificalo en el texto del CDI antes de usar la cifra.'
        );
      }
      advertencias.push(
        'Este calculo cubre el dividendo de fuente ESPANOLA percibido por un no residente, que es ' +
        'lo unico que tributa en Espana.'
      );
      break;
    }

    default: {
      const receptorNoSoportado: never = p.tipoReceptor;
      throw new ErrorParametroDividendos(
        'Tipo de receptor no soportado: ' + String(receptorNoSoportado) + '. ' +
        'Valores admitidos: persona_fisica_residente, sociedad_residente, no_residente.'
      );
    }
  }

  const dividendoNeto = r(dividendoBruto - retencionPracticada);
  const cuotaFinal = aplicaExencionIS ? 0 : cuotaImpuesto;
  const cuotaDiferencial = r(cuotaFinal - retencionPracticada);

  // Coherencia interna: si el dividendo esta EXENTO y aun asi soporta retencion, hay que
  // decir por que y que esa retencion vuelve. Antes se publicaban las dos afirmaciones
  // (exento / 19.000 EUR retenidos) sin nada que las reconciliara.
  if (aplicaExencionIS && retencionPracticada > 0) {
    advertencias.push(
      'POR QUE HAY RETENCION SI EL DIVIDENDO ESTA EXENTO: son dos umbrales distintos. La ' +
      'exencion del art. 21 LIS se gana con participacion >= ' + PCT_PARTICIPACION_EXENCION_IS +
      '% y >= ' + MESES_TENENCIA_MINIMA_IS + ' meses; la dispensa de RETENER, en este calculo, ' +
      'solo a partir del ' + PCT_PARTICIPACION_SIN_RETENCION + '%. Esa retencion de ' +
      retencionPracticada + ' EUR NO es un impuesto: es un pago a cuenta integramente ' +
      'recuperable. Como la cuota del IS sobre este dividendo es 0 EUR, se deduce en la ' +
      'autoliquidacion del IS (modelo 200) y genera una DEVOLUCION de ' + retencionPracticada +
      ' EUR, que es el importe negativo de cuotaDiferencial. ' +
      'El umbral del ' + PCT_PARTICIPACION_SIN_RETENCION + '% esta pendiente de verificar en ' +
      'fuente oficial: confirma con la pagadora si va a retener o no.'
    );
  }

  if (datosNoAportados.length > 0) {
    advertencias.push(
      'DATOS QUE NO SE HAN FACILITADO y que el calculo necesitaba: ' +
      datosNoAportados.join('; ') + '. El resultado se ha calculado SIN ellos, en el escenario ' +
      'mas prudente; no es una conclusion sobre tu caso hasta que los aportes.'
    );
  }

  return {
    tipoReceptor: p.tipoReceptor,
    origenDividendo,
    dividendoBruto,
    gastosDeducibles,
    rendimientoNeto,
    aplicaExencionIS,
    motivoNoExencion,
    retencionPracticada,
    dividendoNeto,
    retencionOrigenExtranjero,
    dividendoNetoCaja,
    deduccionDobleImposicion,
    excesoRetencionOrigenNoDeducible,
    cuotaImpuesto: cuotaFinal,
    tipoEfectivo: aplicaExencionIS ? 0 : tipoEfectivo,
    cuotaDiferencial,
    datosNoAportados,
    advertencias,
    fuenteDatos:
      'LIRPF art. 25.1 + LIS art. 21 + LIRNR. ' +
      `Escala del ahorro: ${FISCAL_INMUEBLES_META.fuente} — verificado ${FISCAL_INMUEBLES_META.verificado}. ` +
      `Tipos IS y retencion: ${FISCAL_SOCIEDADES_META.fuente} — verificado ${FISCAL_SOCIEDADES_META.verificado}.`,
  };
}
