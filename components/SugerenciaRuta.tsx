'use client';

/**
 * La sugerencia de la página 404 (app/not-found.tsx): «¿Buscabas…?» con la app del catálogo cuyo
 * slug más se parece a la ruta pedida. Semilla S0278 (16/11/2026): 118 URLs con impresiones en
 * Google daban 404 y la mayoría eran erratas de una app que sí existe.
 *
 * La lista de slugs se carga con un import dinámico: solo la descarga quien cae en un 404. Por
 * eso NO se exporta desde el barrel de @/components, que descargan todas las apps.
 *
 * Registra la visita como `pag:404` (fuera del pulso, como todo `pag:`) con la ruta y lo que se
 * propuso, para poder ver qué erratas llegan y si la sugerencia acierta. El tracker se monta
 * cuando ya hay sugerencia: si se montara antes, el cambio de `extra` registraría dos visitas.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

import AnalyticsTracker from '@/components/AnalyticsTracker';
import { sugerirRuta } from '@/lib/sugerirRuta';

import styles from '@/app/not-found.module.css';

interface Resultado {
  ruta: string;
  sugerencia: string | null;
}

export default function SugerenciaRuta() {
  const [resultado, setResultado] = useState<Resultado | null>(null);

  useEffect(() => {
    let vigente = true;
    const ruta = window.location.pathname;
    import('@/data/implemented-apps')
      .then(({ implementedAppsUrls }) => {
        if (vigente) setResultado({ ruta, sugerencia: sugerirRuta(ruta, implementedAppsUrls) });
      })
      .catch(() => {
        if (vigente) setResultado({ ruta, sugerencia: null });
      });
    return () => {
      vigente = false;
    };
  }, []);

  return (
    <div className={styles.sugerencia} aria-live="polite">
      {resultado?.sugerencia ? (
        <p key="si">
          ¿Buscabas{' '}
          <Link href={resultado.sugerencia} className={styles.enlaceSugerido}>
            meskeia.com{resultado.sugerencia}
          </Link>
          ?
        </p>
      ) : (
        <p key="no" className={resultado ? undefined : styles.buscando}>
          {resultado
            ? 'No hemos encontrado ninguna aplicación con un nombre parecido.'
            : 'Buscando la aplicación con el nombre más parecido…'}
        </p>
      )}
      {resultado && (
        <AnalyticsTracker
          appName="pag:404"
          extra={{ ruta: resultado.ruta, sugerencia: resultado.sugerencia ?? 'ninguna' }}
        />
      )}
    </div>
  );
}
