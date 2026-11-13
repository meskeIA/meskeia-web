// Datos para el Asistente de Reclamaciones al Consumidor
// Información verificada según legislación española vigente (2024-2025)

export type ProblemType =
  | 'producto_defectuoso'
  | 'cobro_indebido'
  | 'no_entrega'
  | 'no_devolucion'
  | 'publicidad_enganosa'
  | 'otro';

export type PurchaseChannel =
  | 'tienda_fisica'
  | 'online_espana'
  | 'online_ue'
  | 'online_fuera_ue'
  | 'telefono';

export type TimeElapsed =
  | 'menos_14_dias'
  | '14_dias_1_mes'
  | '1_6_meses'
  | '6_meses_3_anos'
  | 'mas_3_anos';

export interface ProblemOption {
  id: ProblemType;
  label: string;
  icon: string;
  description: string;
}

export interface ChannelOption {
  id: PurchaseChannel;
  label: string;
  icon: string;
}

export interface TimeOption {
  id: TimeElapsed;
  label: string;
  icon: string;
}

export interface ReclamationResult {
  title: string;
  rights: string[];
  steps: string[];
  deadline: string;
  organisms: Organism[];
  letterTemplate: string;
  legalReference: string;
}

export interface Organism {
  name: string;
  description: string;
  url: string;
  type: 'nacional' | 'autonomico' | 'europeo';
}

// Opciones de tipo de problema
export const PROBLEM_OPTIONS: ProblemOption[] = [
  {
    id: 'producto_defectuoso',
    label: 'Producto defectuoso o no funciona',
    icon: '🔧',
    description: 'El producto está roto, no funciona correctamente o no es como se describía',
  },
  {
    id: 'cobro_indebido',
    label: 'Cobro indebido o factura incorrecta',
    icon: '💸',
    description: 'Te han cobrado de más, cargos no autorizados o factura con errores',
  },
  {
    id: 'no_entrega',
    label: 'No entregan el producto o servicio',
    icon: '📦',
    description: 'Has pagado pero no recibes lo comprado o el servicio contratado',
  },
  {
    id: 'no_devolucion',
    label: 'No aceptan devolución',
    icon: '🔄',
    description: 'Quieres devolver el producto y no te lo permiten',
  },
  {
    id: 'publicidad_enganosa',
    label: 'Publicidad engañosa',
    icon: '📢',
    description: 'El producto/servicio no coincide con lo anunciado',
  },
  {
    id: 'otro',
    label: 'Otro problema',
    icon: '❓',
    description: 'Cualquier otra incidencia con una compra o servicio',
  },
];

// Opciones de canal de compra
export const CHANNEL_OPTIONS: ChannelOption[] = [
  { id: 'tienda_fisica', label: 'Tienda física', icon: '🏪' },
  { id: 'online_espana', label: 'Online (web española)', icon: '🇪🇸' },
  { id: 'online_ue', label: 'Online (web de la UE)', icon: '🇪🇺' },
  { id: 'online_fuera_ue', label: 'Online (fuera de la UE)', icon: '🌍' },
  { id: 'telefono', label: 'Por teléfono', icon: '📞' },
];

// Opciones de tiempo transcurrido
export const TIME_OPTIONS: TimeOption[] = [
  { id: 'menos_14_dias', label: 'Menos de 14 días', icon: '⏱️' },
  { id: '14_dias_1_mes', label: '14 días - 1 mes', icon: '📅' },
  { id: '1_6_meses', label: '1 - 6 meses', icon: '🗓️' },
  { id: '6_meses_3_anos', label: '6 meses - 3 años', icon: '📆' },
  { id: 'mas_3_anos', label: 'Más de 3 años', icon: '⌛' },
];

// Organismos de reclamación
export const ORGANISMS: Record<string, Organism> = {
  omic: {
    name: 'OMIC (Oficina Municipal de Información al Consumidor)',
    description: 'Servicio gratuito de tu ayuntamiento para orientación y mediación',
    url: 'https://cidoc.consumo.gob.es/directorio-mapas/oficinas-municipales-informacion-consumidor',
    type: 'autonomico',
  },
  consumo_ccaa: {
    name: 'Dirección General de Consumo de tu CCAA',
    description: 'Organismo autonómico para reclamaciones formales',
    url: 'https://www.dsca.gob.es/es/consumo/organismos-autonomicos-consumo',
    type: 'autonomico',
  },
  junta_arbitral: {
    name: 'Junta Arbitral de Consumo',
    description: 'Resolución extrajudicial gratuita y vinculante (si la empresa está adherida)',
    url: 'https://www.dsca.gob.es/es/consumo/como-reclamar-conflicto-consumo/sistema-arbitral-consumo/organos/juntasArbitrales',
    type: 'nacional',
  },
  odr_europeo: {
    name: 'Plataforma ODR (Online Dispute Resolution)',
    description: 'Resolución de conflictos online para compras en la UE',
    url: 'https://ec.europa.eu/consumers/odr/',
    type: 'europeo',
  },
  aecosan: {
    name: 'AECOSAN (Agencia Española de Consumo)',
    description: 'Organismo nacional de referencia en materia de consumo',
    url: 'https://www.consumo.gob.es/',
    type: 'nacional',
  },
  banco_espana: {
    name: 'Banco de España',
    description: 'Para reclamaciones a entidades financieras',
    url: 'https://www.bde.es/bde/es/secciones/servicios/Particulares_702/Servicio_de_Ate_702/',
    type: 'nacional',
  },
};

// Plazos legales importantes
export const LEGAL_DEADLINES = {
  desistimiento_online: {
    days: 14,
    description: 'Derecho de desistimiento en compras online/teléfono (sin dar explicaciones)',
    law: 'Art. 102 TRLGDCU',
  },
  garantia_productos: {
    years: 3,
    description: 'Garantía legal para productos nuevos (desde enero 2022)',
    law: 'Art. 120 TRLGDCU',
  },
  garantia_segunda_mano: {
    years: 1,
    description: 'Garantía mínima para productos de segunda mano',
    law: 'Art. 120.2 TRLGDCU',
  },
  respuesta_reclamacion: {
    days: 30,
    description: 'Plazo máximo para que la empresa responda a tu reclamación',
    law: 'Art. 21 TRLGDCU',
  },
  devolucion_dinero: {
    days: 14,
    description: 'Plazo para devolverte el dinero tras ejercer desistimiento',
    law: 'Art. 107 TRLGDCU',
  },
};

// Función para generar el resultado según las respuestas
export function getReclamationResult(
  problem: ProblemType,
  channel: PurchaseChannel,
  time: TimeElapsed
): ReclamationResult {
  const isOnline = channel !== 'tienda_fisica';
  const isEU = channel === 'online_espana' || channel === 'online_ue';
  const canDesistir = isOnline && (time === 'menos_14_dias');
  const inWarranty = time !== 'mas_3_anos';

  // Resultado base
  let result: ReclamationResult = {
    title: '',
    rights: [],
    steps: [],
    deadline: '',
    organisms: [],
    letterTemplate: '',
    legalReference: '',
  };

  // Lógica según tipo de problema
  switch (problem) {
    case 'producto_defectuoso':
      result.title = 'Reclamación por producto defectuoso';
      if (inWarranty) {
        result.rights = [
          'Tienes derecho a la reparación o sustitución gratuita del producto',
          'Si no es posible, puedes pedir rebaja del precio o devolución del dinero',
          'La garantía legal es de 3 años para productos nuevos',
          'Los primeros 2 años, se presume que el defecto era de origen',
        ];
        result.deadline = 'Garantía legal: 3 años desde la entrega';
        result.legalReference = 'Art. 118-127 TRLGDCU';
      } else {
        result.rights = [
          'La garantía legal de 3 años ha expirado',
          'Podrías reclamar si el defecto es por mala calidad grave',
          'Consulta si el fabricante ofrece garantía comercial adicional',
        ];
        result.deadline = 'Fuera de garantía legal';
      }
      break;

    case 'cobro_indebido':
      result.title = 'Reclamación por cobro indebido';
      result.rights = [
        'Tienes derecho a la devolución íntegra del cobro indebido',
        'Si es un cargo bancario, puedes solicitar retrocesión a tu banco',
        'Puedes reclamar intereses de demora si aplica',
      ];
      result.deadline = 'Reclamación: 4 años para acciones de recobro';
      result.legalReference = 'Art. 1303 Código Civil';
      break;

    case 'no_entrega':
      result.title = 'Reclamación por falta de entrega';
      result.rights = [
        'Plazo máximo de entrega: 30 días si no se acordó otro',
        'Puedes dar un plazo adicional razonable y luego resolver el contrato',
        'Tienes derecho a la devolución de todo lo pagado',
        'Puedes reclamar daños y perjuicios si los hay',
      ];
      result.deadline = 'Entrega máxima: 30 días naturales';
      result.legalReference = 'Art. 66 bis-ter TRLGDCU';
      break;

    case 'no_devolucion':
      result.title = 'Reclamación por denegación de devolución';
      if (canDesistir) {
        result.rights = [
          'En compras online/teléfono tienes 14 días para desistir SIN dar explicaciones',
          'La empresa debe devolverte el dinero en máximo 14 días',
          'No pueden cobrarte penalización por desistir',
          'Solo pagas gastos de devolución si te informaron previamente',
        ];
        result.deadline = '14 días desde recepción del producto';
        result.legalReference = 'Art. 102-108 TRLGDCU';
      } else if (isOnline && time === '14_dias_1_mes') {
        result.rights = [
          'El plazo de 14 días para desistir ha expirado',
          'Solo puedes devolver si el producto está defectuoso (garantía)',
          'O si la empresa tiene política de devolución más amplia',
        ];
        result.deadline = 'Derecho de desistimiento expirado';
      } else {
        result.rights = [
          'En tienda física NO existe derecho de desistimiento legal',
          'La devolución depende de la política de cada comercio',
          'Sí puedes reclamar si el producto está defectuoso (garantía)',
        ];
        result.deadline = 'Sin plazo legal para devolución voluntaria';
      }
      break;

    case 'publicidad_enganosa':
      result.title = 'Reclamación por publicidad engañosa';
      result.rights = [
        'La publicidad forma parte del contrato y es vinculante',
        'Puedes exigir que se cumpla lo prometido en la publicidad',
        'Si no es posible, tienes derecho a resolver el contrato',
        'Puedes denunciar ante Consumo por práctica desleal',
      ];
      result.deadline = 'Sin plazo específico (se aplica garantía general)';
      result.legalReference = 'Art. 61 TRLGDCU y Ley de Competencia Desleal';
      break;

    default:
      result.title = 'Reclamación general de consumo';
      result.rights = [
        'Tienes derecho a presentar una reclamación formal',
        'La empresa debe responderte en máximo 30 días',
        'Puedes acudir a organismos de consumo si no hay solución',
      ];
      result.deadline = 'Respuesta de la empresa: 30 días';
      result.legalReference = 'TRLGDCU (RD Legislativo 1/2007)';
  }

  // Pasos comunes
  result.steps = [
    '1. Contacta primero con el servicio de atención al cliente de la empresa',
    '2. Si no responden o no te satisface, presenta reclamación por escrito',
    '3. Guarda copia de todo: tickets, emails, capturas, conversaciones',
    '4. Acude a la OMIC de tu localidad para orientación gratuita',
    '5. Si no hay acuerdo, presenta reclamación formal ante Consumo',
    '6. Valora el arbitraje de consumo (gratuito y vinculante)',
  ];

  // Organismos según canal
  result.organisms = [ORGANISMS.omic, ORGANISMS.consumo_ccaa, ORGANISMS.junta_arbitral];

  if (isEU) {
    result.organisms.push(ORGANISMS.odr_europeo);
  }

  // Plantilla de carta
  result.letterTemplate = generateLetterTemplate(problem, channel);

  return result;
}

// Genera plantilla de carta de reclamación
function generateLetterTemplate(problem: ProblemType, channel: PurchaseChannel): string {
  const problemTexts: Record<ProblemType, string> = {
    producto_defectuoso: 'el producto adquirido presenta defectos de funcionamiento/fabricación',
    cobro_indebido: 'se ha realizado un cobro indebido o incorrecto en mi cuenta',
    no_entrega: 'no he recibido el producto/servicio contratado dentro del plazo establecido',
    no_devolucion: 'se ha denegado mi solicitud de devolución',
    publicidad_enganosa: 'el producto/servicio no corresponde con lo anunciado en la publicidad',
    otro: 'deseo presentar la siguiente reclamación',
  };

  return `[Tu nombre completo]
[Tu dirección]
[Tu email y teléfono]
[Fecha]

A la atención del Servicio de Atención al Cliente de
[Nombre de la empresa]
[Dirección de la empresa]

ASUNTO: RECLAMACIÓN - [Número de pedido/factura si aplica]

Estimados señores:

Por medio de la presente, me dirijo a ustedes para comunicarles que ${problemTexts[problem]}.

DATOS DE LA COMPRA:
- Fecha de compra: [Indicar fecha]
- Producto/Servicio: [Descripción]
- Importe: [Cantidad] €
- Número de pedido/factura: [Si aplica]

DESCRIPCIÓN DE LOS HECHOS:
[Explicar brevemente qué ha ocurrido]

SOLICITUD:
En virtud de lo establecido en el Real Decreto Legislativo 1/2007, de 16 de noviembre, por el que se aprueba el texto refundido de la Ley General para la Defensa de los Consumidores y Usuarios, SOLICITO:

[Elegir según el caso:]
- La reparación/sustitución del producto defectuoso
- La devolución íntegra del importe abonado ([cantidad] €)
- El cumplimiento de lo ofertado en la publicidad
- [Otra petición específica]

Les ruego me respondan en el plazo máximo de 30 días establecido legalmente. En caso de no recibir respuesta satisfactoria, me veré en la obligación de acudir a los organismos de consumo competentes.

Adjunto copia de [ticket de compra / factura / emails / capturas de pantalla].

A la espera de su pronta respuesta, les saluda atentamente,


[Firma]
[Nombre completo]
DNI: [Tu DNI]`;
}
