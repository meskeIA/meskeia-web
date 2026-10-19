/**
 * CampoNumerico — meskeIA
 *
 * Un campo numérico que se puede TECLEAR: vaciarlo, escribir «-» o «14.» a medio camino,
 * pegar «1.500» o «2,5». Sustituye al `<input type="number">` con
 * `onChange={(e) => setX(Number(e.target.value) || respaldo)}`, que no deja hacer nada de eso.
 *
 * ── De dónde sale (cabos C0066, C0069 y C0081; Agenda `campo-numerico-compartido`) ──
 * Un `type="number"` entrega `value` VACÍO en cualquier estado intermedio («-», «14.», «1,»),
 * así que `Number('')` da 0 —o el respaldo del `||`— y React reescribe el campo bajo el cursor:
 *   · calculadora-potencia-ciclismo (hallazgo del 30/09/2026): no se podía teclear una
 *     pendiente negativa, y «14.5» quedaba en «05»;
 *   · simulador-planificador-procesos (hallazgos 2399 y 2400): vaciar la ráfaga con Retroceso
 *     la rellenaba con «1», y al teclear «3» entraba 13;
 *   · simulador-campo-electrico (28/09): con `parseSpanishNumber` sobre un `type="number"`,
 *     «1,234» llegaba como «1.234» y se leía mil doscientos treinta y cuatro.
 * La receta se reparó cuatro veces a mano (campo-electrico 33c10c79, planificador 24f3cc70,
 * potencia-ciclismo 18411e51, proyectiles 81efb858); este componente es la de
 * `CampoTiempo` de simulador-planificador-procesos, generalizada.
 *
 * ── Cómo se comporta ──
 *   · Con el foco enseña LO QUE SE TECLEA, tal cual. El valor solo se aplica cuando lo escrito
 *     ya es un número (`parseSpanishNumber`); vacío o a medio escribir, la app conserva el
 *     anterior y el campo no se reescribe.
 *   · Sin el foco enseña el valor aplicado en formato español, sin ceros de relleno.
 *   · Un número por ENCIMA de `max` se topa y el campo lo enseña en el acto (seguir tecleando
 *     solo lo haría mayor). Uno por DEBAJO de `min` se aplica acotado pero NO se reescribe bajo
 *     el cursor —«0» puede ser el principio de «0,4», «1» el de «12»—: se marca `aria-invalid`
 *     y al salir enseña el valor que se usa.
 *   · ↑/↓ suben y bajan `paso`, como el `type="number"`.
 *   · Rol `spinbutton`, el mismo que tenía el `type="number"`: lo que lo localizaba por rol lo
 *     sigue encontrando. `inputMode="decimal"` si no admite negativos, y `"text"` si los
 *     admite, porque el teclado decimal de iOS no trae el signo menos.
 *
 * Sin estilos propios: el marcado de la app entra por `className`.
 */

'use client';

import { useState, type KeyboardEvent } from 'react';
import { parseSpanishNumber } from '@/lib';

interface CampoNumericoProps {
  /** El valor aplicado. */
  valor: number;
  /** Recibe el valor ya leído, redondeado a `decimales` y acotado a [min, max]. */
  onCambio: (valor: number) => void;
  min?: number;
  max?: number;
  /** Decimales a los que se redondea lo tecleado; 0 = entero. Sin él, se aplica tal cual. */
  decimales?: number;
  /** Lo que suben y bajan ↑/↓. Por defecto, 1. */
  paso?: number;
  /** Cómo se enseña el valor sin foco. Por defecto, formato español sin ceros de relleno. */
  formatear?: (valor: number) => string;
  id?: string;
  name?: string;
  className?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  title?: string;
  placeholder?: string;
  disabled?: boolean;
}

/** Caracteres que puede llevar el campo mientras se teclea: ni letras ni exponentes. */
const CARACTERES_CIFRA = /^[\s0-9.,+\-−]*$/;

function acotar(v: number, min: number | undefined, max: number | undefined): number {
  if (min !== undefined && v < min) return min;
  if (max !== undefined && v > max) return max;
  return v;
}

/** Redondeo a `decimales`, sin que el ruido binario decida un empate (2,675 → 2,68). */
function redondearCampo(v: number, decimales: number | undefined): number {
  if (decimales === undefined || !Number.isFinite(v)) return v;
  const escala = 10 ** decimales;
  const escalado = Number((Math.abs(v) * escala).toPrecision(15));
  return (Math.sign(v) * Math.round(escalado)) / escala + 0;
}

function formatoPorDefecto(decimales: number | undefined) {
  return (v: number) =>
    Number.isFinite(v) ? (v + 0).toLocaleString('es-ES', { maximumFractionDigits: decimales ?? 10 }) : '';
}

export default function CampoNumerico({
  valor,
  onCambio,
  min,
  max,
  decimales,
  paso = 1,
  formatear,
  id,
  name,
  className,
  ariaLabel,
  ariaDescribedBy,
  title,
  placeholder,
  disabled,
}: CampoNumericoProps) {
  /** null = sin foco: el campo enseña el valor aplicado. */
  const [borrador, setBorrador] = useState<string | null>(null);
  const formato = formatear ?? formatoPorDefecto(decimales);
  const texto = borrador ?? formato(valor);
  const leido = borrador === null ? valor : parseSpanishNumber(borrador.replace(/−/g, '-'));
  const invalido =
    borrador !== null &&
    borrador.trim() !== '' &&
    (!Number.isFinite(leido) || (min !== undefined && leido < min) || (max !== undefined && leido > max));
  const admiteNegativos = min === undefined || min < 0;

  const escalonar = (sentido: 1 | -1) => {
    const base = Number.isFinite(valor) ? valor : (min ?? 0);
    const nuevo = acotar(redondearCampo(base + sentido * paso, decimales), min, max);
    onCambio(nuevo);
    setBorrador(formato(nuevo));
  };

  const alPulsar = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      escalonar(e.key === 'ArrowUp' ? 1 : -1);
    } else if (e.key === 'Enter') {
      setBorrador(formato(valor));
    }
  };

  return (
    <input
      id={id}
      name={name}
      type="text"
      inputMode={admiteNegativos ? 'text' : 'decimal'}
      autoComplete="off"
      spellCheck={false}
      role="spinbutton"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={Number.isFinite(valor) ? valor : undefined}
      aria-invalid={invalido || undefined}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      title={title}
      placeholder={placeholder}
      disabled={disabled}
      value={texto}
      className={className}
      onFocus={() => setBorrador(formato(valor))}
      onBlur={() => setBorrador(null)}
      onChange={(e) => {
        const escrito = e.target.value;
        if (!CARACTERES_CIFRA.test(escrito)) return;
        const n = parseSpanishNumber(escrito.replace(/−/g, '-'));
        if (!Number.isFinite(n)) {
          setBorrador(escrito);
          return;
        }
        const aplicado = acotar(redondearCampo(n, decimales), min, max);
        onCambio(aplicado);
        setBorrador(max !== undefined && n > max ? formato(aplicado) : escrito);
      }}
      onKeyDown={alPulsar}
    />
  );
}
