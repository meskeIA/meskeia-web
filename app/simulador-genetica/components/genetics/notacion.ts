import type { Trait } from '../types';

/**
 * Traduce un genotipo o un gameto del motor a la notación con la que se enseña.
 *
 * Solo hace algo si alguno de los rasgos declara `notacion` (hoy, el grupo sanguíneo ABO:
 * A → Iᴬ, B → Iᴮ, O → i). Para todos los demás devuelve el texto tal cual, así que llamarla
 * sobre cualquier cadena del cuadro es inocuo.
 *
 * Tres formas de cadena, las tres que produce el motor:
 * - Genotipo con espacio, uno por rasgo: «AO Dd» → cada parte con SU rasgo → «Iᴬi Dd».
 * - Gameto dihíbrido, un alelo por rasgo: «AD» con dos rasgos → posición 0 con el rasgo 1 y
 *   posición 1 con el rasgo 2 → «IᴬD».
 * - Genotipo o gameto de un solo rasgo: «AO», «B» → todas las letras con el rasgo 1.
 *
 * ⚠️ En herencia ligada al sexo las cadenas también llevan espacio («XD Y»), pero esos rasgos
 * no declaran notación, así que pasan intactas.
 */
export function notacionGenotipo(texto: string, rasgos: ReadonlyArray<Trait | null | undefined>): string {
  if (!rasgos.some((r) => r?.notacion)) return texto;

  const traducir = (fragmento: string, rasgo: Trait | null | undefined): string => {
    const mapa = rasgo?.notacion;
    if (!mapa) return fragmento;
    return fragmento
      .split('')
      .map((letra) => mapa[letra] ?? letra)
      .join('');
  };

  if (texto.includes(' ')) {
    return texto
      .split(' ')
      .map((parte, i) => traducir(parte, rasgos[i]))
      .join(' ');
  }

  if (rasgos.length === 2 && texto.length === 2) {
    return traducir(texto[0], rasgos[0]) + traducir(texto[1], rasgos[1]);
  }

  return traducir(texto, rasgos[0]);
}
