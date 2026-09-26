/**
 * Bonificación del 50 % de la cuota en Ceuta y Melilla — art. 57 bis del TRLITPAJD
 *
 * Test unitario del motor `data/itp-ccaa.ts`. Ejecutar:
 *   npx playwright test tests/itp-bonificacion-ceuta-melilla.spec.ts
 *
 * DE DÓNDE SALE
 * ─────────────
 * El Inspector encontró el 21/08/2026 (hallazgo 157) que `simulador-gastos-compraventa-nave-
 * industrial` cobraba en Ceuta el tipo general del 6 % —30.000 € sobre 500.000 €— cuando le
 * corresponde la mitad. Al barrer el clúster resultó que **ninguna de las siete apps** que
 * usan `ITP_CCAA` la aplicaba: garaje, trastero, solar, terreno rústico, local comercial,
 * nave industrial y el estimador de vivienda.
 *
 * La bonificación se verificó contra el BOE el 23/08/2026 (RDL 1/1993, art. 57 bis añadido
 * por la Ley 53/2002). Su apartado 3.a) la reconoce a las «transmisiones y arrendamiento de
 * inmuebles situados en Ceuta o Melilla» SIN distinguir el uso —una nave entra igual que una
 * vivienda—, y el apartado 1 hace lo mismo con la cuota gradual de AJD cuando el Registro
 * radica allí. Por eso se aplica en el MOTOR y no app por app: se cumple por el SITIO del
 * inmueble y no depende de nada que haya que preguntarle al comprador.
 *
 * Este test es el candado de esa decisión. Si alguien mueve la bonificación a las apps o la
 * retira del motor, las siete vuelven a cobrar el doble en silencio.
 */

import { test, expect } from '@playwright/test';
import {
  calcularITP,
  calcularAJD,
  aplicarBonificacionCiudad,
  ITP_CCAA,
  BONIFICACION_CUOTA_CEUTA_MELILLA,
  TERRITORIOS_SIN_IVA,
  calcularRegistro,
  calcularArancelNotarial,
  estimarFacturaNotarial,
  honorariosLlevanIVA,
} from '../data/itp-ccaa';

test.describe('ITP — bonificación del 50 % en Ceuta y Melilla (art. 57 bis TRLITPAJD)', () => {
  test('Ceuta: 500.000 € tributan 15.000 €, la mitad del 6 % general', () => {
    // Tipo general declarado para Ceuta: 6 % → 30.000 €. Bonificado al 50 % → 15.000 €.
    expect(ITP_CCAA['ceuta'].tipoGeneral).toBe(6);
    expect(calcularITP(500000, 'ceuta', 'otro')).toBeCloseTo(15000, 2);
  });

  test('Melilla: mismo trato que Ceuta', () => {
    expect(calcularITP(500000, 'melilla', 'otro')).toBeCloseTo(15000, 2);
  });

  test('el tipo EFECTIVO resultante es el 3 %, y así debe rotularse', () => {
    expect((calcularITP(500000, 'ceuta', 'otro') / 500000) * 100).toBeCloseTo(3, 6);
  });

  test('la bonificación NO alcanza a las demás comunidades', () => {
    // Madrid, 6 % plano, sin bonificación
    expect(calcularITP(500000, 'madrid', 'otro')).toBeCloseTo(30000, 2);
    // Canarias, 6,5 % plano
    expect(calcularITP(500000, 'canarias', 'otro')).toBeCloseTo(32500, 2);
    // Murcia, 7,75 % plano
    expect(calcularITP(300000, 'murcia', 'otro')).toBeCloseTo(23250, 2);
  });

  test('el AJD de Ceuta y Melilla también se bonifica (art. 57 bis.1)', () => {
    // Ceuta declara AJD del 0,5 %: 500.000 × 0,5 % = 2.500 → bonificado 1.250
    expect(ITP_CCAA['ceuta'].ajd).toBe(0.5);
    expect(calcularAJD(500000, 'ceuta', { objeto: 'otro' })).toBeCloseTo(1250, 2);
    // Madrid, 0,75 %, sin bonificar
    expect(calcularAJD(500000, 'madrid', { objeto: 'otro' })).toBeCloseTo(3750, 2);
  });

  /**
   * Con un tipo forzado NO se bonifica, y es deliberado: los tipos reducidos declarados para
   * Ceuta y Melilla ya vienen con el 50 % descontado (su `tipo: 3` es el 6 % bonificado).
   * Volver a aplicarlo dejaría la cuota en la cuarta parte.
   */
  test('un tipo forzado no vuelve a bonificarse', () => {
    const reducido = ITP_CCAA['ceuta'].tiposReducidos[0];
    expect(reducido.tipo).toBe(3);
    expect(calcularITP(500000, 'ceuta', 'otro', reducido.tipo)).toBeCloseTo(15000, 2);
  });

  test('la constante de bonificación es del 50 %', () => {
    expect(BONIFICACION_CUOTA_CEUTA_MELILLA).toBe(0.5);
    expect(aplicarBonificacionCiudad(1000, 'ceuta')).toBe(500);
    expect(aplicarBonificacionCiudad(1000, 'madrid')).toBe(1000);
  });
});

test.describe('Territorios donde no rige el IVA español', () => {
  /**
   * Canarias tributa por IGIC y las ciudades autónomas por IPSI. Las siete apps del clúster
   * ofrecen esos territorios en su desplegable y les liquidaban IVA del 21 % sin advertirlo
   * (hallazgo 156): una nave de 500.000 € en Canarias cobraba 105.000 € inexistentes.
   */
  test('están declarados los tres, con el impuesto que les corresponde', () => {
    expect(TERRITORIOS_SIN_IVA['canarias']?.impuesto).toBe('IGIC');
    expect(TERRITORIOS_SIN_IVA['ceuta']?.impuesto).toBe('IPSI');
    expect(TERRITORIOS_SIN_IVA['melilla']?.impuesto).toBe('IPSI');
  });

  test('y ninguna comunidad de territorio IVA aparece en la lista', () => {
    expect(TERRITORIOS_SIN_IVA['madrid']).toBeUndefined();
    expect(TERRITORIOS_SIN_IVA['baleares']).toBeUndefined();
  });
});

// ── Notaría y registro sin IVA donde no rige (26/09/2026, hallazgo 2214) ─────────────
// El Inspector midió en terreno-rustico, Canarias, 150.000 €: «Registro de la Propiedad
// (IVA incluido)» 217,94 €, de los que 37,82 € eran un IVA del 21 % que allí no existe. El
// Registro es el de la finca y el notario presta un servicio relacionado con el inmueble
// (art. 70.Uno.1.º LIVA): en Canarias se factura IGIC y en Ceuta y Melilla IPSI. El motor
// no los calcula; devuelve el arancel sin impuesto indirecto y la app lo nombra.
test.describe('Notaría y registro — sin IVA en Canarias, Ceuta y Melilla', () => {
  test('Canarias, 150.000 €: registro 180,11 € (el 217,94 € de antes llevaba un 21 % inexistente)', () => {
    expect(calcularRegistro(150000, 'canarias')).toBeCloseTo(180.11, 2);
    expect(calcularRegistro(150000, 'madrid')).toBeCloseTo(217.94, 2);
    // Sin territorio, península: la firma antigua conserva su resultado.
    expect(calcularRegistro(150000)).toBeCloseTo(217.94, 2);
  });

  test('la notaría de Ceuta y Melilla es la de Madrid sin el 21 %', () => {
    for (const ccaa of ['canarias', 'ceuta', 'melilla'] as const) {
      expect(honorariosLlevanIVA(ccaa)).toBe(false);
      expect(calcularArancelNotarial(150000, ccaa) * 1.21).toBeCloseTo(calcularArancelNotarial(150000, 'madrid'), 6);
      expect(estimarFacturaNotarial(150000, ccaa).medio * 1.21).toBeCloseTo(estimarFacturaNotarial(150000).medio, 6);
    }
    expect(honorariosLlevanIVA('baleares')).toBe(true);
    expect(honorariosLlevanIVA(undefined)).toBe(true);
  });
});
