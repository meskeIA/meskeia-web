import { test, expect, type Page } from '@playwright/test';
import { esperarHidratacion, esperarValorEnReact } from './_hidratacion';
import { contrasteSobreFondoReal } from './_contraste';

/* ════════════════════════════════════════════════════════════════════════════════════════════
 * tabla-limites-notables — INSPECCIÓN DEL 03/11/2026 (modo primera)
 *
 * Tabla de consulta del material de apoyo de Stemum: 59 límites notables en 7 categorías, cada
 * uno con su valor, su tendencia, sus condiciones, una justificación y un ejemplo resuelto.
 *
 * La verdad comprobable es el VALOR de cada límite con sus condiciones y el resultado de cada
 * ejemplo. Los 59 valores se comprobaron a mano antes de mirar la app (Taylor, cambio de
 * variable, L'Hôpital o el límite fundamental, según el caso), y cada ejemplo se rehízo hasta su
 * resultado; las cifras decimales se confirmaron aparte con un cálculo numérico. Los 59 valores y
 * las 59 condiciones están bien. El test «los 59 límites» fija lo que se pinta, para que una
 * edición que cambie un signo, un factor o una condición no pase en silencio.
 *
 * Lo que la inspección encontró mal (tests HALLAZGO, con test.fail() mientras sigan abiertos):
 *   · el buscador no encuentra un límite escrito como fórmula («1^∞», «∞/∞», «1 − cos x»), ni
 *     «L'Hôpital» escrito como lo escribe la página, ni dos palabras en otro orden, ni el nombre
 *     de una categoría;
 *   · por subcadena casa dentro de otras palabras: «coseno» trae el arcoseno, «sin» la asíntota;
 *   · las fracciones no tienen lectura accesible: «sen x / x = 1» se anuncia «lím sen x x 1»;
 *   · tres cifras de los ejemplos y justificaciones (n = 1.000 en ⁿ√(n!)/n, diez sumandos de la
 *     serie de e, el error de √1,02 ≈ 1,01);
 *   · «tres casos con el mismo denominador» que no lo tienen, y dos etiquetas de tendencia o
 *     condición que dicen otra cosa;
 *   · el naranja #B45309 de «Errores comunes» se queda en 4,27:1 sobre su tinte (REPARADO el
 *     04/11/2026, hallazgo 3992), y con el ratón encima de una fila su texto baja a 4,23-4,44:1;
 *   · la pregunta de las equivalencias está escrita dos veces (FAQ visible y JSON-LD);
 *   · el % pegado («100%») o con espacio normal en vez de duro.
 * ════════════════════════════════════════════════════════════════════════════════════════════ */

const RUTA = '/tabla-limites-notables/';
const BUSCADOR = '#buscador-limites';
const TOTAL = 59;

async function cargar(page: Page): Promise<void> {
  await page.goto(RUTA);
  await esperarHidratacion(page, [BUSCADOR]);
}

/** Escribe en el buscador y espera a que el estado de React lo tenga: la lista sale del mismo render. */
async function buscar(page: Page, termino: string): Promise<void> {
  await page.locator(BUSCADOR).fill(termino);
  await esperarValorEnReact(page, BUSCADOR, termino);
}

const contador = (page: Page) => page.locator('p[role="status"]');
const filas = (page: Page) => page.locator('ul li button[aria-expanded]');
const filtro = (page: Page, nombre: string) => page.getByRole('button', { name: nombre, exact: true });
const filaDe = (page: Page, id: string) => page.locator(`button[aria-controls="detalle-${id}"]`);
const sinResultados = (page: Page) => page.locator('[class*="sinResultados"]');

/** El nombre de cada fila visible (el primer nodo de texto de su columna de nombre). */
async function nombresDeFilas(page: Page): Promise<string[]> {
  return filas(page).evaluateAll((els) =>
    els.map((b) => b.querySelector('[class*="filaNombre"]')?.childNodes[0]?.textContent?.trim() ?? ''),
  );
}

/**
 * Lo que pinta una fila, con la expresión y el valor como texto lineal: cada fracción pasa a
 * «(num)/(den)», cada superíndice a «^(…)» y cada subíndice a «_(…)». Así el esperado se escribe
 * sin depender de cómo pega textContent el numerador y el denominador (ver HALLAZGO de accesibilidad).
 */
async function fila(page: Page, id: string) {
  return filaDe(page, id).evaluate((boton) => {
    const linealizar = (el: Element | undefined): string => {
      if (!el) return '';
      const clon = el.cloneNode(true) as Element;
      for (const s of [...clon.querySelectorAll('sup')]) s.replaceWith(`^(${s.textContent ?? ''})`);
      for (const s of [...clon.querySelectorAll('sub')]) s.replaceWith(`_(${s.textContent ?? ''})`);
      const esClase = (e: Element, nombre: string) =>
        [...e.classList].some((c) => new RegExp(`(^|_)${nombre}$`).test(c));
      const fracciones = [...clon.querySelectorAll('span')].filter((e) => esClase(e, 'frac')).reverse();
      for (const f of fracciones) {
        const num = [...f.children].find((e) => esClase(e, 'fracNum'))?.textContent ?? '';
        const den = [...f.children].find((e) => esClase(e, 'fracDen'))?.textContent ?? '';
        f.replaceWith(`(${num})/(${den})`);
      }
      return (clon.textContent ?? '').replace(/\s+/g, ' ').trim();
    };
    const expr = boton.querySelectorAll('[class*="expr"]');
    return {
      tendencia: boton.querySelector('[class*="tendenciaBadge"]')?.textContent ?? '',
      condiciones: boton.querySelector('[class*="condicionesBadge"]')?.textContent ?? '',
      expresion: linealizar(expr[0]),
      valor: linealizar(expr[1]),
    };
  });
}

type Fila = {
  id: string;
  tendencia: string;
  condiciones: string;
  expresion: string;
  valor: string;
  /** Una línea del ejemplo resuelto que lleva al resultado, rehecho a mano. */
  ejemplo: string;
};

/**
 * Los 59 límites, con el valor comprobado A MANO. En el comentario, la cuenta que lo justifica
 * y la del ejemplo de la fila.
 */
const TABLA: Fila[] = [
  // ── Trigonométricos (11) ─────────────────────────────────────────────────────────────────
  // cos x < sen x / x < 1 (áreas) → 1 · sen 5x/(3x) = (5/3)·sen 5x/(5x) → 5/3
  { id: 'sen-x-entre-x', tendencia: 'x → 0', condiciones: 'x en radianes', expresion: '(sen x)/(x)', valor: '1', ejemplo: 'Resultado: 5/3' },
  // (a/b)·sen(ax)/(ax) → a/b · sen 7x/sen 2x → 7/2
  { id: 'sen-ax-entre-bx', tendencia: 'x → 0', condiciones: 'b ≠ 0, x en radianes', expresion: '(sen(ax))/(bx)', valor: '(a)/(b)', ejemplo: 'Resultado: 7/2 = 3,5' },
  // (sen x/x)·(1/cos x) → 1 · tg 3x/sen 4x → 3/4
  { id: 'tan-x-entre-x', tendencia: 'x → 0', condiciones: 'x en radianes', expresion: '(tg x)/(x)', valor: '1', ejemplo: 'Resultado: 3/4 = 0,75' },
  // 2sen²(x/2)/x² → 1/2 · (1 − cos 2x)/x² = 4·(1/2) = 2
  { id: 'uno-menos-cos-entre-x2', tendencia: 'x → 0', condiciones: 'x en radianes', expresion: '(1 − cos x)/(x²)', valor: '(1)/(2)', ejemplo: 'Resultado: 4 · (1/2) = 2' },
  // ≈ x/2 → 0 · (1 − cos x)/sen x = [(1 − cos x)/x]·[x/sen x] → 0·1
  { id: 'uno-menos-cos-entre-x', tendencia: 'x → 0', condiciones: 'x en radianes', expresion: '(1 − cos x)/(x)', valor: '0', ejemplo: 'Resultado: 0' },
  // y = arcsen x: y/sen y → 1 · arcsen 3x/tg 5x → 3/5
  { id: 'arcsen-entre-x', tendencia: 'x → 0', condiciones: '', expresion: '(arcsen x)/(x)', valor: '1', ejemplo: 'Resultado: 3/5 = 0,6' },
  // (arctg)′(0) = 1 · arctg x²/(1 − cos x) → x²/(x²/2) = 2
  { id: 'arctan-entre-x', tendencia: 'x → 0', condiciones: '', expresion: '(arctg x)/(x)', valor: '1', ejemplo: 'Resultado: 2' },
  // x − sen x = x³/6 − x⁵/120 + … → 1/6 (numérico en 10⁻³: 0,166667)
  { id: 'x-menos-sen-entre-x3', tendencia: 'x → 0', condiciones: 'x en radianes', expresion: '(x − sen x)/(x³)', valor: '(1)/(6)', ejemplo: 'Resultado: 1/6 ≈ 0,1667' },
  // tg x = x + x³/3, sen x = x − x³/6: diferencia x³/2 → 1/2
  { id: 'tan-menos-sen', tendencia: 'x → 0', condiciones: 'x en radianes', expresion: '(tg x − sen x)/(x³)', valor: '(1)/(2)', ejemplo: 'Resultado: 1/2' },
  // −1/x ≤ sen x/x ≤ 1/x → 0 · (x + sen x)/x = 1 + sen x/x → 1
  { id: 'sen-entre-x-infinito', tendencia: 'x → ∞', condiciones: '', expresion: '(sen x)/(x)', valor: '0', ejemplo: 'Resultado: 1' },
  // t = 1/x → 0: sen t/t → 1 · n·sen(π/n) = π·sen(π/n)/(π/n) → π
  { id: 'x-sen-uno-entre-x', tendencia: 'x → ∞', condiciones: '', expresion: 'x·sen(1)/(x)', valor: '1', ejemplo: 'Resultado: π ≈ 3,1416' },

  // ── Exponenciales y logarítmicos (9) ─────────────────────────────────────────────────────
  // (eˣ)′(0) = 1 · (e^3x − 1)/(5x) = (3/5)·(e^3x − 1)/(3x) → 3/5
  { id: 'ex-menos-1-entre-x', tendencia: 'x → 0', condiciones: '', expresion: '(e^(x) − 1)/(x)', valor: '1', ejemplo: 'Resultado: 3/5 = 0,6' },
  // aˣ = e^(x ln a) → ln a · ln 2 = 0,693147
  { id: 'ax-menos-1-entre-x', tendencia: 'x → 0', condiciones: 'a > 0', expresion: '(a^(x) − 1)/(x)', valor: 'ln a', ejemplo: 'Resultado: ln 2 ≈ 0,693' },
  // (ln(1 + x))′(0) = 1 · ln(1 + 4x)/sen 2x → 4x/2x = 2
  { id: 'ln-1-mas-x-entre-x', tendencia: 'x → 0', condiciones: '', expresion: '(ln(1 + x))/(x)', valor: '1', ejemplo: 'Resultado: 2' },
  // ln(1 + x)/ln a → 1/ln a · 1/ln 10 = 0,434294
  { id: 'log-a-1-mas-x', tendencia: 'x → 0', condiciones: 'a > 0 y a ≠ 1', expresion: '(log_(a)(1 + x))/(x)', valor: '(1)/(ln a)', ejemplo: 'Resultado: 1 / ln 10 ≈ 0,4343' },
  // α(1 + 0)^(α−1) = α · α = 1/2
  { id: 'potencia-1-mas-x', tendencia: 'x → 0', condiciones: 'α número real cualquiera', expresion: '((1 + x)^(α) − 1)/(x)', valor: 'α', ejemplo: 'Resultado: 1/2 = 0,5' },
  // (xᵃ)′(1) = a · x⁵ − 1 = (x − 1)(x⁴ + x³ + x² + x + 1) → 5
  { id: 'xa-menos-1-entre-x-menos-1', tendencia: 'x → 1', condiciones: 'a real; x > 0 si a no es entero', expresion: '(x^(a) − 1)/(x − 1)', valor: 'a', ejemplo: 'Resultado: 5 (coincide con a = 5)' },
  // ln x/(1/x) → (1/x)/(−1/x²) = −x → 0
  { id: 'x-ln-x', tendencia: 'x → 0⁺', condiciones: 'solo por la derecha (x > 0)', expresion: 'x·ln x', valor: '0', ejemplo: 'Resultado: 0' },
  // (1/x)/1 → 0 · (ln x)³/x: tres L'Hôpital → 6/x → 0
  { id: 'ln-x-entre-x', tendencia: 'x → ∞', condiciones: '', expresion: '(ln x)/(x)', valor: '0', ejemplo: 'Resultado: 0' },
  // ln(xˣ) = x ln x → 0 → e⁰ = 1
  { id: 'xx-en-cero', tendencia: 'x → 0⁺', condiciones: 'solo por la derecha (x > 0)', expresion: 'x^(x)', valor: '1', ejemplo: 'L = e⁰ = 1' },

  // ── El número e (6) ──────────────────────────────────────────────────────────────────────
  // e = 2,718281828 · (1,1)¹⁰ = 2,593742 · (1,01)¹⁰⁰ = 2,704814 · (1,0001)¹⁰⁰⁰⁰ = 2,718146
  { id: 'e-infinito', tendencia: 'x → ∞', condiciones: '', expresion: '(1 + (1)/(x))^(x)', valor: 'e ≈ 2,71828', ejemplo: 'x = 10.000 → ≈ 2,71815' },
  // t = 1/x · (1 + 2x)^(1/x) = [(1 + 2x)^(1/(2x))]² → e² = 7,389056
  { id: 'e-cero', tendencia: 'x → 0', condiciones: '', expresion: '(1 + x)^(1/x)', valor: 'e', ejemplo: 'Resultado: e² ≈ 7,389' },
  // [(1 + k/x)^(x/k)]^k → eᵏ · (1 + 3/x)^(2x) → e⁶ = 403,4288
  { id: 'e-k', tendencia: 'x → ∞', condiciones: 'k constante real', expresion: '(1 + (k)/(x))^(x)', valor: 'e^(k)', ejemplo: 'Resultado: (e³)² = e⁶ ≈ 403,4' },
  // k = −1 → 1/e · k = −2 → e⁻² = 0,135335
  { id: 'e-menos-uno', tendencia: 'x → ∞', condiciones: '', expresion: '(1 − (1)/(x))^(x)', valor: '(1)/(e)', ejemplo: 'Resultado: e⁻² ≈ 0,1353' },
  // f^g = [(1 + (f − 1))^(1/(f−1))]^(g(f−1)) · f − 1 = 1/(x + 1), g(f − 1) = 3x/(x + 1) → 3: e³ = 20,0855
  { id: 'forma-1-infinito', tendencia: 'x → a (o ∞)', condiciones: 'f(x) → 1 y g(x) → ∞', expresion: 'f(x)^(g(x))', valor: 'e^(lím g(x)·(f(x) − 1))', ejemplo: 'Resultado: e³ ≈ 20,09' },
  // Taylor de eˣ en 1 · 1 + 1 + 1/2 + 1/6 + 1/24 = 2,708333
  { id: 'e-serie', tendencia: 'n → ∞', condiciones: '', expresion: '1 + (1)/(1!) + (1)/(2!) + … + (1)/(n!)', valor: 'e', ejemplo: '+ 1/24 = 2,7083' },

  // ── Indeterminaciones (7) ────────────────────────────────────────────────────────────────
  // (x² − 4)/(x − 2) = x + 2 → 4
  { id: 'ind-0-0', tendencia: 'cualquier tendencia', condiciones: '', expresion: '(0)/(0)', valor: 'Depende', ejemplo: 'Resultado: 4' },
  // (3 + 5/x)/(2 − 1/x²) → 3/2
  { id: 'ind-inf-inf', tendencia: 'x → ∞', condiciones: '', expresion: '(∞)/(∞)', valor: 'Depende', ejemplo: 'Resultado: 3/2 = 1,5' },
  // x² ln x = ln x/(1/x²) → (1/x)/(−2/x³) = −x²/2 → 0
  { id: 'ind-0-por-inf', tendencia: 'cualquier tendencia', condiciones: '', expresion: '0 · ∞', valor: 'Depende', ejemplo: 'Resultado: 0' },
  // √(x² + x) − x = x/(√(x² + x) + x) → 1/2
  { id: 'ind-inf-menos-inf', tendencia: 'x → ∞ (o x → a)', condiciones: '', expresion: '∞ − ∞', valor: 'Depende', ejemplo: 'Resultado: 1/2 = 0,5' },
  // (1 + 1/x²)^x: x·(1/x²) → 0 → e⁰ = 1
  { id: 'ind-1-inf', tendencia: 'cualquier tendencia', condiciones: '', expresion: '1^(∞)', valor: 'Depende (sale un e)', ejemplo: 'Resultado: e⁰ = 1' },
  // (sen x)^x: x ln(sen x) = x ln x + x ln(sen x/x) → 0 → 1
  { id: 'ind-0-0-potencia', tendencia: 'cualquier tendencia', condiciones: '', expresion: '0^(0)', valor: 'Depende', ejemplo: 'Resultado: L = e⁰ = 1' },
  // x^(1/x): (ln x)/x → 0 → 1
  { id: 'ind-inf-0', tendencia: 'x → ∞', condiciones: '', expresion: '∞^(0)', valor: 'Depende', ejemplo: 'Resultado: L = e⁰ = 1' },

  // ── Equivalencias infinitesimales (12) ───────────────────────────────────────────────────
  // (x − sen x)/x³ = 1/6, no 0
  { id: 'equiv-regla', tendencia: 'x → 0', condiciones: '', expresion: 'f ~ g', valor: 'Solo en · y ÷', ejemplo: 'Valor real (por Taylor): 1/6 ≈ 0,1667' },
  // sen 2x·arctg 3x/x² → 2·3 = 6
  { id: 'equiv-sen', tendencia: 'x → 0', condiciones: 'x en radianes', expresion: 'sen x', valor: '~ x', ejemplo: 'Resultado: 6' },
  // tg x²/(1 − cos x) → x²/(x²/2) = 2
  { id: 'equiv-tan', tendencia: 'x → 0', condiciones: 'x en radianes', expresion: 'tg x', valor: '~ x', ejemplo: 'Resultado: 2' },
  // arcsen 5x/sen 2x → 5/2
  { id: 'equiv-arcsen', tendencia: 'x → 0', condiciones: '', expresion: 'arcsen x', valor: '~ x', ejemplo: 'Resultado: 2,5' },
  // arctg 4x/(e^2x − 1) → 4/2
  { id: 'equiv-arctan', tendencia: 'x → 0', condiciones: '', expresion: 'arctg x', valor: '~ x', ejemplo: 'Resultado: 2' },
  // (1 − cos 3x)/(x sen x) → (9x²/2)/x² = 9/2
  { id: 'equiv-cos', tendencia: 'x → 0', condiciones: 'x en radianes', expresion: '1 − cos x', valor: '~ (x²)/(2)', ejemplo: 'Resultado: 4,5' },
  // (e^(x²) − 1)/(1 − cos x) → x²/(x²/2) = 2
  { id: 'equiv-exp', tendencia: 'x → 0', condiciones: '', expresion: 'e^(x) − 1', valor: '~ x', ejemplo: 'Resultado: 2' },
  // (3ˣ − 1)/(2ˣ − 1) → ln 3/ln 2 = 1,584963
  { id: 'equiv-ax', tendencia: 'x → 0', condiciones: 'a > 0', expresion: 'a^(x) − 1', valor: '~ x·ln a', ejemplo: 'Resultado: ln 3 / ln 2 ≈ 1,585' },
  // ln(1 + sen x)/x → sen x/x → 1
  { id: 'equiv-ln', tendencia: 'x → 0', condiciones: '', expresion: 'ln(1 + x)', valor: '~ x', ejemplo: 'Resultado: 1' },
  // ln x/(x² − 1) → 1/(x + 1) → 1/2
  { id: 'equiv-ln-x', tendencia: 'x → 1', condiciones: 'x → 1 (no x → 0)', expresion: 'ln x', valor: '~ x − 1', ejemplo: 'Resultado: 0,5' },
  // (∛(1 + 6x) − 1)/sen x → (1/3)(6x)/x = 2
  { id: 'equiv-binomio', tendencia: 'x → 0', condiciones: 'α real cualquiera', expresion: '(1 + x)^(α) − 1', valor: '~ αx', ejemplo: 'Resultado: 2' },
  // senh 3x/tg 2x → 3/2
  { id: 'equiv-senh', tendencia: 'x → 0', condiciones: '', expresion: 'senh x', valor: '~ x', ejemplo: 'Resultado: 1,5' },

  // ── Límites en el infinito (7) ───────────────────────────────────────────────────────────
  // (x¹⁰ + 2ˣ)/(3ˣ + ln x) ~ (2/3)ˣ → 0
  { id: 'jerarquia', tendencia: 'x → ∞', condiciones: 'a > 0, b > 1', expresion: 'ln x ≪ x^(a) ≪ b^(x) ≪ x! ≪ x^(x)', valor: 'Gana el de la derecha', ejemplo: 'Resultado: 0' },
  // x = eᵗ: tᵖ/e^(at) → 0
  { id: 'log-vs-potencia', tendencia: 'x → ∞', condiciones: 'a > 0, p cualquiera', expresion: '((ln x)^(p))/(x^(a))', valor: '0', ejemplo: 'Resultado: 0' },
  // x¹⁰⁰ = 2ˣ ⇔ x = 100·log₂ x: cruce en x ≈ 996 (< 1.000)
  { id: 'potencia-vs-exponencial', tendencia: 'x → ∞', condiciones: 'b > 1, a cualquiera', expresion: '(x^(a))/(b^(x))', valor: '0', ejemplo: 'el cruce llega antes de x ≈ 1.000' },
  // grados: menor → 0; iguales → 4/2 = 2; mayor → +∞
  { id: 'cociente-polinomios', tendencia: 'x → ∞', condiciones: '', expresion: '(P(x))/(Q(x))', valor: '0, a/b o ∞', ejemplo: '(4x² + x)/(2x² − 3) → 4/2 = 2 (grados iguales)' },
  // bx/(√(x² + bx) + x) → b/2 · b = 6 → 3
  { id: 'raiz-conjugado', tendencia: 'x → ∞', condiciones: '', expresion: '√(x² + bx) − x', valor: '(b)/(2)', ejemplo: 'Resultado: 3' },
  // a = 1/c, c > 1 → 1/cˣ → 0 · 0,8ˣ·x¹⁰ → 0
  { id: 'exponencial-base-menor-1', tendencia: 'x → ∞', condiciones: 'a > 0; el límite es ∞ si a > 1 y 1 si a = 1', expresion: 'a^(x)', valor: '0 si 0 < a < 1', ejemplo: 'Resultado: 0' },
  // asíntotas ±π/2 · x/(x + 1)·arctg x → π/2 = 1,570796
  { id: 'arctan-infinito', tendencia: 'x → ±∞', condiciones: '+π/2 por la derecha, −π/2 por la izquierda', expresion: 'arctg x', valor: '±(π)/(2)', ejemplo: 'Resultado: π/2 ≈ 1,5708' },

  // ── Sucesiones (7) ───────────────────────────────────────────────────────────────────────
  // (ln n)/n → 0 → 1 · ⁿ√(3n²) = ⁿ√3·(ⁿ√n)² → 1
  { id: 'raiz-n-de-n', tendencia: 'n → ∞', condiciones: '', expresion: '^(n)√n', valor: '1', ejemplo: 'Resultado: 1' },
  // e^((ln a)/n) → 1 · ⁿ√(2ⁿ + 3ⁿ) = 3·ⁿ√((2/3)ⁿ + 1) → 3
  { id: 'raiz-n-de-a', tendencia: 'n → ∞', condiciones: 'a > 0', expresion: '^(n)√a', valor: '1', ejemplo: 'Resultado: 3 (en general, el mayor de las bases)' },
  // aₙ₊₁/aₙ = nⁿ/(n + 1)ⁿ = 1/(1 + 1/n)ⁿ → 1/e = 0,367879
  { id: 'criterio-cociente', tendencia: 'n → ∞', condiciones: 'aₙ > 0 y el límite del cociente debe existir', expresion: '^(n)√a_(n)', valor: 'lím (a₍ₙ₊₁₎)/(aₙ)', ejemplo: 'Resultado: 1/e ≈ 0,3679' },
  // Stirling: ⁿ√(n!) ≈ (n/e)·(2πn)^(1/2n) → 1/e = 0,367879
  { id: 'raiz-factorial', tendencia: 'n → ∞', condiciones: '', expresion: '(^(n)√(n!))/(n)', valor: '(1)/(e)', ejemplo: 'Resultado: 1/e ≈ 0,36788' },
  // (aₙ₊₁ − aₙ)/(bₙ₊₁ − bₙ) = (n + 1)/(2n + 1) → 1/2
  { id: 'stolz', tendencia: 'n → ∞', condiciones: 'bₙ monótona y divergente a +∞ (o ambas tendiendo a 0)', expresion: '(aₙ)/(bₙ)', valor: 'lím (a₍ₙ₊₁₎ − aₙ)/(b₍ₙ₊₁₎ − bₙ)', ejemplo: '(n + 1)/(2n + 1) → 1/2' },
  // Stolz con bₙ = n · ⁿ√n → 1
  { id: 'media-aritmetica', tendencia: 'n → ∞', condiciones: 'si aₙ converge (o diverge a ±∞)', expresion: '(a₁ + a₂ + … + aₙ)/(n)', valor: 'lím aₙ', ejemplo: 'Resultado: 1' },
  // [(n + 3)/n]^(2n): 2n·(3/n) = 6 → e⁶ = 403,4288
  { id: 'e-sucesion', tendencia: 'n → ∞', condiciones: '', expresion: '(1 + (1)/(n))^(n)', valor: 'e', ejemplo: 'Resultado: e⁶ ≈ 403,4' },
];

test.describe('Los 59 límites, sus condiciones y sus ejemplos', () => {
  test('cada fila pinta el valor comprobado a mano, con su tendencia y su condición, y su ejemplo llega al resultado', async ({ page }) => {
    await cargar(page);
    await expect(contador(page)).toHaveText(`${TOTAL} de ${TOTAL} entradas`);
    await expect(filas(page)).toHaveCount(TABLA.length);
    for (const f of TABLA) {
      expect.soft(await fila(page, f.id), f.id).toEqual({
        tendencia: f.tendencia,
        condiciones: f.condiciones,
        expresion: f.expresion,
        valor: f.valor,
      });
      await filaDe(page, f.id).click();
      await expect(filaDe(page, f.id)).toHaveAttribute('aria-expanded', 'true');
      await expect.soft(page.locator(`#detalle-${f.id} ol`), f.id).toContainText(f.ejemplo);
    }
  });

  test('cada categoría tiene las filas contadas a mano: 11 + 9 + 6 + 7 + 12 + 7 + 7 = 59', async ({ page }) => {
    await cargar(page);
    const porCategoria: [string, number][] = [
      ['Trigonométricos', 11],
      ['Exponenciales y logarítmicos', 9],
      ['El número e', 6],
      ['Indeterminaciones', 7],
      ['Equivalencias infinitesimales', 12],
      ['Límites en el infinito', 7],
      ['Sucesiones', 7],
    ];
    for (const [nombre, n] of porCategoria) {
      await filtro(page, nombre).click();
      await expect(filtro(page, nombre)).toHaveAttribute('aria-pressed', 'true');
      await expect(filtro(page, 'Todas')).toHaveAttribute('aria-pressed', 'false');
      await expect(contador(page), nombre).toHaveText(`${n} de ${TOTAL} entradas`);
    }
    await filtro(page, 'Todas').click();
    await expect(contador(page)).toHaveText(`${TOTAL} de ${TOTAL} entradas`);
  });
});

test.describe('Buscador', () => {
  test('CASO 1 (normal) · «sen x / x» da el límite fundamental: vale 1 en radianes y sen(5x)/(3x) → 5/3', async ({ page }) => {
    await cargar(page);
    await buscar(page, 'sen x / x');
    expect((await nombresDeFilas(page))[0]).toBe('Seno partido por x');
    // A mano: cos x < sen x / x < 1 en (0, π/2) y el sándwich da 1; en grados sería π/180 = 0,017453.
    expect(await fila(page, 'sen-x-entre-x')).toEqual({
      tendencia: 'x → 0',
      condiciones: 'x en radianes',
      expresion: '(sen x)/(x)',
      valor: '1',
    });
    const boton = filaDe(page, 'sen-x-entre-x');
    await expect(boton).toHaveAttribute('aria-expanded', 'false');
    await boton.click();
    await expect(boton).toHaveAttribute('aria-expanded', 'true');
    const detalle = page.locator('#detalle-sen-x-entre-x');
    // sen(5x)/(3x) = (5/3)·sen(5x)/(5x), y con u = 5x → 0 el segundo factor tiende a 1: 5/3
    await expect(detalle).toContainText('sen(5x)/(3x) = (5/3) · sen(5x)/(5x)');
    await expect(detalle.locator('ol li').last()).toHaveText('Resultado: 5/3');
    await expect(detalle).toContainText('π/180 ≈ 0,01745');
    await boton.click();
    await expect(boton).toHaveAttribute('aria-expanded', 'false');
    await expect(detalle).toHaveCount(0);
  });

  test('CASO 2 (límite) · un filtro que deja una sola fila, el mismo término en otra categoría da cero, y tildes y mayúsculas dan lo mismo', async ({ page }) => {
    await cargar(page);
    // «stolz» solo está en el texto de búsqueda de una entrada, que es de Sucesiones
    await buscar(page, 'stolz');
    await filtro(page, 'Sucesiones').click();
    await expect(contador(page)).toHaveText(`1 de ${TOTAL} entradas`);
    expect(await nombresDeFilas(page)).toEqual(['Criterio de Stolz-Cesàro']);
    // Condición de validez: bₙ monótona y divergente; (1 + … + n)/n²: (n + 1)/(2n + 1) → 1/2
    expect((await fila(page, 'stolz')).condiciones).toBe('bₙ monótona y divergente a +∞ (o ambas tendiendo a 0)');
    await filaDe(page, 'stolz').click();
    await expect(page.locator('#detalle-stolz ol')).toContainText('aₙ₊₁ − aₙ = n + 1; bₙ₊₁ − bₙ = 2n + 1');
    await expect(page.locator('#detalle-stolz ol')).toContainText('(n + 1)/(2n + 1) → 1/2');

    // El mismo término con Trigonométricos: 0, y el aviso dice cómo salir
    await filtro(page, 'Trigonométricos').click();
    await expect(contador(page)).toHaveText(`0 de ${TOTAL} entradas`);
    await expect(sinResultados(page)).toContainText('quita el filtro de categoría');

    // Borde de la condición: x·ln x y xˣ solo existen por la derecha (ln x no está definido en x ≤ 0)
    await filtro(page, 'Todas').click();
    await buscar(page, 'x ln x');
    expect(await nombresDeFilas(page)).toContain('x por logaritmo de x');
    expect(await fila(page, 'x-ln-x')).toMatchObject({ tendencia: 'x → 0⁺', condiciones: 'solo por la derecha (x > 0)', valor: '0' });

    // «número e» está en el nombre de 4 entradas y en el texto de búsqueda de 2 (eˣ − 1 e 1^∞)
    const conE = [
      'Exponencial menos uno partido por x',
      'Definición del número e',
      'El número e con x tendiendo a cero',
      'El número e como suma de inversos de factoriales',
      'Indeterminación uno elevado a infinito',
      'El número e como sucesión',
    ];
    for (const termino of ['número e', 'NUMERO E', 'Numero e']) {
      await buscar(page, termino);
      expect(await nombresDeFilas(page), termino).toEqual(conE);
    }
  });

  test('CASO 3 (rechazo) · lo que no es un límite no casa con nada, dice «sin resultados» y Limpiar lo devuelve todo', async ({ page }) => {
    await cargar(page);
    for (const termino of ['zzz', 'integral']) {
      await buscar(page, termino);
      await expect(contador(page), termino).toHaveText(`0 de ${TOTAL} entradas`);
      await expect(filas(page)).toHaveCount(0);
      await expect(sinResultados(page)).toContainText(`No hay ninguna entrada que coincida con «${termino}»`);
    }
    await filtro(page, 'Sucesiones').click();
    await page.getByRole('button', { name: /Limpiar/ }).click();
    await expect(page.locator(BUSCADOR)).toHaveValue('');
    await expect(contador(page)).toHaveText(`${TOTAL} de ${TOTAL} entradas`);
    await expect(filtro(page, 'Todas')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator(BUSCADOR)).toBeFocused();
  });

  test('teclado · foco en el buscador al cargar, Tab a Limpiar y a los filtros, Enter y Espacio abren y cierran la fila', async ({ page }) => {
    await cargar(page);
    await expect(page.locator(BUSCADOR)).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: /Limpiar/ })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(filtro(page, 'Todas')).toBeFocused();
    for (let i = 0; i < 7; i++) await page.keyboard.press('Tab');
    await expect(filtro(page, 'Sucesiones')).toBeFocused();
    await page.keyboard.press('Tab');
    const primera = filaDe(page, 'sen-x-entre-x');
    await expect(primera).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(primera).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#detalle-sen-x-entre-x')).toBeVisible();
    await page.keyboard.press('Space');
    await expect(primera).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#detalle-sen-x-entre-x')).toHaveCount(0);
  });
});

for (const ancho of [390, 360]) {
  test.describe(`Móvil a ${ancho} px`, () => {
    test.use({
      viewport: { width: ancho, height: 800 },
      userAgent:
        'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      deviceScaleFactor: 2.625,
      isMobile: true,
      hasTouch: true,
    });

    test('con las 59 filas abiertas ninguna fórmula ni ejemplo desborda en horizontal', async ({ page }) => {
      await cargar(page);
      for (const f of TABLA) await filaDe(page, f.id).click();
      await expect(page.locator('ul li button[aria-expanded="true"]')).toHaveCount(TOTAL);
      const medida = await page.evaluate(() => {
        const ancho = document.documentElement.clientWidth;
        const fuera = [...document.querySelectorAll('ul li *')]
          .filter((e) => {
            const r = e.getBoundingClientRect();
            return r.width > 0 && (r.right > ancho + 0.5 || r.left < -0.5);
          })
          .map((e) => (e.textContent ?? '').trim().slice(0, 40));
        return { ancho, scroll: document.documentElement.scrollWidth, fuera };
      });
      expect(medida.fuera).toEqual([]);
      expect(medida.scroll).toBeLessThanOrEqual(medida.ancho);
    });
  });
}

test.describe('Contraste de la tabla en los dos temas', () => {
  for (const tema of ['claro', 'oscuro'] as const) {
    test(`fórmulas, etiquetas, badges y avisos de las filas llegan a 4,5:1 en ${tema}`, async ({ page }) => {
      await cargar(page);
      if (tema === 'oscuro') {
        await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      }
      // Dos filas con aviso naranja y una con caja de técnica. El ratón se aparta después: con él
      // encima, el tinte de :hover baja el contraste (HALLAZGO aparte, abajo).
      for (const id of ['x-menos-sen-entre-x3', 'equiv-regla']) await filaDe(page, id).click();
      await page.mouse.move(0, 0);
      await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
      // Medido el 03/11/2026: claro 5,15 · 4,95 · 4,74 · 5,10 · 4,89 · 4,85 · 4,52
      //                       oscuro 4,93 · 5,30 · 4,87 · 4,96 · 6,26 · 7,13 · 6,09
      for (const selector of [
        '[class*="expr"]',
        '[class*="condicionesBadge"]',
        '[class*="tendenciaBadge"]',
        '[class*="filaCategoria"]',
        '[class*="etq"]',
        '[class*="avisoBox"] strong',
        '[class*="tecnicaBox"] h3',
      ]) {
        const elementos = page.locator(selector);
        const n = await elementos.count();
        let peor = Infinity;
        for (let i = 0; i < n; i++) peor = Math.min(peor, await contrasteSobreFondoReal(elementos.nth(i)));
        expect.soft(peor, selector).toBeGreaterThanOrEqual(4.5);
      }
    });
  }
});

test.describe('Hallazgos de la inspección del 03/11/2026', () => {
  test('HALLAZGO (03/11/2026, ABIERTO) · el buscador no encuentra un límite escrito como fórmula, ni «L’Hôpital», ni dos palabras en otro orden, ni una categoría', async ({ page }) => {
    // La etiqueta dice «Busca un límite por nombre, fórmula o palabra suelta» y la feature del
    // JSON-LD «por nombre, expresión y sinónimos». Cada fila casa la consulta ENTERA como subcadena
    // de su nombre + texto de búsqueda, y ese texto no lleva la notación que pinta la tabla
    // («1^∞», «∞/∞», «1 − cos x» con el signo menos de la fila o con espacios), ni el nombre de su
    // categoría. «L’Hôpital», como lo escribe la página siete veces y la keyword de metadata, da
    // 0 de 59, y «lhopital» 6. Medido el 03/11/2026: los siete términos de abajo daban 0 filas.
    test.fail();
    await cargar(page);
    const casos: [string, string][] = [
      ['L’Hôpital', 'Indeterminación cero partido por cero'],
      ["L'Hôpital", 'Indeterminación infinito partido por infinito'],
      ['1^∞', 'Indeterminación uno elevado a infinito'],
      ['∞/∞', 'Indeterminación infinito partido por infinito'],
      ['1 − cos x', 'Uno menos coseno partido por x²'],
      ['1 - cos x', 'Uno menos coseno partido por x²'],
      ['limite fundamental seno', 'Seno partido por x'],
      ['trigonometricos', 'Tangente partida por x'],
      ['equivalencias infinitesimales', 'Seno equivalente a x'],
    ];
    for (const [termino, nombre] of casos) {
      await buscar(page, termino);
      expect.soft(await nombresDeFilas(page), termino).toContain(nombre);
    }
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · la búsqueda por subcadena casa dentro de otras palabras', async ({ page }) => {
    // «coseno» casa dentro de «arcoseno», «sin» (sinónimo declarado del seno) dentro de «asíntota»,
    // «tan» dentro de «constante» y «seno» dentro de «coseno». Medido el 03/11/2026:
    // coseno → 6 (con Arcoseno partido por x y Arcoseno equivalente a x) · sin → 6 (con Cociente de
    // polinomios en el infinito y Arcotangente en el infinito) · tan → 8 (con Raíz n-ésima de una
    // constante) · seno → 14 (con las tres filas de 1 − cos x).
    test.fail();
    await cargar(page);
    const ajenas: [string, string[]][] = [
      ['coseno', ['Arcoseno partido por x', 'Arcoseno equivalente a x']],
      ['sin', ['Cociente de polinomios en el infinito', 'Arcotangente en el infinito']],
      ['tan', ['Raíz n-ésima de una constante']],
      ['seno', ['Uno menos coseno partido por x²', 'Uno menos coseno partido por x']],
    ];
    for (const [termino, filasAjenas] of ajenas) {
      await buscar(page, termino);
      const nombres = await nombresDeFilas(page);
      for (const ajena of filasAjenas) expect.soft(nombres, termino).not.toContain(ajena);
    }
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · las fracciones y el «=» no se leen: «sen x / x = 1» se anuncia «lím sen x x 1»', async ({ page }) => {
    // Frac apila numerador y denominador en dos <span> sin nada que diga «entre», y el «=» de la
    // fila va con aria-hidden. Nombre accesible medido el 03/11/2026:
    // «Seno partido por x Trigonométricos x → 0 x en radianes lím sen x x 1».
    test.fail();
    await cargar(page);
    await expect.soft(filaDe(page, 'sen-x-entre-x')).toHaveAccessibleName(/sen x\s*(\/|entre|partido|sobre)\s*x/i);
    await expect.soft(filaDe(page, 'sen-x-entre-x')).toHaveAccessibleName(/(=|igual|vale)\s*1/i);
    await expect.soft(filaDe(page, 'log-a-1-mas-x')).toHaveAccessibleName(/1\s*(\/|entre|partido|sobre)\s*ln a/i);
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · ⁿ√(n!)/n con n = 1.000 vale 0,3695, no 0,3691', async ({ page }) => {
    // exp(ln(1000!)/1000)/1000 = 0,369492 (Stirling: (1/e)·(2π·1000)^(1/2000) = 0,367879 · 1,004382).
    // Las otras dos cifras están bien: n = 10 → 0,452873 y n = 100 → 0,379927.
    test.fail();
    await cargar(page);
    await filaDe(page, 'raiz-factorial').click();
    const pasos = page.locator('#detalle-raiz-factorial ol');
    await expect(pasos).toContainText('n = 10 → ¹⁰√(10!)/10 ≈ 0,4529');
    await expect(pasos).toContainText('n = 100 → ≈ 0,3799');
    await expect(pasos).toContainText('n = 1.000 → ≈ 0,3695');
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · diez sumandos de la serie de e dan 2,7182815 (seis decimales), no 2,7182818', async ({ page }) => {
    // 1 + 1/1! + … + 1/9! (diez sumandos) = 2,71828153; e = 2,71828183: coinciden seis decimales.
    // 2,7182818 y las siete cifras se alcanzan con ONCE sumandos (hasta 1/10!): 2,71828180.
    // La fila lo dice dos veces: «con solo diez sumandos ya se tienen siete cifras decimales
    // correctas» y «con 10 términos ya se llega a 2,7182818».
    test.fail();
    await cargar(page);
    await filaDe(page, 'e-serie').click();
    const detalle = page.locator('#detalle-e-serie');
    await expect.soft(detalle).not.toContainText('con 10 términos ya se llega a 2,7182818');
    await expect.soft(detalle).not.toContainText('diez sumandos ya se tienen siete cifras decimales');
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · el error de √1,02 ≈ 1,01 es de media diezmilésima, no de una', async ({ page }) => {
    // √1,02 = 1,0099505; 1,01 − 1,0099505 = 0,0000495 (≈ x²/8 = 0,00005). La justificación de
    // «Binomio (1 + x)^α − 1 equivalente a αx» dice «es de una diezmilésima»: el doble.
    test.fail();
    await cargar(page);
    await filaDe(page, 'equiv-binomio').click();
    await expect(page.locator('#detalle-equiv-binomio')).not.toContainText('es de una diezmilésima');
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · «Tres casos con el mismo denominador» no tienen el mismo denominador', async ({ page }) => {
    // Casos 1 y 3 van sobre x² − 3; el 2 sobre 2x² − 3. Los tres límites están bien (0, 2, +∞).
    test.fail();
    await cargar(page);
    await filaDe(page, 'cociente-polinomios').click();
    const detalle = page.locator('#detalle-cociente-polinomios');
    const titulo = (await detalle.locator('h3').last().textContent()) ?? '';
    if (/mismo denominador/.test(titulo)) {
      for (const paso of await detalle.locator('ol li').allTextContents()) expect.soft(paso).toContain('/(x² − 3)');
    }
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · dos etiquetas dicen otra cosa: «por la derecha» en x → ±∞ y ∞/∞ o ∞⁰ «solo» en x → ∞', async ({ page }) => {
    // «Por la derecha / por la izquierda» es el vocabulario de los límites laterales en un punto
    // (x → a⁺); para la arcotangente es «cuando x → +∞ / x → −∞». Y ∞/∞ y ∞⁰ no son exclusivas
    // de x → ∞: la propia tabla resuelve x·ln x en x → 0⁺ pasándola a ln x/(1/x), un ∞/∞; las
    // otras cinco formas dicen «cualquier tendencia».
    test.fail();
    await cargar(page);
    expect.soft((await fila(page, 'arctan-infinito')).condiciones).not.toMatch(/por la (derecha|izquierda)/);
    expect.soft((await fila(page, 'ind-inf-inf')).tendencia).not.toBe('x → ∞');
    expect.soft((await fila(page, 'ind-inf-0')).tendencia).not.toBe('x → ∞');
  });

  test('HALLAZGO 3992 (03/11/2026, REPARADO) · el naranja de «Errores comunes» se queda en 4,27:1 sobre su tinte en claro', async ({ page }) => {
    // .warningHeader (h3 de 17,6 px a 600) y .warningList li strong (16 px negrita) llevan #B45309
    // literal sobre rgba(224,122,31,.08): 4,27:1, y ninguno es texto grande. check:semanticos-claro
    // no lo veía: el tinte lo pone .warningBox, un antecesor que solo existe en el DOM.
    // REPARADO el 04/11/2026 (reparar, cabo C0608): el candado lee ahora el anidamiento del TSX, y
    // las dos reglas pasan a var(--naranja-texto, #b45309), con las mismas en otras nueve tablas.
    await cargar(page);
    await page.getByRole('button', { name: 'Ver guía educativa' }).click();
    for (const selector of ['[class*="warningHeader"] h3', '[class*="warningList"] li strong']) {
      const elementos = page.locator(selector);
      const n = await elementos.count();
      let peor = Infinity;
      for (let i = 0; i < n; i++) peor = Math.min(peor, await contrasteSobreFondoReal(elementos.nth(i)));
      expect.soft(peor, selector).toBeGreaterThanOrEqual(4.5);
    }
  });

  for (const tema of ['claro', 'oscuro'] as const) {
    test(`HALLAZGO (03/11/2026, ABIERTO) · con el ratón encima de una fila, su texto baja de 4,5:1 en ${tema}`, async ({ page }) => {
      // .filaBtn:hover pone rgba(46,134,171,.06) en claro y .14 en oscuro bajo un texto que ya iba
      // justo. Medido el 03/11/2026 en «Seno partido por x»:
      //   claro  · tendencia 4,74 → 4,44:1
      //   oscuro · fórmula 4,93 → 4,23:1 · tendencia 4,87 → 4,24:1 · categoría 4,96 → 4,25:1
      test.fail();
      await cargar(page);
      if (tema === 'oscuro') {
        await page.getByRole('button', { name: 'Cambiar a modo oscuro' }).click();
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      }
      const boton = filaDe(page, 'sen-x-entre-x');
      await boton.hover();
      await expect.poll(() => page.evaluate(() => document.getAnimations().length)).toBe(0);
      for (const selector of ['[class*="expr"]', '[class*="tendenciaBadge"]', '[class*="filaCategoria"]', '[class*="condicionesBadge"]']) {
        expect.soft(await contrasteSobreFondoReal(boton.locator(selector).first()), selector).toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  test('HALLAZGO (03/11/2026, ABIERTO) · la pregunta de las equivalencias está escrita dos veces, con redacciones distintas', async ({ page }) => {
    // FAQ visible «¿Cuándo puedo usar equivalencias infinitesimales?» y FAQPage «¿Cuándo se pueden
    // usar las equivalencias infinitesimales?»: la misma pregunta, con la respuesta redactada por
    // separado. check:faq-unica no la ve porque compara el texto literal de la pregunta.
    test.fail();
    await cargar(page);
    const jsonLd = await page.evaluate(() => {
      for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
        const datos = JSON.parse(s.textContent ?? '{}');
        if (datos['@type'] === 'FAQPage') {
          return (datos.mainEntity as { name: string; acceptedAnswer: { text: string } }[]).map((q) => ({
            pregunta: q.name,
            respuesta: q.acceptedAnswer.text,
          }));
        }
      }
      return [];
    });
    const visible = await page.locator('[class*="faqItem"]').evaluateAll((els) =>
      els.map((e) => ({
        pregunta: (e.querySelector('h4')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
        respuesta: (e.querySelector('p')?.textContent ?? '').replace(/\s+/g, ' ').trim(),
      })),
    );
    const enJson = jsonLd.find((q) => /equivalencias infinitesimales/.test(q.pregunta));
    const enPagina = visible.find((q) => /equivalencias infinitesimales/.test(q.pregunta));
    if (enJson && enPagina) expect(enPagina).toEqual(enJson);
  });

  test('HALLAZGO (03/11/2026, ABIERTO) · el porcentaje va pegado («100%») o con espacio normal en vez de duro', async ({ page }) => {
    // CLAUDE.md §2: «15 %» con U+00A0. features del JSON-LD: «Funciona 100% en el navegador»;
    // en pantalla «al 100 % anual» (e-infinito) y «del 0,17 %» (equiv-sen) llevan U+0020.
    test.fail();
    await cargar(page);
    const features = await page.evaluate(() => {
      for (const s of document.querySelectorAll('script[type="application/ld+json"]')) {
        const datos = JSON.parse(s.textContent ?? '{}');
        if (datos['@type'] === 'WebApplication') return JSON.stringify(datos);
      }
      return '';
    });
    expect.soft(features).not.toMatch(/\d%/);
    for (const id of ['e-infinito', 'equiv-sen']) {
      await filaDe(page, id).click();
      const texto = (await page.locator(`#detalle-${id}`).textContent()) ?? '';
      expect.soft(texto, id).not.toMatch(/\d %/);
      expect.soft(texto, id).toMatch(/\d %/);
    }
  });
});
