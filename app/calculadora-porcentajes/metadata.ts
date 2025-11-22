import { generateCalculatorSchema } from '@/lib/schema-templates';

// Schema.org JSON-LD para Calculadora de Porcentajes
export const jsonLd = generateCalculatorSchema({
  name: 'Calculadora de Porcentajes Avanzada',
  description:
    'Calculadora de porcentajes completa con visualizaciones interactivas. Calcula descuentos, IVA, propinas, incrementos y reducciones con ejemplos prácticos en formato español.',
  url: 'https://meskeia.com/calculadora-porcentajes/',
  calculationType: 'Porcentajes',
  features: [
    'Cálculo básico de porcentajes (% de un número)',
    'Calculadora de descuentos con precio final',
    'Cálculo de IVA (21%, 10%, 4%) con desglose',
    'Calculadora de propinas con porcentajes personalizables',
    'Incremento y reducción porcentual',
    'Visualizaciones interactivas con gráficos (barras y dona)',
    'Historial de cálculos guardado localmente',
    'Ejemplos prácticos españoles',
    'Formato español (números con coma decimal)',
    'Funciona 100% offline (PWA)',
    'Sin registros, sin publicidad, totalmente gratis',
    'Responsive y optimizado para móviles y tablets',
  ],
});
