/**
 * Acceso a las ZBE por etiqueta — sin dependencias, sin React.
 *
 * Lo leen la página (app/etiqueta-dgt/page.tsx) y la API de ChatGPT (/api/chatgpt/etiqueta-dgt).
 * Hasta el 04/10/2026 la API tenía su propia copia, que divergió: a la B de Barcelona la daba por
 * restringida y a la C de Madrid le daba acceso libre a Distrito Centro (hallazgos 2842 y 2843).
 *
 * FUENTES (04/10/2026)
 *   · madrid.es, «Madrid Zona de Bajas Emisiones (ZBE)»: todas las vías públicas urbanas del
 *     municipio; prohíbe la clasificación A desde el 01/01/2025, con excepciones.
 *   · madrid.es, «ZBEDEP Distrito Centro. Información general» (vigente desde el 22/09/2021): la B
 *     y la C no pueden acceder para atravesarla, sí para estacionar en un aparcamiento; ECO y CERO,
 *     libres. No existe ninguna «ZBE 30».
 *   · AMB (zbe.barcelona): la ZBE Rondes restringe, en laborables de 7:00 a 20:00, a los vehículos
 *     sin distintivo ambiental de la DGT.
 */

import type { TipoEtiqueta } from './motor';

/**
 * `consultar` (16/11/2026, hallazgo 4533): ciudad cuya regla no se puede anclar a una fuente
 * fechada. Las restricciones las fija cada ordenanza municipal (RD 1052/2022, art. 5.2), que no
 * está en el BOE: en vez de un veredicto («Libre acceso», «Prohibido») la tarjeta remite al
 * portal del ayuntamiento. Decidido por el usuario en /reparar pendientes (cabo C0797, opción B).
 */
export type AccesoZBE = 'libre' | 'restriccion' | 'prohibido' | 'consultar';

export interface CiudadZBE {
  nombre: string;
  acceso: AccesoZBE;
  detalle: string;
  /** Portal municipal donde consultar la ordenanza (solo con `acceso: 'consultar'`). */
  enlace?: string;
}

/** Ciudades sin fuente fechada: la tarjeta remite a su ayuntamiento, sea cual sea la etiqueta. */
const CIUDADES_SIN_FUENTE: { nombre: string; enlace: string }[] = [
  { nombre: 'Valencia', enlace: 'https://www.valencia.es/' },
  { nombre: 'Sevilla', enlace: 'https://www.sevilla.org/' },
  { nombre: 'Zaragoza', enlace: 'https://www.zaragoza.es/' },
  { nombre: 'Valladolid', enlace: 'https://www.valladolid.es/' },
  { nombre: 'Bilbao', enlace: 'https://www.bilbao.eus/' },
];

const consultarOrdenanza = (): CiudadZBE[] =>
  CIUDADES_SIN_FUENTE.map(({ nombre, enlace }) => ({
    nombre,
    acceso: 'consultar',
    detalle:
      'Las restricciones las fija la ordenanza municipal y cambian por fases. No podemos fecharlas desde aquí: consulta la vigente en el portal del ayuntamiento antes de entrar.',
    enlace,
  }));

export const CIUDADES_ZBE: Record<TipoEtiqueta, CiudadZBE[]> = {
  cero: [
    {
      nombre: 'Madrid',
      acceso: 'libre',
      detalle: 'Acceso libre a Madrid ZBE (todas las vías urbanas del municipio) y a la ZBEDEP Distrito Centro, sin restricciones horarias ni por episodios.',
    },
    {
      nombre: 'Barcelona',
      acceso: 'libre',
      detalle: 'Acceso libre a la ZBE Rondes sin restricciones en ningún momento.',
    },
    ...consultarOrdenanza(),
  ],
  eco: [
    {
      nombre: 'Madrid',
      acceso: 'libre',
      detalle: 'Acceso libre a Madrid ZBE (todas las vías urbanas del municipio) y a la ZBEDEP Distrito Centro.',
    },
    {
      nombre: 'Barcelona',
      acceso: 'libre',
      detalle: 'Acceso libre a la ZBE Rondes sin restricciones.',
    },
    ...consultarOrdenanza(),
  ],
  c: [
    {
      nombre: 'Madrid',
      acceso: 'restriccion',
      detalle:
        'Circula por Madrid ZBE (todo el municipio), pero no puede atravesar la ZBEDEP Distrito Centro: solo entrar en ella para estacionar en un aparcamiento público o privado. En episodios de alta contaminación pueden activarse restricciones.',
    },
    {
      nombre: 'Barcelona',
      acceso: 'libre',
      detalle: 'Acceso libre a la ZBE Rondes sin restricciones habituales para etiqueta C.',
    },
    ...consultarOrdenanza(),
  ],
  b: [
    {
      nombre: 'Madrid',
      acceso: 'restriccion',
      detalle:
        'Circula por Madrid ZBE (todo el municipio), pero no puede atravesar la ZBEDEP Distrito Centro: solo entrar en ella para estacionar en un aparcamiento público o privado. En episodios de alta contaminación pueden activarse restricciones.',
    },
    {
      nombre: 'Barcelona',
      acceso: 'libre',
      detalle:
        'Acceso libre: la ZBE Rondes solo restringe, en días laborables de 7:00 a 20:00, a los vehículos sin distintivo ambiental.',
    },
    ...consultarOrdenanza(),
  ],
  ninguna: [
    {
      nombre: 'Madrid',
      acceso: 'prohibido',
      detalle:
        'Circulación prohibida desde el 01/01/2025 en Madrid ZBE, que abarca todas las vías urbanas del municipio, y en la ZBEDEP Distrito Centro, con excepciones (vehículos históricos, adaptados para personas con movilidad reducida…). Las cámaras registran las matrículas infractoras.',
    },
    {
      nombre: 'Barcelona',
      acceso: 'prohibido',
      detalle:
        'Acceso prohibido a la ZBE Rondes en días laborables. Sistema de control automático con cámaras activo.',
    },
    ...consultarOrdenanza(),
  ],
};
