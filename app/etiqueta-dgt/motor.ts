/**
 * Motor de la etiqueta ambiental DGT — sin dependencias, sin React.
 *
 * FUENTES (consultadas el 26/09/2026)
 *   · Reglamento General de Vehículos, Anexo II, apartado de clasificación por potencial
 *     contaminante (Orden PCI/810/2018, BOE-A-2018-10856). Define las categorías por la NORMA EURO:
 *       0 emisiones: BEV, REEV, HICEV, PHEV con autonomía mínima de 40 km, pila de combustible.
 *       ECO: PHEV < 40 km, HEV, gas natural (GNC/GNL) o GLP.
 *       C: gasolina Euro 4/5/6 o diésel Euro 6.   B: gasolina Euro 3 o diésel Euro 4/5.
 *   · DGT, «Distintivo ambiental» (dgt.es), que traduce la norma Euro a FECHAS de matriculación
 *     para turismos y furgonetas ligeras:
 *       C: gasolina «a partir de enero de 2006» y diésel «a partir de septiembre de 2015».
 *       B: gasolina «desde 1 de enero de 2001» y diésel «a partir de 2006».
 *       ECO: además, «deben cumplir criterios de la etiqueta C».
 *
 * La fecha es la APROXIMACIÓN de la DGT: manda la norma Euro que consta en el Registro de
 * Vehículos. Un coche homologado con una norma más reciente antes de su fecha obligatoria puede
 * tener una etiqueta mejor que la que da su año; por eso el resultado de un vehículo de
 * combustión lleva siempre el matiz y la remisión a la consulta por matrícula.
 */

export type TipoEtiqueta = 'cero' | 'eco' | 'c' | 'b' | 'ninguna';
export type TipoCombustible = 'bev' | 'phev' | 'hev' | 'gnc' | 'gasolina' | 'diesel';
export type AutonomiaPhev = 'cuarentaOMas' | 'menos' | '';

export interface DatosVehiculo {
  combustible: TipoCombustible;
  /** Año de primera matriculación (solo gasolina, diésel y gas). */
  anio?: number;
  /** Mes de primera matriculación, 1-12 (solo diésel de 2015). */
  mes?: number;
  autonomiaPhev?: AutonomiaPhev;
}

export interface ClasificacionEtiqueta {
  etiqueta: TipoEtiqueta;
  /** Matiz propio del caso (frontera de fecha, gas que no llega a la C…), o null. */
  matiz: string | null;
}

/** Primer año de la etiqueta B y C por combustible (DGT, turismos y furgonetas ligeras). */
export const FECHAS_DGT = {
  gasolinaB: 2001, // desde el 1 de enero de 2001 (Euro 3)
  gasolinaC: 2006, // a partir de enero de 2006 (Euro 4)
  dieselB: 2006, // a partir de 2006 (Euro 4)
  dieselCAnio: 2015, // a partir de septiembre de 2015 (Euro 6)
  dieselCMes: 9,
} as const;

/** Año y mes que el diésel necesita: solo en 2015 el mes decide entre B y C. */
export function necesitaMes(combustible: TipoCombustible | '', anio: number): boolean {
  return combustible === 'diesel' && anio === FECHAS_DGT.dieselCAnio;
}

function etiquetaGasolina(anio: number): TipoEtiqueta {
  if (anio >= FECHAS_DGT.gasolinaC) return 'c';
  if (anio >= FECHAS_DGT.gasolinaB) return 'b';
  return 'ninguna';
}

export function clasificar(datos: DatosVehiculo): ClasificacionEtiqueta {
  const { combustible, anio = 0, mes = 0, autonomiaPhev = '' } = datos;

  switch (combustible) {
    case 'bev':
      return { etiqueta: 'cero', matiz: null };

    case 'phev':
      return { etiqueta: autonomiaPhev === 'cuarentaOMas' ? 'cero' : 'eco', matiz: null };

    case 'hev':
      return { etiqueta: 'eco', matiz: null };

    case 'gnc': {
      // La ECO del gas exige cumplir los criterios de la C: por fecha, gasolina desde 2006.
      if (anio >= FECHAS_DGT.gasolinaC) return { etiqueta: 'eco', matiz: null };
      return {
        etiqueta: etiquetaGasolina(anio),
        matiz:
          'Un vehículo de gas solo lleva la ECO si cumple también los criterios de la etiqueta C (por fecha, matriculado a partir de enero de 2006). El tuyo es anterior, así que, por fecha, le corresponde la etiqueta de su norma Euro de gasolina.',
      };
    }

    case 'gasolina':
      return { etiqueta: etiquetaGasolina(anio), matiz: null };

    case 'diesel': {
      if (anio > FECHAS_DGT.dieselCAnio) return { etiqueta: 'c', matiz: null };
      if (anio === FECHAS_DGT.dieselCAnio) {
        if (mes >= FECHAS_DGT.dieselCMes) return { etiqueta: 'c', matiz: null };
        return {
          etiqueta: 'b',
          matiz:
            'La DGT da la etiqueta C al diésel matriculado a partir de septiembre de 2015 (Euro 6). Si tu ficha técnica dice Euro 6, te corresponde la C aunque se matriculara antes.',
        };
      }
      if (anio >= FECHAS_DGT.dieselB) return { etiqueta: 'b', matiz: null };
      return { etiqueta: 'ninguna', matiz: null };
    }
  }
}
