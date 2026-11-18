/**
 * Pregunta que la página pinta en su FAQ visible y metadata.ts declara en el FAQPage (§1.ter): una
 * sola fuente. Hallazgo 5111 (18/11/2026): iba dos veces; la visible justificaba el unilateral con
 * una premisa falsa («un fármaco solo puede mejorar, no empeorar») y la del FAQPage callaba el aviso
 * de no elegirlo a la vista de los datos. Esta conserva los dos avisos.
 */

export interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
  consejo: string;
}

export const FAQ_BILATERAL_UNILATERAL: PreguntaFrecuente = {
  pregunta: '¿Cuándo se usa un test bilateral y cuándo uno unilateral?',
  respuesta:
    'Un test bilateral comprueba si la media difiere de μ₀ en cualquier dirección (H₁: μ ≠ μ₀) y reparte α entre las dos colas. Un test unilateral (derecho o izquierdo) solo busca diferencias en una dirección (H₁: μ > μ₀ o μ < μ₀) y concentra toda la región de rechazo en una cola. Se elige cuando, antes de ver los datos, solo una dirección tiene consecuencias para la decisión: por ejemplo, un lote que se rechaza si pesa menos de lo especificado, mientras que pesar de más no cambia nada. Es más potente para detectar el efecto en esa dirección, pero no detecta desviaciones en la contraria.',
  consejo:
    'No elijas el unilateral a posteriori, al ver hacia dónde caen los datos: eso infla α y es mala práctica.',
};
