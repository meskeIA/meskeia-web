// Crema pastelera y crema inglesa — lógica pura
//
// Ambas parten de leche, yemas y azúcar; la diferencia es el espesante. La crema
// pastelera lleva almidón (maicena o harina) y queda firme para rellenar; la
// crema inglesa no lleva almidón y queda como una salsa. Las cantidades se
// expresan por litro de leche y se escalan proporcionalmente. Verificado: 2026-06.

export interface TipoCrema {
  id: string;
  nombre: string;
  // Cantidades por cada 1000 ml de leche.
  yemas: number;
  azucar_g: number;
  almidon_g: number;
  mantequilla_g: number;
  nota: string;
}

export const TIPOS_CREMA: TipoCrema[] = [
  { id: 'pastelera', nombre: 'Crema pastelera', yemas: 8, azucar_g: 250, almidon_g: 90, mantequilla_g: 50, nota: 'Firme, para rellenar tartas, milhojas, profiteroles y bombas.' },
  { id: 'ligera', nombre: 'Pastelera ligera', yemas: 6, azucar_g: 200, almidon_g: 70, mantequilla_g: 30, nota: 'Menos densa; buena para mezclar con nata (crema diplomata).' },
  { id: 'inglesa', nombre: 'Crema inglesa', yemas: 9, azucar_g: 200, almidon_g: 0, mantequilla_g: 0, nota: 'Sin almidón: queda como salsa para acompañar postres o base de helado.' },
];

export const TIPO_CREMA_POR_ID: Record<string, TipoCrema> = TIPOS_CREMA.reduce<
  Record<string, TipoCrema>
>((acc, t) => { acc[t.id] = t; return acc; }, {});

export interface IngredienteCrema {
  nombre: string;
  cantidad: string;
}

export interface ResultadoCrema {
  ingredientes: IngredienteCrema[];
}

export function calcularCrema(tipoId: string, lecheMl: number): ResultadoCrema | null {
  const t = TIPO_CREMA_POR_ID[tipoId];
  if (!t || !(lecheMl > 0)) return null;
  const f = lecheMl / 1000;
  const yemas = Math.round(t.yemas * f * 10) / 10;
  const ingredientes: IngredienteCrema[] = [
    { nombre: 'Leche', cantidad: `${Math.round(lecheMl)} ml` },
    { nombre: 'Yemas', cantidad: `${yemas} (≈ ${Math.round(yemas * 18)} g)` },
    { nombre: 'Azúcar', cantidad: `${Math.round(t.azucar_g * f)} g` },
  ];
  if (t.almidon_g > 0) ingredientes.push({ nombre: 'Maicena (o harina)', cantidad: `${Math.round(t.almidon_g * f)} g` });
  if (t.mantequilla_g > 0) ingredientes.push({ nombre: 'Mantequilla', cantidad: `${Math.round(t.mantequilla_g * f)} g` });
  return { ingredientes };
}
