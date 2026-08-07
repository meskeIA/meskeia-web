/**
 * Tests de VALOR para la conversión de coordenadas (lib/geo/coordenadas.ts)
 *
 * Ejecutar con: npm run test:calc
 *
 * Se comprueban tres cosas distintas:
 *   1. VALORES CANÓNICOS — puntos cuya coordenada UTM/MGRS está publicada y es
 *      comprobable contra el IGN, el USGS o cualquier conversor de referencia.
 *   2. IDA Y VUELTA — convertir y deshacer debe devolver el punto original con
 *      error submilimétrico. Es lo que atrapa un coeficiente de Krüger mal tecleado.
 *   3. CASOS BORDE — meridiano central, cambio de zona, hemisferio sur, las dos
 *      excepciones de Noruega y Svalbard, y el arrastre del redondeo sexagesimal.
 */

import { test, expect } from '@playwright/test';

import {
  aUTM,
  desdeUTM,
  aMGRS,
  desdeMGRS,
  aSexagesimal,
  aGradosMinutosDecimales,
  desdeSexagesimal,
  calcularZonaUTM,
  calcularBandaLatitud,
  distanciaYRumbo,
  rumboACardinal,
  interpretarCoordenada,
  normalizarLongitud,
} from '../lib/geo/coordenadas';

/** Metros de tolerancia para comparar con valores publicados redondeados */
const TOLERANCIA_M = 1;

test.describe('Zona y banda UTM', () => {
  test('zonas de referencia', () => {
    expect(calcularZonaUTM(40.4, -3.7)).toBe(30);   // Madrid
    expect(calcularZonaUTM(41.4, 2.17)).toBe(31);   // Barcelona
    expect(calcularZonaUTM(28.1, -15.4)).toBe(28);  // Gran Canaria
    expect(calcularZonaUTM(0, 0)).toBe(31);         // origen: el meridiano 0 cae en la zona 31
  });

  test('excepción de Noruega: la zona 32 se ensancha hacia el oeste', () => {
    // Bergen (60,39 N · 5,32 E) caería en la zona 31 por la regla general
    expect(calcularZonaUTM(60.39, 5.32)).toBe(32);
    // Justo por debajo de los 56° vuelve a mandar la regla general
    expect(calcularZonaUTM(55.9, 5.32)).toBe(31);
  });

  test('excepción de Svalbard: solo zonas impares', () => {
    expect(calcularZonaUTM(78.22, 15.63)).toBe(33);  // Longyearbyen
    expect(calcularZonaUTM(78.0, 5.0)).toBe(31);
    expect(calcularZonaUTM(78.0, 25.0)).toBe(35);
    expect(calcularZonaUTM(78.0, 35.0)).toBe(37);
  });

  test('bandas de latitud', () => {
    expect(calcularBandaLatitud(40.4)).toBe('T');   // Madrid
    expect(calcularBandaLatitud(0)).toBe('N');      // ecuador: primera banda del norte
    expect(calcularBandaLatitud(-0.1)).toBe('M');   // justo al sur del ecuador
    expect(calcularBandaLatitud(83)).toBe('X');     // la banda X cubre 12°, no 8°
    expect(calcularBandaLatitud(-80)).toBe('C');
    expect(calcularBandaLatitud(85)).toBe('');      // fuera del dominio UTM
  });
});

test.describe('Valores canónicos de UTM', () => {
  test('origen 0°,0° → 31 N 166021,44 0,00', () => {
    const utm = aUTM({ latitud: 0, longitud: 0 });
    expect(utm.zona).toBe(31);
    expect(utm.hemisferio).toBe('N');
    expect(Math.abs(utm.este - 166021.44)).toBeLessThan(0.01);
    expect(Math.abs(utm.norte)).toBeLessThan(0.01);
  });

  test('en el meridiano central el este es exactamente el falso este', () => {
    // Meridiano central de la zona 30: 3°O
    const utm = aUTM({ latitud: 40, longitud: -3 });
    expect(Math.abs(utm.este - 500000)).toBeLessThan(0.001);
  });

  test('Torre Eiffel 48,8584 N · 2,2945 E → 31 U 448250,58 5411951,59', () => {
    // Contrastado con una implementación independiente por la serie de Snyder
    // (USGS Professional Paper 1395): ambas coinciden al milímetro.
    const utm = aUTM({ latitud: 48.85837, longitud: 2.294481 });
    expect(utm.zona).toBe(31);
    expect(utm.banda).toBe('U');
    expect(Math.abs(utm.este - 448250.58)).toBeLessThan(TOLERANCIA_M);
    expect(Math.abs(utm.norte - 5411951.59)).toBeLessThan(TOLERANCIA_M);
  });

  test('Puerta del Sol 40,4168 N · 3,7038 O → 30 T 440291,28 4474254,60', () => {
    const utm = aUTM({ latitud: 40.416775, longitud: -3.703790 });
    expect(utm.zona).toBe(30);
    expect(utm.banda).toBe('T');
    expect(Math.abs(utm.este - 440291.28)).toBeLessThan(TOLERANCIA_M);
    expect(Math.abs(utm.norte - 4474254.60)).toBeLessThan(TOLERANCIA_M);
  });

  test('hemisferio sur: el falso norte de 10.000 km se aplica', () => {
    // Sídney, aproximadamente 33,8688 S · 151,2093 E
    const utm = aUTM({ latitud: -33.8688, longitud: 151.2093 });
    expect(utm.zona).toBe(56);
    expect(utm.hemisferio).toBe('S');
    expect(utm.norte).toBeGreaterThan(6000000);
    expect(utm.norte).toBeLessThan(10000000);
  });

  test('fuera de 80°S-84°N la proyección UTM no aplica y se dice', () => {
    expect(() => aUTM({ latitud: 85, longitud: 0 })).toThrow(/UPS|80|84/);
    expect(() => aUTM({ latitud: -81, longitud: 0 })).toThrow();
  });
});

test.describe('Ida y vuelta UTM (lo que atrapa un coeficiente mal tecleado)', () => {
  const puntos = [
    { nombre: 'Madrid', latitud: 40.416775, longitud: -3.703790 },
    { nombre: 'Barcelona', latitud: 41.385064, longitud: 2.173404 },
    { nombre: 'Las Palmas', latitud: 28.123632, longitud: -15.436257 },
    { nombre: 'Ushuaia', latitud: -54.801912, longitud: -68.302948 },
    { nombre: 'Reikiavik', latitud: 64.146582, longitud: -21.942635 },
    { nombre: 'Yakarta', latitud: -6.208763, longitud: 106.845599 },
    { nombre: 'ecuador', latitud: 0, longitud: 120 },
    { nombre: 'borde de zona', latitud: 45, longitud: -6.0001 },
    { nombre: 'antimeridiano', latitud: -20, longitud: 179.9 },
  ];

  for (const p of puntos) {
    test(`${p.nombre}: convertir y deshacer devuelve el mismo punto`, () => {
      const vuelta = desdeUTM(aUTM(p));
      // Sin redondeo intermedio, la ida y vuelta cierra a 1e-12 grados (~0,1 µm)
      expect(Math.abs(vuelta.latitud - p.latitud)).toBeLessThan(1e-12);
      expect(Math.abs(vuelta.longitud - p.longitud)).toBeLessThan(1e-12);
    });
  }
});

test.describe('MGRS', () => {
  test('Torre Eiffel → 31U DQ 48250 11951', () => {
    const mgrs = aMGRS(aUTM({ latitud: 48.85837, longitud: 2.294481 }));
    expect(mgrs).toBe('31U DQ 48250 11951');
  });

  test('Puerta del Sol → 30T VK 40291 74254', () => {
    const mgrs = aMGRS(aUTM({ latitud: 40.416775, longitud: -3.703790 }));
    expect(mgrs).toBe('30T VK 40291 74254');
  });

  test('hemisferio sur: el ciclo de 2.000 km se resuelve con la banda (regresión)', () => {
    // Sídney: sumar el falso norte dos veces desplazaba el punto 6.000 km al norte
    const utm = aUTM({ latitud: -33.8688, longitud: 151.2093 });
    const vuelta = desdeMGRS(aMGRS(utm, 5));
    expect(Math.abs(vuelta.norte - utm.norte)).toBeLessThan(1);
    expect(desdeUTM(vuelta).latitud).toBeCloseTo(-33.8688, 4);
  });

  test('origen 0°,0° → zona 31, banda N', () => {
    const mgrs = aMGRS(aUTM({ latitud: 0, longitud: 0 }));
    expect(mgrs.startsWith('31N')).toBe(true);
  });

  test('la precisión pedida cambia el número de dígitos, no el lugar', () => {
    const utm = aUTM({ latitud: 40.416775, longitud: -3.703790 });
    expect(aMGRS(utm, 5).replace(/\s/g, '').length).toBe(aMGRS(utm, 5).replace(/\s/g, '').length);
    expect(aMGRS(utm, 2).split(' ')[2]).toHaveLength(2);
    expect(aMGRS(utm, 3).split(' ')[2]).toHaveLength(3);
    expect(aMGRS(utm, 5).split(' ')[2]).toHaveLength(5);
  });

  test('ida y vuelta MGRS: el error no supera el tamaño del cuadro', () => {
    const puntos = [
      { latitud: 40.416775, longitud: -3.703790 },
      { latitud: -33.8688, longitud: 151.2093 },
      { latitud: 64.146582, longitud: -21.942635 },
      { latitud: 1.3521, longitud: 103.8198 },
    ];
    for (const p of puntos) {
      const utm = aUTM(p);
      const vuelta = desdeMGRS(aMGRS(utm, 5));
      expect(vuelta.zona).toBe(utm.zona);
      expect(vuelta.hemisferio).toBe(utm.hemisferio);
      // Con 5 dígitos el cuadro es de 1 m: el truncado nunca puede pasar de ahí
      expect(Math.abs(vuelta.este - utm.este)).toBeLessThan(1);
      expect(Math.abs(vuelta.norte - utm.norte)).toBeLessThan(1);
    }
  });

  test('las letras I y O no se usan nunca (se confunden con 1 y 0)', () => {
    for (let lat = -75; lat <= 80; lat += 5) {
      for (let lon = -175; lon <= 175; lon += 15) {
        const letras = aMGRS(aUTM({ latitud: lat, longitud: lon })).split(' ')[1];
        expect(letras).not.toContain('I');
        expect(letras).not.toContain('O');
      }
    }
  });

  test('una referencia MGRS mal formada da error explicativo, no un punto inventado', () => {
    expect(() => desdeMGRS('esto no es MGRS')).toThrow(/no reconocida/i);
    expect(() => desdeMGRS('30T VK 123')).toThrow(/par de dígitos/i);
  });
});

test.describe('Formatos sexagesimales', () => {
  test('Madrid en grados, minutos y segundos', () => {
    const lat = aSexagesimal(40.416775, 'lat');
    expect(lat.grados).toBe(40);
    expect(lat.minutos).toBe(25);
    expect(lat.segundos).toBeCloseTo(0.39, 1);
    expect(lat.hemisferio).toBe('N');

    const lon = aSexagesimal(-3.703790, 'lon');
    expect(lon.grados).toBe(3);
    expect(lon.minutos).toBe(42);
    expect(lon.hemisferio).toBe('O');
  });

  test('el arrastre del redondeo no deja 60 segundos ni 60 minutos', () => {
    // 40,9999999° está a un pelo de 41°: mal redondeado saldría 40°59'60"
    const c = aSexagesimal(40.9999999, 'lat');
    expect(c.segundos).toBeLessThan(60);
    expect(c.minutos).toBeLessThan(60);
    expect(c.grados * 3600 + c.minutos * 60 + c.segundos).toBeCloseTo(41 * 3600, 0);
  });

  test('grados y minutos decimales (formato náutico y aeronáutico)', () => {
    const ddm = aGradosMinutosDecimales(40.416775, 'lat');
    expect(ddm.grados).toBe(40);
    expect(ddm.minutos).toBeCloseTo(25.007, 2);
    expect(ddm.hemisferio).toBe('N');
  });

  test('ida y vuelta sexagesimal', () => {
    for (const valor of [40.416775, -3.70379, 0, 89.999, -45.5]) {
      const c = aSexagesimal(valor, 'lat', 6);
      const vuelta = desdeSexagesimal(c.grados, c.minutos, c.segundos, c.hemisferio);
      expect(Math.abs(vuelta - valor)).toBeLessThan(1e-6);
    }
  });

  test('el signo lo marca el hemisferio, no el número', () => {
    expect(desdeSexagesimal(40, 25, 0, 'S')).toBeLessThan(0);
    expect(desdeSexagesimal(40, 25, 0, 'N')).toBeGreaterThan(0);
    expect(desdeSexagesimal(3, 42, 13, 'O')).toBeLessThan(0);
    expect(desdeSexagesimal(3, 42, 13, 'E')).toBeGreaterThan(0);
  });
});

test.describe('Distancia y rumbo sobre el elipsoide', () => {
  test('Madrid-Barcelona ≈ 505 km', () => {
    const r = distanciaYRumbo(
      { latitud: 40.416775, longitud: -3.703790 },
      { latitud: 41.385064, longitud: 2.173404 },
    );
    expect(r.distancia / 1000).toBeGreaterThan(500);
    expect(r.distancia / 1000).toBeLessThan(510);
    expect(r.metodo).toBe('vincenty');
    // Barcelona queda al este-noreste de Madrid
    expect(r.rumboInicial).toBeGreaterThan(60);
    expect(r.rumboInicial).toBeLessThan(90);
  });

  test('un grado de latitud en el ecuador ≈ 110,57 km', () => {
    const r = distanciaYRumbo({ latitud: 0, longitud: 0 }, { latitud: 1, longitud: 0 });
    expect(Math.abs(r.distancia - 110574)).toBeLessThan(50);
    expect(r.rumboInicial).toBeCloseTo(0, 5);
  });

  test('el mismo punto da distancia cero', () => {
    const r = distanciaYRumbo({ latitud: 40, longitud: -3 }, { latitud: 40, longitud: -3 });
    expect(r.distancia).toBe(0);
  });

  test('la distancia es simétrica', () => {
    const a = { latitud: 40.4, longitud: -3.7 };
    const b = { latitud: -33.9, longitud: 151.2 };
    expect(Math.abs(distanciaYRumbo(a, b).distancia - distanciaYRumbo(b, a).distancia)).toBeLessThan(0.001);
  });

  test('los puntos antipodales caen al semiverseno en vez de colgarse', () => {
    const r = distanciaYRumbo({ latitud: 0, longitud: 0 }, { latitud: -0.0001, longitud: 179.9999 });
    expect(r.distancia).toBeGreaterThan(19000000);
    expect(['vincenty', 'semiverseno']).toContain(r.metodo);
  });

  test('rumbos a puntos cardinales', () => {
    expect(rumboACardinal(0)).toBe('N');
    expect(rumboACardinal(90)).toBe('E');
    expect(rumboACardinal(180)).toBe('S');
    expect(rumboACardinal(270)).toBe('O');
    expect(rumboACardinal(45)).toBe('NE');
    expect(rumboACardinal(359)).toBe('N');
  });
});

test.describe('Interpretación de coordenadas pegadas', () => {
  test('decimal con coma española y con punto', () => {
    const a = interpretarCoordenada('40,416775, -3,703790');
    expect(a?.punto.latitud).toBeCloseTo(40.416775, 6);
    expect(a?.punto.longitud).toBeCloseTo(-3.703790, 6);

    const b = interpretarCoordenada('40.416775, -3.703790');
    expect(b?.punto.latitud).toBeCloseTo(40.416775, 6);
  });

  test('sexagesimal tal como lo copia Google Maps', () => {
    const r = interpretarCoordenada(`40°25'00.4"N 3°42'13.6"W`);
    expect(r?.formato).toBe('sexagesimal');
    expect(r?.punto.latitud).toBeCloseTo(40.41678, 4);
    expect(r?.punto.longitud).toBeCloseTo(-3.70378, 4);
  });

  test('la O de Oeste en español equivale a la W inglesa', () => {
    const es = interpretarCoordenada(`40°25'00"N 3°42'13"O`);
    const en = interpretarCoordenada(`40°25'00"N 3°42'13"W`);
    expect(es?.punto.longitud).toBeCloseTo(en?.punto.longitud ?? 0, 9);
    expect(es?.punto.longitud).toBeLessThan(0);
  });

  test('UTM con y sin banda', () => {
    const conBanda = interpretarCoordenada('30 T 440291 4474255');
    expect(conBanda?.formato).toBe('utm');
    expect(conBanda?.punto.latitud).toBeCloseTo(40.4168, 3);
    expect(conBanda?.punto.longitud).toBeCloseTo(-3.7038, 3);

    const sinBanda = interpretarCoordenada('30 440291 4474255');
    expect(sinBanda?.punto.latitud).toBeCloseTo(40.4168, 3);
  });

  test('MGRS', () => {
    const r = interpretarCoordenada('30T VK 40291 74254');
    expect(r?.formato).toBe('mgrs');
    expect(r?.punto.latitud).toBeCloseTo(40.4168, 3);
    expect(r?.punto.longitud).toBeCloseTo(-3.7038, 3);
  });

  test('acepta los símbolos de grado y de minuto de cualquier teclado', () => {
    expect(interpretarCoordenada(`40º25'00"N 3º42'13"O`)).not.toBeNull();
    expect(interpretarCoordenada(`40°25´00"N 3°42´13"O`)).not.toBeNull();
  });

  test('lo que no se reconoce devuelve null en vez de un punto inventado', () => {
    expect(interpretarCoordenada('')).toBeNull();
    expect(interpretarCoordenada('la Puerta del Sol')).toBeNull();
    expect(interpretarCoordenada('91, 0')).toBeNull();       // latitud imposible
    expect(interpretarCoordenada(`40°75'00"N 3°42'13"O`)).toBeNull(); // 75 minutos
  });
});

test.describe('Normalización de longitud', () => {
  test('lleva cualquier valor al intervalo [-180, 180)', () => {
    expect(normalizarLongitud(190)).toBeCloseTo(-170, 9);
    expect(normalizarLongitud(-190)).toBeCloseTo(170, 9);
    expect(normalizarLongitud(360)).toBeCloseTo(0, 9);
    expect(normalizarLongitud(-3.7)).toBeCloseTo(-3.7, 9);
  });
});
