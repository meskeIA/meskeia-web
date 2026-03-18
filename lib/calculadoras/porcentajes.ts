/**
 * Lógica pura para la calculadora de porcentajes.
 * Sin dependencias de React ni del DOM — apta para uso en servidor MCP.
 */

export type ModoPorcentaje = 'percentOf' | 'whatPercent' | 'increase' | 'decrease' | 'variation';

export interface ParametrosPorcentaje {
  modo: ModoPorcentaje;
  valor1: number;
  valor2: number;
}

export interface ResultadoPorcentaje {
  resultado: number;
  detalle: string;
  esProcentaje: boolean; // true si el resultado se expresa en %
}

/**
 * Ejecuta el cálculo de porcentaje según el modo indicado.
 *
 * Modos disponibles:
 * - percentOf:  ¿Cuánto es el X% de Y?
 * - whatPercent: ¿Qué % es X de Y?
 * - increase:   Aumentar X en Y%
 * - decrease:   Disminuir X en Y%
 * - variation:  Variación porcentual de X a Y
 */
export function calcularPorcentaje(params: ParametrosPorcentaje): ResultadoPorcentaje {
  const { modo, valor1, valor2 } = params;

  const r = (n: number) => Math.round(n * 10000) / 10000;

  switch (modo) {
    case 'percentOf': {
      const resultado = r((valor1 / 100) * valor2);
      return {
        resultado,
        detalle: `El ${valor1}% de ${valor2} es ${resultado}`,
        esProcentaje: false,
      };
    }

    case 'whatPercent': {
      if (valor2 === 0) throw new Error('El total no puede ser cero');
      const resultado = r((valor1 / valor2) * 100);
      return {
        resultado,
        detalle: `${valor1} representa el ${resultado}% de ${valor2}`,
        esProcentaje: true,
      };
    }

    case 'increase': {
      const resultado = r(valor1 * (1 + valor2 / 100));
      const aumento = r(resultado - valor1);
      return {
        resultado,
        detalle: `${valor1} + ${valor2}% = ${resultado} (aumento de ${aumento})`,
        esProcentaje: false,
      };
    }

    case 'decrease': {
      const resultado = r(valor1 * (1 - valor2 / 100));
      const disminucion = r(valor1 - resultado);
      return {
        resultado,
        detalle: `${valor1} - ${valor2}% = ${resultado} (disminución de ${disminucion})`,
        esProcentaje: false,
      };
    }

    case 'variation': {
      if (valor1 === 0) throw new Error('El valor inicial no puede ser cero');
      const resultado = r(((valor2 - valor1) / valor1) * 100);
      const direccion = resultado >= 0 ? 'aumento' : 'disminución';
      return {
        resultado,
        detalle: `De ${valor1} a ${valor2} hay un ${direccion} del ${Math.abs(resultado)}%`,
        esProcentaje: true,
      };
    }

    default:
      throw new Error(`Modo desconocido: ${modo}`);
  }
}
