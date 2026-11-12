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

/** S0270 (12/11/2026): la pregunta que traían las consultas de lúmenes al luxómetro. */
export const FAQ_LUMENES: PreguntaFrecuente = {
  pregunta: '¿Se pueden medir los lúmenes de una bombilla o una linterna con el móvil o celular?',
  respuesta:
    'No directamente. El lumen es la luz total que emite una fuente en todas sus direcciones, y un luxómetro, de bolsillo o de móvil, solo mide la que cae en un punto: los lux. Para medir lúmenes de verdad hace falta una esfera integradora. Lo que sí se puede hacer es estimarlos: con los lux en el centro del haz, la distancia y el ángulo del haz, la intensidad es lux × distancia² (en candelas) y los lúmenes, la intensidad por el ángulo sólido del haz. Por ejemplo, 1.000 lux a 1 metro con un haz de 10° son 1.000 candelas y unos 24 lúmenes. El resultado es una aproximación, porque supone que la luz se reparte igual dentro del haz.',
};

export const FAQ_PRECISION: PreguntaFrecuente = {
  pregunta: '¿Es fiable un luxómetro de móvil o celular comparado con uno profesional?',
  respuesta:
    'No es el mismo instrumento. Un luxómetro tiene un fotodiodo con respuesta espectral corregida y ganancia fija; un móvil mide con una cámara que reajusta la exposición sola, y ese reajuste es justo lo que impide deducir la iluminancia del brillo de la imagen. Calibrado contra una referencia y sin mover el encuadre sirve para comparar puntos de una misma estancia; para acreditar el cumplimiento de una norma de iluminación en un puesto de trabajo hace falta un aparato con certificado de trazabilidad.',
};
