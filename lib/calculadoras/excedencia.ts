/**
 * Calculadora de Excedencia Laboral — lógica pura sin React ni DOM
 * Usada por: MCP server (calcular_excedencia)
 *
 * Calcula los derechos y efectos económicos de los distintos tipos de excedencia
 * regulados en el Estatuto de los Trabajadores (ET art. 45 y 46).
 *
 * Tipos de excedencia:
 * A) VOLUNTARIA (art. 46.2 ET)
 *    - Antigüedad mínima: 1 año en la empresa
 *    - Duración: mínimo 4 meses, máximo 5 años
 *    - Derecho a reingreso: preferente (no reserva de puesto)
 *    - Cotización: no cotiza (período sin protección SS)
 *    - Sólo un período cada 4 años (plazo de reincorporación)
 *
 * B) FORZOSA (art. 46.1 ET)
 *    - Causas: cargo público o función sindical de ámbito provincial o superior
 *    - Reserva de puesto de trabajo garantizada
 *    - Cotización ficticia computable a efectos de jubilación
 *
 * C) CUIDADO DE HIJO/FAMILIAR (art. 46.3 ET)
 *    - Cuidado hijo: máximo 3 años desde nacimiento/adopción
 *    - Cuidado familiar hasta 2.º grado: máximo 2 años si no puede valerse
 *    - Primer año: reserva del puesto exacto
 *    - Período restante: reserva de plaza del mismo grupo/categoría
 *    - Cotización computable durante los tres primeros años, tanto para cuidado de
 *      hijo como de familiar (art. 237.1 y 237.2 LGSS; el plazo de familiares se
 *      amplió de 1 a 3 años por el RDL 2/2023, vigente desde el 18-mar-2023)
 *    - Computable a efectos de jubilación, incapacidad permanente y muerte/supervivencia
 *
 * Fuente: ET arts. 45-46 + LGSS arts. 237-238 (modificados por RDL 2/2023) — vigente 2025
 * Verificado: 2026-06-10
 *
 * Encadenable con: calcular_finiquito, calcular_baja_medica, calcular_pension_publica
 */

// ─── Tipos públicos ────────────────────────────────────────────────────────────

export type TipoExcedencia = 'voluntaria' | 'forzosa' | 'cuidado_hijo' | 'cuidado_familiar';

export interface ParametrosExcedencia {
  /** Tipo de excedencia */
  tipo: TipoExcedencia;
  /** Antigüedad del trabajador en la empresa (años) */
  antiguedadAnios: number;
  /** Salario bruto mensual actual (€) */
  salarioBrutoMensual: number;
  /** Duración solicitada de la excedencia (meses) */
  duracionMeses: number;
  /** Edad del trabajador */
  edad?: number;
  /** ¿Tiene cotización suficiente para prestaciones SS? (por defecto true) */
  cotizacionSuficiente?: boolean;
}

export interface ResultadoExcedencia {
  /** Tipo de excedencia */
  tipo: TipoExcedencia;
  /** ¿Cumple los requisitos de acceso? */
  cumpleRequisitos: boolean;
  /** Motivo de incumplimiento (si aplica) */
  motivoIncumplimiento?: string;
  /** Duración mínima permitida (meses) */
  duracionMinimaMeses: number;
  /** Duración máxima permitida (meses) */
  duracionMaximaMeses: number;
  /** Duración solicitada (meses) */
  duracionSolicitadaMeses: number;
  /** ¿Se reserva el puesto exacto? */
  reservaPuestoExacto: boolean;
  /** ¿Se reserva plaza del mismo grupo/categoría? */
  reservaGrupoProfesional: boolean;
  /** Meses con reserva de puesto exacto */
  mesesReservaPuestoExacto: number;
  /** ¿Cotiza durante la excedencia? */
  cotizaDurante: boolean;
  /** Meses computables a efectos SS (jubilación, IP, etc.) */
  mesesComputablesSSTotal: number;
  /** Descripción de los meses computables */
  detalleCotizacion: string;
  /** Impacto en prestaciones SS estimado */
  impactoSS: string;
  /** Salario mensual que se deja de percibir (€) */
  salerioMensualPerdido: number;
  /** Coste total de la excedencia en ingresos no percibidos (€) */
  costeTotalIngresosNoPecibidos: number;
  /** ¿Puede pedir otra excedencia voluntaria antes de X años? */
  plazoNuevaExcedenciaVoluntaria?: number;
  /** Advertencias */
  advertencias: string[];
  /** Fuente normativa */
  fuenteDatos: string;
}

// ─── Función principal ─────────────────────────────────────────────────────────

export function calcularExcedencia(p: ParametrosExcedencia): ResultadoExcedencia {
  if (p.antiguedadAnios < 0) throw new Error('La antigüedad no puede ser negativa.');
  if (p.salarioBrutoMensual <= 0) throw new Error('El salario mensual debe ser mayor que cero.');
  if (p.duracionMeses <= 0) throw new Error('La duración de la excedencia debe ser mayor que cero.');

  const r = (n: number) => Math.round(n * 100) / 100;

  let duracionMinimaMeses: number;
  let duracionMaximaMeses: number;
  let reservaPuestoExacto: boolean;
  let reservaGrupoProfesional: boolean;
  let mesesReservaPuestoExacto: number;
  let cotizaDurante: boolean;
  let mesesComputablesSSTotal: number;
  let detalleCotizacion: string;
  let impactoSS: string;
  let cumpleRequisitos = true;
  let motivoIncumplimiento: string | undefined;
  let plazoNuevaExcedenciaVoluntaria: number | undefined;

  switch (p.tipo) {
    case 'voluntaria':
      duracionMinimaMeses = 4;
      duracionMaximaMeses = 60; // 5 años
      if (p.antiguedadAnios < 1) {
        cumpleRequisitos = false;
        motivoIncumplimiento = `Se requiere al menos 1 año de antigüedad. Antigüedad actual: ${p.antiguedadAnios.toFixed(1)} años.`;
      }
      reservaPuestoExacto = false;
      reservaGrupoProfesional = false;
      mesesReservaPuestoExacto = 0;
      cotizaDurante = false;
      mesesComputablesSSTotal = 0;
      detalleCotizacion = 'Sin cotización durante la excedencia voluntaria. El período no computa para ninguna prestación de la Seguridad Social.';
      impactoSS = 'Período sin cotización: no cuenta para jubilación, incapacidad permanente ni otras prestaciones. Puede suscribir un convenio especial con la SS para mantener cotización; la cuota depende de la base de cotización elegida (consultar simulador oficial de la Seguridad Social).';
      plazoNuevaExcedenciaVoluntaria = 48; // 4 años
      break;

    case 'forzosa':
      duracionMinimaMeses = 1;
      duracionMaximaMeses = 0; // Sin límite máximo (mientras dure el cargo)
      reservaPuestoExacto = true;
      reservaGrupoProfesional = true;
      mesesReservaPuestoExacto = p.duracionMeses;
      cotizaDurante = true; // Cotización ficticia
      mesesComputablesSSTotal = p.duracionMeses;
      detalleCotizacion = 'Cotización ficticia computable a efectos de jubilación durante todo el período de excedencia forzosa (art. 208.1.b LGSS).';
      impactoSS = 'El período de excedencia forzosa computa íntegramente para la pensión de jubilación y demás prestaciones contributivas.';
      break;

    case 'cuidado_hijo':
      duracionMinimaMeses = 1;
      duracionMaximaMeses = 36; // 3 años desde nacimiento/adopción
      reservaPuestoExacto = true;
      reservaGrupoProfesional = true;
      // Primer año: reserva puesto exacto
      mesesReservaPuestoExacto = Math.min(12, p.duracionMeses);
      cotizaDurante = false; // No cotiza activamente, pero se computa a efectos SS
      // Los primeros 36 meses computan a efectos SS (art. 237 LGSS)
      mesesComputablesSSTotal = Math.min(36, p.duracionMeses);
      detalleCotizacion = `Los primeros ${Math.min(36, p.duracionMeses)} meses computan como cotizados a efectos de jubilación, incapacidad permanente y muerte/supervivencia (art. 237 LGSS). No hay cotización real durante el período.`;
      impactoSS = 'Período asimilado a cotizado: computa para prestaciones contributivas. No afecta negativamente al período de carencia.';
      break;

    case 'cuidado_familiar':
      duracionMinimaMeses = 1;
      duracionMaximaMeses = 24; // 2 años para familiar hasta 2.º grado
      reservaPuestoExacto = true;
      reservaGrupoProfesional = true;
      mesesReservaPuestoExacto = Math.min(12, p.duracionMeses); // Primer año
      cotizaDurante = false;
      // Los tres primeros años computan (art. 237.2 LGSS, ampliado de 1 a 3 años por el RDL 2/2023)
      mesesComputablesSSTotal = Math.min(36, p.duracionMeses);
      detalleCotizacion = `Los primeros ${Math.min(36, p.duracionMeses)} meses computan como cotizados a efectos de jubilación, incapacidad permanente y muerte/supervivencia (art. 237.2 LGSS — cuidado familiar, ampliado de 1 a 3 años por el RDL 2/2023).`;
      impactoSS = 'Período asimilado a cotizado: tras la ampliación del RDL 2/2023, toda excedencia por cuidado de familiar (máximo legal 2 años) computa íntegramente para prestaciones contributivas.';
      break;
  }

  // Validar duración solicitada
  if (p.tipo !== 'forzosa' && p.duracionMeses < duracionMinimaMeses) {
    cumpleRequisitos = false;
    motivoIncumplimiento = `La duración mínima para la excedencia ${p.tipo} es ${duracionMinimaMeses} meses. Se han solicitado ${p.duracionMeses} meses.`;
  }
  if (p.tipo !== 'forzosa' && p.duracionMeses > duracionMaximaMeses) {
    cumpleRequisitos = false;
    motivoIncumplimiento = `La duración máxima para la excedencia ${p.tipo} es ${duracionMaximaMeses} meses. Se han solicitado ${p.duracionMeses} meses.`;
  }

  const costeTotalIngresosNoPecibidos = r(p.salarioBrutoMensual * p.duracionMeses);

  const advertencias: string[] = [
    'La excedencia debe solicitarse con preaviso suficiente (recomendable al menos 15 días de antelación).',
    'El convenio colectivo puede mejorar los derechos mínimos previstos en el ET (mayor duración, reserva de puesto, etc.).',
  ];

  if (p.tipo === 'voluntaria') {
    advertencias.push('El derecho al reingreso es preferente pero no garantizado: solo se tiene derecho si existe vacante de igual o similar categoría cuando se solicita la reincorporación.');
    advertencias.push(`No podrá solicitar una nueva excedencia voluntaria hasta que pasen ${plazoNuevaExcedenciaVoluntaria} meses (4 años) desde la finalización de la actual.`);
    advertencias.push('Para no perder cotización SS puede suscribir un convenio especial con la Seguridad Social; la cuota depende de la base de cotización elegida (consultar simulador oficial de la Seguridad Social).');
  }
  if (p.tipo === 'cuidado_hijo' || p.tipo === 'cuidado_familiar') {
    advertencias.push('Durante la excedencia por cuidado se puede realizar otra actividad laboral, incluso para otra empresa, salvo pacto de no competencia o dedicación exclusiva.');
    advertencias.push('El reingreso se puede solicitar en cualquier momento antes de agotar el plazo máximo, sin esperar a que termine.');
  }
  if (p.tipo === 'forzosa') {
    advertencias.push('El derecho a reincorporarse debe ejercitarse en el mes siguiente al cese en el cargo que motivó la excedencia forzosa.');
  }

  return {
    tipo: p.tipo,
    cumpleRequisitos,
    motivoIncumplimiento,
    duracionMinimaMeses,
    duracionMaximaMeses,
    duracionSolicitadaMeses: p.duracionMeses,
    reservaPuestoExacto,
    reservaGrupoProfesional,
    mesesReservaPuestoExacto,
    cotizaDurante,
    mesesComputablesSSTotal,
    detalleCotizacion,
    impactoSS,
    salerioMensualPerdido: r(p.salarioBrutoMensual),
    costeTotalIngresosNoPecibidos,
    plazoNuevaExcedenciaVoluntaria,
    advertencias,
    fuenteDatos: 'ET arts. 45-46 + LGSS arts. 237-238 (cuidado de familiar ampliado de 1 a 3 años por el RDL 2/2023) — Real Decreto Legislativo 2/2015 y 8/2015, vigente 2025',
  };
}
