// Aguas frescas, limonadas y horchata — lógica pura
//
// Bebidas refrescantes sin alcohol, muy presentes en Latinoamérica y España. Cada
// una tiene su proporción base por litro de bebida; aquí se escala a los litros
// que quieras preparar. Ajusta el azúcar a tu gusto. Verificado: 2026-06.

export interface IngredienteAgua { nombre: string; cantidad: string; porLitro: number; unidad: string; }

export interface AguaFresca {
  id: string;
  nombre: string;
  emoji: string;
  nota: string;
  ingredientes: { nombre: string; porLitro: number; unidad: string }[];
}

export const AGUAS_FRESCAS: AguaFresca[] = [
  { id: 'limonada', nombre: 'Limonada', emoji: '🍋', nota: 'Clásica y refrescante. Ajusta el azúcar según lo ácidos que estén los limones.',
    ingredientes: [ { nombre: 'Agua', porLitro: 850, unidad: 'ml' }, { nombre: 'Zumo de limón', porLitro: 120, unidad: 'ml' }, { nombre: 'Azúcar', porLitro: 90, unidad: 'g' } ] },
  { id: 'naranjada', nombre: 'Naranjada', emoji: '🍊', nota: 'Más suave que la limonada; con naranjas dulces casi no necesita azúcar.',
    ingredientes: [ { nombre: 'Zumo de naranja', porLitro: 400, unidad: 'ml' }, { nombre: 'Agua', porLitro: 550, unidad: 'ml' }, { nombre: 'Azúcar', porLitro: 50, unidad: 'g' } ] },
  { id: 'jamaica', nombre: 'Agua de Jamaica (flor de hibisco)', emoji: '🌺', nota: 'Color rubí y sabor ácido. Hierve la flor, cuela y endulza en frío.',
    ingredientes: [ { nombre: 'Flor de jamaica seca', porLitro: 30, unidad: 'g' }, { nombre: 'Agua', porLitro: 1000, unidad: 'ml' }, { nombre: 'Azúcar', porLitro: 100, unidad: 'g' } ] },
  { id: 'horchata', nombre: 'Horchata de arroz', emoji: '🥛', nota: 'Estilo mexicano. Remoja el arroz, tritura con canela, cuela y endulza.',
    ingredientes: [ { nombre: 'Arroz', porLitro: 150, unidad: 'g' }, { nombre: 'Agua', porLitro: 1000, unidad: 'ml' }, { nombre: 'Azúcar', porLitro: 100, unidad: 'g' }, { nombre: 'Canela', porLitro: 1, unidad: 'rama' } ] },
  { id: 'fruta', nombre: 'Agua fresca de fruta', emoji: '🍉', nota: 'Sandía, melón, fresa, mango… Tritura la fruta con agua, cuela y endulza al gusto.',
    ingredientes: [ { nombre: 'Fruta troceada', porLitro: 400, unidad: 'g' }, { nombre: 'Agua', porLitro: 600, unidad: 'ml' }, { nombre: 'Azúcar', porLitro: 60, unidad: 'g' } ] },
];

export const AGUA_FRESCA_POR_ID: Record<string, AguaFresca> = AGUAS_FRESCAS.reduce<
  Record<string, AguaFresca>
>((acc, a) => { acc[a.id] = a; return acc; }, {});

export function calcularAguaFresca(tipoId: string, litros: number): IngredienteAgua[] | null {
  const a = AGUA_FRESCA_POR_ID[tipoId];
  if (!a || !(litros > 0)) return null;
  return a.ingredientes.map((i) => {
    const total = i.porLitro * litros;
    const cantidad = i.unidad === 'rama' ? `${Math.max(1, Math.round(total))}` : `${Math.round(total)}`;
    return { nombre: i.nombre, cantidad: `${cantidad} ${i.unidad}`, porLitro: i.porLitro, unidad: i.unidad };
  });
}
