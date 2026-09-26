'use client';

import { useState } from 'react';
import styles from './OrientadorIvaEspana.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  DataReference,
  RegionBadge,
  ShareCard,
} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  TIPOS_IVA,
  PORCENTAJES_IVA,
  EXENCIONES_ART20,
  RECARGO_EQUIVALENCIA,
  UMBRAL_OSS,
  FISCAL_IVA_META,
} from '@/data/fiscal';

// ─── Tipos del selector ────────────────────────────────────────────────────────

type Accion = 'emites' | 'recibes';
type Lugar = 'nacional' | 'ue' | 'fuera-ue' | 'cci';
type Naturaleza = 'bienes' | 'servicios';
type Cliente = 'empresa' | 'particular';
/** Porcentaje del tipo elegido: siempre uno de TIPOS_IVA (data/fiscal/iva.ts), nunca un literal. */
type TipoIva = number;

type MecanismoTipo = 'repercutido' | 'soportado' | 'exento' | 'isp' | 'importacion' | 'nosujeto';

interface Opciones {
  accion: Accion;
  lugar: Lugar;
  naturaleza: Naturaleza;
  cliente: Cliente;
  tipo: TipoIva;
  base: number;
}

interface Resultado {
  titulo: string;
  badge: string;
  badgeTipo: MecanismoTipo;
  tipoMostrado: string;
  cuotaFactura: number;
  totalFactura: number;
  notaAutorrepercusion?: string;
  explicacion: string;
  requisitos: string[];
  modelos: string[];
  facturaNota: string;
  alerta: string;
  baseLegal: string;
}

// ─── Utilidades ────────────────────────────────────────────────────────────────

function eur(n: number): string {
  return `${formatNumber(n, 2)} €`;
}

/**
 * Porcentaje con espacio antes del signo, como pide el formato español: «21 %».
 * El espacio es DURO (U+00A0) para que el «%» no salte solo de línea (hallazgo 2129).
 */
function pct(n: number): string {
  return `${formatNumber(n, Number.isInteger(n) ? 0 : 1)} %`;
}

/** «a, b o c» / «a, b y c». */
function enumerar(items: string[], conjuncion: 'o' | 'y'): string {
  if (items.length < 2) return items.join('');
  return `${items.slice(0, -1).join(', ')} ${conjuncion} ${items[items.length - 1]}`;
}

// Textos derivados de data/fiscal/iva.ts: si cambia un tipo o una exención, cambian solos.
const LISTA_TIPOS = enumerar(TIPOS_IVA.map((t) => pct(t.porcentaje)), 'o'); // «21 %, 10 % o 4 %»
const TIPO_GENERAL = pct(PORCENTAJES_IVA.general);
const TIPO_REDUCIDO = pct(PORCENTAJES_IVA.reducido);
const LISTA_EXENCIONES = enumerar(
  EXENCIONES_ART20.map((e) => e.actividad.charAt(0).toLowerCase() + e.actividad.slice(1)),
  'y',
);

const BADGE_LABEL: Record<MecanismoTipo, string> = {
  repercutido: 'IVA repercutido',
  soportado: 'IVA soportado deducible',
  exento: 'Operación exenta',
  isp: 'Inversión del sujeto pasivo',
  importacion: 'IVA a la importación',
  nosujeto: 'No sujeto / fuera de territorio',
};

// ─── Motor de resolución del escenario ──────────────────────────────────────────

function resolver(o: Opciones): Resultado {
  const cuotaPlena = (o.base * o.tipo) / 100;

  // ── Operación interior (península + Baleares) ──
  if (o.lugar === 'nacional') {
    if (o.accion === 'emites') {
      return {
        titulo: 'Operación interior — facturas con IVA',
        badge: BADGE_LABEL.repercutido,
        badgeTipo: 'repercutido',
        tipoMostrado: `${pct(o.tipo)}`,
        cuotaFactura: cuotaPlena,
        totalFactura: o.base + cuotaPlena,
        explicacion:
          `Añades el ${pct(o.tipo)} de IVA a tu factura. Ese IVA no es tuyo: lo cobras al cliente y lo ingresas en Hacienda. ` +
          `En tu modelo 303 pagas la diferencia entre el IVA que repercutes y el IVA soportado deducible de tus gastos.`,
        requisitos: [
          'Factura completa con tus datos fiscales y los del cliente',
          `Aplicar el tipo correcto del producto o servicio (${LISTA_TIPOS})`,
          'Estar dado de alta en el censo de empresarios (modelo 036 / 037)',
        ],
        modelos: ['Modelo 303 — autoliquidación trimestral', 'Modelo 390 — resumen anual'],
        facturaNota: `Base imponible + ${pct(o.tipo)} de IVA, desglosado en la factura.`,
        alerta:
          `Aplicar un tipo menor del que corresponde (por ejemplo ${TIPO_REDUCIDO} en vez de ${TIPO_GENERAL}) genera una deuda con Hacienda, más recargos e intereses si te inspeccionan.`,
        baseLegal: 'Arts. 90-91 Ley 37/1992 del IVA.',
      };
    }
    if (o.cliente === 'particular') {
      return noRepercuteParticular(o.base);
    }
    return {
      titulo: 'Operación interior — IVA soportado deducible',
      badge: BADGE_LABEL.soportado,
      badgeTipo: 'soportado',
      tipoMostrado: `${pct(o.tipo)}`,
      cuotaFactura: cuotaPlena,
      totalFactura: o.base + cuotaPlena,
      explicacion:
        `Soportas el ${pct(o.tipo)} de IVA de tu proveedor. Si el gasto está afecto a tu actividad económica, ese IVA es deducible: ` +
        `lo restas del IVA que tú repercutes en tu modelo 303.`,
      requisitos: [
        'Conservar la factura completa a tu nombre',
        'Que el gasto esté vinculado a tu actividad económica',
        'Que tu actividad genere derecho a deducción (no esté exenta)',
      ],
      modelos: ['Modelo 303 — lo incluyes como IVA soportado deducible'],
      facturaNota: `Pagas la base más el ${pct(o.tipo)} de IVA; ese IVA es recuperable si es deducible.`,
      alerta:
        'Deducir IVA de gastos personales o de facturas incompletas (sin tu NIF) es una de las causas más frecuentes de sanción en una inspección.',
      baseLegal: 'Arts. 92-99 Ley 37/1992 del IVA (deducciones).',
    };
  }

  // ── Operación intracomunitaria (resto de la UE) ──
  if (o.lugar === 'ue') {
    if (o.cliente === 'empresa') {
      if (o.accion === 'emites') {
        if (o.naturaleza === 'bienes') {
          return {
            titulo: 'Entrega intracomunitaria de bienes (B2B)',
            badge: BADGE_LABEL.exento,
            badgeTipo: 'exento',
            tipoMostrado: `Exenta (${pct(0)})`,
            cuotaFactura: 0,
            totalFactura: o.base,
            explicacion:
              'Vendes bienes a una empresa de otro país de la UE: facturas SIN IVA español. Tu cliente autorrepercute el IVA en su país. ' +
              'Es una exención plena, así que conservas el derecho a deducir el IVA soportado relacionado.',
            requisitos: [
              'El cliente debe tener un NIF-IVA válido y verificado en el censo VIES',
              'Estar dado de alta en el ROI (Registro de Operadores Intracomunitarios)',
              'Probar que la mercancía sale de España (CMR, albarán de transporte…)',
            ],
            modelos: [
              'Modelo 303 — casilla de entregas intracomunitarias exentas',
              'Modelo 349 — declaración recapitulativa',
            ],
            facturaNota:
              'Factura sin IVA con la mención «Operación exenta — entrega intracomunitaria, art. 25 LIVA» y el NIF-IVA de ambas partes.',
            alerta:
              `Si el cliente NO está en VIES o no puedes probar el transporte, Hacienda puede exigirte el IVA español (${TIPO_GENERAL} en el tipo general) como si fuera una venta nacional. Verifica siempre el VIES antes de facturar sin IVA.`,
            baseLegal: 'Art. 25 Ley 37/1992; art. 138 Directiva 2006/112/CE.',
          };
        }
        return {
          titulo: 'Servicios a empresa de la UE (B2B)',
          badge: BADGE_LABEL.isp,
          badgeTipo: 'isp',
          tipoMostrado: 'Sin IVA español',
          cuotaFactura: 0,
          totalFactura: o.base,
          explicacion:
            'Por la regla general (art. 69 LIVA), los servicios entre empresas se localizan donde está el cliente. Facturas SIN IVA y es tu cliente ' +
            'quien autorrepercute el IVA en su país mediante la inversión del sujeto pasivo.',
          requisitos: [
            'NIF-IVA del cliente válido en VIES',
            'Alta en el ROI',
            'Indicar la inversión del sujeto pasivo en la factura',
          ],
          modelos: ['Modelo 303', 'Modelo 349 — servicios intracomunitarios'],
          facturaNota:
            'Factura sin IVA con la mención «Inversión del sujeto pasivo, art. 196 Directiva 2006/112/CE».',
          alerta:
            'Algunos servicios NO siguen la regla general (los relacionados con inmuebles, el acceso a eventos, el transporte de pasajeros…). En esos casos el IVA puede ir donde está el inmueble o se presta el servicio.',
          baseLegal: 'Arts. 69-70 Ley 37/1992.',
        };
      }
      // recibes (compras) de empresa UE
      const esBienes = o.naturaleza === 'bienes';
      return {
        titulo: esBienes
          ? 'Adquisición intracomunitaria de bienes (B2B)'
          : 'Servicios recibidos de empresa de la UE (B2B)',
        badge: BADGE_LABEL.isp,
        badgeTipo: 'isp',
        tipoMostrado: `Autorrepercutes el ${pct(o.tipo)}`,
        cuotaFactura: 0,
        totalFactura: o.base,
        notaAutorrepercusion: `Autorrepercutes ${eur(cuotaPlena)} de IVA (${pct(o.tipo)}) en tu modelo 303: lo declaras como IVA devengado y, si es deducible, también como soportado. Efecto neto: 0 €.`,
        explicacion:
          'Tu proveedor te factura SIN IVA. Eres tú quien autorrepercute el IVA español: lo declaras a la vez como IVA devengado y como ' +
          'IVA soportado. Si es deducible, el efecto neto es CERO, pero debes declararlo igualmente.',
        requisitos: [
          'Estar dado de alta en el ROI',
          'Comunicar tu NIF-IVA al proveedor',
          'Recibir la factura del proveedor sin IVA',
        ],
        modelos: [
          'Modelo 303 — IVA devengado y soportado simultáneamente',
          'Modelo 349 — operaciones intracomunitarias',
        ],
        facturaNota: `La factura del proveedor llega sin IVA: pagas ${eur(o.base)}. El ${pct(o.tipo)} lo reflejas tú en el modelo 303.`,
        alerta:
          'Olvidar autorrepercutir el IVA intracomunitario es un error muy común: aunque el efecto neto sea cero, no declararlo es una infracción formal sancionable.',
        baseLegal: 'Arts. 13-16 y 84-85 Ley 37/1992.',
      };
    }
    // particular (B2C) UE
    if (o.accion === 'emites') {
      const esBienes = o.naturaleza === 'bienes';
      return {
        titulo: esBienes
          ? 'Venta a distancia a particular de la UE (B2C)'
          : 'Servicios a particular de la UE (B2C)',
        badge: BADGE_LABEL.repercutido,
        badgeTipo: 'repercutido',
        tipoMostrado: `${pct(o.tipo)} ES · o IVA destino (OSS)`,
        cuotaFactura: cuotaPlena,
        totalFactura: o.base + cuotaPlena,
        explicacion: esBienes
          ? `Vendes a un consumidor final de otro país UE. Mientras tus ventas B2C a toda la UE no superen ${formatNumber(UMBRAL_OSS.importe, 0)} €/año, aplicas el IVA español (${pct(o.tipo)}). Al superar ese umbral, aplicas el IVA del país del comprador y lo declaras por la ventanilla única (OSS).`
          : `Los servicios a particulares de la UE tributan, por regla general, donde estás tú (IVA español). PERO los servicios digitales, de telecomunicaciones y de radio/TV tributan en el país del consumidor si superas ${formatNumber(UMBRAL_OSS.importe, 0)} €/año, vía ventanilla única (OSS).`,
        requisitos: [
          `Controlar el umbral conjunto de ${formatNumber(UMBRAL_OSS.importe, 0)} €/año de ventas B2C a la UE`,
          'Registrarte en el régimen OSS si superas el umbral',
          'Aplicar el tipo de IVA del país de destino una vez superado',
        ],
        modelos: [
          'Modelo 303 — por debajo del umbral',
          'Modelo 369 — ventanilla única (OSS) por encima del umbral',
        ],
        facturaNota: `Por debajo de ${formatNumber(UMBRAL_OSS.importe, 0)} €: factura con IVA español (${pct(o.tipo)}). Por encima: IVA del país del cliente.`,
        alerta:
          `Seguir aplicando IVA español tras superar los ${formatNumber(UMBRAL_OSS.importe, 0)} € anuales te obliga a regularizar e ingresar el IVA de cada país de destino. Lleva un control acumulado de tus ventas B2C a la UE.`,
        // Texto consolidado BOE-A-1992-28740: lugar de la venta a distancia (68.Tres) o del
        // servicio B2C (69.Uno.2.º; los TBE, 70.Uno.8.º), umbral de 10.000 € (73) y régimen de
        // la Unión u OSS (Sección 3.ª del Cap. XI del Tít. IX, arts. 163 unvicies a quatervicies).
        baseLegal: esBienes
          ? 'Arts. 68.Tres y 73 Ley 37/1992; régimen de la Unión (OSS): arts. 163 unvicies a 163 quatervicies.'
          : 'Arts. 69.Uno.2.º, 70.Uno.8.º y 73 Ley 37/1992; régimen de la Unión (OSS): arts. 163 unvicies a 163 quatervicies.',
      };
    }
    // recibes de un particular UE (poco habitual)
    return noRepercuteParticular(o.base);
  }

  // ── Operación extracomunitaria (fuera de la UE) ──
  if (o.lugar === 'fuera-ue') {
    if (o.accion === 'emites') {
      if (o.naturaleza === 'bienes') {
        return {
          titulo: 'Exportación de bienes (fuera de la UE)',
          badge: BADGE_LABEL.exento,
          badgeTipo: 'exento',
          tipoMostrado: `Exenta (${pct(0)})`,
          cuotaFactura: 0,
          totalFactura: o.base,
          explicacion:
            'Las exportaciones de bienes fuera de la UE están exentas de IVA. Es una exención plena: facturas sin IVA pero conservas el ' +
            'derecho a deducir el IVA soportado relacionado con esa venta.',
          requisitos: [
            'Disponer del DUA o documento aduanero que pruebe la salida de la mercancía',
            'Conservar la documentación del transporte internacional',
          ],
          modelos: ['Modelo 303 — casilla de exportaciones y operaciones asimiladas'],
          facturaNota:
            'Factura sin IVA con la mención «Operación exenta — exportación, art. 21 LIVA».',
          alerta:
            'Sin el DUA o la prueba de salida de la mercancía, Hacienda puede negar la exención y exigirte el IVA. Guarda siempre la documentación aduanera.',
          baseLegal: 'Art. 21 Ley 37/1992.',
        };
      }
      if (o.cliente === 'particular') {
        // Art. 69.Uno.2.º LIVA: el servicio a un particular se localiza donde está el prestador.
        // Solo la lista cerrada del art. 69.Dos sale del TAI cuando el particular vive fuera de la UE.
        return {
          titulo: 'Servicios a particular fuera de la UE (B2C)',
          badge: BADGE_LABEL.repercutido,
          badgeTipo: 'repercutido',
          tipoMostrado: `${pct(o.tipo)} · regla general`,
          cuotaFactura: cuotaPlena,
          totalFactura: o.base + cuotaPlena,
          explicacion:
            `Por regla general, un servicio a un particular se localiza donde está establecido quien lo presta (art. 69.Uno.2.º LIVA): si facturas desde la península o Baleares, ` +
            `llevas IVA español (${pct(o.tipo)}) aunque el cliente viva fuera de la UE. La excepción es la lista cerrada del art. 69.Dos —cesión de derechos de autor, patentes y licencias, ` +
            'publicidad, asesoría, consultoría, abogacía y auditoría, tratamiento de datos, traducción, servicios financieros y de seguros, cesión de personal, alquiler de bienes muebles ' +
            'que no sean medios de transporte…—: esos servicios, a un particular establecido fuera de la UE, se facturan sin IVA español.',
          requisitos: [
            'Comprobar si tu servicio figura en la lista del art. 69.Dos LIVA',
            'Si figura: acreditar que el cliente reside fuera de la UE y facturar sin IVA',
            'Revisar si tiene regla especial de localización (art. 70: inmuebles, transporte, restauración, eventos…)',
          ],
          modelos: [
            'Modelo 303 — IVA repercutido (regla general)',
            'Modelo 303 — operaciones no sujetas, si es un servicio del art. 69.Dos',
          ],
          facturaNota: `Regla general: base + ${pct(o.tipo)} de IVA. Servicio de la lista del art. 69.Dos: factura sin IVA con la mención de operación no sujeta.`,
          alerta:
            'Facturar sin IVA a cualquier particular extranjero es un error frecuente: fuera de la lista del art. 69.Dos, el servicio sigue llevando IVA español. ' +
            'Y si es de esa lista pero se utiliza en España, la regla de uso efectivo (art. 70.Dos) lo devuelve al IVA español. Los servicios electrónicos, de ' +
            'telecomunicaciones y de radiodifusión tienen reglas propias (art. 70.Uno.4.º y 8.º): confírmalos en la AEAT.',
          baseLegal: 'Arts. 69.Uno.2.º, 69.Dos y 70.Dos Ley 37/1992.',
        };
      }
      return {
        titulo: 'Servicios a empresa fuera de la UE (B2B)',
        badge: BADGE_LABEL.nosujeto,
        badgeTipo: 'nosujeto',
        tipoMostrado: 'Sin IVA español',
        cuotaFactura: 0,
        totalFactura: o.base,
        explicacion:
          'Un servicio a un empresario o profesional se localiza, por regla general, donde está establecido el destinatario (art. 69.Uno.1.º LIVA). ' +
          'Si tu cliente está fuera de la UE, la operación no está sujeta al IVA español y facturas sin IVA.',
        requisitos: [
          'Acreditar que el cliente es empresario o profesional y dónde está establecido',
          'Revisar la regla de uso efectivo (puede recolocar el servicio en España)',
        ],
        modelos: ['Modelo 303 — operaciones no sujetas por reglas de localización'],
        facturaNota: 'Factura sin IVA; conserva la prueba de dónde está establecido el cliente.',
        alerta:
          'Algunos servicios no siguen la regla general: los relacionados con inmuebles situados en España, el transporte o el acceso a eventos se localizan por su regla especial (art. 70.Uno LIVA), ' +
          'y el alquiler de medios de transporte utilizados en España lleva IVA español por la regla de uso efectivo (art. 70.Dos LIVA) aunque el cliente esté fuera de la UE.',
        baseLegal: 'Arts. 69.Uno.1.º y 70 Ley 37/1992.',
      };
    }
    // recibes (compras) de fuera de la UE
    if (o.naturaleza === 'bienes') {
      return {
        titulo: 'Importación de bienes (fuera de la UE)',
        badge: BADGE_LABEL.importacion,
        badgeTipo: 'importacion',
        tipoMostrado: `${pct(o.tipo)} en aduana`,
        cuotaFactura: cuotaPlena,
        totalFactura: o.base + cuotaPlena,
        explicacion:
          `Al importar bienes pagas el IVA a la importación en la aduana (sobre el valor en aduana más aranceles). Si te acoges al IVA diferido, ` +
          `no lo pagas en la aduana sino que lo declaras en el modelo 303, donde también lo deduces.`,
        requisitos: [
          'Disponer del DUA de importación',
          'El IVA se calcula sobre el valor en aduana más aranceles y otros gastos',
          'Para el IVA diferido: estar acogido a ese régimen y presentar el 303 mensual',
        ],
        modelos: ['DUA de importación (liquidación en aduana)', 'Modelo 303 — si optas por el IVA diferido'],
        facturaNota: `La factura del proveedor extranjero llega sin IVA; el ${pct(o.tipo)} se liquida en la aduana sobre el valor en aduana.`,
        alerta:
          'El IVA de importación se calcula sobre el valor en aduana (incluidos aranceles y transporte), no solo sobre el precio de la mercancía. La cifra mostrada es orientativa.',
        baseLegal: 'Arts. 17-19 y 83 Ley 37/1992.',
      };
    }
    return {
      titulo: 'Servicios recibidos de fuera de la UE',
      badge: BADGE_LABEL.isp,
      badgeTipo: 'isp',
      tipoMostrado: `Autorrepercutes el ${pct(o.tipo)}`,
      cuotaFactura: 0,
      totalFactura: o.base,
      notaAutorrepercusion: `Autorrepercutes ${eur(cuotaPlena)} de IVA (${pct(o.tipo)}) en tu modelo 303 si el servicio se localiza en España.`,
      explicacion:
        'Si el servicio se localiza en España (regla general para servicios B2B), eres tú quien autorrepercute el IVA mediante la inversión ' +
        'del sujeto pasivo: lo declaras como devengado y, si es deducible, también como soportado.',
      requisitos: [
        'Determinar si el servicio se localiza en España',
        'Recibir la factura del proveedor sin IVA',
      ],
      modelos: ['Modelo 303 — autorrepercusión por inversión del sujeto pasivo'],
      facturaNota: `Pagas ${eur(o.base)} sin IVA al proveedor; el ${pct(o.tipo)} lo reflejas tú en el modelo 303.`,
      alerta:
        'No autorrepercutir servicios contratados a proveedores extranjeros (software, publicidad online, consultoría…) es un olvido habitual y sancionable.',
      baseLegal: 'Arts. 69-70 y 84 Ley 37/1992.',
    };
  }

  // ── Canarias, Ceuta y Melilla ──
  // No forman parte del territorio de aplicación del impuesto (art. 3.Dos.1.º LIVA). Eso NO
  // convierte en exportación todo lo que se les factura: la exención del art. 21 es para los
  // BIENES que salen; los SERVICIOS se localizan con las reglas de los arts. 69 y 70.
  if (o.accion === 'emites') {
    if (o.naturaleza === 'bienes') {
      return {
        titulo: 'Venta de bienes a Canarias, Ceuta o Melilla',
        badge: BADGE_LABEL.exento,
        badgeTipo: 'exento',
        tipoMostrado: `Exenta (${pct(0)})`,
        cuotaFactura: 0,
        totalFactura: o.base,
        explicacion:
          'Canarias, Ceuta y Melilla están fuera del territorio de aplicación del IVA (art. 3 LIVA). Enviarles bienes desde la península o Baleares es una exportación ' +
          'exenta (art. 21 LIVA), tanto si el comprador es una empresa como si es un particular: facturas sin IVA. En destino se aplicará el IGIC (Canarias) o el IPSI (Ceuta y Melilla).',
        requisitos: [
          'Documentación aduanera de salida de la mercancía (DUA de exportación)',
          'El comprador liquidará el IGIC o el IPSI en destino',
        ],
        modelos: ['Modelo 303 — exportaciones y operaciones asimiladas'],
        facturaNota: 'Factura sin IVA con la mención de operación exenta (art. 21 LIVA).',
        alerta:
          'Sin el DUA que pruebe la salida de la mercancía, Hacienda puede negar la exención y exigirte el IVA. Si tu empresa está establecida en Canarias, no aplicas IVA sino IGIC: ' +
          'esta herramienta asume que facturas desde el territorio del IVA (península y Baleares).',
        baseLegal: 'Arts. 3 y 21 Ley 37/1992; régimen IGIC (Ley 20/1991) e IPSI.',
      };
    }
    if (o.cliente === 'empresa') {
      return {
        titulo: 'Servicios a empresa de Canarias, Ceuta o Melilla (B2B)',
        badge: BADGE_LABEL.nosujeto,
        badgeTipo: 'nosujeto',
        tipoMostrado: 'No sujeta',
        cuotaFactura: 0,
        totalFactura: o.base,
        explicacion:
          'Un servicio a un empresario o profesional se localiza, por regla general, donde está establecido el destinatario (art. 69.Uno.1.º LIVA). ' +
          'Como Canarias, Ceuta y Melilla no forman parte del territorio del IVA, la operación no está sujeta al IVA español: facturas sin IVA. ' +
          'No es una exportación ni una exención del art. 21, que solo alcanza a los bienes. En destino puede corresponder el IGIC o el IPSI según su propia normativa.',
        requisitos: [
          'Acreditar que el cliente es empresario o profesional establecido allí',
          'Comprobar si el servicio tiene regla especial de localización (art. 70 LIVA: inmuebles, transporte, eventos…)',
        ],
        modelos: ['Modelo 303 — operaciones no sujetas por reglas de localización'],
        facturaNota: 'Factura sin IVA con la mención de operación no sujeta (art. 69.Uno.1.º LIVA).',
        alerta:
          'Los servicios con regla especial se localizan por ella: por ejemplo, los relacionados con un inmueble situado en la península o Baleares llevan IVA español aunque el cliente ' +
          'esté en Canarias, Ceuta o Melilla (art. 70.Uno.1.º LIVA). Si tu empresa está establecida en Canarias, no aplicas IVA sino IGIC.',
        baseLegal: 'Arts. 3 y 69.Uno.1.º Ley 37/1992 (no sujeción por reglas de localización).',
      };
    }
    return {
      titulo: 'Servicios a particular de Canarias, Ceuta o Melilla (B2C)',
      badge: BADGE_LABEL.repercutido,
      badgeTipo: 'repercutido',
      tipoMostrado: pct(o.tipo),
      cuotaFactura: cuotaPlena,
      totalFactura: o.base + cuotaPlena,
      explicacion:
        `Un servicio a un particular se localiza donde está establecido quien lo presta (art. 69.Uno.2.º LIVA): si facturas desde la península o Baleares, llevas IVA español (${pct(o.tipo)}). ` +
        'La excepción que saca del IVA español algunos servicios a particulares de fuera de la UE (asesoría, publicidad, traducción, cesión de derechos… art. 69.Dos) ' +
        'excluye expresamente a los destinatarios de Canarias, Ceuta o Melilla.',
      requisitos: [
        'Factura con IVA español, igual que en una operación interior',
        'Comprobar si el servicio tiene regla especial de localización (art. 70 LIVA: inmuebles, transporte, restauración, eventos…)',
        'Si es un servicio electrónico, de telecomunicaciones o de radiodifusión (software, suscripciones, descargas, streaming…), esta respuesta NO vale: ver el aviso',
      ],
      modelos: ['Modelo 303 — IVA repercutido'],
      facturaNota: `Base imponible + ${pct(o.tipo)} de IVA, desglosado en la factura.`,
      alerta:
        'Facturar sin IVA a un particular de Canarias, Ceuta o Melilla como si fuera una exportación es un error: la exención del art. 21 LIVA es solo para bienes que salen del territorio. ' +
        'Los servicios con regla especial se localizan por ella (por ejemplo, los relacionados con un inmueble situado en Canarias). ' +
        'Y los servicios prestados por vía electrónica a un particular que reside en Canarias los localiza en Canarias la propia ley del IGIC (art. 17 Ley 20/1991), ' +
        'esté donde esté quien los presta: tributan por IGIC, no por IVA. Los de telecomunicaciones y radiodifusión también tienen reglas propias, y en Ceuta y Melilla ' +
        'manda la ordenanza del IPSI de cada ciudad. Esta herramienta no resuelve esos casos: confírmalos con la Agencia Tributaria Canaria o la AEAT antes de facturar.',
      baseLegal: 'Arts. 69.Uno.2.º y 69.Dos Ley 37/1992; tipos, arts. 90-91; servicios electrónicos: art. 17 Ley 20/1991 (IGIC).',
    };
  }
  if (o.naturaleza === 'servicios') {
    if (o.cliente === 'particular') {
      return noRepercuteParticular(o.base);
    }
    // Servicio B2B recibido: se localiza en España (art. 69.Uno.1.º) y, como el prestador no está
    // establecido en el territorio del IVA, el sujeto pasivo eres tú (art. 84.Uno.2.º a).
    return {
      titulo: 'Servicios recibidos de Canarias, Ceuta o Melilla',
      badge: BADGE_LABEL.isp,
      badgeTipo: 'isp',
      tipoMostrado: `Autorrepercutes el ${pct(o.tipo)}`,
      cuotaFactura: 0,
      totalFactura: o.base,
      notaAutorrepercusion: `Autorrepercutes ${eur(cuotaPlena)} de IVA (${pct(o.tipo)}) en tu modelo 303 si el servicio se localiza en España.`,
      explicacion:
        'Un servicio que contratas como empresario se localiza donde estás establecido tú (art. 69.Uno.1.º LIVA). Como el proveedor no está establecido en el territorio del IVA, ' +
        'eres tú quien autorrepercute el IVA mediante la inversión del sujeto pasivo (art. 84.Uno.2.º LIVA): lo declaras como devengado y, si es deducible, también como soportado.',
      requisitos: [
        'Determinar si el servicio se localiza en España (regla general B2B o regla especial del art. 70)',
        'Recibir la factura del proveedor sin IVA',
      ],
      modelos: ['Modelo 303 — autorrepercusión por inversión del sujeto pasivo'],
      facturaNota: `Pagas ${eur(o.base)} sin IVA al proveedor; el ${pct(o.tipo)} lo reflejas tú en el modelo 303.`,
      alerta:
        'Un servicio no pasa por la aduana: no hay IVA a la importación. Olvidar autorrepercutirlo es un error habitual y sancionable aunque el efecto neto sea cero.',
      baseLegal: 'Arts. 69.Uno.1.º y 84.Uno.2.º Ley 37/1992.',
    };
  }
  return {
    titulo: 'Compra de bienes a Canarias, Ceuta o Melilla',
    badge: BADGE_LABEL.importacion,
    badgeTipo: 'importacion',
    tipoMostrado: `${pct(o.tipo)} en aduana`,
    cuotaFactura: cuotaPlena,
    totalFactura: o.base + cuotaPlena,
    explicacion:
      'Comprar bienes a Canarias, Ceuta o Melilla y traerlos a la península equivale a una importación: pagas el IVA a la importación en la aduana ' +
      'sobre el valor en aduana de la mercancía.',
    requisitos: [
      'Disponer del DUA de importación',
      'El IVA se liquida sobre el valor en aduana más gastos asociados',
    ],
    modelos: ['DUA de importación', 'Modelo 303 — si optas por el IVA diferido'],
    facturaNota: `El proveedor factura sin IVA; el ${pct(o.tipo)} se liquida en la aduana al entrar en la península.`,
    alerta:
      'El cálculo es orientativo: el IVA de importación se aplica sobre el valor en aduana, que puede incluir transporte y otros gastos además del precio.',
    baseLegal: 'Arts. 17-19 y 83 Ley 37/1992.',
  };
}

function noRepercuteParticular(base: number): Resultado {
  return {
    titulo: 'Compra a un particular — sin IVA',
    badge: BADGE_LABEL.nosujeto,
    badgeTipo: 'nosujeto',
    tipoMostrado: 'Sin IVA',
    cuotaFactura: 0,
    totalFactura: base,
    explicacion:
      'Un particular (o un profesional acogido a una exención) no repercute IVA. Por tanto, en esa compra no hay IVA que soportar ni, en consecuencia, IVA deducible.',
    requisitos: [
      'Si compras a un particular, normalmente no hay factura con IVA',
      'Comprueba si la operación tributa por otro impuesto (por ejemplo, ITP en bienes de segunda mano entre particulares)',
    ],
    modelos: ['No genera IVA a declarar'],
    facturaNota: 'Sin IVA: el importe que pagas es el precio acordado, sin desglose de impuesto.',
    alerta:
      'No puedes deducir IVA de una compra a un particular porque no existe IVA repercutido. Algunas compras entre particulares tributan por ITP en lugar de IVA.',
    baseLegal: 'Art. 4-5 Ley 37/1992 (concepto de empresario o profesional).',
  };
}

// ─── Definición de los selectores ────────────────────────────────────────────────

const OPCIONES_ACCION: { id: Accion; label: string; desc: string }[] = [
  { id: 'emites', label: 'Emito la factura', desc: 'Vendo / presto el servicio' },
  { id: 'recibes', label: 'Recibo la factura', desc: 'Compro / contrato' },
];

const OPCIONES_LUGAR: { id: Lugar; label: string; desc: string }[] = [
  { id: 'nacional', label: 'España', desc: 'Península y Baleares' },
  { id: 'ue', label: 'Resto de la UE', desc: 'País comunitario' },
  { id: 'fuera-ue', label: 'Fuera de la UE', desc: 'Export./import.' },
  { id: 'cci', label: 'Canarias / Ceuta / Melilla', desc: 'IGIC / IPSI' },
];

const OPCIONES_NATURALEZA: { id: Naturaleza; label: string }[] = [
  { id: 'bienes', label: 'Bienes (productos)' },
  { id: 'servicios', label: 'Servicios' },
];

const OPCIONES_CLIENTE: { id: Cliente; label: string; desc: string }[] = [
  { id: 'empresa', label: 'Empresa / autónomo', desc: 'B2B' },
  { id: 'particular', label: 'Particular', desc: 'Consumidor final (B2C)' },
];

const COMPARATIVA_LUGARES: { id: Lugar; label: string }[] = [
  { id: 'nacional', label: 'España' },
  { id: 'ue', label: 'Resto UE' },
  { id: 'fuera-ue', label: 'Fuera UE' },
  { id: 'cci', label: 'Canarias / Ceuta / Melilla' },
];

// ─── Componente de grupo de botones segmentados ──────────────────────────────────

interface SelectorProps<T extends string> {
  label: string;
  valor: T;
  opciones: { id: T; label: string; desc?: string }[];
  onChange: (v: T) => void;
}

function Selector<T extends string>({ label, valor, opciones, onChange }: SelectorProps<T>) {
  return (
    <div className={styles.selectorGroup}>
      <span className={styles.selectorLabel}>{label}</span>
      <div className={styles.selectorBotones} role="group" aria-label={label}>
        {opciones.map((op) => (
          <button
            key={op.id}
            type="button"
            className={`${styles.selectorBtn} ${valor === op.id ? styles.selectorBtnActivo : ''}`}
            aria-pressed={valor === op.id}
            onClick={() => onChange(op.id)}
          >
            <span className={styles.selectorBtnLabel}>{op.label}</span>
            {op.desc && <span className={styles.selectorBtnDesc}>{op.desc}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────────

export default function OrientadorIvaEspanaPage() {
  const [accion, setAccion] = useState<Accion>('emites');
  const [lugar, setLugar] = useState<Lugar>('nacional');
  const [naturaleza, setNaturaleza] = useState<Naturaleza>('bienes');
  const [cliente, setCliente] = useState<Cliente>('empresa');
  const [tipo, setTipo] = useState<TipoIva>(PORCENTAJES_IVA.general);
  const [baseTexto, setBaseTexto] = useState('1.000');

  // Una base vacía, ilegible o negativa no se calcula en silencio: se avisa y la factura se
  // pinta con 0,00 €, que cuadra consigo misma (base + IVA = total).
  const baseTextoLimpio = baseTexto.trim();
  const baseLeida = baseTextoLimpio === '' ? NaN : parseSpanishNumber(baseTextoLimpio);
  let avisoBase: string | null = null;
  if (baseTextoLimpio === '') {
    avisoBase = 'Escribe la base imponible (importe sin IVA) para ver cómo queda la factura.';
  } else if (!Number.isFinite(baseLeida)) {
    avisoBase = `«${baseTextoLimpio}» no es un importe válido. Escribe una cifra, por ejemplo 1.250,50.`;
  } else if (baseLeida < 0) {
    avisoBase = 'La base imponible no puede ser negativa: este orientador no calcula facturas rectificativas ni abonos. Escribe el importe en positivo.';
  }
  const base = avisoBase ? 0 : baseLeida;

  const opciones: Opciones = { accion, lugar, naturaleza, cliente, tipo, base };
  const resultado = resolver(opciones);

  // El tipo de IVA y la naturaleza solo influyen en algunos escenarios
  // Se sondea con base 1 para que una base a 0 no haga creer que el tipo no influye.
  const sonda = resolver({ ...opciones, base: 1 });
  const tipoRelevante = sonda.cuotaFactura !== 0 || !!sonda.notaAutorrepercusion;

  // Comparativa del mismo importe en los tres ámbitos principales
  const comparativa = COMPARATIVA_LUGARES.map((l) => ({
    ...l,
    res: resolver({ ...opciones, lugar: l.id }),
  }));

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">🧭</span> Orientador del IVA en España
        </h1>
        <p className={styles.subtitle}>
          Descubre qué IVA aplicar en cada operación —nacional, intracomunitaria, exportación o importación— y mira cómo
          queda la factura. Pensado para autónomos y nuevas empresas.
        </p>
      </header>

      <RegionBadge variant="es-only" />

      <LegalNotice />

      <DisclaimerCard variant="financial" severity="critical" collapsible={false} />
      <DataReference
        normativa={`IVA ${FISCAL_IVA_META.vigencia}`}
        fuente={FISCAL_IVA_META.fuente}
        verificado={FISCAL_IVA_META.verificado}
        urlOficial={FISCAL_IVA_META.urlOficial}
        nota={FISCAL_IVA_META.nota}
      />

      {/* ── Simulador ── */}
      <section className={styles.simulador} aria-label="Configura tu operación">
        <h2 className={styles.simuladorTitulo}>Configura tu operación</h2>

        <Selector label="¿Qué haces en esta operación?" valor={accion} opciones={OPCIONES_ACCION} onChange={setAccion} />
        <Selector label="¿Dónde está la otra parte?" valor={lugar} opciones={OPCIONES_LUGAR} onChange={setLugar} />
        <Selector label="¿Qué entregas o contratas?" valor={naturaleza} opciones={OPCIONES_NATURALEZA} onChange={setNaturaleza} />
        <Selector label="¿Quién es la otra parte?" valor={cliente} opciones={OPCIONES_CLIENTE} onChange={setCliente} />

        <div className={styles.selectorGroup}>
          <span className={styles.selectorLabel}>
            Tipo de IVA aplicable {!tipoRelevante && <em className={styles.selectorNota}>(no influye en este escenario)</em>}
          </span>
          <div className={styles.selectorBotones} role="group" aria-label="Tipo de IVA">
            {TIPOS_IVA.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`${styles.selectorBtn} ${tipo === t.porcentaje ? styles.selectorBtnActivo : ''}`}
                aria-pressed={tipo === t.porcentaje}
                onClick={() => setTipo(t.porcentaje)}
              >
                <span className={styles.selectorBtnLabel}>{pct(t.porcentaje)}</span>
                <span className={styles.selectorBtnDesc}>{t.nombre.replace('Tipo ', '')}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.baseGroup}>
          <label htmlFor="base-imponible" className={styles.selectorLabel}>
            Base imponible (importe sin IVA)
          </label>
          <div className={styles.baseInputWrapper}>
            <input
              id="base-imponible"
              type="text"
              inputMode="decimal"
              className={styles.baseInput}
              value={baseTexto}
              onChange={(e) => setBaseTexto(e.target.value)}
              placeholder="1.000"
              aria-invalid={avisoBase ? true : undefined}
              aria-describedby={avisoBase ? 'base-aviso' : undefined}
            />
            <span className={styles.baseSufijo}>€</span>
          </div>
          {avisoBase && (
            <p id="base-aviso" className={styles.baseAviso} role="alert">
              {avisoBase}
            </p>
          )}
        </div>
      </section>

      {/* ── Resultado: factura + detalle ── */}
      <section className={styles.resultado} aria-label="Resultado de la operación">
        <div className={`${styles.resultadoHeader} ${styles[`mec_${resultado.badgeTipo}`]}`}>
          <h2 className={styles.resultadoTitulo}>{resultado.titulo}</h2>
          <span className={styles.resultadoBadge}>{resultado.badge}</span>
        </div>

        <div className={styles.resultadoCuerpo}>
          {/* Factura visual */}
          <div className={styles.factura}>
            <span className={styles.facturaCabecera}>Cómo queda la factura</span>
            <div className={styles.facturaLinea}>
              <span>Base imponible</span>
              <span className={styles.facturaImporte}>{eur(base)}</span>
            </div>
            <div className={styles.facturaLinea}>
              <span>
                IVA <strong>{resultado.tipoMostrado}</strong>
              </span>
              <span className={styles.facturaImporte}>
                {resultado.cuotaFactura !== 0 ? eur(resultado.cuotaFactura) : '—'}
              </span>
            </div>
            <div className={`${styles.facturaLinea} ${styles.facturaTotal}`}>
              <span>Total factura</span>
              <span className={styles.facturaImporte}>{eur(resultado.totalFactura)}</span>
            </div>
            {resultado.notaAutorrepercusion && (
              <p className={styles.facturaAutorrep}>
                <span aria-hidden="true">🔁</span> {resultado.notaAutorrepercusion}
              </p>
            )}
            <p className={styles.facturaNota}>{resultado.facturaNota}</p>
          </div>

          {/* Detalle */}
          <div className={styles.detalle}>
            <p className={styles.detalleExplicacion}>{resultado.explicacion}</p>

            <div className={styles.detalleBloque}>
              <h3 className={styles.detalleSubtitulo}>Requisitos clave</h3>
              <ul className={styles.detalleLista}>
                {resultado.requisitos.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>

            <div className={styles.detalleBloque}>
              <h3 className={styles.detalleSubtitulo}>Modelos a presentar</h3>
              <div className={styles.modelosChips}>
                {resultado.modelos.map((m, i) => (
                  <span key={i} className={styles.modeloChip}>
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.alertaBox}>
              <span className={styles.alertaIcon} aria-hidden="true">⚠️</span>
              <div>
                <strong>Si te equivocas:</strong> {resultado.alerta}
              </div>
            </div>

            <p className={styles.baseLegal}>
              <span aria-hidden="true">⚖️</span> {resultado.baseLegal}
            </p>
          </div>
        </div>
      </section>

      {/* ── Comparativa por ámbito ── */}
      <section className={styles.comparativa} aria-label="Comparativa del mismo importe por ámbito">
        <h2 className={styles.comparativaTitulo}>El mismo importe en distintos ámbitos</h2>
        <p className={styles.comparativaIntro}>
          Una misma base imponible de <strong>{eur(base)}</strong> ({accion === 'emites' ? 'que emites' : 'que recibes'},{' '}
          {naturaleza}, {cliente === 'empresa' ? 'B2B' : 'B2C'}) cambia por completo según dónde esté la otra parte:
        </p>
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Ámbito</th>
                <th>IVA en factura</th>
                <th>Total factura</th>
                <th>Mecanismo</th>
              </tr>
            </thead>
            <tbody>
              {comparativa.map((c) => (
                <tr key={c.id} className={c.id === lugar ? styles.filaActiva : ''}>
                  <td>
                    <strong>{c.label}</strong>
                  </td>
                  <td>{c.res.cuotaFactura !== 0 ? `${eur(c.res.cuotaFactura)} (${c.res.tipoMostrado})` : '—'}</td>
                  <td>{eur(c.res.totalFactura)}</td>
                  <td>{c.res.badge}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.comparativaPie}>
          Canarias, Ceuta y Melilla no forman parte del territorio del IVA: los bienes salen como exportación y entran como
          importación, igual que con un país de fuera de la UE. Los servicios, en cambio, siguen las reglas de localización
          (arts. 69 y 70 LIVA): a una empresa de allí se facturan sin IVA, y a un particular, en general, con IVA español. La
          excepción son los servicios electrónicos, de telecomunicaciones y de radiodifusión a un particular que reside allí: no
          se localizan en el territorio del IVA (art. 70.Uno.4.º LIVA) y, en Canarias, tributan por IGIC (art. 17 Ley 20/1991).
        </p>
      </section>

      {/* ── Sección educativa v2.0 ── */}
      <EducationalSection
        title="Guía del IVA para autónomos y nuevas empresas"
        subtitle="Conceptos clave para no equivocarte al facturar"
      >
        {/* Tabla comparativa de tipos */}
        <section className={styles.guideSection}>
          <h2>Los tres tipos de IVA en España</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>%</th>
                  <th>Ejemplos habituales</th>
                </tr>
              </thead>
              <tbody>
                {TIPOS_IVA.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <strong>{t.nombre}</strong>
                    </td>
                    <td>{pct(t.porcentaje)}</td>
                    <td>{t.ejemplos.join(', ')}.</td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <strong>Exento</strong>
                  </td>
                  <td>{pct(0)}*</td>
                  <td>
                    {LISTA_EXENCIONES.charAt(0).toUpperCase() + LISTA_EXENCIONES.slice(1)} (art. 20 LIVA). *Sin derecho a deducir.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Escenarios */}
        <section className={styles.guideSection}>
          <h2>¿A quién le sirve este orientador?</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🆕</span>
              <h3>Nuevo autónomo</h3>
              <p>Acabas de darte de alta y no sabes qué tipo aplicar ni qué casillas del modelo 303 te afectan. Empieza por las operaciones nacionales.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">💻</span>
              <h3>Freelance digital</h3>
              <p>Facturas servicios a clientes de la UE o de EE. UU. Aquí ves cuándo facturar sin IVA y cuándo aplica la inversión del sujeto pasivo.</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">📦</span>
              <h3>E-commerce / tienda online</h3>
              <p>Vendes a particulares de toda la UE. Controla el umbral de {formatNumber(UMBRAL_OSS.importe, 0)} € y el régimen de ventanilla única (OSS).</p>
            </div>
            <div className={styles.escenarioCard}>
              <span className={styles.escenarioIcon} aria-hidden="true">🌍</span>
              <h3>Importador / exportador</h3>
              <p>Compras mercancía fuera de la UE o vendes al exterior. Entiende el IVA a la importación y la exención de las exportaciones.</p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <dl className={styles.faqList}>
            <div className={styles.faqItem}>
              <dt>¿Qué diferencia hay entre IVA repercutido y soportado?</dt>
              <dd>
                El <strong>IVA repercutido</strong> es el que cobras a tus clientes en tus ventas y debes ingresar en Hacienda. El{' '}
                <strong>IVA soportado</strong> es el que pagas en tus compras y gastos de la actividad, y es deducible. En el modelo 303
                ingresas la diferencia entre ambos.
                <span className={styles.faqTip}>Si en un trimestre soportas más IVA del que repercutes, el resultado sale a tu favor (a compensar o a devolver).</span>
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Tengo que poner IVA si facturo a una empresa de otro país de la UE?</dt>
              <dd>
                No, si se cumplen los requisitos. En una entrega intracomunitaria de bienes o un servicio B2B facturas sin IVA y el cliente
                autorrepercute en su país (inversión del sujeto pasivo). El cliente debe tener un <strong>NIF-IVA válido en VIES</strong>, tú debes
                estar en el <strong>ROI</strong> y presentar el <strong>modelo 349</strong>.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Las exportaciones llevan IVA?</dt>
              <dd>
                No. Las exportaciones de bienes fuera de la UE están exentas (art. 21 LIVA). Es una exención <strong>plena</strong>: facturas sin
                IVA pero conservas el derecho a deducir el IVA soportado. Necesitas el DUA que pruebe la salida. Enviar bienes a Canarias, Ceuta o
                Melilla también cuenta como exportación; prestarles servicios, no: a un particular de allí se le factura, en general, con IVA
                español (art. 69 LIVA). Salvo los servicios electrónicos, de telecomunicaciones y de radiodifusión, que no llevan IVA español si
                el particular reside allí (art. 70.Uno.4.º LIVA): en Canarias tributan por IGIC (art. 17 Ley 20/1991).
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué es la inversión del sujeto pasivo?</dt>
              <dd>
                Es cuando quien declara el IVA no es el vendedor, sino el comprador. El vendedor factura sin IVA y el comprador lo "autorrepercute":
                lo declara a la vez como IVA devengado y soportado, con efecto neto cero si es deducible. Aparece en adquisiciones intracomunitarias,
                servicios recibidos del extranjero y operaciones interiores como ejecuciones de obra inmobiliaria o entrega de chatarra.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Quién está exento de aplicar IVA?</dt>
              <dd>
                Ciertas actividades del art. 20 LIVA: {LISTA_EXENCIONES}. Es una exención <strong>limitada</strong>: no se repercute IVA, pero tampoco se puede deducir el soportado. No se
                debe confundir con las exportaciones, que sí permiten deducir.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué es el recargo de equivalencia?</dt>
              <dd>
                Es un régimen especial obligatorio para comerciantes minoristas (personas físicas) que venden a consumidor final. El proveedor les
                añade en factura el IVA más un recargo ({RECARGO_EQUIVALENCIA.map((r) => `${pct(r.recargo)} sobre el ${pct(r.tipoIVA)}`).join(', ')}). A cambio,
                el minorista no presenta declaraciones de IVA ni puede deducir el IVA soportado.
              </dd>
            </div>
          </dl>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo decidir qué IVA aplicar</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>¿Emites o recibes la factura?</strong>
                <p>Si vendes, repercutes IVA; si compras, lo soportas. La mecánica cambia por completo según tu posición.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>¿Dónde está la otra parte?</strong>
                <p>España, otro país de la UE, fuera de la UE o Canarias/Ceuta/Melilla. Es el factor que más altera el resultado.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>¿Bienes o servicios? ¿Empresa o particular?</strong>
                <p>En las operaciones intracomunitarias y exteriores, esta combinación decide si hay exención, inversión del sujeto pasivo o IVA normal.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Identifica el tipo aplicable</strong>
                <p>Cuando hay IVA, aplica el {LISTA_TIPOS} según el producto o servicio. Ante la duda, consulta el tipo concreto en la AEAT.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Anota los modelos y requisitos</strong>
                <p>VIES, ROI, DUA, modelo 349 o 369… cada operación tiene sus obligaciones formales. No basta con poner (o no) el IVA en la factura.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Tips */}
        <section className={styles.guideSection}>
          <h2>Buenas prácticas con el IVA</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔎</span>
              <p><strong>Verifica el VIES antes de facturar sin IVA</strong> a un cliente de la UE. Sin NIF-IVA válido, la operación deja de estar exenta.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📁</span>
              <p><strong>Guarda las pruebas de transporte y los DUA.</strong> En exportaciones e intracomunitarias, la documentación es lo que justifica la exención.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🗓️</span>
              <p><strong>Lleva un control del umbral OSS</strong> ({formatNumber(UMBRAL_OSS.importe, 0)} €/año) si vendes a particulares de la UE, para saber cuándo cambiar de IVA.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧾</span>
              <p><strong>Separa siempre base e IVA en tus registros.</strong> Facilita el modelo 303 y evita errores al calcular lo que debes ingresar.</p>
            </div>
          </div>
        </section>

        {/* Warning box */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h2>Errores frecuentes con el IVA</h2>
            </div>
            <ul className={styles.warningList}>
              <li><strong>Facturar sin IVA a la UE sin comprobar el VIES:</strong> si el cliente no tiene NIF-IVA válido, deberías haber repercutido el IVA español (el {TIPO_GENERAL} en el tipo general).</li>
              <li><strong>No autorrepercutir compras intracomunitarias o servicios del extranjero:</strong> aunque el efecto neto sea cero, no declararlo es una infracción.</li>
              <li><strong>Aplicar un tipo incorrecto:</strong> usar el {TIPO_REDUCIDO} donde corresponde el {TIPO_GENERAL} genera deuda con Hacienda, recargos e intereses.</li>
              <li><strong>Deducir IVA de gastos no afectos o sin factura completa:</strong> comidas particulares, gastos mixtos sin justificación o tickets sin tu NIF.</li>
              <li><strong>Olvidar el modelo 349:</strong> las operaciones intracomunitarias se declaran además en la recapitulativa, no solo en el 303.</li>
              <li><strong>Confundir exención (art. 20) con exportación (art. 21):</strong> la primera no permite deducir el IVA soportado; la segunda sí.</li>
            </ul>
          </div>
        </section>

        {/* Exenciones detalle */}
        <section className={styles.guideSection}>
          <h2>Actividades exentas de IVA (art. 20 LIVA)</h2>
          <p className={styles.exencionesIntro}>
            Estas actividades no repercuten IVA, pero —a diferencia de las exportaciones— tampoco permiten deducir el IVA soportado:
          </p>
          <div className={styles.escenariosGrid}>
            {EXENCIONES_ART20.map((ex) => (
              <div key={ex.actividad} className={styles.escenarioCard}>
                <h3>{ex.actividad}</h3>
                <p>{ex.detalle}</p>
              </div>
            ))}
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('orientador-iva-espana')} />
      <ShareCard appName="orientador-iva-espana" />
      <Footer appName="orientador-iva-espana" />
    </div>
  );
}
