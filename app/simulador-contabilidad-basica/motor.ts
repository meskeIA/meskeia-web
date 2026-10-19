/**
 * Motor del simulador de contabilidad básica: el libro mayor que se construye desde el diario.
 *
 * Vivía en `page.tsx` y se MOVIÓ aquí tal cual el 19/10/2026, al añadir los casos para clase
 * (`./casos.ts`): el Libro Mayor que ve el alumno y la respuesta de cada caso salen de la MISMA
 * `calcularMayor`. Si cada uno calculara por su lado, la app podría suspender un saldo que ella
 * misma enseña ([[feedback_motor_calculo_aparte_y_probado]]).
 *
 * Sin React ni DOM. Los importes llegan como TEXTO, que es como los guarda el formulario, y se
 * leen con `parseSpanishNumber`; lo que no es un número cuenta como 0, igual que en la página.
 */

import { parseSpanishNumber } from '@/lib';

export interface LineaAsiento {
  id: string;
  cuenta: string;
  descripcion: string;
  debe: string;
  haber: string;
}

export interface Asiento {
  id: string;
  fecha: string;
  concepto: string;
  lineas: LineaAsiento[];
}

export interface MovimientoCuenta {
  fecha: string;
  concepto: string;
  debe: number;
  haber: number;
}

export interface CuentaMayor {
  nombre: string;
  movimientos: MovimientoCuenta[];
  totalDebe: number;
  totalHaber: number;
  saldo: number;
  naturaleza: 'deudora' | 'acreedora';
}

export function totalLineas(lineas: LineaAsiento[], campo: 'debe' | 'haber'): number {
  return lineas.reduce((acc, l) => acc + (parseSpanishNumber(l[campo]) || 0), 0);
}

export function calcularMayor(asientos: Asiento[]): Map<string, CuentaMayor> {
  const mapa = new Map<string, CuentaMayor>();

  for (const asiento of asientos) {
    for (const linea of asiento.lineas) {
      const nombre = linea.cuenta.trim();
      if (!nombre) continue;

      const debe = parseSpanishNumber(linea.debe) || 0;
      const haber = parseSpanishNumber(linea.haber) || 0;
      if (debe === 0 && haber === 0) continue;

      if (!mapa.has(nombre)) {
        mapa.set(nombre, { nombre, movimientos: [], totalDebe: 0, totalHaber: 0, saldo: 0, naturaleza: 'deudora' });
      }

      const cuenta = mapa.get(nombre)!;
      cuenta.movimientos.push({ fecha: asiento.fecha, concepto: asiento.concepto, debe, haber });
      cuenta.totalDebe += debe;
      cuenta.totalHaber += haber;
    }
  }

  for (const cuenta of mapa.values()) {
    const saldoNeto = cuenta.totalDebe - cuenta.totalHaber;
    cuenta.saldo = Math.abs(saldoNeto);
    cuenta.naturaleza = saldoNeto >= 0 ? 'deudora' : 'acreedora';
  }

  return mapa;
}
