// Tabla de aceites de la calculadora de jabón — GENERADA, no editar a mano.
//
// Índices de saponificación (g de álcali por g de aceite), perfil de ácidos grasos (%), índice
// de yodo e INS en el formato de SoapCalc, tomados de la tabla abierta de mikewolfd/soap-calc
// (data/oils.json, licencia MIT). Cotejados aceite a aceite el 11/10/2026 con
// https://soapcalc.net/oil-list: los 21 índices que publica soapcalc.net coinciden exactamente
// (la manteca de cacao no aparece en esa lista). Segundo cotejo con la tabla de
// https://www.fromnaturewithlove.com/resources/sapon.asp: coincide salvo en palmiste (0,145)
// y colza (0,123), donde esa tabla se aparta del índice publicado; se mantiene el de SoapCalc.
//
// Son PROMEDIOS: el índice real varía con el origen y el refinado del aceite. El sobreengrase
// es el margen que cubre esa variación.

export interface AcidosGrasos {
  laurico: number;
  miristico: number;
  palmitico: number;
  estearico: number;
  ricinoleico: number;
  oleico: number;
  linoleico: number;
  linolenico: number;
}

export interface Aceite {
  id: string;
  nombre: string;
  /** g de hidróxido de sodio (sosa o soda cáustica) por g de aceite */
  sapNaOH: number;
  /** g de hidróxido de potasio (potasa) por g de aceite */
  sapKOH: number;
  yodo: number;
  ins: number;
  acidos: AcidosGrasos;
}

export const FUENTE_ACEITES = {
  tabla: 'SoapCalc (soapcalc.net/oil-list), vía mikewolfd/soap-calc, licencia MIT',
  verificado: '11/10/2026',
};

export const ACEITES: Aceite[] = [
  { id: 'oliva', nombre: 'Aceite de oliva', sapNaOH: 0.135, sapKOH: 0.19, yodo: 85, ins: 105, acidos: { laurico: 0, miristico: 0, palmitico: 14, estearico: 3, ricinoleico: 0, oleico: 69, linoleico: 12, linolenico: 1 } },
  { id: 'coco', nombre: 'Aceite de coco', sapNaOH: 0.183, sapKOH: 0.257, yodo: 10, ins: 258, acidos: { laurico: 48, miristico: 19, palmitico: 9, estearico: 3, ricinoleico: 0, oleico: 8, linoleico: 2, linolenico: 0 } },
  { id: 'palma', nombre: 'Aceite de palma', sapNaOH: 0.142, sapKOH: 0.199, yodo: 53, ins: 145, acidos: { laurico: 0, miristico: 1, palmitico: 44, estearico: 5, ricinoleico: 0, oleico: 39, linoleico: 10, linolenico: 0 } },
  { id: 'palmiste', nombre: 'Aceite de palmiste (almendra de palma)', sapNaOH: 0.176, sapKOH: 0.247, yodo: 20, ins: 227, acidos: { laurico: 49, miristico: 16, palmitico: 8, estearico: 2, ricinoleico: 0, oleico: 15, linoleico: 3, linolenico: 0 } },
  { id: 'babasu', nombre: 'Aceite de babasú', sapNaOH: 0.175, sapKOH: 0.245, yodo: 15, ins: 230, acidos: { laurico: 50, miristico: 20, palmitico: 11, estearico: 4, ricinoleico: 0, oleico: 10, linoleico: 0, linolenico: 0 } },
  { id: 'karite', nombre: 'Manteca de karité', sapNaOH: 0.128, sapKOH: 0.179, yodo: 59, ins: 116, acidos: { laurico: 0, miristico: 0, palmitico: 5, estearico: 40, ricinoleico: 0, oleico: 48, linoleico: 6, linolenico: 0 } },
  { id: 'cacao', nombre: 'Manteca de cacao', sapNaOH: 0.138, sapKOH: 0.194, yodo: 37, ins: 157, acidos: { laurico: 0, miristico: 0, palmitico: 28, estearico: 33, ricinoleico: 0, oleico: 35, linoleico: 3, linolenico: 0 } },
  { id: 'ricino', nombre: 'Aceite de ricino', sapNaOH: 0.128, sapKOH: 0.18, yodo: 86, ins: 95, acidos: { laurico: 0, miristico: 0, palmitico: 0, estearico: 0, ricinoleico: 90, oleico: 4, linoleico: 4, linolenico: 0 } },
  { id: 'girasol', nombre: 'Aceite de girasol', sapNaOH: 0.135, sapKOH: 0.189, yodo: 133, ins: 63, acidos: { laurico: 0, miristico: 0, palmitico: 7, estearico: 4, ricinoleico: 0, oleico: 16, linoleico: 70, linolenico: 1 } },
  { id: 'almendras', nombre: 'Aceite de almendras dulces', sapNaOH: 0.139, sapKOH: 0.195, yodo: 99, ins: 97, acidos: { laurico: 0, miristico: 0, palmitico: 7, estearico: 0, ricinoleico: 0, oleico: 71, linoleico: 18, linolenico: 0 } },
  { id: 'aguacate', nombre: 'Aceite de aguacate (palta)', sapNaOH: 0.133, sapKOH: 0.186, yodo: 86, ins: 99, acidos: { laurico: 0, miristico: 0, palmitico: 20, estearico: 2, ricinoleico: 0, oleico: 58, linoleico: 12, linolenico: 0 } },
  { id: 'colza', nombre: 'Aceite de colza (canola)', sapNaOH: 0.133, sapKOH: 0.186, yodo: 110, ins: 56, acidos: { laurico: 0, miristico: 0, palmitico: 4, estearico: 2, ricinoleico: 0, oleico: 61, linoleico: 21, linolenico: 9 } },
  { id: 'maiz', nombre: 'Aceite de maíz', sapNaOH: 0.137, sapKOH: 0.192, yodo: 117, ins: 69, acidos: { laurico: 0, miristico: 0, palmitico: 12, estearico: 2, ricinoleico: 0, oleico: 32, linoleico: 51, linolenico: 1 } },
  { id: 'uva', nombre: 'Aceite de pepita de uva', sapNaOH: 0.129, sapKOH: 0.181, yodo: 131, ins: 66, acidos: { laurico: 0, miristico: 0, palmitico: 8, estearico: 4, ricinoleico: 0, oleico: 20, linoleico: 68, linolenico: 0 } },
  { id: 'arroz', nombre: 'Aceite de salvado de arroz', sapNaOH: 0.133, sapKOH: 0.187, yodo: 100, ins: 87, acidos: { laurico: 0, miristico: 1, palmitico: 22, estearico: 3, ricinoleico: 0, oleico: 38, linoleico: 34, linolenico: 2 } },
  { id: 'sesamo', nombre: 'Aceite de sésamo (ajonjolí)', sapNaOH: 0.134, sapKOH: 0.188, yodo: 110, ins: 81, acidos: { laurico: 0, miristico: 0, palmitico: 10, estearico: 5, ricinoleico: 0, oleico: 40, linoleico: 43, linolenico: 0 } },
  { id: 'canamo', nombre: 'Aceite de cáñamo', sapNaOH: 0.138, sapKOH: 0.193, yodo: 165, ins: 39, acidos: { laurico: 0, miristico: 0, palmitico: 6, estearico: 2, ricinoleico: 0, oleico: 12, linoleico: 57, linolenico: 21 } },
  { id: 'argan', nombre: 'Aceite de argán', sapNaOH: 0.136, sapKOH: 0.191, yodo: 95, ins: 95, acidos: { laurico: 0, miristico: 1, palmitico: 14, estearico: 0, ricinoleico: 0, oleico: 46, linoleico: 34, linolenico: 1 } },
  { id: 'macadamia', nombre: 'Aceite de macadamia', sapNaOH: 0.139, sapKOH: 0.195, yodo: 76, ins: 119, acidos: { laurico: 0, miristico: 0, palmitico: 9, estearico: 5, ricinoleico: 0, oleico: 59, linoleico: 2, linolenico: 0 } },
  { id: 'jojoba', nombre: 'Aceite de jojoba (cera líquida)', sapNaOH: 0.066, sapKOH: 0.092, yodo: 83, ins: 11, acidos: { laurico: 0, miristico: 0, palmitico: 0, estearico: 0, ricinoleico: 0, oleico: 12, linoleico: 0, linolenico: 0 } },
  { id: 'cerdo', nombre: 'Manteca de cerdo', sapNaOH: 0.141, sapKOH: 0.198, yodo: 57, ins: 139, acidos: { laurico: 0, miristico: 1, palmitico: 28, estearico: 13, ricinoleico: 0, oleico: 46, linoleico: 6, linolenico: 0 } },
  { id: 'sebo', nombre: 'Sebo de vacuno', sapNaOH: 0.143, sapKOH: 0.2, yodo: 45, ins: 147, acidos: { laurico: 2, miristico: 6, palmitico: 28, estearico: 22, ricinoleico: 0, oleico: 36, linoleico: 3, linolenico: 1 } },
];
