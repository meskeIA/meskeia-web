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

export type AccesoZBE = 'libre' | 'restriccion' | 'prohibido';

export interface CiudadZBE {
  nombre: string;
  acceso: AccesoZBE;
  detalle: string;
}

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
    {
      nombre: 'Valencia',
      acceso: 'libre',
      detalle: 'Acceso libre sin restricciones de circulación.',
    },
    {
      nombre: 'Sevilla',
      acceso: 'libre',
      detalle: 'Acceso libre. La ZBE está en proceso de implantación progresiva.',
    },
    {
      nombre: 'Zaragoza',
      acceso: 'libre',
      detalle: 'Acceso libre a la ZBE del centro urbano.',
    },
    {
      nombre: 'Valladolid',
      acceso: 'libre',
      detalle: 'Acceso libre sin restricciones.',
    },
    {
      nombre: 'Bilbao',
      acceso: 'libre',
      detalle: 'Acceso libre a la ZBE del centro y Gran Vía.',
    },
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
    {
      nombre: 'Valencia',
      acceso: 'libre',
      detalle: 'Acceso libre sin restricciones.',
    },
    {
      nombre: 'Sevilla',
      acceso: 'libre',
      detalle: 'Acceso libre. ZBE en implantación progresiva.',
    },
    {
      nombre: 'Zaragoza',
      acceso: 'libre',
      detalle: 'Acceso libre a la ZBE del centro.',
    },
    {
      nombre: 'Valladolid',
      acceso: 'libre',
      detalle: 'Acceso libre sin restricciones.',
    },
    {
      nombre: 'Bilbao',
      acceso: 'libre',
      detalle: 'Acceso libre a la ZBE.',
    },
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
    {
      nombre: 'Valencia',
      acceso: 'libre',
      detalle: 'Acceso libre sin restricciones para etiqueta C.',
    },
    {
      nombre: 'Sevilla',
      acceso: 'libre',
      detalle: 'Acceso libre. ZBE en implantación; etiqueta C no está restringida.',
    },
    {
      nombre: 'Zaragoza',
      acceso: 'libre',
      detalle: 'Acceso libre a la ZBE para etiqueta C.',
    },
    {
      nombre: 'Valladolid',
      acceso: 'libre',
      detalle: 'Acceso libre sin restricciones.',
    },
    {
      nombre: 'Bilbao',
      acceso: 'libre',
      detalle: 'Acceso libre para etiqueta C.',
    },
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
    {
      nombre: 'Valencia',
      acceso: 'restriccion',
      detalle: 'Restricciones de circulación en el área central. Consultar horarios y días concretos en el portal municipal.',
    },
    {
      nombre: 'Sevilla',
      acceso: 'libre',
      detalle:
        'Acceso libre por ahora. La ZBE está en implantación y aún no aplica restricciones para etiqueta B.',
    },
    {
      nombre: 'Zaragoza',
      acceso: 'restriccion',
      detalle: 'Restricciones en determinados horarios y días laborables en la ZBE del centro.',
    },
    {
      nombre: 'Valladolid',
      acceso: 'libre',
      detalle: 'Acceso libre por el momento, aunque la tendencia es endurecer la normativa.',
    },
    {
      nombre: 'Bilbao',
      acceso: 'restriccion',
      detalle: 'Restricciones en horario de mayor tráfico en días laborables dentro de la ZBE.',
    },
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
    {
      nombre: 'Valencia',
      acceso: 'prohibido',
      detalle: 'Acceso prohibido en la ZBE del centro urbano.',
    },
    {
      nombre: 'Sevilla',
      acceso: 'restriccion',
      detalle:
        'Restricciones progresivas en la ZBE en implantación. Se prevé prohibición total en 2025-2026.',
    },
    {
      nombre: 'Zaragoza',
      acceso: 'prohibido',
      detalle: 'Acceso prohibido a la ZBE. Control automático mediante cámaras en los accesos.',
    },
    {
      nombre: 'Valladolid',
      acceso: 'restriccion',
      detalle: 'Restricciones crecientes. Se prevé prohibición total a medida que la ZBE se consolide.',
    },
    {
      nombre: 'Bilbao',
      acceso: 'prohibido',
      detalle: 'Acceso prohibido a la ZBE del centro.',
    },
  ],
};
