'use client'

import MeskeiaLogo from './MeskeiaLogo'
import styles from './FixedHeader.module.css'

/**
 * Cabecera fija de las páginas estáticas de meskeIA (/apps/, /acerca/, /contacto/,
 * /privacidad/, /terminos/, /developers/terminos/, /mcp/).
 *
 * Llevó hasta el 19/09/2026 un buscador modal con atajo Ctrl+K (`HeaderActions` →
 * `SearchBar`) que se retiró entero: en /apps/ duplicaba el buscador propio del
 * catálogo y en las otras seis —legales, contacto y MCP— nadie entra a buscar apps.
 * Además llevaba roto desde abril (ver `AsistenteChat`).
 */
export default function FixedHeader() {
  return (
    <header className={styles.fixedHeader}>
      <div className={styles.headerContainer}>
        <MeskeiaLogo />
      </div>
    </header>
  )
}
