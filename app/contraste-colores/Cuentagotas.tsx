'use client';

import { useEffect, useState } from 'react';
import styles from './ContrasteColores.module.css';

/**
 * Cuentagotas de PANTALLA para contraste-colores (S0261, 08/11/2026).
 *
 * Con la EyeDropper API el puntero se convierte en una lupa que coge el color de cualquier
 * píxel de la pantalla, también de otra ventana: así se mide el contraste de una web que ya
 * existe sin buscar sus códigos de color. La página solo recibe el código del píxel elegido,
 * nunca una imagen.
 *
 * Por qué un botón propio si el `<input type="color">` de Chrome ya trae una pipeta: estaba
 * escondida dentro de la ventanita del selector, y ni el propio autor de la app la encontró
 * (08/11/2026). El botón la hace visible.
 *
 * Solo existe en navegadores Chromium de escritorio (Chrome, Edge, Vivaldi, Opera); en Firefox,
 * Safari y el móvil no hay API y el botón no se pinta. La comprobación va en un efecto: en el
 * servidor no hay `window`, y decidirlo en el render daría otro HTML al hidratar.
 */

interface ResultadoCuentagotas {
  sRGBHex: string;
}

interface Cuentagotas {
  open: () => Promise<ResultadoCuentagotas>;
}

type ConstructorCuentagotas = new () => Cuentagotas;

function constructorCuentagotas(): ConstructorCuentagotas | null {
  const w = window as unknown as { EyeDropper?: ConstructorCuentagotas };
  return typeof w.EyeDropper === 'function' ? w.EyeDropper : null;
}

/** Normaliza lo que devuelve el navegador a #RRGGBB (Chromium da «#rrggbb», pero la spec admite rgb()) */
export function aHexadecimal(valor: string): string | null {
  const limpio = valor.trim();
  const hex = limpio.match(/^#([0-9a-f]{6})$/i);
  if (hex) return `#${hex[1].toUpperCase()}`;
  const rgb = limpio.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/i);
  if (!rgb) return null;
  const canales = [rgb[1], rgb[2], rgb[3]].map((c) => Math.min(255, Number(c)));
  return `#${canales.map((c) => c.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

/** true cuando el navegador ofrece el cuentagotas de pantalla (se sabe al montar) */
export function useCuentagotasDisponible(): boolean {
  const [disponible, setDisponible] = useState(false);
  useEffect(() => {
    setDisponible(constructorCuentagotas() !== null);
  }, []);
  return disponible;
}

interface Props {
  /** «texto» o «fondo»: completa la etiqueta del botón y el aviso */
  destino: string;
  onColor: (hex: string) => void;
  onAviso: (texto: string) => void;
}

export default function BotonCuentagotas({ destino, onColor, onAviso }: Props) {
  const [abierto, setAbierto] = useState(false);

  const coger = async () => {
    const Constructor = constructorCuentagotas();
    if (!Constructor) return;
    setAbierto(true);
    try {
      const { sRGBHex } = await new Constructor().open();
      const hex = aHexadecimal(sRGBHex);
      if (hex) {
        onColor(hex);
        onAviso(`Color de ${destino} tomado de la pantalla: ${hex}`);
      } else {
        onAviso(`El navegador devolvió un color que no se pudo leer (${sRGBHex}).`);
      }
    } catch (error) {
      // Esc o clic fuera: el navegador lo da como AbortError y no es un error del usuario
      const nombre = error instanceof Error ? error.name : '';
      if (nombre !== 'AbortError') onAviso('No se pudo usar el cuentagotas. Prueba a pulsar el botón otra vez.');
    } finally {
      setAbierto(false);
    }
  };

  return (
    <button type="button" onClick={() => void coger()} disabled={abierto} className={styles.cuentagotasBtn}>
      <span aria-hidden="true">💧</span>{' '}
      <span>{abierto ? 'Haz clic en el color… (Esc cancela)' : `Coger el color de ${destino} de la pantalla`}</span>
    </button>
  );
}
