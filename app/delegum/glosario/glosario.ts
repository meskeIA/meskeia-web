/**
 * Fuente única del Glosario de Delegum.
 *
 * Términos fiscales, laborales y financieros que suelen confundir a quien no es
 * del gremio, definidos de forma clara y orientativa. Agrupados por categoría.
 * `fichaSlug` enlaza (opcional) con la ficha de Datos Fiscales del mismo tema.
 *
 * Mantener aquí cualquier término nuevo. Lo consume la página /glosario y su
 * JSON-LD DefinedTermSet.
 */

export interface TerminoGlosario {
  /** Ancla URL: /glosario#<id> */
  id: string;
  termino: string;
  definicion: string;
  /** Slug de la ficha de datos-fiscales relacionada (opcional). */
  fichaSlug?: string;
}

export interface CategoriaGlosario {
  id: string;
  nombre: string;
  terminos: TerminoGlosario[];
}

export const GLOSARIO: CategoriaGlosario[] = [
  {
    id: 'fiscalidad-irpf',
    nombre: 'Fiscalidad e IRPF',
    terminos: [
      {
        id: 'base-imponible',
        termino: 'Base imponible',
        definicion:
          'El importe sobre el que se calcula un impuesto antes de aplicar reducciones. En el IRPF es la suma de tus rendimientos (trabajo, actividades, capital) y ganancias, una vez restados los gastos deducibles.',
      },
      {
        id: 'base-liquidable',
        termino: 'Base liquidable',
        definicion:
          'La base imponible menos las reducciones legales (por ejemplo, las aportaciones a planes de pensiones). Es la cifra sobre la que se aplica la escala del impuesto.',
      },
      {
        id: 'tipo-marginal',
        termino: 'Tipo marginal',
        definicion:
          'El porcentaje que se aplica a tu último tramo de renta, es decir, a tu último euro ganado. Sube por tramos; no es el porcentaje que pagas sobre el total de tus ingresos.',
        fichaSlug: 'irpf-tramos-minimos',
      },
      {
        id: 'tipo-efectivo',
        termino: 'Tipo efectivo',
        definicion:
          'El porcentaje real que acabas pagando sobre toda tu base, una vez aplicada la escala progresiva. Siempre es menor que tu tipo marginal.',
      },
      {
        id: 'bases-irpf',
        termino: 'Base general y base del ahorro',
        definicion:
          'El IRPF separa las rentas en dos: la base general (trabajo, alquileres, actividades), que tributa por una escala progresiva, y la base del ahorro (intereses, dividendos y ganancias por ventas), con tipos del 19% al 30%.',
        fichaSlug: 'irpf-tramos-minimos',
      },
      {
        id: 'retencion',
        termino: 'Retención',
        definicion:
          'El adelanto del IRPF que el pagador (empresa, banco) descuenta de lo que te abona y entrega a Hacienda en tu nombre. En la declaración se ajusta con lo que realmente te corresponde, y puede salir a devolver o a pagar.',
      },
      {
        id: 'minimo-personal',
        termino: 'Mínimo personal y familiar',
        definicion:
          'La parte de tu renta que se considera destinada a cubrir necesidades básicas y que no tributa. Aumenta por edad, descendientes, ascendientes a cargo o discapacidad.',
        fichaSlug: 'irpf-tramos-minimos',
      },
      {
        id: 'reduccion-deduccion',
        termino: 'Reducción y deducción',
        definicion:
          'No son lo mismo: una reducción rebaja la base sobre la que se calcula el impuesto; una deducción rebaja directamente la cuota, es decir, lo que pagas. A igual importe, una deducción suele ahorrar más.',
      },
    ],
  },
  {
    id: 'iva-actividad',
    nombre: 'IVA y actividad',
    terminos: [
      {
        id: 'iva-repercutido-soportado',
        termino: 'IVA repercutido y soportado',
        definicion:
          'El IVA repercutido es el que cobras a tus clientes en tus facturas; el soportado, el que pagas en tus compras. En la declaración ingresas la diferencia (repercutido menos soportado).',
        fichaSlug: 'iva-tipos',
      },
      {
        id: 'devengo',
        termino: 'Devengo',
        definicion:
          'El momento en que nace la obligación de pagar un impuesto. En el IVA suele ser cuando se entrega el bien o se presta el servicio, aunque todavía no hayas cobrado la factura.',
      },
      {
        id: 'recargo-equivalencia',
        termino: 'Recargo de equivalencia',
        definicion:
          'Un régimen especial de IVA para comerciantes minoristas: pagan a sus proveedores un IVA algo mayor y, a cambio, no tienen que presentar declaraciones de IVA.',
        fichaSlug: 'iva-tipos',
      },
    ],
  },
  {
    id: 'patrimonio-herencias',
    nombre: 'Patrimonio, vivienda y herencias',
    terminos: [
      {
        id: 'valor-catastral',
        termino: 'Valor catastral',
        definicion:
          'El valor que la administración asigna a un inmueble en el Catastro y que sirve de base a impuestos como el IBI. Suele ser bastante inferior al valor de mercado.',
      },
      {
        id: 'valor-de-referencia',
        termino: 'Valor de referencia',
        definicion:
          'El valor que Catastro fija para cada inmueble como base mínima en ITP, sucesiones y donaciones desde 2022. Si el precio escriturado es menor, el impuesto se calcula igualmente sobre este valor.',
        fichaSlug: 'itp-ccaa',
      },
      {
        id: 'usufructo-nuda-propiedad',
        termino: 'Usufructo y nuda propiedad',
        definicion:
          'Cuando la propiedad de un bien se divide: el usufructuario tiene derecho a usarlo y a sus rentas; el nudo propietario es el dueño sin ese uso. Al fallecer el usufructuario, el nudo propietario adquiere la propiedad plena.',
      },
      {
        id: 'plusvalia',
        termino: 'Plusvalía municipal y plusvalía del IRPF',
        definicion:
          'Al vender o heredar un inmueble pueden coincidir dos «plusvalías»: la municipal (IIVTNU), que grava el aumento de valor del suelo y la cobra el ayuntamiento, y la del IRPF, que grava la ganancia obtenida (precio de venta menos el de compra).',
        fichaSlug: 'plusvalia-municipal',
      },
      {
        id: 'legitima',
        termino: 'Legítima',
        definicion:
          'La parte de la herencia que la ley reserva obligatoriamente a ciertos herederos (los hijos, en su defecto los padres, y el cónyuge). El testador no puede disponer libremente de ella.',
      },
      {
        id: 'caudal-hereditario',
        termino: 'Caudal hereditario',
        definicion:
          'El conjunto de bienes, derechos y deudas que deja una persona al fallecer y que se reparte entre los herederos, tras sumar el ajuar doméstico y restar las cargas y deudas.',
      },
      {
        id: 'ajuar-domestico',
        termino: 'Ajuar doméstico',
        definicion:
          'El conjunto de enseres del hogar (muebles, ropa, electrodomésticos). En el Impuesto de Sucesiones se valora, salvo prueba en contra, en el 3% del caudal hereditario.',
        fichaSlug: 'sucesiones-isd',
      },
      {
        id: 'grupos-parentesco',
        termino: 'Grupos de parentesco',
        definicion:
          'La clasificación de los herederos (de I a IV) según su cercanía con el fallecido, que determina las reducciones y bonificaciones en Sucesiones y Donaciones. Hijos y cónyuge están en los grupos más favorables.',
        fichaSlug: 'sucesiones-isd',
      },
    ],
  },
  {
    id: 'trabajo-seguridad-social',
    nombre: 'Trabajo y Seguridad Social',
    terminos: [
      {
        id: 'base-cotizacion',
        termino: 'Base de cotización',
        definicion:
          'El importe de tu salario sobre el que se calculan las cotizaciones a la Seguridad Social. Tiene un mínimo y un máximo, y de ella dependen tus futuras prestaciones.',
      },
      {
        id: 'base-reguladora',
        termino: 'Base reguladora',
        definicion:
          'El promedio de tus bases de cotización de un periodo, que sirve para calcular el importe de una prestación (jubilación, baja, paro). No coincide con tu sueldo bruto.',
        fichaSlug: 'pensiones-jubilacion',
      },
      {
        id: 'contingencias',
        termino: 'Contingencias comunes y profesionales',
        definicion:
          'Las contingencias comunes cubren las enfermedades y accidentes no laborales; las profesionales, los accidentes de trabajo y las enfermedades profesionales. Cotizan por separado.',
      },
      {
        id: 'finiquito-indemnizacion',
        termino: 'Finiquito e indemnización',
        definicion:
          'El finiquito es la liquidación de lo que se te debe al terminar (salario pendiente, vacaciones no disfrutadas) y se cobra en cualquier salida. La indemnización es una compensación adicional que solo corresponde en ciertos despidos.',
      },
      {
        id: 'iprem',
        termino: 'IPREM',
        definicion:
          'El Indicador Público de Renta de Efectos Múltiples, el índice de referencia para los topes de muchas ayudas y prestaciones (paro, becas, justicia gratuita). No es un salario.',
        fichaSlug: 'iprem',
      },
      {
        id: 'smi',
        termino: 'SMI',
        definicion:
          'El Salario Mínimo Interprofesional, la retribución mínima legal por una jornada completa de trabajo. Se actualiza cada año por el Gobierno.',
        fichaSlug: 'smi-salario-minimo',
      },
    ],
  },
  {
    id: 'autonomos-empresa',
    nombre: 'Autónomos y empresa',
    terminos: [
      {
        id: 'rendimiento-neto',
        termino: 'Rendimiento neto',
        definicion:
          'En una actividad económica, los ingresos menos los gastos deducibles. Es la base sobre la que el autónomo tributa en el IRPF y la que determina su tramo de cotización en el RETA.',
        fichaSlug: 'cuota-autonomos-reta',
      },
      {
        id: 'estimacion-directa-modulos',
        termino: 'Estimación directa y módulos',
        definicion:
          'Dos formas de calcular el rendimiento de un autónomo en el IRPF: la estimación directa parte de ingresos y gastos reales; la objetiva («módulos») usa indicadores fijos (personal, local) con independencia del beneficio real.',
      },
      {
        id: 'coeficiente-amortizacion',
        termino: 'Coeficiente de amortización',
        definicion:
          'El porcentaje anual con el que se reparte como gasto el coste de un bien de la empresa (maquinaria, equipos) a lo largo de su vida útil, en lugar de deducirlo entero el año de la compra.',
        fichaSlug: 'amortizacion-inmovilizado',
      },
    ],
  },
  {
    id: 'finanzas-inversion',
    nombre: 'Finanzas e inversión',
    terminos: [
      {
        id: 'tin-tae',
        termino: 'TIN y TAE',
        definicion:
          'El TIN (Tipo de Interés Nominal) es el interés simple de un préstamo o depósito; la TAE (Tasa Anual Equivalente) incluye además las comisiones y la frecuencia de los pagos, por lo que refleja mejor el coste o el rendimiento real. Conviene comparar siempre por TAE.',
      },
      {
        id: 'interes-compuesto',
        termino: 'Interés compuesto',
        definicion:
          'El interés que se calcula no solo sobre el capital inicial, sino también sobre los intereses ya acumulados. Hace crecer (o encarecer) una cantidad de forma acelerada con el paso del tiempo.',
      },
      {
        id: 'amortizacion-prestamo',
        termino: 'Amortización de un préstamo',
        definicion:
          'La devolución progresiva del capital prestado. En una hipoteca, cada cuota tiene una parte de intereses y otra de amortización del capital; al principio pesan más los intereses.',
      },
      {
        id: 'plusvalia-minusvalia',
        termino: 'Plusvalía y minusvalía',
        definicion:
          'La ganancia (plusvalía) o la pérdida (minusvalía) que obtienes al vender un bien o una inversión por más o por menos de lo que te costó. En el IRPF, las plusvalías tributan en la base del ahorro.',
      },
    ],
  },
];

/** Todos los términos en una lista plana (para el JSON-LD DefinedTermSet). */
export const TERMINOS_PLANOS: TerminoGlosario[] = GLOSARIO.flatMap((c) => c.terminos);
