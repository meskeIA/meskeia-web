'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import styles from './QuizConceptosInversion.module.css';

// ─────────────────────────────────────────────────────────────────────────────
// Tipos
// ─────────────────────────────────────────────────────────────────────────────

type Categoria =
  | 'riesgo-rentabilidad'
  | 'renta-fija'
  | 'fondos-etf'
  | 'cartera-estrategia'
  | 'valoracion';

type Modo = 'examen' | 'practica';
type Estado = 'inicio' | 'jugando' | 'respondida' | 'fin';

interface Pregunta {
  id: number;
  categoria: Categoria;
  pregunta: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
}

interface ResultadoCategoria {
  correctas: number;
  total: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Configuración de categorías
// ─────────────────────────────────────────────────────────────────────────────

const CATEGORIAS: Record<Categoria, { label: string; icono: string; color: string }> = {
  'riesgo-rentabilidad': { label: 'Riesgo y Rentabilidad', icono: '📊', color: '#2E86AB' },
  'renta-fija':          { label: 'Renta Fija y Bonos',   icono: '📄', color: '#48A9A6' },
  'fondos-etf':          { label: 'Fondos y ETF',          icono: '🏦', color: '#E07B39' },
  'cartera-estrategia':  { label: 'Cartera y Estrategia', icono: '⚖️', color: '#8E44AD' },
  'valoracion':          { label: 'Valoración de Activos', icono: '🔍', color: '#27AE60' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Banco de preguntas (25 preguntas, 5 por categoría)
// ─────────────────────────────────────────────────────────────────────────────

const PREGUNTAS: Pregunta[] = [
  // ── Riesgo y Rentabilidad ──
  {
    id: 1, categoria: 'riesgo-rentabilidad',
    pregunta: '¿Qué mide el ratio de Sharpe?',
    opciones: [
      'La rentabilidad absoluta de una cartera en un año',
      'El riesgo total de una cartera medido por su varianza',
      'La rentabilidad obtenida por unidad de riesgo (volatilidad) asumido',
      'La correlación entre una cartera y su índice de referencia',
    ],
    correcta: 2,
    explicacion: 'El ratio de Sharpe = (Rentabilidad cartera − Tasa libre de riesgo) / Desviación estándar. Un Sharpe de 1 significa que por cada punto de riesgo asumido se obtuvo 1 punto de rentabilidad extra sobre el activo sin riesgo. Permite comparar carteras con distintos niveles de riesgo en igualdad de condiciones.',
  },
  {
    id: 2, categoria: 'riesgo-rentabilidad',
    pregunta: 'Una acción tiene beta = 1,5. Si el mercado sube un 10%, ¿qué comportamiento esperamos de la acción?',
    opciones: [
      'Sube un 10% (igual que el mercado)',
      'Sube un 1,5%',
      'Sube aproximadamente un 15%',
      'La beta no predice la dirección, solo la volatilidad',
    ],
    correcta: 2,
    explicacion: 'La beta mide la sensibilidad de un activo respecto al mercado. Beta = 1,5 implica que si el mercado sube 10%, la acción tiende a subir ~15% (1,5 × 10%). Con beta > 1 el activo amplifica los movimientos del mercado (más riesgo sistemático). La beta no captura el riesgo idiosincrático (específico de la empresa).',
  },
  {
    id: 3, categoria: 'riesgo-rentabilidad',
    pregunta: '¿Cuál de estos riesgos NO se elimina diversificando la cartera?',
    opciones: [
      'Riesgo de quiebra de una empresa concreta',
      'Riesgo de que el CEO de una empresa cometa fraude',
      'Riesgo de una recesión global que afecte a todos los mercados',
      'Riesgo de que una empresa pierda un juicio importante',
    ],
    correcta: 2,
    explicacion: 'El riesgo sistemático (o de mercado) afecta a todos los activos y no se puede eliminar diversificando. Una recesión global cae en esta categoría. Los riesgos específicos de empresa (quiebra, fraude, litigios) son riesgo idiosincrático y sí se eliminan con suficiente diversificación. Por eso el mercado no remunera el riesgo específico.',
  },
  {
    id: 4, categoria: 'riesgo-rentabilidad',
    pregunta: 'El ratio de Sortino es una variante del Sharpe. ¿Cuál es su diferencia principal?',
    opciones: [
      'Usa la rentabilidad del mercado en lugar de la tasa libre de riesgo',
      'Solo penaliza la volatilidad negativa (drawdowns), no la positiva',
      'Incorpora el efecto de las comisiones en el cálculo',
      'Mide la rentabilidad ajustada por liquidez del activo',
    ],
    correcta: 1,
    explicacion: 'El ratio de Sortino solo considera la desviación estándar de los retornos negativos (downside deviation). La lógica: la volatilidad al alza no es "riesgo real" para el inversor — solo importa la caída. Un fondo muy volátil hacia arriba pero estable en bajadas tendría mejor Sortino que Sharpe. Preferido cuando la distribución de retornos es asimétrica.',
  },
  {
    id: 5, categoria: 'riesgo-rentabilidad',
    pregunta: 'El drawdown máximo de un fondo es del 35%. ¿Qué rentabilidad necesita para recuperar ese nivel?',
    opciones: [
      'Un 35%',
      'Un 53,8%',
      'Un 28%',
      'Un 70%',
    ],
    correcta: 1,
    explicacion: 'Si pierdes el 35%, te quedas con el 65% del capital. Para volver al 100% necesitas: 100/65 − 1 = 53,8%. Las pérdidas y las ganancias no son simétricas. Una caída del 50% requiere un +100% para recuperarse. Esto ilustra por qué la gestión del riesgo y limitar las pérdidas es más importante que maximizar la rentabilidad.',
  },

  // ── Renta Fija y Bonos ──
  {
    id: 6, categoria: 'renta-fija',
    pregunta: '¿Qué ocurre con el precio de un bono cuando suben los tipos de interés (tasas de interés)?',
    opciones: [
      'El precio sube, porque el bono paga más cupón',
      'El precio no cambia, porque el cupón está fijado',
      'El precio baja, porque los nuevos bonos ofrecen más rentabilidad',
      'El precio sube o baja según el rating del emisor',
    ],
    correcta: 2,
    explicacion: 'Precio y tipos de interés (tasas de interés) de los bonos se mueven en direcciones opuestas. Si suben los tipos, los nuevos bonos ofrecen mayor cupón que el tuyo → tu bono pierde atractivo → su precio de mercado cae. Esta relación inversa es fundamental en renta fija. Los bonos de mayor duración son más sensibles a los movimientos de tipos.',
  },
  {
    id: 7, categoria: 'renta-fija',
    pregunta: '¿Qué es la "duration" de un bono?',
    opciones: [
      'El plazo hasta el vencimiento del bono',
      'La vida media ponderada de los flujos de caja, que mide la sensibilidad al tipo de interés',
      'El tiempo que tarda en recuperar la inversión inicial con los cupones',
      'El número de pagos de cupón que quedan hasta el vencimiento',
    ],
    correcta: 1,
    explicacion: 'La duration de Macaulay es la vida media ponderada de todos los flujos de caja (cupones + principal) descontados. La duration modificada (= Macaulay / (1 + yield)) mide directamente la sensibilidad: si la duration modificada es 7, un aumento de 1% en tipos implica una caída de ~7% en precio. Bonos cupón cero tienen duration = vencimiento.',
  },
  {
    id: 8, categoria: 'renta-fija',
    pregunta: 'Un bono con cupón del 3% se emite cuando los tipos están al 3%. Los tipos suben al 5%. ¿Cómo cotiza el bono en mercado secundario?',
    opciones: [
      'A la par (100)',
      'Sobre la par (>100), porque tiene historial de pagos',
      'Bajo la par (<100), porque su cupón es inferior al tipo de mercado',
      'No cotiza, los bonos se mantienen hasta vencimiento',
    ],
    correcta: 2,
    explicacion: 'Los nuevos bonos al 5% son más atractivos que uno al 3%. Para que alguien quiera comprar el bono antiguo, su precio debe bajar hasta que su yield efectiva sea competitiva con el 5% de mercado. Resultado: cotiza bajo la par. Al vencimiento, el emisor paga el valor nominal (100), no el precio de mercado.',
  },
  {
    id: 9, categoria: 'renta-fija',
    pregunta: '¿Qué indica que un bono tenga un spread de crédito elevado respecto al bono soberano?',
    opciones: [
      'Que el bono tiene mejor calificación crediticia que el soberano',
      'Que el mercado percibe mayor riesgo de impago y exige más rentabilidad',
      'Que el bono tiene menor duration y es menos sensible a tipos',
      'Que el bono está denominado en moneda extranjera',
    ],
    correcta: 1,
    explicacion: 'El spread de crédito es la rentabilidad adicional que exige el mercado sobre el bono soberano (considerado sin riesgo) por asumir el riesgo de impago del emisor corporativo. Si el spread de un bono high-yield es 500 pb (5%), el mercado considera ese emisor significativamente más arriesgado que el Estado. Los spreads se amplían en crisis y se comprimen en expansión.',
  },
  {
    id: 10, categoria: 'renta-fija',
    pregunta: 'Un bono "callable" (rescatable) normalmente cotiza con menor rentabilidad que uno comparable no callable. ¿Por qué es incorrecto este enunciado?',
    opciones: [
      'Es correcto: el emisor asume más riesgo y paga menos',
      'Es incorrecto: los bonos callable ofrecen mayor rentabilidad porque el inversor asume el riesgo de amortización anticipada',
      'Es incorrecto: callable y no callable tienen la misma rentabilidad por ley',
      'Es correcto: la opción de rescate beneficia al inversor',
    ],
    correcta: 1,
    explicacion: 'Un bono callable le da al emisor el derecho de amortizarlo anticipadamente cuando los tipos bajan (para refinanciarse más barato). Esto perjudica al inversor: cuando le conviene al emisor rescatar el bono, al inversor le conviene mantenerlo. Por asumir este riesgo de reinversión, el inversor exige mayor yield → el callable cotiza con mayor rentabilidad (o menor precio) que uno no callable equivalente.',
  },

  // ── Fondos y ETF ──
  {
    id: 11, categoria: 'fondos-etf',
    pregunta: '¿Qué es el TER (Total Expense Ratio) de un fondo?',
    opciones: [
      'La comisión de suscripción que se paga al comprar participaciones',
      'El coste anual total del fondo como porcentaje del patrimonio, incluyendo gestión, depositaría y otros gastos',
      'La diferencia entre el precio de compra y venta de las participaciones',
      'El rendimiento total del fondo antes de comisiones',
    ],
    correcta: 1,
    explicacion: 'El TER incluye la comisión de gestión, depositaría y otros gastos operativos, expresados como % anual sobre el patrimonio. Un fondo activo típico puede tener TER del 1,5–2%; un ETF indexado, del 0,05–0,20%. A 30 años con un 7% bruto: TER 0,10% → 7,6x capital; TER 1,5% → 5,6x. La diferencia compuesta es enorme.',
  },
  {
    id: 12, categoria: 'fondos-etf',
    pregunta: 'Un ETF de réplica física completa vs uno de réplica sintética. ¿Cuál es la diferencia principal?',
    opciones: [
      'El físico solo invierte en acciones nacionales; el sintético en internacionales',
      'El físico compra los activos del índice directamente; el sintético usa derivados (swaps) para replicar el rendimiento',
      'El físico tiene mayor TER; el sintético es siempre más barato',
      'El físico reparte dividendos; el sintético los acumula',
    ],
    correcta: 1,
    explicacion: 'La réplica física compra los valores reales del índice (total o muestral). La sintética firma un swap con una contraparte que se compromete a pagar el rendimiento del índice. La sintética puede ser más eficiente en mercados difíciles de acceder, pero añade riesgo de contraparte (si el banco contraparte quiebra). Los reguladores europeos limitan la exposición a swaps al 10% del patrimonio.',
  },
  {
    id: 13, categoria: 'fondos-etf',
    pregunta: '¿Qué es el "tracking error" de un ETF?',
    opciones: [
      'La diferencia entre el precio de mercado del ETF y su NAV',
      'El error en el cálculo del índice de referencia',
      'La desviación estándar de las diferencias de rentabilidad entre el ETF y su índice',
      'El coste de rebalanceo cuando cambia la composición del índice',
    ],
    correcta: 2,
    explicacion: 'El tracking error mide qué tan fielmente replica el ETF a su índice. Se calcula como la desviación estándar de las diferencias diarias de retorno entre ETF e índice. Un tracking error bajo (0,05%) indica réplica excelente. Las causas de tracking error incluyen: TER, dividendos no reinvertidos, efectivo en cartera, impuestos retenidos y rebalanceos.',
  },
  {
    id: 14, categoria: 'fondos-etf',
    pregunta: 'A largo plazo, ¿qué porcentaje de fondos activos supera a su índice de referencia después de comisiones?',
    opciones: [
      'Más del 70% supera al índice sistemáticamente',
      'Aproximadamente el 50%, como cabría esperar del azar',
      'Entre el 10% y el 20% a 15–20 años según estudios SPIVA',
      'Depende del gestor: los mejores siempre superan al índice',
    ],
    correcta: 2,
    explicacion: 'Los informes SPIVA (S&P) muestran consistentemente que a 15–20 años, entre el 80–90% de los fondos activos no supera a su índice después de comisiones. La razón: las comisiones son un lastre constante contra el que es muy difícil competir. Los pocos fondos que superan al índice lo hacen en gran parte por suerte estadística (muy pocos mantienen alfa real y consistente).',
  },
  {
    id: 15, categoria: 'fondos-etf',
    pregunta: 'Un fondo de acumulación vs un fondo de distribución. Para un inversor en fase de crecimiento en España, ¿cuál suele ser más eficiente fiscalmente?',
    opciones: [
      'El de distribución, porque los dividendos están exentos de impuestos',
      'Son fiscalmente equivalentes en España',
      'El de acumulación, porque los dividendos se reinvierten sin tributar hasta la venta',
      'El de distribución, porque permite compensar con minusvalías cada año',
    ],
    correcta: 2,
    explicacion: 'En fondos de acumulación, los dividendos se reinvierten automáticamente sin generar evento fiscal. En fondos de distribución, cada reparto tributa como rendimiento del capital mobiliario (19–28% según tramo). Para quien no necesita rentas, la acumulación es más eficiente: el impuesto diferido sigue compuesto hasta la venta. Además, en España los traspasos entre fondos (no ETF) son sin coste fiscal.',
  },

  // ── Cartera y Estrategia ──
  {
    id: 16, categoria: 'cartera-estrategia',
    pregunta: '¿Por qué se rebalancea una cartera periódicamente?',
    opciones: [
      'Para aprovechar las tendencias del mercado y comprar lo que más sube',
      'Para restaurar la distribución de activos objetivo cuando las ponderaciones se desvían por la evolución del mercado',
      'Para reducir el número de posiciones y simplificar la cartera',
      'Para minimizar el impacto fiscal de las plusvalías latentes',
    ],
    correcta: 1,
    explicacion: 'Si tu asignación objetivo es 60% renta variable / 40% renta fija y la bolsa sube mucho, puedes acabar con 75/25. El rebalanceo vende lo que ha subido y compra lo que ha bajado, restaurando el 60/40. Efectivamente, fuerza a "comprar barato y vender caro" de forma sistemática y mantiene el perfil de riesgo constante. El frecuente tiene costes (fiscales y de transacción) vs. el umbral (solo al desviarse X%).',
  },
  {
    id: 17, categoria: 'cartera-estrategia',
    pregunta: 'Dos activos tienen correlación de −1. ¿Qué ocurre si los combinas en una cartera?',
    opciones: [
      'La rentabilidad esperada es cero',
      'El riesgo se suma al haber movimientos opuestos',
      'Es posible construir una cartera con riesgo cero si las ponderaciones son las adecuadas',
      'La correlación de −1 es imposible en activos reales',
    ],
    correcta: 2,
    explicacion: 'Con correlación perfecta negativa (−1), cuando un activo sube el otro baja exactamente en la misma proporción. Con la combinación correcta de ponderaciones, el riesgo se anula completamente. En la práctica, correlaciones de −1 son rarísimas, pero activos con baja o negativa correlación (ej: bonos soberanos vs acciones en muchos períodos) reducen el riesgo total de la cartera, que es la base de la diversificación moderna (Markowitz).',
  },
  {
    id: 18, categoria: 'cartera-estrategia',
    pregunta: '¿Qué es el "factor investing" o inversión factorial?',
    opciones: [
      'Invertir solo en un sector o país específico',
      'Estrategia que sobrepondera acciones con características (factores) que históricamente han generado alfa: valor, calidad, momentum, tamaño, baja volatilidad',
      'Usar factores macroeconómicos para hacer market timing',
      'Invertir en fondos gestionados por gestoras de primer nivel (factores cualitativos)',
    ],
    correcta: 1,
    explicacion: 'El factor investing (smart beta) identifica características sistemáticas que han generado rentabilidad extra ajustada al riesgo: valor (P/B bajo), momentum (subidas recientes), calidad (alta rentabilidad sobre fondos propios), tamaño (small caps) y baja volatilidad. Fama y French documentaron los tres primeros factores. Los ETF de factores cobran entre un índice puro y un fondo activo. No garantizan alfa futuro.',
  },
  {
    id: 19, categoria: 'cartera-estrategia',
    pregunta: 'El "sesgo del hogar" (home bias) es un error cognitivo frecuente en inversores. ¿En qué consiste?',
    opciones: [
      'Preferir activos inmobiliarios sobre activos financieros',
      'Sobreponderar las acciones del país donde se vive respecto a su peso en el mercado global',
      'Invertir en empresas donde se trabaja o consume',
      'Mantener demasiado efectivo en la cuenta corriente en lugar de invertirlo',
    ],
    correcta: 1,
    explicacion: 'El home bias lleva a los inversores a concentrar sus carteras en el mercado doméstico, perdiendo diversificación internacional. España representa <1% del mercado global de acciones, pero muchos inversores españoles tienen el 50–70% en bolsa española. El resultado: correlación alta con el ciclo económico local, menos diversificación y rentabilidades históricamente peores que el índice global.',
  },
  {
    id: 20, categoria: 'cartera-estrategia',
    pregunta: 'La estrategia "buy and hold" vs. "market timing". ¿Qué muestra la evidencia académica?',
    opciones: [
      'El market timing genera +3% de alfa anual si se hace correctamente',
      'Buy and hold solo funciona en mercados alcistas, el timing es necesario en bajistas',
      'El market timing consistente y rentable después de costes es prácticamente imposible; buy and hold supera a la mayoría de estrategias activas',
      'Ambas estrategias son equivalentes a largo plazo',
    ],
    correcta: 2,
    explicacion: 'Estudios de DALBAR muestran que el inversor promedio obtiene significativamente menos que el índice porque compra tras subidas y vende tras caídas (mal market timing emocional). Los días de mayor subida en bolsa suelen ocurrir justo después de las mayores caídas. Perder los 10 mejores días en 20 años puede reducir la rentabilidad a la mitad. El tiempo en el mercado supera al timing del mercado.',
  },

  // ── Valoración de Activos ──
  {
    id: 21, categoria: 'valoracion',
    pregunta: '¿Qué significa que una acción tenga un PER de 25?',
    opciones: [
      'Que la empresa ha crecido un 25% en el último año',
      'Que los inversores pagan 25 euros por cada euro de beneficio anual de la empresa',
      'Que la empresa tiene una rentabilidad por dividendo del 25%',
      'Que la acción ha subido un 25% respecto a su precio de emisión',
    ],
    correcta: 1,
    explicacion: 'PER (Price to Earnings Ratio) = Precio / Beneficio por acción. Un PER de 25 significa que si la empresa mantuviera sus beneficios actuales, tardarías 25 años en "recuperar" el precio de compra solo con beneficios. Un PER alto puede indicar crecimiento esperado elevado (mercado dispuesto a pagar prima por crecimiento futuro) o sobrevaloración. Hay que compararlo con el sector y el histórico de la empresa.',
  },
  {
    id: 22, categoria: 'valoracion',
    pregunta: '¿Qué ventaja tiene el múltiplo EV/EBITDA sobre el PER para comparar empresas?',
    opciones: [
      'Es más fácil de calcular y entender para inversores particulares',
      'Neutraliza el efecto de la estructura de capital (deuda) y los impuestos, permitiendo comparar empresas con diferente apalancamiento',
      'Incorpora el crecimiento futuro esperado, que el PER ignora',
      'Solo aplica a empresas de gran capitalización bursátil',
    ],
    correcta: 1,
    explicacion: 'EV (Enterprise Value) incluye la capitalización bursátil más la deuda neta. Al dividir por EBITDA (antes de intereses e impuestos), se elimina el efecto del apalancamiento financiero y la estructura fiscal. Dos empresas idénticas operativamente pero con distinta deuda tendrán PER muy diferente pero EV/EBITDA similar. Muy útil en LBOs, fusiones y para comparar entre países con distintos tipos impositivos.',
  },
  {
    id: 23, categoria: 'valoracion',
    pregunta: 'En un modelo DCF (Descuento de Flujos de Caja), ¿qué ocurre si aumentas la tasa de descuento?',
    opciones: [
      'El valor de la empresa aumenta porque los flujos valen más',
      'El valor de la empresa disminuye porque los flujos futuros valen menos en el presente',
      'El valor no cambia, la tasa de descuento solo afecta al riesgo',
      'Solo afecta al valor terminal, no a los flujos de los primeros años',
    ],
    correcta: 1,
    explicacion: 'En un DCF, el valor actual = Σ (Flujo_t / (1 + r)^t). Cuanto mayor la tasa de descuento r, menor el denominador → menor el valor presente de cada flujo. Una empresa de alto crecimiento (con flujos lejanos en el tiempo) es especialmente sensible a cambios en la tasa: pequeñas variaciones en r producen grandes cambios en la valoración. Por eso las empresas de crecimiento caen más cuando suben los tipos.',
  },
  {
    id: 24, categoria: 'valoracion',
    pregunta: '¿Qué es el "margen de seguridad" en la filosofía de inversión value?',
    opciones: [
      'El porcentaje máximo de pérdida tolerable antes de vender',
      'La diferencia entre el precio de mercado y el valor intrínseco estimado, que actúa como colchón ante errores de valoración',
      'El efectivo mínimo que debe mantener una empresa en su balance',
      'El ratio de cobertura de intereses de la deuda de la empresa',
    ],
    correcta: 1,
    explicacion: 'Concepto clave de Graham y Buffett: si estimas que una empresa vale 100 y la compras a 70, tienes un margen de seguridad del 30%. Este margen protege ante errores en tus estimaciones de valor intrínseco. Cuanto más incierto el negocio, mayor margen de seguridad exigir. El margen de seguridad es el corazón del value investing: invertir en activos con descuento significativo sobre su valor real.',
  },
  {
    id: 25, categoria: 'valoracion',
    pregunta: 'El ratio P/B (Price to Book) es especialmente relevante para valorar empresas de ciertos sectores. ¿En cuáles?',
    opciones: [
      'Tecnología y startups, donde el crecimiento futuro es lo que importa',
      'Bancos, aseguradoras y empresas con activos tangibles relevantes',
      'Empresas de consumo con fuertes marcas (intangibles)',
      'Sectores regulados como utilities y telecomunicaciones',
    ],
    correcta: 1,
    explicacion: 'P/B (precio / valor en libros) es útil cuando el balance refleja bien el valor real del negocio. Bancos y aseguradoras tienen activos financieros valorados a precio de mercado, haciendo el P/B especialmente relevante. Un banco cotizando por debajo de 1x P/B sugiere que el mercado cree que vale menos que su valor contable (expectativas de pérdidas). En tecnología, los activos intangibles (marca, software) no aparecen en el balance → P/B pierde utilidad.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function mezclar<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function clasificacion(pct: number): { texto: string; icono: string; color: string } {
  if (pct === 100) return { texto: 'Experto en inversión', icono: '🏆', color: '#F39C12' };
  if (pct >= 80)  return { texto: 'Nivel avanzado — listo para construir cartera propia', icono: '🌟', color: '#27AE60' };
  if (pct >= 60)  return { texto: 'Nivel intermedio — base sólida para seguir aprendiendo', icono: '👍', color: '#2E86AB' };
  if (pct >= 40)  return { texto: 'Nivel básico-medio — repasa los conceptos clave', icono: '📚', color: '#E07B39' };
  return { texto: 'Nivel inicial — empieza por el quiz básico de finanzas', icono: '🌱', color: '#8E44AD' };
}

// ─────────────────────────────────────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────────────────────────────────────

export default function QuizConceptosInversionPage() {
  const [modo, setModo] = useState<Modo>('examen');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria>('riesgo-rentabilidad');
  const [estado, setEstado] = useState<Estado>('inicio');
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [indice, setIndice] = useState(0);
  const [respuestaElegida, setRespuestaElegida] = useState<number | null>(null);
  const [correctas, setCorrectas] = useState(0);
  const [resultadosCat, setResultadosCat] = useState<Record<Categoria, ResultadoCategoria>>({
    'riesgo-rentabilidad': { correctas: 0, total: 0 },
    'renta-fija':          { correctas: 0, total: 0 },
    'fondos-etf':          { correctas: 0, total: 0 },
    'cartera-estrategia':  { correctas: 0, total: 0 },
    'valoracion':          { correctas: 0, total: 0 },
  });

  const iniciar = useCallback(() => {
    const pool = modo === 'examen'
      ? mezclar(PREGUNTAS)
      : mezclar(PREGUNTAS.filter(p => p.categoria === categoriaSeleccionada));
    setPreguntas(pool);
    setIndice(0);
    setRespuestaElegida(null);
    setCorrectas(0);
    setResultadosCat({
      'riesgo-rentabilidad': { correctas: 0, total: 0 },
      'renta-fija':          { correctas: 0, total: 0 },
      'fondos-etf':          { correctas: 0, total: 0 },
      'cartera-estrategia':  { correctas: 0, total: 0 },
      'valoracion':          { correctas: 0, total: 0 },
    });
    setEstado('jugando');
  }, [modo, categoriaSeleccionada]);

  const responder = useCallback((idx: number) => {
    if (estado !== 'jugando') return;
    setRespuestaElegida(idx);
    const p = preguntas[indice];
    const esCorrecta = idx === p.correcta;
    if (esCorrecta) setCorrectas(c => c + 1);
    setResultadosCat(prev => ({
      ...prev,
      [p.categoria]: {
        correctas: prev[p.categoria].correctas + (esCorrecta ? 1 : 0),
        total: prev[p.categoria].total + 1,
      },
    }));
    setEstado('respondida');
  }, [estado, preguntas, indice]);

  const siguiente = useCallback(() => {
    if (indice + 1 >= preguntas.length) {
      setEstado('fin');
    } else {
      setIndice(i => i + 1);
      setRespuestaElegida(null);
      setEstado('jugando');
    }
  }, [indice, preguntas.length]);

  const reiniciar = () => setEstado('inicio');

  const preguntaActual = preguntas[indice];
  const pctProgreso = preguntas.length > 0 ? (indice / preguntas.length) * 100 : 0;
  const pctFinal = preguntas.length > 0 ? Math.round((correctas / preguntas.length) * 100) : 0;
  const clasif = clasificacion(pctFinal);

  const LETRAS = ['A', 'B', 'C', 'D'];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">📈</span> Quiz Conceptos de Inversión</h1>
        <p className={styles.subtitle}>
          Sharpe, beta, duration, TER, rebalanceo y valoración — nivel intermedio con explicaciones detalladas
        </p>
      </header>

      <LegalNotice />

      <main className={styles.main}>

        {/* ── Pantalla inicio ── */}
        {estado === 'inicio' && (
          <div className={styles.inicio}>
            <div className={styles.modoSelector}>
              <button
                type="button"
                onClick={() => setModo('examen')}
                className={`${styles.modoBtn} ${modo === 'examen' ? styles.modoBtnActivo : ''}`}
                aria-pressed={modo === 'examen'}
              >
                <span aria-hidden="true">📝</span> Examen completo
                <span>25 preguntas</span>
              </button>
              <button
                type="button"
                onClick={() => setModo('practica')}
                className={`${styles.modoBtn} ${modo === 'practica' ? styles.modoBtnActivo : ''}`}
                aria-pressed={modo === 'practica'}
              >
                <span aria-hidden="true">🎯</span> Práctica por categoría
                <span>5 preguntas</span>
              </button>
            </div>

            {modo === 'practica' && (
              <div className={styles.catSelector}>
                <p className={styles.catLabel}>Elige una categoría:</p>
                <div className={styles.catGrid}>
                  {(Object.entries(CATEGORIAS) as [Categoria, typeof CATEGORIAS[Categoria]][]).map(([id, cfg]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setCategoriaSeleccionada(id)}
                      className={`${styles.catBtn} ${categoriaSeleccionada === id ? styles.catBtnActivo : ''}`}
                      style={{ borderColor: categoriaSeleccionada === id ? cfg.color : undefined }}
                      aria-pressed={categoriaSeleccionada === id}
                    >
                      <span aria-hidden="true">{cfg.icono}</span>
                      <span>{cfg.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.categoriasList}>
              {(Object.entries(CATEGORIAS) as [Categoria, typeof CATEGORIAS[Categoria]][]).map(([id, cfg]) => (
                <div key={id} className={styles.catInfo} style={{ borderLeftColor: cfg.color }}>
                  <span><span aria-hidden="true">{cfg.icono}</span> <strong>{cfg.label}</strong></span>
                  <span className={styles.catCount}>5 preguntas</span>
                </div>
              ))}
            </div>

            <button type="button" onClick={iniciar} className={styles.btnIniciar}>
              Empezar quiz →
            </button>

            <p className={styles.nivelNote}>
              Nivel recomendado: ya inviertes en fondos y quieres entender mejor los conceptos clave.
            </p>
          </div>
        )}

        {/* ── Pantalla jugando / respondida ── */}
        {(estado === 'jugando' || estado === 'respondida') && preguntaActual && (
          <div className={styles.quizPanel}>
            {/* Cabecera */}
            <div className={styles.quizHeader}>
              <span
                className={styles.categoriaBadge}
                style={{ backgroundColor: CATEGORIAS[preguntaActual.categoria].color }}
              >
                {CATEGORIAS[preguntaActual.categoria].icono} {CATEGORIAS[preguntaActual.categoria].label}
              </span>
              <span className={styles.contador}>{indice + 1} / {preguntas.length}</span>
            </div>

            {/* Barra de progreso */}
            <div className={styles.progreso}>
              <div className={styles.progresoRelleno} style={{ width: `${pctProgreso}%` }} />
            </div>

            {/* Pregunta */}
            <p className={styles.pregunta}>{preguntaActual.pregunta}</p>

            {/* Opciones */}
            <div className={styles.opciones}>
              {preguntaActual.opciones.map((op, i) => {
                let cls = styles.opcion;
                if (estado === 'respondida') {
                  if (i === preguntaActual.correcta) cls = `${styles.opcion} ${styles.opcionCorrecta}`;
                  else if (i === respuestaElegida)   cls = `${styles.opcion} ${styles.opcionIncorrecta}`;
                }
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => responder(i)}
                    disabled={estado === 'respondida'}
                    className={cls}
                    aria-pressed={respuestaElegida === i}
                  >
                    <span className={styles.opcionLetra}>{LETRAS[i]}</span>
                    <span>{op}</span>
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {estado === 'respondida' && (
              <div className={`${styles.feedback} ${respuestaElegida === preguntaActual.correcta ? styles.feedbackOk : styles.feedbackFail}`}>
                <p className={styles.feedbackTitulo}>
                  <span aria-hidden="true">{respuestaElegida === preguntaActual.correcta ? '✅' : '❌'}</span>
                  {respuestaElegida === preguntaActual.correcta ? ' Correcto' : ' Incorrecto'}
                </p>
                <p className={styles.feedbackExplicacion}>{preguntaActual.explicacion}</p>
                <button type="button" onClick={siguiente} className={styles.btnSiguiente}>
                  {indice + 1 < preguntas.length ? 'Siguiente pregunta →' : 'Ver resultado →'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Pantalla fin ── */}
        {estado === 'fin' && (
          <div className={styles.resultado}>
            <div className={styles.resultadoTarjeta}>
              <span className={styles.resultadoIcono}>{clasif.icono}</span>
              <h2 className={styles.resultadoPuntuacion} style={{ color: clasif.color }}>
                {correctas} / {preguntas.length}
              </h2>
              <p className={styles.resultadoPct}>{pctFinal}% de respuestas correctas</p>
              <p className={styles.resultadoClasif}>{clasif.texto}</p>
            </div>

            {/* Desglose por categoría */}
            <div className={styles.desglose}>
              <h3>Resultado por categoría</h3>
              {(Object.entries(resultadosCat) as [Categoria, ResultadoCategoria][])
                .filter(([, r]) => r.total > 0)
                .map(([cat, r]) => {
                  const pct = Math.round((r.correctas / r.total) * 100);
                  return (
                    <div key={cat} className={styles.desgloseItem}>
                      <span><span aria-hidden="true">{CATEGORIAS[cat].icono}</span> {CATEGORIAS[cat].label}</span>
                      <div className={styles.desgloseBar}>
                        <div
                          className={styles.desgloseRelleno}
                          style={{ width: `${pct}%`, backgroundColor: CATEGORIAS[cat].color }}
                        />
                      </div>
                      <span className={styles.desgloseScore} style={{ color: CATEGORIAS[cat].color }}>
                        {r.correctas}/{r.total}
                      </span>
                    </div>
                  );
                })}
            </div>

            <button type="button" onClick={reiniciar} className={styles.btnReiniciar}>
              ↺ Volver a empezar
            </button>
          </div>
        )}
      </main>

      <EducationalSection
        title="Conceptos clave de inversión"
        subtitle="Referencia rápida de los términos del quiz"
        icon="📈"
      >
        <section>
          <h2>Glosario rápido</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.glosarioTable}>
              <thead>
                <tr><th>Concepto</th><th>Qué mide</th><th>Valor de referencia</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>Ratio de Sharpe</strong></td><td>Rentabilidad por unidad de riesgo total</td><td>&gt; 1 es bueno, &gt; 2 es excelente</td></tr>
                <tr><td><strong>Beta</strong></td><td>Sensibilidad al mercado</td><td>1 = mercado, &gt;1 más volátil, &lt;1 menos volátil</td></tr>
                <tr><td><strong>Duration</strong></td><td>Sensibilidad del bono a tipos de interés (tasas de interés)</td><td>A más duración, más riesgo de tipo</td></tr>
                <tr><td><strong>TER</strong></td><td>Coste anual total del fondo</td><td>ETF indexado: 0,05–0,20%; activo: 1–2%</td></tr>
                <tr><td><strong>Tracking error</strong></td><td>Fidelidad de réplica al índice</td><td>Cuanto menor, mejor réplica</td></tr>
                <tr><td><strong>PER</strong></td><td>Años de beneficios para recuperar el precio</td><td>Depende del sector y crecimiento esperado</td></tr>
                <tr><td><strong>EV/EBITDA</strong></td><td>Valoración neutralizando estructura de capital</td><td>Útil para comparar entre empresas endeudadas</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ marginTop: '1.5rem' }}>
          <h2>Nivel de partida recomendado</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Este quiz asume que ya conoces conceptos básicos: qué es un fondo de inversión, qué es la bolsa,
            qué es la renta fija y cómo funciona el interés compuesto. Si aún no dominas esos conceptos,
            empieza por el <strong>Quiz de Conceptos Financieros Básicos</strong> antes de continuar aquí.
          </p>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('quiz-conceptos-inversion')} />
      <ShareCard appName="quiz-conceptos-inversion" />
      <Footer appName="quiz-conceptos-inversion" />
    </div>
  );
}
