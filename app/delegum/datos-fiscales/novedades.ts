/**
 * Novedades ligadas a las fichas de Datos Fiscales (changelog).
 *
 * Fuente única del registro de cambios normativos. Cada vez que se actualiza el
 * dato de una ficha (sube el SMI, una CCAA cambia el ITP, sale un RDL…), se añade
 * aquí UNA línea con la fecha, el slug de la ficha y el texto del cambio. El
 * componente `NovedadesFicha` muestra, bajo el DataReference de cada ficha, las
 * novedades de esa ficha en orden cronológico inverso.
 *
 * Formato: corto y factual (fecha + qué cambió + norma). Las explicaciones largas
 * ya viven en el cuerpo de la ficha; aquí solo se ANUNCIA el cambio.
 */

export interface Novedad {
  /** Fecha del cambio o de su verificación, ISO YYYY-MM-DD. */
  fecha: string;
  /** Slug de la ficha a la que pertenece. */
  fichaSlug: string;
  /** Texto corto del cambio, con la norma entre paréntesis. */
  texto: string;
}

// Sembrado con los cambios normativos reales recientes. Ampliar al mantener fichas.
export const NOVEDADES: Novedad[] = [
  {
    fecha: '2026-08-19',
    fichaSlug: 'itp-ccaa',
    texto:
      'Murcia: el tipo reducido del 3% para jóvenes se aplica a quienes tengan 40 años o menos —no menos de 35— y NO exige que el inmueble valga como máximo 150.000 €. Los requisitos son que sea vivienda habitual, que la base imponible general menos el mínimo personal y familiar quede por debajo de 40.000 € y que la base del ahorro no supere los 1.800 € (art. 8.6 del texto refundido aprobado por el Decreto Legislativo 1/2010, texto consolidado en BOE-A-2011-10542, última modificación de 24/07/2025).',
  },
  {
    fecha: '2026-08-19',
    fichaSlug: 'itp-ccaa',
    texto:
      'Cataluña: el límite de edad del tipo reducido del 5% para jóvenes subió de 32 a 35 años con efectos del 27 de junio de 2025 —no de 2026—, junto con la escala progresiva del 10/11/12/13% (Decreto-ley 5/2025; tarifas publicadas por la Agencia Tributaria de Cataluña).',
  },
  {
    fecha: '2026-08-19',
    fichaSlug: 'itp-ccaa',
    texto:
      'La Rioja: la primera vivienda habitual de jóvenes menores de 40 años tributa al 4%, y al 3% si el municipio figura en el anexo I de la ley. Antes el beneficio se limitaba a los menores de 36 años (art. 45.3 de la Ley 10/2017, en la redacción de la Ley 1/2025 de medidas urgentes para el acceso a la vivienda, con efectos desde el 03/03/2025; texto consolidado en BOE-A-2017-13750).',
  },
  {
    fecha: '2026-08-13',
    fichaSlug: 'permiso-prestacion-nacimiento',
    texto:
      'La deducción por maternidad del IRPF no exige estar trabajando: desde el 1 de enero de 2023 también da derecho percibir prestación o subsidio de desempleo en el momento del nacimiento, o darse de alta después con 30 días cotizados, en cuyo caso ese mes se suman 150 € adicionales. No se computan los meses en que se perciba por el mismo hijo el complemento de ayuda para la infancia del ingreso mínimo vital (art. 81 de la Ley 35/2006, en la redacción del art. 64 de la Ley 31/2022, BOE-A-2022-22128).',
  },
  {
    fecha: '2026-08-13',
    fichaSlug: 'permiso-prestacion-nacimiento',
    texto:
      'La prestación por nacimiento y cuidado de menor está exenta de IRPF: no se declara ni soporta retención (art. 7.h de la Ley 35/2006, en la redacción del RDL 27/2018, con efectos desde 2018 y ejercicios anteriores no prescritos, tras la STS 1462/2018).',
  },
  {
    fecha: '2026-08-13',
    fichaSlug: 'permiso-prestacion-nacimiento',
    texto:
      'La prestación no contributiva por nacimiento dura 42 días naturales, ampliables en 14 más por familia numerosa, monoparentalidad, parto múltiple o discapacidad igual o superior al 65% —una sola vez aunque concurran varios supuestos—, y su cuantía es el 100% del IPREM salvo que la base reguladora sea inferior (art. 182 de la LGSS, en la redacción del RDL 9/2025, BOE-A-2025-15741).',
  },
  {
    fecha: '2026-08-12',
    fichaSlug: 'pensiones-jubilacion',
    texto:
      'Corregidas las cuantías mínimas de pensión de 2026 conforme al Anexo I del Real Decreto 241/2026: viudedad con cargas familiares 1.256,60 €/mes (cualquier edad), viudedad desde 65 años o discapacidad ≥65% 936,20 €/mes, entre 60 y 64 años 875,90 €/mes y por debajo de 60 sin cargas 709,40 €/mes. La revalorización general de 2026 es del 2,7% (Real Decreto 241/2026, de 25 de marzo, BOE-A-2026-6977).',
  },
  {
    fecha: '2026-08-12',
    fichaSlug: 'sucesiones-isd',
    texto:
      'Madrid aprueba una reducción del 99% en la base imponible por transmisión de empresa individual, negocio profesional o participaciones, extendida a los Grupos I, II y III y a colaterales de cuarto grado, con permanencia de 5 años y participación mínima del 5% individual o 20% del grupo familiar. Es una reducción en base, distinta de la bonificación en cuota por parentesco (Ley 3/2026 de la Comunidad de Madrid, BOE-A-2026-16019, en vigor desde el 1 de julio de 2026).',
  },
  {
    fecha: '2026-08-12',
    fichaSlug: 'donaciones-isd',
    texto:
      'La misma reducción del 99% en base por empresa familiar se aplica a las donaciones en Madrid, con los requisitos de permanencia, participación mínima y formalización en escritura pública (Ley 3/2026 de la Comunidad de Madrid, BOE-A-2026-16019, en vigor desde el 1 de julio de 2026).',
  },
  {
    fecha: '2026-08-12',
    fichaSlug: 'pensiones-jubilacion',
    texto:
      'La jubilación parcial con contrato de relevo ya no exige una edad fija: permite anticipar como máximo tres años sobre la edad ordinaria que corresponda, con 33 años cotizados (25 con discapacidad ≥33%) y 6 de antigüedad en la empresa. La reducción de jornada va del 25% al 75%, y si se anticipa más de dos años, el primer año queda entre el 20% y el 33% (art. 215 LGSS en la redacción del RDL 11/2024, con efectos desde el 1 de abril de 2025).',
  },
  {
    fecha: '2026-07-20',
    fichaSlug: 'cnae-iae',
    texto:
      'Publicada la ficha de códigos de actividad, con los catálogos oficiales completos de CNAE-2025 (RD 10/2025, INE) y de epígrafes del IAE (RD Legislativo 1175/1990, texto consolidado) consultables desde el buscador enlazado.',
  },
  {
    fecha: '2026-07-14',
    fichaSlug: 'prestaciones-dependencia',
    texto:
      'Creado el Grado III+ de dependencia extrema, con un nivel mínimo de protección garantizado de 4.930 €/mes —frente a 90/260/660 € de los Grados I-III— desde el 1 de julio de 2026. Las cuantías de las prestaciones directas al beneficiario (PEVS/PECEF/PAP) no varían (RDL 17/2026, BOE-A-2026-13643).',
  },
  {
    fecha: '2026-07-01',
    fichaSlug: 'interes-legal-demora',
    texto:
      'El interés de demora comercial sube al 10,40% para el segundo semestre de 2026 (2,40% del BCE + 8 puntos), desde el 10,15% del primer semestre, tras elevar el BCE su tipo de referencia (Resolución de 30/06/2026 del Tesoro, BOE-A-2026-14327).',
  },
  {
    fecha: '2026-06-17',
    fichaSlug: 'itp-ccaa',
    texto:
      'Murcia rebaja el ITP general al 7,75% (Ley 3/2025) y la Comunitat Valenciana al 9% para vivienda de hasta 1 M€ —11% por encima— desde el 1 de junio de 2026. Corregidos también los tipos reducidos de Baleares.',
  },
  {
    fecha: '2026-06-13',
    fichaSlug: 'iprem',
    texto:
      'Verificado el IPREM 2026: sigue congelado desde 2022, en 600 €/mes (7.200 € anuales en 12 pagas, 8.400 € en 14).',
  },
  {
    fecha: '2026-04-01',
    fichaSlug: 'smi-salario-minimo',
    texto:
      'Publicado el SMI 2026 en 1.221 €/mes en 14 pagas (17.094 € anuales), por el Real Decreto 126/2026.',
  },
  {
    fecha: '2026-06-10',
    fichaSlug: 'impuesto-sociedades',
    texto:
      'Las microempresas (cifra de negocio < 1 M€) tributan por escala progresiva —19% hasta 50.000 € y 21% el resto en 2026— en lugar del antiguo tipo plano del 23% (Ley 7/2024).',
  },
  {
    fecha: '2026-01-01',
    fichaSlug: 'cuota-autonomos-reta',
    texto:
      'Actualizada la tabla de cotización por ingresos reales 2026. El tipo de cotización del RETA es del 31,5% tras la subida del mecanismo de equidad intergeneracional (MEI).',
  },
  {
    fecha: '2026-01-01',
    fichaSlug: 'pensiones-jubilacion',
    texto:
      'En vigor el sistema dual de cálculo de la base reguladora (transición 2026-2037): la Seguridad Social aplica de oficio la fórmula más favorable (RDL 2/2023). La edad ordinaria en 2026 es de 66 años y 10 meses sin 38 años y 3 meses cotizados.',
  },
  {
    fecha: '2025-07-31',
    fichaSlug: 'permiso-prestacion-nacimiento',
    texto:
      'El permiso por nacimiento se amplía a 19 semanas por progenitor (32 en familias monoparentales), en vigor desde el 31 de julio de 2025 (RDL 9/2025).',
  },
];

/** Devuelve las novedades de una ficha, de la más reciente a la más antigua. */
export function getNovedades(slug: string): Novedad[] {
  return NOVEDADES.filter((n) => n.fichaSlug === slug).sort((a, b) =>
    b.fecha.localeCompare(a.fecha),
  );
}
