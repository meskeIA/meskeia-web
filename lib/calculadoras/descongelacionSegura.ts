// Descongelación segura — lógica pura
//
// La regla de oro: nunca descongelar a temperatura ambiente, porque la superficie
// entra en la "zona de peligro" (4–60 °C) donde las bacterias se multiplican antes
// de que el centro se descongele. Los métodos seguros son la nevera (lento), el
// agua fría (más rápido, cambiándola) y el microondas (inmediato, para cocinar al
// momento). Tiempos orientativos por peso. Fuente: FoodSafety.gov. Verificado: 2026-06.

export interface MetodoDescongelacion {
  id: string;
  nombre: string;
  emoji: string;
  horasPorKg: number | null; // null = inmediato/variable
  nota: string;
}

export const METODOS_DESCONGELACION: MetodoDescongelacion[] = [
  { id: 'nevera', nombre: 'En la nevera', emoji: '❄️', horasPorKg: 10, nota: 'El método más seguro. Lento pero permite recongelar si luego lo cocinas. Coloca un recipiente debajo.' },
  { id: 'agua-fria', nombre: 'En agua fría', emoji: '💧', horasPorKg: 1, nota: 'Bolsa estanca sumergida en agua fría; cambia el agua cada 30 min. Cocina nada más descongelar.' },
  { id: 'microondas', nombre: 'En el microondas', emoji: '📡', horasPorKg: null, nota: 'Inmediato con la función descongelar, pero cocina justo después: algunas zonas empiezan a cocinarse.' },
];

export const METODO_DESC_POR_ID: Record<string, MetodoDescongelacion> = METODOS_DESCONGELACION.reduce<
  Record<string, MetodoDescongelacion>
>((acc, m) => { acc[m.id] = m; return acc; }, {});

export interface ResultadoDescongelacion {
  tiempo: string;
  inmediato: boolean;
  nota: string;
}

function formatHoras(horas: number): string {
  if (horas < 1) return `${Math.round(horas * 60)} min`;
  const h = Math.floor(horas);
  const m = Math.round((horas - h) * 60);
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

export function calcularDescongelacion(metodoId: string, pesoG: number): ResultadoDescongelacion | null {
  const m = METODO_DESC_POR_ID[metodoId];
  if (!m || !(pesoG > 0)) return null;
  if (m.horasPorKg === null) {
    return { tiempo: 'Inmediato', inmediato: true, nota: m.nota };
  }
  const horas = (m.horasPorKg * pesoG) / 1000;
  return { tiempo: formatHoras(horas), inmediato: false, nota: m.nota };
}
