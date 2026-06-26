// Tiempos de cocción en agua — datos curados (orientativos)
//
// Tiempos aproximados de cocción en agua hirviendo a nivel del mar. En altura el
// agua hierve más fría y los tiempos se alargan (sobre todo legumbres): ver la
// app de ajuste por altitud. Los huevos se cuentan desde que el agua hierve.
// Verificado: 2026-06.

export type CategoriaCoccion = 'huevos' | 'pasta-cereales' | 'legumbres' | 'verduras';

export const CATEGORIAS_COCCION: Record<CategoriaCoccion, string> = {
  huevos: 'Huevos',
  'pasta-cereales': 'Pasta, arroz y cereales',
  legumbres: 'Legumbres (remojadas)',
  verduras: 'Verduras',
};

export interface AlimentoTiempo {
  nombre: string;
  emoji: string;
  categoria: CategoriaCoccion;
  tiempo: string; // rango legible
  nota: string;
}

export const TIEMPOS_COCCION: AlimentoTiempo[] = [
  // Huevos (desde que el agua hierve)
  { nombre: 'Huevo pasado por agua', emoji: '🥚', categoria: 'huevos', tiempo: '3–4 min', nota: 'Clara cuajada, yema líquida.' },
  { nombre: 'Huevo mollet', emoji: '🥚', categoria: 'huevos', tiempo: '5–6 min', nota: 'Clara firme, yema cremosa.' },
  { nombre: 'Huevo duro', emoji: '🥚', categoria: 'huevos', tiempo: '10–12 min', nota: 'Yema totalmente cuajada; enfría en agua fría.' },

  // Pasta, arroz y cereales
  { nombre: 'Pasta seca', emoji: '🍝', categoria: 'pasta-cereales', tiempo: '8–11 min', nota: 'Al dente según el grosor; mira el paquete.' },
  { nombre: 'Arroz blanco', emoji: '🍚', categoria: 'pasta-cereales', tiempo: '15–18 min', nota: 'Absorción 2:1 de agua; reposa 5 min tapado.' },
  { nombre: 'Arroz integral', emoji: '🍚', categoria: 'pasta-cereales', tiempo: '35–45 min', nota: 'Necesita más agua y tiempo que el blanco.' },
  { nombre: 'Arroz basmati', emoji: '🍚', categoria: 'pasta-cereales', tiempo: '10–12 min', nota: 'Enjuaga antes para soltar el grano.' },
  { nombre: 'Quinoa', emoji: '🌾', categoria: 'pasta-cereales', tiempo: '13–15 min', nota: 'Enjuaga para quitar la saponina amarga.' },

  // Legumbres (remojadas la víspera salvo lentejas)
  { nombre: 'Garbanzos', emoji: '🫘', categoria: 'legumbres', tiempo: '1,5–2 h', nota: 'Remojo previo 12 h; olla a presión 30–40 min.' },
  { nombre: 'Alubias blancas', emoji: '🫘', categoria: 'legumbres', tiempo: '1–1,5 h', nota: 'Remojo previo 12 h; cocción suave para que no se rompan.' },
  { nombre: 'Alubias rojas', emoji: '🫘', categoria: 'legumbres', tiempo: '1–1,5 h', nota: 'Hervir fuerte 10 min al principio (ver aviso de toxina).' },
  { nombre: 'Lentejas', emoji: '🫘', categoria: 'legumbres', tiempo: '20–30 min', nota: 'No necesitan remojo; las pardinas aguantan mejor enteras.' },

  // Verduras
  { nombre: 'Patata troceada', emoji: '🥔', categoria: 'verduras', tiempo: '15–20 min', nota: 'Entera con piel: 25–30 min.' },
  { nombre: 'Zanahoria en rodajas', emoji: '🥕', categoria: 'verduras', tiempo: '8–10 min', nota: 'Menos si la quieres al dente.' },
  { nombre: 'Brócoli en ramilletes', emoji: '🥦', categoria: 'verduras', tiempo: '5–7 min', nota: 'Mejor al vapor para conservar color y nutrientes.' },
  { nombre: 'Judías verdes', emoji: '🫛', categoria: 'verduras', tiempo: '8–10 min', nota: 'Corta el tiempo y enfría en agua con hielo para que queden vivas.' },
  { nombre: 'Espárragos verdes', emoji: '🌿', categoria: 'verduras', tiempo: '4–6 min', nota: 'Los trigueros finos, aún menos.' },
];
