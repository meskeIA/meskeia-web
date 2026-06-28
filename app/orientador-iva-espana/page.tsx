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
type TipoIva = '21' | '10' | '4';

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
  const tipoNum = Number(o.tipo);
  const cuotaPlena = (o.base * tipoNum) / 100;

  // ── Operación interior (península + Baleares) ──
  if (o.lugar === 'nacional') {
    if (o.accion === 'emites') {
      return {
        titulo: 'Operación interior — facturas con IVA',
        badge: BADGE_LABEL.repercutido,
        badgeTipo: 'repercutido',
        tipoMostrado: `${o.tipo}%`,
        cuotaFactura: cuotaPlena,
        totalFactura: o.base + cuotaPlena,
        explicacion:
          `Añades el ${o.tipo}% de IVA a tu factura. Ese IVA no es tuyo: lo cobras al cliente y lo ingresas en Hacienda. ` +
          `En tu modelo 303 pagas la diferencia entre el IVA que repercutes y el IVA soportado deducible de tus gastos.`,
        requisitos: [
          'Factura completa con tus datos fiscales y los del cliente',
          'Aplicar el tipo correcto del producto o servicio (21 %, 10 % o 4 %)',
          'Estar dado de alta en el censo de empresarios (modelo 036 / 037)',
        ],
        modelos: ['Modelo 303 — autoliquidación trimestral', 'Modelo 390 — resumen anual'],
        facturaNota: `Base imponible + ${o.tipo}% de IVA, desglosado en la factura.`,
        alerta:
          'Aplicar un tipo menor del que corresponde (por ejemplo 10 % en vez de 21 %) genera una deuda con Hacienda, más recargos e intereses si te inspeccionan.',
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
      tipoMostrado: `${o.tipo}%`,
      cuotaFactura: cuotaPlena,
      totalFactura: o.base + cuotaPlena,
      explicacion:
        `Soportas el ${o.tipo}% de IVA de tu proveedor. Si el gasto está afecto a tu actividad económica, ese IVA es deducible: ` +
        `lo restas del IVA que tú repercutes en tu modelo 303.`,
      requisitos: [
        'Conservar la factura completa a tu nombre',
        'Que el gasto esté vinculado a tu actividad económica',
        'Que tu actividad genere derecho a deducción (no esté exenta)',
      ],
      modelos: ['Modelo 303 — lo incluyes como IVA soportado deducible'],
      facturaNota: `Pagas la base más el ${o.tipo}% de IVA; ese IVA es recuperable si es deducible.`,
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
            tipoMostrado: 'Exenta (0 %)',
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
              'Si el cliente NO está en VIES o no puedes probar el transporte, Hacienda puede exigirte el 21 % como si fuera una venta nacional. Verifica siempre el VIES antes de facturar sin IVA.',
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
        tipoMostrado: `Autorrepercutes el ${o.tipo}%`,
        cuotaFactura: 0,
        totalFactura: o.base,
        notaAutorrepercusion: `Autorrepercutes ${eur(cuotaPlena)} de IVA (${o.tipo}%) en tu modelo 303: lo declaras como IVA devengado y, si es deducible, también como soportado. Efecto neto: 0 €.`,
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
        facturaNota: `La factura del proveedor llega sin IVA: pagas ${eur(o.base)}. El ${o.tipo}% lo reflejas tú en el modelo 303.`,
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
        tipoMostrado: `${o.tipo}% ES · o IVA destino (OSS)`,
        cuotaFactura: cuotaPlena,
        totalFactura: o.base + cuotaPlena,
        explicacion: esBienes
          ? `Vendes a un consumidor final de otro país UE. Mientras tus ventas B2C a toda la UE no superen ${formatNumber(UMBRAL_OSS.importe, 0)} €/año, aplicas el IVA español (${o.tipo}%). Al superar ese umbral, aplicas el IVA del país del comprador y lo declaras por la ventanilla única (OSS).`
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
        facturaNota: `Por debajo de ${formatNumber(UMBRAL_OSS.importe, 0)} €: factura con IVA español (${o.tipo}%). Por encima: IVA del país del cliente.`,
        alerta:
          `Seguir aplicando IVA español tras superar los ${formatNumber(UMBRAL_OSS.importe, 0)} € anuales te obliga a regularizar e ingresar el IVA de cada país de destino. Lleva un control acumulado de tus ventas B2C a la UE.`,
        baseLegal: 'Arts. 68 y 163 quaterdecies y ss. Ley 37/1992 (régimen OSS).',
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
          tipoMostrado: 'Exenta (0 %)',
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
      return {
        titulo: 'Servicios a destinatario fuera de la UE',
        badge: BADGE_LABEL.nosujeto,
        badgeTipo: 'nosujeto',
        tipoMostrado: 'Sin IVA español',
        cuotaFactura: 0,
        totalFactura: o.base,
        explicacion:
          'Por regla general, los servicios prestados a destinatarios establecidos fuera de la UE se localizan fuera del territorio del IVA español, ' +
          'así que facturas sin IVA.',
        requisitos: [
          'Acreditar la condición y ubicación del destinatario',
          'Revisar la regla de uso efectivo (puede recolocar el servicio en España)',
        ],
        modelos: ['Modelo 303 — operaciones no sujetas con derecho a deducción'],
        facturaNota: 'Factura sin IVA; conserva la prueba de dónde está establecido el cliente.',
        alerta:
          'La regla de «uso o explotación efectiva» (art. 70.Dos LIVA) puede hacer que algunos servicios usados en España SÍ lleven IVA español aunque el cliente esté fuera de la UE. Confírmalo según el tipo de servicio.',
        baseLegal: 'Arts. 69-70 Ley 37/1992.',
      };
    }
    // recibes (compras) de fuera de la UE
    if (o.naturaleza === 'bienes') {
      return {
        titulo: 'Importación de bienes (fuera de la UE)',
        badge: BADGE_LABEL.importacion,
        badgeTipo: 'importacion',
        tipoMostrado: `${o.tipo}% en aduana`,
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
        facturaNota: `La factura del proveedor extranjero llega sin IVA; el ${o.tipo}% se liquida en la aduana sobre el valor en aduana.`,
        alerta:
          'El IVA de importación se calcula sobre el valor en aduana (incluidos aranceles y transporte), no solo sobre el precio de la mercancía. La cifra mostrada es orientativa.',
        baseLegal: 'Arts. 17-19 y 83 Ley 37/1992.',
      };
    }
    return {
      titulo: 'Servicios recibidos de fuera de la UE',
      badge: BADGE_LABEL.isp,
      badgeTipo: 'isp',
      tipoMostrado: `Autorrepercutes el ${o.tipo}%`,
      cuotaFactura: 0,
      totalFactura: o.base,
      notaAutorrepercusion: `Autorrepercutes ${eur(cuotaPlena)} de IVA (${o.tipo}%) en tu modelo 303 si el servicio se localiza en España.`,
      explicacion:
        'Si el servicio se localiza en España (regla general para servicios B2B), eres tú quien autorrepercute el IVA mediante la inversión ' +
        'del sujeto pasivo: lo declaras como devengado y, si es deducible, también como soportado.',
      requisitos: [
        'Determinar si el servicio se localiza en España',
        'Recibir la factura del proveedor sin IVA',
      ],
      modelos: ['Modelo 303 — autorrepercusión por inversión del sujeto pasivo'],
      facturaNota: `Pagas ${eur(o.base)} sin IVA al proveedor; el ${o.tipo}% lo reflejas tú en el modelo 303.`,
      alerta:
        'No autorrepercutir servicios contratados a proveedores extranjeros (software, publicidad online, consultoría…) es un olvido habitual y sancionable.',
      baseLegal: 'Arts. 69-70 y 84 Ley 37/1992.',
    };
  }

  // ── Canarias, Ceuta y Melilla ──
  if (o.accion === 'emites') {
    return {
      titulo: 'Venta a Canarias, Ceuta o Melilla',
      badge: BADGE_LABEL.exento,
      badgeTipo: 'exento',
      tipoMostrado: 'Exenta (0 %)',
      cuotaFactura: 0,
      totalFactura: o.base,
      explicacion:
        'Canarias, Ceuta y Melilla están fuera del territorio del IVA. Venderles desde la península se considera exportación: facturas sin IVA. ' +
        'En destino se aplicará el IGIC (Canarias) o el IPSI (Ceuta y Melilla).',
      requisitos: [
        'Documentación de salida de la mercancía (similar a una exportación)',
        'El comprador liquidará el IGIC o el IPSI en destino',
      ],
      modelos: ['Modelo 303 — exportaciones y operaciones asimiladas'],
      facturaNota: 'Factura sin IVA con la mención de operación exenta (art. 21 LIVA).',
      alerta:
        'Si tu empresa está establecida en Canarias, no aplicas IVA sino IGIC: esta herramienta asume que facturas desde el territorio del IVA (península y Baleares).',
      baseLegal: 'Art. 21 Ley 37/1992; régimen IGIC (Ley 20/1991) e IPSI.',
    };
  }
  return {
    titulo: 'Compra a Canarias, Ceuta o Melilla',
    badge: BADGE_LABEL.importacion,
    badgeTipo: 'importacion',
    tipoMostrado: `${o.tipo}% en aduana`,
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
    facturaNota: `El proveedor factura sin IVA; el ${o.tipo}% se liquida en la aduana al entrar en la península.`,
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
  { id: 'cci', label: 'Canarias / Ceuta / Melilla', desc: 'Fuera del IVA' },
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
  const [tipo, setTipo] = useState<TipoIva>('21');
  const [baseTexto, setBaseTexto] = useState('1.000');

  const base = parseSpanishNumber(baseTexto) || 0;

  const opciones: Opciones = { accion, lugar, naturaleza, cliente, tipo, base };
  const resultado = resolver(opciones);

  // El tipo de IVA y la naturaleza solo influyen en algunos escenarios
  const tipoRelevante = resultado.cuotaFactura > 0 || !!resultado.notaAutorrepercusion;

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
                className={`${styles.selectorBtn} ${tipo === String(t.porcentaje) ? styles.selectorBtnActivo : ''}`}
                aria-pressed={tipo === String(t.porcentaje)}
                onClick={() => setTipo(String(t.porcentaje) as TipoIva)}
              >
                <span className={styles.selectorBtnLabel}>{t.porcentaje}%</span>
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
            />
            <span className={styles.baseSufijo}>€</span>
          </div>
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
                {resultado.cuotaFactura > 0 ? eur(resultado.cuotaFactura) : '—'}
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
                  <td>{c.res.cuotaFactura > 0 ? `${eur(c.res.cuotaFactura)} (${c.res.tipoMostrado})` : '—'}</td>
                  <td>{eur(c.res.totalFactura)}</td>
                  <td>{c.res.badge}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.comparativaPie}>
          Canarias, Ceuta y Melilla funcionan como las operaciones de fuera de la UE a efectos de IVA (exportación si
          vendes, importación si compras).
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
                    <td>{t.porcentaje}%</td>
                    <td>{t.ejemplos.join(', ')}.</td>
                  </tr>
                ))}
                <tr>
                  <td>
                    <strong>Exento</strong>
                  </td>
                  <td>0%*</td>
                  <td>Sanidad, educación reglada, seguros, finanzas y alquiler de vivienda (art. 20 LIVA). *Sin derecho a deducir.</td>
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
                IVA pero conservas el derecho a deducir el IVA soportado. Necesitas el DUA que pruebe la salida. Vender a Canarias, Ceuta o Melilla
                también cuenta como exportación a efectos de IVA.
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
                Ciertas actividades del art. 20 LIVA: sanidad, educación reglada, operaciones financieras y de seguros, alquiler de vivienda habitual
                y servicios postales. Es una exención <strong>limitada</strong>: no se repercute IVA, pero tampoco se puede deducir el soportado. No se
                debe confundir con las exportaciones, que sí permiten deducir.
              </dd>
            </div>
            <div className={styles.faqItem}>
              <dt>¿Qué es el recargo de equivalencia?</dt>
              <dd>
                Es un régimen especial obligatorio para comerciantes minoristas (personas físicas) que venden a consumidor final. El proveedor les
                añade en factura el IVA más un recargo ({RECARGO_EQUIVALENCIA.map((r) => `${r.recargo}% sobre el ${r.tipoIVA}%`).join(', ')}). A cambio,
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
                <p>Cuando hay IVA, aplica el 21 %, 10 % o 4 % según el producto o servicio. Ante la duda, consulta el tipo concreto en la AEAT.</p>
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
              <li><strong>Facturar sin IVA a la UE sin comprobar el VIES:</strong> si el cliente no tiene NIF-IVA válido, deberías haber repercutido el 21 %.</li>
              <li><strong>No autorrepercutir compras intracomunitarias o servicios del extranjero:</strong> aunque el efecto neto sea cero, no declararlo es una infracción.</li>
              <li><strong>Aplicar un tipo incorrecto:</strong> usar el 10 % donde corresponde el 21 % genera deuda con Hacienda, recargos e intereses.</li>
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
