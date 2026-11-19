/**
 * Iconos de línea de informacion-tiempo, en SVG propio (19/11/2026): sustituyen a los emojis, que
 * cada sistema pinta distinto y daban a la app un aspecto anticuado. Sin librerías.
 *
 * Todos son decorativos (aria-hidden): el texto que acompaña dice lo mismo. El trazo es
 * `currentColor`; el sol, la luna y la precipitación toman además `--icono-sol` y
 * `--icono-agua` si el contenedor los define (en la tarjeta del tiempo actual no los define y
 * todo sale en blanco).
 */

import { useId } from 'react';

interface PropsIcono {
  className?: string;
}

const SOL = 'var(--icono-sol, currentColor)';
const AGUA = 'var(--icono-agua, currentColor)';

// Nube centrada y nube «alta», que deja sitio debajo para la lluvia, la nieve o el rayo
const NUBE = 'M9 25h14.5a5.5 5.5 0 0 0 .3-11A7.5 7.5 0 0 0 9.6 16 4.5 4.5 0 0 0 9 25z';
const NUBE_ALTA = 'M9 20h14.5a5.5 5.5 0 0 0 .3-11A7.5 7.5 0 0 0 9.6 11 4.5 4.5 0 0 0 9 20z';

function Svg({ className, children }: PropsIcono & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

function Rayos({ cx, cy, r, largo }: { cx: number; cy: number; r: number; largo: number }) {
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * Math.PI) / 4;
        return (
          <line
            key={i}
            x1={cx + Math.cos(a) * r}
            y1={cy + Math.sin(a) * r}
            x2={cx + Math.cos(a) * (r + largo)}
            y2={cy + Math.sin(a) * (r + largo)}
          />
        );
      })}
    </>
  );
}

function Sol() {
  return (
    <g stroke={SOL}>
      <circle cx={16} cy={16} r={5.5} />
      <Rayos cx={16} cy={16} r={8.5} largo={3} />
    </g>
  );
}

function Luna({ escala = 1, dx = 0, dy = 0 }: { escala?: number; dx?: number; dy?: number }) {
  return (
    <path
      stroke={SOL}
      transform={`translate(${dx} ${dy}) scale(${escala})`}
      d="M21 6.5a10 10 0 1 0 5.5 15A8 8 0 0 1 21 6.5z"
    />
  );
}

/** Sol o luna pequeños detrás de una nube: el astro se recorta con una máscara para no cruzarla. */
function AstroTrasNube({ noche, nube }: { noche: boolean; nube: string }) {
  const id = useId();
  return (
    <>
      <mask id={id}>
        <rect width={32} height={32} fill="white" />
        <path d={nube} fill="black" stroke="black" strokeWidth={4} />
      </mask>
      <g mask={`url(#${id})`}>
        {noche ? (
          <Luna escala={0.62} dx={10} dy={0} />
        ) : (
          <g stroke={SOL}>
            <circle cx={21} cy={10} r={4} />
            <Rayos cx={21} cy={10} r={6.2} largo={2.2} />
          </g>
        )}
      </g>
      <path d={nube} />
    </>
  );
}

function Lluvia() {
  return (
    <g stroke={AGUA}>
      <line x1={12} y1={23} x2={10.5} y2={27} />
      <line x1={16.5} y1={23} x2={15} y2={27} />
      <line x1={21} y1={23} x2={19.5} y2={27} />
    </g>
  );
}

/** Icono del estado del cielo a partir del código de OpenWeatherMap (01d, 10n…). */
export function IconoTiempo({ codigo, className }: PropsIcono & { codigo: string }) {
  const grupo = codigo.slice(0, 2);
  const noche = codigo.endsWith('n');

  switch (grupo) {
    case '01':
      return <Svg className={className}>{noche ? <Luna /> : <Sol />}</Svg>;
    case '02':
      return (
        <Svg className={className}>
          <AstroTrasNube noche={noche} nube={NUBE} />
        </Svg>
      );
    case '03':
    case '04':
      return (
        <Svg className={className}>
          <path d={NUBE} />
        </Svg>
      );
    case '09':
      return (
        <Svg className={className}>
          <path d={NUBE_ALTA} />
          <Lluvia />
        </Svg>
      );
    case '10':
      return (
        <Svg className={className}>
          <AstroTrasNube noche={noche} nube={NUBE_ALTA} />
          <Lluvia />
        </Svg>
      );
    case '11':
      return (
        <Svg className={className}>
          <path d={NUBE_ALTA} />
          <polyline stroke={SOL} points="17,21 14,25.5 17.5,25.5 15,29.5" />
        </Svg>
      );
    case '13':
      return (
        <Svg className={className}>
          <path d={NUBE_ALTA} />
          <g stroke={AGUA} strokeWidth={2.2}>
            <line x1={11} y1={24} x2={11} y2={24} />
            <line x1={16} y1={26} x2={16} y2={26} />
            <line x1={21} y1={24} x2={21} y2={24} />
            <line x1={13.5} y1={28.5} x2={13.5} y2={28.5} />
            <line x1={18.5} y1={28.5} x2={18.5} y2={28.5} />
          </g>
        </Svg>
      );
    case '50':
      return (
        <Svg className={className}>
          <line x1={6} y1={11} x2={26} y2={11} />
          <line x1={4} y1={16} x2={24} y2={16} />
          <line x1={8} y1={21} x2={28} y2={21} />
          <line x1={6} y1={26} x2={22} y2={26} />
        </Svg>
      );
    default:
      return (
        <Svg className={className}>
          <path d={NUBE} />
        </Svg>
      );
  }
}

export type TipoDato = 'sensacion' | 'humedad' | 'viento' | 'presion' | 'visibilidad' | 'nubes' | 'gota';

/** Iconos de los datos del tiempo actual y de las franjas. */
export function IconoDato({ tipo, className }: PropsIcono & { tipo: TipoDato }) {
  switch (tipo) {
    case 'sensacion':
      return (
        <Svg className={className}>
          <path d="M13 19V7a3 3 0 0 1 6 0v12a5 5 0 1 1-6 0z" />
          <line x1={16} y1={13} x2={16} y2={22} />
        </Svg>
      );
    case 'humedad':
    case 'gota':
      return (
        <Svg className={className}>
          <path stroke={AGUA} d="M16 5c4.5 6 7.5 10 7.5 14a7.5 7.5 0 0 1-15 0C8.5 15 11.5 11 16 5z" />
        </Svg>
      );
    case 'viento':
      return (
        <Svg className={className}>
          <path d="M4 12h15a3.5 3.5 0 1 0-3.5-3.5" />
          <path d="M4 17h21a3.5 3.5 0 1 1-3.5 3.5" />
          <path d="M4 22h10" />
        </Svg>
      );
    case 'presion':
      return (
        <Svg className={className}>
          <path d="M6 22a10 10 0 1 1 20 0" />
          <line x1={16} y1={22} x2={21} y2={15} />
          <circle cx={16} cy={22} r={1.3} />
        </Svg>
      );
    case 'visibilidad':
      return (
        <Svg className={className}>
          <path d="M3 16s5-8 13-8 13 8 13 8-5 8-13 8S3 16 3 16z" />
          <circle cx={16} cy={16} r={3.5} />
        </Svg>
      );
    case 'nubes':
      return (
        <Svg className={className}>
          <path d={NUBE} />
        </Svg>
      );
  }
}

/** Lupa y diana para los botones del buscador. */
export function IconoBuscar({ className }: PropsIcono) {
  return (
    <Svg className={className}>
      <circle cx={14} cy={14} r={8} />
      <line x1={20} y1={20} x2={27} y2={27} />
    </Svg>
  );
}

export function IconoUbicacion({ className }: PropsIcono) {
  return (
    <Svg className={className}>
      <path d="M16 28s-8-7.5-8-14a8 8 0 0 1 16 0c0 6.5-8 14-8 14z" />
      <circle cx={16} cy={14} r={3} />
    </Svg>
  );
}
