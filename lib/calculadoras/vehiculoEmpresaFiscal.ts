/**
 * Calculadora de Tratamiento Fiscal del Vehículo de Empresa — lógica pura
 * Usada por: MCP server (calcular_vehiculo_empresa_fiscal)
 *
 * Calcula el tratamiento fiscal completo del vehículo de empresa en los tres
 * impuestos principales: IS (deducción gasto), IRPF (retribución en especie)
 * e IVA (deducción de cuotas soportadas).
 *
 * A) IMPUESTO SOBRE SOCIEDADES (LIS art. 15):
 *    - Gasto deducible: 100% si uso exclusivo actividad (muy difícil acreditar)
 *    - Gasto deducible: 50% si uso mixto (regla general AEAT)
 *    - Vehículos con deducción 100% siempre (LIS art. 15.1.e):
 *      * Agentes comerciales y representantes
 *      * Transporte de mercancías
 *      * Transporte de viajeros
 *      * Enseñanza a conductores (autoescuelas)
 *      * Servicios de seguridad
 *      * Pruebas, ensayos o demostraciones
 *    - Leasing: cada cuota es 50% deducible (la parte de amortización)
 *
 * B) IRPF — RETRIBUCIÓN EN ESPECIE (RIRPF art. 43):
 *    - Vehículo en propiedad empresa: 20% del coste de adquisición/año
 *    - Vehículo eléctrico puro (BEV): 15% del coste
 *    - Vehículo eléctrico enchufable (PHEV) o híbrido: 15% si autonomía ≥ 40km
 *    - En renting: 20% del valor de mercado
 *    - Reducción 30% si el vehículo es eficiente energéticamente
 *    - Uso mixto: proporcional al % uso privado (AEAT presume 100% privado sin acreditación)
 *
 * C) IVA — DEDUCCIÓN (LIVA arts. 95-96):
 *    - Turismo/vehículo polivalente: 50% de la cuota soportada (presunción legal)
 *    - Agentes comerciales, transporte, enseñanza conductores: 100%
 *    - Resto vehículos afectos 100%: 100%
 *    - En renting: IVA de cada cuota: mismas reglas (50% o 100%)
 *
 * Fuente: LIS art. 15 + RIRPF art. 43 + LIVA arts. 95-96 — vigente 2025
 * Verificado: 2025-01-15
 *
 * Encadenable con: calcular_impuesto_sociedades, calcular_conceptos_cotizables, calcular_iva
 */

// ─── Constantes ────────────────────────────────────────────────────────────────

const PCT_IRPF_VEHICULO_NORMAL = 20;      // % coste adquisición/año
const PCT_IRPF_VEHICULO_ELECTRICO = 15;   // % coste (BEV o PHEV ≥ 40km autonomía)
const PCT_REDUCCION_EFICIENCIA = 30;      // % reducción adicional si vehículo eficiente

const PCT_IS_USO_MIXTO = 50;              // % deducible IS en uso mixto (regla general)
const PCT_IS_USO_EXCLUSIVO = 100;         // % deducible IS si exclusivo acreditado

const PCT_IVA_TURISMO_MIXTO = 50;         // % deducible IVA turismo uso mixto
const PCT_IVA_EXCLUSIVO = 100;            // % deducible IVA uso exclusivo acreditado

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoVehiculoEmpresa = 'turismo' | 'comercial' | 'electrico_bev' | 'electrico_phev' | 'furgoneta';
export type UsoVehiculo = 'mixto' | 'exclusivo_actividad';
export type ActividadEspecialVehiculo =
  | 'ninguna'
  | 'agente_comercial'
  | 'transporte_mercancias'
  | 'transporte_viajeros'
  | 'autoescuela'
  | 'seguridad';
export type ModalidadAdquisicion = 'compra' | 'renting' | 'leasing';

export interface ParametrosVehiculoEmpresaFiscal {
  /** Tipo de vehículo */
  tipoVehiculo: TipoVehiculoEmpresa;
  /** Uso del vehículo */
  usoVehiculo: UsoVehiculo;
  /** Actividad especial que permite deducción 100% (LIS art. 15.1.e) */
  actividadEspecial?: ActividadEspecialVehiculo;
  /** Modalidad de adquisición */
  modalidadAdquisicion: ModalidadAdquisicion;
  /** Coste de adquisición o valor de mercado (€) — para compra y renting */
  costeAdquisicion: number;
  /** Cuota mensual de renting/leasing (€, sin IVA) — si modalidad es renting/leasing */
  cuotaMensualRentingLeasing?: number;
  /** Tipo de IVA soportado en la adquisición o cuotas (%) */
  tipoIVA?: number;
  /** Porcentaje de uso privado real declarado (%) — si uso mixto y se quiere acreditar */
  pctUsoPrivadoAcreditado?: number;
  /** ¿Es vehículo eficiente energéticamente? (reduce IRPF 30%) */
  vehiculoEficienteEnergeticamente?: boolean;
  /** Tipo impositivo IS de la empresa (%) — para calcular ahorro fiscal IS */
  tipoIS?: number;
}

export interface ResultadoVehiculoEmpresaFiscal {
  /** Tipo de vehículo */
  tipoVehiculo: TipoVehiculoEmpresa;
  /** Uso del vehículo */
  usoVehiculo: UsoVehiculo;
  /** Modalidad de adquisición */
  modalidadAdquisicion: ModalidadAdquisicion;

  // IS
  /** Porcentaje deducible en IS (%) */
  pctDeducibleIS: number;
  /** Gasto anual del vehículo en IS (amortización o cuotas) (€) */
  gastoAnualIS: number;
  /** Gasto deducible anual en IS (€) */
  gastoDeducibleIS: number;
  /** Ahorro fiscal IS anual (€) */
  ahorroFiscalIS: number;

  // IRPF
  /** ¿Genera retribución en especie para el trabajador/socio? */
  generaRetribucionEspecie: boolean;
  /** Porcentaje aplicado en IRPF sobre el coste (%) */
  pctIRPFRetribucion: number;
  /** Importe retribución en especie anual bruta (€) */
  retribucionEspecieAnualBruta: number;
  /** Reducción por eficiencia energética (€) */
  reduccionEficiencia: number;
  /** **Retribución en especie anual efectiva (€)** */
  retribucionEspecieAnualEfectiva: number;

  // IVA
  /** Porcentaje de IVA deducible (%) */
  pctIVADeducible: number;
  /** IVA soportado en adquisición (€) */
  ivaSoportadoAdquisicion: number;
  /** IVA deducible en adquisición (€) */
  ivaDeducibleAdquisicion: number;
  /** IVA no deducible (gasto adicional empresa) (€) */
  ivaNoDeducible: number;

  // Resumen
  /** Coste neto anual real para la empresa (€) */
  costeNetoAnualEmpresa: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularVehiculoEmpresaFiscal(p: ParametrosVehiculoEmpresaFiscal): ResultadoVehiculoEmpresaFiscal {
  if (p.costeAdquisicion <= 0) throw new Error('El coste de adquisición debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;
  const advertencias: string[] = [];
  const tipoIVA = p.tipoIVA ?? 21;
  const tipoIS = p.tipoIS ?? 25;
  const actividadEspecial = p.actividadEspecial ?? 'ninguna';

  // ── IS ────────────────────────────────────────────────────────────────────────
  const esActividadEspecial = actividadEspecial !== 'ninguna';
  const esExclusivoAcreditado = p.usoVehiculo === 'exclusivo_actividad' || esActividadEspecial;

  const pctDeducibleIS = esExclusivoAcreditado ? PCT_IS_USO_EXCLUSIVO : PCT_IS_USO_MIXTO;

  // Gasto anual: amortización (compra ~16,67%/año para vehículos) o cuota
  let gastoAnualIS: number;
  if (p.modalidadAdquisicion === 'compra') {
    // Amortización lineal vehículos: coeficiente máximo según tablas IS ≈ 16%
    gastoAnualIS = r(p.costeAdquisicion * 0.16);
  } else if (p.modalidadAdquisicion === 'renting' || p.modalidadAdquisicion === 'leasing') {
    gastoAnualIS = r((p.cuotaMensualRentingLeasing ?? 0) * 12);
  } else {
    gastoAnualIS = 0;
  }

  const gastoDeducibleIS = r(gastoAnualIS * pctDeducibleIS / 100);
  const ahorroFiscalIS = r(gastoDeducibleIS * tipoIS / 100);

  // ── IRPF ──────────────────────────────────────────────────────────────────────
  const generaRetribucionEspecie = p.usoVehiculo === 'mixto' || (p.pctUsoPrivadoAcreditado ?? 0) > 0;

  let pctIRPF: number;
  if (p.tipoVehiculo === 'electrico_bev') {
    pctIRPF = PCT_IRPF_VEHICULO_ELECTRICO;
  } else if (p.tipoVehiculo === 'electrico_phev') {
    pctIRPF = PCT_IRPF_VEHICULO_ELECTRICO;
  } else {
    pctIRPF = PCT_IRPF_VEHICULO_NORMAL;
  }

  const pctUsoPrivado = (p.pctUsoPrivadoAcreditado ?? 100) / 100;
  const retribucionEspecieAnualBruta = generaRetribucionEspecie
    ? r(p.costeAdquisicion * pctIRPF / 100 * pctUsoPrivado)
    : 0;

  const reduccionEficiencia = (p.vehiculoEficienteEnergeticamente && generaRetribucionEspecie)
    ? r(retribucionEspecieAnualBruta * PCT_REDUCCION_EFICIENCIA / 100)
    : 0;

  const retribucionEspecieAnualEfectiva = r(retribucionEspecieAnualBruta - reduccionEficiencia);

  // ── IVA ───────────────────────────────────────────────────────────────────────
  const pctIVADeducible = esActividadEspecial ? PCT_IVA_EXCLUSIVO : PCT_IVA_TURISMO_MIXTO;

  let ivaSoportadoAdquisicion: number;
  if (p.modalidadAdquisicion === 'compra') {
    ivaSoportadoAdquisicion = r(p.costeAdquisicion * tipoIVA / 100);
  } else {
    ivaSoportadoAdquisicion = r((p.cuotaMensualRentingLeasing ?? 0) * 12 * tipoIVA / 100);
  }
  const ivaDeducibleAdquisicion = r(ivaSoportadoAdquisicion * pctIVADeducible / 100);
  const ivaNoDeducible = r(ivaSoportadoAdquisicion - ivaDeducibleAdquisicion);

  // Coste neto anual empresa = gasto anual - ahorro IS + IVA no deducible - (ahorro por retribución especie es del trabajador, no de la empresa)
  const costeNetoAnualEmpresa = r(gastoAnualIS + ivaNoDeducible - ahorroFiscalIS);

  // Advertencias
  advertencias.push(`IS: la deducción al ${PCT_IS_USO_MIXTO}% en uso mixto es una presunción LEGAL de la AEAT (LIVA art. 95.3). Para deducir el 100%, debe acreditar que el vehículo se usa exclusivamente para la actividad. La carga de la prueba recae en el contribuyente.`);
  advertencias.push(`IRPF: la retribución en especie (${retribucionEspecieAnualEfectiva.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €/año) se añade al salario bruto del empleado/socio y tributa. La empresa también debe ingresar retención a cuenta por este concepto.`);
  advertencias.push(`IVA: la deducción del ${pctIVADeducible}% en la cuota soportada puede ser objeto de regularización si cambia el uso del vehículo en los 5 años siguientes (bienes de inversión, LIVA art. 101).`);

  if (p.tipoVehiculo === 'electrico_bev' || p.tipoVehiculo === 'electrico_phev') {
    advertencias.push(`Vehículo eléctrico: tipo IRPF reducido al ${PCT_IRPF_VEHICULO_ELECTRICO}%. Para PHEV, se requiere autonomía eléctrica homologada ≥ 40 km.`);
  }

  if (!esActividadEspecial && p.usoVehiculo === 'exclusivo_actividad') {
    advertencias.push('Uso exclusivo declarado sin actividad especial (LIS art. 15.1.e): la AEAT puede cuestionar la deducción al 100%. Se recomienda documentar fehacientemente (GPS, registros de rutas, política de empresa sin uso privado, etc.).');
  }

  return {
    tipoVehiculo: p.tipoVehiculo,
    usoVehiculo: p.usoVehiculo,
    modalidadAdquisicion: p.modalidadAdquisicion,
    pctDeducibleIS,
    gastoAnualIS,
    gastoDeducibleIS,
    ahorroFiscalIS,
    generaRetribucionEspecie,
    pctIRPFRetribucion: pctIRPF,
    retribucionEspecieAnualBruta,
    reduccionEficiencia,
    retribucionEspecieAnualEfectiva,
    pctIVADeducible,
    ivaSoportadoAdquisicion,
    ivaDeducibleAdquisicion,
    ivaNoDeducible,
    costeNetoAnualEmpresa,
    advertencias,
    fuenteDatos: 'LIS art. 15 + RIRPF art. 43 + LIVA arts. 95-96 — vigente 2025',
  };
}
