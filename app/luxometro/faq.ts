/**
 * Preguntas que la página pinta en su FAQ visible y que el FAQPage de `metadata.ts` repite.
 * Viven aquí, una sola vez, para que las dos no vuelvan a divergir: hasta el 09/11/2026 la de
 * la precisión tenía dos redacciones y dos respuestas, y la visible seguía hablando del sensor
 * de luz ambiente y callaba que la cámara reajusta la exposición (hallazgo 4265).
 */
export interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

export const FAQ_PRECISION: PreguntaFrecuente = {
  pregunta: '¿Es fiable un luxómetro de móvil o celular comparado con uno profesional?',
  respuesta:
    'No es el mismo instrumento. Un luxómetro tiene un fotodiodo con respuesta espectral corregida y ganancia fija; un móvil mide con una cámara que reajusta la exposición sola, y ese reajuste es justo lo que impide deducir la iluminancia del brillo de la imagen. Calibrado contra una referencia y sin mover el encuadre sirve para comparar puntos de una misma estancia; para acreditar el cumplimiento de una norma de iluminación en un puesto de trabajo hace falta un aparato con certificado de trazabilidad.',
};
