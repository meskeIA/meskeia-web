/**
 * Tests unitarios para `urlSinMarcaFrom` (lib/trackingFrom.ts)
 *
 * La marca `from` mide UN clic de descubrimiento interno. Para que eso sea
 * cierto tiene que consumirse: el tracker la lee, registra la visita y la retira
 * de la URL. Mientras se quedaba en la barra de direcciones, cada recarga y cada
 * vuelta atrás la volvían a registrar, y el resultado no era un error visible
 * sino un número plausible — clics de RelatedApps que nadie dio.
 *
 * El primer bloque REINYECTA el caso real medido el 09/09/2026 en el dump de
 * Turso: una sesión argentina con UN clic desde `simulador-elasticidad-precio` a
 * las 15:18 y tres registros idénticos más a las 20:02, 21:48 y 23:21 sin volver
 * a pasar por la app de origen. Sobre 30 días, el 12,1% de los 2.191 clics
 * `related-*` se atribuían a una app que esa IP no había visitado en las 2 h
 * previas, y el 29,1% eran repeticiones exactas.
 *
 * Hermano de tests/url-compartir.spec.ts, que cubre el mismo `from` viajando a
 * un tercero dentro de un enlace compartido (defecto del 04/09/2026).
 *
 * Ejecutar con: npx playwright test tests/marca-from.spec.ts
 */

import { test, expect } from '@playwright/test';

import { urlSinMarcaFrom, withFrom } from '../lib/trackingFrom';

/** Lo que hace AnalyticsTracker con la URL de aterrizaje, replicado tal cual. */
function comoLoLeeElTracker(href: string): string | null {
  const url = new URL(href);
  const urlParams = new URLSearchParams(url.search);
  const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
  return urlParams.get('from') || hashParams.get('from');
}

/**
 * Una visita: el tracker lee la marca y acto seguido la consume. Devuelve lo que
 * quedaría registrado y la URL con la que se queda la pestaña.
 */
function visitar(href: string): { registrado: string | null; urlDespues: string } {
  const registrado = comoLoLeeElTracker(href);
  return { registrado, urlDespues: urlSinMarcaFrom(href) ?? href };
}

test.describe('urlSinMarcaFrom — el caso de origen (08/09/2026)', () => {
  test('el defecto se reproduce: sin consumir la marca, 1 clic son 4 registros', () => {
    // Conducta ANTIGUA del tracker: leer la URL y dejarla intacta. Las cuatro
    // lecturas son las cuatro cargas reales de aquella sesión (15:18 · 20:02 ·
    // 21:48 · 23:21), y las cuatro registraban lo mismo.
    const aterrizaje =
      'https://meskeia.com/simulador-oferta-demanda/#from=related-simulador-elasticidad-precio';
    const registrados = [1, 2, 3, 4].map(() => comoLoLeeElTracker(aterrizaje));

    expect(registrados).toEqual(Array(4).fill('related-simulador-elasticidad-precio'));
  });

  test('un clic real se registra UNA vez, no en cada recarga', () => {
    // 15:18 — clic en la tarjeta de RelatedApps.
    const aterrizaje =
      'https://meskeia.com/simulador-oferta-demanda/#from=related-simulador-elasticidad-precio';

    const primera = visitar(aterrizaje);
    expect(primera.registrado).toBe('related-simulador-elasticidad-precio');
    expect(primera.urlDespues).toBe('https://meskeia.com/simulador-oferta-demanda/');

    // 20:02, 21:48, 23:21 — recargas de la MISMA pestaña. Antes cada una repetía
    // el registro; ahora la URL ya no lleva marca que registrar.
    let url = primera.urlDespues;
    for (const _recarga of [1, 2, 3]) {
      const otra = visitar(url);
      expect(otra.registrado).toBeNull();
      url = otra.urlDespues;
    }
    expect(url).toBe('https://meskeia.com/simulador-oferta-demanda/');
  });

  test('la vuelta atrás tampoco lo repite', () => {
    // El visitante salta a otra app y vuelve con el botón atrás: la entrada del
    // historial ya se reescribió sin la marca.
    const { urlDespues } = visitar(
      'https://meskeia.com/simulador-oferta-demanda/#from=related-simulador-elasticidad-precio'
    );
    expect(comoLoLeeElTracker(urlDespues)).toBeNull();
  });

  test('el segundo clic SÍ se registra: se limpia la marca, no la medición', () => {
    // Volver a pasar por la app de origen y pinchar otra vez es un clic nuevo.
    const segundoClic = withFrom('/simulador-oferta-demanda/', 'related-simulador-elasticidad-precio');
    const href = new URL(segundoClic, 'https://meskeia.com').toString();
    expect(visitar(href).registrado).toBe('related-simulador-elasticidad-precio');
  });
});

test.describe('urlSinMarcaFrom — las dos formas de la marca', () => {
  test('fragmento (#from=, navegación interna)', () => {
    expect(urlSinMarcaFrom('https://meskeia.com/sonometro/#from=home-search')).toBe(
      'https://meskeia.com/sonometro/'
    );
  });

  test('parámetro (?from=, salto cross-dominio)', () => {
    expect(urlSinMarcaFrom('https://cronicum.com/historia-roma/?from=meskeia')).toBe(
      'https://cronicum.com/historia-roma/'
    );
  });

  test('el fragmento fósil con el ?ref=share pegado dentro también se limpia', () => {
    // Producido por el defecto del 04/09; el enlace sigue circulando.
    expect(
      urlSinMarcaFrom(
        'https://meskeia.com/simulador-pendulo/#from=related-simulador-mas-resorte?ref=share'
      )
    ).toBe('https://meskeia.com/simulador-pendulo/');
  });
});

test.describe('urlSinMarcaFrom — lo que NO debe tocar', () => {
  test('sin marca devuelve null: no hay nada que reescribir', () => {
    expect(urlSinMarcaFrom('https://meskeia.com/estimador-irpf/')).toBeNull();
  });

  test('un ancla de verdad se conserva intacta', () => {
    expect(urlSinMarcaFrom('https://meskeia.com/curso-python/#modulo-3')).toBeNull();
  });

  test('ref=share sobrevive: cada apertura de un enlace compartido es un aterrizaje real', () => {
    const limpia = urlSinMarcaFrom(
      'https://meskeia.com/simulador-gas-ideal/?ref=share#from=related-x'
    );
    expect(limpia).toBe('https://meskeia.com/simulador-gas-ideal/?ref=share');
    expect(new URL(limpia!).searchParams.get('ref')).toBe('share');
  });

  test('los demás parámetros de la app sobreviven', () => {
    expect(urlSinMarcaFrom('https://meskeia.com/calculadora-iva/?tipo=21&base=1000#from=catalog')).toBe(
      'https://meskeia.com/calculadora-iva/?tipo=21&base=1000'
    );
  });

  test('un ancla acompañada de la marca conserva el ancla, y sin `=` de sobra', () => {
    // Reconstruir el fragmento con URLSearchParams.toString() dejaría `#modulo-3=`,
    // que ya no apunta a ningún elemento de la página.
    expect(urlSinMarcaFrom('https://meskeia.com/curso-python/#from=home-daily&modulo-3')).toBe(
      'https://meskeia.com/curso-python/#modulo-3'
    );
  });
});
