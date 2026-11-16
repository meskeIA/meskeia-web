/**
 * Datos y motor del comparador de coste de vida.
 *
 * Fuente de las partidas: estimación basada en Numbeo y otras fuentes públicas · Datos 2025-2026.
 *
 * El ÍNDICE no se escribe a mano: sale de las cinco partidas que enseña la tabla (hallazgo 4503,
 * 16/11/2026). Antes era una cifra suelta por ciudad y en 7 pares contradecía a su propia tabla:
 * Toronto igualaba a Chicago en alquiler, cena y supermercado, la superaba en transporte e internet,
 * y salía «un 2 % más barata». Ahora el índice es el coste de una CESTA MENSUAL de una persona sin
 * vehículo propio, con los pesos declarados en CESTA, frente a la de Madrid (= 100): si una ciudad
 * iguala o supera a otra en todas las partidas, su índice no puede ser menor.
 *
 * Sin dependencias de React: lo leen la página y metadata.ts (las respuestas del FAQPage salen de
 * aquí, para que no vuelvan a dar otras cifras que el comparador).
 */

export interface DatosCosteVida {
  ciudad: string;
  pais: string;
  continente: string;
  alquiler: number;        // 1 habitación, centro ciudad, €/mes
  cena: number;            // Cena restaurante económico, €/persona
  supermercado: number;    // Cesta básica mensual estimada, €/mes
  transporte: number;      // Bono transporte público mensual, €/mes
  internet: number;        // Internet fibra mensual, €/mes
}

/** Cuántas veces entra cada partida en la cesta mensual. */
export const CESTA = {
  alquiler: 1,
  supermercado: 1,
  transporte: 1,
  internet: 1,
  /** Una cena fuera por semana. */
  cena: 4,
} as const;

export const CIUDADES: DatosCosteVida[] = [
  // EUROPA — Ibérica
  { ciudad: 'Madrid', pais: 'España', continente: 'Europa', alquiler: 1100, cena: 12, supermercado: 280, transporte: 55, internet: 35 },
  { ciudad: 'Barcelona', pais: 'España', continente: 'Europa', alquiler: 1300, cena: 14, supermercado: 300, transporte: 80, internet: 35 },
  { ciudad: 'Valencia', pais: 'España', continente: 'Europa', alquiler: 850, cena: 11, supermercado: 260, transporte: 45, internet: 32 },
  { ciudad: 'Sevilla', pais: 'España', continente: 'Europa', alquiler: 800, cena: 10, supermercado: 250, transporte: 42, internet: 32 },
  { ciudad: 'Lisboa', pais: 'Portugal', continente: 'Europa', alquiler: 1100, cena: 11, supermercado: 260, transporte: 40, internet: 28 },
  { ciudad: 'Porto', pais: 'Portugal', continente: 'Europa', alquiler: 800, cena: 10, supermercado: 240, transporte: 35, internet: 25 },
  // EUROPA — Occidental
  { ciudad: 'París', pais: 'Francia', continente: 'Europa', alquiler: 1800, cena: 18, supermercado: 350, transporte: 90, internet: 30 },
  { ciudad: 'Londres', pais: 'Reino Unido', continente: 'Europa', alquiler: 2400, cena: 18, supermercado: 380, transporte: 200, internet: 45 },
  { ciudad: 'Berlín', pais: 'Alemania', continente: 'Europa', alquiler: 1400, cena: 14, supermercado: 320, transporte: 90, internet: 35 },
  { ciudad: 'Múnich', pais: 'Alemania', continente: 'Europa', alquiler: 1900, cena: 16, supermercado: 340, transporte: 60, internet: 35 },
  { ciudad: 'Ámsterdam', pais: 'Países Bajos', continente: 'Europa', alquiler: 1900, cena: 18, supermercado: 350, transporte: 100, internet: 45 },
  { ciudad: 'Bruselas', pais: 'Bélgica', continente: 'Europa', alquiler: 1200, cena: 16, supermercado: 330, transporte: 60, internet: 40 },
  { ciudad: 'Viena', pais: 'Austria', continente: 'Europa', alquiler: 1200, cena: 14, supermercado: 310, transporte: 50, internet: 25 },
  { ciudad: 'Zúrich', pais: 'Suiza', continente: 'Europa', alquiler: 2800, cena: 28, supermercado: 500, transporte: 90, internet: 55 },
  { ciudad: 'Dublín', pais: 'Irlanda', continente: 'Europa', alquiler: 2200, cena: 18, supermercado: 350, transporte: 140, internet: 50 },
  // EUROPA — Nórdica
  { ciudad: 'Copenhague', pais: 'Dinamarca', continente: 'Europa', alquiler: 1800, cena: 22, supermercado: 400, transporte: 90, internet: 45 },
  { ciudad: 'Estocolmo', pais: 'Suecia', continente: 'Europa', alquiler: 1600, cena: 20, supermercado: 380, transporte: 100, internet: 30 },
  { ciudad: 'Oslo', pais: 'Noruega', continente: 'Europa', alquiler: 1900, cena: 28, supermercado: 450, transporte: 100, internet: 45 },
  // EUROPA — Sur
  { ciudad: 'Roma', pais: 'Italia', continente: 'Europa', alquiler: 1200, cena: 14, supermercado: 310, transporte: 35, internet: 28 },
  { ciudad: 'Milán', pais: 'Italia', continente: 'Europa', alquiler: 1500, cena: 16, supermercado: 330, transporte: 40, internet: 28 },
  { ciudad: 'Atenas', pais: 'Grecia', continente: 'Europa', alquiler: 700, cena: 10, supermercado: 250, transporte: 30, internet: 28 },
  // EUROPA — Este
  { ciudad: 'Praga', pais: 'Rep. Checa', continente: 'Europa', alquiler: 800, cena: 9, supermercado: 240, transporte: 25, internet: 15 },
  { ciudad: 'Varsovia', pais: 'Polonia', continente: 'Europa', alquiler: 800, cena: 9, supermercado: 230, transporte: 30, internet: 15 },
  { ciudad: 'Budapest', pais: 'Hungría', continente: 'Europa', alquiler: 650, cena: 8, supermercado: 210, transporte: 25, internet: 12 },
  { ciudad: 'Bucarest', pais: 'Rumanía', continente: 'Europa', alquiler: 550, cena: 7, supermercado: 190, transporte: 18, internet: 12 },
  { ciudad: 'Estambul', pais: 'Turquía', continente: 'Europa/Asia', alquiler: 500, cena: 5, supermercado: 200, transporte: 20, internet: 10 },
  // AMÉRICA — Norte
  { ciudad: 'Nueva York', pais: 'EE.UU.', continente: 'América', alquiler: 3200, cena: 22, supermercado: 450, transporte: 130, internet: 55 },
  { ciudad: 'Los Ángeles', pais: 'EE.UU.', continente: 'América', alquiler: 2800, cena: 20, supermercado: 420, transporte: 100, internet: 55 },
  { ciudad: 'Miami', pais: 'EE.UU.', continente: 'América', alquiler: 2600, cena: 20, supermercado: 400, transporte: 115, internet: 55 },
  { ciudad: 'Chicago', pais: 'EE.UU.', continente: 'América', alquiler: 1900, cena: 18, supermercado: 380, transporte: 100, internet: 45 },
  { ciudad: 'Toronto', pais: 'Canadá', continente: 'América', alquiler: 1900, cena: 18, supermercado: 380, transporte: 130, internet: 55 },
  { ciudad: 'Ciudad de México', pais: 'México', continente: 'América', alquiler: 600, cena: 6, supermercado: 200, transporte: 25, internet: 28 },
  // AMÉRICA — Sur
  { ciudad: 'Buenos Aires', pais: 'Argentina', continente: 'América', alquiler: 600, cena: 9, supermercado: 220, transporte: 20, internet: 20 },
  { ciudad: 'Santiago', pais: 'Chile', continente: 'América', alquiler: 700, cena: 8, supermercado: 260, transporte: 55, internet: 30 },
  { ciudad: 'Bogotá', pais: 'Colombia', continente: 'América', alquiler: 450, cena: 5, supermercado: 200, transporte: 30, internet: 18 },
  { ciudad: 'Lima', pais: 'Perú', continente: 'América', alquiler: 500, cena: 5, supermercado: 200, transporte: 28, internet: 25 },
  { ciudad: 'São Paulo', pais: 'Brasil', continente: 'América', alquiler: 600, cena: 6, supermercado: 220, transporte: 45, internet: 20 },
  { ciudad: 'Montevideo', pais: 'Uruguay', continente: 'América', alquiler: 700, cena: 9, supermercado: 270, transporte: 40, internet: 30 },
  // ASIA — Este
  { ciudad: 'Tokio', pais: 'Japón', continente: 'Asia', alquiler: 1100, cena: 10, supermercado: 290, transporte: 90, internet: 30 },
  { ciudad: 'Seúl', pais: 'Corea del Sur', continente: 'Asia', alquiler: 900, cena: 8, supermercado: 280, transporte: 55, internet: 20 },
  { ciudad: 'Shanghái', pais: 'China', continente: 'Asia', alquiler: 1100, cena: 8, supermercado: 280, transporte: 35, internet: 18 },
  { ciudad: 'Hong Kong', pais: 'China (RAE)', continente: 'Asia', alquiler: 2800, cena: 14, supermercado: 380, transporte: 75, internet: 25 },
  { ciudad: 'Singapur', pais: 'Singapur', continente: 'Asia', alquiler: 2500, cena: 12, supermercado: 350, transporte: 90, internet: 30 },
  // ASIA — Sudeste
  { ciudad: 'Bangkok', pais: 'Tailandia', continente: 'Asia', alquiler: 550, cena: 5, supermercado: 200, transporte: 30, internet: 18 },
  { ciudad: 'Bali', pais: 'Indonesia', continente: 'Asia', alquiler: 400, cena: 4, supermercado: 180, transporte: 25, internet: 15 },
  { ciudad: 'Ho Chi Minh', pais: 'Vietnam', continente: 'Asia', alquiler: 500, cena: 4, supermercado: 180, transporte: 20, internet: 12 },
  { ciudad: 'Kuala Lumpur', pais: 'Malasia', continente: 'Asia', alquiler: 550, cena: 5, supermercado: 200, transporte: 35, internet: 20 },
  // ASIA — Próximo Oriente
  { ciudad: 'Dubái', pais: 'EAU', continente: 'Asia', alquiler: 2000, cena: 18, supermercado: 380, transporte: 300, internet: 90 },
  { ciudad: 'Tel Aviv', pais: 'Israel', continente: 'Asia', alquiler: 2200, cena: 18, supermercado: 400, transporte: 75, internet: 40 },
  // OCEANÍA
  { ciudad: 'Sídney', pais: 'Australia', continente: 'Oceanía', alquiler: 2400, cena: 20, supermercado: 420, transporte: 130, internet: 55 },
  { ciudad: 'Melbourne', pais: 'Australia', continente: 'Oceanía', alquiler: 1900, cena: 18, supermercado: 380, transporte: 110, internet: 50 },
  // ÁFRICA
  { ciudad: 'El Cairo', pais: 'Egipto', continente: 'África', alquiler: 250, cena: 4, supermercado: 150, transporte: 15, internet: 12 },
  { ciudad: 'Casablanca', pais: 'Marruecos', continente: 'África', alquiler: 350, cena: 5, supermercado: 170, transporte: 25, internet: 15 },
  { ciudad: 'Ciudad del Cabo', pais: 'Sudáfrica', continente: 'África', alquiler: 550, cena: 8, supermercado: 220, transporte: 60, internet: 25 },
  { ciudad: 'Nairobi', pais: 'Kenia', continente: 'África', alquiler: 500, cena: 6, supermercado: 200, transporte: 30, internet: 20 },
];

/** Coste de la cesta mensual de una ciudad, en €. */
export function cestaMensual(c: DatosCosteVida): number {
  return (
    c.alquiler * CESTA.alquiler +
    c.supermercado * CESTA.supermercado +
    c.transporte * CESTA.transporte +
    c.internet * CESTA.internet +
    c.cena * CESTA.cena
  );
}

export function buscarCiudad(nombre: string): DatosCosteVida {
  const c = CIUDADES.find((x) => x.ciudad === nombre);
  if (!c) throw new Error(`Ciudad desconocida: ${nombre}`);
  return c;
}

const CESTA_MADRID = cestaMensual(buscarCiudad('Madrid'));

/** Índice total (Madrid = 100), redondeado a la unidad. */
export function indiceDe(c: DatosCosteVida): number {
  return Math.round((cestaMensual(c) / CESTA_MADRID) * 100);
}

/** Peso del alquiler en la cesta, en % redondeado a la unidad. */
export function pesoAlquiler(c: DatosCosteVida): number {
  return Math.round(((c.alquiler * CESTA.alquiler) / cestaMensual(c)) * 100);
}
