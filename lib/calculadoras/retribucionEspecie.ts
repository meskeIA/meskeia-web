/**
 * Calculadora de Retribucion en Especie IRPF — logica pura
 * Usada por: MCP server (calcular_retribucion_especie)
 *
 * Calcula la valoracion de las retribuciones en especie mas habituales
 * a efectos del IRPF, aplicando las reglas especiales del art. 43 LIRPF
 * y los tipos de ingreso a cuenta correspondientes.
 *
 * Marco normativo:
 *   - LIRPF art. 42: concepto de retribuciones en especie
 *   - LIRPF art. 43: reglas de valoracion
 *   - RIRPF arts. 43-48: desarrollo reglamentario
 *   - LIRPF art. 42.2: supuestos excluidos (NO son especie)
 *
 * QUE ES RETRIBUCION EN ESPECIE (LIRPF art. 42.1):
 *   La utilizacion, consumo u obtencion, para fines particulares, de bienes,
 *   derechos o servicios de forma gratuita o por precio inferior al normal de
 *   mercado, aun cuando no supongan un gasto real para quien las concede.
 *
 * SUPUESTOS EXCLUIDOS (NO es especie — LIRPF art. 42.2):
 *   - Entrega de acciones/participaciones de la propia empresa (hasta 12.000 EUR/ano)
 *   - Gastos de formacion del trabajador para el puesto de trabajo
 *   - Gastos de guarderia de menores de 3 anos (cheque guarderia)
 *   - Seguros de accidente laboral o responsabilidad civil
 *   - Seguros de enfermedad propia + conyugue + descendientes: hasta 500 EUR/beneficiario/ano
 *   - Comidas en restaurante o cantina del trabajo (hasta 11 EUR/dia con ticket)
 *   - Abono transporte publico: hasta 1.500 EUR/ano
 *
 * REGLAS DE VALORACION (LIRPF art. 43):
 *   a) Uso de vivienda empresa (propiedad): 10% del valor catastral (5% si revisado)
 *   b) Uso de vehiculo empresa: 20% del coste de adquisicion (incluido IVA)
 *      Si es vehi. electrico: reduccion del 30% en la valoracion (LIRPF art. 43.1.1.f)
 *   c) Prestamos a tipo inferior de mercado: diferencia tipo mercado - tipo aplicado
 *      (tipo mercado = tipo interes legal del dinero vigente — 3,25% en 2025)
 *   d) Manutension, hospedaje, viajes, seguros y otros: precio de mercado
 *   e) Becas de estudio para hijos de empleados: precio de mercado
 *
 * INGRESO A CUENTA (RIRPF art. 102):
 *   El empresario debe practicar INGRESO A CUENTA sobre las retribuciones en especie
 *   (equivalente a la retencion en dinero).
 *   Tipo de ingreso a cuenta = porcentaje de retencion aplicable al trabajador.
 *
 * Fuente: LIRPF arts. 42-43 + RIRPF arts. 43-48 - vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_sueldo_neto, calcular_irpf, calcular_vehiculo_empresa_fiscal
 */

// --- Constantes ---

const PCT_USO_VIVIENDA_CATASTRO_NORMAL = 10;   // % valor catastral (sin revisar)
const PCT_USO_VIVIENDA_CATASTRO_REVISADO = 5;  // % si catastro revisado en ultimos 10 anios
const PCT_USO_VEHICULO_EMPRESA = 20;           // % coste adquisicion vehiculo empresa
const REDUCCION_VEHICULO_ELECTRICO = 30;       // % reduccion valoracion vehiculos electricos
const TIPO_INTERES_LEGAL_2025 = 3.25;          // % tipo interes legal 2025 (para prestamos)

// Exclusiones anuales mas comunes
const LIMITE_EXCLUSION_ACCIONES = 12000;       // EUR/ano entrega acciones propia empresa
const LIMITE_EXCLUSION_SEGURO_ENFERMEDAD = 500; // EUR/beneficiario/ano
const LIMITE_EXCLUSION_TICKET_COMIDA = 11;     // EUR/dia
const LIMITE_EXCLUSION_TRANSPORTE = 1500;      // EUR/ano

// --- Tipos publicos ---

export type TipoRetribucionEspecie =
  | 'uso_vivienda'          // Vivienda cedida por la empresa
  | 'uso_vehiculo'          // Vehiculo de empresa para uso particular
  | 'prestamo_tipo_reducido' // Prestamo a tipo inferior al legal
  | 'seguro_vida_o_enfermedad' // Seguro pagado por la empresa
  | 'educacion_hijos'       // Becas/guarderia hijos empleados
  | 'otro';                 // Cualquier otro bien o servicio a precio inferior mercado

export interface ParametrosRetribucionEspecie {
  tipoRetribucion: TipoRetribucionEspecie;
  descripcion?: string;

  // Uso de vivienda
  valorCatastralVivienda?: number;
  catastroRevisadoReciente?: boolean;   // revisado en ultimos 10 anios

  // Uso de vehiculo
  costeAdquisicionVehiculo?: number;    // precio de compra con IVA
  esVehiculoElectrico?: boolean;
  pctUsoParticularVehiculo?: number;    // % tiempo uso particular (si mixto)

  // Prestamo tipo reducido
  capitalPrestamo?: number;
  tipoInteresPrestamo?: number;         // % tipo aplicado a trabajador

  // Seguro
  primaAnualSeguro?: number;

  // Educacion / guarderia
  costeAnualEducacion?: number;
  edadHijo?: number;                    // para identificar exclusion guarderia

  // Otro
  valorMercado?: number;               // valor de mercado del bien/servicio
  precioPagadoTrabajador?: number;     // precio pagado por el trabajador (si paga algo)

  /** Tipo de retencion del trabajador (%) — para calcular el ingreso a cuenta */
  tipoRetencionTrabajador?: number;
}

export interface ResultadoRetribucionEspecie {
  tipoRetribucion: TipoRetribucionEspecie;
  descripcion: string;
  /** Valoracion de la retribucion en especie (EUR) */
  valoracionEspecie: number;
  /** Ingreso a cuenta (EUR) — pagado por la empresa */
  ingresoACuenta: number;
  /** Coste total para la empresa incluyendo ingreso a cuenta (EUR) */
  costeEmpresaTotal: number;
  /** Impacto neto en el trabajador: incremento de base imponible IRPF (EUR) */
  incrementoBaseImponibleTrabajador: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// --- Funcion principal ---

export function calcularRetribucionEspecie(p: ParametrosRetribucionEspecie): ResultadoRetribucionEspecie {
  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];

  const tipoRetencion = p.tipoRetencionTrabajador ?? 15; // % default estimado
  let valoracionEspecie = 0;
  let descripcion = p.descripcion ?? p.tipoRetribucion;

  switch (p.tipoRetribucion) {
    case 'uso_vivienda': {
      if (!p.valorCatastralVivienda) throw new Error('Debe indicar el valor catastral de la vivienda.');
      const pct = p.catastroRevisadoReciente ? PCT_USO_VIVIENDA_CATASTRO_REVISADO : PCT_USO_VIVIENDA_CATASTRO_NORMAL;
      valoracionEspecie = r(p.valorCatastralVivienda * pct / 100);
      descripcion = 'Uso de vivienda empresa (valoracion ' + pct + '% valor catastral)';
      advertencias.push(
        'Vivienda cedida por la empresa: valoracion del ' + pct + '% del valor catastral ' +
        (p.catastroRevisadoReciente ? '(revisado en los ultimos 10 anios — tipo reducido 5%)' : '(no revisado recientemente — tipo general 10%)') +
        '. Limite: el 10% de las demas retribuciones del trabajo del trabajador (LIRPF art. 43.1.1.a).'
      );
      break;
    }
    case 'uso_vehiculo': {
      if (!p.costeAdquisicionVehiculo) throw new Error('Debe indicar el coste de adquisicion del vehiculo.');
      let valoracionBase = r(p.costeAdquisicionVehiculo * PCT_USO_VEHICULO_EMPRESA / 100);
      if (p.esVehiculoElectrico) {
        valoracionBase = r(valoracionBase * (1 - REDUCCION_VEHICULO_ELECTRICO / 100));
        advertencias.push(
          'Vehiculo electrico: reduccion del ' + REDUCCION_VEHICULO_ELECTRICO + '% en la valoracion ' +
          '(LIRPF art. 43.1.1.f, incentivo fiscal para fomentar la movilidad electrica).'
        );
      }
      const pctParticular = p.pctUsoParticularVehiculo ?? 100;
      valoracionEspecie = r(valoracionBase * pctParticular / 100);
      descripcion = 'Uso vehiculo empresa ' + (p.esVehiculoElectrico ? '(electrico) ' : '') + pctParticular + '% uso particular';
      advertencias.push(
        'Vehiculo empresa: si el uso es mixto (trabajo + particular), solo tributa la parte proporcional al uso particular. ' +
        'La empresa debe llevar control del uso (kilometros particulares vs laborales).'
      );
      break;
    }
    case 'prestamo_tipo_reducido': {
      if (!p.capitalPrestamo || p.tipoInteresPrestamo === undefined) {
        throw new Error('Debe indicar capital del prestamo y tipo de interes aplicado.');
      }
      const diferenciaIntereses = TIPO_INTERES_LEGAL_2025 - p.tipoInteresPrestamo;
      if (diferenciaIntereses <= 0) {
        valoracionEspecie = 0;
        advertencias.push(
          'El tipo de interes del prestamo (' + p.tipoInteresPrestamo.toFixed(2) + '%) es igual o superior al ' +
          'tipo de interes legal del dinero (' + TIPO_INTERES_LEGAL_2025.toFixed(2) + '% en 2025). ' +
          'No hay retribucion en especie.'
        );
      } else {
        valoracionEspecie = r(p.capitalPrestamo * diferenciaIntereses / 100);
        descripcion = 'Prestamo a tipo reducido (' + p.tipoInteresPrestamo.toFixed(2) + '% vs ' + TIPO_INTERES_LEGAL_2025.toFixed(2) + '% legal)';
      }
      break;
    }
    case 'seguro_vida_o_enfermedad': {
      if (!p.primaAnualSeguro) throw new Error('Debe indicar la prima anual del seguro.');
      const excluido = Math.min(p.primaAnualSeguro, LIMITE_EXCLUSION_SEGURO_ENFERMEDAD);
      valoracionEspecie = r(Math.max(0, p.primaAnualSeguro - LIMITE_EXCLUSION_SEGURO_ENFERMEDAD));
      descripcion = 'Seguro de vida/enfermedad';
      if (excluido > 0) {
        advertencias.push(
          'Seguro de enfermedad: exentos los primeros ' + LIMITE_EXCLUSION_SEGURO_ENFERMEDAD + ' EUR/beneficiario/anio ' +
          '(LIRPF art. 42.2.f). Solo el exceso de ' + valoracionEspecie.toLocaleString('es-ES', { minimumFractionDigits: 2 }) +
          ' EUR tributa como especie.'
        );
      }
      break;
    }
    case 'educacion_hijos': {
      if (!p.costeAnualEducacion) throw new Error('Debe indicar el coste anual de educacion.');
      const esGuarderia = (p.edadHijo ?? 99) < 3;
      if (esGuarderia) {
        valoracionEspecie = 0;
        advertencias.push(
          'Guarderia para hijos menores de 3 anios: EXENTA de IRPF. El cheque/servicio de guarderia ' +
          'abonado por la empresa para hijos de hasta 3 anios no constituye retribucion en especie ' +
          '(LIRPF art. 42.2.b). Sin limite de importe.'
        );
      } else {
        valoracionEspecie = r(p.costeAnualEducacion);
        descripcion = 'Beca educativa o formacion hijos empleados';
      }
      break;
    }
    default: { // 'otro'
      const vm = p.valorMercado ?? 0;
      const pp = p.precioPagadoTrabajador ?? 0;
      if (vm <= 0) throw new Error('Para retribucion "otro" debe indicar el valor de mercado del bien o servicio.');
      valoracionEspecie = r(Math.max(0, vm - pp));
      descripcion = p.descripcion ?? 'Bien o servicio a precio inferior al de mercado';
      break;
    }
  }

  const ingresoACuenta = r(valoracionEspecie * tipoRetencion / 100);
  const costeEmpresaTotal = r(valoracionEspecie + ingresoACuenta);
  const incrementoBaseImponibleTrabajador = valoracionEspecie;

  advertencias.push(
    'Ingreso a cuenta: la empresa debe practicar e ingresar en la AEAT un ingreso a cuenta equivalente ' +
    'al tipo de retencion del trabajador sobre el valor de la especie. ' +
    'Si el trabajador soporta el ingreso a cuenta (se lo descuenta en nomina), la base computable es ' +
    'valoracion + ingreso a cuenta.'
  );

  return {
    tipoRetribucion: p.tipoRetribucion,
    descripcion,
    valoracionEspecie,
    ingresoACuenta,
    costeEmpresaTotal,
    incrementoBaseImponibleTrabajador,
    advertencias,
    fuenteDatos: 'LIRPF arts. 42-43 + RIRPF arts. 43-48 - vigente 2025',
  };
}
